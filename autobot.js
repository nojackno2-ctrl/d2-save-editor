// D2 倖存者遊戲輔助工具。只控制原版輸入與流程，不改角色數值或任務旗標。
// 靜態對照（2026-10-31）：Game-C88Jt16A.js、itemArt-Bh8qPZQJ.js、saveTransfer-BNubg1tX.js。
(() => {
  "use strict";
  window.__d2autobot?.destroy();
  const KEY = "d2autobot:settings";
  const defaults = {
    version: 3, enabled: false, progressEnabled: false,
    potion: { autoHp: true, hpThreshold: 50, lethalProtection: true, lethalLookaheadSec: 0.3, hpCooldownMs: 1200, autoMp: false, mpThreshold: 30, mpCooldownMs: 2000, fallbackHpSlot: 1, fallbackMpSlot: 2 },
    movement: { enabled: true, combatStyle: "auto", chaseFirst: true, attackRange: 320, kiteDistance: 220, dodgeProjectiles: true, projectileSafetyRadius: 45, smoothingFactor: 0.6 },
    loot: { enabled: true, searchRadius: 450, pickupGold: true, minRuneTier: 1, qualityThreshold: { normal: true, magic: true, rare: true, set: true, unique: true, runeword: true }, backtrackForLoot: true, kickJars: true, onlyUpgrades: true },
    terror: { mode: "off", targetFarmTier: 1, autoReviveOrRestart: false, postClearWaitSec: 3 },
    quest: { autoProgress: false, prioritizeBoss: true, autoStart: true, farmDifficulty: "off" },
    gear: { autoEquip: true, minGainPercent: 2 },
    // 陣亡回營地後的整備：收藏、倉庫、賣裝、買藥、恰西升級，讓每一局都比上一局強。
    town: { enabled: true, collect: true, stash: true, sellJunk: true, buyPotions: true, potionCount: 4, charsiUpgrades: true, buyGear: true },
    build: { ladder: true, autoStats: true, redraft: true },
    deathProtection: { enabled: false, emergencyHpPercent: 15, disableAutomation: true },
  };
  // 由 d2survivors.lol 排行榜 API 產生（地獄榜各職業前 50 名）：技能／被動 [id, 名稱, 權重]、常用變體、配點比例、各欄常用暗金套裝。
  const LADDER = {"source":"d2survivors.lol/api/leaderboard（地獄榜各職業前 50 名）","generatedAt":"2026-11-01","classes":{"amazon":{"skills":[["fireArrow","Fire Arrow",1.64],["explodingArrow","Exploding Arrow",1.44],["magicArrow","Magic Arrow",1.28],["guidedArrow","Guided Arrow",1.28],["multipleShot","Multiple Shot",1.16],["seekerArrow","Widowmaker",1.13],["strafe","Strafe",1.1],["immolationArrow","Immolation Arrow",1.06],["freezingArrow","Freezing Arrow",0.97],["iceArrow","Ice Arrow",0.92],["coldArrow","Cold Arrow",0.88],["valkyrie","Valkyrie",0.84],["lightningFury","Lightning Fury",0.65],["lightningStrike","Lightning Strike",0.25],["lightningBolt","Lightning Bolt",0.24],["chargedStrike","Charged Strike",0.09]],"mods":{"immolationArrow":"pyre","freezingArrow":"focused","seekerArrow":"blackArrow","lightningFury":"chain","fireArrow":"kindle","explodingArrow":"focused","strafe":"bullseye","magicArrow":"ricochet","iceArrow":"deepFreeze","coldArrow":"split","multipleShot":"narrow","guidedArrow":"bounty","lightningBolt":"thunderbolt","lightningStrike":"grounding","chargedStrike":"grounded","powerStrike":"overcharge","valkyrie":"shieldmaidens","fend":"onslaught","jab":"heavy","plagueJavelin":"lingering"},"passives":[["pierce","Pierce",2],["criticalStrike","Critical Strike",1.96],["dodge","Dodge",1.92],["dopplezon","Decoy",1.92],["innerSight","Inner Sight",1.88],["penetrate","Penetrate",1.84],["slowMissiles","Slow Missiles",1.76],["avoid","Avoid",1.72],["fcr","Faster Cast Rate",1.52],["evade","Evade",1.44],["frw","Faster Run/Walk",0.8],["vitality","Vitality",0.56],["telekinesis","Telekinesis",0.42],["replenish","Replenish Life",0.16]],"attributes":{"strength":0.02,"dexterity":0.66,"vitality":0.3,"energy":0.02},"gear":{"weapon":["Lycander's Aim","Blood Raven's Charge","Windforce"],"body":["Skin of the Vipermagi","Arkaine's Valor","Tyrael's Might"],"belt":["Arachnid Mesh","Thundergod's Vigor","Goldwrap"],"boots":["Gore Rider","Goblin Toe","War Traveler"],"amulet":["Mara's Kaleidoscope","Highlord's Wrath","Atma's Scarab"],"ring1":["Bul-Kathos' Wedding Band","Wisp Projector","Raven Frost"],"ring2":["Bul-Kathos' Wedding Band","Raven Frost","Wisp Projector"],"head":["Harlequin Crest","Guillaume's Face","Andariel's Visage"],"gloves":["Steelrend","Dracul's Grasp","Laying of Hands"],"shield":["Spirit Ward","Tiamat's Rebuke","Umbral Disk"]}},"assassin":{"skills":[["cobraStrike","Cobra Strike",1.88],["cloakOfShadows","Cloak of Shadows",1.76],["royalStrike","Phoenix Strike",1.13],["dragonFlight","Dragon Flight",1.1],["bladesOfIce","Blades of Ice",1.1],["tigerStrike","Tiger Strike",1.08],["clawsOfThunder","Claws of Thunder",0.88],["dragonTail","Dragon Tail",0.83],["fistsOfFire","Fists of Fire",0.68],["dragonClaw","Dragon Claw",0.63],["shadowMaster","Shadow Master",0.59],["bladeShield","Blade Shield",0.52],["dragonTalon","Dragon Talon",0.51],["deathSentry","Death Sentry",0.38],["mindBlast","Mind Blast",0.32],["infernoSentry","Wake of Inferno",0.16]],"mods":{"dragonFlight":"hunter","dragonTail":"focusedTail","cloakOfShadows":"mark","bladesOfIce":"deepCold","cobraStrike":"fang","clawsOfThunder":"thunderclap","dragonClaw":"slayer","tigerStrike":"patience","dragonTalon":"crack","bladeShield":"hunt","royalStrike":"tempest","shadowMaster":"stalker","mindBlast":"focus","deathSentry":"overcharge","fistsOfFire":"sear","bladeFury":"bullseye","infernoSentry":"brazier","lightningSentry":"hunter","psychicHammer":"maul"},"passives":[["weaponBlock","Weapon Block",2],["clawMastery","Claw Mastery",2],["fade","Fade",2],["frw","Faster Run/Walk",2],["quickness","Burst of Speed",2],["venom","Venom",1.99],["fcr","Faster Cast Rate",1.99],["vitality","Vitality",1.96],["replenish","Replenish Life",1.79],["telekinesis","Telekinesis",1.41]],"attributes":{"strength":0.38,"dexterity":0.16,"vitality":0.29,"energy":0.15},"gear":{"weapon":["Firelizard's Talons","Bartuc's Cut-Throat","Jade Talon"],"head":["Harlequin Crest","Andariel's Visage","Natalya's Totem"],"body":["Arkaine's Valor","Skin of the Vipermagi","Skullder's Ire"],"gloves":["Laying of Hands","Dracul's Grasp","Hellmouth"],"belt":["Arachnid Mesh","Wilhelm's Pride","Nosferatu's Coil"],"boots":["Gore Rider","Goblin Toe","Shadow Dancer"],"amulet":["Mara's Kaleidoscope","Highlord's Wrath","Seraph's Hymn"],"ring1":["Bul-Kathos' Wedding Band","The Stone of Jordan","Raven Frost"],"ring2":["Wisp Projector","The Stone of Jordan","Bul-Kathos' Wedding Band"],"shield":["Jade Talon","Bartuc's Cut-Throat","Natalya's Mark"]}},"barbarian":{"skills":[["battleCry","Battle Cry",1.84],["doubleSwing","Double Swing",1.6],["doubleThrow","Double Throw",1.48],["whirlwind","Whirlwind",1.32],["frenzy","Frenzy",1.13],["warCry","War Cry",1.11],["stun","Stun",1.08],["taunt","Taunt",1],["battleCommand","Battle Command",0.99],["whirlingAxes","Lacerator",0.95],["grimWard","Grim Ward",0.84],["berserk","Berserk",0.81],["concentrate","Concentrate",0.56],["bash","Bash",0.56],["leapAttack","Leap Attack",0.38],["leap","Leap",0.2]],"mods":{"berserk":"gore","concentrate":"crush","whirlwind":"blazingPath","frenzy":"flameEdge","battleCry":"contagion","grimWard":"lure","whirlingAxes":"stormAxes","doubleThrow":"venom","doubleSwing":"stormEdge","leapAttack":"hammerfall","battleCommand":"warBanner","warCry":"bellow","taunt":"rabble","leap":"gather","stun":"crack","battleOrders":"bloodlust","bash":"pin","howl":"cower"},"passives":[["increasedSpeed","Increased Speed",2],["ironSkin","Iron Skin",1.96],["increasedStamina","Increased Stamina",1.92],["vitality","Vitality",1.91],["naturalResistance","Natural Resistance",1.88],["findItem","Find Item",1.8],["throwingMastery","Throwing Mastery",1.68],["fcr","Faster Cast Rate",1.48],["axeMastery","Axe Mastery",1.4],["frw","Faster Run/Walk",1.04],["swordMastery","Sword Mastery",0.96],["telekinesis","Telekinesis",0.45],["maceMastery","Mace Mastery",0.36],["poleArmMastery","Pole Arm Mastery",0.28]],"attributes":{"strength":0.66,"dexterity":0.02,"vitality":0.32,"energy":0},"gear":{"head":["Arreat's Face","Immortal King's Will","Harlequin Crest"],"gloves":["Dracul's Grasp","Immortal King's Forge","Steelrend"],"belt":["Arachnid Mesh","Immortal King's Detail","Nosferatu's Coil"],"boots":["Gore Rider","Immortal King's Pillar","Goblin Toe"],"amulet":["Mara's Kaleidoscope","Highlord's Wrath","Atma's Scarab"],"ring1":["Bul-Kathos' Wedding Band","Wisp Projector","Nature's Peace"],"ring2":["Wisp Projector","Bul-Kathos' Wedding Band","Raven Frost"],"weapon":["Immortal King's Stone Crusher","Djinn Slayer","The Grandfather"],"shield":["Stormshield","Death Cleaver","Azurewrath"],"body":["Arkaine's Valor","Immortal King's Soul Cage","Tyrael's Might"]}},"druid":{"skills":[["arcticBlast","Arctic Blast",1.2],["twister","Twister",1.17],["fury","Fury",1.06],["spiritOfBarbs","Spirit of Barbs",0.9],["volcano","Volcano",0.88],["hurricane","Hurricane",0.86],["shockWave","Shock Wave",0.86],["vines","Solar Creeper",0.81],["armageddon","Armageddon",0.79],["summonGrizzly","Summon Grizzly",0.79],["eruption","Fissure",0.78],["tornado","Tornado",0.72],["moltenBoulder","Molten Boulder",0.7],["firestorm","Firestorm",0.67],["plaguePoppy","Poison Creeper",0.2],["oakSage","Oak Sage",0.16]],"mods":{"fury":"lacerate","hurricane":"eyeWall","shockWave":"earthquake","armageddon":"wrath","tornado":"maelstrom","summonGrizzly":"wildPack","twister":"vortex","volcano":"lavaBombs","moltenBoulder":"magmaCore","firestorm":"wildfire","eruption":"rift","arcticBlast":"iceLance","spiritOfBarbs":"thornNova","vines":"sunburst","plaguePoppy":"thicket","heartOfWolverine":"huntersHeart"},"passives":[["shapeShifting","Lycanthropy",1.92],["feralRage","Feral Rage",1.92],["cycloneArmor","Cyclone Armor",1.84],["fcr","Faster Cast Rate",1.84],["spiritKeeper","Spirit Keeper",1.84],["vitality","Vitality",1.71],["replenish","Replenish Life",1.68],["frw","Faster Run/Walk",1.56],["fireClaws","Fire Claws",1.52],["ravenlore","Ravenlore",1.52],["hunger","Hunger",1.44],["rabies","Rabies",0.92],["telekinesis","Telekinesis",0.22]],"attributes":{"strength":0.57,"dexterity":0.03,"vitality":0.25,"energy":0.14},"gear":{"head":["Jalal's Mane","Cerebus' Bite","Harlequin Crest"],"gloves":["Steelrend","Dracul's Grasp","Soul Drainer"],"belt":["Arachnid Mesh","String of Ears","Nightsmoke"],"boots":["Gore Rider","War Traveler","Goblin Toe"],"amulet":["Mara's Kaleidoscope","Atma's Scarab","Highlord's Wrath"],"ring1":["Bul-Kathos' Wedding Band","Raven Frost","Carrion Wind"],"ring2":["Bul-Kathos' Wedding Band","Raven Frost","Carrion Wind"],"weapon":["Stone Crusher","Windhammer","Stormlash"],"shield":["Spirit Ward","Lidless Wall","Stormshield"],"body":["Arkaine's Valor","Skin of the Vipermagi","Aldur's Deception"]}},"necromancer":{"skills":[["corpseExplosion","Corpse Explosion",1.88],["raiseSkeletalMage","Raise Skeletal Mage",1.64],["lifeTap","Life Tap",1.39],["bonePrison","Bone Prison",1.15],["teeth","Teeth",1.12],["boneSpirit","Bone Spirit",1.06],["revive","Revive",1.06],["decrepify","Decrepify",1.03],["boneSpear","Bone Spear",0.95],["attract","Attract",0.86],["ironMaiden","Iron Maiden",0.67],["fireGolem","Fire Golem",0.65],["poisonNova","Poison Nova",0.41],["weaken","Weaken",0.32],["bloodGolem","Blood Golem",0.25],["poisonDagger","Poison Dagger",0.16]],"mods":{"boneSpirit":"reaper","raiseSkeletalMage":"legion","revive":"legion","corpseExplosion":"chain","attract":"sacrifice","fireGolem":"inferno","decrepify":"contagion","teeth":"clench","poisonNova":"plagueWave","poisonExplosion":"vileBurst","poisonDagger":"thrown","boneSpear":"impaler","lifeTap":"feast","weaken":"contagion","bonePrison":"crushing","bloodGolem":"bloodbond","ironMaiden":"spite","terror":"cower","amplifyDamage":"contagion"},"passives":[["boneArmor","Bone Armor",2],["fcr","Faster Cast Rate",2],["lowerResist","Lower Resist",2],["vitality","Vitality",1.96],["skeletonMastery","Skeleton Mastery",1.96],["frw","Faster Run/Walk",1.91],["boneWall","Bone Wall",1.88],["golemMastery","Golem Mastery",1.64],["summonResist","Summon Resist",1.56],["telekinesis","Telekinesis",1.44],["replenish","Replenish Life",1.04]],"attributes":{"strength":0,"dexterity":0,"vitality":0.2,"energy":0.8},"gear":{"weapon":["Boneshade","Death's Web","Arm of King Leoric"],"shield":["Homunculus","Boneflame","Trang-Oul's Wing"],"head":["Harlequin Crest","Trang-Oul's Guise","Andariel's Visage"],"body":["Skin of the Vipermagi","Trang-Oul's Scales","Que-Hegan's Wisdom"],"belt":["Arachnid Mesh","Trang-Oul's Girth","String of Ears"],"boots":["Marrowwalk","War Traveler","Tearhaunch"],"ring2":["Wisp Projector","Bul-Kathos' Wedding Band","The Stone of Jordan"],"gloves":["Trang-Oul's Claws","Soul Drainer","Magefist"],"amulet":["Mara's Kaleidoscope","The Eye of Etlich"],"ring1":["Bul-Kathos' Wedding Band","The Stone of Jordan","Wisp Projector"]}},"paladin":{"skills":[["zeal","Zeal",1.52],["charge","Charge",1.44],["smite","Smite",1.16],["holyCharge","Herald of Zakarum",1.13],["almaNegra","Alma Negra",1.1],["fanaticZeal","Passion",1.08],["holyShield","Holy Shield",0.96],["conversion","Conversion",0.9],["blessedHammer","Blessed Hammer",0.88],["sacrifice","Sacrifice",0.84],["rusthandle","Rusthandle",0.83],["hammerOfZakarum","Zakarum's Hand",0.72],["vengeance","Vengeance",0.6],["exile","Exile",0.54],["fistOfTheHeavens","Fist of the Heavens",0.54],["bloodrise","Bloodrise",0.43]],"mods":{"charge":"arrival","fanaticZeal":"fervor","almaNegra":"wideWave","rusthandle":"cascade","holyCharge":"lance","conversion":"fealty","zeal":"holyEdge","hammerOfZakarum":"tightOrbit","blessedHammer":"return","fistOfTheHeavens":"judgement","vengeance":"attuned","holyShield":"retribution","smite":"pin","exile":"retribution","bloodrise":"whirl","sacrifice":"bloodletting","holyBolt":"ricochet"},"passives":[["vigor","Vigor",2],["fanaticism","Fanaticism",1.96],["might","Might",1.92],["concentration","Concentration",1.84],["holyShock","Holy Shock",1.76],["conviction","Conviction",1.72],["salvation","Salvation",1.08],["resistFire","Resist Fire",0.96],["defiance","Defiance",0.96],["resistLightning","Resist Lightning",0.92],["redemption","Redemption",0.88],["holyFire","Holy Fire",0.76],["resistCold","Resist Cold",0.76],["blessedAim","Blessed Aim",0.68]],"attributes":{"strength":0.27,"dexterity":0.1,"vitality":0.55,"energy":0.05},"gear":{"weapon":["Heaven's Light","The Redeemer","Astreon's Iron Ward"],"head":["Harlequin Crest","Andariel's Visage","Tal Rasha's Horadric Crest"],"body":["Arkaine's Valor","Guardian Angel","Que-Hegan's Wisdom"],"gloves":["Dracul's Grasp","Soul Drainer","Chance Guards"],"belt":["Arachnid Mesh","Nosferatu's Coil","String of Ears"],"boots":["Gore Rider","War Traveler","Marrowwalk"],"amulet":["Mara's Kaleidoscope","Highlord's Wrath","Seraph's Hymn"],"ring1":["Bul-Kathos' Wedding Band","Wisp Projector","Raven Frost"],"ring2":["Wisp Projector","Bul-Kathos' Wedding Band","Carrion Wind"],"shield":["Herald of Zakarum","Steelclash","Griswold's Honor"]}},"sorceress":{"skills":[["staticField","Static Field",1.84],["lightning","Lightning",1.84],["chainLightning","Chain Lightning",1.1],["teleport","Teleport",1.04],["meteor","Meteor",0.97],["hydra","Hydra",0.96],["frozenOrb","Frozen Orb",0.9],["thunderStorm","Thunder Storm",0.88],["blizzard","Blizzard",0.81],["frostNova","Frost Nova",0.8],["chargedBolt","Charged Bolt",0.64],["chillingArmor","Chilling Armor",0.61],["nova","Nova",0.56],["fireBall","Fire Ball",0.38],["fireWall","Fire Wall",0.38],["glacialSpike","Glacial Spike",0.34]],"mods":{"chainLightning":"tether","frozenOrb":"shatter","meteor":"shower","blizzard":"hailstorm","staticField":"bane","fireBall":"cluster","fireBolt":"split","lightning":"thunderbolt","glacialSpike":"icicle","frostNova":"deepFreeze","thunderStorm":"wrath","nova":"coldSnap","teleport":"rideTheBolt","chillingArmor":"duel","fireWall":"crossfire","hydra":"champion","chargedBolt":"split","iceBolt":"frostLance","shiverArmor":"duel","iceBlast":"ricochet","blaze":"frostTrail"},"passives":[["warmth","Warmth",2],["energyShield","Energy Shield",2],["lightningMastery","Lightning Mastery",2],["fcr","Faster Cast Rate",1.96],["frw","Faster Run/Walk",1.84],["enchant","Enchant",1.84],["coldMastery","Cold Mastery",1.84],["replenish","Replenish Life",1.84],["vitality","Vitality",1.84],["fireMastery","Fire Mastery",1.84],["telekinesis","Telekinesis",0.77]],"attributes":{"strength":0,"dexterity":0,"vitality":0.06,"energy":0.94},"gear":{"weapon":["Mang Song's Lesson","The Oculus","Eschuta's Temper"],"shield":["Lidless Wall","Spirit Ward","Stormshield"],"head":["Harlequin Crest","Griffon's Eye","Nightwing's Veil"],"body":["Skin of the Vipermagi","Tal Rasha's Guardianship","Arkaine's Valor"],"gloves":["Magefist","Frostburn","Trang-Oul's Claws"],"belt":["Arachnid Mesh","Tal Rasha's Fine-Spun Cloth","Trang-Oul's Girth"],"boots":["War Traveler","Marrowwalk","Aldur's Advance"],"amulet":["Mara's Kaleidoscope","Tal Rasha's Adjudication","Seraph's Hymn"],"ring1":["The Stone of Jordan","Bul-Kathos' Wedding Band","Wisp Projector"],"ring2":["The Stone of Jordan","Bul-Kathos' Wedding Band","Wisp Projector"]}}}};
  // 僅接受已知欄位與型別，不接收原型屬性或任意指令。
  function merge(base, value) {
    return Object.fromEntries(Object.entries(base).map(([k, v]) => [k, v && typeof v === "object" ? merge(v, value?.[k]) : typeof value?.[k] === typeof v ? value[k] : v]));
  }
  let settings = merge(defaults, {}), storageNote = "";
  // 兩個分頁各有總開關：戰鬥輔助（enabled）、推層與任務（progressEnabled）。
  const questOn = () => settings.progressEnabled && settings.quest.autoProgress;
  const terrorMode = () => settings.progressEnabled ? settings.terror.mode : "off";
  const assistOn = () => settings.enabled;
  try {
    const stored = JSON.parse(localStorage.getItem(KEY) || "{}");
    settings = merge(defaults, stored);
    // 版本 3 起預設撿取所有品質；舊設定只補開普通與魔法，不覆蓋其他選擇。
    if ((stored.version || 0) < 3) { settings.loot.qualityThreshold.normal = true; settings.loot.qualityThreshold.magic = true; }
  }
  catch { storageNote = "設定無法讀取，使用預設值"; }
  const bounds = {
    "deathProtection.emergencyHpPercent": [1, 90],
    "potion.hpThreshold": [10, 90], "potion.mpThreshold": [10, 80], "potion.lethalLookaheadSec": [0.1, 1],
    "potion.hpCooldownMs": [500, 5000], "potion.mpCooldownMs": [1000, 5000], "potion.fallbackHpSlot": [1, 4], "potion.fallbackMpSlot": [1, 4],
    "movement.kiteDistance": [40, 500], "movement.attackRange": [100, 800], "movement.projectileSafetyRadius": [20, 100], "movement.smoothingFactor": [0.1, 1],
    "loot.searchRadius": [50, 1200], "loot.minRuneTier": [1, 33], "terror.targetFarmTier": [1, 9999], "terror.postClearWaitSec": [1, 15], "gear.minGainPercent": [0, 50], "town.potionCount": [0, 16],
  };
  // 推層與重刷共用既有 mode，兩個開關互斥，舊設定無須人工轉換。
  const get = (path) => path === "terror.progressEnabled" ? settings.terror.mode === "progress" : path === "terror.farmEnabled" ? settings.terror.mode === "farm" : path.split(".").reduce((o, k) => o[k], settings);
  function put(path, value) {
    if (["terror.progressEnabled", "terror.farmEnabled"].includes(path)) {
      const mode = path === "terror.progressEnabled" ? "progress" : "farm";
      if (value) settings.terror.mode = mode;
      else if (settings.terror.mode === mode) settings.terror.mode = "off";
      return;
    }
    const keys = path.split("."), last = keys.pop(); keys.reduce((o, k) => o[k], settings)[last] = value;
  }
  function normalize() {
    for (const [path, [min, max]] of Object.entries(bounds)) {
      const n = get(path), fallback = path.split(".").reduce((o, k) => o[k], defaults);
      put(path, Math.min(max, Math.max(min, Number.isFinite(n) ? n : fallback)));
    }
    for (const path of ["town.potionCount", "loot.minRuneTier", "terror.targetFarmTier", "potion.fallbackHpSlot", "potion.fallbackMpSlot"]) put(path, Math.round(get(path)));
    if (!["off", "progress", "farm"].includes(settings.terror.mode)) settings.terror.mode = "off";
    if (!["off", "normal", "nightmare", "hell"].includes(settings.quest.farmDifficulty)) settings.quest.farmDifficulty = "off";
    if (!["auto", "melee", "ranged"].includes(settings.movement.combatStyle)) settings.movement.combatStyle = "auto";
    settings.version = 3;
  }
  normalize();
  const abort = new AbortController(), restores = [], blockedLoot = new WeakMap();
  let alive = true, game = null, lastStep = -Infinity, lastHp = -Infinity, lastMp = -Infinity;
  let manualUntil = 0, lootTarget = null, lootSince = 0, ownWalk = null, ownReach = null;
  let smooth = { x: 0, y: 0 }, stuck = null, stuckCount = 0, clearAt = 0, clearWorld = null, transition = false;
  let errors = 0, lastAction = "待命", hookNote = "正在定位遊戲模組", hookUrl = "", actionAt = 0;
  let retreat = null, protectedWorld = null;
  const finite = Number.isFinite, point = (p) => p && finite(p.x) && finite(p.y);
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y), live = (e) => point(e) && !e.dead;
  const unit = (x, y) => { const n = Math.hypot(x, y); return n > 0.001 ? { x: x / n, y: y / n } : { x: 0, y: 0 }; };
  function visible(el) { return !!el && !el.classList.contains("hidden") && getComputedStyle(el).display !== "none" && getComputedStyle(el).visibility !== "hidden"; }
  // 新版暫停選單可能繪於 Canvas；已取得實例時以 Game.state 為準。
  const paused = () => game ? game.state === "paused" : visible(document.getElementById("paused")) || document.body.classList.contains("frontend-over-run");
  function release() {
    if (game?.walkTarget === ownWalk) game.walkTarget = null;
    if (ownReach && game?.world?.reaching === ownReach) game.world.reaching = null;
    ownWalk = ownReach = lootTarget = stuck = null; stuckCount = 0;
    smooth = { x: 0, y: 0 };
  }
  function save() {
    normalize();
    try { localStorage.setItem(KEY, JSON.stringify(settings)); storageNote = ""; }
    catch { storageNote = "設定無法儲存，本次仍有效"; }
    refreshControls();
  }
  function stop(reason = "輔助已停止") { settings.enabled = false; settings.progressEnabled = false; release(); lastAction = reason; save(); }
  function manual(e) {
    if (!e.isTrusted || host.contains(e.target) || e.target === launcher || e.target === stopButton) return;
    manualUntil = performance.now() + 1200;
    release();
  }
  function keyPulse(code, key) {
    const target = document.activeElement || document.body, init = { key, code, bubbles: true, cancelable: true, composed: true };
    target.dispatchEvent(new KeyboardEvent("keydown", init));
    target.dispatchEvent(new KeyboardEvent("keyup", init));
  }
  function hudPool(id) {
    const el = document.getElementById(id);
    if (!el) return null;
    const text = [el.textContent, el.getAttribute("aria-label"), el.title].filter(Boolean).join(" ").replace(/,/g, "");
    const m = text.match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/);
    return m && +m[2] > 0 ? { now: +m[1], max: +m[2] } : null;
  }
  function readState(g) {
    const w = g?.world, p = w?.player;
    if (point(p) && finite(p.life) && finite(p.maxLife) && p.maxLife > 0) return {
      w, p, hp: { now: p.life, max: p.maxLife }, mp: finite(w.mana?.mana) && w.mana.max > 0 ? { now: w.mana.mana, max: w.mana.max } : null,
      enemies: Array.isArray(w.enemies) ? w.enemies.filter((e) => live(e) && e.rank !== "breakable") : [], jars: Array.isArray(w.enemies) ? w.enemies.filter((e) => live(e) && e.rank === "breakable") : [], shots: Array.isArray(w.hostiles) ? w.hostiles.filter(live) : [], pickups: Array.isArray(w.pickups) ? w.pickups.filter(live) : [],
    };
    return { hp: hudPool("life-text"), mp: hudPool("mana-text"), enemies: [], jars: [], shots: [], pickups: [] };
  }
  // 已確認敵方飛彈在 hostiles；projectiles 主要是玩家技能，不計入威脅。
  // 傷害採保守估計，未重現全部抗性、格擋、護盾與附加傷害。
  function threats(s) {
    let damage = 0, dodgeX = 0, dodgeY = 0;
    if (!s.p) return { damage, dodgeX, dodgeY };
    const p = s.p, horizon = settings.potion.lethalLookaheadSec, taken = Math.max(1, finite(p.damageTaken) ? p.damageTaken : 1);
    for (const shot of s.shots) {
      const vx = shot.vx || 0, vy = shot.vy || 0, v2 = vx * vx + vy * vy, dx = p.x - shot.x, dy = p.y - shot.y;
      const time = v2 > 0 ? Math.max(0, Math.min(1, (dx * vx + dy * vy) / v2)) : 0;
      if (finite(shot.life) && time > shot.life) continue;
      const x = shot.x + vx * time, y = shot.y + vy * time, radius = (shot.radius || 0) + (p.radius || 12), near = Math.hypot(p.x - x, p.y - y);
      const hitRadius = radius + 10, dot = dx * vx + dy * vy;
      const discriminant = dot * dot - v2 * (dx * dx + dy * dy - hitRadius * hitRadius);
      const enter = v2 > 0 && dot >= 0 && discriminant >= 0 ? Math.max(0, (dot - Math.sqrt(discriminant)) / v2) : Math.hypot(dx, dy) <= hitRadius ? 0 : Infinity;
      if (enter <= horizon && (!finite(shot.life) || enter <= shot.life)) damage += (Math.max(0, shot.damage || 0) + Math.max(0, shot.effect?.damage || 0)) * taken * Math.max(1, p.missileTaken || 1);
      if (near > radius + settings.movement.projectileSafetyRadius || dx * vx + dy * vy < 0) continue;
      let away = unit(p.x - x, p.y - y);
      if (!away.x && !away.y) away = unit(-vy, vx);
      const force = 4 / Math.max(0.15, time + 0.15);
      dodgeX += away.x * force; dodgeY += away.y * force;
    }
    for (const e of s.enemies) if (dist(e, p) <= (e.radius || 12) + (p.radius || 12) + 45) damage += Math.max(0, e.damage || 0) * taken;
    return { damage, dodgeX, dodgeY };
  }
  function drink(s, mp, now, lethal = false) {
    const columns = s.w?.belt?.columns;
    if (s.w?.terror?.affixes?.includes("nobelt")) { lastAction = "本層禁止使用藥帶"; return false; }
    if (Array.isArray(columns) && typeof game?.drinkFrom === "function") {
      // 此版沒有獨立藍水；回復活力藥水會同時補生命與魔力。
      const kinds = mp ? ["rejuvenation"] : lethal ? ["rejuvenation", "healing", "potion"] : ["healing", "potion", "rejuvenation"];
      let slot = -1;
      for (const kind of kinds) { slot = columns.findIndex((c) => c?.[0] === kind); if (slot >= 0) break; }
      if (slot < 0) { lastAction = mp ? "藥帶沒有回復活力藥水可補魔力" : "藥帶沒有生命藥水"; return false; }
      const count = columns[slot].length, kind = columns[slot][0];
      game.drinkFrom(slot);
      if (columns[slot].length >= count) return false;
      if (kind === "rejuvenation") { lastHp = now; lastMp = now; }
    } else {
      const slot = mp ? settings.potion.fallbackMpSlot : settings.potion.fallbackHpSlot;
      keyPulse("Digit" + slot, String(slot));
    }
    if (mp) lastMp = now; else lastHp = now;
    lastAction = mp ? "已使用補魔力藥水" : lethal ? "預估致命傷害，已喝水" : "已喝生命藥水";
    return true;
  }
  function potions(s, danger, now) {
    let healingFailed = false;
    const p = settings.potion, lethal = p.lethalProtection && danger.damage >= s.hp?.now && danger.damage > 0;
    if (s.hp?.now > 0 && s.hp.now < s.hp.max && now - lastHp >= p.hpCooldownMs && (p.autoHp && s.hp.now / s.hp.max * 100 <= p.hpThreshold || lethal)) {
      if (drink(s, false, now, lethal)) return false;
      healingFailed = true;
    }
    if (p.autoMp && s.mp?.now < s.mp?.max && s.mp.now / s.mp.max * 100 <= p.mpThreshold && now - lastMp >= p.mpCooldownMs) drink(s, true, now);
    return healingFailed;
  }
  function healingAvailable(s, now) {
    if (s.hp?.now >= s.hp?.max || now - lastHp < settings.potion.hpCooldownMs || s.w?.terror?.affixes?.includes("nobelt")) return false;
    const columns = s.w?.belt?.columns;
    return typeof game?.drinkFrom === "function" && Array.isArray(columns) && columns.some((c) => ["potion", "healing", "rejuvenation"].includes(c?.[0]));
  }
  function surrounded(s, danger) {
    if (!s.p || danger.damage <= 0) return false;
    const p = s.p, radius = p.radius || 12;
    const near = s.enemies.filter((e) => dist(e, p) <= radius + (e.radius || 12) + 60);
    if (near.length < 3) return false;
    // 只取樣局部通道；不改座標，也不宣稱完成全圖路徑搜尋。
    const reach = Math.max(60, Math.min(120, (p.speed || 150) * 0.5));
    for (let i = 0; i < 16; i++) {
      const angle = i * Math.PI / 8, dx = Math.cos(angle) * reach / 16, dy = Math.sin(angle) * reach / 16;
      let x = p.x, y = p.y, clear = true;
      for (let j = 0; j < 16; j++) {
        const next = typeof s.w.walls?.slide === "function" ? s.w.walls.slide(x, y, dx, dy) : { x: x + dx, y: y + dy };
        if (!point(next) || Math.hypot(next.x - x, next.y - y) < Math.hypot(dx, dy) * 0.5 || near.some((e) => dist(next, e) < radius + (e.radius || 12) + 5)) { clear = false; break; }
        x = next.x; y = next.y;
      }
      if (clear) return false;
    }
    return true;
  }
  function deathReason(s, danger, now, healingFailed = false) {
    if (!assistOn() || !settings.deathProtection.enabled || !s.p || !s.hp || s.hp.now <= 0 || s.w === protectedWorld) return "";
    if (danger.damage > 0 && danger.damage >= s.hp.now && (healingFailed || !healingAvailable(s, now))) return "預估致命傷害且無可用回血藥水";
    if (s.hp.now / s.hp.max * 100 <= settings.deathProtection.emergencyHpPercent && now - lastHp < settings.potion.hpCooldownMs) return "生命低於緊急門檻且回血藥水冷卻中";
    // 實測：滿血被小怪貼身也會判定包圍而誤離場，須同時有實際危險（低血或預估傷害過半）。
    const risky = s.hp.now / s.hp.max <= 0.5 || danger.damage >= s.hp.now * 0.5;
    if (risky && surrounded(s, danger)) return "周圍通道皆受阻，預估無法閃避包圍";
    return "";
  }
  function retreatFailed(message) {
    const g = retreat?.g;
    retreat = null; stop("死亡保護離場未確認：" + message);
    try { if (g?.state === "playing") g.pause?.(); } catch { /* 保留停機狀態與錯誤訊息。 */ }
  }
  function checkRetreat(now) {
    if (!retreat) return;
    const g = retreat.g;
    if (["camp", "town", "select"].includes(g.state)) {
      lastAction = g.state === "select" ? "死亡保護：已離開本局至角色選單（此模式未進入村莊）" : "死亡保護：已離開戰鬥回到村莊";
      retreat = null;
    } else if (now >= retreat.deadline) retreatFailed("原版未在 8 秒內回到安全畫面，已停止自動化");
  }
  async function returnToSafety(g, s, reason, now) {
    if (retreat || !alive) return;
    protectedWorld = s.w;
    retreat = { g, deadline: now + 8000 };
    release();
    settings.terror.mode = "off"; settings.quest.autoProgress = false;
    if (settings.deathProtection.disableAutomation) { settings.enabled = false; settings.progressEnabled = false; }
    lastAction = "死亡保護：" + reason + "，正在離開本局"; save();
    try {
      // 原版已確認的暫停選單出口：leaveRun -> toMenu -> enterCamp（營地模式）。
      if (g.state === "playing" && typeof g.pause === "function") g.pause();
      if (g.state === "paused" && typeof g.leaveRun === "function") {
        await g.leaveRun();
      } else {
        // 相容舊版 DOM 選單；Canvas 選單無內部函式時無法可靠代按。
        if (g.state === "playing") keyPulse("Escape", "Escape");
        let clicked = false;
        for (let attempt = 0; attempt < 2 && alive && retreat; attempt++) {
          const menus = document.querySelectorAll("#paused,#pause-menu,[data-pause-menu]");
          const button = [...menus].filter(visible).flatMap((menu) => [...menu.querySelectorAll("button")]).find((el) => visible(el) && /^(?:SAVE AND EXIT(?: GAME)?|EXIT ANYWAY|LEAVE(?: RUN)?|RETURN TO TOWN|放棄(?:本局)?|離開(?:本局|戰鬥)?|回到村莊|儲存並離開)$/i.test(el.textContent.trim()));
          if (!button) break;
          button.click(); clicked = true;
          await new Promise((resolve) => setTimeout(resolve, 0));
          if (["camp", "town", "select", "loading"].includes(g.state)) break;
        }
        if (!clicked) throw new Error("找不到原版 leaveRun 或可辨識的暫停離開按鈕");
      }
      if (alive) checkRetreat(performance.now());
    } catch (err) { if (alive && retreat) retreatFailed(String(err.message || err)); }
  }

  // 實測（官方 wiki）：此遊戲沒有單獨符文物品，符文之語掉落即已完成，以 rarity=runeword 撿取並由自動穿裝評估。
  function accepts(drop) {
    const item = drop.item;
    // 原版寶箱是 kind=chest 的掉落物（碰到即收進待開寶箱），一律撿。
    if (drop.kind === "chest") return true;
    if (!item) return drop.kind === "gold" && settings.loot.pickupGold;
    if (item.type === "quest") return questOn();
    if (item.type === "rune") { const n = String(item.base).match(/^r(\d{2})$/); return !!n && +n[1] >= settings.loot.minRuneTier; }
    if (!settings.loot.qualityThreshold[item.rarity]) return false;
    // 撿起前就能讀到完整屬性：普通／魔法／稀有只追會讓角色變強的；暗金、套裝、符文之語、護符一律撿（收藏與倉庫）。
    if (!["normal", "magic", "rare"].includes(item.rarity) || isCharm(item) || !settings.loot.onlyUpgrades || !game?.world?.player || typeof game.heroNumbers !== "function") return true;
    return worth(item);
  }
  const worthCache = new WeakMap();
  function worth(item) {
    const now = performance.now(), hit = worthCache.get(item);
    if (hit && now - hit.at < 10000) return hit.ok;
    let ok = true;
    try { ok = !!bestGear(game, [item]); } catch { ok = true; }
    worthCache.set(item, { ok, at: now });
    return ok;
  }
  function lootGoal(s, now) {
    const lootOn = assistOn() && settings.loot.enabled;
    if (!lootOn && !questOn()) return null;
    if (lootTarget && !lootTarget.dead && now - lootSince > 3500) { blockedLoot.set(lootTarget, now + 15000); lootTarget = null; }
    const candidates = s.pickups.filter((e) => !e.flippy && !e.discarded && e.loot !== "sell" && (blockedLoot.get(e) || 0) < now && (lootOn || e.item?.type === "quest") && accepts(e) && dist(e, s.p) <= settings.loot.searchRadius);
    const weight = (e) => e.item?.type === "quest" ? 2000 : e.kind === "chest" ? 1500 : ["unique", "set", "runeword"].includes(e.item?.rarity) ? 1000 : e.item ? 500 : 50;
    candidates.sort((a, b) => weight(b) - weight(a) || dist(a, s.p) - dist(b, s.p));
    // 原版碰到罐子、木桶會自動踢破（可能掉藥水），走過去即可；不呼叫內部擊破函式。
    // 實測：最終王倒下（出現通關門／clearing）後不再踢罐；附近有敵人時也不為罐子冒險；藥帶滿了也不踢。
    const beltRoom = !Array.isArray(s.w.belt?.columns) || s.w.belt.columns.some((c) => (c?.length || 0) < 4);
    const calm = !s.enemies.some((e) => dist(e, s.p) < settings.movement.kiteDistance);
    if (lootOn && settings.loot.kickJars && beltRoom && calm && !game?.clearing && !point(game?.clearing?.portal)) candidates.push(...s.jars.filter((e) => (blockedLoot.get(e) || 0) < now && dist(e, s.p) <= settings.loot.searchRadius).sort((a, b) => dist(a, s.p) - dist(b, s.p)).slice(0, 1));
    const target = candidates[0];
    if (!target) { lootTarget = null; return null; }
    if (target.rank === "breakable") { if (lootTarget !== target) { lootTarget = target; lootSince = now; } return { x: target.x, y: target.y, kind: "kick", target }; }
    if (lootTarget !== target) { lootTarget = target; lootSince = now; }
    return { x: target.x, y: target.y, kind: "loot", target };
  }
  // 近戰／遠程：依排行榜該職業高手的力量配點比例判斷（≥25％ 為近戰：野蠻人、聖騎士、刺客、德魯伊）。
  const isMelee = () => settings.movement.combatStyle === "melee" || (settings.movement.combatStyle === "auto" && (ladderOf(game)?.attributes?.strength ?? 0) >= 0.25);
  const style = () => isMelee() ? { kite: Math.min(settings.movement.kiteDistance, 45), range: Math.min(settings.movement.attackRange, 90) } : { kite: settings.movement.kiteDistance, range: settings.movement.attackRange };
  function battleGoal(e, p, kind = "戰鬥") {
    const u = unit(p.x - e.x, p.y - e.y), distance = isMelee() ? (e.radius || 12) + (p.radius || 12) + 6 : settings.movement.kiteDistance;
    return { x: e.x + (u.x || 1) * distance, y: e.y + u.y * distance, kind };
  }
  function questGoal(s) {
    const g = game, search = g.search, cage = search?.gibbetSpot;
    // 由原版碰觸機制完成石陣、牢籠與對話；不呼叫 complete() 或更改任務紀錄。
    if (point(cage)) return { ...cage, kind: "任務牢籠" };
    const stones = search?.stones?.logic;
    if (Array.isArray(stones?.spots) && !stones.done) {
      const i = Array.isArray(stones.lit) ? stones.lit.findIndex((x) => !x) : -1;
      if (i >= 0 && point(stones.spots[i])) return { ...stones.spots[i], kind: "任務石陣" };
    }
    if (point(search?.portalSpot)) return { x: search.portalSpot.x, y: search.portalSpot.y, kind: "任務傳送門" };
    const tyrael = g.clearing?.tyrael;
    if (point(tyrael) && !tyrael.spoke) return { x: tyrael.x, y: tyrael.y, kind: "任務對話" };
    if (settings.quest.prioritizeBoss) {
      // 實測追任何有名字的怪會衝進怪堆被包圍；只追幕末魔王，其他精英由攻擊範圍拉回處理。
      const e = s.enemies.find((e) => e.rank === "actBoss");
      if (e) return battleGoal(e, s.p, "任務敵人");
    }
    return null;
  }
  // 實測：多敵貼近時排斥力互相抵銷，角色原地被圍死；改沿牆面滑動取樣 16 方向，選路徑上離敵最遠者。
  function escapeDirection(s) {
    const p = s.p, near = s.enemies.filter((e) => dist(e, p) < settings.movement.kiteDistance * 1.5);
    let best = null;
    for (let i = 0; i < 16; i++) {
      const a = i * Math.PI / 8, dx = Math.cos(a) * 15, dy = Math.sin(a) * 15;
      let x = p.x, y = p.y, worst = Infinity, moved = 0;
      for (let j = 0; j < 8; j++) {
        const next = typeof s.w.walls?.slide === "function" ? s.w.walls.slide(x, y, dx, dy) : { x: x + dx, y: y + dy };
        if (!point(next)) break;
        moved += Math.hypot(next.x - x, next.y - y); x = next.x; y = next.y;
        for (const e of near) worst = Math.min(worst, dist({ x, y }, e) - (e.radius || 12));
      }
      const score = (worst === Infinity ? 999 : worst) + moved * 0.25;
      if (!best || score > best.score) best = { score, worst, x: Math.cos(a), y: Math.sin(a) };
    }
    return best;
  }
  const isElite = (e) => ["actBoss", "boss", "champion"].includes(e.rank) || !!e.name;
  const power = (e) => Math.max(1, e.damage || 1) * Math.max(1, e.maxLife || e.life || 1) * (isElite(e) ? 3 : 1);
  function nearestElite(s) { return s.enemies.filter((e) => isElite(e) && dist(e, s.p) < 900).reduce((a, e) => !a || dist(e, s.p) < dist(a, s.p) ? e : a, null); }
  function navigate(s, danger, now) {
    const st = style(), g = game, m = { ...settings.movement, kiteDistance: st.kite, attackRange: st.range, enabled: assistOn() && settings.movement.enabled }, progressing = questOn() || terrorMode() !== "off", portal = g.clearing?.portal;
    if (point(portal) && clearWorld !== s.w) { clearWorld = s.w; clearAt = now; }
    let closeEnemy = false, x = 0, y = 0;
    if (m.enabled) for (const e of s.enemies) {
      const d = dist(s.p, e), range = m.kiteDistance + (e.radius || 0);
      if (d >= range) continue;
      closeEnemy = true;
      const u = unit(s.p.x - e.x, s.p.y - e.y), force = Math.min(8, (range - d) / Math.max(15, d));
      x += (u.x || (d < 1 ? 1 : 0)) * force; y += u.y * force;
    }
    let through = false;
    if (m.enabled && closeEnemy && s.enemies.filter((e) => dist(e, s.p) < m.kiteDistance).length >= 3) {
      const out = escapeDirection(s);
      // 實測很容易被包圍：每個方向都被堵時允許穿過怪群（原版會把貼身的怪推開），以遠離最強的怪為準。
      if (out && out.worst >= 20) { x = out.x * 8; y = out.y * 8; }
      else {
        const strong = s.enemies.filter((e) => dist(e, s.p) < m.kiteDistance * 1.5).reduce((a, e) => !a || power(e) > power(a) ? e : a, null);
        if (strong) { const away = unit(s.p.x - strong.x, s.p.y - strong.y); x = (away.x || 1) * 8; y = away.y * 8; through = true; }
      }
    }
    // 王與精英怪要留在攻擊範圍內：閃避時若離太遠就往回拉，不會越躲越遠。
    const elite = m.enabled ? nearestElite(s) : null;
    if (elite && dist(elite, s.p) > m.attackRange) { const back = unit(elite.x - s.p.x, elite.y - s.p.y); x += back.x * 6; y += back.y * 6; }
    const dodging = m.enabled && m.dodgeProjectiles && Math.hypot(danger.dodgeX, danger.dodgeY) > 0;
    if (dodging) { x += danger.dodgeX; y += danger.dodgeY; }
    // 王／精英掉的寶箱與暗金以上裝備還在附近時，最多等 20 秒撿完再走通關門。
    const treasure = s.pickups.some((e) => (e.kind === "chest" || ["unique", "set", "runeword"].includes(e.item?.rarity)) && (blockedLoot.get(e) || 0) < now && dist(e, s.p) <= settings.loot.searchRadius);
    const portalDue = progressing && point(portal) && (!settings.loot.backtrackForLoot || now - clearAt >= (treasure ? 20000 : settings.terror.postClearWaitSec * 1000));
    // 追目標優先：推進中且生命尚可時以目標前進，路上只閃飛彈，不因被怪包夾而越閃越遠。
    // 追目標只用於王／精英／任務／物品／通關門；一般小怪仍保持距離（實測一般怪也衝會被包圍而早死）。
    const ratio = s.hp.now / s.hp.max, chase = m.enabled && settings.movement.chaseFirst && ratio > 0.35;
    const free = chase || (!dodging && !closeEnemy);
    let goal = free && danger.damage < s.hp.now && !portalDue ? lootGoal(s, now) : null;
    if (!goal && questOn() && !portalDue) goal = questGoal(s);
    if (!goal && portalDue) goal = { x: portal.x, y: portal.y, kind: "通關傳送門" };
    if (!goal && progressing && !portal) {
      const enemy = nearestElite(s) || s.enemies.reduce((best, e) => !best || dist(e, s.p) < dist(best, s.p) ? e : best, null);
      if (enemy) goal = battleGoal(enemy, s.p, isElite(enemy) ? "精英" : "戰鬥");
      // 此遊戲不需探圖，敵人會自己湧來；沒有敵人時原地等待，不越跑越遠。
    }
    // 近戰要貼身才打得到，一般怪也直接追；遠程對一般怪保持距離。
    const chaseKind = goal && (isMelee() ? goal.kind !== "巡航" : !["戰鬥", "巡航"].includes(goal.kind)) && (goal.kind !== "kick" || !closeEnemy);
    const pursue = chase && chaseKind && dist(goal, s.p) > 5;
    if (pursue) {
      const u = unit(goal.x - s.p.x, goal.y - s.p.y), d = dodging ? unit(danger.dodgeX, danger.dodgeY) : { x: 0, y: 0 };
      x = u.x * 2 + d.x * 1.5; y = u.y * 2 + d.y * 1.5;
    } else if (goal && !dodging && !closeEnemy && dist(goal, s.p) > 5) { const u = unit(goal.x - s.p.x, goal.y - s.p.y); x += u.x; y += u.y; }
    let u = unit(x, y);
    if (!u.x && !u.y) { release(); return; }
    const mix = dodging ? 1 : m.smoothingFactor;
    u = unit(smooth.x * (1 - mix) + u.x * mix, smooth.y * (1 - mix) + u.y * mix); smooth = u;
    // 使用原版 walkTarget -> walls.route/slide，不直接改座標或穿牆。
    const direct = goal && !dodging && (pursue || !closeEnemy);
    const target = direct ? { x: goal.x, y: goal.y } : { x: s.p.x + u.x * 100, y: s.p.y + u.y * 100 };
    if (typeof s.w.walls?.nearestOpen === "function") Object.assign(target, s.w.walls.nearestOpen(target.x, target.y));
    if (!point(target)) { release(); return; }
    if (ownReach && s.w.reaching === ownReach) s.w.reaching = null;
    ownReach = goal?.kind === "loot" && direct ? goal.target : null;
    if (ownReach) s.w.reaching = ownReach;
    ownWalk = target; g.walkTarget = target;
    const label = goal?.kind === "loot" ? "拾取物品" : goal?.kind === "kick" ? "踢罐子" : goal?.kind || "安全位置";
    lastAction = through ? "被包圍無路可閃，穿過怪群遠離最強敵人" : pursue ? "朝目標前進：" + label + (dodging ? "（閃避飛彈）" : "") : dodging ? "閃避敵方飛彈" : closeEnemy ? "保持敵人距離" : "前往" + label;
    // 以遊戲內時間判斷卡住（畫面凍結不算）；為了完全自主運作，卡住只換方向繞路，不停機。
    const clock = finite(s.w.time) ? s.w.time * 1000 : now;
    if (!stuck || clock < stuck.at) stuck = { x: s.p.x, y: s.p.y, at: clock };
    if (clock - stuck.at >= 2500) {
      stuckCount = dist(stuck, s.p) < 20 ? stuckCount + 1 : 0;
      if (stuckCount) {
        if (lootTarget) blockedLoot.set(lootTarget, now + 15000);
        lootTarget = null;
        const turn = stuckCount >= 3 ? Math.random() * Math.PI * 2 : Math.PI / 2;
        const v = { x: u.x * Math.cos(turn) - u.y * Math.sin(turn), y: u.x * Math.sin(turn) + u.y * Math.cos(turn) };
        ownWalk = { x: s.p.x + v.x * (stuckCount >= 3 ? 240 : 120), y: s.p.y + v.y * (stuckCount >= 3 ? 240 : 120) }; g.walkTarget = ownWalk;
        lastAction = "卡住，換方向繞路";
      }
      stuck = { x: s.p.x, y: s.p.y, at: clock };
    }
  }
  async function advance(g) {
    if (transition || retreat || !alive || terrorMode() === "off") return;
    const t = settings.terror, record = g.save?.terror?.[g.kit?.id];
    if (!record || !g.kit || typeof g.startTerror !== "function") return;
    transition = true;
    try {
      if (t.mode === "farm") {
        if (t.targetFarmTier > (record.cleared ?? 0) || typeof g.startReplay !== "function") { stop("固定層數尚未通關，無法重刷"); return; }
        g.tierDone = null;
        lastAction = "重刷恐怖 " + t.targetFarmTier + " 層";
        await g.startReplay(g.kit, t.targetFarmTier);
      } else {
        if (!Array.isArray(record.offers) || !record.offers.length) return;
        const offer = record.offers.findIndex((e) => !e.affixes?.includes("nobelt"));
        g.tierDone = null;
        lastAction = "推進恐怖 " + record.open + " 層";
        await g.startTerror(g.kit, Math.max(0, offer));
      }
    } catch (err) { stop("切換關卡失敗：" + String(err.message || err)); }
    finally { transition = false; }
  }
  // 全新存檔沒有恐怖層紀錄：在營地沿用原版傳送點流程（續玩存檔或開新局）。
  let campSince = 0;
  const failStreak = {};
  function campStart(g, now) {
    if (g.state !== "camp") { campSince = 0; return false; }
    if (!campSince) campSince = now;
    // 實測：回營地的非同步載入偶爾停在 state=camp 但營地未生成；逾 15 秒仍可直接走原版開局。
    if (!questOn() || !settings.quest.autoStart || (!g.camp && now - campSince < 15000) || !g.kit || g.swapping || transition || now - actionAt < 2000) return false;
    if (terrorMode() !== "off" && g.save?.terror?.[g.kit.id]?.offers?.length) return false;
    let view = null;
    try { view = g.waypointView?.(g.kit); } catch { view = null; }
    actionAt = now;
    // 實測（2026-11-01）：回傳傳送點介面模型 tabs[].rows[].start = { kind: continue|new|terror|replay|training, ... }，open 表示可選。
    const starts = (view?.tabs || []).flatMap((t) => t?.rows || []).filter((r) => r?.open !== false && r?.start).map((r) => r.start);
    const order = ["normal", "nightmare", "hell"];
    const resume = starts.find((s) => s.kind === "continue" && (s.whose ?? "hero") === "hero");
    const opened = starts.filter((s) => s.kind === "new" && order.includes(s.difficulty)).sort((a, b) => order.indexOf(b.difficulty) - order.indexOf(a.difficulty));
    // 最高難度連續陣亡 2 次就回低一級難度刷一局（賺金幣與裝備），之後再挑戰。
    const farm = opened.length > 1 && (failStreak[opened[0].difficulty] || 0) >= 2;
    // 固定重複刷：使用者指定的難度已開放就一直開那個難度。
    const fixed = opened.find((s) => s.difficulty === settings.quest.farmDifficulty);
    const fresh = fixed || (farm ? opened[1] : opened[0]);
    if (farm) failStreak[opened[0].difficulty] = 0;
    if (resume && (settings.quest.farmDifficulty === "off" || resume.difficulty === settings.quest.farmDifficulty) && typeof g.continueRun === "function") { lastAction = "從營地繼續上次進度"; void g.continueRun(g.kit, "hero"); return true; }
    if (!fresh || typeof g.startRun !== "function") return false;
    lastAction = (fixed ? "重複刷難度：" : farm ? "最高難度打不上去，回低難度刷：" : "從營地開新局：") + fresh.difficulty; void g.startRun(g.kit, fresh.difficulty);
    return true;
  }
  // 以原版角色數值（傷害、生命、減傷、抗性）比較背包裝備，再走原版穿戴流程。
  let gearAt = 0;
  function gearScore(g, worn) {
    const p = g.world.player, numbers = g.heroNumbers(g.makePlayer(p.sprite, p.cls, worn), g.build, worn, false);
    const n = Object.fromEntries((numbers?.stats || []).map((s) => [s.label, finite(s.num) ? s.num : 0]));
    // 實測（2026-11-01）：減傷、施法速度為小數（0.5＝50％），抗性可為負（地獄 −40）；舊公式幾乎不算防禦而變成玻璃大砲。
    // 以「少承受 1％ 傷害 ≈ 多打 1％ 傷害」計分：生命權重高於傷害，減傷與四系抗性依實際減少承受量，負抗性扣分。
    const taken = (r) => -Math.log(1 - Math.min(75, r) / 100) * 100;
    const res = ["Fire Resistance", "Cold Resistance", "Lightning Resistance", "Poison Resistance"].reduce((a, k) => a + taken(n[k] || 0) * 0.5, 0);
    const reduced = Math.min(0.5, Math.max(0, n["Damage Reduced"] || 0));
    return Math.log1p(Math.max(0, n.Damage || 0)) * 100 + Math.log1p(Math.max(0, n.Life || 0)) * 130 - Math.log(1 - reduced) * 150 + res + Math.log1p(Math.max(0, n["Enhanced Defense"] || 0) / 100) * 20 + Math.min(1, n["Faster Cast Rate"] || 0) * 20 + (n["Replenish Life"] || 0) * 0.5 + (n["Magic Find"] || 0) * 0.02;
  }
  // 回傳候選中提升最多且達門檻者；候選可來自背包、倉庫、收藏庫或商店，只比較不寫入。
  function bestGear(g, items) {
    const p = g.world.player, worn = g.equippedOf(p.cls), base = gearScore(g, worn), doll = g.ownGear(p.cls).doll;
    let best = null;
    for (const item of items) {
      if (!item?.base || item.type === "quest" || item.type === "rune" || item.type === "gem" || Object.values(worn).includes(item)) continue;
      const preview = g.previewGear(p, g.build, false, item);
      if (!preview || preview.refused) continue;
      // 模擬原版 equip 會選的欄位與被擠掉的裝備。
      const trial = { ...worn }, to = doll.slotFor?.(item, worn);
      if (!to || !doll.canWear?.(item)) continue;
      const displaced = doll.displaced?.(item, worn, to) || [];
      for (const s of displaced) delete trial[s];
      trial[to] = item;
      // 分數以對數計：1 分約等於傷害 +1％。實測原版數值不含防禦，空欄位只要不變差就穿（至少得到防禦）。
      const gain = gearScore(g, trial) - base, empty = !worn[to] && displaced.every((s) => !worn[s]);
      if ((empty ? gain >= 0 : gain >= settings.gear.minGainPercent) && (!best || gain > best.gain)) best = { item, gain };
    }
    return best;
  }
  let charmTried = new WeakSet();
  const isCharm = (item) => !!item?.base && /charm/i.test(String(item.type || "") + " " + String(item.base));
  function autoEquip(g, now) {
    if (!settings.progressEnabled || !settings.gear.autoEquip || now - gearAt < 3000 || !g.world?.player || g.save?.cursor) return;
    if (!["playing", "camp"].includes(g.state) || typeof g.gearActions !== "function" || typeof g.heroNumbers !== "function" || typeof g.makePlayer !== "function") return;
    gearAt = now;
    const p = g.world.player, charm = g.inventoryOf(p.cls).find((x) => isCharm(x) && !charmTried.has(x));
    // 實測長局會背包滿（原版提示 inventory is full）而撿不到裝備；原版 gearActions.sell 跑圖中也可用，先賣最沒價值的騰出空間。
    if (g.state === "playing" && finite(g.lastInventoryFull) && performance.now() - g.lastInventoryFull < 5000) {
      // 長局（普通一路推到地獄）中途不回營地，暗金／套裝會堆滿背包；沒有低階可賣時也賣掉沒穿上的暗金／套裝。
      const rank = { normal: 0, magic: 1, rare: 2, set: 3, unique: 4 }, junk = g.inventoryOf(p.cls).filter((x) => x?.base && !keepType(x) && !isCharm(x) && x.rarity in rank).sort((a, b) => rank[a.rarity] - rank[b.rarity])[0];
      if (junk) { g.gearActions(p.cls, () => {}, false).sell(junk); g.lastInventoryFull = -Infinity; lastAction = "背包已滿，賣掉 " + (junk.name || junk.base); return; }
    }
    // 護符：原版 equip 遇到護符會改放進護符格（moveCharm）；有空位就放，滿了留在背包。
    if (charm) { charmTried.add(charm); g.gearActions(p.cls, () => {}, false).equip(charm); if (!g.inventoryOf(p.cls).includes(charm)) lastAction = "已放入護符：" + (charm.name || charm.base); return; }
    const best = bestGear(g, [...g.inventoryOf(p.cls)]);
    if (!best) {
      // 沒用的裝備（普通／魔法／稀有且不比身上好）撿到就賣，不等背包滿；暗金、套裝、符文之語、護符留給收藏與倉庫。
      if (settings.town.sellJunk) {
        const junk = g.inventoryOf(p.cls).find((x) => x?.base && !keepType(x) && !isCharm(x) && ["normal", "magic", "rare"].includes(x.rarity));
        if (junk) { g.gearActions(p.cls, () => {}, false).sell(junk); if (!g.inventoryOf(p.cls).includes(junk)) lastAction = "賣掉用不到的裝備 " + (junk.name || junk.base); }
      }
      return;
    }
    g.gearActions(p.cls, () => {}, false).equip(best.item);
    if (Object.values(g.equippedOf(p.cls)).includes(best.item)) lastAction = "已自動穿上較佳裝備：" + (best.item.name || best.item.base);
  }
  // 營地整備：沿用原版 openCampTrade 與商店介面回呼（hud.showTown 的參數），一次只做一個動作。
  // 實測（2026-11-01）：store＝恰西升級與裝備、akara＝藥水（1000 金，下一局放入藥帶）、stash＝倉庫／收藏庫（toStash、collectAll、可直接 equip）。
  let shop = null, trade = null, smithAt = -Infinity;
  const RANKS = ["Vitality", "Damage Reduced", "Replenish Life", "Potion Healing", "Faster Cast Rate", "Energy", "Faster Run/Walk", "Strength", "Dexterity", "Fire Pierce", "Cold Pierce", "Lightning Pierce", "Poison Pierce", "Physical Pierce", "Experience", "Magic Find", "Gold Find", "Sell Price", "Reroll", "Banish", "Skip"];
  const keepType = (item) => ["quest", "rune", "gem", "jewel"].includes(item.type) || /charm|jewel|rune|gem|key|essence|token/i.test(String(item.type || "") + " " + String(item.base || ""));
  function hookTown(g) {
    const hud = g.hud;
    if (!hud || typeof hud.showTown !== "function") return false;
    if (hud.__d2autobotTown === api) return true;
    const own = Object.prototype.hasOwnProperty.call(hud, "showTown"), original = hud.showTown;
    hud.showTown = function (...args) { trade = { gold: args[0], wares: args[1] || [], acts: args[2] || {}, gear: args[3] || null }; return Reflect.apply(original, this, args); };
    hud.__d2autobotTown = api;
    restores.push(() => { if (own) hud.showTown = original; else delete hud.showTown; delete hud.__d2autobotTown; });
    return true;
  }
  // 實測：倉庫（only=stash）以角色畫面顯示，leave 後畫面仍留著，需再用原版 closeCharacter 關閉。
  function leaveTrade(g) {
    if (g.state === "town") trade?.acts?.leave?.();
    const sheet = document.getElementById("character");
    if (shop?.open && sheet && !sheet.classList.contains("hidden")) g.hud?.closeCharacter?.();
    trade = null; if (shop) shop.open = null;
  }
  function openTrade(g, kind) {
    // 跑圖中碰到恰西（幕末清場後出現）已開著他的商店：只能用這一間，不切換。
    // 原版 openSmith 的商店同時提供倉庫操作（toStash、collectAll、equip 可從倉庫取），stash 步驟也在同一畫面完成。
    if (shop.smith) { if (!trade && typeof g.showTown === "function") g.showTown(); return ["store", "stash"].includes(kind) && g.state === "town" && !!trade; }
    if (shop.open === kind && g.state === "town" && trade) return true;
    leaveTrade(g);
    if (g.state !== "camp") return false;
    g.openCampTrade(kind); shop.open = kind;
    return !!trade && g.state === "town";
  }
  function stashItems(view) {
    const tabs = Object.values(view?.tabs || {}).flat(), kept = Object.values(view?.uniques || {}).flat();
    return [...tabs, ...kept].map((x) => x?.item ?? x).filter((x) => x?.base);
  }
  const shopSteps = {
    stash(g, cls) {
      if (!openTrade(g, "stash")) return true;
      const a = trade.gear?.actions, view = trade.gear?.view?.stash;
      if (!a) return true;
      if (settings.town.collect && (view ? view.collect > 0 : shop.smith) && !shop.collected && typeof a.collectAll === "function") { shop.collected = true; a.collectAll(); lastAction = "整備：把暗金／套裝收進收藏庫"; return false; }
      if (settings.gear.autoEquip) {
        const charm = stashItems(view).find((x) => isCharm(x) && !shop.tried.has(x));
        if (charm) { shop.tried.add(charm); a.equip(charm); lastAction = "整備：從倉庫放入護符 " + (charm.name || charm.base); return false; }
        // 倉庫與收藏庫的裝備一起評估；原版 equip 在倉庫情境可直接從倉庫或收藏庫取出穿上。
        const best = bestGear(g, [...g.inventoryOf(cls), ...stashItems(view)].filter((x) => !shop.tried.has(x)));
        if (best) { shop.tried.add(best.item); a.equip(best.item); lastAction = "整備：換上較佳裝備 " + (best.item.name || best.item.base); return false; }
      }
      if (settings.town.stash && typeof a.toStash === "function") {
        const item = g.inventoryOf(cls).find((x) => x?.base && !shop.tried.has(x) && !keepType(x) && ["unique", "set", "runeword", "rare"].includes(x.rarity));
        if (item) { shop.tried.add(item); a.toStash(item); lastAction = "整備：存入倉庫 " + (item.name || item.base); return false; }
      }
      return true;
    },
    sell(g, cls) {
      if (!settings.town.sellJunk || !openTrade(g, "store")) return true;
      const a = trade.gear?.actions, item = g.inventoryOf(cls).find((x) => x?.base && !shop.tried.has(x) && !keepType(x) && ["normal", "magic", "rare"].includes(x.rarity));
      if (!a?.sell || !item) return true;
      shop.tried.add(item); a.sell(item); lastAction = "整備：賣出 " + (item.name || item.base);
      return false;
    },
    potions(g) {
      if (!settings.town.buyPotions || !openTrade(g, "akara")) return true;
      const i = trade.wares.findIndex((w) => w?.potion && /Healing/i.test(w.name || "")), w = trade.wares[i];
      if (!w?.canBuy || (w.potion.bought ?? 0) >= settings.town.potionCount) return true;
      trade.acts.buy(i); lastAction = "整備：向阿卡拉買生命藥水";
      return false;
    },
    upgrades(g) {
      if (!openTrade(g, "store")) return true;
      const wares = trade.wares;
      if (settings.town.buyGear && settings.gear.autoEquip) {
        const offers = wares.filter((w) => w?.item && w.canBuy && !shop.tried.has(w.item));
        const best = offers.length ? bestGear(g, offers.map((w) => w.item)) : null;
        if (best) { shop.tried.add(best.item); trade.acts.buy(wares.findIndex((w) => w.item === best.item)); lastAction = "整備：向恰西買較佳裝備 " + (best.item.name || best.item.base); return false; }
      }
      if (!settings.town.charsiUpgrades) return true;
      // 依優先順序加權並計入已買等級，讓金幣平均投入生命、減傷、回血等永久成長。
      // 實測：只買得起便宜雜項時會把錢花光（物理穿透、Skip），核心升級沒滿就存錢；穿透只買職業會用到的元素。
      const PIERCE = { sorceress: ["Lightning", "Cold", "Fire"], necromancer: ["Poison", "Physical"], amazon: ["Physical", "Cold", "Fire", "Lightning"], paladin: ["Physical", "Lightning"], druid: ["Physical", "Cold", "Fire"], barbarian: ["Physical"], assassin: ["Physical", "Lightning", "Cold", "Fire"] }[g.kit?.id] || ["Physical"];
      const useful = (w) => !/ Pierce$/.test(w.name) || PIERCE.includes(w.name.replace(/ Pierce$/, ""));
      const core = wares.filter((w) => w && !w.item && RANKS.indexOf(w.name) >= 0 && RANKS.indexOf(w.name) < 7 && !(finite(w.maxRank) && w.rank >= w.maxRank && !w.endless));
      const saving = core.some((w) => !w.canBuy);
      let pick = -1, score = Infinity;
      wares.forEach((w, i) => {
        if (!w || !useful(w) || (saving && !core.includes(w))) return;
        if (!w || w.item || w.imbue || !w.canBuy || /^(?:Resurrect|Mercenary)/.test(w.name || "")) return;
        // 依排行榜配點：該職業幾乎不加的屬性（如法師的力量、敏捷）不買。
        const attr = ladderOf(g)?.attributes?.[String(w.name).toLowerCase()];
        if (attr !== undefined && attr < 0.1 && w.name !== "Vitality") return;
        const order = RANKS.indexOf(w.name), value = (order < 0 ? RANKS.length + 5 : order) + (w.rank || 0) * 3;
        if (value < score) { pick = i; score = value; }
      });
      if (pick < 0 || shop.buys++ > 60) return true;
      trade.acts.buy(pick); lastAction = "整備：恰西升級 " + wares[pick].name;
      return false;
    },
  };
  function campShop(g, now) {
    if (!settings.progressEnabled || !settings.town.enabled) { if (shop && !shop.done) { leaveTrade(g); shop = null; } return false; }
    if (g.state === "playing") { shop = null; return false; }
    if (shop?.done) return false;
    // 實測：清場後碰到恰西會停在商店畫面不動；順便賣裝與升級，再離開回到戰鬥。
    if (!shop && g.state === "town" && g.trade?.smith && !g.camp && hookTown(g)) {
      // 剛逛過就直接離開，避免反覆碰到恰西。
      if (now - smithAt < 60000) { if (!trade) g.showTown?.(); trade?.acts?.leave?.(); trade = null; return true; }
      smithAt = now;
      shop = { steps: ["stash", "sell", "upgrades", "stash"], i: 0, at: 0, tried: new Set(), buys: 0, actions: 0, open: "store", collected: false, smith: true };
    }
    if (!shop) {
      if (g.state !== "camp" || !g.camp || g.swapping || typeof g.openCampTrade !== "function" || !g.kit || !g.world?.player || !hookTown(g)) return false;
      charmTried = new WeakSet();
      shop = { steps: ["stash", "sell", "potions", "upgrades", "stash"], i: 0, at: 0, tried: new Set(), buys: 0, actions: 0, open: null, collected: false };
    }
    if (now - shop.at < 250) return true;
    shop.at = now;
    try {
      while (shop.i < shop.steps.length) {
        if (++shop.actions > 200) throw new Error("整備動作過多");
        const name = shop.steps[shop.i];
        if (!shopSteps[name](g, g.kit.id)) return true;
        shop.i++;
        if (name === "upgrades" || name === "potions") shop.tried.clear();
      }
    } catch (err) { lastAction = "整備中斷：" + String(err.message || err); }
    leaveTrade(g); shop.done = true; actionAt = now;
    return true;
  }
  // 排行榜學習：升級選卡依高手技能／被動權重，屬性點依高手配點比例；技能偏離時到阿卡拉重置（re-draft）。
  let levelCards = null, campMenu = null, statsAt = 0, redraft = null, redraftVisits = 0;
  function hookBuild(g) {
    const hud = g.hud;
    if (!hud || hud.__d2autobotBuild === api) return;
    const wrapOwn = (object, name, factory) => {
      if (typeof object?.[name] !== "function") return;
      const own = Object.prototype.hasOwnProperty.call(object, name), original = object[name];
      object[name] = factory(original);
      restores.push(() => { if (own) object[name] = original; else delete object[name]; });
    };
    // 實測原版 hud.showLevelUp(cards, build, handlers)：cards 為 {title, subtitle, text, rarity}；showCampMenu(npc, items) 為 {label, disabled, run}。
    wrapOwn(hud, "showLevelUp", (original) => function (...args) { levelCards = Array.isArray(args[0]) ? args[0] : null; return Reflect.apply(original, this, args); });
    wrapOwn(g, "showCampMenu", (original) => function (...args) { campMenu = { npc: args[0], items: Array.isArray(args[1]) ? args[1] : [] }; return Reflect.apply(original, this, args); });
    hud.__d2autobotBuild = api;
    restores.push(() => { delete hud.__d2autobotBuild; });
  }
  const ladderOf = (g) => settings.build.ladder ? LADDER.classes[g?.kit?.id || g?.world?.player?.cls] : null;
  function ladderScore(g, title) {
    const l = ladderOf(g), name = String(title || "").trim().toLowerCase();
    if (!l || !name) return 0;
    const skill = l.skills.find(([, n]) => n.toLowerCase() === name), passive = l.passives.find(([, n]) => n.toLowerCase() === name);
    return skill ? skill[2] * 10 : passive ? passive[2] * 6 : 0;
  }
  function pickCard(g, buttons) {
    let best = 0, score = -Infinity;
    buttons.forEach((button, i) => {
      const card = levelCards?.[i], evolve = button.classList.contains("evolves") || !!button.querySelector(".evolves.ready");
            // 實測卡名是 .lines 的第一個元素：單一 canvas（如 Faster Cast Rate），或 .d2-parts 內多個 canvas 以「-」接副標題（如 Ice|Bolt|-|New skill）。
      const head = button.querySelector(".lines")?.firstElementChild, parts = head ? [...(head.tagName === "CANVAS" ? [head] : head.querySelectorAll("canvas"))].map((c) => c.textContent.trim()) : [], cut = parts.indexOf("-");
      const title = card?.title ?? (parts.length ? parts.slice(0, cut < 0 ? parts.length : cut).join(" ") : button.querySelector("strong")?.textContent);
      const value = (evolve ? 100 : 0) + ladderScore(g, title) - i * 0.01;
      if (value > score) { best = i; score = value; }
    });
    return best;
  }
  // 屬性點依高手比例分配；原版 spendStatPoints(屬性, 點數)。
  function autoStats(g, now) {
    if (!settings.progressEnabled || !settings.build.autoStats || now - statsAt < 1000 || typeof g.spendStatPoints !== "function") return;
    statsAt = now;
    const unspent = g.build?.unspent | 0, ratio = ladderOf(g)?.attributes;
    if (unspent <= 0 || !ratio) return;
    const order = Object.entries(ratio).sort((a, b) => b[1] - a[1]);
    let left = unspent;
    for (const [attr, share] of order) {
      const n = attr === order[0][0] ? 0 : Math.min(left, Math.floor(unspent * share));
      if (n > 0) { g.spendStatPoints(attr, n); left -= n; }
    }
    if (left > 0) g.spendStatPoints(order[0][0], left);
    lastAction = "依排行榜比例分配屬性點 " + unspent + " 點";
  }
  // 目前技能投資與高手前 8 名技能重疊不到一半時，在營地向阿卡拉重置技能，再依排行榜重新選卡。
  function alignment(g) {
    const l = ladderOf(g), skills = Array.isArray(g.build?.skills) ? g.build.skills : [];
    const total = skills.reduce((a, s) => a + (s.level || 1), 0);
    if (!l || total < 6) return 1;
    const top = new Set(l.skills.slice(0, 8).map(([id]) => id));
    return skills.reduce((a, s) => a + (top.has(s.id) ? s.level || 1 : 0), 0) / total;
  }
  function campRedraft(g, now) {
    if (g.state !== "camp") { if (g.state === "playing") redraft = null; return false; }
    if (!settings.progressEnabled || !settings.build.redraft || !g.camp || g.swapping || typeof g.openAkara !== "function") return false;
    if (redraft?.done) return false;
    if (!redraft) {
      redraftVisits++;
      if (redraftVisits % 3 !== 1 || alignment(g) >= 0.5) { redraft = { done: true }; return false; }
      hookBuild(g); redraft = { phase: "open", at: 0 }; campMenu = null;
    }
    if (now - redraft.at < 300) return true;
    redraft.at = now;
    const enabled = (re) => campMenu?.items.find((item) => !item.disabled && re.test(String(item.label || "")) && typeof item.run === "function");
    if (redraft.phase === "open") { g.openAkara(); redraft.phase = "choose"; return true; }
    const item = redraft.phase === "choose" ? enabled(/re-?draft your skills/i) : enabled(/re-?draft|reset|yes|confirm/i);
    // 實測：重置在首次擊殺巴爾後才開放；關閉選單後原版停在 town，需比照原版自行回到 camp。
    if (!item) { g.hud?.hideNpcMenu?.(); if (g.state === "town" && g.camp) g.state = "camp"; if (redraft.phase === "choose") lastAction = "重置技能：目前無法重置（金幣不足或未開放）"; redraft = { done: true }; return false; }
    campMenu = null; item.run();
    if (redraft.phase === "choose") { redraft.phase = "confirm"; lastAction = "重置技能：技能偏離排行榜高手配法，向阿卡拉重置"; return true; }
    redraft = { done: true }; lastAction = "重置技能完成，依排行榜重新選卡";
    return true;
  }
  function progression(g, now) {
    if (campRedraft(g, now)) return true;
    if (campShop(g, now) || campStart(g, now)) return true;
    if (terrorMode() === "off") return false;
    const record = g.save?.terror?.[g.kit?.id];
    if (["camp", "select"].includes(g.state) && !g.swapping && record && g.save?.heroes?.[g.kit?.id]?.kept && record.playing === undefined && !record.replay) {
      void advance(g); return true;
    }
    if (!g.world?.terror || g.state !== "dead") return false;
    const won = !!g.tierDone;
    if (!won && !settings.terror.autoReviveOrRestart) { stop("角色陣亡，輔助已停止"); return true; }
    if (!won && (!g.runOver || g.deathTime === null || g.deathTime < 3)) return true;
    if (!won && !g.save?.heroes?.[g.kit?.id]?.kept) { stop("沒有可重試的角色"); return true; }
    if (clearWorld !== g.world) { clearWorld = g.world; clearAt = now; }
    if (now - clearAt >= settings.terror.postClearWaitSec * 1000) void advance(g);
    return true;
  }
  function blocked() { return (!settings.enabled && !settings.progressEnabled) || document.hidden || !panel.hidden || window.__d2editIsOpen?.() || performance.now() < manualUntil || paused(); }
  function step(g, now) {
    checkRetreat(now);
    if (retreat || blocked()) { release(); return; }
    if (g) { hookBuild(g); autoEquip(g, now); if (g.state === "playing") autoStats(g, now); }
    if (g && progression(g, now)) { release(); return; }
    if (g && g.state !== "playing") {
      release();
      // 重複刷模式：打完巴爾不往下一難度，結束本局回營地再開同難度。
      if (questOn() && settings.quest.farmDifficulty !== "off" && g.state === "dead" && g.afterBaal && typeof g.endAfterBaal === "function" && now - actionAt > 1500) {
        g.endAfterBaal(); actionAt = now; lastAction = "重複刷：本輪通關，回營地再刷"; return;
      }
      if (questOn() && g.state === "dead" && g.afterBaal?.next && typeof g.afterBaal.continue === "function" && now - actionAt > 1500) {
        g.afterBaal.continue(); actionAt = now; return;
      }
      // 一般難度陣亡或結束：沿用原版結算畫面的「回主選單」（營地模式下回營地），再由 campStart 續玩。
      if (questOn() && settings.quest.autoStart && g.state === "dead" && g.runOver && !g.world?.terror && !g.afterBaal?.next && typeof g.toMenu === "function" && (g.deathTime ?? 3) >= 3 && now - actionAt > 1500) {
        const died = !(g.world?.player?.life > 0) && !g.won;
        failStreak[g.difficulty] = died ? (failStreak[g.difficulty] || 0) + 1 : 0;
        actionAt = now; lastAction = died ? "陣亡，返回營地整備" : "本局通關，返回營地"; void g.toMenu(); return;
      }
      // 推進時才自動選卡：進化優先，其次依排行榜高手的技能／被動權重。
      // 實測：原版卡片有防誤觸，未經真實 pointerdown 的 click() 會被忽略，因此改按原版 1～3 鍵。
      if ((questOn() || terrorMode() !== "off") && visible(document.getElementById("level-up")) && now - actionAt > 800) {
        const cards = [...document.querySelectorAll("#choices button")].filter(visible);
        const i = pickCard(g, cards);
        if (cards.length) { keyPulse("Digit" + (i + 1), String(i + 1)); lastAction = "已選擇升級卡 " + (i + 1); }
        actionAt = now;
      }
      return;
    }
    if (!g && (document.body.classList.contains("no-run") || document.body.classList.contains("frontend-open") || ["level-up", "game-over", "town", "character", "waypoint"].some((id) => visible(document.getElementById(id))))) return;
    const state = readState(g);
    if (!state.hp || state.hp.now <= 0) { release(); return; }
    let danger = threats(state);
    let reason = g && deathReason(state, danger, now);
    if (reason) { void returnToSafety(g, state, reason, now); return; }
    const healingFailed = assistOn() ? potions(state, danger, now) : false;
    // 喝水後重新讀取生命，避免使用舊血量判斷離場。
    const after = readState(g);
    danger = threats(after);
    reason = g && deathReason(after, danger, now, healingFailed);
    if (reason) { void returnToSafety(g, after, reason, now); return; }
    if (g && state.p) { if (g.hud?.skillsOpen || g.hud?.questLogOpen) release(); else navigate(after, danger, now); }
  }
  function guarded(g, now) {
    if (!alive || now - lastStep < 50) return;
    lastStep = now;
    try { step(g, now); errors = 0; }
    catch (err) { release(); if (++errors >= 3) stop("連續執行錯誤，已停機：" + String(err.message || err)); }
  }
  function wrap(object, name, factory) {
    const original = object[name], wrapped = factory(original); object[name] = wrapped;
    restores.push(() => { if (object[name] === wrapped) object[name] = original; });
  }
  async function connect() {
    const base = new URL("/assets/", location.origin);
    const urls = [...performance.getEntriesByType("resource").map((e) => e.name), ...document.querySelectorAll("script[src],link[rel=modulepreload]")].map((e) => typeof e === "string" ? e : e.src || e.href);
    const queue = urls.filter((u) => u?.startsWith(base.href) && /\/(?:Game|game)-[\w-]+\.js(?:\?.*)?$/.test(u)).sort((a, b) => Number(/\/Game-/.test(b)) - Number(/\/Game-/.test(a))), seen = new Set();
    // 正規式定位壓縮後的類別，不依賴固定雜湊檔名或壓縮變數名。
    const signatures = [/export\s*\{[^}]*\b[\w$]+\s+as\s+Game\b[^}]*\}/, /tick\(\w+\)\{if\(!this\.world\)return;/, /drinkFrom\(\w+\)\{let\s+\w+=this\.world\?\.belt/, /player:\w+,enemies:\[\],projectiles:\[\]/];
    while (queue.length && seen.size < 12 && alive) {
      const url = queue.shift(); if (seen.has(url)) continue; seen.add(url);
      const response = await fetch(url, { signal: abort.signal }); if (!response.ok) continue;
      const source = await response.text();
      if (!signatures.every((re) => re.test(source))) { for (const m of source.matchAll(/["'`]\.\/(Game-[\w-]+\.js)["'`]/g)) queue.push(new URL(m[1], url).href); continue; }
      // 精確沿用頁面模組 URL，讓瀏覽器回傳原模組實例；不加查詢字串、不執行修改版副本。
      const module = await import(url); if (!alive) return;
      const proto = module.Game?.prototype;
      if (typeof proto?.tick !== "function" || typeof proto.drinkFrom !== "function" || typeof proto.steer !== "function") continue;
      wrap(proto, "tick", (original) => function (...args) { if (alive) { game = this; guarded(this, performance.now()); } return Reflect.apply(original, this, args); });
      // 原版 steer 會為拾取目標重建 walkTarget，記住該參照才能在停止時完全放手。
      wrap(proto, "steer", (original) => function (...args) { const result = Reflect.apply(original, this, args); if (alive && this === game && ownReach && this.world?.reaching === ownReach) ownWalk = this.walkTarget; return result; });
      hookUrl = url; hookNote = "已掛接原版 Game，等待下一幀"; return;
    }
    hookNote = "簽名不相容：僅使用 HUD／藥水按鍵；走位、撿物與推進停用";
  }
  const launcher = document.createElement("button"), stopButton = document.createElement("button"), host = document.createElement("div");
  launcher.type = stopButton.type = "button"; launcher.id = "d2autobot-launcher"; launcher.textContent = "輔助";
  launcher.style.cssText = "position:fixed;top:max(12px,env(safe-area-inset-top));left:max(12px,env(safe-area-inset-left));z-index:2147483645;display:none;padding:8px 14px;min-height:44px;border:1px solid #d4a84a;border-radius:6px;background:rgba(20,17,13,.95);color:#d4a84a;font:bold 15px system-ui;cursor:pointer";
  stopButton.textContent = "停止輔助";
  stopButton.style.cssText = "position:fixed;top:max(12px,env(safe-area-inset-top));left:50%;transform:translateX(-50%);z-index:2147483645;min-height:44px;background:#531b15;color:#fff;border:1px solid #d4a84a;border-radius:6px;padding:6px 12px;display:none";
  host.id = "d2autobot-panel"; host.style.cssText = "position:fixed;inset:0;z-index:2147483647;pointer-events:none";
  const root = host.attachShadow({ mode: "open" });
  root.innerHTML = `<style>
    :host{font:15px/1.5 'Microsoft JhengHei',system-ui,sans-serif;color:#f2e5c6}*{box-sizing:border-box}[hidden]{display:none!important}
    .backdrop{position:fixed;inset:0;background:#000a;display:grid;place-items:center;pointer-events:auto;padding:12px}
    .box{width:min(760px,100%);max-height:88dvh;overflow:auto;background:#18140f;border:1px solid #d4a84a;border-radius:10px;padding:20px;color:#f2e5c6}
    h2{margin:0;color:#d4a84a}h3{color:#d4a84a;margin:20px 0 8px}p{margin:8px 0}.head{display:flex;justify-content:space-between;align-items:center;gap:12px}
    label{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:44px;border-bottom:1px solid #fff1;padding:5px 0}
    button,input,select{font:inherit;min-height:44px}button,select,input[type=number]{background:#2a231a;color:#fff0cb;border:1px solid #9c7e41;border-radius:5px;padding:5px 10px}
    .toggle{min-width:112px;font-weight:bold;display:inline-flex;align-items:center;justify-content:center;gap:10px}.toggle::before{content:"";width:16px;height:16px;border-radius:50%;background:#b0a49c}.toggle[aria-checked=true]{background:#245436;border-color:#7bd89a;color:#effff3}.toggle[aria-checked=true]::before{background:#8affaf}.toggle[aria-checked=false]{background:#452b29;border-color:#b99188;color:#ffe9e4}.toggle:focus-visible{outline:3px solid #f8d87d;outline-offset:3px}input[type=number]{width:110px}button{cursor:pointer}.tabs{display:flex;gap:8px;margin:12px 0 0;border-bottom:1px solid #9c7e41}.tabs button{border-radius:5px 5px 0 0;border-bottom:0}.tabs button[aria-selected=true]{background:#d4a84a;color:#18140f;font-weight:bold}.note{font-size:13px;color:#cabd9d}.status{white-space:pre-line;padding:10px;background:#0005;border-radius:5px}
    @media(max-width:600px){.backdrop{padding:0}.box{width:100%;max-height:100dvh;height:100dvh;border-radius:0;padding:16px;padding-top:max(16px,env(safe-area-inset-top));padding-bottom:max(16px,env(safe-area-inset-bottom))}}
  </style><div class="backdrop" hidden><section class="box" role="dialog" aria-modal="true" aria-label="遊戲輔助設定"><div class="head"><h2>遊戲輔助工具</h2><button type="button" id="close">關閉</button></div><p class="status" role="status"></p><div class="tabs" role="tablist"><button type="button" role="tab" data-tab="assist" aria-selected="true">戰鬥輔助</button><button type="button" role="tab" data-tab="progress" aria-selected="false">推層與任務</button></div><div id="fields"><div data-pane="assist" role="tabpanel"></div><div data-pane="progress" role="tabpanel" hidden></div></div><p class="note">手動操作會暫讓控制權；背景分頁、設定面板、修改器及遊戲暫停時停止動作。總開關只能在此面板切換；緊急時可點上方「停止輔助」。</p><p class="note">死亡保護預設關閉；觸發時一律關閉推層、重刷與任務推進，須自行重新開啟。沿用原版離場結算，可能損失本局進度；無營地模式時可能回到角色選單。致命傷害與包圍判定為啟發式，不保證生存。任務輔助追蹤已生成的物品、石陣、牢籠、敵人與通關門；特定配點、營地交付及隱藏條件仍需手動處理。</p><p class="note">品質過濾控制自動追蹤目標；路過物品仍可能由原版自動撿起。無法掛接時，僅在 HUD 可讀的情況下按指定藥帶鍵，不從 Canvas 猜測敵人位置。</p><button type="button" id="stop">立即停止輔助</button></section></div>`;
  const panel = root.querySelector(".backdrop"), status = root.querySelector(".status"), controls = new Map();
  const panes = Object.fromEntries([...root.querySelectorAll("[data-pane]")].map((el) => [el.dataset.pane, el]));
  let fields = panes.assist;
  function tab(name) { fields = panes[name]; }
  function showTab(name) { for (const [k, el] of Object.entries(panes)) el.hidden = k !== name; for (const b of root.querySelectorAll("[data-tab]")) b.setAttribute("aria-selected", String(b.dataset.tab === name)); }
  for (const b of root.querySelectorAll("[data-tab]")) b.onclick = () => showTab(b.dataset.tab);
  function field(path, label, choices) {
    const row = document.createElement("label"), text = document.createElement("span"); text.textContent = label;
    const toggle = !choices && typeof get(path) === "boolean";
    const input = document.createElement(toggle ? "button" : choices ? "select" : "input");
    input.dataset.setting = path; input.id = "setting-" + path.replaceAll(".", "-"); text.id = input.id + "-label";
    input.setAttribute("aria-labelledby", text.id); row.htmlFor = input.id;
    if (toggle) {
      input.type = "button"; input.className = "toggle"; input.setAttribute("role", "switch");
      input.addEventListener("click", () => { put(path, !get(path)); release(); save(); });
    } else {
      if (choices) for (const [value, label] of choices) { const option = document.createElement("option"); option.value = value; option.textContent = label; input.append(option); }
      else { input.type = "number"; const [min, max] = bounds[path]; input.min = min; input.max = max; input.step = path.endsWith("Sec") || path.endsWith("Factor") ? "0.1" : "1"; }
      input.addEventListener("change", () => { put(path, input.type === "number" ? Number(input.value) : input.value); release(); save(); });
    }
    row.append(text, input); fields.append(row); controls.set(path, input);
  }
  function group(label) { const h = document.createElement("h3"); h.textContent = label; fields.append(h); }
  group("一般與安全"); field("enabled", "戰鬥輔助總開關");;
  group("生命與藥水");
  for (const [path, label] of [["autoHp", "自動喝生命藥水"], ["hpThreshold", "生命門檻（％）"], ["lethalProtection", "一擊必殺預判喝水"], ["lethalLookaheadSec", "預測提前秒數"], ["hpCooldownMs", "生命藥水冷卻（毫秒）"], ["autoMp", "自動補魔力（消耗回復活力藥水）"], ["mpThreshold", "魔力門檻（％）"], ["mpCooldownMs", "魔力藥水冷卻（毫秒）"], ["fallbackHpSlot", "降級模式生命藥帶欄（1～4）"], ["fallbackMpSlot", "降級模式魔力藥帶欄（1～4）"]]) field("potion." + path, label);
  group("走位與閃避");
  for (const [path, label] of [["enabled", "自動走位（保持距離與閃避）"], ["combatStyle", "戰鬥方式"], ["chaseFirst", "推進時追目標優先（路上閃避，不越閃越遠）"], ["kiteDistance", "敵人安全距離"], ["attackRange", "王與精英怪攻擊範圍（閃避時不超過此距離）"], ["dodgeProjectiles", "閃避敵方飛彈"], ["projectileSafetyRadius", "飛彈安全邊距"], ["smoothingFactor", "轉向平滑係數"]]) field("movement." + path, label, path === "combatStyle" ? [["auto", "自動（依職業）"], ["melee", "近戰（貼身攻擊）"], ["ranged", "遠程（保持距離）"]] : undefined);
  group("撿寶過濾"); field("loot.enabled", "自動撿裝備"); field("loot.searchRadius", "物品搜尋距離"); field("loot.pickupGold", "追蹤金幣"); field("loot.kickJars", "踢地上罐子木桶（可能掉藥水）"); field("loot.onlyUpgrades", "普通／魔法／稀有只撿比身上好的（撿前先看屬性）");
  for (const [quality, label] of [["normal", "普通"], ["magic", "魔法"], ["rare", "稀有"], ["set", "套裝"], ["unique", "暗金"], ["runeword", "符文之語"]]) field("loot.qualityThreshold." + quality, "撿取" + label);
  field("loot.backtrackForLoot", "通關後等待撿裝");
  tab("progress"); group("總開關"); field("progressEnabled", "推層與任務總開關"); group("恐怖層數"); field("terror.progressEnabled", "自動推恐怖層數"); field("terror.farmEnabled", "固定層數重刷（與推層互斥）"); field("terror.targetFarmTier", "重刷層數（須已通關）"); field("terror.postClearWaitSec", "通關等待（秒）"); field("terror.autoReviveOrRestart", "陣亡後重試（有保留角色時）");
  group("任務進程"); field("quest.autoProgress", "自動推任務（追蹤目標與選擇升級卡）"); field("quest.prioritizeBoss", "優先接近任務頭目"); field("quest.autoStart", "在營地自動開局／續玩（全新存檔可用）"); field("quest.farmDifficulty", "重複刷難度", [["off", "關閉（自動往上推）"], ["normal", "普通"], ["nightmare", "惡夢"], ["hell", "地獄"]]);
  group("排行榜學習"); field("build.ladder", "依排行榜高手配法選升級卡"); field("build.autoStats", "依高手比例自動配屬性點"); field("build.redraft", "技能偏離時向阿卡拉重置技能");
  group("裝備"); field("gear.autoEquip", "自動穿上較佳裝備"); field("gear.minGainPercent", "替換門檻（約等於傷害提升％）");
  group("營地整備（每次回營地自動變強）"); field("town.enabled", "回營地自動整備"); field("town.collect", "暗金／套裝收進收藏庫"); field("town.stash", "較好的裝備存入倉庫"); field("town.sellJunk", "賣掉用不到的裝備"); field("town.buyPotions", "用金幣向阿卡拉買生命藥水"); field("town.potionCount", "每局最多預購藥水數"); field("town.charsiUpgrades", "用金幣升級恰西永久能力"); field("town.buyGear", "向商人買較佳裝備");
  tab("assist"); group("死亡保護"); field("deathProtection.enabled", "死亡保護（緊急離開本局）"); field("deathProtection.emergencyHpPercent", "緊急生命門檻（％）"); field("deathProtection.disableAutomation", "觸發後關閉兩頁總開關");
  function refreshControls() {
    for (const [path, input] of controls) {
      if (input.getAttribute("role") === "switch") { input.setAttribute("aria-checked", String(get(path))); input.textContent = get(path) ? "開啟" : "關閉"; }
      else input.value = String(get(path));
    }
  }
  function closePanel() { panel.hidden = true; if (launcher.style.display !== "none") launcher.focus(); }
  launcher.onclick = () => { if (!paused()) return; release(); panel.hidden = false; refreshControls(); root.getElementById("close").focus(); };
  root.getElementById("close").onclick = closePanel; root.getElementById("stop").onclick = stopButton.onclick = () => stop();
  for (const el of [host, launcher, stopButton]) for (const name of ["pointerdown", "pointerup", "mousedown", "mouseup", "touchstart", "touchend", "keydown", "keyup", "click", "wheel"]) el.addEventListener(name, (e) => e.stopPropagation(), { signal: abort.signal });
  root.addEventListener("keydown", (e) => {
    if (e.code === "Escape") { e.preventDefault(); closePanel(); }
    if (e.key === "Tab") { const list = [...panel.querySelectorAll("button,input,select")], first = list[0], last = list.at(-1); if (e.shiftKey && root.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && root.activeElement === last) { e.preventDefault(); first.focus(); } }
  });
  document.body.append(launcher, stopButton, host); save();
  window.addEventListener("keydown", (e) => {
    manual(e);
  }, { capture: true, signal: abort.signal });
  window.addEventListener("pointerdown", manual, { capture: true, signal: abort.signal }); window.addEventListener("blur", release, { signal: abort.signal }); document.addEventListener("visibilitychange", release, { signal: abort.signal });
  const timer = setInterval(() => {
    if (!alive) return;
    checkRetreat(performance.now());
    const editorOpen = !!window.__d2editIsOpen?.(), isPaused = paused();
    launcher.style.display = isPaused && !editorOpen && panel.hidden ? "block" : "none";
    stopButton.style.display = (settings.enabled || settings.progressEnabled) && !isPaused && !editorOpen && panel.hidden ? "block" : "none";
    if (!isPaused || editorOpen) panel.hidden = true;
    if (!game) guarded(null, performance.now());
    const s = readState(game);
    status.textContent = ["戰鬥輔助：" + (settings.enabled ? "啟用" : "關閉") + "／推層與任務：" + (settings.progressEnabled ? "啟用" : "關閉"), game ? "掛鉤：原版 Game／" + game.state : hookNote, s.hp ? `生命：${Math.ceil(s.hp.now)}／${Math.ceil(s.hp.max)}` : "生命：無法讀取", s.mp ? `魔力：${Math.ceil(s.mp.now)}／${Math.ceil(s.mp.max)}` : "魔力：未啟用或無法讀取", game?.kit?.id ? "職業：" + ({ amazon: "亞馬遜", assassin: "刺客", barbarian: "野蠻人", druid: "德魯伊", necromancer: "死靈法師", paladin: "聖騎士", sorceress: "法師" }[game.kit.id] || game.kit.id) + "（" + (isMelee() ? "近戰" : "遠程") + "）" : "", game?.world?.terror ? "恐怖層數：" + game.world.terror.tier : "", "最近動作：" + lastAction, storageNote].filter(Boolean).join("\n");
  }, 200);
  const api = {
    destroy() { if (!alive) return; alive = false; release(); abort.abort(); clearInterval(timer); for (const restore of restores.reverse()) restore(); launcher.remove(); stopButton.remove(); host.remove(); if (window.__d2autobot === api) delete window.__d2autobot; }, stop,
    diagnostics: () => ({ hookUrl, hookNote, connected: !!game, state: game?.state ?? null, lastAction, storageNote }),
  };
  window.__d2autobot = api;
  connect().catch((err) => { if (alive) hookNote = "掛鉤無法載入，使用 HUD／按鍵降級：" + String(err.message || err); });
})();
