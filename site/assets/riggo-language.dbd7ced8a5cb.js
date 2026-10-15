/* Preference is account-scoped in Supabase Auth metadata; local intent survives offline use. */
(() => {
  'use strict';
  const I=window.RigGOI18n, SB=window.RigGOSupabase, prefix='riggo-language-v1:';
  let user=null, epoch=0, checking=null, syncing=null, dialog=null, requestedUser='';
  const memory=new Map();
  function read(id){try{return JSON.parse(localStorage.getItem(prefix+id)||'null')||memory.get(id)||null}catch(_){return memory.get(id)||null}}
  function write(id,record){memory.set(id,record);try{localStorage.setItem(prefix+id,JSON.stringify(record))}catch(_){}}
  function active(u){return !!u?.id&&!!state.auth?.logged&&!!currentUser()?.active&&String(state.auth.email||'').toLowerCase()===String(u.email||'').toLowerCase()&&!window.__RIGGO_PASSWORD_RECOVERY_ACTIVE__}
  function updateControls(){for(const control of document.querySelectorAll('[data-riggo-language]'))control.value=I.language;}
  function values(){return [...document.querySelectorAll('#app input,#app textarea,#app select')].filter(e=>e.type!=='file').map((e,i)=>({id:e.id,index:i,value:e.value,checked:e.checked,start:e.selectionStart,end:e.selectionEnd}));}
  function restore(saved){const inputs=[...document.querySelectorAll('#app input,#app textarea,#app select')].filter(e=>e.type!=='file');for(const item of saved){const e=item.id?document.getElementById(item.id):inputs[item.index];if(e&&e.id!=='riggoLanguage'){e.value=item.value;e.checked=item.checked;}}}
  function apply(language,{render=true}={}){
    const saved=values(),y=scrollY;
    try{if(state.screen==='plan'&&typeof capturePlan==='function')capturePlan(currentMove(),false)}catch(_){}
    // The field core defers renders while an editor owns focus. Commit the current
    // values before releasing focus so changing language can render immediately.
    if(render)document.activeElement?.blur?.();
    I.setLanguage(language);
    if(render){window.render?.();restore(saved);requestAnimationFrame(()=>scrollTo(0,y));}
    decorate();updateControls();
  }
  async function saveProfile(session,data){
    // Bind the write to the captured owner's JWT. A shared SDK session can
    // change in another tab between getSession() and a later updateUser().
    if(!session?.access_token)return {error:true,data:{user:null}};
    const response=await fetch(String(SB.supabaseUrl).replace(/\/$/,'')+'/auth/v1/user',{
      method:'PUT',credentials:'omit',cache:'no-store',
      headers:{apikey:SB.supabaseKey,Authorization:`Bearer ${session.access_token}`,'Content-Type':'application/json'},
      body:JSON.stringify({data})
    });
    const payload=await response.json().catch(()=>null);
    return {error:!response.ok,data:{user:response.ok?(payload?.user||payload):null}};
  }
  async function syncPreference(){
    if(syncing)return syncing;
    const ownerAtStart=user?.id;
    syncing=(async()=>{
      while(user&&active(user)&&navigator.onLine!==false){
        const id=user.id,record=read(id);if(!record?.pending)return;
        const session=await SB.auth.getSession();if(session.error||session.data?.session?.user?.id!==id)return;
        const result=await saveProfile(session.data.session,{riggo_language:record.language,riggo_language_selected:true,riggo_language_updated_at:record.updatedAt});
        if(result.error||result.data?.user?.id!==id){if(active(user)&&user.id===id)toast(I.language==='en'?'Language saved on this device. Account sync will retry when you reconnect.':'Idioma guardado en este dispositivo. Se reintentará la sincronización al reconectar.');return;}
        const latest=read(id);
        if(latest?.updatedAt===record.updatedAt)write(id,{...record,pending:false});
        if(!active(user)||user.id!==id)return;
      }
    })().catch(()=>{}).finally(()=>{
      syncing=null;
      // A choice made by the next signed-in user must not get stranded behind
      // the previous user's in-flight request. Failed requests for the same
      // user wait for reconnect; they never start an immediate retry loop.
      if(user?.id!==ownerAtStart&&active(user)&&read(user.id)?.pending&&navigator.onLine!==false)queueMicrotask(syncPreference);
    });
    return syncing;
  }
  function choose(language){
    if(!active(user)){apply(language);return;}
    const at=Math.max(Date.now(),(Date.parse(read(user.id)?.updatedAt||'')||0)+1);
    const record={language:language==='en'?'en':'es',selected:true,updatedAt:new Date(at).toISOString(),pending:true};
    write(user.id,record);requestedUser='';if(dialog){dialog.close();dialog.remove();dialog=null;}
    apply(record.language);syncPreference();
  }
  function prompt(){
    if(!active(user)||dialog||requestedUser===user.id)return;
    requestedUser=user.id;dialog=document.createElement('dialog');dialog.id='riggo-language-dialog';dialog.setAttribute('aria-labelledby','riggoLanguageTitle');
    dialog.innerHTML='<h1 id="riggoLanguageTitle">Elige tu idioma<br>Choose your language</h1><p>Usaremos este idioma en RigGO.<br>We will use this language in RigGO.</p><div class="riggo-language-options"><label><input type="radio" name="riggo-first-language" value="es">Español</label><label><input type="radio" name="riggo-first-language" value="en">English</label></div><button type="button" class="btn primary" id="riggoLanguageContinue">Continuar / Continue</button><span class="riggo-language-hint">Puedes cambiarlo arriba cuando quieras.<br>You can change it at the top at any time.</span>';
    document.body.appendChild(dialog);dialog.querySelector(`[value="${I.language}"]`).checked=true;
    dialog.addEventListener('cancel',e=>e.preventDefault());
    dialog.querySelector('button').onclick=()=>choose(dialog.querySelector('input:checked').value);
    dialog.showModal();
  }
  function acceptUser(next,{fresh=false}={}){
    if(!active(next))return;
    const changed=user?.id!==next.id;user=next;if(changed){epoch++;requestedUser='';if(dialog){dialog.close();dialog.remove();dialog=null;}}
    const local=read(user.id),remote=next.user_metadata||{};
    let preference=local;
    if(['es','en'].includes(remote.riggo_language)&&remote.riggo_language_selected===true && !local?.pending && (!local?.selected||fresh||String(remote.riggo_language_updated_at||'')>String(local.updatedAt||''))){
      preference={language:remote.riggo_language,selected:true,pending:false,updatedAt:remote.riggo_language_updated_at||''};write(user.id,preference);
    }
    if(preference?.selected){if(I.language!==preference.language)apply(preference.language);syncPreference();}
    else prompt();
  }
  async function refresh({force=false}={}){
    if(!state.auth?.logged){if(user){user=null;epoch++;requestedUser='';if(dialog){dialog.close();dialog.remove();dialog=null;}I.setLanguage(/^en\b/i.test(navigator.language||'')?'en':'es');}return;}
    if(user&&active(user)&&!force){if(!read(user.id)?.selected)prompt();return;}
    if(checking||!SB)return;
    const generation=epoch,wantedEmail=state.auth.email;
    checking=(async()=>{
      const result=await SB.auth.getSession();let next=result.data?.session?.user,verified=false;
      if(next?.id&&navigator.onLine!==false&&!read(next.id)?.pending){
        const before=read(next.id)?.updatedAt;
        const fresh=await Promise.race([SB.auth.getUser().catch(()=>null),new Promise(resolve=>setTimeout(()=>resolve(null),3000))]);
        if(fresh?.data?.user?.id===next.id){next=fresh.data.user;verified=read(next.id)?.updatedAt===before;}
      }
      if(generation===epoch)acceptUser(next,{fresh:verified});
    })().catch(()=>{}).finally(()=>{checking=null;if(state.auth?.logged&&state.auth.email!==wantedEmail)queueMicrotask(()=>refresh({force:true}));});
    return checking;
  }
  function decorate(){
    const actions=document.querySelector('.top-actions');
    if(actions&&!actions.querySelector('[data-riggo-language]')){
      const label=document.createElement('label');label.className='riggo-language-switch';
      label.innerHTML='<select id="riggoLanguage" data-riggo-language aria-label="Idioma / Language"><option value="es">Español</option><option value="en">English</option></select>';
      actions.prepend(label);label.querySelector('select').onchange=e=>choose(e.target.value);
    }
    updateControls();queueMicrotask(refresh);
  }
  for(const name of ['render','renderLogin']){
    const base=window[name];if(typeof base==='function')window[name]=function(...args){const result=base.apply(this,args);decorate();return result;};
  }
  SB?.auth.onAuthStateChange((event,session)=>{setTimeout(()=>{if(event==='SIGNED_OUT'){user=null;epoch++;requestedUser='';if(dialog){dialog.close();dialog.remove();dialog=null;}I.setLanguage(/^en\b/i.test(navigator.language||'')?'en':'es');}else refresh({force:true});},0);});
  window.addEventListener('online',()=>syncPreference());
  window.RigGOLanguage={choose,refresh,sync:syncPreference,acceptUser,get userId(){return user?.id||null},get preference(){return user?read(user.id):null}};
  decorate();
})();
