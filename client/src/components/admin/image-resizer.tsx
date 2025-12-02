import { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { GripVertical } from 'lucide-react'

interface ImageResizerProps {
  width: number | null
  height: number | null
  src: string
  alt: string
  isSelected: boolean
  isResizing: boolean
  onResizeStart: () => void
  onResizeEnd: (width: number, height: number) => void
  imageRef?: React.RefObject<HTMLImageElement>
}

type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w'

export function ImageResizer({
  width,
  height,
  src,
  alt,
  isSelected,
  isResizing,
  onResizeStart,
  onResizeEnd,
  imageRef,
}: ImageResizerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null)
  const [currentSize, setCurrentSize] = useState<{ width: number; height: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [activeHandle, setActiveHandle] = useState<ResizeHandle | null>(null)
  const startPosRef = useRef<{ x: number; y: number } | null>(null)
  const startSizeRef = useRef<{ width: number; height: number } | null>(null)

  // Load image to get natural dimensions
  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      const naturalWidth = img.naturalWidth
      const naturalHeight = img.naturalHeight
      setImageDimensions({ width: naturalWidth, height: naturalHeight })
      
      // Set initial size if not provided
      if (!width || !height) {
        // Default to natural size, but constrain to max width of 800px
        const maxWidth = 800
        const aspectRatio = naturalWidth / naturalHeight
        let initialWidth = naturalWidth
        let initialHeight = naturalHeight
        
        if (initialWidth > maxWidth) {
          initialWidth = maxWidth
          initialHeight = maxWidth / aspectRatio
        }
        
        setCurrentSize({ width: initialWidth, height: initialHeight })
      } else {
        setCurrentSize({ width, height })
      }
    }
    img.src = src
  }, [src, width, height])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, handle: ResizeHandle) => {
      e.preventDefault()
      e.stopPropagation()
      
      if (!currentSize || !containerRef.current) return

      setIsDragging(true)
      setActiveHandle(handle)
      onResizeStart()
      
      const rect = containerRef.current.getBoundingClientRect()
      startPosRef.current = {
        x: e.clientX,
        y: e.clientY,
      }
      startSizeRef.current = {
        width: currentSize.width,
        height: currentSize.height,
      }
    },
    [currentSize, onResizeStart]
  )

  useEffect(() => {
    if (!isDragging || !activeHandle || !startPosRef.current || !startSizeRef.current || !imageDimensions) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || !imageDimensions) return

      const deltaX = e.clientX - startPosRef.current!.x
      const deltaY = e.clientY - startPosRef.current!.y

      const aspectRatio = imageDimensions.width / imageDimensions.height
      let newWidth = startSizeRef.current.width
      let newHeight = startSizeRef.current.height

      // Calculate new size based on handle
      switch (activeHandle) {
        case 'se': // Bottom-right
          newWidth = Math.max(100, startSizeRef.current.width + deltaX)
          newHeight = newWidth / aspectRatio
          break
        case 'sw': // Bottom-left
          newWidth = Math.max(100, startSizeRef.current.width - deltaX)
          newHeight = newWidth / aspectRatio
          break
        case 'ne': // Top-right
          newWidth = Math.max(100, startSizeRef.current.width + deltaX)
          newHeight = newWidth / aspectRatio
          break
        case 'nw': // Top-left
          newWidth = Math.max(100, startSizeRef.current.width - deltaX)
          newHeight = newWidth / aspectRatio
          break
        case 'e': // Right
          newWidth = Math.max(100, startSizeRef.current.width + deltaX)
          newHeight = newWidth / aspectRatio
          break
        case 'w': // Left
          newWidth = Math.max(100, startSizeRef.current.width - deltaX)
          newHeight = newWidth / aspectRatio
          break
        case 's': // Bottom
          newHeight = Math.max(100, startSizeRef.current.height + deltaY)
          newWidth = newHeight * aspectRatio
          break
        case 'n': // Top
          newHeight = Math.max(100, startSizeRef.current.height - deltaY)
          newWidth = newHeight * aspectRatio
          break
      }

      // Constrain to max width (editor width)
      const maxWidth = 1200
      if (newWidth > maxWidth) {
        newWidth = maxWidth
        newHeight = maxWidth / aspectRatio
      }

      setCurrentSize({ width: newWidth, height: newHeight })
    }

    const handleMouseUp = () => {
      if (currentSize) {
        onResizeEnd(currentSize.width, currentSize.height)
      }
      setIsDragging(false)
      setActiveHandle(null)
      startPosRef.current = null
      startSizeRef.current = null
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, activeHandle, imageDimensions, currentSize, onResizeEnd])

  if (!currentSize) {
    return (
      <div className="relative inline-block">
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className="max-w-full h-auto"
          style={{ width: width || 'auto', height: height || 'auto' }}
        />
      </div>
    )
  }

  const handlePositions: Record<ResizeHandle, string> = {
    nw: 'top-0 left-0 cursor-nw-resize',
    ne: 'top-0 right-0 cursor-ne-resize',
    sw: 'bottom-0 left-0 cursor-sw-resize',
    se: 'bottom-0 right-0 cursor-se-resize',
    n: 'top-0 left-1/2 -translate-x-1/2 cursor-n-resize',
    s: 'bottom-0 left-1/2 -translate-x-1/2 cursor-s-resize',
    e: 'top-1/2 right-0 -translate-y-1/2 cursor-e-resize',
    w: 'top-1/2 left-0 -translate-y-1/2 cursor-w-resize',
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative inline-block',
        isSelected && 'ring-2 ring-primary ring-offset-2'
      )}
      style={{
        width: currentSize.width,
        height: currentSize.height,
      }}
    >
      <img
        ref={imageRef || imgRef}
        src={src}
        alt={alt}
        className="block w-full h-full object-contain"
        draggable={false}
        style={{
          width: currentSize.width,
          height: currentSize.height,
        }}
      />
      {isSelected && (
        <>
          {/* Corner handles */}
          {(['nw', 'ne', 'sw', 'se'] as ResizeHandle[]).map((handle) => (
            <div
              key={handle}
              className={cn(
                'absolute w-3 h-3 bg-primary border-2 border-background rounded-full z-10',
                handlePositions[handle],
                isDragging && activeHandle === handle && 'bg-primary/80'
              )}
              onMouseDown={(e) => handleMouseDown(e, handle)}
            />
          ))}
          {/* Edge handles */}
          {(['n', 's', 'e', 'w'] as ResizeHandle[]).map((handle) => (
            <div
              key={handle}
              className={cn(
                'absolute z-10',
                handle === 'n' || handle === 's' ? 'w-8 h-1' : 'h-8 w-1',
                handlePositions[handle],
                'bg-primary/50 hover:bg-primary border border-background rounded'
              )}
              onMouseDown={(e) => handleMouseDown(e, handle)}
            />
          ))}
        </>
      )}
    </div>
  )
}

