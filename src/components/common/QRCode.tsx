import wecom from "../../assets/wecom.jpg";
import { useLanguage } from "../../context/LanguageContext";

export function QRCode({ small = false }: { small?: boolean }) {
  const { t } = useLanguage();
  return (
    <div className={`qr-box${small ? " small" : ""}`}>
      <img src={wecom} alt={t("企业微信二维码", "WeCom QR code")} />
    </div>
  );
}
