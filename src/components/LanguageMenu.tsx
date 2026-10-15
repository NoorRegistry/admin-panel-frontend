"use client";
import constants from "@/constants";
import { setStorageItem } from "@/utils/storage";
import { DownOutlined, GlobalOutlined } from "@ant-design/icons";
import { Button, Dropdown } from "antd";
import { useTranslation } from "react-i18next";

export default function LanguageMenu() {
  const { t, i18n } = useTranslation();
  return (
    <Dropdown
      trigger={["click"]}
      menu={{
        selectedKeys: [i18n.language],
        items: [
          { key: "en", label: "English" },
          { key: "ar", label: "العربية" },
        ],
        onClick: ({ key }) => {
          setStorageItem(constants.USER_SELECTED_LANGUAGE_STORAGE_KEY, key);
          void i18n.changeLanguage(key);
        },
      }}
    >
      <Button
        type="text"
        icon={<GlobalOutlined />}
        aria-label={t("overview.language")}
      >
        {i18n.language.startsWith("ar") ? "العربية" : "English"}
        <DownOutlined style={{ fontSize: 9 }} />
      </Button>
    </Dropdown>
  );
}
