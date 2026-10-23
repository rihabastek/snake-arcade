/* Interface : score, record, écran superposé et annonces accessibles. */
(() => {
  "use strict";

  window.Snake = window.Snake || {};

  const cfg = window.Snake.Config;
  const elements = {};

  function init(handlers) {
    elements.score = document.getElementById("score");
    elements.best = document.getElementById("best");
    elements.pause = document.getElementById("pauseBtn");
    elements.overlay = document.getElementById("overlay");
    elements.eyebrow = document.getElementById("overlayEyebrow");
    elements.title = document.getElementById("overlayTitle");
    elements.text = document.getElementById("overlayText");
    elements.action = document.getElementById("overlayBtn");
    elements.status = document.getElementById("status");

    elements.pause.addEventListener("click", handlers.onPause);
    elements.action.addEventListener("click", handlers.onAction);
  }

  function pad(value) {
    return String(value).padStart(cfg.scorePad, "0");
  }

  function setScores(score, best) {
    elements.score.textContent = pad(score);
    elements.best.textContent = pad(best);
  }

  function setPause({ disabled = false, label = "PAUSE" }) {
    elements.pause.disabled = disabled;
    elements.pause.textContent = label;
    elements.pause.setAttribute(
      "aria-label",
      label === "PAUSE" ? "Mettre la partie en pause" : "Reprendre la partie"
    );
  }

  function showOverlay({ title, text, action, mode = "info" }) {
    elements.eyebrow.textContent = "Snake // Arcade";
    elements.title.textContent = title;
    elements.text.textContent = text;
    elements.action.textContent = action;
    elements.overlay.dataset.mode = mode;
    elements.overlay.hidden = false;
    elements.action.focus({ preventScroll: true });
  }

  function hideOverlay() {
    const active = document.activeElement;
    elements.overlay.hidden = true;
    // Sans cela, le bouton caché garderait le focus et intercepterait Espace.
    if (active && elements.overlay.contains(active) && typeof active.blur === "function") {
      active.blur();
    }
  }

  function announce(message) {
    elements.status.textContent = "";
    window.setTimeout(() => {
      elements.status.textContent = message;
    }, 30);
  }

  window.Snake.Hud = Object.freeze({
    init,
    setScores,
    setPause,
    showOverlay,
    hideOverlay,
    announce,
  });
})();
