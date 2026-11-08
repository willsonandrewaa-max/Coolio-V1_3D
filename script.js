/* =====================================================================
   COOLIO — script.js
   - Botol 3D (CSS 3D murni, tanpa library) + label digambar di canvas
   - Efek semprotan kabut, animasi scroll, counter angka
   Teks pada label botol bisa diubah di CONFIG di bawah.
   ===================================================================== */

const CONFIG = {
  label: {
    tagline: "Cool in, Move On with",
    line1: "2in1",
    line2: "Cooling Spray",
    line3: "Green Apple",
    line4: "Scent",
    volume: "100ML",
    backTitle: "CARA PAKAI",
    backLines: ["1. Kocok sebelum digunakan", "2. Semprot ±15–20 cm", "ke badan / pakaian", "3. Cool in, Move On!"],
    netto: "Netto 100 ml",
  },
  colors: {
    labelTop: "#8ad8fb",
    labelMid: "#5cc3f5",
    labelBottom: "#36a5ec",
    outline: "#1b86d6",
    pink: "#ff2e93",
    green: "#8bd14a",
    flower: "#ffd43b",
  },
  autoRotateSpeed: 18,   // derajat per detik
  sprayMessage: "Ahh… sejuk! 🍏",
};

/* ---------------- Util ---------------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const rad = (d) => (d * Math.PI) / 180;
const norm = (d) => ((((d + 180) % 360) + 360) % 360) - 180;
function rng(seed) { // mulberry32 — acak tapi selalu sama
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* =====================================================================
   1. TEKSTUR LABEL (canvas)
   ===================================================================== */
function drawSnow(ctx, x, y, s, a) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = `rgba(255,255,255,${a})`;
  ctx.lineWidth = Math.max(1, s * 0.14);
  ctx.lineCap = "round";
  ctx.beginPath();
  for (let k = 0; k < 6; k++) {
    ctx.rotate(Math.PI / 3);
    ctx.moveTo(0, 0); ctx.lineTo(0, -s);
    ctx.moveTo(0, -s * 0.55); ctx.lineTo(s * 0.26, -s * 0.8);
    ctx.moveTo(0, -s * 0.55); ctx.lineTo(-s * 0.26, -s * 0.8);
  }
  ctx.stroke();
  ctx.restore();
}

function drawFlower(ctx, x, y, r, outline) {
  const C = CONFIG.colors;
  const petal = (lw, color, fill) => {
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2 - Math.PI / 2;
      ctx.beginPath();
      ctx.arc(x + Math.cos(a) * r * 0.58, y + Math.sin(a) * r * 0.58, r * 0.46, 0, Math.PI * 2);
      if (fill) { ctx.fillStyle = color; ctx.fill(); } else { ctx.lineWidth = lw; ctx.strokeStyle = color; ctx.stroke(); }
    }
  };
  if (outline) petal(outline, C.outline, false);
  petal(0, C.flower, true);
  petal(1.2, "#f0a500", false);
  petal(0, C.flower, true);
  ctx.beginPath(); ctx.arc(x, y, r * 0.42, 0, Math.PI * 2); ctx.fillStyle = C.flower; ctx.fill();
  ctx.beginPath(); ctx.arc(x, y, r * 0.24, 0, Math.PI * 2); ctx.fillStyle = "#fff4bf"; ctx.fill();
}

function outlinedText(ctx, text, x, y, font, fill, stroke, lw) {
  ctx.font = font;
  ctx.lineJoin = "round";
  if (stroke) { ctx.lineWidth = lw; ctx.strokeStyle = stroke; ctx.strokeText(text, x, y); }
  ctx.fillStyle = fill;
  ctx.fillText(text, x, y);
}

function drawLabelTexture(W, H) {
  const S = 2;
  const cv = document.createElement("canvas");
  cv.width = Math.round(W * S); cv.height = H * S;
  const ctx = cv.getContext("2d");
  ctx.scale(S, S);
  const C = CONFIG.colors, L = CONFIG.label, R = rng(7);

  // latar: cairan bening di balik tepi label
  ctx.fillStyle = "#d6f0fd";
  ctx.fillRect(0, 0, W, H);

  // bentuk label dengan tepi atas bergelombang (seperti mockup)
  const shape = new Path2D();
  shape.rect(0, 30, W, H - 30);
  for (let x = -6; x < W + 20; x += 26) {
    shape.moveTo(x + 17, 30);
    shape.arc(x + 4, 30 + R() * 4, 13 + R() * 5, 0, Math.PI * 2);
  }
  const g = ctx.createLinearGradient(0, 10, 0, H);
  g.addColorStop(0, C.labelTop); g.addColorStop(0.35, C.labelMid); g.addColorStop(1, C.labelBottom);
  ctx.fillStyle = g;
  ctx.fill(shape);

  ctx.save();
  ctx.clip(shape);
  // gelembung
  for (let i = 0; i < 46; i++) {
    const r = 12 + R() * 36;
    ctx.beginPath();
    ctx.arc(R() * W, 20 + R() * H, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${0.07 + R() * 0.13})`;
    ctx.fill();
  }
  // kepingan salju (hindari area teks depan & belakang)
  const cx = W / 2;
  for (let i = 0; i < 26; i++) {
    const x = R() * W, y = 50 + R() * (H - 70);
    if (Math.abs(x - cx) < 82 || x < 52 || x > W - 52) continue;
    drawSnow(ctx, x, y, 4 + R() * 7, 0.55 + R() * 0.4);
  }
  drawSnow(ctx, cx - 78, 66, 6, 0.9); drawSnow(ctx, cx + 80, 168, 7, 0.9);
  drawSnow(ctx, cx - 74, 250, 6, 0.85); drawSnow(ctx, cx + 76, 268, 5, 0.85);
  ctx.restore();

  // ---------- sisi depan ----------
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  ctx.save();
  ctx.translate(cx, 82); ctx.rotate(-0.08);
  outlinedText(ctx, L.tagline, 0, 0, "700 12.5px Fredoka, 'Arial Rounded MT Bold', sans-serif", C.pink, "#fff", 3.5);
  ctx.restore();

  // logo "Coolio" — huruf o diganti bunga
  const size = 44, base = 132;
  ctx.font = `700 ${size}px Fredoka, 'Arial Rounded MT Bold', sans-serif`;
  const parts = ["C", "o", "o", "l", "i", "o"];
  const fw = size * 0.74;
  const widths = parts.map((p) => (p === "o" ? fw : ctx.measureText(p).width));
  let x = cx - widths.reduce((a, b) => a + b, 0) / 2;
  const lg = ctx.createLinearGradient(0, base - size, 0, base);
  lg.addColorStop(0, "#ffffff"); lg.addColorStop(1, "#c9eeff");
  parts.forEach((p, i) => {
    const w = widths[i];
    if (p === "o") {
      drawFlower(ctx, x + w / 2, base - size * 0.32, size * 0.37, 6);
    } else {
      ctx.textAlign = "left";
      ctx.lineJoin = "round";
      ctx.lineWidth = 7; ctx.strokeStyle = C.outline; ctx.strokeText(p, x, base);
      ctx.fillStyle = lg; ctx.fillText(p, x, base);
    }
    x += w;
  });
  ctx.textAlign = "center";

  outlinedText(ctx, L.line1, cx, 186, "700 20px Fredoka, sans-serif", C.pink, "#fff", 4);
  outlinedText(ctx, L.line2, cx, 210, "700 21px Fredoka, sans-serif", "#ffffff", C.outline, 4.5);
  outlinedText(ctx, L.line3, cx, 234, "700 20px Fredoka, sans-serif", C.green, "#ffffff", 4.5);
  outlinedText(ctx, L.line4, cx, 251, "600 12px Fredoka, sans-serif", "#6fbf35", "#ffffff", 3);
  outlinedText(ctx, L.volume, cx, 287, "600 12px 'Plus Jakarta Sans', sans-serif", "#ffffff", null, 0);

  // ---------- sisi belakang (digambar dua kali agar menyambung) ----------
  [0, W].forEach((bx) => {
    outlinedText(ctx, L.backTitle, bx, 88, "700 11px 'Plus Jakarta Sans', sans-serif", "#ffffff", null, 0);
    L.backLines.forEach((t, i) => outlinedText(ctx, t, bx, 108 + i * 13, "500 8.5px 'Plus Jakarta Sans', sans-serif", "rgba(255,255,255,.92)", null, 0));
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(bx - 32, 196, 64, 44, 6) : ctx.rect(bx - 32, 196, 64, 44); ctx.fill();
    const br = rng(3);
    ctx.fillStyle = "#0b2f55";
    for (let bxx = bx - 26; bxx < bx + 26; ) { const w = 0.8 + br() * 2.2; ctx.fillRect(bxx, 201, w, 26); bxx += w + 0.8 + br() * 1.6; }
    outlinedText(ctx, "8 99 000 000 001", bx, 236, "500 6px 'Plus Jakarta Sans', sans-serif", "#0b2f55", null, 0);
    outlinedText(ctx, L.netto, bx, 262, "600 9px 'Plus Jakarta Sans', sans-serif", "#ffffff", null, 0);
  });

  return cv.toDataURL("image/png");
}

/* =====================================================================
   2. BOTOL 3D
   Ukuran dalam px (sebelum diskalakan). Urutan dari atas ke bawah.
   ===================================================================== */
const GEO = {
  height: 640,
  cap:    { y: 0,   h: 125, r: 80, n: 40 },
  act:    { y: 62,  h: 63,  r: 40, n: 24 },
  stem:   { y: 44,  h: 18,  r: 9,  n: 10 },
  collar: { y: 125, h: 48,  r: 84, n: 44 },
  upper:  { y: 173, h: 105, r: 90, n: 56 },
  label:  { y: 278, h: 300, r: 90.6, n: 56 },
  lower:  { y: 578, h: 62,  r: 90, n: 56 },
};

const BG = {
  cap: "linear-gradient(180deg, rgba(255,255,255,.42) 0%, rgba(255,255,255,.07) 9%, rgba(255,255,255,.05) 88%, rgba(255,255,255,.35) 100%)",
  upper: "linear-gradient(180deg, rgba(255,255,255,.05) 0%, rgba(255,255,255,.05) 41%, rgba(255,255,255,.75) 42%, rgba(196,232,252,.32) 45%, rgba(176,222,250,.4) 100%)",
  lower: "linear-gradient(180deg, rgba(176,222,250,.4) 0%, rgba(150,206,242,.5) 86%, rgba(255,255,255,.6) 100%)",
  white: "linear-gradient(180deg, #ffffff 0%, #f1f7fc 70%, #dfeaf4 100%)",
  act: "linear-gradient(180deg, #ffffff 0%, #f6fafe 100%)",
};

let LABEL_URL = null;
const bottles = [];

class Bottle {
  constructor(host) {
    this.host = host;
    this.strips = [];
    this.rot = -20;
    this.vel = 0;
    this.tilt = -8; this.tiltTarget = -8;
    this.dragging = false;
    this.visible = true;
    this.pause = 0;
    this.build();
    this.bind();
    this.resize();
    bottles.push(this);
  }

  el(cls, parent, css = {}) {
    const d = document.createElement("div");
    d.className = cls;
    Object.assign(d.style, css);
    parent.appendChild(d);
    return d;
  }

  cylinder(parent, g, kind, bg) {
    const sec = this.el("b-sec", parent, { top: g.y + "px", height: g.h + "px" });
    const w = 2 * g.r * Math.tan(Math.PI / g.n);
    for (let i = 0; i < g.n; i++) {
      const a = ((i + 0.5) / g.n - 0.5) * 360;
      const s = this.el("b-strip" + (kind === "glass" ? " both" : ""), sec, {
        width: w + 0.7 + "px",
        left: -w / 2 - 0.35 + "px",
        transform: `rotateY(${a}deg) translateZ(${g.r}px)`,
        background: bg || "",
      });
      if (kind === "label") {
        s.style.backgroundSize = `${w * g.n}px ${g.h}px`;
        s.style.backgroundPosition = `${-i * w + 0.35}px 0`;
        s.dataset.label = "1";
      }
      const sh = this.el("sh", s); const hl = this.el("hl", s);
      // ganti <div> jadi <i> tidak perlu; class sudah cukup
      sh.style.position = hl.style.position = "absolute";
      sh.style.inset = hl.style.inset = "0";
      this.strips.push({ s, sh, hl, a, kind, cosPrev: 9 });
    }
    return sec;
  }

  disc(parent, y, r, bg, extra = {}) {
    const sec = this.el("b-sec", parent, { top: y + "px", height: "0px" });
    this.el("b-disc", sec, Object.assign({ left: -r + "px", top: -r + "px", width: 2 * r + "px", height: 2 * r + "px", background: bg, transform: "rotateX(90deg)" }, extra));
    return sec;
  }

  build() {
    const h = this.host;
    h.innerHTML = "";
    this.scale = this.el("b-scale", h);
    this.el("b-shadow", this.scale);
    const fl = this.el("b-float", this.scale);
    const stage = this.el("b-stage", fl);
    this.rotEl = this.el("b-rot", stage);
    const R = this.rotEl;

    // badan botol
    this.cylinder(R, GEO.upper, "glass", BG.upper);
    this.cylinder(R, GEO.label, "label");
    this.cylinder(R, GEO.lower, "glass", BG.lower);
    this.disc(R, GEO.lower.y + GEO.lower.h, 89, "radial-gradient(circle, rgba(170,215,245,.55), rgba(140,195,235,.7))");
    this.disc(R, GEO.upper.y + GEO.upper.h * 0.42, 88, "radial-gradient(circle, rgba(220,242,255,.35), rgba(190,228,250,.55))");

    // selang pompa (dip tube)
    [0, 90].forEach((ry) => {
      const t = this.el("b-sec", R, { top: GEO.collar.y + GEO.collar.h + "px", height: GEO.height - 12 - GEO.collar.y - GEO.collar.h + "px" });
      this.el("b-strip both", t, { width: "4px", left: "-2px", transform: `rotateY(${ry}deg)`, background: "rgba(255,255,255,.85)", boxShadow: "0 0 0 .5px rgba(120,170,210,.5)" });
    });

    // kerah putih
    this.cylinder(R, GEO.collar, "white", BG.white);
    this.disc(R, GEO.collar.y, 84, "radial-gradient(circle, #ffffff 0%, #eef5fb 70%, #dbe8f3 100%)");

    // aktuator (tombol semprot) di dalam tutup
    this.act = this.el("b-grp b-act", R);
    this.cylinder(this.act, GEO.act, "white", BG.act);
    this.disc(this.act, GEO.act.y, 40, "radial-gradient(circle, #fff 0%, #f3f8fc 80%, #e1ecf5 100%)");
    this.cylinder(this.act, GEO.stem, "white", BG.act);
    this.disc(this.act, GEO.stem.y, 9, "#fff");
    const nz = this.el("b-sec", this.act, { top: GEO.act.y + 18 + "px", height: "0px" });
    this.el("b-disc", nz, { left: "-4px", top: "-4px", width: "8px", height: "8px", background: "#9fb7cc", transform: `translateZ(${GEO.act.r + 0.6}px)` });
    this.nozzle = this.el("b-nozzle", nz, { transform: `translateZ(${GEO.act.r + 2}px)` });

    // tutup transparan
    this.cap = this.el("b-grp b-cap", R);
    this.cylinder(this.cap, GEO.cap, "glass", BG.cap);
    this.disc(this.cap, GEO.cap.y, 80, "radial-gradient(circle, rgba(255,255,255,.25) 0%, rgba(255,255,255,.18) 70%, rgba(255,255,255,.6) 100%)", { boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,.8)" });

    if (LABEL_URL) this.setTexture(LABEL_URL);
  }

  setTexture(url) {
    this.strips.forEach((st) => { if (st.kind === "label") st.s.style.backgroundImage = `url(${url})`; });
  }

  resize() {
    const r = this.host.getBoundingClientRect();
    this.s = Math.max(0.35, Math.min(r.height / 760, r.width / 320));
    this.scale.style.transform = `scale(${this.s})`;
  }

  bind() {
    const h = this.host;
    let lastX = 0, startX = 0, moved = 0;
    h.addEventListener("pointerdown", (e) => {
      this.dragging = true; moved = 0; lastX = startX = e.clientX;
      h.classList.add("dragging");
      h.setPointerCapture?.(e.pointerId);
    });
    h.addEventListener("pointermove", (e) => {
      const r = h.getBoundingClientRect();
      const py = (e.clientY - r.top) / r.height - 0.5;
      this.tiltTarget = -8 - py * 14;
      if (!this.dragging) return;
      const dx = e.clientX - lastX; lastX = e.clientX;
      moved += Math.abs(dx);
      this.rot += dx * 0.55;
      this.vel = dx * 0.55 * 60;
    });
    const up = () => {
      if (!this.dragging) return;
      this.dragging = false; h.classList.remove("dragging");
      if (moved < 4) this.spray();
    };
    h.addEventListener("pointerup", up);
    h.addEventListener("pointercancel", up);
    h.addEventListener("pointerleave", () => { this.tiltTarget = -8; });
    new IntersectionObserver(([en]) => (this.visible = en.isIntersecting)).observe(h);
  }

  spray() {
    if (this.host.classList.contains("spraying")) return;
    this.host.classList.add("spraying");
    // putar agar nozzle menghadap kanan
    const target = this.rot + norm(55 - this.rot);
    this.sprayTarget = target;
    this.pause = 2.2;
    setTimeout(() => {
      const p = this.nozzle.getBoundingClientRect();
      Mist.burst(p.left, p.top, this.s);
      const b = document.createElement("div");
      b.className = "mist-bubble";
      b.textContent = CONFIG.sprayMessage;
      b.style.left = p.left + 150 * this.s + "px";
      b.style.top = p.top - 70 * this.s + "px";
      document.body.appendChild(b);
      setTimeout(() => b.remove(), 1900);
    }, 650);
    setTimeout(() => { this.host.classList.remove("spraying"); this.sprayTarget = null; }, 2100);
  }

  update(dt) {
    if (!this.visible) return;
    if (this.sprayTarget != null) {
      this.rot += (this.sprayTarget - this.rot) * Math.min(1, dt * 7);
      this.vel = 0;
    } else if (!this.dragging) {
      this.vel *= Math.pow(0.04, dt);
      this.rot += this.vel * dt;
      if (this.pause > 0) this.pause -= dt;
      else if (Math.abs(this.vel) < 30) this.rot += CONFIG.autoRotateSpeed * dt;
    }
    this.tilt += (this.tiltTarget - this.tilt) * Math.min(1, dt * 4);
    this.rotEl.style.transform = `rotateX(${this.tilt}deg) rotateY(${this.rot}deg)`;
    this.shade();
  }

  // pencahayaan per-strip: bayangan, kilap (specular), dan pantulan tepi kaca
  shade() {
    const L = -38;
    for (const st of this.strips) {
      const rel = norm(st.a + this.rot);
      const c = Math.cos(rad(rel));
      if (st.kind !== "glass" && c < -0.05) continue;
      if (Math.abs(c - st.cosPrev) < 0.004) continue;
      st.cosPrev = c;
      const spec = Math.exp(-(((rel - -30) / 11) ** 2));
      const rim = Math.exp(-(((rel - 72) / 10) ** 2));
      if (st.kind === "glass") {
        const f = Math.pow(1 - Math.abs(c), 2.2);
        const front = c > 0;
        st.hl.style.opacity = (0.04 + 0.6 * f + (front ? spec * 0.75 + rim * 0.35 : spec * 0.18)).toFixed(3);
        st.sh.style.opacity = (0.14 * f).toFixed(3);
      } else {
        const diff = Math.max(0, Math.cos(rad(rel - L)));
        st.sh.style.opacity = ((1 - (0.3 + 0.7 * diff)) * 0.5 + Math.pow(1 - Math.max(c, 0), 4) * 0.25).toFixed(3);
        st.hl.style.opacity = (spec * (st.kind === "label" ? 0.5 : 0.7) + rim * 0.25).toFixed(3);
      }
    }
  }
}

/* =====================================================================
   3. KABUT SEMPROTAN
   ===================================================================== */
const Mist = (() => {
  const cv = $("#mist-canvas");
  const ctx = cv.getContext("2d");
  let parts = [], dpr = 1, running = false, last = 0;
  const fit = () => { dpr = Math.min(2, window.devicePixelRatio || 1); cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; };
  fit(); addEventListener("resize", fit);

  function burst(x, y, s = 1) {
    let n = 0;
    const iv = setInterval(() => {
      for (let i = 0; i < 9; i++) {
        const t = Math.random();
        parts.push({
          x, y,
          vx: (240 + Math.random() * 420) * s,
          vy: (-110 + Math.random() * 150) * s,
          r: (2 + Math.random() * 4) * s,
          g: (14 + Math.random() * 22) * s,
          life: 1,
          d: 0.55 + Math.random() * 0.6,
          c: t < 0.8 ? "205,238,255" : t < 0.92 ? "150,214,90" : "255,120,185",
        });
      }
      if (++n > 34) clearInterval(iv);
    }, 16);
    if (!running) { running = true; last = performance.now(); requestAnimationFrame(loop); }
  }

  function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    parts = parts.filter((p) => p.life > 0);
    for (const p of parts) {
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.vx *= Math.pow(0.12, dt); p.vy = p.vy * Math.pow(0.3, dt) - 18 * dt;
      p.r += p.g * dt; p.life -= p.d * dt;
      const a = Math.max(0, p.life) * 0.55;
      const gr = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      gr.addColorStop(0, `rgba(${p.c},${a})`);
      gr.addColorStop(1, `rgba(${p.c},0)`);
      ctx.fillStyle = gr;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    }
    if (parts.length) requestAnimationFrame(loop);
    else { running = false; ctx.clearRect(0, 0, innerWidth, innerHeight); }
  }
  return { burst };
})();

/* =====================================================================
   4. INISIALISASI
   ===================================================================== */
function initBottles() {
  LABEL_URL = drawLabelTexture(2 * GEO.label.r * Math.tan(Math.PI / GEO.label.n) * GEO.label.n, GEO.label.h);
  $$(".bottle-host").forEach((h) => new Bottle(h));
  let last = performance.now();
  const loop = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    bottles.forEach((b) => b.update(dt));
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  addEventListener("resize", () => bottles.forEach((b) => b.resize()));

  // gambar ulang label setelah font Fredoka selesai dimuat
  if (document.fonts && document.fonts.load) {
    Promise.all([
      document.fonts.load("700 40px Fredoka"),
      document.fonts.load("600 12px 'Plus Jakarta Sans'"),
    ]).then(() => {
      LABEL_URL = drawLabelTexture(2 * GEO.label.r * Math.tan(Math.PI / GEO.label.n) * GEO.label.n, GEO.label.h);
      bottles.forEach((b) => b.setTexture(LABEL_URL));
    }).catch(() => {});
  }

  const sprayBtn = $("#sprayBtn");
  if (sprayBtn) sprayBtn.addEventListener("click", () => bottles[0] && bottles[0].spray());

  // hover spesifikasi → angkat tutup botol anatomi
  const anat = $("#anatomyBottle");
  $$(".spec").forEach((sp) => {
    sp.addEventListener("mouseenter", () => { sp.classList.add("active"); if (sp.dataset.spot === "cap" || sp.dataset.spot === "pump") anat.classList.add("lift"); });
    sp.addEventListener("mouseleave", () => { sp.classList.remove("active"); anat.classList.remove("lift"); });
  });
}

function initUI() {
  // navbar
  const nav = $("#nav");
  addEventListener("scroll", () => nav.classList.toggle("scrolled", scrollY > 30), { passive: true });
  $("#navToggle").addEventListener("click", () => nav.classList.toggle("open"));
  $$(".nav-links a").forEach((a) => a.addEventListener("click", () => nav.classList.remove("open")));

  // gelembung naik di hero
  const bub = $("#bubbles");
  const R = rng(11);
  for (let i = 0; i < 18; i++) {
    const s = document.createElement("span");
    const size = 10 + R() * 46;
    Object.assign(s.style, { left: R() * 100 + "%", width: size + "px", height: size + "px", animationDuration: 12 + R() * 16 + "s", animationDelay: -R() * 20 + "s" });
    bub.appendChild(s);
  }

  // animasi muncul saat scroll + counter + bar dana
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      el.classList.add("in");
      $$("[data-count]", el).forEach(countUp);
      $$(".bar i", el).forEach((b) => (b.style.width = b.dataset.value + "%"));
      io.unobserve(el);
    });
  }, { threshold: 0.15 });
  $$(".reveal").forEach((el, i) => { el.style.transitionDelay = (i % 4) * 70 + "ms"; io.observe(el); });

  // kartu foto 3D tilt
  const card = $("#tiltCard");
  if (card) {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(900px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg)`;
    });
    card.addEventListener("pointerleave", () => (card.style.transform = ""));
  }
}

function countUp(el) {
  const end = parseFloat(el.dataset.count), dec = +(el.dataset.decimals || 0);
  const t0 = performance.now(), dur = 1600;
  const step = (now) => {
    const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
    el.textContent = (end * e).toFixed(dec).replace(".", ",");
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

document.addEventListener("DOMContentLoaded", () => { initUI(); initBottles(); });
