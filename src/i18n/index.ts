import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import "intl-pluralrules";
import ar from "./locales/ar/translations";
import en from "./locales/en/translations";

import constants from "@/constants";
import { getStorageItem } from "@/utils/storage";

export const resources = {
  en: {
    translation: en,
  },
  ar: {
    translation: ar,
  },
};

export const supportedLocales = Object.keys(resources);

const initI18n = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const langParam = urlParams.get(constants.USER_SELECTED_LANGUAGE_STORAGE_KEY);
  let selectedLanguage = getStorageItem(
    constants.USER_SELECTED_LANGUAGE_STORAGE_KEY,
  );

  if (!selectedLanguage) {
    selectedLanguage = "en";
  }

  i18n
    // pass the i18n instance to react-i18next.
    .use(initReactI18next)
    // init i18next
    // for all options read: https://www.i18next.com/overview/configuration-options
    .init({
      fallbackLng: "en",
      lng: langParam ?? selectedLanguage ?? "en",
      debug: false,
      resources,
      lowerCaseLng: true,
      interpolation: {
        escapeValue: false, // not needed for react as it escapes by default
      },
      missingKeyHandler: (options) => {
        console.error("missing key", options);
      },
    });
};

initI18n();

export default i18n;
