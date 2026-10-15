import LanguageMenu from "@/components/LanguageMenu";
import { HomeOutlined } from "@ant-design/icons";
import { Breadcrumb, Layout } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import styles from "./header.module.css";
export default function PrivateHeader() {
  const { t } = useTranslation();
  const path = usePathname();
  const label = path.startsWith("/support")
    ? t("support.title")
    : path.startsWith("/orders")
      ? t("orders.title")
      : path.startsWith("/products")
        ? t("products.products")
        : path.startsWith("/stores")
          ? t("stores.stores")
          : path.startsWith("/guides")
            ? t("guides.guides")
            : path.startsWith("/registries")
              ? t("registries.registries")
              : path.startsWith("/store-profile")
                ? t("overview.storeProfile")
                : t("common.dashboard");
  return (
    <Layout.Header className={styles.header}>
      <Breadcrumb
        items={[
          {
            title: (
              <Link href="/" aria-label={t("common.dashboard")}>
                <HomeOutlined />
              </Link>
            ),
          },
          { title: label },
        ]}
      />
      <div className={styles.tools}>
        <LanguageMenu />
      </div>
    </Layout.Header>
  );
}
