/**
 * Optional room tone: a low medical-office drone with a periodic
 * monitor ping. Entirely synthesised — no audio assets required.
 */
export function createAmbientDrone() {
  let ctx = null
  let master = null
  let pingTimer = null
  let voices = []
  let running = false

  function schedulePing() {
    if (!ctx || !master) return
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = 880 + Math.random() * 180
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.03, now + 0.012)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.1)
    osc.connect(gain)
    gain.connect(master)
    osc.start(now)
    osc.stop(now + 1.2)
    pingTimer = window.setTimeout(schedulePing, 5200 + Math.random() * 9000)
  }

  function start() {
    if (running) return true
    const AudioCtor = window.AudioContext || window.webkitAudioContext
    if (!AudioCtor) return false

    ctx = new AudioCtor()
    master = ctx.createGain()
    master.gain.value = 0
    master.connect(ctx.destination)
    master.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 2.5)

    const body = ctx.createBiquadFilter()
    body.type = 'lowpass'
    body.frequency.value = 340
    body.Q.value = 0.5
    body.connect(master)

    const partials = [
      { freq: 55, gain: 0.14, type: 'sine' },
      { freq: 55.6, gain: 0.14, type: 'sine' },
      { freq: 82.4, gain: 0.05, type: 'triangle' },
      { freq: 110.2, gain: 0.03, type: 'sine' },
    ]

    voices = partials.map(({ freq, gain, type }, i) => {
      const osc = ctx.createOscillator()
      osc.type = type
      osc.frequency.value = freq
      const level = ctx.createGain()
      level.gain.value = gain
      osc.connect(level)
      level.connect(body)
      osc.start()

      const lfo = ctx.createOscillator()
      lfo.frequency.value = 0.028 + i * 0.019
      const depth = ctx.createGain()
      depth.gain.value = 1.6 + i
      lfo.connect(depth)
      depth.connect(osc.detune)
      lfo.start()

      return [osc, lfo]
    })

    // Room tone: filtered noise loop.
    const frames = Math.floor(ctx.sampleRate * 4)
    const buffer = ctx.createBuffer(1, frames, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < frames; i += 1) data[i] = (Math.random() * 2 - 1) * 0.5
    const noise = ctx.createBufferSource()
    noise.buffer = buffer
    noise.loop = true
    const tone = ctx.createBiquadFilter()
    tone.type = 'bandpass'
    tone.frequency.value = 820
    tone.Q.value = 0.7
    const noiseLevel = ctx.createGain()
    noiseLevel.gain.value = 0.011
    noise.connect(tone)
    tone.connect(noiseLevel)
    noiseLevel.connect(master)
    noise.start()
    voices.push([noise])

    running = true
    pingTimer = window.setTimeout(schedulePing, 3600)
    return true
  }

  function stop() {
    if (!running) return
    running = false
    window.clearTimeout(pingTimer)
    const closing = ctx
    if (closing && master) {
      master.gain.cancelScheduledValues(closing.currentTime)
      master.gain.linearRampToValueAtTime(0, closing.currentTime + 0.6)
      window.setTimeout(() => {
        voices.flat().forEach((node) => {
          try {
            node.stop()
          } catch {
            /* already stopped */
          }
        })
        voices = []
        closing.close()
      }, 700)
    }
    ctx = null
    master = null
  }

  function toggle() {
    if (running) {
      stop()
      return false
    }
    return start()
  }

  return {
    start,
    stop,
    toggle,
    isRunning: () => running,
  }
}

export default createAmbientDrone
