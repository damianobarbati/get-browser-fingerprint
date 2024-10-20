/** @type {import('./index.d.ts').getBrowserFingerprint} */
const getBrowserFingerprint = async ({ hardwareOnly = true, debug = false } = {}) => {
  const { cookieEnabled, deviceMemory, doNotTrack, hardwareConcurrency, language, languages, maxTouchPoints, platform, userAgent, vendor } = window.navigator;

  // we use screen info only on mobile, because on desktop the user may use multiple monitors
  const enableScreen = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  const { width, height, colorDepth, pixelDepth } = enableScreen ? window.screen : {}; // undefined will remove this from the stringify down here
  const timezoneOffset = new Date().getTimezoneOffset();
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const touchSupport = "ontouchstart" in window;
  const devicePixelRatio = window.devicePixelRatio;

  const canvas = getCanvasID(debug);
  const audio = await getAudioID(debug);
  const audioInfo = getAudioInfo();
  const webgl = getWebglID(debug);
  const webglInfo = getWebglInfo();

  const data = hardwareOnly
    ? {
        audioInfo,
        audio,
        canvas,
        colorDepth,
        deviceMemory,
        devicePixelRatio,
        hardwareConcurrency,
        height,
        maxTouchPoints,
        pixelDepth,
        platform,
        touchSupport,
        webgl,
        webglInfo,
        width,
      }
    : {
        audioInfo,
        audio,
        canvas,
        colorDepth,
        cookieEnabled,
        deviceMemory,
        devicePixelRatio,
        doNotTrack,
        hardwareConcurrency,
        height,
        language,
        languages,
        maxTouchPoints,
        pixelDepth,
        platform,
        timezone,
        timezoneOffset,
        touchSupport,
        userAgent,
        vendor,
        webgl,
        webglInfo,
        width,
      };

  if (debug) console.log("Fingerprint data:", JSON.stringify(data, null, 2));

  const payload = JSON.stringify(data, null, 2);
  const result = murmurhash3_32_gc(payload);
  return result;
};

const getCanvasID = (debug) => {
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const text = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ`~1!2@3#4$5%6^7&8*9(0)-_=+[{]}|;:',<.>/?";
    ctx.textBaseline = "top";
    ctx.font = "14px 'Arial'";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#f60";
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = "#069";
    ctx.fillText(text, 2, 15);
    ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
    ctx.fillText(text, 4, 17);

    const result = canvas.toDataURL();

    if (debug) {
      document.body.appendChild(canvas);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    return murmurhash3_32_gc(result);
  } catch {
    return null;
  }
};

const getWebglID = (debug) => {
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("webgl");
    canvas.width = 256;
    canvas.height = 128;

    const f =
      "attribute vec2 attrVertex;varying vec2 varyinTexCoordinate;uniform vec2 uniformOffset;void main(){varyinTexCoordinate=attrVertex+uniformOffset;gl_Position=vec4(attrVertex,0,1);}";
    const g = "precision mediump float;varying vec2 varyinTexCoordinate;void main() {gl_FragColor=vec4(varyinTexCoordinate,0,1);}";
    const h = ctx.createBuffer();

    ctx.bindBuffer(ctx.ARRAY_BUFFER, h);

    const i = new Float32Array([-0.2, -0.9, 0, 0.4, -0.26, 0, 0, 0.7321, 0]);

    ctx.bufferData(ctx.ARRAY_BUFFER, i, ctx.STATIC_DRAW);
    h.itemSize = 3;
    h.numItems = 3;

    const j = ctx.createProgram();
    const k = ctx.createShader(ctx.VERTEX_SHADER);

    ctx.shaderSource(k, f);
    ctx.compileShader(k);

    const l = ctx.createShader(ctx.FRAGMENT_SHADER);

    ctx.shaderSource(l, g);
    ctx.compileShader(l);
    ctx.attachShader(j, k);
    ctx.attachShader(j, l);
    ctx.linkProgram(j);
    ctx.useProgram(j);

    j.vertexPosAttrib = ctx.getAttribLocation(j, "attrVertex");
    j.offsetUniform = ctx.getUniformLocation(j, "uniformOffset");

    ctx.enableVertexAttribArray(j.vertexPosArray);
    ctx.vertexAttribPointer(j.vertexPosAttrib, h.itemSize, ctx.FLOAT, !1, 0, 0);
    ctx.uniform2f(j.offsetUniform, 1, 1);
    ctx.drawArrays(ctx.TRIANGLE_STRIP, 0, h.numItems);

    const n = new Uint8Array(canvas.width * canvas.height * 4);
    ctx.readPixels(0, 0, canvas.width, canvas.height, ctx.RGBA, ctx.UNSIGNED_BYTE, n);

    const result = JSON.stringify(n).replace(/,?"[0-9]+":/g, "");

    if (debug) {
      document.body.appendChild(canvas);
    } else {
      ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT | ctx.STENCIL_BUFFER_BIT);
    }

    return murmurhash3_32_gc(result);
  } catch {
    return null;
  }
};

const getWebglInfo = () => {
  try {
    const ctx = document.createElement("canvas").getContext("webgl");

    const result = {
      VERSION: String(ctx.getParameter(ctx.VERSION)),
      SHADING_LANGUAGE_VERSION: String(ctx.getParameter(ctx.SHADING_LANGUAGE_VERSION)),
      VENDOR: String(ctx.getParameter(ctx.VENDOR)),
      SUPPORTED_EXTENSIONS: String(ctx.getSupportedExtensions()),
    };

    return result;
  } catch {
    return null;
  }
};

const getAudioInfo = () => {
  try {
    const OfflineAudioContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    const length = 44100;
    const sampleRate = 44100;
    const context = new OfflineAudioContext(1, length, sampleRate);

    const result = {
      sampleRate: context.sampleRate,
      channelCount: context.destination.maxChannelCount,
      outputLatency: context.outputLatency,
      state: context.state,
      baseLatency: context.baseLatency,
    };

    return result;
  } catch {
    return null;
  }
};

const getAudioID = async (debug) => {
  try {
    const OfflineAudioContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    const sampleRate = 44100;
    const length = 44100; // Number of samples (1 second of audio)
    const context = new OfflineAudioContext(1, length, sampleRate);

    // Create an oscillator to generate sound
    const oscillator = context.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.value = 440;

    oscillator.connect(context.destination);
    oscillator.start();

    // Render the audio into a buffer
    const renderedBuffer = await context.startRendering();
    const channelData = renderedBuffer.getChannelData(0);

    // Generate fingerprint by summing the absolute values of the audio data
    const result = channelData.reduce((acc, val) => acc + Math.abs(val), 0).toString();

    if (debug) {
      const wavBlob = bufferToWav(renderedBuffer);
      const audioURL = URL.createObjectURL(wavBlob);

      const audioElement = document.createElement("audio");
      audioElement.controls = true;
      audioElement.src = audioURL;
      document.body.appendChild(audioElement);
    }

    return murmurhash3_32_gc(result);
  } catch {
    return null;
  }
};

const bufferToWav = (buffer) => {
  const numOfChannels = buffer.numberOfChannels;
  const length = buffer.length * numOfChannels * 2 + 44; // Buffer size in bytes
  const wavBuffer = new ArrayBuffer(length);
  const view = new DataView(wavBuffer);

  // Write WAV file header
  writeString(view, 0, "RIFF");
  view.setUint32(4, length - 8, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numOfChannels, true);
  view.setUint32(24, buffer.sampleRate, true);
  view.setUint32(28, buffer.sampleRate * numOfChannels * 2, true);
  view.setUint16(32, numOfChannels * 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, length - 44, true);

  // Write interleaved audio data
  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numOfChannels; channel++) {
      const sample = buffer.getChannelData(channel)[i];
      const intSample = Math.max(-1, Math.min(1, sample)) * 32767;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Blob([view], { type: "audio/wav" });
};

const writeString = (view, offset, string) => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
};

const murmurhash3_32_gc = (key) => {
  const remainder = key.length & 3; // key.length % 4
  const bytes = key.length - remainder;
  const c1 = 0xcc9e2d51;
  const c2 = 0x1b873593;

  let h1;
  let h1b;
  let k1;

  for (let i = 0; i < bytes; i++) {
    k1 = (key.charCodeAt(i) & 0xff) | ((key.charCodeAt(++i) & 0xff) << 8) | ((key.charCodeAt(++i) & 0xff) << 16) | ((key.charCodeAt(++i) & 0xff) << 24);
    ++i;

    k1 = ((k1 & 0xffff) * c1 + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
    k1 = (k1 << 15) | (k1 >>> 17);
    k1 = ((k1 & 0xffff) * c2 + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;

    h1 ^= k1;
    h1 = (h1 << 13) | (h1 >>> 19);
    h1b = ((h1 & 0xffff) * 5 + ((((h1 >>> 16) * 5) & 0xffff) << 16)) & 0xffffffff;
    h1 = (h1b & 0xffff) + 0x6b64 + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16);
  }

  const i = bytes - 1;

  k1 = 0;

  switch (remainder) {
    case 3: {
      k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;
      break;
    }
    case 2: {
      k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;
      break;
    }
    case 1: {
      k1 ^= key.charCodeAt(i) & 0xff;
      break;
    }
  }

  k1 = ((k1 & 0xffff) * c1 + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
  k1 = (k1 << 15) | (k1 >>> 17);
  k1 = ((k1 & 0xffff) * c2 + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;
  h1 ^= k1;

  h1 ^= key.length;

  h1 ^= h1 >>> 16;
  h1 = ((h1 & 0xffff) * 0x85ebca6b + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff;
  h1 ^= h1 >>> 13;
  h1 = ((h1 & 0xffff) * 0xc2b2ae35 + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16)) & 0xffffffff;
  h1 ^= h1 >>> 16;

  return h1 >>> 0;
};

if (typeof window !== "undefined") {
  window.getBrowserFingerprint = getBrowserFingerprint;
}

export default getBrowserFingerprint;
