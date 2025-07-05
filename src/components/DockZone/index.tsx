"use client"
import DraggableComponent from "@/components/DraggableComponent"
import { useDragDrop } from "@/contexts/DragDropContext"
import { GripVertical, Maximize2, Minimize2, Package } from "lucide-react"
import type React from "react"
import { useCallback, useEffect, useRef, useState } from "react"

interface DockZoneProps {
  id: string
  label: string
  maxItems?: number
  allowedSizes?: ("small" | "medium" | "large")[]
  className?: string
  children?: React.ReactNode
  isResizable?: boolean
  minWidth?: number
  minHeight?: number
  initialWidth?: number
  initialHeight?: number
}

export const DockZone: React.FC<DockZoneProps> = ({
  id,
  label,
  maxItems,
  allowedSizes,
  className = "",
  children,
  isResizable = true,
  minWidth = 200,
  minHeight = 150,
  initialWidth = 400,
  initialHeight = 300,
}) => {
  const {
    registerDockZone,
    unregisterDockZone,
    updateDockZoneBounds,
    resizeDockZone,
    activeDockZone,
    isDragging,
    dockZones,
    getDockedItemsForZone,
  } = useDragDrop()

  const zoneRef = useRef<HTMLDivElement>(null)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeHandle, setResizeHandle] = useState<string | null>(null)
  const [dimensions, setDimensions] = useState({ width: initialWidth, height: initialHeight })
  const boundsUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0 })

  const isActive = activeDockZone === id
  const dockedItems = getDockedItemsForZone(id)

  // Register zone once on mount
  useEffect(() => {
    registerDockZone({
      id,
      label,
      maxItems,
      allowedSizes,
      items: [],
      isResizable,
      minWidth,
      minHeight,
    })

    return () => unregisterDockZone(id)
  }, [id])

  // Debounced bounds update function
  const debouncedUpdateBounds = useCallback(() => {
    if (boundsUpdateTimeoutRef.current) {
      clearTimeout(boundsUpdateTimeoutRef.current)
    }

    boundsUpdateTimeoutRef.current = setTimeout(() => {
      if (zoneRef.current) {
        const rect = zoneRef.current.getBoundingClientRect()
        updateDockZoneBounds(id, {
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height,
        })
      }
    }, 100)
  }, [id, updateDockZoneBounds])

  // Handle resize start
  const handleResizeStart = useCallback(
    (e: React.MouseEvent, handle: string) => {
      if (!isResizable) return

      e.preventDefault()
      e.stopPropagation()

      setIsResizing(true)
      setResizeHandle(handle)

      const rect = zoneRef.current?.getBoundingClientRect()
      if (rect) {
        resizeStartRef.current = {
          x: e.clientX,
          y: e.clientY,
          width: rect.width,
          height: rect.height,
        }
      }
    },
    [isResizable],
  )

  // Handle resize move
  useEffect(() => {
    if (!isResizing || !resizeHandle) return

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizeStartRef.current.x
      const deltaY = e.clientY - resizeStartRef.current.y

      let newWidth = resizeStartRef.current.width
      let newHeight = resizeStartRef.current.height

      if (resizeHandle.includes("right")) {
        newWidth = Math.max(minWidth, resizeStartRef.current.width + deltaX)
      }
      if (resizeHandle.includes("left")) {
        newWidth = Math.max(minWidth, resizeStartRef.current.width - deltaX)
      }
      if (resizeHandle.includes("bottom")) {
        newHeight = Math.max(minHeight, resizeStartRef.current.height + deltaY)
      }
      if (resizeHandle.includes("top")) {
        newHeight = Math.max(minHeight, resizeStartRef.current.height - deltaY)
      }

      setDimensions({ width: newWidth, height: newHeight })

      if (zoneRef.current) {
        const rect = zoneRef.current.getBoundingClientRect()
        resizeDockZone(id, {
          x: rect.left,
          y: rect.top,
          width: newWidth,
          height: newHeight,
        })
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      setResizeHandle(null)
      debouncedUpdateBounds()
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isResizing, resizeHandle, minWidth, minHeight, id, resizeDockZone, debouncedUpdateBounds])

  // Update bounds with ResizeObserver and debouncing
  useEffect(() => {
    if (!zoneRef.current) return

    debouncedUpdateBounds()

    const resizeObserver = new ResizeObserver(debouncedUpdateBounds)
    resizeObserver.observe(zoneRef.current)

    const handleScroll = debouncedUpdateBounds
    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener("scroll", handleScroll)
      if (boundsUpdateTimeoutRef.current) {
        clearTimeout(boundsUpdateTimeoutRef.current)
      }
    }
  }, [debouncedUpdateBounds])

  const zone = dockZones[id]

  // Helper function to safely format item titles
  const formatItemTitle = (itemId: string) => {
    if (!itemId || typeof itemId !== "string") {
      return "Unknown Item"
    }
    return itemId.replace(/[-_]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  return (
    <div
      ref={zoneRef}
      className={`
        relative transition-all duration-300 rounded-xl border-2 border-dashed
        ${isActive && isDragging ? "border-green-500/70 bg-green-500/10" : "border-slate-600/30"}
        ${isDragging ? "border-opacity-100" : "border-opacity-50"}
        ${isResizing ? "select-none" : ""}
        ${className}
      `}
      style={{
        width: isResizable ? dimensions.width : undefined,
        height: isResizable ? dimensions.height : undefined,
        minWidth: minWidth,
        minHeight: minHeight,
      }}
    >
      {/* Zone Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-700/30 bg-slate-800/20 rounded-t-xl">
        <div className="flex items-center space-x-2">
          <GripVertical size={14} className="text-slate-500" />
          <Package size={14} className="text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-300">{label}</h3>
          {maxItems && (
            <span className="text-xs text-slate-500 bg-slate-700/50 px-2 py-1 rounded">
              {zone?.items.length || 0}/{maxItems}
            </span>
          )}
        </div>

        {isResizable && (
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setDimensions({ width: minWidth, height: minHeight })}
              className="p-1 rounded hover:bg-slate-700/50 transition-colors"
              title="Minimize"
            >
              <Minimize2 size={12} className="text-slate-400 hover:text-cyan-400" />
            </button>
            <button
              onClick={() => setDimensions({ width: 600, height: 400 })}
              className="p-1 rounded hover:bg-slate-700/50 transition-colors"
              title="Maximize"
            >
              <Maximize2 size={12} className="text-slate-400 hover:text-cyan-400" />
            </button>
          </div>
        )}
      </div>

      {/* Zone Content */}
      <div className="p-4 overflow-auto" style={{ height: `calc(100% - 60px)` }}>
        {/* Render docked items with proper error handling */}
        <div className="grid gap-4 auto-fit-grid">
          {dockedItems
            .filter((item) => item && item.id) // Filter out invalid items
            .map((item) => {
              // Special handling for command nexus
              if (item.id === "command-nexus") {
                return (
                  <div key={item.id} className="w-full">
                    {/* Render the nexus content directly when docked */}
                    <div className="backdrop-blur-md bg-slate-900/90 border-2 border-slate-500/30 rounded-xl shadow-xl p-4">
                      <div className="text-center mb-4">
                        <div className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                          COMMAND NEXUS
                        </div>
                        <div className="text-sm text-slate-400 mb-2">Central Command Interface</div>
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                          <span className="text-xs text-cyan-400">Neural Link Active</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <button className="px-4 py-2 bg-slate-700/50 text-slate-300 hover:text-cyan-400 hover:bg-slate-600/50 rounded-lg transition-all duration-200 text-sm">
                          Click to Expand
                        </button>
                      </div>
                    </div>
                  </div>
                )
              }
              
              return (
                <DraggableComponent
                  key={item.id}
                  id={item.id}
                  title={formatItemTitle(item.id)}
                  type={item.type || "unknown"}
                  isDocked={true}
                >
                  <div>Docked content for {formatItemTitle(item.id)}</div>
                </DraggableComponent>
              )
            })}
        </div>

        {children}

        {/* Empty State */}
        {dockedItems.length === 0 && !children && (
          <div className="flex items-center justify-center h-32 text-slate-500 text-sm">
            <div className="text-center">
              <div className="mb-2 text-2xl">📦</div>
              <div>Drop components here</div>
              <div className="text-xs mt-1 text-slate-600">
                {allowedSizes ? `Accepts: ${allowedSizes.join(", ")}` : "Accepts all sizes"}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Resize Handles */}
      {isResizable && (
        <>
          {/* Corner handles */}
          <div
            className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize opacity-0 hover:opacity-100 transition-opacity"
            onMouseDown={(e) => handleResizeStart(e, "top-right")}
          >
            <div className="w-full h-full bg-cyan-400/50 rounded-bl-lg" />
          </div>
          <div
            className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize opacity-0 hover:opacity-100 transition-opacity"
            onMouseDown={(e) => handleResizeStart(e, "bottom-right")}
          >
            <div className="w-full h-full bg-cyan-400/50 rounded-tl-lg" />
          </div>
          <div
            className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize opacity-0 hover:opacity-100 transition-opacity"
            onMouseDown={(e) => handleResizeStart(e, "bottom-left")}
          >
            <div className="w-full h-full bg-cyan-400/50 rounded-tr-lg" />
          </div>
          <div
            className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize opacity-0 hover:opacity-100 transition-opacity"
            onMouseDown={(e) => handleResizeStart(e, "top-left")}
          >
            <div className="w-full h-full bg-cyan-400/50 rounded-br-lg" />
          </div>

          {/* Edge handles */}
          <div
            className="absolute top-0 left-3 right-3 h-1 cursor-n-resize opacity-0 hover:opacity-100 transition-opacity"
            onMouseDown={(e) => handleResizeStart(e, "top")}
          >
            <div className="w-full h-full bg-cyan-400/30 rounded-b" />
          </div>
          <div
            className="absolute bottom-0 left-3 right-3 h-1 cursor-s-resize opacity-0 hover:opacity-100 transition-opacity"
            onMouseDown={(e) => handleResizeStart(e, "bottom")}
          >
            <div className="w-full h-full bg-cyan-400/30 rounded-t" />
          </div>
          <div
            className="absolute left-0 top-3 bottom-3 w-1 cursor-w-resize opacity-0 hover:opacity-100 transition-opacity"
            onMouseDown={(e) => handleResizeStart(e, "left")}
          >
            <div className="w-full h-full bg-cyan-400/30 rounded-r" />
          </div>
          <div
            className="absolute right-0 top-3 bottom-3 w-1 cursor-e-resize opacity-0 hover:opacity-100 transition-opacity"
            onMouseDown={(e) => handleResizeStart(e, "right")}
          >
            <div className="w-full h-full bg-cyan-400/30 rounded-l" />
          </div>
        </>
      )}

      {/* Active Drop Indicator */}
      {isActive && isDragging && (
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-cyan-500/20 rounded-xl pointer-events-none animate-pulse border-2 border-green-400/50" />
      )}

      {/* Resize indicator */}
      {isResizing && (
        <div className="absolute top-2 left-2 bg-cyan-500/90 text-white px-2 py-1 rounded text-xs font-mono">
          {dimensions.width} × {dimensions.height}
        </div>
      )}
    </div>
  )
}

export default DockZone
