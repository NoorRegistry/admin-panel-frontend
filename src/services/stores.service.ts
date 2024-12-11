import { http } from "@/api/http";
import endpoints from "@/constants/endpoints";
import {
  IPaginatedResponse,
  IStore,
  IStoreAdmin,
  TCreateStore,
  TCreateStoreAdmin,
} from "@/types";

export const fetchStores = async () => {
  return await http.get<IPaginatedResponse<IStore>>(endpoints.stores.index);
};

export const fetchStore = async (id: string) => {
  return await http.get<IStore>(`${endpoints.stores.index}/${id}`);
};

export const postStore = async (payload: TCreateStore) => {
  return await http.post<IStore>(endpoints.stores.index, payload);
};

export const patchStore = async (id: string, payload: TCreateStore) => {
  return await http.patch<IStore>(`${endpoints.stores.index}/${id}`, payload);
};

export const postStoreAdmin = async (payload: TCreateStoreAdmin) => {
  return await http.post<IStoreAdmin>(
    endpoints.authentication.register,
    payload,
  );
};
