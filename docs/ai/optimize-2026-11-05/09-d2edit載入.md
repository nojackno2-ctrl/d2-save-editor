# d2edit載入（claude）

# d2edit.js 載入流程掃描報告（唯讀，未修改任何檔案）

## 現況摘要

- **載入順序**
  - 檔案載入時先同步建立 launcher 按鈕和暫停偵測（`d2edit.js:264-313`）。
  - 接著 IIFE（`:320-390`）用 `Promise.all` 同時啟動 7 個步驟：字典、遊戲資料、lang.js、autobot.js、物品引擎、editor.html、自檢。
  - 全部結束後才設 `toolsReady = true`（`:376`）。
- **重複載入防護**：`:266-271` 會關掉舊的 frame、launcher 和 watcher，`:321` 會移除舊的進度框。
- **快取破壞**：`VER` 取自書籤的 `?v=`，沒有就用 `Date.now()`（`:6`），所有子檔案都經 `at()` 加上同一個 `v`（`:7`）。
- **錯誤處理**：每個步驟各自 try/catch，失敗只記到 `warn` 陣列，進度條照常跑完（`:346`）。

## 問題與改善點（依影響排序）

### 1. editor.html 預載其實沒命中快取（`:334` 對 `:275`）

預載抓的是 `editor.html?v=X`。iframe 實際載入的是 `editor.html?v=X&origin=…&mode=…`。HTTP 快取以完整 URL 為鍵，所以預載的那次完全浪費，開啟編輯器時還要再下載一次。

最小改法是讓兩邊 URL 一致。`mode` 會隨開啟時的模式變，所以較好的做法是把 `origin` 和 `mode` 改放 hash，hash 不參與快取鍵。

這需要 `modifier/editor.html` 同步改成讀 `location.hash`，我沒有看那個檔案，所以不確定改動範圍。

```diff
@@ d2edit.js:275
-  frame.src = at("modifier/editor.html") + "&origin=" + encodeURIComponent(location.origin) + "&mode=" + (...);
+  frame.src = at("modifier/editor.html") + "#origin=" + encodeURIComponent(location.origin) + "&mode=" + (...);
```

### 2. 引擎啟動內部是序列瀑布（`:62`、`:73-78`、`:99-102`）

- `/play/` 的 HTML 要等 `patch.mjs` 和 `signatures.json` 載完才開始抓（`:62` 在 `:73` 之前）。
- `itemstats.json` 要等所有區塊抓完、patch、建 blob 之後才抓（`:99-102`）。
- `engine-page.js` 要等 iframe 建好才第一次 import（`:116`）。
- 這三者彼此沒有相依，可以一開始就並行啟動。

```diff
@@ d2edit.js:61 (startEngine 開頭)
   engineInfo.step = "讀取程式清單";
-  const [{ patch }, signatures] = await Promise.all([import(at("modifier/patch.mjs")), fetch(at("modifier/signatures.json")).then((r) => r.json())]);
+  // 以下三件事彼此獨立，一開始就並行啟動
+  const statsP = window.__D2EDIT_ITEMSTATS ? Promise.resolve(window.__D2EDIT_ITEMSTATS) : d2url("itemstats.json");
+  const itemstatsP = statsP.then((u) => fetch(u)).then((r) => { engineInfo.itemstats = r.status; if (!r.ok) throw new Error("讀不到遊戲物品資料（請先進入過遊戲一次）。"); return r.text(); });
+  itemstatsP.catch(() => {}); // 避免等待期間先失敗造成 unhandled rejection，錯誤仍會在下方 await 時拋出
+  import(at("modifier/engine-page.js")).catch(() => {}); // 預熱模組快取，:116 的 import 直接命中
+  const sigP = fetch(at("modifier/signatures.json")).then((r) => { if (!r.ok) throw new Error("signatures.json " + r.status); return r.json(); });
+  const pagesP = (async () => { for (const page of ["/play/", "/"]) { const html = await fetch(new URL(page, location.origin), { cache: "no-store" }).then((r) => (r.ok ? r.text() : "")).catch(() => ""); const f = [...html.matchAll(/\/assets\/([\w.-]+\.js)/g)].map((m) => m[1]); if (f.length) return f; } return []; })();
+  const [{ patch }, signatures] = await Promise.all([import(at("modifier/patch.mjs")), sigP]);
@@ d2edit.js:73-78 (整段 for 迴圈)
-  for (const page of ["/play/", "/"]) { ...fetch...; queue.push(...found); if (found.length) break; }
+  queue.push(...await pagesP);
@@ d2edit.js:99-102
-  const statsUrl = window.__D2EDIT_ITEMSTATS || (await d2url("itemstats.json"));
   engineInfo.step = "讀取物品資料";
   mark("建立模組");
-  const itemstats = await fetch(statsUrl).then(...);
+  const itemstats = await itemstatsP;
```

這樣引擎的關鍵路徑只剩「抓區塊波次 → patch → import」。

### 3. 沒有逾時，任一請求卡住就永遠進不了遊戲工具（`:345-350`）

- 手機網路不穩時，如果某個 fetch 或 import 一直不回應，`Promise.all` 就不會結束。
- 進度條會停住，`toolsReady` 永遠是 false，「修改器」按鈕不會出現。
- 這與註解寫的「單一步驟失敗不卡住」不符，因為只處理了失敗，沒處理卡住。

```diff
@@ d2edit.js:342-346
-  await Promise.all(steps.map(async ([name, run]) => {
-    try { await run(); } catch (err) { warn.push(name); console.warn("載入失敗：" + name, err); }
+  const withTimeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error("逾時 " + ms / 1000 + " 秒")), ms))]);
+  await Promise.all(steps.map(async ([name, run]) => {
+    try { await withTimeout(Promise.resolve().then(run), 45000); } catch (err) { warn.push(`${name}（${err?.message ?? err}）`); console.warn("載入失敗：" + name, err); }
```

這個改動同時順便解決下一點。

### 4. 失敗時使用者看不到原因（`:346`、`:359`）

- 顯示給使用者的只有「載入失敗，相關功能可能無法使用」。
- 像「遊戲版本不相容：找不到 xxx」這種有用的訊息只進了 console，手機上看不到。
- 上面第 3 點的 diff 已把錯誤訊息併進 `warn`。顯示時 `area` 會帶出原因，不必再改 `:359`。

### 5. 子請求缺 `r.ok` 檢查，錯誤訊息誤導

- `:62` 的 `signatures.json` 直接 `.json()`。失敗時使用者看到的是 JSON 解析錯誤，不是 404。第 2 點的 diff 已補上檢查。
- `:82` 區塊抓失敗會悄悄回傳 `null`。最後只會顯示「找不到某特徵碼」，看起來像版本不相容，實際可能只是網路掉了。

建議統計失敗數量，並在 `missing` 之前先判斷：

```diff
@@ d2edit.js:82-91
-  const srcs = await Promise.all(...catch(() => null)));
+  const srcs = await Promise.all(...catch(() => null)));
+  failed += srcs.filter((s) => s == null).length;
@@ d2edit.js:91
-  if (missing.length) throw new Error("遊戲版本不相容：找不到 " + missing.join("、"));
+  if (missing.length) throw new Error((failed ? `有 ${failed} 個程式區塊下載失敗（網路問題？），` : "遊戲版本不相容，") + "找不到 " + missing.join("、"));
```

這裡要在 `:65` 補宣告 `let failed = 0`。

### 6. 重複點書籤會洩漏資源（`:105`、`:96-97`、`:266-270`）

每次點書籤都會：

- 建一個新的隱藏 iframe（`box`），舊的不會移除。
- 建一批新的 blob URL（約 45 個），從不 `revokeObjectURL`。
- 舊的載入 IIFE 繼續在背景跑。
- 每一版 `Storage.prototype.setItem` 的攔截層都堆疊上去（`:161-167`）。

```diff
@@ d2edit.js:105 (建立 box 前)
+  window.__d2editEngineBox?.remove();
   const box = document.createElement("iframe");
+  window.__d2editEngineBox = box;
```

完整做法還要在換版時 revoke 舊的 blob，並把 setItem 攔截的「已掛接」旗標掛在 `window` 上，不要放在模組區域變數 `keepHooked`。這樣新舊版本才不會各掛一層。

### 7. 外層沒有 catch（`:320`）

- 如果進度框的建立（`:322-327`）丟例外（例如 `document.body` 還沒就緒），整個 IIFE 會變成 unhandled rejection。
- `toolsReady` 永遠不會設定，使用者沒有任何提示。
- 建議用 try/catch 包起來，失敗時至少讓 `toolsReady = true`，並 `console.error`。

### 8. 快取策略：每次點書籤都全部重下載（`:6`）

- 書籤每次帶新的 `v`，這包括 891KB 的字典、`gamedata.json`、所有 JS 模組。重複點書籤或換分頁時，這些都是白白重載。
- 建議不要用時間戳記，改成取一個小的版本檔（`fetch(HOST + "version.json", {cache:"no-store"})`），拿它的 hash 或發布版號當 `v`，這樣沒更新時就能命中快取。
- 這需要發布流程多產一個 `version.json`，而且 `VER` 變成非同步取得，影響面較大，我建議先做上面 1 到 7 點。
- 我沒看到書籤本身的內容，所以不確定它現在帶的 `v` 是什麼。

### 小項

- `:187` 與 `:195`：`i18n()` 的字典重試邏輯跟 `loadZhDict`（`:316`）重複。可以直接讓 `i18n()` 呼叫 `loadZhDict()` 加重試，避免兩份 fetch 邏輯。
- 在 IIFE 開頭加上 `modulepreload` 提示，讓瀏覽器提早抓 `helper/selfcheck.js`、`modifier/patch.mjs` 等檔案，但依賴圖的深度我沒追，效益未知。

## 建議實作順序

1. 第 3、4 點（逾時與錯誤訊息）：穩定性收益最大，改動小。
2. 第 2 點（引擎並行）：預期對首次載入時間的改善最大，要實測。
3. 第 1 點：需要同時改 editor.html。
4. 第 5、6、7 點。
5. 第 8 點：需要發布流程配合。

我只讀了 d2edit.js，沒有跑任何測試或實測，所以上面的速度改善都是依程式結構推論。要不要我把前兩項實作出來並跑 `verify/suite.cjs` 驗證？