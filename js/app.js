import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { initThemeSystem, isLightTheme } from './theme.js';
import { initMobileNav } from './mobile-nav.js';
import { initGlobeNarrationPanel } from './ui-controls.js';
import { stopContinentNarration, speakContinentNarrationFromData, getContinentNarratorAuto } from './multimedia.js';
import { CONTINENTS, CONTINENT_TIMELINES, latLonFromUV, continentFromLatLon } from './data.js';
import { runTimelineAnimation, clearTimelineCanvas } from './continentTimeline.js';

let panelAnimToken = 0;
let panelContinentId = null;
/** Last opened continent row (for “Play narration” + auto-read; wired in ui-controls.js). */
let lastContinentNarrationPayload = null;

function cancelPanelTimeline() {
  panelAnimToken += 1;
  const canvas = document.getElementById('panelTimelineCanvas');
  if (canvas) clearTimelineCanvas(canvas);
}

function initPanelTimeline() {
  const canvas = document.getElementById('panelTimelineCanvas');
  const playBtn = document.getElementById('panelTimelinePlay');
  const lineMode = document.getElementById('panelTimelineLineMode');
  const statusEl = document.getElementById('panelTimelineStatus');
  if (!canvas || !playBtn) return;

  playBtn.addEventListener('click', async () => {
    if (!panelContinentId) return;
    const my = ++panelAnimToken;
    const mode = lineMode?.value === 'bresenham' ? 'bresenham' : 'dda';
    await runTimelineAnimation(canvas, {
      continentId: panelContinentId,
      mode,
      getEvents: (id) => CONTINENT_TIMELINES[id] || [],
      statusEl,
      isCancelled: () => my !== panelAnimToken,
    });
  });
}

function findContinentData(id) {
  return CONTINENTS.find((c) => c.id === id) || null;
}

function openPanel(continentId) {
  const data = findContinentData(continentId);
  if (!data) return;

  /* Narration: point UI + idle sync at the new continent before stopping the previous clip. */
  lastContinentNarrationPayload = data;
  stopContinentNarration();

  const panel = document.getElementById('infoPanel');
  const backdrop = document.getElementById('panelBackdrop');
  const video = document.getElementById('panelVideo');

  document.getElementById('panelTitle').textContent = data.label;
  document.getElementById('panelOverview').textContent = data.overview;

  const statsEl = document.getElementById('panelStats');
  statsEl.innerHTML = '';
  for (const [dt, dd] of data.stats) {
    const dterm = document.createElement('dt');
    dterm.textContent = dt;
    const ddesc = document.createElement('dd');
    ddesc.textContent = dd;
    statsEl.appendChild(dterm);
    statsEl.appendChild(ddesc);
  }

  const eventsEl = document.getElementById('panelEvents');
  if (eventsEl) {
    eventsEl.innerHTML = '';
    for (const ev of data.highlights || []) {
      const li = document.createElement('li');
      li.className = 'event-item';
      const head = document.createElement('div');
      head.className = 'event-item__head';
      const when = document.createElement('span');
      when.className = 'event-item__when';
      when.textContent = ev.when;
      const title = document.createElement('strong');
      title.className = 'event-item__title';
      title.textContent = ev.title;
      head.appendChild(when);
      head.appendChild(document.createTextNode(' \u00b7 '));
      head.appendChild(title);
      const p = document.createElement('p');
      p.className = 'event-item__text';
      p.textContent = ev.text;
      li.appendChild(head);
      li.appendChild(p);
      eventsEl.appendChild(li);
    }
  }

  panelContinentId = data.id;
  cancelPanelTimeline();
  const panelTlStatus = document.getElementById('panelTimelineStatus');
  if (panelTlStatus) {
    panelTlStatus.textContent = 'Press “Play timeline” to draw this region with DDA/Bresenham, circles, and Bézier chords.';
  }

  const imagesEl = document.getElementById('panelImages');
  imagesEl.innerHTML = '';
  for (const img of data.images) {
    const el = document.createElement('img');
    el.src = img.src;
    el.alt = img.alt;
    el.loading = 'lazy';
    el.referrerPolicy = 'no-referrer';
    el.decoding = 'async';
    imagesEl.appendChild(el);
  }

  const ytWrap = document.getElementById('panelVideoYoutubeWrap');
  const ytIframe = document.getElementById('panelVideoYoutube');
  const youtubeId = data.youtubeId?.trim();
  if (youtubeId && ytWrap && ytIframe) {
    video.pause();
    video.removeAttribute('src');
    video.load();
    video.hidden = true;
    ytWrap.hidden = false;
    ytIframe.src = `https://www.youtube.com/embed/${encodeURIComponent(youtubeId)}`;
  } else {
    if (ytWrap) ytWrap.hidden = true;
    if (ytIframe) ytIframe.removeAttribute('src');
    video.hidden = false;
    video.pause();
    video.src = data.video || '';
    video.load();
  }

  document.getElementById('panelMediaNote').textContent = data.mediaNote || '';

  document.body.classList.remove('mobile-nav-open');
  const navBackdrop = document.getElementById('mobileNavBackdrop');
  if (navBackdrop) {
    navBackdrop.hidden = true;
    navBackdrop.classList.remove('is-visible');
  }

  const narrow = window.matchMedia('(max-width: 768px)').matches;
  /* Keep the page from scrolling behind the bottom sheet on phones. */
  document.body.style.overflow = narrow ? 'hidden' : '';
  video.preload = narrow ? 'none' : 'metadata';

  panel.classList.add('is-open');
  panel.setAttribute('aria-hidden', 'false');
  backdrop.hidden = false;
  requestAnimationFrame(() => backdrop.classList.add('is-visible'));

  /* Narration trigger: auto-read when the narrator toggle is on (multimedia.js). */
  if (getContinentNarratorAuto()) {
    requestAnimationFrame(() => speakContinentNarrationFromData(data));
  }
}

function closePanel() {
  lastContinentNarrationPayload = null;
  stopContinentNarration();

  const panel = document.getElementById('infoPanel');
  const backdrop = document.getElementById('panelBackdrop');
  const video = document.getElementById('panelVideo');
  const ytWrap = document.getElementById('panelVideoYoutubeWrap');
  const ytIframe = document.getElementById('panelVideoYoutube');

  panel.classList.remove('is-open');
  panel.setAttribute('aria-hidden', 'true');
  backdrop.classList.remove('is-visible');
  video.pause();
  if (ytIframe) ytIframe.removeAttribute('src');
  if (ytWrap) ytWrap.hidden = true;
  video.hidden = false;
  panelContinentId = null;
  cancelPanelTimeline();

  setTimeout(() => {
    if (!backdrop.classList.contains('is-visible')) backdrop.hidden = true;
  }, 320);

  document.body.style.overflow = '';
}

const EARTH_RADIUS = 1;
const TEXTURE_URL = 'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg';
const BUMP_URL = 'https://threejs.org/examples/textures/planets/earth_normal_2048.jpg';

function initGlobe() {
  const container = document.getElementById('globe-container');
  if (!container) return null;

  const mobileMq = window.matchMedia('(max-width: 768px)');
  const tabletMq = window.matchMedia('(max-width: 1024px)');

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(0, 0.35, 2.8);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);
  renderer.domElement.style.touchAction = 'none';

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.minDistance = 1.35;
  controls.maxDistance = 5;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.35;
  controls.enablePan = false;

  const ambient = new THREE.AmbientLight(0xffffff, 0.22);
  scene.add(ambient);

  const sun = new THREE.DirectionalLight(0xffffff, 1.35);
  sun.position.set(4, 2.5, 3);
  scene.add(sun);

  const fill = new THREE.DirectionalLight(0x88aaff, 0.35);
  fill.position.set(-3, -1, -2);
  scene.add(fill);

  const baseLights = { ambient: 0.22, sun: 1.35, fill: 0.35 };
  function applyGlobeTheme(lightMode) {
    ambient.intensity = lightMode ? 0.52 : baseLights.ambient;
    sun.intensity = lightMode ? 1.58 : baseLights.sun;
    fill.intensity = lightMode ? 0.48 : baseLights.fill;
  }

  const sphereSegs = () => (mobileMq.matches ? 56 : 96);
  let geometry = new THREE.SphereGeometry(EARTH_RADIUS, sphereSegs(), sphereSegs());
  const loader = new THREE.TextureLoader();
  const earthMat = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    specular: 0x333344,
    shininess: 8,
  });

  loader.load(
    TEXTURE_URL,
    (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      earthMat.map = tex;
      earthMat.needsUpdate = true;
    },
    undefined,
    () => {
      earthMat.color = new THREE.Color(0x2244aa);
    }
  );

  loader.load(
    BUMP_URL,
    (tex) => {
      earthMat.normalMap = tex;
      earthMat.needsUpdate = true;
    },
    undefined,
    () => {}
  );

  const earth = new THREE.Mesh(geometry, earthMat);
  scene.add(earth);

  function applyViewportProfile() {
    const mobile = mobileMq.matches;
    const tablet = tabletMq.matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.5 : 2));
    if (mobile) {
      camera.position.set(0, 0.35, 3.05);
      controls.minDistance = 1.42;
      controls.maxDistance = 4.6;
      controls.autoRotateSpeed = 0.22;
    } else if (tablet) {
      camera.position.set(0, 0.35, 2.92);
      controls.minDistance = 1.38;
      controls.maxDistance = 5;
      controls.autoRotateSpeed = 0.3;
    } else {
      camera.position.set(0, 0.35, 2.8);
      controls.minDistance = 1.35;
      controls.maxDistance = 5;
      controls.autoRotateSpeed = 0.35;
    }
    const nextSegs = sphereSegs();
    if (geometry.parameters.widthSegments !== nextSegs) {
      geometry.dispose();
      geometry = new THREE.SphereGeometry(EARTH_RADIUS, nextSegs, nextSegs);
      earth.geometry = geometry;
    }
    controls.update();
  }

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  let hoveredContinent = null;
  let selectedContinent = null;

  function updateHighlight() {
    const active = selectedContinent || hoveredContinent;
    if (active) {
      earthMat.emissive = new THREE.Color(0x112244);
      earthMat.emissiveIntensity = 0.45;
    } else {
      earthMat.emissive = new THREE.Color(0x000000);
      earthMat.emissiveIntensity = 0;
    }
  }

  function latLonFromEvent(clientX, clientY) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObject(earth, false);
    if (!hits.length || !hits[0].uv) return null;
    return latLonFromUV(hits[0].uv.x, hits[0].uv.y);
  }

  /** Desktop hover only — touch drags would fight OrbitControls and cost work each move. */
  function onPointerMove(ev) {
    if (ev.pointerType !== 'mouse') return;
    const ll = latLonFromEvent(ev.clientX, ev.clientY);
    if (!ll) {
      hoveredContinent = null;
      updateHighlight();
      return;
    }
    hoveredContinent = continentFromLatLon(ll.lat, ll.lon);
    updateHighlight();
  }

  const TAP_PX = 14;
  const TAP_MS = 450;
  let tapProbe = null;

  function onPointerDown(ev) {
    if (ev.pointerType === 'mouse' && ev.button !== 0) return;
    tapProbe = { x: ev.clientX, y: ev.clientY, t: performance.now(), id: ev.pointerId };
  }

  function onPointerUp(ev) {
    if (!tapProbe || tapProbe.id !== ev.pointerId) return;
    const dx = ev.clientX - tapProbe.x;
    const dy = ev.clientY - tapProbe.y;
    const dt = performance.now() - tapProbe.t;
    tapProbe = null;
    if (Math.hypot(dx, dy) > TAP_PX || dt > TAP_MS) return;

    const ll = latLonFromEvent(ev.clientX, ev.clientY);
    if (!ll) return;
    const id = continentFromLatLon(ll.lat, ll.lon);
    if (id) {
      selectedContinent = id;
      updateHighlight();
      openPanel(id);
    }
  }

  function onPointerCancel() {
    tapProbe = null;
  }

  renderer.domElement.addEventListener('pointermove', onPointerMove);
  renderer.domElement.addEventListener('pointerdown', onPointerDown);
  renderer.domElement.addEventListener('pointerup', onPointerUp);
  renderer.domElement.addEventListener('pointercancel', onPointerCancel);
  renderer.domElement.style.cursor = 'grab';

  function syncRendererSize() {
    const { clientWidth, clientHeight } = container;
    camera.aspect = clientWidth / Math.max(clientHeight, 1);
    camera.updateProjectionMatrix();
    renderer.setSize(clientWidth, clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobileMq.matches ? 1.5 : 2));
  }

  applyViewportProfile();
  mobileMq.addEventListener('change', applyViewportProfile);
  tabletMq.addEventListener('change', applyViewportProfile);

  const obs = new ResizeObserver(() => {
    syncRendererSize();
  });
  obs.observe(container);

  document.getElementById('btnToggleRotation')?.addEventListener('click', (e) => {
    controls.autoRotate = !controls.autoRotate;
    e.currentTarget.setAttribute('aria-pressed', String(controls.autoRotate));
    e.currentTarget.textContent = controls.autoRotate ? 'Pause rotation' : 'Resume rotation';
  });

  document.getElementById('btnResetCamera')?.addEventListener('click', () => {
    applyViewportProfile();
    controls.target.set(0, 0, 0);
    controls.update();
  });

  document.getElementById('btnToggleWireframe')?.addEventListener('click', (e) => {
    earthMat.wireframe = !earthMat.wireframe;
    e.currentTarget.setAttribute('aria-pressed', String(earthMat.wireframe));
  });

  document.getElementById('btnClosePanel')?.addEventListener('click', closePanel);
  document.getElementById('panelBackdrop')?.addEventListener('click', closePanel);

  const quickNav = document.getElementById('continentQuickNav');
  if (quickNav) {
    for (const c of CONTINENTS) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn';
      b.textContent = c.label;
      b.addEventListener('click', () => {
        selectedContinent = c.id;
        updateHighlight();
        openPanel(c.id);
      });
      quickNav.appendChild(b);
    }
  }

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  applyGlobeTheme(isLightTheme());

  return { applyGlobeTheme };
}

initPanelTimeline();
initMobileNav();
initGlobeNarrationPanel(() => lastContinentNarrationPayload);

const globeApi = initGlobe();
initThemeSystem({
  globeApplyTheme: globeApi?.applyGlobeTheme,
  timelinePanelApi: { refreshClear: cancelPanelTimeline },
});
