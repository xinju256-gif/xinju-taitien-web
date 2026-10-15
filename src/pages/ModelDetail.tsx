import { useLanguage } from "../context/LanguageContext";
import {
  catalogDate,
  documentLabel,
  groupById,
  localAsset,
  productById,
  specLabel,
} from "../data/products";
import { Icon } from "../components/common/Icon";
import { InternalLink } from "../components/common/InternalLink";
import { PageIntro } from "../components/common/PageIntro";
import { DatasheetButton } from "../components/sections/ProductCatalog";
import { BomBanner } from "../components/sections/BomBanner";
import { NotFound } from "./NotFound";

export function ModelDetail({ id }: { id: string }) {
  const { t, lang } = useLanguage();
  const product = productById.get(id);
  if (!product) return <NotFound />;
  const group = groupById.get(product.category)!;
  return (
    <>
      <PageIntro
        eyebrow={`TAITIEN / ${group.short.toUpperCase()}`}
        title={`${product.model} · ${t(group.zh, group.en)}`}
        desc={t(product.nameZh, product.nameEn)}
      />
      <section className="section container catalog-model">
        <a
          className="catalog-back"
          href={`#/products?family=${product.category}`}
        >
          <Icon name="chevron" />
          {t("返回产品中心", "Back to product catalog")}
        </a>
        <div className="catalog-model-overview">
          <div className="catalog-model-image">
            <img
              src={localAsset(product.image)}
              alt={`Taitien ${product.model}`}
            />
            <span>{product.model}</span>
          </div>
          <div>
            <p className="eyebrow">PRODUCT SPECIFICATIONS</p>
            <h2>{t("产品参数", "Product specifications")}</h2>
            {product.notes.map((note, index) => (
              <p className="catalog-series-note" key={index}>
                {t(note[0], note[1])}
              </p>
            ))}
            <p className="catalog-subtitle" lang="en">
              {product.subtitle}
            </p>
            <dl className="catalog-specs">
              {product.overview.map((item, i) => (
                <div key={i}>
                  <dt>{specLabel(item.label, lang)}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
            <div className="action-row">
              <DatasheetButton product={product} />
              <InternalLink
                to={`/contact?category=${product.category}&product=${encodeURIComponent(product.id)}`}
                className="button primary"
                glyph="up"
              >
                {t("咨询此型号", "Enquire about this model")}
              </InternalLink>
            </div>
          </div>
        </div>
        <div className="catalog-model-sections">
          <section>
            <h2>{t("产品特性", "Product highlights")}</h2>
            <p className="catalog-source-label">
              {t("泰艺原厂资料（英文）", "Taitien manufacturer documentation")}
            </p>
            <ul className="catalog-highlights" lang="en">
              {product.highlights.map((text, i) => (
                <li key={i}>{text}</li>
              ))}
            </ul>
          </section>
          {product.tables.length > 0 && (
            <section>
              <h2>
                {t(
                  "详细规格与工作条件",
                  "Detailed specifications & operating conditions",
                )}
              </h2>
              <p className="catalog-source-label">
                {t(
                  "保留原厂参数及测试条件；各行条件分别对应，不代表所有组合均可提供。",
                  "Manufacturer parameters and conditions are preserved; rows describe individual configurations.",
                )}
              </p>
              {product.tables.map((table, i) => (
                <div
                  className="catalog-table-scroll"
                  key={i}
                  tabIndex={0}
                  role="region"
                  aria-label={t(
                    `规格表 ${i + 1}`,
                    `Specification table ${i + 1}`,
                  )}
                >
                  <table className="catalog-spec-table" lang="en">
                    <caption>{`${product.model} · ${t("规格表", "Specifications")} ${i + 1}`}</caption>
                    <tbody>
                      {table.map((row, j) => (
                        <tr key={j}>
                          {row.map((cell, k) =>
                            cell.header ? (
                              <th
                                key={k}
                                colSpan={cell.colSpan}
                                rowSpan={cell.rowSpan}
                              >
                                {cell.text}
                              </th>
                            ) : (
                              <td
                                key={k}
                                colSpan={cell.colSpan}
                                rowSpan={cell.rowSpan}
                              >
                                {cell.text}
                              </td>
                            ),
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </section>
          )}
          {product.applications.length > 0 && (
            <section>
              <h2>{t("原厂列示应用", "Manufacturer-listed applications")}</h2>
              <div className="catalog-tags" lang="en">
                {product.applications.map((name, i) => (
                  <span key={i}>{name}</span>
                ))}
              </div>
            </section>
          )}
          <section aria-labelledby="model-downloads">
            <h2 id="model-downloads">
              {t("技术资料下载", "Technical downloads")}
            </h2>
            <div className="catalog-documents">
              {product.documents.map((document) => (
                <a
                  key={document.path}
                  href={localAsset(document.path)}
                  download
                >
                  <Icon name="file" />
                  <div>
                    <strong>{documentLabel(document.label, lang)}</strong>
                    <span>
                      {document.format}
                      {document.pages
                        ? ` · ${document.pages} ${t("页", "pages")}`
                        : ""}{" "}
                      · {(document.bytes / 1024).toFixed(0)} KB
                    </span>
                  </div>
                  <Icon name="download" />
                </a>
              ))}
            </div>
            {product.requestDocuments.length > 0 && (
              <p className="catalog-source-note">
                {t(
                  "应用说明需另行申请。",
                  "Application notes are available on request.",
                )}{" "}
                <a
                  href={`#/contact?product=${product.id}&subject=application-notes`}
                >
                  {t("联系技术支持获取", "Contact technical support")}
                </a>
              </p>
            )}
          </section>
          <p className="catalog-source-note">
            {t(
              `资料来源：Taitien 泰艺电子公开产品资料，整理日期 ${catalogDate}。具体订货编码、可选参数与供货状态请结合原厂规格书确认。`,
              `Source: publicly available Taitien product documentation, collected ${catalogDate}. Confirm the exact ordering code, options and availability against the manufacturer datasheet.`,
            )}
          </p>
        </div>
        <BomBanner />
      </section>
    </>
  );
}
