"use client";

import PrivateLayoutContainer from "@/components/Layout/PrivateLayout";
import { useGlobalStore } from "@/store";
import { handleRefreshToken } from "@/utils/auth-helper";
import { LoadingOutlined } from "@ant-design/icons";
import { Flex, Spin } from "antd";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isAuthenticated = useGlobalStore.use.isAuthenticated();
  const [loading, setLoading] = useState(() => !isAuthenticated);
  const router = useRouter();
  const signIn = useGlobalStore.use.signIn();

  useEffect(() => {
    if (isAuthenticated) {
      setLoading(false);
      return;
    }

    let isCancelled = false;

    const handleAuthentication = async () => {
      const refreshSucceeded = await handleRefreshToken();
      if (isCancelled) return;

      if (refreshSucceeded) {
        signIn();
        return;
      }

      router.replace("/login");
    };

    handleAuthentication();

    return () => {
      isCancelled = true;
    };
  }, [isAuthenticated, router, signIn]);

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
