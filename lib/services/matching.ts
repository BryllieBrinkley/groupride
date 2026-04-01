import { getStore } from "@/lib/data/demo-store";
import type { VehicleCategory } from "@/lib/types";

export function matchOperatorsForRequest({
  vehicleCategory,
}: {
  vehicleCategory: VehicleCategory;
}) {
  const store = getStore();
  const operators = store.operators.filter((operator) => operator.status === "active");
  const eligibleOperatorIds = operators
    .filter((operator) =>
      store.vehicles.some(
        (vehicle) => vehicle.operatorId === operator.id && vehicle.category === vehicleCategory && vehicle.status === "active",
      ),
    )
    .map((operator) => operator.id);

  return {
    matchedOperatorIds: operators.map((operator) => operator.id),
    eligibleOperatorIds,
  };
}
