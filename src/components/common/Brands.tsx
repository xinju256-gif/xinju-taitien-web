import simacity from "../../assets/simacity.jpg";
import taitien from "../../assets/taitien.png";
import { useLanguage } from "../../context/LanguageContext";

export function Brands() {
  const { t } = useLanguage();
  return (
    <a
      href="#/"
      className="brands"
      aria-label={`Simacity Taitien ${t("首页", "Home")}`}
    >
      <span className="brand simacity">
        <img src={simacity} alt="SIMACITY" />
      </span>
      <span className="brand-divider" />
      <span className="brand taitien">
        <img src={taitien} alt="TAITIEN 泰艺" />
      </span>
    </a>
  );
}
