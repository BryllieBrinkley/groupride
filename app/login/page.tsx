import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-background pt-24">
      <Navbar />
      <section className="page-shell section-shell">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-2xl">
            <p className="premium-eyebrow">Partner & admin portal</p>
            <h1 className="mt-5 text-5xl font-medium leading-[0.95] tracking-[-0.06em] text-foreground sm:text-6xl lg:text-7xl">
              Manage trips, operators, and bookings in one premium workspace.
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-8 text-muted-foreground">
              Calm dispatch tools, warm customer support context, and a consistent operations shell for the GroupRide team.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <span className="rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground">
                Secure access
              </span>
              <span className="rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground">
                Demo accounts included
              </span>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <LoginForm />
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
