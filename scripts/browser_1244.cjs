const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true}),checks=[];
 for(const [name,width,height]of[['desktop',1280,900],['mobile',390,844]]){
  const context=await browser.newContext({viewport:{width,height},serviceWorkers:'block',acceptDownloads:true});const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route(/https:\/\/[^/]*supabase\.co\//,route=>route.fulfill({status:200,contentType:'application/json',body:'[]'}));
  await page.goto('http://127.0.0.1:8787/',{waitUntil:'networkidle'});
  await page.waitForFunction(()=>!!window.RigGOLifecycle1244&&!!window.RigGOV112);
  await page.evaluate(()=>{
   document.documentElement.lang='en';
   const item={key:'save:fixture',type:'save',moveId:'fixture',operationId:'fixture-op',blockedCode:'server_error',lastError:'riggo_atomic_completion_required',row:{rig:'Fixture Rig',status:'completed'}};
   window.__fixtureQueue=[item,{...item,key:'save:fixture2',moveId:'fixture2',operationId:'fixture-op-2',row:{rig:'Fixture Rig 2',status:'completed'}}];
   window.RigGOV112.listOutbox=async()=>window.__fixtureQueue;window.RigGOV120.listOutbox=async()=>[];
   const s=window.state||(typeof state!=='undefined'?state:null);if(s)s.moves=[{id:'fixture',meta:{rig:'Fixture Rig',origin:'Fixture origin '+('long location '.repeat(12)),destination:'Fixture destination'}}];
  });
  await page.evaluate(()=>window.RigGOLifecycle1244.openReview());const dialog=page.getByRole('dialog');await dialog.waitFor();
  assert.ok(await page.getByRole('heading',{name:'Changes awaiting confirmation'}).isVisible());checks.push(name+' English dialog');
  assert.equal(await page.getByRole('button',{name:'Back up and retry'}).count(),2);checks.push(name+' both pending records visible');
  const bounds=await dialog.boundingBox();assert.ok(bounds.x>=-1&&bounds.width<=width+1);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));checks.push(name+' no horizontal overflow');
  await page.screenshot({path:'work/pending-'+name+'.png',fullPage:true});
  await page.evaluate(()=>{window.RigGOV112.retryBlockedSave=async()=>{const b=await window.RigGOLifecycle1244.listBackups();if(!b.some(r=>r.operation.operationId==='fixture-op'))throw Error('backup missing before retry');window.__fixtureQueue=[];};});
  await page.getByRole('button',{name:'Back up and retry'}).first().click();await page.getByText('There are no pending operations.').waitFor();checks.push(name+' backup committed before retry');
  await page.evaluate(()=>{document.documentElement.lang='es';});await page.evaluate(()=>window.RigGOLifecycle1244.openReview());assert.ok(await page.getByRole('heading',{name:'Cambios pendientes de guardar'}).isVisible());checks.push(name+' Spanish dialog');
  await page.keyboard.press('Escape');assert.equal(await page.getByRole('dialog').count(),0);checks.push(name+' keyboard dismissal');
  assert.deepEqual(errors,[]);checks.push(name+' no page errors');await context.close();
 }
 await browser.close();const result={passed:checks.length,checks,networkIsolated:true,realEmailsSent:false,productionDataModified:false};fs.writeFileSync('work/browser-validation-1244.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
})().catch(e=>{console.error(e);process.exitCode=1;});
