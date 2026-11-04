// 模擬原版技能變體表，驗證特徵碼匯出及修改器的職業清單。
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { patch } = require('../patch.js');
const signatures = require('../signatures.json');
const webSignatures = require('../../modifier/signatures.json');

(async () => {
  assert.equal(signatures.modDefs, webSignatures.modDefs);
  const source = 'const m={fireBolt:[{id:`split`,name:`Split`,describe:`分裂`}]};';
  const result = patch({ 'itemArt-test.js': source }, signatures);
  assert.equal(result.found.modDefs, 'itemArt-test.js');
  assert.match(result.patched['itemArt-test.js'], /m as __modDefs/);
  const game = await import('data:text/javascript,' + encodeURIComponent(result.patched['itemArt-test.js']));
  const engineSource = fs.readFileSync(path.join(__dirname, '..', 'engine-page.js'), 'utf8');
  const { boot } = await import('data:text/javascript,' + encodeURIComponent(engineSource));
  const engine = boot({ ...game, __setData() {}, __uniques: [], __sets: [], __runewords: [], __bases: [],
    __classKits: { sorceress: { skills: { fireBolt: { name: 'Fire Bolt' } }, passives: {} } } }, '{}');
  assert.deepEqual(engine.skillModDefs(['sorceress']), { sorceress: [{ id: 'fireBolt', name: 'Fire Bolt', passive: false,
    options: [{ id: 'split', name: 'Split', describe: '分裂' }] }] });
  console.log('技能變體特徵碼與職業清單測試通過');
})().catch((e) => { console.error(e); process.exitCode = 1; });
