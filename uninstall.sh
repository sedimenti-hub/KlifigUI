#!/bin/bash
# ==============================================================================
# Disinstallazione di Klipper Configurator
# ==============================================================================
set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}==================================================================${NC}"
echo -e "${BLUE}  Disinstallazione Klipper Configurator                           ${NC}"
echo -e "${BLUE}==================================================================${NC}"

if [ "$EUID" -ne 0 ]; then
    SUDO="sudo"
else
    SUDO=""
fi

# Rimozione cartella web
echo -e "Rimozione file da /var/www/klipper-configurator..."
$SUDO rm -rf /var/www/klipper-configurator

# Rimozione da navi.json
USER_HOME="${HOME:-/home/$(logname 2>/dev/null || echo pi)}"
for base in "$USER_HOME/printer_data/config" "$USER_HOME/klipper_config" "/home/pi/printer_data/config"; do
    NAVI="$base/.theme/navi.json"
    if [ -f "$NAVI" ]; then
        python3 -c "
import json
try:
    with open('$NAVI', 'r') as f:
        data = json.load(f)
    if isinstance(data, list):
        data = [x for x in data if x.get('title') != 'Klipper Config']
        with open('$NAVI', 'w') as f:
            json.dump(data, f, indent=2)
except Exception:
    pass
" 2>/dev/null || true
    fi
done

# Reload Nginx
$SUDO systemctl reload nginx 2>/dev/null || true

echo -e "${GREEN}[✓] Disinstallazione completata. Ricarica Mainsail (F5).${NC}"
