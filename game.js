const game = document.getElementById("game");
const player = document.getElementById("player");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayText = document.getElementById("overlayText");
const startBtn = document.getElementById("startBtn");
const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");

let running = false;
let playerX = 50;
let score = 0;
let startTime = 0;
let lastFrame = 0;
let spawnTimer = 0;
let animationId = 0;
const birds = [];

function setPlayer() {
  player.style.left = playerX + "%";
}

function startGame() {
  birds.splice(0).forEach(b => b.el.remove());
  running = true;
  score = 0;
  playerX = 50;
  startTime = performance.now();
  lastFrame = startTime;
  spawnTimer = 0;
  scoreEl.textContent = "0";
  timeEl.textContent = "0.0";
  overlay.style.display = "none";
  setPlayer();
  cancelAnimationFrame(animationId);
  animationId = requestAnimationFrame(loop);
}

function endGame() {
  running = false;
  const survived = ((performance.now() - startTime) / 1000).toFixed(1);
  overlayTitle.textContent = "잡혔어";
  overlayText.textContent = `버틴 시간 ${survived}초 · 점수 ${score}`;
  startBtn.textContent = "다시 하기";
  overlay.style.display = "flex";
}

function move(dir) {
  if (!running) return;
  playerX = Math.max(8, Math.min(92, playerX + dir * 4));
  setPlayer();
}

document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") move(-1);
  if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") move(1);
  if ((e.key === " " || e.key === "Enter") && !running) startGame();
});

document.querySelectorAll(".move").forEach(btn => {
  const dir = Number(btn.dataset.dir);
  btn.addEventListener("pointerdown", e => { e.preventDefault(); move(dir); });
  btn.addEventListener("pointerup", e => e.preventDefault());
});

let dragging = false;
game.addEventListener("pointerdown", e => {
  if (!running) return;
  dragging = true;
  game.setPointerCapture?.(e.pointerId);
});
game.addEventListener("pointermove", e => {
  if (!running || !dragging) return;
  const r = game.getBoundingClientRect();
  playerX = Math.max(8, Math.min(92, ((e.clientX-r.left)/r.width)*100));
  setPlayer();
});
game.addEventListener("pointerup", () => dragging = false);
game.addEventListener("pointercancel", () => dragging = false);

startBtn.addEventListener("click", startGame);

function spawnBird(elapsed) {
  const el = document.createElement("img");
  el.className = "bird";
  el.src = "images/bird.svg";
  el.alt = "";
  const x = 5 + Math.random() * 90;
  el.style.left = x + "%";
  el.style.top = "-65px";
  game.appendChild(el);
  birds.push({
    el,
    x,
    y: -65,
    speed: 170 + Math.random() * 120 + Math.min(130, elapsed * 5),
    size: 58
  });
}

function hitTest(b) {
  const gr = game.getBoundingClientRect();
  const pr = player.getBoundingClientRect();
  const br = b.el.getBoundingClientRect();
  const pad = 10;
  return !(br.right-pad < pr.left+pad || br.left+pad > pr.right-pad ||
           br.bottom-pad < pr.top+pad || br.top+pad > pr.bottom-pad);
}

function loop(now) {
  if (!running) return;
  const dt = Math.min(0.035, (now-lastFrame)/1000);
  lastFrame = now;
  const elapsed = (now-startTime)/1000;

  timeEl.textContent = elapsed.toFixed(1);
  score = Math.floor(elapsed * 10);
  scoreEl.textContent = score;

  spawnTimer += dt;
  const interval = Math.max(0.18, 0.62 - elapsed * 0.012);
  if (spawnTimer >= interval) {
    spawnTimer = 0;
    spawnBird(elapsed);
  }

  for (let i=birds.length-1;i>=0;i--) {
    const b = birds[i];
    b.y += b.speed * dt;
    b.el.style.top = b.y + "px";
    if (hitTest(b)) {
      endGame();
      return;
    }
    if (b.y > game.clientHeight + 80) {
      b.el.remove();
      birds.splice(i,1);
    }
  }
  animationId = requestAnimationFrame(loop);
}

setPlayer();
