import { Info, BarChart2, Tag } from "lucide-react"
import type { AnalysisData } from "@/types"
import MinimalistSentimentBar from "./minimalist-sentiment-bar"
import KeywordTags from "./keyword-tags"

const DetailItem = ({ label, value }: { label: string; value: string | number }) => (
  <>
    <dt className="text-xs text-neutral-500 uppercase tracking-wider whitespace-nowrap">{label}</dt>
    <dd className="text-sm text-neutral-800">{value}</dd>
  </>
)

export default function ConversationBreakdown({ data }: { data: AnalysisData }) {
  return (
    <section className="mb-10">
      <h2 className="flex items-center text-xl font-semibold text-neutral-800 mb-4">
        <Info className="w-5 h-5 mr-2.5 text-neutral-500" />
        Conversation Breakdown
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 p-6 border border-neutral-200 rounded-lg bg-neutral-50/50">
        <div>
          <h3 className="text-sm font-medium text-neutral-600 mb-3">Key Details</h3>
          <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2 items-baseline text-left">
            <DetailItem label="Duration" value={data.availableDuration} />
            <DetailItem label="Language" value={data.language} />
            <DetailItem label="Situation" value={data.situation} />
            <DetailItem label="Place" value={data.place} />
            <DetailItem label="Time" value={data.time} />
            <DetailItem label="Location" value={data.location} />
          </dl>
        </div>
        <div className="space-y-4">
          {data.sentimentTimeline?.length ? (
            <div>
              <h3 className="flex items-center text-sm font-medium text-neutral-600 mb-1.5">
                <BarChart2 className="w-4 h-4 mr-2 text-neutral-400" />
                Sentiment Flow
              </h3>
              <MinimalistSentimentBar segments={data.sentimentTimeline} />
            </div>
          ) : null}
          {data.keywords?.length ? (
            <div>
              <h3 className="flex items-center text-sm font-medium text-neutral-600 mb-2">
                <Tag className="w-4 h-4 mr-2 text-neutral-400" />
                Prominent Keywords
              </h3>
              <KeywordTags keywords={data.keywords} />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
