/* =====================================================================
   OmT Apps — portal con todas las apps de OmT Finance (datos en apps.js)
   ===================================================================== */
const APP_VERSION = '0.4.11';
const DISPLAY_KEY = 'omtapps:display';

const $ = (id) => document.getElementById(id);

const ICONS = {
  open: '<path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5"/><circle cx="12" cy="7.8" r=".9" fill="currentColor" stroke="none"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  shield: '<path d="M12 3.5l7 2.8v5.2c0 4.4-2.9 7.8-7 9-4.1-1.2-7-4.6-7-9V6.3z"/><path d="M9 12l2.2 2.2L15.5 10"/>',
  palette: '<path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.6-.9 1.2-1.8-.5-1-.1-2.2 1.1-2.2H17a4 4 0 0 0 4-4c0-5.5-4-10-9-10z"/><circle cx="7.5" cy="11" r="1.2"/><circle cx="10" cy="7" r="1.2"/><circle cx="15" cy="7.5" r="1.2"/>',
  share: '<path d="M12 3.5v11M8 7.5l4-4 4 4"/><path d="M7 10.5H6a1.5 1.5 0 0 0-1.5 1.5v7A1.5 1.5 0 0 0 6 20.5h12a1.5 1.5 0 0 0 1.5-1.5v-7a1.5 1.5 0 0 0-1.5-1.5h-1"/>',
  more: '<circle cx="12" cy="5.5" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="18.5" r="1.5" fill="currentColor"/>',
  add: '<rect x="4" y="4" width="16" height="16" rx="3.5"/><path d="M12 8.5v7M8.5 12h7"/>',
  desktop: '<rect x="3" y="4.5" width="18" height="12" rx="1.5"/><path d="M9 20h6M12 16.5V20"/>',
};
const icon = (name, size = 22) =>
  `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;

// Logo de OmT Apps: anillo fino, anillo discontinuo, arco y cuadrícula de apps de líneas finas
let logoCount = 0;
function logoSVG(size) {
  const id = `oa-g${logoCount++}`;
  return `
    <svg class="logo-mark" viewBox="0 0 120 120" width="${size}" height="${size}" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <defs>
        <linearGradient id="${id}" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stop-color="#818cf8"/><stop offset=".5" stop-color="#c4b5fd"/><stop offset="1" stop-color="#a5f3fc"/>
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="52" stroke="url(#${id})" stroke-width="1.2" opacity=".55"/>
      <circle cx="60" cy="60" r="42" stroke="url(#${id})" stroke-width=".8" stroke-dasharray="2 5" opacity=".6"/>
      <path d="M60 8 A52 52 0 0 1 112 60" stroke="url(#${id})" stroke-width="3"/>
      <circle cx="112" cy="60" r="3" fill="#a5f3fc" stroke="none"/>
      <rect x="41" y="41" width="16" height="16" rx="4.5" stroke="url(#${id})" stroke-width="1.8"/>
      <circle cx="71" cy="49" r="8" stroke="url(#${id})" stroke-width="1.8"/>
      <rect x="41" y="63" width="16" height="16" rx="4.5" stroke="url(#${id})" stroke-width="1.8"/>
      <rect x="63" y="63" width="16" height="16" rx="4.5" stroke="url(#${id})" stroke-width="1.8"/>
    </svg>`;
}
document.querySelectorAll('[data-logo]').forEach((el) => { el.innerHTML = logoSVG(Number(el.dataset.logo)); });
$('privacy-icon').innerHTML = icon('shield', 15);

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (_) {
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (_) {
    return false;
  }
}

function toast(text) {
  document.querySelector('.toast')?.remove();
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = text;
  document.body.append(t);
  setTimeout(() => t.remove(), 2200);
}

// ---------- Intro ----------
// Los iconos llegan volando desde fuera, orbitan el logo, aterrizan uno a uno en su fila y aparece la frase.
// «Saltar» (o un enlace directo a una app, #underctrl…) va directamente al final.

const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const TITLE = [['Apps'], ['sencillas'], ['para'], ['tu'], ['día', 1], ['a', 1], ['día.', 1]];
const T_ORBIT = 1300;   // empiezan a girar
const T_ROW = 3100;     // el primero deja el círculo
const T_FLY = 1300;     // lo que tarda cada uno en llegar a la fila
const T_GAP = 90;       // retraso entre un icono y el siguiente
let introEvents = [];  // [ms, fn] pendientes, medidos con el reloj de las animaciones
let introFrame = 0;
let introDone = false;

// Tamaño de los iconos de la fila según el ancho de la ventana
function introIconSize() {
  const n = APPS.length;
  const ii = Math.round(Math.max(36, Math.min(64, (innerWidth - 32 - (n - 1) * 12) / n)));
  $('intro')?.style.setProperty('--ii', `${ii}px`);
  return ii;
}
// Ya en fila, si cambia el tamaño de la ventana los iconos se ajustan (durante el vuelo no: irían a otro sitio)
window.addEventListener('resize', () => { if (introDone) introIconSize(); });

function buildIntro() {
  const n = APPS.length;
  const vw = innerWidth;
  introIconSize();
  const ring = Math.round(Math.min(150, vw * 0.34, innerHeight * 0.2));
  $('icon-row').innerHTML = APPS.map((a, i) => `<span class="slot" style="--c:${a.color};--i:${i}"></span>`).join('');
  $('orbit').innerHTML = APPS.map((a, i) =>
    `<span class="ip" style="--c:${a.color};--i:${i}"><span class="ir"><img src="icons/apps/${a.id}.svg" alt="" /></span></span>`).join('');
  $('intro-title').innerHTML = TITLE.map(([w, g]) => `<span class="w${g ? ' g' : ''}" aria-hidden="true">${w}</span>`).join(' ');
  return { n, ring, vw };
}

function playIntro() {
  const { n, ring, vw } = buildIntro();
  if (reduceMotion()) return finishIntro();
  const far = Math.hypot(vw, innerHeight) * 0.62;
  const ease = 'cubic-bezier(.2, .8, .2, 1)';
  const glide = 'cubic-bezier(.65, 0, .35, 1)'; // arranque y llegada suaves
  const total = T_ROW + T_FLY + (n - 1) * T_GAP;

  // Destino de cada icono: el centro de su hueco en la fila, respecto al centro de la pantalla
  const box = $('intro').getBoundingClientRect();
  const midX = box.left + box.width / 2;
  const midY = box.top + box.height / 2;
  const slots = [...$('icon-row').children].map((s) => {
    const r = s.getBoundingClientRect();
    return [r.left + r.width / 2 - midX, r.top + r.height / 2 - midY];
  });

  [...$('orbit').children].forEach((ip, i) => {
    const ang = (-90 + (i * 360) / n) * (Math.PI / 180);
    const from = Math.random() * Math.PI * 2;
    const sx = Math.cos(from) * far;
    const sy = Math.sin(from) * far;
    const cx = Math.cos(ang) * ring;
    const cy = Math.sin(ang) * ring;
    const [rx, ry] = slots[i];
    const spin = (Math.random() < 0.5 ? -1 : 1) * (120 + Math.random() * 120);
    const leave = T_ROW + i * T_GAP;
    ip.animate([
      { offset: 0, transform: `translate(${sx}px, ${sy}px) rotate(${spin}deg) scale(.3)`, opacity: 0 },
      { offset: (i * 110) / total, transform: `translate(${sx}px, ${sy}px) rotate(${spin}deg) scale(.3)`, opacity: 0, easing: ease },
      { offset: (950 + i * 110) / total, transform: `translate(${cx}px, ${cy}px) rotate(0deg) scale(1)`, opacity: 1 },
      { offset: leave / total, transform: `translate(${cx}px, ${cy}px) rotate(0deg) scale(1)`, opacity: 1, easing: glide },
      { offset: (leave + T_FLY) / total, transform: `translate(${rx}px, ${ry}px) rotate(0deg) scale(1)`, opacity: 1 },
      { offset: 1, transform: `translate(${rx}px, ${ry}px) rotate(0deg) scale(1)`, opacity: 1 },
    ], { duration: total, fill: 'forwards' });
    // Cada icono gira al revés que la órbita para seguir derecho
    ip.firstElementChild.animate([
      { transform: 'rotate(0deg)' },
      { offset: T_ORBIT / T_ROW, transform: 'rotate(0deg)', easing: 'cubic-bezier(.45, 0, .25, 1)' },
      { transform: 'rotate(-360deg)' },
    ], { duration: T_ROW, fill: 'forwards' });
  });
  $('orbit').animate([
    { transform: 'rotate(0deg)' },
    { offset: T_ORBIT / T_ROW, transform: 'rotate(0deg)', easing: 'cubic-bezier(.45, 0, .25, 1)' },
    { transform: 'rotate(360deg)' },
  ], { duration: T_ROW, fill: 'forwards' });
  $('intro-logo').animate([
    { opacity: 0, transform: 'translate(-50%, -50%) scale(.6)' },
    { offset: 0.2, opacity: 0, transform: 'translate(-50%, -50%) scale(.6)', easing: ease },
    { offset: 0.4, opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
    { offset: 0.8, opacity: 1, transform: 'translate(-50%, -50%) scale(1)', easing: glide },
    { opacity: 0, transform: 'translate(-50%, -50%) scale(.7)' },
  ], { duration: T_ROW + 600, fill: 'forwards' });

  // Título: aparece pequeño arriba y, mientras los iconos aterrizan, baja creciendo hasta encima de ellos
  const mark = $('intro-mark');
  const topY = $('skip-btn').getBoundingClientRect().top;
  const dy = Math.min(0, topY - mark.getBoundingClientRect().top);
  const small = `translateY(${dy}px) scale(.45)`;
  mark.classList.add('on');
  mark.animate([
    { offset: 0, transform: small, opacity: 0 },
    { offset: 200 / total, transform: small, opacity: 0, easing: 'ease' },
    { offset: 1100 / total, transform: small, opacity: 1 },
    { offset: (T_ROW - 250) / total, transform: small, opacity: 1, easing: glide },
    { offset: 1, transform: 'none', opacity: 1 },
  ], { duration: total, fill: 'both' });

  // Los pasos siguen el reloj de las animaciones (no setTimeout): si el navegador tarda en pintar
  // el primer fotograma o las pausa, los pasos esperan con ellas y nada salta de golpe al final.
  const words = [...$('intro-title').children];
  const tWords = T_ROW + T_FLY - 300;
  const tEnd = tWords + words.length * 130 + 500;
  const at = (ms, fn) => introEvents.push([ms, fn]);
  at(200, () => $('intro-by').classList.add('on'));
  // Las palabras se encadenan solas con animation-delay: aunque el navegador se atasque un
  // instante, no salen amontonadas. Los iconos pasan a su fila al final, cuando ya no se mueve nada.
  at(tWords, () => words.forEach((w, k) => {
    w.style.animationDelay = `${k * 130}ms`;
    w.classList.add('on');
  }));
  at(tEnd, () => finishIntro());
  introEvents.sort((a, b) => a[0] - b[0]);
  const clock = $('intro').animate({ opacity: [1, 1] }, { duration: tEnd });
  const tick = () => {
    const t = clock.currentTime ?? 0;
    while (introEvents.length && introEvents[0][0] <= t) introEvents.shift()[1]();
    if (!introDone && introEvents.length) introFrame = requestAnimationFrame(tick);
  };
  introFrame = requestAnimationFrame(tick);
}

// Los iconos pasan de la animación a sus huecos de la fila (misma posición: no se nota) y flotan suavemente
function toRow() {
  const orbit = $('orbit');
  if (!orbit.children.length) return;
  orbit.getAnimations({ subtree: true }).forEach((a) => a.cancel());
  const slots = [...$('icon-row').children];
  [...orbit.querySelectorAll('img')].forEach((img, i) => slots[i]?.append(img));
  orbit.innerHTML = '';
}

function finishIntro(skip = false) {
  if (introDone) return;
  introDone = true;
  cancelAnimationFrame(introFrame);
  introEvents = [];
  $('intro').getAnimations().forEach((a) => a.cancel());
  $('intro-logo').getAnimations().forEach((a) => a.cancel());
  $('intro-logo').style.opacity = '0';
  toRow();
  $('intro').classList.add('done');
  $('intro-mark').classList.add('on');
  $('intro-mark').getAnimations().forEach((a) => a.cancel());
  $('intro-by').classList.add('on');
  $('intro-title').querySelectorAll('.w').forEach((w) => {
    if (skip) w.style.animationDelay = '0ms'; // al saltar, todas a la vez
    w.classList.add('on');
  });
  $('intro-enter').classList.add('on');
}
$('skip-btn').addEventListener('click', () => finishIntro(true));

function enter(instant = false) {
  const body = document.body;
  if (body.classList.contains('entering')) return;
  const done = () => {
    $('intro')?.remove();
    body.classList.remove('booting', 'entering');
    const id = location.hash.slice(1);
    const a = APPS.find((x) => x.id === id);
    goTo(a ? sections.findIndex((s) => s.id === a.section) : current, false);
    onRailScroll();
    if (a) openDetail(id, { push: false });
  };
  if (instant) return done();
  body.classList.add('entering');
  setTimeout(done, 850);
}
$('enter-btn').addEventListener('click', () => enter());

// ---------- Bloques deslizables (uno por sección) ----------

const appStyle = (a) => `--c:${a.color};--g:${a.grad}`;
const appIcon = (a, size) => `<img class="app-icon" src="icons/apps/${a.id}.svg" width="${size}" height="${size}" alt="" />`;

function openButton(a, label = 'Abrir') {
  return a.url
    ? `<a class="btn primary" href="${a.url}" target="_blank" rel="noopener" data-open>${icon('open', 18)}<span>${label}</span></a>`
    : '<span class="btn soon">Próximamente</span>';
}

const rail = $('rail');
const sections = SECTIONS.filter((s) => APPS.some((a) => a.section === s.id));
let current = 0;

function renderBlocks() {
  rail.innerHTML = sections.map((s) => {
    const apps = APPS.filter((a) => a.section === s.id);
    return `
      <section class="block" style="--s1:${s.c1};--s2:${s.c2}" data-sec="${s.id}" aria-label="${s.title}">
        <div class="block-card">
          <span class="glow a"></span><span class="glow b"></span>
          <div class="block-head">
            <h2 class="block-title">${s.title}</h2>
            <p class="block-text">${s.text}</p>
          </div>
          <div class="tiles">
            ${apps.map((a, i) => `
              <button class="tile" type="button" style="${appStyle(a)};--i:${i};--z:${8 + ((i * 7) % 3) * 5}" data-app="${a.id}" aria-label="${a.plain}: ${a.tagline}">
                <span class="tile-icon"><img src="icons/apps/${a.id}.svg" alt="" draggable="false" /></span>
                <span class="tile-name">${a.name}</span>
                <span class="tile-tag">${a.tagline}</span>
              </button>`).join('')}
          </div>
        </div>
      </section>`;
  }).join('');

  $('tabs').innerHTML = `<span class="tab-ind" id="tab-ind"></span>${sections.map((s, i) =>
    `<button class="tab" type="button" data-i="${i}">${s.title}</button>`).join('')}`;
}

const blocks = () => [...rail.querySelectorAll('.block')];

// Desplazamiento que centra el bloque i
const blockLeft = (i) => {
  const b = blocks()[i];
  return b ? b.offsetLeft + b.offsetWidth / 2 - rail.clientWidth / 2 : 0;
};

function goTo(i, smooth = true) {
  i = Math.max(0, Math.min(sections.length - 1, i));
  rail.scrollTo({ left: blockLeft(i), behavior: smooth && !reduceMotion() ? 'smooth' : 'auto' });
  setCurrent(i);
}

function setCurrent(i) {
  current = i;
  blocks().forEach((b, k) => {
    b.classList.toggle('current', k === i);
    if (k === i) b.classList.add('seen');
  });
  const tabs = [...$('tabs').querySelectorAll('.tab')];
  tabs.forEach((t, k) => t.classList.toggle('on', k === i));
  const t = tabs[i];
  const ind = $('tab-ind');
  if (t && ind) {
    ind.style.width = `${t.offsetWidth}px`;
    ind.style.transform = `translateX(${t.offsetLeft}px)`;
    ind.style.setProperty('--t1', sections[i].c1);
    ind.style.setProperty('--t2', sections[i].c2);
  }
  $('rail-prev').disabled = i === 0;
  $('rail-next').disabled = i === sections.length - 1;
}

// Efecto carrusel: los bloques laterales giran y se alejan según su distancia al centro
let frame = 0;
function onRailScroll() {
  if (frame) return;
  frame = requestAnimationFrame(() => {
    frame = 0;
    const mid = rail.scrollLeft + rail.clientWidth / 2;
    let best = 0;
    let bestD = Infinity;
    blocks().forEach((b, k) => {
      const step = b.offsetWidth + 18;
      const d = Math.max(-1, Math.min(1, (b.offsetLeft + b.offsetWidth / 2 - mid) / step));
      b.style.setProperty('--d', d.toFixed(3));
      b.style.setProperty('--ad', Math.abs(d).toFixed(3));
      if (Math.abs(d) < bestD) { bestD = Math.abs(d); best = k; }
    });
    if (best !== current || !blocks()[best]?.classList.contains('current')) setCurrent(best);
  });
}
rail.addEventListener('scroll', onRailScroll, { passive: true });
window.addEventListener('resize', () => { goTo(current, false); onRailScroll(); });

$('tabs').addEventListener('click', (e) => {
  const t = e.target.closest('.tab');
  if (t) goTo(Number(t.dataset.i));
});
$('rail-prev').addEventListener('click', () => goTo(current - 1));
$('rail-next').addEventListener('click', () => goTo(current + 1));

// Arrastrar con el ratón (con el dedo ya se desliza solo)
let drag = null;
let justDragged = false;
rail.addEventListener('pointerdown', (e) => {
  if (e.pointerType !== 'mouse' || e.button !== 0) return;
  drag = { x: e.clientX, left: rail.scrollLeft, moved: false, id: e.pointerId };
});
window.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const dx = e.clientX - drag.x;
  if (!drag.moved && Math.abs(dx) > 6) {
    drag.moved = true;
    rail.classList.add('dragging');
  }
  if (drag.moved) rail.scrollLeft = drag.left - dx;
});
window.addEventListener('pointerup', (e) => {
  if (!drag) return;
  const dx = e.clientX - drag.x;
  const moved = drag.moved;
  drag = null;
  if (!moved) return;
  rail.classList.remove('dragging');
  justDragged = true;
  setTimeout(() => { justDragged = false; }, 0);
  // Basta un arrastre corto para pasar de bloque
  const start = current;
  goTo(Math.abs(dx) > 60 ? start + (dx < 0 ? 1 : -1) : start);
});
rail.addEventListener('click', (e) => {
  if (justDragged) { e.stopPropagation(); e.preventDefault(); return; }
  const tile = e.target.closest('.tile');
  if (tile) openDetail(tile.dataset.app);
}, true);

// Rueda del ratón: un bloque por gesto (el desplazamiento lateral del trackpad va solo)
let wheelLock = 0;
let wheelAcc = 0;
$('rail').parentElement.addEventListener('wheel', (e) => {
  if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
  const tiles = e.target.closest('.tiles');
  if (tiles && tiles.scrollHeight > tiles.clientHeight + 2) return;
  e.preventDefault();
  if (Date.now() < wheelLock) return;
  wheelAcc += e.deltaY;
  if (Math.abs(wheelAcc) > 40) {
    goTo(current + (wheelAcc > 0 ? 1 : -1));
    wheelAcc = 0;
    wheelLock = Date.now() + 650;
  }
}, { passive: false });

// Teclado: flechas izquierda y derecha
document.addEventListener('keydown', (e) => {
  if (document.body.classList.contains('booting') || document.querySelector('.sheet-backdrop')) return;
  if (e.key === 'ArrowRight') goTo(current + 1);
  if (e.key === 'ArrowLeft') goTo(current - 1);
});

// Paralaje: iconos y luces siguen al ratón (de -1 a 1 desde el centro de la pantalla)
window.addEventListener('pointermove', (e) => {
  if (e.pointerType !== 'mouse' || reduceMotion()) return;
  rail.style.setProperty('--px', ((e.clientX / innerWidth) * 2 - 1).toFixed(3));
  rail.style.setProperty('--py', ((e.clientY / innerHeight) * 2 - 1).toFixed(3));
});

// ---------- Ficha de una app ----------

const ua = navigator.userAgent;
// El iPad con iPadOS se identifica como Mac, pero tiene pantalla táctil
const isIOS = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
const isAndroid = /Android/.test(ua);

function installSteps(name) {
  if (isIOS) {
    return [
      ['open', 'Pulsa <b>Abrir</b> para ir a la app en Safari.'],
      ['share', 'Pulsa el botón <b>Compartir</b> (abajo en el iPhone, arriba en el iPad).'],
      ['add', `Elige <b>Añadir a pantalla de inicio</b>. El icono de ${name} aparecerá junto a tus apps.`],
    ];
  }
  if (isAndroid) {
    return [
      ['open', 'Pulsa <b>Abrir</b> para ir a la app en Chrome.'],
      ['more', 'Pulsa el menú <b>⋮</b>, arriba a la derecha.'],
      ['add', `Elige <b>Instalar aplicación</b>. El icono de ${name} aparecerá junto a tus apps.`],
    ];
  }
  return [
    ['open', 'Pulsa <b>Abrir</b> para usarla en el navegador.'],
    ['desktop', 'En Chrome o Edge puedes instalarla con el icono <b>Instalar</b> de la barra de direcciones.'],
    ['add', 'En el móvil se añade a la pantalla de inicio y funciona como una app más.'],
  ];
}

function closeSheet() {
  document.querySelector('.sheet-backdrop')?.remove();
}

function openDetail(id, { push = true } = {}) {
  const a = APPS.find((x) => x.id === id);
  if (!a) return;
  closeSheet();
  const back = document.createElement('div');
  back.className = 'sheet-backdrop';
  back.innerHTML = `
    <div class="sheet detail" style="${appStyle(a)}" role="dialog" aria-modal="true" aria-label="${a.plain}">
      <button class="icon-btn sheet-close" type="button" aria-label="Cerrar">${icon('close', 18)}</button>
      <div class="ac-head">
        ${appIcon(a, 68)}
        <div class="ac-name-wrap">
          <h2 class="ac-name">${a.name}</h2>
          <p class="ac-tagline">${a.tagline}</p>
        </div>
      </div>
      <div class="ac-meta">
        ${a.tags.map((t) => `<span class="pill">${t}</span>`).join('')}
      </div>
      <p class="detail-text">${a.description}</p>
      <p class="opt-label">Qué puedes hacer</p>
      <ul class="features">
        ${a.features.map((f) => `<li>${icon('check', 18)}<span>${f}</span></li>`).join('')}
      </ul>
      ${a.url ? `
        <p class="opt-label">Cómo instalarla</p>
        <ol class="install-steps">
          ${installSteps(a.plain).map(([ic, text]) => `<li><span class="step-icon">${icon(ic, 20)}</span><span>${text}</span></li>`).join('')}
        </ol>` : ''}
      <div class="ac-actions">
        <button class="btn" type="button" data-share>${icon('share', 18)}<span>Compartir</span></button>
        ${openButton(a, 'Abrir app')}
      </div>
    </div>`;
  document.body.append(back);
  if (push && location.hash !== `#${id}`) history.pushState(null, '', `#${id}`);
  const close = () => { if (location.hash === `#${id}`) history.back(); else closeSheet(); };
  back.addEventListener('click', (e) => { if (e.target === back) close(); });
  back.querySelector('.sheet-close').addEventListener('click', close);
  back.querySelector('[data-share]').addEventListener('click', () => share(`${a.plain} · ${a.tagline}`, `${location.origin}${location.pathname}#${id}`));
}

// El botón «Atrás» del móvil cierra la ficha; un enlace con #app la abre
window.addEventListener('popstate', () => {
  const id = location.hash.slice(1);
  if (APPS.some((a) => a.id === id)) openDetail(id, { push: false });
  else closeSheet();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && document.querySelector('.sheet-backdrop')) {
    if (location.hash) history.back(); else closeSheet();
  }
});

async function share(text, url) {
  if (navigator.share) {
    try { await navigator.share({ title: 'OmT Apps', text, url }); } catch (_) { /* cancelado */ }
    return;
  }
  try {
    await navigator.clipboard.writeText(url);
    toast('Enlace copiado');
  } catch (_) {
    prompt('Copia el enlace:', url);
  }
}

// ---------- Menú ⋯ ----------

const MENU = [
  { label: 'Compartir esta web', icon: 'share', run: () => share('Las apps de OmT Finance', `${location.origin}${location.pathname}`) },
  { label: 'Opciones de visualización', icon: 'palette', run: () => openDisplaySheet() },
  { label: 'Información', icon: 'info', run: () => openInfoSheet() },
];

// ---------- Información (menú ⋯): qué es, versiones, privacidad e instalación ----------

function openInfoSheet() {
  closeSheet();
  const install = isIOS
    ? 'En Safari, pulsa <b>Compartir</b> y elige <b>Añadir a pantalla de inicio</b>.'
    : isAndroid
      ? 'En Chrome, abre el menú <b>⋮</b> y elige <b>Instalar aplicación</b>.'
      : 'En Chrome o Edge, pulsa el icono <b>Instalar</b> de la barra de direcciones.';
  const back = document.createElement('div');
  back.className = 'sheet-backdrop';
  back.innerHTML = `
    <div class="sheet info-sheet" role="dialog" aria-modal="true" aria-label="Información">
      <button class="icon-btn sheet-close" type="button" aria-label="Cerrar">${icon('close', 18)}</button>
      <div class="info-head">
        ${logoSVG(56)}
        <div>
          <h2 class="sheet-title">OmT <b>Apps</b></h2>
          <p class="muted small">by OmT Finance · OmT = OmbreTriste</p>
        </div>
      </div>
      <p class="detail-text">Un escaparate con todas las apps de OmT Finance: sencillas, gratis y sin anuncios. Se usan desde el navegador y se instalan en el móvil como una app más.</p>
      <dl class="info-stats">
        <div><dt>Apps</dt><dd>${APPS.length}</dd></div>
        <div><dt>Secciones</dt><dd>${sections.length}</dd></div>
        <div><dt>Precio</dt><dd>0 €</dd></div>
        <div><dt>Anuncios</dt><dd>0</dd></div>
      </dl>
      <p class="opt-label">Versiones</p>
      <ul class="info-versions">
        ${APPS.map((a) => `<li style="${appStyle(a)}">${appIcon(a, 30)}<span class="iv-name">${a.plain}</span><span class="iv-ver">${a.version}</span></li>`).join('')}
        <li><span class="iv-logo">${logoSVG(30)}</span><span class="iv-name">Esta web</span><span class="iv-ver">${APP_VERSION}</span></li>
      </ul>
      <p class="opt-label">Privacidad</p>
      <p class="small muted">Cada app guarda tus datos en tu dispositivo. La sincronización en la nube es opcional y solo se activa si creas una cuenta dentro de la app. Esta web no usa cookies ni estadísticas: solo recuerda en tu navegador el modo y el fondo que elijas.</p>
      <p class="opt-label">Instalar OmT Apps</p>
      <p class="small muted">${install}</p>
      <div class="body-actions"><button class="done-btn" type="button">Cerrar</button></div>
    </div>`;
  document.body.append(back);
  back.addEventListener('click', (e) => { if (e.target === back) closeSheet(); });
  back.querySelector('.sheet-close').addEventListener('click', closeSheet);
  back.querySelector('.done-btn').addEventListener('click', closeSheet);
}

function openMenu() {
  const menu = $('menu');
  menu.innerHTML = MENU.map((m, i) =>
    `<button class="menu-item" role="menuitem" data-i="${i}">${icon(m.icon, 20)}<span>${m.label}</span></button>`).join('');
  menu.querySelectorAll('.menu-item').forEach((b) => b.addEventListener('click', () => {
    closeMenu();
    MENU[b.dataset.i].run();
  }));
  const r = $('menu-btn').getBoundingClientRect();
  menu.style.top = `${r.bottom + 6}px`;
  menu.style.right = `${Math.max(8, window.innerWidth - r.right)}px`;
  menu.hidden = false;
  $('menu-btn').setAttribute('aria-expanded', 'true');
}

function closeMenu() {
  $('menu').hidden = true;
  $('menu-btn').setAttribute('aria-expanded', 'false');
}

$('menu-btn').addEventListener('click', (e) => {
  e.stopPropagation();
  if ($('menu').hidden) openMenu();
  else closeMenu();
});
document.addEventListener('click', (e) => {
  if (!$('menu').hidden && !e.target.closest('#menu')) closeMenu();
});
window.addEventListener('resize', closeMenu);

// ---------- Opciones de visualización (modo y fondo) ----------

const WALLS = {
  aurora: { name: 'Aurora', c: ['103 232 249', '196 181 253', '249 168 212', '129 140 248'] },
  glaciar: { name: 'Glaciar', c: ['96 165 250', '186 230 253', '56 189 248', '37 99 235'] },
  coral: { name: 'Coral', c: ['248 113 113', '253 164 175', '251 146 60', '244 63 94'] },
  menta: { name: 'Menta', c: ['52 211 153', '134 239 172', '45 212 191', '22 163 74'] },
};
const lightQuery = matchMedia('(prefers-color-scheme: light)');
let display = { theme: 'auto', wall: 'aurora', ...load(DISPLAY_KEY, {}) };
if (!WALLS[display.wall]) display.wall = 'aurora';

function applyDisplay() {
  const light = display.theme === 'light' || (display.theme === 'auto' && lightQuery.matches);
  document.documentElement.dataset.theme = light ? 'light' : 'dark';
  document.documentElement.dataset.wall = display.wall;
  document.querySelector('meta[name="theme-color"]').setAttribute('content', light ? '#f2f1fb' : '#0a0a12');
}
lightQuery.addEventListener('change', () => { if (display.theme === 'auto') applyDisplay(); });

// Miniatura de un fondo con los mismos degradados que el real
function wallPreview(key) {
  const [c1, c2, c3, c4] = WALLS[key].c;
  const light = document.documentElement.dataset.theme === 'light';
  const a = light ? 0.4 : 0.5;
  const base = light ? '#f2f1fb' : '#0a0a12';
  return `radial-gradient(70% 60% at 15% 10%, rgb(${c1} / ${a}), transparent 70%), radial-gradient(60% 55% at 90% 25%, rgb(${c2} / ${a * 0.8}), transparent 72%),
    radial-gradient(70% 60% at 75% 95%, rgb(${c3} / ${a * 0.85}), transparent 70%), radial-gradient(60% 55% at 5% 85%, rgb(${c4} / ${a * 0.8}), transparent 72%), ${base}`;
}

function openDisplaySheet() {
  closeSheet();
  const back = document.createElement('div');
  back.className = 'sheet-backdrop';
  document.body.append(back);
  back.addEventListener('click', (e) => { if (e.target === back) closeSheet(); });

  const draw = () => {
    back.innerHTML = `
      <div class="sheet" role="dialog" aria-modal="true" aria-label="Opciones de visualización">
        <h2 class="sheet-title">Opciones de visualización</h2>
        <p class="opt-label">Modo</p>
        <div class="seg" role="group" aria-label="Modo">
          ${[['dark', 'Oscuro'], ['light', 'Claro'], ['auto', 'Automático']].map(([v, l]) =>
            `<button type="button" data-theme-opt="${v}" class="${display.theme === v ? 'on' : ''}" aria-pressed="${display.theme === v}">${l}</button>`).join('')}
        </div>
        <p class="muted small">${display.theme === 'auto' ? 'Sigue el modo claro u oscuro del sistema.' : '&nbsp;'}</p>
        <p class="opt-label">Fondo</p>
        <div class="walls">
          ${Object.entries(WALLS).map(([k, w]) =>
            `<button type="button" class="wall ${display.wall === k ? 'on' : ''}" data-wall-opt="${k}" style="background:${wallPreview(k)}" aria-pressed="${display.wall === k}">${w.name}</button>`).join('')}
        </div>
        <div class="body-actions"><button class="done-btn" type="button">Listo</button></div>
      </div>`;
    back.querySelectorAll('[data-theme-opt]').forEach((b) => b.addEventListener('click', () => {
      display.theme = b.dataset.themeOpt;
      save(DISPLAY_KEY, display);
      applyDisplay();
      draw();
    }));
    back.querySelectorAll('[data-wall-opt]').forEach((b) => b.addEventListener('click', () => {
      display.wall = b.dataset.wallOpt;
      save(DISPLAY_KEY, display);
      applyDisplay();
      draw();
    }));
    back.querySelector('.done-btn').addEventListener('click', closeSheet);
  };
  draw();
}

applyDisplay();
renderBlocks();
setCurrent(0);
if (APPS.some((a) => a.id === location.hash.slice(1))) {
  introDone = true;
  enter(true);
} else {
  playIntro();
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
