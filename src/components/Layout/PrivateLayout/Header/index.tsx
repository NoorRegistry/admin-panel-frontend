import { useGlobalStore } from "@/store";
import { clearSessionData, getUserNameInitials } from "@/utils/helper";
import type { MenuProps } from "antd";
import { Avatar, Dropdown, Layout, theme } from "antd";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import styles from "./header.module.css";
import LogoutIcon from "/public/icons/common/logout.svg";

const { Header } = Layout;

function PrivateHeader() {
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  return (
    <Header
      style={{
        padding: 0,
        background: colorBgContainer,
      }}
      className={clsx(styles.header, "z-10")}
    >
      <div className="px-4 flex justify-between">
        <div></div>
        <div>
          <Usermenu />
        </div>
      </div>
    </Header>
  );
}

const Usermenu = () => {
  const { t } = useTranslation();
  const logout = useGlobalStore.use.signOut();
  const items: MenuProps["items"] = [
    {
      label: <a href="https://www.antgroup.com">1st menu item</a>,
      key: "0",
    },
    {
      label: <a href="https://www.aliyun.com">2nd menu item</a>,
      key: "1",
      icon: (
        <span className="text-error">
          <LogoutIcon />
        </span>
      ),
    },
    {
      type: "divider",
    },
    {
      label: t("common.logout"),
      key: "3",
      icon: (
        <span className="text-error">
          <LogoutIcon />
        </span>
      ),
      onClick: () => {
        clearSessionData();
        logout();
      },
    },
  ];

  return (
    <Dropdown menu={{ items }} trigger={["click", "hover"]}>
      <Avatar
        size="large"
        className="cursor-pointer !bg-secondary-50 uppercase !text-secondary-600 outline hover:outline-2 transition-all duration-150 ease-out"
      >
        {getUserNameInitials()}
      </Avatar>
    </Dropdown>
  );
};

export default PrivateHeader;
