/**
 * Klipper Configurator - Internationalization (i18n) Module
 * Rileva automaticamente la lingua impostata su Mainsail tramite Moonraker DB (general.locale / general.language)
 * e traduce l'intera interfaccia (topbar, sidebar, schede, label, opzioni, modali e notifiche).
 */

(function () {
    'use strict';

    // Lingue supportate con nomi localizzati e bandiere/codici
    const SUPPORTED_LANGUAGES = {
        'it': { name: 'Italiano', flag: '🇮🇹' },
        'en': { name: 'English', flag: '🇬🇧' },
        'de': { name: 'Deutsch', flag: '🇩🇪' },
        'fr': { name: 'Français', flag: '🇫🇷' },
        'es': { name: 'Español', flag: '🇪🇸' }
    };

    let currentLanguage = localStorage.getItem('klifig_manual_language') || 'auto';
    let detectedMainsailLanguage = localStorage.getItem('mainsail_cached_language') || 'it';

    // =========================================================================
    // Dizionario Completo delle Traduzioni
    // =========================================================================
    const UI_TRANSLATIONS = {
        it: {
            // Topbar & Azioni
            'nav.settings': 'Impostazioni',
            'nav.unsaved_single': '1 modifica non salvata',
            'nav.unsaved_plural': '{n} modifiche',
            'nav.reload': 'Ricarica',
            'nav.preview': 'Anteprima',
            'nav.download': 'Scarica',
            'nav.save': 'Salva',
            'nav.save_restart': 'Salva & Riavvia',
            'nav.conn_connected': 'Moonraker: Connesso',
            'nav.conn_connecting': 'Moonraker: Connessione...',
            'nav.conn_error': 'Moonraker: Disconnesso',

            // Tabs Principali
            'tab.kinematics': 'Cinematica & Stampante',
            'tab.host_mcu': 'Host & MCU',
            'tab.stepper': 'Stepper Motion',
            'tab.extruder': 'Estrusore',
            'tab.bed': 'Bed & Livellamento',
            'tab.misc': 'Ventole & Ausiliari',
            'tab.include': 'Include Files',
            'tab.macro': 'Macro G-Code',
            'tab.calibration': 'Calibrazione',

            // Sidebar Mainsail
            'sidebar.dashboard': 'Dashboard',
            'sidebar.webcam': 'Webcam',
            'sidebar.console': 'Console',
            'sidebar.heightmap': 'Mappa Altezza',
            'sidebar.gcodefiles': 'File G-Code',
            'sidebar.gcodeviewer': 'Visualizzatore 3D',
            'sidebar.history': 'Cronologia',
            'sidebar.timelapse': 'Timelapse',
            'sidebar.machine': 'Macchina',
            'sidebar.configurator': 'Klipper Configurator',
            'sidebar.settings': 'Impostazioni',

            // Card Titles
            'card.printer_params': 'Parametri Principali [printer]',
            'card.kinematics_adv': 'Architettura Cinematica Avanzata',
            'card.delta_geometry': 'Geometria Delta [printer]',
            'card.axis_x': 'Asse X - Limiti & Homing',
            'card.axis_dc': 'Carrello X2 IDEX (Dual Carriage)',
            'card.axis_y': 'Asse Y - Limiti & Homing',
            'card.axis_z': 'Asse Z - Limiti & Homing',
            'card.mcu_main': 'Connessione Microcontrollore Principale [mcu]',
            'card.mcu_temp': 'Sensori Termici di Sistema',
            'card.mcu_extra': 'Microcontrollori Aggiuntivi (Extra MCUs)',
            'card.stepper_config': 'Configurazione Motore Passo-Passo',
            'card.driver_config': 'Configurazione Driver TMC / Standalone',
            'card.extruder_geom': 'Parametri Motore & Geometria Estrusore',
            'card.extruder_thermal': 'Termica Hotend & Sensori Avanzati',
            'card.extruder_algo': 'Algoritmo di Riscaldamento Hotend',
            'card.extruder_driver': 'Driver Estrusore',
            'card.heater_bed': 'Piatto Riscaldato [heater_bed]',
            'card.probe': 'Sonda di Livellamento [probe] / [bltouch]',
            'card.bed_mesh': 'Mappatura Piatto (Bed Mesh) [bed_mesh]',
            'card.z_align': 'Allineamento Meccanico Multi-Asse Z',
            'card.fan_part': 'Ventola Raffreddamento Pezzo [fan]',
            'card.fan_extra': 'Ventole Ausiliarie Aggiuntive',
            'card.adxl': 'Accelerometro Risonanze [adxl345]',
            'card.leds': 'Illuminazione & LED',
            'card.includes': 'File di Configurazione Inclusi [include]',
            'card.macros': 'Macro G-Code Personalizzate [gcode_macro]',
            'card.input_shaper': 'Compensazione Risonanze [input_shaper]',
            'card.res_tester': 'Calibrazione Automatica Risonanze [resonance_tester]',
            'card.probe_z_offset': 'Calibrazione Z-Offset Sonda',

            // Pulsanti Comuni
            'btn.add_mcu': 'Aggiungi MCU Secondaria',
            'btn.add_fan': 'Aggiungi Ventola Ausiliaria',
            'btn.add_led': 'Aggiungi LED',
            'btn.add_macro': 'Aggiungi Nuova Macro',
            'btn.add_include': 'Aggiungi File Include',
            'btn.delete': 'Elimina',
            'btn.save_connect': 'Salva & Connetti',
            'btn.cancel': 'Annulla',
            'btn.copy': 'Copia negli Appunti',
            'btn.close': 'Chiudi',

            // Modal Impostazioni
            'modal.settings_title': 'Impostazioni & Tema Mainsail',
            'modal.conn_section': 'Stato Connessione e Versione',
            'modal.ip_label': 'Indirizzo IP / Host Moonraker:',
            'modal.ip_helper': 'Se Klipper Configurator è installato sulla stessa macchina di Mainsail, lascia l\'origine automatica.',
            'modal.lang_label': 'Lingua Interfaccia:',
            'modal.lang_auto': 'Automatica (Sincronizzata con Mainsail)',
            'modal.theme_title': 'Integrazione Tema & Colori Mainsail',
            'modal.active_color': 'Colore Primario Attivo:',
            'modal.custom_color': 'Scegli Colore Personalizzato:',
            'modal.preset_colors': 'Oppure scegli un preset colore vendor:',
            'modal.theme_mode': 'Modalità Tema:',
            'modal.force_light': 'Forza Modalità Chiara (Light Theme)',

            // Toasts & Messaggi
            'toast.loaded_success': '{file} caricato con successo',
            'toast.saved_success': 'File {file} salvato con successo! (Backup creato)',
            'toast.restarting': 'Riavvio di Klipper in corso...',
            'toast.downloaded': 'File {file} scaricato sul computer',
            'toast.copied': 'Configurazione copiata negli appunti!',
            'toast.theme_set': 'Colore tema impostato su {color}',
            'toast.lang_set': 'Lingua impostata su {lang}'
        },

        en: {
            // Topbar & Actions
            'nav.settings': 'Settings',
            'nav.unsaved_single': '1 unsaved change',
            'nav.unsaved_plural': '{n} unsaved changes',
            'nav.reload': 'Reload',
            'nav.preview': 'Preview',
            'nav.download': 'Download',
            'nav.save': 'Save',
            'nav.save_restart': 'Save & Restart',
            'nav.conn_connected': 'Moonraker: Connected',
            'nav.conn_connecting': 'Moonraker: Connecting...',
            'nav.conn_error': 'Moonraker: Disconnected',

            // Main Tabs
            'tab.kinematics': 'Kinematics & Printer',
            'tab.host_mcu': 'Host & MCU',
            'tab.stepper': 'Stepper Motion',
            'tab.extruder': 'Extruder',
            'tab.bed': 'Bed & Leveling',
            'tab.misc': 'Fans & Auxiliaries',
            'tab.include': 'Include Files',
            'tab.macro': 'G-Code Macros',
            'tab.calibration': 'Calibration',

            // Sidebar Mainsail
            'sidebar.dashboard': 'Dashboard',
            'sidebar.webcam': 'Webcam',
            'sidebar.console': 'Console',
            'sidebar.heightmap': 'Heightmap',
            'sidebar.gcodefiles': 'G-Code Files',
            'sidebar.gcodeviewer': '3D Viewer',
            'sidebar.history': 'History',
            'sidebar.timelapse': 'Timelapse',
            'sidebar.machine': 'Machine',
            'sidebar.configurator': 'Klipper Configurator',
            'sidebar.settings': 'Settings',

            // Card Titles
            'card.printer_params': 'Main Parameters [printer]',
            'card.kinematics_adv': 'Advanced Kinematics Architecture',
            'card.delta_geometry': 'Delta Geometry [printer]',
            'card.axis_x': 'X Axis - Limits & Homing',
            'card.axis_dc': 'IDEX X2 Carriage (Dual Carriage)',
            'card.axis_y': 'Y Axis - Limits & Homing',
            'card.axis_z': 'Z Axis - Limits & Homing',
            'card.mcu_main': 'Main Microcontroller Connection [mcu]',
            'card.mcu_temp': 'System Thermal Sensors',
            'card.mcu_extra': 'Additional Microcontrollers (Extra MCUs)',
            'card.stepper_config': 'Stepper Motor Configuration',
            'card.driver_config': 'TMC / Standalone Driver Configuration',
            'card.extruder_geom': 'Extruder Motor & Geometry Parameters',
            'card.extruder_thermal': 'Hotend Thermal & Advanced Sensors',
            'card.extruder_algo': 'Hotend Heating Algorithm',
            'card.extruder_driver': 'Extruder Driver',
            'card.heater_bed': 'Heated Bed [heater_bed]',
            'card.probe': 'Bed Leveling Probe [probe] / [bltouch]',
            'card.bed_mesh': 'Bed Mesh Leveling [bed_mesh]',
            'card.z_align': 'Multi-Z Mechanical Alignment',
            'card.fan_part': 'Part Cooling Fan [fan]',
            'card.fan_extra': 'Additional Auxiliary Fans',
            'card.adxl': 'Resonance Accelerometer [adxl345]',
            'card.leds': 'Lighting & LEDs',
            'card.includes': 'Included Configuration Files [include]',
            'card.macros': 'Custom G-Code Macros [gcode_macro]',
            'card.input_shaper': 'Resonance Compensation [input_shaper]',
            'card.res_tester': 'Automatic Resonance Calibration [resonance_tester]',
            'card.probe_z_offset': 'Probe Z-Offset Calibration',

            // Common Buttons
            'btn.add_mcu': 'Add Secondary MCU',
            'btn.add_fan': 'Add Auxiliary Fan',
            'btn.add_led': 'Add LED Strip',
            'btn.add_macro': 'Add New Macro',
            'btn.add_include': 'Add Include File',
            'btn.delete': 'Delete',
            'btn.save_connect': 'Save & Connect',
            'btn.cancel': 'Cancel',
            'btn.copy': 'Copy to Clipboard',
            'btn.close': 'Close',

            // Settings Modal
            'modal.settings_title': 'Settings & Mainsail Theme',
            'modal.conn_section': 'Connection Status & Version',
            'modal.ip_label': 'Moonraker IP Address / Host:',
            'modal.ip_helper': 'If Klipper Configurator runs on the same machine as Mainsail, leave automatic origin.',
            'modal.lang_label': 'Interface Language:',
            'modal.lang_auto': 'Automatic (Synchronized with Mainsail)',
            'modal.theme_title': 'Mainsail Theme & Colors Integration',
            'modal.active_color': 'Active Primary Color:',
            'modal.custom_color': 'Choose Custom Color:',
            'modal.preset_colors': 'Or select a vendor color preset:',
            'modal.theme_mode': 'Theme Mode:',
            'modal.force_light': 'Force Light Theme',

            // Toasts & Messages
            'toast.loaded_success': '{file} loaded successfully',
            'toast.saved_success': 'File {file} saved successfully! (Backup created)',
            'toast.restarting': 'Restarting Klipper...',
            'toast.downloaded': 'File {file} downloaded to your computer',
            'toast.copied': 'Configuration copied to clipboard!',
            'toast.theme_set': 'Theme color set to {color}',
            'toast.lang_set': 'Language set to {lang}'
        },

        de: {
            'nav.settings': 'Einstellungen',
            'nav.unsaved_single': '1 ungespeicherte Änderung',
            'nav.unsaved_plural': '{n} ungespeicherte Änderungen',
            'nav.reload': 'Neu laden',
            'nav.preview': 'Vorschau',
            'nav.download': 'Herunterladen',
            'nav.save': 'Speichern',
            'nav.save_restart': 'Speichern & Neustarten',
            'nav.conn_connected': 'Moonraker: Verbunden',
            'nav.conn_connecting': 'Moonraker: Verbinden...',
            'nav.conn_error': 'Moonraker: Getrennt',
            'tab.kinematics': 'Kinematik & Drucker',
            'tab.host_mcu': 'Host & MCU',
            'tab.stepper': 'Schrittmotoren',
            'tab.extruder': 'Extruder',
            'tab.bed': 'Bett & Nivellierung',
            'tab.misc': 'Lüfter & Extras',
            'tab.include': 'Include Dateien',
            'tab.macro': 'G-Code Makros',
            'tab.calibration': 'Kalibrierung',
            'btn.save_connect': 'Speichern & Verbinden',
            'btn.cancel': 'Abbrechen',
            'btn.copy': 'In Zwischenablage kopieren',
            'btn.close': 'Schließen',
            'modal.settings_title': 'Einstellungen & Mainsail Thema',
            'modal.lang_label': 'Oberflächensprache:'
        },

        fr: {
            'nav.settings': 'Paramètres',
            'nav.unsaved_single': '1 modification non enregistrée',
            'nav.unsaved_plural': '{n} modifications',
            'nav.reload': 'Recharger',
            'nav.preview': 'Aperçu',
            'nav.download': 'Télécharger',
            'nav.save': 'Enregistrer',
            'nav.save_restart': 'Enregistrer & Redémarrer',
            'nav.conn_connected': 'Moonraker: Connecté',
            'nav.conn_connecting': 'Moonraker: Connexion...',
            'nav.conn_error': 'Moonraker: Déconnecté',
            'tab.kinematics': 'Cinématique & Imprimante',
            'tab.host_mcu': 'Hôte & MCU',
            'tab.stepper': 'Moteurs Pas-à-Pas',
            'tab.extruder': 'Extrudeur',
            'tab.bed': 'Plateau & Nivellement',
            'tab.misc': 'Ventilateurs & Auxiliaires',
            'tab.include': 'Fichiers Include',
            'tab.macro': 'Macros G-Code',
            'tab.calibration': 'Calibrage',
            'btn.save_connect': 'Enregistrer & Connecter',
            'btn.cancel': 'Annuler',
            'btn.copy': 'Copier dans le presse-papiers',
            'btn.close': 'Fermer',
            'modal.settings_title': 'Paramètres & Thème Mainsail',
            'modal.lang_label': 'Langue de l\'interface:'
        },

        es: {
            'nav.settings': 'Ajustes',
            'nav.unsaved_single': '1 cambio sin guardar',
            'nav.unsaved_plural': '{n} cambios sin guardar',
            'nav.reload': 'Recargar',
            'nav.preview': 'Vista previa',
            'nav.download': 'Descargar',
            'nav.save': 'Guardar',
            'nav.save_restart': 'Guardar y Reiniciar',
            'nav.conn_connected': 'Moonraker: Conectado',
            'nav.conn_connecting': 'Moonraker: Conectando...',
            'nav.conn_error': 'Moonraker: Desconectado',
            'tab.kinematics': 'Cinemática e Impresora',
            'tab.host_mcu': 'Host y MCU',
            'tab.stepper': 'Motores Paso a Paso',
            'tab.extruder': 'Extrusor',
            'tab.bed': 'Cama y Nivelación',
            'tab.misc': 'Ventiladores y Extras',
            'tab.include': 'Archivos Include',
            'tab.macro': 'Macros G-Code',
            'tab.calibration': 'Calibración',
            'btn.save_connect': 'Guardar y Conectar',
            'btn.cancel': 'Cancelar',
            'btn.copy': 'Copiar al portapapeles',
            'btn.close': 'Cerrar',
            'modal.settings_title': 'Ajustes y Tema Mainsail',
            'modal.lang_label': 'Idioma de la interfaz:'
        }
    };

    // =========================================================================
    // Mappatura Traduzioni per Form Labels (per ID elemento)
    // =========================================================================
    const FORM_LABEL_TRANSLATIONS = {
        en: {
            'printer-kinematics': 'Main Kinematics Type:',
            'printer-max-velocity': 'Maximum Velocity (max_velocity):',
            'printer-max-accel': 'Maximum Acceleration (max_accel):',
            'printer-cruise-ratio': 'Cruise Ratio (minimum_cruise_ratio):',
            'printer-square-corner': 'Square Corner Velocity:',
            'printer-max-z-velocity': 'Max Z Velocity:',
            'printer-max-z-accel': 'Max Z Acceleration:',
            'printer-max-accel-to-decel': 'Max Accel to Decel (Optional legacy):',
            'check-enable-idex': 'Enable IDEX Kinematics (Dual Independent X Carriage)',
            'select-z-motor-count': 'Number of Z Motors (Multi-Axis Z):',
            'delta-arm-length': 'Arm Length (arm_length):',
            'delta-radius': 'Delta Radius (delta_radius):',
            'delta-print-radius': 'Print Radius (print_radius):',
            'x-pos-min': 'Min (position_min):',
            'x-pos-max': 'Max (position_max):',
            'x-pos-endstop': 'Endstop:',
            'x-homing-speed': 'homing_speed:',
            'x-homing-retract-dist': 'homing_retract_dist:',
            'x-homing-retract-speed': 'homing_retract_speed:',
            'dc-pos-min': 'Min (position_min):',
            'dc-pos-max': 'Max (position_max):',
            'dc-pos-endstop': 'Endstop (X2 Parking):',
            'dc-homing-speed': 'homing_speed:',
            'dc-homing-retract-dist': 'homing_retract_dist:',
            'dc-homing-retract-speed': 'homing_retract_speed:',
            'y-pos-min': 'Min (position_min):',
            'y-pos-max': 'Max (position_max):',
            'y-pos-endstop': 'Endstop:',
            'y-homing-speed': 'homing_speed:',
            'y-homing-retract-dist': 'homing_retract_dist:',
            'y-homing-retract-speed': 'homing_retract_speed:',
            'z-pos-min': 'Min (position_min):',
            'z-pos-max': 'Max (position_max):',
            'z-pos-endstop': 'Endstop (if physical):',
            'z-homing-speed': 'homing_speed:',
            'z-homing-retract-dist': 'homing_retract_dist:',
            'z-homing-retract-speed': 'homing_retract_speed:',
            'mcu-conn-type': 'Connection Method:',
            'mcu-serial': 'USB Serial Port (serial):',
            'mcu-canbus-uuid': 'CAN Bus UUID (canbus_uuid):',
            'mcu-baud': 'Baud Rate:',
            'mcu-restart-method': 'Restart Method:',
            'check-enable-host-temp': 'Enable Raspberry Pi / Host Temperature Sensor',
            'check-enable-mcu-temp': 'Enable Mainboard (MCU) Temperature Sensor',
            'stepper-step-pin': 'Step Pin:',
            'stepper-dir-pin': 'Dir Pin:',
            'stepper-enable-pin': 'Enable Pin:',
            'stepper-microsteps': 'Microsteps:',
            'stepper-steps-rotation': 'Motor Degrees:',
            'stepper-rotation-distance': 'Rotation Distance:',
            'stepper-endstop-pin': 'Endstop Pin:',
            'driver-model-select': 'Driver Model:',
            'driver-conn-type-select': 'Driver Connection Type:',
            'driver-uart-pin': 'UART Pin (uart_pin):',
            'driver-tx-pin': 'TX Pin (tx_pin - Optional):',
            'driver-uart-address': 'UART Address (uart_address):',
            'driver-cs-pin': 'Chip Select Pin (cs_pin):',
            'driver-spi-mode': 'SPI Bus Mode:',
            'driver-spi-bus': 'Hardware SPI Bus (spi_bus):',
            'driver-spi-sclk': 'SCLK Pin (spi_software_sclk_pin):',
            'driver-spi-mosi': 'MOSI Pin (spi_software_mosi_pin):',
            'driver-spi-miso': 'MISO Pin (spi_software_miso_pin):',
            'driver-run-current': 'Operating Current (run_current):',
            'driver-stealthchop': 'StealthChop Mode:',
            'check-enable-hold-current': 'Enable Hold Current (hold_current)',
            'driver-hold-current': 'Hold Current (hold_current):',
            'check-enable-sense-resistor': 'Specify Sense Resistor (sense_resistor)',
            'driver-sense-resistor': 'Sense Resistor (sense_resistor):',
            'driver-interpolate': 'Interpolation to 256 microsteps (interpolate: True)',
            'driver-sensorless-enable': 'Sensorless Homing (Homing without physical endstop)',
            'driver-diag-pin': 'Diag Pin:',
            'driver-sgthrs': 'StallGuard Sensitivity (driver_SGTHRS / driver_SGT):',
            'extruder-step-pin': 'Step Pin:',
            'extruder-dir-pin': 'Dir Pin:',
            'extruder-enable-pin': 'Enable Pin:',
            'extruder-rot-dist': 'Rotation Distance:',
            'extruder-gear-ratio': 'Gear Ratio (gear_ratio):',
            'extruder-nozzle-dia': 'Nozzle Diameter (nozzle_diameter):',
            'extruder-filament-dia': 'Filament Diameter:',
            'extruder-pressure-advance': 'Pressure Advance:',
            'extruder-sensor-type': 'Sensor Type (sensor_type):',
            'extruder-sensor-spi-mode': 'SPI Bus Mode:',
            'extruder-sensor-spi-bus': 'SPI Bus (spi_bus):',
            'extruder-sensor-spi-speed': 'SPI Speed (spi_speed):',
            'extruder-sensor-spi-sclk': 'SCLK Pin (spi_software_sclk_pin):',
            'extruder-sensor-spi-mosi': 'MOSI Pin (spi_software_mosi_pin):',
            'extruder-sensor-spi-miso': 'MISO Pin (spi_software_miso_pin):',
            'extruder-rtd-nominal-r': 'Nominal Resistance at 0°C (rtd_nominal_r):',
            'extruder-rtd-reference-r': 'Reference Resistance (rtd_reference_r):',
            'extruder-rtd-num-wires': 'Probe Wire Count (rtd_num_of_wires):',
            'extruder-rtd-filter': 'AC Noise Filter (rtd_use_50Hz_filter):',
            'extruder-heater-pin': 'Heater Pin:',
            'extruder-sensor-pin': 'Sensor Pin (CS for SPI):',
            'extruder-min-temp': 'Min Temp:',
            'extruder-max-temp': 'Max Temp:',
            'extruder-min-extrude': 'Min Extrude Temp:',
            'extruder-control-type': 'Control Algorithm (control):',
            'extruder-pid-kp': 'pid_Kp:',
            'extruder-pid-ki': 'pid_Ki:',
            'extruder-pid-kd': 'pid_Kd:',
            'extruder-max-delta': 'Hysteresis Tolerance (max_delta):',
            'bed-sensor-type': 'Bed Sensor Type (sensor_type):',
            'bed-heater-pin': 'Heater Pin (heater_pin):',
            'bed-sensor-pin': 'Sensor Pin (sensor_pin):',
            'bed-min-temp': 'Min Temp:',
            'bed-max-temp': 'Max Bed Temp:',
            'bed-control-type': 'Control Algorithm:',
            'bed-pid-kp': 'pid_Kp:',
            'bed-pid-ki': 'pid_Ki:',
            'bed-pid-kd': 'pid_Kd:',
            'bed-max-delta': 'Hysteresis Tolerance (max_delta):',
            'fan-part-pin': 'Part Fan Pin (pin):',
            'fan-part-kick': 'Kick Start Time (s):',
            'fan-part-off-below': 'Off Below:',
            'check-enable-adxl': 'Enable ADXL345 Accelerometer (Measure resonance)',
            'adxl-cs-pin': 'CS Pin (cs_pin):',
            'adxl-spi-mode': 'SPI Connection Mode:',
            'adxl-spi-bus': 'Hardware SPI Bus (spi_bus):',
            'adxl-spi-sclk': 'SCLK Pin (spi_software_sclk_pin):',
            'adxl-spi-mosi': 'MOSI Pin (spi_software_mosi_pin):',
            'adxl-spi-miso': 'MISO Pin (spi_software_miso_pin):',
            'adxl-axes-map': 'Axes Mapping (axes_map):',
            'adxl-rate': 'Sampling Rate (rate):',
            'check-virtual-sd': '[virtual_sdcard] - Enable G-Code file printing from Moonraker',
            'check-pause-resume': '[pause_resume] - Enable Pause and Resume commands',
            'check-display-status': '[display_status] - Enable progress and status display',
            'check-respond': '[respond] - Enable messages and M118 console commands',
            'idle-timeout': 'Idle Timeout (Power off motors/heaters):',
            'probe-type-select': 'Installed Probe Type:',
            'probe-sensor-pin': 'Sensor Pin:',
            'probe-control-pin': 'Control Pin (for BLTouch):',
            'probe-x-offset': 'X Offset:',
            'probe-y-offset': 'Y Offset:',
            'probe-z-offset': 'Z Offset (Base):',
            'probe-samples': 'Samples per point:',
            'probe-samples-result': 'Samples Result:',
            'check-enable-safe-z': 'Enable Safe Z Home (Z Homing at bed center)',
            'safe-z-pos': 'Center Coordinates (home_xy_position):',
            'safe-z-hop': 'Z Hop:',
            'safe-z-speed': 'Speed:',
            'z-tilt-positions': 'Z Motor Pivot Points (z_positions):',
            'z-tilt-points': 'Bed Probe Points (points):',
            'z-tilt-retries': 'Max Retries (retries):',
            'z-tilt-tolerance': 'Tolerance (retry_tolerance):',
            'qgl-corners': 'Gantry Outer Corners (gantry_corners):',
            'qgl-points': '4 Probe Points (points):',
            'qgl-retries': 'Max Retries (retries):',
            'qgl-tolerance': 'Tolerance (retry_tolerance):',
            'mesh-min': 'Min Coordinates (mesh_min):',
            'mesh-max': 'Max Coordinates (mesh_max):',
            'mesh-probe-count': 'Grid Points (probe_count):',
            'mesh-algorithm': 'Interpolation Algorithm:',
            'check-enable-shaper': 'Enable Input Shaper Filter (Eliminate Ghosting / Ringing)',
            'shaper-freq-x': 'X Frequency (shaper_freq_x):',
            'shaper-type-x': 'X Filter Type:',
            'shaper-freq-y': 'Y Frequency (shaper_freq_y):',
            'shaper-type-y': 'Y Filter Type:',
            'res-accel-chip': 'Accelerometer Chip (accel_chip):',
            'res-probe-points': 'Test Coordinates X, Y, Z (probe_points):',
            'res-accel-per-hz': 'Acceleration per Hz (accel_per_hz):',
            'res-max-smoothing': 'Max Smoothing (max_smoothing):',
            'calibration-z-offset': 'Probe Z-Offset (z_offset):',
            'input-moonraker-url': 'Moonraker IP / Host Address:',
            'check-force-light-mode': 'Force Light Theme (Light Mode)'
        }
    };

    // =========================================================================
    // Core i18n Engine
    // =========================================================================

    function getActiveLanguage() {
        if (currentLanguage && currentLanguage !== 'auto' && SUPPORTED_LANGUAGES[currentLanguage]) {
            return currentLanguage;
        }
        return detectedMainsailLanguage || 'it';
    }

    function t(key, params = {}) {
        const lang = getActiveLanguage();
        const dict = UI_TRANSLATIONS[lang] || UI_TRANSLATIONS['en'] || UI_TRANSLATIONS['it'];
        let text = dict[key] || (UI_TRANSLATIONS['en'] && UI_TRANSLATIONS['en'][key]) || (UI_TRANSLATIONS['it'] && UI_TRANSLATIONS['it'][key]) || key;

        // Sostituzione parametri {param}
        for (const [k, v] of Object.entries(params)) {
            text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
        }
        return text;
    }

    /**
     * Applica le traduzioni a tutti gli elementi della pagina
     */
    function applyTranslations() {
        const lang = getActiveLanguage();
        document.documentElement.setAttribute('lang', lang);

        // 1. Elementi con attributo data-i18n
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = t(key);
            if (translation && translation !== key) {
                // Se contiene child tags (es. icone o dot), aggiorna solo i nodi di testo diretti
                let hasElementChildren = false;
                for (const node of el.childNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE && !node.classList.contains('info-circle')) {
                        hasElementChildren = true;
                        break;
                    }
                }
                if (!hasElementChildren) {
                    const infoCircle = el.querySelector('.info-circle');
                    el.textContent = translation;
                    if (infoCircle) el.appendChild(infoCircle);
                }
            }
        });

        // 2. Elementi con data-i18n-title
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            el.setAttribute('title', t(key));
        });

        // 3. Traduzione automatica dei bottoni della topbar
        translateElementText('btn-settings', 'nav.settings', true);
        translateElementText('btn-reload', 'nav.reload', true);
        translateElementText('btn-preview', 'nav.preview', true);
        translateElementText('btn-download', 'nav.download', true);
        translateElementText('btn-save', 'nav.save', true);
        translateElementText('btn-save-restart', 'nav.save_restart', true);

        // 4. Traduzione dei bottoni delle schede (Tab Buttons)
        const tabMap = {
            'tab-btn-kinematics': 'tab.kinematics',
            'tab-btn-host-mcu': 'tab.host_mcu',
            'tab-btn-stepper': 'tab.stepper',
            'tab-btn-extruder': 'tab.extruder',
            'tab-btn-bed': 'tab.bed',
            'tab-btn-misc': 'tab.misc',
            'tab-btn-include': 'tab.include',
            'tab-btn-macro': 'tab.macro',
            'tab-btn-calibration': 'tab.calibration'
        };

        document.querySelectorAll('.tab-btn').forEach(btn => {
            const tabTarget = btn.getAttribute('data-tab');
            if (tabTarget) {
                const key = `tab.${tabTarget.replace(/^tab-/, '').replace(/-/g, '_')}`;
                const text = t(key);
                if (text && text !== key) {
                    // Preserva eventuale icona/svg
                    const svg = btn.querySelector('svg');
                    btn.textContent = text;
                    if (svg) btn.prepend(svg);
                }
            }
        });

        // 5. Traduzione Form Labels tramite mappa ID
        if (FORM_LABEL_TRANSLATIONS[lang]) {
            const labelDict = FORM_LABEL_TRANSLATIONS[lang];
            document.querySelectorAll('.form-label').forEach(label => {
                const forId = label.getAttribute('for');
                if (forId && labelDict[forId]) {
                    const infoCircle = label.querySelector('.info-circle');
                    label.textContent = labelDict[forId] + ' ';
                    if (infoCircle) label.appendChild(infoCircle);
                }
            });

            document.querySelectorAll('.checkbox-inline').forEach(label => {
                const input = label.querySelector('input[type="checkbox"]');
                if (input && input.id && labelDict[input.id]) {
                    const infoCircle = label.querySelector('.info-circle');
                    // Preserva checkbox input
                    label.innerHTML = '';
                    label.appendChild(input);
                    label.appendChild(document.createTextNode(' ' + labelDict[input.id] + ' '));
                    if (infoCircle) label.appendChild(infoCircle);
                }
            });
        }

        // 6. Aggiorna indicatore lingua nel modale impostazioni se presente
        const langStatus = document.getElementById('active-detected-lang-text');
        if (langStatus) {
            const info = SUPPORTED_LANGUAGES[lang] || { name: lang, flag: '🌐' };
            const isAuto = currentLanguage === 'auto';
            langStatus.textContent = `${info.flag} ${info.name} ${isAuto ? '(Mainsail Auto)' : '(Manuale)'}`;
        }

        // 7. Notifica il modulo dei tooltip per aggiornare i testi localizzati
        if (window.refreshTooltips) {
            window.refreshTooltips();
        }
    }

    function translateElementText(id, i18nKey, keepIcons = false) {
        const el = document.getElementById(id);
        if (!el) return;
        const text = t(i18nKey);
        if (!text || text === i18nKey) return;

        if (keepIcons) {
            const svgs = Array.from(el.querySelectorAll('svg, span:not(.info-circle)'));
            const textNode = Array.from(el.childNodes).find(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim().length > 0);
            if (textNode) {
                textNode.textContent = ' ' + text;
            } else {
                // Cerca uno span interno con testo
                const span = el.querySelector('span:not(#quick-theme-dot):not(.info-circle)');
                if (span) {
                    span.textContent = text;
                }
            }
        } else {
            el.textContent = text;
        }
    }

    /**
     * Rileva la lingua da una risposta Moonraker (namespace 'mainsail')
     */
    function detectMainsailLanguageFromSettings(settings) {
        if (!settings) return null;

        let detected = null;
        if (settings.general) {
            if (settings.general.locale && typeof settings.general.locale === 'string') {
                detected = settings.general.locale;
            } else if (settings.general.language && typeof settings.general.language === 'string') {
                detected = settings.general.language;
            }
        }

        if (!detected && settings.uiSettings) {
            if (settings.uiSettings.locale && typeof settings.uiSettings.locale === 'string') {
                detected = settings.uiSettings.locale;
            } else if (settings.uiSettings.language && typeof settings.uiSettings.language === 'string') {
                detected = settings.uiSettings.language;
            }
        }

        if (!detected && typeof settings.locale === 'string') {
            detected = settings.locale;
        }

        if (detected) {
            const code = detected.toLowerCase().slice(0, 2);
            if (SUPPORTED_LANGUAGES[code]) {
                return code;
            }
        }
        return null;
    }

    /**
     * Imposta o aggiorna la lingua di Klipper Configurator
     */
    function setLanguage(lang, isManual = false) {
        if (isManual) {
            currentLanguage = lang;
            localStorage.setItem('klifig_manual_language', lang);
        } else {
            detectedMainsailLanguage = lang;
            localStorage.setItem('mainsail_cached_language', lang);
        }

        applyTranslations();
    }

    // Inizializzazione al caricamento
    function initI18n() {
        // Fallback da browser se nessuna lingua salvata
        if (!detectedMainsailLanguage) {
            const browserLang = (navigator.language || 'it').toLowerCase().slice(0, 2);
            detectedMainsailLanguage = SUPPORTED_LANGUAGES[browserLang] ? browserLang : 'it';
        }

        applyTranslations();
    }

    // Esportazione API
    window.i18n = {
        t,
        setLanguage,
        getActiveLanguage,
        detectMainsailLanguageFromSettings,
        applyTranslations,
        SUPPORTED_LANGUAGES
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initI18n);
    } else {
        initI18n();
    }
})();
