// 以獨立 Electron 設定檔及假後端操作實際修改器頁面，不讀取或寫入遊戲存檔。
const { app, BrowserWindow } = require('electron');
const fs = require('node:fs'), path = require('node:path'), os = require('node:os');
const assert = require('node:assert/strict');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'd2-weapon-ui-'));
app.setPath('userData', path.join(temp, 'profile'));
const preload = path.join(temp, 'preload.cjs');
fs.writeFileSync(preload, `
const sample={version:6,gold:0,unlocked:{amazon:'normal'},stashTabs:{},equippedByClass:{amazon:{weapon:{id:'first',name:'First',base:'First',type:'weapon',rarity:'normal',mods:[]},head:{id:'head',name:'Head',base:'Head',type:'head',rarity:'normal',mods:[]}}},weaponSets:{amazon:{active:1,weapon:{id:'second',name:'Second',base:'Second',type:'weapon',rarity:'normal',mods:[]}}}};
window.__writes=[];window.confirm=()=>true;window.alert=()=>{};
window.api={web:false,assets:async()=>({dir:'',uniques:{},sets:{},bases:{},quest:{},runes:{},gems:{}}),i18n:async()=>({dict:{},game:{stats:{},classes:{}}}),load:async()=>({save:structuredClone(sample),source:'fixture',seal:'sealed'}),save:async(_,s)=>{window.__writes.push(structuredClone(s));return {ok:true}},engine:async(fn)=>fn==='capabilities'?{weaponSets:true,supported:true}:null};
`);
const watchdog = setTimeout(() => { console.error('雙武器組介面測試逾時'); app.exit(1); }, 30000);
app.whenReady().then(async () => {
  const win = new BrowserWindow({ show:false, webPreferences:{preload,contextIsolation:false,nodeIntegration:false} });
  const webPage = path.join(__dirname, '..', 'editor.html');
  await win.loadFile(fs.existsSync(webPage) ? webPage : path.join(__dirname, '..', 'index.html'));
  for (let i=0;i<100;i++) {
    if (await win.webContents.executeJavaScript("!!document.querySelector('[data-c=\\\"eq:amazon\\\"]')")) break;
    await new Promise(r=>setTimeout(r,100));
  }
  const result = await win.webContents.executeJavaScript(`(async()=>{
    document.querySelector('[data-c="eq:amazon"]').click();
    const before=document.querySelector('#view h2').textContent;
    document.querySelector('#swap-weapon-sets').click();
    const after=document.querySelector('#view h2').textContent;
    const current=save.equippedByClass.amazon.weapon.id, alternate=save.weaponSets.amazon.weapon.id;
    const head=save.equippedByClass.amazon.head.id, writesBefore=window.__writes.length;
    document.querySelector('#write').click(); await new Promise(r=>setTimeout(r,100));
    return {before,after,current,alternate,head,writesBefore,written:window.__writes[0]};
  })()`);
  assert.match(result.before, /武器組 1/); assert.match(result.after, /武器組 2/);
  assert.equal(result.current, 'second'); assert.equal(result.alternate, 'first'); assert.equal(result.head, 'head');
  assert.equal(result.writesBefore, 0); assert.equal(result.written?.weaponSets?.amazon?.weapon?.id, 'first');
  assert.equal(result.written?.equippedByClass?.amazon?.weapon?.id, 'second');
  const old = await win.webContents.executeJavaScript(`(async()=>{
    supportsWeaponSets=false; gameSupported=false; delete save.weaponSets; cur='eq:amazon'; renderAll();
    const oldHasButton=!!document.querySelector('#swap-weapon-sets'), oldHasAlt=!!document.querySelector('[data-c="alt:amazon"]');
    const writesBefore=window.__writes.length; document.querySelector('#write').click(); await new Promise(r=>setTimeout(r,100));
    const oldWrites=window.__writes.length-writesBefore;
    save.weaponSets={amazon:{active:2,weapon:{id:'protected'}}}; renderAll();
    document.querySelector('#write').click(); await new Promise(r=>setTimeout(r,100));
    const blocked=window.__writes.length===writesBefore, message=document.querySelector('#status').textContent;
    supportsWeaponSets=null; gameSupported=null; document.querySelector('#write').click(); await new Promise(r=>setTimeout(r,100));
    return {oldHasButton,oldHasAlt,oldWrites,blocked,unknownBlocked:window.__writes.length===writesBefore,message};
  })()`);
  assert.equal(old.oldHasButton,false); assert.equal(old.oldHasAlt,false); assert.equal(old.oldWrites,0);
  assert.equal(old.blocked,true); assert.equal(old.unknownBlocked,true); assert.match(old.message,/拒絕寫入/);
  console.log('雙武器組實際介面切換與假後端寫入測試通過'); clearTimeout(watchdog); app.exit(0);
}).catch(err => { console.error(err.stack || err); clearTimeout(watchdog); app.exit(1); });
