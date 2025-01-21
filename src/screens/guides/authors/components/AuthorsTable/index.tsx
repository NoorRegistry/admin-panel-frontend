import { useTableScroll } from "@/hooks/useTableScroll";
import { fetchAuthors } from "@/services/guides.service";
import { ColumnsType, IAuthor, IShowAuthorInfoDrawerConfig } from "@/types";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Button, Image, Input, PaginationProps, Table, Typography } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDebounce } from "use-debounce";
import AuthorsInfo from "../AuthorsInfo";

function AuthorsTable() {
  const { t } = useTranslation();
  const { tableRef, scroll } = useTableScroll();
  const [searchText, setSearchText] = useState("");
  const [openAuthorInfo, setOpenAuthorInfo] =
    useState<IShowAuthorInfoDrawerConfig>({
      open: false,
    });
  const [debouncedSearchText] = useDebounce(searchText, 300);
  const [filteredData, setFilteredData] = useState<IAuthor[]>([]);
  const [pagination, setPagination] = useState<PaginationProps>({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const { data, isFetching } = useQuery({
    queryKey: ["authors"],
    queryFn: fetchAuthors,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (data?.data) {
      const filtered = data.data.filter(
        (author) =>
          author.nameEn
            ?.toLowerCase()
            .includes(debouncedSearchText.toLowerCase()) ||
          author.nameAr
            ?.toLowerCase()
            .includes(debouncedSearchText.toLowerCase()),
      );
      setFilteredData(filtered);
      setPagination((prev) => ({
        ...prev,
        current: 1,
        total: filtered.length,
      }));
    }
  }, [data, debouncedSearchText]);

  const paginatedData = filteredData.slice(
    (pagination.current! - 1) * pagination.pageSize!,
    pagination.current! * pagination.pageSize!,
  );

  const columns: ColumnsType<IAuthor> = [
    {
      title: "",
      dataIndex: "image",
      key: "images",
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
              onError={(e) => {
                e.currentTarget.src = `${process.env.NEXT_PUBLIC_ASSET_URL}/public/common/no-image.png`;
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
      align: "start",
      width: 150,
      ellipsis: true,
    },
    {
      title: t("common.nameAr"),
      dataIndex: "nameAr",
      key: "nameAr",
      align: "start",
      width: 150,
      ellipsis: true,
    },
    {
      title: t("guides.totalGuides"),
      dataIndex: ["_count", "guides"],
      key: "totalGuides",
      align: "start",
      width: 150,
      ellipsis: true,
    },
  ];

  const handleTableChange = (pagination: PaginationProps) => {
    setPagination(pagination);
  };
  return (
    <>
      <div className="flex flex-row justify-between items-center">
        <div>
          <Typography.Title level={4} className="!m-0">
            {t("guides.authors")}
          </Typography.Title>
        </div>
        <div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setOpenAuthorInfo({ open: true });
            }}
          >
            {t("guides.createAuthor")}
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
          allowClear
        />
      </div>
      <div className="my-6 min-w-0">
        <Table<IAuthor>
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
                setOpenAuthorInfo({ open: true, authorId: record.id });
              },
            };
          }}
        />
      </div>
      <AuthorsInfo
        config={openAuthorInfo}
        onClose={() => setOpenAuthorInfo({ open: false })}
      />
    </>
  );
}
export default AuthorsTable;
