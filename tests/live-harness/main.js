// 測試框架：全新設定檔載入真實遊戲，注入本機 autobot.js，定時記錄狀態與截圖；控制只透過指令檔 cmd.js（僅建檔用）。
const { app, BrowserWindow } = require("electron");
const fs = require("fs"), path = require("path");
const OUT = process.env.H_OUT || path.join(__dirname, "out");
fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(path.join(OUT, "pid"), String(process.pid));
app.commandLine.appendSwitch("disable-renderer-backgrounding");
app.commandLine.appendSwitch("disable-background-timer-throttling");
app.setPath("userData", path.join(OUT, "profile"));
const log = (...a) => fs.appendFileSync(path.join(OUT, "log.txt"), new Date().toISOString().slice(11, 19) + " " + a.join(" ") + "\n");
app.whenReady().then(async () => {
  const win = new BrowserWindow({ width: 960, height: 600, show: true, x: -2000, y: 0, webPreferences: { backgroundThrottling: false } });
  win.webContents.on("console-message", (e, lvl, msg) => { if (lvl >= 2) log("console", msg.slice(0, 300)); });
  win.webContents.on("did-fail-load", (e, c, d, u) => log("FAIL", c, d, u));
  win.webContents.on("did-navigate", (e, u) => log("nav", u));
  win.webContents.on("render-process-gone", (e, d) => log("GONE", JSON.stringify(d)));
  await win.loadURL("https://d2survivors.lol/play/").catch((e) => log("loadURL", e.message));
  log("loaded");
  const BOOT = fs.readFileSync(path.join(__dirname, "boot.js"), "utf8");
  const boot = async () => { try { const r = await win.webContents.executeJavaScript(`window.__H_CLASS=${JSON.stringify(process.env.H_CLASS)};window.__H_BASE=${JSON.stringify(process.env.H_BASE || "")};window.__H_SPEED=${Number(process.env.H_SPEED || 1)};window.__H_BOT=${JSON.stringify(fs.readFileSync(process.env.H_BOT, "utf8"))};` + BOOT); log("boot", r); } catch (e) { log("boot err", e.message); } };
  // H_SEED：測試用既有存檔（JSON 檔）。首次載入時寫入遊戲存檔鍵並重新整理，之後才跑建檔流程。
  const seeded = path.join(OUT, "seeded");
  if (process.env.H_SEED && !fs.existsSync(seeded)) {
    const save = fs.readFileSync(process.env.H_SEED, "utf8");
    await win.webContents.executeJavaScript(`localStorage.setItem("d2-survivors/save/v1", ${JSON.stringify(save)}); 1`);
    fs.writeFileSync(seeded, "1"); log("seeded", process.env.H_SEED);
    win.webContents.on("did-finish-load", () => setTimeout(boot, 8000));
    win.webContents.reload();
  } else {
    win.webContents.on("did-finish-load", () => setTimeout(boot, 8000));
    setTimeout(boot, 8000);
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
