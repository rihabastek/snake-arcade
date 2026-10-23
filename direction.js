/* Validation des virages.
   La file d'intentions permet d'absorber deux appuis rapides sans
   jamais autoriser un demi-tour. */
(() => {
  "use strict";

  window.Snake = window.Snake || {};

  const VECTORS = Object.freeze({
    up: Object.freeze({ x: 0, y: -1 }),
    down: Object.freeze({ x: 0, y: 1 }),
    left: Object.freeze({ x: -1, y: 0 }),
    right: Object.freeze({ x: 1, y: 0 }),
  });

  function same(a, b) {
    return a.x === b.x && a.y === b.y;
  }

  function isOpposite(a, b) {
    return a.x === -b.x && a.y === -b.y;
  }

  function turn(state, name) {
    const next = VECTORS[name];
    if (!next || state.status !== "running") {
      return false;
    }

    const reference =
      state.pendingTurns.length > 0
        ? state.pendingTurns[state.pendingTurns.length - 1]
        : state.direction;

    if (same(next, reference) || isOpposite(next, reference)) {
      return false;
    }

    if (state.pendingTurns.length >= window.Snake.Config.maxPendingTurns) {
      return false;
    }

    state.pendingTurns.push(next);
    return true;
  }

  window.Snake.Direction = Object.freeze({ VECTORS, turn, same, isOpposite });
})();
