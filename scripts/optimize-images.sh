#!/usr/bin/env bash
#
# Regenerate the shipped images in public/ from the originals in assets-src/.
#
# Every source is resized to roughly twice the largest size it is ever displayed
# at — enough for a 2× display and not a pixel more — then written twice: a WebP
# that almost every browser takes, and a JPEG beside it for the ones that don't.
# The <Photo> component pairs the two by filename, so they must keep the same
# stem and live in the same directory.
#
# Both outputs are encoded from a lossless resize of the original, never from
# each other: chaining one lossy encoder into the next is how images quietly rot
# across re-runs. The originals in assets-src/ are the only master copies, and
# they are deliberately outside public/ so they never ship.
#
# Usage:    ./scripts/optimize-images.sh
# Requires: sips (macOS built-in), cwebp (brew install webp)

set -euo pipefail
cd "$(dirname "$0")/.."

# The bound is on the LONGER edge, which is what `sips -Z` constrains — for the
# portrait that is its height, not its width.
#
# relative path under assets-src/ | max long edge | jpeg quality | webp quality
IMAGES=(
  "about/acm_group.jpg|1100|70|75"
  # Already the smallest it can be: at 450×800 the original barely covers the
  # 250×320 frame on a 2× display, so this one is only ever re-encoded.
  "hero/profile.jpg|800|82|82"
  "projects/thefraynews.png|750|80|80"
  "projects/cashoutlogo.png|750|80|80"
  "projects/code.png|750|82|82"
)

command -v cwebp >/dev/null || {
  echo "cwebp not found — brew install webp" >&2
  exit 1
}

printf '%-28s %10s %10s %10s\n' SOURCE ORIGINAL JPEG WEBP
total_before=0
total_after=0

for entry in "${IMAGES[@]}"; do
  IFS='|' read -r rel maxw jq wq <<<"$entry"
  src="assets-src/$rel"
  stem="public/${rel%.*}"
  [ -f "$src" ] || {
    echo "missing source: $src" >&2
    exit 1
  }
  mkdir -p "$(dirname "$stem")"

  tmp=$(mktemp -d)
  sips -Z "$maxw" --setProperty format png "$src" --out "$tmp/resized.png" >/dev/null
  sips --setProperty format jpeg --setProperty formatOptions "$jq" \
    "$tmp/resized.png" --out "$stem.jpg" >/dev/null
  cwebp -quiet -q "$wq" "$tmp/resized.png" -o "$stem.webp"
  rm -rf "$tmp"

  before=$(stat -f%z "$src")
  jpg=$(stat -f%z "$stem.jpg")
  webp=$(stat -f%z "$stem.webp")
  total_before=$((total_before + before))
  # Only one of the pair is ever downloaded, and it is almost always the WebP.
  total_after=$((total_after + webp))
  printf '%-28s %9sK %9sK %9sK\n' "$rel" $((before / 1024)) $((jpg / 1024)) $((webp / 1024))
done

printf '\n%-28s %9sK %20sK\n' TOTAL $((total_before / 1024)) $((total_after / 1024))
