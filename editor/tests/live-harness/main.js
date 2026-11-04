// 測試框架：全新設定檔載入真實遊戲，注入本機 autobot.js，定時記錄狀態與截圖；控制只透過指令檔 cmd.js（僅建檔用）。
const { app, BrowserWindow } = require("electron");
const fs = require("fs"), path = require("path");
const http = require("http");
const OUT = process.env.H_OUT || path.join(__dirname, "out");
fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(path.join(OUT, "pid"), String(process.pid));
app.commandLine.appendSwitch("disable-renderer-backgrounding");
app.commandLine.appendSwitch("disable-background-timer-throttling");
app.setPath("userData", path.join(OUT, "profile"));
const log = (...a) => fs.appendFileSync(path.join(OUT, "log.txt"), new Date().toISOString().slice(11, 19) + " " + a.join(" ") + "\n");
app.whenReady().then(async () => {
  let sourceServer;
  let bootTimer, bootFn;
  let editorURL = "https://nojackno2-ctrl.github.io/d2-survivors-toolkit/d2edit.js";
  if (process.env.H_SOURCE) {
    const root = path.resolve(process.env.H_SOURCE);
    const mime = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8", ".css": "text/css; charset=utf-8", ".svg": "image/svg+xml" };
    sourceServer = http.createServer((req, res) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      res.setHeader("Cache-Control", "no-store");
      if (req.method === "OPTIONS") { res.writeHead(204).end(); return; }
      if (req.method !== "GET" && req.method !== "HEAD") { res.writeHead(405).end(); return; }
      let file;
      try { file = path.resolve(root, "." + decodeURIComponent(new URL(req.url, "http://localhost").pathname)); }
      catch { res.writeHead(400).end(); return; }
      if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
      fs.readFile(file, (err, data) => {
        if (err) { res.writeHead(err.code === "ENOENT" ? 404 : 500).end(); return; }
        res.setHeader("Content-Type", mime[path.extname(file).toLowerCase()] || "application/octet-stream");
        res.writeHead(200).end(req.method === "HEAD" ? undefined : data);
      });
    });
    await new Promise((resolve, reject) => { sourceServer.once("error", reject); sourceServer.listen(0, "127.0.0.1", resolve); });
    editorURL = `http://127.0.0.1:${sourceServer.address().port}/d2edit.js`;
    log("source", root, editorURL);
    for (const name of ["d2edit.js", "patch.mjs", "signatures.json", "autobot.js", "lang.js", "editor.html", "zh-TW.json"]) {
      const file = path.join(root, name);
      if (fs.existsSync(file)) log("sha256", name, require("crypto").createHash("sha256").update(fs.readFileSync(file)).digest("hex"));
    }
    app.on("before-quit", () => sourceServer.close());
  }
  const win = new BrowserWindow({ width: 960, height: 600, show: true, x: -2000, y: 0, webPreferences: { backgroundThrottling: false } });
  win.webContents.on("console-message", (e, lvl, msg, line, source) => { if (lvl >= 2) log("console", source, line, msg.slice(0, 600)); });
  win.webContents.on("did-finish-load", () => { if (bootFn) { clearTimeout(bootTimer); bootTimer = setTimeout(bootFn, 8000); } });
  win.webContents.on("did-fail-load", (e, c, d, u) => log("FAIL", c, d, u));
  win.webContents.on("did-navigate", (e, u) => log("nav", u));
  win.webContents.on("render-process-gone", (e, d) => log("GONE", JSON.stringify(d)));
  await win.loadURL("https://d2survivors.lol/play/").catch((e) => log("loadURL", e.message));
  log("loaded");
  const BOOT = fs.readFileSync(path.join(__dirname, "boot.js"), "utf8");
  const boot = async () => { try { const r = await win.webContents.executeJavaScript(`window.__H_CLASS=${JSON.stringify(process.env.H_CLASS)};window.__H_SPEED=${Number(process.env.H_SPEED || 1)};window.__H_D2EDIT_URL=${JSON.stringify(editorURL)};window.__H_BOT=${JSON.stringify(fs.readFileSync(process.env.H_BOT, "utf8"))};` + BOOT); log("boot", r); } catch (e) { log("boot err", e.message); } };
  bootFn = boot;
  // H_SEED：測試用既有存檔（JSON 檔）。首次載入時寫入遊戲存檔鍵並重新整理，之後才跑建檔流程。
  const seeded = path.join(OUT, "seeded");
  if (process.env.H_SEED && !fs.existsSync(seeded)) {
    const save = fs.readFileSync(process.env.H_SEED, "utf8");
    await win.webContents.executeJavaScript(`localStorage.setItem("d2-survivors/save/v1", ${JSON.stringify(save)}); 1`);
    fs.writeFileSync(seeded, "1"); log("seeded", process.env.H_SEED);
    clearTimeout(bootTimer);
    win.webContents.reload();
  } else {
    clearTimeout(bootTimer); bootTimer = setTimeout(boot, 8000);
  }
  let n = 0;
  setInterval(async () => {
    try {
      const cf = path.join(OUT, "cmd.js");
      if (fs.existsSync(cf)) { const code = fs.readFileSync(cf, "utf8"); fs.unlinkSync(cf);
        const m = /^CLICK (\d+) (\d+)/.exec(code); if (m) { const [x, y] = [+m[1], +m[2]]; for (const type of ["mouseMove", "mouseDown", "mouseUp"]) win.webContents.sendInputEvent({ type, x, y, button: "left", clickCount: 1 }); log("click", x, y); return; } const r = await win.webContents.executeJavaScript(code); log("cmd", JSON.stringify(r)?.slice(0, 3000)); }
      if (n++ % 2 === 0) { const img = await win.webContents.capturePage(); fs.writeFileSync(path.join(OUT, "shot.png"), img.resize({ width: 800 }).toPNG()); }
      const st = await win.webContents.executeJavaScript("window.__h?.status?.() ?? null");
      if (st) fs.writeFileSync(path.join(OUT, "status.json"), JSON.stringify(st, null, 1));
    } catch (e) { log("err", e.message); }
  }, 5000);
});
