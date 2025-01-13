import { IApiError } from "@/api/http";
import { queryClient } from "@/api/queryClient";
import {
  fetchProductCategories,
  fetchProductCategory,
  patchProductCategory,
  postProductCategory,
} from "@/services/product.service";
import { IProductCategory, TCreateProductCategory } from "@/types";
import { findCategoryPath } from "@/utils/helper";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Cascader, Drawer, Flex, Form, Input, message } from "antd";
import TextArea from "antd/es/input/TextArea";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { IShowCategoryInfoDrawerConfig } from "../../../products.types";
import formValidations from "@/constants/formValidations";

function CategoriesInfo({
  config,
  onClose,
}: {
  config: IShowCategoryInfoDrawerConfig;
  onClose: () => void;
}) {
  const [messageApi, contextHolder] = message.useMessage();
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const { data, isFetching } = useQuery({
    queryKey: ["categories", config.categoryId],
    queryFn: ({ queryKey }) => fetchProductCategory(queryKey[1]!),
    enabled: Boolean(config.categoryId),
  });

  const { data: categories, isFetching: isFetchingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchProductCategories,
  });

  const createCategoryMutation = useMutation({
    mutationFn: (data: TCreateProductCategory) => {
      return config.categoryId
        ? patchProductCategory(config.categoryId, data)
        : postProductCategory(data);
    },
    onSuccess: (data, variables) => {
      console.log("product category created", variables);
      messageApi.success({
        content: t(
          config.categoryId
            ? "products.categoryEdited"
            : "products.categoryCreated",
          { name: variables.nameEn },
        ),
      });
      try {
        queryClient.setQueryData<IProductCategory | undefined>(
          ["categories", config.categoryId],
          (old: any) => {
            return { ...old, ...data };
          },
        );
        queryClient.invalidateQueries({
          queryKey: ["categories"],
        });
      } catch (error) {
        console.error("error in product category create", error);
      }

      onClose();
    },
    onError: (err: IApiError) => {
      messageApi.error({
        content: err.detail,
      });
    },
  });

  const handleCreateCategory = (category: TCreateProductCategory) => {
    if (Array.isArray(category.parentId)) {
      category.parentId = category.parentId[category.parentId.length - 1];
    }
    createCategoryMutation.mutate(category);
  };

  useEffect(() => {
    if (data && categories) {
      setTimeout(() => {
        // Use the saved last ID to reconstruct the full path
        if (data.parentId) {
          const fullPath = findCategoryPath(categories.data, data.parentId);
          form.setFieldsValue({ ...data, parentId: fullPath });
        } else {
          form.setFieldsValue(data);
        }
      });
    }
  }, [data, form, categories]);

  return (
    <div>
      {contextHolder}
      <Drawer
        title={config.categoryId ? data?.nameEn : t("products.createCategory")}
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
              loading={createCategoryMutation.isPending}
            >
              {t("common.submit")}
            </Button>
          </Flex>
        }
      >
        <Form<TCreateProductCategory>
          id="createStore"
          name="createStore"
          initialValues={{ countryCode: "+965" }}
          onFinish={handleCreateCategory}
          autoComplete="off"
          layout="vertical"
          form={form}
          clearOnDestroy
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
            <Form.Item<TCreateProductCategory>
              label={t("common.nameEn")}
              name="nameEn"
              rules={[{ required: true, message: t("common.required") }]}
            >
              <Input maxLength={formValidations?.productCategory?.name} />
            </Form.Item>

            <Form.Item<TCreateProductCategory>
              label={t("common.nameAr")}
              name="nameAr"
              rules={[{ required: true, message: t("common.required") }]}
            >
              <Input maxLength={formValidations?.productCategory?.name} />
            </Form.Item>

            <Form.Item<TCreateProductCategory>
              label={t("common.descriptionEn")}
              name="descriptionEn"
              rules={[{ required: true, message: t("common.required") }]}
            >
              <TextArea autoSize maxLength={formValidations?.productCategory?.description} />
            </Form.Item>

            <Form.Item<TCreateProductCategory>
              label={t("common.descriptionAr")}
              name="descriptionAr"
              rules={[{ required: true, message: t("common.required") }]}
            >
              <TextArea autoSize maxLength={formValidations?.productCategory?.description} />
            </Form.Item>

            <Form.Item<TCreateProductCategory>
              label={t("products.selectParentCategory")}
              name="parentId"
              className="col-span-2"
            >
              <Cascader
                className="w-full"
                placement="bottomRight"
                fieldNames={{ label: "nameEn", value: "id" }}
                options={categories?.data}
                changeOnSelect
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
          </div>
        </Form>
      </Drawer>
    </div>
  );
}

export default CategoriesInfo;
