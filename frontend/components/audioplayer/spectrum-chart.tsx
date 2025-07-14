"use client"

import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from "recharts"
import type { FrequencyPoint } from "@/lib/audio-spectrum"

export interface SpectrumChartProps {
  data: FrequencyPoint[]
  width?: number
  height?: number
  color?: string
  strokeWidth?: number
  showGrid?: boolean
  showTooltip?: boolean
  animate?: boolean
  className?: string
}

export default function SpectrumChart({
  data,
  width,
  height,
  color = "#2563eb",
  strokeWidth = 2,
  showGrid = true,
  showTooltip = false,
  animate = true,
  className = "",
}: SpectrumChartProps) {
  // Filter data for better visualization (focus on audible frequencies)
  const filteredData = data.filter((point) => point.frequency >= 20 && point.frequency <= 20000 && point.amplitude > 0)

  // Create baseline data when no audio
  const displayData =
    filteredData.length > 0
      ? filteredData
      : Array.from({ length: 50 }, (_, i) => ({
          frequency: i * 400 + 20, // 20Hz to 20kHz range
          amplitude: 0,
          decibels: -90,
        }))

  const formatFrequency = (value: number): string => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`
    }
    return `${value}`
  }

  const formatAmplitude = (value: number): string => {
    return `${value.toFixed(1)}%`
  }

  return (
    <div className={`w-full h-full ${className}`}>
      <ResponsiveContainer width={width || "100%"} height={height || "100%"}>
        <LineChart data={displayData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <XAxis
            dataKey="frequency"
            type="number"
            scale="log"
            domain={[20, 20000]}
            tickFormatter={formatFrequency}
            tick={{ fontSize: 12 }}
          />
          <YAxis domain={[0, 100]} tickFormatter={formatAmplitude} tick={{ fontSize: 12 }} />

          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />}

          {showTooltip && (
            <Tooltip
              formatter={(value: number, name: string) => [
                name === "amplitude" ? formatAmplitude(value) : value,
                name === "amplitude" ? "Amplitude" : "Frequency",
              ]}
              labelFormatter={(value: number) => `${formatFrequency(value)}Hz`}
            />
          )}

          <Line
            type="monotone"
            dataKey="amplitude"
            stroke={color}
            strokeWidth={strokeWidth}
            dot={false}
            animationDuration={animate ? 100 : 0}
            isAnimationActive={animate}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
