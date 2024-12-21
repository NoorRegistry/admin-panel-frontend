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
import { usePathname, useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  const [collapsed, setCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const logout = useGlobalStore.use.signOut();
  const pathname = usePathname();
  console.log("pathname: " + pathname);
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
  const { selectedKeys, openKeys: initialOpenKeys } = getKeys(
    menuItems,
    pathname,
  );

  // State for openKeys to allow user interaction
  const [openKeys, setOpenKeys] = useState<MenuKey[]>(initialOpenKeys);

  // Update openKeys if pathname changes
  useEffect(() => {
    const { openKeys: newOpenKeys } = getKeys(menuItems, pathname);
    setOpenKeys(newOpenKeys);
  }, [pathname]);

  // Handler for submenu toggling
  const onOpenChange = (keys: MenuKey[]) => {
    console.log("onOpenChange", keys);
    setOpenKeys(keys); // Update openKeys based on user interaction
  };

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

  const onClick: MenuProps["onClick"] = (e: TMenuItems) => {
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
            selectedKeys={selectedKeys}
            openKeys={openKeys}
            onOpenChange={onOpenChange}
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
