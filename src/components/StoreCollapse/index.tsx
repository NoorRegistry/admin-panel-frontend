import { fetchStore } from "@/services/stores.service";
import { getAdminStoreId } from "@/utils/helper";
import { EditOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Collapse, CollapseProps, Flex, Image, Typography } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import StoreInfo, { IShowStoreInfoDrawerConfig } from "../StoreInfo";

const StoreDetailsCollapse = () => {
  const { t } = useTranslation();
  const storeId = getAdminStoreId();
  const [openStoreInfo, setOpenStoreInfo] =
    useState<IShowStoreInfoDrawerConfig>({
      open: false,
    });

  const { data: store, isFetching } = useQuery({
    queryKey: ["stores", storeId],
    queryFn: ({ queryKey }) => fetchStore(queryKey[1]!),
  });

  const editStoreInfo = () => (
    <EditOutlined
      onClick={(event) => {
        // If you don't want click extra trigger collapse, you can prevent this:
        event.stopPropagation();
        setOpenStoreInfo({ open: true, storeId: store?.id });
      }}
    />
  );

  const infoBlocks = [
    {
      heading: t("common.description"),
      contentEn: store?.descriptionEn,
      contentAr: store?.descriptionAr,
    },
    {
      heading: t("stores.location"),
      contentEn: store?.locationEn,
      contentAr: store?.locationAr,
    },
    {
      heading: t("stores.contact"),
      contentEn: `${store?.countryCode} ${store?.mobileNumber}`,
      contentAr: `${store?.email}`,
    },
  ];

  const items: CollapseProps["items"] = [
    {
      key: "1",
      label: (
        <div className="text-start">
          <Typography.Title level={4}>{t("stores.storeInfo")}</Typography.Title>
        </div>
      ),
      children: (
        <div>
          <div className="flex gap-4 items-start">
            <Image
              width={150}
              height={150}
              src={`${process.env.NEXT_PUBLIC_ASSET_URL}${store?.storeLogo}`}
              preview
              alt=""
            />
            <div className="flex flex-col gap-4 text-start">
              <div className="space-y-2">
                <Typography.Title level={5}>{store?.nameEn}</Typography.Title>
                <Typography.Title level={5} type="secondary">
                  {store?.nameAr}
                </Typography.Title>
              </div>
              {infoBlocks.map((info, index) => (
                <Flex key={index} vertical gap="small">
                  <Typography.Title level={5}>{info.heading}</Typography.Title>
                  <Flex vertical>
                    <Typography.Text type="secondary">
                      {info.contentEn}
                    </Typography.Text>
                    <Typography.Text type="secondary">
                      {info.contentAr}
                    </Typography.Text>
                  </Flex>
                </Flex>
              ))}
            </div>
          </div>
        </div>
      ),
      extra: editStoreInfo(),
    },
  ];

  return (
    <>
      {isFetching ? null : (
        <Collapse
          defaultActiveKey={["1"]}
          expandIconPosition="end"
          items={items}
        />
      )}
      <StoreInfo
        config={openStoreInfo}
        onClose={() => setOpenStoreInfo({ open: false })}
      />
    </>
  );
};

export default StoreDetailsCollapse;
