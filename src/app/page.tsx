"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { EnhancedNexus } from "@/components/EnhancedNexus"
import { EnergyFlow } from "@/components/EnergyFlow"
import styles from "./page.module.css"

interface Module {
  id: string
  title: string
  content: React.ReactNode
  position: { x: number; y: number }
  isDocked: boolean
}

export default function CognitiveMeshDashboard() {
  const [modules, setModules] = useState<Module[]>([])
  const [isVoiceActive, setIsVoiceActive] = useState(false)
  const [starfieldActive, setStarfieldActive] = useState(true)

  useEffect(() => {
    // Initialize modules in docked state as specified
    const initialModules: Module[] = [
      {
        id: "neural-processor",
        title: "Neural Processor",
        content: (
          <div>
            <p>Advanced neural network processing unit</p>
            <div className={styles.moduleStats}>
              <div>
                Status: <span className={styles.online}>Online</span>
              </div>
              <div>
                Load: <span className={styles.metric}>73%</span>
              </div>
              <div>
                Efficiency: <span className={styles.metric}>94.2%</span>
              </div>
            </div>
            <EnergyFlow isActive={true} intensity={0.8} />
          </div>
        ),
        position: { x: 100, y: 100 },
        isDocked: true,
      },
      {
        id: "quantum-analyzer",
        title: "Quantum Analyzer",
        content: (
          <div>
            <p>Quantum computing analysis module</p>
            <div className={styles.moduleStats}>
              <div>
                Qubits: <span className={styles.metric}>512</span>
              </div>
              <div>
                Coherence: <span className={styles.metric}>99.7%</span>
              </div>
              <div>
                Entanglement: <span className={styles.online}>Stable</span>
              </div>
            </div>
            <EnergyFlow isActive={true} intensity={1.2} color="#ff00ff" />
          </div>
        ),
        position: { x: 300, y: 150 },
        isDocked: true,
      },
      {
        id: "data-synthesizer",
        title: "Data Synthesizer",
        content: (
          <div>
            <p>Real-time data synthesis and pattern recognition</p>
            <div className={styles.moduleStats}>
              <div>
                Patterns: <span className={styles.metric}>1,247</span>
              </div>
              <div>
                Accuracy: <span className={styles.metric}>98.9%</span>
              </div>
              <div>
                Speed: <span className={styles.online}>Optimal</span>
              </div>
            </div>
            <EnergyFlow isActive={true} intensity={0.9} color="#00ff00" />
          </div>
        ),
        position: { x: 500, y: 200 },
        isDocked: true,
      },
      {
        id: "cognitive-mesh",
        title: "Cognitive Mesh Core",
        content: (
          <div>
            <p>Central cognitive mesh coordination system</p>
            <div className={styles.moduleStats}>
              <div>
                Nodes: <span className={styles.metric}>2,048</span>
              </div>
              <div>
                Sync: <span className={styles.online}>Perfect</span>
              </div>
              <div>
                Latency: <span className={styles.metric}>0.3ms</span>
              </div>
            </div>
            <EnergyFlow isActive={true} intensity={1.5} color="#ffff00" />
          </div>
        ),
        position: { x: 200, y: 300 },
        isDocked: true,
      },
    ]

    setModules(initialModules)
  }, [])

  const handleModuleUpdate = (updatedModules: Module[]) => {
    setModules(updatedModules)
  }

  const handleVoiceActivation = () => {
    setIsVoiceActive(!isVoiceActive)
  }

  return (
    <div className={styles.dashboard}>
      {/* Starfield Background */}
      {starfieldActive && (
        <div className={styles.starfield}>
          {Array.from({ length: 200 }).map((_, i) => (
            <div
              key={i}
              className={styles.star}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Main Dashboard Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>
            <span className={styles.titleMain}>Cognitive Mesh</span>
            <span className={styles.titleSub}>Enterprise AI Transformation Framework</span>
          </h1>
          <div className={styles.headerControls}>
            <button
              className={`${styles.controlButton} ${isVoiceActive ? styles.active : ""}`}
              onClick={handleVoiceActivation}
              aria-label="Toggle voice activation"
            >
              🎤 Voice
            </button>
            <button
              className={styles.controlButton}
              onClick={() => setStarfieldActive(!starfieldActive)}
              aria-label="Toggle starfield"
            >
              ✨ Starfield
            </button>
          </div>
        </div>
      </header>

      {/* Enhanced Nexus with all modules */}
      <EnhancedNexus modules={modules} onModuleUpdate={handleModuleUpdate} className={styles.nexus} />

      {/* Voice Activation Feedback */}
      {isVoiceActive && (
        <div className={styles.voiceFeedback}>
          <div className={styles.voiceIndicator}>
            <div className={styles.voicePulse}></div>
            <span>Voice Recognition Active</span>
          </div>
        </div>
      )}

      {/* System Status Bar */}
      <div className={styles.statusBar}>
        <div className={styles.statusItem}>
          <span className={styles.statusDot}></span>
          System Status: <span className={styles.online}>Operational</span>
        </div>
        <div className={styles.statusItem}>
          <span className={styles.statusDot}></span>
          AI Modules: <span className={styles.metric}>{modules.length}</span>
        </div>
        <div className={styles.statusItem}>
          <span className={styles.statusDot}></span>
          Docked: <span className={styles.metric}>{modules.filter((m) => m.isDocked).length}</span>
        </div>
        <div className={styles.statusItem}>
          <span className={styles.statusDot}></span>
          Performance: <span className={styles.online}>Optimal</span>
        </div>
      </div>
    </div>
  )
}
