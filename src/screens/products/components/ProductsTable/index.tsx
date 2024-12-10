import { useTableScroll } from "@/hooks/useTableScroll";
import { ColumnsType, IProduct } from "@/types";
import { PlusOutlined } from "@ant-design/icons";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Button, Table, Typography } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { IShowProductInfoDrawerConfig } from "../../products.types";
import { fetchProducts } from "../../services/product.service";
import ProductsInfo from "../ProductsInfo";

function ProductsTable() {
  const { t } = useTranslation();
  const [openProductInfo, setOpenProductInfo] =
    useState<IShowProductInfoDrawerConfig>({
      open: false,
    });

  const showProductInfo = () => {
    setOpenProductInfo({ open: true });
  };
  const { tableRef, scroll } = useTableScroll();

  const { data, isFetching } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    placeholderData: keepPreviousData,
  });

  const columns: ColumnsType<IProduct> = [
    {
      title: t("common.nameEn"),
      dataIndex: "nameEn",
      key: "nameEn",
    },
    {
      title: t("common.nameAr"),
      dataIndex: "nameAr",
      key: "nameAr",
    },
    {
      title: t("products.price"),
      dataIndex: "price",
      key: "price",
    },
    {
      title: t("products.qty"),
      dataIndex: "qty",
      key: "qty",
    },
    {
      title: t("stores.store"),
      dataIndex: ["store", "name"],
      key: "store",
    },
    {
      title: t("products.category"),
      dataIndex: ["category", "name"],
      key: "category",
    },
  ];

  return (
    <>
      <div className="flex flex-row justify-between items-center">
        <div>
          <Typography.Title level={4} className="!m-0">
            {t("products.products")}
          </Typography.Title>
        </div>
        <div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showProductInfo}
          >
            {t("products.createProduct")}
          </Button>
        </div>
      </div>
      <div className="my-6">
        <Table<IProduct>
          ref={tableRef}
          dataSource={data?.data}
          columns={columns}
          loading={isFetching}
          sticky={{ offsetHeader: 88 }}
          scroll={scroll}
          rowKey={(row) => row.id}
          onRow={(record) => {
            return {
              onClick: (event) => {
                console.log("record :>> ", record, event);
                setOpenProductInfo({ open: true, productId: record.id });
              },
            };
          }}
        />
      </div>
      <ProductsInfo
        config={openProductInfo}
        onClose={() => setOpenProductInfo({ open: false })}
      />
    </>
  );
}

export default ProductsTable;
