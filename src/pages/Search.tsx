import { useSearch } from "../context/SearchContext";
import { useLanguage } from "../context/LanguageContext";
import { useRoute } from "../context/RouterContext";
import { categories } from "../data/catalog";
import { guides } from "../data/catalog";
import { Icon } from "../components/common/Icon";
import { InternalLink } from "../components/common/InternalLink";
import { PageIntro } from "../components/common/PageIntro";
export function Search() {
  const { submit } = useSearch();
  const { t } = useLanguage();
  const route = useRoute();
  const q = (route.q.get("q") || "").trim(),
    matches = (s: string) => q && s.toLowerCase().includes(q.toLowerCase()),
    cs = categories.filter((c) =>
      matches([c.zh, c.en, c.short, c.brief, ...c.desc].join(" ")),
    ),
    gs = guides.filter((g) => matches([g.zh, g.en, ...g.desc].join(" ")));
  return (
    <>
      <PageIntro
        eyebrow="SITE SEARCH"
        title={t("站内搜索", "Site search")}
        desc={
          q
            ? t(`“${q}” 的搜索结果`, `Search results for “${q}”`)
            : t(
                "输入产品类别、技术关键词或资料名称。",
                "Enter a product category or technical topic.",
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
              "例如 TCXO、晶体、选型",
              "Try TCXO, crystal or selection",
            )}
          />
          <button className="button primary">{t("搜索", "Search")}</button>
        </form>
        <p className="muted">
          {t(
            `找到 ${cs.length + gs.length} 项内容`,
            `Found ${cs.length + gs.length} results`,
          )}
        </p>
        <div className="search-results">
          {cs.map((c, index) => (
            <a href={"#/products/" + c.id} key={index}>
              <Icon name="cpu" />
              <div>
                <h3>{`${t(c.zh, c.en)} · ${c.short}`}</h3>
                <p>{t(...c.desc)}</p>
              </div>
              <Icon name="arrow" />
            </a>
          ))}
          {gs.map((g, index) => (
            <a href={"#/resources/" + g.id} key={index}>
              <Icon name="file" />
              <div>
                <h3>{t(g.zh, g.en)}</h3>
                <p>{t(...g.desc)}</p>
              </div>
              <Icon name="arrow" />
            </a>
          ))}
        </div>
        {cs.length + gs.length === 0 ? (
          <div className="empty-state">
            <Icon name="search" />
            <h2>{t("暂未找到匹配内容", "No matching content yet")}</h2>
            <p>
              {t(
                "可尝试晶体、XO、TCXO 等关键词。具体型号请联系团队确认。",
                "Try crystal, XO or TCXO. For specific part numbers, contact our team.",
              )}
            </p>
            <InternalLink to="/contact" className="button secondary" glyph="">
              {t("获取选型支持", "Get selection support")}
            </InternalLink>
          </div>
        ) : (
          ""
        )}
      </section>
    </>
  );
}
