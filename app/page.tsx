import Navbar from "@/components/navbar"
import { Hero } from "@/components/hero"
import { TrustSection } from "@/components/trust-section"
import { HowItWorks } from "@/components/how-it-works"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <TrustSection />
      <HowItWorks />
    </main>
  )
}
