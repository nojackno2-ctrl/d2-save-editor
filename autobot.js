// D2 倖存者遊戲輔助工具。只控制原版輸入與流程，不改角色數值或任務旗標。
// 靜態對照（2026-10-31）：Game-C88Jt16A.js、itemArt-Bh8qPZQJ.js、saveTransfer-BNubg1tX.js。
(() => {
  "use strict";
  window.__d2autobot?.destroy();
  const KEY = "d2autobot:settings";
  const defaults = {
    version: 2, enabled: false, panicKey: "F8",
    potion: { autoHp: true, hpThreshold: 50, lethalProtection: true, lethalLookaheadSec: 0.3, hpCooldownMs: 1200, autoMp: false, mpThreshold: 30, mpCooldownMs: 2000, fallbackHpSlot: 1, fallbackMpSlot: 2 },
    movement: { enabled: true, kiteDistance: 220, dodgeProjectiles: true, projectileSafetyRadius: 45, smoothingFactor: 0.6 },
    loot: { enabled: true, searchRadius: 450, pickupGold: true, minRuneTier: 1, qualityThreshold: { normal: false, magic: false, rare: true, set: true, unique: true, runeword: true }, backtrackForLoot: true },
    terror: { mode: "off", targetFarmTier: 1, autoReviveOrRestart: false, postClearWaitSec: 3 },
    quest: { autoProgress: false, prioritizeBoss: true },
    deathProtection: { enabled: false, emergencyHpPercent: 15, disableAutomation: true },
  };
  // 僅接受已知欄位與型別，不接收原型屬性或任意指令。
  function merge(base, value) {
    return Object.fromEntries(Object.entries(base).map(([k, v]) => [k, v && typeof v === "object" ? merge(v, value?.[k]) : typeof value?.[k] === typeof v ? value[k] : v]));
  }
  let settings = merge(defaults, {}), storageNote = "";
  try { settings = merge(defaults, JSON.parse(localStorage.getItem(KEY) || "{}")); }
  catch { storageNote = "設定無法讀取，使用預設值"; }
  const bounds = {
    "deathProtection.emergencyHpPercent": [1, 90],
    "potion.hpThreshold": [10, 90], "potion.mpThreshold": [10, 80], "potion.lethalLookaheadSec": [0.1, 1],
    "potion.hpCooldownMs": [500, 5000], "potion.mpCooldownMs": [1000, 5000], "potion.fallbackHpSlot": [1, 4], "potion.fallbackMpSlot": [1, 4],
    "movement.kiteDistance": [40, 500], "movement.projectileSafetyRadius": [20, 100], "movement.smoothingFactor": [0.1, 1],
    "loot.searchRadius": [50, 1200], "loot.minRuneTier": [1, 33], "terror.targetFarmTier": [1, 9999], "terror.postClearWaitSec": [1, 15],
  };
  // 推層與重刷共用既有 mode，兩個開關互斥，舊設定無須人工轉換。
  const get = (path) => path === "terror.progressEnabled" ? settings.terror.mode === "progress" : path === "terror.farmEnabled" ? settings.terror.mode === "farm" : path.split(".").reduce((o, k) => o[k], settings);
  function put(path, value) {
    if (["terror.progressEnabled", "terror.farmEnabled"].includes(path)) {
      const mode = path === "terror.progressEnabled" ? "progress" : "farm";
      if (value) settings.terror.mode = mode;
      else if (settings.terror.mode === mode) settings.terror.mode = "off";
      return;
    }
    const keys = path.split("."), last = keys.pop(); keys.reduce((o, k) => o[k], settings)[last] = value;
  }
  function normalize() {
    for (const [path, [min, max]] of Object.entries(bounds)) {
      const n = get(path), fallback = path.split(".").reduce((o, k) => o[k], defaults);
      put(path, Math.min(max, Math.max(min, Number.isFinite(n) ? n : fallback)));
    }
    for (const path of ["loot.minRuneTier", "terror.targetFarmTier", "potion.fallbackHpSlot", "potion.fallbackMpSlot"]) put(path, Math.round(get(path)));
    if (!["off", "progress", "farm"].includes(settings.terror.mode)) settings.terror.mode = "off";
    if (!/^F(?:[1-9]|1[0-2])$/.test(settings.panicKey)) settings.panicKey = "F8";
    settings.version = 2;
  }
  normalize();
  const abort = new AbortController(), restores = [], blockedLoot = new WeakMap();
  let alive = true, game = null, lastStep = -Infinity, lastHp = -Infinity, lastMp = -Infinity;
  let manualUntil = 0, lootTarget = null, lootSince = 0, ownWalk = null, ownReach = null;
  let smooth = { x: 0, y: 0 }, stuck = null, stuckCount = 0, clearAt = 0, clearWorld = null, transition = false;
  let errors = 0, lastAction = "待命", hookNote = "正在定位遊戲模組", hookUrl = "", actionAt = 0;
  let retreat = null, protectedWorld = null;
  const finite = Number.isFinite, point = (p) => p && finite(p.x) && finite(p.y);
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y), live = (e) => point(e) && !e.dead;
  const unit = (x, y) => { const n = Math.hypot(x, y); return n > 0.001 ? { x: x / n, y: y / n } : { x: 0, y: 0 }; };
  function visible(el) { return !!el && !el.classList.contains("hidden") && getComputedStyle(el).display !== "none" && getComputedStyle(el).visibility !== "hidden"; }
  // 新版暫停選單可能繪於 Canvas；已取得實例時以 Game.state 為準。
  const paused = () => game ? game.state === "paused" : visible(document.getElementById("paused")) || document.body.classList.contains("frontend-over-run");
  function release() {
    if (game?.walkTarget === ownWalk) game.walkTarget = null;
    if (ownReach && game?.world?.reaching === ownReach) game.world.reaching = null;
    ownWalk = ownReach = lootTarget = stuck = null; stuckCount = 0;
    smooth = { x: 0, y: 0 };
  }
  function save() {
    normalize();
    try { localStorage.setItem(KEY, JSON.stringify(settings)); storageNote = ""; }
    catch { storageNote = "設定無法儲存，本次仍有效"; }
    refreshControls();
  }
  function stop(reason = "輔助已停止") { settings.enabled = false; release(); lastAction = reason; save(); }
  function manual(e) {
    if (!e.isTrusted || host.contains(e.target) || e.target === launcher || e.target === stopButton) return;
    manualUntil = performance.now() + 1200;
    release();
  }
  function keyPulse(code, key) {
    const target = document.activeElement || document.body, init = { key, code, bubbles: true, cancelable: true, composed: true };
    target.dispatchEvent(new KeyboardEvent("keydown", init));
    target.dispatchEvent(new KeyboardEvent("keyup", init));
  }
  function hudPool(id) {
    const el = document.getElementById(id);
    if (!el) return null;
    const text = [el.textContent, el.getAttribute("aria-label"), el.title].filter(Boolean).join(" ").replace(/,/g, "");
    const m = text.match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/);
    return m && +m[2] > 0 ? { now: +m[1], max: +m[2] } : null;
  }
  function readState(g) {
    const w = g?.world, p = w?.player;
    if (point(p) && finite(p.life) && finite(p.maxLife) && p.maxLife > 0) return {
      w, p, hp: { now: p.life, max: p.maxLife }, mp: finite(w.mana?.mana) && w.mana.max > 0 ? { now: w.mana.mana, max: w.mana.max } : null,
      enemies: Array.isArray(w.enemies) ? w.enemies.filter(live) : [], shots: Array.isArray(w.hostiles) ? w.hostiles.filter(live) : [], pickups: Array.isArray(w.pickups) ? w.pickups.filter(live) : [],
    };
    return { hp: hudPool("life-text"), mp: hudPool("mana-text"), enemies: [], shots: [], pickups: [] };
  }
  // 已確認敵方飛彈在 hostiles；projectiles 主要是玩家技能，不計入威脅。
  // 傷害採保守估計，未重現全部抗性、格擋、護盾與附加傷害。
  function threats(s) {
    let damage = 0, dodgeX = 0, dodgeY = 0;
    if (!s.p) return { damage, dodgeX, dodgeY };
    const p = s.p, horizon = settings.potion.lethalLookaheadSec, taken = Math.max(1, finite(p.damageTaken) ? p.damageTaken : 1);
    for (const shot of s.shots) {
      const vx = shot.vx || 0, vy = shot.vy || 0, v2 = vx * vx + vy * vy, dx = p.x - shot.x, dy = p.y - shot.y;
      const time = v2 > 0 ? Math.max(0, Math.min(1, (dx * vx + dy * vy) / v2)) : 0;
      if (finite(shot.life) && time > shot.life) continue;
      const x = shot.x + vx * time, y = shot.y + vy * time, radius = (shot.radius || 0) + (p.radius || 12), near = Math.hypot(p.x - x, p.y - y);
      const hitRadius = radius + 10, dot = dx * vx + dy * vy;
      const discriminant = dot * dot - v2 * (dx * dx + dy * dy - hitRadius * hitRadius);
      const enter = v2 > 0 && dot >= 0 && discriminant >= 0 ? Math.max(0, (dot - Math.sqrt(discriminant)) / v2) : Math.hypot(dx, dy) <= hitRadius ? 0 : Infinity;
      if (enter <= horizon && (!finite(shot.life) || enter <= shot.life)) damage += (Math.max(0, shot.damage || 0) + Math.max(0, shot.effect?.damage || 0)) * taken * Math.max(1, p.missileTaken || 1);
      if (near > radius + settings.movement.projectileSafetyRadius || dx * vx + dy * vy < 0) continue;
      let away = unit(p.x - x, p.y - y);
      if (!away.x && !away.y) away = unit(-vy, vx);
      const force = 4 / Math.max(0.15, time + 0.15);
      dodgeX += away.x * force; dodgeY += away.y * force;
    }
    for (const e of s.enemies) if (dist(e, p) <= (e.radius || 12) + (p.radius || 12) + 45) damage += Math.max(0, e.damage || 0) * taken;
    return { damage, dodgeX, dodgeY };
  }
  function drink(s, mp, now, lethal = false) {
    const columns = s.w?.belt?.columns;
    if (s.w?.terror?.affixes?.includes("nobelt")) { lastAction = "本層禁止使用藥帶"; return false; }
    if (Array.isArray(columns) && typeof game?.drinkFrom === "function") {
      // 此版沒有獨立藍水；回復活力藥水會同時補生命與魔力。
      const kinds = mp ? ["rejuvenation"] : lethal ? ["rejuvenation", "healing", "potion"] : ["healing", "potion", "rejuvenation"];
      let slot = -1;
      for (const kind of kinds) { slot = columns.findIndex((c) => c?.[0] === kind); if (slot >= 0) break; }
      if (slot < 0) { lastAction = mp ? "藥帶沒有回復活力藥水可補魔力" : "藥帶沒有生命藥水"; return false; }
      const count = columns[slot].length, kind = columns[slot][0];
      game.drinkFrom(slot);
      if (columns[slot].length >= count) return false;
      if (kind === "rejuvenation") { lastHp = now; lastMp = now; }
    } else {
      const slot = mp ? settings.potion.fallbackMpSlot : settings.potion.fallbackHpSlot;
      keyPulse("Digit" + slot, String(slot));
    }
    if (mp) lastMp = now; else lastHp = now;
    lastAction = mp ? "已使用補魔力藥水" : lethal ? "預估致命傷害，已喝水" : "已喝生命藥水";
    return true;
  }
  function potions(s, danger, now) {
    let healingFailed = false;
    const p = settings.potion, lethal = p.lethalProtection && danger.damage >= s.hp?.now && danger.damage > 0;
    if (s.hp?.now > 0 && s.hp.now < s.hp.max && now - lastHp >= p.hpCooldownMs && (p.autoHp && s.hp.now / s.hp.max * 100 <= p.hpThreshold || lethal)) {
      if (drink(s, false, now, lethal)) return false;
      healingFailed = true;
    }
    if (p.autoMp && s.mp?.now < s.mp?.max && s.mp.now / s.mp.max * 100 <= p.mpThreshold && now - lastMp >= p.mpCooldownMs) drink(s, true, now);
    return healingFailed;
  }
  function healingAvailable(s, now) {
    if (s.hp?.now >= s.hp?.max || now - lastHp < settings.potion.hpCooldownMs || s.w?.terror?.affixes?.includes("nobelt")) return false;
    const columns = s.w?.belt?.columns;
    return typeof game?.drinkFrom === "function" && Array.isArray(columns) && columns.some((c) => ["potion", "healing", "rejuvenation"].includes(c?.[0]));
  }
  function surrounded(s, danger) {
    if (!s.p || danger.damage <= 0) return false;
    const p = s.p, radius = p.radius || 12;
    const near = s.enemies.filter((e) => dist(e, p) <= radius + (e.radius || 12) + 60);
    if (near.length < 3) return false;
    // 只取樣局部通道；不改座標，也不宣稱完成全圖路徑搜尋。
    const reach = Math.max(60, Math.min(120, (p.speed || 150) * 0.5));
    for (let i = 0; i < 16; i++) {
      const angle = i * Math.PI / 8, dx = Math.cos(angle) * reach / 16, dy = Math.sin(angle) * reach / 16;
      let x = p.x, y = p.y, clear = true;
      for (let j = 0; j < 16; j++) {
        const next = typeof s.w.walls?.slide === "function" ? s.w.walls.slide(x, y, dx, dy) : { x: x + dx, y: y + dy };
        if (!point(next) || Math.hypot(next.x - x, next.y - y) < Math.hypot(dx, dy) * 0.5 || near.some((e) => dist(next, e) < radius + (e.radius || 12) + 5)) { clear = false; break; }
        x = next.x; y = next.y;
      }
      if (clear) return false;
    }
    return true;
  }
  function deathReason(s, danger, now, healingFailed = false) {
    if (!settings.deathProtection.enabled || !s.p || !s.hp || s.hp.now <= 0 || s.w === protectedWorld) return "";
    if (danger.damage > 0 && danger.damage >= s.hp.now && (healingFailed || !healingAvailable(s, now))) return "預估致命傷害且無可用回血藥水";
    if (s.hp.now / s.hp.max * 100 <= settings.deathProtection.emergencyHpPercent && now - lastHp < settings.potion.hpCooldownMs) return "生命低於緊急門檻且回血藥水冷卻中";
    if (surrounded(s, danger)) return "周圍通道皆受阻，預估無法閃避包圍";
    return "";
  }
  function retreatFailed(message) {
    const g = retreat?.g;
    retreat = null; stop("死亡保護離場未確認：" + message);
    try { if (g?.state === "playing") g.pause?.(); } catch { /* 保留停機狀態與錯誤訊息。 */ }
  }
  function checkRetreat(now) {
    if (!retreat) return;
    const g = retreat.g;
    if (["camp", "town", "select"].includes(g.state)) {
      lastAction = g.state === "select" ? "死亡保護：已離開本局至角色選單（此模式未進入村莊）" : "死亡保護：已離開戰鬥回到村莊";
      retreat = null;
    } else if (now >= retreat.deadline) retreatFailed("原版未在 8 秒內回到安全畫面，已停止自動化");
  }
  async function returnToSafety(g, s, reason, now) {
    if (retreat || !alive) return;
    protectedWorld = s.w;
    retreat = { g, deadline: now + 8000 };
    release();
    settings.terror.mode = "off"; settings.quest.autoProgress = false;
    if (settings.deathProtection.disableAutomation) settings.enabled = false;
    lastAction = "死亡保護：" + reason + "，正在離開本局"; save();
    try {
      // 原版已確認的暫停選單出口：leaveRun -> toMenu -> enterCamp（營地模式）。
      if (g.state === "playing" && typeof g.pause === "function") g.pause();
      if (g.state === "paused" && typeof g.leaveRun === "function") {
        await g.leaveRun();
      } else {
        // 相容舊版 DOM 選單；Canvas 選單無內部函式時無法可靠代按。
        if (g.state === "playing") keyPulse("Escape", "Escape");
        let clicked = false;
        for (let attempt = 0; attempt < 2 && alive && retreat; attempt++) {
          const menus = document.querySelectorAll("#paused,#pause-menu,[data-pause-menu]");
          const button = [...menus].filter(visible).flatMap((menu) => [...menu.querySelectorAll("button")]).find((el) => visible(el) && /^(?:SAVE AND EXIT(?: GAME)?|EXIT ANYWAY|LEAVE(?: RUN)?|RETURN TO TOWN|放棄(?:本局)?|離開(?:本局|戰鬥)?|回到村莊|儲存並離開)$/i.test(el.textContent.trim()));
          if (!button) break;
          button.click(); clicked = true;
          await new Promise((resolve) => setTimeout(resolve, 0));
          if (["camp", "town", "select", "loading"].includes(g.state)) break;
        }
        if (!clicked) throw new Error("找不到原版 leaveRun 或可辨識的暫停離開按鈕");
      }
      if (alive) checkRetreat(performance.now());
    } catch (err) { if (alive && retreat) retreatFailed(String(err.message || err)); }
  }

  function accepts(drop) {
    const item = drop.item;
    if (!item) return drop.kind === "gold" && settings.loot.pickupGold;
    if (item.type === "quest") return settings.quest.autoProgress;
    if (item.type === "rune") { const n = String(item.base).match(/^r(\d{2})$/); return !!n && +n[1] >= settings.loot.minRuneTier; }
    return !!settings.loot.qualityThreshold[item.rarity];
  }
  function lootGoal(s, now) {
    if (!settings.loot.enabled && !settings.quest.autoProgress) return null;
    if (lootTarget && !lootTarget.dead && now - lootSince > 3500) { blockedLoot.set(lootTarget, now + 15000); lootTarget = null; }
    const candidates = s.pickups.filter((e) => !e.flippy && !e.discarded && e.loot !== "sell" && (blockedLoot.get(e) || 0) < now && (settings.loot.enabled || e.item?.type === "quest") && accepts(e) && dist(e, s.p) <= settings.loot.searchRadius);
    const weight = (e) => e.item?.type === "quest" ? 2000 : ["unique", "set", "runeword"].includes(e.item?.rarity) ? 1000 : e.item ? 500 : 50;
    candidates.sort((a, b) => weight(b) - weight(a) || dist(a, s.p) - dist(b, s.p));
    const target = candidates[0];
    if (!target) { lootTarget = null; return null; }
    if (lootTarget !== target) { lootTarget = target; lootSince = now; }
    return { x: target.x, y: target.y, kind: "loot", target };
  }
  function battleGoal(e, p, kind = "戰鬥") {
    const u = unit(p.x - e.x, p.y - e.y), distance = settings.movement.kiteDistance;
    return { x: e.x + (u.x || 1) * distance, y: e.y + u.y * distance, kind };
  }
  function questGoal(s) {
    const g = game, search = g.search, cage = search?.gibbetSpot;
    // 由原版碰觸機制完成石陣、牢籠與對話；不呼叫 complete() 或更改任務紀錄。
    if (point(cage)) return { ...cage, kind: "任務牢籠" };
    const stones = search?.stones?.logic;
    if (Array.isArray(stones?.spots) && !stones.done) {
      const i = Array.isArray(stones.lit) ? stones.lit.findIndex((x) => !x) : -1;
      if (i >= 0 && point(stones.spots[i])) return { ...stones.spots[i], kind: "任務石陣" };
    }
    if (point(search?.portalSpot)) return { x: search.portalSpot.x, y: search.portalSpot.y, kind: "任務傳送門" };
    const tyrael = g.clearing?.tyrael;
    if (point(tyrael) && !tyrael.spoke) return { x: tyrael.x, y: tyrael.y, kind: "任務對話" };
    if (settings.quest.prioritizeBoss) {
      const e = s.enemies.find((e) => e.rank === "actBoss") || s.enemies.find((e) => e.name);
      if (e) return battleGoal(e, s.p, "任務敵人");
    }
    return null;
  }
  function navigate(s, danger, now) {
    const g = game, m = settings.movement, progressing = settings.quest.autoProgress || settings.terror.mode !== "off", portal = g.clearing?.portal;
    if (point(portal) && clearWorld !== s.w) { clearWorld = s.w; clearAt = now; }
    let closeEnemy = false, x = 0, y = 0;
    if (m.enabled) for (const e of s.enemies) {
      const d = dist(s.p, e), range = m.kiteDistance + (e.radius || 0);
      if (d >= range) continue;
      closeEnemy = true;
      const u = unit(s.p.x - e.x, s.p.y - e.y), force = Math.min(8, (range - d) / Math.max(15, d));
      x += (u.x || (d < 1 ? 1 : 0)) * force; y += u.y * force;
    }
    const dodging = m.enabled && m.dodgeProjectiles && Math.hypot(danger.dodgeX, danger.dodgeY) > 0;
    if (dodging) { x += danger.dodgeX; y += danger.dodgeY; }
    const portalDue = progressing && point(portal) && (!settings.loot.backtrackForLoot || now - clearAt >= settings.terror.postClearWaitSec * 1000);
    let goal = !dodging && !closeEnemy && danger.damage < s.hp.now && !portalDue ? lootGoal(s, now) : null;
    if (!goal && settings.quest.autoProgress && !portalDue) goal = questGoal(s);
    if (!goal && portalDue) goal = { x: portal.x, y: portal.y, kind: "通關傳送門" };
    if (!goal && progressing && !portal) {
      const enemy = s.enemies.reduce((best, e) => !best || dist(e, s.p) < dist(best, s.p) ? e : best, null);
      if (enemy) goal = battleGoal(enemy, s.p);
      else {
        // 讓原版導演持續生成敵人的巡航啟發式；不是完整迷霧探索器。
        const angle = s.w.time / 5;
        goal = { x: s.p.x + Math.cos(angle) * 160, y: s.p.y + Math.sin(angle) * 100, kind: "巡航" };
      }
    }
    if (goal && !dodging && !closeEnemy && dist(goal, s.p) > 5) { const u = unit(goal.x - s.p.x, goal.y - s.p.y); x += u.x; y += u.y; }
    let u = unit(x, y);
    if (!u.x && !u.y) { release(); return; }
    const mix = dodging ? 1 : m.smoothingFactor;
    u = unit(smooth.x * (1 - mix) + u.x * mix, smooth.y * (1 - mix) + u.y * mix); smooth = u;
    // 使用原版 walkTarget -> walls.route/slide，不直接改座標或穿牆。
    const target = goal && !dodging && !closeEnemy ? { x: goal.x, y: goal.y } : { x: s.p.x + u.x * 100, y: s.p.y + u.y * 100 };
    if (typeof s.w.walls?.nearestOpen === "function") Object.assign(target, s.w.walls.nearestOpen(target.x, target.y));
    if (!point(target)) { release(); return; }
    if (ownReach && s.w.reaching === ownReach) s.w.reaching = null;
    ownReach = goal?.kind === "loot" && !dodging && !closeEnemy ? goal.target : null;
    if (ownReach) s.w.reaching = ownReach;
    ownWalk = target; g.walkTarget = target;
    lastAction = dodging ? "閃避敵方飛彈" : closeEnemy ? "保持敵人距離" : goal?.kind === "loot" ? "前往拾取符合條件的物品" : "前往" + (goal?.kind || "安全位置");
    if (!stuck) stuck = { x: s.p.x, y: s.p.y, at: now };
    if (now - stuck.at >= 2500) {
      stuckCount = dist(stuck, s.p) < 20 ? stuckCount + 1 : 0;
      if (stuckCount >= 3) { stop("連續卡住，已停止輔助"); g.pause?.(); return; }
      if (stuckCount) {
        if (lootTarget) blockedLoot.set(lootTarget, now + 15000);
        lootTarget = null;
        ownWalk = { x: s.p.x - u.y * 120, y: s.p.y + u.x * 120 }; g.walkTarget = ownWalk;
      }
      stuck = { x: s.p.x, y: s.p.y, at: now };
    }
  }
  async function advance(g) {
    if (transition || retreat || !alive || !settings.enabled || settings.terror.mode === "off") return;
    const t = settings.terror, record = g.save?.terror?.[g.kit?.id];
    if (!record || !g.kit || typeof g.startTerror !== "function") return;
    transition = true;
    try {
      if (t.mode === "farm") {
        if (t.targetFarmTier > (record.cleared ?? 0) || typeof g.startReplay !== "function") { stop("固定層數尚未通關，無法重刷"); return; }
        g.tierDone = null;
        lastAction = "重刷恐怖 " + t.targetFarmTier + " 層";
        await g.startReplay(g.kit, t.targetFarmTier);
      } else {
        if (!Array.isArray(record.offers) || !record.offers.length) return;
        const offer = record.offers.findIndex((e) => !e.affixes?.includes("nobelt"));
        g.tierDone = null;
        lastAction = "推進恐怖 " + record.open + " 層";
        await g.startTerror(g.kit, Math.max(0, offer));
      }
    } catch (err) { stop("切換關卡失敗：" + String(err.message || err)); }
    finally { transition = false; }
  }
  function progression(g, now) {
    if (settings.terror.mode === "off") return false;
    const record = g.save?.terror?.[g.kit?.id];
    if (["camp", "select"].includes(g.state) && !g.swapping && record && g.save?.heroes?.[g.kit?.id]?.kept && record.playing === undefined && !record.replay) {
      void advance(g); return true;
    }
    if (!g.world?.terror || g.state !== "dead") return false;
    const won = !!g.tierDone;
    if (!won && !settings.terror.autoReviveOrRestart) { stop("角色陣亡，輔助已停止"); return true; }
    if (!won && (!g.runOver || g.deathTime === null || g.deathTime < 3)) return true;
    if (!won && !g.save?.heroes?.[g.kit?.id]?.kept) { stop("沒有可重試的角色"); return true; }
    if (clearWorld !== g.world) { clearWorld = g.world; clearAt = now; }
    if (now - clearAt >= settings.terror.postClearWaitSec * 1000) void advance(g);
    return true;
  }
  function blocked() { return !settings.enabled || document.hidden || !panel.hidden || window.__d2editIsOpen?.() || performance.now() < manualUntil || paused(); }
  function step(g, now) {
    checkRetreat(now);
    if (retreat || blocked()) { release(); return; }
    if (g && progression(g, now)) { release(); return; }
    if (g && g.state !== "playing") {
      release();
      if (settings.quest.autoProgress && g.state === "dead" && g.afterBaal?.next && typeof g.afterBaal.continue === "function" && now - actionAt > 1500) {
        g.afterBaal.continue(); actionAt = now; return;
      }
      // 推進時才自動選卡，優先進化；不操作商店、賭博或任務獎勵。
      if ((settings.quest.autoProgress || settings.terror.mode !== "off") && visible(document.getElementById("level-up")) && now - actionAt > 800) {
        const cards = [...document.querySelectorAll("#choices button")].filter(visible);
        (cards.find((e) => e.classList.contains("evolves")) || cards[0])?.click(); actionAt = now;
      }
      return;
    }
    if (!g && (document.body.classList.contains("no-run") || document.body.classList.contains("frontend-open") || ["level-up", "game-over", "town", "character", "waypoint"].some((id) => visible(document.getElementById(id))))) return;
    const state = readState(g);
    if (!state.hp || state.hp.now <= 0) { release(); return; }
    let danger = threats(state);
    let reason = g && deathReason(state, danger, now);
    if (reason) { void returnToSafety(g, state, reason, now); return; }
    const healingFailed = potions(state, danger, now);
    // 喝水後重新讀取生命，避免使用舊血量判斷離場。
    const after = readState(g);
    danger = threats(after);
    reason = g && deathReason(after, danger, now, healingFailed);
    if (reason) { void returnToSafety(g, after, reason, now); return; }
    if (g && state.p) { if (g.hud?.skillsOpen || g.hud?.questLogOpen) release(); else navigate(after, danger, now); }
  }
  function guarded(g, now) {
    if (!alive || now - lastStep < 50) return;
    lastStep = now;
    try { step(g, now); errors = 0; }
    catch (err) { release(); if (++errors >= 3) stop("連續執行錯誤，已停機：" + String(err.message || err)); }
  }
  function wrap(object, name, factory) {
    const original = object[name], wrapped = factory(original); object[name] = wrapped;
    restores.push(() => { if (object[name] === wrapped) object[name] = original; });
  }
  async function connect() {
    const base = new URL("/assets/", location.origin);
    const urls = [...performance.getEntriesByType("resource").map((e) => e.name), ...document.querySelectorAll("script[src],link[rel=modulepreload]")].map((e) => typeof e === "string" ? e : e.src || e.href);
    const queue = urls.filter((u) => u?.startsWith(base.href) && /\/(?:Game|game)-[\w-]+\.js(?:\?.*)?$/.test(u)).sort((a, b) => Number(/\/Game-/.test(b)) - Number(/\/Game-/.test(a))), seen = new Set();
    // 正規式定位壓縮後的類別，不依賴固定雜湊檔名或壓縮變數名。
    const signatures = [/export\s*\{[^}]*\b[\w$]+\s+as\s+Game\b[^}]*\}/, /tick\(\w+\)\{if\(!this\.world\)return;/, /drinkFrom\(\w+\)\{let\s+\w+=this\.world\?\.belt/, /player:\w+,enemies:\[\],projectiles:\[\]/];
    while (queue.length && seen.size < 12 && alive) {
      const url = queue.shift(); if (seen.has(url)) continue; seen.add(url);
      const response = await fetch(url, { signal: abort.signal }); if (!response.ok) continue;
      const source = await response.text();
      if (!signatures.every((re) => re.test(source))) { for (const m of source.matchAll(/["'`]\.\/(Game-[\w-]+\.js)["'`]/g)) queue.push(new URL(m[1], url).href); continue; }
      // 精確沿用頁面模組 URL，讓瀏覽器回傳原模組實例；不加查詢字串、不執行修改版副本。
      const module = await import(url); if (!alive) return;
      const proto = module.Game?.prototype;
      if (typeof proto?.tick !== "function" || typeof proto.drinkFrom !== "function" || typeof proto.steer !== "function") continue;
      wrap(proto, "tick", (original) => function (...args) { if (alive) { game = this; guarded(this, performance.now()); } return Reflect.apply(original, this, args); });
      // 原版 steer 會為拾取目標重建 walkTarget，記住該參照才能在停止時完全放手。
      wrap(proto, "steer", (original) => function (...args) { const result = Reflect.apply(original, this, args); if (alive && this === game && ownReach && this.world?.reaching === ownReach) ownWalk = this.walkTarget; return result; });
      hookUrl = url; hookNote = "已掛接原版 Game，等待下一幀"; return;
    }
    hookNote = "簽名不相容：僅使用 HUD／藥水按鍵；走位、撿物與推進停用";
  }
  const launcher = document.createElement("button"), stopButton = document.createElement("button"), host = document.createElement("div");
  launcher.type = stopButton.type = "button"; launcher.id = "d2autobot-launcher"; launcher.textContent = "輔助";
  launcher.style.cssText = "position:fixed;top:max(12px,env(safe-area-inset-top));left:max(12px,env(safe-area-inset-left));z-index:2147483645;display:none;padding:8px 14px;min-height:44px;border:1px solid #d4a84a;border-radius:6px;background:rgba(20,17,13,.95);color:#d4a84a;font:bold 15px system-ui;cursor:pointer";
  stopButton.textContent = "停止輔助";
  stopButton.style.cssText = "position:fixed;top:max(12px,env(safe-area-inset-top));left:50%;transform:translateX(-50%);z-index:2147483645;min-height:44px;background:#531b15;color:#fff;border:1px solid #d4a84a;border-radius:6px;padding:6px 12px;display:none";
  host.id = "d2autobot-panel"; host.style.cssText = "position:fixed;inset:0;z-index:2147483647;pointer-events:none";
  const root = host.attachShadow({ mode: "open" });
  root.innerHTML = `<style>
    :host{font:15px/1.5 'Microsoft JhengHei',system-ui,sans-serif;color:#f2e5c6}*{box-sizing:border-box}[hidden]{display:none!important}
    .backdrop{position:fixed;inset:0;background:#000a;display:grid;place-items:center;pointer-events:auto;padding:12px}
    .box{width:min(760px,100%);max-height:88dvh;overflow:auto;background:#18140f;border:1px solid #d4a84a;border-radius:10px;padding:20px;color:#f2e5c6}
    h2{margin:0;color:#d4a84a}h3{color:#d4a84a;margin:20px 0 8px}p{margin:8px 0}.head{display:flex;justify-content:space-between;align-items:center;gap:12px}
    label{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:44px;border-bottom:1px solid #fff1;padding:5px 0}
    button,input,select{font:inherit;min-height:44px}button,select,input[type=number]{background:#2a231a;color:#fff0cb;border:1px solid #9c7e41;border-radius:5px;padding:5px 10px}
    .toggle{min-width:112px;font-weight:bold;display:inline-flex;align-items:center;justify-content:center;gap:10px}.toggle::before{content:"";width:16px;height:16px;border-radius:50%;background:#b0a49c}.toggle[aria-checked=true]{background:#245436;border-color:#7bd89a;color:#effff3}.toggle[aria-checked=true]::before{background:#8affaf}.toggle[aria-checked=false]{background:#452b29;border-color:#b99188;color:#ffe9e4}.toggle:focus-visible{outline:3px solid #f8d87d;outline-offset:3px}input[type=number]{width:110px}button{cursor:pointer}.tabs{display:flex;gap:8px;margin:12px 0 0;border-bottom:1px solid #9c7e41}.tabs button{border-radius:5px 5px 0 0;border-bottom:0}.tabs button[aria-selected=true]{background:#d4a84a;color:#18140f;font-weight:bold}.note{font-size:13px;color:#cabd9d}.status{white-space:pre-line;padding:10px;background:#0005;border-radius:5px}
    @media(max-width:600px){.backdrop{padding:0}.box{width:100%;max-height:100dvh;height:100dvh;border-radius:0;padding:16px;padding-top:max(16px,env(safe-area-inset-top));padding-bottom:max(16px,env(safe-area-inset-bottom))}}
  </style><div class="backdrop" hidden><section class="box" role="dialog" aria-modal="true" aria-label="遊戲輔助設定"><div class="head"><h2>遊戲輔助工具</h2><button type="button" id="close">關閉</button></div><p class="status" role="status"></p><div class="tabs" role="tablist"><button type="button" role="tab" data-tab="assist" aria-selected="true">戰鬥輔助</button><button type="button" role="tab" data-tab="progress" aria-selected="false">推層與任務</button></div><div id="fields"><div data-pane="assist" role="tabpanel"></div><div data-pane="progress" role="tabpanel" hidden></div></div><p class="note">手動操作會暫讓控制權；背景分頁、設定面板、修改器及遊戲暫停時停止動作。熱鍵可切換總開關，手機可點上方「停止輔助」。</p><p class="note">死亡保護預設關閉；觸發時一律關閉推層、重刷與任務推進，須自行重新開啟。沿用原版離場結算，可能損失本局進度；無營地模式時可能回到角色選單。致命傷害與包圍判定為啟發式，不保證生存。任務輔助追蹤已生成的物品、石陣、牢籠、敵人與通關門；特定配點、營地交付及隱藏條件仍需手動處理。</p><p class="note">品質過濾控制自動追蹤目標；路過物品仍可能由原版自動撿起。無法掛接時，僅在 HUD 可讀的情況下按指定藥帶鍵，不從 Canvas 猜測敵人位置。</p><button type="button" id="stop">立即停止輔助</button></section></div>`;
  const panel = root.querySelector(".backdrop"), status = root.querySelector(".status"), controls = new Map();
  const panes = Object.fromEntries([...root.querySelectorAll("[data-pane]")].map((el) => [el.dataset.pane, el]));
  let fields = panes.assist;
  function tab(name) { fields = panes[name]; }
  function showTab(name) { for (const [k, el] of Object.entries(panes)) el.hidden = k !== name; for (const b of root.querySelectorAll("[data-tab]")) b.setAttribute("aria-selected", String(b.dataset.tab === name)); }
  for (const b of root.querySelectorAll("[data-tab]")) b.onclick = () => showTab(b.dataset.tab);
  function field(path, label, choices) {
    const row = document.createElement("label"), text = document.createElement("span"); text.textContent = label;
    const toggle = !choices && typeof get(path) === "boolean";
    const input = document.createElement(toggle ? "button" : choices ? "select" : "input");
    input.dataset.setting = path; input.id = "setting-" + path.replaceAll(".", "-"); text.id = input.id + "-label";
    input.setAttribute("aria-labelledby", text.id); row.htmlFor = input.id;
    if (toggle) {
      input.type = "button"; input.className = "toggle"; input.setAttribute("role", "switch");
      input.addEventListener("click", () => { put(path, !get(path)); release(); save(); });
    } else {
      if (choices) for (const [value, label] of choices) { const option = document.createElement("option"); option.value = value; option.textContent = label; input.append(option); }
      else { input.type = "number"; const [min, max] = bounds[path]; input.min = min; input.max = max; input.step = path.endsWith("Sec") || path.endsWith("Factor") ? "0.1" : "1"; }
      input.addEventListener("change", () => { put(path, input.type === "number" ? Number(input.value) : input.value); release(); save(); });
    }
    row.append(text, input); fields.append(row); controls.set(path, input);
  }
  function group(label) { const h = document.createElement("h3"); h.textContent = label; fields.append(h); }
  group("一般與安全"); field("enabled", "啟用輔助總開關"); field("panicKey", "總開關熱鍵", Array.from({ length: 12 }, (_, i) => ["F" + (i + 1), "F" + (i + 1)]));
  group("生命與藥水");
  for (const [path, label] of [["autoHp", "自動喝生命藥水"], ["hpThreshold", "生命門檻（％）"], ["lethalProtection", "一擊必殺預判喝水"], ["lethalLookaheadSec", "預測提前秒數"], ["hpCooldownMs", "生命藥水冷卻（毫秒）"], ["autoMp", "自動補魔力（消耗回復活力藥水）"], ["mpThreshold", "魔力門檻（％）"], ["mpCooldownMs", "魔力藥水冷卻（毫秒）"], ["fallbackHpSlot", "降級模式生命藥帶欄（1～4）"], ["fallbackMpSlot", "降級模式魔力藥帶欄（1～4）"]]) field("potion." + path, label);
  group("走位與閃避");
  for (const [path, label] of [["enabled", "自動走位（保持距離與閃避）"], ["kiteDistance", "敵人安全距離"], ["dodgeProjectiles", "閃避敵方飛彈"], ["projectileSafetyRadius", "飛彈安全邊距"], ["smoothingFactor", "轉向平滑係數"]]) field("movement." + path, label);
  group("撿寶過濾"); field("loot.enabled", "自動撿裝備"); field("loot.searchRadius", "物品搜尋距離"); field("loot.pickupGold", "追蹤金幣"); field("loot.minRuneTier", "最低符文編號");
  for (const [quality, label] of [["normal", "普通"], ["magic", "魔法"], ["rare", "稀有"], ["set", "套裝"], ["unique", "暗金"], ["runeword", "符文之語"]]) field("loot.qualityThreshold." + quality, "撿取" + label);
  field("loot.backtrackForLoot", "通關後等待撿裝");
  tab("progress"); group("恐怖層數"); field("terror.progressEnabled", "自動推恐怖層數"); field("terror.farmEnabled", "固定層數重刷（與推層互斥）"); field("terror.targetFarmTier", "重刷層數（須已通關）"); field("terror.postClearWaitSec", "通關等待（秒）"); field("terror.autoReviveOrRestart", "陣亡後重試（有保留角色時）");
  group("任務進程"); field("quest.autoProgress", "自動推任務（追蹤目標與選擇升級卡）"); field("quest.prioritizeBoss", "優先接近任務頭目");
  tab("assist"); group("死亡保護"); field("deathProtection.enabled", "死亡保護（緊急離開本局）"); field("deathProtection.emergencyHpPercent", "緊急生命門檻（％）"); field("deathProtection.disableAutomation", "觸發後關閉輔助總開關");
  function refreshControls() {
    for (const [path, input] of controls) {
      if (input.getAttribute("role") === "switch") { input.setAttribute("aria-checked", String(get(path))); input.textContent = get(path) ? "開啟" : "關閉"; }
      else input.value = String(get(path));
    }
  }
  function closePanel() { panel.hidden = true; if (launcher.style.display !== "none") launcher.focus(); }
  launcher.onclick = () => { if (!paused()) return; release(); panel.hidden = false; refreshControls(); root.getElementById("close").focus(); };
  root.getElementById("close").onclick = closePanel; root.getElementById("stop").onclick = stopButton.onclick = () => stop();
  for (const el of [host, launcher, stopButton]) for (const name of ["pointerdown", "pointerup", "mousedown", "mouseup", "touchstart", "touchend", "keydown", "keyup", "click", "wheel"]) el.addEventListener(name, (e) => e.stopPropagation(), { signal: abort.signal });
  root.addEventListener("keydown", (e) => {
    if (e.code === "Escape") { e.preventDefault(); closePanel(); }
    if (e.key === "Tab") { const list = [...panel.querySelectorAll("button,input,select")], first = list[0], last = list.at(-1); if (e.shiftKey && root.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && root.activeElement === last) { e.preventDefault(); first.focus(); } }
  });
  document.body.append(launcher, stopButton, host); save();
  window.addEventListener("keydown", (e) => {
    if (e.code === settings.panicKey && !e.repeat && !e.ctrlKey && !e.altKey && !e.metaKey) { e.preventDefault(); e.stopImmediatePropagation(); if (settings.enabled) stop(); else { settings.enabled = true; lastAction = "輔助已啟用"; save(); } return; }
    manual(e);
  }, { capture: true, signal: abort.signal });
  window.addEventListener("pointerdown", manual, { capture: true, signal: abort.signal }); window.addEventListener("blur", release, { signal: abort.signal }); document.addEventListener("visibilitychange", release, { signal: abort.signal });
  const timer = setInterval(() => {
    if (!alive) return;
    checkRetreat(performance.now());
    const editorOpen = !!window.__d2editIsOpen?.(), isPaused = paused();
    launcher.style.display = isPaused && !editorOpen && panel.hidden ? "block" : "none";
    stopButton.style.display = settings.enabled && !isPaused && !editorOpen && panel.hidden ? "block" : "none";
    if (!isPaused || editorOpen) panel.hidden = true;
    if (!game) guarded(null, performance.now());
    const s = readState(game);
    status.textContent = [settings.enabled ? "輔助：啟用" : "輔助：關閉", game ? "掛鉤：原版 Game／" + game.state : hookNote, s.hp ? `生命：${Math.ceil(s.hp.now)}／${Math.ceil(s.hp.max)}` : "生命：無法讀取", s.mp ? `魔力：${Math.ceil(s.mp.now)}／${Math.ceil(s.mp.max)}` : "魔力：未啟用或無法讀取", game?.world?.terror ? "恐怖層數：" + game.world.terror.tier : "", "最近動作：" + lastAction, storageNote].filter(Boolean).join("\n");
  }, 200);
  const api = {
    destroy() { if (!alive) return; alive = false; release(); abort.abort(); clearInterval(timer); for (const restore of restores.reverse()) restore(); launcher.remove(); stopButton.remove(); host.remove(); if (window.__d2autobot === api) delete window.__d2autobot; }, stop,
    diagnostics: () => ({ hookUrl, hookNote, connected: !!game, state: game?.state ?? null, lastAction, storageNote }),
  };
  window.__d2autobot = api;
  connect().catch((err) => { if (alive) hookNote = "掛鉤無法載入，使用 HUD／按鍵降級：" + String(err.message || err); });
})();
