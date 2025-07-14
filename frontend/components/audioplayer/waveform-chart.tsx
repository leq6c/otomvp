"use client"

import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export interface WaveformChartProps {
  data: number[]
  color?: string
  strokeWidth?: number
  animate?: boolean
  className?: string
}

export default function WaveformChart({
  data,
  color,
  strokeWidth = 3,
  animate = true,
  className = "",
}: WaveformChartProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Convert waveform data to chart format with interpolation for smoother visualization
  const chartData =
    data.length > 0
      ? data.map((amplitude, index) => ({
          time: index,
          amplitude,
          absoluteAmplitude: Math.abs(amplitude), // For glow effect intensity
        }))
      : Array.from({ length: 200 }, (_, i) => ({
          time: i,
          amplitude: 0,
          absoluteAmplitude: 0,
        }))

  // Dynamic gradient colors based on theme
  const gradientId = "waveformGradient"
  const glowGradientId = "waveformGlow"

  // Different color schemes for light and dark modes
  const isDark = mounted ? resolvedTheme === "dark" : true // Default to dark during SSR

  return (
    <div className={`w-full h-full ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
          <defs>
            {/* Main gradient - darker colors for light mode */}
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
              {isDark ? (
                // Dark mode - bright colors
                <>
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.8} />
                  <stop offset="25%" stopColor="#3b82f6" stopOpacity={0.9} />
                  <stop offset="50%" stopColor="#8b5cf6" stopOpacity={1} />
                  <stop offset="75%" stopColor="#ec4899" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.8} />
                </>
              ) : (
                // Light mode - darker colors
                <>
                  <stop offset="0%" stopColor="#0891b2" stopOpacity={0.9} />
                  <stop offset="25%" stopColor="#1d4ed8" stopOpacity={1} />
                  <stop offset="50%" stopColor="#7c3aed" stopOpacity={1} />
                  <stop offset="75%" stopColor="#be185d" stopOpacity={1} />
                  <stop offset="100%" stopColor="#d97706" stopOpacity={0.9} />
                </>
              )}
            </linearGradient>

            {/* Glow effect gradient */}
            <linearGradient id={glowGradientId} x1="0" y1="0" x2="1" y2="0">
              {isDark ? (
                // Dark mode - subtle glow
                <>
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="25%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="50%" stopColor="#8b5cf6" stopOpacity={0.5} />
                  <stop offset="75%" stopColor="#ec4899" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.3} />
                </>
              ) : (
                // Light mode - more prominent glow for visibility
                <>
                  <stop offset="0%" stopColor="#0891b2" stopOpacity={0.4} />
                  <stop offset="25%" stopColor="#1d4ed8" stopOpacity={0.5} />
                  <stop offset="50%" stopColor="#7c3aed" stopOpacity={0.6} />
                  <stop offset="75%" stopColor="#be185d" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#d97706" stopOpacity={0.4} />
                </>
              )}
            </linearGradient>
          </defs>

          <XAxis dataKey="time" hide />
          <YAxis domain={[-100, 100]} hide />

          {/* Glow effect layer */}


          {/* Main waveform line with gradient */}
          <Line
            type="monotone"
            dataKey="amplitude"
            stroke={`url(#${gradientId})`}
            strokeWidth={1.5}
            dot={false}
            animationDuration={animate ? 80 : 0}
            isAnimationActive={animate}
            connectNulls={false}
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={
              isDark ? "drop-shadow(0 0 8px rgba(139, 92, 246, 0.4))" : "drop-shadow(0 0 6px rgba(124, 58, 237, 0.3))"
            }
          />


        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}