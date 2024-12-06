import "core-js/stable/atob";
import { jwtDecode } from "jwt-decode";

import { queryClient } from "@/api/queryClient";
import constants from "@/constants";
import { IAccessToken } from "@/types";
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
    const jwtPayload = jwtDecode<any>(token);
    // TODO: Uncomment this when name thing works
    // name = jwtPayload.user.name;
    name = "Ashfaq Patwari";
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
