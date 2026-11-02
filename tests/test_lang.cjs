const assert = require("assert");
const fs = require("fs");
const path = require("path");

console.log("=== 開始執行語言模組單元測試 ===");

// 載入繁中字典
const dictPath = path.join(__dirname, "..", "zh-TW.json");
const dict = JSON.parse(fs.readFileSync(dictPath, "utf8"));

// 模擬 lang.js 的翻譯核心函式
const lowerDict = {};
const numPatterns = [];
for (const [k, v] of Object.entries(dict)) {
  lowerDict[k.toLowerCase()] = v;
  if (k.includes("#") || k.includes("*")) {
    const escaped = k.replace(/[.*+?^${}()|[\]\\]/g, (m) => (m === "*" || m === "#" ? m : "\\" + m));
    const patternStr = "^" + escaped.replace(/#/g, "(\\d+(?:\\.\\d+)?)").replace(/\\\*/g, "(\\d+(?:\\.\\d+)?)") + "$";
    try {
      numPatterns.push({ key: k, val: v, re: new RegExp(patternStr, "i") });
    } catch {}
  }
}

function translateString(str) {
  if (!str || typeof str !== "string") return str;
  const trimmed = str.trim();
  if (!trimmed || !dict) return str;

  if (dict[trimmed] !== undefined) return str.replace(trimmed, dict[trimmed]);
  const lower = trimmed.toLowerCase();
  if (lowerDict[lower] !== undefined) return str.replace(trimmed, lowerDict[lower]);

  const nums = trimmed.match(/\d+(?:\.\d+)?/g);
  if (nums && nums.length > 0) {
    const tHash = trimmed.replace(/\d+(?:\.\d+)?/g, "#");
    if (dict[tHash] !== undefined) {
      return str.replace(trimmed, dict[tHash].replace(/\{(\d+)\}/g, (_, i) => nums[i] ?? ""));
    }
    const tHashLower = tHash.toLowerCase();
    if (lowerDict[tHashLower] !== undefined) {
      return str.replace(trimmed, lowerDict[tHashLower].replace(/\{(\d+)\}/g, (_, i) => nums[i] ?? ""));
    }
    const tStar = trimmed.replace(/\d+(?:\.\d+)?/g, "*");
    if (dict[tStar] !== undefined) {
      return str.replace(trimmed, dict[tStar].replace(/\{(\d+)\}/g, (_, i) => nums[i] ?? ""));
    }
    const tStarLower = tStar.toLowerCase();
    if (lowerDict[tStarLower] !== undefined) {
      return str.replace(trimmed, lowerDict[tStarLower].replace(/\{(\d+)\}/g, (_, i) => nums[i] ?? ""));
    }
    for (let j = 0; j < numPatterns.length; j++) {
      const p = numPatterns[j];
      const m = trimmed.match(p.re);
      if (m) {
        const vals = m.slice(1);
        return str.replace(trimmed, p.val.replace(/\{(\d+)\}/g, (_, i) => vals[i] ?? ""));
      }
    }
  }
  return str;
}

// 測試項目 1: 精確比對
console.log("Test 1: 精確比對 (Exact match)");
assert.strictEqual(translateString("SHOW ITEMS"), "顯示物品");
assert.strictEqual(translateString("Slayer"), "屠殺者");
console.log("  -> 通過");

// 測試項目 2: 不分大小寫比對
console.log("Test 2: 不分大小寫比對 (Case-insensitive)");
assert.strictEqual(translateString("show items"), "顯示物品");
console.log("  -> 通過");

// 測試項目 3: 數字樣板 # seconds left -> 剩餘{0}秒
console.log("Test 3: 數字樣板 (# seconds left -> 剩餘5秒)");
assert.strictEqual(translateString("5 seconds left"), "剩餘5秒");
assert.strictEqual(translateString("  12 seconds left  "), "  剩餘12秒  ");
console.log("  -> 通過");

// 測試項目 4: 多數字樣板 (You took # damage in the last # seconds -> 你在最近{1}秒內受到{0}點傷害)
console.log("Test 4: 多數字樣板替換");
assert.strictEqual(
  translateString("You took 200 damage in the last 4 seconds"),
  "你在最近4秒內受到200點傷害"
);
console.log("  -> 通過");

// 測試項目 5: 星號樣板 (+* to * -> +{0} 至{1}) 或 攻擊次數 (# hits -> {0} 次攻擊)
console.log("Test 5: # hits -> {0} 次攻擊");
assert.strictEqual(translateString("15 hits"), "15 次攻擊");
console.log("  -> 通過");

// 測試項目 6: 模擬 DOM 翻譯與 WeakMap 原文還原
console.log("Test 6: 模擬 DOM 與 WeakMap 原文還原");
const fakeTextNode = { nodeType: 3, nodeValue: "5 seconds left" };
const origMap = new WeakMap();

// 記錄並翻譯
origMap.set(fakeTextNode, fakeTextNode.nodeValue);
fakeTextNode.nodeValue = translateString(fakeTextNode.nodeValue);
assert.strictEqual(fakeTextNode.nodeValue, "剩餘5秒");

// 切回 en 還原
fakeTextNode.nodeValue = origMap.get(fakeTextNode);
assert.strictEqual(fakeTextNode.nodeValue, "5 seconds left");
console.log("  -> 通過");

console.log("=== 所有語言模組單元測試均成功通過！ ===");
