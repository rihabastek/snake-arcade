/* Cœur du jeu : état, pas de simulation, collisions, score.
   Aucun accès au DOM ni au Canvas. */
(() => {
  "use strict";

  window.Snake = window.Snake || {};

  const cfg = window.Snake.Config;

  function createState(rng = Math.random) {
    const head = cfg.startHead;
    const snake = [];
    for (let i = 0; i < cfg.startLength; i += 1) {
      snake.push({ x: head.x - i, y: head.y });
    }

    const state = {
      snake,
      direction: { x: 1, y: 0 },
      pendingTurns: [],
      food: null,
      obstacles: cfg.obstacles.map((cell) => ({ x: cell.x, y: cell.y })),
      score: 0,
      status: "idle",
      tickMs: cfg.tickStartMs,
    };

    state.food = window.Snake.Food.spawn(state, rng);
    return state;
  }

  function wrap(value, max) {
    return ((value % max) + max) % max;
  }

  function step(state, rng = Math.random) {
    if (state.status !== "running") {
      return { type: "none" };
    }

    if (state.pendingTurns.length > 0) {
      state.direction = state.pendingTurns.shift();
    }

    const head = state.snake[0];
    const nextHead = {
      x: wrap(head.x + state.direction.x, cfg.cols),
      y: wrap(head.y + state.direction.y, cfg.rows),
    };

    const eating = state.food !== null && nextHead.x === state.food.x && nextHead.y === state.food.y;

    // Sans croissance, la queue libère sa case avant le test de collision.
    const occupied = eating ? state.snake : state.snake.slice(0, -1);
    const hitsSelf = occupied.some(
      (segment) => segment.x === nextHead.x && segment.y === nextHead.y
    );
    const hitsObstacle = state.obstacles.some(
      (cell) => cell.x === nextHead.x && cell.y === nextHead.y
    );

    if (hitsSelf || hitsObstacle) {
      state.status = "over";
      return { type: "die", reason: hitsObstacle ? "obstacle" : "self" };
    }

    state.snake.unshift(nextHead);

    if (!eating) {
      state.snake.pop();
      return { type: "move" };
    }

    state.score += 1;
    state.tickMs = Math.max(cfg.tickMinMs, cfg.tickStartMs - state.score * cfg.tickStepMs);
    state.food = window.Snake.Food.spawn(state, rng);

    if (!state.food) {
      state.status = "won";
      return { type: "win" };
    }

    return { type: "eat" };
  }

  window.Snake.Game = Object.freeze({ createState, step });
})();
