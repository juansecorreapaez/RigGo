
/* ===== SOURCE riggo-v5.js (consolidated) ===== */
/* RigGO 5.8 Close Flow + Validation Candidate 1
   V5 product layer: executive analytics, PWA/offline status, release shell and mobile-first navigation.
   Business execution, OPS generation, Supabase and Resend remain on the validated legacy operational core. */
(function(){
'use strict';
const RELEASE='5.8.0-closeflow-validation-reporting-c1';
const BUILD='2026-08-15-2248-C1-FRESH';



const V5_BASE_RENDER=render;
const V5_BASE_LOGIN=renderLogin;
const V5_BASE_HOME=renderHome;
const V5_BASE_ADMIN=renderAdmin;
const V5_BASE_CLOSEOUT=renderCloseout;
const V5_BASE_WIRE_ADMIN=wireAdmin;
const V5_BASE_HYDRATE=typeof hydrateRemote==='function'?hydrateRemote:null;
const V5_BASE_SAVE=typeof save==='function'?save:null;

const V5_CAUSE_LABEL={
  community:'Comunidad / Bloqueos',mobility:'Restricciones de Movilidad',road:'Condiciones de Vía / Locación',
  move_company:'Empresa de Movilización / Transporte',preventive:'Mantenimiento Preventivo',rig_repair:'Reparación Rig / Acceptance',
  weather:'Clima / Tormenta',operator:'Operador / Terceros',hse:'HSE / Restricción Operacional',other:'Otros'
};
const V5_PENDING_KEY='riggo_v5_pending_sync';
const v5Num=n=>Number(n)||0;
const v5Index=(plan,actual)=>{plan=v5Num(plan);actual=v5Num(actual);if(plan<=0||actual<=0)return null;return Math.round(Math.min(100,(plan/actual)*100));};
const v5Pct=(n,d)=>d?Math.round(n/d*100):0;
const v5FlatNet=x=>Number(x.flatHours)||Math.max(0,(v5Num(x.gross)-v5Num(x.net))*24);
const v5LegacyOf=id=>(state.history||[]).find(h=>h.id===id)||null;
const v5CauseLabel=k=>V5_CAUSE_LABEL[k]||k||'Otros';
const v5Escape=typeof enc==='function'?enc:(s=>String(s??''));
const v5Top=()=>requestAnimationFrame(()=>window.scrollTo({top:0,left:0,behavior:'smooth'}));

function v5Post(){
  document.body.className=[...document.body.classList].filter(x=>!x.startsWith('v5-route-')).join(' ');
  document.body.classList.add(`v5-route-${state.auth?.logged?(state.screen||'home'):'login'}`);
  
  const appShell=document.querySelector('.app-shell');if(appShell)appShell.dataset.build=BUILD;
  const sync=document.querySelector('.online-sync');if(sync)sync.title=`RigGO ${RELEASE} · ${BUILD}`;
  v5ObserveSyncBadge();
  v52PolishNavigation();
  v53PolishTools();
  if(state.auth?.logged&&state.screen==='home')document.querySelectorAll('.top-actions [data-global="admin"]').forEach(e=>e.remove());
}


function v53ToolIcon(type){
  const icons={
    search:'<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.5" cy="8.5" r="4.8"/><path d="m12.2 12.2 4 4"/></svg>',
    cut:'<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="6.4"/><path d="M10 6.2v4.2l2.7 1.7"/></svg>',
    move:'<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3.2 6h11.2M11.5 3.1 14.6 6l-3.1 2.9M16.8 14H5.6M8.5 11.1 5.4 14l3.1 2.9"/></svg>'
  };return icons[type]||icons.search;
}
function v53PolishTools(){
  const map={v3GlobalSearch:['search','Buscar'],v3EditCut:['cut','Corte'],v3ChangeMove:['move','Move'],changeMove:['move','Cambiar Move']};
  for(const [id,[type,label]] of Object.entries(map)){
    const b=document.getElementById(id);if(!b||b.dataset.v53Polished)return;
    b.dataset.v53Polished='1';b.classList.add('v53-tool-btn');
    b.innerHTML=`<span class="v53-tool-icon">${v53ToolIcon(type)}</span><span>${label}</span>`;
  }
}
function v52PolishNavigation(){
  const chevron=(dir='right')=>`<svg viewBox="0 0 20 20" aria-hidden="true"><path d="${dir==='left'?'m12.5 4.5-5 5.5 5 5.5':'m7.5 4.5 5 5.5-5 5.5'}"/></svg>`;
  const prev=document.getElementById('v3Prev');if(prev){prev.classList.add('v52-nav-btn');prev.innerHTML=`<span class="v52-nav-icon">${chevron('left')}</span><span>Anterior</span>`}
  const next=document.getElementById('v3Next');if(next){next.classList.add('v52-nav-btn');next.innerHTML=`<span>Siguiente</span><span class="v52-nav-icon">${chevron('right')}</span>`}
  const back=document.getElementById('v3BackDays');if(back){const label=back.textContent.replace(/^\s*[←‹]\s*/, '').trim();back.classList.add('v52-nav-btn');back.innerHTML=`<span class="v52-nav-icon">${chevron('left')}</span><span>${v5Escape(label)}</span>`}
}

renderLogin=function(){
  V5_BASE_LOGIN();
  const wrap=document.querySelector('.v4-login')||document.querySelector('.v3-login');
  if(wrap){wrap.classList.add('v5-login','v51-login','v52-login');wrap.dataset.build=BUILD;}
  const stripe=document.querySelector('.v4-login-stripe');
  if(stripe){
    stripe.classList.add('v52-login-stripe');
    stripe.innerHTML='<span>PLANIFICACIÓN</span><i aria-hidden="true">•</i><span>EJECUCIÓN DIARIA</span><i aria-hidden="true">•</i><span>REVISIÓN HISTÓRICA</span>';
    stripe.setAttribute('aria-label','Planificación, Ejecución diaria, Revisión histórica');
  }
};
function v52Icon(type){
  const icons={
    plan:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3.5h10a2 2 0 0 1 2 2v15H5v-15a2 2 0 0 1 2-2Z"/><path d="M8.5 8h7M8.5 12h7M8.5 16h4.5"/></svg>',
    execute:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 17.5h11.5M4 6.5h8.5M13 3l3.5 3.5L13 10M16 14l4 3.5-4 3.5"/></svg>',
    overall:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19.5h16M6.5 16V11M12 16V5.5M17.5 16V8.5"/></svg>',
    admin:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.4 11.3a3.4 3.4 0 1 0 0-6.8 3.4 3.4 0 0 0 0 6.8ZM3.5 19.5v-2.2c0-2.2 2.2-3.9 4.9-3.9s4.9 1.7 4.9 3.9v2.2M17.6 8.4v7.2M14 12h7.2"/></svg>'
  };return icons[type]||icons.overall;
}
function v52Chevron(){return '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m7.5 4.5 5 5.5-5 5.5"/></svg>'}
renderHome=function(){
  const cards=[];
  if(hasPerm('plan'))cards.push(['plan','PLAN','Cargar Plan','Configura baseline, alcance y recursos']);
  if(hasPerm('execute'))cards.push(['execute','CAMPO','Ejecutar Move','Opera la jornada y reporta el avance']);
  if(hasPerm('overall'))cards.push(['overall','CONTROL','Performance','Desempeño, histórico y Flat Time']);
  if(hasPerm('admin'))cards.push(['admin','ADMIN','Administración','Usuarios, permisos y Moves']);
  return `<section class="v5-home v51-home v52-home" data-actions="${cards.length}">
    <div class="v52-home-scene" aria-hidden="true"><img src="./assets/riggo-home-overhead.webp" alt=""><div class="v52-home-shade"></div></div>
    <div class="v52-home-content">
      <div class="v52-home-copy">
        <div class="v52-kicker"><span></span>RIGGO · OPERATIONS EXCELLENCE</div>
        <h1>Planifica.<br>Ejecuta.<br><span>Controla.</span></h1>
        <p>Cada Rig Move, desde el plan hasta la aceptación, en un solo registro operacional.</p>
      </div>
      <div class="v52-action-deck count-${cards.length}">
        ${cards.map((c,i)=>`<button class="v52-module" data-module="${c[0]}"><span class="v52-module-icon">${v52Icon(c[0])}</span><span class="v52-module-copy"><span class="v52-module-code">${String(i+1).padStart(2,'0')} · ${c[1]}</span><strong>${c[2]}</strong><small>${c[3]}</small></span><span class="v52-module-chevron">${v52Chevron()}</span></button>`).join('')}
      </div>
    </div>
  </section>`;
};
render=function(){const r=V5_BASE_RENDER();requestAnimationFrame(v5Post);return r;};

/* ---------- historical rows ---------- */
function v5FallbackHistoryRows(){
  const out=[],seen=new Set(),excluded=new Set((state.moves||[]).filter(m=>m.management?.deletedAt).map(m=>m.id));
  for(const m of state.moves||[]){
    const mg=m.management||{};if(mg.deletedAt)continue;
    if(mg.source==='Legacy'&&m.legacySummary){const l=m.legacySummary;out.push({id:m.id,rig:m.meta?.rig||'',operator:m.meta?.operator||'',origin:m.meta?.origin||'',destination:m.meta?.destination||'',distance:v5Num(m.meta?.distanceKm),company:m.meta?.moveCompany||'',plan:v5Num(l.plan),gross:v5Num(l.gross),net:v5Num(l.net)||v5Num(l.gross),actualDays:v5Num(l.actualDays)||v5Num(l.gross),flatHours:v5Num(l.flatTimeHours),acceptance:m.exec?.actualAcceptance||'',release:m.exec?.actualRelease||'',type:mg.type||'Real',source:'Legacy',rm:l.rm||'',scopeGrowth:0,move:m});seen.add(m.id);continue}
    if(m.status==='closed'&&m.exec?.actualRelease&&m.exec?.actualAcceptance){try{const x=closeoutHistoryRow(m);out.push({id:m.id,rig:x.rig,operator:x.operator||'',origin:m.meta?.origin||'',destination:m.meta?.destination||'',distance:v5Num(x.distance),company:x.company||'',plan:v5Num(x.plan),gross:v5Num(x.gross),net:v5Num(x.net),actualDays:v5Num(x.gross),flatHours:typeof historyNetFlatHours==='function'?historyNetFlatHours(x):Math.max(0,(v5Num(x.gross)-v5Num(x.net))*24),acceptance:m.exec.actualAcceptance,release:m.exec.actualRelease,type:mg.type||'Real',source:'RigGO',rm:m.performanceLead||m.access?.assignedEmails?.[0]||'',scopeGrowth:v5Num(x.scopeGrowth?.g||x.scopeGrowth),move:m});seen.add(m.id)}catch(_){}}
  }
  for(const x of state.history||[]){if(seen.has(x.id)||excluded.has(x.id))continue;out.push({id:x.id,rig:x.rig||'',operator:x.operator||'',origin:x.origin||'',destination:x.destination||'',distance:v5Num(x.distance),company:x.company||'',plan:v5Num(x.plan),gross:v5Num(x.gross),net:v5Num(x.net)||v5Num(x.gross),actualDays:v5Num(x.actualDays)||v5Num(x.gross),flatHours:v5Num(x.flatHours)||Math.max(0,(v5Num(x.gross)-v5Num(x.net))*24),acceptance:x.acceptance||'',release:x.release||'',type:x.type||'Real',source:x.source||'Legacy',rm:x.rm||'',scopeGrowth:v5Num(x.scopeGrowth?.g||x.scopeGrowth),move:null})}
  return out;
}
function v5Rows(){
  const base=(window.RigGOV4Test?.realRows?window.RigGOV4Test.realRows():v5FallbackHistoryRows());
  return base.map(x=>{
    const legacy=v5LegacyOf(x.id),move=x.move||null;
    const flatBreakdown=legacy?.flat?{...legacy.flat}:v5MoveFlat(move);
    const rigType=legacy?.rigType||move?.meta?.rigType||'';
    const grossIndex=v5Index(x.plan,x.gross),netIndex=v5Index(x.plan,x.net);
    const completeness=v5Completeness(x,legacy,move);
    return {...x,legacy,flatBreakdown,rigType,grossIndex,netIndex,completeness};
  });
}
function v5MoveFlat(m){
  const out={};if(!m)return out;
  for(const c of Object.values(m.exec?.closures||{}))for(const e of c.flatEvents||[]){const k=e.type||'other';out[k]=(out[k]||0)+eventHours(e)}
  return out;
}
function v5Completeness(x,legacy,move){
  const checks=[!!x.rig,!!x.operator,!!x.company,x.distance>0,x.plan>0,x.gross>0,x.net>0,!!(legacy?.rigType||move?.meta?.rigType),!!(x.origin&&x.destination),!!(x.release||x.acceptance)];
  return Math.round(checks.filter(Boolean).length/checks.length*100);
}
function v5EventSet(x,field){
  const set=new Set();
  if(field==='cause')Object.entries(x.flatBreakdown||{}).filter(([,v])=>v5Num(v)>0).forEach(([k])=>set.add(v5CauseLabel(k)));
  if(x.move?.exec?.closures){
    for(const c of Object.values(x.move.exec.closures))for(const e of c.flatEvents||[]){if(field==='commercial'&&e.commercial)set.add(e.commercial);if(field==='company'&&e.company)set.add(e.company)}
  }
  return set;
}
function v5FilteredRows(){
  const f=state.filters||{};
  return v5Rows().filter(x=>(f.includeTests||x.type!=='Prueba')&&(!f.source||f.source==='Todos'||x.source===f.source)&&(!f.rig||f.rig==='Todos'||x.rig===f.rig)&&(!f.operator||f.operator==='Todos'||x.operator===f.operator)&&(!f.company||f.company==='Todos'||x.company===f.company)&&(!f.distanceMax||x.distance<=+f.distanceMax)&&(!f.dateFrom||!x.acceptance||new Date(x.acceptance)>=new Date(f.dateFrom+'T00:00'))&&(!f.dateTo||!x.acceptance||new Date(x.acceptance)<=new Date(f.dateTo+'T23:59'))&&(!f.commercial||f.commercial==='Todos'||v5EventSet(x,'commercial').has(f.commercial))&&(!f.flatCause||f.flatCause==='Todos'||v5EventSet(x,'cause').has(f.flatCause))&&(!f.planFilter||f.planFilter==='Todos'||(f.planFilter==='On Plan'?x.gross<=x.plan:x.gross>x.plan)));
}
function v5Aggregate(rows){
  const valid=rows.filter(x=>x.plan>0&&x.gross>0&&x.net>0),sum=k=>valid.reduce((s,x)=>s+v5Num(x[k]),0),plan=sum('plan'),gross=sum('gross'),net=sum('net'),flat=rows.reduce((s,x)=>s+v5FlatNet(x),0),on=valid.filter(x=>x.gross<=x.plan).length;
  return{moves:rows.length,plan,gross,net,flat,onPlanPct:v5Pct(on,valid.length),netVariance:net-plan,grossVariance:gross-plan,extension:valid.reduce((s,x)=>s+Math.max(0,x.gross-x.plan),0),scope:v5Avg(rows.map(x=>v5Num(x.scopeGrowth)))};
}
function v5Avg(arr){return arr.length?arr.reduce((a,b)=>a+b,0)/arr.length:0}
function v5Group(rows,key){
  const g={};
  for(const x of rows){const name=x[key]||'No definido',a=g[name]||(g[name]={name,n:0,plan:0,gross:0,net:0,flat:0,transport:0});a.n++;a.plan+=x.plan;a.gross+=x.gross;a.net+=x.net;a.flat+=v5FlatNet(x);a.transport+=v5Num(x.flatBreakdown?.move_company)}
  return Object.values(g).map(a=>({...a,grossIndex:v5Index(a.plan,a.gross),netIndex:v5Index(a.plan,a.net),variance:a.gross-a.plan})).sort((a,b)=>(b.netIndex||0)-(a.netIndex||0));
}
function v5Distribution(rows){
  const v=rows.filter(x=>x.plan>0).map(x=>x.gross-x.plan),b=[{label:'On Plan',n:v.filter(x=>x<=0).length},{label:'≤ 1 día',n:v.filter(x=>x>0&&x<=1).length},{label:'1–3 días',n:v.filter(x=>x>1&&x<=3).length},{label:'> 3 días',n:v.filter(x=>x>3).length}];
  return `<div class="v5-distribution">${b.map(x=>`<div class="v5-dist"><span>${x.label}</span><b>${x.n}</b><small>${v5Pct(x.n,v.length)}%</small></div>`).join('')}</div>`;
}
function v5Insights(rows){
  if(!rows.length)return['No hay Moves para el filtro seleccionado.'];
  const a=v5Aggregate(rows),netBest=v5Group(rows,'rig').filter(x=>x.netIndex!==null)[0],vendor=v5Group(rows,'company').filter(x=>x.name!=='No definido'&&x.netIndex!==null)[0];
  const out=[`${a.onPlanPct}% de las Moves finalizaron dentro o por debajo del plan bruto.`];
  if(netBest)out.push(`${netBest.name} lidera el Net Execution Index con ${netBest.netIndex}/100.`);
  if(vendor)out.push(`${vendor.name} presenta el mejor Net Execution Index entre las Move Companies filtradas.`);
  return out;
}
function v5InsightHtml(rows){return `<div class="v5-insights">${v5Insights(rows).slice(0,3).map((x,i)=>`<div class="v5-insight"><span>Insight ${String(i+1).padStart(2,'0')}</span><b>${v5Escape(x)}</b></div>`).join('')}</div>`}
function v5Ranking(rows,title,desc=false,limit=6){
  const metric=desc?'grossIndex':'netIndex';
  const r=[...rows].filter(x=>x.plan>0&&x[metric]!==null).sort((a,b)=>desc?(a[metric]-b[metric]):(b[metric]-a[metric])).slice(0,limit);
  return `<div class="v5-section"><div class="v5-section-head"><div><h2>${title}</h2><div class="sub">${desc?'Gross Schedule Index':'Net Execution Index'}</div></div><span class="status gray">${r.length}</span></div><div class="v5-rank-list">${r.map((x,i)=>`<button class="v5-rank-card ${i===0&&!desc?'top1':''}" data-v5-intel="${x.id}"><span class="v5-rank-num">${i+1}</span><span><span class="name">${v5Escape(x.rig)} · ${v5Escape(x.operator||'')}</span><span class="route">${v5Escape((x.origin||'')+(x.origin||x.destination?' → ':'')+(x.destination||''))}</span><span class="v5-rank-meta"><span>Plan ${round(x.plan,1)} d</span><span>Gross ${round(x.gross,1)} d</span><span>Net ${round(x.net,1)} d</span><span>${x.gross-x.plan>0?'+':''}${round(x.gross-x.plan,1)} d</span></span></span><span class="v5-index ${desc?'gross':''}"><b>${x[metric]??'—'}</b><span>${desc?'Gross':'Net'} Index</span></span></button>`).join('')||'<div class="v5-empty">Sin datos.</div>'}</div></div>`;
}
function v5CauseBars(rows){
  const g={};for(const x of rows)for(const [k,v] of Object.entries(x.flatBreakdown||{})){if(v5Num(v)>0)g[v5CauseLabel(k)]=(g[v5CauseLabel(k)]||0)+v5Num(v)}
  const arr=Object.entries(g).sort((a,b)=>b[1]-a[1]).slice(0,10),max=Math.max(1,...arr.map(x=>x[1]));
  if(!arr.length)return'';
  return `<div class="v5-section"><div class="v5-section-head"><div><h2>Flat Time por causa</h2><div class="sub">Horas registradas · histórico disponible</div></div></div><div class="v5-bars">${arr.map(([k,v])=>`<div class="v5-bar-row"><span class="name">${v5Escape(k)}</span><span class="v5-bar-track"><i style="width:${Math.min(100,v/max*100)}%"></i></span><strong>${round(v,1)} h</strong></div>`).join('')}</div></div>`;
}
function v5Heatmap(rows,groupKey='rig'){
  const categories=[...new Set(rows.flatMap(x=>Object.entries(x.flatBreakdown||{}).filter(([,v])=>v5Num(v)>0).map(([k])=>k)))];
  if(!categories.length)return'';
  const labels=groupKey==='company'?v5Group(rows,'company').map(x=>x.name).filter(x=>x!=='No definido'):[...new Set(rows.map(x=>x.rig).filter(Boolean))];
  const matrix=labels.map(label=>{const rr=rows.filter(x=>(groupKey==='company'?x.company:x.rig)===label),vals={};for(const x of rr)for(const [k,v] of Object.entries(x.flatBreakdown||{}))vals[k]=(vals[k]||0)+v5Num(v);return{label,vals}});
  const max=Math.max(1,...matrix.flatMap(r=>categories.map(k=>v5Num(r.vals[k]))));
  return `<div class="v5-section v5-heat-section"><div class="v5-section-head"><div><h2>Flat Time Heatmap</h2><div class="sub">${groupKey==='company'?'Move Company':'Rig'} × causa · horas registradas</div></div></div><div class="v5-heat-scroll"><div class="v5-heat" style="--cols:${categories.length}"><div class="v5-heat-head sticky">${groupKey==='company'?'MOVE COMPANY':'RIG'}</div>${categories.map(k=>`<div class="v5-heat-head" title="${v5Escape(v5CauseLabel(k))}">${v5Escape(v5CauseLabel(k).replace('Empresa de Movilización / Transporte','Move Co.').replace('Restricciones de Movilidad','Movilidad').replace('Comunidad / Bloqueos','Comunidad').replace('Clima / Tormenta','Clima').replace('Reparación Rig / Acceptance','Rig Repair').replace('HSE / Restricción Operacional','HSE'))}</div>`).join('')}${matrix.map(r=>`<div class="v5-heat-label sticky">${v5Escape(r.label)}</div>${categories.map(k=>{const v=v5Num(r.vals[k]),a=v?(.12+.78*v/max):.025;return `<div class="v5-heat-cell" style="--heat:${a}" title="${v5Escape(r.label)} · ${v5Escape(v5CauseLabel(k))}: ${round(v,1)} h"><b>${v?round(v,0):'—'}</b></div>`}).join('')}`).join('')}</div></div></div>`;
}
function v5Compare(rows){
  const r=rows.filter(x=>x.plan>0).slice(0,12),max=Math.max(1,...r.flatMap(x=>[x.plan,x.gross,x.net]));
  if(!r.length)return'';
  return `<div class="v5-section"><div class="v5-section-head"><div><h2>Plan vs Gross vs Net</h2><div class="sub">Días por Move</div></div></div><div class="v5-compare">${r.map(x=>`<div class="v5-compare-row"><span class="rig">${v5Escape(x.rig)}</span><span class="v5-compare-tracks"><span class="v5-compare-track plan"><i style="width:${x.plan/max*100}%"></i></span><span class="v5-compare-track gross"><i style="width:${x.gross/max*100}%"></i></span><span class="v5-compare-track net"><i style="width:${x.net/max*100}%"></i></span></span><span class="value">${round(x.net,1)} d</span></div>`).join('')}</div><div class="tiny muted" style="margin-top:10px">Azul Plan · Ámbar Gross · Verde Net</div></div>`;
}
function v5Live(){
  const active=(state.moves||[]).filter(m=>{const g=m.management||{};return !g.deletedAt&&!g.archivedAt&&g.source!=='Legacy'&&m.status==='active'&&(state.filters?.includeTests||(g.type||'Real')!=='Prueba')});
  if(!active.length)return'';
  return `<div class="v5-section"><div class="v5-section-head"><div><h2>En ejecución</h2><div class="sub">Live progress</div></div><span class="status good">${active.length}</span></div><div class="v5-live-grid">${active.map(m=>{const p=moveProgressSnapshot(m);return `<button class="v5-live-card" data-v5-live="${m.id}"><div class="rig">${v5Escape(m.meta.rig)}</div><div class="route">${v5Escape(m.meta.origin)} → ${v5Escape(m.meta.destination)}</div><div class="v5-live-progress"><div><span>Rig Down</span><b>${p.rd}%</b></div><div><span>Move</span><b>${p.rm}%</b></div><div><span>Rig Up</span><b>${p.ru}%</b></div></div></button>`}).join('')}</div></div>`;
}
function v5PerfSection(rows,key,title,extra=false){
  const g=v5Group(rows,key).filter(x=>x.name!=='No definido').slice(0,10);
  return `<div class="v5-section"><div class="v5-section-head"><div><h2>${title}</h2><div class="sub">Comparación por ejecución</div></div><span class="status gray">${g.length}</span></div><div class="v5-perf-list">${g.map(x=>`<div class="v5-perf-card"><h3>${v5Escape(x.name)}</h3><div class="v5-perf-indexes"><div class="net"><span>Net Execution</span><b>${x.netIndex??'—'}</b></div><div class="gross"><span>Gross Schedule</span><b>${x.grossIndex??'—'}</b></div></div><div class="v5-perf-foot"><div><span>Moves</span><b>${x.n}</b></div><div><span>Variance</span><b>${x.variance>0?'+':''}${round(x.variance,1)} d</b></div><div><span>${extra?'FT transporte':'Flat Time'}</span><b>${round(extra?x.transport:x.flat,1)} h</b></div></div></div>`).join('')||'<div class="v5-empty">Sin datos.</div>'}</div></div>`;
}
function v5RMSection(rows){const have=rows.filter(x=>x.rm);if(!have.length)return'';return v5PerfSection(have,'rm','Performance por Rig Manager')}
function v5History(rows){
  return `<div class="v5-section"><div class="v5-section-head"><div><h2>Histórico</h2><div class="sub">RigGO Live + Legacy</div></div><span class="status gray">${rows.length}</span></div><div class="v5-history-desktop"><table class="v5-history-table"><tr><th>Rig</th><th>Operator</th><th>Move Company</th><th>Source</th><th>Plan</th><th>Gross</th><th>Net</th><th>Flat</th><th>Gross Index</th><th>Net Index</th><th>Data</th><th></th></tr>${rows.map(x=>`<tr><td><b>${v5Escape(x.rig)}</b></td><td>${v5Escape(x.operator||'—')}</td><td>${v5Escape(x.company||'—')}</td><td><span class="v5-source ${x.source==='RigGO'?'riggo':''}">${x.source}</span></td><td>${round(x.plan,1)} d</td><td>${round(x.gross,1)} d</td><td>${round(x.net,1)} d</td><td>${round(v5FlatNet(x),1)} h</td><td>${x.grossIndex??'—'}</td><td><b>${x.netIndex??'—'}</b></td><td>${x.completeness}%</td><td><button class="btn small" data-v5-intel="${x.id}">Detalle</button></td></tr>`).join('')}</table></div><div class="v5-history-mobile">${rows.map(x=>`<button class="v5-history-card" data-v5-intel="${x.id}"><div class="head"><span><span class="rig">${v5Escape(x.rig)}</span><span class="operator">${v5Escape(x.operator||'—')} · ${v5Escape(x.company||'—')}</span></span><span class="v5-source ${x.source==='RigGO'?'riggo':''}">${x.source}</span></div><span class="route">${v5Escape(x.origin||'Ruta no disponible')}${x.destination?' → '+v5Escape(x.destination):''}</span><div class="stats"><div><span>Plan</span><b>${round(x.plan,1)} d</b></div><div><span>Gross</span><b>${round(x.gross,1)} d</b></div><div><span>Net</span><b>${round(x.net,1)} d</b></div><div><span>Flat</span><b>${round(v5FlatNet(x),0)} h</b></div></div><div class="indexes"><span>Gross <b>${x.grossIndex??'—'}</b></span><span>Net <b>${x.netIndex??'—'}</b></span><span>Data <b>${x.completeness}%</b></span></div></button>`).join('')||'<div class="v5-empty">Sin datos.</div>'}</div></div>`;
}

/* ---------- Filters ---------- */
function v5FilterCount(){const f=state.filters||{};return ['rig','operator','company','source','planFilter','commercial','flatCause'].filter(k=>f[k]&&f[k]!=='Todos').length+['distanceMax','dateFrom','dateTo'].filter(k=>f[k]).length+(f.includeTests?1:0)}
function v5FilterValues(){const all=v5Rows(),uniq=a=>['Todos',...new Set(a.filter(Boolean))];return{rigs:uniq(all.map(x=>x.rig)),ops:uniq(all.map(x=>x.operator)),companies:uniq(all.map(x=>x.company)),causes:['Todos',...new Set(all.flatMap(x=>Object.entries(x.flatBreakdown||{}).filter(([,v])=>v5Num(v)>0).map(([k])=>v5CauseLabel(k))))]}}
function v5FilterGrid(prefix){
  const f=state.filters||{},v=v5FilterValues(),wrap=(lab,html)=>`<label><span>${lab}</span>${html}</label>`;
  const opt=(arr,val)=>arr.map(x=>`<option ${val===x?'selected':''}>${v5Escape(x)}</option>`).join('');
  return `<div class="v5-filter-grid">${wrap('Rig',`<select id="${prefix}Rig" class="field">${opt(v.rigs,f.rig||'Todos')}</select>`)}${wrap('Operator',`<select id="${prefix}Operator" class="field">${opt(v.ops,f.operator||'Todos')}</select>`)}${wrap('Move Company',`<select id="${prefix}Company" class="field">${opt(v.companies,f.company||'Todos')}</select>`)}${wrap('Fuente',`<select id="${prefix}Source" class="field">${opt(['Todos','RigGO','Legacy'],f.source||'Todos')}</select>`)}${wrap('Plan',`<select id="${prefix}Plan" class="field">${opt(['Todos','On Plan','Off Plan'],f.planFilter||'Todos')}</select>`)}${wrap('Flat Time Cause',`<select id="${prefix}Cause" class="field">${opt(v.causes,f.flatCause||'Todos')}</select>`)}${wrap('Distancia máx.',`<input id="${prefix}Distance" class="field" type="number" placeholder="km" value="${v5Escape(f.distanceMax||'')}">`)}${wrap('Desde',`<input id="${prefix}From" class="field" type="date" value="${v5Escape(f.dateFrom||'')}">`)}${wrap('Hasta',`<input id="${prefix}To" class="field" type="date" value="${v5Escape(f.dateTo||'')}">`)}<label class="checkbox"><input id="${prefix}Tests" type="checkbox" ${f.includeTests?'checked':''}> Incluir pruebas</label></div>`;
}
function v5BindFilters(prefix,rerender=true){const map=[['Rig','rig'],['Operator','operator'],['Company','company'],['Source','source'],['Plan','planFilter'],['Cause','flatCause'],['Distance','distanceMax'],['From','dateFrom'],['To','dateTo']];map.forEach(([id,k])=>$(prefix+id)?.addEventListener('change',e=>{state.filters[k]=e.target.value;save();if(rerender){render();v5Top()}}));$(prefix+'Tests')?.addEventListener('change',e=>{state.filters.includeTests=e.target.checked;save();if(rerender){render();v5Top()}})}
function v5OpenFilters(){
  sheetRoot.innerHTML=`<div class="sheet-backdrop"><div class="sheet"><div class="sheet-handle"></div><div class="row between"><div><h2>Filtros</h2><div class="sheet-sub">Vista General</div></div><button id="v5ClearFilters" class="btn small">Limpiar</button></div><div style="margin-top:12px">${v5FilterGrid('v5s')}</div><div class="sheet-footer"><button id="v5CancelFilters" class="btn">Cancelar</button><button id="v5ApplyFilters" class="btn primary">Aplicar</button></div></div></div>`;
  v5BindFilters('v5s',false);$('v5ClearFilters').onclick=()=>{Object.assign(state.filters,{rig:'Todos',operator:'Todos',company:'Todos',source:'Todos',planFilter:'Todos',commercial:'Todos',flatCause:'Todos',distanceMax:'',dateFrom:'',dateTo:'',includeTests:false});save();closeSheet();render();v5Top()};$('v5CancelFilters').onclick=()=>{closeSheet();render()};$('v5ApplyFilters').onclick=()=>{closeSheet();render();v5Top()};
}

/* ---------- Command center ---------- */
renderOverall=function(){
  const rows=v5FilteredRows(),a=v5Aggregate(rows),tab=state.overallTab||'executive';
  const head=`<div class="v5-command-head"><div><div class="eyebrow">RIGGO · OPERATIONAL INTELLIGENCE</div><h1>Vista General</h1><div class="sub">Executive Command Center</div></div><div class="v5-tabs"><button class="${tab==='executive'?'active':''}" data-v5-tab="executive">Overview</button><button class="${tab==='performance'?'active':''}" data-v5-tab="performance">Performance</button><button class="${tab==='history'?'active':''}" data-v5-tab="history">Histórico</button></div></div>`;
  const filters=`<button id="v5OpenFilters" class="v5-filter-button">Filtros <span>${v5FilterCount()?v5FilterCount()+' activos':'Todos'}</span></button><div class="v5-filter-desktop">${v5FilterGrid('v5d')}</div>`;
  let body='';
  if(tab==='executive'){
    body=`<div class="v5-kpis-primary"><div class="v5-kpi info"><span>Total Moves</span><b>${a.moves}</b><small>Filtro actual</small></div><div class="v5-kpi good"><span>Moves On Plan</span><b>${a.onPlanPct}%</b><small>Gross ≤ Plan</small></div><div class="v5-kpi ${a.netVariance>0?'warn':'good'}"><span>Net Variance</span><b>${a.netVariance>0?'+':''}${round(a.netVariance,1)} d</b><small>Net − Plan</small></div><div class="v5-kpi warn"><span>Flat Time</span><b>${round(a.flat,1)} h</b><small>Tiempo neto excluido</small></div></div><div class="v5-mini-kpis"><div class="v5-mini-kpi"><span>Planned Days</span><b>${round(a.plan,1)}</b></div><div class="v5-mini-kpi"><span>Gross Days</span><b>${round(a.gross,1)}</b></div><div class="v5-mini-kpi"><span>Net Days</span><b>${round(a.net,1)}</b></div><div class="v5-mini-kpi"><span>Extension Days</span><b>${round(a.extension,1)}</b></div><div class="v5-mini-kpi"><span>Scope Growth</span><b>+${round(a.scope,1)}</b></div></div>${v5Live()}<div class="v5-section"><div class="v5-section-head"><div><h2>Schedule distribution</h2><div class="sub">Gross actual versus plan</div></div></div>${v5Distribution(rows)}</div>${v5InsightHtml(rows)}<div class="v5-dashboard-grid">${v5Ranking(rows,'Moves más alineadas con el Plan',false,6)}${v5Ranking(rows,'Mayor oportunidad',true,5)}</div><div class="v5-dashboard-grid">${v5Compare(rows)}${v5CauseBars(rows)}</div>${v5Heatmap(rows,'rig')}`;
  }else if(tab==='performance'){
    body=`<details class="v5-formula"><summary>Cómo se calculan los índices</summary><p><b>Gross Schedule Index</b> = min(100, Plan ÷ Gross Actual × 100). Mide el impacto total al calendario. <b>Net Execution Index</b> = min(100, Plan ÷ Net Actual × 100). Descuenta el Flat Time disponible y se usa como lectura principal de ejecución. No se asigna Rig Manager a históricos donde el dato no existe.</p></details><div class="v5-performance-grid">${v5PerfSection(rows,'rig','Performance por Rig')}${v5PerfSection(rows,'operator','Performance por Operator')}${v5PerfSection(rows,'company','Performance por Move Company',true)}${v5RMSection(rows)}</div><div class="v5-dashboard-grid">${v5CauseBars(rows)}${v5Compare(rows)}</div>${v5Heatmap(rows,'company')}`;
  }else body=v5History(rows);
  return `<div class="v5-command">${head}${filters}${body}</div>`;
};
wireOverall=function(){
  document.querySelectorAll('[data-v5-tab]').forEach(b=>b.onclick=()=>{state.overallTab=b.dataset.v5Tab;save();render();v5Top()});
  v5BindFilters('v5d',true);$('v5OpenFilters')?.addEventListener('click',v5OpenFilters);
  document.querySelectorAll('[data-v5-intel]').forEach(b=>b.onclick=()=>v5OpenIntel(b.dataset.v5Intel));
  document.querySelectorAll('[data-v5-live]').forEach(b=>b.onclick=()=>{state.selectedMoveId=b.dataset.v5Live;state.screen='execute';state.execMode='days';save();render();v5Top()});
};
function v5OpenIntel(id){
  const x=v5Rows().find(r=>r.id===id);if(!x)return;
  const causes=Object.entries(x.flatBreakdown||{}).filter(([,v])=>v5Num(v)>0).sort((a,b)=>b[1]-a[1]);
  sheetRoot.innerHTML=`<div class="sheet-backdrop"><div class="sheet wide"><div class="sheet-handle"></div><div class="row between"><div><h2>${v5Escape(x.rig)} · Move Intelligence</h2><div class="sheet-sub">${v5Escape(x.operator||'—')} · ${v5Escape(x.company||'—')}</div></div><span class="v5-source ${x.source==='RigGO'?'riggo':''}">${x.source}</span></div><div class="v5-perf-indexes" style="margin-top:14px"><div class="net"><span>Net Execution Index</span><b>${x.netIndex??'—'}</b></div><div class="gross"><span>Gross Schedule Index</span><b>${x.grossIndex??'—'}</b></div></div><div class="v5-mini-kpis"><div class="v5-mini-kpi"><span>Plan</span><b>${round(x.plan,1)} d</b></div><div class="v5-mini-kpi"><span>Gross</span><b>${round(x.gross,1)} d</b></div><div class="v5-mini-kpi"><span>Net</span><b>${round(x.net,1)} d</b></div><div class="v5-mini-kpi"><span>Flat Time</span><b>${round(v5FlatNet(x),1)} h</b></div><div class="v5-mini-kpi"><span>Data completeness</span><b>${x.completeness}%</b></div></div><div class="v5-section"><div class="v5-section-head"><div><h2>Detalle disponible</h2><div class="sub">Legacy conserva únicamente lo recibido en la fuente histórica</div></div></div><div class="v5-cause-grid">${causes.map(([k,v])=>`<div class="v5-cause-chip"><span>${v5Escape(v5CauseLabel(k))}</span><b>${round(v,1)} h</b></div>`).join('')||'<div class="v5-empty">Sin desglose por causa.</div>'}</div></div>${x.move?`<div class="v5-section"><div class="v5-section-head"><h2>RigGO Live</h2></div><div class="small muted">Release ${fmtDate(x.release,true)} · Acceptance ${fmtDate(x.acceptance,true)} · Scope Growth +${x.scopeGrowth||0}</div></div>`:''}<div class="sheet-footer"><button id="v5CloseIntel" class="btn primary">Cerrar</button></div></div></div>`;
  $('v5CloseIntel').onclick=closeSheet;
}

/* ---------- Closeout presentation ---------- */
renderCloseout=function(){
  return `<div class="v5-closeout">${V5_BASE_CLOSEOUT()}</div>`;
};

/* ---------- Admin release status ---------- */
renderAdmin=function(){
  const html=V5_BASE_ADMIN();
  return `<div class="v5-admin"><div class="v5-admin-build"><span class="status good">Candidate</span><b>RigGO ${RELEASE}</b><span>${BUILD}</span></div>${html}</div>`;
};
wireAdmin=function(){V5_BASE_WIRE_ADMIN();};

/* ---------- Offline-first sync guard ---------- */
function v5ObserveSyncBadge(){
  const badge=document.querySelector('.online-sync');if(!badge||badge.dataset.v5Observed)return;badge.dataset.v5Observed='1';
  new MutationObserver(()=>{const t=badge.textContent||'';if(/Guardado|Online/.test(t))localStorage.removeItem(V5_PENDING_KEY)}).observe(badge,{childList:true,subtree:true,characterData:true});
}
if(V5_BASE_SAVE){
  save=function(){try{localStorage.setItem(V5_PENDING_KEY,'1')}catch(_){};return V5_BASE_SAVE();};
}
if(V5_BASE_HYDRATE){
  hydrateRemote=async function(){
    try{if(navigator.onLine&&localStorage.getItem(V5_PENDING_KEY)==='1'&&typeof save==='function'){save();await new Promise(r=>setTimeout(r,1400));}}catch(_){}
    return V5_BASE_HYDRATE();
  };
}
window.addEventListener('offline',()=>{document.querySelectorAll('.online-sync').forEach(el=>{el.className='online-sync bad';el.textContent='Sin conexión'})});
window.addEventListener('online',()=>{document.querySelectorAll('.online-sync').forEach(el=>{el.className='online-sync busy';el.textContent='Sincronizando…'})});


/* ---------- RigGO 5.5 premium loader + stable iOS viewport ---------- */
const V54_FRAMES=['./assets/loader/frame-01.webp','./assets/loader/frame-02.webp','./assets/loader/frame-03.webp','./assets/loader/frame-04.webp','./assets/loader/frame-05.webp','./assets/loader/frame-06.webp','./assets/loader/frame-07.webp'];
const V54_SEQUENCE=[0,1,2,3,4,5,6,5,4,3,2,1];
let v54FrameTimer=null,v54FrameIndex=0,v54ShowTimer=null,v54ShownAt=0,v54TokenSeq=0,v54ForcedUntil=0;
const v54Tokens=new Set();

/* Stable iOS viewport: never resize the app itself for keyboard or pinch zoom. */
let v54StableViewportH=0,v54StableViewportW=0,v54ViewportRAF=0;
function v54FocusableActive(){const a=document.activeElement;return !!(a&&a.matches?.('input,textarea,select,[contenteditable="true"]'))}
function v54SetStableViewport(force=false){
  const vv=window.visualViewport,scale=Number(vv?.scale||1),w=Math.round(window.innerWidth||document.documentElement.clientWidth||0),h=Math.round(window.innerHeight||document.documentElement.clientHeight||0);
  if(!w||!h)return;
  const widthChanged=Math.abs(w-v54StableViewportW)>24;
  if(force||!v54StableViewportH||(widthChanged&&!v54FocusableActive()&&Math.abs(scale-1)<.025)){
    v54StableViewportW=w;v54StableViewportH=h;
    document.documentElement.style.setProperty('--riggo-vv-height',h+'px');
  }
}
function v54Viewport(){
  cancelAnimationFrame(v54ViewportRAF);v54ViewportRAF=requestAnimationFrame(()=>{
    const vv=window.visualViewport,scale=Number(vv?.scale||1);
    /* Pinch zoom changes visualViewport dimensions. Do NOT feed those dimensions back into CSS. */
    if(Math.abs(scale-1)>.025)return;
    const keyboard=v54FocusableActive()&&vv&&v54StableViewportH>0&&(v54StableViewportH-vv.height)>120;
    document.body.classList.toggle('v54-keyboard-open',Boolean(keyboard));
    if(!keyboard)v54SetStableViewport(false);
  });
}
v54SetStableViewport(true);
window.addEventListener('resize',v54Viewport,{passive:true});
window.addEventListener('orientationchange',()=>setTimeout(()=>v54SetStableViewport(true),260),{passive:true});
window.addEventListener('pageshow',()=>setTimeout(()=>v54SetStableViewport(true),80),{passive:true});
window.visualViewport?.addEventListener('resize',v54Viewport,{passive:true});
window.visualViewport?.addEventListener('scroll',v54Viewport,{passive:true});
document.addEventListener('focusin',()=>setTimeout(v54Viewport,60),true);
document.addEventListener('focusout',()=>setTimeout(()=>{document.body.classList.remove('v54-keyboard-open');v54SetStableViewport(false);if(document.body.classList.contains('v5-route-login'))window.scrollTo(0,0)},180),true);

function v54EnsureLoader(){
  let el=document.getElementById('riggoPremiumLoader');if(el)return el;
  el=document.createElement('div');el.id='riggoPremiumLoader';el.className='v54-loader';el.dataset.active='false';
  el.setAttribute('role','status');el.setAttribute('aria-live','polite');el.setAttribute('aria-hidden','true');
  el.innerHTML=`<div class="v54-loader-inner">
    <div class="v54-loader-stage"><img class="v54-loader-frame" id="v54LoaderFrame" src="${V54_FRAMES[0]}" alt=""></div>
    <img class="v54-loader-brand" src="./assets/riggo-logo.png" alt="RigGO">
    <div class="v54-loader-message" id="v54LoaderMessage">Cargando RigGO…</div>
    <div class="v54-loader-sub" id="v54LoaderSub">Sincronizando operación</div>
    <div class="v54-loader-track"><span></span></div>
  </div>`;
  document.body.appendChild(el);
  V54_FRAMES.forEach(src=>{const im=new Image();im.decoding='async';im.src=src});
  return el;
}
function v54AnimateStart(){
  if(v54FrameTimer)return;
  const img=document.getElementById('v54LoaderFrame');if(!img)return;
  v54FrameIndex=0;
  v54FrameTimer=setInterval(()=>{v54FrameIndex=(v54FrameIndex+1)%V54_SEQUENCE.length;img.src=V54_FRAMES[V54_SEQUENCE[v54FrameIndex]]},145);
}
function v54AnimateStop(){if(v54FrameTimer){clearInterval(v54FrameTimer);v54FrameTimer=null}}
function v54Begin(message='Cargando RigGO…',sub='Preparando operación',{delay=170,hold=0}={}){
  const token=++v54TokenSeq;v54Tokens.add(token);const el=v54EnsureLoader();
  const msg=document.getElementById('v54LoaderMessage'),s=document.getElementById('v54LoaderSub');
  if(msg)msg.textContent=message;if(s)s.textContent=sub;
  if(hold>0)v54ForcedUntil=Math.max(v54ForcedUntil,performance.now()+delay+hold);
  clearTimeout(v54ShowTimer);
  v54ShowTimer=setTimeout(()=>{if(!v54Tokens.size)return;el.dataset.active='true';el.setAttribute('aria-hidden','false');v54ShownAt=performance.now();v54AnimateStart()},delay);
  return token;
}
function v54End(token,{min=420}={}){
  v54Tokens.delete(token);if(v54Tokens.size)return;
  clearTimeout(v54ShowTimer);v54ShowTimer=null;
  const el=document.getElementById('riggoPremiumLoader');if(!el)return;
  const now=performance.now();
  const elapsed=v54ShownAt?now-v54ShownAt:9999;
  const wait=Math.max(0,min-elapsed,v54ForcedUntil-now);
  const hide=()=>{if(v54Tokens.size)return;el.dataset.active='false';el.setAttribute('aria-hidden','true');v54AnimateStop();v54ShownAt=0;v54ForcedUntil=0};
  wait>0?setTimeout(hide,wait):hide();
}
window.RigGOLoader={show:(m,s)=>v54Begin(m,s,{delay:0}),hide:t=>v54End(t,{min:300})};

if(typeof login==='function'){
  const V54_BASE_LOGIN=login;
  login=async function(...args){const t=v54Begin('Ingresando a RigGO…','Validando acceso',{delay:0,hold:1250});try{return await V54_BASE_LOGIN.apply(this,args)}finally{v54End(t,{min:1250})}}
}
if(typeof hydrateRemote==='function'){
  const V54_BASE_HYDRATE=hydrateRemote;
  hydrateRemote=async function(...args){const t=v54Begin('Sincronizando RigGO…','Actualizando operación',{delay:260});try{return await V54_BASE_HYDRATE.apply(this,args)}finally{v54End(t,{min:360})}}
}
if(typeof sendDailyReport==='function'){
  const V54_BASE_SEND=sendDailyReport;
  sendDailyReport=async function(...args){const t=v54Begin('Enviando reporte…','Daily Move Update + OPS',{delay:120});try{return await V54_BASE_SEND.apply(this,args)}finally{v54End(t,{min:520})}}
}
if(typeof v4ArchiveClose==='function'){
  const V54_BASE_ARCHIVE=v4ArchiveClose;
  v4ArchiveClose=async function(...args){const t=v54Begin('Cerrando día…','Archivando OPS y sincronizando',{delay:100});try{return await V54_BASE_ARCHIVE.apply(this,args)}finally{v54End(t,{min:520})}}
}
function v54WrapReportEngine(){
  const R=window.RigGOReportV12;if(!R||R.__v54Wrapped||typeof R.generateOpsPdfBlob!=='function')return false;
  const base=R.generateOpsPdfBlob.bind(R);
  R.generateOpsPdfBlob=async function(...args){const t=v54Begin('Preparando OPS…','Generando documento PDF',{delay:120});try{return await base(...args)}finally{v54End(t,{min:480})}};
  R.__v54Wrapped=true;return true;
}
if(!v54WrapReportEngine()){let tries=0;const id=setInterval(()=>{tries++;if(v54WrapReportEngine()||tries>30)clearInterval(id)},250)}

document.addEventListener('click',e=>{
  const b=e.target.closest?.('[data-module],[data-v5-tab],[data-v5-live]');
  if(!b)return;
  const name=b.dataset.module==='overall'?'Abriendo Performance…':b.dataset.module==='execute'?'Abriendo ejecución…':b.dataset.module==='plan'?'Abriendo planificación…':b.dataset.module==='admin'?'Abriendo Administración…':'Cargando vista…';
  const mandatory=Boolean(b.dataset.module);
  const t=v54Begin(name,'Preparando información',mandatory?{delay:0,hold:1250}:{delay:190});
  requestAnimationFrame(()=>requestAnimationFrame(()=>v54End(t,{min:mandatory?1250:220})));
},true);

/* ---------- PWA ---------- */
/* Service Worker registration is owned by RigGO 6.0 in this build. */

window.RigGOV5Test={release:RELEASE,build:BUILD,index:v5Index,rows:v5Rows,aggregate:v5Aggregate,group:v5Group,distribution:v5Distribution};
setTimeout(()=>{try{if(!document.documentElement.classList.contains('riggo-booting'))render()}catch(_){}},120);
})();

/* ===== SOURCE riggo-v56.js (consolidated) ===== */
/* RigGO 5.8 Close Flow + Validation Candidate 1 — release handshake only. */
(function(){
'use strict';
const RELEASE='5.8.0-closeflow-validation-reporting-c1',BUILD='2026-08-15-2248-C1-FRESH';



/* Service Worker registration is owned by RigGO 6.0 in this build. */
window.RigGOV56Test={release:RELEASE,build:BUILD};
})();

/* ===== SOURCE riggo-v58.js (consolidated) ===== */
/* RigGO 5.8 Close Flow + Early Validation + Downward Reporting Curves */
(function(){
'use strict';
const RELEASE='5.8.0-closeflow-validation-reporting-c1';
const BUILD='2026-08-15-2248-C1-FRESH';


function v58ScrollTop(){try{window.scrollTo({top:0,left:0,behavior:'smooth'})}catch(_){window.scrollTo(0,0)}}
function v58CleanErrors(){document.querySelectorAll('.v58-required-error').forEach(x=>x.classList.remove('v58-required-error'));document.querySelector('.v58-validation-banner')?.remove()}
function v58Mark(ids){for(const id of ids){const el=document.getElementById(id);if(el)el.classList.add('v58-required-error')}}
function v58Banner(missing){
  const host=document.querySelector('.v3-report-main');if(!host)return;
  document.querySelector('.v58-validation-banner')?.remove();
  const b=document.createElement('div');b.className='v58-validation-banner';b.textContent='Completa antes de continuar: '+missing.map(x=>x.label).join(', ')+'.';
  const head=host.querySelector('.v3-report-head');head?.insertAdjacentElement('afterend',b);
}
function v58ValidateStep(step,c,p){
  const missing=[];
  if(step===0){try{const fs=flatSummary(c.flatEvents||[],p);if(!fs.valid)missing.push({label:'Flat Time válido',ids:[]})}catch(_){}}
  if(step===2){
    if(!String(c.originOps||'').trim()&&!String(c.destinationOps||'').trim())missing.push({label:'Operación últimas 24 Hrs',ids:['originOps','destinationOps']});
    if(!String(c.next24||'').trim())missing.push({label:'Actividades próximas 24 Hrs',ids:['next24']});
  }
  if(step===3){
    if(!String(c.siteSupervisor||'').trim())missing.push({label:'Supervisor del sitio',ids:['siteSupervisor']});
    if(!String(c.safetyTopic||'').trim())missing.push({label:'Tema de seguridad',ids:['safetyTopic']});
    if(!String(c.safetyUnderstood||'').trim())missing.push({label:'Asistencia y comprensión',ids:['safetyUnderstood']});
  }
  if(step===4){if(!c.signature)missing.push({label:'Firma del supervisor del sitio',ids:['signatureCanvas']})}
  return missing;
}
function v58Block(missing){
  v58CleanErrors();if(!missing.length)return false;
  const ids=missing.flatMap(x=>x.ids||[]);v58Mark(ids);v58Banner(missing);
  const first=ids.map(id=>document.getElementById(id)).find(Boolean);if(first){first.scrollIntoView({behavior:'smooth',block:'center'});if(first.tagName!=='CANVAS')setTimeout(()=>first.focus({preventScroll:true}),250)}
  try{toast('Completa los datos requeridos antes de continuar')}catch(_){ }
  return true;
}

// Enforce required close data at the step where it belongs, instead of waiting until final close.
if(typeof wireReport==='function'){
  const BASE_WIRE_REPORT=wireReport;
  wireReport=function(m,p,c){
    BASE_WIRE_REPORT(m,p,c);
    const next=document.getElementById('v3ReportNext');
    if(next&&!next.dataset.v58Guard){next.dataset.v58Guard='1';next.addEventListener('click',function(e){
      e.preventDefault();e.stopImmediatePropagation();
      try{captureExecText(m,p,c)}catch(_){ }
      const step=Number(c.reportStep)||0,missing=v58ValidateStep(step,c,p);if(v58Block(missing))return;
      v58CleanErrors();c.reportVisited=c.reportVisited||{};c.reportVisited[step]=true;c.reportStep=Math.min(6,step+1);save();render();v58ScrollTop();
    },true)}
    document.querySelectorAll('[data-v3-reportstep]').forEach(btn=>{if(btn.dataset.v58Guard)return;btn.dataset.v58Guard='1';btn.addEventListener('click',function(e){
      const target=Number(btn.dataset.v3Reportstep),step=Number(c.reportStep)||0;if(target<=step)return;
      e.preventDefault();e.stopImmediatePropagation();try{captureExecText(m,p,c)}catch(_){ }
      const missing=v58ValidateStep(step,c,p);if(v58Block(missing))return;
      if(target===step+1||c.reportVisited?.[target]){v58CleanErrors();c.reportVisited=c.reportVisited||{};c.reportVisited[step]=true;c.reportStep=target;save();render();v58ScrollTop()}
    },true)});
  };
}

// After a successful close, go directly to the Daily Move Update. "Volver a la Move" remains the opt-out path.
if(typeof wireReview==='function'){
  const BASE_WIRE_REVIEW=wireReview;
  wireReview=function(){
    BASE_WIRE_REVIEW();
    const m=currentMove?.(),p=selectedPeriod?.(m);if(!m||!p)return;const c=ensureClosure(m,p.id),b=document.getElementById('v4CloseDay');
    if(b&&!b.dataset.v58AfterClose){b.dataset.v58AfterClose='1';b.addEventListener('click',()=>{
      const started=Date.now();const timer=setInterval(()=>{
        if(c.closedAt){clearInterval(timer);try{closeSheet?.()}catch(_){ }state.screen='review';state.reportView='email';c.reportStep=6;save();render();v58ScrollTop();return}
        if(Date.now()-started>30000)clearInterval(timer);
      },100);
    })}
  };
}

// Email progress graphic: same operational convention as the app — 0% at the top, 100% at the bottom.
if(typeof combinedChartSvg==='function'){
  combinedChartSvg=function(m,p){
    const cv=m.plan?.curves||{rd:[],rm:[],ru:[]};
    const series=[['Rig Down',[0,...(cv.rd||[])],actualSeries(m,'rd',p)],['Rig Move',[0,...(cv.rm||[])],actualSeries(m,'rm',p)],['Rig Up',[0,...(cv.ru||[])],actualSeries(m,'ru',p)]];
    const W=920,H=360,cardW=286,gap=16,top=50,plotH=245;
    let out=`<rect width="${W}" height="${H}" rx="18" fill="#f6f8fb"/><text x="28" y="28" fill="#26364b" font-family="Arial" font-size="15" font-weight="700">Plan vs Actual · Daily Progress</text><text x="892" y="28" text-anchor="end" fill="#7c899a" font-family="Arial" font-size="10">PLAN · ACTUAL</text>`;
    series.forEach((s,si)=>{const ox=18+si*(cardW+gap),x0=ox+28,x1=ox+cardW-18,y0=top+35,y1=top+plotH,n=Math.max(2,s[1].length,s[2].length),x=i=>x0+i*(x1-x0)/(n-1),y=v=>y0+(Math.max(0,Math.min(100,Number(v)||0))/100)*(y1-y0);out+=`<rect x="${ox}" y="${top}" width="${cardW}" height="${plotH+30}" rx="14" fill="#ffffff" stroke="#dce3eb"/><text x="${ox+16}" y="${top+24}" fill="#26364b" font-family="Arial" font-size="12" font-weight="700">${s[0]}</text>`;[0,50,100].forEach(v=>out+=`<line x1="${x0}" y1="${y(v)}" x2="${x1}" y2="${y(v)}" stroke="#e4e9ef"/><text x="${x0}" y="${y(v)-4}" fill="#9aa6b5" font-family="Arial" font-size="8">${v}%</text>`);const pts=a=>(a||[]).map((v,i)=>`${x(i)},${y(v)}`).join(' ');out+=`<polyline fill="none" stroke="#1769ff" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" points="${pts(s[1])}"/><polyline fill="none" stroke="#15b77e" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round" points="${pts(s[2])}"/>`;s[2].forEach((v,i)=>out+=`<circle cx="${x(i)}" cy="${y(v)}" r="4" fill="#15b77e"/>`)});return out;
  };
}

// Keep release visible and force SW refresh.

/* Service Worker registration is owned by RigGO 6.0 in this build. */
window.RigGOV58={release:RELEASE,build:BUILD,validateStep:v58ValidateStep};
})();

/* ===== SOURCE riggo-v59.js (consolidated) ===== */
/* RigGO 5.9 Operational Hardening Candidate 1
   Integrity first: period gates, idempotent close, progressive validation,
   post-close email choice, evidence layout, and admin rollback/reset. */
(function(){
'use strict';
const RELEASE='5.9.0-operational-hardening-c1';
const BUILD='2026-08-15-2319-C1';


const SB=()=>window.RigGOSupabase;
const isoTime=x=>{const d=new Date(x);return Number.isFinite(d.getTime())?d.getTime():NaN};
const nowMs=()=>Date.now();
function fmtGate(iso){try{return fmtDate(iso,true)}catch(_){return String(iso||'')}}
function dayGate(p,now=nowMs()){
  const s=isoTime(p?.start),e=isoTime(p?.end);
  if(!Number.isFinite(s)||!Number.isFinite(e))return{canExecute:false,canClose:false,state:'invalid',message:'El periodo del día no es válido.'};
  if(now<s)return{canExecute:false,canClose:false,state:'programmed',message:`Este día está programado. Podrás ejecutarlo a partir del ${fmtGate(p.start)}.`};
  if(now<e)return{canExecute:true,canClose:true,state:'in_progress',earlyClose:true,message:`El día está en curso. Puedes cerrarlo administrativamente ahora; el corte operacional se mantiene en ${fmtGate(p.end)}.`};
  return{canExecute:true,canClose:true,state:'ready',earlyClose:false,message:''};
}
function friendlyError(err,p){
  const raw=String(err?.message||err||'');
  if(/daily_periods_move_id_day_index_key|duplicate key|23505/i.test(raw))return `El Día ${p?.index||''} ya existe en RigGO. Se reutilizará el registro existente; vuelve a intentar el cierre.`;
  if(/row-level security|permission|not authorized|403/i.test(raw))return 'No tienes permisos para completar esta operación.';
  if(/network|fetch|connection|Failed to fetch/i.test(raw))return 'No fue posible sincronizar con RigGO. Revisa la conexión e inténtalo nuevamente.';
  return raw||'No fue posible completar la operación.';
}

/* DB period creation is intentionally idempotent. The unique constraint becomes an ally, not a user-facing error. */
async function ensureDbPeriod(m,p,status='open'){
  const db=SB();if(!db)throw new Error('No hay conexión con Supabase.');
  const row={move_id:m.id,day_index:p.index,period_start:p.start,period_end:p.end,status};
  let q=await db.from('daily_periods').upsert(row,{onConflict:'move_id,day_index'}).select('id').single();
  if(!q.error&&q.data?.id)return q.data.id;
  // Defensive fallback for deployments whose PostgREST metadata has not refreshed yet.
  const existing=await db.from('daily_periods').select('id').eq('move_id',m.id).eq('day_index',p.index).maybeSingle();
  if(existing.error)throw existing.error;
  if(existing.data?.id){const u=await db.from('daily_periods').update(row).eq('id',existing.data.id);if(u.error)throw u.error;return existing.data.id}
  throw q.error||new Error('No fue posible crear el periodo diario.');
}
if(window.RigGOReportV12)window.RigGOReportV12.ensureDbPeriod=(m,p)=>ensureDbPeriod(m,p,'closed');


/* Persist destructive admin changes immediately so a reload cannot resurrect stale execution state. */
function sanitizedMovePayload(m){
  const clone=deepClone(m);if(clone.exec)clone.exec.periods=[];
  if(clone.exec?.closures)Object.values(clone.exec.closures).forEach(c=>{if(!c)return;c.photos=[];c.signature='';if(Array.isArray(c.participants))c.participants.forEach(x=>{if(x)x.signature=''})});
  return clone;
}
async function persistMoveNow(m){
  if(window.RigGOV112PersistNowMove)return window.RigGOV112PersistNowMove(m);
  const db=SB();if(!db)return;
  const row={status:m.status==='closed'?'completed':m.status,actual_release:m.exec?.actualRelease||null,actual_acceptance:m.exec?.actualAcceptance||null,settings:{riggo_payload:sanitizedMovePayload(m),format_version:1}};
  const q=await db.from('moves').update(row).eq('id',m.id);if(q.error)throw q.error;
  try{localStorage.removeItem('riggo_v5_pending_sync')}catch(_){}
}

function clearValidation(){document.querySelectorAll('.v58-required-error,.v59-required-error').forEach(x=>x.classList.remove('v58-required-error','v59-required-error'));document.querySelector('.v58-validation-banner')?.remove();document.querySelector('.v59-validation-banner')?.remove()}
function mark(ids=[]){ids.forEach(id=>document.getElementById(id)?.classList.add('v59-required-error'))}
function banner(missing){const host=document.querySelector('.v3-report-main');if(!host)return;document.querySelector('.v59-validation-banner')?.remove();const el=document.createElement('div');el.className='v59-validation-banner';el.textContent='Completa antes de continuar: '+missing.map(x=>x.label).join(', ')+'.';host.querySelector('.v3-report-head')?.insertAdjacentElement('afterend',el)}
function stepMissing(step,c,p){
  const miss=[];
  if(step===0){try{const fs=flatSummary(c.flatEvents||[],p);if(!fs.valid)miss.push({label:'Flat Time válido',ids:[]})}catch(_){}}
  if(step===2){
    if(!String(c.originOps||'').trim()&&!String(c.destinationOps||'').trim())miss.push({label:'Operación últimas 24 Hrs',ids:['originOps','destinationOps']});
    if(!String(c.next24||'').trim())miss.push({label:'Actividades próximas 24 Hrs',ids:['next24']});
  }
  if(step===3){
    if(!String(c.safetyTopic||'').trim())miss.push({label:'Tema de seguridad',ids:['safetyTopic']});
    if(!String(c.safetyUnderstood||'').trim())miss.push({label:'Asistencia y comprensión',ids:['safetyUnderstood']});
  }
  if(step===4){
    if(!String(c.siteSupervisor||'').trim())miss.push({label:'Supervisor del sitio',ids:['siteSupervisor']});
    if(!c.signature)miss.push({label:'Firma del supervisor del sitio',ids:['signatureCanvas']});
  }
  return miss;
}
function blockMissing(missing){clearValidation();if(!missing.length)return false;mark(missing.flatMap(x=>x.ids||[]));banner(missing);const first=missing.flatMap(x=>x.ids||[]).map(id=>document.getElementById(id)).find(Boolean);first?.scrollIntoView?.({behavior:'smooth',block:'center'});try{toast('Completa los datos requeridos antes de continuar')}catch(_){}return true}
function closureMissing(c,p){const v=validateClosure(c,p);return v.ok?[]:(v.missing||[]).map(label=>({label,ids:label==='Supervisor del sitio'?['siteSupervisor']:label==='Firma'?['signatureCanvas']:label==='Operación últimas 24 horas'?['originOps','destinationOps']:label==='Próximas 24 Hrs'?['next24']:[]}))}

/* Replace all report navigation listeners with one progressive-validation source of truth. */
if(typeof wireReport==='function'){
  const BASE=wireReport;
  wireReport=function(m,p,c){
    BASE(m,p,c);
    const next=document.getElementById('v3ReportNext');
    if(next){const n=next.cloneNode(true);next.replaceWith(n);n.addEventListener('click',()=>{try{captureExecText(m,p,c)}catch(_){}const step=Number(c.reportStep)||0;if(blockMissing(stepMissing(step,c,p)))return;clearValidation();c.reportVisited=c.reportVisited||{};c.reportVisited[step]=true;c.reportStep=Math.min(6,step+1);save();render();window.scrollTo(0,0)})}
    document.querySelectorAll('[data-v3-reportstep]').forEach(btn=>{const clone=btn.cloneNode(true);btn.replaceWith(clone);clone.addEventListener('click',()=>{const target=Number(clone.dataset.v3Reportstep),step=Number(c.reportStep)||0;if(target<=step){c.reportStep=target;save();render();return}try{captureExecText(m,p,c)}catch(_){}if(blockMissing(stepMissing(step,c,p)))return;if(target===step+1||c.reportVisited?.[target]){c.reportVisited=c.reportVisited||{};c.reportVisited[step]=true;c.reportStep=target;save();render();window.scrollTo(0,0)}})});
    const openOps=document.getElementById('v3OpenOps');
    if(openOps){const n=openOps.cloneNode(true);openOps.replaceWith(n);n.addEventListener('click',()=>{try{captureExecText(m,p,c)}catch(_){}const missing=closureMissing(c,p);if(blockMissing(missing))return;openReview(m,p,'f0065')})}
  }
}

/* Future days are visible, but execution begins only when the period begins. */
function decorateDayCards(){
  const m=typeof currentMove==='function'?currentMove():null;if(!m||state?.screen!=='execute'||state?.execMode==='day')return;
  const admin=typeof hasPerm==='function'&&hasPerm('admin');
  for(const p of movePeriods(m)){
    const btn=document.querySelector(`[data-v3-day="${p.id}"]`),card=btn?.closest('.v3-day-card');if(!btn||!card)continue;
    const gate=dayGate(p);
    if(!gate.canExecute&&!m.exec.closures?.[p.id]?.closedAt){card.classList.add('v59-future-day');btn.disabled=true;btn.textContent='Disponible '+fmtGate(p.start);if(!card.querySelector('.v59-future-note')){const note=document.createElement('div');note.className='v59-future-note';note.textContent='Programado · aún no inicia el periodo';card.querySelector('.actions')?.before(note)}}
    if(admin&&periodHasAnyState(m,p)){const actions=card.querySelector('.actions');if(actions&&!actions.querySelector('[data-v59-rollback]')){const r=document.createElement('button');r.className='btn small v59-admin-rollback';r.dataset.v59Rollback=String(p.index);r.textContent=`Revertir desde Día ${p.index}`;actions.appendChild(r);r.onclick=()=>confirmRollback(m,p.index)}}
  }
}
function periodHasAnyState(m,p){
  if(m.exec.closures?.[p.id])return true;
  const s=isoTime(p.start),e=isoTime(p.end),inside=t=>Number.isFinite(isoTime(t))&&isoTime(t)>=s&&isoTime(t)<=e;
  return (m.exec.tasksRD||[]).some(x=>inside(x.doneAt))||(m.exec.tasksRU||[]).some(x=>inside(x.doneAt))||(m.exec.loads||[]).some(x=>(x.history||[]).some(h=>inside(h.at)));
}
if(typeof wireExecute==='function'){
  const BASE=wireExecute;
  wireExecute=function(){
    BASE.apply(this,arguments);
    requestAnimationFrame(()=>{
      decorateDayCards();
      const m=typeof currentMove==='function'?currentMove():null;
      if(m&&state?.execMode==='day'){
        const p=selectedPeriod?.(m),gate=p?dayGate(p):null;
        if(gate&&!gate.canExecute){
          document.querySelectorAll('#v3Next,[data-v3-task],[data-v3-load],[data-v3-addtask],#v3AddLoad,[data-v3-progress],#v3OpenOps').forEach(el=>{el.disabled=true;el.setAttribute('aria-disabled','true')});
          const host=document.querySelector('.v3-exec-title');
          if(host&&!document.querySelector('.v59-future-lock')){const note=document.createElement('div');note.className='v59-future-lock';note.innerHTML=`<b>Día programado</b><span>${gate.message}</span>`;host.insertAdjacentElement('afterend',note)}
        }
      }
    })
  };
}

async function archiveClose(m,p,c){
  const gate=dayGate(p);if(!gate.canClose)throw new Error(gate.message);
  if(!c.f0065ReviewedAt)throw new Error('Primero debes revisar el OPS-F0065-S.');
  const validation=validateClosure(c,p);if(!validation.ok)throw new Error('Completa antes de cerrar: '+validation.missing.join(', '));
  const db=SB();if(!db)throw new Error('No hay conexión con Supabase.');
  const pdf=await window.RigGOReportV12.generateOpsPdfBlob(m,p,c);
  const periodId=await ensureDbPeriod(m,p,'closed');c.dbPeriodId=periodId;
  if(!c.opsStoragePath){
    const stamp=new Date().toISOString().replace(/[-:TZ.]/g,'').slice(0,14),safe=String(m.meta.rig||'Rig').replace(/[^a-z0-9_-]+/gi,'_'),filename=`OPS-F0065-S_${safe}_Dia${p.index}_${stamp}.pdf`,path=`${m.id}/periods/${periodId}/reports/${filename}`;
    const up=await db.storage.from('riggo-files').upload(path,pdf,{contentType:'application/pdf',upsert:true,cacheControl:'3600'});if(up.error)throw up.error;c.opsStoragePath=path;
    const q=await db.from('reports').select('version').eq('move_id',m.id).eq('period_id',periodId).eq('report_type','f0065').order('version',{ascending:false}).limit(1);if(q.error)throw q.error;
    const version=(Number(q.data?.[0]?.version)||0)+1,rr=await db.from('reports').insert({move_id:m.id,period_id:periodId,report_type:'f0065',version,storage_path:path,recipients_to:[],recipients_cc:[],status:'generated',generated_by:state.auth.email||null});if(rr.error)throw rr.error;
  }
  c.closedAt=c.closedAt||nowIso();c.closedBy=c.closedBy||state.auth.email;c.reportStep=6;c.reportVisited=c.reportVisited||{};c.reportVisited[5]=true;
  await window.RigGOReportV12.saveClosureRecord(m,p,c,periodId);
  m.audit=m.audit||[];if(!m.audit.some(a=>a.action==='close_day'&&a.period===p.id&&a.at===c.closedAt))m.audit.push({at:c.closedAt,user:state.auth.email,action:'close_day',period:p.id,cutoff:p.cutoffTime,opsStoragePath:c.opsStoragePath});
  save();return true;
}
function closeChoice(m,p,c){
  sheetRoot.innerHTML=`<div class="sheet-backdrop"><div class="sheet"><div class="sheet-handle"></div><div class="v59-close-success"><div class="check">✓</div><h2>Día ${p.index} cerrado</h2><p>El OPS quedó guardado. Puedes enviar ahora el Daily Move Update o volver a la Move y enviarlo después.</p></div><div class="sheet-footer"><button id="v59BackMove" class="btn">Volver a la Move</button><button id="v59EmailNow" class="btn primary">Enviar Daily Move Update</button></div></div></div>`;
  document.getElementById('v59BackMove').onclick=()=>{closeSheet();state.screen='execute';state.execMode='days';state.reportView='f0065';save();render();window.scrollTo(0,0)};
  document.getElementById('v59EmailNow').onclick=()=>{closeSheet();state.screen='review';state.reportView='email';c.reportStep=6;save();render();window.scrollTo(0,0)};
}
if(typeof wireReview==='function'){
  const BASE=wireReview;
  wireReview=function(){
    BASE.apply(this,arguments);
    const m=currentMove?.(),p=selectedPeriod?.(m);if(!m||!p)return;const c=ensureClosure(m,p.id),old=document.getElementById('v4CloseDay');if(!old)return;
    const b=old.cloneNode(true);old.replaceWith(b);
    const initialGate=dayGate(p),initialResult=document.getElementById('v4CloseResult');
    if(!initialGate.canClose&&!c.closedAt){b.disabled=true;b.textContent='Cierre disponible al corte';if(initialResult){initialResult.style.color='#a8c0ff';initialResult.textContent=initialGate.message}}
    b.addEventListener('click',async()=>{const result=document.getElementById('v4CloseResult');try{const gate=dayGate(p);if(!gate.canClose)throw new Error(gate.message);const miss=closureMissing(c,p);if(miss.length)throw new Error('Completa antes de cerrar: '+miss.map(x=>x.label).join(', '));b.disabled=true;b.textContent='Cerrando…';if(result){result.style.color='#a8c0ff';result.textContent='Guardando OPS…'}await archiveClose(m,p,c);if(typeof v4Physical==='function'){const phys=v4Physical(m);if(phys&&!phys.complete&&typeof v4EnsureNextDay==='function'){const later=movePeriods(m).find(x=>x.index>p.index&&!m.exec.closures?.[x.id]?.closedAt);if(!later)v4EnsureNextDay(m,p.index)}}save();if(result){result.style.color='#8ae4ad';result.textContent=`Día ${p.index} cerrado`}closeChoice(m,p,c)}catch(e){const msg=friendlyError(e,p);if(result){result.style.color='#ffafb8';result.textContent=msg}else alert(msg)}finally{if(document.body.contains(b)){b.disabled=false;b.textContent=`Cerrar Día ${p.index}`}}})
  }
}

/* Admin rollback: remove the chosen day and every later operational consequence. */
function resetLoadFrom(load,cutMs){
  load.history=(load.history||[]).filter(h=>isoTime(h.at)<cutMs);
  const find=status=>[...load.history].reverse().find(h=>h.status===status)?.at||null;
  load.loadedAt=find('Cargada');load.transitAt=find('En tránsito');load.positionedAt=find('Posicionada');
}
async function deleteRemoteFromDay(m,fromIndex){
  const db=SB();if(!db)return;
  const q=await db.from('daily_periods').select('id,day_index').eq('move_id',m.id).gte('day_index',fromIndex);if(q.error)throw q.error;const ids=(q.data||[]).map(x=>x.id);
  let paths=[];
  if(ids.length){const rp=await db.from('reports').select('storage_path').in('period_id',ids);if(!rp.error)paths=(rp.data||[]).map(x=>x.storage_path).filter(Boolean);const dr=await db.from('reports').delete().in('period_id',ids);if(dr.error)throw dr.error;const dc=await db.from('daily_closures').delete().in('period_id',ids);if(dc.error)throw dc.error;const dp=await db.from('daily_periods').delete().in('id',ids);if(dp.error)throw dp.error}
  if(paths.length){try{await db.storage.from('riggo-files').remove(paths)}catch(_){}}
}
async function rollbackFromDay(m,fromIndex){ throw new Error('RigGO 12.0: rollback de ejecución retirado.');
  if(!(typeof hasPerm==='function'&&hasPerm('admin')))throw new Error('Esta acción es exclusiva de Administradores.');
  const periods=movePeriods(m),p=periods.find(x=>x.index===fromIndex);if(!p)throw new Error('No se encontró el día seleccionado.');const cut=isoTime(p.start);
  await deleteRemoteFromDay(m,fromIndex);
  m.exec.tasksRD=(m.exec.tasksRD||[]).filter(x=>!(x.isUnplanned&&Number(x.addedDuringDay||0)>=fromIndex));m.exec.tasksRU=(m.exec.tasksRU||[]).filter(x=>!(x.isUnplanned&&Number(x.addedDuringDay||0)>=fromIndex));
  for(const x of [...m.exec.tasksRD,...m.exec.tasksRU])if(x.doneAt&&isoTime(x.doneAt)>=cut){x.doneAt=null;x.doneBy=''}
  m.exec.loads=(m.exec.loads||[]).filter(x=>!(x.isUnplanned&&Number(x.addedDuringDay||0)>=fromIndex));for(const x of m.exec.loads)resetLoadFrom(x,cut);
  Object.keys(m.exec.closures||{}).forEach(id=>{const n=Number(String(id).replace(/\D/g,''));if(n>=fromIndex)delete m.exec.closures[id]});
  for(const bag of ['cutoffs','cutoffAudit'])if(m.exec[bag])Object.keys(m.exec[bag]).forEach(id=>{const n=Number(String(id).replace(/\D/g,''));if(n>=fromIndex)delete m.exec[bag][id]});
  m.exec.forcedThroughDay=Math.min(Number(m.exec.forcedThroughDay)||0,Math.max(0,fromIndex-1));m.exec.actualAcceptance='';m.exec.moveClosedAt='';m.status=m.exec.actualRelease?'active':(m.plan?.loaded?'ready':'draft');state.history=(state.history||[]).filter(x=>x.id!==m.id);m.exec.periods=[];m.exec.selectedPeriodId=`D${fromIndex}`;m.audit=m.audit||[];m.audit.push({at:nowIso(),user:state.auth.email,action:'admin_rollback_from_day',fromDay:fromIndex});
  save();await persistMoveNow(m);return true;
}
async function confirmRollback(m,fromIndex){
  if(!(typeof hasPerm==='function'&&hasPerm('admin'))){try{toast('Esta acción es exclusiva de Administradores.')}catch(_){};return}
  if(!confirm(`Revertir desde el Día ${fromIndex}?\n\nSe eliminará la ejecución, cierres, OPS/reportes y cambios de alcance de este día y de todos los días posteriores. El Plan Base se conserva.`))return;
  try{toast('Revirtiendo ejecución…');await rollbackFromDay(m,fromIndex);state.screen='execute';state.execMode='days';render();toast(`Ejecución revertida desde Día ${fromIndex}`)}catch(e){alert('No fue posible revertir: '+friendlyError(e))}
}
async function fullExecutionReset(m){ throw new Error('RigGO 12.0: reinicio de ejecución retirado.');
  if(!(typeof hasPerm==='function'&&hasPerm('admin')))throw new Error('Esta acción es exclusiva de Administradores.');
  await deleteRemoteFromDay(m,1);
  const fresh={actualRelease:'',tasksRD:[],tasksRU:[],loads:[],closures:{},periods:[],selectedPeriodId:null,actualAcceptance:'',cutoffs:{},cutoffAudit:{},forcedThroughDay:0,moveClosedAt:''};m.exec=fresh;m.status=m.plan?.loaded?'ready':'draft';state.history=(state.history||[]).filter(x=>x.id!==m.id);m.audit=m.audit||[];m.audit.push({at:nowIso(),user:state.auth.email,action:'admin_reset_execution'});save();await persistMoveNow(m)
}
function enhanceAdmin(){ return;
  if(state?.screen!=='admin'||!hasPerm?.('admin'))return;
  document.querySelectorAll('[data-v4-editmove]').forEach(btn=>{if(btn.dataset.v59Edit)return;btn.dataset.v59Edit='1';const id=btn.dataset.v4Editmove,orig=btn.onclick;btn.onclick=()=>{orig?.();setTimeout(()=>{const m=state.moves.find(x=>x.id===id),foot=document.querySelector('.sheet .sheet-footer');if(!m||!foot||document.getElementById('v59ResetExec'))return;const reset=document.createElement('button');reset.id='v59ResetExec';reset.className='btn danger';reset.textContent='Reiniciar ejecución';foot.prepend(reset);reset.onclick=async()=>{if(!confirm(`Reiniciar completamente la ejecución de ${m.meta.rig}?\n\nSe conservará el Plan Base, pero se eliminarán Release real, días, actividades ejecutadas, cargas, cierres, OPS y emails asociados.`))return;try{reset.disabled=true;reset.textContent='Reiniciando…';await fullExecutionReset(m);closeSheet();render();toast('Ejecución reiniciada')}catch(e){alert(friendlyError(e))}}},0)}})
}
if(typeof render==='function'){
  const BASE=render;render=function(){const r=BASE.apply(this,arguments);requestAnimationFrame(()=>{decorateDayCards();enhanceAdmin()});return r}
}

/* Version/cache identity */

/* Service Worker registration is owned by RigGO 6.0 in this build. */
window.RigGOV59={release:RELEASE,build:BUILD,dayGate,stepMissing,closureMissing,rollbackFromDay,fullExecutionReset,friendlyError,ensureDbPeriod,persistMoveNow};
})();

/* ===== SOURCE riggo-v60.js (consolidated) ===== */
/* RigGO 6.0 Admin Integrity Candidate 1
   Hardens administrative mutations and prevents stale remote hydration
   from resurrecting deleted Moves. Clarifies Day 1 reset semantics. */
(function(){
'use strict';
const RELEASE='6.0.0-admin-integrity-c1';
const BUILD='2026-08-15-2343-C1';






const V59=()=>window.RigGOV59||{};
const DB=()=>window.RigGOSupabase;
let destructiveDepth=0;
let hydrateQueued=false;
const BASE_HYDRATE=(typeof hydrateRemote==='function')?hydrateRemote:null;

function isAdmin(){
  try{return !!(typeof hasPerm==='function'&&hasPerm('admin'))}catch(_){return false}
}
function requireAdmin(){
  if(isAdmin())return true;
  try{toast('Esta acción es exclusiva de Administradores.')}catch(_){}
  return false;
}

/* Deleted/archived Moves are never executable, even for an Administrator with a stale selected ID. */
if(typeof canAccessMove==='function'){
  const BASE_CAN_ACCESS=canAccessMove;
  canAccessMove=function(user,move){
    const g=move?.management||{};
    if(g.deletedAt||g.archivedAt||g.source==='Legacy')return false;
    return BASE_CAN_ACCESS(user,move);
  };
}
function beginDestructive(){
  destructiveDepth++;
  document.documentElement.dataset.riggoMutation='admin';
}
function endDestructive(){
  destructiveDepth=Math.max(0,destructiveDepth-1);
  if(!destructiveDepth){
    delete document.documentElement.dataset.riggoMutation;
    if(hydrateQueued&&BASE_HYDRATE){
      hydrateQueued=false;
      setTimeout(()=>{try{hydrateRemote()}catch(_){}},0);
    }
  }
}

/* A remote refresh must never overwrite a destructive mutation while it is pending. */
if(BASE_HYDRATE){
  hydrateRemote=async function(){
    if(destructiveDepth>0){hydrateQueued=true;return null}
    return BASE_HYDRATE.apply(this,arguments);
  };
}

function mgmt(m){
  if(typeof v4Mgmt==='function')return v4Mgmt(m);
  m.management=m.management||{};
  return m.management;
}
function clone(x){
  try{return deepClone(x)}catch(_){return JSON.parse(JSON.stringify(x||{}))}
}
function restoreObject(target,snapshot){
  Object.keys(target).forEach(k=>delete target[k]);
  Object.assign(target,clone(snapshot));
}
async function persistVerified(m,{deletedAt,archivedAt}={}){
  const persist=V59().persistMoveNow;
  if(typeof persist!=='function')throw new Error('RigGO no encontró el guardado inmediato de la Move.');
  await persist(m);
  const db=DB();
  if(!db)return true;
  const q=await db.from('moves').select('settings').eq('id',m.id).single();
  if(q.error)throw q.error;
  const remote=q.data?.settings?.riggo_payload?.management||{};
  if(deletedAt!==undefined){
    const got=String(remote.deletedAt||''),want=String(deletedAt||'');
    if(got!==want)throw new Error('RigGO no pudo confirmar el estado Eliminada en servidor.');
  }
  if(archivedAt!==undefined){
    const got=String(remote.archivedAt||''),want=String(archivedAt||'');
    if(got!==want)throw new Error('RigGO no pudo confirmar el estado Archivada en servidor.');
  }
  return true;
}
function localCommit(){
  try{saveLocal()}catch(_){}
}
function audit(m,action,extra={}){
  m.audit=m.audit||[];
  m.audit.push({at:typeof nowIso==='function'?nowIso():new Date().toISOString(),user:state?.auth?.email||'',action,...extra});
}

/* Soft-delete remains recoverable, but persistence is synchronous and verified. */
if(typeof v4DeleteMove==='function'){
  v4DeleteMove=async function(m){
    if(!m||!requireAdmin())return;
    if(!confirm(`Eliminar ${m.meta?.rig||'esta Move'}?\n\nLa Move saldrá de Planeación, Ejecución y Performance y quedará únicamente en Administración > Eliminadas, desde donde un Administrador podrá restaurarla.`))return;
    const g=mgmt(m),before=clone(g),previousSelected=state.selectedMoveId,auditLen=(m.audit||[]).length;
    beginDestructive();
    try{
      const stamp=typeof nowIso==='function'?nowIso():new Date().toISOString();
      g.deletedAt=stamp;g.deletedBy=state.auth.email;
      delete g.archivedAt;delete g.archivedBy;
      audit(m,'delete_move',{mode:'soft_delete_verified'});
      if(state.selectedMoveId===m.id)state.selectedMoveId=null;
      localCommit();
      try{toast('Eliminando Move…')}catch(_){}
      await persistVerified(m,{deletedAt:stamp});
      state.screen='admin';state.adminMoveView='moves';state.adminMoveStatus='active';
      localCommit();render();
      try{toast('Move eliminada. Disponible solo en Administración > Eliminadas.')}catch(_){}
    }catch(e){
      restoreObject(g,before);m.audit=(m.audit||[]).slice(0,auditLen);state.selectedMoveId=previousSelected;localCommit();render();
      alert('No fue posible eliminar la Move. No se aplicaron cambios.\n\n'+String(e?.message||e));
    }finally{endDestructive()}
  };
}

/* Restore is also immediate; otherwise a stale deleted payload could win after refresh. */
if(typeof v4RestoreMove==='function'){
  v4RestoreMove=async function(m){
    if(!m||!requireAdmin())return;
    const g=mgmt(m),before=clone(g),wasDeleted=!!g.deletedAt,auditLen=(m.audit||[]).length;
    beginDestructive();
    try{
      delete g.deletedAt;delete g.deletedBy;delete g.archivedAt;delete g.archivedBy;
      audit(m,'restore_move',{from:wasDeleted?'deleted':'archived',mode:'verified'});
      localCommit();
      await persistVerified(m,{deletedAt:'',archivedAt:''});
      state.adminMoveStatus='active';localCommit();render();
      try{toast(wasDeleted?'Move restaurada':'Move reactivada')}catch(_){}
    }catch(e){
      restoreObject(g,before);m.audit=(m.audit||[]).slice(0,auditLen);localCommit();render();
      alert('No fue posible restaurar la Move.\n\n'+String(e?.message||e));
    }finally{endDestructive()}
  };
}

/* Archive uses the same immediate pattern to avoid the same class of race. */
if(typeof v4ArchiveMove==='function'){
  v4ArchiveMove=async function(m){
    if(!m||!requireAdmin())return;
    if(!confirm(`Archivar ${m.meta?.rig||'esta Move'}?`))return;
    const g=mgmt(m),before=clone(g),auditLen=(m.audit||[]).length;
    beginDestructive();
    try{
      const stamp=typeof nowIso==='function'?nowIso():new Date().toISOString();
      g.archivedAt=stamp;g.archivedBy=state.auth.email;
      audit(m,'archive_move',{mode:'verified'});localCommit();
      await persistVerified(m,{archivedAt:stamp});
      render();try{toast('Move archivada')}catch(_){}
    }catch(e){restoreObject(g,before);m.audit=(m.audit||[]).slice(0,auditLen);localCommit();render();alert('No fue posible archivar la Move.\n\n'+String(e?.message||e))}
    finally{endDestructive()}
  };
}

async function resetExecutionFromDayOne(m){ throw new Error('RigGO 12.0: reinicio de ejecución retirado.');
  if(!m||!requireAdmin())return;
  if(!confirm(`Reiniciar completamente la ejecución de ${m.meta?.rig||'esta Move'}?\n\nSe conservará el Plan Base. Se eliminarán Actual Rig Release, días ejecutados, cargas, cierres, OPS y emails asociados.`))return;
  beginDestructive();
  try{
    const fn=V59().fullExecutionReset;
    if(typeof fn!=='function')throw new Error('La función de reinicio no está disponible.');
    await fn(m);
    state.screen='execute';state.execMode='days';state.selectedMoveId=m.id;localCommit();render();
    try{toast('Ejecución reiniciada. Plan Base conservado.')}catch(_){}
  }catch(e){alert('No fue posible reiniciar la ejecución.\n\n'+String(e?.message||e))}
  finally{endDestructive()}
}

/* Day 1 is a full reset, not a misleading "rollback from Day 1". */
function clarifyAdminDayActions(){ document.querySelectorAll('[data-v59-rollback],#v59ResetExec,#resetMove').forEach(el=>el.remove()); return;
  const admin=isAdmin();
  document.querySelectorAll('[data-v59-rollback]').forEach(btn=>{
    if(!admin){btn.remove();return}
    const n=Number(btn.dataset.v59Rollback)||0;
    if(n===1){
      btn.textContent='Reiniciar ejecución';
      btn.title='Conserva el Plan Base y elimina toda la ejecución.';
      btn.onclick=()=>{
        const m=typeof currentMove==='function'?currentMove():null;
        resetExecutionFromDayOne(m);
      };
    }else if(n>1){
      btn.textContent=`Revertir ejecución · Día ${n}`;
      btn.title=`Elimina la ejecución del Día ${n} y todos los días posteriores. Conserva lo anterior y el Plan Base.`;
    }
  });
}

/* Defense in depth: admin controls should not remain in DOM for non-admin users. */
function enforceAdminUi(){
  document.querySelectorAll('[data-v59-rollback],#v59ResetExec,#resetMove').forEach(el=>el.remove()); return;
  const admin=isAdmin();
  if(!admin){
    document.querySelectorAll('[data-v4-delete],[data-v4-restore],[data-v4-archive],[data-v59-rollback],#v59ResetExec,#resetMove').forEach(el=>el.remove());
    return;
  }
  const reset=document.getElementById('resetMove');
  if(reset&&!reset.dataset.v60SafeReset){
    reset.dataset.v60SafeReset='1';
    const cloneReset=reset.cloneNode(true);
    cloneReset.dataset.v60SafeReset='1';
    reset.replaceWith(cloneReset);
    cloneReset.onclick=()=>{const m=typeof currentMove==='function'?currentMove():null;resetExecutionFromDayOne(m)};
  }
}
function stampReleaseUi(){
  const box=document.querySelector('.v5-admin-build');
  if(!box)return;
  const b=box.querySelector('b');if(b)b.textContent='RigGO '+RELEASE;
  const spans=box.querySelectorAll('span');if(spans.length)spans[spans.length-1].textContent=BUILD;
}

if(typeof render==='function'){
  const BASE_RENDER=render;
  render=function(){
    const out=BASE_RENDER.apply(this,arguments);
    requestAnimationFrame(()=>{clarifyAdminDayActions();enforceAdminUi();stampReleaseUi()});
    return out;
  };
}

/* Register only the 6.0 cache identity. */
if('serviceWorker' in navigator){
}

window.RigGOV60={
  release:RELEASE,build:BUILD,isAdmin,
  mutationActive:()=>destructiveDepth>0,
  persistVerified,resetExecutionFromDayOne,
  clarifyAdminDayActions
};
})();

/* ===== SOURCE riggo-v61.js (consolidated) ===== */
/* RigGO 6.1 · Reporting Recovery + Executive Performance */
(function(){
'use strict';
const RELEASE='6.1.0-reporting-performance-c1';
const BUILD='2026-08-16-0015-C1';



const el=id=>document.getElementById(id);
const db=()=>window.RigGOSupabase;
const num=v=>Number(v)||0;
const pct=v=>Math.max(0,Math.min(100,num(v)));
const esc=v=>typeof enc==='function'?enc(v??''):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

/* ---------- Daily Report validation: block at the step, not at Close Day ---------- */
function v61Missing(step,c,p){
  const missing=[];
  if(step===0){try{const f=flatSummary(c.flatEvents||[],p);if(!f.valid)missing.push({label:'Flat Time válido',ids:[]})}catch(_){}}
  if(step===2){
    if(!String(c.originOps||'').trim()&&!String(c.destinationOps||'').trim())missing.push({label:'Operación últimas 24 Hrs',ids:['originOps','destinationOps']});
    if(!String(c.next24||'').trim())missing.push({label:'Actividades próximas 24 Hrs',ids:['next24']});
  }
  if(step===3){
    if(!String(c.safetyTopic||'').trim())missing.push({label:'Tema de seguridad',ids:['safetyTopic']});
    if(!String(c.safetyUnderstood||'').trim())missing.push({label:'Asistencia y comprensión',ids:['safetyUnderstood']});
  }
  if(step===4){
    if(!String(c.siteSupervisor||'').trim())missing.push({label:'Supervisor del sitio',ids:['siteSupervisor']});
    if(!String(c.siteSupervisorRole||'').trim())missing.push({label:'Cargo',ids:['siteSupervisorRole']});
    if(!c.signature)missing.push({label:'Firma del supervisor',ids:['signatureCanvas']});
  }
  return missing;
}
function v61ClearValidation(){document.querySelectorAll('.v61-required-error').forEach(x=>x.classList.remove('v61-required-error'));document.querySelector('.v61-validation-banner')?.remove()}
function v61ShowValidation(missing){
  v61ClearValidation();if(!missing.length)return false;
  const host=document.querySelector('.v3-report-main')||document.querySelector('.v3-report-body')||document.querySelector('section');
  const banner=document.createElement('div');banner.className='v61-validation-banner';banner.textContent='Completa antes de continuar: '+missing.map(x=>x.label).join(', ')+'.';
  const head=document.querySelector('.v3-report-head');if(head)head.insertAdjacentElement('afterend',banner);else host?.prepend(banner);
  const ids=missing.flatMap(x=>x.ids||[]);ids.forEach(id=>el(id)?.classList.add('v61-required-error'));
  const first=ids.map(el).find(Boolean);if(first){first.scrollIntoView({behavior:'smooth',block:'center'});if(first.tagName!=='CANVAS')setTimeout(()=>{try{first.focus({preventScroll:true})}catch(_){}},180)}
  try{toast('Completa los datos requeridos antes de continuar')}catch(_){}
  return true;
}
if(typeof wireReport==='function'){
  const BASE_WIRE_REPORT=wireReport;
  wireReport=function(m,p,c){
    BASE_WIRE_REPORT(m,p,c);
    const step=Number(c.reportStep)||0;
    // Replace the navigation controls so older guards cannot allow an incomplete step through.
    const nextOld=el('v3ReportNext');
    if(nextOld){const next=nextOld.cloneNode(true);nextOld.replaceWith(next);next.onclick=()=>{try{captureExecText(m,p,c)}catch(_){};const s=Number(c.reportStep)||0,miss=v61Missing(s,c,p);if(v61ShowValidation(miss))return;v61ClearValidation();c.reportVisited=c.reportVisited||{};c.reportVisited[s]=true;c.reportStep=Math.min(6,s+1);save();render();try{window.scrollTo(0,0)}catch(_){}}}
    document.querySelectorAll('[data-v3-reportstep]').forEach(old=>{const b=old.cloneNode(true);old.replaceWith(b);b.onclick=()=>{try{captureExecText(m,p,c)}catch(_){};const target=Number(b.dataset.v3Reportstep),s=Number(c.reportStep)||0;if(target===s)return;if(target<s||c.reportVisited?.[target]){c.reportStep=target;save();render();return}if(target!==s+1){try{toast('Completa los pasos en secuencia')}catch(_){};return}const miss=v61Missing(s,c,p);if(v61ShowValidation(miss))return;v61ClearValidation();c.reportVisited=c.reportVisited||{};c.reportVisited[s]=true;c.reportStep=target;save();render()}});
    // Existing incomplete open reports cannot stay on OPS/Email while an earlier required field is missing.
    if(!c.closedAt&&step>=5){for(let s=0;s<=4;s++){const miss=v61Missing(s,c,p);if(miss.length){c.reportStep=s;save();setTimeout(()=>{render();v61ShowValidation(miss)},0);break}}}
  };
}

/* ---------- Outlook-safe executive Daily Move Update ---------- */
function v61Bullets(text){try{return bullets(text)}catch(_){return String(text||'').split(/\r?\n/).map(x=>x.replace(/^\s*[•\-*]\s*/,'').trim()).filter(Boolean)}}
function v61EmailHtml(m,p,c,{forSend=false}={}){
 const APP_URL='https://riggo.online/';
 const plan=currentPlanPcts(m,p),s=suggestedPcts(m,p),rep={rd:reportValue(c,'rd',s.rd),rm:reportValue(c,'rm',s.rm),ru:reportValue(c,'ru',s.ru)},r=scopeCounts(m,'Rig',p),mi=scopeCounts(m,'Mini Camp',p),ca=scopeCounts(m,'Camp',p),th=scopeCounts(m,'Operador / Terceros',p),fs=flatSummary(c.flatEvents||[],p),adv=advances(m,p),pend=pendingDay(m,p),totalMoved=r.moved+mi.moved+ca.moved+th.moved,totalLoads=(m.exec.loads||[]).length;
 const fmtPct=v=>`${Math.round(num(v))}%`,delta=(a,b)=>Math.round(num(a)-num(b));
 const phases=[['Rig Down','rd',plan.rd,rep.rd],['Rig Move','rm',plan.rm,rep.rm],['Rig Up','ru',plan.ru,rep.ru]];
 const worst=phases.slice().sort((a,b)=>delta(a[3],a[2])-delta(b[3],b[2]))[0],worstDelta=delta(worst[3],worst[2]);
 const insight=worstDelta<0?`Mayor desviación: ${worst[0]}, ${Math.abs(worstDelta)} pp por debajo del plan.${worst[1]==='rm'?` ${totalMoved} de ${totalLoads} cargas movilizadas.`:''}${String(c.progressNotes?.[worst[1]]||'').trim()?` ${String(c.progressNotes[worst[1]]).trim()}`:''}`:'Ejecución alineada o por encima del plan en las tres fases.';
 const section=(n,title)=>`<tr><td style="padding:20px 24px 8px"><div style="font-size:11px;line-height:14px;font-weight:700;letter-spacing:.08em;color:#667085;text-transform:uppercase">${n?`${n}. `:''}${esc(title)}</div></td></tr>`;
 const preview=(text,max)=>{const a=v61Bullets(text);return{count:a.length,html:a.length?a.slice(0,max).map(x=>`<div style="margin:3px 0;color:#344054;font-size:13px;line-height:18px">• ${esc(x)}</div>`).join('')+(a.length>max?`<div style="margin-top:5px;color:#667085;font-size:12px;line-height:17px;font-weight:700">+ ${a.length-max} adicionales en OPS</div>`:''):'<div style="color:#667085;font-size:13px">Sin actividades registradas.</div>'}};
 const origin=preview(c.originOps,4),destination=preview(c.destinationOps,4),next=preview(c.next24,5);
 const phaseRows=phases.map(([label,key,pv,av])=>{const d=delta(av,pv),tone=d>=0?['#e9f8f1','#137a53']:d>=-5?['#fff7e6','#9a6700']:['#fff0f0','#b42318'];return `<tr><td style="padding:10px 12px;border-bottom:1px solid #e7ebef;font-size:13px;font-weight:700;color:#17202a">${label}</td><td align="center" style="padding:10px 8px;border-bottom:1px solid #e7ebef;font-size:13px;color:#475467">${fmtPct(pv)}</td><td align="center" style="padding:10px 8px;border-bottom:1px solid #e7ebef;font-size:15px;font-weight:800;color:#17202a">${fmtPct(av)}</td><td align="center" style="padding:7px 8px;border-bottom:1px solid #e7ebef"><span style="display:inline-block;padding:4px 8px;background:${tone[0]};color:${tone[1]};font-size:11px;font-weight:800;border-radius:10px">${d>0?'+':''}${d} pp</span></td></tr>`}).join('');
 const physical=[['Rig',rep.rd,Math.round(r.pct),rep.ru]];if(m.scope?.mini)physical.push(['Mini Camp',c.scope?.mini?.down||0,Math.round(mi.pct),c.scope?.mini?.up||0]);if(m.scope?.camp)physical.push(['Campamento',c.scope?.camp?.down||0,Math.round(ca.pct),c.scope?.camp?.up||0]);
 const physicalRows=physical.map(x=>`<tr><td style="padding:8px 10px;border-bottom:1px solid #edf0f3;font-size:12px;font-weight:700">${esc(x[0])}</td><td align="center" style="padding:8px;border-bottom:1px solid #edf0f3;font-size:12px">${x[1]}%</td><td align="center" style="padding:8px;border-bottom:1px solid #edf0f3;font-size:12px">${x[2]}%</td><td align="center" style="padding:8px;border-bottom:1px solid #edf0f3;font-size:12px">${x[3]}%</td></tr>`).join('');
 const transport=[['Rig',r],['Mini Camp',mi],['Campamento',ca],['Operador / Terceros',th]].filter(([,x],i)=>i===0||num(x.total)>0),transportRows=transport.map(([label,x])=>`<tr><td style="padding:8px 10px;border-bottom:1px solid #edf0f3;font-size:12px;font-weight:700">${esc(label)}</td><td style="padding:8px 10px;border-bottom:1px solid #edf0f3;font-size:12px;color:#344054"><b>${x.moved}</b> / ${x.total} movilizadas · <b>${x.pos}</b> posicionadas</td></tr>`).join('');
 const sched=(label,count,items,color,bg,max)=>`<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:8px;background:${bg};border:1px solid #e5e9ee"><tr><td style="padding:10px 12px"><div style="font-size:13px;font-weight:800;color:${color}">${label} · ${count}</div>${count?items.slice(0,max).map(x=>`<div style="font-size:12px;line-height:17px;color:#344054;margin-top:3px">• ${esc(x)}</div>`).join('')+(count>max?`<div style="font-size:11px;color:#667085;font-weight:700;margin-top:4px">+ ${count-max} adicionales en OPS</div>`:''):`<div style="font-size:12px;color:#667085;margin-top:3px">Sin registros.</div>`}</td></tr></table>`;
 const milestones=(c.milestones||[]).map(x=>`<tr><td style="padding:8px 10px;border-bottom:1px solid #edf0f3;font-size:12px;font-weight:700">${esc(x.name)}</td><td style="padding:8px;border-bottom:1px solid #edf0f3;font-size:11px;color:#667085">${fmtDate(x.base,true)}</td><td style="padding:8px;border-bottom:1px solid #edf0f3;font-size:11px;color:#344054">${x.forecast?fmtDate(x.forecast,true):'—'}</td><td style="padding:8px;border-bottom:1px solid #edf0f3;font-size:11px;font-weight:700">${x.actual?fmtDate(x.actual,true):'—'}</td></tr>`).join('');
 const flatEvents=(c.flatEvents||[]).slice(0,4).map(e=>{const t=FLAT_TYPES.find(x=>x.id===e.type),detail=eventDetailSummary(e),treat=e.commercial||'Por definir';return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:7px;border:1px solid #f0d3d5;background:#fff8f8"><tr><td width="5" style="width:5px;background:#c92a36;font-size:1px">&nbsp;</td><td style="padding:9px 11px"><div style="font-size:13px;font-weight:800;color:#9f1d29">${round(eventHours(e),2)} h · ${esc(t?.label||e.type)}</div><div style="font-size:11px;line-height:16px;color:#475467;margin-top:2px">${e.responsibility?`Responsabilidad: ${esc(e.responsibility)} · `:''}Tratamiento: ${esc(treat)}${e.affected?` · Afecta: ${esc(e.affected)}`:''}</div>${detail?`<div style="font-size:12px;line-height:17px;color:#344054;margin-top:3px">${esc(detail)}</div>`:''}</td></tr></table>`}).join('');
 const chart=forSend?`<img src="cid:riggo-progress" width="632" alt="Plan vs Actual" style="display:block;width:100%;max-width:632px;height:auto;border:0;margin:0 auto">`:`<svg id="mailCombinedChart" viewBox="0 0 660 240" style="display:block;width:100%;height:auto;max-width:660px;margin:0 auto"></svg>`;
 const photos=(c.photos||[]).slice(0,2),captions=(c.photoCaptions||[]),photoHtml=photos.length?`<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr>${photos.map((x,i)=>`<td width="50%" valign="top" style="padding:${i?'0 0 0 5px':'0 5px 0 0'}"><img src="${forSend?`cid:photo-${i+1}`:x}" width="280" height="180" alt="Registro fotográfico ${i+1}" style="display:block;width:280px;max-width:100%;height:180px;border:0;background:#eef1f4"><div style="font-size:11px;line-height:15px;color:#667085;margin-top:5px">${esc(captions[i]||`Foto ${i+1}`)}</div></td>`).join('')}</tr></table>`:'<div style="font-size:13px;color:#667085">Sin fotografías registradas.</div>';
 return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;margin:0;padding:0;background:#f3f5f7"><tr><td align="center" style="padding:18px 6px"><table role="presentation" width="680" cellspacing="0" cellpadding="0" border="0" style="width:680px;max-width:680px;background:#ffffff;border:1px solid #dfe5ea">
 <tr><td style="padding:16px 24px 2px"><table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr><td valign="middle"><a href="${APP_URL}" target="_blank" style="text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:22px;line-height:24px;font-weight:900;letter-spacing:-.8px"><span style="color:#0aa59a">Rig</span><span style="color:#17202a">GO</span></a><div style="font-family:Arial,Helvetica,sans-serif;font-size:8px;line-height:11px;font-weight:700;letter-spacing:.12em;color:#7a8795;text-transform:uppercase;margin-top:3px">Operations Excellence</div></td></tr></table></td></tr>
 <tr><td style="padding:22px 24px 10px;border-left:5px solid #32c56b"><div style="font-size:23px;line-height:29px;font-weight:800;color:#17202a">Buen día,</div><div style="font-size:13px;line-height:19px;color:#475467;margin-top:4px">Daily Move Update · Rig <b>${esc(m.meta.rig)}</b> · Día ${p.index}</div></td></tr>
 <tr><td style="padding:8px 24px 16px"><div style="font-size:18px;line-height:24px;font-weight:800;color:#17202a">${esc(m.meta.origin)} → ${esc(m.meta.destination)}</div><div style="font-size:12px;line-height:18px;color:#667085;margin-top:3px">${fmtDate(p.start,true)} → ${fmtDate(p.end,true)}</div><div style="font-size:11px;line-height:17px;color:#667085;margin-top:3px">Release ${fmtDate(m.exec.actualRelease,true)} · ${num(m.meta.distanceKm)} km · ${esc(m.meta.moveCompany||'—')} · Corte ${esc(p.cutoffTime||'06:00')}</div></td></tr>
 ${section(1,'Plan vs Actual')}
 <tr><td style="padding:0 24px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #dfe5ea"><tr><th align="left" style="padding:9px 12px;background:#f5f7f9;font-size:10px;color:#667085">FASE</th><th style="padding:9px 8px;background:#f5f7f9;font-size:10px;color:#667085">PLAN</th><th style="padding:9px 8px;background:#f5f7f9;font-size:10px;color:#667085">ACTUAL</th><th style="padding:9px 8px;background:#f5f7f9;font-size:10px;color:#667085">VAR.</th></tr>${phaseRows}</table><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:9px;background:#eef4ff"><tr><td style="padding:10px 12px;font-size:12px;line-height:18px;color:#24436b"><b>Resumen:</b> ${esc(insight)}</td></tr></table></td></tr>
 <tr><td style="padding:14px 24px 0">${chart}</td></tr>
 ${section(2,'Operación últimas 24 Hrs')}<tr><td style="padding:0 24px"><div style="font-size:13px;font-weight:800;color:#17202a">${esc(m.meta.origin)} · ${origin.count} actividad${origin.count===1?'':'es'}</div>${origin.html}<div style="height:10px"></div><div style="font-size:13px;font-weight:800;color:#17202a">${esc(m.meta.destination)} · ${destination.count} actividad${destination.count===1?'':'es'}</div>${destination.html}</td></tr>
 ${section(3,'Avance físico y transporte')}<tr><td style="padding:0 24px"><div style="font-size:12px;font-weight:800;color:#344054;margin-bottom:6px">Avance físico por alcance</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #e3e8ed"><tr><th align="left" style="padding:7px 10px;background:#f7f9fb;font-size:10px;color:#667085">ALCANCE</th><th style="padding:7px;background:#f7f9fb;font-size:10px;color:#667085">DOWN</th><th style="padding:7px;background:#f7f9fb;font-size:10px;color:#667085">MOVE</th><th style="padding:7px;background:#f7f9fb;font-size:10px;color:#667085">UP</th></tr>${physicalRows}</table><div style="font-size:12px;font-weight:800;color:#344054;margin:13px 0 6px">Transporte de cargas</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #e3e8ed">${transportRows}</table></td></tr>
 ${section(4,'Control de cronograma e hitos')}<tr><td style="padding:0 24px">${sched('Adelantos',adv.length,adv,'#137a53','#f1faf5',3)}${sched('Pendientes del día',pend.length,pend,'#b42318','#fff5f5',3)}${milestones?`<div style="font-size:12px;font-weight:800;color:#344054;margin:13px 0 6px">Hitos</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #e3e8ed"><tr><th align="left" style="padding:7px 10px;background:#f7f9fb;font-size:10px;color:#667085">HITO</th><th style="padding:7px;background:#f7f9fb;font-size:10px;color:#667085">PLAN BASE</th><th style="padding:7px;background:#f7f9fb;font-size:10px;color:#667085">PROYECCIÓN</th><th style="padding:7px;background:#f7f9fb;font-size:10px;color:#667085">ACTUAL</th></tr>${milestones}</table>`:''}</td></tr>
 ${section(5,'Flat Time / Desviaciones')}<tr><td style="padding:0 24px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${fs.net>0?'#fff8f0':'#f1faf5'};border:1px solid ${fs.net>0?'#f3d7b2':'#d0eadc'}"><tr><td style="padding:11px 12px;font-size:13px;color:#17202a"><b>Flat Time neto: ${round(fs.net,2)} h</b> · Trabajo efectivo Move: ${round(fs.work,2)} h</td></tr></table>${flatEvents||'<div style="font-size:12px;color:#667085;margin-top:7px">Sin Flat Time registrado.</div>'}${(c.flatEvents||[]).length>4?`<div style="font-size:11px;color:#667085;font-weight:700;margin-top:5px">+ ${(c.flatEvents||[]).length-4} eventos adicionales en OPS</div>`:''}</td></tr>
 ${section(6,'Próximas 24 Hrs')}<tr><td style="padding:0 24px">${next.html}</td></tr>
 ${section(7,'Registro fotográfico')}<tr><td style="padding:0 24px 4px">${photoHtml}</td></tr>
 <tr><td style="padding:20px 24px 24px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f5f7f9"><tr><td style="padding:11px 12px;font-size:12px;line-height:18px;color:#475467">El detalle operacional completo se encuentra en el <b>OPS-F0065-S adjunto</b>.</td></tr></table><div style="font-size:13px;line-height:20px;color:#344054;margin-top:16px">Muchas gracias.</div><div style="font-size:13px;line-height:20px;color:#344054;margin-top:8px">Cordialmente,</div><div style="font-size:13px;line-height:19px;color:#17202a;font-weight:800;margin-top:5px">${esc(c.siteSupervisor||'')}</div><div style="font-size:12px;line-height:18px;color:#667085">${esc(c.siteSupervisorRole||'Rig Manager')}</div><div style="border-top:1px solid #e5e9ee;margin-top:16px;padding-top:10px;font-size:10px;line-height:15px;color:#7a8795"><a href="${APP_URL}" target="_blank" style="color:#7a8795;text-decoration:none">Powered by <span style="font-weight:900;color:#0aa59a">Rig</span><span style="font-weight:900;color:#344054">GO</span> · Operations Excellence · Nabors</a></div></td></tr>
 </table></td></tr></table>`;
}
emailHtml=v61EmailHtml;

combinedChartSvg=function(m,p){
 const cv=m.plan?.curves||{rd:[],rm:[],ru:[]},series=[['Rig Down',[0,...(cv.rd||[])],actualSeries(m,'rd',p)],['Rig Move',[0,...(cv.rm||[])],actualSeries(m,'rm',p)],['Rig Up',[0,...(cv.ru||[])],actualSeries(m,'ru',p)]];
 const W=660,H=240,cardW=196,gap=12,top=42,plotH=164;let out=`<rect width="${W}" height="${H}" rx="14" fill="#f6f8fb"/><text x="18" y="24" fill="#26364b" font-family="Arial" font-size="12" font-weight="700">Plan vs Actual · Daily Progress</text><text x="642" y="24" text-anchor="end" fill="#7c899a" font-family="Arial" font-size="8">PLAN · ACTUAL</text>`;
 series.forEach((s,si)=>{const ox=18+si*(cardW+gap),x0=ox+20,x1=ox+cardW-12,y0=top+28,y1=top+plotH,n=Math.max(2,s[1].length,s[2].length),x=i=>x0+i*(x1-x0)/(n-1),y=v=>y0+(pct(v)/100)*(y1-y0);out+=`<rect x="${ox}" y="${top}" width="${cardW}" height="${plotH+20}" rx="10" fill="#ffffff" stroke="#dce3eb"/><text x="${ox+11}" y="${top+18}" fill="#26364b" font-family="Arial" font-size="9" font-weight="700">${s[0]}</text>`;[0,50,100].forEach(v=>out+=`<line x1="${x0}" y1="${y(v)}" x2="${x1}" y2="${y(v)}" stroke="#e4e9ef"/><text x="${x0}" y="${y(v)-3}" fill="#9aa6b5" font-family="Arial" font-size="6">${v}%</text>`);const pts=a=>(a||[]).map((v,i)=>`${x(i)},${y(v)}`).join(' ');out+=`<polyline fill="none" stroke="#1769ff" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round" points="${pts(s[1])}"/><polyline fill="none" stroke="#15b77e" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round" points="${pts(s[2])}"/>`;s[2].forEach((v,i)=>out+=`<circle cx="${x(i)}" cy="${y(v)}" r="2.7" fill="#15b77e"/>`)});return out;
};

function v61PreparePhoto(dataUrl,w=1120,h=720,q=.78){return new Promise(resolve=>{if(!dataUrl){resolve('');return}const img=new Image();img.onload=()=>{try{const sw=img.naturalWidth||img.width,sh=img.naturalHeight||img.height,scale=Math.min(w/sw,h/sh),dw=sw*scale,dh=sh*scale,dx=(w-dw)/2,dy=(h-dh)/2,canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d');ctx.fillStyle='#eef1f4';ctx.fillRect(0,0,w,h);ctx.drawImage(img,dx,dy,dw,dh);resolve(canvas.toDataURL('image/jpeg',q))}catch(_){resolve(dataUrl)}};img.onerror=()=>resolve(dataUrl);img.src=dataUrl})}
function v61Base64(data){const i=String(data||'').indexOf(',');return i>=0?String(data).slice(i+1):String(data||'')}
function v61Blob64(blob){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(v61Base64(r.result));r.onerror=reject;r.readAsDataURL(blob)})}
function v61Recipients(m,c){return{to:c.deliveryTo??m.reportConfig?.dailyTo??m.reportConfig?.f0065To??'',cc:c.deliveryCc??m.reportConfig?.dailyCc??m.reportConfig?.f0065Cc??''}}
function v61Subject(m,p){return `Rig ${m.meta.rig} | Daily Move Update | Día ${p.index} | ${m.meta.origin} to ${m.meta.destination}`}
async function v61Invoke(body){const SB=db();const {data,error}=await SB.functions.invoke('riggo-send-email',{body});if(error){let detail='';try{if(error.context&&typeof error.context.json==='function'){const b=await error.context.json();detail=b?.error?.message||b?.error||b?.message||''}}catch(_){}throw new Error(detail||error.message||'La Edge Function devolvió un error.')}if(!data?.ok)throw new Error(data?.error?.message||data?.error||'El proveedor no confirmó el envío.');return data}
async function v61NextVersion(m,periodId,type){const {data,error}=await db().from('reports').select('version').eq('move_id',m.id).eq('period_id',periodId).eq('report_type',type).order('version',{ascending:false}).limit(1);if(error)throw error;return(num(data?.[0]?.version)+1)}
async function v61CreateReport(m,periodId,type,version,path,to,cc,status){const {data,error}=await db().from('reports').insert({move_id:m.id,period_id:periodId,report_type:type,version,storage_path:path||null,recipients_to:to,recipients_cc:cc,status:status||'pending_send',generated_by:state.auth.email||null}).select('id').single();if(error)throw error;return data.id}
function v61EmailDoc(m,p,c){return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:0;background:#f3f5f7;font-family:Arial,Helvetica,sans-serif;color:#17202a">${v61EmailHtml(m,p,c,{forSend:true})}</body></html>`}
let v61Sending=false;
sendDailyReport=async function(m,p,c){
 if(v61Sending)return;if(!c.closedAt){alert('Cierra el día antes de enviar.');return}if(!c.f0065ReviewedAt){state.reportView='f0065';save();render();toast('Revisa el OPS antes del email');return}
 const rec=v61Recipients(m,c),to=splitEmails(rec.to),cc=splitEmails(rec.cc);if(!to.length){alert('Agrega al menos un destinatario en Para.');return}
 const SB=db();if(!SB){alert('No hay conexión con Supabase.');return}const btn=el('sendFromReview'),result=el('sendResult');v61Sending=true;if(btn){btn.disabled=true;btn.textContent='Preparando…'}if(result){result.style.color='#a8c0ff';result.textContent='Preparando Daily Move Update…'}
 let reportId=null;
 try{
   // OPS always uses the original evidence. Email uses only two compressed 16:9 copies.
   const originalPhotos=(c.photos||[]).slice(),rawEmail=originalPhotos.slice(0,2),emailPhotos=await Promise.all(rawEmail.map(x=>v61PreparePhoto(x,1120,720,.78)));
   const pdf=await window.RigGOReportV12.generateOpsPdfBlob(m,p,c),periodId=await window.RigGOReportV12.ensureDbPeriod(m,p);c.dbPeriodId=periodId;await window.RigGOReportV12.saveClosureRecord(m,p,c,periodId);
   let opsPath=c.opsStoragePath||'',opsName=opsPath?opsPath.split('/').pop():'';
   if(!opsPath){opsName=`OPS-F0065-S_${String(m.meta.rig||'Rig').replace(/[^a-z0-9_-]+/gi,'_')}_Dia${p.index}_${new Date().toISOString().replace(/[-:TZ.]/g,'').slice(0,14)}.pdf`;opsPath=`${m.id}/periods/${periodId}/reports/${opsName}`;const up=await SB.storage.from('riggo-files').upload(opsPath,pdf,{contentType:'application/pdf',upsert:true,cacheControl:'3600'});if(up.error)throw up.error;c.opsStoragePath=opsPath;const fv=await v61NextVersion(m,periodId,'f0065');await v61CreateReport(m,periodId,'f0065',fv,opsPath,to,cc,'generated')}
   const dv=await v61NextVersion(m,periodId,'daily_move_update');reportId=await v61CreateReport(m,periodId,'daily_move_update',dv,null,to,cc,'pending_send');
   if(btn)btn.textContent='Enviando…';if(result)result.textContent='Enviando Daily Move Update + OPS…';
   const chart=await svgToPngDataUrl(combinedChartSvg(m,p),660,240),attachments=[{filename:opsName||`OPS-F0065-S_${m.meta.rig}_Dia${p.index}.pdf`,content:await v61Blob64(pdf)},{filename:'RigGO_Progress.png',content:v61Base64(chart),contentId:'riggo-progress'}];
   emailPhotos.forEach((x,i)=>attachments.push({filename:`RigGO_Photo_${i+1}.jpg`,content:v61Base64(x),contentId:`photo-${i+1}`}));
   const emailClosure={...c,photos:emailPhotos,photoCaptions:(c.photoCaptions||[]).slice(0,2)};
   const response=await v61Invoke({to,cc,subject:v61Subject(m,p),html:v61EmailDoc(m,p,emailClosure),replyTo:state.auth.email||undefined,attachments});
   const sent=nowIso();c.sentAt=sent;c.sendStatus='sent';c.messageId=response.messageId||'';c.reportPhotoCount=emailPhotos.length;c.reportHadSignature=!!c.signature;
   await SB.from('reports').update({status:'sent',provider_message_id:response.messageId||null,sent_at:sent}).eq('id',reportId);await SB.from('daily_closures').update({sent_at:sent}).eq('period_id',periodId);
   c.photos=[];c.photoCaptions=[];c.signature='';save();if(result){result.style.color='#8ae4ad';result.textContent=`Enviado ✓ · OPS adjunto · ${emailPhotos.length} foto${emailPhotos.length===1?'':'s'} optimizada${emailPhotos.length===1?'':'s'}`}toast('Daily Move Update enviado');setTimeout(render,450);
 }catch(e){console.error('RigGO 6.1 report send',e);try{if(reportId)await SB.from('reports').update({status:'failed',error_message:String(e.message||e)}).eq('id',reportId)}catch(_){}if(result){result.style.color='#ffafb8';result.textContent='Error: '+String(e.message||e)}else alert('No fue posible enviar: '+e.message)}finally{v61Sending=false;if(btn&&document.body.contains(btn)){btn.disabled=false;btn.textContent=c.sentAt?'Reenviar':'Enviar Daily Move Update + OPS'}}
};

/* ---------- Performance: manager-first Live / Historical / Top ---------- */
function v61FilterRows(rows){const f=state.filters||{};return rows.filter(x=>(f.rig==='Todos'||!f.rig||x.rig===f.rig)&&(f.operator==='Todos'||!f.operator||x.operator===f.operator)&&(f.company==='Todos'||!f.company||x.company===f.company)&&(f.includeTests||x.type!=='Prueba'))}
function v61Hist(){return v61FilterRows(v4RealHistoryRows())}
function v61FlatMove(m){let h=0;for(const p of movePeriods(m)||[]){const c=m.exec?.closures?.[p.id];if(c)try{h+=flatSummary(c.flatEvents||[],p).net}catch(_){}}return h}
function v61LiveData(m){const ps=movePeriods(m)||[],now=Date.now(),p=ps.filter(x=>new Date(x.start).getTime()<=now).at(-1)||ps[0],actual=moveProgressSnapshot(m),plan=p?currentPlanPcts(m,p):{rd:0,rm:0,ru:0},gaps={rd:Math.round(actual.rd-plan.rd),rm:Math.round(actual.rm-plan.rm),ru:Math.round(actual.ru-plan.ru)},worst=Math.min(gaps.rd,gaps.rm,gaps.ru),planned=v4PlannedDays(m),elapsed=m.exec?.actualRelease?Math.max(0,(now-new Date(m.exec.actualRelease).getTime())/86400000):0,timePct=planned?elapsed/planned*100:0,flat=v61FlatMove(m),pending=typeof v4Unsent==='function'?v4Unsent(m).length:0,health=(worst<-10||timePct>105)?'bad':(worst<-4||timePct>90)?'warn':'good';return{m,p,actual,plan,gaps,worst,planned,elapsed,timePct,flat,pending,health}}
function v61Live(){return v4OperationalMoves().filter(m=>m.status==='active'&&!v4Mgmt(m).deletedAt&&!v4Mgmt(m).archivedAt&&(state.filters?.includeTests||v4Mgmt(m).type!=='Prueba')).map(v61LiveData)}
function v61HealthLabel(x){return x.health==='bad'?'En riesgo':x.health==='warn'?'Atención':'On Plan'}
function v61Phase(label,plan,actual){return `<div class="v61-phase"><label>${label}</label><span class="v61-phase-track"><i class="plan" style="width:${pct(plan)}%"></i><i class="actual" style="width:${pct(actual)}%"></i></span><strong>${Math.round(actual)}%</strong></div>`}
function v61LiveRows(data){return data.length?`<div class="v61-live-table">${data.map(x=>`<button class="v61-live-row" data-v61-live="${x.m.id}"><div><div class="row" style="gap:7px;align-items:center"><span class="v61-live-rig">${esc(x.m.meta.rig)}</span><span class="v61-badge ${x.health}">${v61HealthLabel(x)}</span></div><div class="v61-live-route">${esc(x.m.meta.operator||'')} · ${esc(x.m.meta.origin)} → ${esc(x.m.meta.destination)}</div></div><div class="v61-live-day"><span>Tiempo</span><b>${x.p?`Día ${x.p.index}`:'—'} / ${x.planned}</b><small>${round(x.elapsed,1)} d consumidos</small></div><div class="v61-phases">${v61Phase('RD',x.plan.rd,x.actual.rd)}${v61Phase('MOVE',x.plan.rm,x.actual.rm)}${v61Phase('RU',x.plan.ru,x.actual.ru)}</div><div class="v61-loss"><div><span>Flat Time</span><b>${round(x.flat,1)} h</b></div><small>${x.pending?`${x.pending} email${x.pending===1?'':'s'} pendiente${x.pending===1?'':'s'}`:`Gap crítico ${x.worst>0?'+':''}${x.worst} pp`}</small></div><span class="v61-live-arrow">›</span></button>`).join('')}</div>`:'<div class="v61-live-empty">No hay Moves en ejecución.</div>'}
function v61Summary(items){const active=items.length,on=items.filter(x=>x.health==='good').length,risk=items.filter(x=>x.health==='bad').length,flat=items.reduce((s,x)=>s+x.flat,0);return `<div class="v61-summary"><div><span>Moves en curso</span><b>${active}</b><small>operación activa</small></div><div><span>On Plan</span><b>${active?Math.round(on/active*100):0}%</b><small>${on} de ${active}</small></div><div><span>En riesgo</span><b>${risk}</b><small>requieren atención</small></div><div><span>Flat Time</span><b>${round(flat,1)} h</b><small>acumulado activo</small></div></div>`}
function v61Agg(rows){const a=v4Aggregates(rows);return a}
function v61Compare(rows){const n=Math.max(1,rows.length),av={plan:rows.reduce((s,x)=>s+num(x.plan),0)/n,gross:rows.reduce((s,x)=>s+num(x.gross),0)/n,net:rows.reduce((s,x)=>s+num(x.net),0)/n},max=Math.max(1,av.plan,av.gross,av.net);return `<div class="v61-panel"><div class="v61-panel-head"><div><h2>Plan vs Gross vs Net</h2><div class="sub">Promedio por Move · días</div></div></div><div class="v61-compare">${[['Plan','plan'],['Gross','gross'],['Net','net']].map(([l,k])=>`<div class="v61-compare-row ${k}"><b>${l}</b><span class="track"><i style="width:${av[k]/max*100}%"></i></span><strong>${round(av[k],1)} d</strong></div>`).join('')}</div></div>`}
function v61CauseBars(rows){const g={};let legacy=0;for(const x of rows){if(x.move?.exec?.closures){for(const c of Object.values(x.move.exec.closures))for(const e of c.flatEvents||[]){const k=FLAT_TYPES.find(t=>t.id===e.type)?.label||e.type||'Otros';g[k]=(g[k]||0)+eventHours(e)}}else legacy+=num(x.flatHours)}if(legacy)g['Histórico sin desglose']=(g['Histórico sin desglose']||0)+legacy;const vals=Object.entries(g).sort((a,b)=>b[1]-a[1]).slice(0,7),max=Math.max(1,...vals.map(x=>x[1]));return `<div class="v61-panel"><div class="v61-panel-head"><div><h2>Flat Time por causa</h2><div class="sub">Horas netas</div></div></div><div class="v61-bars">${vals.length?vals.map(([k,v])=>`<div class="v61-bar"><span class="name">${esc(k)}</span><span class="track"><i style="width:${v/max*100}%"></i></span><strong>${round(v,1)} h</strong></div>`).join(''):'<div class="v61-live-empty">Sin Flat Time registrado.</div>'}</div></div>`}
function v61HistoryTable(rows){const sorted=rows.slice().sort((a,b)=>new Date(b.acceptance||0)-new Date(a.acceptance||0));return `<div class="v61-panel"><div class="v61-panel-head"><div><h2>Moves finalizadas</h2><div class="sub">Histórico operacional</div></div><span class="v61-badge gray">${rows.length}</span></div><div class="v61-history-list"><table class="v61-history-table"><thead><tr><th>Rig / Operator</th><th>Plan</th><th>Gross</th><th>Net</th><th>Flat</th><th>Var.</th><th>Adherence</th></tr></thead><tbody>${sorted.map(x=>{const s=v4Score(x),v=num(x.gross)-num(x.plan);return `<tr data-v61-hist="${x.id}"><td><b>${esc(x.rig)}</b><div style="color:#71879b;font-size:8px;margin-top:2px">${esc(x.operator||'')} · ${esc(x.origin||'')} → ${esc(x.destination||'')}</div></td><td>${round(x.plan,1)} d</td><td>${round(x.gross,1)} d</td><td>${round(x.net,1)} d</td><td>${round(x.flatHours,1)} h</td><td class="v61-var ${v>0?'bad':'good'}">${v>0?'+':''}${round(v,1)} d</td><td><span class="v61-score">${s.score??'—'}</span></td></tr>`}).join('')}</tbody></table></div></div>`}
function v61FilterBar(){const all=v4RealHistoryRows(),uniq=a=>['Todos',...new Set(a.filter(Boolean))],f=state.filters||{};return `<div class="v61-filters"><select id="v61Rig">${uniq(all.map(x=>x.rig)).map(x=>`<option ${f.rig===x?'selected':''}>${esc(x)}</option>`).join('')}</select><select id="v61Operator">${uniq(all.map(x=>x.operator)).map(x=>`<option ${f.operator===x?'selected':''}>${esc(x)}</option>`).join('')}</select><select id="v61Company">${uniq(all.map(x=>x.company)).map(x=>`<option ${f.company===x?'selected':''}>${esc(x)}</option>`).join('')}</select><button id="v61Clear" class="v61-filter-clear">Limpiar</button></div>`}
function v61Group(rows,key){const g={};for(const x of rows){const k=x[key]||'Sin dato',s=v4Score(x).score;if(s==null)continue;const a=g[k]||(g[k]={n:0,sum:0});a.n++;a.sum+=s}return Object.entries(g).map(([name,a])=>({name,n:a.n,score:Math.round(a.sum/a.n)})).sort((a,b)=>b.score-a.score)}
function v61RankPanel(title,items,meta='Moves'){return `<div class="v61-panel"><div class="v61-panel-head"><div><h2>${esc(title)}</h2><div class="sub">Top performance</div></div></div><div class="v61-rank">${items.slice(0,5).map((x,i)=>`<div class="v61-rank-row"><span class="n">${i+1}</span><span><span class="name">${esc(x.name)}</span><span class="meta">${x.n} ${meta}</span></span><span class="score"><b>${x.score}</b><span>score</span></span></div>`).join('')||'<div class="v61-live-empty">Sin datos.</div>'}</div></div>`}
function v61MoveRank(rows,title,worst=false){const vals=rows.map(x=>({x,score:v4Score(x).score})).filter(z=>z.score!=null).sort((a,b)=>worst?a.score-b.score:b.score-a.score).slice(0,5);return `<div class="v61-panel"><div class="v61-panel-head"><div><h2>${esc(title)}</h2><div class="sub">${worst?'Mayor oportunidad':'Mejor adherencia'}</div></div></div><div class="v61-rank">${vals.map((z,i)=>`<button class="v61-rank-row" data-v61-hist="${z.x.id}"><span class="n">${i+1}</span><span><span class="name">${esc(z.x.rig)} · ${esc(z.x.operator||'')}</span><span class="meta">Plan ${round(z.x.plan,1)}d · Gross ${round(z.x.gross,1)}d · Net ${round(z.x.net,1)}d</span></span><span class="score"><b>${z.score}</b><span>score</span></span></button>`).join('')||'<div class="v61-live-empty">Sin datos.</div>'}</div></div>`}
function v61OpenLive(id){const m=state.moves.find(x=>x.id===id);if(!m)return;const x=v61LiveData(m);sheetRoot.innerHTML=`<div class="sheet-backdrop"><div class="sheet"><div class="sheet-handle"></div><div class="v61-intel"><div class="hero"><b>${esc(m.meta.rig)}</b><span>${esc(m.meta.operator||'')} · ${esc(m.meta.origin)} → ${esc(m.meta.destination)}</span></div><div class="v61-intel-grid"><div class="v61-intel-kpi"><span>Estado</span><b>${v61HealthLabel(x)}</b></div><div class="v61-intel-kpi"><span>Tiempo</span><b>${round(x.elapsed,1)} / ${x.planned} d</b></div><div class="v61-intel-kpi"><span>Flat Time</span><b>${round(x.flat,1)} h</b></div><div class="v61-intel-kpi"><span>Rig Down</span><b>${x.actual.rd}%</b></div><div class="v61-intel-kpi"><span>Rig Move</span><b>${x.actual.rm}%</b></div><div class="v61-intel-kpi"><span>Rig Up</span><b>${x.actual.ru}%</b></div></div><div class="v61-phases">${v61Phase('RD',x.plan.rd,x.actual.rd)}${v61Phase('MOVE',x.plan.rm,x.actual.rm)}${v61Phase('RU',x.plan.ru,x.actual.ru)}</div></div><div class="sheet-footer"><button id="v61CloseIntel" class="btn">Cerrar</button>${hasPerm?.('execute')?'<button id="v61OpenMove" class="btn primary">Abrir Move</button>':''}</div></div></div>`;el('v61CloseIntel').onclick=closeSheet;if(el('v61OpenMove'))el('v61OpenMove').onclick=()=>{closeSheet();state.selectedMoveId=m.id;state.screen='execute';state.execMode='days';save();render()}}
renderOverall=function(){
 state.overallTab=['live','history','top'].includes(state.overallTab)?state.overallTab:'live';const tab=state.overallTab,live=v61Live(),rows=v61Hist(),a=v61Agg(rows);
 const head=`<div class="v61-perf-head"><div><div class="eyebrow">RIGGO · OPERATIONAL INTELLIGENCE</div><h1>Performance</h1><div class="sub">Visibilidad ejecutiva de Moves en curso e histórico</div></div><div class="v61-tabs"><button class="${tab==='live'?'active':''}" data-v61-tab="live">En curso</button><button class="${tab==='history'?'active':''}" data-v61-tab="history">Histórico</button><button class="${tab==='top'?'active':''}" data-v61-tab="top">Top</button></div></div>`;
 let body='';
 if(tab==='live')body=`${v61Summary(live)}<div class="v61-panel"><div class="v61-panel-head"><div><h2>Moves en ejecución</h2><div class="sub">Plan vs Actual · tiempo consumido · pérdidas</div></div><span class="v61-badge gray">${live.length}</span></div>${v61LiveRows(live)}</div>`;
 if(tab==='history')body=`${v61FilterBar()}<div class="v61-summary"><div><span>Moves finalizadas</span><b>${a.moves}</b><small>histórico filtrado</small></div><div><span>On Plan</span><b>${a.onPlanPct}%</b><small>Gross ≤ Plan</small></div><div><span>Avg Variance</span><b>${a.avgVar>=0?'+':''}${round(a.avgVar,1)} d</b><small>Gross vs Plan</small></div><div><span>Flat Time</span><b>${round(a.flat,1)} h</b><small>acumulado</small></div></div><div class="v61-grid2">${v61Compare(rows)}${v61CauseBars(rows)}</div>${v61HistoryTable(rows)}`;
 if(tab==='top')body=`${v61FilterBar()}<div class="v61-top-grid">${v61MoveRank(rows,'Top Moves')}${v61MoveRank(rows,'Mayor oportunidad',true)}${v61RankPanel('Top Rigs',v61Group(rows,'rig'))}${v61RankPanel('Top Operators',v61Group(rows,'operator'))}${v61RankPanel('Top Move Companies',v61Group(rows,'company'))}</div>`;
 return `<div class="v61-perf">${head}${body}</div>`;
};
wireOverall=function(){
 document.querySelectorAll('[data-v61-tab]').forEach(b=>b.onclick=()=>{state.overallTab=b.dataset.v61Tab;save();render();try{window.scrollTo(0,0)}catch(_){}});
 const bind=(id,key)=>el(id)?.addEventListener('change',e=>{state.filters=state.filters||{};state.filters[key]=e.target.value;save();render()});bind('v61Rig','rig');bind('v61Operator','operator');bind('v61Company','company');el('v61Clear')?.addEventListener('click',()=>{state.filters={...(state.filters||{}),rig:'Todos',operator:'Todos',company:'Todos'};save();render()});
 document.querySelectorAll('[data-v61-live]').forEach(b=>b.onclick=()=>v61OpenLive(b.dataset.v61Live));document.querySelectorAll('[data-v61-hist]').forEach(b=>b.onclick=()=>v4MoveIntel(b.dataset.v61Hist));
};

window.RigGOV61={release:RELEASE,build:BUILD,missing:v61Missing,email:v61EmailHtml,live:v61Live,history:v61Hist};

setTimeout(()=>{try{if(state?.auth?.logged&&!document.documentElement.classList.contains('riggo-booting'))render()}catch(_){}},100);
})();

/* ===== SOURCE riggo-v70.js (consolidated) ===== */
/* RigGO 7.0 · Finalization Candidate 1
   Surgical layer on frozen 6.1 baseline:
   session persistence choice, planning template-first flow, strict Flat Time,
   Daily Move Update distribution cleanup, and Outlook-safe email assets. */
(function(){
'use strict';
const RELEASE='7.0.0-finalization-c1';
const BUILD='2026-08-16-0851-C1';




const q=id=>document.getElementById(id);
const esc=v=>typeof enc==='function'?enc(v??''):String(v??'');
const isAdmin=()=>{try{return !!hasPerm('admin')}catch(_){return false}};
const REMEMBER_KEY='riggo_remember_session_v70', SESSION_KEY='riggo_session_active_v70';

/* ---------- 1/2/3 Login copy + functional remember session ---------- */
try{if(localStorage.getItem(REMEMBER_KEY)===null)localStorage.setItem(REMEMBER_KEY,'1')}catch(_){ }
const BASE_RENDER_LOGIN=renderLogin;
renderLogin=function(){
  BASE_RENDER_LOGIN();
  const copy=document.querySelector('.v3-login-copy');
  if(copy){
    const h=copy.querySelector('h2');if(h)h.innerHTML='Gestiona tu<br>Movilización<br>con Excelencia.';
  }
  const card=document.querySelector('.login-card');
  if(!card)return;
  const actions=card.querySelector('.auth-actions');
  if(actions&&!q('v70Remember')){
    const row=document.createElement('label');row.className='v70-remember';
    let checked=true;try{checked=localStorage.getItem(REMEMBER_KEY)!=='0'}catch(_){ }
    row.innerHTML=`<input id="v70Remember" type="checkbox" ${checked?'checked':''}><span>Mantener sesión iniciada</span>`;
    actions.parentNode.insertBefore(row,actions);
  }
  const btn=q('loginBtn');
  if(btn&&!btn.dataset.v70Remember){
    btn.dataset.v70Remember='1';const old=btn.onclick;
    btn.onclick=async function(ev){
      const remember=!!q('v70Remember')?.checked;
      try{localStorage.setItem(REMEMBER_KEY,remember?'1':'0');sessionStorage.setItem(SESSION_KEY,'1')}catch(_){ }
      return old?.call(this,ev);
    };
  }
  const signup=q('signupBtn');
  if(signup&&!signup.dataset.v70Remember){
    signup.dataset.v70Remember='1';const old=signup.onclick;
    signup.onclick=async function(ev){
      const remember=!!q('v70Remember')?.checked;
      try{localStorage.setItem(REMEMBER_KEY,remember?'1':'0');sessionStorage.setItem(SESSION_KEY,'1')}catch(_){ }
      return old?.call(this,ev);
    };
  }
  const pass=q('loginPassword');if(pass)pass.onkeydown=e=>{if(e.key==='Enter')q('loginBtn')?.click()};
};

/* On a new browser session, an unchecked preference must not silently restore a stale Supabase token.
   sessionStorage survives refreshes in the same tab, so refresh remains signed in. */
async function v70ReconcileSession(){
  const SB=window.RigGOSupabase;if(!SB)return;
  let remember=true,active=false;
  try{remember=localStorage.getItem(REMEMBER_KEY)!=='0';active=sessionStorage.getItem(SESSION_KEY)==='1'}catch(_){ }
  if(!remember&&!active){
    try{await SB.auth.signOut()}catch(_){ }
    state.auth={email:'',logged:false};state.users=[];state.moves=[];state.selectedMoveId=null;
    try{saveLocal()}catch(_){ }
    renderLogin();return;
  }
  if(state.auth?.logged){try{sessionStorage.setItem(SESSION_KEY,'1')}catch(_){ }}
  else if(remember||active){try{await tryRemoteSession();if(state.auth?.logged)sessionStorage.setItem(SESSION_KEY,'1')}catch(_){ }}
}
setTimeout(v70ReconcileSession,180);

/* Clear only the tab-session marker on explicit logout; remember preference itself remains for next login. */
const BASE_WIRE_GLOBAL=wireGlobal;
wireGlobal=function(){
  BASE_WIRE_GLOBAL();
  document.querySelectorAll('[data-global="logout"]').forEach(btn=>{
    if(btn.dataset.v70Logout)return;btn.dataset.v70Logout='1';const old=btn.onclick;
    btn.onclick=async function(ev){try{sessionStorage.removeItem(SESSION_KEY)}catch(_){ }return old?.call(this,ev)};
  });
};

/* ---------- 4 Flat Time: strict absolute chronology and period bounds ---------- */
const BASE_EVENT_HOURS=eventHours;
eventHours=function(e){
  if(e?.start&&e?.end){const a=new Date(e.start).getTime(),b=new Date(e.end).getTime();if(!Number.isFinite(a)||!Number.isFinite(b)||b<=a)return 0;return Math.max(0,(b-a)/3600000)}
  return Math.max(0,Number(e?.hours)||0);
};
intervalUnionHours=function(events,period){
  const ps=new Date(period.start).getTime(),pe=new Date(period.end).getTime(),intervals=[],manual=[];
  for(const e of events||[]){
    if(e.start&&e.end){let a=new Date(e.start).getTime(),b=new Date(e.end).getTime();if(!Number.isFinite(a)||!Number.isFinite(b)||b<=a)continue;a=Math.max(a,ps);b=Math.min(b,pe);if(b>a)intervals.push([a,b])}
    else if(Number(e.hours)>0)manual.push(Number(e.hours));
  }
  intervals.sort((a,b)=>a[0]-b[0]);let total=0,cur=null;
  for(const x of intervals){if(!cur)cur=[...x];else if(x[0]<=cur[1])cur[1]=Math.max(cur[1],x[1]);else{total+=(cur[1]-cur[0])/3600000;cur=[...x]}}
  if(cur)total+=(cur[1]-cur[0])/3600000;return total+manual.reduce((a,b)=>a+b,0);
};
const BASE_FLAT_FORM=flatForm;
flatForm=function(type,m,p,c,existing=null){
  let h=BASE_FLAT_FORM(type,m,p,c,existing),min=toInput(p.start),max=toInput(p.end);
  h=h.replace('id="flatStart" class="field" type="datetime-local"',`id="flatStart" class="field" type="datetime-local" min="${min}" max="${max}"`)
     .replace('id="flatEnd" class="field" type="datetime-local"',`id="flatEnd" class="field" type="datetime-local" min="${min}" max="${max}"`);
  return h;
};
openFlatSheet=function(type,m,p,c){
  sheetRoot.innerHTML=flatForm(type,m,p,c);try{enhanceTimeInputs()}catch(_){ }
  q('cancelSheet').onclick=closeSheet;
  q('saveFlat').onclick=()=>{
    const e={id:(typeof safeId==='function'?safeId():uid()),type,start:inputToIso(q('flatStart').value),end:inputToIso(q('flatEnd').value),ongoing:q('flatOngoing').checked,subtype:q('flatSubtype')?.value||'',affected:q('flatAffected')?.value||'',company:q('flatCompany')?.value||'',responsibility:q('flatResponsibility').value,commercial:q('flatCommercial').value,issue:q('flatIssue')?.value||'',resource:q('flatResource')?.value||'',capacity:q('flatCapacity')?.value||'',failureMode:q('flatFailure')?.value||'',description:q('flatDescription').value.trim()};
    if(!e.start||!e.end){alert('Completa Desde y Hasta.');return}
    const a=new Date(e.start).getTime(),b=new Date(e.end).getTime(),ps=new Date(p.start).getTime(),pe=new Date(p.end).getTime();
    if(!Number.isFinite(a)||!Number.isFinite(b)||b<=a){alert('Revisa el intervalo de Flat Time.');return}
    if(a<ps||b>pe){alert('El Flat Time debe estar dentro del periodo del día.');return}
    if(['community','move_company','rig_repair','operator','hse','other','mobility','road'].includes(type)&&!e.description){alert('Completa el detalle.');return}
    c.flatEvents=c.flatEvents||[];c.flatEvents.push(e);m.audit=m.audit||[];m.audit.push({at:nowIso(),user:state.auth.email,action:'flat_time_add',period:p.id,type});save();closeSheet();render();try{scrollTopNow()}catch(_){ }
  };
};

/* ---------- 5/6/7 Planning: Template first; X38 demo Admin only; one distribution ---------- */
const V70_STEPS=['import','general','scope','resources','milestones','access','distribution','activate'];
const V70_LABELS=['Importar Template','Información','Alcance','Recursos','Hitos','Acceso','Distribución','Activar'];
const BASE_NEW_MOVE=newMove,BASE_IMPORT=importWorkbook;
newMove=function(createdBy=''){
  const m=BASE_NEW_MOVE(createdBy);m.meta.rig='';m.meta.operator='';m.meta.origin='';m.meta.destination='';m.reportConfig=m.reportConfig||{};m.reportConfig.f0065To='';m.reportConfig.f0065Cc='';return m;
};
function v70IsDemo(m){return false}
try{for(const m of state.moves||[]){if(v70IsDemo(m)){m.management=m.management||{};m.management.demo=true;m.management.type='Prueba'}}}catch(_){ }
if(typeof canAccessMove==='function'){
  const BASE_CAN_ACCESS_V70=canAccessMove;
  canAccessMove=function(user,m){if(v70IsDemo(m)&&!user?.permissions?.includes('admin'))return false;return BASE_CAN_ACCESS_V70(user,m)};
}
if(typeof v4VisibleMove==='function'){
  const BASE_VISIBLE_V70=v4VisibleMove;v4VisibleMove=function(m){if(v70IsDemo(m)&&!isAdmin())return false;return BASE_VISIBLE_V70(m)};
}
if(typeof v4OperationalMoves==='function'){
  const BASE_OP_MOVES_V70=v4OperationalMoves;v4OperationalMoves=function(){return BASE_OP_MOVES_V70().filter(m=>isAdmin()||!v70IsDemo(m))};
}
if(typeof v4RealHistoryRows==='function'){
  const BASE_HIST_V70=v4RealHistoryRows;v4RealHistoryRows=function(){return BASE_HIST_V70().filter(x=>isAdmin()||!v70IsDemo(x.move))};
}
function v70ImportStep(m){
  const loaded=m.plan?.loaded;
  return `<div class="panel v70-import-panel"><div class="v70-import-mark">MOVE TEMPLATE</div><h2>${loaded?'Template importado':'Importar Move Template'}</h2><div class="v70-import-file">${loaded?esc(m.plan.fileName):'Rig Down · Transporte · Rig Up'}</div><div class="v70-import-actions"><label class="btn primary big">${loaded?'Reemplazar Template':'Importar Template'}<input id="planFile" type="file" accept=".xlsx" hidden></label><a class="btn blue big" href="./assets/RigGO_Move_Template.xlsx" download="RigGO_Move_Template.xlsx">Descargar Template</a></div>${loaded?`<div class="v70-import-summary"><span>Rig Down <b>${m.plan.tasksRD?.length||0}</b></span><span>Transporte <b>${typeof plannedLoadTotal==='function'?plannedLoadTotal(m):0}</b></span><span>Rig Up <b>${m.plan.tasksRU?.length||0}</b></span></div>`:''}</div>`;
}
function v70General(m){const rigs=['X38','X40','X42','X43','X45','M47','M48','992','993','609','794','137','338','238'];return `<div class="panel"><h2>Información de la Move</h2><div class="grid g3"><label>Rig<select id="pRig" class="field"><option value="">Seleccionar Rig</option>${rigs.map(x=>`<option ${x===m.meta.rig?'selected':''}>${x}</option>`).join('')}</select></label><label>Operador<input id="pOperator" class="field" value="${esc(m.meta.operator)}"></label><label>Distancia (km)<input id="pDistance" class="field" type="number" step=".1" value="${m.meta.distanceKm||''}"></label><label>Origen<input id="pOrigin" class="field" value="${esc(m.meta.origin)}"></label><label>Destino<input id="pDestination" class="field" value="${esc(m.meta.destination)}"></label><label>Rig Release planificado<input id="pRelease" class="field" type="datetime-local" value="${toInput(m.meta.projectedRelease)}"></label><label>Días planificados<input id="pDays" class="field" type="number" step=".25" value="${m.meta.plannedDays||''}"></label><label>Empresa de movilización<input id="pCompany" class="field" value="${esc(m.meta.moveCompany)}"></label><label>Empresa apoyo arme / desarme<input id="pSupport" class="field" value="${esc(m.meta.supportCompany)}"></label></div></div>`}
function v70Access(m){const execUsers=state.users.filter(u=>u.active&&u.permissions.includes('execute'));return `<div class="panel"><h2>Acceso Rig Managers</h2><div class="access-choice"><button class="choice ${m.access.mode==='all'?'selected':''}" data-accessmode="all"><b>Todos</b><div class="small muted" style="margin-top:5px">Usuarios con permiso Ejecutar Move</div></button><button class="choice ${m.access.mode==='assigned'?'selected':''}" data-accessmode="assigned"><b>Asignados</b><div class="small muted" style="margin-top:5px">Solo correos seleccionados</div></button></div>${m.access.mode==='assigned'?`<div class="user-check-list">${execUsers.map(u=>`<label class="user-check"><input type="checkbox" data-assigned="${esc(u.email)}" ${(m.access.assignedEmails||[]).includes(u.email)?'checked':''}><span><b>${esc(u.name||u.email)}</b><div class="tiny muted">${esc(u.email)}</div></span></label>`).join('')}</div>`:''}</div>`}
const V103_RECIPIENT_CHAR_LIMIT=500;
const V103_RECIPIENT_CHAR_MESSAGE='La distribución entre Para y CC no puede superar 500 caracteres.';
function v103CharPairOk(to,cc,show=true){const n=String(to||'').length+String(cc||'').length;if(n>V103_RECIPIENT_CHAR_LIMIT){if(show)alert(V103_RECIPIENT_CHAR_MESSAGE);return false}return true}
function v103BindCharPair(toId,ccId,onAccepted){
  const a=q(toId),b=q(ccId);if(!a||!b)return;
  const apply=(changed,other,notify)=>{const max=Math.max(0,V103_RECIPIENT_CHAR_LIMIT-String(other.value||'').length);changed.maxLength=max;if(changed.value.length>max){changed.value=changed.value.slice(0,max);if(notify)alert(V103_RECIPIENT_CHAR_MESSAGE)}other.maxLength=Math.max(0,V103_RECIPIENT_CHAR_LIMIT-String(changed.value||'').length);try{onAccepted?.(a.value,b.value)}catch(_){}};
  a.maxLength=Math.max(0,V103_RECIPIENT_CHAR_LIMIT-String(b.value||'').length);b.maxLength=Math.max(0,V103_RECIPIENT_CHAR_LIMIT-String(a.value||'').length);
  if(a.value.length+b.value.length>V103_RECIPIENT_CHAR_LIMIT){b.value=b.value.slice(0,Math.max(0,V103_RECIPIENT_CHAR_LIMIT-a.value.length))}
  ['input','change','paste'].forEach(ev=>{a.addEventListener(ev,()=>setTimeout(()=>apply(a,b,true),0));b.addEventListener(ev,()=>setTimeout(()=>apply(b,a,true),0))});
}
window.RigGORecipientChars={limit:V103_RECIPIENT_CHAR_LIMIT,message:V103_RECIPIENT_CHAR_MESSAGE,ok:v103CharPairOk,bind:v103BindCharPair};
function v70Distribution(m){return `<div class="panel v70-distribution"><h2>Distribución · Daily Move Update</h2><div class="grid g2"><label>Para<textarea id="dailyTo" class="field" rows="4" maxlength="500" placeholder="correo@nabors.com; correo2@nabors.com;">${esc(m.reportConfig?.dailyTo||'')}</textarea></label><label>CC<textarea id="dailyCc" class="field" rows="4" maxlength="500" placeholder="correo@nabors.com; correo2@nabors.com;">${esc(m.reportConfig?.dailyCc||'')}</textarea></label></div><div class="small muted v70-email-help">Separe los correos electrónicos con ;</div></div>`}
function v70Activate(m){return `<div class="panel"><h2>Activar Move</h2><div class="grid g3"><div class="kpi info"><span>Rig</span><b>${esc(m.meta.rig||'—')}</b><small>${esc(m.meta.operator||'')}</small></div><div class="kpi info"><span>Ruta</span><b>${Number(m.meta.distanceKm)||0} km</b><small>${esc(m.meta.origin||'Origen')} → ${esc(m.meta.destination||'Destino')}</small></div><div class="kpi info"><span>Plan importado</span><b>${m.plan.loaded?'Listo':'Pendiente'}</b><small>${m.plan.loaded?esc(m.plan.fileName):'Importa el Move Template'}</small></div></div><div class="row wrap" style="margin-top:14px"><button id="activateMove" class="btn primary big" ${m.plan.loaded?'':'disabled'}>${m.status==='draft'?'Activar Move':'Guardar cambios'}</button></div></div>`}
function v70PlanStep(m,i){if(i===0)return v70ImportStep(m);if(i===1)return v70General(m);if(i===2)return planScope(m);if(i===3)return planResources(m);if(i===4)return planMilestones(m);if(i===5)return v70Access(m);if(i===6)return v70Distribution(m);return v70Activate(m)}
function v70ParseEmailText(text){const raw=String(text||'').split(/[;,\n]/).map(x=>x.trim()).filter(Boolean),re=/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;return{emails:[...new Set(raw.filter(x=>re.test(x)).map(x=>x.toLowerCase()))],invalid:raw.filter(x=>!re.test(x))}}
function v70DistributionValid(m,show=true){if(!v103CharPairOk(m.reportConfig?.dailyTo||'',m.reportConfig?.dailyCc||'',show))return false;const a=v70ParseEmailText(m.reportConfig?.dailyTo),b=v70ParseEmailText(m.reportConfig?.dailyCc),bad=[...a.invalid,...b.invalid];if(bad.length&&show)alert('Revisa: '+bad.join(', '));return !bad.length}
renderPlan=function(){const m=currentMove();if(!m)return renderPlanList();const i=Math.max(0,Math.min(V70_STEPS.length-1,Number(state.planStep)||0));state.planStep=i;return `<div class="screen-title"><div><h1>Cargar Plan${m.meta.rig?` · ${esc(m.meta.rig)}`:''}</h1><p>${esc(m.meta.origin||'Origen')} → ${esc(m.meta.destination||'Destino')}</p></div><button class="btn ghost" id="backPlanList">← Moves</button></div><div class="plan-shell v70-plan"><aside class="panel side-nav">${V70_STEPS.map((s,n)=>`<button data-planstep="${n}" class="${i===n?'active':''}">${n+1}. ${V70_LABELS[n]}</button>`).join('')}</aside><section><div class="step-content">${v70PlanStep(m,i)}</div><div class="step-footer"><button class="btn" id="planPrev" ${i===0?'disabled':''}>← Anterior</button><div class="step-name">${i+1} / ${V70_STEPS.length} · ${V70_LABELS[i]}</div><button class="btn primary" id="planNext" ${i===V70_STEPS.length-1||i===0&&!m.plan.loaded?'disabled':''}>Siguiente →</button></div></section></div>`}
function v70CapturePlan(m){
  if(q('pRig'))m.meta.rig=q('pRig').value;if(q('pOperator'))m.meta.operator=q('pOperator').value;if(q('pDistance'))m.meta.distanceKm=+q('pDistance').value||0;if(q('pOrigin'))m.meta.origin=q('pOrigin').value;if(q('pDestination'))m.meta.destination=q('pDestination').value;if(q('pRelease'))m.meta.projectedRelease=inputToIso(q('pRelease').value);if(q('pDays'))m.meta.plannedDays=+q('pDays').value||0;if(q('pCompany'))m.meta.moveCompany=q('pCompany').value;if(q('pSupport'))m.meta.supportCompany=q('pSupport').value;
  if(q('miniEnabled'))m.scope.mini=q('miniEnabled').checked;if(q('miniLoads'))m.scope.miniLoads=+q('miniLoads').value||0;if(q('miniUnits'))m.scope.miniUnits=+q('miniUnits').value||0;if(q('campEnabled'))m.scope.camp=q('campEnabled').checked;if(q('campLoads'))m.scope.campLoads=+q('campLoads').value||0;if(q('campUnits'))m.scope.campUnits=+q('campUnits').value||0;if(q('thirdLoads'))m.scope.thirdLoads=+q('thirdLoads').value||0;
  if(q('hseEmergency'))m.hse.emergency=q('hseEmergency').value;if(q('hseMedic'))m.hse.medic=q('hseMedic').value;if(q('hseSafety'))m.hse.safety=q('hseSafety').value;
  m.reportConfig=m.reportConfig||{};if(q('dailyTo'))m.reportConfig.dailyTo=q('dailyTo').value.trim();if(q('dailyCc'))m.reportConfig.dailyCc=q('dailyCc').value.trim();m.reportConfig.f0065To='';m.reportConfig.f0065Cc='';save();
}
capturePlan=v70CapturePlan;
wirePlan=function(){
  const m=currentMove();v103BindCharPair('dailyTo','dailyCc',(to,cc)=>{m.reportConfig=m.reportConfig||{};m.reportConfig.dailyTo=to.trim();m.reportConfig.dailyCc=cc.trim();saveLocal()});const nav=target=>{v70CapturePlan(m);if(Number(state.planStep)===6&&target>6&&!v70DistributionValid(m))return;if(target>0&&!m.plan.loaded){toast('Importa el Move Template');return}state.planStep=Math.max(0,Math.min(V70_STEPS.length-1,target));save();render()};
  q('backPlanList').onclick=()=>{v70CapturePlan(m);state.screen='planList';save();render()};document.querySelectorAll('[data-planstep]').forEach(b=>b.onclick=()=>nav(+b.dataset.planstep));q('planPrev').onclick=()=>nav((Number(state.planStep)||0)-1);q('planNext').onclick=()=>nav((Number(state.planStep)||0)+1);
  q('miniEnabled')?.addEventListener('change',e=>{q('miniFields')?.classList.toggle('hidden',!e.target.checked);v70CapturePlan(m)});q('campEnabled')?.addEventListener('change',e=>{q('campFields')?.classList.toggle('hidden',!e.target.checked);v70CapturePlan(m)});
  document.querySelectorAll('[data-res]').forEach(el=>el.oninput=e=>{const type=e.target.dataset.res,i=+e.target.dataset.i,k=e.target.dataset.k,list=type==='crew'?m.crew:type==='vehicle'?m.vehicles:m.lmc;list[i][k]=k==='qty'?+e.target.value:e.target.value;save()});
  document.querySelectorAll('[data-delres]').forEach(b=>b.onclick=()=>{const t=b.dataset.delres,i=+b.dataset.i;(t==='crew'?m.crew:t==='vehicle'?m.vehicles:m.lmc).splice(i,1);save();render()});
  document.querySelectorAll('[data-addres]').forEach(b=>b.onclick=()=>{const t=b.dataset.addres;if(t==='crew')m.crew.push({company:'Nabors',role:'Nuevo cargo',qty:1});if(t==='vehicle')m.vehicles.push({type:'Vehículo',qty:1,capacity:'',owner:'Empresa de Move',company:m.meta.moveCompany});if(t==='lmc')m.lmc.push({type:'Grúa',qty:1,capacity:'',use:'Ambos',owner:'Empresa de Move',company:m.meta.moveCompany,operational:'Sí'});save();render()});
  q('addMilestone')?.addEventListener('click',()=>{m.milestones.push({name:'Nuevo hito',base:'',forecast:''});save();render()});document.querySelectorAll('[data-ms]').forEach(el=>el.oninput=e=>{m.milestones[+e.target.dataset.ms][e.target.dataset.k]=['base','forecast'].includes(e.target.dataset.k)?inputToIso(e.target.value):e.target.value;save()});document.querySelectorAll('[data-delms]').forEach(b=>b.onclick=()=>{m.milestones.splice(+b.dataset.delms,1);save();render()});
  document.querySelectorAll('[data-accessmode]').forEach(b=>b.onclick=()=>{m.access.mode=b.dataset.accessmode;if(m.access.mode==='all')m.access.assignedEmails=[];save();render()});document.querySelectorAll('[data-assigned]').forEach(ch=>ch.onchange=()=>{const set=new Set(m.access.assignedEmails||[]);ch.checked?set.add(ch.dataset.assigned):set.delete(ch.dataset.assigned);m.access.assignedEmails=[...set];save()});
  q('planFile')?.addEventListener('change',e=>importWorkbook(m,e));q('activateMove')?.addEventListener('click',()=>{v70CapturePlan(m);if(!v70DistributionValid(m))return;activateMove(m)});
};
importWorkbook=async function(m,e){const file=e.target.files?.[0],beforePlan=m.plan;await BASE_IMPORT(m,e);if(file&&m.plan!==beforePlan&&m.plan?.loaded&&m.plan.fileName===file.name){m.plan.legacy=false;state.planStep=1;save();render()}}

/* ---------- 8 Dynamic recipients in Daily Move Update ---------- */
const BASE_RENDER_REVIEW=renderReview,BASE_WIRE_REVIEW=wireReview;
renderReview=function(){
  const m=currentMove(),p=m?selectedPeriod(m):null,c=(m&&p)?ensureClosure(m,p.id):null;
  if(m&&c){if(c.deliveryTo==null)c.deliveryTo=m.reportConfig?.dailyTo||'';if(c.deliveryCc==null)c.deliveryCc=m.reportConfig?.dailyCc||''}
  let h=BASE_RENDER_REVIEW();
  h=String(h).replace('id="deliveryTo"','id="deliveryTo" maxlength="500"').replace('id="deliveryCc"','id="deliveryCc" maxlength="500"');
  if(String(h).includes('id="deliveryTo"'))h=h.replace('<div class="small muted">Asunto:',`<div class="v70-delivery-tools"><span>Separe los correos electrónicos con ;</span><div><button id="v70RestoreRecipients" class="btn small">Restablecer predeterminados</button><button id="v70ClearRecipients" class="btn small">Borrar todos</button></div></div><div class="small muted">Asunto:`);
  return h;
};
wireReview=function(){
  BASE_WIRE_REVIEW();const m=currentMove(),p=m?selectedPeriod(m):null,c=(m&&p)?ensureClosure(m,p.id):null;if(!m||!c)return;
  v103BindCharPair('deliveryTo','deliveryCc',(to,cc)=>{c.deliveryTo=to.trim();c.deliveryCc=cc.trim();saveLocal()});
  q('v70RestoreRecipients')?.addEventListener('click',()=>{c.deliveryTo=m.reportConfig?.dailyTo||'';c.deliveryCc=m.reportConfig?.dailyCc||'';save();render()});
  q('v70ClearRecipients')?.addEventListener('click',()=>{c.deliveryTo='';c.deliveryCc='';save();render()});
};

/* Harden report navigation cumulatively: later/visited tabs cannot bypass missing prior data. */
const BASE_WIRE_REPORT_V70=wireReport;
function v70ShowMissing(missing){document.querySelectorAll('.v61-required-error').forEach(x=>x.classList.remove('v61-required-error'));document.querySelector('.v61-validation-banner')?.remove();if(!missing.length)return false;const banner=document.createElement('div');banner.className='v61-validation-banner';banner.textContent='Completa antes de continuar: '+missing.map(x=>x.label).join(', ')+'.';const head=document.querySelector('.v3-report-head');(head||document.querySelector('.v3-report-main')||document.querySelector('section'))?.insertAdjacentElement(head?'afterend':'afterbegin',banner);const ids=missing.flatMap(x=>x.ids||[]);ids.forEach(id=>q(id)?.classList.add('v61-required-error'));q(ids[0])?.scrollIntoView?.({behavior:'smooth',block:'center'});return true}
function v70FirstMissing(c,p,through){for(let s=0;s<=Math.min(4,through);s++){const miss=window.RigGOV61?.missing?.(s,c,p)||[];if(miss.length)return{step:s,missing:miss}}return null}
wireReport=function(m,p,c){
  BASE_WIRE_REPORT_V70(m,p,c);
  const replace=(node,handler)=>{if(!node)return;const n=node.cloneNode(true);node.replaceWith(n);n.onclick=handler};
  replace(q('v3ReportNext'),()=>{try{captureExecText(m,p,c)}catch(_){ }const s=Number(c.reportStep)||0,hit=v70FirstMissing(c,p,s);if(hit){c.reportStep=hit.step;save();render();setTimeout(()=>v70ShowMissing(hit.missing),0);return}c.reportVisited=c.reportVisited||{};c.reportVisited[s]=true;c.reportStep=Math.min(6,s+1);save();render();try{scrollTopNow()}catch(_){ }});
  document.querySelectorAll('[data-v3-reportstep]').forEach(old=>{const target=Number(old.dataset.v3Reportstep);replace(old,()=>{try{captureExecText(m,p,c)}catch(_){ }const s=Number(c.reportStep)||0;if(target<=s){c.reportStep=target;save();render();return}const hit=v70FirstMissing(c,p,target-1);if(hit){c.reportStep=hit.step;save();render();setTimeout(()=>v70ShowMissing(hit.missing),0);return}c.reportStep=target;save();render()})});
};

/* ---------- Email: no progress/logo attachment; Outlook-safe HTML visual; max 2 smaller day photos ---------- */
function v70Pct(v){return Math.max(0,Math.min(100,Number(v)||0))}
function v70ProgressHtml(m,p,c){
  const plan=currentPlanPcts(m,p),s=suggestedPcts(m,p),rep={rd:reportValue(c,'rd',s.rd),rm:reportValue(c,'rm',s.rm),ru:reportValue(c,'ru',s.ru)};
  const rows=[['Rig Down',plan.rd,rep.rd],['Rig Move',plan.rm,rep.rm],['Rig Up',plan.ru,rep.ru]];
  const bar=(v,color)=>`<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#e8edf2"><tr><td width="${Math.max(1,Math.round(v70Pct(v)))}%" style="height:7px;background:${color};font-size:1px;line-height:1px">&nbsp;</td><td style="height:7px;font-size:1px;line-height:1px">&nbsp;</td></tr></table>`;
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #dfe5ea;background:#f7f9fb"><tr><td style="padding:10px 12px 5px;font-size:11px;font-weight:800;color:#475467">Plan vs Actual · Daily Progress</td></tr>${rows.map(([name,pv,av])=>`<tr><td style="padding:6px 12px 9px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td width="90" style="font-size:11px;font-weight:700;color:#344054">${name}</td><td style="padding:0 8px"><div style="font-size:9px;color:#667085;margin-bottom:2px">Plan ${Math.round(pv)}%</div>${bar(pv,'#1769ff')}<div style="font-size:9px;color:#667085;margin:4px 0 2px">Actual ${Math.round(av)}%</div>${bar(av,'#15b77e')}</td></tr></table></td></tr>`).join('')}</table>`;
}
const BASE_EMAIL_V61=window.RigGOV61?.email;
function v70EmailHtml(m,p,c,{forSend=false}={}){
  let h=BASE_EMAIL_V61?BASE_EMAIL_V61(m,p,c,{forSend}):emailHtml(m,p,c,{forSend});
  if(forSend)h=h.replace(/<img src="cid:riggo-progress"[^>]*>/i,v70ProgressHtml(m,p,c));
  h=h.replace(/width="280" height="180"/g,'width="260" height="174"').replace(/width:280px;max-width:100%;height:180px/g,'width:260px;max-width:100%;height:174px');
  return h;
}
emailHtml=v70EmailHtml;
function v70PreparePhoto(dataUrl,w=900,h=600,q=.78){return new Promise(resolve=>{if(!dataUrl){resolve('');return}const img=new Image();img.onload=()=>{try{const sw=img.naturalWidth||img.width,sh=img.naturalHeight||img.height,scale=Math.min(w/sw,h/sh),dw=sw*scale,dh=sh*scale,dx=(w-dw)/2,dy=(h-dh)/2,canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d');ctx.fillStyle='#eef1f4';ctx.fillRect(0,0,w,h);ctx.drawImage(img,dx,dy,dw,dh);resolve(canvas.toDataURL('image/jpeg',q))}catch(_){resolve(dataUrl)}};img.onerror=()=>resolve(dataUrl);img.src=dataUrl})}
function v70Base64(data){const i=String(data||'').indexOf(',');return i>=0?String(data).slice(i+1):String(data||'')}
function v70Blob64(blob){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(v70Base64(r.result));r.onerror=reject;r.readAsDataURL(blob)})}
function v70Recipients(m,c){return{to:c.deliveryTo??m.reportConfig?.dailyTo??'',cc:c.deliveryCc??m.reportConfig?.dailyCc??''}}
function v70Subject(m,p){return `Rig ${m.meta.rig} | Daily Move Update | Día ${p.index} | ${m.meta.origin} to ${m.meta.destination}`}
async function v70Invoke(body){const SB=window.RigGOSupabase,{data,error}=await SB.functions.invoke('riggo-send-email',{body});if(error){let detail='';try{if(error.context&&typeof error.context.json==='function'){const b=await error.context.json();detail=b?.error?.message||b?.error||b?.message||''}}catch(_){ }throw new Error(detail||error.message||'No fue posible enviar.')}if(!data?.ok)throw new Error(data?.error?.message||data?.error||'El proveedor no confirmó el envío.');return data}
async function v70NextVersion(m,periodId,type){const {data,error}=await window.RigGOSupabase.from('reports').select('version').eq('move_id',m.id).eq('period_id',periodId).eq('report_type',type).order('version',{ascending:false}).limit(1);if(error)throw error;return(Number(data?.[0]?.version||0)+1)}
async function v70CreateReport(m,periodId,type,version,path,to,cc,status){const {data,error}=await window.RigGOSupabase.from('reports').insert({move_id:m.id,period_id:periodId,report_type:type,version,storage_path:path||null,recipients_to:to,recipients_cc:cc,status:status||'pending_send',generated_by:state.auth.email||null}).select('id').single();if(error)throw error;return data.id}
function v70EmailDoc(m,p,c){return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:0;background:#f3f5f7;font-family:Arial,Helvetica,sans-serif;color:#17202a">${v70EmailHtml(m,p,c,{forSend:true})}</body></html>`}
let v70Sending=false;
sendDailyReport=async function(m,p,c){
  if(v70Sending)return;if(!c.closedAt){alert('Cierra el día antes de enviar.');return}if(!c.f0065ReviewedAt){state.reportView='f0065';save();render();return}
  const rec=v70Recipients(m,c),toP=v70ParseEmailText(rec.to),ccP=v70ParseEmailText(rec.cc),bad=[...toP.invalid,...ccP.invalid];if(bad.length){alert('Revisa: '+bad.join(', '));return}const to=toP.emails,cc=ccP.emails;if(!to.length){alert('Agrega al menos un destinatario en Para.');return}
  const SB=window.RigGOSupabase;if(!SB){alert('No hay conexión con Supabase.');return}const btn=q('sendFromReview'),result=q('sendResult');v70Sending=true;if(btn){btn.disabled=true;btn.textContent='Preparando…'}if(result){result.style.color='#a8c0ff';result.textContent='Preparando Daily Move Update…'}let reportId=null;
  try{
    const originalPhotos=(c.photos||[]).slice(),emailPhotos=await Promise.all(originalPhotos.slice(0,2).map(x=>v70PreparePhoto(x,900,600,.78)));
    const pdf=await window.RigGOReportV12.generateOpsPdfBlob(m,p,c),periodId=await window.RigGOReportV12.ensureDbPeriod(m,p);c.dbPeriodId=periodId;await window.RigGOReportV12.saveClosureRecord(m,p,c,periodId);
    let opsPath=c.opsStoragePath||'',opsName=opsPath?opsPath.split('/').pop():'';
    if(!opsPath){opsName=`OPS-F0065-S_${String(m.meta.rig||'Rig').replace(/[^a-z0-9_-]+/gi,'_')}_Dia${p.index}_${new Date().toISOString().replace(/[-:TZ.]/g,'').slice(0,14)}.pdf`;opsPath=`${m.id}/periods/${periodId}/reports/${opsName}`;const up=await SB.storage.from('riggo-files').upload(opsPath,pdf,{contentType:'application/pdf',upsert:true,cacheControl:'3600'});if(up.error)throw up.error;c.opsStoragePath=opsPath;const fv=await v70NextVersion(m,periodId,'f0065');await v70CreateReport(m,periodId,'f0065',fv,opsPath,[],[],'generated')}
    const dv=await v70NextVersion(m,periodId,'daily_move_update');reportId=await v70CreateReport(m,periodId,'daily_move_update',dv,null,to,cc,'pending_send');if(btn)btn.textContent='Enviando…';if(result)result.textContent='Enviando Daily Move Update + OPS…';
    const attachments=[{filename:opsName||`OPS-F0065-S_${m.meta.rig}_Dia${p.index}.pdf`,content:await v70Blob64(pdf)}];emailPhotos.forEach((x,i)=>attachments.push({filename:`RigGO_Photo_${i+1}.jpg`,content:v70Base64(x),contentId:`photo-${i+1}`}));
    const emailClosure={...c,photos:emailPhotos,photoCaptions:(c.photoCaptions||[]).slice(0,2)};const response=await v70Invoke({to,cc,subject:v70Subject(m,p),html:v70EmailDoc(m,p,emailClosure),replyTo:state.auth.email||undefined,attachments});
    const sent=nowIso();c.sentAt=sent;c.sendStatus='sent';c.messageId=response.messageId||'';c.reportPhotoCount=emailPhotos.length;c.reportHadSignature=!!c.signature;await SB.from('reports').update({status:'sent',provider_message_id:response.messageId||null,sent_at:sent}).eq('id',reportId);await SB.from('daily_closures').update({sent_at:sent}).eq('period_id',periodId);c.photos=[];c.photoCaptions=[];c.signature='';save();if(result){result.style.color='#8ae4ad';result.textContent=`Enviado ✓ · OPS adjunto · ${emailPhotos.length} foto${emailPhotos.length===1?'':'s'}`}toast('Daily Move Update enviado');setTimeout(render,450);
  }catch(e){console.error('RigGO 7.0 report send',e);try{if(reportId)await SB.from('reports').update({status:'failed',error_message:String(e.message||e)}).eq('id',reportId)}catch(_){ }if(result){result.style.color='#ffafb8';result.textContent='Error: '+String(e.message||e)}else alert('No fue posible enviar: '+e.message)}finally{v70Sending=false;if(btn&&document.body.contains(btn)){btn.disabled=false;btn.textContent=c.sentAt?'Reenviar':'Enviar Daily Move Update + OPS'}}
};

/* Release stamp */
function v70Stamp(){const box=document.querySelector('.v5-admin-build');if(box){const b=box.querySelector('b');if(b)b.textContent='RigGO '+RELEASE;const s=box.querySelectorAll('span');if(s.length)s[s.length-1].textContent=BUILD}}
if(typeof render==='function'){const BASE_RENDER_V70=render;render=function(){const out=BASE_RENDER_V70.apply(this,arguments);requestAnimationFrame(v70Stamp);return out}}
setTimeout(v70Stamp,100);
window.RigGOV70={release:RELEASE,build:BUILD,isDemo:v70IsDemo,parseEmails:v70ParseEmailText,email:v70EmailHtml,progress:v70ProgressHtml};
})();

/* ===== SOURCE riggo-v71.js (consolidated) ===== */
/* RigGO 7.1 · Management Polish Candidate 1
   Frozen 7.0 operational core + management dashboard polish. */
(function(){
'use strict';
const RELEASE='7.1.0-management-polish-c1',BUILD='2026-08-16-0927-C1';

const E=id=>document.getElementById(id),N=v=>Number(v)||0,P=v=>Math.max(0,Math.min(100,N(v))),R=(v,d=1)=>{const p=10**d;return Math.round(N(v)*p)/p},ESC=v=>typeof enc==='function'?enc(v??''):String(v??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
const score=x=>{try{return v4Score(x).score}catch(_){const p=N(x.plan),g=N(x.gross);return p?Math.max(0,Math.round(100-Math.max(0,g-p)/p*100)):null}};
function live(){try{return window.RigGOV61?.live?.()||[]}catch(_){return[]}}
function hist(){try{return window.RigGOV61?.history?.()||[]}catch(_){return[]}}
function closure(x){return x?.p?x.m.exec?.closures?.[x.p.id]||{}:{}}
function phaseAvg(o){return (N(o.rd)+N(o.rm)+N(o.ru))/3}
function flatCause(m){const g={};for(const c of Object.values(m.exec?.closures||{}))for(const e of c.flatEvents||[]){const k=(typeof FLAT_TYPES!=='undefined'?FLAT_TYPES.find(t=>t.id===e.type)?.label:null)||e.type||'Otros';g[k]=(g[k]||0)+(typeof eventHours==='function'?eventHours(e):N(e.hours))}return Object.entries(g).sort((a,b)=>b[1]-a[1])[0]||null}
function lastUpdate(m){const a=(m.audit||[]).map(x=>x.at).filter(Boolean).sort();const c=Object.values(m.exec?.closures||{}).flatMap(x=>[x.closedAt,x.sentAt]).filter(Boolean).sort();return [...a,...c].sort().at(-1)||m.updatedAt||m.createdAt||''}
function nextMilestone(x){const c=closure(x),rows=(c.milestones||x.m.milestones||[]).filter(z=>!z.actual).sort((a,b)=>new Date(a.forecast||a.base||'2999')-new Date(b.forecast||b.base||'2999'));return rows[0]||null}
function loadCounts(x){if(!x.p)return{moved:0,total:0,pos:0};let moved=0,total=0,pos=0;for(const sc of ['Rig','Mini Camp','Camp','Operador / Terceros']){try{const r=scopeCounts(x.m,sc,x.p);moved+=N(r.moved);total+=N(r.total);pos+=N(r.pos)}catch(_){}}return{moved,total,pos}}
function pendingCount(x){try{return x.p?pendingDay(x.m,x.p).length:0}catch(_){return 0}}
function planTarget(x){if(!x.m.exec?.actualRelease||!x.planned)return'';return new Date(new Date(x.m.exec.actualRelease).getTime()+N(x.planned)*86400000).toISOString()}
function timingState(x){const d=phaseAvg(x.actual)-phaseAvg(x.plan);return d<-2?{key:'late',label:'Atrasada',delta:d}:d>2?{key:'ahead',label:'Adelantada',delta:d}:{key:'ontime',label:'En tiempo',delta:d}}
function healthLabel(x){return timingState(x).label}
function statusPill(x){const z=timingState(x);return `<span class=\"v71-health ${z.key}\">${z.label}</span>`}
function phaseMini(name,p,a){const d=Math.round(N(a)-N(p)),cls=d<-5?'bad':d<0?'warn':'good';return `<div class=\"v71-phase-mini\"><span>${name}</span><b>${Math.round(N(a))}%</b><small class=\"${cls}\">${d>0?'+':''}${d} pp</small></div>`}
function liveKPIs(items){const late=items.filter(x=>timingState(x).key==='late').length,ontime=items.filter(x=>timingState(x).key==='ontime').length,ahead=items.filter(x=>timingState(x).key==='ahead').length,flat=items.reduce((s,x)=>s+N(x.flat),0),burn=items.length?items.reduce((s,x)=>s+N(x.timePct),0)/items.length:0,gap=items.length?items.reduce((s,x)=>s+(phaseAvg(x.actual)-phaseAvg(x.plan)),0)/items.length:0;return `<div class=\"v71-kpi-strip\"><div><span>Moves en curso</span><b>${items.length}</b></div><div><span>En tiempo</span><b>${ontime}</b></div><div><span>Atrasadas</span><b>${late}</b><small>${ahead} adelantada${ahead===1?'':'s'}</small></div><div><span>Tiempo consumido</span><b>${Math.round(burn)}%</b><small>promedio vs plan</small></div><div><span>Gap de avance</span><b class=\"${gap<-2?'bad':gap>2?'good':''}\">${gap>0?'+':''}${R(gap,0)} pp</b></div><div><span>Flat Time</span><b>${R(flat,1)} h</b></div></div>`}
function burnPanel(items){return `<section class=\"v71-panel v71-burn\"><div class=\"v71-panel-head\"><div><h2>Tiempo consumido vs avance</h2><p>Portfolio activo</p></div></div><div class=\"v71-burn-list\">${items.length?items.slice().sort((a,b)=>b.timePct-a.timePct).map(x=>{const actual=phaseAvg(x.actual),plan=phaseAvg(x.plan);return `<button data-v71-live=\"${x.m.id}\" class=\"v71-burn-row\"><span class=\"rig\">${ESC(x.m.meta.rig)}</span><span class=\"bars\"><i class=\"time\" style=\"width:${P(x.timePct)}%\"></i><i class=\"progress\" style=\"width:${P(actual)}%\"></i></span><span class=\"nums\"><b>${Math.round(x.timePct)}%</b><small>${Math.round(actual)}% avance · Plan ${Math.round(plan)}%</small></span>${statusPill(x)}</button>`}).join(''):'<div class=\"v71-empty\">No hay Moves en ejecución.</div>'}</div><div class=\"v71-legend\"><span><i class=\"time\"></i>Tiempo</span><span><i class=\"progress\"></i>Avance actual</span></div></section>`}
function lossPanel(items){const causes={};for(const x of items){const f=flatCause(x.m);if(f)causes[f[0]]=(causes[f[0]]||0)+f[1]}const vals=Object.entries(causes).sort((a,b)=>b[1]-a[1]).slice(0,5),max=Math.max(1,...vals.map(x=>x[1]));return `<section class=\"v71-panel\"><div class=\"v71-panel-head\"><div><h2>Drivers de pérdida</h2><p>Flat Time · Moves activas</p></div></div><div class=\"v71-loss-bars\">${vals.length?vals.map(([k,v])=>`<div><span>${ESC(k)}</span><i><b style=\"width:${v/max*100}%\"></b></i><strong>${R(v,1)} h</strong></div>`).join(''):'<div class=\"v71-empty\">Sin Flat Time registrado.</div>'}</div></section>`}
function portfolio(items){return `<section class=\"v71-panel v71-portfolio\"><div class=\"v71-panel-head\"><div><h2>Portfolio de Moves</h2><p>Lo que requiere atención ahora</p></div><span class=\"v71-count\">${items.length}</span></div><div class=\"v71-portfolio-head\"><span>Move</span><span>Tiempo</span><span>Plan vs Actual</span><span>Transporte</span><span>Pérdidas</span><span>Próximo hito</span></div>${items.length?items.slice().sort((a,b)=>(({late:0,ontime:1,ahead:2}[timingState(a).key]??9)-({late:0,ontime:1,ahead:2}[timingState(b).key]??9))||b.timePct-a.timePct).map(x=>{const lc=loadCounts(x),f=flatCause(x.m),ms=nextMilestone(x),remain=Math.max(0,N(x.planned)-N(x.elapsed));return `<button class=\"v71-portfolio-row\" data-v71-live=\"${x.m.id}\"><div><div class=\"v71-rig-line\"><b>${ESC(x.m.meta.rig)}</b>${statusPill(x)}</div><small>${ESC(x.m.meta.operator||'')} · ${ESC(x.m.meta.origin)} → ${ESC(x.m.meta.destination)}</small></div><div><b>Día ${x.p?.index||'—'} / ${x.planned||'—'}</b><small>${R(x.elapsed,1)} d · ${R(remain,1)} d plan restantes</small></div><div class=\"v71-phase-row\">${phaseMini('RD',x.plan.rd,x.actual.rd)}${phaseMini('MOVE',x.plan.rm,x.actual.rm)}${phaseMini('RU',x.plan.ru,x.actual.ru)}</div><div><b>${lc.moved}/${lc.total}</b><small>${lc.pos} posicionadas</small></div><div><b>${R(x.flat,1)} h</b><small>${f?ESC(f[0]):'Sin pérdidas'}</small></div><div><b>${ms?ESC(ms.name):'—'}</b><small>${ms?(typeof fmtDate==='function'?fmtDate(ms.forecast||ms.base,true):''):'Sin hito pendiente'}</small></div></button>`}).join(''):'<div class=\"v71-empty\">No hay Moves en ejecución.</div>'}</section>`}
function liveView(items){return `${liveKPIs(items)}<div class=\"v71-dashboard-grid\">${burnPanel(items)}${lossPanel(items)}</div>${portfolio(items)}`}
function histKPIs(rows){const n=rows.length,on=rows.filter(x=>N(x.gross)<=N(x.plan)+.01).length,avg=k=>n?rows.reduce((s,x)=>s+N(x[k]),0)/n:0,flat=rows.reduce((s,x)=>s+N(x.flatHours),0),variance=avg('gross')-avg('plan');return `<div class=\"v71-kpi-strip hist\"><div><span>Moves finalizadas</span><b>${n}</b></div><div><span>Adherence</span><b>${n?Math.round(on/n*100):0}%</b></div><div><span>Avg Plan</span><b>${R(avg('plan'),1)} d</b></div><div><span>Avg Gross</span><b>${R(avg('gross'),1)} d</b></div><div><span>Avg Net</span><b>${R(avg('net'),1)} d</b></div><div><span>Avg Variance</span><b class=\"${variance>0?'bad':''}\">${variance>0?'+':''}${R(variance,1)} d</b><small>${R(flat,1)} h Flat Time</small></div></div>`}
function monthly(rows){const g={};for(const x of rows){const raw=x.acceptance||x.release;if(!raw)continue;const d=new Date(raw);if(isNaN(d))continue;const k=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;const a=g[k]||(g[k]={n:0,plan:0,gross:0,net:0});a.n++;a.plan+=N(x.plan);a.gross+=N(x.gross);a.net+=N(x.net)}return Object.entries(g).sort().slice(-12).map(([k,a])=>({k,n:a.n,plan:a.plan/a.n,gross:a.gross/a.n,net:a.net/a.n}))}
function trend(rows){const a=monthly(rows),W=760,H=250,pad={l:42,r:18,t:34,b:34},max=Math.max(1,...a.flatMap(x=>[x.plan,x.gross,x.net])),x=i=>pad.l+(a.length<=1?0:i*(W-pad.l-pad.r)/(a.length-1)),y=v=>pad.t+(1-v/max)*(H-pad.t-pad.b),poly=k=>a.map((z,i)=>`${x(i)},${y(z[k])}`).join(' ');let svg=`<svg viewBox=\"0 0 ${W} ${H}\" class=\"v71-trend\">`;for(let i=0;i<5;i++){const v=max*i/4,yy=y(v);svg+=`<line x1=\"${pad.l}\" y1=\"${yy}\" x2=\"${W-pad.r}\" y2=\"${yy}\"/><text x=\"${pad.l-7}\" y=\"${yy+3}\" text-anchor=\"end\">${R(v,1)}</text>`}if(a.length){svg+=`<polyline class=\"plan\" points=\"${poly('plan')}\"/><polyline class=\"gross\" points=\"${poly('gross')}\"/><polyline class=\"net\" points=\"${poly('net')}\"/>`;a.forEach((z,i)=>svg+=`<text x=\"${x(i)}\" y=\"${H-10}\" text-anchor=\"middle\">${z.k.slice(5)}</text>`)}svg+='</svg>';return `<section class=\"v71-panel v71-trend-panel\"><div class=\"v71-panel-head\"><div><h2>Tendencia de ejecución</h2><p>Promedio mensual · días</p></div><div class=\"v71-chart-legend\"><span class=\"plan\">Plan</span><span class=\"gross\">Gross</span><span class=\"net\">Net</span></div></div>${a.length?svg:'<div class=\"v71-empty\">Sin fechas históricas suficientes.</div>'}</section>`}
function variance(rows){const a=rows.map(x=>({...x,v:N(x.gross)-N(x.plan)})).sort((a,b)=>b.v-a.v).slice(0,10),max=Math.max(.1,...a.map(x=>Math.abs(x.v)));return `<section class=\"v71-panel\"><div class=\"v71-panel-head\"><div><h2>Variance por Move</h2><p>Gross vs Plan · días</p></div></div><div class=\"v71-var-bars\">${a.length?a.map(x=>`<button data-v71-hist=\"${x.id}\"><span>${ESC(x.rig)} · ${ESC(x.operator||'')}</span><i><b class=\"${x.v>0?'bad':'good'}\" style=\"width:${Math.min(100,Math.abs(x.v)/max*100)}%\"></b></i><strong class=\"${x.v>0?'bad':'good'}\">${x.v>0?'+':''}${R(x.v,1)} d</strong></button>`).join(''):'<div class=\"v71-empty\">Sin datos.</div>'}</div></section>`}
function flatPareto(rows){const g={};for(const x of rows){if(x.move?.exec?.closures){for(const c of Object.values(x.move.exec.closures))for(const e of c.flatEvents||[]){const k=(typeof FLAT_TYPES!=='undefined'?FLAT_TYPES.find(t=>t.id===e.type)?.label:null)||e.type||'Otros';g[k]=(g[k]||0)+(typeof eventHours==='function'?eventHours(e):N(e.hours))}}else if(N(x.flatHours))g['Histórico sin desglose']=(g['Histórico sin desglose']||0)+N(x.flatHours)}const a=Object.entries(g).sort((a,b)=>b[1]-a[1]).slice(0,8),max=Math.max(1,...a.map(x=>x[1]));return `<section class=\"v71-panel\"><div class=\"v71-panel-head\"><div><h2>Flat Time por causa</h2><p>Pareto de pérdidas · horas</p></div></div><div class=\"v71-pareto\">${a.length?a.map(([k,v],i)=>`<div><span class=\"rank\">${i+1}</span><span class=\"name\">${ESC(k)}</span><i><b style=\"width:${v/max*100}%\"></b></i><strong>${R(v,1)} h</strong></div>`).join(''):'<div class=\"v71-empty\">Sin Flat Time registrado.</div>'}</div></section>`}
function group(rows,key){const g={};for(const x of rows){const k=x[key]||'Sin dato',sc=score(x);if(sc==null)continue;const a=g[k]||(g[k]={n:0,sum:0,var:0,flat:0});a.n++;a.sum+=sc;a.var+=N(x.gross)-N(x.plan);a.flat+=N(x.flatHours)}return Object.entries(g).map(([name,a])=>({name,...a,score:Math.round(a.sum/a.n),variance:a.var/a.n})).sort((a,b)=>b.score-a.score)}
function benchmark(rows){const rigs=group(rows,'rig').slice(0,5),ops=group(rows,'operator').slice(0,5),cos=group(rows,'company').slice(0,5),col=(title,a)=>`<div><h3>${title}</h3>${a.map((x,i)=>`<div class=\"v71-bench-row\"><span>${i+1}</span><b>${ESC(x.name)}</b><i>${x.n} moves</i><strong>${x.score}</strong></div>`).join('')||'<div class=\"v71-empty\">Sin datos.</div>'}</div>`;return `<section class=\"v71-panel v71-benchmark\"><div class=\"v71-panel-head\"><div><h2>Benchmark</h2><p>Adherence score</p></div></div><div class=\"v71-benchmark-grid\">${col('Rigs',rigs)}${col('Operators',ops)}${col('Move Companies',cos)}</div></section>`}
function historyTable(rows){const a=rows.slice().sort((x,y)=>new Date(y.acceptance||y.release||0)-new Date(x.acceptance||x.release||0));return `<section class=\"v71-panel v71-history\"><div class=\"v71-panel-head\"><div><h2>Moves finalizadas</h2><p>Drill-down operacional</p></div><span class=\"v71-count\">${rows.length}</span></div><div class=\"v71-history-scroll\"><table><thead><tr><th>Move</th><th>Plan</th><th>Gross</th><th>Net</th><th>Variance</th><th>Flat</th><th>Score</th></tr></thead><tbody>${a.map(x=>{const v=N(x.gross)-N(x.plan);return `<tr data-v71-hist=\"${x.id}\"><td><b>${ESC(x.rig)}</b><small>${ESC(x.operator||'')} · ${ESC(x.origin||'')} → ${ESC(x.destination||'')}</small></td><td>${R(x.plan,1)} d</td><td>${R(x.gross,1)} d</td><td>${R(x.net,1)} d</td><td class=\"${v>0?'bad':'good'}\">${v>0?'+':''}${R(v,1)} d</td><td>${R(x.flatHours,1)} h</td><td><b>${score(x)??'—'}</b></td></tr>`}).join('')}</tbody></table></div></section>`}
function filterBar(){let all=[];try{all=v4RealHistoryRows().filter(x=>state.filters?.includeTests||x.type!=='Prueba')}catch(_){all=hist()}const uniq=a=>['Todos',...new Set(a.filter(Boolean))],f=state.filters||{};return `<div class=\"v71-filterbar\"><select id=\"v71Rig\">${uniq(all.map(x=>x.rig)).map(x=>`<option ${f.rig===x?'selected':''}>${ESC(x)}</option>`).join('')}</select><select id=\"v71Operator\">${uniq(all.map(x=>x.operator)).map(x=>`<option ${f.operator===x?'selected':''}>${ESC(x)}</option>`).join('')}</select><select id=\"v71Company\">${uniq(all.map(x=>x.company)).map(x=>`<option ${f.company===x?'selected':''}>${ESC(x)}</option>`).join('')}</select><button id=\"v71Clear\">Limpiar</button></div>`}
function historyView(rows){return `${filterBar()}${histKPIs(rows)}${trend(rows)}<div class=\"v71-dashboard-grid\">${variance(rows)}${flatPareto(rows)}</div>${benchmark(rows)}${historyTable(rows)}`}
function leaderboard(title,a,bad=false){return `<section class=\"v71-panel\"><div class=\"v71-panel-head\"><div><h2>${title}</h2><p>${bad?'Mayor oportunidad':'Mejor desempeño'}</p></div></div><div class=\"v71-leader\">${a.slice(0,5).map((x,i)=>`<button ${x.id?`data-v71-hist=\"${x.id}\"`:''}><span class=\"rank\">${i+1}</span><span><b>${ESC(x.name)}</b><small>${ESC(x.meta||'')}</small></span><strong class=\"${bad?'bad':''}\">${x.value}</strong></button>`).join('')||'<div class=\"v71-empty\">Sin datos.</div>'}</div></section>`}
function topView(rows){const move=rows.map(x=>({id:x.id,name:`${x.rig} · ${x.operator||''}`,meta:`Plan ${R(x.plan,1)}d · Gross ${R(x.gross,1)}d · Net ${R(x.net,1)}d`,value:score(x)??0})).filter(x=>x.value!=null),best=move.slice().sort((a,b)=>b.value-a.value),worst=move.slice().sort((a,b)=>a.value-b.value);const G=(key)=>group(rows,key).map(x=>({name:x.name,meta:`${x.n} moves · Var ${x.variance>0?'+':''}${R(x.variance,1)}d`,value:x.score}));const causes={};for(const x of rows){if(x.move?.exec?.closures)for(const c of Object.values(x.move.exec.closures))for(const e of c.flatEvents||[]){const k=(typeof FLAT_TYPES!=='undefined'?FLAT_TYPES.find(t=>t.id===e.type)?.label:null)||e.type||'Otros';causes[k]=(causes[k]||0)+(typeof eventHours==='function'?eventHours(e):N(e.hours))}}const loss=Object.entries(causes).sort((a,b)=>b[1]-a[1]).map(([name,v])=>({name,meta:'Flat Time',value:`${R(v,1)} h`}));return `${filterBar()}<div class=\"v71-top-grid\">${leaderboard('Top Moves',best)}${leaderboard('Mayor oportunidad',worst,true)}${leaderboard('Top Rigs',G('rig'))}${leaderboard('Top Operators',G('operator'))}${leaderboard('Top Move Companies',G('company'))}${leaderboard('Principales pérdidas',loss,true)}</div>`}
function openLive(id){const x=live().find(z=>z.m.id===id);if(!x)return;const c=closure(x),lc=loadCounts(x),f=flatCause(x.m),ms=nextMilestone(x),pendingItems=x.p?(pendingDay(x.m,x.p)||[]):[],pend=pendingItems.length,target=planTarget(x),gap=phaseAvg(x.actual)-phaseAvg(x.plan);let next24=String(c.next24||'').split(/\r?\n/).map(z=>z.replace(/^\s*[•*-]\s*/, '').trim()).filter(Boolean).slice(0,5);sheetRoot.innerHTML=`<div class=\"sheet-backdrop\"><div class=\"sheet wide v71-live-sheet\"><div class=\"sheet-handle\"></div><div class=\"v71-sheet-hero\"><div><span>${ESC(x.m.meta.operator||'')} · Día ${x.p?.index||'—'}</span><h2>${ESC(x.m.meta.rig)} · ${ESC(x.m.meta.origin)} → ${ESC(x.m.meta.destination)}</h2></div>${statusPill(x)}</div><div class=\"v71-five\"><section><h3>¿Dónde estamos?</h3><b>${R(x.elapsed,1)} / ${x.planned} días</b><p>Tiempo consumido ${Math.round(x.timePct)}%</p></section><section><h3>¿Cómo vamos vs Plan?</h3><b class=\"${gap<-5?'bad':''}\">${gap>0?'+':''}${R(gap,0)} pp</b><p>RD ${Math.round(x.actual.rd)}% · Move ${Math.round(x.actual.rm)}% · RU ${Math.round(x.actual.ru)}%</p></section><section><h3>¿Qué estamos perdiendo?</h3><b>${R(x.flat,1)} h</b><p>${f?ESC(f[0]):'Sin Flat Time'}</p></section><section><h3>¿Qué puede afectar el final?</h3><b>${pend} pendientes</b><p>${lc.total-lc.moved} cargas por movilizar</p></section><section><h3>¿Qué viene?</h3><b>${ms?ESC(ms.name):'Cierre de Move'}</b><p>${target?`Plan de finalización ${fmtDate(target,true)}`:'Sin fecha objetivo'} </p></section></div><div class=\"v71-detail-grid\"><div><h3>Plan vs Actual</h3><div class=\"v71-phase-row big\">${phaseMini('Rig Down',x.plan.rd,x.actual.rd)}${phaseMini('Rig Move',x.plan.rm,x.actual.rm)}${phaseMini('Rig Up',x.plan.ru,x.actual.ru)}</div></div><div><h3>Próximas 24 Hrs</h3>${next24.length?next24.map(z=>`<p>• ${ESC(z)}</p>`).join(''):'<p>Sin actividades registradas.</p>'}</div></div><div class=\"v80-pending-panel\"><div class=\"v80-pending-head\"><h3>Pendientes del día</h3><span>${pend}</span></div><div class=\"v80-pending-list\">${pendingItems.length?pendingItems.map(z=>`<div>${ESC(z)}</div>`).join(''):'<div class=\"v80-empty\">Sin pendientes.</div>'}</div></div><div class=\"sheet-footer\"><button id=\"v71Close\" class=\"btn\">Cerrar</button>${typeof hasPerm==='function'&&hasPerm('execute')?'<button id=\"v71OpenMove\" class=\"btn primary\">Abrir Move</button>':''}</div></div></div>`;E('v71Close').onclick=closeSheet;if(E('v71OpenMove'))E('v71OpenMove').onclick=()=>{closeSheet();state.selectedMoveId=x.m.id;state.screen='execute';state.execMode='days';save();render()}}
renderOverall=function(){state.overallTab=['live','history','top'].includes(state.overallTab)?state.overallTab:'live';const tab=state.overallTab,items=live(),rows=hist();return `<div class=\"v71-performance\"><div class=\"v71-head\"><div><div class=\"eyebrow\">RIGGO · MANAGEMENT PERFORMANCE</div><h1>Performance</h1><p>${tab==='live'?'Qué está pasando ahora y dónde intervenir':tab==='history'?'Cómo estamos ejecutando y mejorando':'Quién lidera y dónde están las oportunidades'}</p></div><div class=\"v71-tabs\"><button data-v71-tab=\"live\" class=\"${tab==='live'?'active':''}\">En curso</button><button data-v71-tab=\"history\" class=\"${tab==='history'?'active':''}\">Histórico</button><button data-v71-tab=\"top\" class=\"${tab==='top'?'active':''}\">Top</button></div></div>${tab==='live'?liveView(items):tab==='history'?historyView(rows):topView(rows)}</div>`}
wireOverall=function(){document.querySelectorAll('[data-v71-tab]').forEach(b=>b.onclick=()=>{state.overallTab=b.dataset.v71Tab;save();render();window.scrollTo?.(0,0)});const bind=(id,k)=>E(id)?.addEventListener('change',e=>{state.filters=state.filters||{};state.filters[k]=e.target.value;save();render()});bind('v71Rig','rig');bind('v71Operator','operator');bind('v71Company','company');E('v71Clear')?.addEventListener('click',()=>{state.filters={...(state.filters||{}),rig:'Todos',operator:'Todos',company:'Todos'};save();render()});document.querySelectorAll('[data-v71-live]').forEach(b=>b.onclick=()=>openLive(b.dataset.v71Live));document.querySelectorAll('[data-v71-hist]').forEach(b=>b.onclick=()=>{try{v4MoveIntel(b.dataset.v71Hist)}catch(_){}})}
function stamp(){const box=document.querySelector('.v5-admin-build');if(box){const b=box.querySelector('b');if(b)b.textContent='RigGO '+RELEASE;const a=box.querySelectorAll('span');if(a.length)a[a.length-1].textContent=BUILD}}
if(typeof render==='function'){const B=render;render=function(){const r=B.apply(this,arguments);requestAnimationFrame(stamp);return r}}
window.RigGOV71={release:RELEASE,build:BUILD,live,history:hist,timingState};setTimeout(()=>{stamp();try{if(state?.auth?.logged&&state.screen==='overall')render()}catch(_){}},120);
})();

/* ===== SOURCE riggo-v80.js (consolidated) ===== */
/* RigGO 8.0 · Final Candidate 1
   Surgical finalization on frozen RigGO 7.1. */
(function(){
'use strict';
const RELEASE='8.0.0-final-c1',BUILD='2026-08-16-1018-C1';

const E=id=>document.getElementById(id),isAdmin=()=>{try{return !!hasPerm('admin')}catch(_){return false}},canExecute=()=>{try{return !!hasPerm('execute')||isAdmin()}catch(_){return false}};
function hasClosedDay(m){return Object.values(m?.exec?.closures||{}).some(c=>!!c?.closedAt)}
function canEditRelease(m){return !!m?.exec?.actualRelease&&canExecute()&&(!hasClosedDay(m)||isAdmin())}
async function persistReleasePeriods(m){
  try{await window.RigGOV59?.persistMoveNow?.(m)}catch(e){throw e}
  const db=window.RigGOSupabase;if(!db)return;
  const q=await db.from('daily_periods').select('id,day_index,status').eq('move_id',m.id);if(q.error)throw q.error;
  const ps=movePeriods(m)||[];
  for(const row of q.data||[]){const p=ps.find(x=>Number(x.index)===Number(row.day_index));if(!p)continue;const u=await db.from('daily_periods').update({period_start:p.start,period_end:p.end}).eq('id',row.id);if(u.error)throw u.error}
}
function releaseSheet(m){
  if(!canEditRelease(m))return;
  sheetRoot.innerHTML=`<div class="sheet-backdrop"><div class="sheet"><div class="sheet-handle"></div><h2>Actual Rig Release · ${enc(m.meta.rig)}</h2><div class="sheet-sub">${enc(m.meta.origin)} → ${enc(m.meta.destination)}</div><label>Actual Rig Release<input id="v80ActualRelease" class="field" type="datetime-local" value="${toInput(m.exec.actualRelease)}"></label><div id="v80ReleaseResult" class="small" style="margin-top:8px"></div><div class="sheet-footer"><button id="v80Cancel" class="btn">Cancelar</button><button id="v80SaveRelease" class="btn primary">Guardar</button></div></div></div>`;
  E('v80Cancel').onclick=closeSheet;try{enhanceTimeInputs()}catch(_){}
  E('v80SaveRelease').onclick=async()=>{const raw=E('v80ActualRelease').value;if(!raw)return;const iso=inputToIso(raw),old=m.exec.actualRelease;if(!iso||iso===old){closeSheet();return}const b=E('v80SaveRelease'),r=E('v80ReleaseResult');try{b.disabled=true;b.textContent='Guardando…';m.exec.actualRelease=iso;m.exec.selectedPeriodId=null;m.exec.periods=[];m.audit=m.audit||[];m.audit.push({at:nowIso(),user:state.auth.email,action:'actual_release_corrected',before:old,after:iso});saveLocal();await persistReleasePeriods(m);save();if(r){r.style.color='#8ae4ad';r.textContent='Guardado'}setTimeout(()=>{closeSheet();render();try{window.scrollTo(0,0)}catch(_){}},220)}catch(e){m.exec.actualRelease=old;saveLocal();if(r){r.style.color='#ffafb8';r.textContent='Error: '+String(e.message||e)}b.disabled=false;b.textContent='Guardar'}};
}
function injectReleaseEdit(){const m=typeof currentMove==='function'?currentMove():null;if(!m||state?.screen!=='execute'||state?.execMode==='day'||!canEditRelease(m))return;const spans=[...document.querySelectorAll('.v3-meta .status,.v56-move-meta .status')],release=spans.find(x=>/^Release\s/i.test((x.textContent||'').trim()));if(!release||document.getElementById('v80EditRelease'))return;const b=document.createElement('button');b.id='v80EditRelease';b.className='v80-release-edit';b.type='button';b.textContent='Editar';release.insertAdjacentElement('afterend',b);b.onclick=()=>releaseSheet(m)}
if(typeof wireExecute==='function'){const BASE=wireExecute;wireExecute=function(){const out=BASE.apply(this,arguments);requestAnimationFrame(injectReleaseEdit);return out}}
function stamp(){const box=document.querySelector('.v5-admin-build');if(box){const b=box.querySelector('b');if(b)b.textContent='RigGO '+RELEASE;const a=box.querySelectorAll('span');if(a.length)a[a.length-1].textContent=BUILD}}
if(typeof render==='function'){const BASE=render;render=function(){const o=BASE.apply(this,arguments);requestAnimationFrame(()=>{stamp();injectReleaseEdit()});return o}}
window.RigGOV80={release:RELEASE,build:BUILD,canEditRelease,hasClosedDay,persistReleasePeriods};
setTimeout(stamp,100);
})();

/* ===== SOURCE riggo-v90.js (consolidated) ===== */
/* RigGO 9.0 · Stable branch from approved RigGO 8.0 */
(function(){
'use strict';
const RELEASE='9.0.0-stable-c1';
const BUILD='2026-08-16-1400-C1';
const E=id=>document.getElementById(id);
const N=v=>Number(v)||0;
const R=(v,d=1)=>{const p=10**d;return Math.round((Number(v)||0)*p)/p};
const P=v=>Math.max(0,Math.min(100,N(v)));
const ESC=v=>typeof enc==='function'?enc(v??''):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const ADMIN=()=>{try{return !!hasPerm('admin')}catch(_){return false}};
function mgmt(m){try{return typeof v4Mgmt==='function'?(v4Mgmt(m)||{}):(m.management||{})}catch(_){return m?.management||{}}}
function setRelease(){}
function stamp(){const box=document.querySelector('.v5-admin-build');if(box){const b=box.querySelector('b');if(b)b.textContent='RigGO '+RELEASE;const s=box.querySelectorAll('span');if(s.length)s[s.length-1].textContent=BUILD}}

/* ---------- Login: exact 3-line copy ---------- */
const BASE_LOGIN_90=renderLogin;
renderLogin=function(){
  BASE_LOGIN_90();
  const copy=document.querySelector('.v3-login-copy');
  if(copy){
    const h=copy.querySelector('h2');
    if(h){h.classList.add('v90-login-title');h.innerHTML='<span class="v90-line">Gestiona tu</span><span class="v90-line">Movilización</span><span class="v90-line">con Excelencia.</span>';}
  }
};

/* ---------- Reporting navigation: final guard at point of advance ---------- */
function showMissing(missing){
  document.querySelectorAll('.v61-required-error').forEach(x=>x.classList.remove('v61-required-error'));
  document.querySelector('.v61-validation-banner')?.remove();
  if(!missing?.length)return false;
  const banner=document.createElement('div');banner.className='v61-validation-banner';banner.textContent='Completa antes de continuar: '+missing.map(x=>x.label).join(', ')+'.';
  const head=document.querySelector('.v3-report-head');if(head)head.insertAdjacentElement('afterend',banner);
  const ids=missing.flatMap(x=>x.ids||[]);ids.forEach(id=>E(id)?.classList.add('v61-required-error'));
  const first=ids.map(E).find(Boolean);if(first){first.scrollIntoView({behavior:'smooth',block:'center'});if(first.tagName!=='CANVAS')setTimeout(()=>{try{first.focus({preventScroll:true})}catch(_){ }},100)}
  try{toast('Completa los datos requeridos antes de continuar')}catch(_){ }
  return true;
}
function missingAt(step,c,p){try{return window.RigGOV61?.missing?.(step,c,p)||[]}catch(_){return[]}}
function firstMissingThrough(c,p,through){for(let s=0;s<=Math.min(4,through);s++){const m=missingAt(s,c,p);if(m.length)return{step:s,missing:m}}return null}
const BASE_WIRE_REPORT_90=wireReport;
wireReport=function(m,p,c){
  BASE_WIRE_REPORT_90(m,p,c);
  const nextOld=E('v3ReportNext');
  if(nextOld){const next=nextOld.cloneNode(true);nextOld.replaceWith(next);next.onclick=()=>{try{captureExecText(m,p,c)}catch(_){ }const step=Number(c.reportStep)||0,hit=firstMissingThrough(c,p,step);if(hit){c.reportStep=hit.step;save();render();setTimeout(()=>showMissing(hit.missing),0);return}c.reportVisited=c.reportVisited||{};c.reportVisited[step]=true;c.reportStep=Math.min(6,step+1);save();render();try{scrollTopNow()}catch(_){ }};}
  document.querySelectorAll('[data-v3-reportstep]').forEach(old=>{const b=old.cloneNode(true);old.replaceWith(b);b.onclick=()=>{try{captureExecText(m,p,c)}catch(_){ }const target=Number(b.dataset.v3Reportstep),step=Number(c.reportStep)||0;if(target<=step){c.reportStep=target;save();render();return}const hit=firstMissingThrough(c,p,target-1);if(hit){c.reportStep=hit.step;save();render();setTimeout(()=>showMissing(hit.missing),0);return}if(target===step+1||c.reportVisited?.[target]){c.reportStep=target;save();render()}}});
};

/* ---------- One renderer for email preview + send ---------- */
function emailBase(m,p,c,opt){
  const fn=window.RigGOV70?.email||window.RigGOV61?.email||emailHtml;
  let h=fn(m,p,c,opt||{});
  h=h.replace(/Lectura ejecutiva:/gi,'Resumen:').replace(/Summary:/gi,'Resumen:');
  return h;
}
function v90EmailHtml(m,p,c,{forSend=false}={}){
  c.siteSupervisorRole=c.siteSupervisorRole||'Rig Manager';
  return emailBase(m,p,c,{forSend});
}
emailHtml=v90EmailHtml;
finalEmailHtml=function(m,p,c){return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:0;background:#f3f5f7;font-family:Arial,Helvetica,sans-serif;color:#17202a">${v90EmailHtml(m,p,c,{forSend:true})}</body></html>`};

function b64(data){const i=String(data||'').indexOf(',');return i>=0?String(data).slice(i+1):String(data||'')}
function blob64(blob){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(b64(r.result));r.onerror=reject;r.readAsDataURL(blob)})}
function prepPhoto(dataUrl,w=900,h=600,q=.78){return new Promise(resolve=>{if(!dataUrl){resolve('');return}const img=new Image();img.onload=()=>{try{const sw=img.naturalWidth||img.width,sh=img.naturalHeight||img.height,scale=Math.min(w/sw,h/sh),dw=Math.max(1,Math.round(sw*scale)),dh=Math.max(1,Math.round(sh*scale)),dx=Math.round((w-dw)/2),dy=Math.round((h-dh)/2),cv=document.createElement('canvas');cv.width=w;cv.height=h;const ctx=cv.getContext('2d');ctx.fillStyle='#eef1f4';ctx.fillRect(0,0,w,h);ctx.drawImage(img,dx,dy,dw,dh);resolve(cv.toDataURL('image/jpeg',q))}catch(_){resolve(dataUrl)}};img.onerror=()=>resolve(dataUrl);img.src=dataUrl})}
async function invoke(body){const SB=window.RigGOSupabase,{data,error}=await SB.functions.invoke('riggo-send-email',{body});if(error){let detail='';try{if(error.context&&typeof error.context.json==='function'){const b=await error.context.json();detail=b?.error?.message||b?.error||b?.message||''}}catch(_){ }throw new Error(detail||error.message||'No fue posible enviar.')}if(!data?.ok)throw new Error(data?.error?.message||data?.error||'El proveedor no confirmó el envío.');return data}
async function nextVersion(m,periodId,type){const {data,error}=await window.RigGOSupabase.from('reports').select('version').eq('move_id',m.id).eq('period_id',periodId).eq('report_type',type).order('version',{ascending:false}).limit(1);if(error)throw error;return Number(data?.[0]?.version||0)+1}
async function reportRow(m,periodId,type,version,path,to,cc,status){const {data,error}=await window.RigGOSupabase.from('reports').insert({move_id:m.id,period_id:periodId,report_type:type,version,storage_path:path||null,recipients_to:to,recipients_cc:cc,status:status||'pending_send',generated_by:state.auth.email||null}).select('id').single();if(error)throw error;return data.id}
function recipients(m,c){return{to:c.deliveryTo??m.reportConfig?.dailyTo??'',cc:c.deliveryCc??m.reportConfig?.dailyCc??''}}
let sending90=false;
sendDailyReport=async function(m,p,c){
  if(sending90)return;if(!c.closedAt){alert('Cierra el día antes de enviar.');return}if(!c.f0065ReviewedAt){state.reportView='f0065';save();render();return}
  const parse=window.RigGOV70?.parseEmails||((s)=>({emails:String(s||'').split(';').map(x=>x.trim()).filter(Boolean),invalid:[]})),rec=recipients(m,c),toP=parse(rec.to),ccP=parse(rec.cc),bad=[...(toP.invalid||[]),...(ccP.invalid||[])];
  if(bad.length){alert('Revisa: '+bad.join(', '));return}const to=toP.emails||[],cc=ccP.emails||[];if(!to.length){alert('Agrega al menos un destinatario en Para.');return}
  const SB=window.RigGOSupabase;if(!SB){alert('No hay conexión con Supabase.');return}
  const btn=E('sendFromReview'),result=E('sendResult');sending90=true;if(btn){btn.disabled=true;btn.textContent='Preparando…'}if(result){result.style.color='#a8c0ff';result.textContent='Preparando Daily Move Update…'}let rid=null;
  try{
    c.siteSupervisorRole=c.siteSupervisorRole||'Rig Manager';
    const originals=(c.photos||[]).slice(),photos=await Promise.all(originals.slice(0,2).map(x=>prepPhoto(x))),pdf=await window.RigGOReportV12.generateOpsPdfBlob(m,p,c),periodId=await window.RigGOReportV12.ensureDbPeriod(m,p);c.dbPeriodId=periodId;await window.RigGOReportV12.saveClosureRecord(m,p,c,periodId);
    let opsPath=c.opsStoragePath||'',opsName=opsPath?opsPath.split('/').pop():'';
    if(!opsPath){opsName=`OPS-F0065-S_${String(m.meta.rig||'Rig').replace(/[^a-z0-9_-]+/gi,'_')}_Dia${p.index}_${new Date().toISOString().replace(/[-:TZ.]/g,'').slice(0,14)}.pdf`;opsPath=`${m.id}/periods/${periodId}/reports/${opsName}`;const up=await SB.storage.from('riggo-files').upload(opsPath,pdf,{contentType:'application/pdf',upsert:true,cacheControl:'3600'});if(up.error)throw up.error;c.opsStoragePath=opsPath;const fv=await nextVersion(m,periodId,'f0065');await reportRow(m,periodId,'f0065',fv,opsPath,[],[],'generated')}
    const dv=await nextVersion(m,periodId,'daily_move_update');rid=await reportRow(m,periodId,'daily_move_update',dv,null,to,cc,'pending_send');
    if(btn)btn.textContent='Enviando…';if(result)result.textContent='Enviando Daily Move Update + OPS…';
    const attachments=[{filename:opsName||`OPS-F0065-S_${m.meta.rig}_Dia${p.index}.pdf`,content:await blob64(pdf)}];photos.forEach((x,i)=>attachments.push({filename:`RigGO_Photo_${i+1}.jpg`,content:b64(x),contentId:`photo-${i+1}`}));
    const ec={...c,photos,photoCaptions:(c.photoCaptions||[]).slice(0,2),siteSupervisorRole:c.siteSupervisorRole||'Rig Manager'};
    const response=await invoke({to,cc,subject:`Rig ${m.meta.rig} | Daily Move Update | Día ${p.index} | ${m.meta.origin} to ${m.meta.destination}`,html:finalEmailHtml(m,p,ec),replyTo:state.auth.email||undefined,attachments});
    const sent=nowIso();c.sentAt=sent;c.sendStatus='sent';c.messageId=response.messageId||'';c.reportPhotoCount=photos.length;c.reportHadSignature=!!c.signature;await SB.from('reports').update({status:'sent',provider_message_id:response.messageId||null,sent_at:sent}).eq('id',rid);await SB.from('daily_closures').update({sent_at:sent}).eq('period_id',periodId);c.photos=[];c.photoCaptions=[];c.signature='';save();if(result){result.style.color='#8ae4ad';result.textContent=`Enviado ✓ · OPS adjunto · ${photos.length} foto${photos.length===1?'':'s'}`}toast('Daily Move Update enviado');setTimeout(render,400);
  }catch(e){console.error('RigGO 9.0 report send',e);try{if(rid)await SB.from('reports').update({status:'failed',error_message:String(e.message||e)}).eq('id',rid)}catch(_){ }if(result){result.style.color='#ffafb8';result.textContent='Error: '+String(e.message||e)}else alert('No fue posible enviar: '+e.message)}finally{sending90=false;if(btn&&document.body.contains(btn)){btn.disabled=false;btn.textContent=c.sentAt?'Reenviar':'Enviar Daily Move Update + OPS'}}
};

/* ---------- Management Performance: mobile-first ---------- */
function phaseAvg(o){return (N(o?.rd)+N(o?.rm)+N(o?.ru))/3}
function activeAccessibleMoves(){return (state.moves||[]).filter(m=>m.status==='active'&&!mgmt(m).deletedAt&&!mgmt(m).archivedAt).filter(m=>{try{return typeof canAccessMove==='function'?canAccessMove(currentUser(),m):true}catch(_){return true}})}
function currentPeriod(m){const ps=(typeof movePeriods==='function'?movePeriods(m):[])||[],now=Date.now();return ps.find(p=>new Date(p.start).getTime()<=now&&new Date(p.end).getTime()>now)||ps.filter(p=>new Date(p.start).getTime()<=now).at(-1)||ps[0]||null}
function flatHours(m){let h=0;for(const p of (typeof movePeriods==='function'?movePeriods(m):[])||[]){const c=m.exec?.closures?.[p.id];if(c)try{h+=flatSummary(c.flatEvents||[],p).net}catch(_){ }}return h}
function loadTotals(m,p){let moved=0,total=0,pos=0;for(const sc of ['Rig','Mini Camp','Camp','Operador / Terceros']){try{const q=scopeCounts(m,sc,p);moved+=N(q.moved);total+=N(q.total);pos+=N(q.pos)}catch(_){ }}return{moved,total,pos}}
function pendingItems(m,p){try{return p?(pendingDay(m,p)||[]):[]}catch(_){return[]}}
function nextMilestone(m,p){const c=p?m.exec?.closures?.[p.id]:null,rows=(c?.milestones||m.milestones||[]).filter(x=>!x.actual&&(x.forecast||x.base)).sort((a,b)=>new Date(a.forecast||a.base)-new Date(b.forecast||b.base));return rows[0]||null}
function liveData(m){const p=currentPeriod(m),actual=moveProgressSnapshot(m),plan=p?currentPlanPcts(m,p):{rd:0,rm:0,ru:0},progress=phaseAvg(actual),planAvg=phaseAvg(plan),gap=progress-planAvg,status=gap<-2?'late':gap>2?'ahead':'ontime',planned=typeof v4PlannedDays==='function'?v4PlannedDays(m):Math.max(1,plannedDayCount(m)),elapsed=m.exec?.actualRelease?Math.max(0,(Date.now()-new Date(m.exec.actualRelease).getTime())/86400000):0,timePct=planned?elapsed/planned*100:0,loads=loadTotals(m,p),pending=pendingItems(m,p);return{m,p,actual,plan,progress,planAvg,gap,status,planned,elapsed,timePct,loads,pending,flat:flatHours(m),milestone:nextMilestone(m,p)}}
function activeData(){return activeAccessibleMoves().map(liveData)}
function stateMeta(x){return x.status==='late'?{label:'Atrasada',cls:'late',accent:'#e45f6a'}:x.status==='ahead'?{label:'Adelantada',cls:'ahead',accent:'#1dac99'}:{label:'En tiempo',cls:'ontime',accent:'#eea140'}}
function ring(label,pct,sub,accent){return `<div class="v90-ring-card"><div class="v90-ring-wrap"><div class="v90-ring" style="--v90-p:${P(pct)};--v90-accent:${accent}"></div><b>${Math.round(P(pct))}%</b></div><label>${ESC(label)}</label><small>${ESC(sub)}</small></div>`}
function liveRings(items){const prog=items.length?items.reduce((s,x)=>s+x.progress,0)/items.length:0,time=items.length?items.reduce((s,x)=>s+Math.min(100,x.timePct),0)/items.length:0,on=items.length?items.filter(x=>x.status==='ontime').length/items.length*100:0;return `<div class="v90-rings">${ring('Avance',prog,'promedio activo','#25c57e')}${ring('Tiempo',time,'consumido vs plan','#3375ff')}${ring('En tiempo',on,`${items.filter(x=>x.status==='ontime').length} de ${items.length}`,'#eea140')}</div>`}
function liveQuick(items){const flat=items.reduce((s,x)=>s+x.flat,0),moved=items.reduce((s,x)=>s+x.loads.moved,0),total=items.reduce((s,x)=>s+x.loads.total,0),mail=items.reduce((s,x)=>{try{return s+reportDeliveryPending(x.m).length}catch(_){return s}},0);return `<div class="v90-quick"><div><span>Moves</span><b>${items.length}</b><small>en ejecución</small></div><div><span>Flat Time</span><b>${R(flat,1)} h</b><small>neto acumulado</small></div><div><span>Cargas</span><b>${moved}/${total}</b><small>movilizadas</small></div><div><span>Emails</span><b>${mail}</b><small>pendientes</small></div></div>`}
function lineSvg(items){if(!items.length)return '<div class="v90-empty">No hay Moves en curso.</div>';const a=items.slice().sort((x,y)=>x.timePct-y.timePct),W=600,H=220,p={l:34,r:12,t:14,b:28},x=i=>p.l+(a.length===1?(W-p.l-p.r)/2:i*(W-p.l-p.r)/(a.length-1)),y=v=>p.t+(1-P(v)/100)*(H-p.t-p.b),pts=k=>a.map((z,i)=>`${x(i)},${y(z[k])}`).join(' ');let s=`<svg viewBox="0 0 ${W} ${H}">`;[0,25,50,75,100].forEach(v=>{const yy=y(v);s+=`<line class="grid" x1="${p.l}" y1="${yy}" x2="${W-p.r}" y2="${yy}"></line><text x="${p.l-5}" y="${yy+3}" text-anchor="end">${v}</text>`});s+=`<polyline class="time" points="${pts('timePct')}"></polyline><polyline class="progress" points="${pts('progress')}"></polyline><polyline class="plan" points="${pts('planAvg')}"></polyline>`;a.forEach((z,i)=>s+=`<text x="${x(i)}" y="${H-8}" text-anchor="middle">${ESC(z.m.meta.rig)}</text>`);return s+'</svg>'}
function liveChart(items){return `<div class="v90-panel"><div class="v90-panel-head"><div><h2>Tiempo vs Avance</h2><p>Portafolio activo</p></div></div><div class="v90-chart">${lineSvg(items)}</div><div class="v90-legend"><span class="time"><i></i>Tiempo</span><span class="progress"><i></i>Actual</span><span class="plan"><i></i>Plan</span></div></div>`}
function statusBars(items){const c={late:0,ontime:0,ahead:0};items.forEach(x=>c[x.status]++);const mx=Math.max(1,c.late,c.ontime,c.ahead),bar=(k,label)=>`<div class="v90-statebar ${k}"><strong>${c[k]}</strong><div class="track"><i style="height:${c[k]/mx*100}%"></i></div><span>${label}</span></div>`;return `<div class="v90-panel"><div class="v90-panel-head"><div><h2>Estado</h2><p>Lectura rápida</p></div></div><div class="v90-statebars">${bar('late','Atrasada')}${bar('ontime','En tiempo')}${bar('ahead','Adelantada')}</div></div>`}
function liveList(items){return `<div class="v90-panel"><div class="v90-panel-head"><div><h2>Moves en curso</h2><p>Toca una Move para ver detalle y pendientes</p></div><span class="status gray">${items.length}</span></div>${items.length?`<div class="v90-moves">${items.map(x=>{const z=stateMeta(x),ms=x.milestone?.name||'Sin hito pendiente';return `<button class="v90-move" data-v90-live="${x.m.id}"><div class="v90-mini-ring-wrap"><div class="v90-mini-ring" style="--v90-p:${P(x.progress)};--v90-accent:${z.accent}"></div><b>${Math.round(P(x.progress))}%</b></div><div><h3>${ESC(x.m.meta.rig)}</h3><div class="sub">${ESC(x.m.meta.operator||'')} · Día ${x.p?.index||'—'} / ${x.planned} · ${ESC(x.m.meta.origin)} → ${ESC(x.m.meta.destination)}</div><div class="v90-tags"><span class="v90-tag ${z.cls}">${z.label}</span><span class="v90-tag">Tiempo ${Math.round(x.timePct)}%</span><span class="v90-tag">Flat ${R(x.flat,1)} h</span><span class="v90-tag">Cargas ${x.loads.moved}/${x.loads.total}</span><span class="v90-tag">Pendientes ${x.pending.length}</span><span class="v90-tag">${ESC(ms)}</span></div></div><span class="v90-arrow">›</span></button>`}).join('')}</div>`:'<div class="v90-empty">No hay Moves en curso.</div>'}</div>`}

function historyRows(){let rows=[];try{rows=v4RealHistoryRows()}catch(_){rows=[]}return rows.filter(x=>{const type=x.type||mgmt(x.move||{}).type;return type!=='Prueba'||(ADMIN()&&state.filters?.includeTests)})}
function histAgg(rows){const n=rows.length||1,on=rows.filter(x=>N(x.gross)<=N(x.plan)+.01).length,plan=rows.reduce((s,x)=>s+N(x.plan),0)/n,gross=rows.reduce((s,x)=>s+N(x.gross),0)/n,net=rows.reduce((s,x)=>s+N(x.net),0)/n,flat=rows.reduce((s,x)=>s+N(x.flatHours),0);return{count:rows.length,on:rows.length?on/rows.length*100:0,plan,gross,net,flat,var:gross-plan}}
function histRings(rows){const a=histAgg(rows),eff=a.net?Math.min(100,a.plan/a.net*100):0,flatImpact=a.gross?Math.min(100,Math.max(0,100-a.flat/(a.gross*24)*100)):100;return `<div class="v90-rings">${ring('On Plan',a.on,`${a.count} moves`,'#25c57e')}${ring('Net Efficiency',eff,`Plan ${R(a.plan,1)} d · Net ${R(a.net,1)} d`,'#3375ff')}${ring('Productive Time',flatImpact,`${R(a.flat,1)} h Flat Time`,'#eea140')}</div>`}
function histQuick(rows){const a=histAgg(rows);return `<div class="v90-hist-cards"><div><span>Moves</span><b>${a.count}</b><small>finalizadas</small></div><div><span>Avg Plan</span><b>${R(a.plan,1)} d</b><small>baseline</small></div><div><span>Avg Gross</span><b>${R(a.gross,1)} d</b><small>actual total</small></div><div><span>Avg Variance</span><b>${a.var>0?'+':''}${R(a.var,1)} d</b><small>gross vs plan</small></div></div>`}
function monthly(rows){const g={};for(const x of rows){const raw=x.acceptance||x.release;if(!raw)continue;const d=new Date(raw);if(isNaN(d))continue;const k=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`,a=g[k]||(g[k]={n:0,plan:0,gross:0,net:0});a.n++;a.plan+=N(x.plan);a.gross+=N(x.gross);a.net+=N(x.net)}return Object.entries(g).sort().slice(-8).map(([k,a])=>({k,plan:a.plan/a.n,gross:a.gross/a.n,net:a.net/a.n}))}
function histChart(rows){const a=monthly(rows);if(!a.length)return `<div class="v90-panel"><div class="v90-empty">Sin histórico suficiente.</div></div>`;const W=600,H=220,p={l:34,r:12,t:14,b:28},mx=Math.max(1,...a.flatMap(z=>[z.plan,z.gross,z.net])),x=i=>p.l+(a.length===1?(W-p.l-p.r)/2:i*(W-p.l-p.r)/(a.length-1)),y=v=>p.t+(1-v/mx)*(H-p.t-p.b),pts=k=>a.map((z,i)=>`${x(i)},${y(z[k])}`).join(' ');let s=`<svg viewBox="0 0 ${W} ${H}">`;for(let i=0;i<5;i++){const v=mx*i/4,yy=y(v);s+=`<line class="grid" x1="${p.l}" y1="${yy}" x2="${W-p.r}" y2="${yy}"></line><text x="${p.l-5}" y="${yy+3}" text-anchor="end">${R(v,1)}</text>`}s+=`<polyline class="plan" points="${pts('plan')}"></polyline><polyline class="time" points="${pts('gross')}"></polyline><polyline class="progress" points="${pts('net')}"></polyline>`;a.forEach((z,i)=>s+=`<text x="${x(i)}" y="${H-8}" text-anchor="middle">${z.k.slice(5)}</text>`);s+='</svg>';return `<div class="v90-panel"><div class="v90-panel-head"><div><h2>Tendencia histórica</h2><p>Plan vs Gross vs Net</p></div></div><div class="v90-chart">${s}</div><div class="v90-legend"><span class="plan"><i></i>Plan</span><span class="time"><i></i>Gross</span><span class="progress"><i></i>Net</span></div></div>`}
function scoreRow(x){try{return v4Score(x).score}catch(_){return null}}
function topMoves(rows,worst=false){const a=rows.map(x=>({x,score:scoreRow(x)})).filter(z=>z.score!=null).sort((a,b)=>worst?a.score-b.score:b.score-a.score).slice(0,6);return `<div class="v90-panel"><div class="v90-panel-head"><div><h2>${worst?'Mayor oportunidad':'Top Moves'}</h2><p>${worst?'Dónde enfocar mejora':'Mejor adherencia'}</p></div></div><div class="v90-rank">${a.length?a.map((z,i)=>`<button class="v90-rank-row" data-v90-hist="${z.x.id}"><span class="n">${i+1}</span><span><b>${ESC(z.x.rig)} · ${ESC(z.x.operator||'')}</b><small>Plan ${R(z.x.plan,1)} d · Gross ${R(z.x.gross,1)} d · Net ${R(z.x.net,1)} d</small></span><strong>${z.score}</strong></button>`).join(''):'<div class="v90-empty">Sin datos.</div>'}</div></div>`}
function grouped(rows,key){const g={};for(const x of rows){const k=x[key]||'Sin dato',s=scoreRow(x);if(s==null)continue;const a=g[k]||(g[k]={n:0,sum:0});a.n++;a.sum+=s}return Object.entries(g).map(([name,a])=>({name,n:a.n,score:Math.round(a.sum/a.n)})).sort((a,b)=>b.score-a.score).slice(0,6)}
function groupRank(title,a){return `<div class="v90-panel"><div class="v90-panel-head"><div><h2>${ESC(title)}</h2><p>Benchmark</p></div></div><div class="v90-rank">${a.length?a.map((x,i)=>`<div class="v90-rank-row"><span class="n">${i+1}</span><span><b>${ESC(x.name)}</b><small>${x.n} move${x.n===1?'':'s'}</small></span><strong>${x.score}</strong></div>`).join(''):'<div class="v90-empty">Sin datos.</div>'}</div></div>`}

function openLiveDetail(id){const x=activeData().find(z=>z.m.id===id);if(!x)return;const z=stateMeta(x),next24=x.p?String(x.m.exec?.closures?.[x.p.id]?.next24||'').split(/\r?\n/).map(s=>s.replace(/^\s*[•*-]\s*/, '').trim()).filter(Boolean).slice(0,5):[];sheetRoot.innerHTML=`<div class="sheet-backdrop"><div class="sheet wide"><div class="sheet-handle"></div><div class="row between wrap"><div><div class="eyebrow">${z.label.toUpperCase()}</div><h2>${ESC(x.m.meta.rig)} · Día ${x.p?.index||'—'}</h2><div class="sheet-sub">${ESC(x.m.meta.origin)} → ${ESC(x.m.meta.destination)}</div></div><span class="v90-tag ${z.cls}">${z.label}</span></div><div class="v90-detail"><div class="v90-detail-kpis"><div><span>Tiempo</span><b>${R(x.elapsed,1)} / ${x.planned} d</b></div><div><span>Avance</span><b>${Math.round(x.progress)}%</b></div><div><span>Plan hoy</span><b>${Math.round(x.planAvg)}%</b></div><div><span>Flat Time</span><b>${R(x.flat,1)} h</b></div><div><span>Cargas</span><b>${x.loads.moved}/${x.loads.total}</b></div><div><span>Pendientes</span><b>${x.pending.length}</b></div></div><div><h3>Pendientes del día</h3><div class="v90-pending">${x.pending.length?x.pending.map(v=>`<div>${ESC(v)}</div>`).join(''):'<div>Sin pendientes.</div>'}</div></div><div><h3>Próximas 24 Hrs</h3><div class="v90-pending">${next24.length?next24.map(v=>`<div>${ESC(v)}</div>`).join(''):'<div>Sin actividades registradas.</div>'}</div></div></div><div class="sheet-footer"><button id="v90CloseDetail" class="btn">Cerrar</button>${typeof hasPerm==='function'&&hasPerm('execute')?'<button id="v90OpenMove" class="btn primary">Abrir Move</button>':''}</div></div></div>`;E('v90CloseDetail').onclick=closeSheet;if(E('v90OpenMove'))E('v90OpenMove').onclick=()=>{closeSheet();state.selectedMoveId=x.m.id;state.screen='execute';state.execMode='days';save();render();try{scrollTopNow()}catch(_){ }}
}

renderOverall=function(){state.overallTab=['live','history','top'].includes(state.overallTab)?state.overallTab:'live';const tab=state.overallTab,live=activeData(),rows=historyRows(),body=tab==='live'?`${liveRings(live)}${liveQuick(live)}<div class="v90-grid2">${liveChart(live)}${statusBars(live)}</div>${liveList(live)}`:tab==='history'?`${histRings(rows)}${histQuick(rows)}<div class="v90-grid2">${histChart(rows)}${topMoves(rows,false)}</div>`:`<div class="v90-grid2">${topMoves(rows,false)}${topMoves(rows,true)}</div><div class="v90-grid2">${groupRank('Top Rigs',grouped(rows,'rig'))}${groupRank('Top Operators',grouped(rows,'operator'))}</div>${groupRank('Top Move Companies',grouped(rows,'company'))}`;return `<div class="v90-perf"><div class="v90-perf-head"><div><div class="eyebrow">RIGGO · MANAGEMENT PERFORMANCE</div><h1>Performance</h1><p>${tab==='live'?'Qué está pasando ahora y dónde intervenir.':tab==='history'?'Tendencia y resultado de las Moves finalizadas.':'Referentes y oportunidades de mejora.'}</p></div><div class="v90-tabs"><button data-v90-tab="live" class="${tab==='live'?'active':''}">En curso</button><button data-v90-tab="history" class="${tab==='history'?'active':''}">Histórico</button><button data-v90-tab="top" class="${tab==='top'?'active':''}">Top</button></div></div>${body}</div>`}
wireOverall=function(){document.querySelectorAll('[data-v90-tab]').forEach(b=>b.onclick=()=>{state.overallTab=b.dataset.v90Tab;save();render();try{window.scrollTo(0,0)}catch(_){ }});document.querySelectorAll('[data-v90-live]').forEach(b=>b.onclick=()=>openLiveDetail(b.dataset.v90Live));document.querySelectorAll('[data-v90-hist]').forEach(b=>b.onclick=()=>{try{v4MoveIntel(b.dataset.v90Hist)}catch(_){ }})}

/* ---------- Release/version ---------- */
setRelease();
const BASE_RENDER_90=render;
render=function(){const out=BASE_RENDER_90.apply(this,arguments);requestAnimationFrame(()=>{stamp()});return out};
window.RigGOV90={release:RELEASE,build:BUILD,email:v90EmailHtml,activeData,historyRows};
setTimeout(()=>{stamp();try{if(state?.auth?.logged&&!document.documentElement.classList.contains('riggo-booting'))render()}catch(_){ }},120);
})();

/* ===== SOURCE riggo-v95.js (consolidated) ===== */
/* RigGO 9.5 · Pilot Candidate · stable branch from approved RigGO 9.0 */
(function(){
'use strict';
const RELEASE='9.5.1-performance-hotfix';
const BUILD='2026-08-16-1504-C1';
const E=id=>document.getElementById(id);
const N=v=>Number(v)||0;
const R=(v,d=1)=>{const p=10**d;return Math.round((Number(v)||0)*p)/p};
const P=v=>Math.max(0,Math.min(100,N(v)));
const ESC=v=>typeof enc==='function'?enc(v??''):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const ADMIN=()=>{try{return !!hasPerm('admin')}catch(_){return false}};
function mgmt(m){try{return typeof v4Mgmt==='function'?(v4Mgmt(m)||{}):(m.management||{})}catch(_){return m?.management||{}}}
function setRelease(){}
function stamp(){const box=document.querySelector('.v5-admin-build');if(box){const b=box.querySelector('b');if(b)b.textContent='RigGO '+RELEASE;const s=box.querySelectorAll('span');if(s.length)s[s.length-1].textContent=BUILD}}

/* ---------- Login: exact 3-line copy ---------- */
const BASE_LOGIN_90=renderLogin;
renderLogin=function(){
  BASE_LOGIN_90();
  const copy=document.querySelector('.v3-login-copy');
  if(copy){
    const h=copy.querySelector('h2');
    if(h){h.classList.add('v90-login-title');h.innerHTML='<span class="v90-line">Gestiona tu</span><span class="v90-line">Movilización</span><span class="v90-line">con Excelencia.</span>';}
  }
};

/* ---------- Reporting navigation: final guard at point of advance ---------- */
function showMissing(missing){
  document.querySelectorAll('.v61-required-error').forEach(x=>x.classList.remove('v61-required-error'));
  document.querySelector('.v61-validation-banner')?.remove();
  if(!missing?.length)return false;
  const banner=document.createElement('div');banner.className='v61-validation-banner';banner.textContent='Completa antes de continuar: '+missing.map(x=>x.label).join(', ')+'.';
  const head=document.querySelector('.v3-report-head');if(head)head.insertAdjacentElement('afterend',banner);
  const ids=missing.flatMap(x=>x.ids||[]);ids.forEach(id=>E(id)?.classList.add('v61-required-error'));
  const first=ids.map(E).find(Boolean);if(first){first.scrollIntoView({behavior:'smooth',block:'center'});if(first.tagName!=='CANVAS')setTimeout(()=>{try{first.focus({preventScroll:true})}catch(_){ }},100)}
  try{toast('Completa los datos requeridos antes de continuar')}catch(_){ }
  return true;
}
function missingAt(step,c,p){try{return window.RigGOV61?.missing?.(step,c,p)||[]}catch(_){return[]}}
function firstMissingThrough(c,p,through){for(let s=0;s<=Math.min(4,through);s++){const m=missingAt(s,c,p);if(m.length)return{step:s,missing:m}}return null}
const BASE_WIRE_REPORT_90=wireReport;
wireReport=function(m,p,c){
  BASE_WIRE_REPORT_90(m,p,c);
  const nextOld=E('v3ReportNext');
  if(nextOld){const next=nextOld.cloneNode(true);nextOld.replaceWith(next);next.onclick=()=>{try{captureExecText(m,p,c)}catch(_){ }const step=Number(c.reportStep)||0,hit=firstMissingThrough(c,p,step);if(hit){c.reportStep=hit.step;save();render();setTimeout(()=>showMissing(hit.missing),0);return}c.reportVisited=c.reportVisited||{};c.reportVisited[step]=true;c.reportStep=Math.min(6,step+1);save();render();try{scrollTopNow()}catch(_){ }};}
  document.querySelectorAll('[data-v3-reportstep]').forEach(old=>{const b=old.cloneNode(true);old.replaceWith(b);b.onclick=()=>{try{captureExecText(m,p,c)}catch(_){ }const target=Number(b.dataset.v3Reportstep),step=Number(c.reportStep)||0;if(target<=step){c.reportStep=target;save();render();return}const hit=firstMissingThrough(c,p,target-1);if(hit){c.reportStep=hit.step;save();render();setTimeout(()=>showMissing(hit.missing),0);return}if(target===step+1||c.reportVisited?.[target]){c.reportStep=target;save();render()}}});
};

/* ---------- One renderer for email preview + send ---------- */
function emailBase(m,p,c,opt){
  const fn=window.RigGOV70?.email||window.RigGOV61?.email||emailHtml;
  let h=fn(m,p,c,opt||{});
  h=h.replace(/Lectura ejecutiva:/gi,'Resumen:').replace(/Summary:/gi,'Resumen:');
  return h;
}
function v90EmailHtml(m,p,c,{forSend=false}={}){
  c.siteSupervisorRole=c.siteSupervisorRole||'Rig Manager';
  return emailBase(m,p,c,{forSend});
}
emailHtml=v90EmailHtml;
finalEmailHtml=function(m,p,c){return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:0;background:#f3f5f7;font-family:Arial,Helvetica,sans-serif;color:#17202a">${v90EmailHtml(m,p,c,{forSend:true})}</body></html>`};

function b64(data){const i=String(data||'').indexOf(',');return i>=0?String(data).slice(i+1):String(data||'')}
function blob64(blob){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(b64(r.result));r.onerror=reject;r.readAsDataURL(blob)})}
function prepPhoto(dataUrl,w=900,h=600,q=.78){return new Promise(resolve=>{if(!dataUrl){resolve('');return}const img=new Image();img.onload=()=>{try{const sw=img.naturalWidth||img.width,sh=img.naturalHeight||img.height,scale=Math.min(w/sw,h/sh),dw=Math.max(1,Math.round(sw*scale)),dh=Math.max(1,Math.round(sh*scale)),dx=Math.round((w-dw)/2),dy=Math.round((h-dh)/2),cv=document.createElement('canvas');cv.width=w;cv.height=h;const ctx=cv.getContext('2d');ctx.fillStyle='#eef1f4';ctx.fillRect(0,0,w,h);ctx.drawImage(img,dx,dy,dw,dh);resolve(cv.toDataURL('image/jpeg',q))}catch(_){resolve(dataUrl)}};img.onerror=()=>resolve(dataUrl);img.src=dataUrl})}
async function invoke(body){const SB=window.RigGOSupabase,{data,error}=await SB.functions.invoke('riggo-send-email',{body});if(error){let detail='';try{if(error.context&&typeof error.context.json==='function'){const b=await error.context.json();detail=b?.error?.message||b?.error||b?.message||''}}catch(_){ }throw new Error(detail||error.message||'No fue posible enviar.')}if(!data?.ok)throw new Error(data?.error?.message||data?.error||'El proveedor no confirmó el envío.');return data}
async function nextVersion(m,periodId,type){const {data,error}=await window.RigGOSupabase.from('reports').select('version').eq('move_id',m.id).eq('period_id',periodId).eq('report_type',type).order('version',{ascending:false}).limit(1);if(error)throw error;return Number(data?.[0]?.version||0)+1}
async function reportRow(m,periodId,type,version,path,to,cc,status){const {data,error}=await window.RigGOSupabase.from('reports').insert({move_id:m.id,period_id:periodId,report_type:type,version,storage_path:path||null,recipients_to:to,recipients_cc:cc,status:status||'pending_send',generated_by:state.auth.email||null}).select('id').single();if(error)throw error;return data.id}
function recipients(m,c){return{to:c.deliveryTo??m.reportConfig?.dailyTo??'',cc:c.deliveryCc??m.reportConfig?.dailyCc??''}}
let sending90=false;
sendDailyReport=async function(m,p,c){
  if(sending90)return;if(!c.closedAt){alert('Cierra el día antes de enviar.');return}if(!c.f0065ReviewedAt){state.reportView='f0065';save();render();return}
  const parse=window.RigGOV70?.parseEmails||((s)=>({emails:String(s||'').split(';').map(x=>x.trim()).filter(Boolean),invalid:[]})),rec=recipients(m,c);if(String(rec.to||'').length+String(rec.cc||'').length>500){alert('La distribución entre Para y CC no puede superar 500 caracteres.');return}const toP=parse(rec.to),ccP=parse(rec.cc),bad=[...(toP.invalid||[]),...(ccP.invalid||[])];
  if(bad.length){alert('Revisa: '+bad.join(', '));return}const to=toP.emails||[],cc=ccP.emails||[];if(!to.length){alert('Agrega al menos un destinatario en Para.');return}
  const SB=window.RigGOSupabase;if(!SB){alert('No hay conexión con Supabase.');return}
  const btn=E('sendFromReview'),result=E('sendResult');sending90=true;if(btn){btn.disabled=true;btn.textContent='Preparando…'}if(result){result.style.color='#a8c0ff';result.textContent='Preparando Daily Move Update…'}let rid=null;
  try{
    c.siteSupervisorRole=c.siteSupervisorRole||'Rig Manager';
    const originals=(c.photos||[]).slice(),photos=await Promise.all(originals.slice(0,2).map(x=>prepPhoto(x))),pdf=await window.RigGOReportV12.generateOpsPdfBlob(m,p,c),periodId=await window.RigGOReportV12.ensureDbPeriod(m,p);c.dbPeriodId=periodId;await window.RigGOReportV12.saveClosureRecord(m,p,c,periodId);
    let opsPath=c.opsStoragePath||'',opsName=opsPath?opsPath.split('/').pop():'';
    if(!opsPath){opsName=`OPS-F0065-S_${String(m.meta.rig||'Rig').replace(/[^a-z0-9_-]+/gi,'_')}_Dia${p.index}_${new Date().toISOString().replace(/[-:TZ.]/g,'').slice(0,14)}.pdf`;opsPath=`${m.id}/periods/${periodId}/reports/${opsName}`;const up=await SB.storage.from('riggo-files').upload(opsPath,pdf,{contentType:'application/pdf',upsert:true,cacheControl:'3600'});if(up.error)throw up.error;c.opsStoragePath=opsPath;const fv=await nextVersion(m,periodId,'f0065');await reportRow(m,periodId,'f0065',fv,opsPath,[],[],'generated')}
    const dv=await nextVersion(m,periodId,'daily_move_update');rid=await reportRow(m,periodId,'daily_move_update',dv,null,to,cc,'pending_send');
    if(btn)btn.textContent='Enviando…';if(result)result.textContent='Enviando Daily Move Update + OPS…';
    const attachments=[{filename:opsName||`OPS-F0065-S_${m.meta.rig}_Dia${p.index}.pdf`,content:await blob64(pdf)}];photos.forEach((x,i)=>attachments.push({filename:`RigGO_Photo_${i+1}.jpg`,content:b64(x),contentId:`photo-${i+1}`}));
    const ec={...c,photos,photoCaptions:(c.photoCaptions||[]).slice(0,2),siteSupervisorRole:c.siteSupervisorRole||'Rig Manager'};
    const response=await invoke({to,cc,subject:`Rig ${m.meta.rig} | Daily Move Update | Día ${p.index} | ${m.meta.origin} to ${m.meta.destination}`,html:finalEmailHtml(m,p,ec),replyTo:state.auth.email||undefined,attachments});
    const sent=nowIso();c.sentAt=sent;c.sendStatus='sent';c.messageId=response.messageId||'';c.reportPhotoCount=photos.length;c.reportHadSignature=!!c.signature;await SB.from('reports').update({status:'sent',provider_message_id:response.messageId||null,sent_at:sent}).eq('id',rid);await SB.from('daily_closures').update({sent_at:sent}).eq('period_id',periodId);c.photos=[];c.photoCaptions=[];c.signature='';save();if(result){result.style.color='#8ae4ad';result.textContent=`Enviado ✓ · OPS adjunto · ${photos.length} foto${photos.length===1?'':'s'}`}toast('Daily Move Update enviado');setTimeout(render,400);
  }catch(e){console.error('RigGO 9.0 report send',e);try{if(rid)await SB.from('reports').update({status:'failed',error_message:String(e.message||e)}).eq('id',rid)}catch(_){ }if(result){result.style.color='#ffafb8';result.textContent='Error: '+String(e.message||e)}else alert('No fue posible enviar: '+e.message)}finally{sending90=false;if(btn&&document.body.contains(btn)){btn.disabled=false;btn.textContent=c.sentAt?'Reenviar':'Enviar Daily Move Update + OPS'}}
};

/* ---------- Management Performance: mobile-first ---------- */
function phaseAvg(o){return (N(o?.rd)+N(o?.rm)+N(o?.ru))/3}
function activeAccessibleMoves(){return (state.moves||[]).filter(m=>{const g=mgmt(m),release=String(m.exec?.actualRelease||'').trim(),acceptance=String(m.exec?.actualAcceptance||'').trim(),activeByDates=!!release&&!acceptance,activeByStatus=m.status==='active';return !g.deletedAt&&!g.archivedAt&&m.status!=='closed'&&(activeByDates||activeByStatus)})}
function currentPeriod(m){const ps=(typeof movePeriods==='function'?movePeriods(m):[])||[],now=Date.now();return ps.find(p=>new Date(p.start).getTime()<=now&&new Date(p.end).getTime()>now)||ps.filter(p=>new Date(p.start).getTime()<=now).at(-1)||ps[0]||null}
function flatHours(m){let h=0;for(const p of (typeof movePeriods==='function'?movePeriods(m):[])||[]){const c=m.exec?.closures?.[p.id];if(c)try{h+=flatSummary(c.flatEvents||[],p).net}catch(_){ }}return h}
function loadTotals(m,p){let moved=0,total=0,pos=0;for(const sc of ['Rig','Mini Camp','Camp','Operador / Terceros']){try{const q=scopeCounts(m,sc,p);moved+=N(q.moved);total+=N(q.total);pos+=N(q.pos)}catch(_){ }}return{moved,total,pos}}
function pendingItems(m,p){try{return p?(pendingDay(m,p)||[]):[]}catch(_){return[]}}
function nextMilestone(m,p){const c=p?m.exec?.closures?.[p.id]:null,rows=(c?.milestones||m.milestones||[]).filter(x=>!x.actual&&(x.forecast||x.base)).sort((a,b)=>new Date(a.forecast||a.base)-new Date(b.forecast||b.base));return rows[0]||null}
function liveData(m){const p=currentPeriod(m),actual=moveProgressSnapshot(m),plan=p?currentPlanPcts(m,p):{rd:0,rm:0,ru:0},progress=phaseAvg(actual),planAvg=phaseAvg(plan),gap=progress-planAvg,status=gap<-2?'late':gap>2?'ahead':'ontime',planned=typeof v4PlannedDays==='function'?v4PlannedDays(m):Math.max(1,plannedDayCount(m)),elapsed=m.exec?.actualRelease?Math.max(0,(Date.now()-new Date(m.exec.actualRelease).getTime())/86400000):0,timePct=planned?elapsed/planned*100:0,loads=loadTotals(m,p),pending=pendingItems(m,p);return{m,p,actual,plan,progress,planAvg,gap,status,planned,elapsed,timePct,loads,pending,flat:flatHours(m),milestone:nextMilestone(m,p)}}
function activeData(){return activeAccessibleMoves().map(liveData)}
function stateMeta(x){return x.status==='late'?{label:'Atrasada',cls:'late',accent:'#e45f6a'}:x.status==='ahead'?{label:'Adelantada',cls:'ahead',accent:'#1dac99'}:{label:'En tiempo',cls:'ontime',accent:'#eea140'}}
function ring(label,pct,sub,accent){return `<div class="v90-ring-card"><div class="v90-ring-wrap"><div class="v90-ring" style="--v90-p:${P(pct)};--v90-accent:${accent}"></div><b>${Math.round(P(pct))}%</b></div><label>${ESC(label)}</label><small>${ESC(sub)}</small></div>`}
function liveRings(items){const prog=items.length?items.reduce((s,x)=>s+x.progress,0)/items.length:0,time=items.length?items.reduce((s,x)=>s+Math.min(100,x.timePct),0)/items.length:0,on=items.length?items.filter(x=>x.status==='ontime').length/items.length*100:0;return `<div class="v90-rings">${ring('Avance',prog,'promedio activo','#25c57e')}${ring('Tiempo',time,'consumido vs plan','#3375ff')}${ring('En tiempo',on,`${items.filter(x=>x.status==='ontime').length} de ${items.length}`,'#eea140')}</div>`}
function liveQuick(items){const flat=items.reduce((s,x)=>s+x.flat,0),moved=items.reduce((s,x)=>s+x.loads.moved,0),total=items.reduce((s,x)=>s+x.loads.total,0),mail=items.reduce((s,x)=>{try{return s+reportDeliveryPending(x.m).length}catch(_){return s}},0);return `<div class="v90-quick"><div><span>Moves</span><b>${items.length}</b><small>en ejecución</small></div><div><span>Flat Time</span><b>${R(flat,1)} h</b><small>neto acumulado</small></div><div><span>Cargas</span><b>${moved}/${total}</b><small>movilizadas</small></div><div><span>Emails</span><b>${mail}</b><small>pendientes</small></div></div>`}
function lineSvg(items){if(!items.length)return '<div class="v90-empty">No hay Moves en curso.</div>';const a=items.slice().sort((x,y)=>x.timePct-y.timePct),W=600,H=220,p={l:34,r:12,t:14,b:28},x=i=>p.l+(a.length===1?(W-p.l-p.r)/2:i*(W-p.l-p.r)/(a.length-1)),y=v=>p.t+(1-P(v)/100)*(H-p.t-p.b),pts=k=>a.map((z,i)=>`${x(i)},${y(z[k])}`).join(' ');let s=`<svg viewBox="0 0 ${W} ${H}">`;[0,25,50,75,100].forEach(v=>{const yy=y(v);s+=`<line class="grid" x1="${p.l}" y1="${yy}" x2="${W-p.r}" y2="${yy}"></line><text x="${p.l-5}" y="${yy+3}" text-anchor="end">${v}</text>`});s+=`<polyline class="time" points="${pts('timePct')}"></polyline><polyline class="progress" points="${pts('progress')}"></polyline><polyline class="plan" points="${pts('planAvg')}"></polyline>`;a.forEach((z,i)=>s+=`<text x="${x(i)}" y="${H-8}" text-anchor="middle">${ESC(z.m.meta.rig)}</text>`);return s+'</svg>'}
function liveChart(items){return `<div class="v90-panel"><div class="v90-panel-head"><div><h2>Tiempo vs Avance</h2><p>Portafolio activo</p></div></div><div class="v90-chart">${lineSvg(items)}</div><div class="v90-legend"><span class="time"><i></i>Tiempo</span><span class="progress"><i></i>Actual</span><span class="plan"><i></i>Plan</span></div></div>`}
function statusBars(items){const c={late:0,ontime:0,ahead:0};items.forEach(x=>c[x.status]++);const mx=Math.max(1,c.late,c.ontime,c.ahead),bar=(k,label)=>`<div class="v90-statebar ${k}"><strong>${c[k]}</strong><div class="track"><i style="height:${c[k]/mx*100}%"></i></div><span>${label}</span></div>`;return `<div class="v90-panel"><div class="v90-panel-head"><div><h2>Estado</h2><p>Lectura rápida</p></div></div><div class="v90-statebars">${bar('late','Atrasada')}${bar('ontime','En tiempo')}${bar('ahead','Adelantada')}</div></div>`}
function liveList(items){return `<div class="v90-panel"><div class="v90-panel-head"><div><h2>Moves en curso</h2><p>Toca una Move para ver detalle y pendientes</p></div><span class="status gray">${items.length}</span></div>${items.length?`<div class="v90-moves">${items.map(x=>{const z=stateMeta(x),ms=x.milestone?.name||'Sin hito pendiente';return `<button class="v90-move" data-v90-live="${x.m.id}"><div class="v90-mini-ring-wrap"><div class="v90-mini-ring" style="--v90-p:${P(x.progress)};--v90-accent:${z.accent}"></div><b>${Math.round(P(x.progress))}%</b></div><div><h3>${ESC(x.m.meta.rig)}</h3><div class="sub">${ESC(x.m.meta.operator||'')} · Día ${x.p?.index||'—'} / ${x.planned} · ${ESC(x.m.meta.origin)} → ${ESC(x.m.meta.destination)}</div><div class="v90-tags"><span class="v90-tag ${z.cls}">${z.label}</span><span class="v90-tag">Tiempo ${Math.round(x.timePct)}%</span><span class="v90-tag">Flat ${R(x.flat,1)} h</span><span class="v90-tag">Cargas ${x.loads.moved}/${x.loads.total}</span><span class="v90-tag">Pendientes ${x.pending.length}</span><span class="v90-tag">${ESC(ms)}</span></div></div><span class="v90-arrow">›</span></button>`}).join('')}</div>`:'<div class="v90-empty">No hay Moves en curso.</div>'}</div>`}

function historyRows(){let rows=[];try{rows=v4RealHistoryRows()}catch(_){rows=[]}return rows.filter(x=>{const type=x.type||mgmt(x.move||{}).type;return type!=='Prueba'||(ADMIN()&&state.filters?.includeTests)})}
function histAgg(rows){const n=rows.length||1,on=rows.filter(x=>N(x.gross)<=N(x.plan)+.01).length,plan=rows.reduce((s,x)=>s+N(x.plan),0)/n,gross=rows.reduce((s,x)=>s+N(x.gross),0)/n,net=rows.reduce((s,x)=>s+N(x.net),0)/n,flat=rows.reduce((s,x)=>s+N(x.flatHours),0);return{count:rows.length,on:rows.length?on/rows.length*100:0,plan,gross,net,flat,var:gross-plan}}
function histRings(rows){const a=histAgg(rows),eff=a.net?Math.min(100,a.plan/a.net*100):0,flatImpact=a.gross?Math.min(100,Math.max(0,100-a.flat/(a.gross*24)*100)):100;return `<div class="v90-rings">${ring('On Plan',a.on,`${a.count} moves`,'#25c57e')}${ring('Net Efficiency',eff,`Plan ${R(a.plan,1)} d · Net ${R(a.net,1)} d`,'#3375ff')}${ring('Productive Time',flatImpact,`${R(a.flat,1)} h Flat Time`,'#eea140')}</div>`}
function histQuick(rows){const a=histAgg(rows);return `<div class="v90-hist-cards"><div><span>Moves</span><b>${a.count}</b><small>finalizadas</small></div><div><span>Avg Plan</span><b>${R(a.plan,1)} d</b><small>baseline</small></div><div><span>Avg Gross</span><b>${R(a.gross,1)} d</b><small>actual total</small></div><div><span>Avg Variance</span><b>${a.var>0?'+':''}${R(a.var,1)} d</b><small>gross vs plan</small></div></div>`}
function monthly(rows){const g={};for(const x of rows){const raw=x.acceptance||x.release;if(!raw)continue;const d=new Date(raw);if(isNaN(d))continue;const k=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`,a=g[k]||(g[k]={n:0,plan:0,gross:0,net:0});a.n++;a.plan+=N(x.plan);a.gross+=N(x.gross);a.net+=N(x.net)}return Object.entries(g).sort().slice(-8).map(([k,a])=>({k,plan:a.plan/a.n,gross:a.gross/a.n,net:a.net/a.n}))}
function histChart(rows){const a=monthly(rows);if(!a.length)return `<div class="v90-panel"><div class="v90-empty">Sin histórico suficiente.</div></div>`;const W=600,H=220,p={l:34,r:12,t:14,b:28},mx=Math.max(1,...a.flatMap(z=>[z.plan,z.gross,z.net])),x=i=>p.l+(a.length===1?(W-p.l-p.r)/2:i*(W-p.l-p.r)/(a.length-1)),y=v=>p.t+(1-v/mx)*(H-p.t-p.b),pts=k=>a.map((z,i)=>`${x(i)},${y(z[k])}`).join(' ');let s=`<svg viewBox="0 0 ${W} ${H}">`;for(let i=0;i<5;i++){const v=mx*i/4,yy=y(v);s+=`<line class="grid" x1="${p.l}" y1="${yy}" x2="${W-p.r}" y2="${yy}"></line><text x="${p.l-5}" y="${yy+3}" text-anchor="end">${R(v,1)}</text>`}s+=`<polyline class="plan" points="${pts('plan')}"></polyline><polyline class="time" points="${pts('gross')}"></polyline><polyline class="progress" points="${pts('net')}"></polyline>`;a.forEach((z,i)=>s+=`<text x="${x(i)}" y="${H-8}" text-anchor="middle">${z.k.slice(5)}</text>`);s+='</svg>';return `<div class="v90-panel"><div class="v90-panel-head"><div><h2>Tendencia histórica</h2><p>Plan vs Gross vs Net</p></div></div><div class="v90-chart">${s}</div><div class="v90-legend"><span class="plan"><i></i>Plan</span><span class="time"><i></i>Gross</span><span class="progress"><i></i>Net</span></div></div>`}
function scoreRow(x){try{return v4Score(x).score}catch(_){return null}}
function topMoves(rows,worst=false){const a=rows.map(x=>({x,score:scoreRow(x)})).filter(z=>z.score!=null).sort((a,b)=>worst?a.score-b.score:b.score-a.score).slice(0,6);return `<div class="v90-panel"><div class="v90-panel-head"><div><h2>${worst?'Mayor oportunidad':'Top Moves'}</h2><p>${worst?'Dónde enfocar mejora':'Mejor adherencia'}</p></div></div><div class="v90-rank">${a.length?a.map((z,i)=>`<button class="v90-rank-row" data-v90-hist="${z.x.id}"><span class="n">${i+1}</span><span><b>${ESC(z.x.rig)} · ${ESC(z.x.operator||'')}</b><small>Plan ${R(z.x.plan,1)} d · Gross ${R(z.x.gross,1)} d · Net ${R(z.x.net,1)} d</small></span><strong>${z.score}</strong></button>`).join(''):'<div class="v90-empty">Sin datos.</div>'}</div></div>`}
function grouped(rows,key){const g={};for(const x of rows){const k=x[key]||'Sin dato',s=scoreRow(x);if(s==null)continue;const a=g[k]||(g[k]={n:0,sum:0});a.n++;a.sum+=s}return Object.entries(g).map(([name,a])=>({name,n:a.n,score:Math.round(a.sum/a.n)})).sort((a,b)=>b.score-a.score).slice(0,6)}
function groupRank(title,a){return `<div class="v90-panel"><div class="v90-panel-head"><div><h2>${ESC(title)}</h2><p>Benchmark</p></div></div><div class="v90-rank">${a.length?a.map((x,i)=>`<div class="v90-rank-row"><span class="n">${i+1}</span><span><b>${ESC(x.name)}</b><small>${x.n} move${x.n===1?'':'s'}</small></span><strong>${x.score}</strong></div>`).join(''):'<div class="v90-empty">Sin datos.</div>'}</div></div>`}

function openLiveDetail(id){const x=activeData().find(z=>z.m.id===id);if(!x)return;const z=stateMeta(x),next24=x.p?String(x.m.exec?.closures?.[x.p.id]?.next24||'').split(/\r?\n/).map(s=>s.replace(/^\s*[•*-]\s*/, '').trim()).filter(Boolean).slice(0,5):[];sheetRoot.innerHTML=`<div class="sheet-backdrop"><div class="sheet wide"><div class="sheet-handle"></div><div class="row between wrap"><div><div class="eyebrow">${z.label.toUpperCase()}</div><h2>${ESC(x.m.meta.rig)} · Día ${x.p?.index||'—'}</h2><div class="sheet-sub">${ESC(x.m.meta.origin)} → ${ESC(x.m.meta.destination)}</div></div><span class="v90-tag ${z.cls}">${z.label}</span></div><div class="v90-detail"><div class="v90-detail-kpis"><div><span>Tiempo</span><b>${R(x.elapsed,1)} / ${x.planned} d</b></div><div><span>Avance</span><b>${Math.round(x.progress)}%</b></div><div><span>Plan hoy</span><b>${Math.round(x.planAvg)}%</b></div><div><span>Flat Time</span><b>${R(x.flat,1)} h</b></div><div><span>Cargas</span><b>${x.loads.moved}/${x.loads.total}</b></div><div><span>Pendientes</span><b>${x.pending.length}</b></div></div><div><h3>Pendientes del día</h3><div class="v90-pending">${x.pending.length?x.pending.map(v=>`<div>${ESC(v)}</div>`).join(''):'<div>Sin pendientes.</div>'}</div></div><div><h3>Próximas 24 Hrs</h3><div class="v90-pending">${next24.length?next24.map(v=>`<div>${ESC(v)}</div>`).join(''):'<div>Sin actividades registradas.</div>'}</div></div></div><div class="sheet-footer"><button id="v90CloseDetail" class="btn">Cerrar</button>${typeof hasPerm==='function'&&hasPerm('execute')?'<button id="v90OpenMove" class="btn primary">Abrir Move</button>':''}</div></div></div>`;E('v90CloseDetail').onclick=closeSheet;if(E('v90OpenMove'))E('v90OpenMove').onclick=()=>{closeSheet();state.selectedMoveId=x.m.id;state.screen='execute';state.execMode='days';save();render();try{scrollTopNow()}catch(_){ }}
}

renderOverall=function(){state.overallTab=['live','history','top'].includes(state.overallTab)?state.overallTab:'live';const tab=state.overallTab,live=activeData(),rows=historyRows(),body=tab==='live'?`${liveRings(live)}${liveQuick(live)}<div class="v90-grid2">${liveChart(live)}${statusBars(live)}</div>${liveList(live)}`:tab==='history'?`${histRings(rows)}${histQuick(rows)}<div class="v90-grid2">${histChart(rows)}${topMoves(rows,false)}</div>`:`<div class="v90-grid2">${topMoves(rows,false)}${topMoves(rows,true)}</div><div class="v90-grid2">${groupRank('Top Rigs',grouped(rows,'rig'))}${groupRank('Top Operators',grouped(rows,'operator'))}</div>${groupRank('Top Move Companies',grouped(rows,'company'))}`;return `<div class="v90-perf"><div class="v90-perf-head"><div><div class="eyebrow">RIGGO · MANAGEMENT PERFORMANCE</div><h1>Performance</h1><p>${tab==='live'?'Qué está pasando ahora y dónde intervenir.':tab==='history'?'Tendencia y resultado de las Moves finalizadas.':'Referentes y oportunidades de mejora.'}</p></div><div class="v90-tabs"><button data-v90-tab="live" class="${tab==='live'?'active':''}">En curso</button><button data-v90-tab="history" class="${tab==='history'?'active':''}">Histórico</button><button data-v90-tab="top" class="${tab==='top'?'active':''}">Top</button></div></div>${body}</div>`}
wireOverall=function(){document.querySelectorAll('[data-v90-tab]').forEach(b=>b.onclick=()=>{state.overallTab=b.dataset.v90Tab;save();render();try{window.scrollTo(0,0)}catch(_){ }});document.querySelectorAll('[data-v90-live]').forEach(b=>b.onclick=()=>openLiveDetail(b.dataset.v90Live));document.querySelectorAll('[data-v90-hist]').forEach(b=>b.onclick=()=>{try{v4MoveIntel(b.dataset.v90Hist)}catch(_){ }})}

/* ---------- Release/version ---------- */
setRelease();
const BASE_RENDER_90=render;
render=function(){const out=BASE_RENDER_90.apply(this,arguments);requestAnimationFrame(()=>{stamp()});return out};
window.RigGOV95={release:RELEASE,build:BUILD,email:v90EmailHtml,activeData,historyRows};
setTimeout(()=>{stamp();try{if(state?.auth?.logged&&!document.documentElement.classList.contains('riggo-booting'))render()}catch(_){ }},120);
})();

/* ===== SOURCE riggo-v96.js (consolidated) ===== */
/* RigGO 9.6 · Performance Test Visibility · patch over user-confirmed 9.5.1 */
(function(){
'use strict';
const RELEASE='9.6.0-performance-test-visibility-c1';
const BUILD='2026-08-16-1526-C1';
const E=id=>document.getElementById(id);
const N=v=>Number(v)||0;
const R=(v,d=1)=>{const p=10**d;return Math.round((Number(v)||0)*p)/p};
const P=v=>Math.max(0,Math.min(100,N(v)));
const ESC=v=>typeof enc==='function'?enc(v??''):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const ADMIN=()=>{try{return !!hasPerm('admin')}catch(_){return false}};
function mgmt(m){try{return typeof v4Mgmt==='function'?(v4Mgmt(m)||{}):(m?.management||{})}catch(_){return m?.management||{}}}
function isTest(m){const g=mgmt(m);return g.type==='Prueba'||g.demo===true}
function lifecycle(m){try{return typeof v4Lifecycle==='function'?String(v4Lifecycle(m)||''):String(m?.status||'')}catch(_){return String(m?.status||'')}}
function isLiveMove(m){
  if(!m)return false;
  const g=mgmt(m);
  if(g.deletedAt||g.archivedAt||g.source==='Legacy')return false;
  const status=String(m.status||'').toLowerCase();
  const serverStatus=String(m.syncMeta?.serverStatus||'').toLowerCase();
  if(['closed','completed'].includes(status)||['closed','completed'].includes(serverStatus))return false;
  const release=String(m.exec?.actualRelease||'').trim();
  const acceptance=String(m.exec?.actualAcceptance||'').trim();
  const life=lifecycle(m).toLowerCase();
  const executionAuthority=Number(m.execSyncMeta?.revision||0)>0;
  const canSeeOverall=(()=>{try{return !!hasPerm('overall')}catch(_){return false}})();
  if(isTest(m)&&!ADMIN()&&!canSeeOverall)return false;
  return serverStatus==='active'||status==='active'||life==='en ejecución'||(!!release&&!acceptance)||(executionAuthority&&!acceptance&&(!!release||serverStatus==='active'));
}
function activeMoves(){return (state.moves||[]).filter(isLiveMove)}
function phaseAvg(o){return (N(o?.rd)+N(o?.rm)+N(o?.ru))/3}
function periods(m){try{return (typeof movePeriods==='function'?movePeriods(m):[])||[]}catch(_){return[]}}
function currentPeriod(m){const ps=periods(m),now=Date.now();return ps.find(p=>new Date(p.start).getTime()<=now&&new Date(p.end).getTime()>now)||ps.filter(p=>new Date(p.start).getTime()<=now).at(-1)||ps[0]||null}
function flatHours(m){let h=0;for(const p of periods(m)){const c=m.exec?.closures?.[p.id];if(c)try{h+=N(flatSummary(c.flatEvents||[],p).net)}catch(_){}}return h}
function loadTotals(m,p){let moved=0,total=0,pos=0;for(const sc of ['Rig','Mini Camp','Camp','Operador / Terceros']){try{const q=scopeCounts(m,sc,p);moved+=N(q.moved);total+=N(q.total);pos+=N(q.pos)}catch(_){}}return{moved,total,pos}}
function pendingItems(m,p){try{return p?(pendingDay(m,p)||[]):[]}catch(_){return[]}}
function nextMilestone(m,p){try{const c=p?m.exec?.closures?.[p.id]:null,rows=(c?.milestones||m.milestones||[]).filter(x=>!x.actual&&(x.forecast||x.base)).sort((a,b)=>new Date(a.forecast||a.base)-new Date(b.forecast||b.base));return rows[0]||null}catch(_){return null}}
function liveData(m){
  const p=currentPeriod(m);
  let actual={rd:0,rm:0,ru:0},plan={rd:0,rm:0,ru:0};
  try{actual=moveProgressSnapshot(m)||actual}catch(_){}
  try{if(p)plan=currentPlanPcts(m,p)||plan}catch(_){}
  const progress=phaseAvg(actual),planAvg=phaseAvg(plan),gap=progress-planAvg;
  const status=gap<-2?'late':gap>2?'ahead':'ontime';
  let planned=Math.max(1,N(m.meta?.plannedDays)||1);
  try{if(typeof v4PlannedDays==='function')planned=Math.max(1,N(v4PlannedDays(m))||planned)}catch(_){}
  const rawRelease=m.exec?.actualRelease||'';
  const rt=rawRelease?new Date(rawRelease).getTime():NaN;
  const elapsed=Number.isFinite(rt)?Math.max(0,(Date.now()-rt)/86400000):0;
  const timePct=planned?elapsed/planned*100:0;
  return{m,p,actual,plan,progress,planAvg,gap,status,planned,elapsed,timePct,loads:loadTotals(m,p),pending:pendingItems(m,p),flat:flatHours(m),milestone:nextMilestone(m,p),test:isTest(m)};
}
function activeData(){return activeMoves().map(m=>{try{return liveData(m)}catch(e){console.warn('RigGO 9.6 Performance Move skipped',m?.id,e);return null}}).filter(Boolean)}
function stateMeta(x){return x.status==='late'?{label:'Atrasada',cls:'late',accent:'#e45f6a'}:x.status==='ahead'?{label:'Adelantada',cls:'ahead',accent:'#1dac99'}:{label:'En tiempo',cls:'ontime',accent:'#eea140'}}
function ring(label,pct,sub,accent){return `<div class="v90-ring-card"><div class="v90-ring-wrap"><div class="v90-ring" style="--v90-p:${P(pct)};--v90-accent:${accent}"></div><b>${Math.round(P(pct))}%</b></div><label>${ESC(label)}</label><small>${ESC(sub)}</small></div>`}
function liveRings(items){const prog=items.length?items.reduce((s,x)=>s+x.progress,0)/items.length:0,time=items.length?items.reduce((s,x)=>s+Math.min(100,x.timePct),0)/items.length:0,on=items.length?items.filter(x=>x.status==='ontime').length/items.length*100:0;return `<div class="v90-rings">${ring('Avance',prog,'promedio activo','#25c57e')}${ring('Tiempo',time,'consumido vs plan','#3375ff')}${ring('En tiempo',on,`${items.filter(x=>x.status==='ontime').length} de ${items.length}`,'#eea140')}</div>`}
function liveQuick(items){const flat=items.reduce((s,x)=>s+x.flat,0),moved=items.reduce((s,x)=>s+x.loads.moved,0),total=items.reduce((s,x)=>s+x.loads.total,0),mail=items.reduce((s,x)=>{try{return s+reportDeliveryPending(x.m).length}catch(_){return s}},0);return `<div class="v90-quick"><div><span>Moves</span><b>${items.length}</b><small>en ejecución</small></div><div><span>Flat Time</span><b>${R(flat,1)} h</b><small>neto acumulado</small></div><div><span>Cargas</span><b>${moved}/${total}</b><small>movilizadas</small></div><div><span>Emails</span><b>${mail}</b><small>pendientes</small></div></div>`}
function lineSvg(items){if(!items.length)return '<div class="v90-empty">No hay Moves en curso.</div>';const a=items.slice().sort((x,y)=>x.timePct-y.timePct),W=600,H=220,p={l:34,r:12,t:14,b:28},x=i=>p.l+(a.length===1?(W-p.l-p.r)/2:i*(W-p.l-p.r)/(a.length-1)),y=v=>p.t+(1-P(v)/100)*(H-p.t-p.b),pts=k=>a.map((z,i)=>`${x(i)},${y(z[k])}`).join(' ');let s=`<svg viewBox="0 0 ${W} ${H}">`;[0,25,50,75,100].forEach(v=>{const yy=y(v);s+=`<line class="grid" x1="${p.l}" y1="${yy}" x2="${W-p.r}" y2="${yy}"></line><text x="${p.l-5}" y="${yy+3}" text-anchor="end">${v}</text>`});s+=`<polyline class="time" points="${pts('timePct')}"></polyline><polyline class="progress" points="${pts('progress')}"></polyline><polyline class="plan" points="${pts('planAvg')}"></polyline>`;a.forEach((z,i)=>s+=`<text x="${x(i)}" y="${H-8}" text-anchor="middle">${ESC(z.m.meta?.rig)}</text>`);return s+'</svg>'}
function liveChart(items){return `<div class="v90-panel"><div class="v90-panel-head"><div><h2>Tiempo consumido vs avance</h2><p>Portafolio activo</p></div></div><div class="v90-chart">${lineSvg(items)}</div><div class="v90-legend"><span class="time"><i></i>Tiempo</span><span class="progress"><i></i>Avance actual</span><span class="plan"><i></i>Plan hoy</span></div></div>`}
function statusBars(items){const c={late:0,ontime:0,ahead:0};items.forEach(x=>c[x.status]++);const mx=Math.max(1,c.late,c.ontime,c.ahead),bar=(k,label)=>`<div class="v90-statebar ${k}"><strong>${c[k]}</strong><div class="track"><i style="height:${c[k]/mx*100}%"></i></div><span>${label}</span></div>`;return `<div class="v90-panel"><div class="v90-panel-head"><div><h2>Estado</h2><p>Atrasada · En tiempo · Adelantada</p></div></div><div class="v90-statebars">${bar('late','Atrasada')}${bar('ontime','En tiempo')}${bar('ahead','Adelantada')}</div></div>`}
function testBadge(x){return x.test?'<span class="v90-tag" style="background:rgba(94,129,255,.13);color:#9fb4ff;border:1px solid rgba(94,129,255,.25)">PRUEBA</span>':''}
function liveList(items){return `<div class="v90-panel"><div class="v90-panel-head"><div><h2>Moves en curso</h2><p>Toca una Move para ver detalle y pendientes</p></div><span class="status gray">${items.length}</span></div>${items.length?`<div class="v90-moves">${items.map(x=>{const z=stateMeta(x),ms=x.milestone?.name||'Sin hito pendiente';return `<button class="v90-move" data-v96-live="${ESC(x.m.id)}"><div class="v90-mini-ring-wrap"><div class="v90-mini-ring" style="--v90-p:${P(x.progress)};--v90-accent:${z.accent}"></div><b>${Math.round(P(x.progress))}%</b></div><div><h3>${ESC(x.m.meta?.rig||'Rig')} ${x.test?'<span style="font-size:8px;letter-spacing:.08em;color:#9fb4ff;vertical-align:middle">· PRUEBA</span>':''}</h3><div class="sub">${ESC(x.m.meta?.operator||'')} · Día ${x.p?.index||'—'} / ${x.planned} · ${ESC(x.m.meta?.origin||'')} → ${ESC(x.m.meta?.destination||'')}</div><div class="v90-tags">${testBadge(x)}<span class="v90-tag ${z.cls}">${z.label}</span><span class="v90-tag">Tiempo ${Math.round(x.timePct)}%</span><span class="v90-tag">Flat ${R(x.flat,1)} h</span><span class="v90-tag">Cargas ${x.loads.moved}/${x.loads.total}</span><span class="v90-tag">Pendientes ${x.pending.length}</span><span class="v90-tag">${ESC(ms)}</span></div></div><span class="v90-arrow">›</span></button>`}).join('')}</div>`:'<div class="v90-empty">No hay Moves en curso.</div>'}</div>`}
function openLiveDetail(id){const x=activeData().find(z=>String(z.m.id)===String(id));if(!x)return;const z=stateMeta(x),next24=x.p?String(x.m.exec?.closures?.[x.p.id]?.next24||'').split(/\r?\n/).map(s=>s.replace(/^\s*[•*-]\s*/, '').trim()).filter(Boolean).slice(0,8):[];sheetRoot.innerHTML=`<div class="sheet-backdrop"><div class="sheet wide"><div class="sheet-handle"></div><div class="row between wrap"><div><div class="eyebrow">${x.test?'PRUEBA · ':''}${z.label.toUpperCase()}</div><h2>${ESC(x.m.meta?.rig||'Rig')} · Día ${x.p?.index||'—'}</h2><div class="sheet-sub">${ESC(x.m.meta?.origin||'')} → ${ESC(x.m.meta?.destination||'')}</div></div><div class="v90-tags">${testBadge(x)}<span class="v90-tag ${z.cls}">${z.label}</span></div></div><div class="v90-detail"><div class="v90-detail-kpis"><div><span>Tiempo</span><b>${R(x.elapsed,1)} / ${x.planned} d</b></div><div><span>Avance</span><b>${Math.round(x.progress)}%</b></div><div><span>Plan hoy</span><b>${Math.round(x.planAvg)}%</b></div><div><span>Gap</span><b>${x.gap>0?'+':''}${R(x.gap,1)} pp</b></div><div><span>Flat Time</span><b>${R(x.flat,1)} h</b></div><div><span>Cargas</span><b>${x.loads.moved}/${x.loads.total}</b></div><div><span>Pendientes</span><b>${x.pending.length}</b></div></div><div><h3>Pendientes del día</h3><div class="v90-pending">${x.pending.length?x.pending.map(v=>`<div>${ESC(v)}</div>`).join(''):'<div>Sin pendientes.</div>'}</div></div><div><h3>Próximas 24 Hrs</h3><div class="v90-pending">${next24.length?next24.map(v=>`<div>${ESC(v)}</div>`).join(''):'<div>Sin actividades registradas.</div>'}</div></div></div><div class="sheet-footer"><button id="v96CloseDetail" class="btn">Cerrar</button>${typeof hasPerm==='function'&&hasPerm('execute')?'<button id="v96OpenMove" class="btn primary">Abrir Move</button>':''}</div></div></div>`;E('v96CloseDetail').onclick=closeSheet;if(E('v96OpenMove'))E('v96OpenMove').onclick=()=>{closeSheet();state.selectedMoveId=x.m.id;state.screen='execute';state.execMode='days';save();render();try{scrollTopNow()}catch(_){}}}

const BASE_RENDER_OVERALL_96=renderOverall;
const BASE_WIRE_OVERALL_96=wireOverall;
renderOverall=function(){
  state.overallTab=['live','history','top'].includes(state.overallTab)?state.overallTab:'live';
  if(state.overallTab!=='live')return BASE_RENDER_OVERALL_96.apply(this,arguments);
  const live=activeData();
  const body=`${liveRings(live)}${liveQuick(live)}<div class="v90-grid2">${liveChart(live)}${statusBars(live)}</div>${liveList(live)}`;
  return `<div class="v90-perf"><div class="v90-perf-head"><div><div class="eyebrow">RIGGO · MANAGEMENT PERFORMANCE</div><h1>Performance</h1><p>Qué está pasando ahora y dónde intervenir.</p></div><div class="v90-tabs"><button data-v90-tab="live" class="active">En curso</button><button data-v90-tab="history">Histórico</button><button data-v90-tab="top">Top</button></div></div>${body}</div>`;
};
wireOverall=function(){
  BASE_WIRE_OVERALL_96.apply(this,arguments);
  document.querySelectorAll('[data-v96-live]').forEach(b=>b.onclick=()=>openLiveDetail(b.dataset.v96Live));
};

window.RigGOV96={release:RELEASE,build:BUILD,isLiveMove,activeMoves,activeData,isTest};


setTimeout(()=>{try{if(state?.auth?.logged&&state.screen==='overall')render()}catch(_){}},160);
})();

/* ===== SOURCE riggo-v97.js (consolidated) ===== */
/* RigGO 9.7 · Management Performance Center · patch over validated RigGO 9.6 */
(function(){
'use strict';
const RELEASE='10.3.0-stable-simplified-c1';
const BUILD='2026-08-16-1940-C1';
const E=id=>document.getElementById(id);
const N=v=>Number(v)||0;
const R=(v,d=1)=>{const p=10**d;return Math.round((Number(v)||0)*p)/p};
const P=v=>Math.max(0,Math.min(100,N(v)));
const ESC=v=>typeof enc==='function'?enc(v??''):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const ADMIN=()=>{try{return !!hasPerm('admin')}catch(_){return false}};
const LEGACY_ROWS=[{"id":"legacy-latam-01","source":"Legacy","type":"Real","operator":"ECOPETROL","rig":"M48","rigType":"PACE-M","company":"FERRO","distance":2.2,"release":"2025-12-22T02:00","acceptance":"2025-12-26T03:00","gross":4.041667,"net":3.8125,"flatHours":5.5,"flatBreakdown":{"Comunidad / Bloqueos":4.5,"Clima / Tormenta":1.0},"comments":"0.0416 days (1 hrs) Electric Storm - 0.187 days (4.5 hrs) Community Strike","plan":0,"origin":"","destination":""},{"id":"legacy-latam-02","source":"Legacy","type":"Real","operator":"ECOPETROL","rig":"M47","rigType":"PACE-M","company":"Globopetrol","distance":3.0,"release":"2026-01-04T00:00","acceptance":"2026-01-08T11:30","gross":4.479167,"net":4.270833,"flatHours":5.0,"flatBreakdown":{"Clima / Tormenta":5.0},"comments":"Total: 0.21 days (5 hrs)  Electric Storm ","plan":0,"origin":"","destination":""},{"id":"legacy-latam-03","source":"Legacy","type":"Real","operator":"SIERRACOL","rig":"X40","rigType":"PACE X","company":"CENTRAL","distance":25.0,"release":"2026-01-14T18:00","acceptance":"2026-01-24T09:00","gross":9.625,"net":9.625,"flatHours":0,"flatBreakdown":{},"comments":"There were no delays in the operation, Mobilization within the time fixed by the Operator. No incidents occurred. ","plan":0,"origin":"","destination":""},{"id":"legacy-latam-04","source":"Legacy","type":"Real","operator":"ECOPETROL","rig":"M48","rigType":"PACE-M","company":"FERRO","distance":9.4,"release":"2026-01-17T11:00","acceptance":"2026-01-21T18:00","gross":4.291667,"net":4.0,"flatHours":7.0,"flatBreakdown":{"Clima / Tormenta":7.0},"comments":"0.29 days (7 hrs) electric storm","plan":0,"origin":"","destination":""},{"id":"legacy-latam-05","source":"Legacy","type":"Real","operator":"ECOPETROL","rig":"M47","rigType":"PACE-M","company":"Globopetrol","distance":12.5,"release":"2026-02-02T09:30","acceptance":"2026-02-07T09:00","gross":4.979167,"net":4.979167,"flatHours":0,"flatBreakdown":{},"comments":"There were no delays in the operation","plan":0,"origin":"","destination":""},{"id":"legacy-latam-06","source":"Legacy","type":"Real","operator":"ECOPETROL","rig":"M48","rigType":"PACE-M","company":"FERRO","distance":12.2,"release":"2026-02-22T00:00","acceptance":"2026-02-26T20:00","gross":4.833333,"net":4.625,"flatHours":5.0,"flatBreakdown":{"Clima / Tormenta":5.0},"comments":"0.2 days (5 hrs) electric storm","plan":0,"origin":"","destination":""},{"id":"legacy-latam-07","source":"Legacy","type":"Real","operator":"ECOPETROL","rig":"M47","rigType":"PACE-M","company":"Globopetrol","distance":5.3,"release":"2026-03-17T16:30","acceptance":"2026-03-22T07:30","gross":4.625,"net":4.520833,"flatHours":2.5,"flatBreakdown":{"Clima / Tormenta":2.5},"comments":"0.1 days (2.5 hrs) electric storm","plan":0,"origin":"","destination":""},{"id":"legacy-latam-08","source":"Legacy","type":"Real","operator":"ECOPETROL","rig":"M48","rigType":"PACE-M","company":"Globopetrol","distance":11.3,"release":"2026-04-01T15:00","acceptance":"2026-04-06T16:00","gross":5.041667,"net":4.916667,"flatHours":3.0,"flatBreakdown":{"Clima / Tormenta":3.0},"comments":"0.13 days (3h) - Waiting on weather.","plan":0,"origin":"","destination":""},{"id":"legacy-latam-09","source":"Legacy","type":"Real","operator":"SIERRACOL","rig":"X40","rigType":"PACE X","company":"CENTRAL","distance":3.2,"release":"2026-04-06T17:00","acceptance":"2026-04-27T00:00","gross":20.291667,"net":9.770833,"flatHours":252.5,"flatBreakdown":{"Comunidad / Bloqueos":243.5,"Empresa de Movilización / Transporte":9.0},"comments":"9 Hrs - Wait on trucks. 243.5 Hrs - Community strike","plan":0,"origin":"","destination":""},{"id":"legacy-latam-10","source":"Legacy","type":"Real","operator":"ECOPETROL","rig":"X42","rigType":"PACE X","company":"Globopetrol","distance":56.6,"release":"2026-04-17T07:30","acceptance":"2026-05-08T17:30","gross":21.416667,"net":12.145833,"flatHours":222.5,"flatBreakdown":{"Comunidad / Bloqueos":208.0,"Clima / Tormenta":14.5},"comments":"100 Hrs - Community Strike. 108 Hrs - Mobility restrictions. 14 Hrs - Waiting on weather ","plan":0,"origin":"","destination":""},{"id":"legacy-latam-11","source":"Legacy","type":"Real","operator":"ECOPETROL","rig":"X45","rigType":"PACE X","company":"Globopetrol","distance":16.7,"release":"2026-05-01T18:00","acceptance":"2026-06-07T17:00","gross":36.958333,"net":11.166667,"flatHours":619.0,"flatBreakdown":{"Comunidad / Bloqueos":616.0,"Clima / Tormenta":3.0},"comments":"Level 2 & 3 Electrical Storms: 3 hrs / Municipal Movement Restrictions: 57 hrs / Community Blockades Force Majeure: 461.5 hrs / Safety Shutdowns: 3 hrs / Other Events: 94.5 hrs","plan":0,"origin":"","destination":""},{"id":"legacy-latam-12","source":"Legacy","type":"Real","operator":"ECOPETROL","rig":"M48","rigType":"PACE-M","company":"FERRO","distance":3.2,"release":"2026-05-08T20:30","acceptance":"2026-05-31T06:00","gross":22.395833,"net":9.604167,"flatHours":307.0,"flatBreakdown":{"Comunidad / Bloqueos":33.0,"Espera en Locación":258.0,"Clima / Tormenta":4.0,"IND":12.0},"comments":"The move took more days than planned due to rig commissioning, well control, and functionality testing. 12 h of Mtto.","plan":0,"origin":"","destination":""},{"id":"legacy-latam-13","source":"Legacy","type":"Real","operator":"ECOPETROL","rig":"M47","rigType":"PACE-M","company":"Globopetrol","distance":16.0,"release":"2026-05-10T22:00","acceptance":"2026-05-23T08:00","gross":12.416667,"net":10.625,"flatHours":43.0,"flatBreakdown":{"Comunidad / Bloqueos":33.0,"Clima / Tormenta":10.0},"comments":"The move took more days than planned due to rig commissioning.","plan":0,"origin":"","destination":""},{"id":"legacy-latam-14","source":"Legacy","type":"Real","operator":"GEOPARK","rig":"X38","rigType":"PACE X","company":"OTS","distance":44.5,"release":"2026-05-18T15:00","acceptance":"2026-06-11T18:00","gross":24.125,"net":11.041667,"flatHours":314.0,"flatBreakdown":{"Comunidad / Bloqueos":246.0,"Empresa de Movilización / Transporte":37.5,"Clima / Tormenta":30.5,"Code 1.O":12.0},"comments":"Community Issues: 10.25 Days / Electric Storm: 0.65 days / Wating Trucking Company Reactivation: 1.56 Days / Flooding Emergency: 0.63 Days / Mud pum Discharge manfold leak: 0.5 days","plan":0,"origin":"","destination":""},{"id":"legacy-latam-15","source":"Legacy","type":"Real","operator":"ECOPETROL","rig":"M47","rigType":"PACE-M","company":"Globopetrol","distance":23.0,"release":"2026-07-17T09:00","acceptance":"2026-07-28T12:00","gross":11.125,"net":5.895833,"flatHours":125.5,"flatBreakdown":{"Comunidad / Bloqueos":119.5,"Clima / Tormenta":6.0},"comments":"119.5 Hrs - Community Strike. // 6 Hrs - Level 2 & 3 Electrical Storms","plan":0,"origin":"","destination":""},{"id":"legacy-latam-16","source":"Legacy","type":"Real","operator":"ECOPETROL","rig":"M48","rigType":"PACE-M","company":"Globopetrol","distance":31.0,"release":"2026-07-10T06:00","acceptance":"2026-07-19T12:00","gross":9.25,"net":6.666667,"flatHours":62.0,"flatBreakdown":{"Comunidad / Bloqueos":42.0,"Clima / Tormenta":20.0},"comments":"42 Hrs - Community Strike. // 20 Hrs - Level 2 & 3 Electrical Storms","plan":0,"origin":"","destination":""},{"id":"legacy-latam-17","source":"Legacy","type":"Real","operator":"ECOPETROL","rig":"X42","rigType":"PACE X","company":"Globopetrol","distance":38.8,"release":"2026-06-21T12:00","acceptance":"2026-07-27T00:00","gross":35.5,"net":13.041667,"flatHours":539.0,"flatBreakdown":{"Comunidad / Bloqueos":536.5,"Clima / Tormenta":2.5,"Code 1.O":2.0},"comments":"210 Hrs. Rig on standby due to the restart of personnel hiring resulting from a route change. // 326.5 Hrs - Community Strike. // 2.5 Hrs - Level 2 & 3 Electrical Storms  // 2 Hrs. 60-ton crane failure (contractor equipment). ","plan":0,"origin":"","destination":""},{"id":"legacy-latam-18","source":"Legacy","type":"Real","operator":"PAREX","rig":"992","rigType":"PACE-990S","company":"TECNITRANSPORTES","distance":238.6,"release":"2026-07-07T09:00","acceptance":"2026-08-01T21:00","gross":25.5,"net":17.708333,"flatHours":187.0,"flatBreakdown":{"Comunidad / Bloqueos":93.0,"Empresa de Movilización / Transporte":91.0,"Clima / Tormenta":3.0},"comments":"93 Hrs. Major Force due to flooding in the area. // 91 - Wait on Trucks . // 3 Hrs - Level 2 & 3 Electrical Storms","plan":13.0,"origin":"","destination":""}];

function nativeLive(){try{return window.RigGOV96?.activeData?.()||[]}catch(e){console.warn('RigGO 9.7 live source',e);return[]}}
function stateMeta(x){return x.status==='late'?{label:'Atrasada',cls:'late',accent:'#ef6671'}:x.status==='ahead'?{label:'Adelantada',cls:'ahead',accent:'#36cf8a'}:{label:'En tiempo',cls:'ontime',accent:'#f2b34f'}}
function phaseMeta(actual,plan){const gap=N(actual)-N(plan);return gap<-2?{label:'Atrasada',cls:'late',gap}:gap>2?{label:'Adelantada',cls:'ahead',gap}:{label:'En tiempo',cls:'ontime',gap}}
function badgeTest(x){return x.test?'<span class="v97-badge test">PRUEBA</span>':''}
function signed(v,d=0){const n=R(v,d);return `${n>0?'+':''}${n}`}

function portfolioHeader(items){
  const c={late:0,ontime:0,ahead:0};items.forEach(x=>c[x.status]++);
  const flat=items.reduce((s,x)=>s+N(x.flat),0),gap=items.length?items.reduce((s,x)=>s+N(x.gap),0)/items.length:0,time=items.length?items.reduce((s,x)=>s+N(x.timePct),0)/items.length:0;
  let overall='Sin Moves activas',cls='neutral';
  if(items.length){overall=c.late>c.ahead?'Portfolio atrasado':c.ahead>c.late?'Portfolio adelantado':'Portfolio alineado';cls=c.late>c.ahead?'late':c.ahead>c.late?'ahead':'ontime'}
  return `<section class="v97-portfolio"><div class="v97-portfolio-main"><div><span>PORTAFOLIO ACTIVO</span><strong>${items.length} Move${items.length===1?'':'s'} en curso</strong><small>${c.ahead} adelantada${c.ahead===1?'':'s'} · ${c.ontime} en tiempo · ${c.late} atrasada${c.late===1?'':'s'}</small></div><span class="v97-status ${cls}">${overall}</span></div><div class="v97-portfolio-kpis"><div><span>Gap promedio</span><b>${signed(gap,1)} pp</b></div><div><span>Flat Time</span><b>${R(flat,1)} h</b></div><div><span>Tiempo consumido</span><b>${Math.round(time)}%</b></div></div></section>`;
}
function phaseRow(label,actual,plan){
  const z=phaseMeta(actual,plan),a=P(actual),p=P(plan);
  return `<div class="v97-phase"><div class="v97-phase-label"><b>${label}</b><span class="v97-phase-state ${z.cls}">${z.label}</span></div><div class="v97-phase-track"><span class="v97-phase-fill ${z.cls}" style="width:${a}%"></span><i style="left:${p}%"></i></div><div class="v97-phase-values"><span>Actual <b>${Math.round(a)}%</b></span><span>Plan ${Math.round(p)}%</span><strong class="${z.cls}">${signed(z.gap,0)} pp</strong></div></div>`;
}
function liveCard(x){
  const z=stateMeta(x),route=[x.m?.meta?.origin,x.m?.meta?.destination].filter(Boolean).join(' → ');
  return `<button class="v97-move-card" data-v97-live="${ESC(x.m?.id)}"><div class="v97-move-head"><div><div class="v97-rigline"><strong>${ESC(x.m?.meta?.rig||'Rig')}</strong>${badgeTest(x)}</div><span>${ESC(x.m?.meta?.operator||'')}${route?' · '+ESC(route):''}</span></div><div class="v97-move-state"><span class="v97-status ${z.cls}">${z.label}</span><b>${signed(x.gap,0)} pp</b></div></div><div class="v97-phase-stack">${phaseRow('Rig Down',x.actual?.rd,x.plan?.rd)}${phaseRow('Transporte',x.actual?.rm,x.plan?.rm)}${phaseRow('Rig Up',x.actual?.ru,x.plan?.ru)}</div><div class="v97-move-foot"><span>Día <b>${x.p?.index||'—'} / ${x.planned||'—'}</b></span><span>Tiempo <b>${Math.round(N(x.timePct))}%</b></span><span>Flat <b>${R(x.flat,1)} h</b></span><span>Pendientes <b>${x.pending?.length||0}</b></span></div></button>`;
}
function liveView(items){return `${portfolioHeader(items)}<section class="v97-section"><div class="v97-section-head"><div><h2>Moves activas</h2><p>Avance físico frente al plan de hoy</p></div></div><div class="v97-live-list">${items.length?items.map(liveCard).join(''):'<div class="v97-empty">No hay Moves en ejecución.</div>'}</div></section>${portfolioFlat(items)}`}

function allFlatEvents(m){
  const out=[];try{const ps=typeof movePeriods==='function'?(movePeriods(m)||[]):[];for(const p of ps){const c=m.exec?.closures?.[p.id];if(!c)continue;for(const e of c.flatEvents||[]){const t=typeof FLAT_TYPES!=='undefined'?FLAT_TYPES.find(q=>q.id===e.type):null;out.push({...e,day:p.index,label:t?.label||e.type||'Flat Time',hours:typeof eventHours==='function'?eventHours(e):N(e.hours)})}}}catch(_){}
  return out;
}
function flatGroups(items){const g={};for(const x of items)for(const e of allFlatEvents(x.m))g[e.label]=(g[e.label]||0)+N(e.hours);return Object.entries(g).sort((a,b)=>b[1]-a[1])}
function portfolioFlat(items){const rows=flatGroups(items),total=rows.reduce((s,x)=>s+x[1],0),max=Math.max(1,...rows.map(x=>x[1]));return `<section class="v97-section"><div class="v97-section-head"><div><h2>Flat Time · Portfolio</h2><p>${R(total,1)} h acumuladas en Moves activas</p></div></div><div class="v97-pareto">${rows.length?rows.slice(0,5).map(([k,v],i)=>`<div class="v97-pareto-row"><span class="n">${i+1}</span><span class="name">${ESC(k)}</span><i><b style="width:${v/max*100}%"></b></i><strong>${R(v,1)} h</strong></div>`).join(''):'<div class="v97-empty compact">Sin Flat Time registrado.</div>'}</div></section>`}
function moveFlatSheet(id){
  const x=nativeLive().find(q=>String(q.m?.id)===String(id));if(!x)return;const events=allFlatEvents(x.m),sum=events.reduce((s,e)=>s+N(e.hours),0);
  sheetRoot.innerHTML=`<div class="sheet-backdrop"><div class="sheet wide"><div class="sheet-handle"></div><div class="v97-sheet-head"><button id="v97BackMove" class="btn small">← Volver</button><div><span>FLAT TIME</span><h2>${ESC(x.m?.meta?.rig||'Rig')} · ${R(sum,1)} h</h2></div></div><div class="v97-flat-events">${events.length?events.map(e=>`<div class="v97-flat-event"><div><strong>${ESC(e.label)} · ${R(e.hours,2)} h</strong><span>Día ${e.day||'—'}${e.responsibility?' · '+ESC(e.responsibility):''}${e.commercial?' · '+ESC(e.commercial):''}</span>${typeof eventDetailSummary==='function'&&eventDetailSummary(e)?`<p>${ESC(eventDetailSummary(e))}</p>`:''}</div></div>`).join(''):'<div class="v97-empty">Sin eventos de Flat Time.</div>'}</div><div class="sheet-footer"><button id="v97CloseFlat" class="btn primary">Cerrar</button></div></div></div>`;
  E('v97BackMove').onclick=()=>openLiveDetail97(id);E('v97CloseFlat').onclick=closeSheet;
}
function openLiveDetail97(id){
  const x=nativeLive().find(q=>String(q.m?.id)===String(id));if(!x)return;const z=stateMeta(x),route=[x.m?.meta?.origin,x.m?.meta?.destination].filter(Boolean).join(' → '),next24=x.p?String(x.m.exec?.closures?.[x.p.id]?.next24||'').split(/\r?\n/).map(s=>s.replace(/^\s*[•*-]\s*/,'').trim()).filter(Boolean):[],ms=x.milestone?.name||'Sin hito pendiente';
  sheetRoot.innerHTML=`<div class="sheet-backdrop"><div class="sheet wide"><div class="sheet-handle"></div><div class="v97-detail-head"><div><div class="v97-rigline"><strong>${ESC(x.m?.meta?.rig||'Rig')}</strong>${badgeTest(x)}</div><span>${ESC(x.m?.meta?.operator||'')}${route?' · '+ESC(route):''}</span></div><span class="v97-status ${z.cls}">${z.label}</span></div><div class="v97-detail-summary"><div><span>Gap global</span><b>${signed(x.gap,1)} pp</b></div><div><span>Tiempo</span><b>${R(x.elapsed,1)} / ${x.planned} d</b></div><div><span>Flat Time</span><b>${R(x.flat,1)} h</b></div><div><span>Pendientes</span><b>${x.pending?.length||0}</b></div></div><div class="v97-detail-phases">${phaseRow('Rig Down',x.actual?.rd,x.plan?.rd)}${phaseRow('Transporte',x.actual?.rm,x.plan?.rm)}${phaseRow('Rig Up',x.actual?.ru,x.plan?.ru)}</div><button class="v97-flat-callout" id="v97FlatDetail"><span><small>FLAT TIME ACUMULADO</small><b>${R(x.flat,1)} h</b></span><strong>Ver eventos ›</strong></button><div class="v97-detail-block"><div class="v97-section-head"><div><h3>Pendientes del día</h3><p>${x.pending?.length||0} actividades</p></div></div><div class="v97-pending-list">${x.pending?.length?x.pending.slice(0,12).map(v=>`<div>${ESC(v)}</div>`).join(''):'<div>Sin pendientes.</div>'}</div></div><div class="v97-detail-block"><div class="v97-section-head"><div><h3>Foco de ejecución</h3><p>Próximo hito · ${ESC(ms)}</p></div></div><div class="v97-pending-list">${next24.length?next24.slice(0,8).map(v=>`<div>${ESC(v)}</div>`).join(''):'<div>Sin próximas actividades registradas.</div>'}</div></div><div class="sheet-footer"><button id="v97CloseDetail" class="btn">Cerrar</button>${typeof canAccessMove==='function'&&canAccessMove(currentUser(),x.m)?'<button id="v97OpenMove" class="btn primary">Abrir Move</button>':''}</div></div></div>`;
  E('v97CloseDetail').onclick=closeSheet;E('v97FlatDetail').onclick=()=>moveFlatSheet(id);if(E('v97OpenMove'))E('v97OpenMove').onclick=()=>{closeSheet();state.selectedMoveId=x.m.id;state.screen='execute';state.execMode='days';save();render();try{window.scrollTo(0,0)}catch(_){}};
}

function riggoNativeHistory(){
  let rows=[];try{rows=(typeof v4RealHistoryRows==='function'?v4RealHistoryRows():[])||[]}catch(_){}
  return rows.filter(x=>x.source==='RigGO'&&(x.type!=='Prueba'||(ADMIN()&&state.filters?.includeTests))).map(x=>{const fb={};if(x.move?.exec?.closures)for(const c of Object.values(x.move.exec.closures))for(const e of c.flatEvents||[]){const label=(typeof FLAT_TYPES!=='undefined'?FLAT_TYPES.find(t=>t.id===e.type)?.label:null)||e.type||'Otros';fb[label]=(fb[label]||0)+(typeof eventHours==='function'?eventHours(e):N(e.hours))}return {...x,source:'RigGO',flatBreakdown:fb,comments:x.move?.closeoutLessons||'',rigType:x.move?.meta?.rigType||'',actualDays:N(x.gross)}})
}
function historyRows97(){const seen=new Set(),out=[];for(const x of [...LEGACY_ROWS,...riggoNativeHistory()]){const k=`${x.source}|${x.id}`;if(seen.has(k))continue;seen.add(k);out.push(x)}return out.sort((a,b)=>new Date(a.acceptance||a.release||0)-new Date(b.acceptance||b.release||0))}
function histAgg(rows){const n=rows.length,avg=k=>n?rows.reduce((s,x)=>s+N(x[k]),0)/n:0,flat=rows.reduce((s,x)=>s+N(x.flatHours),0);return {n,avgGross:avg('gross'),avgNet:avg('net'),flat}}
function histKpis(rows){const a=histAgg(rows);return `<div class="v97-hist-kpis"><div><span>Moves</span><b>${a.n}</b><small>cerradas</small></div><div><span>Avg Gross</span><b>${R(a.avgGross,1)} d</b><small>duración total</small></div><div><span>Avg Net</span><b>${R(a.avgNet,1)} d</b><small>ejecución neta</small></div><div><span>Flat Time</span><b>${R(a.flat,1)} h</b><small>neto histórico</small></div></div>`}
function histCompare(rows){const a=rows.slice(-10).reverse(),mx=Math.max(1,...a.flatMap(x=>[N(x.gross),N(x.net)]));return `<section class="v97-section"><div class="v97-section-head"><div><h2>Gross vs Net</h2><p>Últimas ${a.length} Moves</p></div></div><div class="v97-compare">${a.map(x=>`<button class="v97-compare-row" data-v97-hist="${ESC(x.id)}"><span class="rig">${ESC(x.rig)}</span><span class="bars"><i class="gross" style="width:${N(x.gross)/mx*100}%"></i><i class="net" style="width:${N(x.net)/mx*100}%"></i></span><span class="nums"><b>${R(x.gross,1)}d</b><small>${R(x.net,1)}d</small></span></button>`).join('')}</div><div class="v97-legend"><span><i class="gross"></i>Gross</span><span><i class="net"></i>Net</span></div></section>`}
function causeAgg(rows){const g={};for(const x of rows)for(const [k,v] of Object.entries(x.flatBreakdown||{}))if(N(v)>0)g[k]=(g[k]||0)+N(v);return Object.entries(g).sort((a,b)=>b[1]-a[1])}
function histCauses(rows){const a=causeAgg(rows),mx=Math.max(1,...a.map(x=>x[1]));return `<section class="v97-section"><div class="v97-section-head"><div><h2>Drivers de Flat Time</h2><p>Horas registradas por causa · pueden existir eventos superpuestos</p></div></div><div class="v97-pareto">${a.slice(0,7).map(([k,v],i)=>`<div class="v97-pareto-row"><span class="n">${i+1}</span><span class="name">${ESC(k)}</span><i><b style="width:${v/mx*100}%"></b></i><strong>${R(v,1)} h</strong></div>`).join('')||'<div class="v97-empty">Sin desglose.</div>'}</div></section>`}
function historyList(rows){const a=rows.slice().reverse().slice(0,8);return `<section class="v97-section"><div class="v97-section-head"><div><h2>Moves históricas</h2><p>RigGO + Legacy LATAM</p></div><span class="v97-count">${rows.length}</span></div><div class="v97-history-list">${a.map(x=>`<button data-v97-hist="${ESC(x.id)}" class="v97-history-card"><div><strong>${ESC(x.rig)}</strong><span>${ESC(x.operator||'')} · ${ESC(x.company||'')}</span></div><div><b>${R(x.gross,1)} d</b><small>Gross</small></div><div><b>${R(x.net,1)} d</b><small>Net</small></div><div><b>${R(x.flatHours,1)} h</b><small>Flat</small></div><i>›</i></button>`).join('')}</div></section>`}
function historyView(rows){return `${histKpis(rows)}${histCompare(rows)}${histCauses(rows)}${historyList(rows)}`}

function productivePct(x){return N(x.gross)>0?P(N(x.net)/N(x.gross)*100):0}
function groupRows(rows,key){const g={};for(const x of rows){const name=x[key]||'No definido',a=g[name]||(g[name]={name,n:0,gross:0,net:0,flat:0});a.n++;a.gross+=N(x.gross);a.net+=N(x.net);a.flat+=N(x.flatHours)}return Object.values(g).map(a=>({...a,avgGross:a.n?a.gross/a.n:0,avgNet:a.n?a.net/a.n:0,productive:a.gross?a.net/a.gross*100:0})).sort((a,b)=>b.productive-a.productive)}
function rankPanel(title,subtitle,rows,kind='move'){return `<section class="v97-section"><div class="v97-section-head"><div><h2>${ESC(title)}</h2><p>${ESC(subtitle)}</p></div></div><div class="v97-rank-list">${rows.length?rows.map((x,i)=>kind==='move'?`<button class="v97-rank-row" data-v97-hist="${ESC(x.id)}"><span class="n">${i+1}</span><span class="main"><b>${ESC(x.rig)} · ${ESC(x.operator||'')}</b><small>${ESC(x.company||'')} · Gross ${R(x.gross,1)}d · Net ${R(x.net,1)}d</small></span><strong>${productivePct(x).toFixed(0)}%</strong></button>`:`<div class="v97-rank-row"><span class="n">${i+1}</span><span class="main"><b>${ESC(x.name)}</b><small>${x.n} Move${x.n===1?'':'s'} · Avg Gross ${R(x.avgGross,1)}d · Flat ${R(x.flat,1)}h</small></span><strong>${R(x.productive,0)}%</strong></div>`).join(''):'<div class="v97-empty">Sin datos.</div>'}</div></section>`}
function opportunityPanel(rows){const a=rows.slice().sort((x,y)=>N(y.flatHours)-N(x.flatHours)).slice(0,6);return `<section class="v97-section"><div class="v97-section-head"><div><h2>Mayor impacto Flat Time</h2><p>Horas netas de pérdida</p></div></div><div class="v97-rank-list">${a.map((x,i)=>`<button class="v97-rank-row loss" data-v97-hist="${ESC(x.id)}"><span class="n">${i+1}</span><span class="main"><b>${ESC(x.rig)} · ${ESC(x.operator||'')}</b><small>${ESC(x.company||'')} · ${R(x.gross,1)} d Gross</small></span><strong>${R(x.flatHours,1)}h</strong></button>`).join('')}</div></section>`}
function topView97(rows){const best=rows.filter(x=>N(x.gross)>0).slice().sort((a,b)=>productivePct(b)-productivePct(a)).slice(0,6);return `${rankPanel('Best Execution','Mayor Productive Time %',best,'move')}${opportunityPanel(rows)}${rankPanel('Performance por Rig','Productive Time % · con número de Moves',groupRows(rows,'rig'),'group')}${rankPanel('Performance por Operador','Lectura descriptiva',groupRows(rows,'operator'),'group')}${rankPanel('Performance por Move Company','Lectura descriptiva · no evaluación contractual',groupRows(rows,'company'),'group')}`}
function historyById(id){return historyRows97().find(x=>String(x.id)===String(id))}
function openHistoryDetail(id){const x=historyById(id);if(!x)return;const causes=Object.entries(x.flatBreakdown||{}).sort((a,b)=>b[1]-a[1]),mx=Math.max(1,...causes.map(a=>N(a[1])));sheetRoot.innerHTML=`<div class="sheet-backdrop"><div class="sheet wide"><div class="sheet-handle"></div><div class="v97-detail-head"><div><div class="v97-rigline"><strong>${ESC(x.rig)}</strong><span class="v97-badge ${x.source==='RigGO'?'riggo':'legacy'}">${ESC(x.source)}</span></div><span>${ESC(x.operator||'')} · ${ESC(x.company||'')}</span></div></div><div class="v97-detail-summary history"><div><span>Gross</span><b>${R(x.gross,1)} d</b></div><div><span>Net</span><b>${R(x.net,1)} d</b></div><div><span>Flat Time</span><b>${R(x.flatHours,1)} h</b></div><div><span>Distancia</span><b>${R(x.distance,1)} km</b></div></div><div class="v97-detail-block"><div class="v97-section-head"><div><h3>Flat Time por causa</h3><p>${x.source==='Legacy'?'Fuente histórica disponible':'Eventos registrados en RigGO'}</p></div></div><div class="v97-pareto">${causes.length?causes.map(([k,v],i)=>`<div class="v97-pareto-row"><span class="n">${i+1}</span><span class="name">${ESC(k)}</span><i><b style="width:${Math.min(100,N(v)/mx*100)}%"></b></i><strong>${R(v,1)} h</strong></div>`).join(''):'<div class="v97-empty compact">Sin desglose.</div>'}</div></div>${x.comments?`<div class="v97-detail-block"><div class="v97-section-head"><div><h3>Comentarios / Lessons Learned</h3></div></div><p class="v97-comments">${ESC(x.comments)}</p></div>`:''}<div class="v97-source-note">${x.source==='Legacy'?'Legacy conserva únicamente la información disponible en el Monthly Rig Move Tracker. No se infiere RD / Transporte / RU ni baseline donde la fuente no lo contiene.':'Move cerrada nativamente en RigGO.'}</div><div class="sheet-footer"><button id="v97CloseHist" class="btn primary">Cerrar</button></div></div></div>`;E('v97CloseHist').onclick=closeSheet}

renderOverall=function(){state.overallTab=['live','history','top'].includes(state.overallTab)?state.overallTab:'live';const tab=state.overallTab,live=nativeLive(),hist=historyRows97(),body=tab==='live'?liveView(live):tab==='history'?historyView(hist):topView97(hist);return `<div class="v97-perf"><div class="v97-perf-head"><div><div class="eyebrow">RIGGO · MANAGEMENT PERFORMANCE</div><h1>Performance</h1></div><div class="v97-tabs"><button data-v97-tab="live" class="${tab==='live'?'active':''}">En curso</button><button data-v97-tab="history" class="${tab==='history'?'active':''}">Histórico</button><button data-v97-tab="top" class="${tab==='top'?'active':''}">Top</button></div></div>${body}</div>`}
wireOverall=function(){document.querySelectorAll('[data-v97-tab]').forEach(b=>b.onclick=()=>{state.overallTab=b.dataset.v97Tab;save();render();try{window.scrollTo(0,0)}catch(_){}});document.querySelectorAll('[data-v97-live]').forEach(b=>b.onclick=()=>openLiveDetail97(b.dataset.v97Live));document.querySelectorAll('[data-v97-hist]').forEach(b=>b.onclick=()=>openHistoryDetail(b.dataset.v97Hist))}

window.RigGOV97={release:RELEASE,build:BUILD,historyRows:historyRows97,live:nativeLive,legacy:LEGACY_ROWS,productivePct,groupRows};

function stampV103(){const box=document.querySelector('.v5-admin-build');if(box){const b=box.querySelector('b');if(b)b.textContent='RigGO '+RELEASE;const spans=box.querySelectorAll('span');if(spans.length)spans[spans.length-1].textContent=BUILD}}



if(typeof render==='function'){const BASE_RENDER_103=render;render=function(){const out=BASE_RENDER_103.apply(this,arguments);requestAnimationFrame(stampV103);return out}}
setTimeout(stampV103,80);
setTimeout(()=>{try{if(state?.auth?.logged&&(state.screen==='overall'||state.screen==='home'))render()}catch(_){}},180);
})();

/* ===== SOURCE riggo-v104.js (consolidated) ===== */
/* RigGO 10.4 · Management Performance + Atomic Admin · patch over validated RigGO 10.3 */
(function(){
'use strict';
const RELEASE='10.4.0-management-c1',BUILD='2026-08-16-1944-C1';
const E=id=>document.getElementById(id),N=v=>Number(v)||0,R=(v,d=1)=>{const p=10**d;return Math.round((Number(v)||0)*p)/p},P=v=>Math.max(0,Math.min(100,N(v)));
const ESC=v=>typeof enc==='function'?enc(v??''):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const PREV_WIRE=wireOverall;
function active(){try{return window.RigGOV96?.activeData?.()||[]}catch(e){console.warn('RigGO 10.4 active source',e);return[]}}
function history(){try{return window.RigGOV97?.historyRows?.()||[]}catch(e){console.warn('RigGO 10.4 history source',e);return[]}}
function curve(m,k){return Array.isArray(m?.plan?.curves?.[k])?m.plan.curves[k].map(N):[]}
function dayAtProgress(c,pct){pct=P(pct);if(!c.length)return 0;if(pct<=0)return 0;let prev=0;for(let i=0;i<c.length;i++){const cur=P(c[i]);if(pct<=cur){if(cur<=prev+.0001)return i+1;return i+(pct-prev)/(cur-prev)}prev=cur}return c.length}
function aggregateCurve(m){const keys=['rd','rm','ru'],mx=Math.max(...keys.map(k=>curve(m,k).length),0);return Array.from({length:mx},(_,i)=>keys.reduce((s,k)=>s+N(curve(m,k)[i]),0)/keys.length)}
function deltaState(d){return d<-.25?{key:'late',label:'Atrasada'}:d>.25?{key:'ahead',label:'Adelantada'}:{key:'ontime',label:'En tiempo'}}
function dayText(d,short=false){const a=Math.abs(R(d,1));if(Math.abs(d)<=.25)return short?'En tiempo':'En tiempo';return d<0?`${a} d atrás`:`${a} d adelante`}
function plannedLoadsDue(x){const day=Math.max(1,N(x.p?.index)||Math.ceil(N(x.elapsed))||1);return (x.m?.exec?.loads||[]).filter(l=>N(l.plannedDay)<=day).length}
function actualMovedLoads(x){return N(x.loads?.moved)}
function phaseDelta(x,k){const c=curve(x.m,k),actual=N(x.actual?.[k]),plan=N(x.plan?.[k]);if(!c.length||(actual<=0&&plan<=0))return null;return dayAtProgress(c,actual)-N(x.elapsed)}
function enrich(x){const ac=aggregateCurve(x.m),avg=(N(x.actual?.rd)+N(x.actual?.rm)+N(x.actual?.ru))/3,equiv=ac.length?dayAtProgress(ac,avg):N(x.elapsed),schedule=equiv-N(x.elapsed),st=deltaState(schedule),due=plannedLoadsDue(x),moved=actualMovedLoads(x),loadDelta=moved-due;return{...x,schedule,state104:st,equiv,loadDue:due,loadMoved:moved,loadDelta,phaseDays:{rd:phaseDelta(x,'rd'),rm:phaseDelta(x,'rm'),ru:phaseDelta(x,'ru')}}}
function liveRows(){return active().map(enrich)}
function scheduleHeadline(d){if(Math.abs(d)<=.25)return'Portfolio en tiempo';return d<0?`Portfolio · ${Math.abs(R(d,1))} días atrasado`:`Portfolio · ${Math.abs(R(d,1))} días adelantado`}
function ring(label,pct,value,sub,cls='good'){return `<div class="v104-ring-card"><div class="v104-ring ${cls}" style="--p:${P(pct)}"><div><b>${ESC(value)}</b><small>${ESC(label)}</small></div></div><p>${ESC(sub)}</p></div>`}
function portfolio(items){const c={late:0,ontime:0,ahead:0};items.forEach(x=>c[x.state104.key]++);const avg=items.length?items.reduce((s,x)=>s+x.schedule,0)/items.length:0,flat=items.reduce((s,x)=>s+N(x.flat),0),due=items.reduce((s,x)=>s+x.loadDue,0),moved=items.reduce((s,x)=>s+x.loadMoved,0),elapsedH=items.reduce((s,x)=>s+N(x.elapsed)*24,0),productive=elapsedH?P(100-flat/elapsedH*100):100,health=items.length?(c.ontime+c.ahead)/items.length*100:0,loadPct=due?P(moved/due*100):100;return `<section class="v104-hero"><div class="v104-hero-top"><div><span>PORTAFOLIO ACTIVO</span><h2>${items.length} Move${items.length===1?'':'s'} en curso</h2><p><i class="ahead"></i>${c.ahead} adelantada${c.ahead===1?'':'s'} <i class="ontime"></i>${c.ontime} en tiempo <i class="late"></i>${c.late} atrasada${c.late===1?'':'s'}</p></div><strong class="${deltaState(avg).key}">${scheduleHeadline(avg)}</strong></div><div class="v104-kpis"><div><span>Schedule</span><b>${dayText(avg,true)}</b><small>promedio del portfolio</small></div><div><span>Cargas vs Plan</span><b class="${moved-due<0?'late':moved-due>0?'ahead':''}">${moved-due>0?'+':''}${moved-due}</b><small>${moved} movidas · ${due} plan a hoy</small></div><div><span>Flat Time</span><b>${R(flat,1)} h</b><small>acumulado activo</small></div><div><span>On Plan</span><b>${c.ontime+c.ahead}/${items.length}</b><small>en tiempo o adelante</small></div></div><div class="v104-rings">${ring('Schedule Health',health,Math.round(health)+'%',`${c.ontime+c.ahead} de ${items.length} Moves`,health>=70?'good':health>=40?'warn':'bad')}${ring('Cargas a Plan',loadPct,`${moved}/${due||0}`,'movidas vs requeridas',loadPct>=95?'good':loadPct>=80?'warn':'bad')}${ring('Productive Time',productive,Math.round(productive)+'%',`${R(flat,1)} h Flat`,productive>=90?'good':productive>=75?'warn':'bad')}</div></section>`}
function phaseLine(x,k,label){const actual=P(x.actual?.[k]),plan=P(x.plan?.[k]),d=x.phaseDays[k],st=d==null?{key:'neutral'}:deltaState(d);let metric=d==null?'En espera':dayText(d);if(k==='rm'){const ld=x.loadDelta;metric=ld===0?'Cargas en plan':ld<0?`${Math.abs(ld)} cargas atrás`:`${ld} cargas adelante`}return `<div class="v104-phase"><div class="v104-phase-title"><b>${label}</b><strong class="${st.key}">${ESC(metric)}</strong></div><div class="v104-phase-track"><span class="${st.key}" style="width:${actual}%"></span><i style="left:${plan}%"></i></div><div class="v104-phase-meta"><span>Actual <b>${Math.round(actual)}%</b></span><span>Plan ${Math.round(plan)}%</span>${k==='rm'?`<span>${x.loadMoved}/${x.loadDue} cargas</span>`:''}</div></div>`}
function moveCard(x){const route=[x.m?.meta?.origin,x.m?.meta?.destination].filter(Boolean).join(' → '),test=x.test?'<span class="v104-test">PRUEBA</span>':'';return `<button class="v104-move" data-v104-live="${ESC(x.m?.id)}"><div class="v104-move-head"><div><div class="v104-rig"><strong>${ESC(x.m?.meta?.rig||'Rig')}</strong>${test}</div><span>${ESC(x.m?.meta?.operator||'')}${route?' · '+ESC(route):''}</span></div><div class="v104-schedule ${x.state104.key}"><small>${x.state104.label}</small><b>${dayText(x.schedule,true)}</b></div></div><div class="v104-phases">${phaseLine(x,'rd','Rig Down')}${phaseLine(x,'rm','Transporte')}${phaseLine(x,'ru','Rig Up')}</div><div class="v104-move-foot"><span>Día <b>${x.p?.index||'—'} / ${x.planned||'—'}</b></span><span>Flat <b>${R(x.flat,1)} h</b></span><span>Pendientes <b>${x.pending?.length||0}</b></span><span>Tiempo <b>${Math.round(N(x.timePct))}%</b></span></div></button>`}
function allFlatEvents(m){const out=[];try{for(const p of (movePeriods(m)||[])){const c=m.exec?.closures?.[p.id];if(!c)continue;for(const e of c.flatEvents||[]){const t=typeof FLAT_TYPES!=='undefined'?FLAT_TYPES.find(q=>q.id===e.type):null;out.push({...e,day:p.index,label:t?.label||e.type||'Flat Time',hours:typeof eventHours==='function'?eventHours(e):N(e.hours)})}}}catch(_){ }return out}
function flatPortfolio(items){const g={};for(const x of items)for(const e of allFlatEvents(x.m))g[e.label]=(g[e.label]||0)+N(e.hours);const rows=Object.entries(g).sort((a,b)=>b[1]-a[1]),total=rows.reduce((s,x)=>s+x[1],0),mx=Math.max(1,...rows.map(x=>x[1]));return `<section class="v104-panel"><div class="v104-panel-head"><div><h2>Flat Time · Portfolio</h2><p>Principales drivers en Moves activas</p></div><b>${R(total,1)} h</b></div>${rows.length?`<div class="v104-flat-bars">${rows.slice(0,5).map(([k,v])=>`<div><span>${ESC(k)}</span><i><b style="width:${v/mx*100}%"></b></i><strong>${R(v,1)} h</strong></div>`).join('')}</div>`:'<div class="v104-empty">Sin Flat Time registrado.</div>'}</section>`}
function liveView(items){return `${portfolio(items)}<section class="v104-panel"><div class="v104-panel-head"><div><h2>Moves activas</h2><p>Schedule, cargas y avance por fase</p></div></div><div class="v104-move-list">${items.length?items.map(moveCard).join(''):'<div class="v104-empty">No hay Moves en ejecución.</div>'}</div></section>${flatPortfolio(items)}`}
function openFlat(id){const x=liveRows().find(q=>String(q.m?.id)===String(id));if(!x)return;const ev=allFlatEvents(x.m),sum=ev.reduce((s,e)=>s+N(e.hours),0);sheetRoot.innerHTML=`<div class="sheet-backdrop"><div class="sheet wide"><div class="sheet-handle"></div><div class="v104-detail-title"><div><span>FLAT TIME</span><h2>${ESC(x.m?.meta?.rig||'Rig')} · ${R(sum,1)} h</h2></div></div><div class="v104-flat-list">${ev.length?ev.map(e=>`<div><b>${ESC(e.label)} · ${R(e.hours,2)} h</b><span>Día ${e.day||'—'}${e.responsibility?' · '+ESC(e.responsibility):''}</span>${typeof eventDetailSummary==='function'&&eventDetailSummary(e)?`<p>${ESC(eventDetailSummary(e))}</p>`:''}</div>`).join(''):'<div class="v104-empty">Sin eventos.</div>'}</div><div class="sheet-footer"><button id="v104Back" class="btn">← Volver</button><button id="v104CloseFlat" class="btn primary">Cerrar</button></div></div></div>`;E('v104Back').onclick=()=>openLive(id);E('v104CloseFlat').onclick=closeSheet}
function openLive(id){const x=liveRows().find(q=>String(q.m?.id)===String(id));if(!x)return;const route=[x.m?.meta?.origin,x.m?.meta?.destination].filter(Boolean).join(' → '),forecast=N(x.progress)>=10?Math.max(0,N(x.planned)-x.schedule):null,next24=x.p?String(x.m.exec?.closures?.[x.p.id]?.next24||'').split(/\r?\n/).map(s=>s.replace(/^\s*[•*-]\s*/,'').trim()).filter(Boolean):[];sheetRoot.innerHTML=`<div class="sheet-backdrop"><div class="sheet wide"><div class="sheet-handle"></div><div class="v104-detail-head"><div><div class="v104-rig"><strong>${ESC(x.m?.meta?.rig||'Rig')}</strong>${x.test?'<span class="v104-test">PRUEBA</span>':''}</div><span>${ESC(x.m?.meta?.operator||'')}${route?' · '+ESC(route):''}</span></div><div class="v104-schedule ${x.state104.key}"><small>${x.state104.label}</small><b>${dayText(x.schedule,true)}</b></div></div><div class="v104-detail-kpis"><div><span>Schedule</span><b>${dayText(x.schedule,true)}</b></div><div><span>Plan</span><b>${R(x.planned,1)} d</b></div><div><span>Tendencia cierre</span><b>${forecast==null?'—':'Día '+R(forecast,1)}</b></div><div><span>Flat Time</span><b>${R(x.flat,1)} h</b></div><div><span>Cargas</span><b class="${x.loadDelta<0?'late':x.loadDelta>0?'ahead':''}">${x.loadDelta>0?'+':''}${x.loadDelta}</b><small>${x.loadMoved}/${x.loadDue} vs plan hoy</small></div><div><span>Pendientes</span><b>${x.pending?.length||0}</b></div></div><div class="v104-detail-phases">${phaseLine(x,'rd','Rig Down')}${phaseLine(x,'rm','Transporte')}${phaseLine(x,'ru','Rig Up')}</div><button id="v104Flat" class="v104-flat-call"><span><small>FLAT TIME ACUMULADO</small><b>${R(x.flat,1)} h</b></span><strong>Ver detalle ›</strong></button><div class="v104-detail-block"><h3>Pendientes del día</h3><div class="v104-pending">${x.pending?.length?x.pending.slice(0,12).map(v=>`<div>${ESC(v)}</div>`).join(''):'<div>Sin pendientes.</div>'}</div></div><div class="v104-detail-block"><h3>Próximas 24 Hrs</h3><div class="v104-pending">${next24.length?next24.slice(0,8).map(v=>`<div>${ESC(v)}</div>`).join(''):'<div>Sin actividades registradas.</div>'}</div></div><div class="sheet-footer"><button id="v104Close" class="btn">Cerrar</button>${typeof canAccessMove==='function'&&canAccessMove(currentUser(),x.m)?'<button id="v104Open" class="btn primary">Abrir Move</button>':''}</div></div></div>`;E('v104Close').onclick=closeSheet;E('v104Flat').onclick=()=>openFlat(id);if(E('v104Open'))E('v104Open').onclick=()=>{closeSheet();state.selectedMoveId=x.m.id;state.screen='execute';state.execMode='days';save();render();window.scrollTo?.(0,0)}}
function prod(x){return N(x.gross)>0?P(N(x.net)/N(x.gross)*100):0}
function histAgg(rows){const n=rows.length,totalGross=rows.reduce((s,x)=>s+N(x.gross),0),totalNet=rows.reduce((s,x)=>s+N(x.net),0),flat=rows.reduce((s,x)=>s+N(x.flatHours),0);return{n,avgGross:n?totalGross/n:0,avgNet:n?totalNet/n:0,totalGross,totalNet,flat,productive:totalGross?totalNet/totalGross*100:0}}
function trendSvg(rows){const a=rows.slice().sort((x,y)=>new Date(x.acceptance||x.release||0)-new Date(y.acceptance||y.release||0));if(!a.length)return'<div class="v104-empty">Sin datos.</div>';const W=760,H=260,p={l:34,r:18,t:20,b:34},mx=Math.max(1,...a.flatMap(x=>[N(x.gross),N(x.net)])),X=i=>p.l+(a.length===1?(W-p.l-p.r)/2:i*(W-p.l-p.r)/(a.length-1)),Y=v=>p.t+(1-v/mx)*(H-p.t-p.b),pts=k=>a.map((x,i)=>`${X(i)},${Y(N(x[k]))}`).join(' ');let s=`<svg viewBox="0 0 ${W} ${H}" class="v104-trend-svg">`;for(let q=0;q<=4;q++){const v=mx*q/4,y=Y(v);s+=`<line x1="${p.l}" y1="${y}" x2="${W-p.r}" y2="${y}"/><text x="${p.l-6}" y="${y+4}" text-anchor="end">${R(v,0)}</text>`}s+=`<polyline class="gross" points="${pts('gross')}"/><polyline class="net" points="${pts('net')}"/>`;a.forEach((x,i)=>{if(i%Math.max(1,Math.ceil(a.length/6))===0||i===a.length-1)s+=`<text x="${X(i)}" y="${H-8}" text-anchor="middle">${ESC(x.rig)}</text>`});return s+'</svg>'}
function causeData(rows){const g={};for(const x of rows)for(const [k,v] of Object.entries(x.flatBreakdown||{}))if(N(v)>0)g[k]=(g[k]||0)+N(v);return Object.entries(g).sort((a,b)=>b[1]-a[1])}
function donut(rows){const data=causeData(rows),total=data.reduce((s,x)=>s+x[1],0),cols=['#35cf8e','#2f7df6','#f2b34f','#ef6671','#a98bff','#65d5e9'],top=data.slice(0,6);let cur=0,stops=[];top.forEach((x,i)=>{const a=total?cur/total*360:0;cur+=x[1];const b=total?cur/total*360:0;stops.push(`${cols[i]} ${a}deg ${b}deg`)});return `<div class="v104-donut-wrap"><div class="v104-donut" style="background:conic-gradient(${stops.join(',')||'#1b2a37 0 360deg'})"><div><b>${R(total,0)}</b><small>h drivers</small></div></div><div class="v104-donut-legend">${top.map((x,i)=>`<span><i style="background:${cols[i]}"></i><b>${ESC(x[0])}</b><small>${R(x[1],0)} h</small></span>`).join('')}</div></div>`}
function historyView(rows){const a=histAgg(rows);return `<section class="v104-hist-hero"><div><span>HISTÓRICO</span><h2>${a.n} Moves cerradas</h2></div><div class="v104-hist-kpis"><div><span>Avg Gross</span><b>${R(a.avgGross,1)} d</b></div><div><span>Avg Net</span><b>${R(a.avgNet,1)} d</b></div><div><span>Flat Time</span><b>${R(a.flat,1)} h</b></div></div></section><div class="v104-hist-grid"><section class="v104-panel v104-productivity"><div class="v104-panel-head"><div><h2>Productive Time</h2><p>Net / Gross histórico</p></div></div>${ring('Productive Time',a.productive,Math.round(a.productive)+'%',`${R(a.totalNet,1)} d Net / ${R(a.totalGross,1)} d Gross`,a.productive>=80?'good':a.productive>=65?'warn':'bad')}</section><section class="v104-panel"><div class="v104-panel-head"><div><h2>Flat Time Mix</h2><p>Distribución por driver · eventos pueden superponerse</p></div></div>${donut(rows)}</section></div><section class="v104-panel"><div class="v104-panel-head"><div><h2>Gross vs Net</h2><p>Tendencia histórica por Move</p></div><div class="v104-trend-legend"><span class="gross">Gross</span><span class="net">Net</span></div></div>${trendSvg(rows)}</section><section class="v104-panel"><div class="v104-panel-head"><div><h2>Moves históricas</h2><p>RigGO + Legacy LATAM</p></div><b>${rows.length}</b></div><div class="v104-history-list">${rows.slice().reverse().map(x=>`<button data-v97-hist="${ESC(x.id)}"><strong>${ESC(x.rig)}</strong><span>${ESC(x.operator||'')} · ${ESC(x.company||'')}</span><b>${R(x.gross,1)} d</b><small>${R(x.flatHours,1)} h Flat</small><i>›</i></button>`).join('')}</div></section>`}
function group(rows,key){const g={};for(const x of rows){const n=x[key]||'No definido',a=g[n]||(g[n]={name:n,n:0,gross:0,net:0,flat:0});a.n++;a.gross+=N(x.gross);a.net+=N(x.net);a.flat+=N(x.flatHours)}return Object.values(g).map(x=>({...x,productive:x.gross?x.net/x.gross*100:0,avgGross:x.n?x.gross/x.n:0})).sort((a,b)=>b.productive-a.productive)}
function podiumMoves(rows){const a=rows.filter(x=>N(x.gross)>0).slice().sort((x,y)=>prod(y)-prod(x)).slice(0,3),order=a.length>=3?[a[1],a[0],a[2]]:a;return `<section class="v104-top-hero"><span>TOP MOVES</span><h2>Best Execution</h2><p>Mayor Productive Time</p><div class="v104-podium">${order.map((x,i)=>{const rank=a.indexOf(x)+1;return `<button class="rank${rank}" data-v97-hist="${ESC(x.id)}"><em>${rank===1?'🥇':rank===2?'🥈':'🥉'}</em><strong>${ESC(x.rig)}</strong><span>${ESC(x.operator||'')}</span><b>${Math.round(prod(x))}%</b><small>${R(x.gross,1)} d Gross</small></button>`}).join('')}</div></section>`}
function groupTop(title,rows){const eligible=rows.filter(x=>x.n>=2).slice(0,5),single=rows.filter(x=>x.n<2).slice(0,3);return `<section class="v104-panel"><div class="v104-panel-head"><div><h2>${ESC(title)}</h2><p>Ranking formal · mínimo 2 Moves</p></div></div><div class="v104-leaderboard">${eligible.map((x,i)=>`<div><span class="pos">#${i+1}</span><span class="name"><b>${ESC(x.name)}</b><small>${x.n} Moves · Avg Gross ${R(x.avgGross,1)} d</small></span><strong>${Math.round(x.productive)}%</strong></div>`).join('')||'<div class="v104-empty">Sin muestra suficiente.</div>'}</div>${single.length?`<div class="v104-sample-note">Muestra insuficiente: ${single.map(x=>`${ESC(x.name)} (${x.n})`).join(' · ')}</div>`:''}</section>`}
function opportunities(rows){const a=rows.slice().sort((x,y)=>N(y.flatHours)-N(x.flatHours)).slice(0,5);return `<section class="v104-panel"><div class="v104-panel-head"><div><h2>Biggest Opportunities</h2><p>Mayor impacto de Flat Time</p></div></div><div class="v104-opps">${a.map((x,i)=>`<button data-v97-hist="${ESC(x.id)}"><span>#${i+1}</span><div><b>${ESC(x.rig)} · ${ESC(x.operator||'')}</b><small>${ESC(x.company||'')}</small></div><strong>${R(x.flatHours,0)} h</strong></button>`).join('')}</div></section>`}
function topView(rows){return `${podiumMoves(rows)}<div class="v104-top-grid">${groupTop('Top Rigs',group(rows,'rig'))}${groupTop('Top Move Companies',group(rows,'company'))}</div>${opportunities(rows)}`}
renderOverall=function(){state.overallTab=['live','history','top'].includes(state.overallTab)?state.overallTab:'live';const tab=state.overallTab,body=tab==='live'?liveView(liveRows()):tab==='history'?historyView(history()):topView(history());return `<div class="v104-perf"><div class="v104-head"><div><div class="eyebrow">RIGGO · MANAGEMENT PERFORMANCE</div><h1>Performance</h1></div><div class="v104-tabs"><button data-v104-tab="live" class="${tab==='live'?'active':''}">En curso</button><button data-v104-tab="history" class="${tab==='history'?'active':''}">Histórico</button><button data-v104-tab="top" class="${tab==='top'?'active':''}">Top</button></div></div>${body}</div>`}
wireOverall=function(){try{PREV_WIRE()}catch(_){ }document.querySelectorAll('[data-v104-tab]').forEach(b=>b.onclick=()=>{state.overallTab=b.dataset.v104Tab;save();render();window.scrollTo?.(0,0)});document.querySelectorAll('[data-v104-live]').forEach(b=>b.onclick=()=>openLive(b.dataset.v104Live))}
window.RigGOV104={release:RELEASE,build:BUILD,live:liveRows,history,scheduleFor:enrich,dayAtProgress,group};
function stamp(){const box=document.querySelector('.v5-admin-build');if(box){const b=box.querySelector('b');if(b)b.textContent='RigGO '+RELEASE;const sp=box.querySelectorAll('span');if(sp.length)sp[sp.length-1].textContent=BUILD}}

if(typeof render==='function'){const BASE=render;render=function(){const out=BASE.apply(this,arguments);requestAnimationFrame(stamp);return out}}
})();

/* ===== SOURCE riggo-v105.js (consolidated) ===== */
/* RigGO 10.5 · User Authority C1 · Performance 10.4 intentionally frozen */
(()=>{
'use strict';
const RELEASE='10.5.0-user-authority-c1',BUILD='2026-08-16-2010-C1';
function stamp(){
  
  
  
  
  
  const box=document.querySelector('.v5-admin-build');if(box){const b=box.querySelector('b');if(b)b.textContent='RigGO '+RELEASE;const sp=box.querySelectorAll('span');if(sp.length)sp[sp.length-1].textContent=BUILD}
}

if(typeof render==='function'){const BASE=render;render=function(){const out=BASE.apply(this,arguments);requestAnimationFrame(stamp);return out}}
setTimeout(stamp,90);setTimeout(stamp,260);
})();

/* ===== SOURCE riggo-v107.js (consolidated) ===== */
/* RigGO 10.7 · Refinement C1 · built on validated 10.6 */
(()=>{
'use strict';
const RELEASE='10.7.0-refinement-c1',BUILD='2026-08-17-1314-C1';
const E=id=>document.getElementById(id),N=v=>Number(v)||0,P=v=>Math.max(0,Math.min(100,N(v))),R=(v,d=1)=>{const p=10**d;return Math.round(N(v)*p)/p};
const ESC=v=>typeof enc==='function'?enc(v??''):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const db=()=>window.RigGOSupabase||(typeof SB!=='undefined'?SB:null);
const BASE_HOME=renderHome,BASE_OVERALL=renderOverall,BASE_WIRE_OVERALL=wireOverall,BASE_ADMIN=renderAdmin,BASE_WIRE_ADMIN=wireAdmin,BASE_PLAN=renderPlan,BASE_WIRE_PLAN=wirePlan,BASE_REVIEW=renderReview,BASE_WIRE_REVIEW=wireReview;
const V106={groups:[],settings:{whatsapp_number:'',whatsapp_message:'Hola, necesito soporte con RigGO.'},loaded:false,loading:false,error:''};
window.RigGOV106=V106;window.RigGOV107=V106;

/* ---------- Shared analytics ---------- */
function active(){try{return window.RigGOV96?.activeData?.()||[]}catch(_){return[]}}
function history(){try{return window.RigGOV97?.historyRows?.()||[]}catch(_){return[]}}
function curve(m,k){return Array.isArray(m?.plan?.curves?.[k])?m.plan.curves[k].map(N):[]}
function dayAtProgress(c,pct){pct=P(pct);if(!c.length||pct<=0)return 0;let prev=0;for(let i=0;i<c.length;i++){const cur=P(c[i]);if(pct<=cur){if(cur<=prev+.0001)return i+1;return i+(pct-prev)/(cur-prev)}prev=cur}return c.length}
function aggregateCurve(m){const ks=['rd','rm','ru'],mx=Math.max(...ks.map(k=>curve(m,k).length),0);return Array.from({length:mx},(_,i)=>ks.reduce((s,k)=>s+N(curve(m,k)[i]),0)/ks.length)}
function deltaState(d){return d<-.25?{key:'late',label:'Atrasada'}:d>.25?{key:'ahead',label:'Adelantada'}:{key:'ontime',label:'En tiempo'}}
function dayText(d){if(Math.abs(d)<=.25)return'En tiempo';const a=Math.abs(R(d,1));return d<0?`${a} d atrás`:`${a} d adelante`}
function totalLoads(x){return Math.max(0,N(x.loads?.total)||N((x.m?.exec?.loads||[]).length))}
function plannedLoadsDue(x){const total=totalLoads(x),planPct=P(x.plan?.rm);if(total&&planPct>0)return Math.min(total,Math.max(0,Math.round(total*planPct/100)));const day=Math.max(1,N(x.p?.index)||Math.ceil(N(x.elapsed))||1);return (x.m?.exec?.loads||[]).filter(l=>N(l.plannedDay)<=day).length}
function phaseDelta(x,k){const c=curve(x.m,k),a=N(x.actual?.[k]),pl=N(x.plan?.[k]);if(!c.length||(a<=0&&pl<=0))return null;return dayAtProgress(c,a)-N(x.elapsed)}
function enrich(x){const ac=aggregateCurve(x.m),avg=(N(x.actual?.rd)+N(x.actual?.rm)+N(x.actual?.ru))/3,equiv=ac.length?dayAtProgress(ac,avg):N(x.elapsed),schedule=equiv-N(x.elapsed),due=plannedLoadsDue(x),moved=N(x.loads?.moved);return{...x,schedule,state106:deltaState(schedule),loadDue:due,loadMoved:moved,loadDelta:moved-due,phaseDays:{rd:phaseDelta(x,'rd'),rm:phaseDelta(x,'rm'),ru:phaseDelta(x,'ru')}}}
function liveRows(){return active().map(enrich)}
function prod(x){return N(x.gross)>0?P(N(x.net)/N(x.gross)*100):0}
function histAgg(rows){const n=rows.length,g=rows.reduce((s,x)=>s+N(x.gross),0),net=rows.reduce((s,x)=>s+N(x.net),0),extension=rows.reduce((s,x)=>s+N(x.flatHours),0),drivers=causeData(rows).reduce((s,x)=>s+N(x[1]),0);return{n,totalGross:g,totalNet:net,avgGross:n?g/n:0,avgNet:n?net/n:0,extension,drivers,productive:g?net/g*100:0}}
function groupRigs(rows){const m=new Map();for(const x of rows){const k=String(x.rig||'No definido').trim()||'No definido',a=m.get(k)||{name:k,n:0,gross:0,net:0,flat:0,operators:new Set()};a.n++;a.gross+=N(x.gross);a.net+=N(x.net);a.flat+=N(x.flatHours);if(x.operator)a.operators.add(x.operator);m.set(k,a)}return [...m.values()].map(x=>({...x,productive:x.gross?x.net/x.gross*100:0,avgGross:x.n?x.gross/x.n:0,avgNet:x.n?x.net/x.n:0,avgFlat:x.n?x.flat/x.n:0,operator:[...x.operators].join(' · ')})).sort((a,b)=>b.productive-a.productive||a.avgGross-b.avgGross||a.name.localeCompare(b.name))}

/* ---------- Home ---------- */
function userFirstName(){const u=typeof currentUser==='function'?currentUser():null,email=String(u?.email||state?.auth?.email||'');let name=String(u?.name||'').trim();if(!name||/riggo admin/i.test(name)||name.includes('@'))name=email.split('@')[0].split(/[._-]/)[0]||'';else name=name.split(/\s+/)[0]||name;return name?name.charAt(0).toUpperCase()+name.slice(1).toLowerCase():''}
function greeting(){const h=new Date().getHours(),g=h<12?'Buenos días':h<18?'Buenas tardes':'Buenas noches',name=userFirstName();return name?`${g}, ${name}`:g}
function homeCounts(){const rows=liveRows(),c={late:0,ontime:0,ahead:0};rows.forEach(x=>c[x.state106.key]++);return{rows,c}}
function homeSummaryHtml(){const {rows,c}=homeCounts();if(!rows.length)return'<span class="neutral">Sin Moves en curso</span>';let h=`<span class="active">${rows.length} Move${rows.length===1?'':'s'} en curso</span>`;if(c.late)h+=`<span class="late"> · ${c.late} atrasada${c.late===1?'':'s'}</span>`;if(c.ontime)h+=`<span class="ontime"> · ${c.ontime} en tiempo</span>`;if(c.ahead)h+=`<span class="ahead"> · ${c.ahead} adelantada${c.ahead===1?'':'s'}</span>`;return h}
renderHome=function(){let h=BASE_HOME();const card=`<div class="v106-home-greeting"><div class="v106-greet">${ESC(greeting())}</div><div class="v106-home-summary">${homeSummaryHtml()}</div></div>`,kicker='<div class="v52-kicker"><span></span>RIGGO · OPERATIONS EXCELLENCE</div>';return String(h).replace(kicker,kicker+card)};

/* ---------- Performance ---------- */
function ring(label,pct,value,sub,cls='good'){return `<div class="v106-ring-card"><div class="v106-ring ${cls}" style="--p:${P(pct)}"><div><b>${ESC(value)}</b><small>${ESC(label)}</small></div></div><p>${ESC(sub)}</p></div>`}
function operationSummary(items){const c={late:0,ontime:0,ahead:0};items.forEach(x=>c[x.state106.key]++);const avg=items.length?items.reduce((s,x)=>s+x.schedule,0)/items.length:0,flat=items.reduce((s,x)=>s+N(x.flat),0),due=items.reduce((s,x)=>s+x.loadDue,0),moved=items.reduce((s,x)=>s+x.loadMoved,0),elapsedH=items.reduce((s,x)=>s+N(x.elapsed)*24,0),productive=elapsedH?P(100-flat/elapsedH*100):100,health=items.length?(c.ontime+c.ahead)/items.length*100:0,loadPct=due?P(moved/due*100):100,st=deltaState(avg);return `<section class="v106-summary"><div class="v106-summary-head"><div><span>OPERACIÓN EN CURSO</span><h2>${items.length} Move${items.length===1?'':'s'} activa${items.length===1?'':'s'}</h2><p>${c.ahead} adelantada${c.ahead===1?'':'s'} · ${c.ontime} en tiempo · ${c.late} atrasada${c.late===1?'':'s'}</p></div><strong class="${st.key}">${dayText(avg)}</strong></div><div class="v106-summary-kpis"><div><span>Schedule</span><b class="${st.key}">${dayText(avg)}</b><small>promedio de Moves activas</small></div><div><span>Cargas vs Plan</span><b class="${moved-due<0?'late':moved-due>0?'ahead':''}">${moved-due>0?'+':''}${moved-due}</b><small>${moved} movidas · ${due} requeridas</small></div><div><span>Flat Time</span><b>${R(flat,1)} h</b><small>acumulado</small></div><div><span>On Plan</span><b>${c.ontime+c.ahead}/${items.length}</b><small>en tiempo o adelante</small></div></div><div class="v106-rings">${ring('Moves alineadas',health,Math.round(health)+'%',`${c.ontime+c.ahead} de ${items.length}`,health>=70?'good':health>=40?'warn':'bad')}${ring('Cargas vs Plan',loadPct,`${moved}/${due||0}`,'movidas / requeridas',loadPct>=95?'good':loadPct>=80?'warn':'bad')}${ring('Productive Time',productive,Math.round(productive)+'%',`${R(flat,1)} h Flat`,productive>=90?'good':productive>=75?'warn':'bad')}</div></section>`}
function currentPhase(x){if(N(x.actual?.rd)<100)return 1;if(N(x.actual?.rm)<100)return 2;if(N(x.actual?.ru)<100)return 3;return 4}
function routeStrip(x,compact=false){const step=currentPhase(x),origin=x.m?.meta?.origin||'Origen',dest=x.m?.meta?.destination||'Destino';const labels=[origin,'Rig Down','Transporte','Rig Up',dest];return `<div class="v106-route ${compact?'compact':''}">${labels.map((l,i)=>`<div class="${i<step?'done':i===step?'current':''}"><i></i><span>${ESC(l)}</span></div>`).join('')}</div>`}
function phaseLine(x,k,label){const actual=P(x.actual?.[k]),plan=P(x.plan?.[k]),d=x.phaseDays[k];let metric=d==null?'En espera':dayText(d),key=d==null?'neutral':deltaState(d).key;if(k==='rm'){metric=x.loadDelta===0?'Cargas en plan':x.loadDelta<0?`${Math.abs(x.loadDelta)} cargas atrás`:`${x.loadDelta} cargas adelante`;key=x.loadDelta<0?'late':x.loadDelta>0?'ahead':'ontime'}return `<div class="v106-phase"><div><b>${label}</b><strong class="${key}">${ESC(metric)}</strong></div><div class="v106-phase-track"><span class="${key}" style="width:${actual}%"></span><i style="left:${plan}%"></i></div><small>Actual ${Math.round(actual)}% · Plan ${Math.round(plan)}%${k==='rm'?` · ${x.loadMoved}/${x.loadDue} cargas`:''}</small></div>`}
function moveCard(x){const route=[x.m?.meta?.origin,x.m?.meta?.destination].filter(Boolean).join(' → ');return `<button class="v106-move" data-v106-live="${ESC(x.m?.id)}"><div class="v106-move-head"><div><div class="v106-rig"><strong>${ESC(x.m?.meta?.rig||'Rig')}</strong>${x.test?'<span class="v106-test">PRUEBA</span>':''}</div><span>${ESC(x.m?.meta?.operator||'')}${route?' · '+ESC(route):''}</span></div><div class="v106-status ${x.state106.key}"><small>${x.state106.label}</small><b>${dayText(x.schedule)}</b></div></div>${routeStrip(x,true)}<div class="v106-phases">${phaseLine(x,'rd','Rig Down')}${phaseLine(x,'rm','Transporte')}${phaseLine(x,'ru','Rig Up')}</div><div class="v106-move-foot"><span>Día<b>${x.p?.index||'—'} / ${x.planned||'—'}</b></span><span>Flat<b>${R(x.flat,1)} h</b></span><span>Pendientes<b>${x.pending?.length||0}</b></span><span>Tiempo<b>${Math.round(N(x.timePct))}%</b></span></div></button>`}
function allFlatEvents(m){const out=[];try{for(const p of (movePeriods(m)||[])){const c=m.exec?.closures?.[p.id];if(!c)continue;for(const e of c.flatEvents||[]){const t=typeof FLAT_TYPES!=='undefined'?FLAT_TYPES.find(q=>q.id===e.type):null;out.push({...e,day:p.index,label:t?.label||e.type||'Flat Time',hours:typeof eventHours==='function'?eventHours(e):N(e.hours)})}}}catch(_){}return out}
function flatSection(items){const g={};for(const x of items)for(const e of allFlatEvents(x.m))g[e.label]=(g[e.label]||0)+N(e.hours);const rows=Object.entries(g).sort((a,b)=>b[1]-a[1]),eventTotal=rows.reduce((s,x)=>s+x[1],0),summaryTotal=items.reduce((s,x)=>s+N(x.flat),0),total=Math.max(eventTotal,summaryTotal),mx=Math.max(1,...rows.map(x=>x[1]));return `<section class="v106-panel"><div class="v106-panel-head"><div><h2>Flat Time</h2><p>Principales drivers en Moves activas</p></div><b>${R(total,1)} h</b></div>${rows.length?`<div class="v106-flat-bars">${rows.slice(0,5).map(([k,v])=>`<div><span>${ESC(k)}</span><i><b style="width:${v/mx*100}%"></b></i><strong>${R(v,1)} h</strong></div>`).join('')}</div>`:total>0?'<div class="v106-empty">Flat Time acumulado sin detalle por causa.</div>':'<div class="v106-empty">Sin Flat Time registrado.</div>'}</section>`}
function liveView(items){return `${operationSummary(items)}<section class="v106-panel"><div class="v106-panel-head"><div><h2>Moves activas</h2><p>Schedule, recorrido, cargas y avance por fase</p></div></div><div class="v106-move-list">${items.length?items.map(moveCard).join(''):'<div class="v106-empty">No hay Moves en ejecución.</div>'}</div></section>${flatSection(items)}`}
function rigFigure(){return `<div class="v106-rig-figure"><svg viewBox="0 0 180 150" aria-hidden="true"><defs><linearGradient id="g106" x1="0" x2="1"><stop stop-color="#23d5d5"/><stop offset="1" stop-color="#47d884"/></linearGradient><filter id="sh106"><feDropShadow dx="0" dy="8" stdDeviation="7" flood-color="#000" flood-opacity=".55"/></filter></defs><ellipse cx="94" cy="132" rx="58" ry="11" fill="#12c9aa" opacity=".14"/><g filter="url(#sh106)" stroke="url(#g106)" stroke-width="5" fill="none" stroke-linejoin="round"><path d="M90 18 58 126h64L90 18Z"/><path d="m75 70 31 0M67 96h46M61 118h58M73 70l33 26M107 70 67 96M67 96l48 22M113 96l-52 22"/><path d="M50 126h80"/></g><rect x="82" y="8" width="16" height="18" rx="3" fill="#f5c44b"/></svg></div>`}
function openFlat(id){const x=liveRows().find(q=>String(q.m?.id)===String(id));if(!x)return;const ev=allFlatEvents(x.m),sum=ev.reduce((s,e)=>s+N(e.hours),0);sheetRoot.innerHTML=`<div class="sheet-backdrop"><div class="sheet wide"><div class="sheet-handle"></div><h2>${ESC(x.m?.meta?.rig||'Rig')} · Flat Time</h2><div class="sheet-sub">${R(sum,1)} h acumuladas</div><div class="v106-flat-list">${ev.length?ev.map(e=>`<div><b>${ESC(e.label)} · ${R(e.hours,2)} h</b><span>Día ${e.day||'—'}${e.responsibility?' · '+ESC(e.responsibility):''}</span>${typeof eventDetailSummary==='function'&&eventDetailSummary(e)?`<p>${ESC(eventDetailSummary(e))}</p>`:''}</div>`).join(''):'<div class="v106-empty">Sin eventos.</div>'}</div><div class="sheet-footer"><button id="v106Back" class="btn">← Volver</button><button id="v106CloseFlat" class="btn primary">Cerrar</button></div></div></div>`;E('v106Back').onclick=()=>openLive(id);E('v106CloseFlat').onclick=closeSheet}
function openPending(id){const x=liveRows().find(q=>String(q.m?.id)===String(id));if(!x)return;const rows=x.pending||[];sheetRoot.innerHTML=`<div class="sheet-backdrop"><div class="sheet wide"><div class="sheet-handle"></div><h2>${ESC(x.m?.meta?.rig||'Rig')} · Pendientes del día</h2><div class="sheet-sub">${rows.length} actividades pendientes</div><div class="v106-pending v107-pending-all">${rows.length?rows.map(v=>`<div>${ESC(v)}</div>`).join(''):'<div>Sin pendientes.</div>'}</div><div class="sheet-footer"><button id="v107PendingBack" class="btn">← Volver</button><button id="v107PendingClose" class="btn primary">Cerrar</button></div></div></div>`;E('v107PendingBack').onclick=()=>openLive(id);E('v107PendingClose').onclick=closeSheet}
function openLive(id){const x=liveRows().find(q=>String(q.m?.id)===String(id));if(!x)return;const route=[x.m?.meta?.origin,x.m?.meta?.destination].filter(Boolean).join(' → '),forecast=N(x.progress)>=15&&N(x.elapsed)>=1?Math.max(0,N(x.planned)-x.schedule):null,forecastDelta=forecast==null?null:forecast-N(x.planned),next24=x.p?String(x.m.exec?.closures?.[x.p.id]?.next24||'').split(/\r?\n/).map(s=>s.replace(/^\s*[•*-]\s*/,'').trim()).filter(Boolean):[],pending=x.pending||[],pendingPreview=pending.slice(0,5);sheetRoot.innerHTML=`<div class="sheet-backdrop"><div class="sheet wide v106-detail"><div class="sheet-handle"></div><div class="v106-detail-hero"><div><div class="v106-rig"><strong>${ESC(x.m?.meta?.rig||'Rig')}</strong>${x.test?'<span class="v106-test">PRUEBA</span>':''}</div><span>${ESC(x.m?.meta?.operator||'')}${route?' · '+ESC(route):''}</span><div class="v106-detail-state ${x.state106.key}">${x.state106.label} · <b>${dayText(x.schedule)}</b></div></div>${rigFigure()}</div>${routeStrip(x)}<div class="v106-detail-kpis"><div><span>Plan</span><b>${R(x.planned,1)} d</b></div><div><span>Tendencia cierre</span><b>${forecast==null?'—':R(forecast,1)+' d'}</b>${forecast==null?'<small>Disponible con mayor avance</small>':`<small class="${forecastDelta>0?'late':forecastDelta<0?'ahead':'ontime'}">${forecastDelta>0?'+':''}${R(forecastDelta,1)} d vs Plan</small>`}</div><div><span>Cargas</span><b>${x.loadDelta===0?'En plan':x.loadDelta<0?Math.abs(x.loadDelta)+' atrás':x.loadDelta+' adelante'}</b><small>${x.loadMoved} movilizadas / ${x.loadDue} requeridas hoy · ${totalLoads(x)} totales</small></div><div><span>Distancia</span><b>${R(x.m?.meta?.distanceKm,1)} km</b></div></div><div class="v106-phases">${phaseLine(x,'rd','Rig Down')}${phaseLine(x,'rm','Transporte')}${phaseLine(x,'ru','Rig Up')}</div><button id="v106Flat" class="v106-flat-call"><span><small>FLAT TIME</small><b>${R(x.flat,1)} h</b></span><strong>Ver eventos ›</strong></button><div class="v106-detail-block"><h3>Pendientes del día · ${pending.length}</h3><div class="v106-pending">${pendingPreview.map(v=>`<div>${ESC(v)}</div>`).join('')||'<div>Sin pendientes.</div>'}</div>${pending.length>5?`<button id="v107AllPending" class="v107-more">+${pending.length-5} pendientes · Ver todos</button>`:''}</div><div class="v106-detail-block"><h3>Próximas 24 Hrs</h3><div class="v106-pending">${next24.slice(0,8).map(v=>`<div>${ESC(v)}</div>`).join('')||'<div>Sin actividades registradas.</div>'}</div></div><div class="sheet-footer"><button id="v106Close" class="btn">Cerrar</button>${typeof canAccessMove==='function'&&canAccessMove(currentUser(),x.m)?'<button id="v106Open" class="btn primary">Abrir Move</button>':''}</div></div></div>`;E('v106Close').onclick=closeSheet;E('v106Flat').onclick=()=>openFlat(id);if(E('v107AllPending'))E('v107AllPending').onclick=()=>openPending(id);if(E('v106Open'))E('v106Open').onclick=()=>{closeSheet();state.selectedMoveId=x.m.id;state.screen='execute';state.execMode='days';save();render();window.scrollTo?.(0,0)}}
function trendLabel(x){const d=new Date(x.acceptance||x.release||0),m=['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];return `${String(x.rig||'Rig')}·${Number.isNaN(d.getTime())?'—':m[d.getMonth()]}`}
function trendSvg(rows){const a=rows.slice().sort((x,y)=>new Date(x.acceptance||x.release||0)-new Date(y.acceptance||y.release||0));if(!a.length)return'<div class="v106-empty">Sin datos.</div>';const W=760,H=250,p={l:34,r:18,t:20,b:34},mx=Math.max(1,...a.flatMap(x=>[N(x.gross),N(x.net)])),X=i=>p.l+(a.length===1?(W-p.l-p.r)/2:i*(W-p.l-p.r)/(a.length-1)),Y=v=>p.t+(1-v/mx)*(H-p.t-p.b),pts=k=>a.map((x,i)=>`${X(i)},${Y(N(x[k]))}`).join(' ');let s=`<svg viewBox="0 0 ${W} ${H}" class="v106-trend">`;for(let q=0;q<=4;q++){const v=mx*q/4,y=Y(v);s+=`<line x1="${p.l}" y1="${y}" x2="${W-p.r}" y2="${y}"/><text x="${p.l-6}" y="${y+4}" text-anchor="end">${R(v,0)}</text>`}s+=`<polyline class="gross" points="${pts('gross')}"/><polyline class="net" points="${pts('net')}"/>`;a.forEach((x,i)=>{if(i%Math.max(1,Math.ceil(a.length/6))===0||i===a.length-1)s+=`<text x="${X(i)}" y="${H-8}" text-anchor="middle">${ESC(trendLabel(x))}</text>`});return s+'</svg>'}
function causeData(rows){const g={};for(const x of rows)for(const [k,v] of Object.entries(x.flatBreakdown||{}))if(N(v)>0)g[k]=(g[k]||0)+N(v);return Object.entries(g).sort((a,b)=>b[1]-a[1])}
function donut(rows){const data=causeData(rows),total=data.reduce((s,x)=>s+x[1],0),cols=['#35cf8e','#2f7df6','#f2b34f','#ef6671','#a98bff','#65d5e9'],top=data.slice(0,6);let cur=0,st=[];top.forEach((x,i)=>{const a=total?cur/total*360:0;cur+=x[1];const b=total?cur/total*360:0;st.push(`${cols[i]} ${a}deg ${b}deg`)});return `<div class="v106-donut-wrap"><div class="v106-donut" style="background:conic-gradient(${st.join(',')||'#1b2a37 0 360deg'})"><div><b>${R(total,0)}</b><small>h drivers</small></div></div><div class="v106-donut-legend">${top.map((x,i)=>`<span><i style="background:${cols[i]}"></i><b>${ESC(x[0])}</b><small>${R(x[1],0)} h</small></span>`).join('')}</div></div>`}
function historyView(rows){const a=histAgg(rows);return `<section class="v106-hist-hero"><div><span>HISTÓRICO</span><h2>${a.n} Moves cerradas</h2><p>Lectura consolidada de ejecución</p></div><div class="v106-hist-kpis"><div><span>Avg Gross</span><b>${R(a.avgGross,1)} d</b></div><div><span>Avg Net</span><b>${R(a.avgNet,1)} d</b></div><div><span>Extensión Gross–Net</span><b>${R(a.extension,1)} h</b></div></div></section><div class="v106-hist-grid"><section class="v106-panel"><div class="v106-panel-head"><div><h2>Productive Time</h2><p>Net / Gross histórico</p></div></div><div class="v106-single-ring">${ring('Productive Time',a.productive,Math.round(a.productive)+'%',`${R(a.totalNet,1)} d Net / ${R(a.totalGross,1)} d Gross`,a.productive>=80?'good':a.productive>=65?'warn':'bad')}</div></section><section class="v106-panel"><div class="v106-panel-head"><div><h2>Drivers registrados</h2><p>Horas por causa · pueden superponerse</p></div><b>${R(a.drivers,0)} h</b></div>${donut(rows)}</section></div><section class="v106-panel"><div class="v106-panel-head"><div><h2>Gross vs Net</h2><p>Tendencia histórica por Move</p></div><div class="v106-trend-legend"><span class="gross">Gross</span><span class="net">Net</span></div></div>${trendSvg(rows)}</section><section class="v106-panel"><div class="v106-panel-head"><div><h2>Moves históricas</h2><p>RigGO + Legacy LATAM</p></div><b>${rows.length}</b></div><div class="v106-history-list">${rows.slice().reverse().map(x=>`<button data-v97-hist="${ESC(x.id)}"><strong>${ESC(x.rig)}</strong><span>${ESC(x.operator||'')} · ${ESC(x.company||'')}</span><b>${R(x.gross,1)} d</b><small>${R(x.flatHours,1)} h Ext.</small><i>›</i></button>`).join('')}</div></section>`}
function topView(rows){const rigs=groupRigs(rows),top=rigs.slice(0,3),order=top.length>=3?[top[1],top[0],top[2]]:top,opps=rigs.slice().sort((a,b)=>b.avgFlat-a.avgFlat||b.flat-a.flat);return `<section class="v106-top-hero"><span>TOP RIGS</span><h2>Best Execution</h2><p>Productive Time consolidado por Rig · una Move también cuenta</p><div class="v106-podium">${order.map(x=>{const rank=top.indexOf(x)+1;return `<div class="rank${rank}"><em>${rank===1?'🥇':rank===2?'🥈':'🥉'}</em><strong>${ESC(x.name)}</strong><span>${x.n} Move${x.n===1?'':'s'}</span><b>${Math.round(x.productive)}%</b><small>Avg Gross ${R(x.avgGross,1)} d</small></div>`}).join('')}</div></section><section class="v106-panel"><div class="v106-panel-head"><div><h2>Ranking por Rig</h2><p>Todos los Rigs con al menos 1 Move</p></div></div><div class="v106-leaderboard">${rigs.map((x,i)=>`<div><span class="pos">#${i+1}</span><span class="name"><b>${ESC(x.name)}</b><small>${x.n} Move${x.n===1?'':'s'} · Avg Gross ${R(x.avgGross,1)} d · Flat ${R(x.flat,0)} h</small></span><strong>${Math.round(x.productive)}%</strong></div>`).join('')||'<div class="v106-empty">Sin histórico.</div>'}</div></section><section class="v106-panel"><div class="v106-panel-head"><div><h2>Mayor oportunidad por Rig</h2><p>Flat Time promedio por Move</p></div></div><div class="v106-opps">${opps.map((x,i)=>`<div><span>#${i+1}</span><div><b>${ESC(x.name)}</b><small>${x.n} Move${x.n===1?'':'s'} · ${R(x.flat,0)} h total</small></div><strong>${R(x.avgFlat,1)} h/Move</strong></div>`).join('')}</div></section>`}
renderOverall=function(){state.overallTab=['live','history','top'].includes(state.overallTab)?state.overallTab:'live';const tab=state.overallTab,body=tab==='live'?liveView(liveRows()):tab==='history'?historyView(history()):topView(history());return `<div class="v106-perf"><div class="v106-head"><div><div class="eyebrow">RIGGO · MANAGEMENT PERFORMANCE</div><h1>Performance</h1></div><div class="v106-tabs"><button data-v106-tab="live" class="${tab==='live'?'active':''}">En curso</button><button data-v106-tab="history" class="${tab==='history'?'active':''}">Histórico</button><button data-v106-tab="top" class="${tab==='top'?'active':''}">Top</button></div></div>${body}</div>`};
wireOverall=function(){try{BASE_WIRE_OVERALL()}catch(_){}document.querySelectorAll('[data-v106-tab]').forEach(b=>b.onclick=()=>{state.overallTab=b.dataset.v106Tab;save();render();window.scrollTo?.(0,0)});document.querySelectorAll('[data-v106-live]').forEach(b=>b.onclick=()=>openLive(b.dataset.v106Live))};

/* ---------- Groups + support storage ---------- */
async function loadConfig(force=false){if(V106.loading||(!force&&V106.loaded))return;const s=db();if(!s||!state?.auth?.logged)return;V106.loading=true;V106.error='';try{const [gq,sq]=await Promise.all([s.from('riggo_distribution_groups').select('*').order('name'),s.from('riggo_app_settings').select('*').eq('id','global').maybeSingle()]);if(gq.error)throw gq.error;V106.groups=(gq.data||[]).map(g=>({...g,emails:Array.isArray(g.emails)?g.emails:[],rigs:Array.isArray(g.rigs)?g.rigs:[]}));if(sq.error)throw sq.error;if(sq.data)V106.settings={...V106.settings,...sq.data};V106.loaded=true}catch(e){V106.error=String(e.message||e);V106.loaded=true}finally{V106.loading=false;postRender();if(!force&&['admin','plan','review'].includes(state?.screen))setTimeout(()=>{try{render()}catch(_){}},0)}}
function activeGroups(){return V106.groups.filter(g=>g.active!==false)}
function parseEmailsText(v){const arr=String(v||'').split(/[;,\s]+/).map(x=>x.trim().toLowerCase()).filter(Boolean),good=[],bad=[];for(const e of arr)(/^[A-Z0-9._%+-]+@nabors\.com$/i.test(e)?good:bad).push(e);return{good:[...new Set(good)],bad:[...new Set(bad)]}}
function groupsHtml(m){const gs=activeGroups();if(!gs.length)return'';const rig=String(m?.meta?.rig||''),sorted=gs.slice().sort((a,b)=>(b.rigs||[]).includes(rig)-(a.rigs||[]).includes(rig)||String(a.name).localeCompare(String(b.name)));return `<div class="v106-group-picker"><div><b>Grupos de distribución</b><small>Seleccione para agregar destinatarios</small></div><div class="v106-group-chips">${sorted.map(g=>`<button type="button" data-v106-addgroup="${ESC(g.id)}" class="${(g.rigs||[]).includes(rig)?'suggested':''}" title="${ESC(g.emails.join('; '))}"><span>${ESC(g.name)}</span><small>${g.emails.length} · ${(g.default_channel||'cc').toUpperCase()}</small></button>`).join('')}</div></div>`}
function mergeGroup(group,toId,ccId){const a=E(toId),b=E(ccId);if(!a||!b)return false;const target=(group.default_channel||'cc')==='to'?a:b,existing=typeof splitEmails==='function'?splitEmails(target.value):parseEmailsText(target.value).good,next=[...new Set([...existing,...group.emails])].join('; '),to=target===a?next:a.value,cc=target===b?next:b.value;if(window.RigGORecipientChars&&!window.RigGORecipientChars.ok(to,cc,true))return false;target.value=next;target.dispatchEvent(new Event('input',{bubbles:true}));target.dispatchEvent(new Event('change',{bubbles:true}));return true}
function groupApplied(g,toId,ccId){const id=(g.default_channel||'cc')==='to'?toId:ccId,el=E(id);if(!el)return false;const have=new Set((typeof splitEmails==='function'?splitEmails(el.value):parseEmailsText(el.value).good).map(x=>String(x).toLowerCase()));return (g.emails||[]).length>0&&(g.emails||[]).every(e=>have.has(String(e).toLowerCase()))}
function refreshGroupPicker(toId,ccId){document.querySelectorAll('[data-v106-addgroup]').forEach(b=>{const g=V106.groups.find(x=>String(x.id)===String(b.dataset.v106Addgroup)),on=g&&groupApplied(g,toId,ccId);b.classList.toggle('selected',!!on);b.setAttribute('aria-pressed',on?'true':'false')})}
function bindGroupPicker(toId,ccId){document.querySelectorAll('[data-v106-addgroup]').forEach(b=>b.onclick=()=>{const g=V106.groups.find(x=>String(x.id)===String(b.dataset.v106Addgroup));if(g&&mergeGroup(g,toId,ccId)){refreshGroupPicker(toId,ccId);try{toast(`Grupo ${g.name} agregado`)}catch(_){}}});E(toId)?.addEventListener('input',()=>refreshGroupPicker(toId,ccId));E(ccId)?.addEventListener('input',()=>refreshGroupPicker(toId,ccId));refreshGroupPicker(toId,ccId)}
renderPlan=function(){let h=BASE_PLAN();if(String(h).includes('Distribución · Daily Move Update'))h=String(h).replace('<h2>Distribución · Daily Move Update</h2>','<h2>Distribución · Daily Move Update</h2>'+groupsHtml(typeof currentMove==='function'?currentMove():null));return h};
wirePlan=function(){BASE_WIRE_PLAN();bindGroupPicker('dailyTo','dailyCc')};
renderReview=function(){let h=BASE_REVIEW();if(String(h).includes('id="deliveryTo"'))h=String(h).replace('<div class="v70-delivery-tools">',groupsHtml(typeof currentMove==='function'?currentMove():null)+'<div class="v70-delivery-tools">');return h};
wireReview=function(){BASE_WIRE_REVIEW();bindGroupPicker('deliveryTo','deliveryCc')};

/* ---------- Admin groups + assistance ---------- */
function adminTabs(tab){return `<div class="v4-admin-tabs"><button class="btn ${tab==='moves'?'active':''}" data-v4-admintab="moves">Moves</button><button class="btn ${tab==='users'?'active':''}" data-v4-admintab="users">Usuarios</button><button class="btn ${tab==='history'?'active':''}" data-v4-admintab="history">Histórico</button><button class="btn ${tab==='groups'?'active':''}" data-v4-admintab="groups">Grupos</button><button class="btn ${tab==='support'?'active':''}" data-v4-admintab="support">Asistencia</button></div>`}
function customAdmin(content,tab){return `<div class="v5-admin"><div class="v5-admin-build"><span class="status good">Release</span><b>RigGO ${RELEASE}</b><span>${BUILD}</span></div><div class="screen-title"><div><h1>Administración</h1><p>Accesos, Moves, grupos y configuración</p></div></div>${adminTabs(tab)}<div class="v4-admin-grid">${content}</div></div>`}
function groupsAdmin(){return `<div class="panel"><div class="row between wrap" style="margin-bottom:10px"><div><h2>Grupos de distribución</h2><div class="small muted">Cree grupos reutilizables para Para / CC.</div></div><button id="v106AddGroup" class="btn primary">+ Grupo</button></div>${V106.error?`<div class="v106-config-error">${ESC(V106.error)} · Ejecute el SQL de configuración 10.6 en Supabase.</div>`:''}<div class="v106-admin-groups">${V106.groups.map(g=>`<div class="v106-admin-group ${g.active===false?'disabled':''}"><div><b>${ESC(g.name)}</b><span>${ESC(g.description||'')}</span><small>${g.emails.length} miembros · ${(g.default_channel||'cc').toUpperCase()}${(g.rigs||[]).length?' · '+g.rigs.join(', '):''}</small></div><div><button class="btn small" data-v106-editgroup="${ESC(g.id)}">Editar</button><button class="btn small danger" data-v106-delgroup="${ESC(g.id)}">Eliminar</button></div></div>`).join('')||'<div class="v106-empty">Aún no hay grupos creados.</div>'}</div></div>`}
function supportAdmin(){return `<div class="panel v106-support-admin"><h2>Asistencia general</h2><div class="small muted">Botón de soporte general por WhatsApp para todos los usuarios de RigGO.</div>${V106.error?`<div class="v106-config-error">${ESC(V106.error)} · Ejecute el SQL de configuración 10.6 en Supabase.</div>`:''}<label>Número WhatsApp<input id="v106WaNumber" class="field" inputmode="tel" value="${ESC(V106.settings.whatsapp_number||'')}" placeholder="573001234567"></label><label>Mensaje inicial<textarea id="v106WaMessage" class="field" rows="3">${ESC(V106.settings.whatsapp_message||'Hola, necesito soporte con RigGO.')}</textarea></label><div class="row" style="margin-top:12px"><button id="v106SaveSupport" class="btn primary">Guardar</button></div></div>`}
renderAdmin=function(){const tab=state.adminMoveView||'moves';if(tab==='groups')return customAdmin(groupsAdmin(),tab);if(tab==='support')return customAdmin(supportAdmin(),tab);let h=BASE_ADMIN();return String(h).replace(/<div class="v4-admin-tabs">[\s\S]*?<\/div><div class="v4-admin-grid">/,adminTabs(tab)+'<div class="v4-admin-grid">')};
function rigsList(){return['X38','X40','X42','X43','X45','M47','M48','992','993','609','794','137','338','238']}
function groupSheet(g){const isNew=!g,g0=g||{name:'',description:'',emails:[],rigs:[],default_channel:'cc',active:true};sheetRoot.innerHTML=`<div class="sheet-backdrop"><div class="sheet wide"><div class="sheet-handle"></div><h2>${isNew?'Crear grupo':'Editar grupo'}</h2><div class="grid g2"><label>Nombre<input id="v106GName" class="field" value="${ESC(g0.name||'')}"></label><label>Canal predeterminado<select id="v106GChannel" class="field"><option value="to" ${(g0.default_channel||'cc')==='to'?'selected':''}>Para</option><option value="cc" ${(g0.default_channel||'cc')==='cc'?'selected':''}>CC</option></select></label></div><label>Descripción<input id="v106GDesc" class="field" value="${ESC(g0.description||'')}"></label><label>Miembros<textarea id="v106GEmails" class="field" rows="6" placeholder="correo@nabors.com; correo2@nabors.com">${ESC((g0.emails||[]).join('; '))}</textarea></label><div class="v106-rig-checks"><b>Rigs asociados · opcional</b><div>${rigsList().map(r=>`<label><input type="checkbox" data-v106-grig="${r}" ${(g0.rigs||[]).includes(r)?'checked':''}> ${r}</label>`).join('')}</div></div><label class="v106-active-check"><input id="v106GActive" type="checkbox" ${g0.active!==false?'checked':''}> Grupo activo</label><div id="v106GResult" class="small"></div><div class="sheet-footer"><button id="v106GCancel" class="btn">Cancelar</button><button id="v106GSave" class="btn primary">Guardar</button></div></div></div>`;E('v106GCancel').onclick=closeSheet;E('v106GSave').onclick=async()=>{const name=E('v106GName').value.trim(),parsed=parseEmailsText(E('v106GEmails').value),res=E('v106GResult');if(!name){res.textContent='Indique un nombre.';return}if(parsed.bad.length){res.textContent='Revise: '+parsed.bad.join(', ');return}if(!parsed.good.length){res.textContent='Agregue al menos un correo @nabors.com.';return}if(parsed.good.join('; ').length>500){res.textContent='Este grupo supera por sí solo el límite actual de distribución.';return}const row={name,description:E('v106GDesc').value.trim(),emails:parsed.good,rigs:[...document.querySelectorAll('[data-v106-grig]:checked')].map(x=>x.dataset.v106Grig),default_channel:E('v106GChannel').value,active:E('v106GActive').checked,updated_by:state.auth.email,updated_at:new Date().toISOString()};const s=db();try{E('v106GSave').disabled=true;let q;if(isNew)q=await s.from('riggo_distribution_groups').insert({...row,created_by:state.auth.email}).select().single();else q=await s.from('riggo_distribution_groups').update(row).eq('id',g0.id).select().single();if(q.error)throw q.error;await loadConfig(true);closeSheet();render()}catch(e){res.textContent='Error: '+String(e.message||e);E('v106GSave').disabled=false}}}
async function deleteGroup(id){const g=V106.groups.find(x=>String(x.id)===String(id));if(!g||!confirm(`Eliminar grupo ${g.name}?`))return;const s=db(),q=await s.from('riggo_distribution_groups').delete().eq('id',id);if(q.error){alert(q.error.message);return}await loadConfig(true);render()}
wireAdmin=function(){const tab=state.adminMoveView||'moves';if(tab!=='groups'&&tab!=='support'){BASE_WIRE_ADMIN();return}document.querySelectorAll('[data-v4-admintab]').forEach(b=>b.onclick=()=>{state.adminMoveView=b.dataset.v4Admintab;saveLocal();render()});if(tab==='groups'){E('v106AddGroup')?.addEventListener('click',()=>groupSheet(null));document.querySelectorAll('[data-v106-editgroup]').forEach(b=>b.onclick=()=>groupSheet(V106.groups.find(x=>String(x.id)===String(b.dataset.v106Editgroup))));document.querySelectorAll('[data-v106-delgroup]').forEach(b=>b.onclick=()=>deleteGroup(b.dataset.v106Delgroup))}else{E('v106SaveSupport')?.addEventListener('click',async()=>{const num=E('v106WaNumber').value.replace(/\D+/g,''),msg=E('v106WaMessage').value.trim()||'Hola, necesito soporte con RigGO.',s=db(),btn=E('v106SaveSupport');try{btn.disabled=true;const q=await s.from('riggo_app_settings').upsert({id:'global',whatsapp_number:num,whatsapp_message:msg,updated_by:state.auth.email,updated_at:new Date().toISOString()},{onConflict:'id'});if(q.error)throw q.error;V106.settings.whatsapp_number=num;V106.settings.whatsapp_message=msg;toast('Asistencia guardada');postRender()}catch(e){alert('No fue posible guardar: '+String(e.message||e))}finally{btn.disabled=false}})}};

/* ---------- General WhatsApp assistance ---------- */
function supportUrl(){const n=String(V106.settings.whatsapp_number||'').replace(/\D+/g,''),m=V106.settings.whatsapp_message||'Hola, necesito soporte con RigGO.';return n?`https://wa.me/${n}?text=${encodeURIComponent(m)}`:''}
function injectSupport(){const url=supportUrl();document.getElementById('v106Assist')?.remove();if(!url||!state?.auth?.logged)return;const target=document.querySelector('.top-actions');if(!target)return;const b=document.createElement('button');b.id='v106Assist';b.className='btn v106-assist';b.type='button';b.title='Asistencia RigGO';b.setAttribute('aria-label','Asistencia RigGO por WhatsApp');b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path class="bubble" d="M12 3.2a8.2 8.2 0 0 0-7.1 12.3L4 20.8l5.4-1.4A8.2 8.2 0 1 0 12 3.2Z"/><path class="phone" d="M8.3 7.5c.4-.4.9-.4 1.2.1l1 1.8c.2.4.1.8-.2 1.1l-.7.7c.7 1.5 1.8 2.6 3.3 3.3l.7-.7c.3-.3.7-.4 1.1-.2l1.8 1c.5.3.5.8.1 1.2l-.7.7c-.7.7-1.8.9-2.8.5-3.2-1.2-5.8-3.8-7-7-.4-1-.2-2.1.5-2.8l.7-.7Z"/></svg>';b.onclick=()=>window.open(url,'_blank','noopener');target.prepend(b)}
function postRender(){requestAnimationFrame(()=>{injectSupport();stamp()})}

V106.test={groupRigs,prod,enrich,liveRows,parseEmailsText,deltaState,dayText,plannedLoadsDue,totalLoads,histAgg,causeData,openLive,openFlat,groupApplied};

/* ---------- Load + version ---------- */
function stamp(){const box=document.querySelector('.v5-admin-build');if(box){const b=box.querySelector('b');if(b)b.textContent='RigGO '+RELEASE;const sp=box.querySelectorAll('span');if(sp.length)sp[sp.length-1].textContent=BUILD}}
if(typeof render==='function'){const BASE=render;render=function(){const o=BASE.apply(this,arguments);if(state?.auth?.logged)loadConfig(false);postRender();return o}}

setTimeout(()=>{if(state?.auth?.logged)loadConfig(false);stamp()},120);setTimeout(stamp,340);setTimeout(stamp,700);
})();

/* ===== SOURCE riggo-v108.js (consolidated) ===== */
/* RigGO 10.8 · Responsive desktop polish + clean identity */
(()=>{
'use strict';
const RELEASE='10.8.0-desktop-polish-c1',BUILD='2026-08-17-1413-C1';
const esc=v=>typeof enc==='function'?enc(v??''):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

function displayName(){
  const email=String(state?.auth?.email||'').trim().toLowerCase();
  const local=email.split('@')[0]||'';
  const parts=local.split(/[._-]+/).filter(Boolean).slice(0,2);
  if(!parts.length)return 'Usuario';
  return parts.map(p=>p.charAt(0).toUpperCase()+p.slice(1).toLowerCase()).join(' ');
}

/* Header: same permissions/actions, only replace technical email with human display name. */
if(typeof shell==='function'){
  const BASE_SHELL=shell;
  shell=function(content){
    let h=String(BASE_SHELL(content));
    if(state?.auth?.logged){
      h=h.replace(/<span class="user-pill">[\s\S]*?<\/span>/,`<span class="user-pill v108-user-name" title="${esc(state.auth.email||'')}">${esc(displayName())}</span>`);
    }
    return h;
  };
}

/* Daily Move Update: keep provider ID in data/audit, remove it from user-facing status. */
if(typeof renderReview==='function'){
  const BASE_REVIEW=renderReview;
  renderReview=function(){
    let h=String(BASE_REVIEW.apply(this,arguments));
    h=h.replace(
      /<div class="report-status v4-complete"><b>Completado ✓<\/b><div class="small muted" style="margin-top:4px">Día cerrado · Email enviado ([^<]*?)(?: · ID [^<]*)?<\/div><\/div>/,
      '<div class="report-status v4-complete v108-sent-clean"><b>Enviado ✓</b><div class="small muted" style="margin-top:4px">$1</div></div>'
    );
    return h;
  };
}

function applyVisualIdentity(){
  const pill=document.querySelector('.user-pill');
  if(pill&&state?.auth?.logged){pill.textContent=displayName();pill.classList.add('v108-user-name');pill.title=state.auth.email||''}
  const wa=document.getElementById('v106Assist');
  if(wa){
    wa.innerHTML='<img class="v108-whatsapp-mark" src="./assets/whatsapp-mark.png" alt="">';
    wa.title='Asistencia RigGO';
    wa.setAttribute('aria-label','Asistencia RigGO por WhatsApp');
  }
}

function stamp(){
  
  
  
  
  
  const box=document.querySelector('.v5-admin-build');if(box){const b=box.querySelector('b');if(b)b.textContent='RigGO '+RELEASE;const sp=box.querySelectorAll('span');if(sp.length)sp[sp.length-1].textContent=BUILD}
}

if(typeof render==='function'){
  const BASE_RENDER=render;
  render=function(){const out=BASE_RENDER.apply(this,arguments);requestAnimationFrame(()=>{applyVisualIdentity();stamp()});return out};
}
setTimeout(()=>{applyVisualIdentity();stamp()},100);
setTimeout(()=>{applyVisualIdentity();stamp()},360);
setTimeout(()=>{applyVisualIdentity();stamp()},850);
setTimeout(()=>{applyVisualIdentity();stamp()},1300);

})();

/* ===== SOURCE riggo-v109.js (consolidated) ===== */
/* RigGO 10.9 · Desktop Typography System + time-aware greeting */
(()=>{
'use strict';
const RELEASE='10.9.0-desktop-typography-c1',BUILD='2026-08-17-1440-C1';

function firstName109(){
  try{
    const u=typeof currentUser==='function'?currentUser():null;
    const email=String(u?.email||state?.auth?.email||'').trim().toLowerCase();
    let name=String(u?.name||'').trim();
    if(!name||/riggo admin/i.test(name)||name.includes('@')) name=(email.split('@')[0]||'').split(/[._-]+/)[0]||'';
    else name=(name.split(/\s+/)[0]||name);
    return name?name.charAt(0).toUpperCase()+name.slice(1).toLowerCase():'';
  }catch(_){return''}
}

/* Uses the device/browser local clock.
   05:00-11:59 Buenos días · 12:00-18:59 Buenas tardes · 19:00-04:59 Buenas noches. */
function greeting109(){
  const h=new Date().getHours();
  const g=(h>=5&&h<12)?'Buenos días':(h>=12&&h<19)?'Buenas tardes':'Buenas noches';
  const n=firstName109();
  return n?`${g}, ${n}`:g;
}

function refreshGreeting109(){
  const el=document.querySelector('.v106-greet');
  if(el) el.textContent=greeting109();
}

function stamp109(){
  
  
  
  
  
  
  const box=document.querySelector('.v5-admin-build');
  if(box){
    const b=box.querySelector('b');if(b)b.textContent='RigGO '+RELEASE;
    const sp=box.querySelectorAll('span');if(sp.length)sp[sp.length-1].textContent=BUILD;
  }
}

function post109(){requestAnimationFrame(()=>{refreshGreeting109();stamp109()})}
if(typeof render==='function'){
  const BASE_RENDER_109=render;
  render=function(){const out=BASE_RENDER_109.apply(this,arguments);post109();return out};
}

/* Keep greeting correct if the app remains open across a daypart boundary. */
setInterval(refreshGreeting109,60000);
setTimeout(()=>{refreshGreeting109();stamp109()},100);
setTimeout(()=>{refreshGreeting109();stamp109()},400);
setTimeout(()=>{refreshGreeting109();stamp109()},1000);


window.RigGOV109={greeting:greeting109,firstName:firstName109,release:RELEASE,build:BUILD};
})();

/* ===== SOURCE riggo-v110.js (consolidated) ===== */
/* RigGO 11.0 · Stability C1
   Scope only:
   1) XLSX Move Template import array-mode compatibility.
   2) OPS Flat Time pagination / footer safety.
   3) Server-authoritative Move soft-delete / restore.
*/
(()=>{
'use strict';
const RELEASE='11.0.0-stability-c1';
const BUILD='2026-08-17-2122-C1';

/* ------------------------------------------------------------
   1. TEMPLATE IMPORT
   The bundled offline XLSX reader historically ignored {header:1}
   and returned row objects. importWorkbook expects arrays and calls
   .map(), producing "(...).map is not a function". Honor array mode
   only for the bundled sheet representation; real SheetJS remains
   untouched.
------------------------------------------------------------ */
function patchOfflineXlsxArrayMode(){
  const XLSX=window.XLSX;
  if(!XLSX?.utils?.sheet_to_json || XLSX.utils.sheet_to_json.__riggo110)return false;
  const base=XLSX.utils.sheet_to_json.bind(XLSX.utils);
  const patched=function(sheet,opts={}){
    if(opts?.header===1 && sheet?.cells instanceof Map){
      const def=Object.prototype.hasOwnProperty.call(opts,'defval')?opts.defval:'';
      const maxR=Math.max(0,Number(sheet.maxR)||0),maxC=Math.max(0,Number(sheet.maxC)||0);
      const out=[];
      for(let r=0;r<=maxR;r++){
        const row=[];let any=false;
        for(let c=0;c<=maxC;c++){
          let v=sheet.cells.get(r+','+c);
          if(v===undefined||v===null)v=def;
          if(v!==''&&v!==def)any=true;
          row.push(v);
        }
        if(any||opts.blankrows)out.push(row);
      }
      return out;
    }
    return base(sheet,opts);
  };
  patched.__riggo110=true;
  patched.__riggo110Base=base;
  XLSX.utils.sheet_to_json=patched;
  return true;
}
patchOfflineXlsxArrayMode();

/* ------------------------------------------------------------
   2. OPS PDF PAGINATION
   The OPS renderer screenshots each .f0065-page independently, so
   CSS page-break rules cannot move overflow to the next page. Move
   Flat Time events to dedicated manually-paginated pages and then
   renumber every footer.
------------------------------------------------------------ */
const BASE_F0065_110=typeof f0065Html==='function'?f0065Html:null;

function flatChunks110(events){
  const chunks=[];let cur=[],used=0;
  const BUDGET=24,MAX_EVENTS=3;
  for(const el of events){
    const chars=String(el.textContent||'').replace(/\s+/g,' ').trim().length;
    const units=Math.max(6,5+Math.ceil(chars/105));
    if(cur.length && (cur.length>=MAX_EVENTS || used+units>BUDGET)){
      chunks.push(cur);cur=[];used=0;
    }
    cur.push(el);used+=units;
  }
  if(cur.length)chunks.push(cur);
  return chunks;
}
function underline110(page,needle){
  return [...page.querySelectorAll('.f0065-underline')].find(x=>String(x.textContent||'').toUpperCase().includes(needle));
}
function renumberOps110(wrap){
  const pages=[...wrap.children].filter(x=>x.classList?.contains('f0065-page'));
  pages.forEach((p,i)=>{
    const c=p.querySelector('.f0065-footer .c');
    if(c)c.textContent=`Page ${i+1} of ${pages.length}`;
  });
  return pages.length;
}
function repaginateOps110(html){
  if(typeof document==='undefined')return html;
  const shell=document.createElement('div');shell.innerHTML=String(html||'');
  const wrap=shell.querySelector('.f0065-wrap');if(!wrap)return html;
  let pages=[...wrap.children].filter(x=>x.classList?.contains('f0065-page'));
  const firstFlat=pages.find(p=>underline110(p,'ADELANTOS O RETRASOS DEL CRONOGRAMA / FLAT TIME'));
  if(!firstFlat)return html;
  const flatEvents=pages.flatMap(p=>[...p.querySelectorAll('.f0065-flat-event')].map(x=>x.cloneNode(true)));
  if(!flatEvents.length){renumberOps110(wrap);return wrap.outerHTML;}

  /* Remove Flat Time from the mixed LMC/crew/control page. This is
     what guarantees that the first event can never enter the footer. */
  const firstHeading=underline110(firstFlat,'ADELANTOS O RETRASOS DEL CRONOGRAMA / FLAT TIME');
  if(firstHeading){
    const next=firstHeading.nextElementSibling;
    if(next?.classList?.contains('f0065-box'))next.remove();
    firstHeading.remove();
  }

  /* Remove original fixed-8 continuation pages; they are replaced by
     adaptive dedicated Flat Time pages below. */
  pages=[...wrap.children].filter(x=>x.classList?.contains('f0065-page'));
  pages.filter(p=>p!==firstFlat && underline110(p,'CONTINUACIÓN - FLAT TIME')).forEach(p=>p.remove());

  const chunks=flatChunks110(flatEvents);
  let anchor=firstFlat;
  chunks.forEach((chunk,i)=>{
    const page=document.createElement('div');
    page.className='f0065-page f0065-flat-page v110-flat-page';
    page.innerHTML=`${typeof fHeader==='function'?fHeader():''}<div class="f0065-underline">${i===0?'ADELANTOS O RETRASOS DEL CRONOGRAMA / FLAT TIME:':'CONTINUACIÓN - FLAT TIME / DESVIACIONES:'}</div><div class="f0065-box v110-flat-box"></div>${typeof fFooter==='function'?fFooter(0,0):''}`;
    const box=page.querySelector('.v110-flat-box');
    chunk.forEach(el=>box?.appendChild(el));
    anchor.insertAdjacentElement('afterend',page);anchor=page;
  });
  renumberOps110(wrap);
  return wrap.outerHTML;
}
if(BASE_F0065_110){
  f0065Html=function(m,p,c){return repaginateOps110(BASE_F0065_110(m,p,c));};
}

/* ------------------------------------------------------------
   3. SERVER-AUTHORITATIVE MOVE DELETION
   Requires RigGO_11_0_MOVE_TOMBSTONE.sql. A DB trigger preserves
   deleted_at against stale browser UPSERTs and mirrors the tombstone
   into settings.riggo_payload.management for old clients too.
------------------------------------------------------------ */
function isAdmin110(){try{return !!(typeof hasPerm==='function'&&hasPerm('admin'))}catch(_){return false}}
function mgmt110(m){
  if(typeof v4Mgmt==='function')return v4Mgmt(m);
  m.management=m.management||{};return m.management;
}
function localOnly110(){try{saveLocal()}catch(_){}}
function stampDeleted110(m,at,by){
  const g=mgmt110(m);g.deletedAt=at||new Date().toISOString();g.deletedBy=by||state?.auth?.email||'';
  delete g.archivedAt;delete g.archivedBy;
}
function clearDeleted110(m){
  const g=mgmt110(m);delete g.deletedAt;delete g.deletedBy;delete g.archivedAt;delete g.archivedBy;
}
async function rpc110(name,id){
  const db=window.RigGOSupabase;if(!db)throw new Error('No hay conexión con Supabase.');
  const {data,error}=await db.rpc(name,{p_move_id:id});
  if(error)throw error;
  return Array.isArray(data)?(data[0]||{}):(data||{});
}

if(typeof v4DeleteMove==='function'){
  v4DeleteMove=async function(m){
    if(!m||!isAdmin110()){try{toast('Esta acción es exclusiva de Administradores.')}catch(_){};return;}
    if(!confirm(`Eliminar ${m.meta?.rig||'esta Move'}?\n\nLa Move saldrá de Planeación, Ejecución y Performance. La eliminación quedará protegida en servidor para que otra sesión no pueda recrearla.`))return;
    try{
      const out=await rpc110('riggo_delete_move',m.id);
      const at=out.deleted_at||new Date().toISOString(),by=out.deleted_by||state.auth.email;
      stampDeleted110(m,at,by);
      m.audit=m.audit||[];m.audit.push({at,user:state.auth.email,action:'delete_move',mode:'server_tombstone_v110'});
      if(state.selectedMoveId===m.id)state.selectedMoveId=null;
      state.screen='admin';state.adminMoveView='moves';state.adminMoveStatus='active';
      localOnly110();render();
      try{toast('Move eliminada definitivamente de las vistas activas.')}catch(_){}
      setTimeout(()=>{try{hydrateRemote?.()}catch(_){}},80);
    }catch(e){
      alert('No fue posible eliminar la Move en servidor. No se aplicaron cambios.\n\n'+String(e?.message||e));
    }
  };
}
if(typeof v4RestoreMove==='function'){
  v4RestoreMove=async function(m){
    if(!m||!isAdmin110()){try{toast('Esta acción es exclusiva de Administradores.')}catch(_){};return;}
    try{
      await rpc110('riggo_restore_move',m.id);
      clearDeleted110(m);
      m.audit=m.audit||[];m.audit.push({at:new Date().toISOString(),user:state.auth.email,action:'restore_move',mode:'server_tombstone_v110'});
      state.adminMoveStatus='active';localOnly110();render();
      try{toast('Move restaurada')}catch(_){}
      setTimeout(()=>{try{hydrateRemote?.()}catch(_){}},80);
    }catch(e){alert('No fue posible restaurar la Move.\n\n'+String(e?.message||e));}
  };
}

/* Runtime release identity. */
function stamp110(){
  
  
  
  
  
  
  const box=document.querySelector('.v5-admin-build');
  if(box){const b=box.querySelector('b');if(b)b.textContent='RigGO '+RELEASE;const s=box.querySelectorAll('span');if(s.length)s[s.length-1].textContent=BUILD;}
}
if(typeof render==='function'){
  const BASE_RENDER_110=render;
  render=function(){const out=BASE_RENDER_110.apply(this,arguments);requestAnimationFrame(stamp110);return out;};
}
setTimeout(stamp110,80);setTimeout(stamp110,500);


window.RigGOV110={
  release:RELEASE,build:BUILD,
  patchOfflineXlsxArrayMode,repaginateOps:repaginateOps110,flatChunks:flatChunks110,
  isAdmin:isAdmin110
};
})();

/* ===== SOURCE riggo-v111.js (consolidated) ===== */
/* RigGO 11.1 · Move Integrity C1
   Scope only:
   - no implicit demo Move in fresh state;
   - server deleted_at is authoritative in hydration;
   - blank/incomplete drafts are not persisted by autosave;
   - preserves RigGO 11.0 Template + OPS fixes and 18 Legacy history rows.
*/
(()=>{
'use strict';
const RELEASE='11.1.0-move-integrity-c1';
const BUILD='2026-08-17-2204-C1';
function stamp111(){
  
  
  
  
  
  
  const box=document.querySelector('.v5-admin-build');
  if(box){
    const b=box.querySelector('b');if(b)b.textContent='RigGO '+RELEASE;
    const spans=box.querySelectorAll('span');if(spans.length)spans[spans.length-1].textContent=BUILD;
  }
}
if(typeof render==='function'){
  const BASE_RENDER_111=render;
  render=function(){const out=BASE_RENDER_111.apply(this,arguments);requestAnimationFrame(stamp111);return out;};
}
setTimeout(stamp111,60);setTimeout(stamp111,400);

window.RigGOV111={release:RELEASE,build:BUILD};
})();

/* ===== SOURCE riggo-v112.js (consolidated) ===== */
/* RigGO 11.2 · Move Authority 2.0 / Offline Field Mode / Cache Authority
   Baseline: exact RigGO 11.1 handoff deployment.
   Scope: authority, offline persistence, traceability, desktop scroll, alias,
   active-Move reactions. Legacy history, mobile visual, OPS and Template stay intact. */
(()=>{
'use strict';
const RELEASE='12.0.1-execution-race-safety-c1';
const BUILD='2026-08-21-0835-C1';
const DB_NAME='riggo-field-v112';
const DB_VERSION=1;
const SNAPSHOT_STORE='snapshots';
const OUTBOX_STORE='outbox';
const SNAPSHOT_KEY='state';
const REACTIONS=['like','celebrate','fire','surprise','sad'];
const REACTION_ICON={like:'👍',celebrate:'🎉',fire:'🔥',surprise:'😮',sad:'😢'};
const SB=window.RigGOSupabase||null;
let dbPromise=null;
let flushBusy=false;
let hydrateBusy112=false;
let flushPromise112=null;
let hydratePromise112=null;
let bootPromise112=null;
let servicesPromise112=null;
let syncCyclePromise112=null;
let lastNetworkState=navigator.onLine?'online':'offline';
let lastSignatures=new Map();
let reactionsByMove=new Map();
let reactionsLoading=false;
let saveTimer112=null;
let snapshotTimer=null;
let localQueueTimer112=null;
let transportIssue112=false;
let syncError112=null;
let blockedReviewCount112=0;
let dirtyMoves112=new Map();
let hydrateRun112=0;
let hydrateDeferred112=false;
let hydrateDeferredTimer112=null;

const clone112=v=>{try{return structuredClone(v)}catch(_){return JSON.parse(JSON.stringify(v))}};
const uuid112=()=>{try{return crypto.randomUUID()}catch(_){return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=Math.random()*16|0,v=c==='x'?r:(r&3|8);return v.toString(16)})}};
const text112=v=>String(v??'').trim();
const lower112=v=>text112(v).toLowerCase();
const esc112=v=>typeof enc==='function'?enc(v):String(v??'').replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
const split112=v=>typeof splitEmails==='function'?splitEmails(v):String(v||'').split(/[;,\s]+/).map(x=>x.trim()).filter(Boolean);
const isOnline112=()=>navigator.onLine!==false;
const userEmail112=()=>lower112(state?.auth?.email||'');
const has112=p=>{try{return !!hasPerm(p)}catch(_){return false}};
const isAdmin112=()=>has112('admin');
const draftReady112=m=>{
  const rig=text112(m?.meta?.rig),op=text112(m?.meta?.operator),o=text112(m?.meta?.origin),d=text112(m?.meta?.destination);
  return !!rig&&lower112(rig)!=='rig'&&!!op&&!!o&&!!d;
};
const isDeleted112=m=>!!m?.management?.deletedAt;
function editorActive112(){const a=document.activeElement;return !!(a&&a.matches?.('input,textarea,select,[contenteditable="true"]'))}
function deferHydrateUntilEditorIdle112(){hydrateDeferred112=true}
document.addEventListener('focusout',()=>{if(!hydrateDeferred112)return;clearTimeout(hydrateDeferredTimer112);hydrateDeferredTimer112=setTimeout(()=>{if(editorActive112())return;hydrateDeferred112=false;if(state?.auth?.logged&&isOnline112()&&!document.documentElement.classList.contains('riggo-booting'))hydrate112().catch(()=>{})},320)},true);
function moveSetSignature112(list=[]){return (list||[]).map(m=>`${m?.id||''}:${fingerprint112(m)}`).sort().join('||')}
function userSetSignature112(list=[]){return JSON.stringify((list||[]).map(u=>({email:lower112(u?.email),name:text112(u?.name),alias:text112(u?.alias),active:!!u?.active,permissions:[...(u?.permissions||[])].sort()})).sort((a,b)=>a.email.localeCompare(b.email)))}

/* ---------- IndexedDB: full field snapshot + durable outbox ---------- */
function openDb112(){
  if(dbPromise)return dbPromise;
  dbPromise=new Promise((resolve,reject)=>{
    const r=indexedDB.open(DB_NAME,DB_VERSION);
    r.onupgradeneeded=()=>{
      const db=r.result;
      if(!db.objectStoreNames.contains(SNAPSHOT_STORE))db.createObjectStore(SNAPSHOT_STORE,{keyPath:'key'});
      if(!db.objectStoreNames.contains(OUTBOX_STORE))db.createObjectStore(OUTBOX_STORE,{keyPath:'key'});
    };
    r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);
  });
  return dbPromise;
}
async function idbPut112(store,value){const db=await openDb112();return new Promise((resolve,reject)=>{const tx=db.transaction(store,'readwrite');tx.objectStore(store).put(value);tx.oncomplete=()=>resolve(value);tx.onerror=()=>reject(tx.error)})}
async function idbGet112(store,key){const db=await openDb112();return new Promise((resolve,reject)=>{const tx=db.transaction(store,'readonly'),r=tx.objectStore(store).get(key);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function idbAll112(store){const db=await openDb112();return new Promise((resolve,reject)=>{const tx=db.transaction(store,'readonly'),r=tx.objectStore(store).getAll();r.onsuccess=()=>resolve(r.result||[]);r.onerror=()=>reject(r.error)})}
async function idbDelete112(store,key){const db=await openDb112();return new Promise((resolve,reject)=>{const tx=db.transaction(store,'readwrite');tx.objectStore(store).delete(key);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)})}
async function persistSnapshot112(){
  try{await idbPut112(SNAPSHOT_STORE,{key:SNAPSHOT_KEY,savedAt:new Date().toISOString(),state:clone112(state)})}catch(e){console.warn('RigGO 11.2 snapshot:',e)}
}
function scheduleSnapshot112(){clearTimeout(snapshotTimer);snapshotTimer=setTimeout(persistSnapshot112,80)}
const BASE_SAVE_LOCAL_112=typeof saveLocal==='function'?saveLocal:null;
if(BASE_SAVE_LOCAL_112)saveLocal=function(){const out=BASE_SAVE_LOCAL_112.apply(this,arguments);scheduleSnapshot112();return out;};
async function restoreSnapshot112({renderNow=true}={}){
  try{
    const snap=await idbGet112(SNAPSHOT_STORE,SNAPSHOT_KEY);
    if(!snap?.state)return false;
    const saved=clone112(snap.state),savedEmail=lower112(saved?.auth?.email||'');
    const currentEmail=lower112(state?.auth?.email||'');
    // Never cross-contaminate two different authenticated users on the same device.
    if(currentEmail&&savedEmail&&currentEmail!==savedEmail)return false;
    state={...freshState(),...saved};
    if(typeof v4Migrate==='function')try{v4Migrate()}catch(_){ }
    // 12.0: restored snapshots are cache only; boot never marks them as server writes.
    try{window.RigGOV120?.observeAll?.()}catch(_){};if(renderNow){render();setTimeout(postRender112,0)}
    return true;
  }catch(e){console.warn('RigGO 11.7 snapshot restore:',e);return false}
}

/* ---------- Server row conversion; 18 Legacy rows are never involved ---------- */
function dbStatus112(local){return local==='closed'?'completed':local}
function localStatus112(db){return db==='completed'?'closed':db}
function payloadForDb112(m){
  const c=clone112(m);delete c.syncMeta;delete c._offline;
  delete c.exec; delete c.execSyncMeta; return c;
}
function moveToRow112(m){
  return {
    id:m.id,rig:m.meta?.rig||'Rig',operator:m.meta?.operator||'',origin:m.meta?.origin||'',destination:m.meta?.destination||'',
    distance_km:Number(m.meta?.distanceKm)||0,projected_release:m.meta?.projectedRelease||null,actual_release:m.exec?.actualRelease||null,actual_acceptance:m.exec?.actualAcceptance||null,
    planned_days:Number(m.meta?.plannedDays)||0,move_company:m.meta?.moveCompany||'',support_company:m.meta?.supportCompany||'',status:dbStatus112(m.status||'draft'),
    access_mode:m.access?.mode==='assigned'?'assigned':'all',baseline_version:Number(m.baselineVersion)||1,
    mini_camp_enabled:!!m.scope?.mini,mini_camp_loads:Number(m.scope?.miniLoads)||0,mini_camp_units:Number(m.scope?.miniUnits)||0,
    camp_enabled:!!m.scope?.camp,camp_loads:Number(m.scope?.campLoads)||0,camp_units:Number(m.scope?.campUnits)||0,third_party_loads:Number(m.scope?.thirdLoads)||0,
    daily_to:split112(m.reportConfig?.dailyTo||''),daily_cc:split112(m.reportConfig?.dailyCc||''),f0065_to:split112(m.reportConfig?.f0065To||''),f0065_cc:split112(m.reportConfig?.f0065Cc||''),
    created_by:m.createdBy||userEmail112()||null,settings:{riggo_payload:payloadForDb112(m),format_version:2}
  }
}
function rowToMove112(r){
  const p=r.settings?.riggo_payload;
  let m=p?clone112(p):newMove(r.created_by||'');
  m.id=r.id;m.status=localStatus112(r.status||m.status||'draft');m.baselineVersion=r.baseline_version||m.baselineVersion||1;
  m.meta=m.meta||{};Object.assign(m.meta,{rig:r.rig||m.meta.rig,operator:r.operator??m.meta.operator,origin:r.origin??m.meta.origin,destination:r.destination??m.meta.destination,distanceKm:Number(r.distance_km??m.meta.distanceKm)||0,projectedRelease:r.projected_release||m.meta.projectedRelease||'',plannedDays:Number(r.planned_days??m.meta.plannedDays)||0,moveCompany:r.move_company??m.meta.moveCompany,supportCompany:r.support_company??m.meta.supportCompany});
  m.scope=m.scope||{};Object.assign(m.scope,{mini:!!r.mini_camp_enabled,miniLoads:r.mini_camp_loads||0,miniUnits:r.mini_camp_units||0,camp:!!r.camp_enabled,campLoads:r.camp_loads||0,campUnits:r.camp_units||0,thirdLoads:r.third_party_loads||0});
  m.access=m.access||{mode:'all',assignedEmails:[]};m.access.mode=r.access_mode||m.access.mode||'all';
  m.reportConfig=m.reportConfig||{};m.reportConfig.dailyTo=(r.daily_to||[]).join('; ');m.reportConfig.dailyCc=(r.daily_cc||[]).join('; ');m.reportConfig.f0065To=(r.f0065_to||[]).join('; ');m.reportConfig.f0065Cc=(r.f0065_cc||[]).join('; ');
  m.exec=m.exec||{};m.exec.actualRelease=r.actual_release||m.exec.actualRelease||'';m.exec.actualAcceptance=r.actual_acceptance||m.exec.actualAcceptance||'';m.exec.periods=[];
  m.createdBy=r.created_by||m.createdBy||'';m.createdAt=r.created_at||m.createdAt||'';
  m.management=m.management||{};
  if(r.deleted_at){m.management.deletedAt=r.deleted_at;m.management.deletedBy=r.deleted_by||''}else{delete m.management.deletedAt;delete m.management.deletedBy}
  m.syncMeta={revision:Number(r.revision)||1,createdAt:r.created_at||'',createdBy:r.created_by||'',updatedAt:r.updated_at||'',updatedBy:r.updated_by||r.created_by||'',logicalKey:r.logical_key||'',conflict:null,serverStatus:m.status};
  m.syncMeta.lastServerFingerprint=fingerprint112(m);
  m.syncMeta.lastServerRow=clone112(moveToRow112(m));
  return m;
}
function fingerprintRow112(row){
  const q=clone112(row||{});delete q.created_by;
  return JSON.stringify(q);
}
function fingerprint112(m){return fingerprintRow112(moveToRow112(m))}

/* ---------- sync safety: local unsynced state must never be overwritten ---------- */
function dirtyEntry112(m){
  if(!m||isDeleted112(m)||((m.status||'draft')==='draft'&&!draftReady112(m)))return null;
  const fp=fingerprint112(m),last=m.syncMeta?.lastServerFingerprint||lastSignatures.get(m.id)||'';
  return fp!==last?{fingerprint:fp,at:new Date().toISOString()}:null;
}
function markDirtyMove112(m){
  const d=dirtyEntry112(m);
  if(d)dirtyMoves112.set(m.id,d);
  else if(m?.id&&!m?.syncMeta?.conflict)dirtyMoves112.delete(m.id);
  return !!d;
}
function markDirtyAll112(){for(const m of state?.moves||[])markDirtyMove112(m)}
function protectedIds112(outbox=[]){
  const ids=new Set(outbox.map(x=>x.moveId).filter(Boolean));
  for(const id of dirtyMoves112.keys())ids.add(id);
  for(const m of state?.moves||[])if(m?.syncMeta?.conflict)ids.add(m.id);
  return ids;
}
function clearDirtyAfterAck112(m,item,current){
  if(!m||item?.type!=='save')return;
  const fp=fingerprint112(m);
  const hasNewer=current&&current.operationId!==item.operationId;
  if(!hasNewer&&fp===item.fingerprint){dirtyMoves112.delete(m.id);return;}
  dirtyMoves112.set(m.id,{fingerprint:fp,at:new Date().toISOString()});
}

/* ---------- connectivity badge ---------- */
function setBadge112(mode,text){
  const short=mode==='offline'?'Offline':mode==='syncing'?'Sync':mode==='conflict'||mode==='bad'?'Error':'Online';
  document.querySelectorAll('.online-sync').forEach(el=>{
    el.classList.remove('ok','bad','busy','v112-offline','v112-syncing','v112-conflict');
    const cls=mode==='offline'?'v112-offline':mode==='syncing'?'v112-syncing':mode==='conflict'?'v112-conflict':mode==='bad'?'bad':'ok';
    el.classList.add(cls);el.textContent=short;el.title=String(text||short);el.setAttribute('aria-label',String(text||short));
  });
}
function isTransportError112(e){
  if(navigator.onLine===false)return true;
  const msg=String(e?.message||e?.details||e?.hint||e||'');
  return /failed to fetch|networkerror|network request failed|load failed|timeout|connection (?:lost|reset|refused)|offline/i.test(msg);
}
function syncErrorText112(e){return String(e?.message||e?.details||e?.code||e||'Error de sincronización').slice(0,220)}
function ensureBadge112(){
  if(typeof document==='undefined')return;
  const a=document.querySelector('.top-actions');
  if(a&&!a.querySelector('.online-sync')){const s=document.createElement('span');s.className='online-sync';a.prepend(s)}
  const pending=window.RigGOV112?.pendingCount||0;
  if(!isOnline112()||transportIssue112)setBadge112('offline',pending?`Offline · ${pending} pendiente${pending===1?'':'s'}`:'Offline · trabajando localmente');
  else if(syncError112)setBadge112('bad',`Error de sincronización · ${syncError112}`);
  else if(flushBusy)setBadge112('syncing','Sincronizando…');
  else if(blockedReviewCount112)setBadge112('ok',`Online · ${blockedReviewCount112} operación${blockedReviewCount112===1?'':'es'} en cuarentena`);
  else setBadge112('ok','Online');
}

/* ---------- outbox ---------- */
async function queue112(record){await idbPut112(OUTBOX_STORE,record);await refreshPending112();return record}
async function refreshPending112(){
  try{const all=await idbAll112(OUTBOX_STORE);window.RigGOV112.pendingCount=all.length;blockedReviewCount112=all.filter(x=>x?.blockedCode&&!x?.retryApprovedAt).length;ensureBadge112();return all.length}catch(_){return 0}
}
async function queueSave112(m,opts={}){
  if(!m||m._resetInProgress||isDeleted112(m)||m?.syncMeta?.conflict||((m.status||'draft')==='draft'&&!draftReady112(m)))return;
  const force=!!opts.force,fp=fingerprint112(m),last=m.syncMeta?.lastServerFingerprint||lastSignatures.get(m.id)||'';
  if(!force&&fp===last&&!m.syncMeta?.conflict){dirtyMoves112.delete(m.id);return;}
  dirtyMoves112.set(m.id,{fingerprint:fp,at:new Date().toISOString()});
  const rec={key:`save:${m.id}`,type:'save',moveId:m.id,operationId:uuid112(),expectedRevision:opts.expectedRevision!=null?Number(opts.expectedRevision):Number(m.syncMeta?.revision)||0,row:moveToRow112(m),baseRow:clone112(opts.baseRow!==undefined?opts.baseRow:(m.syncMeta?.lastServerRow||null)),assignedEmails:[...(m.access?.assignedEmails||[])],fingerprint:fp,createdAt:new Date().toISOString(),forced:force};
  await queue112(rec);
}
async function queueDelete112(m){return queue112({key:`delete:${m.id}`,type:'delete',moveId:m.id,operationId:uuid112(),expectedRevision:Number(m.syncMeta?.revision)||0,createdAt:new Date().toISOString(),confirmedByUser:true,sourceBuild:'2026-08-22-1832-1216B-F4'})}
async function queueRestore112(m){return queue112({key:`restore:${m.id}`,type:'restore',moveId:m.id,operationId:uuid112(),expectedRevision:Number(m.syncMeta?.revision)||0,createdAt:new Date().toISOString()})}
async function discardLegacyDelete112(moveId){const key=`delete:${moveId}`,rec=await idbGet112(OUTBOX_STORE,key);if(!rec)return{ok:true,missing:true,moveId};if(rec.type!=='delete'||rec.confirmedByUser)return{ok:false,code:'not_legacy_delete',moveId};await idbDelete112(OUTBOX_STORE,key);syncError112=null;await refreshPending112();ensureBadge112();return{ok:true,discarded:true,moveId}}
async function retryBlockedSave112(moveId){const key=`save:${moveId}`,rec=await idbGet112(OUTBOX_STORE,key);if(!rec)return{ok:false,code:'missing',moveId};if(rec.type!=='save')return{ok:false,code:'not_save',moveId};delete rec.blockedCode;delete rec.blockedAt;delete rec.lastError;rec.retryApprovedAt=new Date().toISOString();rec.operationId=uuid112();await idbPut112(OUTBOX_STORE,rec);syncError112=null;await refreshPending112();ensureBadge112();return syncCycle112()}
async function discardBlockedSave112(moveId){const key=`save:${moveId}`,rec=await idbGet112(OUTBOX_STORE,key);if(!rec)return{ok:true,missing:true,moveId};if(rec.type!=='save'||!rec.blockedCode)return{ok:false,code:'not_blocked_save',moveId};await idbDelete112(OUTBOX_STORE,key);syncError112=null;await refreshPending112();ensureBadge112();return{ok:true,discarded:true,moveId}}
function localMove112(id){return state.moves.find(x=>x.id===id)}
function stampTrace112(m,data={}){
  if(!m)return;m.syncMeta=m.syncMeta||{};
  if(data.revision!=null)m.syncMeta.revision=Number(data.revision)||m.syncMeta.revision||1;
  if(data.updated_at)m.syncMeta.updatedAt=data.updated_at;if(data.updated_by)m.syncMeta.updatedBy=data.updated_by;
  if(data.logical_key)m.syncMeta.logicalKey=data.logical_key;
  if(data.created_at)m.syncMeta.createdAt=data.created_at;if(data.created_by)m.syncMeta.createdBy=data.created_by;
  if(m._offline?.localDraftPending){delete m._offline.localDraftPending;delete m._offline.localDraftSince;if(!Object.keys(m._offline).length)delete m._offline}
  m.syncMeta.conflict=null;m.syncMeta.lastServerFingerprint=data.serverFingerprint||fingerprint112(m);
  m.syncMeta.lastServerRow=clone112(data.serverRow||moveToRow112(m));
  lastSignatures.set(m.id,m.syncMeta.lastServerFingerprint);
}
async function rpc112(name,args){if(!SB)throw new Error('Supabase no disponible.');const {data,error}=await SB.rpc(name,args);if(error){transportIssue112=isTransportError112(error);if(!transportIssue112)syncError112=syncErrorText112(error);throw error}transportIssue112=false;syncError112=null;return data}
function same112(a,b){try{return JSON.stringify(a)===JSON.stringify(b)}catch(_){return a===b}}
function merge3Way112(base,local,remote){
  if(same112(local,base))return clone112(remote);
  if(same112(remote,base))return clone112(local);
  if(Array.isArray(local)||Array.isArray(remote)||Array.isArray(base))return clone112(local);
  const obj=x=>x&&typeof x==='object'&&!Array.isArray(x);
  if(obj(local)&&obj(remote)&&obj(base)){
    const out={},keys=new Set([...Object.keys(base),...Object.keys(local),...Object.keys(remote)]);
    for(const k of keys)out[k]=merge3Way112(base[k],local[k],remote[k]);
    return out;
  }
  // If both users changed the same scalar path, preserve this device's explicit field work.
  return clone112(local);
}
async function fetchServerMove112(id){
  const {data,error}=await SB.from('moves').select('*').eq('id',id).maybeSingle();
  if(error)throw error;return data||null;
}
async function rebaseSave112(item,conflict){
  const raw=await fetchServerMove112(item.moveId);
  if(!raw)return false;
  if(raw.deleted_at){
    const m=localMove112(item.moveId);if(m){m.management=m.management||{};m.management.deletedAt=raw.deleted_at;m.management.deletedBy=raw.deleted_by||'';m.syncMeta=m.syncMeta||{};m.syncMeta.revision=Number(raw.revision)||1;}
    await idbDelete112(OUTBOX_STORE,item.key);return false;
  }
  const remoteMove=rowToMove112(raw),remoteRow=moveToRow112(remoteMove);
  const base=item.baseRow||remoteRow;
  let desired=merge3Way112(base,item.row,remoteRow);
  /* 12.1 master rebase: execution is separate; no legacy recovery merge. */
  const m=localMove112(item.moveId);
  if(m){
    // 12.0.1: a MASTER revision conflict may update route/metadata, but it has zero
    // authority over execution. Preserve the entire execution graph verbatim while
    // rebasing the master row; execution is reconciled separately by RigGOV120.
    const liveExec=clone112(m.exec||{}),liveExecSyncMeta=clone112(m.execSyncMeta||{});
    const rebasedMove=rowToMove112({...raw,...desired,revision:raw.revision,updated_at:raw.updated_at,updated_by:raw.updated_by,created_at:raw.created_at,created_by:raw.created_by,logical_key:raw.logical_key});
    Object.keys(m).forEach(k=>delete m[k]);Object.assign(m,rebasedMove);m.exec=liveExec;m.execSyncMeta=liveExecSyncMeta;
    m.syncMeta=m.syncMeta||{};
    m.syncMeta.revision=Number(raw.revision)||Number(conflict?.server_revision)||1;
    m.syncMeta.createdAt=raw.created_at||m.syncMeta.createdAt||'';m.syncMeta.createdBy=raw.created_by||m.syncMeta.createdBy||'';
    m.syncMeta.updatedAt=raw.updated_at||'';m.syncMeta.updatedBy=raw.updated_by||raw.created_by||'';m.syncMeta.logicalKey=raw.logical_key||'';
    m.syncMeta.lastServerFingerprint=fingerprint112(remoteMove);m.syncMeta.lastServerRow=clone112(remoteRow);m.syncMeta.conflict=null;
    lastSignatures.set(m.id,m.syncMeta.lastServerFingerprint);
  }
  item.expectedRevision=Number(raw.revision)||Number(conflict?.server_revision)||1;
  item.operationId=uuid112();item.row=desired;item.baseRow=clone112(remoteRow);
  item.fingerprint=JSON.stringify((()=>{const q=clone112(desired);delete q.created_by;return q})());
  item.rebasedAt=new Date().toISOString();item.rebaseCount=Number(item.rebaseCount||0)+1;
  await idbPut112(OUTBOX_STORE,item);return true;
}
async function flushOutboxCore112(){
  if(!isOnline112()||!state?.auth?.logged||!SB)return {ok:false,offline:true,transportFailure:!isOnline112(),processed:0};
  flushBusy=true;syncError112=null;setBadge112('syncing','Sincronizando cambios de campo…');
  let transportFailure=false,blocked=false,processed=0,round=0;
  const blockedKeys=new Set();
  try{
    // 11.4: a rejected operation for one Move must NEVER stop other Moves.
    // Only a true transport failure can stop the whole drain.
    while(round++<10){
      const all=(await idbAll112(OUTBOX_STORE)).sort((a,b)=>String(a.createdAt).localeCompare(String(b.createdAt)));
      const items=all.filter(x=>!blockedKeys.has(x.key));
      if(!items.length)break;
      let roundProgress=0;
      for(const original of items){
        if(original?.blockedCode&&!original?.retryApprovedAt){blockedKeys.add(original.key);blocked=true;continue;}
        let item=clone112(original),data=null,attempt=0,itemBlocked=false;
        while(attempt<3){
          if(item.type==='delete'&&!item.confirmedByUser){
            syncError112='Hay una eliminación pendiente creada por una versión anterior. C4 FIX2 la dejó en cuarentena y NO la enviará sin nueva confirmación.';
            item.blockedCode='legacy_delete_requires_reconfirm';item.lastError=syncError112;item.blockedAt=item.blockedAt||new Date().toISOString();await idbPut112(OUTBOX_STORE,item);itemBlocked=true;blocked=true;break;
          }
          try{
            if(item.type==='save')data=await rpc112('riggo_move_save_v2',{p_move:item.row,p_expected_revision:item.expectedRevision,p_operation_id:item.operationId,p_assigned_emails:item.assignedEmails||[]});
            else if(item.type==='delete')data=await rpc112('riggo_move_delete_v2',{p_move_id:item.moveId,p_expected_revision:item.expectedRevision,p_operation_id:item.operationId});
            else if(item.type==='restore')data=await rpc112('riggo_move_restore_v2',{p_move_id:item.moveId,p_expected_revision:item.expectedRevision,p_operation_id:item.operationId});
            else{await idbDelete112(OUTBOX_STORE,item.key);data={ok:true,discarded:true};break}
          }catch(e){
            if(isTransportError112(e)){transportIssue112=true;transportFailure=true;console.warn('RigGO sync network:',e);break}
            transportIssue112=false;syncError112=syncErrorText112(e);data={ok:false,code:e?.code||'rpc_error',message:e?.message||String(e),details:e?.details||'',serverError:true};itemBlocked=true;blocked=true;console.warn('RigGO sync server:',e);break
          }
          if(data?.ok)break;
          if(item.type==='save'&&data?.code==='revision_conflict'&&attempt<2){
            try{
              const rebased=await rebaseSave112(item,data);
              if(!rebased){itemBlocked=true;blocked=true;break}
              item=await idbGet112(OUTBOX_STORE,item.key)||item;attempt++;setBadge112('syncing','Reconciliando Move…');continue;
            }catch(e){
              if(isTransportError112(e)){transportIssue112=true;transportFailure=true;console.warn('RigGO rebase network:',e);break}
              transportIssue112=false;syncError112=syncErrorText112(e);blocked=true;itemBlocked=true;console.warn('RigGO rebase server:',e);break
            }
          }
          break;
        }
        if(transportFailure)break;
        const current=await idbGet112(OUTBOX_STORE,item.key);
        if(data?.ok){
          processed++;roundProgress++;transportIssue112=false;
          const m=localMove112(item.moveId);
          if(m){
            if(item.type==='delete'){m.management=m.management||{};m.management.deletedAt=data.deleted_at||new Date().toISOString();m.management.deletedBy=data.deleted_by||userEmail112()}
            if(item.type==='restore'){m.management=m.management||{};delete m.management.deletedAt;delete m.management.deletedBy}
            stampTrace112(m,{revision:data.revision,updated_at:data.updated_at||data.deleted_at,updated_by:data.updated_by||data.deleted_by,logical_key:data.logical_key,serverFingerprint:item.type==='save'?item.fingerprint:undefined,serverRow:item.type==='save'?item.row:undefined});
            clearDirtyAfterAck112(m,item,current);
          }
          if(current?.operationId===item.operationId){
            await idbDelete112(OUTBOX_STORE,item.key);
            if(m&&item.type==='save'&&fingerprint112(m)!==item.fingerprint)await queueSave112(m);
          }else if(current?.type==='save'&&item.type==='save'){
            current.expectedRevision=Number(data.revision)||current.expectedRevision;
            current.baseRow=clone112(item.row);
            await idbPut112(OUTBOX_STORE,current);
          }
          continue;
        }
        if(data?.code==='duplicate_open_move'){
          const m=localMove112(item.moveId);
          if(m){m.management=m.management||{};m.management.deletedAt=new Date().toISOString();m.management.deletedBy='duplicate-guard@riggo.online';m.management.duplicateOf=data.existing_move_id||'';m.syncMeta=m.syncMeta||{};m.syncMeta.conflict={code:data.code,message:data.message||'Ya existe una Move abierta equivalente.',existingMoveId:data.existing_move_id||null};dirtyMoves112.delete(m.id)}
          await idbDelete112(OUTBOX_STORE,item.key);roundProgress++;try{toast(data.message||'Ya existe una Move abierta equivalente.')}catch(_){ }
          continue;
        }
        if(data?.code==='move_deleted'){
          const m=localMove112(item.moveId);if(m){m.management=m.management||{};m.management.deletedAt=data.deleted_at||new Date().toISOString();m.syncMeta=m.syncMeta||{};m.syncMeta.revision=Number(data.server_revision)||m.syncMeta.revision||1;dirtyMoves112.delete(m.id)}
          await idbDelete112(OUTBOX_STORE,item.key);roundProgress++;try{toast('La Move fue eliminada en servidor.')}catch(_){ }
          continue;
        }
        if(data?.code==='revision_conflict'){
          blocked=true;itemBlocked=true;const m=localMove112(item.moveId);if(m){m.syncMeta=m.syncMeta||{};m.syncMeta.conflict={code:data.code,message:data.message||'Conflicto de sincronización',serverRevision:data.server_revision||null};dirtyMoves112.set(m.id,{fingerprint:fingerprint112(m),at:new Date().toISOString()})}
        }else{
          blocked=true;itemBlocked=true;syncError112=String(data?.message||data?.error||data?.code||'Operación rechazada').slice(0,220);console.warn('RigGO sync rejected:',data);
        }
        if(itemBlocked){
          blockedKeys.add(item.key);
          if(current?.operationId===item.operationId){current.blockedAt=new Date().toISOString();current.blockedCode=data?.code||'server_rejected';current.lastError=data?.message||data?.error||'Operación pendiente';await idbPut112(OUTBOX_STORE,current)}
          // Continue with the next Move instead of head-of-line blocking the whole field queue.
          continue;
        }
        try{saveLocal()}catch(_){ }scheduleSnapshot112();
      }
      if(transportFailure)break;
      const remaining=await idbAll112(OUTBOX_STORE);
      if(!remaining.length)break;
      if(!roundProgress&&remaining.every(x=>blockedKeys.has(x.key)))break;
    }
  }finally{flushBusy=false;await refreshPending112();if(isOnline112()&&!transportFailure)ensureBadge112()}
  return {ok:!transportFailure,transportFailure,blocked,processed,pending:await refreshPending112()};
}
function flushOutbox112(){
  // Single-flight coordinator: callers WAIT for the current flush; they never get
  // a synthetic "busy" failure that forces the user to retry manually.
  if(flushPromise112)return flushPromise112;
  flushPromise112=flushOutboxCore112().finally(()=>{flushPromise112=null});
  return flushPromise112;
}

/* ---------- authoritative hydration: server + pending local operations ---------- */
async function loadAssignments112(moves){
  if(!SB||!moves.length)return;
  const ids=moves.map(x=>x.id),{data,error}=await SB.from('move_assignments').select('move_id,email').in('move_id',ids);if(error)throw error;
  const map={};(data||[]).forEach(x=>(map[x.move_id]||(map[x.move_id]=[])).push(lower112(x.email)));
  moves.forEach(m=>{m.access=m.access||{};m.access.assignedEmails=map[m.id]||[]});
}
function userFromRow112(r){
  const permissions=[];if(r.can_plan)permissions.push('plan');if(r.can_execute)permissions.push('execute');if(r.can_overall)permissions.push('overall');if(r.can_admin)permissions.push('admin');
  return {email:lower112(r.email),name:r.display_name||r.email,alias:text112(r.alias),active:!!r.active,permissions};
}
async function hydrateCore112(){
  if(!state?.auth?.logged)return {ok:false,auth:false};
  if(!isOnline112()||!SB){ensureBadge112();return {ok:false,offline:true}}
  // Background reconciliation must never destroy an editor that currently owns
  // focus. A field operator finishes typing first; reconciliation resumes on blur.
  if(!document.documentElement.classList.contains('riggo-booting')&&(editorActive112()||window.__RIGGO_MEDIA_PICKER_ACTIVE__||window.__RIGGO_FIELD_COMMIT_PENDING__)){
    deferHydrateUntilEditorIdle112();ensureBadge112();return {ok:true,deferred:true,reason:window.__RIGGO_MEDIA_PICKER_ACTIVE__?'media-picker':'active-editor'};
  }
  const beforeMovesSignature=moveSetSignature112(state.moves||[]),beforeUsersSignature=userSetSignature112(state.users||[]);
  const run=++hydrateRun112;hydrateBusy112=true;setBadge112('syncing','Verificando integridad de ejecución…');
  try{
    /* 11.6 READ-FIRST CUTOVER.
       Never push a restored snapshot before learning what Supabase already knows.
       A deployment/reload is therefore incapable of downgrading an ACTIVE Move
       merely because the device restored an older READY snapshot. */
    const [{data:users,error:ue},{data:rows,error:me}]=await Promise.all([
      SB.from('access_list').select('*').order('email'),
      SB.from('moves').select('*').order('updated_at',{ascending:false})
    ]);if(ue)throw ue;if(me)throw me;if(run!==hydrateRun112)return {ok:false,superseded:true};

    const rawById=new Map((rows||[]).map(r=>[r.id,r]));
    const serverMoves=(rows||[]).map(rowToMove112);await loadAssignments112(serverMoves);
    const recovery={ok:true,recovered:0,days:0,authority:'disabled-12.1'};
    if(run!==hydrateRun112)return {ok:false,superseded:true};

    const pending=await idbAll112(OUTBOX_STORE),localNow=new Map((state.moves||[]).map(m=>[m.id,m]));
    const serverById=new Map(serverMoves.map(m=>[m.id,m]));

    /* Sanitize durable save items BEFORE any flush. Route/destination/report edits
       may remain local, but richer server execution is merged into the payload. */
    for(const item0 of pending){
      if(item0?.type!=='save')continue;const remote=serverById.get(item0.moveId),raw=rawById.get(item0.moveId);if(!remote||!raw)continue;
      const remoteRow=moveToRow112(remote),safe=item0.row;
      if(!same112(safe,item0.row)||Number(item0.expectedRevision)!==Number(raw.revision||0)){
        item0.row=safe;item0.expectedRevision=Number(raw.revision)||1;item0.baseRow=clone112(remoteRow);item0.operationId=uuid112();item0.fingerprint=fingerprintRow112(safe);item0.integrityRebasedAt=new Date().toISOString();await idbPut112(OUTBOX_STORE,item0);
      }
    }

    const pendingNow=await idbAll112(OUTBOX_STORE),protectedIds=protectedIds112(pendingNow),byId=new Map(serverById);
    let queuedReconcile=false;
    for(const [id,local] of localNow){
      const remote=serverById.get(id),raw=rawById.get(id);
      if(!remote){const pendingCreate=pendingNow.some(x=>x?.moveId===id&&x?.type==='save'&&Number(x?.expectedRevision||0)===0),localCreateIntent=!!local?._offline?.localDraftPending;if(pendingCreate||localCreateIntent)byId.set(id,local);else dirtyMoves112.delete(id);continue}
      const lr=Number(local?.syncMeta?.revision)||0,rr=Number(raw?.revision)||Number(remote?.syncMeta?.revision)||0;
      const cmp=0;
      const hasLocalWork=protectedIds.has(id);
      if(hasLocalWork){
        // Preserve non-execution local work, but merge richer server execution into it.
        const localRow=moveToRow112(local),remoteRow=moveToRow112(remote),safeRow=localRow;
        const rebuilt=rowToMove112({...raw,...safeRow,revision:rr,updated_at:raw.updated_at,updated_by:raw.updated_by,created_at:raw.created_at,created_by:raw.created_by,logical_key:raw.logical_key});
        byId.set(id,rebuilt);
        rebuilt.syncMeta.revision=rr;rebuilt.syncMeta.lastServerRow=clone112(remoteRow);rebuilt.syncMeta.lastServerFingerprint=fingerprint112(remote);lastSignatures.set(id,rebuilt.syncMeta.lastServerFingerprint);
        markDirtyMove112(rebuilt);await queueSave112(rebuilt,{force:true,expectedRevision:rr,baseRow:remoteRow});queuedReconcile=true;continue;
      }
      // 12.0: without an explicit durable outbox operation, server wins.
      byId.set(id,remote);
    }

    // 12.0: recovery evidence may enrich the view, but boot never writes a repair.

    // 12.0.1: master hydration owns master metadata ONLY. Execution is a separate
    // Supabase authority and must never be erased while the execution layer is loading.
    const priorExecById=new Map((state.moves||[]).map(m=>[m.id,{exec:clone112(m.exec||{}),execSyncMeta:clone112(m.execSyncMeta||{})}]));
    const nextUsers=(users||[]).map(userFromRow112),nextMoves=[...byId.values()];
    for(const m of nextMoves){const prior=priorExecById.get(m.id);if(prior){m.exec=prior.exec;m.execSyncMeta=prior.execSyncMeta}}
    const movesChanged=beforeMovesSignature!==moveSetSignature112(nextMoves),usersChanged=beforeUsersSignature!==userSetSignature112(nextUsers);
    if(movesChanged||usersChanged){
      state.users=nextUsers;state.moves=nextMoves;
      const hist=seedHistory();state.moves.filter(m=>m.status==='closed'&&m.exec?.actualRelease&&m.exec?.actualAcceptance).forEach(m=>{try{hist.push(closeoutHistoryRow(m))}catch(_){ }});state.history=hist;
      try{saveLocal()}catch(_){ }scheduleSnapshot112();
    }else{
      // Keep the existing object graph alive so active DOM handlers, cursors and
      // keyboard focus are not invalidated by a no-op background hydrate. Only
      // refresh server metadata in place.
      const nextById=new Map(nextMoves.map(m=>[m.id,m]));for(const m of state.moves||[]){const n=nextById.get(m.id);if(n?.syncMeta)m.syncMeta=clone112(n.syncMeta)}
      state.users=nextUsers;
    }

    // Only now may local operations be sent. All save records have already been
    // protected against execution regression using the current server revision.
    const flushResult=await flushOutbox112();if(flushResult?.transportFailure){transportIssue112=true;ensureBadge112();return {...flushResult,recovery}}
    remoteOnline=true;transportIssue112=false;const remaining=await refreshPending112(),execRemaining=window.RigGOV120?.pendingCount?await window.RigGOV120.pendingCount().catch(()=>0):0,totalPending=remaining+execRemaining,activePending=Math.max(0,totalPending-blockedReviewCount112);if(syncError112)setBadge112('bad',`Error de sincronización · ${syncError112}`);else if(activePending)setBadge112('syncing','Pendiente de sincronización');else setBadge112('ok',blockedReviewCount112?`Online · ${blockedReviewCount112} operación${blockedReviewCount112===1?'':'es'} en cuarentena`:'Online');
    // Recovery is maintenance, not a recurring user notification. Diagnostics remain
    // available for support without stealing focus or generating toast storms.
    window.__RIGGO_LAST_RECOVERY__=recovery||null;
    return {ok:true,protected:protectedIds.size,pending:remaining,recovery,queuedReconcile,movesChanged,usersChanged};
  }catch(e){const transport=isTransportError112(e);remoteOnline=!transport;transportIssue112=transport;if(!transport)syncError112=syncErrorText112(e);console.error('RigGO 11.7 hydrate:',e);setBadge112(transport?'offline':'bad',transport?'Offline · trabajando localmente':`Error de sincronización · ${syncError112}`);return {ok:false,error:e,transportFailure:transport,serverFailure:!transport}}
  finally{hydrateBusy112=false}
}
function hydrate112(){
  if(hydratePromise112)return hydratePromise112;
  hydratePromise112=hydrateCore112().then(async r=>{
    let execution=null;
    if(r?.ok&&window.RigGOV120?.hydrateExecution)execution=await window.RigGOV120.hydrateExecution({renderNow:false});
    // Render only after BOTH master and execution authorities are reconciled. This
    // prevents a transient master-only frame from replacing tasks/loads in the UI.
    if(r?.ok&&(r.movesChanged||r.usersChanged||execution?.changed)){try{render();setTimeout(postRender112,0)}catch(_){}}
    return {...r,execution};
  }).finally(()=>{hydratePromise112=null});
  return hydratePromise112;
}
try{hydrateRemote=hydrate112}catch(_){}

/* ---------- override general save: durable local first, server operations second ---------- */
const BASE_SAVE_112=typeof save==='function'?save:null;
save=function(){
  // Mark changed Moves BEFORE any debounce/network await. This closes the race
  // where an already-running hydrate could otherwise apply a stale server row.
  if(state?.auth?.logged)
  try{saveLocal()}catch(_){};scheduleSnapshot112();
  if(state?.auth?.logged){
    clearTimeout(saveTimer112);saveTimer112=setTimeout(async()=>{
      for(const m of state.moves||[])await queueSave112(m);
      if(isOnline112())await flushOutbox112();
    },220);
  }
};
async function syncMoveNow112(m,{maxPasses=6}={}){
  if(!m)return {ok:false,message:'Move no disponible.'};
  markDirtyMove112(m);try{saveLocal()}catch(_){ }scheduleSnapshot112();await queueSave112(m);
  if(!isOnline112())return {ok:false,offline:true,pending:true};
  let last=null;
  for(let pass=0;pass<maxPasses;pass++){
    last=await flushOutbox112();
    if(last?.transportFailure||!isOnline112())return {ok:false,offline:true,pending:true,transportFailure:true};
    const pending=await idbGet112(OUTBOX_STORE,`save:${m.id}`);
    if(!pending&&!m.syncMeta?.conflict){
      dirtyMoves112.delete(m.id);return {ok:true,synced:true,pending:false,revision:Number(m.syncMeta?.revision)||0};
    }
    if(m.syncMeta?.conflict&&pass<maxPasses-1){
      // Pull the authoritative revision and rebase instead of making the user retry.
      const raw=await fetchServerMove112(m.id);
      if(raw?.deleted_at)return {ok:false,deleted:true,pending:false};
      if(raw){
        const remote=rowToMove112(raw),remoteRow=moveToRow112(remote);
        m.syncMeta=m.syncMeta||{};m.syncMeta.revision=Number(raw.revision)||1;m.syncMeta.lastServerFingerprint=fingerprint112(remote);m.syncMeta.lastServerRow=clone112(remoteRow);m.syncMeta.conflict=null;lastSignatures.set(m.id,m.syncMeta.lastServerFingerprint);
        markDirtyMove112(m);await queueSave112(m);continue;
      }
    }
    if(pending)continue;
  }
  const pending=await idbGet112(OUTBOX_STORE,`save:${m.id}`);
  return {ok:!pending&&!m.syncMeta?.conflict,synced:!pending&&!m.syncMeta?.conflict,pending:!!pending,conflict:!!m.syncMeta?.conflict,detail:m.syncMeta?.conflict||last};
}
window.RigGOV112PersistNow=syncMoveNow112;

/* Existing v59 reset/rollback can call this through a tiny compatibility hook. */
window.RigGOV112PersistNowMove=window.RigGOV112PersistNow;

/* ---------- Start Move: priority local commit, then background server ACK ---------- */
async function startMove112(m,actualRelease){
  if(!m||!actualRelease)throw new Error('Rig Release real requerido.');
  if(!SB||!isOnline112())throw new Error('Se requiere conexión para iniciar una Move por primera vez.');
  const expected=Number(m.syncMeta?.revision)||0,op=uuid112();
  const data=await rpc112('riggo_activate_move_v2',{p_move_id:m.id,p_actual_release:actualRelease,p_expected_revision:expected,p_operation_id:op});
  if(!data?.ok)throw new Error(data?.message||data?.code||'No fue posible iniciar la Move.');
  window.RigGOV120?.setActivated?.(m,data,actualRelease);
  m.status='active';m.syncMeta=m.syncMeta||{};m.syncMeta.serverStatus='active';m.syncMeta.revision=Number(data.master_revision||data.revision||m.syncMeta.revision||1);
  m.audit=m.audit||[];m.audit.push({at:new Date().toISOString(),user:userEmail112(),action:'start_move',actualRelease,mode:'atomic_server_121'});
  saveLocal();scheduleSnapshot112();return data;
}
if(typeof showStartMoveSheet==='function'){
  showStartMoveSheet=function(m){
    sheetRoot.innerHTML=`<div class="sheet-backdrop"><div class="sheet"><div class="sheet-handle"></div><h2>Iniciar Move · ${esc112(m.meta.rig)}</h2><div class="sheet-sub">${esc112(m.meta.origin)} → ${esc112(m.meta.destination)}</div><div class="grid g2"><label>Rig Release planificado<input class="field" value="${fmtDate(m.meta.projectedRelease,true)}" disabled></label><label>Rig Release real<input id="startActualRelease" class="field" type="datetime-local" value="${toInput(new Date())}"></label></div><div class="sheet-footer"><button class="btn" id="cancelSheet">Cancelar</button><button class="btn primary" id="confirmStart">Iniciar Move</button></div></div></div>`;
    $('cancelSheet').onclick=closeSheet;
    $('confirmStart').onclick=async()=>{const btn=$('confirmStart');
      const v=$('startActualRelease').value;if(!v)return;const actual=inputToIso(v);
      try{btn.disabled=true;await startMove112(m,actual);closeSheet();state.screen='execute';render();}catch(e){alert(e.message||e)}finally{btn.disabled=false}
    };
  };
}

/* ---------- delete/restore: local immediately, server queued atomically ---------- */
if(typeof v4DeleteMove==='function'){
  v4DeleteMove=async function(m){
    if(!m||!isAdmin112()){try{toast('Esta acción es exclusiva de Administradores.')}catch(_){};return}
    if(!confirm(`Eliminar ${m.meta?.rig||'esta Move'}?\n\nLa eliminación quedará protegida en servidor y no podrá ser recreada por una sesión antigua.`))return;
    m.management=m.management||{};m.management.deletedAt=new Date().toISOString();m.management.deletedBy=userEmail112();m.audit=m.audit||[];m.audit.push({at:new Date().toISOString(),user:userEmail112(),action:'delete_move',mode:'authority_v112'});
    if(state.selectedMoveId===m.id)state.selectedMoveId=null;state.screen='admin';state.adminMoveView='moves';state.adminMoveStatus='active';
    try{saveLocal()}catch(_){};scheduleSnapshot112();await queueDelete112(m);render();try{toast(isOnline112()?'Eliminando Move…':'Move eliminada localmente · pendiente de sincronización')}catch(_){};if(isOnline112()){await flushOutbox112();await hydrate112()}
  };
}
if(typeof v4RestoreMove==='function'){
  v4RestoreMove=async function(m){
    if(!m||!isAdmin112())return;
    m.management=m.management||{};const wasDeleted=!!m.management.deletedAt;
    delete m.management.deletedAt;delete m.management.deletedBy;delete m.management.archivedAt;delete m.management.archivedBy;
    try{saveLocal()}catch(_){};scheduleSnapshot112();
    if(wasDeleted)await queueRestore112(m);else await queueSave112(m);
    render();
    if(isOnline112()){await flushOutbox112();if(wasDeleted){await queueSave112(m);await flushOutbox112()}await hydrate112()}
  };
}

/* ---------- Offline Daily Report close / deferred OPS upload ---------- */
const BASE_ARCHIVE_CLOSE_112=typeof v4ArchiveClose==='function'?v4ArchiveClose:null;
if(BASE_ARCHIVE_CLOSE_112){
  v4ArchiveClose=async function(m,p,c){
    if(isOnline112()){
      const out=await BASE_ARCHIVE_CLOSE_112(m,p,c);
      // Closing a day is a strong commit point. Do not leave the master Move READY
      // while its report rows/OPS are already committed.
      const sync=await syncMoveNow112(m);
      if(!sync?.synced){c.masterMovePendingSync=true;try{toast('Día cerrado · sincronizando estado de la Move…')}catch(_){ }}else delete c.masterMovePendingSync;
      scheduleSnapshot112();
      return out;
    }
    if(!c.f0065ReviewedAt)throw new Error('Primero debes revisar el OPS-F0065-S.');
    const validation=typeof validateClosure==='function'?validateClosure(c,p):{ok:true,missing:[]};
    if(!validation.ok)throw new Error('Completa antes de cerrar: '+validation.missing.join(', '));
    c.closedAt=c.closedAt||nowIso();c.closedBy=c.closedBy||userEmail112();c.reportStep=6;c.reportVisited=c.reportVisited||{};c.reportVisited[5]=true;c.offlinePendingOpsUpload=true;c.masterMovePendingSync=true;
    m.audit=m.audit||[];m.audit.push({at:c.closedAt,user:userEmail112(),action:'close_day_offline',period:p.id,cutoff:p.cutoffTime});
    save();
    try{toast(`Día ${p.index} cerrado localmente · OPS pendiente de sincronización`)}catch(_){ }
    return true;
  };
}
async function syncPendingReports112(){
  if(!isOnline112()||!state?.auth?.logged)return {ok:false,offline:!isOnline112(),processed:0,failed:0};
  let processed=0,failed=0;
  for(const m of state.moves||[]){
    for(const [pid,c] of Object.entries(m.exec?.closures||{})){
      if(!c?.offlinePendingOpsUpload)continue;
      const p=(typeof movePeriods==='function'?movePeriods(m):[]).find(x=>x.id===pid);if(!p)continue;
      try{
        const finalSync=window.RigGO?.actions?.syncClosedDay;
        if(typeof finalSync==='function')await finalSync(m,p,c,{background:true});
        else if(BASE_ARCHIVE_CLOSE_112)await BASE_ARCHIVE_CLOSE_112(m,p,c);
        else throw new Error('OPS sync authority no disponible.');
        delete c.offlinePendingOpsUpload;processed++;try{saveLocal()}catch(_){};scheduleSnapshot112();
      }catch(e){
        failed++;c.offlinePendingOpsUpload=true;c.opsSyncLastError=String(e?.message||e);c.opsSyncRetryAt=new Date().toISOString();
        console.warn('RigGO deferred OPS:',m.id,pid,e);
        // Never head-of-line block other Moves/reports. Continue with the rest.
      }
    }
  }
  if(failed)setBadge112('bad','OPS pendiente');
  return {ok:failed===0,processed,failed};
}
const BASE_SEND_DAILY_112=typeof sendDailyReport==='function'?sendDailyReport:null;
async function verifyMoveBeforeEmail112(m){
  if(!isOnline112())return {ok:false,offline:true,message:'Sin conexión. El Día y el OPS están guardados; el email se podrá enviar cuando vuelva la señal.'};
  // Strong commit: this function WAITS for any background flush and drains newer
  // edits too. The user never receives a "busy, try again" message.
  for(let pass=0;pass<3;pass++){
    const sync=await syncMoveNow112(m,{maxPasses:6});
    if(sync?.offline)return {ok:false,offline:true,message:'Se perdió la conexión durante el envío. Tus cambios siguen guardados localmente.'};
    if(!sync?.synced){if(pass<2)continue;return {ok:false,message:'RigGO no pudo confirmar la Move en servidor. Los cambios siguen guardados; revisa el indicador de sincronización.'}}
    const raw=await fetchServerMove112(m.id);if(!raw)return {ok:false,message:'La Move no existe en servidor.'};
    const st=localStatus112(raw.status||'');
    const releaseOk=!!raw.actual_release;
    const a=new Date(raw.actual_release||'').getTime(),b=new Date(m.exec?.actualRelease||'').getTime();
    const releaseMatch=!Number.isFinite(a)||!Number.isFinite(b)||Math.abs(a-b)<=1000;
    if(['active','closed'].includes(st)&&releaseOk&&releaseMatch){
      // Adopt the authoritative revision returned by the read; email can proceed.
      m.syncMeta=m.syncMeta||{};m.syncMeta.revision=Number(raw.revision)||m.syncMeta.revision||1;
      delete m.syncMeta.conflict;return {ok:true,revision:Number(raw.revision)||0};
    }
    // Server is demonstrably stale (READY/no release) while this device is ACTIVE.
    // Rebase on the server revision and push the ACTIVE state automatically.
    const remote=rowToMove112(raw),remoteRow=moveToRow112(remote);m.syncMeta=m.syncMeta||{};m.syncMeta.revision=Number(raw.revision)||1;m.syncMeta.lastServerFingerprint=fingerprint112(remote);m.syncMeta.lastServerRow=clone112(remoteRow);m.syncMeta.conflict=null;
    markDirtyMove112(m);await queueSave112(m,{force:true,expectedRevision:Number(raw.revision)||1,baseRow:remoteRow});
  }
  return {ok:false,message:'No fue posible confirmar el estado operativo de la Move en servidor. Tus datos permanecen guardados.'};
}
if(BASE_SEND_DAILY_112)sendDailyReport=async function(m,p,c){
  const btn=typeof $==='function'?$('sendFromReview'):null,priorText=btn?.textContent||'';
  if(btn){btn.disabled=true;btn.textContent='Sincronizando y enviando…'}
  try{
    const gate=await verifyMoveBeforeEmail112(m);
    if(!gate.ok){alert(gate.message);return null}
    return await BASE_SEND_DAILY_112.apply(this,arguments);
  }finally{
    if(btn&&document.body.contains(btn)&&!c?.sentAt){btn.disabled=false;btn.textContent=priorText||'Enviar Daily Move Update + OPS'}
  }
};

/* ---------- Admin traceability ---------- */
function fmtStamp112(iso){if(!iso)return'—';try{return new Intl.DateTimeFormat('es-CO',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit',timeZone:'America/Bogota'}).format(new Date(iso))}catch(_){return String(iso)}}
if(typeof v4ManageMoves==='function'){
  v4ManageMoves=function(){
    const view=state.adminMoveStatus||'active',rows=v4AdminRows(view);
    return `<div class="panel" style="overflow:auto"><div class="row between wrap"><div><h2>Gestionar Moves</h2><div class="small muted v4-manage-count">${rows.length} Moves</div></div><div class="v4-admin-tabs"><button class="btn small ${view==='active'?'active':''}" data-v4-adminstatus="active">Activas</button><button class="btn small ${view==='archived'?'active':''}" data-v4-adminstatus="archived">Archivadas</button><button class="btn small ${view==='deleted'?'active':''}" data-v4-adminstatus="deleted">Eliminadas</button><button class="btn small ${view==='legacy'?'active':''}" data-v4-adminstatus="legacy">Legacy</button></div></div><table class="v4-admin-table"><tr><th>Rig</th><th>Operator</th><th>Route</th><th>Type</th><th>Status</th><th>Created By</th><th>Assigned RM</th><th>Actions</th></tr>${rows.map(m=>{const g=v4Mgmt(m),sm=m.syncMeta||{},trace=g.source==='Legacy'?'':`<span class="v112-trace">Creada ${esc112(fmtStamp112(sm.createdAt||m.createdAt))}<br>Últ. edición ${esc112(fmtStamp112(sm.updatedAt||m.createdAt))} · ${esc112(sm.updatedBy||m.createdBy||'—')}<span class="v112-rev">r${Number(sm.revision)||1}</span></span>`;return `<tr><td><b>${esc112(m.meta.rig)}</b></td><td>${esc112(m.meta.operator||'')}</td><td>${esc112(m.meta.origin||'')} → ${esc112(m.meta.destination||'')}</td><td class="${g.type==='Prueba'?'v4-type-test':''}">${esc112(g.source==='Legacy'?'Legacy':g.type)}</td><td><span class="v4-admin-status">${esc112(v4MoveStatusLabel(m))}</span></td><td>${esc112(m.createdBy||'')}${trace}</td><td>${esc112((m.access?.assignedEmails||[]).join(', ')||'—')}</td><td><div class="v4-admin-actions">${!g.deletedAt&&g.source!=='Legacy'?`<button class="btn small" data-v4-editmove="${m.id}">Editar</button><button class="btn small" data-v4-duplicate="${m.id}">Duplicar</button>${!g.archivedAt?`<button class="btn small" data-v4-archive="${m.id}">Archivar</button>`:`<button class="btn small" data-v4-restore="${m.id}">Restaurar</button>`}<button class="btn small danger" data-v4-delete="${m.id}">Eliminar</button>`:g.deletedAt?`<button class="btn small" data-v4-restore="${m.id}">Restaurar</button>`:g.source==='Legacy'?`<button class="btn small danger" data-v4-delete="${m.id}">Eliminar</button>`:''}</div></td></tr>`}).join('')||'<tr><td colspan="8" class="muted">Sin Moves.</td></tr>'}</table></div>`;
  };
}

/* ---------- Edit Move: local-durable + server-confirmed ---------- */
if(typeof v4EditMove==='function'){
  v4EditMove=function(m){
    if(!m)return;const g=v4Mgmt(m),rms=state.users.filter(u=>u.active&&u.permissions?.includes('execute'));
    sheetRoot.innerHTML=`<div class="sheet-backdrop"><div class="sheet wide"><div class="sheet-handle"></div><h2>Editar Move · ${esc112(m.meta.rig)}</h2><div class="v4-edit-grid"><label>Rig<input id="v4ERig" class="field" value="${esc112(m.meta.rig)}"></label><label>Operator<input id="v4EOperator" class="field" value="${esc112(m.meta.operator||'')}"></label><label>Origen<input id="v4EOrigin" class="field" value="${esc112(m.meta.origin||'')}"></label><label>Destino<input id="v4EDestination" class="field" value="${esc112(m.meta.destination||'')}"></label><label>Distancia km<input id="v4EDistance" type="number" class="field" value="${Number(m.meta.distanceKm)||0}"></label><label>Días planificados<input id="v4EDays" type="number" step=".25" class="field" value="${Number(m.meta.plannedDays)||0}"></label><label>Projected Rig Release<input id="v4ERelease" type="datetime-local" class="field" value="${toInput(m.meta.projectedRelease)}"></label><label>Move Company<input id="v4ECompany" class="field" value="${esc112(m.meta.moveCompany||'')}"></label><label>Support Company<input id="v4ESupport" class="field" value="${esc112(m.meta.supportCompany||'')}"></label><label>Tipo<select id="v4EType" class="field"><option ${g.type==='Real'?'selected':''}>Real</option><option ${g.type==='Prueba'?'selected':''}>Prueba</option></select></label><label>Acceso<select id="v4EAccess" class="field"><option value="all" ${m.access?.mode!=='assigned'?'selected':''}>Todos los ejecutores</option><option value="assigned" ${m.access?.mode==='assigned'?'selected':''}>RMs asignados</option></select></label><label>Daily To<input id="v4ETo" class="field" value="${esc112(m.reportConfig?.dailyTo||'')}"></label><label>Daily CC<input id="v4ECc" class="field" value="${esc112(m.reportConfig?.dailyCc||'')}"></label></div><div style="margin-top:10px"><b class="small">Rig Managers</b><div class="v4-rm-checks">${rms.map(u=>`<label><input type="checkbox" data-v4-rm="${esc112(u.email)}" ${(m.access?.assignedEmails||[]).includes(u.email)?'checked':''}> ${esc112(u.name||u.email)}</label>`).join('')||'<span class="muted">Sin usuarios Execute.</span>'}</div></div><div id="v112EditResult" class="small" style="margin-top:10px"></div><div class="sheet-footer"><button id="cancelSheet" class="btn">Cancelar</button><button id="v4SaveMove" class="btn primary">Guardar</button></div></div></div>`;
    $('cancelSheet').onclick=closeSheet;
    $('v4SaveMove').onclick=async()=>{
      const btn=$('v4SaveMove'),res=$('v112EditResult'),before=clone112(m),old={rig:m.meta.rig,operator:m.meta.operator,origin:m.meta.origin,destination:m.meta.destination,distance:m.meta.distanceKm,days:m.meta.plannedDays};
      const structural=m.status==='active'&&(String(old.rig)!==$('v4ERig').value||Number(old.days)!==Number($('v4EDays').value));if(structural&&!confirm('La Move está en ejecución. ¿Guardar el cambio?'))return;
      Object.assign(m.meta,{rig:$('v4ERig').value.trim(),operator:$('v4EOperator').value.trim(),origin:$('v4EOrigin').value.trim(),destination:$('v4EDestination').value.trim(),distanceKm:Number($('v4EDistance').value)||0,plannedDays:Number($('v4EDays').value)||0,projectedRelease:inputToIso($('v4ERelease').value),moveCompany:$('v4ECompany').value.trim(),supportCompany:$('v4ESupport').value.trim()});
      g.type=$('v4EType').value;m.access=m.access||{};m.access.mode=$('v4EAccess').value;m.access.assignedEmails=[...document.querySelectorAll('[data-v4-rm]:checked')].map(x=>x.dataset.v4Rm);m.reportConfig=m.reportConfig||{};m.reportConfig.dailyTo=$('v4ETo').value.trim();m.reportConfig.dailyCc=$('v4ECc').value.trim();m.audit=m.audit||[];m.audit.push({at:nowIso(),user:state.auth.email,action:'edit_move',before:old,after:{rig:m.meta.rig,operator:m.meta.operator,origin:m.meta.origin,destination:m.meta.destination,distance:m.meta.distanceKm,days:m.meta.plannedDays,type:g.type}});
      markDirtyMove112(m);try{saveLocal()}catch(_){};scheduleSnapshot112();btn.disabled=true;btn.textContent=isOnline112()?'Guardando…':'Guardado local';if(res){res.style.color='#a8c0ff';res.textContent=isOnline112()?'Confirmando cambio en servidor…':'Sin conexión · el cambio quedó guardado en este dispositivo.'}
      try{
        const ack=await window.RigGOV112PersistNow(m);
        if(ack?.synced){if(res){res.style.color='#8ae4ad';res.textContent='Guardado ✓'};setTimeout(()=>{closeSheet();render();try{v4Top()}catch(_){}},180);return}
        if(ack?.offline){if(res){res.style.color='#f0b84a';res.textContent='Guardado local · se sincronizará al recuperar señal.'};setTimeout(()=>{closeSheet();render();try{v4Top()}catch(_){}},260);return}
        if(res){res.style.color='#ffafb8';res.textContent=ack?.detail?.message||'Cambio pendiente de reconciliación. No se cerró esta ventana.'}
      }catch(e){if(res){res.style.color='#ffafb8';res.textContent='Error: '+String(e?.message||e)};Object.assign(m,before);try{saveLocal()}catch(_){} }
      finally{if(document.body.contains(btn)){btn.disabled=false;btn.textContent='Guardar'}}
    };
  };
}

/* ---------- Alias ---------- */
function emailHuman112(email){
  const local=String(email||'').split('@')[0]||'';return local.split(/[._-]+/).filter(Boolean).map(p=>p.charAt(0).toUpperCase()+p.slice(1).toLowerCase()).join(' ');
}
function preferredName112(){
  const email=userEmail112(),u=(state.users||[]).find(x=>lower112(x.email)===email);return text112(u?.alias)||emailHuman112(email)||text112(u?.name);
}
function greeting112(){const h=new Date().getHours(),g=(h>=5&&h<12)?'Buenos días':(h>=12&&h<19)?'Buenas tardes':'Buenas noches',n=preferredName112();return n?`${g}, ${n}`:g}
function refreshGreeting112(){const el=document.querySelector('.v106-greet');if(el)el.textContent=greeting112()}
if(typeof v4UsersAdmin==='function'){
  v4UsersAdmin=function(){return `<div class="panel" style="overflow:auto"><div class="row between wrap" style="margin-bottom:10px"><div><h2>Usuarios</h2><div class="small muted">${state.users.length} usuarios habilitados</div></div><button id="addUser" class="btn primary">+ Usuario</button></div><table class="admin-table"><tr><th>Usuario</th><th>Alias</th><th>Cargar Plan</th><th>Ejecutar Move</th><th>Vista General</th><th>Administrador</th><th>Activo</th><th></th></tr>${state.users.map((u,i)=>`<tr><td><b>${esc112(u.name||'')}</b><div class="tiny muted">${esc112(u.email)}</div></td><td><input class="v112-alias-input" data-v112-alias="${i}" maxlength="28" value="${esc112(u.alias||'')}" placeholder="Opcional"></td>${['plan','execute','overall','admin'].map(p=>`<td><input type="checkbox" data-userperm="${i}" data-p="${p}" ${u.permissions.includes(p)?'checked':''}></td>`).join('')}<td><input type="checkbox" data-useractive="${i}" ${u.active?'checked':''}></td><td><button class="btn small danger" data-deluser="${i}" ${u.email===state.auth.email?'disabled':''}>×</button></td></tr>`).join('')}</table></div>`};
}
const BASE_WIRE_ADMIN_112=typeof wireAdmin==='function'?wireAdmin:null;
wireAdmin=function(){if(BASE_WIRE_ADMIN_112)BASE_WIRE_ADMIN_112();document.querySelectorAll('[data-v112-alias]').forEach(inp=>{inp.onchange=async()=>{const u=state.users[+inp.dataset.v112Alias];if(!u)return;const wanted=text112(inp.value);inp.disabled=true;try{if(!isOnline112())throw new Error('El alias requiere conexión.');const data=await rpc112('riggo_set_user_alias',{p_email:u.email,p_alias:wanted});if(!data?.ok)throw new Error(data?.message||'Supabase rechazó el alias.');u.alias=text112(data.alias);try{saveLocal()}catch(_){};scheduleSnapshot112();refreshGreeting112();toast('Alias guardado ✓')}catch(e){inp.value=u.alias||'';alert(e.message||e)}finally{inp.disabled=false}}})};

/* ---------- Reactions: only active Performance cards ---------- */
async function loadReactions112(){
  if(reactionsLoading||!SB||!isOnline112()||!state?.auth?.logged)return;
  const ids=(state.moves||[]).filter(m=>(m.syncMeta?.serverStatus||m.status)==='active'&&!isDeleted112(m)).map(m=>m.id);if(!ids.length){reactionsByMove.clear();return}
  reactionsLoading=true;
  try{const data=await rpc112('riggo_get_move_reactions',{p_move_ids:ids});const map=new Map();(data||[]).forEach(r=>{if(!map.has(r.move_id))map.set(r.move_id,[]);map.get(r.move_id).push(r)});reactionsByMove=map}catch(e){console.warn('RigGO reactions:',e)}finally{reactionsLoading=false}
}
function reactionName112(r){return text112(r.alias)||text112(r.display_name)||emailHuman112(r.email)||r.email}
function closeWho112(){document.querySelectorAll('.v112-who').forEach(x=>x.remove())}
function showWho112(btn,moveId,reaction){closeWho112();const rows=(reactionsByMove.get(moveId)||[]).filter(x=>x.reaction===reaction);if(!rows.length)return;const box=document.createElement('div');box.className='v112-who';box.innerHTML=`<b>${REACTION_ICON[reaction]} ${rows.length}</b>${rows.map(x=>`<div>${esc112(reactionName112(x))}</div>`).join('')}`;document.body.appendChild(box);const r=btn.getBoundingClientRect(),w=box.getBoundingClientRect();box.style.left=Math.max(8,Math.min(innerWidth-w.width-8,r.left))+'px';box.style.top=Math.max(8,r.top-w.height-8)+'px';setTimeout(()=>document.addEventListener('click',closeWho112,{once:true}),0)}
function reactionBar112(moveId){
  const rows=reactionsByMove.get(moveId)||[],mine=rows.find(x=>lower112(x.email)===userEmail112())?.reaction||'';
  return `<div class="v112-reactions" data-v112-reactions="${moveId}">${REACTIONS.map(r=>{const count=rows.filter(x=>x.reaction===r).length;return `<button class="v112-react ${mine===r?'mine':''}" data-v112-react="${r}" data-v112-mid="${moveId}" title="Reaccionar"><span>${REACTION_ICON[r]}</span><span class="v112-count" data-v112-who="${r}">${count}</span></button>`}).join('')}${!isOnline112()?'<span class="v112-react-offline">Reacciones al recuperar señal</span>':''}</div>`;
}
function injectReactions112(){
  if(state?.screen!=='overall'||state?.overallTab!=='live')return;
  document.querySelectorAll('[data-v106-live]').forEach(card=>{const id=card.dataset.v106Live,m=state.moves.find(x=>x.id===id);if(!m||(m.syncMeta?.serverStatus||m.status)!=='active'||isDeleted112(m))return;if(card.nextElementSibling?.matches?.(`[data-v112-reactions="${CSS.escape(id)}"]`))return;card.insertAdjacentHTML('afterend',reactionBar112(id))});
  document.querySelectorAll('[data-v112-react]').forEach(btn=>btn.onclick=async e=>{e.stopPropagation();const id=btn.dataset.v112Mid,r=btn.dataset.v112React;if(e.target.closest('[data-v112-who]')){showWho112(btn,id,r);return}if(!isOnline112()){toast('Las reacciones requieren conexión.');return}const rows=reactionsByMove.get(id)||[],mine=rows.find(x=>lower112(x.email)===userEmail112()),next=mine?.reaction===r?'':r;btn.disabled=true;try{const data=await rpc112('riggo_set_reaction',{p_move_id:id,p_reaction:next,p_operation_id:uuid112()});if(!data?.ok)throw new Error(data?.message||'No fue posible reaccionar.');await loadReactions112();document.querySelectorAll('[data-v112-reactions]').forEach(x=>x.remove());injectReactions112();}catch(err){alert(err.message||err)}finally{btn.disabled=false}})
}

/* ---------- Desktop wheel + keyboard scrolling only ---------- */
function enableDesktopScroll112(){
  const fine=matchMedia?.('(pointer:fine) and (min-width:900px)')?.matches;if(!fine)return;
  document.addEventListener('wheel',e=>{if(e.defaultPrevented||e.ctrlKey)return;const t=e.target.closest?.('.sheet,[style*="overflow:auto"]');if(t&&t.scrollHeight>t.clientHeight){t.scrollTop+=e.deltaY;e.preventDefault()}},{passive:false});
  document.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;const d={PageDown:innerHeight*.82,PageUp:-innerHeight*.82,Home:-1e9,End:1e9}[e.key];if(d==null)return;window.scrollBy({top:d,behavior:'smooth'});e.preventDefault()});
}

/* ---------- post-render ---------- */
async function postRender112(){
  stamp112();ensureBadge112();refreshGreeting112();
  if(state?.screen==='overall'&&state?.overallTab==='live'){await loadReactions112();injectReactions112()}
}
const BASE_RENDER_112=typeof render==='function'?render:null;
if(BASE_RENDER_112)render=function(){const out=BASE_RENDER_112.apply(this,arguments);requestAnimationFrame(()=>postRender112());return out};
setInterval(refreshGreeting112,60000);

/* ---------- Service Worker / version authority ---------- */
function stamp112(){
  
  
  const box=document.querySelector('.v5-admin-build');if(box){const b=box.querySelector('b');if(b)b.textContent='RigGO '+RELEASE;const s=box.querySelectorAll('span');if(s.length)s[s.length-1].textContent=BUILD}
}
async function versionHandshake112(){
  if(!isOnline112())return;
  try{const r=await fetch(`./version.json?t=${Date.now()}`,{cache:'no-store'});if(!r.ok)return;const v=await r.json();if(v.release&&v.release!==RELEASE&&!sessionStorage.getItem('riggo112_version_reload')){sessionStorage.setItem('riggo112_version_reload','1');location.reload()}else if(v.release===RELEASE)sessionStorage.removeItem('riggo112_version_reload')}catch(_){}
}
async function registerSw112(){
  if(!('serviceWorker'in navigator))return;
  try{
    if(reg.waiting)reg.waiting.postMessage({type:'SKIP_WAITING'});
    navigator.serviceWorker.addEventListener('controllerchange',()=>{
      // Never reload a logged-in field session. A SW update is allowed to take
      // control silently; the new shell is used on the next natural open/refresh.
      if(state?.auth?.logged){sessionStorage.setItem('riggo112_sw_deferred','1');try{toast('Actualización lista · se aplicará al volver a abrir RigGO')}catch(_){};return}
      if(!sessionStorage.getItem('riggo112_sw_reload')){sessionStorage.setItem('riggo112_sw_reload','1');location.reload()}
    });
    navigator.serviceWorker.addEventListener('message',e=>{if(e.data?.type==='RIGGO_UPDATE_READY'&&state?.auth?.logged)sessionStorage.setItem('riggo112_sw_deferred','1')});
    if(navigator.serviceWorker.controller)sessionStorage.removeItem('riggo112_sw_reload');
  }catch(e){console.warn('RigGO SW:',e)}
}

/* ---------- connectivity transitions: one coordinator ---------- */
async function syncCycle112({hydrate=true,reports=true}={}){
  if(syncCyclePromise112)return syncCyclePromise112;
  syncCyclePromise112=(async()=>{
    if(!state?.auth?.logged)return {ok:false,auth:false};
    if(!isOnline112()){ensureBadge112();return {ok:false,offline:true}}
    setBadge112('syncing','Sincronizando…');
    const f=await flushOutbox112();
    if(f?.transportFailure)return f;
    const ef=window.RigGOV120?.flush?await window.RigGOV120.flush():null;
    if(ef?.transportFailure)return ef;
    if(reports)await syncPendingReports112();
    if(hydrate)return await hydrate112();
    return f;
  })().finally(()=>{syncCyclePromise112=null});
  return syncCyclePromise112;
}
window.addEventListener('offline',()=>{lastNetworkState='offline';transportIssue112=true;ensureBadge112();scheduleSnapshot112()});
window.addEventListener('online',()=>{lastNetworkState='online';transportIssue112=false;if(document.documentElement.classList.contains('riggo-booting'))return;syncCycle112().catch(()=>ensureBadge112())});
document.addEventListener('visibilitychange',()=>{if(document.documentElement.classList.contains('riggo-booting'))return;if(document.visibilityState==='visible'&&state?.auth?.logged){if(isOnline112())syncCycle112().catch(()=>{});else ensureBadge112()}});

/* Weak/intermittent signal may not fire online/offline events. Retry pending work quietly. */
setInterval(async()=>{
  if(document.documentElement.classList.contains('riggo-booting')||!state?.auth?.logged||navigator.onLine===false)return;
  const pending=await refreshPending112(),execPending=window.RigGOV120?.pendingCount?await window.RigGOV120.pendingCount().catch(()=>0):0;
  if(pending||execPending||transportIssue112){try{await syncCycle112()}catch(_){transportIssue112=true;ensureBadge112()}}
},15000);

/* ---------- unified boot: local snapshot first, then session/server ---------- */
async function bootSession112(){
  if(bootPromise112)return bootPromise112;
  bootPromise112=(async()=>{
    await openDb112();await refreshPending112();
    // ALWAYS restore the last field snapshot first, even when navigator.onLine=true.
    // A radio/Wi-Fi link is not proof that Supabase is reachable.
    await restoreSnapshot112({renderNow:false});
    const prior=clone112(state?.auth||{email:'',logged:false});
    if(prior.logged){render();setBadge112(isOnline112()?'syncing':'offline',isOnline112()?'Conectando…':'Offline · trabajando localmente')}
    else if(typeof renderLogin==='function')renderLogin();
    if(!SB)return {ok:false,noSupabase:true};
    try{
      let {data,error}=await SB.auth.getSession();if(error)throw error;
      const recoveryIntent=!!(window.__RIGGO_PASSWORD_RECOVERY_ACTIVE__||window.RigGOIsPasswordRecovery?.()||window.RigGORecoveryIntent?.()||/type=recovery|riggo_recovery=1/i.test(String(window.location.href||'')));
      if(recoveryIntent&&!data?.session?.user?.email){try{const u=new URL(window.location.href),code=u.searchParams.get('code');if(code&&typeof SB.auth.exchangeCodeForSession==='function'){const ex=await SB.auth.exchangeCodeForSession(code);if(ex?.error)throw ex.error;if(ex?.data?.session)data={...(data||{}),session:ex.data.session}}}catch(ex){console.warn('RigGO 12.3 recovery code exchange',ex)}}
      const email=lower112(data?.session?.user?.email||'');
      if(!email){
        if(recoveryIntent){state.auth={email:'',logged:false};window.__RIGGO_PASSWORD_RECOVERY_ACTIVE__=true;window.RigGORenderPasswordRecovery?.('');setTimeout(()=>{try{authError('El enlace de recuperación no tiene una sesión válida o expiró. Solicita un enlace nuevo.')}catch(_){}},0);return {ok:false,passwordRecovery:true,sessionMissing:true}}
        // If there is no network, a previously authenticated field snapshot may keep
        // working locally. Email/server operations remain unavailable until reconnect.
        if(prior.logged&&prior.email&&!isOnline112()){state.auth=prior;transportIssue112=true;render();setBadge112('offline','Offline · trabajando localmente');return {ok:true,offline:true,sessionDeferred:true}}
        // Session really expired/signed out. Keep field data in IndexedDB/state; only
        // authentication is cleared. A new login can reconcile it afterwards.
        state.auth={email:prior.email||'',logged:false};
        if(typeof renderLogin==='function')renderLogin();
        return {ok:true,loginRequired:true};
      }
      if(recoveryIntent){state.auth={email,logged:false};window.__RIGGO_PASSWORD_RECOVERY_ACTIVE__=true;window.RigGORenderPasswordRecovery?.(email);return {ok:true,passwordRecovery:true}}
      state.auth={email,logged:true};
      const h=await hydrate112();
      const u=typeof currentUser==='function'?currentUser():null;
      if(!u?.active){await SB.auth.signOut();state.auth={email,logged:false};if(typeof renderLogin==='function')renderLogin();return {ok:false,unauthorized:true}}
      // Preserve an execution/review screen restored from the same user. Only route
      // fresh sessions whose stored screen is not valid for the user.
      if(!state.screen||state.screen==='login')state.screen=routeForUser(u);
      try{saveLocal()}catch(_){ }scheduleSnapshot112();render();ensureBadge112();return {ok:true,hydrated:h};
    }catch(e){
      const msg=String(e?.message||e||''),networkish=navigator.onLine===false||/failed to fetch|network|load failed|fetch|timeout|connection|offline/i.test(msg);
      if(prior.logged&&prior.email&&networkish){state.auth=prior;transportIssue112=true;render();setBadge112('offline','Offline · trabajando localmente');return {ok:true,offline:true}}
      // Never erase Move data here. Authentication errors affect auth only.
      state.auth={email:prior.email||'',logged:false};if(typeof renderLogin==='function')renderLogin();return {ok:false,error:e};
    }
  })().finally(()=>{bootPromise112=null});
  return bootPromise112;
}
try{tryRemoteSession=bootSession112}catch(_){ }

/* ---------- 11.5 final-runtime background services ---------- */
async function startServices112(){if(servicesPromise112)return servicesPromise112;servicesPromise112=(async()=>{scheduleSnapshot112();return true})();return servicesPromise112}

/* ---------- initialize: expose capabilities only; V115 is sole boot owner ---------- */
window.RigGOV112={release:RELEASE,build:BUILD,pendingCount:0,moveToRow:moveToRow112,rowToMove:rowToMove112,fingerprint:fingerprint112,draftReady:draftReady112,queueSave:queueSave112,queueDelete:queueDelete112,queueRestore:queueRestore112,refreshPending:refreshPending112,flush:flushOutbox112,hydrate:hydrate112,persistNow:syncMoveNow112,verifyBeforeEmail:verifyMoveBeforeEmail112,syncReports:syncPendingReports112,greeting:greeting112,emailHuman:emailHuman112,reactions:()=>reactionsByMove,markDirty:markDirtyMove112,dirtyIds:()=>[...dirtyMoves112.keys()],protectedIds:protectedIds112,restoreSnapshot:restoreSnapshot112,syncCycle:syncCycle112,boot:bootSession112,startServices:startServices112,startMove:startMove112,openEditMove:(typeof window.v4EditMove==='function'?window.v4EditMove:null),syncDiagnostic:()=>({browserOnline:navigator.onLine!==false,transportIssue:transportIssue112,syncError:syncError112,pending:window.RigGOV112?.pendingCount||0,quarantined:blockedReviewCount112}),listOutbox:()=>idbAll112(OUTBOX_STORE),discardLegacyDelete:discardLegacyDelete112,retryBlockedSave:retryBlockedSave112,discardBlockedSave:discardBlockedSave112};

enableDesktopScroll112();
// IMPORTANT: no boot/hydrate/SW registration is launched here. RigGO 11.7
// Runtime Authority performs the single ordered boot after every layer is loaded.
})();

/* ===== SOURCE riggo-v114.js (consolidated) ===== */
/* RigGO 11.4 · Field Email Outbox / Isolated Sync
   Baseline: exact RigGO 11.3 Sync Core C1.
   Scope:
   - Daily Move Update can be queued with or without connectivity.
   - Frozen OPS/email payload survives browser/network changes in IndexedDB.
   - Automatic delivery on reconnect/open; "Enviado" only after provider ACK.
   - Resend idempotency key prevents duplicate sends during retries.
   - Email delivery is independent from Move sync state.
   - Compact fixed-width connectivity badge on mobile/desktop.
   Existing 18 Legacy, Performance, Template, OPS pagination and mobile layout remain unchanged.
*/
(()=>{
'use strict';
const RELEASE='11.5.3-email-reporting-c1';
const BUILD='2026-08-19-2156-C1';
const MAIL_DB='riggo-email-v114';
const MAIL_DB_VERSION=1;
const MAIL_STORE='emails';
const EMAIL_RETRY_MS=15000;
const EMAIL_RENDERER_VERSION=3;
const SB=window.RigGOSupabase||null;
let mailDbPromise=null;
let mailDrainPromise=null;
let mailPreparing=false;
let mailServicesPromise114=null;
let mailServicesStarted114=false;

const clone=v=>{try{return structuredClone(v)}catch(_){return JSON.parse(JSON.stringify(v))}};
const now=()=>new Date().toISOString();
const low=v=>String(v||'').trim().toLowerCase();
const esc=v=>typeof enc==='function'?enc(v):String(v??'').replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
const online=()=>navigator.onLine!==false;
const userEmail=()=>low(state?.auth?.email||'');
const b64=v=>{const s=String(v||''),i=s.indexOf(',');return i>=0?s.slice(i+1):s};
const blob64=blob=>new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(b64(r.result));r.onerror=()=>reject(r.error||new Error('No fue posible convertir el OPS.'));r.readAsDataURL(blob)});
const b64Blob=(value,type='application/pdf')=>{const bin=atob(String(value||'')),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return new Blob([u],{type})};

function openMailDb(){
  if(mailDbPromise)return mailDbPromise;
  mailDbPromise=new Promise((resolve,reject)=>{
    const r=indexedDB.open(MAIL_DB,MAIL_DB_VERSION);
    r.onupgradeneeded=()=>{const db=r.result;if(!db.objectStoreNames.contains(MAIL_STORE))db.createObjectStore(MAIL_STORE,{keyPath:'key'})};
    r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);
  });
  return mailDbPromise;
}
async function mailPut(v){const db=await openMailDb();return new Promise((resolve,reject)=>{const tx=db.transaction(MAIL_STORE,'readwrite');tx.objectStore(MAIL_STORE).put(v);tx.oncomplete=()=>resolve(v);tx.onerror=()=>reject(tx.error)})}
async function mailGet(k){const db=await openMailDb();return new Promise((resolve,reject)=>{const tx=db.transaction(MAIL_STORE,'readonly'),r=tx.objectStore(MAIL_STORE).get(k);r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>reject(r.error)})}
async function mailAll(){const db=await openMailDb();return new Promise((resolve,reject)=>{const tx=db.transaction(MAIL_STORE,'readonly'),r=tx.objectStore(MAIL_STORE).getAll();r.onsuccess=()=>resolve(r.result||[]);r.onerror=()=>reject(r.error)})}

function parseRecipients(text){
  const fn=window.RigGOV70?.parseEmails;
  if(fn)return fn(text);
  const emails=String(text||'').split(/[;,\n\r\t ]+/).map(x=>x.trim().toLowerCase()).filter(Boolean),re=/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  return {emails:emails.filter(x=>re.test(x)),invalid:emails.filter(x=>!re.test(x))};
}
function uniqueDistribution(to,cc){
  const seen=new Set(),a=[],b=[];
  for(const x of to){const k=low(x);if(k&&!seen.has(k)){seen.add(k);a.push(k)}}
  for(const x of cc){const k=low(x);if(k&&!seen.has(k)){seen.add(k);b.push(k)}}
  return {to:a,cc:b,total:a.length+b.length};
}
function photoPrepare(dataUrl,w=900,h=600,q=.78){
  return new Promise(resolve=>{if(!dataUrl){resolve('');return}const img=new Image();img.onload=()=>{try{const sw=img.naturalWidth||img.width,sh=img.naturalHeight||img.height,scale=Math.min(w/sw,h/sh),dw=Math.max(1,Math.round(sw*scale)),dh=Math.max(1,Math.round(sh*scale)),dx=Math.round((w-dw)/2),dy=Math.round((h-dh)/2),cv=document.createElement('canvas');cv.width=w;cv.height=h;const ctx=cv.getContext('2d');ctx.fillStyle='#eef1f4';ctx.fillRect(0,0,w,h);ctx.drawImage(img,dx,dy,dw,dh);resolve(cv.toDataURL('image/jpeg',q))}catch(_){resolve(dataUrl)}};img.onerror=()=>resolve(dataUrl);img.src=dataUrl})
}
function closureFor(record){const m=(state.moves||[]).find(x=>x.id===record.moveId);if(!m)return{};const p=(typeof movePeriods==='function'?movePeriods(m):[]).find(x=>x.id===record.periodLocalId)||null;const c=m.exec?.closures?.[record.periodLocalId]||null;return{m,p,c}}
function subject114(m,p){return `Rig ${m.meta.rig} | Daily Move Update | Día ${p.index} | ${m.meta.origin} to ${m.meta.destination}`}


/* 11.5.3 — email reporting layer only.
   Keep the stable Runtime Authority untouched; enrich the frozen email with
   time-bounded Flat Time cards and explicit commercial treatment. */
function fmtEventMoment114(value){
  if(!value)return '—';
  try{
    const d=new Date(value);if(Number.isNaN(d.getTime()))return String(value);
    const parts=new Intl.DateTimeFormat('es-CO',{timeZone:'America/Bogota',day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(d),get=t=>parts.find(x=>x.type===t)?.value||'';
    const mon=(get('month')||'').replace(/\./g,'');return `${get('day')} ${mon.charAt(0).toUpperCase()+mon.slice(1)} · ${get('hour')}:${get('minute')}`;
  }catch(_){return String(value||'—')}
}
function treatmentTone114(value){
  const k=low(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  if(k==='eximente')return{bg:'#e9f8f1',fg:'#137a53',bd:'#b9e7cf'};
  if(k==='facturable')return{bg:'#e7f8f4',fg:'#08775d',bd:'#b6e6da'};
  if(k==='no facturable')return{bg:'#fff0f0',fg:'#b42318',bd:'#f3c3c1'};
  if(k==='por definir')return{bg:'#fff7e6',fg:'#9a6700',bd:'#f2d69a'};
  if(k==='bajo revision')return{bg:'#eef4ff',fg:'#244f88',bd:'#cbdaf2'};
  if(k==='no aplica')return{bg:'#f2f4f7',fg:'#475467',bd:'#dfe3e8'};
  if(k==='tarifa negociada')return{bg:'#f3efff',fg:'#6840a5',bd:'#d9cef1'};
  return{bg:'#f2f4f7',fg:'#475467',bd:'#dfe3e8'};
}
function treatmentBadge114(value){const v=String(value||'Por definir').trim()||'Por definir',t=treatmentTone114(v);return `<span style="display:inline-block;padding:4px 8px;border-radius:12px;border:1px solid ${t.bd};background:${t.bg};color:${t.fg};font-size:10px;line-height:12px;font-weight:800;text-transform:uppercase;letter-spacing:.03em;white-space:nowrap">${esc(v.toUpperCase())}</span>`}
function eventHours114(e){try{return typeof eventHours==='function'?Number(eventHours(e)||0):Math.max(0,Number(e?.hours)||0)}catch(_){return Math.max(0,Number(e?.hours)||0)}}
function flatTreatmentSummary114(events){
  const g=new Map();for(const e of events||[]){const k=String(e?.commercial||'Por definir').trim()||'Por definir';g.set(k,(g.get(k)||0)+eventHours114(e))}
  const order=['Eximente','Por definir','No aplica','Facturable','No facturable','Bajo revisión','Tarifa negociada'];
  return [...g.entries()].sort((a,b)=>{const ai=order.indexOf(a[0]),bi=order.indexOf(b[0]);return (ai<0?99:ai)-(bi<0?99:bi)||b[1]-a[1]}).map(([k,h])=>{const t=treatmentTone114(k);return `<span style="display:inline-block;margin:0 6px 6px 0;padding:5px 8px;border-radius:12px;border:1px solid ${t.bd};background:${t.bg};color:${t.fg};font-size:10px;line-height:12px;font-weight:800">${esc(k)} · ${Math.round(h*100)/100} h</span>`}).join('');
}
function flatEventCard114(e,p){
  const label=(()=>{try{return FLAT_TYPES.find(x=>x.id===e.type)?.label||e.type||'Flat Time'}catch(_){return e.type||'Flat Time'}})(),hours=Math.round(eventHours114(e)*100)/100,treat=String(e.commercial||'Por definir').trim()||'Por definir';
  const detail=(()=>{try{return typeof eventDetailSummary==='function'?eventDetailSummary(e):String(e.description||'')}catch(_){return String(e.description||'')}})();
  const start=fmtEventMoment114(e.start),endValue=e.ongoing?(p?.end||e.end):e.end,end=fmtEventMoment114(endValue),endWord=e.ongoing?'Corte':'Fin';
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:8px;border:1px solid #f0d3d5;background:#fffafa"><tr><td width="5" style="width:5px;background:#d92d3a;font-size:1px">&nbsp;</td><td style="padding:10px 11px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td valign="middle" style="font-size:13px;line-height:17px;font-weight:800;color:#9f1d29">${hours} h · ${esc(label)}</td><td align="right" valign="middle">${treatmentBadge114(treat)}</td></tr></table><div style="font-size:11px;line-height:16px;color:#344054;margin-top:5px"><b>Inicio:</b> ${esc(start)} &nbsp;→&nbsp; <b>${endWord}:</b> ${esc(end)}${e.ongoing?' <span style="color:#6840a5;font-weight:800">· CONTINÚA ACTIVO</span>':''}</div><div style="font-size:11px;line-height:16px;color:#475467;margin-top:3px">${e.responsibility?`<b>Responsabilidad:</b> ${esc(e.responsibility)}`:'<b>Responsabilidad:</b> —'}${e.affected?` &nbsp;·&nbsp; <b>Afecta:</b> ${esc(e.affected)}`:''}${e.company?` &nbsp;·&nbsp; <b>Compañía:</b> ${esc(e.company)}`:''}</div>${detail?`<div style="font-size:12px;line-height:17px;color:#344054;margin-top:5px">${esc(detail)}</div>`:''}</td></tr></table>`;
}
function flatSection114(p,c){
  const events=(c?.flatEvents||[]);let fs;try{fs=typeof flatSummary==='function'?flatSummary(events,p):{net:events.reduce((a,e)=>a+eventHours114(e),0),work:0}}catch(_){fs={net:events.reduce((a,e)=>a+eventHours114(e),0),work:0}}
  const summary=flatTreatmentSummary114(events),cards=events.slice(0,4).map(e=>flatEventCard114(e,p)).join('');
  const sectionHead=`<tr><td style="padding:20px 24px 8px"><div style="font-size:11px;line-height:14px;font-weight:700;letter-spacing:.08em;color:#667085;text-transform:uppercase">5. Flat Time / Desviaciones</div></td></tr>`;
  const net=Math.round(Number(fs.net||0)*100)/100,work=Math.round(Number(fs.work||0)*100)/100;
  return `${sectionHead}<tr><td style="padding:0 24px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${net>0?'#fff8f0':'#f1faf5'};border:1px solid ${net>0?'#f3d7b2':'#d0eadc'}"><tr><td style="padding:11px 12px;font-size:13px;color:#17202a"><b>Flat Time neto: ${net} h</b> · Trabajo efectivo Move: ${work} h</td></tr></table>${summary?`<div style="margin-top:8px"><div style="font-size:10px;line-height:14px;color:#667085;font-weight:700;text-transform:uppercase;letter-spacing:.04em;margin-bottom:5px">Tratamiento · horas registradas</div>${summary}</div>`:''}${cards||'<div style="font-size:12px;color:#667085;margin-top:7px">Sin Flat Time registrado.</div>'}${events.length>4?`<div style="font-size:11px;color:#667085;font-weight:700;margin-top:6px">+ ${events.length-4} eventos adicionales en OPS</div>`:''}</td></tr>`;
}
function enhanceEmailReporting114(html,m,p,c){
  let h=String(html||'');const a=h.indexOf('5. Flat Time / Desviaciones'),b=h.indexOf('6. Próximas 24 Hrs');if(a<0||b<=a)return h;
  const start=h.lastIndexOf('<tr><td',a),end=h.lastIndexOf('<tr><td',b);if(start<0||end<=start)return h;
  return h.slice(0,start)+flatSection114(p,c)+h.slice(end);
}

/* 11.4.1 — explicit, public-safe frozen email renderer.
   11.4 incorrectly called `finalEmailHtml`, a private function owned by an
   historical IIFE in index.html. Safari therefore threw
   `Can't find variable: finalEmailHtml` before the message ever reached the
   Outbox. Resolve the *active* public email renderer and own the document
   wrapper here instead. */
function activeEmailRenderer114(){
  try{if(typeof emailHtml==='function')return emailHtml}catch(_){}
  if(typeof window.emailHtml==='function')return window.emailHtml;
  if(typeof window.RigGOV70?.email==='function')return window.RigGOV70.email;
  if(typeof window.RigGOV61?.email==='function')return window.RigGOV61.email;
  return null;
}
function renderFrozenEmail114(m,p,c){
  const renderer=activeEmailRenderer114();
  if(!renderer)throw new Error('El renderer del Daily Move Update no está disponible. Recarga RigGO antes de enviar.');
  let inner=renderer(m,p,c,{forSend:true});
  if(typeof inner!=='string'||!inner.trim())throw new Error('RigGO no pudo generar el contenido del Daily Move Update.');
  inner=enhanceEmailReporting114(inner,m,p,c);
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>
body{margin:0;background:#f3f5f7;font-family:Arial,Helvetica,sans-serif;color:#17202a}.email{max-width:920px;margin:0 auto;background:#fff;padding:24px;color:#17202a}.email h2{margin:0;font-size:21px}.email h3{font-size:14px;color:#17365d;margin:19px 0 8px}.email table{width:100%;border-collapse:collapse;font-size:12px}.email th,.email td{padding:7px 8px;border:1px solid #e0e5ea;text-align:left;vertical-align:top}.email th{background:#eef3f8;color:#17365d}.mail-head{border-left:5px solid #35c46a;padding-left:13px}.mail-meta{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin:13px 0}.mail-meta div{background:#f5f7fa;border:1px solid #e1e6ea;border-radius:7px;padding:8px}.mail-meta span{display:block;font-size:9px;color:#667085;text-transform:uppercase}.mail-meta b{font-size:12px}.mail-chart-panel{background:#050505;color:white;border-radius:5px;padding:9px;margin-top:10px}.mail-chart-panel img{width:100%;height:auto;display:block}.email-photo-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:7px}.email-photo-grid img{width:100%;height:auto;border-radius:4px}.email-event{padding:8px 0;border-bottom:1px solid #edf0f2}.email-badge{display:inline-block;border-radius:999px;padding:3px 7px;font-size:9px;font-weight:bold;background:#eef2f7}.email-badge.ex{background:#fff1cd;color:#795c00}.email-badge.bill{background:#def7e7;color:#126b36}
.email.v44-email{max-width:920px!important;margin:0 auto!important;border-radius:0!important;padding:24px!important;background:#fff!important;color:#17202a!important}.v44-email .v44-mail-meta{width:100%!important;border-collapse:separate!important;border-spacing:6px!important;margin:8px -6px 14px!important}.v44-email .v44-mail-meta td{width:33.333%!important;background:#f5f7fa!important;border:1px solid #e1e6ea!important;border-radius:7px!important;padding:9px 10px!important;vertical-align:top!important}.v44-email .v44-label{display:block!important;font-size:9px!important;color:#667085!important;text-transform:uppercase!important;letter-spacing:.04em!important;margin-bottom:3px!important}.v44-email .v44-value{display:block!important;font-size:12px!important;color:#17202a!important;font-weight:700!important;line-height:1.35!important}.v44-email .v44-phase-note{font-size:11px!important;color:#475467!important;line-height:1.38!important}.v44-email .v44-schedule-summary{display:grid!important;grid-template-columns:1fr 1fr!important;gap:8px!important}.v44-email .v44-schedule-box{border:1px solid #e1e6ea!important;border-radius:7px!important;padding:9px!important}.v44-email .v44-schedule-box.advance{background:#f0faf4!important;color:#126b36!important}.v44-email .v44-schedule-box.pending{background:#fff4f4!important;color:#9f1d29!important}
@media(max-width:640px){.mail-meta{grid-template-columns:1fr 1fr}.email{padding:14px}.email-photo-grid{grid-template-columns:1fr}.email.v44-email{padding:14px!important}.v44-email .v44-mail-meta,.v44-email .v44-mail-meta tbody,.v44-email .v44-mail-meta tr{display:block!important;margin:8px 0 12px!important}.v44-email .v44-mail-meta td{display:block!important;width:auto!important;margin-bottom:5px!important}.v44-email .v44-schedule-summary{grid-template-columns:1fr!important}}
</style></head><body>${inner}</body></html>`;
}
function emailRendererSelfCheck114(){
  const renderer=activeEmailRenderer114();
  const chart=typeof combinedChartSvg==='function'&&typeof svgToPngDataUrl==='function';
  return {ok:typeof renderer==='function'&&chart,renderer:renderer?.name||'anonymous',chart,ops:typeof window.RigGOReportV12?.generateOpsPdfBlob==='function',indexedDB:!!window.indexedDB,emailEndpoint:!!window.RigGOSupabase?.functions?.invoke};
}
function cidRefs114(html){
  const out=[];String(html||'').replace(/cid:([^\s"'<>]+)/gi,(_,id)=>{const clean=String(id||'').trim();if(clean&&!out.includes(clean))out.push(clean);return _});return out;
}
function validateEmailMedia114(html,attachments){
  const refs=cidRefs114(html),ids=new Set((attachments||[]).map(a=>String(a.contentId||a.content_id||'').replace(/^<|>$/g,'').trim()).filter(Boolean));
  const missing=refs.filter(id=>!ids.has(id));
  if(missing.length)throw new Error('RigGO no pudo preparar las imágenes del correo: falta '+missing.join(', ')+'.');
  if(refs.includes('riggo-progress')&&!ids.has('riggo-progress'))throw new Error('RigGO no pudo preparar la gráfica Plan vs Actual.');
  if(/<img[^>]+src=["'](?:blob:|\.\.?\/|\/assets\/)/i.test(String(html||'')))throw new Error('RigGO detectó una imagen local no válida para correo.');
  return {ok:true,refs,attachmentIds:[...ids]};
}
/* 11.5.2 — rasterize the executive chart at its native 660×240 canvas.
   The active V61 renderer draws only inside 660×240. 11.4.x/11.5.1 wrapped
   that SVG markup in a 920×360 canvas, which created a transparent/white
   260 px right gutter and 120 px bottom gutter. Outlook scaled the whole
   oversized bitmap, making the chart look small and leaving a large blank
   space before Section 2. Native dimensions make the chart fill the exact
   632 px email content width with no artificial whitespace. */
async function progressPng114(m,p){
  if(typeof combinedChartSvg!=='function'||typeof svgToPngDataUrl!=='function')throw new Error('El generador de la gráfica Plan vs Actual no está disponible.');
  const png=await svgToPngDataUrl(combinedChartSvg(m,p),660,240);
  if(!/^data:image\/png;base64,/i.test(String(png||'')))throw new Error('RigGO no pudo convertir la gráfica Plan vs Actual a PNG.');
  return png;
}
function safePart(v){return String(v||'Rig').replace(/[^a-z0-9_-]+/gi,'_')}
function emailStatusText(status){return status==='sending'?'Enviando…':status==='sent'?'Enviado ✓':status==='retry_wait'?'Pendiente de reintento':status==='error'?'Error de envío':'Pendiente de envío'}
function fmtMailTime(iso){if(!iso)return'';try{return new Intl.DateTimeFormat('es-CO',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit',timeZone:'America/Bogota'}).format(new Date(iso))}catch(_){return String(iso)}}
function uuidMail114(){try{return crypto.randomUUID()}catch(_){return 'mail-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2)}}
function mailErrText114(x){if(x==null)return'';if(typeof x==='string')return x;if(typeof x?.message==='string')return x.message;if(typeof x?.error==='string')return x.error;if(typeof x?.error?.message==='string')return x.error.message;try{return JSON.stringify(x)}catch(_){return String(x)}}
function mailError114(message,meta={}){const e=new Error(message||'No fue posible enviar el correo.');Object.assign(e,meta);return e}
async function invokeEmail114(payload,idempotencyKey){
  if(!SB)throw mailError114('Supabase no disponible.',{retryable:true,kind:'transport'});
  const {data,error}=await SB.functions.invoke('riggo-send-email',{body:{...payload,idempotencyKey}});
  if(error){
    let body=null,status=Number(error?.context?.status||error?.status||0)||0;
    try{if(error.context&&typeof error.context.clone==='function'&&typeof error.context.clone().json==='function')body=await error.context.clone().json();else if(error.context&&typeof error.context.json==='function')body=await error.context.json()}catch(_){ }
    const providerStatus=Number(body?.providerStatus||status||0)||0,providerCode=String(body?.error?.name||body?.error?.code||body?.code||'').trim(),detail=mailErrText114(body?.error||body)||error.message||'No fue posible contactar el servicio de correo.';
    const transport=!status||/failed to fetch|network|load failed|fetch|timeout|connection|offline|networkerror/i.test(String(error?.message||detail||''));
    const retryable=transport||status===408||status===425||status===429||status>=500||providerStatus===408||providerStatus===425||providerStatus===429||providerStatus>=500;
    throw mailError114(detail,{status,providerStatus,providerCode,retryable,kind:transport?'transport':'provider',raw:body});
  }
  if(!data?.ok){
    const providerStatus=Number(data?.providerStatus||0)||0,providerCode=String(data?.error?.name||data?.error?.code||data?.code||'').trim(),detail=mailErrText114(data?.error||data)||'El proveedor no confirmó el envío.',retryable=providerStatus===408||providerStatus===425||providerStatus===429||providerStatus>=500;
    throw mailError114(detail,{providerStatus,providerCode,retryable,kind:'provider',raw:data});
  }
  return data;
}
function networkish(error){return error?.kind==='transport'||!online()||/failed to fetch|network|load failed|fetch|timeout|connection|offline|networkerror/i.test(String(error?.message||error||''))}
function retryDue114(record){if(record?.status==='pending'||record?.status==='queued')return true;if(record?.status!=='retry_wait')return false;const t=Date.parse(record.nextAttemptAt||'');return !Number.isFinite(t)||t<=Date.now()}
function compactMailError114(record){const bits=[];if(record.providerStatus)bits.push('HTTP '+record.providerStatus);if(record.providerCode)bits.push(record.providerCode);const msg=String(record.lastError||'').trim();if(msg)bits.push(msg);return bits.join(' · ')||'No fue posible enviar.'}
function patchMailUi114(record){
  try{
    const {c}=closureFor(record);if(c){c.sendStatus=record.status==='pending'?'queued':record.status;c.emailLastError=record.lastError||'';c.emailOutboxId=record.key}
    const btn=document.getElementById('sendFromReview'),result=document.getElementById('sendResult');
    if(btn){
      if(record.status==='sending'){btn.disabled=true;btn.textContent='Enviando…'}
      else if(record.status==='sent'){btn.disabled=true;btn.textContent='Enviado ✓'}
      else if(record.status==='error'){btn.disabled=false;btn.textContent='Reintentar envío'}
      else if(record.status==='retry_wait'||record.status==='pending'||record.status==='queued'){btn.disabled=true;btn.textContent='Pendiente de envío'}
    }
    if(result){
      if(record.status==='sending'){result.style.color='#a8c0ff';result.textContent='Enviando Daily Move Update + OPS…'}
      else if(record.status==='sent'){result.style.color='#8ae4ad';result.textContent='Enviado ✓ · '+fmtMailTime(record.sentAt)}
      else if(record.status==='error'){result.style.color='#ffafb8';result.textContent='Error de envío · '+compactMailError114(record)}
      else if(record.status==='retry_wait'){result.style.color='#f0b84a';result.textContent='Pendiente de reintento · RigGO intentará nuevamente al recuperar estabilidad.'}
      else{result.style.color='#f0b84a';result.textContent='Pendiente de envío · se enviará automáticamente al recuperar señal.'}
    }
    let box=document.querySelector('.v114-mail-status');
    if(box){const label=emailStatusText(record.status),detail=record.status==='error'?compactMailError114(record):record.status==='sending'?'Esperando confirmación del servicio de correo.':record.status==='sent'?fmtMailTime(record.sentAt):record.status==='retry_wait'?'Reintento automático programado.':'Guardado en bandeja de salida.';box.className='report-status v114-mail-status '+record.status;box.innerHTML='<b>'+esc(label)+'</b><div class="small muted" style="margin-top:4px">'+esc(detail)+'</div>'}
  }catch(_){ }
}

async function persistSentMetadata(record,response){
  const {m,p,c}=closureFor(record);if(!m||!p||!c||!SB)return false;
  try{
    const periodId=await window.RigGOReportV12.ensureDbPeriod(m,p);c.dbPeriodId=periodId;
    await window.RigGOReportV12.saveClosureRecord(m,p,c,periodId);
    let opsPath=c.opsStoragePath||record.opsStoragePath||'';
    const ops=record.payload?.attachments?.find(x=>/OPS-F0065/i.test(x.filename||''));
    if(!opsPath&&ops?.content){
      opsPath=`${m.id}/periods/${periodId}/reports/${ops.filename}`;
      const up=await SB.storage.from('riggo-files').upload(opsPath,b64Blob(ops.content,'application/pdf'),{contentType:'application/pdf',upsert:true,cacheControl:'3600'});
      if(up.error)throw up.error;c.opsStoragePath=opsPath;record.opsStoragePath=opsPath;
    }
    const existing=await SB.from('reports').select('id').eq('provider_message_id',response.messageId||record.messageId||'').limit(1);
    if(existing.error)throw existing.error;
    if(!(existing.data||[]).length){
      const q=await SB.from('reports').select('version').eq('move_id',m.id).eq('period_id',periodId).eq('report_type','daily_move_update').order('version',{ascending:false}).limit(1);if(q.error)throw q.error;
      const version=Number(q.data?.[0]?.version||0)+1;
      const ins=await SB.from('reports').insert({move_id:m.id,period_id:periodId,report_type:'daily_move_update',version,storage_path:null,recipients_to:record.payload.to||[],recipients_cc:record.payload.cc||[],status:'sent',generated_by:record.createdBy||userEmail(),provider_message_id:response.messageId||record.messageId||null,sent_at:record.sentAt||now()});if(ins.error)throw ins.error;
    }
    const u=await SB.from('daily_closures').update({sent_at:record.sentAt||now()}).eq('period_id',periodId);if(u.error)throw u.error;
    record.metadataSyncedAt=now();record.metadataError='';await mailPut(record);return true;
  }catch(e){record.metadataError=String(e?.message||e);record.metadataRetryAt=now();await mailPut(record);console.warn('RigGO 11.4 email metadata:',e);return false}
}

function applySentToLocal(record,response){
  const {m,c}=closureFor(record);if(!m||!c)return;
  c.sentAt=record.sentAt||now();c.sendStatus='sent';c.messageId=response.messageId||record.messageId||'';c.emailOutboxId=record.key;c.reportPhotoCount=record.photoCount||0;c.reportHadSignature=!!record.hadSignature;
  // Only clear raw evidence after provider ACK. The frozen outbox payload already contains the evidence sent.
  c.photos=[];c.photoCaptions=[];c.signature='';delete c.emailQueuedAt;delete c.emailLastError;
  try{save()}catch(_){try{saveLocal()}catch(__){}}
}
function applyPendingToLocal(record){
  const {c}=closureFor(record);if(!c)return;c.sendStatus=record.status==='error'?'error':record.status==='sending'?'sending':record.status==='retry_wait'?'retry_wait':'queued';c.emailOutboxId=record.key;c.emailQueuedAt=record.createdAt;c.emailLastError=record.lastError||'';try{saveLocal()}catch(_){ }
}

async function processEmailRecord(record,{manual=false}={}){
  if(!record||record.status==='sent')return record;
  record=await ensureRendererCurrent114(record);
  // Permanent provider/application errors are manual-only. Never create an automatic retry loop.
  if(record.status==='error'&&!manual)return record;
  if(!online()||!state?.auth?.logged){record.status='pending';record.nextAttemptAt='';await mailPut(record);applyPendingToLocal(record);patchMailUi114(record);return record}
  if(record.status==='retry_wait'&&!manual&&!retryDue114(record))return record;
  if(manual&&record.status==='error'){
    // A 409 idempotency conflict means this frozen payload cannot safely reuse the previous key.
    // Rotate only on an explicit user retry; automatic retries preserve the original key.
    if(Number(record.schemaVersion||0)<2||String(record.idempotencyKey||'').startsWith('riggo-daily-')||Number(record.providerStatus||0)===409||/idempot/i.test(String(record.providerCode||record.lastError||''))){record.deliveryId=uuidMail114();record.idempotencyKey=('riggo-email-'+record.deliveryId).slice(0,250);record.schemaVersion=2}
    record.lastError='';record.providerStatus=0;record.providerCode='';record.nextAttemptAt='';
  }
  record.status='sending';record.attempts=Number(record.attempts||0)+1;record.lastAttemptAt=now();await mailPut(record);applyPendingToLocal(record);patchMailUi114(record);
  try{
    const response=await invokeEmail114(record.payload,record.idempotencyKey);
    record.status='sent';record.sentAt=now();record.messageId=response.messageId||'';record.lastError='';record.providerStatus=0;record.providerCode='';record.nextAttemptAt='';
    const payloadForMeta={to:record.payload.to,cc:record.payload.cc,subject:record.payload.subject,replyTo:record.payload.replyTo};
    const metaOk=await persistSentMetadata(record,response);
    if(metaOk)record.payload=payloadForMeta;await mailPut(record);applySentToLocal(record,response);patchMailUi114(record);
    try{toast('Daily Move Update enviado ✓')}catch(_){ }
  }catch(e){
    record.lastError=String(e?.message||e);record.lastErrorAt=now();record.providerStatus=Number(e?.providerStatus||e?.status||0)||0;record.providerCode=String(e?.providerCode||'');record.errorKind=String(e?.kind||'');
    const retryable=networkish(e)||e?.retryable===true;
    record.status=retryable?'retry_wait':'error';
    record.nextAttemptAt=retryable?new Date(Date.now()+Math.min(300000,EMAIL_RETRY_MS*Math.max(1,record.attempts))).toISOString():'';
    await mailPut(record);applyPendingToLocal(record);patchMailUi114(record);console.warn('RigGO 11.5.3 email outbox:',{message:record.lastError,providerStatus:record.providerStatus,providerCode:record.providerCode,retryable});
  }
  return record;
}
async function drainEmailOutbox({onlyKey=null,manual=false}={}){
  if(mailDrainPromise){
    // Join the current drain once. Do NOT recursively re-drain a permanent error.
    await mailDrainPromise;
    if(!onlyKey)return {ok:true,joined:true};
    const current=await mailGet(onlyKey);
    if(!current||current.status==='sent'||current.status==='error'||current.status==='sending')return current||{ok:true,missing:true};
    if(!manual&&!retryDue114(current))return current;
  }
  mailDrainPromise=(async()=>{
    if(!online()||!state?.auth?.logged)return {ok:false,offline:true};
    const all=await mailAll();
    // A browser/app can be killed while a request is marked SENDING. Recover that
    // durable record after 45 s instead of leaving it stuck forever.
    for(const x of all){
      if(x.status==='sending'){
        const last=Date.parse(x.lastAttemptAt||'');
        if(!Number.isFinite(last)||Date.now()-last>45000){x.status='retry_wait';x.nextAttemptAt=now();x.lastError=x.lastError||'Envío interrumpido antes de recibir confirmación.';await mailPut(x);applyPendingToLocal(x);patchMailUi114(x)}
      }
    }
    const rows=all.filter(x=>{
      if(onlyKey&&x.key!==onlyKey)return false;
      if(x.status==='sent'||x.status==='sending')return false;
      if(x.status==='error')return !!manual;
      return manual||retryDue114(x);
    }).sort((a,b)=>String(a.createdAt).localeCompare(String(b.createdAt)));
    let sent=0,pending=0,errors=0;
    for(const row of rows){const r=await processEmailRecord(row,{manual});if(r.status==='sent')sent++;else if(r.status==='error')errors++;else pending++}
    for(const row of all.filter(x=>x.status==='sent'&&x.metadataError&&x.payload?.attachments?.length)){
      const ok=await persistSentMetadata(row,{messageId:row.messageId});if(ok){row.payload={to:row.payload.to,cc:row.payload.cc,subject:row.payload.subject,replyTo:row.payload.replyTo};await mailPut(row)}
    }
    return {ok:errors===0,sent,pending,errors};
  })().finally(()=>{mailDrainPromise=null});
  return mailDrainPromise;
}

async function buildFrozenEmail(m,p,c,to,cc,version){
  const originals=(c.photos||[]).slice();
  const [photos,pdf,progressPng]=await Promise.all([
    Promise.all(originals.slice(0,2).map(x=>photoPrepare(x))),
    window.RigGOReportV12.generateOpsPdfBlob(m,p,c),
    progressPng114(m,p)
  ]);
  const opsName=`OPS-F0065-S_${safePart(m.meta.rig)}_Dia${p.index}_${new Date().toISOString().replace(/[-:TZ.]/g,'').slice(0,14)}.pdf`;
  const attachments=[
    {filename:opsName,content:await blob64(pdf),contentType:'application/pdf'},
    {filename:`RigGO_Progress_${safePart(m.meta.rig)}_Dia${p.index}.png`,content:b64(progressPng),contentId:'riggo-progress',contentType:'image/png'}
  ];
  photos.filter(Boolean).forEach((x,i)=>attachments.push({filename:`RigGO_Photo_${i+1}.jpg`,content:b64(x),contentId:`photo-${i+1}`,contentType:'image/jpeg'}));
  const ec={...clone(c),photos,photoCaptions:(c.photoCaptions||[]).slice(0,2),siteSupervisorRole:c.siteSupervisorRole||'Rig Manager'};
  const html=renderFrozenEmail114(m,p,ec);
  const media=validateEmailMedia114(html,attachments);
  return {
    payload:{to,cc,subject:subject114(m,p),html,replyTo:userEmail()||undefined,attachments},
    opsName,photoCount:photos.filter(Boolean).length,hadSignature:!!c.signature,version,media,emailRendererVersion:EMAIL_RENDERER_VERSION
  }
}

async function ensureRendererCurrent114(record){
  if(!record||record.status==='sent'||Number(record.emailRendererVersion||0)>=EMAIL_RENDERER_VERSION)return record;
  const {m,p,c}=closureFor(record);if(!m||!p||!c||!record.payload)return record;
  const attachments=clone(record.payload.attachments||[]),progress=await progressPng114(m,p);let found=false;
  for(let i=0;i<attachments.length;i++){const id=String(attachments[i]?.contentId||attachments[i]?.content_id||'').replace(/^<|>$/g,'');if(id==='riggo-progress'){attachments[i]={...attachments[i],filename:`RigGO_Progress_${safePart(m.meta.rig)}_Dia${p.index}.png`,content:b64(progress),contentId:'riggo-progress',contentType:'image/png'};found=true}}
  if(!found)attachments.push({filename:`RigGO_Progress_${safePart(m.meta.rig)}_Dia${p.index}.png`,content:b64(progress),contentId:'riggo-progress',contentType:'image/png'});
  const photoAttachments=attachments.filter(a=>/^photo-\d+$/i.test(String(a?.contentId||a?.content_id||'').replace(/^<|>$/g,''))),ec={...clone(c),photos:photoAttachments.map((_,i)=>`outbox-photo-${i+1}`),photoCaptions:(c.photoCaptions||[]).slice(0,photoAttachments.length),siteSupervisorRole:c.siteSupervisorRole||'Rig Manager'};
  const html=renderFrozenEmail114(m,p,ec),media=validateEmailMedia114(html,attachments),deliveryId=uuidMail114();
  record.payload={...record.payload,html,attachments};record.media=media;record.emailRendererVersion=EMAIL_RENDERER_VERSION;record.schemaVersion=3;record.rendererMigratedAt=now();record.deliveryId=deliveryId;record.idempotencyKey=('riggo-email-'+deliveryId).slice(0,250);record.status='pending';record.attempts=0;record.lastError='';record.providerStatus=0;record.providerCode='';record.errorKind='';record.nextAttemptAt='';
  await mailPut(record);applyPendingToLocal(record);return record;
}

async function queueEmail114(m,p,c){
  const rawTo=c.deliveryTo??m.reportConfig?.dailyTo??'',rawCc=c.deliveryCc??m.reportConfig?.dailyCc??'';
  if(String(rawTo||'').length+String(rawCc||'').length>500)throw new Error('La distribución entre Para y CC no puede superar 500 caracteres.');
  const tp=parseRecipients(rawTo),cp=parseRecipients(rawCc),bad=[...(tp.invalid||[]),...(cp.invalid||[])];if(bad.length)throw new Error('Revisa: '+bad.join(', '));
  const dist=uniqueDistribution(tp.emails||[],cp.emails||[]);if(!dist.to.length)throw new Error('Agrega al menos un destinatario en Para.');if(dist.total>20)throw new Error('No exceder 20 direcciones de envío.');
  const existingKey=c.emailOutboxId,existing=existingKey?await mailGet(existingKey):null;
  if(existing&&['pending','queued','sending','retry_wait','error'].includes(existing.status))return Number(existing.emailRendererVersion||0)<EMAIL_RENDERER_VERSION?await ensureRendererCurrent114(existing):existing;
  const version=c.sentAt?Number(c.emailSendVersion||1)+1:Number(c.emailSendVersion||1)||1;
  const frozen=await buildFrozenEmail(m,p,c,dist.to,dist.cc,version),key=`daily:${m.id}:${p.id}:v${version}`,deliveryId=uuidMail114(),record={key,schemaVersion:3,emailRendererVersion:EMAIL_RENDERER_VERSION,type:'daily_move_update',moveId:m.id,periodLocalId:p.id,periodIndex:p.index,rig:m.meta.rig||'',createdAt:now(),createdBy:userEmail(),status:'pending',attempts:0,deliveryId,idempotencyKey:`riggo-email-${deliveryId}`.slice(0,250),...frozen};
  await mailPut(record);c.emailOutboxId=key;c.emailSendVersion=version;c.emailQueuedAt=record.createdAt;c.sendStatus='queued';c.emailLastError='';try{save()}catch(_){try{saveLocal()}catch(__){ }};return record;
}

/* Final send override: queue first, network second. Move sync is deliberately NOT a gate. */
sendDailyReport=async function(m,p,c){
  if(mailPreparing)return;if(!c.closedAt){alert('Cierra el día antes de enviar.');return}if(!c.f0065ReviewedAt){state.reportView='f0065';try{save()}catch(_){};render();return}
  const btn=typeof $==='function'?$('sendFromReview'):document.getElementById('sendFromReview'),result=typeof $==='function'?$('sendResult'):document.getElementById('sendResult');mailPreparing=true;
  if(btn){btn.disabled=true;btn.textContent='Preparando…'}if(result){result.style.color='#a8c0ff';result.textContent='Preparando Daily Move Update + OPS…'}
  try{
    const record=await queueEmail114(m,p,c);
    if(online()&&state?.auth?.logged){
      if(result){result.style.color='#a8c0ff';result.textContent='Enviando Daily Move Update + OPS…'}
      try{toast('Enviando Daily Move Update + OPS…')}catch(_){ }
      await drainEmailOutbox({onlyKey:record.key,manual:record.status==='error'});
      const finalRecord=await mailGet(record.key);if(finalRecord)patchMailUi114(finalRecord);
    }else{
      record.status='pending';record.nextAttemptAt='';await mailPut(record);applyPendingToLocal(record);patchMailUi114(record);
      if(result){result.style.color='#f0b84a';result.textContent='Pendiente de envío · se enviará automáticamente al recuperar señal.'}
      try{toast('Daily Move Update guardado · pendiente de señal')}catch(_){ }
    }
  }catch(e){console.error('RigGO 11.5 queue email:',e);if(result){result.style.color='#ffafb8';result.textContent='Error: '+String(e?.message||e)}else alert(String(e?.message||e))}
  finally{
    mailPreparing=false;const b=typeof $==='function'?$('sendFromReview'):document.getElementById('sendFromReview');
    if(b&&!c.sentAt){
      if(c.sendStatus==='sending'){b.disabled=true;b.textContent='Enviando…'}
      else if(c.sendStatus==='queued'){b.disabled=true;b.textContent='Pendiente de envío'}
      else if(c.sendStatus==='retry_wait'){b.disabled=true;b.textContent='Pendiente de reintento'}
      else if(c.sendStatus==='error'){b.disabled=false;b.textContent='Reintentar envío'}
      else{b.disabled=false;b.textContent='Enviar Daily Move Update + OPS'}
    }
  }
};

/* Review status: provider confirmation, not button press, defines "Enviado". */
const BASE_RENDER_REVIEW_114=typeof renderReview==='function'?renderReview:null;
if(BASE_RENDER_REVIEW_114)renderReview=function(){
  let h=BASE_RENDER_REVIEW_114.apply(this,arguments);try{const m=currentMove(),p=selectedPeriod(m),c=ensureClosure(m,p.id);if(!c)return h;
    if(c.sentAt){
      h=h.replace(/<div class="report-status"><b>Enviado ✓<\/b><div class="small muted" style="margin-top:4px">[\s\S]*?<\/div><\/div>/,`<div class="report-status"><b>Enviado ✓</b><div class="small muted" style="margin-top:4px">${esc(fmtMailTime(c.sentAt))}</div></div>`);
    }else if(['queued','pending','sending','retry_wait','error'].includes(c.sendStatus)){
      const label=c.sendStatus==='sending'?'Enviando…':c.sendStatus==='error'?'Error de envío':c.sendStatus==='retry_wait'?'Pendiente de reintento':'Pendiente de envío',detail=c.sendStatus==='error'?(c.emailLastError||'Revisa el detalle y usa Reintentar envío.'):(c.sendStatus==='retry_wait'?'RigGO reintentará automáticamente cuando corresponda.':(['queued','pending'].includes(c.sendStatus)?'Guardado en bandeja de salida. Puedes continuar con la operación.':'Esperando confirmación del servicio de correo.'));
      const box=`<div class="report-status v114-mail-status ${c.sendStatus}"><b>${esc(label)}</b><div class="small muted" style="margin-top:4px">${esc(detail)}</div></div>`;
      h=h.replace('<div class="panel" style="margin-bottom:12px">',box+'<div class="panel" style="margin-bottom:12px">');
      const lab=c.sendStatus==='sending'?'Enviando…':c.sendStatus==='error'?'Reintentar envío':c.sendStatus==='retry_wait'?'Pendiente de reintento':'Pendiente de envío';const dis=c.sendStatus==='error'?'':' disabled';h=h.replace(/<button id="sendFromReview" class="btn primary"[^>]*>[\s\S]*?<\/button>/,`<button id="sendFromReview" class="btn primary"${dis}>${lab}</button>`);
    }
  }catch(_){ }return h;
};

/* 11.5 Runtime Authority owns the Close Day event binding.
   Keep 11.4 email/outbox/media logic isolated here; do not call private V4 symbols. */

/* Compact connectivity pill: status detail remains in title/aria-label, header never shifts. */
function compactBadge(){document.querySelectorAll('.online-sync').forEach(el=>{const full=el.title||el.textContent||'';let short='Online';if(el.classList.contains('v112-offline')||/offline/i.test(full))short='Offline';else if(el.classList.contains('v112-syncing')||/sync|pendiente|conectando|reconcili/i.test(full))short='Sync';else if(el.classList.contains('v112-conflict')||el.classList.contains('bad')||/error|revisi|duplicado/i.test(full))short='Error';el.title=full;el.setAttribute('aria-label',full);if(el.textContent!==short)el.textContent=short})}
const badgeObserver=new MutationObserver(()=>compactBadge());
function observeBadge(){document.querySelectorAll('.online-sync').forEach(x=>badgeObserver.observe(x,{childList:true,characterData:true,subtree:true,attributes:true,attributeFilter:['class']}));compactBadge()}

/* Release identity and automatic outbox recovery. */
function stamp114(){const box=document.querySelector('.v5-admin-build');if(box){const b=box.querySelector('b');if(b)b.textContent='RigGO '+RELEASE;const s=box.querySelectorAll('span');if(s.length)s[s.length-1].textContent=BUILD}}
const BASE_RENDER_114=typeof render==='function'?render:null;if(BASE_RENDER_114)render=function(){const out=BASE_RENDER_114.apply(this,arguments);requestAnimationFrame(()=>{stamp114();observeBadge()});return out};
async function startMailServices114(){
  if(mailServicesPromise114)return mailServicesPromise114;
  mailServicesPromise114=(async()=>{
    await openMailDb();stamp114();observeBadge();
    if(!mailServicesStarted114){
      mailServicesStarted114=true;
      window.addEventListener('online',()=>setTimeout(()=>drainEmailOutbox().catch(e=>console.warn('RigGO email reconnect:',e)),250));
      document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&online()&&state?.auth?.logged)drainEmailOutbox().catch(()=>{})});
      setInterval(()=>{if(online()&&state?.auth?.logged)drainEmailOutbox().catch(()=>{})},EMAIL_RETRY_MS);
    }
    if(online()&&state?.auth?.logged)await drainEmailOutbox().catch(e=>console.warn('RigGO email initial drain:',e));
    return {ok:true,release:RELEASE};
  })().catch(e=>{mailServicesPromise114=null;throw e});
  return mailServicesPromise114;
}

window.RigGOV114={release:RELEASE,build:BUILD,listOutbox:mailAll,getOutbox:mailGet,drain:drainEmailOutbox,queue:queueEmail114,statusText:emailStatusText,renderFrozenEmail:renderFrozenEmail114,selfCheck:emailRendererSelfCheck114,buildFrozenEmail,cidRefs:cidRefs114,validateMedia:validateEmailMedia114,progressPng:progressPng114,rendererVersion:EMAIL_RENDERER_VERSION,enhanceReporting:enhanceEmailReporting114,ensureRendererCurrent:ensureRendererCurrent114,startServices:startMailServices114};
})();

/* ===== SOURCE riggo-v116.js (consolidated) ===== */
/* RigGO 12.1 - Legacy closure-payload compatibility only. NO execution recovery authority. */
(()=>{
'use strict';
const W=window,SB=W.RigGOSupabase||null;
const clone=v=>{try{return structuredClone(v)}catch(_){return JSON.parse(JSON.stringify(v))}};
function closurePayload(c){const x=clone(c||{});x.photos=[];x.signature='';if(Array.isArray(x.participants))x.participants=x.participants.map(p=>({...p,signature:''}));delete x.opsPdfBlob;return x}
function wrapClosurePersistence(){const R=W.RigGOReportV12;if(!R||R.__v116Wrapped||typeof R.saveClosureRecord!=='function')return !!R?.__v116Wrapped;const original=R.saveClosureRecord.bind(R);R.saveClosureRecord=async function(m,p,c,periodId){const out=await original(m,p,c,periodId);if(SB&&periodId){const {error}=await SB.from('daily_closures').update({closure_payload:closurePayload(c)}).eq('period_id',periodId);if(error)throw error}return out};R.__v116Wrapped=true;return true}
wrapClosurePersistence();
W.RigGOV116={release:'12.1.6b-stabilization-c2-fix4',build:'2026-08-22-1832-1216B-F4',closurePayload,wrapClosurePersistence,selfCheck:()=>({ok:!!W.RigGOReportV12?.__v116Wrapped,mode:'compatibility-only',recoveryAuthority:false,dailyClosureSchema:'closure_payload-only'})};
})();

/* ===== SOURCE riggo-v117.js (consolidated) ===== */
/* RigGO 11.7 · Daily Close Workflow + OPS Flat Time Detail C1
   Baseline: exact RigGO 11.6 Execution Integrity C1.
   Scope:
   - operational cutoff remains the true reporting boundary;
   - RM may prepare the daily close after the period starts, before cutoff;
   - an unchanged prepared day auto-finalizes once cutoff is reached;
   - OPS Flat Time shows event Start / End-or-Cutoff and explicit Treatment.
*/
(()=>{
'use strict';
const RELEASE='12.0.0-server-execution-authority-c1';
const BUILD='2026-08-20-2123-C1';
const W=window;
const BASE_F0065_117=typeof W.f0065Html==='function'?W.f0065Html:null;

function flatLabel117(type){
  try{return (FLAT_TYPES||[]).find(x=>x.id===type)?.label||type||'Flat Time'}catch(_){
    const m={community:'Comunidad / Bloqueos',mobility:'Restricciones de Movilidad',road:'Condiciones de Vía / Locación',move_company:'Empresa de Movilización / Transporte',preventive:'Mantenimiento Preventivo',rig_repair:'Reparación Rig / Acceptance',weather:'Clima / Tormenta',operator:'Operador / Terceros',hse:'HSE / Restricción Operacional',other:'Otros'};return m[type]||type||'Flat Time';
  }
}
function hours117(e){
  try{return Number(eventHours(e))||0}catch(_){const a=new Date(e?.start||e?.started_at||0),b=new Date(e?.end||e?.ended_at||0);return Number.isFinite(a.getTime())&&Number.isFinite(b.getTime())?Math.max(0,(b-a)/3600000):0}
}
function fmt117(v){
  try{return fmtDate(v,true)}catch(_){if(!v)return'—';const d=new Date(v);return Number.isFinite(d.getTime())?d.toLocaleString('es-CO',{timeZone:'America/Bogota',day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit',hour12:false}):'—'}
}
function esc117(v){try{return enc(v)}catch(_){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}}
function detail117(e){try{return eventDetailSummary(e)}catch(_){return e?.description||e?.subtype||e?.issue||''}}
function treatment117(v){return String(v||'Por definir').trim()||'Por definir'}
function treatmentStyle117(v){
  const k=treatment117(v).toLowerCase();
  if(k==='eximente')return'background:#dff5e8;color:#11623a;border:1px solid #9fd9b7';
  if(k==='facturable'||k==='tarifa negociada')return'background:#dceeff;color:#164f86;border:1px solid #a9cdef';
  if(k==='no facturable')return'background:#fde4e7;color:#8d2330;border:1px solid #efb4bd';
  if(k==='por definir'||k==='bajo revisión'||k==='bajo revision')return'background:#fff0c9;color:#765400;border:1px solid #e7ca78';
  return'background:#eef1f4;color:#4d5965;border:1px solid #cfd6dd';
}
function treatmentSummary117(events){
  const g={};for(const e of events||[]){const k=treatment117(e?.commercial);g[k]=(g[k]||0)+hours117(e)}
  const rows=Object.entries(g).sort((a,b)=>b[1]-a[1]);if(!rows.length)return'';
  return `<table class="f0065-table" style="margin-bottom:3mm"><tr><th>TRATAMIENTO</th><th>HORAS REGISTRADAS</th></tr>${rows.map(([k,v])=>`<tr><td><span style="display:inline-block;padding:1.2mm 2.5mm;border-radius:10mm;font-weight:800;font-size:7.5pt;${treatmentStyle117(k)}">${esc117(k.toUpperCase())}</span></td><td style="font-weight:800">${v.toFixed(2)} H</td></tr>`).join('')}</table>`;
}
function opsFlatDetails117(c){
  const events=c?.flatEvents||[];if(!events.length)return'SIN RETRASOS REPORTADOS EN EL PERIODO.';
  const cards=events.map(e=>{
    const tr=treatment117(e.commercial),ongoing=!!e.ongoing,end=e.end||e.ended_at||'',endLabel=ongoing?'CORTE':'FIN',detail=detail117(e);
    return `<div class="f0065-flat-event" style="margin:0 0 2.7mm;padding:2.2mm;border:1px solid #d9dee5;border-radius:2mm;page-break-inside:avoid"><div style="display:flex;align-items:center;justify-content:space-between;gap:3mm"><b style="font-size:8.5pt">${hours117(e).toFixed(2)} HORAS · ${esc117(flatLabel117(e.type).toUpperCase())}</b><span style="display:inline-block;white-space:nowrap;padding:1.2mm 2.4mm;border-radius:10mm;font-weight:800;font-size:7.3pt;${treatmentStyle117(tr)}">${esc117(tr.toUpperCase())}</span></div><div style="margin-top:1.4mm;font-size:7.8pt"><b>INICIO:</b> ${esc117(fmt117(e.start||e.started_at))} &nbsp; · &nbsp; <b>${endLabel}:</b> ${esc117(fmt117(end))}${ongoing?' &nbsp; · &nbsp; <b>CONTINÚA ACTIVO</b>':''}</div><div style="margin-top:1mm;font-size:7.7pt">${e.responsibility?`<b>RESPONSABILIDAD:</b> ${esc117(String(e.responsibility).toUpperCase())}`:'<b>RESPONSABILIDAD:</b> POR DEFINIR'}${e.affected?` &nbsp; · &nbsp; <b>AFECTA:</b> ${esc117(String(e.affected).toUpperCase())}`:''}${e.company?` &nbsp; · &nbsp; <b>COMPAÑÍA:</b> ${esc117(String(e.company).toUpperCase())}`:''}</div>${detail?`<div style="margin-top:1mm;font-size:7.7pt;line-height:1.25">${esc117(String(detail).toUpperCase())}</div>`:''}</div>`;
  }).join('');
  return cards;
}
function opsF0065Html117(m,p,c){
  if(!BASE_F0065_117)throw new Error('Renderer OPS base no disponible.');
  let h=BASE_F0065_117(m,p,c),summary=treatmentSummary117(c?.flatEvents||[]);
  if(summary){const marker='<div class="f0065-underline">ADELANTOS O RETRASOS DEL CRONOGRAMA / FLAT TIME:</div>';h=h.replace(marker,marker+summary)}
  return h;
}

// f0065Html resolves fFlatDetails at render time; replacing the shared global
// renderer upgrades both on-screen OPS preview and the PDF without touching email.
W.fFlatDetails=opsFlatDetails117;
if(BASE_F0065_117)W.f0065Html=opsF0065Html117;

function selfCheck(){return {ok:typeof W.fFlatDetails==='function'&&W.fFlatDetails===opsFlatDetails117&&typeof W.f0065Html==='function'&&W.f0065Html===opsF0065Html117,release:RELEASE,build:BUILD}}
W.RigGOV117={release:RELEASE,build:BUILD,opsFlatDetails:opsFlatDetails117,opsF0065Html:opsF0065Html117,treatmentSummary:treatmentSummary117,selfCheck};
})();

/* ===== SOURCE riggo-v120.js (consolidated) ===== */
/* RigGO 12.1 · Execution Server Truth / Mutation Observer C1 */
(()=>{
'use strict';
const W=window,SB=W.RigGOSupabase;
const RELEASE='12.1.6b-stabilization-c2-fix4',BUILD='2026-08-22-1832-1216B-F4';
const DB='riggo-execution-v120',STORE='outbox';
let dbp=null,flushP=null,hydrateP=null,timer=null,suppressLoader=0,flushAgain=false;
const dirty=new Set(), observed=new Map();
const clone=v=>{try{return structuredClone(v)}catch(_){return JSON.parse(JSON.stringify(v))}};
const uuid=()=>crypto.randomUUID?crypto.randomUUID():`op-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const online=()=>navigator.onLine!==false;
const transportError=e=>navigator.onLine===false||/failed to fetch|networkerror|network request failed|load failed|timeout|connection (?:lost|reset|refused)|offline/i.test(String(e?.message||e?.details||e?.hint||e||''));
const staleRunError=x=>/stale_execution_run/i.test(String(x?.code||x?.message||x?.details||x?.error||x||''));
const editorActive=()=>{const e=document.activeElement;return !!e&&(/^(INPUT|TEXTAREA|SELECT)$/.test(e.tagName)||e.isContentEditable)};
function openDb(){if(dbp)return dbp;dbp=new Promise((res,rej)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>{const d=r.result;if(!d.objectStoreNames.contains(STORE))d.createObjectStore(STORE,{keyPath:'moveId'})};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});return dbp}
const req=r=>new Promise((res,rej)=>{r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
async function get(id){const d=await openDb(),t=d.transaction(STORE,'readonly');return req(t.objectStore(STORE).get(id))}
async function all(){const d=await openDb(),t=d.transaction(STORE,'readonly');return req(t.objectStore(STORE).getAll())}
async function put(v){const d=await openDb();return new Promise((res,rej)=>{const t=d.transaction(STORE,'readwrite');t.objectStore(STORE).put(v);t.oncomplete=()=>res(v);t.onerror=()=>rej(t.error)})}
async function del(id){const d=await openDb();return new Promise((res,rej)=>{const t=d.transaction(STORE,'readwrite');t.objectStore(STORE).delete(id);t.oncomplete=()=>res();t.onerror=()=>rej(t.error)})}
function compactLoadHistory122F5(list){if(!Array.isArray(list)||list.length<2)return Array.isArray(list)?list:[];const seen=new Set(),out=[];for(const h of list){if(!h||typeof h!=='object'){out.push(h);continue}const c={...h};delete c.id;const k=stable(c);if(seen.has(k))continue;seen.add(k);out.push(h)}return out}
function sanitizeExec(m){const e=clone(m?.exec||{});delete e.selectedPeriodId;delete e.loadScope;e.periods=[];for(const list of [e.tasksRD,e.tasksRU,e.loads])for(const x of (Array.isArray(list)?list:[])){if(Array.isArray(x.history))x.history=compactLoadHistory122F5(x.history);delete x._historyMigrated;if(x.isUnplanned!==true)delete x.isUnplanned}for(const c of Object.values(e.closures||{})){if(!c)continue;c.photos=[];c.signature='';if(Array.isArray(c.participants))c.participants=c.participants.map(p=>({...p,signature:''}));delete c.opsPdfBlob;delete c.__loadedPhotoPaths;delete c.__loadedSignaturePath}return e}
const stable=v=>JSON.stringify(v);
function fp(m){return stable(sanitizeExec(m))}
function observe(m){if(!m?.id)return;observed.set(m.id,fp(m));dirty.delete(m.id)}
function observeAll(){for(const m of state?.moves||[])observe(m)}
function merge3(base,local,remote){if(stable(local)===stable(base))return clone(remote);if(stable(remote)===stable(base))return clone(local);if(Array.isArray(local)||Array.isArray(remote)||Array.isArray(base)){const arr=x=>Array.isArray(x)?x:[],key=(x,i)=>String(x?.id??x?.seq??`${x?.day||''}|${x?.text||x?.description||''}|${i}`),bm=new Map(arr(base).map((x,i)=>[key(x,i),x])),lm=new Map(arr(local).map((x,i)=>[key(x,i),x])),rm=new Map(arr(remote).map((x,i)=>[key(x,i),x]));return [...new Set([...bm.keys(),...lm.keys(),...rm.keys()])].map(k=>merge3(bm.get(k),lm.get(k),rm.get(k))).filter(v=>v!==undefined)}const obj=x=>x&&typeof x==='object';if(obj(local)&&obj(remote)&&obj(base)){const out={},ks=new Set([...Object.keys(base||{}),...Object.keys(local||{}),...Object.keys(remote||{})]);for(const k of ks)out[k]=merge3(base?.[k],local?.[k],remote?.[k]);return out}return clone(remote===undefined?local:remote)}
function preserveMedia(server,local){server=server||{};server.closures=server.closures||{};for(const [id,lc] of Object.entries(local?.closures||{})){const sc=server.closures?.[id];if(!sc)continue;if((lc.photos||[]).length)sc.photos=clone(lc.photos);if(lc.signature)sc.signature=lc.signature;if(Array.isArray(lc.participants)&&Array.isArray(sc.participants))sc.participants.forEach((p,i)=>{if(lc.participants[i]?.signature)p.signature=lc.participants[i].signature})}if(local?.selectedPeriodId!=null)server.selectedPeriodId=local.selectedPeriodId;if(local?.loadScope!=null)server.loadScope=local.loadScope;return server}
async function readRows(ids){if(!SB||!ids.length)return[];const {data,error}=await SB.rpc('riggo_execution_read_c4',{p_move_ids:ids});if(error)throw error;return data||[]}
function allowed(m){return !!m&&!m._resetInProgress&&['active','closed'].includes(String(m.status||''))}
function evidence(payload){const e=payload?.exec?payload.exec:(payload||{});let n=0;for(const list of [e.tasksRD,e.tasksRU])for(const x of (Array.isArray(list)?list:[]))if(String(x?.doneAt||'').trim())n++;for(const x of (Array.isArray(e.loads)?e.loads:[]))if(String(x?.loadedAt||x?.transitAt||x?.positionedAt||'').trim())n++;for(const c of Object.values(e.closures||{})){if(!c)continue;const reported=c.reported||{};if(Object.keys(c).some(k=>!['photos','signature','participants','photoStoragePaths','signatureStoragePath'].includes(k)&&c[k]!==''&&c[k]!=null&&(!(Array.isArray(c[k]))||c[k].length)&&(!(typeof c[k]==='object'&&!Array.isArray(c[k]))||Object.keys(c[k]||{}).length)))n++;if(['rd','rm','ru'].some(k=>Number(reported?.[k]||0)>0))n++}return n}
function recoveryCandidate(m,serverPayload,pending,serverResolved=false){const localPayload=sanitizeExec(m),localEvidence=evidence(localPayload),serverEvidence=evidence(serverPayload),differs=stable(localPayload)!==stable(serverPayload);return !!m&&allowed(m)&&!serverResolved&&localEvidence>0&&{required:true,moveId:m.id,localEvidence,serverEvidence,differs,serverRevision:Number(m.execSyncMeta?.revision)||0,hasPending:!!pending}}
async function recoverFromLocal(m){if(!m?.id||!m.execRecovery?.required)throw new Error('No hay recuperación pendiente.');const payload=sanitizeExec(m),expected=Number(m.execSyncMeta?.revision)||0;const {data,error}=await SB.rpc('riggo_execution_recover_c4',{p_move_id:m.id,p_payload:payload,p_expected_revision:expected,p_operation_id:uuid()});if(error)throw error;if(!data?.ok)throw new Error(data?.message||data?.code||'No fue posible recuperar la ejecución.');m.exec=preserveMedia(clone(data.execution_payload||payload),m.exec||{});m.execSyncMeta={revision:Number(data.revision)||expected+1,lastServerFingerprint:stable(data.execution_payload||payload),lastServerPayload:clone(data.execution_payload||payload),updatedAt:data.updated_at||'',updatedBy:data.updated_by||'',c4Resolved:true};m.execRecovery=null;try{await del(m.id)}catch(_){};dirty.delete(m.id);observe(m);try{saveLocal()}catch(_){};return data}
function dataUrlBlob(src){const m=String(src||'').match(/^data:([^;,]+)?(;base64)?,(.*)$/s);if(!m)throw new Error('Formato de media no válido.');const mime=m[1]||'application/octet-stream',raw=m[2]?atob(m[3]):decodeURIComponent(m[3]),a=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)a[i]=raw.charCodeAt(i);return new Blob([a],{type:mime})}
function blobDataUrl(blob){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=()=>rej(r.error||new Error('No fue posible leer media.'));r.readAsDataURL(blob)})}
async function syncClosureMedia(moveId,closureId){if(!online()||!SB)return{ok:false,offline:true};const m=(state.moves||[]).find(x=>x.id===moveId),c=m?.exec?.closures?.[closureId];if(!m||!c)return{ok:false,missing:true};c.photoStoragePaths=Array.isArray(c.photoStoragePaths)?c.photoStoragePaths:[];let changed=false;for(let i=0;i<(c.photos||[]).length;i++){if(c.photoStoragePaths[i]||!String(c.photos[i]||'').startsWith('data:'))continue;const blob=dataUrlBlob(c.photos[i]),ext=(blob.type||'image/jpeg').includes('png')?'png':'jpg',path=`${moveId}/execution/${closureId}/photos/${uuid()}.${ext}`;const up=await SB.storage.from('riggo-files').upload(path,blob,{contentType:blob.type||'image/jpeg',upsert:false,cacheControl:'3600'});if(up.error)throw up.error;c.photoStoragePaths[i]=path;changed=true}if(c.signature&&String(c.signature).startsWith('data:')){const path=c.signatureStoragePath||`${moveId}/execution/${closureId}/signature.png`,blob=dataUrlBlob(c.signature),up=await SB.storage.from('riggo-files').upload(path,blob,{contentType:'image/png',upsert:true,cacheControl:'3600'});if(up.error)throw up.error;if(c.signatureStoragePath!==path){c.signatureStoragePath=path;changed=true}}if(changed){markDirty(m);await persistNow(m)}return{ok:true,changed}}
async function removeMediaPath(path){if(!path||!online()||!SB)return;const {error}=await SB.storage.from('riggo-files').remove([path]);if(error)console.warn('RigGO C4 media remove',error)}
async function restoreClosureMedia(m,c){if(!SB||!online()||!c)return;const paths=Array.isArray(c.photoStoragePaths)?c.photoStoragePaths.filter(Boolean):[];if(paths.length){const localPaths=Array.isArray(c.__loadedPhotoPaths)?c.__loadedPhotoPaths:[];if(stable(localPaths)!==stable(paths)){const photos=[];for(const path of paths){const {data,error}=await SB.storage.from('riggo-files').download(path);if(error)throw error;photos.push(await blobDataUrl(data))}c.photos=photos;c.__loadedPhotoPaths=clone(paths)}}if(c.signatureStoragePath&&c.__loadedSignaturePath!==c.signatureStoragePath){const {data,error}=await SB.storage.from('riggo-files').download(c.signatureStoragePath);if(error)throw error;c.signature=await blobDataUrl(data);c.__loadedSignaturePath=c.signatureStoragePath}}
async function restoreMediaForMove(m){for(const c of Object.values(m?.exec?.closures||{}))try{await restoreClosureMedia(m,c)}catch(e){console.warn('RigGO C4 media hydrate',e)}}
async function syncAllMedia(){if(!online()||!SB)return;for(const m of state?.moves||[])for(const [closureId,c] of Object.entries(m?.exec?.closures||{})){const missingPhoto=(c?.photos||[]).some((x,i)=>String(x||'').startsWith('data:')&&!c?.photoStoragePaths?.[i]),signaturePending=!!c?.signature&&String(c.signature).startsWith('data:')&&!c?.signatureStoragePath;if(missingPhoto||signaturePending)try{await syncClosureMedia(m.id,closureId)}catch(e){console.warn('RigGO C4 media background sync',e)}}}
function markDirty(m){if(!m?.id||!allowed(m))return false;const cur=fp(m),base=observed.get(m.id);if(base===undefined){observed.set(m.id,cur);dirty.delete(m.id);return false}if(cur!==base){dirty.add(m.id);return true}dirty.delete(m.id);return false}
function markCurrentDirty(){const id=state?.selectedMoveId,m=(state?.moves||[]).find(x=>x.id===id);return m?markDirty(m):false}
async function queue(m,{force=false}={}){if(!m?.id||!allowed(m))return null;const payload=sanitizeExec(m),fingerprint=stable(payload),meta=m.execSyncMeta||{},prev=await get(m.id),base=observed.get(m.id);if(prev&&stable(prev.payload)===fingerprint){observed.set(m.id,fingerprint);dirty.add(m.id);return prev}if(!force&&base!==undefined&&fingerprint===base){dirty.delete(m.id);return null}if(!force&&base===undefined){observed.set(m.id,fingerprint);dirty.delete(m.id);return null}const item={moveId:m.id,operationId:uuid(),generation:Number(prev?.generation||0)+1,expectedRevision:Number(prev?.expectedRevision??meta.revision??0),basePayload:clone(prev?.basePayload??meta.lastServerPayload??{}),payload,fingerprint,localFingerprint:fingerprint,createdAt:prev?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};dirty.add(m.id);await put(item);observed.set(m.id,fingerprint);if(flushP)flushAgain=true;return item}
async function queueAllChanged(){const pending=await all(),ids=new Set([...dirty,...pending.map(x=>x.moveId)]);for(const id of ids){const m=(state?.moves||[]).find(x=>x.id===id);if(m)await queue(m)}}
function applyServerMeta(m,item,data){if(!m)return;m.execSyncMeta={revision:Number(data.revision)||1,lastServerFingerprint:item.fingerprint||stable(item.payload),lastServerPayload:clone(item.payload),updatedAt:data.updated_at||'',updatedBy:data.updated_by||''};m.execIntegrity=null}
// A reset starts a different execution run. Never merge old-run closures,
// media or load progress into its pristine baseline, even after a CAS retry.
function runChanged(local,remote){return !!remote?._riggoRunId&&String(local?._riggoRunId||'')!==String(remote._riggoRunId)}
async function adoptRun(m,row){
  if(!m||!row)return;
  await del(m.id);dirty.delete(m.id);
  m.exec=clone(row.payload||{});m.exec.selectedPeriodId=null;
  m.execSyncMeta={revision:Number(row.revision)||0,lastServerPayload:clone(row.payload||{}),lastServerFingerprint:stable(row.payload||{}),updatedAt:row.updated_at||'',updatedBy:row.updated_by||'',c4Resolved:true};
  m.execRecovery=null;m.execIntegrity=null;
  if(!m.exec.actualRelease){m.status='ready';m.syncMeta=m.syncMeta||{};m.syncMeta.serverStatus='ready'}
  observe(m);try{saveLocal()}catch(_){}
}
async function reconcileStaleRun(item){
  const rows=await readRows([item.moveId]),remote=rows[0];
  if(!remote)return false;
  if(!runChanged(item.payload,remote.payload))return false;
  const m=(state.moves||[]).find(x=>x.id===item.moveId);
  if(m)await adoptRun(m,remote);else await del(item.moveId);
  return true;
}
async function discardKnownStaleOutbox(item,live){
  const known=live?.execSyncMeta?.lastServerPayload||null;
  if(!known||!runChanged(item.payload,known))return false;
  const rows=await readRows([item.moveId]),remote=rows[0];
  if(!remote)return false;
  if(!runChanged(item.payload,remote.payload))return false;
  if(live)await adoptRun(live,remote);else await del(item.moveId);
  return true;
}
async function acceptReset(m,data){return adoptRun(m,{payload:data.execution_payload,revision:data.execution_revision,updated_at:data.updated_at,updated_by:data.updated_by})}
async function rebasePendingAgainstRemote(item,remote){if(runChanged(item.payload,remote.payload)){const m=(state.moves||[]).find(x=>x.id===item.moveId);if(m)await adoptRun(m,remote);else await del(item.moveId);return null}const current=await get(item.moveId),target=current||item,oldBase=clone(target.basePayload||item.basePayload||{});target.payload=merge3(oldBase,target.payload||{},remote.payload||{});target.fingerprint=stable(target.payload);target.localFingerprint=target.fingerprint;target.expectedRevision=Number(remote.revision)||0;target.basePayload=clone(remote.payload||{});target.operationId=uuid();target.generation=Number(target.generation||0)+1;target.rebasedAt=new Date().toISOString();await put(target);observed.set(item.moveId,target.fingerprint);dirty.add(item.moveId);return target}
async function flushCore(){if(!online()||!SB)return{ok:false,offline:true};let sent=0,conflicts=0,blocked=0,noop=0,round=0;while(round++<20){const items=await all();if(!items.length)break;let progressed=false;for(const original of items){const item=clone(original);const live=(state.moves||[]).find(x=>x.id===item.moveId);if(live?._resetInProgress){blocked++;continue}if(live?.execRecovery?.required){blocked++;continue}
// 12.3.7: if C4 already knows this outbox belongs to a different run, never send it.
try{if(await discardKnownStaleOutbox(item,live)){progressed=true;continue}}catch(e){if(transportError(e))return{ok:false,transportFailure:true,error:e,sent,conflicts,blocked,noop};blocked++;continue}
let response;try{response=await SB.rpc(item.payload?._riggoRunId?'riggo_execution_save_v3':'riggo_execution_save_v2',{p_move_id:item.moveId,p_payload:item.payload,p_expected_revision:item.expectedRevision,p_operation_id:item.operationId})}catch(e){if(transportError(e))return{ok:false,transportFailure:true,error:e,sent,conflicts,blocked,noop};const current=await get(item.moveId);if(current?.operationId===item.operationId){current.blockedCode=e?.code||'rpc_error';current.lastError=e?.message||String(e);current.blockedAt=new Date().toISOString();await put(current)}return{ok:false,transportFailure:false,serverFailure:true,error:e,sent,conflicts,blocked:blocked+1,noop}}
const data=response?.data;
if(response?.error){const e=response.error;if(staleRunError(e)){try{if(await reconcileStaleRun(item)){progressed=true;continue}}catch(re){if(transportError(re))return{ok:false,transportFailure:true,error:re,sent,conflicts,blocked,noop}}}if(transportError(e))return{ok:false,transportFailure:true,error:e,sent,conflicts,blocked,noop};const current=await get(item.moveId);if(current?.operationId===item.operationId){current.blockedCode=e?.code||'rpc_error';current.lastError=e?.message||String(e);current.blockedAt=new Date().toISOString();await put(current)}return{ok:false,transportFailure:false,serverFailure:true,error:e,sent,conflicts,blocked:blocked+1,noop}}
if(staleRunError(data)){try{if(await reconcileStaleRun(item)){progressed=true;continue}}catch(e){if(transportError(e))return{ok:false,transportFailure:true,error:e,sent,conflicts,blocked,noop}}const current=await get(item.moveId);if(current?.operationId===item.operationId){current.blockedCode='stale_execution_run';current.lastError=data?.message||'La Move pertenece a otra corrida. Actualiza RigGO.';current.blockedAt=new Date().toISOString();await put(current)}blocked++;continue}
if(data?.ok){if(data.no_change)noop++;else sent++;progressed=true;const m=(state.moves||[]).find(x=>x.id===item.moveId),current=await get(item.moveId),same=current?.operationId===item.operationId,liveFp=m?fp(m):'',unchanged=!!m&&liveFp===(item.localFingerprint||item.fingerprint);if(same&&unchanged&&m)m.exec=preserveMedia(clone(item.payload),m.exec||{});applyServerMeta(m,item,data);if(same){await del(item.moveId);if(m&&!unchanged){markDirty(m);await queue(m,{force:true})}else{dirty.delete(item.moveId);if(m)observe(m)}}else if(current){current.expectedRevision=Number(data.revision)||current.expectedRevision;current.basePayload=clone(item.payload);current.rebasedAfterAckAt=new Date().toISOString();await put(current);dirty.add(item.moveId)}continue}
if(data?.code==='revision_conflict'){conflicts++;const rows=await readRows([item.moveId]),remote=rows[0];if(!remote){blocked++;continue}await rebasePendingAgainstRemote(item,remote);progressed=true;continue}
const current=await get(item.moveId);if(current?.operationId===item.operationId){current.blockedCode=data?.code||'server_rejected';current.lastError=data?.message||data?.error||'Operación rechazada';current.blockedAt=new Date().toISOString();await put(current)}blocked++}if(!progressed||blocked)break}return{ok:blocked===0,sent,conflicts,blocked,noop,pending:(await all()).length}}
function flush(){if(flushP){flushAgain=true;return flushP}flushP=(async()=>{let result;do{flushAgain=false;result=await flushCore()}while(flushAgain&&online());return result})().finally(()=>{flushP=null});return flushP}
async function hydrateCore({renderNow=false}={}){if(!SB||!online()||!state?.auth?.logged)return{ok:false,offline:!online()};if(!document.documentElement.classList.contains('riggo-booting')&&(editorActive()||window.__RIGGO_MEDIA_PICKER_ACTIVE__||window.__RIGGO_FIELD_COMMIT_PENDING__))return{ok:true,deferred:true,reason:window.__RIGGO_MEDIA_PICKER_ACTIVE__?'media-picker':'active-editor'};const moves=state.moves||[],ids=moves.map(m=>m.id),rows=await readRows(ids),by=new Map(rows.map(r=>[r.move_id,r])),pending=new Map((await all()).map(x=>[x.moveId,x]));let changed=false,integrity=0,recovery=0;for(const m of moves){const r=by.get(m.id),old=clone(m.exec||{});let p=pending.get(m.id);const localPayload=sanitizeExec(m),meta=m.execSyncMeta||{};if(r){const serverPayload=clone(r.payload||{});if(runChanged(localPayload,serverPayload)){await adoptRun(m,r);pending.delete(m.id);changed=true;continue}if(p&&runChanged(p.payload,serverPayload)){await adoptRun(m,r);pending.delete(m.id);changed=true;continue}m.execSyncMeta={revision:Number(r.revision)||1,lastServerFingerprint:stable(serverPayload),lastServerPayload:clone(serverPayload),updatedAt:r.updated_at||'',updatedBy:r.updated_by||'',c4Resolved:!!r.c4_resolved};const candidate=recoveryCandidate(m,serverPayload,p,!!r.c4_resolved);if(candidate){candidate.serverRevision=Number(r.revision)||1;m.execRecovery=candidate;recovery++;m.execIntegrity=null;observed.set(m.id,stable(localPayload));dirty.add(m.id);continue}else m.execRecovery=null;if(p&&Number(p.expectedRevision||0)!==Number(r.revision||0)){p=await rebasePendingAgainstRemote(p,r)}let next=p?clone(p.payload||serverPayload):dirty.has(m.id)?merge3(meta.lastServerPayload||serverPayload,localPayload,serverPayload):serverPayload;next=preserveMedia(next,old);if(stable(sanitizeExec({exec:old}))!==stable(sanitizeExec({exec:next}))){m.exec=next;changed=true}m.execIntegrity=null;if(p)observed.set(m.id,stable(sanitizeExec(m)));else if(!dirty.has(m.id))observe(m);await restoreMediaForMove(m)}else{m.execSyncMeta=meta.revision!=null?meta:{revision:0,lastServerFingerprint:'',lastServerPayload:{}};m.execRecovery=null;if(allowed(m)){m.execIntegrity={code:'missing_execution_state',message:'La Move está activa en servidor pero no existe un estado de ejecución autoritativo.'};integrity++}observe(m)}}try{saveLocal()}catch(_){}if(renderNow&&(changed||integrity||recovery)&&!editorActive())render();if(pending.size&&!recovery)setTimeout(()=>flush().then(()=>hydrateExecution({renderNow:true})).catch(e=>console.warn('RigGO C4 pending reconcile',e)),0);setTimeout(()=>syncAllMedia().catch(()=>{}),0);return{ok:true,changed,pending:pending.size,integrity,recovery}}
function hydrateExecution(o){if(hydrateP)return hydrateP;hydrateP=hydrateCore(o).finally(()=>hydrateP=null);return hydrateP}
async function persistNow(m){if(!markDirty(m)){const p=await get(m?.id);if(!p)return{ok:true,synced:true,noChange:true}}await queue(m);if(!online())return{ok:false,offline:true,pending:true};const r=await flush();const p=await get(m.id);return{ok:!!r.ok,synced:!!r.ok&&!p,pending:!!p,...r}}
function setActivated(m,data,actualRelease){if(!m||!data?.ok)return;m.status='active';m.syncMeta=m.syncMeta||{};m.syncMeta.revision=Number(data.master_revision||data.revision||m.syncMeta.revision||1);m.syncMeta.serverStatus='active';m.exec=preserveMedia(clone(data.execution_payload||{}),m.exec||{});m.exec.actualRelease=m.exec.actualRelease||actualRelease;m.execSyncMeta={revision:Number(data.execution_revision)||1,lastServerFingerprint:stable(sanitizeExec(m)),lastServerPayload:clone(sanitizeExec(m)),updatedAt:data.updated_at||'',updatedBy:data.updated_by||''};m.execIntegrity=null;observe(m)}
async function completeMove(m,actualAcceptance,lessons=''){
  if(!m?.id||!actualAcceptance)throw new Error('Actual Rig Acceptance requerido.');
  if(!online()||!SB)throw new Error('Se requiere conexión para cerrar la Move.');
  if(String(m.syncMeta?.serverStatus||m.status)!=='active')throw new Error('La Move no está ACTIVE en servidor.');
  const pre=await persistNow(m);if(pre?.blocked||pre?.transportFailure||pre?.pending)throw new Error('Hay cambios de ejecución pendientes de sincronizar. Intenta nuevamente con conexión estable.');
  const closeAt=new Date().toISOString(),payload=sanitizeExec(m);payload.actualAcceptance=actualAcceptance;payload.moveClosedAt=closeAt;
  const response=await SB.rpc(payload?._riggoRunId?'riggo_complete_move_v3':'riggo_complete_move_v2',{p_move_id:m.id,p_actual_acceptance:actualAcceptance,p_expected_master_revision:Number(m.syncMeta?.revision)||0,p_expected_execution_revision:Number(m.execSyncMeta?.revision)||0,p_execution_payload:payload,p_closeout_lessons:String(lessons||''),p_operation_id:uuid()});
  if(response?.error){if(staleRunError(response.error)){const rows=await readRows([m.id]);if(rows[0]&&runChanged(payload,rows[0].payload))await adoptRun(m,rows[0])}throw response.error}const data=response?.data;if(staleRunError(data)){const rows=await readRows([m.id]);if(rows[0]&&runChanged(payload,rows[0].payload))await adoptRun(m,rows[0]);throw new Error(data?.message||'La Move pertenece a otra corrida. Actualiza RigGO.')}if(!data?.ok)throw new Error(data?.message||data?.code||'No fue posible cerrar la Move.');
  m.status='closed';m.syncMeta=m.syncMeta||{};m.syncMeta.serverStatus='closed';m.syncMeta.revision=Number(data.master_revision)||m.syncMeta.revision||1;
  m.exec=preserveMedia(clone(data.execution_payload||payload),m.exec||{});m.exec.actualAcceptance=actualAcceptance;m.exec.moveClosedAt=data.completed_at||m.exec.moveClosedAt||closeAt;m.closeoutLessons=String(lessons||'');
  m.execSyncMeta={revision:Number(data.execution_revision)||m.execSyncMeta?.revision||1,lastServerFingerprint:stable(sanitizeExec(m)),lastServerPayload:clone(sanitizeExec(m)),updatedAt:data.updated_at||'',updatedBy:data.updated_by||''};m.execIntegrity=null;observe(m);
  try{await del(m.id)}catch(_){};dirty.delete(m.id);return data
}
function filterActivityRows(q){q=String(q||'').trim().toLowerCase();document.querySelectorAll('.v3-task-panel .task,.v3-task-panel .v3-load-row').forEach(el=>{const t=(el.textContent||'').toLowerCase();el.style.display=!q||t.includes(q)?'':'none'})}
function filterMoveCards(q){q=String(q||'').trim().toLowerCase();document.querySelectorAll('[data-openmove],[data-openpending]').forEach(b=>{const card=b.closest('.move-card,.v41-move-card,.card')||b.parentElement,t=(card?.textContent||'').toLowerCase();if(card)card.style.display=!q||t.includes(q)?'':'none'})}
async function withoutLoader(fn){suppressLoader++;try{return await fn()}finally{suppressLoader--}}
function patchLoader(){const L=W.RigGOLoader;if(!L||L.__v121)return;const show=L.show.bind(L);L.show=(m,s)=>suppressLoader?null:show(m,s);L.__v121=true}
function neutralizeDestructive(){const deny=()=>{throw new Error('RigGO 12.1: el reinicio/reversión destructiva de ejecución está bloqueado. Use una corrección operacional auditable.')};try{if(W.RigGOV59){W.RigGOV59.fullExecutionReset=deny;W.RigGOV59.rollbackFromDay=deny}}catch(_){};try{if(W.RigGOV60)W.RigGOV60.resetExecutionFromDayOne=deny}catch(_){};for(const k of ['fullExecutionReset','rollbackFromDay','resetExecutionFromDayOne'])try{W[k]=deny}catch(_){};document.querySelectorAll('#resetMove,#v59ResetExec,[data-v59-rollback]').forEach(e=>e.remove())}
function injectIntegrity(){const m=(state?.moves||[]).find(x=>x.id===state?.selectedMoveId);if(state?.screen!=='execute'||!m)return;const host=document.querySelector('main,#app,.app-main')||document.body;if(m.execRecovery?.required&&!document.querySelector('[data-riggo-recovery]')){host.insertAdjacentHTML('afterbegin',`<div data-riggo-recovery class="panel" style="border-color:#f59e0b;margin-bottom:12px"><b>Recuperación de ejecución requerida</b><div class="small" style="margin-top:5px">C4 debe fijar una única verdad de ejecución. Confirma esta acción únicamente desde el dispositivo que contiene los porcentajes correctos; después los demás dispositivos obedecerán a Supabase.</div><button data-riggo-recover-now class="btn primary" style="margin-top:9px">Confirmar este avance como verdad del servidor</button></div>`);const b=document.querySelector('[data-riggo-recover-now]');if(b)b.onclick=async()=>{if(!confirm('¿Confirmas que ESTE dispositivo contiene el avance correcto de la Move? Esta acción lo fijará como la autoridad C4 auditada en Supabase.'))return;try{b.disabled=true;b.textContent='Publicando…';await recoverFromLocal(m);await hydrateExecution({renderNow:false});try{saveLocal()}catch(_){};W.render?.();W.toast?.('Avance recuperado en servidor ✓')}catch(e){b.disabled=false;b.textContent='Confirmar este avance como verdad del servidor';alert('No fue posible recuperar: '+String(e?.message||e))}}}if(m.execIntegrity&&!document.querySelector('[data-riggo-integrity]'))host.insertAdjacentHTML('afterbegin',`<div data-riggo-integrity class="panel" style="border-color:#ef4444;margin-bottom:12px"><b>Integrity Error</b><div class="small">${String(m.execIntegrity.message||'Execution state missing')}</div></div>`)}
const BASE_RENDER=typeof W.render==='function'?W.render:null;if(BASE_RENDER)W.render=function(){if(editorActive()&&!document.documentElement.classList.contains('riggo-booting')){W.__RIGGO_RENDER_DEFERRED__=true;return}const r=BASE_RENDER.apply(this,arguments);requestAnimationFrame(()=>{neutralizeDestructive();injectIntegrity()});return r};
document.addEventListener('focusout',()=>{if(W.__RIGGO_RENDER_DEFERRED__){W.__RIGGO_RENDER_DEFERRED__=false;setTimeout(()=>{if(!editorActive())W.render?.()},0)}});
patchLoader();neutralizeDestructive();new MutationObserver(neutralizeDestructive).observe(document.documentElement,{subtree:true,childList:true});
const BASE_SAVE=W.save;if(typeof BASE_SAVE==='function')W.save=function(){const r=BASE_SAVE.apply(this,arguments);if(markCurrentDirty()){clearTimeout(timer);timer=setTimeout(()=>{queueAllChanged().then(()=>online()?flush():null).catch(e=>console.warn('RigGO 12.1 exec save',e))},260)}return r};
W.RigGOV120={release:RELEASE,build:BUILD,acceptReset,queue,queueAllChanged,flush,hydrateExecution,persistNow,filterActivityRows,filterMoveCards,withoutLoader,neutralizeDestructive,sanitizeExec,markDirty,observe,observeAll,setActivated,completeMove,recoverFromLocal,evidence,syncClosureMedia,syncAllMedia,removeMediaPath,restoreMediaForMove,pendingCount:async()=>(await all()).length,listOutbox:all,selfCheck:()=>({ok:!!SB&&!!indexedDB,release:RELEASE,build:BUILD,readAuthority:'riggo_execution_read_c4',recoveryAuthority:'riggo_execution_recover_c4',conflictPolicy:'server-wins-overlap',runIdentityPolicy:'server-wins-no-merge'})};
})();

/* ===== SOURCE riggo-v115.js (consolidated) ===== */
/* RigGO 11.7 · Runtime Authority + Daily Close Workflow C1
   Purpose: one public authority for critical UI actions and boot.
   This module does not redesign RigGO. It stabilizes the proven historical
   layers by preventing private-scope calls from newer modules and by routing
   critical actions through explicit public APIs.
*/
(()=>{
'use strict';
const RELEASE='12.0.1-execution-race-safety-c1';
const BUILD='2026-08-21-0835-C1';
const MIN_CLOSE_MS=4500;
const MIN_PREPARE_MS=1800;
const PREPARED_CHECK_MS=60000;
const CLOSE_SYNC_BUDGET_MS=5500;
const ERR_KEY='riggo_runtime_errors_v115';
const W=window;
const clone=v=>{try{return structuredClone(v)}catch(_){return JSON.parse(JSON.stringify(v))}};
const now=()=>new Date().toISOString();
const email=()=>String(state?.auth?.email||'').trim().toLowerCase();
const isOnline=()=>navigator.onLine!==false;
const getMove=id=>(state?.moves||[]).find(m=>m.id===id)||null;
const current=()=>typeof W.currentMove==='function'?W.currentMove():null;
const periodFor=m=>typeof W.selectedPeriod==='function'?W.selectedPeriod(m):null;
const closureFor=(m,p)=>m&&p&&typeof W.ensureClosure==='function'?W.ensureClosure(m,p.id):null;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const closeSyncs=new Map();
const LEGACY_DUPLICATE_115=typeof W.v4DuplicateMove==='function'?W.v4DuplicateMove:null;
const safePart=v=>String(v||'Rig').replace(/[^a-z0-9_-]+/gi,'_');
const networkish=e=>!isOnline()||/failed to fetch|network|load failed|fetch|timeout|connection|offline|networkerror/i.test(String(e?.message||e||''));

function recordRuntimeError(area,error,extra={}){
  const row={at:now(),release:RELEASE,area,message:String(error?.message||error||'Unknown error'),stack:String(error?.stack||''),...extra};
  try{const a=JSON.parse(localStorage.getItem(ERR_KEY)||'[]');a.push(row);localStorage.setItem(ERR_KEY,JSON.stringify(a.slice(-40)))}catch(_){}
  console.error('[RigGO 11.7]',area,error,extra);
  return row;
}
function runtimeErrors(){try{return JSON.parse(localStorage.getItem(ERR_KEY)||'[]')}catch(_){return[]}}
function saveLocalDurable(){
  try{if(typeof W.saveLocal==='function')W.saveLocal()}catch(e){recordRuntimeError('saveLocal',e)}
}
function renderNow(){try{if(typeof W.render==='function')W.render()}catch(e){recordRuntimeError('render',e);throw e}}
function topNow(){try{if(typeof W.v4Top==='function')W.v4Top();else W.scrollTo({top:0,behavior:'smooth'})}catch(_){} }
function requireAdmin(){try{return !!W.hasPerm?.('admin')}catch(_){return false}}

async function persistMove(m){
  if(!m)return {synced:false,missing:true};
  const A=W.RigGOV112;
  if(!A?.persistNow)throw new Error('Move Authority no está disponible.');
  return A.persistNow(m);
}
async function startMove(m,actualRelease){
  const A=W.RigGOV112;if(!A?.startMove)throw new Error('Start Move Authority no está disponible.');
  return A.startMove(m,actualRelease);
}

async function deleteMove(m){
  if(!m)return;
  if(!requireAdmin()){try{W.toast?.('Esta acción es exclusiva de Administradores.')}catch(_){};return}
  if(!confirm(`Eliminar ${m.meta?.rig||'esta Move'}?\n\nLa eliminación quedará protegida en servidor y podrá restaurarse desde Administración.`))return;
  const A=W.RigGOV112;if(!A?.queueDelete||!A?.flush)throw new Error('Delete Authority no está disponible.');
  m.management=m.management||{};m.management.deletedAt=now();m.management.deletedBy=email();m.audit=m.audit||[];m.audit.push({at:m.management.deletedAt,user:email(),action:'delete_move',mode:'runtime_authority_v115'});
  if(state.selectedMoveId===m.id)state.selectedMoveId=null;
  state.screen='admin';state.adminMoveView='moves';state.adminMoveStatus='active';
  saveLocalDurable();await A.queueDelete(m);renderNow();
  try{W.toast?.(isOnline()?'Eliminando Move…':'Move eliminada localmente · pendiente de sincronización')}catch(_){}
  if(isOnline()){const r=await A.flush();if(!r?.transportFailure)await A.hydrate()}
}
async function restoreMove(m){
  if(!m||!requireAdmin())return;
  const A=W.RigGOV112;if(!A?.queueRestore||!A?.flush)throw new Error('Restore Authority no está disponible.');
  m.management=m.management||{};const wasDeleted=!!m.management.deletedAt;
  delete m.management.deletedAt;delete m.management.deletedBy;delete m.management.archivedAt;delete m.management.archivedBy;
  m.audit=m.audit||[];m.audit.push({at:now(),user:email(),action:'restore_move',mode:'runtime_authority_v115'});
  saveLocalDurable();
  if(wasDeleted)await A.queueRestore(m);else await A.queueSave(m,{force:true});
  renderNow();
  if(isOnline()){
    const r=await A.flush();
    if(!r?.transportFailure&&wasDeleted){await A.queueSave(m,{force:true});await A.flush()}
    await A.hydrate();
  }
}
async function archiveMove(m){
  if(!m||!requireAdmin())return;
  if(!confirm(`Archivar ${m.meta?.rig||'esta Move'}?`))return;
  m.management=m.management||{};m.management.archivedAt=now();m.management.archivedBy=email();m.audit=m.audit||[];m.audit.push({at:m.management.archivedAt,user:email(),action:'archive_move',mode:'runtime_authority_v115'});
  W.RigGOV112?.markDirty?.(m);saveLocalDurable();renderNow();
  const ack=await persistMove(m);if(ack?.synced&&W.RigGOV112?.hydrate)await W.RigGOV112.hydrate();
}
function editMove(m){
  if(!m)return;
  const editor=W.RigGOV112?.openEditMove;
  if(typeof editor!=='function')throw new Error('Editor Authority no está disponible.');
  return editor(m);
}
function duplicateMove(m){
  if(!m)return;
  if(typeof LEGACY_DUPLICATE_115!=='function')throw new Error('Duplicar Move no está disponible.');
  // Duplication keeps the proven planning clone behavior; any server persistence
  // still goes through the final V112 save/outbox authority via save().
  return LEGACY_DUPLICATE_115(m);
}


function validateDay115(c,p){
  if(!c?.f0065ReviewedAt)throw new Error('Primero debes revisar el OPS-F0065-S.');
  if(typeof W.validateClosure==='function'){const v=W.validateClosure(c,p);if(!v?.ok)throw new Error('Completa antes de cerrar: '+(v?.missing||[]).join(', '))}
}
function ms115(v){const n=new Date(v||0).getTime();return Number.isFinite(n)?n:NaN}
function hash115(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(16).padStart(8,'0')}
function prepFingerprint115(m,p,c){
  const ev=(c?.flatEvents||[]).map(e=>({id:e.id,type:e.type,start:e.start,end:e.end,ongoing:!!e.ongoing,responsibility:e.responsibility,commercial:e.commercial,affected:e.affected,company:e.company,subtype:e.subtype,issue:e.issue,resource:e.resource,capacity:e.capacity,failureMode:e.failureMode,description:e.description}));
  const snap={period:{id:p?.id,start:p?.start,end:p?.end,cutoff:p?.cutoffTime},reported:c?.reported,overrides:c?.overrides,progressNotes:c?.progressNotes,scope:c?.scope,milestones:c?.milestones,flatEvents:ev,originOps:c?.originOps,destinationOps:c?.destinationOps,next24:c?.next24,generalComment:c?.generalComment,crew:c?.crew,vehicles:c?.vehicles,lmc:c?.lmc,hse:c?.hse,photoCount:(c?.photos||[]).length,photoCaptions:c?.photoCaptions,signature:!!c?.signature,siteSupervisor:c?.siteSupervisor,siteSupervisorRole:c?.siteSupervisorRole,safetyTopic:c?.safetyTopic,safetyUnderstood:c?.safetyUnderstood,permitsDay:c?.permitsDay,permitsAcc:c?.permitsAcc,risksDay:c?.risksDay,risksAcc:c?.risksAcc,ocDay:c?.ocDay,ocAcc:c?.ocAcc,tasksRD:(m?.exec?.tasksRD||[]).map(x=>[x.id,x.doneAt||'']),loads:(m?.exec?.loads||[]).map(x=>[x.id,x.loadedAt||'',x.transitAt||'',x.positionedAt||'']),tasksRU:(m?.exec?.tasksRU||[]).map(x=>[x.id,x.doneAt||''])};
  return hash115(JSON.stringify(snap));
}
function closeWorkflow115(m,p,c,clock=Date.now()){
  const start=ms115(p?.start),end=ms115(p?.end),started=Number.isFinite(start)&&clock>=start,due=Number.isFinite(end)&&clock>=end,prepared=!!c?.preparedAt,current=prepared?prepFingerprint115(m,p,c):'',dirty=prepared&&!!c?.preparedFingerprint&&current!==c.preparedFingerprint;
  return {started,due,prepared,dirty,start,end,current,closed:!!c?.closedAt,sent:!!c?.sentAt};
}
function markDayClosedLocal115(m,p,c,{closedAt=null,action='close_day',mode='runtime_authority_v115_local_first',closedBy=null}={}){
  const first=!c.closedAt;c.closedAt=c.closedAt||closedAt||now();c.closedBy=c.closedBy||closedBy||email();c.reportStep=6;c.reportVisited=c.reportVisited||{};c.reportVisited[5]=true;c.masterMovePendingSync=true;c.offlinePendingOpsUpload=true;
  if(c.preparedAt)c.preparedFinalizedAt=c.preparedFinalizedAt||now();
  if(first){m.audit=m.audit||[];m.audit.push({at:now(),user:email()||c.closedBy||'',action,period:p.id,cutoff:p.cutoffTime||'',operationalClosedAt:c.closedAt,preparedAt:c.preparedAt||null,mode})}
  W.RigGOV112?.markDirty?.(m);saveLocalDurable();try{W.save?.()}catch(_){}
  return first;
}
function ensureNextDay115(m,p){
  try{const phys=typeof W.v4Physical==='function'?W.v4Physical(m):null;if(phys&&!phys.complete&&typeof W.movePeriods==='function'&&typeof W.v4EnsureNextDay==='function'){const ps=W.movePeriods(m);let next=ps.find(x=>x.index>p.index&&!m.exec?.closures?.[x.id]?.closedAt);if(!next)W.v4EnsureNextDay(m,p.index)}}catch(e){recordRuntimeError('ensureNextDay',e,{moveId:m?.id,periodId:p?.id})}
}
async function prepareDay(m,p,c,{minMs=MIN_PREPARE_MS}={}){
  if(!m||!p||!c)throw new Error('No fue posible identificar la Move/Día actual.');if(c.closedAt)return {ok:true,alreadyClosed:true};
  const flow=closeWorkflow115(m,p,c);if(!flow.started)throw new Error(`Este día aún no ha iniciado. Inicio: ${typeof W.fmtDate==='function'?W.fmtDate(p.start,true):p.start}.`);
  validateDay115(c,p);const startedAt=performance.now(),loader=W.RigGOLoader?.show?.('Preparando cierre…',`OPS Día ${p.index} · corte ${p.cutoffTime||''}`);
  try{
    const fingerprint=prepFingerprint115(m,p,c),same=c.preparedAt&&c.preparedFingerprint===fingerprint;
    if(!same){c.preparedAt=now();c.preparedBy=email();c.preparedForEnd=p.end;c.preparedFingerprint=fingerprint;c.preparedVersion=1;delete c.preparedNeedsReview;delete c.preparedDirtyAt;m.audit=m.audit||[];m.audit.push({at:c.preparedAt,user:email(),action:c.preparedAt?'prepare_day':'prepare_day',period:p.id,cutoff:p.cutoffTime||'',periodEnd:p.end,mode:'daily_close_workflow_v117'})}
    W.RigGOV112?.markDirty?.(m);saveLocalDurable();try{W.save?.()}catch(_){}
    if(isOnline())persistMove(m).catch(e=>recordRuntimeError('prepareDay.persist',e,{moveId:m.id,periodId:p.id}));
    const remain=Math.max(0,minMs-(performance.now()-startedAt));if(remain)await sleep(remain);
    state.screen='review';state.reportView='f0065';saveLocalDurable();renderNow();topNow();try{W.toast?.(`OPS preparado · corte ${p.cutoffTime||''}`)}catch(_){}
    return {ok:true,prepared:true,cutoff:p.end};
  }finally{if(loader)W.RigGOLoader?.hide?.(loader)}
}
async function ensureOpsServer115(m,p,c,{background=false}={}){
  const R=W.RigGOReportV12,SB=W.RigGOSupabase;if(!R||!SB)throw new Error('OPS/Supabase no disponible.');
  const periodId=c.dbPeriodId||await R.ensureDbPeriod(m,p);c.dbPeriodId=periodId;
  let path=c.opsStoragePath||'';
  if(!path){
    const filename=`OPS-F0065-S_${safePart(m.meta?.rig)}_Dia${p.index}.pdf`;path=`${m.id}/periods/${periodId}/reports/${filename}`;
    const pdf=background&&W.RigGOV120?.withoutLoader?await W.RigGOV120.withoutLoader(()=>R.generateOpsPdfBlob(m,p,c)):await R.generateOpsPdfBlob(m,p,c);const up=await SB.storage.from('riggo-files').upload(path,pdf,{contentType:'application/pdf',upsert:true,cacheControl:'3600'});if(up.error)throw up.error;c.opsStoragePath=path;
  }
  // Repair partial historical closes: a Storage object and a report row are checked separately.
  const existing=await SB.from('reports').select('id').eq('move_id',m.id).eq('period_id',periodId).eq('report_type','f0065').eq('storage_path',path).limit(1);if(existing.error)throw existing.error;
  if(!(existing.data||[]).length){
    const q=await SB.from('reports').select('version').eq('move_id',m.id).eq('period_id',periodId).eq('report_type','f0065').order('version',{ascending:false}).limit(1);if(q.error)throw q.error;
    const version=Number(q.data?.[0]?.version||0)+1;const ins=await SB.from('reports').insert({move_id:m.id,period_id:periodId,report_type:'f0065',version,storage_path:path,recipients_to:[],recipients_cc:[],status:'generated',generated_by:email()});if(ins.error)throw ins.error;
  }
  await R.saveClosureRecord(m,p,c,periodId);return {periodId,path};
}
async function syncClosedDay(m,p,c,{background=false}={}){
  if(!m||!p||!c)throw new Error('Día no disponible para sincronización.');if(!isOnline())return {ok:false,offline:true,pending:true};
  const key=`${m.id}:${p.id}`;if(closeSyncs.has(key))return closeSyncs.get(key);
  const task=(async()=>{
    try{
      const ops=await ensureOpsServer115(m,p,c,{background});
      const ack=await persistMove(m);
      if(!ack?.synced){c.masterMovePendingSync=true}else delete c.masterMovePendingSync;
      delete c.offlinePendingOpsUpload;delete c.opsSyncLastError;delete c.opsSyncRetryAt;c.opsSyncedAt=now();saveLocalDurable();
      return {ok:true,ops,moveSynced:!!ack?.synced};
    }catch(e){
      c.offlinePendingOpsUpload=true;c.masterMovePendingSync=true;c.opsSyncLastError=String(e?.message||e);c.opsSyncRetryAt=now();saveLocalDurable();recordRuntimeError(background?'syncClosedDay.background':'syncClosedDay',e,{moveId:m.id,periodId:p.id,networkish:networkish(e)});throw e;
    }finally{closeSyncs.delete(key)}
  })();closeSyncs.set(key,task);return task;
}
async function closeDay(m,p,c,{minMs=MIN_CLOSE_MS}={}){
  if(!m||!p||!c)throw new Error('No fue posible identificar la Move/Día actual.');
  if(c.closedAt){state.screen='review';state.reportView='email';saveLocalDurable();renderNow();topNow();return {ok:true,alreadyClosed:true,pending:!!c.offlinePendingOpsUpload}}
  const flow=closeWorkflow115(m,p,c);if(!flow.started)throw new Error(`Este día aún no ha iniciado.`);
  validateDay115(c,p);const started=performance.now(),early=!flow.due,loader=W.RigGOLoader?.show?.('Cerrando día…',early?`Cierre anticipado · corte operacional ${p.cutoffTime||''}`:'Guardando el Día y preparando Daily Move Update');
  try{
    if(early){c.closedBeforeCutoff=true;c.closedBeforeCutoffAt=now();c.scheduledCutoffAt=p.end;c.scheduledCutoffTime=p.cutoffTime||''}
    delete c.preparedNeedsReview;
    markDayClosedLocal115(m,p,c,{action:early?'close_day_early':'close_day',mode:early?'manual_early_close_v1234':'manual_close_v1234'});ensureNextDay115(m,p);
    let syncResult={ok:false,offline:true,pending:true};
    if(isOnline()){
      const live=syncClosedDay(m,p,c).catch(e=>({ok:false,pending:true,error:e}));
      syncResult=await Promise.race([live,sleep(CLOSE_SYNC_BUDGET_MS).then(()=>({ok:false,pending:true,timeout:true}))]);
      if(syncResult?.timeout){c.offlinePendingOpsUpload=true;c.masterMovePendingSync=true;saveLocalDurable();live.catch(()=>{})}
    }
    state.screen='review';state.reportView='email';saveLocalDurable();
    const remain=Math.max(0,minMs-(performance.now()-started));if(remain)await sleep(remain);renderNow();topNow();
    try{W.toast?.(syncResult?.ok?`Día ${p.index} cerrado${early?' antes del corte':''} · Daily Move Update listo`:`Día ${p.index} cerrado · sincronización en background`)}catch(_){}
    return {ok:true,early,pending:!syncResult?.ok,sync:syncResult};
  }catch(e){recordRuntimeError('closeDay',e,{moveId:m.id,periodId:p.id});throw e}
  finally{if(loader)W.RigGOLoader?.hide?.(loader)}
}

async function finalizeDuePreparedDays115({renderAfter=false}={}){
  // 12.3.4: daily closure is always an explicit user action. Legacy prepared
  // records remain auditable, but RigGO no longer auto-closes a day at cutoff.
  return {ok:true,closed:0,needsReview:0,manualCloseAuthority:true};
}
async function sendDaily(m,p,c){
  if(typeof W.sendDailyReport!=='function')throw new Error('Email Outbox no está disponible.');
  try{return await W.sendDailyReport(m,p,c)}catch(e){recordRuntimeError('sendDaily',e,{moveId:m?.id,periodId:p?.id});throw e}
}

const actions={persistMove,startMove,deleteMove,restoreMove,archiveMove,editMove,duplicateMove,prepareDay,closeDay,finalizePreparedDays:finalizeDuePreparedDays115,syncClosedDay,sendDaily};

// Public compatibility aliases. Historical V4 closures may have captured their
// original lexical functions, so the final wire layer below still replaces the
// actual buttons. These aliases ensure every *dynamic* caller after boot lands
// on Runtime Authority instead of a legacy implementation.
W.v4ArchiveClose=closeDay;
W.v4DeleteMove=deleteMove;
W.v4RestoreMove=restoreMove;
W.v4EditMove=editMove;
W.v4ArchiveMove=archiveMove;
W.v4DuplicateMove=duplicateMove;

function replaceButton(el,handler){
  if(!el)return null;const n=el.cloneNode(true);el.replaceWith(n);n.addEventListener('click',handler);return n;
}
function bindReviewAuthority(){
  const m=current(),p=m?periodFor(m):null,c=m&&p?closureFor(m,p):null;if(!m||!p||!c)return;
  const close=document.getElementById('v4CloseDay');
  if(close){const flow=closeWorkflow115(m,p,c),button=replaceButton(close,async e=>{
    const b=e.currentTarget,result=document.getElementById('v4CloseResult'),live=closeWorkflow115(m,p,c);b.disabled=true;b.textContent='Cerrando…';
    try{if(result){result.style.color='#a8c0ff';result.textContent=live.due?'Guardando OPS y cerrando el día…':`Cerrando ahora · el corte operacional ${p.cutoffTime||''} se conserva como límite del período…`};await actions.closeDay(m,p,c)}
    catch(err){if(result){result.style.color='#ffafb8';result.textContent='Error: '+String(err?.message||err)}else alert(String(err?.message||err));if(document.body.contains(b)){b.disabled=false;b.textContent=`Cerrar Día ${p.index}`}}
  });
    const result=document.getElementById('v4CloseResult');button.disabled=false;
    if(!flow.started){button.disabled=true;button.textContent='Día aún no iniciado';if(result){result.style.color='#a8c0ff';result.textContent='El cierre estará disponible una vez iniciado el período.'}}
    else{button.textContent=`Cerrar Día ${p.index}`;if(result){result.style.color='#a8c0ff';result.textContent=flow.due?'Puedes cerrar el día ahora.':`Cierre manual disponible ahora · el corte operacional sigue siendo ${p.cutoffTime||''}.`}}
  }
  const send=document.getElementById('sendFromReview');
  if(send&&!c.sentAt&&c.sendStatus!=='sending'&&c.sendStatus!=='queued')replaceButton(send,async e=>{
    const b=e.currentTarget;try{await actions.sendDaily(m,p,c)}catch(err){if(document.body.contains(b)&&!c.sentAt){b.disabled=false;b.textContent='Reintentar envío'}}
  });
}
function bindAdminAuthority(){
  const bind=(selector,fn)=>document.querySelectorAll(selector).forEach(old=>replaceButton(old,()=>{const id=old.dataset.v4Editmove||old.dataset.v4Delete||old.dataset.v4Restore||old.dataset.v4Archive||old.dataset.v4Duplicate;const m=getMove(id);Promise.resolve(fn(m)).catch(e=>{recordRuntimeError('adminAction',e,{id});alert(String(e?.message||e))})}));
  bind('[data-v4-editmove]',actions.editMove);bind('[data-v4-delete]',actions.deleteMove);bind('[data-v4-restore]',actions.restoreMove);bind('[data-v4-archive]',actions.archiveMove);bind('[data-v4-duplicate]',actions.duplicateMove);
}

const BASE_WIRE_REVIEW_115=typeof W.wireReview==='function'?W.wireReview:null;
if(BASE_WIRE_REVIEW_115)W.wireReview=function(){const r=BASE_WIRE_REVIEW_115.apply(this,arguments);bindReviewAuthority();return r};
const BASE_WIRE_ADMIN_115=typeof W.wireAdmin==='function'?W.wireAdmin:null;
if(BASE_WIRE_ADMIN_115)W.wireAdmin=function(){const r=BASE_WIRE_ADMIN_115.apply(this,arguments);bindAdminAuthority();return r};

function decoratePreparedDays115(){
  const m=current();if(!m||typeof W.movePeriods!=='function')return;let ps=[];try{ps=W.movePeriods(m)}catch(_){return}
  for(const p of ps){const c=m.exec?.closures?.[p.id];if(!c?.preparedAt||c.closedAt)continue;const flow=closeWorkflow115(m,p,c),btn=document.querySelector(`[data-v3-day="${p.id}"]`),card=btn?.closest('.v3-day-card');if(btn)btn.textContent=`Revisar Día ${p.index}`;if(card){const cut=card.querySelector('.cut');if(cut&&!cut.querySelector('.v117-prepared')){const span=document.createElement('span');span.className='v117-prepared';span.style.cssText=`margin-left:6px;font-weight:800;color:${flow.dirty?'#f0b84a':'#35c46a'}`;span.textContent=flow.dirty?'· Cambios después del pre-cierre':'· Listo para cierre manual';cut.appendChild(span)}}}
}
function startPreparedLifecycle115(){
  // 12.3.4: no automatic daily closure. Users close the day explicitly.
  W.__RIGGO_PREPARED_TIMER__=null;
  return {ok:true,manualCloseAuthority:true};
}

function selfCheck(){
  const A=W.RigGOV112,R=W.RigGOReportV12,E=W.RigGOV114;
  const checks={
    moveAuthority:typeof A?.persistNow==='function'&&typeof A?.startMove==='function'&&typeof A?.queueSave==='function'&&typeof A?.flush==='function'&&typeof A?.hydrate==='function'&&typeof A?.startServices==='function',
    deleteAuthority:typeof A?.queueDelete==='function',
    restoreAuthority:typeof A?.queueRestore==='function',
    closeDay:typeof W.validateClosure==='function'&&typeof W.v4Physical==='function'&&typeof W.v4EnsureNextDay==='function'&&typeof actions.syncClosedDay==='function',
    editMove:typeof A?.openEditMove==='function',
    adminActions:typeof W.v4DuplicateMove==='function'&&typeof W.v4ArchiveMove==='function',
    executionContext:typeof W.currentMove==='function'&&typeof W.selectedPeriod==='function'&&typeof W.ensureClosure==='function'&&typeof W.movePeriods==='function',
    ops:typeof R?.generateOpsPdfBlob==='function'&&typeof R?.saveClosureRecord==='function'&&typeof R?.ensureDbPeriod==='function',
    emailOutbox:typeof E?.buildFrozenEmail==='function'&&typeof E?.drain==='function'&&typeof E?.startServices==='function'&&typeof W.sendDailyReport==='function',
    emailMedia:typeof E?.validateMedia==='function'&&typeof E?.progressPng==='function',
    executionIntegrity:!!W.RigGOV116?.selfCheck?.().ok&&!!W.RigGOReportV12?.__v116Wrapped,
    dailyCloseWorkflow:typeof actions.prepareDay==='function'&&typeof actions.finalizePreparedDays==='function',
    opsFlatTimeDetail:typeof W.RigGOV117?.opsFlatDetails==='function'&&typeof W.fFlatDetails==='function'&&typeof W.f0065Html==='function',
    supabase:!!W.RigGOSupabase
  };
  return {ok:Object.values(checks).every(Boolean),checks,release:RELEASE,build:BUILD};
}
function showBootFailure(check,error){
  const gate=document.getElementById('riggoBootGate');if(!gate)return;
  gate.setAttribute('aria-hidden','false');
  const failed=check?.checks?Object.entries(check.checks).filter(([,v])=>!v).map(([k])=>k):[];
  gate.innerHTML=`<div class="riggo-boot-inner"><img src="./assets/riggo-iso.png" alt="RigGO"><div class="riggo-boot-title">RigGO no pudo iniciar</div><div class="riggo-boot-sub" style="max-width:320px;text-align:center;line-height:1.45">Se bloqueó el inicio para evitar operar con módulos incompletos.${failed.length?`<br><span style="opacity:.7">${failed.join(' · ')}</span>`:''}</div><button id="riggoBootRetry" style="margin-top:4px;min-height:42px;border-radius:10px;border:1px solid rgba(255,255,255,.18);background:#122132;color:#fff;padding:0 16px;font-weight:800">Reintentar</button></div>`;
  document.getElementById('riggoBootRetry')?.addEventListener('click',()=>location.reload());
  recordRuntimeError('bootGuard',error||new Error('Runtime incompleto'),check||{});
}
function stamp(){
  
  
  const box=document.querySelector('.v5-admin-build');if(box){const b=box.querySelector('b');if(b)b.textContent='RigGO '+RELEASE;const s=box.querySelectorAll('span');if(s.length)s[s.length-1].textContent=BUILD}
}
const BASE_RENDER_115=typeof W.render==='function'?W.render:null;
if(BASE_RENDER_115)W.render=function(){const out=BASE_RENDER_115.apply(this,arguments);requestAnimationFrame(()=>{stamp();if(state?.screen==='review')bindReviewAuthority();if(state?.screen==='admin')bindAdminAuthority();if(state?.screen==='execute')decoratePreparedDays115()});return out};

async function boot(){
  try{
    if(W.RigGOV112?.boot)await W.RigGOV112.boot();
    await finalizeDuePreparedDays115({renderAfter:false});
    if(W.RigGOV112?.startServices)await W.RigGOV112.startServices();
    if(W.RigGOV114?.startServices)await W.RigGOV114.startServices();
    startPreparedLifecycle115();
    stamp();renderNow();await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);
    const check=selfCheck();
    if(!check.ok){showBootFailure(check,new Error('Runtime incompleto'));return check}
    document.documentElement.classList.remove('riggo-booting');document.getElementById('riggoBootGate')?.setAttribute('aria-hidden','true');
    return check;
  }catch(e){showBootFailure(null,e);throw e}
}

W.RigGO={...(W.RigGO||{}),release:RELEASE,build:BUILD,actions,sync:W.RigGOV112,integrity:W.RigGOV116,reports:{ops:W.RigGOReportV12,email:W.RigGOV114},runtime:{selfCheck,errors:runtimeErrors,boot}};
W.__RIGGO_RUNTIME_AUTHORITY__=true;

W.__RIGGO_V115_BOOT__=boot;
})();
/* RigGO 12.1 · Single Runtime/Version/Cache Authority */
(()=>{
'use strict';
const W=window,RELEASE='12.3.7-stale-run-compat',BUILD='2026-09-26-1237-A1';
function stamp(){W.RIGGO_RELEASE=RELEASE;W.RIGGO_BUILD=BUILD;document.documentElement.dataset.riggoRelease=RELEASE;document.documentElement.dataset.riggoBuild=BUILD;document.title='RigGO · 12.3.7';document.querySelector('meta[name="riggo-release"]')?.setAttribute('content',RELEASE);document.querySelector('meta[name="riggo-build"]')?.setAttribute('content',BUILD);try{localStorage.setItem('riggo_active_release',RELEASE)}catch(_){}const box=document.querySelector('.v5-admin-build');if(box){const b=box.querySelector('b');if(b)b.textContent='RigGO 12.3.7';const s=box.querySelectorAll('span');if(s.length)s[s.length-1].textContent=BUILD}}
async function registerSW(){if(!('serviceWorker'in navigator))return;try{const regs=await navigator.serviceWorker.getRegistrations();for(const r of regs)if(!String(r.active?.scriptURL||r.installing?.scriptURL||r.waiting?.scriptURL||'').endsWith('/sw.js'))await r.unregister();const reg=await navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'});await reg.update().catch(()=>{})}catch(e){console.warn('RigGO 12.1 SW',e)}}
async function coherence(){try{const r=await fetch('./version.json',{cache:'no-store'});if(!r.ok)return true;const v=await r.json();if(v.release!==RELEASE||v.build!==BUILD){document.documentElement.classList.add('riggo-version-mismatch');document.body?.insertAdjacentHTML('afterbegin','<div style="position:fixed;inset:0;z-index:999999;background:#07111d;color:#fff;display:grid;place-items:center;font:600 18px system-ui">Actualizando RigGO…</div>');const k='riggo_121_reload_'+v.build;if(!sessionStorage.getItem(k)){sessionStorage.setItem(k,'1');setTimeout(()=>location.reload(),450)}return false}return true}catch(_){return true}}
function diagnostics(){const m=(W.state?.moves||[]).find(x=>x.id===W.state?.selectedMoveId);return{release:RELEASE,build:BUILD,moveId:m?.id||null,masterRevision:m?.syncMeta?.revision??null,serverStatus:m?.syncMeta?.serverStatus??m?.status??null,executionRevision:m?.execSyncMeta?.revision??null,lastExecutionWrite:m?.execSyncMeta?.updatedAt||null,integrity:m?.execIntegrity||null}}
const oldRender=typeof W.render==='function'?W.render:null;if(oldRender)W.render=function(){const r=oldRender.apply(this,arguments);requestAnimationFrame(stamp);return r};
W.RigGO121={release:RELEASE,build:BUILD,stamp,diagnostics,coherence,registerSW};
(async()=>{stamp();const ok=await coherence();if(!ok)return;await registerSW();const boot=W.RigGO?.runtime?.boot||W.__RIGGO_V115_BOOT__;if(typeof boot!=='function')throw new Error('RigGO 12.1 boot authority missing');await boot();stamp();})();
})();


/* RigGO 12.1.2 C3 · Field interaction reliability hotfix */
(()=>{
'use strict';
const W=window,E=id=>document.getElementById(id);
/* RigGO 12.1.6B FIX3 · 12.1.5 navigation authority retained unchanged. */
function live(m,p,c){const lm=(state.moves||[]).find(x=>x.id===m?.id)||m,lc=lm?.exec?.closures?.[p?.id]||c;return{m:lm,c:lc}}
function missing(step,c,p){try{return W.RigGOV61?.missing?.(step,c,p)||[]}catch(_){return[]}}
function firstMissing(c,p,through){for(let s=0;s<=Math.min(4,through);s++){const x=missing(s,c,p);if(x.length)return{step:s,missing:x}}return null}
function showMissingC3(items){document.querySelectorAll('.v61-required-error').forEach(x=>x.classList.remove('v61-required-error'));document.querySelector('.v61-validation-banner')?.remove();if(!items?.length)return false;const banner=document.createElement('div');banner.className='v61-validation-banner';banner.textContent='Completa antes de continuar: '+items.map(x=>x.label).join(', ')+'.';document.querySelector('.v3-report-head')?.insertAdjacentElement('afterend',banner);const ids=items.flatMap(x=>x.ids||[]);ids.forEach(id=>E(id)?.classList.add('v61-required-error'));ids.map(E).find(Boolean)?.scrollIntoView?.({behavior:'smooth',block:'center'});return true}
let reportNavPending1215=false;
function settleReportEditor1215(){try{const a=document.activeElement;if(a&&a!==document.body&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)){try{a.dispatchEvent(new Event('change',{bubbles:true}))}catch(_){};try{a.blur()}catch(_){}}}catch(_){}}
function renderReport1215(after){settleReportEditor1215();setTimeout(()=>{try{W.__RIGGO_RENDER_DEFERRED__=false}catch(_){};try{W.render?.()}finally{reportNavPending1215=false;requestAnimationFrame(()=>{try{scrollTopNow()}catch(_){}});if(after)setTimeout(after,0)}},0)}
function commitReport1215(m,p,c){let z=live(m,p,c);try{captureExecText(z.m,p,z.c)}catch(e){console.warn('RigGO 12.1.7 report capture',e)}return live(m,p,z.c)}
function reportGo1215(m,p,c,target,{validateForward=true}={}){if(reportNavPending1215)return;reportNavPending1215=true;let z=commitReport1215(m,p,c),step=Number(z.c.reportStep)||0;if(target==='progress'){state.execTab='progress';save();renderReport1215();return}target=Math.max(0,Math.min(6,Number(target)||0));if(target>step&&validateForward){const hit=firstMissing(z.c,p,target-1);if(hit){z.c.reportStep=hit.step;save();renderReport1215(()=>showMissingC3(hit.missing));return}}z.c.reportVisited=z.c.reportVisited||{};if(target>step)z.c.reportVisited[step]=true;z.c.reportStep=target;save();renderReport1215()}
const BASE_WIRE_REPORT_C3=typeof W.wireReport==='function'?W.wireReport:null;
if(BASE_WIRE_REPORT_C3)W.wireReport=function(m,p,c){BASE_WIRE_REPORT_C3(m,p,c);const prevOld=E('v3ReportPrev');if(prevOld){const b=prevOld.cloneNode(true);prevOld.replaceWith(b);b.onclick=e=>{e?.preventDefault?.();e?.stopImmediatePropagation?.();const z=live(m,p,c),step=Number(z.c.reportStep)||0;reportGo1215(z.m,p,z.c,step===0?'progress':step-1,{validateForward:false})}}const nextOld=E('v3ReportNext');if(nextOld){const b=nextOld.cloneNode(true);nextOld.replaceWith(b);b.onclick=e=>{e?.preventDefault?.();e?.stopImmediatePropagation?.();const z=live(m,p,c),step=Number(z.c.reportStep)||0;reportGo1215(z.m,p,z.c,Math.min(6,step+1),{validateForward:true})}}document.querySelectorAll('[data-v3-reportstep]').forEach(old=>{const target=Number(old.dataset.v3Reportstep),b=old.cloneNode(true);old.replaceWith(b);b.onclick=e=>{e?.preventDefault?.();e?.stopImmediatePropagation?.();const z=live(m,p,c),step=Number(z.c.reportStep)||0;if(target===step)return;if(target<step||z.c.reportVisited?.[target])return reportGo1215(z.m,p,z.c,target,{validateForward:false});if(target===step+1)return reportGo1215(z.m,p,z.c,target,{validateForward:true});try{toast('Completa los pasos en secuencia')}catch(_){}}})};
/* RigGO 12.1.6B FIX3: keep the proven Execute navigation handler unchanged. */
W.RigGOC3={release:'12.1.2-final-c3',build:'2026-08-21-2028-C3',mediaBusy:()=>!!W.__RIGGO_MEDIA_PICKER_ACTIVE__};
})();
