#!/bin/bash
# ==============================================================================
# Installer Automatico per Klipper Configurator (Mainsail WebUI)
# ==============================================================================
set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================================================${NC}"
echo -e "${BLUE}  Installazione Klipper Configurator per Mainsail WebUI           ${NC}"
echo -e "${BLUE}==================================================================${NC}"

# Verifica privilegi sudo
if [ "$EUID" -ne 0 ]; then
    echo -e "${YELLOW}[!] Lo script richiede permessi di amministratore per configurare Nginx e /var/www.${NC}"
    echo -e "${YELLOW}    Verrà richiesto sudo per completare l'installazione.${NC}"
    SUDO="sudo"
else
    SUDO=""
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR="/var/www/klipper-configurator"

# 1. Rileva la cartella di configurazione di Klipper / Mainsail
echo -e "\n${BLUE}[1/4] Ricerca della cartella di configurazione Klipper...${NC}"
USER_HOME="${HOME:-/home/$(logname 2>/dev/null || echo pi)}"

if [ -d "$USER_HOME/printer_data/config" ]; then
    CONFIG_DIR="$USER_HOME/printer_data/config"
    echo -e "${GREEN}[✓] Rilevata configurazione moderna Klipper:${NC} $CONFIG_DIR"
elif [ -d "$USER_HOME/klipper_config" ]; then
    CONFIG_DIR="$USER_HOME/klipper_config"
    echo -e "${GREEN}[✓] Rilevata configurazione legacy Klipper:${NC} $CONFIG_DIR"
elif [ -d "/home/pi/printer_data/config" ]; then
    CONFIG_DIR="/home/pi/printer_data/config"
    echo -e "${GREEN}[✓] Rilevata configurazione Klipper:${NC} $CONFIG_DIR"
else
    echo -e "${YELLOW}[?] Impossibile individuare automaticamente la cartella config.${NC}"
    CONFIG_DIR="$USER_HOME/printer_data/config"
    echo -e "    Verrà utilizzata: $CONFIG_DIR"
fi

# 2. Collegamento dei file web in /var/www/klipper-configurator tramite symlink
echo -e "\n${BLUE}[2/4] Collegamento dei file web da $SCRIPT_DIR/dist a $TARGET_DIR...${NC}"
git config core.fileMode false 2>/dev/null || true
$SUDO rm -rf "$TARGET_DIR"
$SUDO ln -s "$SCRIPT_DIR/dist" "$TARGET_DIR"
chmod o+x "$USER_HOME" 2>/dev/null || true
find "$SCRIPT_DIR/dist" -type d -exec chmod 755 {} + 2>/dev/null || true
find "$SCRIPT_DIR/dist" -type f -exec chmod 644 {} + 2>/dev/null || true
echo -e "${GREEN}[✓] File web collegati con successo (aggiornamenti git istantanei).${NC}"

# 3. Configurazione Nginx per aggiungere /configurator
echo -e "\n${BLUE}[3/4] Configurazione del server web Nginx...${NC}"

NGINX_CONF_TARGET=""
POSSIBLE_CONFS=(
    "/etc/nginx/sites-available/mainsail"
    "/etc/nginx/conf.d/mainsail.conf"
    "/etc/nginx/sites-enabled/mainsail"
    "/etc/nginx/sites-available/default"
    "/etc/nginx/sites-enabled/default"
)

for conf in "${POSSIBLE_CONFS[@]}"; do
    if [ -f "$conf" ]; then
        NGINX_CONF_TARGET="$conf"
        break
    fi
done

if [ -n "$NGINX_CONF_TARGET" ]; then
    echo -e "    File Nginx rilevato: $NGINX_CONF_TARGET"

    if grep -q "location /configurator" "$NGINX_CONF_TARGET"; then
        echo -e "${YELLOW}[!] La rotta /configurator è già presente in $NGINX_CONF_TARGET.${NC}"
    else
        echo -e "    Inserimento blocco location in $NGINX_CONF_TARGET..."
        
        # Backup del file nginx
        $SUDO cp "$NGINX_CONF_TARGET" "${NGINX_CONF_TARGET}.bak.$(date +%s)"
        
        # Inserisci il blocco prima dell'ultima parentesi graffa chiusa
        $SUDO awk '
        /^[[:space:]]*}[[:space:]]*$/ && !inserted {
            print "    # Klipper Configurator per Mainsail"
            print "    location /configurator {"
            print "        alias /var/www/klipper-configurator;"
            print "        index index.html;"
            print "        try_files $uri $uri/ /configurator/index.html;"
            print "        add_header Cache-Control \"no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0\";"
            print "        expires -1;"
            print "    }"
            print ""
            inserted=1
        }
        { print }
        ' "$NGINX_CONF_TARGET" | $SUDO tee "${NGINX_CONF_TARGET}.tmp" > /dev/null
        
        $SUDO mv "${NGINX_CONF_TARGET}.tmp" "$NGINX_CONF_TARGET"
        echo -e "${GREEN}[✓] Regola Nginx aggiunta.${NC}"
    fi

    # Test e reload Nginx
    if $SUDO nginx -t > /dev/null 2>&1; then
        $SUDO systemctl reload nginx 2>/dev/null || $SUDO service nginx reload 2>/dev/null || true
        echo -e "${GREEN}[✓] Nginx ricaricato correttamente.${NC}"
    else
        echo -e "${RED}[X] Errore nel test di sintassi Nginx. Ripristino backup...${NC}"
        # Trova ultimo backup e ripristina
        LATEST_BAK=$(ls -t "${NGINX_CONF_TARGET}.bak."* 2>/dev/null | head -n 1)
        if [ -n "$LATEST_BAK" ]; then
            $SUDO cp "$LATEST_BAK" "$NGINX_CONF_TARGET"
            echo -e "    File originale ripristinato."
        fi
    fi
else
    echo -e "${YELLOW}[!] Nessun file di configurazione Nginx standard trovato.${NC}"
    echo -e "    Puoi configurare manualmente Nginx usando il file: $SCRIPT_DIR/nginx_snippet.conf"
fi

# 4. Configurazione della barra laterale di Mainsail via navi.json
echo -e "\n${BLUE}[4/4] Aggiunta della scheda nel menu laterale di Mainsail (.theme/navi.json)...${NC}"
THEME_DIR="$CONFIG_DIR/.theme"
mkdir -p "$THEME_DIR"
NAVI_FILE="$THEME_DIR/navi.json"

if [ -f "$NAVI_FILE" ]; then
    echo -e "    File navi.json esistente trovato in $NAVI_FILE."
    if grep -q "Klipper Config" "$NAVI_FILE"; then
        echo -e "${YELLOW}[!] La voce Klipper Config è già presente in navi.json.${NC}"
    else
        # Aggiorna il JSON unendo la nuova voce
        python3 -c "
import json
try:
    with open('$NAVI_FILE', 'r') as f:
        data = json.load(f)
    with open('$SCRIPT_DIR/navi.json', 'r') as f:
        new_entry = json.load(f)
    if isinstance(data, list):
        data.extend(new_entry)
        with open('$NAVI_FILE', 'w') as f:
            json.dump(data, f, indent=2)
        print('Voce aggiunta con successo')
except Exception as e:
    print('Errore merge JSON:', e)
" 2>/dev/null || cp "$SCRIPT_DIR/navi.json" "$NAVI_FILE"
        echo -e "${GREEN}[✓] navi.json aggiornato.${NC}"
    fi
else
    cp "$SCRIPT_DIR/navi.json" "$NAVI_FILE"
    echo -e "${GREEN}[✓] Creato nuovo $NAVI_FILE con la scheda Klipper Config.${NC}"
fi

echo -e "\n${GREEN}==================================================================${NC}"
echo -e "${GREEN}  Installazione completata con successo!                          ${NC}"
echo -e "${GREEN}==================================================================${NC}"
echo -e "1. Apri Mainsail nel tuo browser e premi ${YELLOW}CTRL + F5${NC} (Hard Refresh)."
echo -e "2. Troverai la nuova scheda ${BLUE}'Klipper Config'${NC} nel menu laterale sinistro."
echo -e "3. Puoi accedere anche direttamente all'indirizzo: ${YELLOW}http://<IP-DELLA-STAMPANTE>/configurator/${NC}"
echo ""
