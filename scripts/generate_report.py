from pathlib import Path
import math

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
    KeepTogether,
)
from reportlab.graphics.shapes import Drawing
from reportlab.graphics.charts.barcharts import VerticalBarChart
from reportlab.graphics.charts.textlabels import Label


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf" / "Informe_Tecnico_RF_Shield_Planner.pdf"
OUTPUT.parent.mkdir(parents=True, exist_ok=True)

PAGE_WIDTH, PAGE_HEIGHT = letter
NAVY = colors.HexColor("#0B1F33")
BLUE = colors.HexColor("#1677A8")
CYAN = colors.HexColor("#39B5E0")
PALE = colors.HexColor("#EAF4F8")
SLATE = colors.HexColor("#44566C")
LIGHT = colors.HexColor("#F4F7F9")
AMBER = colors.HexColor("#D89214")


def header_footer(canvas, doc):
    canvas.saveState()
    if doc.page > 1:
        canvas.setFillColor(NAVY)
        canvas.rect(0, PAGE_HEIGHT - 1.15 * cm, PAGE_WIDTH, 1.15 * cm, fill=1, stroke=0)
        canvas.setFillColor(colors.white)
        canvas.setFont("Helvetica-Bold", 8.5)
        canvas.drawString(1.7 * cm, PAGE_HEIGHT - 0.72 * cm, "RF SHIELD PLANNER")
        canvas.setFont("Helvetica", 8)
        canvas.drawRightString(PAGE_WIDTH - 1.7 * cm, PAGE_HEIGHT - 0.72 * cm, "Informe tecnico de ingenieria")
    canvas.setStrokeColor(colors.HexColor("#CBD5E1"))
    canvas.line(1.7 * cm, 1.2 * cm, PAGE_WIDTH - 1.7 * cm, 1.2 * cm)
    canvas.setFillColor(SLATE)
    canvas.setFont("Helvetica", 8)
    canvas.drawString(1.7 * cm, 0.78 * cm, "Modelo conceptual de atenuacion pasiva")
    canvas.drawRightString(PAGE_WIDTH - 1.7 * cm, 0.78 * cm, f"Pagina {doc.page}")
    canvas.restoreState()


class ReportDoc(BaseDocTemplate):
    def __init__(self, filename):
        super().__init__(
            filename,
            pagesize=letter,
            rightMargin=1.7 * cm,
            leftMargin=1.7 * cm,
            topMargin=1.65 * cm,
            bottomMargin=1.65 * cm,
            title="Informe tecnico RF Shield Planner",
            author="Proyecto de Telecomunicaciones",
        )
        frame = Frame(self.leftMargin, self.bottomMargin, self.width, self.height, id="main")
        self.addPageTemplates(PageTemplate(id="report", frames=frame, onPage=header_footer))


styles = getSampleStyleSheet()
styles.add(ParagraphStyle(
    name="CoverTitle",
    parent=styles["Title"],
    fontName="Helvetica-Bold",
    fontSize=27,
    leading=32,
    textColor=NAVY,
    alignment=TA_LEFT,
    spaceAfter=14,
))
styles.add(ParagraphStyle(
    name="CoverSub",
    parent=styles["Normal"],
    fontName="Helvetica",
    fontSize=14,
    leading=20,
    textColor=BLUE,
    spaceAfter=22,
))
styles.add(ParagraphStyle(
    name="H1Custom",
    parent=styles["Heading1"],
    fontName="Helvetica-Bold",
    fontSize=17,
    leading=21,
    textColor=NAVY,
    spaceBefore=8,
    spaceAfter=10,
))
styles.add(ParagraphStyle(
    name="H2Custom",
    parent=styles["Heading2"],
    fontName="Helvetica-Bold",
    fontSize=12.5,
    leading=16,
    textColor=BLUE,
    spaceBefore=9,
    spaceAfter=6,
))
styles.add(ParagraphStyle(
    name="BodyCustom",
    parent=styles["BodyText"],
    fontName="Helvetica",
    fontSize=9.5,
    leading=14.2,
    textColor=colors.HexColor("#263648"),
    alignment=TA_JUSTIFY,
    spaceAfter=7,
))
styles.add(ParagraphStyle(
    name="SmallCustom",
    parent=styles["BodyText"],
    fontName="Helvetica",
    fontSize=8,
    leading=11.2,
    textColor=SLATE,
    spaceAfter=5,
))
styles.add(ParagraphStyle(
    name="Equation",
    parent=styles["BodyText"],
    fontName="Courier-Bold",
    fontSize=10,
    leading=15,
    textColor=NAVY,
    backColor=PALE,
    borderColor=colors.HexColor("#B8DCEB"),
    borderWidth=0.6,
    borderPadding=9,
    spaceBefore=5,
    spaceAfter=10,
    alignment=TA_CENTER,
))
styles.add(ParagraphStyle(
    name="Callout",
    parent=styles["BodyText"],
    fontName="Helvetica-Bold",
    fontSize=9.5,
    leading=14,
    textColor=NAVY,
    backColor=colors.HexColor("#FFF7E5"),
    borderColor=AMBER,
    borderWidth=0.8,
    borderPadding=10,
    spaceBefore=6,
    spaceAfter=10,
))


def para(text, style="BodyCustom"):
    return Paragraph(text, styles[style])


def report_table(data, widths, header_rows=1, font_size=7.7):
    table = Table(data, colWidths=widths, repeatRows=header_rows, hAlign="LEFT")
    commands = [
        ("BACKGROUND", (0, 0), (-1, header_rows - 1), NAVY),
        ("TEXTCOLOR", (0, 0), (-1, header_rows - 1), colors.white),
        ("FONTNAME", (0, 0), (-1, header_rows - 1), "Helvetica-Bold"),
        ("FONTNAME", (0, header_rows), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), font_size),
        ("LEADING", (0, 0), (-1, -1), font_size + 3),
        ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#B8C5D1")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]
    for row in range(header_rows, len(data)):
        if (row - header_rows) % 2 == 0:
            commands.append(("BACKGROUND", (0, row), (-1, row), LIGHT))
    table.setStyle(TableStyle(commands))
    return table


def scenario_chart():
    drawing = Drawing(470, 190)
    chart = VerticalBarChart()
    chart.x = 48
    chart.y = 38
    chart.height = 120
    chart.width = 385
    chart.data = [[0, 0, 100, 94.4]]
    chart.categoryAxis.categoryNames = ["850 MHz", "1900 MHz", "28 GHz", "1900 + blindaje"]
    chart.valueAxis.valueMin = 0
    chart.valueAxis.valueMax = 100
    chart.valueAxis.valueStep = 20
    chart.valueAxis.labelTextFormat = "%d%%"
    chart.bars[0].fillColor = BLUE
    chart.bars[0].strokeColor = NAVY
    chart.categoryAxis.labels.fontName = "Helvetica"
    chart.categoryAxis.labels.fontSize = 7.5
    chart.valueAxis.labels.fontName = "Helvetica"
    chart.valueAxis.labels.fontSize = 7.5
    drawing.add(chart)
    title = Label()
    title.setOrigin(235, 177)
    title.setText("Porcentaje del area interior bajo -95 dBm")
    title.fontName = "Helvetica-Bold"
    title.fontSize = 10
    title.fillColor = NAVY
    drawing.add(title)
    return drawing


def coefficient_rows():
    frequencies = [850, 1900, 2100, 3500, 28000]
    materials = [
        ("Concreto reforzado", 22, 0.50),
        ("Ladrillo", 11, 0.65),
        ("Malla de acero", 34, 0.42),
        ("Puerta metalica", 48, 0.38),
        ("Blindaje metalico", 145, 0.48),
    ]
    rows = [["Material", "850 MHz", "1.9 GHz", "2.1 GHz", "3.5 GHz", "28 GHz"]]
    for name, reference, exponent in materials:
        values = [reference * math.pow(frequency / 1000, exponent) for frequency in frequencies]
        rows.append([name] + [f"{value:.1f}" for value in values])
    return rows


def build_story():
    story = []

    story.extend([
        Spacer(1, 1.6 * cm),
        para("RF SHIELD PLANNER", "CoverTitle"),
        para("Control conceptual de senales no autorizadas mediante atenuacion pasiva", "CoverSub"),
        Spacer(1, 0.35 * cm),
        Table(
            [
                ["Tipo de documento", "Informe tecnico de ingenieria"],
                ["Estudiante", "________________________________________"],
                ["Carne", "________________________________________"],
                ["Curso", "Telecomunicaciones"],
                ["Docente", "________________________________________"],
                ["Fecha", "________________________________________"],
            ],
            colWidths=[4.3 * cm, 10.2 * cm],
            style=TableStyle([
                ("BACKGROUND", (0, 0), (0, -1), NAVY),
                ("TEXTCOLOR", (0, 0), (0, -1), colors.white),
                ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                ("FONTNAME", (1, 0), (1, -1), "Helvetica"),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#B7C4D0")),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("TOPPADDING", (0, 0), (-1, -1), 9),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ]),
        ),
        Spacer(1, 1.1 * cm),
        para(
            "Alcance academico: simulacion de propagacion y absorcion electromagnetica. "
            "No se construye, adquiere ni opera ningun inhibidor activo de senal.",
            "Callout",
        ),
        Spacer(1, 2.1 * cm),
        para("Guatemala, 2026", "SmallCustom"),
        PageBreak(),
    ])

    story.extend([
        para("Resumen ejecutivo", "H1Custom"),
        para(
            "RF Shield Planner es una aplicacion web educativa que estima la potencia recibida dentro de un "
            "plano penitenciario. El usuario dibuja zonas, muros, puertas y rejas; selecciona frecuencia, "
            "distancia, potencia y grosor; y obtiene un mapa de cobertura. El objetivo es demostrar que el "
            "confinamiento pasivo puede reducir la senal dentro del edificio sin emitir interferencia hacia "
            "usuarios externos.",
        ),
        para(
            "El resultado principal es el contraste entre 850 MHz y 28 GHz. En el escenario de referencia, "
            "el cerramiento convencional mantiene 850 MHz por encima de -95 dBm, mientras el mismo plano "
            "lleva 28 GHz bajo el umbral en la totalidad de los puntos interiores evaluados. Un refuerzo "
            "metalico conceptual aplicado al caso de 1900 MHz eleva el area confinada de 0 % a cerca de 94.4 %.",
        ),
        para(
            "Estos resultados son demostrativos. La herramienta no reemplaza una campana de medicion, un "
            "modelo electromagnetico de onda completa ni el criterio de una entidad competente.",
            "Callout",
        ),
        para("Contenido", "H2Custom"),
        report_table([
            ["Seccion", "Contenido"],
            ["1", "Problema, alcance y objetivos"],
            ["2", "Fundamentos: FSPL, longitud de onda y balance de potencia"],
            ["3", "Arquitectura e implementacion del simulador"],
            ["4", "Coeficientes efectivos de materiales"],
            ["5", "Escenarios y analisis So What?"],
            ["6", "Etica, legalidad, limitaciones y conclusiones"],
        ], [2.2 * cm, 12.8 * cm], font_size=8.3),
        PageBreak(),
    ])

    story.extend([
        para("1. Problema, alcance y objetivos", "H1Custom"),
        para("1.1 Problema", "H2Custom"),
        para(
            "Las comunicaciones celulares no autorizadas desde centros penitenciarios pueden facilitar "
            "extorsiones y coordinacion delictiva. Un jammer intenta resolver el problema transmitiendo "
            "energia interferente, pero su cobertura no termina necesariamente en el limite fisico del recinto. "
            "El desborde puede degradar comunicaciones legitimas, servicios de emergencia y redes de operadores.",
        ),
        para("1.2 Alcance", "H2Custom"),
        para(
            "El proyecto se limita a atenuacion pasiva y simulacion. Representa el recinto en dos dimensiones, "
            "traza el trayecto entre una antena exterior y cada punto de una cuadricula, calcula la perdida de "
            "espacio libre y suma la perdida de los obstaculos intersectados. No transmite radiofrecuencia.",
        ),
        para("1.3 Objetivos", "H2Custom"),
        report_table([
            ["Objetivo", "Criterio observable"],
            ["Aplicar FSPL", "Calcular perdida segun distancia y frecuencia."],
            ["Modelar materiales", "Relacionar coeficiente efectivo, grosor y frecuencia."],
            ["Comparar bandas", "Contrastar 850 MHz, 1900 MHz, 3.5 GHz y 28 GHz."],
            ["Evaluar confinamiento", "Clasificar puntos respecto del umbral de -95 dBm."],
            ["Respetar el espectro", "Demostrar una alternativa sin emision interferente."],
        ], [4.5 * cm, 10.5 * cm]),
        Spacer(1, 8),
        para("2. Fundamentos teoricos", "H1Custom"),
        para("2.1 Longitud de onda", "H2Custom"),
        para("La longitud de onda se obtiene dividiendo la velocidad de la luz entre la frecuencia:"),
        para("lambda = c / f", "Equation"),
        para(
            "A 850 MHz, lambda es aproximadamente 0.353 m; a 28 GHz es aproximadamente 0.0107 m. "
            "La diferencia ayuda a explicar por que las bandas milimetricas son muy sensibles a obstaculos, "
            "aberturas, angulo de incidencia y propiedades electricas de los materiales.",
        ),
        PageBreak(),
    ])

    story.extend([
        para("2.2 Perdida de espacio libre", "H2Custom"),
        para(
            "Para distancia en kilometros y frecuencia en megahercios, el simulador implementa la forma "
            "logaritmica de FSPL:",
        ),
        para("FSPL(dB) = 32.44 + 20 log10(d_km) + 20 log10(f_MHz)", "Equation"),
        para(
            "La ecuacion expresa que, en espacio libre, la perdida aumenta con la distancia y con la frecuencia. "
            "El modelo fija una distancia base entre la estacion y el plano y agrega la distancia local hasta "
            "cada punto de evaluacion.",
        ),
        para("2.3 Balance de potencia", "H2Custom"),
        para("Pr = Pt + Gt + Gr - FSPL - suma(L_material)", "Equation"),
        para(
            "Pr es la potencia recibida en dBm; Pt es la potencia transmitida; Gt y Gr son las ganancias de "
            "antena; y L_material representa las perdidas de los obstaculos atravesados. En la interfaz se usa "
            "-95 dBm como umbral conceptual. El piso de ruido se conserva en -110 dBm, por lo que SNR = Pr - N.",
        ),
        para("Ejemplo de balance a 1900 MHz", "H2Custom"),
        report_table([
            ["Termino", "Valor", "Operacion"],
            ["Potencia transmitida", "+43.0 dBm", "Entrada"],
            ["Ganancias", "+0.0 dB", "Supuesto conservador"],
            ["FSPL a 1 km", "-98.0 dB", "Se resta"],
            ["Muro de concreto 0.25 m", "-7.6 dB", "Coeficiente por grosor"],
            ["Potencia aproximada", "-62.6 dBm", "Por encima de -95 dBm"],
        ], [5.4 * cm, 3.5 * cm, 6.1 * cm]),
        para(
            "El valor exacto cambia con la posicion del punto y con todos los obstaculos cruzados. Esta cuenta "
            "manual muestra por que una sola pared puede ser insuficiente en bandas bajas.",
            "SmallCustom",
        ),
        para("3. Arquitectura e implementacion", "H1Custom"),
        para(
            "El frontend y el backend estan separados. El frontend utiliza HTML, CSS, JavaScript y Canvas. "
            "El backend utiliza Node.js y Express. La interfaz envia el plano como JSON al endpoint "
            "POST /api/simulate y recibe la cuadricula de resultados.",
        ),
        report_table([
            ["Componente", "Responsabilidad", "Archivo principal"],
            ["Editor 2D", "Dibujo, seleccion y representacion del mapa", "frontend/src/editor.js"],
            ["Interfaz", "Controles, estados y presentacion de resultados", "frontend/src/main.js"],
            ["API", "Validacion y exposicion de endpoints", "backend/src/server.js"],
            ["Modelo RF", "FSPL, intersecciones y balance de potencia", "backend/src/rf-model.js"],
            ["Materiales", "Parametros centralizados del modelo", "backend/src/materials.js"],
        ], [3.1 * cm, 7.3 * cm, 4.6 * cm]),
        PageBreak(),
    ])

    story.extend([
        para("4. Coeficientes efectivos de materiales", "H1Custom"),
        para(
            "El modelo academico usa L = alpha(f, material) por grosor. Alpha se calcula a partir de un valor "
            "de referencia a 1 GHz y un exponente de frecuencia. La tabla muestra los valores efectivos que "
            "actualmente utiliza el codigo, expresados en dB/m.",
        ),
        report_table(coefficient_rows(), [4.2 * cm, 2.15 * cm, 2.15 * cm, 2.15 * cm, 2.15 * cm, 2.2 * cm]),
        Spacer(1, 7),
        para(
            "Advertencia metodologica: estos coeficientes son parametros didacticos de calibracion, no constantes "
            "universales. La perdida real depende de composicion, humedad, refuerzo, espesor, polarizacion, "
            "frecuencia, angulo, juntas, puertas y ventanas. La UIT-R P.2040 recomienda modelar propiedades "
            "electricas, interfaces y losas; NISTIR 6055 demuestra experimentalmente la variacion con frecuencia "
            "y grosor. Una implementacion real debe sustituir o calibrar esta tabla con mediciones del sitio.",
            "Callout",
        ),
        para("4.1 Formula implementada", "H2Custom"),
        para("alpha(f) = alpha_1GHz x (f_MHz / 1000)^n", "Equation"),
        para("L_material(dB) = alpha(f) x grosor_m", "Equation"),
        para(
            "Cada rayo conceptual desde la antena hasta una celda se prueba contra los segmentos del plano. "
            "Cuando existe interseccion, se suma la perdida del elemento. Las zonas de piso delimitan el area "
            "sobre la cual se calcula el porcentaje de confinamiento.",
        ),
        para("5. Escenarios y resultados", "H1Custom"),
        report_table([
            ["Escenario", "Promedio", "Minimo", "Area bajo -95 dBm", "lambda"],
            ["Concreto, 850 MHz", "-56.7 dBm", "-61.1 dBm", "0 %", "35.27 cm"],
            ["Concreto, 1900 MHz", "-67.6 dBm", "-76.0 dBm aprox.", "0 %", "15.78 cm"],
            ["Concreto, 28 GHz", "-124.7 dBm", "-141.9 dBm", "100 %", "1.07 cm"],
            ["1900 MHz + blindaje", "-114.2 dBm", "-122.7 dBm", "94.4 %", "15.78 cm"],
        ], [4.7 * cm, 2.7 * cm, 2.8 * cm, 3.2 * cm, 1.7 * cm]),
        scenario_chart(),
    ])

    story.extend([
        para("5.1 Analisis So What?", "H2Custom"),
        para(
            "El resultado de 850 MHz es la evidencia central: un cerramiento convencional de 0.25 m no basta "
            "para llevar el interior bajo -95 dBm en el escenario definido. La frecuencia baja combina menor "
            "FSPL con mayor capacidad de difraccion y penetracion. Por tanto, alcanzar el objetivo exige varias "
            "capas, mayor masa, continuidad metalica, tratamiento de aberturas y verificacion del enlace ascendente "
            "y descendente.",
        ),
        para(
            "En 28 GHz, el mismo balance parte de una FSPL mayor y el modelo asigna mayor atenuacion efectiva a "
            "los materiales. El resultado es confinamiento total de la cuadricula interior. La conclusion no es "
            "que toda instalacion a 28 GHz quede automaticamente bloqueada, sino que su presupuesto de enlace "
            "tolera menos penetracion y suele ser mas facil de confinar con barreras pasivas continuas.",
        ),
        para(
            "El escenario de 1900 MHz con blindaje ilustra una decision de ingenieria: reforzar una frontera "
            "critica puede ser mas efectivo que aumentar indiscriminadamente todos los muros. El mapa identifica "
            "las zonas que permanecen sobre el umbral y permite revisar puertas, rejas y discontinuidades.",
        ),
        para("6. Etica y marco legal", "H1Custom"),
        para(
            "El articulo 1 de la Ley General de Telecomunicaciones de Guatemala establece el uso racional y "
            "eficiente del espectro y la proteccion de usuarios y empresas proveedoras. La SIT explica que las "
            "interferencias perjudiciales pueden afectar a titulares de derechos y que su supervision requiere "
            "procedimientos tecnicos. En este contexto, emitir ruido sin confinamiento introduce riesgo para "
            "terceros ajenos al recinto.",
        ),
        para(
            "La atenuacion pasiva actua sobre la envolvente fisica y no ocupa una frecuencia mediante una nueva "
            "emision. Eticamente es preferible porque busca reducir la conectividad no autorizada dentro del "
            "objetivo sin degradar deliberadamente las comunicaciones exteriores, incluidos servicios de "
            "emergencia. Cualquier implementacion real debe coordinarse con la SIT, operadores y autoridades "
            "penitenciarias, y preservar canales autorizados para seguridad y respuesta a emergencias.",
        ),
        para("6.1 Limitaciones", "H2Custom"),
        report_table([
            ["Limitacion", "Implicacion"],
            ["Plano 2D", "No representa pisos superiores, techos ni reflexiones tridimensionales."],
            ["Modelo lineal por grosor", "No sustituye propiedades dielectricas ni calculo multicapa."],
            ["Sin multitrayectoria", "No modela reflexion, difraccion detallada ni desvanecimiento."],
            ["Parametros didacticos", "Requieren calibracion contra bibliografia y mediciones locales."],
            ["Umbral unico", "La sensibilidad real depende de tecnologia, equipo, modulacion y red."],
        ], [4.7 * cm, 10.3 * cm]),
    ])

    story.extend([
        para("7. Conclusiones y recomendaciones", "H1Custom"),
        para(
            "El simulador cumple el objetivo conceptual al relacionar frecuencia, distancia, material, grosor y "
            "potencia recibida. La comparacion mantiene fijo el plano y modifica una variable por vez, lo cual "
            "permite atribuir el cambio observado a la frecuencia o al refuerzo seleccionado.",
        ),
        report_table([
            ["Hallazgo", "Decision derivada"],
            ["850 MHz permanece sobre -95 dBm", "Usar cerramiento pesado, capas y control de aberturas."],
            ["28 GHz queda bajo el umbral", "El blindaje pasivo es especialmente favorable en mmWave."],
            ["El blindaje mejora 1900 MHz", "Reforzar fronteras criticas y revisar continuidad."],
            ["Los resultados dependen del sitio", "Medir antes y despues de cualquier intervencion."],
        ], [5.5 * cm, 9.5 * cm]),
        Spacer(1, 8),
        para(
            "La recomendacion profesional es utilizar el simulador como etapa de prefactibilidad. El siguiente "
            "nivel debe incorporar datos de materiales reales, planos tridimensionales, ventanas, ductos, pruebas "
            "de perdida de insercion y un protocolo para confirmar que la cobertura exterior no se degrada.",
            "Callout",
        ),
        para("Referencias", "H1Custom"),
        para(
            "[1] Union Internacional de Telecomunicaciones. Recomendacion UIT-R P.2040-4, Effects of building "
            "materials and structures on radiowave propagation in the range of 1 MHz to 450 GHz, 2025. "
            "https://www.itu.int/rec/R-REC-P.2040",
            "SmallCustom",
        ),
        para(
            "[2] Stone, W. C. Electromagnetic Signal Attenuation in Construction Materials. NISTIR 6055, "
            "National Institute of Standards and Technology, 1997. https://doi.org/10.6028/NIST.IR.6055",
            "SmallCustom",
        ),
        para(
            "[3] Congreso de la Republica de Guatemala. Decreto 94-96, Ley General de Telecomunicaciones. "
            "https://www.congreso.gob.gt/detalle_pdf/decretos/897",
            "SmallCustom",
        ),
        para(
            "[4] Superintendencia de Telecomunicaciones de Guatemala. Ley General de Telecomunicaciones. "
            "https://sit.gob.gt/files/LEY-GENERAL-DE-TELECOMUNICACIONES.pdf",
            "SmallCustom",
        ),
        para(
            "[5] Superintendencia de Telecomunicaciones de Guatemala. Supervision de Espectro. "
            "https://sit.gob.gt/supervision-de-espectro.html",
            "SmallCustom",
        ),
        para(
            "[6] Du, K. et al. Sub-Terahertz and mmWave Penetration Loss Measurements for Indoor "
            "Environments. IEEE ICC Workshops, 2021. https://doi.org/10.1109/ICCWorkshops50388.2021.9473898",
            "SmallCustom",
        ),
        Spacer(1, 10),
        para(
            "Nota de trazabilidad: los resultados numericos de los escenarios se obtuvieron con la version local "
            "del simulador y los parametros declarados en la seccion 4. Las fuentes respaldan la metodologia y "
            "las tendencias fisicas; no se usan para afirmar que los parametros didacticos sean universales.",
            "SmallCustom",
        ),
    ])
    return story


if __name__ == "__main__":
    document = ReportDoc(str(OUTPUT))
    document.build(build_story())
    print(OUTPUT)
