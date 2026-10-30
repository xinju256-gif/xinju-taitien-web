import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { useRoute } from "../../context/RouterContext";
import { Icon } from "../common/Icon";
import { QRCode } from "../common/QRCode";
import { InternalLink } from "../common/InternalLink";

export function FloatingContact() {
  const { t, lang } = useLanguage();
  const { revision } = useRoute();
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const close = (restore = false) => {
    setOpen(false);
    if (restore) trigger.current?.focus();
  };
  useLayoutEffect(() => {
    if (open) closeButton.current?.focus();
  }, [open]);
  useEffect(() => {
    setOpen(false);
  }, [revision, lang]);
  useEffect(() => {
    const click = (event: MouseEvent) => {
      const target = event.target as Element;
      if (
        !target.closest(".floating-contact") ||
        target.closest('a[href^="/"]')
      )
        setOpen(false);
    };
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) close(true);
    };
    document.addEventListener("click", click);
    document.addEventListener("keydown", keydown);
    return () => {
      document.removeEventListener("click", click);
      document.removeEventListener("keydown", keydown);
    };
  }, [open]);
  return (
    <div className="floating-contact">
      <div
        className="contact-popover"
        id="contact-popover"
        role="dialog"
        aria-labelledby="popover-title"
        hidden={!open}
      >
        <button
          ref={closeButton}
          className="popover-close"
          data-action="close-contact"
          onClick={() => close(true)}
          aria-label={t("关闭", "Close")}
        >
          <Icon name="x" />
        </button>
        <h3 id="popover-title">
          {t("与我们聊聊您的需求", "Let’s talk about your project")}
        </h3>
        <p>{t("扫一扫添加企业微信", "Scan to connect on WeCom")}</p>
        <QRCode />
        <a href="tel:02162271972" className="phone-link">
          <Icon name="phone" />
          021-62271972
        </a>
        <InternalLink to="/contact">
          {t("更多联系方式", "More ways to connect")}
        </InternalLink>
      </div>
      <button
        ref={trigger}
        className="floating-button"
        data-action="contact"
        aria-expanded={open}
        aria-controls="contact-popover"
        onClick={() => setOpen((value) => !value)}
      >
        <Icon name={open ? "x" : "chat"} />
        <span>{t("联系顾问", "Contact us")}</span>
      </button>
    </div>
  );
}
