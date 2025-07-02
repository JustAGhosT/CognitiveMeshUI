"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import styles from "./EnergyFlow.module.css"

interface EnergyFlowProps {
  isActive?: boolean
  intensity?: number
  color?: string
  direction?: "horizontal" | "vertical" | "diagonal"
  className?: string
}

export const EnergyFlow: React.FC<EnergyFlowProps> = ({
  isActive = true,
  intensity = 1,
  color = "#00ffff",
  direction = "horizontal",
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationId: number
    let time = 0

    const animate = () => {
      if (!isActive) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Create energy flow effect
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0)
      gradient.addColorStop(0, "transparent")
      gradient.addColorStop(0.5, color)
      gradient.addColorStop(1, "transparent")

      ctx.strokeStyle = gradient
      ctx.lineWidth = 2 * intensity
      ctx.shadowColor = color
      ctx.shadowBlur = 10 * intensity

      // Draw flowing energy lines
      for (let i = 0; i < 3; i++) {
        ctx.beginPath()
        const offset = (time + i * 100) % 300
        const y = canvas.height / 2 + Math.sin(time * 0.01 + i) * 5

        ctx.moveTo(-50 + offset, y)
        ctx.lineTo(50 + offset, y)
        ctx.stroke()
      }

      time += 2
      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [isActive, intensity, color])

  return (
    <div className={`${styles.energyFlow} ${className}`}>
      <canvas ref={canvasRef} width={200} height={50} className={styles.canvas} />
    </div>
  )
}

export default EnergyFlow
