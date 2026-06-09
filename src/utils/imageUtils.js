import heic2any from 'heic2any'

export const ACCEPT_IMAGE_TYPES = 'image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif,image/gif,image/bmp,image/tiff'

export async function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export async function prepareImage(file, maxPx = 1000) {
  let workFile = file

  // Convert HEIC/HEIF → JPEG (iPhone photos)
  const isHeic = file.type === 'image/heic' || file.type === 'image/heif'
    || /\.(heic|heif)$/i.test(file.name)
  if (isHeic) {
    try {
      const converted = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 })
      workFile = Array.isArray(converted) ? converted[0] : converted
    } catch {
      // fall through — browser may still handle it
    }
  }

  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(workFile)

    const timeout = setTimeout(() => {
      URL.revokeObjectURL(url)
      reject(new Error('timeout'))
    }, 20000)

    img.onload = () => {
      clearTimeout(timeout)
      const scale = Math.min(maxPx / img.width, maxPx / img.height, 1)
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      canvas.getContext('2d').drawImage(img, 0, 0, w, h)
      URL.revokeObjectURL(url)
      canvas.toBlob(blob => {
        if (blob) resolve(blob)
        else reject(new Error('toBlob failed'))
      }, 'image/jpeg', 0.88)
    }

    img.onerror = () => {
      clearTimeout(timeout)
      URL.revokeObjectURL(url)
      // Canvas can't decode this format — upload original as-is
      resolve(workFile)
    }

    img.src = url
  })
}
