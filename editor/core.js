// D2 倖存者 存檔修改器 — 存檔讀寫核心
// 存檔有兩份：localStorage（遊戲主要讀取）與 save/save.json（備份）。兩份都會改寫並重新簽章。
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { ClassicLevel } = require("classic-level");

const USER = path.join(process.env.APPDATA, "D2 Survivors");
const LDB = path.join(USER, "Local Storage", "leveldb");
const SAVE_FILE = path.join(USER, "save", "save.json");
// 備份放在修改器旁邊，不放進遊戲資料夾
const BACKUP_DIR = path.join(process.env.PORTABLE_EXECUTABLE_DIR || __dirname, "backups");

const MODES = {
  softcore: { key: "d2-survivors/save/v1", seal: "d2s/save-seal/1:Rakanishu-Bishibosh-Coldcrow-Griswold-Pindleskin" },
  hardcore: { key: "d2-survivors/hc/v1", seal: "d2s/save-seal/hc/1:Blood-Raven-Treehead-Woodfist-Coldworm-Andariel" },
};
// 遊戲內建匯入時，會把舊存檔留在這些 key
const TRACE_KEYS = { softcore: ["d2-survivors/save/before-import"], hardcore: ["d2-survivors/hc/before-import"] };
const lsKey = (k) => Buffer.concat([Buffer.from("_app://game\x00\x01", "latin1"), Buffer.from(k, "latin1")]);

// 與遊戲相同：HMAC-SHA256(金鑰, JSON.stringify(去掉 seal 的存檔))，seal 接在最後
function sealText(save) {
  const body = JSON.stringify({ ...save, seal: undefined });
  const key = save.mode === "hc" ? MODES.hardcore.seal : MODES.softcore.seal;
  const seal = crypto.createHmac("sha256", key).update(body).digest("hex");
  return body === "{}" ? `{"seal":"${seal}"}` : `${body.slice(0, -1)},"seal":"${seal}"}`;
}
function sealState(save) {
  if (save.seal === undefined) return "none";
  const key = save.mode === "hc" ? MODES.hardcore.seal : MODES.softcore.seal;
  const h = crypto.createHmac("sha256", key).update(JSON.stringify({ ...save, seal: undefined })).digest("hex");
  return h === save.seal ? "sealed" : "broken";
}

// Chromium localStorage 值：0x01 + latin1，或 0x00 + UTF-16LE
const decodeLs = (v) => (v[0] === 1 ? v.subarray(1).toString("latin1") : v.subarray(1).toString("utf16le"));
function encodeLs(s) {
  return /^[\x00-\xff]*$/.test(s)
    ? Buffer.concat([Buffer.from([1]), Buffer.from(s, "latin1")])
    : Buffer.concat([Buffer.from([0]), Buffer.from(s, "utf16le")]);
}

async function openDb() {
  const db = new ClassicLevel(LDB, { keyEncoding: "buffer", valueEncoding: "buffer", createIfMissing: false });
  try {
    await db.open();
  } catch (e) {
    throw new Error("無法開啟 localStorage，請先完全關閉遊戲再試。(" + (e.cause?.message || e.message) + ")");
  }
  return db;
}

async function load(mode) {
  const db = await openDb();
  let text = null;
  try {
    text = decodeLs(await db.get(lsKey(MODES[mode].key)));
  } catch {}
  await db.close();
  let source = "localStorage";
  if (text === null && mode === "softcore" && fs.existsSync(SAVE_FILE)) {
    text = fs.readFileSync(SAVE_FILE, "utf8");
    source = "save.json";
  }
  if (text === null) throw new Error(`找不到${mode === "hardcore" ? "硬核" : "一般"}模式的存檔。`);
  const save = JSON.parse(text);
  return { save, source, seal: sealState(save) };
}

function backup(name, text) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  fs.writeFileSync(path.join(BACKUP_DIR, `${stamp}_${name}`), text);
}

async function store(mode, save) {
  const text = sealText(save);
  const db = await openDb();
  try {
    const k = lsKey(MODES[mode].key);
    try {
      backup(`${mode}_localStorage.json`, decodeLs(await db.get(k)));
    } catch {}
    await db.put(k, encodeLs(text));
  } finally {
    await db.close();
  }
  // save.json 只存放目前模式的存檔（遊戲 main 行程寫入的是最後一次的存檔）
  if (fs.existsSync(SAVE_FILE)) {
    const old = fs.readFileSync(SAVE_FILE, "utf8");
    let oldMode = "softcore";
    try { if (JSON.parse(old).mode === "hc") oldMode = "hardcore"; } catch {}
    if (oldMode === mode) {
      backup("save.json", old);
      fs.writeFileSync(SAVE_FILE, text);
    }
  }
  return text.length;
}

// 物品圖示與尺寸（遊戲解出來的 d2/items.json，一格 = 28px）
const D2_DIR = path.join(USER, "d2");
function assets() {
  try {
    const j = JSON.parse(fs.readFileSync(path.join(D2_DIR, "items.json"), "utf8"));
    const slim = (o) => Object.fromEntries(Object.entries(o ?? {}).map(([k, v]) => [k, (v.inv ?? []).map((i) => [i.file, i.width, i.height])]));
    return { dir: D2_DIR, bases: slim(j.bases), uniques: slim(j.uniques), sets: slim(j.sets), quest: slim(j.quest), runes: slim(j.runes), gems: slim(j.gems) };
  } catch {
    return { dir: D2_DIR, bases: {}, uniques: {}, sets: {}, quest: {}, runes: {}, gems: {} };
  }
}

// 找出 / 刪除遊戲留下的匯入痕跡
async function traces(mode, remove) {
  const db = await openDb(), found = [];
  try {
    for (const k of TRACE_KEYS[mode]) {
      try {
        await db.get(lsKey(k));
        found.push(k);
        if (remove) await db.del(lsKey(k));
      } catch {}
    }
  } finally {
    await db.close();
  }
  return found;
}

// 中文化：使用工具包隨附的共用字典及遊戲屬性樣板。
function i18n() {
  const game = JSON.parse(fs.readFileSync(path.join(__dirname, "gamedata.json"), "utf8"));
  try { return { dict: JSON.parse(fs.readFileSync(path.join(__dirname, "zh-TW.json"), "utf8")), game }; }
  catch { return { dict: {}, game, missing: true }; }
}

/* ---------- 存檔管理 ---------- */
// 檔名：<時間>_<說明>.json；說明含 softcore/hardcore 時代表模式
function summarize(text) {
  try {
    const s = JSON.parse(text);
    return { gold: s.gold, mode: s.mode === "hc" ? "hardcore" : "softcore", classes: Object.keys(s.unlocked ?? {}), seal: sealState(s) };
  } catch {
    return { broken: true };
  }
}
function listBackups() {
  if (!fs.existsSync(BACKUP_DIR)) return [];
  return fs.readdirSync(BACKUP_DIR).filter((f) => f.endsWith(".json")).map((f) => {
    const p = path.join(BACKUP_DIR, f), st = fs.statSync(p);
    return { file: f, size: st.size, time: st.mtimeMs, ...summarize(fs.readFileSync(p, "utf8")) };
  }).sort((a, b) => b.time - a.time);
}
const safeName = (f) => {
  if (path.basename(f) !== f || !f.endsWith(".json")) throw new Error("檔名不正確。");
  return path.join(BACKUP_DIR, f);
};
function readBackup(f) { return JSON.parse(fs.readFileSync(safeName(f), "utf8")); }
function deleteBackup(f) { fs.unlinkSync(safeName(f)); }
function snapshot(save, label) {
  const clean = String(label || "快照").replace(/[\\/:*?"<>|]/g, "_").slice(0, 60);
  backup(`${clean}.json`, sealText(save));
}
function readFile(p) { return JSON.parse(fs.readFileSync(p, "utf8")); }
function writeFile(p, save) { fs.writeFileSync(p, sealText(save)); }

// 診斷資訊：各個檔案找不找得到（不含存檔內容）
function diag() {
  const ex = (p) => fs.existsSync(p);
  return {
    platform: process.platform, appdata: ex(USER), localStorage: ex(LDB), saveFile: ex(SAVE_FILE),
    itemData: ex(path.join(D2_DIR, "itemstats.json")), dictionary: ex(LAUNCHER_DICT), backups: BACKUP_DIR,
  };
}

module.exports = { load, store, assets, i18n, traces, diag, listBackups, readBackup, deleteBackup, snapshot, readFile, writeFile, sealText, sealState, BACKUP_DIR };
