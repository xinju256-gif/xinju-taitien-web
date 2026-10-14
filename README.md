# Simacity × Taitien React 工程

以已经定稿、内嵌三张原图的单页面 HTML 为唯一基准，拆分为 React + TypeScript + Vite 工程。页面文案、DOM 层级、SVG 图形、CSS 属性值、响应式断点和图片尺寸均沿用定稿版。

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

`build` 先执行严格 TypeScript 检查，再输出生产文件到 `dist/`。部署时上传整个 `dist/`。Vite 使用相对资源路径，保留原版 `#/...` 哈希路由，可部署在根目录或子目录，不需要额外的服务端路由重写。

## 在线预览（Netlify，保留私有仓库）

仓库根目录的 `netlify.toml` 已配置构建命令 `npm run build`、发布目录 `dist` 和 Node.js 24。GitHub Pages 自动部署流程已移除。

首次部署需要仓库所有者连接自己的 Netlify 账号：

1. 登录 [Netlify](https://app.netlify.com/)，选择 **Add new project → Import an existing project → GitHub**。
2. 授权 Netlify 访问私有仓库 `xinju256-gif/xinju-taitien-web`，选择该仓库，将 **Branch to deploy** 设置为 **dev-react**。
3. **Base directory** 留空，确认构建命令为 `npm run build`、发布目录为 `dist`，点击 **Deploy**。

构建成功后，项目概览会显示可访问的 `netlify.app` 网址。后续推送到 `dev-react` 会自动更新该网址。仓库保持私有，生成的网站公开可访问。无需配置环境密钥或路由重写。

## 目录说明

```text
index.html                 HTML 入口、原有元信息、固定版本的 Tailwind CDN
package.json               开发、构建、检查与测试命令
package-lock.json          精确依赖锁文件
vite.config.ts             React 插件与相对资源路径
netlify.toml               在线预览的构建命令、发布目录与 Node.js 版本
playwright.config.ts       静态版与生产构建的自动对比配置
tsconfig.json              TypeScript 严格检查
src/
  main.tsx                 React 挂载入口与 CSS 导入
  App.tsx                  页面路由与全局布局
  assets/                  两张 Logo 和企业微信二维码原文件
  data/catalog.ts          产品、应用和技术指南的中英文内容
  context/                 语言、哈希路由、搜索、询价和提示状态
  components/
    common/                Logo、二维码、SVG 图标、产品示意图、标题、链接
    layout/                Header、Footer、FloatingContact
    sections/              分类卡片、快速选型、BOM 横幅、联系信息
    forms/EnquiryForm.tsx   询价表单、BOM 校验、邮件内容与复制
  pages/                   首页、产品、应用、资源、关于、联系、搜索、404
  lib/downloadGuide.ts     技术指南下载
  styles/site.css          定稿版的全部 CSS
reference/final-static.html 原样保存的定稿静态版，仅作对照，不参与生产打包
tests/parity.spec.ts        图片、样式、截图和交互一致性测试
VALIDATION.md              验证范围与结果
```

## 与定稿版一致的行为

- 保留 19 个站内页面、404、站内哈希链接和中英文切换。
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

测试包括 19 个页面 × 2 种语言 × 3 个宽度（1440、390、320），768/1024 断点、CDN 不可用、手机导航、联系弹窗、询价状态、搜索和下载。图片文件与静态版逐字节校验，CSS 按浏览器解析后的规则校验。截图要求完全一致，不设置允许误差。

## 上传到 dev-react

将工程包解压后，把目录内的全部源码、配置和资源上传到仓库 `dev-react` 分支的根目录。保留 `package-lock.json` 与隐藏配置文件。`node_modules/`、`.cache/`、`dist/`、测试运行结果和 `.git/` 不在工程包中。

Git 仓库中的 React 定稿工程已提交并推送到 `dev-react`。在线托管需按上方步骤完成首次账号连接；仅推送源码不会自动开通 Netlify 项目。
