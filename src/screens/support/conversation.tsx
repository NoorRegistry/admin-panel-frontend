"use client";
import { IApiError } from "@/api/http";
import {
  fetchSupportDetail,
  readSupportRequest,
  sendSupportReply,
  setSupportStatus,
} from "@/services/support.service";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Alert, Button, Input, Skeleton, Space, Tag } from "antd";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./support.module.css";
export default function Conversation({
  id,
  internal,
}: {
  id: string;
  internal: boolean;
}) {
  const { t, i18n } = useTranslation();
  const tr = (key: string) => t(`support.${key}`, { defaultValue: key });
  const client = useQueryClient();
  const [text, setText] = useState("");
  const pending = useRef<{ id: string; text: string } | null>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const readThrough = useRef(0);
  const query = useInfiniteQuery({
    queryKey: ["support-detail", id],
    queryFn: ({ pageParam }) => fetchSupportDetail(id, pageParam),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (p) => p.nextBefore || undefined,
    refetchInterval: 10000,
  });
  const data = query.data?.pages[0];
  const newest = data?.messages.at(-1)?.id || 0;
  const messages = [
    ...new Map(
      (
        query.data?.pages
          .slice()
          .reverse()
          .flatMap((p) => p.messages) || []
      ).map((m) => [m.id, m]),
    ).values(),
  ];
  useEffect(() => {
    bottom.current?.scrollIntoView({
      block: "end",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }, [newest]);
  useEffect(() => {
    const read = () => {
      if (
        !newest ||
        newest <= readThrough.current ||
        document.visibilityState !== "visible"
      )
        return;
      void readSupportRequest(id, newest)
        .then(() => {
          readThrough.current = newest;
          void client.invalidateQueries({ queryKey: ["support-list"] });
          void client.invalidateQueries({ queryKey: ["support-unread"] });
        })
        .catch(() => undefined);
    };
    read();
    document.addEventListener("visibilitychange", read);
    return () => document.removeEventListener("visibilitychange", read);
  }, [client, id, newest]);
  const refresh = async () => {
    await query.refetch();
    void client.invalidateQueries({ queryKey: ["support-list"] });
    void client.invalidateQueries({ queryKey: ["support-unread"] });
  };
  const reply = useMutation({
    mutationFn: () => {
      const trimmed = text.trim();
      if (!pending.current || pending.current.text !== trimmed)
        pending.current = { id: crypto.randomUUID(), text: trimmed };
      return sendSupportReply(id, {
        clientId: pending.current.id,
        message: trimmed,
      });
    },
    onSuccess: async () => {
      setText("");
      pending.current = null;
      await refresh();
    },
  });
  const status = useMutation({
    mutationFn: () =>
      setSupportStatus(id, data?.status === "OPEN" ? "RESOLVED" : "OPEN"),
    onSuccess: refresh,
  });
  const date = (value: string) =>
    new Date(value).toLocaleString(i18n.language, {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    });
  if (query.isPending) return <Skeleton active />;
  if (!data)
    return (
      <Alert
        type="error"
        title={tr("loadError")}
        action={
          <Button onClick={() => void query.refetch()}>{tr("retry")}</Button>
        }
      />
    );
  return (
    <div className={styles.thread}>
      <div className={styles.detailHeading}>
        <div>
          <h3 className={styles.subject}>{data.subject}</h3>
          <Space wrap>
            <Tag color={data.status === "OPEN" ? "orange" : "green"}>
              {tr(`status.${data.status}`)}
            </Tag>
            <span className={styles.muted}>{tr(`topics.${data.topic}`)}</span>
            {data.orderId && (
              <Link href={`/orders?order=${data.orderId}`}>
                {data.orderReference}
              </Link>
            )}
          </Space>
          {internal && (
            <div className={styles.muted}>
              {data.requesterName} · {data.requesterEmail}
              {data.store
                ? ` · ${i18n.language.startsWith("ar") ? data.store.nameAr : data.store.nameEn}`
                : ""}
            </div>
          )}
        </div>
        <Button
          loading={status.isPending}
          disabled={reply.isPending}
          onClick={() => status.mutate()}
        >
          {tr(data.status === "OPEN" ? "resolve" : "reopen")}
        </Button>
      </div>
      {(status.isError || query.isRefetchError) && (
        <Alert type="error" title={tr("updateError")} />
      )}
      <div className={styles.messages} aria-live="polite">
        {query.hasNextPage && (
          <Button
            type="text"
            loading={query.isFetchingNextPage}
            onClick={() => void query.fetchNextPage()}
          >
            {tr("older")}
          </Button>
        )}
        {query.isFetchNextPageError && (
          <Alert
            type="error"
            title={tr("loadError")}
            action={
              <Button onClick={() => void query.fetchNextPage()}>
                {tr("retry")}
              </Button>
            }
          />
        )}
        {messages.map((m) =>
          m.sender === "SYSTEM" ? (
            <div key={m.id} className={styles.event}>
              {tr(`events.${m.body}`)} · {date(m.createdAt)}
            </div>
          ) : (
            <div
              key={m.id}
              className={`${styles.message} ${(internal ? m.sender === "SUPPORT" : m.sender === "REQUESTER") ? styles.own : ""}`}
            >
              <div className={styles.bubble}>
                <div className={styles.author}>
                  {m.sender === "SUPPORT"
                    ? internal
                      ? m.actorName
                      : tr("team")
                    : m.actorName}
                </div>
                {m.body}
              </div>
              <div className={styles.time}>{date(m.createdAt)}</div>
            </div>
          ),
        )}
        <div ref={bottom} />
      </div>
      <div className={styles.composer}>
        {reply.isError && (
          <Alert
            type="error"
            title={tr("sendError")}
            description={
              (reply.error as unknown as IApiError).status === 404
                ? tr("unavailable")
                : undefined
            }
          />
        )}
        <Input.TextArea
          aria-label={tr("reply")}
          placeholder={tr("reply")}
          autoSize={{ minRows: 2, maxRows: 5 }}
          maxLength={4000}
          value={text}
          disabled={reply.isPending}
          onChange={(e) => setText(e.target.value)}
        />
        <div className={styles.composeActions}>
          <Button
            type="primary"
            loading={reply.isPending}
            disabled={!text.trim() || status.isPending}
            onClick={() => reply.mutate()}
          >
            {tr("send")}
          </Button>
        </div>
      </div>
    </div>
  );
}
