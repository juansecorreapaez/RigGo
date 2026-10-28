"""Verify 12.4.3 -> 12.4.4 offline upgrade without losing pending work."""
import argparse,functools,http.server,json,os,shutil,threading,time
from pathlib import Path
from playwright.sync_api import sync_playwright

parser=argparse.ArgumentParser()
parser.add_argument('--previous',type=Path,required=True)
parser.add_argument('--browser',type=Path,required=True)
args=parser.parse_args()
root=Path(__file__).resolve().parents[1]
work=root/'work/upgrade-1244'
if work.exists():shutil.rmtree(work)
shutil.copytree(args.previous,work)
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(work)))
threading.Thread(target=server.serve_forever,daemon=True).start()
url=f'http://127.0.0.1:{server.server_port}/'
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path=str(args.browser),args=['--no-sandbox'])
    context=browser.new_context(locale='es-CO');context.route('https://**/*',lambda route:route.abort())
    page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(url);page.wait_for_function('!document.documentElement.classList.contains("riggo-booting")')
    page.evaluate('async()=>await navigator.serviceWorker.ready')
    page.wait_for_function('navigator.serviceWorker.controller!==null')
    page.evaluate("""async()=>{
      localStorage.setItem('riggo-upgrade-sentinel','preserved');
      localStorage.setItem('riggo-language-v1:upgrade-user',JSON.stringify({language:'en',selected:true,pending:true,updatedAt:'2026-10-28T10:00:00Z'}));
      const m=newMove();m.id='upgrade-evidence';m.exec._riggoRunId='upgrade-run';
      await RigGO124Media.commit(m,{id:'D1',photos:[],signature:'keep-this-signature'});
      const move=newMove();move.id='22222222-2222-4222-8222-222222222222';move.status='active';move.plan.loaded=true;move.exec.actualRelease='2026-10-01T00:00:00Z';
      await RigGOV112.queueSave(move,{force:true,expectedRevision:2,baseRow:RigGOV112.moveToRow(move)});
      return true;
    }""")
    pending_before=page.evaluate('async()=>await RigGOV112.listOutbox()')
    shutil.rmtree(work/'assets');shutil.copytree(root/'site/assets',work/'assets')
    for name in ['index.html','version.json','sw.js','manifest.webmanifest','_headers']:shutil.copy2(root/'site'/name,work/name)
    os.utime(work/'sw.js',(time.time()+2,time.time()+2))
    page.reload();page.wait_for_function('!document.documentElement.classList.contains("riggo-booting")')
    page.evaluate('async()=>{const r=await navigator.serviceWorker.getRegistration();await r.update()}')
    page.wait_for_function("async()=>{const r=await navigator.serviceWorker.getRegistration(),c=await caches.open('riggo-12.4.4-2026-10-28-1244-A1');return r?.active?.state==='activated'&&(await c.keys()).some(k=>k.url.includes('riggo-lifecycle.'))}",timeout=30000)
    context.set_offline(True);page.reload();page.wait_for_function('!document.documentElement.classList.contains("riggo-booting")',timeout=15000)
    assert page.title()=='RigGO · 12.4.4',page.title()
    assert page.evaluate('!!RigGOLifecycle1244&&RigGO.runtime.selfCheck().ok&&RigGOIdentity.isCorporateEmail("offline@sanad.com")')
    assert page.evaluate("async()=>localStorage.getItem('riggo-upgrade-sentinel')==='preserved'&&JSON.parse(localStorage.getItem('riggo-language-v1:upgrade-user')).language==='en'&&(await RigGO124Media.read('upgrade-evidence|upgrade-run|D1')).data.signature==='keep-this-signature'")
    assert page.evaluate('async()=>await RigGOV112.listOutbox()')==pending_before
    assert not errors,errors
    result={'ok':True,'upgrade':'12.4.3 -> 12.4.4','offline_boot':True,'pending_operations_retained':True,'account_preference_retained':True,'evidence_retained':True,'page_errors':errors}
    (root/'work/upgrade-validation-1244.json').write_text(json.dumps(result,indent=2))
    print(json.dumps(result),flush=True);browser.close()
server.shutdown()
