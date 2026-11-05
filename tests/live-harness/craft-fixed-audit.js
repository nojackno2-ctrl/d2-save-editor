// 固定品質製作稽核（搭配 craft-live.cjs 在官方遊戲頁內執行）：全部暗金／套裝／符文之語（各底材）× 最高／最低／隨機值／隨機選項／固有加成／法杖技能／無形，
// 逐一以 fixedBuild 製作，並用遊戲 faults 與修改器 validateItems 檢查；另驗證超出範圍被拒絕。用法：electron craft-live.cjs craft-fixed-audit.js out.json
const b=window.__d2editBackend, E=(...a)=>b.engine(...a);
const cat=(await E("catalog")).filter(x=>!x.unavailable);
const R={items:0,builds:0,fail:[],rejectedOk:0,rejectedBad:[],tamperCaught:0,tamperMissed:[],withParams:0,withAutos:0,withStaff:0,eth:0,noGroups:0,t0:performance.now()};
const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
async function test(x, base){
  const info=await E("fixedInfo",x.rarity,x.name,base);
  if(info.error){R.fail.push([x.name,base,"info:"+info.error]);return}
  R.items++; if(info.params.length)R.withParams++; if(info.autos)R.withAutos++; if(info.staff)R.withStaff++; if(!info.groups.length)R.noGroups++;
  const specs=[]; const mk=(f)=>({rarity:x.rarity,name:x.name,base:info.base,values:info.groups.map(g=>({idx:g.idx,value:f(g)}))});
  specs.push(mk(g=>g.hi)); specs.push(mk(g=>g.lo)); specs.push(mk(g=>rnd(g.lo,g.hi)));
  for(const p of info.params) for(const o of p.options){ const s=mk(g=>rnd(g.lo,g.hi)); s.params={[p.index]:o.param}; specs.push(s); }
  if(info.autos) info.autos.forEach((a,i)=>{const s=mk(g=>g.hi); s.auto=i; specs.push(s)});
  if(info.staff){ const s=mk(g=>g.hi); s.staff=[{stat:info.staff.options[0],value:3},{stat:info.staff.options.at(-1),value:1}]; specs.push(s); }
  if(info.canEth){ const s=mk(g=>g.hi); s.eth=true; specs.push(s);}
  for(const s of specs){
    const r=await E("fixedBuild",s); R.builds++;
    if(r.error){R.fail.push([x.name,base,r.error]);continue}
    const it=r.item;
    if(s.eth && !it.ethereal) R.fail.push([x.name,base,"eth flag lost"]); else if(s.eth) R.eth++;
    // 值確實寫入
    for(const v of s.values){ for(const i of v.idx) if(it.stats[i].value!==v.value) R.fail.push([x.name,base,"value not applied "+i+" "+it.stats[i].value+"!="+v.value]); }
    const f=(await E("faults",[it]))[0]; if(f) R.fail.push([x.name,base,"fault "+JSON.stringify(f)]);
    const val=(await E("validateItems",[it]))[0]; if(val.length) R.fail.push([x.name,base,"validate "+JSON.stringify(val)]);
  }
  // 超出範圍必須被擋
  for(const g of info.groups.slice(0,2)){ for(const bad of [g.hi+1,g.lo-1]){ const r=await E("fixedBuild",{rarity:x.rarity,name:x.name,base:info.base,values:[{idx:g.idx,value:bad}]}); if(r.error) R.rejectedOk++; else R.rejectedBad.push([x.name,bad]); } }
  // 遊戲自己的檢查要抓得到超出範圍：直接竄改 stats
  const ok=(await E("fixedBuild",mk(g=>g.hi))).item;
  if(info.groups.length){ const g=info.groups[0]; const t=JSON.parse(JSON.stringify(ok)); for(const i of g.idx) t.stats[i].value=g.hi+Math.max(5,Math.ceil(g.hi*0.5)); const f=(await E("faults",[t]))[0]; if(f) R.tamperCaught++; else R.tamperMissed.push([x.name,base]); }
}
const nonRw=cat.filter(x=>x.rarity!=="runeword");
for(const x of nonRw) await test(x,x.base);
const rws=cat.filter(x=>x.rarity==="runeword");
for(const x of rws){ const bs=await E("runewordBases",x.name); R.rwBaseCounts=(R.rwBaseCounts||0)+bs.length; const pick=[...new Set([bs[0],bs[Math.floor(bs.length/2)],bs.at(-1)])]; for(const bn of pick) await test(x,bn); }
R.ms=Math.round(performance.now()-R.t0);
R.fail=R.fail.slice(0,40);
return R;
