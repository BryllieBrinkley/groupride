import { haversineMiles, resolveFallbackLocation } from "@/lib/geo";
import { getStore } from "@/lib/data/demo-store";
import type { CoverageStatus, ResolvedLocation, ServiceArea, VehicleCategory } from "@/lib/types";

function serviceAreaDistanceMiles(serviceArea: ServiceArea, pickupLocation: ResolvedLocation) {
  const origin = resolveFallbackLocation({
    addressLine: serviceArea.label,
    city: serviceArea.city,
    state: serviceArea.state
  });
  origin.latitude = serviceArea.latitude;
  origin.longitude = serviceArea.longitude;
  return haversineMiles(origin, pickupLocation);
}

export function matchOperatorsForRequest({
  pickupLocation,
  vehicleCategory
}: {
  pickupLocation: ResolvedLocation;
  vehicleCategory: VehicleCategory;
}) {
  const store = getStore();
  const coveredAreas = store.serviceAreas.filter((area) => serviceAreaDistanceMiles(area, pickupLocation) <= area.radiusMiles);
  const matchedOperatorIds = Array.from(new Set(coveredAreas.map((area) => area.operatorId)));
  const eligibleOperatorIds = matchedOperatorIds.filter((operatorId) => {
    const operator = store.operators.find((entry) => entry.id === operatorId);
    const hasVehicle = store.vehicles.some(
      (vehicle) => vehicle.operatorId === operatorId && vehicle.category === vehicleCategory && vehicle.active
    );
    return operator?.status === "approved" && hasVehicle;
  });

  const isLaunchMarket = coveredAreas.some((area) => area.isLaunchMarket);

  let coverageStatus: CoverageStatus = "outside_coverage";
  if (matchedOperatorIds.length > 0) {
    coverageStatus = isLaunchMarket ? "launch_market" : "covered";
  }

  return {
    matchedOperatorIds,
    eligibleOperatorIds,
    coverageStatus,
    isLaunchMarket
  };
}
