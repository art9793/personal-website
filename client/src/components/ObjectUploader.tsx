import { useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import Uppy from "@uppy/core";
import type { UploadResult } from "@uppy/core";
import AwsS3 from "@uppy/aws-s3";
import Dashboard from "@uppy/dashboard";
import "@uppy/core/css/style.css";
import "@uppy/dashboard/css/style.css";
import { Button } from "@/components/ui/button";

interface ObjectUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  onGetUploadParameters: () => Promise<{
    method: "PUT";
    url: string;
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
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [uppy] = useState(() => {
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
        getUploadParameters: onGetUploadParameters,
      })
      .on("complete", (result) => {
        onComplete?.(result);
        setShowModal(false);
      });
    
    return uppyInstance;
  });

  useEffect(() => {
    if (showModal && dashboardRef.current) {
      uppy.use(Dashboard, {
        target: dashboardRef.current,
        inline: true,
        proudlyDisplayPoweredByUppy: false,
      });
    }

    return () => {
      if (uppy.getPlugin('Dashboard')) {
        uppy.removePlugin(uppy.getPlugin('Dashboard')!);
      }
    };
  }, [showModal, uppy]);

  return (
    <div>
      <Button onClick={() => setShowModal(true)} className={buttonClassName} data-testid="button-upload-image">
        {children}
      </Button>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-3xl w-full bg-background border rounded-lg overflow-hidden">
            <div className="flex justify-between items-center px-6 pt-4 pb-2">
              <h3 className="text-lg font-semibold">Upload Profile Picture</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowModal(false)}
              >
                Close
              </Button>
            </div>
            <div ref={dashboardRef}></div>
          </div>
        </div>
      )}
    </div>
  );
}
