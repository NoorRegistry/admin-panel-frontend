"use client";
import {
  createSupportRequest,
  supportTopics,
  SupportTopic,
} from "@/services/support.service";
import { fetchStoreOrders } from "@/services/store-orders.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Form, Input, Modal, Select } from "antd";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDebounce } from "use-debounce";
export default function NewRequest({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (id: string) => void;
}) {
  const { t } = useTranslation();
  const tr = (key: string) => t(`support.${key}`, { defaultValue: key });
  const [form] = Form.useForm();
  const client = useQueryClient();
  const id = useRef<string>("");
  const [search, setSearch] = useState("");
  const [debounced] = useDebounce(search, 300);
  const orders = useQuery({
    queryKey: ["support-order-picker", debounced],
    queryFn: () => fetchStoreOrders({ page: 1, limit: 20, search: debounced }),
  });
  const mutation = useMutation({
    mutationFn: (values: {
      subject: string;
      message: string;
      topic: SupportTopic;
      orderId?: string;
    }) => {
      if (!id.current) id.current = crypto.randomUUID();
      return createSupportRequest({
        ...values,
        subject: values.subject.trim(),
        message: values.message.trim(),
        id: id.current,
      });
    },
    onSuccess: (data) => {
      void client.invalidateQueries({ queryKey: ["support-list"] });
      onCreated(data.id);
    },
  });
  return (
    <Modal
      open
      title={tr("newRequest")}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText={tr("sendRequest")}
      cancelText={tr("cancel")}
      confirmLoading={mutation.isPending}
      cancelButtonProps={{ disabled: mutation.isPending }}
      closable={!mutation.isPending}
      mask={{ closable: !mutation.isPending }}
    >
      <Form
        form={form}
        layout="vertical"
        disabled={mutation.isPending}
        initialValues={{ topic: "ORDERS" }}
        onFinish={(v) => mutation.mutate(v)}
      >
        <Form.Item
          name="topic"
          label={tr("topic")}
          rules={[{ required: true, message: tr("required") }]}
        >
          <Select
            options={supportTopics.map((value) => ({
              value,
              label: tr(`topics.${value}`),
            }))}
          />
        </Form.Item>
        <Form.Item
          name="subject"
          label={tr("subject")}
          rules={[
            {
              required: true,
              whitespace: true,
              min: 2,
              max: 120,
              message: tr("required"),
            },
          ]}
        >
          <Input maxLength={120} />
        </Form.Item>
        <Form.Item
          name="message"
          label={tr("message")}
          rules={[
            { required: true, whitespace: true, message: tr("required") },
          ]}
        >
          <Input.TextArea rows={5} maxLength={4000} />
        </Form.Item>
        <Form.Item name="orderId" label={tr("linkOrder")}>
          <Select
            allowClear
            showSearch={{ filterOption: false, onSearch: setSearch }}
            options={orders.data?.data.map((o) => ({
              value: o.id,
              label: o.reference,
            }))}
            loading={orders.isFetching}
            notFoundContent={orders.isError ? tr("loadError") : undefined}
          />
        </Form.Item>
        {mutation.isError && <Alert type="error" title={tr("sendError")} />}
      </Form>
    </Modal>
  );
}
