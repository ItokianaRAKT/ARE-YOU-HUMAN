/** Deterministic pseudo-random generator (mulberry32). */
export function mulberry32(seed) {
  let a = Math.floor(seed) >>> 0
  return function next() {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Random float in [min, max). */
export function rand(min = 0, max = 1) {
  return min + Math.random() * (max - min)
}

/** Random integer in [min, max] inclusive. */
export function randInt(min, max) {
  return Math.floor(rand(min, max + 1))
}

/** Pick a random item from a list. */
export function pick(list) {
  return list[Math.floor(Math.random() * list.length)]
}

/** Pick a random item that is not `exclude`. */
export function pickOther(list, exclude) {
  const pool = list.length > 1 ? list.filter((item) => item !== exclude) : list
  return pick(pool)
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

export function lerp(a, b, t) {
  return a + (b - a) * t
}

/** Smooth 1D value noise, useful for organic drift. */
export function makeNoise(seed = 1) {
  const rnd = mulberry32(seed)
  const table = Array.from({ length: 256 }, () => rnd() * 2 - 1)
  const wrap = (n) => ((n % 256) + 256) % 256
  return function noise(x) {
    const i = Math.floor(x)
    const f = x - i
    const a = table[wrap(i)]
    const b = table[wrap(i + 1)]
    const u = f * f * (3 - 2 * f)
    return a + (b - a) * u
  }
}
