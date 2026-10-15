import { http } from "@/api/http";
import { OrderStatus } from "./orders.service";
export type StoreOrder = {
  id: string;
  reference: string;
  createdAt: string;
  status: "NEW" | "PACKING" | "READY";
  orderStatus: OrderStatus;
  acknowledgedAt: string | null;
  readyAt: string | null;
  area: string;
  value: number;
  quantity: number;
  items: {
    id: string;
    nameEn: string;
    nameAr: string;
    image?: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
};
export const fetchStoreOrders = (params: {
  page: number;
  limit: number;
  status?: string;
  search?: string;
}) =>
  http.get<{ data: StoreOrder[]; total: number; totalPages: number }>(
    "/v1/api/admin/store-orders",
    { params },
  );
export const fetchStoreOrder = (id: string) =>
  http.get<StoreOrder>(`/v1/api/admin/store-orders/${id}`);
export const updateStoreOrder = (id: string, action: "acknowledge" | "ready") =>
  http.post<StoreOrder>(`/v1/api/admin/store-orders/${id}/actions`, { action });
