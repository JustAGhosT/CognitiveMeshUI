import type React from "react"
import type { LucideIcon } from "lucide-react"

export interface NexusModule {
  id: string
  label: string
  icon: LucideIcon
  color: string
  header: string
  description: string
  component?: React.ComponentType<any>
  data?: any
}

export interface NexusState {
  isExpanded: boolean
  expandSize: "small" | "medium" | "large"
  isPinned: boolean
  isDocked: boolean
  isFloating: boolean
  activeModule: NexusModule | null
  position: { x: number; y: number }
  size: { width: number; height: number }
}

export interface IconPosition {
  id: string
  angle: number
  radius: number
  isOrbiting: boolean
  originalPosition: { x: number; y: number }
}

export interface DragState {
  isDragging: boolean
  draggedItem: {
    id: string
    type: "nexus" | "icon"
    data?: any
  } | null
  showPreviewGrid: boolean
  activeDropZone: string | null
}

export interface AudioState {
  isEnabled: boolean
  volume: number
  sounds: {
    dock: HTMLAudioElement | null
    undock: HTMLAudioElement | null
    click: HTMLAudioElement | null
    snap: HTMLAudioElement | null
  }
}

export interface NexusContextType {
  nexusState: NexusState
  dragState: DragState
  audioState: AudioState
  iconPositions: IconPosition[]
  availableModules: NexusModule[]
  
  // Actions
  setExpanded: (expanded: boolean) => void
  setExpandSize: (size: "small" | "medium" | "large") => void
  setPinned: (pinned: boolean) => void
  setActiveModule: (module: NexusModule | null) => void
  setPosition: (position: { x: number; y: number }) => void
  startDrag: (item: { id: string; type: "nexus" | "icon"; data?: any }) => void
  endDrag: () => void
  playSound: (soundType: keyof AudioState["sounds"]) => void
  updateIconPositions: (positions: IconPosition[]) => void
}