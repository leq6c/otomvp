"use client"

import WaveformChart from "./waveform-chart";
import type { SpectrumState } from "@/hooks/useAudioSpectrum"

export interface AudioVisualizerProps {
  spectrumState: SpectrumState
  className?: string
}

export default function AudioVisualizer({ spectrumState, className = "" }: AudioVisualizerProps) {
  const { waveform, isAnalyzing, error } = spectrumState

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-transparent ${className}`}>
        <p className="text-red-500 text-sm">Audio visualization error: {error}</p>
      </div>
    )
  }

  return (
    <div className={`bg-transparent relative ${className}`}>
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/10 to-pink-500/5 blur-xl" />

      {/* Waveform Visualization */}
      <div className="relative h-full p-4">
        <WaveformChart data={waveform} strokeWidth={isAnalyzing ? 2 : 2} animate={true} />
      </div>

      {/* Animated particles effect when analyzing */}
      {isAnalyzing && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-gray-400/30 dark:bg-white/30 rounded-full animate-pulse"
              style={{
                left: `${20 + i * 15}%`,
                top: `${40 + Math.sin(i) * 20}%`,
                animationDelay: `${i * 0.2}s`,
                animationDuration: "2s",
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
