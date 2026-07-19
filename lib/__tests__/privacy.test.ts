import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

function sourceFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (["node_modules", ".next", "out", ".git", "__tests__"].includes(entry)) continue;
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) sourceFiles(full, acc);
    else if (/\.(ts|tsx)$/.test(full)) acc.push(full);
  }
  return acc;
}

const BANNED = [
  /\bfetch\s*\(/,
  /XMLHttpRequest/,
  /navigator\.sendBeacon/,
  /new WebSocket/,
  /googlesyndication/,
  /adsbygoogle/,
  /busuanzi/,
  /@vercel\/analytics/,
];

describe("privacy guarantee", () => {
  const files = [
    ...sourceFiles(path.resolve(__dirname, "../../app")),
    ...sourceFiles(path.resolve(__dirname, "../../components")),
    ...sourceFiles(path.resolve(__dirname, "../../lib")),
  ];

  it("finds source files to check", () => {
    expect(files.length).toBeGreaterThan(5);
  });

  it("makes no network calls and loads no trackers", () => {
    for (const file of files) {
      const src = readFileSync(file, "utf8");
      for (const pattern of BANNED) {
        expect(pattern.test(src), `${file} matches ${pattern}`).toBe(false);
      }
    }
  });

  it("has no third-party script tags in the layout", () => {
    const layout = readFileSync(
      path.resolve(__dirname, "../../app/layout.tsx"), "utf8",
    );
    expect(layout).not.toMatch(/<script/i);
  });
});
