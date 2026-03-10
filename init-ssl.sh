#!/bin/bash
set -e

if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Usage: ./init-ssl.sh <domain> <email>"
    echo "Example: ./init-ssl.sh example.com admin@example.com"
    exit 1
fi

DOMAIN=$1
EMAIL=$2

echo "==> Starting containers to serve ACME challenge..."
docker compose up -d frontend

echo "==> Waiting for nginx to start..."
sleep 5

echo "==> Requesting Let's Encrypt certificate for $DOMAIN..."
docker compose run --rm certbot certonly \
    --webroot \
    -w /var/www/certbot \
    -d "$DOMAIN" \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    --force-renewal

echo "==> Restarting nginx to pick up the real certificate..."
docker compose restart frontend

echo "==> Starting all services..."
docker compose up -d

echo ""
echo "Done! SSL certificate for $DOMAIN has been obtained."
echo "Auto-renewal is handled by the certbot container every 12 hours."
