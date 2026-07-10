export default function PawBackground({ opacity = 0.07 }) {
  return (
    <svg
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity, pointerEvents: 'none', zIndex: -1 }}
      aria-hidden="true"
    >
      <defs>
        <pattern id="paw-bg" x="0" y="0" width="90" height="90" patternUnits="userSpaceOnUse">
          <text x="22" y="55" fontSize="32" fill="#F97316">🐾</text>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#paw-bg)" />
    </svg>
  )
}
