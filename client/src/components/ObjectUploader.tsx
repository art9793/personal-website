import { useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import Uppy from "@uppy/core";
import type { UploadResult } from "@uppy/core";
import AwsS3 from "@uppy/aws-s3";
import { Button } from "@/components/ui/button";
import { Upload, X, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ObjectUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  onGetUploadParameters: () => Promise<{
    method: "PUT";
    url: string;
    objectPath?: string;
  }>;
  onComplete?: (
    result: UploadResult<Record<string, unknown>, Record<string, unknown>>
  ) => void;
  buttonClassName?: string;
  children: ReactNode;
}

export function ObjectUploader({
  maxNumberOfFiles = 1,
  maxFileSize = 10485760,
  onGetUploadParameters,
  onComplete,
  buttonClassName,
  children,
}: ObjectUploaderProps) {
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uppyRef = useRef<Uppy | null>(null);
  const { toast } = useToast();

  // Initialize Uppy when modal opens
  useEffect(() => {
    if (!showModal) return;

    const uppyInstance = new Uppy({
      restrictions: {
        maxNumberOfFiles,
        maxFileSize,
        allowedFileTypes: ['image/*'],
      },
      autoProceed: false,
    })
      .use(AwsS3, {
        shouldUseMultipart: false,
        getUploadParameters: async (file) => {
          const params = await onGetUploadParameters();
          
          // Merge objectPath into file metadata if provided
          if (params.objectPath) {
            const currentFile = uppyInstance.getFile(file.id);
            uppyInstance.setFileMeta(file.id, {
              ...(currentFile?.meta || {}),
              objectPath: params.objectPath
            });
          }
          
          return {
            method: params.method,
            url: params.url,
          };
        },
      })
      .on("upload-progress", (file, progress) => {
        if (progress.bytesTotal) {
          setUploadProgress((progress.bytesUploaded / progress.bytesTotal) * 100);
        }
      })
      .on("complete", (result) => {
        setIsUploading(false);
        setUploadProgress(0);
        onComplete?.(result);
        handleClose();
      })
      .on("error", (error) => {
        console.error("Upload error:", error);
        setIsUploading(false);
        setUploadProgress(0);
      });
    
    uppyRef.current = uppyInstance;

    // Cleanup when modal closes
    return () => {
      if (uppyRef.current) {
        uppyRef.current.cancelAll();
        // TypeScript workaround: close() exists but type definition may be incomplete
        (uppyRef.current as any).close?.();
        uppyRef.current = null;
      }
    };
  }, [showModal, maxNumberOfFiles, maxFileSize, onGetUploadParameters, onComplete]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxFileSize) {
      toast({
        title: "File too large",
        description: `File size must be less than ${Math.round(maxFileSize / 1024 / 1024)}MB`,
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !uppyRef.current) return;

    setIsUploading(true);
    
    try {
      // Clear any existing files before adding new one (handles retry scenarios)
      const existingFiles = uppyRef.current.getFiles();
      existingFiles.forEach(file => uppyRef.current?.removeFile(file.id));
      
      uppyRef.current.addFile({
        name: selectedFile.name,
        type: selectedFile.type,
        data: selectedFile,
      });

      await uppyRef.current.upload();
    } catch (error) {
      console.error("Upload failed:", error);
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadProgress(0);
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (file.size > maxFileSize) {
      toast({
        title: "File too large",
        description: `File size must be less than ${Math.round(maxFileSize / 1024 / 1024)}MB`,
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <Button onClick={() => setShowModal(true)} className={buttonClassName} data-testid="button-upload-image">
        {children}
      </Button>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-md w-full bg-background border border-border/50 rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-border/50">
              <h3 className="text-lg font-semibold">Upload Image</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleClose}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Upload Area */}
              <div
                onClick={() => !isUploading && fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={cn(
                  "relative border-2 border-dashed rounded-lg transition-all cursor-pointer overflow-hidden",
                  selectedFile
                    ? "border-primary/50 bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-muted/30",
                  isUploading && "pointer-events-none opacity-60"
                )}
              >
                {previewUrl ? (
                  <div className="aspect-[4/3] relative">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {isUploading && (
                      <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                        <div className="text-center space-y-2">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                          <p className="text-sm text-muted-foreground">{Math.round(uploadProgress)}%</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-[4/3] flex flex-col items-center justify-center gap-3 py-8">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">
                        Drop your image here or click to browse
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        JPG, PNG or GIF • Max {Math.round(maxFileSize / 1024 / 1024)}MB
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Actions */}
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isUploading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading}
                  className="flex-1 gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Upload
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
