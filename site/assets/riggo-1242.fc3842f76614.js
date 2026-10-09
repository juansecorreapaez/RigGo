/* RigGO interface service: accessible registration, shared focus and disclosures. */
(() => {
  'use strict';
  const W = window, E = id => document.getElementById(id);
  const labels = {name:'Nombre',company:'Empresa',role:'Cargo',qty:'Cantidad',type:'Tipo',
    capacity:'Capacidad',use:'Uso',owner:'Propiedad',operational:'Operativo',description:'Descripción',
    base:'Plan base',forecast:'Proyección',actual:'Fecha real',email:'Correo',active:'Activo'};
  const groups = {crew:'Personal',vehicles:'Vehículos',vehicle:'Vehículo',lmc:'Equipo LMC'};
  const fieldNames = {v3Search:'Buscar en toda la Move',loginEmail:'Correo corporativo',
    loginPassword:'Contraseña',pRig:'Rig',pOperator:'Operador',pOrigin:'Origen',pDestination:'Destino',
    pDistance:'Distancia (km)',pDays:'Días planificados',pRelease:'Rig Release planificado',
    pCompany:'Empresa de movilización',pSupport:'Empresa de apoyo',deliveryTo:'Destinatarios',
    deliveryCc:'Con copia',v3LessonsEdit:'Lecciones aprendidas',dailyTo:'Destinatarios',dailyCc:'Con copia'};
  const help = {
    login:['Acceso a RigGO','Ingresa con tu cuenta autorizada. Si no recuerdas la contraseña, usa la recuperación de acceso.'],
    home:['Trabajo en RigGO','Elige Plan para preparar la Move, Ejecución para registrar la operación o Performance para revisar el desempeño. Las opciones disponibles dependen de tus permisos.'],
    planList:['Planes de Move','Selecciona una Move o crea su plan. Importa el Move Template y revisa alcance, recursos y distribución antes de activar.'],
    plan:['Preparación del plan','Importa el Move Template antes de continuar. El Rig Release planificado es la referencia del plan al corte. Revisa las personas autorizadas y destinatarios antes de activar.'],
    moveSelect:['Seleccionar una Move','Abre la Move correspondiente al Rig y la ruta. Los días, cargas y evidencias pertenecen a esa Move y a su corrida de ejecución.'],
    execute:['Registro de la operación','Registra hechos ocurridos dentro del período. Cargada significa preparada; En tránsito registra la salida; Posicionada registra la llegada a destino. RM físico usa posicionadas / total. Un cambio pendiente de sincronización aún necesita confirmación del servidor.'],
    review:['Revisión y envío','Preparar el registro, revisar OPS, cerrar el día y enviar el correo son etapas distintas. La copia ya enviada se conserva; las correcciones requieren revisar y reenviar.'],
    overall:['Lectura del desempeño','Revisa el estado de las Moves y el detalle de los indicadores. Los porcentajes de tareas/cargas y los índices de calendario describen medidas distintas; consulta sus definiciones.'],
    admin:['Administración','Revisa usuario, Move y alcance antes de cambiar permisos o estado. Reiniciar conserva el plan y elimina la ejecución de la corrida; requiere conexión y confirmación del servidor.'],
    closeout:['Cierre de la Move','El fin operativo detiene nuevos días. La aceptación y el cierre administrativo son distintos; revisa los reportes y lecciones antes de cerrar.']
  };
  let lastView = '', queued = false;
  const dialogFrames=[];
  let pendingInsertion = null, lastError = null;
  const disclosureState = new Map(),opsSelections=new Map();
  let opsWrap=null;

  function route() { return state.auth?.logged ? state.screen || 'home' : 'login'; }
  function viewKey() {
    const m = currentMove();
    return [route(), state.selectedMoveId || '',
      state.screen === 'execute' ? state.execMode : '',
      ['execute','review'].includes(state.screen) ? m?.exec?.selectedPeriodId : '',
      state.screen === 'execute' ? state.execTab : '',
      state.execTab === 'report' ? m?.exec?.closures?.[m.exec.selectedPeriodId]?.reportStep : '',
      state.screen === 'plan' ? state.planStep : '',
      state.screen === 'admin' ? state.adminMoveView : '',
      state.screen === 'overall' ? state.overallTab : '',
      state.screen === 'review' ? state.reportView : ''].join('|');
  }
  function visible(el) { return !!el && !el.hidden && el.getClientRects().length > 0; }
  function captureFocus(el = document.activeElement) {
    if (!el || el === document.body || el === document.documentElement) return null;
    const attrs = [...el.attributes].filter(a => a.name.startsWith('data-') && !a.name.startsWith('data-riggo'));
    const id = el.id && !el.id.startsWith('riggo-field-') ? el.id : '';
    if (!id && !attrs.length) return null;
    let selection = null;
    try { if (typeof el.selectionStart === 'number') selection = [el.selectionStart,el.selectionEnd]; } catch (_) {}
    return {id,attrs:attrs.map(a=>[a.name,a.value]),tag:el.tagName,view:lastView || viewKey(),selection};
  }
  function findFocus(snapshot) {
    if (!snapshot) return null;
    if (snapshot.id) return E(snapshot.id);
    return [...document.querySelectorAll(snapshot.tag)].find(el =>
      snapshot.attrs.every(([name,value])=>el.getAttribute(name) === value));
  }
  function restoreFocus(snapshot, {force = false} = {}) {
    if (!snapshot || snapshot.view !== viewKey()) return;
    const el = findFocus(snapshot);
    if (!visible(el) || el.disabled || el.closest('[inert]')) return;
    const active = document.activeElement;
    if (!force && active !== document.body && active?.isConnected && active !== el) return;
    el.focus({preventScroll:true});
    if (snapshot.selection) try { el.setSelectionRange(...snapshot.selection); } catch (_) {}
  }
  function announce(text, urgent = false) {
    const el = E(urgent ? 'riggoUIError' : 'riggoUIStatus');
    if (el && el.textContent !== text) el.textContent = text;
  }
  function regions() {
    for (const [id,role,live] of [['riggoUIStatus','status','polite'],['riggoUIError','alert','assertive']]) {
      if (E(id)) continue;
      const el = document.createElement('div');
      el.id=id;el.className='riggo-ui-sr';el.setAttribute('role',role);
      el.setAttribute('aria-live',live);el.setAttribute('aria-atomic','true');
      document.body.appendChild(el);
    }
    for(const sync of document.querySelectorAll('.online-sync')){sync.setAttribute('role','status');sync.setAttribute('aria-live','polite');sync.setAttribute('aria-atomic','true');}
    const toast = E('toast');
    if (toast) { toast.setAttribute('role','status');toast.setAttribute('aria-live','polite');toast.setAttribute('aria-atomic','true'); }
  }
  function fieldInfo(el) {
    const k = el.dataset.k || '';
    const dataGroup = el.dataset.daily || el.dataset.res;
    if (el.hasAttribute('data-part')) return {short:labels[k] || 'Dato',full:'Participante '+(Number(el.dataset.part)+1)+' · '+(labels[k] || 'Dato')};
    if (dataGroup) return {short:labels[k] || k,full:(groups[dataGroup] || dataGroup)+' '+(Number(el.dataset.i)+1)+' · '+(labels[k] || k)};
    if (el.hasAttribute('data-progressnote')) return {short:'Comentario',full:({rd:'Rig Down',rm:'Rig Move',ru:'Rig Up'}[el.dataset.progressnote] || '')+' · Comentario'};
    if (el.hasAttribute('data-forecast') || el.hasAttribute('data-msactual')) {
      const title=el.closest('article,.editor-row')?.querySelector('h3,b')?.textContent.trim() || 'Hito';
      return {short:el.hasAttribute('data-forecast')?'Proyección':'Fecha real',full:title+' · '+(el.hasAttribute('data-forecast')?'Proyección':'Fecha real')};
    }
    if (el.hasAttribute('data-ms')) return {short:labels[k] || k,full:'Hito '+(Number(el.dataset.ms)+1)+' · '+(labels[k] || k)};
    if (el.hasAttribute('data-v3-photocap')) return {short:'Descripción de la foto',full:'Foto '+(Number(el.dataset.v3Photocap)+1)+' · Descripción'};
    const cell=el.closest('td'),table=cell?.closest('table');
    if (cell && table) {
      const head=table.querySelector('tr')?.children[cell.cellIndex]?.textContent.trim();
      const person=cell.parentElement?.firstElementChild?.textContent.trim();
      if (head) return {short:head,full:(person ? person+' · ' : '')+head};
    }
    const existing = fieldNames[el.id] || el.getAttribute('aria-label') || el.title || el.name || el.placeholder;
    return existing ? {short:existing,full:existing} : null;
  }
  function labelFields(host) {
    for (const el of host.querySelectorAll('input:not([type=hidden]):not([type=file]),select,textarea')) {
      if (el.dataset.riggoUiLabel || el.closest('.f0065-page,.email')) continue;
      const info=fieldInfo(el);
      if (info) el.setAttribute('aria-label',info.full);
      if (el.labels?.length || el.closest('label') || !info) continue;
      const label=document.createElement('label');label.className='riggo-field-label';
      const span=document.createElement('span');span.textContent=info.short;
      if(['checkbox','radio'].includes(el.type)&&el.closest('td'))span.className='riggo-ui-sr';
      label.appendChild(span);el.before(label);label.appendChild(el);
      el.dataset.riggoUiLabel='true';
      if (['checkbox','radio'].includes(el.type)) label.classList.add('riggo-checkbox-label');
    }
  }
  function describeButtons(host) {
    for(const proxy of host.querySelectorAll('.riggo-quarter-proxy')) {
      const input=proxy.previousElementSibling;if(input?.tagName!=='INPUT')continue;
      const info=fieldInfo(input),label=input.labels?.[0];
      const context=info?.full||[...(label?.childNodes||[])].filter(n=>n.nodeType===3).map(n=>n.textContent.trim()).join(' ')||'Fecha y hora';
      if(input.id)proxy.id=input.id+'-picker';
      proxy.setAttribute('aria-label','Seleccionar '+context+' · '+proxy.textContent.trim());
    }

    for (const b of host.querySelectorAll('[data-v3-progress],[data-v3-suggest]')) {
      const phase={rd:'Rig Down',rm:'Rig Move',ru:'Rig Up'}[b.dataset.v3Progress || b.dataset.v3Suggest];
      b.setAttribute('aria-label',(b.dataset.v3Progress?'Modificar avance reportado de ':'Usar avance sugerido de ')+phase);
    }
    for (const b of host.querySelectorAll('[data-deleteevent],[data-delres],[data-delms]')) {
      const context=b.closest('.event-row,.editor-row')?.querySelector('b,input')?.textContent ||
        b.closest('.editor-row')?.querySelector('input')?.value || '';
      b.setAttribute('aria-label','Quitar '+(b.dataset.deleteevent?'evento de Flat Time':b.dataset.delms?'hito':'recurso')+(context?' · '+context:''));
    }
    for (const b of host.querySelectorAll('button:not([type])')) b.type='button';
    for (const b of host.querySelectorAll('[data-v3-future],[data-v3-loadfuture]')) {
      const panel=E(b.dataset.target);if(panel){b.setAttribute('aria-controls',panel.id);b.setAttribute('aria-expanded',String(!panel.classList.contains('hidden')));}
    }
    for (const b of host.querySelectorAll('[data-v3-load]')) {
      const busy=W.RigGO1237?.isLoadBusy?.(currentMove()?.id,b.dataset.v3Load);
      if (busy && !b.dataset.riggoUiBusy) {
        b.dataset.riggoUiBusy='true';b.setAttribute('aria-disabled','true');b.setAttribute('aria-busy','true');
      } else if (!busy && b.dataset.riggoUiBusy) {
        delete b.dataset.riggoUiBusy;b.removeAttribute('aria-disabled');b.removeAttribute('aria-busy');
      }
      const available=W.RigGO1237?.canUndoLoad?.(currentMove()?.id,b.dataset.v3Load);
      const actions=b.closest('.riggo-load-actions');
      if (available && actions && !actions.querySelector('[data-riggo-undo-load]')) {
        const undo=document.createElement('button');undo.type='button';undo.className='btn ghost riggo-load-undo';
        undo.dataset.riggoUndoLoad=b.dataset.v3Load;undo.textContent='Corregir último registro';
        undo.setAttribute('aria-label','Corregir último registro de '+(b.closest('.v3-load-row')?.querySelector('b')?.textContent || 'esta carga'));
        actions.appendChild(undo);
      } else if (!available) actions?.querySelector('[data-riggo-undo-load]')?.remove();
    }
  }
  function picker(nav, id, title) {
    if (!nav || E(id)) return;
    const buttons=[...nav.querySelectorAll('button')];
    if (!buttons.length) return;
    const label=document.createElement('label');label.className='riggo-nav-picker';label.textContent=title;
    const select=document.createElement('select');select.id=id;select.className='field';select.setAttribute('aria-label',title);
    buttons.forEach((button,index)=>{
      const option=document.createElement('option');option.value=String(index);option.textContent=button.textContent.trim().replace(/\s+/g,' ').replace(/^(\d{2})\s*/, '$1 · ');
      option.selected=button.classList.contains('active');option.disabled=button.disabled;select.appendChild(option);
    });
    select.addEventListener('change',()=>{
      buttons[Number(select.value)]?.click();
      requestAnimationFrame(()=>{if(select.isConnected){const active=buttons.findIndex(b=>b.classList.contains('active'));if(active>=0)select.value=String(active);}});
    });
    label.appendChild(select);nav.before(label);
  }
  function helpPanel() {
    const main=E('riggoMain') || document.querySelector('main'),actions=document.querySelector('.top-actions');
    if (!main || !actions || !state.auth?.logged) return;
    let button=E('riggoUIHelp');
    if (!button) {
      button=document.createElement('button');button.id='riggoUIHelp';button.type='button';button.className='btn ghost';
      button.textContent='Ayuda';button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls','riggoUIHelpPanel');actions.appendChild(button);
      button.onclick=()=>{
        const panel=E('riggoUIHelpPanel');if(!panel)return;
        panel.hidden=!panel.hidden;button.setAttribute('aria-expanded',String(!panel.hidden));
        if(!panel.hidden)panel.querySelector('h2')?.focus({preventScroll:true});else button.focus({preventScroll:true});
      };
    }
    if (E('riggoUIHelpPanel')) return;
    const [title,text]=help[route()] || help.home;
    const panel=document.createElement('section');panel.id='riggoUIHelpPanel';panel.className='riggo-help-panel';panel.hidden=true;
    const heading=document.createElement('h2');heading.textContent=title;heading.tabIndex=-1;
    const p=document.createElement('p');p.textContent=text;
    const close=document.createElement('button');close.type='button';close.className='btn';close.textContent='Cerrar ayuda';
    close.onclick=()=>{panel.hidden=true;button.setAttribute('aria-expanded','false');button.focus({preventScroll:true});};
    panel.append(heading,p,close);main.prepend(panel);
  }
  function execution(m) {
    if (!m || state.screen !== 'execute' || state.execMode !== 'day') return;
    const p=selectedPeriod(m);if(!p)return;
    const bar=document.querySelector('.v3-stagebar');
    picker(bar,'riggoStagePicker','Etapa del día');
    if (state.execTab === 'report') picker(document.querySelector('.v3-report-nav'),'riggoReportPicker','Paso del reporte');
    if (['progress','transport','rd','ru'].includes(state.execTab) && bar && !E('riggo1241PlanNote')) {
      const details=document.createElement('details');details.id='riggo1241PlanNote';details.className='riggo-plan-reference';
      const summary=document.createElement('summary');
      const clock=planClock(m,p),hours=Math.max(0,(Date.parse(p.end)-Date.parse(p.start))/3600000);
      summary.textContent='Corte de '+new Intl.NumberFormat('es-CO',{maximumFractionDigits:2}).format(hours)+' h · Referencia del plan';
      const note=document.createElement('p');note.textContent=planClockNote(m,p);details.append(summary,note);
      bar.insertAdjacentElement('afterend',details);
    }
    if (state.execTab === 'transport') {
      const host=document.querySelector('.v43-load-scope-strip') || document.querySelector('.main .grid.g4');
      if (host && !host.querySelector('.riggo1241-transport-summary')) {
        host.innerHTML=loadScopes(m).map(scope=>{
          const q=scopeCounts(m,scope,p);
          return '<div class="kpi riggo1241-transport-summary"><span>'+enc(scope)+'</span><b>'+q.moved+' / '+q.total+'</b><small>'+Math.round(q.movedPct)+' % movilizadas</small><div class="riggo1241-load-detail">'+q.loaded+' cargadas · '+q.inTransit+' en tránsito<br>'+q.pos+' posicionadas · '+Math.round(q.positionedPct)+' % RM físico</div></div>';
        }).join('');
      }
    }
    const change=E('v3ChangeMove'),reset=E('riggo1235ResetMove');
    if(change && !change.closest('.riggo-move-tools')) {
      const more=document.createElement('details');more.className='riggo-move-tools';
      const summary=document.createElement('summary');summary.textContent='Más acciones';
      const list=document.createElement('div');list.className='riggo-move-tools-list';more.append(summary,list);change.before(more);
      if(reset)list.appendChild(reset);list.appendChild(change);
    } else if(reset && change?.closest('.riggo-move-tools') && !reset.closest('.riggo-move-tools')) {
      change.parentElement.prepend(reset);
    }
    for(const svg of document.querySelectorAll('svg.chart-svg')) {
      svg.setAttribute('role','img');const card=svg.closest('.chart-card');svg.setAttribute('aria-label',card?.querySelector('h3')?.textContent || 'Avance acumulado: plan y reportado');
    }
  }
  function validation() {
    const banner=document.querySelector('.v61-validation-banner');
    for(const el of document.querySelectorAll('[data-riggo-ui-invalid]')) {
      if(!el.classList.contains('v61-required-error') || !banner) {
        el.removeAttribute('aria-invalid');el.removeAttribute('aria-errormessage');
        el.setAttribute('aria-describedby',(el.getAttribute('aria-describedby') || '').split(/\s+/).filter(id=>id!=='riggoValidationError').join(' '));
        delete el.dataset.riggoUiInvalid;
      }
    }
    if(!banner)return;
    banner.id='riggoValidationError';banner.setAttribute('role','alert');banner.setAttribute('aria-atomic','true');
    for(const el of document.querySelectorAll('.v61-required-error')) {
      el.setAttribute('aria-invalid','true');el.setAttribute('aria-errormessage',banner.id);el.dataset.riggoUiInvalid='true';
      const described=new Set((el.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean));described.add(banner.id);el.setAttribute('aria-describedby',[...described].join(' '));
    }
    if(!banner.dataset.riggoUiFocus) {
      banner.dataset.riggoUiFocus='true';const view=viewKey();
      setTimeout(()=>{
        if(!banner.isConnected || view!==viewKey())return;
        const current=document.activeElement;
        if(current?.matches('input,select,textarea') && !current.classList.contains('v61-required-error'))return;
        let first=document.querySelector('.v61-required-error');
        if(first?.tagName==='CANVAS')first=document.querySelector('.riggo124-sign-upload');
        if(visible(first)){first.focus({preventScroll:true});first.scrollIntoView({block:'center',behavior:'auto'});}
      },100);
    }
  }
  function focusable(dialog) {
    return [...dialog.querySelectorAll('input:not([type=hidden]):not(:disabled),select:not(:disabled),textarea:not(:disabled),button:not(:disabled),[tabindex="0"]')].filter(el=>visible(el)&&!el.closest('[inert]'));
  }
  function syncDialogs() {
    const sheet=document.querySelector('#sheetRoot .sheet'),quarter=E('riggoQuarterOverlay')?.querySelector('[role=dialog]');
    const dialogs=[sheet,quarter].filter(Boolean);
    const app=E('app');if(app)app.inert=!!dialogs.length;
    if(E('sheetRoot'))E('sheetRoot').inert=!!quarter;
    let common=0;while(common<dialogs.length&&common<dialogFrames.length&&dialogs[common]===dialogFrames[common].dialog)common++;
    let restore=null;
    while(dialogFrames.length>common)restore=dialogFrames.pop();
    if(restore) {
      if(visible(restore.trigger)&&!restore.trigger.disabled&&!restore.trigger.closest('[inert]'))restore.trigger.focus({preventScroll:true});
      else restoreFocus(restore.snapshot,{force:true});
    }
    for(let i=common;i<dialogs.length;i++) {
      const dialog=dialogs[i],trigger=findFocus(W.__riggoUILastTrigger)||document.activeElement;
      dialogFrames.push({dialog,trigger,snapshot:captureFocus(trigger)});
    }
    for(const dialog of dialogs) {
      dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');
      const title=dialog.querySelector('h2,h3');if(title){title.id=title.id||(dialog===quarter?'riggoUIQuarterTitle':'riggoUIDialogTitle');dialog.setAttribute('aria-labelledby',title.id);}
      labelFields(dialog);
    }
    const active=dialogs.at(-1);
    if(active&&!active.contains(document.activeElement))focusable(active)[0]?.focus();
  }
  function planResourcesUI() {
    if(route()!=='plan')return;
    const panels=new Set([...document.querySelectorAll('#app [data-addres]')].map(b=>b.closest('.panel')));
    const hse=E('hseEmergency')?.closest('.panel');if(hse)panels.add(hse);
    for(const panel of panels) {
      if(!panel||panel.closest('.riggo-plan-resource'))continue;
      const title=panel.querySelector('h2')?.textContent||'Recursos';
      const key=panel.querySelector('[data-addres]')?.dataset.addres||'hse';
      const rows=panel.querySelectorAll('.editor-row').length;
      const detail=document.createElement('details');detail.className='riggo-plan-resource';detail.dataset.riggoDisclosure='plan-resource-'+key;
      const summary=document.createElement('summary');summary.textContent=title+' · '+(rows?rows+' registros':'3 apartados')+' · Revisar o editar';
      panel.before(detail);detail.append(summary,panel);
    }
  }
  function opsViewer() {
    if(route()!=='review'||state.reportView!=='f0065')return;
    const wrap=document.querySelector('#app .f0065-wrap');if(!wrap||wrap===opsWrap)return;
    const pages=[...wrap.children].filter(p=>p.classList.contains('f0065-page'));if(!pages.length)return;
    opsWrap=wrap;
    for(const old of document.querySelectorAll('#app .riggo-ops-tools'))old.remove();
    const previous=wrap.closest('.riggo-ops-viewport');if(previous){previous.before(wrap);previous.remove();}
    const memoKey=viewKey(),memo=opsSelections.get(memoKey)||{page:0,fit:false};
    const toolbar=document.createElement('div');toolbar.className='riggo-ops-tools';
    const label=document.createElement('label');label.className='riggo-field-label';label.textContent='Página del OPS';
    const select=document.createElement('select');select.id='riggoOPSPage';select.className='field';
    pages.forEach((page,i)=>{const option=document.createElement('option');option.value=String(i);option.textContent='Página '+(i+1)+' de '+pages.length;select.append(option);page.setAttribute('role','group');page.setAttribute('aria-label',option.textContent+' · OPS-F0065-S');});
    label.append(select);
    const size=document.createElement('button');size.id='riggoOPSSize';size.type='button';size.className='btn';size.textContent='Ajustar al ancho';size.setAttribute('aria-pressed','false');
    const note=document.createElement('p');note.className='riggo-ops-note';note.id='riggoOPSNote';note.textContent='Revisa cada sección y sus anexos usando el selector de páginas. Desplaza el documento horizontalmente para ver todas las columnas, o ajusta al ancho.';
    select.setAttribute('aria-describedby',note.id);toolbar.append(label,size,note);
    const viewport=document.createElement('div');viewport.className='riggo-ops-viewport';viewport.tabIndex=0;viewport.setAttribute('role','region');viewport.setAttribute('aria-label','Vista previa del OPS');viewport.setAttribute('aria-describedby',note.id);
    wrap.before(toolbar,viewport);viewport.append(wrap);let fit=memo.fit;select.value=String(Math.min(pages.length-1,memo.page));
    size.setAttribute('aria-pressed',String(fit));size.textContent=fit?'Tamaño original':'Ajustar al ancho';
    const adjust=()=>{wrap.style.zoom=fit?String(Math.min(1,viewport.clientWidth/Math.max(1,wrap.offsetWidth))):'1';};
    const show=()=>{pages.forEach((page,i)=>{const inactive=i!==Number(select.value);page.classList.toggle('riggo-ops-page-inactive',inactive);if(inactive)page.setAttribute('aria-hidden','true');else page.removeAttribute('aria-hidden');});viewport.scrollLeft=0;adjust();};
    select.onchange=()=>{opsSelections.set(memoKey,{page:Number(select.value),fit});show();announce(select.selectedOptions[0].textContent);};
    size.onclick=()=>{fit=!fit;opsSelections.set(memoKey,{page:Number(select.value),fit});size.setAttribute('aria-pressed',String(fit));size.textContent=fit?'Tamaño original':'Ajustar al ancho';adjust();};
    const observer=new ResizeObserver(()=>{if(!viewport.isConnected){observer.disconnect();return;}adjust();});observer.observe(viewport);show();
  }
  function decorate() {
    try {
      regions();const r=route();document.body.dataset.riggoRoute=r;document.body.dataset.riggoUi='1242';
      for(const name of [...document.body.classList])if(name.startsWith('v5-route-') && name!=='v5-route-'+r)document.body.classList.remove(name);
      document.body.classList.add('v5-route-'+r);
      const main=document.querySelector('main');if(main){main.id='riggoMain';main.tabIndex=-1;}
      const host=E('app');if(host){labelFields(host);describeButtons(host);}
      for(const nav of document.querySelectorAll('.v3-stagebar,.v3-report-nav,.side-nav,.v106-tabs,.v4-admin-tabs')) {
        nav.setAttribute('aria-label',nav.classList.contains('v3-stagebar')?'Etapas del día':nav.classList.contains('v3-report-nav')?'Pasos del reporte':nav.classList.contains('side-nav')?'Pasos del plan':'Vistas disponibles');
        for(const b of nav.querySelectorAll('button'))if(b.classList.contains('active'))b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');
      }
      if(r==='plan')picker(document.querySelector('.side-nav'),'riggoPlanPicker','Paso del plan');
      execution(currentMove());planResourcesUI();opsViewer();helpPanel();validation();syncDialogs();
      for(const detail of document.querySelectorAll('details[data-riggo-disclosure]')) {
        const key=viewKey()+'|'+detail.dataset.riggoDisclosure;
        if(!detail.dataset.riggoUiDisclosure) {
          detail.dataset.riggoUiDisclosure='true';if(disclosureState.has(key) && !(detail.classList.contains('riggo-resource-review') && !detail.closest('.readonly')))detail.open=disclosureState.get(key);
          detail.addEventListener('toggle',()=>disclosureState.set(key,detail.open));
        }
      }
      lastError=null;
    } catch(error) {lastError=String(error);console.warn('RigGO interface',error);}
  }
  function schedule() {if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;decorate();});}
  function insertionTarget() {
    if(!pendingInsertion || pendingInsertion.view!==viewKey())return null;
    const items=[...document.querySelectorAll(pendingInsertion.selector)];
    if(items.length<=pendingInsertion.count)return null;
    pendingInsertion=null;return items.at(-1);
  }
  const base=W.render;
  W.render=function() {
    const snapshot=captureFocus(),previous=lastView;
    const result=base.apply(this,arguments);decorate();
    requestAnimationFrame(()=>{
      decorate();const inserted=insertionTarget();
      if(inserted){inserted.focus();inserted.scrollIntoView({block:'nearest',behavior:'auto'});}
      else if(previous && previous!==viewKey() && document.activeElement===document.body) {
        const heading=document.querySelector('#riggoMain h1') || E('riggoMain');
        if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}
      } else restoreFocus(snapshot);
      lastView=viewKey();
    });
    return result;
  };
  const login=W.renderLogin;
  W.renderLogin=function(){const result=login.apply(this,arguments);decorate();lastView=viewKey();return result;};
  W.addEventListener('click',e=>{
    const control=e.target.closest?.('button,input,label.btn,summary');
    if(control)W.__riggoUILastTrigger=captureFocus(control);
    const add=e.target.closest?.('#addParticipant,[data-addres],#addMilestone');
    if(add) {
      const selector=add.id==='addParticipant'?'[data-part][data-k="name"]':add.id==='addMilestone'?'[data-ms][data-k="name"]':'[data-res="'+add.dataset.addres+'"][data-k="type"],[data-res="'+add.dataset.addres+'"][data-k="company"]';
      pendingInsertion={selector,count:document.querySelectorAll(selector).length,view:viewKey()};
    }
    const edit=e.target.closest?.('[data-riggo-edit-resource]');
    if(edit) {
      e.preventDefault();e.stopImmediatePropagation();
      const block=edit.closest('.v3-resource'),box=block?.querySelector('[data-v3-carry]');
      if(box)disclosureState.delete(viewKey()+'|'+box.dataset.v3Carry);
      if(box){box.checked=false;box.dispatchEvent(new Event('change',{bubbles:true}));requestAnimationFrame(()=>{decorate();block?.querySelector('input:not([type=checkbox]):not(:disabled),textarea:not(:disabled),select:not(:disabled)')?.focus();});}
      return;
    }
    const undo=e.target.closest?.('[data-riggo-undo-load]');
    if(undo){e.preventDefault();e.stopImmediatePropagation();W.RigGO1237?.undoLoad?.(currentMove(),selectedPeriod(currentMove()),undo.dataset.riggoUndoLoad,undo);return;}
    const remove=e.target.closest?.('[data-v3-delphoto],#clearSignature,[data-deleteevent],[data-delres],[data-delms]');
    if(remove && !remove.disabled) {
      if(remove.id==='clearSignature' && !currentMove()?.exec?.closures?.[currentMove()?.exec?.selectedPeriodId]?.signature)return;
      const item=remove.hasAttribute('data-v3-delphoto')?'esta foto del reporte actual':remove.id==='clearSignature'?'la firma del reporte actual':remove.hasAttribute('data-deleteevent')?'este evento de Flat Time':remove.hasAttribute('data-delms')?'este hito':'este recurso';
      if(!confirm('¿Quitar '+item+'? Revisa que sea el registro correcto antes de continuar.')){e.preventDefault();e.stopImmediatePropagation();}
    }
  },true);
  W.addEventListener('keydown',e=>{
    const dialog=E('riggoQuarterOverlay')?.querySelector('[role=dialog]') || document.querySelector('#sheetRoot .sheet');
    if(!dialog)return;
    const items=focusable(dialog);
    if(e.key==='Escape') {
      e.preventDefault();e.stopImmediatePropagation();
      const cancel=dialog.querySelector('#riggoQuarterCancel,#riggo1235ResetCancel,#cancelSheet,[id$="Cancel"],[id*="cancel"]');
      if(cancel?.disabled){announce('La operación está en curso. Espera a que termine.',true);return;}
      if(cancel)cancel.click();else if(!E('riggoQuarterOverlay'))closeSheet();
    } else if(e.key==='Tab') {
      const first=items[0],last=items.at(-1);
      if(e.shiftKey && (document.activeElement===first || !dialog.contains(document.activeElement))){e.preventDefault();e.stopImmediatePropagation();last?.focus();}
      else if(!e.shiftKey && (document.activeElement===last || !dialog.contains(document.activeElement))){e.preventDefault();e.stopImmediatePropagation();first?.focus();}
    }
  },true);
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true,characterData:true});
  W.RigGOUI={decorate,captureFocus,restoreFocus,announce,viewKey,selfCheck:()=>({ok:!lastError,release:'12.4.2',lastError})};
  W.RigGO1242=W.RigGO1241={decorate,planClock,currentPlanPcts,scopeCounts,statusAt,
    selfCheck:()=>({ok:!!W.RigGO124 && !!W.supabase && !!W.html2canvas && !!W.jspdf?.jsPDF && !lastError,
      release:'12.4.2',transport:['Cargada','En tránsito','Posicionada'],plan:'elapsed-hours'})};
  Object.assign(W.RigGOTest || {},{currentPlanPcts,scopeCounts,statusAt});
  decorate();lastView=viewKey();
})();
