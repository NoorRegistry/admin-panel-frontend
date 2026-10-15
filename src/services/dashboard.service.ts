import { http } from "@/api/http";
import { StoreOrder } from "./store-orders.service";
export type DashboardRow = {
  id: string;
  reference: string;
  createdAt: string;
  status: string;
  customerName?: string;
  value: number;
  quantity: number;
  area?: string;
  items?: StoreOrder["items"];
  stores?: { nameEn: string; nameAr: string }[];
  readyStores?: number;
};
export type DashboardData = {
  role: "INTERNAL_ADMIN" | "STORE_ADMIN";
  store: {
    id: string;
    nameEn: string;
    nameAr: string;
    storeLogo?: string;
  } | null;
  range: { from: string; to: string };
  summary: {
    orders: number;
    value: number;
    quantity?: number;
    delivered: number;
    cancelled: number;
  };
  queues: {
    key: string;
    count: number;
    oldestAt: string | null;
    rows: DashboardRow[];
  }[];
  catalogue: {
    lowStock: number;
    outOfStock: number;
    pending: number;
    rejected: number;
    live: number;
    inventory: DashboardProduct[];
    approvals: DashboardProduct[];
  };
  trend: { date: string; count: number }[];
  activity: {
    id: string;
    orderId: string;
    reference: string;
    action: string;
    createdAt: string;
  }[];
};
export type DashboardProduct = {
  id: string;
  nameEn: string;
  nameAr: string;
  qty: number;
  status: string;
};
export const fetchDashboard = (from: string, to: string) =>
  http.get<DashboardData>("/v1/api/admin/statistics/dashboard", {
    params: { from, to },
  });
