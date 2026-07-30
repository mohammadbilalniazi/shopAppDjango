const rtlLanguageCodes = new Set(["fa", "ps"]);

export const normalizeLang = (lang: string) => {
  if (lang === "dr") return "fa";
  return lang;
};

export const isRtlLanguage = (lang: string): boolean => {
  const normalized = normalizeLang(lang);
  return rtlLanguageCodes.has(normalized);
};

export const applyLanguageDirection = (lang: string): void => {
  if (typeof document === "undefined") return;

  const normalized = normalizeLang(lang);

  const direction = rtlLanguageCodes.has(normalized) ? "rtl" : "ltr";

  document.documentElement.dir = direction;
  document.body.dir = direction;
};