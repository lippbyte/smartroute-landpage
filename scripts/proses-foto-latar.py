"""Proses foto latar kota untuk landing page SmartRoute.

Masukan : assets/jakarta-bg.jpg (foto asli, tidak diubah)
Keluaran: assets/jakarta-bg.webp        lebar 1920px
          assets/jakarta-bg-mobile.webp lebar 900px
Keduanya hitam-putih, WebP kualitas 60-70 (turun bertahap bila perlu), masing-masing di bawah 250 KB.

Pemakaian (dari folder proyek):
    python scripts/proses-foto-latar.py
    python scripts/proses-foto-latar.py <foto-sumber> <folder-keluaran>
Butuh Pillow: pip install pillow
"""
import sys
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
TARGETS = [("jakarta-bg.webp", 1920), ("jakarta-bg-mobile.webp", 900)]
QUALITIES = (68, 64, 60, 55, 50, 45, 40)
LIMIT = 250 * 1024


def main():
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "assets" / "jakarta-bg.jpg"
    out_dir = Path(sys.argv[2]) if len(sys.argv) > 2 else ROOT / "assets"
    if not src.exists():
        sys.exit(f"Foto belum ada: {src}\nSimpan foto Jakarta sebagai assets/jakarta-bg.jpg lalu jalankan lagi.")

    photo = ImageOps.exif_transpose(Image.open(src))
    gray = ImageOps.grayscale(photo).convert("RGB")
    out_dir.mkdir(parents=True, exist_ok=True)

    for name, width in TARGETS:
        resized = gray
        if gray.width > width:
            resized = gray.resize((width, round(gray.height * width / gray.width)), Image.LANCZOS)
        dest = out_dir / name
        for quality in QUALITIES:
            resized.save(dest, "WEBP", quality=quality, method=6)
            if dest.stat().st_size <= LIMIT:
                break
        size_kb = dest.stat().st_size / 1024
        note = "" if size_kb * 1024 <= LIMIT else "  (masih di atas 250 KB, pertimbangkan foto yang lebih sederhana)"
        print(f"{dest.name}: {resized.width}x{resized.height}, kualitas {quality}, {size_kb:.0f} KB{note}")


if __name__ == "__main__":
    main()
