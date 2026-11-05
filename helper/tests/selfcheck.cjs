// 自檢單元測試：模擬各種「工具包與遊戲不符」的情況，確認都會輸出對應問題、且不拋錯。
const TESTED = (require("node:fs").readFileSync(require("node:path").join(__dirname, "..", "selfcheck.js"), "utf8").match(/const TESTED_GAME_BUILD = "([^"]+)"/) || [])[1];
if (!TESTED) throw new Error("找不到 helper/selfcheck.js 的 TESTED_GAME_BUILD");
const assert = require("node:assert/strict"), path = require("node:path"), { pathToFileURL } = require("node:url");
const store = {};
global.localStorage = { getItem: (k) => store[k] ?? null, setItem: (k, v) => { store[k] = String(v); } };
global.performance = { getEntriesByType: () => [{ name: "https://d2survivors.lol/assets/Game-abc.js" }] };
global.window = {};
let changelog = [{ build: TESTED }];
global.fetch = async () => ({ ok: !!changelog, json: async () => changelog });
const goodGame = () => Object.fromEntries([...["leaveRun", "continueRun", "startRun", "toMenu", "gainXp", "startTerror", "spendStatPoints", "inventoryOf", "equippedOf", "useQuest", "heroNumbers"].map((k) => [k, () => {}]), ...["state", "camp", "save", "build", "difficulty", "director", "trade", "gearActions", "world", "kit"].map((k) => [k, {}]), ["hud", { showTown() {}, closeLevelUp() {} }]]);
const goodCtx = () => ({
  dict: async () => ({ length: 0, ...Object.fromEntries(Array.from({ length: 6000 }, (_, i) => ["k" + i, "v"])) }),
  gamedata: async () => ({ a: 1 }),
  engine: async () => ({ capabilities: () => ({ supported: true, weaponSets: true }), saveFaults: () => [] }),
  engineInfo: { itemstats: 200 }, gameScript: () => "Game-abc.js", hookWaitMs: 300,
  backend: { load: async (m) => { if (m === "hardcore") throw new Error("none"); return { save: {}, seal: "sealed" }; } },
});
(async () => {
  const { runSelfCheck } = await import(pathToFileURL(path.join(__dirname, "..", "selfcheck.js")).href);
  const find = (r, area, level) => r.issues.find((i) => i.area === area && (!level || i.level === level));
  window.__d2autobot = { game: goodGame(), diagnostics: () => ({}) }; window.__d2lang = { debug: () => ({ gameHooked: true }) };
  let r = await runSelfCheck(goodCtx());
  assert.deepEqual(r.issues, [], "全部正常時不應有問題：" + JSON.stringify(r.issues)); assert.equal(r.ok, true);
  changelog = [{ build: "20261201.1" }];
  r = await runSelfCheck(goodCtx()); assert.ok(find(r, "遊戲版本", "warn"), "新版遊戲要警告"); assert.equal(r.ok, false);
  changelog = null; r = await runSelfCheck(goodCtx()); assert.ok(find(r, "遊戲版本", "info"), "抓不到版本只提示"); changelog = [{ build: TESTED }];
  let c = goodCtx(); c.engine = async () => { throw new Error("遊戲版本不相容：找不到 makeUnique"); }; c.engineInfo = { missing: ["makeUnique"] };
  r = await runSelfCheck(c); assert.ok(/makeUnique/.test(find(r, "物品引擎", "error").msg), "引擎失敗要列出缺少的特徵");
  c = goodCtx(); c.dict = async () => ({ a: 1 }); r = await runSelfCheck(c); assert.ok(find(r, "字典", "warn"));
  c = goodCtx(); c.backend.load = async () => ({ save: {}, seal: "broken" }); r = await runSelfCheck(c); assert.ok(find(r, "存檔", "warn"));
  c = goodCtx(); c.engine = async () => ({ capabilities: () => ({ supported: true, weaponSets: true }), saveFaults: () => ["bad item"] }); r = await runSelfCheck(c); assert.ok(/bad item/.test(find(r, "存檔").msg));
  const g = goodGame(); delete g.gainXp; delete g.hud.closeLevelUp; window.__d2autobot.game = g;
  r = await runSelfCheck(goodCtx()); assert.ok(/gainXp/.test(find(r, "輔助器", "warn").msg) && /hud\.closeLevelUp/.test(find(r, "輔助器", "warn").msg), "缺少成員要列出");
  window.__d2autobot.game = null; r = await runSelfCheck(goodCtx()); assert.ok(find(r, "輔助器", "info") && r.ok, "尚未進遊戲只是提示，不算失敗");
  c = goodCtx(); c.backend.load = async () => { throw new Error("x"); }; c.dict = async () => { throw new Error("boom"); };
  r = await runSelfCheck(c); assert.ok(find(r, "字典", "warn"), "單項檢查拋錯不得中斷其他檢查");
  console.log("自檢單元測試通過");
})().catch((e) => { console.error(e); process.exit(1); });
