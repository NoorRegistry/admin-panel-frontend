"use client";
import {
  fetchSupportArticles,
  saveSupportArticle,
  SupportArticle,
  SupportArticleInput,
  supportTopics,
} from "@/services/support.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Switch,
  Table,
  Tag,
} from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
export default function Articles() {
  const { t, i18n } = useTranslation();
  const tr = (key: string) => t(`support.${key}`, { defaultValue: key });
  const query = useQuery({
    queryKey: ["support-articles"],
    queryFn: fetchSupportArticles,
  });
  const [editing, setEditing] = useState<SupportArticle | "new" | null>(null);
  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 16,
        }}
      >
        <Button type="primary" onClick={() => setEditing("new")}>
          {tr("newArticle")}
        </Button>
      </div>
      {query.isError && (
        <Alert
          type="error"
          title={tr("loadError")}
          action={
            <Button onClick={() => void query.refetch()}>{tr("retry")}</Button>
          }
        />
      )}
      <Table
        rowKey="id"
        loading={query.isPending}
        dataSource={query.data}
        columns={[
          {
            title: tr("question"),
            render: (_, a: SupportArticle) =>
              i18n.language.startsWith("ar") ? a.titleAr : a.titleEn,
          },
          { title: tr("topic"), render: (_, a) => tr(`topics.${a.topic}`) },
          {
            title: tr("statusLabel"),
            render: (_, a) => (
              <Tag color={a.published ? "green" : "default"}>
                {tr(a.published ? "published" : "draft")}
              </Tag>
            ),
          },
          {
            title: "",
            render: (_, a) => (
              <Button type="link" onClick={() => setEditing(a)}>
                {tr("edit")}
              </Button>
            ),
          },
        ]}
      />
      {editing && (
        <ArticleEditor
          key={editing === "new" ? "new" : editing.id}
          article={editing === "new" ? undefined : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
function ArticleEditor({
  article,
  onClose,
}: {
  article?: SupportArticle;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const tr = (key: string) => t(`support.${key}`, { defaultValue: key });
  const client = useQueryClient();
  const [form] = Form.useForm<SupportArticleInput>();
  const mutation = useMutation({
    mutationFn: (values: SupportArticleInput) =>
      saveSupportArticle(values, article?.id),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["support-articles"] });
      onClose();
    },
  });
  return (
    <Modal
      open
      width={760}
      title={tr(article ? "editArticle" : "newArticle")}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={mutation.isPending}
      okText={tr("save")}
      cancelText={tr("cancel")}
      mask={{ closable: !mutation.isPending }}
      closable={!mutation.isPending}
      cancelButtonProps={{ disabled: mutation.isPending }}
    >
      <Form
        form={form}
        layout="vertical"
        disabled={mutation.isPending}
        initialValues={
          article || { topic: "ORDERS", published: true, position: 0 }
        }
        onFinish={(v) => mutation.mutate(v)}
      >
        <Form.Item name="topic" label={tr("topic")}>
          <Select
            options={supportTopics.map((value) => ({
              value,
              label: tr(`topics.${value}`),
            }))}
          />
        </Form.Item>
        {(["En", "Ar"] as const).map((lang) => (
          <div key={lang} dir={lang === "Ar" ? "rtl" : "ltr"}>
            <Form.Item
              name={`title${lang}`}
              label={tr(`question${lang}`)}
              rules={[
                {
                  required: true,
                  whitespace: true,
                  min: 2,
                  message: tr("required"),
                },
              ]}
            >
              <Input maxLength={180} />
            </Form.Item>
            <Form.Item
              name={`body${lang}`}
              label={tr(`answer${lang}`)}
              rules={[
                {
                  required: true,
                  whitespace: true,
                  min: 2,
                  message: tr("required"),
                },
              ]}
            >
              <Input.TextArea rows={4} maxLength={12000} />
            </Form.Item>
          </div>
        ))}
        <Space align="start">
          <Form.Item
            name="published"
            valuePropName="checked"
            label={tr("published")}
          >
            <Switch />
          </Form.Item>
          <Form.Item name="position" label={tr("position")}>
            <InputNumber min={0} max={10000} />
          </Form.Item>
        </Space>
        {mutation.isError && <Alert type="error" title={tr("updateError")} />}
      </Form>
    </Modal>
  );
}
