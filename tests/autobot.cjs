const { app, BrowserWindow } = require('electron');
const http = require('node:http'), fs = require('node:fs'), path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '..', 'autobot.js'), 'utf8');
const fixture = `class Fixture {
 constructor(){this.ticks=0;this.state='paused';this.kit={id:'sorceress'};this.hud={};this.save={terror:{sorceress:{open:3,cleared:2,offers:[{affixes:['nobelt']},{affixes:[]}]}},heroes:{sorceress:{kept:{}}}};this.calls=[];this.world={player:{x:0,y:0,life:100,maxLife:100,radius:12,speed:150},mana:{mana:100,max:100},enemies:[],hostiles:[],projectiles:[],pickups:[],belt:{columns:[['potion','potion','potion'],['rejuvenation'],[],[]]},time:0};this.walkTarget=null;this.deathTime=4;this.runOver=true;}
 tick(e){if(!this.world)return;this.ticks++;this.steer(this.world.player);}
 steer(e){if(this.walkTarget&&this.world.reaching)this.walkTarget={x:this.world.reaching.x,y:this.world.reaching.y};return {x:0,y:0};}
 drinkFrom(e){let t=this.world?.belt;if(this.state!=='playing'||!t)return;let kind=t.columns[e].shift();if(!kind)return;this.calls.push(['drink',e]);this.world.player.life=Math.min(100,this.world.player.life+40);if(kind==='rejuvenation')this.world.mana.mana=100;}
 newWorld(e){return{player:e,enemies:[],projectiles:[]};}
 pause(){this.state='paused';}
 leaveRun(){if(this.state!=='paused')throw Error('必須先暫停');this.calls.push(['leave']);this.state='camp';}
 async startTerror(kit,offer){this.calls.push(['terror',offer]);this.state='loading';}
 async startReplay(kit,tier){this.calls.push(['replay',tier]);this.state='loading';}
} export{Fixture as Game};`;
const html = `<!doctype html><style>.hidden{display:none}</style><body><div id="paused" class="hidden"></div><div id="level-up" class="hidden"><div id="choices"><button>普通卡</button><button class="evolves">進化卡</button></div></div><span id="life-text">100 / 100</span><script type="module">import {Game} from '/assets/Game-fixture.js';window.Game=Game;window.game=new Game();window.originalTick=Game.prototype.tick;window.originalSteer=Game.prototype.steer;</script>`;
// 每次建立獨立 Chromium 設定資料夾，不碰遊戲或使用者瀏覽器資料。
app.setPath('userData',fs.mkdtempSync(path.join(require('node:os').tmpdir(),'d2autobot-test-')));
const watchdog=setTimeout(()=>{console.error('模擬測試啟動或執行逾時');app.exit(1)},60000);watchdog.unref();
let server, win;
(async()=>{
 await app.whenReady();
 server=http.createServer((req,res)=>{res.setHeader('Content-Type',req.url.includes('.js')?'text/javascript; charset=utf-8':'text/html; charset=utf-8');res.end(req.url.startsWith('/assets/')?fixture:html)}).listen(0,'127.0.0.1');
 await new Promise(r=>server.once('listening',r));
 win=new BrowserWindow({show:false,webPreferences:{backgroundThrottling:false}});
 const run=(code)=>win.webContents.executeJavaScript(code,true);
 await win.loadURL('http://127.0.0.1:'+server.address().port+'/play/');
 await new Promise(r=>setTimeout(r,200));
 const results=await run(`(async()=>{
   Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});
   let time=10000; Object.defineProperty(performance,'now',{configurable:true,value:()=>time});
   const out=[], check=(name,value)=>{if(!value)throw Error(name);out.push(name)};
   const wait=()=>new Promise(r=>setTimeout(r,260));
   const install=async(settings={})=>{window.__d2autobot?.destroy();localStorage.setItem('d2autobot:settings',JSON.stringify({version:5,deathProtection:{enabled:false},...settings}));(0,eval)(${JSON.stringify(source)});await wait();game.tick(0.05);time+=70;};
   const tick=()=>{time+=100;game.tick(0.1)};
   const reset=()=>{Object.assign(game,new Game());time+=6000;document.getElementById('paused').classList.add('hidden');};
   const enabled={enabled:true,progressEnabled:true,movement:{enabled:false},loot:{enabled:false},deathProtection:{enabled:false}};
   await install();
   check('預設總開關關閉',JSON.parse(localStorage.getItem('d2autobot:settings')).enabled!==true);
   check('簽名掛接現有模組',__d2autobot.diagnostics().connected && __d2autobot.diagnostics().hookUrl.endsWith('Game-fixture.js'));
   game.state='paused';await wait();check('暫停時左上按鈕',document.getElementById('d2autobot-launcher').style.display==='block');
   document.getElementById('d2autobot-launcher').click();const shadow=document.getElementById('d2autobot-panel').shadowRoot;
   check('設定面板可開啟',!shadow.querySelector('.backdrop').hidden);
   const enabledInput=[...shadow.querySelectorAll('label')].find(e=>e.textContent.includes('戰鬥輔助總開關')).querySelector('[role=switch]');enabledInput.click();
   check('設定寫入獨立儲存鍵',JSON.parse(localStorage.getItem('d2autobot:settings')).enabled===true);
   const storage=()=>JSON.parse(localStorage.getItem('d2autobot:settings'));
   const switches=['enabled','progressEnabled','potion.autoHp','potion.lethalProtection','potion.autoMp','movement.enabled','loot.enabled','terror.progressEnabled','terror.farmEnabled','quest.autoProgress','deathProtection.enabled'];
   for(const setting of switches){
     const button=shadow.querySelector('[data-setting="'+setting+'"]');
     check('明顯開關與可及性 '+setting,button?.getAttribute('role')==='switch'&&['開啟','關閉'].includes(button.textContent));
     const before=button.getAttribute('aria-checked');button.click();
     check('開關立即切換 '+setting,button.getAttribute('aria-checked')!==before);
     button.click();
   }
   shadow.querySelector('[data-setting="terror.progressEnabled"]').click();
   check('推層開關儲存 mode',storage().terror.mode==='progress');
   shadow.querySelector('[data-setting="terror.farmEnabled"]').click();
   check('重刷與推層互斥',storage().terror.mode==='farm'&&shadow.querySelector('[data-setting="terror.progressEnabled"]').getAttribute('aria-checked')==='false');
   shadow.querySelector('[data-setting="terror.farmEnabled"]').click();
   check('重刷關閉立即儲存',storage().terror.mode==='off');
   const emergency=shadow.querySelector('[data-setting="deathProtection.emergencyHpPercent"]');emergency.value='999';emergency.dispatchEvent(new Event('change'));
   check('緊急門檻限制範圍並儲存',storage().deathProtection.emergencyHpPercent===90);
   shadow.getElementById('close').click();game.state='playing';await wait();check('遊玩時隱藏輔助按鈕',document.getElementById('d2autobot-launcher').style.display==='none');
   reset();await install(enabled);game.state='playing';game.world.player.life=30;tick();check('低血量喝水',game.calls.filter(x=>x[0]==='drink').length===1);
   game.world.player.life=30;tick();check('藥水冷卻避免連喝',game.calls.length===1);
   game.state='paused';time+=2000;tick();check('暫停不喝水',game.calls.length===1);
   reset();await install(enabled);game.state='playing';game.world.player.life=90;game.world.hostiles=[{x:-30,y:0,vx:200,vy:0,radius:5,damage:100,life:2}];tick();check('高於門檻仍預警致命傷害',game.calls.some(x=>x[0]==='drink'));
   reset();await install(enabled);game.state='playing';game.world.player.life=90;game.world.projectiles=[{x:-30,y:0,vx:200,vy:0,radius:5,damage:1000}];tick();check('玩家飛彈不觸發致命預警',game.calls.length===0);
   reset();await install(enabled);game.state='playing';game.world.player.life=10;game.world.terror={tier:1,affixes:['nobelt']};tick();check('遵守恐怖禁止藥帶詞綴',game.calls.length===0);
   reset();await install({...enabled,potion:{autoMp:true}});game.state='playing';game.world.mana.mana=10;tick();check('魔力不足使用回復活力藥水',game.calls[0]?.[1]===1 && game.world.mana.mana===100);
   game.world.player.life=10;tick();check('回復活力共用雙池冷卻',game.calls.length===1);
   reset();await install({enabled:true,loot:{enabled:false}});game.state='playing';game.world.hostiles=[{x:-30,y:0,vx:200,vy:0,radius:5,damage:10,life:2}];tick();check('飛彈正面來襲側向閃避',Math.abs(game.walkTarget?.y)>0);
   reset();await install({enabled:true,loot:{enabled:false}});game.state='playing';game.world.hostiles=[{x:-30,y:0,vx:200,vy:0,radius:5,damage:1,life:2}];tick();check('不痛不癢的飛彈不特別閃，但仍保持移動',!!game.walkTarget&&__d2autobot.diagnostics().lastAction.indexOf('閃避')<0);
   reset();await install({enabled:true,loot:{enabled:false}});game.state='playing';game.world.hostiles=[{x:-30,y:0,vx:200,vy:0,radius:5,damage:10,life:2}];tick();
   __d2autobot.stop();check('停止釋放移動目標',game.walkTarget===null);
   reset();await install({version:3,enabled:true,movement:{enabled:false},loot:{qualityThreshold:{normal:false,magic:false}}});game.state='playing';game.world.pickups=[{x:20,y:0,item:{rarity:'magic'}},{x:70,y:0,item:{rarity:'rare'}}];tick();check('品質過濾只追蹤稀有目標',game.walkTarget?.x===70 && game.world.reaching===game.world.pickups[1]);
   __d2autobot.stop();check('釋放原版重建的拾取目標',game.walkTarget===null && game.world.reaching===null);
   reset();await install({enabled:true,progressEnabled:true,movement:{enabled:false},loot:{enabled:false},quest:{autoProgress:true}});game.state='playing';game.search={stones:{logic:{spots:[{x:30,y:10},{x:50,y:20}],lit:[true,false],done:false}}};tick();check('任務石陣追蹤未觸碰位置',game.walkTarget?.x===50);
   reset();await install({...enabled,terror:{mode:'farm',targetFarmTier:2,postClearWaitSec:1}});game.world.terror={tier:2,affixes:[]};game.tierDone={tier:2};game.state='dead';tick();time+=1100;tick();await Promise.resolve();check('固定層數呼叫原版重刷',game.calls.some(x=>x[0]==='replay'&&x[1]===2));check('切關清除舊通關標記',game.tierDone===null);
   reset();await install({...enabled,terror:{mode:'farm',targetFarmTier:3,postClearWaitSec:1}});game.world.terror={tier:2,affixes:[]};game.tierDone={tier:2};game.state='dead';tick();time+=1100;tick();await Promise.resolve();check('不重刷未通關層數',!game.calls.length);check('自動停機不覆蓋使用者儲存的設定',JSON.parse(localStorage.getItem('d2autobot:settings')).enabled===true);
   reset();await install({...enabled,terror:{mode:'progress',postClearWaitSec:1}});game.world.terror={tier:2,affixes:[]};game.tierDone={tier:2};game.state='dead';tick();time+=1100;tick();await Promise.resolve();check('推層選擇可喝水關卡',game.calls.some(x=>x[0]==='terror'&&x[1]===1));
   reset();await install(enabled);game.state='playing';game.world.player.life=10;window.__d2editIsOpen=()=>true;tick();check('修改器開啟時不動作',!game.calls.length);window.__d2editIsOpen=()=>false;
   window.dispatchEvent(new KeyboardEvent('keydown',{code:'F8',key:'F8'}));check('F8 不再切換總開關',JSON.parse(localStorage.getItem('d2autobot:settings')).enabled===true);
   await install(enabled);await install(enabled);check('重載不重複建立介面',document.querySelectorAll('#d2autobot-launcher').length===1);
   reset();await install({...enabled,terror:{mode:'farm',targetFarmTier:2}});game.state='camp';tick();await Promise.resolve();check('營地主動開始固定層數',game.calls.some(x=>x[0]==='replay'));
   reset();await install({...enabled,terror:{mode:'farm',targetFarmTier:2}});game.state='camp';game.save.terror.sorceress.playing=0;tick();check('保留尚未結束的存檔關卡',!game.calls.length);
   reset();await install({...enabled,quest:{autoProgress:true}});game.state='levelUp';document.getElementById('level-up').classList.remove('hidden');let chosen='';const pick=(e)=>{if(e.key==='2')chosen='evolve';else if(e.key==='1')chosen='plain';};window.addEventListener('keydown',pick);document.querySelector('#choices .evolves').onclick=()=>chosen='click-ignored-by-real-game';tick();window.removeEventListener('keydown',pick);check('推進遇到升級優先進化',chosen==='evolve');document.getElementById('level-up').classList.add('hidden');
   reset();await install({...enabled,quest:{autoProgress:true}});game.state='camp';game.camp={};game.kit={id:'sorceress'};let started=null;game.waypointView=()=>({tabs:[{rows:[{start:{kind:'new',difficulty:'normal'},open:true},{start:{kind:'new',difficulty:'nightmare'},open:true},{start:{kind:'new',difficulty:'hell'},open:false}]}]});game.startRun=(k,d)=>{started=d};game.continueRun=()=>{started='continue'};tick();check('全新存檔在營地自動開最高已開放難度',started==='nightmare');
   reset();await install({...enabled,quest:{autoProgress:true}});game.state='camp';game.camp={};game.kit={id:'sorceress'};started=null;game.waypointView=()=>({tabs:[{rows:[{start:{kind:'continue',whose:'hero'},open:true},{start:{kind:'new',difficulty:'normal'},open:true}]}]});game.startRun=(k,d)=>{started=d};game.continueRun=()=>{started='continue'};tick();check('營地有存檔時優先續玩',started==='continue');
   reset();await install({...enabled,quest:{autoProgress:true,farmDifficulty:'normal'}});game.state='camp';game.camp={};game.kit={id:'sorceress'};started=null;game.waypointView=()=>({tabs:[{rows:[{start:{kind:'new',difficulty:'normal'},open:true},{start:{kind:'new',difficulty:'nightmare'},open:true}]}]});game.startRun=(k,d)=>{started=d};tick();check('重複刷固定難度',started==='normal');
   reset();await install({...enabled,quest:{autoProgress:false}});game.state='camp';game.camp={};game.kit={id:'sorceress'};started=null;game.waypointView=()=>({tabs:[{rows:[{start:{kind:'new',difficulty:'normal'},open:true}]}]});game.startRun=(k,d)=>{started=d};tick();check('未開任務推進不自動開局',started===null);
   {const worn={},boots={base:'Boots'},gear=(g)=>{g.equippedOf=()=>worn;g.previewGear=()=>({numbers:{}});g.ownGear=()=>({doll:{slotFor:()=>'boots',canWear:()=>true,displaced:()=>[]}});g.makePlayer=()=>({});g.gearActions=()=>({equip:(it)=>{worn.boots=it}});};
    reset();await install(enabled);game.state='playing';gear(game);game.inventoryOf=()=>[boots];game.heroNumbers=()=>({stats:[{label:'Damage',num:10},{label:'Life',num:50}]});tick();check('空欄位自動穿上裝備',worn.boots===boots);
    const worse={base:'Boots'};reset();await install(enabled);game.state='playing';gear(game);game.inventoryOf=()=>[worse];game.heroNumbers=(p,b,w)=>({stats:[{label:'Damage',num:w.boots===worse?9:10},{label:'Life',num:50}]});tick();check('較差裝備不替換',worn.boots===boots);
    {const charm={base:'Small Charm',type:'charm'};let inv=[charm],placed=null;reset();await install(enabled);game.state='playing';gear(game);game.inventoryOf=()=>inv;game.gearActions=()=>({equip:(it)=>{placed=it;inv=[]}});tick();check('護符自動放入護符格',placed===charm);}
    const better={base:'Boots'};reset();await install(enabled);game.state='playing';gear(game);game.inventoryOf=()=>[better];game.heroNumbers=(p,b,w)=>({stats:[{label:'Damage',num:w.boots===better?12:10},{label:'Life',num:50}]});tick();check('明顯較佳裝備自動替換',worn.boots===better);}
   reset();await install({enabled:true,movement:{enabled:true},loot:{enabled:true}});game.state='playing';game.world.enemies=[{x:30,y:0,rank:'breakable',radius:10}];tick();check('罐子不當敵人且前往踢破',game.walkTarget?.x===30);
   reset();await install({...enabled,movement:{enabled:true},quest:{autoProgress:true}});delete game.search;game.kit={id:'sorceress'};game.state='playing';const thief={x:600,y:0,radius:14,damage:1,rank:'champion',name:'Thief'};game.world.enemies=[{x:-300,y:0,radius:12,damage:1,rank:'actBoss'},thief];game.thiefChase={e:thief};tick();check('盜賊出現優先追擊（朝盜賊方向逐步前進）',game.walkTarget?.x>0);delete game.thiefChase;
   reset();await install({...enabled,movement:{enabled:true},quest:{autoProgress:true}});delete game.search;game.kit={id:'barbarian'};game.build={skills:[{id:'doubleSwing',level:1}]};game.state='playing';game.world.enemies=[{x:150,y:0,radius:12,damage:1}];tick();check('近戰技能（依攻擊距離）不放風箏，朝怪物靠近',game.walkTarget?.x>0);
   reset();await install({...enabled,movement:{enabled:true},quest:{autoProgress:true}});delete game.search;game.kit={id:'sorceress'};game.build={skills:[]};game.state='playing';game.world.enemies=[{x:150,y:0,radius:12,damage:10}];tick();check('遠程職業與怪物保持距離',game.walkTarget?.x<0);
   reset();await install({...enabled,movement:{enabled:true},quest:{autoProgress:true}});delete game.search;game.state='playing';game.world.enemies=[{x:-60,y:0,radius:12,damage:1},{x:400,y:0,radius:20,damage:1,rank:'actBoss'}];tick();check('追目標優先：小怪貼近仍朝頭目前進',game.walkTarget?.x>100);
   {reset();await install({...enabled,quest:{autoProgress:false}});
    const inv=[{base:'Boots',rarity:'magic'}],bought=[],sold=[];game.state='camp';game.camp={};game.world.player.cls='sorceress';
    game.equippedOf=()=>({});game.inventoryOf=()=>inv;game.ownGear=()=>({doll:{slotFor:()=>null,canWear:()=>false}});game.previewGear=()=>({});game.heroNumbers=()=>({stats:[]});game.makePlayer=()=>({});game.gearActions=()=>({equip(){}});
    const wares={store:[{name:'Gold Find',rank:0,maxRank:10,canBuy:true},{name:'Vitality',rank:0,maxRank:10,canBuy:true}],akara:[{name:'Healing Potion',potion:{bought:0},canBuy:true}],stash:[]};
    game.hud={showTown(){}};
    game.openCampTrade=(k)=>{game.state='town';const show=()=>game.hud.showTown(100,wares[k],{buy:(i)=>{const w=wares[k][i];bought.push(w.name);if(w.potion){w.potion.bought++;w.canBuy=w.potion.bought<8;}else{w.rank++;w.canBuy=false;}show();},leave:()=>{game.state='camp'}},{actions:{sell:(it)=>{sold.push(it);inv.splice(inv.indexOf(it),1)},toStash(){},collectAll(){}},view:{stash:{tabs:{},uniques:{},collect:0}}});show();};
    for(let i=0;i<40;i++){tick();time+=300;}
    check('營地整備賣掉用不到的裝備',sold.length===1&&!inv.length);
    check('營地整備買藥水直到腰帶滿',bought.filter(x=>x==='Healing Potion').length===8);
    check('營地整備優先升級生命，核心未滿時存錢不買雜項',bought.includes('Vitality')&&!bought.includes('Gold Find'));
    check('整備結束回到營地',game.state==='camp');}
   reset();await install({enabled:true,movement:{enabled:true},loot:{enabled:false}});game.state='playing';game.world.walls={slide:(x,y,dx,dy)=>({x:x+dx,y:y+dy})};game.world.player.life=40;game.world.enemies=Array.from({length:8},(_,i)=>({x:30*Math.cos(i*Math.PI/4),y:30*Math.sin(i*Math.PI/4),radius:12,damage:i===0?50:1}));tick();check('被包圍無路時穿過怪群遠離最強敵人',game.walkTarget?.x<0&&__d2autobot.diagnostics().lastAction.includes('穿過'));
   reset();await install({enabled:true,movement:{enabled:true},loot:{enabled:false}});game.state='playing';game.world.enemies=[{x:500,y:0,radius:20,damage:5,rank:'champion'}];tick();check('精英怪超出攻擊範圍時拉回',game.walkTarget?.x>0);
   reset();await install({...enabled});game.state='playing';game.kit={id:'sorceress'};game.build={unspent:10};const spent={};game.spendStatPoints=(a,n)=>{spent[a]=(spent[a]||0)+n;game.build.unspent-=n};tick();check('依排行榜比例配屬性點（法師主加能量）',spent.energy>=9&&game.build.unspent===0);
   {reset();game.hud={showLevelUp(){}};await install({...enabled,quest:{autoProgress:true}});game.kit={id:'sorceress'};game.state='playing';tick();game.hud.showLevelUp([{title:'Fire Bolt'},{title:'Static Field'}],{},{});game.state='levelUp';const box=document.getElementById('choices'),old=box.innerHTML;box.innerHTML='<button><strong>Fire Bolt</strong></button><button><strong>Static Field</strong></button>';document.getElementById('level-up').classList.remove('hidden');let key='';const kp=(e)=>{key=e.key};window.addEventListener('keydown',kp);time+=1000;tick();window.removeEventListener('keydown',kp);check('依排行榜高手權重選升級卡',key==='2');box.innerHTML=old;document.getElementById('level-up').classList.add('hidden');}
   reset();await install(enabled);game.state='playing';game.world.player.life=90;game.world.hostiles=[{x:-35,y:0,vx:100,vy:0,radius:5,damage:100,life:2}];tick();check('碰撞邊緣提早預測傷害',game.calls.length===1);
   // 以下只操作隔離模擬物件，不讀取真實遊戲存檔。
   reset();await install({...enabled,potion:{autoHp:false,lethalProtection:true}});game.state='playing';game.world.player.life=60;game.world.hostiles=[{x:-30,y:0,vx:200,vy:0,radius:5,damage:70,life:2}];tick();check('預判喝水獨立於一般喝水開關',game.calls.some(x=>x[0]==='drink'));
   reset();await install({...enabled,potion:{autoHp:false,lethalProtection:false,autoMp:false}});game.state='playing';game.world.player.life=10;game.world.mana.mana=10;game.world.hostiles=[{x:-30,y:0,vx:200,vy:0,radius:5,damage:70,life:2}];tick();check('關閉所有藥水功能後不喝水',!game.calls.length);
   reset();await install({...enabled,deathProtection:{enabled:false}});game.state='playing';game.world.player.life=20;game.world.belt.columns=[[],[],[],[]];game.world.hostiles=[{x:-30,y:0,vx:200,vy:0,damage:80}];tick();check('死亡保護關閉不離場',!game.calls.some(x=>x[0]==='leave'));
   const protection={...enabled,deathProtection:{enabled:true,disableAutomation:true}};
   reset();await install(protection);game.state='playing';game.world.hostiles=[{x:-30,y:0,vx:200,vy:0,damage:120}];tick();await Promise.resolve();check('滿血仍預估致命且無法補更多時離場',game.calls.some(x=>x[0]==='leave'));
   reset();await install(protection);game.state='playing';game.world.player.life=70;game.world.hostiles=[{x:-30,y:0,vx:200,vy:0,damage:80}];game.drinkFrom=()=>{};tick();await Promise.resolve();check('原版拒絕喝水視為不可用並離場',game.calls.some(x=>x[0]==='leave'));delete game.drinkFrom;

   reset();await install({...protection,terror:{mode:'progress'},quest:{autoProgress:true}});game.state='playing';game.world.player.life=20;game.world.belt.columns=[[],[],[],[]];game.world.hostiles=[{x:-30,y:0,vx:200,vy:0,damage:80}];tick();await Promise.resolve();
   check('無回血藥時立即先暫停再離場',game.state==='camp'&&game.calls.filter(x=>x[0]==='leave').length===1);
   check('死亡保護只在本次關閉總開關，不覆蓋儲存設定',storage().enabled===true);
   check('死亡保護不改寫使用者的推層與任務設定',storage().terror.mode==='progress'&&storage().quest.autoProgress===true);
   tick();tick();check('回城後不立即再進場',game.calls.length===1);
   // 依使用者要求：下次開啟沿用儲存設定，不再因死亡保護而保持關閉。
   reset();await install({...protection,terror:{mode:'farm',targetFarmTier:2},quest:{autoProgress:true},deathProtection:{enabled:true,disableAutomation:false}});game.state='playing';game.world.player.life=20;game.world.belt.columns=[[],[],[],[]];game.world.hostiles=[{x:-30,y:0,vx:200,vy:0,damage:80}];tick();await Promise.resolve();tick();
   check('死亡保護離場後保留設定，可自動繼續推進',storage().enabled===true&&storage().terror.mode==='farm'&&game.calls.some(x=>x[0]==='leave'));
   reset();await install(protection);game.state='playing';game.world.player.life=90;game.world.hostiles=[{x:-30,y:0,vx:200,vy:0,damage:95}];tick();await Promise.resolve();check('可喝水脫險不誤離場',game.calls.some(x=>x[0]==='drink')&&!game.calls.some(x=>x[0]==='leave')&&game.world.player.life===100);
   reset();await install(protection);game.state='playing';game.world.player.life=30;tick();game.world.player.life=10;tick();await Promise.resolve();check('緊急低血量且藥水冷卻觸發',game.calls.some(x=>x[0]==='leave'));
   reset();await install({...protection,deathProtection:{enabled:true,emergencyHpPercent:5}});game.state='playing';game.world.player.life=30;tick();game.world.player.life=10;tick();check('調低緊急門檻即影響判斷',!game.calls.some(x=>x[0]==='leave'));
   reset();await install({version:1,...enabled,terror:{mode:'farm',targetFarmTier:2}});check('舊設定自動補值且保留模式',storage().version===5&&storage().loot.qualityThreshold.magic===true&&storage().terror.mode==='farm');
   reset();await install({...protection,enabled:false});game.state='playing';game.world.belt.columns=[[],[],[],[]];game.world.hostiles=[{x:-30,y:0,vx:200,vy:0,damage:120}];tick();check('總開關關閉也停用死亡保護',!game.calls.length);
   reset();await install(protection);game.state='playing';game.world.player.life=40;game.world.terror={tier:1,affixes:['nobelt']};game.world.hostiles=[{x:-30,y:0,vx:200,vy:0,damage:50}];tick();await Promise.resolve();check('禁藥帶視為無可用回血藥',game.calls.some(x=>x[0]==='leave')&&!game.calls.some(x=>x[0]==='drink'));
   reset();await install(protection);game.state='playing';game.world.enemies=Array.from({length:8},(_,i)=>({x:32*Math.cos(i*Math.PI/4),y:32*Math.sin(i*Math.PI/4),radius:12,damage:1}));tick();await Promise.resolve();check('滿血被圍不誤觸離場',!game.calls.some(x=>x[0]==='leave'));
   reset();await install(protection);game.state='playing';game.world.enemies=Array.from({length:8},(_,i)=>({x:32*Math.cos(i*Math.PI/4),y:32*Math.sin(i*Math.PI/4),radius:12,damage:1}));game.world.player.life=game.world.player.maxLife*0.4;tick();await Promise.resolve();check('被包圍但預估傷害不致死時不離場（只看致死預判）',!(game.calls.some(x=>x[0]==='leave')));
   reset();await install(protection);game.state='playing';game.world.enemies=[{x:-35,y:0,damage:1},{x:-35,y:-15,damage:1},{x:-35,y:15,damage:1}];game.world.walls={slide:(x,y,dx,dy)=>({x:x+dx,y:y+dy})};tick();check('有逃生方向不當作被包圍',!game.calls.some(x=>x[0]==='leave'));
   reset();await install(protection);game.state='playing';game.world.enemies=[{x:-35,y:0,damage:1},{x:-35,y:-15,damage:1},{x:-35,y:15,damage:1}];game.world.walls={slide:(x,y)=>({x,y})};game.world.player.life=game.world.player.maxLife*0.4;tick();await Promise.resolve();check('牆壁阻斷逃生方向但傷害不致死時不離場',!(game.calls.some(x=>x[0]==='leave')));
   delete game.leaveRun;
   reset();await install(protection);game.state='playing';game.world.belt.columns=[[],[],[],[]];game.world.hostiles=[{x:-30,y:0,vx:200,vy:0,damage:120}];game.leaveRun=()=>{throw Error('模擬離場錯誤')};tick();await Promise.resolve();check('離場失敗停止且不宣稱回城',storage().enabled&&__d2autobot.diagnostics().lastAction.includes('離場未確認'));delete game.leaveRun;
   reset();await install(protection);game.state='playing';game.world.belt.columns=[[],[],[],[]];game.world.hostiles=[{x:-30,y:0,vx:200,vy:0,damage:120}];game.leaveRun=()=>{game.calls.push(['leave']);game.state='loading'};tick();tick();check('等待異步回城不重複離場',game.calls.filter(x=>x[0]==='leave').length===1);time+=8100;tick();check('離場逾時明確回報未確認',__d2autobot.diagnostics().lastAction.includes('離場未確認'));delete game.leaveRun;
   reset();await install(protection);game.state='playing';game.world.belt.columns=[[],[],[],[]];game.world.hostiles=[{x:-30,y:0,vx:200,vy:0,damage:120}];game.leaveRun=()=>{game.state='select'};tick();await Promise.resolve();check('回角色選單不冒稱村莊',__d2autobot.diagnostics().lastAction.includes('角色選單'));delete game.leaveRun;
   reset();await install(protection);game.state='playing';game.world.belt.columns=[[],[],[],[]];game.world.hostiles=[{x:-30,y:0,vx:200,vy:0,damage:120}];game.leaveRun=null;const menu=document.getElementById('paused');menu.classList.remove('hidden');menu.innerHTML='<button>放棄本局</button>';menu.querySelector('button').onclick=()=>{game.calls.push(['domLeave']);game.state='camp'};tick();await new Promise(r=>setTimeout(r,30));check('缺少內部離場函式時使用暫停按鈕',game.calls.some(x=>x[0]==='domLeave')&&game.state==='camp');menu.innerHTML='';menu.classList.add('hidden');delete game.leaveRun;
   reset();await install(protection);game.state='playing';game.world.belt.columns=[[],[],[],[]];game.world.hostiles=[{x:-30,y:0,vx:200,vy:0,damage:120}];game.leaveRun=null;tick();await Promise.resolve();check('無離場函式或按鈕時停止並回報',storage().enabled&&__d2autobot.diagnostics().lastAction.includes('離場未確認'));delete game.leaveRun;

   reset();await install(enabled);game.state='playing';Object.defineProperty(game.world,'mana',{configurable:true,get(){throw Error('模擬讀取錯誤')}});const frames=game.ticks;tick();tick();tick();check('連續錯誤停機且原遊戲仍執行',JSON.parse(localStorage.getItem('d2autobot:settings')).enabled===true && !__d2autobot.diagnostics().lastAction.includes('待命') && game.ticks===frames+3);delete game.world.mana;
   __d2autobot.destroy();const entries=performance.getEntriesByType.bind(performance);performance.getEntriesByType=()=>[];document.getElementById('life-text').textContent='20 / 100';let pulses=[];const capture=e=>pulses.push([e.type,e.code]);window.addEventListener('keydown',capture);window.addEventListener('keyup',capture);
   await install({...enabled,potion:{fallbackHpSlot:4}});await wait();check('無掛鉤時讀取HUD模擬指定藥帶鍵',pulses.some(x=>x[0]==='keydown'&&x[1]==='Digit4')&&pulses.some(x=>x[0]==='keyup'&&x[1]==='Digit4'));check('降級模式明確回報掛鉤缺失',!__d2autobot.diagnostics().connected && __d2autobot.diagnostics().hookNote.includes('簽名不相容'));window.removeEventListener('keydown',capture);window.removeEventListener('keyup',capture);performance.getEntriesByType=entries;
   __d2autobot.destroy();check('卸載還原遊戲原型',Game.prototype.tick===originalTick && Game.prototype.steer===originalSteer);check('卸載移除面板',!document.getElementById('d2autobot-panel'));
   return out;
 })()`);
 fs.writeFileSync(process.env.D2AUTOBOT_TEST_RESULT || path.join(require('node:os').tmpdir(),'d2autobot-result.json'),JSON.stringify({passed:results.length,checks:results},null,2));
 console.log('模擬測試通過：'+results.length+' 項');app.exit(0);
})().catch(e=>{fs.writeFileSync(process.env.D2AUTOBOT_TEST_RESULT || path.join(require('node:os').tmpdir(),'d2autobot-result.json'),JSON.stringify({error:e.stack||String(e)}));console.error(e);app.exit(1)});
