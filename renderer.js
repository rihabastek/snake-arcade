/* Rendu Canvas 2D : plateau, obstacles, pomme et serpent.
   Le rendu lit l'état et ne le modifie jamais. */
(() => {
  "use strict";

  window.Snake = window.Snake || {};

  const cfg = window.Snake.Config;
  const LOGICAL = cfg.cols * cfg.cellSize;
  const COLORS = cfg.colors;

  let canvas = null;
  let ctx = null;
  let scale = 1;
  let reducedMotion = false;

  function init(element) {
    canvas = element;
    ctx = canvas.getContext("2d", { alpha: false });
    reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    resize();
    if (typeof ResizeObserver === "function") {
      new ResizeObserver(resize).observe(canvas);
    }
    window.addEventListener("resize", resize);
  }

  /* Le buffer est dimensionné en pixels physiques, puis toutes les
     coordonnées de dessin restent exprimées en pixels logiques (480). */
  function resize() {
    if (!canvas || !ctx) {
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const cssSize = Math.max(120, Math.min(rect.width, rect.height));
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const pixels = Math.round(cssSize * dpr);

    if (canvas.width !== pixels || canvas.height !== pixels) {
      canvas.width = pixels;
      canvas.height = pixels;
    }
    scale = pixels / LOGICAL;
  }

  function roundedRectPath(x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
  }

  function draw(state, time) {
    if (!ctx || !canvas) {
      return;
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = COLORS.board;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);

    drawGrid();

    if (!state) {
      return;
    }

    drawObstacles(state.obstacles);
    if (state.food) {
      drawFood(state.food, time);
    }
    drawSnake(state);
  }

  function drawGrid() {
    const cell = cfg.cellSize;
    const size = LOGICAL;

    ctx.lineWidth = 1;
    ctx.strokeStyle = COLORS.grid;
    ctx.beginPath();
    for (let i = 1; i < cfg.cols; i += 1) {
      if (i % 5 === 0) {
        continue;
      }
      const position = i * cell;
      ctx.moveTo(position, 0);
      ctx.lineTo(position, size);
      ctx.moveTo(0, position);
      ctx.lineTo(size, position);
    }
    ctx.stroke();

    ctx.strokeStyle = COLORS.gridStrong;
    ctx.beginPath();
    for (let i = 5; i < cfg.cols; i += 5) {
      const position = i * cell;
      ctx.moveTo(position, 0);
      ctx.lineTo(position, size);
      ctx.moveTo(0, position);
      ctx.lineTo(size, position);
    }
    ctx.stroke();
  }

  function drawObstacles(obstacles) {
    const cell = cfg.cellSize;

    obstacles.forEach((obstacle) => {
      const x = obstacle.x * cell + 1.5;
      const y = obstacle.y * cell + 1.5;
      const size = cell - 3;

      roundedRectPath(x, y, size, size, 4);
      ctx.fillStyle = COLORS.obstacleFill;
      ctx.fill();

      ctx.save();
      ctx.clip();
      ctx.strokeStyle = COLORS.obstacleHatch;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let offset = -cell; offset < cell * 2; offset += 6) {
        ctx.moveTo(x + offset, y);
        ctx.lineTo(x + offset + cell, y + cell);
      }
      ctx.stroke();
      ctx.restore();

      roundedRectPath(x, y, size, size, 4);
      ctx.strokeStyle = COLORS.obstacleEdge;
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  }

  function drawFood(food, time) {
    const cell = cfg.cellSize;
    const cx = (food.x + 0.5) * cell;
    const cy = (food.y + 0.5) * cell;
    const pulse = reducedMotion ? 0.5 : (Math.sin(time / 220) + 1) / 2;
    const radius = cell * 0.26 + pulse * cell * 0.035;

    ctx.save();
    ctx.shadowColor = COLORS.foodGlow;
    ctx.shadowBlur = 12 + pulse * 8;
    ctx.fillStyle = COLORS.food;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
    ctx.beginPath();
    ctx.arc(cx - radius * 0.34, cy - radius * 0.34, radius * 0.24, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = COLORS.foodLeaf;
    ctx.beginPath();
    ctx.ellipse(
      cx + radius * 0.5,
      cy - radius * 0.95,
      radius * 0.42,
      radius * 0.2,
      -0.7,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  function drawSnake(state) {
    const snake = state.snake;
    const lastIndex = Math.max(1, snake.length - 1);

    for (let i = snake.length - 1; i >= 1; i -= 1) {
      const ratio = 1 - i / lastIndex;
      const lightness = 30 + ratio * 26;
      drawCell(snake[i], 2.2, 5, `hsl(152 88% ${lightness}%)`);
    }

    ctx.save();
    ctx.shadowColor = "rgba(61, 255, 160, 0.65)";
    ctx.shadowBlur = 12;
    drawCell(snake[0], 1.2, 6, COLORS.snakeHead);
    ctx.restore();

    drawEyes(snake[0], state.direction);
  }

  function drawCell(cellData, inset, radius, fill) {
    const cell = cfg.cellSize;
    const x = cellData.x * cell + inset;
    const y = cellData.y * cell + inset;
    const size = cell - inset * 2;

    roundedRectPath(x, y, size, size, radius);
    ctx.fillStyle = fill;
    ctx.fill();
  }

  function drawEyes(head, direction) {
    const cell = cfg.cellSize;
    const cx = (head.x + 0.5) * cell;
    const cy = (head.y + 0.5) * cell;
    const sideX = -direction.y;
    const sideY = direction.x;
    const frontX = cx + direction.x * 4.5;
    const frontY = cy + direction.y * 4.5;

    [5.2, -5.2].forEach((offset) => {
      const ex = frontX + sideX * offset;
      const ey = frontY + sideY * offset;

      ctx.fillStyle = COLORS.snakeEye;
      ctx.beginPath();
      ctx.arc(ex, ey, 2.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.beginPath();
      ctx.arc(ex - 0.6, ey - 0.6, 0.8, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  window.Snake.Renderer = Object.freeze({ init, draw, resize });
})();
