"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import styles from "./AdvancedDraggableModule.module.css"

interface DropZone {
  id: string
  bounds: DOMRect
  element: HTMLElement
}

interface AdvancedDraggableModuleProps {
  id: string
  title: string
  content: React.ReactNode
  initialPosition?: { x: number; y: number }
  onDrag?: (id: string, position: { x: number; y: number }) => void
  onDock?: (id: string, dropZoneId?: string) => void
  isDocked?: boolean
  dropZones?: DropZone[]
  className?: string
}

export const AdvancedDraggableModule: React.FC<AdvancedDraggableModuleProps> = ({
  id,
  title,
  content,
  initialPosition = { x: 0, y: 0 },
  onDrag,
  onDock,
  isDocked = false,
  dropZones = [],
  className = "",
}) => {
  const [position, setPosition] = useState(initialPosition)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [activeDropZone, setActiveDropZone] = useState<string | null>(null)
  const [showDockPreview, setShowDockPreview] = useState(false)
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

      // Check for drop zone intersections
      const moduleRect = moduleRef.current?.getBoundingClientRect()
      if (moduleRect) {
        let foundDropZone = null
        for (const dropZone of dropZones) {
          const dzRect = dropZone.bounds
          if (
            moduleRect.left < dzRect.right &&
            moduleRect.right > dzRect.left &&
            moduleRect.top < dzRect.bottom &&
            moduleRect.bottom > dzRect.top
          ) {
            foundDropZone = dropZone.id
            break
          }
        }
        setActiveDropZone(foundDropZone)
        setShowDockPreview(!!foundDropZone)
      }
    }

    const handleMouseUp = () => {
      if (activeDropZone) {
        onDock?.(id, activeDropZone)
      }
      setIsDragging(false)
      setActiveDropZone(null)
      setShowDockPreview(false)
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, dragOffset, onDrag, onDock, id, isDocked, dropZones, activeDropZone])

  const handleDockToggle = () => {
    onDock?.(id)
  }

  return (
    <div
      ref={moduleRef}
      className={`${styles.advancedDraggableModule} ${isDocked ? styles.docked : ""} ${isDragging ? styles.dragging : ""} ${showDockPreview ? styles.dockPreview : ""} ${className}`}
      style={{
        transform: isDocked ? "none" : `translate(${position.x}px, ${position.y}px)`,
        position: isDocked ? "relative" : "absolute",
      }}
      role="dialog"
      aria-label={`${title} module`}
      tabIndex={0}
    >
      <div className={styles.glassEffect}></div>
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
      {showDockPreview && <div className={styles.dockIndicator}>Drop to dock</div>}
    </div>
  )
}

export default AdvancedDraggableModule
