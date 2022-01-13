import { Point } from "./types"

export const isInside = (point: Point, polygon: Point[]): boolean => {
  // ray-casting algorithm based on
  // https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html/pnpoly.html
  const { x, y } = point
  let inside = false

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const { x: xi, y: yi } = polygon[i]
    const { x: xj, y: yj } = polygon[j]
    const intersect =
      // eslint-disable-next-line no-mixed-operators
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }

  return inside
}

export const buildTriangle = (radius: number, center: Point): Point[] => {
  const { x, y } = center
  return [
    {
      x: x,
      y: y - radius,
    },
    {
      x: x + Math.sqrt(Math.pow(radius, 2) - Math.pow(radius / 2, 2)),
      y: y + radius / 2,
    },
    {
      x: x - Math.sqrt(Math.pow(radius, 2) - Math.pow(radius / 2, 2)),
      y: y + radius / 2,
    },
  ]
}

export const drawRegion = (
  ctx: CanvasRenderingContext2D,
  points: Point[],
  bgColor: string = "transparent"
): void => {
  ctx.beginPath()
  points.forEach((point: Point, index: number) => {
    const { x, y } = point
    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  ctx.fillStyle = bgColor
  ctx.fill()
  ctx.closePath()
}

export const drawTarget = (
  ctx: CanvasRenderingContext2D,
  point: Point,
  radius: number = 5
): void => {
  const { x, y } = point
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, 2 * Math.PI)
  ctx.fillStyle = "red"
  ctx.fill()
  ctx.stroke()
  ctx.closePath()
}
