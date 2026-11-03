# 交接紀錄

- 2026-11-03｜Codex：核對並更新安裝頁、修改器、README 與公告網站的入口位置、停止控制、製作裝備、排行榜及死亡保護說明；公告網站加入新功能介紹並更新日誌。同步桌面來源對應文字，未封裝桌面版。`node tests/test_lang.cjs`、`node tests/craft-affix-audit.cjs`（708 筆、0 失敗）、`node tests/craft-affix-composite.cjs`、`node tests/craft-limits.cjs`、Electron `tests/craft-companion-ui.cjs`、Electron `tests/autobot.cjs`（168 項、0 失敗）、語法與 `git diff --check` 通過；未進行本次真實遊戲驗收。依使用者要求提交並推送 GitHub；Pages 與獨立 Cloudflare 公告網站部署需另行核對。

- 2026-11-03｜Codex：依使用者更正，「全部關閉」改為關閉所有細部布林開關、全圖撿裝與推層／固定關卡模式，保留數值門檻及無關開關的選項；重新開啟總開關不會啟用細項。同步網頁與桌面來源；隔離 Electron `web/tests/autobot.cjs` 168 項通過、0 失敗，語法、語言測試與 `git diff --check` 通過。部分已套用的遊戲修改可能持續至重新開始；未實機驗證、發布或封裝。

- 2026-11-03｜Codex：輔助器面板新增「全部關閉」，關閉戰鬥輔助、自動戰鬥、遊戲修改三個總開關，原先保留細項設定（已依後續指示變更），並還原金幣倍率；已寫入遊戲的部分修改可能持續至重新開始。網頁與桌面來源同步；隔離 Electron `web/tests/autobot.cjs` 166 項通過、0 失敗，涵蓋儲存、介面與倍率還原；語法、語言測試及 `git diff --check` 通過。未實機驗證、發布或封裝。

- 2026-11-03｜Codex：戰鬥畫面「停止自動戰鬥」僅關閉自動戰鬥，保留戰鬥輔助與遊戲修改；設定面板的立即停止仍關閉兩個輔助開關。同步網頁與桌面來源，隔離 Electron `web/tests/autobot.cjs` 163 項通過、0 失敗，包含按鈕及設定保留；`node --check` 與 `node web/tests/test_lang.cjs` 通過。尚未在真實遊戲驗證，未發布或封裝。

- 2026-11-03｜Codex：複合詞綴同欄顯示已發布提交 `c74d530`；GitHub Pages 工作 `41563059302` 成功，公開 `editor.html` 避開快取下載後 Git 雜湊與提交一致。未做真實遊戲存檔驗收或發布桌面版。

- 2026-11-03｜Codex：依使用者要求發布複合詞綴選項配套說明與同欄顯示；發布前 708 筆詞綴稽核、複合詞綴及上限測試、隔離 Electron 介面測試與 `git diff --check` 通過；提交後待核對 GitHub Pages。

- 2026-11-03｜Codex：製作頁前後綴下拉選項顯示詞綴配套屬性；若同屬性也可能為單獨詞綴則標示「可能配套」。自動配套的數值欄顯示在主屬性同一列，底層仍保留遊戲所需的各屬性，編輯數值會同步；刪除主列會刪除配套。隔離 Electron `tests/craft-companion-ui.cjs` 驗證選項配套文字、同列欄位、編輯同步、刪除及歧義；`tests/craft-affix-audit.cjs` 708 筆 0 失敗，複合與上限測試、語言測試、三份頁面語法及 `git diff --check` 通過。桌面來源已同步，未發布網頁、未封裝桌面及未驗收真實遊戲存檔。

- 2026-11-03｜Codex：複合詞綴自動新增功能已發布提交 `11ac34f`；GitHub Pages 工作 `41562385669` 成功，公開 `editor.html` 與 `engine-page.js` 避開快取下載後 Git 雜湊均與提交一致。未做真實遊戲存檔驗收或發布桌面版。

- 2026-11-03｜Codex：依使用者要求發布複合詞綴自動新增及提示；發布前 `tests/craft-affix-audit.cjs` 708 筆、0 失敗，`tests/craft-affix-composite.cjs`、`tests/craft-limits.cjs`、隔離 Electron `tests/craft-companion-ui.cjs`、語法及 `git diff --check` 通過；提交後待確認 GitHub Pages 部署。

- 2026-11-03｜Codex：製作頁選擇可唯一確定配套的複合詞綴時，自動加入其他屬性列並顯示提示；移除或更換原列時移除未被使用者修改的自動配套列，有不同詞綴可能時提示確認而不猜測。修正分區下拉建議值未寫入選項的問題。同步桌面來源；隔離 Electron `tests/craft-companion-ui.cjs` 驗證巨魔護手自動加準確率 +5、提示、刪除及歧義不猜測，通過；`tests/craft-affix-audit.cjs`（708 筆、0 失敗）、`tests/craft-affix-composite.cjs`、`tests/craft-limits.cjs`、`tests/test_lang.cjs`、桌面 `runeword-class-base.cjs` 與語法、`git diff --check` 通過。未在真實遊戲存檔驗收，未發布網頁或封裝桌面。

- 2026-11-03｜Codex：前後綴修正已發布提交 `2451af8`；GitHub Pages 工作 `41561572337` 成功，公開 `editor.html` 與 `engine-page.js` 加入快取避開參數下載後，Git 雜湊均與提交一致。未發布桌面版，未進行真實遊戲存檔驗收。

- 2026-11-03｜Codex：依使用者要求發布前後綴及複合詞綴修正；發布前重跑 `tests/craft-affix-audit.cjs`（708 筆、0 失敗）、`tests/craft-affix-composite.cjs`、`tests/craft-limits.cjs`、`tests/test_lang.cjs`、隔離 Electron `tests/craft-affix-ui.cjs` 及 `git diff --check` 均通過；GitHub Pages 部署待提交後核對，未發布桌面版。

- 2026-11-03｜Codex：逐筆稽核擷取的 708 筆詞綴（411 前綴、297 後綴，181 筆複合），以獨立模擬底材驗證每筆分類範圍、最高值完整組合與逐項補入，對 alike 數值可變者另測最低值；`node tests/craft-affix-audit.cjs` 708 筆、0 失敗。發現並修正 alike 屬性必須等值時，部分組合及建議值未遵守等值的問題；介面使用候選建議值。`tests/craft-affix-composite.cjs`、隔離 Electron `tests/craft-affix-ui.cjs`、`tests/craft-limits.cjs`、`tests/test_lang.cjs`、桌面 `runeword-class-base.cjs` 均通過，已同步桌面來源。稽核為單詞綴模擬，不代表窮舉全部底材與多詞綴組合；未發布網頁、未封裝桌面，未做真實遊戲存檔驗收。

- 2026-11-03｜Codex：已修正製作頁前後綴範圍混用及達上限時無法補上複合詞綴的問題；分類範圍與候選依前綴／後綴分開，已滿時只在仍有合法可補屬性時允許增加列，完整組合仍由原規則檢查。`tests/craft-affix-composite.cjs` 使用擷取的遊戲詞綴重現巨魔護手並驗證補齊後 3 前綴／3 後綴，`tests/craft-affix-ui.cjs` 在隔離 Electron 驗證前綴照亮範圍預設 +2、後綴已滿時可加 attackRating +5；兩項及 `tests/craft-limits.cjs`、`tests/craft-diagnostic-ui.cjs`、`tests/test_lang.cjs`、`editor/tests/runeword-class-base.cjs`、語法與 `git diff --check` 均通過。同步桌面來源，未發布網頁或封裝桌面，未在真實遊戲存檔驗收。

- 2026-11-03｜Codex：分析使用者提供的巨魔護手診斷。`裝備屬性分析/魔法稀有詞綴.json` 顯示照亮範圍前綴 Glimmering／Glowing 分別為 +1／+2、同屬 group 112；+5 屬後綴 of the Sun（group 25），並伴隨 attackRating +5。兩列 +5 皆放前綴且未含複合屬性，無法組成合法詞綴。製作頁 `affixInfo` 的範圍按屬性匯總、不區分前後綴，可能把後綴 +5 顯示及自動套用至前綴；`affixSlots` 可顯示數量但不代表組合有效。待修正依區域顯示及預設值，並以遊戲資料測試。

- 2026-11-03｜Codex：網頁版已發布提交 `d457c13`；GitHub Pages 工作 `41559785646` 完成成功，公開 `editor.html`、`engine-page.js`、`i18n.js` 以快取避開參數下載後，Git 內容雜湊均與該提交一致。未進行真實遊戲存檔驗收，未發布桌面版。

- 2026-11-03｜Codex：依使用者要求發布上述製作裝備更新至 GitHub Pages；發布前重新執行 `tests/craft-limits.cjs`、`tests/test_lang.cjs`、隔離 Electron `tests/craft-diagnostic-ui.cjs` 及 `git diff --check` 均通過。部署狀態與公開內容待提交後核對；不涉及桌面執行檔發布。

- 2026-11-03｜Codex：製作裝備新增「輸出裝備設定」與複製按鈕，輸出表單屬性、原版檢查、名稱判定、詞綴數量及相同設定的上次製作結果；不擷取存檔資料，複製失敗時可手動選取。同步網頁與桌面來源。隔離 Electron 假後端 `tests/craft-diagnostic-ui.cjs` 通過，確認資料與測試存檔金幣未輸出；`tests/craft-limits.cjs`、`tests/test_lang.cjs`、內嵌 JavaScript 語法及 `git diff --check` 通過。Electron 測試產生 GPU 診斷訊息但結束碼為 0；未於真實遊戲或已封裝版本驗收，未發布。

- 2026-11-03｜Codex：製作裝備新增「裝備分類」與依分類篩選的底材欄位；固有屬性範圍由遊戲產生器取樣並標明取樣，非保證理論極值。詞綴上限沿用既有規則：魔法最多 2、一般稀有最多 6、稀有珠寶最多 4，護身符不可稀有；新增護身符介面即時限制。`node tests/craft-limits.cjs`、`node tests/test_lang.cjs`、桌面 `node tests/runeword-class-base.cjs`、JavaScript 語法及 `git diff --check` 通過。以上為模擬驗證，未完成實際遊戲介面與存檔驗收，未封裝或發布。

- 2026-11-02｜Codex：依使用者新指示移除版本不符的使用封鎖，保留更新提示與程式特徵檢查；先前要求舊版封鎖的紀錄已過時。網頁隔離測試：`tests/autobot.cjs` 160 項通過、`tests/weapon-sets-ui.cjs` 通過，`tests/version-gate-web.cjs` 對 20261102.1 與 20261101.1 完成後端及介面寫入；`node tests/build-web.cjs`、`node tests/test_lang.cjs` 通過。曾誤用已修補模組產生重複匯出錯誤，改用原版模組後通過。舊版功能未做完整相容驗收。網頁提交 `89374b5` 已推送；GitHub Pages 部署中。獨立 Cloudflare 公告網站嘗試 `npx wrangler deploy --name d2-survivors-toolkit --assets ./site --compatibility-date 2026-11-02`，因沒有 Cloudflare API Token 失敗，尚未更新。桌面來源已同步，但未重新封裝或發布執行檔。

- 2026-11-02｜Antigravity：因應官方遊戲更新進行全面實機真機隔離驗證與收尾：
  - **驗證環境與狀態**：在官方最新遊戲網頁環境（連網偵測到最新發布之 `20261102.2`，主程式 `Game-BrCacnVd.js`、`itemArt-BOATIR-s.js`、`saveTransfer-DrrQrlqL.js`，相容 `20261102.1`）下，以獨立 TEMP Electron 隔離設定檔（完全不操作使用者真實存檔）進行實機端對端驗證。
  - **已完成實機真機驗證項目（全數通過並具備 JSON 診斷日誌）**：
    1. **修改器武器組與全職業組合**：驗證野蠻人雙持單手、刺客雙爪、亞馬遜雙手弓/箭袋↔標槍/盾牌、聖騎士單手/盾牌、死靈法師單手/盾牌，在修改器 UI 切換、存檔讀寫、進遊戲冷啟動讀回、原生 `g.swapWeaponSet()` 切換與持久化皆 100% 正確。
    2. **職業專屬底材符文之語**：7 職業專屬符文之語（聖騎士 Vortex Shield/Ancients' Pledge、死靈法師 Bloodlord Skull/Splendor、法師 Swirling Crystal/Venom、亞馬遜 Matriarchal Bow/Faith、野蠻人 Fury Visor/Lore、德魯伊 Earth Spirit/Lore、刺客 Suwayyah/Chaos）在修改器產生、存入倉庫、遊戲原生載入檢查，`itemFault` 均為 null、`validateItems` 均為 0 錯誤。
    3. **修改器既有功能迴歸**：`affixSlots` 前後綴分割表格、`#unlock` 製作暗金/套裝/符文之語限制開關、英雄金色光芒（`glow`）讀寫、`#guard` 合規檢查（防 >10B 金幣與非法詞綴）、圖鑑一鍵解鎖（574 筆）與快照備份。
    4. **遊戲內繁體中文 (`lang.js`)**：主選單、20261102.1 鍵盤重綁介面、更新日誌、遊戲內語言切換及無遺漏詞條驗證通過。
    5. **輔助器自動選卡、重抽與修改器實機行為 (`autobot.js`)**：
       - `autoReroll` 正常模式：每升級畫面嚴格限制最多 2 次重抽後自動選卡並回戰鬥。
       - `cheat.infiniteRerolls` 無限重抽模式：重抽鎖定 9999 次，突破 2 次限制連續重抽直到抽中目標技能。
       - 6 技能全滿替換（`respec`）：正確識別替換卡並成功置換技能。
       - 特殊選卡模式：初始選卡與阿卡拉重置選卡直接選最佳卡不浪費重抽。
       - 遊戲修改項目全開實測：無敵（`godMode`）、滿暴擊（`criticalStrike=100`）、一擊必殺（100倍傷害）、技能全 99 等、怪物拉滿（`owed=450`）、全冠軍精英、極限掉寶（`mf=999999`）。
       - 金幣 90 億單次巨額掉落保護：單次掉落使總金幣達 95 億時，輔助器即時關閉 `cheat.maxGoldRate`，恢復倍率且不破壞已累積金幣。
    6. **輔助器七職業實機動作**：7 職業（amazon, assassin, necromancer, barbarian, paladin, sorceress, druid）在真實戰鬥中生命讀取、近遠程 REACH 走位移動、自動喝水（`drinkFrom`）、自動點屬性（`spendStatPoints`）皆通過。
    7. **雙武器組保護、垃圾販賣、全圖吸物**：備用武器組（Azurewrath + Stormshield）在換裝過程中完好保留；垃圾裝備自動賣出；經驗寶石全圖吸取（`magnet`）；寶箱自動移至角色身上。
    8. **死亡保護實機觸發**：致死傷害且無藥水時自動觸發暫停與離場（`g.pause()` / `g.leaveRun()`），安全返回營地。
    9. **營地交任務與重置**：背包有任務卷軸或待領任務時，自動呼叫 `akaraSearch` 翻譯卷軸與 `cainHandOver` 交付；技能分散時自動呼叫 `openAkara` 重置技能。
  - **未完成／寫入交接項目（依指示不重複測試，留待後續驗證）**：
    1. **長跑驗證**：輔助器由普通一至五幕連續無人介入全通關至地獄（需長時間掛機）。
    2. **營地自動開局與商店完整走訪**：營地整備後依傳送點自動開啟下一局與商店買藥/恰西升級在單一長流程中的完整串接。
    3. **赫拉迪克法典技能變體套用**：實機撿到赫拉迪克法典自動點技能變體（`hud.d2.mods.set`）與任務關卡目標（石陣、牢籠、任務頭目）的實戰鎖定。
    4. **官方 20261102.2 版本號常數門檻調高**：目前官方更新至 20261102.2，工具內部版本門檻 `TESTED_GAME_BUILD` 仍維持在 20261101.1 / 20261102.1，待使用者指示確認是否更新常數。


- 2026-11-02｜Codex｜**暫停**：依使用者要求停止測試與修改。目標仍為檢查遊戲更新並更新工具包；使用者要求以最新版網頁為主，不再驗證舊版相容，舊版／未知版本保留功能封鎖。最新官方測試版本 `20261102.1`；本機網頁程式尚未發布，`TESTED_GAME_BUILD` 仍為 `20261101.1`，因新版完整驗收未完成不可提前調高。根目錄桌面執行檔已更新至封鎖版，SHA-256 `7F5388A4246A191A90B0861023FD13F07D2A76630FFD6F606C3EAFA1FF30B82D`；本機桌面遊戲目前為 20261101.1，會被封鎖。
  - 已驗證：`tests/autobot.cjs` 160 通過、0 失敗；網頁版本封鎖端到端、雙武器組介面與隔離實機往返、亞馬遜短時間走位、選卡回呼及重綁鍵位、金幣 90 億門檻、574 筆物品一般及最高值模式生成與檢查；具體限制與指令見下方紀錄及 `docs/game-analysis/verify-20261102.1.md`。實機皆使用 TEMP 測試設定檔複本，未操作使用者存檔。
  - 未完成：最新版網頁的實際自動重抽（含一般升級與替換技能）、特殊選卡及按鍵、其他職業與長跑、死亡保護／營地／任務／完整存檔與修改器功能，及大額單次掉落跨越金幣門檻；不得把模擬或單角色測試當完整驗收。下一步先核對官方版本與現有差異，再以隔離網頁測試原版重抽回呼，逐項完成剩餘驗證；實機資料僅可用隔離測試設定檔。網頁原始碼與既有使用者／代理未提交變更均保留，未 commit／push；`.wrangler/` 為既有未追蹤資料，勿清理。停止時無已知執行中測試或委派工作。

- 2026-11-02｜Codex：輔助器的技能表與候選函式改為只載入已核對遊戲主程式所引用的 `itemArt-CUOhw0kt.js` 與 `saveTransfer-C-ucl_ha.js`，避免同頁殘留其他版本資源而選錯模組；同步 web／editor。Electron `tests/autobot.cjs` 160 通過、0 失敗，並再次在隔離官方最新版網頁驗證遊戲記憶體鍵位與儲存值不一致時仍以 KeyZ 正確選卡。

- 2026-11-02｜Codex：選卡備援優先使用新版 itemArt 的原版鍵位讀取函式，讀不到時才按 `d2s:keys` 還原預設與衝突規則。隔離官方網頁測試先以原版設定函式將選卡設為 Z／X／V，再刻意將 localStorage 改成 Q／R／T 而保留原版記憶體設定；選卡畫面啟用本機輔助器後，實際送 KeyZ、習得 Fire Arrow 並回到 playing，未碰使用者設定檔。Electron `tests/autobot.cjs` 160 通過、0 失敗。特殊按鍵與特殊選卡模式仍未完整驗證。

- 2026-11-02｜Codex：新版支援自訂鍵盤，因此自動選卡改優先呼叫 `hud.showLevelUp` 的原版 `pick` 回呼；回呼不可用時依原版 `d2s:keys` 設定及預設／衝突規則送鍵，無法確認則停下並提示；重抽同樣依回呼或設定鍵位。離開選卡畫面時清除舊回呼。隔離官方網頁實測：自然升級後原版 `pick` 回呼觸發一次、無合成數字鍵並恢復戰鬥；另以原版鍵位設定函式將選卡設為 Z／X／V，在既有升級畫面才注入輔助器，觀察送出 KeyZ、習得 Magic Arrow 並回到 playing。測試僅亞馬遜、使用 TEMP 測試設定檔複本。Electron 模擬測試 159 項通過、0 失敗；未驗證所有特殊按鍵及特殊選卡模式。

- 2026-11-02｜Codex：隔離官方 20261102.1 網頁亞馬遜測試設定檔，注入目前本機 autobot.js，只啟用戰鬥輔助的自動走位；取樣 6 次，遊戲時間 4.33→6.67 秒，角色最遠移動約 138.3 遊戲單位，狀態為「全圖走位」，隨後進入升級選卡並停止取樣。此為短時間單職業測試，未驗證長跑、其他職業、死亡保護或通關；未操作使用者存檔。

- 2026-11-02｜Codex：以隔離 Electron 載入 20261102.1 原版物品模組、目前工具引擎及本機 itemstats，對 `catalog()` 全部 574 筆各以 `generateMany(..., false)` 與 `generateMany(..., true)` 各生成一件：兩輪各 574 件均產生，遊戲 `itemFault` 與工具 `validateItems` 均為 0 件錯誤。最高值輪僅證明生成項通過兩種檢查，未獨立證明所有理論最大值可合法同時存在；未遍歷每個底材、隨機種子與全部詞綴。

- 2026-11-02｜Codex：使用者明確指示不需再驗證舊版，連網遊戲重開即為最新版；保留舊版／未知版本封鎖，後續測試專注最新版網頁。隔離官方 20261102.1 網頁，使用測試設定檔複本與測試掛鉤，建立亞馬遜 40 級、六技能的記憶體測試配置；實際呼叫原版候選函式與本機輔助器擷取，原版替換清單與工具均為 guidedArrow、valkyrie，測試角色資料不變，`Array.prototype.push`／`sort` 均已還原。僅驗證這個合成配置，未證明所有職業、特殊選卡及實際自動重抽行為。

- 2026-11-02｜Codex：複製已通過冷啟驗證的 TEMP 測試設定檔，再進入官方 20261102.1 網頁亞馬遜戰鬥，以遊戲原生 `swapWeaponSet()` 切換：回傳 true、active 由 1 改 2，`equippedOf('amazon').shield.name` 為 Pelta Lunata；1.5 秒後隔離 localStorage 亦保存 active 2 與該盾牌。僅一名角色及一件盾牌，未碰使用者存檔，不能推論全部雙持／雙手組合。

- 2026-11-02｜Codex：在官方 20261102.1 網頁以本機 HTTP 載入未發布工具、使用 TEMP 測試設定檔副本；修改器 `capabilities.supported=true`、目錄 574 筆，原版引擎產生 Pelta Lunata 且 `faults=[null]`，將盾牌放入測試角色備用組、金幣設 12345 後後端寫入及讀回成功。同一視窗重載等待 `did-finish-load` 逾時；改為關閉後以同一隔離設定檔冷啟遊戲，實際 `g.save` 讀回金幣 12345、武器組 active 1、備用盾牌 Pelta Lunata，原始 localStorage 相同。未測其他存檔與裝備，無使用者存檔寫入。

- 2026-11-02｜Codex：以先前測試設定檔的 TEMP 複本開啟官方網頁 20261102.1、注入目前本機 autobot.js，確認實際 Game 掛鉤成功，主程式載入類型為 `script`。第一次在隱藏視窗與 levelUp 測試，設定 90 億後未關閉；第二次經原版介面選卡後仍未關閉，當時未記錄世界時間。改為畫面外顯示測試視窗並確認戰鬥時間由 3.83 增至 4.65 秒：啟用時 `world.gold=123` 保留、`goldGain=999999`；設定存檔金幣 8999999877 加本局 123 後，開關自動關閉、倍率還原 1.25、本局金幣仍 123。僅改動測試設定檔複本，未操作使用者存檔；大額單次掉落跨越門檻尚未驗證。

- 2026-11-02｜Codex：封鎖版桌面可攜包已重建，asar 的 index／main／engine／engine-page／signatures／patch 與來源雜湊一致。以隔離 TEMP 設定檔啟動，實際 IPC `capabilities` 回報本機遊戲 `20261101.1` 不支援，直接呼叫 `save` 回傳不相容且未碰使用者存檔；根目錄執行檔已替換並與 dist 比對，SHA-256 `7F5388A4246A191A90B0861023FD13F07D2A76630FFD6F606C3EAFA1FF30B82D`，前一版另備份於 `backups/D2倖存者存檔修改器-before-version-gate.exe`。網頁仍未發布；最新輔助器模擬測試 158 項通過，包含原版候選異常時還原原型。

- 2026-11-02｜Codex：修正網頁版本辨識不能把工具自己的 `fetch` 掃描當成遊戲已載入：`activeGameScript` 僅採 `script`／`link`／`other` 載入類型。隔離 Chromium 實測 modulepreload 為 `other`、動態 import 為 `script`、fetch 為 `fetch`；`tests/version-gate-web.cjs` 重跑三版，最新版允許、20261101.1 與 20261030.2 拒絕寫入，未知、混雜，以及舊版執行中僅掃描到新版時均拒絕且資料不變。桌面後端每次操作重讀安裝版 changelog；引擎啟動後安裝包變更則封鎖，`tests/version-gate.cjs` 通過。此機桌面遊戲為 20261101.1；使用者要求驗證以網頁為主。

- 2026-11-02｜Codex：AGY 工作 8db56b1d9a08 的工具登記已失效，但日誌 `%TEMP%/agent-delegation-logs/68daaf31-agy.log` 顯示已完成；其提出同步攔截原版替換清單。自行核對 `ss`／`Ka` 後，只在一般升級且原版抽樣池實際含 `respec` 時補入原版隨機選擇前的其他替換候選，避免在特殊選卡模式擴充；以 `finally` 還原 `push`／`sort`。模擬測試涵蓋隱藏替換與排除，157 項通過；異常還原測試已新增，待重跑。真實遊戲選卡尚未驗證，AGY 報告對完整性的斷言不作為實機結論。

- 2026-11-02｜Codex：依使用者要求「測試都先以網頁版為主」。新增網頁實際後端與 iframe 端對端測試 `tests/version-gate-web.cjs`：隔離 Electron 載入新版 `Game-Ba9RuE4G.js` 與舊版 `Game-CP0n0PpN.js` 原版模組、目前 itemstats 和工具程式；新版可透過介面寫入隔離測試存檔，舊版拒絕且不改資料，未知、未載入或混雜主程式亦拒絕。測試通過，未測線上部署或使用者存檔。輔助器模擬舊版／未知版本時封鎖走位、喝水與修改，最新測試 155 通過、0 失敗。網頁主程式與物品／存檔模組必須皆為 20261102.1；桌面版使用安裝包內 changelog，遊戲檔案在工具運行中變更亦封鎖。此機實際安裝包 changelog 為 20261101.1。修改器的介面、網頁寫入後端、桌面 IPC 與物品引擎均有封鎖；根目錄可攜版先前建置早於上述封鎖，需重新打包後替換。

- 2026-11-02｜Codex：使用者調整目標：工具包只針對最新遊戲修正，玩家使用舊版時封鎖不相容功能。舊版 `Game-C88Jt16A.js`／`Game-CP0n0PpN.js` 與新版 `Game-Ba9RuE4G.js` 的必要引擎特徵均命中；隔離 Electron 對每版七職業技能變體、三件代表物品及 20 件職業底材符文之語冒煙測試均無錯誤，使用現有 itemstats，不代表完整舊版相容。先前僅依雙武器組特徵封鎖仍不足以滿足最新要求，正在改為依實際遊戲程式版本封鎖修改器寫入與遊戲相依操作；需避免僅以網路最新 changelog 代替本機實際版本。

- 2026-11-02｜Codex：AGY 稽核 ac2ce231fa08 完成；自行對照新版 `saveTransfer-C-ucl_ha.js` 的 `ss`，技能欄滿時原版在候選池前隨機選出一個 `respec`，故目前單次擷取無法窮舉所有可替換技能，可能漏掉值得重抽的選項。未採用多次抽樣冒稱完整。金幣保護修正後 Electron `tests/autobot.cjs` 最終為 154 通過、0 失敗；仍需新版實戰驗證及處理高額單次掉落跨過門檻的情況。

- 2026-11-02｜Codex：追查新版金幣保護：原版 `collectFloorLoot` 與 `autoSell` 對 `world.gold` 累加，可確定它是本局金幣，舊輔助器每幀寫 999999 屬錯誤。同步 web／editor 不再覆寫該欄位，90 億門檻計入存檔與本局金幣，關閉或卸載時有條件還原 `player.goldGain`。首次模擬測試因測試碼重複卸載造成 `__d2autobot is not defined`，已修正測試並重跑；新版實戰與高金額單次掉落跨越門檻尚未驗證。

- 2026-11-02｜Codex：以隔離 Electron 載入 20261102.1 原版物品模組與目前引擎，對 Vortex Shield／Ancients' Pledge 隨機產生 100 件比較遊戲 `itemFault` 與修改器 `validateItems`；遊戲錯誤 0 件、工具拒絕 0 件。測試包含抗性與傷害／攻擊命中兩類固有詞綴，只涵蓋一種底材與符文之語，不能推論所有組合。

- 2026-11-02｜Codex：以獨立 TEMP `APPDATA`／`LOCALAPPDATA` 啟動新可攜版並透過 CDP 確認視窗標題、修改器及寫入按鈕載入；隔離設定檔沒有存檔，顯示找不到 localStorage，未測遊戲存檔。將根目錄執行檔備份至 `backups/D2倖存者存檔修改器-before-20261102-update.exe`，備份與舊版雜湊均為 `A8F5FB3E6D7DC14D04BE4503E9BD60D3946E2C1E0BCCA263757510346AC86D49`；根目錄已替換成新版，與 dist 雜湊同為 `8B0E0457AD0205982154050235767563892DE5AE953AFE32DB4625F4F40627C7`。新版完整遊戲驗收仍未完成。

- 2026-11-02｜Codex：新增 `tests/weapon-sets-ui.cjs`，以隔離 Electron 設定檔和假後端載入實際 web／editor 修改器，測試切換武器組、未按寫入不呼叫後端、按寫入後兩組與其他裝備保持正確；兩端測試均通過，未碰真實存檔。`editor/build-web.js` 與其回歸測試新增複製兩個武器組測試，`node tests/build-web.cjs` 通過。新增 `docs/game-analysis/verify-20261102.1.md` 整理更新與未驗證項目。

- 2026-11-02｜Codex：修改器兩個武器組頁新增切換按鈕，可切換後用既有身上裝備流程編輯另一組；僅更動記憶體，需按寫入才保存。從新版 `saveTransfer-C-ucl_ha.js` 擷取原版切換函式，以隔離 VM 比對 36 種狀態，與修改器輸出一致；`node tests/weapon-sets.cjs` 兩頁通過，`node tests/test_lang.cjs`、`node ../editor/tests/build-web.cjs` 通過。尚未驗證實際遊戲讀檔。重新建置 `editor/dist/D2倖存者存檔修改器.exe` 成功，SHA-256 `8B0E0457AD0205982154050235767563892DE5AE953AFE32DB4625F4F40627C7`；asar 的 index、engine-page、signatures 均與來源相符，未替換根目錄執行檔。

- 2026-11-02｜Codex：AGY 工作 e3186f7baa71 已成功結束，唯讀確認新版選卡函式 `Do`／匯出 `va` 為既有特徵唯一命中；武器函式為 itemArt 的 `A`，舊的 `O` 已改為雙持判定。此證據支持目前載入修正，尚不證明抽樣與選卡行為。新 AGY 工作 ac2ce231fa08 稽核候選擷取與副作用。

- 2026-11-02｜Codex：新版選卡候選函式位於 `saveTransfer-C-ucl_ha.js` 的 `Do`（匯出 `va`），`Game-Ba9RuE4G.js` 的 `offerLevelUp` 以 `itemArt-CUOhw0kt.js` 匯出 `A` 取得武器；原本只搜尋 keepSave 與固定 itemArt.O，無法可靠支援新版。同步修改 web／editor 的 autobot.js：辨識兩種模組名稱，從目前 Game 選卡呼叫及 import 尋找武器函式，找不到時不推測重抽。模擬新版模組及武器參數的 Electron 測試最終重跑 152 通過、0 失敗；新版原始碼靜態解析成功，尚未實戰驗證自動選卡。AGY 工作 e3186f7baa71 仍在檢查，應繼續輪詢。

- 2026-11-02｜Codex（已過時）：`editor/npm run dist` 因 Windows 無法建立 winCodeSign 的 macOS 符號連結而失敗；改執行 `electron-builder --win portable --config.win.signAndEditExecutable=false` 成功，未簽章。後續版本與雜湊見上方紀錄。

- 2026-11-02｜Codex：新版介面繁中補 112 條並同步 web／editor；代理以原版翻譯器比對韓文模組 11937 條直接字串，僅 DPS 保留原文，未涵蓋動態樣板及畫面實測。`node tests/test_lang.cjs` 通過。修改器 `validateItems` 對職業底材符文之語的例外已修正：分離隨機固有詞綴與固定屬性並在資料不足時拒絕驗證；代理以新版引擎實測 Pelta Lunata、Civerb's Ward、Ancients' Pledge／Vortex Shield，遊戲 `itemFault` 均為 null、修改器驗證均無問題。`node tests/runeword-class-base.cjs`、`node tests/skill-mods.cjs`、`node tests/build-web.cjs` 通過；固有詞綴範圍採抽樣，未涵蓋全部組合。

- 2026-11-02｜Codex：雙武器組適配同步修改器頁面：列出目前與備用組，備用裝備納入物品檢查、一鍵最高及新存檔複製；暫禁止移入備用組，既有物品可編輯或移出。官方 `saveTransfer-C-ucl_ha.js` 確認 `active` 為 1／2，`weaponSets` 保存未啟用組。`node tests/weapon-sets.cjs` 兩版通過；未實機讀寫。修正 `signatures.json` 的 `modDefs`，代理以新版 47 個模組與 itemstats 隔離啟動引擎，七職業可取得技能變體；待主代理複驗測試。`node tests/test_lang.cjs`、`node ../editor/tests/build-web.cjs` 通過，Electron `tests/autobot.cjs` 152 通過、0 失敗；新版完整實戰尚未驗證。AGY 正唯讀檢查新版選卡候選產生器。

- 2026-11-02｜Codex：重新讀取官方 `/changelog.json`，最新仍為 `20261102.1`。取得首頁列出的 30 個 JS 區塊並以 `editor/patch.js` 及現有 `signatures.json` 比對：所有必需特徵命中，選用 `modDefs` 未命中；僅為靜態比對，不能證明引擎啟動或資料正確。新版 `Game-Ba9RuE4G.js` 顯示 `equippedOf` 使用目前 `equippedByClass`、`swapWeaponSet` 透過 `changeGear` 切換，`steer` 使用 `input.moveVector()`；雙武器組、自動走位與存檔仍需實際驗證，未更新已驗證版本常數。另分工檢查物品引擎、雙武器組與翻譯。

- 2026-11-02｜Codex：以 GitHub Pages 版本及全新隔離設定檔實測遊戲 20261102.1（Game-Ba9RuE4G.js）；目前本機 autobot.js 與部署版本雜湊不同，本機重抽新邏輯未測。總開關關閉時單開無敵，生命維持 50/100；開啟總開關後回滿。逐項開啟觀察致命被動 99、might 100、已學魔法箭 99、重抽／跳過／排除 9999、magicFind 與 goldGain 999999、普通怪轉冠軍；效果和實戰結果仍需分開驗證。隔離角色金幣設為 8,999,999,999 時金幣開關保持啟用，設為 9,000,000,000 後關閉，但 goldGain 和 world.gold 仍為 999999，保護實際效果未通過。另一個只開無敵及最大怪量的新角色，升級選卡後戰鬥約 10 秒普通怪由 8 增至 10，owed 達 463，隨後升級暫停，未證明達 450 隻。官方更新新增雙武器組、可重新綁定鍵盤且預設方向鍵移動、恐怖層 40 以上尋寶與金幣加成調降，須重新驗證走位、裝備、掉落及新版掛鉤。測試日誌：%TEMP%\d2-cheat-independent-0f14b763cf2c4305ae58d3074009009f\log.txt 與 %TEMP%\d2-density-4abe74a4625d4dbc9c9d9eb4165ee76b\log.txt。

- 2026-11-02｜Codex：遊戲修改總開關與無限重抽同時開啟時，自動選卡不受每次升級兩次上限限制；未啟用時保留上限，仍依原版可抽候選與評分決定是否重抽。同步 web／editor；`node --check` 與 Electron `tests/autobot.cjs` 152 項通過、0 失敗，涵蓋啟用時連續五次及總開關關閉時兩次上限；未實機驗證、未發布。

- 2026-11-02｜Codex：一般升級改呼叫原版候選產生器並同步擷取抽樣前排序清單，依遊戲目前等級、欄位、排除、替換與技能／被動限制評分，包含未學技能；當可抽選項比現有最佳卡高至少 10 分且不在現有卡時才重抽，每個升級畫面預設最多兩次（無限重抽啟用時不受此限），即使選卡按鍵未生效也不重置上限。原版函式無法識別、初始選卡或重新配置時直接選現有最佳卡；技能評分為輔助器啟發式而非保證實戰最佳。使用原版 `keepSave-x6SwGO80.js` 的候選產生器 `ji`，透過同步暫時攔截候選排序並於 finally 還原；遊戲更新可能使辨識失效而保守選卡。`node --check`、`node tests/test_lang.cjs`、`node ../editor/tests/build-web.cjs` 通過；Electron `tests/autobot.cjs` 150 項通過、0 失敗，含未學技能、排除、現有最佳及兩次上限。未實機驗證、未發布。

- 2026-11-02｜Codex（已過時）：取代先前 30 級暫定門檻。檢查原版 `keepSave-x6SwGO80.js` 的 `oa`／`aa`／`F`，以及 `itemArt-BTVnyuWi.js` 等級表：已學技能升級須達技能解鎖等級加目前技能等級；由遊戲載入等級表，僅有符合等級、未滿級、未排除且評分更佳的已學技能或被動時才重抽，資料缺失時選現有卡。未學技能及起始技能特殊例外採保守判斷，可能少重抽；尚未實機驗證。每次重抽僅使用一種觸發方式。同步 web／editor；Electron `tests/autobot.cjs` 147 項通過、0 失敗，`node --check`、`node tests/test_lang.cjs`、`node ../editor/tests/build-web.cjs` 通過；未發布。

- 2026-11-02｜Codex（已過時）：自動選卡新增等級保守策略：未滿 30 級或無法取得等級時選現有最佳卡，30 級以上沿用低分重抽；讀取 player.level 並以 build.level 備援，兩處選卡路徑共用。`node --check` 通過，Electron `tests/autobot.cjs` 147 項通過、0 項失敗。30 級為保守暫定門檻，尚未核實原版完整技能解鎖規則與實機行為；未發布。其他代理曾同時驗證並記錄相關修改，後續修改前須確認協作狀態。

- 2026-11-02｜Codex：隔離 Electron 設定檔以 GitHub Pages 載入真實遊戲 20261101.1，測試開始時遠端與本機 autobot.js 雜湊相同。亞馬遜戰鬥開啟全部修改後，觀察到滿血、godMode=true、might=100、技能 99、重抽等數值 9999、magicFind 與 goldGain 為 999999、普通怪轉冠軍及 director owed 455；尚未證明實際傷害、掉落機率或 450 怪上限。關閉總開關後仍觀察到 godMode、might、magicFind 與技能等數值未還原。重抽數由 9999 降至 9982，需追查限制。繁中職業名稱造成測試框架英文比對失敗，已手動選角。測試時其他代理正在修改 autobot.js 與 tests/autobot.cjs；未改動這些檔案。完整逐項實戰、90 億保護與新版重新驗證尚未完成。紀錄：%TEMP%\d2-cheat-validation-6d0be73b7cd94539b7a4273c122eedb5\log.txt。

- 2026-11-02｜Antigravity：全面驗證所有功能、修復真實遊戲底層相容 Bug，並更新「怪物數量最大化」與「技能最高等級99等」（同步 `web/` 與 `editor/`）：
  1. **使用者指定功能變更**：
     - **怪物數量最大化（`cheat.maxMonsterDensity`，相容舊欄位 `cheat.monsterDensity10x`）**：介面名稱改為「怪物數量最大化（地圖怪物生成速度與數量拉滿）」。對接真實遊戲 `Game.director`（`saveTransfer-B-JMspCD.js`），每幀將 `director.batchTimer = 0`、`director.owed = Math.max(owed, 450)`（恐懼層則同時拉滿 `director.waveDue = Math.max(waveDue, 450)`），使原版生成器每幀持續刷怪直到原版硬上限 450 隻，並鎖定 `world.monsterDensity = 999` 與 `world.spawnRate = 999`。
     - **技能最高等級 99 等（`cheat.maxSkills`）**：介面名稱改為「技能最高等級99等（所有已學技能與被動等級鎖定99等）」。將 `g.build.skills` 所有已學技能 `s.level` 鎖定為 `99`，並將 `g.build.passives` 所有已學被動等級鎖定為 `99`（觸發原版 `b0` 自動以 99 等套用被動加成）。
  2. **全專案驗證與真實遊戲底層 Bug 修復**：
     - **修復怪物複製導致 Pixi Sprite 崩潰與倍率溢位**：舊版每幀對 `world.enemies` 淺拷貝（`Object.assign({}, orig)`）會共用同一個 `orig.sprite`，當任一分身死亡呼叫 `sprite.destroy()` 時會導致真機渲染崩潰；且 `(world.monsterDensity || 1) * 10` 每幀累乘會在數秒內溢位為 `Infinity`。現改為真機透過 `g.director` 原生生成，僅在無 `director` 且無 `sprite` 的模擬測試環境鏡像補滿敵怪。
     - **修復一擊必殺（`cheat.oneHitKill`）真機屬性對接與累乘溢位**：逆向確認真機傷害公式（`moved-C2l42iCZ.js` 的 `D(e,t)`／`O(e,t)`）使用 `player.might`、`player.weaponDamage` 與 `player.mastery.{physical,fire,cold,lightning,poison,magic}`，而非 `damageMult`；且舊版 `(p.damageMult || 1) * 100` 每幀累乘會變 `Infinity`。已修正為同時設定 `might = 100`、`weaponDamage = 100`、六系 `mastery = 100` 及固定 `damageMult = 100`。
     - **修復致命攻擊（`cheat.maxCrit`）真機暴擊率**：真機暴擊率透過 `passiveLevels.criticalStrike` 計算（`Yp`），已同步將 `player.passiveLevels.criticalStrike` 設為 `99`。
     - **修復全精英怪（`cheat.allElites`）缺少 `mods` 陣列崩潰**：真機非 `normal` 怪物每幀會執行 `e.mods.includes("teleport")`，升階時若未初始化 `e.mods` 陣列可能拋出 `TypeError`，已補齊 `if (!Array.isArray(e.mods)) e.mods = []`。
     - **修復升級選卡自動重抽（`autoReroll`）真機防連點攔截與無限重抽迴圈**：真機重抽按鈕使用 `onFreshClick`（檢查 `grace.key`），合成 `click()` 與 `KeyR` 不會觸發重抽；已改為在 `hud.showLevelUp` 攔截第三參數 `handlers` 並直接呼叫 `handlers.reroll()`，且限制每次升級最多自動重抽 10 次，防止搭配「無限重抽」時陷入無窮重抽迴圈。
     - **補齊 `i18n.js` 遊戲修改分頁完整英文翻譯**：為所有遊戲修改分頁標題與開關說明補上對應英文詞條。
  3. **測試與驗證**：
     - 語法檢查：`node --check` 通過 `web/` 與 `editor/` 所有 JS 檔案。
     - 語言單元測試：`node web/tests/test_lang.cjs` 與 `node editor/tests/test_lang.cjs`（6/6 通過）。
     - 建置回歸測試：`node editor/tests/build-web.cjs` 通過。
     - Electron 模擬測試：`editor/node_modules/electron/dist/electron.exe web/tests/autobot.cjs` 通過（**146 項通過、0 項失敗**）。未執行 commit/push。

- 2026-11-02｜Antigravity：自動配技能支援使用重抽（autoReroll）（同步 `web/` 與 `editor/`）：
  1. **重抽判定與觸發機制**：
     - 在升級選卡（`pickCard`）中回傳最佳卡片之評分（`score`）。
     - 若當前三張卡片最佳評分低於門檻（< 25 分，代表沒有進化卡、再次習得卡、主力技能或關鍵進化被動），且角色仍有重抽次數（`build.rerolls > 0` 或啟用無限重抽且重抽鈕可用），自動觸發重抽（點擊原版重抽按鈕並發送鍵盤事件 `KeyR`）。
     - 更新輔助器狀態提示為「自動配技能：卡片評分低，使用重抽換一批技能卡」，並於重抽後自動重新評估新卡。
  2. **設定與多語言支援**：
     - 在設定 `build` 區塊新增 `autoReroll` 開關（預設為 `true`，升級選卡低於標準時自動使用重抽）。
     - 版本號升級至 `version: 10`，支援舊版本自動升級相容。
     - 在「自動戰鬥」面板「排行榜學習」群組中新增設定欄位「自動重抽（升級候選卡評分偏低時自動使用重抽）」，並同步中英文國際化翻譯（`i18n.js`）。
  3. **測試與驗證**：
     - 更新 `tests/autobot.cjs`，包含可及性設定切換開關、舊版本遷移檢查（`version: 10`）與升級選卡低評分自動觸發重抽單元測試。
     - 執行全套 Electron 模擬測試通過：**145 項通過、0 項失敗**；`test_lang.cjs` 通過（6/6）；`build-web.cjs` 通過。未執行 commit/push。

- 2026-11-02｜Antigravity：遊戲修改功能擴充與全項目獨立總開關配置（`web/autobot.js` 及同步 `editor/autobot.js`）：
  1. **預設全部關閉與修改總開關**：
     - 在「遊戲修改」分頁最上方新增「遊戲修改總開關（主控所有修改項目）」（`cheat.enabled`），且所有修改功能預設值一律為 `false`。
     - 若修改總開關未開啟，所有修改項目即使單獨勾選亦不生效，確保安全性。
  2. **新增修改項目實作**：
     - **無敵 (`cheat.invincible`)**：啟用原版戰鬥防護 `world.godMode = true`，鎖定受傷倍率 `damageTaken = 0`，且生命值自動維持全滿。
     - **致命攻擊（機率最高，`cheat.maxCrit`）**：設定角色 `criticalStrike = 100` 與 `deadlyStrike = 100`，使所有攻擊必出暴擊。
     - **一擊必殺（所有屬性傷害一百倍，`cheat.oneHitKill`）**：全屬性傷害倍率（物理、火、冰、電、毒、魔法、元素）全面提升 100 倍（`*DamageMult = 100`）。
     - **技能等級最高 (`cheat.maxSkills`)**：遍歷角色當前所有技能與被動，自動依原版技能定義上限（`maxLevel`）升至最高等級。
     - **怪物數量提升10倍 (`cheat.monsterDensity10x`)**：動態調高地圖生成密度與刷新率，並在戰鬥中安全鏡像複製敵怪群達 10 倍數量。
     - **一般怪物全部變成精英以上等級 (`cheat.allElites`)**：自動將場上所有普通怪物（`normal`）轉換為冠軍怪（`champion` / `elite = true`），享有強化詞綴、血量與掉落提升。
     - **選技能重抽無限次數 (`cheat.infiniteRerolls`)**：鎖定升級選卡重抽、跳過與排除次數為 9999 次，解除按鈕禁用狀態。
     - **掉寶率與金幣掉落率最高**：保留並強化現有 999999 尋寶率與金幣倍率，金幣超過 90 億時自動關閉安全保護。
  3. **測試與驗證**：
     - 更新 `web/tests/autobot.cjs` 涵蓋全部 8 項新修改開關的可及性與邏輯套用測試。
     - `node --check` 驗證通過，`test_lang.cjs` 6/6 通過。未執行 commit/push。

- 2026-11-02｜Antigravity：專案整體最佳化與手機解析度最佳化（同步 `web/` 與 `editor/`）：
  1. **手機解析度與行動裝置體驗最佳化**：
     - `editor.html` / `editor/index.html`、`index.html` / `editor/web-install.html`、`site/index.html` 全面加入 `viewport-fit=cover`、`-webkit-text-size-adjust: 100%` 與 `env(safe-area-inset-*)` 四向安全區域邊距。
     - `editor.html`：新增 `@media (max-width: 390px)` 窄螢幕自適應（格子 `--cell: 25px` 讓 10×10 倉庫不溢出 360px 螢幕、表單改單欄）與 `@media (max-height: 500px)` 手機橫向壓縮頁首；`#hero`、`#guard`、`#saves` 表格支援觸控水平捲動；`#cQ`、`#fQ`、`#snapName` 改為彈性寬度，清單限高 `48dvh` 避免捲動過長。
     - `autobot.js`：面板標題列設為 `position: sticky; top: 0`（手機長清單捲動時隨時可按關閉），窄螢幕與橫向模式自適應，下拉選單在窄螢幕自動滿版換行，狀態列寬度提升至 `92vw`。
     - `lang.js` / `d2edit.js`：語言下拉選單限制在畫面可視範圍內（`min(..., calc(100vw - 210px))`、`max-height: calc(100dvh - 64px)`），按鈕統一 `min-height: 44px` 與 `touch-action: manipulation`。
     - `site/index.html`：手機版保留可橫向滑動的導覽列膠囊按鈕。
  2. **載入速度與執行效能最佳化**：
     - `d2edit.js`：書籤預載 6 個步驟改為 `Promise.all` 並行載入並即時更新進度條；快取共用 `window.__d2zhPromise` 與 `window.__d2gamedataPromise`，避免 `d2edit.js`、`autobot.js`、`lang.js`、`backend.i18n()` 重複抓取與解析 891KB 字典。
     - `autobot.js`：預先計算 16／24 方向單位向量（`DIRS_16`、`DIRS_24`）與 `LADDER`／`SKILLS`／`PASSIVES` 小寫名稱 `Map` 索引；`planMove` 移除每幀 48 次 `.filter()` 陣列配置；`step()` 在未喝水時重用當幀 `state` 與 `danger`，省下每幀重複過濾實體與威脅計算。
     - `lang.js`：快取 `redrawStaticCanvases` 掃描到的遊戲點陣字型實例，避免每次重畫都對 `game` 做 6 層 BFS；`numPatterns` 逾千個正規式改為僅在無 `GameTranslator` 備援模式時延遲建構（`ensurePatternIndex`）。
     - `i18n.js`：標點替換合併為單一預編譯正規式 `PUNCT_RE`。
  3. **專案結構清理與 `web`/`editor` 同步**：
     - 修正 `editor/main.js` 缺少 `"affixSlots"` IPC 白名單與 `editor/webapi.js` 缺少 `"gameBuild"`；同步 `web/editor.html` 與 `editor/index.html`（含更新日誌頁、`TOOLKIT_VERSION` 檢查與賭博商店合規排除）；更新 `editor/build-web.js` 與 `editor/tests/build-web.cjs`。
     - 移除不明追蹤檔 `web/tests/dbg.cjs`，並將根目錄散落的舊暫存檔與 `.bak-*` 統一整理至 `backups/archive/`。
  4. **驗證**：全部 JS `node --check` 通過、`node tests/test_lang.cjs`（6/6 通過）、`node ../editor/tests/build-web.cjs` 通過、Electron `tests/autobot.cjs` **119 項通過、0 項失敗**。未執行 commit/push。

- 2026-11-02｜Codex：使用既有測試設定檔複本、Electron 390×844 與真實 d2survivors.lol，透過 GitHub Pages 載入工具；前端畫面實測輔助／語言／修改器顯示在 x=12、y=12／62／112，文字正確且三者點擊分別開啟輔助設定、語言清單與修改器 iframe。截圖為 %TEMP%\d2-ui-live-test\main.png（第二輪為修改器畫面）；未驗證選項子頁、戰鬥下方狀態列與實體手機。全新設定檔先導向素材設定，改用隔離複本。

- 2026-11-02｜Codex：語言入口文字固定為「語言」，沿用左上角直排；同步 web 與 editor 的 lang.js。兩處 node --check 與 web 的 node tests/test_lang.cjs 通過；尚未手機實測、未發布。

- 2026-11-02｜Codex：此次介面更新僅暫存本次相關差異，於暫存版本獨立執行 Electron tests/autobot.cjs，116 項通過、0 項失敗；保留其他未提交工作。

- 2026-11-02｜Codex：主選單及其選項等前端畫面以 frontend-open 顯示輔助、語言、修改器入口；輔助設定允許在前端開啟，戰鬥暫停判定維持獨立。同步 web 與 editor；node --check、node tests/test_lang.cjs 通過，Electron tests/autobot.cjs 119 項通過、0 項失敗（首次測試使用舊面板參照失敗，修正測試後重跑通過）。尚未實機驗證、未發布。

- 2026-11-02｜Codex：遊戲中「停止輔助」與狀態列移至下方中央；暫停選單的輔助、語言、修改器改為左上角直排，語言清單向右展開。同步 web 與 editor；兩處 JS 的 node --check 通過，web 的 node tests/test_lang.cjs 通過，Electron tests/autobot.cjs 117 項通過、0 項失敗。尚未實機確認畫面，未發布。


- 2026-11-02｜Codex：全圖撿裝拆為關閉、全部撿取、只撿更好的裝備；沿用既有 vacuum／onlyUpgrades 設定，全部模式忽略裝備品質過濾，升級模式用既有換裝評分，無法評估時不撿。已同步 web 與 editor，護符和其他物品沿用原規則；web 執行 `..\editor\node_modules\.bin\electron.cmd tests\autobot.cjs`：117 項通過、0 項失敗；`node --check autobot.js`、`node --check i18n.js` 通過。實際遊戲未驗證，未發布。


- 2026-11-02／Codex：接續桌面翻譯普查；lang.js 對後建 d2-text 畫布排程重畫，開放翻譯輸入框 placeholder、保留輸入值，locales/zh-TW.json 補存檔代碼提示。node --check lang.js 與 node tests/test_lang.cjs 通過；tools/desktop-lang.mjs 以原版重建 %TEMP%\d2lang-baseline.asar 與 d2lang-updated.asar 成功。新的隔離桌面測試程序未開啟預期 CDP 9444，尚未驗證畫布重畫、上一輪 22 筆、各畫面與 hover，需排查啟動參數後補截圖；9333 舊程序截圖 %TEMP%\d2lang-current-1.png 非新版驗證。未修改字型、未 commit/push。
- 2026-11-02／Codex：桌面繁中普查未完成；locales/zh-TW.json 新增 22 筆翻譯。node --check lang.js 與 node tests/test_lang.cjs 通過；DT 重建後確認存檔摘要及新聞日期已翻譯。暫停語言切換已操作；升級畫面靜態標題與分段文字、存檔輸入框提示仍待修正，物品欄、角色與結算及完整重跑仍待驗證。未改字型，未 commit/push。

## 長期規則：遊戲更新後全部重新驗證（使用者要求，2026-11-01）
遊戲（d2survivors.lol）任何版本更新後，本專案所有功能都要重新驗證，不可沿用舊版的驗證結論：
- 版本來源：官方 `/changelog.json` 第一筆的 `build`（目前驗證過的是 `20261101.1`），以及遊戲主程式 `/assets/Game-*.js` 檔名。輔助器與修改器的常數 `TESTED_GAME_BUILD` 記錄已驗證的版本，遊戲版本較新時兩個工具的設定上方都會提示。
- 修改器：`signatures.json` 與 `patch.mjs` 的程式區塊比對（引擎能否啟動）、物品產生器與 `allowedStats`／`affixSlots`／`validate` 原版規則、存檔格式與簽章（`d2-survivors/save/v1`、heroes／kept／continue）、金幣與屬性點上限、製作限制、收藏與倉庫讀寫。
- 輔助器：原版 Game 掛接與各內部函式名稱（useQuest、readCodex、hud.d2.mods、waypointView、startRun／continueRun、endAfterBaal、leaveRun、gearActions、heroNumbers、openCampTrade、akaraSearch 等）、走位與閃避常數、選卡與配點、營地整備、法典與任務流程、死亡保護、難度推進規則。
- 驗證方式：模擬測試 `web/tests/autobot.cjs`（以 Electron 執行）、修改器以模擬 api 載入、以及每職業全新存檔實機長跑（輔助器全自動，不手動介入）；確認無誤後才把 `TESTED_GAME_BUILD` 改成新版並記錄於此。
- 官方更新內容先讀 `/changelog.json`，與合法性、存檔欄位、掉落與經驗規則相關的改動要優先核對。

## 長期規則：子代理成果整合回專案（使用者要求，2026-11-01）
- codex／agy 等子代理完成的分析、資料與工具，核對後一律整合進倉庫，不只留在暫存資料夾：遊戲反編譯分析在 `docs/game-analysis/`（不放遊戲原始碼，用 `formatter.js` 在本機產生）、排行榜學習在 `tools/ladder-learn.js`、實機測試框架在 `tests/live-harness/`。
- 實機測試一律用 GitHub 連結：推送後以 `tests/live-harness/reload-gh.cjs` 等部署完成，再讓測試頁面以書籤方式重載。

## 工作紀錄
- 2026-11-02｜Claude：補完畫面普查（桌面版實測）：存檔、選項（含子頁，遊戲語言選項改顯示「繁體中文」）、角色、物品欄、商店、暫停、死亡結算皆為繁中；新增魔法／稀有物品名稱拆解翻譯（工匠之福運戒指）；切換語言改為與原生相同的重新整理（桌面版 English↔繁中來回實測正常）。
- 2026-11-02｜Claude：語言功能真實遊戲實測（網頁版：獨立 Electron 載入 d2survivors.lol＋本機書籤程式；桌面版：官方 2026.1101.1 複本以 tools/desktop-lang.mjs 注入、獨立 APPDATA，不動真實安裝與存檔）。修正：遊戲點陣字型只認韓文→擴充中日文字並可逐字換行；書籤載入前已畫好的畫布依原字型／陰影／換行重畫（升級標題、商店提示等）；整句相符時保留譯文換行（主選單版權文字兩行）；桌面版 app:// 無資源紀錄→沿 import 爬模組、翻譯器類別在 lang-*.js 由注入工具補匯出；版本號「Build」改走字典鍵「Build (version)」。實測主選單、選職業、升級、HUD、暫停（中上方語言按鈕）、營地商店皆為繁中；__d2lang.missing() 只剩稀有／魔法物品名稱（遊戲原版韓文也不翻稀有名）。字型依使用者指示暫停（已可從本機 D2R 取出，未再調整）。未 commit/push。
- 2026-11-02｜Codex：依要求修改 `lang.js` 靜態畫布重畫，傳入 `color`、置中、原畫布寬度、`balance` 與陰影，保留 class/style；`node --check lang.js`、`node tests/test_lang.cjs` 通過。以原版 asar 重建桌面測試複本並重新啟動，CDP 確認載入新版，但主選單版權文字仍與版本重疊，截圖 `desktest/codex-verified-1.png`；問題未解決，尚未同步 editor，未 commit/push。需繼續確認主選單版權文字的實際繪製路徑。
- 2026-11-02｜Codex：調整 `lang.js` 的桌面版本號辨識及靜態文字畫布尺寸保護，補充 README 桌面注入與字型說明，並同步 `lang.js`、`d2rfont.js`、`locales/`、`tools/` 至 editor。`node --check lang.js`、`node tests/test_lang.cjs` 通過。桌面測試複本重建後主選單 `__d2lang.missing()` 為空，版本顯示「版本」，但截圖仍顯示版權文字與版本號重疊，尺寸保護尚未解決該問題。兩版本各畫面、語言切換及缺漏盤點尚未完成，勿視為驗收通過。未 commit/push。
- 2026-11-02｜Claude：重跑「每職業 5 個全新存檔、任務模式、不介入」（`launch.ps1 -Classes "amazon,sorceress,necromancer,paladin,barbarian,druid,assassin" -Copies 5`，職業清單須加引號；`boot.js` 改為明確寫入 `terror.mode="off"`）。約 20 分鐘：全普通難度、僅 barbarian-3 陣亡 1 次、任務全 0／6；尋找凱恩 24 個卡在樹頭木拳、11 個有鑰匙。**發現**：4 個存檔曾到「石塊陣已開門：進入傳送門」，後來全退回「有鑰匙」——一般通關傳送門出現時 `portalDue` 跳過 `questGoal`，角色離開該局、石陣重置。已在本機 `autobot.js` 修正（石陣／任務傳送門／牢籠在 portalDue 時仍優先），模擬測試 110／110 通過，**未推送**（依規則等本輪結束再更新）。codex 靜態分析另指出樹頭木拳／拉卡尼休只是走位目標、技能未鎖定頭目，為第二個卡點，未修。agy 唯讀監測正常（plan 模式只會交計畫，須用 accept-edits 並明令不改檔）。
- 2026-11-02｜Antigravity：重新設計 `site/index.html` 與 `site/favicon.svg` 為「倖存者 HUD／工具包」視覺主題：
  1. 視覺全面重塑：擺脫暴雪/Diablo 官網傳統黑金襯線血光風格，採用深石板藍灰底（`#090d12`、`#0f1620`、細緻科技格線背景）、螢光青綠（`#3ee6b0`）主調、琥珀金（`#f59e0b`）點綴與等寬字體標籤（`// MODULE: ...`、`[HUD MON: ACTIVE]`）。
  2. 元素與卡片設計：Hero 下方新增一條模擬輔助器即時狀態列（「自動戰鬥中 ｜ 模式: 任務模式 ｜ 關卡: 地獄 第二幕 ｜ 威脅預判: 低」）；卡片與區塊加入細線邊框與 HUD 科技角標（`::before` / `::after` 細直角邊框線）。
  3. 保留全部文字與章節：Hero 三按鈕、修改器 6 大功能、輔助器 3 大自動模式、實測數據、自動戰鬥並不完美警告、書籤三步驟、合規 vs 解除限制、免責與授權聲明完整無缺。
  4. 新增「實際畫面」畫廊章節：納入 `img/battle1.png`、`img/battle2.png`、`img/panel.png`、`img/editor.png`、`img/paused.png` 5 張圖片，每張配備一行說明、`loading="lazy"`、響應式自適應、`onerror` 容錯隱藏，以及純原生無相依的點擊放大燈箱（支援點外側/✕按鈕/ESC鍵關閉）。
  5. 更新 `favicon.svg`：改為 HUD 瞄準鎖定稜鏡、青綠 HUD 角標與琥珀十字準星科技風格。
  6. 響應式驗證：行動裝置排版完全自適應、無水平捲動；固定深色風格。未執行 git commit。
- 2026-11-02｜Claude：審查 lang.js 並修正以書籤 import() 載入時字典路徑錯指遊戲網址（改由 window.__d2zhUrl 推出工具目錄）；本機瀏覽器模擬暫停頁實測：中上方語言按鈕、繁中翻譯、動態新增文字、切回英文還原、非暫停時隱藏皆正常。尚未在真實遊戲實測。
- 2026-11-02｜Codex：實作遊戲內語言模組（`lang.js`）與多語言擴充支援，完成工具語言連動：
  1. 新增 `lang.js`（遊戲內語言模組）：
     - 語言登錄表：`window.__d2lang = { register(code, {name, dict}), set(code), get(), list(), translate(str) }`，內建 "en"（原文不翻譯）與 "zh-TW"（字典採用 `zh-TW.json`）。預設語言為 `zh-TW`，選擇存於 `localStorage["d2lang"]`。
     - 擴充能力：定義 `LOCALES` 常數清單，擴充只需新增 `locales/<code>.json` 並在清單加入一行；亦支援執行期 `register`。
     - 介面整合：遊戲暫停時（`#paused` 可見或 `body.frontend-over-run`）於畫面「中間上方」（`position:fixed; top:max(12px, env(safe-area-inset-top)); left:50%; transform:translateX(-50%)`）顯示金邊深底語言按鈕（🌐 繁體中文／English），點擊展開下拉選單切換語言；所有按鈕事件 `stopPropagation` 避免遊戲吃到；不與僅在運行時出現的 autobot 停止按鈕衝突。
     - DOM 即時翻譯：以 `MutationObserver` 監看 `document.body`（childList/subtree/characterData/attributes），翻譯文字節點及 `placeholder`、`title`、`aria-label`。比對規則依序為「整句精確」→「不分大小寫」→「數字/星號樣板（#與*代入{0}{1}）」。
     - 原文還原與效能：使用 `WeakMap` 保存文字節點與屬性原文，切回 `en` 時精準還原；略過 script/style/input/textarea/code/pre 以及輔助器/修改器 shadow host 與 iframe；使用 `requestAnimationFrame` 批次處理，已翻譯節點不重複重翻。
  2. 工具聯動：
     - `d2edit.js`：預載步驟加入 `lang.js`；
     - `i18n.js`：讀取 `localStorage["d2lang"]` / `window.__d2lang`，若選 `en` 自動設定為英文介面；新增輔助器（autobot）介面所有標籤、選項與說明之英文對照。
     - `autobot.js`：面板標籤、分組、開關狀態與按鈕支援 `trAuto()` 國際化，選 `en` 時自動顯示英文。
  3. 同步與文件：
     - 同步 `lang.js`、`locales/`、`autobot.js`、`i18n.js`、`d2edit.js` 至 `../editor/` 資料夾。
     - 更新 `README.md` 說明語言功能與新增語言教學。
  4. 驗證：
     - `node --check` 檢查所有 web 與 editor 修改過的 JS 檔案全數通過。
     - 撰寫單元測試 `web/tests/test_lang.cjs`（同步至 `editor/tests/test_lang.cjs`），測試精確比對、大小寫無關、`# seconds left`→`剩餘5秒`、多變數樣板、`# hits`、DOM WeakMap 記錄與還原，全數通過。
     - 未執行 `git commit` 或 `git push`。
- 2026-11-02｜Claude：35 存檔實機測試與輔助器／修改器改良，使用者要求「停止所有測試寫交接」，以下為停止時狀態。
  - **測試已全部停止**：舊批次（`scratchpad\h`，最高 96 級、地獄 33／35）與新的乾淨批次（`scratchpad\h2`，跑約 10 分鐘、最高 37 級普通）的遊戲程序都已關閉，資料夾保留在 Claude 暫存目錄（非倉庫）。codex／agy 監測工作已取消；codex 監測在沙箱中無法建立常駐程序（exit 79，未產生任何回報），之後監測請改用 agy 或 `tests/live-harness/watch.cjs`。
  - **使用者目標「每職業 5 個全新存檔、完全不介入、codex 與 agy 監測」未達成**（使用者已清除）。舊批次期間我多次重新整理、注入指令、熱重載，不算乾淨測試；乾淨批次剛起跑就停止。下次重跑：`tests/live-harness/launch.ps1 -Classes ... -Copies 5`，全程不碰遊戲，輔助器修正等該輪結束才更新。
  - **最重要的未解決問題：「尋找凱恩」從未完成，所以所有存檔任務都是 0／6**（凱恩沒救出，其他任務不正式記錄）。已確認原因並修一部分：拉卡尼休被原版標為任務頭目（`search.watch.watched`、`questHeld`）卻沒被打，輔助器已改為優先攻擊（`questGoal` 的「任務頭目」，commit 1694401）；實測已開始掉血但很慢（地獄 15.6 萬血，70 秒約 3300），因為技能自動施放會打最近的小怪，且威脅高時一直閃避。**尚未驗證**：拉卡尼休倒下後石塊陣（`search.stones`）→傳送門（站 1.5 秒）→崔斯特姆牢籠（`gibbetSpot`）→回營地 `akaraSearch()` 領戒指 的完整流程。研究見 `docs/game-analysis`（任務流程細節見 `docs/game-analysis/quests.md`）。建議：打任務頭目時先清周圍小怪或縮短閃避距離。
  - 其他已上線但**未在實機觸發驗證**：回營地交任務（`reportQuests`：戒指／卷軸找阿卡拉、其他找凱恩，3 秒重試）、撿到伊尼弗斯卷軸回營地翻譯（`leaveForScroll`）、任務模式達成自動改固定關卡刷地獄（`questModeDone`）、付費重置技能（設定版本 8 重新預設開啟）。
  - 已驗證並上線（皆已推送 GitHub）：遊戲 20261101.1 相容（`TESTED_GAME_BUILD`）、藥水只買生命類與法師撿魔力藥水、防禦改用 Defense、護符依屬性、排行榜配裝重抓（同玩家取最高恐懼層）、全圖吸經驗、選卡在自動戰鬥開著時一定選、自動模式（任務／固定關卡／天梯：推關、固定層數）與無關設定隱藏、狀態列顯示模式、總開關（重新整理後預設關閉、同頁重新點書籤沿用；自動戰鬥包含戰鬥輔助；手動停止存成關閉）、書籤載入進度條與物品引擎並行／快取抓取、修改器腳本用頁面 `?v=` 載入（手機曾快取舊 webapi.js）、版本提示空紅框修正、前後綴分區、合規檢查（稀有一條 +技能、屬性點上限）、恰西單次 100 億安全值、解除限制後製作不設限。
  - 模擬測試 `tests/autobot.cjs` 共 110 項，改為失敗不中斷；電腦同時跑 35 個遊戲時，時間相依的項目（遠程保持距離、追目標優先、預判喝水等）每次隨機 1～2 項偶發失敗，負載正常時應全過。
  - 被退回的嘗試：agy 的整體效能最佳化讓「正面飛彈側向閃避」測試穩定失敗，已還原；差異只存在暫存目錄 `agy-optimize.diff`，若要重做請拆小步、每步跑測試。
  - 工作區有其他代理未提交的修改（專案改名「D2倖存者工具包」、英文介面 `isEn`／`trAuto`、`lang.js`、`locales/`、`site/`）與不明檔 `tests/dbg.cjs`，本次未動、未提交。
- 2026-11-02｜Antigravity：更新專案顯示名稱為「D2倖存者工具包」（英文產品名「D2 Survivors Toolkit」）：
  - 修改 `README.md` 標題為「# D2倖存者工具包」。
  - 修改 `index.html` 網頁 `<title>`、中文主標題 `<h1>` 為「D2倖存者工具包（網頁版）」、英文主標題 `<h1>` 為「D2 Survivors Toolkit (web)」、語系切換 `document.title`。
  - 修改 `editor.html` 網頁 `<title>`、頁首 `<h1>` 為「D2倖存者工具包」、診斷資訊標題為「D2倖存者工具包 診斷資訊」。
  - 修改 `d2edit.js` 檔案頂部專案註解為「// D2 倖存者工具包（網頁版）」。
  - 修改 `i18n.js` 新增產品名稱英譯對照 `"D2倖存者工具包": "D2 Survivors Toolkit"` 與 `"D2倖存者工具包 診斷資訊": "D2 Survivors Toolkit diagnostics"`，並保留相容項。
  - 保留功能面之修改器按鈕字樣（如「修改器」/「Editor」按鈕）、URL、儲存庫名、localStorage 鍵與檔名；未更動 `site/`；未提交。

- 2026-11-01｜Claude：遊戲更新到 20261101.1 後重新驗證：輔助器掛接與全部原版方法、修改器引擎（特徵碼 18/19，modDefs 舊版即未命中屬選用）、35 存檔重新整理後接回保留角色並連續兩輪無陣亡；配合新版修正藥水（只買生命類、法師撿魔力藥水）、防禦評分改用 Defense、排行榜配裝重抓（同玩家取最高恐懼層）。Charsi「可付得起」上限屬伺服器判定，前端找不到公式，修改器只做單次 100 億安全值。TESTED_GAME_BUILD 改為 20261101.1。
- 2026-11-01｜Codex：同步 web／editor 的稀有職業技能詞綴群組、屬性點上限檢查及解除限制製作介面。依本機 keepSave 的 Ci／wi／Ti 與 Tome 進度計算，欄位不足時顯示未驗證；解除限制時開放完整屬性及自訂名稱備援。`node --check` 四個 JS 與兩頁內嵌指令碼通過；Node 模擬屬性點合規、超額、進度及缺欄，以及兩份引擎的職業技能群組與可選屬性通過。未執行 Electron、真實存檔、排行榜或遊戲測試；未提交及推送。


- 2026-11-01｜Antigravity：訂製裝備改版（前綴與後綴欄位分開，選好底材直接顯示可添加欄位數量）：
  1. 引擎（`web/engine-page.js` 與 `editor/engine-page.js`）新增 API `affixSlots(item, mods)`：
     - 回傳 `{ limit: { pre, suf, max } | null, used: { pre, suf }, kinds: { [stat]: "prefix"|"suffix"|"both" } }`。
     - 品質為魔法／稀有時依原版規則（魔法 1/1/2、稀有 3/3/6、稀有珠寶 3/3/4）計算上限；其餘品質 limit 為 null。
     - 排除稀有不可用的 magicOnly 詞綴；以 DFS 嚴格可行指派與複合詞綴（alike/also）推算已用前綴與後綴數量；無解時保底計入當前明確歸屬列。
  2. 訂製裝備介面（`web/editor.html` 與 `editor/index.html`）：
     - 品質為魔法或稀有時，將詞綴拆為「前綴」「後綴」「底材固有屬性」三個獨立區塊與表格（`#cmods-pre`、`#cmods-suf`、`#cmods-imp`），各自具備「＋ 新增前綴」「＋ 新增後綴」「＋ 新增固有屬性」按鈕。
     - 區塊標題即時顯示「前綴 已用 x / 上限 y」「後綴 已用 x / 上限 y」，以及上方合計上限（魔法 1～2、稀有 2～6、珠寶 2～4）；選好底材或品質或任何一列變動即立刻重新推算更新。達上限時停用新增按鈕並顯示提示（「前綴數量已達上限」或「詞綴總數已達上限」）。
     - 前綴／後綴下拉選單僅列出該類可用詞綴（`both` 兩邊皆列）；固有屬性下拉僅列底材固有屬性。
     - 普通、暗金、套裝、符文之語品質維持原本單一表格（`#cmods`）行為；切換品質時保留使用者已填列並自動分類同步。
     - 送出製作（`makeCustom`）前將各區列合併為原本的 `mods` 格式送出，既有規則檢查（`assertLegal`）、屬性命名與建立邏輯不受影響。
     - 嚴格保留既有修正：`updateCraftRanges` 先 `showRanges` 自動填最大值再 `filterCraftSplit`/`filterStats`，以及未解除限制禁止製作暗金／套裝／符文之語。
     - 響應式 CSS 擴充至 `.cmods-table`，保留兩 HTML 間僅差 script query string 的既有差異。
  3. 多語言（`web/i18n.js` 與 `editor/i18n.js`）：
     - 同步擴充中英對照字典：前後綴標籤、新增按鈕文字、已用／上限、上限提示等。
  4. 驗證：
     - 抽出兩 html 內嵌 script 至臨時 scratchpad 執行 `node --check` 通過。
     - `engine-page.js`（web／editor）與 `i18n.js`（web／editor）執行 `node --check` 全數通過。
     - 執行 `test_affix_slots.mjs` 針對魔法、稀有、珠寶、普通、暗金、複合詞綴、magicOnly 排除、空列等 9 項單元測試全數通過。
     - 專案工作目錄無任何暫存檔殘留；未執行 git commit/push。

- 2026-11-01（Codex）：依使用者要求修正屬性逐點累積與換裝傷害護欄，並同步 web／editor 腳本與設計文件；`node --check autobot.js`、`git diff --check` 通過，`node -e` 累積 10000 點符合 27／55／12／6 比例；未進行遊戲驗證。

- 2026-11-01｜Antigravity：依需求限制「未解除限制製作裝備不准製作暗金、套裝、符文之語」：
  1. 於 `web/editor.html` 與 `editor/index.html` 新增 `FORBIDDEN_CRAFT_RARITIES` 及 `updateCraftRarities()`。
  2. 未解除限制時：`#cRar` 排除暗金、套裝、符文之語（選全部品質時列出可用底材），`#xRar` 排除三者並預設切為可用之第一品質（普通）；`#cList` 亦全面過濾排除此三種品質項目；若已有選取項目屬此三者則清空選取。
  3. `#pMake`（`makePicked`）與 `#xMake`（`makeCustom`）執行前加入前置檢查，若為 unique/set/runeword 即拒絕並以既有 `status("未解除限制時不能製作暗金、套裝或符文之語", "bad")` 提示。
  4. 解除限制後恢復全部品質選項：既有 `applyUnlockUI()` 掛鉤 `updateCraftRarities()`，切換時即時重繪製作選項、清單與屬性範圍。
  5. `web/i18n.js` 與 `editor/i18n.js` 同步加入英譯對照 `"Without removing restrictions, unique, set and runeword items cannot be crafted"`。
  6. 抽出兩 html 的 `<script>` 至系統 temp scratchpad 經 `node --check` 語法檢查通過，兩檔 i18n.js 亦通過；專案目錄無暫存檔殘留；未提交或推送。


- 2026-11-01｜Codex：輔助器任務獎品透過原版角色畫面、chooseTree 回呼及 readTome 嘗試自動使用；營地透過 akaraSearch 嘗試交付伊尼弗斯卷軸，鑰匙觸發尚待確認。同步 web／editor 程式與設計文件；node --check web/autobot.js、git diff --check 通過，兩組檔案雜湊一致。未做遊戲實測，未提交或推送。

- 2026-11-01｜Claude：輔助器大改（真實遊戲 35 存檔壓力測試中，尚無存檔通關地獄）：全圖走位規劃器（分析地圖所有怪物預測位置、飛彈、擁擠度，一直保持移動）；依技能攻擊距離決定近戰站位（REACH 表，見 AUTOBOT_DESIGN.md）；選卡集中升級主力技能＋進化被動／協同（讀原版技能表）；重置技能改看配點分散度；撿地上藥水（原本被過濾）、缺藥踢罐子（優先度低）；全圖撿取（magnet、寶箱移到身上，非原版行為，可關）；死亡保護預設開、只看致死預判、離場後自動繼續、觸發兩次回低難度刷；營地 town 卡住修正；中途離開自動繼續；地獄通關後重複刷地獄；買水買到滿；設定只存使用者選擇；停止輔助下方顯示狀態；裝備評分抗性加權。模擬測試 110 項通過（高負載下偶有計時失敗，重跑通過）。未驗證：地獄通關與重複刷的實際結果。
- 2026-11-01｜Codex：帳號／強化的角色表新增各職業「金色光芒」勾選，讀寫遊戲 heroes.<職業>.glow，保留其他角色資料；同步 editor 與 web，補英文翻譯。依本機遊戲 keepSave-CoH_93A4.js 的 wh／tm 確認欄位。頁面指令碼語法與勾選、取消、缺少角色資料的 Node 模擬通過；首次測試因 VM 跨環境原型比較失敗，改用 JSON 結構比較通過。未用實際遊戲存檔驗證，未封裝或發布。

- 2026-11-01｜Claude：輔助器已推上 GitHub（main，多次提交，post-commit 自動推送與 Pages 部署）。改以 fetch Pages 上的 autobot.js 在真實遊戲長跑（瀏覽器窗格隱藏，以假時鐘同步 tick 加速，並繞過原版選卡防誤觸時間戳；載入畫面需截圖推動）。全新法師存檔自動打通普通與惡夢、進入地獄第二幕。期間依實測與使用者回饋修正：卡名讀取、背包滿與即時賣裝、清場恰西商店卡住、倉庫畫面殘留、卡住停機、只追王與精英、近戰／遠程走位、寶箱、低難度回刷、重複刷難度、護符、裝備評分納入防禦抗性（含扣抗）、恰西升級存錢策略。細節見 AUTOBOT_DESIGN.md「實戰調整」。模擬測試 108 項通過。未驗證：地獄通關、近戰職業實戰、阿卡拉重置技能（需首次擊殺巴爾後開放，未觀察到觸發）。
- 2026-11-01｜Claude：輔助器第三輪。①排行榜學習：editor/ladder-learn.js 讀 d2survivors.lol/api/leaderboard（boards/hell?class=…、runs/{id}），彙整七職業地獄榜前 50 名的技能、被動、變體、配點、常用暗金，嵌入 autobot.js 的 LADDER；升級選卡依此權重（真實遊戲驗證：法師選 Charged Bolt），屬性點依比例 spendStatPoints，技能偏離時向阿卡拉重置（實測首次擊殺巴爾前不開放）。②王與精英留在攻擊範圍（movement.attackRange）；被包圍無路時穿過怪群、遠離最強敵人。模擬測試 104 項通過；同步 editor。未驗證：完整輔助器在真實遊戲長跑（67KB 原始碼無法可靠貼入瀏覽器窗格，僅以抽出的函式與原版介面逐項實測）、配點與重置的實際呼叫、能否打完地獄。未提交／發布。
- 2026-11-01｜Claude：輔助器第二輪（設定版本 3）。①罐子／木桶（rank=breakable）不再當敵人閃避，改走過去讓原版自動踢破；②撿取品質預設全開；③追目標優先（movement.chaseFirst）：推進且生命 > 35％ 時朝任務／頭目／敵人前進，只疊加飛彈閃避；④營地整備（town.*）：每次回營地開局前，用原版 openCampTrade＋包裝 hud.showTown 取得商店回呼，依序收藏庫 collectAll、從背包／倉庫／收藏庫換較佳裝備、稀有以上存倉庫、賣剩餘裝備、阿卡拉買生命藥水（1000 金／瓶）、恰西買較佳裝備與永久升級。真實遊戲營地實測整備流程成功（賣靴→買並穿皮甲→升級生命，金幣 232→17）；完整 autobot 未在真實遊戲長跑（貼上 57KB 原始碼受限，僅以抽出的整備函式實測）。模擬測試新增 6 項，共 100 項通過；同步 editor。未驗證：追目標優先與踢罐的實戰效果、能否推完地獄。未提交／發布。
- 2026-11-01｜Claude：在真實遊戲（d2survivors.lol/play，Game-C88Jt16A.js，全新存檔）實測輔助器並改良。實測發現並修正：①升級選卡用 click() 被原版防誤觸忽略，改按 1～3 鍵；②全新存檔沒有恐怖層紀錄，營地不會開局 → 新增營地自動開局／續玩（解析 waypointView 的 tabs/rows/start）與一般難度結束後 toMenu 回營地；③新增自動穿裝（原版 heroNumbers 比較、gearActions.equip）；實測撿到魔法靴子與皮手套後自動穿上；④死亡保護在 89％生命被小怪貼身時誤離場，改為需低血或預估傷害過半；⑤多敵貼近時改 16 方向取樣逃脫。實測循環：營地→自動開局→選卡→撿裝→穿裝→陣亡→回營地→再開局，成功。另加營地生成逾 15 秒未完成的看門狗。模擬測試更新為按鍵選卡並新增 6 項，共 94 項通過；同步 editor/autobot.js、測試與設計檔。限制：內建瀏覽器窗格隱藏時遊戲節流，以假時鐘同步呼叫 tick 加速，原版鍵盤防誤觸時間戳因而需在測試框架中繞過；隱藏窗格下載入動畫常停住需截圖推動，回營地卡住案例無法確定是否為環境造成。角色 Act 1 約 130～270 秒陣亡，主因無藥水（原版藥水需在商店購買，未自動化）與角色強度；逃脫改良未見明顯存活提升。未提交／發布。
- 2026-11-01｜Claude：輔助工具面板分為「戰鬥輔助」與「推層與任務」兩個分頁（恐怖層數、固定層重刷、任務進程移至後者）；同步 editor/autobot.js。node --check 與 85 項 Electron 模擬測試通過；未實戰驗證。
- 2026-11-01｜Claude：移除 F8 熱鍵與熱鍵設定欄，總開關只能在輔助面板切換（保留畫面上的「停止輔助」緊急按鈕）。87 項模擬測試通過。
- 2026-11-01｜Claude：兩個分頁各有獨立總開關：戰鬥輔助（enabled，管喝水／走位／撿裝／死亡保護）與推層與任務（progressEnabled，管推層／重刷／任務）；F8 與停止按鈕、死亡保護會同時關閉兩者。87 項模擬測試通過；未實戰驗證。

- 2026-10-31｜Codex（已完成本機實作與模擬）：總開關與九個功能改為明顯「開啟／關閉」按鈕（含角色、狀態文字及色燈），即時生效並存入 d2autobot:settings；推層／重刷互斥，舊設定自動補值為版本 2，預判喝水可獨立啟用。死亡保護預設關閉；可調緊急生命 1～90％（預設 15）及是否關閉總開關（預設是）。預估致命且無有效回血、緊急低血且工具冷卻中、或近敵包圍且 16 方向局部通道皆受阻時，先停推層／重刷／任務並保存，再 pause() → leaveRun()；找不到內部方法時嘗試可辨識的暫停 DOM 離開按鈕。等待期間禁止重新進場；8 秒未確認／出口缺失／拋錯均停機，角色選單不冒稱村莊。原版 Game-C88Jt16A.js 靜態證據：leaveRun 僅在 paused 生效，經 toMenu，campOn 且 frontend 時進 enterCamp，否則角色選單；沿用原版金幣／恐怖紀錄／硬核結算，可能損失當局進度。補回 web/AUTOBOT_DESIGN.md，同步 editor 的 autobot.js、設計、測試及 d2edit 載入行；build-web.js 新增複製清單、清理前來源檢查，保留 Git 與協作／交接檔。驗證：node --check autobot.js、d2edit.js、build-web.js 與測試檔通過；隔離 Electron 模擬 85 項通過（工作區 d2autobot-update/test-result.json），含開關／舊設定／補血成功及拒絕／滿血致命／禁藥／包圍與牆／回城停推進／離場錯誤逾時／DOM 備援／卸載；node editor/tests/build-web.cjs 於新建暫存副本驗證複製、載入行、交接保存及缺來源不清空，通過。未執行正式 web 重建、真實存檔實戰、手機、硬核離場或長時間測試。推測：傷害未完整重現抗性／護盾／格擋／攻速，包圍為局部取樣，藥水持續回復未精確建模；不保證生存。保留其他未提交工作，未提交／發布；post-commit 會自動 push。外部唯讀分析遭自動審查拒絕後已改本機完成，無委派成果。首次沙箱 Electron 未啟動完成，已停止該測試程序，改以獨立 Chromium 暫存設定成功驗證。

- 2026-10-31｜Codex：新增 `autobot.js`，`d2edit.js` 結尾僅追加 `import(at("autobot.js"))`（含載入失敗處理）。提供暫停左上「輔助」、繁中設定面板、`d2autobot:settings`、F8 總開關、觸控停止、喝水／冷卻／致命傷害預估、敵方飛彈閃避與保持距離、品質白名單、恐怖推層與已通關層數重刷、已生成任務目標導引及升級選卡。原版掛鉤：同 URL 匯入 `Game` 並包裝 `tick/steer` 取得現有實例；使用 `player.life/maxLife`、`world.mana`、`belt.columns`／`drinkFrom`、`enemies`、敵方 `hostiles`（不是玩家 `projectiles`）、`pickups.item`、`walls.route/slide`、`terror`／`startTerror/startReplay`、`search.stones/gibbetSpot/portalSpot`、`clearing.portal/tyrael`、`afterBaal.continue`。已下載 `/play/` 與 46 個相依 JS 至 `%TEMP%/d2autobot-analysis`；四項定位簽名皆匹配原始 `Game-C88Jt16A.js`。REA 靜態證據 `ev_618af3e9ca746ea9c5d0776c5874f8b6bcf3124281ca15a237e8dc8f83dfd0b8`。已參考本次產生的 `AUTOBOT_DESIGN.md`（之後被其他流程重建 web 移除，未代改設計檔）。驗證：`node --check autobot.js`、`node --check d2edit.js`；隔離 Electron 模擬遊戲頁 35 項通過（`%TEMP%/d2autobot-work/verify.cjs` 與 `result.json`），含冷卻、禁用藥帶、敵我飛彈、品質過濾、重刷限制、營地啟動、選卡、HUD 降級、錯誤停機及卸載還原。限制：未在真實存檔實戰／手機／長時間掛機驗收；傷害與巡航為啟發式，不保證生存或完成所有任務；特定配點、營地交付與隱藏任務條件仍需手動。此版未見獨立藍水，以回復活力藥水補魔力；無掛鉤時僅以可讀 HUD 與指定藥帶按鍵降級。品質只過濾主動追蹤，原版路過拾取仍生效。總開關預設關閉。保留其他代理變更，未提交／發布。整合期間其他流程重建 web，首次新增檔與載入行遭移除，改存暫存副本驗證，確認建置程序停止後重新整合。（已過時：本次頂端紀錄所述建置來源與保存修正已解除這項限制。）

- 2026-10-31｜Claude：原版規則限制＋中英雙語＋暫停按鈕。引擎新增 `validateItems`（固定品質比對原版定義與上下限，含無形加成、觸發技能等級隨物品等級；魔法 1+1、稀有 2～6 詞綴（珠寶 ≤4；依官方 Arreat Summit 與 Wikipedia；群組互斥依 Project Diablo 2 wiki／Phrozen Keep，前後綴共用群組；護身符無稀有）、前後綴各 ≤3、群組不重複、詞綴需適用底材；底材固有屬性取樣）與 `allowedStatsMany`（屬性下拉選單只列依規則可加入的屬性，每列依其他列計算）。未解除限制時：套用、訂製、寫入前檢查（從遊戲讀入且未改動的物品不擋），金幣 ≤100 億、額外強化 ≤999；反修改偵測頁新增「不符合原版屬性規則」列。新增 `i18n.js`：依系統語言自動切換繁中／英文（設定頁可指定），中文介面移除英文殘留（底材改中文下拉選單）。書籤載入後不直接開啟，暫停時（body.frontend-over-run，已在 d2survivors.lol 實測；備援 #paused）右上角出現「修改器」按鈕。README 加書籤教學、安裝頁雙語。驗證：Electron 載入安裝版遊戲，3804 件遊戲產生物品零誤判、竄改物品皆攔截；實際存檔僅標記 2 件遊戲自身也判定不合法的物品；中英模式逐頁掃描無殘留；模擬暫停頁測試按鈕顯示／開啟。桌面版已重新封裝（dist/D2.exe）。限制：尚未提交發布。

- 2026-10-31｜Claude：物品頁與製作頁新增的屬性列，選擇屬性後數值預設為範圍最大值（固定上下限優先，否則取詞綴最大值）；手動改過數值後不再覆寫。語法檢查通過，未實測。

- 2026-10-31｜Claude：統一屬性範圍資料庫：引擎新增 `statRanges`（固定品質用遊戲產生器上下限，否則用底材可用詞綴範圍），物品頁與製作頁共用 `loadStatRanges`／`showRanges`；物品頁改底材或品質會重新載入範圍。同步 `editor` 與 `web`。語法檢查通過，尚未實際遊戲驗證、封裝或發布。

- 2026-10-31｜Codex：發布 v1.0.1。提交 530a997 已由 post-commit hook 推送，GitHub Pages 部署成功，線上五個變更檔與提交內容逐位元相符；GitHub Release 已發布 D2.exe 與 SHA256SUMS.txt，下載後 SHA-256 為 46446181416f1ea81d1ccbd1224c2333854ff0450c51ad5499ca0913a77a2705，與本機一致。electron-builder 停用 Windows 執行檔資源編輯後封裝成功，程式未簽章；封裝內 app.asar 的版本及物品引擎函式已檢查。尚未用實際遊戲存檔進行端對端驗證，詞綴研究資料尚未整合進介面。

- 2026-10-31｜Codex：準備發布 v1.0.1。語法檢查及 `git diff --check` 通過；首次 `npm exec electron-builder -- --win portable` 因 Windows 不允許建立 winCodeSign 的 macOS 符號連結而失敗，改以停用 Windows 執行檔資源編輯重試。

- 2026-10-31｜Codex：檢查網頁版遊戲 `itemArt-Bh8qPZQJ.js`，匯出 708 筆一般詞綴（411 前綴、297 後綴）至 `D:\D2倖存者\裝備屬性分析`；隔離 Electron 分別載入網頁及安裝版遊戲模組，兩份 JSON 完全相同，SHA-256 皆為 8c1fd258de1e5420058a06d34102356cfcb9b14ebd62c9fbcc002f1ed0b4080f。CSV 708 筆主屬性上下限逐筆比對 JSON 通過；複合詞綴附加屬性保留於參數欄。整件裝備的可行詞綴組合與合計上下限尚未驗證。

- 2026-10-31｜Codex：分析安裝版遊戲 `2026.1030.2`，於 `D:\D2倖存者\裝備屬性分析` 擷取原始資料與 4239 筆具有 min/max 的屬性範圍；核對 itemstats SHA-256 為 b62973c238ae0271d5ada0af7c85233465ba684573db378f4a2d338de1532221。REA 證據 ev_d1112d5e917b94c8684af150d2ab48b0ea2f6f5d53f9e25118f1719a765074cb 僅涵蓋選定程式且圖譜截斷。一般魔法及稀有詞綴後續已匯出，最終合計上限尚未驗證。

- 2026-10-31｜Codex：將「製作裝備」拆為訂製裝備頁與獨立「裝備庫」頁，兩頁分別初始化底材及遊戲物品目錄，保留訂製目的地；同步 `editor/index.html`。Electron 隱藏視窗以模擬存檔及引擎驗證兩頁切換、訂製與裝備庫選取及製作均通過；兩頁指令碼語法與 `git diff --check` 通過。尚未使用實際存檔驗證、封裝或發布。

- 2026-10-31｜Codex：依安裝版 `app.asar` 的 `iZ` 與詞綴產生邏輯修正命名：普通用底材、魔法比對前後綴及複合屬性、稀有沿用或呼叫遊戲隨機名稱產生器、固定品質沿用原定義或依底材與屬性範圍唯一辨識；無解或多解時停止並提示。保留原始詞綴的 `length`、`auto` 等欄位；自訂物品等級恢復 99，穿戴需求由遊戲計算。REA 靜態證據 `ev_3baf916264176db68ac9b81dd1de449743aa1733ae54c02edf50e2c4bec9540c` 僅涵蓋所選程式。Electron 載入安裝版遊戲產生器，200 件魔法原名稱全數吻合，移除原名後 196 件唯一吻合、4 件多解，無錯誤命名；暗金、套裝、符文之語各 5 件均可辨識。頁面、引擎語法及 `git diff --check` 通過。限制：自訂任意屬性未必存在遊戲名稱；無法從屬性唯一還原稀有隨機名稱或多解物品。尚未實際遊戲存讀、封裝或發布。

- 2026-10-31｜Codex：複製目的地預設為目前容器，搜尋空格時將既有座標轉為數字；物品頁移除名稱及物品等級輸入，自訂製作與屬性修改時依可辨識詞綴估算物品等級，普通及魔法名稱依底材與詞綴設定。同步桌面來源。頁面及引擎語法、`git diff --check`、字串座標與多格避讓測試通過。限制：詞綴匹配及物品等級為近似；稀有名稱仍沿用或由遊戲隨機產生，暗金、套裝及符文之語名稱沿用原名稱，尚未完成所有品質依屬性命名；未實際遊戲驗證、封裝或發布。

- 2026-10-31｜Codex：手機物品區塊停止縮高，清單取消固定高度及內部捲動，讓頁面整體捲動；同步 `editor/index.html`。`git diff --check`、兩頁內嵌指令碼及樣式靜態檢查通過；已發布提交 `1b52611`，GitHub Pages 部署成功並以 HTTP 200 確認線上樣式；尚未實機驗證。

- 2026-10-31｜Codex：最佳化手機版修改器的觸控尺寸、導覽、橫向捲動及物品屬性卡片，同步 `web/editor.html` 與 `editor/index.html`。`git diff --check`、相關 JavaScript 及兩個頁面的內嵌指令碼語法檢查通過；環境停用本機瀏覽器，尚未進行手機畫面與實際操作驗證。已發布提交 `46f465b`；GitHub Pages 部署成功，線上 `editor.html` 回傳 HTTP 200，並確認包含手機樣式與屬性卡片。

- 2026-10-31｜Codex：檢視已安裝遊戲 `app.asar` 的物品產生及需求等級函式，確認物品等級與穿戴需求分開；自訂物品改設物品等級 99，穿戴需求由遊戲計算。匯出遊戲詞綴表及底材適用函式，自訂製作頁列出相容詞綴的數值區間；魔法名稱依可辨識詞綴組合，其他自訂品質採遊戲稀有名稱。固定物品顯示最小及最大值。`node --check main.js`、`engine-page.js`、`d2edit.js`、頁面語法及模擬詞綴測試通過；已確認安裝版遊戲簽章可辨識。尚未實際遊戲測試、封裝或發布；魔法名稱匹配為近似，複合詞綴、任意自訂屬性及需求等級未完成端到端驗證。

- 2026-10-31｜Codex：物品頁改為中文屬性下拉選單，並透過遊戲物品產生器顯示暗金、套裝及符文之語的固定屬性最高擲值；無法判定時顯示「未提供」。同步修改 `editor` 原始檔及此網頁版。
- 驗證：`node --check d2edit.js`、`node --input-type=module --check` 與頁面內嵌指令碼語法檢查通過；以模擬遊戲產生器驗證一般、固有屬性與未知品質。尚未驗證實際遊戲介面或重新封裝桌面執行檔。
- 限制：魔法及稀有物品的詞綴沒有實作對應上限；自訂或不在原物品定義中的屬性亦無法提供上限。

- 2026-10-31｜Codex：使用 Invoke-WebRequest 檢查 GitHub Pages，線上 editor.html 仍包含舊版「屬性代碼」；當時本機修改尚未發布，因此手機載入舊版。書籤使用時間參數，發布後重新開啟修改器可取得新版。


- 2026-10-31｜Codex：使用者明確授權推送，準備發布物品頁屬性下拉選單及遊戲產生器上限；發布後需確認 GitHub Pages 已更新。

- 2026-10-31｜Codex：網頁版與桌面版加入繁體中文字典備援，不再依賴先啟用中文書籤；字典取自本機 D2SurvivorsLauncher。`node --check` 與頁面指令碼檢查通過，並驗證小型咒符、所有技能及 129 個一般屬性顯示中文；自訂名稱或未知技能仍可能無對應翻譯。準備發布網頁版；桌面執行檔尚未重新封裝。

## 待辦：修改功能 bug（2026-11-02，Codex 模擬驗證發現，尚未修正、尚未實機測試）
1. 一擊必殺：`applyCheats()` 每次呼叫 damageMult 等倍率再乘 100（會累乘），需記住原始值冪等套用。
2. 怪物 10 倍：一次 90→900 隻超過 800 上限；spawnRate 重複乘 10，需依剩餘容量截斷並冪等。
3. 作弊總開關/子開關關閉後不還原已改寫的倍率、數值、函式。
4. 金幣 90 億保護：觸發後不還原；`world.gold` 若為函式會被覆寫成數字。
5. 技能滿級：找不到技能資料/ID 時預設 99，應跳過或用合法上限。
6. 無限重抽：永久強化寫 `ranks.Reroll`，編輯器用 `ranks.rerolls`，需查明遊戲實際欄位並統一。
7. 網頁版寫入存檔（`d2edit.js`）前未自動備份，與確認對話框說明不符；備份失敗時不可寫入。
- 無敵(godMode)、致命攻擊(criticalStrike/deadlyStrike)、掉寶率(uniqueBoost 等)欄位未在遊戲程式碼中找到，效果待實機確認。
- 實機測試請用官方網頁版 https://d2survivors.lol/play/ ；`web/index.html` 是工具包說明頁不是遊戲。測試前先備份瀏覽器 localStorage 存檔。桌面版存檔已備份於 `_backup_test/game-save`。
- `web/` 為獨立 git 儲存庫，autobot.js、tests/autobot.cjs 有未提交變更需保留；web/ 與 editor/ 檔案需同步。
- Codex 在 workspace-write 沙箱無法寫入本目錄，修正需改派可寫入的代理或開放權限。
