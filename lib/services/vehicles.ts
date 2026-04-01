import { getStore } from "@/lib/data/demo-store";

export function listVehicles() {
  return [...getStore().vehicles];
}

export function listVehiclesForOperator(operatorId: string) {
  return getStore().vehicles.filter((vehicle) => vehicle.operatorId === operatorId);
}

export function getVehicleById(vehicleId: string) {
  return getStore().vehicles.find((vehicle) => vehicle.id === vehicleId) ?? null;
}
