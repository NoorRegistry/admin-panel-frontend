import { http } from "@/api/http";
import endpoints from "@/constants/endpoints";
import {
  IAuthor,
  IGuide,
  IGuideCategory,
  IGuideDetails,
  IPaginatedResponse,
  TCreateAuthor,
  TCreateGuide,
  TCreateGuideCategory,
} from "@/types";

export const fetchAuthors = async () => {
  return await http.get<IPaginatedResponse<IAuthor>>(
    `${endpoints.guides.index}/authors`,
  );
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

export const fetchGuideCategories = async () => {
  return await http.get<IPaginatedResponse<IGuideCategory>>(
    `${endpoints.guides.index}/categories`,
  );
};

export const fetchGuideCategory = async (id: string) => {
  return await http.get<IGuideCategory>(
    `${endpoints.guides.index}/categories/${id}`,
  );
};

export const postGuideCategory = async (payload: TCreateGuideCategory) => {
  return await http.post<IGuideCategory>(
    `${endpoints.guides.index}/categories`,
    payload,
  );
};

export const patchGuideCategory = async (
  id: string,
  payload: TCreateGuideCategory,
) => {
  return await http.patch<IGuideCategory>(
    `${endpoints.guides.index}/categories/${id}`,
    payload,
  );
};

export const patchGuide = async (
  id: string,
  payload: Partial<TCreateGuide>,
) => {
  return await http.patch<IGuide>(`${endpoints.guides.index}/${id}`, payload);
};

export const fetchGuides = async (
  page: number,
  limit: number,
  search: string,
) => {
  return await http.get<IPaginatedResponse<IGuide>>(
    `${
      endpoints.guides.index
    }?page=${page}&limit=${limit}&nameEn=${encodeURIComponent(search)}`,
  );
};

export const postGuide = async (payload: TCreateGuide) => {
  return await http.post<IGuide>(endpoints.guides.index, payload);
};

export const fetchGuide = async (id: string) => {
  return await http.get<IGuideDetails>(`${endpoints.guides.index}/${id}`);
};
