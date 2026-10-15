"""Exercise SANAD routing and English copy with external services isolated."""
import argparse,ast,functools,http.server,json,threading
from pathlib import Path
from playwright.sync_api import sync_playwright
parser=argparse.ArgumentParser();parser.add_argument('--site',type=Path,default=Path(__file__).resolve().parents[1]);parser.add_argument('--output',type=Path,default=Path('/tmp/riggo-1243-validation'));args=parser.parse_args();args.output.mkdir(parents=True,exist_ok=True)
fixture=next(ast.literal_eval(n.value) for n in ast.parse((args.site/'scripts/smoke_release.py').read_text()).body if isinstance(n,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='FIXTURE' for t in n.targets)).replace('tester@example.invalid','tester@nabors.com')
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(args.site)));threading.Thread(target=server.serve_forever,daemon=True).start();results=[];errors=[]
def check(name,condition):
 assert condition,name
 results.append(name);print('PASS:',name,flush=True)
try:
 with sync_playwright() as p:
  b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);ctx=b.new_context(locale='en-US',viewport={'width':1440,'height':1000});ctx.route('https://**/*',lambda r:r.abort());page=ctx.new_page();page.on('pageerror',lambda e:errors.append(str(e)));page.goto(f'http://127.0.0.1:{server.server_port}/');page.wait_for_function('!document.documentElement.classList.contains("riggo-booting")')
  check('Corporate domain validation accepts NABORS, SANAD, uppercase and plus aliases',page.evaluate("['person@nabors.com','person@sanad.com',' Person+Rig@SANAD.COM '].every(RigGOIdentity.isCorporateEmail)"))
  check('Corporate validation rejects other domains, subdomains, lookalikes and malformed addresses',page.evaluate("['a@sanad.com.evil','a@sub.sanad.com','a@evil-sanad.com','a@nabors.com.evil','a@@sanad.com','a..b@sanad.com','@sanad.com','a @sanad.com','a@sanad. com','a@gmail.com'].every(x=>!RigGOIdentity.isCorporateEmail(x))"))
  page.evaluate("()=>{window.__authCalls=[];for(const [name,kind] of [['signInWithPassword','login'],['signUp','signup'],['resetPasswordForEmail','reset']])RigGOSupabase.auth[name]=async body=>{__authCalls.push({kind,body});return {data:null,error:kind==='reset'?null:{message:'AUTH_TEST_REACHED'}}}}")
  page.locator('#loginEmail').fill('Person@SANAD.COM');page.locator('#loginPassword').fill('isolated-password');page.locator('#loginBtn').click();page.wait_for_function('__authCalls.some(x=>x.kind==="login")')
  check('SANAD login reaches Supabase Auth with normalized email',page.evaluate("__authCalls.find(x=>x.kind==='login').body.email==='person@sanad.com'"))
  page.locator('#signupBtn').click();page.wait_for_function('__authCalls.some(x=>x.kind==="signup")')
  check('SANAD account creation reaches Supabase Auth',page.evaluate("__authCalls.find(x=>x.kind==='signup').body.email==='person@sanad.com'"))
  page.locator('#forgotPassword').click();page.wait_for_function('__authCalls.some(x=>x.kind==="reset")')
  check('SANAD password recovery reaches the existing canonical recovery flow',page.evaluate("__authCalls.find(x=>x.kind==='reset').body==='person@sanad.com'"))
  page.locator('#loginEmail').fill('person@sanad.com.evil');before=page.evaluate('__authCalls.length');page.locator('#loginBtn').click()
  check('Unsupported login domains are rejected before the Auth request, with English copy',page.evaluate('__authCalls.length')==before and page.locator('#loginError').inner_text()=='Use your @nabors.com or @sanad.com email.')
  page.evaluate("()=>{window.__signedOut=0;RigGOSupabase.auth.signInWithPassword=async body=>({data:{user:{id:'inactive-sanad',email:body.email}},error:null});RigGOSupabase.auth.signOut=async()=>{__signedOut++;return {error:null}};window.__realFrom=RigGOSupabase.from;RigGOSupabase.from=table=>{const value={data:table==='access_list'?[{email:'inactive@sanad.com',active:false,can_plan:true,display_name:'Inactive fixture'}]:[],error:null};let q;q=new Proxy({}, {get:(_,k)=>k==='then'?((resolve,reject)=>Promise.resolve(value).then(resolve,reject)):(()=>q)});return q}}")
  page.locator('#loginEmail').fill('inactive@sanad.com');page.locator('#loginPassword').fill('isolated-password');page.locator('#loginBtn').click();page.wait_for_function('__signedOut>0&&!state.auth.logged')
  check('SANAD domain acceptance does not bypass administrator approval or inactive-account rejection','not authorized' in page.locator('#loginError').inner_text())
  page.evaluate('()=>{RigGOSupabase.from=__realFrom}');page.evaluate(fixture);page.evaluate("RigGOI18n.setLanguage('en');state.screen='home';render()")
  home=page.locator('.v52-home-content').inner_text()
  check('Home cards, descriptions and greeting are all English',all(x in home for x in ['Create Plan','Execute Move','Set the baseline, scope and resources','Run the daily operation and report progress','Users, permissions and Moves','Good ']) and all(x not in home for x in ['Cargar Plan','Ejecutar Move','Buenas','Buenos','Administración']))
  page.evaluate("()=>{window.__adminCalls=[];Object.defineProperty(RigGOSupabase,'functions',{configurable:true,value:{invoke:async(name,{body})=>{__adminCalls.push({name,body});return {data:{ok:true,user:body.user},error:null}}}});state.screen='admin';render();openAddUser()}")
  page.locator('#newUserName').fill('SANAD test user');page.locator('#newUserEmail').fill('New.User@SANAD.COM');page.locator('[data-newperm="plan"]').check();page.locator('#saveUser').click();page.wait_for_function("state.users.some(x=>x.email==='new.user@sanad.com')")
  check('Administrator can submit a SANAD user through the existing admin Edge Function',page.evaluate("__adminCalls.length===1&&__adminCalls[0].name==='riggo-admin-users'&&__adminCalls[0].body.op==='create'&&__adminCalls[0].body.user.email==='new.user@sanad.com'"))
  check('Creating a SANAD user preserves explicitly selected permissions',page.evaluate("()=>{const u=state.users.find(x=>x.email==='new.user@sanad.com');return JSON.stringify(u.permissions)===JSON.stringify(['plan'])&&u.active}"))
  page.evaluate('openAddUser()');page.locator('#newUserEmail').fill('bad@sanad.com.evil');page.locator('#saveUser').click()
  check('Administrator form rejects lookalike domains without an API call',page.evaluate('__adminCalls.length')==1 and '@sanad.com' in page.locator('#newUserResult').inner_text());page.evaluate('closeSheet()')
  check('Distribution groups accept mixed corporate members and reject lookalikes',page.evaluate("()=>{const r=RigGOV107.test.parseEmailsText('A@NABORS.COM; B@SANAD.COM; b@sanad.com; bad@sanad.com.evil');return JSON.stringify(r.good)===JSON.stringify(['a@nabors.com','b@sanad.com'])&&JSON.stringify(r.bad)===JSON.stringify(['bad@sanad.com.evil'])}"))
  check('Daily report recipient parsing accepts SANAD addresses in mixed distributions',page.evaluate("()=>{const r=RigGOV70.parseEmails('a@nabors.com; B@SANAD.COM');return r.invalid.length===0&&r.emails.includes('b@sanad.com')&&r.emails.includes('a@nabors.com')}"))
  page.evaluate("()=>{window.__emailCalls=[];Object.defineProperty(RigGOSupabase,'functions',{configurable:true,value:{invoke:async(name,{body})=>{__emailCalls.push({name,body});return {data:{ok:true,messageId:'isolated-provider-fixture'},error:null}}}});state.screen='admin';state.adminMoveView='users';render()}")
  # The existing test-email UI is absent from some admin layouts; attach the same
  # IDs and invoke the actual handler. The remote service remains mocked.
  page.evaluate("()=>{const host=document.createElement('div');host.innerHTML='<input id=\"testEmailTo\"><button id=\"sendEmailTest\"></button><div id=\"emailTestResult\"></div>';app.append(host);document.getElementById('testEmailTo').value='recipient@sanad.com'}")
  page.evaluate('RigGOEmailTest()');page.wait_for_function('__emailCalls.length===1')
  check('SANAD email recipient is passed intact to riggo-send-email',page.evaluate("__emailCalls[0].name==='riggo-send-email'&&__emailCalls[0].body.to.includes('recipient@sanad.com')"))
  check('Generated test email and success feedback use English',page.evaluate("!__emailCalls[0].body.html.includes('Canal de correo activo')&&!__emailCalls[0].body.html.includes('Buen día')&&!document.getElementById('emailTestResult').textContent.includes('Enviado')"))
  page.evaluate("()=>{const m=currentMove();m.exec.loads[0].description='Cargada';m.meta.origin='Pendiente';const c=ensureClosure(m,selectedPeriod(m).id);c.originOps='Operación escrita por el usuario';window.__canonical=JSON.stringify({description:m.exec.loads[0].description,origin:m.meta.origin,hse:m.hse});state.screen='execute';state.execMode='day';state.execTab='transport';render()}")
  check('User-authored Spanish load descriptions remain verbatim in English',page.get_by_text('Cargada',exact=True).count()>0)
  page.evaluate("RigGOI18n.setLanguage('es');render();RigGOI18n.setLanguage('en');render()")
  check('Language changes retain canonical resource values and user data',page.evaluate("JSON.stringify({description:currentMove().exec.loads[0].description,origin:currentMove().meta.origin,hse:currentMove().hse})===__canonical"))
  check('Canonical option values remain Spanish while their display labels are English',page.evaluate("()=>{const host=document.createElement('div');host.innerHTML=RigGOI18n.h`<select><option>${'Posicionada'}</option><option>${'En tránsito'}</option></select>`;return host.children[0].options[0].value==='Posicionada'&&host.children[0].options[0].text==='Positioned'&&host.children[0].options[1].value==='En tránsito'&&host.children[0].options[1].text==='In transit'}"))
  page.evaluate("state.screen='overall';state.overallTab='live';render()")
  check('Live route labels are English while user locations remain verbatim','Transporte' not in page.locator('#app').inner_text() and 'Pendiente' in page.locator('#app').inner_text())
  check('Generated OPS and email labels and unchanged boilerplate are English',page.evaluate("()=>{const m=currentMove(),p=selectedPeriod(m),c=ensureClosure(m,p.id),host=document.createElement('div');host.innerHTML=f0065Html(m,p,c)+RigGOV114.renderFrozenEmail(m,p,c);return ![...host.querySelectorAll('td')].some(x=>x.textContent.trim()==='Carga')&&!['SE CUENTA CON ','EQUIPO DE PROTECCIÓN PERSONAL','SIN RETRASOS REPORTADOS','SIN ADELANTOS EN EL','Inicio Parada de Tubería','Resumen:'].some(s=>host.textContent.includes(s))&&host.textContent.includes('Cargada')}"))
  check('No uncaught JavaScript errors',not errors);b.close()
finally:
 server.shutdown();(args.output/'results.json').write_text(json.dumps({'passed':len(results),'checks':results,'errors':errors},ensure_ascii=False,indent=2))
