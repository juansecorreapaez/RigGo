/* RigGO 12.4.4: authoritative lifecycle and recoverable local queue. */
(function(W){
'use strict';
const clone=v=>JSON.parse(JSON.stringify(v));
const terminal=s=>['closed','completed'].includes(String(s||'').toLowerCase());
const lifeValue=v=>{const n=Date.parse(v||'');return Number.isFinite(n)?n:(v||null);};
const differs=(local,remote)=>local.status!==remote.status||lifeValue(local.actual_release)!==lifeValue(remote.actual_release)||lifeValue(local.actual_acceptance)!==lifeValue(remote.actual_acceptance);
const lifeError=item=>/riggo_atomic_completion_required|riggo_lifecycle_rpc_required/i.test(String(item?.lastError||''));
const same=(a,b)=>{if(a===b)return true;if(!a||!b||typeof a!=='object'||typeof b!=='object')return false;if(Array.isArray(a)!==Array.isArray(b))return false;const keys=Object.keys(a);return keys.length===Object.keys(b).length&&keys.every(key=>Object.prototype.hasOwnProperty.call(b,key)&&same(a[key],b[key]));};
const copy=v=>v===undefined?undefined:clone(v);
function mergePending(base,local,remote,path=''){
  if(same(local,base))return copy(remote);if(same(remote,base)||same(local,remote))return copy(local);
  if(local&&remote&&typeof local==='object'&&typeof remote==='object'&&!Array.isArray(local)&&!Array.isArray(remote)&&(!base||(typeof base==='object'&&!Array.isArray(base)))){
    const out={};for(const key of new Set([...Object.keys(base||{}),...Object.keys(local),...Object.keys(remote)])){const value=mergePending(base?.[key],local[key],remote[key],path?path+'.'+key:key);if(value!==undefined)out[key]=value;}return out;
  }
  const error=new Error('Concurrent edits require review: '+path);error.code='pending_field_conflict';throw error;
}
function alignRow(local,remote){
  const row=clone(local);
  for(const key of ['status','actual_release','actual_acceptance'])row[key]=remote[key]??null;
  if(row.settings?.riggo_payload)row.settings.riggo_payload.status=remote.status==='completed'?'closed':remote.status;
  return row;
}
function recoverable(item,remote){return item?.type==='save'&&!!item.blockedCode&&!item.lifecycleReviewError&&lifeError(item)&&terminal(remote?.status);}
let dbPromise;
function database(){
  if(dbPromise)return dbPromise;
  dbPromise=new Promise((resolve,reject)=>{
    const req=W.indexedDB.open('riggo-lifecycle-backups-v1244');
    const timer=setTimeout(()=>reject(new Error('Local backup unavailable')),12000);
    req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains('records'))req.result.createObjectStore('records',{keyPath:'id'});};
    req.onerror=()=>{clearTimeout(timer);reject(req.error);};
    req.onblocked=()=>{clearTimeout(timer);reject(new Error('Local backup blocked'));};
    req.onsuccess=()=>{clearTimeout(timer);const db=req.result;db.onversionchange=()=>{db.close();dbPromise=null;};resolve(db);};
  }).catch(error=>{dbPromise=null;throw error;});
  return dbPromise;
}
async function backup(item,remote=null){
  const db=await database();
  const id=String(item.moveId||item.id||'local')+':'+String(item.operationId||item.createdAt||'snapshot')+':'+String(remote?.revision||0)+':'+String(item.type||'snapshot');
  const record={id,at:new Date().toISOString(),origin:W.location?.origin||'',operation:clone(item),server:remote?clone(remote):null};
  await new Promise((resolve,reject)=>{const tx=db.transaction('records','readwrite');tx.objectStore('records').put(record);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error('Local backup aborted'));});
  return id;
}
async function listBackups(){const db=await database();return new Promise((resolve,reject)=>{const req=db.transaction('records','readonly').objectStore('records').getAll();req.onsuccess=()=>resolve(req.result||[]);req.onerror=()=>reject(req.error);});}
async function prepare(item,remote,remoteRow,operationId){
  if(!recoverable(item,remote))return null;
  const backupId=await api.backup(item,remote);
  if(!item.baseRow){const error=new Error('Comparison baseline missing; review the pending change.');error.code='pending_baseline_missing';throw error;}
  const updated=clone(item);updated.row=mergePending(alignRow(item.baseRow,remote),alignRow(item.row,remote),alignRow(remoteRow,remote));updated.baseRow=clone(remoteRow);updated.expectedRevision=Number(remote.revision)||1;updated.operationId=operationId;
  W.RigGOSyncRetry1238.clear(updated);updated.lifecycleRepairBackup=backupId;updated.lifecycleRebasedAt=new Date().toISOString();return updated;
}
const api={alignRow,differs,recoverable,prepare,backup,listBackups,terminal,mergePending};W.RigGOLifecycle1244=api;
if(typeof document==='undefined')return;
const tr=(es,en)=>(document.documentElement.lang||'es').startsWith('en')?en:es;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const appState=()=>W.state||(typeof state!=='undefined'?state:null);
async function queues(){
  if(typeof W.RigGOV112?.listOutbox!=='function')throw new Error(tr('La sincronización todavía está cargando.','Synchronization is still loading.'));
  return{master:await W.RigGOV112.listOutbox(),execution:typeof W.RigGOV120?.listOutbox==='function'?await W.RigGOV120.listOutbox():[]};
}
function reason(item){if(item.lifecycleReviewError)return tr('Hay cambios simultáneos que necesitan revisión. Descarga el respaldo antes de editar la Move.','Concurrent changes need review. Download the backup before editing the Move.');return lifeError(item)?tr('El cierre requiere confirmación del servidor. La actualización conserva tus cambios para reconciliarlos.','Closing requires server confirmation. This update preserves your changes for reconciliation.'):tr('El servidor no ha confirmado este cambio. Guarda un respaldo y reintenta.','The server has not confirmed this change. Save a backup and retry.');}
async function exportBackup(){
  const q=await queues();
  const data={format:'riggo-local-backup-1244',at:new Date().toISOString(),origin:W.location.origin,account:appState()?.auth?.email||'',masterOperations:q.master,executionOperations:q.execution,lifecycleBackups:await api.listBackups()};
  const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download='RigGO_local_backup_'+new Date().toISOString().replace(/[:.]/g,'-')+'.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
}
api.exportBackup=exportBackup;
async function openReview(){
  const focus=document.activeElement,q=await queues(),items=[...q.master.map(item=>({item,kind:'master'})),...q.execution.map(item=>({item,kind:'execution'}))];
  const root=document.getElementById('sheetRoot');if(!root)return;const st=appState();
  const cards=items.map(({item,kind},i)=>{
    const m=(st?.moves||[]).find(m=>m.id===item.moveId),name=m?.meta?.rig||item.row?.rig||item.moveId||'Move';
    const route=m?.meta?String(m.meta.origin||'')+' → '+String(m.meta.destination||''):'';
    const error=item.lifecycleReviewError||item.lastError||item.blockedCode||tr('Pendiente de confirmación','Awaiting confirmation');
    return '<article class="panel" style="margin-top:12px;overflow-wrap:anywhere"><strong>'+esc(name)+'</strong><p>'+esc(route)+'</p><p>'+esc(reason(item))+'</p><details><summary>'+tr('Detalle del guardado','Save details')+'</summary><p>'+esc(error)+'</p></details>'+(!item.lifecycleReviewError&&((kind==='master'&&item.type==='save')||kind==='execution')?'<button class="btn" data-lifecycle-retry="'+i+'">'+tr('Respaldar y reintentar','Back up and retry')+'</button>':'')+'</article>';
  }).join('');
  root.innerHTML='<div class="sheet-backdrop"><section class="sheet" style="display:flex;flex-direction:column;max-height:calc(100vh - 24px);max-height:calc(100dvh - 24px);overflow:hidden" role="dialog" aria-modal="true" aria-labelledby="lifecycleReviewTitle"><div class="sheet-handle"></div><h2 id="lifecycleReviewTitle">'+tr('Cambios pendientes de guardar','Changes awaiting confirmation')+'</h2><p>'+tr('Los cambios permanecen en este navegador hasta que el servidor los confirme.','Changes remain in this browser until the server confirms them.')+'</p><div id="lifecycleReviewStatus" role="status" aria-live="polite"></div><div id="lifecycleReviewItems" style="min-height:0;overflow:auto;overscroll-behavior:contain;padding-bottom:12px">'+(cards||'<p>'+tr('No hay operaciones pendientes.','There are no pending operations.')+'</p>')+'</div><div class="sheet-footer" style="flex-shrink:0"><button class="btn" id="lifecycleBackup">'+tr('Descargar respaldo','Download backup')+'</button><button class="btn primary" id="lifecycleReviewClose">'+tr('Cerrar','Close')+'</button></div></section></div>';
  const close=()=>{root.innerHTML='';if(focus?.isConnected)focus.focus();};document.getElementById('lifecycleReviewClose').onclick=close;
  const result=document.getElementById('lifecycleReviewStatus');
  document.getElementById('lifecycleBackup').onclick=async()=>{try{await api.exportBackup();result.textContent=tr('Respaldo descargado.','Backup downloaded.');}catch(error){result.textContent=tr('No fue posible crear el respaldo: ','Could not create the backup: ')+String(error.message||error);}};
  root.querySelectorAll('[data-lifecycle-retry]').forEach(button=>{button.onclick=async()=>{
    button.disabled=true;const {item,kind}=items[Number(button.dataset.lifecycleRetry)];
    try{await api.backup(item);if(kind==='master')await W.RigGOV112.retryBlockedSave(item.moveId);else await W.RigGOV120.retryPending(item.moveId);await openReview();}
    catch(error){result.textContent=tr('El cambio se conserva. No se pudo reintentar: ','Your change is preserved. Retry failed: ')+String(error.message||error);button.disabled=false;}
  };});
  const dialog=root.querySelector('[role="dialog"]');dialog.addEventListener('keydown',event=>{
    if(event.key==='Escape'){event.preventDefault();close();return;}if(event.key!=='Tab')return;
    const controls=[...dialog.querySelectorAll('button:not([disabled]),summary,[tabindex="0"]')],first=controls[0],last=controls.at(-1);
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
  });dialog.setAttribute('tabindex','-1');dialog.focus({preventScroll:true});
}
api.openReview=openReview;
function bind(){document.querySelectorAll('.online-sync').forEach(el=>{el.setAttribute('role','button');el.tabIndex=0;el.setAttribute('aria-haspopup','dialog');});}
function activate(event){if(event.type==='keydown'&&!['Enter',' '].includes(event.key))return;const badge=event.target.closest?.('.online-sync');if(!badge)return;event.preventDefault();api.openReview().catch(error=>W.alert(String(error.message||error)));}
document.addEventListener('click',activate);document.addEventListener('keydown',activate);
const start=()=>{bind();const root=document.getElementById('app');if(root&&W.MutationObserver)new W.MutationObserver(bind).observe(root,{childList:true,subtree:true});};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})(window);
