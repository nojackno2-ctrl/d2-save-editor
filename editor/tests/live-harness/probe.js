// 唯讀陣亡紀錄器：每 100ms 取樣，陣亡瞬間保存前 3 秒的生命、藥帶、近敵與輔助器動作。
(() => {
  if (window.__hProbe) clearInterval(window.__hProbe);
  window.__hDeathLog = window.__hDeathLog || []; const ring = []; let last = "";
  window.__hProbe = setInterval(() => {
    const b = window.__d2autobot, g = b?.game, w = g?.world, p = w?.player; if (!p) return;
    const foes = (w.enemies || w.monsters || []).filter((e) => e && e.life > 0).map((e) => ({ n: e.name || e.id || e.type, r: e.rank, d: Math.round(Math.hypot(e.x - p.x, e.y - p.y)) })).sort((a, b) => a.d - b.d).slice(0, 5);
    ring.push({ t: Math.round(performance.now()), hp: Math.round(p.life) + "/" + Math.round(p.maxLife), belt: (w.belt?.columns || []).map((c) => c?.length || 0).join(""), foes, act: b.diagnostics?.().lastAction, missiles: (w.hostiles || []).length });
    if (ring.length > 30) ring.shift();
    if (g.state === "dead" && last !== "dead" && !g.tierDone && !g.won) window.__hDeathLog.push({ at: new Date().toISOString(), lv: p.level, diff: w.difficulty ?? g.difficulty, act: w.act, area: w.area?.name ?? w.area?.id, trace: ring.slice(-12) });
    last = g.state;
  }, 100);
  const st = window.__h.status; if (!st.__p) { window.__h.status = Object.assign(() => ({ ...st(), deathLog: window.__hDeathLog.slice(-3) }), { __p: 1 }); }
  return "probe";
})();
