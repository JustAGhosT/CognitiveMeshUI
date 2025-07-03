import React from "react"

export interface NexusModule {
  id: string
  label: string
  icon: any // Lucide icon component
  color: string
  header: string
  content: React.ReactNode
  isActive: boolean
}

export interface IconPosition {
  x: number
  y: number
  angle: number
  index: number
}

export interface NexusState {
  // Expansion state
  isExpanded: boolean
  expansionLevel: "collapsed" | "expanded" | "full"
  
  // Active module
  activeModule: string | null
  
  // Orbital system
  orbitMode: boolean
  iconPositions: IconPosition[]
  isOrbiting: boolean
  
  // Pin and dock state
  isPinned: boolean
  isDocked: boolean
  
  // Size state
  sizeMode: "small" | "medium" | "large"
  
  // Drag state
  isDragging: boolean
  dragPreviewVisible: boolean
  dropZoneHighlighted: string | null
}

export interface NexusActions {
  // Expansion
  setExpanded: (expanded: boolean) => void
  setExpansionLevel: (level: "collapsed" | "expanded" | "full") => void
  
  // Module management
  setActiveModule: (moduleId: string | null) => void
  loadModule: (moduleId: string) => void
  
  // Orbital system
  toggleOrbitMode: () => void
  setIconPositions: (positions: IconPosition[]) => void
  updateIconPosition: (index: number, position: IconPosition) => void
  
  // Pin and dock
  togglePin: () => void
  toggleDock: () => void
  
  // Size management
  cycleSizeUp: () => void
  cycleSizeDown: () => void
  setSizeMode: (size: "small" | "medium" | "large") => void
  
  // Drag operations
  startDrag: (target: "nexus" | "icon", id?: string) => void
  endDrag: () => void
  highlightDropZone: (zoneId: string | null) => void
}

export interface AudioConfig {
  enabled: boolean
  volume: number
  sounds: {
    dock: string
    undock: string
    click: string
    expand: string
    collapse: string
  }
}

export interface DragPreviewConfig {
  gridSize: number
  highlightColor: string
  snapThreshold: number
  showGrid: boolean
  animationDuration: number
}

export interface NexusConfig {
  // Animation settings
  transitionDuration: number
  orbitRadius: number
  orbitSpeed: number
  
  // Size settings
  sizes: {
    small: { width: number; height: number }
    medium: { width: number; height: number }
    large: { width: number; height: number }
  }
  
  // Orbital settings
  iconCount: number
  orbitAnimationDuration: number
  
  // Audio settings
  audio: AudioConfig
  
  // Drag settings
  dragPreview: DragPreviewConfig
  
  // Default states
  defaultOrbitMode: boolean
  defaultPinned: boolean
  defaultSizeMode: "small" | "medium" | "large"
}