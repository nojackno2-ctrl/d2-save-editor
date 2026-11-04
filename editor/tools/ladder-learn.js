// 從 d2survivors 排行榜 API 學習各職業地獄榜高手的技能、變體、被動、配點與常用暗金。
const fs = require("fs"), path = require("path");
const out = process.argv[2], cache = process.argv[3];
const CLASSES = ["amazon", "assassin", "barbarian", "druid", "necromancer", "paladin", "sorceress"], TOP = 50;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function get(url) {
  const file = path.join(cache, url.replace(/[^\w]+/g, "_") + ".json");
  if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, "utf8"));
  for (let i = 0; i < 4; i++) {
    const res = await fetch(url, { headers: { "user-agent": "d2autobot-ladder-study" } });
    if (res.ok) { const json = await res.json(); fs.writeFileSync(file, JSON.stringify(json)); await sleep(250); return json; }
    await sleep(1000 * 2 ** i);
  }
  throw new Error("fetch failed " + url);
}
(async () => {
  fs.mkdirSync(cache, { recursive: true });
  // 依使用者要求：同一個玩家只算一次，以他最高的恐懼層紀錄為主。從最高層往下掃各層榜（/boards/tier-N），
  // 每位玩家取第一次出現（最高層）的那筆；每職業收滿 TOP 位不同玩家為止，恐懼層不足 20 位再用地獄榜補（同樣依玩家去重）。
  const tiers = (await get("https://d2survivors.lol/api/leaderboard/tiers")).tiers.filter((t) => t.runs > 0).map((t) => t.tier).sort((a, b) => b - a);
  const picked = Object.fromEntries(CLASSES.map((c) => [c, new Map()]));
  for (const tier of tiers) {
    if (CLASSES.every((c) => picked[c].size >= TOP)) break;
    const board = await get(`https://d2survivors.lol/api/leaderboard/boards/tier-${tier}?limit=100`);
    for (const row of board.rows || []) { const m = picked[row.class]; if (m && m.size < TOP && row.player && !m.has(row.player)) m.set(row.player, { id: row.id, tier }); }
  }
  for (const cls of CLASSES) if (picked[cls].size < 20) {
    const board = await get(`https://d2survivors.lol/api/leaderboard/boards/hell?class=${cls}&limit=100`);
    for (const row of board.rows || []) if (picked[cls].size < TOP && row.player && !picked[cls].has(row.player)) picked[cls].set(row.player, { id: row.id, tier: "hell" });
  }
  const result = { source: "d2survivors.lol/api/leaderboard（各職業前 " + TOP + " 位不同玩家，每人取最高恐懼層紀錄；不足 20 位以地獄榜補）", generatedAt: new Date().toISOString().slice(0, 10), classes: {} };
  for (const cls of CLASSES) {
    const runs = [];
    for (const { id } of picked[cls].values()) { try { runs.push(await get(`https://d2survivors.lol/api/leaderboard/runs/${id}`)); } catch (e) { console.error(e.message); } }
    const names = {}, skills = {}, mods = {}, passives = {}, attr = { strength: 0, dexterity: 0, vitality: 0, energy: 0 }, gear = {};
    for (const run of runs) {
      const h = run.hero; if (!h) continue;
      // 技能分數：出現率＋等級權重；等級越高代表高手把卡片投在這裡。
      for (const s of h.skills || []) { names[s.id] = s.name; skills[s.id] = (skills[s.id] || 0) + 1 + (s.level || 1) / 8; if (s.mod) { mods[s.id] ??= {}; mods[s.id][s.mod] = (mods[s.id][s.mod] || 0) + 1; } }
      for (const p of h.passives || []) names[p.id] = p.name, passives[p.id] = (passives[p.id] || 0) + 1 + (p.level || 1) / 5;
      const spent = h.points?.spent || {}, total = Object.values(spent).reduce((a, b) => a + (b || 0), 0);
      if (total > 0) for (const k of Object.keys(attr)) attr[k] += (spent[k] || 0) / total;
      for (const g of h.gear || []) if (g.item?.r === "u" || g.item?.r === "s") { gear[g.slot] ??= {}; gear[g.slot][g.item.n] = (gear[g.slot][g.item.n] || 0) + 1; }
    }
    const n = runs.length || 1, rank = (o, k = 40) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, k).map(([id, v]) => [id, names[id] || id, Math.round(v / n * 100) / 100]); // 輔助器格式：[技能 ID, 名稱, 權重]
    result.classes[cls] = {
      runs: runs.length, players: picked[cls].size, tiers: [...picked[cls].values()].map((x) => x.tier).slice(0, 5),
      skills: rank(skills),
      mods: Object.fromEntries(Object.entries(mods).map(([id, o]) => [id, Object.entries(o).sort((a, b) => b[1] - a[1])[0][0]])),
      passives: rank(passives),
      attributes: Object.fromEntries(Object.entries(attr).map(([k, v]) => [k, Math.round(v / n * 100) / 100])),
      gear: Object.fromEntries(Object.entries(gear).map(([slot, o]) => [slot, rank(o, 3).map(([name]) => name)])),
    };
    console.log(cls, runs.length, JSON.stringify(result.classes[cls].attributes), result.classes[cls].skills.slice(0, 5).map((x) => x[0]).join(","));
  }
  fs.writeFileSync(out, JSON.stringify(result));
})().catch((e) => { console.error(e); process.exit(1); });
