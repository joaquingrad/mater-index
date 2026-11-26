#!/bin/bash
# Prende MATER.INDEX: arranca el servidor y abre Chromium.
cd "$(dirname "$0")"
python3 servidor.py &
sleep 2
NAV="$(command -v chromium-browser || command -v chromium)"
"$NAV" http://127.0.0.1:8000/splash.html &
wait
