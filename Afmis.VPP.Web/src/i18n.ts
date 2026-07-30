import i18n from "i18next";
import detector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import translationENG from "./locales/en.json";
import translationPashto from "./locales/ps.json";
import translationDari from "./locales/dr.json";
import { applyLanguageDirection, normalizeLang } from "./utilities/languageDirection";



// translations
const resources = {
  en: {
    translation: translationENG,
  },
  ps: {
    translation: translationPashto,
  },
  fa: {
    translation: translationDari,
  },
};

// init language from storage
const storedLang = localStorage.getItem("I18N_LANGUAGE") || "ps";
const initialLang = normalizeLang(storedLang);
applyLanguageDirection(initialLang);
if (!localStorage.getItem("I18N_LANGUAGE")) {
  localStorage.setItem("I18N_LANGUAGE", "ps");
}

i18n
  .use(detector)
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLang,
    fallbackLng: "ps",

    keySeparator: false,

    interpolation: {
      escapeValue: false,
    },
  })
  .catch((e) => {
    console.error("i18n initialization error:", e);
  });

// always apply correct direction
i18n.on("languageChanged", (lang: string) => {
  const normalized = normalizeLang(lang);
  applyLanguageDirection(normalized);
});

export default i18n;