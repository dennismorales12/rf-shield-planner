# Guion para video demostrativo

Duracion objetivo: 4 minutos 30 segundos.

## 0:00 a 0:30 - Problema y propuesta

Mostrar la pantalla principal del simulador.

> Este proyecto presenta un simulador conceptual de confinamiento pasivo de radiofrecuencia para centros penitenciarios. La propuesta no utiliza inhibidores ni genera interferencia. Analiza como la distancia, la frecuencia y los materiales constructivos afectan la potencia que llega al interior del edificio.

## 0:30 a 1:05 - Formula implementada

Mostrar brevemente `backend/src/rf-model.js`, especialmente las funciones `calculateFspl`, `calculateObstacleLoss` y `calculatePoint`.

> El backend calcula la perdida en espacio libre mediante FSPL igual a 32.44 mas 20 logaritmo de la distancia en kilometros mas 20 logaritmo de la frecuencia en megahercios. Luego calcula la potencia recibida restando FSPL y las perdidas de cada obstaculo atravesado. Para los materiales usamos un coeficiente efectivo en decibelios por metro que depende de la frecuencia y se multiplica por el grosor.

> La potencia recibida se compara con un umbral de menos 95 dBm. Si queda por debajo, el punto aparece como zona confinada. El modelo reduce la potencia de señal; al conservar fijo el piso de ruido, tambien disminuye la relacion senal a ruido.

Volver al simulador, ejecutar una vez y señalar el panel `Balance calculado`, donde aparecen la potencia transmitida, FSPL promedio, pérdida promedio por obstáculos y potencia recibida promedio.

## 1:05 a 1:55 - Escenario 850 MHz

1. Pulsar `Ejemplo`.
2. Mantener 43 dBm, 1 km y umbral de -95 dBm.
3. Pulsar `Comparar 850 MHz vs 28 GHz`.

> En 850 MHz, la longitud de onda es aproximadamente 35 centimetros. Con el concreto convencional del ejemplo, ninguna zona queda bajo el umbral. Esto muestra que una frecuencia baja tiene mayor capacidad de penetracion y exige una solucion arquitectonica pesada.

Resultado de referencia:

- Area bajo el umbral: 0 %.
- Potencia promedio aproximada: -56.7 dBm.
- Longitud de onda: 35.27 cm.

## 1:55 a 2:35 - Escenario 28 GHz

1. Mostrar la segunda fila de la comparación automática.
2. Elegir `5G mmWave - 28 GHz` y pulsar `Simular cobertura` para enseñar el mapa.

> Ahora la longitud de onda es cercana a un centimetro. El aumento de FSPL y de la perdida en los materiales hace que el mismo edificio alcance un confinamiento cercano al cien por ciento. Esta comparacion muestra por que las ondas milimetricas son mas faciles de controlar pasivamente.

Resultado de referencia:

- Area bajo el umbral: 100 %.
- Potencia promedio aproximada: -124.7 dBm.
- Longitud de onda: 1.07 cm.

## 2:35 a 3:40 - Escenario construido con blindaje

1. Pulsar `Ejemplo`.
2. Seleccionar 1900 MHz y simular como linea base.
3. Elegir material `Blindaje metalico`.
4. Seleccionar grosor de 0.25 m.
5. Elegir la herramienta `Muro`.
6. Dibujar una barrera vertical continua, una cuadricula dentro del muro izquierdo; la medida aparece sobre el segmento.
7. Simular nuevamente y señalar cómo cambia el balance.

> Antes del refuerzo, el concreto no lleva la senal de 1900 MHz bajo el umbral. Al agregar la barrera metalica, las perdidas se acumulan y alrededor del 94 por ciento del area queda confinada. El resultado no significa que 25 centimetros de metal sean una recomendacion constructiva real; es un escenario didactico que demuestra el efecto del coeficiente, el grosor y las barreras atravesadas.

Resultado de referencia despues del blindaje:

- Area bajo el umbral: aproximadamente 94.4 %.
- Potencia promedio: aproximadamente -114.2 dBm.

## 3:40 a 4:20 - Interpretacion y etica

> La propuesta utiliza atenuacion pasiva porque no transmite energia interferente. Esto protege las comunicaciones legitimas en el exterior, los servicios de emergencia y los derechos de los usuarios del espectro. El sistema es una herramienta de planificacion conceptual; antes de construir una solucion real se requieren mediciones de campo y autorizacion de las instituciones competentes.

## 4:20 a 4:35 - Cierre

> En conclusion, el simulador demuestra que el confinamiento no depende de un unico material. Depende de la frecuencia, la distancia, el grosor y la continuidad del cerramiento. Las frecuencias bajas requieren soluciones mas pesadas, mientras que 28 GHz presenta mayores perdidas de propagacion y penetracion.

## Lista antes de grabar

- Backend y frontend encendidos.
- Navegador con zoom al 90 o 100 %.
- Notificaciones desactivadas.
- Plano de ejemplo cargado.
- Archivo `rf-model.js` abierto para mostrar las formulas.
- Cronometro preparado.
- Video final menor de 5 minutos.
