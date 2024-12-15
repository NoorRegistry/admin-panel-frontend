import { IApiError } from "@/api/http";
import { queryClient } from "@/api/queryClient";
import {
  fetchProductCategory,
  patchProductCategory,
  postProductCategory,
} from "@/services/product.service";
import { EAdminRole, IProductCategory, TCreateProductCategory } from "@/types";
import { getAdminRole } from "@/utils/helper";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Drawer, Flex, Form, Input, message } from "antd";
import TextArea from "antd/es/input/TextArea";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { IShowCategoryInfoDrawerConfig } from "../../../products.types";

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

  const isInternalAdmin = getAdminRole() === EAdminRole.INTERNAL_ADMIN;

  const { data, isFetching } = useQuery({
    queryKey: ["categories", config.categoryId],
    queryFn: ({ queryKey }) => fetchProductCategory(queryKey[1]!),
    enabled: Boolean(config.categoryId),
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
          queryKey: ["categories", isInternalAdmin],
        });
        /* queryClient.setQueryData<IPaginatedResponse<IProductCategory>>(
          ["categories", isInternalAdmin],
          (old) => updatePaginatedData(data, old, config.categoryId),
        ); */
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

  const handleCreateCategory = (store: TCreateProductCategory) => {
    createCategoryMutation.mutate(store);
  };

  useEffect(() => {
    if (data) {
      setTimeout(() => {
        form.setFieldsValue(data);
      });
    }
  }, [data, form]);

  return (
    <div>
      {contextHolder}
      <Drawer
        title={config.categoryId ? data?.nameEn : t("products.createCategory")}
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
              <Input />
            </Form.Item>

            <Form.Item<TCreateProductCategory>
              label={t("common.nameAr")}
              name="nameAr"
              rules={[{ required: true, message: t("common.required") }]}
            >
              <Input />
            </Form.Item>

            <Form.Item<TCreateProductCategory>
              label={t("common.descriptionEn")}
              name="descriptionEn"
              rules={[{ required: true, message: t("common.required") }]}
            >
              <TextArea autoSize />
            </Form.Item>

            <Form.Item<TCreateProductCategory>
              label={t("common.descriptionAr")}
              name="descriptionAr"
              rules={[{ required: true, message: t("common.required") }]}
            >
              <TextArea autoSize />
            </Form.Item>
          </div>
        </Form>
      </Drawer>
    </div>
  );
}

export default CategoriesInfo;
