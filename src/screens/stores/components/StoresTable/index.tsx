import { IApiError } from "@/api/http";
import { queryClient } from "@/api/queryClient";
import StoreInfo, { IShowStoreInfoDrawerConfig } from "@/components/StoreInfo";
import { useTableScroll } from "@/hooks/useTableScroll";
import { fetchStores, patchStore } from "@/services/stores.service";
import {
  ColumnsType,
  IPaginatedResponse,
  IStore,
  IStoreDetails,
  TCreateStore,
} from "@/types";
import { updatePaginatedData } from "@/utils/helper";
import {
  PlusOutlined,
  SearchOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import {
  Button,
  Flex,
  Image,
  Input,
  Modal,
  PaginationProps,
  Switch,
  Table,
  Tooltip,
  Typography,
  message,
} from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDebounce } from "use-debounce";
import { ICreateStoreAdminConfig } from "../../stores.types";
import CreateStoreAdmin from "../CreateStoreAdmin";

function StoresTable() {
  const { t } = useTranslation();
  const { tableRef, scroll } = useTableScroll();
  const [messageApi, messageContextHolder] = message.useMessage();
  const [modal, modalContextHolder] = Modal.useModal();
  const [openStoreInfo, setOpenStoreInfo] =
    useState<IShowStoreInfoDrawerConfig>({
      open: false,
    });
  const [openStoreAdminCreate, setOpenStoreAdminCreate] =
    useState<ICreateStoreAdminConfig>({
      open: false,
    });
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText] = useDebounce(searchText, 300); // Debounce the search input by 300ms
  const [filteredData, setFilteredData] = useState<IStore[]>([]);
  const [pagination, setPagination] = useState<PaginationProps>({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const { data, isFetching } = useQuery({
    queryKey: ["stores"],
    queryFn: fetchStores,
    placeholderData: keepPreviousData,
  });

  const updateIsActiveMutation = useMutation({
    mutationFn: (value: {
      isActive: TCreateStore["isActive"];
      storeId: string;
    }) => {
      return patchStore(value.storeId, { isActive: value.isActive });
    },
    onSuccess: (data, variables) => {
      messageApi.success({
        content: data.isActive
          ? t("stores.markedActive", { storename: data.nameEn })
          : t("stores.markedInActive", { storename: data.nameEn }),
      });
      queryClient.setQueryData<IStoreDetails | undefined>(
        ["stores", variables.storeId],
        (old: any) => {
          return { ...old, ...data };
        },
      );
      queryClient.setQueryData<IPaginatedResponse<IStore>>(
        ["stores"],
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

  const handleIsActiveUpdate = (checked: boolean, storeId: string) => {
    modal.confirm({
      title: t("common.confirm"),
      content: checked ? t("stores.markActive") : t("stores.markInActuve"),
      onOk: () => {
        updateIsActiveMutation.mutate({
          isActive: checked,
          storeId,
        });
      },
      type: "error",
      okButtonProps: { danger: !checked },
      footer: (_, { OkBtn, CancelBtn }) => (
        <>
          <CancelBtn />
          <OkBtn />
        </>
      ),
    });
  };

  const columns: ColumnsType<IStore> = [
    {
      title: "",
      dataIndex: "storeLogo",
      key: "images",
      width: 82,
      render: (value) => {
        const logo = value ?? "/public/common/no-image.png";
        return (
          <div
            onClick={(event) => {
              event.stopPropagation(); // Prevent row click event when interacting with the group
            }}
          >
            <Image
              width={50}
              height={50}
              src={`${process.env.NEXT_PUBLIC_ASSET_URL}${logo}`}
              preview={Boolean(value)}
              onClick={(event) => {
                event.stopPropagation(); // Prevent row click event
              }}
              alt=""
            />
          </div>
        );
      },
    },
    {
      title: t("stores.nameEn"),
      dataIndex: "nameEn",
      key: "nameEn",
      align: "start",
    },
    {
      title: t("stores.nameAr"),
      dataIndex: "nameAr",
      key: "nameAr",
      align: "start",
    },
    {
      title: t("stores.locationEn"),
      dataIndex: "locationEn",
      key: "locationEn",
      align: "start",
    },
    {
      title: t("stores.locationAr"),
      dataIndex: "locationAr",
      key: "locationAr",
      align: "start",
    },
    {
      title: t("stores.contact"),
      dataIndex: "contactNumber",
      key: "contactNumber",
      align: "start",
      render: (_, record) => (
        <span>
          {record.countryCode} {record.mobileNumber}
        </span>
      ),
    },
    {
      title: t("stores.email"),
      dataIndex: "email",
      key: "email",
      align: "start",
    },
    {
      title: t("common.active"),
      dataIndex: "isActive",
      key: "isActive",
      render: (value, record) => {
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <Switch
              loading={updateIsActiveMutation.isPending}
              checked={value}
              onChange={(checked) => {
                console.log("checked", checked);
                handleIsActiveUpdate(checked, record.id);
              }}
            />
          </div>
        );
      },
    },
    {
      title: "",
      dataIndex: "",
      key: "action",
      align: "start",
      render: (_, record) => (
        <Flex gap="small">
          <Tooltip title={t("stores.addStoreAdmin")}>
            <Button
              size="small"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpenStoreAdminCreate({
                  storeId: record.id,
                  storeName: record.nameEn,
                  open: true,
                });
              }}
              icon={<UserAddOutlined />}
            />
          </Tooltip>
        </Flex>
      ),
    },
  ];

  // Update filtered data whenever the original data or debounced search text changes
  useEffect(() => {
    if (data?.data) {
      const filtered = data.data.filter(
        (store) =>
          store.nameEn
            ?.toLowerCase()
            .includes(debouncedSearchText.toLowerCase()) ||
          store.nameAr
            ?.toLowerCase()
            .includes(debouncedSearchText.toLowerCase()),
      );
      setFilteredData(filtered);
      setPagination((prev) => ({
        ...prev,
        current: 1, // Reset to the first page
        total: filtered.length,
      }));
    }
  }, [data, debouncedSearchText]);

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleTableChange = (pagination: PaginationProps) => {
    setPagination(pagination);
  };

  const paginatedData = filteredData.slice(
    (pagination.current! - 1) * pagination.pageSize!,
    pagination.current! * pagination.pageSize!,
  );

  return (
    <>
      <div className="flex flex-row justify-between items-center">
        <div>
          <Typography.Title level={4} className="!m-0">
            {t("stores.stores")}
          </Typography.Title>
        </div>
        <div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setOpenStoreInfo({ open: true });
            }}
          >
            {t("stores.createStore")}
          </Button>
        </div>
      </div>
      <div className="my-4 text-start">
        <Input
          placeholder={t("common.searchByName")}
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-80"
        />
      </div>
      <div className="my-6">
        <Table<IStore>
          ref={tableRef}
          dataSource={paginatedData}
          columns={columns}
          loading={isFetching}
          sticky={{ offsetHeader: 10 }}
          scroll={scroll}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showTotal: (total, range) =>
              t("common.showTotal", {
                total: total,
                start: range[0],
                end: range[1],
              }),
          }}
          rowKey={(row) => row.id}
          onChange={handleTableChange}
          onRow={(record) => {
            return {
              onClick: () => {
                setOpenStoreInfo({ open: true, storeId: record.id });
              },
            };
          }}
        />
      </div>
      <StoreInfo
        config={openStoreInfo}
        onClose={() => setOpenStoreInfo({ open: false })}
      />
      <CreateStoreAdmin
        config={openStoreAdminCreate}
        onClose={() => setOpenStoreAdminCreate({ open: false })}
      />
      {modalContextHolder}
      {messageContextHolder}
    </>
  );
}

export default StoresTable;
