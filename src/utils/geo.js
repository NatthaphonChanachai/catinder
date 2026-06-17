export function getCurrentPosition(options = { enableHighAccuracy: false, timeout: 8000 }) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) { reject(new Error('Geolocation not supported')); return }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      reject,
      options,
    )
  })
}

export function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export async function searchAddress(query) {
  if (!query?.trim()) return []
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&countrycodes=th&q=${encodeURIComponent(query)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Search failed')
  const data = await res.json()
  return data.map(d => ({ lat: Number(d.lat), lng: Number(d.lon), label: d.display_name }))
}

export async function reverseGeocode(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Reverse geocode failed')
  const data = await res.json()
  return data.display_name || ''
}
