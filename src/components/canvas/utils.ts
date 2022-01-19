import { Point } from "./types"

export const isInsidePolygon = (point: Point, polygon: Point[]): boolean => {
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

export const isInsideCircle = (
  point: Point,
  center: Point,
  radius: number
): boolean => {
  const { x, y } = point
  const { x: x0, y: y0 } = center
  return Math.sqrt((x - x0) * (x - x0) + (y - y0) * (y - y0)) < radius
}

export const buildTriangle = (
  radius: number,
  center: Point,
  sides: number = 3
): Point[] => {
  const { x, y } = center

  return Array.apply(null, Array(sides)).map(
    (value, i: number): Point => ({
      x: x + radius * Math.cos((i * 2 * Math.PI) / sides - Math.PI / 2),
      y: y + radius * Math.sin((i * 2 * Math.PI) / sides - Math.PI / 2),
    })
  )
}

export const generateGoalRegions = (
  center: Point,
  radius: number
): Point[][] => {
  const tipRadius: number = radius / 3
  const tipCenters: Point[] = buildTriangle(radius - tipRadius, center)

  const tipRegions: Point[][] = tipCenters.map((tipCenter: Point): Point[] =>
    buildTriangle(tipRadius, tipCenter)
  )

  const innerRadius: number = radius - (tipRadius / 2) * 3
  const innerRegion: Point[] = buildTriangle(innerRadius, center)
  const edgeRegions: Point[][] = []

  for (let i = 0; i < 3; i++) {
    const edgeRegion: Point[] = []
    edgeRegion.push({
      x: innerRegion[i].x,
      y: innerRegion[i].y,
    })
    edgeRegion.push({
      x: innerRegion[(i + 1) % 3].x,
      y: innerRegion[(i + 1) % 3].y,
    })
    edgeRegion.push({
      x: tipRegions[(i + 1) % 3][i].x,
      y: tipRegions[(i + 1) % 3][i].y,
    })
    edgeRegion.push({
      x: tipRegions[i][(1 + i) % 3].x,
      y: tipRegions[i][(1 + i) % 3].y,
    })
    edgeRegions.push(edgeRegion)
  }

  return tipRegions.concat(edgeRegions)
}

export const getEdgeMiddlePosition = (points: Point[]): Point[] => {
  const length = points.length
  const result: Point[] = []

  for (let i = 0; i < length; i++) {
    const { x: xi, y: yi } = points[i]
    const { x: xj, y: yj } = points[(i + 1) % length]
    result.push({
      x: xi + (xj - xi) / 2,
      y: yi + (yj - yi) / 2,
    })
  }
  return result
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

export const drawText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  fontColor: string = "#000000",
  font: string = "bold 24px serif",
  angle: number = 0,
  position: Point
): void => {
  const multipleTxt = text.split("\n")

  ctx.beginPath()
  ctx.save()
  ctx.translate(position.x, position.y)
  ctx.rotate((angle * Math.PI) / 180)
  ctx.textAlign = "center"
  ctx.font = font
  ctx.fillStyle = fontColor

  const metrics = ctx.measureText(text)
  const actualHeight =
    metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent

  multipleTxt.forEach((txt: string, i: number) => {
    ctx.fillText(txt, 0, actualHeight / 2 + i * actualHeight + (i > 0 ? 10 : 0))
  })
  ctx.restore()
  ctx.closePath()
}

export const drawTarget = (
  ctx: CanvasRenderingContext2D,
  point: Point,
  radius: number = 5,
  isMoving: boolean = false
): void => {
  const { x, y } = point
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, 2 * Math.PI)
  ctx.fillStyle = "#e44d46"

  if (isMoving) {
    ctx.strokeStyle = "#fca7aa"
  } else {
    ctx.strokeStyle = "transparent"
  }
  ctx.lineWidth = 5
  ctx.stroke()
  ctx.fill()
  ctx.closePath()
}

export const percentageFormatter = (
  amount: number,
  digits: number = 0
): string => {
  const option = {
    style: "percent",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }

  return new Intl.NumberFormat("en-US", option).format(amount)
}
