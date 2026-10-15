import { Layout } from "antd";
import React from "react";
import PrivateHeader from "./Header";
import Sidebar from "./Sidebar";
import styles from "./layout.module.css";
export default function PrivateLayoutContainer({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <Layout hasSider className={styles.layout}>
      <Sidebar />
      <Layout className={styles.main}>
        <PrivateHeader />
        <Layout.Content className={styles.content}>{children}</Layout.Content>
        <Layout.Footer className={styles.footer}>
          Shop Simplist © {new Date().getFullYear()}
        </Layout.Footer>
      </Layout>
    </Layout>
  );
}
