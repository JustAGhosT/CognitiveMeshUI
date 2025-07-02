"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import styles from "./DraggableModule.module.css"

interface DraggableModuleProps {
  id: string
  title: string
  content: React.ReactNode
  initialPosition?: { x: number; y: number }
  onDrag?: (id: string, position: { x: number; y: number }) => void
  onDock?: (id: string) => void
  isDocked?: boolean
  className?: string
}

export const DraggableModule: React.FC<DraggableModuleProps> = ({
  id,
  title,
  content,
  initialPosition = { x: 0, y: 0 },
  onDrag,
  onDock,
  isDocked = false,
  className = "",
}) => {
  const [position, setPosition] = useState(initialPosition)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const moduleRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isDocked) return

    const rect = moduleRef.current?.getBoundingClientRect()
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
      setIsDragging(true)
    }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || isDocked) return

      const newPosition = {
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      }

      setPosition(newPosition)
      onDrag?.(id, newPosition)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, dragOffset, onDrag, id, isDocked])

  const handleDockToggle = () => {
    onDock?.(id)
  }

  return (
    <div
      ref={moduleRef}
      className={`${styles.draggableModule} ${isDocked ? styles.docked : ""} ${isDragging ? styles.dragging : ""} ${className}`}
      style={{
        transform: isDocked ? "none" : `translate(${position.x}px, ${position.y}px)`,
        position: isDocked ? "relative" : "absolute",
      }}
    >
      <div className={styles.header} onMouseDown={handleMouseDown}>
        <h3 className={styles.title}>{title}</h3>
        <button
          className={styles.dockButton}
          onClick={handleDockToggle}
          aria-label={isDocked ? "Undock module" : "Dock module"}
        >
          {isDocked ? "⚡" : "🔒"}
        </button>
      </div>
      <div className={styles.content}>{content}</div>
    </div>
  )
}

export default DraggableModule
