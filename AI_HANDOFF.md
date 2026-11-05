# 交接紀錄

> 2026-11-03 由 Claude Code 精簡：本檔只留目前狀態、規則、待辦與近期紀錄；舊紀錄已封存到 `docs/ai/`（見檔尾索引）。2026-11-04 再清掉過時內容。

## 專案概況
- 靜態網頁工具包（JavaScript，無 Rust）：`d2edit.js` 書籤入口 → 載入 `lang/lang.js`（遊戲內繁中）、`helper/autobot.js`（輔助器）、`modifier/engine-page.js`（物品引擎）、`modifier/editor.html`（修改器）；字典 `lang/zh-TW.json`（13907 筆，網頁／桌面共用）。
- 發布：GitHub Pages（main）；公告站 `site/` 由 Cloudflare 自動抓 GitHub 部署（`wrangler.jsonc`），不需 API Token。
- 桌面版來源在本儲存庫的 `editor/`（已整併進倉庫）；它與網頁版資料夾的同名檔案是兩份獨立副本、內容已有漂移，改網頁版檔案後需評估是否同步過去。
- 遊戲目前驗證版本：`TESTED_GAME_BUILD = "20261104.2"`（`helper/autobot.js`、`modifier/editor.html`、`editor/` 三檔，2026-11-05 實機確認後更新）；`verify/state.json` 最後驗證 build 同為 20261104.2（比對前版 20261104.1，快照不完整，`comparison.complete=false`）。

## 反覆發生的問題（必讀，2026-11-05 由全部對話紀錄整理）
使用者在不同對話中重複糾正過下列事項，接手前先看：
1. **一律繁體中文**：回覆、交接、更新日誌、程式內訊息都用繁中（曾被要求 4 次以上）。
2. **「完成」前必須實機驗證**：只跑 Node 測試、字典模擬、harness 腳本不算完成（「我要你自己實機驗證」「遊戲修改必須要實機測試」「都用網頁實測」）。實機＝官方 `https://d2survivors.lol/play/`；回報時寫明「實機驗了什麼、哪些沒驗」，不可把未驗證說成已修好。
3. **用使用者回報的原始輸入重現**：使用者貼的診斷資訊、截圖、手機實測結果是驗收標準。曾因只測一種字串形式而「修好」兩次仍出錯（見下方翻譯規則）。
4. **自己測完、修完，不要一直問**（「你自己把所有東西測試完並且修復，不要一直問我」）。只有發布前、刪除使用者資料、規則互相衝突時才問。
5. **每次發布都要寫更新日誌並推上公告站**；日誌寫給玩家看「工具包更新了什麼」，不是寫 AI 做了什麼。版本號隨發布自動更新。
6. **合法性以「這款遊戲」的資料庫為準**：正常打到的裝備不得被判不合法；不需要在說明中強調「與原版暗黑2不同」。
7. **修改器一鍵解鎖收藏庫**：遊戲新增裝備後要重抓清單，數量要與遊戲內收藏庫一致（曾出現遊戲 676／修改器 576／解鎖後 703）；有職業技能的物品（如地獄火炬）依當前角色職業給屬性。
8. **輔助器行為**：追王／撿裝／前往目標優先於閃避（閃避不可越閃越遠、不可擋住進傳送門、面對精英不可一直逃）；傷害不痛不癢就不閃；每次升級一定要選技能；護符看屬性是否符合職業；腰帶全放藥水（遊戲沒有魔力藥水）；回營地優先交任務。
9. **開關狀態要一致**：載入時顯示的開關狀態必須等於實際狀態（曾出現載入時顯示開、點進去是關）；戰鬥輔助由輔助器內開關控制，不用快捷鍵。
10. **製作裝備用下拉選單**，不要讓人輸入屬性代碼；新增屬性預設最大值；所有頁面的數值上下限共用同一份資料庫。
11. **背景任務做完要關**，並告訴使用者還有什麼在跑（使用者曾問「背景執行什麼」「關掉」）。
12. **額度不足時**改派 Codex／Agy 子代理做，子代理成果要整合回倉庫並由自己核對。

## 長期規則（使用者要求）
- **遊戲更新後全部重新驗證**（2026-11-01）：不可沿用舊版結論。版本來源為官方 `/changelog.json` 第一筆 `build` 與 `/assets/Game-*.js` 檔名；需重驗修改器 `signatures.json`／`patch.mjs` 特徵、物品產生與原版規則、輔助器各原版函式掛接；官方 changelog 中與合法性、存檔欄位、掉落、經驗有關的改動優先核對。
- **子代理成果需整合回倉庫**（2026-11-01）：遊戲分析放 `docs/game-analysis/`；實機測試用 GitHub 連結（推送後以 `tests/live-harness/reload-gh.cjs` 重載）。
- **測試以最新版網頁為主**（2026-11-02）：不再驗證舊版；版本不符只提示、不封鎖。
- **實機只用隔離 TEMP 測試設定檔**，不碰使用者存檔。
- post-commit hook 會自動推送；未獲授權推送時以單次 Git 設定停用 hooks。
- `.wrangler/` 為既有未追蹤資料，勿清理。
- **實機測試一律用網頁版官方網址 `https://d2survivors.lol/play/`**（使用者要求，2026-11-04）：不再用本地伺服器或 `game-bundles/` 快照開遊戲（快照會轉址到不存在的 `setup.html`，無法執行）。遊戲有單分頁鎖，同瀏覽器環境若已開著別的 D2 Survivors 分頁會顯示「D2 Survivors is open in another tab」，需先關掉其他分頁（勿代關非自己開的分頁）。要測尚未發布的本地修改，書籤改從本機伺服器 `import()`；載入工具書籤的遊戲頁成績不會上傳排行榜。測試前提醒使用者備份存檔。
  - **做法：用 `tests/live-harness`（Electron）開官方網址**，每個存檔一個獨立設定檔，可同時開多個職業：`powershell -File tests/live-harness/launch.ps1 -Classes sorceress,amazon -Copies 1`。不要用內建瀏覽器窗格：它只有一個共用設定檔，遊戲以 Web Locks `d2-survivors/play` 限制單分頁，鎖常被窗格外的頁面佔住而顯示「open in another tab」（2026-11-04 實測，關閉重開窗格也無效）。2026-11-04 啟動 sorceress 確認遊戲與工具按鈕正常載入，但 `boot.js` 選職業步驟報錯 `Cannot read properties of undefined (reading 'id')`，尚未修。
- **多個存檔同時測試必須互相隔離**（使用者要求，2026-11-04）：同時測多個存檔時，每個存檔用獨立的瀏覽器設定檔／環境（獨立的 localStorage、IndexedDB 與分頁），不可共用同一個瀏覽器環境，避免存檔互相覆蓋或汙染；遊戲有單分頁鎖，同環境也開不了第二個分頁。存檔需在隔離環境內匯入，並先備份原存檔，不碰使用者的真實存檔。具體隔離做法（獨立設定檔或隔離容器）尚未實作驗證，下次實測時先確認。
- **（2026-11-04 晚起被下一條取代：一般實機改用使用者提供的 D2S1 存檔副本，隔離暫存、不改原檔；需要「完整裝備池測自動配裝」時才用下面的新存檔流程）**
- **測試一律開新存檔，並用修改器解鎖／製作所有裝備，由輔助器的自動配裝自己把裝備穿上**（使用者要求，2026-11-04）：實測不使用既有存檔；每次測試在隔離環境建立全新存檔，再以存檔修改器（「裝備庫」需先開「解除修改限制」）取得全部裝備放入倉庫／背包，讓輔助器的自動配裝（換裝）流程自行挑選並穿戴，不手動替角色穿裝。目的是驗證自動配裝在完整裝備池下的行為。此流程尚未實作驗證，下次實測時先確認步驟並補上測試結果。

- **翻譯名稱顯示要對齊原版暗黑破壞神繁中，且一定要實機驗證整串原字串**（使用者要求，2026-11-05；曾連續出錯兩次）：
  - 規則：魔法物品字尾（of …）移到最前（`八目鰻之戒指`、`精密之鎖鍊靴`）；怪物稱號、稀有名稱維持原順序直接相接（`石塊蛆蟲巫異`、`妖鬼饗宴「號哭者」`、`兇殘扣環`）；冠軍／唯一怪屬性列每項之間一個空格（`惡魔 魔法抗性 冰寒強化`）。名稱中不得出現「-」「·」或殘留英文。
  - 坑一：遊戲傳來的字串有兩種形式，**以「 - 」分段**與**以空白串成整串**（`Game-*.js` 的 `ix()`：`traits.map(H).join(" ")`，唯一怪名同理）。兩種都要測，只測一種會漏。
  - 坑二：點陣字型會把「·」畫成「-」；中文間的一般空白會被 `cleanCJK` 刪掉，需要空格時用不換行空白 U+00A0。
  - 坑三：`composeFind` 要等工具包抓到遊戲物件（`__d2lang.debug().gameHooked === true`）才掛上；只注入 `lang.js` 或停在選檔頁時測到的是舊行為。要從 `d2edit.js` 完整載入、進入遊戲後再測。
  - 坑四：物品規則的「底材」不能以 of／the 開頭；萬用樣板（`* of *`）會照英文順序翻，含 of 的整串要先套物品規則。
  - 驗收：用截圖或使用者回報中的實際英文原字串（兩種串法都要），在官方 /play 頁面內呼叫 `__d2lang.translate` 逐一比對；只跑字典模擬或 `test_lang` 不算通過。

- **遊戲更新全自動化**（使用者要求，2026-11-05）：官方幾乎每天更新，以「快速相容」為主、完全自動；新內容由使用者決定是否加入。做法：**不建立排程**（使用者要求）；使用者說「遊戲更新了」即授權，AI 執行 `node verify/auto.cjs`：偵測新版→`verify.cjs --update`→`verify/live-smoke.cjs`（官方網址實機煙霧測試，自動寫 `live.json`）→`publish.cjs --confirm --auto --no-desktop`。失敗即停不發布並通知；啟動時工作目錄有未提交修改也不發布。結果看 `verify/reports/auto-log.md`，新內容看 `verify/reports/new-content.md`。此授權僅涵蓋「相容發布」；加入新功能仍需使用者指示。

## 資料夾結構（2026-11-04 起）
- 根目錄只放共用檔：`d2edit.js`（書籤入口，網址不可變）、`index.html`（轉址到 `site/install.html`）、`version.json`、README、LICENSE、`wrangler.jsonc`、本檔。
- **唯一來源（2026-11-05 第二階段起）**：網頁版的程式與資料都在根目錄對應資料夾，沒有副本。`helper/`＝輔助器；`lang/`＝語言（字典 `lang/zh-TW.json`、`lang/locales/`、`lang/tools/` 語言注入工具）；`modifier/`＝存檔修改器（頁面 `modifier/editor.html`、引擎 `modifier/patch.mjs`／`signatures.json`／`engine-page.js`）；`site/`＝網站（公告站＋安裝頁範本 `site/install.template.html`）。
- `tools/build-web.js`＝只產生輸出（`site/install.html`、根目錄 `index.html` 轉址、`version.json`、`.nojekyll`），不複製檔案；版號要求 `editor/package.json` 與 `modifier/editor.html` 的 `TOOLKIT_VERSION` 一致。
- `editor/`＝**桌面啟動器**（`main.js`、`preload.js`、`core.js` 存檔讀寫、`engine.js` 物品引擎、`remote.js` 從 GitHub 抓取資源）與 `package.json`（版號）。啟動器的介面與引擎資源都從網站載入，只有啟動器程式本身改動時才需要重建 exe（`npm run dist`，或 `verify/publish.cjs --desktop`）。
- `tests/live-harness/`、`verify/`、`docs/`、`game-bundles/<版本>/` 為跨模組。
- `backups/`（不進 Git）：`exe/`、`code/`（含 `lastgood/`）、`saves/`、`archive/`。桌面版執行時的存檔備份在執行檔旁 `backups/{softcore,hardcore,snapshots}/`。
- 新增檔案請放進對應模組資料夾；共用才放根目錄。`d2edit.js` 的 `at("資料夾/檔名")` 決定載入路徑，`editor/d2edit.js` 需同步。

## 測試指令
- Node：`node lang/tests/test_lang.cjs`、`node modifier/tests/craft-limits.cjs`、`node modifier/tests/weapon-sets.cjs`、`node tools/tests/build-web.cjs`（建置回歸，只在暫存目錄跑）、`node helper/tests/selfcheck.cjs`。
- Electron（隔離設定檔）：`electron helper/tests/autobot.cjs`（170 項）、`modifier/tests/weapon-sets-ui.cjs`、`modifier/tests/craft-diagnostic-ui.cjs`；Linux 無頭需 `xvfb-run -a electron --no-sandbox`。
- 完整登記表：`verify/suite.cjs`（路徑以根目錄為基準）；`verify/lib/runner.cjs` 執行。
- 需儲存庫外／額外資料：`modifier/tests/craft-affix-audit.cjs`、`craft-affix-composite.cjs`、`craft-companion-ui.cjs`（讀 `game-data/裝備屬性分析/魔法稀有詞綴.json`）；`modifier/tests/version-gate-web.cjs`（需新舊版目錄與 itemstats.json）。

## 進行中／未完成
1. **實機長跑未驗收**：輔助器普通一至五幕連續至地獄、營地自動開局與商店完整串接、赫拉迪克法典技能變體與任務目標鎖定（Antigravity 2026-11-02 列出）。
2. **「尋找凱恩」任務**：舊批次存檔任務均 0／6（Claude 2026-11-02），之後未見確認修正紀錄，需實機核對。
3. **翻譯核對**：55 個屬性樣板無精確官方對應、舊版物品清單未人工核對；官方同英文多譯 21 筆不可盲目覆寫（Codex 2026-11-03）。
4. **手機暫停選單無法點擊**：已限制選卡須在 levelUp 且 frontend 關閉，但是否為根因未證實，未於真實手機重現（Codex 2026-11-03）。
5. **桌面版**：多項網頁變更已同步來源，但未重新封裝或發布執行檔。
6. **修改功能舊待辦（Codex 2026-11-02 模擬發現，其餘已修的項目已移除）**——以下尚未見逐項確認，需核對後標記：
   - 作弊總開關／子開關關閉後不還原倍率、數值、函式（「全部關閉」已還原金幣倍率，已寫入遊戲的修改可能持續至重新開始）。
   - 金幣保護觸發後還原；`world.gold` 若為函式會被覆寫。
   - 技能滿級找不到資料時預設 99。
   - 無限重抽欄位 `ranks.Reroll` 與編輯器 `ranks.rerolls` 不一致。
   - 網頁版寫入存檔前未自動備份，與確認對話框說明不符。

## 已解決摘要
- 2026-10-31～11-01：修改器原版規則限制（`validateItems`、`statRanges`、`affixSlots` 前後綴分欄）、中英雙語、手機版面；輔助器建立（戰鬥輔助／自動戰鬥分頁、全圖走位、排行榜學習、任務交付）；v1.0.1 發布。
- 2026-11-02：遊戲 20261102.1 適配（雙武器組修改器與輔助器、新版選卡回呼與自訂鍵位、職業專屬符文之語、574 筆物品生成檢查）；遊戲內語言模組 `lang.js`；遊戲修改分頁（總開關、無敵、暴擊、一擊必殺、技能 99、怪物最大化、全精英、無限重抽、金幣 90 億保護）；專案改名「D2倖存者工具包」。
- 2026-11-03：製作裝備（裝備分類、前後綴分開範圍、複合詞綴自動配套與同欄顯示、輸出設定診斷；708 筆詞綴稽核 0 失敗）；輔助器「全部關閉」、獨立停止自動戰鬥、全圖吸金幣、撿寶依原版 `loot()`、選卡加速；繁中字典統一為 `zh-TW.json` 並比對 D2R 官方字串；公告頁改寫；Cloudflare 改自動部署。

## 近期紀錄
- 2026-11-05｜Claude（**第二階段：消除副本，未提交、未推送、未發布**）：`editor/` 只剩桌面啟動器（`main.js`、`preload.js`、`core.js`、`engine.js`、`remote.js`、`package.json`）；刪除 `editor/` 內所有 UI、引擎、字典與測試副本（根目錄為唯一來源，刪除前 `sync-from-web --check` 只差根目錄較新的 `modifier/i18n.js`、`modifier/editor.html`）。`web-install.html` 移到 `site/install.template.html`；新 `tools/build-web.js` 只產生輸出（安裝頁、轉址、`version.json`、`.nojekyll`），版號檢查 `editor/package.json` 與 `modifier/editor.html`；`sync-from-web.js` 已刪除。測試搬到模組資料夾：`lang/tests/test_lang.cjs`、`modifier/tests/{item-db,skill-mods,runeword-class-base,load-patch}.cjs`、`tools/tests/build-web.cjs`；`modifier/tests/load-patch.cjs` 把 `patch.mjs` 當 CJS 載入（與啟動器相同做法）。`lang/tools/` 為語言工具正式位置（`editor/tools` 副本已刪）。`verify/` 全面改為根目錄來源：`suite.cjs`、`runner.cjs`、`adapt.cjs`、`repair.cjs`（檔名→根目錄對照表 `WHERE`）、`fingerprint.cjs`（只收程式碼資料夾，不收 game-bundles）、`publish.cjs`（建置改 `tools/build-web.js`、版號只改 `modifier/editor.html`、桌面版改為 `--desktop` 才打包）、`verify.cjs`、`selftest.cjs`。測試：登記表 9 項全部通過（含 Electron 的 weapon-sets-ui、autobot 170 項）；啟動器端到端與並行讀寫（隔離副本）通過；建置回歸通過。**沒驗**：`publish.cjs --confirm` 本身（會推送，未執行）、打包後的 exe、Pages 上的線上版。`editor/backups/softcore/` 是測試殘留（含存檔副本資料），刪除被權限拒絕，待使用者決定。
- 2026-11-05｜Claude（鑰匙與器官：實機驗證完成，**未提交、未發布**）：①修復輔助器載入失敗：舊版存檔的 `cheat` 缺少新增欄位（如 `summonCloneOnTerror`）時設定介面讀到 undefined 而拋錯；`helper/autobot.js` 與 `editor/autobot.js` 在讀檔後補齊 `cheat` 預設值。`node helper/tests/autobot.cjs`：197 項通過。②官方 /play、使用者存檔複本、隔離設定檔，恐懼 51 選項：只有鑰匙（pk1–3 各 1）→ 第一格 `FORGOTTEN SANDS`（遺忘沙漠）；只有器官（mbr／dhn／bey 各 1）→ 第一格 `UBER TRISTRAM`（超級崔斯特姆）；皆無 → `ACT I`（第一章）。三組畫面皆截圖確認（畫面上的文字與資料一致）。③開啟選項後消耗：鑰匙版開啟遺忘沙漠後 pk1–3 全為 0；器官版開啟超級崔斯特姆後 mbr／dhn／bey 全為 0（`startTerror(kit,0)`，遊戲狀態 `playing`）。**沒驗**：超級首領戰的內容、硬核排行榜、手機版面、`editor/` 桌面副本未同步、器官的掉落來源。測試腳本：`tests/live-harness/keys-visual.cjs`（步驟檔驅動；需 `H_SHOW=1` 才能收到輸入）。
- 2026-11-05｜Claude（桌面版改為固定啟動器，**第一階段；未提交、未推送、未重建 exe**）：`editor/main.js` 改為載入 `https://nojackno2-ctrl.github.io/d2-survivors-toolkit/modifier/editor.html`（可用 `D2_TOOLKIT_BASE` 覆寫，測試用）；`editor/remote.js` 負責從 Pages 抓 `signatures.json`、`patch.mjs`（去掉 export 後當 CJS）、`engine-page.js`、`gamedata.json`、`lang/zh-TW.json`，並存進 userData 快取（離線時改用快取）。`editor/engine.js` 改為非同步準備引擎；`editor/core.js` 移除 `i18n` 與不存在的 `LAUNCHER_DICT`（原本 `diag()` 會拋錯）。安全：IPC 檢查呼叫來源網域、`engine` 函式名只接受識別字、備份檔名只接受 basename、`sandbox: true`、導覽限制在工具包網站、外部連結交給系統瀏覽器。`modifier/editor.html` 版本提示在桌面端改為「重新開啟工具包」（`window.api.launcher`）。測試：本機靜態伺服器（模擬 Pages）＋ Electron ＋隔離 `APPDATA`：頁面載入、`window.api` 各函式、i18n（14088 筆）、diag、`engine` 白名單、備份檔名檢查皆通過。2026-11-05 更新：本機桌面遊戲已更新為 `2026.1104.2`，引擎 `capabilities` 支援、物品目錄 576 筆、`faults` 空。使用者存檔（`%APPDATA%\D2 Survivors` 整個資料夾複製到暫存 APPDATA，原檔不動，雜湊前後相同）實測：`load` 成功（softcore，version 16，有簽章）、`traces` 空、原樣 `save` 後 `load` 內容與簽章相同、`saveFaults` 空；金幣改 12345 寫入後讀回 `sealed` 且 `saveFaults` 空。**發現**：頁面啟動會自動 `load` 一次，若與其他讀寫同時進行，classic-level 會報 LOCK 錯誤並誤導成「請先關閉遊戲」（測試時等 6 秒才穩定）；已修：`editor/core.js` 的 `load`／`store`／`traces` 改為排隊執行（`queued()`），不再同時開啟資料庫；實測同時發出 5 個讀取與 2 個寫入全部成功，寫入後金幣 777、簽章有效，原檔雜湊不變。**第二階段未做**：`editor/index.html`、`editor/autobot.js`、`lang.js` 等副本仍在；`build-web.js`、`sync-from-web.js`、`publish.cjs`（仍會打包桌面版）、測試引用仍指向 `editor/`。打包與發布需使用者同意。
- 2026-11-05｜Codex（鑰匙與器官官方遊戲選項驗證）：隔離 Electron、官方 /play、兩份存檔副本，呼叫 `g.frontend.actions.terror("sorceress")`；六項各 1 時為 `FORGOTTEN SANDS`, `UBER TRISTRAM`, `ACT IV`，六項為 0 時為 `ACT I`, `ACT III`, `ACT IV`。兩者 pay 均為 `Pays +131% MF · +51% XP · +131% gold · +102% items`，未包含鑰匙或器官文字。測試時本機未提交的輔助器因 `cheat.summonCloneOnTerror` 設定欄位拋錯，只在頁面記憶體繞過後取得 game；未修改輔助器。未驗畫面選項、消耗或首領戰；日誌位於暫存目錄 `d2-keys-codex`。

- 2026-11-05｜Claude（修改器加入三把鑰匙與三種器官，**未提交、未發布**）：遊戲把鑰匙存成 `save.pandemonium.pk1／pk2／pk3`、器官存成 `mbr／dhn／bey`（每件一個 id 陣列，上限 999；讀檔 `xC` 只檢查 id 格式 `^[\w-]{1,32}$`，不驗證 id 是否對應實體物品）。開啟恐懼階超級首領選項時，`aC`（鑰匙）與 `dC`（器官）取各陣列第一筆，`_C`／`hC` 消耗之。修改器 `modifier/editor.html` 的「鑰匙與器官（首領掉落）」頁（各 0–999，另有「鑰匙各設為 1」「器官各設為 1」），只增減這六個陣列；`modifier/i18n.js` 補英文。器官掉落來源未查明（lang 字串只說明用途）。`mc()`（存檔「被修改」判定）不含 pandemonium，代碼層面鑰匙本身不會觸發排行榜 `edited`（硬核未實測）。測試：`modifier/tests/keys-ui.cjs`（Electron，通過）、`tests/live-harness/keys-e2e.js`（官方 /play、使用者存檔複本、隔離設定檔：寫入後 pandemonium 三把各 1、器官保留、遊戲 `saveFaults` 為空）。**沒驗**：開出的超級首領選項是否在恐懼階畫面實際出現、消耗後的行為、硬核排行榜、手機版面、超級崔斯特姆是否出現；`editor/` 桌面副本未同步。實機（官方 /play、使用者存檔複本）已驗：寫入六個陣列後重載，三把鑰匙與三種器官都保留、`saveFaults` 為空。
- 2026-11-05｜Claude（遊戲修改：召喚暗黑破壞神分身，**未實機驗證、未發布**）：輔助器「遊戲修改」分頁新增「首領召喚」開關 `cheat.summonCloneOnTerror`（預設關），開啟後每進入一個恐懼階的世界（`autoSummonClone`，每個世界只一次、需時間 ≥1.5 秒）自動呼叫 `summonClone`，`helper/autobot.js` 與 `editor/autobot.js` 同步。原理：遊戲原本是出售喬丹之石→寫入 `clones[職業]`→下一恐懼階由 `director.cloneComes(world)` 登場；作弊版直接在本局呼叫 `cloneComes`，前置條件為總開關開啟、本局進行中、恐懼階中、場上無存活首領、本局未召喚過。不寫 `soj` 紀錄（遊戲 `cloneCame` 只在有 soj 時記錄），故不影響 sojLedger／saveFaults；擊殺後毀滅之符沿用遊戲 `cloneFell`。已驗（2026-11-05 實機，官方 /play 經 `H_LOCAL` 攔截載入本機 autobot，使用者存檔副本、隔離設定檔、`H_SETTINGS` 開啟 `summonCloneOnTerror`＋恐懼 progress）：從營地進入第 50 階後 playing 起約 1.5 秒分身出現（時間差已修正：`world.time` 是絕對時鐘，先前寫成 `time>=1.5` 等於沒延遲），分身「Diablo approaches」，被輔助器作弊擊殺後存檔 `chase` 出現 `annihilus`。**沒驗**：`saveFaults`（需修改器引擎）、手機版面、英文模式按鈕文字（未加入字典）、正式版發布。`cloneComes` 只在 director 上確認存在，尚未加入 `selfcheck.js`。
- 2026-11-05｜Claude（/goal 工具包自檢，**未提交、未發布**）：新增 `helper/selfcheck.js`（`editor/selfcheck.js` 為建置來源），`d2edit.js` 載入進度條多一步「相容性自檢」與其他步驟並行，載入完成時列出問題並可繼續遊玩（點一下關閉；問題在主控台 `[D2 工具包自檢]` 與 `window.__d2editSelfCheck`、`diag().selfCheck` 也有）。檢查：官方版本 vs `TESTED_GAME_BUILD`、遊戲主程式檔名變動、字典／遊戲資料筆數、物品引擎特徵碼缺失（列出缺哪個）、存檔簽章與遊戲 `saveFaults`、輔助器依賴的遊戲成員（`gainXp`、`hud.showTown` 等）、語言掛接；遊戲還在選角時只給提示，約 25 秒後補查。`TESTED_GAME_BUILD` 現多一份（selfcheck.js），已加進 `verify/lib/adapt.cjs` 自動更新清單；`publish.cjs` 發布清單、`build-web.js`、`build-web.cjs` 已加。測試：`node helper/tests/selfcheck.cjs`（模擬 10 種不符情況）；`verify/live-smoke.cjs` 現會讀自檢結果，有 error 即判失敗。實機（官方網址＋隔離設定檔＋新存檔）自檢 0 問題。**沒驗**：有問題時進度條下方列表的實際畫面（只驗邏輯）、手機版面、使用者存檔。
- 2026-11-05｜Claude（/goal 製作裝備加入孔數與珠寶、修改現有裝備洞數，**未提交、未發布**）：存檔欄位為 `sockets`（孔數）＋`socketed`（鑲嵌的珠寶陣列，只能放魔法／稀有珠寶，數量≤孔數，不帶 `at`）；遊戲 `itemFault` 規則：普通≤底材 `sockets[2]`（最多 6）、魔法≤2、稀有≤1、暗金／套裝孔數＝自身 `item_numsockets`、符文之語不能放珠寶。`modifier/engine-page.js`（與 `editor/engine-page.js`）`bases()` 新增 `sockets`；`modifier/editor.html` 新增「孔數與珠寶」：製作裝備頁（固定品質隱藏）與物品頁都能改孔數、從存檔現有珠寶挑選鑲嵌（鑲入後從倉庫／背包移走）；未解除限制時依上述上限，解除後可到 6 孔。測試：`modifier/tests/socket-ui.cjs`（Electron）、`tests/live-harness/socket-e2e.js`（官方網址＋存檔副本：製作 3 孔鑲 2 顆→物品頁改 4 孔→寫入→重載，遊戲 `faults` 無問題；`saveFaults` 的 6 筆「not what its roll makes」為存檔副本既有）。**沒驗**：魔法／稀有裝備帶孔的實機寫入重載、暗金／套裝既有裝備鑲珠寶的實機、手機版面；`editor/editor.html` 桌面副本已漂移，未同步介面改動。）
- 2026-11-05｜Claude（交接補記，**工作區未提交、未實機驗證、未發布**）：v1.0.7 之後工作區有三處改動，前一位沒寫進紀錄，這裡補上。①**輔助器新增作弊項「經驗值加成最大」**（`cheat.maxXp`，`helper/autobot.js`＋`editor/autobot.js`）：包住遊戲 `gainXp`，開啟時獲得經驗 ×1000，關閉原樣放行；設定預設與載入合併、介面欄位（流程與掉落修改群組）都已加。**未確認遊戲端真有 `gainXp` 且被呼叫、沒跑 `helper/tests/autobot.cjs`、沒在官方 /play 驗**——驗收前不可說已完成。②**修改器「存檔檢查」新增兩項**（`modifier/editor.html`）：套裝裝備被標成暗金（名稱屬於套裝）→ 可一鍵刪除；倉庫物品重疊／缺座標／超出格子 → 可一鍵重新排列（`repackStash`）。**`editor/index.html` 桌面副本尚未同步**（grep 無 `isFakeUnique`）。③`freshSave`（重新開始存檔）不再把套裝品質降成暗金（`it.rarity !== "set"`）。**待辦**：跑 Node／Electron 測試、官方網址用使用者存檔實機驗證（含舊壞存檔的偵測與修復後重載無 `saveFaults`）、同步 `editor/` 副本、驗證通過後寫公告站日誌（`site/index.html`）並升版號發布。
- 2026-11-05｜Claude（/goal 製作裝備開放暗金／套裝／符文之語）：**未解除限制也能製作固定品質，屬性鎖原版**。原理：遊戲對暗金／套裝／符文之語以 `stats`（原始屬性列）為準，讀檔時用 `sanitize` 重算 `mods`，且只逐列檢查「在該列原版範圍內」（`itemArt-*.js` 的 `w6`）。`modifier/engine-page.js` 新增 `fixedInfo`（可調整的屬性群組＝同一次擲值的連動列、原版範圍、隨機項目：stats 參數如地獄火炬職業／奧瑪斯技能、符文之語法杖技能與底材固有加成、是否無形）與 `fixedBuild`（只改 stats 數值／參數 → 遊戲 `sanitize` 重算 → 遊戲 `itemFault` 檢查，超出範圍直接拒絕）。介面（`modifier/editor.html`）：裝備庫「數值」新增「自訂（限原版範圍）」；「製作裝備」頁品質選暗金／套裝／符文之語後選物品即可調整，符文之語底材限 `runewordBases`（類型符合、孔數夠）。同時修 `fixedProblems` 兩個誤判（地獄火炬非預設職業、法杖技能被當多餘屬性）；`d2edit.js` 白名單加入 `fixedInfo`／`fixedBuild`；`modifier/i18n.js` 補英文。
  - **實機**（官方 /play＋使用者存檔副本，隔離暫存設定檔）：①全物品稽核 732 組（371 暗金＋127 套裝＋78 符文之語×最多 3 底材）2524 次製作（最高／最低／隨機值、每個隨機選項、固有加成列、法杖技能、無形），遊戲 `faults` 與修改器 `validateItems` 0 失敗；超出範圍 1478 次全被拒絕。②端到端（UI 實際操作→「寫入存檔」→重載遊戲頁→遊戲自己的 `faults`／`saveFaults`）：Annihilus／地獄火炬（改職業）／奧瑪斯（改技能）／Spirit／Call to Arms／帶法杖技能的 Insight 等共 766 件，`saveFaults` 為空，自訂值與法杖技能重載後保留。
  - **實測抓到的既有問題**：「隨機（跟掉落一樣）」做出帶法杖技能的符文之語（如 Archon Staff 的 Insight）重載後被遊戲判「種子對不上」（法杖技能是否出現取決於遊戲端載入的資料）；已改為這類物品不附 roll（保留 stats），重測通過。
  - 測試腳本：`tests/live-harness/craft-live.cjs`（執行器，`nojackno2-ctrl.github.io` 請求改由本機檔案回應以測未發布修改）、`craft-fixed-audit.js`、`craft-fixed-e2e.js`（需 `H_IN=editor H_SEED=存檔.json`）。限制：測試環境是全新設定檔點「hosted」載入，遊戲端若缺符文之語資料則不驗其範圍（舊路徑亦同）；未用真實手機驗證。`editor/` 桌面副本內容已同步（執行檔未重新封裝）。**後續：已提交為 v1.0.7（`2cac23a`）並推送，公告站日誌已寫。**
- 2026-11-05｜Claude：**遊戲 20261104.2 階段 A 完成，網頁版上線**。官方 2 項：硬核「舊副本」判定未找到條件變化（需實機追）；超級首領戰鬥層數上限 100（工具包無依賴）。修正：自動推層同時避開 `uber` 與 `finale`（Uber Tristram 會消耗器官），測試 196/0。翻譯：新增兩句遊戲與公告字串，未翻譯歸零。回歸：`verify --update --force` 7/7。實機：官方網址＋使用者存檔（99 級地獄 sorceress），掛接 20261104.2，無模組載入失敗。`reading 'id'` 已定位：遊戲 `startRun`（Game-_fAFHQD1.js:289）被 harness 在 setup 頁點 hosted 按鈕、未選職業時呼叫，屬 harness 路徑、非玩家路徑；harness 已加錯誤堆疊診斷。桌面版執行檔與 Release 未發布；新遊戲內容（階段 B）另案。
- 2026-11-04｜Claude：**遊戲 20261104.1 相容（實機已過一輪，未發布）**。已做：`helper/autobot.js` 動態解析 `itemArt-*.js`／`saveTransfer-*.js`，鍵位改依特徵辨認（新版 `j_ as Sa`）；`modifier/editor.html` 倉庫 `[10,12]`；`lang/zh-TW.json` +53 筆；`helper/tests/autobot.cjs` 鍵位夾具改為新版形狀；無限重抽鎖定 99 並測試期待 99。網頁版 `TESTED_GAME_BUILD` 已改 20261104.1。回歸：Node 四項＋`autobot.cjs` 194/0 通過。**實機**：本機伺服器（`localhost:8766`）＋`H_BASE` 注入 harness，官方網址載入使用者存檔（sorceress 99 級地獄），輔助器掛接 `Game-C-lMmM6N.js`、自動戰鬥，無模組載入失敗；另有一個未定位來源的 `Cannot read properties of undefined (reading 'id')`（開局時）。**待辦**：33 項 impact 中 24 項仍待分析或需實機（護符、三把鑰匙與首領流程、傳送門、手機版面、Dark Reader、搖桿等）；`auto-select` 選特殊關卡可能消耗器官（Codex 第 5、6 項）；`pandemonium` 結構與 `pandemoniumDone` 未驗證；修改器 LO=16 存檔的讀寫未實測。**使用者指定**：之後實機一律用此存檔（已解碼為暫存 JSON，原檔不動）。
- 2026-11-04｜Claude：**遊戲更新流程改版**（使用者要求）。`.agents`／`.claude` 的 `game-update` 技能統一為同一份：①讀官方更新訊息 ②反編譯比對新舊版差異（含官方沒提的）③AI 分析修改器／輔助器／語言是否相符並修改 ④沒變動的部分用 `verify` 腳本快速回歸 ⑤隔離環境實機驗證 `https://d2survivors.lol/play/` ⑥使用者明確確認後才 `publish.cjs --confirm`（原 `.agents` 版「自動發布」與 `.claude` 版「本地模型修復」皆移除）。`verify/README.md` 與 `docs/ai/README.md` 已同步。未實際跑過新流程。
- 2026-11-04｜Claude：**備份資料夾分類**。倉庫 `backups/`：`exe/`（舊執行檔）、`code/`（原 `verify/backups/` 與 `lastgood/`）、`saves/test-fixture`（原 `_backup_test/game-save`）、`archive/`；`verify/verify.cjs`、`repair.cjs`、`publish.cjs` 路徑已改。桌面版存檔備份（`editor/core.js`）改寫到執行檔旁 `backups/softcore|hardcore|snapshots/`，`listBackups`／`safeName` 支援一層子資料夾並仍可列出舊的平放檔案；以暫存目錄驗證寫入、列出、刪除與路徑穿越防護。未重新封裝桌面版，Electron 介面未實測。
- 2026-11-04｜Claude：**專案資料夾解耦**（使用者 /goal）。結構見上方「資料夾結構」。改了 `d2edit.js`／`editor/d2edit.js` 載入路徑、`editor/build-web.js`（輸出新配置，不再複製 tests）、`verify/publish.cjs` 發布清單、字典稽核路徑、live-harness 路徑。**舊根目錄網址（如 `/autobot.js`）已不存在**，書籤入口網址不變。驗證：`node --check`、`test_lang`、`craft-limits`、`weapon-sets`、`editor/tests/build-web.cjs` 通過；Electron 測試與實機未跑，未推送。`verify/lib/repair.cjs` 的 EDITABLE 清單與 `editor/` 桌面副本（內容有漂移）未動。
- 2026-11-04｜Claude：修正怪物名稱翻譯半中半英（如 Black Archer 顯示成「漆黑 · Archer」，278 個怪物名中 141 個受影響）。根因：`lang/lang.js` `translateString` 的逐字拆解先於 `monster:` 補查。改動：最前面先做 `translateAs("monster", 名稱)` 精確比對。副作用：與怪物同名的詞條（Horror 技能、Slayer 被動／稱號、Plague Bearer、Blood Wing）一律顯示怪物譯名，待以實機語境區分。驗證：`node lang/tests/test_lang.cjs` 通過；模擬 278 個怪物名，修正前 137 正確、141 錯誤。未實機驗證、未發布。
- 2026-11-05｜Claude：怪物名稱與詞綴列的分隔符。`lang/lang.js`（來源 `editor/lang.js`）新增 `tidyMonsterText`，在 `translateString` 最後套用：純英文怪物名的中文間「 - 」移除（`石塊蛆蟲巫異`）；含詞綴關鍵字（Cursed、Extra Fast、Enchanted 等）的屬性列改為每項之間一個空格（`施加詛咒 靈氣強化 特別快速`）。驗證：`node lang/tests/test_lang.cjs` 通過；實機（本機 `H_BASE` 注入、隔離設定檔、存檔副本）在頁面內呼叫真實 `translateString`：`Stone - Maggot - the Witch`→`石塊蛆蟲巫異`、`Cursed - Aura Enchanted - Extra Fast…`→`施加詛咒 靈氣強化 特別快速…`，原尺寸截圖確認屬性列為單空格分隔。未發布、未推送。原版 " - " 來源未查明，此前「來自原版翻譯器」之說法不成立。全面掃描：字典內 `monster:`／`unique:`／`affix:` 共 709 個英文名稱，經頁面內真實 `translate` 輸出，皆無「·」、「-」、中文間空格或殘留英文（0 筆可疑）。物品（使用者 2026-11-05 要求一併修正）：`Chain Boots - of Precision` 由 `鎖鍊靴 - 精密之` 改為 `鎖鍊靴精密之`，移除先前的「of」排除條件；實機頁面內驗證通過。介面提示（如 `Enter：選擇 - Esc：返回`）不受影響。Codex 唯讀審查（job 54bff56d9116）：字典條目無直接受影響項目，風險僅在動態組合，已依需求接受。

- 2026-11-05｜Claude（/goal 名稱顯示對齊原版）：`composeFind` 組合規則修正：物品重排只在字尾為「of …」時進行（`精密之鎖鍊靴`）；怪物稱號與稀有名稱維持原順序（`石塊蛆蟲巫異`、`兇殘扣環`）；詞綴列優先判斷、單一空格分隔（`施加詛咒 靈氣強化 特別快速`）。另修：詞綴列空格原本會被 `cleanCJK` 刪除，改以不換行空白（U+00A0）連接並讓 `CJK_GAP`／`MULTI_SPACE` 略過它。驗證：`test_lang` 通過；實機（Electron 隔離設定檔載入官方 /play、本機 `d2edit.js` 注入、`gameHooked:true`）頁面內 `__d2lang.translate` 10 例全對。未用使用者存檔（翻譯不依賴存檔）、未發布。
- 2026-11-05｜Claude：使用者手機實測仍見「 - 」。根因：遊戲把屬性與唯一怪名以空白串成整串（`ix()`：`traits.map(H).join(" ")`），`translateString` 逐段拆解後以「 · 」接回，點陣字型畫成「-」，且最長比對把相鄰屬性黏在一起。修正：整串可完全切成屬性時逐項翻譯、以 U+00A0 分隔；其餘全譯完的名稱直接相接（`妖鬼饗宴「號哭者」`）；含 of 的整串先套物品規則，底材不得以 of/the 開頭（`八目鰻之戒指`）。實機（官方 /play、本機注入、gameHooked）10 例全對。

## 較早紀錄（已封存）
- 2026-11-03～11-04 的各代理紀錄（專案最佳化、Cloudflare 自動部署、字典統一、更新驗證流程改版、實機長跑檢查、選卡修正、存檔檢查頁等）：`docs/ai/handoff-archive-2026-11.md`。
- 2026-10-31～11-02 完整紀錄：`docs/ai/handoff-history.md`。
- 文件索引與讀取順序：`docs/ai/README.md`。
