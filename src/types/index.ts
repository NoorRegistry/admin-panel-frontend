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
  isActive: boolean;
  slug: string;
}

export type TEditorStore = Omit<IStore, "email" | "isActive">;

export interface IAuthor {
  id: string;
  nameEn: string;
  nameAr: string;
  image: string;
  _count: {
    guides: number;
  };
}

export type TCreateAuthor = Omit<IAuthor, "id" | "_count">;

export interface IShowAuthorInfoDrawerConfig {
  authorId?: string;
  open: boolean;
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
  status: EProductStatus;
  isActive: boolean;
  category: {
    name: string;
  };
  store: {
    name: string;
  };
  currencyCode: string;
}

export type TEditorProduct = Omit<
  IProduct,
  "storeId" | "categoryId" | "status" | "isActive" | "category" | "store"
>;
export interface IGuide {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  bannerImage: string;
  authorId: string;
  categoryId: string;
  status: EGuideStatus;
  isActive: boolean;
  contentEn?: string;
  contentAr?: string;
  category: {
    id: string;
    name: string;
  };
  author: {
    id: string;
    name: string;
  };
}

export interface IProductDetails extends IProduct {
  descriptionEn: string;
  descriptionAr: string;
}

export interface IGuideDetails extends IGuide {
  descriptionEn: string;
  descriptionAr: string;
  contentEn?: string;
  contentAr?: string;
}

export type TCreateProduct = Omit<IProductDetails, "id" | "store" | "category">;
export type TCreateGuide = Omit<IGuideDetails, "id" | "author" | "category">;

export interface IProductCategory {
  id: string;
  nameEn: string;
  nameAr: string;
  parentId: string | null;
  _count: {
    products: number;
  };
  children: IProductCategory[];
}

export interface IGuideCategory {
  id: string;
  nameEn: string;
  nameAr: string;
  parentId: string | null;
  _count: {
    guides: number;
  };
  children: IGuideCategory[];
}

export interface IProductCategoryDetails extends IProductCategory {
  descriptionEn: string;
  descriptionAr: string;
}

export type TCreateProductCategory = Omit<
  IProductCategoryDetails,
  "id" | "_count" | "children"
>;

export interface IGuideCategoryDetails extends IGuideCategory {
  descriptionEn: string;
  descriptionAr: string;
}

export type TCreateGuideCategory = Omit<
  IGuideCategoryDetails,
  "id" | "_count" | "children"
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

export type TUploadType =
  | "store"
  | "product"
  | "author"
  | "guide"
  | "guideContent";

export type TStatistics = {
  products?: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
  };
  registries?: {
    total: number;
    totalQuantity: number;
  };
  stores?: {
    active: number;
    inactive: number;
  };
  users?: {
    total: number;
  };
  storeAdmins?: {
    total: number;
  };
};

export enum EProductStatus {
  PENDING = "Pending",
  REJECTED = "Rejected",
  APPROVED = "Approved",
}

export enum EGuideStatus {
  DRAFT = "Draft",
  SUBMITTED = "Submitted",
  PUBLISHED = "Published",
}

export interface IQueryState {
  current: number;
  pageSize: number;
  search: string;
}

export interface IUpload {
  status: number;
  message: string;
  id: string;
  path: string;
}

export enum EQueryKeys {
  PRODUCT = "product",
  PRODUCTS = "products",
  GUIDE = "guide",
  GUIDES = "guides",
  CATEGORIES = "categories",
  STORES = "stores",
  RELATED_PRODUCTS = "related_products",
  AUTHORS = "authors",
  STATISTICS = "statistics",
  GUIDE_CATEGORIES = "guide_categories",
}
