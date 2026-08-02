import { Suspense } from "react"
import { FilterSidebar } from "@/components/marketplace/FilterSidebar"
import { MobileFilterSheet } from "@/components/marketplace/MobileFilterSheet"
import { ProductGrid } from "@/components/marketplace/ProductGrid"
import { SortDropdown } from "@/components/marketplace/SortDropdown"
import { SearchBar } from "@/components/marketplace/SearchBar"
import { EmptyState } from "@/components/marketplace/EmptyState"
import { LoadingSkeleton } from "@/components/marketplace/LoadingSkeleton"
import { marketplaceApi } from "@/services/marketplace.api"
import { ShieldCheck, Tags } from "lucide-react"

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams
  
  // Parse filters
  const minPrice = resolvedParams.minPrice ? Number(resolvedParams.minPrice) : undefined
  const maxPrice = resolvedParams.maxPrice ? Number(resolvedParams.maxPrice) : undefined
  
  // Fetch initial data on the server
  const initialProducts = await marketplaceApi.getProducts(
    { minPrice, maxPrice },
    resolvedParams.sort as any,
    resolvedParams.q as string
  )
  
  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-6 md:py-8 animate-in fade-in duration-500">
      
      {/* Mobile Search Bar - Only visible on small screens */}
      <div className="md:hidden mb-6 relative z-40">
        <SearchBar />
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
        
        {/* Desktop Filter Sidebar */}
        <aside className="hidden md:block w-[280px] shrink-0 sticky top-24">
          <FilterSidebar />
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 w-full flex flex-col min-w-0">
          
          {/* Rich Header & Controls */}
          <div className="bg-secondary/30 border border-border/50 rounded-2xl p-6 mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            
            <div className="relative z-10">
              <h1 className="text-3xl font-heading font-extrabold tracking-tight mb-2">Verified Pre-Owned Electronics</h1>
              <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed mb-4">
                Every listing has completed an AI-powered inspection to help buyers make confident purchasing decisions.
              </p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm font-semibold">
                <span className="flex items-center gap-1.5 bg-background border border-border/60 px-3 py-1.5 rounded-full shadow-sm">
                  <Tags className="w-4 h-4 text-primary" />
                  {initialProducts.length} Listings
                </span>
                <span className="flex items-center gap-1.5 bg-background border border-border/60 px-3 py-1.5 rounded-full shadow-sm text-success">
                  <ShieldCheck className="w-4 h-4" />
                  {initialProducts.length} Verified Devices
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 relative z-10">
              <MobileFilterSheet />
              <SortDropdown />
            </div>
          </div>

          {/* Product Grid */}
          <Suspense fallback={<LoadingSkeleton />}>
            {initialProducts.length > 0 ? (
              <ProductGrid initialProducts={initialProducts} />
            ) : (
              <EmptyState />
            )}
          </Suspense>

        </div>
      </div>
    </div>
  )
}
