import { http } from "@/api/http";
export const supportTopics = [
  "ORDERS",
  "REGISTRIES",
  "GIFTS",
  "FRIENDS",
  "ACCOUNT",
  "APP",
] as const;
export type SupportTopic = (typeof supportTopics)[number];
export type SupportMessage = {
  id: number;
  clientId: string;
  sender: "REQUESTER" | "SUPPORT" | "SYSTEM";
  actorName: string;
  body: string;
  createdAt: string;
};
export type SupportRequest = {
  id: string;
  subject: string;
  topic: SupportTopic;
  status: "OPEN" | "RESOLVED";
  source: "CUSTOMER" | "STORE";
  requesterName: string;
  requesterEmail?: string;
  store?: { nameEn: string; nameAr: string } | null;
  orderId: string | null;
  orderReference: string | null;
  createdAt: string;
  updatedAt: string;
  lastMessage: SupportMessage | null;
  unreadCount: number;
};
export type SupportDetail = SupportRequest & {
  messages: SupportMessage[];
  nextBefore: number | null;
};
export type SupportArticle = {
  id: string;
  topic: SupportTopic;
  titleEn: string;
  titleAr: string;
  bodyEn: string;
  bodyAr: string;
  published: boolean;
  position: number;
};
export type SupportArticleInput = Omit<SupportArticle, "id">;
const base = "/v1/api/admin/support";
export const fetchSupportRequests = (params: {
  page?: number;
  limit?: number;
  status?: string;
  source?: string;
  topic?: string;
  search?: string;
  filter?: string;
}) =>
  http.get<{ data: SupportRequest[]; total: number; totalPages: number }>(
    base,
    { params },
  );
export const fetchSupportDetail = (id: string, before?: number) =>
  http.get<SupportDetail>(`${base}/${id}`, { params: { before } });
export const createSupportRequest = (body: {
  id: string;
  subject: string;
  topic: SupportTopic;
  message: string;
  orderId?: string;
}) => http.post<SupportDetail>(base, body);
export const sendSupportReply = (
  id: string,
  body: { clientId: string; message: string },
) => http.post<SupportDetail>(`${base}/${id}/messages`, body);
export const readSupportRequest = (id: string, through: number) =>
  http.post(`${base}/${id}/read`, { through });
export const setSupportStatus = (id: string, status: "OPEN" | "RESOLVED") =>
  http.patch<SupportDetail>(`${base}/${id}/status`, { status });
export const fetchSupportArticles = () =>
  http.get<SupportArticle[]>(`${base}/articles`);
export const saveSupportArticle = (body: SupportArticleInput, id?: string) =>
  id
    ? http.patch<SupportArticle>(`${base}/articles/${id}`, body)
    : http.post<SupportArticle>(`${base}/articles`, body);
