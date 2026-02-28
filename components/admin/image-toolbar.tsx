import { useState, useEffect, useRef } from 'react'
import { Node as ProseMirrorNode } from '@tiptap/pm/model'
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize2,
  Trash2,
  Image as ImageIcon,
  Type,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface ImageToolbarProps {
  node: ProseMirrorNode
  editor: any
  onReplace: (file: File) => void
  onUpdateAttributes: (attrs: Record<string, any>) => void
  onDelete: () => void
}

export function ImageToolbar({
  node,
  editor,
  onReplace,
  onUpdateAttributes,
  onDelete,
}: ImageToolbarProps) {
  const [showCaptionInput, setShowCaptionInput] = useState(false)
  const [caption, setCaption] = useState(node.attrs.caption || '')
  const captionInputRef = useRef<HTMLInputElement>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)

  const currentAlign = node.attrs.align || 'center'

  useEffect(() => {
    if (showCaptionInput && captionInputRef.current) {
      captionInputRef.current.focus()
    }
  }, [showCaptionInput])

  const handleAlignChange = (align: 'left' | 'center' | 'right' | 'full-width') => {
    onUpdateAttributes({ align })
  }

  const handleCaptionSubmit = () => {
    onUpdateAttributes({ caption: caption.trim() || null })
    setShowCaptionInput(false)
  }

  const handleCaptionCancel = () => {
    setCaption(node.attrs.caption || '')
    setShowCaptionInput(false)
  }

  const handleReplaceClick = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        onReplace(file)
      }
    }
    input.click()
  }

  // Position toolbar above the image - simplified positioning
  useEffect(() => {
    if (!toolbarRef.current || !showCaptionInput) return

    // Simple positioning - will be improved with proper node position tracking
    const rect = toolbarRef.current.getBoundingClientRect()
    if (rect.top < 0) {
      toolbarRef.current.style.top = 'auto'
      toolbarRef.current.style.bottom = '-50px'
    }
  }, [showCaptionInput])

  return (
    <div
      ref={toolbarRef}
      className="absolute -top-12 left-1/2 -translate-x-1/2 z-50 bg-background border border-border rounded-lg shadow-lg p-2 flex items-center gap-1"
    >
      {showCaptionInput ? (
        <div className="flex items-center gap-2">
          <Input
            ref={captionInputRef}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCaptionSubmit()
              } else if (e.key === 'Escape') {
                handleCaptionCancel()
              }
            }}
            placeholder="Add caption..."
            className="w-48 h-8 text-sm"
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCaptionSubmit}
            className="h-8"
          >
            <Type className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCaptionCancel}
            className="h-8"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleReplaceClick}
            className="h-8"
            title="Replace image"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleAlignChange('left')}
            className={cn('h-8', currentAlign === 'left' && 'bg-muted')}
            title="Align left"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleAlignChange('center')}
            className={cn('h-8', currentAlign === 'center' && 'bg-muted')}
            title="Align center"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleAlignChange('right')}
            className={cn('h-8', currentAlign === 'right' && 'bg-muted')}
            title="Align right"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleAlignChange('full-width')}
            className={cn('h-8', currentAlign === 'full-width' && 'bg-muted')}
            title="Full width"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowCaptionInput(true)}
            className="h-8"
            title="Add caption"
          >
            <Type className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          <Button
            size="sm"
            variant="ghost"
            onClick={onDelete}
            className="h-8 text-destructive hover:text-destructive"
            title="Delete image"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  )
}

