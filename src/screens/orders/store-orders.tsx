"use client";
import { IApiError } from "@/api/http";
import {
  fetchStoreOrder,
  fetchStoreOrders,
  StoreOrder,
  updateStoreOrder,
} from "@/services/store-orders.service";
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
  Empty,
  Image,
  Input,
  message,
  Space,
  Spin,
  Table,
  Tabs,
  Tag,
} from "antd";
import type { TableColumnsType } from "antd";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDebouncedCallback } from "use-debounce";
import styles from "./orders.module.css";
export default function StoreOrdersScreen() {
  const { t, i18n } = useTranslation();
  const ar = i18n.language.startsWith("ar");
  const tr = (key: string) => t(`overview.${key}`, { defaultValue: key });
  const params = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const client = useQueryClient();
  const [api, context] = message.useMessage();
  const status = ["NEW", "PACKING", "READY"].includes(
    params.get("status") || "",
  )
    ? params.get("status")!
    : undefined;
  const querySearch = params.get("search") || "";
  const page = Math.max(1, Number(params.get("page")) || 1);
  const id = params.get("order") || "";
  const patch = (values: Record<string, string | undefined>) => {
    const next = new URLSearchParams(params.toString());
    Object.entries(values).forEach(([key, value]) =>
      value ? next.set(key, value) : next.delete(key),
    );
    if ("status" in values || "search" in values) next.delete("page");
    router.replace(`${path}?${next}`, { scroll: false });
  };
  const search = useDebouncedCallback(
    (value: string) => patch({ search: value.trim() || undefined }),
    350,
  );
  const [box, setBox] = useState({ url: querySearch, value: querySearch });
  if (box.url !== querySearch)
    setBox({
      url: querySearch,
      value: search.isPending() ? box.value : querySearch,
    });
  const orders = useQuery({
    queryKey: ["store-orders", { page, status, search: querySearch }],
    queryFn: () =>
      fetchStoreOrders({ page, limit: 20, status, search: querySearch }),
    placeholderData: keepPreviousData,
    refetchInterval: 30000,
  });
  const detail = useQuery({
    queryKey: ["store-order", id],
    queryFn: () => fetchStoreOrder(id),
    enabled: !!id,
    refetchInterval: id ? 15000 : false,
  });
  const mutation = useMutation({
    mutationFn: ({
      id,
      action,
    }: {
      id: string;
      action: "acknowledge" | "ready";
    }) => updateStoreOrder(id, action),
    onSuccess: async (row) => {
      client.setQueryData(["store-order", row.id], row);
      api.success(tr("updated"));
      await Promise.all([
        client.invalidateQueries({ queryKey: ["store-orders"] }),
        client.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);
    },
    onError: (error: IApiError) => {
      api.error(error.detail || t("orders.actionError"));
      void orders.refetch();
      void detail.refetch();
    },
  });
  const money = (n: number) =>
    new Intl.NumberFormat(i18n.language, {
      style: "currency",
      currency: "KWD",
    }).format(n);
  const date = (v: string) =>
    new Intl.DateTimeFormat(i18n.language, {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Kuwait",
    }).format(new Date(v));
  const tag = (row: StoreOrder) =>
    ["PENDING", "CONFIRMED"].includes(row.orderStatus) ? (
      <Tag
        variant="filled"
        color={
          row.status === "NEW"
            ? "gold"
            : row.status === "PACKING"
              ? "blue"
              : "green"
        }
      >
        {tr(`queue.${row.status}`)}
      </Tag>
    ) : (
      <Tag>{t(`orders.status.${row.orderStatus}`)}</Tag>
    );
  const action = (row: StoreOrder) =>
    ["PENDING", "CONFIRMED"].includes(row.orderStatus) &&
    row.status !== "READY" ? (
      <Button
        size="small"
        type="primary"
        loading={mutation.isPending && mutation.variables?.id === row.id}
        disabled={mutation.isPending}
        onClick={() =>
          mutation.mutate({
            id: row.id,
            action: row.status === "NEW" ? "acknowledge" : "ready",
          })
        }
      >
        {tr(`action.${row.status}`)}
      </Button>
    ) : null;
  const columns: TableColumnsType<StoreOrder> = [
    {
      title: tr("order"),
      width: 150,
      render: (_, row) => (
        <Button
          type="link"
          style={{ padding: 0 }}
          onClick={() => patch({ order: row.id })}
        >
          {row.reference}
        </Button>
      ),
    },
    {
      title: tr("items"),
      render: (_, row) => (
        <div style={{ maxWidth: 300 }}>
          {row.items
            .map(
              (item) => `${ar ? item.nameAr : item.nameEn} × ${item.quantity}`,
            )
            .join("، ")}
        </div>
      ),
    },
    {
      title: t("orders.date"),
      dataIndex: "createdAt",
      render: date,
      width: 200,
    },
    { title: tr("itemValue"), dataIndex: "value", render: money, width: 130 },
    { title: t("orders.delivery"), dataIndex: "area", width: 130 },
    { title: tr("fulfilment"), render: (_, row) => tag(row), width: 170 },
    { title: tr("actionLabel"), render: (_, row) => action(row), width: 160 },
  ];
  const data = detail.data;
  return (
    <div className={styles.screen}>
      {context}
      <div className={styles.heading}>
        <h1>{t("orders.title")}</h1>
        <Button icon={<ReloadOutlined />} onClick={() => void orders.refetch()}>
          {tr("refresh")}
        </Button>
      </div>
      <Tabs
        activeKey={status || "all"}
        onChange={(key) => patch({ status: key === "all" ? undefined : key })}
        items={[
          { key: "all", label: tr("all") },
          ...["NEW", "PACKING", "READY"].map((key) => ({
            key,
            label: tr(`queue.${key}`),
          })),
        ]}
      />
      <Input
        maxLength={100}
        prefix={<SearchOutlined />}
        allowClear
        value={box.value}
        aria-label={tr("searchStoreOrders")}
        placeholder={tr("searchStoreOrders")}
        style={{ maxWidth: 380, marginBottom: 20 }}
        onChange={(event) => {
          setBox({ url: querySearch, value: event.target.value });
          search(event.target.value);
        }}
      />
      {orders.isError && (
        <Alert
          type="error"
          showIcon
          title={t("orders.error")}
          action={
            <Button onClick={() => void orders.refetch()}>{tr("retry")}</Button>
          }
        />
      )}
      <Table
        rowKey="id"
        size="small"
        columns={columns}
        dataSource={orders.data?.data}
        loading={orders.isFetching}
        scroll={{ x: 1100 }}
        pagination={{
          current: page,
          pageSize: 20,
          total: orders.data?.total,
          showSizeChanger: false,
          onChange: (page) => patch({ page: String(page) }),
        }}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={tr("noOrders")}
            />
          ),
        }}
      />
      <Drawer
        open={!!id}
        size={680}
        title={data?.reference || tr("order")}
        onClose={() => patch({ order: undefined })}
      >
        {detail.isPending ? (
          <Spin />
        ) : detail.isError ? (
          <Alert
            type="error"
            title={t("orders.error")}
            action={
              <Button onClick={() => void detail.refetch()}>
                {tr("retry")}
              </Button>
            }
          />
        ) : (
          data && (
            <>
              <div className={styles.detailHeading}>
                <Space wrap>
                  {tag(data)}
                  <span className={styles.muted}>{date(data.createdAt)}</span>
                </Space>
                {action(data)}
              </div>
              <section className={styles.section}>
                <h3>
                  {tr("onlyItems")} · {data.quantity}
                </h3>
                {data.items.map((item) => (
                  <div key={item.id} className={styles.item}>
                    <div className={styles.image}>
                      {item.image ? (
                        <Image
                          src={`${process.env.NEXT_PUBLIC_ASSET_URL}${item.image}`}
                          width={48}
                          height={48}
                          alt=""
                          preview={false}
                        />
                      ) : (
                        <ShoppingOutlined />
                      )}
                    </div>
                    <div className={styles.itemName}>
                      <strong>{ar ? item.nameAr : item.nameEn}</strong>
                      <span className={styles.muted}>
                        {item.quantity} × {money(item.unitPrice)}
                      </span>
                    </div>
                    <strong>{money(item.total)}</strong>
                  </div>
                ))}
                <div className={styles.amount}>
                  <strong>{tr("itemValue")}</strong>
                  <strong>{money(data.value)}</strong>
                </div>
              </section>
              <section className={styles.section}>
                <h3>{t("orders.delivery")}</h3>
                <span>{data.area || "—"}</span>
              </section>
              <section className={styles.section}>
                <h3>{tr("orderStatus")}</h3>
                <Tag>{t(`orders.status.${data.orderStatus}`)}</Tag>
                {data.acknowledgedAt && (
                  <p>
                    {tr("acknowledged")} · {date(data.acknowledgedAt)}
                  </p>
                )}
                {data.readyAt && (
                  <p>
                    {tr("readyAt")} · {date(data.readyAt)}
                  </p>
                )}
              </section>
            </>
          )
        )}
      </Drawer>
    </div>
  );
}
