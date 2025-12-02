import { useEffect, useState } from 'react'
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'

interface ImageUploadProgressProps {
  progress: number
  error?: string | null
  onComplete?: () => void
}

export function ImageUploadProgress({
  progress,
  error,
  onComplete,
}: ImageUploadProgressProps) {
  const [showComplete, setShowComplete] = useState(false)

  useEffect(() => {
    if (progress === 100 && !error) {
      setShowComplete(true)
      const timer = setTimeout(() => {
        onComplete?.()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [progress, error, onComplete])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-destructive rounded-lg bg-destructive/5">
        <AlertCircle className="h-8 w-8 text-destructive mb-2" />
        <p className="text-sm text-destructive font-medium">Upload failed</p>
        <p className="text-xs text-muted-foreground mt-1">{error}</p>
      </div>
    )
  }

  if (showComplete) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-primary/50 rounded-lg bg-primary/5">
        <CheckCircle2 className="h-8 w-8 text-primary mb-2" />
        <p className="text-sm text-primary font-medium">Upload complete</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-primary/50 rounded-lg bg-muted/30">
      <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
      <div className="w-full max-w-xs space-y-2">
        <Progress value={progress} className="h-2" />
        <p className="text-xs text-center text-muted-foreground">
          Uploading... {progress}%
        </p>
      </div>
    </div>
  )
}

