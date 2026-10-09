/* RigGO 12.4 — evidence durability, operation boundaries and accessible editing. */
(() => {
  'use strict';
  const W=window, copy=v=>structuredClone(v), uid=()=>crypto.randomUUID();
  const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const millis=v=>Date.parse(v||'');
  const live=(moveId,id)=>(state.moves||[]).find(m=>m.id===moveId)?.exec?.closures?.[id];
  const key=(m,c)=>`${m.id}|${m.exec?._riggoRunId||'legacy'}|${c.id}`;
  let dbPromise;
  function db(){return dbPromise||(dbPromise=new Promise((resolve,reject)=>{
    const r=indexedDB.open('riggo-media-v124',1);
    r.onupgradeneeded=()=>r.result.createObjectStore('evidence',{keyPath:'key'});
    r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);
  }));}
  async function read(k){const d=await db();return new Promise((resolve,reject)=>{
    const t=d.transaction('evidence'),r=t.objectStore('evidence').get(k);
    r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>reject(r.error);
  });}
  async function write(row){const d=await db();return new Promise((resolve,reject)=>{
    const t=d.transaction('evidence','readwrite');t.objectStore('evidence').put(row);
    t.oncomplete=()=>resolve(row);t.onerror=()=>reject(t.error);
  });}
  const refs=c=>JSON.stringify([c.photoStoragePaths||[],c.signatureStoragePath||'']);
  const mediaData=c=>({photos:copy(c.photos||[]),photoCaptions:copy(c.photoCaptions||[]),
    photoStoragePaths:copy(c.photoStoragePaths||[]),photoMediaIds:copy(c.photoMediaIds||[]),signature:c.signature||'',
    signatureStoragePath:c.signatureStoragePath||'',signaturePending:!!c.__signatureUploadPending});
  const commits=new Map();
  async function commit(m,c,{restored=false}={}){
    if(!m||!c)return null;
    c.photoMediaIds=(c.photos||[]).map((_,i)=>c.photoMediaIds?.[i]||uid());
    const k=key(m,c),data=mediaData(c);
    const work=(commits.get(k)||Promise.resolve()).catch(()=>{}).then(async()=>{
      const prev=await read(k),changed=JSON.stringify(prev?.data)!==JSON.stringify(data);
      if(!changed)return prev;
      const pending=restored?!!prev?.pending:true;
      const row={...prev,key:k,moveId:m.id,runId:m.exec?._riggoRunId||'legacy',closureId:c.id,
        data,pending,baseRefs:prev?.pending?prev.baseRefs:refs(c),updatedAt:new Date().toISOString()};
      if(!restored)W.RigGOSyncRetry1238?.clear(row);
      await write(row);return row;
    });
    commits.set(k,work);
    try{return await work}catch(e){c.__mediaError='No se pudo respaldar la evidencia en este dispositivo. Mantén el reporte abierto e intenta de nuevo.';status(c.__mediaError,true);throw e}
    finally{if(commits.get(k)===work)commits.delete(k)}
  }
  async function restore(m,c){
    const row=await read(key(m,c));if(!row)return false;
    const match=refs(c)===refs(row.data),pendingBase=row.pending&&refs(c)===row.baseRefs;
    if(!match&&!pendingBase)return false;
    if(row.pending){Object.assign(c,copy(row.data));c.__signatureUploadPending=row.data.signaturePending;delete c.signaturePending;}
    else{
      if(!(c.photos||[]).length)c.photos=copy(row.data.photos);if(!c.photoMediaIds?.length)c.photoMediaIds=copy(row.data.photoMediaIds||[]);
      if(!c.signature&&c.signatureStoragePath===row.data.signatureStoragePath)c.signature=row.data.signature;
    }
    if(match){c.__loadedPhotoPaths=copy(row.data.photoStoragePaths);c.__loadedSignaturePath=row.data.signatureStoragePath;}
    return true;
  }
  async function canSync(m,c,manual){const r=await read(key(m,c));return manual||!r||W.RigGOSyncRetry1238.due(r);}
  async function ack(m,c,ok){const r=await read(key(m,c));if(!r)return;
    r.data=mediaData(c);r.pending=!ok;if(ok){r.baseRefs=refs(c);W.RigGOSyncRetry1238.clear(r)}await write(r);
  }
  async function fail(m,c,e){const r=await read(key(m,c));if(!r)return;r.pending=true;
    if(W.RigGOSyncRetry1238.transient(e))W.RigGOSyncRetry1238.postpone(r,e);
    else{r.blockedCode=String(e.code||e.status||'media_rejected');r.lastError=String(e.message||e)}
    await write(r);status('Evidencia guardada en este dispositivo. Falta sincronizar.',true);
  }
  function status(text,error=false){const el=document.getElementById('riggo124MediaStatus');if(el){el.textContent=text;el.dataset.error=String(error)}}
  async function persistEvidence(m,c){
    c.__mediaSaving=true;let stored=false;status('Guardando evidencia…');
    try{
      await commit(m,c);stored=true;save();
      if(navigator.onLine===false){status('Evidencia guardada en este dispositivo · Pendiente de conexión');return {ok:false,offline:true}}
      const r=await W.RigGOV120.syncClosureMedia(m.id,c.id,{manual:true});
      status(r.ok?'Evidencia guardada y sincronizada':'Evidencia guardada en este dispositivo · Pendiente de sincronizar',!r.ok);return r;
    }catch(e){status(stored?'Evidencia guardada en este dispositivo · Reintenta la sincronización':'No se pudo guardar la evidencia. Mantén el reporte abierto y libera espacio en este dispositivo.',true);return{ok:false,error:e,stored}}
    finally{c.__mediaSaving=false}
  }
  function fileUrl(f){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.readAsDataURL(f)})}
  async function imageFile(file,signature=false){
    if(!['image/png','image/jpeg','image/webp'].includes(file.type))throw new Error('Usa una imagen PNG, JPG o WebP.');
    if(file.size>(signature?5:12)*1024*1024)throw new Error(`La imagen supera ${signature?5:12} MB. Usa una más pequeña.`);
    const img=new Image(),src=await fileUrl(file);await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(new Error('No se pudo leer la imagen. Elige otro archivo.'));img.src=src});
    if(!img.naturalWidth||!img.naturalHeight)throw new Error('La imagen no tiene contenido válido.');
    const cv=document.createElement('canvas'),scale=Math.min(1,(signature?900:1600)/img.naturalWidth,(signature?340:1600)/img.naturalHeight);
    if(signature){cv.width=900;cv.height=340}else{cv.width=Math.max(1,Math.round(img.naturalWidth*scale));cv.height=Math.max(1,Math.round(img.naturalHeight*scale))}
    const ctx=cv.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,cv.width,cv.height);
    const w=img.naturalWidth*scale,h=img.naturalHeight*scale;ctx.drawImage(img,(cv.width-w)/2,(cv.height-h)/2,w,h);
    return cv.toDataURL(signature?'image/png':'image/jpeg',.82);
  }
  function ctxFor(c){const m=state.moves.find(m=>m.id===state.selectedMoveId);return {m,c:m?.exec?.closures?.[c.id]||c}}
  function wirePhotos(input,c){
    if(!input||input.dataset.mediaBound)return;input.dataset.mediaBound='true';
    input.addEventListener('click',()=>{W.__RIGGO_MEDIA_PICKER_ACTIVE__=true;window.addEventListener('focus',()=>setTimeout(()=>{if(!W.__RIGGO_MEDIA_READING__)W.__RIGGO_MEDIA_PICKER_ACTIVE__=false},300),{once:true})});
    input.addEventListener('cancel',()=>W.__RIGGO_MEDIA_PICKER_ACTIVE__=false);
    input.addEventListener('change',async()=>{
      const files=[...(input.files||[])];if(!files.length){W.__RIGGO_MEDIA_PICKER_ACTIVE__=false;return}
      const {m,c:lc}=ctxFor(c);W.__RIGGO_MEDIA_READING__=true;
      try{const urls=await Promise.all(files.map(f=>imageFile(f)));lc.photos=lc.photos||[];lc.photoCaptions=lc.photoCaptions||[];lc.photoStoragePaths=lc.photoStoragePaths||[];
        for(const url of urls){lc.photos.push(url);lc.photoCaptions.push('');lc.photoStoragePaths.push('')}
        await persistEvidence(m,lc);
        const active=document.activeElement,editing=active?.matches?.('input:not([type=file]),textarea,select,[contenteditable=true]');
        if(state.screen==='execute'&&state.execTab==='report'&&state.selectedMoveId===m.id&&m.exec.selectedPeriodId===lc.id&&lc.reportStep===4&&!editing)render();
      }catch(e){toast(e.message);status(e.message,true)}finally{input.value='';W.__RIGGO_MEDIA_READING__=false;W.__RIGGO_MEDIA_PICKER_ACTIVE__=false}
    });
  }
  async function removePhoto(m,c,i){c.photos.splice(i,1);c.photoMediaIds?.splice(i,1);c.photoCaptions?.splice(i,1);c.photoStoragePaths?.splice(i,1);c.__loadedPhotoPaths=copy(c.photoStoragePaths||[]);await commit(m,c);save();W.RigGOV120.markDirty(m);await W.RigGOV120.persistNow(m);}
  function wireSignature(c){
    const cv=document.getElementById('signatureCanvas');if(!cv||cv.dataset.mediaBound)return;cv.dataset.mediaBound='true';cv.setAttribute('aria-label','Dibuja la firma del supervisor o carga una imagen');cv.style.touchAction='none';
    const {m}=ctxFor(c),moveId=m.id,id=c.id,get=()=>live(moveId,id),ctx=cv.getContext('2d');let down=false,dirty=false,paintToken=0;
    function paint(src){const token=++paintToken;ctx.fillStyle='#fff';ctx.fillRect(0,0,cv.width,cv.height);if(src){const image=new Image();image.onload=()=>{if(!dirty&&token===paintToken)ctx.drawImage(image,0,0,cv.width,cv.height)};image.src=src}}
    paint(get()?.signature);ctx.strokeStyle='#17202a';ctx.lineWidth=4;ctx.lineCap='round';
    const pos=e=>{const r=cv.getBoundingClientRect();return[(e.clientX-r.left)*cv.width/r.width,(e.clientY-r.top)*cv.height/r.height]};
    cv.addEventListener('pointerdown',e=>{e.preventDefault();dirty=true;down=true;cv.setPointerCapture(e.pointerId);ctx.beginPath();ctx.moveTo(...pos(e))});
    cv.addEventListener('pointermove',e=>{if(!down)return;e.preventDefault();ctx.lineTo(...pos(e));ctx.stroke()});
    const end=async()=>{if(!down)return;down=false;const lc=get();if(!lc)return;lc.signature=cv.toDataURL('image/png');lc.__signatureUploadPending=true;await persistEvidence(state.moves.find(x=>x.id===moveId),lc)};
    cv.addEventListener('pointerup',end);cv.addEventListener('pointercancel',end);cv.addEventListener('lostpointercapture',end);
    const clear=document.getElementById('clearSignature');if(clear)clear.onclick=async()=>{const lc=get();if(!lc)return;dirty=false;paint('');lc.signature='';lc.signatureStoragePath='';lc.__loadedSignaturePath='';lc.__signatureUploadPending=false;await commit(m,lc);save();W.RigGOV120.markDirty(m);const r=await W.RigGOV120.persistNow(m);status(r.ok?'Firma quitada':'Firma quitada en este dispositivo · Pendiente de sincronizar')};
    const input=document.getElementById('riggo124SignatureFile');if(input)input.onchange=async()=>{
      const f=input.files?.[0];if(!f)return;W.__RIGGO_MEDIA_PICKER_ACTIVE__=true;W.__RIGGO_MEDIA_READING__=true;
      try{const src=await imageFile(f,true),lc=get();if(!lc)return;dirty=false;paint(src);lc.signature=src;lc.__signatureUploadPending=true;await persistEvidence(m,lc)}
      catch(e){status(e.message,true)}finally{input.value='';W.__RIGGO_MEDIA_PICKER_ACTIVE__=false;W.__RIGGO_MEDIA_READING__=false}
    };
  }
  W.RigGO124Media={commit,restore,read,canSync,ack,fail,wirePhotos,wireSignature,removePhoto,persistEvidence,imageFile,inFlight:new Map()};

  // A transport percentage counts mobilized loads; physical RM still counts positioned loads.
  function transport(m,p,scope){return scopeCounts(m,scope,p)}
  function physicalBoundary(m,now=Date.now()){
    const e=m?.exec;if(!e?.actualRelease)return null;
    const release=millis(e.actualRelease),explicit=millis(e.operationalEndAt),acceptance=millis(e.actualAcceptance);
    if(Number.isFinite(explicit)&&explicit>=release)return {at:new Date(explicit).toISOString(),source:'confirmed'};
    if(Number.isFinite(acceptance)&&acceptance>=release)return {at:new Date(acceptance).toISOString(),source:'acceptance'};
    const tasks=[...(e.tasksRD||[]),...(e.tasksRU||[])],loads=e.loads||[],times=[];
    if(!tasks.length&&!loads.length)return null;
    for(const t of tasks){const at=millis(t.doneAt);if(!Number.isFinite(at)||at<release||at>now)return null;times.push(at)}
    for(const l of loads){const hs=(l.history||[]).filter(h=>millis(h.at)<=now).sort((a,b)=>millis(a.at)-millis(b.at));
      const last=hs.at(-1);if(last&&last.status!=='Posicionada')return null;
      const at=millis(last?.at||l.positionedAt);if(!Number.isFinite(at)||at<release||at>now)return null;times.push(at)}
    const at=Math.max(...times);if(at<=millis(e.operationalReopenedAt))return null;
    return {at:new Date(at).toISOString(),source:'physical'};
  }
  const periodBase=W.movePeriods;
  function physicalEnd(m,now=Date.now()){
    const physical=physicalBoundary(m,now);if(physical)return physical;
    if(!m?.exec?.actualRelease)return null;
    const closed=periodBase(m).filter(p=>!!m.exec.closures?.[p.id]?.closedAt).sort((a,b)=>b.index-a.index);
    const p=closed[0],c=p&&m.exec.closures[p.id];if(!c||!Object.values(c.overrides||{}).some(Boolean))return null;
    const suggested=suggestedPcts(m,p),full=['rd','rm','ru'].every(k=>c.overrides?.[k]?Number(c.reported?.[k])===100:Number(suggested[k])===100);
    if(!full||millis(p.end)<=millis(m.exec.operationalReopenedAt))return null;
    return {at:new Date(Math.min(millis(p.end),millis(c.closedAt)||now,now)).toISOString(),source:'reported',needsConfirmation:true};
  }
  const meaningful=c=>!!c&&(!!c.closedAt||!!c.sentAt||!!c.f0065ReviewedAt||!!c.originOps||!!c.destinationOps||!!c.next24||!!c.signature||!!c.signatureStoragePath||!!c.photos?.length||!!c.photoStoragePaths?.length||!!c.flatEvents?.length||Object.values(c.overrides||{}).some(Boolean));
  W.movePeriods=function(m){
    const stop=physicalEnd(m);if(!stop)return periodBase(m);
    const e=m.exec,acceptance=e.actualAcceptance,forced=e.forcedThroughDay;
    const keep=Object.entries(e.closures||{}).filter(([,c])=>meaningful(c)).map(([id])=>Number(id.replace(/^D/,''))).filter(Number.isFinite);
    let all,operational;
    try{e.actualAcceptance='';e.forcedThroughDay=Math.max(Number(forced)||0,...keep,1);all=periodBase(m);
      e.actualAcceptance=stop.at;e.forcedThroughDay=0;operational=periodBase(m);
    }finally{e.actualAcceptance=acceptance;e.forcedThroughDay=forced}
    const ids=new Set(operational.map(p=>p.id));
    for(const p of all)if(!ids.has(p.id)&&meaningful(e.closures?.[p.id]))operational.push({...p,outsideOperation:true,status:e.closures[p.id].closedAt?'Cerrado':'Fuera de operación'});
    for(const p of operational)if(!p.outsideOperation)p.operationalEndAt=stop.at;
    e.periods=operational;return operational;
  };
  const extendBase=W.v4EnsureNextDay;
  W.v4EnsureNextDay=function(m,index){if(physicalEnd(m))return null;return extendBase(m,index)};
  const lifecycleBase=W.v4Lifecycle;
  W.v4Lifecycle=function(m){const end=physicalEnd(m);return m?.status==='active'&&end?(end.needsConfirmation?'100 % reportado · Revisar fin':'Operación terminada · Cierre pendiente'):lifecycleBase(m)};
  const dayStateBase=W.v4DayState;
  W.v4DayState=function(m,p){return p.outsideOperation?{label:'Histórico posterior al fin',cls:'warn'}:dayStateBase(m,p)};
  function reportFingerprint(c){
    const fields=['reported','overrides','scope','milestones','flatEvents','originOps','destinationOps','next24','generalComment','crew','vehicles','lmc','hse','photos','photoCaptions','signature','participants','siteSupervisor','siteSupervisorRole','safetyTopic','safetyUnderstood','permitsDay','permitsAcc','risksDay','risksAcc','ocDay','ocAcc'];
    const text=JSON.stringify(Object.fromEntries(fields.map(k=>[k,c[k]])));let n=2166136261;for(let i=0;i<text.length;i++)n=Math.imul(n^text.charCodeAt(i),16777619);return (n>>>0).toString(16);
  }
  async function setEnd(m,at,{reopen=false}={}){
    if(!hasPerm('execute')||m.status!=='active')throw new Error('Se requiere permiso de ejecución y una Move activa.');
    const t=millis(at);if(!reopen&&(!Number.isFinite(t)||t<millis(m.exec.actualRelease)||t>Date.now()))throw new Error('El fin debe estar entre el inicio de la Move y la hora actual.');
    if(!reopen){const latest=physicalBoundary({...m,exec:{...m.exec,operationalEndAt:'',actualAcceptance:''}});if(latest&&t<millis(latest.at))throw new Error('El fin no puede ser anterior a la última actividad completada.');}
    if(reopen){m.exec.operationalEndAt='';m.exec.operationalReopenedAt=new Date().toISOString()}else{m.exec.operationalEndAt=new Date(t).toISOString();m.exec.operationalEndBy=state.auth.email;m.exec.operationalEndRecordedAt=new Date().toISOString()}
    m.audit=m.audit||[];m.audit.push({at:new Date().toISOString(),user:state.auth.email,action:reopen?'reopen_operation':'confirm_operational_end',value:reopen?'':m.exec.operationalEndAt});
    W.RigGOV120.markDirty(m);save();return W.RigGOV120.persistNow(m);
  }
  function endSheet(m){
    const existing=physicalEnd(m),defaultAt=existing?.at||new Date().toISOString();
    sheetRoot.innerHTML=`<div class="sheet-backdrop"><section class="sheet" role="dialog" aria-modal="true" aria-labelledby="riggo124EndTitle"><h2 id="riggo124EndTitle">Fin operativo · ${escape(m.meta.rig)}</h2><p class="sheet-sub">La fecha detiene nuevos días. Completa los reportes existentes y registra la aceptación para cerrar la Move.</p><label>Fecha y hora del fin<input class="field" id="riggo124EndAt" type="datetime-local" data-riggo-quarter-bound="1" value="${toInput(defaultAt)}"></label><p id="riggo124EndError" role="alert"></p><div class="sheet-footer"><button class="btn" id="riggo124EndCancel">Cancelar</button><button class="btn primary" id="riggo124EndSave">Confirmar fin operativo</button></div></section></div>`;
    document.getElementById('riggo124EndCancel').onclick=closeSheet;
    document.getElementById('riggo124EndSave').onclick=async e=>{const b=e.currentTarget;b.disabled=true;try{const value=document.getElementById('riggo124EndAt').value,at=value===toInput(defaultAt)?defaultAt:inputToIso(value);const r=await setEnd(m,at);closeSheet();render();toast(r.ok?'Fin operativo guardado':'Fin operativo guardado en este dispositivo · Pendiente de sincronizar')}catch(err){document.getElementById('riggo124EndError').textContent=err.message}finally{b.disabled=false}};
    document.getElementById('riggo124EndCancel').focus();
  }
  const restoring=new Map();
  async function selectedEvidence(){
    const m=typeof currentMove==='function'?currentMove():null,c=m?.exec?.closures?.[m.exec.selectedPeriodId];
    if(!m||!c||state.screen!=='execute')return;const k=key(m,c);if(restoring.has(k))return;
    const before=JSON.stringify([c.photos,c.signature]);
    const work=W.RigGOV120.restoreMediaForMove(m,c.id).then(()=>{
      if(before!==JSON.stringify([c.photos,c.signature])&&currentMove()?.id===m.id){saveLocal();const editing=document.activeElement?.matches?.('input:not([type=file]),textarea,select,[contenteditable=true]');if(m.exec.selectedPeriodId===c.id&&!editing)render()}
    }).catch(()=>status('No se pudo recuperar la evidencia. Revisa la conexión y vuelve a abrir el reporte.',true)).finally(()=>restoring.delete(k));
    restoring.set(k,work);await work;
  }
  function decorate(){
    const app=document.getElementById('app');if(!app)return;document.body.dataset.riggoTab=state.execTab||'';
    const main=document.querySelector('main');if(main){main.id='riggoMain';main.tabIndex=-1}
    for(const b of app.querySelectorAll('button:not([type])'))b.type='button';
    for(const label of app.querySelectorAll('label.btn'))if(label.querySelector('input[type=file]')){label.tabIndex=0;label.setAttribute('role','button')}
    for(const input of app.querySelectorAll('[data-part]')){const name={name:'Nombre',company:'Empresa',role:'Cargo'}[input.dataset.k]||'Dato';input.setAttribute('aria-label',`Participante ${Number(input.dataset.part)+1} · ${name}`);input.placeholder=name}
    for(const el of app.querySelectorAll('.eyebrow,.mi122-live-badge,.v52-login-stripe,.v106-summary-head>div>span'))el.remove();
    for(const nav of app.querySelectorAll('.v3-report-nav,.v3-stagebar,.side-nav')){
      const active=nav.querySelector('button.active');if(!active)continue;active.setAttribute('aria-current','step');
      if(nav.scrollWidth>nav.clientWidth)nav.scrollLeft+=active.getBoundingClientRect().left-nav.getBoundingClientRect().left-(nav.clientWidth-active.getBoundingClientRect().width)/2;
    }
    for(const b of app.querySelectorAll('.v3-exec-title>.row .btn[data-v43-short]')){const nodes=[...b.childNodes].filter(n=>n.nodeType===3);if(nodes.length){nodes[0].textContent=b.dataset.v43Short;nodes.slice(1).forEach(n=>n.textContent='')}}
    const m=typeof currentMove==='function'?currentMove():null;
    if(m&&state.screen==='execute'){
      const end=physicalEnd(m),head=app.querySelector('.v3-move-command,.v56-command'),board=app.querySelector('.v3-day-board');
      if(end){app.querySelector('#v4AddDay')?.remove();app.querySelector('#v4AddNext')?.remove();
        const host=head||board?.parentElement;if(host&&!host.querySelector('.riggo124-end'))host.insertAdjacentHTML('beforeend',`<div class="riggo124-end" role="status"><div><strong>${end.needsConfirmation?'100 % reportado · Revisar fin operativo':'Operación terminada · Cierre pendiente'}</strong><p>${end.needsConfirmation?'Nuevos días en pausa. Confirma el fin o continúa si aún falta alcance.':`Fin ${escape(fmtDate(end.at,true))} · Los reportes existentes permanecen disponibles.`}</p></div>${m.status==='active'&&hasPerm('execute')?(end.needsConfirmation?'<button class="btn primary" data-riggo124-end>Revisar fin operativo</button><button class="btn" data-riggo124-reopen>Continuar operación</button>':'<button class="btn" data-riggo124-reopen>Reabrir operación</button>'):''}</div>`);
      }else if(state.execMode!=='day'&&hasPerm('execute')&&!app.querySelector('[data-riggo124-end]')){
        (head||board?.parentElement)?.insertAdjacentHTML('beforeend','<div class="riggo124-end-actions"><button class="btn" data-riggo124-end>Registrar fin operativo</button><span>Detiene nuevos días y conserva el cierre pendiente.</span></div>');
      }
      const c=m.exec?.closures?.[m.exec.selectedPeriodId];
      if(c?.sentAt&&c.sentReportFingerprint&&c.sentReportFingerprint!==reportFingerprint(c)){
        const host=app.querySelector('.v3-report-main');if(host&&!host.querySelector('.riggo124-report-revision'))host.insertAdjacentHTML('afterbegin','<div class="riggo124-report-revision" role="status">Este reporte cambió después del envío. Revisa y reenvía la versión actual; la copia enviada se conserva.</div>');
      }
      if(state.execTab==='progress'){
        const host=app.querySelector('.v3-progress,.v56-progress,.v3-report-main')||app.querySelector('.v3-stagebar')?.parentElement;
        if(host&&!host.querySelector('.riggo124-rm-note'))host.insertAdjacentHTML('beforeend','<p class="riggo124-rm-note">RM sugerido: cargas posicionadas / total. Cargadas: preparadas para transporte. Movilizadas: en tránsito o posicionadas. El transporte distingue las tres etapas. Los ajustes reportados se conservan.</p>');
      }
    }
    selectedEvidence();
  }
  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-riggo124-end],[data-riggo124-reopen]');if(!b)return;
    const m=currentMove();if(!m)return;
    if(b.hasAttribute('data-riggo124-end'))endSheet(m);
    else if(confirm('¿Reabrir la operación? Se habilitarán nuevos días y quedará registrado en la auditoría.'))setEnd(m,null,{reopen:true}).then(r=>{render();toast(r.ok?'Operación reabierta':'Reapertura guardada en este dispositivo · Pendiente de sincronizar')}).catch(err=>toast(err.message));
  });
  document.addEventListener('keydown',e=>{const label=e.target.closest?.('label.btn');if(label?.querySelector('input[type=file]')&&['Enter',' '].includes(e.key)){e.preventDefault();label.querySelector('input[type=file]').click()}
    const sheet=document.querySelector('#sheetRoot .sheet');if(!sheet||document.getElementById('riggoQuarterOverlay'))return;if(e.key==='Escape'){e.preventDefault();closeSheet();return}if(e.key==='Tab'){const items=[...sheet.querySelectorAll('button:not(:disabled),input:not([hidden]):not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]')].filter(el=>el.getClientRects().length),first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}}
  });
  let lastSheet=null,sheetTrigger=null;
  document.addEventListener('click',e=>{if(!e.target.closest('#sheetRoot')&&e.target.closest('button,label.btn'))sheetTrigger=e.target.closest('button,label.btn')},true);
  const sheetObserver=new MutationObserver(()=>{const sheet=document.querySelector('#sheetRoot .sheet');if(sheet){sheet.setAttribute('role','dialog');sheet.setAttribute('aria-modal','true');const title=sheet.querySelector('h2');if(title){title.id=title.id||'riggo124SheetTitle';sheet.setAttribute('aria-labelledby',title.id)}if(sheet!==lastSheet&&!sheet.contains(document.activeElement))sheet.querySelector('button:not(:disabled),input:not([hidden]),[tabindex="0"]')?.focus()}else if(lastSheet){if(sheetTrigger?.isConnected)sheetTrigger.focus();else document.getElementById('riggoMain')?.focus();sheetTrigger=null}lastSheet=sheet});if(sheetRoot)sheetObserver.observe(sheetRoot,{childList:true,subtree:true});
  const baseRender=W.render;
  W.render=function(){const r=baseRender.apply(this,arguments);requestAnimationFrame(decorate);return r};
  const skip=document.createElement('a');skip.className='riggo124-skip';skip.href='#riggoMain';skip.textContent='Ir al contenido';document.body.prepend(skip);
  W.RigGO124={physicalEnd,transport,reportFingerprint,setEnd,selectedEvidence,decorate,selfCheck:()=>({ok:!!W.RigGO124Media&&!!periodBase,release:'12.4.0',evidenceDb:'riggo-media-v124',rmMetric:'positioned',transportMetric:'mobilized'})};
  for(const m of state.moves||[])for(const c of Object.values(m.exec?.closures||{}))if(c?.photos?.length||c?.signature)commit(m,c).catch(()=>{});
  decorate();
})();
