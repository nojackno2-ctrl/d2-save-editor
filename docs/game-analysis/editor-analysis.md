# D2 Survivors 更新紀錄與存檔修改器分析

分析日期：2026-11-01。範圍：提供的 93 筆版本紀錄及 web/editor.html、engine-page.js、d2edit.js、webapi.js；靜態閱讀，未改動專案、未操作真實存檔、未執行遊戲或排行榜驗證。以下行號以本機檔案為準。官方紀錄的功能描述不等於已確認的存檔欄位名稱或伺服器實作。

## 一、影響修改器的官方更新

- 10/24，20261024.2：「refuse runs from edited saves and modded games」；包含不可能的物品、技能或數值，以及修改過的桌面程式或改變玩法的頁面參數。官方另稱移除不合法裝備並重新配點或更換裝備後，存檔可再次符合資格；這不保證所有硬核歷程恢復資格。
- 10/20，20261020.1：「a rare carries one +skills prefix at most」；10/25，20261025.1：「two +skills mods」的早期稀有物品被標記 not legit 並排除排行榜。應依實際遊戲對 +skills 的分類處理，不能把單一複合詞綴的多個欄位簡單視為兩條。
- 10/25，20261025.1：「5 stat points over the most for your level」會使該場不能上榜；10/24：「stat points D2 gives at her level, no more」；10/22，20261022.1：「Charsi's attribute ranks ... no longer count towards it」。重配、未分配點、任務獎勵及各種加成須依原版實作計算，不能只加總畫面數字。
- 10/26，20261026.1：「replayed an easier difficulty」後的 Tome 5 點不應在重配時遺失；同版舊存檔超額配點可免費重配。需保留任務與難度歷程，精確公式仍待核實。
- 10/22，20261022.3：「Each class has one hero now」；進度較前者保留，其他副本交給 Akara；「Every waypoint row takes your one hero」可重玩已解鎖難度。10/22.2：「no longer replaces a kept hero who stands further along」。不可任意假定 kept、run 與備份角色互相獨立。
- 10/15，20261015.40：「Save and Exit keeps your run; Continue picks it up」；10/22.3：「CONTINUE starts the act over as it began」；10/23.1：離開可能損失本幕等級；10/21.1：打完王後繼續進下一幕。需保留續玩快照與幕起始狀態；實際序列化結構需驗證。
- 10/22.3：「restarted at Akara from level 99」永久金色光芒；10/26.1 舊版擱置副本恢復時保留；10/30.2：「wear their golden glow round the campfire too」。這是重啟歷程獎勵，不是目前等級等於 99 即可推得。
- 10/23.1：「five new ranks」及五種敵方抗性穿透；10/23.3 三種傭兵強化；10/16.11：「ranks past the maximum」。10/28.2 施法速度使用全部五階；10/30.1 排行頁顯示 MF/GF 階數，但同版取消以階數與裝備無法解釋較高 MF/GF 為由拒絕。不可推論能任意修改數值且必然上榜。
- 10/25.1：「Uniques tab ... one of each unique」及套裝；10/28.2 每個符文之語收藏一份；10/29.2 收藏、交換較佳擲值；10/26.1 與 10/29.2 明確區分第二份和已收藏那份。收藏一份不代表背包／倉庫不得有第二份。
- 10/23.1：「Replay a cleared Terror tier」不改最佳或開放層；10/23.2 重配後只可重玩本次重新爬過的層；10/25.1 必須有前一層通關歷程，死亡前回復存檔不排名；離線或關閉上傳的通關可由後續場次帶上傳。
- 10/26.1 Terror 榜重置且只接受新版本；10/27.3 平衡更新後舊版 Terror 場次不計；10/25.1「unverified runs」有原因。不能只填 open 或 best 推定具備伺服器認可的爬塔紀錄。
- 10/27.2 硬核榜「saw play every run from start to end」，死亡後的存檔副本不排名；異常等級可能標記為可疑但仍留榜。10/30.1 已修正使用陣亡角色裝備的硬核 Terror 場次被誤標未驗證；10/29.4 網路恢復後重送開始紀錄。伺服器歷程不可由本機旗標推知。
- 10/26.4 charges 消耗並在新場／層恢復；10/27.1「stay spent after Save and Exit and CONTINUE」；10/27.2 大多數不再耗盡，但 Revive、Corpse Explosion、Iron Maiden、Spirit of Barbs、Iron Golem 例外。10/30.1 比較第二份時也考慮 charges 技能等級。修改應保留完整物品與續玩狀態，實際計數欄位未由更新紀錄提供。
- 10/28.2 符文之語直接掉落、共 78 種，頂級符文之語限 Terror；10/29.2 高階符文之語限較佳底材；10/30.2「never drops with only its runes' lines」、弓、弩及 Phase Blade 不為無形。掉落來源限制與物品靜態合法性是否完全相同尚待實測。
- 10/27.1：「older build reading a newer build's save code」要求更新；10/18.5 稀有聖騎士盾牌存檔碼匯入修復。10/17.1 個人與三個共用倉庫；存檔版本、物品結構及未知欄位應保留，不能僅以 JSON 可解析為相容。

## 二、修改器現況與風險

### 已有處理，仍需實測

- editor.html:604–608、943–969：未解除限制時禁止訂製暗金、套裝、符文之語；其他品質先後呼叫 assertLegal。editor.html:1112–1117 在限制模式使用本地 validateItems，引擎失敗時拒絕；解除限制則跳過。這是物品規則防護，不是排行榜保證。
- engine-page.js:49–58 使用遊戲產生器與種子產生魔法／稀有物品；:17–37、:72–91 產生固定品質；:419–425 有遊戲 sanitize 檢查。:114–134、:348–388 檢查詞綴數、群組、範圍、底材與品質；固定品質檢查使用遊戲資料。實際與 10/30 遊戲驗證器一致性未測。
- editor.html:274、1237–1240、1252–1255、1424–1429 對金幣設 100 億上限，限制模式在收集與寫入時防超額；此數值取自修改器，所給更新紀錄未證實當前官方上限。:1255 的 >= 判斷在剛好等於上限也顯示「超過」警示，文字與條件不一致。
- editor.html:1156–1185 和 engine-page.js:553–556 從遊戲 rankDefs 動態取階數與 endless，包含已知或新階數的可能性；額外階數上限 999 寫死。載入失敗或解除限制會改為自由輸入，不能聲稱已核實新版所有 rank 與 999 上限。
- editor.html:1210–1225 已讀寫 heroes.<職業>.glow，勾選時可建立缺少的職業物件；不是缺少光芒 UI。勾選不檢查曾以 99 級重啟，建立空角色也可能不符新格式，對排行榜及遊戲讀檔影響未驗證。
- editor.html:357–372、485–490、494–499 讀取共用／個人倉庫及 uniques 收藏；物品可位於獨立容器。收藏呈現與補齊包含三種固定品質，但是否完整重現官方單份、第二份、交換及去重規則，需以實際存檔測試。
- d2edit.js:9–10、20–28、140–156 分別處理一般／硬核 localStorage、HMAC 簽章、寫後讀回與重載；webapi.js:33–56 代理匯入、匯出與簽章。讀回成功或簽章正確只證明位元組一致／簽章計算一致，不能證明遊戲接受、合法或榜上有資格；網頁匯入只檢查 version 為數字。

### 缺口與可能風險

- P0 稀有雙 +skills：engine-page.js:114–134 的 affixPlan 只限制前後綴數、總數與群組，:180–208 的 partialFeasible 同樣沒有明確的 +skills 數量限制；:308–345 allowedStats 依 partialFeasible 推薦；:348–388 validate 依 affixPlan 驗證。不同群組的兩種技能詞綴可能通過本地檢查；是否被目前遊戲資料的群組設定間接擋住，須用遊戲真實資料與 itemFault 實證。原始未修改物品另有 BASELINE 豁免（editor.html:1119–1121、1418、1429），早期不合法稀有物不會在寫入時因本地檢查自動擋下。
- P0 配點：editor.html:1289–1292 只查 kept／run 的 build.level 是否 1–99，未見依等級、已用／未用點與任務獎勵計算總上限；原始資料可編輯，write 僅驗金幣與新增／變更物品。超額屬官方已明示的排榜原因。需以遊戲實際 schema 和重配函式確認起始屬性、每級點數、Tome、重玩、Charsi 與裝備各自計入方式。
- P0 排行診斷：editor.html:1293–1303 提供刪除 edited、imported、rechecked、unranked、lives.why 與匯入前紀錄，:1327–1330 可重設排行榜 ID；清旗標或重簽不修正實際不合法內容，也不能重建伺服器硬核／Terror 歷史。:1281–1284 將其他問題物品改成 unique 並刪除 stats／roll 的「修復」可能改壞物品，不足以證明已合法。官方 itemFault、saveFaults 若缺失回傳 null（engine-page.js:583–588）；editor.html:1278–1284 的近似檢查仍可能顯示通過，應標示未驗證。saveFaults 已暴露但 renderGuard 未見呼叫（editor.html:1306–1310）。
- P1 續玩與角色：editor.html:1210–1215 僅有解鎖、光芒、技能修改、重置與 terror.open 等欄位；:1289–1290 讀 heroes.<職業>.kept／run 作等級檢查，沒有專用 kept／run／continue 結構化編輯器，也未證明 complete continue 欄位名稱；一般載入與寫入整個物件可保留未觸碰欄位，但重建存檔 editor.html:1333–1356 只複製勾選的 KEEP 欄位，可能遺失未列出的續玩、歷程與未來欄位。應先核對真實 schema，不直接猜寫。
- P1 Terror：editor.html:1215 直接提供 terror.<職業>.open 數字，未檢查已通關、重配後本輪爬升與伺服器歷程；修改 open 可能和其他進度矛盾或不被榜採認，實際結果未驗證。
- P1 charges：現有物品編輯 editor.html:1124–1150 保留原物件的其他欄位，但修改屬性時刪除 stats 與 roll；未見專門編輯剩餘 charges、5 個耗用例外或跨 CONTINUE 一致性的處理。這不代表所有 charges 欄位都會遺失；確切結構需取真實前後存檔差異。
- P1 產生器：engine-page.js:76–91 找不到最高擲值種子時仍回傳 legit:true 並刪 roll；註解聲稱可通過，但缺乏此版遊戲與伺服器實測。editor.html:1124–1150 的修改同樣刪 roll／stats；需用遊戲 itemFault、讀檔 sanitize 與必要的線上實測分別驗證，不能把本地合法與可上榜混為一談。:348–388 未見對弓、弩、Phase Blade 無形狀態的明確檢查，亦未見高階符文之語掉落底材限制；後者是否屬合法性規則未知。
- P1 橋接錯配：editor.html:920 呼叫 affixSlots，engine-page.js:395–397 有實作，但 d2edit.js:210–214 白名單沒有 affixSlots；網頁端會拒絕該呼叫，畫面 catch 後 slots 為 null，詞綴數量與分類提示可能失效。最終 assertLegal 仍獨立執行；桌面端未在本次範圍驗證。
- P2 診斷 editor.html:570–589、d2edit.js:124–135 僅比較收藏數與部分裝備屬性雜湊，不包含角色、進度、物品完整內容及伺服器結果；顯示一致不代表完整存檔一致。一般寫入保留未知欄位，但全新存檔選項式重建存在欄位遺漏風險。

## 三、建議優先順序與驗證

1. P0 先停止將刪除標記、換 ID、重簽或改品質描述為恢復資格；保留只讀診斷與原始備份，明確區分本地檢查、遊戲接受與伺服器認證。遊戲驗證器不可用時顯示「未驗證」。
2. P0 把稀有 +skills 限制納入 affixPlan、partialFeasible、allowedStats 及最終寫入檢查；以當前遊戲產生器／itemFault 為 oracle，涵蓋不同群組、單一複合詞綴、合法單條、舊存檔雙條與 BASELINE。勿僅憑 stat 字串猜分類。
3. P0 查明官方完整配點公式及各角色 kept／run 資料來源，檢查等級、已分配與未分配、任務 Tome、重玩及重配；Charsi 與裝備加成獨立計算。以多職業、不同難度、重配及超額舊檔測試；不要自動截斷資料。
4. P1 修正網頁 affixSlots 白名單，檢查呼叫失敗回報，並為符文之語底材、無形例外、charges 持續狀態及原版完整屬性建立遊戲 oracle 對照；對找不到有效種子的最高值標示未驗證。
5. P1 以實際存檔前後差異建立 heroes／kept／run／continue、重配備份和 Terror replay 的 schema；新增結構化檢視與一致性檢查。預設保留未知欄位，重建存檔明列丟棄內容；對階層編輯提供快照與還原。
6. P1 對 Uniques 依遊戲真實識別鍵強制收藏一份，第二份保留在一般容器；支援預覽與交換，驗證三種品質、不同底材及 roll。不對普通容器強加全域唯一限制。
7. P1 Charsi 直接採目前版本定義與原版限制，辨識缺失、新增、未知及超限欄位；不要在定義載入失敗時把自由輸入稱為合法。glow 顯示已有支援，應補充 99 級重啟來源提示、缺角色時避免建立不完整物件，並以真實遊戲驗證。
8. P2 補強存檔版本相容性、全面結構摘要與寫入前後差異；區分讀回、遊戲載入、物品合法、榜服驗證四種狀態。測試應使用隔離副本，實際榜服結果另行驗證。