// 適配：用遊戲快照確認工具包的掛鉤點仍成立，並自動更新每版都會變的檔名雜湊與測試版本常數。
const fs = require("node:fs"), path = require("node:path");
const { P } = require("./util.cjs");
const { snapshotDir } = require("./game.cjs");

const read = (f) => fs.readFileSync(f, "utf8");
const jsFiles = (dir) => Object.fromEntries(fs.readdirSync(dir).filter((f) => f.endsWith(".js")).map((f) => [f, read(path.join(dir, f))]));

// 從 autobot.js 本身取出找 Game 模組的特徵（單一來源，不另外抄一份）。
function hookSignatures() {
  const src = read(path.join(P.editor, "autobot.js"));
  const m = /const signatures = (\[.*\]);/.exec(src);
  if (!m) throw new Error("autobot.js 找不到 signatures 陣列，掛鉤特徵格式已變動");
  return new Function("return " + m[1])();
}

function analyze(build, snapshotRoot) {
  const dir = path.join(snapshotRoot || snapshotDir(build), "assets"), files = jsFiles(dir), issues = [];
  const sigs = hookSignatures();
  const gameFile = Object.keys(files).find((f) => /^game-/i.test(f) && sigs.every((re) => re.test(files[f])));
  if (!gameFile) issues.push("找不到同時符合 autobot 4 項特徵的 Game 模組（掛鉤點失效）");
  // 輔助器呼叫的原版 Game 方法（從 autobot.js 的 g.xxx(／game.xxx( 自動收集），每個都要在新版 Game 模組裡有定義。
  if (gameFile) {
    const used = [...new Set([...read(path.join(P.editor, "autobot.js")).matchAll(/\b(?:game|g)\.([A-Za-z_]\w*)\(/g)].map((m) => m[1]))];
    const gone = used.filter((name) => !new RegExp("(?:^|[;,{}\\s*])(?:async\\s+)?" + name + "\\(.{0,300}?\\)\\{").test(files[gameFile]));
    if (gone.length) issues.push("新版 Game 模組找不到輔助器用到的方法：" + gone.join("、"));
  }
  const itemArt = Object.keys(files).find((f) => f.startsWith("itemArt-") && /doubleSwing:\{/.test(files[f]) && /innerSight:\{/.test(files[f]));
  if (!itemArt) issues.push("找不到含技能表（doubleSwing／innerSight）的 itemArt 模組");
  const saveTransfer = Object.keys(files).find((f) => f.startsWith("saveTransfer-") && /`attribute`/.test(files[f]) && /\.difficulty/.test(files[f]));
  if (!saveTransfer) issues.push("找不到含選卡函式特徵（attribute／difficulty）的 saveTransfer 模組");
  // 物品引擎簽名（修改器用）：必要簽名缺失才算問題，選用的缺了只提示。
  const patch = require(path.join(P.editor, "patch.js")).patch;
  const sigJson = JSON.parse(read(path.join(P.editor, "signatures.json")));
  const { missing } = patch(files, sigJson);
  if (missing.length) issues.push("修改器特徵碼失效：" + missing.join("、"));
  return { build, roles: { game: gameFile, itemArt, saveTransfer }, signaturesMissing: missing, issues, ok: issues.length === 0 };
}

// 根目錄（玩家實際載入、唯一來源）與 editor/ 衍生副本都要改，否則下次同步會把改動蓋掉。
const NAME_FILES = () => [path.join(P.editor, "autobot.js"), path.join(P.editor, "tests", "autobot.cjs"), path.join(P.root, "helper", "autobot.js"), path.join(P.root, "helper", "tests", "autobot.cjs")].filter((f) => fs.existsSync(f));
const BUILD_FILES = () => [...["autobot.js", "index.html", "editor.html"].map((f) => path.join(P.editor, f)), path.join(P.root, "helper", "autobot.js"), path.join(P.root, "modifier", "editor.html")].filter((f) => fs.existsSync(f));

// 把檔案內寫死的 itemArt-／saveTransfer- 檔名換成新版；回傳實際改了哪些檔（先備份）。
function applyNames(roles, backupDir) {
  const changed = [];
  for (const f of NAME_FILES()) {
    let s = read(f), o = s;
    if (roles.itemArt) s = s.replace(/itemArt-[\w-]+\.js/g, roles.itemArt);
    if (roles.saveTransfer) s = s.replace(/saveTransfer-[\w-]+\.js/g, roles.saveTransfer);
    if (s !== o) { backup(f, backupDir); fs.writeFileSync(f, s); changed.push(path.relative(P.root, f)); }
  }
  return changed;
}
// 全部驗證通過後才更新「已測試的遊戲版本」常數。
function bumpTestedBuild(build, backupDir) {
  const changed = [];
  for (const f of BUILD_FILES()) {
    const s = read(f), n = s.replace(/(const TESTED_GAME_BUILD = ")[^"]*(")/g, `$1${build}$2`);
    if (n !== s) { backup(f, backupDir); fs.writeFileSync(f, n); changed.push(path.relative(P.root, f)); }
  }
  return changed;
}
function backup(f, dir) {
  const to = path.join(dir, path.relative(P.root, f));
  if (fs.existsSync(to)) return;
  fs.mkdirSync(path.dirname(to), { recursive: true }); fs.copyFileSync(f, to);
}
function restore(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else { const dest = path.join(P.root, path.relative(dir, p)); fs.copyFileSync(p, dest); out.push(path.relative(P.root, dest)); } } };
  walk(dir); return out;
}
module.exports = { analyze, applyNames, bumpTestedBuild, restore, backup };
