/* Authored scalar copy is localized, including labels held in arrays and helpers.
   Explicit data markers protect user content; attributes keep canonical values. */
(() => {
  'use strict';
  let language = /^en\b/i.test(navigator.language || '') ? 'en' : 'es';
  const missing = new Set(), catalog = window.RigGOTranslations || {};
  const normalize = s => String(s).replace(/\s+/g, ' ').trim();
  const defaults = new Set([
    'Inicio Parada de Tubería', 'OPS-064 Instrucciones de mudanza específicas para el Rig',
    'Supervisor del sitio', 'SIN ADELANTOS EN EL PERIODO.', 'SIN RETRASOS REPORTADOS EN EL PERIODO.',
    'SIN PENDIENTES DEL PLAN DEL DÍA.',
    ...Object.keys(catalog).filter(key=>key.startsWith('SE CUENTA CON ')||key.startsWith('EQUIPO DE PROTECCIÓN PERSONAL'))
  ]);
  const patterns = Object.entries(catalog).filter(([key]) => /\{\{\d+\}\}/.test(key) && key.replace(/\{\{\d+\}\}/g,'').trim().length > 2)
    .sort((a,b) => b[0].replace(/\{\{\d+\}\}/g,'').length - a[0].replace(/\{\{\d+\}\}/g,'').length)
    .map(([key,value]) => {
      const slots=[], escaped=key.split(/(\{\{\d+\}\})/g).map(part=>{
        const slot=/^\{\{(\d+)\}\}$/.exec(part);
        if(slot){slots.push(Number(slot[1]));return '(.+?)';}
        return part.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
      }).join('');
      return { re:new RegExp('^'+escaped+'$'), value, slots };
    });
  function translated(key) {
    if (Object.prototype.hasOwnProperty.call(catalog, key)) return catalog[key];
    const lower=key.toLocaleLowerCase('es');
    if (Object.prototype.hasOwnProperty.call(catalog, lower)) {
      const value=catalog[lower];
      return key===key.toLocaleUpperCase('es') ? value.toUpperCase() : value;
    }
    if(/[A-Za-zÁÉÍÓÚáéíóúñÑ]/.test(key))missing.add(key); return null;
  }
  function t(value) {
    if(language !== 'en' || typeof value !== 'string' || !value.trim()) return value;
    const key=normalize(value); let result=translated(key);
    if(result===null){
      for(const entry of patterns){const match=entry.re.exec(key);if(!match)continue;
        const values={};entry.slots.forEach((slot,i)=>{values[slot]=match[i+1];});
        result=entry.value.replace(/\{\{(\d+)\}\}/g,(_,slot)=>values[slot]??'');break;
      }
    }
    if(result===null && /(?: · |, |; )/.test(key)){
      const pieces=key.split(/( · |, |; )/),localized=pieces.map((part,i)=>i%2?part:t(part));
      if(localized.some((part,i)=>part!==pieces[i]))result=localized.join('');
    }
    return result===null?value:value.replace(value.trim(),result);
  }
  function pattern(text) {
    if(language !== 'en')return text;
    const tokens=[];
    const skeleton=text.replace(/\uE000(\d+)\uE001/g,match=>{tokens.push(match);return `{{${tokens.length-1}}}`});
    const key=normalize(skeleton),result=translated(key);
    if(result===null)return text;
    const converted=result.replace(/\{\{(\d+)\}\}/g,(_,i)=>tokens[Number(i)]||'');
    return skeleton.replace(skeleton.trim(),converted);
  }
  function markup(source) {
    // An option's canonical value must never change when its label is translated.
    source=source.replace(/<option\b([^>]*)>([^<]*)<\/option>/gi,(all,attributes,body)=>
      /\bvalue\s*=/.test(attributes)?all:`<option${attributes} value="${body.replace(/&/g,'&amp;').replace(/"/g,'&quot;')}">${body}</option>`);
    let protectedBlock=false;
    return source.split(/(<[^>]*>)/g).map(part=>{
      if(part.startsWith('<')) {
        if(/^<(?:script|style)\b/i.test(part))protectedBlock=true;
        if(/^<\/(?:script|style)\b/i.test(part))protectedBlock=false;
        return part.replace(/\b(placeholder|title|aria-label)=(['"])(.*?)\2/g,(all,attr,quote,copy)=>
          copy.includes('\uE000')?all:`${attr}=${quote}${t(copy).replace(/"/g,'&quot;').replace(/'/g,'&#39;')}${quote}`);
      }
      return protectedBlock ? part : pattern(part);
    }).join('');
  }
  function template(strings,values,html) {
    let source=strings.map((s,i)=>s+(i<values.length?`\uE000${i}\uE001`:'')).join('');
    source=html?markup(source):pattern(source);
    return source.replace(/\uE000(\d+)\uE001/g,(_,i,offset)=>{
      const value=values[Number(i)];
      const before=source.slice(0,offset),attribute=html&&before.lastIndexOf('<')>before.lastIndexOf('>');
      if(value?.__riggoData)return String(value.original??'');
      if(value?.__riggoDisplay)return String(attribute?value.original:value.localized);
      if(html&&!attribute&&typeof value==='string'&&!value.includes('<'))return t(value);
      return String(value??'');
    });
  }
  const api={
    t, data:value=>value?.__riggoData?value:({__riggoData:true,original:value}),
    defaultCopy:value=>defaults.has(normalize(value))?({__riggoDisplay:true,original:value,localized:t(value)}):({__riggoData:true,original:value}),
    display:value=>value?.__riggoDisplay?value:({__riggoDisplay:true,original:value,localized:t(value)}), h:(strings,...values)=>template(strings,values,true),
    msg:(strings,...values)=>template(strings,values,false), literal:markup,
    locale:()=>language==='en'?'en-US':'es-CO',
    get language(){return language},
    setLanguage(value){language=value==='en'?'en':'es';document.documentElement.lang=language;localizeStyleCopy();},
    missing:()=>[...missing], clearMissing:()=>missing.clear()
  };
  window.RigGOI18n=api;
  document.documentElement.lang=language;
  function localizeStyleCopy(){
    let style=document.getElementById('riggo-i18n-style-copy');
    if(!style){style=document.createElement('style');style.id='riggo-i18n-style-copy';document.head.append(style);}
    const rules=[];
    function collect(list){let result='';for(const rule of list){
      if(rule.selectorText&&rule.style){
        const content=rule.style.getPropertyValue('content'),match=/^(['"])(.*)\1$/.exec(content);
        if(!match)continue;const key=normalize(match[2]),copy=catalog[key];
        if(copy===undefined||copy===key)continue;
        const selectors=rule.selectorText.split(',').map(s=>'html[lang="en"] '+s.trim()).join(',');
        result+=selectors+'{content:'+JSON.stringify(copy)+' !important;}';
      }else if(rule.cssRules){const child=collect(rule.cssRules);if(child)result+=rule.cssText.slice(0,rule.cssText.indexOf('{')+1)+child+'}';}
    }return result;}
    for(const sheet of document.styleSheets){if(sheet.ownerNode===style)continue;try{rules.push(collect(sheet.cssRules));}catch(_){}}
    const css=rules.join('\n');if(style.textContent!==css)style.textContent=css;
  }
  document.addEventListener('DOMContentLoaded',localizeStyleCopy,{once:true});
  for(const name of ['alert','confirm']){
    const original=window[name].bind(window);window[name]=message=>original(t(message));
  }
})();
