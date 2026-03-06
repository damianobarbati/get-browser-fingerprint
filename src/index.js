const getAudioID = async isDebug => {
  const OfflineCtx = window.OfflineAudioContext || window.webkitOfflineAudioContext
  const context = new OfflineCtx(1, 6000, 44100)
  const osc = context.createOscillator()
  osc.type = 'sawtooth'
  osc.frequency.value = 8800
  const compressor = context.createDynamicsCompressor()
  compressor.threshold.value = -48
  compressor.knee.value = 30
  compressor.ratio.value = 14
  compressor.attack.value = 0
  compressor.release.value = 0.3
  const gain = context.createGain()
  gain.gain.value = 0.4
  osc.connect(compressor)
  compressor.connect(gain)
  gain.connect(context.destination)
  osc.start(0)
  const buffer = await context.startRendering()
  const channel = buffer.getChannelData(0)
  let hash = 0
  let hash2 = 0
  for (let i = 3000; i < 5800; i += 2) {
    const sampleValue = channel[i]
    hash = (hash * 31 + Math.floor((sampleValue + 1) * 100000)) | 0
    hash2 = Math.imul(hash2 ^ Math.floor(sampleValue * 98765), 0x85ebca77)
  }
  const final = (hash >>> 0) ^ (hash2 >>> 0)
  if (isDebug) {
    const waveformCanvas = document.createElement('canvas')
    waveformCanvas.width = 500
    waveformCanvas.height = 120
    waveformCanvas.style.border = '1px solid #444'
    waveformCanvas.style.margin = '10px 0'
    waveformCanvas.title = 'Audio buffer snippet (4500–5000 samples)'
    const ctx = waveformCanvas.getContext('2d')
    ctx.fillStyle = '#111'
    ctx.fillRect(0, 0, waveformCanvas.width, waveformCanvas.height)
    ctx.font = '14px monospace'
    ctx.fillStyle = '#0f8'
    ctx.textAlign = 'left'
    ctx.fillText('AudioID', 10, 20)
    ctx.strokeStyle = '#0f8'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    const waveform = Array.from(channel.slice(4500, 5000))
    const step = waveformCanvas.width / waveform.length
    for (let i = 0; i < waveform.length; i++) {
      const x = i * step
      const y = ((waveform[i] + 1) / 2) * waveformCanvas.height
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.stroke()
    document.body.appendChild(waveformCanvas)
  }
  return await sha256Hex(final.toString(16))
}

const getCanvasID = async isDebug => {
  const canvas = document.createElement('canvas')
  canvas.width = 280
  canvas.height = 100
  const ctx = canvas.getContext('2d')
  const gradient = ctx.createLinearGradient(0, 0, 280, 100)
  gradient.addColorStop(0, '#f60')
  gradient.addColorStop(0.4, '#09f')
  gradient.addColorStop(0.7, '#f09')
  gradient.addColorStop(1, '#0f9')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 280, 100)
  ctx.font = '18px "Arial","Helvetica","DejaVu Sans",sans-serif'
  ctx.fillStyle = '#000'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText('Fingerprint ¼½¾™©®∆π∑€¶§', 12, 45)
  ctx.font = 'bold 22px "Georgia","Times New Roman",serif'
  ctx.fillStyle = '#222'
  ctx.fillText('🦊🐱🚀 2026', 12, 78)
  ctx.globalAlpha = 0.7
  ctx.fillStyle = 'rgba(255, 80, 0, 0.35)'
  ctx.fillRect(180, 20, 80, 60)
  ctx.beginPath()
  ctx.arc(220, 50, 32, 0, Math.PI * 2)
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 4
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(30, 85)
  ctx.quadraticCurveTo(140, 20, 240, 85)
  ctx.strokeStyle = '#00f'
  ctx.lineWidth = 3
  ctx.stroke()
  if (isDebug) {
    canvas.style.border = '1px solid #444'
    document.body.appendChild(canvas)
  }
  const dataUrl = canvas.toDataURL('image/png')
  return await sha256Hex(dataUrl)
}

const getFonts = () => {
  const baseFonts = ['monospace', 'serif', 'sans-serif']
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
    'BlinkMacSystemFont'
  ]
  const span = document.createElement('span')
  span.style.fontSize = '72px'
  span.style.position = 'absolute'
  span.style.visibility = 'hidden'
  span.style.whiteSpace = 'nowrap'
  span.textContent = 'mmmmmmmmmwwwwwww'
  document.body.appendChild(span)
  const defaults = {}
  for (const base of baseFonts) {
    span.style.fontFamily = base
    defaults[base] = span.offsetWidth
  }
  const detected = []
  for (const font of testFonts) {
    let found = false
    for (const base of baseFonts) {
      span.style.fontFamily = `"${font}", ${base}`
      if (span.offsetWidth !== defaults[base]) {
        detected.push(font)
        found = true
        break
      }
    }
    if (!found) {
      span.style.fontFamily = `"${font}"`
      if (span.offsetWidth !== defaults.monospace && span.offsetWidth !== defaults.serif) {
        detected.push(font)
      }
    }
  }
  document.body.removeChild(span)
  return detected.length ? detected.sort().join(',') : null
}

const getMediaCodecs = () => {
  const video = document.createElement('video')
  const mimeList = [
    'video/webm',
    'video/mp4',
    'video/ogg',
    'audio/mp4',
    'audio/webm',
    'audio/ogg',
    'audio/mpeg'
  ]
  const codecSupportMap = {}
  for (const mime of mimeList) {
    const playbackSupport = video.canPlayType(mime)
    codecSupportMap[mime] = playbackSupport === '' ? 'no' : playbackSupport
  }
  return stableStringify(codecSupportMap)
}

const getWebglID = async () => {
  const canvas = document.createElement('canvas')
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
  const vendor = debugInfo
    ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
    : gl.getParameter(gl.VENDOR)
  const renderer = debugInfo
    ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
    : gl.getParameter(gl.RENDERER)
  const webglInfo = { vendor, renderer }
  return await sha256Hex(stableStringify(webglInfo))
}

const getWebgpuID = async isDebug => {
  const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' })
  const vendor = adapter.info?.vendor ?? ''
  const architecture = adapter.info?.architecture ?? ''
  const description = adapter.info?.description ?? ''
  const features = Array.from(adapter.features).sort()
  const limits = Array.from(adapter.limits).sort()
  const webgpuInfo = { vendor, architecture, description, features, limits }
  if (isDebug) {
    const debugDiv = document.createElement('pre')
    debugDiv.style.margin = '10px 0'
    debugDiv.style.padding = '10px'
    debugDiv.style.border = '1px solid #444'
    debugDiv.style.background = '#111'
    debugDiv.style.color = '#0f8'
    debugDiv.style.fontFamily = 'monospace'
    debugDiv.textContent = `WebGPU:\n${JSON.stringify(webgpuInfo, null, 2)}`
    document.body.appendChild(debugDiv)
  }
  return await sha256Hex(stableStringify(webgpuInfo))
}

const isMobile = () =>
  navigator.userAgentData?.mobile === true ||
  /Mobi|Android|iPhone|iPad|iPod|webOS|BlackBerry|Windows Phone/i.test(navigator.userAgent) ||
  (navigator.maxTouchPoints > 0 && matchMedia('(pointer:coarse)').matches && innerWidth <= 1024)

const safe = async asyncFn => {
  try {
    return await asyncFn()
  } catch {
    return null
  }
}

const sha256Hex = async inputString => {
  const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(inputString))
  return Array.from(new Uint8Array(hashBuffer))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('')
}

const stableStringify = value => {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value)
  }
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`
  }
  const keys = Object.keys(value).sort()
  const parts = []
  for (const key of keys) {
    const item = value[key]
    if (item !== undefined) {
      parts.push(`${stableStringify(key)}:${stableStringify(item)}`)
    }
  }
  return `{${parts.join(',')}}`
}

const getBrowserFingerprint = async ({ debug: isDebug = false } = {}) => {
  const startTime = performance.now()
  const userAgentHighEntropy = await safe(async () => {
    if (
      !window.navigator.userAgentData ||
      typeof window.navigator.userAgentData.getHighEntropyValues !== 'function'
    ) {
      return null
    }
    const highEntropyValues = await window.navigator.userAgentData.getHighEntropyValues([
      'architecture',
      'bitness',
      'platformVersion',
      'model',
      'fullVersionList'
    ])
    return stableStringify(highEntropyValues)
  })
  const mediaCodecs = await safe(() => getMediaCodecs())
  const fonts = await safe(() => getFonts())
  const numberingSystem = await safe(
    () =>
      new Intl.NumberFormat(window.navigator.languages?.[0] || 'en').resolvedOptions()
        .numberingSystem
  )
  const languages = window.navigator.languages
    ? Array.from(window.navigator.languages).join(',')
    : window.navigator.language || null
  const intlResolved = Intl.DateTimeFormat().resolvedOptions()
  const timezone = intlResolved.timeZone
  const timezoneOffset = new Date().getTimezoneOffset()
  const intlCalendar = intlResolved.calendar || null
  const hourCycle =
    intlResolved.hour12 !== undefined
      ? intlResolved.hour12
        ? 'h12'
        : 'h23'
      : intlResolved.hourCycle || null
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 'reduce'
    : 'no-preference'
  const colorScheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  const prefersContrast = window.matchMedia('(prefers-contrast: more)').matches
    ? 'more'
    : window.matchMedia('(prefers-contrast: less)').matches
      ? 'less'
      : window.matchMedia('(prefers-contrast: custom)').matches
        ? 'custom'
        : 'no-preference'
  const prefersReducedTransparency = window.matchMedia('(prefers-reduced-transparency: reduce)')
    .matches
    ? 'reduce'
    : 'no-preference'
  const forcedColors = window.matchMedia('(forced-colors: active)').matches ? 'active' : null
  const devicePixelRatio =
    typeof window.devicePixelRatio === 'number'
      ? Math.round(window.devicePixelRatio * 100) / 100
      : null
  const { pixelDepth, colorDepth } = window.screen
  const touchSupport = 'ontouchstart' in window || window.navigator.maxTouchPoints > 0
  const canvasID = await safe(() => getCanvasID(isDebug))
  const webglID = await safe(() => getWebglID())
  const webgpuID = await safe(() => getWebgpuID(isDebug))
  const audioID = await safe(() => getAudioID(isDebug))
  const aspectRatio =
    window.screen.width && window.screen.height
      ? (window.screen.width / window.screen.height).toFixed(4)
      : null
  const screenOrientation = await safe(
    () => (window.screen.orientation && window.screen.orientation.type) || null
  )
  const networkConnection =
    window.navigator.connection ||
    window.navigator.mozConnection ||
    window.navigator.webkitConnection
  const connectionType = networkConnection ? networkConnection.type || null : null
  const effectiveType =
    networkConnection && networkConnection.effectiveType ? networkConnection.effectiveType : null
  const saveData = networkConnection && networkConnection.saveData === true
  const pdfViewerEnabled =
    typeof window.navigator.pdfViewerEnabled === 'boolean'
      ? window.navigator.pdfViewerEnabled
      : null
  const webdriver =
    typeof window.navigator.webdriver === 'boolean' ? window.navigator.webdriver : null
  const intlSupportedCalendars = await safe(() => {
    if (typeof Intl.supportedValuesOf !== 'function') {
      return null
    }
    return Intl.supportedValuesOf('calendar').join(',')
  })
  const permissionsState = await safe(async () => {
    if (!window.navigator.permissions || typeof window.navigator.permissions.query !== 'function') {
      return null
    }
    const permissionNames = ['geolocation', 'notifications']
    const permissionStateMap = {}
    for (const name of permissionNames) {
      try {
        const permissionResult = await window.navigator.permissions.query({ name })
        permissionStateMap[name] = permissionResult.state
      } catch {
        permissionStateMap[name] = 'unsupported'
      }
    }
    return stableStringify(permissionStateMap)
  })
  const data = {
    vendor: window.navigator.vendor || null,
    platform: window.navigator.platform || null,
    userAgentHighEntropy: userAgentHighEntropy || null,
    mediaCodecs: mediaCodecs || null,
    fonts,
    numberingSystem,
    languages,
    timezone,
    timezoneOffset,
    intlCalendar,
    hourCycle,
    reducedMotion,
    colorScheme,
    prefersContrast,
    prefersReducedTransparency,
    pdfViewerEnabled,
    webdriver,
    intlSupportedCalendars: intlSupportedCalendars || null,
    permissionsState: permissionsState || null,
    hardwareConcurrency: window.navigator.hardwareConcurrency || null,
    deviceMemory: window.navigator.deviceMemory || null,
    forcedColors,
    devicePixelRatio,
    pixelDepth,
    colorDepth,
    touchSupport,
    screenOrientation: screenOrientation || null,
    connectionType,
    effectiveType,
    saveData,
    canvasID,
    webglID,
    webgpuID,
    audioID
  }
  const mobileData = {
    aspectRatio,
    width: window.screen.width,
    height: window.screen.height,
    maxTouchPoints: window.navigator.maxTouchPoints
  }
  if (isMobile()) {
    Object.assign(data, mobileData)
  }
  const payload = stableStringify(data)
  const fingerprint = await sha256Hex(payload)
  const elapsedMs = Math.round(performance.now() - startTime)
  return { fingerprint, ...data, elapsedMs }
}

export default getBrowserFingerprint
