import argparse,ast,functools,http.server,json,threading
from pathlib import Path
from urllib.parse import urlsplit
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser()
parser.add_argument('--site',type=Path,default=ROOT/'site' if (ROOT/'site').is_dir() else ROOT)
parser.add_argument('--output',type=Path,default=Path('/tmp/riggo-registration'))
parser.add_argument('--chromium',default='/usr/bin/chromium')
args=parser.parse_args();OUT=args.output;OUT.mkdir(parents=True,exist_ok=True)
tree=ast.parse((ROOT/'scripts/smoke_release.py').read_text())
FIXTURE=next(ast.literal_eval(n.value) for n in tree.body if isinstance(n,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='FIXTURE' for t in n.targets))
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(args.site)))
threading.Thread(target=server.serve_forever,daemon=True).start();BASE=f'http://127.0.0.1:{server.server_port}/'
results=[];errors=[]
def check(name,fn):
 try:
  detail=fn();assert detail is not False;results.append({'name':name,'ok':True,'detail':detail})
 except Exception as e:
  results.append({'name':name,'ok':False,'error':str(e)})
  try:results[-1]['diagnostic']=page.evaluate("()=>({focus:document.activeElement.outerHTML.slice(0,500),view:RigGOUI.viewKey(),badge:document.getElementById('riggo1217SaveState')?.outerHTML,announce:document.getElementById('riggoUIStatus')?.textContent,resources:[...document.querySelectorAll('.v3-resource')].map(x=>({text:x.textContent.slice(0,800),html:x.innerHTML.slice(0,1200)})),state:{screen:state.screen,auth:state.auth,moves:state.moves.length},closure:currentMove()?ensureClosure(currentMove(),selectedPeriod(currentMove()).id):null})")
  except Exception:pass
 print(name,results[-1]['ok'],flush=True)
def expect(page,js):
 result=page.evaluate(js)
 assert result,result
 return result
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path=args.chromium,args=['--no-sandbox'])
  ctx=browser.new_context(viewport={'width':1440,'height':1000},service_workers='block')
  ctx.route('**/*',lambda r:r.continue_() if urlsplit(r.request.url).hostname=='127.0.0.1' and urlsplit(r.request.url).port==server.server_port else r.abort())
  ctx.route_web_socket('**/*',lambda ws:ws.close())
  page=ctx.new_page();page.set_default_timeout(3000);page.on('pageerror',lambda e:errors.append(str(e)))
  page.on('dialog',lambda d:d.accept())
  page.goto(BASE);page.wait_for_function('!document.documentElement.classList.contains("riggo-booting")')
  page.evaluate("Object.defineProperty(navigator,'onLine',{get:()=>false,configurable:true})")
  page.wait_for_function('window.RigGO1237');page.wait_for_timeout(500);page.evaluate(FIXTURE);page.wait_for_timeout(200);page.evaluate('RigGOV120.observe(currentMove())')
  check('Interface service installs without captured errors',lambda:expect(page,'RigGOUI.selfCheck().ok'))
  check('Load action describes its verb, name and current status',lambda:expect(page,"document.querySelector('[data-v3-load=\"L5\"]').getAttribute('aria-label')==='Registrar cargue · Load 5 · Estado actual: Pendiente'"))
  def rapid():
   page.locator('[data-v3-load="L5"]').focus();page.keyboard.press('Enter')
   page.evaluate("()=>{const b=document.querySelector('[data-v3-load=\"L5\"]');for(let i=0;i<8;i++)b.click()}")
   page.wait_for_function('!RigGO1237.isLoadBusy(currentMove().id,"L5")')
   return expect(page,"currentMove().exec.loads[5].history.length===1&&statusAt(currentMove().exec.loads[5],selectedPeriod(currentMove()).end)==='Cargada'")
  check('Rapid repeated activation records one event',rapid)
  check('Load keyboard focus survives state rerender',lambda:expect(page,"document.activeElement.dataset.v3Load==='L5'"))
  check('Local synchronization state is announced honestly',lambda:expect(page,"document.getElementById('riggoUIStatus').textContent.includes('Por sincronizar')&&document.getElementById('riggo1217SaveState').getAttribute('role')==='status'&&document.getElementById('riggo1217SaveState').textContent.includes('Por sincronizar')"))
  def undo():
   page.locator('[data-riggo-undo-load="L5"]').click();page.wait_for_function('!RigGO1237.isLoadBusy(currentMove().id,"L5")')
   return expect(page,"()=>{const m=currentMove(),x=m.exec.loads[5];return x.history.length===2&&x.history[1].corrects===x.history[0].id&&x.history[0].status==='Cargada'&&statusAt(x,selectedPeriod(m).end)==='Pendiente'&&m.audit.some(e=>e.action==='load_status_correction')}" )
  check('Correction appends an audited event without erasing original',undo)
  check('Correction returns keyboard focus to load action',lambda:expect(page,"document.activeElement.dataset.v3Load==='L5'"))
  def guard():
   page.locator('[data-v3-load="L6"]').click();page.wait_for_function('!RigGO1237.isLoadBusy(currentMove().id,"L6")')
   return expect(page,"()=>{const m=currentMove();const run=m.exec._riggoRunId;m.exec._riggoRunId='other-run';const runSafe=!RigGO1237.canUndoLoad(m.id,'L6');m.exec._riggoRunId=run;m.exec.loads[6].history.push({id:'external',status:'Cargada',at:selectedPeriod(m).end});return runSafe&&!RigGO1237.canUndoLoad(m.id,'L6')}" )
  check('Correction rejects another execution run or newer event',guard)
  def add():
   page.evaluate("document.activeElement?.blur();window.__RIGGO_RENDER_DEFERRED__=false;state.execTab='report';ensureClosure(currentMove(),selectedPeriod(currentMove()).id).reportStep=4;render()")
   page.wait_for_timeout(150);page.locator('#addParticipant').click();page.wait_for_timeout(250)
   return expect(page,"document.activeElement.matches('[data-part][data-k=name]')&&Number(document.activeElement.dataset.part)===ensureClosure(currentMove(),selectedPeriod(currentMove()).id).participants.length-1")
  check('Add participant focuses the new name field',add)
  check('Participant fields have persistent visible labels',lambda:expect(page,"[...document.querySelectorAll('[data-part]')].every(e=>e.labels.length&&e.labels[0].textContent.trim()&&e.getAttribute('aria-label'))"))
  def resource():
   page.evaluate("()=>{document.activeElement?.blur();window.__RIGGO_RENDER_DEFERRED__=false;const c=ensureClosure(currentMove(),selectedPeriod(currentMove()).id);c.reportStep=1;c.crewSame=true;c.vehiclesSame=true;c.lmcSame=true;c.hseSame=true;c.crew=[{company:'Empresa larga',role:'Cargo largo',qty:3}];render()}")
   page.wait_for_timeout(150)
   return expect(page,"()=>{const details=document.querySelector('[data-riggo-disclosure=crewSame]');return !details.open&&[...details.querySelectorAll('input,select,textarea')].every(e=>e.disabled)&&details.querySelector('summary').textContent.includes('3 personas')}" )
  check('Sin cambios summarizes resources with inputs disabled',resource)
  def editresource():
   page.locator('[data-riggo-disclosure="crewSame"] summary').click();page.locator('[data-riggo-edit-resource="crewSame"]').click();page.wait_for_timeout(200)
   return expect(page,"()=>{const c=ensureClosure(currentMove(),selectedPeriod(currentMove()).id),f=document.querySelector('[data-daily=crew][data-k=company]');return !c.crewSame&&!f.disabled&&f.closest('details').open&&document.activeElement===f}")
  check('Editing unchanged resources opens and focuses the form',editresource)
  def persistfield():
   page.locator('[data-daily=crew][data-k=role]').fill('Supervisor العربية 東京 & <control>')
   page.locator('[data-daily=crew][data-k=role]').press('Tab');page.wait_for_timeout(200)
   return expect(page,"()=>{const c=ensureClosure(currentMove(),selectedPeriod(currentMove()).id);return c.crew[0].role==='Supervisor العربية 東京 & <control>'&&!c.crewSame}")
  check('Resource editing preserves long Unicode text through original authority',persistfield)
  def validation():
   page.evaluate("()=>{document.activeElement?.blur();window.__RIGGO_RENDER_DEFERRED__=false;const c=ensureClosure(currentMove(),selectedPeriod(currentMove()).id);c.reportStep=2;c.next24='';render()}")
   page.wait_for_timeout(150);page.locator('#next24').fill('');page.locator('#v3ReportNext').click();page.wait_for_timeout(250)
   return expect(page,"()=>{const b=document.querySelector('.v61-validation-banner');return !!b&&b.getAttribute('role')==='alert'&&document.activeElement.classList.contains('v61-required-error')&&document.activeElement.getAttribute('aria-invalid')==='true'&&document.activeElement.getAttribute('aria-describedby').includes(b.id)}" )
  check('Blocked report navigation links announced errors to focused field',validation)
  def modal():
   page.evaluate("document.activeElement?.blur();window.__RIGGO_RENDER_DEFERRED__=false;state.execTab='progress';render()");page.wait_for_timeout(200);page.locator('[data-v3-progress=rd]').click();page.wait_for_timeout(150)
   assert page.evaluate("document.getElementById('app').inert&&document.querySelector('#sheetRoot .sheet').contains(document.activeElement)")
   page.locator('#v3ApplyProgress').focus();page.keyboard.press('Tab');assert page.evaluate("document.querySelector('#sheetRoot .sheet').contains(document.activeElement)")
   page.keyboard.press('Escape');page.wait_for_timeout(150)
   return expect(page,"!document.getElementById('app').inert&&!document.querySelector('#sheetRoot .sheet')&&document.activeElement.dataset.v3Progress==='rd'")
  check('Dialog traps Tab and Escape restores trigger and operable app',modal)
  def graph():
   return expect(page,"()=>{const s=document.querySelector('#chartRD');const t=[...s.querySelectorAll('text')];return Number(t.find(e=>e.textContent==='100%').getAttribute('y'))<Number(t.find(e=>e.textContent==='0%').getAttribute('y'))}")
  check('Accumulated progress graph puts 100 percent above zero',graph)
  check('No page errors',lambda:not errors)
  browser.close()
finally:
 server.shutdown();server.server_close()
 (OUT/'results.json').write_text(json.dumps({'results':results,'page_errors':errors,'server_stopped':True},ensure_ascii=False,indent=2))
 print(json.dumps([{k:v for k,v in r.items() if k!='diagnostic'} for r in results if not r['ok']],ensure_ascii=False,indent=2),flush=True)

raise SystemExit(1 if errors or any(not r['ok'] for r in results) else 0)
