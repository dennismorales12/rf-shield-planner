// Escenario dibujado por el usuario y guardado como plantilla del simulador.
export const PRISON_SCENARIO = {
  antenna: { x: 50, y: 250 },
  elements: [
    // Esta zona hace que el porcentaje se calcule solo dentro del edificio.
    { type: "floor", start: { x: 140, y: 80 }, end: { x: 800, y: 480 }, materialId: "floor_zone", thicknessM: 0 },

    // Cerramiento exterior de concreto reforzado.
    { type: "wall", start: { x: 140, y: 80 }, end: { x: 780, y: 80 }, materialId: "reinforced_concrete", thicknessM: 1 },
    { type: "wall", start: { x: 140, y: 80 }, end: { x: 140, y: 480 }, materialId: "reinforced_concrete", thicknessM: 1 },
    { type: "wall", start: { x: 140, y: 480 }, end: { x: 800, y: 480 }, materialId: "reinforced_concrete", thicknessM: 1 },
    { type: "wall", start: { x: 800, y: 480 }, end: { x: 800, y: 80 }, materialId: "reinforced_concrete", thicknessM: 1 },
    { type: "wall", start: { x: 770, y: 80 }, end: { x: 800, y: 80 }, materialId: "reinforced_concrete", thicknessM: 1 },

    // Celdas del bloque izquierdo.
    { type: "gate", start: { x: 140, y: 160 }, end: { x: 400, y: 160 }, materialId: "steel_mesh", thicknessM: 1 },
    { type: "gate", start: { x: 220, y: 90 }, end: { x: 220, y: 150 }, materialId: "steel_mesh", thicknessM: 1 },
    { type: "gate", start: { x: 280, y: 90 }, end: { x: 280, y: 150 }, materialId: "steel_mesh", thicknessM: 1 },
    { type: "gate", start: { x: 340, y: 90 }, end: { x: 340, y: 160 }, materialId: "steel_mesh", thicknessM: 1 },
    { type: "gate", start: { x: 150, y: 390 }, end: { x: 390, y: 390 }, materialId: "steel_mesh", thicknessM: 1 },
    { type: "gate", start: { x: 200, y: 390 }, end: { x: 200, y: 480 }, materialId: "steel_mesh", thicknessM: 1 },
    { type: "gate", start: { x: 260, y: 390 }, end: { x: 260, y: 470 }, materialId: "steel_mesh", thicknessM: 1 },
    { type: "gate", start: { x: 320, y: 390 }, end: { x: 320, y: 480 }, materialId: "steel_mesh", thicknessM: 1 },
    { type: "gate", start: { x: 380, y: 470 }, end: { x: 380, y: 380 }, materialId: "steel_mesh", thicknessM: 1 },

    // División central y puerta metálica.
    { type: "wall", start: { x: 600, y: 80 }, end: { x: 600, y: 240 }, materialId: "reinforced_concrete", thicknessM: 1 },
    { type: "wall", start: { x: 600, y: 460 }, end: { x: 600, y: 310 }, materialId: "reinforced_concrete", thicknessM: 1 },
    { type: "wall", start: { x: 600, y: 480 }, end: { x: 600, y: 450 }, materialId: "reinforced_concrete", thicknessM: 1 },
    { type: "door", start: { x: 600, y: 240 }, end: { x: 600, y: 310 }, materialId: "metal_door", thicknessM: 0.5 },

    // Celdas y divisiones restantes.
    { type: "gate", start: { x: 390, y: 160 }, end: { x: 600, y: 160 }, materialId: "steel_mesh", thicknessM: 0.5 },
    { type: "gate", start: { x: 400, y: 90 }, end: { x: 400, y: 160 }, materialId: "steel_mesh", thicknessM: 0.5 },
    { type: "gate", start: { x: 460, y: 90 }, end: { x: 460, y: 160 }, materialId: "steel_mesh", thicknessM: 0.5 },
    { type: "gate", start: { x: 520, y: 90 }, end: { x: 520, y: 170 }, materialId: "steel_mesh", thicknessM: 0.5 },
    { type: "gate", start: { x: 380, y: 380 }, end: { x: 590, y: 380 }, materialId: "steel_mesh", thicknessM: 0.5 },
    { type: "gate", start: { x: 440, y: 380 }, end: { x: 440, y: 480 }, materialId: "steel_mesh", thicknessM: 0.5 },
    { type: "gate", start: { x: 500, y: 380 }, end: { x: 500, y: 480 }, materialId: "steel_mesh", thicknessM: 0.5 },
    { type: "gate", start: { x: 560, y: 380 }, end: { x: 570, y: 490 }, materialId: "steel_mesh", thicknessM: 0.5 }
  ]
};
