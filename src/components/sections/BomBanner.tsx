import { useLanguage } from "../../context/LanguageContext";
import { InternalLink } from "../common/InternalLink";
export function BomBanner() {
  const { t } = useLanguage();
  return (
    <section className="bom-banner">
      <div>
        <p className="eyebrow">LET’S BUILD SOMETHING PRECISE</p>
        <h2>
          {t(
            "让每一个频率，都找到合适的答案。",
            "The right frequency. The right solution.",
          )}
        </h2>
        <p>
          {t(
            "发送您的 BOM 或选型需求，我们为您提供产品选型与供货支持。",
            "Share your BOM or requirements for selection and supply support.",
          )}
        </p>
      </div>
      <InternalLink
        to="/contact?subject=BOM"
        className="button white"
        glyph="up"
      >
        {t("BOM 询价", "BOM enquiry")}
      </InternalLink>
    </section>
  );
}
