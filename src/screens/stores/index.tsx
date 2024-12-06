"use client";
import { PlusOutlined } from "@ant-design/icons";
import { Button, Typography } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import StoreInfo from "./components/StoreInfo";
import StoresTable from "./components/StoresTable";
import { IShowStoreInfoDrawerConfig } from "./stores.types";

function StoresScreen() {
  const { t } = useTranslation();
  const [openStoreInfo, setOpenStoreInfo] =
    useState<IShowStoreInfoDrawerConfig>({ open: false });

  const showStoreInfo = () => {
    setOpenStoreInfo({ open: true });
  };

  return (
    <>
      <div>
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
              onClick={showStoreInfo}
            >
              {t("stores.createStore")}
            </Button>
          </div>
        </div>
        <div className="my-6">
          <StoresTable />
        </div>
      </div>
      <StoreInfo
        config={openStoreInfo}
        onClose={() => setOpenStoreInfo({ open: false })}
      />
    </>
  );
}

export default StoresScreen;
