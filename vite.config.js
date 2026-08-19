import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { Readable } from "node:stream";

const GOOGLE_MAP_PROXY_PREFIX = "/google-map-proxy/";
const GOOGLE_MAP_BASE_URL = "https://mayabiousvr.s3.ap-south-1.amazonaws.com/JIGA2/";
const FRAME_BLOCKING_HEADERS = new Set([
  "content-length",
  "content-security-policy",
  "content-security-policy-report-only",
  "x-frame-options",
]);

function applyProxyHeaders(sourceHeaders, response) {
  sourceHeaders.forEach((value, key) => {
    if (!FRAME_BLOCKING_HEADERS.has(key.toLowerCase())) {
      response.setHeader(key, value);
    }
  });
}

function googleMapProxyPlugin() {
  return {
    name: "google-map-proxy",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith(GOOGLE_MAP_PROXY_PREFIX)) {
          next();
          return;
        }

        try {
          const incomingUrl = new URL(req.url, "http://localhost");
          const relativePath = incomingUrl.pathname.slice(GOOGLE_MAP_PROXY_PREFIX.length) || "index.html";

          if (relativePath.split("/").includes("..")) {
            res.statusCode = 404;
            res.end("Not found");
            return;
          }

          const targetUrl = new URL(relativePath, GOOGLE_MAP_BASE_URL);
          targetUrl.search = incomingUrl.search;
          const upstream = await fetch(targetUrl);

          res.statusCode = upstream.status;
          applyProxyHeaders(upstream.headers, res);

          if (req.method === "HEAD" || !upstream.body) {
            res.end();
            return;
          }

          Readable.fromWeb(upstream.body).pipe(res);
        } catch (error) {
          server.config.logger.error(error);
          res.statusCode = 502;
          res.end("Unable to load location map.");
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const isProduction = mode === "production";

  return {
    plugins: [react(), googleMapProxyPlugin()],
    build: {
      outDir: "dist",
      emptyOutDir: true,
      sourcemap: false,
      minify: "terser",
      assetsInlineLimit: 0,
      cssCodeSplit: true,
      reportCompressedSize: true,
      terserOptions: {
        compress: {
          drop_console: isProduction,
          drop_debugger: true,
          passes: 2,
        },
        mangle: true,
        format: {
          comments: false,
        },
      },
      rollupOptions: {
        output: {
          entryFileNames: "assets/[hash].js",
          chunkFileNames: "assets/[hash].js",
          assetFileNames: "assets/[hash][extname]",
        },
      },
    },
    define: {
      __DEV__: JSON.stringify(!isProduction),
      "process.env.NODE_ENV": JSON.stringify(isProduction ? "production" : "development"),
    },
  };
});
