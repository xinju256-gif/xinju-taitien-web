import { useState, type FormEvent } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { useRoute } from "../../context/RouterContext";
import {
  catalogDate,
  datasheetOf,
  groupById,
  localAsset,
  overviewValue,
  productGroups,
  productPath,
  searchProducts,
  type Product,
  type ProductMatch,
} from "../../data/products";
import { Icon } from "../common/Icon";
import { ProductImage } from "../common/ProductImage";

export function DatasheetButton({ product }: { product: Product }) {
  const { t } = useLanguage();
  const document = datasheetOf(product);
  return (
    <a
      className="button secondary catalog-download"
      href={localAsset(document.path)}
      download
      aria-label={t(
        `下载 ${product.model} Datasheet`,
        `Download ${product.model} Datasheet`,
      )}
    >
      <Icon name="download" />
      {t("下载 Datasheet", "Download Datasheet")}
    </a>
  );
}

export function ProductRows({
  matches,
  pageSize = 12,
}: {
  matches: ProductMatch[];
  pageSize?: number;
}) {
  const { t } = useLanguage();
  const [page, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(matches.length / pageSize));
  const current = Math.min(page, pages);
  const visible = matches.slice((current - 1) * pageSize, current * pageSize);
  return (
    <>
      <div className="catalog-results">
        {visible.map(({ product, seriesMatch }) => {
          const group = groupById.get(product.category)!;
          return (
            <article
              className="catalog-row"
              key={product.id}
              data-product={product.id}
            >
              <a
                className="catalog-image"
                href={`${productPath(product)}`}
                tabIndex={-1}
                aria-hidden="true"
              >
                <ProductImage product={product} decorative loading="lazy" />
              </a>
              <div className="catalog-copy">
                <span className="catalog-type">{t(group.zh, group.en)}</span>
                <h3>
                  <a href={`${productPath(product)}`}>{product.model}</a>
                </h3>
                <p className="catalog-name">
                  {t(product.nameZh, product.nameEn)}
                </p>
                <dl className="catalog-summary">
                  <div>
                    <dt>{t("频率", "Frequency")}</dt>
                    <dd>
                      {overviewValue(
                        product,
                        /^(Freq\.|Frequency Range|Standard Frequenc)/,
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt>{t("封装", "Package")}</dt>
                    <dd>
                      {overviewValue(product, /^(Package Size|Diameter)/)}
                    </dd>
                  </div>
                  <div>
                    <dt>{t("输出", "Output")}</dt>
                    <dd>{overviewValue(product, /^Output/i)}</dd>
                  </div>
                </dl>
                {seriesMatch && (
                  <p className="catalog-series-note">
                    {t(
                      "系列匹配：订货后缀与具体参数请按型号编码指南确认。",
                      "Series match: confirm the ordering suffix and specifications in the numbering guide.",
                    )}
                  </p>
                )}
              </div>
              <div className="catalog-actions">
                <DatasheetButton product={product} />
                <a
                  className="catalog-detail-link"
                  href={`${productPath(product)}`}
                >
                  {t("查看型号详情", "View product details")}
                  <Icon name="arrow" />
                </a>
              </div>
            </article>
          );
        })}
      </div>
      {pages > 1 && (
        <nav
          className="catalog-pagination"
          aria-label={t("产品分页", "Product pagination")}
        >
          <button
            className="button secondary"
            disabled={current === 1}
            onClick={() => setPage(current - 1)}
          >
            {t("上一页", "Previous")}
          </button>
          <span aria-live="polite">
            {t(`第 ${current} / ${pages} 页`, `Page ${current} / ${pages}`)}
          </span>
          <button
            className="button secondary"
            disabled={current === pages}
            onClick={() => setPage(current + 1)}
          >
            {t("下一页", "Next")}
          </button>
        </nav>
      )}
    </>
  );
}

export function ProductCatalog({ category = "" }: { category?: string }) {
  const { t } = useLanguage();
  const { q, navigate, path } = useRoute();
  const query = q.get("q") || "";
  const group =
    category || (groupById.has(q.get("family") || "") ? q.get("family")! : "");
  const matches = searchProducts(query, group);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const params = new URLSearchParams(q);
    params.set("q", String(form.get("q") || "").trim());
    if (!category) params.set("family", String(form.get("family") || ""));
    navigate(`${path}?${params}`);
  }
  return (
    <section className="catalog" aria-labelledby="catalog-title">
      <div className="catalog-heading">
        <div>
          <p className="eyebrow">TAITIEN PRODUCT CATALOG</p>
          <h2 id="catalog-title">
            {t("型号与规格书", "Products & datasheets")}
          </h2>
        </div>
        <p>
          {t("原厂公开资料", "Manufacturer documentation")} · {catalogDate}
        </p>
      </div>
      <form className="catalog-filter" onSubmit={submit}>
        <label>
          <span>{t("型号 / 产品名称", "Model / product name")}</span>
          <input
            name="q"
            defaultValue={query}
            placeholder={t("例如 XY、TY、温补晶振", "Try XY, TY or TCXO")}
          />
        </label>
        {!category && (
          <label>
            <span>{t("产品分类", "Product family")}</span>
            <select name="family" defaultValue={group}>
              <option value="">{t("全部分类", "All families")}</option>
              {productGroups.map((item) => (
                <option value={item.id} key={item.id}>
                  {t(item.zh, item.en)}
                </option>
              ))}
            </select>
          </label>
        )}
        <button className="button primary">
          <Icon name="search" />
          {t("查找型号", "Find products")}
        </button>
      </form>
      <p className="catalog-count" role="status">
        {t(
          `找到 ${matches.length} 个系列 / 产品条目`,
          `${matches.length} product / series entries`,
        )}
        <span>
          {t(
            "同名型号的不同系列分别列出，具体配置请查看规格书。",
            "Variants are listed separately; refer to each datasheet for configurations.",
          )}
        </span>
      </p>
      {matches.length ? (
        <ProductRows key={`${query}/${group}`} matches={matches} />
      ) : (
        <div className="catalog-empty">
          <h3>{t("暂未找到匹配型号", "No matching products")}</h3>
          <p>
            {t(
              "请尝试系列型号或产品类别，也可提交完整料号协助核对。",
              "Try a series name or product family, or send the full ordering code for assistance.",
            )}
          </p>
          <a href="/contact" className="button secondary">
            {t("联系选型支持", "Contact support")}
          </a>
        </div>
      )}
    </section>
  );
}
