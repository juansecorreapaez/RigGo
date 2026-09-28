import json, threading, http.server, socketserver, time, sys
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
PORT=8767

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self,*a,**k): super().__init__(*a,directory=str(ROOT),**k)
    def log_message(self,*a): pass
httpd=socketserver.TCPServer(('127.0.0.1',PORT),Handler)
threading.Thread(target=httpd.serve_forever,daemon=True).start()

stub=r"""
window.__server={rows:[],exec:{},saves:0,mode:'normal',lastRpc:null};
window.supabase={createClient(){
 function query(table){let filter=null,one=false;const q=new Proxy(function(){},{get(t,k){if(k==='then')return resolve=>{let data=[];if(table==='access_list')data=window.__fixtureUser?[window.__fixtureUser]:[];if(table==='moves')data=window.__server.rows;if(filter)data=data.filter(x=>String(x[filter[0]])===String(filter[1]));resolve({data:one?data[0]:data,error:null})};return (...a)=>{if(k==='eq')filter=a;if(k==='single'||k==='maybeSingle')one=true;return q}}});return q}
 return {auth:{getSession:async()=>({data:{session:null}}),getUser:async()=>({data:{user:{email:'qa@example.test'}}}),onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}})},from:query,
 rpc:async(name,args)=>{const d=window.__server;d.lastRpc={name,args:JSON.parse(JSON.stringify(args||{}))};
   if(name==='riggo_execution_read_c4')return{data:Object.values(d.exec).filter(r=>args.p_move_ids.includes(r.move_id)),error:null};
   if(/riggo_execution_save_v[23]/.test(name)){
     d.saves++;const row=d.exec[args.p_move_id];
     if(d.mode==='network')return{error:{message:'Failed to fetch'}};
     if(d.mode==='error_stale')return{data:null,error:{message:'stale_execution_run: actualiza RigGO antes de guardar esta Move reiniciada'}};
     if(d.mode==='data_stale')return{data:{ok:false,code:'stale_execution_run',message:'stale_execution_run: actualiza RigGO antes de guardar esta Move reiniciada'},error:null};
     if(row?.payload?._riggoRunId && String(args.p_payload?._riggoRunId||'')!==String(row.payload._riggoRunId))return{data:null,error:{message:'stale_execution_run: actualiza RigGO antes de guardar esta Move reiniciada'}};
     if(args.p_expected_revision!==row.revision)return{data:{ok:false,code:'revision_conflict'}};
     if(d.mode!=='discard'){row.payload=JSON.parse(JSON.stringify(args.p_payload));row.revision++;row.updated_at=new Date().toISOString()}
     return{data:{ok:true,revision:row.revision,updated_at:row.updated_at,updated_by:'qa@example.test'}};
   }
   if(name==='riggo_reset_move_to_ready_v1'){d.resetCalls=d.resetCalls||[];d.resetCalls.push(args.p_operation_id);d.resetCache=d.resetCache||{};if(d.resetCache[args.p_operation_id])return{data:d.resetCache[args.p_operation_id]};const row=d.rows.find(r=>r.id===args.p_move_id),ex=d.exec[args.p_move_id];row.status='ready';row.revision++;row.actual_release=null;ex.revision++;ex.payload={actualRelease:'',actualAcceptance:'',closures:{},periods:[],tasksRD:[],tasksRU:[],loads:[],_riggoRunId:args.p_operation_id};const result={ok:true,status:'ready',master_revision:row.revision,execution_revision:ex.revision,execution_payload:ex.payload};d.resetCache[args.p_operation_id]=result;if(d.resetLoseOnce){d.resetLoseOnce=false;return{error:{message:'Failed to fetch after commit'}}}return{data:result}}
   if(name==='riggo_activate_move_v2'){const row=d.rows.find(r=>r.id===args.p_move_id),ex=d.exec[args.p_move_id];if(!row||row.status!=='ready')return{data:{ok:false,code:'not_ready'}};if(Number(args.p_expected_revision)!==Number(row.revision))return{data:{ok:false,code:'revision_conflict',server_revision:row.revision}};row.status='active';row.revision++;row.actual_release=args.p_actual_release;ex.revision++;d.activationCounter=(d.activationCounter||0)+1;const freshRun='RUN-ACTIVATED-'+d.activationCounter;ex.payload={actualRelease:args.p_actual_release,actualAcceptance:'',closures:{},periods:[],tasksRD:[],tasksRU:[],loads:[],_riggoRunId:freshRun};const result={ok:true,status:'active',master_revision:row.revision,execution_revision:ex.revision,execution_payload:JSON.parse(JSON.stringify(ex.payload)),updated_at:new Date().toISOString(),updated_by:'qa@example.test'};return{data:result,error:null}}
   if(name==='riggo_move_save_v2')return{data:{ok:true,revision:1}};
   return{data:[],error:null}
 },storage:{from:query},channel:()=>query('channels'),removeChannel(){}}
}};
"""

results=[]
def ok(msg): results.append('PASS '+msg); print('PASS',msg)
def check(cond,msg):
    if not cond: raise AssertionError(msg)
    ok(msg)

try:
  with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
    ctx=browser.new_context(viewport={'width':1400,'height':900},timezone_id='America/Bogota',service_workers='block')
    p=ctx.new_page(); page_errors=[]; consoles=[]; p.on('pageerror',lambda e: page_errors.append(str(e))); p.on('console',lambda m: consoles.append(m.text))
    import re
    html=(ROOT/'index.html').read_text(encoding='utf-8')
    css_name=json.loads((ROOT/'version.json').read_text())['css']; css=(ROOT/'assets'/css_name).read_text(encoding='utf-8')
    html=html.replace('<head>','<head>'+"\n<script>\n(()=>{\n const clone=v=>v===undefined?undefined:JSON.parse(JSON.stringify(v));\n function storage(){const m=new Map();return{get length(){return m.size},key:i=>[...m.keys()][i]??null,getItem:k=>m.has(String(k))?m.get(String(k)):null,setItem:(k,v)=>m.set(String(k),String(v)),removeItem:k=>m.delete(String(k)),clear:()=>m.clear()}}\n try{Object.defineProperty(window,'localStorage',{value:storage(),configurable:true})}catch(_){}\n try{Object.defineProperty(window,'sessionStorage',{value:storage(),configurable:true})}catch(_){}\n const dbs=new Map();\n function makeDb(name,rec){return{\n   objectStoreNames:{contains:n=>rec.stores.has(n)},\n   createObjectStore(n,opt={}){if(!rec.stores.has(n))rec.stores.set(n,{keyPath:opt.keyPath||null,data:new Map()});return{}},\n   transaction(n,mode){const t={error:null,oncomplete:null,onerror:null};const names=Array.isArray(n)?n:[n];let pending=0,completed=false;\n     const maybe=()=>setTimeout(()=>{if(!pending&&!completed){completed=true;t.oncomplete&&t.oncomplete({target:t})}},0);\n     const req=(fn,write=false)=>{pending++;const r={result:undefined,error:null,onsuccess:null,onerror:null};setTimeout(()=>{try{r.result=fn();r.onsuccess&&r.onsuccess({target:r})}catch(e){r.error=e;t.error=e;r.onerror&&r.onerror({target:r});t.onerror&&t.onerror({target:t})}finally{pending--;if(write)maybe()}},0);return r};\n     t.objectStore=storeName=>{const st=rec.stores.get(storeName);if(!st)throw new Error('Missing store '+storeName);return{\n       get:key=>req(()=>clone(st.data.get(key))),\n       getAll:()=>req(()=>[...st.data.values()].map(clone)),\n       put:v=>req(()=>{const key=st.keyPath?v?.[st.keyPath]:v?.key;if(key===undefined)throw new Error('Missing key');st.data.set(key,clone(v));return key},true),\n       delete:key=>req(()=>{st.data.delete(key);return undefined},true)\n     }};return t},close(){}\n }}\n const fake={open(name,version){const r={result:null,error:null,onupgradeneeded:null,onsuccess:null,onerror:null};setTimeout(()=>{try{let rec=dbs.get(name),upgrade=!rec;if(!rec){rec={version:version||1,stores:new Map()};dbs.set(name,rec)}else if(version&&version>rec.version){rec.version=version;upgrade=true}r.result=makeDb(name,rec);if(upgrade&&r.onupgradeneeded)r.onupgradeneeded({target:r});setTimeout(()=>r.onsuccess&&r.onsuccess({target:r}),0)}catch(e){r.error=e;r.onerror&&r.onerror({target:r})}},0);return r}};\n try{Object.defineProperty(window,'indexedDB',{value:fake,configurable:true})}catch(_){window.indexedDB=fake}\n})();\n</script>\n",1)
    html=re.sub(r'<link rel="stylesheet" href="\./assets/riggo-app\.[0-9a-f]+\.css">',lambda m:'<style>'+css+'</style>',html)
    def inline_script(m):
      src=m.group(1)
      if 'supabase-js' in src:return '<script>'+stub+'</script>'
      if src.startswith('./'):
        fp=ROOT/src[2:]
        if fp.exists():return '<script>'+fp.read_text(encoding='utf-8')+'</script>'
      return '<script></script>'
    html=re.sub(r'<script[^>]*src="([^"]+)"[^>]*></script>',inline_script,html)
    p.set_content(html,wait_until='domcontentloaded')
    try:
      p.wait_for_function("() => !!window.RigGO1237 && !!window.RigGOV120",timeout=5000)
    except Exception:
      print('PAGE_ERRORS',page_errors); print('CONSOLE',consoles[-30:]); print('VARS',p.evaluate("()=>({sb:!!window.supabase,rg:!!window.RigGO,rg120:!!window.RigGOV120,rg1237:!!window.RigGO1237,boot:document.documentElement.className})")); raise
    check(p.evaluate("RigGO.runtime.selfCheck().ok===true && RigGO1237.selfCheck().ok===true"),'12.3.7 application boot + field patch')
    check(p.evaluate("RigGOV120.selfCheck().runIdentityPolicy==='server-wins-no-merge'"),'C4 reports server-wins/no-cross-run policy')

    p.evaluate("""() => {
      state=freshState();const email='qa@example.test';state.auth={email,logged:true};state.users=[{email,name:'QA',active:true,permissions:['admin','plan','execute','overall']}];window.__fixtureUser={email,active:true,can_admin:true,can_plan:true,can_execute:true,can_overall:true};
      const m=newMove(email);m.id='11111111-1111-4111-8111-111111111111';m.status='active';m.meta.origin='Origen QA';m.meta.destination='Destino QA';m.meta.operator='Operador QA';m.meta.plannedDays=3;
      m.plan.loaded=true;m.plan.maxDay=3;m.plan.tasksRD=[{id:'rd',day:1,text:'Desarme',weight:100}];m.plan.tasksRU=[{id:'ru',day:3,text:'Arme',weight:100}];m.plan.loadGroups=[{description:'Carga QA',quantity:1,day:1,scope:'Rig'}];
      m.exec.actualRelease=new Date(Date.now()-30*3600000).toISOString();m.exec._riggoRunId='RUN-CURRENT';m.exec.tasksRD=structuredClone(m.plan.tasksRD);m.exec.tasksRU=structuredClone(m.plan.tasksRU);m.exec.loads=[{id:'load1',description:'Carga QA',scope:'Rig',plannedDay:1,loadedAt:null,transitAt:null,positionedAt:null,history:[]}];m.syncMeta={revision:1,serverStatus:'active'};
      state.moves=[m];state.selectedMoveId=m.id;const ps=movePeriods(m);const pp=ps.at(-1);const prior=ensureClosure(m,ps[0].id);prior.crew=[{role:'Prev QA',qty:3,company:'QA'}];const c=ensureClosure(m,pp.id);c.originOps='Avance origen';c.destinationOps='Avance destino';c.next24='Continuar move';c.siteSupervisor='QA';c.siteSupervisorRole='Rig Manager';c.signature='data:image/png;base64,';c.reportStep=0;
      m.exec.selectedPeriodId=pp.id;state.execMode='day';state.execTab='report';state.screen='execute';
      m.execSyncMeta={revision:1,lastServerPayload:RigGOV120.sanitizeExec(m),c4Resolved:true};RigGOV120.observe(m);window.__server.exec[m.id]={move_id:m.id,revision:1,payload:RigGOV120.sanitizeExec(m),updated_at:new Date().toISOString(),updated_by:email,c4_resolved:true};window.__server.rows=[{...RigGOV112.moveToRow(m),revision:1,status:'active'}];window.__mid=m.id;window.__pid=pp.id;render();
    }""")
    p.wait_for_selector('[data-flat="road"]')

    # 10 flat categories and C4 server readback.
    fields={'community':('flatSubtype','Bloqueo comunitario'),'mobility':('flatSubtype','Restricción nocturna'),'road':('flatSubtype','Vía inundada'),'move_company':('flatIssue','Camión varado'),'preventive':('flatResource','CAT'),'rig_repair':('flatSubtype','Acceptance'),'weather':('flatSubtype','Lluvia'),'operator':('flatCompany','Operador QA'),'hse':('flatSubtype','Permiso suspendido'),'other':('flatSubtype','Otro evento QA')}
    for typ,(field,val) in fields.items():
      p.click(f'[data-flat="{typ}"]');p.wait_for_selector('#saveFlat')
      p.evaluate("""([field,val])=>{const x=document.getElementById(field);if(x){x.value=(x.tagName==='SELECT'&&!Array.from(x.options).some(o=>o.value===val))?x.options[0].value:val}const z=RigGO1217.liveCtx();document.getElementById('flatStart').value=toInput(z.p.start);document.getElementById('flatEnd').value=toInput(new Date(new Date(z.p.start).getTime()+15*60000).toISOString())}""",[field,val])
      p.click('#saveFlat');p.wait_for_selector('#saveFlat',state='detached')
      check(p.evaluate("t=>!!__server.exec[__mid].payload.closures[__pid].flatEvents.find(e=>e.type===t)",typ),f'Flat Time {typ} saves + C4 ACK')

    # Daily single-click through visible Next steps.
    for step in range(5):
      p.evaluate("s=>{const z=RigGO1217.liveCtx();z.c.reportStep=s;z.c.next24='Continuar';z.c.originOps='Avance';z.c.siteSupervisor='QA';z.c.signature='qa';document.activeElement?.blur();render()}",step);p.wait_for_timeout(130)
      if p.locator('#next24').count(): p.fill('#next24','Texto final antes del clic')
      p.click('#v3ReportNext');p.wait_for_timeout(180)
      check(p.evaluate("()=>RigGO1217.liveCtx().c.reportStep")==step+1,f'Daily Siguiente first-click step {step}->{step+1}')

    # Sin cambios preserves scroll.
    p.evaluate("()=>{document.activeElement?.blur();RigGO1217.liveCtx().c.reportStep=1;render()}");p.wait_for_timeout(130)
    for key in ['crewSame','vehiclesSame','lmcSame','hseSame']:
      loc=p.locator(f'[data-v3-carry="{key}"]');check(loc.count()>0,f'{key} control exists');loc.scroll_into_view_if_needed();before=p.evaluate('window.scrollY');loc.click();p.wait_for_timeout(80);after=p.evaluate('window.scrollY');check(before==after,f'{key} keeps scroll position')

    # Load direct cycle.
    p.evaluate("()=>{window.confirm=()=>true;document.activeElement?.blur();state.execTab='transport';render()}");p.wait_for_timeout(120)
    for wanted in ['Cargada','Posicionada','Pendiente']:
      p.evaluate("async()=>{const {m,p}=RigGO1217.liveCtx();await advanceLoad(m,p,'load1')}");p.wait_for_timeout(100)
      check(p.evaluate("()=>{const {m,p}=RigGO1217.liveCtx();return statusAt(m.exec.loads[0],p.end)}")==wanted,f'load click cycle -> {wanted}')
      check(p.locator('#riggo1217Loaded').count()==0,'load click does not open selector')

    # Manual early close before cutoff remains explicit and keeps scheduled cutoff semantics.
    early=p.evaluate("""async()=>{const z=RigGO1217.liveCtx(),{m,c}=z;const p={...z.p,start:new Date(Date.now()-60*60000).toISOString(),end:new Date(Date.now()+6*3600000).toISOString(),cutoffTime:'23:45'};c.originOps='Avance';c.destinationOps='Avance';c.next24='Continuar';c.siteSupervisor='QA';c.siteSupervisorRole='Rig Manager';c.signature='qa';c.f0065ReviewedAt=new Date().toISOString();c.flatEvents=[];const oldOnline=navigator.onLine;try{Object.defineProperty(navigator,'onLine',{value:false,configurable:true});const end=p.end;const r=await RigGO.actions.closeDay(m,p,c,{minMs:0});return{ok:r.ok,early:r.early,flag:c.closedBeforeCutoff===true,endSame:p.end===end,scheduled:c.scheduledCutoffAt===end}}finally{Object.defineProperty(navigator,'onLine',{value:oldOnline,configurable:true})}}""")
    check(early['ok'] and early['early'] and early['flag'] and early['endSame'] and early['scheduled'],'manual Day close before cutoff retained; scheduled cutoff preserved')

    # 12.3.4-like direct v2 save with CURRENT token must succeed in compatibility simulation.
    sim=p.evaluate("""async()=>{const row=__server.exec[__mid];const payload=structuredClone(row.payload);payload.compatV2='ok';const r=await RigGOSupabase.rpc('riggo_execution_save_v2',{p_move_id:__mid,p_payload:payload,p_expected_revision:row.revision,p_operation_id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'});return {r,last:__server.lastRpc,row:__server.exec[__mid]}}""")
    check(sim['r']['data']['ok'] is True and sim['last']['name']=='riggo_execution_save_v2' and sim['row']['payload'].get('compatV2')=='ok','12.3.4-like v2 + CURRENT _riggoRunId saves')

    # Missing/old tokens rejected in compatibility simulation and server state unchanged.
    stale=p.evaluate("""async()=>{const row=__server.exec[__mid],before=JSON.stringify(row.payload);const missing=structuredClone(row.payload);delete missing._riggoRunId;const a=await RigGOSupabase.rpc('riggo_execution_save_v2',{p_move_id:__mid,p_payload:missing,p_expected_revision:row.revision,p_operation_id:'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'});const old={...structuredClone(row.payload),_riggoRunId:'OLD-RUN',closures:{OLD:{next24:'revive'}}};const b=await RigGOSupabase.rpc('riggo_execution_save_v2',{p_move_id:__mid,p_payload:old,p_expected_revision:row.revision,p_operation_id:'cccccccc-cccc-4ccc-8ccc-cccccccccccc'});return{a,b,unchanged:before===JSON.stringify(row.payload)}}""")
    check('stale_execution_run' in stale['a']['error']['message'] and 'stale_execution_run' in stale['b']['error']['message'] and stale['unchanged'],'missing/old run tokens rejected; server execution unchanged')

    # Critical new hole: local already current, but pending outbox is old. Hydrate must discard outbox, no merge.
    q=p.evaluate("""async()=>{const m=state.moves.find(x=>x.id===__mid);const current=structuredClone(__server.exec[__mid].payload);m.exec=structuredClone(current);m.execSyncMeta={revision:__server.exec[__mid].revision,lastServerPayload:structuredClone(current),c4Resolved:true};RigGOV120.observe(m);m.exec={...structuredClone(current),_riggoRunId:'OLD-RUN',closures:{OLD:{next24:'stale',photos:['old image']}},flatEvents:[{id:'bad'}]};await RigGOV120.queue(m,{force:true});m.exec=structuredClone(current);m.execSyncMeta.lastServerPayload=structuredClone(current);RigGOV120.observe(m);await RigGOV120.hydrateExecution({renderNow:false});return{pending:await RigGOV120.pendingCount(),run:m.exec._riggoRunId,closures:m.exec.closures||{},compat:m.exec.compatV2}}""")
    check(q['pending']==0 and q['run']=='RUN-CURRENT' and 'OLD' not in q['closures'],'pending old-run outbox discarded even when local already matches server')

    # response.error stale path self-heals by reading server and adopting without merge.
    er=p.evaluate("""async()=>{const m=state.moves.find(x=>x.id===__mid);const current=structuredClone(__server.exec[__mid].payload);m.exec={...structuredClone(current),_riggoRunId:'OLD-ERROR',closures:{OLDERR:{next24:'stale'}}};m.execSyncMeta={revision:__server.exec[__mid].revision,lastServerPayload:structuredClone(m.exec),c4Resolved:true};RigGOV120.observe(m);await RigGOV120.queue(m,{force:true});__server.mode='error_stale';const out=await RigGOV120.flush();__server.mode='normal';return{out,pending:await RigGOV120.pendingCount(),run:m.exec._riggoRunId,closures:m.exec.closures||{}}}""")
    check(er['pending']==0 and er['run']=='RUN-CURRENT' and 'OLDERR' not in er['closures'],'C4 handles stale_execution_run in response.error')

    # data.code stale path.
    dr=p.evaluate("""async()=>{const m=state.moves.find(x=>x.id===__mid);const current=structuredClone(__server.exec[__mid].payload);m.exec={...structuredClone(current),_riggoRunId:'OLD-DATA',closures:{OLDDATA:{next24:'stale'}}};m.execSyncMeta={revision:__server.exec[__mid].revision,lastServerPayload:structuredClone(m.exec),c4Resolved:true};RigGOV120.observe(m);await RigGOV120.queue(m,{force:true});__server.mode='data_stale';const out=await RigGOV120.flush();__server.mode='normal';return{out,pending:await RigGOV120.pendingCount(),run:m.exec._riggoRunId,closures:m.exec.closures||{}}}""")
    check(dr['pending']==0 and dr['run']=='RUN-CURRENT' and 'OLDDATA' not in dr['closures'],'C4 handles stale_execution_run in data.code')

    # Reset UI regression and retry operation id.
    p.evaluate("()=>{const m=state.moves.find(x=>x.id===__mid);m.status='active';m.syncMeta.serverStatus='active';__server.rows[0].status='active';state.screen='admin';state.adminMoveView='moves';state.adminMoveStatus='active';render()}");p.wait_for_timeout(180)
    p.wait_for_selector('[data-riggo-reset]');check(p.locator('[data-riggo-reset]').count()>0,'Reset action remains next to Edit')
    p.click('[data-riggo-reset]');p.fill('#riggo1235ResetConfirm','REINICIAR');p.evaluate('__server.resetLoseOnce=true');p.click('#riggo1235ResetDo');p.wait_for_function("()=>document.getElementById('riggo1235ResetStatus')?.textContent.includes('Failed to fetch')");p.click('#riggo1235ResetDo');p.wait_for_selector('#riggo1235ResetDo',state='detached')
    check(p.evaluate("()=>state.moves.find(x=>x.id===__mid).status")== 'ready','Reset ACTIVE -> READY still works')
    check(p.evaluate("()=>new Set(__server.resetCalls).size")==1,'Reset retry reuses operation_id')

    # Reset -> Reactivate two-client logical simulation. Device B retains the pre-reset run.
    two=p.evaluate("""async()=>{const m=state.moves.find(x=>x.id===__mid);const preResetRun='RUN-CURRENT';const resetRun=__server.exec[__mid].payload._riggoRunId;const act=await RigGOSupabase.rpc('riggo_activate_move_v2',{p_move_id:__mid,p_actual_release:new Date().toISOString(),p_expected_revision:__server.rows[0].revision,p_operation_id:'dddddddd-dddd-4ddd-8ddd-dddddddddddd'});RigGOV120.setActivated(m,act.data,act.data.execution_payload.actualRelease);const activatedRun=__server.exec[__mid].payload._riggoRunId;const stalePayload={...structuredClone(__server.exec[__mid].payload),_riggoRunId:preResetRun,closures:{DEVICE_B_OLD:{next24:'must-not-return'}}};const direct=await RigGOSupabase.rpc('riggo_execution_save_v2',{p_move_id:__mid,p_payload:stalePayload,p_expected_revision:__server.exec[__mid].revision,p_operation_id:'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'});m.exec=stalePayload;m.execSyncMeta={revision:__server.exec[__mid].revision,lastServerPayload:structuredClone(stalePayload),c4Resolved:true};RigGOV120.observe(m);await RigGOV120.queue(m,{force:true});await RigGOV120.hydrateExecution({renderNow:false});return{act:act.data?.ok,resetRun,activatedRun,directError:direct.error?.message||'',pending:await RigGOV120.pendingCount(),localRun:m.exec._riggoRunId,closures:m.exec.closures||{},serverRun:__server.exec[__mid].payload._riggoRunId}}""")
    check(two['act'] and two['activatedRun']!=two['resetRun'] and two['activatedRun']!='RUN-CURRENT','Reset -> Reactivate rotates execution run token in two-client simulation')
    check('stale_execution_run' in two['directError'] and two['pending']==0 and two['localRun']==two['serverRun'] and 'DEVICE_B_OLD' not in two['closures'],'old device cannot revive pre-reset run; client adopts reactivated server run without merge')

    # Static/runtime preservation checks requested from 12.3.6.
    check(p.evaluate("()=>RigGOTimeQuarter.selfCheck().cutoffDateSelectable && RigGOTimeQuarter.selfCheck().closedDayCutoffCorrection"),'explicit cutoff date+time controls retained')
    check(p.evaluate("()=>!!window.RigGO122A && RigGO122A.selfCheck().features.moveIntelligence && !!window.RigGO1216B && RigGO1216B.selfCheck().cumulativeOps"),'Move Intelligence + Performance bundles present')
    check('Nueva contraseña' in p.content(),'password recovery Nueva contraseña UI retained')

    # Mobile smoke.
    p.set_viewport_size({'width':390,'height':844});p.evaluate("()=>{state.screen='moveSelect';render()}");p.wait_for_timeout(120)
    check(p.evaluate('document.documentElement.scrollWidth<=window.innerWidth+1'),'390px mobile no global horizontal overflow')
    check(page_errors==[],f'no uncaught browser errors ({page_errors})')
    browser.close()
finally:
  httpd.shutdown();httpd.server_close()

Path(__file__).with_name('browser-1237-results.txt').write_text('\n'.join(results)+'\n',encoding='utf-8')
