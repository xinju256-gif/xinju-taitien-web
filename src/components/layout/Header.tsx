import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { useRoute } from "../../context/RouterContext";
import { useSearch } from "../../context/SearchContext";
import { Brands } from "../common/Brands";
import { Icon } from "../common/Icon";

const navigation = [
  ["/products", "产品", "Products"],
  ["/applications", "应用", "Applications"],
  ["/resources", "技术资源", "Resources"],
  ["/about", "关于我们", "About"],
  ["/contact", "联系我们", "Contact"],
];

export function Header() {
  const { lang, t, toggleLanguage } = useLanguage();
  const { path, revision } = useRoute();
  const { query, setQuery, submit } = useSearch();
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    setOpen(false);
  }, [revision, lang]);
  useEffect(() => {
    const click = (event: MouseEvent) => {
      if ((event.target as Element).closest('a[href^="/"]')) setOpen(false);
    };
    const keydown = (event: KeyboardEvent) => {
      if (
        event.key === "Escape" &&
        open &&
        document.getElementById("contact-popover")?.hidden
      ) {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    document.addEventListener("click", click);
    document.addEventListener("keydown", keydown);
    return () => {
      document.removeEventListener("click", click);
      document.removeEventListener("keydown", keydown);
    };
  }, [open]);
  return (
    <>
      <div className="topline">
        <div className="container">
          <span>
            {t(
              "专注频率控制 · 连接每一份精准",
              "PRECISION IN EVERY CONNECTION",
            )}
          </span>
          <div className="top-contacts">
            <a href="tel:02162271972">
              <Icon name="phone" />
              021-62271972
            </a>
            <a className="top-email" href="mailto:taitien@simacity.com.cn">
              taitien@simacity.com.cn
            </a>
          </div>
        </div>
      </div>
      <header className={`site-header${open ? " menu-open" : ""}`}>
        <div className="container header-inner">
          <Brands />
          <nav
            className="nav"
            id="main-nav"
            aria-label={t("主导航", "Main navigation")}
          >
            {navigation.map(([url, zh, en]) => (
              <a
                key={url}
                href={`${url}`}
                className={path.startsWith(url) ? "active" : undefined}
                aria-current={path.startsWith(url) ? "page" : undefined}
              >
                {t(zh, en)}
              </a>
            ))}
          </nav>
          <div className="header-tools">
            <form className="search-form" data-form="search" onSubmit={submit}>
              <input
                name="q"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label={t("搜索产品或资料", "Search products or resources")}
                placeholder={t("搜索型号 / 资料", "Search products")}
              />
              <button type="submit" aria-label={t("搜索", "Search")}>
                <Icon name="search" />
              </button>
            </form>
            <a
              href="/search"
              className="compact-search"
              aria-label={t("站内搜索", "Site search")}
            >
              <Icon name="search" />
            </a>
            <button
              className="language"
              data-action="language"
              onClick={toggleLanguage}
              aria-label={t("切换英文", "Switch to Chinese")}
            >
              {lang === "zh" ? "EN" : "中"}
            </button>
            <button
              ref={menuButton}
              className="menu-toggle"
              data-action="menu"
              onClick={() => setOpen((value) => !value)}
              aria-controls="main-nav"
              aria-expanded={open}
              aria-label={t("打开菜单", "Open menu")}
            >
              <Icon name={open ? "x" : "menu"} />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
