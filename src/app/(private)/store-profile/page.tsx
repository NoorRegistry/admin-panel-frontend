"use client";
import StoreDetailsCollapse from "@/components/StoreCollapse";
import { EAdminRole } from "@/types";
import { getAdminRole } from "@/utils/helper";
import { Result } from "antd";
export default function StoreProfilePage() {
  return getAdminRole() === EAdminRole.STORE_ADMIN ? (
    <StoreDetailsCollapse />
  ) : (
    <Result status="403" />
  );
}
