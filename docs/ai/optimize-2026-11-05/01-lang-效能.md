# lang-效能（claude）

# lang/lang.js 熱路徑效能分析（唯讀，未修改任何檔案）

我只讀了程式，沒有跑 benchmark，下面的效益都是依程式結構估計的。`translateString` 的快取命中路徑（L576–578）已經很輕，成本集中在快取未命中時，以及 `composeFind` 包住的 `find`。`find` 會被 `gameTr.translate` 遞迴呼叫，所以它的常數成本會被放大。

## A. translateString（L575–632）

**A1. 第二次怪物名查詢是重複的（L621–624）**
- 片段：
  ```js
  if (r === str && gameTr?.translateAs && /^[A-Z][A-Za-z' -]{1,40}$/.test(str.trim())) {
    const mon = gameTr.translateAs("monster", str.trim());
  ```
- 問題：L585 已用同一個 `key = str.trim()` 查過 `translateAs("monster", key)`。結果若是 `null` 或等於 `key`，L621 在 `gameTr` 沒變的情況下只會得到同樣結果。要走到 L621 的字串都是這種結果，所以這段是多一次的正則加字典查找。
- 建議（只留 L585 的結果，L621 區塊整段刪除）：
  ```diff
  -    if (r === str && gameTr?.translateAs && /^[A-Z][A-Za-z' -]{1,40}$/.test(str.trim())) {
  -      const mon = gameTr.translateAs("monster", str.trim());
  -      if (mon && mon !== str.trim()) r = str.replace(str.trim(), mon);
  -    }
  ```
- 效益：每個未命中且像名稱的字串少一次正則、一次 `trim`、一次 `translateAs`。
- 風險：低。刪除前先確認 L590–617 的流程不會讓 `gameTr` 狀態改變。

**A2. `str.trim()` 重複計算，`look` 閉包每次重建（L579, 593, 599, 621–623）**
- 片段：`const look = (s) => (gameTr ? gameTr.translate(s) : simpleTranslate(s));`
- 建議把 `look` 提到模組層級，並重用 `key`：
  ```diff
  +  const look = (s) => (gameTr ? gameTr.translate(s) : simpleTranslate(s));
   function translateString(str) {
  ...
  -    const look = (s) => (gameTr ? gameTr.translate(s) : simpleTranslate(s));
  -  if (r === str && /^[A-Za-z][A-Za-z' -]*$/.test(str.trim()) && str.includes(" ")) {
  -    const words = str.trim().split(/\s+/);
  +  if (r === str && key.includes(" ") && /^[A-Za-z][A-Za-z' -]*$/.test(key)) {
  +    const words = key.split(/\s+/);
  ```
- 順便把 `includes(" ")` 放到正則前面，沒有空格的字串就不用跑正則。
- 效益：每次未命中少一個閉包配置和 1～3 次 `trim`。效益小，但改動也小。

**A3. Build 正則每次未命中都執行（L583）**
- 片段：`const build = /^(\s*)Build (\d+...)$/i.exec(str), word = dict["Build (version)"];`
- 問題：絕大多數字串都不是版本號，卻都會跑一次 `exec` 和一次字典查找。
- 建議（先用便宜的 `includes` 擋掉）：
  ```diff
  -    const build = /^(\s*)Build .../i.exec(str), word = dict["Build (version)"];
  +    const build = key.length > 5 && key.includes("Build ") ? BUILD_RE.exec(str) : null;
  +    const word = build ? dict["Build (version)"] : undefined;
  ```
  並把 `BUILD_RE` 提到模組層級常數。
- 效益：每次未命中省一次 `exec` 和一次字典查找。

**A4. 逐段切詞迴圈是 O(n²) 次 `look`，沒有記憶（L606–614、L603）**
- 片段：`for (let j = words.length; j > i; j--) { const cand = words.slice(i, j).join(" "), t = look(cand);`
- 問題：每個 i 都從最長候選往短試，每一次都走完整的 `gameTr.translate` 和 `find` 鏈。同一批詞綴（像 "Extra Strong"、"Cold Enchanted"）會在不同字串中重複查詢，但 `cache` 只存整句。
- 建議：加一個片段快取，`useDict` 時一起清：
  ```diff
  +  const segCache = new Map();
  +  const lookSeg = (s) => { let t = segCache.get(s); if (t === undefined) { t = look(s); if (segCache.size > 5000) segCache.clear(); segCache.set(s, t); } return t; };
  -            const cand = words.slice(i, j).join(" "), t = look(cand);
  +            const cand = words.slice(i, j).join(" "), t = lookSeg(cand);
  -        const tr = traits.map((t) => look(t));
  +        const tr = traits.map(lookSeg);
   function useDict(d) { ... cache.clear();
  +  segCache.clear();
  ```
- 效益：這是未命中路徑中最大的一項。Boss 詞綴列、怪物稱號串的未命中成本從 O(n²) 次完整 `find` 降到查表。
- 風險：低。語言切換時必須清 `segCache`（和 `cache` 同時機）。

**A5. 整句快取滿了就整個清空（L629）**
- 片段：`if (cache.size > 20000) cache.clear();`
- 問題：一次清空會讓下一瞬間所有字串同時未命中，造成卡頓。含變動數字的字串（如 HP 數值）會把快取塞滿。
- 建議：改成清最舊的一批（Map 保留插入順序）：
  ```diff
  -    if (cache.size > 20000) cache.clear();
  +    if (cache.size > 20000) { let n = 2000; for (const k of cache.keys()) { cache.delete(k); if (--n <= 0) break; } }
  ```
- 效益：消除長時間遊玩時的週期性卡頓。若要進一步提高命中率，可以對純數字變化的字串做「數字換 #」的正規化快取，但要小心 `{n}` 回填，我不建議在沒量測前做。

## B. composeFind（L210–264）

**B1. `find` 沒有結果記憶（L234–263）**
- 問題：`find(e, depth)` 對固定字典是決定性的，卻在每次 `translate` 遞迴中重算。`part`、`itemName`、清單切分都會反覆對同樣的片段呼叫 `origFind`。
- 建議：用 `depth + "|" + e` 當鍵做記憶，連 `null` 結果也存：
  ```diff
  +    const memo = new Map();
  +    findMemo = memo; // 供 useDict 清除
       P.find = keepFunctionName(origFind, function (e, depth) {
         if (this !== gameTr || depth > 3) return origFind.call(this, e, depth);
  +      const mk = (depth | 0) + "|" + e;
  +      const hit = memo.get(mk);
  +      if (hit !== undefined) return hit;
  +      const res = compute.call(this, e, depth);   // 原本函式本體改名為 compute
  +      if (memo.size > 20000) memo.clear();
  +      memo.set(mk, res);
  +      return res;
  ```
  並在 `useDict` 裡加 `findMemo?.clear()`。
- 效益：預期是 `composeFind` 中最大的一項，因為遞迴子片段會重複命中。
- 風險：中。結果依賴 `currentLang`（`sep` 取自 `LIST_SEP[currentLang]`）和 `gameTr` 字典，所以語言切換和 `useDict` 都必須清除。

**B2. `itemName` 在同一次 `find` 內被重複呼叫（L248、L254、L262）**
- 片段：L254 對含 " of " 的 `e` 呼叫 `itemName.call(this, e)`；回傳 null 後，L262 又對同一個 `e` 呼叫一次。L248 對 `segs.join(" ")` 也是類似情況。
- 問題：`itemName` 內是 O(n²) 的子串組合（最多約 36 組，每組 2～4 次 `exactOf`），重複呼叫等於把這筆成本翻倍。
- 建議：
  ```diff
  -      if (/ of /.test(e)) { const it = itemName.call(this, e); if (it !== null) return it; }
  +      let itemTried = false;
  +      if (/ of /.test(e)) { itemTried = true; const it = itemName.call(this, e); if (it !== null) return it; }
  ...
  -      return itemName.call(this, e, depth);
  +      return itemTried ? null : itemName.call(this, e);
  ```
- 效益：含 " of " 的名稱，`itemName` 的呼叫次數減半。
- 風險：低。`itemName` 只有一個參數，傳入的 `depth` 本來就被忽略，所以可以安全拿掉。

**B3. `up()` 和 `exactOf` 在子串迴圈內重複計算（L206–207、L219）**
- 片段：
  ```js
  const up = (s) => s.replace(/\s+/g, " ").trim().toUpperCase();
  const exactOf = (self, kind, s) => self.exact?.get(up(`${kind}:${s}`)) ?? self.exact?.get(up(s)) ?? null;
  ```
- 問題：每次 `exactOf` 要做兩次 `up`（各含 replace、trim、toUpperCase），所以最壞情況每個子串有 2 次 Map 查找和 2 次字串正規化。同一個子串在不同 `len`／`i` 組合與不同呼叫之間還會重複查。
- 建議：對 `up` 加小型記憶，並讓 `exactOf` 的結果也快取（以 `self.exact` 為範圍）：
  ```diff
  +  const upMemo = new Map();
  +  const up = (s) => { let u = upMemo.get(s); if (u === undefined) { u = s.replace(/\s+/g, " ").trim().toUpperCase(); if (upMemo.size > 20000) upMemo.clear(); upMemo.set(s, u); } return u; };
  +  const exactMemo = new WeakMap(); // exact Map → Map<"kind\0s", value|null>
  +  const exactOf = (self, kind, s) => {
  +    const ex = self.exact; if (!ex) return null;
  +    let m = exactMemo.get(ex); if (!m) exactMemo.set(ex, m = new Map());
  +    const k = kind + "\0" + s; let v = m.get(k);
  +    if (v === undefined) { v = ex.get(up(`${kind}:${s}`)) ?? ex.get(up(s)) ?? null; m.set(k, v); }
  +    return v;
  +  };
  ```
- 效益：`itemName` 的子串掃描大部分變成單次 Map 查找。以 `WeakMap` 綁定 `exact`，字典替換後舊快取會跟著被回收，不需手動失效。
- 風險：低。

**B4. `itemName` 內的小正則（L215、L218、L223）**
- 片段：`/^(of|the)$/.test(words[i])` 在雙層迴圈中每次迭代都跑；L215 對每個詞各跑一次正則。
- 建議：
  ```diff
  +  const STOP = new Set(["of", "the"]);
  +  const WORD_OK = /^[A-Z][\w'’-]*$/;
  -    if (words.length < 2 || words.length > 8 || !words.every((w) => /^(of|the|[A-Z][\w'’-]*)$/.test(w))) return null;
  +    if (words.length < 2 || words.length > 8 || !words.every((w) => STOP.has(w) || WORD_OK.test(w))) return null;
  -      if (/^(of|the)$/.test(words[i])) continue;
  +      if (STOP.has(words[i])) continue;
  -      if (suf && !/^of /.test(suf)) continue;
  +      if (suf && !suf.startsWith("of ")) continue;
  ```
- 效益：V8 對字面正則已有編譯快取，所以單次節省很小，但這段在內層迴圈，累積有感。

**B5. `find` 每次呼叫都配置閉包、陣列與 `sep` 查找（L236–241、L257）**
- 問題：`part` 閉包、`sep` 查找、以及 L257 的 `[[re, glue], ...]` 巢狀陣列（含 3 個正則字面量）在每次進入 `find` 時都重新建立，連命中 `origFind` 的路徑也要付這個成本。
- 建議：
  ```diff
  +  const NUM_OF = /^([+-]?\d[\d.,]*%?) of (.+)$/;
  +  const LIST_RULES = [[/, (?:and )?/, "comma"], [/ and /, "and"], [/ or /, "or"]];
  ...
  -      const sep = LIST_SEP[currentLang] || LIST_SEP.default;
  -      const part = (s) => { const m = /^([+-]?\d...$/.exec(s.trim()); ... };
  +      // part 改為接收 (self, depth, s) 的模組函式，不再每次建閉包
  ...
  -      for (const [re, glue] of [[/, (?:and )?/, sep.comma], [/ and /, sep.and], [/ or /, sep.or]]) {
  +      const sep = LIST_SEP[currentLang] || LIST_SEP.default;  // 只在走到這裡才查
  +      for (const [re, g] of LIST_RULES) { const glue = sep[g];
  ```
- 效益：減少每次 `find` 的配置與 GC 壓力。搭配 B1 的記憶後，這項的重要性會降低。

## C. 備援路徑 simpleTranslate（L635–690）

只有 `GameTranslator` 載入失敗時才會走，所以優先度低。

- **C1. 樣板線性掃描（L678–686）**：每個含數字且前四種查法都失敗的字串，要對 `numPatterns` 逐個跑正則。可以在 `ensurePatternIndex` 建索引時，依樣板第一個字面前綴（如 `k.split(/[#*]/)[0]`）分桶，查詢時只掃同桶樣板。
- **C2. 數字正則重複編譯與重複掃描（L653、656、667）**：同一個 `/\d+(?:\.\d+)?/g` 字面量寫了三次。`nums` 取出後，`tHash` 和 `tStar` 可以共用一次掃描。可以提成一個常數 `NUM_RE`，並用同一次 `replace` 回呼同時產生兩種版本。
- **C3. `{n}` 回填重複（L658、663、669、674）**：四處複製貼上同樣的 `replace(/\{(\d+)\}/g, ...)`。可以抽成 `fill(tpl, nums)`，只是整理，沒有效能收益。

## 建議的實作順序（效益／風險比）

1. **B1**（`find` 結果記憶）：預期效益最大。要確認 `currentLang` 變更與 `useDict` 兩處都會清除。
2. **A4**（片段快取）和 **B3**（`up`／`exactOf` 記憶）：效益大、風險低。
3. **A1**（刪除重複的怪物名查詢）和 **B2**（`itemName` 防重複）：幾乎無風險，直接少做工。
4. **A3、A2、B4、B5**：小改動，順手做。
5. **A5**：解決週期性卡頓，可獨立進行。
6. **C 系列**：只有備援路徑受益，最後再說。

驗證建議：改完後跑 `verify/suite.cjs` 和 `helper/tests/selfcheck.cjs`，並用 `tests/live-harness` 對同一批字串比對修改前後的輸出，確認譯文完全一致。

這份分析不改檔，所以我沒有進入計畫檔與 ExitPlanMode 流程。如果你要我照上面的順序實作，告訴我要從哪幾項開始。