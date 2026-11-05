// 新版職業底材固有詞綴組合數量不固定，必須與符文之語固定屬性分開驗證。
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

(async () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'engine-page.js'), 'utf8');
  const { boot } = await import('data:text/javascript,' + encodeURIComponent(source));
  const base = { name: '測試盾牌', type: 'shield', itype: 'shield' };
  const def = { name: '測試符文之語', types: ['shield'], runes: ['r1'] };
  const game = { __setData() {}, __uniques: [], __sets: [], __runewords: [def], __bases: [base],
    __isType: (a, b) => a === b, __seeded: (_, fn) => fn(),
    __makeAffix: () => ({ mods: [{ stat: 'resist', value: 45, auto: true }, { stat: 'attack', value: 120, auto: true }] }),
    __makeRuneword: () => ({ mods: [{ stat: 'fixed', value: 10 }, ...(Math.random() < 0.5
      ? [{ stat: 'resist', value: 5, auto: true }, { stat: 'attack', value: 5, auto: true }]
      : [{ stat: 'attack', value: 120, auto: true }])] }) };
  const engine = boot(game, JSON.stringify({ bases: { [base.name]: { sockets: [2] } } }));
  const item = { name: def.name, rarity: 'runeword', base: base.name, type: base.type,
    mods: [{ stat: 'fixed', value: 10 }, { stat: 'resist', value: 40, auto: true }] };
  assert.deepEqual(engine.validateItems([item]), [[]]);
  item.mods[1].value = 1000;
  assert.equal(engine.validateItems([item])[0][0].code, 'range');
  item.mods[1] = { stat: '不合法', value: 1, auto: true };
  assert.equal(engine.validateItems([item])[0][0].code, 'implicit');
  item.mods.pop();
  assert.equal(engine.validateItems([item])[0][0].code, 'error');
  console.log('符文之語職業底材詞綴驗證測試通過');
})().catch((e) => { console.error(e); process.exitCode = 1; });
