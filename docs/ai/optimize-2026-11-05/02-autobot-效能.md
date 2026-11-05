# autobot-效能（claude）

# `helper/autobot.js` 主迴圈效能分析（唯讀，未修改任何檔案）

## 呼叫結構

- 入口在 `autobot.js:1889`：包裝遊戲的 `proto.tick`，每個 render frame 呼叫 `guarded()`。
- `guarded`（`:1864`）以 `now - lastStep < 50` 節流到最多約 20 Hz。這個節流已經做得不錯。
- `:2088` 另有 200 ms 的 `setInterval`。它大多只做 `setText`/`setDisplay` 加上差異檢查，沒有明顯問題。
- 每個 step 的流程是：`applyCheats` → `autoSummonClone` → `recoverOrphanLevelUp` → `visible(#level-up)` → `readState` → `threats` → `navigate`（內含 `vacuum`、`lootGoal`、`questGoal`、`planMove`）。
- `autoEquip`、`useCodex`、`autoStats`、`leaveLowNormal` 都已有 1～3 秒的節流。`heroDamage`（`:603`）每 3 秒更新一次。這幾項不用改。

## 熱點

**規模假設：** 開啟「怪物數量最大化」作弊後，`enemies` 最多 450 隻（`:1716-1722`）。下面的 O(n) 與 O(n²) 都以這個規模估算。

### 1. `planMove` 候選點評分（影響最大）

**位置：** `:571-596`
```js
for (let i = 0; i < 24; i++) { for (const step of [70, 150]) { ...
  let crowd = 0; for (const f of near) if (dist(f, pt) < 110) crowd++;
  let score = -threat(pt) * 2 - shotHit(pt) * 6 - crowd * 0.4;
  for (const f of near) { const gap = meleeGap(f.e); ... dist(pt, f.e) < zone || dist(pt, f) < zone ... }
```
- 候選點共 48 個。每個點對 `near` 掃 3 遍（`threat`、`crowd`、近戰區），其中近戰區每隻怪還算 2 次 `Math.hypot`。
- 450 隻怪時，每個 step 約 48 × 4 × 450 ≈ 8.6 萬次 `hypot`，20 Hz 下每秒約 170 萬次。
- `near` 的篩選條件是 900 內（`:542`）。但 `threat` 的貢獻是 `w/(1+(d/70)²)`，在 d=450 時只剩 `w×0.023`，遠處的怪幾乎不影響評分。

**建議 diff：**
```diff
-    const near = foes.filter((f) => dist(f, p) < 900);
+    const near = foes.filter((f) => dist(f, p) < 900);
+    // 評分只看 ≤ 450 的怪；遠處貢獻 < 2.5%，且 ±150 的候選點不會改變排序
+    const scoreSet = near.filter((f) => dist(f, p) < 450);
+    for (const f of scoreSet) f.zone = f.r + pr + meleeGap(f.e) + (ranged ? lead(f.e) : 0);   // 預先算好，每幀只算一次
...
-    const threat = (pt) => { for (const f of near) {...} }
+    const threat = (pt) => { for (const f of scoreSet) {...} }
...
-        let crowd = 0; for (const f of near) if (dist(f, pt) < 110) crowd++;
-        let score = -threat(pt) * 2 - shotHit(pt) * 6 - crowd * 0.4;
-        for (const f of near) { const gap = meleeGap(f.e); if (gap === -Infinity) continue; const zone = ...; if (dist(pt, f.e) < zone || dist(pt, f) < zone) score -= ...; }
+        // 單一迴圈同時算 threat / crowd / zone，用平方距離避免 hypot
+        let score = 0, crowd = 0, t = 0;
+        for (const f of scoreSet) {
+          const dx = pt.x - f.x, dy = pt.y - f.y, d2 = dx*dx + dy*dy;
+          if (d2 < 12100) crowd++;
+          if (!(boss && f.e === boss)) { const d = Math.max(0, Math.sqrt(d2) - f.r); t += f.w / (1 + (d / scale) ** 2); }
+          if (f.zone > 0) { const ex = pt.x - f.e.x, ey = pt.y - f.e.y; if (d2 < f.zone ** 2 || ex*ex + ey*ey < f.zone ** 2) score -= f.elite ? 6 : 2.5; }
+        }
+        score += -t * 2 - shotHit(pt) * 6 - crowd * 0.4;
```
- 另外把 `[70, 150]`（`:573`）提到迴圈外成常數，省下 24 次陣列配置。
- 「已有 `lead()`、`meleeGap()` 在內圈重複呼叫」這點，預先算 `zone` 就一併解掉了。

**預期效益：** `hypot` 次數降約 70～85%，CPU 約降到 1/4～1/6。評分只有微幅變化（遠處怪的貢獻被截掉），需要用現有 selfcheck 驗證走位行為沒有退化。

### 2. `lootGoal` 與 `accepts` 每幀對每個掉落物呼叫 `game.loot()`

**位置：** `:405`、`:388-401`、`:413`
```js
const wantedLoot = (s, now, lootOn) => s.pickups.filter((e) => ... && accepts(e) && dist(e, s.p) <= settings.loot.searchRadius);
```
- `accepts()` 會對每個掉落物呼叫遊戲的 `game.loot(item)`，這是遊戲原版的篩選函式，成本不明，很可能不便宜。而 `dist` 距離檢查排在最後。
- `vacuum`（`:412-413`）又對每個掉落物各呼叫一次 `accepts`。
- `navigate` 在通關後（`:667`）又會再跑一次完整的 `wantedLoot`。
- 因此每個 step 對同一個掉落物最多重複呼叫 3 次 `game.loot`，而且對 `searchRadius` 以外的掉落物也呼叫。

**建議 diff：**
```diff
-  const wantedLoot = (s, now, lootOn = ...) => s.pickups.filter((e) => !e.flippy && !e.discarded && (blockedLoot.get(e) || 0) < now && (lootOn || e.item?.type === "quest") && accepts(e) && dist(e, s.p) <= settings.loot.searchRadius);
+  const wantedLoot = (s, now, lootOn = ...) => s.pickups.filter((e) => !e.flippy && !e.discarded && (blockedLoot.get(e) || 0) < now && (lootOn || e.item?.type === "quest") && dist(e, s.p) <= settings.loot.searchRadius && accepts(e));
```
```diff
+  // accepts 結果快取 1 秒：遊戲的拾取規則（loot filter）不會逐幀變動
+  const acceptCache = new WeakMap();
   function accepts(drop) {
+    const c = acceptCache.get(drop); const t = performance.now();
+    if (c && t - c.t < 1000) return c.v;
+    const v = acceptsRaw(drop); acceptCache.set(drop, { v, t }); return v;
   }
```
- 另外讓 `navigate` 在一個 step 內只算一次 `wantedLoot`，結果存進 `s.wanted`，供 `:667` 與 `lootGoal` 共用。

**預期效益：** `game.loot` 呼叫量降到約 1/20。若地上堆了數十件物品，這是除 `planMove` 外最大的一筆。

### 3. `lootGoal` 內 `elites.some(...)` 形成 O(P×E)，並以完整排序只取第 1 名

**位置：** `:424-429`
```js
const elites = isMelee() ? [] : s.enemies.filter((e) => ["actBoss","boss","champion"].includes(e.rank));
const candidates = wantedLoot(...).filter((c) => !elites.some((e) => dist(e, c) < 180));
candidates.sort((a, b) => weight(b) - weight(a) || dist(a, s.p) - dist(b, s.p));
...
const target = candidates[0];
```
- **O(n²) 問題：** 開啟 `allElites`（`:1742`）後，所有一般怪都變成 `champion`，`elites` 可達數百隻。每個候選掉落物都要掃一遍，也就是 O(掉落物 × 精英)。
- **排序問題：** `sort` 的比較器每次比較都重算 `weight` 與 `dist`，但最後只用第一名。

**建議 diff：**
```diff
-    const elites = isMelee() ? [] : s.enemies.filter(...);
-    if (elites.some((e) => dist(e, s.p) < 180)) {...}
-    const candidates = wantedLoot(...).filter((c) => !elites.some((e) => dist(e, c) < 180));
+    // 只有玩家搜尋半徑 + 180 內的精英才可能影響候選物
+    const reachR = settings.loot.searchRadius + 180;
+    const elites = isMelee() ? [] : s.enemies.filter((e) => ELITE_RANKS.has(e.rank) && dist(e, s.p) < reachR);
...
-    candidates.sort(...); ... const target = candidates[0];
+    let target = null, bw = -Infinity, bd = Infinity;
+    for (const c of candidates) { const w = weight(c), d = dist(c, s.p); if (w > bw || (w === bw && d < bd)) { target = c; bw = w; bd = d; } }
```
- 同樣的處理套用到：
  - `:441`：`.sort().slice(0,1)` 改成單次最小值掃描。
  - `:482`：`questDrop` 的 `.filter().sort()[0]`，每個 step 都跑，改成單次最小值掃描。
- `["actBoss","boss","champion"].includes` 提成 `Set` 常數（`:424`、`:524` 都用到）。

**預期效益：** 精英多的場景 O(P×E) 變成 O(P × 附近精英)；消除每幀的排序與暫時陣列。

### 4. `navigate` 對 `s.enemies` 重複掃描 8～9 遍，各自重算 `dist`

**位置：** `:620`、`:622`、`:632`、`:637`、`:646`、`:647`、`:660`（`nearestElite`）、`:679`、`:684`、`:691`

- 每一遍都自己 `filter` 並重算 `dist(e, s.p)`，產生多個暫時陣列。
- `nearestElite`（`:526`）的 `reduce` 內，每次比較要重算 2 次 `dist`（`dist(e,s.p) < dist(a,s.p)`），而且在同一 step 最多被呼叫 3 次。
- `:632` 只要數量，卻先 `filter` 成陣列再取 `.length`。
- `:691` 的 `crowded` 對目標周圍 250 內的怪逐隻判斷 `killable`，也是 O(n)。

**建議做法：** 在 `readState` 回傳時，一次把每隻怪的距離算好存成平行陣列（或存在 `s.dists`）。後續所有 `filter` 改讀快取距離。
```diff
 function readState(g) { ...
-  enemies: Array.isArray(w.enemies) ? w.enemies.filter((e) => live(e) && e.rank !== "breakable") : [], jars: ... w.enemies.filter(...) ...
+  // 單趟分流：enemies / jars，同時記下到玩家的距離
+  const enemies = [], jars = [];
+  for (const e of w.enemies || []) { if (!live(e)) continue; if (e.rank === "breakable") jars.push(e); else { e._d = Math.hypot(e.x - p.x, e.y - p.y); enemies.push(e); } }
```
```diff
-  function nearestElite(s) { return s.enemies.filter((e) => isElite(e) && dist(e, s.p) < 900).reduce(...) }
+  function nearestElite(s) { if (s._elite !== undefined) return s._elite; let best = null; for (const e of s.enemies) if (e._d < 900 && isElite(e) && (!best || e._d < best._d)) best = e; return (s._elite = best); }
-    if (m.enabled && closeEnemy && s.enemies.filter((e) => dist(e, s.p) < m.kiteDistance).length >= 3) {
+    if (m.enabled && closeEnemy && countWithin(s.enemies, m.kiteDistance) >= 3) {
```
- 寫入 `e._d` 會對遊戲物件加屬性，有改變 hidden class 的風險。若不想動遊戲物件，改用與 `enemies` 平行的 `Float64Array`。

**預期效益：** `readState` 兩次 `filter` 合為一趟；`navigate` 的暫時陣列與 `hypot` 約少一半以上。單項看不大，但是不增加複雜度的穩定收益。

### 5. `escapeDirection`：每個 step 最多呼叫 2 次，內圈每次配置物件

**位置：** `:509-520`，呼叫點 `:633`、`:654`
```js
for (let i = 0; i < 16; i++) { ... for (let j = 0; j < 8; j++) {
  const next = s.w.walls.slide(...); ...
  for (const e of near) worst = Math.min(worst, dist({ x, y }, e) - (e.radius || 12));
```
- 最多 16 × 8 = 128 次遊戲的 `walls.slide`，加上 128 × `near` 次 `hypot`，且內圈 `dist({ x, y }, e)` 每次都配置新物件。
- `:633` 與 `:654` 在同一 step 可能都會觸發，結果幾乎相同。

**建議 diff：**
```diff
-        for (const e of near) worst = Math.min(worst, dist({ x, y }, e) - (e.radius || 12));
+        for (const e of near) worst = Math.min(worst, Math.hypot(x - e.x, y - e.y) - (e.radius || 12));
```
- 若上一次的結果在 150 ms 內且玩家位移 < 20，直接重用（前向式快取）。
- `:654` 先篩選再呼叫，改成只在 `gap` 條件成立時才算，`:633` 與 `:654` 共用同一次的結果。

**預期效益：** 省去 128 次配置與重複呼叫；被包圍的場景（正是最吃效能的時候）可降約一半。

### 6. `myReach()` 與 `style()` 每 step 被呼叫十幾次，每次重做 `map+filter+Math.max(...)`

**位置：** `:461-470`；被 `isMelee`、`fighter`、`style`、`battleGoal`（`:473`）、`planMove`（`:546`）反覆呼叫

```js
const list = (game?.build?.skills || []).map((x) => REACH[x.id] ?? 450).filter((r) => r > 0);
return list.length ? Math.max(...list) : 450;
```

**建議 diff：**
```diff
+  let reachKey = null, reachVal = 450;
   function myReach() {
-    const list = (game?.build?.skills || []).map(...).filter(...);
-    return list.length ? Math.max(...list) : 450;
+    const sk = game?.build?.skills;
+    // 技能等級/數量只有升級時才會變；用 500ms TTL 即可
+    const t = performance.now(); if (reachKey === sk && t - reachAt < 500) return reachVal;
+    let r = 0; if (sk) for (const x of sk) { const v = REACH[x.id] ?? 450; if (v > r) r = v; }
+    reachKey = sk; reachAt = t; return (reachVal = r || 450);
   }
```
- 同理，`fighter()` 與 `style()` 在 `navigate` 開頭算一次，傳給 `planMove`（目前 `planMove` 已收到 `st`，卻又呼叫 `fighter()`、`myReach()`）。

**預期效益：** 每個 step 省約 10～20 次陣列配置，且消除 `Math.max(...list)` 展開。收益小但幾乎零風險。

### 7. 每個 step 都做 DOM 查詢與強制樣式計算

**a. `:1795` 與 `:1779`**
```js
const levelUpVisible = visible(document.getElementById("level-up"));
```
- `visible()` 呼叫 `getComputedStyle`（`:173`）。DOM 在每個 render frame 都有變動（HUD 更新），所以每次都可能觸發強制 style recalc。
- 同一個 step 內 `recoverOrphanLevelUp`（`:1779`）還會再做一次。已有 `g.state === "levelUp"` 可以用（`:1798` 也在檢查）。

```diff
-    const levelUpVisible = visible(document.getElementById("level-up"));
+    // 有遊戲實例時以 state 為準（與 :175 paused() 同一做法），避免每 50ms 強制 style recalc
+    const levelUpVisible = g ? g.state === "levelUp" : visible(document.getElementById("level-up"));
```
- 風險：`recoverOrphanLevelUp` 正是要處理「state 已不是 levelUp 但 DOM 殘留」的情況。所以 `:1779` 要保留 DOM 檢查，但降頻到 500 ms，或只在 `g.state` 為 `playing`/`camp`/`town` 時檢查。

**b. `:1771`（`applyCheats` 的無限重抽）**
```js
const rerollBtn = document.querySelector("#level-up button#reroll, #level-up .reroll, button[data-action='reroll']");
```
- 只要 `infiniteRerolls` 開著，每個 step 都跑，而且在「沒有升級畫面」時也跑。第三個選擇器 `button[data-action='reroll']` 沒有 id 錨點，引擎要掃整個文件的 `<button>`。

```diff
-      const rerollBtn = document.querySelector("#level-up button#reroll, ...");
-      if (rerollBtn && rerollBtn.disabled) rerollBtn.disabled = false;
+      if (g.state === "levelUp") {
+        const rerollBtn = document.getElementById("reroll") || document.querySelector("#level-up .reroll, button[data-action='reroll']");
+        if (rerollBtn?.disabled) rerollBtn.disabled = false;
+      }
```
- `:1290` 已經使用 `getElementById("reroll")` 當第一選擇，這裡統一即可。

**預期效益：** 平常（非升級畫面）每個 step 少 2～3 次 `getComputedStyle` 與一次全文件選擇器掃描。這是「每幀 `querySelector`」類中最直接的一項。

### 8. `applyCheats` 每個 step 無條件重寫數十個欄位

**位置：** `:1657-1688`、`:1703-1715`
```js
for (const k of ["damageMult", "physicalDamageMult", ...]) cheatField("oneHitKill", p, p, k, 100);
```
- `cheatField`（`:1528`）每次呼叫都做 `cheatRecs.get`、`rec.fields.find`（線性）、`Object.hasOwn`，然後無條件寫入。開全部作弊時，每個 step 約 25～30 次呼叫，每次也配置新的陣列字面量（`:1669`、`:1673`）。
- `cheatField` 的寫入無條件進行，即使值本來就一樣。

**建議 diff：**
```diff
+  const MASTERY_KEYS = ["physical","fire","cold","lightning","poison","magic"];
+  const MULT_KEYS = ["damageMult", ...];
   function cheatField(key, owner, obj, prop, value) {
     ...
-    obj[prop] = value;
+    if (obj[prop] !== value) obj[prop] = value;
     f.written = value;
```
- 另外把整個作弊套用降到 250 ms 一次（例如 `applyCheats` 開頭 `if (now - cheatAt < 250) return`）。注意無敵的 `lifeGuard` 已用存取器攔截，不依賴每幀重寫，所以降頻不影響無敵本身。
- 唯一要確認的是「換裝後遊戲重算屬性會把加成蓋掉」的情況：50 ms → 250 ms 最多多暴露 4 幀，影響很小。

**預期效益：** 每個 step 的作弊開銷降到約 1/5；無條件寫入對遊戲物件造成的 dirty 標記也減少。

### 9. 怪物複製作弊：每 step 對大陣列 `filter`

**位置：** `:1716-1735`
```js
const baseEnemies = g.world.enemies.filter(e => e && !e._cheatClone && !e.sprite && e.rank !== "breakable" && (e.life || 0) > 0);
```
- 條件 `enemies.length - _cheatClonedCount < 100` 成立期間，每個 step 對最多 450 隻怪做 `filter`，再為每隻產生最多 9 份複製。
- `_cheatClonedCount` 只增不減（怪死掉時不扣），所以長期執行後 `enemies.length - _cheatClonedCount` 會漸漸變成負值。這是**邏輯副作用**，不是效能，但它讓複製行為在長場次中悄悄停止。
- 這些複製出來的怪會讓 `near` 變大，連帶放大第 1、4、5 項的成本。

**建議：**
```diff
+  if (now - cloneAt < 500) {/* skip */} else { cloneAt = now; ...原本邏輯... }
```
- `_cheatClonedCount` 應改為每次重新計算 `enemies.reduce(c => c._cheatClone ? 1 : 0)`，或在複製的怪死亡時遞減（此處只列出，不評估是否要改行為）。

**預期效益：** 在「怪物數量最大化」開啟時，每秒少 18 次 450 元素的 `filter`。

### 10. `allElites` 每個 step 掃整個怪物陣列

**位置：** `:1742-1755`
- 每個 step 對所有怪檢查 `e.rank === "normal"`。轉換後一般怪不會再被選中，所以大部分檢查是空轉。
- 降到 250 ms 一次即可（新生成的怪最多晚 250 ms 變精英，在遊戲上幾乎看不出差別）。

### 11. `vacuum` 的三次迴圈與每幀重複寫入

**位置：** `:409-416`
```js
if (...vacuumXp) for (const e of s.pickups) if (e.kind === "xp" && !e.dead) e.magnet = true;
if (...vacuumGold) for (const e of s.pickups) if (e.kind === "gold" && ...) e.magnet = true;
if (...) for (const e of s.pickups) { ... if (e.kind === "chest") { e.x = s.p.x; ... e.sprite?.position?.set?.(...) } else e.magnet = true; }
```
- 對同一個 `pickups` 陣列掃 3 遍。
- 寶箱每個 step 都被搬到玩家身上並更新 sprite 位置。
- XP 與金幣的 `magnet = true` 只需設一次。

**建議 diff：**
```diff
-    if (assistOn() && settings.loot.vacuumXp && s.p) for (...) ...
-    if (assistOn() && settings.loot.vacuumGold && s.p) for (...) ...
-    if (!assistOn() || ...) return;
-    for (const e of s.pickups) {...}
+    const on = assistOn(), xp = on && settings.loot.vacuumXp, gold = on && settings.loot.vacuumGold, all = on && settings.loot.enabled && settings.loot.vacuum;
+    if (!s.p || !(xp || gold || all)) return;
+    for (const e of s.pickups) {
+      if (e.dead) continue;
+      if (e.kind === "xp") { if (xp && !e.magnet) e.magnet = true; continue; }
+      if (e.kind === "gold") { if (gold && !e.flippy && !e.discarded && !e.magnet) e.magnet = true; if (!all) continue; }
+      if (!all || e.flippy || e.discarded || !accepts(e)) continue;
+      if (e.kind === "chest") {...} else if (!e.magnet) e.magnet = true;
+    }
```
- 注意：保留原行為。金幣在第二個迴圈與第三個迴圈會被處理兩次，合併時要確保 `all` 為真時金幣仍會走第三段邏輯（上面的寫法已保留）。

**預期效益：** `pickups` 掃描 3 遍降成 1 遍；XP 寶石很多時（戰鬥中常有數百顆）差異明顯。

### 12. `readState` 的雙 `filter`，以及 `drank` 後的重算

**位置：** `:235`、`:1853-1856`
- `enemies` 與 `jars` 各自 `filter` 一次 `w.enemies`（同一陣列掃 2 遍）。第 4 項已含合併的 diff。
- `drank || healingFailed` 時才重讀，這個設計已經合理（註解 `:1853` 說得很清楚）。不用改。

### 13. 次要項目

| 位置 | 片段 | 建議 |
|---|---|---|
| `:492` | `[...(search?.watch?.watched?.values?.() \|\| [])].filter(...)` | 每 step 展開 Map 成陣列。改成 `for (const b of map.values())` 單趟尋找最近者，省一個陣列。 |
| `:665` | `s.pickups.some(...)` 內含 `blockedLoot.get(e)` | 只有 `portalDue` 為真才需要；用 `portal` 存在時才算（`const treasure = point(portal) && ...`）。 |
| `:274` | `cooldownDamage.sort(...).slice(...).reduce(...)` | 陣列通常很短，可不改；若 `shots` 很多再考慮改成 `Float64Array`。 |
| `:276`、`:279` | 兩次連續掃 `s.enemies`（`threats`） | 合併成一個迴圈，與第 4 項的快取距離一起做。 |
| `:1069`（`hookBuild` 附近）、`:1472`、`:1477` | `JSON.stringify(qs.q)` 兩次 | 只在任務流程跑，不在戰鬥主迴圈，可忽略。 |
| `:2105` | 面板開啟時每 200 ms 組字串並 `trAuto` | 已有 `setText` 差異檢查，可忽略。 |
| `:1799` | `[...document.querySelectorAll("#choices button")].filter(visible)` | 只在升級畫面出現，且有 `cardActionAt` 的 100 ms 節流，可忽略。 |

## 建議優先順序

| 順序 | 項目 | 難度 | 預期效益 |
|---|---|---|---|
| 1 | 第 7 項（DOM 查詢與強制樣式計算） | 低 | 平常每 step 省 2～3 次 `getComputedStyle` 與一次全文件掃描 |
| 2 | 第 2 項（`accepts` 快取與順序調整） | 低 | `game.loot` 呼叫降約 95% |
| 3 | 第 1 項（`planMove` 合併迴圈與截斷） | 中 | 大量怪時 CPU 約降到 1/4～1/6 |
| 4 | 第 3 項（`lootGoal` 消除 O(P×E) 與排序） | 低 | `allElites` 開啟時明顯 |
| 5 | 第 8、9、10 項（作弊節流） | 低 | 作弊全開時每 step 固定成本降約 80% |
| 6 | 第 4、5、6、11 項 | 中 | 穩定的小幅改善，減少 GC 壓力 |

## 驗證建議（供之後實作時使用）

- 先用瀏覽器 Performance 面板錄 10 秒：在「怪物數量最大化＋全精英＋自動戰鬥」下，量 `step` 的 self time，作為基準。
- 修改走位相關項目（第 1、4、5 項）後，執行 `helper/tests/selfcheck.cjs` 與 `verify/suite.cjs`，並用 `tests/live-harness` 比對走位行為，確認行為沒有退化。
- 第 1 項截斷 `near` 到 450 屬於行為改變，建議保留可調旋鈕（例如 `settings.movement.planRadius`），先預設 450 再用實測決定。

## 未涵蓋與限制

- 未實際執行或量測，以上效益是依程式碼結構與 450 隻怪的假設推估。
- `game.loot`、`walls.slide`、`walls.nearestOpen` 都是遊戲原版函式，真實成本不明。第 2 項與第 5 項的效益取決於它們的實際耗時。
- `progression()`（`:1491`）與 `campShop` 等營地流程只在非戰鬥狀態跑，不屬於戰鬥幀，未深入檢視。
- 本次處於 plan 模式，我沒有建立計畫檔，也沒有修改任何檔案，報告全部在上面。