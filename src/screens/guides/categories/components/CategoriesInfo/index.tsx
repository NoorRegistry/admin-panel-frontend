import { IApiError } from "@/api/http";
import { queryClient } from "@/api/queryClient";
import {
  fetchGuideCategories,
  fetchGuideCategory,
  patchGuideCategory,
  postGuideCategory,
} from "@/services/guides.service";
import { EQueryKeys, IGuideCategory, TCreateGuideCategory } from "@/types";
import { findCategoryPath } from "@/utils/helper";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Cascader, Drawer, Flex, Form, Input, message } from "antd";
import TextArea from "antd/es/input/TextArea";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { IShowCategoryInfoDrawerConfig } from "../../../guides.types";

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
    queryKey: [EQueryKeys.GUIDE_CATEGORIES, config.categoryId],
    queryFn: ({ queryKey }) => fetchGuideCategory(queryKey[1]!),
    enabled: Boolean(config.categoryId),
  });

  const { data: categories, isFetching: isFetchingCategories } = useQuery({
    queryKey: [EQueryKeys.GUIDE_CATEGORIES],
    queryFn: fetchGuideCategories,
  });

  const createCategoryMutation = useMutation({
    mutationFn: (data: TCreateGuideCategory) => {
      return config.categoryId
        ? patchGuideCategory(config.categoryId, data)
        : postGuideCategory(data);
    },
    onSuccess: (data, variables) => {
      messageApi.success({
        content: t(
          config.categoryId
            ? "guides.categoryEdited"
            : "guides.categoryCreated",
          { name: variables.nameEn },
        ),
      });
      try {
        if (config.categoryId) {
          queryClient.setQueryData<IGuideCategory | undefined>(
            [EQueryKeys.GUIDE_CATEGORIES, config.categoryId],
            (old: any) => {
              return { ...old, ...data };
            },
          );
        }
        queryClient.invalidateQueries({
          queryKey: [EQueryKeys.GUIDE_CATEGORIES],
        });
      } catch (error) {
        console.error("error in guide category create", error);
      }

      onClose();
    },
    onError: (err: IApiError) => {
      messageApi.error({
        content: err.detail,
      });
    },
  });

  const handleCreateCategory = (category: TCreateGuideCategory) => {
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
        title={config.categoryId ? data?.nameEn : t("guides.createCategory")}
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
              form="createGuideCategory"
              loading={createCategoryMutation.isPending}
            >
              {t("common.submit")}
            </Button>
          </Flex>
        }
      >
        <Form<TCreateGuideCategory>
          id="createGuideCategory"
          name="createGuideCategory"
          initialValues={{ countryCode: "+965" }}
          onFinish={handleCreateCategory}
          autoComplete="off"
          layout="vertical"
          form={form}
          clearOnDestroy
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
            <Form.Item<TCreateGuideCategory>
              label={t("common.nameEn")}
              name="nameEn"
              rules={[{ required: true, message: t("common.required") }]}
            >
              <Input />
            </Form.Item>

            <Form.Item<TCreateGuideCategory>
              label={t("common.nameAr")}
              name="nameAr"
              rules={[{ required: true, message: t("common.required") }]}
            >
              <Input />
            </Form.Item>

            <Form.Item<TCreateGuideCategory>
              label={t("common.descriptionEn")}
              name="descriptionEn"
              rules={[{ required: true, message: t("common.required") }]}
            >
              <TextArea autoSize />
            </Form.Item>

            <Form.Item<TCreateGuideCategory>
              label={t("common.descriptionAr")}
              name="descriptionAr"
              rules={[{ required: true, message: t("common.required") }]}
            >
              <TextArea autoSize />
            </Form.Item>

            <Form.Item<TCreateGuideCategory>
              label={t("guides.selectParentCategory")}
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
                placeholder={t("guides.selectCategory")}
              />
            </Form.Item>
          </div>
        </Form>
      </Drawer>
    </div>
  );
}

export default CategoriesInfo;
