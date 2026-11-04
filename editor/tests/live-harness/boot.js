// 建檔與監看（不操作遊戲）：進入遊戲、設定輔助器、選職業建立新角色；之後只讀取狀態。
(async () => {
  const CLS = window.__H_CLASS, SPEED = window.__H_SPEED || 1;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  window.addEventListener("error", (e) => console.error("H_RUNTIME_ERROR", e.error?.stack || e.message));
  window.addEventListener("unhandledrejection", (e) => console.error("H_UNHANDLED_REJECTION", e.reason?.stack || String(e.reason)));
  const hosted = [...document.querySelectorAll("button")].find((b) => /hosted/i.test(b.textContent));
  if (hosted) { hosted.click(); return "hosted"; }
  if (!window.__d2autobot) {
    const st = JSON.parse(localStorage.getItem("d2autobot:settings") || "{}");
    localStorage.setItem("d2autobot:settings", JSON.stringify({ ...st, version: 4, enabled: true, progressEnabled: true, quest: { ...(st.quest || {}), autoProgress: true, autoStart: true, prioritizeBoss: true, farmDifficulty: "off" }, terror: { ...(st.terror || {}), mode: "off" } }));
    // 預設依 GitHub Pages 驗收；設定 H_SOURCE 時由 Electron 主程式提供本機待驗版本。
    // 新版輔助器重新整理後總開關預設關閉；模擬「玩家打開開關」，先寫入頁面記憶體。
    window.__d2autobotSwitches = { enabled: true, progressEnabled: true };
    await import((window.__H_D2EDIT_URL || "https://nojackno2-ctrl.github.io/d2-survivors-toolkit/d2edit.js") + "?v=" + Date.now());
  }
  for (let i = 0; i < 40 && !window.__d2autobot?.game; i++) { document.body.dispatchEvent(new KeyboardEvent("keydown", { key: " ", code: "Space", bubbles: true })); await sleep(500); }
  const g = window.__d2autobot.game; if (!g) return "no game";
  if (!window.__hSpeed && SPEED > 1) {
    window.__hSpeed = true; const orig = g.tick.bind(g);
    g.tick = (dt) => { for (let k = 0; k < SPEED; k++) orig(dt); };
  }
  if (g.state === "select" && !window.__hPicked) {
    const hasSaved = Object.values(g.save?.heroes ?? {}).some((h) => h?.kept || h?.run);
    if (hasSaved && g.frontend?.open && !g.plainSelect().onPick) { g.frontend.actions.play(); await sleep(3000); }
    if (!g.plainSelect().onPick) { g.chooseClass(); await sleep(1500); }
    const s = g.plainSelect(), ids = ["amazon", "assassin", "necromancer", "barbarian", "paladin", "sorceress", "druid"];
    const byLabel = s.cards.findIndex((c) => c.textContent.trim().toLowerCase().startsWith(CLS));
    const i = byLabel >= 0 ? byLabel : ids.indexOf(CLS);
    if (i < 0 || i >= s.cards.length) return "unknown class " + CLS;
    s.select(i); await sleep(300); s.confirm(false); // false：有存檔進度就接續原角色，沒有才開新角色（原版 confirm 實作） await sleep(1000); window.__hPicked = g.state !== "select";
  }
  // 陣亡畫面很短，status 每 5 秒取樣會漏；改為每 200ms 偵測。
  let deaths = 0, lastState = "";
  setInterval(() => { const g = window.__d2autobot?.game; if (g?.state === "dead" && lastState !== "dead" && !g.tierDone && !g.won) deaths++; lastState = g?.state; }, 200);
  window.__h = { status() {
    const g = window.__d2autobot?.game, w = g?.world, p = w?.player;
    return { t: new Date().toISOString(), state: g?.state, cls: g?.kit?.id, level: p?.level, hp: p ? Math.round(p.life) + "/" + Math.round(p.maxLife) : null, diff: w?.difficulty ?? g?.difficulty, act: w?.act ?? w?.area?.act, area: w?.area?.name ?? w?.area?.id, gold: g?.save?.gold, deaths, baal: g?.baalSlain, diag: window.__d2autobot?.diagnostics() };
  } };
  return "picked " + CLS + " state=" + g.state;
})();
