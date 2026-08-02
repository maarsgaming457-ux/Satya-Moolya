export function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="flex flex-col bg-card border border-border/60 rounded-2xl overflow-hidden">
          {/* Image skeleton */}
          <div className="w-full aspect-square bg-secondary/50" />
          
          {/* Content skeleton */}
          <div className="p-4 flex flex-col gap-3">
            <div className="w-3/4 h-5 bg-secondary rounded-md" />
            <div className="w-1/2 h-4 bg-secondary/50 rounded-md" />
            
            <div className="flex gap-2 mt-2">
              <div className="w-16 h-5 bg-secondary rounded-md" />
              <div className="w-20 h-5 bg-secondary rounded-md" />
            </div>
            
            <div className="mt-4 pt-4 border-t border-border/40 flex justify-between items-center">
              <div>
                <div className="w-24 h-6 bg-secondary rounded-md mb-1" />
                <div className="w-16 h-3 bg-secondary/50 rounded-md" />
              </div>
              <div className="w-20 h-9 bg-primary/20 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
