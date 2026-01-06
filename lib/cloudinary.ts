// Cloudinary upload utilities

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

interface UploadResponse {
  secure_url: string
  public_id: string
  duration?: number
  width: number
  height: number
  format: string
}

interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

/**
 * Upload a video blob to Cloudinary using unsigned upload
 * This requires setting up an unsigned upload preset in Cloudinary dashboard
 */
export async function uploadVideo(
  blob: Blob,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResponse> {
  if (!CLOUD_NAME) {
    throw new Error('Cloudinary cloud name not configured')
  }

  const formData = new FormData()
  formData.append('file', blob)
  formData.append('upload_preset', 'vouchflow_videos') // Create this preset in Cloudinary dashboard
  formData.append('resource_type', 'video')
  formData.append('folder', 'vouchflow')

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress({
          loaded: e.loaded,
          total: e.total,
          percentage: Math.round((e.loaded / e.total) * 100)
        })
      }
    })

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText)
          resolve({
            secure_url: response.secure_url,
            public_id: response.public_id,
            duration: response.duration,
            width: response.width,
            height: response.height,
            format: response.format
          })
        } catch {
          reject(new Error('Failed to parse upload response'))
        }
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`))
      }
    })

    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'))
    })

    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`)
    xhr.send(formData)
  })
}

/**
 * Generate a thumbnail URL for a Cloudinary video
 */
export function getVideoThumbnail(publicId: string): string {
  if (!CLOUD_NAME) return ''
  return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/so_0,w_640,h_360,c_fill/${publicId}.jpg`
}

/**
 * Generate an optimized video URL
 */
export function getOptimizedVideoUrl(publicId: string): string {
  if (!CLOUD_NAME) return ''
  return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/q_auto,f_auto/${publicId}`
}
