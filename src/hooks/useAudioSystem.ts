"use client"
import { useState, useEffect, useCallback, useRef } from "react"
import type { AudioConfig } from "../types/nexus"

interface AudioSystemHook {
  isSupported: boolean
  isEnabled: boolean
  volume: number
  setVolume: (volume: number) => void
  toggleEnabled: () => void
  playSound: (soundName: keyof AudioConfig["sounds"]) => Promise<void>
  preloadSounds: () => Promise<void>
}

export function useAudioSystem(config: AudioConfig): AudioSystemHook {
  const [isSupported, setIsSupported] = useState(false)
  const [isEnabled, setIsEnabled] = useState(config.enabled)
  const [volume, setVolumeState] = useState(config.volume)
  const audioContext = useRef<AudioContext | null>(null)
  const audioBuffers = useRef<Map<string, AudioBuffer>>(new Map())
  const gainNode = useRef<GainNode | null>(null)

  // Initialize Web Audio API
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        // Check if Web Audio API is supported
        if (typeof window !== "undefined" && (window.AudioContext || (window as any).webkitAudioContext)) {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
          audioContext.current = new AudioContextClass()
          
          // Create gain node for volume control
          gainNode.current = audioContext.current.createGain()
          gainNode.current.connect(audioContext.current.destination)
          gainNode.current.gain.value = volume
          
          setIsSupported(true)
          
          // Resume audio context if it's suspended (required by some browsers)
          if (audioContext.current.state === "suspended") {
            await audioContext.current.resume()
          }
        } else {
          console.warn("Web Audio API not supported")
          setIsSupported(false)
        }
      } catch (error) {
        console.error("Failed to initialize audio system:", error)
        setIsSupported(false)
      }
    }

    initializeAudio()

    return () => {
      if (audioContext.current) {
        audioContext.current.close()
      }
    }
  }, [])

  // Update gain node volume when volume changes
  useEffect(() => {
    if (gainNode.current) {
      gainNode.current.gain.value = volume
    }
  }, [volume])

  // Generate simple audio buffers for UI sounds
  const generateSoundBuffer = useCallback((frequency: number, duration: number, type: OscillatorType = "sine"): AudioBuffer | null => {
    if (!audioContext.current) return null

    const sampleRate = audioContext.current.sampleRate
    const frameCount = sampleRate * duration
    const buffer = audioContext.current.createBuffer(1, frameCount, sampleRate)
    const channelData = buffer.getChannelData(0)

    for (let i = 0; i < frameCount; i++) {
      const t = i / sampleRate
      let sample = 0

      switch (type) {
        case "sine":
          sample = Math.sin(2 * Math.PI * frequency * t)
          break
        case "square":
          sample = Math.sign(Math.sin(2 * Math.PI * frequency * t))
          break
        case "sawtooth":
          sample = 2 * (t * frequency - Math.floor(t * frequency + 0.5))
          break
        case "triangle":
          sample = 2 * Math.abs(2 * (t * frequency - Math.floor(t * frequency + 0.5))) - 1
          break
      }

      // Apply fade out to prevent clicks
      const fadeOut = Math.max(0, 1 - (t / duration) * 4)
      channelData[i] = sample * fadeOut * 0.1 // Reduce volume
    }

    return buffer
  }, [])

  // Preload sound effects
  const preloadSounds = useCallback(async () => {
    if (!audioContext.current || !isSupported) return

    try {
      // Generate simple UI sounds
      const sounds = {
        dock: generateSoundBuffer(800, 0.1, "sine"), // High pitch for docking
        undock: generateSoundBuffer(400, 0.1, "sine"), // Lower pitch for undocking
        click: generateSoundBuffer(1000, 0.05, "sine"), // Short click
        expand: generateSoundBuffer(600, 0.15, "triangle"), // Expanding sound
        collapse: generateSoundBuffer(300, 0.1, "triangle"), // Collapsing sound
      }

      // Store buffers
      Object.entries(sounds).forEach(([name, buffer]) => {
        if (buffer) {
          audioBuffers.current.set(name, buffer)
        }
      })
    } catch (error) {
      console.error("Failed to preload sounds:", error)
    }
  }, [generateSoundBuffer, isSupported])

  // Play a sound
  const playSound = useCallback(async (soundName: keyof AudioConfig["sounds"]) => {
    if (!audioContext.current || !isSupported || !isEnabled) return

    try {
      const buffer = audioBuffers.current.get(soundName)
      if (!buffer) {
        console.warn(`Sound '${soundName}' not found`)
        return
      }

      // Resume context if suspended
      if (audioContext.current.state === "suspended") {
        await audioContext.current.resume()
      }

      // Create and play sound
      const source = audioContext.current.createBufferSource()
      source.buffer = buffer
      source.connect(gainNode.current!)
      source.start()
    } catch (error) {
      console.error(`Failed to play sound '${soundName}':`, error)
    }
  }, [isSupported, isEnabled])

  // Set volume
  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume))
    setVolumeState(clampedVolume)
  }, [])

  // Toggle enabled state
  const toggleEnabled = useCallback(() => {
    setIsEnabled(prev => !prev)
  }, [])

  // Preload sounds when component mounts
  useEffect(() => {
    if (isSupported) {
      preloadSounds()
    }
  }, [isSupported, preloadSounds])

  return {
    isSupported,
    isEnabled,
    volume,
    setVolume,
    toggleEnabled,
    playSound,
    preloadSounds,
  }
}