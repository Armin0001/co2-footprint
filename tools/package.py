"""Zips extension/ into dist/co2-footprint-<version>.zip, ready to upload to the Chrome Web Store.

    python tools/package.py
"""
import json
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "extension"


def main():
    manifest = json.loads((SRC / "manifest.json").read_text(encoding="utf-8"))
    dist = ROOT / "dist"
    dist.mkdir(exist_ok=True)
    target = dist / f"co2-footprint-{manifest['version']}.zip"
    with zipfile.ZipFile(target, "w", zipfile.ZIP_DEFLATED) as zf:
        for path in sorted(SRC.rglob("*")):
            if path.is_file():
                zf.write(path, path.relative_to(SRC).as_posix())  # manifest.json must sit at the zip root
    print(f"wrote {target.relative_to(ROOT).as_posix()} ({target.stat().st_size / 1000:.1f} kB)")


if __name__ == "__main__":
    main()
