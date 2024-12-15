import { useGlobalStore } from "@/store";
import { EAdminRole } from "@/types";
import { clearSessionData, getAdminRole, getUserName } from "@/utils/helper";
import {
  ApartmentOutlined,
  HomeOutlined,
  OrderedListOutlined,
  ProductOutlined,
  ShopOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Layout, Menu } from "antd";
import { useRouter, useSelectedLayoutSegment } from "next/navigation";
import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import LogoutIcon from "/public/icons/common/logout.svg";

const { Sider } = Layout;

const siderStyle: React.CSSProperties = {
  height: "100vh",
  position: "sticky",
  insetInlineStart: 0,
  top: 0,
  bottom: 0,
  display: "flex",
  flexDirection: "column",
  scrollbarWidth: "thin",
  scrollbarGutter: "stable",
};

type MenuItem = Required<MenuProps>["items"][number];
type TMenuItems = MenuItem & { href?: string } & {
  children?: TMenuItems[];
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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const logout = useGlobalStore.use.signOut();
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

  // Get the user type
  const userType = getAdminRole();

  // Memoized filtering logic
  const filterMenuItems = useCallback(
    (items: TMenuItems[]) => {
      return items.filter((item) => {
        if (userType === EAdminRole.STORE_ADMIN && item.key === "stores") {
          return false; // Exclude "stores" for store admins
        }
        return true;
      });
    },
    [userType], // Dependency array
  );

  // Memoized filtered menu items
  const filteredMenuItems = useMemo(
    () => filterMenuItems(menuItems),
    [menuItems, filterMenuItems],
  );

  const userMenuItems = [
    {
      key: "logout",
      label: t("common.logout"),
      icon: <LogoutIcon width={14} />,
      onClick: () => {
        clearSessionData();
        logout();
      },
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
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {/* Main Menu */}
        <div className="py-6" style={{ flex: 1, overflow: "auto" }}>
          <Menu
            onClick={onClick}
            theme="dark"
            mode="inline"
            defaultSelectedKeys={filterMenuItemsByKey(
              filteredMenuItems,
              activeSegment ?? "dashboard",
            ).map((item) => item.key as string)}
            items={filteredMenuItems}
          />
        </div>

        {/* User Dropdown */}
        <div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={userMenuOpen ? ["user-menu"] : []}
            onClick={() => setUserMenuOpen((prev) => !prev)}
            items={[
              {
                key: "user-menu",
                icon: <UserOutlined />,
                label: !collapsed ? getUserName() : "",
                type: "submenu",
                children: userMenuItems,
              },
            ]}
          />
        </div>
      </div>
    </Sider>
  );
}

export default Sidebar;
