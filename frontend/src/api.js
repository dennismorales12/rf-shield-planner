const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function parseResponse(response) {
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Error en la API");
  return data;
}

export async function checkHealth() {
  const response = await fetch(`${API_URL}/api/health`);
  return parseResponse(response);
}

export async function simulate(plan, settings) {
  const response = await fetch(`${API_URL}/api/simulate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan, settings })
  });
  return parseResponse(response);
}

