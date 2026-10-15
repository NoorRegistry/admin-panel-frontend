import { http } from "@/api/http";
export type OrderStatus =
  "PENDING" | "CONFIRMED" | "DISPATCHED" | "DELIVERED" | "CANCELLED";
export type OrderAction =
  "confirm" | "dispatch" | "deliver" | "cancel" | "collect_cash";
export type OrderAddress = {
  fullName: string;
  phone: string;
  label: string;
  governorate?: string | null;
  addressType?: string;
  avenue?: string | null;
  area: string;
  block: string;
  street: string;
  building: string;
  floor?: string;
  apartment?: string;
  instructions?: string;
  latitude?: number;
  longitude?: number;
};
export type Order = {
  id: string;
  reference: string;
  createdAt: string;
  status: OrderStatus;
  paymentStatus: "UNPAID" | "PAID";
  customerName: string;
  customerEmail: string;
  phone: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  customerNote?: string;
  shippingAddress: OrderAddress;
  fulfilments?: { storeId: string; status: "NEW" | "PACKING" | "READY" }[];
  items: {
    storeId: string;
    id: string;
    nameEn: string;
    nameAr: string;
    storeNameEn: string;
    storeNameAr: string;
    image?: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  events?: {
    id: string;
    action: string;
    createdAt: string;
    actorName: string;
    note?: string;
  }[];
};
export type OrderFilters = {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  paymentStatus?: string;
  sort?: string;
  from?: string;
  to?: string;
};
export const fetchOrders = (params: OrderFilters) =>
  http.get<{ data: Order[]; total: number; totalPages: number }>(
    "/v1/api/admin/orders",
    { params },
  );
export const fetchOrder = (id: string) =>
  http.get<Order>(`/v1/api/admin/orders/${id}`);
export const updateOrder = (id: string, action: OrderAction, note?: string) =>
  http.post<Order>(`/v1/api/admin/orders/${id}/actions`, { action, note });
export type BulkOrderResult = {
  updated: number;
  failed: number;
  results: { id: string; ok: boolean; reference?: string; error?: string }[];
};
export const updateOrders = (
  ids: string[],
  action: OrderAction,
  note?: string,
) =>
  http.post<BulkOrderResult>("/v1/api/admin/orders/bulk-actions", {
    ids,
    action,
    note,
  });
export const addOrderNote = (id: string, note: string) =>
  http.post<Order>(`/v1/api/admin/orders/${id}/notes`, { note });
