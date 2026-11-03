const assert = require('node:assert/strict');
const fs = require('node:fs');
(async () => {
  const { boot } = await import('data:text/javascript,' + encodeURIComponent(fs.readFileSync('engine-page.js', 'utf8')));
  const types = ['weapon','shield','head','body','gloves','belt','boots','ring','amulet','charm','jewel'];
  const bases = types.map(type => ({name:type, type, itype:type === 'jewel' ? 'jewl' : type}));
  const game = { __setData(){}, __uniques:[], __sets:[], __runewords:[], __bases:bases,
    __isType:(a,b)=>a===b, __seeded:(_,fn)=>fn(), __affixes:[], __affixApplies:()=>true,
    __makeAffix:()=>({mods:[{stat:'defense',value:12,implicit:true}]}) };
  const engine = boot(game, JSON.stringify({bases:{}}));
  for (const base of bases) {
    assert.equal(engine.affixSlots({base:base.name,rarity:'magic'}).limit.max, 2);
    const max = base.type === 'charm' ? 0 : base.type === 'jewel' ? 4 : 6;
    assert.equal(engine.affixSlots({base:base.name,rarity:'rare'}).limit.max, max);
    assert.deepEqual(engine.statRanges({base:base.name,rarity:'rare'}).implicit.defense.slice(), [12,12]);
  }
  assert.equal(engine.validateItems([{base:'charm',type:'charm',rarity:'rare',mods:[]}])[0].some(x=>x.code==='rareCharm'), true);
  console.log('各部位詞綴上限與固有屬性範圍測試通過');
})().catch(e=>{console.error(e);process.exitCode=1});
