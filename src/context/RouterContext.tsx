import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

function readRoute() {
  const raw = location.hash.startsWith("#/") ? location.hash.slice(1) : "/";
  const position = raw.indexOf("?");
  return {
    path: position < 0 ? raw : raw.slice(0, position),
    q: new URLSearchParams(position < 0 ? "" : raw.slice(position + 1)),
    raw,
  };
}
const RouterContext = createContext<
  | (ReturnType<typeof readRoute> & {
      revision: number;
      navigate: (path: string) => void;
    })
  | null
>(null);

export function RouterProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState(readRoute);
  const [revision, setRevision] = useState(0);
  const refresh = () => {
    setRoute(readRoute());
    setRevision((value) => value + 1);
  };
  useEffect(() => {
    const onHashChange = () => {
      refresh();
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);
  const navigate = (path: string) => {
    if (location.hash === "#" + path) refresh();
    else location.hash = path;
  };
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
