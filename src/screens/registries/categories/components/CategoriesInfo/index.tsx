import { IApiError } from "@/api/http";
import { queryClient } from "@/api/queryClient";
import UploadComponent from "@/components/Upload";
import {
  fetchRegistryCategory,
  patchRegistryCategory,
  postRegistryCategory,
} from "@/services/registries.service";
import {
  EQueryKeys,
  IRegistryCategory,
  TCreateRegistryCategory,
} from "@/types";
import { normalizeFile } from "@/utils/helper";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Drawer, Flex, Form, Input, message } from "antd";
import TextArea from "antd/es/input/TextArea";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { IShowRegistryCategoryInfoDrawerConfig } from "../../../registries.types";

interface TCreateRegistryCategoryFormValues
  extends Omit<
    TCreateRegistryCategory,
    "registryBackground" | "registryPlaceHolder"
  > {
  registryBackground?: any[];
}

function CategoriesInfo({
  config,
  onClose,
}: {
  config: IShowRegistryCategoryInfoDrawerConfig;
  onClose: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const { data, isFetching } = useQuery({
    queryKey: [EQueryKeys.REGISTRY_CATEGORIES, config.categoryId],
    queryFn: ({ queryKey }) => fetchRegistryCategory(queryKey[1]!),
    enabled: Boolean(config.categoryId),
  });

  const saveCategoryMutation = useMutation({
    mutationFn: (data: TCreateRegistryCategory) => {
      return config.categoryId
        ? patchRegistryCategory(config.categoryId, data)
        : postRegistryCategory(data);
    },
    onSuccess: (savedCategory, variables) => {
      messageApi.success({
        content: t(
          config.categoryId
            ? "registries.categoryEdited"
            : "registries.categoryCreated",
          {
            name: variables.nameEn,
          },
        ),
      });

      if (config.categoryId) {
        queryClient.setQueryData<IRegistryCategory | undefined>(
          [EQueryKeys.REGISTRY_CATEGORIES, config.categoryId],
          (old: any) => {
            return { ...old, ...savedCategory };
          },
        );
      }

      queryClient.invalidateQueries({
        queryKey: [EQueryKeys.REGISTRY_CATEGORIES],
      });
      onClose();
      form.resetFields();
    },
    onError: (err: IApiError) => {
      messageApi.error({
        content: err.detail,
      });
    },
  });

  const updateCategoryImageMutation = useMutation({
    mutationFn: (imagePath: string) => {
      if (!config.categoryId) {
        throw new Error("Category id is required for image update");
      }

      return patchRegistryCategory(config.categoryId, {
        registryBackground: imagePath,
        registryPlaceHolder: imagePath,
      });
    },
    onSuccess: (updatedCategory) => {
      if (!config.categoryId) return;

      queryClient.setQueryData<IRegistryCategory | undefined>(
        [EQueryKeys.REGISTRY_CATEGORIES, config.categoryId],
        (old: any) => {
          return { ...old, ...updatedCategory };
        },
      );
      queryClient.invalidateQueries({
        queryKey: [EQueryKeys.REGISTRY_CATEGORIES],
      });
    },
    onError: (err: IApiError) => {
      messageApi.error({
        content: err.detail,
      });
    },
  });

  const handleCreateCategory = (
    category: TCreateRegistryCategoryFormValues,
  ) => {
    const uploadedImage =
      category.registryBackground?.[0]?.name ??
      category.registryBackground?.[0]?.path ??
      data?.registryBackground ??
      data?.registryPlaceHolder ??
      null;

    saveCategoryMutation.mutate({
      nameEn: category.nameEn,
      nameAr: category.nameAr,
      descriptionEn: category.descriptionEn,
      descriptionAr: category.descriptionAr,
      registryBackground: uploadedImage,
      registryPlaceHolder: uploadedImage,
    });
  };

  const handleImageUploadComplete = (file: {
    name?: string;
    path?: string;
  }) => {
    if (!config.categoryId) return;

    const uploadedImage = file.name ?? file.path;
    if (!uploadedImage) return;

    updateCategoryImageMutation.mutate(uploadedImage);
  };

  useEffect(() => {
    if (!data) return;

    const imagePath = data.registryBackground ?? data.registryPlaceHolder;
    const transformedData = {
      ...data,
      registryBackground: imagePath
        ? [
            {
              id: data.id,
              path: imagePath,
            },
          ]
        : [],
    };

    setTimeout(() => {
      form.setFieldsValue(transformedData);
    });
  }, [data, form]);

  return (
    <div>
      {contextHolder}
      <Drawer
        title={
          config.categoryId ? data?.nameEn : t("registries.createCategory")
        }
        placement="right"
        size="large"
        destroyOnClose
        loading={isFetching}
        onClose={onClose}
        open={config.open}
        footer={
          <Flex align="end" justify="end" gap={16}>
            <Button onClick={onClose}>{t("common.cancel")}</Button>
            <Button
              type="primary"
              htmlType="submit"
              form="createRegistryCategory"
              loading={saveCategoryMutation.isPending}
              disabled={uploading || updateCategoryImageMutation.isPending}
            >
              {t(config.categoryId ? "common.update" : "common.submit")}
            </Button>
          </Flex>
        }
      >
        <Form<TCreateRegistryCategoryFormValues>
          id="createRegistryCategory"
          name="createRegistryCategory"
          onFinish={handleCreateCategory}
          autoComplete="off"
          layout="vertical"
          form={form}
          clearOnDestroy
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
            <Form.Item<TCreateRegistryCategoryFormValues>
              label={t("common.nameEn")}
              name="nameEn"
              rules={[{ required: true, message: t("common.required") }]}
            >
              <Input />
            </Form.Item>

            <Form.Item<TCreateRegistryCategoryFormValues>
              label={t("common.nameAr")}
              name="nameAr"
              rules={[{ required: true, message: t("common.required") }]}
            >
              <Input />
            </Form.Item>

            <Form.Item<TCreateRegistryCategoryFormValues>
              label={t("common.descriptionEn")}
              name="descriptionEn"
              rules={[{ required: true, message: t("common.required") }]}
            >
              <TextArea autoSize />
            </Form.Item>

            <Form.Item<TCreateRegistryCategoryFormValues>
              label={t("common.descriptionAr")}
              name="descriptionAr"
              rules={[{ required: true, message: t("common.required") }]}
            >
              <TextArea autoSize />
            </Form.Item>
          </div>

          <Form.Item<TCreateRegistryCategoryFormValues>
            label={t("registries.uploadCategoryImage")}
            name="registryBackground"
            valuePropName="fileList"
            getValueFromEvent={normalizeFile}
            rules={
              config.categoryId
                ? undefined
                : [{ required: true, message: t("common.required") }]
            }
          >
            <UploadComponent
              type="registryCategory"
              dbId={config.categoryId}
              allowReplaceWithoutRemove={Boolean(config.categoryId)}
              onUploadStatusChange={setUploading}
              onUploadComplete={handleImageUploadComplete}
            />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}

export default CategoriesInfo;
