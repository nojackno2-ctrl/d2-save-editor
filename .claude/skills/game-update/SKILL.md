---
name: game-update
description: 使用者說「遊戲更新了」「官方更新」「驗收新版」時使用。先由 AI 讀官方更新訊息並反編譯比對新舊版差異，分析對工具包的影響；沒變動的部分用腳本快速測試；最後以實機驗證，通過並經使用者確認後才發布。
---

# 遊戲更新與工具包適配

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
