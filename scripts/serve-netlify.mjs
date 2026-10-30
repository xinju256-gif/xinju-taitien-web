// Exercise Netlify's own static-file and redirect pipeline without downloading
// an Edge Functions runtime: this project has no edge/serverless functions.
import { NetlifyDev } from "@netlify/dev";
import { createServer } from "node:http";

const dev = new NetlifyDev({
  projectRoot: process.cwd(),
  serverAddress: null,
  skipGitignore: true,
  aiGateway: { enabled: false },
  blobs: { enabled: false },
  database: { enabled: false },
  edgeFunctions: { enabled: false },
  environmentVariables: { enabled: false },
  functions: { enabled: false },
  geolocation: { enabled: false },
  images: { enabled: false },
  headers: { enabled: true },
  redirects: { enabled: true },
  staticFiles: { enabled: true, directories: ["dist"] },
});
await dev.start();
const server = createServer(async (req, res) => {
  try {
    const response = await dev.handle(
      new Request(new URL(req.url, "http://127.0.0.1:8888"), {
        method: req.method,
        headers: req.headers,
      }),
    );
    if (!response) {
      res.writeHead(404);
      res.end();
      return;
    }
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    console.error(error);
    res.writeHead(500);
    res.end("Local Netlify runtime error");
  }
});
server.listen(8888, "127.0.0.1", () =>
  console.log("Netlify static/redirect runtime listening on port 8888"),
);
for (const signal of ["SIGTERM", "SIGINT"])
  process.on(signal, async () => {
    server.close();
    await dev.stop();
    process.exit(0);
  });
