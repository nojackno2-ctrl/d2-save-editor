const fs=require('node:fs'), assert=require('node:assert/strict');
(async()=>{
 const {boot}=await import('data:text/javascript,'+encodeURIComponent(fs.readFileSync(require('node:path').join(__dirname,'..','engine-page.js'),'utf8')));
 const affixes=JSON.parse(fs.readFileSync(require('node:path').join(__dirname,'..','..','game-data','裝備屬性分析','魔法稀有詞綴.json'),'utf8'));
 let tested=0, composite=0; const failures=[];
 for (const a of affixes) {
  const base={name:'test',type:'gloves',itype:'glov'}, d=a.d2??{}, game={__setData(){},__uniques:[],__sets:[],__runewords:[],__bases:[base],__affixes:[a],__affixApplies:()=>true,__isType:(a,b)=>a===b,__seeded:(_,f)=>f(),__makeAffix:()=>({mods:[]})};
  const engine=boot(game,JSON.stringify({bases:{}})), item={base:'test',type:'gloves',rarity:'magic'};
  const parts=[{stat:a.stat,value:a.max,...(d.length!==undefined?{length:d.length}:{})},...(d.alike??[]).map(stat=>({stat,value:a.max})),...(d.also?[{stat:d.also.stat,value:d.also.max}]:[])];
  if(parts.length>1)composite++;
  const range=engine.statRanges(item).affixByKind[a.kind];
  const label=`${a.kind} ${a.name} ${a.stat}`;
  for(const m of parts) if(!range[m.stat]?.some(([lo,hi])=>m.value>=lo&&m.value<=hi)) failures.push(`${label}: 範圍 ${m.stat}`);
  const errors=engine.validateItems([{...item,mods:parts}])[0]; if(errors.length) failures.push(`${label}: 完整詞綴 ${JSON.stringify(errors)}`);
  for(let i=0;i<parts.length;i++){
   const remaining=parts.filter((_,j)=>j!==i).map(m=>({...m,kind:a.kind}));
   const allowed=engine.allowedStatsMany({...item,requestKind:a.kind},[remaining])[0];
   if(!allowed?.some(m=>m.stat===parts[i].stat)) failures.push(`${label}: 無法選入 ${parts[i].stat}`);
  }
  if (d.alike?.length && a.min !== a.max) {
   const low=parts.map((m,i)=>({...m,value:i<=d.alike.length?a.min:m.value}));
   for(let i=0;i<=d.alike.length;i++){
    const rest=low.filter((_,j)=>j!==i).map(m=>({...m,kind:a.kind}));
    const allowed=engine.allowedStatsMany({...item,requestKind:a.kind},[rest])[0];
    if(!allowed?.some(m=>m.stat===low[i].stat && m.value===a.min)) failures.push(`${label}: 相同數值無法補入 ${low[i].stat}`);
   }
  }
  tested++;
 }
 console.log(JSON.stringify({tested,composite,failures:failures.length,examples:failures.slice(0,30)},null,2));
 if(failures.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
