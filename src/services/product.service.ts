import { http } from "@/api/http";
import endpoints from "@/constants/endpoints";
import {
  IPaginatedResponse,
  IProduct,
  IProductCategory,
  IProductDetails,
  TCreateProduct,
  TCreateProductCategory,
} from "@/types";

export const fetchProducts = async () => {
  return await http.get<IPaginatedResponse<IProduct>>(endpoints.products.index);
};

export const fetchProduct = async (id: string) => {
  return await http.get<IProductDetails>(`${endpoints.products.index}/${id}`);
};

export const postProduct = async (payload: TCreateProduct) => {
  return await http.post<IProduct>(endpoints.products.index, payload);
};

export const patchProduct = async (id: string, payload: TCreateProduct) => {
  return await http.patch<IProduct>(
    `${endpoints.products.index}/${id}`,
    payload,
  );
};

export const fetchProductCategories = async () => {
  return await http.get<IPaginatedResponse<IProductCategory>>(
    `${endpoints.products.index}/categories`,
  );
};

export const fetchProductCategoriesForStore = async (id: string) => {
  return await http.get<IPaginatedResponse<IProductCategory>>(
    `${endpoints.products.index}/categories/stores/${id}`,
  );
};

export const fetchProductCategory = async (id: string) => {
  return await http.get<IProductCategory>(
    `${endpoints.products.index}/categories/${id}`,
  );
};

export const postProductCategory = async (payload: TCreateProductCategory) => {
  return await http.post<IProductCategory>(
    `${endpoints.products.index}/categories`,
    payload,
  );
};

export const patchProductCategory = async (
  id: string,
  payload: TCreateProductCategory,
) => {
  return await http.patch<IProductCategory>(
    `${endpoints.products.index}/categories/${id}`,
    payload,
  );
};
