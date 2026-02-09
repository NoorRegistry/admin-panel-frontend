import { IApiError } from "@/api/http";
import { queryClient } from "@/api/queryClient";
import { useTableScroll } from "@/hooks/useTableScroll";
import { IShowRegistryCategoryInfoDrawerConfig } from "@/screens/registries/registries.types";
import {
  deleteRegistryCategory,
  fetchRegistryCategories,
  patchRegistryCategory,
} from "@/services/registries.service";
import {
  ColumnsType,
  EAdminRole,
  EQueryKeys,
  IRegistryCategory,
} from "@/types";
import { getAdminRole } from "@/utils/helper";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import {
  Button,
  Image,
  Popconfirm,
  Space,
  Switch,
  Table,
  Typography,
  message,
} from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import CategoriesInfo from "../CategoriesInfo";

function CategoriesTable() {
  const { t } = useTranslation();
  const { tableRef, scroll } = useTableScroll();
  const [messageApi, contextHolder] = message.useMessage();
  const [openCategoryInfo, setOpenCategoryInfo] =
    useState<IShowRegistryCategoryInfoDrawerConfig>({
      open: false,
    });

  const isInternalAdmin = getAdminRole() === EAdminRole.INTERNAL_ADMIN;

  const { data, isFetching } = useQuery({
    queryKey: [EQueryKeys.REGISTRY_CATEGORIES],
    queryFn: fetchRegistryCategories,
    placeholderData: keepPreviousData,
  });

  const updateCategoryMutation = useMutation({
    mutationFn: (value: {
      categoryId: string;
      payload: Partial<IRegistryCategory>;
    }) => {
      return patchRegistryCategory(value.categoryId, value.payload);
    },
    onSuccess: (updatedCategory) => {
      messageApi.success({
        content: updatedCategory.isActive
          ? t("registries.categoryActivated", { name: updatedCategory.nameEn })
          : t("registries.categoryDeactivated", {
              name: updatedCategory.nameEn,
            }),
      });
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

  const deleteCategoryMutation = useMutation({
    mutationFn: (category: IRegistryCategory) => {
      return deleteRegistryCategory(category.id);
    },
    onSuccess: (_, category) => {
      messageApi.success({
        content: t("registries.categoryDeleted", { name: category.nameEn }),
      });
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

  const columns: ColumnsType<IRegistryCategory> = [
    {
      title: t("registries.image"),
      key: "image",
      width: 120,
      align: "center",
      render: (_, record) => {
        const imagePath =
          record.registryBackground ?? record.registryPlaceHolder;

        return imagePath ? (
          <div onClick={(event) => event.stopPropagation()}>
            <Image
              src={`${process.env.NEXT_PUBLIC_ASSET_URL}${imagePath}`}
              alt={record.nameEn}
              width={36}
              height={36}
              preview={false}
              className="rounded-lg object-contain"
            />
          </div>
        ) : (
          "-"
        );
      },
    },
    {
      title: t("common.nameEn"),
      dataIndex: "nameEn",
      key: "nameEn",
      align: "start",
    },
    {
      title: t("common.nameAr"),
      dataIndex: "nameAr",
      key: "nameAr",
      align: "start",
    },
    {
      title: t("common.active"),
      dataIndex: "isActive",
      key: "isActive",
      align: "center",
      width: 120,
      render: (value, record) => (
        <div onClick={(event) => event.stopPropagation()}>
          <Switch
            checked={value}
            disabled={!isInternalAdmin}
            loading={updateCategoryMutation.isPending}
            onChange={(checked) => {
              updateCategoryMutation.mutate({
                categoryId: record.id,
                payload: { isActive: checked },
              });
            }}
          />
        </div>
      ),
    },
    {
      title: "",
      key: "action",
      align: "center",
      width: 120,
      render: (_, record) =>
        isInternalAdmin ? (
          <Space size="small" onClick={(event) => event.stopPropagation()}>
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() =>
                setOpenCategoryInfo({ open: true, categoryId: record.id })
              }
            />
            <Popconfirm
              title={t("common.confirm")}
              description={t("registries.confirmDeleteCategory", {
                name: record.nameEn,
              })}
              onConfirm={() => {
                deleteCategoryMutation.mutate(record);
              }}
              okButtonProps={{ danger: true }}
            >
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                loading={deleteCategoryMutation.isPending}
              />
            </Popconfirm>
          </Space>
        ) : (
          "-"
        ),
    },
  ];

  const showCategoryInfo = () => {
    setOpenCategoryInfo({ open: true });
  };

  return (
    <>
      {contextHolder}
      <div className="flex flex-row justify-between items-center">
        <div>
          <Typography.Title level={4} className="!m-0">
            {t("registries.categories")}
          </Typography.Title>
        </div>
        {isInternalAdmin && (
          <div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={showCategoryInfo}
            >
              {t("registries.createCategory")}
            </Button>
          </div>
        )}
      </div>
      <div className="my-6">
        <Table<IRegistryCategory>
          ref={tableRef}
          dataSource={data}
          columns={columns}
          loading={isFetching}
          sticky={{ offsetHeader: 10 }}
          scroll={scroll}
          pagination={{
            total: data?.length,
            showSizeChanger: false,
            showTotal: (total, range) =>
              t("common.showTotal", {
                total: total,
                start: range[0],
                end: range[1],
              }),
          }}
          rowKey={(row) => row.id}
          onRow={(record) => {
            return {
              onClick: () => {
                if (!isInternalAdmin) return;
                setOpenCategoryInfo({ open: true, categoryId: record.id });
              },
            };
          }}
        />
        <CategoriesInfo
          config={openCategoryInfo}
          onClose={() => setOpenCategoryInfo({ open: false })}
        />
      </div>
    </>
  );
}

export default CategoriesTable;
