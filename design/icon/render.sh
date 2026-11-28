#!/bin/sh
# Renders the app icon PNGs in assets/images from the SVGs in this folder. Needs Google Chrome.
set -e
cd "$(dirname "$0")"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
OUT="$(cd ../../assets/images && pwd)"
render() {
  printf '<!doctype html><style>html,body{margin:0;background:transparent}img{display:block;width:%spx;height:%spx}</style><img src="%s">' "$2" "$2" "$PWD/$1" > /tmp/lankadina-icon.html
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --allow-file-access-from-files \
    --default-background-color=00000000 --force-device-scale-factor=1 \
    --window-size="$2,$2" --screenshot="$OUT/$3" "file:///tmp/lankadina-icon.html" >/dev/null 2>&1
  echo "$3"
}
render icon.svg 1024 icon.png
render android-foreground.svg 1024 android-icon-foreground.png
render android-monochrome.svg 1024 android-icon-monochrome.png
render splash.svg 512 splash-icon.png
render icon.svg 48 favicon.png
rm -f /tmp/lankadina-icon.html
