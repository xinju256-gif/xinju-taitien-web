import { useSearch } from "../context/SearchContext";
import { useLanguage } from "../context/LanguageContext";
import { useRoute } from "../context/RouterContext";
import { categories, guides } from "../data/catalog";
import { normalizeSearch, searchProducts } from "../data/products";
import { Icon } from "../components/common/Icon";
import { InternalLink } from "../components/common/InternalLink";
import { PageIntro } from "../components/common/PageIntro";
import { ProductRows } from "../components/sections/ProductCatalog";

export function Search() {
  const { submit } = useSearch();
  const { t } = useLanguage();
  const route = useRoute();
  const q = (route.q.get("q") || "").trim();
  const normalized = normalizeSearch(q);
  const matches = (text: string) =>
    !!normalized && normalizeSearch(text).includes(normalized);
  const cs = categories.filter((c) =>
    matches([c.zh, c.en, c.short, c.brief, ...c.desc].join(" ")),
  );
  const gs = guides.filter((g) => matches([g.zh, g.en, ...g.desc].join(" ")));
  const ps = q ? searchProducts(q) : [];
  const total = ps.length + cs.length + gs.length;
  return (
    <>
      <PageIntro
        eyebrow="SITE SEARCH"
        title={t("站内搜索", "Site search")}
        desc={
          q
            ? t(`“${q}” 的搜索结果`, `Search results for “${q}”`)
            : t(
                "输入型号、产品名称或技术资料关键词。",
                "Enter a model, product name or technical keyword.",
              )
        }
      />
      <section className="section container">
        <form className="large-search" data-form="search" onSubmit={submit}>
          <Icon name="search" />
          <input
            name="q"
            defaultValue={q}
            required
            aria-label={t("搜索关键词", "Search terms")}
            placeholder={t(
              "例如 XY、TY、温补晶振、选型",
              "Try XY, TY, TCXO or selection",
            )}
          />
          <button className="button primary">{t("搜索", "Search")}</button>
        </form>
        <p className="muted" role="status">
          {t(
            `找到 ${total} 项内容，其中 ${ps.length} 个系列 / 产品条目`,
            `Found ${total} results, including ${ps.length} product / series entries`,
          )}
        </p>
        {ps.length > 0 && (
          <div className="catalog-search-results">
            <h2 className="catalog-search-heading">
              {t("型号与规格书", "Products & datasheets")}
            </h2>
            <ProductRows key={q} matches={ps} />
          </div>
        )}
        {(cs.length > 0 || gs.length > 0) && (
          <h2 className="catalog-search-heading">
            {t("产品分类与技术资源", "Product families & technical resources")}
          </h2>
        )}
        <div className="search-results">
          {cs.map((c) => (
            <a href={`/products/${c.id}`} key={c.id}>
              <Icon name="cpu" />
              <div>
                <h3>{`${t(c.zh, c.en)} · ${c.short}`}</h3>
                <p>{t(...c.desc)}</p>
              </div>
              <Icon name="arrow" />
            </a>
          ))}
          {gs.map((g) => (
            <a href={`/resources/${g.id}`} key={g.id}>
              <Icon name="file" />
              <div>
                <h3>{t(g.zh, g.en)}</h3>
                <p>{t(...g.desc)}</p>
              </div>
              <Icon name="arrow" />
            </a>
          ))}
        </div>
        {total === 0 && (
          <div className="empty-state">
            <Icon name="search" />
            <h2>{t("暂未找到匹配内容", "No matching content yet")}</h2>
            <p>
              {t(
                "可尝试系列型号、晶体、温补晶振等关键词，或联系我们核对完整订货料号。",
                "Try a series name, crystal or TCXO, or contact us to check a complete ordering code.",
              )}
            </p>
            <InternalLink to="/contact" className="button secondary" glyph="">
              {t("获取选型支持", "Get selection support")}
            </InternalLink>
          </div>
        )}
      </section>
    </>
  );
}
