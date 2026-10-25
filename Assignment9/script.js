const canvas = document.getElementById("animationCanvas");
const ctx = canvas.getContext("2d");
const imageFile = document.getElementById("imageFile");
const toggleButton = document.getElementById("toggleButton");
const resetButton = document.getElementById("resetButton");

const width = canvas.width;
const height = canvas.height;
const objSize = 76;

const sprite = new Image();
let customImageLoaded = false;
let imageReady = false;
let animationRunning = true;
let animationFrameId = null;
sprite.src = "./image.png";


const object = { x: 80, y: 70,  vx: 3.2, vy: 2.4, tint: "rgba(255, 255, 255, 0)"};

sprite.onload = () => {
  imageReady = true;
  drawScene();
};

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#0c1d2b");
  gradient.addColorStop(1, "#11152a");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

}

function drawScene() {
  drawBackground();

  if (!imageReady) return;

  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 6;
  ctx.drawImage(sprite, object.x, object.y, objSize, objSize);
  ctx.restore();

  if (object.tint !== "rgba(255, 255, 255, 0)") {
    ctx.save();
    ctx.beginPath();
    ctx.rect(object.x, object.y, objSize, objSize);
    ctx.clip();
    ctx.globalCompositeOperation = "source-atop";
    ctx.fillStyle = object.tint;
    ctx.fillRect(object.x, object.y, objSize, objSize);
    ctx.restore();
  }
}

function animate() {
  if (!animationRunning) return;

  object.x += object.vx;
  object.y += object.vy;

  if (object.x <= 0) {
    object.x = 0;
    object.vx = Math.abs(object.vx);
  } else if (object.x + objSize >= width) {
    object.x = width - objSize;
    object.vx = -Math.abs(object.vx);
  }

  if (object.y <= 0) {
    object.y = 0;
    object.vy = Math.abs(object.vy);
  } else if (object.y + objSize >= height) {
    object.y = height - objSize;
    object.vy = -Math.abs(object.vy);
  }

  drawScene();
  animationFrameId = requestAnimationFrame(animate);
}

function randomColor() {
  const hue = Math.floor(Math.random() * 360);
  return `hsla(${hue}, 90%, 60%, 0.62)`;
}

function change() {
  const angle = Math.random() * Math.PI * 2;
  const speed = 3 + Math.random() * 2;
  object.vx = Math.cos(angle) * speed;
  object.vy = Math.sin(angle) * speed;
  object.tint = randomColor();
  drawScene();
}

canvas.addEventListener("click", change);



toggleButton.addEventListener("click", () => {
  animationRunning = !animationRunning;
  toggleButton.textContent = animationRunning ? "Pause animation" : "Resume animation";

  if (animationRunning) {
    animationFrameId = requestAnimationFrame(animate);
  } else if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
  }
});

resetButton.addEventListener("click", () => {
  object.x = 80;
  object.y = 70;
  object.vx = 3.2;
  object.vy = 2.4;
  object.tint = "rgba(255, 255, 255, 0)";
  drawScene();
  change();
});

drawScene();
animate();
change();
