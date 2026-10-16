import { useLanguage } from "../context/LanguageContext";
import { applications } from "../data/catalog";
import { Icon } from "../components/common/Icon";
import { InternalLink } from "../components/common/InternalLink";
import { QRCode } from "../components/common/QRCode";
import { Selector } from "../components/sections/Selector";
import { ProductImage } from "../components/common/ProductImage";
import { categoryImageProduct } from "../data/visuals";
import { SectionHeading } from "../components/common/SectionHeading";
import { ProductCards } from "../components/sections/ProductCards";
import { ApplicationCards } from "../components/sections/ApplicationCards";
import { ResourceCards } from "../components/sections/ResourceCards";
import { BomBanner } from "../components/sections/BomBanner";
import { ContactInfo } from "../components/sections/ContactInfo";
export function Home() {
  const { t } = useLanguage();
  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div>
            <div className="hero-kicker">FREQUENCY CONTROL SOLUTIONS</div>
            <h1>
              {t("精准频率", "Precision timing.")}
              <br />
              <span>{t("连接无限可能", "Endless possibilities.")}</span>
            </h1>
            <p className="hero-description">
              {t(
                "从一颗晶体，到每一次可靠连接。",
                "From a single crystal to every reliable connection.",
              )}
              <br />
              {t(
                "为您的下一代设计，提供稳定的频率基准。",
                "A stable frequency reference for your next design.",
              )}
            </p>
            <p className="hero-identity">
              {t(
                "Simacity · Taitien 频率控制元件选型与供货支持",
                "Simacity · Taitien selection & supply support",
              )}
            </p>
            <div className="hero-actions">
              <InternalLink to="/products" className="button primary">
                {t("探索产品系列", "Explore products")}
              </InternalLink>
              <InternalLink to="/contact" className="hero-link" glyph="up">
                {t("联系技术支持", "Talk to our team")}
              </InternalLink>
            </div>
            <div className="hero-tags">
              {[
                ["专业选型支持", "Selection expertise"],
                ["多元应用覆盖", "Versatile applications"],
                ["一站式采购对接", "Sourcing support"],
              ].map((x, index) => (
                <span key={index}>
                  <Icon name="check" />
                  {t(x[0], x[1])}
                </span>
              ))}
            </div>
          </div>
          <div className="hero-art">
            <div className="orbit"></div>
            <div className="orbit second"></div>
            <span className="art-caption">ENGINEERED FOR PRECISION</span>
            <ProductImage
              product={categoryImageProduct("crystal")}
              className="crystal official-product"
            />
            <div className="art-label">
              QUARTZ CRYSTAL
              <small>
                {t("稳定，源于每一处细节", "Precision in every detail")}
              </small>
            </div>
            <span className="art-footnote">
              {t(
                "产品封装示意 · 实际外观以型号资料为准",
                "Package illustration · Refer to device documentation",
              )}
            </span>
          </div>
        </div>
      </section>
      <div className="container selector-shell">
        <Selector />
      </div>
      <section className="section container">
        <SectionHeading
          eyebrow="OUR PRODUCTS"
          title={t("为每一种设计，匹配精准时钟", "Precision for every design")}
          desc={t(
            "完整频率控制产品组合，从基础时钟到高稳定度解决方案。",
            "A complete range of technologies, from essential timing to high stability.",
          )}
          url="/products"
          label={t("全部产品", "All products")}
        />
        <ProductCards />
        <div className="product-note">
          <Icon name="shield" />
          <span>
            {t(
              "围绕频率、封装、稳定度与应用条件，为您提供选型支持。",
              "Selection support around frequency, package, stability and application requirements.",
            )}
          </span>
          <InternalLink to="/contact">
            {t("咨询选型", "Get support")}
          </InternalLink>
        </div>
      </section>
      <section className="section applications-section">
        <div className="container">
          <SectionHeading
            eyebrow="APPLICATIONS"
            title={t(
              "稳定表现，融入关键应用",
              "Reliable timing. Real-world applications.",
            )}
            desc={t(
              "面向多元行业需求，连接可靠的时钟与您的创新。",
              "Connecting dependable timing with your next innovation.",
            )}
            url="/applications"
            label={t("探索应用", "Explore applications")}
          />
          <ApplicationCards />
        </div>
      </section>
      <section className="section container">
        <SectionHeading
          eyebrow="KNOWLEDGE & SUPPORT"
          title={t("让选型更有依据", "Make an informed selection")}
          desc={t(
            "从参数理解到应用设计，获取您需要的技术支持。",
            "From understanding parameters to designing applications.",
          )}
          url="/resources"
          label={t("技术资源中心", "Resource center")}
        />
        <ResourceCards />
      </section>
      <div className="container">
        <BomBanner />
      </div>
      <section className="section container home-contact">
        <div>
          <p className="eyebrow">GET IN TOUCH</p>
          <h2>
            {t(
              "您的下一个设计，从这里开始",
              "Let’s talk about your next design.",
            )}
          </h2>
          <p className="section-description">
            {t(
              "选型、替代、供货，我们期待与您交流。",
              "Selection, alternatives and supply. We’re here to help.",
            )}
          </p>
          <ContactInfo />
        </div>
        <div className="wechat-contact">
          <QRCode />
          <div>
            <Icon name="chat" />
            <h3>{t("扫一扫，添加企业微信", "Connect with us on WeCom")}</h3>
            <p>
              {t(
                "直接沟通您的产品与项目需求",
                "Talk directly with our team about your project.",
              )}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
