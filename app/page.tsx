import { HomeHero } from "@/components/home-hero";
import { PublicNavbar } from "@/components/public-navbar";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f7f7f3] text-[#161616]">
      <PublicNavbar />
      <HomeHero />

      <section className="border-t border-black/10 px-6 py-16 lg:px-12">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs tracking-[0.24em] text-black/55 uppercase">
            Weddings, sports teams, churches, schools, and corporate groups
          </p>
        </div>
      </section>

      <section id="how-it-works" className="border-t border-black/10 px-6 py-24 lg:px-12">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-16 text-xs uppercase tracking-[0.24em] text-black/55">How it works</h2>

          <div className="space-y-12">
            {[
              { number: "01", title: "share your route and group size" },
              { number: "02", title: "transportation partners review and respond" },
              { number: "03", title: "you choose, pay securely, and ride" }
            ].map((step) => (
              <div key={step.number} className="flex items-baseline gap-8">
                <span className="font-mono text-xs text-black/45">{step.number}</span>
                <h3 className="text-2xl lowercase sm:text-3xl">{step.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
