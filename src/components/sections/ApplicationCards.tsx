import { useLanguage } from "../../context/LanguageContext";
import { applications } from "../../data/catalog";
import { Icon } from "../common/Icon";
import { ApplicationImage } from "../common/ApplicationImage";
export function ApplicationCards() {
  const { t } = useLanguage();
  return (
    <div className="application-grid">
      {applications.map((a, i) => (
        <a className="application-card" href={"/applications/" + a.id} key={i}>
          <div className="app-graphic">
            <ApplicationImage application={a.id} loading="lazy" />
            <span>{`0${i + 1}`}</span>
          </div>
          <div className="app-copy">
            <h3>{t(a.zh, a.en)}</h3>
            <p>{t(...a.desc)}</p>
            <Icon name="up" />
          </div>
        </a>
      ))}
    </div>
  );
}
