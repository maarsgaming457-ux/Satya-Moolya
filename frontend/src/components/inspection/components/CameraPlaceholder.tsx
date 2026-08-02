export function CameraPlaceholder() {
  return (
    <div className="absolute inset-0 bg-zinc-950 flex items-center justify-center overflow-hidden">
      {/* Simulated camera noise/grain */}
      <div 
        className="absolute inset-0 opacity-10 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Simulated camera feed gradient */}
      <div className="absolute inset-0 bg-gradient-to-tr from-zinc-900 to-zinc-800 opacity-50" />
      
      <p className="relative z-10 text-zinc-500 font-mono text-sm uppercase tracking-widest">
        Camera Feed Active
      </p>
    </div>
  )
}
