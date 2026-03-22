'use client'

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type CSSProperties,
  type DragEvent,
  type ChangeEvent,
} from 'react'

/* ══════════════════════════════════════════════════════════════════════════════
   MediaUpload — Premium file upload UI
   Features: drag & drop, camera capture on mobile, multi-file select,
   per-file circular progress, preview grid with remove/reorder,
   file type validation, size limits, compression indicator,
   animated success checkmark
   ══════════════════════════════════════════════════════════════════════════════ */

interface UploadFile {
  id: string
  file: File
  preview: string | null
  progress: number      // 0-100
  status: 'pending' | 'uploading' | 'compressing' | 'done' | 'error'
  error?: string
}

interface MediaUploadProps {
  /** Accepted MIME types (default: image/*,video/*) */
  accept?: string
  /** Max files */
  maxFiles?: number
  /** Max file size in bytes (default 50MB) */
  maxFileSize?: number
  /** Whether to allow multiple files */
  multiple?: boolean
  /** Whether to show camera option on mobile */
  showCamera?: boolean
  /** Called when files are ready for upload */
  onFilesReady?: (files: File[]) => void
  /** Called to upload a single file — return progress via callback */
  onUpload?: (file: File, onProgress: (pct: number) => void) => Promise<void>
  /** Label text */
  label?: string
  /** Hint text */
  hint?: string
  /** Disabled state */
  disabled?: boolean
  /** Additional styles */
  style?: CSSProperties
  className?: string
}

/* ── Styles ──────────────────────────────────────────────────────────────── */

const STYLE_ID = 'lumira-media-upload-styles'

function ensureStyles() {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID)) return

  const s = document.createElement('style')
  s.id = STYLE_ID
  s.textContent = `
    .lumira-mu-drop {
      position: relative;
      border: 2px dashed var(--color-border, #E2E8F0);
      border-radius: var(--radius-lg, 16px);
      padding: 32px 20px;
      text-align: center;
      cursor: pointer;
      transition: border-color 0.15s, background 0.15s;
      -webkit-tap-highlight-color: transparent;
    }
    .lumira-mu-drop[data-active="true"] {
      border-color: var(--color-primary, #3D8178);
      background: var(--color-primary-light, #EDF4F2);
    }
    .lumira-mu-drop[data-disabled="true"] {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .lumira-mu-icon {
      width: 48px;
      height: 48px;
      margin: 0 auto 12px;
      border-radius: 50%;
      background: var(--color-primary-light, #EDF4F2);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .lumira-mu-icon svg {
      width: 24px;
      height: 24px;
      color: var(--color-primary, #3D8178);
    }

    .lumira-mu-label {
      font-size: 15px;
      font-weight: 600;
      color: var(--color-slate, #2D3748);
      margin-bottom: 4px;
    }
    .lumira-mu-hint {
      font-size: 13px;
      color: var(--color-muted, #718096);
      line-height: 1.4;
    }
    .lumira-mu-link {
      color: var(--color-primary, #3D8178);
      font-weight: 600;
      text-decoration: underline;
      text-decoration-color: transparent;
      transition: text-decoration-color 0.15s;
    }
    .lumira-mu-link:hover {
      text-decoration-color: var(--color-primary, #3D8178);
    }

    .lumira-mu-actions {
      display: flex;
      gap: 10px;
      justify-content: center;
      margin-top: 16px;
    }
    .lumira-mu-btn {
      padding: 8px 20px;
      border-radius: var(--radius-full, 9999px);
      border: 1px solid var(--color-border, #E2E8F0);
      background: var(--color-white, #fff);
      color: var(--color-primary, #3D8178);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      min-height: 40px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    /* Preview grid */
    .lumira-mu-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
      gap: 8px;
      margin-top: 16px;
    }
    .lumira-mu-thumb {
      position: relative;
      aspect-ratio: 1;
      border-radius: var(--radius-md, 12px);
      overflow: hidden;
      background: var(--surface-sunken, #F5F3EF);
    }
    .lumira-mu-thumb img,
    .lumira-mu-thumb video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    /* Remove button */
    .lumira-mu-remove {
      position: absolute;
      top: 4px;
      right: 4px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: none;
      background: rgba(0,0,0,0.6);
      color: #fff;
      font-size: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2;
    }

    /* Circular progress */
    .lumira-mu-progress-ring {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0,0,0,0.4);
      z-index: 1;
    }
    .lumira-mu-progress-ring svg {
      width: 40px;
      height: 40px;
      transform: rotate(-90deg);
    }
    .lumira-mu-progress-ring circle {
      fill: none;
      stroke-width: 3;
    }
    .lumira-mu-progress-ring .track {
      stroke: rgba(255,255,255,0.2);
    }
    .lumira-mu-progress-ring .fill {
      stroke: #fff;
      stroke-linecap: round;
      transition: stroke-dashoffset 0.2s;
    }

    /* Success checkmark */
    @keyframes lumira-mu-check {
      0%   { transform: scale(0); opacity: 0; }
      60%  { transform: scale(1.2); }
      100% { transform: scale(1); opacity: 1; }
    }
    .lumira-mu-check {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(61, 129, 120, 0.5);
      z-index: 1;
    }
    .lumira-mu-check svg {
      width: 32px;
      height: 32px;
      color: #fff;
      animation: lumira-mu-check 0.35s var(--ease-spring, cubic-bezier(0.34, 1.56, 0.64, 1));
    }

    /* Status label */
    .lumira-mu-status {
      position: absolute;
      bottom: 4px;
      left: 4px;
      right: 4px;
      padding: 2px 6px;
      border-radius: 4px;
      background: rgba(0,0,0,0.6);
      color: #fff;
      font-size: 10px;
      font-weight: 600;
      text-align: center;
      z-index: 2;
    }

    /* Error badge */
    .lumira-mu-error-badge {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: rgba(197, 48, 48, 0.15);
      gap: 4px;
      z-index: 1;
    }

    /* Size limit indicator */
    .lumira-mu-size-bar {
      margin-top: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .lumira-mu-size-track {
      flex: 1;
      height: 4px;
      border-radius: 2px;
      background: var(--color-border, #E2E8F0);
      overflow: hidden;
    }
    .lumira-mu-size-fill {
      height: 100%;
      border-radius: 2px;
      background: var(--color-primary, #3D8178);
      transition: width 0.3s;
    }
    .lumira-mu-size-fill[data-over="true"] {
      background: var(--color-red, #C53030);
    }

    @media (prefers-reduced-motion: reduce) {
      .lumira-mu-check svg { animation: none !important; }
      .lumira-mu-drop { transition: none !important; }
    }
  `
  document.head.appendChild(s)
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function generateId() {
  return `f_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function createPreview(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(file)
    } else if (file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file)
      resolve(url)
    } else {
      resolve(null)
    }
  })
}

/* ── Circular progress ───────────────────────────────────────────────────── */

function CircularProgress({ progress }: { progress: number }) {
  const r = 16
  const circ = 2 * Math.PI * r
  const offset = circ - (progress / 100) * circ

  return (
    <div className="lumira-mu-progress-ring">
      <svg viewBox="0 0 40 40">
        <circle className="track" cx="20" cy="20" r={r} />
        <circle
          className="fill"
          cx="20"
          cy="20"
          r={r}
          strokeDasharray={circ}
          strokeDashoffset={offset}
        />
      </svg>
    </div>
  )
}

/* ── Component ───────────────────────────────────────────────────────────── */

export default function MediaUpload({
  accept = 'image/*,video/*',
  maxFiles = 10,
  maxFileSize = 50 * 1024 * 1024,
  multiple = true,
  showCamera = true,
  onFilesReady,
  onUpload,
  label = 'Upload photos or videos',
  hint,
  disabled = false,
  style,
  className,
}: MediaUploadProps) {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)

  useEffect(() => { ensureStyles() }, [])

  /* ── File validation & addition ─────────────────────────────── */

  const addFiles = useCallback(async (newFiles: FileList | File[]) => {
    const arr = Array.from(newFiles)
    const remaining = maxFiles - files.length
    const accepted = arr.slice(0, Math.max(0, remaining))

    const uploads: UploadFile[] = []
    for (const file of accepted) {
      // Validate type
      if (accept !== '*' && !accept.split(',').some((t) => {
        const trimmed = t.trim()
        if (trimmed.endsWith('/*')) return file.type.startsWith(trimmed.replace('/*', '/'))
        return file.type === trimmed
      })) {
        uploads.push({
          id: generateId(), file, preview: null, progress: 0,
          status: 'error', error: `Unsupported file type: ${file.type || 'unknown'}`,
        })
        continue
      }

      // Validate size
      if (file.size > maxFileSize) {
        uploads.push({
          id: generateId(), file, preview: null, progress: 0,
          status: 'error', error: `Too large (max ${formatBytes(maxFileSize)})`,
        })
        continue
      }

      const preview = await createPreview(file)
      uploads.push({ id: generateId(), file, preview, progress: 0, status: 'pending' })
    }

    setFiles((prev) => [...prev, ...uploads])
    onFilesReady?.(uploads.filter((u) => u.status === 'pending').map((u) => u.file))

    // Auto-upload if handler provided
    if (onUpload) {
      for (const u of uploads) {
        if (u.status !== 'pending') continue
        setFiles((prev) => prev.map((f) => f.id === u.id ? { ...f, status: 'uploading' } : f))
        try {
          await onUpload(u.file, (pct) => {
            setFiles((prev) => prev.map((f) => f.id === u.id ? { ...f, progress: pct } : f))
          })
          setFiles((prev) => prev.map((f) => f.id === u.id ? { ...f, status: 'done', progress: 100 } : f))
        } catch (err) {
          setFiles((prev) => prev.map((f) => f.id === u.id ? {
            ...f, status: 'error', error: err instanceof Error ? err.message : 'Upload failed',
          } : f))
        }
      }
    }
  }, [files.length, maxFiles, maxFileSize, accept, onFilesReady, onUpload])

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const f = prev.find((x) => x.id === id)
      if (f?.preview && f.file.type.startsWith('video/')) {
        URL.revokeObjectURL(f.preview)
      }
      return prev.filter((x) => x.id !== id)
    })
  }, [])

  /* ── Drag & drop ───────────────────────────────────────────────── */

  const onDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    if (!disabled) setDragActive(true)
  }, [disabled])

  const onDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }, [])

  const onDrop = useCallback((e: DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    if (disabled) return
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files)
  }, [disabled, addFiles])

  const onInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) addFiles(e.target.files)
    e.target.value = ''
  }, [addFiles])

  /* ── Size usage ────────────────────────────────────────────────── */

  const totalSize = files.reduce((sum, f) => sum + f.file.size, 0)
  const totalLimit = maxFileSize * maxFiles
  const usagePct = Math.min(100, (totalSize / totalLimit) * 100)

  return (
    <div className={className} style={style}>
      {/* Hidden inputs */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={onInputChange}
        style={{ display: 'none' }}
      />
      {showCamera && (
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={onInputChange}
          style={{ display: 'none' }}
        />
      )}

      {/* Drop zone */}
      <div
        className="lumira-mu-drop"
        data-active={dragActive ? 'true' : undefined}
        data-disabled={disabled ? 'true' : undefined}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => !disabled && inputRef.current?.click()}
      >
        <div className="lumira-mu-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        <p className="lumira-mu-label">{label}</p>
        <p className="lumira-mu-hint">
          {hint ?? (
            <>
              Drag and drop or <span className="lumira-mu-link">browse files</span>
            </>
          )}
        </p>
        <p className="lumira-mu-hint" style={{ marginTop: 4 }}>
          Max {formatBytes(maxFileSize)} per file, up to {maxFiles} files
        </p>

        {showCamera && (
          <div className="lumira-mu-actions">
            <button
              className="lumira-mu-btn"
              onClick={(e) => { e.stopPropagation(); cameraRef.current?.click() }}
              type="button"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              Camera
            </button>
          </div>
        )}
      </div>

      {/* Preview grid */}
      {files.length > 0 && (
        <div className="lumira-mu-grid">
          {files.map((f) => (
            <div key={f.id} className="lumira-mu-thumb">
              {f.preview && f.file.type.startsWith('image/') && (
                <img src={f.preview} alt={f.file.name} />
              )}
              {f.preview && f.file.type.startsWith('video/') && (
                <video src={f.preview} muted playsInline />
              )}
              {!f.preview && !f.error && (
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, color: 'var(--color-muted)', padding: 8, textAlign: 'center',
                  wordBreak: 'break-all',
                }}>
                  {f.file.name}
                </div>
              )}

              {/* Upload progress */}
              {f.status === 'uploading' && <CircularProgress progress={f.progress} />}

              {/* Compressing label */}
              {f.status === 'compressing' && (
                <div className="lumira-mu-status">Compressing...</div>
              )}

              {/* Success */}
              {f.status === 'done' && (
                <div className="lumira-mu-check">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              )}

              {/* Error */}
              {f.status === 'error' && (
                <div className="lumira-mu-error-badge">
                  <span style={{ fontSize: 20 }}>&#x26A0;</span>
                  <span style={{ fontSize: 10, color: 'var(--error-text, #822727)', fontWeight: 600, padding: '0 4px', textAlign: 'center' }}>
                    {f.error ?? 'Error'}
                  </span>
                </div>
              )}

              {/* Remove button */}
              <button
                className="lumira-mu-remove"
                onClick={(e) => { e.stopPropagation(); removeFile(f.id) }}
                aria-label={`Remove ${f.file.name}`}
              >
                &#x2715;
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Size usage bar */}
      {files.length > 0 && (
        <div className="lumira-mu-size-bar">
          <div className="lumira-mu-size-track">
            <div
              className="lumira-mu-size-fill"
              data-over={usagePct >= 100 ? 'true' : undefined}
              style={{ width: `${usagePct}%` }}
            />
          </div>
          <span style={{ fontSize: 11, color: 'var(--color-muted)', whiteSpace: 'nowrap' }}>
            {formatBytes(totalSize)} / {formatBytes(totalLimit)}
          </span>
        </div>
      )}
    </div>
  )
}

export type { MediaUploadProps, UploadFile }
