// 依使用者要求：所有模擬都用 GitHub 連結實測——等 GitHub Pages 上的 autobot.js 與本機 web/autobot.js 一致（部署完成），
// 再讓每個遊戲頁面像玩家點書籤一樣 import GitHub 上的 d2edit.js（它會載入 GitHub 上的輔助器、修改器引擎）。
const fs = require("fs"), path = require("path");
const BASE = "https://nojackno2-ctrl.github.io/d2-save-editor/";
const norm = (t) => t.replace(/\r\n/g, "\n").trim();
const local = norm(fs.readFileSync(path.join(__dirname, "..", "..", "autobot.js"), "utf8"));
(async () => {
  for (let i = 0; i < 60; i++) {
    const remote = norm(await (await fetch(BASE + "autobot.js?t=" + Date.now(), { cache: "no-store" })).text());
    if (remote === local) { console.log("GitHub 已部署最新 autobot.js"); break; }
    if (i === 59) { console.log("等待逾時：GitHub 版本與本機不同"); process.exit(1); }
    await new Promise((r) => setTimeout(r, 10000));
  }
  const code = `(async () => { window.__d2autobotSwitches ??= { enabled: !!window.__d2autobot?.settings?.enabled || true, progressEnabled: true }; await import("${BASE}d2edit.js?v=" + Date.now()); for (let i = 0; i < 120 && window.__d2editLoading; i++) await new Promise((r) => setTimeout(r, 500)); return "gh-reloaded " + (window.__d2autobot ? "bot" : "nobot"); })()`;
  for (const d of fs.readdirSync(__dirname).filter((n) => n.startsWith("run-"))) fs.writeFileSync(path.join(__dirname, d, "cmd.js"), code);
  console.log("已送出書籤式重載");
})().catch((e) => { console.error(e.message); process.exit(1); });
