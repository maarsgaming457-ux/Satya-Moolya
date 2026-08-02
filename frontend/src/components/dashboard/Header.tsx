"use client"
import { Bell, Search, Menu } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Sidebar } from "./Sidebar"

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-20 shrink-0 items-center justify-between border-b border-border/40 bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 px-6 sm:px-10">
      <div className="flex items-center gap-4">
        {/* Mobile Sidebar Trigger */}
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="md:-ml-3 text-muted-foreground hover:text-foreground" />}>
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 border-r-0">
              <Sidebar className="w-full h-full flex" />
            </SheetContent>
          </Sheet>
        </div>
        
        <div className="flex flex-col">
          <h1 className="text-xl font-bold tracking-tight text-foreground">Good Morning, Seller</h1>
          <p className="text-xs font-semibold text-muted-foreground">Welcome back to Satya Moolya.</p>
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <div className="hidden relative w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search devices, reports, or listings..." 
            className="w-full bg-secondary/30 pl-10 rounded-full border-border/40 focus-visible:ring-1 focus-visible:ring-primary shadow-sm"
          />
        </div>
        
        <Button variant="outline" size="icon" className="rounded-full relative border-border/50 shadow-sm bg-card hover:bg-accent/10 hover:text-accent hover:border-accent/30 transition-colors">
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive border-2 border-background" />
        </Button>
        
        <div className="h-8 w-px bg-border/50 hidden md:block" />
        
        <Avatar className="h-10 w-10 border border-border/60 shadow-sm cursor-pointer hover:ring-2 ring-primary/20 transition-all">
          <AvatarImage src="" alt="User" />
          <AvatarFallback className="bg-primary/10 text-primary font-bold">SM</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
