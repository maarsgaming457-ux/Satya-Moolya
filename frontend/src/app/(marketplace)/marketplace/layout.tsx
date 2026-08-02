import Link from "next/link"
import Image from "next/image"
import { SearchBar } from "@/components/marketplace/SearchBar"
import { Heart, ShoppingBag, User } from "lucide-react"

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-primary/20 selection:text-primary">
      {/* Marketplace Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="flex h-16 items-center px-4 md:px-8 gap-4 md:gap-8 max-w-[1600px] mx-auto">
          {/* Logo */}
          <Link href="/marketplace" className="flex items-center gap-3 shrink-0">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <Image src="/logo/symbol.svg" alt="Satya Moolya Logo" fill className="object-contain" priority />
            </div>
            <span className="font-heading font-bold text-lg tracking-tight hidden sm:block">Satya Moolya</span>
          </Link>

          {/* Search Bar - takes up remaining space on desktop */}
          <div className="flex-1 max-w-2xl hidden md:block">
            <SearchBar />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 md:gap-4 ml-auto">
            <Link href="/marketplace/wishlist" className="p-2 hover:bg-secondary rounded-full transition-colors relative">
              <Heart className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
            </Link>
            <Link href="/buyer/dashboard" className="p-2 hover:bg-secondary rounded-full transition-colors hidden sm:block">
              <User className="w-5 h-5" />
            </Link>
            <Link href="/marketplace/cart" className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full font-semibold hover:bg-primary/90 transition-colors">
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative">
        {children}
      </main>
    </div>
  )
}
