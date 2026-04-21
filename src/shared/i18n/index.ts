import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en.json";
import ar from "./ar.json";

const defaultLang = navigator.language.startsWith("ar") ? "ar" : "en";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: defaultLang,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

i18n.on("languageChanged", (lng) => {
  document.documentElement.setAttribute("dir", lng === "ar" ? "rtl" : "ltr");
  document.documentElement.setAttribute("lang", lng);
});

document.documentElement.setAttribute("dir", defaultLang === "ar" ? "rtl" : "ltr");
document.documentElement.setAttribute("lang", defaultLang);

export default i18n;
