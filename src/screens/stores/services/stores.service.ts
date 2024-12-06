import { http } from "@/api/http";
import endpoints from "@/constants/endpoints";
import { IStore, TCreateStore } from "@/types";

export const fetchStores = async (): Promise<IStore[]> => {
  return await http.get<IStore[]>(endpoints.stores.index);
};

export const fetchStore = async (id: string): Promise<IStore[]> => {
  return await http.get<IStore[]>(`${endpoints.stores.index}/${id}`);
};

export const postStore = async (payload: TCreateStore): Promise<IStore> => {
  return await http.post<IStore>(endpoints.stores.index, payload);
};
