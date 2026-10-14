import { useLanguage } from "../../context/LanguageContext";
import { Icon } from "./Icon";
export function PageIntro({
  eyebrow,
  title,
  desc,
}: {
  eyebrow: string;
  title: string;
  desc: string;
}) {
  const { t } = useLanguage();
  return (
    <section className="page-intro">
      <div className="container">
        <div className="breadcrumbs">
          <a href="#/">{t("首页", "Home")}</a>
          <Icon name="chevron" />
          <span>{title}</span>
        </div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="description">{desc}</p>
      </div>
    </section>
  );
}
