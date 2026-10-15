"use client";
import NavigationIcon from "@/components/NavigationIcon";
import { IApiError } from "@/api/http";
import { DashboardRow, fetchDashboard } from "@/services/dashboard.service";
import { updateOrder } from "@/services/orders.service";
import { updateStoreOrder } from "@/services/store-orders.service";
import {
  ClockCircleOutlined,
  InboxOutlined,
  ShoppingOutlined,
  TruckOutlined,
  WalletOutlined,
  ProductOutlined,
  WarningOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Button,
  DatePicker,
  Empty,
  Input,
  message,
  Modal,
  Skeleton,
  Table,
  Tabs,
  Tag,
} from "antd";
import type { TableColumnsType } from "antd";
import dayjs from "dayjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./dashboard.module.css";

export default function DashboardScreen() {
  const { t, i18n } = useTranslation();
  const tr = (key: string, options?: Record<string, unknown>) =>
    t(`overview.${key}`, { defaultValue: key, ...options });
  const ar = i18n.language.startsWith("ar");
  const router = useRouter();
  const client = useQueryClient();
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(timer);
  }, []);
  const today = dayjs(new Date(now + 3 * 3600000).toISOString().slice(0, 10));
  const [range, setRange] = useState<[string, string]>([
    today.format("YYYY-MM-DD"),
    today.format("YYYY-MM-DD"),
  ]);
  const [selected, setSelected] = useState("");
  const [api, context] = message.useMessage();
  const [modal, modalContext] = Modal.useModal();
  const query = useQuery({
    queryKey: ["dashboard", ...range],
    queryFn: () => fetchDashboard(...range),
    refetchInterval: 30000,
  });
  const data = query.data;
  const store = data?.role === "STORE_ADMIN";
  const money = (n: number) =>
    new Intl.NumberFormat(ar ? "ar-KW" : "en-KW", {
      style: "currency",
      currency: "KWD",
    }).format(n);
  const number = (n: number) => new Intl.NumberFormat(i18n.language).format(n);
  const age = (value: string) => {
    const minutes = Math.max(
      0,
      Math.floor((now - new Date(value).getTime()) / 60000),
    );
    return minutes < 60
      ? tr("minutes", { count: minutes })
      : minutes < 1440
        ? tr("hours", { count: Math.floor(minutes / 60) })
        : tr("days", { count: Math.floor(minutes / 1440) });
  };
  const queue = data?.queues.find((q) => q.key === selected) || data?.queues[0];
  const queueLabel = (key: string) => tr(`queue.${key}`);
  const href = (key: string) =>
    store
      ? `/orders?status=${key}`
      : key === "CASH"
        ? "/orders?status=DELIVERED&paymentStatus=UNPAID&sort=oldest"
        : `/orders?status=${key}&sort=oldest`;
  const mutation = useMutation({
    mutationFn: async ({ row, key }: { row: DashboardRow; key: string }) => {
      await (store
        ? updateStoreOrder(row.id, key === "NEW" ? "acknowledge" : "ready")
        : updateOrder(
            row.id,
            key === "PENDING"
              ? "confirm"
              : key === "CONFIRMED"
                ? "dispatch"
                : "collect_cash",
          ));
    },
    onSuccess: async () => {
      api.success(tr("updated"));
      await Promise.all([
        client.invalidateQueries({ queryKey: ["dashboard"] }),
        client.invalidateQueries({ queryKey: ["orders"] }),
        client.invalidateQueries({ queryKey: ["order"] }),
        client.invalidateQueries({ queryKey: ["store-orders"] }),
        client.invalidateQueries({ queryKey: ["store-order"] }),
      ]);
    },
    onError: (error: IApiError) => {
      api.error(error.detail || tr("error"));
      void query.refetch();
    },
  });
  const actionLabel = (key: string) => tr(`action.${key}`);
  const run = (row: DashboardRow, key: string) => {
    if (key === "CASH")
      modal.confirm({
        title: tr("cashConfirm"),
        content: `${row.reference} · ${money(row.value)}`,
        okText: actionLabel(key),
        cancelText: tr("back"),
        onOk: () => mutation.mutateAsync({ row, key }),
      });
    else mutation.mutate({ row, key });
  };
  const columns: TableColumnsType<DashboardRow> = [
    {
      title: tr("order"),
      key: "order",
      width: 150,
      render: (_, row) => (
        <Link className={styles.reference} href={`/orders?order=${row.id}`}>
          {row.reference}
        </Link>
      ),
    },
    {
      title: store ? tr("items") : tr("customer"),
      key: "customer",
      render: (_, row) => (
        <div className={styles.rowTitle}>
          {store ? (
            <>
              <strong>
                {row.items
                  ?.map(
                    (item) =>
                      `${ar ? item.nameAr : item.nameEn} × ${item.quantity}`,
                  )
                  .join("، ")}
              </strong>
              <small>{row.area}</small>
            </>
          ) : (
            <>
              <strong>{row.customerName}</strong>
              <small>
                {row.stores
                  ?.map((item) => (ar ? item.nameAr : item.nameEn))
                  .join(" · ")}
              </small>
            </>
          )}
        </div>
      ),
    },
    {
      title: store ? tr("itemValue") : tr("total"),
      dataIndex: "value",
      width: 150,
      render: money,
    },
    {
      title: tr("waiting"),
      dataIndex: "createdAt",
      width: 100,
      render: (value: string) => (
        <span className={styles.waiting}>
          <ClockCircleOutlined />
          {age(value)}
        </span>
      ),
    },
    {
      title: tr("actionLabel"),
      key: "action",
      width: 180,
      render: (_, row) => (
        <div className={styles.actions}>
          <Link href={`/orders?order=${row.id}`}>{tr("review")}</Link>
          {queue?.key !== "READY" && (
            <Button
              size="small"
              type="primary"
              loading={
                mutation.isPending && mutation.variables?.row.id === row.id
              }
              disabled={mutation.isPending}
              onClick={() => run(row, queue!.key)}
            >
              {actionLabel(queue!.key)}
            </Button>
          )}
        </div>
      ),
    },
  ];
  const productLink = (id: string) => `/products?product=${id}`;
  const max = Math.max(1, ...(data?.trend.map((point) => point.count) || []));
  const icons = [
    <InboxOutlined key="new" />,
    <TruckOutlined key="dispatch" />,
    <WalletOutlined key="cash" />,
  ];
  return (
    <div className={styles.dashboard}>
      {context}
      {modalContext}
      <header className={styles.heading}>
        <div>
          <h1>
            {store && data?.store
              ? ar
                ? data.store.nameAr
                : data.store.nameEn
              : tr("title")}
          </h1>
          {store && <span className={styles.muted}>{tr("storeOverview")}</span>}
        </div>
        <div className={styles.dateTools}>
          <DatePicker.RangePicker
            allowClear={false}
            value={[dayjs(range[0]), dayjs(range[1])]}
            format="D MMM YYYY"
            maxDate={today}
            onChange={(value) => {
              if (value?.[0] && value[1])
                setRange([
                  value[0].format("YYYY-MM-DD"),
                  value[1].format("YYYY-MM-DD"),
                ]);
            }}
            presets={[
              { label: tr("today"), value: [today, today] },
              { label: tr("last7"), value: [today.subtract(6, "day"), today] },
              {
                label: tr("last30"),
                value: [today.subtract(29, "day"), today],
              },
            ]}
          />
          <Button
            aria-label={tr("refresh")}
            icon={<ReloadOutlined spin={query.isFetching} />}
            onClick={() => void query.refetch()}
          />
        </div>
      </header>
      {query.isError && (
        <Alert
          type="error"
          showIcon
          title={tr("error")}
          action={
            <Button onClick={() => void query.refetch()}>{tr("retry")}</Button>
          }
        />
      )}
      {!data ? (
        <Skeleton active paragraph={{ rows: 12 }} />
      ) : (
        <>
          <section className={styles.attention}>
            <div className={styles.sectionTitle}>
              <h2>{tr("needsAttention")}</h2>
              <span>{tr("allOutstanding")}</span>
            </div>
            <div className={styles.attentionGrid}>
              {data.queues.map((q, index) => (
                <Link
                  href={href(q.key)}
                  key={q.key}
                  className={styles.attentionItem}
                >
                  <span className={styles.attentionIcon}>
                    {store && index === 2 ? (
                      <CheckCircleOutlined />
                    ) : (
                      icons[index]
                    )}
                  </span>
                  <div>
                    <strong>{number(q.count)}</strong>
                    <div>{queueLabel(q.key)}</div>
                    <small>
                      {q.oldestAt
                        ? tr("oldest", { age: age(q.oldestAt) })
                        : tr("upToDate")}
                    </small>
                    <span className={styles.textLink}>
                      {tr("viewQueue")} <NavigationIcon />
                    </span>
                  </div>
                </Link>
              ))}
              <Link
                href={
                  store ? "/products?inventory=low" : "/products?status=Pending"
                }
                className={styles.attentionItem}
              >
                <span className={styles.attentionIcon}>
                  {store ? <WarningOutlined /> : <ProductOutlined />}
                </span>
                <div>
                  <strong>
                    {number(
                      store ? data.catalogue.lowStock : data.catalogue.pending,
                    )}
                  </strong>
                  <div>{store ? tr("lowStock") : tr("awaitingApproval")}</div>
                  <small>
                    {store ? tr("stockThreshold") : tr("catalogue")}
                  </small>
                  <span className={styles.textLink}>
                    {tr("reviewProducts")} <NavigationIcon />
                  </span>
                </div>
              </Link>
            </div>
          </section>
          <section className={styles.summary} aria-label={tr("periodSummary")}>
            {[
              {
                icon: <ShoppingOutlined />,
                label: tr("orders"),
                value: number(data.summary.orders),
              },
              {
                icon: <BarChartOutlined />,
                label: store ? tr("itemValue") : tr("orderValue"),
                value: money(data.summary.value),
              },
              {
                icon: store ? <ProductOutlined /> : <CheckCircleOutlined />,
                label: store ? tr("liveProducts") : tr("delivered"),
                value: number(
                  store ? data.catalogue.live : data.summary.delivered,
                ),
              },
              {
                icon: store ? <ClockCircleOutlined /> : <CloseCircleOutlined />,
                label: store ? tr("pendingApproval") : tr("cancelled"),
                value: number(
                  store ? data.catalogue.pending : data.summary.cancelled,
                ),
              },
            ].map((item) => (
              <div key={item.label}>
                {item.icon}
                <div>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              </div>
            ))}
          </section>
          <div className={styles.mainGrid}>
            <section className={`${styles.panel} ${styles.queue}`}>
              <div className={styles.panelHeading}>
                <h2>{tr("orderQueue")}</h2>
                <Link href="/orders">
                  {tr("allOrders")} <NavigationIcon />
                </Link>
              </div>
              <Tabs
                activeKey={queue?.key}
                onChange={setSelected}
                items={data.queues.map((q) => ({
                  key: q.key,
                  label: (
                    <span>
                      {queueLabel(q.key)}{" "}
                      <span className={styles.count}>{number(q.count)}</span>
                    </span>
                  ),
                }))}
              />
              <div className={styles.queueTools}>
                <Input.Search
                  allowClear
                  aria-label={
                    store ? tr("searchStoreOrders") : tr("searchOrders")
                  }
                  placeholder={
                    store ? tr("searchStoreOrders") : tr("searchOrders")
                  }
                  onSearch={(value) =>
                    router.push(
                      `/orders?search=${encodeURIComponent(value.trim())}`,
                    )
                  }
                />
                <span>{tr("oldestFirst")}</span>
              </div>
              <Table
                rowKey="id"
                size="small"
                columns={columns}
                dataSource={queue?.rows}
                pagination={false}
                scroll={{ x: 760 }}
                locale={{
                  emptyText: (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={tr("queueEmpty")}
                    />
                  ),
                }}
              />
              <div className={styles.queueFooter}>
                <span>
                  {tr("showing", {
                    shown: queue?.rows.length || 0,
                    total: queue?.count || 0,
                  })}
                </span>
                <Link href={href(queue!.key)}>
                  {tr("viewAll")} <NavigationIcon />
                </Link>
              </div>
            </section>
            <aside className={styles.aside}>
              <section className={styles.panel}>
                <div className={styles.panelHeading}>
                  <h2>{tr("catalogue")}</h2>
                </div>
                <div className={styles.catalogue}>
                  {[
                    {
                      key: "lowStock",
                      count: data.catalogue.lowStock,
                      url: "/products?inventory=low",
                      icon: <WarningOutlined />,
                    },
                    {
                      key: "outOfStock",
                      count: data.catalogue.outOfStock,
                      url: "/products?inventory=out",
                      icon: <CloseCircleOutlined />,
                    },
                    {
                      key: "pendingApproval",
                      count: data.catalogue.pending,
                      url: "/products?status=Pending",
                      icon: <ProductOutlined />,
                    },
                  ].map((row) => (
                    <Link key={row.key} href={row.url}>
                      {row.icon}
                      <span>{tr(row.key)}</span>
                      <strong>{number(row.count)}</strong>
                      <NavigationIcon />
                    </Link>
                  ))}
                </div>
              </section>
              {store && data.catalogue.inventory.length > 0 && (
                <section className={styles.panel}>
                  <div className={styles.panelHeading}>
                    <h2>{tr("inventory")}</h2>
                    <Link href="/products?inventory=low">{tr("viewAll")}</Link>
                  </div>
                  <div className={styles.list}>
                    {data.catalogue.inventory.length ? (
                      data.catalogue.inventory.map((item) => (
                        <Link key={item.id} href={productLink(item.id)}>
                          <span>{ar ? item.nameAr : item.nameEn}</span>
                          <Tag color={item.qty <= 0 ? "red" : "orange"}>
                            {tr("stockLeft", { count: item.qty })}
                          </Tag>
                        </Link>
                      ))
                    ) : (
                      <span className={styles.muted}>{tr("upToDate")}</span>
                    )}
                  </div>
                </section>
              )}
              {(!store || data.catalogue.approvals.length > 0) && (
                <section className={styles.panel}>
                  <div className={styles.panelHeading}>
                    <h2>
                      {store ? tr("productApprovals") : tr("recentActivity")}
                    </h2>
                  </div>
                  <div className={styles.list}>
                    {store ? (
                      data.catalogue.approvals.length ? (
                        data.catalogue.approvals.map((item) => (
                          <Link key={item.id} href={productLink(item.id)}>
                            <span>{ar ? item.nameAr : item.nameEn}</span>
                            <Tag
                              color={
                                item.status === "Rejected" ? "red" : "gold"
                              }
                            >
                              {tr(
                                item.status === "Rejected"
                                  ? "rejected"
                                  : "pending",
                              )}
                            </Tag>
                          </Link>
                        ))
                      ) : (
                        <span className={styles.muted}>{tr("upToDate")}</span>
                      )
                    ) : data.activity.length ? (
                      data.activity.map((event) => (
                        <Link
                          key={event.id}
                          href={`/orders?order=${event.orderId}`}
                        >
                          <span>
                            <strong className={styles.reference}>
                              {event.reference}
                            </strong>
                            <small>
                              {t(`orders.events.${event.action}`, {
                                defaultValue: event.action,
                              })}
                            </small>
                          </span>
                          <small>{age(event.createdAt)}</small>
                        </Link>
                      ))
                    ) : (
                      <span className={styles.muted}>{tr("noActivity")}</span>
                    )}
                  </div>
                </section>
              )}
            </aside>
          </div>
          <section className={styles.panel}>
            <div className={styles.panelHeading}>
              <h2>{tr("orderTrend")}</h2>
              <span className={styles.muted}>
                {tr("ending", {
                  date: dayjs(range[1])
                    .locale(ar ? "ar" : "en")
                    .format("D MMM"),
                })}
              </span>
            </div>
            <div className={styles.trend} aria-label={tr("orderTrend")}>
              {data.trend.map((point) => (
                <div key={point.date} className={styles.trendDay}>
                  <strong>{number(point.count)}</strong>
                  <div className={styles.barTrack}>
                    <div
                      style={{
                        height: `${Math.max(2, (point.count / max) * 66)}px`,
                      }}
                    />
                  </div>
                  <span>
                    {dayjs(point.date)
                      .locale(ar ? "ar" : "en")
                      .format("D MMM")}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
