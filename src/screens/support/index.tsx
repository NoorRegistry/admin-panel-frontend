"use client";
import {
  fetchSupportRequests,
  SupportRequest,
  supportTopics,
} from "@/services/support.service";
import { EAdminRole } from "@/types";
import { getAdminRole } from "@/utils/helper";
import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  Alert,
  Badge,
  Button,
  Drawer,
  Empty,
  Input,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
} from "antd";
import type { TableColumnsType } from "antd";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDebouncedCallback } from "use-debounce";
import Articles from "./articles";
import Conversation from "./conversation";
import NewRequest from "./new-request";
import styles from "./support.module.css";
export default function SupportScreen() {
  const { t, i18n } = useTranslation();
  const tr = (key: string) => t(`support.${key}`, { defaultValue: key });
  const internal = getAdminRole() === EAdminRole.INTERNAL_ADMIN;
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [creating, setCreating] = useState(false);
  const id = params.get("request") || "";
  const articleTab = internal && params.get("view") === "articles";
  const status = ["OPEN", "RESOLVED"].includes(params.get("status") || "")
    ? params.get("status")!
    : undefined;
  const source = ["CUSTOMER", "STORE"].includes(params.get("source") || "")
    ? params.get("source")!
    : undefined;
  const topic = supportTopics.find((x) => x === params.get("topic"));
  const filter = params.get("filter") === "unread" ? "unread" : undefined;
  const search = params.get("search") || "";
  const page = Math.max(1, Number(params.get("page")) || 1);
  const patch = (values: Record<string, string | undefined>) => {
    const next = new URLSearchParams(params.toString());
    Object.entries(values).forEach(([k, v]) =>
      v ? next.set(k, v) : next.delete(k),
    );
    if (
      Object.keys(values).some((k) =>
        ["status", "source", "topic", "search", "filter"].includes(k),
      )
    )
      next.delete("page");
    router.replace(`${pathname}?${next}`, { scroll: false });
  };
  const setSearch = useDebouncedCallback(
    (s: string) => patch({ search: s.trim() || undefined }),
    350,
  );
  const [searchBox, setSearchBox] = useState({ url: search, value: search });
  if (searchBox.url !== search)
    setSearchBox({
      url: search,
      value: setSearch.isPending() ? searchBox.value : search,
    });
  const list = useQuery({
    queryKey: ["support-list", { page, status, source, topic, filter, search }],
    queryFn: () =>
      fetchSupportRequests({
        page,
        limit: 20,
        status,
        source,
        topic,
        filter,
        search,
      }),
    placeholderData: keepPreviousData,
    refetchInterval: 30000,
    enabled: !articleTab,
  });
  const columns: TableColumnsType<SupportRequest> = [
    {
      title: tr("subject"),
      render: (_, r) => (
        <div>
          <div
            className={`${styles.subject} ${r.unreadCount ? styles.unread : ""}`}
          >
            <Badge dot={!!r.unreadCount} offset={[7, 0]}>
              {r.subject}
            </Badge>
          </div>
          <div className={styles.muted}>
            {r.orderReference || tr(`topics.${r.topic}`)}
          </div>
        </div>
      ),
    },
    ...(internal
      ? [
          {
            title: tr("requester"),
            render: (_: unknown, r: SupportRequest) => (
              <div>
                {r.requesterName}
                <div className={styles.muted}>{r.requesterEmail}</div>
              </div>
            ),
          },
          {
            title: tr("source"),
            render: (_: unknown, r: SupportRequest) =>
              tr(`sources.${r.source}`),
          },
        ]
      : []),
    {
      title: tr("statusLabel"),
      render: (_, r) => (
        <Tag color={r.status === "OPEN" ? "orange" : "green"}>
          {tr(`status.${r.status}`)}
        </Tag>
      ),
    },
    {
      title: tr("updated"),
      render: (_, r) =>
        new Date(r.updatedAt).toLocaleString(i18n.language, {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }),
    },
  ];
  return (
    <div className={styles.screen}>
      <div className={styles.heading}>
        <h1>{tr(internal ? "inbox" : "title")}</h1>
        <Space>
          <Button
            aria-label={tr("refresh")}
            icon={<ReloadOutlined />}
            onClick={() => void list.refetch()}
          />
          {!internal && (
            <Button type="primary" onClick={() => setCreating(true)}>
              {tr("newRequest")}
            </Button>
          )}
        </Space>
      </div>
      {internal && (
        <Tabs
          activeKey={articleTab ? "articles" : "requests"}
          onChange={(v) => patch({ view: v === "articles" ? v : undefined })}
          items={[
            { key: "requests", label: tr("requests") },
            { key: "articles", label: tr("articles") },
          ]}
        />
      )}
      {articleTab ? (
        <Articles />
      ) : (
        <>
          <Tabs
            activeKey={filter ? "unread" : status || "all"}
            onChange={(v) =>
              patch({
                status: v === "OPEN" || v === "RESOLVED" ? v : undefined,
                filter: v === "unread" ? v : undefined,
              })
            }
            items={[
              { key: "all", label: tr("all") },
              { key: "unread", label: tr("unread") },
              { key: "OPEN", label: tr("status.OPEN") },
              { key: "RESOLVED", label: tr("status.RESOLVED") },
            ]}
          />
          <div className={styles.toolbar}>
            <Input
              value={searchBox.value}
              allowClear
              prefix={<SearchOutlined />}
              aria-label={tr("search")}
              placeholder={tr("search")}
              onChange={(e) => {
                setSearchBox({ url: search, value: e.target.value });
                setSearch(e.target.value);
              }}
              style={{ maxWidth: 330 }}
            />
            {internal && (
              <Select
                aria-label={tr("source")}
                allowClear
                placeholder={tr("source")}
                value={source}
                onChange={(v) => patch({ source: v })}
                options={["CUSTOMER", "STORE"].map((value) => ({
                  value,
                  label: tr(`sources.${value}`),
                }))}
                style={{ width: 160 }}
              />
            )}
            <Select
              aria-label={tr("topic")}
              allowClear
              placeholder={tr("topic")}
              value={topic}
              onChange={(v) => patch({ topic: v })}
              options={supportTopics.map((value) => ({
                value,
                label: tr(`topics.${value}`),
              }))}
              style={{ width: 190 }}
            />
          </div>
          {list.isError && (
            <Alert
              type="error"
              title={tr("loadError")}
              action={
                <Button onClick={() => void list.refetch()}>
                  {tr("retry")}
                </Button>
              }
            />
          )}
          <Table<SupportRequest>
            rowKey="id"
            size="middle"
            columns={columns}
            dataSource={list.data?.data}
            loading={list.isFetching}
            scroll={{ x: internal ? 900 : 600 }}
            locale={{ emptyText: <Empty description={tr("empty")} /> }}
            onRow={(r) => ({
              onClick: () => patch({ request: r.id }),
              style: { cursor: "pointer" },
            })}
            pagination={{
              current: page,
              pageSize: 20,
              total: list.data?.total,
              showSizeChanger: false,
              onChange: (p) => patch({ page: String(p) }),
            }}
          />
        </>
      )}
      <Drawer
        open={!!id}
        onClose={() => patch({ request: undefined })}
        title={tr("request")}
        size={680}
        destroyOnHidden
        styles={{
          body: {
            display: "flex",
            flexDirection: "column",
            padding: 22,
            overflow: "hidden",
          },
        }}
      >
        {id && <Conversation key={id} id={id} internal={internal} />}
      </Drawer>
      {creating && (
        <NewRequest
          onClose={() => setCreating(false)}
          onCreated={(newId) => {
            setCreating(false);
            patch({ request: newId });
          }}
        />
      )}
    </div>
  );
}
