# D2 Survivors 20261101.1 任務流程靜態研究

日期：2026-11-02；Codex。範圍：指定的 `gamejs2` 壓縮模組、既有 `decompiled/pretty` 對照、`web/autobot.js` 與既有分析文件。未執行遊戲、未連網、未使用實際存檔測試。下文 `G`＝`Game-CP0n0PpN.js`、`I`＝`itemArt-BTVnyuWi.js`、`S`＝`keepSave-DxUL_UG-.js`、`U`＝`saveTransfer-x6SwGO80.js`；`@數字`是原始壓縮檔字元位置，格式化檔中的 `/*@...*/` 保留該位置，不是行號。同名壓縮符號跨檔不能視為同一函式。

## 主要結論

1. **尋找凱恩的戒指必須由阿卡拉發放。** `g.cainHandOver()` 只發非戒指；`g.akaraSearch()` 才處理 N1／M1／H1。現有 `campShop()` 只有找到 `bks` 卷軸才呼叫它，因此救完凱恩後沒有卷軸時不會領戒指。見 G@205523、@206391、@288698；S@80973。
2. 現有 `reportQuests` 在呼叫前就將 `cainVisit` 設成目前 `camp`，即使背包滿或例外也不重試；且 `questOn()` 為假就不交。`waiting`、後續清背包、角色切換都應納入重試條件。這是程式可見風險，並非已實測的唯一原因。
3. 五塊石頭**沒有密碼順序**：原版每次碰到尚未點亮的石頭即點亮，五塊全亮開門；索引由 0 開始掃描只決定同時碰到多塊時的先後。現有由第一個未亮索引尋路可行，但必須實際走進碰撞範圍、避免被通關門或戰鬥目標搶先。
4. `Ks`、`xd` 是 G 模組內部匯入別名，**不是** `game.Ks` 或 `game.xd`。不引入模組時可讀存檔及 `game.world.quests`；可直接呼叫的實例方法為 `game.akaraSearch()`、`game.cainHandOver()` 等。任務日誌是多個並行任務，不是一個持久化的「目前任務」。

## 狀態、資料與執行期讀法

- `const g = game, s = g.save, cls = g.kit?.id, q = s?.cain?.quests?.[cls] ?? {}`。`s.cain.freed` 是首次救出凱恩的角色 ID；整個 `s.cain` 不存在時，日誌只列三個搜尋凱恩任務，其他任務的正式完成紀錄需要凱恩已被救出。`g.world?.quests` 是當局追蹤器，非存檔表。`g.training` 時可不存在；`g.questHost()` 返回 save getter、`cls()`、`counts()`、build、`treeOf()` 等回呼，而非日誌模型。G@303747、@344742；I@218109、@218479；U@168263。
- `q[id] == null`：尚未記錄完成，不能單憑此區分未開始、進行中、條件未達、未解鎖或不計數。`'o'`：條件完成、獎勵待領；`'g'`：已交付物品／戒指；非戒指 `g` 不表示已使用。`'u'`：對適用的 malus、token、potion、scroll、horadric 等獎勵已使用；book 的 `'1'/'2'/'3'` 是使用的技能樹；tome 的 `'s'/'d'/'v'/'e'` 分別為力量／敏捷／活力／精力。戒指只允許 `o/g`。I@212574、@213576；S@82682。使用 token 可能把已使用 book／tome 重設為 `o` 待重新領取，不能假設狀態永不回退：S@83138。
- `s.cain.terror?.[cls]` 的 `row` 與 `acts` 分別為連勝數與五幕位元遮罩；`g.world.quests.namedLeft(g.world, id)` 可取得當前幕剩餘指定命名怪數，`oneTreeShareFor(g.world,id)` 可取得 `{tree, share}`，不適用回 `null`。`g.world.quests.done` 是本局追蹤清單，不應取代存檔。I@215454、@216089、@216349、@217670。
- 每個難度的凱恩步驟可按 I@215272 邏輯重建：`bkd` 鑰匙存在於 `s.inventoryByClass[cls]` 或 `s.stashTabs[cls]` 時，`g.world?.tristram && g.world.difficulty === 該難度` 為 `cain`，否則 `stones`；有 `bks` 為 `akara`；否則為 `tree`。先檢查該難度 `q[id]` 是否已存在；`g.search?.stones?.logic` 和 `g.search?.portalSpot` 能細分石陣進度，但物件消失後不能視為已完成。`searchAsked[cls]` 只是阿卡拉是否曾提示的難度紀錄，並非完成標記。I@215272；G@205523。
- 原版日誌實際是 G@346356 呼叫 `Ks(s,cls,{run:{namedLeft:id=>g.world.quests.namedLeft(g.world,id),tristram:g.world.tristram?g.world.difficulty:null,oneTree:id=>g.world.quests.oneTreeShareFor(g.world,id)}, tab:..., fresh:new Set(g.questsHanded)})`；非當局時 `run:null`。這個 `Ks` 實際為 U 匯出 `wt`、檔內 `Am`（U@168263），不是 U 檔內另一個同名 `Ks`（@45010）。結果 `{tabs, tab, quest}`；每筆 `{id,state,condition,status,reward,...}`，`state` 為 `new/underway/owed/done`。預設先選 `owed` 或 fresh，再選未完成，這是 UI 選擇而非唯一進度。`g.openQuestLog()` 只顯示日誌，沒有回傳模型；如只能使用 game/save，應依上述規則自行重建，不可假設 `g.Ks` 存在。`g.questsHanded` 是暫時 UI 新領取提示集合，開日誌後清除，不是持久化交付紀錄。U@167514、@168263；G@345240、@346356。
- `g.cainHandOver()` 包裝 S 模組 `xd(s,cls)`，返回 `{given:物品[], waiting:任務ID[]}`，檢查背包空間後才將非戒指 `o→g`、存檔；本身不開 UI。不要呼叫不存在的 `g.xd`，也不要自行更改 `q`。戒指由 `g.akaraSearch()` 內部另一套 `{given,waiting}` 處理，但該方法只回 `null/'done'/'menu'`，須以呼叫前後的 `q` 比對。G@374243、@288698；S@80973。

## 全部任務清單與條件

這版主日誌依難度分組，並非五幕各六項。以下幕次是實際觸發幕；ID／名稱／獎勵定義 I@210706，條件 U@164322，執行條件 I@215454–218797。一般／惡夢／地獄各 6 項，恐懼 6 項，共 24 項；另外還有獨立的 Shattered Light。

| 難度／ID | 任務與實際條件 | 獎勵／領取對象 |
|---|---|---|
| 普通 N1 | The Search for Cain：第一幕救出凱恩 | 魔法戒指等級 7／阿卡拉 |
| 普通 N2 | Act I by Name：同一第一幕殺光 10 名指定怪 | malus／凱恩，使用找恰西 |
| 普通 N3 | The Secret Cow Level：殺牛王 | tome／凱恩 |
| 普通 N4 | Andariel at Full Strength：安達莉爾弱化前擊殺 | potion／凱恩 |
| 普通 N5 | Untouched by Duriel：第二幕都瑞爾攻擊未命中 | scroll／凱恩 |
| 普通 N6 | One Tree：第三幕墨菲斯托承受的傷害至少 75% 來自同一技能樹 | book／凱恩 |
| 惡夢 M1 | The Search for Cain：第一幕救凱恩 | 稀有戒指等級 28／阿卡拉 |
| 惡夢 M2 | The High Council：同一第三幕擊殺六名議會成員 | token／凱恩 |
| 惡夢 M3 | Duriel in Thirty：第二幕都瑞爾出現 30 秒內擊殺 | tome／凱恩 |
| 惡夢 M4 | Untouched by Mephisto：第三幕墨菲斯托攻擊及飛彈未命中 | potion／凱恩 |
| 惡夢 M5 | The Chaos Sanctuary：第四幕擊殺三封印王，且暗黑破壞神弱化前擊殺 | scroll／凱恩 |
| 惡夢 M6 | Six Evolutions：幕王倒下時持有至少 6 個進化技能 | book／凱恩 |
| 地獄 H1 | The Search for Cain：第一幕救凱恩 | 稀有戒指等級 49／阿卡拉 |
| 地獄 H2 | Pindleskin：第五幕尼拉塞克出現前擊殺品德斯金 | malus／凱恩，使用找恰西 |
| 地獄 H3 | Rite of Passage：第五幕三古人自最早出現起 30 秒內全殺 | tome／凱恩 |
| 地獄 H4 | One Tree in Hell：第五幕巴爾至少 75% 傷害來自同一技能樹 | potion／凱恩 |
| 地獄 H5 | Untouched by Diablo：第四幕暗黑破壞神攻擊、飛彈、nova 未命中 | scroll／凱恩 |
| 地獄 H6 | Baal in a Minute：第五幕巴爾出現 60 秒內擊殺 | book／凱恩 |
| 恐懼 T1 | The Cow Tier：完成牛關恐懼層 | malus／凱恩，使用找恰西 |
| 恐懼 T2 | Every Act：五幕各完成一層；牛關不計入幕位元 | token／凱恩 |
| 恐懼 T3 | Terror 10：非重刷完成第 10 層或以上 | tome／凱恩 |
| 恐懼 T4 | Three in a Row：非重刷連續完成 3 層 | potion／凱恩 |
| 恐懼 T5 | No Potions：完成帶 `nobelt` 詞綴的層 | scroll／凱恩 |
| 恐懼 T6 | Terror 15：非重刷完成第 15 層或以上 | horadric／凱恩 |

N2 名單：Corpsefire、Bishibosh、Bonebreaker、Blood Raven、Coldcrow、Rakanishu、Treehead WoodFist、Griswold、The Countess、The Smith；M2：Toorc Icefist、Geleb Flamefinger、Ismail Vilehand、Bremm Sparkfist、Wyand Voidbringer、Maffer Dragonhand；M5 三王：Infector of Souls、Lord De Seis、Grand Vizier of Chaos；H3：Talic、Madawc、Korlic。I@214761。

`complete()` 依難度門檻而非嚴格相等檢查：`kl(id, Ol(difficulty,terrorTier))`，因此較高難度的合格事件可能同時完成較低難度任務；凱恩救出依序嘗試 N1/M1/H1，只有符合難度門檻且尚未完成者記錄。若 `host.counts()` 為假則僅記本局、不寫正式存檔。I@213077、@218109、@218479；勿假設一次救援必然只得到一個戒指。

另外 `The Shattered Light` 不在 24 項陣列：`s.light.shards` 收集至 10，前往 Worldstone Chamber 擊殺 Baal 以獲 Tyrael's Wings，`s.light.wings` 為完成；日誌只有已有碎片才顯示。U@167963；I@218800。這不是向凱恩／阿卡拉領取的任務。具體掉落與穿戴機制超出本次已確認範圍。

## 尋找凱恩：原版流程與虛擬碼

1. **樹與卷軸。** G@306281 `startSearch` 建立 `game.search`，`tree()` 條件是未完成當前難度搜尋、背包和個人倉庫皆無卷軸與鑰匙；第一幕、非 farm 的 `ak.update` 監看 `world.boss`。Treehead WoodFist 真的死亡且仍符合條件時 `raiseTree(x,y)`，`layScroll(x+30,y+14)` 將 `inifuss`／`bks` 放到地面拾取物。G@204924、@206771、@212610、@306501。虛擬碼：`if (act===0 && !farm && boss.name==='Treehead WoodFist' && boss.dead && boss.life<=0 && noQuestItem && !completed) spawnTreeAndScroll()`；必須撿到物品，不能只到樹位置。
2. **回營地翻譯。** `g.akaraSearch()` 的 `YO` 依序優先「有待領戒指」「有卷軸」「尚未提示的搜尋」，因此同時有戒指與卷軸時第一次可能只發戒指，需再依狀態呼叫。`ZO` 從背包或個人倉庫移除 `bks`，產生 `bkd` Key to the Cairn Stones，盡量放同格，更新 `searchAsked` 並存檔；成功回 `'done'`。找不到任何待辦回 `null`；戒指處理的回值見下。G@205523–206622、@288698。若目前在關卡，何時及如何安全回營地在本次未確認，不應直接呼叫跳轉／冒稱已完成；若遊戲進度沒有可行的中途返回機制，至少在下一次自然回營地立即處理。
3. **石陣生成與碰觸。** 鑰匙可以放在個人倉庫：`WO` 透過背包與該角色 stash 搜尋 key；當前難度未完成、第一幕非 farm、Rakanishu 真正死亡時 `raiseStones` 建立 `g.search.stones={logic,props,tiles}`。`logic.spots` 含 5 塊石頭座標及中心，第 0–4 索引有 `logic.lit[0..4]`；`logic.count`、`logic.done` 是 getter。觸發只需角色走入 `hypot(player.x - spot.x, (player.y - spot.y)*2) <= 14 + player.radius`；每 tick 掃描未點亮石頭，按任意順序點亮，達 5 才 `openPortal`。不需點擊石頭，不需要依鑰匙排列順序。G@205043、@206889、@207586、@207737、@212913、@215044。
4. **傳送門。** `openPortal` 在石陣中心附近 `clearSpot({x:logic.x,y:logic.y+70})` 建 portal，`g.search.portalSpot` 回該 portal。`portalReached(dt)` 呼叫 portal 的 `through(world,dt,world.time-at>=1.5)`；遊戲更新中 `!g.clearing && portalReached(dt)` 才 `travel('tristram')`。因此移向 portal、等待至少 1.5 遊戲秒並穿越原版判定，不要直接假設目標座標已進入或呼叫 `travel` 冒充碰觸。具體 `through` 的移動軌跡判定本次未完整還原，需測試；若站中心未進入，檢查速度方向與碰撞。G@213812、@215590、@318527。
5. **牢籠與救出。** 傳送進 Tristram 後 `search.enterTristram()` 建立 `g.search.gibbet.logic`，`g.search.gibbetSpot` 在尚未開啟時提供 `{x,y}`，`g.world.tristram` 可辨識區域；走入 `hypot(px-x,(py-y)*2)<=22+player.radius` 自動觸發 `drop()`。`host.freed()` 立即呼叫 `g.cainFreed()`：`world.quests.cainFreed(world)` 記完成、從背包或個人倉庫移除鑰匙並存檔；接著凱恩動畫自行離開。動畫結束 `cainGone` 推送 `actCleared`，原版後續仍需走清關流程。G@208131、@214136、@215044、@215885、@216035、@307136、@325296；I@218109。
6. **領戒指。** 回營地後檢查 `q.N1/M1/H1 === 'o'`，呼叫 `g.akaraSearch()`。內部 `nk` 逐項產生戒指並嘗試放入目前角色背包，成功才 `o→g` 與存檔；滿則保留 `o`。沒有任何成功發放時 `rk` 令方法返回 `'menu'`；至少發一件則返回 `'done'`，即使其他戒指仍 waiting。因此不能僅看回傳值，要重新掃描三個 ID、整理背包後重試。若無待領戒指且有卷軸，再呼叫一次處理翻譯。G@206168、@206391、@288698。

## NPC 與獎勵使用

`Gx`（G@113437）對照 `talkInCamp(id)`（G@283416）：`cain2→quests→talkToCain()`；`akara→reset` 先 `akaraSearch()`，回 `'done'` 才不開選單，其餘再 `openAkara()`；`charsi→store→openCampTrade('store')`；其他為 `gheed→gamble`、`kashya→hire`、`warriv1→greet`、`darkwanderer→mode`、`stash→stash`、`board→board`。這些是營地 NPC 的 ID，不是顯示名稱。

- N1/M1/H1：阿卡拉，直接 `g.akaraSearch()` 即發戒指，不需點按鈕；其 `menu` 代表沒有任何戒指交付成功，常見原因為背包滿，仍須以狀態與空間判斷。`openAkara()` 本身不是翻譯或領戒指的替代品。
- 所有其餘 21 項：凱恩，`g.cainHandOver()` 直接發物品，不需開日誌或點按鈕；`talkToCain()` 額外把 `given[].quest` 加入 `questsHanded` 並開日誌。追蹤保存狀態仍應以 `q` 為準。
- N2/H2/T1 的 malus 從凱恩領取後，需恰西商店的 imbue 流程消耗，並選擇可灌注物品；`g.useQuest` 對 malus 回 `charsi`，不能當一般書直接用。G@374440、@359457；S@82851、@83638。是否能用既有商店回呼不開介面完整自動選物、具體呼叫路徑尚未確定，需研究，勿宣稱直接領取即完成使用。
- book、tome 需選技能樹／屬性；原版 `useQuest` 分流 `readBook`／`openTome`，選項回呼可程式化但受角色畫面與原版條件限制。token 有首次擊殺巴爾等限制；其他可用物品依 `useQuest` 原版結果判定。S@82033、@82682；G@374440。現有 `useCodex` 在讀任何任務獎品前先要求 `hud.d2.mods` 有效，可能使任務獎品被無關的變體介面阻擋；它也會嘗試 malus，應分流。

## 輔助器建議及可見原因

1. 新增集中式只讀 `questSnapshot(g)`：識別角色、難度、`q`、已解鎖／計數狀態、背包與倉庫 `bks/bkd`、地面任務物品、`world.tristram`、`search.stones.logic.lit/done`、`search.portalSpot`、`gibbetSpot`、`world.quests.namedLeft/oneTreeShareFor` 和 `cain.terror[cls]`。容忍 world 或追蹤器尚未生成。不要寫 `save.cain` 來補狀態，不呼叫 `complete()`。當幕物件是暫態；難度、角色、營地實例改變即重算。
2. 修改 `reportQuests`（autobot.js:1219）及 `progression`（1228）：每次回營地和背包空間變化後，優先查看全部 `o`。先處理阿卡拉戒指，再處理卷軸，再 `cainHandOver()` 非戒指；前後重新讀狀態，記錄成功及 waiting。設限速與狀態變化觸發重試，失敗／背包滿不可標記整次營地已完成；勿吞例外後假報成功。`questOn()`、`settings.progressEnabled` 關閉時行為應按產品設定明確界定。`questsHanded` 僅作 UI 動畫提示。
3. 修改 `campShop`（974）將任務處理從商店設定 `settings.town.enabled` 和卷軸檢查中解耦；現在關閉營地整備也會跳過卷軸。不要五分鐘 WeakMap 冷卻掩蓋原版因待領戒指而優先處理戒指的情況；根據 `q`／物品變化重新排程。
4. 修改 `questGoal`（405）及走位選擇（592）：按快照先判定本難度搜尋未完成，再依樹頭／卷軸地面拾取、鑰匙與石陣、未亮石、門、Tristram 牢籠決定目標。卷軸在背包或倉庫時安排安全回營地；只見到石陣而沒能撞上時用橢圓碰撞距離確認進入，原版更新後再選下一塊。判斷 `g.search` 暫不可得及非第一幕等情況，不把一般幕王誤當搜尋任務的唯一目標。現有 thief 與 `portalDue` 均可能搶先；應明定安全與任務的優先級，避免幕通關傳送門先於未完成的搜尋門。`lootGoal` 的品質、背包滿與距離條件要確認不會略過 `bks`；此處是否實際略過為**推測**。
5. 修改 `useCodex`（1113）：任務物品處理不依賴 `mods.points/set`，依獎勵類型區分 malus、書、tome、token 等；對原版回呼、地點、未開放及背包狀態作結果確認，等待可重試條件改變，而非只按物件五分鐘冷卻。使用後讀 `q` 和背包驗證，避免以函式已呼叫當作成功。
6. 模擬測試建議：無凱恩資料、較高難度一次多個搜尋 `o`、戒指與卷軸並存、戒指部分成功／全滿、清背包後同次營地重試、凱恩交付例外、角色切換、關閉城鎮整備、五石任意序與門延遲、牢籠碰觸、非計數局、token 重設、malus 交恰西，以及高難度向下完成條件。以上皆為靜態建議，未執行真實遊戲或模擬。
