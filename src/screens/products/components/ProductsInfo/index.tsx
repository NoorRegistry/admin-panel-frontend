import { IApiError } from "@/api/http";
import { queryClient } from "@/api/queryClient";
import UploadComponent from "@/components/Upload";
import {
  fetchProduct,
  fetchProductCategories,
  patchProduct,
  postProduct,
} from "@/services/product.service";
import { fetchStores } from "@/services/stores.service";
import {
  EAdminRole,
  IPaginatedResponse,
  IProduct,
  TCreateProduct,
} from "@/types";
import {
  getAdminRole,
  normalizeFile,
  updatePaginatedData,
} from "@/utils/helper";
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
import { IShowProductInfoDrawerConfig } from "../../products.types";

function ProductsInfo({
  config,
  onClose,
}: {
  config: IShowProductInfoDrawerConfig;
  onClose: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const isInternalAdmin = getAdminRole() === EAdminRole.INTERNAL_ADMIN;

  const { data, isFetching } = useQuery({
    queryKey: ["products", config.productId],
    queryFn: ({ queryKey }) => fetchProduct(queryKey[1]!),
    enabled: Boolean(config.productId),
  });

  const { data: stores, isFetching: isFetchingStores } = useQuery({
    queryKey: ["stores"],
    queryFn: fetchStores,
    enabled: isInternalAdmin,
  });

  const { data: categories, isFetching: isFetchingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchProductCategories,
  });

  const createProductMutation = useMutation({
    mutationFn: (data: TCreateProduct) => {
      return config.productId
        ? patchProduct(config.productId, data)
        : postProduct(data);
    },
    onSuccess: (data, variables) => {
      messageApi.success({
        content: t(
          config.productId
            ? "products.productEdited"
            : "products.productCreated",
          { name: variables.nameEn },
        ),
      });
      queryClient.setQueryData<IProduct | undefined>(
        ["products", config.productId],
        (old: any) => {
          return { ...old, ...data };
        },
      );
      queryClient.setQueryData<IPaginatedResponse<IProduct>>(
        ["products"],
        (old) => {
          return updatePaginatedData(data, old, config.productId);
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

  const handleCreateProduct = (product: TCreateProduct) => {
    product.images = product.images.map((image) => image.name ?? image.path);
    createProductMutation.mutate(product);
  };

  useEffect(() => {
    if (data) {
      setTimeout(() => {
        form.setFieldsValue(data);
      });
    }
  }, [data]);

  return (
    <div>
      {contextHolder}
      <Drawer
        title={config.productId ? data?.nameEn : t("products.createProduct")}
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
              loading={createProductMutation.isPending}
              disabled={uploading}
            >
              {t(config.productId ? "common.update" : "common.submit")}
            </Button>
          </Flex>
        }
      >
        <Form<TCreateProduct>
          id="createStore"
          name="createStore"
          clearOnDestroy
          onFinish={handleCreateProduct}
          onFinishFailed={(error) => {
            console.log("errors", error, form.getFieldsValue());
          }}
          autoComplete="off"
          layout="vertical"
          form={form}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
            <Form.Item<TCreateProduct>
              label={t("stores.nameEn")}
              name="nameEn"
              rules={[{ required: true, message: t("common.required") }]}
            >
              <Input />
            </Form.Item>

            <Form.Item<TCreateProduct>
              label={t("stores.nameAr")}
              name="nameAr"
              rules={[{ required: true, message: t("common.required") }]}
            >
              <Input />
            </Form.Item>

            <Form.Item<TCreateProduct>
              label={t("stores.descriptionEn")}
              name="descriptionEn"
              rules={[{ required: true, message: t("common.required") }]}
            >
              <TextArea autoSize />
            </Form.Item>

            <Form.Item<TCreateProduct>
              label={t("stores.descriptionAr")}
              name="descriptionAr"
              rules={[{ required: true, message: t("common.required") }]}
            >
              <TextArea autoSize />
            </Form.Item>

            <Form.Item<TCreateProduct>
              label={t("products.price")}
              name="price"
              rules={[{ required: true, message: t("common.required") }]}
            >
              <InputNumber className="!w-full" />
            </Form.Item>

            <Form.Item<TCreateProduct>
              label={t("products.qty")}
              name="qty"
              rules={[{ required: true, message: t("common.required") }]}
            >
              <InputNumber className="!w-full" />
            </Form.Item>

            <Form.Item<TCreateProduct>
              label={t("stores.store")}
              name="storeId"
              rules={[{ required: true, message: t("common.required") }]}
              hidden={getAdminRole() === EAdminRole.STORE_ADMIN}
            >
              <Select
                loading={isFetchingStores}
                showSearch
                placeholder={t("products.selectStore")}
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase()) ||
                  (option?.name ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={
                  stores
                    ? stores?.data.map((store) => {
                        return {
                          value: store.id,
                          label: store.nameEn,
                          name: store.nameAr,
                        };
                      })
                    : []
                }
              />
            </Form.Item>

            <Form.Item<TCreateProduct>
              label={t("products.category")}
              name="categoryId"
              rules={[{ required: true, message: t("common.required") }]}
            >
              <Select
                loading={isFetchingCategories}
                showSearch
                placeholder={t("products.selectCategory")}
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase()) ||
                  (option?.name ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={
                  categories
                    ? categories?.data.map((category) => {
                        return {
                          value: category.id,
                          label: category.nameEn,
                          name: category.nameAr,
                        };
                      })
                    : []
                }
              />
            </Form.Item>
          </div>
          <Form.Item<TCreateProduct>
            label={t("products.uploadProductImages")}
            name="images"
            valuePropName="fileList"
            getValueFromEvent={normalizeFile}
          >
            <UploadComponent
              type="product"
              dbId={config.productId}
              onUploadStatusChange={setUploading}
            />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}

export default ProductsInfo;
