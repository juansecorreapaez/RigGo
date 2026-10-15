/* RigGO 12.4.3: explicit transport stages and elapsed-hour plan context. */
(() => {
  'use strict';
  const W = window;
  function decorate() {
    const route = state.auth?.logged ? state.screen || 'home' : 'login';
    document.body.dataset.riggoRoute = route;
    for (const name of [...document.body.classList]) {
      if (name.startsWith('v5-route-') && name !== `v5-route-${route}`) document.body.classList.remove(name);
    }
    document.body.classList.add(`v5-route-${route}`);
    const m = currentMove();
    if (!m || state.screen !== 'execute' || state.execMode !== 'day') return;
    const p = selectedPeriod(m);
    if (!p) return;
    if (state.execTab === 'transport') {
      const host = document.querySelector('.v43-load-scope-strip') || document.querySelector('.main .grid.g4');
      if (host && !host.querySelector('.riggo1241-transport-summary')) {
        host.innerHTML = loadScopes(m).map(scope => {
          const q = scopeCounts(m, scope, p);
          return RigGOI18n.h`<div class="kpi riggo1241-transport-summary"><span>${RigGOI18n.display(enc(scope))}</span><b>${q.moved} / ${q.total}</b><small>${Math.round(q.movedPct)} % movilizadas</small><div class="riggo1241-load-detail">${q.loaded} cargadas acumuladas · ${q.loadedOnly} pendientes de salir<br>${q.inTransit} en tránsito · ${q.pos} posicionadas · ${Math.round(q.positionedPct)} % RM físico</div></div>`;
        }).join('');
      }
    }
    if (['progress', 'transport', 'rd', 'ru'].includes(state.execTab)) {
      const host = document.querySelector('.v3-stagebar');
      if (host && !document.getElementById('riggo1241PlanNote')) {
        const note = document.createElement('p');
        note.id = 'riggo1241PlanNote';
        note.className = 'riggo1241-plan-note';
        note.textContent = RigGOI18n.t(planClockNote(m, p));
        host.insertAdjacentElement('afterend', note);
      }
    }
  }
  const base = W.render;
  W.render = function () {
    const result = base.apply(this, arguments);
    decorate();
    requestAnimationFrame(decorate);
    return result;
  };
  // RenderLogin can be invoked by the auth authority outside render().
  const login = W.renderLogin;
  W.renderLogin = function () {
    const result = login.apply(this, arguments);
    decorate();
    return result;
  };
  W.RigGO1241 = { decorate, planClock, currentPlanPcts, scopeCounts, statusAt,
    selfCheck: () => ({ok: !!W.RigGO124 && !!W.supabase && !!W.html2canvas && !!W.jspdf?.jsPDF,
      release: '12.4.3', transport: ['Cargada', 'En tránsito', 'Posicionada'], plan: 'elapsed-hours'}) };
  Object.assign(W.RigGOTest || {}, {currentPlanPcts, scopeCounts, statusAt});
  decorate();
})();
