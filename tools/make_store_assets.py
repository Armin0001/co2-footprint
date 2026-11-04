"""Renders the Chrome Web Store images into store/ with headless Chrome.

    python tools/make_store_assets.py
"""
import functools
import http.server
import shutil
import subprocess
import tempfile
import threading
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "store"
BROWSERS = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
]
ASSETS = {
    "screenshot-1280x800.png": ("tools/store-assets/screenshot.html", 1280, 800),
    "promo-440x280.png": ("tools/store-assets/promo.html", 440, 280),
}


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def serve(root):
    handler = functools.partial(QuietHandler, directory=root)
    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    return server


def main():
    browser = next((b for b in BROWSERS if Path(b).exists()), None)
    if not browser:
        raise SystemExit("Chrome or Edge not found")
    OUT.mkdir(exist_ok=True)
    server = serve(ROOT)
    port = server.server_address[1]
    with tempfile.TemporaryDirectory() as profile:
        for name, (page, width, height) in ASSETS.items():
            target = OUT / name
            subprocess.run([
                browser, "--headless=new", "--disable-gpu", "--hide-scrollbars",
                f"--user-data-dir={profile}", f"--window-size={width},{height}",
                "--virtual-time-budget=4000", f"--screenshot={target}",
                f"http://127.0.0.1:{port}/{page}",
            ], check=True, capture_output=True)
            # The store rejects anything but the exact size, and wants no transparency.
            image = Image.open(target).convert("RGB")
            if image.size != (width, height):
                image = image.crop((0, 0, width, height))
            image.save(target)
            print(f"wrote store/{name} {image.size}")
    server.shutdown()
    shutil.copy(ROOT / "extension" / "icons" / "icon128.png", OUT / "icon-128x128.png")
    print("wrote store/icon-128x128.png")


if __name__ == "__main__":
    main()
