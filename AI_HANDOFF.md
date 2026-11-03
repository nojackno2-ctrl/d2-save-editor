# 交接紀錄

> 2026-11-03 由 Claude Code 精簡：原 409 行完整紀錄原文封存於 `docs/handoff-history.md`（未改寫），細節、指令與佐證請查該檔。本檔只留目前狀態、規則、待辦與近期紀錄，維持約 200 行內。

## 專案概況
- 靜態網頁工具包（JavaScript，無 Rust）：`d2edit.js` 書籤入口 → 載入 `lang.js`（遊戲內繁中）、`autobot.js`（輔助器）、`engine-page.js`（物品引擎）、`editor.html`（修改器）；字典 `zh-TW.json`（13907 筆，網頁／桌面共用）。
- 發布：GitHub Pages（main）；公告站 `site/` 由 Cloudflare 自動抓 GitHub 部署（`wrangler.jsonc`），不需 API Token。
- 桌面版來源在本儲存庫外的 `../editor/`，網頁檔案變更需同步過去（本雲端工作階段無法存取）。
- 遊戲目前驗證版本：`TESTED_GAME_BUILD = "20261102.2"`（`autobot.js`、`editor.html`）。

## 長期規則（使用者要求）
- **遊戲更新後全部重新驗證**（2026-11-01）：不可沿用舊版結論。版本來源為官方 `/changelog.json` 第一筆 `build` 與 `/assets/Game-*.js` 檔名；需重驗修改器 `signatures.json`／`patch.mjs` 特徵、物品產生與原版規則、輔助器各原版函式掛接；官方 changelog 中與合法性、存檔欄位、掉落、經驗有關的改動優先核對。
- **子代理成果需整合回倉庫**（2026-11-01）：遊戲分析放 `docs/game-analysis/`；實機測試用 GitHub 連結（推送後以 `tests/live-harness/reload-gh.cjs` 重載）。
- **測試以最新版網頁為主**（2026-11-02）：不再驗證舊版；版本不符只提示、不封鎖（舊封鎖紀錄已過時）。
- **實機只用隔離 TEMP 測試設定檔**，不碰使用者存檔。
- post-commit hook 會自動推送；未獲授權推送時以單次 Git 設定停用 hooks。
- `.wrangler/` 為既有未追蹤資料，勿清理。

## 測試指令
- Node：`node tests/test_lang.cjs`、`node tests/craft-limits.cjs`、`node tests/weapon-sets.cjs`。
- Electron（隔離設定檔）：`electron tests/autobot.cjs`（目前 170 項）、`tests/weapon-sets-ui.cjs`、`tests/craft-diagnostic-ui.cjs`；Linux 無頭需 `xvfb-run -a electron --no-sandbox`。
- 需儲存庫外資料：`tests/craft-affix-audit.cjs`、`craft-affix-composite.cjs`、`craft-companion-ui.cjs`（讀 `../裝備屬性分析/魔法稀有詞綴.json`）；`tests/version-gate-web.cjs`（需新舊版目錄與 itemstats.json）。

## 進行中／未完成
1. **實機長跑未驗收**：輔助器普通一至五幕連續至地獄、營地自動開局與商店完整串接、赫拉迪克法典技能變體與任務目標鎖定（Antigravity 2026-11-02 列出）。
2. **「尋找凱恩」任務**：舊批次存檔任務均 0／6（Claude 2026-11-02），之後未見確認修正紀錄，需實機核對。
3. **翻譯核對**：55 個屬性樣板無精確官方對應、舊版物品清單未人工核對；官方同英文多譯 21 筆不可盲目覆寫（Codex 2026-11-03）。
4. **手機暫停選單無法點擊**：已限制選卡須在 levelUp 且 frontend 關閉，但是否為根因未證實，未於真實手機重現（Codex 2026-11-03）。
5. **桌面版**：多項網頁變更已同步來源，但未重新封裝或發布執行檔。
6. **修改功能舊待辦（Codex 2026-11-02 模擬發現）**——後續 Antigravity 紀錄稱已修一擊必殺累乘與怪物複製溢位，其餘未見逐項確認，需核對後標記：
   - 一擊必殺倍率累乘；怪物 10 倍超過 800 上限與 spawnRate 重複乘（功能已改為「怪物數量最大化」）。
   - 作弊總開關／子開關關閉後不還原倍率、數值、函式（「全部關閉」已還原金幣倍率，已寫入遊戲的修改可能持續至重新開始）。
   - 金幣保護觸發後還原；`world.gold` 若為函式會被覆寫。
   - 技能滿級找不到資料時預設 99。
   - 無限重抽欄位 `ranks.Reroll` 與編輯器 `ranks.rerolls` 不一致。
   - 網頁版寫入存檔前未自動備份，與確認對話框說明不符。

## 已解決摘要
- 2026-10-31～11-01：修改器原版規則限制（`validateItems`、`statRanges`、`affixSlots` 前後綴分欄）、中英雙語、手機版面；輔助器建立（戰鬥輔助／自動戰鬥分頁、全圖走位、排行榜學習、任務交付）；v1.0.1 發布。
- 2026-11-02：遊戲 20261102.1 適配（雙武器組修改器與輔助器、新版選卡回呼與自訂鍵位、職業專屬符文之語、574 筆物品生成檢查）；遊戲內語言模組 `lang.js`；遊戲修改分頁（總開關、無敵、暴擊、一擊必殺、技能 99、怪物最大化、全精英、無限重抽、金幣 90 億保護）；專案改名「D2倖存者工具包」。
- 2026-11-03：製作裝備（裝備分類、前後綴分開範圍、複合詞綴自動配套與同欄顯示、輸出設定診斷；708 筆詞綴稽核 0 失敗）；輔助器「全部關閉」、獨立停止自動戰鬥、全圖吸金幣、撿寶依原版 `loot()`、選卡加速；繁中字典統一為 `zh-TW.json` 並比對 D2R 官方字串；公告頁改寫；Cloudflare 改自動部署。
- 已過時：版本不符封鎖、手動 Cloudflare 部署、30 級選卡暫定門檻、`TESTED_GAME_BUILD` 待調高（已為 20261102.2）。

## 近期紀錄
- 2026-11-03｜Claude Code｜PR #3 的 Cloudflare 預覽建置失敗：非 main 分支會執行 `npx wrangler preview`，設定缺 `previews` 區塊。已在 `wrangler.jsonc` 加入 `"previews": {}`；wrangler 4.156.2 原始碼 `ensurePreviewsConfig` 確認有此鍵就放行，`wrangler deploy --dry-run` 仍正常讀取 site/ 10 個檔案。本機沒有 Cloudflare 憑證，無法實際執行 preview，需以 PR 重新建置確認。
- 2026-11-03｜Claude Code｜**專案最佳化**（使用者要求「最佳化專案」，選定四項）：
  - 輔助器 `autobot.js`：每 200 毫秒的介面迴圈原本無條件寫入按鈕文字與 `style.display`，且狀態列以未翻譯字串比對已翻譯內容（英文介面時每次都重寫），持續觸發 `lang.js` 的 MutationObserver；改為 `setText`／`setDisplay` 只在值不同時寫入，面板狀態文字同樣處理。`visible()` 只取一次 `getComputedStyle`。
  - 語言模組 `lang.js`：`cleanCJK` 正規式預先編譯，CJK 間空格改用前瞻單次取代（取代 while 迴圈重複掃描）；20 萬筆隨機字串與舊實作輸出完全一致，長字串 2 萬次 506→278 毫秒。缺漏翻譯清單 `missing` 上限 5000 筆，避免長時間遊玩記憶體無限成長。語言按鈕 300 毫秒輪詢改為差異寫入。
  - 修改器入口 `d2edit.js`：`sync` 改為差異寫入 `style.display`。
  - 字典 `zh-TW.json`：分析後**不修改**。13907 筆中僅 1 筆鍵值相同、25 筆大小寫重複；壓縮成單行 gzip 只省 3KB（326→323KB），卻會讓所有代理的字典 diff 無法閱讀；網頁與語言模組已共用同一個下載 Promise，無重複下載。
  - 交接文件：原 409 行／98KB 精簡至本檔，原文封存 `docs/handoff-history.md`（以 diff 確認與原文一致）。
  - 驗證：`node --check` autobot.js／lang.js／d2edit.js；`node tests/test_lang.cjs`、`craft-limits.cjs`、`weapon-sets.cjs` 通過；Electron 33（xvfb）`tests/autobot.cjs` 170 項通過 0 失敗、`weapon-sets-ui.cjs`、`craft-diagnostic-ui.cjs` 通過；`git diff --check` 通過。需外部資料的 4 項測試未能執行。**未於真實遊戲實測**，未同步桌面 `../editor/`，未推送。
- 2026-11-03｜Claude Code：Cloudflare 公告站改由 GitHub 自動部署；公告頁改寫 `8444277` 已經 PR #2 合入 main（`4872e95`）。
- 2026-11-03｜Codex：繁中字典統一、官方新聞翻譯、四種元素抗性名稱修正、手機選卡競態限制、選卡加速、全圖吸金幣、撿寶面板精簡；已提交並推送 `40d6cb9`，GitHub Pages 部署成功。
