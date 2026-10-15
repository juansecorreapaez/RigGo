/* Corporate domains are additive. Account approval and existing Move permissions
   remain required; a domain match never grants access by itself. */
(() => {
  'use strict';
  const domains = Object.freeze(['nabors.com', 'sanad.com']);
  const normalize = value => String(value || '').trim().toLowerCase();
  function isCorporateEmail(value) {
    const email = normalize(value);
    if (email.length > 254) return false;
    const parts = email.split('@');
    if (parts.length !== 2 || !domains.includes(parts[1])) return false;
    const local = parts[0];
    return local.length > 0 && local.length <= 64 &&
      /^[a-z0-9._%+-]+$/.test(local) && !local.startsWith('.') &&
      !local.endsWith('.') && !local.includes('..');
  }
  window.RigGOIdentity = Object.freeze({ domains, normalize, isCorporateEmail });
})();
