# 實機長跑測試框架

用 Electron 開啟真實遊戲（d2survivors.lol），每個存檔一個獨立設定檔，由輔助器全自動遊玩；測試者不介入遊戲操作，只讀取狀態。預設載入 GitHub Pages 版本；設定 `H_SOURCE=D:\D2倖存者\web` 時，透過只綁定 `127.0.0.1` 的臨時 HTTP 伺服器載入本機待驗來源，仍在官方遊戲頁面執行，可用於發布前驗收。

| 檔案 | 用途 |
|---|---|
| `main.js`、`package.json` | Electron 主程式：開啟遊戲、每 5 秒截圖與寫 `status.json`、執行 `cmd.js` 指令檔 |
| `boot.js` | 建檔：設定輔助器、載入 GitHub 或本機書籤程式、選職業；`confirm(false)` 有存檔進度就接回原角色 |
| `launch.ps1` | 一次開多個全新存檔：`-Classes amazon,... -Copies 5` |
| `relaunch.cjs` | 用既有設定檔重新開啟指定存檔（存檔保留） |
| `reload-gh.cjs` | 等 GitHub Pages 部署到與本機 `web/autobot.js` 相同，再讓所有頁面以書籤方式重載 |
| `watch.cjs` | 每 10 秒檢查，達標（地獄通關且 99 級）只標記不關閉；10 分鐘輸出摘要後結束 |
| `pq.cjs` | 唯讀查詢：在指定存檔頁面執行查詢並分段讀回結果 |
| `probe.js`、`probe2.js` | 唯讀紀錄器：陣亡前 1.2 秒狀態、裝備異動 |

每個存檔的資料夾（`run-<職業>-<n>/`：設定檔、日誌、截圖、狀態）是執行時產生的，不放進倉庫。
