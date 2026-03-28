import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      {/* CTA Section */}
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl text-balance">
            Ready to simplify your group travel?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Tell us where you&apos;re going and let us handle the rest.
          </p>
          <div className="mt-8">
            <Button size="lg" className="rounded-full px-8 group">
              Plan my trip
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Footer Links */}
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-foreground">GroupRide</span>
            </div>
            
            <nav className="flex gap-6">
              <Link 
                href="#book" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Book
              </Link>
              <Link 
                href="#how-it-works" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                How it works
              </Link>
              <Link 
                href="#" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy
              </Link>
              <Link 
                href="#" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms
              </Link>
            </nav>
            
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} GroupRide. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
