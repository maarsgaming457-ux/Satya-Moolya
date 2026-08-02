import { Suspense } from "react"
import { notFound } from "next/navigation"
import { marketplaceApi } from "@/services/marketplace.api"
import { DetailedMarketplaceProduct } from "@/types/marketplace"
import { ImageGallery } from "@/components/marketplace/details/ImageGallery"
import { SpecificationTable } from "@/components/marketplace/details/SpecificationTable"
import { InspectionSummaryCard } from "@/components/marketplace/details/InspectionSummaryCard"
import { ConditionGrid } from "@/components/marketplace/details/ConditionGrid"
import { PriceCard } from "@/components/marketplace/details/PriceCard"
import { SellerCard } from "@/components/marketplace/details/SellerCard"
import { ActionPanel } from "@/components/marketplace/details/ActionPanel"
import { RelatedProductsCarousel } from "@/components/marketplace/details/RelatedProductsCarousel"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export default async function ProductDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const product: DetailedMarketplaceProduct | null = await marketplaceApi.getProductById(params.id)

  if (!product) {
    notFound()
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-8 animate-in fade-in duration-500">
      
      {/* Back Navigation */}
      <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-6 group">
        <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </div>
        Back to Marketplace
      </Link>

      {/* Main 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Left Column: Image Gallery (4 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
          <ImageGallery images={product.galleryImages} alt={`${product.brand} ${product.model}`} />
        </div>

        {/* Center Column: Product Info & AI Inspection (4 cols) */}
        <div className="lg:col-span-7 xl:col-span-5 flex flex-col gap-8">
          
          {/* Header Info */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{product.brand}</span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{product.category || 'Smartphone'}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-heading font-extrabold tracking-tight mb-2">
              {product.brand} {product.model}
            </h1>
            <p className="text-lg text-muted-foreground font-medium">
              {product.storage} • {product.color}
            </p>
          </div>

          <SpecificationTable product={product} />

          <div className="border-t border-border/40 pt-8">
            <h2 className="text-2xl font-bold tracking-tight mb-6 flex items-center gap-2">
              AI Inspection Report
            </h2>
            <InspectionSummaryCard summary={product.inspectionSummary} isVerified={product.isVerified || false} score={product.trustScore || 0} />
          </div>

          <div className="border-t border-border/40 pt-8">
            <h3 className="text-xl font-bold tracking-tight mb-6">Condition Breakdown</h3>
            <ConditionGrid breakdown={product.conditionBreakdown} />
          </div>

        </div>

        {/* Right Column: Pricing, Seller & Actions (4 cols) */}
        <div className="lg:col-span-12 xl:col-span-3 flex flex-col gap-6 lg:sticky lg:top-24 h-fit">
          <PriceCard product={product} />
          <ActionPanel product={product} />
          <SellerCard seller={product.sellerInfo} location={product.location || "Online"} />
        </div>

      </div>

      {/* Related Products Carousel */}
      <div className="mt-20 pt-10 border-t border-border/40">
        <h2 className="text-2xl font-bold tracking-tight mb-6">Similar Verified Devices</h2>
        <Suspense fallback={<div className="h-64 bg-secondary/20 animate-pulse rounded-2xl" />}>
          <RelatedProductsCarousel productId={product.id} />
        </Suspense>
      </div>

    </div>
  )
}
