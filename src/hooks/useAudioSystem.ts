"use client"
import { useEffect, useRef, useState, useCallback } from "react"
import type { AudioState } from "@/types/nexus"

export function useAudioSystem(initialVolume: number = 0.7) {
  const [audioState, setAudioState] = useState<AudioState>({
    isEnabled: true,
    volume: initialVolume,
    sounds: {
      dock: null,
      undock: null,
      click: null,
      snap: null,
    },
  })

  const audioContextRef = useRef<AudioContext | null>(null)
  const soundBuffersRef = useRef<Map<string, AudioBuffer>>(new Map())

  // Initialize Web Audio API
  useEffect(() => {
    if (typeof window === "undefined") return

    const initAudio = async () => {
      try {
        // Create audio context
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()

        // Create sound buffers using Web Audio API
        const createSound = (frequency: number, duration: number = 0.1) => {
          const sampleRate = audioContextRef.current!.sampleRate
          const numSamples = sampleRate * duration
          const buffer = audioContextRef.current!.createBuffer(1, numSamples, sampleRate)
          const channelData = buffer.getChannelData(0)

          for (let i = 0; i < numSamples; i++) {
            // Create a pleasant click-snap sound using multiple frequencies
            const t = i / sampleRate
            const envelope = Math.exp(-t * 10) // Decay envelope
            const wave = Math.sin(2 * Math.PI * frequency * t) * envelope
            channelData[i] = wave * 0.3 // Reduce volume
          }

          return buffer
        }

        // Create different sounds
        soundBuffersRef.current.set("dock", createSound(800, 0.15))
        soundBuffersRef.current.set("undock", createSound(600, 0.15))
        soundBuffersRef.current.set("click", createSound(1000, 0.08))
        soundBuffersRef.current.set("snap", createSound(1200, 0.12))

        console.log("Audio system initialized successfully")
      } catch (error) {
        console.warn("Audio initialization failed:", error)
        setAudioState(prev => ({ ...prev, isEnabled: false }))
      }
    }

    initAudio()

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  const playSound = useCallback((soundType: keyof AudioState["sounds"]) => {
    if (!audioState.isEnabled || !audioContextRef.current || audioState.volume === 0) return

    try {
      const buffer = soundBuffersRef.current.get(soundType)
      if (!buffer) return

      const source = audioContextRef.current.createBufferSource()
      const gainNode = audioContextRef.current.createGain()

      source.buffer = buffer
      gainNode.gain.value = audioState.volume

      source.connect(gainNode)
      gainNode.connect(audioContextRef.current.destination)

      source.start()
    } catch (error) {
      console.warn(`Failed to play sound ${soundType}:`, error)
    }
  }, [audioState.isEnabled, audioState.volume])

  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume))
    setAudioState(prev => ({ ...prev, volume: clampedVolume }))
  }, [])

  const toggleAudio = useCallback(() => {
    setAudioState(prev => ({ ...prev, isEnabled: !prev.isEnabled }))
  }, [])

  const resumeAudioContext = useCallback(async () => {
    if (audioContextRef.current && audioContextRef.current.state === "suspended") {
      try {
        await audioContextRef.current.resume()
        console.log("Audio context resumed")
      } catch (error) {
        console.warn("Failed to resume audio context:", error)
      }
    }
  }, [])

  // Handle user interaction to resume audio context (required by browsers)
  useEffect(() => {
    const handleUserInteraction = () => {
      resumeAudioContext()
      // Remove listeners after first interaction
      document.removeEventListener("click", handleUserInteraction)
      document.removeEventListener("keydown", handleUserInteraction)
    }

    document.addEventListener("click", handleUserInteraction)
    document.addEventListener("keydown", handleUserInteraction)

    return () => {
      document.removeEventListener("click", handleUserInteraction)
      document.removeEventListener("keydown", handleUserInteraction)
    }
  }, [resumeAudioContext])

  return {
    audioState,
    playSound,
    setVolume,
    toggleAudio,
    resumeAudioContext,
  }
}