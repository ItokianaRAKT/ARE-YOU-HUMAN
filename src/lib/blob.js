import { mulberry32 } from './random'

/**
 * Generate a closed set of points describing an organic ink blot.
 * Coordinates are relative to (cx, cy).
 */
export function blobPoints({
  seed = 1,
  count = 9,
  radius = 60,
  variance = 0.34,
  cx = 0,
  cy = 0,
}) {
  const rnd = mulberry32(Math.floor(seed * 1000003) >>> 0)
  const points = []
  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * Math.PI * 2 + (rnd() - 0.5) * 0.5
    const r = radius * (1 - variance + rnd() * variance * 2)
    points.push([cx + Math.cos(angle) * r, cy + Math.sin(angle) * r])
  }
  return points
}

/** Interpolate two point sets of equal length. */
export function lerpPoints(a, b, t) {
  return a.map((p, i) => [p[0] + (b[i][0] - p[0]) * t, p[1] + (b[i][1] - p[1]) * t])
}

/** Catmull-Rom (closed) points to a smooth cubic bezier path. */
export function pointsToPath(points) {
  const n = points.length
  if (n < 3) return ''
  const fmt = (v) => Math.round(v * 100) / 100
  let d = `M ${fmt(points[0][0])} ${fmt(points[0][1])}`
  for (let i = 0; i < n; i += 1) {
    const p0 = points[(i - 1 + n) % n]
    const p1 = points[i]
    const p2 = points[(i + 1) % n]
    const p3 = points[(i + 2) % n]
    const c1x = p1[0] + (p2[0] - p0[0]) / 6
    const c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6
    const c2y = p2[1] - (p3[1] - p1[1]) / 6
    d += ` C ${fmt(c1x)} ${fmt(c1y)}, ${fmt(c2x)} ${fmt(c2y)}, ${fmt(p2[0])} ${fmt(p2[1])}`
  }
  return `${d} Z`
}

/** Convenience: seed → svg path string. */
export function blobPath(options) {
  return pointsToPath(blobPoints(options))
}

/** Points scaled around their own centroid — used for breathing shapes. */
export function scalePoints(points, factor, cx = 0, cy = 0) {
  return points.map(([x, y]) => [cx + (x - cx) * factor, cy + (y - cy) * factor])
}
