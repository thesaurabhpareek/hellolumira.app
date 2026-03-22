'use client'

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type CSSProperties,
} from 'react'
// Skeleton available at './Skeleton' if needed for loading states

/* ══════════════════════════════════════════════════════════════════════════════
   VideoPlayer — Custom HTML5 video player with premium controls
   Features: poster/thumbnail, custom overlay controls (play/pause, scrubber,
   mute, fullscreen), progress + buffer bar, playback speed selector,
   PiP support, autoplay-muted, tap to play/pause, loading skeleton,
   error retry, prefers-reduced-motion
   ══════════════════════════════════════════════════════════════════════════════ */

type PlaybackSpeed = 0.5 | 1 | 1.5 | 2

interface VideoPlayerProps {
  /** Video source URL */
  src: string
  /** Poster/thumbnail image */
  poster?: string
  /** Auto-play (muted) in feed mode */
  autoPlay?: boolean
  /** Loop the video */
  loop?: boolean
  /** Aspect ratio (default 16/9) */
  aspectRatio?: number
  /** Border radius */
  borderRadius?: number | string
  /** Show minimal controls (for feed embeds) */
  minimal?: boolean
  /** Additional styles */
  style?: CSSProperties
  className?: string
}

/* ── Styles ──────────────────────────────────────────────────────────────── */

const STYLE_ID = 'lumira-video-player-styles'

function ensureStyles() {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID)) return

  const s = document.createElement('style')
  s.id = STYLE_ID
  s.textContent = `
    .lumira-vp {
      position: relative;
      overflow: hidden;
      background: #000;
      -webkit-tap-highlight-color: transparent;
    }
    .lumira-vp video {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    /* Poster overlay */
    .lumira-vp-poster {
      position: absolute;
      inset: 0;
      background-size: cover;
      background-position: center;
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    .lumira-vp-poster::after {
      content: '';
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.2);
    }
    .lumira-vp-play-big {
      position: relative;
      z-index: 1;
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: rgba(255,255,255,0.9);
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      transition: transform 0.15s var(--ease-spring, cubic-bezier(0.34, 1.56, 0.64, 1));
    }
    .lumira-vp-play-big:active {
      transform: scale(0.92);
    }
    .lumira-vp-play-big svg {
      width: 28px;
      height: 28px;
      margin-left: 3px;
      color: var(--color-slate, #2D3748);
    }

    /* Controls bar */
    .lumira-vp-controls {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 3;
      padding: 32px 12px 12px;
      background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%);
      display: flex;
      flex-direction: column;
      gap: 8px;
      opacity: 1;
      transition: opacity 0.2s;
    }
    .lumira-vp-controls[data-hidden="true"] {
      opacity: 0;
      pointer-events: none;
    }

    .lumira-vp-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .lumira-vp-btn {
      background: none;
      border: none;
      color: #fff;
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 36px;
      min-height: 36px;
    }
    .lumira-vp-btn svg {
      width: 22px;
      height: 22px;
    }

    /* Progress bar */
    .lumira-vp-progress-container {
      flex: 1;
      height: 32px;
      display: flex;
      align-items: center;
      cursor: pointer;
    }
    .lumira-vp-progress-track {
      width: 100%;
      height: 4px;
      border-radius: 2px;
      background: rgba(255,255,255,0.2);
      position: relative;
      overflow: hidden;
    }
    .lumira-vp-buffer {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      background: rgba(255,255,255,0.3);
      border-radius: 2px;
      transition: width 0.3s;
    }
    .lumira-vp-filled {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      background: var(--color-primary, #3D8178);
      border-radius: 2px;
    }
    .lumira-vp-progress-container:hover .lumira-vp-progress-track {
      height: 6px;
    }

    /* Time label */
    .lumira-vp-time {
      color: rgba(255,255,255,0.85);
      font-size: 12px;
      font-weight: 500;
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
      min-width: 70px;
      text-align: center;
    }

    /* Speed selector */
    .lumira-vp-speed {
      padding: 3px 8px;
      border-radius: var(--radius-full, 9999px);
      border: 1px solid rgba(255,255,255,0.3);
      background: rgba(255,255,255,0.1);
      color: #fff;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      min-height: 28px;
    }

    /* Mute badge (autoplay feed) */
    .lumira-vp-mute-badge {
      position: absolute;
      bottom: 16px;
      right: 16px;
      z-index: 3;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(0,0,0,0.5);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: none;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    .lumira-vp-mute-badge svg {
      width: 18px;
      height: 18px;
    }

    /* Error overlay */
    .lumira-vp-error {
      position: absolute;
      inset: 0;
      z-index: 4;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: rgba(0,0,0,0.85);
      color: #fff;
      gap: 12px;
    }
    .lumira-vp-error button {
      padding: 8px 20px;
      border-radius: var(--radius-full, 9999px);
      border: 1px solid rgba(255,255,255,0.3);
      background: rgba(255,255,255,0.1);
      color: #fff;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      min-height: 40px;
    }

    @media (prefers-reduced-motion: reduce) {
      .lumira-vp-play-big,
      .lumira-vp-controls {
        transition: none !important;
      }
    }
  `
  document.head.appendChild(s)
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

/* ── Icons ───────────────────────────────────────────────────────────────── */

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21" /></svg>
)
const PauseIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
)
const MuteIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill="currentColor" stroke="none" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>
)
const UnmuteIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill="currentColor" stroke="none" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /></svg>
)
const FullscreenIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" /><line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" /></svg>
)
const PipIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><rect x="12" y="9" width="8" height="6" rx="1" fill="currentColor" opacity="0.3" /><line x1="12" y1="21" x2="12" y2="17" /></svg>
)

/* ── Component ───────────────────────────────────────────────────────────── */

export default function VideoPlayer({
  src,
  poster,
  autoPlay = false,
  loop = false,
  aspectRatio = 16 / 9,
  borderRadius = 'var(--radius-lg)',
  minimal = false,
  style,
  className,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [state, setState] = useState<'idle' | 'loading' | 'playing' | 'paused' | 'ended' | 'error'>('idle')
  const [muted, setMuted] = useState(autoPlay)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffered, setBuffered] = useState(0)
  const [speed, setSpeed] = useState<PlaybackSpeed>(1)
  const [controlsVisible, setControlsVisible] = useState(true)
  const [showPoster, setShowPoster] = useState(!!poster)
  const [inView, setInView] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => { ensureStyles() }, [])

  // Intersection observer for autoplay
  useEffect(() => {
    if (!autoPlay) { setInView(true); return }
    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [autoPlay])

  // Autoplay when in view
  useEffect(() => {
    const v = videoRef.current
    if (!v || !autoPlay) return
    if (inView && state !== 'error') {
      v.muted = true
      setMuted(true)
      v.play().then(() => {
        setState('playing')
        setShowPoster(false)
      }).catch(() => {})
    } else if (!inView && state === 'playing') {
      v.pause()
      setState('paused')
    }
  }, [inView, autoPlay, state])

  // Auto-hide controls
  const showControls = useCallback(() => {
    setControlsVisible(true)
    if (hideTimer.current) clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) {
        setControlsVisible(false)
      }
    }, 3000)
  }, [])

  /* ── Video event handlers ──────────────────────────────────────── */

  const handleTimeUpdate = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    setCurrentTime(v.currentTime)
    if (v.buffered.length > 0) {
      setBuffered(v.buffered.end(v.buffered.length - 1))
    }
  }, [])

  const handleLoadedMetadata = useCallback(() => {
    const v = videoRef.current
    if (v) setDuration(v.duration)
  }, [])

  const handleEnded = useCallback(() => {
    setState('ended')
    setControlsVisible(true)
  }, [])

  const handleError = useCallback(() => setState('error'), [])

  /* ── Actions ───────────────────────────────────────────────────── */

  const togglePlay = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    showControls()

    if (v.paused || v.ended) {
      v.play().then(() => {
        setState('playing')
        setShowPoster(false)
      }).catch(handleError)
    } else {
      v.pause()
      setState('paused')
    }
  }, [showControls, handleError])

  const handleInitialPlay = useCallback(() => {
    setShowPoster(false)
    const v = videoRef.current
    if (!v) return
    setState('loading')
    v.play().then(() => setState('playing')).catch(handleError)
  }, [handleError])

  const toggleMute = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
  }, [])

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current
    if (!v || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    v.currentTime = ratio * duration
    setCurrentTime(v.currentTime)
  }, [duration])

  const cycleSpeed = useCallback(() => {
    const speeds: PlaybackSpeed[] = [1, 1.5, 2, 0.5]
    const next = speeds[(speeds.indexOf(speed) + 1) % speeds.length]
    setSpeed(next)
    if (videoRef.current) videoRef.current.playbackRate = next
  }, [speed])

  const enterFullscreen = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    if (el.requestFullscreen) el.requestFullscreen()
  }, [])

  const enterPip = useCallback(async () => {
    const v = videoRef.current
    if (!v) return
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture()
      } else {
        await v.requestPictureInPicture()
      }
    } catch {}
  }, [])

  const handleRetry = useCallback(() => {
    setState('idle')
    const v = videoRef.current
    if (v) { v.load(); v.play().then(() => setState('playing')).catch(handleError) }
  }, [handleError])

  const br = typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius
  const progressPct = duration ? (currentTime / duration) * 100 : 0
  const bufferPct = duration ? (buffered / duration) * 100 : 0

  return (
    <div
      ref={containerRef}
      className={`lumira-vp ${className ?? ''}`}
      style={{
        aspectRatio: `${aspectRatio}`,
        borderRadius: br,
        ...style,
      }}
      onClick={() => {
        if (!showPoster && state !== 'error') togglePlay()
      }}
      onMouseMove={showControls}
      onTouchStart={showControls}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        loop={loop}
        muted={muted}
        playsInline
        preload={autoPlay ? 'auto' : 'metadata'}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onError={handleError}
        onWaiting={() => setState('loading')}
        onPlaying={() => setState('playing')}
      />

      {/* Loading skeleton */}
      {state === 'loading' && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
          <div style={{
            width: 40, height: 40, border: '3px solid rgba(255,255,255,0.2)',
            borderTopColor: '#fff', borderRadius: '50%',
            animation: 'lumira-vp-spin 0.8s linear infinite',
          }} />
          <style>{`@keyframes lumira-vp-spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Poster overlay */}
      {showPoster && poster && (
        <div
          className="lumira-vp-poster"
          style={{ backgroundImage: `url(${poster})` }}
          onClick={(e) => { e.stopPropagation(); handleInitialPlay() }}
        >
          <button className="lumira-vp-play-big" aria-label="Play video">
            <PlayIcon />
          </button>
        </div>
      )}

      {/* Autoplay mute badge */}
      {autoPlay && !showPoster && state === 'playing' && minimal && (
        <button
          className="lumira-vp-mute-badge"
          onClick={(e) => { e.stopPropagation(); toggleMute() }}
          aria-label={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? <MuteIcon /> : <UnmuteIcon />}
        </button>
      )}

      {/* Full controls */}
      {!showPoster && !minimal && (
        <div
          className="lumira-vp-controls"
          data-hidden={!controlsVisible ? 'true' : undefined}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Progress bar */}
          <div className="lumira-vp-progress-container" onClick={handleSeek}>
            <div className="lumira-vp-progress-track">
              <div className="lumira-vp-buffer" style={{ width: `${bufferPct}%` }} />
              <div className="lumira-vp-filled" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          {/* Button row */}
          <div className="lumira-vp-row">
            <button className="lumira-vp-btn" onClick={togglePlay} aria-label={state === 'playing' ? 'Pause' : 'Play'}>
              {state === 'playing' ? <PauseIcon /> : <PlayIcon />}
            </button>

            <button className="lumira-vp-btn" onClick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'}>
              {muted ? <MuteIcon /> : <UnmuteIcon />}
            </button>

            <span className="lumira-vp-time">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            <div style={{ flex: 1 }} />

            <button className="lumira-vp-speed" onClick={cycleSpeed} aria-label={`Playback speed ${speed}x`}>
              {speed}x
            </button>

            {'pictureInPictureEnabled' in document && (
              <button className="lumira-vp-btn" onClick={enterPip} aria-label="Picture in picture">
                <PipIcon />
              </button>
            )}

            <button className="lumira-vp-btn" onClick={enterFullscreen} aria-label="Fullscreen">
              <FullscreenIcon />
            </button>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {state === 'error' && (
        <div className="lumira-vp-error" onClick={(e) => e.stopPropagation()}>
          <p style={{ fontSize: 15, fontWeight: 600 }}>Unable to play video</p>
          <button onClick={handleRetry}>Try again</button>
        </div>
      )}
    </div>
  )
}

export type { VideoPlayerProps }
