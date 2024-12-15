import { Layout, theme } from "antd";
import React from "react";
import PrivateHeader from "./Header";
import Sidebar from "./Sidebar";
const { Content, Footer } = Layout;

function PrivateLayoutContainer({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  return (
    <Layout hasSider>
      <Sidebar />
      <Layout>
        <PrivateHeader />

        <Content style={{ margin: "24px 16px 0", overflow: "initial" }}>
          <div
            style={{
              background: colorBgContainer,
            }}
            className="p-6 text-center rounded-lg"
          >
            {children}
          </div>
        </Content>
        <Footer className="text-center">
          ShiftGiftMe © {new Date().getFullYear()}
        </Footer>
      </Layout>
    </Layout>
  );
}

export default PrivateLayoutContainer;
