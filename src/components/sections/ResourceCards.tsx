import { useLanguage } from "../../context/LanguageContext";
import { guides } from "../../data/catalog";
import { Icon } from "../common/Icon";
export function ResourceCards() {
  const { t } = useLanguage();
  return (
    <div className="resource-grid">
      {guides.map((g, index) => (
        <a className="resource-card" href={"#/resources/" + g.id} key={index}>
          <div className="resource-top">
            <Icon name="file" />
            <span>{t(...g.type)}</span>
          </div>
          <h3>{t(g.zh, g.en)}</h3>
          <p>{t(...g.desc)}</p>
          <span className="resource-bottom">
            {t("阅读与下载", "Read & download")}
            <Icon name="arrow" />
          </span>
        </a>
      ))}
    </div>
  );
}
