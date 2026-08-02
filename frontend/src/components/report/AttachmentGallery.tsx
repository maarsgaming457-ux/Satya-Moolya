import { Image as ImageIcon } from "lucide-react"

export function AttachmentGallery({ attachments }: { attachments: string[] }) {
  if (!attachments || attachments.length === 0) return null

  return (
    <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm">
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
        <ImageIcon className="w-5 h-5 text-muted-foreground" />
        Captured Attachments
      </h3>
      
      <div className="grid grid-cols-2 gap-3">
        {attachments.map((url, idx) => (
          <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-secondary/50 border border-border/50 group cursor-pointer">
            <img 
              src={url} 
              alt={`Attachment ${idx + 1}`} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
              <span className="bg-black/60 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                View Full
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
