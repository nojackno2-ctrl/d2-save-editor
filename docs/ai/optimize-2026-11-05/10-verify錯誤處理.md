# verify錯誤處理（claude）

# verify/ 錯誤處理與失敗即停檢查（唯讀，未改任何檔案）

整體上「任一步失敗就停」的主幹是對的：auto 以子行程退出碼判斷，publish 在非 0 時丟例外。以下是我找到的漏洞。我只讀了程式碼，沒有實際執行；`language.json` 是否帶 `build` 欄位，我只確認了 `lib/language-audit.cjs` 第 43 行的回傳裡看得到 `baseline`，沒看到 `build`。

## 高風險：失敗後仍可能繼續發布

**1. `publish.cjs:142-147`：push 失敗後重跑，會跳過推送卻回報成功**
- 第一次 `git commit` 成功、`git push` 失敗並丟例外。
- 重跑時工作目錄已乾淨，`status --porcelain` 為空，只印「倉庫沒有變更，略過提交」，不會推送。
- 最後還印「完成」並以 0 結束，所以網頁版實際沒上線。
```diff
-  if (!run("git", ["status", "--porcelain"], P.web)) console.log("倉庫沒有變更，略過提交。");
-  else {
-    run("git", ["commit", "-m", msg], P.web);
-    console.log("已提交倉庫：" + msg);
-    if (!has("no-push")) { run("git", ["push", "origin", "HEAD"], P.web); console.log("已推送到 GitHub。"); }
-  }
+  if (!run("git", ["status", "--porcelain"], P.web)) console.log("倉庫沒有變更，略過提交。");
+  else { run("git", ["commit", "-m", msg], P.web); console.log("已提交倉庫：" + msg); }
+  if (!has("no-push")) {
+    const ahead = run("git", ["rev-list", "--count", "@{u}..HEAD"], P.web);
+    if (ahead !== "0") { run("git", ["push", "origin", "HEAD"], P.web); console.log("已推送到 GitHub。"); }
+  }
```

**2. `auto.cjs:19,54`：`git()` 吞掉失敗，把「git 壞了」當成「工作目錄乾淨」**
- `git` 執行失敗（找不到 git、不是倉庫、鎖檔）時，`stdout` 是空字串，於是 `dirty = []`。
- 這會繞過第 72 行「保護進行中工作」的閘門，直接進入發布。
```diff
-const git = (...a) => (spawnSync("git", a, { cwd: P.root, encoding: "utf8", windowsHide: true }).stdout || "").trim();
+const git = (...a) => {
+  const r = spawnSync("git", a, { cwd: P.root, encoding: "utf8", windowsHide: true });
+  if (r.error || r.status !== 0) throw new Error(`git ${a.join(" ")} 失敗：${r.error?.message || r.stderr}`);
+  return (r.stdout || "").trim();
+};
```

**3. `publish.cjs:136-140`：手動 `--confirm` 會把別人未完成的修改一起提交**
- 目前 `modifier/editor.html`、`helper/autobot.js`、`modifier/webapi.js`、`AI_HANDOFF.md` 等都有未提交修改，而且都在 `RELEASE_PATHS` 白名單內。
- 只有 `auto.cjs` 有 dirty 檢查。手動執行 publish 時，這些半成品會被 `git add` 進發布提交。
- 建議：在進入發布流程前記下白名單內已被修改的檔案，除了本腳本自己會改的（`editor/package.json`、`modifier/editor.html`、`site/index.html`、`version.json` 等）之外，有其他就中止。
```diff
+const preDirty = run("git", ["status", "--porcelain", "--untracked-files=no"], P.web).split(/\r?\n/).filter(Boolean).map((l) => l.slice(3));
+const SELF_TOUCHED = new Set(["editor/package.json", "modifier/editor.html", "site/index.html", "version.json", "verify/state.json"]);
+const foreign = preDirty.filter((f) => !SELF_TOUCHED.has(f) && !f.startsWith("docs/"));
+if (foreign.length && !has("allow-dirty")) { console.error("工作目錄有未提交修改，拒絕發布：" + foreign.join("、")); process.exit(1); }
```
這段要放在第 76 行 `confirm` 判斷之後、`bump()` 之前，因為 `bump()` 會自己改檔。

**4. `publish.cjs:39`：翻譯檢查沒核對版本**
- 第 42 行對 `live`、第 35 行對 `latest` 都核對了 `build`，只有 `language.json` 沒有。
- 如果它沒有 `build` 欄位，舊版的 `ok:true` 就能放行新版。
- `--auto` 也完全略過 `impact.json` 閘門（第 28 行），這是設計如此，但意味著自動模式下，這些報告的版本一致性只靠 `verify` 剛跑完來保證。
- 修法：先讓 `verify.cjs:86` 寫入 `{ ...lang, build }`，再在 publish 檢查 `translation.build !== verified.build`。

## 中風險：失敗被吞掉，或留下舊的「通過」紀錄

**5. `live-smoke.cjs:81`：抓不到遊戲版本時直接略過比對（fail-open）**
- `gameBuild` 為 null 時，整個版本不符檢查都不會執行，仍可能通過。
```diff
-    if (gameBuild && typeof gameBuild === "string" && gameBuild !== build) problems.push(`遊戲版本 ${gameBuild} 與驗證版本 ${build} 不同`);
+    if (typeof gameBuild !== "string") problems.push("讀不到實機遊戲版本，無法確認與驗證版本一致");
+    else if (gameBuild !== build) problems.push(`遊戲版本 ${gameBuild} 與驗證版本 ${build} 不同`);
```

**6. `live-smoke.cjs:73`：實機的 `console UNH/ERR`、`GONE`、`FAIL` 只存進 evidence，不影響結果**
```diff
     result.evidence.errors = log.split("\n").filter(...).slice(0, 20);
+    if (result.evidence.errors.length) problems.push(`實機日誌有 ${result.evidence.errors.length} 筆錯誤`);
```
這個改動要放在 `const problems = []` 之後。如果這些行常有無害雜訊，要先調整正規式，以免誤擋。

**7. `live-smoke.cjs:55,91,95`：例外時不寫 `live.json`，舊的通過紀錄仍留在磁碟上**
- 第 55 行 `log.txt` 不存在就會丟例外，跳過第 91 行的寫檔。
- 第 95 行只印錯誤並設 exit 2。
- 上一輪同版本、同指紋的 `ok:true` 會繼續讓 `publish.cjs:42` 放行。
- 另外 `child` 沒有 `error` 事件處理，啟動失敗會變成未處理例外。
```diff
-main().catch((e) => { console.error("實機煙霧測試錯誤：", e.message); process.exitCode = 2; });
+main().catch((e) => {
+  console.error("實機煙霧測試錯誤：", e.message); process.exitCode = 2;
+  try { writeJson(path.join(P.reports, "live.json"), { ok: false, build, at: new Date().toISOString(), error: e.message }); } catch {}
+});
```
同樣地，`verify.cjs:120` 崩潰時不會更新 `latest.json`，舊的 `ok:true` 一樣殘留：
```diff
-(flag("update") ? update() : quick()).catch((e) => { console.error("驗證腳本本身錯誤：", e); process.exitCode = 2; });
+(flag("update") ? update() : quick()).catch((e) => {
+  console.error("驗證腳本本身錯誤：", e); process.exitCode = 2;
+  try { report.ok = false; report.summary = "驗證腳本本身錯誤：" + (e?.message || e); writeJson(path.join(P.reports, "latest.json"), report); } catch {}
+});
```

**8. `verify.cjs:105-107`：`runTests` 丟例外時，自動改過的原始碼不會還原**
- 還原只發生在「有測試失敗」的分支（第 109-110 行）。
- 例如 `electron()` 在 `lib/runner.cjs:7` 找不到模組、或 `runAll` 中途丟例外，`applyNames` 的修改就留在工作目錄，直接落入第 120 行的 catch。
```diff
-let r = await runTests(selected);
+let r;
+try { r = await runTests(selected); }
+catch (e) { if (!flag("dry")) adapt.restore(backupDir); throw e; }
```

**9. `auto.cjs:77-87`：版本偵測就失敗（例如網路不通）時，沒有任何紀錄或通知**
- `latestBuild()` 丟例外時 `result.build` 還是 undefined。
- 第 80 行的條件不成立，所以不寫 `auto.json`、不寫 log、不發通知，只有 exit 1。
- 如果這是靠 AI 觸發而沒人盯 stderr，就等於靜默失敗。
```diff
-    if (result.build && (result.steps.length || result.error)) {
+    if (result.build || result.steps.length || result.error) {
-      const line = `- ${stamp()} 遊戲 ${result.build}：...
+      const line = `- ${stamp()} 遊戲 ${result.build ?? "（未取得版本）"}：...
```

**10. `auto.cjs:92`：`main()` 沒有 `.catch`**
- 第 44-46 行（`mkdirSync`、寫鎖檔）若失敗，會變成未處理的 rejection。
- 如果我沒記錯的話，Node ≥15 會以非 0 結束，但不會留下紀錄。
```diff
-main();
+main().catch((e) => { console.error("自動更新腳本本身錯誤：", e); process.exitCode = 2; });
```

## 低風險或需留意

- **`auto.cjs:45-46`**：鎖檔不是原子建立（先 `existsSync` 再 `writeFileSync`）。另一個實例偵測到鎖就回傳，結束碼是 0，容易被當成成功。建議改用 `fs.openSync(LOCK, "wx")`，被鎖住時設 `exitCode = 3`。鎖檔過期是 3 小時。
- **`auto.cjs:16-17`**：`spawnSync` 逾時或啟動失敗時，`r.error` 沒被放進輸出，只剩 `ok:false` 且 `out` 為空。建議把 `r.error?.message` 併入 `out`。
- **`lib/util.cjs:14,17`**：`readJson` 把「JSON 損毀」和「檔案不存在」都當成 fallback。
  - 損毀的 `impact.json` 會讓人工逐項填寫的佐證被悄悄丟棄（`verify.cjs:72`）。
  - `saveState` 在 `state.json` 損毀時會用 `{}` 覆寫其他欄位。
  - 建議：檔案存在但解析失敗時丟例外，只有 `ENOENT` 才回 fallback。
- **`lib/game.cjs:54-55`**：`entry` 為 null（HTML 解析不到入口腳本）時，快照仍標記為 `complete:true`。建議 `complete: failed.length === 0 && !!entry`。`hasSnapshot` 也只看旗標，不驗證檔案是否真的存在。
- **`lib/runner.cjs:16`**：逾時只 `child.kill()` 殺父行程。Windows 上 electron 子行程可能撐住 stdio，導致 `close` 一直不觸發。建議改用 `taskkill /T /F`。
- **`publish.cjs:118-120`**：`bump()` 和 `addChangelog()` 在 build 之前就改了檔，build 失敗不會回滾。第 52 行的 `pendingVersion` 邏輯讓重跑還算安全，但工作目錄會留下半成品。
- **`publish.cjs:139`**：`slice(3)` 對 rename 輸出（`a -> b`）取檔名會錯。因為是用白名單比對，結果只會更嚴格（拒絕發布），不會漏放。

## 建議的處理順序

1. 先修 #1、#2、#3，它們會造成真正的錯誤發布，或讓「已發布」的回報不實。
2. 接著修 #5、#7 和 `verify.cjs:120`，把 fail-open 與殘留的舊通過紀錄補上。
3. 其餘依序處理。

要我實際套用這些修改嗎？目前這個工作階段是唯讀的，要先退出計畫模式才能動手。