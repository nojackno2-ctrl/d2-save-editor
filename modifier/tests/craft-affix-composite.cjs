const assert = require('node:assert/strict'), fs = require('node:fs');
(async () => {
  const { boot } = await import('data:text/javascript,' + encodeURIComponent(fs.readFileSync(require('node:path').join(__dirname,'..','engine-page.js'), 'utf8')));
  const all = JSON.parse(fs.readFileSync(require('node:path').join(__dirname,'..','..','game-data','裝備屬性分析','魔法稀有詞綴.json'),'utf8'));
  const base = {name:'Ogre Gauntlets',type:'gloves',itype:'glov'};
  const names = ['Godly', 'Bronze', "Dragon's", 'of the Leech', 'of the Bat', 'of the Sun', 'Glimmering', 'Glowing'];
  const game = {__setData(){},__uniques:[],__sets:[],__runewords:[],__bases:[base],__affixes:all.filter(a=>names.includes(a.name)),
    __affixApplies:(a)=>a.rows.some(r=>r.on.some(t=>['armo','glov','weap'].includes(t))) && !a.rows.every(r=>r.not.includes('glov')),
    __isType:(a,b)=>a===b,__seeded:(_,f)=>f(),__makeAffix:()=>({mods:[{stat:'damageReduction',value:3,implicit:true}]})};
  const engine=boot(game,JSON.stringify({bases:{}}));
  const item={base:base.name,type:'gloves',rarity:'rare'};
  const ranges=engine.statRanges(item);
  assert.deepEqual(ranges.affixByKind.prefix.lightRadius,[[1,1],[2,2]]);
  assert.deepEqual(ranges.affixByKind.suffix.lightRadius,[[5,5]]);
  const mods=[{stat:'enhancedDefense',value:200,kind:'prefix'},{stat:'attackRatingPoints',value:20,kind:'prefix'},
    {stat:'mana',value:40,kind:'prefix'},{stat:'lifeLeech',value:3,kind:'suffix'},
    {stat:'manaLeech',value:3,kind:'suffix'},{stat:'lightRadius',value:5,kind:'suffix'},
    {stat:'damageReduction',value:3,implicit:true}];
  assert(engine.validateItems([{...item,mods}])[0].some(p=>p.code==='affixCombo'));
  assert.equal(engine.affixSlots(item,mods).used.suf,3);
  const candidates=engine.allowedStatsMany({...item,requestKind:'suffix'},[mods])[0];
  assert(candidates.some(x=>x.stat==='attackRating' && x.value===5));
  assert(!engine.allowedStatsMany({...item,requestKind:'prefix'},[mods])[0].some(x=>x.stat==='attackRating'));
  const complete=[...mods,{stat:'attackRating',value:5,kind:'suffix'}];
  assert.deepEqual(engine.validateItems([{...item,mods:complete}]),[[]]);
  assert.deepEqual(engine.affixSlots(item,complete).used,{pre:3,suf:3});
  assert(!engine.allowedStatsMany({...item,requestKind:'suffix'},[complete])[0].some(x=>!x.implicit));
  console.log('巨魔護手複合詞綴與前後綴範圍測試通過');
})().catch(e=>{console.error(e);process.exitCode=1});
