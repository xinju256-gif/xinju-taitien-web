import { useLanguage } from "../context/LanguageContext";
import { guides } from "../data/catalog";
import { Icon } from "../components/common/Icon";
import { InternalLink } from "../components/common/InternalLink";
import { PageIntro } from "../components/common/PageIntro";
import { ResourceCards } from "../components/sections/ResourceCards";
import { NotFound } from "./NotFound";
import { downloadGuide } from "../lib/downloadGuide";
export function Resources({ id }: { id?: string }) {
  const { t } = useLanguage();
  if (!id)
    return (
      <>
        <PageIntro
          eyebrow="TECHNICAL RESOURCES"
          title={t("技术资源中心", "Technical resources")}
          desc={t(
            "理解参数、梳理需求，让每一次选型更清晰。",
            "Understand specifications and make every selection clearer.",
          )}
        />
        <section className="section container">
          <ResourceCards />
          <div className="info-panel">
            <Icon name="file" />
            <div>
              <h3>{t("需要型号规格书？", "Need a device datasheet?")}</h3>
              <p>
                {t(
                  "提供完整型号，我们将协助获取对应版本的正式资料。",
                  "Share the complete part number for the right documentation.",
                )}
              </p>
            </div>
            <InternalLink
              to="/contact?subject=datasheet"
              className="button secondary"
            >
              {t("申请规格书", "Request datasheet")}
            </InternalLink>
          </div>
          <p className="muted">
            {t(
              "本站指南由 Simacity 整理，仅供基础选型参考；具体设计以型号正式规格书为准。",
              "These Simacity guides provide general selection support. Use official device specifications for design decisions.",
            )}
          </p>
        </section>
      </>
    );
  const g = guides.find((x) => x.id === id);
  if (!g) return <NotFound />;
  return (
    <>
      <PageIntro
        eyebrow="SIMACITY TECHNICAL GUIDE"
        title={t(g.zh, g.en)}
        desc={t(...g.desc)}
      />
      <section className="section container article-layout">
        <article>
          <p className="article-meta">
            {"SIMACITY · " +
              t("技术参考 / 中文", "Technical reference / English")}
          </p>
          {t(...g.body)
            .split("\n")
            .map((p, index) => (
              <p key={index}>{p}</p>
            ))}
          <div className="notice">
            {t(
              "本站整理的基础技术参考，不替代具体型号的正式规格书。",
              "General technical guidance, not a replacement for official device documentation.",
            )}
          </div>
        </article>
        <aside>
          <Icon name="file" />
          <h3>{t("保存这份参考", "Keep this reference")}</h3>
          <p>
            {t(
              "下载 Markdown 文本，便于项目沟通与需求整理。",
              "Download a Markdown copy for project discussions and requirements.",
            )}
          </p>
          <button
            className="button primary"
            onClick={() => downloadGuide(g.id, t)}
            data-action="download"
            data-guide={g.id}
          >
            <Icon name="download" />
            {t("下载指南 · MD", "Download guide · MD")}
          </button>
          <InternalLink to="/contact">
            {t("咨询技术支持", "Contact support")}
          </InternalLink>
        </aside>
      </section>
    </>
  );
}
