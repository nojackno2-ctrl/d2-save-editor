# 工具包自動驗證（verify）

目標：腳本自動完成可重複的檢查，AI 依官方更新內容分析、改良並驗證工具包。不得將腳本通過視為新版功能已完整適配。

## 全自動更新（2026-11-05 起，日常主流程）
官方幾乎每天更新，日常以「快速相容」為主。使用者說「遊戲更新了」時，AI 直接執行下列指令，全程自動（不使用排程）：

```bash
node verify/auto.cjs                      # 全自動：有新版才動作（--force 強制、--no-publish 只驗證）
node verify/live-smoke.cjs                # 單獨跑實機煙霧測試，寫入 reports/live.json
```

`auto.cjs` 流程：偵測官方新版 → `verify.cjs --update`（快照、自動換模組檔名、特徵碼與裝備資料庫檢查、回歸測試）→ `live-smoke.cjs`（Electron 隔離設定檔開官方 /play/，從本機臨時伺服器載入待發布工具包，確認進入遊戲、輔助器接上、語言掛上、修改器入口存在）→ 產生 `reports/new-content.md` → `publish.cjs --confirm --auto --no-desktop`。
- **新內容不自動做**：官方更新條目與新增未翻譯字串列在 `reports/new-content.md`，由使用者決定要不要加入；`--auto` 發布不以它們為阻擋條件。
- **安全閘**：任一步失敗即停止、不發布，Windows 通知並寫 `reports/auto-log.md`、`auto.json`、`ticket.json`；啟動時工作目錄有未提交修改也不發布（保護進行中的工作）。
- 自動發布只更新網頁版（書籤會自動取得）；桌面版 exe 需手動 `publish.cjs --confirm` 打包。
- 失敗時再請 AI 依 `.claude/skills/game-update/SKILL.md` 處理。

## 手動指令
```bash
node verify/verify.cjs --update      # 偵測新版→下載快照→比對、翻譯稽核與自動測試→供 AI 分析與適配
node verify/verify.cjs --quick       # 只跑既有測試（不上網）
node verify/publish.cjs              # 列出發布計畫（不執行）
node verify/publish.cjs --confirm    # 建置網頁版、打包桌面版、提交並推送 web 倉庫
node verify/selftest.cjs             # 驗證「驗證腳本自己會抓錯」
```

每次更新檢查都會產生影響與翻譯報告；程式依快照差異選擇測試。來源指紋涵蓋工具、測試與驗證規則，排除報告、備份與長跑輸出，確保實機證據可穩定綁定同一來源。工具包來源或驗證程式改變、缺乏可信快照，或使用 `--full` 時會執行全部已登記測試。發布確認會重新查官方最新 build，且以明確發布檔案清單暫存；清單外仍有變更時會停止提交。

選項：`--force` 版本沒變也重跑、`--dry` 不改原始碼、`--workers N`（預設 8、上限 16）、`--full`（含實機長流程，目前尚無項目）、`--build X` 指定快照版本。

每次更新先產生 `reports/impact.json`，列出官方新增更新內容及可能影響範圍；分類僅供線索。逐項分析、完成所需工具包改良並填入 `status: "已完成"` 與具體 `evidence` 後，重新驗證才可發布。沒有前版新聞時會列出全部新聞，避免漏項。

每次更新都使用快照中的官方語言字典與翻譯器檢查繁中翻譯，並比較官方 `changelog.json` 新聞；新增與全部未翻譯文字列於 `reports/language.json`。缺少前版資料時檢查全部現有文字。此檢查不自動翻譯，也不等於人工校對。

## 更新工作順序（以 `.agents/skills/game-update/SKILL.md` 為準）
1. AI 讀官方更新訊息 → 2. 反編譯比對新舊版差異（含官方沒提的）→ 3. 分析工具包（修改器／輔助器／語言）是否相符並修改 → 4. 沒變動的部分以本目錄腳本快速回歸 → 5. 隔離環境實機驗證官方網址 → 6. 使用者確認後發布。腳本是第 1、4 步的工具，不取代 AI 判斷。

## 腳本流程
1. `lib/game.cjs`：讀 `/changelog.json` 取最新版；完整下載 `/play/` 的所有 JS／CSS 到 `game-bundles/<版本>/`（全部保留，不進 git）。
2. `lib/compare.cjs`：先以實際檔案雜湊比對前次驗證的快照，記錄模組變更、執行與略過的測試。已知遊戲核心、物品與選卡模組僅執行相關測試；只有樣式或完全未變則不執行測試。缺少可信快照、遇到其他程式模組變動或工具包來源變更時執行全部測試。
3. `lib/adapt.cjs`：用快照檢查工具包掛鉤點（autobot 的 4 項 Game 特徵、輔助器呼叫的 Game 方法、技能表、選卡函式、修改器特徵碼）；自動換掉寫死的 `itemArt-／saveTransfer-` 檔名；全過後才更新 `TESTED_GAME_BUILD`。
4. `lib/runner.cjs`＋`suite.cjs`：並行跑測試登記表（獨立子行程、失敗自動重試一次，並保留第一次的退出碼、耗時與輸出尾段）。過時測試在 suite.cjs 標 `stale` 並寫明原因。
5. 驗證失敗時還原自動適配的修改並產生故障單；AI 應主動調查與修復，不呼叫本地 AI。
6. 自動測試通過後記錄 `state.json`、存 `backups/code/lastgood/`，這不代表適配完成。AI 逐項分析並處理更新、翻譯及測試結果，以隔離設定檔驗證真實遊戲載入；上述條件皆完成後，執行 `publish.cjs --confirm`；載入結果寫入 `reports/live.json` 並綁定版本與來源指紋。發布時自動依比對結果寫入工具內及公告站更新日誌。只做比對而未測試時不更新已驗證版本。

自動檢查通過不代表真實遊戲功能已完成驗收。

失敗時故障單在 `reports/ticket.json`；最近一次結果在 `reports/latest.json`。

## 尚未做（誠實記錄）
- 並行「每個測試一份全新存檔、由修改器造檔」的實機整合測試（目前整合測試仍是既有的隔離 Electron 假後端）。
- 在真實 Chromium 載入本機快照、實際 import Game／itemArt／saveTransfer 模組（目前是靜態特徵檢查）。
- `publish.cjs --confirm` 只驗證過「列出計畫」，打包與推送尚未實際執行過。
- Cloudflare 公告網站已連 GitHub 自動建置；尚待確認後台「組建組態」的部署命令指向 site/，並確認第一次建置成功。
