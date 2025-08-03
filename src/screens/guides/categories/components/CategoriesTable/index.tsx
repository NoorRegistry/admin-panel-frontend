import { useTableScroll } from "@/hooks/useTableScroll";
import { IShowCategoryInfoDrawerConfig } from "@/screens/guides/guides.types";
import { fetchGuideCategories } from "@/services/guides.service";
import { ColumnsType, EQueryKeys, IGuideCategory } from "@/types";
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
    queryKey: [EQueryKeys.GUIDE_CATEGORIES],
    queryFn: () => fetchGuideCategories(),
    placeholderData: keepPreviousData,
  });

  const columns: ColumnsType<IGuideCategory> = [
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
      title: t("guides.totalGuides"),
      dataIndex: ["_count", "guides"],
      key: "totalGuides",
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
            {t("guides.categories")}
          </Typography.Title>
        </div>
        <div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showCategoryInfo}
          >
            {t("guides.createCategory")}
          </Button>
        </div>
      </div>
      <div className="my-6">
        <Table<IGuideCategory>
          ref={tableRef}
          dataSource={data?.data}
          columns={columns}
          loading={isFetching}
          sticky={{ offsetHeader: 10 }}
          scroll={scroll}
          pagination={{
            total: data?.total,
            showTotal: (total, range) =>
              t("common.showTotal", {
                total: total,
                start: range[0],
                end: range[1],
              }),
          }}
          rowKey={(row) => row.id}
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
