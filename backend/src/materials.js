export const MATERIALS = {
  reinforced_concrete: {
    id: "reinforced_concrete",
    name: "Concreto reforzado",
    category: "wall",
    referenceLossDbPerMeter: 22,
    frequencyExponent: 0.5,
    color: "#64748b"
  },
  brick: {
    id: "brick",
    name: "Ladrillo",
    category: "wall",
    referenceLossDbPerMeter: 11,
    frequencyExponent: 0.65,
    color: "#b45309"
  },
  steel_mesh: {
    id: "steel_mesh",
    name: "Malla de acero",
    category: "gate",
    referenceLossDbPerMeter: 34,
    frequencyExponent: 0.42,
    color: "#475569"
  },
  metal_shield: {
    id: "metal_shield",
    name: "Blindaje metálico",
    category: "wall",
    referenceLossDbPerMeter: 145,
    frequencyExponent: 0.48,
    color: "#334155"
  },
  metal_door: {
    id: "metal_door",
    name: "Puerta metálica",
    category: "door",
    referenceLossDbPerMeter: 48,
    frequencyExponent: 0.38,
    color: "#0f766e"
  }
};

export function getMaterial(materialId) {
  return MATERIALS[materialId] ?? MATERIALS.reinforced_concrete;
}
