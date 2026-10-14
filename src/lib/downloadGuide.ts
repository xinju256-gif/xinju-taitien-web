import { guides } from "../data/catalog";
import type { Translate } from "../context/LanguageContext";

export function downloadGuide(id: string, t: Translate) {
  const guide = guides.find((item) => item.id === id);
  if (!guide) return;
  const content =
    "# " +
    t(guide.zh, guide.en) +
    "\n\nSimacity · " +
    t("技术参考资料", "Technical reference") +
    "\n\n" +
    t(...guide.body) +
    "\n\n" +
    t(
      "本文由 Simacity 整理，不替代型号正式规格书。",
      "Prepared by Simacity. This guide does not replace official device specifications.",
    );
  const url = URL.createObjectURL(
    new Blob([content], { type: "text/markdown;charset=utf-8" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "simacity-" + id + ".md";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
