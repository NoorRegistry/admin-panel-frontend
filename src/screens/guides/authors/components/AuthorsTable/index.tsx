import { IShowAuthorInfoDrawerConfig } from "@/components/AuthorInfo";
import { useTableScroll } from "@/hooks/useTableScroll";
import { fetchAuthors } from "@/services/guides.service";
import { IAuthor } from "@/types";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Button, Input, message, Modal, PaginationProps, Typography } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDebounce } from "use-debounce";

function AuthorsTable() {
  const { t } = useTranslation();
  const { tableRef, scroll } = useTableScroll();
  const [messageApi, messageContextHolder] = message.useMessage();
  const [modal, modalContextHolder] = Modal.useModal();
  const [searchText, setSearchText] = useState("");
  const [openStoreInfo, setOpenStoreInfo] =
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
        (store) =>
          store.nameEn
            ?.toLowerCase()
            .includes(debouncedSearchText.toLowerCase()) ||
          store.nameAr
            ?.toLowerCase()
            .includes(debouncedSearchText.toLowerCase())
      );
      setFilteredData(filtered);
      setPagination((prev) => ({
        ...prev,
        current: 1,
        total: filtered.length,
      }));
    }
  }, [data, debouncedSearchText]);
  return (
    <>
      {" "}
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
              setOpenStoreInfo({ open: true });
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
    </>
  );
}
export default AuthorsTable;
