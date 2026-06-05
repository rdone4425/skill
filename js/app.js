/* ==========================================
   bootstrap
   ========================================== */
(function () {
  'use strict';

  const hub = window.SkillHub = window.SkillHub || {};

  function finishInit() {
    hub.events.bindEvents();
    hub.render.renderAll();
    hub.events.setupI18nListener();
    hub.events.setupHistoryListener();
  }

  async function hydrateAndInit() {
    if (hub.data && typeof hub.data.loadIndex === 'function') {
      const indexData = await hub.data.loadIndex();
      hub.state.applyIndexData(indexData);
    }

    await hub.state.ensureDataForCurrentState();
    finishInit();

    if (hub.data && typeof hub.data.prefetchAllData === 'function' && hub.state.state.category !== 'all') {
      hub.data.prefetchAllData().catch(() => {});
    }
  }

  function init() {
    hub.state.cacheDom();
    hub.state.applyPersistedState();
    hub.i18n.applyI18n(hub.i18n.getLang());

    hydrateAndInit().catch(() => {
      finishInit();
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
