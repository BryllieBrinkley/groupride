import Link from "next/link";

export default function AccountPage() {
  const bookings = [
    {
      id: "1",
      pickupLocation: { city: "Charlotte", state: "NC" },
      dropoffLocation: { city: "Atlanta", state: "GA" },
      pickupDateTime: "Mar 31, 2026 • 8:30 PM",
      amount: "$1,250",
      status: "confirmed",
    },
    {
      id: "2",
      pickupLocation: { city: "Nashville", state: "TN" },
      dropoffLocation: { city: "Louisville", state: "KY" },
      pickupDateTime: "Apr 4, 2026 • 11:00 AM",
      amount: "$780",
      status: "pending",
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-10">
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-black/40">
          Your account
        </p>

        <h1 className="text-5xl leading-[0.95] tracking-[-0.04em] lowercase text-black">
          your group trips.
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-relaxed text-black/55">
          Every request and confirmed ride in one place—open a trip anytime for
          status, payment, and pickup details.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <span className="rounded-full border border-black/10 bg-black/5 px-3 py-1 text-xs text-black/60">
            Trip history
          </span>

          <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs text-blue-700">
            Status updates on
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {bookings.length === 0 ? (
          <div className="rounded-2xl border border-black/10 bg-[#f6f4ef] p-6 text-sm text-black/50">
            No trips yet. Start a booking from the home page.
          </div>
        ) : null}

        {bookings.map((booking) => (
          <Link
            key={booking.id}
            href={`/booking/status?id=${booking.id}`}
            className="block"
          >
            <div className="rounded-2xl border border-black/10 bg-[#f6f4ef] p-6 transition hover:border-black/20 hover:shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-black">
                    {booking.pickupLocation.city},{" "}
                    {booking.pickupLocation.state} to{" "}
                    {booking.dropoffLocation.city},{" "}
                    {booking.dropoffLocation.state}
                  </p>

                  <p className="mt-2 text-sm text-black/50">
                    {booking.pickupDateTime} • {booking.amount}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium lowercase ${
                    booking.status === "confirmed"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {booking.status}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}