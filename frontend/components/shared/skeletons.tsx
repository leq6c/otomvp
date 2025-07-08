// Skeleton for the Earnings Panel
export const SkeletonEarnings = ({ className }: { className?: string }) => (
  <div className={`animate-pulse text-right ${className}`}>
    <div className="h-5 w-20 rounded bg-neutral-200 ml-auto mb-2"></div>
    <div className="h-10 w-40 rounded bg-neutral-300 ml-auto"></div>
  </div>
)

// Skeleton for the Uploaded Files Panel
export const SkeletonUploadedFiles = ({ className }: { className?: string }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="h-5 w-3/4 rounded bg-neutral-200 mb-4"></div>
    <div className="space-y-2">
      <div className="h-4 w-5/6 rounded bg-neutral-200"></div>
      <div className="h-4 w-4/6 rounded bg-neutral-200"></div>
      <div className="h-4 w-full rounded bg-neutral-200"></div>
      <div className="h-4 w-3/4 rounded bg-neutral-200"></div>
    </div>
  </div>
)

// Skeleton for the Profile Details
export const SkeletonProfileDetails = () => (
  <div className="w-full animate-pulse">
    <div className="flex items-center justify-between mb-8">
      <div className="h-8 w-1/3 rounded bg-neutral-300"></div>
      <div className="h-8 w-8 rounded-full bg-neutral-200"></div>
    </div>
    <div className="space-y-6">
      {[...Array(5)].map((_, i) => (
        <div key={i}>
          <div className="h-3 w-1/4 rounded bg-neutral-200 mb-1.5"></div>
          <div className="h-4 w-1/2 rounded bg-neutral-300"></div>
        </div>
      ))}
    </div>
  </div>
)

// Skeleton for the TopicTrends component
export const SkeletonTopicTrends = () => (
  <div className="w-full animate-pulse">
    <div className="h-8 w-3/4 rounded bg-neutral-300 mb-8"></div>
    <div className="relative mb-12">
      <div className="flex space-x-4 overflow-x-auto pb-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex-shrink-0 w-64 h-40 bg-neutral-200 p-5 rounded-xl shadow-sm">
            <div className="h-5 w-5/6 rounded bg-neutral-300 mb-2"></div>
            <div className="h-3 w-full rounded bg-neutral-300 mb-1"></div>
            <div className="h-3 w-3/4 rounded bg-neutral-300 mb-4"></div>
            <div className="mt-auto pt-3">
              <div className="flex items-center justify-between">
                <div className="w-full bg-neutral-300 rounded-full h-1.5 mr-3"></div>
                <div className="w-4 h-4 rounded-full bg-neutral-300"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    <div>
      <div className="h-6 w-1/2 rounded bg-neutral-300 mb-5"></div>
      <div className="flex flex-wrap gap-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-neutral-200 h-6 w-32 rounded-full"></div>
        ))}
      </div>
    </div>
  </div>
)

// Skeleton for the main analysis display
export const SkeletonAnalysis = () => (
  <div className="w-full max-w-3xl mx-auto animate-pulse h-[200vh]">
    <div className="mb-10">
      <div className="h-6 w-1/3 bg-neutral-300 rounded mb-3"></div>
      <div className="h-4 bg-neutral-200 rounded mb-1.5"></div>
      <div className="h-4 w-3/4 bg-neutral-200 rounded"></div>
    </div>
    <div className="mb-10">
      <div className="h-6 w-2/5 bg-neutral-300 rounded mb-4"></div>
      <div className="p-6 border border-neutral-200 rounded-lg bg-neutral-100/50">
        <div className="mb-6 pb-4 border-b border-neutral-200">
          <div className="h-4 w-1/3 bg-neutral-200 rounded mb-2"></div>
          <div className="space-y-1.5">
            <div className="h-3 w-5/6 bg-neutral-200 rounded"></div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="py-2">
              <div className="h-3 w-20 bg-neutral-200 rounded mb-1"></div>
              <div className="h-6 w-12 bg-neutral-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
    <div className="mt-12 text-center">
      <div className="h-10 w-1/3 bg-neutral-300 rounded mx-auto mb-2"></div>
      <div className="h-10 w-1/2 bg-neutral-200 rounded-full mx-auto mt-4"></div>
    </div>
  </div>
)
