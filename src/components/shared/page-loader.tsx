export default function PageLoader() {
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ background: "#FFF5F8" }}
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className="flex size-14 animate-spin items-center justify-center rounded-full"
          style={{
            background: "linear-gradient(135deg, #EDD060 0%, #D4AF37 100%)",
            boxShadow: "0 4px 20px rgba(212,175,55,0.35)",
          }}
        >
          <svg viewBox="0 0 24 24" className="size-7 text-white" fill="currentColor">
            <path d="M11.5 2C8.46 2 5.86 3.6 4.38 6H3V2H1v6h6V6H4.73C5.96 4.17 8.1 3 10.5 3c3.31 0 6 2.69 6 6s-2.69 6-6 6c-1.78 0-3.38-.78-4.5-2H8.5v-2h-6v6h2v-3.62C6.12 17.17 8.18 18.5 10.5 18.5c4.14 0 7.5-3.36 7.5-7.5S15.64 2 11.5 2zm.5 5v5l4.28 2.54.72-1.21-3.5-2.08V7H12z"/>
          </svg>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div
            className="h-3 w-40 animate-pulse rounded-full"
            style={{ background: "rgba(212,175,55,0.25)" }}
          />
          <div
            className="h-2.5 w-28 animate-pulse rounded-full"
            style={{ background: "rgba(212,175,55,0.15)" }}
          />
        </div>
      </div>
    </div>
  );
}
