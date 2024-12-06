import { useTableScroll } from "@/hooks/useTableScroll";
import { ColumnsType, IStore } from "@/types";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Table } from "antd";
import { useTranslation } from "react-i18next";
import { fetchStores } from "../../services/stores.service";

function StoresTable() {
  const { t } = useTranslation();
  const { tableRef, scroll } = useTableScroll();

  // Use react-query to fetch data
  const { data, isFetching } = useQuery({
    queryKey: ["stores"],
    queryFn: fetchStores,
    placeholderData: keepPreviousData,
  });

  // Ant Design Table Columns
  const columns: ColumnsType<IStore> = [
    {
      title: t("stores.nameEn"),
      dataIndex: "nameEn",
      key: "nameEn",
    },
    {
      title: t("stores.nameAr"),
      dataIndex: "nameAr",
      key: "nameAr",
    },
    {
      title: t("stores.locationEn"),
      dataIndex: "locationEn",
      key: "locationEn",
    },
    {
      title: t("stores.locationAr"),
      dataIndex: "locationAr",
      key: "locationAr",
    },
    {
      title: t("stores.contact"),
      dataIndex: "contactNumber",
      key: "contactNumber",
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
    },
  ];

  return (
    <div>
      <Table<IStore>
        ref={tableRef}
        dataSource={data}
        columns={columns}
        loading={isFetching}
        sticky={{ offsetHeader: 88 }}
        scroll={scroll}
      />
    </div>
  );
}

export default StoresTable;
