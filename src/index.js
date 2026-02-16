const murmurHash3 = (key, seed = 0) => {
  let h = seed ^ key.length;

  let i = 0;
  const len = key.length;

  while (i + 3 < len) {
    let k = (key.charCodeAt(i) & 0xff) | ((key.charCodeAt(i + 1) & 0xff) << 8) | ((key.charCodeAt(i + 2) & 0xff) << 16) | ((key.charCodeAt(i + 3) & 0xff) << 24);

    k = Math.imul(k, 0xcc9e2d51);
    k = (k << 15) | (k >>> 17); // ROTL32(k, 15)
    k = Math.imul(k, 0x1b873593);

    h ^= k;
    h = (h << 13) | (h >>> 19); // ROTL32(h, 13)
    h = Math.imul(h, 5) + 0xe6546b64;

    i += 4;
  }

  // tail
  let k1 = 0;
  switch (len - i) {
    // biome-ignore lint/suspicious/noFallthroughSwitchClause: ignore
    case 3:
      k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;
    // biome-ignore lint/suspicious/noFallthroughSwitchClause: ignore
    case 2:
      k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;
    case 1:
      k1 ^= key.charCodeAt(i) & 0xff;
      k1 = Math.imul(k1, 0xcc9e2d51);
      k1 = (k1 << 15) | (k1 >>> 17);
      k1 = Math.imul(k1, 0x1b873593);
      h ^= k1;
  }

  // finalization
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;

  h = h >>> 0; // force unsigned 32 bit

  const result = h.toString(16).padStart(8, '0');
  return result;
};

const safe = async (fn) => {
  try {
    return await fn();
  } catch {
    return null;
  }
};

const stableStringify = (obj) => {
  // handle null, string, number, boolean
  if (obj === null || typeof obj !== 'object') return JSON.stringify(obj);
  // handle arrays recursively
  if (Array.isArray(obj)) return `[${obj.map(stableStringify).join(',')}]`;

  const keys = Object.keys(obj).sort();
  const parts = [];
  for (const key of keys) {
    const value = obj[key];
    if (value !== undefined) parts.push(`${stableStringify(key)}:${stableStringify(value)}`);
  }

  return `{${parts.join(',')}}`;
};

const isMobile = () =>
  navigator.userAgentData?.mobile === true ||
  /Mobi|Android|iPhone|iPad|iPod|webOS|BlackBerry|Windows Phone/i.test(navigator.userAgent) ||
  (navigator.maxTouchPoints > 0 && matchMedia('(pointer:coarse)').matches && innerWidth <= 1024);

/** @type {import('./index.d.ts').getBrowserFingerprint} */
const getBrowserFingerprint = async ({ debug = false } = {}) => {
  // software
  const fonts = await safe(() => getFonts());
  const numberingSystem = await safe(() => new Intl.NumberFormat(window.navigator.languages?.[0] || 'en').resolvedOptions().numberingSystem);
  const languages = window.navigator.languages ? Array.from(window.navigator.languages).join(',') : window.navigator.language || null;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const timezoneOffset = new Date().getTimezoneOffset();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'reduce' : 'no-preference';
  const colorScheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

  // hardware
  const forcedColors = window.matchMedia('(forced-colors: active)').matches ? 'active' : null;
  const { pixelDepth, colorDepth } = window.screen;
  const touchSupport = 'ontouchstart' in window || window.navigator.maxTouchPoints > 0;
  const canvasID = await safe(() => getCanvasID(debug));
  const webglID = await safe(() => getWebglID());
  const webgpuID = await safe(() => getWebgpuID(debug));
  const audioID = await safe(() => getAudioID(debug));
  const aspectRatio = window.screen.width && window.screen.height ? (window.screen.width / window.screen.height).toFixed(4) : null;

  const data = {
    // SOFTWARE
    vendor: window.navigator.vendor || null, // vendor
    platform: window.navigator.platform || null, // os
    fonts, // stable default os setting
    numberingSystem, // stable default os setting
    languages, // stable user locale/setting
    timezone, // stable user locale/setting
    timezoneOffset, // stable user locale/setting
    reducedMotion, // stable user locale/setting
    colorScheme, // stable user locale/setting
    // HARDWARE
    hardwareConcurrency: window.navigator.hardwareConcurrency || null, // cpu
    deviceMemory: window.navigator.deviceMemory || null, // ram
    forcedColors, // display
    pixelDepth, // display
    colorDepth, // display
    touchSupport, // display
    canvasID, // gpu
    webglID, // gpu
    webgpuID, // gpu
    audioID, // audio
  };

  const mobileData = {
    aspectRatio,
    width: window.screen.width,
    height: window.screen.height,
    maxTouchPoints: window.navigator.maxTouchPoints,
  };

  if (isMobile()) Object.assign(data, mobileData);

  const payload = stableStringify(data);
  const fingerprint = murmurHash3(payload);
  return { fingerprint, ...data };
};

const getCanvasID = async (debug) => {
  const canvas = document.createElement('canvas');
  canvas.width = 280;
  canvas.height = 100;
  const ctx = canvas.getContext('2d');

  // background with gradient
  const grad = ctx.createLinearGradient(0, 0, 280, 100);
  grad.addColorStop(0, '#f60');
  grad.addColorStop(0.4, '#09f');
  grad.addColorStop(0.7, '#f09');
  grad.addColorStop(1, '#0f9');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 280, 100);

  // text with multiple fonts and emoji
  ctx.font = '18px "Arial","Helvetica","DejaVu Sans",sans-serif';
  ctx.fillStyle = '#000';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('Fingerprint ¼½¾™©®∆π∑€¶§', 12, 45);

  ctx.font = 'bold 22px "Georgia","Times New Roman",serif';
  ctx.fillStyle = '#222';
  ctx.fillText('🦊🐱🚀 2026', 12, 78);

  // content with antialiasing and compositing
  ctx.globalAlpha = 0.7;
  ctx.fillStyle = 'rgba(255, 80, 0, 0.35)';
  ctx.fillRect(180, 20, 80, 60);

  ctx.beginPath();
  ctx.arc(220, 50, 32, 0, Math.PI * 2);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(30, 85);
  ctx.quadraticCurveTo(140, 20, 240, 85);
  ctx.strokeStyle = '#00f';
  ctx.lineWidth = 3;
  ctx.stroke();

  if (debug) {
    canvas.style.border = '1px solid #444';
    document.body.appendChild(canvas);
  }

  const dataUrl = canvas.toDataURL('image/png');
  const result = murmurHash3(dataUrl);
  return result;
};

const getWebglID = () => {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR);
  const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
  const info = { vendor, renderer };
  const result = murmurHash3(stableStringify(info));
  return result;
};

const getWebgpuID = async (debug) => {
  const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' });
  const vendor = adapter.info?.vendor ?? '';
  const architecture = adapter.info?.architecture ?? '';
  const description = adapter.info?.description ?? '';
  const features = Array.from(adapter.features).sort();
  const limits = Array.from(adapter.limits).sort();
  const info = { vendor, architecture, description, features, limits };

  if (debug) {
    const debugDiv = document.createElement('pre');
    debugDiv.style.margin = '10px 0';
    debugDiv.style.padding = '10px';
    debugDiv.style.border = '1px solid #444';
    debugDiv.style.background = '#111';
    debugDiv.style.color = '#0f8';
    debugDiv.style.fontFamily = 'monospace';
    debugDiv.textContent = `WebGPU:\n${JSON.stringify(info, null, 2)}`;
    document.body.appendChild(debugDiv);
  }

  const result = murmurHash3(stableStringify(info));
  return result;
};

const getAudioID = async (debug) => {
  const OfflineCtx = window.OfflineAudioContext || window.webkitOfflineAudioContext;

  const context = new OfflineCtx(1, 6000, 44100);
  const osc = context.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.value = 8800;

  const compressor = context.createDynamicsCompressor();
  compressor.threshold.value = -48;
  compressor.knee.value = 30;
  compressor.ratio.value = 14;
  compressor.attack.value = 0;
  compressor.release.value = 0.3;

  const gain = context.createGain();
  gain.gain.value = 0.4;

  osc.connect(compressor);
  compressor.connect(gain);
  gain.connect(context.destination);

  osc.start(0);
  const buffer = await context.startRendering();
  const channel = buffer.getChannelData(0);

  let hash = 0;
  let hash2 = 0;
  for (let i = 3000; i < 5800; i += 2) {
    const v = channel[i];
    hash = (hash * 31 + Math.floor((v + 1) * 100000)) | 0;
    hash2 = Math.imul(hash2 ^ Math.floor(v * 98765), 0x85ebca77);
  }
  const final = (hash >>> 0) ^ (hash2 >>> 0);

  if (debug) {
    const wc = document.createElement('canvas');
    wc.width = 500;
    wc.height = 120;
    wc.style.border = '1px solid #444';
    wc.style.margin = '10px 0';
    wc.title = 'Audio buffer snippet (4500–5000 samples)';

    const ctx = wc.getContext('2d');
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, wc.width, wc.height);

    ctx.font = '14px monospace';
    ctx.fillStyle = '#0f8';
    ctx.textAlign = 'left';
    ctx.fillText('AudioID', 10, 20);

    ctx.strokeStyle = '#0f8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();

    const waveform = Array.from(channel.slice(4500, 5000));
    const step = wc.width / waveform.length;

    for (let i = 0; i < waveform.length; i++) {
      const x = i * step;
      const y = ((waveform[i] + 1) / 2) * wc.height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    document.body.appendChild(wc);
  }

  const result = murmurHash3(final.toString(16));
  return result;
};

const getFonts = () => {
  const baseFonts = ['monospace', 'serif', 'sans-serif'];
  const testFonts = [
    'Arial',
    'Helvetica',
    'Verdana',
    'Trebuchet MS',
    'Comic Sans MS',
    'Georgia',
    'Times New Roman',
    'Courier New',
    'Segoe UI',
    'Roboto',
    'Open Sans',
    'Noto Sans',
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
  ];

  const span = document.createElement('span');
  span.style.fontSize = '72px';
  span.style.position = 'absolute';
  span.style.visibility = 'hidden';
  span.style.whiteSpace = 'nowrap';
  span.textContent = 'mmmmmmmmmwwwwwww';
  document.body.appendChild(span);

  const defaults = {};
  for (const base of baseFonts) {
    span.style.fontFamily = base;
    defaults[base] = span.offsetWidth;
  }

  const detected = [];
  for (const font of testFonts) {
    let found = false;
    for (const base of baseFonts) {
      span.style.fontFamily = `"${font}", ${base}`;
      if (span.offsetWidth !== defaults[base]) {
        detected.push(font);
        found = true;
        break;
      }
    }
    if (!found) {
      span.style.fontFamily = `"${font}"`;
      if (span.offsetWidth !== defaults.monospace && span.offsetWidth !== defaults.serif) {
        detected.push(font);
      }
    }
  }

  document.body.removeChild(span);
  const info = detected.length ? detected.sort().join(',') : null;
  return info;
};

if (typeof window !== 'undefined') {
  window.getBrowserFingerprint = getBrowserFingerprint;
}

export default getBrowserFingerprint;
