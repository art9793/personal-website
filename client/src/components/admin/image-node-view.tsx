import { NodeViewWrapper } from '@tiptap/react'
import { Node as ProseMirrorNode } from '@tiptap/pm/model'
import { ImageResizer } from './image-resizer'
import { ImageToolbar } from './image-toolbar'
import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { uploadImage, isImageFile } from '@/lib/image-upload'
import { useToast } from '@/hooks/use-toast'

interface ImageNodeViewProps {
  node: ProseMirrorNode
  updateAttributes: (attrs: Record<string, any>) => void
  deleteNode: () => void
  selected: boolean
  editor: any
}

export function ImageNodeViewComponent({
  node,
  updateAttributes,
  deleteNode,
  selected,
  editor,
}: ImageNodeViewProps) {
  const [isResizing, setIsResizing] = useState(false)
  const [showToolbar, setShowToolbar] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)
  const { toast } = useToast()

  const { src, alt, width, height, align, caption } = node.attrs

  useEffect(() => {
    setShowToolbar(selected && !isResizing)
  }, [selected, isResizing])

  const handleReplace = async (file: File) => {
    if (!isImageFile(file)) {
      toast({
        title: 'Invalid file',
        description: 'Please select an image file',
        variant: 'destructive',
      })
      return
    }

    try {
      const { objectPath } = await uploadImage(file)
      updateAttributes({ src: objectPath })
    } catch (error) {
      console.error('Error replacing image:', error)
      toast({
        title: 'Upload failed',
        description: 'Failed to replace image. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const alignmentClasses = {
    left: 'ml-0 mr-auto',
    center: 'mx-auto',
    right: 'ml-auto mr-0',
    'full-width': 'w-full',
  }

  const containerClass = cn(
    'relative my-6 group',
    align === 'full-width' ? 'w-full' : 'max-w-full',
    alignmentClasses[align as keyof typeof alignmentClasses] || alignmentClasses.center
  )

  return (
    <NodeViewWrapper className={containerClass} data-type="image" data-align={align}>
      <div className="relative inline-block max-w-full">
        <ImageResizer
          width={width}
          height={height}
          src={src}
          alt={alt || ''}
          isSelected={selected}
          isResizing={isResizing}
          onResizeStart={() => setIsResizing(true)}
          onResizeEnd={(newWidth, newHeight) => {
            setIsResizing(false)
            updateAttributes({
              width: newWidth,
              height: newHeight,
            })
          }}
          imageRef={imageRef}
        />
        {showToolbar && (
          <ImageToolbar
            node={node}
            editor={editor}
            onReplace={handleReplace}
            onUpdateAttributes={updateAttributes}
            onDelete={deleteNode}
          />
        )}
      </div>
      {caption && (
        <div className="mt-2 text-sm text-muted-foreground text-center italic" data-caption>
          {caption}
        </div>
      )}
    </NodeViewWrapper>
  )
}
