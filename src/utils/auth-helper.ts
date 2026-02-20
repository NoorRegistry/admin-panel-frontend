import constants from "@/constants";
import endpoints from "@/constants/endpoints";
import { IAccessToken } from "@/types";
import axios from "axios";
import { isTokenExpired } from "./helper";
import { getStorageItem, setStorageItem } from "./storage";

const clearStoredTokens = () => {
  setStorageItem(constants.ACCESS_TOKEN, null);
};

const getStoredTokens = (): IAccessToken | null => {
  const token = getStorageItem(constants.ACCESS_TOKEN);
  if (!token) return null;

  try {
    return JSON.parse(token) as IAccessToken;
  } catch (error) {
    console.error("Failed to parse stored token:", error);
    clearStoredTokens();
    return null;
  }
};

export const handleRefreshToken = async (): Promise<boolean> => {
  const parsedToken = getStoredTokens();
  if (!parsedToken) return false;

  if (isTokenExpired(parsedToken.refreshToken)) {
    clearStoredTokens();
    return false;
  }

  if (!isTokenExpired(parsedToken.accessToken)) {
    return true;
  }

  try {
    const response = await axios.post<IAccessToken>(
      `${process.env.NEXT_PUBLIC_API_URL}${endpoints.authentication.refreshToken}`,
      parsedToken,
      {
        headers: {
          Authorization: "Bearer " + parsedToken.accessToken,
          Accept: "application/json",
          "Content-Type": "application/json; charset=utf-8",
        },
      },
    );
    setStorageItem(constants.ACCESS_TOKEN, JSON.stringify(response.data));
    return true;
  } catch (error) {
    console.error("Problem retrieving refresh token:", error);
    clearStoredTokens();
    return false;
  }
};

export const getAuthorizationHeaders = () => {
  const parsedToken = getStoredTokens();
  if (parsedToken) {
    return { Authorization: `Bearer ${parsedToken.accessToken}` };
  }
};
