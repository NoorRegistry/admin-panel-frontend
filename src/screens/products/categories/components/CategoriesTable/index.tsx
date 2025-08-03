import { useTableScroll } from "@/hooks/useTableScroll";
import { IShowCategoryInfoDrawerConfig } from "@/screens/products/products.types";
import {
  fetchProductCategories,
  fetchProductCategoriesForStore,
} from "@/services/product.service";
import { ColumnsType, EAdminRole, EQueryKeys, IProductCategory } from "@/types";
import { getAdminRole, getAdminStoreId } from "@/utils/helper";
import { PlusOutlined } from "@ant-design/icons";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Button, Table, Typography } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import CategoriesInfo from "../CategoriesInfo";

function CategoriesTable() {
  const { t } = useTranslation();
  const { tableRef, scroll } = useTableScroll();
  const [openCategoryInfo, setOpenCategoryInfo] =
    useState<IShowCategoryInfoDrawerConfig>({
      open: false,
    });

  const isInternalAdmin = getAdminRole() === EAdminRole.INTERNAL_ADMIN;

  const { data, isFetching } = useQuery({
    queryKey: [EQueryKeys.CATEGORIES, isInternalAdmin],
    queryFn: () => {
      if (isInternalAdmin) {
        return fetchProductCategories(); // fetch all categories for internal admin
      }
      const storeId = getAdminStoreId(); // Pass your parameter here
      return fetchProductCategoriesForStore(storeId!); // Fetch store specific categories for store admin
    },
    placeholderData: keepPreviousData,
  });

  const columns: ColumnsType<IProductCategory> = [
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
      title: t("products.totalProducts"),
      dataIndex: ["_count", "products"],
      key: "totalProducts",
      width: 150,
      align: "center",
    },
  ];

  const showCategoryInfo = () => {
    setOpenCategoryInfo({ open: true });
  };

  return (
    <>
      <div className="flex flex-row justify-between items-center">
        <div>
          <Typography.Title level={4} className="!m-0">
            {t("products.categories")}
          </Typography.Title>
        </div>
        {isInternalAdmin && (
          <div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={showCategoryInfo}
            >
              {t("products.createCategory")}
            </Button>
          </div>
        )}
      </div>
      <div className="my-6">
        <Table<IProductCategory>
          ref={tableRef}
          dataSource={data?.data}
          columns={columns}
          loading={isFetching}
          sticky={{ offsetHeader: 10 }}
          scroll={scroll}
          pagination={{
            total: data?.total,
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
