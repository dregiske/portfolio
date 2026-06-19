#!/usr/bin/env bash
set -euo pipefail
# nvm node isn't on the default PATH — add it explicitly
export PATH=/root/.nvm/versions/node/v20.20.2/bin:$PATH

SRC=/root/portfolio
WEB=/var/www/portfolio

cd "$SRC"
git fetch origin
git reset --hard origin/main
if [ -f package-lock.json ]; then npm ci; else npm install; fi
npm run build
rsync -a --delete dist/ "$WEB"/