"""Real release/browser/IndexedDB; account API is simulated. No production writes."""
import argparse, ast, functools, http.server, json, threading
from pathlib import Path
from playwright.sync_api import sync_playwright

parser=argparse.ArgumentParser();parser.add_argument('--site',type=Path,default=Path(__file__).resolve().parents[1]);parser.add_argument('--output',type=Path,default=Path('/workspace/work/verification-1242'));parser.add_argument('--screenshots',action='store_true');args=parser.parse_args()
args.output.mkdir(parents=True,exist_ok=True)
fixture=next(ast.literal_eval(n.value) for n in ast.parse((args.site/'scripts/smoke_release.py').read_text()).body if isinstance(n,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='FIXTURE' for t in n.targets))
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(args.site)))
threading.Thread(target=server.serve_forever,daemon=True).start();url=f'http://127.0.0.1:{server.server_port}/'
SETUP=r'''({id,email,metadata={}})=>{
 window.__account={id,email,user_metadata:{display_name:'Keep this name',...metadata}};
 window.__accounts=window.__accounts||{};__accounts[id]=__account;
 window.__updates=[];window.__saveFail=false;window.__saveDelay=0;
 RigGOSupabase.auth.getSession=async()=>({data:{session:{user:structuredClone(__account),access_token:'fixture-'+__account.id}},error:null});
 RigGOSupabase.auth.getUser=async()=>({data:{user:structuredClone(__account)},error:null});
 RigGOSupabase.auth.updateUser=async()=>{throw new Error('Preference must use a token-bound request')};
 if(!window.__originalFetch)window.__originalFetch=window.fetch.bind(window);
 window.fetch=async (url,options={})=>{
   if(String(url)===String(RigGOSupabase.supabaseUrl).replace(/\/$/,'')+'/auth/v1/user'&&options.method==='PUT'){
     const owner=String(options.headers.Authorization||'').replace('Bearer fixture-',''),target=__accounts[owner],request=JSON.parse(options.body);
     __updates.push({id:owner,...request});
     if(__saveDelay)await new Promise(r=>setTimeout(r,__saveDelay));
     if(__saveFail||!target)return new Response(JSON.stringify({message:'Connection unavailable'}),{status:503});
     target.user_metadata={...target.user_metadata,...request.data};
     return new Response(JSON.stringify(target),{status:200,headers:{'Content-Type':'application/json'}});
   }
   return __originalFetch(url,options);
 };
}'''
results=[];errors=[]
def check(name,condition):
    assert condition,name
    results.append(name);print('PASS:',name,flush=True)
def boot(page):
    page.on('pageerror',lambda e:errors.append(str(e)));page.goto(url)
    page.wait_for_function('!document.documentElement.classList.contains("riggo-booting")')
def account(page,id='user-a',email='anna@nabors.com',metadata=None):
    page.evaluate(SETUP,{'id':id,'email':email,'metadata':metadata or {}})
    page.evaluate(fixture.replace('tester@example.invalid',email))
    page.evaluate('RigGOLanguage.refresh()')
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    ctx=browser.new_context(locale='es-CO',viewport={'width':1440,'height':1000});ctx.route('https://**/*',lambda r:r.abort());page=ctx.new_page();boot(page)
    account(page);page.locator('#riggo-language-dialog').wait_for(state='visible')
    if args.screenshots:page.screenshot(path=str(args.output/'1242-first-language-desktop.png'))
    page.locator('#riggo-language-dialog [value="en"]').check();page.locator('#riggoLanguageContinue').click()
    page.wait_for_function('__updates.length===1&&!RigGOLanguage.preference.pending')
    check('First authorized login asks once and saves English in account metadata',page.evaluate("__account.user_metadata.riggo_language==='en'&&__account.user_metadata.riggo_language_selected===true&&__account.user_metadata.display_name==='Keep this name'&&document.documentElement.lang==='en'"))
    check('Top language control remains available after selection',page.locator('#riggoLanguage').input_value()=='en' and page.locator('#riggoLanguage').is_visible())
    check('Transport explains cumulative loads and awaiting departure in English','loaded cumulative' in page.locator('.riggo1241-transport-summary').first.inner_text() and 'awaiting departure' in page.locator('.riggo1241-transport-summary').first.inner_text())
    # Auth state refreshed during use must not reopen onboarding.
    page.evaluate('RigGOLanguage.acceptUser(structuredClone(__account));render()');page.wait_for_timeout(80)
    check('Returning auth events do not ask for language again',page.locator('#riggo-language-dialog').count()==0)
    metadata=page.evaluate('__account.user_metadata');page.reload();page.wait_for_function('!document.documentElement.classList.contains("riggo-booting")');account(page,metadata=metadata)
    page.wait_for_function('document.documentElement.lang==="en"')
    check('Reload restores the same user preference without another question',page.locator('#riggo-language-dialog').count()==0)
    # Protect data that coincides with a translatable UI label.
    page.evaluate("currentMove().status='draft';currentMove().meta.origin='Pendiente';currentMove().meta.destination='Origen';currentMove().exec.loads[0].description='Cargada';state.screen='plan';state.planStep=1;render()")
    assert page.locator('#pOrigin').count(), 'Plan fields unavailable'
    page.locator('#pOrigin').fill('Pendiente con acentos á é ñ');page.locator('#pDestination').fill('Origen escrito por usuario')
    page.locator('#riggoLanguage').select_option('es');page.wait_for_function('document.documentElement.lang==="es"')
    check('Language switch preserves unsaved plan fields and user text',page.locator('#pOrigin').input_value()=='Pendiente con acentos á é ñ' and page.locator('#pDestination').input_value()=='Origen escrito por usuario')
    page.locator('#riggoLanguage').select_option('en');page.wait_for_function('document.documentElement.lang==="en"')
    check('English option labels retain canonical stored values',page.evaluate("()=>{const result=RigGOI18n.h`<select><option>Posicionada</option><option>${RigGOI18n.display('En tránsito')}</option></select>`;const host=document.createElement('div');host.innerHTML=result;return host.querySelector('option').value==='Posicionada'&&host.querySelector('option').textContent==='Positioned'&&host.querySelectorAll('option')[1].value==='En tránsito'&&host.querySelectorAll('option')[1].textContent==='In transit'}"))
    page.evaluate("async()=>{currentMove().status='active';state.screen='execute';state.execMode='day';state.execTab='transport';document.activeElement.blur();render();const m=currentMove(),c=ensureClosure(m,selectedPeriod(m).id);await RigGO124Media.commit(m,c);window.__beforeExec=JSON.stringify(RigGOV120.sanitizeExec(m))}")
    page.locator('#riggoLanguage').select_option('es');page.locator('#riggoLanguage').select_option('en')
    same=page.evaluate('JSON.stringify(RigGOV120.sanitizeExec(currentMove()))===__beforeExec')
    if not same:
        print('Execution difference:',page.evaluate("()=>{const a=JSON.parse(__beforeExec),b=RigGOV120.sanitizeExec(currentMove()),changes=[];function diff(a,b,p=''){if(JSON.stringify(a)===JSON.stringify(b))return;if(a&&b&&typeof a==='object'&&typeof b==='object'){for(const k of new Set([...Object.keys(a),...Object.keys(b)]))diff(a[k],b[k],p+'.'+k)}else changes.push({path:p,before:a,after:b})}diff(a,b);return changes}"),flush=True)
    check('Changing display language leaves execution state and load history unchanged',same)
    check('User-authored load descriptions are not translated',page.get_by_text('Cargada',exact=True).count()>0)
    page.evaluate("currentMove().meta.projectedRelease='2026-10-06T17:00:00Z';state.execTab='progress';render()")
    note=page.locator('#riggo1241PlanNote').inner_text()
    check('M48 distinguishes 3 actual hours, 12 planned hours and 9-hour release delay','actual release: 3 h' in note and 'Plan at cutoff: 12 h' in note and 'Release delay: 9 h' in note)
    check('Progress navigation and status are translated while names remain verbatim',page.evaluate("!document.querySelector('.v3-stagebar').textContent.includes('Actividades')&&!document.querySelector('.v3-exec-title .status').textContent.includes('Pendiente')&&!document.querySelector('.progress-card').textContent.includes('Atrasado')&&document.querySelector('.v3-exec-title p').textContent.includes('Pendiente con acentos á é ñ')"))
    if args.screenshots:page.screenshot(path=str(args.output/'1242-progress-desktop-en.png'),full_page=True)
    # Translate the visible confirmation token together with its validation;
    # opening/canceling this sheet never invokes the destructive reset RPC.
    page.evaluate('RigGO1237.openResetSheet(currentMove())')
    page.locator('#riggo1235ResetConfirm').fill('REINICIAR')
    wrong_disabled=page.locator('#riggo1235ResetDo').is_disabled()
    page.locator('#riggo1235ResetConfirm').fill('RESET')
    check('English reset confirmation uses the displayed token without performing a reset',wrong_disabled and page.locator('#riggo1235ResetConfirm').get_attribute('placeholder')=='RESET' and page.locator('#riggo1235ResetDo').is_enabled())
    page.locator('#riggo1235ResetCancel').click()
    page.evaluate("RigGOI18n.setLanguage('es');RigGO1237.openResetSheet(currentMove())")
    page.locator('#riggo1235ResetConfirm').fill('REINICIAR')
    check('Spanish reset confirmation retains its original token',page.locator('#riggo1235ResetConfirm').get_attribute('placeholder')=='REINICIAR' and page.locator('#riggo1235ResetDo').is_enabled())
    page.locator('#riggo1235ResetCancel').click();page.evaluate("RigGOI18n.setLanguage('en');render()")
    # Account B is new, not an inherited preference from A.
    account(page,'user-b','ben@nabors.com');page.locator('#riggo-language-dialog').wait_for(state='visible');page.locator('#riggo-language-dialog [value="es"]').check();page.locator('#riggoLanguageContinue').click()
    page.wait_for_function('!RigGOLanguage.preference.pending')
    b_metadata=page.evaluate('__account.user_metadata')
    check('Another user chooses independently on the same device',page.evaluate("RigGOLanguage.userId==='user-b'&&__account.user_metadata.riggo_language==='es'&&JSON.parse(localStorage.getItem('riggo-language-v1:user-a')).language==='en'"))
    account(page,metadata=metadata);page.wait_for_function('document.documentElement.lang==="en"')
    check('Switching back restores the original account language',page.locator('#riggo-language-dialog').count()==0)
    # Retain offline intent; retries can only target the active account.
    page.evaluate("Object.defineProperty(navigator,'onLine',{configurable:true,get:()=>false})")
    page.locator('#riggoLanguage').select_option('es');page.wait_for_function('RigGOLanguage.preference.pending')
    check('Offline language choice is retained for that user',page.evaluate("RigGOLanguage.preference.language==='es'&&JSON.parse(localStorage.getItem('riggo-language-v1:user-a')).pending"))
    account(page,'user-b','ben@nabors.com',b_metadata)
    page.evaluate("Object.defineProperty(navigator,'onLine',{configurable:true,get:()=>true});dispatchEvent(new Event('online'))")
    page.wait_for_timeout(150)
    check('Reconnecting under another account does not upload the previous user preference',page.evaluate('__updates.length===0'))
    account(page,metadata=metadata);page.evaluate('RigGOLanguage.sync()');page.wait_for_function('!RigGOLanguage.preference.pending')
    check('Reconnect synchronizes the retained choice when its owner returns',page.evaluate("__updates.length===1&&__updates[0].id==='user-a'&&__account.user_metadata.riggo_language==='es'"))
    page.evaluate("__saveDelay=80;RigGOLanguage.choose('en');RigGOLanguage.choose('es');RigGOLanguage.choose('en')");page.wait_for_function('!RigGOLanguage.preference.pending')
    check('Rapid switches finish with the latest choice in local and account storage',page.evaluate("__account.user_metadata.riggo_language==='en'&&RigGOLanguage.preference.language==='en'"))
    page.evaluate("__aWhileSave=__account;__saveDelay=120;RigGOLanguage.choose('es')")
    account(page,'user-b','ben@nabors.com',b_metadata);page.evaluate("RigGOLanguage.choose('en')")
    page.wait_for_function("RigGOLanguage.userId==='user-b'&&!RigGOLanguage.preference.pending")
    check('An account switch during a save also persists the next user choice',page.evaluate("__account.user_metadata.riggo_language==='en'&&__aWhileSave.user_metadata.riggo_language==='es'"))
    metadata=page.evaluate('__aWhileSave.user_metadata');account(page,metadata=metadata);page.evaluate("RigGOLanguage.choose('en')");page.wait_for_function('!RigGOLanguage.preference.pending')
    page.evaluate("()=>{const original=RigGOSupabase.auth.getSession;window.__sdkActorAfterRead={id:'silent-user',email:'silent@nabors.com',user_metadata:{riggo_language:'es'}};__accounts['silent-user']=__sdkActorAfterRead;RigGOSupabase.auth.getSession=async()=>{const result=await original();RigGOSupabase.auth.getSession=async()=>({data:{session:{user:__sdkActorAfterRead,access_token:'fixture-silent-user'}},error:null});return result};RigGOLanguage.choose('es')}")
    page.wait_for_function('!RigGOLanguage.preference.pending')
    check('A session rotation after the owner check cannot redirect the write to another user',page.evaluate("__accounts['silent-user'].user_metadata.riggo_language==='es'&&__updates.at(-1).id==='user-a'&&__account.user_metadata.riggo_language==='es'"))
    page.evaluate("RigGOSupabase.auth.getSession=async()=>({data:{session:{user:structuredClone(__account),access_token:'fixture-'+__account.id}},error:null});RigGOLanguage.choose('en')");page.wait_for_function('!RigGOLanguage.preference.pending')
    cached=page.evaluate("({...__account,user_metadata:{riggo_language:'es',riggo_language_selected:true,riggo_language_updated_at:'2000-01-01T00:00:00Z'}})")
    page.evaluate('u=>RigGOLanguage.acceptUser(u)',cached)
    check('Cached old SDK metadata does not revert a synchronized local preference',page.evaluate("RigGOI18n.language==='en'&&RigGOLanguage.preference.language==='en'"))
    metadata=page.evaluate('__account.user_metadata')
    other=browser.new_context(locale='es-CO',viewport={'width':390,'height':844},is_mobile=True,has_touch=True);other.route('https://**/*',lambda r:r.abort());mobile=other.new_page();boot(mobile);account(mobile,metadata=metadata);mobile.wait_for_function('document.documentElement.lang==="en"')
    check('A fresh device retrieves the account preference without asking again',mobile.locator('#riggo-language-dialog').count()==0)
    check('Language selector is visible and mobile viewport has no horizontal overflow',mobile.locator('#riggoLanguage').is_visible() and mobile.evaluate('document.documentElement.scrollWidth<=innerWidth'))
    if args.screenshots:mobile.screenshot(path=str(args.output/'1242-transport-mobile-en.png'),full_page=True)
    # A DB created with a higher version previously caused a boot VersionError.
    storage=browser.new_context(locale='es-CO');storage.route('https://**/*',lambda r:r.abort());sp=storage.new_page()
    sp.goto(url+'version.json')
    sp.evaluate("async()=>{await new Promise((resolve,reject)=>{const r=indexedDB.open('riggo-field-v112',2);r.onupgradeneeded=()=>{const s=r.result.createObjectStore('outbox',{keyPath:'key'});s.put({key:'sentinel',type:'unknown',proof:'retain me'})};r.onsuccess=()=>{r.result.close();resolve()};r.onerror=()=>reject(r.error)})}")
    boot(sp)
    check('Higher-version DB and missing store are repaired without removing pending records',sp.evaluate("async()=>{const db=await RigGOStorage.open('riggo-field-v112',{snapshots:{keyPath:'key'},outbox:{keyPath:'key'}});return db.version>=3&&db.objectStoreNames.contains('snapshots')&&(await RigGOV112.listOutbox()).some(x=>x.key==='sentinel'&&x.proof==='retain me')}"))
    # Retry a transient open failure using the real browser DB after the first failure.
    transient=browser.new_context(locale='es-CO');transient.route('https://**/*',lambda r:r.abort())
    transient.add_init_script("const original=indexedDB.open.bind(indexedDB);let once=true;indexedDB.open=function(...args){if(once&&args[0]==='riggo-field-v112'){once=false;throw new DOMException('Transient storage error','UnknownError')}return original(...args)}")
    tp=transient.new_page();boot(tp);check('Transient storage failure recovers without clearing the database',tp.evaluate('RigGO.runtime.selfCheck().ok'))
    denied=browser.new_context(locale='es-CO');denied.route('https://**/*',lambda r:r.abort())
    denied.add_init_script("window.__blocked=true;const real=indexedDB;Object.defineProperty(window,'indexedDB',{get(){if(__blocked)throw new DOMException('Blocked by browser policy','SecurityError');return real}})")
    dp=denied.new_page();dp.on('pageerror',lambda e:errors.append(str(e)));dp.goto(url);dp.locator('#riggoBootRetry').wait_for()
    check('Blocked storage shows a concrete error and release identifier', 'SecurityError' in dp.locator('#riggoBootDetail').inner_text() and '2026-' in dp.locator('#riggoBootDetail').inner_text())
    dp.evaluate('__blocked=false');dp.locator('#riggoBootRetry').click();dp.wait_for_function('!document.documentElement.classList.contains("riggo-booting")')
    check('Retry succeeds after storage is allowed, without a page reload',dp.evaluate('RigGO.runtime.selfCheck().ok'))
    check('No uncaught browser errors across the language and storage flows',not errors)
    (args.output/'validation-1242.json').write_text(json.dumps({'passed':results,'page_errors':errors},ensure_ascii=False,indent=2))
    browser.close()
server.shutdown()
