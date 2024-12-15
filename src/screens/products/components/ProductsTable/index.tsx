import { useTableScroll } from "@/hooks/useTableScroll";
import { fetchProducts } from "@/services/product.service";
import { ColumnsType, EAdminRole, IProduct } from "@/types";
import { getAdminRole } from "@/utils/helper";
import { PlusOutlined } from "@ant-design/icons";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Button, Image, Table, Typography } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { IShowProductInfoDrawerConfig } from "../../products.types";
import ProductsInfo from "../ProductsInfo";

function ProductsTable() {
  const { t } = useTranslation();
  const [openProductInfo, setOpenProductInfo] =
    useState<IShowProductInfoDrawerConfig>({
      open: false,
    });
  const { tableRef, scroll } = useTableScroll();

  const isInternalAdmin = getAdminRole() === EAdminRole.INTERNAL_ADMIN;

  const showProductInfo = () => {
    setOpenProductInfo({ open: true });
  };

  const { data, isFetching } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    placeholderData: keepPreviousData,
  });

  const columns: ColumnsType<IProduct> = [
    {
      title: "",
      dataIndex: "images",
      key: "images",
      render: (value) => {
        return value && value.length ? (
          <div
            onClick={(event) => {
              event.stopPropagation(); // Prevent row click event when interacting with the group
            }}
          >
            <Image.PreviewGroup
              items={
                value.map(
                  (image: { id: string; path: string }) =>
                    `${process.env.NEXT_PUBLIC_ASSET_URL}${image.path!}`,
                ) ?? []
              }
            >
              <Image
                width={100}
                height={100}
                src={`${process.env.NEXT_PUBLIC_ASSET_URL}${value[0].path!}`}
                onClick={(event) => {
                  event.stopPropagation(); // Prevent row click event
                }}
                alt=""
              />
            </Image.PreviewGroup>
          </div>
        ) : (
          <Image
            width={100}
            height={100}
            preview={false}
            src={`${process.env.NEXT_PUBLIC_ASSET_URL}/public/common/no-image.png`}
            alt=""
          />
        );
      },
    },
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
      hidden: !isInternalAdmin,
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
          sticky={{ offsetHeader: 10 }}
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
