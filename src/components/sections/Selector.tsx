import { useState, type FormEvent } from "react";
import { categories } from "../../data/catalog";
import { useLanguage } from "../../context/LanguageContext";
import { useRoute } from "../../context/RouterContext";
import { Icon } from "../common/Icon";

export function Selector({ compact = false }: { compact?: boolean }) {
  const { t } = useLanguage();
  const { q, navigate } = useRoute();
  const [category, setCategory] = useState(q.get("category") || "");
  const [frequency, setFrequency] = useState(q.get("frequency") || "");
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate(
      "/products?category=" +
        encodeURIComponent(category) +
        "&frequency=" +
        encodeURIComponent(frequency),
    );
  };
  return (
    <form
      className={`selector${compact ? " compact" : ""}`}
      data-form="selector"
      onSubmit={submit}
    >
      <div className="selector-title">
        <Icon name="sliders" />
        <div>
          <strong>{t("快速选型", "Quick selection")}</strong>
          <span>
            {t("从您的设计需求开始", "Start with your design requirements")}
          </span>
        </div>
      </div>
      <label>
        {t("产品类别", "Product type")}
        <select
          name="category"
          aria-label={t("产品类别", "Product type")}
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          <option value="">{t("选择产品类别", "Select product type")}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {t(c.zh, c.en)} ({c.short})
            </option>
          ))}
        </select>
      </label>
      <label>
        {t("目标频率", "Target frequency")}
        <div className="frequency-field">
          <input
            name="frequency"
            type="number"
            min="0.001"
            step="any"
            aria-label={t("目标频率 MHz", "Target frequency MHz")}
            placeholder={t("输入频率", "Enter frequency")}
            value={frequency}
            onChange={(event) => setFrequency(event.target.value)}
          />
          <span>MHz</span>
        </div>
      </label>
      <button className="button primary" type="submit">
        {t("开始选型", "Find a solution")}
        <Icon name="arrow" />
      </button>
    </form>
  );
}
