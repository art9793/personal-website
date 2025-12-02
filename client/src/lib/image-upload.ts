/**
 * Image upload utility for handling image uploads to object storage
 * Supports progress tracking and multiple upload methods
 */

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export interface UploadOptions {
  onProgress?: (progress: UploadProgress) => void
}

export interface UploadResult {
  objectPath: string
  uploadURL: string
}

/**
 * Uploads an image file to object storage
 * @param file - The image file to upload
 * @param options - Optional progress callback
 * @returns Promise resolving to the normalized object path
 */
export async function uploadImage(
  file: File,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const { onProgress } = options

  try {
    // Step 1: Get presigned upload URL from server
    const uploadResponse = await fetch('/api/objects/upload', {
      method: 'POST',
      credentials: 'include',
    })
    if (!uploadResponse.ok) {
      throw new Error('Failed to get upload URL')
    }
    const { uploadURL } = await uploadResponse.json()

    // Step 2: Upload file to object storage with progress tracking
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress({
            loaded: e.loaded,
            total: e.total,
            percentage: Math.round((e.loaded / e.total) * 100),
          })
        }
      })

      xhr.addEventListener('load', async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            // Step 3: Set ACL policy and get normalized path
            const aclResponse = await fetch('/api/article-images', {
              method: 'PUT',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ imageURL: uploadURL }),
            })
            if (!aclResponse.ok) {
              throw new Error('Failed to set image permissions')
            }
            const { objectPath } = await aclResponse.json()

            resolve({ objectPath, uploadURL })
          } catch (error) {
            reject(error)
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`))
        }
      })

      xhr.addEventListener('error', () => {
        reject(new Error('Failed to upload image'))
      })

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload aborted'))
      })

      xhr.open('PUT', uploadURL)
      xhr.setRequestHeader('Content-Type', file.type)
      xhr.send(file)
    })
  } catch (error) {
    console.error('Error uploading image:', error)
    throw error
  }
}

/**
 * Converts a data URL to a File object
 * @param dataURL - The data URL string
 * @param filename - Optional filename (defaults to 'image.png')
 * @returns File object
 */
export function dataURLtoFile(dataURL: string, filename: string = 'image.png'): File {
  const arr = dataURL.split(',')
  const mimeMatch = arr[0].match(/:(.*?);/)
  const mime = mimeMatch ? mimeMatch[1] : 'image/png'
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, { type: mime })
}

/**
 * Validates if a file is an image
 * @param file - The file to validate
 * @returns True if file is an image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/')
}

/**
 * Gets image dimensions from a file
 * @param file - The image file
 * @returns Promise resolving to width and height
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
    }
    
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }
    
    img.src = url
  })
}

