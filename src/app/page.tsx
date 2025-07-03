"use client"
import { useState, useEffect } from "react"
import type React from "react"

import {
  Brain,
  Shield,
  Activity,
  Users,
  BarChart3,
  Eye,
  CheckCircle,
  TrendingUp,
  Database,
  Lock,
  Mic,
  MicOff,
  Grid3X3,
  Move,
  Layers,
  Cpu,
  Monitor,
  Server,
  Zap,
  Maximize,
  Minimize,
  Square,
  RotateCcw,
  Volume2,
  Gauge,
} from "lucide-react"
import EnergyFlow from "@/components/EnergyFlow"
import EnhancedNexus from "@/components/EnhancedNexus"
import DraggableComponent from "@/components/DraggableComponent"
import DockZone from "@/components/DockZone"
import { DragDropProvider, useDragDrop } from "@/contexts/DragDropContext"
import DraggableNexus from "@/components/DraggableNexus"

function DashboardContent() {
  const { globalSize, setGlobalSize, snapToGrid, showGrid, toggleSnapToGrid, toggleShowGrid, dockItem } = useDragDrop()

  const [activeLayer, setActiveLayer] = useState("foundation")
  const [isVoiceActive, setIsVoiceActive] = useState(false)
  const [layoutMode, setLayoutMode] = useState<"radial" | "grid" | "freeform">("radial")
  const [voiceFeedback, setVoiceFeedback] = useState("")
  const [nexusExpanded, setNexusExpanded] = useState(false)
  const [nexusPosition, setNexusPosition] = useState({ x: 400, y: 300 }) // Default fallback

  // New state for bridge controls
  const [effectSpeed, setEffectSpeed] = useState(1.0) // 0.1 to 3.0
  const [soundVolume, setSoundVolume] = useState(0.7) // 0.0 to 1.0

  // Calculate center position for Command Nexus
  useEffect(() => {
    const calculateCenterPosition = () => {
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      // Command Nexus dimensions (400px wide, 120px tall when collapsed)
      const nexusWidth = 400
      const nexusHeight = 120

      const centerX = viewportWidth / 2 - nexusWidth / 2
      const centerY = viewportHeight / 2 - nexusHeight / 2

      setNexusPosition({
        x: Math.max(50, centerX), // Ensure it's not too close to edge
        y: Math.max(100, centerY), // Account for header space
      })
    }

    // Calculate on mount
    calculateCenterPosition()

    // Recalculate on window resize
    const handleResize = () => calculateCenterPosition()
    window.addEventListener("resize", handleResize)

    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const layers = [
    {
      id: "foundation",
      name: "Foundation Layer",
      icon: Shield,
      color: "cyan",
      uptime: 99.9,
      description: "Core infrastructure, security, and data persistence",
    },
    {
      id: "reasoning",
      name: "Reasoning Layer",
      icon: Brain,
      color: "blue",
      uptime: 94.2,
      description: "Cognitive engines for analytical and creative reasoning",
    },
    {
      id: "metacognitive",
      name: "Metacognitive Layer",
      icon: Eye,
      color: "purple",
      uptime: 87.5,
      description: "Self-monitoring and continuous learning systems",
    },
    {
      id: "agency",
      name: "Agency Layer",
      icon: Users,
      color: "green",
      uptime: 91.8,
      description: "Autonomous agents executing tasks and workflows",
    },
    {
      id: "business",
      name: "Business Applications",
      icon: BarChart3,
      color: "orange",
      uptime: 96.3,
      description: "Business-specific APIs and application logic",
    },
  ]

  const metrics = [
    {
      id: "active-agents",
      label: "Active Agents",
      value: "247",
      change: "+12%",
      status: "up",
      energy: 0.8,
      icon: Users,
    },
    {
      id: "processing-rate",
      label: "Processing Rate",
      value: "1.2M/s",
      change: "+5.3%",
      status: "up",
      energy: 0.9,
      icon: Cpu,
    },
    {
      id: "security-score",
      label: "Security Score",
      value: "99.8%",
      change: "0%",
      status: "stable",
      energy: 0.6,
      icon: Shield,
    },
    {
      id: "compliance",
      label: "Compliance",
      value: "100%",
      change: "0%",
      status: "stable",
      energy: 0.5,
      icon: CheckCircle,
    },
  ]

  const agents = [
    { name: "Threat Intelligence Agent", status: "active", tasks: 12, energy: 0.9 },
    { name: "Data Processing Agent", status: "active", tasks: 8, energy: 0.7 },
    { name: "Compliance Monitor", status: "active", tasks: 3, energy: 0.4 },
    { name: "Performance Optimizer", status: "idle", tasks: 0, energy: 0.1 },
    { name: "Security Auditor", status: "active", tasks: 5, energy: 0.6 },
  ]

  const activities = [
    { time: "2 min ago", event: "Security scan completed", type: "security" },
    { time: "5 min ago", event: "New agent deployed", type: "deployment" },
    { time: "12 min ago", event: "Performance optimization applied", type: "optimization" },
    { time: "18 min ago", event: "Compliance check passed", type: "compliance" },
    { time: "25 min ago", event: "Data backup completed", type: "backup" },
  ]

  // Initialize all components in docked positions (excluding Command Nexus)
  useEffect(() => {
    const initializeDockedItems = () => {
      // Dock metrics to metrics dashboard
      metrics.forEach((metric, index) => {
        setTimeout(() => {
          dockItem(metric.id, "metrics-dock", index)
        }, 100 * index)
      })

      // Dock main modules
      setTimeout(() => {
        dockItem("architecture", "main-modules-dock", 0)
      }, 500)

      // Dock sidebar tools
      setTimeout(() => {
        dockItem("security", "sidebar-dock", 0)
        dockItem("resources", "sidebar-dock", 1)
      }, 600)

      // Dock activity modules
      setTimeout(() => {
        dockItem("agents", "bottom-dock", 0)
        dockItem("activity", "bottom-dock", 1)
      }, 700)
    }

    // Delay initialization to ensure zones are registered
    setTimeout(initializeDockedItems, 1000)
  }, [dockItem])

  // Apply effect speed to CSS custom properties
  useEffect(() => {
    document.documentElement.style.setProperty("--effect-speed-multiplier", effectSpeed.toString())
    document.documentElement.style.setProperty("--animation-duration-base", `${2 / effectSpeed}s`)
  }, [effectSpeed])

  const handlePromptSubmit = (prompt: string) => {
    console.log("AI Prompt submitted:", prompt)
  }

  const handleVoiceActivation = () => {
    setIsVoiceActive(!isVoiceActive)
    if (!isVoiceActive) {
      setVoiceFeedback('Voice activation enabled - Say "Hey Mesh" to begin')
      setTimeout(() => setVoiceFeedback(""), 3000)
    } else {
      setVoiceFeedback("Voice activation disabled")
      setTimeout(() => setVoiceFeedback(""), 2000)
    }
  }

  const handleNexusToggle = () => {
    setNexusExpanded(!nexusExpanded)
  }

  // Size control functions
  const cycleSizeUp = () => {
    const sizes: ("small" | "medium" | "large" | "x-large")[] = ["small", "medium", "large", "x-large"]
    const currentIndex = sizes.indexOf(globalSize as any)
    const nextIndex = currentIndex < sizes.length - 1 ? currentIndex + 1 : 0
    setGlobalSize(sizes[nextIndex] as any)
  }

  const cycleSizeDown = () => {
    const sizes: ("small" | "medium" | "large" | "x-large")[] = ["small", "medium", "large", "x-large"]
    const currentIndex = sizes.indexOf(globalSize as any)
    const nextIndex = currentIndex > 0 ? currentIndex - 1 : sizes.length - 1
    setGlobalSize(sizes[nextIndex] as any)
  }

  const getSizeIcon = () => {
    switch (globalSize) {
      case "small":
        return <Minimize size={16} />
      case "medium":
        return <Square size={16} />
      case "large":
        return <Maximize size={16} />
      case "x-large":
        return <Monitor size={16} />
      default:
        return <Square size={16} />
    }
  }

  const getSizeLabel = () => {
    switch (globalSize) {
      case "small":
        return "Small"
      case "medium":
        return "Medium"
      case "large":
        return "Large"
      case "x-large":
        return "X-Large"
      default:
        return "Medium"
    }
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden relative"
      style={
        {
          "--effect-speed": effectSpeed,
          "--sound-volume": soundVolume,
        } as React.CSSProperties
      }
    >
      {/* Enhanced Animated Starfield Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${(2 + Math.random() * 3) / effectSpeed}s`,
            }}
          />
        ))}
        {/* Add some brighter stars */}
        {[...Array(20)].map((_, i) => (
          <div
            key={`bright-${i}`}
            className="absolute w-2 h-2 bg-cyan-400 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${(3 + Math.random() * 4) / effectSpeed}s`,
              opacity: 0.6,
            }}
          />
        ))}
      </div>

      {/* Enhanced Energy Flow Network */}
      <div className="absolute inset-0 pointer-events-none">
        <EnergyFlow direction="horizontal" intensity="medium" color="cyan" className="top-1/4 left-0 w-full h-px" />
        <EnergyFlow direction="vertical" intensity="low" color="blue" className="left-1/4 top-0 w-px h-full" />
        <EnergyFlow direction="diagonal" intensity="high" color="purple" className="top-1/2 left-1/2 w-1/2 h-1/2" />
        <EnergyFlow direction="horizontal" intensity="low" color="green" className="bottom-1/4 left-0 w-full h-px" />
        <EnergyFlow direction="vertical" intensity="medium" color="purple" className="right-1/3 top-0 w-px h-full" />
      </div>

      {/* Enhanced Central Command Nexus - Only show when expanded */}
      {nexusExpanded && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="pointer-events-auto">
            <EnhancedNexus
              onPromptSubmit={handlePromptSubmit}
              isVoiceActive={isVoiceActive}
              onVoiceToggle={() => setIsVoiceActive(!isVoiceActive)}
              onDock={() => setNexusExpanded(false)}
            />
          </div>
        </div>
      )}

      <div className="relative z-10 p-6">
        {/* Enhanced Two-Row Spaceship Bridge Header */}
        <header className="mb-6">
          <div className="backdrop-blur-md bg-slate-900/70 border border-slate-700/50 rounded-xl shadow-2xl p-4 relative overflow-hidden">
            <EnergyFlow direction="horizontal" intensity="low" color="cyan" />

            {/* First Row - Title and System Status */}
            <div className="flex items-center justify-between relative z-10 mb-4">
              <div className="flex items-center space-x-6">
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                    COGNITIVE MESH
                  </h1>
                  <p className="text-slate-400 mt-1 text-base">Enterprise AI Transformation Framework</p>
                  <div className="flex items-center space-x-4 mt-1">
                    <div className="flex items-center space-x-2 text-green-400">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-xs">Neural Network Online</span>
                    </div>
                    <div className="flex items-center space-x-2 text-cyan-400">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                      <span className="text-xs">Quantum Processing Active</span>
                    </div>
                  </div>
                </div>

                {/* System Status Indicators */}
                <div className="hidden lg:flex items-center space-x-4">
                  <div className="flex items-center space-x-2 bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2">
                    <Zap size={14} className="text-yellow-400" />
                    <span className="text-xs text-slate-300">Power: 98%</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2">
                    <Activity size={14} className="text-green-400" />
                    <span className="text-xs text-slate-300">Load: 67%</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xl font-bold text-white flex items-center space-x-2">
                  <Server size={20} className="text-cyan-400" />
                  <span>BRIDGE</span>
                </div>
                <div className="text-xs text-slate-400">Command Center</div>
              </div>
            </div>

            {/* Second Row - Bridge Controls */}
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center space-x-4">
                {/* Precision Control Sliders */}
                <div className="flex items-center space-x-4">
                  {/* Effect Speed Control */}
                  <div className="flex items-center bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 space-x-3">
                    <div className="flex items-center space-x-2">
                      <Gauge size={14} className="text-purple-400" />
                      <span className="text-xs text-slate-300 font-medium">FX</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="range"
                        min="0.1"
                        max="3.0"
                        step="0.1"
                        value={effectSpeed}
                        onChange={(e) => setEffectSpeed(Number.parseFloat(e.target.value))}
                        className="w-16 h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer slider-purple"
                        title={`Effect Speed: ${effectSpeed.toFixed(1)}x`}
                      />
                      <span className="text-xs text-purple-400 font-mono w-8 text-center">
                        {effectSpeed.toFixed(1)}x
                      </span>
                    </div>
                  </div>

                  {/* Sound Volume Control */}
                  <div className="flex items-center bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 space-x-3">
                    <div className="flex items-center space-x-2">
                      <Volume2 size={14} className="text-cyan-400" />
                      <span className="text-xs text-slate-300 font-medium">VOL</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={soundVolume}
                        onChange={(e) => setSoundVolume(Number.parseFloat(e.target.value))}
                        className="w-16 h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer slider-cyan"
                        title={`Volume: ${Math.round(soundVolume * 100)}%`}
                      />
                      <span className="text-xs text-cyan-400 font-mono w-8 text-center">
                        {Math.round(soundVolume * 100)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Global Size Control */}
                <div className="flex items-center bg-slate-800/50 border border-slate-700/50 rounded-lg overflow-hidden">
                  <div className="flex items-center space-x-2 px-3 py-2 bg-slate-700/30">
                    {getSizeIcon()}
                    <span className="text-sm text-slate-300 font-medium">{getSizeLabel()}</span>
                  </div>
                  <div className="flex">
                    <button
                      onClick={cycleSizeDown}
                      className="px-2 py-2 hover:bg-slate-600/50 transition-all duration-300 text-slate-400 hover:text-cyan-400 border-r border-slate-600/50"
                      title="Decrease global size"
                    >
                      <RotateCcw size={14} />
                    </button>
                    <button
                      onClick={cycleSizeUp}
                      className="px-2 py-2 hover:bg-slate-600/50 transition-all duration-300 text-slate-400 hover:text-cyan-400"
                      title="Increase global size"
                    >
                      <RotateCcw size={14} className="rotate-180" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Layout Controls */}
                <div className="flex items-center bg-slate-800/50 border border-slate-700/50 rounded-lg overflow-hidden">
                  <button
                    onClick={toggleSnapToGrid}
                    className={`flex items-center space-x-2 px-3 py-2 transition-all duration-300 ${
                      snapToGrid
                        ? "bg-cyan-500/20 text-cyan-400 border-r border-cyan-500/30"
                        : "hover:bg-slate-600/50 text-slate-400 hover:text-cyan-400 border-r border-slate-600/50"
                    }`}
                    title="Toggle Snap to Grid"
                  >
                    <Grid3X3 size={14} />
                    <span className="text-xs font-medium">SNAP</span>
                  </button>

                  <button
                    onClick={toggleShowGrid}
                    className={`flex items-center space-x-2 px-3 py-2 transition-all duration-300 ${
                      showGrid
                        ? "bg-purple-500/20 text-purple-400"
                        : "hover:bg-slate-600/50 text-slate-400 hover:text-purple-400"
                    }`}
                    title="Toggle Grid Overlay"
                  >
                    <Layers size={14} />
                    <span className="text-xs font-medium">GRID</span>
                  </button>
                </div>

                {/* Nexus Mode Toggle */}
                <div className="flex items-center bg-slate-800/50 border border-slate-700/50 rounded-lg overflow-hidden">
                  <button
                    onClick={handleNexusToggle}
                    className={`flex items-center space-x-2 px-3 py-2 transition-all duration-300 ${
                      nexusExpanded
                        ? "bg-cyan-500/20 text-cyan-400"
                        : "hover:bg-slate-600/50 text-slate-400 hover:text-cyan-400"
                    }`}
                    title={nexusExpanded ? "Switch to Basic Nexus" : "Switch to Enhanced Nexus"}
                  >
                    <Brain size={14} />
                    <span className="text-xs font-medium">{nexusExpanded ? "ENHANCED" : "BASIC"}</span>
                  </button>
                </div>

                {/* Voice and Settings */}
                <div className="flex items-center bg-slate-800/50 border border-slate-700/50 rounded-lg overflow-hidden">
                  <button
                    onClick={handleVoiceActivation}
                    className={`flex items-center space-x-2 px-3 py-2 transition-all duration-300 ${
                      isVoiceActive
                        ? "bg-red-500/20 text-red-400 border-r border-red-500/30"
                        : "hover:bg-slate-600/50 text-slate-400 hover:text-cyan-400 border-r border-slate-600/50"
                    }`}
                    title={isVoiceActive ? "Disable voice control" : "Enable voice control"}
                  >
                    {isVoiceActive ? <Mic size={14} /> : <MicOff size={14} />}
                    <span className="text-xs font-medium">VOICE</span>
                  </button>

                  <button
                    onClick={() =>
                      setLayoutMode(layoutMode === "radial" ? "grid" : layoutMode === "grid" ? "freeform" : "radial")
                    }
                    className="flex items-center space-x-2 px-3 py-2 hover:bg-slate-600/50 transition-all duration-300 text-slate-400 hover:text-cyan-400"
                    title={`Switch to ${layoutMode === "radial" ? "grid" : layoutMode === "grid" ? "freeform" : "radial"} layout`}
                  >
                    <Move size={14} />
                    <span className="text-xs font-medium">LAYOUT</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Metrics Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <DockZone
            id="metrics-dock"
            label="Metrics Dashboard"
            maxItems={4}
            allowedSizes={["small", "medium"]}
            className="lg:col-span-4"
            isResizable={true}
            minWidth={800}
            minHeight={180}
            initialWidth={1200}
            initialHeight={220}
          />
        </div>

        {/* Main Content Dock Zones */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          <DockZone
            id="main-modules-dock"
            label="Main Modules"
            maxItems={6}
            allowedSizes={["medium", "large", "x-large"]}
            className="xl:col-span-2"
            isResizable={true}
            minWidth={600}
            minHeight={400}
            initialWidth={800}
            initialHeight={500}
          />

          <DockZone
            id="sidebar-dock"
            label="Sidebar Tools"
            maxItems={4}
            allowedSizes={["small", "medium"]}
            isResizable={true}
            minWidth={300}
            minHeight={400}
            initialWidth={400}
            initialHeight={500}
          />
        </div>

        {/* Bottom Dock Zone */}
        <DockZone
          id="bottom-dock"
          label="Activity & Monitoring"
          maxItems={6}
          allowedSizes={["small", "medium", "large"]}
          isResizable={true}
          minWidth={800}
          minHeight={200}
          initialWidth={1200}
          initialHeight={300}
        />
      </div>

      {/* Draggable Components - Always visible but positioned off-screen initially */}
      <div className="fixed -top-full -left-full">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <DraggableComponent
              key={metric.id}
              id={metric.id}
              title={metric.label}
              type="metric"
              initialSize="small"
              initialPosition={{ x: 50, y: 200 }}
            >
              <div className="text-center">
                <div className="flex items-center justify-center mb-3">
                  <Icon size={24} className="text-cyan-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  {metric.value}
                </div>
                <div
                  className={`text-sm flex items-center justify-center space-x-1 ${
                    metric.status === "up" ? "text-green-400" : "text-cyan-400"
                  }`}
                >
                  {metric.status === "up" && <TrendingUp size={14} />}
                  {metric.status === "stable" && <Activity size={14} />}
                  <span>{metric.change}</span>
                </div>
              </div>
            </DraggableComponent>
          )
        })}

        <DraggableComponent
          id="architecture"
          title="Cognitive Architecture Layers"
          type="module"
          initialSize="large"
          initialPosition={{ x: 100, y: 400 }}
        >
          <div className="space-y-4">
            {layers.map((layer) => {
              const Icon = layer.icon
              const isActive = activeLayer === layer.id
              return (
                <div
                  key={layer.id}
                  onClick={() => setActiveLayer(layer.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all duration-300 relative overflow-hidden ${
                    isActive
                      ? "bg-cyan-500/20 border-cyan-500/50 shadow-cyan-500/20"
                      : "bg-slate-800/30 border-slate-700/50 hover:bg-slate-700/30"
                  }`}
                >
                  {isActive && (
                    <EnergyFlow direction="horizontal" intensity="high" color="cyan" className="absolute inset-0" />
                  )}

                  <div className="flex items-center space-x-4 relative z-10">
                    <div className={`p-3 rounded-lg ${isActive ? "bg-cyan-500/30" : "bg-slate-700/50"}`}>
                      <Icon size={24} className={isActive ? "text-cyan-400" : "text-slate-400"} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">{layer.name}</h4>
                      <p className="text-sm text-slate-400">{layer.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-white">{layer.uptime}%</div>
                      <div className="text-xs text-slate-400">Uptime</div>
                      <div
                        className={`w-2 h-2 rounded-full mt-1 ${
                          layer.uptime > 95
                            ? "bg-green-400 animate-pulse"
                            : layer.uptime > 90
                              ? "bg-yellow-400 animate-pulse"
                              : "bg-red-400 animate-pulse"
                        }`}
                        style={{
                          animationDuration: `${2 / effectSpeed}s`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </DraggableComponent>

        <DraggableComponent
          id="security"
          title="Security Matrix"
          type="module"
          initialSize="medium"
          initialPosition={{ x: 800, y: 400 }}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Lock size={16} className="text-green-400" />
                <span className="text-sm">Zero-Trust Protocol</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle size={16} className="text-green-400" />
                <span className="text-xs text-green-400">ACTIVE</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield size={16} className="text-green-400" />
                <span className="text-sm">NIST AI RMF</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle size={16} className="text-green-400" />
                <span className="text-xs text-green-400">COMPLIANT</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Database size={16} className="text-green-400" />
                <span className="text-sm">Quantum Encryption</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle size={16} className="text-green-400" />
                <span className="text-xs text-green-400">SECURED</span>
              </div>
            </div>
          </div>
        </DraggableComponent>

        <DraggableComponent
          id="resources"
          title="System Resources"
          type="module"
          initialSize="medium"
          initialPosition={{ x: 800, y: 650 }}
        >
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Neural Processing</span>
                <span>67%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-3 relative overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-3 rounded-full transition-all duration-1000"
                  style={{
                    width: "67%",
                    transitionDuration: `${1000 / effectSpeed}ms`,
                  }}
                />
                <div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"
                  style={{
                    animationDuration: `${2 / effectSpeed}s`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Quantum Memory</span>
                <span>43%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-3 relative overflow-hidden">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-1000"
                  style={{
                    width: "43%",
                    transitionDuration: `${1000 / effectSpeed}ms`,
                  }}
                />
                <div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"
                  style={{
                    animationDuration: `${2 / effectSpeed}s`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Data Streams</span>
                <span>82%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-3 relative overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-1000"
                  style={{
                    width: "82%",
                    transitionDuration: `${1000 / effectSpeed}ms`,
                  }}
                />
                <div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"
                  style={{
                    animationDuration: `${2 / effectSpeed}s`,
                  }}
                />
              </div>
            </div>
          </div>
        </DraggableComponent>

        <DraggableComponent
          id="agents"
          title="Active Agents"
          type="module"
          initialSize="medium"
          initialPosition={{ x: 100, y: 800 }}
        >
          <div className="space-y-3">
            {agents.map((agent, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      agent.status === "active" ? "bg-green-400 animate-pulse" : "bg-slate-500"
                    }`}
                    style={{
                      animationDuration: `${2 / effectSpeed}s`,
                    }}
                  />
                  <div>
                    <div className="text-sm font-medium text-white">{agent.name}</div>
                    <div className="text-xs text-slate-400">{agent.tasks} active tasks</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Energy</div>
                  <div className="w-16 bg-slate-700 rounded-full h-2 mt-1">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-1000"
                      style={{
                        width: `${agent.energy * 100}%`,
                        transitionDuration: `${1000 / effectSpeed}ms`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DraggableComponent>

        <DraggableComponent
          id="activity"
          title="Recent Activity"
          type="module"
          initialSize="medium"
          initialPosition={{ x: 500, y: 800 }}
        >
          <div className="space-y-3">
            {activities.map((activity, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-2 hover:bg-slate-800/30 rounded-lg transition-colors"
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    activity.type === "security"
                      ? "bg-red-400"
                      : activity.type === "deployment"
                        ? "bg-green-400"
                        : activity.type === "optimization"
                          ? "bg-blue-400"
                          : activity.type === "compliance"
                            ? "bg-yellow-400"
                            : "bg-purple-400"
                  }`}
                />
                <div className="flex-1">
                  <div className="text-sm text-white">{activity.event}</div>
                  <div className="text-xs text-slate-400">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </DraggableComponent>
      </div>

      {/* Command Nexus - Special Standalone Area (positioned in center of screen) */}
      {!nexusExpanded && (
        <DraggableNexus
          onPromptSubmit={handlePromptSubmit}
          isVoiceActive={isVoiceActive}
          onVoiceToggle={handleVoiceActivation}
          initialPosition={nexusPosition}
          isDocked={false}
        />
      )}

      {/* Voice Activation Feedback */}
      {isVoiceActive && (
        <div className="fixed top-1/2 left-8 transform -translate-y-1/2 z-50">
          <div className="backdrop-blur-md bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-center space-x-3">
            <div
              className="w-3 h-3 bg-red-400 rounded-full animate-pulse"
              style={{
                animationDuration: `${1 / effectSpeed}s`,
              }}
            />
            <span className="text-red-400 font-semibold">VOICE RECOGNITION ACTIVE</span>
          </div>
        </div>
      )}

      {/* Voice Feedback Message */}
      {voiceFeedback && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
          <div className="backdrop-blur-md bg-slate-900/90 border border-cyan-500/50 rounded-lg px-4 py-2">
            <span className="text-cyan-400 text-sm">{voiceFeedback}</span>
          </div>
        </div>
      )}

      {/* Custom CSS for slider styling */}
      <style jsx>{`
        .slider-purple::-webkit-slider-thumb {
          appearance: none;
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: #a855f7;
          cursor: pointer;
          box-shadow: 0 0 8px rgba(168, 85, 247, 0.5);
        }
        
        .slider-cyan::-webkit-slider-thumb {
          appearance: none;
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: #06b6d4;
          cursor: pointer;
          box-shadow: 0 0 8px rgba(6, 182, 212, 0.5);
        }
        
        .slider-purple::-moz-range-thumb {
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: #a855f7;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 8px rgba(168, 85, 247, 0.5);
        }
        
        .slider-cyan::-moz-range-thumb {
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: #06b6d4;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 8px rgba(6, 182, 212, 0.5);
        }
      `}</style>
    </div>
  )
}

export default function CognitiveMeshDashboard() {
  return (
    <DragDropProvider>
      <DashboardContent />
    </DragDropProvider>
  )
}
