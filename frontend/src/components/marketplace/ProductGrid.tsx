import { MarketplaceProduct } from "@/types/marketplace"
import { ProductCard } from "./ProductCard"

export function ProductGrid({ initialProducts }: { initialProducts: MarketplaceProduct[] }) {
  if (!initialProducts || initialProducts.length === 0) {
    return (
      <div className="w-full py-20 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-secondary/50 rounded-full flex items-center justify-center mb-6">
          <span className="text-4xl">🔍</span>
        </div>
        <h3 className="text-xl font-bold mb-2">No products found</h3>
        <p className="text-muted-foreground max-w-sm">
          We couldn't find any verified devices matching your current filters. Try adjusting them.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {initialProducts.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
