import Navbar from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Hero } from "@/components/hero"
import { TrustSection } from "@/components/trust-section"
import { HowItWorks } from "@/components/how-it-works"

export default function Home() {
  return (
    <main className="min-h-screen bg-background pt-24">
      <Navbar />
      <Hero />
      <TrustSection />
      <HowItWorks />
      <Footer />
    </main>
  )
}
