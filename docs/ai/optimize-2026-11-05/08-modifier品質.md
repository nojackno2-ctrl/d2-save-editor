# modifier品質（claude）

# 程式碼品質掃描:`modifier/patch.mjs`、`modifier/engine-page.js`

這次只讀檔,沒有修改任何東西,也沒有執行測試。下面每一項都是讀程式碼推得的結論,沒有實際執行驗證。

## 🔴 高

**1. `patch.mjs:27` 附加的 export 可能被行尾註解吃掉**
```js
patched[f] = files[f] + `;export{...};`;
```
遊戲區塊若以 `//# sourceMappingURL=...` 或任何 `//` 註解結尾且沒有換行,`;export{}` 會變成註解的一部分。結果是 export 不存在,下游只會看到「找不到 `__xxx`」。
```diff
-patched[f] = files[f] + `;export{...};`;
+patched[f] = files[f] + `\n;export{...};`;
```

**2. `patch.mjs:3-6, 35` UMD 包裝與 `.mjs` 衝突(需確認載入方式)**
```js
if (typeof module === "object" && module.exports) ...
export const patch = self.D2Patch.patch;
```
- 在 ESM 裡 `module` 不存在,所以 CJS 分支是死碼。
- Node 沒有全域 `self`,若直接 `import` 此檔,第 6 行 `this` 為 `undefined`,第 35 行 `self.D2Patch` 會丟 `ReferenceError`。
- 註解寫「桌面版(Node)與網頁版共用」。若桌面版是用其他方式載入(例如 vm 或複製成 CJS),這項才不成立。
```diff
-(function (root, factory) {...})(typeof self !== "undefined" ? self : this, function () {
-  ...
-  return { patch };
-});
-export const patch = self.D2Patch.patch;
+export function patch(files, signatures) { ... }  // 去掉 UMD,純 ESM
```

**3. `engine-page.js:15` 缺少 `stats.runewords` 等欄位時會丟例外**
```js
const propsOf = { ..., runeword: (n) => stats.runewords[n]?.props };
```
第 544 行自己承認網頁版資料「沒有符文之語」。`stats.runewords` 為 `undefined` 時,`space("runeword", …)`(第 82 行)會丟 `TypeError`。`stats.uniques`、`stats.setItems`、`stats.bases`(第 20、449、493、714 行)也有同樣問題。
```diff
-unique: (n) => stats.uniques[n]?.props, set: (n) => stats.setItems[n]?.props, runeword: (n) => stats.runewords[n]?.props
+unique: (n) => stats.uniques?.[n]?.props, set: (n) => stats.setItems?.[n]?.props, runeword: (n) => stats.runewords?.[n]?.props
```
並把 `stats.bases[x]` 一律改成 `stats.bases?.[x]`。

## 🟠 中

**4. `patch.mjs:21` `m[1]` 沒有檢查**
```js
(perFile[f] ??= {})[k] = m[1];
```
簽名正規式沒有捕獲群組時,`m[1]` 是 `undefined`,會產生 `export{undefined as __k}`,整個模組語法錯誤。另外 `compile`(第 12 行)的 `new RegExp` 遇到壞簽名會直接丟例外,沒有訊息指出是哪個 key。
```diff
-if (m) { found[k] = f; ... = m[1]; break; }
+if (m?.[1]) { found[k] = f; ... = m[1]; break; }
```

**5. 選用函式沒有一致防護**(OPTIONAL 清單第 8 行本來就允許缺)
- `affixMatches`(第 199 行)、`partialFeasible`(第 306 行)、`resolveName` 的 rare 分支直接用 `G.__affixes.filter(...)`,`affixApplies` 也沒有檢查。
- `baseImplicits`(第 247 行)直接用 `G.__makeAffix`,而 `validate`(第 501 行)和 `allowedStats`(第 463 行)都會呼叫它。
- `affixInfo`、`statRanges`、`affixSlots` 卻有防護。
- 後果:舊版遊戲上 `validate` 只能靠 `validateItems` 的 try/catch 變成 `{code:"error"}`,使用者看到的是 `x is not a function`。
```diff
 function baseImplicits(base) {
+  if (!G.__makeAffix) return {};
   if (implicitCache.has(base.name)) ...
```
`affixPlan` 開頭也加上 `if (!G.__affixes || !G.__affixApplies) return null;`。

**6. `engine-page.js:260` 回傳型別不一致**
```js
if (!low || !high) return ["error.generate"];   // 字串
// 其他地方都是 { code, ... } 物件
```
消費端讀 `.code` 會得到 `undefined`。
```diff
-return ["error.generate"];
+return [{ code: "error", why: "error.generate" }];
```

**7. `engine-page.js:529-531, 614, 691-730` 公開方法的例外處理不一致**
`fixedInfo`、`fixedBuild`、`faults`、`saveFaults`、`validateItems`、`allowedStatsMany` 有 try/catch。`affixSlots`、`resolveName`(`item` 為 `null` 時第 615 行就爆)、`itemModMax`、`catalog`、`runewordBases`、`skillModDefs`(`classes` 非陣列時爆)沒有。
```diff
-affixSlots(item, mods) { return affixSlots(item, mods); },
+affixSlots(item, mods) { try { return affixSlots(item, mods); } catch { return { limit: null, used: { pre: 0, suf: 0 }, kinds: {} }; } },
```
`resolveName` 開頭加 `if (!item) return { error: "缺少物品" };`。

**8. `engine-page.js:511` `validate` 依賴 `this`**
```js
const ranges = this?.affixInfo?.(base.name, item.rarity)?.ranges ?? {};
```
如果方法被解構取出(`const { validateItems } = engine`),`this` 為 `undefined`,範圍會悄悄變空,結果少了 `affixStat`/`range` 的細項。`affixInfo` 搬成閉包內的函式,`validateItems` 就不必 `.call(this, …)`。

## 🟡 低:重複邏輯(建議重構,風險較高,應先有測試)

**9. 詞綴比對與 DFS 重複 4 到 5 份**
- 「parts = [stat, …alike, also]」的展開:第 309、371、470、596-597 行。
- `walk` 組合列舉:第 311-315、385-394 行(幾乎逐字相同)。
- 回溯 `dfs`:第 226-238、319-331、401-417 行。
- 比對 `mods` 的 `findIndex`:第 205-208、636-643 行。
- 「適用詞綴」過濾 `G.__affixes.filter(a => G.__affixApplies(a, base, a.cls) && !(rarity==="rare" && a.d2?.magicOnly))` 出現 6 次:第 199、306、347、468、587、630 行。

至少先抽出下面兩個函式,最安全:
```js
const applicable = (base, rarity) => (G.__affixes ?? []).filter(a => G.__affixApplies?.(a, base, a.cls) && !(rarity === "rare" && a.d2?.magicOnly));
const affixParts = (a) => { const d = a.d2 ?? {}; return [[a.stat, a.min, a.max, d.length], ...(d.alike ?? []).map(s => [s, a.min, a.max]), ...(d.also ? [[d.also.stat, d.also.min, d.also.max]] : [])]; };
```

**10. 符文之語底材相容判斷重複 5 次**
第 19-20、449-450、492-494、663-665、721-722 行都是 `types.some(isType) && !excluded?.some(isType) && max(sockets) >= runes.length`。而且第 547 行用了 `d.types?.[0]`,其他處卻是 `def.types.some`,防護不一致。
```js
const runewordFits = (def, b) => def.types?.some(t => G.__isType(b.itype, t)) && !def.excluded?.some(t => G.__isType(b.itype, t))
  && Math.max(...(stats.bases?.[b.name]?.sockets ?? [0])) >= def.runes.length;
```

**11. 其他重複**
- 第 53、73、84、102、247 行:`Math.floor(Math.random() * 4294967296)` 重複 5 次,可抽成 `const randSeed = () => ...`。
- 第 557、727 行:`JSON.parse(JSON.stringify(x))` 與第 97 行的 `clone` 重複,直接用 `clone`。
- 第 288 行:同一個 `/^(proc|charge):(.+):(\d+)$/` 寫了兩次。

## ⚪ 低:死碼與小問題

| 位置 | 片段 | 建議 |
|---|---|---|
| `engine-page.js:286` | `m.stat !== h?.stat` | 第 283 行已保證 `h` 存在,`?.` 多餘 |
| `engine-page.js:290` | `return out.push(...)` 在 `forEach` 內 | 改成 `{ out.push(...); return; }`,別回傳數字 |
| `engine-page.js:297-298` | `Math.max(low.defense, high.defense)` | `high.defense` 非數字時變 `NaN`,之後的比較全為 false,等於悄悄放行。加上 `typeof high.defense === "number"` |
| `engine-page.js:361` | `(mods ?? [])` | 預設值已處理 `undefined`,只剩 `null` 才有意義 |
| `engine-page.js:407` | `return n <= lim.max` | 第 411 行已擋掉 `n >= lim.max`,恆為 true |
| `engine-page.js:310, 374` | `.map((m, i) => i)` | 第 374 行的 `m` 還被內層 `m` 遮蔽,改用 `[...mods.keys()]` |
| `engine-page.js:482` | `["rune","gem","quest"]` | 已有前面 `item.type === "quest"`,但 `base.type` 是否為 `quest` 不確定,需確認再刪 |
| `engine-page.js:533` | `catch (e) { return null; }` | `e` 未使用,改 `catch {` |
| `engine-page.js:584` | `affixInfo(baseName, rarity, mods = [])` | `mods` 完全沒用到 |
| `engine-page.js:182, 186` | `it.mods.filter(...)` | `it.mods` 缺少時會丟 `TypeError`(外層有 catch,但訊息不明)。改 `(it.mods ?? [])` |
| `engine-page.js:249` | `Math.min(v[0], m.value)` | `m.value` 非數字會產生 `NaN` 並進快取 |
| `engine-page.js:526-531, 690, 715` | 註解錯位 | 「依原版規則檢查物品…」「屬性下拉選單用…」在 `capabilities` 與 `affixSlots` 之間,對不上函式。第 690 行的「全部底材」該在 `bases()`(第 714 行),第 715 行「符文之語底材」該在 `runewordBases`(第 718 行)。第 529-533 行縮排也亂了 |

## 建議處理順序
1. 先修第 1、3、4、6 項。每項都是 1 到 2 行,風險低。
2. 再補第 5、7 項的防護,並確認第 2 項(桌面版實際怎麼載入 `patch.mjs`)。
3. 第 9、10 項的重構等有測試覆蓋再做。可用 `helper/tests/selfcheck.cjs` 或 `verify/suite.cjs` 當基準,但這兩個檔案目前有未提交的修改。

要我開始修哪幾項,告訴我即可。