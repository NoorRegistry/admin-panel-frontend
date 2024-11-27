"use client";

import React, { useEffect, useState } from "react";
import { LoadingOutlined } from "@ant-design/icons";
import { Flex, Spin } from "antd";
import { useGlobalStore } from "@/store";
import { useRouter } from "next/navigation";

function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [loading, setloading] = useState(true);
  const router = useRouter();
  const isAuthenticated = useGlobalStore.use.isAuthenticated();
  console.log("isauthenticated :>> ", isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    } else {
      setloading(false);
    }
  }, []);

  return (
    <>
      {loading ? (
        <Flex align="center" gap="middle">
          <Spin indicator={<LoadingOutlined spin />} size="small" />
          <Spin indicator={<LoadingOutlined spin />} />
          <Spin indicator={<LoadingOutlined spin />} size="large" />
          <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
        </Flex>
      ) : (
        children
      )}
      <div></div>
    </>
  );
}

export default PrivateLayout;
