import { createId, getStore } from "@/lib/data/demo-store";
import type { Review } from "@/lib/types";
import { nowIso } from "@/lib/utils";

export function listReviewsForOperator(operatorId: string) {
  return getStore().reviews.filter((review) => review.operatorId === operatorId && review.status === "published");
}

export function createReview(input: Omit<Review, "id" | "createdAt" | "updatedAt" | "status">) {
  const store = getStore();
  const review: Review = {
    id: createId("review"),
    status: "published",
    createdAt: nowIso(),
    updatedAt: nowIso(),
    ...input,
  };

  store.reviews.unshift(review);
  return review;
}
