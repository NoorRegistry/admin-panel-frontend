import { IApiError } from "@/api/http";
import { queryClient } from "@/api/queryClient";
import { IStore, TCreateStore } from "@/types";
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
import { useTranslation } from "react-i18next";
import { fetchStore, postStore } from "../../services/stores.service";
import { IShowStoreInfoDrawerConfig } from "../../stores.types";

function StoreInfo({
  config,
  onClose,
}: {
  config: IShowStoreInfoDrawerConfig;
  onClose: () => void;
}) {
  const [messageApi, contextHolder] = message.useMessage();
  const { t } = useTranslation();
  // Use react-query to fetch data
  const { data, isFetching } = useQuery({
    queryKey: ["store", config.storeId],
    queryFn: ({ queryKey }) => fetchStore(queryKey[1]!),
    enabled: Boolean(config.storeId),
  });
  console.log("store data", data);
  const createStoreMutation = useMutation({
    mutationFn: (data: TCreateStore) => postStore(data),
    onSuccess: (data, variables) => {
      console.log("store created", variables);
      messageApi.success({
        content: t("stores.storeCreated", { name: variables.nameEn }),
      });
      queryClient.setQueryData<IStore[]>(["stores"], (old = []) => [
        data,
        ...old,
      ]);
      onClose();
    },
    onError: (err: IApiError) => {
      messageApi.error({
        content: err.detail,
      });
    },
  });

  const handleCreateStore = (store: TCreateStore) => {
    createStoreMutation.mutate(store);
  };

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
            <Button onClick={onClose}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              form="createStore"
              loading={createStoreMutation.isPending}
            >
              {t("common.submit")}
            </Button>
          </Flex>
        }
      >
        <Form<TCreateStore>
          id="createStore"
          name="createStore"
          initialValues={{ countryCode: "+965" }}
          onFinish={handleCreateStore}
          autoComplete="off"
          layout="vertical"
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
          </div>
        </Form>
      </Drawer>
    </div>
  );
}

export default StoreInfo;
