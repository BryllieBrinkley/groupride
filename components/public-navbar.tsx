"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function PublicNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-[#f7f7f3]/90 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-12">
        <Link href="/" className="text-lg lowercase tracking-tight text-black">
          groupride
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link href="/book" className="text-sm lowercase text-black/60 transition hover:text-black">
            book
          </Link>
          <Link href="/#how-it-works" className="text-sm lowercase text-black/60 transition hover:text-black">
            how it works
          </Link>
          <Link href="/login" className="text-sm lowercase text-black">
            login
          </Link>
        </div>

        <button type="button" className="text-black md:hidden" onClick={() => setOpen((value) => !value)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open ? (
        <div className="border-t border-black/10 px-6 py-5 md:hidden">
          <div className="space-y-4">
            <Link href="/book" className="block text-sm lowercase text-black/60" onClick={() => setOpen(false)}>
              book
            </Link>
            <Link href="/#how-it-works" className="block text-sm lowercase text-black/60" onClick={() => setOpen(false)}>
              how it works
            </Link>
            <Link href="/login" className="block text-sm lowercase text-black" onClick={() => setOpen(false)}>
              login
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
