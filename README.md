# 🎛️ Klipper Configurator per Mainsail WebUI

Un modulo visuale e moderno per la WebUI di **Mainsail**, progettato per permettere la configurazione guidata di Klipper (`printer.cfg` o `config.cfg`) attraverso un'interfaccia ricca di tab, formbox, interruttori e menu a tendina.

Si installa con un solo comando ed inserisce una scheda dedicata (**Klipper Config**) direttamente nel menu laterale di Mainsail grazie al sistema nativo di navigazione (`.theme/navi.json`).

---

## 📸 Caratteristiche Principali

- **Integrazione Nativa in Mainsail**: Aggiunge una voce con icona ingranaggio nella sidebar sinistra di Mainsail.
- **Design Mainsail Dark Theme**: Perfetta coerenza grafica con l'interfaccia scura di Mainsail, ottimizzata per desktop, tablet e smartphone.
- **8 Categorie di Configurazione Dedicate**:
  1. **Cinematica**:
     - Parametri generali della stampante (`[printer]`): tipo cinematica (`cartesian`, `corexy`, `corexz`, `delta`, `hybrid_corexy`, ecc.), velocità massima, accelerazione, `minimum_cruise_ratio`, `square_corner_velocity`, dinamica asse Z (`max_z_velocity`, `max_z_accel`).
     - **Abilitazione IDEX (Independent Dual Extruder)**: toggle per abilitare il secondo carrello indipendente `[dual_carriage]` e il secondo estrusore `[extruder1]`.
     - **Configurazione Multi-Asse Z**: selezione del numero di motori Z (1 motore standard, 2 motori Dual-Z, 3 motori Triple-Z es. Trident, 4 motori Quad-Z es. Voron 2.4) con aggiornamento automatico dei motori in Stepper e del livellamento (`[z_tilt]` o `[quad_gantry_level]`) in Calibration.
     - **Limiti e Settaggi Homing Avanzati per Asse (X, Dual Carriage X2, Y, Z)**:
       - `position_min`, `position_max`, `position_endstop`.
       - Parametri homing dedicati: `homing_speed`, `homing_retract_dist`, `homing_retract_speed` (impostabili a `0` per disabilitarli/ometterli dal config).
  2. **Host/MCU**:
     - Configurazione connessione Seriale USB / CAN Bus (`canbus_uuid`) o UART; baud rate; monitoraggio temperature CPU Host (`raspberry_pi`) e MCU chip; supporto schede secondarie (es. Toolhead CAN).
  3. **Stepper & Driver (Adattivo a IDEX e Multi-Z)**:
     - Gestione dinamica degli assi: Asse X, Dual Carriage X2 (se IDEX attivo), Asse Y, Asse Z, e motori ausiliari Z1, Z2, Z3 (in base al conteggio Multi-Z impostato).
     - Pin di controllo (step, dir, enable con inversione `!`), microstep (16, 32, 64, 128, 256), calcolatore di `rotation_distance`, finecorsa fisici o **Sensorless Homing** (StallGuard).
     - Driver TMC intelligenti (`tmc2209`, `tmc2208`, `tmc2226`, `tmc5160`, `tmc2240`): pin UART/CS, corrente operativa RMS (`run_current`), StealthChop e soglia `SGTHRS`.
  4. **Extruder (Supporto IDEX Extruder 0 & Extruder 1)**:
     - Gestione selettore estrusori: `[extruder]` ed `[extruder1]` (se IDEX attivo).
     - Diametro ugello e filamento, Pressure Advance, selezione tipo termistore da menu a tendina (EPCOS 100K, Generic 3950, ATC Semitec, PT1000, MAX31865, ecc.), pin riscaldatore e regolazione PID.
  5. **Bed**:
     - Sensore temperatura piatto, pin riscaldatore, temperature min/max e algoritmo di controllo (PID con parametri Kp/Ki/Kd oppure Watermark).
  6. **Misceleus**:
     - Ventole pezzo (`[fan]`) e hotend (`[heater_fan]`), moduli core Klipper per Mainsail (`[virtual_sdcard]`, `[pause_resume]`, `[display_status]`, `[respond]`) e tempo di `idle_timeout`.
  7. **Macro**:
     - Gestione visuale delle macro G-Code (`[gcode_macro ...]`), con editor di script multiriga, descrizioni e pulsante **"Inserisci Template Predefiniti"** (`START_PRINT`, `END_PRINT`, `CANCEL_PRINT`, `PAUSE`, `RESUME`, `M600`).
  8. **Calibration**:
     - Configurazione sonda o BLTouch/CR Touch (offset X, Y, Z, pin e campioni), Homing sicuro al centro (`[safe_z_home]`), griglia di livellamento piatto (`[bed_mesh]`), compensazione risonanze (`[input_shaper]`).
     - **Livellamento Multi-Z Dinamico**:
       - Con 2 o 3 motori Z: allineamento automatico `[z_tilt]` (Z-Tilt Leveling con z_positions e points).
       - Con 4 motori Z: allineamento automatico `[quad_gantry_level]` (QGL con gantry_corners e points).

- **Sicurezza Totale dei File**:
  - **Backup Automatico**: Prima di ogni salvataggio su Moonraker, viene generata una copia di sicurezza timestamped (es. `printer.cfg.bak.20261013180000`).
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

## 🗑️ Disinstallazione

Se desideri rimuovere il configuratore:

```bash
cd ~/klipper-configurator
chmod +x uninstall.sh
./uninstall.sh
```
