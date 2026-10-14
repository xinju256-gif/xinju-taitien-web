import { useLanguage } from "../context/LanguageContext";
import { QRCode } from "../components/common/QRCode";
import { EnquiryForm } from "../components/forms/EnquiryForm";
import { PageIntro } from "../components/common/PageIntro";
import { ContactInfo } from "../components/sections/ContactInfo";
export function Contact() {
  const { t } = useLanguage();
  return (
    <>
      <PageIntro
        eyebrow="CONTACT & ENQUIRY"
        title={t("一起找到合适的方案", "Let’s find your solution")}
        desc={t(
          "告诉我们您的型号、应用或选型需求。",
          "Tell us about your part numbers, application or selection requirements.",
        )}
      />
      <section className="section container contact-layout">
        <div>
          <h2>{t("联系我们", "Contact us")}</h2>
          <ContactInfo />
          <div className="contact-qr">
            <QRCode />
            <div>
              <h3>{t("扫一扫添加企业微信", "Add us on WeCom")}</h3>
              <p>
                {t("直接与我们的团队沟通", "Connect directly with our team")}
              </p>
            </div>
          </div>
        </div>
        <div className="enquiry-panel">
          <p className="eyebrow">BOM & TECHNICAL SUPPORT</p>
          <h2>{t("发送您的需求", "Prepare your enquiry")}</h2>
          <p className="muted">
            {t(
              "填写后生成询价邮件，由您的邮件应用发送。",
              "Complete the form to prepare a message in your email application.",
            )}
          </p>
          <div id="enquiry-content">
            <EnquiryForm />
          </div>
        </div>
      </section>
    </>
  );
}
