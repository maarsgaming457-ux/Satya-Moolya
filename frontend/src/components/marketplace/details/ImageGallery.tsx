"use client"
import { useState } from "react"
import Image from "next/image"
import { Maximize2, PackageX } from "lucide-react"

export function ImageGallery({ images, alt }: { images: string[], alt: string }) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [imageError, setImageError] = useState<Record<number, boolean>>({})

  const handleImageError = (index: number) => {
    setImageError(prev => ({ ...prev, [index]: true }))
  }

  const mainImage = images[selectedIndex]
  const isMainError = imageError[selectedIndex]

  return (
    <div className="flex flex-col gap-4 sticky top-24">
      {/* Main Image View */}
      <div className="relative aspect-[4/5] md:aspect-square lg:aspect-[4/5] bg-secondary/30 rounded-2xl overflow-hidden border border-border/50 group">
        
        {isMainError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground bg-secondary/20">
            <PackageX className="w-16 h-16 mb-4 opacity-20" />
            <span className="text-sm font-medium opacity-50">Image unavailable</span>
          </div>
        ) : (
          <>
            <Image 
              src={mainImage}
              alt={`${alt} view ${selectedIndex + 1}`}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
              priority
              onError={() => handleImageError(selectedIndex)}
            />
            {/* Fullscreen Button (Mock) */}
            <button className="absolute bottom-4 right-4 w-10 h-10 bg-background/80 backdrop-blur-md rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:scale-110 transition-all opacity-0 group-hover:opacity-100 shadow-sm border border-border/50">
              <Maximize2 className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 snap-x hide-scrollbar">
          {images.map((img, idx) => (
            <button 
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`relative w-20 h-24 shrink-0 rounded-xl overflow-hidden border-2 transition-all snap-start ${
                selectedIndex === idx 
                  ? "border-primary shadow-md shadow-primary/20 scale-105" 
                  : "border-transparent opacity-60 hover:opacity-100 hover:border-border"
              }`}
            >
              {imageError[idx] ? (
                <div className="w-full h-full bg-secondary/30 flex items-center justify-center">
                  <PackageX className="w-5 h-5 opacity-30 text-muted-foreground" />
                </div>
              ) : (
                <Image 
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  fill
                  className="object-cover"
                  onError={() => handleImageError(idx)}
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
