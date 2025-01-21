import { IApiError } from "@/api/http";
import { queryClient } from "@/api/queryClient";
import { useTableScroll } from "@/hooks/useTableScroll";
import { fetchGuides, patchGuide } from "@/services/guides.service";
import {
  ColumnsType,
  EGuideStatus,
  IGuide,
  IPaginatedResponse,
  IQueryState,
  TCreateGuide,
} from "@/types";
import { updatePaginatedData } from "@/utils/helper";
import { DownOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
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
  Typography,
  message,
} from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDebounce } from "use-debounce";
import { IShowGuideInfoDrawerConfig } from "../../guides.types";
import GuidesInfo from "../GuidesInfo";

function GuidesTable() {
  const { t } = useTranslation();
  const [messageApi, contextHolder] = message.useMessage();
  const [modal, modalContextHolder] = Modal.useModal();
  const [openGuideInfo, setOpenGuideInfo] =
    useState<IShowGuideInfoDrawerConfig>({
      open: false,
    });
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);

  const [queryState, setQueryState] = useState<IQueryState>({
    current: 1,
    pageSize: 10,
    search: "",
  });

  const { tableRef, scroll } = useTableScroll();

  const showGuideInfo = () => {
    setOpenGuideInfo({ open: true });
  };

  const getGuideStatusText = (status: EGuideStatus) => {
    return status === EGuideStatus.PUBLISHED
      ? t("common.published")
      : status === EGuideStatus.DRAFT
        ? t("common.draft")
        : t("common.submitted");
  };

  const updateGuideStatusMutation = useMutation({
    mutationFn: (value: {
      status?: Partial<TCreateGuide>["status"];
      isActive?: Partial<TCreateGuide>["isActive"];
      id: string;
    }) => {
      const changes: Partial<TCreateGuide> = {};
      if (value.isActive !== null || value.isActive !== undefined) {
        changes.isActive = value.isActive;
      }
      if (value.status !== null || value.status !== undefined) {
        changes.status = value.status;
      }
      return patchGuide(value.id, changes);
    },
    onSuccess: (data) => {
      messageApi.success({
        content: t("guides.guideEdited"),
      });
      queryClient.setQueryData<IGuide | undefined>(
        ["guides", data.id],
        (old: any) => {
          return { ...old, ...data };
        },
      );
      queryClient.setQueryData<IPaginatedResponse<IGuide>>(
        ["guides", queryState],
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
    (guide: IGuide): MenuProps["onClick"] =>
    (info) => {
      info.domEvent.stopPropagation();
      info.domEvent.preventDefault();

      modal.confirm({
        title: t("common.confirm"),
        content: t("guides.confirmGuideStatusUpdate", {
          status: getGuideStatusText(info.key as EGuideStatus),
        }),
        onOk: () => {
          updateGuideStatusMutation.mutate({
            status: info.key as EGuideStatus,
            id: guide.id,
          });
        },
        type: "error",
        okButtonProps: { danger: info.key === EGuideStatus.DRAFT },
        footer: (_, { OkBtn, CancelBtn }) => (
          <>
            <CancelBtn />
            <OkBtn />
          </>
        ),
      });
    };

  const displayStatusDropdown = (status: EGuideStatus, guide: IGuide) => {
    const items: MenuProps["items"] = [
      {
        label: t("common.published"),
        key: EGuideStatus.PUBLISHED,
        disabled: status === EGuideStatus.PUBLISHED,
        onClick: createHandleStatusUpdate(guide),
      },
      {
        label: t("common.submitted"),
        key: EGuideStatus.SUBMITTED,
        disabled: status === EGuideStatus.SUBMITTED,
        onClick: createHandleStatusUpdate(guide),
      },
      {
        label: t("common.draft"),
        key: EGuideStatus.DRAFT,
        disabled: status === EGuideStatus.DRAFT,
        danger: true,
        onClick: createHandleStatusUpdate(guide),
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
            loading={updateGuideStatusMutation.isPending}
            size="small"
            className="!px-4"
          >
            <Space>
              {getGuideStatusText(status)}
              <DownOutlined />
            </Space>
          </Button>
        </Dropdown>
      </div>
    );
  };

  const { data, isFetching } = useQuery({
    queryKey: ["guides", queryState],
    queryFn: () =>
      fetchGuides(queryState.current, queryState.pageSize, queryState.search),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    setQueryState((prev) => ({
      ...prev,
      current: 1,
      search: debouncedSearchQuery,
    }));
  }, [debouncedSearchQuery]);

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setQueryState((prev) => ({
      ...prev,
      current: pagination.current || 1,
      pageSize: pagination.pageSize || 10,
    }));
  };

  const columns: ColumnsType<IGuide> = [
    {
      title: "",
      dataIndex: "bannerImage",
      key: "bannerImage",
      width: 82,
      render: (value) => {
        const logo = value ?? "/public/common/no-image.png";
        return (
          <div
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <Image
              width={50}
              height={50}
              src={`${process.env.NEXT_PUBLIC_ASSET_URL}${logo}`}
              preview={Boolean(value)}
              onClick={(event) => {
                event.stopPropagation();
              }}
              alt=""
            />
          </div>
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
      title: t("guides.author"),
      dataIndex: ["author", "name"],
      key: "author",
      width: 150,
      ellipsis: true,
    },
    {
      title: t("guides.category"),
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
        return displayStatusDropdown(value, record);
      },
    },
    {
      title: t("common.active"),
      dataIndex: "isActive",
      key: "isActive",
      width: 60,
      fixed: "right",
      render: (value, record) => {
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <Switch
              loading={updateGuideStatusMutation.isPending}
              checked={value}
              onChange={(checked) => {
                updateGuideStatusMutation.mutate({
                  id: record.id,
                  isActive: checked,
                });
              }}
            />
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div className="flex flex-row justify-between items-center">
        <div>
          <Typography.Title level={4} className="!m-0">
            {t("guides.guides")}
          </Typography.Title>
        </div>
        <div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showGuideInfo}
          >
            {t("guides.createGuide")}
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
        <Table<IGuide>
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
              onClick: () => {
                setOpenGuideInfo({ open: true, guideId: record.id });
              },
            };
          }}
        />
      </div>
      <GuidesInfo
        config={openGuideInfo}
        onClose={() => setOpenGuideInfo({ open: false })}
        queryState={queryState}
      />
      {modalContextHolder}
      {contextHolder}
    </>
  );
}

export default GuidesTable;
