import { PageTransition } from "@/components/animations/PageTransition";
import { Fade } from "@/components/animations/Fade";
import { Slide } from "@/components/animations/Slide";
import { SMLogo } from "@/components/brand/SMLogo";
import { Button, buttonVariants } from "@/components/ui/button";
import { ArrowRight, Sparkles, ShieldCheck, Cpu, Handshake, CheckCircle2, TrendingUp } from "lucide-react";
import Link from "next/link";
import { HeroIllustration } from "@/components/animations/HeroIllustration";

export default function Home() {
  const steps = [
    { icon: <Cpu className="w-5 h-5" />, title: "Upload Device", desc: "Submit details for your OnePlus 12 or MacBook Air M4." },
    { icon: <Sparkles className="w-5 h-5" />, title: "AI Inspection", desc: "Proprietary AI analyzes hardware health and cosmetics." },
    { icon: <ShieldCheck className="w-5 h-5" />, title: "Trust Score", desc: "Receive an immutable report with a verified Trust Score." },
    { icon: <TrendingUp className="w-5 h-5" />, title: "Valuation", desc: "Get an accurate market price estimation in INR." },
    { icon: <CheckCircle2 className="w-5 h-5" />, title: "Marketplace", desc: "List instantly and securely to verified buyers." },
  ];

  return (
    <PageTransition className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground relative overflow-hidden">
      {/* Subtle Dot Pattern Background */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.08)_1px,transparent_1px)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[length:24px_24px] opacity-70 pointer-events-none" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-background/60 backdrop-blur-2xl border-b border-border/50">
        <div className="flex items-center gap-3">
          <SMLogo size="sm" />
          <span className="font-semibold tracking-tight text-lg">Satya Moolya</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className={buttonVariants({ variant: "ghost", className: "hidden sm:inline-flex text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" })}>
             Sign In
          </Link>
          <Link href="/marketplace" className={buttonVariants({ className: "rounded-full px-6 shadow-sm font-semibold" })}>
            Explore Market
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 pt-40 pb-24 px-6 flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto gap-12">
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left space-y-8">
          
          <div className="flex flex-col items-center md:items-start gap-6">
            <Fade delay={0} className="mb-2">
              <SMLogo variant="full" size="hero" />
            </Fade>
            
            <Slide direction="down" delay={0.1}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50 text-xs font-semibold tracking-wide text-muted-foreground shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                <span className="uppercase tracking-widest">AI-Powered Valuation</span>
              </div>
            </Slide>
          </div>
          
          <Fade delay={0.2} className="hidden md:block">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-[1.05] text-balance">
              Know the <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground">True Value.</span>
            </h1>
          </Fade>

          <Fade delay={0.3} className="max-w-xl text-lg text-muted-foreground font-medium text-balance leading-relaxed">
            The most secure marketplace for pre-owned electronics in India. 
            Every device is cryptographically verified and valued by AI before it reaches the market.
          </Fade>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
            <Link href="/register-device" className={buttonVariants({ size: "lg", className: "rounded-full h-12 px-8 text-base w-full sm:w-auto shadow-md font-semibold" })}>
              Start Selling
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
            <Link href="/reports/sample" className={buttonVariants({ variant: "outline", size: "lg", className: "rounded-full h-12 px-8 text-base bg-background/50 backdrop-blur-sm w-full sm:w-auto border-border hover:bg-secondary/60 font-medium" })}>
              See AI Report
            </Link>
          </div>
        </div>
        
        <div className="flex-1 w-full max-w-xl">
           <Fade delay={0.5}>
             <HeroIllustration />
           </Fade>
        </div>
      </main>

      {/* Storytelling Flow */}
      <section className="relative z-10 py-32 px-6 bg-secondary/30 border-y border-border/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-balance">Intelligence meets Commerce</h2>
            <p className="text-muted-foreground text-lg text-balance max-w-2xl mx-auto">A completely transparent, AI-driven process from listing to final purchase negotiation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 md:gap-4 relative">
            <div className="hidden md:block absolute top-8 left-16 right-16 h-[1px] bg-gradient-to-r from-transparent via-border to-transparent z-0" />
            
            {steps.map((step, i) => (
              <Slide key={i} direction="up" delay={0.1 * i} className="relative flex flex-col items-center text-center space-y-5">
                <div className="w-16 h-16 rounded-2xl bg-card border shadow-sm flex items-center justify-center text-primary z-10 transition-transform hover:scale-110 duration-300">
                  {step.icon}
                </div>
                <div className="max-w-[180px]">
                  <h3 className="font-semibold text-base mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </Slide>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-16 px-6 flex flex-col md:flex-row items-center justify-between text-muted-foreground text-sm max-w-7xl mx-auto border-t border-border/40 mt-12 gap-8">
        <div className="flex flex-col items-center md:items-start gap-6">
          <SMLogo variant="full" size="lg" className="w-48 opacity-80 hover:opacity-100 transition-opacity" />
          <span className="font-medium ml-2">© {new Date().getFullYear()} Satya Moolya. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-6 font-medium">
          <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
        </div>
      </footer>
    </PageTransition>
  );
}
