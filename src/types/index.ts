import type { TableProps } from "antd";

export type Unpacked<T> = T extends (infer U)[] ? U : T;

export interface IPaginatedResponse<T> {
  data: T[];
  limit: null | number;
  page: null | number;
  total: number;
  totalPages: null | number;
}

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

export interface IProduct {
  id: string;
  nameEn: string;
  nameAr: string;
  price: number;
  qty: number;
  images: any[];
  storeId: string;
  categoryId: string;
  category: {
    name: string;
  };
  store: {
    name: string;
  };
}

export interface IProductDetails extends IProduct {
  descriptionEn: string;
  descriptionAr: string;
}

export type TCreateProduct = Omit<IProductDetails, "id" | "store" | "category">;

export interface IProductCategory {
  id: string;
  nameEn: string;
  nameAr: string;
  _count: {
    products: number;
  };
}

export interface IProductCategoryDetails extends IProductCategory {
  descriptionEn: string;
  descriptionAr: string;
}

export type TCreateProductCategory = Omit<
  IProductCategoryDetails,
  "id" | "_count"
>;

export type TTokenInfo =
  | {
      user: {
        firstName: string;
        lastName: string;
        email: string;
      };
      role: EAdminRole.INTERNAL_ADMIN;
      permissions: "[]";
      iat: number;
      exp: number;
    }
  | {
      user: {
        firstName: string;
        lastName: string;
        email: string;
      };
      role: EAdminRole.STORE_ADMIN;
      storeId: string;
      permissions: "[]";
      iat: number;
      exp: number;
    };

export enum EAdminRole {
  INTERNAL_ADMIN = "INTERNAL_ADMIN",
  STORE_ADMIN = "STORE_ADMIN",
}

export interface IStoreAdmin {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  storeId: string;
  storeName: string;
  role: EAdminRole;
}

export type TCreateStoreAdmin = Omit<IStoreAdmin, "id" | "storeName" | "role">;

export type TUploadType = "store" | "product";
