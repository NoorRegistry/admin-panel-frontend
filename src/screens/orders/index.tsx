"use client";
import { IApiError } from "@/api/http";
import {
  fetchOrder,
  fetchOrders,
  Order,
  OrderAction,
  OrderStatus,
  updateOrder,
  updateOrders,
  addOrderNote,
  BulkOrderResult,
} from "@/services/orders.service";
import { EAdminRole } from "@/types";
import { getAdminRole } from "@/utils/helper";
import {
  ReloadOutlined,
  SearchOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Alert,
  Button,
  Drawer,
  Dropdown,
  Empty,
  Input,
  Image,
  message,
  Modal,
  Result,
  Select,
  Space,
  Spin,
  Table,
  Tabs,
  Tag,
  Timeline,
  Typography,
} from "antd";
import type { TableColumnsType } from "antd";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDebouncedCallback } from "use-debounce";
import styles from "./orders.module.css";
import StoreOrdersScreen from "./store-orders";

export default function OrdersScreen() {
  return getAdminRole() === EAdminRole.STORE_ADMIN ? (
    <StoreOrdersScreen />
  ) : (
    <InternalOrdersScreen />
  );
}

const statuses: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "DISPATCHED",
  "DELIVERED",
  "CANCELLED",
];
const statusColors = {
  PENDING: "gold",
  CONFIRMED: "blue",
  DISPATCHED: "cyan",
  DELIVERED: "green",
  CANCELLED: "default",
};
const bulkActions: OrderAction[] = [
  "confirm",
  "dispatch",
  "deliver",
  "collect_cash",
  "cancel",
];

function OrderNotes({ id }: { id: string }) {
  const { t } = useTranslation();
  const client = useQueryClient();
  const [note, setNote] = useState("");
  const [api, context] = message.useMessage();
  const mutation = useMutation({
    mutationFn: () => addOrderNote(id, note.trim()),
    onSuccess: (order) => {
      client.setQueryData(["order", id], order);
      setNote("");
      api.success(t("orders.noteSaved"));
    },
    onError: (error: IApiError) =>
      api.error(error.detail || t("orders.actionError")),
  });
  return (
    <div className={styles.notes}>
      <Input.TextArea
        aria-label={t("orders.internalNote")}
        placeholder={t("orders.internalNote")}
        value={note}
        onChange={(event) => setNote(event.target.value)}
        disabled={mutation.isPending}
        maxLength={250}
        autoSize={{ minRows: 2, maxRows: 5 }}
      />
      <Button
        type="primary"
        disabled={!note.trim()}
        loading={mutation.isPending}
        onClick={() => mutation.mutate()}
      >
        {t("orders.postNote")}
      </Button>
      {context}
    </div>
  );
}
function InternalOrdersScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const client = useQueryClient();
  const [messageApi, messageContext] = message.useMessage();
  const [modal, modalContext] = Modal.useModal();
  const allowed = getAdminRole() === EAdminRole.INTERNAL_ADMIN;
  const text = (key: string) => t(`orders.${key}`, { defaultValue: key });
  const money = (value: number) =>
    new Intl.NumberFormat(i18n.language, {
      style: "currency",
      currency: "KWD",
    }).format(value);
  const date = (value: string) =>
    new Intl.DateTimeFormat(i18n.language, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone: "Asia/Kuwait",
    }).format(new Date(value));
  const patch = (
    values: Record<string, string | undefined>,
    resetPage = true,
  ) => {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(values)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    if (resetPage) next.delete("page");
    router.replace(`${pathname}${next.size ? `?${next}` : ""}`, {
      scroll: false,
    });
  };
  const search = useDebouncedCallback(
    (value: string) => patch({ search: value.trim() }),
    350,
  );
  const filters = {
    page: Math.max(1, Number(params.get("page")) || 1),
    limit: [10, 20, 50, 100].includes(Number(params.get("limit")))
      ? Number(params.get("limit"))
      : 20,
    search: params.get("search") || undefined,
    status: statuses.includes(params.get("status") as OrderStatus)
      ? params.get("status")!
      : undefined,
    paymentStatus: ["PAID", "UNPAID"].includes(
      params.get("paymentStatus") || "",
    )
      ? params.get("paymentStatus")!
      : undefined,
    sort: params.get("sort") || "newest",
    from: params.get("from") || undefined,
    to: params.get("to") || undefined,
  };
  const [searchBox, setSearchBox] = useState({
    url: filters.search,
    value: filters.search || "",
  });
  if (searchBox.url !== filters.search)
    setSearchBox({
      url: filters.search,
      value: search.isPending() ? searchBox.value : filters.search || "",
    });
  const orders = useQuery({
    queryKey: ["orders", filters],
    queryFn: () => fetchOrders(filters),
    placeholderData: keepPreviousData,
    enabled: allowed,
    refetchInterval: 30000,
  });
  const scope = JSON.stringify(filters);
  const [selection, setSelection] = useState<{ scope: string; ids: string[] }>({
    scope: "",
    ids: [],
  });
  if (selection.scope !== scope) setSelection({ scope, ids: [] });
  const selectedIds =
    selection.scope === scope
      ? selection.ids.filter((id) =>
          orders.data?.data.some((row) => row.id === id),
        )
      : [];
  const [batchResult, setBatchResult] = useState<
    (BulkOrderResult & { references: Record<string, string> }) | null
  >(null);
  const bulk = useMutation({
    mutationFn: ({
      ids,
      type,
      note,
    }: {
      ids: string[];
      type: OrderAction;
      note?: string;
      scope: string;
      references: Record<string, string>;
    }) => updateOrders(ids, type, note),
    onSuccess: async (result, variables) => {
      setBatchResult({ ...result, references: variables.references });
      setSelection((current) =>
        current.scope === variables.scope
          ? {
              scope: current.scope,
              ids: result.results.filter((row) => !row.ok).map((row) => row.id),
            }
          : current,
      );
      await Promise.all([
        client.invalidateQueries({ queryKey: ["orders"] }),
        client.invalidateQueries({ queryKey: ["order"] }),
        client.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);
    },
    onError: async (error: IApiError) => {
      messageApi.error(error.detail || text("actionError"));
      await Promise.all([
        client.invalidateQueries({ queryKey: ["orders"] }),
        client.invalidateQueries({ queryKey: ["order"] }),
        client.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);
    },
  });
  const runBulk = (type: OrderAction) => {
    if (!selectedIds.length || bulk.isPending) return;
    const ids = [...selectedIds];
    const references = Object.fromEntries(
      (orders.data?.data || []).map((order) => [order.id, order.reference]),
    );
    let note = "";
    modal.confirm({
      title: `${text(type)} · ${text("selectedCount").replace("{{count}}", String(ids.length))}`,
      content:
        type === "cancel" ? (
          <Input.TextArea
            maxLength={250}
            placeholder={text("reason")}
            onChange={(event) => {
              note = event.target.value;
            }}
          />
        ) : undefined,
      okText: text(type),
      cancelText: text("back"),
      okButtonProps: { danger: type === "cancel" },
      onOk: () =>
        bulk.mutateAsync({
          ids,
          type,
          note: note.trim() || undefined,
          scope,
          references,
        }),
    });
  };
  const selectedId = params.get("order") || "";
  const detail = useQuery({
    queryKey: ["order", selectedId],
    queryFn: () => fetchOrder(selectedId),
    enabled: allowed && !!selectedId,
    refetchInterval: selectedId ? 15000 : false,
  });
  const action = useMutation({
    mutationFn: ({
      id,
      type,
      note,
    }: {
      id: string;
      type: OrderAction;
      note?: string;
    }) => updateOrder(id, type, note),
    onSuccess: async (data) => {
      client.setQueryData(["order", data.id], data);
      await Promise.all([
        client.invalidateQueries({ queryKey: ["orders"] }),
        client.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);
      messageApi.success(text("updated"));
    },
    onError: (error: IApiError) => {
      messageApi.error(error.detail || text("error"));
      void client.invalidateQueries({ queryKey: ["order", selectedId] });
    },
  });
  const run = (type: OrderAction) => {
    if (!detail.data) return;
    const id = detail.data.id;
    if (type === "cancel" || type === "collect_cash") {
      let note = "";
      modal.confirm({
        title: text(type === "cancel" ? "cancelConfirm" : "cashConfirm"),
        content:
          type === "cancel" ? (
            <Input.TextArea
              maxLength={250}
              placeholder={text("reason")}
              onChange={(event) => {
                note = event.target.value;
              }}
            />
          ) : (
            money(detail.data.total)
          ),
        okText: text(type),
        cancelText: text("back"),
        okButtonProps: { danger: type === "cancel" },
        onOk: () =>
          action.mutateAsync({ id, type, note: note.trim() || undefined }),
      });
    } else action.mutate({ id, type });
  };
  const statusTag = (value: OrderStatus) => (
    <Tag color={statusColors[value]} variant="filled">
      {text(`status.${value}`)}
    </Tag>
  );
  const paymentTag = (order: Order) => (
    <Tag
      color={
        order.paymentStatus === "PAID"
          ? "green"
          : order.status === "CANCELLED"
            ? "default"
            : "orange"
      }
      variant="filled"
    >
      {text(
        order.paymentStatus === "PAID"
          ? "paid"
          : order.status === "CANCELLED"
            ? "void"
            : "codDue",
      )}
    </Tag>
  );
  const columns: TableColumnsType<Order> = [
    {
      title: text("order"),
      width: 130,
      render: (_, order) => (
        <Button
          type="link"
          style={{ padding: 0, fontWeight: 600 }}
          onClick={() => patch({ order: order.id }, false)}
        >
          {order.reference}
        </Button>
      ),
    },
    { title: text("date"), dataIndex: "createdAt", width: 180, render: date },
    {
      title: text("customer"),
      width: 230,
      render: (_, order) => (
        <div>
          <div>{order.customerName}</div>
          <div className={styles.muted}>{order.customerEmail}</div>
        </div>
      ),
    },
    {
      title: text("total"),
      dataIndex: "total",
      width: 140,
      align: "right",
      render: money,
    },
    {
      title: text("payment"),
      width: 160,
      render: (_, order) => paymentTag(order),
    },
    {
      title: text("fulfillment"),
      dataIndex: "status",
      width: 150,
      render: statusTag,
    },
    {
      title: text("items"),
      width: 75,
      align: "right",
      render: (_, order) =>
        order.items.reduce((sum, item) => sum + item.quantity, 0),
    },
    {
      title: text("delivery"),
      width: 170,
      render: (_, order) => order.shippingAddress.area,
    },
  ];
  const currentView =
    filters.paymentStatus === "UNPAID" && !filters.status
      ? "unpaid"
      : filters.status || "all";
  const data = detail.data;
  const address = data?.shippingAddress;
  if (!allowed) return <Result status="403" title={text("restricted")} />;
  return (
    <div className={styles.screen}>
      <div className={styles.heading}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          {text("title")}
        </Typography.Title>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => void orders.refetch()}
          loading={orders.isFetching}
        >
          {text("refresh")}
        </Button>
      </div>
      <Tabs
        activeKey={currentView}
        onChange={(key) =>
          patch({
            status: statuses.includes(key as OrderStatus) ? key : undefined,
            paymentStatus: key === "unpaid" ? "UNPAID" : undefined,
          })
        }
        items={[
          { key: "all", label: text("all") },
          { key: "PENDING", label: text("new") },
          { key: "CONFIRMED", label: text("confirmed") },
          { key: "DISPATCHED", label: text("dispatched") },
          { key: "DELIVERED", label: text("delivered") },
          { key: "unpaid", label: text("unpaid") },
          { key: "CANCELLED", label: text("cancelled") },
        ]}
      />
      <div className={styles.toolbar}>
        <Input
          value={searchBox.value}
          allowClear
          prefix={<SearchOutlined />}
          placeholder={text("search")}
          aria-label={text("search")}
          onChange={(event) => {
            setSearchBox({ ...searchBox, value: event.target.value });
            search(event.target.value);
          }}
          style={{ flex: "1 1 260px", maxWidth: 420 }}
        />
        <Select
          aria-label={text("fulfillment")}
          placeholder={text("fulfillment")}
          allowClear
          value={filters.status}
          options={statuses.map((value) => ({
            value,
            label: text(`status.${value}`),
          }))}
          onChange={(value) => patch({ status: value })}
          style={{ width: 155 }}
        />
        <Select
          aria-label={text("payment")}
          placeholder={text("payment")}
          allowClear
          value={filters.paymentStatus}
          options={[
            { value: "UNPAID", label: text("unpaid") },
            { value: "PAID", label: text("paid") },
          ]}
          onChange={(value) => patch({ paymentStatus: value })}
          style={{ width: 140 }}
        />
        <label className={styles.date}>
          {text("from")}
          <input
            type="date"
            aria-label={text("from")}
            value={filters.from || ""}
            onChange={(event) => patch({ from: event.target.value })}
          />
        </label>
        <label className={styles.date}>
          {text("to")}
          <input
            type="date"
            aria-label={text("to")}
            value={filters.to || ""}
            onChange={(event) => patch({ to: event.target.value })}
          />
        </label>
        <Select
          aria-label={text("sort")}
          value={filters.sort}
          options={["newest", "oldest", "total_desc", "total_asc"].map(
            (value) => ({ value, label: text(value) }),
          )}
          onChange={(value) => patch({ sort: value })}
          style={{ width: 155 }}
        />
      </div>
      {(filters.search ||
        filters.status ||
        filters.paymentStatus ||
        filters.from ||
        filters.to) && (
        <div className={styles.filters}>
          {(["search", "status", "paymentStatus", "from", "to"] as const).map(
            (key) =>
              filters[key] && (
                <Tag
                  key={key}
                  closable
                  onClose={() => patch({ [key]: undefined })}
                >
                  {key === "search"
                    ? filters[key]
                    : key === "status"
                      ? text(`status.${filters[key]}`)
                      : key === "paymentStatus"
                        ? text(filters[key] === "PAID" ? "paid" : "unpaid")
                        : `${text(key)}: ${filters[key]}`}
                </Tag>
              ),
          )}
          <Button
            size="small"
            type="text"
            onClick={() => {
              search.cancel();
              setSearchBox({ url: undefined, value: "" });
              router.replace(pathname);
            }}
          >
            {text("clear")}
          </Button>
        </div>
      )}
      {orders.isError && (
        <Alert
          type="error"
          showIcon
          title={(orders.error as unknown as IApiError).detail || text("error")}
          action={
            <Button size="small" onClick={() => void orders.refetch()}>
              {text("retry")}
            </Button>
          }
        />
      )}
      {!!selectedIds.length && (
        <div className={styles.bulkBar}>
          <strong>
            {text("selectedCount").replace(
              "{{count}}",
              String(selectedIds.length),
            )}
          </strong>
          <Dropdown
            menu={{
              items: bulkActions.map((type) => ({
                key: type,
                label: text(type),
                danger: type === "cancel",
              })),
              onClick: ({ key }) => runBulk(key as OrderAction),
            }}
            disabled={bulk.isPending || action.isPending}
          >
            <Button loading={bulk.isPending}>{text("bulkActions")} ▾</Button>
          </Dropdown>
          <Button
            type="text"
            disabled={bulk.isPending}
            onClick={() => setSelection({ scope, ids: [] })}
          >
            {text("clearSelection")}
          </Button>
        </div>
      )}
      {batchResult && (
        <Alert
          className={styles.batchResult}
          type={batchResult.failed ? "warning" : "success"}
          showIcon
          closable
          onClose={() => setBatchResult(null)}
          title={text("batchResult")
            .replace("{{updated}}", String(batchResult.updated))
            .replace("{{failed}}", String(batchResult.failed))}
          action={
            batchResult.failed ? (
              <Button
                size="small"
                onClick={() =>
                  modal.info({
                    title: text("failedOrders"),
                    content: (
                      <div>
                        {batchResult.results
                          .filter((row) => !row.ok)
                          .map((row) => (
                            <div key={row.id} className={styles.failureRow}>
                              <strong>
                                {batchResult.references[row.id] || row.id}
                              </strong>
                              <span>{row.error}</span>
                            </div>
                          ))}
                      </div>
                    ),
                    okText: text("close"),
                  })
                }
              >
                {text("reviewFailures")}
              </Button>
            ) : undefined
          }
        />
      )}
      <Table<Order>
        className={styles.table}
        rowKey="id"
        size="small"
        columns={columns}
        dataSource={orders.data?.data}
        loading={orders.isFetching}
        rowSelection={{
          selectedRowKeys: selectedIds,
          onChange: (keys) =>
            setSelection({ scope, ids: keys.map(String).slice(0, 50) }),
          getCheckboxProps: (row) => ({
            disabled:
              bulk.isPending ||
              orders.isPlaceholderData ||
              (selectedIds.length >= 50 && !selectedIds.includes(row.id)),
          }),
          hideSelectAll: (orders.data?.data.length || 0) > 50,
        }}
        scroll={{ x: 1235 }}
        locale={{
          emptyText: (
            <Empty
              image={
                <ShoppingOutlined style={{ fontSize: 32, color: "#a3a8a4" }} />
              }
              description={text("empty")}
            />
          ),
        }}
        pagination={{
          current: filters.page,
          pageSize: filters.limit,
          total: orders.data?.total,
          showSizeChanger: true,
          pageSizeOptions: [10, 20, 50, 100],
          showTotal: (total) =>
            text("count").replace("{{count}}", String(total)),
          onChange: (page, limit) =>
            patch({ page: String(page), limit: String(limit) }, false),
        }}
        onRow={(order) => ({
          onClick: (event) => {
            if (
              (event.target as HTMLElement).closest(
                "button,a,input,label,.ant-checkbox-wrapper",
              )
            )
              return;
            patch({ order: order.id }, false);
          },
          style: { cursor: "pointer" },
        })}
      />
      <Drawer
        open={!!selectedId}
        onClose={() => patch({ order: undefined }, false)}
        size={900}
        title={data?.reference || text("order")}
      >
        {detail.isPending ? (
          <Spin />
        ) : detail.isError ? (
          <Alert
            type="error"
            title={text("error")}
            action={
              <Button onClick={() => void detail.refetch()}>
                {text("retry")}
              </Button>
            }
          />
        ) : (
          data && (
            <>
              <div className={styles.detailHeading}>
                <Space wrap>
                  {statusTag(data.status)}
                  {paymentTag(data)}
                  <span className={styles.muted}>{date(data.createdAt)}</span>
                </Space>
                <Space wrap>
                  {data.status === "PENDING" && (
                    <Button
                      type="primary"
                      loading={action.isPending}
                      disabled={bulk.isPending}
                      onClick={() => run("confirm")}
                    >
                      {text("confirm")}
                    </Button>
                  )}
                  {data.status === "CONFIRMED" && (
                    <Button
                      type="primary"
                      loading={action.isPending}
                      disabled={bulk.isPending}
                      onClick={() => run("dispatch")}
                    >
                      {text("dispatch")}
                    </Button>
                  )}
                  {data.status === "DISPATCHED" && (
                    <Button
                      type="primary"
                      loading={action.isPending}
                      disabled={bulk.isPending}
                      onClick={() => run("deliver")}
                    >
                      {text("deliver")}
                    </Button>
                  )}
                  {data.status === "DELIVERED" &&
                    data.paymentStatus === "UNPAID" && (
                      <Button
                        type="primary"
                        loading={action.isPending}
                        disabled={bulk.isPending}
                        onClick={() => run("collect_cash")}
                      >
                        {text("collect_cash")}
                      </Button>
                    )}
                  {["PENDING", "CONFIRMED"].includes(data.status) && (
                    <Button
                      danger
                      disabled={action.isPending || bulk.isPending}
                      onClick={() => run("cancel")}
                    >
                      {text("cancel")}
                    </Button>
                  )}
                </Space>
              </div>
              <div className={styles.detailGrid}>
                <div>
                  <section className={styles.section}>
                    <h3>{text("items")}</h3>
                    {data.items.map((item) => (
                      <div key={item.id} className={styles.item}>
                        <div className={styles.image}>
                          {item.image ? (
                            <Image
                              src={`${process.env.NEXT_PUBLIC_ASSET_URL}${item.image}`}
                              width={48}
                              height={48}
                              preview={false}
                              alt=""
                            />
                          ) : (
                            <ShoppingOutlined />
                          )}
                        </div>
                        <div className={styles.itemName}>
                          <strong>
                            {i18n.language.startsWith("ar")
                              ? item.nameAr
                              : item.nameEn}
                          </strong>
                          <span className={styles.muted}>
                            {i18n.language.startsWith("ar")
                              ? item.storeNameAr
                              : item.storeNameEn}
                          </span>
                          <span className={styles.muted}>
                            {money(item.unitPrice)} × {item.quantity}
                          </span>
                        </div>
                        <strong>{money(item.total)}</strong>
                      </div>
                    ))}
                  </section>
                  {!!data.fulfilments?.length && (
                    <section className={styles.section}>
                      <h3>{t("overview.fulfilment")}</h3>
                      {data.fulfilments.map((row) => (
                        <div key={row.storeId} className={styles.amount}>
                          <span>
                            {data.items.find(
                              (item) => item.storeId === row.storeId,
                            )?.[
                              i18n.language.startsWith("ar")
                                ? "storeNameAr"
                                : "storeNameEn"
                            ] || t("overview.store")}
                          </span>
                          <Tag
                            color={
                              row.status === "READY"
                                ? "green"
                                : row.status === "PACKING"
                                  ? "blue"
                                  : "gold"
                            }
                          >
                            {t(`overview.queue.${row.status}`)}
                          </Tag>
                        </div>
                      ))}
                    </section>
                  )}
                  <section className={styles.section}>
                    <h3>{text("payment")}</h3>
                    <div className={styles.amount}>
                      <span>{text("subtotal")}</span>
                      <span>{money(data.subtotal)}</span>
                    </div>
                    <div className={styles.amount}>
                      <span>{text("deliveryFee")}</span>
                      <span>{money(data.deliveryFee)}</span>
                    </div>
                    <div className={styles.amount}>
                      <strong>{text("total")}</strong>
                      <strong>{money(data.total)}</strong>
                    </div>
                    <div className={styles.muted}>{text("cod")}</div>
                  </section>
                  <section className={styles.section}>
                    <h3>{text("timeline")}</h3>
                    <OrderNotes key={data.id} id={data.id} />
                    <Timeline
                      items={[...(data.events || [])]
                        .reverse()
                        .map((event) => ({
                          content: (
                            <div>
                              <strong>{text(`events.${event.action}`)}</strong>
                              <div className={styles.muted}>
                                {event.actorName} · {date(event.createdAt)}
                              </div>
                              {event.note && <div>{event.note}</div>}
                            </div>
                          ),
                        }))}
                    />
                  </section>
                </div>
                <div>
                  <section className={styles.section}>
                    <h3>{text("customer")}</h3>
                    <strong>{data.customerName}</strong>
                    <div>
                      <a href={`mailto:${data.customerEmail}`}>
                        {data.customerEmail}
                      </a>
                    </div>
                    <a href={`tel:${data.phone}`}>{data.phone}</a>
                  </section>
                  {address && (
                    <section className={styles.section}>
                      <h3>{text("address")}</h3>
                      <strong>
                        {address.label} · {address.fullName}
                      </strong>
                      <div>
                        {[address.governorate, address.area]
                          .filter(Boolean)
                          .join(", ")}
                      </div>
                      <div>
                        {text("block")} {address.block}, {text("street")}{" "}
                        {address.street}
                      </div>
                      <div>
                        {text("building")} {address.building}
                      </div>
                      {address.avenue && (
                        <div>
                          {text("avenue")} {address.avenue}
                        </div>
                      )}
                      {address.floor && (
                        <div>
                          {text("floor")} {address.floor}
                        </div>
                      )}
                      {address.apartment && (
                        <div>
                          {text("apartment")} {address.apartment}
                        </div>
                      )}
                      {address.instructions && <p>{address.instructions}</p>}
                      {address.latitude != null &&
                        address.longitude != null && (
                          <a
                            href={`https://maps.apple.com/?q=${address.latitude},${address.longitude}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {text("map")}
                          </a>
                        )}
                    </section>
                  )}
                  {data.customerNote && (
                    <section className={styles.section}>
                      <h3>{text("note")}</h3>
                      <p>{data.customerNote}</p>
                    </section>
                  )}
                </div>
              </div>
            </>
          )
        )}
      </Drawer>
      {messageContext}
      {modalContext}
    </div>
  );
}
