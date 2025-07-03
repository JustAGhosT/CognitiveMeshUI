"use client"
import { useEffect, useState, useCallback } from "react"
import type { IconPosition, NexusModule } from "@/types/nexus"

interface OrbitalIconsProps {
  modules: NexusModule[]
  isExpanded: boolean
  centerPosition: { x: number; y: number }
  radius: number
  onModuleClick: (module: NexusModule) => void
  isDragging: boolean
  className?: string
}

export default function OrbitalIcons({
  modules,
  isExpanded,
  centerPosition,
  radius,
  onModuleClick,
  isDragging,
  className = "",
}: OrbitalIconsProps) {
  const [iconPositions, setIconPositions] = useState<IconPosition[]>([])
  const [animating, setAnimating] = useState(false)

  // Calculate orbital positions
  const calculateOrbitPositions = useCallback(() => {
    const positions: IconPosition[] = modules.map((module, index) => {
      const angle = (index * (360 / modules.length)) * (Math.PI / 180)
      const orbitRadius = isExpanded ? radius : 0
      
      return {
        id: module.id,
        angle,
        radius: orbitRadius,
        isOrbiting: isExpanded,
        originalPosition: {
          x: centerPosition.x + Math.cos(angle) * orbitRadius,
          y: centerPosition.y + Math.sin(angle) * orbitRadius,
        },
      }
    })
    
    return positions
  }, [modules, isExpanded, centerPosition, radius])

  // Update positions when state changes
  useEffect(() => {
    setAnimating(true)
    const newPositions = calculateOrbitPositions()
    setIconPositions(newPositions)
    
    // Reset animation flag after animation completes
    const timer = setTimeout(() => setAnimating(false), 500)
    return () => clearTimeout(timer)
  }, [calculateOrbitPositions])

  // Static positioning for collapsed state
  const getStaticPosition = (index: number) => {
    const isLeft = index < 2
    const yOffset = (index % 2) * 80 - 40
    
    return {
      x: isLeft ? centerPosition.x - 120 : centerPosition.x + 120,
      y: centerPosition.y + yOffset,
    }
  }

  // Animation styles
  const getIconStyle = (position: IconPosition, index: number) => {
    const staticPos = getStaticPosition(index)
    const targetPos = isExpanded ? position.originalPosition : staticPos
    
    return {
      left: targetPos.x - 28, // Adjust for icon width (56px / 2)
      top: targetPos.y - 28,  // Adjust for icon height (56px / 2)
      transform: "translate(0, 0)", // Remove transform, use left/top positioning
      transition: animating ? "all 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)" : "none",
      zIndex: isExpanded ? 60 : 45,
    }
  }

  return (
    <div className={`fixed inset-0 pointer-events-none ${className}`}>
      {modules.map((module, index) => {
        const position = iconPositions[index]
        const Icon = module.icon
        
        if (!position) return null
        
        return (
          <button
            key={module.id}
            className={`
              absolute w-14 h-14 pointer-events-auto
              backdrop-blur-md bg-slate-900/80 
              border border-${module.color}-500/50 rounded-xl
              flex items-center justify-center cursor-pointer
              transition-all duration-300 hover:scale-110
              hover:shadow-${module.color}-500/30 hover:border-${module.color}-400
              ${isDragging ? "cursor-move" : ""}
              ${isExpanded ? "hover:shadow-lg" : ""}
            `}
            style={getIconStyle(position, index)}
            onClick={() => {
              console.log("Orbital icon clicked:", module.label)
              onModuleClick(module)
            }}
            onMouseEnter={() => {
              // Optional: Add hover sound effect
            }}
            title={module.label}
          >
            <Icon size={22} className={`text-${module.color}-400`} />
            
            {/* Orbital trail effect when expanded */}
            {isExpanded && (
              <div
                className={`
                  absolute -inset-1 rounded-xl opacity-20
                  bg-gradient-to-r from-${module.color}-500/20 to-transparent
                  animate-pulse
                `}
              />
            )}
          </button>
        )
      })}
      
      {/* Orbital path visualization (optional) */}
      {isExpanded && (
        <div
          className="absolute rounded-full border border-cyan-500/10 pointer-events-none"
          style={{
            left: centerPosition.x - radius,
            top: centerPosition.y - radius,
            width: radius * 2,
            height: radius * 2,
            transition: "all 0.5s ease-out",
          }}
        />
      )}
    </div>
  )
}

// Utility function for calculating orbital mathematics
export const calculateOrbitPosition = (
  centerX: number,
  centerY: number,
  radius: number,
  angle: number
) => ({
  x: centerX + Math.cos(angle) * radius,
  y: centerY + Math.sin(angle) * radius,
})

// Animation timing constants
export const ORBIT_ANIMATION_DURATION = 500
export const ORBIT_EASING = "cubic-bezier(0.4, 0.0, 0.2, 1)"