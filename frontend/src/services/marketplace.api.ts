import { MarketplaceProduct, MarketplaceFilterState, SortOption, DetailedMarketplaceProduct } from "@/types/marketplace"
import { apiClient } from "@/lib/api-client"

export const marketplaceApi = {
  createListing: async (deviceId: string, price: number, description: string): Promise<MarketplaceProduct> => {
    const response = await apiClient.post("/marketplace", { device_id: deviceId, price, description })
    return response.data
  },

  removeListing: async (id: string): Promise<void> => {
    await apiClient.delete(`/marketplace/${id}`)
  },

  getProducts: async (
    filters?: Partial<MarketplaceFilterState>,
    sort?: SortOption,
    searchQuery?: string
  ): Promise<MarketplaceProduct[]> => {
    const response = await apiClient.get("/marketplace")
    let results: MarketplaceProduct[] = response.data

    // Frontend-only filtering (since backend doesn't support query params)
    if (filters?.minPrice !== undefined && filters.minPrice !== null) {
      results = results.filter(p => p.price >= filters.minPrice!)
    }
    if (filters?.maxPrice !== undefined && filters.maxPrice !== null) {
      results = results.filter(p => p.price <= filters.maxPrice!)
    }

    // Frontend-only sorting
    if (sort === "price_asc") results.sort((a, b) => a.price - b.price)
    if (sort === "price_desc") results.sort((a, b) => b.price - a.price)
    if (sort === "newest") {
      results.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
    }

    return results
  },

  getCategories: async (): Promise<string[]> => {
    // Backend doesn't provide this, mock it or use static list
    return ["Smartphones", "Tablets", "Laptops", "Smartwatches", "Accessories"]
  },

  getProductById: async (id: string): Promise<DetailedMarketplaceProduct> => {
    const response = await apiClient.get(`/marketplace/${id}`)
    const product = response.data
    
    // Merge backend data with required DetailedMarketplaceProduct fields (mocked)
    return {
      ...product,
      galleryImages: [],
      sellerInfo: {
        name: "Anonymous Seller",
        memberSince: "N/A",
        salesCount: 0,
        responseTime: "N/A",
        isVerified: false
      },
      inspectionSummary: {
        confidenceScore: 0,
        date: product.created_at,
        summary: "No inspection details available."
      },
      conditionBreakdown: {
        display: { status: "Not Tested" },
        frame: { status: "Not Tested" },
        backPanel: { status: "Not Tested" },
        camera: { status: "Not Tested" },
        chargingPort: { status: "Not Tested" },
        buttons: { status: "Not Tested" },
        speaker: { status: "Not Tested" },
        microphone: { status: "Not Tested" },
        battery: { status: "Not Tested" },
        accessories: { status: "Not Tested" }
      }
    }
  },

  getRelatedProducts: async (id: string): Promise<MarketplaceProduct[]> => {
    try {
      const response = await apiClient.get("/marketplace")
      return response.data.filter((p: MarketplaceProduct) => p.id !== id).slice(0, 4)
    } catch {
      return []
    }
  },

  addToWishlist: async (id: string): Promise<boolean> => {
    return new Promise((resolve) => setTimeout(() => resolve(true), 300))
  },

  shareProduct: async (id: string): Promise<boolean> => {
    return new Promise((resolve) => setTimeout(() => resolve(true), 300))
  }
}
