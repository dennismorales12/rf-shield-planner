import { getMaterial } from "./materials.js";

const SPEED_OF_LIGHT = 299_792_458;

export function calculateFspl(distanceMeters, frequencyMHz) {
  const safeDistanceKm = Math.max(distanceMeters, 1) / 1000;
  return 32.44 + 20 * Math.log10(safeDistanceKm) + 20 * Math.log10(frequencyMHz);
}

export function calculateWavelength(frequencyMHz) {
  return SPEED_OF_LIGHT / (frequencyMHz * 1_000_000);
}

export function calculateObstacleLoss(element, frequencyMHz) {
  if (!element || element.type === "floor") return 0;

  const material = getMaterial(element.materialId);
  const thickness = Math.max(Number(element.thicknessM) || 0.1, 0.01);
  const frequencyFactor = Math.pow(frequencyMHz / 1000, material.frequencyExponent);

  return material.referenceLossDbPerMeter * thickness * frequencyFactor;
}

function orientation(a, b, c) {
  return (b.y - a.y) * (c.x - b.x) - (b.x - a.x) * (c.y - b.y);
}

function isPointOnSegment(a, point, b) {
  return (
    point.x <= Math.max(a.x, b.x) + 0.001 &&
    point.x >= Math.min(a.x, b.x) - 0.001 &&
    point.y <= Math.max(a.y, b.y) + 0.001 &&
    point.y >= Math.min(a.y, b.y) - 0.001
  );
}

export function segmentsIntersect(p1, p2, q1, q2) {
  const o1 = orientation(p1, p2, q1);
  const o2 = orientation(p1, p2, q2);
  const o3 = orientation(q1, q2, p1);
  const o4 = orientation(q1, q2, p2);

  if ((o1 > 0) !== (o2 > 0) && (o3 > 0) !== (o4 > 0)) return true;

  if (Math.abs(o1) < 0.001 && isPointOnSegment(p1, q1, p2)) return true;
  if (Math.abs(o2) < 0.001 && isPointOnSegment(p1, q2, p2)) return true;
  if (Math.abs(o3) < 0.001 && isPointOnSegment(q1, p1, q2)) return true;
  if (Math.abs(o4) < 0.001 && isPointOnSegment(q1, p2, q2)) return true;

  return false;
}

function calculatePoint(plan, settings, point) {
  const metersPerPixel = settings.metersPerPixel ?? 0.1;
  const pixelDistance = Math.hypot(point.x - plan.antenna.x, point.y - plan.antenna.y);
  const distanceMeters = Math.max(
    settings.towerDistanceMeters + pixelDistance * metersPerPixel,
    1
  );
  const fsplDb = calculateFspl(distanceMeters, settings.frequencyMHz);

  const crossedElements = plan.elements.filter((element) => {
    if (element.type === "floor") return false;
    return segmentsIntersect(plan.antenna, point, element.start, element.end);
  });

  const obstacleLossDb = crossedElements.reduce(
    (total, element) => total + calculateObstacleLoss(element, settings.frequencyMHz),
    0
  );

  const receivedPowerDbm =
    settings.transmitPowerDbm +
    settings.transmitGainDbi +
    settings.receiveGainDbi -
    fsplDb -
    obstacleLossDb;

  return {
    x: point.x,
    y: point.y,
    distanceMeters,
    fsplDb,
    obstacleLossDb,
    receivedPowerDbm,
    snrDb: receivedPowerDbm - settings.noiseFloorDbm,
    crossedObstacles: crossedElements.length,
    blocked: receivedPowerDbm < settings.thresholdDbm
  };
}

function pointInsideRectangle(point, rectangle) {
  const minX = Math.min(rectangle.start.x, rectangle.end.x);
  const maxX = Math.max(rectangle.start.x, rectangle.end.x);
  const minY = Math.min(rectangle.start.y, rectangle.end.y);
  const maxY = Math.max(rectangle.start.y, rectangle.end.y);
  return point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY;
}

export function simulateCoverage(plan, settings) {
  const columns = Math.min(Math.max(settings.columns ?? 30, 10), 60);
  const rows = Math.min(Math.max(settings.rows ?? 20, 8), 40);
  const cellWidth = plan.width / columns;
  const cellHeight = plan.height / rows;
  const points = [];
  const facilityZones = plan.elements.filter((element) => element.type === "floor");

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const point = {
        x: (column + 0.5) * cellWidth,
        y: (row + 0.5) * cellHeight
      };
      const calculation = calculatePoint(plan, settings, point);
      calculation.insideFacility =
        facilityZones.length === 0 ||
        facilityZones.some((zone) => pointInsideRectangle(point, zone));
      points.push(calculation);
    }
  }

  const interiorPoints = points.filter((point) => point.insideFacility);
  const evaluatedPoints = interiorPoints.length ? interiorPoints : points;
  const blockedPoints = evaluatedPoints.filter((point) => point.blocked).length;
  const powers = evaluatedPoints.map((point) => point.receivedPowerDbm);

  return {
    meta: {
      columns,
      rows,
      cellWidth,
      cellHeight,
      frequencyMHz: settings.frequencyMHz,
      wavelengthMeters: calculateWavelength(settings.frequencyMHz),
      thresholdDbm: settings.thresholdDbm,
      transmitPowerDbm: settings.transmitPowerDbm,
      transmitGainDbi: settings.transmitGainDbi,
      receiveGainDbi: settings.receiveGainDbi
    },
    summary: {
      minimumPowerDbm: Math.min(...powers),
      maximumPowerDbm: Math.max(...powers),
      averagePowerDbm: powers.reduce((sum, value) => sum + value, 0) / powers.length,
      averageFsplDb:
        evaluatedPoints.reduce((sum, point) => sum + point.fsplDb, 0) / evaluatedPoints.length,
      averageObstacleLossDb:
        evaluatedPoints.reduce((sum, point) => sum + point.obstacleLossDb, 0) /
        evaluatedPoints.length,
      averageDistanceMeters:
        evaluatedPoints.reduce((sum, point) => sum + point.distanceMeters, 0) /
        evaluatedPoints.length,
      evaluatedPoints: evaluatedPoints.length,
      blockedPercentage: (blockedPoints / evaluatedPoints.length) * 100
    },
    points
  };
}

export function normalizeSettings(input = {}) {
  const numberOr = (value, fallback) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };
  return {
    frequencyMHz: Math.max(numberOr(input.frequencyMHz, 1900), 1),
    transmitPowerDbm: numberOr(input.transmitPowerDbm, 43),
    transmitGainDbi: numberOr(input.transmitGainDbi, 0),
    receiveGainDbi: numberOr(input.receiveGainDbi, 0),
    noiseFloorDbm: numberOr(input.noiseFloorDbm, -110),
    thresholdDbm: numberOr(input.thresholdDbm, -95),
    towerDistanceMeters: Math.max(numberOr(input.towerDistanceMeters, 1000), 1),
    metersPerPixel: Math.max(numberOr(input.metersPerPixel, 0.1), 0.001),
    columns: numberOr(input.columns, 30),
    rows: numberOr(input.rows, 20)
  };
}
