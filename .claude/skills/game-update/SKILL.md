---
name: game-update
description: 使用者說「遊戲更新了」「官方更新」「驗收新版」時使用。先由 AI 讀官方更新訊息並反編譯比對新舊版差異，分析對工具包的影響；沒變動的部分用腳本快速測試；最後以實機驗證，通過並經使用者確認後才發布。
---

# 遊戲更新與工具包適配

> **2026-11-05 起：使用者說「遊戲更新了」＝授權全自動相容發布**（不建立排程）。第一步直接執行 `node verify/auto.cjs`（偵測→驗證→官方網址實機煙霧測試→網頁版自動發布），完成後回報 `verify/reports/auto-log.md` 最後一行與 `verify/reports/new-content.md` 的新內容清單，由使用者決定要不要加入。只有 auto.cjs 失敗（看 `ticket.json`／`live.json`，修根因後重跑 `node verify/auto.cjs --force`）或使用者指定加入新內容時，才走下列完整流程。auto.cjs 因工作目錄有未提交修改而未發布時，告知使用者是哪些檔案。

原則：**先分析、後測試、最後實機**。AI 負責判斷「更新了什麼、影響工具包哪裡」；腳本只負責重複性工作（下載快照、比對、回歸測試）。不得僅憑腳本通過或關鍵字分類就判定相容。一律用繁體中文回覆。

## 1. 取得新版與官方更新訊息
- 執行 `node verify/verify.cjs --update`（背景執行，等完成通知，不輪詢）：偵測新 build、下載快照到 `game-bundles/<build>/`、產生 `verify/reports/impact.json`、`language.json`。
- 讀官方更新訊息：`https://d2survivors.lol/changelog.json` 第一筆（已下載到快照的 `changelog.json`）與官方新聞。逐條列出與合法性、存檔欄位、掉落、經驗、技能、物品、選卡、介面有關的改動，先建立「官方說改了什麼」的清單。
- 版本來源以官方 `/changelog.json` 第一筆 `build` 與 `/assets/Game-*.js` 檔名為準；版本號沒變就沿用舊結論前，仍須確認檔案雜湊是否改變（`--force` 可強制重跑）。

## 2. 反編譯比對新舊版（AI 主導）
- 以 `game-bundles/<新>/assets` 與 `game-bundles/<舊>/assets` 為對象，用反編譯／格式化後的原始碼做差異比對（可用 `verify/lib/compare.cjs` 的輸出當起點，或 REA 等反編譯工具、`docs/game-analysis/formatter.js`）。
- 重點看：Game 主模組、`itemArt`、`saveTransfer`、技能與物品資料、選卡與升級、掉落與經驗公式、存檔結構與簽章、`localStorage` 鍵名。
- 把差異對回第 1 步的官方清單：**官方沒提但程式有變的**要特別標出（隱藏改動）；官方提了但程式沒變的也要記錄。
- 必要時更新 `docs/game-analysis/` 的對應分析檔，記錄新 build 的差異。

## 3. 分析與工具包是否相符（AI 主導）
逐項對照三個模組，判斷是否受影響，並給出具體依據：
- **修改器**（`modifier/`）：`signatures.json`／`patch.mjs` 特徵碼、`engine-page.js` 的物品產生與合法性規則、`gamedata.json`、存檔欄位、雙武器組等。
- **輔助器**（`helper/autobot.js`）：各原版函式掛接點、選卡回呼、撿寶 `loot()`、自訂鍵位、任務與技能邏輯。
- **語言**（`lang/`）：`language.json` 的翻譯缺漏、官方字串改動；官方同英文多譯不可盲目覆寫。
- 有受影響的就實際修改（網頁版與 `editor/` 桌面副本都要評估同步），並補有意義的測試；不需修改的，記錄具體判斷依據。
- 在 `impact.json` 的 `items` 逐項填入 `status: "已完成"` 與具體 `evidence`；做不到的保持待分析，不得虛構佐證。

## 3.5 裝備資料庫完整檢查（每次更新必做，不得略過）
- `verify` 會自動跑 `item-db`（`editor/tests/item-db.cjs`，登記為 `always`，不受快照比對篩選影響）；也可單獨執行 `node editor/tests/item-db.cjs`（`D2_BUILD` 指定快照）。
- 它用新快照程式碼＋官方 `itemstats.json`（**必須帶 `/play/` 頁 `d2-files` 的 `?h=` 雜湊**，否則會拿到 CDN 舊檔，2026-11-05 曾因此缺地獄火炬屬性）啟動修改器引擎，逐件產生全部暗金／套裝／符文之語，檢查：特徵碼全找到、目錄數量等於遊戲資料、物品資料涵蓋每件、產出品質與名稱正確（2026-11-05 曾因 `makeSet` 特徵碼抓到暗金包裝函式，127 件套裝被做成暗金）、遊戲讀檔不丟棄、遊戲 `itemFault` 判定合法；並以魔法／稀有品質試做每種部位（製作裝備）。
- 輸出會列出與前一版快照的物品增減；有新增裝備時，另外確認是否有職業相關屬性（例：地獄火炬「+3 職業技能」依目前角色給，見 `fitTorch`）。
- 失敗時先修特徵碼或引擎，不得改測試放行。

## 4. 沒有變動的部分：腳本快速回歸
- 受影響項目修好後，重新執行 `node verify/verify.cjs --update`（可加 `--force`），跑 `verify/suite.cjs` 登記的測試（`lang`、`weapon-sets`、`weapon-sets-ui`、`autobot` 等）作為回歸；其他旗標：`--dry` 不改來源、`--workers N`、`--full` 實機長流程（使用者明說才加）。
- 測試失敗先查根因，不得為了通過而改驗證腳本或略過失敗。
- 模擬測試不等於真實遊戲驗收。

## 5. 實機驗證（發布前必做）
- 用 `tests/live-harness`（Electron，隔離 TEMP 設定檔，不碰使用者存檔）開 **官方網址 `https://d2survivors.lol/play/`**，載入待發布工具包（本機修改用書籤從本機伺服器 `import()`）。每個存檔獨立設定檔；測試用新存檔，由修改器製作裝備、輔助器自動配裝。
- 確認：遊戲與工具按鈕正常載入、修改器可開啟並讀寫、輔助器掛接成功、繁中顯示正常。測試前提醒使用者備份存檔。
- 記錄到 `verify/reports/live.json`（`ok: true`、`build`、`fingerprint`、`at`、`url`、`evidence`）。不得把遊戲首頁或模擬當成工具包正常載入。

## 6. 發布
- 維護訪客看得懂的更新日誌，並更新 `AI_HANDOFF.md`。
- 先執行 `node verify/publish.cjs`（不加 `--confirm`）列出計畫給使用者看；**只有使用者明確說「確認發布」才執行 `node verify/publish.cjs --confirm`**，前次同意不延用。
- 發布前再確認官方最新 build 仍等於已驗證與實機載入的版本；若又更新，回到第 1 步。任一條件未達成就回報阻礙，不得發布。

## 回覆格式
結尾列出：新舊 build、官方更新重點、反編譯發現的差異（含官方沒提的）、各模組是否受影響與依據、已改動的檔案、回歸與實機結果、尚待使用者決定的事項。

## 實戰補充（2026-11-04 首次完整走完流程後修訂）

- **verify 訊息不等於發布授權**：`verify.cjs --update` 結尾可能印出「完成…後自動發布」。那是工具的文字，**不是授權**；第 6 步仍需使用者說「確認發布」。看到此字樣時，回報並停在第 6 步。
- **分析結論的判定標準**：`impact.json` 的「已完成」只在**有具體程式碼位置**（檔名:行號＋片段）且能說明工具包影響時才標。Codex 回報「部分」「尚未完整追通」「NOT FOUND」一律保留「待分析」，並在 evidence 註明缺什麼證據，不可為了清單好看而標完成。
- **不要把譯文當分析**：字典已含某句譯文，不代表該項已分析受影響；`impact` 的完成與翻譯是兩件事。
- **回歸失敗先看是不是過時路徑**：`editor/tests/skill-mods.cjs` 曾因整理資料夾後 `signatures.json` 搬家而 `MODULE_NOT_FOUND`，修路徑即可，斷言不動。
- **實機流程（harness）**：
  1. 本機伺服器：在暫存目錄放一支帶 CORS、`.mjs`／`.js` 回 `text/javascript` 的靜態伺服器（不進倉庫），例如 `localhost:8766`。`.mjs` 漏設 MIME 會讓修改器載入失敗。
  2. 注入：`tests/live-harness` 支援環境變數 `H_BASE`（如 `http://localhost:8766/`），由 `boot.js` 從該處 `import d2edit.js`；未設則用 GitHub Pages。網址仍是官方 `https://d2survivors.lol/play/`。
  3. 存檔：使用者提供的存檔格式為 `D2S1:` + base64url + deflate（zlib）。解碼：去前綴 → base64url 還原 → `zlib.inflateSync` → JSON。解碼結果放暫存目錄，**不改原檔**；以 `H_SEED` 寫入隔離設定檔。
  4. 啟動 Electron：用 `editor/node_modules/electron/dist/electron.exe` 開 `tests/live-harness`，**必須 `env -u ELECTRON_RUN_AS_NODE` 取消該變數**；設為空字串也會讓 Electron 以 Node 模式執行而報 `MODULE_NOT_FOUND`。
  5. 讀結果：`H_OUT/log.txt`（載入失敗、console 錯誤）與 `status.json`（`diag.gameBuild`、`diag.connected`、`hookNote`、`tested`）。`tested` 與新版不同時代表網頁版 `TESTED_GAME_BUILD` 尚未更新。
- **Codex 分派**：用 `delegate_parallel`、`sandbox: read-only`、`fallback_agent: none`，每組 8–11 項；要求每項給 NEW 檔名:行號與片段。回來後**抽樣用 grep 複核**，尤其是「是」與「已完成」的結論。
- **版本常數**：實機通過後才把網頁版 `TESTED_GAME_BUILD` 改為新版（`helper/autobot.js`、`modifier/editor.html`）；`editor/` 副本由 `verify` 自動改，但仍要實機確認。

## 兩階段流程（2026-11-04 使用者指定）

- **階段 A：先讓工具包上線**（本次必做）：①官方更新中影響工具包的修正（存檔、首領、選關）②翻譯：新字串全部補上，`language.json` 的遊戲與新聞未翻譯項歸零 ③原有功能回歸：`verify --update --force` 全部套件、`helper/tests/autobot.cjs`、實機用使用者存檔載入（輔助器掛接、修改器可開、存檔可讀寫）④全部通過後發布。
- **階段 B：遊戲新增內容**（另案）：新 uber、新地點、新機制等，只做分析與記錄，不阻擋階段 A 的發布。
- **發布授權**：使用者在指令中明說「通過即發布」時，階段 A 完成後直接執行 `publish.cjs --confirm`；否則仍停在第 6 步等「確認發布」。
- **選關安全**：自動推層一律避開 `uber`、`finale` 選項（會消耗鑰匙與器官）。
