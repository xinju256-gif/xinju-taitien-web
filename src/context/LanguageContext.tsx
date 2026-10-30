import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Language = "zh" | "en";
export type Translate = (zh: string, en: string) => string;
const LanguageContext = createContext<{
  lang: Language;
  t: Translate;
  toggleLanguage: () => void;
} | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>("zh");
  useEffect(() => {
    try {
      setLang(localStorage.getItem("simacity-language") === "en" ? "en" : "zh");
    } catch {
      /* Storage may be unavailable. */
    }
  }, []);
  const toggleLanguage = () => {
    const next = lang === "zh" ? "en" : "zh";
    try {
      localStorage.setItem("simacity-language", next);
    } catch {
      /* Storage may be unavailable. */
    }
    setLang(next);
  };
  return (
    <LanguageContext.Provider
      value={{ lang, t: (zh, en) => (lang === "zh" ? zh : en), toggleLanguage }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("LanguageProvider is required");
  return context;
}
