import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-background pt-24">
      <Navbar />
      <section className="page-shell py-16 md:py-20">
        <div className="mx-auto max-w-xl">
          <LoginForm />
        </div>
      </section>
      <Footer />
    </main>
  );
}
