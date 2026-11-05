const fs = require("node:fs"), path = require("node:path");
const { P, sha256, readJson, writeJson } = require("./util.cjs");

// 依快照實際內容比對，不能只相信索引；未知變動保守重跑。
function compare(previous, current) {
  function snapshot(build) {
    if (!build) return null;
    const root = path.join(P.bundles, build), index = readJson(path.join(root, "index.json"), null);
    if (!index?.complete || !index.files || !Object.keys(index.files).length) return null;
    const map = new Map();
    for (const [name, meta] of Object.entries(index.files)) {
      if (!/^[\w.-]+\.(js|css)$/.test(name) || !meta.sha256) return null;
      const file = path.join(root, "assets", name);
      if (!fs.existsSync(file) || sha256(fs.readFileSync(file)) !== meta.sha256) return null;
      // Hashed filenames rotate between builds. Match exact names first, then
      // pair the remaining chunks by logical basename and content hash.
      map.set(name, { name, hash: meta.sha256, logical: name.replace(/-[A-Za-z0-9_-]{8}(?=\.(?:js|css)$)/, "") });
    }
    const html = path.join(root, "play.html");
    if (!fs.existsSync(html)) return null;
    map.set("play.html", { name: "play.html", hash: sha256(fs.readFileSync(html)) });
    return map;
  }
  const old = snapshot(previous), now = snapshot(current);
  if (!old || !now) return { baseline: previous || null, complete: false, reason: "缺少可驗證的前版或新版快照", changed: [], groups: ["unknown"] };
  const changed = [], oldLeft = new Map(old), nowLeft = new Map(now);
  for (const [name, a] of old) {
    const b = now.get(name);
    if (b) { oldLeft.delete(name); nowLeft.delete(name); if (a.hash !== b.hash) changed.push({ module: a.logical, before: name, after: name }); }
  }
  const logicalGroups = new Map();
  for (const [name, a] of oldLeft) { const xs = logicalGroups.get(a.logical) || { old: [], now: [] }; xs.old.push([name, a]); logicalGroups.set(a.logical, xs); }
  for (const [name, b] of nowLeft) { const xs = logicalGroups.get(b.logical) || { old: [], now: [] }; xs.now.push([name, b]); logicalGroups.set(b.logical, xs); }
  for (const [logical, pair] of logicalGroups) {
    const remainingNow = [...pair.now];
    for (const [beforeName, a] of pair.old) {
      let i = remainingNow.findIndex(([, b]) => b.hash === a.hash);
      if (i >= 0) { remainingNow.splice(i, 1); continue; }
      const [afterName] = remainingNow.shift() || [];
      changed.push({ module: logical, before: beforeName, after: afterName || null });
    }
    for (const [afterName] of remainingNow) changed.push({ module: logical, before: null, after: afterName });
  }
  const groups = new Set();
  for (const c of changed) {
    if (c.module?.endsWith(".css")) groups.add("style");
    else if (/^(?:Game|game)\.js$/.test(c.module)) groups.add("game");
    else if (/^itemArt\.js$/.test(c.module)) groups.add("items");
    else if (/^saveTransfer\.js$/.test(c.module)) groups.add("choices");
    else if (/^(?:ko|lang)\.js$/.test(c.module)) groups.add("language");
    else if (/^(?:report|leaderboardSend)\.(?:js|css)$/.test(c.module)) groups.add("ui");
    else groups.add("unknown");
  }
  return { baseline: previous, complete: true, changed, groups: [...groups] };
}

function select(comparison, tests, forceAll) {
  if (forceAll || !comparison.complete || comparison.groups.includes("unknown")) return tests;
  const groups = new Set(comparison.groups);
  const always = tests.filter((test) => test.always);
  if (!["game", "items", "choices"].some((g) => groups.has(g))) return always;
  const ids = new Set(["autobot", ...always.map((test) => test.id)]);
  if (groups.has("game") || groups.has("items")) for (const id of ["runeword-class-base", "skill-mods", "weapon-sets", "weapon-sets-ui"]) ids.add(id);
  return tests.filter((test) => ids.has(test.id));
}
function selftest() {
  const assert = require("node:assert/strict"), os = require("node:os");
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "d2-compare-"));
  const original = P.bundles;
  try {
    P.bundles = root;
    for (const [build, assets] of Object.entries({ old: { "Game-AAAAaaaa.js": "same", "vendor-AAAAaaaa.js": "old" }, next: { "Game-BBBBbbbb.js": "same", "vendor-BBBBbbbb.js": "new" } })) {
      const dir = path.join(root, build), assetDir = path.join(dir, "assets"); fs.mkdirSync(assetDir, { recursive: true });
      const files = {};
      for (const [name, body] of Object.entries(assets)) { fs.writeFileSync(path.join(assetDir, name), body); files[name] = { sha256: sha256(Buffer.from(body)) }; }
      fs.writeFileSync(path.join(dir, "play.html"), "<html></html>");
      writeJson(path.join(dir, "index.json"), { complete: true, files });
    }
    const result = compare("old", "next");
    assert.equal(result.complete, true);
    assert.equal(result.changed.length, 1);
    assert.equal(result.changed[0].module, "vendor.js");
    assert.deepEqual(result.groups, ["unknown"]);
  } finally { P.bundles = original; fs.rmSync(root, { recursive: true, force: true }); }
}
module.exports = { compare, select, selftest };
