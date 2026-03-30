import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#f3efe9] px-6 py-12">
      <div className="mx-auto flex min-h-[80vh] max-w-6xl items-center justify-center">
        <div className="grid w-full gap-16 lg:grid-cols-2">
          {/* Left Side */}
          <div className="flex flex-col justify-center">
            <p className="text-xs uppercase tracking-[0.18em] text-black/35">
              partner & admin portal
            </p>

            <h1 className="mt-5 text-5xl font-normal leading-[0.95] tracking-[-0.05em] text-black lowercase sm:text-6xl lg:text-7xl">
              manage trips,
              <br />
              operators,
              <br />
              and bookings.
            </h1>

            <p className="mt-8 max-w-md text-lg leading-relaxed text-black/60 lowercase">
              sign in to manage bookings, operators, customer trips, and
              platform operations.
            </p>

            <div className="mt-10 text-xs uppercase tracking-[0.18em] text-black/35">
              secure access
              <br />
              demo accounts available
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center justify-center">
            <LoginForm />
          </div>
        </div>
      </div>
    </main>
  );
}