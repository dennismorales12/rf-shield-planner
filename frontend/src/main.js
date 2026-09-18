import "./styles.css";
import { checkHealth, simulate } from "./api.js";
import { PlanEditor } from "./editor.js";

const canvas = document.querySelector("#planCanvas");
const editor = new PlanEditor(canvas);

const technology = document.querySelector("#technology");
const transmitPower = document.querySelector("#transmitPower");
const towerDistance = document.querySelector("#towerDistance");
const threshold = document.querySelector("#threshold");
const material = document.querySelector("#material");
const thickness = document.querySelector("#thickness");
const simulateButton = document.querySelector("#simulateButton");
const compareButton = document.querySelector("#compareButton");
const selectionPanel = document.querySelector("#selectionPanel");
const selectedMaterial = document.querySelector("#selectedMaterial");
const selectedThickness = document.querySelector("#selectedThickness");

function currentSettings(frequencyMHz = Number(technology.value)) {
  return {
    frequencyMHz,
    transmitPowerDbm: Number(transmitPower.value),
    thresholdDbm: Number(threshold.value),
    towerDistanceMeters: Number(towerDistance.value),
    transmitGainDbi: 0,
    receiveGainDbi: 0,
    noiseFloorDbm: -110,
    metersPerPixel: 0.1,
    columns: 30,
    rows: 20
  };
}

function updateOutputs() {
  document.querySelector("#powerOutput").textContent = `${transmitPower.value} dBm`;
  document.querySelector("#distanceOutput").textContent = `${(towerDistance.value / 1000).toFixed(1)} km`;
  document.querySelector("#thresholdOutput").textContent = `${threshold.value.replace("-", "−")} dBm`;
  document.querySelector("#thicknessOutput").textContent = `${Number(thickness.value).toFixed(2)} m`;
  updateColorGuide();
}

function formatDbm(value) {
  return `${String(value).replace("-", "−")} dBm`;
}

function updateColorGuide() {
  const limit = Number(threshold.value);
  const strongLimit = limit + 10;
  const deepLimit = limit - 15;
  document.querySelector("#colorRedRange").textContent =
    `Mayor o igual a ${formatDbm(strongLimit)}`;
  document.querySelector("#colorYellowRange").textContent =
    `Entre ${formatDbm(limit)} y ${formatDbm(strongLimit)}`;
  document.querySelector("#colorBlueRange").textContent =
    `Entre ${formatDbm(deepLimit)} y ${formatDbm(limit)}`;
  document.querySelector("#colorDarkRange").textContent =
    `Menor que ${formatDbm(deepLimit)}`;
}

function selectTool(toolName) {
  document.querySelectorAll(".tool").forEach((button) => {
    button.classList.toggle("active", button.dataset.tool === toolName);
  });
  editor.setTool(toolName);
  const tips = {
    select: "Haz clic en un elemento. Presiona Supr para eliminarlo.",
    wall: "Arrastra para crear un muro con el material seleccionado.",
    door: "Arrastra sobre una abertura para colocar una puerta metálica.",
    gate: "Arrastra para colocar una sección de malla de acero.",
    floor: "Arrastra para marcar un edificio o zona interior.",
    antenna: "Haz clic para cambiar la posición de la antena exterior."
  };
  document.querySelector("#canvasTip").textContent = tips[toolName];
}

document.querySelectorAll(".tool").forEach((button) => {
  button.addEventListener("click", () => selectTool(button.dataset.tool));
});

[transmitPower, towerDistance, threshold, thickness].forEach((input) => {
  input.addEventListener("input", updateOutputs);
});

material.addEventListener("change", () => editor.setMaterial(material.value));
thickness.addEventListener("input", () => editor.setThickness(thickness.value));

document.querySelector("#undoButton").addEventListener("click", () => editor.undo());
document.querySelector("#exampleButton").addEventListener("click", () => {
  editor.loadPrisonScenario();
  selectTool("select");
});
document.querySelector("#clearButton").addEventListener("click", () => editor.clear());
document.querySelector("#deleteSelectedButton").addEventListener("click", () => editor.deleteSelected());

document.querySelector("#saveButton").addEventListener("click", () => {
  localStorage.setItem("rf-shield-plan", JSON.stringify(editor.exportState()));
  document.querySelector("#canvasTip").textContent = "Plano guardado en este navegador.";
});

document.querySelector("#loadButton").addEventListener("click", () => {
  const saved = localStorage.getItem("rf-shield-plan");
  if (!saved) {
    document.querySelector("#canvasTip").textContent = "Todavía no hay un plano guardado.";
    return;
  }
  try {
    editor.importState(JSON.parse(saved));
    document.querySelector("#canvasTip").textContent = "Plano guardado cargado correctamente.";
  } catch {
    document.querySelector("#canvasTip").textContent = "El plano guardado no se pudo leer.";
  }
});

canvas.addEventListener("planselectionchange", (event) => {
  const element = event.detail;
  selectionPanel.classList.toggle("hidden", !element);
  if (!element) return;
  const names = { wall: "Muro", door: "Puerta", gate: "Reja", floor: "Piso / zona" };
  document.querySelector("#selectedType").textContent =
    `${names[element.type] || element.type} · ${element.lengthMeters.toFixed(1)} m`;
  selectedMaterial.value = element.materialId;
  selectedMaterial.disabled = element.type !== "wall";
  selectedThickness.value = Number(element.thicknessM || 0).toFixed(2);
  selectedThickness.disabled = element.type === "floor";
});

selectedMaterial.addEventListener("change", () => {
  editor.updateSelectedElement({ materialId: selectedMaterial.value });
});

selectedThickness.addEventListener("change", () => {
  const value = Math.min(1.5, Math.max(0.01, Number(selectedThickness.value) || 0.01));
  editor.updateSelectedElement({ thicknessM: value });
});

async function runSimulation() {
  simulateButton.disabled = true;
  simulateButton.textContent = "Calculando…";
  document.querySelector("#resultState").classList.remove("hidden");
  document.querySelector("#resultState").textContent = "El backend está evaluando los trayectos de propagación.";

  try {
    const result = await simulate(editor.getPlan(), currentSettings());

    editor.setHeatmap(result);
    showResults(result);
    return {
      blockedPercentage: result.summary.blockedPercentage,
      averagePowerDbm: result.summary.averagePowerDbm,
      wavelengthMeters: result.meta.wavelengthMeters
    };
  } catch (error) {
    document.querySelector("#resultState").textContent =
      "No se pudo contactar al backend. Verifica que esté ejecutándose en el puerto 3000.";
  } finally {
    simulateButton.disabled = false;
    simulateButton.textContent = "Simular cobertura";
  }
}

simulateButton.addEventListener("click", runSimulation);
compareButton.addEventListener("click", runComparison);

function showResults(result) {
  const { meta, summary } = result;
  document.querySelector("#resultState").classList.add("hidden");
  document.querySelector("#resultCards").classList.remove("hidden");
  document.querySelector("#blockedResult").textContent = `${summary.blockedPercentage.toFixed(1)} %`;
  document.querySelector("#averageResult").textContent = `${summary.averagePowerDbm.toFixed(1)} dBm`;
  document.querySelector("#minimumResult").textContent = `${summary.minimumPowerDbm.toFixed(1)} dBm`;
  document.querySelector("#wavelengthResult").textContent = formatWavelength(meta.wavelengthMeters);
  document.querySelector("#calculationPanel").classList.remove("hidden");
  document.querySelector("#formulaText").textContent =
    `${meta.transmitPowerDbm.toFixed(1)} dBm + ${meta.transmitGainDbi.toFixed(1)} dBi + ` +
    `${meta.receiveGainDbi.toFixed(1)} dBi − ${summary.averageFsplDb.toFixed(1)} dB − ` +
    `${summary.averageObstacleLossDb.toFixed(1)} dB = ${summary.averagePowerDbm.toFixed(1)} dBm`;
  document.querySelector("#calculationDistance").textContent =
    `${(summary.averageDistanceMeters / 1000).toFixed(2)} km`;
  document.querySelector("#calculationFspl").textContent = `${summary.averageFsplDb.toFixed(1)} dB`;
  document.querySelector("#calculationObstacles").textContent =
    `${summary.averageObstacleLossDb.toFixed(1)} dB`;

  let message = "La mayor parte del plano todavía conserva señal utilizable.";
  if (summary.blockedPercentage >= 70) {
    message = "El diseño confina la señal en la mayor parte del plano bajo el umbral definido.";
  } else if (summary.blockedPercentage >= 35) {
    message = "El confinamiento es parcial. Revisa accesos, puertas y segmentos con menor atenuación.";
  }
  document.querySelector("#explanationText").textContent = message;
}

async function runComparison() {
  compareButton.disabled = true;
  compareButton.textContent = "Comparando…";
  try {
    const plan = editor.getPlan();
    const [lowBand, millimeterWave] = await Promise.all([
      simulate(plan, currentSettings(850)),
      simulate(plan, currentSettings(28000))
    ]);
    const rows = [
      ["850 MHz", lowBand],
      ["28 GHz", millimeterWave]
    ];
    const body = document.querySelector("#comparisonBody");
    body.replaceChildren();
    rows.forEach(([label, result]) => {
      const row = document.createElement("tr");
      [
        label,
        `${result.summary.blockedPercentage.toFixed(1)} %`,
        `${result.summary.averagePowerDbm.toFixed(1)} dBm`
      ].forEach((value) => {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.appendChild(cell);
      });
      body.appendChild(row);
    });
    document.querySelector("#comparisonPanel").classList.remove("hidden");
    const difference =
      millimeterWave.summary.averagePowerDbm - lowBand.summary.averagePowerDbm;
    document.querySelector("#comparisonConclusion").textContent =
      `Con el mismo plano, 28 GHz llega en promedio ${Math.abs(difference).toFixed(1)} dB ` +
      `más débil que 850 MHz. Esto evidencia por qué las ondas milimétricas son más fáciles de confinar pasivamente.`;
  } catch {
    document.querySelector("#comparisonPanel").classList.remove("hidden");
    document.querySelector("#comparisonConclusion").textContent =
      "No fue posible completar la comparación. Verifica la conexión con el backend.";
  } finally {
    compareButton.disabled = false;
    compareButton.textContent = "Comparar 850 MHz vs 28 GHz";
  }
}

function formatWavelength(meters) {
  if (meters < 0.01) return `${(meters * 1000).toFixed(1)} mm`;
  return `${(meters * 100).toFixed(1)} cm`;
}

async function updateConnectionStatus() {
  const status = document.querySelector("#connectionStatus");
  try {
    await checkHealth();
    status.classList.add("online");
    status.querySelector("span:last-child").textContent = "API conectada";
  } catch {
    status.classList.add("offline");
    status.querySelector("span:last-child").textContent = "API desconectada";
  }
}

function registerWebMcpTool() {
  const context = document.modelContext;
  if (!context?.registerTool) return;

  context.registerTool({
    name: "simulate_current_rf_plan",
    title: "Simular el plano RF actual",
    description: "Ejecuta la simulación visible usando el plano y los parámetros seleccionados.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false
    },
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    execute: runSimulation
  });

  context.registerTool({
    name: "read_current_rf_plan",
    title: "Leer el plano RF actual",
    description: "Devuelve los elementos, materiales, grosores y la antena del plano visible.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false
    },
    annotations: { readOnlyHint: true, untrustedContentHint: false },
    execute: () => editor.exportState()
  });
}

updateOutputs();
updateConnectionStatus();
registerWebMcpTool();
