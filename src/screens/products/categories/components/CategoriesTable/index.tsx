import { useTableScroll } from "@/hooks/useTableScroll";
import { IShowCategoryInfoDrawerConfig } from "@/screens/products/products.types";
import { fetchProductCategories } from "@/services/product.service";
import { ColumnsType, IProductCategory } from "@/types";
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

  const { data, isFetching } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchProductCategories,
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
        <div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showCategoryInfo}
          >
            {t("products.createCategory")}
          </Button>
        </div>
      </div>
      <div className="my-6">
        <Table<IProductCategory>
          ref={tableRef}
          dataSource={data?.data}
          columns={columns}
          loading={isFetching}
          sticky={{ offsetHeader: 88 }}
          scroll={scroll}
          rowKey={(row) => row.id}
          pagination={false}
          virtual
          onRow={(record) => {
            return {
              onClick: () => {
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
