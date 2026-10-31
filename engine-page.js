// 在隱藏視窗裡執行，G 是遊戲模組（engine.js 加上的 __ 前綴匯出）
const ILVL = 99;
const SEED_TRIES = 4000;      // 每件物品最多試幾個種子找「全部最高」的合法 roll
const SEED_MAX_SPACE = 20000; // 可能組合太多時就不找了，直接用最高值

export function boot(G, itemstatsText) {
  const stats = JSON.parse(itemstatsText);
  G.__setData(stats);
  const defs = {
    unique: new Map(G.__uniques.map((d) => [d.name, d])),
    set: new Map(G.__sets.map((d) => [d.name, d])),
    runeword: new Map(G.__runewords.map((d) => [d.name, d])),
  };
  const bases = new Map(G.__bases.map((b) => [b.name, b]));
  const propsOf = { unique: (n) => stats.uniques[n]?.props, set: (n) => stats.setItems[n]?.props, runeword: (n) => stats.runewords[n]?.props };

  // 符文之語沒有指定底材：挑孔數夠、類型符合、等級最高的底材
  function runewordBase(def) {
    const ok = G.__bases.filter((b) => def.types.some((t) => G.__isType(b.itype, t)) && !def.excluded?.some((t) => G.__isType(b.itype, t))
      && Math.max(...(stats.bases[b.name]?.sockets ?? [0])) >= def.runes.length);
    const rank = (b) => [stats.bases[b.name]?.level ?? b.level ?? 0, stats.bases[b.name]?.defense?.[1] ?? 0];
    ok.sort((a, b) => { const [la, da] = rank(a), [lb, db] = rank(b); return lb - la || db - da; });
    return ok[0] ?? null;
  }
  function make(rarity, name, baseName) {
    const def = defs[rarity].get(name);
    if (!def) return null;
    if (rarity === "unique") return G.__makeUnique(def, ILVL, ILVL);
    if (rarity === "set") return G.__makeSet(def, ILVL, ILVL);
    const base = (baseName && bases.get(baseName)) || runewordBase(def);
    return base ? G.__makeRuneword(def, base, false, ILVL, ILVL) : null;
  }
  // 與遊戲掉落相同：以種子產生並附上 roll，遊戲可重現驗證
  function seededMake(seed, rarity, name, baseName) {
    const it = G.__seeded(seed, () => make(rarity, name, baseName));
    if (it?.stats) it.roll = [1, seed, ILVL];
    return it;
  }
  const pinned = (fn) => { const r = Math.random; Math.random = () => 0.9999999; try { return fn(); } finally { Math.random = r; } };
  const key = (it) => JSON.stringify([it.mods, it.defense ?? null]);
  // 可變動屬性組合數（太大就不值得找種子）
  function space(rarity, name) {
    let n = 1;
    for (const p of propsOf[rarity](name) ?? []) n *= Math.max(1, p.max - p.min + 1);
    return n;
  }
  const newId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

  // 產生一件物品；max=true 時所有屬性取最高。回傳 { item, legit }
  // free=true（解除修改限制）：直接取最高值，不找合法種子，也不保留遊戲用來驗證的 stats／roll
  function generate(rarity, name, max, baseName, free) {
    if (!defs[rarity]?.has(name)) return null;
    if (free) {
      const it = max ? pinned(() => make(rarity, name, baseName)) : make(rarity, name, baseName);
      if (!it) return null;
      it.id = newId();
      delete it.roll;
      delete it.stats;
      return { item: it, legit: rarity !== "set", max };
    }
    if (!max) {
      const it = seededMake(Math.floor(Math.random() * 4294967296), rarity, name, baseName);
      return it && { item: it, legit: true };
    }
    const best = pinned(() => make(rarity, name, baseName));
    if (!best) return null;
    const want = key(best);
    // 套裝沒有「略過檢查」的方式，一定要合法種子：多試一些，找不到就用最接近最高的合法結果
    const tries = rarity === "set" ? SEED_TRIES * 10 : space(rarity, name) <= SEED_MAX_SPACE ? SEED_TRIES : 0;
    let near = null, nearScore = -Infinity;
    for (let i = 0; i < tries; i++) {
      const seed = Math.floor(Math.random() * 4294967296), it = seededMake(seed, rarity, name, baseName);
      if (!it) break;
      if (key(it) === want) return { item: it, legit: true, max: true };
      const score = it.mods.reduce((a, m) => a + (typeof m.value === "number" ? m.value : 0), 0) + (it.defense ?? 0);
      if (score > nearScore) { near = it; nearScore = score; }
    }
    if (rarity === "set" && near) return { item: near, legit: true, max: false };
    // 暗金／符文之語：拿掉 stats 後遊戲會略過檢查
    best.id = newId();
    delete best.roll;
    delete best.stats;
    return { item: best, legit: true, max: true };
  }

  return {
    // 全部可收藏的物品清單：{ rarity, name, base, type, lvl }
    catalog() {
      const out = [];
      for (const d of G.__uniques) out.push({ rarity: "unique", name: d.name, base: d.base, type: bases.get(d.base)?.type, lvl: d.lvl });
      for (const d of G.__sets) out.push({ rarity: "set", name: d.name, base: d.base, type: bases.get(d.base)?.type, lvl: d.lvl, set: d.set });
      for (const d of G.__runewords) { const b = runewordBase(d); out.push({ rarity: "runeword", name: d.name, base: b?.name, type: b?.type, lvl: d.lvl }); }
      return out;
    },
    // list: [{ rarity, name, base? }]
    generateMany(list, max) {
      return list.map((x) => { try { return generate(x.rarity, x.name, x.max ?? max, x.base, x.free); } catch (e) { return { error: String(e.message ?? e) }; } });
    },
    // 製作裝備用：全部底材（含部位與需求等級）
    bases() { return G.__bases.map((b) => ({ name: b.name, type: b.type, itype: b.itype, level: b.level ?? 0, size: b.size })); },
    // 可以做成這個符文之語的底材
    runewordBases(name) {
      const def = defs.runeword.get(name);
      if (!def) return [];
      return G.__bases.filter((b) => def.types.some((t) => G.__isType(b.itype, t)) && !def.excluded?.some((t) => G.__isType(b.itype, t))
        && Math.max(...(stats.bases[b.name]?.sockets ?? [0])) >= def.runes.length).map((b) => b.name);
    },
    // 用遊戲自己的檢查：回傳每件物品的問題（null 為合法）；這個版本找不到檢查函式時回傳 null
    faults(items) {
      if (!G.__itemFault) return null;
      return items.map((it) => { try { return G.__itemFault(JSON.parse(JSON.stringify(it))); } catch (e) { return { why: String(e.message ?? e) }; } });
    },
    saveFaults(save) { if (!G.__saveFaults) return null; try { return G.__saveFaults(save, 50); } catch (e) { return [String(e.message ?? e)]; } },
  };
}
