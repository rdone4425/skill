/* ==========================================
   bootstrap
   ========================================== */
(function () {
  'use strict';

  const hub = window.SkillHub = window.SkillHub || {};

  function finishInit() {
    hub.events.bindEvents();
    hub.render.setupActiveFiltersEvents();
    hub.render.renderAll();
    hub.events.setupI18nListener();
    hub.events.setupHistoryListener();
    // Initialize category quick entry chips
    if (hub._categoryQuick && typeof hub._categoryQuick.initCategoryQuickEntry === 'function') {
      hub._categoryQuick.initCategoryQuickEntry();
    }
    // Initialize behavior tracking
    if (hub._track && typeof hub._track.initBehaviorTracking === 'function') {
      hub._track.initBehaviorTracking();
    }
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
