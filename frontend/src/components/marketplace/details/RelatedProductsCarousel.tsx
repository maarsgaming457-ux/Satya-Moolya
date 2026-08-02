import { marketplaceApi } from "@/services/marketplace.api"
import { ProductCard } from "@/components/marketplace/ProductCard"

export async function RelatedProductsCarousel({ productId }: { productId: string }) {
  const related = await marketplaceApi.getRelatedProducts(productId)

  if (!related || related.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {related.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
