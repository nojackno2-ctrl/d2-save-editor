// 取得官方網頁版最新版本號，並把完整遊戲包（HTML＋所有 JS／CSS）存成本機快照，供分析、離線驗證與反編譯。
const fs = require("node:fs"), path = require("node:path");
const { P, sha256, writeJson, readJson } = require("./util.cjs");
const ORIGIN = "https://d2survivors.lol";

async function get(url, tries = 3) {
  let last;
  for (let i = 0; i < tries; i++) {
    try { const r = await fetch(url, { headers: { "user-agent": "d2-toolkit-verify" } }); if (r.ok) return Buffer.from(await r.arrayBuffer()); last = new Error(`${url} → ${r.status}`); if (r.status === 404) break; }
    catch (e) { last = e; }
    await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
  }
  throw last;
}

async function latestBuild() {
  const list = JSON.parse((await get(ORIGIN + "/changelog.json")).toString("utf8"));
  if (!Array.isArray(list) || !list[0]?.build) throw new Error("changelog.json 格式無法辨識");
  return { build: list[0].build, date: list[0].date, changelog: list };
}

const snapshotDir = (build) => path.join(P.bundles, build);
const hasSnapshot = (build) => readJson(path.join(snapshotDir(build), "index.json"), null)?.complete === true;

// 從 HTML 與 JS 內容找出關聯資源檔名（assets/ 底下的 JS／CSS）。
function refs(text) {
  const out = new Set();
  for (const m of text.matchAll(/(?:\.\.\/|\.\/|\/)?assets\/([\w.-]+\.(?:js|css))/g)) out.add(m[1]);
  for (const m of text.matchAll(/["'`(]\.\/([\w.-]+\.(?:js|css))["'`)]/g)) out.add(m[1]);
  return out;
}

async function download(build) {
  const dir = snapshotDir(build), assets = path.join(dir, "assets");
  fs.mkdirSync(assets, { recursive: true });
  const html = await get(ORIGIN + "/play/");
  fs.writeFileSync(path.join(dir, "play.html"), html);
  const changelog = await get(ORIGIN + "/changelog.json");
  fs.writeFileSync(path.join(dir, "changelog.json"), changelog);
  const files = {}, failed = [], seen = new Set(), queue = [...refs(html.toString("utf8"))];
  const work = async () => {
    for (let name; (name = queue.shift()); ) {
      if (seen.has(name)) continue; seen.add(name);
      try {
        const buf = await get(`${ORIGIN}/assets/${name}`);
        fs.writeFileSync(path.join(assets, name), buf);
        files[name] = { bytes: buf.length, sha256: sha256(buf) };
        if (name.endsWith(".js")) for (const r of refs(buf.toString("utf8"))) if (!seen.has(r)) queue.push(r);
      } catch (e) { failed.push({ name, error: String(e.message || e) }); }
    }
  };
  // 佇列會在處理中增長，所以分批等待直到真正清空。
  while (queue.length) await Promise.all(Array.from({ length: 8 }, work));
  const entry = /<script[^>]*type="module"[^>]*src="[^"]*assets\/([\w.-]+\.js)"/.exec(html.toString("utf8"))?.[1] ?? null;
  const index = { build, fetchedAt: new Date().toISOString(), entry, fileCount: Object.keys(files).length, failed, files, complete: failed.length === 0 };
  writeJson(path.join(dir, "index.json"), index);
  return index;
}
module.exports = { ORIGIN, latestBuild, download, hasSnapshot, snapshotDir };
