// 只在新建暫存副本驗證建置，不重建正式根目錄輸出。
const fs = require('node:fs'), path = require('node:path'), os = require('node:os');
const assert = require('node:assert/strict'), { spawnSync } = require('node:child_process');
const editor = path.resolve(__dirname, '..');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'd2autobot-build-'));
const source = path.join(root, 'editor'), out = root;
fs.mkdirSync(source); fs.mkdirSync(path.join(source, 'tests')); fs.mkdirSync(path.join(source, 'locales'));
const files = ['build-web.js', 'package.json', 'index.html', 'patch.js', 'web-install.html', 'i18n.js', 'webapi.js', 'zh.js', 'zh-TW.json', 'gamedata.json', 'engine-page.js', 'signatures.json', 'd2edit.js', 'autobot.js', 'lang.js', 'd2rfont.js', 'locales/zh-TW.json', 'AUTOBOT_DESIGN.md', 'tests/autobot.cjs', 'tests/test_lang.cjs', 'tests/weapon-sets.cjs', 'tests/weapon-sets-ui.cjs', 'tests/version-gate-web.cjs', 'README.md'];
for (const file of files) fs.copyFileSync(path.join(editor, file), path.join(source, file));
const keep = ['AGENTS.md', 'AI_HANDOFF.md', 'CLAUDE.md', 'GEMINI.md'];
for (const file of keep) fs.writeFileSync(path.join(out, file), '協作紀錄：' + file);
fs.mkdirSync(path.join(out, '.git'));fs.writeFileSync(path.join(out, '.git', 'sentinel'), '保留 Git');
fs.writeFileSync(path.join(out, 'stale.js'), '過時輸出');
const build = () => spawnSync(process.execPath, [path.join(source, 'build-web.js'), 'https://example.test/tool/'], { encoding: 'utf8' });
let result = build(); assert.equal(result.status, 0, result.stderr);
for (const file of ['autobot.js', 'AUTOBOT_DESIGN.md', 'tests/autobot.cjs', 'tests/weapon-sets.cjs', 'tests/weapon-sets-ui.cjs', 'tests/version-gate-web.cjs']) assert.deepEqual(fs.readFileSync(path.join(out, file)), fs.readFileSync(path.join(source, file)));
assert.match(fs.readFileSync(path.join(out, 'd2edit.js'), 'utf8'), /import\(at\("autobot\.js"\)\)/);
for (const file of keep) assert.equal(fs.readFileSync(path.join(out, file), 'utf8'), '協作紀錄：' + file);
assert.equal(fs.readFileSync(path.join(out, '.git', 'sentinel'), 'utf8'), '保留 Git');
assert.equal(fs.readFileSync(path.join(out, 'stale.js'), 'utf8'), '過時輸出'); // 輸出在根目錄，不可清除其他檔案
const before = fs.readFileSync(path.join(out, 'autobot.js'));
fs.unlinkSync(path.join(source, 'autobot.js'));
result = build(); assert.notEqual(result.status, 0);
assert.deepEqual(fs.readFileSync(path.join(out, 'autobot.js')), before);
assert.equal(fs.readFileSync(path.join(out, 'AI_HANDOFF.md'), 'utf8'), '協作紀錄：AI_HANDOFF.md');
console.log('建置回歸測試通過：複製、載入行、協作紀錄保存、來源缺檔保護；暫存副本：' + root);
