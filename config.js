/* Configuration centrale du jeu.
   Modifier ce fichier suffit pour ajuster la difficulté et les couleurs. */
(() => {
  "use strict";

  window.Snake = window.Snake || {};

  function block(topLeftX, topLeftY, width, height) {
    const cells = [];
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        cells.push({ x: topLeftX + x, y: topLeftY + y });
      }
    }
    return cells;
  }

  const obstacles = [
    ...block(5, 5, 2, 2),
    ...block(13, 5, 2, 2),
    ...block(5, 13, 2, 2),
    ...block(13, 13, 2, 2),
  ];

  window.Snake.Config = Object.freeze({
    cols: 20,
    rows: 20,
    cellSize: 24,

    startLength: 3,
    startHead: Object.freeze({ x: 10, y: 10 }),

    tickStartMs: 150,
    tickMinMs: 70,
    tickStepMs: 4,
    maxPendingTurns: 2,
    restartLockMs: 300,

    scorePad: 3,
    storageBestKey: "snakeArcade.best",

    obstacles: Object.freeze(obstacles.map((cell) => Object.freeze(cell))),

    colors: Object.freeze({
      board: "#050907",
      grid: "rgba(61, 255, 160, 0.055)",
      gridStrong: "rgba(61, 255, 160, 0.11)",
      snakeHead: "#b6ffd9",
      snakeEye: "#04140b",
      food: "#ff4d67",
      foodGlow: "rgba(255, 77, 103, 0.55)",
      foodLeaf: "#5dff9f",
      obstacleFill: "#14202b",
      obstacleHatch: "rgba(93, 127, 156, 0.22)",
      obstacleEdge: "rgba(93, 127, 156, 0.55)",
    }),
  });
})();
