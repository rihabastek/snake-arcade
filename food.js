/* Placement de la pomme : tirage uniforme parmi les cases libres.
   Aucune boucle de rejet, donc aucun risque de boucle infinie. */
(() => {
  "use strict";

  window.Snake = window.Snake || {};

  function key(x, y) {
    return `${x},${y}`;
  }

  function spawn(state, rng = Math.random) {
    const cfg = window.Snake.Config;
    const blocked = new Set();

    state.snake.forEach((segment) => blocked.add(key(segment.x, segment.y)));
    state.obstacles.forEach((cell) => blocked.add(key(cell.x, cell.y)));

    const free = [];
    for (let y = 0; y < cfg.rows; y += 1) {
      for (let x = 0; x < cfg.cols; x += 1) {
        if (!blocked.has(key(x, y))) {
          free.push({ x, y });
        }
      }
    }

    if (free.length === 0) {
      return null;
    }

    const index = Math.min(free.length - 1, Math.floor(rng() * free.length));
    return free[index];
  }

  window.Snake.Food = Object.freeze({ spawn });
})();
