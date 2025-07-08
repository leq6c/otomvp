import { ClipboardList } from "lucide-react"
import type { AnalysisData } from "@/types"

const MetricDisplay = ({ label, value, unit }: { label: string; value?: number; unit?: string }) => {
  if (value === undefined) return null
  return (
    <div className="py-2">
      <p className="text-xs text-neutral-500 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-2xl font-semibold text-neutral-800">
        {value}
        {unit && <span className="text-sm font-normal text-neutral-600 ml-1">{unit}</span>}
      </p>
    </div>
  )
}

export default function PerformanceInsights({ data }: { data: AnalysisData }) {
  const hasInsights =
    data.advice?.length ||
    data.boringRate !== undefined ||
    data.density !== undefined ||
    data.clarityScore !== undefined ||
    data.engagementScore !== undefined

  if (!hasInsights) return null

  return (
    <section className="mb-10">
      <h2 className="flex items-center text-xl font-semibold text-neutral-800 mb-4">
        <ClipboardList className="w-5 h-5 mr-2.5 text-neutral-500" />
        Performance Insights
      </h2>
      <div className="p-6 border border-neutral-200 rounded-lg bg-neutral-50/50">
        {data.advice?.length && (
          <div className="mb-6 pb-4 border-b border-neutral-200">
            <h3 className="text-sm font-medium text-neutral-600 mb-2">Key Suggestions:</h3>
            <ul className="space-y-1.5 list-disc list-inside pl-1">
              {data.advice.map((item, index) => (
                <li key={index} className="text-sm text-neutral-700">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          <MetricDisplay label="Boring Score" value={data.boringRate} unit="/100" />
          <MetricDisplay label="Density Score" value={data.density} unit="/100" />
          <MetricDisplay label="Clarity Score" value={data.clarityScore} unit="/100" />
          <MetricDisplay label="Engagement Score" value={data.engagementScore} unit="/100" />
        </div>
        {data.boringRate !== undefined && data.boringRate > 50 && (
          <p className="text-xs text-neutral-600 mt-4 text-center italic">
            Note: A higher 'Boring Score' suggests the conversation may have lacked dynamism.
          </p>
        )}
      </div>
    </section>
  )
}
