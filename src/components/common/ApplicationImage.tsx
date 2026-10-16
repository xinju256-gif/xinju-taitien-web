import { useLanguage } from "../../context/LanguageContext";
import { localAsset } from "../../data/products";
import { applicationImage } from "../../data/visuals";

export function ApplicationImage({
  application,
  className = "",
  loading,
}: {
  application: string;
  className?: string;
  loading?: "lazy" | "eager";
}) {
  const { t } = useLanguage();
  const image = applicationImage(application);
  return (
    <img
      className={`official-application ${className}`.trim()}
      src={localAsset(image.path)}
      alt={t(image.alt[0], image.alt[1])}
      loading={loading}
      data-application-image={application}
    />
  );
}
