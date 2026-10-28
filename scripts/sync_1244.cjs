const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true}),checks=[];let shared=null;
 for(const actor of ['fixture-one@nabors.com','fixture-two@nabors.com']){
  const context=await browser.newContext({serviceWorkers:'block'}),page=await context.newPage();
  await page.route(/https:\/\/[^/]*supabase\.co\//,route=>route.fulfill({status:200,contentType:'application/json',body:'[]'}));
  await page.goto('http://127.0.0.1:8787/',{waitUntil:'networkidle'});
  await page.waitForFunction(()=>window.RigGOV112&&window.RigGOV120&&!document.documentElement.classList.contains('riggo-booting'));
  const result=await page.evaluate(async({actor,shared})=>{
    const C=window.RigGOV112,SB=window.RigGOSupabase;
    const s=window.state||(typeof state!=='undefined'?state:null);
    s.auth={logged:true,email:actor};s.users=[{email:actor,name:'Fixture user',active:true,permissions:['plan','execute','overall','admin']}];s.screen='home';
    const original=newMove(actor);original.id='11111111-1111-4111-8111-111111111111';original.status='active';original.plan.loaded=true;
    original.meta.rig='Fixture Rig';original.meta.origin='Fixture A';original.meta.destination='Fixture B';original.meta.operator='Original operator';original.meta.supportCompany='Original support';original.exec.actualRelease='2026-10-01T00:00:00.000Z';original.exec.actualAcceptance='';
    const base=C.moveToRow(original);
    const completed=structuredClone(original);completed.status='closed';completed.meta.supportCompany='Remote support edit';completed.exec.actualAcceptance='2026-10-02T00:00:00.000Z';completed.exec.moveClosedAt='2026-10-02T00:01:00.000Z';
    let raw=shared||{...C.moveToRow(completed),revision:12,created_at:'2026-10-01T00:00:00Z',updated_at:'2026-10-02T00:01:00Z',updated_by:actor,deleted_at:null};
    let saves=[];
    SB.from=table=>{let single=false;const q={select(){return q;},order(){return q;},eq(){return q;},in(){return q;},maybeSingle(){single=true;return Promise.resolve({data:table==='moves'?raw:null,error:null});},then(resolve,reject){const data=table==='access_list'?[{email:actor,display_name:'Fixture user',active:true,can_plan:true,can_execute:true,can_overall:true,can_admin:true}]:table==='moves'?[raw]:[];return Promise.resolve({data:single?data[0]:data,error:null}).then(resolve,reject);}};return q;};
    SB.rpc=async(name,args)=>{
      if(name==='riggo_move_save_v2'){
        saves.push(args);if(args.p_expected_revision!==raw.revision)return{data:{ok:false,code:'revision_conflict',server_revision:raw.revision},error:null};
        raw={...raw,...args.p_move,revision:raw.revision+1};return{data:{ok:true,move_id:raw.id,revision:raw.revision,updated_at:'2026-10-02T00:02:00Z',updated_by:actor},error:null};
      }
      return{data:[],error:null};
    };
    window.RigGOV120.hydrateExecution=async()=>({ok:true,changed:false});window.RigGOV120.retryStatus=async()=>({total:0,due:0,blocked:0});window.RigGOV120.pendingCount=async()=>0;
    if(!shared){
      const local=structuredClone(completed);local.meta.supportCompany='Original support';local.meta.operator='Local operator edit';local.syncMeta={revision:2,serverStatus:'active',lastServerRow:base};s.moves=[local];
      await C.queueSave(local,{force:true,expectedRevision:2,baseRow:base});const item=(await C.listOutbox())[0];item.blockedCode='server_error';item.lastError='riggo_atomic_completion_required';
      await new Promise((resolve,reject)=>{const req=indexedDB.open('riggo-field-v112');req.onerror=()=>reject(req.error);req.onsuccess=()=>{const db=req.result,tx=db.transaction('outbox','readwrite');tx.objectStore('outbox').put(item);tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>reject(tx.error);};});
    }else s.moves=[];
    const hydration=await C.hydrate();const move=s.moves.find(m=>m.id===raw.id);
    return{ok:hydration.ok,status:move?.status,serverStatus:move?.syncMeta?.serverStatus,operator:move?.meta?.operator,support:move?.meta?.supportCompany,pending:(await C.listOutbox()).length,backups:(await window.RigGOLifecycle1244.listBackups()).length,saves:saves.map(x=>({revision:x.p_expected_revision,status:x.p_move.status})),server:raw,error:hydration.error?.message};
  },{actor,shared});
  assert.equal(result.ok,true,JSON.stringify(result));assert.equal(result.status,'closed',JSON.stringify(result));assert.equal(result.serverStatus,'closed');checks.push(actor+' sees the authoritative completion');
  assert.equal(result.operator,'Local operator edit');assert.equal(result.support,'Remote support edit');checks.push(actor+' sees both local and disjoint remote edits');
  assert.equal(result.pending,0);checks.push(actor+' has no obsolete closure operation');
  if(!shared){assert.ok(result.backups>=1);assert.ok(result.saves.length>=1);assert.equal(result.saves[0].revision,12);assert.equal(result.saves[0].status,'completed');checks.push('Backed-up legacy close uses the current validated revision');}
  shared=result.server;await context.close();
 }
 await browser.close();const result={passed:checks.length,checks,networkIsolated:true,realEmailsSent:false,productionDataModified:false};fs.writeFileSync('work/sync-validation-1244.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
})().catch(error=>{console.error(error);process.exitCode=1;});
