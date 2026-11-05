// 孔數與鑲嵌珠寶：製作裝備與物品編輯的介面邏輯（Electron，離線夾具）
const { app, BrowserWindow } = require('electron');
const fs = require('node:fs'), path = require('node:path'), os = require('node:os'), assert = require('node:assert/strict');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'd2-socket-ui-'));
app.setPath('userData', path.join(temp, 'profile'));
const preload = path.join(temp, 'preload.cjs');
fs.writeFileSync(preload, `window.api={web:false,assets:async()=>({dir:'',uniques:{},sets:{},bases:{},quest:{},runes:{},gems:{}}),i18n:async()=>({dict:{},game:{stats:{},classes:{}}}),load:async()=>({save:{version:6,gold:1,stashTabs:{},equippedByClass:{},unlocked:{}},source:'fixture'}),engine:async()=>null};`);
const watchdog = setTimeout(() => { console.error('孔數介面測試逾時'); app.exit(1); }, 30000);
app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false, webPreferences: { preload, contextIsolation: false, nodeIntegration: false } });
  await win.loadFile(path.join(__dirname, '..', 'editor.html'));
  const r = await win.webContents.executeJavaScript(`(async()=>{
    const out = {};
    BASES = [{name:'Test Sword',type:'weapon',itype:'swor',level:1,sockets:[2,3,4]},{name:'Test Ring',type:'ring',itype:'ring',level:1,sockets:null},{name:'Jewel',type:'jewel',itype:'jewl',level:1,sockets:null}];
    save.stashTabs = { '1': [
      {id:'j1',base:'Jewel',type:'jewel',rarity:'magic',name:'Jewel A',level:99,mods:[],at:{x:0,y:0}},
      {id:'j2',base:'Jewel',type:'jewel',rarity:'rare',name:'Jewel B',level:99,mods:[],at:{x:1,y:0}} ] };
    out.maxNormal = socketMaxFor('Test Sword','normal'); out.maxMagic = socketMaxFor('Test Sword','magic'); out.maxRare = socketMaxFor('Test Sword','rare');
    out.maxUnique = socketMaxFor('Test Sword','unique'); out.maxRing = socketMaxFor('Test Ring','normal'); out.maxRw = socketMaxFor('Test Sword','runeword');
    const host = document.createElement('div'); document.body.appendChild(host);
    renderSocketUI(host, { max: 4, n: 2 });
    host.querySelector('.sk-n').value = '3'; host.querySelector('.sk-n').dispatchEvent(new Event('change'));
    out.jewelSelects = host.querySelectorAll('.sk-j').length;
    const sels = host.querySelectorAll('.sk-j'); sels[0].value = '0'; sels[1].value = '1'; host.dispatchEvent(Object.assign(new Event('change'), {}));
    sels[0].dispatchEvent(new Event('change', { bubbles: true }));
    const st = readSockets(host); out.n = st.n; out.picked = st.jewels.map(j => j.id);
    sels[1].value = '0'; sels[1].dispatchEvent(new Event('change', { bubbles: true }));
    try { readSockets(host); out.dup = false; } catch (e) { out.dup = e.message; }
    sels[1].value = '1'; sels[1].dispatchEvent(new Event('change', { bubbles: true }));
    const it = { id: 'x', base: 'Test Sword', rarity: 'normal', mods: [], at: {x:0,y:0} };
    applySockets(it, readSockets(host)); detachJewels(readSockets(host).jewels);
    out.it = { sockets: it.sockets, socketed: it.socketed.map(j => j.id), hasAt: it.socketed.some(j => 'at' in j) };
    out.stashLeft = save.stashTabs['1'].length;
    applySockets(it, { n: 0, jewels: [] }); out.cleared = !('sockets' in it) && !('socketed' in it);
    return out;
  })()`);
  assert.deepEqual([r.maxNormal, r.maxMagic, r.maxRare, r.maxUnique, r.maxRing, r.maxRw], [4, 2, 1, 0, 0, 0]);
  assert.equal(r.jewelSelects, 3);
  assert.equal(r.n, 3); assert.deepEqual(r.picked, ['j1', 'j2']);
  assert.match(r.dup, /同一顆珠寶/);
  assert.equal(r.it.sockets, 3); assert.deepEqual(r.it.socketed, ['j1', 'j2']); assert.equal(r.it.hasAt, false);
  assert.equal(r.stashLeft, 0); assert.equal(r.cleared, true);
  console.log('孔數與珠寶介面測試通過'); clearTimeout(watchdog); app.exit(0);
}).catch(e => { console.error(e.stack); clearTimeout(watchdog); app.exit(1); });
