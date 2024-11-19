document.addEventListener("DOMContentLoaded", function () {
  const player = document.getElementById("player");
  const invadersContainer = document.getElementById("invaders-container");
  const scoreDisplay = document.getElementById("score");
  const highScoreDisplay = document.getElementById("highscore");
  const gameMessage = document.getElementById("game-message");
  const instructionsBox = document.getElementById("instructions-box");
  const startButton = document.getElementById("start-button");
  const restartButton = document.getElementById("restart-button");
  const pauseButton = document.getElementById("pause-button");

  let invaders = [];
  let activeBullets = [];
  let score = 0;
  let highScore = localStorage.getItem("highscore") || 0;
  highScoreDisplay.textContent = highScore;

  let playerPosition = 180;
  const playerWidth = 40;
  const gameWidth = 400;
  let invaderSpeed = 800;
  let invaderMovementInterval;
  let isGameRunning = false;

  document.addEventListener("touchstart", (e) => {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  });

  document.addEventListener("dblclick", (e) => {
    e.preventDefault();
  });

  function playSound(sound) {
    sound.currentTime = 0;
    sound.volume = 0.5;
    sound.play().catch(() => {});
  }

  function movePlayer(direction) {
    if (!isGameRunning) return;
    if (direction === "left" && playerPosition > 0) {
      playerPosition -= 10;
    } else if (direction === "right" && playerPosition < gameWidth - playerWidth) {
      playerPosition += 10;
    }
    player.style.left = `${playerPosition}px`;
  }

  function spawnInvaders() {
    invadersContainer.innerHTML = "";
    invaders = [];
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 8; col++) {
        const invader = document.createElement("div");
        invader.classList.add("invader");
        invader.style.left = `${col * 45}px`;
        invader.style.top = `${row * 45}px`;
        invadersContainer.appendChild(invader);
        invaders.push(invader);
      }
    }
    moveInvaders();
  }

  function moveInvaders() {
    let direction = 1;
    let moveDown = false;

    clearInterval(invaderMovementInterval);
    invaderMovementInterval = setInterval(() => {
      if (!isGameRunning) return;

      moveDown = false;
      invaders.forEach((invader) => {
        const currentLeft = parseInt(invader.style.left);
        const newLeft = currentLeft + 10 * direction;
        invader.style.left = `${newLeft}px`;

        if (newLeft + 40 >= gameWidth || newLeft <= 0) {
          moveDown = true;
        }
      });

      if (moveDown) {
        direction *= -1;
        invaders.forEach((invader) => {
          const currentTop = parseInt(invader.style.top);
          invader.style.top = `${currentTop + 20}px`;
          if (currentTop + 40 >= 550) endGame("Invasores alcançaram o fundo!");
          if (checkCollision(invader, player)) endGame("Invasores colidiram com você!");
        });
      }

      if (invaders.length === 0) spawnInvaders();
    }, invaderSpeed);
  }

  function increaseDifficulty() {
    const baseSpeed = 800;
    const maxSpeed = 200;
    const speedStep = 50;

    invaderSpeed = Math.max(baseSpeed - Math.floor(score / 50) * speedStep, maxSpeed);
    clearInterval(invaderMovementInterval);
    moveInvaders();
  }

  function fire() {
    if (!isGameRunning) return;

    playSound(document.getElementById("shoot-sound"));

    const bullet = document.createElement("div");
    bullet.classList.add("bullet");
    bullet.style.left = `${player.offsetLeft + 20}px`;
    bullet.style.bottom = "50px";

    document.getElementById("game-container").appendChild(bullet);
    activeBullets.push(bullet);

    const bulletInterval = setInterval(() => {
      const bulletBottom = parseInt(bullet.style.bottom);
      bullet.style.bottom = `${bulletBottom + 5}px`;

      invaders.forEach((invader) => {
        if (checkCollision(bullet, invader)) {
          playSound(document.getElementById("explosion-sound"));
          bullet.remove();
          invader.remove();
          activeBullets = activeBullets.filter((b) => b !== bullet);
          invaders = invaders.filter((i) => i !== invader);
          score += 10;
          scoreDisplay.textContent = score;
          updateHighScore();
          increaseDifficulty();
        }
      });

      if (bulletBottom >= 600) {
        bullet.remove();
        activeBullets = activeBullets.filter((b) => b !== bullet);
        clearInterval(bulletInterval);
      }
    }, 20);
  }

  function checkCollision(el1, el2) {
    const r1 = el1.getBoundingClientRect();
    const r2 = el2.getBoundingClientRect();
    return !(r1.top > r2.bottom || r1.bottom < r2.top || r1.right < r2.left || r1.left > r2.right);
  }

  function updateHighScore() {
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("highscore", highScore);
      highScoreDisplay.textContent = highScore;
    }
  }

  function endGame(message) {
    isGameRunning = false;
    clearInterval(invaderMovementInterval);
    gameMessage.textContent = message;
    gameMessage.classList.remove("hidden");
    playSound(document.getElementById("game-over-sound"));
  }

  startButton.addEventListener("click", () => {
    isGameRunning = true;
    score = 0;
    scoreDisplay.textContent = score;
    instructionsBox.classList.add("hidden");
    gameMessage.classList.add("hidden");
    spawnInvaders();
  });

  restartButton.addEventListener("click", () => location.reload());
  pauseButton.addEventListener("click", () => (isGameRunning = !isGameRunning));

  document.addEventListener("keydown", (e) => {
    if (!isGameRunning) return;
    if (e.key === "ArrowLeft") movePlayer("left");
    if (e.key === "ArrowRight") movePlayer("right");
    if (e.key === " ") {
      e.preventDefault();
      fire();
    }
  });

  document.getElementById("left-button").addEventListener("touchstart", () => movePlayer("left"));
  document.getElementById("right-button").addEventListener("touchstart", () => movePlayer("right"));
  document.getElementById("fire-button").addEventListener("touchstart", fire);

  document.getElementById("left-button").addEventListener("mousedown", () => movePlayer("left"));
  document.getElementById("right-button").addEventListener("mousedown", () => movePlayer("right"));
  document.getElementById("fire-button").addEventListener("mousedown", fire);
});