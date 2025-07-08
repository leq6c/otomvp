import type { SentimentSegment } from "@/types"
import { cn } from "@/lib/utils"

export default function MinimalistSentimentBar({ segments }: { segments: SentimentSegment[] }) {
  if (!segments?.length) {
    return <div className="h-2.5 w-full rounded-full bg-neutral-200" />
  }

  const sentimentColor: Record<SentimentSegment["type"], string> = {
    positive: "bg-green-500",
    neutral: "bg-neutral-400",
    negative: "bg-red-500",
  }

  return (
    <div className="flex h-2.5 w-full overflow-hidden rounded-full">
      {segments.map((seg, i) => (
        <div
          key={i}
          className={cn("h-full", sentimentColor[seg.type])}
          style={{ width: `${seg.percentage}%` }}
          aria-label={`${seg.type} sentiment – ${seg.percentage}%`}
        />
      ))}
    </div>
  )
}
