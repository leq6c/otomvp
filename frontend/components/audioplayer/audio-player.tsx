"use client"

import { useState, useEffect, useRef } from "react"
import { Play, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAudioPlayer } from "@/hooks/useAudioPlayer"
import { useAudioSpectrum } from "@/hooks/useAudioSpectrum"
import { useCaptions } from "@/hooks/useCaptions"
import FullscreenModal from "./fullscreen-modal"
import CaptionDisplay from "./caption-display"
import AudioVisualizer from "./audio-visualizer"
import ProgressBar from "./progress-bar";
import type { Clip } from "@/types"
import { OggOpusDecoder } from 'ogg-opus-decoder';
import { audioBufferToWav, isOpusSupported, opusToWavUrl } from "@/lib/wavutil"

interface AudioPlayerProps {
  clip: Clip
  audioSrc: string
  commentAudioSrc: string
  useCommentAudio: boolean
  useBackgroundMusic: boolean
  onClose: () => void
}

export default function AudioPlayer({ clip, audioSrc, commentAudioSrc, useCommentAudio, useBackgroundMusic, onClose }: AudioPlayerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPlayingCommentAudio, setIsPlayingCommentAudio] = useState(true);
  const [commentTextOpacity, setCommentTextOpacity] = useState(0);
  const [isLoadingAudio, setIsLoadingAudio] = useState(true);
  const [loadedAudioCount, setLoadedAudioCount] = useState(0);
  const [playingAudioSrc, setPlayingAudioSrc] = useState(audioSrc);
  const [playingCommentAudioSrc, setPlayingCommentAudioSrc] = useState(commentAudioSrc);
  const [playingBackgroundMusicSrc, setPlayingBackgroundMusicSrc] = useState("/sound/insp.mp3");
  const [showStillNotPlaying, setShowStillNotPlaying] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Audio player state and controls
  const { audioRef, state, actions, eventHandlers } = useAudioPlayer()
  const backgroundMusicAudioRef = useRef<HTMLAudioElement>(null)
  const commentAudioRef = useRef<HTMLAudioElement>(null)

  // Real-time audio spectrum analysis using FFT
  const spectrumState = useAudioSpectrum(audioRef.current, state.isPlaying, {
    fftSize: 1024, // Higher resolution for detailed spectrum
    smoothingTimeConstant: 0.8,
    updateInterval: 40, // 25 FPS for smooth animation
    enabled: true,
  })

  // Caption synchronization
  const captionState = useCaptions(clip.captions, state.currentTime, state.hasPlayed)

  const [showAllCaptions, setShowAllCaptions] = useState(false)

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  // Calculate total number of audio files to load
  const getTotalAudioFiles = () => {
    let total = 1; // Main audio always exists
    if (useCommentAudio) total += 1; // Comment audio
    if (useBackgroundMusic) total += 1; // Background music
    return total;
  };

  // Handle audio loaded event
  const handleAudioLoaded = () => {
    setLoadedAudioCount(prev => {
      const newCount = prev + 1;
      const totalFiles = getTotalAudioFiles();
      if (newCount >= totalFiles) {
        setIsLoadingAudio(false);
      }
      return newCount;
    });
  };

  const openPlayer = async () => {
    setIsModalOpen(true)
    
    // Wait for all audio files to load before proceeding
    if (isLoadingAudio) {
      return;
    }
    
    const start = async() =>{
        setIsPlayingCommentAudio(false);
        if (useBackgroundMusic && backgroundMusicAudioRef.current) {
            backgroundMusicAudioRef.current.currentTime = 0
            backgroundMusicAudioRef.current.volume = 0.5
            await backgroundMusicAudioRef.current.play()
        }
        if (audioRef.current) {
            audioRef.current.playbackRate = 1.2;
            await spectrumState.actions.initializeAnalyzer()
            await spectrumState.actions.resumeContext()
            await actions.play()
        }
    };

    if (useCommentAudio) {
        if (commentAudioRef.current) {
            setIsPlayingCommentAudio(true);
            commentAudioRef.current.currentTime = 0
            commentAudioRef.current.volume = 0.5
            commentAudioRef.current.playbackRate = 1.5;
            await commentAudioRef.current.play()
            await delay(100);
            setCommentTextOpacity(1);
            commentAudioRef.current.onended = async () => {
                setIsPlayingCommentAudio(false);
                await start();
            }
            return;
        }
    }else {
        await start();
    }
  }

  const closePlayer = () => {
    setIsModalOpen(false)
    actions.stop()
    spectrumState.actions.stopAnalysis()
    onClose()
  }

  useEffect(() => {
    openPlayer()
  }, [isLoadingAudio]); // Trigger openPlayer when loading is complete

  useEffect(() => {
    if (state.hasPlayed) {
      setTimeout(() => {
        setShowAllCaptions(true)
      }, 300)
    }
  }, [state.hasPlayed])

  useEffect(() => {
    isOpusSupported().then(async (supported) => {
      if (!supported) {
        let loaded = 0;
        const wavAudioSrc = await opusToWavUrl(audioSrc);
        setPlayingAudioSrc(wavAudioSrc);
        audioRef.current!.src = wavAudioSrc;
        loaded++;
        setLoadedAudioCount(loaded);

        if (useCommentAudio) {
          const wavCommentAudioSrc = await opusToWavUrl(commentAudioSrc);
          setPlayingCommentAudioSrc(wavCommentAudioSrc);
          commentAudioRef.current!.src = wavCommentAudioSrc;
          loaded++;
          setLoadedAudioCount(loaded);
        }

        if (useBackgroundMusic) {
          const mp3BackgroundMusicData = await (await fetch(playingBackgroundMusicSrc)).blob();
          const mp3Url = URL.createObjectURL(mp3BackgroundMusicData);
          setPlayingBackgroundMusicSrc(mp3Url);
          backgroundMusicAudioRef.current!.src = mp3Url;
          loaded++;
          setLoadedAudioCount(loaded);
        }

        await delay(300);

        setIsLoadingAudio(false);
      }
    });
  }, []);

  /*
  useEffect(() => {
    setTimeout(() => {
      if (!isAudioPlaying) {
        setShowStillNotPlaying(true);
      }
    }, 5000);
  }, []);*/

  const forceStart = () => {
    setIsLoadingAudio(false);
    openPlayer();
  }

  const anyOfAudioStarted = () => {
    setShowStillNotPlaying(false);
    setIsAudioPlaying(true);
  }

  return (
    <>
      <FullscreenModal isOpen={isModalOpen} onClose={closePlayer}>
        {/* Loading Spinner */}
        {isLoadingAudio && (
          <div className="absolute inset-0 flex items-center justify-center z-30 bg-black bg-opacity-50 pointer-events-none">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-white" />
              <p className="text-white text-sm font-light">
                Loading audio files... ({loadedAudioCount}/{getTotalAudioFiles()})
              </p>
            </div>
          </div>
        )}

        {showStillNotPlaying && (
          <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
            <div className="flex flex-col items-center space-y-4 mt-40">
              {showStillNotPlaying && <div className="flex flex-col items-center mt-4">
                <p className="text-gray-900 text-sm font-light mb-1">Still not playing?</p>
                <Button onClick={forceStart} className="pointer-events-auto"><Play className="w-4 h-4 mr-2" />Start</Button>
              </div>}
            </div>
          </div>
        )}

        {/* Caption Display - Absolutely positioned in exact center */}
        {!isLoadingAudio && !isPlayingCommentAudio && <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <CaptionDisplay 
            captionState={captionState} 
            typingSpeed={10} // Very fast typing: 10ms per character
            enableTypingEffect={true} // Disabled for instant display - change to true if you want typing effect
          />
        </div>}

        {!isLoadingAudio && isPlayingCommentAudio && <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <p className="p-8 text-sm md:text-base lg:text-lg font-bold text-gray-900 dark:text-white leading-tight max-w-3xl opacity-80 transition-opacity duration-500" style={{ opacity: commentTextOpacity }}>
            {clip.comment}
          </p>
        </div>}

        {/* Main content area with flex layout */}
        <div className="flex flex-col h-full">
          {/* Top spacer to push waveform down */}
          <div className="flex-1" />

          {/* Audio Spectrum Visualizer at bottom */}
          {!isLoadingAudio && <AudioVisualizer spectrumState={spectrumState} className="h-80 relative" />}
        </div>

        {/* Progress Bar - Fixed at bottom */}
        {!isLoadingAudio && <ProgressBar captionState={captionState} />}

        {/* Hidden Audio Element */}
        <audio 
        preload="auto"
        ref={audioRef} 
        crossOrigin="anonymous"
        onPlay={eventHandlers.handlePlay}
        onPause={eventHandlers.handlePause}
        onEnded={eventHandlers.handleEnded}
        onTimeUpdate={eventHandlers.handleTimeUpdate}
        onLoadedMetadata={eventHandlers.handleLoadedMetadata}
        onError={eventHandlers.handleError}
        onCanPlayThrough={handleAudioLoaded}
        >
          <source src={playingAudioSrc}/>
          Your browser does not support the audio element.
        </audio>

        {/* Comment Audio Element */}
        {useCommentAudio && (
          <audio 
            ref={commentAudioRef} 
            crossOrigin="anonymous" 
            preload="auto"
            onCanPlayThrough={handleAudioLoaded}
          >
            <source src={playingCommentAudioSrc} />
            Your browser does not support the audio element.
          </audio>
        )}

        {/* Background music Audio Element */}
        {useBackgroundMusic && (
          <audio 
            ref={backgroundMusicAudioRef} 
            crossOrigin="anonymous" 
            preload="auto"
            onCanPlayThrough={handleAudioLoaded}
          >
            <source src={playingBackgroundMusicSrc}/>
            Your browser does not support the audio element.
          </audio>
        )}
        {/* Show All Captions. show when currentTime is -1, use an animation to fade in and out */}
        {!isLoadingAudio && showAllCaptions && <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center transition-opacity duration-500">
            <div className="flex flex-col align-baseline justify-center p-4">
            {clip.captions.map((caption) => (
                <p key={caption.timecode_start} className="mb-2 text-sm md:text-base lg:text-lg font-bold text-gray-900 dark:text-white leading-tight max-w-xl">
                    "{caption.caption}"
                </p>
                ))}
            </div>
        </div>}
      </FullscreenModal>
    </>
  )
}
