import { useLanguage } from "../context/LanguageContext";
import { Icon } from "../components/common/Icon";
import { InternalLink } from "../components/common/InternalLink";
import { PageIntro } from "../components/common/PageIntro";
export function About() {
  const { t } = useLanguage();
  return (
    <>
      <PageIntro
        eyebrow="ABOUT SIMACITY"
        title={t("连接产品与您的设计", "Connecting products with your design")}
        desc={t(
          "专注频率控制元件的选型沟通与采购支持。",
          "Focused on frequency control selection and sourcing support.",
        )}
      />
      <section className="section container about-layout">
        <div>
          <p className="eyebrow">SIMACITY × TAITIEN</p>
          <h2>
            {t(
              "从技术需求，到采购对接",
              "From technical requirements to sourcing",
            )}
          </h2>
          <p>
            {t(
              "Simacity 为 Taitien 频率控制产品提供选型与供货沟通支持。我们围绕频率、封装、稳定度、工作环境和交期，协助客户整理需求并确认合适的产品方向。",
              "Simacity supports the selection and sourcing of Taitien frequency control products. We help clarify frequency, package, stability, operating conditions and delivery requirements.",
            )}
          </p>
          <p>
            {t(
              "本网站由 Simacity 独立运营。产品资料、供货情况及具体服务范围，请与我们的团队确认。",
              "This website is independently operated by Simacity. Contact our team to confirm product documentation, availability and services.",
            )}
          </p>
          <InternalLink to="/contact" className="button primary">
            {t("与我们联系", "Get in touch")}
          </InternalLink>
        </div>
        <div className="service-stack">
          {[
            ["cpu", "选型沟通", "Selection support"],
            ["file", "BOM 需求整理", "BOM coordination"],
            ["chat", "持续项目对接", "Project communication"],
          ].map(([i, zh, en], n) => (
            <div key={n}>
              <Icon name={i} />
              <strong>{t(zh, en)}</strong>
              <span>{`0${n + 1}`}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
