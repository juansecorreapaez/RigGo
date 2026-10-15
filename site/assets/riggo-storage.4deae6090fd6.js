/* Durable database opening. Preserve existing stores and never downgrade/delete a DB. */
(() => {
  'use strict';
  const opened = new Map();
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  function supported() { try { return !!window.indexedDB; } catch (_) { return false; } }
  function requestDatabase(name, stores, version) {
    return new Promise((resolve, reject) => {
      let request, settled = false;
      const finish = (error, db) => {
        if (settled) { if (db) db.close(); return; }
        settled = true; clearTimeout(timer);
        error ? reject(error) : resolve(db);
      };
      const timer = setTimeout(() => finish(new DOMException('El almacenamiento está ocupado por otra pestaña. Cierra las otras pestañas de RigGO y reintenta.', 'TimeoutError')), 8000);
      try { request = version ? window.indexedDB.open(name, version) : window.indexedDB.open(name); }
      catch (error) { finish(error); return; }
      request.onupgradeneeded = () => {
        for (const [store, options] of Object.entries(stores)) {
          if (!request.result.objectStoreNames.contains(store)) request.result.createObjectStore(store, options);
        }
      };
      request.onerror = () => finish(request.error || new Error('No fue posible abrir el almacenamiento local.'));
      request.onsuccess = () => finish(null, request.result);
      request.onblocked = () => { /* bounded timer, never erase another tab's pending work */ };
    });
  }
  function open(name, stores) {
    if (opened.has(name)) return opened.get(name);
    const promise = (async () => {
      let lastError;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          let db = await requestDatabase(name, stores);
          if (Object.keys(stores).some(store => !db.objectStoreNames.contains(store))) {
            const version = db.version + 1; db.close();
            db = await requestDatabase(name, stores, version);
          }
          const forget = () => {if(opened.get(name)===promise)opened.delete(name);};
          db.onversionchange = () => { db.close(); forget(); };
          db.onclose = forget;
          return db;
        } catch (error) {
          lastError = error;
          if (!['UnknownError', 'AbortError', 'InvalidStateError'].includes(error?.name) || attempt === 2) break;
          await wait(150 * (attempt + 1));
        }
      }
      opened.delete(name); throw lastError;
    })();
    opened.set(name, promise);
    return promise;
  }
  window.RigGOStorage = {open, supported};
})();
