"""Exercise real RigGO code in an isolated browser; block all remote traffic."""
import base64
import json
import argparse
import functools
import http.server
import threading
from pathlib import Path
from playwright.sync_api import sync_playwright

parser=argparse.ArgumentParser()
parser.add_argument('--site',type=Path,default=(Path(__file__).resolve().parents[1]/'site' if (Path(__file__).resolve().parents[1]/'site').is_dir() else Path(__file__).resolve().parents[1]))
parser.add_argument('--output',type=Path,default=Path('/tmp/riggo-validation'))
parser.add_argument('--chromium',default='/usr/bin/chromium')
args=parser.parse_args()
OUT=args.output;OUT.mkdir(parents=True,exist_ok=True)
class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(QuietHandler,directory=str(args.site)))
threading.Thread(target=server.serve_forever,daemon=True).start()
BASE_URL=f'http://127.0.0.1:{server.server_port}/'

FIXTURE = r'''() => {
 state=freshState();
 state.auth={email:'tester@example.invalid',logged:true};
 state.users=[{email:state.auth.email,name:'Test supervisor',active:true,permissions:['plan','execute','overall','admin']}];
 const m=newMove(state.auth.email);m.id='test-m48';m.meta.rig='M48';m.status='active';
 m.meta.origin='Cluster RB 199';m.meta.destination='Cluster RB 117-I';m.meta.plannedDays=3;
 m.meta.projectedRelease='2026-10-07T02:00:00Z';
 m.plan.loaded=true;m.plan.maxDay=3;m.plan.curves={rd:[76,95,100],rm:[35,70,100],ru:[19,50,100]};
 m.exec.actualRelease='2026-10-07T02:00:00Z';m.exec._riggoRunId='test-run-1241';m.exec.cutoffs={D1:'00:00',D2:'00:00',D3:'00:00'};
 m.exec.tasksRD=Array.from({length:100},(_,i)=>({id:'RD'+i,text:'Down '+i,day:i<76?1:i<95?2:3,doneAt:i<31?'2026-10-07T03:00:00Z':null}));
 m.exec.tasksRU=Array.from({length:100},(_,i)=>({id:'RU'+i,text:'Up '+i,day:i<19?1:i<50?2:3,doneAt:i<1?'2026-10-07T04:00:00Z':null}));
 m.exec.loads=Array.from({length:54},(_,i)=>({id:'L'+i,description:'Load '+i,scope:'Rig',plannedDay:i<27?1:2,history:i<5?[{id:'loaded-'+i,status:'Cargada',at:'2026-10-07T03:00:00Z'}]:[],loadedAt:i<5?'2026-10-07T03:00:00Z':null}));
 state.moves=[m];state.selectedMoveId=m.id;state.screen='execute';state.execMode='day';state.execTab='transport';
 m.exec.selectedPeriodId='D1';
 const p=selectedPeriod(m),c=ensureClosure(m,p.id);
 Object.assign(c,{originOps:'Down activities',destinationOps:'Preparations',next24:'Continue operation',siteSupervisor:'Test supervisor',siteSupervisorRole:'Rig Manager',scope:{mini:{down:0,up:0},camp:{down:0,up:0}},reportStep:4});
 saveLocal();render();return {p,cid:c.id};
}'''

CHECKS = r'''() => {
 const m=currentMove(),p=selectedPeriod(m),c=ensureClosure(m,p.id),results=[];
 const check=(name,ok,detail)=>{if(!ok)throw new Error(name+': '+JSON.stringify(detail));results.push(name)};
 const near=(a,b)=>Math.abs(a-b)<1e-8;
 let q=scopeCounts(m,'Rig',p);
 check('M48: five loaded, zero mobilized/positioned, zero physical RM',q.loaded===5&&q.moved===0&&q.pos===0&&q.pct===0,q);
 check('Suggested general RM stays zero',suggestedPcts(m,p).rm===0);
 check('Empty scopes stay zero',scopeCounts(m,'Mini Camp',p).pct===0);
 let plan=currentPlanPcts(m,p);
 check('3-hour first day: 9.5 / 4.375 / 2.375 percent plan',p.expectedHours===3&&near(plan.rd,9.5)&&near(plan.rm,4.375)&&near(plan.ru,2.375),{p,plan});
 const curves=JSON.stringify(m.plan.curves),plus=h=>({...p,end:new Date(Date.parse(m.meta.projectedRelease)+h*3600000).toISOString()});
 check('24-hour baseline equals original day one',currentPlanPcts(m,plus(24)).rd===76);
 check('27 hours interpolate into the second plan block',near(currentPlanPcts(m,plus(27)).rd,78.375));
 check('Before baseline zero, after final baseline 100',currentPlanPcts(m,plus(-1)).rm===0&&currentPlanPcts(m,plus(96)).rm===100);
 const planned=m.meta.projectedRelease;m.meta.projectedRelease='';
 check('Actual release fallback yields same 3-hour plan',near(currentPlanPcts(m,p).rm,4.375));m.meta.projectedRelease=planned;
 m.meta.projectedRelease='2026-10-06T23:00:00Z';
 check('Planned release anchor retains a late start',near(currentPlanPcts(m,p).rm,8.75));m.meta.projectedRelease=planned;
 check('Baseline curve is never rewritten',JSON.stringify(m.plan.curves)===curves);
 c.overrides={rd:false,rm:true,ru:false};c.reported={rm:42};
 check('Manual RM override remains 42',reportValue(c,'rm',suggestedPcts(m,p).rm)===42);c.overrides.rm=false;
 const load=m.exec.loads[0];load.history.push({id:'transit-test',status:'En tránsito',at:'2026-10-07T04:00:00Z'});load.transitAt='2026-10-07T04:00:00Z';
 q=scopeCounts(m,'Rig',p);check('In transit counts mobilized, not positioned',q.moved===1&&q.pos===0&&statusAt(load,p.end)==='En tránsito',q);
 load.history.push({id:'position-test',status:'Posicionada',at:'2026-10-07T06:00:00Z'});load.positionedAt='2026-10-07T06:00:00Z';
 check('Future positioned event excluded at cutoff',scopeCounts(m,'Rig',p).pos===0);
 check('Later cutoff includes positioning',scopeCounts(m,'Rig',plus(5)).pos===1);
 load.history.push({id:'reset-test',status:'Pendiente',at:'2026-10-07T07:00:00Z'});load.loadedAt=null;load.transitAt=null;load.positionedAt=null;
 check('Reset keeps earlier historical transport snapshot',scopeCounts(m,'Rig',p).moved===1&&statusAt(load,plus(6).end)==='Pendiente');
 load.history=[{id:'loaded-0',status:'Cargada',at:'2026-10-07T03:00:00Z'}];load.loadedAt='2026-10-07T03:00:00Z';load.transitAt=null;load.positionedAt=null;
 check('Legacy timestamp-only transit supported',statusAt({transitAt:'2026-10-07T04:00:00Z'},p.end)==='En tránsito');
 const host=document.createElement('div');host.innerHTML=f0065Html(m,p,c);
 const table=[...host.querySelectorAll('table')].find(t=>t.textContent.includes('CARGADAS')&&t.textContent.includes('POSICIONADAS'));
 const cells=[...table.rows[1].cells].map(x=>x.textContent.trim());
 check('OPS row: 54 total, 5 loaded, 0 mobilized/positioned, 0% MOVE',JSON.stringify(cells.slice(0,5))===JSON.stringify(['RIG','54','5','0','0'])&&cells[6]==='0%',cells);
 const email=RigGOV114.renderFrozenEmail(m,p,c);host.innerHTML=email;
 check('Email separates loaded, mobilized, positioned',host.textContent.includes('5 / 54 cargadas')&&host.textContent.includes('0 movilizadas')&&host.textContent.includes('0 posicionadas'));
 check('Email explains elapsed-hour baseline',host.textContent.includes('Período de 3 h'));
 window.__testResults=results;return results;
}'''

def run():
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path=args.chromium, args=['--no-sandbox'])
        context = b.new_context(viewport={'width':1440,'height':1000},service_workers='block')
        # Runtime JS and browser storage are real; all outside services are isolated.
        context.route('https://**/*', lambda r: r.abort())
        page=context.new_page(); errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.goto(BASE_URL)
        page.wait_for_function('window.RigGO1237')
        assert page.evaluate('RigGO.runtime.selfCheck().ok && RigGO1241.selfCheck().ok')
        page.evaluate(FIXTURE)
        results=page.evaluate(CHECKS)
        print(json.dumps(results,ensure_ascii=False,indent=2),flush=True)
        page.wait_for_timeout(500)
        print('Transport UI:',page.locator('.riggo1241-transport-summary').all_inner_texts(),flush=True)
        if not (OUT/'desktop-transport.png').exists():
            page.screenshot(path=str(OUT/'desktop-transport.png'),full_page=True)
        page.evaluate("state.execTab='progress';render()")
        page.wait_for_timeout(250)
        if not (OUT/'desktop-progress.png').exists():
            page.screenshot(path=str(OUT/'desktop-progress.png'),full_page=True)
        # Build real frozen email and PDF without sending anything.
        frozen=page.evaluate("async()=>{const m=currentMove(),p=selectedPeriod(m),c=ensureClosure(m,p.id);return await RigGOV114.buildFrozenEmail(m,p,c,['tester@example.invalid'],[],1)}")
        (OUT/'email.html').write_text(frozen['payload']['html'])
        pdf=frozen['payload']['attachments'][0]
        (OUT/'OPS.pdf').write_bytes(base64.b64decode(pdf['content']))
        assert base64.b64decode(pdf['content']).startswith(b'%PDF-')
        assert frozen['media']['ok'],frozen['media']
        results.append('Real PDF, progress PNG and validated frozen email generated')
        assert page.evaluate("async()=>{const record={status:'sent',emailRendererVersion:3,payload:{html:'original sent HTML',attachments:[{content:'original PDF'}]}},before=JSON.stringify(record);return await RigGOV114.ensureRendererCurrent(record)===record&&JSON.stringify(record)===before}")
        results.append('Already-sent HTML and attachments remain unchanged')
        assert page.evaluate("async()=>{const record={key:'test-1241-old',status:'pending',moveId:currentMove().id,periodLocalId:selectedPeriod(currentMove()).id,emailRendererVersion:3,version:1,payload:{to:['tester@example.invalid'],cc:[],html:'old metrics',attachments:[{content:'old PDF'}]}};const updated=await RigGOV114.ensureRendererCurrent(record);return updated.emailRendererVersion===RigGOV114.rendererVersion&&new DOMParser().parseFromString(updated.payload.html,'text/html').body.textContent.includes('0 movilizadas')&&atob(updated.payload.attachments[0].content).startsWith('%PDF-')&&updated.payload.to[0]==='tester@example.invalid'}")
        results.append('Pending old email regenerates HTML, chart and PDF consistently')
        # Offline one-click stages still go through the existing durable sync authority.
        page.evaluate("Object.defineProperty(navigator,'onLine',{get:()=>false,configurable:true});state.execTab='transport';render()")
        for expected in ['En tránsito','Posicionada']:
            page.locator('[data-v3-load="L0"]').click()
            page.wait_for_function('(expected)=>statusAt(currentMove().exec.loads[0],selectedPeriod(currentMove()).end)===expected',arg=expected)
            page.wait_for_function("!RigGO1237.isLoadBusy(currentMove().id,\"L0\")")
        page.on('dialog',lambda d:d.accept())
        page.locator('[data-v3-load="L0"]').click()
        page.wait_for_function('statusAt(currentMove().exec.loads[0],selectedPeriod(currentMove()).end)==="Pendiente"')
        assert page.evaluate('currentMove().exec.loads[0].history.length')==4
        results.append('Click cycle and audited reset preserve historical events offline')
        # Durable photos/signature and run isolation use the existing IndexedDB store.
        assert page.evaluate("async()=>{const m=currentMove(),p=selectedPeriod(m),c=ensureClosure(m,p.id),cv=document.createElement('canvas');cv.width=20;cv.height=20;const ctx=cv.getContext('2d');ctx.fillRect(1,1,10,10);const image=cv.toDataURL();c.photos=[image];c.signature=image;await RigGO124Media.commit(m,c);c.photos=[];c.signature='';await RigGO124Media.restore(m,c);const ok=c.photos.length===1&&c.signature===image;const run=m.exec._riggoRunId;m.exec._riggoRunId='other-run';const isolated=!(await RigGO124Media.read(`${m.id}|other-run|${c.id}`));m.exec._riggoRunId=run;return ok&&isolated}")
        results.append('Evidence survives restoration and stays isolated by execution run')
        # A manual 100% still pauses new operational days, without acceptance.
        assert page.evaluate("()=>{const m=newMove();m.id='test-end';m.exec.actualRelease='2026-10-07T02:00:00Z';m.exec.tasksRD=[{doneAt:null,day:1}];m.exec.tasksRU=[{doneAt:null,day:1}];m.exec.loads=[{history:[],plannedDay:1,scope:'Rig'}];m.exec.closures={D1:{closedAt:'2026-10-07T05:00:00Z',overrides:{rd:true,rm:true,ru:true},reported:{rd:100,rm:100,ru:100}}};const end=RigGO124.physicalEnd(m);return end?.needsConfirmation&&!m.exec.actualAcceptance&&movePeriods(m).every(p=>p.index===1)}")
        results.append('Operational end pause and acceptance separation retained')
        # The touch contexts exercise actual touch panning, not just a scrollbar property.
        mobile=b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,device_scale_factor=1,service_workers='block')
        mobile.route('https://**/*',lambda r:r.abort())
        mp=mobile.new_page();mp.on('pageerror',lambda e:errors.append(str(e)))
        mp.goto(BASE_URL);mp.wait_for_function('!document.documentElement.classList.contains("riggo-booting")')
        mp.evaluate(FIXTURE);mp.wait_for_timeout(300)
        if not (OUT/'mobile-transport.png').exists():
            mp.screenshot(path=str(OUT/'mobile-transport.png'),full_page=True)
        mp.evaluate("state.screen='moveSelect';state.execMode='days';state.moves=Array.from({length:5},(_,i)=>({...structuredClone(state.moves[0]),id:'test-'+i,meta:{...state.moves[0].meta,rig:'M'+(48+i)}}));render()")
        mp.wait_for_timeout(250)
        cdp=mobile.new_cdp_session(mp)
        cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':190,'y':700}]})
        for y in range(650,149,-50):
            cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':190,'y':y}]});mp.wait_for_timeout(20)
        cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
        mp.wait_for_timeout(300)
        assert mp.evaluate('window.scrollY')>100,mp.evaluate('({y:scrollY,body:document.body.className,overflow:getComputedStyle(document.body).overflowY})')
        if not (OUT/'mobile-move-list.png').exists():
            mp.screenshot(path=str(OUT/'mobile-move-list.png'))
        results.append('Actual touch swipe scrolls the mobile Move list')
        # Chromium profiles isolate browser identity from blocked CDN dependencies.
        for label,agent in [('Edge','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0'),('Brave Android','Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36')]:
            profile=b.new_context(user_agent=agent,service_workers='block')
            profile.route('https://**/*',lambda r:r.abort())
            pp=profile.new_page();pp.goto(BASE_URL);pp.wait_for_function('!document.documentElement.classList.contains("riggo-booting")')
            assert pp.evaluate('RigGO.runtime.selfCheck().ok&&RigGO1241.selfCheck().ok')
            results.append(label+' user-agent profile boots with all external traffic blocked')
            profile.close()
        assert mp.evaluate('document.documentElement.scrollWidth<=innerWidth'),mp.evaluate('({scroll:document.documentElement.scrollWidth,width:innerWidth})')
        mp.set_viewport_size({'width':390,'height':320})
        mp.evaluate("state.screen='home';render();document.documentElement.style.fontSize='32px'")
        mp.wait_for_timeout(200)
        assert mp.evaluate('getComputedStyle(document.body).overflowY!=="hidden"&&document.scrollingElement.scrollHeight>innerHeight')
        results.append('Home permits scrolling with 200% text on mobile')
        assert not errors,errors
        (OUT/'results.json').write_text(json.dumps(results,ensure_ascii=False,indent=2))
        print('PASS:',len(results),'groups; no page errors',flush=True)
        b.close()

if __name__=='__main__':
    try:run()
    finally:server.shutdown();server.server_close()
