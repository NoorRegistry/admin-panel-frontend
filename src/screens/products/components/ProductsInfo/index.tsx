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
  EQueryKeys,
  IPaginatedResponse,
  IProduct,
  IQueryState,
  TCreateProduct,
} from "@/types";
import {
  findCategoryPath,
  getAdminRole,
  getAdminStoreId,
  normalizeFile,
  updatePaginatedData,
} from "@/utils/helper";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Button,
  Cascader,
  Drawer,
  Flex,
  Form,
  Input,
  InputNumber,
  Select,
  Tag,
  message,
} from "antd";
import TextArea from "antd/es/input/TextArea";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { IShowProductInfoDrawerConfig } from "../../products.types";

function ProductsInfo({
  config,
  onClose,
  queryState,
}: {
  config: IShowProductInfoDrawerConfig;
  onClose: () => void;
  queryState: IQueryState;
}) {
  const [uploading, setUploading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const selectedCategoryPaths = Form.useWatch("categoryIds", form) as
    | string[][]
    | undefined;

  const isInternalAdmin = getAdminRole() === EAdminRole.INTERNAL_ADMIN;

  const { data, isFetching } = useQuery({
    queryKey: ["product", config.productId],
    queryFn: ({ queryKey }) => fetchProduct(queryKey[1]!),
    enabled: Boolean(config.productId),
  });

  const { data: stores, isFetching: isFetchingStores } = useQuery({
    queryKey: [EQueryKeys.STORES],
    queryFn: fetchStores,
    enabled: isInternalAdmin,
  });

  const { data: categories, isFetching: isFetchingCategories } = useQuery({
    queryKey: [EQueryKeys.CATEGORIES],
    queryFn: fetchProductCategories,
  });

  const categoryOptions = useMemo(() => {
    const mapOptions = (items: any[] = [], depth = 0): any[] =>
      items.map((item) => ({
        ...item,
        disabled:
          depth === 0 &&
          (!Array.isArray(item.children) || item.children.length === 0),
        children: Array.isArray(item.children)
          ? mapOptions(item.children, depth + 1)
          : undefined,
      }));

    return mapOptions(categories?.data ?? []);
  }, [categories]);

  const selectedCategoryLabels = useMemo(() => {
    if (!Array.isArray(selectedCategoryPaths) || !categories?.data) return [];

    const resolvePathLabel = (path: string[]) => {
      const labels: string[] = [];
      let level: any[] = categories.data;

      for (const id of path) {
        const node = level.find((item) => item.id === id);
        if (!node) break;
        labels.push(node.nameEn);
        level = Array.isArray(node.children) ? node.children : [];
      }

      return labels.join(" > ");
    };

    const normalizedPaths = selectedCategoryPaths
      .filter(
        (path): path is string[] => Array.isArray(path) && path.length > 0,
      )
      .map((path, index) => ({
        path,
        index,
        label: resolvePathLabel(path),
        categoryId: path[path.length - 1],
      }));

    if (!normalizedPaths.length) return [];

    return normalizedPaths.map((item) => ({
      ...item,
      isPrimary: item.index === 0,
    }));
  }, [selectedCategoryPaths, categories]);

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
        [EQueryKeys.PRODUCT, config.productId],
        (old: any) => {
          return { ...old, ...data };
        },
      );
      queryClient.setQueryData<IPaginatedResponse<IProduct>>(
        [EQueryKeys.PRODUCTS, queryState],
        (old) => {
          return updatePaginatedData(data, old, config.productId);
        },
      );
      queryClient.invalidateQueries({
        queryKey: [EQueryKeys.CATEGORIES, isInternalAdmin],
      });
      onClose();
    },
    onError: (err: IApiError) => {
      messageApi.error({
        content: err.detail,
      });
    },
  });

  const handleCreateProduct = (product: TCreateProduct) => {
    if (product.images && Array.isArray(product.images))
      product.images = product.images.map((image) => image.name ?? image.path);
    const selectedCategoryIds = Array.isArray((product as any).categoryIds)
      ? (product as any).categoryIds
          .map((path: string[] | string) =>
            Array.isArray(path) ? path[path.length - 1] : path,
          )
          .filter(Boolean)
      : [];
    product.categoryIds = Array.from(new Set(selectedCategoryIds as string[]));
    createProductMutation.mutate(product);
  };

  useEffect(() => {
    if (data && categories) {
      setTimeout(() => {
        const selectedCategoryIds =
          data.categoryIds && data.categoryIds.length ? data.categoryIds : [];

        const fullPaths = selectedCategoryIds
          .map((categoryId) => findCategoryPath(categories.data, categoryId))
          .filter((path) => path.length > 1);

        form.setFieldsValue({
          ...data,
          categoryIds: fullPaths,
        });
      });
    }
  }, [data, categories, form]);

  return (
    <div>
      {contextHolder}
      <Drawer
        title={config.productId ? data?.nameEn : t("products.createProduct")}
        placement="right"
        loading={isFetching || isFetchingCategories}
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
              initialValue={!isInternalAdmin ? getAdminStoreId() : ""}
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
              label={t("products.categories")}
              name="categoryIds"
              rules={[{ required: true, message: t("common.required") }]}
              className="col-span-2"
            >
              <Cascader
                className="w-full"
                placement="bottomRight"
                fieldNames={{ label: "nameEn", value: "id" }}
                options={categoryOptions}
                multiple
                showSearch={{
                  // Custom filter to match any part of the label
                  filter: (inputValue, path) => {
                    return path.some(
                      (option) =>
                        option.nameEn
                          .toLowerCase()
                          .includes(inputValue.toLowerCase()) ||
                        option.nameAr
                          .toLowerCase()
                          .includes(inputValue.toLowerCase()),
                    );
                  },
                  // Renders the search path in the dropdown
                  render: (_, path) => {
                    return path.map(({ nameEn }) => nameEn).join(" > ");
                  },
                  // Optional: limit the number of search results
                  limit: 5,
                }}
                placeholder={t("products.selectCategory")}
              />
            </Form.Item>
            {selectedCategoryLabels.length > 0 && (
              <div className="col-span-2 -mt-2 mb-2 flex flex-wrap gap-2">
                {selectedCategoryLabels.map((item) => (
                  <div key={`${item.path.join("-")}-${item.index}`}>
                    <Tag>{item.label}</Tag>
                    {item.isPrimary && <Tag color="blue">Primary</Tag>}
                  </div>
                ))}
              </div>
            )}
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
