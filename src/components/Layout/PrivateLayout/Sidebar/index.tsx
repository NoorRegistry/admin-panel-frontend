import {
  ApartmentOutlined,
  HomeOutlined,
  OrderedListOutlined,
  ProductOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Layout, Menu } from "antd";
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

type MenuItem = Required<MenuProps>["items"][number];
type TMenuItems = MenuItem & { href?: string } & {
  children?: TMenuItems[]; // Recursive definition to allow children to have the same structure
};

const findHrefByKey = (items: TMenuItems[], key: string): string | undefined =>
  items.reduce<string | undefined>(
    (href, item) =>
      href ??
      (item.key === key
        ? item.href
        : item.children && findHrefByKey(item.children, key)),
    undefined,
  );

const filterMenuItemsByKey = (items: TMenuItems[], key: string): TMenuItems[] =>
  items.flatMap((item) =>
    item.key === key
      ? [item]
      : item.children
      ? [
          {
            ...item,
            children: filterMenuItemsByKey(item.children, key),
          },
        ].filter((child) => child.children?.length)
      : [],
  );

function Sidebar() {
  const { t } = useTranslation();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const activeSegment = useSelectedLayoutSegment();
  console.log("🚀 ~ Sidebar ~ activeSegment:", activeSegment);

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
    {
      key: "productsparent",
      icon: <ProductOutlined />,
      label: t("products.products"),
      children: [
        {
          key: "products",
          icon: <OrderedListOutlined />,
          label: t("products.list"),
          href: "/products",
        },
        {
          key: "productCategories",
          icon: <ApartmentOutlined />,
          label: t("products.categories"),
          href: "/products/categories",
        },
      ],
    },
  ];

  const onClick: MenuProps["onClick"] = (e) => {
    const href = findHrefByKey(menuItems, e.key);
    if (href) router.replace(href);
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
        defaultSelectedKeys={filterMenuItemsByKey(
          menuItems,
          activeSegment ?? "dashboard",
        ).map((item) => item.key as string)}
        items={menuItems}
      />
    </Sider>
  );
}

export default Sidebar;
