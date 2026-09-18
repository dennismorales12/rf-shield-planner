import { PRISON_SCENARIO } from "./prison-scenario.js";

const COLORS = {
  reinforced_concrete: "#64748b",
  brick: "#b45309",
  steel_mesh: "#475569",
  metal_shield: "#334155",
  metal_door: "#0f766e"
};

export class PlanEditor {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.tool = "select";
    this.materialId = "reinforced_concrete";
    this.thicknessM = 0.25;
    this.elements = [];
    this.antenna = { x: 55, y: 280 };
    this.startPoint = null;
    this.currentPoint = null;
    this.selectedIndex = -1;
    this.heatmap = null;
    this.history = [];
    this.dragState = null;
    this.metersPerPixel = 0.1;

    this.canvas.addEventListener("pointerdown", (event) => this.onPointerDown(event));
    this.canvas.addEventListener("pointermove", (event) => this.onPointerMove(event));
    this.canvas.addEventListener("pointerup", (event) => this.onPointerUp(event));
    window.addEventListener("keydown", (event) => this.onKeyDown(event));

    this.loadPrisonScenario();
  }

  setTool(tool) {
    this.tool = tool;
    this.startPoint = null;
    this.currentPoint = null;
    this.selectedIndex = -1;
    this.canvas.style.cursor = tool === "select" ? "default" : "crosshair";
    this.draw();
    this.notifySelection();
  }

  setMaterial(materialId) {
    this.materialId = materialId;
  }

  setThickness(thicknessM) {
    this.thicknessM = Number(thicknessM);
  }

  notifySelection() {
    this.canvas.dispatchEvent(
      new CustomEvent("planselectionchange", { detail: this.getSelectedElement() })
    );
  }

  getSelectedElement() {
    const element = this.elements[this.selectedIndex];
    if (!element) return null;
    return {
      index: this.selectedIndex,
      type: element.type,
      materialId: element.materialId,
      thicknessM: element.thicknessM,
      lengthMeters:
        Math.hypot(element.end.x - element.start.x, element.end.y - element.start.y) *
        this.metersPerPixel
    };
  }

  updateSelectedElement(changes) {
    const element = this.elements[this.selectedIndex];
    if (!element || element.type === "floor") return;
    this.saveHistory();
    Object.assign(element, changes);
    this.heatmap = null;
    this.draw();
    this.notifySelection();
  }

  deleteSelected() {
    if (this.selectedIndex < 0) return;
    this.saveHistory();
    this.elements.splice(this.selectedIndex, 1);
    this.selectedIndex = -1;
    this.heatmap = null;
    this.draw();
    this.notifySelection();
  }

  exportState() {
    return { elements: this.elements, antenna: this.antenna };
  }

  importState(state) {
    if (!state || !Array.isArray(state.elements) || !state.antenna) return false;
    this.saveHistory();
    this.elements = state.elements.slice(0, 300);
    this.antenna = state.antenna;
    this.selectedIndex = -1;
    this.heatmap = null;
    this.draw();
    this.notifySelection();
    return true;
  }

  pointFromEvent(event) {
    const bounds = this.canvas.getBoundingClientRect();
    return {
      x: Math.round(((event.clientX - bounds.left) * this.canvas.width) / bounds.width / 10) * 10,
      y: Math.round(((event.clientY - bounds.top) * this.canvas.height) / bounds.height / 10) * 10
    };
  }

  saveHistory() {
    this.history.push(JSON.stringify({ elements: this.elements, antenna: this.antenna }));
    if (this.history.length > 30) this.history.shift();
  }

  undo() {
    const previous = this.history.pop();
    if (!previous) return;
    const state = JSON.parse(previous);
    this.elements = state.elements;
    this.antenna = state.antenna;
    this.selectedIndex = -1;
    this.heatmap = null;
    this.draw();
    this.notifySelection();
  }

  clear() {
    this.saveHistory();
    this.elements = [];
    this.selectedIndex = -1;
    this.heatmap = null;
    this.draw();
    this.notifySelection();
  }

  loadPrisonScenario() {
    if (this.elements.length) this.saveHistory();
    this.elements = JSON.parse(JSON.stringify(PRISON_SCENARIO.elements));
    this.antenna = { ...PRISON_SCENARIO.antenna };
    this.selectedIndex = -1;
    this.heatmap = null;
    this.draw();
    this.notifySelection();
  }

  onPointerDown(event) {
    const point = this.pointFromEvent(event);

    if (this.tool === "antenna") {
      this.saveHistory();
      this.antenna = point;
      this.heatmap = null;
      this.draw();
      return;
    }

    if (this.tool === "select") {
      this.selectedIndex = this.findElement(point);
      if (this.selectedIndex >= 0) {
        this.dragState = {
          pointerStart: point,
          original: JSON.parse(JSON.stringify(this.elements[this.selectedIndex])),
          history: JSON.stringify({ elements: this.elements, antenna: this.antenna }),
          moved: false
        };
        this.canvas.setPointerCapture(event.pointerId);
      }
      this.draw();
      this.notifySelection();
      return;
    }

    this.startPoint = point;
    this.currentPoint = point;
    this.canvas.setPointerCapture(event.pointerId);
  }

  onPointerMove(event) {
    if (this.dragState && this.selectedIndex >= 0) {
      const point = this.pointFromEvent(event);
      const dx = point.x - this.dragState.pointerStart.x;
      const dy = point.y - this.dragState.pointerStart.y;
      if (dx || dy) {
        const original = this.dragState.original;
        const element = this.elements[this.selectedIndex];
        element.start = { x: original.start.x + dx, y: original.start.y + dy };
        element.end = { x: original.end.x + dx, y: original.end.y + dy };
        this.dragState.moved = true;
        this.heatmap = null;
        this.draw();
      }
      return;
    }
    if (!this.startPoint) return;
    this.currentPoint = this.pointFromEvent(event);
    this.draw();
  }

  onPointerUp(event) {
    if (this.dragState) {
      if (this.dragState.moved) {
        this.history.push(this.dragState.history);
        if (this.history.length > 30) this.history.shift();
      }
      this.dragState = null;
      if (this.canvas.hasPointerCapture(event.pointerId)) {
        this.canvas.releasePointerCapture(event.pointerId);
      }
      this.notifySelection();
      return;
    }
    if (!this.startPoint) return;
    const endPoint = this.pointFromEvent(event);
    const length = Math.hypot(endPoint.x - this.startPoint.x, endPoint.y - this.startPoint.y);

    if (length >= 10) {
      this.saveHistory();
      const materialByTool = {
        wall: this.materialId,
        door: "metal_door",
        gate: "steel_mesh",
        floor: "floor_zone"
      };
      const newElement = {
        type: this.tool,
        start: this.startPoint,
        end: endPoint,
        materialId: materialByTool[this.tool],
        thicknessM: this.tool === "floor" ? 0 : this.thicknessM
      };
      if (newElement.type === "door" || newElement.type === "gate") {
        this.splitWallForOpening(newElement);
      }
      this.elements.push(newElement);
      this.selectedIndex = this.elements.length - 1;
      this.heatmap = null;
    }

    this.startPoint = null;
    this.currentPoint = null;
    this.canvas.releasePointerCapture(event.pointerId);
    this.draw();
    this.notifySelection();
  }

  onKeyDown(event) {
    if ((event.key === "Delete" || event.key === "Backspace") && this.selectedIndex >= 0) {
      const activeTag = document.activeElement?.tagName;
      if (activeTag === "INPUT" || activeTag === "SELECT") return;
      this.deleteSelected();
    }
  }

  splitWallForOpening(opening) {
    const wallIndex = this.elements.findIndex((element) => {
      if (element.type !== "wall") return false;
      return (
        this.distanceToLine(opening.start, element.start, element.end) <= 12 &&
        this.distanceToLine(opening.end, element.start, element.end) <= 12
      );
    });
    if (wallIndex < 0) return;

    const wall = this.elements[wallIndex];
    const dx = wall.end.x - wall.start.x;
    const dy = wall.end.y - wall.start.y;
    const lengthSquared = dx * dx + dy * dy;
    if (!lengthSquared) return;
    const project = (point) =>
      ((point.x - wall.start.x) * dx + (point.y - wall.start.y) * dy) / lengthSquared;
    const first = Math.max(0, Math.min(project(opening.start), project(opening.end)));
    const last = Math.min(1, Math.max(project(opening.start), project(opening.end)));
    if (last - first < 0.01) return;

    const pointAt = (ratio) => ({ x: wall.start.x + dx * ratio, y: wall.start.y + dy * ratio });
    opening.start = pointAt(first);
    opening.end = pointAt(last);
    const fragments = [];
    if (first * Math.sqrt(lengthSquared) >= 10) {
      fragments.push({ ...wall, start: wall.start, end: pointAt(first) });
    }
    if ((1 - last) * Math.sqrt(lengthSquared) >= 10) {
      fragments.push({ ...wall, start: pointAt(last), end: wall.end });
    }
    this.elements.splice(wallIndex, 1, ...fragments);
  }

  findElement(point) {
    for (let index = this.elements.length - 1; index >= 0; index -= 1) {
      const element = this.elements[index];
      if (element.type === "floor") {
        const minX = Math.min(element.start.x, element.end.x);
        const maxX = Math.max(element.start.x, element.end.x);
        const minY = Math.min(element.start.y, element.end.y);
        const maxY = Math.max(element.start.y, element.end.y);
        if (point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY) return index;
        continue;
      }

      const distance = this.distanceToLine(point, element.start, element.end);
      if (distance <= 10) return index;
    }
    return -1;
  }

  distanceToLine(point, start, end) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const lengthSquared = dx * dx + dy * dy;
    if (!lengthSquared) return Math.hypot(point.x - start.x, point.y - start.y);
    const t = Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared));
    return Math.hypot(point.x - (start.x + t * dx), point.y - (start.y + t * dy));
  }

  setHeatmap(data) {
    this.heatmap = data;
    this.draw();
  }

  getPlan() {
    return {
      width: this.canvas.width,
      height: this.canvas.height,
      antenna: this.antenna,
      elements: this.elements
    };
  }

  draw() {
    const context = this.context;
    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    context.fillStyle = "#f8fafc";
    context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawFloors();
    this.drawHeatmap();
    this.drawGrid();
    this.elements.forEach((element, index) => {
      if (element.type !== "floor") this.drawElement(element, index === this.selectedIndex);
    });
    this.drawAntenna();

    if (this.startPoint && this.currentPoint) {
      this.drawPreview();
    }
  }

  drawGrid() {
    const context = this.context;
    context.save();
    context.strokeStyle = "rgba(100, 116, 139, 0.13)";
    context.lineWidth = 1;
    for (let x = 0; x <= this.canvas.width; x += 20) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, this.canvas.height);
      context.stroke();
    }
    for (let y = 0; y <= this.canvas.height; y += 20) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(this.canvas.width, y);
      context.stroke();
    }
    context.restore();
  }

  drawFloors() {
    this.elements.forEach((element, index) => {
      if (element.type !== "floor") return;
      const x = Math.min(element.start.x, element.end.x);
      const y = Math.min(element.start.y, element.end.y);
      const width = Math.abs(element.end.x - element.start.x);
      const height = Math.abs(element.end.y - element.start.y);
      this.context.fillStyle = index === this.selectedIndex ? "#dbeafe" : "#e2e8f0";
      this.context.fillRect(x, y, width, height);
      if (index === this.selectedIndex) {
        this.drawDimensionLabel(
          { x, y },
          { x: x + width, y },
          `${(width * this.metersPerPixel).toFixed(1)} × ${(height * this.metersPerPixel).toFixed(1)} m`
        );
      }
    });
  }

  drawHeatmap() {
    if (!this.heatmap) return;
    const { meta, points } = this.heatmap;
    this.context.save();
    this.context.globalAlpha = 0.58;
    points.forEach((point) => {
      if (!point.insideFacility) return;
      this.context.fillStyle = this.powerColor(point.receivedPowerDbm, meta.thresholdDbm);
      this.context.fillRect(
        point.x - meta.cellWidth / 2,
        point.y - meta.cellHeight / 2,
        meta.cellWidth + 1,
        meta.cellHeight + 1
      );
    });
    this.context.restore();
  }

  powerColor(powerDbm, thresholdDbm) {
    if (powerDbm < thresholdDbm - 15) return "#0f172a";
    if (powerDbm < thresholdDbm) return "#2563eb";
    if (powerDbm < thresholdDbm + 10) return "#eab308";
    return "#dc2626";
  }

  drawElement(element, selected = false) {
    const context = this.context;
    context.save();
    context.strokeStyle = selected ? "#38bdf8" : COLORS[element.materialId] || "#334155";
    context.lineWidth = element.type === "wall" ? 8 : 6;
    context.lineCap = element.type === "door" ? "round" : "butt";
    if (element.type === "gate") context.setLineDash([8, 6]);

    context.beginPath();
    context.moveTo(element.start.x, element.start.y);
    context.lineTo(element.end.x, element.end.y);
    context.stroke();

    if (selected) {
      context.fillStyle = "#38bdf8";
      [element.start, element.end].forEach((point) => {
        context.beginPath();
        context.arc(point.x, point.y, 6, 0, Math.PI * 2);
        context.fill();
      });
      this.drawDimensionLabel(element.start, element.end);
    }
    context.restore();
  }

  drawDimensionLabel(start, end, customText) {
    const context = this.context;
    const length = Math.hypot(end.x - start.x, end.y - start.y) * this.metersPerPixel;
    const text = customText || `${length.toFixed(1)} m`;
    const x = (start.x + end.x) / 2;
    const y = (start.y + end.y) / 2 - 12;
    context.save();
    context.font = "bold 13px system-ui";
    context.textAlign = "center";
    context.textBaseline = "middle";
    const width = context.measureText(text).width + 12;
    context.fillStyle = "rgba(7, 17, 31, 0.9)";
    context.fillRect(x - width / 2, y - 10, width, 20);
    context.fillStyle = "#e0f2fe";
    context.fillText(text, x, y);
    context.restore();
  }

  drawAntenna() {
    const { x, y } = this.antenna;
    const context = this.context;
    context.save();
    context.strokeStyle = "#ef4444";
    context.fillStyle = "#ef4444";
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(x, y + 18);
    context.lineTo(x, y - 12);
    context.stroke();
    context.beginPath();
    context.arc(x, y - 15, 4, 0, Math.PI * 2);
    context.fill();
    context.beginPath();
    context.arc(x, y - 14, 13, Math.PI * 1.2, Math.PI * 1.8);
    context.stroke();
    context.beginPath();
    context.arc(x, y - 14, 22, Math.PI * 1.2, Math.PI * 1.8);
    context.stroke();
    context.restore();
  }

  drawPreview() {
    if (this.tool === "floor") {
      const x = Math.min(this.startPoint.x, this.currentPoint.x);
      const y = Math.min(this.startPoint.y, this.currentPoint.y);
      this.context.fillStyle = "rgba(59, 130, 246, 0.18)";
      this.context.fillRect(x, y, Math.abs(this.currentPoint.x - this.startPoint.x), Math.abs(this.currentPoint.y - this.startPoint.y));
      this.drawDimensionLabel(
        this.startPoint,
        this.currentPoint,
        `${(Math.abs(this.currentPoint.x - this.startPoint.x) * this.metersPerPixel).toFixed(1)} × ${(Math.abs(this.currentPoint.y - this.startPoint.y) * this.metersPerPixel).toFixed(1)} m`
      );
      return;
    }

    this.context.save();
    this.context.strokeStyle = "#38bdf8";
    this.context.lineWidth = 5;
    this.context.setLineDash([7, 5]);
    this.context.beginPath();
    this.context.moveTo(this.startPoint.x, this.startPoint.y);
    this.context.lineTo(this.currentPoint.x, this.currentPoint.y);
    this.context.stroke();
    this.context.restore();
    this.drawDimensionLabel(this.startPoint, this.currentPoint);
  }
}
