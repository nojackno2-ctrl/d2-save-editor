// 製作→寫入存檔→重載遊戲 端到端（H_IN=editor H_SEED=存檔.json electron craft-live.cjs craft-fixed-e2e.js out.json）；//=====MAIN 之後在重載後的遊戲頁內以遊戲的 faults／saveFaults 檢查。
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
const d=document, w=window; w.confirm=()=>true; w.alert=()=>{};
for(let i=0;i<40&&!d.querySelector("nav button");i++) await sleep(500);
const $=(s)=>d.querySelector(s);
const setv=(el,v)=>{el.value=v;el.dispatchEvent(new w.Event("change",{bubbles:true}));el.dispatchEvent(new w.Event("input",{bubbles:true}))};
await sleep(3000);
const out={made:[]};
d.querySelector('nav button[data-page="library"]').click(); await sleep(2000);
out.unlocked=!!$("#unlockMode")?.checked;
// 裝備庫：每種品質各做幾件（自訂模式與一般模式）
async function lib(rar,q,mode,n,staff){ setv($("#cRar"),rar); await sleep(500); $("#cQ").value=q; $("#cQ").dispatchEvent(new w.Event("input",{bubbles:true})); await sleep(700);
  const row=$("#cList [data-i]"); if(!row){out.made.push([q,"no row"]);return} row.click(); await sleep(1500);
  setv($("#pMax"),mode); await sleep(2500);
  if(staff){ const ss=$("#pFixed select.fxs"); if(ss){ setv(ss,ss.options[2].value); const sv=$("#pFixed select.fxsv"); setv(sv,"3"); await sleep(1500);} }
  const inp=$("#pFixed input.fxv"); if(mode==="2"&&inp){ setv(inp,inp.min); await sleep(1500);} 
  { const dd=$("#pDest"); if(staff||n>3) setv(dd,dd.options[dd.options.length-1-(staff?0:1)].value); }
  $("#pN").value=n; $("#pMake").click(); await sleep(3500); out.made.push([q,mode,$("#status").textContent]); }
await lib("unique","Annihilus","2",1);
await lib("unique","Hellfire Torch","2",1);
await lib("unique","Ormus","2",1);
await lib("set","Civerb","1",1);
await lib("runeword","Spirit","2",1);
await lib("runeword","Insight","0",1);
await lib("runeword","Call to Arms","2",1);
await lib("runeword","Insight","0",8);
await lib("runeword","Insight","1",3);
await lib("runeword","Breath of the Dying","0",8);
await lib("runeword","Breath of the Dying","2",2,true);
// 訂製頁
d.querySelector('nav button[data-page="craft"]').click(); await sleep(2000);
setv($("#xRar"),"unique"); await sleep(300); setv($("#xCategory"),"charm"); await sleep(300); setv($("#xBase"),"Small Charm"); await sleep(2500);
$("#xMake").click(); await sleep(2500); out.made.push(["craft Small Charm",$("#status").textContent]);
$("#write").click(); await sleep(6000); out.writeStatus=$("#status").textContent;
return out;
//=====MAIN
await import("https://nojackno2-ctrl.github.io/d2-survivors-toolkit/d2edit.js?v="+Date.now()); await new Promise(r=>setTimeout(r,4000));
const raw=localStorage.getItem("d2-survivors/save/v1"); const sv=JSON.parse(raw);
const names=[]; const all=[]; const walk=(o)=>{ if(Array.isArray(o)) o.forEach(walk); else if(o&&typeof o==="object"){ if(o.rarity&&o.mods&&o.name){all.push(o)} for(const v of Object.values(o)) walk(v);} }; walk(sv);
const ours=all.filter(i=>["Annihilus","Hellfire Torch","Ormus' Robes","Civerb's Ward","Spirit","Insight","Call to Arms","Breath of the Dying"].includes(i.name)||/Charm/.test(i.base)&&i.rarity==="unique");
const b=window.__d2editBackend;
const faults=await b.engine("faults",ours);
return {total:all.length, ours:ours.map((i,k)=>({name:i.name,base:i.base,rarity:i.rarity,hasStats:!!i.stats,roll:!!i.roll,mods:i.mods.length,staff:i.mods.filter(m=>m.staff).map(m=>m.stat+"+"+m.value),fault:faults[k]})), sealState:(window.__d2editBackend.sealState? "n/a":"n/a"), saveFaults: await b.engine("saveFaults",sv)};
