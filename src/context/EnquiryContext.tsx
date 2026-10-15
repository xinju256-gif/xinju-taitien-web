import {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { categories } from "../data/catalog";
import { useRoute } from "./RouterContext";
import { productById } from "../data/products";

export interface EnquiryDraft {
  name: string;
  company: string;
  email: string;
  phone: string;
  message: string;
}
export interface PreparedEnquiry {
  body: string;
  subject: string;
}
interface EnquiryState {
  draft: EnquiryDraft;
  setDraft: Dispatch<SetStateAction<EnquiryDraft>>;
  bomFile: File | null;
  setBomFile: Dispatch<SetStateAction<File | null>>;
  prepared: PreparedEnquiry | null;
  setPrepared: Dispatch<SetStateAction<PreparedEnquiry | null>>;
}
const EnquiryContext = createContext<EnquiryState | null>(null);

export function EnquiryProvider({ children }: { children: ReactNode }) {
  const { path, q } = useRoute();
  const key = q.toString();
  const lastContactKey = useRef("");
  const [draft, setDraft] = useState<EnquiryDraft>({
    name: "",
    company: "",
    email: "",
    phone: "",
    message: "",
  });
  const [bomFile, setBomFile] = useState<File | null>(null);
  const [prepared, setPrepared] = useState<PreparedEnquiry | null>(null);
  useLayoutEffect(() => {
    if (path !== "/contact" || lastContactKey.current === key) return;
    lastContactKey.current = key;
    setPrepared(null);
    const params = new URLSearchParams(key);
    const category = categories.find(
      (item) => item.id === params.get("category"),
    );
    const product = productById.get(params.get("product") || "");
    const message = [
      category ? "Product: " + category.short : "",
      product ? "Model: " + product.model + "\nSeries: " + product.nameEn : "",
      params.get("frequency")
        ? "Frequency: " + params.get("frequency") + " MHz"
        : "",
      params.get("subject") === "datasheet" ? "Datasheet request" : "",
      params.get("subject") === "application-notes"
        ? "Application notes request"
        : "",
    ]
      .filter(Boolean)
      .join("\n");
    setDraft((value) => ({ ...value, message }));
  }, [path, key]);
  return (
    <EnquiryContext.Provider
      value={{ draft, setDraft, bomFile, setBomFile, prepared, setPrepared }}
    >
      {children}
    </EnquiryContext.Provider>
  );
}
export function useEnquiry() {
  const context = useContext(EnquiryContext);
  if (!context) throw new Error("EnquiryProvider is required");
  return context;
}
