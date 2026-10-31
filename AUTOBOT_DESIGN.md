# 遊戲輔助工具設計

## 載入與設定

`d2edit.js` 以同來源動態匯入 `autobot.js`；重載先還原舊掛鉤、移除舊介面。暫停時左上「輔助」開啟 Shadow DOM 面板，F8 切換總開關，觸控可按「停止輔助」。

總開關及九個主要功能都有標示「開啟／關閉」的按鈕、顏色、狀態燈與 `role="switch"`／`aria-checked`。切換立即釋放輔助移動目標並寫入 `localStorage["d2autobot:settings"]`；儲存失敗會提示，但本次設定仍生效。總開關與新增死亡保護預設關閉。設定版本 2 沿用舊欄位、補上缺省值並限制數值範圍；自動推層與固定重刷各有開關，共用互斥的 `terror.mode`。

## 遊戲介接與控制

依模組簽名找到目前頁面的 `Game`，沿用完全相同 URL 匯入並包裝 `tick`／`steer`。每 50ms 至多判斷一次；背景分頁、設定面板、修改器、原版暫停與手動操作讓位期間停止一般自動操作。只使用原版輸入與流程，不直接修改角色數值、任務完成旗標或存檔內容。

- 喝水讀取 `player.life/maxLife`、`world.mana`、`belt.columns`，呼叫 `drinkFrom`；一般補血與致命預判獨立開關。此版本以回復活力藥水補魔，遵守 `nobelt`。冷卻是輔助工具自己的節流時間，沒有完整追蹤手動喝水。
- 走位讀取敵人與 `hostiles`（敵方飛彈），設定原版 `walkTarget`／`reaching`，沿用牆壁路徑。品質白名單控制主動追蹤，無法阻止原版路過拾取。
- 推層／重刷呼叫 `startTerror`／`startReplay`，重刷限已通關層數；任務功能追蹤已生成石陣、牢籠、頭目及傳送門並選擇升級卡。營地交付、配點與隱藏條件可能需手動。
- 簽名不符時僅以可讀 HUD 與指定藥帶鍵降級，不從 Canvas 推測敵人；死亡保護需要完整遊戲實例，不在 HUD 降級模式猜測離場。

## 死亡保護

`deathProtection` 提供 `enabled`、`emergencyHpPercent`（1～90，預設 15）及 `disableAutomation`（預設 true）。啟用後，於喝水前後檢查：

1. 預估傷害 ≥ 目前生命，且無有效回血機會：藥水用盡、禁用藥帶、工具冷卻、已滿血無法補更多，或原版拒絕本次喝水。
2. 生命百分比 ≤ 緊急門檻，且工具的回血冷卻尚未結束。
3. 至少三名近敵造成威脅，16 個局部方向皆無足夠通道；每方向分 16 小步，用 `walls.slide(x,y,dx,dy)` 與敵人間距取樣，不更動玩家座標。

觸發立即釋放移動，將 `terror.mode` 設為 off、`quest.autoProgress` 設為 false 並儲存；依參數決定是否關閉總開關。呼叫原版 `pause()` → `leaveRun()`。已靜態確認 `Game-C88Jt16A.js` 的 `leaveRun` 僅在 paused 生效，沿用原版恐怖紀錄、金幣與硬核結算，再 `toMenu()`；營地可用時走 `enterCamp()`，否則可能回角色選單，介面會區分顯示。這不是保證無損的傳送，可能損失本局進度。

內部方法缺失時，只在可辨識的暫停 DOM 選單尋找離開／放棄按鈕，最多兩次以處理確認頁；不猜測 Canvas 座標。等待安全狀態期間禁止自動進場與重複離場；8 秒未確認、找不到出口或拋錯時停止自動化並明確回報。原版可能在內部非同步載入營地，因此方法返回不等於已回城。要再次推進，需使用者自行重新開啟相應功能。

## 建置與驗證

`editor/autobot.js`、`editor/AUTOBOT_DESIGN.md`、`editor/tests/autobot.cjs` 為建置來源，與 web 副本同步。`editor/build-web.js` 先確認來源齊全，再複製以上檔案與含載入行的 `d2edit.js`；清理輸出時保留 Git 與協作規範／交接。不要對有其他代理正在修改的正式 web 直接執行重建。

在 `D:\D2倖存者` 執行：

```powershell
node --check web/autobot.js
node --check editor/build-web.js
node editor/tests/build-web.cjs
$env:ELECTRON_RUN_AS_NODE = $null
& ./editor/node_modules/electron/dist/electron.exe ./web/tests/autobot.cjs
```

模擬測試使用獨立 Chromium 暫存設定與本機模擬頁，結果預設寫入 `%TEMP%/d2autobot-result.json`，可由 `D2AUTOBOT_TEST_RESULT` 指定。建置測試只操作新建的暫存副本。

## 推測與未驗證範圍

傷害預估尚未完整重現抗性、護盾、格擋、敵人攻速或控制效果；包圍取樣不是完整尋路，也未精確預測敵人移動，可能提早離場或漏判。藥水的後續持續回復未精確建模。原版未保證進村莊的模式會誠實回報角色選單。尚未驗證真實存檔實戰、硬核模式離場結果、手機及長時間掛機；不保證存活或所有任務自動完成。
