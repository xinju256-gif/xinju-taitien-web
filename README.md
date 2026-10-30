# Simacity × Taitien React 工程

以已经定稿的单页面 HTML 为基础拆分为 React + TypeScript + Vite 工程。产品中心现已补齐泰艺官网公开型号、参数、原厂图片和本地规格书；首页、应用、联系、页脚及浮动联系弹窗保留原布局。

## 本地开发

使用 Node.js 24（最低 22.12）和 npm，在本目录执行：

```bash
npm ci
npm run dev
```

`index.html` 是 Vite 的 HTML 入口，React 入口是 `src/main.tsx`。工程源文件通过开发服务器运行。

## 构建与预览

```bash
npm run build
npm run preview
```

`build` 依次执行严格 TypeScript 检查、Vite 客户端打包、服务端渲染入口打包和静态预渲染，输出完整生产文件到 `dist/`。站点使用根路径资源和普通路径路由，部署在 `https://taitien-cn.com/`；旧 `#/...` 链接在浏览器中转换为普通路径并保留查询参数。部署时必须上传整个 `dist/`，包括每个页面目录、`404.html`、`sitemap.xml` 和 `robots.txt`，不要配置 `/* /index.html 200` 兜底重写。

## 在线预览（Netlify，保留私有仓库）

仓库根目录的 `netlify.toml` 已配置构建命令 `npm run build`、发布目录 `dist` 和 Node.js 24。GitHub Pages 自动部署流程已移除。

首次部署需要仓库所有者连接自己的 Netlify 账号：

1. 登录 [Netlify](https://app.netlify.com/)，选择 **Add new project → Import an existing project → GitHub**。
2. 授权 Netlify 访问私有仓库 `xinju256-gif/xinju-taitien-web`，选择该仓库，将 **Branch to deploy** 设置为 **dev-react**。
3. **Base directory** 留空，确认构建命令为 `npm run build`、发布目录为 `dist`，点击 **Deploy**。

构建成功后，项目概览会显示可访问的 `netlify.app` 网址。后续推送到 `dev-react` 会自动更新该网址。仓库保持私有，生成的网站公开可访问。无需配置环境密钥或路由重写。


## 预渲染与 SEO

`src/lib/seo.ts` 统一维护公开路由和页面元信息，`src/entry-server.tsx` 渲染真实 React 页面，`scripts/prerender.mjs` 生成静态 HTML。新增产品、分类、应用或指南会自动进入构建，无需手工维护 URL 列表。当前生成 172 个公开页面（含 153 个型号详情及搜索页）和独立 404；sitemap 包含 171 个可收录 URL，搜索页使用 `noindex,follow`。

所有页面输出独立标题、描述、绝对 canonical、Open Graph、Twitter 卡片和 JSON-LD；详情页输出 Product、面包屑等结构化信息。未提供价格、库存、评分等无法验证的数据。查询参数不进入 canonical。中文为静态默认内容，英文切换及用户偏好由浏览器保留。

Netlify 直接读取各目录的 `index.html`，未知路径由平台原生机制返回 `404.html` 和 HTTP 404。尾斜杠变体使用相同 canonical。URL fragment 不会发送给服务器，因此旧 Hash 链接的转换必须由浏览器执行；没有 JavaScript 的新路径仍可阅读预渲染正文。

验证生产构建和 Netlify 本地静态行为：

```bash
npm ci
npm exec --yes --package=netlify-cli@27.16.0 -- netlify build --offline
CHROMIUM_PATH=/usr/bin/chromium npm run test:parity
CHROMIUM_PATH=/usr/bin/chromium npm run test:netlify
```

`test:netlify` 先构建，再通过已锁定的 `@netlify/dev` 官方运行时在 8888 端口测试所有公开 URL 的原始 HTML、SEO、静态资源、sitemap、robots、HTTP 404、深层路径刷新、浏览器前进后退及旧链接参数。它只启用此静态站点需要的文件和重定向能力，不下载 Edge Functions 运行时。该本地运行时对未知路径返回通用 404 正文，因此测试另行检查生产约定文件 `404.html` 的预渲染正文和 `noindex`。测试不部署、不发布，也不代表线上域名已更新。

## 产品资料更新

收录官网 153 个产品/系列条目、145 份去重后的产品 Datasheet，以及编码指南、相位噪声资料和产品原图。精确搜索唯一型号可直接打开详情，多系列型号会显示各个版本。全部下载由本站提供。

来源范围、源资料差异、文件校验与同步方法见 [产品目录说明](docs/PRODUCT-CATALOG.md)。

产品与应用入口已统一使用泰艺官网发布的对应型号图和应用图。图片来源、分类代表型号及同步方法见 [配图来源说明](docs/IMAGE-SOURCES.md)。

## 目录说明

```text
index.html                 HTML 入口、原有元信息、固定版本的 Tailwind CDN
package.json               开发、构建、检查与测试命令
package-lock.json          精确依赖锁文件
vite.config.ts             React 插件与根路径资源
netlify.toml               在线预览的构建命令、发布目录与 Node.js 版本
playwright.config.ts       静态版与生产构建的自动对比配置
tsconfig.json              TypeScript 严格检查
src/
  main.tsx                 React 挂载入口与 CSS 导入
  App.tsx                  页面路由与全局布局
  assets/                  两张 Logo 和企业微信二维码原文件
  data/catalog.ts          原有分类、应用和技术指南的中英文内容
  data/products.json       153 个公开产品/系列的参数及资料关联
  data/products.ts         型号查询、别名匹配及资料工具
  data/site.ts             网站标题
  context/                 语言、History 路由、搜索、询价和提示状态
  components/
    common/                Logo、二维码、SVG 图标、产品示意图、标题、链接
    layout/                Header、Footer、FloatingContact
    sections/              分类卡片、快速选型、BOM 横幅、联系信息
    forms/EnquiryForm.tsx   询价表单、BOM 校验、邮件内容与复制
  pages/                   首页、产品、应用、资源、关于、联系、搜索、404
  lib/downloadGuide.ts     技术指南下载
  styles/site.css          定稿版的全部 CSS（未改动）
  styles/product-catalog.css 新产品目录与详情的独立样式
public/datasheets/          原厂规格书、编码指南及相位噪声文件
public/products/            原厂产品图片
docs/                      产品来源审计、范围及维护说明
scripts/                   可选的产品资料维护脚本
reference/final-static.html 原样保存的定稿静态版，仅作对照，不参与生产打包
tests/parity.spec.ts        未改动页面的图片、样式、截图和交互一致性测试
tests/catalog.spec.ts       产品覆盖、文件完整性、搜索、下载与路由测试
VALIDATION.md              验证范围与结果
```

## 保留的行为

- 保留公开页面、产品详情、404 和中英文切换；站内链接使用普通路径，兼容旧哈希链接。
- 保留搜索、分类筛选、快速选型及询价参数传递。
- 保留表单草稿、BOM 文件名和格式/大小校验、邮件内容生成、复制和修改需求。
- 保留 Markdown 指南下载、手机导航、跳至正文、Escape 关闭菜单/弹窗和焦点恢复。
- 每页均有右下角联系弹窗，二维码同时出现在首页、联系页和全局页脚。
- 页脚为“上海芯聚电子科技有限公司 保留所有权利”；联系邮箱及邮件链接为 `taitien@simacity.com.cn`。
- 联系电话为 `021-62271972`；地址为上海市长宁区延安西路2299号。
- 询价仍由访客自己的邮件应用发送；BOM 文件需在邮件中手动附上。

Tailwind 保持原版 CDN 地址与 `4.1.18` 版本。核心 CSS 全部在 `src/styles/site.css`，CDN 不可用时仍保留原版的显示行为。`@tailwindcss/browser` 开发依赖供自动测试固定 CDN 响应内容使用。

三张图片由定稿 HTML 的 Base64 数据直接解码得到，文件字节完全相同，二维码未重绘、未压缩。界面直接使用图片资源，不含图片导入流程。

## 一致性测试

首次在新电脑运行测试时安装 Playwright 的 Chromium：

```bash
npx playwright install chromium
npm run test:parity
```

Linux CI 如已安装系统 Chromium，可使用：

```bash
CHROMIUM_PATH=/usr/bin/chromium npm run test:parity
```

测试自动启动静态对照服务器，并构建、启动 React 生产预览。它们只供测试使用，测试退出后由 Playwright 清理。截图对比在同一台机器、同一浏览器、同一字体与视口下进行，不依赖跨系统的固定截图。

未改动的 12 个页面继续按 2 种语言 × 3 个宽度（1440、390、320）与原版逐像素比较，另检查首页断点、CDN 不可用、手机导航、联系弹窗与询价状态。原有图片逐字节校验，原有 CSS 按浏览器解析后的规则校验。新增产品功能独立验证 153 个详情入口、资料 SHA-256、搜索和下载。产品目录/详情及搜索页按本次需求扩充，不再要求与旧版空目录截图一致。

## 上传到 dev-react

将工程包解压后，把目录内的全部源码、配置和资源上传到仓库 `dev-react` 分支的根目录。保留 `package-lock.json` 与隐藏配置文件。`node_modules/`、`.cache/`、`dist/`、测试运行结果和 `.git/` 不在工程包中。

Git 仓库中的 React 定稿工程已提交并推送到 `dev-react`。在线托管需按上方步骤完成首次账号连接；仅推送源码不会自动开通 Netlify 项目。
