# RF Shield Planner

Simulador didáctico de atenuación pasiva para analizar cómo los materiales de una infraestructura afectan una señal celular.

## Enlaces públicos

- Aplicación: https://rf-shield-planner-dennis.onrender.com/
- API: https://rf-shield-planner-api-dennis.onrender.com/api/health
- Repositorio: https://github.com/dennismorales12/rf-shield-planner

El proyecto está separado en dos aplicaciones:

- `frontend`: interfaz y editor 2D en HTML, CSS y JavaScript.
- `backend`: API y cálculos de radiofrecuencia en Node.js con Express.

## Requisitos

- Node.js 20 o superior.
- npm.

## Ejecución local

Abre dos terminales.

Backend:

```powershell
cd backend
npm install
npm run dev
```

Frontend:

```powershell
cd frontend
npm install
npm run dev
```

Después abre `http://localhost:5173`.

## Cómo usar el editor

1. Selecciona una herramienta.
2. Para muros, puertas, rejas y pisos, arrastra sobre el plano.
3. Con `Antena`, haz clic para cambiar la posición de la fuente exterior.
4. Presiona `Simular cobertura` para pedir el cálculo al backend.
5. Revisa el balance visible de potencia, FSPL y pérdidas por obstáculos.
6. Usa `Comparar 850 MHz vs 28 GHz` para ejecutar ambas bandas sin cambiar el plano.
7. Usa `Seleccionar` para mover un elemento o modificar su material y grosor.
8. Al dibujar una puerta o reja sobre un muro, el editor sustituye ese tramo para evitar contar dos materiales.
9. Usa `Guardar` y `Cargar` para conservar el plano en el navegador.

La escala es de 0.1 metros por píxel; cada cuadro grande de 20 píxeles representa 2 metros. Al dibujar o seleccionar un elemento se muestra su medida.

## Modelo empleado

La potencia recibida se estima con:

```text
Pr = Pt + Gt + Gr - FSPL - perdidas_por_obstaculos
```

La pérdida en espacio libre es:

```text
FSPL = 32.44 + 20 log10(distancia_km) + 20 log10(frecuencia_MHz)
```

Los coeficientes incluidos son valores didácticos centralizados en `backend/src/materials.js`. Antes de presentar los resultados como datos de ingeniería deben reemplazarse o validarse con mediciones, normas o bibliografía técnica citada.

El porcentaje de confinamiento se calcula únicamente dentro de las zonas dibujadas con `Piso / zona`. Si el plano no tiene ninguna zona, se evalúa todo el lienzo.

El panel `Balance calculado` utiliza promedios de los puntos interiores y presenta de forma explícita:

```text
Pt + Gt + Gr - FSPL promedio - pérdida promedio por obstáculos = Pr promedio
```

## Despliegue público

El repositorio incluye `render.yaml` para desplegar las dos aplicaciones por separado en Render:

- `rf-shield-planner-dennis`: sitio estático del frontend.
- `rf-shield-planner-api-dennis`: servicio web Node.js del backend.

La variable `VITE_API_URL` conecta el frontend público con la API pública. El plan gratuito de Render puede suspender temporalmente la API después de un periodo sin tráfico; la primera solicitud posterior puede tardar cerca de un minuto mientras el servicio vuelve a iniciar.

## Entregables académicos

- Lista de control: `entregables/ENTREGABLES.md`.
- Guion cronometrado: `entregables/guion_video.md`.
- Informe final: `output/pdf/Informe_Tecnico_RF_Shield_Planner.pdf`.
- Generador editable del informe: `scripts/generate_report.py`.
