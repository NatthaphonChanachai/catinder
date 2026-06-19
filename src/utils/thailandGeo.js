let provincesPromise = null

// Lazy-loaded so the ~600KB dataset is only fetched when a hotel location picker is opened.
export function loadProvinces() {
  if (!provincesPromise) {
    provincesPromise = import('../data/thailand-geo.json').then(m => m.default)
  }
  return provincesPromise
}
