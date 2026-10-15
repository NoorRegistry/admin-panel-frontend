import { useGlobalStore } from "@/store";
import { EAdminRole } from "@/types";
import { clearSessionData, getAdminRole, getUserName } from "@/utils/helper";
import {
  CustomerServiceOutlined,
  ApartmentOutlined,
  GiftOutlined,
  HomeOutlined,
  OrderedListOutlined,
  ProductOutlined,
  ReadOutlined,
  ShopOutlined,
  ShoppingOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { fetchSupportRequests } from "@/services/support.service";
import { Badge } from "antd";
import type { MenuProps } from "antd";
import { Layout, Menu } from "antd";
import { usePathname, useRouter } from "next/navigation";
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
  background: "#fff",
  borderInlineEnd: "1px solid #f0ebe8",
  display: "flex",
  flexDirection: "column",
  scrollbarWidth: "thin",
  scrollbarGutter: "stable",
};

type MenuKey = string;
type MenuItem = Required<MenuProps>["items"][number];
type TMenuItems = MenuItem & { href?: string } & {
  children?: TMenuItems[];
  key: string;
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

const getKeys = (
  items: TMenuItems[],
  pathname: string,
): { selectedKeys: MenuKey[]; openKeys: MenuKey[] } => {
  let selectedKeys: MenuKey[] = [];
  let openKeys: MenuKey[] = [];

  for (const item of items) {
    // Direct match for selectedKeys
    if (item.href === pathname) {
      selectedKeys = [item.key];
    }

    // Check children for matches
    if (item.children) {
      const childResult = getKeys(item.children, pathname);
      if (childResult.selectedKeys.length > 0) {
        openKeys.push(item.key); // Include parent key for openKeys
        selectedKeys = childResult.selectedKeys;
        openKeys = [...openKeys, ...childResult.openKeys];
      }
    }
  }

  return { selectedKeys, openKeys };
};
function Sidebar() {
  const { t } = useTranslation();
  const router = useRouter();
  const support = useQuery({
    queryKey: ["support-unread"],
    queryFn: () => fetchSupportRequests({ filter: "unread", limit: 1 }),
    refetchInterval: 30000,
  });
  const [collapsed, setCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const logout = useGlobalStore.use.signOut();
  const pathname = usePathname();

  const menuItems: TMenuItems[] = useMemo(
    () => [
      {
        key: "dashboard",
        icon: <HomeOutlined />,
        label: t("common.dashboard"),
        href: "/",
      },
      {
        key: "orders",
        icon: <ShoppingOutlined />,
        label: t("orders.title"),
        href: "/orders",
      },
      {
        key: "support",
        icon: <CustomerServiceOutlined />,
        label: (
          <span>
            {t("support.title")}{" "}
            <Badge
              count={support.data?.total || 0}
              size="small"
              color="#CF8169"
            />
          </span>
        ),
        href: "/support",
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
      {
        key: "guidesparent",
        icon: <ReadOutlined />,
        label: t("guides.guides"),
        children: [
          {
            key: "guides",
            icon: <OrderedListOutlined />,
            label: t("guides.list"),
            href: "/guides",
          },
          {
            key: "guidesCategories",
            icon: <ApartmentOutlined />,
            label: t("guides.categories"),
            href: "/guides/categories",
          },
          {
            key: "authors",
            icon: <TeamOutlined />,
            label: t("guides.authors"),
            href: "/guides/authors",
          },
        ],
      },
      {
        key: "storeProfile",
        icon: <ShopOutlined />,
        label: t("overview.storeProfile"),
        href: "/store-profile",
      },
      {
        key: "registriesparent",
        icon: <GiftOutlined />,
        label: t("registries.registries"),
        children: [
          {
            key: "registryCategories",
            icon: <ApartmentOutlined />,
            label: t("registries.categories"),
            href: "/registries/categories",
          },
        ],
      },
    ],
    [t, support.data?.total],
  );
  const { selectedKeys, openKeys: initialOpenKeys } = getKeys(
    menuItems,
    pathname,
  );

  const [menuState, setMenuState] = useState({
    pathname,
    openKeys: initialOpenKeys,
  });
  const openKeys =
    menuState.pathname === pathname ? menuState.openKeys : initialOpenKeys;

  // Handler for submenu toggling
  const onOpenChange = (keys: MenuKey[]) => {
    setMenuState({ pathname, openKeys: keys });
  };

  // Get the user type
  const userType = getAdminRole();

  // Memoized filtering logic
  const filterMenuItems = useCallback(
    (items: TMenuItems[]) => {
      return items.filter((item) => {
        if (
          userType === EAdminRole.INTERNAL_ADMIN &&
          item.key === "storeProfile"
        )
          return false;
        if (
          userType === EAdminRole.STORE_ADMIN &&
          ["stores"].includes(item.key)
        ) {
          return false; // Exclude "stores" for store admins
        }
        if (
          userType === EAdminRole.STORE_ADMIN &&
          item.key === "registriesparent"
        ) {
          return false; // Exclude registry categories for store admins
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
      width={220}
      breakpoint="lg"
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
      className="overscroll-contain"
    >
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {/* Main Menu */}
        <div
          style={{
            padding: collapsed ? "22px 12px" : "22px 24px",
            borderBottom: "1px solid #f0ebe8",
            minHeight: 90,
          }}
        >
          <div
            style={{
              fontSize: collapsed ? 18 : 19,
              fontWeight: 600,
              color: "#935c4b",
              whiteSpace: "nowrap",
            }}
          >
            {collapsed ? "SS" : "Shop Simplist"}
          </div>
          {!collapsed && (
            <div style={{ fontSize: 11, color: "#81736d", marginTop: 3 }}>
              {t(
                userType === EAdminRole.INTERNAL_ADMIN
                  ? "overview.internalWorkspace"
                  : "overview.storeWorkspace",
              )}
            </div>
          )}
        </div>
        <div className="py-4" style={{ flex: 1, overflow: "auto" }}>
          <Menu
            onClick={onClick}
            theme="light"
            mode="inline"
            selectedKeys={selectedKeys}
            openKeys={openKeys}
            onOpenChange={onOpenChange}
            items={filteredMenuItems}
          />
        </div>

        {/* User Dropdown */}
        <div>
          <Menu
            theme="light"
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
