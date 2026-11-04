// 檢查版本辨識與桌面 IPC 的寫入封鎖；全部使用假後端，不讀寫遊戲存檔。
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
(async () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'engine-page.js'), 'utf8');
  const { boot } = await import('data:text/javascript,' + encodeURIComponent(src));
  const G = { __setData(){}, __uniques:[], __sets:[], __runewords:[], __bases:[], __weaponSetActive(){} };
  const identity = {gameScript:'Game-Ba9RuE4G.js',items:'itemArt-CUOhw0kt.js',save:'saveTransfer-C-ucl_ha.js'};
  const caps = (i) => boot(G,'{}',i).capabilities();
  assert.equal(caps(identity).supported,true);
  for (const i of [{...identity,gameScript:'Game-CP0n0PpN.js'}, {...identity,items:'itemArt-BTVnyuWi.js'}, {...identity,save:'keepSave-DxUL_UG-.js'}, {...identity,gameScript:null}, {}]) assert.equal(caps(i).supported,false);
  assert.equal(caps({source:'desktop',build:'20261102.1',gameScript:'Game-desktop-hash.js'}).supported,true);
  for (const build of ['20261101.1','20261103.1',null]) assert.equal(caps({source:'desktop',build}).supported,false);
  const handlers = {}, writes = [];
  let supported = false;
  const electron = {app:{getLocale:()=> 'zh-TW',whenReady:()=>new Promise(()=>{}),on(){}}, BrowserWindow:function(){},ipcMain:{handle:(name,fn)=>{handlers[name]=fn}},shell:{},dialog:{}};
  const core = {store:async (...args)=>{writes.push(args);return 1}};
  const engine = {call:async (fn)=>fn==='capabilities'?{supported}:[]};
  const context = vm.createContext({require:(name)=>name==='electron'?electron:name==='./core'?core:name==='./engine'?engine:require(name),process,console,__dirname:path.join(__dirname,'..')});
  vm.runInContext(fs.readFileSync(path.join(__dirname,'..','main.js'),'utf8'),context);
  let result=await handlers.save(null,'softcore',{version:6});
  assert.match(result.error,/不相容/); assert.equal(writes.length,0);
  supported=true; result=await handlers.save(null,'softcore',{version:6});
  assert.equal(result.ok,true); assert.equal(writes.length,1);
  const web = fs.readFileSync(path.join(__dirname,'..','d2edit.js'),'utf8');
  const take = (a,b) => {const x=web.indexOf(a),y=web.indexOf(b,x);assert(x>=0&&y>x);return web.slice(x,y)};
  const storageWrites=[], storage={getItem:()=>storageWrites.at(-1)}, cap={supported:false};
  const fakeEngine={capabilities:()=>cap,catalog:()=>['item']};
  const sandbox=vm.createContext({engine:async()=>fakeEngine,activeGameScript:()=>identity.gameScript,mode:()=>({key:'test'}),sealText:async()=>'{"version":6}',realSetItem:function(_k,v){storageWrites.push(v)},localStorage:storage,lockSaves(){},sessionStorage:{setItem(){}},LAST_WRITE:'test',summarize:()=>({}),console,URL,Set,performance:{getEntriesByType:()=>[]}});
  const lookup=vm.createContext({URL,Set,performance:{getEntriesByType:()=>[]}});
  vm.runInContext(take('function activeGameScript() {','async function startEngine()')+';globalThis.find=activeGameScript;',lookup);
  assert.equal(lookup.find(),null);
  lookup.performance.getEntriesByType=()=>[{name:'https://example.test/assets/Game-Ba9RuE4G.js',initiatorType:'other'}]; assert.equal(lookup.find(),identity.gameScript);
  lookup.performance.getEntriesByType=()=>[{name:'https://example.test/assets/Game-Ba9RuE4G.js',initiatorType:'fetch'}]; assert.equal(lookup.find(),null);
  lookup.performance.getEntriesByType=()=>[{name:'https://example.test/assets/Game-Ba9RuE4G.js',initiatorType:'fetch'},{name:'https://example.test/assets/Game-CP0n0PpN.js',initiatorType:'script'}]; assert.equal(lookup.find(),'Game-CP0n0PpN.js');
  lookup.performance.getEntriesByType=()=>[{name:'https://example.test/assets/Game-Ba9RuE4G.js',initiatorType:'script'},{name:'https://example.test/assets/Game-CP0n0PpN.js',initiatorType:'script'}]; assert.equal(lookup.find(),null);
  vm.runInContext(`const backend={${take('  async save(m, save) {','  sealText,')}${take('  async engine(fn, ...args) {','  traces(m, remove) {')}}; globalThis.backend=backend;`,sandbox);
  await assert.rejects(sandbox.backend.save('softcore',{version:6}),/不相容/); assert.equal(storageWrites.length,0);
  await assert.rejects(sandbox.backend.engine('catalog'),/不相容/);
  assert.equal((await sandbox.backend.engine('capabilities')).supported,false);
  cap.supported=true; assert.equal((await sandbox.backend.save('softcore',{version:6})).ok,true); assert.equal(storageWrites.length,1);
  assert.equal((await sandbox.backend.engine('catalog'))[0],'item');
  let stamp=1, installed='20261101.1', prepared=0;
  const fakeFs={statSync:()=>({size:10,mtimeMs:stamp}),mkdtempSync:()=>{prepared++;return path.join('C:','temp','engine-fixture')},mkdirSync(){},existsSync:()=>true,
    readdirSync:()=>['Game-Ba9RuE4G.js','itemArt-CUOhw0kt.js','saveTransfer-C-ucl_ha.js'],readFileSync:(p)=>p.endsWith('changelog.json')?JSON.stringify([{build:installed}]):'{}',writeFileSync(){},copyFileSync(){}};
  class FakeWindow { constructor(){this.webContents={executeJavaScript:async code=>code==='!!window.engine'?true:code.includes('capabilities().supported')?true:code.includes('.capabilities(')?{supported:true,weaponSets:true}:[]}} async loadFile(){} }
  const moduleStub={exports:{}};
  const engineContext=vm.createContext({module:moduleStub,exports:moduleStub.exports,process,console,__dirname:path.join(__dirname,'..'),setTimeout,
    require:n=>n==='electron'?{app:{getPath:()=>path.join('C:','temp')},BrowserWindow:FakeWindow}:n==='fs'?fakeFs:n==='./signatures.json'?{}:n==='./patch'?{patch:()=>({patched:{},missing:[],found:{}})}:require(n)});
  vm.runInContext(fs.readFileSync(path.join(__dirname,'..','engine.js'),'utf8'),engineContext);
  assert.equal((await moduleStub.exports.call('capabilities')).supported,false); assert.equal(prepared,0);
  await assert.rejects(moduleStub.exports.call('catalog'),/不相容/); assert.equal(prepared,0);
  installed='20261102.1'; assert.equal((await moduleStub.exports.call('capabilities')).supported,true);
  stamp=2; assert.equal((await moduleStub.exports.call('capabilities')).supported,false);
  await assert.rejects(moduleStub.exports.call('catalog'),/程式已變更/);
  console.log('版本識別、桌面 IPC 與網頁後端封鎖測試通過');
})().catch(e=>{console.error(e);process.exitCode=1});
