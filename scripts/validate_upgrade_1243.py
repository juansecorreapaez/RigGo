"""Upgrade a served 12.4.2 copy; prove the new PWA works offline and retains local data."""
import argparse, functools, http.server, json, os, shutil, threading, time
from pathlib import Path
from playwright.sync_api import sync_playwright

parser=argparse.ArgumentParser();parser.add_argument('--previous',type=Path,default=Path('/workspace/work/RigGO-12.4.2'));parser.add_argument('--site',type=Path,default=Path(__file__).resolve().parents[1]);parser.add_argument('--work',type=Path,default=Path('/workspace/work/upgrade-1243-http'));args=parser.parse_args()
if args.work.exists():shutil.rmtree(args.work)
shutil.copytree(args.previous,args.work)
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(args.work)))
threading.Thread(target=server.serve_forever,daemon=True).start();url=f'http://127.0.0.1:{server.server_port}/'
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);ctx=b.new_context(locale='es-CO');ctx.route('https://**/*',lambda r:r.abort());page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(url);page.wait_for_function('!document.documentElement.classList.contains("riggo-booting")');page.evaluate('async()=>await navigator.serviceWorker.ready');page.wait_for_function('navigator.serviceWorker.controller!==null')
    page.evaluate("async()=>{localStorage.setItem('riggo-upgrade-sentinel','preserved');localStorage.setItem('riggo-language-v1:upgrade-user',JSON.stringify({language:'en',selected:true,pending:true,updatedAt:'2026-10-14T10:00:00Z'}));const m=newMove();m.id='upgrade-evidence';m.exec._riggoRunId='upgrade-run';await RigGO124Media.commit(m,{id:'D1',photos:[],signature:'keep-this-signature'});return true}")
    shutil.rmtree(args.work/'assets');shutil.copytree(args.site/'assets',args.work/'assets')
    for name in ['index.html','version.json','sw.js','manifest.webmanifest','_headers']:shutil.copy2(args.site/name,args.work/name)
    os.utime(args.work/'sw.js',(time.time()+2,time.time()+2))
    page.reload();page.wait_for_function('!document.documentElement.classList.contains("riggo-booting")')
    page.evaluate('async()=>{const r=await navigator.serviceWorker.getRegistration();await r.update()}')
    page.wait_for_function("async()=>{const r=await navigator.serviceWorker.getRegistration(),c=await caches.open('riggo-12.4.3-2026-10-14-1243-A1');return r?.active?.state==='activated'&&(await c.keys()).length>=38}",timeout=25000)
    ctx.set_offline(True);page.reload();page.wait_for_function('!document.documentElement.classList.contains("riggo-booting")',timeout=15000)
    assert page.title()=='RigGO · 12.4.3',page.title()
    assert page.evaluate('RigGO.runtime.selfCheck().ok&&RigGO1241.selfCheck().ok&&!!RigGOLanguage&&RigGOIdentity.isCorporateEmail("offline@sanad.com")')
    assert page.evaluate("async()=>localStorage.getItem('riggo-upgrade-sentinel')==='preserved'&&JSON.parse(localStorage.getItem('riggo-language-v1:upgrade-user')).language==='en'&&(await RigGO124Media.read('upgrade-evidence|upgrade-run|D1')).data.signature==='keep-this-signature'")
    assert not errors,errors
    result={'ok':True,'upgrade':'12.4.2 -> 12.4.3','offline_boot':True,'account_preference_retained':True,'evidence_retained':True,'page_errors':errors}
    (args.work/'upgrade-result.json').write_text(json.dumps(result,indent=2));print(json.dumps(result),flush=True);b.close()
server.shutdown()
