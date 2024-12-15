import { IApiError } from "@/api/http";
import { queryClient } from "@/api/queryClient";
import UploadComponent from "@/components/Upload";
import { fetchStore, patchStore, postStore } from "@/services/stores.service";
import {
  IPaginatedResponse,
  IStore,
  IStoreDetails,
  TCreateStore,
} from "@/types";
import { normalizeFile, updatePaginatedData } from "@/utils/helper";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Button,
  Drawer,
  Flex,
  Form,
  Input,
  InputNumber,
  Select,
  message,
} from "antd";
import TextArea from "antd/es/input/TextArea";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { IShowStoreInfoDrawerConfig } from "../../stores.types";

function StoreInfo({
  config,
  onClose,
}: {
  config: IShowStoreInfoDrawerConfig;
  onClose: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const { data, isFetching } = useQuery({
    queryKey: ["stores", config.storeId],
    queryFn: ({ queryKey }) => fetchStore(queryKey[1]!),
    enabled: Boolean(config.storeId),
  });

  const createStoreMutation = useMutation({
    mutationFn: (data: TCreateStore) => {
      return config.storeId
        ? patchStore(config.storeId, data)
        : postStore(data);
    },
    onSuccess: (data, variables) => {
      messageApi.success({
        content: t(
          config.storeId ? "stores.storeEdited" : "stores.storeCreated",
          { name: variables.nameEn },
        ),
      });
      try {
        queryClient.setQueryData<IStoreDetails | undefined>(
          ["stores", config.storeId],
          (old: any) => {
            return { ...old, ...data };
          },
        );
        queryClient.setQueryData<IPaginatedResponse<IStore>>(
          ["stores"],
          (old) => {
            return updatePaginatedData(data, old, config.storeId);
          },
        );
      } catch (error) {
        console.error(error);
      }

      onClose();
    },
    onError: (err: IApiError) => {
      messageApi.error({
        content: err.detail,
      });
    },
  });

  const handleCreateStore = (store: TCreateStore) => {
    if (store.storeLogo && store.storeLogo.length > 0) {
      // @ts-expect-error Name field exists
      store.storeLogo = store.storeLogo[0].name;
    } else {
      store.storeLogo = "";
    }
    createStoreMutation.mutate(store);
  };

  useEffect(() => {
    if (data) {
      const transformedData = {
        ...data,
        storeLogo: data.storeLogo
          ? [
              {
                id: data.id,
                path: data.storeLogo,
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
        title={config.storeId ? t("stores.editStore") : t("stores.createStore")}
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
              form="createStore"
              loading={createStoreMutation.isPending}
              disabled={uploading}
            >
              {t(config.storeId ? "common.update" : "common.submit")}
            </Button>
          </Flex>
        }
      >
        <Form<TCreateStore>
          id="createStore"
          name="createStore"
          onFinish={handleCreateStore}
          autoComplete="off"
          layout="vertical"
          form={form}
          clearOnDestroy
        >
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            <Form.Item<TCreateStore>
              label={t("stores.nameEn")}
              name="nameEn"
              rules={[{ required: true, message: t("common.required") }]}
            >
              <Input />
            </Form.Item>

            <Form.Item<TCreateStore>
              label={t("stores.nameAr")}
              name="nameAr"
              rules={[{ required: true, message: t("common.required") }]}
            >
              <Input />
            </Form.Item>

            <Form.Item<TCreateStore>
              label={t("stores.descriptionEn")}
              name="descriptionEn"
              rules={[{ required: true, message: t("common.required") }]}
            >
              <TextArea autoSize />
            </Form.Item>

            <Form.Item<TCreateStore>
              label={t("stores.descriptionAr")}
              name="descriptionAr"
              rules={[{ required: true, message: t("common.required") }]}
            >
              <TextArea autoSize />
            </Form.Item>

            <Form.Item<TCreateStore>
              label={t("stores.locationEn")}
              name="locationEn"
              rules={[{ required: true, message: t("common.required") }]}
            >
              <TextArea autoSize />
            </Form.Item>

            <Form.Item<TCreateStore>
              label={t("stores.locationAr")}
              name="locationAr"
              rules={[{ required: true, message: t("common.required") }]}
            >
              <TextArea autoSize />
            </Form.Item>

            <Form.Item<TCreateStore>
              label={t("stores.contact")}
              name="mobileNumber"
              rules={[{ required: true, message: t("common.required") }]}
            >
              <InputNumber
                stringMode
                addonBefore={
                  <Form.Item<TCreateStore>
                    name="countryCode"
                    initialValue="+965"
                    noStyle
                  >
                    <Select
                      options={[{ value: "+965", label: <span>+965</span> }]}
                    />
                  </Form.Item>
                }
                className="!w-full"
              />
            </Form.Item>

            <Form.Item<TCreateStore>
              label={t("stores.email")}
              name="email"
              rules={[
                { required: true, message: t("common.required") },
                { type: "email", message: t("login.enterValidEmail") },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item<TCreateStore>
              label={t("products.uploadProductImages")}
              name="storeLogo"
              valuePropName="fileList"
              getValueFromEvent={normalizeFile}
            >
              <UploadComponent
                type="store"
                dbId={config.storeId}
                onUploadStatusChange={setUploading}
              />
            </Form.Item>
          </div>
        </Form>
      </Drawer>
    </div>
  );
}

export default StoreInfo;
