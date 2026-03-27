import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

export function localDateTimeToUtcIso(localDateTime: string, timezone: string) {
  return fromZonedTime(localDateTime, timezone).toISOString();
}

export function formatLocalDateTime(dateIso: string, timezone: string) {
  return formatInTimeZone(dateIso, timezone, "MMM d, yyyy 'at' h:mm a zzz");
}

export function toDateTimeLocalInputValue(dateIso: string, timezone: string) {
  return formatInTimeZone(dateIso, timezone, "yyyy-MM-dd'T'HH:mm");
}

export function hoursUntilLocal(localDateTime: string, timezone: string) {
  const utcDate = fromZonedTime(localDateTime, timezone);
  return (utcDate.getTime() - Date.now()) / (60 * 60 * 1000);
}
