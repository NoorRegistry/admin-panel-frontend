import "core-js/stable/atob";
import { jwtDecode } from "jwt-decode";

import { queryClient } from "@/api/queryClient";
import constants from "@/constants";
import {
  EAdminRole,
  IAccessToken,
  IPaginatedResponse,
  IProductCategory,
  TTokenInfo,
} from "@/types";
import { getStorageItem, setStorageItem } from "@/utils/storage";

export const isAuthenticated = (): boolean => {
  const token = getStorageItem(constants.ACCESS_TOKEN);
  let isValidToken = false;
  if (token) {
    const parsedToken = JSON.parse(token) as IAccessToken;
    isValidToken = Boolean(token && !isTokenExpired(parsedToken.accessToken));
  }
  return Boolean(isValidToken);
};

export const getAccessToken = (): string => {
  const token = getStorageItem(constants.ACCESS_TOKEN);
  return token ? (JSON.parse(token) as IAccessToken).accessToken : "";
};

export const getTokenExpireDate = (token: string) =>
  (jwtDecode(token).exp || 0) * 1000;

export const isTokenExpired = (token: string): boolean => {
  const jwtPayload = jwtDecode(token);
  // considering token expired before 60 seconds
  const isTokenExpired =
    jwtPayload.exp && (jwtPayload.exp - 60) * 1000 < Date.now();
  if (isTokenExpired) {
    // clearSessionData();
  }
  return Boolean(isTokenExpired);
};

export const clearSessionData = (): void => {
  setStorageItem(constants.ACCESS_TOKEN, null);
  // Clear react-query data
  queryClient.clear();
};

export const getUserName = () => {
  let name = "";
  const token = getStorageItem(constants.ACCESS_TOKEN);
  if (token) {
    const jwtPayload = jwtDecode<TTokenInfo>(token);
    name = jwtPayload.user.firstName + " " + jwtPayload.user.lastName;
  }
  return name;
};

export const getUserNameInitials = () => {
  const name = getUserName();
  const [firstName, ...restNames] = name.toUpperCase().trim().split(" ");

  if (!restNames.length) {
    return firstName.substring(0, 2);
  }

  const firstNameInitial = firstName[0];
  const lastNameInitial = restNames?.pop()![0];

  return `${firstNameInitial}${lastNameInitial}`;
};

export const updatePaginatedData = <T>(
  data: T,
  old?: IPaginatedResponse<T>,
  id?: string,
): IPaginatedResponse<T> => {
  if (!old) {
    // If no old data exists, initialize the response with the new data
    return {
      data: [data], // Add the new data as the only entry
      limit: null, // Set pagination values as appropriate
      page: null,
      total: 1,
      totalPages: null,
    };
  }

  if (id) {
    // Edit scenario: Update the object with the matching id
    return {
      ...old,
      data: old.data.map(
        (item) =>
          (item as any).id === id
            ? { ...item, ...data } // Merge the existing data with updated data
            : item, // Keep other objects unchanged
      ),
    };
  }

  // If old data exists, update the response
  return {
    ...old, // Preserve pagination metadata
    data: [data, ...old.data], // Add the new store to the beginning of the data array
    total: old.total + 1, // Update the total count
  };
};

/**
 * Function used for normalize file list on formItem for uplaod
 */
export const normalizeFile = (e: any) => {
  if (Array.isArray(e)) {
    return e;
  }
  return e?.fileList;
};

export const getAdminRole = () => {
  const token = getStorageItem(constants.ACCESS_TOKEN);
  if (token) {
    const jwtPayload = jwtDecode<TTokenInfo>(token);
    return jwtPayload.role;
  }
};

export const getAdminStoreId = () => {
  const token = getStorageItem(constants.ACCESS_TOKEN);
  if (token) {
    const jwtPayload = jwtDecode<TTokenInfo>(token);
    return jwtPayload.role === EAdminRole.STORE_ADMIN ? jwtPayload.storeId : "";
  }
};

export const formatNumber = (num: number): string => {
  return num.toLocaleString(undefined, { minimumIntegerDigits: 2 });
};

export const findCategoryPath = (
  categories: IProductCategory[],
  targetId: string,
): string[] => {
  for (const category of categories) {
    if (category.id === targetId) {
      return [category.id]; // Base case: return the ID when found.
    }

    if (category.children && Array.isArray(category.children)) {
      const path = findCategoryPath(category.children, targetId);
      if (path.length) {
        return [category.id, ...path]; // Append the current ID to the path.
      }
    }
  }
  return []; // Return an empty array if the ID is not found.
};
