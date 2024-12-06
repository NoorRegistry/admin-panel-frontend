import { HomeOutlined, ShopOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Layout, Menu } from "antd";
import { MenuItemType } from "antd/es/menu/interface";
import { useRouter, useSelectedLayoutSegment } from "next/navigation";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const { Sider } = Layout;

const siderStyle: React.CSSProperties = {
  overflow: "auto",
  height: "100vh",
  position: "sticky",
  insetInlineStart: 0,
  top: 0,
  bottom: 0,
  scrollbarWidth: "thin",
  scrollbarGutter: "stable",
};

type TMenuItems = MenuItemType & { href: string };

function Sidebar() {
  const { t } = useTranslation();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const activeSegment = useSelectedLayoutSegment();

  const menuItems: TMenuItems[] = [
    {
      key: "dashboard",
      icon: <HomeOutlined />,
      label: t("common.dashboard"),
      href: "/",
    },
    {
      key: "stores",
      icon: <ShopOutlined />,
      label: t("stores.stores"),
      href: "/stores",
    },
  ];

  const onClick: MenuProps["onClick"] = (e) => {
    const item = menuItems.find((item) => item.key === e.key);
    item && router.replace(item.href);
  };

  return (
    <Sider
      style={siderStyle}
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
      className="overscroll-contain"
    >
      <div className="demo-logo-vertical h-10" />
      <Menu
        onClick={onClick}
        theme="dark"
        mode="inline"
        selectedKeys={menuItems
          .filter((item) =>
            activeSegment
              ? item.key === activeSegment
              : item.key === "dashboard",
          )
          .map((item) => item.key as string)}
        items={menuItems}
      />
    </Sider>
  );
}

export default Sidebar;
