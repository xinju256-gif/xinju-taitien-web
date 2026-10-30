import { useLanguage } from "../../context/LanguageContext";
import { categories } from "../../data/catalog";
import { applications } from "../../data/catalog";
import { InternalLink } from "../common/InternalLink";
import { Brands } from "../common/Brands";
import { QRCode } from "../common/QRCode";
export function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="site-footer">
      <div className="container footer-main">
        <div className="footer-brand">
          <Brands />
          <p>
            {t(
              "精准频率，可靠连接。",
              "Precision timing. Reliable connections.",
            )}
            <br />
            {t(
              "Taitien 频率控制元件选型与供货支持",
              "Taitien frequency control selection & supply support",
            )}
            <br />
            {t("中国 · 上海", "Shanghai, China")}
          </p>
        </div>
        <div className="footer-links">
          <h4>{t("产品中心", "Products")}</h4>
          {categories.map((c, index) => (
            <InternalLink
              to={"/products/" + c.id}
              className=""
              glyph=""
              key={index}
            >
              {t(c.brief, c.short)}
            </InternalLink>
          ))}
        </div>
        <div className="footer-links explore-links">
          <h4>{t("探索更多", "Explore")}</h4>
          <InternalLink to="/applications" className="" glyph="">
            {t("应用场景", "Applications")}
          </InternalLink>
          <InternalLink to="/resources" className="" glyph="">
            {t("技术资源", "Resources")}
          </InternalLink>
          <InternalLink to="/about" className="" glyph="">
            {t("关于我们", "About Simacity")}
          </InternalLink>
          <InternalLink to="/contact?subject=BOM" className="" glyph="">
            {t("BOM 询价", "BOM enquiry")}
          </InternalLink>
        </div>
        <div className="footer-contact">
          <h4>{t("联系我们", "Contact us")}</h4>
          <a href="tel:02162271972" className="footer-phone">
            021-62271972
          </a>
          <a href="mailto:taitien@simacity.com.cn">taitien@simacity.com.cn</a>
          <p>
            {t(
              "上海市长宁区延安西路2299号",
              "2299 Yan’an West Road, Changning, Shanghai",
            )}
          </p>
        </div>
        <div className="footer-qr">
          <QRCode small={true} />
          <span>{t("扫一扫添加企业微信", "Connect on WeCom")}</span>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>
          {"上海芯聚电子科技有限公司 " +
            t("保留所有权利", "All rights reserved.")}
        </span>
        <span>
          {t(
            "本网站由 Simacity 独立运营。",
            "Independently operated by Simacity.",
          )}
        </span>
        <a href="/contact">{t("联系与支持", "Contact & support")}</a>
      </div>
    </footer>
  );
}
