// D2 倖存者 存檔修改器（網頁版）
// 由書籤載入，在 d2survivors.lol 的頁面裡執行：直接讀寫遊戲的 localStorage 存檔，
// 修改器介面放在全螢幕 iframe 裡，透過 postMessage 跟這裡溝通。
const HOST = new URL(".", import.meta.url).href;
const MODES = {
  softcore: { key: "d2-survivors/save/v1", seal: "d2s/save-seal/1:Rakanishu-Bishibosh-Coldcrow-Griswold-Pindleskin", traces: ["d2-survivors/save/before-import"] },
  hardcore: { key: "d2-survivors/hc/v1", seal: "d2s/save-seal/hc/1:Blood-Raven-Treehead-Woodfist-Coldworm-Andariel", traces: ["d2-survivors/hc/before-import"] },
};
const mode = (m) => MODES[m === "hardcore" ? "hardcore" : "softcore"];

/* ---------- 簽章（與遊戲相同：HMAC-SHA256） ---------- */
async function hmac(key, text) {
  const enc = new TextEncoder();
  const k = await crypto.subtle.importKey("raw", enc.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return [...new Uint8Array(await crypto.subtle.sign("HMAC", k, enc.encode(text)))].map((b) => b.toString(16).padStart(2, "0")).join("");
}
const sealKey = (save) => (save.mode === "hc" ? MODES.hardcore.seal : MODES.softcore.seal);
async function sealText(save) {
  const body = JSON.stringify({ ...save, seal: undefined });
  const seal = await hmac(sealKey(save), body);
  return body === "{}" ? `{"seal":"${seal}"}` : `${body.slice(0, -1)},"seal":"${seal}"}`;
}
async function sealState(save) {
  if (save.seal === undefined) return "none";
  return (await hmac(sealKey(save), JSON.stringify({ ...save, seal: undefined }))) === save.seal ? "sealed" : "broken";
}

/* ---------- 寫入後擋住遊戲覆寫 ---------- */
// 遊戲記憶體裡還是舊存檔，離開前可能再存一次；寫入後就擋掉遊戲對存檔 key 的寫入，關閉修改器時重新載入頁面
const realSetItem = Storage.prototype.setItem;
let written = false;
function lockSaves() {
  if (written) return;
  written = true;
  const keys = new Set(Object.values(MODES).map((m) => m.key));
  Storage.prototype.setItem = function (k, v) { if (this === localStorage && keys.has(k)) return; return realSetItem.call(this, k, v); };
}

/* ---------- 物品引擎：載入遊戲自己的產生器 ---------- */
let enginePromise = null;
async function startEngine() {
  const [{ patch }, signatures] = await Promise.all([import(HOST + "patch.mjs"), fetch(HOST + "signatures.json").then((r) => r.json())]);
  // 從頁面已載入的腳本開始，順著 "./xxx.js" 參照把同資料夾的區塊都抓下來
  const base = new URL("/assets/", location.origin).href;
  const seen = new Set(), files = {};
  const queue = [...document.querySelectorAll("script[src],link[rel=modulepreload]")].map((e) => e.src || e.href)
    .concat(performance.getEntriesByType("resource").map((e) => e.name))
    .filter((u) => u.startsWith(base) && u.endsWith(".js")).map((u) => u.slice(base.length));
  // 目前頁面不一定載入了物品程式（例如停在設定頁），所以也從遊戲主頁的程式清單開始找
  for (const page of ["/play/", "/"]) {
    const html = await fetch(new URL(page, location.origin), { cache: "no-store" }).then((r) => (r.ok ? r.text() : "")).catch(() => "");
    for (const m of html.matchAll(/\/assets\/([\w.-]+\.js)/g)) queue.push(m[1]);
  }
  while (queue.length) {
    const f = queue.shift();
    if (seen.has(f)) continue;
    seen.add(f);
    const src = await fetch(base + f).then((r) => (r.ok ? r.text() : null)).catch(() => null);
    if (src == null) continue;
    files[f] = src;
    for (const m of src.matchAll(/["'`]\.\/([\w.-]+\.js)["'`]/g)) queue.push(m[1]);
  }
  const { patched, missing } = patch(files, signatures);
  if (missing.length) throw new Error("遊戲版本不相容：找不到 " + missing.join("、"));
  // 加了 export 的區塊用 blob 載入（相對參照改成絕對網址）；再用 import map 讓所有區塊對它的參照都指向這份，
  // 整個模組圖只有一個實例
  const map = {};
  for (const [f, src] of Object.entries(patched)) {
    const abs = src.replace(/(["'`])\.\/([\w.-]+\.js)\1/g, (_, q, d) => q + base + d + q);
    map[base + f] = URL.createObjectURL(new Blob([abs], { type: "text/javascript" }));
  }
  const statsUrl = window.__D2EDIT_ITEMSTATS || new URL("/d2/itemstats.json", location.origin).href;
  const itemstats = await fetch(statsUrl).then((r) => { if (!r.ok) throw new Error("讀不到遊戲物品資料（請先進入過遊戲一次）。"); return r.text(); });
  // 遊戲本身已經載入同一批程式，再載一次會重複註冊；所以放進隱藏的同源 iframe，用它自己的模組環境執行
  const box = document.createElement("iframe");
  box.style.display = "none";
  box.srcdoc = `<!doctype html><meta charset=utf-8><script type="importmap">${JSON.stringify({ imports: map }).replace(/</g, "\\u003c")}<\/script>`;
  await new Promise((ok) => { box.onload = ok; document.body.appendChild(box); });
  const w = box.contentWindow;
  w.__entries = Object.keys(map);
  w.__itemstats = itemstats;
  return w.eval(`(async () => {
    const mods = await Promise.all(__entries.map((u) => import(u)));
    const { boot } = await import(${JSON.stringify(HOST + "engine-page.js")});
    return boot(Object.assign({}, ...mods), __itemstats);
  })()`);
}
const engine = () => (enginePromise ??= startEngine().catch((e) => { enginePromise = null; throw e; }));

/* ---------- 給 iframe 呼叫的功能 ---------- */
const backend = {
  async load(m) {
    const text = localStorage.getItem(mode(m).key);
    if (text == null) throw new Error(`找不到${m === "hardcore" ? "硬核" : "一般"}模式的存檔。`);
    const save = JSON.parse(text);
    return { save, source: "localStorage", seal: await sealState(save) };
  },
  async save(m, save) {
    if (typeof save !== "object" || !save || typeof save.version !== "number") throw new Error("存檔格式不正確。");
    const text = await sealText(save);
    realSetItem.call(localStorage, mode(m).key, text);
    lockSaves();
    return { ok: true, bytes: text.length, reload: true };
  },
  sealText,
  async assets() {
    const dir = new URL("/d2", location.origin).href;
    try {
      const j = await fetch(dir + "/items.json").then((r) => r.json());
      const slim = (o) => Object.fromEntries(Object.entries(o ?? {}).map(([k, v]) => [k, (v.inv ?? []).map((i) => [i.file, i.width, i.height])]));
      return { dir, bases: slim(j.bases), uniques: slim(j.uniques), sets: slim(j.sets), quest: slim(j.quest), runes: slim(j.runes), gems: slim(j.gems) };
    } catch {
      return { dir, bases: {}, uniques: {}, sets: {}, quest: {}, runes: {}, gems: {} };
    }
  },
  // 中文：不附任何翻譯檔，改用玩家已經在頁面上開啟的「D2 繁體中文」書籤（window.D2I18N）當場翻譯
  async i18n() {
    const game = await fetch(HOST + "gamedata.json").then((r) => r.json());
    const I = window.D2I18N;
    if (!I || I.language !== "zh-Hant") return { dict: {}, game, missing: true };
    const dict = {};
    const put = (en) => { if (en && !(en in dict)) { const zh = I.translate(en); if (zh && zh !== en) dict[en] = zh; } };
    // 屬性樣板：# 代入特殊數字翻整句，再把數字換回 {0}{1}{2}
    const SENT = ["12345", "23456", "34567"];
    const putTemplate = (en) => {
      let i = 0;
      const zh = I.translate(en.replace(/#/g, () => SENT[i++] ?? "0"));
      if (!zh || zh === en || !/[㐀-鿿]/.test(zh)) return;
      dict[en] = SENT.reduce((s, n, k) => s.split(n).join(`{${k}}`), zh);
    };
    for (const t of Object.values(game.stats)) putTemplate(t);
    for (const w of ["on striking", "on attack", "when struck", "when you Kill an Enemy", "when you Die", "when you Level-Up"]) putTemplate(`#% Chance to cast level # # ${w}`);
    putTemplate("Level # # Aura When Equipped");
    for (const c of Object.values(game.classes)) { put(c.only); c.trees.forEach(put); }
    // 名稱：物品、底材、套裝、技能，以及存檔裡出現過的物品
    try {
      const e = await engine();
      for (const x of await e.catalog()) { put(x.name); put(x.base); put(x.set); }
      for (const b of await e.bases()) put(b.name);
    } catch {}
    try {
      const stats = await fetch(window.__D2EDIT_ITEMSTATS || new URL("/d2/itemstats.json", location.origin).href).then((r) => r.json());
      for (const s of Object.values(stats.skills ?? {})) put(s.name);
    } catch {}
    for (const m of Object.values(MODES)) {
      const walk = (o) => { if (Array.isArray(o)) o.forEach(walk); else if (o && typeof o === "object") { if (o.mods && o.name) { put(o.name); put(o.base); for (const w of o.name.split(" ")) put(w); } Object.values(o).forEach(walk); } };
      try { walk(JSON.parse(localStorage.getItem(m.key) || "null")); } catch {}
    }
    return { dict, game };
  },
  async engine(fn, ...args) {
    if (!["catalog", "generateMany", "faults", "saveFaults", "bases", "runewordBases"].includes(fn)) throw new Error("不支援的操作");
    const e = await engine();
    // 結果來自另一個 iframe，複製一份成這邊的物件
    return JSON.parse(JSON.stringify(await e[fn](...args) ?? null));
  },
  traces(m, remove) {
    const found = mode(m).traces.filter((k) => localStorage.getItem(k) != null);
    if (remove) for (const k of found) localStorage.removeItem(k);
    return found;
  },
  close() { close(); return true; },
};

/* ---------- 全螢幕介面 ---------- */
let frame = null;
function close() {
  frame?.remove();
  frame = null;
  window.removeEventListener("message", onMessage);
  if (written) location.reload();
}
async function onMessage(e) {
  if (!frame || e.source !== frame.contentWindow || e.data?.d2edit !== "call") return;
  const { id, fn, args } = e.data;
  let result;
  try {
    if (!Object.hasOwn(backend, fn)) throw new Error("不支援的操作：" + fn);
    result = await backend[fn](...args);
  } catch (err) {
    result = { error: String(err?.message ?? err) };
  }
  frame?.contentWindow.postMessage({ d2edit: "reply", id, result }, new URL(HOST).origin);
}

window.__d2editBackend = backend; // 方便除錯（同一頁面本來就能讀寫這些存檔）
if (window.__d2editOpen) window.__d2editOpen();
else {
  window.__d2editOpen = () => {
    if (frame) return close();
    frame = document.createElement("iframe");
    frame.src = HOST + "editor.html?origin=" + encodeURIComponent(location.origin) + "&mode=" + (localStorage.getItem("d2-survivors/mode/v1") === "hardcore" ? "hardcore" : "softcore");
    frame.style.cssText = "position:fixed;inset:0;width:100vw;height:100dvh;border:0;z-index:2147483647;background:#14110d";
    window.addEventListener("message", onMessage);
    document.body.appendChild(frame);
  };
  window.__d2editOpen();
}
