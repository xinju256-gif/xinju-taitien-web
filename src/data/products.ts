import snapshot from "./products.json" with { type: "json" };

export interface ProductDocument {
  label: string;
  path: string;
  bytes: number;
  pages?: number;
  format: string;
}
export interface Product {
  id: string;
  model: string;
  nameZh: string;
  nameEn: string;
  category: string;
  subtitle: string;
  overview: { label: string; value: string }[];
  highlights: string[];
  tables: {
    text: string;
    header: boolean;
    colSpan: number;
    rowSpan: number;
  }[][][];
  applications: string[];
  features: string[];
  image: string;
  documents: ProductDocument[];
  requestDocuments: string[];
  aliases: string[];
  notes: string[][];
}
export const products: Product[] = snapshot.products;
export const catalogDate = snapshot.fetchedAt;
export const productGroups = [
  {
    id: "crystal",
    short: "XTAL",
    zh: "石英晶体",
    en: "Quartz Crystals",
    aliases: "无源晶振 晶体 谐振器 crystal quartz XTAL",
  },
  {
    id: "oscillator",
    short: "XO",
    zh: "晶体振荡器",
    en: "Crystal Oscillators",
    aliases: "有源晶振 振荡器 oscillator XO clock",
  },
  {
    id: "vcxo",
    short: "VCXO",
    zh: "压控晶体振荡器",
    en: "Voltage Controlled Oscillators",
    aliases: "压控晶振 压控振荡器 VCXO",
  },
  {
    id: "tcxo",
    short: "TCXO",
    zh: "温补晶体振荡器",
    en: "VCTCXO / TCXO",
    aliases: "温补晶振 温度补偿晶振 温补振荡器 TCXO VCTCXO",
  },
  {
    id: "ocxo",
    short: "OCXO",
    zh: "恒温晶体振荡器",
    en: "OCXO / VCOCXO",
    aliases: "恒温晶振 恒温振荡器 OCXO VCOCXO",
  },
  {
    id: "tsx",
    short: "TSX",
    zh: "热敏晶体",
    en: "Thermistor Crystals",
    aliases: "温感晶体 热敏电阻晶体 热敏晶振 TSX thermistor",
  },
  {
    id: "timing",
    short: "Timing",
    zh: "时钟模块",
    en: "Timing Modules",
    aliases:
      "时钟模块 授时模块 驯服振荡器 原子钟 GPSDO CSAC disciplined timing module",
  },
  {
    id: "qcm",
    short: "QCM",
    zh: "石英测厚晶体",
    en: "Quartz Monitor Crystals",
    aliases: "测厚晶片 石英微天平 镀膜晶体 QCM sensor quartz thickness monitor",
  },
  {
    id: "equipment",
    short: "Equipment",
    zh: "测试与编程设备",
    en: "Test & Programming Equipment",
    aliases:
      "设备 编程器 烧录器 石英表分析仪 测试仪 programmer analyzer equipment",
  },
];

export const productById = new Map(
  products.map((product) => [product.id, product]),
);
export const groupById = new Map(
  productGroups.map((group) => [group.id, group]),
);
export const normalizeSearch = (value: string) =>
  value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, "");
export const localAsset = (path: string) =>
  `${import.meta.env.BASE_URL}${path}`;
export const productPath = (product: Product) => `/products/${product.id}`;
export const datasheetOf = (product: Product) =>
  product.documents.find((document) => document.label === "Datasheet")!;
export const overviewValue = (product: Product, pattern: RegExp) =>
  product.overview.find((item) => pattern.test(item.label))?.value || "—";

const index = products.map((product) => {
  const group = groupById.get(product.category)!;
  return {
    product,
    model: normalizeSearch(product.model),
    names: [product.nameZh, product.nameEn, ...product.aliases].map(
      normalizeSearch,
    ),
    text: normalizeSearch(
      [
        product.model,
        product.nameZh,
        product.nameEn,
        ...product.aliases,
        product.subtitle,
        group.zh,
        group.en,
        group.aliases,
        ...product.features,
        ...product.overview.map((item) => item.value),
      ].join(" "),
    ),
  };
});
export interface ProductMatch {
  product: Product;
  seriesMatch: boolean;
}
export function searchProducts(query: string, category = ""): ProductMatch[] {
  const trimmed = query.trim();
  const normalized = normalizeSearch(trimmed);
  const tokens = trimmed
    .normalize("NFKC")
    .split(/\s+/)
    .map(normalizeSearch)
    .filter(Boolean);
  if (trimmed && !normalized) return [];
  const looksLikePartNumber = /^[a-z0-9]{6,}-\d+(?:\.\d+)?$/i.test(trimmed);
  return index
    .filter((entry) => !category || entry.product.category === category)
    .map((entry) => {
      const exact =
        normalized &&
        (entry.model === normalized || entry.names.includes(normalized));
      const textMatch = tokens.every((token) => entry.text.includes(token));
      const seriesMatch =
        !textMatch && looksLikePartNumber && normalized.startsWith(entry.model);
      const score = exact
        ? 3
        : normalized && entry.model.includes(normalized)
          ? 2
          : 1;
      return {
        product: entry.product,
        seriesMatch,
        score,
        matches: textMatch || seriesMatch,
      };
    })
    .filter((entry) => entry.matches)
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.product.model.localeCompare(b.product.model, "en", {
          numeric: true,
        }) ||
        a.product.id.localeCompare(b.product.id),
    )
    .map(({ product, seriesMatch }) => ({ product, seriesMatch }));
}
export function directProductMatch(query: string) {
  const key = normalizeSearch(query);
  if (!key) return undefined;
  const matches = index.filter(
    (entry) => entry.model === key || entry.names.includes(key),
  );
  return matches.length === 1 ? matches[0].product : undefined;
}

const labelTranslations: Record<string, string> = {
  "Package Size": "封装尺寸",
  "Freq.": "频率",
  "Product Shape": "封装形式",
  "Supply Voltage": "供电电压",
  "Output level": "输出类型",
  "Output Level": "输出类型",
  "Freq. Tolerance (+25°C±3°)": "频率容差（+25°C±3°）",
  Diameter: "直径",
  Contour: "外形",
  Electrode: "电极",
  Packing: "包装",
  "Frequency Range": "频率范围",
  "Standard Frequency": "标称频率",
  "Standard Frequencies": "标称频率",
  "RMS Phase Jitter": "RMS 相位抖动",
  "Thermistor Resistance": "热敏电阻",
  "B-Constant": "B 常数",
  "Frequency Stability": "频率稳定度",
  "Programming Time": "编程时间",
  "Supported Packages": "支持封装",
  Type: "类型",
  "Time Base": "时基",
  "Crystal Test": "晶体测试",
  "Power Supply": "供电",
  Control: "控制方式",
};
export const specLabel = (label: string, language: string) =>
  language === "zh" ? labelTranslations[label] || label : label;
export const documentLabel = (label: string, language: string) =>
  language === "zh"
    ? (
        {
          Datasheet: "规格书 Datasheet",
          "Model Numbering Guide": "型号编码指南",
          "Phase Noise": "相位噪声资料",
          "Application Notes": "应用说明",
        } as Record<string, string>
      )[label] || label
    : label;
