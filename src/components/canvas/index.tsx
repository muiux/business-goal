import React, { useEffect } from "react"

import { Point, Props } from "./types"
import {
  buildTriangle,
  drawRegion,
  drawTarget,
  drawText,
  getEdgeMiddlePosition,
  isInside,
} from "./utils"

import ArrowImage from "assets/images/arrow.png"

import "./index.css"

const Canvas: React.FC<Props> = ({
  radius = 220,
  vertexRadius = 50,
  targetRadius = 5,
}): JSX.Element => {
  const width: number =
    Math.sqrt(Math.pow(radius, 2) - Math.pow(radius / 2, 2)) * 2
  const height: number = radius * 1.5

  let moving: boolean = false
  let canvasDOM: HTMLCanvasElement
  let center: Point = {
    x: width / 2 + vertexRadius,
    y: radius + vertexRadius,
  }
  let target: Point = center

  const triRegion: Point[] = buildTriangle(radius, center)
  const innerRegion: Point[] = buildTriangle(radius - vertexRadius, center)
  const txtPositions: Point[] = getEdgeMiddlePosition(innerRegion)
  const outerRegion: Point[] = buildTriangle(radius + vertexRadius + 10, center)
  const arrowPositions: Point[] = getEdgeMiddlePosition(outerRegion)
  const targetRegion: Point[] = buildTriangle(radius - targetRadius * 2, center)

  const DrawCanvas = (isMoving: boolean): void => {
    if (canvasDOM && canvasDOM.getContext) {
      const ctx: CanvasRenderingContext2D = canvasDOM.getContext(
        "2d"
      ) as CanvasRenderingContext2D

      ctx.clearRect(0, 0, canvasDOM.width, canvasDOM.height)

      drawRegion(ctx, triRegion, "#9fc3f5")
      drawText(ctx, "ENERGY\nTRILEMMA", "#005eca", "bold 30px serif", 0, center)
      drawText(
        ctx,
        "ECONOMICS",
        "#00469b",
        "bold 20px serif",
        60,
        txtPositions[0]
      )
      drawText(
        ctx,
        "RELIABILITY",
        "#00469b",
        "bold 20px serif",
        0,
        txtPositions[1]
      )
      drawText(
        ctx,
        "SUSTAINABILITY",
        "#00469b",
        "bold 20px serif",
        -60,
        txtPositions[2]
      )

      drawTarget(ctx, target, targetRadius, isMoving)
    }
  }

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

  const renderArrow = (edge: Point, index: number): JSX.Element => (
    <img
      key={index}
      className="arrow"
      src={ArrowImage}
      alt="some"
      style={{
        width: radius,
        left: edge.x,
        top: edge.y,
        transform: `translate(-50%, -50%) rotate(${60 + index * 120}deg)`,
      }}
    />
  )

  const EventListeners = (): void => {
    if (!canvasDOM) {
      return
    }

    canvasDOM.addEventListener("mousedown", function (e) {
      const mouseX = e.clientX - 1,
        mouseY = e.clientY - 1,
        distance = Math.sqrt(
          Math.pow(mouseX - target.x, 2) + Math.pow(mouseY - target.y, 2)
        )

      if (distance <= targetRadius) {
        moving = true
      }
    })

    canvasDOM.addEventListener("mouseup", function (e) {
      moving = false
      DrawCanvas(moving)
    })

    canvasDOM.addEventListener("mousemove", function (e) {
      if (moving) {
        if (isInside(target, targetRegion)) {
          DrawCanvas(moving)
        }
        if (
          isInside(
            {
              x: e.clientX,
              y: e.clientY,
            },
            targetRegion
          )
        ) {
          target = {
            x: e.clientX - 1,
            y: e.clientY - 1,
          }
        }
      }
    })
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const dom: HTMLCanvasElement | null = document.getElementById(
        "myCanvas"
      ) as HTMLCanvasElement | null
      if (dom) {
        canvasDOM = dom
        clearInterval(timer)

        DrawCanvas(moving)
        EventListeners()
      }
    }, 100)

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
      {triRegion.map((vertex: Point, index: number) => {
        return renderVertex(vertex, vertexRadius, index + 1)
      })}
      {arrowPositions.map((edge: Point, index: number) => {
        return renderArrow(edge, index)
      })}
    </div>
  )
}

export default Canvas
