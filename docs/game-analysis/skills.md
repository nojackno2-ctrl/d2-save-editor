# D2 Survivors 20261101.1：職業技能與被動

來源：`gamejs2/itemArt-BTVnyuWi.js` 七職業定義、`gamejs2/Game-CP0n0PpN.js`、`news2/changelog.json` 第一筆、`D:\D2倖存者\web\autobot.js`。只作靜態分析，未執行遊戲模組。

**限制**：技能類型依 ID 與元素推測；距離只列 cast 中直接呼叫 `M(..., ..., 數字)` 的候選，尚未確認近戰邊緣距離與其他路徑，不可視為已核實射程。`—` 表示尚未查明。傷害、被動及冷卻保留原始運算式，需追讀壓縮常數。技能樹以遊戲數字編號表示。

原始協同須再經遊戲 `Sxe` 依來源、職業、進化鏈及 `Ew` 換算；`p6` 將已進化的來源視為前置技能滿級。下表列原始定義。進化需技能達上限且被動至少 1 級；是否再次習得尚未完整追查。

## 亞馬遜（amazon）

| 技能 ID／英文名稱 | 樹／類型／上限 | 距離候選 | 傷害公式／冷卻 | 協同原始定義 | 進化／變體／解鎖 |
|---|---|---|---|---|---|
| magicArrow／Magic Arrow | 1／spell（推測）／8 | 450 | (e,t)=>({min:OO(e,t),hits:gE(t),per:`an arrow`,crits:!0})；冷卻 0.75 × 0.93^(等級−1) 秒；實際另受冷卻倍率影響 | — | —；ricochet Ricochet (horde)、volley Volley (even)、lance Lance (even)；等級 1 |
| fireArrow／Fire Arrow | 1／spell（推測）／8 | 450 | (e,t)=>({min:kO(e,t),hits:vE(t),per:`an arrow`,crits:!0})；冷卻 1.1 × 0.93^(等級−1) 秒；實際另受冷卻倍率影響 | explodingArrow +12% | —；trail Trail (even)、frostfire Frostfire (even)、kindle Kindle (boss)；等級 1 |
| coldArrow／Cold Arrow | 1／spell（推測）／8 | 450 | (e,t)=>({min:AO(e,t),hits:yE(t),per:`an arrow`,crits:!0})；冷卻 1.1 × 0.93^(等級−1) 秒；實際另受冷卻倍率影響 | iceArrow +12% | dodge ≥1、技能 8 → iceArrow；split Split (horde)、frostbite Frostbite (even)、rimeTrail Rime Trail (even)；等級 6 |
| explodingArrow／Exploding Arrow | 1／spell（推測）／8 | 450 | (e,t)=>({...$O(jO(e),MO(e,t)),hits:2*xE(t),per:`an arrow or its blast`,crits:!0,around:xE(t)*3*MO(e,t)})；冷卻 1.6 × 0.93^(等級−1) 秒；實際另受冷卻倍率影響 | fireArrow +12% | dopplezon ≥1、技能 8 → immolationArrow；cluster Cluster (even)、focused Focused (boss)、frostfire Frostfire (even)；等級 12 |
| multipleShot／Multiple Shot | 1／attack（推測）／8 | 450 | (e,t)=>({min:NO(e,t),hits:wE(t),per:`an arrow`,crits:!0})；冷卻 1.3 × 0.94^(等級−1) 秒；實際另受冷卻倍率影響 | — | criticalStrike ≥1、技能 8 → strafe；ring Full Circle (horde)、narrow Narrow (boss)、return Return (even)；等級 6 |
| guidedArrow／Guided Arrow | 1／attack（推測）／8 | 450 | (e,t)=>({min:PO(e,t),hits:EE(t),per:`an arrow`,crits:!0})；冷卻 1.3 × 0.94^(等級−1) 秒；實際另受冷卻倍率影響 | — | pierce ≥1、技能 8 → seekerArrow；flock Flock (even)、bounty Bounty (boss)、venom Venom (even)；等級 18 |
| jab／Jab | 3／attack（推測）／8 | — | (e,t)=>({min:FO(e,t),hits:fD,per:`a thrust`,crits:!0})；冷卻 0.8 × 0.93^(等級−1) 秒；實際另受冷卻倍率影響 | — | evade ≥1、技能 8 → fend；cleave Cleave (horde)、stormEdge Storm Edge (even)、heavy Heavy (even)；等級 1 |
| powerStrike／Power Strike | 3／spell（推測）／8 | — | (e,t)=>({min:IO(e,t),per:`a thrust`,crits:!0})；冷卻 1.1 × 0.93^(等級−1) 秒；實際另受冷卻倍率影響 | lightningBolt +10%、chargedStrike +10%、lightningStrike +10%、lightningFury +10% | innerSight ≥1、技能 8 → chargedStrike；arc Arc (horde)、frostEdge Frost Edge (even)、overcharge Overcharge (boss)；等級 6 |
| poisonJavelin／Poison Javelin | 3／spell（推測）／8 | 450 | (e,t)=>({min:LO(e,t),hits:AE(t),per:`a javelin`,lasting:AE(t)*RO(e,t)})；冷卻 1.5 × 0.94^(等級−1) 秒；實際另受冷卻倍率影響 | plagueJavelin +12% | avoid ≥1、技能 8 → plagueJavelin；lob Lob (horde)、venomTip Venom Tip (even)、blight Blight (even)；等級 6 |
| impale／Impale | 3／attack（推測）／8 | — | (e,t)=>({min:zO(e,t),per:`a thrust`,crits:!0})；冷卻 2 × 0.94^(等級−1) 秒；實際另受冷卻倍率影響 | — | —；skewer Skewer (horde)、venomTip Venom Tip (even)、slayer Slayer (boss)；等級 12 |
| lightningBolt／Lightning Bolt | 3／spell（推測）／8 | 450 | (e,t)=>({min:BO(e,t),hits:PE(t),per:`a javelin`,crits:!0,around:PE(t)*3*BO(e,t)})；冷卻 1.6 × 0.94^(等級−1) 秒；實際另受冷卻倍率影響 | powerStrike +3%、chargedStrike +3%、lightningStrike +3%、lightningFury +3% | penetrate ≥1、技能 8 → lightningFury；fork Fork (horde)、frostJavelin Frost Javelin (even)、thunderbolt Thunderbolt (boss)；等級 12 |
| valkyrie／Valkyrie | 2／summon（推測）／8 | — | (e,t)=>({min:VO(e,t),rate:1/(LE(t)*gn(e.player)),per:`a spear thrust`,crits:!0})；冷卻 ()=>2 | — | —；shieldmaidens Shieldmaidens (horde)、huntress Huntress (boss)、frostMaiden Frost Maiden (even)；等級 30 |
| iceArrow／Ice Arrow | 1／spell（推測）／1 | 450 | (e,t)=>({min:HO(e,t),hits:iD,per:`an arrow`,crits:!0})；冷卻 ()=>.85 | coldArrow +8% | slowMissiles ≥1、技能 1 → freezingArrow；shatter Shatter (horde)、deepFreeze Deep Freeze (boss)、frostburn Frostburn (even)；進化 |
| strafe／Strafe | 1／attack（推測）／1 | 450 | (e,t)=>({min:UO(e,t),hits:YE,per:`an arrow`,crits:!0})；冷卻 ()=>.8 | — | —；hail Hail (even)、bullseye Bullseye (boss)、frostVolley Frost Volley (even)；進化 |
| fend／Fend | 3／attack（推測）／1 | — | (e,t)=>({min:WO(e,t),hits:4,per:`a thrust`,crits:!0})；冷卻 ()=>.8 | — | —；spearwind Spearwind (horde)、onslaught Onslaught (boss)、stormEdge Storm Edge (even)；進化 |
| chargedStrike／Charged Strike | 3／spell（推測）／1 | — | (e,t)=>({min:50*GO(e,t),max:100*GO(e,t),hits:2,per:`the thrust or a bolt`,crits:!0,around:(6+Math.min(mD,3))*50*GO(e,t)})；冷卻 ()=>.8 | powerStrike +10%、lightningBolt +10%、lightningStrike +10%、lightningFury +10% | penetrate ≥1、技能 1 → lightningStrike；arc Arc (horde)、grounded Grounded (boss)、frostCharge Frost Charge (even)；進化 |
| lightningStrike／Lightning Strike | 3／spell（推測）／1 | — | (e,t)=>({min:120*KO(e,t),per:`a thrust`,crits:!0,around:880*KO(e,t)})；冷卻 ()=>.75 | powerStrike +8%、lightningBolt +8%、chargedStrike +8%、lightningFury +8% | —；branching Branching (horde)、grounding Grounding (boss)、frostEdge Frost Edge (even)；進化 |
| plagueJavelin／Plague Javelin | 3／spell（推測）／1 | 450 | (e,t)=>({min:qO(e,t),hits:DD,per:`a javelin`,lasting:DD*4*JO(e,t)})；冷卻 ()=>1.3 | poisonJavelin +10% | —；lingering Lingering (horde)、concentrated Concentrated (boss)、pyre Pyre (even)；進化 |
| lightningFury／Lightning Fury | 3／spell（推測）／1 | 450 | (e,t)=>({min:eD*YO(e,t),hits:$E,per:`a javelin`,crits:!0,around:$E*Math.min(ZE,3)*eD*YO(e,t)})；冷卻 ()=>1.1 | powerStrike +1%、lightningBolt +1%、chargedStrike +1%、lightningStrike +1% | —；chain Chain (even)、thunderstrike Thunderstrike (boss)、frostFury Frost Fury (even)；進化 |
| freezingArrow／Freezing Arrow | 1／spell（推測）／1 | 450 | (e,t)=>({...$O(15*XO(e,t),90*XO(e,t)),hits:6,per:`an arrow or its burst`,crits:!0,around:sD*3*90*XO(e,t)})；冷卻 ()=>1 | coldArrow +12% | —；frostField Frost Field (boss)、focused Focused (boss)、frostfire Frostfire (even)；進化 |
| immolationArrow／Immolation Arrow | 1／spell（推測）／1 | 450 | (e,t)=>({...$O(10*ZO(e,t),90*ZO(e,t)),hits:6,per:`an arrow or its blast`,crits:!0,around:sD*3*90*ZO(e,t)})；冷卻 ()=>1.3 | explodingArrow +10%、fireArrow +5% | —；firestorm Firestorm (even)、pyre Pyre (boss)、frostfire Frostfire (even)；進化 |
| seekerArrow／Widowmaker | 1／attack（推測）／1 | 450 | (e,t)=>({min:QO(e,t),hits:tD,per:`an arrow`,crits:!0,around:tD*Math.min(nD,3)*QO(e,t)})；冷卻 ()=>.8 | — | —；swarm Swarm (even)、fixation Fixation (boss)、blackArrow Black Arrow (even)；進化 |

| 被動 ID／英文名稱 | 樹／上限 | 效果原始描述 | 進化條件對象 |
|---|---|---|---|
| criticalStrike／Critical Strike | 2／5 | e=>`Your attacks and the Valkyrie's have a ${Math.round(gO(e)*100)}% chance to do double damage.` | multipleShot → strafe |
| penetrate／Penetrate | 2／5 | e=>`Your attacks deal ${Math.round(xO*100*e)}% more damage.` | lightningBolt → lightningFury、chargedStrike → lightningStrike |
| pierce／Pierce | 2／5 | e=>`Your arrows and javelins have a ${Math.round(_O(e)*100)}% chance to pass through the monsters they hit.` | guidedArrow → seekerArrow |
| dodge／Dodge | 2／5 | e=>`You have a ${Math.round(vO(e)*100)}% chance to dodge a melee attack when attacking or standing still.` | coldArrow → iceArrow |
| avoid／Avoid | 2／5 | e=>`You have a ${Math.round(yO(e)*100)}% chance to dodge monster missiles when attacking or standing still.` | poisonJavelin → plagueJavelin |
| evade／Evade | 2／5 | e=>`You have a ${Math.round(bO(e)*100)}% chance to dodge a melee or missile attack when walking or running.` | jab → fend |
| dopplezon／Decoy | 2／5 | `A duplicate of you appears every few seconds to draw monsters, more often and longer by level.` | explodingArrow → immolationArrow |
| innerSight／Inner Sight | 2／5 | e=>`Nearby monsters take ${Math.round(SO*e*100)}% more damage. It breaks no immunity.` | powerStrike → chargedStrike |
| slowMissiles／Slow Missiles | 2／5 | e=>`Monsters' missiles fly ${Math.round(Math.min(wO,CO*e)*100)}% slower.` | iceArrow → freezingArrow |

## 女巫（sorceress）

| 技能 ID／英文名稱 | 樹／類型／上限 | 距離候選 | 傷害公式／冷卻 | 協同原始定義 | 進化／變體／解鎖 |
|---|---|---|---|---|---|
| fireBolt／Fire Bolt | 1／spell（推測）／8 | 450 | (e,t)=>({min:bj(e,t),hits:qk(t),per:`a bolt`})；冷卻 Yk | fireBall +16%、meteor +16% | warmth ≥1、技能 8 → fireBall；split Split (horde)、frostfire Frostfire (even)、heavy Heavy (boss)；等級 1 |
| iceBolt／Ice Bolt | 3／spell（推測）／8 | 450 | (e,t)=>({min:xj(e,t),hits:fA(t),per:`a bolt`})；冷卻 1.2 × 0.93^(等級−1) 秒；實際另受冷卻倍率影響 | frostNova +15%、iceBlast +15%、glacialSpike +15%、blizzard +15%、frozenOrb +15% | coldMastery ≥1、技能 8 → frozenOrb；return Return (horde)、frostLance Frost Lance (boss)、shatter Shatter (horde)；等級 1 |
| chargedBolt／Charged Bolt | 2／spell（推測）／8 | 450 | (e,t)=>({min:Sj(e,t),hits:TA(t),per:`a spark`})；冷卻 _fe | lightning +6% | energyShield ≥1、技能 8 → chainLightning；lance Lance (boss)、split Split (horde)、orbit Orbit (even)；等級 1 |
| nova／Nova | 2／spell（推測）／8 | — | (e,t)=>({min:Cj(e,t),per:`a monster in the ring`,around:3*Cj(e,t)})；冷卻 2.8 × 0.93^(等級−1) 秒；實際另受冷卻倍率影響 | — | lightningMastery ≥1、技能 8 → thunderStorm；echo Echo (even)、coldSnap Cold Snap (even)、pulse Pulse (even)；等級 12 |
| blaze／Blaze | 1／spell（推測）／8 | — | (e,t)=>({min:wj(e,t),hits:Hj(2),per:`a hit`})；冷卻 4 × 0.94^(等級−1) 秒；實際另受冷卻倍率影響 | warmth +4%、fireWall +1% | frw ≥1、技能 8 → fireWall；wider Wider (horde)、frostTrail Frost Trail (even)、mantle Mantle (even)；等級 12 |
| staticField／Static Field | 2／spell（推測）／8 | — | e=>`Monsters within ${zA(e)} lose ${Math.round(BA(e)*100)}% of their life, and elites and bosses a third of that.`；冷卻 3 × 0.93^(等級−1) 秒；實際另受冷卻倍率影響 | — | —；wider Wider (horde)、bane Bane (boss)、staticGround Static Ground (even)；等級 6 |
| inferno／Inferno | 1／spell（推測）／8 | — | (e,t)=>({min:Tj(e,t),hits:HA,per:`a flame`})；冷卻 1.5 × 0.94^(等級−1) 秒；實際另受冷卻倍率影響 | warmth +13% | —；fan Fan (even)、napalm Napalm (even)、frostBreath Frost Breath (even)；等級 6 |
| hydra／Hydra | 1／summon（推測）／8 | — | (e,t)=>({min:Ej(e,t),hits:Math.floor(10/KA),per:`a bolt`,most:6/KA})；冷卻 ()=>Cfe | fireBolt +3%、fireBall +3% | —；legion Legion (horde)、champion Champion (boss)、triHydra Tri Hydra (even)；等級 30 |
| lightning／Lightning | 2／spell（推測）／8 | 450 | (e,t)=>({min:Dj(e,t),hits:QA(t),per:`a bolt`})；冷卻 1.2 × 0.93^(等級−1) 秒；實際另受冷卻倍率影響 | chargedBolt +8%、chainLightning +8%、nova +8% | —；fork Fork (horde)、thunderbolt Thunderbolt (boss)、firebrand Firebrand (even)；等級 12 |
| teleport／Teleport | 2／spell（推測）／8 | — | e=>`When monsters close in, you blink ahead where they are fewest. It recharges in ${ej(e).toFixed(1)}s.`；冷卻 ej | — | —；arrivalNova Arrival Nova (horde)、frostStep Frost Step (even)、rideTheBolt Ride the Bolt (horde)；等級 18 |
| frostNova／Frost Nova | 3／spell（推測）／8 | — | (e,t)=>({min:Oj(e,t),per:`a monster in the ring`,around:3*Oj(e,t)})；冷卻 3 × 0.93^(等級−1) 秒；實際另受冷卻倍率影響 | blizzard +10%、frozenOrb +10% | —；echo Echo (even)、deepFreeze Deep Freeze (even)、pulse Pulse (even)；等級 6 |
| iceBlast／Ice Blast | 3／spell（推測）／8 | 450 | (e,t)=>({min:kj(e,t),hits:rj(t),per:`a bolt`,crits:!0})；冷卻 1.6 × 0.93^(等級−1) 秒；實際另受冷卻倍率影響 | iceBolt +8%、blizzard +8%、frozenOrb +8% | fcr ≥1、技能 8 → glacialSpike；ricochet Ricochet (horde)、glacier Glacier (boss)、hellfrost Hellfrost (even)；等級 6 |
| frozenArmor／Frozen Armor | 3／spell（推測）／8 | — | e=>`For ${aj(e)}s, melee attackers freeze for ${oj(e).toFixed(1)}s, and ${Math.round(sj(e)*100)}% of blows and missiles miss you.`；冷卻 13 × 0.96^(等級−1) 秒；實際另受冷卻倍率影響 | — | vitality ≥1、技能 8 → shiverArmor；reactive Reactive (horde)、lastStand Last Stand (even)、brittle Brittle (boss)；等級 1 |
| fireBall／Fire Ball | 1／spell（推測）／1 | 450 | (e,t)=>({min:Aj(e,t),hits:3,per:`a fire ball`,around:9*Aj(e,t)})；冷卻 ()=>1 | fireBolt +14%、meteor +14% | enchant ≥1、技能 1 → meteor；cluster Cluster (horde)、greatBall Great Ball (boss)、frostfire Frostfire (even)；進化 |
| meteor／Meteor | 1／spell（推測）／1 | 450 | (e,t)=>({min:AA*jj(e,t),hits:3,per:`a meteor`,around:9*AA*jj(e,t)})；冷卻 ()=>kA | fireBolt +5%、fireBall +5% | —；shower Shower (horde)、comet Comet (boss)、coldMeteor Cold Meteor (even)；進化 |
| frozenOrb／Frozen Orb | 3／spell（推測）／1 | 450 | (e,t)=>({min:Mj(e,t),hits:Gfe,per:`a shard`})；冷卻 ()=>1 | iceBolt +2% | —；shatter Shatter (horde)、return Return (boss)、hellfrost Hellfrost (even)；進化 |
| chainLightning／Chain Lightning | 2／spell（推測）／1 | 450 | (e,t)=>({min:Nj(e,t),hits:2,per:`a bolt`,around:14*Nj(e,t)})；冷卻 ()=>.9 | chargedBolt +4%、lightning +4%、nova +4% | —；stormChain Storm Chain (horde)、tether Tether (boss)、fireArc Fire Arc (even)；進化 |
| thunderStorm／Thunder Storm | 2／spell（推測）／1 | 450 | (e,t)=>({min:Pj(e,t),per:`a strike`,around:1*Pj(e,t)})；冷卻 ()=>.35 | — | —；wider Wider (horde)、wrath Wrath (boss)、frostStorm Frost Storm (even)；進化 |
| fireWall／Fire Wall | 1／spell（推測）／1 | 450 | (e,t)=>({min:Rj(e,t),hits:Hj(4),per:`a hit`})；冷卻 ()=>2.6 | warmth +4%、inferno +1% | —；frostfire Frostfire (even)、crossfire Crossfire (even)、pyre Pyre (boss)；進化 |
| glacialSpike／Glacial Spike | 3／spell（推測）／1 | 450 | (e,t)=>({min:zj(e,t),hits:2,per:`a spike`,around:6*zj(e,t)})；冷卻 ()=>1.1 | iceBolt +5%、iceBlast +5%、frozenOrb +5% | replenish ≥1、技能 1 → blizzard；avalanche Avalanche (horde)、icicle Icicle (boss)、hellfrost Hellfrost (even)；進化 |
| blizzard／Blizzard | 3／spell（推測）／1 | 450 | (e,t)=>({min:Bj(e,t),hits:24,per:`a shard`})；冷卻 ()=>bfe | iceBolt +5%、iceBlast +5%、glacialSpike +5% | —；hailstorm Hailstorm (boss)、mantle Mantle (even)、vortex Vortex (horde)；進化 |
| shiverArmor／Shiver Armor | 3／spell（推測）／1 | — | (e,t)=>({min:55*Vj(e,t),per:`a melee attacker`,struck:!0})；冷卻 ()=>12 | frozenArmor +9%、chillingArmor +9% | coldMastery ≥1、技能 1 → chillingArmor；reactive Reactive (horde)、duel Duel (boss)、lastStand Last Stand (even)；進化 |
| chillingArmor／Chilling Armor | 3／spell（推測）／1 | — | (e,t)=>({min:60*Vj(e,t),max:70*Vj(e,t),per:`an attacker`,struck:!0})；冷卻 ()=>12 | frozenArmor +7%、shiverArmor +7% | —；frostBarrage Frost Barrage (horde)、duel Duel (boss)、lastStand Last Stand (even)；進化 |

| 被動 ID／英文名稱 | 樹／上限 | 效果原始描述 | 進化條件對象 |
|---|---|---|---|
| energyShield／Energy Shield | 2／5 | e=>`Your mana takes ${Math.round(dj(e)*100)}% of every hit instead of your life, at most 400 mana a hit.` | chargedBolt → chainLightning |
| fireMastery／Fire Mastery | 1／5 | e=>`Lowers enemy fire resistance ${Gj(e)}%, a fifth of that if immune.` | — |
| coldMastery／Cold Mastery | 3／5 | e=>`Lowers enemy cold resistance ${Gj(e)}%, a fifth of that if immune.` | iceBolt → frozenOrb、shiverArmor → chillingArmor |
| lightningMastery／Lightning Mastery | 2／5 | e=>`Lowers enemy lightning resistance ${Gj(e)}%, a fifth of that if immune.` | nova → thunderStorm |
| warmth／Warmth | 1／5 | e=>`Skills recharge ${Math.round((1-1/uj(e))*100)}% faster` | fireBolt → fireBall |
| enchant／Enchant | 1／5 | e=>`Fire skills deal ${Math.round(hj*100*e)}% more, the Hydra's bolts ${Math.round(hj*200*e)}% more.` | fireBall → meteor |

## 死靈法師（necromancer）

| 技能 ID／英文名稱 | 樹／類型／上限 | 距離候選 | 傷害公式／冷卻 | 協同原始定義 | 進化／變體／解鎖 |
|---|---|---|---|---|---|
| teeth／Teeth | 2／spell（推測）／8 | 450 | (e,t)=>({min:jP(e,t),hits:LM(t),per:`a tooth`})；冷卻 zM | boneWall +15%、boneSpear +15%、bonePrison +15%、boneSpirit +15% | boneWall ≥1、技能 8 → boneSpear；barbed Barbed (horde)、clench Clench (boss)、splinter Splinter (horde)；等級 1 |
| corpseExplosion／Corpse Explosion | 2／spell（推測）／8 | — | e=>`A corpse explodes, dealing ${JM*100}-${YM*100}% of its life within ${WM(e)}.`；冷卻 2.4 × 0.95^(等級−1) 秒；實際另受冷卻倍率影響 | — | —；chain Chain (horde)、focused Focused (boss)、graveChill Grave Chill (even)；等級 6 |
| poisonDagger／Poison Dagger | 2／spell（推測）／8 | — | (e,t)=>({min:FP(e,t),hits:XM(t)*eN,per:`a second of its poison`,rate:XM(t)})；冷卻 0.9 × 0.94^(等級−1) 秒；實際另受冷卻倍率影響 | poisonExplosion +20%、poisonNova +20% | fcr ≥1、技能 8 → poisonExplosion；venomPuff Venom Puff (horde)、gut Gut (boss)、thrown Thrown (even)；等級 6 |
| bonePrison／Bone Prison | 2／spell（推測）／8 | — | e=>`Bone walls cage the ${QN(e)===1?`toughest monster`:`${QN(e)} toughest monsters`} near you for ${$N(e).toFixed(1)} seconds (act bosses half as long).`；冷卻 8 × 0.93^(等級−1) 秒；實際另受冷卻倍率影響 | — | —；pen Pen (horde)、crushing Crushing (boss)、bulwark Bulwark (even)；等級 24 |
| amplifyDamage／Amplify Damage | 1／curse（推測）／8 | — | e=>`Monsters within ${SN(e)} of a target lose ${TN}% physical resistance for ${CN(e)} seconds (a fifth if immune).`；冷卻 wN | — | frw ≥1、技能 8 → decrepify；contagion Contagion (horde)、huntersMark Hunter's Mark (boss)、cursedGround Cursed Ground (even)；等級 1 |
| weaken／Weaken | 1／curse（推測）／8 | — | e=>`Monsters within ${SN(e)} of a target deal ${Math.round(DN(e)*100)}% less damage for ${CN(e)}s.`；冷卻 wN | — | —；contagion Contagion (horde)、siphon Siphon (even)、cursedGround Cursed Ground (even)；等級 6 |
| dimVision／Dim Vision | 1／spell（推測）／8 | — | e=>`Monsters within ${AN(e)} of a target, ranged first, see you only up close for ${CN(e)}s (not act bosses).`；冷卻 6 × 0.93^(等級−1) 秒；實際另受冷卻倍率影響 | — | telekinesis ≥1、技能 8 → confuse；contagion Contagion (horde)、shroud Shroud (even)、fog Fog (even)；等級 6 |
| ironMaiden／Iron Maiden | 1／curse（推測）／8 | — | e=>`For ${CN(e)}s, monsters within ${SN(e)} of the nearest take back ${Math.round(ON(e)*100)}% of their blows on you and summons.`；冷卻 wN | — | —；spite Spite (even)、contagion Contagion (horde)、judas Judas (boss)；等級 12 |
| terror／Terror | 1／curse（推測）／8 | — | e=>`Monsters within ${jN(e)} of the nearest flee for ${MN(e).toFixed(1)}s and don't attack (not act bosses).`；冷卻 6 × 0.93^(等級−1) 秒；實際另受冷卻倍率影響 | — | —；cower Cower (horde)、contagion Contagion (horde)、horror Horror (even)；等級 12 |
| lifeTap／Life Tap | 1／curse（推測）／8 | — | e=>`For ${CN(e)}s, ${(kN(e)*100).toFixed(1)}% of the damage you and summons deal monsters within ${SN(e)} of the nearest heals you.`；冷卻 wN | — | —；bloodPact Blood Pact (even)、feast Feast (horde)、leech Leech (boss)；等級 18 |
| raiseSkeleton／Raise Skeleton | 3／summon（推測）／8 | — | (e,t)=>({min:RP(e,t),per:`a skeleton's blow`,rate:aN(t)/yN})；冷卻 2.2 × 0.94^(等級−1) 秒；實際另受冷卻倍率影響 | — | skeletonMastery ≥1、技能 8 → revive；legion Legion (even)、champion Champion (boss)、burningDead Burning Dead (even)；等級 1 |
| raiseSkeletalMage／Raise Skeletal Mage | 3／spell（推測）／8 | — | (e,t)=>{let n=LL.map(n=>BP(e,t,n.element));return{min:Math.min(...n),max:Math.max(...n),per:`a mage's bolt`,rate:oN(t)/bN}}；冷卻 2.6 × 0.94^(等級−1) 秒；實際另受冷卻倍率影響 | — | —；legion Legion (even)、champion Champion (boss)、attuned Attuned (even)；等級 12 |
| clayGolem／Clay Golem | 3／summon（推測）／8 | — | (e,t)=>({min:VP(e,_N(t),`physical`),per:`the golem's blow`,rate:1/xN})；冷卻 6 × 0.93^(等級−1) 秒；實際另受冷卻倍率影響 | — | golemMastery ≥1、技能 8 → bloodGolem；twins Twins (even)、mire Mire (even)、hulk Hulk (boss)；等級 6 |
| boneSpear／Bone Spear | 2／spell（推測）／1 | 450 | (e,t)=>({min:MP(e,t),hits:CP,per:`a spear`})；冷卻 ()=>.85 | teeth +7%、boneWall +7%、bonePrison +7%、boneSpirit +7% | boneArmor ≥1、技能 1 → boneSpirit；boomerang Boomerang (even)、impaler Impaler (boss)、ossuary Ossuary (even)；進化 |
| boneSpirit／Bone Spirit | 2／spell（推測）／1 | 450 | (e,t)=>({min:NP(e,t),hits:xP,per:`a spirit`})；冷卻 ()=>.75 | teeth +6%、boneWall +6%、boneSpear +6%、bonePrison +6% | —；restless Restless (even)、reaper Reaper (boss)、spectralFire Spectral Fire (even)；進化 |
| poisonExplosion／Poison Explosion | 2／spell（推測）／1 | 450 | (e,t)=>({min:IP(e,t),hits:oP.time(t),per:`a second of its poison`,rate:1,around:3*IP(e,t)})；冷卻 ()=>1 | poisonDagger +15%、poisonNova +15% | lowerResist ≥1、技能 1 → poisonNova；miasma Miasma (horde)、vileBurst Vile Burst (boss)、fester Fester (even)；進化 |
| poisonNova／Poison Nova | 2／spell（推測）／1 | — | (e,t)=>({min:LP(e,t),hits:eN,per:`a second of its poison`,rate:1,around:3*LP(e,t)})；冷卻 ()=>2 | poisonDagger +10%、poisonExplosion +10% | —；plagueWave Plague Wave (even)、venomRing Venom Ring (boss)、boneNova Bone Nova (even)；進化 |
| decrepify／Decrepify | 1／curse（推測）／1 | — | ()=>`For ${zN.time}s, monsters within ${zN.radius} of a target slow by half, deal ${Math.round((1-zN.blunt)*100)}% less damage and lose ${zN.resist}% physical resistance (a fifth if immune).`；冷卻 ()=>3 | — | —；contagion Contagion (horde)、witheringGround Withering Ground (even)、doom Doom (boss)；進化 |
| confuse／Confuse | 1／curse（推測）／1 | — | e=>`Monsters within ${WN.radius} of the nearest attack each other with their own blows for ${+WN.time(e).toFixed(1)} seconds (not act bosses).`；冷卻 ()=>4 | — | vitality ≥1、技能 1 → attract；contagion Contagion (horde)、maddingGround Madding Ground (even)、bedlam Bedlam (even)；進化 |
| attract／Attract | 1／curse（推測）／1 | — | e=>`Monsters within ${GN.radius} attack the toughest of the nearest pack for ${+GN.time(e).toFixed(1)}s, then the next when it dies.`；冷卻 ()=>3 | — | —；lure Lure (horde)、sacrifice Sacrifice (horde)、regicide Regicide (boss)；進化 |
| revive／Revive | 3／summon（推測）／1 | — | (e,t)=>({min:RP(e,gP,F(`revive`,t)),per:`a skeleton's blow`,rate:_P/yN})；冷卻 ()=>1.1 | — | —；legion Legion (horde)、champion Champion (boss)、martyr Martyr (horde)；進化 |
| bloodGolem／Blood Golem | 3／summon（推測）／1 | — | (e,t)=>({min:VP(e,cP.damage,`physical`,F(`bloodGolem`,t)),per:`the golem's blow`,rate:1/xN})；冷卻 ()=>5 | — | summonResist ≥1、技能 1 → ironGolem；twins Twins (even)、bloodbond Bloodbond (even)、grapple Grapple (boss)；進化 |
| ironGolem／Iron Golem | 3／summon（推測）／1 | — | (e,t)=>({min:VP(e,lP.damage,`physical`,F(`ironGolem`,t)),per:`the golem's blow`,rate:1/xN})；冷卻 ()=>5 | — | golemMastery ≥1、技能 1 → fireGolem；taunt Taunt (even)、chargedIron Charged Iron (even)、anvil Anvil (boss)；進化 |
| fireGolem／Fire Golem | 3／summon（推測）／1 | — | (e,t)=>({min:VP(e,uP.damage,`fire`,F(`fireGolem`,t)),per:`the golem's blow`,rate:1/xN})；冷卻 ()=>4 | — | —；inferno Inferno (even)、forge Forge (boss)、stormGolem Storm Golem (even)；進化 |

| 被動 ID／英文名稱 | 樹／上限 | 效果原始描述 | 進化條件對象 |
|---|---|---|---|
| boneArmor／Bone Armor | 2／5 | e=>`Bone takes all physical damage, up to ${PM(e)}, regrowing in 30s. ${MM(e)}% less physical damage` | boneSpear → boneSpirit |
| boneWall／Bone Wall | 2／5 | e=>`+${10*e}% magic damage (Teeth, Bone Spear, Bone Spirit)` | teeth → boneSpear |
| lowerResist／Lower Resist | 1／null | e=>`Lowers every monster's fire, cold, lightning and poison resistance by ${HN(e)}%, up to ${HN(BN)}% (a fifth if immune).` | poisonExplosion → poisonNova |
| skeletonMastery／Skeleton Mastery | 3／5 | e=>`Skeletons, mages and revives get +${Math.round(OP*100*e)}% life and damage` | raiseSkeleton → revive |
| golemMastery／Golem Mastery | 3／5 | e=>`Golems get +${25*e}% life, +${10*e}% damage and +${Pw(0,40,y(e,5))}% speed` | clayGolem → bloodGolem、ironGolem → fireGolem |
| summonResist／Summon Resist | 3／5 | e=>`Summons take ${Math.round(hP(e)*100)}% less fire, cold, lightning and poison damage` | bloodGolem → ironGolem |

## 刺客（assassin）

| 技能 ID／英文名稱 | 樹／類型／上限 | 距離候選 | 傷害公式／冷卻 | 協同原始定義 | 進化／變體／解鎖 |
|---|---|---|---|---|---|
| fireTrauma／Fire Blast | 1／spell（推測）／8 | 450 | (e,t)=>({min:GB(e,t),per:`a bomb`})；冷卻 1 × 0.93^(等級−1) 秒；實際另受冷卻倍率影響 | shockField +9%、chargedBoltSentry +9%、wakeOfFireSentry +9%、lightningSentry +9%、infernoSentry +9%、deathSentry +9% | fcr ≥1、技能 8 → wakeOfFireSentry；cluster Cluster (horde)、napalm Napalm (even)、sticky Sticky (boss)；等級 1 |
| shockField／Shock Web | 1／spell（推測）／8 | — | (e,t)=>({min:KB(e,t),hits:Math.round(bz(t)/Ps),per:`a hit of a web`})；冷卻 3.2 × 0.94^(等級−1) 秒；實際另受冷卻倍率影響 | chargedBoltSentry +11%、lightningSentry +11%、deathSentry +11% | —；wideNet Wide Net (horde)、creeping Creeping (even)、snare Snare (boss)；等級 6 |
| chargedBoltSentry／Charged Bolt Sentry | 1／trap（推測）／8 | — | (e,t)=>({min:qB(e,t),hits:25,per:`a bolt`,most:25/tz})；冷卻 3.2 × 0.93^(等級−1) 秒；實際另受冷卻倍率影響 | fireTrauma +6%、lightningSentry +6%、deathSentry +6% | fcr ≥1、技能 8 → lightningSentry；legion Legion (horde)、overload Overload (even)、lance Lance (even)；等級 12 |
| bladeSentinel／Blade Sentinel | 1／attack（推測）／8 | — | (e,t)=>({min:YB(e,t),hits:Math.max(1,Math.round(Sz(t)/ZB)),per:`a cut`,crits:!0,most:xR/ZB})；冷卻 3 × 0.94^(等級−1) 秒；實際另受冷卻倍率影響 | — | quickness ≥1、技能 8 → bladeFury；twin Twin (even)、orbit Orbit (horde)、keenEdge Keen Edge (boss)；等級 6 |
| tigerStrike／Tiger Strike | 3／attack（推測）／8 | — | (e,t)=>({min:QB(e,t),per:`a blow`,crits:!0,around:vH(3*QB(e,t)*Az(t))})；冷卻 0.7 × 0.94^(等級−1) 秒；實際另受冷卻倍率影響 | — | venom ≥1、技能 8 → royalStrike；shockwave Shockwave (horde)、pounce Pounce (even)、patience Patience (boss)；等級 1 |
| cobraStrike／Cobra Strike | 3／attack（推測）／8 | — | (e,t)=>({min:jz(t)*$B(e),per:`a blow`,crits:!0,around:vH(Cz(t)*$B(e))})；冷卻 0.7 × 0.94^(等級−1) 秒；實際另受冷卻倍率影響 | — | —；spit Spit (horde)、quickDrain Quick Drain (even)、fang Fang (boss)；等級 12 |
| fistsOfFire／Fists of Fire | 3／spell（推測）／8 | — | (e,t)=>{let n=Wz(t)*rr(e.player,tB)*FV(e,`fire`)*YS(e,`fire`);return{min:eV(e,t),per:`a blow`,crits:!0,around:vH(n*(1+yH),n)}}；冷卻 Ez | royalStrike +12% | clawMastery ≥1、技能 8 → clawsOfThunder；flare Flare (even)、embers Embers (even)、sear Sear (boss)；等級 6 |
| dragonTalon／Dragon Talon | 3／attack（推測）／8 | — | (e,t)=>({min:tV(e,t),hits:Nz(t),per:`a kick`,crits:!0})；冷卻 e=>.4+.5*Nz(e) | — | frw ≥1、技能 8 → dragonClaw；sweep Sweep (horde)、emberHeel Ember Heel (even)、crack Crack (boss)；等級 1 |
| psychicHammer／Psychic Hammer | 2／spell（推測）／8 | 450 | (e,t)=>({min:nV(e,t),hits:pB(t),per:`a blow of the mind`,crits:!0})；冷卻 hB | — | fade ≥1、技能 8 → mindBlast；quake Quake (horde)、echo Echo (even)、maul Maul (boss)；等級 1 |
| cloakOfShadows／Cloak of Shadows | 2／spell（推測）／8 | — | e=>`Near a crowd or boss, blinds all but act bosses around you for ${xB(e).toFixed(1)}s. They take ${Math.round(SB(e)*100)}% more damage.`；冷卻 9 × 0.95^(等級−1) 秒；實際另受冷卻倍率影響 | — | —；night Night (horde)、shroud Shroud (even)、mark Mark (boss)；等級 12 |
| shadowWarrior／Shadow Warrior | 2／summon（推測）／8 | — | (e,t)=>({min:iV(e,t),rate:lV/aV,per:`a blow`,crits:!0})；冷卻 ()=>3 | — | weaponBlock ≥1、技能 8 → shadowMaster；legion Legion (horde)、martyr Martyr (even)、stalker Stalker (boss)；等級 18 |
| wakeOfFireSentry／Wake of Fire | 1／trap（推測）／1 | — | (e,t)=>({min:uV(e,t),hits:5,per:`a wave`,most:xR/$R})；冷卻 ()=>3 | fireTrauma +8%、infernoSentry +8% | fade ≥1、技能 1 → infernoSentry；ring Full Circle (horde)、overload Overload (even)、tightWave Tight Wave (boss)；進化 |
| infernoSentry／Wake of Inferno | 1／trap（推測）／1 | — | (e,t)=>({min:dV(e,t),hits:50,per:`a flame`,most:25/ez})；冷卻 ()=>3 | fireTrauma +10%、deathSentry +10%、wakeOfFireSentry +7% | —；fan Fan (even)、brazier Brazier (even)、blowtorch Blowtorch (even)；進化 |
| lightningSentry／Lightning Sentry | 1／trap（推測）／1 | — | (e,t)=>({min:fV(e,t),hits:10,per:`a bolt`,crits:!0,most:xR/tz})；冷卻 ()=>3 | shockField +12%、chargedBoltSentry +12%、deathSentry +12% | fcr ≥1、技能 1 → deathSentry；fork Fork (even)、overload Overload (even)、hunter Hunter (even)；進化 |
| deathSentry／Death Sentry | 1／trap（推測）／1 | — | (e,t)=>({min:pV(e,t),hits:5,per:`a bolt`,crits:!0,most:xR/tz})；冷卻 ()=>3 | lightningSentry +12% | —；chainBlast Chain Blast (horde)、pyre Pyre (even)、overcharge Overcharge (boss)；進化 |
| bladeFury／Blade Fury | 1／attack（推測）／1 | — | (e,t)=>({min:mV(e,t),hits:6,per:`a blade`,crits:!0})；冷卻 ()=>.8 | — | vitality ≥1、技能 1 → bladeShield；hail Hail (even)、return Return (even)、bullseye Bullseye (boss)；進化 |
| bladeShield／Blade Shield | 1／attack（推測）／1 | — | (e,t)=>({...BV(TV(e,t),wV(e,t)),rate:8.88888888888889,per:`a cut or a thrown blade`,crits:!0})；冷卻 ()=>10 | — | —；storm Storm (horde)、burst Burst (even)、hunt Hunt (boss)；進化 |
| royalStrike／Phoenix Strike | 3／spell（推測）／1 | — | (e,t)=>({min:OV(e,t),per:`a blow`,crits:!0,around:bH(xH(e,t))})；冷卻 ()=>.55 | fistsOfFire +10% (fire)、clawsOfThunder +13% (lightning)、bladesOfIce +10% (cold) | —；tempest Tempest (horde)、rebirth Rebirth (even)、ember Ember (boss)；進化 |
| clawsOfThunder／Claws of Thunder | 3／spell（推測）／1 | — | (e,t)=>{let n=Gz*rr(e.player,tB)*FV(e,`lightning`)*YS(e,`lightning`)*F(`clawsOfThunder`,t);return{min:jV(e,t),per:`a blow`,crits:!0,around:vH(n*(1+Jz),n*(Jz+Yz))}}；冷卻 ()=>AV | royalStrike +8% | weaponBlock ≥1、技能 1 → bladesOfIce；chain Chain (even)、static Static (even)、thunderclap Thunderclap (boss)；進化 |
| bladesOfIce／Blades of Ice | 3／spell（推測）／1 | — | (e,t)=>{let n=cB*rr(e.player,tB)*FV(e,`cold`)*YS(e,`cold`)*F(`bladesOfIce`,t);return{min:MV(e,t),per:`a blow`,crits:!0,around:vH(n*2,n)}}；冷卻 ()=>.45 | royalStrike +8% | —；shards Shards (horde)、frostfire Frostfire (even)、deepCold Deep Cold (boss)；進化 |
| dragonClaw／Dragon Claw | 3／attack（推測）／1 | — | (e,t)=>({min:NV(e,t),hits:2,per:`a claw blow`,crits:!0})；冷卻 ()=>.6 | clawMastery +4% | clawMastery ≥1、技能 1 → dragonTail；cleave Cleave (horde)、stormClaw Storm Claw (even)、slayer Slayer (boss)；進化 |
| dragonTail／Dragon Tail | 3／spell（推測）／1 | — | (e,t)=>({...BV(PV(e,t),IV(e,t)),hits:2,per:`a kick or its fire`,crits:!0,around:3*IV(e,t)})；冷卻 ()=>zz | — | quickness ≥1、技能 1 → dragonFlight；wideTail Wide Tail (horde)、searing Searing (even)、focusedTail Focused Tail (boss)；進化 |
| dragonFlight／Dragon Flight | 3／attack（推測）／1 | — | (e,t)=>({...BV(LV(e,t),RV(e,t)),hits:2,per:`a kick or its fire`,crits:!0,around:3*RV(e,t)})；冷卻 ()=>Bz | — | —；arrival Arrival (horde)、twinKick Twin Kick (even)、hunter Hunter (boss)；進化 |
| mindBlast／Mind Blast | 2／spell（推測）／1 | — | (e,t)=>({min:zV(e,t),per:`a monster in the blast`,crits:!0})；冷卻 ()=>vB | — | —；wideMind Wide Mind (horde)、echo Echo (even)、focus Focus (boss)；進化 |
| shadowMaster／Shadow Master | 2／summon（推測）／1 | — | (e,t)=>({min:cV(e,t),rate:lV/oV,per:`a blow`,crits:!0})；冷卻 ()=>3 | — | —；legion Legion (horde)、martyr Martyr (even)、stalker Stalker (boss)；進化 |

| 被動 ID／英文名稱 | 樹／上限 | 效果原始描述 | 進化條件對象 |
|---|---|---|---|
| clawMastery／Claw Mastery | 2／5 | e=>`+${Math.round(NB(e)*100)}% physical damage and +${Math.round(PB(e)*100)}% chance of a critical strike` | fistsOfFire → clawsOfThunder、dragonClaw → dragonTail |
| weaponBlock／Weapon Block | 2／5 | e=>`+${Math.round(FB(e)*100)}% chance to block a monster's hit` | shadowWarrior → shadowMaster、clawsOfThunder → bladesOfIce |
| quickness／Burst of Speed | 2／5 | e=>`+${LB(e)}% movement speed (up to +${IB}%) and ${Math.round((1-1/RB(e))*100)}% shorter recharge` | bladeSentinel → bladeFury、dragonTail → dragonFlight |
| fade／Fade | 2／5 | e=>`+${Math.round(zB(e)*100)}% to all resistances, ${VB(e)}% Damage Reduced. Curses ${Math.round(BB(e)*100)}% shorter, poison and chill ${Math.round(UB(e)*100)}%.` | psychicHammer → mindBlast、wakeOfFireSentry → infernoSentry |
| venom／Venom | 2／5 | e=>`Claws and blades poison each monster struck for ${Math.round(WB(e))} damage over ${mr}s.` | tigerStrike → royalStrike |

## 野蠻人（barbarian）

| 技能 ID／英文名稱 | 樹／類型／上限 | 距離候選 | 傷害公式／冷卻 | 協同原始定義 | 進化／變體／解鎖 |
|---|---|---|---|---|---|
| doubleSwing／Double Swing | 1／attack（推測）／8 | — | (e,t)=>({min:nJ(e,t),hits:2,per:`a blow`,crits:!0})；冷卻 0.75 × 0.93^(等級−1) 秒；實際另受冷卻倍率影響 | bash +10% | increasedSpeed ≥1、技能 8 → frenzy；earthsplit Earthsplit (even)、headsman Headsman (boss)、stormEdge Storm Edge (even)；等級 6 |
| bash／Bash | 1／attack（推測）／8 | — | (e,t)=>({min:rJ(e,t),per:`a blow`,crits:!0})；冷卻 1.4 × 0.93^(等級−1) 秒；實際另受冷卻倍率影響 | stun +5% | axeMastery ≥1、技能 8 → concentrate；hurl Hurl (even)、pin Pin (even)、chargedBlow Charged Blow (even)；等級 1 |
| stun／Stun | 1／attack（推測）／8 | — | (e,t)=>({min:iJ(e,t),per:`a blow`,crits:!0})；冷卻 1.8 × 0.93^(等級−1) 秒；實際另受冷卻倍率影響 | bash +8% | —；concussion Concussion (horde)、crack Crack (boss)、aftershock Aftershock (horde)；等級 12 |
| leap／Leap | 1／attack（推測）／8 | — | (e,t)=>({min:aJ(e,t),per:`a monster at the landing`,crits:!0})；冷卻 5 × 0.93^(等級−1) 秒；實際另受冷卻倍率影響 | — | frw ≥1、技能 8 → leapAttack；gather Gather (even)、rumble Rumble (even)、hammerfall Hammerfall (boss)；等級 6 |
| doubleThrow／Double Throw | 1／attack（推測）／8 | — | (e,t)=>({min:sJ(e,t),hits:2,per:`an axe`,crits:!0})；冷卻 1 × 0.93^(等級−1) 秒；實際另受冷卻倍率影響 | doubleSwing +8% | throwingMastery ≥1、技能 8 → whirlingAxes；return Return (even)、greatAxe Great Axe (boss)、venom Venom (even)；等級 12 |
| whirlwind／Whirlwind | 1／attack（推測）／8 | — | (e,t)=>({min:cJ(e,t),hits:_J,per:`a hit of your spin`,crits:!0})；冷卻 4 × 0.93^(等級−1) 秒；實際另受冷卻倍率影響 | — | —；cyclone Cyclone (horde)、dervish Dervish (even)、blazingPath Blazing Path (even)；等級 30 |
| howl／Howl | 3／attack（推測）／8 | — | e=>`When monsters crowd you while you are hurt, they flee in fear for ${xq(e).toFixed(1)} seconds. Bosses flee less, act bosses never.`；冷卻 10 × 0.95^(等級−1) 秒；實際另受冷卻倍率影響 | — | —；cower Cower (horde)、echo Echo (even)、warHowl War Howl (horde)；等級 1 |
| taunt／Taunt | 3／attack（推測）／8 | — | e=>`Enrages the toughest monster nearby to charge you for ${Mq(e).toFixed(1)} seconds, its blows ${Math.round(Nq(e)*100)}% weaker.`；冷卻 6 × 0.95^(等級−1) 秒；實際另受冷卻倍率影響 | — | —；rabble Rabble (horde)、challenge Challenge (boss)；等級 6 |
| shout／Shout | 3／attack（推測）／8 | — | e=>`For ${Sq(e)} seconds your Defense is ${wq(e)}% higher, so monsters' blows and arrows miss you more.`；冷卻 e=>Sq(e)+2 | — | vitality ≥1、技能 8 → battleOrders；lastStand Last Stand (even)、rally Rally (horde)、spikes Spikes (horde)；等級 6 |
| battleCry／Battle Cry | 3／attack（推測）／8 | — | e=>`Monsters around you, bosses too, take ${Math.round(Eq(e)*100)}% more damage for ${Dq(e).toFixed(1)}s.`；冷卻 9 × 0.95^(等級−1) 秒；實際另受冷卻倍率影響 | — | —；mark Mark (boss)、rollingCry Rolling Cry (horde)、contagion Contagion (horde)；等級 18 |
| warCry／War Cry | 3／attack（推測）／8 | — | (e,t)=>({min:lJ(e,t),per:`a monster around you`,crits:!0})；冷卻 6 × 0.94^(等級−1) 秒；實際另受冷卻倍率影響 | howl +6%、taunt +6%、battleCry +6% | —；roar Roar (even)、bellow Bellow (boss)、thunderCry Thunder Cry (even)；等級 30 |
| grimWard／Grim Ward | 3／attack（推測）／8 | — | e=>`Creates a frightening totem in the nearest pack. Monsters within ${Fq(e)} of it flee for ${Pq(e).toFixed(1)} seconds.`；冷卻 11 × 0.95^(等級−1) 秒；實際另受冷卻倍率影響 | — | —；lure Lure (horde)、dreadWard Dread Ward (even)、martyrTotem Martyr Totem (horde)；等級 24 |
| frenzy／Frenzy | 1／attack（推測）／1 | — | (e,t)=>({min:uJ(e,t),hits:2,per:`a blow`,crits:!0})；冷卻 ()=>.55/(1+.1*(xJ?.frenzy.stacks??0)) | doubleSwing +8%、taunt +8% | —；roundSwing Round Swing (horde)、fixation Fixation (boss)、flameEdge Flame Edge (even)；進化 |
| concentrate／Concentrate | 1／attack（推測）／1 | — | (e,t)=>({min:dJ(e,t),per:`a blow`,crits:!0})；冷卻 ()=>.7 | bash +5%、battleOrders +10% | ironSkin ≥1、技能 1 → berserk；shatter Shatter (horde)、crush Crush (boss)、stormBlow Storm Blow (even)；進化 |
| berserk／Berserk | 1／spell（推測）／1 | — | (e,t)=>({min:pJ(e,t),per:`a blow`,crits:!0})；冷卻 ()=>.6 | howl +10%、shout +10% | —；gore Gore (horde)、overhead Overhead (boss)、bloodRage Blood Rage (even)；進化 |
| leapAttack／Leap Attack | 1／attack（推測）／1 | 340 | (e,t)=>({min:hJ(e,t),max:mJ(e,t),hits:2,per:`the landing or the strike`,crits:!0})；冷卻 ()=>2 | leap +10% | —；quake Quake (horde)、hammerfall Hammerfall (boss)、stormLanding Storm Landing (even)；進化 |
| whirlingAxes／Lacerator | 1／attack（推測）／1 | 450 | (e,t)=>({min:gJ(e,t),hits:6,per:`an axe`,crits:!0})；冷卻 ()=>.8 | — | —；return Return (even)、bullseye Bullseye (boss)、stormAxes Storm Axes (even)；進化 |
| battleOrders／Battle Orders | 3／attack（推測）／1 | — | ()=>`You have 35% more life, renewed every 12 seconds.`；冷卻 ()=>12 | — | findItem ≥1、技能 1 → battleCommand；warBanner War Banner (even)、bloodlust Bloodlust (horde)、secondWind Second Wind (even)；進化 |
| battleCommand／Battle Command | 3／attack（推測）／1 | — | ()=>`Gives Battle Orders and +1 to all your skills.`；冷卻 ()=>12 | — | —；warBanner War Banner (even)、bloodlust Bloodlust (horde)、secondWind Second Wind (even)；進化 |

| 被動 ID／英文名稱 | 樹／上限 | 效果原始描述 | 進化條件對象 |
|---|---|---|---|
| axeMastery／axeMastery | null／null | 待確認 | bash → concentrate |
| swordMastery／swordMastery | null／null | 待確認 | — |
| maceMastery／maceMastery | null／null | 待確認 | — |
| poleArmMastery／poleArmMastery | null／null | 待確認 | — |
| spearMastery／spearMastery | null／null | 待確認 | — |
| throwingMastery／Throwing Mastery | 2／5 | e=>`Thrown axes deal ${Math.round(Rq*100*e)}% more damage and have +${Math.round(zq(e)*100)}% chance to pierce what they hit.` | doubleThrow → whirlingAxes |
| ironSkin／Iron Skin | 2／5 | `Improves Defense, so monsters' blows and arrows miss you more.` | concentrate → berserk |
| increasedStamina／Increased Stamina | 2／5 | e=>`Regenerates ${Xq(e)}% of maximum life per second` | — |
| naturalResistance／Natural Resistance | 2／5 | e=>`+${Math.round(Hq(e)*100)}% to all resistances. Poison and chill wear off ${Math.round(Uq*100*e)}% faster.` | — |
| increasedSpeed／Increased Speed | 2／5 | e=>`+${Gq(e)}% movement speed, up to +${Wq}%` | doubleSwing → frenzy |
| findPotion／Find Potion | 3／5 | e=>`Slain monsters have a ${Math.round(Zq*100*e)}% chance to leave a healing potion` | — |
| findItem／Find Item | 3／5 | e=>`Slain monsters have a ${Math.round($q.normal.gold*100*e)}% chance to leave gold, champions ${Math.round($q.champion.gold*100*e)}%, and a small chance of an item.` | battleOrders → battleCommand |

## 聖騎士（paladin）

| 技能 ID／英文名稱 | 樹／類型／上限 | 距離候選 | 傷害公式／冷卻 | 協同原始定義 | 進化／變體／解鎖 |
|---|---|---|---|---|---|
| blessedHammer／Blessed Hammer | 1／spell（推測）／8 | — | (e,t)=>({min:JQ(e,t),hits:RZ(t),per:`a hammer`})；冷卻 1 × 0.93^(等級−1) 秒；實際另受冷卻倍率影響 | blessedAim +14%、vigor +14% | concentration ≥1、技能 8 → hammerOfZakarum；swarm Swarm (even)、tightOrbit Tight Orbit (even)、return Return (even)；等級 18 |
| holyBolt／Holy Bolt | 1／spell（推測）／8 | 450 | (e,t)=>({min:YQ(e,t),hits:BZ(t),per:`a bolt`})；冷卻 1.1 × 0.93^(等級−1) 秒；實際另受冷卻倍率影響 | blessedHammer +50%、fistOfTheHeavens +50% | holyShock ≥1、技能 8 → fistOfTheHeavens；fan Fan (horde)、lance Lance (boss)、ricochet Ricochet (even)；等級 6 |
| zeal／Zeal | 1／attack（推測）／8 | — | (e,t)=>({min:XQ(e,t),hits:WZ(t),per:`a blow`,crits:!0})；冷卻 0.9 × 0.94^(等級−1) 秒；實際另受冷卻倍率影響 | sacrifice +12% | might ≥1、技能 8 → fanaticZeal；cleave Cleave (horde)、focus Focus (boss)、holyEdge Holy Edge (even)；等級 12 |
| charge／Charge | 1／attack（推測）／8 | — | (e,t)=>({min:ZQ(e,t),max:ZQ(e,t)*QQ,hits:2,per:`a hit or the end blow`,crits:!0})；冷卻 4.5 × 0.92^(等級−1) 秒；實際另受冷卻倍率影響 | vigor +20%、might +20% | vigor ≥1、技能 8 → holyCharge；arrival Arrival (horde)、lance Lance (boss)、trail Trail (even)；等級 12 |
| holyShield／Holy Shield | 1／spell（推測）／8 | — | (e,t)=>({min:$Q(e,qZ(t)),per:`a smite at what it blocks`,crits:!0,struck:!0})；冷卻 12 × 0.97^(等級−1) 秒；實際另受冷卻倍率影響 | — | defiance ≥1、技能 8 → exile；retribution Retribution (horde)、ward Ward (even)；等級 24 |
| smite／Smite | 1／attack（推測）／8 | — | (e,t)=>({min:e$(e,t),per:`a bash`,crits:!0})；冷卻 ()=>eQ | — | fanaticism ≥1、技能 8 → almaNegra；rebound Rebound (horde)、pin Pin (even)、holyEdge Holy Edge (even)；等級 1 |
| sacrifice／Sacrifice | 1／attack（推測）／8 | — | (e,t)=>({min:t$(e,t),per:`a blow`,crits:!0})；冷卻 w$ | redemption +15%、fanaticism +5% | redemption ≥1、技能 8 → bloodrise；bloodletting Bloodletting (horde)、martyr Martyr (even)、atonement Atonement (even)；等級 1 |
| vengeance／Vengeance | 1／spell（推測）／8 | — | (e,t)=>{let n=r$(e),r=[a$(e),...o$.map((r,i)=>i$({player:e.player},n$(e,t)*n[i],r))];return{min:Math.min(...r),max:Math.max(...r),hits:r.length,per:`a blow or a burst of fire, cold or lightning`}}；冷卻 1.6 × 0.93^(等級−1) 秒；實際另受冷卻倍率影響 | resistFire +10% (fire)、resistCold +10% (cold)、resistLightning +10% (lightning)、salvation +2% | conviction ≥1、技能 8 → rusthandle；burst Burst (horde)、focused Focused (boss)、attuned Attuned (even)；等級 18 |
| conversion／Conversion | 1／spell（推測）／8 | — | e=>`The strongest monster near you, never an elite or a boss, fights for you for ${tQ(e)}s, up to ${nQ(e)} at once.`；冷卻 7 × 0.93^(等級−1) 秒；實際另受冷卻倍率影響 | — | —；legion Legion (horde)、fealty Fealty (boss)、redeemed Redeemed (even)；等級 24 |
| hammerOfZakarum／Zakarum's Hand | 1／spell（推測）／1 | — | (e,t)=>({min:l$(e,t),hits:4,per:`a hammer`})；冷卻 ()=>.55 | — | —；swarm Swarm (even)、tightOrbit Tight Orbit (boss)、hammerfall Hammerfall (even)；進化 |
| fistOfTheHeavens／Fist of the Heavens | 1／spell（推測）／1 | 450 | (e,t)=>({min:u$(e,t),hits:2,per:`a lightning strike`})；冷卻 ()=>1 | holyBolt +15% (magic)、holyShock +7% (lightning) | —；storm Storm (horde)、judgement Judgement (boss)、twinStrike Twin Strike (even)；進化 |
| fanaticZeal／Passion | 1／attack（推測）／1 | — | (e,t)=>({min:p$(e,t),hits:6,per:`a blow`,crits:!0})；冷卻 ()=>.5 | — | —；sweep Sweep (horde)、fervor Fervor (boss)、holyEdge Holy Edge (even)；進化 |
| holyCharge／Herald of Zakarum | 1／attack（推測）／1 | — | (e,t)=>({min:h$(e,t),hits:6,per:`a blow`,crits:!0})；冷卻 ()=>2.4 | — | —；crusade Crusade (even)、lance Lance (boss)、trail Trail (even)；進化 |
| exile／Exile | 1／spell（推測）／1 | — | (e,t)=>({min:_$(e,t),per:`a monster in the blast`})；冷卻 ()=>4 | — | —；echo Echo (even)、focused Focused (boss)、retribution Retribution (even)；進化 |
| rusthandle／Rusthandle | 1／spell（推測）／1 | — | (e,t)=>{let n=r$(e),r=[a$(e),...o$.map((r,i)=>i$({player:e.player},b$(e,t)*n[i],r))];return{min:Math.min(...r),max:Math.max(...r),hits:r.length*y$,per:`a blow or a burst of fire, cold or lightning`}}；冷卻 ()=>1 | resistFire +10% (fire)、resistCold +10% (cold)、resistLightning +10% (lightning)、salvation +2% | —；cascade Cascade (horde)、duel Duel (boss)、attuned Attuned (even)；進化 |
| almaNegra／Alma Negra | 1／attack（推測）／1 | — | (e,t)=>({min:S$(e,t),per:`a bash`,crits:!0})；冷卻 ()=>eQ | — | —；wideWave Wide Wave (horde)、faultLine Fault Line (even)、holyEdge Holy Edge (even)；進化 |
| bloodrise／Bloodrise | 1／attack（推測）／1 | — | (e,t)=>({min:T$(e,t),per:`a blow`,crits:!0})；冷卻 w$ | redemption +15%、fanaticism +5% | —；whirl Whirl (horde)、martyr Martyr (even)、hemorrhage Hemorrhage (even)；進化 |

| 被動 ID／英文名稱 | 樹／上限 | 效果原始描述 | 進化條件對象 |
|---|---|---|---|
| might／Might | 2／5 | e=>`Adds +${VQ(PQ(e))}% physical damage (Zeal, Smite, Charge).` | zeal → fanaticZeal |
| holyFire／Holy Fire | 2／5 | `Burns monsters around you each second, and adds 6 times that to your attacks.` | — |
| holyFreeze／Holy Freeze | 2／5 | `Slows monsters around you by half and chills them, and adds 5 times its cold to attacks.` | — |
| holyShock／Holy Shock | 2／5 | `Jolts monsters around you each second, and adds 6 times that to your attacks.` | holyBolt → fistOfTheHeavens |
| concentration／Concentration | 2／5 | e=>`Adds +${VQ(IQ(e))}% damage to your attacks and Blessed Hammer.` | blessedHammer → hammerOfZakarum |
| fanaticism／Fanaticism | 2／5 | e=>`Skills recharge ${VQ(1-1/RQ(e))}% faster and gain +${VQ(FQ(e))}% physical damage.` | smite → almaNegra |
| conviction／Conviction | 2／5 | e=>`Monsters around you resist fire, cold and lightning ${SQ(e)}% less (a fifth of that if immune).` | vengeance → rusthandle |
| thorns／Thorns | 2／5 | e=>`Monsters that strike you in melee take back ${VQ(cQ(e))}% of the blow.` | — |
| blessedAim／Blessed Aim | 2／5 | e=>`Gives Zeal, Smite, Charge and Sacrifice +${VQ(DQ(e))}% chance of a critical strike (double damage).` | — |
| vigor／Vigor | 3／5 | e=>`Adds +${TQ(e)}% movement speed, up to +${EQ}%, and Charge reaches further.` | charge → holyCharge |
| defiance／Defiance | 3／5 | `Adds Defense, so monsters' blows and arrows miss you more.` | holyShield → exile |
| prayer／Prayer | 3／5 | e=>`Heals you ${wQ(e)} life a second, up to ${wQ(5)}.` | — |
| resistFire／Resist Fire | 3／5 | e=>`Adds +${yQ(e)}% fire resistance, and +${bQ(1)}% to its maximum (75%) a level learned.` | — |
| resistCold／Resist Cold | 3／5 | e=>`Adds +${yQ(e)}% cold resistance, and +${bQ(1)}% to its maximum (75%) a level learned. Chill wears off ${VQ(kQ*e)}% faster.` | — |
| resistLightning／Resist Lightning | 3／5 | e=>`Adds +${yQ(e)}% lightning resistance, and +${bQ(1)}% to its maximum (75%) a level learned.` | — |
| salvation／Salvation | 3／5 | e=>`Adds +${CQ(e)}% fire, cold and lightning resistance, and chill wears off ${VQ(AQ*e)}% faster.` | — |
| cleansing／Cleansing | 3／5 | e=>`Poison and chill wear off ${VQ(OQ*e)}% faster on you.` | — |
| meditation／Meditation | 3／5 | e=>`Adds +${gm(e)}% mana regeneration as Faster Cast Rate, so skills recharge ${MQ(e)}% faster.` | — |
| redemption／Redemption | 3／5 | e=>`Monsters slain near you heal you ${BQ} life ${VQ(zQ*e)}% of the time.` | sacrifice → bloodrise |
| sanctuary／Sanctuary | 2／5 | e=>`Hurts the undead near you for ${AZ(e)} damage twice a second, and knocks them back.` | — |

## 德魯伊（druid）

| 技能 ID／英文名稱 | 樹／類型／上限 | 距離候選 | 傷害公式／冷卻 | 協同原始定義 | 進化／變體／解鎖 |
|---|---|---|---|---|---|
| firestorm／Firestorm | 3／spell（推測）／8 | — | (e,t)=>({min:g3(e,t),hits:uye(P0),per:`a quarter second in a flame`})；冷卻 1.5 × 0.93^(等級−1) 秒；實際另受冷卻倍率影響 | moltenBoulder +23%、eruption +23% | cycloneArmor ≥1、技能 8 → moltenBoulder；wildfire Wildfire (horde)、firewall Firewall (even)、frostfire Frostfire (even)；等級 1 |
| arcticBlast／Arctic Blast | 3／spell（推測）／8 | 170 | (e,t)=>({min:_3(e,t),hits:10,per:`a shard`,crits:!0})；冷卻 1.4 × 0.93^(等級−1) 秒；實際另受冷卻倍率影響 | hurricane +15%、cycloneArmor +15% | —；wideBlast Wide Blast (horde)、iceLance Ice Lance (even)、dragonBreath Dragon Breath (even)；等級 6 |
| eruption／Fissure | 3／spell（推測）／8 | 450 | (e,t)=>({min:v3(e,t),hits:dye,per:`a burst`,crits:!0})；冷卻 3.2 × 0.93^(等級−1) 秒；實際另受冷卻倍率影響 | firestorm +12%、volcano +12% | fcr ≥1、技能 8 → volcano；wideFissure Wide Fissure (horde)、rift Rift (boss)、quake Quake (even)；等級 12 |
| twister／Twister | 3／attack（推測）／8 | 450 | (e,t)=>({min:y3(e,t),hits:V0(t),per:`a twister`,crits:!0})；冷卻 1.6 × 0.93^(等級−1) 秒；實際另受冷卻倍率影響 | tornado +10%、hurricane +10% | frw ≥1、技能 8 → tornado；gale Gale (horde)、dustDevil Dust Devil (even)、vortex Vortex (horde)；等級 18 |
| raven／Raven | 1／summon（推測）／8 | — | (e,t)=>({min:D3(e,T2(t)),hits:w2(t),per:`a raven's peck`,rate:C2(t)/f2})；冷卻 1.8 × 0.94^(等級−1) 秒；實際另受冷卻倍率影響 | — | ravenlore ≥1、技能 8 → summonSpiritWolf；murder Murder (even)、nightwing Nightwing (even)、blinding Blinding (even)；等級 1 |
| plaguePoppy／Poison Creeper | 1／spell（推測）／8 | — | (e,t)=>({min:k3(e,t),hits:$0,per:`a second of a bite's poison`,rate:Q0(t)})；冷卻 4 × 0.94^(等級−1) 秒；實際另受冷卻倍率影響 | — | replenish ≥1、技能 8 → cycleOfLife；thicket Thicket (boss)、strangler Strangler (horde)、spores Spores (even)；等級 1 |
| oakSage／Oak Sage | 1／attack（推測）／8 | — | e=>`The Oak Sage follows you, adding ${Math.round(O2(e)*100)}% maximum life.`；冷卻 ()=>1 | — | spiritKeeper ≥1、技能 8 → heartOfWolverine；deepRoots Deep Roots (even)、sap Sap (even)、heartwood Heartwood (even)；等級 6 |
| wearwolf／Werewolf | 2／summon（推測）／8 | — | (e,t)=>({min:A3(e,t),per:`a claw`,crits:!0,rate:P3(e,l0(t))})；冷卻 e=>l0(e) | — | feralRage ≥1、技能 8 → fury；rend Rend (horde)、jugular Jugular (boss)、stormClaws Storm Claws (even)；等級 1 |
| wearbear／Werebear | 2／attack（推測）／8 | — | (e,t)=>({min:j3(e,t),per:`a paw`,crits:!0,rate:P3(e,u0)})；冷卻 ()=>f4(X2) | — | shapeShifting ≥1、技能 8 → maul；wideSwipe Wide Swipe (horde)、crushing Crushing (boss)、thickHide Thick Hide (even)；等級 6 |
| moltenBoulder／Molten Boulder | 3／spell（推測）／1 | 450 | (e,t)=>({min:x3(e,t),hits:2,per:`a boulder`,crits:!0})；冷卻 ()=>1.3 | firestorm +8%、volcano +10% | —；avalanche Avalanche (even)、magmaCore Magma Core (boss)、rebound Rebound (even)；進化 |
| volcano／Volcano | 3／spell（推測）／1 | 450 | (e,t)=>({min:C3(e,t),hits:fye,per:`a rock`,crits:!0,most:K0/W0})；冷卻 ()=>3 | eruption +12%、moltenBoulder +12%、armageddon +12% | fireClaws ≥1、技能 1 → armageddon；lavaBombs Lava Bombs (horde)、caldera Caldera (boss)、lavaFlow Lava Flow (even)；進化 |
| armageddon／Armageddon | 3／spell（推測）／1 | 360 | (e,t)=>({min:w3(e,t),hits:Math.round(q0/J0),per:`a rock`,crits:!0,rate:1/J0})；冷卻 ()=>9 | firestorm +14%、moltenBoulder +14%、volcano +14% | —；scorchedEarth Scorched Earth (even)、wrath Wrath (boss)、hailstorm Hailstorm (even)；進化 |
| tornado／Tornado | 3／attack（推測）／1 | 450 | (e,t)=>({min:T3(e,t),hits:3,per:`a tornado`,crits:!0})；冷卻 ()=>1.2 | cycloneArmor +9%、twister +9%、hurricane +9% | cycloneArmor ≥1、技能 1 → hurricane；maelstrom Maelstrom (horde)、eyeOfTheStorm Eye of the Storm (boss)、firenado Firenado (even)；進化 |
| hurricane／Hurricane | 3／spell（推測）／1 | 360 | (e,t)=>({min:E3(e,t),hits:Math.round(Y0/X0),per:`a gust`,crits:!0,rate:1/X0})；冷卻 ()=>9 | twister +9%、tornado +9% | —；galeForce Gale Force (even)、eyeWall Eye Wall (boss)、squall Squall (even)；進化 |
| summonSpiritWolf／Summon Spirit Wolf | 1／summon（推測）／1 | — | (e,t)=>({min:O3(e,v2(20),I4(`spirit`,t)),per:`a spirit wolf's bite`,rate:5/p2})；冷卻 ()=>1.2 | — | ravenlore ≥1、技能 1 → summonFenris；legion Legion (even)、champion Champion (even)、frostWolves Frost Wolves (even)；進化 |
| summonFenris／Summon Dire Wolf | 1／attack（推測）／1 | — | (e,t)=>({min:O3(e,y2(20),I4(`dire`,t)),per:`a dire wolf's bite`,rate:3/p2})；冷卻 ()=>1.2 | — | vitality ≥1、技能 1 → summonGrizzly；legion Legion (even)、fenris Fenris (even)、frenzied Frenzied (even)；進化 |
| summonGrizzly／Summon Grizzly | 1／summon（推測）／1 | — | (e,t)=>({min:O3(e,b2(20),I4(`grizzly`,t)),per:`the grizzly's swipe`,rate:1/m2})；冷卻 ()=>1.2 | — | —；wildPack Wild Pack (even)、alpha Alpha (boss)、rabidPack Rabid Pack (even)；進化 |
| cycleOfLife／Carrion Vine | 1／spell（推測）／1 | — | (e,t)=>({min:k3(e,t2)*F(`cycleOfLife`,t),hits:$0,per:`a second of a bite's poison`,rate:n2})；冷卻 ()=>1.2 | — | fcr ≥1、技能 1 → vines；corpseBloom Corpse Bloom (horde)、nourish Nourish (even)、hoard Hoard (even)；進化 |
| vines／Solar Creeper | 1／summon（推測）／1 | — | (e,t)=>({min:k3(e,t2)*F(`vines`,t),hits:$0,per:`a second of a bite's poison`,rate:n2})；冷卻 ()=>1.2 | — | —；sunburst Sunburst (horde)、longDay Long Day (boss)、stillness Stillness (even)；進化 |
| heartOfWolverine／Heart of Wolverine | 1／attack（推測）／1 | — | e=>`It adds +${Math.round(k2*100)}% damage to your and your summons' blows, +${Math.round(A2*100)}% Attack Rating and the Oak Sage's +${Math.round(O2($1+e-1)*100)}% life.`；冷卻 ()=>1 | — | replenish ≥1、技能 1 → spiritOfBarbs；packHeart Pack Heart (horde)、huntersHeart Hunter's Heart (boss)、loneWolf Lone Wolf (even)；進化 |
| spiritOfBarbs／Spirit of Barbs | 1／attack（推測）／1 | — | ()=>`Monsters that strike you take ${Math.round(j2*100)}% of the damage back, and Wolverine's bonuses stay.`；冷卻 ()=>1 | — | —；thornNova Thorn Nova (horde)、vengeance Vengeance (even)、bramble Bramble (even)；進化 |
| fury／Fury | 2／attack（推測）／1 | — | (e,t)=>({min:M3(e,t),hits:m0,per:`a blow`,crits:!0,rate:m0*P3(e,v0)})；冷卻 ()=>v0 | — | —；rampage Rampage (even)、lacerate Lacerate (boss)、stormFangs Storm Fangs (even)；進化 |
| maul／Maul | 2／attack（推測）／1 | — | (e,t)=>({min:N3(e,t,0),max:N3(e,t,13),per:`a blow`,crits:!0,rate:P3(e,u0)})；冷卻 ()=>u0 | — | shapeShifting ≥1、技能 1 → shockWave；quakePaw Quake Paw (horde)、grudge Grudge (boss)、retaliate Retaliate (even)；進化 |
| shockWave／Shock Wave | 2／attack（推測）／1 | — | (e,t)=>({min:N3(e,t,0),max:N3(e,t,13),per:`a blow`,crits:!0,rate:P3(e,u0),around:4*((N3(e,t,0)+N3(e,t,13))/2)*P3(e,u0)/w0})；冷卻 ()=>u0 | maul +5% | —；earthquake Earthquake (even)、tremor Tremor (boss)、moltenStomp Molten Stomp (even)；進化 |

| 被動 ID／英文名稱 | 樹／上限 | 效果原始描述 | 進化條件對象 |
|---|---|---|---|
| shapeShifting／Lycanthropy | 2／5 | e=>`Your wereforms have +${Math.round(E0(e)*100)}% more life.` | wearbear → maul、maul → shockWave |
| feralRage／Feral Rage | 2／5 | e=>`It gives +${Math.round(M2*100*e)}% physical damage, and as a werewolf you run ${Math.round(O0(e)*100)}% faster, up to ${Math.round(O0(e0)*100)}%.` | wearwolf → fury |
| rabies／Rabies | 2／5 | e=>`Your wereform blows add ${32*e} poison over ${P2}s, and a bitten monster spreads it to those around it.` | — |
| hunger／Hunger | 2／5 | e=>`Your wereform blows heal you ${Math.round(F2(e)*100)}% of their damage.` | — |
| fireClaws／Fire Claws | 2／5 | e=>`+${Math.round(I2*100*e)}% fire damage, and claw and paw blows add ${Math.round(L2(r0(e)))} fire, more with fire skills.` | volcano → armageddon |
| cycloneArmor／Cyclone Armor | 3／5 | e=>`+${Math.round(R2*100*e)}% cold damage. Winds take 100% of fire, cold and lightning hits, up to ${B2(e)}, regrowing in 10s` | firestorm → moltenBoulder、tornado → hurricane |
| ravenlore／Ravenlore | 1／5 | e=>`Your ravens, wolves, grizzly and creepers get +${Math.round(V2*100*e)}% life and damage.` | raven → summonSpiritWolf、summonSpiritWolf → summonFenris |
| spiritKeeper／Spirit Keeper | 1／5 | e=>`Your spirits' bonuses, vines' gifts and creepers' poison are ${Math.round(H2*100*e)}% stronger.` | oakSage → heartOfWolverine |

## 20261101.1 平衡改動

下列逐條保留更新紀錄中涉及技能、屬性與防禦的原文，避免錯譯未明確的條件。

- The Amazon's Valkyrie gives your hero +6% to all resistances at level 1, up to +40% at level 8
- Defense now makes monsters' blows and arrows miss you more often the higher it is, instead of cutting their damage, as in Diablo II
- The Sorceress finds mana potions in barrels and urns, which fill Energy Shield or go to your belt when it's full
- Akara sells mana potions to the Sorceress
- Regenerate Mana on gear refills the Sorceress's Energy Shield faster
- Mana stolen per hit and mana per kill now refill the Sorceress's Energy Shield
- The Assassin loses the flat ×2.7 damage bonus in Terror, and the Assassin's claws, Phoenix Strike and Shadows hit harder instead
- The Assassin's Venom adds 435 poison damage to each claw and blade hit at level 5 (was 80 over 2 seconds)
- The Barbarian loses the flat ×2.1 damage bonus in Terror
- The Druid loses the flat ×2 damage bonus in Terror, and Fire Claws, the Druid's summons and spells hit harder instead
- The Druid's Fire Claws adds 254 fire damage to each hit at level 5, more with fire skills (was half the hit's damage)
- The Necromancer loses the flat ×3.2 damage bonus in Terror, and Corpse Explosion, Revive and Energy are stronger instead
- The Paladin loses the flat ×1.7 damage bonus in Terror, and Might, Fanaticism, Zeal and Charge are stronger instead
- The Sorceress loses the flat ×1.9 damage bonus in Terror, and Hydra, Frozen Orb and Fire Bolt are stronger instead
- The Necromancer's skeletons, mages and revived monsters can rise from any corpse in the skill's range, not just nearby ones
- Monster auras like Holy Shock and Conviction no longer grow past their Diablo II maximum from Terror 12 on
- Monsters killed by the Necromancer's Corpse Explosion leave corpses you can explode again
- The Druid's Cyclone Armor absorbs up to 536 fire, cold and lightning damage at level 5 (was +42% resistance)
- The Paladin's Vengeance and Rusthandle hit the biggest pack in range, bosses first, instead of the nearest monster
- The Paladin's Vengeance and Rusthandle now add your weapon's damage to their fire, cold and lightning
- Iron Skin, Shout, Defiance, Holy Shield and Werebear raise Defense, which the character screen now shows in its own box
- Damage Reduced now comes only from items, Charsi, Fade and Bone Armor, up to 50%, and no longer from Battle Orders or Werewolf
- Resurrecting removes poison, curses, chill and freeze from your hero
- Conviction from items reaches 2.5 times farther, on your hero or your mercenary
- Holy Fire, Holy Freeze and Holy Shock from items reach as far as the Paladin's own auras
- Monsters attack whatever is closest, your hero, your mercenary or your summons, Valkyrie and Decoy included
- Summons' life now grows with the Terror tier, about 3 times at tier 30 and 12 times at tier 100
- The Necromancer's Bone Armor absorbs all physical damage until it breaks (was half of each hit)
- The Assassin's Shadow Warrior and Shadow Master have 55,819 life at level 99 (was 455 and 700)
- The Assassin's Fade makes curses on your hero last 82% less at level 5
- The Amazon's Inner Sight reaches 1.7 times farther
- The Paladin's Conviction reaches 2.2 times farther at level 5
- The Paladin's Holy Fire, Holy Freeze and Holy Shock reach 3 to 3.8 times farther at level 5
- The Desert Mercenary's Holy Freeze reaches as far as the Paladin's
- The Barbarian's Increased Stamina regenerates 1% of max life per second at level 5 (was +61% max life)
- The Assassin's Claw Mastery gives +111% damage at level 5 (was +60%)
- The Druid's Twister gets +100% damage from each of Tornado and Hurricane (was +5%)
- The Druid's Firestorm gets +230% damage from Molten Boulder (was +12%)
- +8 skills from items make the Druid's Fissure 3.9 times stronger (was 1.8 times)
- The Necromancer's Iron Maiden returns 675% of melee damage at level 8 (was 275%)
- The Necromancer's Iron Golem returns 435% of melee damage (was 200%)
- The Necromancer's revived monsters hit as hard as that monster would hit your hero
- The Necromancer's Teeth gets +150% damage from each of Bone Spear and Bone Spirit (was +8%)
- The Paladin's Sacrifice attacks every 0.6 seconds, as fast as a normal attack (was once a second at level 8)
- The Sorceress's Fire Bolt gets +160% damage from each of Fire Ball and Meteor (was +8%)
- +12 skills from items make the finishing blow of Claws of Thunder and Blades of Ice 2 to 3 times stronger
- The Druid's wolves, Grizzly, ravens and vines gain 1% damage per point of Energy, like the Druid's spells
- The Sorceress's Hydra recharges in 1.6 seconds at level 8 (was 4.2)
- Each of the Sorceress's Hydras lasts 10 seconds at every level, so up to six can be out at once
- The Sorceress's Frozen Orb shards fly nearly twice as far
- The Necromancer's golems hit 1.4 to 1.8 times harder in Hell and Terror
- The Necromancer's Corpse Explosion deals 70% to 120% of the corpse's life (was 36 + 46%)
- The Necromancer's Corpse Explosion reaches 2.5 times farther
- The Necromancer's Corpse Explosion deals less from corpses of monsters above your hero's level
- The Sorceress's Energy Shield still uses at most 400 mana per hit
- The Paladin's Might gives +230% damage at level 5 (was +115%)
- The Paladin's Fanaticism gives +373% damage at level 5 (was +187%)
- The Paladin's Concentration gives +345% damage at level 5 (was +173%)
- The Paladin's Zeal deals 44 damage at level 8 (was 29)
- The Paladin's Zeal hits 4 times at level 1 and 5 times from level 2 (was 2, rising to 6)
- The Paladin's Zeal gets +15% damage per level of Sacrifice (was +6%)
- The Paladin's Charge deals 152 damage at level 8 (was 83)
- The Paladin's Herald of Zakarum deals 110 damage (was 60)
- The Paladin's Holy Bolt gets +500% from Fist of the Heavens and +63% per level of Blessed Hammer (was +25%)
- The Paladin's Vengeance adds 41 fire, 41 cold and 41 lightning damage at level 8 (was 29 each)
- The Necromancer's revived monsters have their full life and damage again (was half)
- The Assassin's Fists of Fire, Claws of Thunder and Blades of Ice hit 1.5 times harder, like Phoenix Strike
- The Assassin's Shadow Warrior and Shadow Master gain 1% damage per point of Energy, like the Assassin's spells
- Each point of the Necromancer's Energy adds 1.5% spell damage (was 1%)
- Each point of Energy still adds 1% spell damage for every other class
- The Assassin's traps now fire all their shots, instead of a new trap often replacing one that had barely fired
- Laying Death Sentry no longer removes the Assassin's Lightning Sentries
- The Necromancer's Poison Nova reaches a third farther
- Monsters immune to chill and freeze in Diablo II, like Hell's wraiths, are immune here too once you extract the Monsters part again
- Chill slows monsters by half on Normal and by a third or a quarter in Hell, as in Diablo II
- Spirit of Barbs from item charges, like Wisp Projector's, returns 110% of melee damage to the attacker only
- The Necromancer's Iron Maiden no longer gets stronger from Energy or magic damage on gear

重點：女武神 1 級全抗 +6%、8 級 +40%；屍體爆炸為屍體生命的 70%–120%；多職業移除 Terror 固定傷害倍率並調整個別技能；防禦改為影響怪物命中率。

## LADDER 未出現的技能與被動

依 ID 比對；進化技能獨立列出。未出現不代表技能無效。

- **亞馬遜**：技能 powerStrike（Power Strike）、poisonJavelin（Poison Javelin）；被動 無。
- **女巫**：技能 iceBolt（Ice Bolt）、shiverArmor（Shiver Armor）；被動 無。
- **死靈法師**：技能 dimVision（Dim Vision）、raiseSkeleton（Raise Skeleton）、clayGolem（Clay Golem）、ironGolem（Iron Golem）；被動 無。
- **刺客**：技能 fireTrauma（Fire Blast）、bladeSentinel（Blade Sentinel）、shadowWarrior（Shadow Warrior）；被動 無。
- **野蠻人**：技能 bash（Bash）、leap（Leap）、howl（Howl）、shout（Shout）、warCry（War Cry）、leapAttack（Leap Attack）、battleOrders（Battle Orders）；被動 findPotion（Find Potion）。
- **聖騎士**：技能 holyBolt（Holy Bolt）、exile（Exile）；被動 thorns（Thorns）、defiance（Defiance）、prayer（Prayer）、cleansing（Cleansing）、meditation（Meditation）、sanctuary（Sanctuary）。
- **德魯伊**：技能 wearwolf（Werewolf）、wearbear（Werebear）、summonSpiritWolf（Summon Spirit Wolf）、maul（Maul）；被動 無。

## REACH 比對（候選，尚未完成驗證）

`autobot.js` 對表中沒有的技能預設 450；移動邏輯使用碰撞半徑之外的距離。遊戲 `M` 呼叫是否採相同基準，以及輔助函式、動態常數與變體，尚未逐一追蹤，因此以下不能直接認定為錯誤。

有直接數字索敵候選、但 REACH 未列：
- amazon／magicArrow：候選 450（預設 450，待驗證）
- amazon／fireArrow：候選 450（預設 450，待驗證）
- amazon／coldArrow：候選 450（預設 450，待驗證）
- amazon／explodingArrow：候選 450（預設 450，待驗證）
- amazon／multipleShot：候選 450（預設 450，待驗證）
- amazon／guidedArrow：候選 450（預設 450，待驗證）
- amazon／poisonJavelin：候選 450（預設 450，待驗證）
- amazon／lightningBolt：候選 450（預設 450，待驗證）
- amazon／iceArrow：候選 450（預設 450，待驗證）
- amazon／strafe：候選 450（預設 450，待驗證）
- amazon／plagueJavelin：候選 450（預設 450，待驗證）
- amazon／lightningFury：候選 450（預設 450，待驗證）
- amazon／freezingArrow：候選 450（預設 450，待驗證）
- amazon／immolationArrow：候選 450（預設 450，待驗證）
- amazon／seekerArrow：候選 450（預設 450，待驗證）
- sorceress／fireBolt：候選 450（預設 450，待驗證）
- sorceress／iceBolt：候選 450（預設 450，待驗證）
- sorceress／chargedBolt：候選 450（預設 450，待驗證）
- sorceress／lightning：候選 450（預設 450，待驗證）
- sorceress／iceBlast：候選 450（預設 450，待驗證）
- sorceress／fireBall：候選 450（預設 450，待驗證）
- sorceress／meteor：候選 450（預設 450，待驗證）
- sorceress／frozenOrb：候選 450（預設 450，待驗證）
- sorceress／chainLightning：候選 450（預設 450，待驗證）
- sorceress／thunderStorm：候選 450（預設 450，待驗證）
- sorceress／fireWall：候選 450（預設 450，待驗證）
- sorceress／glacialSpike：候選 450（預設 450，待驗證）
- sorceress／blizzard：候選 450（預設 450，待驗證）
- necromancer／teeth：候選 450（預設 450，待驗證）
- necromancer／boneSpear：候選 450（預設 450，待驗證）
- necromancer／boneSpirit：候選 450（預設 450，待驗證）
- necromancer／poisonExplosion：候選 450（預設 450，待驗證）
- assassin／fireTrauma：候選 450（預設 450，待驗證）
- assassin／psychicHammer：候選 450（預設 450，待驗證）
- barbarian／whirlingAxes：候選 450（預設 450，待驗證）
- paladin／holyBolt：候選 450（預設 450，待驗證）
- paladin／fistOfTheHeavens：候選 450（預設 450，待驗證）
- druid／arcticBlast：候選 170（預設 450，待驗證）
- druid／eruption：候選 450（預設 450，待驗證）
- druid／twister：候選 450（預設 450，待驗證）
- druid／moltenBoulder：候選 450（預設 450，待驗證）
- druid／volcano：候選 450（預設 450，待驗證）
- druid／armageddon：候選 360（預設 450，待驗證）
- druid／tornado：候選 450（預設 450，待驗證）
- druid／hurricane：候選 360（預設 450，待驗證）

表列數值與直接索敵候選不同：
- 未找到可直接比較的項目。

表內尚未取得直接索敵候選：amazon/jab=58、amazon/powerStrike=58、amazon/impale=58、amazon/fend=84、amazon/chargedStrike=58、amazon/lightningStrike=58、assassin/tigerStrike=46、assassin/cobraStrike=46、assassin/fistsOfFire=46、assassin/dragonTalon=90、assassin/royalStrike=128、assassin/clawsOfThunder=46、assassin/bladesOfIce=46、assassin/dragonClaw=46、assassin/dragonTail=46、barbarian/doubleSwing=48、barbarian/bash=54、barbarian/stun=54、barbarian/leap=0、barbarian/whirlwind=200、barbarian/howl=100、barbarian/taunt=0、barbarian/shout=0、barbarian/battleCry=100、barbarian/warCry=100、barbarian/grimWard=0、barbarian/frenzy=66、barbarian/concentrate=58、barbarian/berserk=58、barbarian/battleOrders=0、barbarian/battleCommand=0、paladin/zeal=46、paladin/charge=90、paladin/holyShield=0、paladin/smite=54、paladin/sacrifice=54、paladin/vengeance=54、paladin/conversion=220。

## 未上榜項目的預設權重建議

- 起始值可採 0.5；直接傷害依範圍、頻率、單體傷害與傷害類型調整。
- 對主力技能有強協同、進化所需的被動及基礎技能可加權；僅在已選擇相關技能時增加，避免雙重計分。
- 生存、控制、抗性、召喚及詛咒依實際效益和已有配置調整；缺少實測資料時保持保守。

## 尚待完成

全部技能的實際射程、傷害各級數值、動態被動效果與再次習得選項尚未逐條解析；原始公式和候選距離僅供後續追查，不構成完整驗證。
