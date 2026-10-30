import { useLanguage } from "../../context/LanguageContext";
import { categories } from "../../data/catalog";
import { Icon } from "../common/Icon";
import { ProductImage } from "../common/ProductImage";
import { categoryImageProduct } from "../../data/visuals";
export function ProductCards({ ids }: { ids?: string[] | null }) {
  const { t } = useLanguage();
  return (
    <div className="product-grid">
      {categories
        .filter((c) => !ids || ids.includes(c.id))
        .map((c, index) => (
          <a className="product-card" href={"/products/" + c.id} key={index}>
            <div className="product-visual">
              <span className="product-index">
                {`0${categories.indexOf(c) + 1}`}
              </span>
              <ProductImage
                product={categoryImageProduct(c.id)}
                className="crystal official-product"
                loading="lazy"
              />
            </div>
            <div className="product-copy">
              <span className="product-abbr">{c.short}</span>
              <h3>{t(c.zh, c.en)}</h3>
              <p>{t(...c.tag)}</p>
              <span className="card-arrow">
                <Icon name="up" />
              </span>
            </div>
          </a>
        ))}
    </div>
  );
}
