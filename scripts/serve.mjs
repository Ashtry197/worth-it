// Serves the static export in out/ over HTTP.
//
// Node builtins only — no dependency to install, nothing fetched at runtime.
// Exists because the export uses absolute asset paths (/_next/...), so opening
// out/index.html over file:// gives an unstyled, broken page.

import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(new URL("../", import.meta.url)), "out");
const PORT = Number(process.env.PORT) || 4173;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

async function resolve(urlPath) {
  // normalize + strip leading separators keeps ../ from escaping ROOT
  const clean = normalize(decodeURIComponent(urlPath.split("?")[0])).replace(
    /^(\.\.[/\\])+/,
    "",
  );
  const candidates = [
    join(ROOT, clean),
    join(ROOT, clean, "index.html"),
    join(ROOT, `${clean}.html`),
  ];

  for (const candidate of candidates) {
    if (!candidate.startsWith(ROOT)) continue;
    try {
      const info = await stat(candidate);
      if (info.isFile()) return candidate;
    } catch {
      /* try the next candidate */
    }
  }
  return null;
}

createServer(async (req, res) => {
  const file = await resolve(req.url ?? "/");

  if (!file) {
    const notFound = await resolve("/404.html");
    if (notFound) {
      res.writeHead(404, { "content-type": TYPES[".html"] });
      res.end(await readFile(notFound));
      return;
    }
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }

  res.writeHead(200, {
    "content-type": TYPES[extname(file)] ?? "application/octet-stream",
    "cache-control": "no-cache",
  });
  res.end(await readFile(file));
}).listen(PORT, () => {
  console.log(`\n  Worth It is running at http://localhost:${PORT}\n`);
  console.log("  Close this window when you're done.\n");
});
