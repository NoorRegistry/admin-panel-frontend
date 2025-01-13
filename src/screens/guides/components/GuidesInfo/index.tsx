import { IApiError } from "@/api/http";
import { queryClient } from "@/api/queryClient";
import UploadComponent from "@/components/Upload";
import {
  IGuide,
  IPaginatedResponse,
  IQueryState,
  TCreateGuide,
} from "@/types";
import {
  findGuideCategoryPath,
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
  Select,
  message,
} from "antd";
import TextArea from "antd/es/input/TextArea";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { IShowGuideInfoDrawerConfig } from "../../guides.types";
import {
  fetchAuthors,
  fetchGuide,
  fetchGuideCategories,
  patchGuide,
  postGuide,
} from "@/services/guides.service";
import dynamic from "next/dynamic";

function GuidesInfo({
  config,
  onClose,
  queryState,
}: {
  config: IShowGuideInfoDrawerConfig;
  onClose: () => void;
  queryState: IQueryState;
}) {
  const GuideEditor = dynamic(() => import("@/components/EditorJs"), {
    ssr: false,
  });

  const [uploading, setUploading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const { data, isFetching } = useQuery({
    queryKey: ["guides", config.guideId],
    queryFn: ({ queryKey }) => fetchGuide(queryKey[1]!),
    enabled: Boolean(config.guideId),
  });

  const { data: authors, isFetching: isFetchingAuthors } = useQuery({
    queryKey: ["authors"],
    queryFn: fetchAuthors,
  });

  const { data: categories, isFetching: isFetchingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchGuideCategories,
  });

  const createGuideMutation = useMutation({
    mutationFn: (data: TCreateGuide) => {
      return config.guideId
        ? patchGuide(config.guideId, data)
        : postGuide(data);
    },
    onSuccess: (data, variables) => {
      messageApi.success({
        content: t(
          config.guideId ? "guides.guideEdited" : "guides.guideCreated",
          { name: variables.nameEn }
        ),
      });
      if (config.guideId) {
        queryClient.setQueryData<IGuide | undefined>(
          ["guides", config.guideId],
          (old: any) => {
            return { ...old, ...data };
          }
        );
      }
      queryClient.setQueryData<IPaginatedResponse<IGuide>>(
        ["guides", queryState],
        (old) => {
          return updatePaginatedData(data, old, config.guideId);
        }
      );
      queryClient.invalidateQueries({
        queryKey: ["categories"],
      });
      onClose();
    },
    onError: (err: IApiError) => {
      messageApi.error({
        content: err.detail,
      });
    },
  });

  const handleCreateGuide = (guide: TCreateGuide) => {
    if (guide.bannerImage && guide.bannerImage.length > 0) {
      // @ts-expect-error Name field exists
      guide.bannerImage = guide.bannerImage[0].name;
    } else {
      guide.bannerImage = "";
    }

    if (Array.isArray(guide.categoryId)) {
      guide.categoryId = guide.categoryId[guide.categoryId.length - 1];
    }

    createGuideMutation.mutate(guide);
  };

  useEffect(() => {
    if (data && categories) {
      const fullPath = findGuideCategoryPath(categories?.data, data.categoryId);
      const transformedData = {
        ...data,
        categoryId: fullPath,
        bannerImage: data.bannerImage
          ? [
              {
                id: data.id,
                path: data.bannerImage,
              },
            ]
          : [],
      };
      setTimeout(() => {
        form.setFieldsValue(transformedData);
      });
    }
  }, [data, categories]);

  return (
    <div>
      {contextHolder}
      <Drawer
        title={config.guideId ? data?.nameEn : t("guides.createGuide")}
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
              form="createGuide"
              loading={createGuideMutation.isPending}
              disabled={uploading}
            >
              {t(config.guideId ? "common.update" : "common.submit")}
            </Button>
          </Flex>
        }
      >
        <Form<TCreateGuide>
          id="createGuide"
          name="createGuide"
          clearOnDestroy
          onFinish={handleCreateGuide}
          onFinishFailed={(error) => {
            console.log("errors", error, form.getFieldsValue());
          }}
          autoComplete="off"
          layout="vertical"
          form={form}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
            <Form.Item<TCreateGuide>
              label={t("stores.nameEn")}
              name="nameEn"
              rules={[{ required: true, message: t("common.required") }]}
            >
              <Input />
            </Form.Item>

            <Form.Item<TCreateGuide>
              label={t("stores.nameAr")}
              name="nameAr"
              rules={[{ required: true, message: t("common.required") }]}
            >
              <Input />
            </Form.Item>

            <Form.Item<TCreateGuide>
              label={t("stores.descriptionEn")}
              name="descriptionEn"
              rules={[{ required: true, message: t("common.required") }]}
            >
              <TextArea autoSize />
            </Form.Item>

            <Form.Item<TCreateGuide>
              label={t("stores.descriptionAr")}
              name="descriptionAr"
              rules={[{ required: true, message: t("common.required") }]}
            >
              <TextArea autoSize />
            </Form.Item>

            <Form.Item<TCreateGuide>
              label={t("guides.author")}
              name="authorId"
              rules={[{ required: true, message: t("common.required") }]}
            >
              <Select
                loading={isFetchingAuthors}
                showSearch
                placeholder={t("guides.selectAuthor")}
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase()) ||
                  (option?.name ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={
                  authors
                    ? authors?.data.map((author) => {
                        return {
                          value: author.id,
                          label: author.nameEn,
                          name: author.nameAr,
                        };
                      })
                    : []
                }
              />
            </Form.Item>

            <Form.Item<TCreateGuide>
              label={t("products.category")}
              name="categoryId"
              rules={[{ required: true, message: t("common.required") }]}
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
                          .includes(inputValue.toLowerCase())
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
          <Form.Item<TCreateGuide>
            label={t("guides.uploadGuideLogo")}
            name="bannerImage"
            valuePropName="fileList"
            getValueFromEvent={normalizeFile}
          >
            <UploadComponent
              type="guide"
              dbId={config.guideId}
              onUploadStatusChange={setUploading}
            />
          </Form.Item>

          <Form.Item<TCreateGuide>
            label={t("guides.contentEn")}
            name="contentEn"
            className="col-span-2"
          >
            <GuideEditor
              value={form.getFieldValue("contentEn")}
              onChange={(value) => form.setFieldsValue({ contentEn: value })}
              guideId={config.guideId ?? ""}
              editorId="editor1"
              editorlang="en"
            />
          </Form.Item>

          <Form.Item<TCreateGuide>
            label={t("guides.contentAr")}
            name="contentAr"
            className="col-span-2"
          >
            <GuideEditor
              value={form.getFieldValue("contentAr")}
              onChange={(value) => form.setFieldsValue({ contentEn: value })}
              guideId={config.guideId ?? ""}
              editorId="editor2"
              editorlang="ar"
            />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}

export default GuidesInfo;
