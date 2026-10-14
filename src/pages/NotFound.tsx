import { useLanguage } from "../context/LanguageContext";
import { InternalLink } from "../components/common/InternalLink";
export function NotFound() {
  const { t } = useLanguage();
  return (
    <section className="section container empty-state">
      <p className="eyebrow">404</p>
      <h1>{t("页面未找到", "Page not found")}</h1>
      <p>
        {t(
          "您可以返回首页，或浏览产品与技术资源。",
          "Return home or explore our products and technical resources.",
        )}
      </p>
      <InternalLink to="/" className="button primary">
        {t("返回首页", "Back to home")}
      </InternalLink>
    </section>
  );
}
