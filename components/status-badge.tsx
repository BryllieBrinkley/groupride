import { cn } from "@/lib/utils";
import type { BookingStatus } from "@/lib/types";

const STATUS_STYLES: Record<BookingStatus, string> = {
  draft: "bg-[#EEF2F7] text-[#465468]",
  quoted: "bg-[#EEF2F7] text-[#465468]",
  requested: "bg-[#EEF2F7] text-[#465468]",
  operator_offer_open: "bg-accentSoft text-ink",
  manual_review_pending: "bg-warningSoft text-[#92400E]",
  customer_approval_required: "bg-[#FFF7ED] text-[#9A3412]",
  operator_accepted: "bg-accentSoft text-ink",
  payment_processing: "bg-accentSoft text-ink",
  payment_action_required: "bg-[#FEE2E2] text-[#991B1B]",
  confirmed: "bg-successSoft text-[#166534]",
  offer_expired: "bg-warningSoft text-[#92400E]",
  no_operator_available: "bg-[#EEF2F7] text-[#465468]",
  cancelled: "bg-[#EEF2F7] text-[#465468]",
  refunded: "bg-successSoft text-[#166534]",
  closed_unfulfilled: "bg-[#EEF2F7] text-[#465468]"
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span className={cn("inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]", STATUS_STYLES[status])}>
      {status.replace(/_/g, " ")}
    </span>
  );
}
