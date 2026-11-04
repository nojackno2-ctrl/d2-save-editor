const fs = require("node:fs"), path = require("node:path"), os = require("node:os");
const { pathToFileURL } = require("node:url");
const { P, readJson } = require("./util.cjs");

// 從已保存的遊戲快照載入官方翻譯器與字典，避免比對時混入另一個線上版本。
async function audit(previous, current) {
  const folder = (build) => path.join(P.bundles, build || "");
  function asset(build, prefix) {
    const dir = path.join(folder(build), "assets");
    if (!build || !fs.existsSync(dir)) return null;
    const list = fs.readdirSync(dir).filter((f) => f.startsWith(prefix + "-") && f.endsWith(".js"));
    return list.length === 1 ? path.join(dir, list[0]) : null;
  }
  function news(build) {
    const list = readJson(path.join(folder(build), "changelog.json"), null);
    if (!Array.isArray(list)) return null;
    return [...new Set(list.flatMap((item) => (item.lines || []).map((line) => line.text).filter((text) => typeof text === "string" && text.trim())))];
  }
  const currentKo = asset(current, "ko"), oldKo = asset(previous, "ko"), translator = asset(current, "translate");
  const currentNews = news(current), oldNews = previous ? news(previous) : null;
  if (!currentKo || !translator || !currentNews) return { ok: false, reason: "新版快照缺少官方語言字典、翻譯器或新聞資料" };
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "d2-language-audit-"));
  try {
    async function load(file, name) {
      const target = path.join(temp, name + ".mjs"); fs.copyFileSync(file, target);
      return import(pathToFileURL(target).href);
    }
    const currentDict = (await load(currentKo, "current")).default;
    const oldDict = oldKo ? (await load(oldKo, "previous")).default : null;
    const mod = await load(translator, "translate");
    const Translator = Object.values(mod).find((v) => typeof v === "function" && v.prototype?.translate);
    if (!Translator || !currentDict || typeof currentDict !== "object") return { ok: false, reason: "無法解析官方語言字典或翻譯器" };
    // Audit the exact web source used for publication; the editor mirror is
    // synchronized separately and can lag during an in-progress update.
    const dictionary = JSON.parse(fs.readFileSync(path.join(P.web, "lang", "zh-TW.json"), "utf8"));
    const tr = new Translator([dictionary]);
    const keys = Object.keys(currentDict).filter((k) => !/[#*]/.test(k) && !/^[a-z]+:/.test(k));
    const added = oldDict ? keys.filter((k) => !Object.hasOwn(oldDict, k)) : keys;
    const changed = oldDict ? keys.filter((k) => Object.hasOwn(oldDict, k) && JSON.stringify(currentDict[k]) !== JSON.stringify(oldDict[k])) : [];
    const oldNewsSet = new Set(oldNews || []);
    const newsAdded = oldNews ? currentNews.filter((text) => !oldNewsSet.has(text)) : currentNews;
    const missing = (items) => items.filter((text) => tr.translate(text) === text);
    return { ok: true, baseline: previous || null, baselineComplete: !!oldDict && !!oldNews,
      game: { total: keys.length, added: added.length, changed: changed.length, untranslatedAdded: missing(added), untranslatedAll: missing(keys) },
      news: { total: currentNews.length, added: newsAdded.length, untranslatedAdded: missing(newsAdded), untranslatedAll: missing(currentNews) } };
  } finally { fs.rmSync(temp, { recursive: true, force: true }); }
}
module.exports = { audit };
