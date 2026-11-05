// 單一來源：根目錄模組資料夾（helper/、lang/、modifier/…）是玩家實際載入、也是大家直接修改的版本。
// editor/ 的平放檔只是桌面版與驗證腳本用的衍生副本；每次驗證、發布前先由本腳本從根目錄同步過來，
// 避免 build-web.js 用過時的 editor/ 副本覆蓋根目錄（2026-11-05 曾因此差點回退翻譯與輔助器修正）。
//   node editor/sync-from-web.js          同步並列出變更
//   node editor/sync-from-web.js --check  只檢查，有差異時以退出碼 1 結束
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");
// 與 build-web.js 的 LAYOUT 相反方向（editor 檔名 → 根目錄位置）
const LAYOUT = {
  "d2edit.js": "d2edit.js", "README.md": "README.md",
  "autobot.js": "helper/autobot.js", "AUTOBOT_DESIGN.md": "helper/AUTOBOT_DESIGN.md",
  "lang.js": "lang/lang.js", "d2rfont.js": "lang/d2rfont.js", "zh-TW.json": "lang/zh-TW.json", "locales/zh-TW.json": "lang/locales/zh-TW.json",
  "i18n.js": "modifier/i18n.js", "webapi.js": "modifier/webapi.js", "zh.js": "modifier/zh.js", "gamedata.json": "modifier/gamedata.json",
  "engine-page.js": "modifier/engine-page.js", "signatures.json": "modifier/signatures.json",
  // 測試：路徑寫法相容（以 __dirname/.. 找原始碼），根目錄版本與根目錄程式同步維護
  "tests/autobot.cjs": "helper/tests/autobot.cjs",
};
// modifier/patch.mjs（網頁版實際載入）＝ editor/patch.js ＋ 結尾一行 export
const PATCH_EXPORT = "\nexport const patch = self.D2Patch.patch;\n";
// build-web.js 把 editor/index.html 的三個 <script src> 換成防快取載入區塊；這裡還原。
const LOADER = /<script>\r?\n\/\/ 依診斷（iPhone 一直用快取的舊 webapi\.js）[\s\S]*?<\/script>\r?\n\r?\n/;
const TAGS = '<script src="i18n.js"></script>\n<script src="webapi.js"></script>\n<script src="zh.js"></script>';
const norm = (s) => s.replace(/\r\n/g, "\n");

function plan() {
  const out = [];
  for (const [ed, web] of Object.entries(LAYOUT)) {
    const src = path.join(root, web), dst = path.join(__dirname, ed);
    if (!fs.existsSync(src)) continue;
    const next = fs.readFileSync(src, "utf8");
    if (!fs.existsSync(dst) || norm(fs.readFileSync(dst, "utf8")) !== norm(next)) out.push([dst, next, web]);
  }
  const mjs = path.join(root, "modifier", "patch.mjs");
  if (fs.existsSync(mjs)) {
    const text = norm(fs.readFileSync(mjs, "utf8")), dst = path.join(__dirname, "patch.js");
    if (!text.endsWith(PATCH_EXPORT)) throw new Error("modifier/patch.mjs 結尾不是預期的 export 行");
    const next = text.slice(0, -PATCH_EXPORT.length);
    if (norm(fs.readFileSync(dst, "utf8")) !== next) out.push([dst, next, "modifier/patch.mjs"]);
  }
  const page = path.join(root, "modifier", "editor.html");
  if (fs.existsSync(page)) {
    const html = fs.readFileSync(page, "utf8");
    if (!LOADER.test(html)) throw new Error("modifier/editor.html 找不到 build-web 的載入區塊，無法還原成 editor/index.html");
    const next = html.replace(LOADER, TAGS), dst = path.join(__dirname, "index.html");
    if (norm(fs.readFileSync(dst, "utf8")) !== norm(next)) out.push([dst, next, "modifier/editor.html"]);
  }
  return out;
}

function sync({ check = false, quiet = false } = {}) {
  const changes = plan();
  if (!check) for (const [dst, text] of changes) fs.writeFileSync(dst, text);
  if (!quiet && changes.length) console.log((check ? "editor/ 與根目錄不同步：" : "已從根目錄同步到 editor/：") + changes.map((c) => c[2]).join("、"));
  return changes.map((c) => c[2]);
}
module.exports = { sync, LAYOUT };
if (require.main === module) {
  const check = process.argv.includes("--check");
  const changed = sync({ check });
  if (!changed.length) console.log("editor/ 已與根目錄一致。");
  if (check && changed.length) process.exitCode = 1;
}
