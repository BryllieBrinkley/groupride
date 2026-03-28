import Link from "next/link";

import { clearSession, getSessionUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export async function SiteHeader() {
  const user = await getSessionUser();

  return (
    <header className="sticky top-4 z-20 mb-12 flex items-center justify-between gap-4 rounded-xl border border-line bg-white/90 px-5 py-4 backdrop-blur">
      <div className="flex items-center gap-5">
        <Link href="/" className="text-lg font-semibold tracking-[-0.03em] text-ink">
          GROUPRIDE
        </Link>
        <nav className="hidden gap-5 text-sm font-medium text-copy-muted md:flex">
          <Link href="/book">Book a trip</Link>
          <Link href="/booking/booking_offer_demo">Track booking</Link>
          {user?.role === "operator" ? <Link href="/operator">Operator</Link> : null}
          {user?.role === "admin" ? <Link href="/admin">Admin</Link> : null}
          {user?.role === "customer" ? <Link href="/account">My Trips</Link> : null}
        </nav>
      </div>

      <div className="flex items-center gap-3 text-sm">
        <div className="hidden lg:block">
          <Badge variant="blue">Marketplace live</Badge>
        </div>
        {user ? (
          <>
            <div className="hidden text-right sm:block">
              <p className="font-semibold text-ink">{user.name}</p>
              <p className="capitalize text-copy-muted">{user.role}</p>
            </div>
            <form
              action={async () => {
                "use server";
                await clearSession();
              }}
            >
              <Button variant="secondary" size="sm">Log out</Button>
            </form>
          </>
        ) : (
          <Link href="/login" className="inline-flex rounded-lg border border-line bg-white px-3 py-2 text-sm font-semibold text-ink transition hover:bg-surface">
            Login
          </Link>
        )}
      </div>
    </header>
  );
}
