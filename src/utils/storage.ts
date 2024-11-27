export function setStorageItem(key: string, value: string | null) {
  try {
    if (value === null) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, value);
    }
  } catch (e) {
    console.error("Local storage is unavailable:", e);
  }
}

export function getStorageItem(key: string) {
  try {
    if (typeof localStorage !== "undefined") {
      return localStorage.getItem(key);
    }
  } catch (e) {
    console.error("Local storage is unavailable:", e);
  }
}

export function getCookieItem(name: string) {
  const regex = new RegExp(`(^| )${name}=([^;]+)`);
  const match = document.cookie.match(regex);
  if (match) {
    return match[2];
  }
}

export function deleteCookieItem(name: string) {
  document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:01 GMT;";
}

const storageHelper = {
  setStorageItem,
  getStorageItem,
  getCookieItem,
  deleteCookieItem,
};

export default storageHelper;
