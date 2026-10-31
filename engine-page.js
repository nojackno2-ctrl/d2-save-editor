// 在隱藏視窗裡執行，G 是遊戲模組（engine.js 加上的 __ 前綴匯出）
const ILVL = 99;
const SEED_TRIES = 4000;      // 每件物品最多試幾個種子找「全部最高」的合法 roll
const SEED_MAX_SPACE = 20000; // 可能組合在這以內時，大多找得到全滿的種子

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

  // 魔法／稀有：用遊戲掉落的同一個函式在指定底材上隨機詞綴，附上 roll 讓遊戲可重現驗證
  function generateAffix(rarity, baseName, free) {
    const base = bases.get(baseName);
    if (!base || !G.__makeAffix) return null;
    const seed = Math.floor(Math.random() * 4294967296);
    const it = G.__seeded(seed, () => G.__makeAffix(base, rarity, ILVL, ILVL));
    if (!it) return null;
    if (free) return { item: it, legit: false };
    it.roll = [1, seed, ILVL];
    return { item: it, legit: true };
  }

  // 產生一件物品；max=true 時所有屬性取最高。回傳 { item, legit }
  // free=true（解除修改限制）：直接取最高值，不找合法種子，也不保留遊戲用來驗證的 stats／roll
  function generate(rarity, name, max, baseName, free) {
    if (!defs[rarity]?.has(name)) return null;
    if (free) {
      const it = max ? pinned(() => make(rarity, name, baseName)) : make(rarity, name, baseName);
      if (!it) return null;
      it.id = newId();
      delete it.roll; // 保留 stats：新版遊戲讀檔會丟掉沒有 stats 的物品
      return { item: it, legit: false, max };
    }
    if (!max) {
      const it = seededMake(Math.floor(Math.random() * 4294967296), rarity, name, baseName);
      return it && { item: it, legit: true };
    }
    const best = pinned(() => make(rarity, name, baseName));
    if (!best) return null;
    const want = key(best);
    // 先找「全部最高」的種子：找得到就跟遊戲掉落的完全一樣（含 roll）。
    // 找不到（屬性組合太多）就用全部最高、保留 stats、不帶 roll：遊戲的合法性檢查一樣通過，讀檔也不會改回去。
    // （不能拿掉 stats：新版遊戲讀檔時會把沒有 stats、屬性又多的物品整件丟掉）
    if (space(rarity, name) <= SEED_MAX_SPACE) {
      for (let i = 0; i < SEED_TRIES; i++) {
        const seed = Math.floor(Math.random() * 4294967296), it = seededMake(seed, rarity, name, baseName);
        if (!it) break;
        if (key(it) === want) return { item: it, legit: true, max: true };
      }
    }
    best.id = newId();
    delete best.roll;
    return { item: best, legit: true, max: true };
  }

  return {
    // 全部可收藏的物品清單：{ rarity, name, base, type, lvl }
    catalog() {
      const out = [];
      for (const d of G.__uniques) out.push({ rarity: "unique", name: d.name, base: d.base, type: bases.get(d.base)?.type, lvl: d.lvl });
      for (const d of G.__sets) out.push({ rarity: "set", name: d.name, base: d.base, type: bases.get(d.base)?.type, lvl: d.lvl, set: d.set });
      // 網頁版「網站提供遊戲資料」模式的物品資料沒有符文之語，遊戲本身在這個模式也做不出來
      const rwOk = !!stats.runewords && !!stats.runes;
      for (const d of G.__runewords) {
        const b = rwOk ? runewordBase(d) : null;
        out.push({ rarity: "runeword", name: d.name, base: b?.name ?? d.types?.[0], type: b?.type ?? "weapon", lvl: d.lvl, ...(!rwOk && { unavailable: true }) });
      }
      return out;
    },
    // list: [{ rarity, name, base? }]
    // 產生後再用遊戲讀檔時的整理函式檢查一次，遊戲會丟掉的就不交出去
    generateMany(list, max) {
      return list.map((x) => {
        try {
          const r = x.rarity === "magic" || x.rarity === "rare" ? generateAffix(x.rarity, x.base, x.free) : generate(x.rarity, x.name, x.max ?? max, x.base, x.free);
          if (r?.item && G.__sanitize && !G.__sanitize(JSON.parse(JSON.stringify(r.item)))) return { rejected: true, name: x.name, rarity: x.rarity };
          return r ?? { failed: true, name: x.name, rarity: x.rarity };
        } catch (e) { return { error: String(e.message ?? e), name: x.name, rarity: x.rarity }; }
      });
    },
    // 使用遊戲產生器取得此物品各屬性的最高擲值；其他品質沒有固定的物品上限。
    itemModMax(item) {
      if (!defs[item?.rarity]?.has(item.name)) return null;
      const best = pinned(() => make(item.rarity, item.name, item.base));
      if (!best) return null;
      const values = {};
      for (const m of best.mods ?? []) {
        if (typeof m.value !== "number" || !Number.isFinite(m.value)) continue;
        const key = `${m.implicit ? "1" : "0"}:${m.stat}`;
        (values[key] ??= []).push(m.value);
      }
      return values;
    },
    // 製作裝備用：全部底材（含部位與需求等級）
    affixOk() { return !!G.__makeAffix; },
    // 恰西強化：{ key: { name, maxRank, endless } }；遊戲讀檔時 ranks 會被限制在 maxRank，額外強化只對 endless 項目、且 ranks 已滿時有效（最多 999）
    rankDefs() {
      if (!G.__rankDefs) return null;
      return Object.fromEntries(Object.entries(G.__rankDefs).map(([k, d]) => [k, { name: d.name, maxRank: d.maxRank, endless: !!d.endless }]));
    },
    // 技能修改：{ 職業: [{ id, name, passive, options: [{ id, name, describe }] }] }，只列該職業有、且有修改選項的技能（跟遊戲的檢查一樣）
    skillModDefs(classes) {
      if (!G.__classKits || !G.__modDefs) return null;
      const out = {};
      for (const c of classes) {
        const kit = G.__classKits[c];
        if (!kit) continue;
        const list = [];
        for (const [passive, defs] of [[false, kit.skills], [true, kit.passives]])
          for (const [id, d] of Object.entries(defs ?? {})) {
            const opts = G.__modDefs[id];
            if (opts?.length) list.push({ id, name: d?.name ?? id, passive, options: opts.map((o) => ({ id: o.id, name: o.name, describe: o.describe })) });
          }
        out[c] = list;
      }
      return out;
    },
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
