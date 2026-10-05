#!/usr/bin/env bash
# One-time EC2 bootstrap for childcare-frontend (Ubuntu / Debian).
# Usage: bash scripts/ec2-bootstrap.sh
set -euo pipefail

APP_PATH="${APP_PATH:-$HOME/apps/childcare-frontend}"

echo "==> Creating app directory: $APP_PATH"
mkdir -p "$APP_PATH"

if ! command -v node >/dev/null 2>&1; then
  echo "==> Installing Node.js 22"
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

echo "==> Node $(node -v) / npm $(npm -v)"

if ! command -v pm2 >/dev/null 2>&1; then
  echo "==> Installing PM2"
  sudo npm install -g pm2
fi

echo "==> Enabling PM2 startup on reboot"
sudo env PATH="$PATH" pm2 startup systemd -u "$USER" --hp "$HOME" | tail -n 1 | bash || true

echo
echo "Bootstrap complete."
echo "Next: add GitHub Actions secrets and push to main."
echo "  App path default: $APP_PATH"
echo "  App listens on:   http://0.0.0.0:3001"
echo "  Open EC2 security group for SSH + port 3001 (or put nginx on 80/443)."
