export type Bilingual = [string, string];
export interface Category {
  id: string;
  short: string;
  zh: string;
  en: string;
  brief: string;
  desc: Bilingual;
  tag: Bilingual;
  params: string[];
  ep: string[];
}
export interface Application {
  id: string;
  zh: string;
  en: string;
  icon: string;
  desc: Bilingual;
  types: string[];
  body: Bilingual;
}
export interface Guide {
  id: string;
  zh: string;
  en: string;
  type: Bilingual;
  desc: Bilingual;
  body: Bilingual;
}
export const categories: Category[] = [
  {
    id: "crystal",
    short: "XTAL",
    zh: "石英晶体",
    en: "Quartz Crystals",
    brief: "晶振",
    desc: [
      "从基础时钟到精密谐振，为电路提供稳定的频率基准。",
      "A stable frequency reference, from everyday timing to precise resonance.",
    ],
    tag: ["无源频率基准", "Passive frequency reference"],
    params: ["标称频率", "负载电容", "频率容差", "等效串联电阻"],
    ep: [
      "Nominal frequency",
      "Load capacitance",
      "Frequency tolerance",
      "Equivalent series resistance",
    ],
  },
  {
    id: "oscillator",
    short: "XO",
    zh: "晶体振荡器",
    en: "Crystal Oscillators",
    brief: "振荡器",
    desc: [
      "集成振荡电路，满足多种接口与系统时钟需求。",
      "Integrated oscillation for a wide range of interfaces and system clocks.",
    ],
    tag: ["通用时钟方案", "General-purpose timing"],
    params: ["输出频率", "输出类型", "供电电压", "抖动"],
    ep: ["Output frequency", "Output type", "Supply voltage", "Jitter"],
  },
  {
    id: "vcxo",
    short: "VCXO",
    zh: "压控晶体振荡器",
    en: "Voltage Controlled Oscillators",
    brief: "VCXO",
    desc: [
      "通过控制电压微调输出频率，适用于同步与锁相系统。",
      "Fine frequency control for synchronization and phase-locked systems.",
    ],
    tag: ["灵活频率调谐", "Precision frequency tuning"],
    params: ["牵引范围", "控制电压", "线性度", "输出类型"],
    ep: ["Pull range", "Control voltage", "Linearity", "Output type"],
  },
  {
    id: "tcxo",
    short: "TCXO",
    zh: "温补晶体振荡器",
    en: "Temperature Compensated Oscillators",
    brief: "TCXO",
    desc: [
      "温度补偿设计，为复杂温度环境提供稳定时钟。",
      "Temperature compensation for stable timing in changing environments.",
    ],
    tag: ["温度补偿 · 稳定输出", "Temperature-compensated stability"],
    params: ["温度稳定度", "工作温度", "功耗", "相位噪声"],
    ep: [
      "Temperature stability",
      "Operating temperature",
      "Power consumption",
      "Phase noise",
    ],
  },
  {
    id: "ocxo",
    short: "OCXO",
    zh: "恒温晶体振荡器",
    en: "Oven Controlled Oscillators",
    brief: "OCXO",
    desc: [
      "以恒温控制实现高稳定度，服务精密计时与通信。",
      "Oven-controlled stability for precision timing and communications.",
    ],
    tag: ["高稳定度频率基准", "High-stability frequency reference"],
    params: ["频率稳定度", "老化率", "预热时间", "相位噪声"],
    ep: ["Frequency stability", "Aging rate", "Warm-up time", "Phase noise"],
  },
];
export const applications: Application[] = [
  {
    id: "communications",
    zh: "通信与网络",
    en: "Communications",
    icon: "radio",
    desc: [
      "从网络同步到高速数据传输",
      "From network timing to high-speed data",
    ],
    types: ["tcxo", "ocxo", "vcxo"],
    body: [
      "网络设备、无线通信与同步系统需要综合评估频率稳定度、相位噪声和抖动。根据时钟架构、同步方式及温度条件选择频率器件。",
      "Network, wireless and synchronization systems require careful evaluation of frequency stability, phase noise and jitter. Select components to match the clock architecture and thermal environment.",
    ],
  },
  {
    id: "automotive",
    zh: "汽车电子",
    en: "Automotive",
    icon: "car",
    desc: ["可靠时钟，连接智能出行", "Reliable timing for connected mobility"],
    types: ["crystal", "oscillator", "tcxo"],
    body: [
      "车载电子需关注工作温度、长期可靠性与器件认证。具体车规等级、认证状态和适用性需依据型号规格书及原厂资料确认。",
      "Automotive electronics require attention to operating temperature, long-term reliability and qualification. Confirm automotive grades and certifications against the exact device documentation.",
    ],
  },
  {
    id: "industrial",
    zh: "工业与控制",
    en: "Industrial",
    icon: "factory",
    desc: ["应对严苛环境与长期运行", "For demanding environments"],
    types: ["crystal", "oscillator", "ocxo"],
    body: [
      "工业控制、测量与自动化系统需要可靠的时钟参考。选型应考虑环境温度、电源质量、器件寿命及所需的时序精度。",
      "Industrial control, measurement and automation depend on reliable clock references. Consider temperature, power quality, lifetime and timing accuracy.",
    ],
  },
  {
    id: "consumer",
    zh: "消费电子",
    en: "Consumer Electronics",
    icon: "mobile",
    desc: [
      "小型化设计，支持日常创新",
      "Compact timing for everyday innovation",
    ],
    types: ["crystal", "oscillator", "tcxo"],
    body: [
      "便携设备与消费电子更关注尺寸、功耗和成本。结合芯片参考设计核对负载电容、封装、电压及启动条件。",
      "Portable and consumer devices prioritize size, power and cost. Check load capacitance, package, voltage and startup conditions against the chipset reference design.",
    ],
  },
];
export const guides: Guide[] = [
  {
    id: "selection",
    zh: "频率控制元件选型指南",
    en: "Frequency Control Selection Guide",
    type: ["选型指南", "SELECTION GUIDE"],
    desc: [
      "晶体、XO、VCXO、TCXO 与 OCXO 如何选择？",
      "Choose between crystals, XO, VCXO, TCXO and OCXO.",
    ],
    body: [
      "先区分无源晶体与有源振荡器。\n无源晶体需要外部振荡电路，应核对负载电容、等效串联电阻及驱动功率。\nXO 提供集成的时钟输出，需核对供电、输出电平、负载与抖动。\nVCXO 用于电压控制频率调谐；TCXO 通过温度补偿提高稳定度；OCXO 通过恒温控制获得更高稳定度。\n最终选型以具体型号的正式规格书、测试条件和实际应用验证为准。",
      "Distinguish passive crystals from active oscillators.\nCrystals require an external oscillator circuit: check load capacitance, ESR and drive level.\nXO devices supply integrated clock outputs: check supply, logic levels, load and jitter.\nVCXO supports voltage-controlled tuning; TCXO compensates for temperature; OCXO uses oven control.\nFinal selection requires the exact datasheet and application validation.",
    ],
  },
  {
    id: "parameters",
    zh: "读懂晶振关键参数",
    en: "Understanding Timing Parameters",
    type: ["技术文章", "TECHNICAL NOTE"],
    desc: [
      "频率容差、稳定度、相位噪声与抖动的基础解读。",
      "Frequency tolerance, stability, phase noise and jitter explained.",
    ],
    body: [
      "频率容差描述器件在指定参考条件下与标称频率的偏差。\n温度稳定度描述频率在规定温度范围内的变化。\n老化率描述频率随时间的长期变化。\n相位噪声和抖动分别从频域、时域描述时钟的短期波动；比较抖动时必须核对积分带宽和测试条件。\n不同指标不能直接互相替代，总误差预算还需考虑供电、负载和使用寿命。",
      "Frequency tolerance is the initial deviation from nominal frequency at specified conditions.\nTemperature stability describes variation across a specified temperature range.\nAging describes long-term frequency drift.\nPhase noise and jitter describe short-term variations in frequency and time domains. Compare jitter only with matching bandwidths and test conditions.\nAn error budget should also account for supply, load and lifetime.",
    ],
  },
  {
    id: "bom",
    zh: "BOM 询价准备清单",
    en: "BOM Enquiry Checklist",
    type: ["应用支持", "APPLICATION SUPPORT"],
    desc: [
      "一次整理型号、数量、交期及替代要求。",
      "Prepare part numbers, quantities, lead times and alternatives.",
    ],
    body: [
      "请提供：原厂完整型号、需求数量、目标交期、应用场景。\n如需协助选型，请补充：频率、封装、供电电压、输出类型、稳定度与工作温度。\n替代选型还需核对引脚定义、启动时间、控制脚功能及负载条件。\n请勿在 BOM 中包含与询价无关的个人信息或机密。\n联系方式：taitien@simacity.com.cn / 021-62271972",
      "Provide the full manufacturer part number, quantity, target delivery date and application.\nFor selection support, add frequency, package, supply, output type, stability and temperature range.\nFor replacements, compare pin assignments, startup timing, control pins and loading.\nExclude personal or confidential information unrelated to the enquiry.\nContact: taitien@simacity.com.cn / 021-62271972",
    ],
  },
];
