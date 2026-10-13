# 🎛️ Klipper Configurator per Mainsail WebUI

Un modulo visuale e moderno per la WebUI di **Mainsail**, progettato per permettere la configurazione guidata di Klipper (`printer.cfg` o `config.cfg`) attraverso un'interfaccia ricca di tab, formbox, interruttori e menu a tendina.

Si installa con un solo comando ed inserisce una scheda dedicata (**Klipper Config**) direttamente nel menu laterale di Mainsail grazie al sistema nativo di navigazione (`.theme/navi.json`).

---

## 📸 Caratteristiche Principali

- **Integrazione Nativa in Mainsail**: Aggiunge una voce con icona ingranaggio nella sidebar sinistra di Mainsail.
- **Design Mainsail Dark Theme**: Perfetta coerenza grafica con l'interfaccia scura di Mainsail, ottimizzata per desktop, tablet e smartphone.
- **9 Categorie di Configurazione Dedicate**:
  1. **Stampante**: cinematica, velocità massima, accelerazione, cruise ratio, square corner velocity, dinamica asse Z.
  2. **Cinematica**: limiti di corsa assi X, Y, Z (position_min, max, endstop), velocità homing, preset per stampanti popolari (Ender 3, Voron 2.4/Trident/V0, Prusa), parametri Delta (bracci e raggi).
  3. **Host/MCU**: configurazione connessione Seriale USB / CAN Bus (`canbus_uuid`), sensori termici Raspberry Pi / Host e chip MCU, supporto MCU secondari (Toolhead CAN).
  4. **Stepper (compresi i driver)**: gestione completa assi X, Y, Z e Z1 (Dual Z); pin di controllo (step, dir, enable con inversione `!`), microstep, rotazione e calcolatore `rotation_distance`, finecorsa fisici o **Sensorless Homing** (StallGuard SGTHRS); driver TMC intelligenti (TMC2209, TMC2208, TMC2226, TMC5160, TMC2240) con correnti operative (RMS) e StealthChop.
  5. **Extruder**: preset meccanica (Bondtech BMG, Orbiter 2.0, Voron CW2, Sherpa Mini, Creality), diametro ugello e filamento, Pressure Advance, selezione tipo termistore da menu a tendina (EPCOS, ATC Semitec, PT1000, MAX31865, ecc.), pin riscaldatore e regolazione PID.
  6. **Bed**: sensore temperatura piatto, pin riscaldatore, temperature min/max e algoritmo di controllo PID/watermark.
  7. **Misceleus**: ventola raffreddamento pezzo (`[fan]`), ventola hotend (`[heater_fan]`), moduli `[virtual_sdcard]`, `[pause_resume]`, `[display_status]`, `[respond]` e idle timeout.
  8. **Macro**: gestore visuale di macro G-Code (`[gcode_macro ...]`), con editor di script, descrizioni e pulsante per inserire automaticamente i template essenziali (`START_PRINT`, `END_PRINT`, `CANCEL_PRINT`, `PAUSE`, `RESUME`, `M600`).
  9. **Calibration**: configurazione sonda o BLTouch/CR Touch (offset X, Y, Z, pin e campioni), Homing sicuro al centro (`[safe_z_home]`), griglia di livellamento piatto (`[bed_mesh]`) e compensazione risonanze (`[input_shaper]`).

- **Sicurezza Totale dei File**:
  - **Backup Automatico**: Prima di ogni salvataggio su Moonraker, viene generata una copia di sicurezza timestamped (es. `printer.cfg.bak.20261012154500`).
  - **Preservazione SAVE_CONFIG**: Il blocco generato automaticamente da Klipper per calibrazioni PID, offset e mesh (`#*# <---------------------- SAVE_CONFIG ---------------------->`) viene mantenuto intatto al 100%.
  - **Anteprima CFG & Diff**: Visualizza il codice generato prima di salvare con un clic.
  - **Salva & Riavvia**: Salva la configurazione e invia immediatamente il comando `FIRMWARE_RESTART` a Klipper.

---

## 🚀 Installazione Rapida (Raspberry Pi / MainsailOS)

Collegati alla tua stampante tramite SSH ed esegui i seguenti comandi:

```bash
cd ~
git clone https://github.com/mattiadev/klipper-configurator.git
cd klipper-configurator
chmod +x install.sh
./install.sh
```

Lo script automatico:
1. Individua la tua cartella di configurazione Klipper (`~/printer_data/config`).
2. Copia i file dell'interfaccia web in `/var/www/klipper-configurator`.
3. Configura Nginx aggiungendo la rotta `/configurator`.
4. Aggiunge la nuova voce **Klipper Config** nel file `.theme/navi.json` di Mainsail.

Al termine, apri Mainsail nel browser e ricarica con **CTRL + F5**: troverai la nuova scheda nel menu laterale!

---

## 🔄 Aggiornamenti Automatici da Mainsail

Puoi abilitare gli aggiornamenti con 1 clic direttamente dall'interfaccia di Mainsail (sezione **Macchina -> Gestore Aggiornamenti**).

Aggiungi questo blocco in fondo al tuo file `~/printer_data/config/moonraker.conf`:

```ini
[update_manager klipper-configurator]
type: git_repo
path: ~/klipper-configurator
origin: https://github.com/mattiadev/klipper-configurator.git
primary_branch: main
is_system_service: False
managed_services:
    nginx
```

---

## 📂 Struttura del Progetto

```
KlipperUI/
├── dist/                          # Web Application completa e leggera (Zero build, Zero Node.js)
│   ├── index.html                 # Interfaccia a 9 schede
│   ├── css/
│   │   └── style.css              # Dark theme Mainsail
│   └── js/
│       ├── app.js                 # Controller UI e gestione formbox
│       ├── klipper-parser.js      # Parser/Serializzatore printer.cfg
│       ├── default-config.js      # Costanti, sensori, driver e macro template
│       └── moonraker-client.js    # Client REST Moonraker
├── navi.json                      # Snippet tema Mainsail per menu laterale
├── nginx_snippet.conf             # Regola Nginx per rotta /configurator
├── moonraker_update.txt           # Configurazione per update_manager
├── install.sh                     # Script di installazione automatica
├── uninstall.sh                   # Script di rimozione pulita
└── README.md                      # Documentazione completa
```

---

## 🗑️ Disinstallazione

Se desideri rimuovere il configuratore:

```bash
cd ~/klipper-configurator
chmod +x uninstall.sh
./uninstall.sh
```

Il menu di Mainsail e la configurazione di Nginx torneranno allo stato originale.
