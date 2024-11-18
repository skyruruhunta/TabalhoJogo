document.addEventListener("DOMContentLoaded", function () {
  const player = document.getElementById("player");
  const invadersContainer = document.getElementById("invaders-container");
  const scoreDisplay = document.getElementById("score");
  const highScoreDisplay = document.getElementById("highscore");
  const gameMessage = document.getElementById("game-message");

  const shootSound = document.getElementById("shoot-sound");
  const explosionSound = document.getElementById("explosion-sound");
  const gameOverSound = document.getElementById("game-over-sound");

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

  const maxActiveBullets = 5;
  let isGameRunning = false;

  function playSound(sound) {
    if (sound) {
      sound.currentTime = 0;
      sound.volume = 0.5;
      sound.play().catch(() => {});
    }
  }

  function movePlayer(direction) {
    if (!isGameRunning) return;
    if (direction === "left" && playerPosition > 0) playerPosition -= 10;
    if (direction === "right" && playerPosition < gameWidth - playerWidth) playerPosition += 10;
    player.style.left = playerPosition + "px";
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
        });
      }

      invaders.forEach((invader) => {
        if (parseInt(invader.style.top) >= 500) {
          endGame("Você perdeu! Os invasores chegaram ao fundo!");
        }
      });

      if (invaders.length === 0) {
        spawnInvaders();
      }
    }, invaderSpeed);
  }

  function fire() {
    if (!isGameRunning || activeBullets.length >= maxActiveBullets) return;

    playSound(shootSound);

    const bullet = document.createElement("div");
    bullet.classList.add("bullet");

    const playerCenter = player.offsetLeft + player.offsetWidth / 2;
    bullet.style.left = `${playerCenter - 2.5}px`;
    bullet.style.bottom = "50px";

    document.getElementById("game-container").appendChild(bullet);
    activeBullets.push(bullet);

    const bulletInterval = setInterval(() => {
      const bulletBottom = parseInt(bullet.style.bottom);
      if (bulletBottom >= 600 || !isGameRunning) {
        bullet.remove();
        activeBullets = activeBullets.filter((b) => b !== bullet);
        clearInterval(bulletInterval);
        return;
      }
      bullet.style.bottom = `${bulletBottom + 5}px`;

      invaders.forEach((invader) => {
        if (checkCollision(bullet, invader)) {
          playSound(explosionSound);
          bullet.remove();
          invader.remove();
          activeBullets = activeBullets.filter((b) => b !== bullet);
          invaders = invaders.filter((i) => i !== invader);
          clearInterval(bulletInterval);
          score += 10;
          scoreDisplay.textContent = score;
          updateHighScore();
        }
      });
    }, 20);
  }

  function checkCollision(element1, element2) {
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();
    return !(
      rect1.top > rect2.bottom ||
      rect1.bottom < rect2.top ||
      rect1.right < rect2.left ||
      rect1.left > rect2.right
    );
  }

  function updateHighScore() {
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("highscore", highScore);
      highScoreDisplay.textContent = highScore;
    }
  }

  function startGame() {
    isGameRunning = true;
    score = 0;
    scoreDisplay.textContent = score;
    gameMessage.classList.add("hidden");
    spawnInvaders();
  }

  function resetGame() {
    isGameRunning = true;
    score = 0;
    scoreDisplay.textContent = score;
    gameMessage.classList.add("hidden");
    spawnInvaders();
  }

  function pauseGame() {
    isGameRunning = !isGameRunning;
    gameMessage.textContent = isGameRunning ? "" : "Jogo Pausado";
    gameMessage.classList.toggle("hidden", isGameRunning);
  }

  document.getElementById("left-button").addEventListener("click", () => movePlayer("left"));
  document.getElementById("right-button").addEventListener("click", () => movePlayer("right"));
  document.getElementById("fire-button").addEventListener("click", fire);
  document.getElementById("start-button").addEventListener("click", startGame);
  document.getElementById("restart-button").addEventListener("click", resetGame);
  document.getElementById("pause-button").addEventListener("click", pauseGame);
});
