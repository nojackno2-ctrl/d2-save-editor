# 使用者介面與掛鉤機制反編譯分析 (ui-hooks.md)

本文件分析 D2 Survivors (build 20261101.1) 的 \`hud\` 物件架構、各介面掛鉤與回呼函式（\`hud.d2.mods\`、\`showTown\`、\`chooseTree\`、\`waypointView\`、\`plainSelect\`）。原始位置依 \`gamejs2/saveTransfer-x6SwGO80.js\`（記作 \`S新\`）、\`gamejs2/Game-CP0n0PpN.js\`（記作 \`G新\`）及 \`gamejs2/screens-BU6B_gFf.js\` 標註。

---

## 1. \`hud\` 物件生命週期與架構

在主遊戲控制器中，HUD 實例於初始化時建立：
\`this.hud = new Gs;\`（\`Gs\` 類別定義並匯出於 \`saveTransfer-x6SwGO80.js:95841\`）。

\`hud\` 物件職責包含：
- **紅藍球與數值渲染**：生命球（Life Globe）、魔力球（Mana Globe）、護盾條（Shield Bar）與經驗進度條。
- **橫幅通知系統 (\`banner\`)**：\`this.hud.banner(message, style, options)\`，用於顯示成就、拾物、版本更新、背包已滿與受阻警告。
- **腰帶快捷介面 (\`beltSlots\`)**：提供 4 格藥水槽之點擊、觸摸監聽，並將操作轉發給 \`drinkFrom(colIndex)\`。
- **技能列與快捷鍵綁定**：主動技能、次要技能、休息技能選取。
- **DOM 對話窗與浮層管理**：城鎮交易窗、技能修改器浮層、技能樹、天梯面板。

---

## 2. 關鍵介面回呼 (UI Callbacks)

### 1. \`hud.d2.mods\` / 技能修改器系統 (\`bindMods\`)

- **位置**：\`saveTransfer-x6SwGO80.js:120495\`（\`bindMods\`）、\`134369\`（\`modsLayer\`）。
- **推測語意**：\`SkillModificationsSystem\`
- **機制說明**：
  - 玩家閱讀赫拉迪克法典（Horadric Codex）獲得技能修改點數後，透過 \`bindMods\` 掛鉤。
  - 當玩家在技能樹面板中點擊對應技能時，觸發 \`modChooser(p, this.modsOpen, page)\` 彈出 \`.mod-chooser\` 浮層。
  - 浮層動態掛載於 \`this.modsLayer\`，提供該技能專屬的分支變體（如額外投射物、範圍擴大、轉化為冰冷/火焰等元素）之加點與重設。

### 2. \`showTown\` / 營地城鎮交易介面

- **位置**：\`G新:358940\`（\`showTown\`）、\`G新:362050\`（\`showAkaraTown\`）。
- **推測語意**：\`openVendorTradingDialog\`
- **機制說明**：
  - 當玩家點擊營地中的 NPC（恰西、阿卡拉、卡夏）或透過傳送門進入城鎮時觸發。
  - 狀態切換為 \`this.state = 'town'\`。
  - 組合商品清單 \`d\`（包含裝備底材、Charsi 強化 rank、藥水，以及僱傭兵復活 \`resurrectLine\`）。
  - 向 HUD 傳遞回呼物件：
    ```javascript
    this.hud.showTown(save.gold, goodsList, {
      buy: (index) => {
        let item = goodsList[index];
        if (item.canBuy) {
          // 扣除金幣、給予裝備或提升 Charsi rank
          // 若為藥水，放入腰帶或背包
          // 重新整理介面 h() -> this.showTown()
        }
      },
      close: () => {
        this.state = 'camp';
      }
    });
    ```

### 3. \`chooseTree\` / 技能樹選擇回呼

- **位置**：\`G新:378117\`（\`readBook\` 內部）、\`saveTransfer-x6SwGO80.js:102458\`。
- **推測語意**：\`openSkillTreePicker\`
- **機制說明**：
  - 當玩家使用技能書（\`readBook\`）或達成特定任務獎勵時調用：
    ```javascript
    this.hud.closeCharacter();
    this.hud.chooseTree(this.kit, takenBranches, (chosenBranch) => {
      let result = this.regift(heroId, () => applySkillReward(this.save, heroId, chosenBranch));
      this.openCharacter(returnState, heroId);
      if (result.kind === 'used') {
        this.questUsed(heroId, questItem, result);
      } else {
        this.refuseQuest(heroId, Ad(result));
      }
    });
    ```
  - 限制單一角色在特定樹分支上的最大點選數（不超過 3 次）。

### 4. \`waypointView\` / 傳送點介面

- **位置**：\`G新:295675\`
- **推測語意**：\`generateWaypointView\`
- **機制說明**：
  - 根據角色當前幕（Act 1 ~ 5）、已解鎖傳送點字典（\`Cu(save, heroId)\`）生成傳送面板資料。
  - 同時檢驗天梯狀態：若該存檔處於修改狀態（\`edited\`）或非合法狀態（\`unrank\`），於傳送點介面顯示無排名標記。
  - 點擊傳送點後，關閉面板並觸發 \`takeWaypoint(targetAct)\`，將角色傳送至目標地圖。

### 5. \`plainSelect\` / 輕量文字版選角介面

- **位置**：\`G新:297159\`
- **推測語意**：\`fallbackPlainClassSelect\`
- **機制說明**：
  - 當暗黑風格原版美術素材載入失敗、或用戶端啟用輕量化模式時，作為後備選角介面啟動。
  - 由類別 \`Ts\`（定義於 \`plain-tdhxZPCr.js\`）構造 DOM 選角清單：
    ```javascript
    plainSelect() {
      return this.classSelect ??= new Ts(
        () => this.transferSave(),    // 開啟存檔匯入匯出
        (hero) => openHeroDetail(hero), // 查看英雄詳情
        () => this.openReport()       // 開啟錯誤回報
      );
    }
    ```
  - 點選後直接調用 \`startClass(clsId)\` 或 \`continueRun(hero)\` 進入戰局。

---

## 3. 常數與回呼配置表 (Constants Table)

| 識別名稱 | 所在檔案:位置 | 數值 / 格式 | 說明 |
|---|---|---|---|
| \`--pet-cols\` | \`S新:120495\` | CSS 變數 | 隨從/召喚物圖標排版欄數 |
| \`--strip-top\` | \`S新:120495\` | 像素值 (px) | 底部狀態列之頂部偏移位置 |
| \`jf.left\` | \`S新:120550\` | 像素數值 | 腰帶第 1 欄在螢幕上的 X 座標基準 |
| \`jf.step\` | \`S新:120550\` | 像素數值 | 腰帶欄位之間的水平間距 (Step) |
| \`jf.size\` | \`S新:120550\` | 像素數值 | 腰帶格子之正方形邊長尺寸 |
