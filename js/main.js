/* TravelBuddy demo · todo simulado en el navegador (localStorage). */
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
};
async function hash(t) { // Hash simple, solo para la demo
  try { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join(''); }
  catch (e) { return btoa(t); }
}

/* ---- Tema ---- */
const themeBtn = $('#themeBtn');
const paintTheme = () => themeBtn.setAttribute('aria-label', document.documentElement.dataset.theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
themeBtn.onclick = () => { const t = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = t; try { localStorage.setItem('tb_theme', t); } catch (e) {} paintTheme(); };
paintTheme();

/* ---- Navegación (con animación al entrar en cada página) ---- */
let user = null;
const TITLES = { home: 'Inicio', guia: 'Guía', viaje: 'Mi viaje', mapa: 'Mapa', social: 'Social', perfil: 'Perfil' };
let curPage = 'home';
function paintTitle() { $('#hola').textContent = document.body.classList.contains('mview') && curPage !== 'home' ? TITLES[curPage] : `Hola, ${user.name} 👋`; }
function go(p) {
  curPage = p; if (user) paintTitle();
  $$('[data-page]').forEach(x => { const on = x.dataset.page === p; x.hidden = !on; x.classList.remove('in'); if (on) { void x.offsetWidth; x.classList.add('in'); } });
  $$('.side nav button').forEach(b => b.classList.toggle('on', b.dataset.go === p));
  if (p === 'social' || p === 'perfil') renderSocial(); if (p === 'mapa') renderMapa(); if (p === 'guia') renderGuia();
}
$$('[data-go]').forEach(b => b.onclick = () => go(b.dataset.go));

/* ---- Registro / login ---- */
const users = () => store.get('tb_users', {});
const save = () => { const u = users(); u[user.email] = user; store.set('tb_users', u); };
const norm = u => Object.assign({ visited: [], flights: 0, checks: 0, checked: [], favs: [], posts: [], steps: [] }, u);
const setErr = (f, n, m) => { const e = $(`[data-for=${n}]`, f); if (e) e.textContent = m || ''; };
$('#tabReg').onclick = () => tab(true); $('#tabLog').onclick = () => tab(false);
function tab(reg) {
  $('#tabReg').setAttribute('aria-selected', reg); $('#tabLog').setAttribute('aria-selected', !reg);
  $('#tabReg').tabIndex = reg ? 0 : -1; $('#tabLog').tabIndex = reg ? -1 : 0; $('#formReg').hidden = !reg; $('#formLog').hidden = reg;
}
$('#formReg').onsubmit = async e => {
  e.preventDefault(); const f = e.target, d = Object.fromEntries(new FormData(f)); let ok = true;
  const chk = (n, bad, m) => { setErr(f, n, bad ? m : ''); if (bad) ok = false; };
  chk('name', !d.name.trim(), 'Escribe tu nombre.');
  chk('email', !/^\S+@\S+\.\S+$/.test(d.email), 'Escribe un correo válido, como nombre@correo.com.');
  chk('pass', d.pass.length < 8, 'La contraseña necesita al menos 8 caracteres.');
  chk('pass2', d.pass !== d.pass2, 'Las contraseñas no coinciden.');
  if (ok && users()[d.email.toLowerCase()]) { setErr(f, 'email', 'Este correo ya tiene cuenta. Inicia sesión.'); ok = false; }
  if (!ok) { const first = $('.err:not(:empty)', f); first && first.previousElementSibling.querySelector('input').focus(); return; }
  const key = d.email.toLowerCase(); user = norm({ name: d.name.trim(), email: key, h: await hash(d.pass), tutorial: false });
  save(); store.set('tb_session', key); showDash();
};
$('#formLog').onsubmit = async e => {
  e.preventDefault(); const f = e.target, d = Object.fromEntries(new FormData(f)), u = users()[d.email.toLowerCase()];
  if (!u || u.h !== await hash(d.pass)) return setErr(f, 'login', 'Correo o contraseña incorrectos. Revisa los datos o regístrate.');
  setErr(f, 'login', ''); store.set('tb_session', u.email); user = norm(u); showDash();
};
$('#logout').onclick = () => { document.body.classList.remove('mview'); store.set('tb_session', null); user = null; $('#shell').hidden = true; $('#auth').hidden = false; };
function showDash() {
  setMview(store.get('tb_mview', false));
  $('#auth').hidden = true; $('#shell').hidden = false; go('home');
  $('#hola').textContent = `Hola, ${user.name} 👋`; $('#avatar').textContent = user.name.trim().slice(0, 2).toUpperCase();
  $('#perfInfo').textContent = `${user.email}`; $('#perfName').textContent = user.name; $('#avL').textContent = user.name.trim().slice(0, 2).toUpperCase(); if (!user.tutorial) openTut();
}

/* ---- Tutorial: ilumina cada opción mientras la explica ---- */
const TUT = [
  ['[data-go=home]', 'home', 'Inicio', 'Tu punto de partida: accesos rápidos a todo lo que ofrece TravelBuddy.'],
  ['[data-go=guia]', 'guia', 'Guía', 'Requisitos y documentación para preparar el viaje, y guías del aeropuerto, el hotel y la ciudad.'],
  ['[data-go=viaje]', 'viaje', 'Mi viaje', 'Escribe tu número de vuelo y verás los datos del vuelo, los detalles de la aeronave, el itinerario con sitios y actividades y el seguimiento para tu familia.'],
  ['[data-go=mapa]', 'mapa', 'Mapa', 'El plano del aeropuerto en 2D y una vista 3D interior: te guía hasta tu puerta y te avisa de la documentación que necesitas en cada trámite.'],
  ['[data-go=social]', 'social', 'Social', 'Consigue logros con barra de progreso, pregunta en el foro y colorea tu mapamundi con cada país visitado.'],
  ['[data-go=perfil]', 'perfil', 'Perfil', 'Tus datos, cerrar sesión y volver a ver este tutorial cuando quieras.'],
  ['#themeBtn', 'home', 'Tema', 'Cambia entre modo claro y oscuro cuando prefieras.']
];
const tut = $('#tut'); let ti = 0;
function openTut() { ti = 0; tut.hidden = false; drawTut(); }
function drawTut() {
  $$('.spot').forEach(x => x.classList.remove('spot'));
  const [sel, pg, t, p] = TUT[ti]; go(pg); const el = $(sel); el.classList.add('spot');
  $('#tutT').textContent = t; $('#tutP').textContent = p; $('#tutProg').textContent = `Paso ${ti + 1} de ${TUT.length}`;
  $('#tutPrev').disabled = !ti; $('#tutNext').textContent = ti === TUT.length - 1 ? 'Empezar' : 'Siguiente';
  const r = el.getBoundingClientRect(), w = tut.offsetWidth, mv = document.body.classList.contains('mview');
  if (innerWidth > 860 && !mv) {
    if (sel === '#themeBtn') { tut.style.left = Math.max(12, r.right - w) + 'px'; tut.style.top = r.bottom + 16 + 'px'; }
    else { tut.style.left = r.right + 20 + 'px'; tut.style.top = Math.max(12, r.top - 10) + 'px'; }
    tut.style.bottom = 'auto';
  } else {
    tut.style.left = mv ? '.75rem' : '1rem';
    if (mv && r.top > innerHeight / 2) { tut.style.top = '3rem'; tut.style.bottom = 'auto'; } else { tut.style.top = 'auto'; tut.style.bottom = mv ? '5.8rem' : '1rem'; }
  }
  tut.focus({ preventScroll: true });
}
function endTut() { $$('.spot').forEach(x => x.classList.remove('spot')); tut.hidden = true; if (user) { user.tutorial = true; save(); } go('home'); }
$('#tutNext').onclick = () => ti < TUT.length - 1 ? (ti++, drawTut()) : endTut();
$('#tutPrev').onclick = () => { ti--; drawTut(); };
$('#tutSkip').onclick = endTut; $('#tutAgain').onclick = openTut;
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !tut.hidden) endTut(); });

/* ---- Vuelo, aeronave e itinerario ---- */
const STAGES = ['Facturación', 'Control de seguridad', 'Embarque', 'En vuelo', 'Aterrizaje'];
const FAMILY = ['Ya está en el aeropuerto y facturando.', 'Está pasando el control de seguridad.', 'Está embarcando. Puerta abierta.', 'Está en el aire. Todo en orden.', 'Ha aterrizado sano y salvo.'];
let timer, stage, curCode = 'TB1234', itin = [];
const curF = () => FLIGHTS[curCode];
$('#flightForm').onsubmit = e => {
  e.preventDefault(); const code = $('#flightNo').value.replace(/\s/g, '').toUpperCase(), f = FLIGHTS[code]; clearInterval(timer);
  if (!f) { $('#flightOut').hidden = true; $('#flightErr').textContent = `No encontramos el vuelo "${$('#flightNo').value}". Prueba con ${Object.keys(FLIGHTS).join(' o ')}.`; return; }
  $('#flightErr').textContent = ''; curCode = code; stage = f.stage; $('#flightOut').hidden = false; user.flights++; save();
  $('#ficha').innerHTML = [['Vuelo', code], ['Aerolínea', f.airline], ['Origen', f.from], ['Destino', f.to], ['Salida', f.dep], ['Llegada', f.arr], ['Terminal', f.terminal], ['Puerta', f.gate], ['Avión', f.plane], ['Estado', f.status]].map(([k, v]) => `<div><b>${k}</b>${v}</div>`).join('');
  $('#det').hidden = true; $('#detBtn').setAttribute('aria-expanded', 'false'); itin = []; drawItin(); drawTimeline();
  timer = setInterval(() => { if (stage < STAGES.length - 1) { stage++; drawTimeline(); } else { clearInterval(timer); toggleC(f.country, true); } }, 4000);
};
$('#detBtn').onclick = () => {
  const d = $('#det'), open = d.hidden; d.hidden = !open; $('#detBtn').setAttribute('aria-expanded', open);
  d.innerHTML = curF().pd.map(([k, v]) => `<div><b>${k}</b>${v}</div>`).join('');
};
function drawTimeline() {
  $('#timeline').innerHTML = STAGES.map((s, i) => `<li class="${i < stage ? 'done' : i === stage ? 'now' : ''}">${s}</li>`).join('');
  $('#family').textContent = `Mensaje para tu familia: ${FAMILY[stage]}`;
}
function drawItin() {
  $('#itin').innerHTML = ['Mañana', 'Tarde', 'Noche'].map(b => {
    const l = itin.filter(i => i[0] === b);
    return l.length ? `<div class="itb">${b.toUpperCase()}</div>` + l.map(i => `<div class="it"><span class="tp">${i[2]}</span><b>${esc(i[1])}</b><small>${i[3] ? 'Duración: ' + i[3] + ' · ' : ''}${i[4]}</small></div>`).join('') : '';
  }).join('') || '<p class="muted sm">Aún no hay actividades. Genera un plan con IA o añade las tuyas.</p>';
}
$('#aiBtn').onclick = () => {
  const b = $('#aiBtn'); b.disabled = true; b.textContent = 'Preparando tu plan…';
  setTimeout(() => { itin = [...itin.filter(i => i[2] === 'Tuyo'), ...ITIN[curF().country]]; drawItin(); b.disabled = false; b.textContent = 'Generar con IA (simulado)'; }, 1200);
};
$('#itinForm').onsubmit = e => { e.preventDefault(); const v = $('#itinIn').value.trim(); if (v) { itin.push([$('#itinB').value, v, 'Tuyo', '', 'Añadida por ti.']); drawItin(); } $('#itinIn').value = ''; };

/* ---- Mapa del aeropuerto: 2D y 3D ---- */
const WP = [
  { n: 'Entrada principal', m: 0, sv: ['Información', 'Taxis y metro', 'Cajeros'], ns: 'Ten a mano tu DNI y tu tarjeta de embarque', doc: 'Ten a mano tu DNI o pasaporte y tu tarjeta de embarque.' },
  { n: 'Facturación', m: 120, sv: ['Mostradores', 'Consigna', 'Atención al cliente'], ns: 'Prepara tu pasaporte o DNI para facturar', doc: 'Para facturar necesitas DNI o pasaporte y tu reserva. Revisa el peso máximo de tu maleta.' },
  { n: 'Control de seguridad', m: 260, sv: ['Filtro rápido', 'Asistencia a familias'], ns: 'Líquidos en bolsa y portátil fuera de la mochila', doc: 'Prepara tarjeta de embarque y DNI. Líquidos en bolsa transparente (máx. 100 ml) y portátil fuera de la mochila.' },
  { n: 'Zona comercial', m: 420, sv: ['Restaurantes', 'Tiendas', 'Baños', 'Farmacia', 'Salas VIP'], ns: 'Aún hay tiempo: come, compra o descansa', doc: 'Ya has pasado el control. Aquí tienes baños, comida y tiendas antes de embarcar.' },
  { n: 'Puerta {g}', m: 640, sv: ['Baños', 'Asientos con enchufe', 'Fuente de agua'], ns: 'Prepara tu pasaporte para el embarque', doc: 'Tu puerta. El embarque empieza unos 40 minutos antes de la salida.' }
];
const ZS = [350, 800, 1250, 1700, 2150], L = 2500;
let wi = 0, yaw = 0, cd = 45 * 60, builtFor = '', cdT;
const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
const wn = i => WP[i].n.replace('{g}', curF().gate);
function build3d() {
  /* Pasillo en tramos de 300 px: los planos muy largos que cruzan la cámara se dibujan mal */
  const T = 300, O = 'transform-origin:0 0;', n = (L + 500) / T; let h = '';
  for (let k = 0; k < n; k++) {
    const z = 500 - k * T;
    h += `<div class="fl" style="left:-200px;top:100px;width:400px;height:${T}px;${O}transform:translateZ(${z}px) rotateX(-90deg)"></div>`
      + `<div class="ce" style="left:-200px;top:-120px;width:400px;height:${T}px;${O}transform:translateZ(${z}px) rotateX(-90deg)"></div>`
      + `<div class="wl" style="left:-200px;top:-120px;width:${T}px;height:220px;${O}transform:translateZ(${z}px) rotateY(90deg)"></div>`
      + `<div class="wr" style="left:${200 - T}px;top:-120px;width:${T}px;height:220px;transform-origin:100% 0;transform:translateZ(${z}px) rotateY(-90deg)"></div>`;
  }
  h += `<div class="rt" style="left:-34px;top:99px;width:68px;height:2150px;${O}transform:translateZ(-100px) rotateX(-90deg)"></div>`;
  for (let z = 250; z < 2150; z += 150) h += `<div class="ar" style="left:-22px;top:98px;width:44px;height:44px;${O}transform:translateZ(${-z}px) rotateX(-90deg)"><i></i></div>`;
  h += `<div class="ew" style="left:-200px;top:-120px;width:400px;height:220px;transform:translateZ(-${L}px)">EMBARQUE</div>`;
  h += WP.map((w, i) => `<div class="bd" style="left:-100px;top:-90px;transform:translate3d(-197px,0,${-ZS[i]}px) rotateY(90deg)"><b>${esc(wn(i))}</b>${w.sv.map(esc).join('<br>')}</div>`).join('');
  h += WP.map((w, i) => `<div class="sg" style="left:-120px;top:-100px;width:240px;height:46px;transform:translateZ(-${ZS[i]}px)">${esc(wn(i))}${i === 4 ? ' ↑' : ''}</div>`).join('');
  h += `<div class="pin3" style="left:-17px;top:-175px;transform:translateZ(-${ZS[4]}px)">✈</div>`;
  $('#world').innerHTML = h; builtFor = curCode;
}
function setWp(i, silent) {
  wi = Math.max(0, Math.min(WP.length - 1, i));
  $('#world').style.transform = `translateZ(520px) rotateY(${yaw}deg) translateZ(${ZS[wi] - 300}px)`;
  if (!silent && !user.steps.includes(wi)) { user.steps.push(wi); save(); }
  drawMapa();
}
function drawMapa() {
  const f = curF(), d = WP[4].m - WP[wi].m, t = Math.ceil(d / 80);
  $('#info').innerHTML = `<div><small>Tu puerta</small><b>${f.gate} · ${f.terminal}</b></div><div><small>Embarque en</small><b id="cd">${fmt(cd)}</b></div><div><small>Distancia a tu puerta</small><b>${d} m</b></div><div><small>Andando</small><b>${d ? t + ' min' : '¡Has llegado!'}</b></div>`;
  const nx = WP[wi + 1];
  $('#notes').innerHTML = `<div class="note"><b>📄 Documentación ahora (${esc(wn(wi))}):</b> ${WP[wi].doc}</div>` + (nx ? `<div class="note next"><b>Siguiente: ${esc(wn(wi + 1))}.</b> ${nx.doc}</div>` : '');
  $('#hud').innerHTML = `<b>${esc(wn(wi))}</b> · Servicios: ${WP[wi].sv.join(', ')}. Gira a la izquierda para ver los carteles.`;
  $('#steps').innerHTML = WP.map((w, i) => `<li><button data-i="${i}" ${i === wi ? 'aria-current="step"' : ''}><span>${i + 1}. ${esc(wn(i))}</span><span class="muted">${WP[4].m - w.m} m a la puerta</span></button></li>`).join('');
  drawPlan(); drawImm();
}
const phone = $('.phone');
let zoom = 1, flt = 'Todo', q = '';
const cat = x => /Baños/.test(x) ? 'Baños' : /Restaur/.test(x) ? 'Comida' : /Tiendas|Farmacia/.test(x) ? 'Tiendas' : /VIP/.test(x) ? 'VIP' : 'Info';
const CC = { Baños: '#bde3f2', Comida: '#fcd9a8', Tiendas: '#e6cdf2', VIP: '#f5e1a4', Info: '#cfe8cd' };
function drawPlan() {
  const Y = i => 470 - i * 104, g = Y(wi), d = WP[4].m - WP[wi].m, t = Math.ceil(d / 80);
  const on = x => (flt === 'Todo' || cat(x) === flt) && (!q || x.toLowerCase().includes(q));
  let h = `<rect x="-200" y="-200" width="800" height="1000" fill="var(--mbg)"/><rect x="36" y="14" width="258" height="494" rx="18" fill="var(--mbld)" stroke="var(--mline)" stroke-width="2"/><rect x="150" y="14" width="30" height="494" fill="var(--mroad)"/>`;
  WP.forEach((w, i) => { const it = w.sv.slice(0, 4), two = it.length > 2; it.forEach((x, k) => { const lit = on(x), xx = k % 2 ? 186 : 48, rh = two ? 24 : 52, ry = Y(i) - 26 + (k >> 1) * 28, hl = lit && (flt !== 'Todo' || q); h += `<g data-i="${i}" style="cursor:pointer;opacity:${lit ? 1 : .3}"><rect x="${xx}" y="${ry}" width="96" height="${rh}" rx="8" fill="${CC[cat(x)]}" stroke="${hl ? 'var(--route)' : 'var(--mline)'}" stroke-width="${hl ? 3 : 1}"/><text x="${xx + 48}" y="${ry + rh / 2 + 3.5}" text-anchor="middle" style="font-size:${two ? 9 : 10}px;font-weight:600;fill:#2b2b2b">${esc(x.length > 15 ? x.slice(0, 14) + '…' : x)}</text></g>`; }); });
  h += `<line x1="165" y1="${Y(0)}" x2="165" y2="${g}" stroke="var(--mline)" stroke-width="5" stroke-dasharray="2 8" stroke-linecap="round"/><line x1="165" y1="${g}" x2="165" y2="${Y(4)}" stroke="#fff" stroke-width="11" stroke-linecap="round"/><line x1="165" y1="${g}" x2="165" y2="${Y(4)}" stroke="var(--route)" stroke-width="7" stroke-linecap="round"/>`;
  WP.forEach((w, i) => { h += `<g data-i="${i}" style="cursor:pointer"><circle cx="165" cy="${Y(i)}" r="6" fill="#fff" stroke="var(--mline)" stroke-width="2"/><text class="mt" x="165" y="${Y(i) - 34}" text-anchor="middle" style="font-size:11px;font-weight:700">${esc(wn(i))}</text></g>`; });
  h += `<g transform="translate(165 ${Y(4) - 6})"><path d="M0 0C-4-8-11-13-11-20A11 11 0 1 1 11-20C11-13 4-8 0 0Z" fill="#ea4335" stroke="#fff" stroke-width="1.5"/><circle cy="-20" r="4" fill="#fff"/></g>`;
  h += `<circle cx="165" cy="${g}" r="9" fill="var(--route)" opacity=".25" style="animation:ping 1.6s ease-out infinite"/><circle cx="165" cy="${g}" r="8" fill="var(--route)" stroke="#fff" stroke-width="3"/>`;
  $('#plan').innerHTML = h;
  const r = $('#plan').getBoundingClientRect(), full = phone.classList.contains('full'), w = 330 / zoom * (full ? 1.15 : 1), hh = r.width ? w * r.height / r.width : 430 / zoom;
  const vx = w >= 330 ? (330 - w) / 2 : Math.max(0, Math.min(330 - w, 165 - w / 2)), vy = hh >= 522 ? (522 - hh) / 2 : Math.max(0, Math.min(522 - hh, g - hh / (full ? 1.8 : 2)));
  $('#plan').setAttribute('viewBox', `${vx} ${vy} ${w} ${hh}`);
  $('#chips').innerHTML = ['Todo', 'Baños', 'Comida', 'Tiendas', 'VIP', 'Info'].map(c => `<button type="button" aria-pressed="${c === flt}">${c}</button>`).join('');
  $('#sheet').innerHTML = `<div><b>${esc(wn(wi))}</b><span>${d ? d + ' m · ' + t + ' min andando' : 'Has llegado a tu puerta'}</span></div><button class="btn sm" id="go3d" type="button">Ver en 3D</button>`;
}
function renderMapa() {
  if (builtFor !== curCode) { build3d(); wi = 0; }
  setWp(wi, true);
  if (!cdT) cdT = setInterval(() => { cd = Math.max(0, cd - 1); const e = $('#cd'); if (e) e.textContent = fmt(cd); }, 1000);
}
const look = d => { yaw = Math.max(-55, Math.min(55, yaw + d)); setWp(wi, true); };
$('#tf').onclick = () => setWp(wi + 1); $('#tb').onclick = () => setWp(wi - 1);
$('#tl').onclick = () => look(-35); $('#tr').onclick = () => look(35);
$('#steps').onclick = $('#plan').onclick = e => { const b = e.target.closest('[data-i]'); if (b) setWp(+b.dataset.i); };
$('#vp').onkeydown = e => { const k = { ArrowUp: () => setWp(wi + 1), ArrowDown: () => setWp(wi - 1), ArrowLeft: () => look(-35), ArrowRight: () => look(35) }[e.key]; if (k) { e.preventDefault(); k(); } };
let dragX = null; const W3 = $('#world');
$('#vp').onpointerdown = e => { dragX = e.clientX; W3.style.transition = 'none'; };
addEventListener('pointermove', e => { if (dragX === null) return; yaw = Math.max(-55, Math.min(55, yaw - (e.clientX - dragX) * .25)); dragX = e.clientX; W3.style.transform = `translateZ(520px) rotateY(${yaw}deg) translateZ(${ZS[wi] - 300}px)`; });
addEventListener('pointerup', () => { if (dragX !== null) { dragX = null; W3.style.transition = ''; } });
function showView(is2) {
  $('#v2d').hidden = !is2; $('#v3d').hidden = is2;
  [['b2d', is2], ['b3d', !is2]].forEach(([i, on]) => { $('#' + i).setAttribute('aria-pressed', on); $('#' + i).classList.toggle('outline', !on); });
}
$('#b2d').onclick = () => showView(true); $('#b3d').onclick = () => showView(false);
$('#sheet').onclick = e => { if (e.target.closest('#go3d')) showView(false); };
$('#zin').onclick = () => { zoom = Math.min(2.5, zoom + .5); drawPlan(); }; $('#zout').onclick = () => { zoom = Math.max(1, zoom - .5); drawPlan(); };
$('#chips').onclick = e => { const b = e.target.closest('button'); if (b) { flt = b.textContent; drawPlan(); drawImm(); } };
$('#msearch').oninput = e => { q = e.target.value.trim().toLowerCase(); drawPlan(); };
$('#fwd').onclick = () => setWp(wi + 1); $('#cmp').onclick = () => { yaw = 0; setWp(wi, true); };
$$('#fwd,#cmp').forEach(b => b.onpointerdown = e => e.stopPropagation());
function setFull(on, btn) {
  phone.classList.toggle('full', on); document.body.classList.toggle('pfull', on); document.body.style.overflow = on ? 'hidden' : '';
  drawMapa(); (on ? $('#iback') : (btn || $('.exp'))).focus();
}
$$('.exp').forEach(b => b.onclick = () => setFull(!phone.classList.contains('full'), b));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && phone.classList.contains('full')) setFull(false); });

/* ---- Social: logros, foro y mapamundi ---- */
$$('[data-st]').forEach(b => b.onclick = () => { $$('[data-st]').forEach(x => x.setAttribute('aria-selected', x === b)); $$('[data-sp]').forEach(p => p.hidden = p.dataset.sp !== b.dataset.st); });
const ACH = [
  ['✈', 'Primer despegue', 'Sigue 1 vuelo en Mi viaje', () => user.flights, 1],
  ['🧳', 'Viajero frecuente', 'Sigue 3 vuelos', () => user.flights, 3],
  ['🗺️', 'Primer sello', 'Colorea 1 país en tu mapa', () => user.visited.length, 1],
  ['🌍', 'Coleccionista de sellos', 'Colorea 5 países', () => user.visited.length, 5],
  ['🌐', 'Trotamundos', 'Colorea 10 países', () => user.visited.length, 10],
  ['💬', 'Voz de la comunidad', 'Publica 3 preguntas en el foro', () => user.posts.length, 3],
  ['✅', 'Listo para volar', 'Marca los 4 puntos de la guía de viaje', () => user.checks, 4],
  ['🧭', 'Explorador del aeropuerto', 'Visita los 5 puntos del mapa', () => user.steps.length, 5]
];
function renderSocial() {
  const st = ACH.map(a => [a, Math.min(a[3](), a[4])]), done = st.filter(([a, v]) => v >= a[4]).length;
  $('#achSum').textContent = `Has desbloqueado ${done} de ${ACH.length} logros`;
  $('#achBar').innerHTML = `<i style="width:${done / ACH.length * 100}%"></i>`;
  const cards = st.map(([a, v]) => { const ok = v >= a[4], p = v / a[4] * 100; return `<article class="ac ${ok ? 'ok' : 'lock'}"><span class="ic" aria-hidden="true">${ok ? a[0] : '🔒'}</span><h4>${a[1]}</h4><span class="badge">${ok ? 'Desbloqueado' : 'Bloqueado'}</span><p class="muted sm">${a[2]}</p><div class="bar-i" role="progressbar" aria-label="${a[1]}" aria-valuemin="0" aria-valuemax="${a[4]}" aria-valuenow="${v}"><i style="width:${p}%"></i></div><small>${ok ? '¡Conseguido!' : `${v} de ${a[4]} · te ${a[4] - v === 1 ? 'falta 1' : 'faltan ' + (a[4] - v)}`}</small></article>`; }).join('');
  $('#ach').innerHTML = $('#achP').innerHTML = cards;
  const stat = (n, l) => `<div><b>${n}</b>${l}</div>`;
  $('#socStats').innerHTML = $('#perfStats').innerHTML = stat(user.visited.length + '/' + Object.keys(CO).length, 'países visitados') + stat(user.flights, 'vuelos seguidos') + stat(done + '/' + ACH.length, 'logros') + stat(user.posts.length, 'preguntas en el foro');
  $('#myPosts').innerHTML = user.posts.slice(0, 3).map(p => `<div class="it"><b>${esc(p.t)}</b><small>${esc(p.b)}</small></div>`).join('') || '<p class="muted">Aún no has participado. Haz tu primera pregunta en el foro.</p>';
  drawForum(); drawWorld();
}
const FORUM = [
  ['Lucía M.', '¿Con cuánta antelación llego al aeropuerto?', 'Voy a Roma en vuelo corto y es la primera vez que viajo sola.', 'Aeropuerto', 'hace 2 días', [['Carlos R.', 'Yo llego unas 2 horas antes en vuelos europeos y 3 en intercontinentales. Más vale esperar que correr.', 1], ['Marta S.', 'Mira también la hora de cierre de facturación de tu aerolínea: suele ser entre 40 y 60 minutos antes.']]],
  ['Jorge P.', '¿Necesito pasaporte para ir a Reino Unido?', 'Salgo de España en diciembre y solo tengo DNI.', 'Documentación', 'hace 3 días', [['Ana T.', 'Sí, necesitas pasaporte en vigor. Comprueba también en la web oficial del gobierno británico si hace falta autorización electrónica.', 1]]],
  ['Elena V.', 'Mi hija de 12 años viaja sola, ¿cómo la sigo?', 'La aerolínea ofrece acompañamiento y quiero estar tranquila.', 'Familia', 'hace 4 días', [['David L.', 'Contrata el servicio de menor no acompañado de la aerolínea y usa el seguimiento familiar de TravelBuddy para ver cada fase.', 1], ['Sofía G.', 'Avisa a la aerolínea de quién la recoge y deja tu teléfono a mano.']]],
  ['Pablo N.', '¿Qué ver en París en un solo día?', 'Llego a las 12:35 y salgo al día siguiente.', 'Destinos', 'hace 5 días', [['Irene C.', 'Torre Eiffel por la tarde, paseo por el Sena y cena en Le Marais. Montmartre mejor al día siguiente.', 1], ['Hugo F.', 'Reserva las entradas antes de ir, te ahorras mucha cola.']]],
  ['Nerea B.', '¿Puedo llevar un powerbank en cabina?', 'Viajo con Buddy Air y no quiero problemas en el control.', 'Equipaje', 'hace 1 semana', [['Raúl A.', 'En cabina sí, en bodega no. Las baterías de litio suelen tener límite de 100 Wh sin permiso; consulta a tu aerolínea.', 1]]],
  ['Clara D.', '¿Cómo llego del aeropuerto de Lisboa al centro?', 'Aterrizo por la tarde y voy con maleta.', 'Destinos', 'hace 1 semana', [['Tomás R.', 'El metro conecta el aeropuerto con el centro en unos 20 minutos y es lo más cómodo con equipaje.', 1]]]
];
const av = n => n.split(' ').map(x => x[0]).join('');
let fcat = 'Todas';
function drawForum() {
  const tags = ['Todas', ...new Set(FORUM.map(f => f[3]))];
  $('#fchips').innerHTML = tags.map(t => `<button type="button" aria-pressed="${t === fcat}">${t}</button>`).join('');
  const mine = fcat === 'Todas' ? user.posts.map(p => `<article class="post mine"><div class="who"><span class="av">${esc(av(user.name))}</span>${esc(user.name)} · Tu pregunta · ahora</div><h4>${esc(p.t)}</h4><p>${esc(p.b)}</p><small class="muted">Aún sin respuestas.</small></article>`).join('') : '';
  $('#forum').innerHTML = mine + FORUM.filter(f => fcat === 'Todas' || f[3] === fcat).map(([a, t, b, tag, w, r]) => `<article class="post"><div class="who"><span class="av">${av(a)}</span>${a} · ${w} · <b>${tag}</b> · ${r.length} ${r.length === 1 ? 'respuesta' : 'respuestas'}</div><h4>${t}</h4><p>${b}</p><div class="rp">${r.map(([n, x, best]) => `<div><div class="who"><span class="av">${av(n)}</span>${n} ${best ? '<span class="ok2">✓ Mejor respuesta</span>' : ''}</div><p>${x}</p></div>`).join('')}</div></article>`).join('');
}
$('#fchips').onclick = e => { const b = e.target.closest('button'); if (b) { fcat = b.textContent; drawForum(); } };
$('#postForm').onsubmit = e => {
  e.preventDefault(); const t = $('#pT').value.trim(), b = $('#pB').value.trim();
  if (!t || !b) { $('#pErr').textContent = 'Escribe un título y tu pregunta antes de publicar.'; return; }
  $('#pErr').textContent = ''; user.posts.unshift({ t, b }); save(); $('#pT').value = $('#pB').value = ''; renderSocial();
};
/* Mapamundi simplificado: [longitud, latitud]. Se dibuja en blanco y negro y se colorea al visitar. */
const LAND = [
  [[-168,66],[-140,70],[-95,72],[-80,68],[-62,60],[-55,50],[-67,44],[-76,35],[-81,25],[-90,29],[-97,26],[-105,22],[-95,16],[-84,10],[-78,8],[-90,14],[-105,20],[-110,30],[-117,32],[-124,40],[-125,49],[-135,58],[-150,60],[-165,60]],
  [[-78,8],[-60,10],[-50,0],[-35,-6],[-40,-22],[-48,-27],[-58,-38],[-66,-46],[-68,-55],[-74,-50],[-73,-38],[-71,-18],[-81,-6],[-80,0]],
  [[-9,37],[-9,43],[-2,48],[-5,50],[5,53],[10,57],[5,62],[15,69],[30,71],[60,69],[80,73],[110,77],[140,72],[170,69],[180,65],[160,60],[155,50],[140,52],[135,43],[128,38],[122,40],[122,30],[110,20],[105,10],[100,2],[98,15],[90,22],[80,15],[72,20],[66,25],[57,26],[56,24],[59,22],[52,16],[43,13],[35,28],[34,31],[36,36],[27,37],[26,41],[20,40],[14,45],[8,44],[3,43],[-2,37]],
  [[-17,21],[-10,30],[-6,36],[10,37],[20,32],[32,31],[35,28],[43,12],[51,12],[40,-2],[40,-15],[35,-25],[27,-34],[18,-34],[12,-18],[9,-2],[9,4],[-8,4],[-17,14]],
  [[114,-22],[122,-18],[131,-12],[142,-11],[146,-19],[153,-27],[150,-37],[141,-38],[131,-31],[115,-34]],
  [[-55,60],[-45,60],[-20,70],[-20,82],[-60,82],[-70,76]]
];
const CO = {
  'España': [[-9,43],[-2,43.5],[3,42],[0,39],[-2,36.5],[-6,36],[-9,37],[-9,41]],
  'Francia': [[-4.5,48.5],[2,51],[8,49],[7.5,44],[3,42.5],[-1.5,43.5],[-1.5,46]],
  'Portugal': [[-9.5,42],[-7,42],[-7,37],[-9,37]],
  'Italia': [[7,44],[13,46.5],[14,43],[18,40],[16,38],[12,41.5],[9,44]],
  'Alemania': [[6,51],[7,53.5],[14,54],[15,51],[13,48],[8,47.5]],
  'Reino Unido': [[-5,50],[1,51],[2,53],[-2,56],[-3,58],[-6,57],[-3,54]],
  'Marruecos': [[-13,28],[-9,35.8],[-2,35],[-2,32],[-8.5,27.5]],
  'Japón': [[130,31],[135,34],[141,38],[142,44],[140,42],[138,37],[132,34]],
  'México': [[-117,32],[-106,31.5],[-97,26],[-97,20],[-90,21],[-87,21],[-91,17],[-92,14.5],[-105,19],[-110,24],[-114,30]],
  'Canadá': [[-141,69],[-95,72],[-80,68],[-62,60],[-55,50],[-67,45],[-83,46],[-95,49],[-123,49],[-130,55],[-141,60]],
  'Estados Unidos': [[-125,49],[-95,49],[-83,46],[-67,45],[-76,35],[-81,25],[-90,29],[-97,26],[-106,31.5],[-117,32],[-124,40]],
  'Brasil': [[-60,5],[-50,0],[-35,-6],[-40,-22],[-48,-27],[-54,-34],[-58,-30],[-58,-17],[-70,-10],[-73,-5]]
};
const pts = a => a.map(([lo, la]) => `${lo + 180},${90 - la}`).join(' ');
function drawWorld() {
  const svg = LAND.map(p => `<polygon class="land" points="${pts(p)}"/>`).join('') + Object.entries(CO).map(([n, p]) => `<polygon class="c ${user.visited.includes(n) ? 'on' : ''}" data-c="${n}" points="${pts(p)}"><title>${n}</title></polygon>`).join('');
  const btn = Object.keys(CO).map(n => `<button type="button" data-c="${n}" aria-pressed="${user.visited.includes(n)}">${n}</button>`).join('');
  ['world2', 'world3'].forEach(id => $('#' + id).innerHTML = svg); ['myMap', 'myMap2'].forEach(id => $('#' + id).innerHTML = btn);
}
function toggleC(n, only) {
  const i = user.visited.indexOf(n); if (only && i >= 0) return;
  i >= 0 ? user.visited.splice(i, 1) : user.visited.push(n); save(); renderSocial();
}
$('#world2').onclick = $('#world3').onclick = $('#myMap').onclick = $('#myMap2').onclick = e => { const c = e.target.closest('[data-c]'); if (c) toggleC(c.dataset.c); };


/* ---- Vista inmersiva dentro del móvil ---- */
const ICON = { Tiendas: '🛍', Comida: '🍴', Baños: '🚻', VIP: '🛋', Info: 'ℹ️' };
const SVC = [['Tiendas', 'Tiendas'], ['Restaurantes', 'Comida'], ['Salas VIP', 'VIP'], ['Baños', 'Baños'], ['Información', 'Info']];
let noteOff = -1, vz = 1;
function drawImm() {
  const f = curF(), d = WP[4].m - WP[wi].m, t = Math.ceil(d / 80), py = 88 - WP[wi].m / 640 * 74;
  $('#inote').innerHTML = noteOff === wi ? '' : `<span class="ni">🛂</span><span>${WP[wi].ns}</span><button type="button" aria-label="Cerrar aviso">✕</button>`;
  $('#igate').innerHTML = `<span class="gl">✈ Tu puerta de embarque</span><b>${f.gate}</b><span>🚶 ${d ? t + ' min (' + d + ' m)' : '¡Has llegado!'}</span>`;
  $('#imini').innerHTML = `<svg viewBox="0 0 80 100" width="100%" height="100%"><rect width="80" height="100" fill="#ece8e0"/><rect x="8" y="8" width="26" height="22" fill="#d9d3c6"/><rect x="46" y="38" width="26" height="30" fill="#d9d3c6"/><rect x="10" y="62" width="22" height="28" fill="#d9d3c6"/><line x1="40" y1="88" x2="40" y2="14" stroke="#8b1e3f" stroke-width="3"/><circle cx="40" cy="12" r="7" fill="#8b1e3f"/><text x="40" y="15" text-anchor="middle" font-size="9" fill="#fff">✈</text><circle cx="40" cy="${py}" r="6" fill="#1a73e8" stroke="#fff" stroke-width="2"/></svg>`;
  $('#isv').innerHTML = SVC.map(([n, c]) => `<button type="button" data-c="${c}" aria-pressed="${flt === c}"><i>${ICON[c]}</i>${n}</button>`).join('');
  let ps = '';
  if (flt === 'Todo') ps = WP[wi].sv.slice(0, 2).map((x, k) => `<button type="button" class="pill ${k ? 'r' : 'l'}" data-c="${cat(x)}">${ICON[cat(x)]} ${esc(x)} ›</button>`).join('');
  else { let b = null; WP.forEach((w, j) => { if (w.sv.some(x => cat(x) === flt)) { const dd = Math.abs(w.m - WP[wi].m); if (!b || dd < b[1]) b = [j, dd]; } }); if (b) ps = `<button type="button" class="pill l" data-j="${b[0]}">${ICON[flt]} ${flt} · ${b[1] ? b[1] + ' m ' + (WP[b[0]].m > WP[wi].m ? '↑' : '↓') : 'aquí'} ›</button>`; }
  $('#ipills').innerHTML = ps;
}
$('#iback').onclick = () => setFull(false);
$('#inote').onclick = e => { if (e.target.closest('button')) { noteOff = wi; drawImm(); } };
$('#isv').onclick = e => { const b = e.target.closest('button'); if (b) { flt = flt === b.dataset.c ? 'Todo' : b.dataset.c; drawPlan(); drawImm(); } };
$('#ipills').onclick = e => { const b = e.target.closest('button'); if (!b) return; if (b.dataset.j) setWp(+b.dataset.j); else { flt = b.dataset.c; drawPlan(); drawImm(); } };
$('#iloc').onclick = () => { if (!$('#v2d').hidden) { zoom = 1; drawPlan(); } else { yaw = 0; setWp(wi, true); } };
const zm = d => { if (!$('#v2d').hidden) { zoom = Math.max(1, Math.min(2.5, zoom + d * 2)); drawPlan(); } else { vz = Math.max(.8, Math.min(1.6, vz + d)); $('#vp').style.setProperty('--vz', vz); } };
$('#izin').onclick = () => zm(.2); $('#izout').onclick = () => zm(-.2);
$$('.itab button').forEach(b => b.onclick = () => { setFull(false); go(b.dataset.t); });

/* ---- Guía de viaje ---- */
const GL = [['Documentación', '🪪', ['DNI o pasaporte en vigor', 'Requisitos de entrada del destino', 'Seguro de viaje (recomendado)']], ['Equipaje', '🧳', ['Maleta dentro del peso permitido', 'Líquidos en bolsa transparente (máx. 100 ml)', 'Baterías y powerbank en cabina']], ['Digital', '📱', ['Tarjeta de embarque descargada', 'Seguimiento familiar activado']]];
const GA = [['🕑', 'Llega con tiempo', 'Unas 2 h antes en vuelos europeos y 3 h en intercontinentales.'], ['🧳', 'Facturación', 'Deja tu maleta o haz el check-in online y ve directo a seguridad.'], ['🛂', 'Control de seguridad', 'Líquidos en bolsa y portátil fuera de la mochila.'], ['✈️', 'Embarque', 'Estate en tu puerta unos 40 minutos antes de la salida.']];
const HOTEL = {
  Francia: [['🚆', 'Tren RER B', 'Conecta el aeropuerto con el centro en unos 35 min.'], ['🚕', 'Taxi o VTC', 'Directo a tu hotel; el tiempo depende del tráfico.'], ['🚌', 'Autobús', 'Opción económica con paradas en la ciudad.']],
  Portugal: [['🚇', 'Metro (línea roja)', 'Directo al centro en unos 20 min.'], ['🚕', 'Taxi o VTC', 'El aeropuerto está muy cerca del centro.'], ['🚌', 'Aerobús', 'Autobús aeropuerto–centro con paradas céntricas.']]
};
const FACTS = { Francia: [['Moneda', 'Euro'], ['Idioma', 'Francés'], ['Enchufe', 'Tipo C/E'], ['Hora', 'Igual que España']], Portugal: [['Moneda', 'Euro'], ['Idioma', 'Portugués'], ['Enchufe', 'Tipo C/F'], ['Hora', '1 h menos que España']] };
const REQ = [['Documentación de viaje', 'Lleva DNI o pasaporte en vigor. Comprueba en la web oficial del destino si hacen falta visados o autorizaciones.'], ['Equipaje de mano', 'Revisa medidas y peso de tu aerolínea. Los líquidos, en envases de máx. 100 ml dentro de una bolsa transparente.'], ['Baterías y powerbank', 'Van siempre en cabina, nunca en bodega. Consulta el límite de tu aerolínea.'], ['Menores y personas mayores', 'Si viaja un menor solo, contrata el servicio de la aerolínea y activa el seguimiento familiar.']];
function renderGuia(focusK) {
  const f = curF(), city = f.to.split(' ')[0], c = f.country, tot = GL.reduce((n, g) => n + g[2].length, 0), done = user.checked.length, pct = Math.round(done / tot * 100);
  $('#gHero').innerHTML = `<div class="ring" style="--p:${pct}"><b>${pct}%</b></div><div><small class="kicker">TU PRÓXIMO VIAJE · ${curCode}</small><h3>${city}</h3><p class="muted">${f.from} → ${f.to} · Salida ${f.dep}</p><p>${done < tot ? `Te faltan <b>${tot - done}</b> puntos por preparar.` : '¡Todo listo para volar!'}</p><div class="row"><button class="btn sm" data-go="mapa">Ver el aeropuerto</button><button class="btn sm outline" data-go="viaje">Mi viaje</button></div></div>`;
  let n = 0;
  $('#gCheck').innerHTML = `<h3>Antes de salir</h3><div class="bar-i" role="progressbar" aria-label="Preparación del viaje" aria-valuemin="0" aria-valuemax="${tot}" aria-valuenow="${done}"><i style="width:${pct}%"></i></div><p class="muted sm">${done} de ${tot} completados</p>` + GL.map(([g, ic, its]) => `<h4 class="gt">${ic} ${g}</h4><ul class="check">${its.map(t => { const i = n++; return `<li><label><input type="checkbox" data-k="${i}" ${user.checked.includes(i) ? 'checked' : ''}> ${t}</label></li>`; }).join('')}</ul>`).join('');
  $('#gAir').innerHTML = `<h3>En el aeropuerto</h3><ol class="gsteps">${GA.map(([i, t, d]) => `<li><span class="gi" aria-hidden="true">${i}</span><div><b>${t}</b><p class="muted sm">${d}</p></div></li>`).join('')}</ol><button class="btn sm" data-go="mapa">Recorrerlo en el mapa 3D</button>`;
  $('#gHotel').innerHTML = HOTEL[c].map(([i, t, d]) => `<article class="panel gcard"><span class="gi" aria-hidden="true">${i}</span><b>${t}</b><p class="muted sm">${d}</p></article>`).join('');
  $('#gCity').innerHTML = ITIN[c].filter(x => x[2] === 'Sitio').slice(0, 4).map(x => `<article class="panel gcard"><span class="tp">${x[0]}</span><b>${x[1]}</b><p class="muted sm">${x[3]} · ${x[4]}</p></article>`).join('');
  $('#gFacts').innerHTML = `<h3>${city} en 4 datos</h3><div class="ficha">${FACTS[c].map(([k, v]) => `<div><b>${k}</b>${v}</div>`).join('')}</div>`;
  $('#gReq').innerHTML = `<h3>Reglamentos y requisitos</h3>` + REQ.map(([t, d]) => `<details><summary>${t}</summary><p class="muted sm">${d}</p></details>`).join('');
  renderTips();
  if (focusK !== undefined) { const el = $(`#gCheck [data-k="${focusK}"]`); el && el.focus(); }
}
$('#gCheck').onchange = e => { const k = +e.target.dataset.k, i = user.checked.indexOf(k); i >= 0 ? user.checked.splice(i, 1) : user.checked.push(k); user.checks = user.checked.length; save(); renderGuia(k); };
$('#main').addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (b && !b.closest('.side')) go(b.dataset.go); });


/* ---- Panel de servicios plegable y botón de retroceso ---- */
function setMin(m) { phone.classList.toggle('min', m); const b = $('#ihandle'); b.setAttribute('aria-expanded', !m); b.setAttribute('aria-label', m ? 'Mostrar servicios cerca de ti' : 'Ocultar servicios cerca de ti'); }
let hy = null, hdrag = false;
$('#ihandle').onpointerdown = e => { hy = e.clientY; hdrag = false; e.currentTarget.setPointerCapture(e.pointerId); };
$('#ihandle').onpointerup = e => { if (hy === null) return; const dy = e.clientY - hy; hy = null; if (Math.abs(dy) > 20) { hdrag = true; setMin(dy > 0); } };
$('#ihandle').onclick = () => { if (hdrag) { hdrag = false; return; } setMin(!phone.classList.contains('min')); };
$('#bck').onclick = () => setWp(wi - 1); $('#bck').onpointerdown = e => e.stopPropagation();

/* ---- Tips de TravelBuddy (PROVISIONAL: contenido de ejemplo) ---- */
const TIPS = [
  ['seguridad', 'v', 'Aeropuerto', '🛂', 'Cómo pasar el control de seguridad sin estrés', 'Qué sacar de la mochila, cómo llevar los líquidos y qué ropa elegir.', '1:30'],
  ['maleta', 'v', 'Equipaje', '🧳', 'La maleta de mano perfecta', 'Cómo organizarla para aprovechar el espacio y encontrar todo rápido.', '2:10'],
  ['hotel', 'v', 'Destino', '🚆', 'Tu primer día: del aeropuerto al hotel', 'Transporte, pagos y qué hacer nada más aterrizar.', '1:45'],
  ['t1', 't', 'Documentación', '🪪', 'Haz una foto a tu documentación', 'Guarda una copia en el móvil y en tu correo. Si pierdes el original, te ahorrará muchos trámites.', ['Pasaporte o DNI', 'Reserva del vuelo y del hotel', 'Seguro de viaje']],
  ['t2', 't', 'Equipaje', '⚖️', 'Pesa tu maleta en casa', 'Cada aerolínea tiene su límite. Pesarla antes evita pagar de más en el mostrador.', ['Deja 1 kg de margen', 'Lo más pesado, en la maleta facturada', 'Revisa las medidas de cabina']],
  ['t3', 't', 'Aeropuerto', '🚪', 'Guarda tu puerta, pero revísala', 'La puerta de embarque puede cambiar. Compruébala al pasar el control y poco antes de embarcar.', ['Mira las pantallas o la app', 'Llega a la puerta con margen', 'Activa los avisos de TravelBuddy']],
  ['t4', 't', 'Familia', '👨‍👩‍👧', 'Activa el seguimiento familiar', 'Si viaja un menor o una persona mayor, tu familia podrá ver cada fase: facturación, seguridad, embarque y vuelo.', ['Avisa a la aerolínea de quién recoge', 'Deja un teléfono de contacto', 'Comparte el vuelo con tu familia']],
  ['t5', 't', 'Destino', '📶', 'Descarga todo antes de salir', 'El Wi-Fi del aeropuerto o del destino puede fallar. Ten billetes y mapas sin conexión.', ['Billete y tarjeta de embarque', 'Mapa del destino sin conexión', 'Direcciones del hotel']],
  ['t6', 't', 'Bienestar', '💧', 'Cuida tu cuerpo en vuelos largos', 'Beber agua y moverte un poco te hará llegar mejor.', ['Bebe agua con frecuencia', 'Levántate y estira cada cierto tiempo', 'Lleva una prenda de abrigo']]
];
let tcat = 'Todos';
function renderTips() {
  const cats = ['Todos', 'Guardados', ...new Set(TIPS.map(t => t[2]))];
  $('#tChips').innerHTML = cats.map(c => `<button type="button" aria-pressed="${c === tcat}">${c}${c === 'Guardados' ? ' (' + user.favs.length + ')' : ''}</button>`).join('');
  const l = TIPS.filter(t => tcat === 'Todos' || (tcat === 'Guardados' ? user.favs.includes(t[0]) : t[2] === tcat));
  $('#gTips').innerHTML = l.map(([id, ty, c, ic, t, d, x]) => { const fv = user.favs.includes(id); return `<article class="panel tcard">${ty === 'v' ? `<div class="vcard" data-id="${id}"><button type="button" class="vplay" data-v="${id}" aria-label="Reproducir vídeo: ${t}">▶</button><span class="vdur">${x}</span></div>` : ''}<span class="tp">${ic} ${c}</span><b>${t}</b><p class="muted sm">${d}</p>${ty === 't' ? `<ul class="tl">${x.map(i => `<li>${i}</li>`).join('')}</ul>` : ''}<button type="button" class="favb" data-f="${id}" aria-pressed="${fv}">${fv ? '♥ Guardado' : '♡ Guardar'}</button></article>`; }).join('') || '<p class="muted">Aún no has guardado ningún tip.</p>';
}
$('#tChips').onclick = e => { const b = e.target.closest('button'); if (b) { tcat = b.textContent.replace(/ \(\d+\)$/, ''); renderTips(); } };
$('#gTips').onclick = e => {
  const f = e.target.closest('[data-f]'), v = e.target.closest('[data-v]');
  if (f) { const i = user.favs.indexOf(f.dataset.f); i >= 0 ? user.favs.splice(i, 1) : user.favs.push(f.dataset.f); save(); renderTips(); $(`[data-f="${f.dataset.f}"]`).focus(); }
  if (v) { const card = v.closest('.vcard'), id = v.dataset.v, vid = document.createElement('video'); vid.controls = true; vid.autoplay = true; vid.src = `assets/videos/${id}.mp4`;
    vid.onerror = () => { card.innerHTML = '<p class="vmiss">Vídeo disponible próximamente.<br><small>PROVISIONAL: añade assets/videos/' + id + '.mp4</small></p>'; };
    card.innerHTML = ''; card.append(vid); }
};


/* ---- Vista móvil de toda la aplicación ---- */
function setMview(on) {
  document.body.classList.toggle('mview', on); store.set('tb_mview', on);
  const b = $('#viewBtn'); b.textContent = on ? '🖥' : '📱'; b.setAttribute('aria-pressed', on);
  const l = on ? 'Cambiar a vista de PC' : 'Cambiar a vista de móvil'; b.setAttribute('aria-label', l); b.title = l;
  if (!$('[data-page=mapa]').hidden) drawMapa();
  if (!tut.hidden) drawTut();
  if (user) paintTitle();
}
$('#viewBtn').onclick = () => setMview(!document.body.classList.contains('mview'));

/* ---- Buddy, el asistente de viaje (respuestas predefinidas) ---- */
const nz = x => x.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const CITY = {
  Francia: t => /llegar|hotel|metro|tren|taxi|transporte|centro|rer/.test(t) ? 'Desde el aeropuerto <b>Charles de Gaulle (CDG)</b>, el <b>tren RER B</b> te lleva al centro en unos 35 min. También hay taxi/VTC y autobuses. El tren es la opción más previsible.' : /comer|comida|restaur|cena|desayun/.test(t) ? 'Prueba los bistrós de <b>Le Marais</b> y desayuna croissant y baguette en una panadería. Reserva mesa en fin de semana: muchas cocinas cierran pronto.' : /consejo|tip|cuidado|robo|carterista|ahorr|entrada|reserv|enchufe|moneda/.test(t) ? 'Reserva con antelación la <b>Torre Eiffel</b> y el <b>Louvre</b>, cuida tus pertenencias en zonas turísticas y transporte, y lleva calzado cómodo. Moneda: euro. Enchufe: tipo C/E.' : 'En París no te pierdas la <b>Torre Eiffel</b> (reserva y ve temprano), el <b>Louvre</b> (entrada con hora fija), un <b>crucero por el Sena</b> al atardecer, <b>Montmartre y Sacré-Cœur</b> y una cena en <b>Le Marais</b>. Tienes el plan completo en <b>Mi viaje → Generar con IA</b>.',
  Portugal: t => /llegar|hotel|metro|tren|taxi|transporte|centro|aerobus/.test(t) ? 'El <b>metro (línea roja)</b> conecta el aeropuerto con el centro en unos 20 min. También hay taxi/VTC y el Aerobús. Con maleta, el metro es lo más cómodo.' : /comer|comida|restaur|cena|desayun|pasteis/.test(t) ? 'Prueba los <b>pastéis de Belém</b>, el <b>Time Out Market</b> y el marisco en Baixa o Alfama. Para cenar con fado, reserva con antelación.' : /consejo|tip|cuidado|robo|carterista|ahorr|entrada|reserv|enchufe|moneda/.test(t) ? 'Lleva calzado cómodo (hay muchas cuestas), cuida tus pertenencias en el tranvía 28 y evita las horas punta. Moneda: euro. Enchufe: tipo C/F. Hora: 1 h menos que en España.' : 'En Lisboa: <b>Torre de Belém</b> y Jerónimos, <b>Alfama</b> y el castillo de São Jorge, un paseo en el <b>tranvía 28</b>, el atardecer en el <b>Miradouro da Senhora do Monte</b> y una cena con fado. El plan completo está en <b>Mi viaje → Generar con IA</b>.'
};
const KB = [
  [['liquid', '100 ml', '100ml', 'botella', 'perfume', 'champu', 'gel ', 'crema', 'agua'], 'Los líquidos, geles y cremas de cabina deben ir en envases de <b>máx. 100 ml</b>, dentro de <b>una bolsa transparente</b> reutilizable de 1 litro, y sacarla de la mochila en el control. Lo que compras después del control (duty free) va en bolsa sellada. 💧'],
  [['equipaje de mano', 'cabina', 'mochila', 'maleta de mano', 'medidas', '55x40', 'bulto'], 'Las medidas y el peso del equipaje de cabina <b>dependen de tu aerolínea</b>. Con frecuencia son unos 55×40×20 cm y entre 8 y 10 kg, pero compruébalo en tu reserva. Algunas tarifas básicas solo incluyen un objeto pequeño bajo el asiento. 🧳'],
  [['facturar', 'facturada', 'bodega', '23 kg', '20 kg', 'peso', 'kilos', 'sobrepeso', 'pesar'], 'El equipaje facturado suele tener un límite de entre <b>20 y 23 kg</b> según la tarifa. Pésalo en casa y deja 1 kg de margen: pagar el exceso en el mostrador sale caro. ⚖️'],
  [['bateria', 'powerbank', 'power bank', 'cargador portatil', 'litio'], 'Las baterías externas (<b>powerbank</b>) van siempre en <b>cabina</b>, nunca en bodega. Hasta 100 Wh no necesitas permiso; entre 100 y 160 Wh requieren aprobación de la aerolínea. 🔋'],
  [['documento', 'pasaporte', 'dni', 'visado', 'visa ', 'vigencia', 'caducidad', 'requisitos de entrada', 'eta'], 'Lleva <b>DNI o pasaporte en vigor</b>. Dentro del espacio Schengen suele bastar el DNI, pero en otros destinos (como Reino Unido) hace falta pasaporte, y algunos exigen vigencia mínima, visado o autorización electrónica. Confírmalo en la web oficial del destino. 🪪'],
  [['menor', 'nino', 'nina', 'hijo', 'hija', 'autorizacion de los padres', 'no acompanado'], 'Si viaja un <b>menor solo</b>, contrata el servicio de menor no acompañado de la aerolínea y consulta si hace falta autorización de los padres según el destino. Activa el <b>seguimiento familiar</b> de TravelBuddy para ver cada fase del viaje. 👧'],
  [['abuel', 'mayor', 'movilidad', 'silla de ruedas', 'asistencia', 'discapacidad', 'pmr'], 'Las personas con movilidad reducida pueden pedir <b>asistencia gratuita en el aeropuerto</b>. Conviene solicitarla a la aerolínea con al menos 48 horas de antelación. Con el <b>seguimiento familiar</b>, sus familiares verán cada fase. 🤝'],
  [['mascota', 'perro', 'gato', 'animal'], 'Las condiciones para viajar con mascotas <b>dependen de la aerolínea y del destino</b> (transportín, peso, microchip, cartilla sanitaria). Consúltalo con tiempo, porque las plazas suelen ser limitadas. 🐾'],
  [['cuanto antes', 'antelacion', 'que hora llegar', 'cierre', 'cuando llegar', 'llegar al aeropuerto', 'horas antes', 'a que hora'], 'Recomendamos llegar <b>unas 2 horas antes</b> en vuelos europeos y <b>3 horas</b> en intercontinentales. La mayoría cierra la facturación entre 40 y 60 minutos antes y el embarque empieza unos 40 minutos antes. 🕑'],
  [['retraso', 'cancel', 'compensacion', 'perdi el vuelo', 'perdido', 'reclam'], 'Si tu vuelo se retrasa o se cancela, habla con la aerolínea: en la UE tienes derecho a asistencia y, según el caso, a una compensación. Guarda tu tarjeta de embarque y tu reserva para reclamar. 📄'],
  [['seguridad', 'control', 'portatil', 'escaner', 'cinturon', 'zapatos'], 'En el control de seguridad prepara la <b>tarjeta de embarque</b>, saca la bolsa de líquidos y los dispositivos grandes (portátil, tablet) si te lo piden, y vacía los bolsillos. Con ropa sin metal irás más rápido. 🛂'],
  [['prohibido', 'permitido', 'puedo llevar', 'cuchillo', 'tijera', 'arma', 'alcohol', 'comida'], 'En cabina no puedes llevar objetos cortantes grandes, armas ni más de 100 ml por envase de líquidos. La comida sólida suele estar permitida, pero revisa las normas del destino (algunos países restringen productos frescos). 🚫'],
  [['mi puerta', 'mi vuelo', 'mi terminal', 'mi embarque', 'mi avion', 'a que hora sale', 'cual es mi'], () => { const f = curF(); return `Tu vuelo <b>${curCode}</b> (${f.from} → ${f.to}) sale a las <b>${f.dep}</b> desde la <b>terminal ${f.terminal}</b>, puerta <b>${f.gate}</b>. Míralo en el <b>Mapa</b> para ver cuánto tardas en llegar. ✈️`; }],
  [['mi destino', 'donde voy', 'a donde voy', 'mi ciudad'], t => CITY[curF().country](t)],
  [['travelbuddy', 'la app', 'aplicacion', 'seguimiento familiar', 'mapa 3d', 'logros', 'itinerario', 'como funciona', 'que puedes hacer', 'que haces'], 'TravelBuddy te acompaña antes, durante y después del viaje: <b>guías</b>, datos de tu <b>vuelo y avión</b>, <b>itinerario</b> con o sin IA, <b>mapa 2D y 3D</b> del aeropuerto, <b>seguimiento familiar</b>, foro y logros. 🌍'],
  [['paris', 'francia', 'eiffel', 'louvre', 'cdg', 'charles de gaulle'], CITY.Francia],
  [['lisboa', 'portugal', 'belem', 'alfama'], CITY.Portugal],
  [['consejo', 'recomendacion', 'tips', 'trucos', 'ahorrar', 'seguro de viaje', 'carterista', 'robo', 'que llevar', 'que meto'], 'Mis consejos: haz <b>copias digitales</b> de tu documentación, descarga billetes y mapas sin conexión, contrata un <b>seguro de viaje</b>, avisa a tu banco si viajas fuera y no dejes tus objetos de valor a la vista. Tienes más en <b>Guía → Tips de TravelBuddy</b>. 💡'],
  [['hotel', 'alojamiento', 'taxi', 'transporte', 'centro'], t => CITY[curF().country]('llegar ' + t)],
  [['reglamento', 'normas', 'reglas', 'que necesito', 'requisitos'], 'Puedo ayudarte con: <b>líquidos</b>, <b>equipaje de mano y facturado</b>, <b>baterías</b>, <b>documentación</b>, <b>menores</b>, <b>personas mayores</b>, <b>mascotas</b> y <b>seguridad</b>. ¿Sobre cuál quieres saber? 📋'],
  [['hola', 'buenas', 'hey', 'buenos dias', 'buenas tardes', 'buenas noches'], '¡Hola! 👋 ¿En qué puedo ayudarte con tu viaje?'],
  [['gracias', 'genial', 'perfecto', 'vale'], '¡De nada! Si necesitas algo más, aquí estoy. ✈️']
];
const NOSE = 'Todavía no tengo esa respuesta 🤔. Prueba a preguntarme por <b>normas</b> (líquidos, equipaje, baterías, documentación), por <b>destinos</b> (París o Lisboa) o por <b>consejos de viaje</b>. Para normas oficiales, consulta a tu aerolínea.';
function answer(raw) {
  const t = nz(raw) + ' '; let best = null, bs = 0;
  KB.forEach(([k, a]) => { const sc = k.filter(w => t.includes(w)).length; if (sc > bs) { bs = sc; best = a; } });
  return best ? (typeof best === 'function' ? best(t) : best) : NOSE;
}
const chat = $('#chat'), msgs = $('#cmsgs');
const say = (who, html) => { const d = document.createElement('div'); d.className = 'cm ' + who; d.innerHTML = html; msgs.append(d); msgs.scrollTop = msgs.scrollHeight; return d; };
function ask(text) {
  text = text.trim(); if (!text) return; say('u', esc(text));
  const t = say('b t', 'Buddy está escribiendo…');
  setTimeout(() => { t.remove(); say('b', answer(text)); }, 450 + Math.random() * 350);
}
$('#cchips').innerHTML = ['¿Qué líquidos puedo llevar?', '¿Puedo llevar un powerbank?', '¿Qué ver en mi destino?', '¿Cuál es mi puerta?', 'Viajo con un menor', 'Consejos para viajar'].map(c => `<button type="button" class="fcb">${c}</button>`).join('');
$('#cchips').onclick = e => { const b = e.target.closest('button'); if (b) ask(b.textContent); };
$('#cform').onsubmit = e => { e.preventDefault(); ask($('#cin').value); $('#cin').value = ''; };
function setChat(on) {
  chat.hidden = !on; $('#chatfab').setAttribute('aria-expanded', on); $('#chatfab').hidden = on;
  if (on) { if (!msgs.children.length) say('b', `¡Hola, ${esc(user.name)}! Soy <b>Buddy</b>, tu asistente de viaje. Pregúntame por el reglamento, por recomendaciones o por los sitios que vas a visitar. ✈️`); $('#cin').focus(); } else $('#chatfab').focus();
}
$('#chatfab').onclick = () => setChat(true); $('#chatx').onclick = () => setChat(false);
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !chat.hidden) setChat(false); });

/* ---- Arranque: recuperar sesión ---- */
const s = store.get('tb_session', null); if (s && users()[s]) { user = norm(users()[s]); showDash(); }
