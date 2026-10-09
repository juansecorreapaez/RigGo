(()=>{'use strict';
const W=window, RELEASE='12.3.7-stale-run-compat', BUILD='2026-09-26-1237-A1';
const E=id=>document.getElementById(id);
const clone=v=>{try{return structuredClone(v)}catch(_){return JSON.parse(JSON.stringify(v))}};
const uid=()=>{try{return crypto.randomUUID()}catch(_){return `1235-${Date.now()}-${Math.random().toString(36).slice(2)}`}};
const esc=v=>{try{return enc(v??'')}catch(_){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}};
function live(moveId=null,periodId=null){try{return W.RigGO1217?.liveCtx?.(moveId,periodId)||{m:null,p:null,c:null}}catch(_){return{m:null,p:null,c:null}}}
function mark(m){try{W.RigGOV120?.markDirty?.(m)}catch(_){}try{saveLocal()}catch(_){}}
function renderAt(y=0,preferred=null){
 const focus=W.RigGOUI?.captureFocus(preferred||document.activeElement);
 W.__RIGGO_RENDER_DEFERRED__=false;
 try{const a=document.activeElement;if(a&&a!==document.body)a.blur?.()}catch(_){}
 W.__RIGGO_RENDER_DEFERRED__=false;
 setTimeout(()=>{try{render()}catch(e){console.warn('RigGO render',e)}requestAnimationFrame(()=>requestAnimationFrame(()=>{window.scrollTo(0,y);W.RigGOUI?.restoreFocus(focus)}))},0);
}

/* --------------------------------------------------------------------------
   1) Transporte de Cargas: restore direct one-click cycling.
   Pending -> Loaded -> In transit -> Positioned -> (confirm) Pending.
   Physical Rig Move progress continues to count POSITIONED only.
   -------------------------------------------------------------------------- */
function loadStatus(x,p){try{return statusAt(x,p?.end)}catch(_){if(x?.positionedAt)return'Posicionada';if(x?.transitAt)return'En tránsito';if(x?.loadedAt)return'Cargada';return'Pendiente'}}
const loadBusy=new Set(),loadUndo=new Map();
async function directAdvanceLoad(m0,p0,id,button=null){
  const {m,p}=live(m0?.id,p0?.id);if(!m||!p)return;
  const x=m.exec?.loads?.find(z=>String(z.id)===String(id));if(!x)return;
  const lock=`${m.id}:${id}`;if(loadBusy.has(lock))return;
  const before=clone(x), st=loadStatus(x,p), at=typeof actionTimestamp==='function'?actionTimestamp(p):new Date().toISOString();
  let next='';
  if(st==='Pendiente')next='Cargada';
  else if(st==='Cargada')next='En tránsito';
  else if(st==='En tránsito')next='Posicionada';
  else {
    if(!confirm(`¿Reiniciar esta carga a Pendiente?\n\n${x.description||'Carga'}`))return;
    next='Pendiente';
  }
  const started=performance.now();loadBusy.add(lock);if(button){button.dataset.riggo1235Busy='1';button.setAttribute('aria-disabled','true')}
  try{
    x.history=Array.isArray(x.history)?x.history:[];
    if(next==='Pendiente'){
      x.loadedAt=null;x.transitAt=null;x.positionedAt=null;
      x.history.push({id:uid(),status:'Pendiente',at,user:state.auth.email});
      m.audit=m.audit||[];m.audit.push({at:new Date().toISOString(),user:state.auth.email,action:'load_status_reset',loadId:x.id,period:p.id,from:st,to:'Pendiente'});
    }else{
      x.history.push({id:uid(),status:next,at,user:state.auth.email});
      if(next==='Cargada'){x.loadedAt=at;x.transitAt=null;x.positionedAt=null}
      else if(next==='En tránsito'){x.loadedAt=x.loadedAt||at;x.transitAt=at;x.positionedAt=null}
      else {x.loadedAt=x.loadedAt||at;x.transitAt=x.transitAt||at;x.positionedAt=at}
      m.audit=m.audit||[];m.audit.push({at:new Date().toISOString(),user:state.auth.email,action:'load_status',loadId:x.id,period:p.id,status:next,mode:'direct_cycle_1235'});
    }
    loadUndo.set(lock,{moveId:m.id,periodId:p.id,runId:m.exec._riggoRunId,before,eventId:x.history.at(-1).id,to:next});
    mark(m);
    const r=await W.RigGO1217?.persistImmediate?.(m,{label:`Guardando ${next}…`});
    if(r&&!r.ok&&!r.pending)throw (r.error||new Error('No fue posible guardar el estado de la carga.'));
    const y=window.scrollY,active=document.activeElement;renderAt(y,active===document.body||active===button?button:active);
    W.RigGOUI?.announce?.((x.description||'Carga')+' · '+next+(r?.pending||navigator.onLine===false?' · Guardado en este dispositivo · Por sincronizar':r?.ok&&!r?.noChange?' · Guardado y sincronizado':' · Guardado en este dispositivo'));
  }catch(e){
    renderAt(window.scrollY,button);
    W.RigGOUI?.announce?.('No se pudo confirmar el registro. Revisa la sincronización.',true);
    alert('El estado está local, sin confirmar en servidor. Revisa la sincronización: '+String(e?.message||e));
  }finally{setTimeout(()=>{loadBusy.delete(lock);if(button&&document.body.contains(button)){button.removeAttribute('aria-disabled');delete button.dataset.riggo1235Busy}W.RigGOUI?.decorate?.()},Math.max(0,650-(performance.now()-started)))}
}

function isLoadBusy(moveId,id){return loadBusy.has(String(moveId)+':'+String(id))}
function canUndoLoad(moveId,id){
 const record=loadUndo.get(String(moveId)+':'+String(id));
 const {m,p}=live(moveId,record?.periodId);
 const x=m?.exec?.loads?.find(z=>String(z.id)===String(id));
 return !!record&&!!m&&!!p&&record.runId===m.exec._riggoRunId&&m.exec.selectedPeriodId===record.periodId&&x?.history?.at(-1)?.id===record.eventId&&loadStatus(x,p)===record.to&&!isLoadBusy(moveId,id);
}
async function undoLoad(m0,p0,id,button=null){
 const lock=String(m0?.id)+':'+String(id),record=loadUndo.get(lock);
 if(!record||!canUndoLoad(m0?.id,id)){W.RigGOUI?.announce?.('El registro cambió. Revisa el estado actual antes de corregir.',true);return}
 const {m,p}=live(record.moveId,record.periodId),x=m.exec.loads.find(z=>String(z.id)===String(id));
 const previous=loadStatus(record.before,p);
 if(!confirm('¿Corregir '+(x.description||'esta carga')+' de '+record.to+' a '+previous+'? El registro anterior permanecerá en el historial.'))return;
 const started=performance.now();loadBusy.add(lock);if(button)button.disabled=true;
 try{
   const at=typeof actionTimestamp==='function'?actionTimestamp(p):new Date().toISOString();
   x.history.push({id:uid(),status:previous,at,user:state.auth.email,corrects:record.eventId});
   for(const key of ['loadedAt','transitAt','positionedAt'])x[key]=record.before[key]||null;
   m.audit=m.audit||[];m.audit.push({at:new Date().toISOString(),user:state.auth.email,action:'load_status_correction',loadId:id,period:p.id,from:record.to,to:previous,corrects:record.eventId});
   loadUndo.delete(lock);mark(m);
   const r=await W.RigGO1217?.persistImmediate?.(m,{label:'Guardando corrección…'});
   if(r&&!r.ok&&!r.pending)throw r.error||new Error('No se pudo confirmar la corrección.');
   const active=document.activeElement,target=document.querySelector('[data-v3-load="'+CSS.escape(String(id))+'"]');
   renderAt(window.scrollY,active===document.body||active===button?target:active);
   W.RigGOUI?.announce?.((x.description||'Carga')+' · Corregida a '+previous+(r?.pending?' · Por sincronizar':''));
 }catch(error){
   renderAt(window.scrollY);W.RigGOUI?.announce?.('Corrección pendiente de confirmar. Revisa la sincronización.',true);
   alert('No se pudo confirmar la corrección: '+String(error?.message||error));
 }finally{setTimeout(()=>{loadBusy.delete(lock);W.RigGOUI?.decorate?.()},Math.max(0,650-(performance.now()-started)))}
}

function installLoadAuthority(){try{W.advanceLoad=directAdvanceLoad;advanceLoad=directAdvanceLoad}catch(_){W.advanceLoad=directAdvanceLoad}}

/* --------------------------------------------------------------------------
   2) Daily Report: one click navigation + preserve scroll on "Sin cambios".
   -------------------------------------------------------------------------- */
function reportMissing(step,c,p){
  // Step 2 supports a valid zero-activity day. In that case only Next 24h is required.
  if(Number(step)===2&&!String(c?.originOps||'').trim()&&!String(c?.destinationOps||'').trim()){
    return String(c?.next24||'').trim()?[]:[{label:'Próximas 24 Hrs',ids:['next24']}];
  }
  try{return W.RigGOV61?.missing?.(step,c,p)||[]}catch(_){return[]}
}
function showMissing(items){
  document.querySelectorAll('.v61-required-error').forEach(x=>x.classList.remove('v61-required-error'));
  document.querySelector('.v61-validation-banner')?.remove();if(!items?.length)return;
  const b=document.createElement('div');b.className='v61-validation-banner';b.id='riggoValidationError';b.setAttribute('role','alert');b.setAttribute('aria-atomic','true');b.textContent='Completa antes de continuar: '+items.map(x=>x.label).join(', ')+'.';
  document.querySelector('.v3-report-head')?.insertAdjacentElement('afterend',b);
  const ids=items.flatMap(x=>x.ids||[]);ids.forEach(id=>E(id)?.classList.add('v61-required-error'));
  const first=ids.map(E).find(Boolean);if(first){first.scrollIntoView?.({behavior:'smooth',block:'center'});setTimeout(()=>{try{first.focus({preventScroll:true})}catch(_){}},80)}
}
function captureReport(m,p,c){try{captureExecText(m,p,c)}catch(e){console.warn('RigGO 12.3.6 report capture',e)}return live(m?.id,p?.id)}
function firstMissing(c,p,through){for(let s=0;s<=Math.min(4,through);s++){const z=reportMissing(s,c,p);if(z.length)return{step:s,missing:z}}return null}
let reportBusy=false;
function goReport(m,p,c,target,{validate=true}={}){
  if(reportBusy)return;reportBusy=true;
  try{
    const active=document.activeElement;if(active&&/^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName)){try{active.dispatchEvent(new Event('change',{bubbles:true}))}catch(_){};try{active.blur()}catch(_){}}
    let z=captureReport(m,p,c);if(!z?.m||!z?.p||!z?.c)return;
    const step=Number(z.c.reportStep)||0;
    if(target==='progress'){state.execTab='progress';mark(z.m);renderAt(0);return}
    target=Math.max(0,Math.min(6,Number(target)||0));
    if(target>step&&validate){const hit=firstMissing(z.c,z.p,target-1);if(hit){z.c.reportStep=hit.step;mark(z.m);renderAt(0);setTimeout(()=>showMissing(hit.missing),40);return}}
    z.c.reportVisited=z.c.reportVisited||{};if(target>step)z.c.reportVisited[step]=true;z.c.reportStep=target;mark(z.m);renderAt(0);
    W.RigGO1217?.persistImmediate?.(z.m,{label:'Guardando reporte…'}).catch(()=>{});
  }finally{setTimeout(()=>{reportBusy=false},80)}
}
// Navigation runs before historic document handlers. Prevent focusout from
// replacing the pressed Next button between pointerdown and click.
function installReportAuthority(){
  const nav='#v3ReportPrev,#v3ReportNext,[data-v3-reportstep]';
  W.addEventListener('pointerdown',e=>{if(e.target?.closest?.(nav))e.preventDefault()},true);
  W.addEventListener('click',e=>{
    const b=e.target?.closest?.(nav);if(!b||b.disabled)return;
    const z=live();if(!z.m||!z.p||!z.c)return;
    e.preventDefault();e.stopImmediatePropagation();
    const step=Number(z.c.reportStep)||0;
    if(b.id==='v3ReportPrev')return goReport(z.m,z.p,z.c,step===0?'progress':step-1,{validate:false});
    if(b.id==='v3ReportNext')return goReport(z.m,z.p,z.c,Math.min(6,step+1));
    const target=Number(b.dataset.v3Reportstep);if(target===step)return;
    if(target<step||z.c.reportVisited?.[target])return goReport(z.m,z.p,z.c,target,{validate:false});
    if(target===step+1)return goReport(z.m,z.p,z.c,target);
    try{toast('Completa los pasos en secuencia')}catch(_){}
  },true);
  W.addEventListener('change',e=>{
    const b=e.target;if(!b?.matches?.('[data-v3-carry],[data-carry]'))return;
    e.stopImmediatePropagation();
    const z=W.RigGO1217.applyField(b);if(!z?.m)return;
    const y=window.scrollY,block=b.closest('.v3-resource'),body=block?.querySelector('.v3-resource-body');
    // Refresh only this resource body: a prior day may contain more/fewer rows.
    // The checkbox, navigation and rest of the page retain their DOM and focus.
    if(body){
      const tmp=document.createElement('div');tmp.innerHTML=W.RigGOResourcesHTML(z.c);
      const key=b.dataset.v3Carry||b.dataset.carry;
      const fresh=[...tmp.querySelectorAll('[data-v3-carry]')].find(x=>x.dataset.v3Carry===key)?.closest('.v3-resource')?.querySelector('.v3-resource-body');
      if(fresh){body.className=fresh.className;body.replaceChildren(...fresh.childNodes);}
      body.querySelectorAll('input,select,textarea').forEach(el=>{el.dataset.riggoMoveId=z.m.id;el.dataset.riggoPeriodId=z.p.id;});
      window.scrollTo(0,y);
    }
    mark(z.m);W.RigGO1217.persistImmediate(z.m,{label:'Guardando recursos…'}).catch(()=>{});
  },true);
}
function bindCarryNoJump(){} // Kept for post-render compatibility; authority is delegated once.

/* --------------------------------------------------------------------------
   3) ACTIVE -> READY reset: atomic server RPC; Plan is preserved.
   -------------------------------------------------------------------------- */
function canReset(m){if(!m)return false;const s=String(m.syncMeta?.serverStatus||m.status||'').toLowerCase();if(s!=='active')return false;try{return hasPerm('execute')||hasPerm('admin')||hasPerm('plan')}catch(_){return false}}
async function idbDelete(dbName,store,key){return new Promise(resolve=>{try{const r=indexedDB.open(dbName,1);r.onerror=()=>resolve(false);r.onsuccess=()=>{try{const db=r.result;if(!db.objectStoreNames.contains(store)){db.close();resolve(true);return}const tx=db.transaction(store,'readwrite');tx.objectStore(store).delete(key);tx.oncomplete=()=>{db.close();resolve(true)};tx.onerror=()=>{db.close();resolve(false)}}catch(_){resolve(false)}}}catch(_){resolve(false)}})}
async function clearResetOutboxes(moveId){await Promise.all([idbDelete('riggo-execution-v120','outbox',moveId),idbDelete('riggo-field-v112','outbox',`save:${moveId}`)]);try{await W.RigGOV112?.refreshPending?.()}catch(_){} }
async function serverRevisions(moveId){const SB=W.RigGOSupabase;if(!SB)throw new Error('Supabase no disponible.');const mr=await SB.from('moves').select('revision,status').eq('id',moveId).single();if(mr.error)throw mr.error;const er=await SB.rpc('riggo_execution_read_c4',{p_move_ids:[moveId]});if(er.error)throw er.error;const row=(er.data||[]).find(x=>String(x.move_id)===String(moveId));if(!row)throw new Error('Execution state no encontrado.');return{master:Number(mr.data?.revision)||0,status:mr.data?.status,execution:Number(row.revision)||0}}
const resetRequests=new Map(),resetBusy=new Set();
async function resetMoveToReady(moveId,btn=null){
  let m=(state.moves||[]).find(x=>String(x.id)===String(moveId));
  if(!m||(!resetRequests.has(moveId)&&!canReset(m)))throw new Error('Esta Move no está disponible para reinicio.');
  if(navigator.onLine===false)throw new Error('Se requiere conexión para reiniciar una Move.');
  if(resetBusy.has(moveId))throw new Error('El reinicio ya está en curso.');
  resetBusy.add(moveId);if(btn){btn.disabled=true;btn.textContent='Reiniciando…'}if(E('riggo1235ResetCancel'))E('riggo1235ResetCancel').disabled=true;
  try{
    if(!resetRequests.has(moveId)){
      const pre=await W.RigGO1217.persistImmediate(m,{label:'Sincronizando ejecución…'});
      if(!pre?.ok||pre.pending||pre.blocked||pre.transportFailure)throw new Error('Hay cambios pendientes. Sincroniza antes de reiniciar.');
      const master=await W.RigGOV112.flush();
      if(master?.ok===false||master?.blocked||master?.transportFailure||master?.serverFailure||master?.conflicts)throw new Error('No se pudo sincronizar la Move antes del reinicio.');
      // Prevent new local snapshots while the atomic operation is in flight.
      m._resetInProgress=true;
      await W.RigGOV120.flush();
      const rev=await serverRevisions(moveId);
      if(String(rev.status)!=='active')throw new Error('La Move ya no está activa. Actualiza RigGO.');
      resetRequests.set(moveId,{p_move_id:moveId,p_expected_master_revision:rev.master,p_expected_execution_revision:rev.execution,p_operation_id:uid()});
    }
    m._resetInProgress=true;
    const {data,error}=await W.RigGOSupabase.rpc('riggo_reset_move_to_ready_v1',resetRequests.get(moveId));
    if(error){if(/function.*does not exist|schema cache/i.test(String(error.message||error)))throw new Error('Falta instalar el SQL de reinicio 12.3.6/12.3.7 en Supabase.');throw error}
    if(!data?.ok){resetRequests.delete(moveId);throw new Error(data?.message||data?.code||'El servidor no confirmó el reinicio.')}
    await clearResetOutboxes(moveId);
    m=(state.moves||[]).find(x=>String(x.id)===String(moveId))||m;
    m.status='ready';m.syncMeta=m.syncMeta||{};m.syncMeta.serverStatus='ready';m.syncMeta.revision=Number(data.master_revision);
    await W.RigGOV120.acceptReset(m,data);
    m.syncMeta.lastServerRow=W.RigGOV112.moveToRow(m);
    m.syncMeta.lastServerFingerprint=W.RigGOV112.fingerprint(m);
    delete m._resetInProgress;resetRequests.delete(moveId);
    state.screen='moveSelect';state.execMode='days';state.execTab='rd';state.selectedMoveId=m.id;
    try{saveLocal()}catch(_){}renderAt(0);try{toast('Move reiniciada · lista para iniciar ✓')}catch(_){}
    return data;
  }finally{
    delete m._resetInProgress;resetBusy.delete(moveId);if(E('riggo1235ResetCancel'))E('riggo1235ResetCancel').disabled=false;
    if(btn&&document.body.contains(btn)){btn.disabled=false;btn.textContent='Confirmar reinicio'}
  }
}
function openResetSheet(m){
  sheetRoot.innerHTML=`<div class="sheet-backdrop"><div class="sheet"><div class="sheet-handle"></div><h2>Reiniciar Move · ${esc(m.meta?.rig||'')}</h2><div class="sheet-sub">La Move volverá a <b>No iniciada / Lista para iniciar</b>. Se conserva el Plan, pero se elimina la ejecución de esta corrida: Release real, días, Flat Time, avance, estados de cargas, cierres y reportes operacionales.</div><div class="panel" style="margin-top:12px;border-color:rgba(239,68,68,.45)"><b>Esta acción es intencional y auditada.</b><div class="small muted" style="margin-top:5px">Escribe <b>REINICIAR</b> para confirmar.</div></div><label style="margin-top:12px">Confirmación<input id="riggo1235ResetConfirm" class="field" autocomplete="off" placeholder="REINICIAR"></label><div id="riggo1235ResetStatus" class="small" style="margin-top:8px"></div><div class="sheet-footer"><button id="riggo1235ResetCancel" class="btn">Cancelar</button><button id="riggo1235ResetDo" class="btn danger" disabled>Confirmar reinicio</button></div></div></div>`;
  E('riggo1235ResetCancel').onclick=closeSheet;const inp=E('riggo1235ResetConfirm'),btn=E('riggo1235ResetDo');inp.oninput=()=>{btn.disabled=inp.value.trim().toUpperCase()!=='REINICIAR'};btn.onclick=async()=>{if(inp.value.trim().toUpperCase()!=='REINICIAR')return;const s=E('riggo1235ResetStatus');if(s)s.textContent='Validando y reiniciando en servidor…';try{await resetMoveToReady(m.id,btn);closeSheet()}catch(e){if(s){s.style.color='#ffafb8';s.textContent=String(e?.message||e)}alert('No fue posible reiniciar la Move: '+String(e?.message||e))}};setTimeout(()=>inp.focus(),40)
}
function injectResetButton(){
  document.querySelectorAll('[data-v4-editmove],[data-editmove]').forEach(anchor=>{
    const id=anchor.dataset.v4Editmove||anchor.dataset.editmove,m=(state.moves||[]).find(x=>String(x.id)===String(id));
    if(!canReset(m)||anchor.parentElement.querySelector('[data-riggo-reset]'))return;
    const b=document.createElement('button');b.type='button';b.dataset.riggoReset=id;b.className='btn small danger riggo1235-reset';b.textContent='Reiniciar';
    b.onclick=e=>{e.preventDefault();e.stopImmediatePropagation();openResetSheet(m)};anchor.insertAdjacentElement('afterend',b);
  });
  if(state?.screen!=='execute')return;
  const m=(state.moves||[]).find(x=>String(x.id)===String(state.selectedMoveId));if(!canReset(m)||E('riggo1235ResetMove'))return;
  const anchor=E('v3ChangeMove');if(!anchor)return;
  const b=document.createElement('button');b.type='button';b.id='riggo1235ResetMove';b.dataset.v43Short='Reiniciar';b.className='btn small danger riggo1235-reset';b.textContent='Reiniciar Move';
  b.onclick=e=>{e.preventDefault();e.stopImmediatePropagation();openResetSheet(m)};anchor.insertAdjacentElement('beforebegin',b);
}

function styles(){if(E('riggo1235Style'))return;const s=document.createElement('style');s.id='riggo1235Style';s.textContent=`.riggo1235-reset{border-color:rgba(239,68,68,.45)!important;color:#ffb4bb!important;background:rgba(113,24,35,.18)!important}.riggo1235-reset:hover{background:rgba(140,30,42,.30)!important}@media(max-width:700px){.v3-exec-title>.row:has(#riggo1235ResetMove){grid-template-columns:repeat(4,minmax(0,1fr))!important}}`;document.head.appendChild(s)}
function post(){installLoadAuthority();injectResetButton();if(state?.screen==='execute'&&state?.execMode==='day'&&state?.execTab==='report')bindCarryNoJump()}
function install(){if(W.__RIGGO_1235_INSTALLED__)return;W.__RIGGO_1235_INSTALLED__=true;styles();installLoadAuthority();installReportAuthority();const base=typeof W.render==='function'?W.render:(typeof render==='function'?render:null);if(base&&!base.__riggo1235){const fn=function(){const r=base.apply(this,arguments);requestAnimationFrame(post);return r};fn.__riggo1235=true;try{W.render=fn;render=fn}catch(_){W.render=fn}}post();W.RigGO1237=W.RigGO1236=W.RigGO1235={release:RELEASE,build:BUILD,directAdvanceLoad,undoLoad,canUndoLoad,isLoadBusy,goReport,resetMoveToReady,openResetSheet,selfCheck:()=>({ok:true,loadDirectCycle:['Pendiente','Cargada','En tránsito','Posicionada'],reportSingleClick:true,carryPreservesScroll:true,atomicResetRpc:'riggo_reset_move_to_ready_v1'})};}
let tries=0;(function wait(){tries++;let ok=false;try{ok=!document.documentElement.classList.contains('riggo-booting')&&W.RigGO?.runtime?.selfCheck?.()?.ok===true&&!!W.RigGO1217}catch(_){}if(ok)return install();if(tries<500)setTimeout(wait,60);else console.error('RigGO 12.3.7 field UX patch not installed')})();
})();
