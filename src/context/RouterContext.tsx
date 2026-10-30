import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export function normalizePath(path: string) {
  return path.replace(/\/+$/, "") || "/";
}
function readRoute(raw: string) {
  const url = new URL(raw, "https://taitien-cn.com");
  return { path: normalizePath(url.pathname), q: url.searchParams, raw };
}
// Fragments never reach the server; retain legacy query parameters and history.
export function migrateLegacyRoute() {
  if (!location.hash.startsWith("#/")) return false;
  const target = new URL(location.hash.slice(1), location.origin);
  if (target.origin !== location.origin) return false;
  history.replaceState(null, "", target.pathname + target.search + target.hash);
  return true;
}
const RouterContext = createContext<
  | (ReturnType<typeof readRoute> & {
      revision: number;
      navigate: (path: string) => void;
    })
  | null
>(null);

export function RouterProvider({
  children,
  initialPath = "/",
}: {
  children: ReactNode;
  initialPath?: string;
}) {
  const [route, setRoute] = useState(() => readRoute(initialPath));
  const [revision, setRevision] = useState(0);
  function refresh() {
    migrateLegacyRoute();
    setRoute(readRoute(location.pathname + location.search));
    setRevision((value) => value + 1);
  }
  function navigate(path: string) {
    const target = new URL(path, location.origin);
    if (target.origin !== location.origin) return;
    history.pushState(null, "", target.pathname + target.search + target.hash);
    refresh();
    window.scrollTo(0, 0);
  }
  useEffect(() => {
    refresh();
    const change = () => {
      refresh();
      window.scrollTo(0, 0);
    };
    const click = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const anchor = (event.target as Element).closest<HTMLAnchorElement>(
        "a[href]",
      );
      if (
        !anchor ||
        anchor.hasAttribute("download") ||
        (anchor.target && anchor.target !== "_self")
      )
        return;
      const href = anchor.getAttribute("href")!;
      if (!href.startsWith("/") || href.startsWith("//")) return;
      const target = new URL(anchor.href);
      // Downloads and images retain native browser behavior.
      if (
        target.origin !== location.origin ||
        /\.[a-z0-9]+$/i.test(target.pathname)
      )
        return;
      event.preventDefault();
      navigate(target.pathname + target.search + target.hash);
    };
    window.addEventListener("popstate", change);
    window.addEventListener("hashchange", change);
    document.addEventListener("click", click);
    return () => {
      window.removeEventListener("popstate", change);
      window.removeEventListener("hashchange", change);
      document.removeEventListener("click", click);
    };
  }, []);
  return (
    <RouterContext.Provider value={{ ...route, revision, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}
export function useRoute() {
  const context = useContext(RouterContext);
  if (!context) throw new Error("RouterProvider is required");
  return context;
}
