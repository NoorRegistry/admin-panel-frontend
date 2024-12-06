import type { TableProps } from "antd";

export type Unpacked<T> = T extends (infer U)[] ? U : T;

export interface IAccessToken {
  accessToken: string;
  refreshToken: string;
}

export interface IStore {
  id: string;
  locationEn: string;
  locationAr: string;
  mobileNumber: string;
  countryCode: string;
  email: string;
  nameEn: string;
  nameAr: string;
  storeLogo: string;
}

export interface IStoreDetails extends IStore {
  descriptionEn: string;
  descriptionAr: string;
}

export type TCreateStore = Omit<IStoreDetails, "id">;

export type ColumnsType<T extends object = object> = TableProps<T>["columns"];
