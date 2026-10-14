import { useLanguage } from "../context/LanguageContext";
import { applications } from "../data/catalog";
import { Icon } from "../components/common/Icon";
import { SectionHeading } from "../components/common/SectionHeading";
import { PageIntro } from "../components/common/PageIntro";
import { ProductCards } from "../components/sections/ProductCards";
import { ApplicationCards } from "../components/sections/ApplicationCards";
import { BomBanner } from "../components/sections/BomBanner";
import { NotFound } from "./NotFound";
export function Applications({ id }: { id?: string }) {
  const { t } = useLanguage();
  if (!id)
    return (
      <>
        <PageIntro
          eyebrow="APPLICATIONS"
          title={t("以精准时钟，支持多元应用", "Timing for a connected world")}
          desc={t(
            "围绕实际工作条件，选择适合您的频率控制方案。",
            "Select frequency control solutions around real operating conditions.",
          )}
        />
        <>
          <section className="section container">
            <ApplicationCards />
          </section>
          <div className="container">
            <BomBanner />
          </div>
        </>
      </>
    );
  const a = applications.find((x) => x.id === id);
  if (!a) return <NotFound />;
  return (
    <>
      <PageIntro
        eyebrow="APPLICATION INSIGHT"
        title={t(a.zh, a.en)}
        desc={t(...a.desc)}
      />
      <>
        <section className="section container">
          <div className="application-story">
            <Icon name={a.icon} />
            <div>
              <h2>{t("从应用条件出发", "Start with the application")}</h2>
              <p>{t(...a.body)}</p>
            </div>
          </div>
          <SectionHeading
            eyebrow="EXPLORE TECHNOLOGIES"
            title={t("了解相关产品类别", "Explore relevant technologies")}
          />
          <ProductCards ids={a.types} />
        </section>
        <div className="container">
          <BomBanner />
        </div>
      </>
    </>
  );
}
