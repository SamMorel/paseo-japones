
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

/* =====================
   IMÁGENES
===================== */
const fondo = new Image(); fondo.src = "assets/fondo.png";
const novioImg = new Image(); novioImg.src = "assets/novio.png";
const tuImg = new Image(); tuImg.src = "assets/tu.png";
const besoImg = new Image(); besoImg.src = "assets/beso_final.png";

const maderaImg = new Image(); maderaImg.src = "assets/bulto_madera.png";
const basuraImg = new Image(); basuraImg.src = "assets/bote_basura.png";
const ranaImg = new Image(); ranaImg.src = "assets/rana.png";

/* =====================
   CONFIGURACIÓN
===================== */
const PERSONAJE_W = 60;
const PERSONAJE_H = 84;
const OBST_W = PERSONAJE_W * 0.5;
const OBST_H = PERSONAJE_H * 0.5;

const caminoY = 430;
const gravedad = 0.6;

/* =====================
   ESTADOS
===================== */
let estado = "intro"; // intro | jugando | final

/* =====================
   JUGADOR
===================== */
const jugador = {
  x: 40,
  y: caminoY - PERSONAJE_H,
  w: PERSONAJE_W,
  h: PERSONAJE_H,
  vx: 0,
  vy: 0,
  speed: 2.2,
  jump: -12,
  onGround: false
};

/* =====================
   META
===================== */
const meta = {
  x: 760,
  y: caminoY - PERSONAJE_H,
  w: PERSONAJE_W,
  h: PERSONAJE_H
};

/* =====================
   OBSTÁCULOS
===================== */
const obstaculos = [
  { x: 260, y: caminoY - OBST_H, w: OBST_W, h: OBST_H, img: maderaImg },
  { x: 420, y: caminoY - OBST_H, w: OBST_W, h: OBST_H, img: basuraImg },
  { x: 580, y: caminoY - OBST_H, w: OBST_W, h: OBST_H, img: ranaImg }
];

/* =====================
   CONTROLES
===================== */
let keys = {};

document.addEventListener("keydown", e => {
  keys[e.key] = true;
  if (estado === "intro") estado = "jugando";
});
document.addEventListener("keyup", e => keys[e.key] = false);

/* =====================
   COLISIÓN
===================== */
function colision(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

/* =====================
   CONFETI CORAZONES
===================== */
const corazones = [];

function crearCorazon() {
  corazones.push({
    x: Math.random() * canvas.width,
    y: -20,
    size: 8 + Math.random() * 10,
    speed: 1 + Math.random() * 2
  });
}

function dibujarCorazones() {
  ctx.fillStyle = "#ff4d88";
  corazones.forEach(c => {
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.size / 2, 0, Math.PI * 2);
    ctx.fill();
    c.y += c.speed;
  });
}

/* =====================
   UPDATE
===================== */
function update() {
  if (estado !== "jugando") return;

  jugador.vx = 0;
  if (keys["ArrowRight"]) jugador.vx = jugador.speed;
  if (keys["ArrowLeft"]) jugador.vx = -jugador.speed;

  // Límite de pantalla
  jugador.x = Math.max(0, Math.min(jugador.x, canvas.width - jugador.w));

  if (keys[" "] && jugador.onGround) {
    jugador.vy = jugador.jump;
    jugador.onGround = false;
  }

  jugador.vy += gravedad;
  jugador.x += jugador.vx;

  // Colisión horizontal
  obstaculos.forEach(o => {
    if (colision(jugador, o)) {
      if (jugador.vx > 0) jugador.x = o.x - jugador.w;
      if (jugador.vx < 0) jugador.x = o.x + o.w;
    }
  });

  jugador.y += jugador.vy;
  jugador.onGround = false;

  // Piso invisible
  if (jugador.y + jugador.h >= caminoY) {
    jugador.y = caminoY - jugador.h;
    jugador.vy = 0;
    jugador.onGround = true;
  }

  // Colisión vertical obstáculos
  obstaculos.forEach(o => {
    if (colision(jugador, o) && jugador.vy > 0) {
      jugador.y = o.y - jugador.h;
      jugador.vy = 0;
      jugador.onGround = true;
    }
  });

  // Llegar a ella 💖
  if (colision(jugador, meta)) {
    estado = "final";
    corazones.length = 0;
    for (let i = 0; i < 90; i++) crearCorazon();
  }
}

/* =====================
   DRAW
===================== */
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(fondo, 0, 0, canvas.width, canvas.height);

  obstaculos.forEach(o => {
    ctx.drawImage(o.img, o.x, o.y, o.w, o.h);
  });

  if (estado !== "final") {
    ctx.drawImage(tuImg, meta.x, meta.y, meta.w, meta.h);
    ctx.drawImage(novioImg, jugador.x, jugador.y, jugador.w, jugador.h);
  } else {
    // Imagen del beso 💋
    const besoW = 140;
    const besoH = 120;
    ctx.drawImage(
      besoImg,
      meta.x - 40,
      caminoY - besoH,
      besoW,
      besoH
    );
  }

  if (estado === "intro") {
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillText("➡️ ⬅️ Moverse   ESPACIO: Saltar", canvas.width / 2, 200);
    ctx.fillText("Presiona cualquier tecla para comenzar 💖", canvas.width / 2, 240);
  }

  if (estado === "final") {
    dibujarCorazones();
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.fillRect(0, 150, canvas.width, 120);
    ctx.fillStyle = "#ff4d88";
    ctx.font = "28px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Llegaste a mí,", canvas.width / 2, 200);
    ctx.fillText("TE AMO MUCHO MUCHOTE <3", canvas.width / 2, 240);
  }
}

/* =====================
   LOOP
===================== */
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
