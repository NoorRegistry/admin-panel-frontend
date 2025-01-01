import { http } from "@/api/http";
import endpoints from "@/constants/endpoints";
import {
  IAuthor,
  IPaginatedResponse,
  TCreateAuthor,
} from "@/types";

export const fetchAuthors = async () => {
  return await http.get<IPaginatedResponse<IAuthor>>(`${endpoints.guides.index}/authors`);
};

export const fetchAuthor = async (id: string) => {
  return await http.get<IAuthor>(`${endpoints.guides.index}/authors/${id}`);
};

export const patchAuthor = async (
  id: string,
  payload: Partial<TCreateAuthor>,
) => {
  return await http.patch<IAuthor>(
    `${endpoints.guides.index}/authors/${id}`,
    payload,
  );
};

export const postAuthor = async (payload: TCreateAuthor) => {
  return await http.post<IAuthor>(`${endpoints.guides.index}/authors`, payload);
};
