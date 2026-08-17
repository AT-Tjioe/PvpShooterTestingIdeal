const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 500;

// Player template
function createPlayer(x, y, color, left, right, up, down, shootKey) {
  return {
    x, y,
    w: 40,
    h: 40,
    color,
    speed: 4,
    bullets: [],
    health: 100,
    keys: { left, right, up, down, shootKey },
    shootCooldown: 0,
    autoShootCooldown: 0
  };
}

// Players
const p1 = createPlayer(100, 200, "cyan", "a", "d", "w", "s", "f");
const p2 = createPlayer(600, 200, "orange", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Shift");

// Key tracking
const keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// Manual shoot (Player 1 or Player 2)
function shoot(player) {
  const angle = player === p1
    ? Math.atan2(p2.y - player.y, p2.x - player.x)
    : Math.atan2(p1.y - player.y, p1.x - player.x);

  player.bullets.push({
    x: player.x + player.w / 2,
    y: player.y + player.h / 2,
    size: 8,
    speedX: Math.cos(angle) * 6,
    speedY: Math.sin(angle) * 6
  });
}

// Auto-shoot toward opponent
function autoShoot(player, opponent) {
  if (player.autoShootCooldown <= 0) {
    const angle = Math.atan2(opponent.y - player.y, opponent.x - player.x);

    player.bullets.push({
      x: player.x + player.w / 2,
      y: player.y + player.h / 2,
      size: 8,
      speedX: Math.cos(angle) * 6,
      speedY: Math.sin(angle) * 6
    });

    player.autoShootCooldown = 40; // frames between shots
  } else {
    player.autoShootCooldown--;
  }
}

// Update players
function updatePlayer(player) {
  if (keys[player.keys.left]) player.x -= player.speed;
  if (keys[player.keys.right]) player.x += player.speed;
  if (keys[player.keys.up]) player.y -= player.speed;
  if (keys[player.keys.down]) player.y += player.speed;

  // Manual shooting
  if (keys[player.keys.shootKey]) {
    if (!player.shootCooldown) {
      shoot(player);
      player.shootCooldown = 15;
    }
  }

  if (player.shootCooldown > 0) player.shootCooldown--;

  // Boundaries
  player.x = Math.max(0, Math.min(canvas.width - player.w, player.x));
  player.y = Math.max(0, Math.min(canvas.height - player.h, player.y));
}

// Update bullets
function updateBullets(player, opponent) {
  player.bullets.forEach((b, i) => {
    b.x += b.speedX;
    b.y += b.speedY;

    // Collision
    if (
      b.x < opponent.x + opponent.w &&
      b.x + b.size > opponent.x &&
      b.y < opponent.y + opponent.h &&
      b.y + b.size > opponent.y
    ) {
      opponent.health -= 10;
      player.bullets.splice(i, 1);
    }

    // Remove off-screen
    if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {
      player.bullets.splice(i, 1);
    }
  });
}

// Draw players
function drawPlayer(player) {
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.w, player.h);

  // Health bar
  ctx.fillStyle = "red";
  ctx.fillRect(player.x, player.y - 10, player.w, 5);

  ctx.fillStyle = "lime";
  ctx.fillRect(player.x, player.y - 10, (player.health / 100) * player.w, 5);
}

// Draw bullets
function drawBullets(player) {
  ctx.fillStyle = "yellow";
  player.bullets.forEach(b => {
    ctx.fillRect(b.x, b.y, b.size, b.size);
  });
}

// Game loop
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  updatePlayer(p1);
  updatePlayer(p2);

  // Auto-shooting
  autoShoot(p1, p2);
  autoShoot(p2, p1);

  updateBullets(p1, p2);
  updateBullets(p2, p1);

  drawPlayer(p1);
  drawPlayer(p2);

  drawBullets(p1);
  drawBullets(p2);

  // Win condition
  if (p1.health <= 0 || p2.health <= 0) {
    ctx.fillStyle = "white";
    ctx.font = "40px Arial";
    ctx.fillText(
      p1.health <= 0 ? "Player 2 Wins!" : "Player 1 Wins!",
      canvas.width / 2 - 150,
      canvas.height / 2
    );
    return;
  }

  requestAnimationFrame(loop);
}

loop();
