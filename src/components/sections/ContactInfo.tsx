import { useLanguage } from "../../context/LanguageContext";
import { Icon } from "../common/Icon";
export function ContactInfo() {
  const { t } = useLanguage();
  return (
    <div className="contact-details">
      <a href="tel:02162271972">
        <Icon name="phone" />
        <div>
          <small>{t("电话咨询", "Call us")}</small>
          <strong>021-62271972</strong>
        </div>
      </a>
      <a href="mailto:taitien@simacity.com.cn">
        <Icon name="mail" />
        <div>
          <small>{t("邮件联系", "Email us")}</small>
          <strong>taitien@simacity.com.cn</strong>
        </div>
      </a>
      <div>
        <Icon name="pin" />
        <div>
          <small>{t("公司地址", "Visit us")}</small>
          <strong>
            {t(
              "上海市长宁区延安西路2299号",
              "2299 Yan’an West Road, Changning, Shanghai",
            )}
          </strong>
        </div>
      </div>
    </div>
  );
}
