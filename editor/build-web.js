// 產生網頁版（書籤）檔案到專案根目錄（Git 倉庫根）
// 用法：node build-web.js https://你的網址/路徑/ [更新說明]
const fs = require("fs");
const path = require("path");

const host = process.argv[2];
if (!host || !/^https?:\/\/.+\/$/.test(host)) {
  console.error("用法：node build-web.js https://你的網址/路徑/   （結尾要有 /）");
  process.exit(1);
}
const out = path.join(__dirname, "..");
// 先確認來源齊全，避免清除輸出後才發現輔助工具遺失。
// 來源（editor/ 平放）→ 網頁版輸出位置：入口與共用檔在根目錄，輔助器／語言／修改器各一個資料夾，公告與安裝頁在 site/
const LAYOUT = {
  "d2edit.js": "d2edit.js", "README.md": "README.md",
  "autobot.js": "helper/autobot.js", "AUTOBOT_DESIGN.md": "helper/AUTOBOT_DESIGN.md",
  "lang.js": "lang/lang.js", "d2rfont.js": "lang/d2rfont.js", "zh-TW.json": "lang/zh-TW.json", "locales/zh-TW.json": "lang/locales/zh-TW.json",
  "i18n.js": "modifier/i18n.js", "webapi.js": "modifier/webapi.js", "zh.js": "modifier/zh.js", "gamedata.json": "modifier/gamedata.json",
  "engine-page.js": "modifier/engine-page.js", "signatures.json": "modifier/signatures.json",
};
const files = Object.keys(LAYOUT);
const dest = (f) => LAYOUT[f] || f;
for (const f of [...files, "index.html", "patch.js", "web-install.html", "package.json"]) {
  if (!fs.statSync(path.join(__dirname, f)).isFile()) throw new Error("缺少建置來源：" + f);
}
// 輸出目錄就是專案根目錄（Git 倉庫根），只覆寫下列產出檔案，絕不清空目錄。
const copy = (from, to = from) => {
  fs.mkdirSync(path.dirname(path.join(out, dest(to))), { recursive: true });
  fs.copyFileSync(path.join(__dirname, from), path.join(out, dest(to)));
};

for (const d of ["modifier", "site"]) fs.mkdirSync(path.join(out, d), { recursive: true });
// editor.html 裡的腳本加上建置時間，避免手機用舊快取
const stamp = Date.now().toString(36);
fs.writeFileSync(path.join(out, "modifier", "editor.html"), fs.readFileSync(path.join(__dirname, "index.html"), "utf8")
  .replace('<script src="i18n.js"></script>', `<script>\n// 依診斷（iPhone 一直用快取的舊 webapi.js）：用本頁網址的 ?v=（書籤每次開啟修改器都帶新值）載入這三個腳本，避免手機快取舊版；document.write 保持載入順序。\n(() => { const v = new URLSearchParams(location.search).get("v") || String(Date.now()); for (const f of ["i18n.js", "webapi.js", "zh.js"]) document.write('<script src="' + f + "?v=" + encodeURIComponent(v) + '"><' + '/script>'); })();\n</script>`)
  .replace('<script src="webapi.js"></script>', "")
  .replace('<script src="zh.js"></script>', ""));
for (const f of files) copy(f);
// patch.js 是 UMD，網頁版用 import 載入，所以包成 ES module
fs.writeFileSync(path.join(out, "modifier", "patch.mjs"), fs.readFileSync(path.join(__dirname, "patch.js"), "utf8") + "\nexport const patch = self.D2Patch.patch;\n");

const bookmarklet = `javascript:import('${host}d2edit.js?v='+Date.now())`;
fs.writeFileSync(path.join(out, "site", "install.html"), fs.readFileSync(path.join(__dirname, "web-install.html"), "utf8")
  .replaceAll("{{BOOKMARKLET}}", bookmarklet).replaceAll("{{BOOKMARKLET_HTML}}", bookmarklet.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;")));
// GitHub Pages 根網址仍要有首頁：只放轉址到 site/ 資料夾的安裝頁（網站檔案全部集中在 site/）
const redirect = ["<!doctype html>", '<meta charset="utf-8">', "<title>D2倖存者工具包</title>", '<meta http-equiv="refresh" content="0; url=site/install.html">', '<a href="site/install.html">前往安裝頁 / Go to the install page</a>', ""].join("\n");
fs.writeFileSync(path.join(out, "index.html"), redirect);
// 修改器開著時會定期讀 version.json，發現新版就提醒玩家重新載入
const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, "package.json"), "utf8"));
const inPage = fs.readFileSync(path.join(__dirname, "index.html"), "utf8").match(/const TOOLKIT_VERSION = "([^"]+)"/)?.[1];
if (inPage !== pkg.version) throw new Error(`index.html 的 TOOLKIT_VERSION（${inPage}）與 package.json（${pkg.version}）不一致`);
const note = process.argv[3] || "";
fs.writeFileSync(path.join(out, "version.json"), JSON.stringify({ version: pkg.version, note, date: new Date().toISOString().slice(0, 10) }) + "\n");
fs.writeFileSync(path.join(out, ".nojekyll"), "");
console.log("已輸出到", out);
console.log("書籤：", bookmarklet);
