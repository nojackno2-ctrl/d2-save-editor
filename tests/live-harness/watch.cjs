// 每 10 秒檢查：hellClears>=1 且 99 級才標記 cleared（不關閉遊戲）；10 分鐘後輸出摘要結束（喚醒主代理）。
const fs = require("fs"), path = require("path"), { execSync } = require("child_process");
const H = __dirname, dirs = fs.readdirSync(H).filter((n) => n.startsWith("run-")), end = Date.now() + 600000;
const read = (d) => { try { return JSON.parse(fs.readFileSync(path.join(H, d, "status.json"), "utf8")); } catch { return null; } };
const tick = () => {
  for (const d of dirs) {
    const c = path.join(H, d, "cleared"); if (fs.existsSync(c)) continue;
    const s = read(d); if (!(s?.diag?.hellClears >= 1 && s?.level >= 99)) continue;
    fs.writeFileSync(c, new Date().toISOString()); console.log("CLEARED", d, "lv" + s.level);
    // 依使用者要求：達成目標的存檔不關閉，只標記，遊戲繼續跑。
  }
  const done = dirs.filter((d) => fs.existsSync(path.join(H, d, "cleared"))).length;
  if (done >= dirs.length || Date.now() >= end) {
    console.log("--- " + new Date().toTimeString().slice(0, 8) + " cleared " + done + "/" + dirs.length);
    for (const d of dirs) { const s = read(d); console.log(d.padEnd(18), s?.level, s?.diff, s?.state, "d" + s?.deaths, "|", s?.diag?.lastAction); }
    process.exit(0);
  }
};
// 每次檢查都包 try/catch；另設硬性計時器，10 分鐘一到一定輸出摘要並結束（實測曾因檢查拋錯而不結束）。
const safe = () => { try { tick(); } catch (e) { console.log("tick error", e.message); } };
setTimeout(() => { const ds = dirs; console.log("--- " + new Date().toTimeString().slice(0, 8) + " (timer)"); for (const d of ds) { const s = read(d); console.log(d.padEnd(18), s?.level, s?.diff, s?.state, "d" + s?.deaths, "|", s?.diag?.lastAction); } process.exit(0); }, 605000);
safe(); setInterval(safe, 10000);
