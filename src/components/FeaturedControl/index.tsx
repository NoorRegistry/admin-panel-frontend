"use client";

import { http, IApiError } from "@/api/http";
import { useQueryClient } from "@tanstack/react-query";
import { InputNumber, message, Space, Switch, Tooltip } from "antd";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

export default function FeaturedControl({
  kind,
  id,
  isFeatured = false,
  featuredOrder = 0,
  eligible,
}: {
  kind: "products" | "stores";
  id: string;
  isFeatured?: boolean;
  featuredOrder?: number;
  eligible: boolean;
}) {
  const { t } = useTranslation();
  const client = useQueryClient();
  const [notice, context] = message.useMessage();
  const source = `${isFeatured}:${featuredOrder}`;
  const [draft, setDraft] = useState<{
    source: string;
    checked: boolean;
    order: number | null;
  }>({ source, checked: isFeatured, order: featuredOrder });
  const checked = draft.source === source ? draft.checked : isFeatured;
  const order = draft.source === source ? draft.order : featuredOrder;
  const setOrder = (value: number | null) =>
    setDraft({ source, checked, order: value });
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);

  async function save(changes: {
    isFeatured?: boolean;
    featuredOrder?: number;
  }) {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    if (changes.isFeatured !== undefined)
      setDraft({ source, checked: changes.isFeatured, order });
    try {
      await http.patch(`/v1/api/admin/home/${kind}/${id}`, changes);
      await client.invalidateQueries({ queryKey: [kind] });
      if (kind === "products")
        await client.invalidateQueries({ queryKey: ["product", id] });
      notice.success(t("featured.saved"));
    } catch (error) {
      setDraft({ source, checked: isFeatured, order: featuredOrder });
      notice.error((error as IApiError).detail || t("featured.saveError"));
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  return (
    <div onClick={(event) => event.stopPropagation()}>
      <Space>
        <Tooltip
          title={!eligible && !checked ? t("featured.unavailable") : undefined}
        >
          <Switch
            aria-label={t("featured.label")}
            checked={checked}
            loading={busy}
            disabled={!eligible && !checked}
            onChange={(value) => void save({ isFeatured: value })}
          />
        </Tooltip>
        <Tooltip title={t("featured.orderHint")}>
          <InputNumber
            aria-label={t("featured.order")}
            min={0}
            max={999999}
            precision={0}
            value={order}
            disabled={!checked || busy}
            style={{ width: 82 }}
            onChange={setOrder}
            onBlur={() => {
              if (order === null) setOrder(featuredOrder);
              else if (order !== featuredOrder)
                void save({ featuredOrder: order });
            }}
            onPressEnter={(event) => event.currentTarget.blur()}
          />
        </Tooltip>
      </Space>
      {context}
    </div>
  );
}
