// 鑰匙 端到端：修改器「鑰匙」頁把三把各設為 1 → 寫入存檔 → 重載遊戲，檢查存檔內的 pandemonium 與遊戲的 saveFaults。
// 用法：H_IN=editor H_SEED=存檔.json electron craft-live.cjs keys-e2e.js out.json
// 注意：只在隔離設定檔內執行；H_SEED 是複本，不碰使用者的原存檔。
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
const d=document, w=window; w.confirm=()=>true; w.alert=()=>{};
for(let i=0;i<40&&!d.querySelector("nav button");i++) await sleep(500);
await sleep(3000);
const out={};
out.before=JSON.stringify(save.pandemonium??null);
cur="keys"; renderView(); await sleep(300);
out.initialInputs=["pk1","pk2","pk3"].map(c=>d.querySelector(`[data-key="${c}"]`)?.value);
for(const c of ["pk1","pk2","pk3","mbr","dhn","bey"]){ const el=d.querySelector(`[data-key="${c}"]`); el.value="1"; el.dispatchEvent(new w.Event("change",{bubbles:true})); }
await sleep(300);
out.set={pk1:save.pandemonium?.pk1?.length??0,pk2:save.pandemonium?.pk2?.length??0,pk3:save.pandemonium?.pk3?.length??0,mbr:save.pandemonium?.mbr?.length??0,dhn:save.pandemonium?.dhn?.length??0,bey:save.pandemonium?.bey?.length??0};
d.querySelector("#write").click(); await sleep(9000);
out.writeStatus=d.querySelector("#status")?.textContent;
return out;
//=====MAIN
await import("https://nojackno2-ctrl.github.io/d2-survivors-toolkit/d2edit.js?v="+Date.now()); await new Promise(r=>setTimeout(r,4000));
const sv=JSON.parse(localStorage.getItem("d2-survivors/save/v1"));
const b=window.__d2editBackend;
const pm=sv.pandemonium??null;
const probe={};
for(let i=0;i<30&&!window.__d2autobot?.game;i++) await new Promise(r=>setTimeout(r,1000));
probe.game=!!window.__d2autobot?.game; probe.diag=window.__d2autobot?.diagnostics?.()??null;
probe.bodyClass=document.body.className; probe.title=document.title;
probe.text=(document.body.innerText||"").slice(0,1500);
probe.canvases=document.querySelectorAll("canvas").length;
probe.nodes=[...document.querySelectorAll("[data-action],[data-view],[data-screen],[data-class]")].slice(0,30).map(x=>x.tagName+"|"+x.className+"|"+(x.dataset?JSON.stringify(x.dataset):"")+"|"+x.textContent.trim().slice(0,40));
probe.buttons=[...document.querySelectorAll("button")].map(x=>x.textContent.trim()).slice(0,20);
return { probe,
  pandemonium: pm && {pk1:pm.pk1?.length??0,pk2:pm.pk2?.length??0,pk3:pm.pk3?.length??0,mbr:pm.mbr?.length??0,dhn:pm.dhn?.length??0,bey:pm.bey?.length??0,
    idsValid: ["pk1","pk2","pk3","mbr","dhn","bey"].flatMap(k=>pm[k]??[]).every(s=>/^[\w-]{1,32}$/.test(s))},
  saveFaults: await b.engine("saveFaults", sv),
};
