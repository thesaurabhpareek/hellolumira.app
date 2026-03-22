/**
 * @module components/ui/media
 * @description Rich media & content components for the Lumira app.
 * All components are 'use client', zero external dependencies,
 * mobile-first, touch-optimized, and respect prefers-reduced-motion.
 */

export { default as ImageGallery } from './ImageGallery'
export type { GalleryImage, ImageGalleryProps } from './ImageGallery'

export { default as FullscreenViewer } from './FullscreenViewer'
export type { FullscreenViewerProps, ViewerImage } from './FullscreenViewer'

export { default as VideoPlayer } from './VideoPlayer'
export type { VideoPlayerProps } from './VideoPlayer'

export { default as ContentCard } from './ContentCard'
export type { ContentCardProps, CardVariant } from './ContentCard'

export { default as Carousel } from './Carousel'
export type { CarouselProps, CarouselSize, IndicatorStyle } from './Carousel'

export { default as MediaUpload } from './MediaUpload'
export type { MediaUploadProps, UploadFile } from './MediaUpload'

export { default as Skeleton, SkeletonBlock, TextSkeleton, CardSkeleton } from './Skeleton'
export type { SkeletonProps, SkeletonVariant, AnimationMode } from './Skeleton'

export { default as RichText, parseMarkdown } from './RichText'
export type { RichTextProps, RichTextBlock, BlockType, CalloutType } from './RichText'

export { default as FeedLayout } from './FeedLayout'
export type { FeedLayoutProps } from './FeedLayout'
