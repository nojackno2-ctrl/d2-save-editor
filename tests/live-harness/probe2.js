// 唯讀裝備異動紀錄：每秒比對穿戴欄位，變化時記錄前後與輔助器最後動作。
(() => {
  if (window.__hGearProbe) clearInterval(window.__hGearProbe);
  window.__hGearLog = window.__hGearLog || []; let prev = null;
  const label = (x) => x ? (x.rarity || "?")[0] + ":" + (x.name || x.base) : "空";
  window.__hGearProbe = setInterval(() => { try {
    const b = window.__d2autobot, g = b?.game, p = g?.world?.player; if (!p || typeof g.equippedOf !== "function") return;
    const w = g.equippedOf(p.cls), cur = {}; for (const k of ["weapon", "shield", "head", "body", "gloves", "belt", "boots", "amulet", "ring1", "ring2"]) cur[k] = label(w[k]);
    if (prev) { const ch = Object.keys(cur).filter((k) => cur[k] !== prev[k]).map((k) => k + ":" + prev[k] + "→" + cur[k]); if (ch.length) { window.__hGearLog.push({ at: new Date().toISOString().slice(11, 19), lv: p.level, st: g.state, ch, act: b.diagnostics?.().lastAction }); if (window.__hGearLog.length > 60) window.__hGearLog.shift(); } }
    prev = cur;
  } catch {} }, 1000);
  const st = window.__h.status; if (!st.__g) window.__h.status = Object.assign(() => ({ ...st(), gearLog: window.__hGearLog.slice(-15) }), { __p: 1, __g: 1 });
  return "probe2";
})();
