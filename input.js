/* Entrées clavier, tactile (swipe) et croix directionnelle.
   Ce module traduit les gestes en intentions ; la validation des
   virages reste dans core/direction.js. */
(() => {
  "use strict";

  window.Snake = window.Snake || {};

  const KEY_TO_DIRECTION = Object.freeze({
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
    KeyW: "up",
    KeyA: "left",
    KeyS: "down",
    KeyD: "right",
  });

  let canvas = null;
  let handlers = {};
  let swipe = null;

  function isButtonTarget(target) {
    return Boolean(target && (target.tagName === "BUTTON" || target.tagName === "INPUT"));
  }

  function onKeyDown(event) {
    if (event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }

    if (event.code === "Space" || event.code === "Enter" || event.code === "NumpadEnter") {
      if (isButtonTarget(event.target)) {
        return;
      }
      event.preventDefault();
      if (!event.repeat) {
        handlers.onPrimary();
      }
      return;
    }

    const direction = KEY_TO_DIRECTION[event.code];
    if (!direction) {
      return;
    }

    event.preventDefault();
    handlers.onTurn(direction);
  }

  function onPointerDown(event) {
    if (!event.isPrimary) {
      return;
    }
    swipe = { id: event.pointerId, x: event.clientX, y: event.clientY };
    if (canvas.setPointerCapture) {
      canvas.setPointerCapture(event.pointerId);
    }
  }

  function onPointerUp(event) {
    if (!swipe || event.pointerId !== swipe.id) {
      return;
    }

    const dx = event.clientX - swipe.x;
    const dy = event.clientY - swipe.y;
    swipe = null;

    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    if (Math.max(absX, absY) < 24) {
      return;
    }

    if (absX > absY) {
      handlers.onTurn(dx > 0 ? "right" : "left");
    } else {
      handlers.onTurn(dy > 0 ? "down" : "up");
    }
  }

  function init(options) {
    canvas = options.canvas;
    handlers = options;

    window.addEventListener("keydown", onKeyDown);

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", () => {
      swipe = null;
    });
    canvas.addEventListener("contextmenu", (event) => {
      event.preventDefault();
    });

    document.querySelectorAll("[data-dir]").forEach((button) => {
      button.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        handlers.onTurn(button.dataset.dir);
      });
      button.addEventListener("click", (event) => {
        // Un clic clavier (Entrée) a detail === 0 ; le tactile est déjà
        // traité par pointerdown pour éviter un double virage.
        if (event.detail === 0) {
          handlers.onTurn(button.dataset.dir);
        }
      });
      button.addEventListener("contextmenu", (event) => {
        event.preventDefault();
      });
    });
  }

  window.Snake.Input = Object.freeze({ init });
})();
