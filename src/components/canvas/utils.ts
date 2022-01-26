import { Point } from "./types"

/**
 * check whether point is inside of the polygon or not
 * @param point target point position(x, y)
 * @param polygon the vertex array of the polygon
 * @returns boolean
 */
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

/**
 * check whether point is inside of the circle or not
 * @param point target point position(x, y)
 * @param center center position of the circle
 * @param radius radius of the circle
 * @returns boolean
 */
export const isInsideCircle = (
  point: Point,
  center: Point,
  radius: number
): boolean => {
  const { x, y } = point
  const { x: x0, y: y0 } = center
  return Math.sqrt((x - x0) * (x - x0) + (y - y0) * (y - y0)) < radius
}

/**
 * generating triangle vertexes with given center of gravity and radius of triangle
 * @param radius  radius of triangle
 * @param center  center of gravity
 * @param initAngle triangle's initial angle
 * @param sides   future feature: sides length of the polygon(default as 3)
 * @returns vertexes position array of the triangle
 */
export const buildTriangle = (
  radius: number,
  center: Point,
  initAngle: number = Math.PI / 2,
  sides: number = 3
): Point[] => {
  const { x, y } = center

  return Array.apply(null, Array(sides)).map(
    (value, i: number): Point => ({
      x: x + radius * Math.cos((i * 2 * Math.PI) / sides - initAngle),
      y: y + radius * Math.sin((i * 2 * Math.PI) / sides - initAngle),
    })
  )
}

/**
 * generating the goal regions
 * @param center center position of the origin triangle
 * @param radius radius of the triangle
 * @returns Polygon array
 */
export const generateGoalRegions = (
  center: Point,
  radius: number
): Point[][] => {
  const tipRadius: number = radius / 3
  const tipCenters: Point[] = buildTriangle(radius - tipRadius, center)

  //  tip regions: corner of the triangle
  const tipRegions: Point[][] = tipCenters.map((tipCenter: Point): Point[] =>
    buildTriangle(tipRadius, tipCenter)
  )

  const innerRadius: number = radius - (tipRadius / 2) * 3
  const outerRadius: number = radius + (tipRadius / 2) * 3

  const orgTri: Point[] = buildTriangle(radius, center)
  const innerTri: Point[] = buildTriangle(innerRadius, center)
  const outerTri: Point[] = buildTriangle(outerRadius, center)

  const inRegions: Point[][] = []
  const outRegions: Point[][] = []

  // inner Regions depend on inner triangle vertexes and tip Region vertexes
  for (let i = 0; i < 3; i++) {
    const edgeRegion: Point[] = []
    edgeRegion.push({
      x: innerTri[i].x,
      y: innerTri[i].y,
    })
    edgeRegion.push({
      x: innerTri[(i + 1) % 3].x,
      y: innerTri[(i + 1) % 3].y,
    })
    edgeRegion.push({
      x: tipRegions[(i + 1) % 3][i].x,
      y: tipRegions[(i + 1) % 3][i].y,
    })
    edgeRegion.push({
      x: tipRegions[i][(1 + i) % 3].x,
      y: tipRegions[i][(1 + i) % 3].y,
    })
    inRegions.push(edgeRegion)
  }

  // outer Regions depend on outer triangle vertexes and origin triangle vertexes
  for (let i = 0; i < 3; i++) {
    const outRegion: Point[] = []
    outRegion.push({
      x: orgTri[i].x,
      y: orgTri[i].y,
    })
    outRegion.push({
      x: orgTri[(i + 1) % 3].x,
      y: orgTri[(i + 1) % 3].y,
    })
    outRegion.push({
      x: outerTri[(i + 1) % 3].x,
      y: outerTri[(i + 1) % 3].y,
    })
    outRegion.push({
      x: outerTri[i].x,
      y: outerTri[i].y,
    })
    outRegions.push(outRegion)
  }

  return tipRegions.concat(inRegions).concat(outRegions)
}

/**
 * canvas context drawing region with given points
 * @param ctx Canvas rendering context var
 * @param points  positions of the polygon
 * @param bgColor   background color for region
 */
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

/**
 * canvas context drawing text with given fontFamily, fontColor, position and rotation of the text
 * @param ctx   canvas rendering context var
 * @param text  text which would be drawn
 * @param fontColor  text font color
 * @param font  text font family(font-size, font-weight, font-family)
 * @param angle   rotate angle of the text
 * @param position  center position of the txt
 */
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

/**
 * canvas drawing target circle
 * @param ctx   canvas rendering context var
 * @param point   center position of the target
 * @param radius  radius of the target
 * @param isMoving  picking up status of the target
 */
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

/**
 * percent number formatter
 * @param amount 0 ~ 1 number
 * @param digits number of decimals
 * @returns
 */
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
