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
  if (Array.isArray(obj)) return '[' + obj.map(stableStringify).join(',') + ']';

  const keys = Object.keys(obj).sort();
  const parts = [];
  for (const key of keys) {
    const value = obj[key];
    if (value !== undefined) parts.push(stableStringify(key) + ':' + stableStringify(value));
  }

  return '{' + parts.join(',') + '}';
};

/** @type {import('./index.d.ts').getBrowserFingerprint} */
const getBrowserFingerprint = async ({ debug = false } = {}) => {
  const nav = window.navigator;
  const scr = window.screen;
  const mq = window.matchMedia;

  const data = {
    aspectRatio: scr.width && scr.height ? (scr.width / scr.height).toFixed(4) : null,
    colorDepth: scr.colorDepth,
    pixelDepth: scr.pixelDepth,
    deviceMemory: nav.deviceMemory || null,
    hardwareConcurrency: nav.hardwareConcurrency || null,
    maxTouchPoints: nav.maxTouchPoints,
    touchSupport: 'ontouchstart' in window || nav.maxTouchPoints > 0,
    languages: nav.languages ? Array.from(nav.languages).join(',') : nav.language || null,
    platform: nav.platform || null,
    vendor: nav.vendor || null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset: new Date().getTimezoneOffset(),
    width: scr.width,
    height: scr.height,
  };

  const refreshRate = await safe(() => getRefreshRate());
  if (refreshRate) data.refreshRate = refreshRate;

  data.reducedMotion = mq('(prefers-reduced-motion: reduce)').matches ? 'reduce' : 'no-preference';
  data.colorScheme = mq('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  data.forcedColors = mq('(forced-colors: active)').matches ? 'active' : null;

  const webglInfo = await safe(() => getWebglInfo());
  if (webglInfo?.vendor && webglInfo?.renderer) {
    const webglHash = await safe(() => murmurHash3(`${webglInfo.vendor}|${webglInfo.renderer}`));
    if (webglHash) data.webgl = webglHash;
  }

  const canvasHash = await safe(() => getCanvasHash(debug));
  if (canvasHash) data.canvas = canvasHash;

  const audioID = await safe(() => getAudioID(debug));
  if (audioID) data.audio = audioID;

  const webgpuHash = await safe(() => getWebgpuHash(debug));
  if (webgpuHash) data.webgpu = webgpuHash;

  const fonts = await safe(() => getFonts(debug));
  if (fonts) data.fonts = fonts;

  const numberingSystem = await safe(() => {
    const nf = new Intl.NumberFormat(nav.languages?.[0] || 'en');
    return nf.resolvedOptions().numberingSystem || null;
  });
  if (numberingSystem) data.numberingSystem = numberingSystem;

  const payload = stableStringify(sortedEntries);
  const fingerprint = murmurHash3(payload);
  return { fingerprint, raw };
};

const getRefreshRate = async () => {
  if (!window.requestAnimationFrame) return null;
  return new Promise((r) => {
    const start = performance.now();
    let frames = 0;
    const tick = (now) => {
      frames++;
      if (now - start >= 1000) {
        r(Math.round((frames * 1000) / (now - start)));
      } else {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  }).catch(() => null);
};

const getWebglInfo = () => {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) return null;

  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  return {
    vendor: debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR),
    renderer: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
  };
};

const getCanvasHash = async (debug) => {
  const canvas = document.createElement('canvas');
  canvas.width = 280;
  canvas.height = 100;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // sfondo con gradiente
  const grad = ctx.createLinearGradient(0, 0, 280, 100);
  grad.addColorStop(0, '#f60');
  grad.addColorStop(0.4, '#09f');
  grad.addColorStop(0.7, '#f09');
  grad.addColorStop(1, '#0f9');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 280, 100);

  // testo con font multipli e caratteri problematici
  ctx.font = '18px "Arial","Helvetica","DejaVu Sans",sans-serif';
  ctx.fillStyle = '#000';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('Fingerprint ¼½¾™©®∆π∑€¶§', 12, 45);

  ctx.font = 'bold 22px "Georgia","Times New Roman",serif';
  ctx.fillStyle = '#222';
  ctx.fillText('🦊🐱🚀 2026', 12, 78);

  // forme con antialiasing e compositing
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
  const encoder = new TextEncoder();
  const bytes = encoder.encode(dataUrl);
  const hashBytes = await crypto.subtle.digest('SHA-256', bytes);
  const hashArray = Array.from(new Uint8Array(hashBytes));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  return hashHex;
};

const getAudioID = async (debug) => {
  const OfflineCtx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  if (!OfflineCtx) return null;

  try {
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
      if (ctx) {
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, wc.width, wc.height);

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
      }

      document.body.appendChild(wc);
    }

    return final >>> 0;
  } catch {
    return null;
  }
};

const getWebgpuHash = async (debug) => {
  if (!navigator.gpu) return null;

  try {
    const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' });
    if (!adapter) return null;

    const features = Array.from(adapter.features).sort();
    const limits = adapter.limits;
    const sortedLimits = Object.fromEntries(Object.entries(limits).sort(([a], [b]) => a.localeCompare(b)));

    const info = {
      vendor: adapter.info?.vendor || '',
      architecture: adapter.info?.architecture || '',
      description: adapter.info?.description || '',
    };

    if (debug) {
      const debugDiv = document.createElement('pre');
      debugDiv.style.margin = '10px 0';
      debugDiv.style.padding = '10px';
      debugDiv.style.border = '1px solid #444';
      debugDiv.style.background = '#111';
      debugDiv.style.color = '#0f8';
      debugDiv.style.fontFamily = 'monospace';
      debugDiv.textContent = `WebGPU:\n${stableStringify({ features, limits: sortedLimits, info }, null, 2)}`;
      document.body.appendChild(debugDiv);
    }

    const payload = stableStringify({ features, limits: sortedLimits, info });
    const encoder = new TextEncoder();
    const bytes = encoder.encode(payload);
    const hashBytes = await crypto.subtle.digest('SHA-256', bytes);
    const hashArray = Array.from(new Uint8Array(hashBytes));
    return hashArray
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
      .slice(0, 32);
  } catch {
    return null;
  }
};
const getFonts = (debug) => {
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

  if (debug) {
    const debugDiv = document.createElement('div');
    debugDiv.style.margin = '10px 0';
    debugDiv.style.padding = '10px';
    debugDiv.style.border = '1px solid #444';
    debugDiv.style.background = '#111';
    debugDiv.style.color = '#0f8';
    debugDiv.style.fontFamily = 'monospace';
    debugDiv.textContent = `Detected fonts: ${detected.join(', ') || 'none'}`;
    document.body.appendChild(debugDiv);
  }

  document.body.removeChild(span);
  return detected.length ? detected.sort().join(',') : null;
};

if (typeof window !== 'undefined') {
  window.getBrowserFingerprint = getBrowserFingerprint;
}

export default getBrowserFingerprint;
