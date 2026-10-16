# 产品与应用配图

更新日期：2026-10-16。本次仅更新产品及应用图片、图片说明与相应显示样式。

## 产品图

分类图片直接引用现有产品目录中的代表型号。同一型号的分类入口、产品列表、搜索结果与型号详情使用同一个本地文件，不另建通用封装图或猜测其他型号的外观。

| 分类 | 代表型号 | 官网型号页 |
| --- | --- | --- |
| 石英晶体 | XY | https://www.taitien.com/ti-products/mhz-range-crystal-xy-type |
| XO | OX | https://www.taitien.com/ti-products/mhz-range-crystal-oscillators-ox-type |
| VCXO | VA-M（CMOS） | https://www.taitien.com/ti-products/fastvcxo-fast-delivery-vcxo-series-va-m-cmos-type |
| TCXO | TY | https://www.taitien.com/ti-products/standard-tcxo-series-ty-type |
| OCXO | NA | https://www.taitien.com/ti-products/standard-ocxo-series-na-type |

映射集中在 `src/data/visuals.ts`。具体型号统一由 `ProductImage` 读取 `products.json` 的图片路径。原厂在多个型号页发布同一封装图时照实复用，不制造不存在的外观差异。官网图可能是原厂渲染图，并不将它们标注为实拍照片。

本次重新访问全部 153 个官方型号页，确认图片关联与既有来源记录一致；重新取得 104 张产品图并校验 SHA-256，全部与本站文件一致。完整来源及哈希继续保存在 `docs/taitien-catalog-audit.json`，产品参数和规格书均未修改。

## 应用图

四类图片来自泰艺官网公开媒体库，根据官方图片标题和实际画面选择。使用官网已经发布的文件尺寸，保留下载字节；通过 CSS 等比例显示，不生成或改写图片内容。

| 本站应用 | 官网图片标题 | 官方媒体记录 |
| --- | --- | --- |
| 通信与网络 | Telephone voice routers are in the data center | https://www.taitien.com/wp-json/wp/v2/media/6932 |
| 汽车电子 | Smart Car | https://www.taitien.com/wp-json/wp/v2/media/6122 |
| 工业与控制 | Industry 4.0 | https://www.taitien.com/wp-json/wp/v2/media/6132 |
| 消费电子 | smart phone | https://www.taitien.com/wp-json/wp/v2/media/6136 |

本地文件位于 `public/applications/`，四张合计 406,773 字节。`src/data/application-images.json` 记录原始网址、采用版本的网址、尺寸、字节数与 SHA-256。首页、应用总览、应用详情均通过同一个 `ApplicationImage` 组件读取该映射。

网页只请求本站图片，产品和应用链接仍指向站内页面。上述官网网址仅用于资料溯源，不作为网页跳转入口。

## 更新与验证

```bash
python scripts/sync-taitien-images.py
npm run build
CHROMIUM_PATH=/usr/bin/chromium npm run test:parity
```

同步脚本仅供维护使用，构建和访客访问不依赖抓取官网。变更图片选择时先核对标题、实际画面及对应分类，再检查生成的来源记录。

原有 `site.css`、Logo、二维码、菜单、联系信息、选型、搜索和下载行为保留。新增图片样式独立位于 `src/styles/official-images.css`，沿用已有图片区域的尺寸和响应式规则。
