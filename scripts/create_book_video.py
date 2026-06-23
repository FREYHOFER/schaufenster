#!/usr/bin/env python3
"""Prepare a 3D book project for the storefront and optionally render an MP4."""

from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import unicodedata
from pathlib import Path
from typing import Any

from PIL import Image, ImageOps

SCRIPT_DIR = Path(__file__).resolve().parent
WORKSPACE = SCRIPT_DIR.parent
PUBLIC_DIR = WORKSPACE / "public"


def normalize(value: str) -> str:
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-z0-9]+", " ", value.casefold()).strip()


def slugify(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", normalize(value)).strip("-")[:70] or "book"


def extract_isbn(value: str) -> str:
    digits = re.sub(r"\D", "", value)
    if len(digits) != 13 or not digits.startswith(("978", "979")):
        raise ValueError("--isbn must be a valid 13-digit ISBN beginning with 978 or 979.")
    return digits


def is_relative_to(path: Path, parent: Path) -> bool:
    try:
        path.relative_to(parent)
        return True
    except ValueError:
        return False


def copy_cover(source: Path, destination: Path) -> tuple[int, int]:
    with Image.open(source) as image:
        cleaned = ImageOps.exif_transpose(image).convert("RGB")
        if cleaned.width < 400 or cleaned.height < 600:
            scale = max(400 / cleaned.width, 600 / cleaned.height)
            cleaned = cleaned.resize(
                (round(cleaned.width * scale), round(cleaned.height * scale)),
                Image.Resampling.LANCZOS,
            )
        destination.parent.mkdir(parents=True, exist_ok=True)
        cleaned.save(destination, format="JPEG", quality=96, optimize=True)
        return cleaned.size


def prepare_cover(source: Path, project_dir: Path, cover_url: str) -> tuple[Path, str, int, int]:
    source = source.expanduser().resolve()
    if not source.is_file():
        raise FileNotFoundError(f"Cover file not found: {source}")

    with Image.open(source) as image:
        width, height = ImageOps.exif_transpose(image).size

    if cover_url:
        return source, cover_url, width, height

    if is_relative_to(source, PUBLIC_DIR):
        public_url = "/" + source.relative_to(PUBLIC_DIR).as_posix()
        return source, public_url, width, height

    destination = project_dir / "cover.jpg"
    width, height = copy_cover(source, destination)
    public_url = "/" + destination.relative_to(PUBLIC_DIR).as_posix() if is_relative_to(destination, PUBLIC_DIR) else "cover.jpg"
    return destination, public_url, width, height


def find_ffmpeg() -> Path:
    configured = os.environ.get("FFMPEG_PATH", "")
    if configured and Path(configured).exists():
        return Path(configured)
    executable = shutil.which("ffmpeg")
    if executable:
        return Path(executable)
    try:
        import imageio_ffmpeg

        return Path(imageio_ffmpeg.get_ffmpeg_exe())
    except (ImportError, RuntimeError):
        pass
    raise RuntimeError("ffmpeg not found. Install imageio-ffmpeg or set FFMPEG_PATH.")


def find_chrome() -> Path:
    configured = os.environ.get("CHROME_PATH", "")
    candidates = [
        Path(configured) if configured else None,
        Path("C:/Program Files/Google/Chrome/Application/chrome.exe"),
        Path("C:/Program Files (x86)/Google/Chrome/Application/chrome.exe"),
    ]
    for candidate in candidates:
        if candidate and candidate.exists():
            return candidate
    raise RuntimeError("Google Chrome not found. Set CHROME_PATH.")


def render(project_path: Path, output_dir: Path) -> None:
    environment = os.environ.copy()
    environment["FFMPEG_PATH"] = str(find_ffmpeg())
    environment["CHROME_PATH"] = str(find_chrome())
    command = [
        shutil.which("node") or "node",
        str(SCRIPT_DIR / "render_book_video.cjs"),
        "--project",
        str(project_path),
        "--output-dir",
        str(output_dir),
    ]
    subprocess.run(command, cwd=WORKSPACE, env=environment, check=True)


def project_config(args: argparse.Namespace, isbn: str, cover_path: Path, cover_url: str, width: int, height: int) -> dict[str, Any]:
    pages = max(32, args.pages)
    approximate_mm = pages * 0.055 + 2.0
    return {
        "title": args.title,
        "author": args.author,
        "isbn": isbn,
        "label": args.label,
        "hook": args.hook,
        "feature": args.feature,
        "cta_prefix": args.cta_prefix,
        "cta": args.cta,
        "pages": pages,
        "cover_ratio": round(width / height, 5),
        "depth_ratio": round(min(0.25, max(0.075, approximate_mm / 210)), 5),
        "duration_seconds": args.duration,
        "cover_path": os.path.relpath(cover_path, args.project_dir).replace("\\", "/"),
        "cover_url": cover_url,
    }


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Create one storefront 3D book project.")
    parser.add_argument("title", help="Displayed book title")
    parser.add_argument("--isbn", required=True)
    parser.add_argument("--cover", type=Path, required=True, help="Local front-cover image")
    parser.add_argument("--cover-url", default="", help="Public URL for the cover; derived for files below public/")
    parser.add_argument("--author", required=True)
    parser.add_argument("--pages", type=int, default=320)
    parser.add_argument("--label", default="BUCHEMPFEHLUNG")
    parser.add_argument("--hook", default="NEU FÜR DEINE LESELISTE")
    parser.add_argument("--feature", default="JETZT ENTDECKEN")
    parser.add_argument("--cta-prefix", default="JETZT BEI")
    parser.add_argument("--cta", default="SCHNELSENER BÜCHERECK")
    parser.add_argument("--duration", type=float, default=15)
    parser.add_argument("--slug", default="", help="Output directory name; defaults to the ISBN")
    parser.add_argument("--output-root", type=Path, default=PUBLIC_DIR / "book-projects")
    parser.add_argument("--render", action="store_true", help="Also encode MP4, stills and a hero image")
    return parser


def main() -> int:
    args = build_parser().parse_args()
    if args.duration <= 0:
        raise ValueError("--duration must be greater than zero.")
    isbn = extract_isbn(args.isbn)
    output_root = args.output_root.expanduser().resolve()
    args.project_dir = output_root / (args.slug or isbn)
    args.project_dir.mkdir(parents=True, exist_ok=True)

    cover_path, cover_url, width, height = prepare_cover(args.cover, args.project_dir, args.cover_url)
    project = project_config(args, isbn, cover_path, cover_url, width, height)
    project_path = args.project_dir / "project.json"
    project_path.write_text(json.dumps(project, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    relative_project = project_path.relative_to(PUBLIC_DIR).as_posix() if is_relative_to(project_path, PUBLIC_DIR) else ""
    if relative_project:
        print(f"Preview: http://127.0.0.1:5173/book-template/generic-video.html?project=/{relative_project}")
    print(f"Project: {project_path}")

    if args.render:
        output_dir = args.project_dir / "rendered"
        render(project_path, output_dir)
        print(f"Video: {output_dir / 'book-video.mp4'}")
        print(f"Hero: {output_dir / 'hero.png'}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (ValueError, RuntimeError, FileNotFoundError, subprocess.CalledProcessError) as error:
        print(f"ERROR: {error}", file=sys.stderr)
        raise SystemExit(1)
