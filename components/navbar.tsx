"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        scrolled ? 'bg-white/80 backdrop-blur border-b border-border shadow-sm' : 'bg-transparent'
      }`}
    >
      <nav className="flex items-center justify-between px-6 py-5 lg:px-12">
        <Link href="/" className="text-lg tracking-tight text-foreground lowercase">
          groupride
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors lowercase"
          >
            book a ride
          </Link>

          <Link
            href="#how-it-works"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors lowercase"
          >
            how it works
          </Link>

          <Link
            href="/become-an-operator"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors lowercase"
          >
            become an operator
          </Link>

          <Link
            href="/login"
            className="text-sm text-foreground lowercase"
          >
            login
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background border-b border-border px-6 py-6 space-y-4">
          <Link
            href="/"
            className="block text-sm text-muted-foreground hover:text-foreground transition-colors lowercase"
            onClick={() => setMobileMenuOpen(false)}
          >
            book a ride
          </Link>

          <Link
            href="#how-it-works"
            className="block text-sm text-muted-foreground lowercase"
            onClick={() => setMobileMenuOpen(false)}
          >
            how it works
          </Link>

          <Link
            href="/operators"
            className="block text-sm text-muted-foreground lowercase"
            onClick={() => setMobileMenuOpen(false)}
          >
            become an operator
          </Link>

          <Link
            href="/login"
            className="block text-sm text-foreground lowercase"
            onClick={() => setMobileMenuOpen(false)}
          >
            login
          </Link>
        </div>
      )}
    </header>
  )
}