# 實機長跑測試框架

用 Electron 開啟真實遊戲（d2survivors.lol），每個存檔一個獨立設定檔，由輔助器全自動遊玩；測試者不介入遊戲操作，只讀取狀態。依使用者要求，**一律用 GitHub 連結實測**：頁面像玩家點書籤一樣載入 GitHub Pages 上的 `d2edit.js`（再由它載入輔助器）。

| 檔案 | 用途 |
|---|---|
| `main.js`、`package.json` | Electron 主程式：開啟遊戲、每 5 秒截圖與寫 `status.json`、執行 `cmd.js` 指令檔 |
| `boot.js` | 建檔：設定輔助器、從 GitHub 載入書籤程式、選職業；`confirm(false)` 有存檔進度就接回原角色 |
| `launch.ps1` | 一次開多個全新存檔：`-Classes amazon,... -Copies 5` |
| `relaunch.cjs` | 用既有設定檔重新開啟指定存檔（存檔保留） |
| `reload-gh.cjs` | 等 GitHub Pages 部署到與本機 `helper/autobot.js` 相同，再讓所有頁面以書籤方式重載 |
| `watch.cjs` | 每 10 秒檢查，達標（地獄通關且 99 級）只標記不關閉；10 分鐘輸出摘要後結束 |
| `pq.cjs` | 唯讀查詢：在指定存檔頁面執行查詢並分段讀回結果 |
| `probe.js`、`probe2.js` | 唯讀紀錄器：陣亡前 1.2 秒狀態、裝備異動 |

每個存檔的資料夾（`run-<職業>-<n>/`：設定檔、日誌、截圖、狀態）是執行時產生的，不放進倉庫。
