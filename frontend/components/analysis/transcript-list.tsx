"use client"

import { CheckCircle2, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SpokenContent } from "@/types"

type TranscriptListProps = {
  transcripts: SpokenContent[]
  onItemClick: (itemId: string) => void
}

export default function TranscriptList({ transcripts, onItemClick }: TranscriptListProps) {
  const removeHourFromTimestamp = (timestamp: string) => {
    if (timestamp.includes("-")) {
      const [start, end] = timestamp.split("-")
      if (start.split(":").length == 3 && start.startsWith("00:")) {
        return `${start.split(":")[1]}:${start.split(":")[2]}`
      }
      return start
    }
    return timestamp
  }

  return (
    <section className="mb-10">
      <h2 className="flex items-center text-xl font-semibold text-neutral-800 mb-3">
        <CheckCircle2 className="w-5 h-5 mr-2.5 text-neutral-500" />
        Transcript
      </h2>
      {transcripts.length ? (
        <ul className="space-y-2.5">
          {transcripts.map((item) => (
            <li
              key={item.id}
              onClick={() => onItemClick(item.id)}
              className={cn(
                "flex items-start text-sm text-neutral-700 p-2.5 rounded-md transition-all duration-150 cursor-pointer",
                item.isKeyMoment ? "bg-blue-50 hover:bg-blue-100 shadow-sm" : "hover:bg-neutral-100",
              )}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onItemClick(item.id)}
            >
              {item.isKeyMoment ? (
                <Star className="w-4 h-4 mr-2.5 text-blue-500 fill-blue-500 mt-0.5 flex-shrink-0" />
              ) : (
                <span className="w-4 h-4 mr-2.5 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-grow">
                {item.timestamp && (
                  <span className="text-xs text-blue-600 font-medium mr-2 float-right pt-0.5">
                    {removeHourFromTimestamp(item.timestamp)}
                  </span>
                )}
                <p>{item.summary}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-neutral-500 italic">No spoken content identified.</p>
      )}
    </section>
  )
}
