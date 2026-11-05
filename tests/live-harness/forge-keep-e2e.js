// 鍛造（temper）保留實機測試：在修改器 iframe 內執行（H_IN=editor electron craft-live.cjs forge-keep-e2e.js out.json）。
// 驗證「調成最高數值」遇到帶 forge 的物品時保持原樣，沒有鍛造的物品照常重新產生。
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
await sleep(4000);
const out = { checks: {} };
out.checks.fnsLoaded = typeof maxItems === "function" && typeof hasForge === "function";
const forged = { id: "forge-test-1", at: null, rarity: "unique", type: "armour", base: "Ormus' Robes", name: "Ormus' Robes", mods: [], forge: { t: { m0: 1 }, up: 0 } };
const forgedBefore = JSON.stringify(forged);
out.checks.hasForgeTrue = hasForge(forged) === true;
await maxItems([forged]);
out.checks.forgedUnchanged = JSON.stringify(forged) === forgedBefore;
out.checks.forgedStillHasForge = JSON.stringify(forged.forge) === JSON.stringify({ t: { m0: 1 }, up: 0 });
// 對照組：沒有鍛造的物品應該被重新產生（欄位會被覆寫，不再是原本的物件內容）
const plain = { id: "forge-test-2", at: null, rarity: "unique", type: "armour", base: "Ormus' Robes", name: "Ormus' Robes", mods: [] };
const plainBefore = JSON.stringify(plain);
await maxItems([plain]);
out.checks.plainRegenerated = JSON.stringify(plain) !== plainBefore;
out.checks.plainKeptId = plain.id === "forge-test-2";
out.statusText = document.querySelector("#status")?.textContent ?? "";
out.ok = Object.values(out.checks).every((v) => v === true);
return out;
