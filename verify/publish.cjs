#!/usr/bin/env node
// 發布：只在驗證通過且你確認後執行。預設只列出計畫，不做任何事。
//   node verify/publish.cjs                列出將要做的事（不執行）
//   node verify/publish.cjs --confirm      升版號 → 建置網頁版 → 提交推送（加 --desktop 才另外打包桌面版並建立 Release）
//   --no-bump      不升版號        --desktop     另外打包桌面版（只有啟動器程式 editor/ 改動時才需要）並建立 Release
//   --no-push      只建置與提交    --no-release  不建立 GitHub Release
//   --note "說明"  更新說明（預設：相容官方遊戲版本）
// Cloudflare 公告網站已連 GitHub：推送後由 Cloudflare 自動建置，請到後台 Deployments 確認成功。
const fs = require("node:fs"), path = require("node:path"), { spawnSync } = require("node:child_process");
const { P, state, sha256, readJson } = require("./lib/util.cjs");
const game = require("./lib/game.cjs");

const argv = process.argv.slice(2), has = (n) => argv.includes("--" + n);
// --auto：全自動相容發布（由 verify/auto.cjs 呼叫）。官方更新條目與新字串不擋發布，改列在 reports/new-content.md 由使用者決定；
// 相容性仍須通過自動測試與實機煙霧測試（live.json）。
const opt = (n, d) => { const i = argv.indexOf("--" + n); return i >= 0 ? argv[i + 1] : d; };
const HOST = "https://nojackno2-ctrl.github.io/d2-survivors-toolkit/";
const REPO = "nojackno2-ctrl/d2-survivors-toolkit";
const run = (cmd, args, cwd, extra = {}) => {
  const r = spawnSync(cmd, args, { cwd, encoding: "utf8", shell: process.platform === "win32" && /^(npm|npx)$/.test(cmd), windowsHide: true, ...extra });
  if (r.status !== 0) throw new Error(`${cmd} ${args.join(" ")} 失敗（${r.status}）\n${(r.stdout || "") + (r.stderr || "")}`.slice(0, 3000));
  return r.stdout.trim();
};

const verified = state().lastVerified;
if (!verified) { console.error("尚無驗證通過紀錄，請先執行 node verify/verify.cjs --update"); process.exit(1); }
const review = readJson(path.join(P.reports, "impact.json"), null);
if (has("confirm") && !has("auto") && (!review || review.build !== verified.build || !Array.isArray(review.items) || review.items.some((item) => item.status !== "已完成" || typeof item.evidence !== "string" || !item.evidence.trim()))) {
  console.error("官方更新內容尚未逐項完成分析與記錄佐證；請先完成 verify/reports/impact.json，再重新執行更新驗證。");
  process.exit(1);
}
const latest = readJson(path.join(P.reports, "latest.json"), null);
const live = readJson(path.join(P.reports, "live.json"), null);
const translation = readJson(path.join(P.reports, "language.json"), null);
if (has("confirm") && (!latest?.ok || latest.mode !== "update" || latest.dry !== false || latest.build !== verified.build || !latest.steps?.some((step) => step.tests?.length))) {
  console.error("缺少相同版本的正式更新測試紀錄，無法發布。"); process.exit(1);
}
const untranslatedNew = (translation?.game?.untranslatedAdded?.length || 0) + (translation?.news?.untranslatedAdded?.length || 0);
if (has("confirm") && (!translation?.ok || (!has("auto") && untranslatedNew))) {
  console.error("新增遊戲字串或新聞尚有未翻譯項目，無法發布。"); process.exit(1);
}
if (has("confirm") && (!live?.ok || live.build !== verified.build || live.fingerprint !== verified.fingerprint || !live.at || !live.evidence || live.url !== "https://d2survivors.lol/play/")) {
  console.error("缺少相同版本及來源指紋的隔離設定檔真實遊戲載入證據，無法發布。"); process.exit(1);
}
const pkgFile = path.join(P.editor, "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgFile, "utf8"));
const note = opt("note", `相容官方遊戲 ${verified.build}`);
const sourceIndex = fs.readFileSync(path.join(P.root, "modifier", "editor.html"), "utf8");
const sourceVersion = sourceIndex.match(/const TOOLKIT_VERSION = "([^"]+)"/)?.[1];
const versionLogPrepared = new RegExp(`<h3>[^<]*v${pkg.version.replaceAll(".", "\\.")}</h3>`).test(sourceIndex);
const committedWebVersion = JSON.parse(run("git", ["show", "HEAD:version.json"], P.web));
const pendingVersion = sourceVersion === pkg.version && versionLogPrepared && committedWebVersion.version !== pkg.version;
const next = has("no-bump") || pendingVersion ? pkg.version : pkg.version.replace(/\d+$/, (n) => String(Number(n) + 1));
const RELEASE_PATHS = new Set([
  "AI_HANDOFF.md", "README.md", "d2edit.js", "index.html", "version.json", ".nojekyll",
  "helper/autobot.js", "helper/selfcheck.js", "helper/AUTOBOT_DESIGN.md", "helper/tests/autobot.cjs", "helper/tests/selfcheck.cjs",
  "lang/lang.js", "lang/d2rfont.js", "lang/zh-TW.json", "lang/locales/zh-TW.json", "lang/tests/test_lang.cjs",
  "modifier/editor.html", "modifier/gamedata.json", "modifier/i18n.js", "modifier/patch.mjs", "modifier/signatures.json", "modifier/webapi.js", "modifier/zh.js", "modifier/engine-page.js",
  "modifier/tests/weapon-sets.cjs", "modifier/tests/weapon-sets-ui.cjs", "modifier/tests/version-gate-web.cjs",
  "site/index.html", "site/install.html", "site/install.template.html", "tools/build-web.js", "lang/tools/desktop-lang.mjs", "lang/tools/lang-missing.mjs", "tools/tests/build-web.cjs", "modifier/tests/item-db.cjs", "modifier/tests/skill-mods.cjs", "modifier/tests/runeword-class-base.cjs", "modifier/tests/load-patch.cjs", "verify/state.json",
]);
// 桌面啟動器（editor/）的程式與版號（editor/package.json）；只有啟動器改動時才會一起提交。
const RELEASE_PREFIXES = ["editor/"];
const releasable = (f) => RELEASE_PATHS.has(f) || RELEASE_PREFIXES.some((p) => f.startsWith(p));

const plan = [
  `驗證通過的遊戲版本：${verified.build}（${verified.at}）`,
  `工具包版本：${pkg.version}${pendingVersion ? "（接續尚未完成的發布）" : next === pkg.version ? "（不升版）" : ` → ${next}（改 editor/package.json 與 modifier/editor.html）`}`,
  `1. 建置網頁版：node tools/build-web.js ${HOST}（更新說明：${note}）`,
  has("desktop") ? "2. 打包桌面版：npm run dist → 舊執行檔備份到 backups/exe/ → 覆蓋根目錄執行檔 → 記錄 SHA-256" : "2. （略過）桌面版（只有 --desktop 才打包；啟動器程式不變時不需要）",
  has("no-push") ? "3. 提交根目錄倉庫（不推送）" : "3. 提交並推送根目錄倉庫到 GitHub（origin）",
  !has("desktop") || has("no-push") || has("no-release") ? "4. （略過）GitHub Release" : `4. 建立 GitHub Release v${next}（附桌面版執行檔與 SHA-256）`,
  "   同時在公告站與工具內「更新日誌」各加一筆（可用 --log \"項目一|項目二\" 加入自訂內容）",
  "5. 推送後 Cloudflare 公告網站會自動建置（需到後台 Deployments 確認成功）",
];
if (!has("confirm")) { console.log("【發布計畫，尚未執行】\n" + plan.join("\n") + "\n\n完成適配、測試與真實遊戲載入後以 --confirm 自動發布。"); process.exit(0); }

const bump = () => {
  if (next === pkg.version) return;
  pkg.version = next; fs.writeFileSync(pkgFile, JSON.stringify(pkg, null, 2) + "\n");
  for (const f of ["modifier/editor.html"]) {
    const p = path.join(P.root, f), s = fs.readFileSync(p, "utf8");
    fs.writeFileSync(p, s.replace(/(const TOOLKIT_VERSION = ")[^"]*(")/, `$1${next}$2`));
  }
};

// 更新日誌：公告站與工具內「更新日誌」頁各加一筆（以版本號判斷，重複執行不會重複加入）。
// 條目＝自動一行「相容官方遊戲 X」＋ --log "項目一|項目二" 自訂的使用者可見變更。
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const addChangelog = () => {
  const date = new Date().toISOString().slice(0, 10), v = pkg.version;
  const groupNames = { game: "遊戲核心", items: "物品與技能", choices: "選卡", style: "介面樣式" };
  const areas = (verified.comparison?.groups || []).map((g) => groupNames[g]).filter(Boolean);
  const coverage = verified.tested?.length ? `已執行 ${verified.tested.length} 項自動測試` : "已執行自動測試";
  const items = [`<b>相容性</b>：針對官方遊戲 ${esc(verified.build)}${areas.length ? ` 的${areas.join("、")}變動` : ""}，${coverage}。`, ...opt("log", "").split("|").filter(Boolean).map(esc)];
  const done = [];
  for (const f of ["modifier/editor.html"]) {
    const p = path.join(P.root, f), s = fs.readFileSync(p, "utf8");
    if (s.includes(`<h3>${date} v${v}</h3>`)) continue;
    const at = s.indexOf("<h3>", s.indexOf("<h2>更新日誌</h2>"));
    if (at < 0) throw new Error(f + " 找不到更新日誌區塊");
    const html = `<h3>${date} v${v}</h3>\n    <ul>\n${items.map((i) => `      <li>${i.replace(/<\/?b>/g, "")}</li>`).join("\n")}\n    </ul>\n    `;
    fs.writeFileSync(p, s.slice(0, at) + html + s.slice(at)); done.push(f);
  }
  const sp = path.join(P.web, "site", "index.html"), s = fs.readFileSync(sp, "utf8");
  if (!s.includes(`<span class="log-ver">v${v}</span>`)) {
    const at = s.indexOf('<div class="log-entry">', s.indexOf('<div class="log">'));
    if (at < 0) throw new Error("公告站找不到更新日誌區塊");
    const html = `<div class="log-entry">\n          <div class="log-date">${date} <span class="log-ver">v${v}</span></div>\n          <ul>\n${items.map((i) => `            <li>${i}</li>`).join("\n")}\n          </ul>\n        </div>\n        `;
    fs.writeFileSync(sp, s.slice(0, at) + html + s.slice(at)); done.push("site/index.html");
  }
  return done;
};

(async () => {
  const official = await game.latestBuild();
  if (official.build !== verified.build) throw new Error(`官方最新版已前進至 ${official.build}，驗證紀錄為 ${verified.build}；請先重新比對與驗收。`);
  bump(); console.log("工具包版本：" + pkg.version);
  console.log("更新日誌：" + (addChangelog().join("、") || "已存在，略過"));
  console.log("建置網頁版…"); run("node", [path.join("tools", "build-web.js"), HOST, note], P.root);
  let exe = null, hash = "";
  if (has("desktop")) {
    console.log("打包桌面版（需要數分鐘）…"); run("npm", ["run", "dist"], P.editor, { timeout: 900000 });
    const built = path.join(P.editor, "dist", "D2倖存者存檔修改器.exe"), target = path.join(P.root, "D2倖存者存檔修改器.exe");
    if (!fs.existsSync(built)) throw new Error("打包後找不到 " + built);
    const stamp = new Date().toISOString().slice(0, 10).replaceAll("-", "");
    fs.mkdirSync(path.join(P.root, "backups", "exe"), { recursive: true });
    if (fs.existsSync(target)) fs.copyFileSync(target, path.join(P.root, "backups", "exe", `D2倖存者存檔修改器-before-${stamp}-v${pkg.version}.exe`));
    fs.copyFileSync(built, target); exe = target; hash = sha256(fs.readFileSync(target));
    console.log("桌面版 SHA-256：" + hash);
  }
  const stagedBefore = run("git", ["diff", "--cached", "--name-only"], P.web).split(/\r?\n/).filter(Boolean);
  const unexpectedStaged = stagedBefore.filter((f) => !releasable(f));
  if (unexpectedStaged.length) throw new Error("暫存區含非本次發布檔案，拒絕提交：" + unexpectedStaged.join("、"));
  const stageArgs = [...RELEASE_PATHS].filter((f) => fs.existsSync(path.join(P.web, f)));
  run("git", ["add", "--", ...stageArgs], P.web);
  run("git", ["add", "-u", "--", ...RELEASE_PREFIXES], P.web);
  const status = run("git", ["status", "--porcelain", "--untracked-files=all"], P.web).split(/\r?\n/).filter(Boolean);
  const unexpectedWorking = status.map((line) => line.slice(3)).filter((f) => !releasable(f));
  if (unexpectedWorking.length) throw new Error("工作目錄含非本次發布檔案，已僅暫存允許清單，拒絕提交：" + unexpectedWorking.join("、"));
  const msg = `chore(相容性): 遊戲 ${verified.build} ${has("auto") ? "自動相容發布" : "適配完成"}，工具包 v${pkg.version}`;
  if (!run("git", ["status", "--porcelain"], P.web)) console.log("倉庫沒有變更，略過提交。");
  else {
    run("git", ["commit", "-m", msg], P.web);
    console.log("已提交倉庫：" + msg);
    if (!has("no-push")) { run("git", ["push", "origin", "HEAD"], P.web); console.log("已推送到 GitHub。"); }
  }
  if (exe && !has("no-push") && !has("no-release")) {
    const body = `## 更新內容\n- 相容官方遊戲 ${verified.build}，已通過自動驗證（掛鉤點、修改器特徵碼與既有測試）。\n- 網頁版書籤載入時自動取得最新版本。\n\n## 使用前請留意\n- Windows 可攜版尚未簽署；需要已安裝相容版本的 D2 Survivors。\n- 使用前請先備份存檔。\n\nSHA-256：\`${hash}\`\n`;
    const url = run("gh", ["release", "create", `v${pkg.version}`, exe, "--repo", REPO, "--title", `v${pkg.version} 相容官方 ${verified.build}`, "--notes", body], P.web);
    console.log("已建立 GitHub Release：" + url);
  }
  console.log("完成。提醒：Cloudflare 會自動建置，請到後台 Deployments 確認成功。");
})().catch((e) => { console.error("發布失敗，已停止：\n" + e.message); process.exit(1); });
