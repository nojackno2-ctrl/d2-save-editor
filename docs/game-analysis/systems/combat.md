# 戰鬥與防護機制反編譯分析 (combat.md)

本文件分析 D2 Survivors (build 20261101.1) 的怪物階級、近戰／遠程攻擊、新版命中率公式（原版純防禦改為 D2 風格命中率判定）、玩家受傷全流程結算、減傷與抗性，以及藥水與腰帶系統。原始位置依 \`gamejs2/itemArt-BTVnyuWi.js\`（記作 \`I新\`）與 \`gamejs2/Game-CP0n0PpN.js\`（記作 \`G新\`）之字元索引標註。

---

## 1. 怪物階級 (Rank) 與行為分類

在 \`I新\` 中，怪物資料由 \`Ni\` 與 \`ate\` 構造，階級分為：

| 階級 (Rank) | 代表怪物 | 屬性加成與掉落特徵 | 戰鬥行為 |
|---|---|---|---|
| \`normal\` | 沉淪魔、殭屍、小鬼等普通怪 | 基準生命、無額外固有詞綴、掉落率最低 | 依 \`behaviour\`（\`melee\`、\`ranged\`、\`nest\` 等）索敵與攻擊 |
| \`champion\` | 冠軍怪（藍字） | 生命 ×2.5、速度 ×1.2、等級 +2、必自帶強化狀態 | 追擊速度提升，掉落至少魔法裝備機率 ×1/3 × VS |
| \`unique\` | 隨機暗金頭目（金字） | 生命 ×4、等級 +3、隨機攜帶 1–3 個強固詞綴（如電氣強化、冰冷強化、快速、多重射擊等） | 具備詞綴受傷與死亡反彈機制，固定掉落金幣與寶箱 |
| \`minion\` | 暗金頭目的僕從 | 等級比照頭目 (+3)、繼承頭目部分光環 | 圍繞頭目協同作戰 |
| \`actBoss\` | 安達利爾、都瑞爾、墨菲斯托、迪亞布羅、巴爾 | 固定 ilvl、專屬巨大碰撞體積、具備階段性技能、免受常規即死或百分比削弱 | 免疫普通藥水掉落 (\`Yv\`)，擊敗觸發幕通關門 |
| \`breakable\` | 桶罐、箱子、甕、遺骸 | \`behaviour: 'prop'\`，無攻擊力，受任意攻擊即碎裂 | 死亡不掉落裝備，依專屬雜物表擲骰金幣、卷軸或藥水 |

---

## 2. 移動、攻擊距離與命中率計算 (New Defense System)

在舊版本中，防禦主要以「Enhanced Defense」或固定減傷呈現；在最新版 20261101.1 中，**全面改採 Diablo II 原作的「防禦力 vs 攻擊等級」命中率機率模型**。

### 關鍵函式清單

| 函式原名 | 匯出別名 | 推測語意名稱 | 定義位置 | 職責 |
|---|---|---|---|---|
| \`ap\` | \`Ki\` (\`G新:ut\`) | \`calculatePlayerDefense\` | \`I新:247967\` | 計算角色總防禦（裝甲 + 1/4 敏捷 + 技能%） |
| \`op\` | - | \`monsterEffectiveLevel\` | \`I新:248074\` | 取得怪物當前難度下之有效等級 |
| \`sp\` | - | \`monsterAttackRating\` | \`I新:248166\` | 計算怪物攻擊等級 (Attack Rating) |
| \`cp\` | - | \`calculateHitChance\` | \`I新:248259\` | 核心命中率公式（上下限 5% ~ 95%） |
| \`lp\` | - | \`monsterHitChance\` | \`I新:248386\` | 怪物對玩家之最終命中機率 |
| \`up\` | - | \`rollMonsterHit\` | \`I新:248496\` | 擲骰亂數判定本次攻擊是否命中 |

### 命中率公式還原虛擬碼

```typescript
/*@247967*/
// 1. 角色有效防禦計算 (Player Defense)
function calculatePlayerDefense(player: Player): number {
  // 基礎裝甲防禦 + 四分之一敏捷
  let baseDef = (player.defense ?? 0) + Math.floor((player.dexterity ?? 0) / 4);
  // 乘上百分比防禦加成 (Iron Skin, Shout, Defiance, Holy Shield, Werebear 等)
  let totalDef = Math.floor(baseDef * (1 + (player.defensePercent ?? 0) / 100));
  return Math.max(0, totalDef);
}

/*@248259*/
// 2. 雙重權重命中率公式 (D2 Hit Rate Formula)
function calculateHitChance(monsterAR: number, playerDef: number, monsterLvl: number, playerLvl: number): number {
  // 第一階段：AR 與 Defense 比較係數 (0 ~ 100)
  let factorAR = (monsterAR + playerDef > 0) 
    ? Math.floor(100 * monsterAR / (monsterAR + playerDef)) 
    : 100;
  
  // 第二階段：等級壓制係數 (2 * mLvl / (mLvl + pLvl))
  let rawChance = Math.floor(factorAR * monsterLvl * 2 / Math.max(1, monsterLvl + playerLvl));
  
  // 第三階段：硬性截斷下限 5%、上限 95%
  const MIN_HIT = 5;  // rp
  const MAX_HIT = 95; // ip
  let clampedChance = Math.min(MAX_HIT, Math.max(MIN_HIT, rawChance));
  
  return clampedChance / 100; // 回傳 0.05 ~ 0.95 機率
}

/*@248496*/
// 3. 攻擊命中擲骰
function rollMonsterHit(world: World, monster: Monster): boolean {
  let hitRate = monsterHitChance(world, monster);
  return Math.random() < hitRate;
}
```

---

## 3. 玩家受傷計算流程 (\`VC\`)

當怪物攻擊命中後，由 \`VC\` (\`I新:370500\`) 負責完整結算物理、元素、吸收、護盾與生命扣除：

### 關鍵函式與來源說明

| 函式原名 | 匯出別名 | 推測語意名稱 | 定義位置 | 職責 |
|---|---|---|---|---|
| \`VC\` | - | \`damagePlayer\` | \`I新:370543\` | 玩家承受傷害主流程 |
| \`WC\` | \`Ln\` (\`G新:gt\`) | \`damageReducedMultiplier\` | \`I新:371452\` | 計算 Damage Reduced% 減傷（硬上限 50%） |
| \`YC\` | - | \`resistMultiplier\` | \`I新:371589\` | 計算元素抗性傷害折減（上限 75%~95%，下限 -100%） |
| \`ew\` | - | \`calculateAbsorb\` | \`I新:371802\` | 計算元素吸收（百分比吸收上限 40% + 固定吸收值） |
| \`nw\` | - | \`checkHitRecovery\` | \`I新:371988\` | 判定是否觸發被擊中硬直動畫 (FHR) |

### 受傷結算還原虛擬碼

```typescript
/*@370543*/
function damagePlayer(world: World, rawDamage: number, isPhysical: boolean = true, element: string | null = null): void {
  if (rawDamage <= 0 || world.godMode) return;
  const player = world.player;

  // 1. 物理傷害與 Damage Reduced% (DR%) 結算
  // DR 來源：裝備 (Ber, Shaftstop 等)、Charsi ranks、Fade、Bone Armor；最高上限 50%
  // [注意] 新版本中 Battle Orders 與 Werewolf 已移除 DR 提供
  let monsterPierce = getMonsterPierce(world);
  let drMult = isPhysical ? damageReducedMultiplier(player, monsterPierce) * (player.physicalExposed ?? 1) : 1;
  let physDamage = rawDamage * player.damageTaken * drMult;

  // 2. 元素傷害與抗性結算
  let elemDamage = physDamage;
  if (element && ['fire', 'lightning', 'cold', 'magic'].includes(element)) {
    // 固定魔法傷害減免 (Magic Damage Reduced, MDR) 雙倍扣減
    if (player.magicReduced) {
      elemDamage = Math.max(0, elemDamage - player.magicReduced * 2);
    }
    // 套用抗性折減 (含難度懲罰：惡夢 -40, 地獄 -100)
    let resMult = resistMultiplier(player, element, getDifficultyPenalty(world, element));
    elemDamage *= resMult;
  }

  // 3. 元素吸收結算 (Absorb)
  // 百分比吸收最高 40%，加上固定吸收值；吸收量不僅免除傷害，後續還會回復生命
  let absorbed = calculateAbsorb(player, element, elemDamage);

  // 4. 外層護盾扣抵 (如骨甲 Bone Armor, 旋風護體 Cyclone Armor)
  let shieldAbsorb = player.absorbHit?.(world, elemDamage - absorbed, element) ?? 0;
  let finalDamage = elemDamage - absorbed - shieldAbsorb;

  // 5. 扣除生命與反向治療
  player.life -= finalDamage;
  if (absorbed > 0) {
    player.life = Math.min(player.maxLife, player.life + absorbed);
  }

  // 6. 快速打擊恢復 (Faster Hit Recovery, FHR) 觸發判定
  // 當單次傷害 >= 最大生命的 1/12 (約 8.33%) 時進入 GH (Get Hit) 動畫
  if (finalDamage >= player.maxLife * (1 / 12)) {
    player.action = { mode: 'GH', time: 0 };
  }

  // 7. 受擊閃爍與受擊觸發技能 (On Struck Procs)
  player.hurtFlash = 0.15;
  playSound(`${player.cls}.hit`);
  triggerProcs(world, 'struck');
}
```

---

## 4. 藥水與腰帶系統 (Potions & Belt)

新版 20261101.1 新增了完整的**魔力藥水 (Mana Potion)** 及腰帶欄位管理機制。

### 藥水種類與階級

在 \`I新:312935\` 中註冊的 6 種藥水種類：\`['potion', 'healing', 'antidote', 'thawing', 'mana', 'rejuvenation']\`

| 藥水類別 | 識別名稱 | 各階級回復基礎值 (1~5 級) | 職業回復倍率 |
|---|---|---|---|
| **掉落生命藥** | \`potion\` | Minor (30), Light (60), Normal (100), Greater (180), Super (320) | 野蠻人: 2.0；亞馬遜/聖騎士/刺客: 1.5；法師/死靈/德魯伊: 1.0 |
| **商店生命藥** | \`healing\` | 同上（阿卡拉處出售） | 同上 |
| **魔力藥水 (新)** | \`mana\` | **Minor (20), Light (40), Normal (80), Greater (150), Super (250)** | **法師: 2.0；死靈: 2.0；德魯伊: 2.0；亞馬遜/聖騎士/刺客: 1.5；野蠻人: 1.0** |
| **全面活力藥水** | \`rejuvenation\`| 瞬間回復 35% 或 100% 生命與魔力 | 不受職業倍率影響 |
| **解毒藥水** | \`antidote\` | 解除中毒並暫時提升 +50 毒抗 | - |
| **解凍藥水** | \`thawing\` | 解除冰凍並暫時提升 +50 冰抗 | - |

### 腰帶結構與使用邏輯

- **腰帶欄位**：固定 4 個垂直欄位（\`columns: [[], [], [], []]\`）。
- **疊放容量 (\`rows\`)**：由裝備的腰帶底材決定（Sash: 2, Light Belt: 3, Plated Belt: 4）。
- **同類疊放規則**：
  \`find(col => col.length > 0 && col.length < belt.rows && col[0] === itemKind) ?? find(col => col.length === 0)\`
  即：**僅同類藥水可在同一欄疊放；空欄則可放入任何藥水**。
- **飲用藥水 (\`drinkFrom\`)**：
  調用 \`belt.columns[colIndex].shift()\`，先進先出消耗欄位頂端的藥水，並即時套用回復。在恐懼層中若帶有「封印腰帶」詞綴則無法使用。

---

## 5. 常數表 (Constants Table)

| 常數名 | 所在檔案:位置 | 數值 | 語意說明 |
|---|---|---|---|
| \`rp\` | \`I新:248259\` | \`5\` | 命中率下限百分比 (5%) |
| \`ip\` | \`I新:248259\` | \`95\` | 命中率上限百分比 (95%) |
| \`MAX_DR\` | \`I新:371452\` | \`50\` | Damage Reduced (DR%) 最大折減上限 (50%) |
| \`KC\` | \`I新:371589\` | \`75\` | 基礎抗性最大上限 (75%) |
| \`MAX_RESIST\` | \`I新:371660\` | \`95\` | 包含 +Max Resist 後的絕對抗性上限 (95%) |
| \`tw\` | \`I新:371988\` | \`1/12 (0.0833)\` | 觸發快速打擊恢復 (FHR) 之傷害佔最大生命比例門檻 |
| \`Jv\` | \`I新:328637\` | \`0.01325\` (\`.053/4\`) | 怪物掉落藥水之基礎機率門檻 |
