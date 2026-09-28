(()=>{'use strict';
const W=window, RELEASE='12.1.7-field-stabilization', BUILD='2026-09-12-1217-RC1';
const E=id=>document.getElementById(id);
const clone=v=>{try{return structuredClone(v)}catch(_){return JSON.parse(JSON.stringify(v))}};
const n=v=>{const x=Number(v);return Number.isFinite(x)?x:0};
const clamp100=v=>Math.max(0,Math.min(100,n(v)));
const lower=v=>String(v||'').trim().toLowerCase();
const persistTimers=new Map();
let networkCommits=0,lastSaveState='saved';

function selectedMove(id=null){return (state?.moves||[]).find(m=>String(m?.id)===String(id||state?.selectedMoveId))||null}
function periods(m){try{return typeof movePeriods==='function'?(movePeriods(m)||[]):(m?.exec?.periods||[])}catch(_){return m?.exec?.periods||[]}}
function selectedP(m,id=null){const ps=periods(m);if(id)return ps.find(p=>String(p.id)===String(id))||null;try{return typeof selectedPeriod==='function'?selectedPeriod(m):ps.find(p=>String(p.id)===String(m?.exec?.selectedPeriodId))||ps.at(-1)}catch(_){return ps.find(p=>String(p.id)===String(m?.exec?.selectedPeriodId))||ps.at(-1)||null}}
function liveCtx(moveId=null,periodId=null){const m=selectedMove(moveId),p=m?selectedP(m,periodId):null,c=m&&p?(typeof ensureClosure==='function'?ensureClosure(m,p.id):m.exec?.closures?.[p.id]):null;return{m,p,c}}
function inputIso(v){try{return typeof inputToIso==='function'?inputToIso(v):new Date(v).toISOString()}catch(_){return v||''}}
function saveLocalNow(){try{typeof saveLocal==='function'&&saveLocal()}catch(_){} }
function markDirty(m){try{W.RigGOV120?.markDirty?.(m)}catch(_){} saveLocalNow()}
function setGlobalPending(){W.__RIGGO_FIELD_COMMIT_PENDING__=networkCommits>0||persistTimers.size>0}
function ensureSaveBadge(){let el=E('riggo1217SaveState');if(el)return el;const host=document.querySelector('.v3-exec-title .row,.top-actions,.v3-report-head')||document.querySelector('.topbar');if(!host)return null;el=document.createElement('span');el.id='riggo1217SaveState';el.className='status gray riggo1217-save-state';el.textContent='Guardado ✓';host.appendChild(el);return el}
function saveState(kind,msg){lastSaveState=kind;const el=ensureSaveBadge();if(!el)return;el.classList.remove('good','warn','bad','gray','info');el.classList.add(kind==='saved'?'good':kind==='error'?'bad':kind==='pending'?'warn':'info');el.textContent=msg||({saved:'Guardado ✓',saving:'Guardando…',pending:'Pendiente de sincronización',error:'Error al guardar'}[kind]||kind);}

async function persistImmediate(m,{renderAfter=false,label='Guardando…'}={}){
  if(!m)return{ok:false,missing:true};
  const key=String(m.id);const old=persistTimers.get(key);if(old){clearTimeout(old);persistTimers.delete(key)}
  markDirty(m);networkCommits++;setGlobalPending();saveState('saving',label);
  try{
    try{typeof save==='function'&&save()}catch(_){}
    const r=await W.RigGOV120?.persistNow?.(m);
    if(r?.serverFailure||r?.blocked){saveState('error',String(r?.error?.message||'Error al guardar'));return{ok:false,...r}}
    if(r?.offline||r?.pending){saveState('pending','Pendiente de sincronización');return{ok:false,pending:true,...r}}
    saveState('saved','Guardado ✓');
    if(renderAfter){try{render()}catch(_){} }
    return{ok:true,...(r||{})};
  }catch(e){saveState('error','Error al guardar');console.error('RigGO 12.1.7 persist',e);return{ok:false,error:e}}
  finally{networkCommits=Math.max(0,networkCommits-1);setGlobalPending()}
}
function schedulePersist(m,delay=35){if(!m)return;const key=String(m.id);const old=persistTimers.get(key);if(old)clearTimeout(old);saveState('saving','Guardando…');const t=setTimeout(()=>{persistTimers.delete(key);setGlobalPending();persistImmediate(m).catch(()=>{})},delay);persistTimers.set(key,t);setGlobalPending()}

function priorClosure(m,p){const ps=periods(m).filter(x=>(+x.index||0)<(+p.index||0)).sort((a,b)=>b.index-a.index);for(const q of ps){const c=m.exec?.closures?.[q.id];if(c)return c}return null}
function recalcAccumulators(m){if(!m?.exec?.closures)return false;let permits=0,risks=0,soc=0,changed=false;for(const p of periods(m).slice().sort((a,b)=>(+a.index||0)-(+b.index||0))){const c=m.exec.closures?.[p.id];if(!c)continue;const pd=Math.max(0,n(c.permitsDay)),rd=Math.max(0,n(c.risksDay)),od=Math.max(0,n(c.ocDay));permits+=pd;risks+=rd;soc+=od;if(n(c.permitsAcc)!==permits){c.permitsAcc=permits;changed=true}if(n(c.risksAcc)!==risks){c.risksAcc=risks;changed=true}if(n(c.ocAcc)!==soc){c.ocAcc=soc;changed=true}}return changed}
function syncAccumulatorUi(c){for(const id of ['permitsAcc','risksAcc','ocAcc']){const el=E(id);if(!el)continue;el.value=String(n(c?.[id]));el.readOnly=true;el.setAttribute('aria-readonly','true');el.title='Calculado automáticamente por RigGO';el.classList.add('riggo1217-auto-acc')}}

const carryMap={crew:'crewSame',vehicles:'vehiclesSame',lmc:'lmcSame'};
function copyCarry(m,p,c,key){const prev=priorClosure(m,p);const field=Object.entries(carryMap).find(([,v])=>v===key)?.[0];if(field&&prev?.[field])c[field]=clone(prev[field]);if(key==='hseSame'&&prev?.hse)c.hse=clone(prev.hse)}
function markChanged(c,group){const k=carryMap[group]||((group==='hse')?'hseSame':null);if(k&&c[k])c[k]=false;const box=k?document.querySelector(`[data-v3-carry="${k}"],[data-carry="${k}"]`):null;if(box)box.checked=false}

function stampCritical(el,m,p){if(!el||!m||!p)return;el.dataset.riggoMoveId=m.id;el.dataset.riggoPeriodId=p.id}
function decorateFields(){const {m,p,c}=liveCtx();if(!m||!p||!c)return;recalcAccumulators(m);syncAccumulatorUi(c);
  const sels=['[data-daily]','[data-part]','[data-forecast]','[data-msactual]','[data-progressnote]','[data-scopeprog]','[data-v3-carry]','[data-carry]','#originOps','#destinationOps','#next24','#dailyEmergency','#dailyMedic','#dailySafety','#safetyTopic','#safetyUnderstood','#permitsDay','#risksDay','#ocDay','#permitsAcc','#risksAcc','#ocAcc','#siteSupervisor','#siteSupervisorRole','[data-v3-photocap]'];
  document.querySelectorAll(sels.join(',')).forEach(el=>stampCritical(el,m,p));ensureSaveBadge();
}
function liveForEl(el){return liveCtx(el?.dataset?.riggoMoveId||null,el?.dataset?.riggoPeriodId||null)}
function fieldValue(el,k=''){return k==='qty'?Math.max(0,n(el.value)):el.value}
function descriptor(el){if(!el||!isCritical(el))return null;const d={moveId:el.dataset.riggoMoveId||state?.selectedMoveId||'',periodId:el.dataset.riggoPeriodId||'',value:el.value,checked:!!el.checked,id:el.id||'',kind:'simple'};
  if(el.matches('[data-daily]'))Object.assign(d,{kind:'daily',group:el.dataset.daily,idx:+el.dataset.i,key:el.dataset.k});
  else if(el.matches('[data-part]'))Object.assign(d,{kind:'participant',idx:+el.dataset.part,key:el.dataset.k});
  else if(el.matches('[data-forecast]'))Object.assign(d,{kind:'forecast',idx:+el.dataset.forecast});
  else if(el.matches('[data-msactual]'))Object.assign(d,{kind:'actual',idx:+el.dataset.msactual});
  else if(el.matches('[data-progressnote]'))Object.assign(d,{kind:'progressNote',key:el.dataset.progressnote});
  else if(el.matches('[data-scopeprog]'))Object.assign(d,{kind:'scope',group:el.dataset.scopeprog,key:el.dataset.k});
  else if(el.matches('[data-v3-carry],[data-carry]'))Object.assign(d,{kind:'carry',key:el.dataset.v3Carry||el.dataset.carry});
  else if(el.matches('[data-v3-photocap]'))Object.assign(d,{kind:'photoCaption',idx:+el.dataset.v3Photocap});
  return d;
}
function applyDescriptor(d){if(!d)return null;const {m,p,c}=liveCtx(d.moveId||null,d.periodId||null);if(!m||!p||!c)return null;let changed=false;
  if(d.kind==='daily'){const list=c[d.group];if(list?.[d.idx]){const v=d.key==='qty'?Math.max(0,n(d.value)):d.value;if(list[d.idx][d.key]!==v){list[d.idx][d.key]=v;changed=true}if(changed)markChanged(c,d.group)}}
  else if(d.kind==='participant'){c.participants=Array.isArray(c.participants)?c.participants:[];if(c.participants[d.idx]){if(c.participants[d.idx][d.key]!==d.value){c.participants[d.idx][d.key]=d.value;changed=true}}}
  else if(d.kind==='forecast'){const row=c.milestones?.[d.idx];if(row){const v=inputIso(d.value);if(row.forecast!==v){row.forecast=v;changed=true}}}
  else if(d.kind==='actual'){const row=c.milestones?.[d.idx];if(row){const v=inputIso(d.value);if(row.actual!==v){row.actual=v;changed=true}}}
  else if(d.kind==='progressNote'){c.progressNotes=c.progressNotes||{};if(c.progressNotes[d.key]!==d.value){c.progressNotes[d.key]=d.value;changed=true}}
  else if(d.kind==='scope'){c.scope=c.scope||{};c.scope[d.group]=c.scope[d.group]||{};const v=clamp100(d.value);if(c.scope[d.group][d.key]!==v){c.scope[d.group][d.key]=v;changed=true}}
  else if(d.kind==='carry'){if(d.key){if(c[d.key]!==d.checked){c[d.key]=d.checked;changed=true}if(changed&&d.checked)copyCarry(m,p,c,d.key)}}
  else if(d.kind==='photoCaption'){c.photoCaptions=Array.isArray(c.photoCaptions)?c.photoCaptions:[];if(c.photoCaptions[d.idx]!==d.value){c.photoCaptions[d.idx]=d.value;changed=true}}
  else {
    const id=d.id;
    const simple={originOps:'originOps',destinationOps:'destinationOps',next24:'next24',safetyTopic:'safetyTopic',safetyUnderstood:'safetyUnderstood',siteSupervisor:'siteSupervisor',siteSupervisorRole:'siteSupervisorRole'};
    if(simple[id]){const k=simple[id];if(c[k]!==d.value){c[k]=d.value;changed=true}}
    else if(['permitsDay','risksDay','ocDay'].includes(id)){const v=Math.max(0,n(d.value));if(c[id]!==v){c[id]=v;changed=true}if(recalcAccumulators(m))changed=true;syncAccumulatorUi(c)}
    else if(['dailyEmergency','dailyMedic','dailySafety'].includes(id)){c.hse=c.hse||{};const k={dailyEmergency:'emergency',dailyMedic:'medic',dailySafety:'safety'}[id];if(c.hse[k]!==d.value){c.hse[k]=d.value;changed=true}if(changed)markChanged(c,'hse')}
  }
  if(changed){markDirty(m);m.audit=m.audit||[]}return{m,p,c,changed};
}
function applyField(el){return applyDescriptor(descriptor(el))}
function isCritical(el){return !!el?.matches?.('[data-daily],[data-part],[data-forecast],[data-msactual],[data-progressnote],[data-scopeprog],[data-v3-carry],[data-carry],[data-v3-photocap],#originOps,#destinationOps,#next24,#dailyEmergency,#dailyMedic,#dailySafety,#safetyTopic,#safetyUnderstood,#permitsDay,#risksDay,#ocDay,#siteSupervisor,#siteSupervisorRole')}
const pendingFieldKeys=new Map();
function descriptorKey(d){return [d?.moveId,d?.periodId,d?.kind,d?.group,d?.idx,d?.key,d?.id].join('|')}
function protectDescriptor(d){if(!d)return;pendingFieldKeys.set(descriptorKey(d),d);W.__RIGGO_FIELD_COMMIT_PENDING__=true}
function releaseDescriptor(d){if(!d)return;pendingFieldKeys.delete(descriptorKey(d));setGlobalPending();if(pendingFieldKeys.size)W.__RIGGO_FIELD_COMMIT_PENDING__=true}
function afterLegacyHandlers(d,{persist=false}={}){if(!d)return;protectDescriptor(d);queueMicrotask(()=>{const x=applyDescriptor(d);if(!x?.m){releaseDescriptor(d);return}markDirty(x.m);if(persist){schedulePersist(x.m,0);setTimeout(()=>releaseDescriptor(d),120)}else{saveLocalNow();setTimeout(()=>releaseDescriptor(d),80)}})}
function captureInputs(){
  document.addEventListener('input',e=>{const el=e.target;if(!isCritical(el))return;const d=descriptor(el);protectDescriptor(d);applyDescriptor(d);afterLegacyHandlers(d,{persist:false})},true);
  document.addEventListener('change',e=>{const el=e.target;if(!isCritical(el))return;const d=descriptor(el);protectDescriptor(d);applyDescriptor(d);afterLegacyHandlers(d,{persist:true})},true);
  document.addEventListener('focusout',e=>{const el=e.target;if(!isCritical(el))return;const d=descriptor(el);protectDescriptor(d);applyDescriptor(d);afterLegacyHandlers(d,{persist:true})},true)
}

function captureDomIntoLive(){const els=document.querySelectorAll('[data-riggo-move-id][data-riggo-period-id]');let m=null;els.forEach(el=>{if(!isCritical(el)||el.disabled)return;const x=applyField(el);if(x?.m)m=x.m});if(m){recalcAccumulators(m);markDirty(m)}return m}
const BASE_CAPTURE=typeof W.captureExecText==='function'?W.captureExecText:(typeof captureExecText==='function'?captureExecText:null);
function liveCapture(m,p,c){const lm=selectedMove(m?.id),lp=lm?selectedP(lm,p?.id):null,lc=lm&&lp?(typeof ensureClosure==='function'?ensureClosure(lm,lp.id):lm.exec?.closures?.[lp.id]):null;if(!lm||!lp||!lc)return BASE_CAPTURE?.(m,p,c);decorateFields();captureDomIntoLive();recalcAccumulators(lm);markDirty(lm);return lc}
try{W.captureExecText=liveCapture;captureExecText=liveCapture}catch(_){W.captureExecText=liveCapture}

function installProgressAuthority(){const base=typeof W.showProgressEdit==='function'?W.showProgressEdit:(typeof showProgressEdit==='function'?showProgressEdit:null);if(!base||base.__riggo1217)return;const patched=function(m,p,c,key){base(m,p,c,key);const moveId=m?.id,periodId=p?.id,apply=E('v3ApplyProgress'),suggest=E('v3UseSuggested');if(apply)apply.onclick=async()=>{const {m:lm,p:lp,c:lc}=liveCtx(moveId,periodId);if(!lm||!lp||!lc)return;lc.overrides=lc.overrides||{};lc.reported=lc.reported||{};lc.overrides[key]=true;lc.reported[key]=clamp100(E('v3ProgressNumber')?.value);lm.audit=lm.audit||[];lm.audit.push({at:new Date().toISOString(),user:state.auth.email,action:'progress_override',period:lp.id,key,value:lc.reported[key]});markDirty(lm);apply.disabled=true;apply.textContent='Guardando…';const r=await persistImmediate(lm);if(!r.ok&&!r.pending){apply.disabled=false;apply.textContent='Aplicar';alert('No fue posible guardar el porcentaje.');return}closeSheet();render();try{scrollTopNow()}catch(_){}};if(suggest)suggest.onclick=async()=>{const {m:lm,p:lp,c:lc}=liveCtx(moveId,periodId);if(!lm||!lp||!lc)return;const s=suggestedPcts(lm,lp);lc.overrides=lc.overrides||{};lc.reported=lc.reported||{};lc.overrides[key]=false;lc.reported[key]=Math.round(s[key]);markDirty(lm);await persistImmediate(lm);closeSheet();render();try{scrollTopNow()}catch(_){}}};patched.__riggo1217=true;try{W.showProgressEdit=patched;showProgressEdit=patched}catch(_){W.showProgressEdit=patched}}

function installParticipantAdd(){document.addEventListener('click',e=>{const b=e.target?.closest?.('#addParticipant');if(!b)return;const {m,c}=liveCtx();if(!m||!c)return;e.preventDefault();e.stopImmediatePropagation();c.participants=Array.isArray(c.participants)?c.participants:[];c.participants.push({name:'',company:'Nabors',role:'',signature:''});markDirty(m);schedulePersist(m,10);render();try{scrollTopNow()}catch(_){}},true)}

function installNoActivityNavigation(){document.addEventListener('click',e=>{const b=e.target?.closest?.('#v3ReportNext,[data-v3-reportstep]');if(!b)return;const {m,p,c}=liveCtx();if(!m||!p||!c||(+c.reportStep||0)!==2)return;const origin=String(c.originOps||'').trim(),dest=String(c.destinationOps||'').trim();if(origin||dest)return;const target=b.id==='v3ReportNext'?3:+b.dataset.v3Reportstep;if(target!==3)return;e.preventDefault();e.stopImmediatePropagation();captureDomIntoLive();if(!String(c.next24||'').trim()){try{toast('Completa las actividades próximas 24 Hrs antes de continuar')}catch(_){}E('next24')?.focus();return}c.reportVisited=c.reportVisited||{};c.reportVisited[2]=true;c.reportStep=3;markDirty(m);schedulePersist(m,10);render();try{scrollTopNow()}catch(_){}},true)}

function validate1217(c,p){const fs=flatSummary(c.flatEvents||[],p),missing=[];if(!fs.valid)missing.push('Flat Time');if(!c.signature)missing.push('Firma');if(!String(c.next24||'').trim())missing.push('Próximas 24 Hrs');if(!String(c.siteSupervisor||'').trim())missing.push('Supervisor del sitio');if(!String(c.siteSupervisorRole||'').trim())missing.push('Cargo del supervisor');return{ok:!missing.length,missing,fs}}
try{W.validateClosure=validate1217;validateClosure=validate1217}catch(_){W.validateClosure=validate1217}

function fmtLocal(iso){try{return new Intl.DateTimeFormat('es-CO',{timeZone:'America/Bogota',day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(iso))}catch(_){return String(iso||'')}}
async function closeDay1217(m,p,c){
  captureDomIntoLive();({m,p,c}=liveCtx(m?.id,p?.id));if(!m||!p||!c)throw new Error('No fue posible identificar la Move/Día actual.');
  recalcAccumulators(m);const v=validate1217(c,p);if(!v.ok)throw new Error('Completa antes de cerrar: '+v.missing.join(', '));if(!c.f0065ReviewedAt)throw new Error('Primero debes revisar el OPS-F0065-S.');
  const nowMs=Date.now(),startMs=new Date(p.start).getTime(),endMs=new Date(p.end).getTime();if(Number.isFinite(startMs)&&nowMs<startMs)throw new Error(`El Día ${p.index} aún no ha iniciado.`);if(Number.isFinite(endMs)&&nowMs<endMs){const ok=confirm(`El corte programado es ${p.cutoffTime||fmtLocal(p.end)}. Estás cerrando el Día ${p.index} antes del corte.\n\nEl período conservará su corte original; solo se registrará la hora real de cierre. ¿Confirmar?`);if(!ok)return{cancelled:true}}
  const pre=await persistImmediate(m,{label:'Guardando cambios…'});if(!pre.ok&&!pre.pending)throw new Error('No fue posible sincronizar los cambios antes del cierre.');
  const first=!c.closedAt,closedAt=c.closedAt||new Date().toISOString();c.closedAt=closedAt;c.closedBy=c.closedBy||state.auth.email;c.reportStep=6;c.reportVisited=c.reportVisited||{};c.reportVisited[5]=true;c.closedBeforeCutoff=Number.isFinite(endMs)&&new Date(closedAt).getTime()<endMs;c.scheduledCutoff=p.end;c.masterMovePendingSync=true;c.offlinePendingOpsUpload=true;
  if(first){m.audit=m.audit||[];m.audit.push({at:closedAt,user:state.auth.email,action:'close_day_1217',period:p.id,cutoff:p.cutoffTime||'',scheduledCutoff:p.end,closedBeforeCutoff:c.closedBeforeCutoff,mode:'field_stabilization_1217'})}
  try{if(typeof W.v4Physical==='function'&&typeof W.v4EnsureNextDay==='function'){const phys=W.v4Physical(m);if(phys&&!phys.complete){const later=periods(m).find(x=>(+x.index||0)>(+p.index||0)&&!m.exec?.closures?.[x.id]?.closedAt);if(!later)W.v4EnsureNextDay(m,p.index)}}}catch(_){}
  markDirty(m);saveLocalNow();const execAck=await persistImmediate(m,{label:'Confirmando cierre…'});if(!execAck.ok&&!execAck.pending)throw new Error('El Día quedó cerrado localmente, pero no fue posible confirmar la ejecución en servidor.');
  let sync={ok:false,pending:true};try{if(navigator.onLine!==false&&typeof W.RigGO?.actions?.syncClosedDay==='function')sync=await W.RigGO.actions.syncClosedDay(m,p,c)}catch(err){c.opsSyncLastError=String(err?.message||err);c.offlinePendingOpsUpload=true;c.masterMovePendingSync=true;saveLocalNow();console.warn('RigGO 12.1.7 close sync pending',err)}
  return{ok:true,pending:!sync?.ok,sync};
}
function bindEarlyClose(){const old=E('v4CloseDay');if(!old)return;const {m,p,c}=liveCtx();if(!m||!p||!c||c.closedAt)return;const b=old.cloneNode(true);old.replaceWith(b);b.disabled=false;b.textContent=`Cerrar Día ${p.index}`;const result=E('v4CloseResult');if(result&&/corte|prepar/i.test(result.textContent||'')){result.textContent='Puedes cerrar el día cuando el RM finalice su jornada. El corte operacional no cambia.';result.style.color='#a8c0ff'}b.addEventListener('click',async()=>{try{b.disabled=true;b.textContent='Cerrando…';if(result){result.style.color='#a8c0ff';result.textContent='Guardando OPS y cierre…'}const r=await closeDay1217(m,p,c);if(r?.cancelled){b.disabled=false;b.textContent=`Cerrar Día ${p.index}`;return}if(result){result.style.color='#8ae4ad';result.textContent=`Día ${p.index} cerrado`}state.screen='execute';state.execMode='days';state.reportView='f0065';save();render();try{toast(`Día ${p.index} cerrado`)}catch(_){}}catch(err){if(result){result.style.color='#ffafb8';result.textContent='Error: '+String(err?.message||err)}else alert(String(err?.message||err))}finally{if(document.body.contains(b)){b.disabled=false;b.textContent=`Cerrar Día ${p.index}`}}})}

function chooseLoadStatus(m0,p0,id,button=null){const m=selectedMove(m0?.id),p=m?selectedP(m,p0?.id):null,x=m?.exec?.loads?.find(z=>String(z.id)===String(id));if(!m||!p||!x)return;const st=statusAt(x,p.end);sheetRoot.innerHTML=`<div class="sheet-backdrop"><div class="sheet"><div class="sheet-handle"></div><h2>${typeof enc==='function'?enc(x.description||'Carga'):(x.description||'Carga')}</h2><div class="sheet-sub">Estado actual: ${st}. Selecciona el estado operacional.</div><div class="sheet-footer" style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><button id="riggo1217Loaded" class="btn ${st==='Cargada'?'primary':''}">Cargada</button><button id="riggo1217Positioned" class="btn ${st==='Posicionada'?'primary':''}">Posicionada</button><button id="cancelSheet" class="btn" style="grid-column:1/-1">Cancelar</button></div></div></div>`;E('cancelSheet').onclick=closeSheet;const apply=async status=>{const lm=selectedMove(m.id),lp=lm?selectedP(lm,p.id):null,lx=lm?.exec?.loads?.find(z=>String(z.id)===String(id));if(!lm||!lp||!lx)return;lx.history=Array.isArray(lx.history)?lx.history:[];lx.history.push({id:crypto.randomUUID?.()||`h-${Date.now()}`,status,at:actionTimestamp(lp),user:state.auth.email});if(status==='Cargada'){lx.loadedAt=actionTimestamp(lp);lx.transitAt=null;lx.positionedAt=null}else{lx.loadedAt=lx.loadedAt||actionTimestamp(lp);lx.transitAt=null;lx.positionedAt=actionTimestamp(lp)}lm.audit=lm.audit||[];lm.audit.push({at:new Date().toISOString(),user:state.auth.email,action:'load_status',loadId:lx.id,period:lp.id,status});markDirty(lm);await persistImmediate(lm);closeSheet();render();try{scrollTopNow()}catch(_){}};E('riggo1217Loaded').onclick=()=>apply('Cargada');E('riggo1217Positioned').onclick=()=>apply('Posicionada')}
try{W.advanceLoad=chooseLoadStatus;advanceLoad=chooseLoadStatus}catch(_){W.advanceLoad=chooseLoadStatus}

function installReportRenderers(){if(typeof W.f0065Html==='function'&&!W.f0065Html.__riggo1217){const base=W.f0065Html;const fn=function(m,p,c){recalcAccumulators(m);const lc=m?.exec?.closures?.[p?.id]||c;return base(m,p,lc)};fn.__riggo1217=true;try{W.f0065Html=fn;f0065Html=fn}catch(_){W.f0065Html=fn}}
  if(typeof W.emailHtml==='function'&&!W.emailHtml.__riggo1217){const base=W.emailHtml;const fn=function(m,p,c,opt){recalcAccumulators(m);const lc=m?.exec?.closures?.[p?.id]||c;return base(m,p,lc,opt)};fn.__riggo1217=true;try{W.emailHtml=fn;emailHtml=fn}catch(_){W.emailHtml=fn}}}

function postRender(){decorateFields();if(state?.screen==='review')bindEarlyClose();if(state?.screen==='execute'&&state?.execMode==='day')recalcAccumulators(selectedMove());}
function installRender(){const base=typeof W.render==='function'?W.render:(typeof render==='function'?render:null);if(!base||base.__riggo1217)return;const fn=function(){const r=base.apply(this,arguments);requestAnimationFrame(postRender);return r};fn.__riggo1217=true;try{W.render=fn;render=fn}catch(_){W.render=fn}}

function styles(){if(E('riggo1217Style'))return;const st=document.createElement('style');st.id='riggo1217Style';st.textContent=`.riggo1217-save-state{font-size:9px!important;min-height:24px;display:inline-flex;align-items:center}.riggo1217-auto-acc{background:rgba(90,115,140,.10)!important;color:#aab9c6!important;cursor:not-allowed}.riggo1217-load-choice{display:flex;gap:8px}`;document.head.appendChild(st)}

function selfCheck(){return{ok:typeof W.RigGOV120?.persistNow==='function'&&typeof W.validateClosure==='function'&&typeof W.advanceLoad==='function',release:RELEASE,build:BUILD,features:{liveFieldAuthority:true,immediatePersist:true,hydrateCommitGuard:true,automaticAccumulators:true,noActivityDay:true,earlyClose:true,loadChoices:['Cargada','Posicionada'],opsDate:'period.start',roleParitySql:true}}}
function install(){if(W.__RIGGO_1217_INSTALLED__)return;W.__RIGGO_1217_INSTALLED__=true;styles();captureInputs();installProgressAuthority();installParticipantAdd();installNoActivityNavigation();installReportRenderers();installRender();postRender();W.RigGO1217={release:RELEASE,build:BUILD,liveCtx,recalcAccumulators,applyField,persistImmediate,closeDay:closeDay1217,selfCheck,hasPendingCommit:()=>!!W.__RIGGO_FIELD_COMMIT_PENDING__};try{render()}catch(_){} }
let tries=0;(function wait(){tries++;let ok=false;try{ok=!document.documentElement.classList.contains('riggo-booting')&&W.RigGO?.runtime?.selfCheck?.()?.ok===true}catch(_){}if(ok)return install();if(tries<400)setTimeout(wait,75);else console.error('RigGO 12.1.7 not installed: stable boot not confirmed')})();
})();
