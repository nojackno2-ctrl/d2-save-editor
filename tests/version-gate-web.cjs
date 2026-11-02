// 在隔離的 Electron 網頁環境載入本機留存的原版遊戲模組及真實網頁後端。
// 用法：electron tests/version-gate-web.cjs <最新版程式目錄> <舊版程式目錄> <itemstats.json> [更舊版程式目錄]
const {app, BrowserWindow, session} = require('electron');
const fs=require('node:fs'), path=require('node:path'), http=require('node:http'), os=require('node:os'), assert=require('node:assert/strict');
const [latest,old,stats,older]=process.argv.slice(2), root=path.resolve(__dirname,'..');
if (!latest || !old || !stats) { console.error('請提供最新版目錄、舊版目錄及 itemstats.json'); app.exit(1); }
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'d2-web-gate-')); app.setPath('userData',path.join(tmp,'profile'));
app.on('window-all-closed',()=>{});
const watchdog=setTimeout(()=>{console.error('網頁版本封鎖測試逾時');app.exit(1)},60000);
let server, selected;
const html=(game)=>`<!doctype html><link rel="modulepreload" href="/assets/${game}"><script>localStorage.setItem('d2-survivors/save/v1',JSON.stringify({version:6,gold:12,stashTabs:{},equippedByClass:{},unlocked:{}}))</script><script type="module" src="/tool/d2edit.js"></script>`;
app.whenReady().then(async()=>{
  server=http.createServer((req,res)=>{
    const u=new URL(req.url,'http://localhost'), name=path.basename(u.pathname);
    if(u.pathname==='/play/' || u.pathname==='/'){res.setHeader('content-type','text/html');res.end(html(selected.game));return}
    if(u.pathname==='/d2/itemstats.json'){res.setHeader('content-type','application/json');fs.createReadStream(stats).pipe(res);return}
    if(u.pathname==='/tool/autobot.js' || u.pathname==='/tool/lang.js'){res.setHeader('content-type','text/javascript');res.end('export {};');return}
    let file;if(u.pathname.startsWith('/assets/'))file=path.join(selected.dir,name);else if(u.pathname.startsWith('/tool/'))file=path.join(root,name);else {res.writeHead(404).end();return}
    res.setHeader('content-type',name.endsWith('.json')?'application/json':name.endsWith('.html')?'text/html':'text/javascript');
    fs.createReadStream(file).on('error',()=>res.writeHead(404).end()).pipe(res);
  }).listen(0,'127.0.0.1');
  await new Promise(r=>server.once('listening',r));
  const cases=[[latest,'Game-Ba9RuE4G.js',true],[old,'Game-CP0n0PpN.js',false]];
  if(older)cases.push([older,'Game-C88Jt16A.js',false]);
  for (const [dir,game,supported] of cases) {
    selected={dir,game}; const partition='d2-gate-'+Math.random();
    const win=new BrowserWindow({show:false,webPreferences:{session:session.fromPartition(partition)}});
    await win.loadURL(`http://127.0.0.1:${server.address().port}/play/`);
    let ready=false;for(let i=0;i<200;i++){ready=await win.webContents.executeJavaScript('!!window.__d2editBackend');if(ready)break;await new Promise(r=>setTimeout(r,100))}assert(ready,'網頁後端未載入');
    const result=await win.webContents.executeJavaScript(`(async()=>{
      const b=window.__d2editBackend,k='d2-survivors/save/v1',before=localStorage.getItem(k);
      let capabilities,error='',engineError='',saveResult=null;
      try{capabilities=await b.engine('capabilities')}catch(e){error=String(e.message||e)}
      try{await b.engine('catalog')}catch(e){engineError=String(e.message||e)}
      try{saveResult=await b.save('softcore',{version:6,gold:34,stashTabs:{},equippedByClass:{},unlocked:{}})}catch(e){error=String(e.message||e)}
      const after=localStorage.getItem(k), orig=performance.getEntriesByType.bind(performance), negative=[];
      for(const names of [[],['Game-future.js'],['Game-Ba9RuE4G.js','Game-CP0n0PpN.js']]) {
        performance.getEntriesByType=()=>names.map(n=>({name:location.origin+'/assets/'+n,initiatorType:'script'}));
        let reason='';try{await b.save('softcore',{version:6,gold:999})}catch(e){reason=String(e.message||e)}
        negative.push({reason,unchanged:localStorage.getItem(k)===after});
      }
      performance.getEntriesByType=()=>[{name:location.origin+'/assets/Game-CP0n0PpN.js',initiatorType:'script'},{name:location.origin+'/assets/Game-Ba9RuE4G.js',initiatorType:'fetch'}];
      let scannedReason='';try{await b.save('softcore',{version:6,gold:999})}catch(e){scannedReason=String(e.message||e)}
      negative.push({reason:scannedReason,unchanged:localStorage.getItem(k)===after});
      performance.getEntriesByType=orig;
      return {capabilities,error,engineError,saveResult,before,after,negative};
    })()`);
    assert.equal(result.capabilities?.supported,supported,JSON.stringify(result));
    if(supported){assert.equal(result.saveResult?.ok,true);assert.notEqual(result.before,result.after);assert.equal(result.engineError,'')}
    else {assert.match(result.error,/不相容/);assert.match(result.engineError,/不相容/);assert.equal(result.before,result.after)}
    for(const x of result.negative){assert.match(x.reason,/不相容/);assert.equal(x.unchanged,true)}
    await win.webContents.executeJavaScript('window.__d2editLauncher.click()');
    let editorReady=false;
    for(let i=0;i<150;i++){
      editorReady=await win.webContents.executeJavaScript(`(()=>{try{const f=[...document.querySelectorAll('iframe')].find(x=>x.src.includes('editor.html'));return !!f?.contentDocument?.querySelector('#write') && f.contentWindow.eval('gameSupported !== null && save !== null')}catch{return false}})()`);
      if(editorReady)break;await new Promise(r=>setTimeout(r,100));
    }
    assert(editorReady,'網頁修改器介面未載入或未完成版本檢查');
    const ui=await win.webContents.executeJavaScript(`(async()=>{
      const f=[...document.querySelectorAll('iframe')].find(x=>x.src.includes('editor.html')),w=f.contentWindow,d=f.contentDocument,k='d2-survivors/save/v1';
      w.confirm=()=>true;w.alert=()=>{}; const before=localStorage.getItem(k);w.eval('save.gold=77');d.querySelector('#write').click();
      await new Promise(r=>setTimeout(r,200));return {supported:w.eval('gameSupported'),message:d.querySelector('#status').textContent,before,after:localStorage.getItem(k)};
    })()`);
    assert.equal(ui.supported,supported,JSON.stringify(ui));
    if(supported){assert.notEqual(ui.before,ui.after);assert.equal(JSON.parse(ui.after).gold,77)}
    else {assert.equal(ui.before,ui.after);assert.match(ui.message,/拒絕寫入/)}
    console.log(game+'：'+(supported?'允許最新版':'封鎖舊版')+'，網頁後端與隔離存檔驗證通過');win.destroy();
  }
  server.close();clearTimeout(watchdog);app.exit(0);
}).catch(e=>{console.error(e.stack||e);server?.close();clearTimeout(watchdog);app.exit(1)});
