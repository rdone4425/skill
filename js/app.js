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

  function hydrateAndInit(data) {
    hub.state.applyLoadedData(data);
    finishInit();
  }

  function init() {
    hub.state.cacheDom();
    hub.state.applyPersistedState();
    hub.i18n.applyI18n(hub.i18n.getLang());

    const data = window.SKILL_DATA || window.SKILLS_DATA;
    if (data) {
      hydrateAndInit(data);
      return;
    }

    if (window.SKILL_DATA_PROMISE && typeof window.SKILL_DATA_PROMISE.then === 'function') {
      window.SKILL_DATA_PROMISE
        .then(hydrateAndInit)
        .catch(() => {
          finishInit();
        });
      return;
    }

    finishInit();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
