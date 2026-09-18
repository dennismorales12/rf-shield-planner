from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "screenshots"
OUT.mkdir(parents=True, exist_ok=True)

W, H = 1600, 900
NAVY = "#17324D"
BLUE = "#2F6B9A"
CYAN = "#39A9DB"
RED = "#D65A4A"
GREEN = "#2E8B57"
GRAY = "#E8EDF1"
DARK = "#20262E"


def font(size, bold=False):
    candidates = [
        Path("C:/Windows/Fonts/aptos-bold.ttf" if bold else "C:/Windows/Fonts/aptos.ttf"),
        Path("C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf"),
    ]
    for candidate in candidates:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size)
    return ImageFont.load_default()


def base(title, subtitle):
    image = Image.new("RGB", (W, H), "white")
    draw = ImageDraw.Draw(image)
    draw.rectangle((0, 0, W, 128), fill=NAVY)
    draw.text((70, 30), title, font=font(42, True), fill="white")
    draw.text((72, 91), subtitle, font=font(24), fill="#DDEAF3")
    return image, draw


def arrow(draw, start, end, color, width=14):
    draw.line((start, end), fill=color, width=width)
    ex, ey = end
    sx, sy = start
    dx, dy = ex - sx, ey - sy
    length = max((dx * dx + dy * dy) ** 0.5, 1)
    ux, uy = dx / length, dy / length
    px, py = -uy, ux
    back = 34
    wing = 18
    p1 = (ex - ux * back + px * wing, ey - uy * back + py * wing)
    p2 = (ex - ux * back - px * wing, ey - uy * back - py * wing)
    draw.polygon((end, p1, p2), fill=color)


def save_penetration():
    image, draw = base(
        "Dibujo 1 · Frecuencia y penetración",
        "Mismo muro, comportamiento conceptual diferente",
    )
    draw.rounded_rectangle((95, 200, 1505, 805), radius=28, fill="#F7F9FB", outline="#CBD6DF", width=3)
    draw.rectangle((750, 260, 850, 750), fill="#7D8790", outline=DARK, width=4)
    for y in range(280, 735, 42):
        draw.line((758, y, 842, y), fill="#BFC7CE", width=4)
    draw.text((680, 770), "Muro sólido", font=font(28, True), fill=DARK)

    draw.text((150, 275), "850 MHz", font=font(42, True), fill=BLUE)
    draw.text((150, 328), "λ ≈ 35.3 cm", font=font(28), fill=DARK)
    arrow(draw, (330, 445), (1265, 445), BLUE, 18)
    draw.text((930, 345), "Parte importante continúa", font=font(28, True), fill=BLUE)
    draw.text((930, 386), "Mayor capacidad de penetración", font=font(24), fill=DARK)

    draw.text((150, 535), "28 GHz", font=font(42, True), fill=RED)
    draw.text((150, 588), "λ ≈ 10.7 mm", font=font(28), fill=DARK)
    arrow(draw, (330, 665), (735, 665), RED, 18)
    for offset in (0, 38, 76):
        draw.line((875, 625 + offset, 945, 590 + offset), fill=RED, width=9)
    draw.text((980, 610), "Reflexión y absorción", font=font(28, True), fill=RED)
    draw.text((980, 650), "Menor penetración", font=font(24), fill=DARK)
    image.save(OUT / "dibujo_01_frecuencia_penetracion.png")


def save_continuity():
    image, draw = base(
        "Dibujo 2 · Continuidad del cerramiento",
        "El punto débil puede ser una abertura, una puerta o una reja",
    )
    draw.text((115, 185), "Cerramiento continuo", font=font(34, True), fill=GREEN)
    draw.rectangle((125, 260, 680, 725), outline=GREEN, width=34)
    draw.ellipse((330, 420, 470, 560), fill=BLUE, outline=NAVY, width=5)
    draw.text((353, 468), "RF", font=font(38, True), fill="white")
    for y in (360, 490, 620):
        arrow(draw, (470, y), (620, y), GREEN, 10)
        draw.line((620, y, 655, y), fill=RED, width=12)
        draw.line((635, y - 18, 635, y + 18), fill=RED, width=7)
    draw.text((210, 760), "Trayectos interceptados", font=font(26), fill=DARK)

    draw.text((900, 185), "Cerramiento con abertura", font=font(34, True), fill=RED)
    draw.line((900, 275, 900, 725), fill=RED, width=34)
    draw.line((900, 275, 1450, 275), fill=RED, width=34)
    draw.line((1450, 275, 1450, 725), fill=RED, width=34)
    draw.line((900, 725, 1130, 725), fill=RED, width=34)
    draw.line((1260, 725, 1450, 725), fill=RED, width=34)
    draw.ellipse((1080, 420, 1220, 560), fill=BLUE, outline=NAVY, width=5)
    draw.text((1103, 468), "RF", font=font(38, True), fill="white")
    arrow(draw, (1150, 565), (1195, 800), RED, 13)
    draw.text((1060, 760), "Fuga por el acceso", font=font(26, True), fill=RED)
    image.save(OUT / "dibujo_02_continuidad_cerramiento.png")


def save_power_budget():
    image, draw = base(
        "Dibujo 3 · Balance de potencias",
        "La potencia recibida se obtiene restando pérdidas a la potencia inicial",
    )
    labels = [
        (("Potencia", "transmitida"), "Pt = 43 dBm", BLUE),
        (("Espacio libre",), "− FSPL", "#6C7A89"),
        (("Obstáculos",), "− Σ pérdidas", RED),
        (("Potencia", "recibida"), "Pr", GREEN),
        (("Decisión",), "Pr < −95 dBm", NAVY),
    ]
    x_positions = [70, 380, 690, 1000, 1310]
    box_w = 225
    for index, ((title_lines, value, color), x) in enumerate(zip(labels, x_positions)):
        draw.rounded_rectangle((x, 305, x + box_w, 560), radius=24, fill="#F7F9FB", outline=color, width=6)
        for line_index, title in enumerate(title_lines):
            tw = draw.textbbox((0, 0), title, font=font(22, True))[2]
            draw.text((x + (box_w - tw) / 2, 335 + line_index * 32), title, font=font(22, True), fill=color)
        vw = draw.textbbox((0, 0), value, font=font(31, True))[2]
        draw.text((x + (box_w - vw) / 2, 445), value, font=font(31, True), fill=DARK)
        if index < len(labels) - 1:
            arrow(draw, (x + box_w + 10, 435), (x_positions[index + 1] - 14, 435), NAVY, 9)
    draw.rounded_rectangle((285, 665, 1315, 790), radius=22, fill="#EAF2F8", outline=BLUE, width=3)
    formula = "Pr = Pt + ganancias − FSPL − pérdidas de muros, puertas y rejas"
    fw = draw.textbbox((0, 0), formula, font=font(31, True))[2]
    draw.text(((W - fw) / 2, 710), formula, font=font(31, True), fill=NAVY)
    image.save(OUT / "dibujo_03_balance_potencias.png")


if __name__ == "__main__":
    save_penetration()
    save_continuity()
    save_power_budget()
    for path in sorted(OUT.glob("dibujo_*.png")):
        print(path)
