import { renderToString } from "react-dom/server";
import App from "./App";
export { publicPaths, pageSeo, SITE_URL } from "./lib/seo";
export function render(path: string) {
  return renderToString(<App initialPath={path} />);
}
