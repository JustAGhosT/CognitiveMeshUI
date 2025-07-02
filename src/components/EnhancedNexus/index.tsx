"use client"

import type React from "react"
import { useState, useRef } from "react"
import styles from "./EnhancedNexus.module.css"
import { DraggableModule } from "../DraggableModule"
import { CommandNexus } from "../CommandNexus"

interface Module {
  id: string
  title: string
  content: React.ReactNode
  position: { x: number; y: number }
  isDocked: boolean
}

interface EnhancedNexusProps {
  modules?: Module[]
  onModuleUpdate?: (modules: Module[]) => void
  className?: string
}

export const EnhancedNexus: React.FC<EnhancedNexusProps> = ({
  modules: initialModules = [],
  onModuleUpdate,
  className = "",
}) => {
  const [modules, setModules] = useState<Module[]>(initialModules)
  const [isContainerExpanded, setIsContainerExpanded] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleModuleDrag = (id: string, position: { x: number; y: number }) => {
    setModules((prev) => prev.map((module) => (module.id === id ? { ...module, position } : module)))
  }

  const handleModuleDock = (id: string) => {
    setModules((prev) => {
      const updated = prev.map((module) => (module.id === id ? { ...module, isDocked: !module.isDocked } : module))
      onModuleUpdate?.(updated)
      return updated
    })
  }

  const handleCommand = (command: string) => {
    console.log("Command executed:", command)
    // Handle AI command processing here
  }

  const dockedModules = modules.filter((module) => module.isDocked)
  const floatingModules = modules.filter((module) => !module.isDocked)

  return (
    <div className={`${styles.enhancedNexus} ${className}`}>
      {/* Orbital Icons */}
      <div className={styles.orbitalContainer}>
        <div className={styles.orbitalIcon} style={{ "--delay": "0s" } as React.CSSProperties}>
          🧠
        </div>
        <div className={styles.orbitalIcon} style={{ "--delay": "2s" } as React.CSSProperties}>
          ⚡
        </div>
        <div className={styles.orbitalIcon} style={{ "--delay": "4s" } as React.CSSProperties}>
          🔮
        </div>
        <div className={styles.orbitalIcon} style={{ "--delay": "6s" } as React.CSSProperties}>
          🌐
        </div>
      </div>

      {/* Central Command Nexus */}
      <div className={styles.centralNexus}>
        <CommandNexus onCommand={handleCommand} />
      </div>

      {/* Dockable Container */}
      <div
        ref={containerRef}
        className={`${styles.dockableContainer} ${isContainerExpanded ? styles.expanded : styles.collapsed}`}
      >
        <div className={styles.containerHeader}>
          <h2 className={styles.containerTitle}>Docked Modules</h2>
          <button
            className={styles.toggleButton}
            onClick={() => setIsContainerExpanded(!isContainerExpanded)}
            aria-label={isContainerExpanded ? "Collapse container" : "Expand container"}
          >
            {isContainerExpanded ? "▼" : "▲"}
          </button>
        </div>

        {isContainerExpanded && (
          <div className={styles.dockedModules}>
            {dockedModules.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No modules docked</p>
                <p className={styles.hint}>Drag modules here to dock them</p>
              </div>
            ) : (
              dockedModules.map((module) => (
                <DraggableModule
                  key={module.id}
                  id={module.id}
                  title={module.title}
                  content={module.content}
                  isDocked={true}
                  onDock={handleModuleDock}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Floating Modules */}
      {floatingModules.map((module) => (
        <DraggableModule
          key={module.id}
          id={module.id}
          title={module.title}
          content={module.content}
          initialPosition={module.position}
          isDocked={false}
          onDrag={handleModuleDrag}
          onDock={handleModuleDock}
        />
      ))}

      {/* Loading Indicator */}
      <div className={styles.loadingIndicator}>
        <div className={styles.loadingRing}></div>
        <span className={styles.loadingText}>Neural Network Active</span>
      </div>
    </div>
  )
}

export default EnhancedNexus
