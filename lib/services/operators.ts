import { getStore } from "@/lib/data/demo-store";

export function listOperators() {
  const store = getStore();
  return store.operators.map((operator) => ({
    ...operator,
    profile: store.profiles.find((profile) => profile.id === operator.profileId) ?? null,
    vehicles: store.vehicles.filter((vehicle) => vehicle.operatorId === operator.id),
    drivers: store.drivers.filter((driver) => driver.operatorId === operator.id),
  }));
}

export function getOperatorById(operatorId: string) {
  const store = getStore();
  const operator = store.operators.find((entry) => entry.id === operatorId);
  if (!operator) {
    return null;
  }

  return {
    ...operator,
    profile: store.profiles.find((profile) => profile.id === operator.profileId) ?? null,
    vehicles: store.vehicles.filter((vehicle) => vehicle.operatorId === operator.id),
    drivers: store.drivers.filter((driver) => driver.operatorId === operator.id),
  };
}

export function getOperatorByProfileId(profileId: string) {
  return getStore().operators.find((entry) => entry.profileId === profileId) ?? null;
}

export function listActiveOperators() {
  return listOperators().filter((operator) => operator.status === "active");
}
