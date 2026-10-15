import { useLanguage } from "../context/LanguageContext";
import { categories } from "../data/catalog";
import { InternalLink } from "../components/common/InternalLink";
import { Crystal } from "../components/common/Crystal";
import { PageIntro } from "../components/common/PageIntro";
import { BomBanner } from "../components/sections/BomBanner";
import { ModelDetail } from "./ModelDetail";
import { ProductCatalog } from "../components/sections/ProductCatalog";
export function ProductDetail({ id }: { id: string }) {
  const { t } = useLanguage();
  const c = categories.find((x) => x.id === id);
  if (!c) return <ModelDetail id={id} />;
  return (
    <>
      <PageIntro
        eyebrow={c.short + " / FREQUENCY CONTROL"}
        title={t(c.zh, c.en)}
        desc={t(...c.desc)}
      />
      <>
        <section className="section container product-detail">
          <div className="detail-illustration">
            <Crystal />
            <small>
              {t(
                "封装示意，非具体型号实物图",
                "Package illustration, not a specific device",
              )}
            </small>
          </div>
          <div>
            <p className="eyebrow">SELECTION PARAMETERS</p>
            <h2>{t("选型关注点", "Key selection parameters")}</h2>
            <div className="parameter-table">
              {c.params.map((p, i) => (
                <div key={i}>
                  <span>{`0${i + 1}`}</span>
                  <strong>{t(p, c.ep[i])}</strong>
                  <span>{t("按项目需求确认", "Confirm for your design")}</span>
                </div>
              ))}
            </div>
            <p className="muted">
              {t(
                "在下方按系列查看封装、频率及电气参数，并下载原厂规格书。具体订货配置与供货情况请联系我们确认。",
                "Browse the series below for packages, frequencies, electrical parameters and manufacturer datasheets. Contact us to confirm ordering configurations and availability.",
              )}
            </p>
            <div className="action-row">
              <InternalLink
                to={"/contact?category=" + c.id}
                className="button primary"
                glyph="up"
              >
                {t("咨询此类产品", "Enquire about this product")}
              </InternalLink>
              <InternalLink
                to="/resources/selection"
                className="button secondary"
                glyph=""
              >
                {t("阅读选型指南", "Read selection guide")}
              </InternalLink>
            </div>
          </div>
        </section>
        <div className="container">
          <ProductCatalog category={c.id} />
          <BomBanner />
        </div>
      </>
    </>
  );
}
