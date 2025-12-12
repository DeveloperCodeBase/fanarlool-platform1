import { createContext, useContext, useEffect, useMemo, useState } from "react";

const LanguageContext = createContext({
  lang: "fa",
  toggleLanguage: () => {},
});

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState("fa");

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "fa" ? "rtl" : "ltr";
  }, [lang]);

  const toggleLanguage = () => setLang((prev) => (prev === "fa" ? "en" : "fa"));

  const value = useMemo(() => ({ lang, toggleLanguage }), [lang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => useContext(LanguageContext);
