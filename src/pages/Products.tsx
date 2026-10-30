import { useLanguage } from "../context/LanguageContext";
import { useRoute } from "../context/RouterContext";
import { categories } from "../data/catalog";
import { Icon } from "../components/common/Icon";
import { InternalLink } from "../components/common/InternalLink";
import { Selector } from "../components/sections/Selector";
import { PageIntro } from "../components/common/PageIntro";
import { ProductCards } from "../components/sections/ProductCards";
import { ProductCatalog } from "../components/sections/ProductCatalog";
export function Products() {
  const { t } = useLanguage();
  const route = useRoute();
  const q = route.q,
    raw = q.get("category"),
    selected = categories.some((c) => c.id === raw) ? raw : "",
    frequency = q.get("frequency") || "";
  return (
    <>
      <PageIntro
        eyebrow="PRODUCTS & SELECTION"
        title={t("产品与快速选型", "Products & selection")}
        desc={t(
          "从应用需求出发，找到合适的频率控制方案。",
          "Find the right frequency control technology for your design.",
        )}
      />
      <section className="section container">
        <Selector compact={true} />
        <div className="filter-tabs">
          {[
            {
              id: "",
              short: t("全部产品", "All products"),
            },
            ...categories,
          ].map((c, index) => (
            <a
              className={selected === c.id ? "active" : ""}
              href={
                "/products?category=" +
                c.id +
                "&frequency=" +
                encodeURIComponent(frequency)
              }
              key={index}
            >
              {c.short}
            </a>
          ))}
        </div>
        {frequency ? (
          <div className="notice">
            <Icon name="sliders" />
            <div>
              {t("目标频率：", "Target frequency: ")}
              <strong>{`${frequency} MHz`}</strong>
              <p>
                {t(
                  "该条件将作为选型需求传递给技术支持。具体可供型号与参数请由团队确认。",
                  "This requirement will be shared with our team. Device availability and specifications require confirmation.",
                )}
              </p>
            </div>
            <InternalLink
              to={
                "/contact?category=" +
                selected +
                "&frequency=" +
                encodeURIComponent(frequency)
              }
              className="button secondary"
            >
              {t("发送选型需求", "Request selection")}
            </InternalLink>
          </div>
        ) : (
          ""
        )}
        <ProductCards ids={selected ? [selected] : null} />
        <ProductCatalog category={selected || ""} />
        <div className="info-panel">
          <Icon name="cpu" />
          <div>
            <h3>
              {t("有完整型号或 BOM？", "Already have a part number or BOM?")}
            </h3>
            <p>
              {t(
                "发送型号、数量及交期，由团队确认规格与供货情况。",
                "Send part numbers, quantities and delivery requirements for confirmation.",
              )}
            </p>
          </div>
          <InternalLink to="/contact?subject=BOM">
            {t("提交询价", "Send enquiry")}
          </InternalLink>
        </div>
      </section>
    </>
  );
}
