import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateFspl,
  calculateObstacleLoss,
  calculateWavelength,
  normalizeSettings,
  segmentsIntersect,
  simulateCoverage
} from "../src/rf-model.js";

test("normaliza valores inválidos sin producir frecuencias o distancias negativas", () => {
  const settings = normalizeSettings({ frequencyMHz: -20, towerDistanceMeters: "dato" });
  assert.equal(settings.frequencyMHz, 1);
  assert.equal(settings.towerDistanceMeters, 1000);
});

test("FSPL a 1 km y 1000 MHz es aproximadamente 92.44 dB", () => {
  assert.ok(Math.abs(calculateFspl(1000, 1000) - 92.44) < 0.01);
});

test("la longitud de onda disminuye cuando aumenta la frecuencia", () => {
  assert.ok(calculateWavelength(850) > calculateWavelength(3500));
});

test("un muro de mayor grosor produce más pérdida", () => {
  const thin = calculateObstacleLoss(
    { type: "wall", materialId: "brick", thicknessM: 0.1 },
    1900
  );
  const thick = calculateObstacleLoss(
    { type: "wall", materialId: "brick", thicknessM: 0.4 },
    1900
  );
  assert.ok(thick > thin);
});

test("detecta cuando el trayecto cruza un muro", () => {
  assert.equal(
    segmentsIntersect(
      { x: 0, y: 5 },
      { x: 10, y: 5 },
      { x: 5, y: 0 },
      { x: 5, y: 10 }
    ),
    true
  );
});

test("genera la cantidad esperada de puntos", () => {
  const result = simulateCoverage(
    { width: 100, height: 100, antenna: { x: 0, y: 50 }, elements: [] },
    {
      frequencyMHz: 1900,
      transmitPowerDbm: 43,
      transmitGainDbi: 0,
      receiveGainDbi: 0,
      noiseFloorDbm: -110,
      thresholdDbm: -95,
      towerDistanceMeters: 1000,
      metersPerPixel: 0.1,
      columns: 10,
      rows: 8
    }
  );
  assert.equal(result.points.length, 80);
  assert.ok(Number.isFinite(result.summary.averageFsplDb));
  assert.ok(Number.isFinite(result.summary.averageObstacleLossDb));
  assert.ok(Number.isFinite(result.summary.averageDistanceMeters));
});

test("el modelo produce más atenuación en concreto a 28 GHz que a 850 MHz", () => {
  const wall = {
    type: "wall",
    materialId: "reinforced_concrete",
    thicknessM: 0.25
  };
  assert.ok(calculateObstacleLoss(wall, 28000) > calculateObstacleLoss(wall, 850));
});
