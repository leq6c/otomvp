"use client"

import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from "recharts"
import type { SpectrumData } from "@/hooks/useAudioSpectrum"

interface SpectrumVisualizerProps {
  data: SpectrumData[]
  className?: string
  color?: string
  showGrid?: boolean
}

export default function SpectrumVisualizer({
  data,
  className = "",
  color = "#1f2937",
  showGrid = false,
}: SpectrumVisualizerProps) {
  // Create baseline data when no audio
  const displayData =
    data.length > 0
      ? data
      : Array.from({ length: 128 }, (_, i) => ({
          frequency: i,
          amplitude: 0,
        }))

  return (
    <div className={`w-full h-full ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={displayData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
          <XAxis dataKey="frequency" hide domain={[0, "dataMax"]} />
          <YAxis domain={[0, 100]} hide />
          {showGrid && (
            <>
              <ReferenceLine y={25} stroke="#e5e7eb" strokeDasharray="2 2" />
              <ReferenceLine y={50} stroke="#e5e7eb" strokeDasharray="2 2" />
              <ReferenceLine y={75} stroke="#e5e7eb" strokeDasharray="2 2" />
            </>
          )}
          <Line
            type="monotone"
            dataKey="amplitude"
            stroke={color}
            strokeWidth={2}
            dot={false}
            animationDuration={100}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
