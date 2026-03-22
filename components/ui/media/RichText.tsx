'use client'

import {
  useEffect,
  useRef,
  type CSSProperties,
} from 'react'
import Image from 'next/image'

/* ══════════════════════════════════════════════════════════════════════════════
   RichText — Premium formatted content renderer
   Features: headings with anchor links, blockquotes with sage accent bar,
   image captions, lists, callout boxes (tip/warning/info), responsive lazy
   images, tables, external link indicators, code blocks
   ══════════════════════════════════════════════════════════════════════════════ */

/** Supported block types in the rich text AST */
type BlockType =
  | 'heading'
  | 'paragraph'
  | 'blockquote'
  | 'list'
  | 'image'
  | 'callout'
  | 'code'
  | 'table'
  | 'divider'

type CalloutType = 'tip' | 'warning' | 'info'
type ListStyle = 'bullet' | 'number'

interface RichTextBlock {
  type: BlockType
  /** For headings: 1-3 */
  level?: number
  /** Main text content (supports inline markdown: **bold**, *italic*, [links](url)) */
  content?: string
  /** For lists */
  items?: string[]
  listStyle?: ListStyle
  /** For images */
  src?: string
  alt?: string
  caption?: string
  /** For callouts */
  calloutType?: CalloutType
  /** For code blocks */
  language?: string
  /** For tables */
  headers?: string[]
  rows?: string[][]
  /** Anchor id for headings */
  id?: string
}

interface RichTextProps {
  /** Structured content blocks */
  blocks: RichTextBlock[]
  /** Alternatively, provide raw markdown-like text (simple parser) */
  markdown?: string
  /** Additional styles */
  style?: CSSProperties
  className?: string
}

/* ── Styles ──────────────────────────────────────────────────────────────── */

const STYLE_ID = 'lumira-rich-text-styles'

function ensureStyles() {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID)) return

  const s = document.createElement('style')
  s.id = STYLE_ID
  s.textContent = `
    .lumira-rt {
      font-size: 15px;
      line-height: 1.75;
      color: var(--text-primary, #2D3748);
    }
    .lumira-rt > * + * {
      margin-top: 16px;
    }

    /* Headings */
    .lumira-rt h1 {
      font-size: 24px;
      font-weight: 800;
      line-height: 1.3;
      color: var(--color-slate, #2D3748);
      letter-spacing: -0.3px;
    }
    .lumira-rt h2 {
      font-size: 20px;
      font-weight: 700;
      line-height: 1.35;
      color: var(--color-slate, #2D3748);
      letter-spacing: -0.2px;
    }
    .lumira-rt h3 {
      font-size: 17px;
      font-weight: 700;
      line-height: 1.4;
      color: var(--color-slate, #2D3748);
    }
    .lumira-rt h1 .lumira-rt-anchor,
    .lumira-rt h2 .lumira-rt-anchor,
    .lumira-rt h3 .lumira-rt-anchor {
      color: var(--color-primary, #3D8178);
      text-decoration: none;
      margin-left: 6px;
      opacity: 0;
      font-size: 0.8em;
      transition: opacity 0.15s;
    }
    .lumira-rt h1:hover .lumira-rt-anchor,
    .lumira-rt h2:hover .lumira-rt-anchor,
    .lumira-rt h3:hover .lumira-rt-anchor {
      opacity: 0.5;
    }

    /* Paragraph */
    .lumira-rt p {
      color: var(--text-primary, #2D3748);
    }

    /* Blockquote */
    .lumira-rt blockquote {
      border-left: 3px solid var(--color-primary, #3D8178);
      padding: 12px 16px;
      margin-left: 0;
      margin-right: 0;
      background: var(--color-primary-light, #EDF4F2);
      border-radius: 0 var(--radius-sm, 8px) var(--radius-sm, 8px) 0;
      font-style: italic;
      color: var(--text-secondary, #4A5568);
    }

    /* Lists */
    .lumira-rt ul,
    .lumira-rt ol {
      padding-left: 20px;
    }
    .lumira-rt li {
      margin-bottom: 6px;
      padding-left: 4px;
    }
    .lumira-rt ul li::marker {
      color: var(--color-primary, #3D8178);
    }
    .lumira-rt ol li::marker {
      color: var(--color-primary, #3D8178);
      font-weight: 600;
    }

    /* Images */
    .lumira-rt figure {
      margin: 0;
    }
    .lumira-rt figure img {
      width: 100%;
      height: auto;
      border-radius: var(--radius-md, 12px);
      display: block;
    }
    .lumira-rt figcaption {
      text-align: center;
      font-size: 13px;
      color: var(--color-muted, #718096);
      margin-top: 8px;
      font-style: italic;
    }

    /* Callout boxes */
    .lumira-rt-callout {
      padding: 14px 16px;
      border-radius: var(--radius-md, 12px);
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }
    .lumira-rt-callout[data-type="tip"] {
      background: var(--success-bg, #F0FFF4);
      border: 1px solid var(--success-border, #C6F6D5);
    }
    .lumira-rt-callout[data-type="warning"] {
      background: var(--warning-bg, #FFFFF0);
      border: 1px solid var(--warning-border, #FEFCBF);
    }
    .lumira-rt-callout[data-type="info"] {
      background: var(--info-bg, #EBF8FF);
      border: 1px solid var(--info-border, #BEE3F8);
    }
    .lumira-rt-callout-icon {
      flex-shrink: 0;
      font-size: 18px;
      line-height: 1;
      margin-top: 2px;
    }
    .lumira-rt-callout-body {
      font-size: 14px;
      line-height: 1.6;
    }
    .lumira-rt-callout[data-type="tip"] .lumira-rt-callout-body { color: var(--success-text, #276749); }
    .lumira-rt-callout[data-type="warning"] .lumira-rt-callout-body { color: var(--warning-text, #744210); }
    .lumira-rt-callout[data-type="info"] .lumira-rt-callout-body { color: var(--info-text, #2A4365); }

    /* Code blocks */
    .lumira-rt pre {
      background: var(--surface-sunken, #F5F3EF);
      border: 1px solid var(--color-border, #E2E8F0);
      border-radius: var(--radius-sm, 8px);
      padding: 14px 16px;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }
    .lumira-rt pre code {
      font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
      font-size: 13px;
      line-height: 1.6;
      color: var(--text-primary, #2D3748);
    }

    /* Tables */
    .lumira-rt-table-wrap {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      border: 1px solid var(--color-border, #E2E8F0);
      border-radius: var(--radius-sm, 8px);
    }
    .lumira-rt table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }
    .lumira-rt th {
      background: var(--surface-sunken, #F5F3EF);
      font-weight: 700;
      text-align: left;
      padding: 10px 14px;
      border-bottom: 2px solid var(--color-border, #E2E8F0);
      color: var(--color-slate, #2D3748);
      white-space: nowrap;
    }
    .lumira-rt td {
      padding: 10px 14px;
      border-bottom: 1px solid var(--color-border, #E2E8F0);
      color: var(--text-primary, #2D3748);
    }
    .lumira-rt tr:last-child td {
      border-bottom: none;
    }

    /* Divider */
    .lumira-rt hr {
      border: none;
      height: 1px;
      background: var(--color-border, #E2E8F0);
      margin: 24px 0;
    }

    /* Links */
    .lumira-rt a {
      color: var(--text-link, #3D8178);
      text-decoration: underline;
      text-decoration-color: rgba(61, 129, 120, 0.3);
      text-underline-offset: 2px;
      transition: text-decoration-color 0.15s;
    }
    .lumira-rt a:hover {
      text-decoration-color: var(--text-link, #3D8178);
    }
    .lumira-rt a[data-external="true"]::after {
      content: ' \\2197';
      font-size: 0.85em;
      opacity: 0.6;
    }

    /* Inline styles */
    .lumira-rt strong { font-weight: 700; color: var(--color-slate, #2D3748); }
    .lumira-rt em { font-style: italic; }

    @media (prefers-reduced-motion: reduce) {
      .lumira-rt a,
      .lumira-rt h1 .lumira-rt-anchor,
      .lumira-rt h2 .lumira-rt-anchor,
      .lumira-rt h3 .lumira-rt-anchor {
        transition: none !important;
      }
    }
  `
  document.head.appendChild(s)
}

/* ── Inline text parser ──────────────────────────────────────────────────── */

function renderInline(text: string): string {
  const html = text
    // Bold
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, url) => {
      const isExternal = url.startsWith('http')
      return `<a href="${url}"${isExternal ? ' data-external="true" target="_blank" rel="noopener noreferrer"' : ''}>${label}</a>`
    })
    // Inline code
    .replace(/`([^`]+)`/g, '<code style="background:var(--surface-sunken,#F5F3EF);padding:2px 6px;border-radius:4px;font-size:0.9em;">$1</code>')

  return html
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

const CALLOUT_ICONS: Record<CalloutType, string> = {
  tip: '\u2705',
  warning: '\u26A0\uFE0F',
  info: '\u2139\uFE0F',
}

/* ── Block renderer ──────────────────────────────────────────────────────── */

function renderBlock(block: RichTextBlock, index: number) {
  switch (block.type) {
    case 'heading': {
      const level = block.level ?? 2
      const Tag = `h${Math.min(3, Math.max(1, level))}` as 'h1' | 'h2' | 'h3'
      const id = block.id ?? slugify(block.content ?? '')
      return (
        <Tag key={index} id={id}>
          <span dangerouslySetInnerHTML={{ __html: renderInline(block.content ?? '') }} />
          <a className="lumira-rt-anchor" href={`#${id}`} aria-hidden="true">#</a>
        </Tag>
      )
    }

    case 'paragraph':
      return (
        <p key={index} dangerouslySetInnerHTML={{ __html: renderInline(block.content ?? '') }} />
      )

    case 'blockquote':
      return (
        <blockquote key={index}>
          <span dangerouslySetInnerHTML={{ __html: renderInline(block.content ?? '') }} />
        </blockquote>
      )

    case 'list': {
      const Tag = block.listStyle === 'number' ? 'ol' : 'ul'
      return (
        <Tag key={index}>
          {(block.items ?? []).map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: renderInline(item) }} />
          ))}
        </Tag>
      )
    }

    case 'image':
      return (
        <figure key={index}>
          <Image
            src={block.src ?? ''}
            alt={block.alt ?? ''}
            width={800}
            height={450}
            unoptimized
            decoding="async"
          />
          {block.caption && <figcaption>{block.caption}</figcaption>}
        </figure>
      )

    case 'callout': {
      const ct = block.calloutType ?? 'info'
      return (
        <div key={index} className="lumira-rt-callout" data-type={ct} role="note">
          <span className="lumira-rt-callout-icon">{CALLOUT_ICONS[ct]}</span>
          <div
            className="lumira-rt-callout-body"
            dangerouslySetInnerHTML={{ __html: renderInline(block.content ?? '') }}
          />
        </div>
      )
    }

    case 'code':
      return (
        <pre key={index}>
          <code>{block.content}</code>
        </pre>
      )

    case 'table':
      return (
        <div key={index} className="lumira-rt-table-wrap">
          <table>
            {block.headers && (
              <thead>
                <tr>
                  {block.headers.map((h, i) => (
                    <th key={i} dangerouslySetInnerHTML={{ __html: renderInline(h) }} />
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {(block.rows ?? []).map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci} dangerouslySetInnerHTML={{ __html: renderInline(cell) }} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )

    case 'divider':
      return <hr key={index} />

    default:
      return null
  }
}

/* ── Simple markdown parser ──────────────────────────────────────────────── */

function parseMarkdown(md: string): RichTextBlock[] {
  const lines = md.split('\n')
  const blocks: RichTextBlock[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    // Empty line
    if (!trimmed) { i++; continue }

    // Headings
    if (trimmed.startsWith('### ')) {
      blocks.push({ type: 'heading', level: 3, content: trimmed.slice(4) })
      i++; continue
    }
    if (trimmed.startsWith('## ')) {
      blocks.push({ type: 'heading', level: 2, content: trimmed.slice(3) })
      i++; continue
    }
    if (trimmed.startsWith('# ')) {
      blocks.push({ type: 'heading', level: 1, content: trimmed.slice(2) })
      i++; continue
    }

    // Divider
    if (/^-{3,}$/.test(trimmed) || /^\*{3,}$/.test(trimmed)) {
      blocks.push({ type: 'divider' })
      i++; continue
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      const quoteLines: string[] = []
      while (i < lines.length && lines[i].trim().startsWith('> ')) {
        quoteLines.push(lines[i].trim().slice(2))
        i++
      }
      blocks.push({ type: 'blockquote', content: quoteLines.join(' ') })
      continue
    }

    // Callout (custom syntax: :::tip / :::warning / :::info)
    const calloutMatch = trimmed.match(/^:::(tip|warning|info)$/)
    if (calloutMatch) {
      const calloutType = calloutMatch[1] as CalloutType
      i++
      const bodyLines: string[] = []
      while (i < lines.length && lines[i].trim() !== ':::') {
        bodyLines.push(lines[i].trim())
        i++
      }
      i++ // skip closing :::
      blocks.push({ type: 'callout', calloutType, content: bodyLines.join(' ') })
      continue
    }

    // Unordered list
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const items: string[] = []
      while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))) {
        items.push(lines[i].trim().slice(2))
        i++
      }
      blocks.push({ type: 'list', listStyle: 'bullet', items })
      continue
    }

    // Ordered list
    if (/^\d+\.\s/.test(trimmed)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s/, ''))
        i++
      }
      blocks.push({ type: 'list', listStyle: 'number', items })
      continue
    }

    // Code block
    if (trimmed.startsWith('```')) {
      const lang = trimmed.slice(3).trim()
      i++
      const codeLines: string[] = []
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      i++ // skip closing ```
      blocks.push({ type: 'code', content: codeLines.join('\n'), language: lang || undefined })
      continue
    }

    // Image: ![alt](src "caption")
    const imgMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+?)(?:\s+"([^"]*)")?\)$/)
    if (imgMatch) {
      blocks.push({ type: 'image', alt: imgMatch[1], src: imgMatch[2], caption: imgMatch[3] })
      i++; continue
    }

    // Paragraph (collect consecutive non-empty lines)
    const paraLines: string[] = []
    while (i < lines.length && lines[i].trim() && !lines[i].trim().startsWith('#') && !lines[i].trim().startsWith('>') && !lines[i].trim().startsWith('- ') && !lines[i].trim().startsWith('* ') && !/^\d+\.\s/.test(lines[i].trim())) {
      paraLines.push(lines[i].trim())
      i++
    }
    if (paraLines.length) {
      blocks.push({ type: 'paragraph', content: paraLines.join(' ') })
    }
  }

  return blocks
}

/* ── Main component ──────────────────────────────────────────────────────── */

export default function RichText({
  blocks: blocksProp,
  markdown,
  style,
  className,
}: RichTextProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => { ensureStyles() }, [])

  // Lazy-load images via IntersectionObserver
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const images = container.querySelectorAll('img[loading="lazy"]')
    if (!images.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement
            if (img.dataset.src) {
              img.src = img.dataset.src
              img.removeAttribute('data-src')
            }
            observer.unobserve(img)
          }
        })
      },
      { rootMargin: '200px' }
    )

    images.forEach((img) => observer.observe(img))
    return () => observer.disconnect()
  }, [blocksProp, markdown])

  const blocks = blocksProp ?? (markdown ? parseMarkdown(markdown) : [])

  if (!blocks.length) return null

  return (
    <div ref={containerRef} className={`lumira-rt ${className ?? ''}`} style={style}>
      {blocks.map(renderBlock)}
    </div>
  )
}

export { parseMarkdown }
export type { RichTextProps, RichTextBlock, BlockType, CalloutType }
