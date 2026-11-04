// 只讀查詢工具：在指定存檔執行 code（結果字串存到 window.__q），再以 2800 字一段讀回，寫到 out 檔。
// 用法：node pq.cjs <run 目錄> <查詢檔.js> <輸出檔>
const fs = require("fs"), path = require("path");
const [dir, file, out] = process.argv.slice(2), log = path.join(__dirname, dir, "log.txt"), cmd = path.join(__dirname, dir, "cmd.js");
const tag = "PQ" + Date.now().toString(36);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function ask(code, marker) {
  fs.writeFileSync(cmd, code);
  for (let i = 0; i < 60; i++) { await sleep(1000); const lines = fs.readFileSync(log, "utf8").split("\n").filter((l) => l.includes(marker)); if (lines.length) return JSON.parse(lines.at(-1).replace(/^.*?cmd /, "")); }
  throw Error("timeout " + marker);
}
(async () => {
  const len = await ask(`(async()=>{try{window.__q=String(await (async()=>{${fs.readFileSync(file, "utf8")}})());}catch(e){window.__q="ERR "+e.stack}return "${tag}L "+window.__q.length})()`, tag + "L");
  const n = +len.split(" ")[1]; let all = "";
  for (let i = 0; i < n; i += 2800) { const part = await ask(`"${tag}P${i} "+window.__q.slice(${i},${i + 2800})`, `${tag}P${i} `); all += part.slice(part.indexOf(" ") + 1); }
  fs.writeFileSync(out, all); console.log("wrote", out, all.length);
})().catch((e) => { console.error(e.message); process.exit(1); });
