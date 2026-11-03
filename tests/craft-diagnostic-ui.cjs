const { app, BrowserWindow } = require('electron');
const fs = require('node:fs'), path = require('node:path'), os = require('node:os'), assert = require('node:assert/strict');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'd2-craft-diag-'));
app.setPath('userData', path.join(temp, 'profile'));
const preload = path.join(temp, 'preload.cjs');
fs.writeFileSync(preload, `window.api={web:false,assets:async()=>({dir:'',uniques:{},sets:{},bases:{},quest:{},runes:{},gems:{}}),i18n:async()=>({dict:{},game:{stats:{},classes:{}}}),load:async()=>({save:{version:6,gold:987654321,stashTabs:{},equippedByClass:{},unlocked:{}},source:'fixture'}),engine:async()=>null};`);
const watchdog=setTimeout(()=>{console.error('診斷介面測試逾時');app.exit(1)},30000);
app.whenReady().then(async()=>{
 const win=new BrowserWindow({show:false,webPreferences:{preload,contextIsolation:false,nodeIntegration:false}});
 await win.loadFile(path.join(__dirname,'..','editor.html'));
 const result=await win.webContents.executeJavaScript(`(async()=>{
   BASES=[{name:'Test Sword',type:'weapon',itype:'sword',level:1}];
   window.api.engine=async(fn,...args)=>fn==='validateItems'?[[{code:'affixCombo',rarity:'rare'}]]:fn==='resolveName'?{error:'無法判定名稱'}:fn==='affixSlots'?{limit:{max:6},used:{pre:1,suf:0},kinds:{damage:'prefix'}}:null;
   document.querySelector('#xCategory').innerHTML='<option value="weapon">武器</option>';
   document.querySelector('#xBase').innerHTML='<option value="Test Sword">劍</option>';
   document.querySelector('#xRar').innerHTML='<option value="rare">稀有</option>';
   document.querySelector('#cmods-pre tbody').innerHTML='<tr><td class="zh">傷害</td><td><select class="stat"><option value="damage">傷害</option></select></td><td><input class="val" value="12"><small class="limit">範圍：1～10</small></td><td><input type="checkbox" class="imp"></td></tr>';
   await makeCraftDiagnostic();
   return {visible:!document.querySelector('#xDiagPanel').hidden,text:document.querySelector('#xDiagText').value};
 })()`);
 const report=JSON.parse(result.text); assert.equal(result.visible,true); assert.equal(report.設定.底材,'Test Sword');
 assert.equal(report.設定.屬性列[0].數值,12); assert.equal(report.原版規則檢查[0][0].code,'affixCombo');
 assert.equal(report.詞綴數量.limit.max,6); assert.equal(report.詞綴數量.kinds,undefined); assert(!result.text.includes('987654321'));
 console.log('製作裝備診斷介面測試通過');clearTimeout(watchdog);app.exit(0);
}).catch(e=>{console.error(e.stack);clearTimeout(watchdog);app.exit(1)});
