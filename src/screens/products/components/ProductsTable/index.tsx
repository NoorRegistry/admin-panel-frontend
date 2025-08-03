import { IApiError } from "@/api/http";
import { queryClient } from "@/api/queryClient";
import { useTableScroll } from "@/hooks/useTableScroll";
import { fetchProducts, patchProduct } from "@/services/product.service";
import {
  ColumnsType,
  EAdminRole,
  EProductStatus,
  EQueryKeys,
  IPaginatedResponse,
  IProduct,
  IQueryState,
  TCreateProduct,
} from "@/types";
import { getAdminRole, updatePaginatedData } from "@/utils/helper";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DownOutlined,
  PlusOutlined,
  SearchOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import type { MenuProps, TablePaginationConfig } from "antd";
import {
  Button,
  Dropdown,
  Image,
  Input,
  Modal,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDebounce } from "use-debounce";
import { IShowProductInfoDrawerConfig } from "../../products.types";
import ProductsInfo from "../ProductsInfo";

const storeImageSize = 50;

function ProductsTable() {
  const { t } = useTranslation();
  const [messageApi, contextHolder] = message.useMessage();
  const [modal, modalContextHolder] = Modal.useModal();
  const [openProductInfo, setOpenProductInfo] =
    useState<IShowProductInfoDrawerConfig>({
      open: false,
    });
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);

  // Combine search query and pagination into one state
  const [queryState, setQueryState] = useState<IQueryState>({
    current: 1, // Current page
    pageSize: 10, // Page size
    search: "",
  });

  const { tableRef, scroll } = useTableScroll();

  const isInternalAdmin = getAdminRole() === EAdminRole.INTERNAL_ADMIN;

  const showProductInfo = () => {
    setOpenProductInfo({ open: true });
  };

  const getProductStatusText = (status: EProductStatus) => {
    return status === EProductStatus.APPROVED
      ? t("common.approved")
      : status === EProductStatus.PENDING
        ? t("common.pending")
        : t("common.rejected");
  };

  const displayStatus = (status: EProductStatus) => {
    return status === EProductStatus.APPROVED ? (
      <Tag icon={<CheckCircleOutlined />} color="success">
        {t("common.approved")}
      </Tag>
    ) : status === EProductStatus.PENDING ? (
      <Tag icon={<SyncOutlined spin />} color="processing">
        {t("common.pending")}
      </Tag>
    ) : (
      <Tag icon={<CloseCircleOutlined />} color="error">
        {t("common.rejected")}
      </Tag>
    );
  };

  const updateProductStatusMutation = useMutation({
    mutationFn: (value: {
      status?: Partial<TCreateProduct>["status"];
      isActive?: Partial<TCreateProduct>["isActive"];
      productId: string;
    }) => {
      const changes: Partial<TCreateProduct> = {};
      if (value.isActive !== null || value.isActive !== undefined) {
        changes.isActive = value.isActive;
      }
      if (value.status !== null || value.status !== undefined) {
        changes.status = value.status;
      }
      console.log("changes", changes);
      return patchProduct(value.productId, changes);
    },
    onSuccess: (data) => {
      messageApi.success({
        content: t("products.productUpdated"),
      });
      queryClient.setQueryData<IProduct | undefined>(
        ["product", data.id],
        (old: any) => {
          return { ...old, ...data };
        },
      );
      queryClient.setQueryData<IPaginatedResponse<IProduct>>(
        ["products", queryState],
        (old) => {
          return updatePaginatedData(data, old, data.id);
        },
      );
    },
    onError: (err: IApiError) => {
      messageApi.error({
        content: err.detail,
      });
    },
  });

  const createHandleStatusUpdate =
    (product: IProduct): MenuProps["onClick"] =>
    (info) => {
      info.domEvent.stopPropagation();
      info.domEvent.preventDefault();

      modal.confirm({
        title: t("common.confirm"),
        content: t("products.confirmProductStatusUpdate", {
          status: getProductStatusText(info.key as EProductStatus),
        }),
        onOk: () => {
          updateProductStatusMutation.mutate({
            status: info.key as EProductStatus,
            productId: product.id,
          });
        },
        type: "error",
        okButtonProps: { danger: info.key === EProductStatus.REJECTED },
        footer: (_, { OkBtn, CancelBtn }) => (
          <>
            <CancelBtn />
            <OkBtn />
          </>
        ),
      });
    };

  const displayStatusDropdown = (status: EProductStatus, product: IProduct) => {
    const items: MenuProps["items"] = [
      {
        label: t("common.approved"),
        key: EProductStatus.APPROVED,
        disabled: status === EProductStatus.APPROVED,
        onClick: createHandleStatusUpdate(product),
      },
      {
        label: t("common.pending"),
        key: EProductStatus.PENDING,
        disabled: status === EProductStatus.PENDING,
        onClick: createHandleStatusUpdate(product),
      },
      {
        label: t("common.rejected"),
        key: EProductStatus.REJECTED,
        disabled: status === EProductStatus.REJECTED,
        danger: true,
        onClick: createHandleStatusUpdate(product),
      },
    ];

    const menuProps: MenuProps = {
      items: items as MenuProps["items"],
      selectedKeys: [status],
    };

    return (
      <div onClick={(e) => e.stopPropagation()}>
        <Dropdown menu={menuProps} trigger={["click"]}>
          <Button
            loading={updateProductStatusMutation.isPending}
            size="small"
            className="!px-4"
          >
            <Space>
              {getProductStatusText(status)}
              <DownOutlined />
            </Space>
          </Button>
        </Dropdown>
      </div>
    );
  };

  const { data, isFetching } = useQuery({
    queryKey: [EQueryKeys.PRODUCTS, queryState],
    queryFn: () =>
      fetchProducts(queryState.current, queryState.pageSize, queryState.search),
    placeholderData: keepPreviousData,
  });

  // Sync debounced search query with query state
  useEffect(() => {
    setQueryState((prev) => ({
      ...prev,
      current: 1, // Reset to first page
      search: debouncedSearchQuery,
    }));
  }, [debouncedSearchQuery]);

  // Handle pagination change
  const handleTableChange = (pagination: TablePaginationConfig) => {
    setQueryState((prev) => ({
      ...prev,
      current: pagination.current || 1,
      pageSize: pagination.pageSize || 10,
    }));
  };

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
                width={storeImageSize}
                height={storeImageSize}
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
            width={storeImageSize}
            height={storeImageSize}
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
      width: 250,
      ellipsis: true,
      render: (text) => (
        <div className="whitespace-normal break-words">{text}</div>
      ),
    },
    {
      title: t("common.nameAr"),
      dataIndex: "nameAr",
      key: "nameAr",
      width: 250,
      ellipsis: true,
      render: (text) => (
        <div className="whitespace-normal break-words">{text}</div>
      ),
    },
    {
      title: t("products.price"),
      dataIndex: "price",
      key: "price",
      width: 85,
      ellipsis: true,
      align: "center",
      render: (text, record) => `${record.currencyCode} ${text}`,
    },
    {
      title: t("products.qty"),
      dataIndex: "qty",
      key: "qty",
      width: 50,
      align: "center",
    },
    {
      title: t("stores.store"),
      dataIndex: ["store", "name"],
      key: "store",
      hidden: !isInternalAdmin,
      width: 150,
      ellipsis: true,
    },
    {
      title: t("products.category"),
      dataIndex: ["category", "name"],
      key: "category",
    },
    {
      title: t("common.status"),
      dataIndex: "status",
      key: "status",
      width: 150,
      fixed: "right",
      render: (value, record) => {
        return isInternalAdmin
          ? displayStatusDropdown(value, record)
          : displayStatus(value);
      },
    },
    {
      title: t("common.active"),
      dataIndex: "isActive",
      key: "isActive",
      width: 60,
      fixed: "right",
      render: (value, record) => {
        return isInternalAdmin ? (
          // update mutation function to accept both status and isActive values and use the record here to get the product id and call the mutation func
          <div onClick={(e) => e.stopPropagation()}>
            <Switch
              loading={updateProductStatusMutation.isPending}
              checked={value}
              onChange={(checked) => {
                console.log("checked", checked);
                updateProductStatusMutation.mutate({
                  productId: record.id,
                  isActive: checked,
                });
              }}
            />
          </div>
        ) : (
          <Switch checked={value} />
        );
      },
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
      {/* Search Input */}
      <div className="my-4 text-start">
        <Input
          placeholder={t("common.searchByName")}
          prefix={<SearchOutlined />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-80"
          allowClear
        />
      </div>
      <div className="my-6">
        <Table<IProduct>
          size="small"
          ref={tableRef}
          dataSource={data?.data}
          columns={columns}
          loading={isFetching}
          sticky={{ offsetHeader: 10 }}
          scroll={scroll}
          pagination={{
            current: queryState.current,
            pageSize: queryState.pageSize,
            total: data?.total,
            showTotal: (total, range) =>
              t("common.showTotal", {
                total: total,
                start: range[0],
                end: range[1],
              }),
          }}
          onChange={handleTableChange}
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
        queryState={queryState}
      />
      {modalContextHolder}
      {contextHolder}
    </>
  );
}

export default ProductsTable;
