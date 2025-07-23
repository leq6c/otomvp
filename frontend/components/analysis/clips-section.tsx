"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { Play, Volume2, Download, Clock, AlertCircle, Loader2 } from "lucide-react"
import { useClips } from "@/hooks/use-clips"
import type { Clip } from "@/types"
import { toast } from "@/hooks/use-toast"
import AudioPlayer from "@/components/audioplayer/audio-player"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { useConversations } from "@/hooks/use-api"
import { ConversationJobResponse } from "@/lib/api-service"

type ClipsSectionProps = {
  conversationId: string
}

export default function ClipsSection({ conversationId }: ClipsSectionProps) {
  const { clips, loading, error, getClips, getClipAudioUrl, getClipCommentAudioUrl } = useClips()
  const [audioUrls, setAudioUrls] = useState<{ [key: string]: string }>({})
  const [commentAudioUrls, setCommentAudioUrls] = useState<{ [key: string]: string }>({})
  const [enableCommentAudio, setEnableCommentAudio] = useState(false)
  const [enableBackgroundMusic, setEnableBackgroundMusic] = useState(false)
  const { getConversationJob, conversationJob, conversationJobLoading, conversationJobError } = useConversations()
  const [lastLoadedJob, setLastLoadedJob] = useState<ConversationJobResponse | null>(null)
  
  const [playingClipId, setPlayingClipId] = useState<string | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const [jobProgress, setJobProgress] = useState<number>(0)
  const [clipsLoaded, setClipsLoaded] = useState(false)
  
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<Date | null>(null)

  // Calculate progress based on start time and estimated duration
  const calculateProgress = useCallback((job: ConversationJobResponse) => {
    if (!startTimeRef.current || !job.estimated_run_time_in_seconds || !job.started_at) return 0

    const estimatedDuration = 60 * 6 // 6 minutes

    const startTime = new Date(job.started_at)
    
    const now = new Date()
    const elapsed = (now.getTime() - startTime.getTime()) / 1000 // seconds
    let progress = Math.min((elapsed / estimatedDuration) * 100, 100) // Cap at 100% until completed
    
    return Math.max(progress, 0)
  }, [])

  // Polling function
  const pollJobStatus = useCallback(async () => {
    if (!conversationId) return
    
    try {
      console.log("Polling job status")
      await getConversationJob(conversationId)
    } catch (error) {
      console.error('Error polling job status:', error)
    }
  }, [conversationId, getConversationJob])

  // Start polling
  const startPolling = useCallback(() => {
    if (isPolling || clipsLoaded) return
    
    setIsPolling(true)
    startTimeRef.current = new Date()
    
    // Poll immediately, then every 3 seconds
    pollJobStatus()
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
    }
    pollingIntervalRef.current = setInterval(pollJobStatus, 3000)
  }, [isPolling, clipsLoaded, pollJobStatus])

  // Stop polling
  const stopPolling = useCallback(() => {
    setIsPolling(false)
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
    }
  }, [])

  useEffect(() => {
    if (conversationJob) {
      setLastLoadedJob(conversationJob as ConversationJobResponse)
    }
  }, [conversationJob])

  // Initial clips load
  useEffect(() => {
    if (conversationId) {
      getClips(conversationId).then((result) => {
        if (result && result.clips && result.clips.length > 0) {
          setClipsLoaded(true)
        } else {
          // No clips available, start polling for job status
          startPolling()
        }
      })
    }
  }, [conversationId, getClips, startPolling])

  // Handle job status changes
  useEffect(() => {
    if (!conversationJob) return

    const job = conversationJob as ConversationJobResponse
    
    // Update progress
    if (job.started_at && job.estimated_run_time_in_seconds) {
      if (!startTimeRef.current) {
        startTimeRef.current = new Date(job.started_at)
      }
      const progress = calculateProgress(job)
      setJobProgress(progress)
    }

    // Handle completed status
    if (job.status === "Completed" && clips.length === 0) {
      setJobProgress(100)
      stopPolling()
      
      // Refresh clips
      getClips(conversationId).then((result) => {
        if (result && result.clips) {
          setClipsLoaded(true)
        }
      })
    }
    
    // Handle failed states
    else if (["Failed", "Crashed", "Cancelled", "Cancelling"].includes(job.status)) {
      console.log("Job status is", job.status)
      stopPolling()
      setClipsLoaded(true) // Stop trying to load clips
    }
  }, [conversationJob, calculateProgress, stopPolling, getClips, conversationId])

  // Handle job errors (like 404 not found)
  useEffect(() => {
    if (conversationJobError) {
      if (conversationJobError.toLowerCase().includes("not found")) {
        // Job not found, stop polling
        stopPolling()
        setClipsLoaded(true)
      }
    }
  }, [conversationJobError, stopPolling])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling()
    }
  }, [stopPolling])

  // Handle clips error
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      })
    }
  }, [error])

  // Pre-load audio URLs for clips
  useEffect(() => {
    const loadAudioUrls = async () => {
      const urls: { [key: string]: string } = {}
      for (const clip of clips) {
        try {
          urls[clip.id] = await getClipAudioUrl(clip.id)
        } catch (error) {
          console.error(`Failed to load audio URL for clip ${clip.id}:`, error)
        }
      }
      setAudioUrls(urls)

      const commentUrls: { [key: string]: string } = {}
      for (const clip of clips) {
        try {
          commentUrls[clip.id] = await getClipCommentAudioUrl(clip.id)
        } catch (error) {
          console.error(`Failed to load comment audio URL for clip ${clip.id}:`, error)
        }
      }
      setCommentAudioUrls(commentUrls)
    }

    if (clips.length > 0) {
      loadAudioUrls()
    }
  }, [clips, getClipAudioUrl, getClipCommentAudioUrl])

  const handleDownload = async (clip: Clip) => {
    try {
      const audioUrl = audioUrls[clip.id] || await getClipAudioUrl(clip.id)
      
      // Create a temporary anchor element and trigger download
      const a = document.createElement('a')
      a.href = audioUrl
      a.download = `clip-${clip.id}.wav`
      a.target = "_blank"
      document.body.appendChild(a)
      a.click()
      
      // Clean up
      document.body.removeChild(a)
      
      toast({
        title: "Download Started",
        description: "Audio clip download has started",
      })
    } catch (error) {
      console.error('Error downloading audio:', error)
      toast({
        title: "Download Failed",
        description: "Failed to download audio clip",
        variant: "destructive",
      })
    }
  }

  // Show loading state
  if (loading || (conversationJobLoading && (!isPolling || !lastLoadedJob))) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-neutral-800 mb-4">Clips</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-3 bg-neutral-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-neutral-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Show processing state with progress
  if (clips.length === 0 && isPolling && lastLoadedJob) {
    const job = lastLoadedJob
    const isProcessing = !["Completed", "Failed", "Crashed", "Cancelled"].includes(job.status)
    
    if (isProcessing) {
      return (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-neutral-800 mb-4">Clips</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-neutral-600">
                <Loader2 className="w-12 h-12 mx-auto mb-4 text-neutral-500 animate-spin" />
                <p className="mb-4">Generating clips... It usually takes 5-10 minutes.</p>
                <div className="max-w-md mx-auto">
                  <Progress value={jobProgress} className="mb-2" />
                  {jobProgress < 100 && (
                    <p className="text-sm text-neutral-500">
                      {Math.round(jobProgress)}% complete
                    </p>
                  )}
                  {jobProgress >= 100 && (
                    <p className="text-sm text-neutral-500">
                      Taking more time than expected, hang tight...
                    </p>
                  )}
                  <p className="text-xs text-neutral-400 mt-1">
                    Status: {job.status}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }
  }

  // Show no clips available for failed states or when clips are not found
  if (clips.length === 0) {
    const job = lastLoadedJob
    const isFailedState = job && ["Failed", "Crashed", "Cancelled"].includes(job.status)
    const isNotFound = conversationJobError?.toLowerCase().includes("not found")
    
    return (
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-neutral-800 mb-4">Clips</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-neutral-600">
              {isFailedState || isNotFound ? (
                <>
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-neutral-400" />
                  <p>No clips available for this conversation</p>
                  {isFailedState && (
                    <p className="text-sm mt-1 text-neutral-600">
                      Clip generation failed status: {job?.status}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-neutral-400" />
                  <p>No clips available for this conversation</p>
                  {job?.status && (
                  <p className="text-sm mt-1 text-neutral-600">
                      Clip generation failed status: {job?.status}
                    </p>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-neutral-800">Clips</h2>
        <div className="flex items-center gap-2">
          <Switch id="enable-comment-audio" checked={enableCommentAudio} onCheckedChange={setEnableCommentAudio} />
          <Label htmlFor="enable-comment-audio">Commentary</Label>
          <Switch id="enable-background-music" checked={enableBackgroundMusic} onCheckedChange={setEnableBackgroundMusic} />
          <Label htmlFor="enable-background-music">Music</Label>
        </div>
      </div>
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {clips.map((clip) => (
          <Card key={clip.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <p className="text-neutral-700 mb-3 text-xs leading-relaxed overflow-hidden" style={{
                display: '-webkit-box',
                WebkitLineClamp: 7,
                WebkitBoxOrient: 'vertical'
              }}>
                {clip.comment}
              </p>

              {/* Audio Player Integration */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 text-xs px-2 py-2 h-7"
                    onClick={() => setPlayingClipId(clip.id)}
                  >
                    <Play className="w-3 h-3" />
                  </Button>

                  {clip.captions && clip.captions.length > 0 && (
                    <span className="text-xs text-neutral-500 italic truncate ml-2 flex-1">
                      {clip.captions[0].caption}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {playingClipId && audioUrls[playingClipId] && (
        <AudioPlayer 
          clip={clips.find((clip) => clip.id === playingClipId)!} 
          audioSrc={audioUrls[playingClipId]} 
          commentAudioSrc={commentAudioUrls[playingClipId]}
          useCommentAudio={enableCommentAudio}
          useBackgroundMusic={enableBackgroundMusic}
          onClose={() => setPlayingClipId(null)}
        />
      )}
    </div>
  )
}
