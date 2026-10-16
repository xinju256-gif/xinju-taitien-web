import { useLanguage } from "../../context/LanguageContext";
import { localAsset, type Product } from "../../data/products";

export function ProductImage({
  product,
  className,
  loading,
  decorative = false,
}: {
  product: Product;
  className?: string;
  loading?: "lazy" | "eager";
  decorative?: boolean;
}) {
  const { t } = useLanguage();
  return (
    <img
      className={className}
      src={localAsset(product.image)}
      alt={
        decorative
          ? ""
          : t(
              `泰艺 ${product.model} 官方产品图`,
              `Taitien ${product.model} official product image`,
            )
      }
      loading={loading}
      data-product-image={product.id}
    />
  );
}
