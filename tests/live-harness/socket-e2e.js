// 孔數與珠寶 端到端：製作（普通、3 孔、鑲 2 顆珠寶）→ 物品頁改孔數 → 寫入存檔 → 重載遊戲，用遊戲的 faults／saveFaults 檢查。
// 用法：H_IN=editor H_SEED=存檔.json electron craft-live.cjs socket-e2e.js out.json
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
const d=document, w=window; w.confirm=()=>true; w.alert=()=>{};
for(let i=0;i<40&&!d.querySelector("nav button");i++) await sleep(500);
const $=(s)=>d.querySelector(s);
const setv=(el,v)=>{el.value=v;el.dispatchEvent(new w.Event("change",{bubbles:true}));el.dispatchEvent(new w.Event("input",{bubbles:true}))};
await sleep(3000);
const out={steps:[]};
out.unlocked=!!$("#unlockMode")?.checked;
d.querySelector('nav button[data-page="craft"]').click(); await sleep(2500);
const baseName=BASES.find(b=>b.type==="weapon"&&baseSocketCap(b.name)>=4)?.name;
out.base=baseName;
setv($("#xCategory"),"weapon"); await sleep(300); setv($("#xBase"),baseName); await sleep(300); setv($("#xRar"),"normal"); await sleep(2500);
out.sockUi=$("#c-sec-sock").hidden?"hidden":$("#xSock").textContent.slice(0,60);
// 存檔沒有珠寶：用遊戲產生器做 2 顆（魔法、稀有）放進有空位的容器
const gj=await window.api.engine("generateMany",[{rarity:"magic",base:"Jewel"},{rarity:"rare",base:"Jewel"}]);
out.jewelGen=gj.map(x=>x.item?x.item.rarity+":"+x.item.type:JSON.stringify(x).slice(0,80));
let destId=null;
for(const c of containers().filter(x=>!x.grp)){ try{ for(const x of gj){ const it=x.item; it.id=newId(); placeInto(c.id,it);} destId=c.id; break; }catch(e){ /* 下一個容器 */ } }
out.destId=destId; setv($("#xDest"),destId);
out.poolBefore=jewelPool().length; refreshCraftSockets(true);
setv($("#xSock .sk-n"),"3"); await sleep(300);
const js=[...d.querySelectorAll("#xSock .sk-j")]; out.jewelSelects=js.length;
setv(js[0],"0"); setv(js[1],"1"); await sleep(300);
const before=allItems(save).length;
$("#xMake").click(); await sleep(3000);
out.makeStatus=$("#status").textContent;
const made=allItems(save).find(it=>it.base===baseName&&it.sockets===3);
out.made=made?{sockets:made.sockets,socketed:(made.socketed||[]).map(j=>j.id+":"+j.rarity),hasAt:(made.socketed||[]).some(j=>"at" in j)}:null;
out.poolAfter=jewelPool().length; out.itemDelta=allItems(save).length-before;
// 物品頁：把孔數改成 4、第三孔空
if(made){
  const c=containers().find(x=>x.kind!=="slots"&&x.arr&&x.arr().includes(made));
  cur=c.id; sel=c.arr().indexOf(made); refresh(); await sleep(1500);
  out.editUi=$("#e-sock").textContent.slice(0,50);
  setv($("#e-sock .sk-n"),"4"); await sleep(300);
  $("#apply").click(); await sleep(2500);
  out.editStatus=$("#status").textContent;
  out.afterEdit={sockets:made.sockets,n:(made.socketed||[]).length};
  // 超過上限：改稀有後最多 1 孔
  try { setv($("#e-sock .sk-n"),"6"); } catch(e){ out.sixErr=String(e); }
  out.maxOpts=[...d.querySelectorAll("#e-sock .sk-n option")].length-1;
}
$("#write").click(); await sleep(6000); out.writeStatus=$("#status").textContent;
return out;
//=====MAIN
await import("https://nojackno2-ctrl.github.io/d2-survivors-toolkit/d2edit.js?v="+Date.now()); await new Promise(r=>setTimeout(r,4000));
const sv=JSON.parse(localStorage.getItem("d2-survivors/save/v1"));
const all=[]; const walk=(o)=>{ if(Array.isArray(o)) o.forEach(walk); else if(o&&typeof o==="object"){ if(o.rarity&&o.mods&&o.name&&o.socketed&&o.sockets){all.push(o)} for(const v of Object.values(o)) walk(v);} }; walk(sv);
const b=window.__d2editBackend;
const faults=all.length?await b.engine("faults",all):[];
return {socketedItems:all.map((i,k)=>({base:i.base,rarity:i.rarity,sockets:i.sockets,jewels:i.socketed.length,fault:faults[k]})), saveFaults: await b.engine("saveFaults",sv)};
