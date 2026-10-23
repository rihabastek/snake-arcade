/* Composition de l'application : boucle à pas fixe, transitions d'état,
   branchement des entrées, du rendu et du HUD. */
(() => {
  "use strict";

  window.Snake = window.Snake || {};

  const { Config, Game, Direction, Storage, Renderer, Input, Hud } = window.Snake;

  let state = null;
  let best = 0;
  let ignoreUntil = 0;
  let lastTime = 0;
  let accumulator = 0;

  function start(lockInput) {
    state = Game.createState();
    state.status = "running";
    accumulator = 0;
    lastTime = performance.now();
    ignoreUntil = lastTime + (lockInput ? Config.restartLockMs : 0);

    Hud.setScores(0, best);
    Hud.setPause({ disabled: false, label: "PAUSE" });
    Hud.hideOverlay();
    Hud.announce(lockInput ? "Nouvelle partie" : "Partie lancée");
  }

  function pause() {
    if (!state || state.status !== "running") {
      return;
    }
    state.status = "paused";
    accumulator = 0;
    Hud.setPause({ disabled: false, label: "Reprendre" });
    Hud.showOverlay({
      title: "Pause",
      text: "La partie est en pause. Reprends quand tu veux.",
      action: "Reprendre",
      mode: "pause",
    });
    Hud.announce("Partie en pause");
  }

  function resume() {
    if (!state || state.status !== "paused") {
      return;
    }
    state.status = "running";
    accumulator = 0;
    lastTime = performance.now();
    ignoreUntil = lastTime + 120;
    Hud.setPause({ disabled: false, label: "PAUSE" });
    Hud.hideOverlay();
    Hud.announce("Reprise de la partie");
  }

  function togglePause() {
    if (!state) {
      return;
    }
    if (state.status === "running") {
      pause();
    } else if (state.status === "paused") {
      resume();
    }
  }

  function finish(reason) {
    best = Math.max(best, state.score);
    Storage.writeBest(best);
    Hud.setScores(state.score, best);
    Hud.setPause({ disabled: true, label: "PAUSE" });

    let title = "Game over";
    let detail = "Collision avec un bloc.";
    if (reason === "self") {
      detail = "Collision avec ton propre corps.";
    }
    if (reason === "win") {
      title = "Parfait !";
      detail = "Plateau rempli : aucune case libre.";
    }

    Hud.showOverlay({
      title,
      text: `${detail} Score ${state.score} · Record ${best}.`,
      action: "Rejouer",
      mode: reason === "win" ? "info" : "over",
    });
    Hud.announce(`${title}. Score ${state.score}. Record ${best}.`);
  }

  function handleStep() {
    const event = Game.step(state, Math.random);

    if (event.type === "die") {
      finish(event.reason);
      return;
    }
    if (event.type === "win") {
      finish("win");
      return;
    }
    if (event.type === "eat") {
      if (state.score > best) {
        best = state.score;
        Storage.writeBest(best);
      }
      Hud.setScores(state.score, best);
    }
  }

  function frame(now) {
    // Plafond : après un onglet inactif, on ne simule pas des secondes entières.
    const dt = Math.min(Math.max(now - lastTime, 0), 250);
    lastTime = now;

    if (state && state.status === "running") {
      accumulator += dt;
      let steps = 0;

      while (accumulator >= state.tickMs && state.status === "running" && steps < 8) {
        accumulator -= state.tickMs;
        handleStep();
        steps += 1;
      }

      if (state.status !== "running") {
        accumulator = 0;
      }
    }

    Renderer.draw(state, now);
    window.requestAnimationFrame(frame);
  }

  function onTurn(direction) {
    if (!state) {
      return;
    }
    if (state.status === "idle") {
      start(false);
    }
    if (state.status !== "running" || performance.now() < ignoreUntil) {
      return;
    }
    Direction.turn(state, direction);
  }

  function onPrimary() {
    if (!state) {
      return;
    }
    if (state.status === "running" || state.status === "paused") {
      togglePause();
      return;
    }
    start(state.status === "over" || state.status === "won");
  }

  function onOverlayAction() {
    if (!state) {
      return;
    }
    if (state.status === "paused") {
      resume();
      return;
    }
    start(state.status === "over" || state.status === "won");
  }

  function boot() {
    const canvas = document.getElementById("game");
    Renderer.init(canvas);
    best = Storage.readBest();

    Hud.init({ onPause: togglePause, onAction: onOverlayAction });
    Input.init({ canvas, onTurn, onPrimary });

    state = Game.createState();
    Hud.setScores(0, best);
    Hud.setPause({ disabled: true, label: "PAUSE" });
    Hud.showOverlay({
      title: "Prêt ?",
      text: "Mange les pommes, évite les blocs. Les bords te renvoient de l'autre côté.",
      action: "Jouer",
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden && state && state.status === "running") {
        pause();
      }
    });

    lastTime = performance.now();
    Renderer.draw(state, lastTime);
    window.requestAnimationFrame(frame);
  }

  boot();
})();
