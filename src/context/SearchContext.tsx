import {
  createContext,
  useContext,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { useRoute } from "./RouterContext";
import { directProductMatch, productPath } from "../data/products";

const SearchContext = createContext<{
  query: string;
  setQuery: (query: string) => void;
  submit: (event: FormEvent<HTMLFormElement>) => void;
} | null>(null);
export function SearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState("");
  const { navigate } = useRoute();
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = String(
      new FormData(event.currentTarget).get("q") || "",
    ).trim();
    setQuery(next);
    const exact = directProductMatch(next);
    navigate(
      exact ? productPath(exact) : "/search?q=" + encodeURIComponent(next),
    );
  };
  return (
    <SearchContext.Provider value={{ query, setQuery, submit }}>
      {children}
    </SearchContext.Provider>
  );
}
export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) throw new Error("SearchProvider is required");
  return context;
}
