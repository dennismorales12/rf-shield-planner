import cors from "cors";
import express from "express";
import { MATERIALS } from "./materials.js";
import { normalizeSettings, simulateCoverage } from "./rf-model.js";

const app = express();
const port = Number(process.env.PORT) || 3000;
const allowedTypes = new Set(["wall", "door", "gate", "floor"]);

function isValidPoint(point) {
  return point && Number.isFinite(Number(point.x)) && Number.isFinite(Number(point.y));
}

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.get("/api/materials", (_request, response) => {
  response.json(Object.values(MATERIALS));
});

app.post("/api/simulate", (request, response) => {
  const { plan, settings } = request.body ?? {};
  const width = Number(plan?.width);
  const height = Number(plan?.height);

  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width <= 0 ||
    height <= 0 ||
    !isValidPoint(plan?.antenna)
  ) {
    return response.status(400).json({
      error: "El plano debe incluir ancho, alto y posición de la antena."
    });
  }

  const safePlan = {
    width,
    height,
    antenna: {
      x: Number(plan.antenna.x),
      y: Number(plan.antenna.y)
    },
    elements: Array.isArray(plan.elements)
      ? plan.elements
          .filter(
            (element) =>
              allowedTypes.has(element?.type) &&
              isValidPoint(element.start) &&
              isValidPoint(element.end)
          )
          .slice(0, 300)
      : []
  };

  try {
    return response.json(simulateCoverage(safePlan, normalizeSettings(settings)));
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "No fue posible calcular la cobertura." });
  }
});

app.listen(port, () => {
  console.log(`RF Shield API disponible en http://localhost:${port}`);
});
