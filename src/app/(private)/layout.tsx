"use client";

import PrivateLayoutContainer from "@/components/Layout/PrivateLayout";
import { useGlobalStore } from "@/store";
import { LoadingOutlined } from "@ant-design/icons";
import { Flex, Spin } from "antd";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [loading, setloading] = useState(true);
  const router = useRouter();
  const isAuthenticated = useGlobalStore.use.isAuthenticated();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    } else {
      setloading(false);
    }
  }, [isAuthenticated, router]);

  return (
    <>
      {loading ? (
        <Flex align="center" justify="center" gap="middle" className="h-screen">
          <Spin indicator={<LoadingOutlined spin />} size="large" />
        </Flex>
      ) : (
        <PrivateLayoutContainer>{children}</PrivateLayoutContainer>
      )}
    </>
  );
}

export default PrivateLayout;
