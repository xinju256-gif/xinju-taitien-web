import { useLayoutEffect, useRef } from "react";
import { LanguageProvider, useLanguage } from "./context/LanguageContext";
import { RouterProvider, useRoute } from "./context/RouterContext";
import { SearchProvider } from "./context/SearchContext";
import { EnquiryProvider } from "./context/EnquiryContext";
import { ToastProvider } from "./context/ToastContext";
import { IconSprite } from "./components/common/IconSprite";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { FloatingContact } from "./components/layout/FloatingContact";
import { Home } from "./pages/Home";
import { Products } from "./pages/Products";
import { ProductDetail } from "./pages/ProductDetail";
import { Applications } from "./pages/Applications";
import { Resources } from "./pages/Resources";
import { About } from "./pages/About";
import { Contact } from "./pages/Contact";
import { Search } from "./pages/Search";
import { NotFound } from "./pages/NotFound";
import { applySeo } from "./lib/seo";

function PageRouter() {
  const { path } = useRoute();
  const parts = path.split("/").filter(Boolean);
  if (!parts.length) return <Home />;
  if (parts.length > 2) return <NotFound />;
  switch (parts[0]) {
    case "products":
      return parts[1] ? <ProductDetail id={parts[1]} /> : <Products />;
    case "applications":
      return <Applications id={parts[1]} />;
    case "resources":
      return <Resources id={parts[1]} />;
    case "about":
      return parts.length === 1 ? <About /> : <NotFound />;
    case "contact":
      return parts.length === 1 ? <Contact /> : <NotFound />;
    case "search":
      return parts.length === 1 ? <Search /> : <NotFound />;
    default:
      return <NotFound />;
  }
}

function SiteLayout() {
  const { lang } = useLanguage();
  const { revision, path } = useRoute();
  const main = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    applySeo(path, lang);
  }, [lang, revision, path]);
  return (
    <>
      <IconSprite />
      <a
        href="#main"
        className="skip-link"
        data-action="skip"
        onClick={(event) => {
          event.preventDefault();
          main.current?.focus();
        }}
      >
        跳至主要内容 / Skip to content
      </a>
      <div id="header">
        <Header />
      </div>
      <main ref={main} id="main" tabIndex={-1}>
        <PageRouter key={revision} />
      </main>
      <div id="footer">
        <Footer />
      </div>
      <div id="floating">
        <FloatingContact />
      </div>
    </>
  );
}

export default function App({ initialPath = "/" }: { initialPath?: string }) {
  return (
    <LanguageProvider>
      <RouterProvider initialPath={initialPath}>
        <SearchProvider>
          <EnquiryProvider>
            <ToastProvider>
              <SiteLayout />
            </ToastProvider>
          </EnquiryProvider>
        </SearchProvider>
      </RouterProvider>
    </LanguageProvider>
  );
}
