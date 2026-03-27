import { BookingPlanner } from "@/components/booking-planner";

export default async function BookPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const destination = typeof resolvedSearchParams.destination === "string" ? resolvedSearchParams.destination : "";
  return <BookingPlanner initialDestination={destination} />;
}
