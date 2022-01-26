import React, { useEffect } from "react"

import { Point, Props } from "./types"
import {
  buildTriangle,
  drawRegion,
  drawTarget,
  drawText,
  generateGoalRegions,
  isInsideCircle,
  isInsidePolygon,
  percentageFormatter,
} from "./utils"

import ArrowImage from "assets/images/arrow.png"

import "./index.css"
import { useTargetRates } from "states/target/hooks"

let canvasDOM: HTMLCanvasElement

const Canvas: React.FC<Props> = ({
  radius = 220,
  vertexRadius = 50,
  targetRadius = 5,
  debug = false,
}): JSX.Element => {
  const width: number =
    Math.sqrt(Math.pow(radius, 2) - Math.pow(radius / 2, 2)) * 2 //  width of the canvas
  const height: number = radius * 1.5 //  height of the canvas

  let moving: boolean = false //  target isMoving status
  let center: Point = {
    //  center position of the target
    x: width / 2 + vertexRadius,
    y: radius + vertexRadius,
  }
  let targetPoint: Point = center //  targetPoint's position

  const orgTriRegion: Point[] = buildTriangle(radius, center) //  origin triangle region
  const outerTriRegion: Point[] = buildTriangle(
    //  outer triangle region
    radius + vertexRadius * 2,
    center
  )
  const txtPositions: Point[] = buildTriangle(
    //  sustainability, economics, reliability text positions
    radius / 2 - 25,
    center,
    Math.PI / 6
  )
  const arrowPositions: Point[] = buildTriangle(
    //  direction arrow image center positions
    radius / 2 + 25,
    center,
    Math.PI / 6
  )
  const ratePositions: Point[] = buildTriangle(
    //  rates center positions
    radius / 2 + 75,
    center,
    Math.PI / 6
  )
  const goalRegions: Point[][] = generateGoalRegions(center, radius) //  9 regions

  const { targetRates, updateTargetRates } = useTargetRates() //  curernt rates

  /**
   * detect given point restrict
   * @param point
   * @returns
   */
  const isRestricted = (point: Point): boolean => {
    // checking target is inside the triangle's vertexes regions
    const isInsideVertex = orgTriRegion.some((vertex: Point) =>
      isInsideCircle(point, vertex, vertexRadius)
    )
    if (isInsideVertex) {
      return true
    }

    // checking target is inside the outer triangle region
    const isInsideTri = isInsidePolygon(point, outerTriRegion)
    if (!isInsideTri) {
      return true
    }
    return false
  }

  /**
   * detect current target in goal regions and update rates
   * @param point
   */
  const detectPtInGoalRegion = (point: Point): void => {
    let regionId = 0 //  center of tri
    let newRates = Object.values(targetRates)

    for (let i = 0; i < goalRegions.length; i++) {
      const region = goalRegions[i]
      const isInside = isInsidePolygon(point, region)
      if (isInside) {
        regionId = i + 1
        break
      }
    }

    switch (regionId) {
      case 0: //  center of tri
        newRates = [1 / 3, 1 / 3, 1 / 3]
        break
      case 1: //  tip1
        newRates = [1 / 2, 0, 1 / 2]
        break
      case 2: //  tip2
        newRates = [1 / 2, 1 / 2, 0]
        break
      case 3: //  tip3
        newRates = [0, 1 / 2, 1 / 2]
        break
      case 4: //  edge1
        newRates = [2 / 3, 1 / 6, 1 / 6]
        break
      case 5: //  edge2
        newRates = [1 / 6, 2 / 3, 1 / 6]
        break
      case 6: //  edge3
        newRates = [1 / 6, 1 / 6, 2 / 3]
        break
      case 7: //  outer1
        newRates = [1, 0, 0]
        break
      case 8: //  outer2
        newRates = [0, 1, 0]
        break
      case 9: //  outer3
        newRates = [0, 0, 1]
        break
      default:
        //  unknown
        break
    }
    updateTargetRates(newRates[0], newRates[1], newRates[2])
  }

  /**
   * canvas mouse event handling method
   * @returns
   */
  const EventListeners = (): void => {
    if (!canvasDOM) {
      return
    }

    canvasDOM.addEventListener("mousedown", function (e) {
      const mouse = {
        x: e.clientX,
        y: e.clientY,
      }
      if (isInsideCircle(mouse, targetPoint, targetRadius)) {
        moving = true
      }
    })

    canvasDOM.addEventListener("mouseup", function (e) {
      moving = false
      DrawCanvas(moving)
    })

    canvasDOM.addEventListener("mousemove", function (e) {
      if (!moving) {
        return
      }

      const mouse: Point = {
        x: e.clientX,
        y: e.clientY,
      }

      if (!isRestricted(targetPoint)) {
        DrawCanvas(moving)
        detectPtInGoalRegion(targetPoint)
      }
      if (!isRestricted(mouse)) {
        targetPoint = mouse
      }
    })
  }

  /**
   * main drawing method(draw triangle region, texts and target circle)
   * @param isMoving target is moving?
   * @returns
   */
  const DrawCanvas = (isMoving: boolean): void => {
    if (!canvasDOM || !canvasDOM.getContext) {
      return
    }

    const ctx: CanvasRenderingContext2D = canvasDOM.getContext(
      "2d"
    ) as CanvasRenderingContext2D

    ctx.clearRect(0, 0, canvasDOM.width, canvasDOM.height)

    // draw triangle
    drawRegion(ctx, orgTriRegion, "#9fc3f5")

    // if debugging mode, draw goal regions
    if (debug) {
      goalRegions.forEach((region: Point[]) => {
        drawRegion(
          ctx,
          region,
          `rgb(${(Math.random() * 1000) % 255}, ${
            (Math.random() * 1000) % 255
          }, ${(Math.random() * 1000) % 255})`
        )
      })
    }

    // draw center text Energy Trilemma
    drawText(
      ctx,
      "ENERGY\nTRILEMMA",
      "#005eca",
      "bold 30px sans-serif",
      0,
      center
    )
    ;["ECONOMICS", "RELIABILITY", "SUSTAINABILITY"].forEach(
      (txt: string, index: number) => {
        drawText(
          ctx,
          txt,
          "#00469b",
          "bold 20px sans-serif",
          60 - 60 * index,
          txtPositions[index]
        )
      }
    )

    // draw target
    drawTarget(ctx, targetPoint, targetRadius, isMoving)
  }

  /**
   * render triangle vertex range
   * @param point triangle vertext position
   * @param radius  vertext radius
   * @param index
   * @returns
   */
  const renderVertex = (
    point: Point,
    radius: number,
    index: number
  ): JSX.Element => (
    <div
      key={index}
      className="vertex"
      style={{
        left: point.x,
        top: point.y,
        width: radius * 2,
        height: radius * 2,
      }}
    >
      {String(index).padStart(2, "0")}
    </div>
  )

  /**
   * render arrows
   * @param point
   * @param index
   * @returns
   */
  const renderArrow = (point: Point, index: number): JSX.Element => (
    <img
      key={index}
      className="arrow"
      src={ArrowImage}
      alt="some"
      style={{
        width: radius,
        left: point.x,
        top: point.y,
        transform: `translate(-50%, -50%) rotate(${60 + index * 120}deg)`,
      }}
    />
  )

  /**
   * render rates(economics, reliability, sustainability)
   * @param point
   * @param index
   * @returns
   */
  const renderRate = (point: Point, index: number): JSX.Element => (
    <div
      key={index}
      id={`#rate${index}`}
      className="rate"
      style={{
        left: point.x,
        top: point.y,
        transform: `translate(-50%, -50%) rotate(${60 - index * 60}deg)`,
      }}
    >
      {percentageFormatter(Object.values(targetRates)[index])}
    </div>
  )

  useEffect(() => {
    const dom: HTMLCanvasElement | null = document.getElementById(
      "myCanvas"
    ) as HTMLCanvasElement | null
    if (dom) {
      canvasDOM = dom
      DrawCanvas(moving)
      EventListeners()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="CanvasWrapper">
      <canvas
        id="myCanvas"
        width={width + vertexRadius * 2}
        height={height + vertexRadius * 2}
      >
        Your browser does not support the HTML5 canvas tag.
      </canvas>
      {orgTriRegion.map((vertex: Point, index: number) => {
        return renderVertex(vertex, vertexRadius, index + 1)
      })}
      {arrowPositions.map((edge: Point, index: number) => {
        return renderArrow(edge, index)
      })}
      {ratePositions.map((edge: Point, index: number) => {
        return renderRate(edge, index)
      })}
    </div>
  )
}

export default Canvas
