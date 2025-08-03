import { IApiError } from "@/api/http";
import { queryClient } from "@/api/queryClient";
import UploadComponent from "@/components/Upload";
import {
  fetchAuthor,
  patchAuthor,
  postAuthor,
} from "@/services/guides.service";
import {
  EQueryKeys,
  IAuthor,
  IPaginatedResponse,
  IShowAuthorInfoDrawerConfig,
  TCreateAuthor,
} from "@/types";
import { normalizeFile, updatePaginatedData } from "@/utils/helper";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Drawer, Flex, Form, Input, message } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

function AuthorsInfo({
  config,
  onClose,
}: {
  config: IShowAuthorInfoDrawerConfig;
  onClose: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const { data, isFetching } = useQuery({
    queryKey: [EQueryKeys.AUTHORS, config.authorId],
    queryFn: ({ queryKey }) => fetchAuthor(queryKey[1]!),
    enabled: Boolean(config.authorId),
  });

  const createAuthorMutation = useMutation({
    mutationFn: (data: TCreateAuthor) => {
      return config.authorId
        ? patchAuthor(config.authorId, data)
        : postAuthor(data);
    },
    onSuccess: (data, variables) => {
      messageApi.success({
        content: t(
          config.authorId ? "guides.authorEdited" : "guides.authorCreated",
          { name: variables.nameEn },
        ),
      });

      if (config.authorId) {
        queryClient.setQueryData<IAuthor | undefined>(
          ["authors", config.authorId],
          (old: any) => {
            return { ...old, ...data };
          },
        );
      }
      queryClient.setQueryData<IPaginatedResponse<IAuthor>>(
        ["authors"],
        (old) => {
          return updatePaginatedData(data, old, config.authorId);
        },
      );
      onClose();
    },
    onError: (err: IApiError) => {
      messageApi.error({
        content: err.detail,
      });
    },
  });

  const handleCreateAuthor = (author: TCreateAuthor) => {
    if (author.image && author.image.length > 0) {
      // @ts-expect-error Name field exists
      author.image = author.image[0].name;
    } else {
      author.image = "";
    }
    createAuthorMutation.mutate(author);
  };

  useEffect(() => {
    if (data) {
      const transformedData = {
        ...data,
        image: data.image
          ? [
              {
                id: data.id,
                path: data.image,
              },
            ]
          : [],
      };
      setTimeout(() => {
        form.setFieldsValue(transformedData);
      });
    }
  }, [data, form]);

  return (
    <div>
      {contextHolder}
      <Drawer
        title={config.authorId ? data?.nameEn : t("guides.createAuthor")}
        placement="right"
        loading={isFetching}
        size="large"
        destroyOnClose
        onClose={onClose}
        open={config.open}
        footer={
          <Flex align="end" justify="end" gap={16}>
            <Button onClick={onClose}>{t("common.cancel")}</Button>
            <Button
              type="primary"
              htmlType="submit"
              form="createAuthor"
              loading={createAuthorMutation.isPending}
              disabled={uploading}
            >
              {t(config.authorId ? "common.update" : "common.submit")}
            </Button>
          </Flex>
        }
      >
        <Form<TCreateAuthor>
          id="createAuthor"
          name="createAuthor"
          clearOnDestroy
          onFinish={handleCreateAuthor}
          onFinishFailed={(error) => {
            console.log("errors", error, form.getFieldsValue());
          }}
          autoComplete="off"
          layout="vertical"
          form={form}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
            <Form.Item<TCreateAuthor>
              label={t("common.nameEn")}
              name="nameEn"
              rules={[{ required: true, message: t("common.required") }]}
            >
              <Input />
            </Form.Item>

            <Form.Item<TCreateAuthor>
              label={t("common.nameAr")}
              name="nameAr"
              rules={[{ required: true, message: t("common.required") }]}
            >
              <Input />
            </Form.Item>
          </div>
          <Form.Item<TCreateAuthor>
            label={t("guides.uploadAuthorImage")}
            name="image"
            valuePropName="fileList"
            getValueFromEvent={normalizeFile}
          >
            <UploadComponent
              type="author"
              dbId={config.authorId}
              onUploadStatusChange={setUploading}
            />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}

export default AuthorsInfo;
