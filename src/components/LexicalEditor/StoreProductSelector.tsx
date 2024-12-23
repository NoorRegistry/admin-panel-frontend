import { fetchProducts } from "@/services/product.service";
import { fetchStores } from "@/services/stores.service";
import type { IProduct, IQueryState, IStore } from "@/types";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useQuery } from "@tanstack/react-query";
import { Modal, Table, Tabs } from "antd";
import type { ColumnsType } from "antd/es/table";
import { $getRoot } from "lexical";
import React, { useState } from "react";
import { StoreProductNode } from "./StoreProductNode";

interface StoreProductSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  //   onSelect: (item: {
  //     id: string;
  //     type: "store" | "product";
  //     name: string;
  //     image: string;
  //   }) => void;
}

const StoreProductSelectModal: React.FC<StoreProductSelectModalProps> = ({
  isOpen,
  onClose,
  //   onSelect,
}) => {
  const [activeTab, setActiveTab] = useState<"store" | "product">("store");
  const [queryState, setQueryState] = useState<IQueryState>({
    current: 1,
    pageSize: 10,
    search: "",
  });
  const [editor] = useLexicalComposerContext();

  const { data: storesData, isLoading: isLoadingStores } = useQuery({
    queryKey: ["stores"],
    queryFn: fetchStores,
  });

  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["products", queryState],
    queryFn: () =>
      fetchProducts(queryState.current, queryState.pageSize, queryState.search),
  });

  const handleTableChange = (pagination: any) => {
    setQueryState((prev) => ({
      ...prev,
      current: pagination.current,
      pageSize: pagination.pageSize,
    }));
  };

  const storeColumns: ColumnsType<IStore> = [
    {
      title: "Logo",
      dataIndex: "storeLogo",
      key: "storeLogo",
      render: (logo) => (
        <img src={logo} alt="Store Logo" style={{ width: 50, height: 50 }} />
      ),
    },
    {
      title: "Name",
      dataIndex: "nameEn",
      key: "nameEn",
    },
    {
      title: "Mobile",
      dataIndex: "mobileNumber",
      key: "mobileNumber",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Action",
      key: "action",
      render: (_, store) => (
        <a
          onClick={() => {
            editor.update(() => {
              const root = $getRoot();
              const node = new StoreProductNode(store);
              root.append(node);
            });
            /* onSelect({
              id: store.id,
              type: "store",
              name: store.nameEn,
              image: store.storeLogo,
            }); */
          }}
        >
          Select
        </a>
      ),
    },
  ];

  const productColumns: ColumnsType<IProduct> = [
    {
      title: "Image",
      dataIndex: "images",
      key: "images",
      render: (images) => (
        <img
          src={images[0]?.url || "/placeholder.png"}
          alt="Product"
          style={{ width: 50, height: 50 }}
        />
      ),
    },
    {
      title: "Name",
      dataIndex: "nameEn",
      key: "nameEn",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price) => `${price.toFixed(2)} USD`,
    },
    {
      title: "Action",
      key: "action",
      render: (_, product) => (
        <a
          onClick={() => {
            editor.update(() => {
              const root = $getRoot();
              const node = new StoreProductNode(product);
              root.append(node);
            });
            /* onSelect({
              id: store.id,
              type: "store",
              name: store.nameEn,
              image: store.storeLogo,
            }); */
          }}
        >
          Select
        </a>
      ),
    },
  ];

  return (
    <Modal
      title="Select Store or Product"
      open={isOpen}
      onCancel={onClose}
      footer={null}
    >
      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as "store" | "product")}
      >
        <Tabs.TabPane tab="Stores" key="store">
          <Table
            rowKey="id"
            columns={storeColumns}
            dataSource={storesData?.data || []}
            loading={isLoadingStores}
            pagination={{
              current: queryState.current,
              pageSize: queryState.pageSize,
              total: storesData?.total || 0,
            }}
            onChange={handleTableChange}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Products" key="product">
          <Table
            rowKey="id"
            columns={productColumns}
            dataSource={productsData?.data || []}
            loading={isLoadingProducts}
            pagination={{
              current: queryState.current,
              pageSize: queryState.pageSize,
              total: productsData?.total || 0,
            }}
            onChange={handleTableChange}
          />
        </Tabs.TabPane>
      </Tabs>
    </Modal>
  );
};

export default StoreProductSelectModal;
