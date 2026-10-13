#!/bin/bash
# ==============================================================================
# Fix Rapido Aggiornamenti e Anti-Cache per KlifigUI (Mainsail)
# ==============================================================================
set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR="/var/www/klipper-configurator"

echo -e "${BLUE}==================================================================${NC}"
echo -e "${BLUE}  Attivazione Symlink Live e Anti-Cache per KlifigUI              ${NC}"
echo -e "${BLUE}==================================================================${NC}"

if [ "$EUID" -ne 0 ]; then
    SUDO="sudo"
else
    SUDO=""
fi

# 1. Ricrea il symlink diretto a ~/KlifigUI/dist
echo -e "\n${BLUE}[1/2] Collegamento simbolico (symlink) in /var/www/klipper-configurator...${NC}"
$SUDO rm -rf "$TARGET_DIR"
$SUDO ln -s "$SCRIPT_DIR/dist" "$TARGET_DIR"
$SUDO chmod -R 755 "$SCRIPT_DIR/dist"
chmod o+x "$HOME" 2>/dev/null || true
echo -e "${GREEN}[✓] Symlink collegato a $SCRIPT_DIR/dist.${NC}"

# 2. Aggiorna header anti-cache Nginx
echo -e "\n${BLUE}[2/2] Aggiornamento intestazioni Anti-Cache Nginx...${NC}"
POSSIBLE_CONFS=(
    "/etc/nginx/sites-available/mainsail"
    "/etc/nginx/conf.d/mainsail.conf"
    "/etc/nginx/sites-enabled/mainsail"
    "/etc/nginx/sites-available/default"
    "/etc/nginx/sites-enabled/default"
)

UPDATED_NGINX=0
for conf in "${POSSIBLE_CONFS[@]}"; do
    if [ -f "$conf" ] && grep -q "location /configurator" "$conf"; then
        if ! grep -q "Cache-Control" "$conf"; then
            $SUDO sed -i '/location \/configurator {/a \        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";\n        expires -1;' "$conf"
            UPDATED_NGINX=1
        fi
    fi
done

if [ "$UPDATED_NGINX" -eq 1 ]; then
    $SUDO nginx -t >/dev/null 2>&1 && ($SUDO systemctl reload nginx 2>/dev/null || $SUDO service nginx reload 2>/dev/null || true)
    echo -e "${GREEN}[✓] Regole anti-cache applicate a Nginx.${NC}"
else
    echo -e "${GREEN}[✓] Nginx già configurato correttamente.${NC}"
fi

echo -e "\n${GREEN}==================================================================${NC}"
echo -e "${GREEN}  Configurazione completata con successo!                         ${NC}"
echo -e "${GREEN}  Ora ogni 'git pull' / update da Moonraker si aggiorna subito.   ${NC}"
echo -e "${GREEN}==================================================================${NC}"
