"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function NavbarComponent() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Book a ride" },
    { href: "/#how-it-works", label: "How it works" },
    { href: "/become-an-operator", label: "Become an operator" },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="page-shell pt-4">
        <nav
          className={cn(
            "rounded-full border px-4 py-3 transition-all duration-300 md:px-6",
            scrolled
              ? "border-border bg-background/90 shadow-[0_18px_48px_rgba(75,51,39,0.1)] backdrop-blur"
              : "border-transparent bg-transparent",
          )}
        >
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="text-base font-medium tracking-[-0.03em] text-foreground">
              GroupRide
            </Link>

            <div className="hidden items-center gap-2 md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full px-4 py-2 text-sm text-muted-foreground transition hover:bg-card hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
              <Button asChild size="sm">
                <Link href="/login">Portal login</Link>
              </Button>
            </div>

            <button
              type="button"
              className="flex size-11 items-center justify-center rounded-full border border-border bg-background text-foreground md:hidden"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>

          {mobileMenuOpen ? (
            <div className="mt-4 space-y-2 rounded-[1.75rem] border border-border bg-card p-3 md:hidden">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block rounded-2xl px-4 py-3 text-sm text-muted-foreground transition hover:bg-background hover:text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Button asChild className="w-full">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  Portal login
                </Link>
              </Button>
            </div>
          ) : null}
        </nav>
      </div>
    </header>
  );
}

export default NavbarComponent;
export { NavbarComponent as Navbar };
