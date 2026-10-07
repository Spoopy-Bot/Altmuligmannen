/** Skalerer et bilde ned og returnerer en liten JPEG som data-URL, slik at det får plass i localStorage. */
export function lagMiniatyr(fil: File, maks = 480): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!fil.type.startsWith('image/')) {
      reject(new Error('Filen er ikke et bilde'))
      return
    }
    const url = URL.createObjectURL(fil)
    const img = new Image()
    img.onload = () => {
      const skala = Math.min(1, maks / Math.max(img.width, img.height))
      const lerret = document.createElement('canvas')
      lerret.width = Math.round(img.width * skala)
      lerret.height = Math.round(img.height * skala)
      lerret.getContext('2d')?.drawImage(img, 0, 0, lerret.width, lerret.height)
      URL.revokeObjectURL(url)
      resolve(lerret.toDataURL('image/jpeg', 0.72))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Bildet kunne ikke leses'))
    }
    img.src = url
  })
}
