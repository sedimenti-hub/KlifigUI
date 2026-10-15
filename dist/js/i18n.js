/**
 * Klipper Configurator - Internationalization (i18n) Module
 * Rileva automaticamente la lingua impostata su Mainsail tramite Moonraker DB (general.locale / general.language)
 * e carica i file modulari (dist/locales/{lang}.json). Traduce l'intera interfaccia (topbar, sidebar, schede, label, opzioni, modali e notifiche).
 * Include fallback incorporato per funzionamento offline e file://.
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
    const LOCALE_CACHE = {};

    // =========================================================================
    // Dizionario Incorporato (Fallback per uso offline o protocollo file://)
    // =========================================================================
    const UI_TRANSLATIONS = {
        en: {
        "nav.settings": "Settings",
        "nav.unsaved_single": "1 unsaved change",
        "nav.unsaved_plural": "{n} unsaved changes",
        "nav.reload": "Reload",
        "nav.preview": "Preview",
        "nav.download": "Download",
        "nav.save": "Save",
        "nav.save_restart": "Save & Restart",
        "nav.conn_connected": "Moonraker: Connected",
        "nav.conn_connecting": "Moonraker: Connecting...",
        "nav.conn_error": "Moonraker: Disconnected",
        "tab.kinematics": "Kinematics & Printer",
        "tab.host_mcu": "Host & MCU",
        "tab.stepper": "Stepper Motion",
        "tab.extruder": "Extruder",
        "tab.bed": "Bed & Leveling",
        "tab.misc": "Fans & Auxiliaries",
        "tab.include": "Include Files",
        "tab.macro": "G-Code Macros",
        "tab.calibration": "Calibration",
        "sidebar.dashboard": "Dashboard",
        "sidebar.webcam": "Webcam",
        "sidebar.console": "Console",
        "sidebar.heightmap": "Heightmap",
        "sidebar.gcodefiles": "G-Code Files",
        "sidebar.gcodeviewer": "3D Viewer",
        "sidebar.history": "History",
        "sidebar.timelapse": "Timelapse",
        "sidebar.machine": "Machine",
        "sidebar.configurator": "Klipper Configurator",
        "sidebar.settings": "Settings",
        "card.general_params": "General Klipper Parameters",
        "card.mechanical_arch": "Mechanical Architecture (IDEX & Multi-Z)",
        "card.delta_geometry": "Delta Geometry (Optional)",
        "section.axis_limits_homing": "Axis Limits & Homing Configuration",
        "card.axis_x": "X Axis - Limits & Homing",
        "card.axis_dc": "Dual Carriage (Second X Carriage IDEX)",
        "card.axis_y": "Y Axis - Limits & Homing",
        "card.axis_z": "Z Axis - Limits & Homing",
        "card.mcu_main": "Main Microcontroller (Motherboard)",
        "card.mcu_temp": "Host & Chip Thermal Monitoring",
        "card.mcu_extra": "Secondary MCUs & Toolhead ([mcu <name>])",
        "card.stepper_config": "Stepper Motor Configuration",
        "card.stepper_dual_carriage": "Dual Carriage X2 Configuration",
        "card.stepper_motor_axis": "Motor Configuration Axis",
        "card.driver_config": "Stepper Motion Driver",
        "card.driver_stepper_motion": "Stepper Motion Driver",
        "card.extruder_mech": "Extruder Mechanics & Nozzle",
        "card.extruder_mech_primary": "Primary Extruder Mechanics",
        "card.extruder_mech_secondary": "Secondary IDEX Extruder Mechanics",
        "card.extruder_thermal": "Hotend Heater & Temperature Sensor",
        "card.extruder_algo": "Temperature Control",
        "card.extruder_driver": "Extruder Driver",
        "card.extruder_driver_primary": "Primary Extruder Driver",
        "card.extruder_driver_secondary": "Secondary IDEX Extruder Driver",
        "card.heater_bed": "Heated Bed",
        "card.bed_pid": "Bed PID Tuning",
        "card.fans_cooling": "Klipper Cooling Fans",
        "card.adxl": "Resonance Accelerometer ([adxl345])",
        "card.leds": "LED & Neopixel Lighting",
        "card.core_features": "Essential Klipper & Mainsail Features",
        "card.includes": "Included Configuration Files ([include])",
        "card.macros": "Custom G-Code Macros ([gcode_macro])",
        "card.probe": "Bed Leveling Probe (Probe / BLTouch)",
        "card.safe_z_home": "Safe Center Homing ([safe_z_home])",
        "card.z_tilt": "Independent Z Motors Alignment ([z_tilt])",
        "card.quad_gantry_level": "4-Z Motors Alignment ([quad_gantry_level])",
        "card.bed_mesh": "Bed Mesh Leveling ([bed_mesh])",
        "card.resonance_tester": "Resonance Compensation & Tuning ([input_shaper] / [resonance_tester])",
        "include.title": "Included Configuration Files ([include])",
        "include.desc": "Organize your modular Klipper configuration by including external .cfg files.",
        "include.presets_title": "⚡ Include Common Standard Files",
        "macro.title": "Custom G-Code Macros ([gcode_macro])",
        "macro.desc": "Manage, create, and edit macros for print handling in Mainsail.",
        "btn.add_mcu": "Add Secondary MCU",
        "btn.add_fan": "Add Auxiliary Fan",
        "btn.add_led": "Add LED Strip",
        "btn.add_macro": "Add New Macro",
        "btn.add_include": "Add Include File",
        "btn.delete": "Delete",
        "btn.save_connect": "Save & Connect",
        "btn.cancel": "Cancel",
        "btn.copy": "Copy to Clipboard",
        "btn.close": "Close",
        "btn.insert_macro_template": "Insert Default Templates",
        "modal.preview_title": "Generated Klipper Configuration Preview",
        "modal.settings_title": "Settings & Mainsail Theme",
        "modal.calc_title": "Rotation Distance Calculator",
        "modal.lang_title": "Language & Localization (Mainsail Sync)",
        "modal.theme_title": "Mainsail Theme & Colors Integration",
        "modal.conn_section": "Connection Status & Version",
        "modal.ip_label": "Moonraker IP Address / Host:",
        "modal.ip_helper": "If Klipper Configurator runs on the same machine as Mainsail, leave automatic origin.",
        "modal.lang_label": "Interface Language:",
        "modal.lang_auto": "Automatic (Synchronized with Mainsail)",
        "modal.active_color": "Active Primary Color:",
        "modal.custom_color": "Choose Custom Color:",
        "modal.preset_colors": "Or select a vendor color preset:",
        "modal.theme_mode": "Theme Mode:",
        "modal.force_light": "Force Light Theme",
        "prompt.new_macro_name": "New Macro Name (e.g., PURGE_NOZZLE, M600):",
        "prompt.new_include_name": "Name of the file to include (e.g., macros.cfg, stealthburner_leds.cfg):",
        "toast.loaded_success": "{file} loaded successfully",
        "toast.saved_success": "File {file} saved successfully! (Backup created)",
        "toast.restarting": "Restarting Klipper...",
        "toast.restart_success": "Klipper restarted! Reload complete.",
        "toast.offline_template": "Moonraker offline. Loaded template configuration.",
        "toast.downloaded": "File {file} downloaded to your computer",
        "toast.copied": "Configuration copied to clipboard!",
        "toast.theme_set": "Theme color set to {color}",
        "toast.lang_set": "Language set to {lang}"
},
        it: {
        "nav.settings": "Impostazioni",
        "nav.unsaved_single": "1 modifica non salvata",
        "nav.unsaved_plural": "{n} modifiche",
        "nav.reload": "Ricarica",
        "nav.preview": "Anteprima",
        "nav.download": "Scarica",
        "nav.save": "Salva",
        "nav.save_restart": "Salva & Riavvia",
        "nav.conn_connected": "Moonraker: Connesso",
        "nav.conn_connecting": "Moonraker: Connessione...",
        "nav.conn_error": "Moonraker: Disconnesso",
        "tab.kinematics": "Cinematica & Stampante",
        "tab.host_mcu": "Host & MCU",
        "tab.stepper": "Stepper Motion",
        "tab.extruder": "Estrusore",
        "tab.bed": "Bed & Livellamento",
        "tab.misc": "Ventole & Ausiliari",
        "tab.include": "Include Files",
        "tab.macro": "Macro G-Code",
        "tab.calibration": "Calibrazione",
        "sidebar.dashboard": "Dashboard",
        "sidebar.webcam": "Webcam",
        "sidebar.console": "Console",
        "sidebar.heightmap": "Mappa Altezza",
        "sidebar.gcodefiles": "File G-Code",
        "sidebar.gcodeviewer": "Visualizzatore 3D",
        "sidebar.history": "Cronologia",
        "sidebar.timelapse": "Timelapse",
        "sidebar.machine": "Macchina",
        "sidebar.configurator": "Klipper Configurator",
        "sidebar.settings": "Impostazioni",
        "card.general_params": "Parametri Generali Klipper",
        "card.mechanical_arch": "Architettura Meccanica (IDEX & Multi-Z)",
        "card.delta_geometry": "Geometria Delta (Opzionale)",
        "section.axis_limits_homing": "Limiti Assi & Configurazione Homing",
        "card.axis_x": "Asse X - Limiti & Homing",
        "card.axis_dc": "Dual Carriage (Secondo Carrello X IDEX)",
        "card.axis_y": "Asse Y - Limiti & Homing",
        "card.axis_z": "Asse Z - Limiti & Homing",
        "card.mcu_main": "Microcontrollore Principale (Scheda Madre)",
        "card.mcu_temp": "Monitoraggio Termico Host & Chip",
        "card.mcu_extra": "MCU Secondari & Toolhead ([mcu <nome>])",
        "card.stepper_config": "Configurazione Motore Passo-Passo",
        "card.stepper_dual_carriage": "Configurazione Dual Carriage X2",
        "card.stepper_motor_axis": "Configurazione Motore Asse",
        "card.driver_config": "Driver Stepper Motion",
        "card.driver_stepper_motion": "Driver Stepper Motion",
        "card.extruder_mech": "Meccanica Estrusore & Ugello",
        "card.extruder_mech_primary": "Meccanica Estrusore Primario",
        "card.extruder_mech_secondary": "Meccanica Estrusore Secondario IDEX",
        "card.extruder_thermal": "Riscaldatore Hotend & Sensore Temperatura",
        "card.extruder_algo": "Controllo Temperatura",
        "card.extruder_driver": "Driver Estrusore",
        "card.extruder_driver_primary": "Driver Estrusore Primario",
        "card.extruder_driver_secondary": "Driver Estrusore Secondario IDEX",
        "card.heater_bed": "Piatto Riscaldato",
        "card.bed_pid": "Regolazione PID Piatto",
        "card.fans_cooling": "Ventole di Raffreddamento Klipper",
        "card.adxl": "Accelerometro di Risonanza ([adxl345])",
        "card.leds": "Illuminazione LED & Neopixel",
        "card.core_features": "Funzionalità Essenziali Klipper & Mainsail",
        "card.includes": "File di Configurazione Inclusi ([include])",
        "card.macros": "Macro G-Code Personalizzate ([gcode_macro])",
        "card.probe": "Sonda di Livellamento (Probe / BLTouch)",
        "card.safe_z_home": "Homing Sicuro al Centro ([safe_z_home])",
        "card.z_tilt": "Allineamento Motori Z Indipendenti ([z_tilt])",
        "card.quad_gantry_level": "Allineamento 4 Motori Z ([quad_gantry_level])",
        "card.bed_mesh": "Livellamento a Rete del Piatto ([bed_mesh])",
        "card.resonance_tester": "Compensazione Risonanze & Taratura ([input_shaper] / [resonance_tester])",
        "include.title": "File di Configurazione Inclusi ([include])",
        "include.desc": "Organizza la tua configurazione modulare Klipper includendo file .cfg esterni.",
        "include.presets_title": "⚡ Includi File Standard Comuni",
        "macro.title": "Macro G-Code Personalizzate ([gcode_macro])",
        "macro.desc": "Gestisci, crea e modifica macro per la gestione delle stampe in Mainsail.",
        "btn.add_mcu": "Aggiungi MCU Secondario",
        "btn.add_fan": "Aggiungi Ventola Ausiliaria",
        "btn.add_led": "Aggiungi Striscia LED",
        "btn.add_macro": "Aggiungi Nuova Macro",
        "btn.add_include": "Aggiungi File Include",
        "btn.delete": "Elimina",
        "btn.save_connect": "Salva & Connetti",
        "btn.cancel": "Annulla",
        "btn.copy": "Copia negli Appunti",
        "btn.close": "Chiudi",
        "btn.insert_macro_template": "Inserisci Modelli Predefiniti",
        "modal.preview_title": "Anteprima Configurazione Klipper Generata",
        "modal.settings_title": "Impostazioni & Tema Mainsail",
        "modal.calc_title": "Calcolatore Rotation Distance",
        "modal.lang_title": "Lingua & Localizzazione (Mainsail Sync)",
        "modal.theme_title": "Integrazione Tema & Colori Mainsail",
        "modal.conn_section": "Stato Connessione & Versione",
        "modal.ip_label": "Indirizzo IP / Host Moonraker:",
        "modal.ip_helper": "Se Klipper Configurator gira sulla stessa macchina di Mainsail, lascia l'origine automatica.",
        "modal.lang_label": "Lingua Interfaccia:",
        "modal.lang_auto": "Automatica (Sincronizzata con Mainsail)",
        "modal.active_color": "Colore Primario Attivo:",
        "modal.custom_color": "Scegli Colore Personalizzato:",
        "modal.preset_colors": "Oppure seleziona un colore preset del produttore:",
        "modal.theme_mode": "Modalità Tema:",
        "modal.force_light": "Forza Tema Chiaro",
        "prompt.new_macro_name": "Nome della nuova Macro (es: PURGE_NOZZLE, M600):",
        "prompt.new_include_name": "Nome del file da includere (es: macros.cfg, stealthburner_leds.cfg):",
        "toast.loaded_success": "{file} caricato con successo",
        "toast.saved_success": "File {file} salvato con successo! (Backup creato)",
        "toast.restarting": "Riavvio di Klipper in corso...",
        "toast.restart_success": "Klipper riavviato! Ricarica completata.",
        "toast.offline_template": "Moonraker offline. Caricata configurazione template.",
        "toast.downloaded": "File {file} scaricato sul computer",
        "toast.copied": "Configurazione copiata negli appunti!",
        "toast.theme_set": "Colore del tema impostato a {color}",
        "toast.lang_set": "Lingua impostata su {lang}"
},
        de: {
        "nav.settings": "Einstellungen",
        "nav.unsaved_single": "1 ungespeicherte Änderung",
        "nav.unsaved_plural": "{n} ungespeicherte Änderungen",
        "nav.reload": "Neu laden",
        "nav.preview": "Vorschau",
        "nav.download": "Herunterladen",
        "nav.save": "Speichern",
        "nav.save_restart": "Speichern & Neustarten",
        "nav.conn_connected": "Moonraker: Verbunden",
        "nav.conn_connecting": "Moonraker: Verbinden...",
        "nav.conn_error": "Moonraker: Getrennt",
        "tab.kinematics": "Kinematik & Drucker",
        "tab.host_mcu": "Host & MCU",
        "tab.stepper": "Schrittmotoren",
        "tab.extruder": "Extruder",
        "tab.bed": "Bett & Nivellierung",
        "tab.misc": "Lüfter & Extras",
        "tab.include": "Include Dateien",
        "tab.macro": "G-Code Makros",
        "tab.calibration": "Kalibrierung",
        "sidebar.dashboard": "Dashboard",
        "sidebar.webcam": "Webcam",
        "sidebar.console": "Konsole",
        "sidebar.heightmap": "Höhenkarte",
        "sidebar.gcodefiles": "G-Code Dateien",
        "sidebar.gcodeviewer": "3D Betrachter",
        "sidebar.history": "Verlauf",
        "sidebar.timelapse": "Zeitraffer",
        "sidebar.machine": "Maschine",
        "sidebar.configurator": "Klipper Configurator",
        "sidebar.settings": "Einstellungen",
        "card.general_params": "Allgemeine Klipper-Parameter",
        "card.mechanical_arch": "Mechanische Architektur (IDEX & Multi-Z)",
        "card.delta_geometry": "Delta-Geometrie (Optional)",
        "section.axis_limits_homing": "Achsenbegrenzungen & Homing-Konfiguration",
        "card.axis_x": "X-Achse - Begrenzungen & Homing",
        "card.axis_dc": "Dual Carriage (Zweiter X-Schlitten IDEX)",
        "card.axis_y": "Y-Achse - Begrenzungen & Homing",
        "card.axis_z": "Z-Achse - Begrenzungen & Homing",
        "card.mcu_main": "Haupt-Mikrocontroller (Mainboard)",
        "card.mcu_temp": "Host- & Chip-Temperaturüberwachung",
        "card.mcu_extra": "Zusätzliche MCUs & Toolhead ([mcu <Name>])",
        "card.stepper_config": "Schrittmotor-Konfiguration",
        "card.stepper_dual_carriage": "Dual Carriage X2 Konfiguration",
        "card.stepper_motor_axis": "Motorkonfiguration Achse",
        "card.driver_config": "Schrittmotortreiber (Stepper Motion)",
        "card.driver_stepper_motion": "Schrittmotortreiber",
        "card.extruder_mech": "Extruder-Mechanik & Düse",
        "card.extruder_mech_primary": "Haupt-Extruder-Mechanik",
        "card.extruder_mech_secondary": "Zweiter IDEX-Extruder Mechanik",
        "card.extruder_thermal": "Hotend-Heizung & Temperatursensor",
        "card.extruder_algo": "Temperaturregelung",
        "card.extruder_driver": "Extruder-Treiber",
        "card.extruder_driver_primary": "Haupt-Extruder-Treiber",
        "card.extruder_driver_secondary": "Zweiter IDEX-Extruder Treiber",
        "card.heater_bed": "Heizbett",
        "card.bed_pid": "Heizbett-PID-Regelung",
        "card.fans_cooling": "Klipper-Kühllüfter",
        "card.adxl": "Resonanz-Beschleunigungsmesser ([adxl345])",
        "card.leds": "LED- & Neopixel-Beleuchtung",
        "card.core_features": "Wesentliche Klipper- & Mainsail-Funktionen",
        "card.includes": "Eingebundene Konfigurationsdateien ([include])",
        "card.macros": "Benutzerdefinierte G-Code-Makros ([gcode_macro])",
        "card.probe": "Bett-Nivelliersonde (Probe / BLTouch)",
        "card.safe_z_home": "Sicheres Homing im Zentrum ([safe_z_home])",
        "card.z_tilt": "Unabhängige Z-Motoren-Ausrichtung ([z_tilt])",
        "card.quad_gantry_level": "Ausrichtung von 4 Z-Motoren ([quad_gantry_level])",
        "card.bed_mesh": "Bett-Mesh-Nivellierung ([bed_mesh])",
        "card.resonance_tester": "Resonanzkompensation & Kalibrierung ([input_shaper] / [resonance_tester])",
        "include.title": "Eingebundene Konfigurationsdateien ([include])",
        "include.desc": "Organisieren Sie Ihre modulare Klipper-Konfiguration durch externe .cfg-Dateien.",
        "include.presets_title": "⚡ Gängige Standarddateien einbinden",
        "macro.title": "Benutzerdefinierte G-Code-Makros ([gcode_macro])",
        "macro.desc": "Verwalten, erstellen und bearbeiten Sie Makros für Druckabläufe in Mainsail.",
        "btn.add_mcu": "Zusätzliche MCU hinzufügen",
        "btn.add_fan": "Zusatzlüfter hinzufügen",
        "btn.add_led": "LED hinzufügen",
        "btn.add_macro": "Neues Makro erstellen",
        "btn.add_include": "Include-Datei hinzufügen",
        "btn.delete": "Löschen",
        "btn.save_connect": "Speichern & Verbinden",
        "btn.cancel": "Abbrechen",
        "btn.copy": "In Zwischenablage kopieren",
        "btn.close": "Schließen",
        "btn.insert_macro_template": "Standardvorlagen einfügen",
        "modal.preview_title": "Vorschau der generierten Klipper-Konfiguration",
        "modal.settings_title": "Einstellungen & Mainsail-Design",
        "modal.calc_title": "Rotation Distance Rechner",
        "modal.lang_title": "Sprache & Lokalisierung (Mainsail Sync)",
        "modal.theme_title": "Mainsail-Design & Farbintegration",
        "modal.conn_section": "Verbindungsstatus & Version",
        "modal.ip_label": "Moonraker IP-Adresse / Host:",
        "modal.ip_helper": "Wenn Klipper Configurator auf demselben Host wie Mainsail läuft, automatischen Ursprung beibehalten.",
        "modal.lang_label": "Oberflächensprache:",
        "modal.lang_auto": "Automatisch (Mit Mainsail synchronisiert)",
        "modal.active_color": "Aktive Primärfarbe:",
        "modal.custom_color": "Benutzerdefinierte Farbe wählen:",
        "modal.preset_colors": "Oder Herstellerfarbvoreinstellung wählen:",
        "modal.theme_mode": "Design-Modus:",
        "modal.force_light": "Helles Design erzwingen",
        "prompt.new_macro_name": "Name des neuen Makros (z. B. PURGE_NOZZLE, M600):",
        "prompt.new_include_name": "Name der Include-Datei (z. B. macros.cfg, stealthburner_leds.cfg):",
        "toast.loaded_success": "{file} erfolgreich geladen",
        "toast.saved_success": "Datei {file} erfolgreich gespeichert! (Backup erstellt)",
        "toast.restarting": "Klipper wird neu gestartet...",
        "toast.restart_success": "Klipper neu gestartet! Neuladen abgeschlossen.",
        "toast.offline_template": "Moonraker offline. Standardvorlage geladen.",
        "toast.downloaded": "Datei {file} auf Ihren Computer heruntergeladen",
        "toast.copied": "Konfiguration in die Zwischenablage kopiert!",
        "toast.theme_set": "Designfarbe auf {color} gesetzt",
        "toast.lang_set": "Sprache auf {lang} geändert"
},
        fr: {
        "nav.settings": "Paramètres",
        "nav.unsaved_single": "1 modification non enregistrée",
        "nav.unsaved_plural": "{n} modifications",
        "nav.reload": "Recharger",
        "nav.preview": "Aperçu",
        "nav.download": "Télécharger",
        "nav.save": "Enregistrer",
        "nav.save_restart": "Enregistrer & Redémarrer",
        "nav.conn_connected": "Moonraker: Connecté",
        "nav.conn_connecting": "Moonraker: Connexion...",
        "nav.conn_error": "Moonraker: Déconnecté",
        "tab.kinematics": "Cinématique & Imprimante",
        "tab.host_mcu": "Hôte & MCU",
        "tab.stepper": "Moteurs Pas-à-Pas",
        "tab.extruder": "Extrudeur",
        "tab.bed": "Plateau & Nivellement",
        "tab.misc": "Ventilateurs & Auxiliaires",
        "tab.include": "Fichiers Include",
        "tab.macro": "Macros G-Code",
        "tab.calibration": "Calibrage",
        "sidebar.dashboard": "Tableau de bord",
        "sidebar.webcam": "Webcam",
        "sidebar.console": "Console",
        "sidebar.heightmap": "Carte de hauteur",
        "sidebar.gcodefiles": "Fichiers G-Code",
        "sidebar.gcodeviewer": "Visionneuse 3D",
        "sidebar.history": "Historique",
        "sidebar.timelapse": "Timelapse",
        "sidebar.machine": "Machine",
        "sidebar.configurator": "Klipper Configurator",
        "sidebar.settings": "Paramètres",
        "card.general_params": "Paramètres Généraux Klipper",
        "card.mechanical_arch": "Architecture Mécanique (IDEX & Multi-Z)",
        "card.delta_geometry": "Géométrie Delta (Optionnel)",
        "section.axis_limits_homing": "Limites d'Axe & Configuration de Homing",
        "card.axis_x": "Axe X - Limites & Homing",
        "card.axis_dc": "Dual Carriage (Deuxième Chariot X IDEX)",
        "card.axis_y": "Axe Y - Limites & Homing",
        "card.axis_z": "Axe Z - Limites & Homing",
        "card.mcu_main": "Microcontrôleur Principal (Carte Mère)",
        "card.mcu_temp": "Surveillance Thermique Hôte & Puce",
        "card.mcu_extra": "Microcontrôleurs Secondaires & Toolhead ([mcu <nom>])",
        "card.stepper_config": "Configuration Moteur Pas-à-Pas",
        "card.stepper_dual_carriage": "Configuration Dual Carriage X2",
        "card.stepper_motor_axis": "Configuration Moteur Axe",
        "card.driver_config": "Pilote Stepper Motion",
        "card.driver_stepper_motion": "Pilote Moteur Pas-à-Pas",
        "card.extruder_mech": "Mécanique Extrudeur & Buse",
        "card.extruder_mech_primary": "Mécanique Extrudeur Principal",
        "card.extruder_mech_secondary": "Mécanique Deuxième Extrudeur IDEX",
        "card.extruder_thermal": "Chauffe Hotend & Capteur de Température",
        "card.extruder_algo": "Contrôle de Température",
        "card.extruder_driver": "Pilote d'Extrudeur",
        "card.extruder_driver_primary": "Pilote Extrudeur Principal",
        "card.extruder_driver_secondary": "Pilote Deuxième Extrudeur IDEX",
        "card.heater_bed": "Plateau Chauffant",
        "card.bed_pid": "Régulation PID du Plateau",
        "card.fans_cooling": "Ventilateurs de Refroidissement Klipper",
        "card.adxl": "Accéléromètre de Résonance ([adxl345])",
        "card.leds": "Éclairage LED & Neopixel",
        "card.core_features": "Fonctionnalités Essentielles Klipper & Mainsail",
        "card.includes": "Fichiers Inclus ([include])",
        "card.macros": "Macros G-Code Personnalisées ([gcode_macro])",
        "card.probe": "Sonde de Nivellement (Probe / BLTouch)",
        "card.safe_z_home": "Homing Sécurisé au Centre ([safe_z_home])",
        "card.z_tilt": "Alignement Moteurs Z Indépendants ([z_tilt])",
        "card.quad_gantry_level": "Alignement 4 Moteurs Z ([quad_gantry_level])",
        "card.bed_mesh": "Nivellement Maillage Plateau ([bed_mesh])",
        "card.resonance_tester": "Compensation des Résonances & Calibrage ([input_shaper] / [resonance_tester])",
        "include.title": "Fichiers Inclus ([include])",
        "include.desc": "Organisez votre configuration modulaire Klipper avec des fichiers .cfg externes.",
        "include.presets_title": "⚡ Inclure Fichiers Standards Communs",
        "macro.title": "Macros G-Code Personnalisées ([gcode_macro])",
        "macro.desc": "Gérez, créez et modifiez les macros pour la gestion d'impression dans Mainsail.",
        "btn.add_mcu": "Ajouter un MCU secondaire",
        "btn.add_fan": "Ajouter un ventilateur",
        "btn.add_led": "Ajouter une LED",
        "btn.add_macro": "Nouvelle Macro",
        "btn.add_include": "Ajouter Fichier Include",
        "btn.delete": "Supprimer",
        "btn.save_connect": "Enregistrer & Connecter",
        "btn.cancel": "Annuler",
        "btn.copy": "Copier dans le presse-papiers",
        "btn.close": "Fermer",
        "btn.insert_macro_template": "Insérer Modèles Prédéfinis",
        "modal.preview_title": "Aperçu de la Configuration Klipper Générée",
        "modal.settings_title": "Paramètres & Thème Mainsail",
        "modal.calc_title": "Calculateur Rotation Distance",
        "modal.lang_title": "Langue & Localisation (Mainsail Sync)",
        "modal.theme_title": "Intégration Thème & Couleurs Mainsail",
        "modal.conn_section": "État de la Connexion & Version",
        "modal.ip_label": "Adresse IP / Hôte Moonraker:",
        "modal.ip_helper": "Si Klipper Configurator tourne sur la même machine que Mainsail, laissez origine automatique.",
        "modal.lang_label": "Langue de l'interface:",
        "modal.lang_auto": "Automatique (Synchronisé avec Mainsail)",
        "modal.active_color": "Couleur Primaire Active:",
        "modal.custom_color": "Choisir une Couleur Personnalisée:",
        "modal.preset_colors": "Ou sélectionner un préréglage fabricant:",
        "modal.theme_mode": "Mode Thème:",
        "modal.force_light": "Forcer le Thème Clair",
        "prompt.new_macro_name": "Nom de la nouvelle macro (ex: PURGE_NOZZLE, M600):",
        "prompt.new_include_name": "Nom du fichier à inclure (ex: macros.cfg, stealthburner_leds.cfg):",
        "toast.loaded_success": "{file} chargé avec succès",
        "toast.saved_success": "Fichier {file} enregistré avec succès! (Sauvegarde créée)",
        "toast.restarting": "Redémarrage de Klipper...",
        "toast.restart_success": "Klipper redémarré! Rechargement terminé.",
        "toast.offline_template": "Moonraker hors ligne. Configuration modèle chargée.",
        "toast.downloaded": "Fichier {file} téléchargé sur votre ordinateur",
        "toast.copied": "Configuration copiée dans le presse-papiers!",
        "toast.theme_set": "Couleur du thème définie sur {color}",
        "toast.lang_set": "Langue définie sur {lang}"
},
        es: {
        "nav.settings": "Ajustes",
        "nav.unsaved_single": "1 cambio sin guardar",
        "nav.unsaved_plural": "{n} cambios sin guardar",
        "nav.reload": "Recargar",
        "nav.preview": "Vista previa",
        "nav.download": "Descargar",
        "nav.save": "Guardar",
        "nav.save_restart": "Guardar y Reiniciar",
        "nav.conn_connected": "Moonraker: Conectado",
        "nav.conn_connecting": "Moonraker: Conectando...",
        "nav.conn_error": "Moonraker: Desconectado",
        "tab.kinematics": "Cinemática e Impresora",
        "tab.host_mcu": "Host y MCU",
        "tab.stepper": "Motores Paso a Paso",
        "tab.extruder": "Extrusor",
        "tab.bed": "Cama y Nivelación",
        "tab.misc": "Ventiladores y Extras",
        "tab.include": "Archivos Include",
        "tab.macro": "Macros G-Code",
        "tab.calibration": "Calibración",
        "sidebar.dashboard": "Panel de control",
        "sidebar.webcam": "Cámara web",
        "sidebar.console": "Consola",
        "sidebar.heightmap": "Mapa de altura",
        "sidebar.gcodefiles": "Archivos G-Code",
        "sidebar.gcodeviewer": "Visor 3D",
        "sidebar.history": "Historial",
        "sidebar.timelapse": "Timelapse",
        "sidebar.machine": "Máquina",
        "sidebar.configurator": "Klipper Configurator",
        "sidebar.settings": "Ajustes",
        "card.general_params": "Parámetros Generales de Klipper",
        "card.mechanical_arch": "Arquitectura Mecánica (IDEX & Multi-Z)",
        "card.delta_geometry": "Geometría Delta (Opcional)",
        "section.axis_limits_homing": "Límites de Eje & Configuración de Homing",
        "card.axis_x": "Eje X - Límites & Homing",
        "card.axis_dc": "Dual Carriage (Segundo Carro X IDEX)",
        "card.axis_y": "Eje Y - Límites & Homing",
        "card.axis_z": "Eje Z - Límites & Homing",
        "card.mcu_main": "Microcontrolador Principal (Placa Base)",
        "card.mcu_temp": "Monitorización Térmica Host y Chip",
        "card.mcu_extra": "Microcontroladores Secundarios & Toolhead ([mcu <nombre>])",
        "card.stepper_config": "Configuración Motor Paso a Paso",
        "card.stepper_dual_carriage": "Configuración Dual Carriage X2",
        "card.stepper_motor_axis": "Configuración Motor Eje",
        "card.driver_config": "Controlador Stepper Motion",
        "card.driver_stepper_motion": "Controlador Stepper Motion",
        "card.extruder_mech": "Mecánica Extrusor & Boquilla",
        "card.extruder_mech_primary": "Mecánica Extrusor Principal",
        "card.extruder_mech_secondary": "Mecánica Segundo Extrusor IDEX",
        "card.extruder_thermal": "Calentador & Sensor de Temperatura Hotend",
        "card.extruder_algo": "Control de Temperatura",
        "card.extruder_driver": "Controlador del Extrusor",
        "card.extruder_driver_primary": "Controlador Extrusor Principal",
        "card.extruder_driver_secondary": "Controlador Segundo Extrusor IDEX",
        "card.heater_bed": "Cama Caliente",
        "card.bed_pid": "Ajuste PID de Cama",
        "card.fans_cooling": "Ventiladores de Refrigeración Klipper",
        "card.adxl": "Acelerómetro de Resonancia ([adxl345])",
        "card.leds": "Iluminación LED y Neopixel",
        "card.core_features": "Funcionalidades Esenciales Klipper y Mainsail",
        "card.includes": "Archivos Incluidos ([include])",
        "card.macros": "Macros G-Code Personalizadas ([gcode_macro])",
        "card.probe": "Sonda de Nivelación (Probe / BLTouch)",
        "card.safe_z_home": "Homing Seguro en el Centro ([safe_z_home])",
        "card.z_tilt": "Alineación Independiente Motores Z ([z_tilt])",
        "card.quad_gantry_level": "Alineación de 4 Motores Z ([quad_gantry_level])",
        "card.bed_mesh": "Nivelación de Malla de Cama ([bed_mesh])",
        "card.resonance_tester": "Compensación de Resonancias & Calibración ([input_shaper] / [resonance_tester])",
        "include.title": "Archivos Incluidos ([include])",
        "include.desc": "Organiza tu configuración modular de Klipper incluyendo archivos .cfg externos.",
        "include.presets_title": "⚡ Incluir Archivos Estándar Comunes",
        "macro.title": "Macros G-Code Personalizadas ([gcode_macro])",
        "macro.desc": "Administra, crea y edita macros para impresión en Mainsail.",
        "btn.add_mcu": "Añadir MCU secundaria",
        "btn.add_fan": "Añadir ventilador",
        "btn.add_led": "Añadir LED",
        "btn.add_macro": "Nueva Macro",
        "btn.add_include": "Añadir Archivo Include",
        "btn.delete": "Eliminar",
        "btn.save_connect": "Guardar y Conectar",
        "btn.cancel": "Cancelar",
        "btn.copy": "Copiar al portapapeles",
        "btn.close": "Cerrar",
        "btn.insert_macro_template": "Insertar Plantillas Predeterminadas",
        "modal.preview_title": "Vista Previa de Configuración Klipper Generada",
        "modal.settings_title": "Ajustes y Tema Mainsail",
        "modal.calc_title": "Calculadora Rotation Distance",
        "modal.lang_title": "Idioma y Localización (Mainsail Sync)",
        "modal.theme_title": "Integración Tema y Colores Mainsail",
        "modal.conn_section": "Estado de Conexión y Versión",
        "modal.ip_label": "Dirección IP / Host Moonraker:",
        "modal.ip_helper": "Si Klipper Configurator se ejecuta en la misma máquina que Mainsail, deja el origen automático.",
        "modal.lang_label": "Idioma de la interfaz:",
        "modal.lang_auto": "Automático (Sincronizado con Mainsail)",
        "modal.active_color": "Color Primario Activo:",
        "modal.custom_color": "Elegir Color Personalizado:",
        "modal.preset_colors": "O selecciona un ajuste preestablecido de fabricante:",
        "modal.theme_mode": "Modo de Tema:",
        "modal.force_light": "Forzar Tema Claro",
        "prompt.new_macro_name": "Nombre de la nueva macro (ej: PURGE_NOZZLE, M600):",
        "prompt.new_include_name": "Nombre del archivo a incluir (ej: macros.cfg, stealthburner_leds.cfg):",
        "toast.loaded_success": "{file} cargado con éxito",
        "toast.saved_success": "¡Archivo {file} guardado con éxito! (Copia de seguridad creada)",
        "toast.restarting": "Reiniciando Klipper...",
        "toast.restart_success": "¡Klipper reiniciado! Recarga completada.",
        "toast.offline_template": "Moonraker desconectado. Configuración plantilla cargada.",
        "toast.downloaded": "Archivo {file} descargado a su ordenador",
        "toast.copied": "¡Configuración copiada al portapapeles!",
        "toast.theme_set": "Color del tema establecido en {color}",
        "toast.lang_set": "Idioma establecido en {lang}"
}
    };

    // =========================================================================
    // Mappatura Traduzioni per Form Labels (per ID elemento)
    // =========================================================================
    const FORM_LABEL_TRANSLATIONS = {
        en: {
        "printer-kinematics": "Main Kinematics Type:",
        "printer-max-velocity": "Maximum Velocity (max_velocity):",
        "printer-max-accel": "Maximum Acceleration (max_accel):",
        "printer-cruise-ratio": "Cruise Ratio (minimum_cruise_ratio):",
        "printer-square-corner": "Square Corner Velocity:",
        "printer-max-z-velocity": "Max Z Velocity:",
        "printer-max-z-accel": "Max Z Acceleration:",
        "printer-max-accel-to-decel": "Max Accel to Decel (Optional legacy):",
        "check-enable-idex": "Enable IDEX Kinematics (Dual Independent X Carriage)",
        "select-z-motor-count": "Number of Z Motors (Multi-Axis Z):",
        "delta-arm-length": "Arm Length (arm_length):",
        "delta-radius": "Delta Radius (delta_radius):",
        "delta-print-radius": "Print Radius (print_radius):",
        "x-pos-min": "Min (position_min):",
        "x-pos-max": "Max (position_max):",
        "x-pos-endstop": "Endstop:",
        "x-homing-speed": "homing_speed:",
        "x-homing-retract-dist": "homing_retract_dist:",
        "x-homing-retract-speed": "homing_retract_speed:",
        "dc-pos-min": "Min (position_min):",
        "dc-pos-max": "Max (position_max):",
        "dc-pos-endstop": "Endstop (X2 Parking):",
        "dc-homing-speed": "homing_speed:",
        "dc-homing-retract-dist": "homing_retract_dist:",
        "dc-homing-retract-speed": "homing_retract_speed:",
        "y-pos-min": "Min (position_min):",
        "y-pos-max": "Max (position_max):",
        "y-pos-endstop": "Endstop:",
        "y-homing-speed": "homing_speed:",
        "y-homing-retract-dist": "homing_retract_dist:",
        "y-homing-retract-speed": "homing_retract_speed:",
        "z-pos-min": "Min (position_min):",
        "z-pos-max": "Max (position_max):",
        "z-pos-endstop": "Endstop (if physical):",
        "z-homing-speed": "homing_speed:",
        "z-homing-retract-dist": "homing_retract_dist:",
        "z-homing-retract-speed": "homing_retract_speed:",
        "mcu-conn-type": "Connection Method:",
        "mcu-serial": "USB Serial Port (serial):",
        "mcu-canbus-uuid": "CAN Bus UUID (canbus_uuid):",
        "mcu-baud": "Baud Rate:",
        "mcu-restart-method": "Restart Method:",
        "check-enable-host-temp": "Enable Raspberry Pi / Host Temperature Sensor",
        "check-enable-mcu-temp": "Enable Mainboard (MCU) Temperature Sensor",
        "stepper-step-pin": "Step Pin:",
        "stepper-dir-pin": "Dir Pin:",
        "stepper-enable-pin": "Enable Pin:",
        "stepper-microsteps": "Microsteps:",
        "stepper-steps-rotation": "Motor Degrees:",
        "stepper-rotation-distance": "Rotation Distance:",
        "stepper-endstop-pin": "Endstop Pin:",
        "driver-model-select": "Driver Model:",
        "driver-conn-type-select": "Driver Connection Type:",
        "driver-uart-pin": "UART Pin (uart_pin):",
        "driver-tx-pin": "TX Pin (tx_pin - Optional):",
        "driver-uart-address": "UART Address (uart_address):",
        "driver-cs-pin": "Chip Select Pin (cs_pin):",
        "driver-spi-mode": "SPI Bus Mode:",
        "driver-spi-bus": "Hardware SPI Bus (spi_bus):",
        "driver-spi-sclk": "SCLK Pin (spi_software_sclk_pin):",
        "driver-spi-mosi": "MOSI Pin (spi_software_mosi_pin):",
        "driver-spi-miso": "MISO Pin (spi_software_miso_pin):",
        "driver-run-current": "Operating Current (run_current):",
        "driver-stealthchop": "StealthChop Mode:",
        "check-enable-hold-current": "Enable Hold Current (hold_current)",
        "driver-hold-current": "Hold Current (hold_current):",
        "check-enable-sense-resistor": "Specify Sense Resistor (sense_resistor)",
        "driver-sense-resistor": "Sense Resistor (sense_resistor):",
        "driver-interpolate": "Interpolation to 256 microsteps (interpolate: True)",
        "driver-sensorless-enable": "Sensorless Homing (Homing without physical endstop)",
        "driver-diag-pin": "Diag Pin:",
        "driver-sgthrs": "StallGuard Sensitivity (driver_SGTHRS / driver_SGT):",
        "extruder-step-pin": "Step Pin:",
        "extruder-dir-pin": "Dir Pin:",
        "extruder-enable-pin": "Enable Pin:",
        "extruder-rot-dist": "Rotation Distance:",
        "extruder-gear-ratio": "Gear Ratio (gear_ratio):",
        "extruder-nozzle-dia": "Nozzle Diameter (nozzle_diameter):",
        "extruder-filament-dia": "Filament Diameter:",
        "extruder-pressure-advance": "Pressure Advance:",
        "extruder-sensor-type": "Sensor Type (sensor_type):",
        "extruder-sensor-spi-mode": "SPI Bus Mode:",
        "extruder-sensor-spi-bus": "SPI Bus (spi_bus):",
        "extruder-sensor-spi-speed": "SPI Speed (spi_speed):",
        "extruder-sensor-spi-sclk": "SCLK Pin (spi_software_sclk_pin):",
        "extruder-sensor-spi-mosi": "MOSI Pin (spi_software_mosi_pin):",
        "extruder-sensor-spi-miso": "MISO Pin (spi_software_miso_pin):",
        "extruder-rtd-nominal-r": "Nominal Resistance at 0°C (rtd_nominal_r):",
        "extruder-rtd-reference-r": "Reference Resistance (rtd_reference_r):",
        "extruder-rtd-num-wires": "Probe Wire Count (rtd_num_of_wires):",
        "extruder-rtd-filter": "AC Noise Filter (rtd_use_50Hz_filter):",
        "extruder-heater-pin": "Heater Pin:",
        "extruder-sensor-pin": "Sensor Pin (CS for SPI):",
        "extruder-min-temp": "Min Temp:",
        "extruder-max-temp": "Max Temp:",
        "extruder-min-extrude": "Min Extrude Temp:",
        "extruder-control-type": "Control Algorithm (control):",
        "extruder-pid-kp": "pid_Kp:",
        "extruder-pid-ki": "pid_Ki:",
        "extruder-pid-kd": "pid_Kd:",
        "extruder-max-delta": "Hysteresis Tolerance (max_delta):",
        "bed-sensor-type": "Bed Sensor Type (sensor_type):",
        "bed-heater-pin": "Heater Pin (heater_pin):",
        "bed-sensor-pin": "Sensor Pin (sensor_pin):",
        "bed-min-temp": "Min Temp:",
        "bed-max-temp": "Max Bed Temp:",
        "bed-control-type": "Control Algorithm:",
        "bed-pid-kp": "pid_Kp:",
        "bed-pid-ki": "pid_Ki:",
        "bed-pid-kd": "pid_Kd:",
        "bed-max-delta": "Hysteresis Tolerance (max_delta):",
        "fan-part-pin": "Part Fan Pin (pin):",
        "fan-part-kick": "Kick Start Time (s):",
        "fan-part-off-below": "Off Below:",
        "check-enable-adxl": "Enable ADXL345 Accelerometer (Measure resonance)",
        "adxl-cs-pin": "CS Pin (cs_pin):",
        "adxl-spi-mode": "SPI Connection Mode:",
        "adxl-spi-bus": "Hardware SPI Bus (spi_bus):",
        "adxl-spi-sclk": "SCLK Pin (spi_software_sclk_pin):",
        "adxl-spi-mosi": "MOSI Pin (spi_software_mosi_pin):",
        "adxl-spi-miso": "MISO Pin (spi_software_miso_pin):",
        "adxl-axes-map": "Axes Mapping (axes_map):",
        "adxl-rate": "Sampling Rate (rate):",
        "check-virtual-sd": "[virtual_sdcard] - Enable G-Code file printing from Moonraker",
        "check-pause-resume": "[pause_resume] - Enable Pause and Resume commands",
        "check-display-status": "[display_status] - Enable progress and status display",
        "check-respond": "[respond] - Enable messages and M118 console commands",
        "idle-timeout": "Idle Timeout (Power off motors/heaters):",
        "probe-type-select": "Installed Probe Type:",
        "probe-sensor-pin": "Sensor Pin:",
        "probe-control-pin": "Control Pin (for BLTouch):",
        "probe-x-offset": "X Offset:",
        "probe-y-offset": "Y Offset:",
        "probe-z-offset": "Z Offset (Base):",
        "probe-samples": "Samples per point:",
        "probe-samples-result": "Samples Result:",
        "check-enable-safe-z": "Enable Safe Z Home (Z Homing at bed center)",
        "safe-z-pos": "Center Coordinates (home_xy_position):",
        "safe-z-hop": "Z Hop:",
        "safe-z-speed": "Speed:",
        "z-tilt-positions": "Z Motor Pivot Points (z_positions):",
        "z-tilt-points": "Bed Probe Points (points):",
        "z-tilt-retries": "Max Retries (retries):",
        "z-tilt-tolerance": "Tolerance (retry_tolerance):",
        "qgl-corners": "Gantry Outer Corners (gantry_corners):",
        "qgl-points": "4 Probe Points (points):",
        "qgl-retries": "Max Retries (retries):",
        "qgl-tolerance": "Tolerance (retry_tolerance):",
        "mesh-min": "Min Coordinates (mesh_min):",
        "mesh-max": "Max Coordinates (mesh_max):",
        "mesh-probe-count": "Grid Points (probe_count):",
        "mesh-algorithm": "Interpolation Algorithm:",
        "check-enable-shaper": "Enable Input Shaper Filter (Eliminate Ghosting / Ringing)",
        "shaper-freq-x": "X Frequency (shaper_freq_x):",
        "shaper-type-x": "X Filter Type:",
        "shaper-freq-y": "Y Frequency (shaper_freq_y):",
        "shaper-type-y": "Y Filter Type:",
        "res-accel-chip": "Accelerometer Chip (accel_chip):",
        "res-probe-points": "Test Coordinates X, Y, Z (probe_points):",
        "res-accel-per-hz": "Acceleration per Hz (accel_per_hz):",
        "res-max-smoothing": "Max Smoothing (max_smoothing):",
        "calibration-z-offset": "Probe Z-Offset (z_offset):",
        "input-moonraker-url": "Moonraker IP / Host Address:",
        "check-force-light-mode": "Force Light Theme (Light Mode)",
        "extruder-driver-model-select": "Extruder Driver Model:",
        "extruder-driver-conn-type-select": "Extruder Driver Connection Type:",
        "extruder-driver-uart-pin": "UART Pin (uart_pin):",
        "extruder-driver-tx-pin": "TX Pin (tx_pin - Optional):",
        "extruder-driver-uart-address": "UART Address (uart_address):",
        "extruder-driver-cs-pin": "Chip Select Pin (cs_pin):",
        "extruder-driver-spi-mode": "SPI Bus Mode:",
        "extruder-driver-spi-bus": "Hardware SPI Bus (spi_bus):",
        "extruder-driver-spi-sclk": "SCLK Pin (spi_software_sclk_pin):",
        "extruder-driver-spi-mosi": "MOSI Pin (spi_software_mosi_pin):",
        "extruder-driver-spi-miso": "MISO Pin (spi_software_miso_pin):",
        "extruder-driver-run-current": "Operating Current (run_current):",
        "extruder-driver-stealthchop": "StealthChop Mode:",
        "extruder-driver-hold-current": "Hold Current (hold_current):",
        "extruder-driver-sense-resistor": "Sense Resistor (sense_resistor):",
        "select-ui-language": "Interface Language:",
        "check-invert-dir": "Invert Direction Pin (!dir_pin)",
        "check-invert-enable": "Invert Enable Pin (!enable_pin)",
        "extruder-check-enable-hold-current": "Enable Hold Current (hold_current)",
        "extruder-check-enable-sense-resistor": "Specify Sense Resistor (sense_resistor)",
        "extruder-driver-interpolate": "Interpolation to 256 microsteps (interpolate: True)",
        "check-enable-resonance-tester": "Enable Resonance Tester ([resonance_tester])"
},
        it: {
        "printer-kinematics": "Tipo di Cinematica Principale:",
        "printer-max-velocity": "Velocità Massima (max_velocity):",
        "printer-max-accel": "Accelerazione Massima (max_accel):",
        "printer-cruise-ratio": "Rapporto Crociera (minimum_cruise_ratio):",
        "printer-square-corner": "Square Corner Velocity:",
        "printer-max-z-velocity": "Velocità Max Z:",
        "printer-max-z-accel": "Accelerazione Max Z:",
        "printer-max-accel-to-decel": "Max Accel to Decel (Opzionale legacy):",
        "select-z-motor-count": "Numero di Motori Asse Z (Multi-Asse Z):",
        "delta-arm-length": "Lunghezza Braccio (arm_length):",
        "delta-radius": "Raggio Delta (delta_radius):",
        "delta-print-radius": "Raggio di Stampa (print_radius):",
        "x-pos-min": "Min (position_min):",
        "x-pos-max": "Max (position_max):",
        "x-pos-endstop": "Endstop:",
        "x-homing-speed": "homing_speed:",
        "x-homing-retract-dist": "homing_retract_dist:",
        "x-homing-retract-speed": "homing_retract_speed:",
        "dc-pos-min": "Min (position_min):",
        "dc-pos-max": "Max (position_max):",
        "dc-pos-endstop": "Endstop (Parcheggio X2):",
        "dc-homing-speed": "homing_speed:",
        "dc-homing-retract-dist": "homing_retract_dist:",
        "dc-homing-retract-speed": "homing_retract_speed:",
        "y-pos-min": "Min (position_min):",
        "y-pos-max": "Max (position_max):",
        "y-pos-endstop": "Endstop:",
        "y-homing-speed": "homing_speed:",
        "y-homing-retract-dist": "homing_retract_dist:",
        "y-homing-retract-speed": "homing_retract_speed:",
        "z-pos-min": "Min (position_min):",
        "z-pos-max": "Max (position_max):",
        "z-pos-endstop": "Endstop (se fisico):",
        "z-homing-speed": "homing_speed:",
        "z-homing-retract-dist": "homing_retract_dist:",
        "z-homing-retract-speed": "homing_retract_speed:",
        "mcu-conn-type": "Metodo di Connessione:",
        "mcu-serial": "Porta Seriale USB (serial):",
        "mcu-canbus-uuid": "UUID CAN Bus (canbus_uuid):",
        "mcu-baud": "Baud Rate:",
        "mcu-restart-method": "Metodo di Riavvio:",
        "stepper-step-pin": "Step Pin:",
        "stepper-dir-pin": "Dir Pin:",
        "stepper-enable-pin": "Enable Pin:",
        "stepper-microsteps": "Microsteps:",
        "stepper-steps-rotation": "Gradi Motore:",
        "stepper-rotation-distance": "Rotation Distance:",
        "stepper-endstop-pin": "Finecorsa / Endstop Pin:",
        "driver-model-select": "Modello Driver:",
        "driver-conn-type-select": "Tipo Connessione Driver:",
        "driver-uart-pin": "Pin UART (uart_pin):",
        "driver-tx-pin": "Pin TX (tx_pin - Opzionale):",
        "driver-uart-address": "Indirizzo UART (uart_address):",
        "driver-cs-pin": "Pin Chip Select (cs_pin):",
        "driver-spi-mode": "Modalità Bus SPI:",
        "driver-spi-bus": "Bus SPI Hardware (spi_bus):",
        "driver-spi-sclk": "Pin SCLK (spi_software_sclk_pin):",
        "driver-spi-mosi": "Pin MOSI (spi_software_mosi_pin):",
        "driver-spi-miso": "Pin MISO (spi_software_miso_pin):",
        "driver-run-current": "Corrente Operativa (run_current):",
        "driver-stealthchop": "Modalità StealthChop:",
        "driver-hold-current": "Corrente a Riposo (hold_current):",
        "driver-sense-resistor": "Resistenza di Sense (sense_resistor):",
        "driver-diag-pin": "Diag Pin:",
        "driver-sgthrs": "Sensibilità StallGuard (driver_SGTHRS / driver_SGT):",
        "extruder-step-pin": "Step Pin:",
        "extruder-dir-pin": "Dir Pin:",
        "extruder-enable-pin": "Enable Pin:",
        "extruder-rot-dist": "Rotation Distance:",
        "extruder-gear-ratio": "Rapporto Ingranaggi (gear_ratio):",
        "extruder-nozzle-dia": "Diametro Ugello (nozzle_diameter):",
        "extruder-filament-dia": "Diametro Filamento:",
        "extruder-pressure-advance": "Pressure Advance:",
        "extruder-sensor-type": "Tipo di Sensore (sensor_type):",
        "extruder-sensor-spi-mode": "Modalità Bus SPI:",
        "extruder-sensor-spi-bus": "Bus SPI (spi_bus):",
        "extruder-sensor-spi-speed": "Velocità SPI (spi_speed):",
        "extruder-sensor-spi-sclk": "SCLK Pin (spi_software_sclk_pin):",
        "extruder-sensor-spi-mosi": "MOSI Pin (spi_software_mosi_pin):",
        "extruder-sensor-spi-miso": "MISO Pin (spi_software_miso_pin):",
        "extruder-rtd-nominal-r": "Resistenza Nominale a 0°C (rtd_nominal_r):",
        "extruder-rtd-reference-r": "Resistenza di Riferimento (rtd_reference_r):",
        "extruder-rtd-num-wires": "Numero di Fili Sonda (rtd_num_of_wires):",
        "extruder-rtd-filter": "Filtro Rumore AC (rtd_use_50Hz_filter):",
        "extruder-heater-pin": "Heater Pin:",
        "extruder-sensor-pin": "Sensor Pin (CS per SPI):",
        "extruder-min-temp": "Temp Minima:",
        "extruder-max-temp": "Temp Massima:",
        "extruder-min-extrude": "Estrusione Min:",
        "extruder-control-type": "Tipologia di Controllo (control):",
        "extruder-pid-kp": "pid_Kp:",
        "extruder-pid-ki": "pid_Ki:",
        "extruder-pid-kd": "pid_Kd:",
        "extruder-max-delta": "Tolleranza Isteresi (max_delta):",
        "extruder-driver-model-select": "Modello Driver:",
        "extruder-driver-conn-type-select": "Tipo Connessione Driver:",
        "extruder-driver-uart-pin": "Pin UART (uart_pin):",
        "extruder-driver-tx-pin": "Pin TX (tx_pin - Opzionale):",
        "extruder-driver-uart-address": "Indirizzo UART (uart_address):",
        "extruder-driver-cs-pin": "Pin Chip Select (cs_pin):",
        "extruder-driver-spi-mode": "Modalità Bus SPI:",
        "extruder-driver-spi-bus": "Bus SPI Hardware (spi_bus):",
        "extruder-driver-spi-sclk": "Pin SCLK (spi_software_sclk_pin):",
        "extruder-driver-spi-mosi": "Pin MOSI (spi_software_mosi_pin):",
        "extruder-driver-spi-miso": "Pin MISO (spi_software_miso_pin):",
        "extruder-driver-run-current": "Corrente Operativa (run_current):",
        "extruder-driver-stealthchop": "Modalità StealthChop:",
        "extruder-driver-hold-current": "Corrente a Riposo (hold_current):",
        "extruder-driver-sense-resistor": "Resistenza di Sense (sense_resistor):",
        "bed-sensor-type": "Tipo di Sensore Piatto (sensor_type):",
        "bed-heater-pin": "Pin Riscaldatore (heater_pin):",
        "bed-sensor-pin": "Pin Sensore (sensor_pin):",
        "bed-min-temp": "Temp Minima:",
        "bed-max-temp": "Temp Massima Piatto:",
        "bed-control-type": "Algoritmo di Controllo:",
        "bed-pid-kp": "pid_Kp:",
        "bed-pid-ki": "pid_Ki:",
        "bed-pid-kd": "pid_Kd:",
        "bed-max-delta": "Tolleranza Isteresi (max_delta):",
        "fan-part-pin": "Pin Ventola Pezzo (pin):",
        "fan-part-kick": "Kick Start Time (s):",
        "fan-part-off-below": "Off Below:",
        "adxl-cs-pin": "CS Pin (cs_pin):",
        "adxl-spi-mode": "Modalità Connessione SPI:",
        "adxl-spi-bus": "Bus SPI Hardware (spi_bus):",
        "adxl-spi-sclk": "SCLK Pin (spi_software_sclk_pin):",
        "adxl-spi-mosi": "MOSI Pin (spi_software_mosi_pin):",
        "adxl-spi-miso": "MISO Pin (spi_software_miso_pin):",
        "adxl-axes-map": "Mappatura Assi (axes_map):",
        "adxl-rate": "Frequenza Campionamento (rate):",
        "idle-timeout": "Idle Timeout (Spegnimento motori/riscaldatori):",
        "probe-type-select": "Tipo di Sonda Installata:",
        "probe-sensor-pin": "Sensor Pin:",
        "probe-control-pin": "Control Pin (per BLTouch):",
        "probe-x-offset": "X Offset:",
        "probe-y-offset": "Y Offset:",
        "probe-z-offset": "Z Offset (Base):",
        "probe-samples": "Campioni per punto:",
        "probe-samples-result": "Risultato Campioni:",
        "safe-z-pos": "Coordinate Centro (home_xy_position):",
        "safe-z-hop": "Z Hop:",
        "safe-z-speed": "Velocità:",
        "z-tilt-positions": "Posizioni Punti Pivot Motori Z (z_positions):",
        "z-tilt-points": "Punti Sonda Piatto da Verificare (points):",
        "z-tilt-retries": "Tentativi Max (retries):",
        "z-tilt-tolerance": "Tolleranza (retry_tolerance):",
        "qgl-corners": "Angoli Esterni Gantry (gantry_corners):",
        "qgl-points": "4 Punti Sonda da Verificare (points):",
        "qgl-retries": "Tentativi Max (retries):",
        "qgl-tolerance": "Tolleranza (retry_tolerance):",
        "mesh-min": "Coordinate Min (mesh_min):",
        "mesh-max": "Coordinate Max (mesh_max):",
        "mesh-probe-count": "Punti Griglia (probe_count):",
        "mesh-algorithm": "Algoritmo di Interpolazione:",
        "shaper-freq-x": "Frequenza Asse X (shaper_freq_x):",
        "shaper-type-x": "Tipo Filtro X:",
        "shaper-freq-y": "Frequenza Asse Y (shaper_freq_y):",
        "shaper-type-y": "Tipo Filtro Y:",
        "res-accel-chip": "Chip Accelerometro (accel_chip):",
        "res-probe-points": "Punto di Test X, Y, Z (probe_points):",
        "res-accel-per-hz": "Accelerazione per Hz (accel_per_hz):",
        "res-max-smoothing": "Max Smoothing (max_smoothing):",
        "calibration-z-offset": "Altezza Z-Offset (z_offset):",
        "input-moonraker-url": "Indirizzo IP / Host Moonraker:",
        "select-ui-language": "Lingua Interfaccia:",
        "check-enable-idex": "",
        "check-enable-host-temp": "",
        "check-enable-mcu-temp": "",
        "check-invert-dir": "!",
        "check-invert-enable": "!",
        "check-enable-hold-current": "",
        "check-enable-sense-resistor": "",
        "driver-interpolate": "",
        "driver-sensorless-enable": "",
        "extruder-check-enable-hold-current": "",
        "extruder-check-enable-sense-resistor": "",
        "extruder-driver-interpolate": "",
        "check-enable-adxl": "",
        "check-virtual-sd": "",
        "check-pause-resume": "",
        "check-display-status": "",
        "check-respond": "",
        "check-enable-safe-z": "",
        "check-enable-shaper": "",
        "check-enable-resonance-tester": "",
        "check-force-light-mode": ""
}
    };

    // Inizializza tooltips con quelli in lingua se presenti
    if (!window.LOCALE_TOOLTIPS) {
        window.LOCALE_TOOLTIPS = {};
    }
    window.LOCALE_TOOLTIPS['en'] = {
        "select-config-file": {
                "param": "Config File",
                "title": "File di Configurazione Attivo",
                "desc": "Seleziona quale file di configurazione Klipper caricare, visualizzare o modificare da Moonraker.",
                "tip": "Tipicamente printer.cfg"
        },
        "printer-kinematics": {
                "param": "kinematics",
                "title": "Main Kinematics Type",
                "desc": "Defines the mechanical kinematic structure of the printer (Cartesian, CoreXY, CoreXZ, Delta, Hybrid CoreXY, etc.).",
                "tip": "Ender 3: cartesian | Voron: corexy | Delta: delta"
        },
        "printer-max-velocity": {
                "param": "max_velocity",
                "title": "Maximum Velocity",
                "desc": "Maximum toolhead travel speed allowed on the horizontal XY plane.",
                "tip": "Typical: 150 - 300 mm/s (bedslinger), 300 - 600+ mm/s (CoreXY)",
                "unit": "mm/s"
        },
        "printer-max-accel": {
                "param": "max_accel",
                "title": "Maximum Acceleration",
                "desc": "Maximum acceleration permitted for the toolhead.",
                "tip": "Typical: 3000 - 5000 mm/s² (Cartesian), 5000 - 20000+ mm/s² (CoreXY with input shaper)",
                "unit": "mm/s²"
        },
        "printer-cruise-ratio": {
                "param": "minimum_cruise_ratio",
                "title": "Minimum Cruise Ratio",
                "desc": "Minimum fraction of travel distance spent at constant cruise velocity before decelerating. Replaces max_accel_to_decel.",
                "tip": "Default: 0.5 (50%)"
        },
        "printer-square-corner": {
                "param": "square_corner_velocity",
                "title": "Square Corner Velocity",
                "desc": "Maximum velocity at which the toolhead may negotiate a 90° turn without decelerating to zero.",
                "tip": "Typical: 5.0 - 10.0 mm/s",
                "unit": "mm/s"
        },
        "printer-max-z-velocity": {
                "param": "max_z_velocity",
                "title": "Maximum Z Velocity",
                "desc": "Maximum vertical travel speed allowed for the Z axis.",
                "tip": "Lead screws: 10 - 25 mm/s | Belts: 30 - 60 mm/s",
                "unit": "mm/s"
        },
        "printer-max-z-accel": {
                "param": "max_z_accel",
                "title": "Maximum Z Acceleration",
                "desc": "Maximum acceleration applied during Z axis vertical motions and hops.",
                "tip": "Typical: 100 - 350 mm/s²",
                "unit": "mm/s²"
        },
        "printer-max-accel-to-decel": {
                "param": "max_accel_to_decel",
                "title": "Max Accel to Decel (Legacy)",
                "desc": "Parametro deprecato di Klipper per limitare l'accelerazione di transizione. Nei sistemi moderni è consigliato lasciare vuoto e utilizzare minimum_cruise_ratio.",
                "unit": "mm/s²"
        },
        "check-enable-idex": {
                "param": "[dual_carriage]",
                "title": "Abilitazione Cinematica IDEX",
                "desc": "Attiva il supporto per stampanti a doppio carrello indipendente (IDEX), consentendo la gestione separata di due estrusori autonomi che condividono la stessa barra X.",
                "tip": "Genera automaticamente la sezione [dual_carriage] nel config"
        },
        "select-z-motor-count": {
                "param": "[stepper_z*]",
                "title": "Numero di Motori Asse Z",
                "desc": "Specifica quanti motori indipendenti comandano l'asse Z (1, 2, 3 o 4). Permette il livellamento automatico del piatto o gantry tramite Z_TILT_ADJUST (2-3 motori) o QUAD_GANTRY_LEVEL (4 motori).",
                "tip": "Configura schede stepper_z, stepper_z1, stepper_z2, stepper_z3"
        },
        "delta-arm-length": {
                "param": "arm_length",
                "title": "Lunghezza Bracci Delta",
                "desc": "Lunghezza da snodo a snodo dei bracci diagonali su stampanti cinematiche Delta.",
                "unit": "mm"
        },
        "delta-radius": {
                "param": "delta_radius",
                "title": "Raggio Orizzontale Delta",
                "desc": "Raggio del cerchio orizzontale formato dalle torri delta rispetto al centro dell'effettore.",
                "unit": "mm"
        },
        "delta-print-radius": {
                "param": "print_radius",
                "title": "Raggio di Stampa Delta",
                "desc": "Raggio dell'area circolare massima stampabile sul piano di lavoro di una cinematica Delta.",
                "unit": "mm"
        },
        "x-pos-min": {
                "param": "position_min",
                "title": "Minimum Travel Position",
                "desc": "Minimum coordinate reachable on this axis.",
                "unit": "mm"
        },
        "x-pos-max": {
                "param": "position_max",
                "title": "Maximum Travel Position",
                "desc": "Maximum coordinate reachable on this axis (print volume limit).",
                "unit": "mm"
        },
        "x-pos-endstop": {
                "param": "position_endstop",
                "title": "Endstop Trigger Position",
                "desc": "Exact coordinate assigned when endstop is triggered.",
                "unit": "mm"
        },
        "x-homing-speed": {
                "param": "homing_speed",
                "title": "Homing Travel Speed",
                "desc": "Speed at which the axis moves towards endstop during homing.",
                "tip": "Tipicamente 40 - 80 mm/s",
                "unit": "mm/s"
        },
        "x-homing-retract-dist": {
                "param": "homing_retract_dist",
                "title": "Distanza di Arretramento Homing",
                "desc": "Distanza di cui l'asse indietreggia dopo il primo contatto col finecorsa, prima di eseguire il secondo tocco di precisione.",
                "tip": "Tipicamente 3 - 5 mm. Imposta 0 per sensorless homing",
                "unit": "mm"
        },
        "x-homing-retract-speed": {
                "param": "homing_retract_speed",
                "title": "Velocità di Arretramento Homing",
                "desc": "Velocità con cui l'asse si allontana dal finecorsa prima del secondo tocco.",
                "unit": "mm/s"
        },
        "dc-pos-min": {
                "param": "position_min",
                "title": "Minimum Travel Position",
                "desc": "Minimum coordinate reachable on this axis.",
                "unit": "mm"
        },
        "dc-pos-max": {
                "param": "position_max",
                "title": "Maximum Travel Position",
                "desc": "Maximum coordinate reachable on this axis (print volume limit).",
                "unit": "mm"
        },
        "dc-pos-endstop": {
                "param": "position_endstop",
                "title": "Endstop Trigger Position",
                "desc": "Exact coordinate assigned when endstop is triggered.",
                "unit": "mm"
        },
        "dc-homing-speed": {
                "param": "homing_speed",
                "title": "Homing Travel Speed",
                "desc": "Speed at which the axis moves towards endstop during homing.",
                "unit": "mm/s"
        },
        "dc-homing-retract-dist": {
                "param": "homing_retract_dist",
                "title": "Arretramento Homing Carrello X2",
                "desc": "Distanza di arretramento dopo il tocco dell'endstop per il carrello X2.",
                "unit": "mm"
        },
        "dc-homing-retract-speed": {
                "param": "homing_retract_speed",
                "title": "Velocità Arretramento X2",
                "desc": "Velocità di disimpegno dal finecorsa del carrello secondario X2.",
                "unit": "mm/s"
        },
        "y-pos-min": {
                "param": "position_min",
                "title": "Minimum Travel Position",
                "desc": "Minimum coordinate reachable on this axis.",
                "unit": "mm"
        },
        "y-pos-max": {
                "param": "position_max",
                "title": "Maximum Travel Position",
                "desc": "Maximum coordinate reachable on this axis (print volume limit).",
                "unit": "mm"
        },
        "y-pos-endstop": {
                "param": "position_endstop",
                "title": "Endstop Trigger Position",
                "desc": "Exact coordinate assigned when endstop is triggered.",
                "unit": "mm"
        },
        "y-homing-speed": {
                "param": "homing_speed",
                "title": "Homing Travel Speed",
                "desc": "Speed at which the axis moves towards endstop during homing.",
                "unit": "mm/s"
        },
        "y-homing-retract-dist": {
                "param": "homing_retract_dist",
                "title": "Arretramento Homing Asse Y",
                "desc": "Distanza di arretramento dopo il primo tocco del finecorsa su Y.",
                "unit": "mm"
        },
        "y-homing-retract-speed": {
                "param": "homing_retract_speed",
                "title": "Velocità Arretramento Asse Y",
                "desc": "Velocità di arretramento per l'asse Y.",
                "unit": "mm/s"
        },
        "z-pos-min": {
                "param": "position_min",
                "title": "Minimum Travel Position",
                "desc": "Minimum coordinate reachable on this axis.",
                "tip": "Consigliato: -2.0 o -5.0 mm per calibrare Z-Offset",
                "unit": "mm"
        },
        "z-pos-max": {
                "param": "position_max",
                "title": "Maximum Travel Position",
                "desc": "Maximum coordinate reachable on this axis (print volume limit).",
                "unit": "mm"
        },
        "z-pos-endstop": {
                "param": "position_endstop",
                "title": "Endstop Trigger Position",
                "desc": "Exact coordinate assigned when endstop is triggered.",
                "unit": "mm"
        },
        "z-homing-speed": {
                "param": "homing_speed",
                "title": "Homing Travel Speed",
                "desc": "Speed at which the axis moves towards endstop during homing.",
                "tip": "Tipicamente 5 - 15 mm/s per evitare impatti violenti",
                "unit": "mm/s"
        },
        "z-homing-retract-dist": {
                "param": "homing_retract_dist",
                "title": "Arretramento Homing Asse Z",
                "desc": "Distanza di risalita della testina dopo il primo tocco prima del secondo tocco di homing.",
                "tip": "Consigliato: 3 - 5 mm",
                "unit": "mm"
        },
        "z-homing-retract-speed": {
                "param": "homing_retract_speed",
                "title": "Velocità Arretramento Asse Z",
                "desc": "Velocità di risalita tra il primo e il secondo tocco di homing.",
                "unit": "mm/s"
        },
        "mcu-conn-type": {
                "param": "connection_type",
                "title": "Metodo di Collegamento Scheda MCU",
                "desc": "Indica se la scheda principale comunica con l'host tramite porta seriale USB (/dev/serial/by-id/...) o tramite bus di rete CAN Bus a 2 fili.",
                "tip": "USB Seriale per schede madri convenzionali, CAN Bus per toolhead/EBB"
        },
        "mcu-serial": {
                "param": "serial",
                "title": "MCU Serial Path",
                "desc": "Linux USB serial device path (/dev/serial/by-id/...).",
                "tip": "Identificabile via terminale con: ls /dev/serial/by-id/*"
        },
        "mcu-canbus-uuid": {
                "param": "canbus_uuid",
                "title": "CAN Bus UUID",
                "desc": "12-digit hexadecimal unique identifier for CAN board.",
                "tip": "Rilevabile con il comando: python3 ~/klipper/scripts/canbus_query.py can0"
        },
        "mcu-baud": {
                "param": "baud",
                "title": "Baud Rate",
                "desc": "Serial baud rate speed (default 250000).",
                "tip": "Valore standard Klipper: 250000",
                "unit": "baud"
        },
        "mcu-restart-method": {
                "param": "restart_method",
                "title": "Metodo di Reset Hardware MCU",
                "desc": "Algoritmo usato da Klipper per riavviare la scheda microcontrollore quando si invia il comando FIRMWARE_RESTART.",
                "tip": "arduino (DTR), cheetah, command (software), rpi_usb (disalimentazione USB)"
        },
        "check-enable-host-temp": {
                "param": "[temperature_sensor host]",
                "title": "Sensore Temperatura Host / Raspberry Pi",
                "desc": "Abilita il monitoraggio continuo della temperatura della CPU del Raspberry Pi o computer host nella dashboard Mainsail.",
                "tip": "Crea [temperature_sensor raspberry_pi]"
        },
        "check-enable-mcu-temp": {
                "param": "[temperature_sensor mcu]",
                "title": "Sensore Temperatura Chip MCU",
                "desc": "Abilita la lettura del sensore di temperatura interno integrato nel microcontrollore della scheda madre.",
                "tip": "Crea [temperature_sensor mcu]"
        },
        "stepper-step-pin": {
                "param": "step_pin",
                "title": "Step Signal Pin",
                "desc": "Microcontroller pin that pulses step clock cycles to the stepper driver.",
                "tip": "Es. PA0, PE3, PC1"
        },
        "stepper-dir-pin": {
                "param": "dir_pin",
                "title": "Direction Pin",
                "desc": "Pin setting the motor rotation direction. Prepend ! to invert direction.",
                "tip": "Es. PA1 oppure !PA1"
        },
        "check-invert-dir": {
                "param": "! (dir_pin)",
                "title": "Inverti Direzione Motore",
                "desc": "Aggiunge il prefisso punto esclamativo ! al dir_pin per invertire istantaneamente il verso di marcia dell'asse.",
                "tip": "Seleziona se l'asse si allontana dal finecorsa invece di avvicinarsi"
        },
        "stepper-enable-pin": {
                "param": "enable_pin",
                "title": "Enable Pin",
                "desc": "Pin enabling driver power (usually active-low, requiring !).",
                "tip": "Es. !PA2"
        },
        "check-invert-enable": {
                "param": "! (enable_pin)",
                "title": "Inverti Logica Enable",
                "desc": "Abilita o disabilita il prefisso ! sul pin di abilitazione (logica invertita).",
                "tip": "Generalmente attivo (!) per quasi tutti i driver moderni"
        },
        "stepper-microsteps": {
                "param": "microsteps",
                "title": "Microstep Resolution",
                "desc": "Microstepping multiplier set inside the driver for smooth motion.",
                "tip": "Recommended: 16 or 32"
        },
        "stepper-steps-rotation": {
                "param": "full_steps_per_rotation",
                "title": "Passi Nativi del Motore per Giro Completo",
                "desc": "Numero di passi fisici completi per una rotazione di 360° dell'albero motore: 200 per motori convenzionali con angolo di 1.8°, 400 per motori ad alta precisione con angolo di 0.9°.",
                "tip": "1.8° = 200 passi | 0.9° = 400 passi"
        },
        "stepper-rotation-distance": {
                "param": "rotation_distance",
                "title": "Rotation Distance",
                "desc": "Linear distance (in mm) traveled by the axis for one full 360° turn of the stepper motor.",
                "tip": "GT2 20T: 40.0 | Lead screw T8x8: 8.0",
                "unit": "mm"
        },
        "stepper-endstop-pin": {
                "param": "endstop_pin",
                "title": "Pin del Finecorsa (Endstop Pin)",
                "desc": "Pin digitale a cui è collegato lo switch di finecorsa per questo asse. Anteporre ^ se lo switch richiede pull-up interno, oppure tmc2209_stepper_x:virtual_endstop per sensorless.",
                "tip": "Es. ^PA3 oppure tmc2209_stepper_x:virtual_endstop"
        },
        "driver-model-select": {
                "param": "Driver IC",
                "title": "Modello Chip Driver",
                "desc": "Seleziona il circuito integrato del driver installato: TMC2209, TMC2208, TMC2240, TMC5160, TMC2130 o Standalone (A4988, DRV8825). Definisce la sezione nel config.",
                "tip": "TMC2209 è il più comune per rapporto silenziosità/affidabilità"
        },
        "driver-conn-type-select": {
                "param": "Bus Protocol",
                "title": "Tipo di Connessione Driver",
                "desc": "Metodo con cui il microcontrollore comunica con il chip TMC: UART (filo singolo bidirezionale), SPI (bus seriale ad alta velocità a 4 fili) o Standalone (nessuna configurazione digitale).",
                "tip": "UART per TMC2209/TMC2208 | SPI per TMC5160/TMC2130"
        },
        "driver-uart-pin": {
                "param": "uart_pin",
                "title": "UART Pin",
                "desc": "MCU digital serial pin configuring TMC driver registers.",
                "tip": "Es. PC11, PD5, etc."
        },
        "driver-tx-pin": {
                "param": "tx_pin",
                "title": "Pin TX UART (Opzionale)",
                "desc": "Pin di trasmissione dedicato se la scheda madre usa linee separate per invio e ricezione UART verso i driver.",
                "tip": "Lasciare vuoto se la scheda usa filo singolo UART con resistenza"
        },
        "driver-uart-address": {
                "param": "uart_address",
                "title": "Indirizzo Hardware UART",
                "desc": "Indirizzo univoco (da 0 a 3) assegnato al driver TMC quando più driver condividono lo stesso identico pin UART (es. schede MKS Robin o BTT E3).",
                "tip": "Tipicamente 0 per X, 1 per Y, 2 per Z, 3 per E0 su schede a bus condiviso"
        },
        "driver-cs-pin": {
                "param": "cs_pin",
                "title": "Pin Chip Select (CS) SPI",
                "desc": "Pin digitale che attiva la comunicazione con questo specifico driver durante le transazioni sul bus dati SPI.",
                "tip": "Es. PD11, PB12"
        },
        "driver-spi-mode": {
                "param": "spi_mode",
                "title": "Modalità Bus SPI",
                "desc": "Sceglie se appoggiarsi a un controller SPI hardware integrato nel chip MCU oppure emulare il bus SPI via bit-banging software su pin generici.",
                "tip": "Hardware SPI per massima velocità e minor carico CPU"
        },
        "driver-spi-bus": {
                "param": "spi_bus",
                "title": "Nome Bus SPI Hardware",
                "desc": "Identificativo del controller SPI hardware della scheda madre (es. spi1, spi2, spi3a, spi4).",
                "tip": "Consultare il pinout ufficiale della propria scheda madre"
        },
        "driver-spi-sclk": {
                "param": "spi_software_sclk_pin",
                "title": "Pin Clock SPI Software",
                "desc": "Pin digitale adibito al segnale di sincronizzazione di clock (SCK/SCLK) per SPI software.",
                "tip": "Es. PA5, PB13"
        },
        "driver-spi-mosi": {
                "param": "spi_software_mosi_pin",
                "title": "Pin MOSI SPI Software",
                "desc": "Pin Master Out Slave In per l'invio dei comandi di configurazione al driver.",
                "tip": "Es. PA7, PB15"
        },
        "driver-spi-miso": {
                "param": "spi_software_miso_pin",
                "title": "Pin MISO SPI Software",
                "desc": "Pin Master In Slave Out per la lettura dei registri di stato e diagnostica dal driver.",
                "tip": "Es. PA6, PB14"
        },
        "driver-run-current": {
                "param": "run_current",
                "title": "Operating Run Current",
                "desc": "RMS current supplied to the stepper motor windings during movement.",
                "tip": "NEMA17 standard: 0.65 - 0.85A | High-torque: 1.0 - 1.4A",
                "unit": "A"
        },
        "driver-stealthchop": {
                "param": "stealthchop_threshold",
                "title": "StealthChop Mode",
                "desc": "Enables ultra-quiet StealthChop mode. Disable (0) for high-speed SpreadCycle power.",
                "tip": "Abilitato (999999) per silenzio | Disabilitato (0) per massima coppia e velocità"
        },
        "check-enable-hold-current": {
                "param": "hold_current (checkbox)",
                "title": "Abilita Corrente di Mantenimento",
                "desc": "Permette di ridurre la corrente quando il motore è fermo. Sconsigliato con TMC2209 e sensorless homing poiché la commutazione improvvisa può causare salti di microstep.",
                "tip": "Spesso lasciata disabilitata per massima stabilità"
        },
        "driver-hold-current": {
                "param": "hold_current",
                "title": "Hold Current",
                "desc": "Current supplied when motor is standing still in stationary position.",
                "tip": "Tipicamente 60-70% della run_current se abilitata",
                "unit": "A"
        },
        "check-enable-sense-resistor": {
                "param": "sense_resistor (checkbox)",
                "title": "Specifica Resistenza di Sense",
                "desc": "Permette di impostare manualmente il valore esatto della resistenza shunt di campionamento corrente saldata sul modulo driver.",
                "tip": "Necessario se diverso dal valore di fabbrica (0.110 ohm)"
        },
        "driver-sense-resistor": {
                "param": "sense_resistor",
                "title": "Current Sense Resistor",
                "desc": "Value of the shunt resistor on the driver module to measure current.",
                "tip": "TMC2209: 0.110 ohm",
                "unit": "Ω"
        },
        "driver-interpolate": {
                "param": "interpolate",
                "title": "256 Microstep Interpolation",
                "desc": "Driver automatically interpolates microsteps to 256 internal microsteps.",
                "tip": "Consigliato: True per TMC2209/TMC2208"
        },
        "driver-sensorless-enable": {
                "param": "virtual_endstop (Sensorless)",
                "title": "Homing Senza Finecorsa Fisico (Sensorless)",
                "desc": "Utilizza la tecnologia StallGuard del chip TMC per rilevare l'impatto meccanico a fine corsa attraverso il monitoraggio della contro-forza elettromotrice (back-EMF).",
                "tip": "Elimina i cavi e gli interruttori fisici di finecorsa su X e Y"
        },
        "driver-diag-pin": {
                "param": "diag_pin",
                "title": "StallGuard Diag Pin",
                "desc": "Pin signaling mechanical stall for sensorless homing.",
                "tip": "Richiede spesso il pull-up interno (^)"
        },
        "driver-sgthrs": {
                "param": "driver_SGTHRS / driver_SGT",
                "title": "StallGuard Sensitivity",
                "desc": "Collision sensitivity for sensorless homing. TMC2209: 0 to 255 (typical 60 - 120).",
                "tip": "TMC2209: iniziare da 100 e regolare a passi di 5 (tipico: 60 - 120)"
        },
        "extruder-step-pin": {
                "param": "step_pin",
                "title": "Step Signal Pin",
                "desc": "Microcontroller pin that pulses step clock cycles to the stepper driver.",
                "tip": "Es. PB4, PD6"
        },
        "extruder-dir-pin": {
                "param": "dir_pin",
                "title": "Direction Pin",
                "desc": "Pin setting the motor rotation direction. Prepend ! to invert direction.",
                "tip": "Es. PB3 o !PB3"
        },
        "extruder-enable-pin": {
                "param": "enable_pin",
                "title": "Enable Pin",
                "desc": "Pin enabling driver power (usually active-low, requiring !).",
                "tip": "Es. !PB5"
        },
        "extruder-rot-dist": {
                "param": "rotation_distance",
                "title": "Rotation Distance",
                "desc": "Linear distance (in mm) traveled by the axis for one full 360° turn of the stepper motor.",
                "tip": "GT2 20T: 40.0 | Lead screw T8x8: 8.0",
                "unit": "mm"
        },
        "extruder-gear-ratio": {
                "param": "gear_ratio",
                "title": "Rapporto di Riduzione Ingranaggi",
                "desc": "Rapporto di trasmissione meccanico tra pignone motore e ingranaggi di trascinamento dell'estrusore.",
                "tip": "BMG: 50:17 | Clockwork 1/2: 50:10 | Orbiter 2.0: 7.5:1 | Azionamento diretto: lascia vuoto"
        },
        "extruder-nozzle-dia": {
                "param": "nozzle_diameter",
                "title": "Nozzle Orifice Diameter",
                "desc": "Hole diameter of the installed nozzle on the hotend.",
                "tip": "Standard: 0.40 mm",
                "unit": "mm"
        },
        "extruder-filament-dia": {
                "param": "filament_diameter",
                "title": "Filament Diameter",
                "desc": "Nominal diameter of the thermoplastic filament (1.75 mm or 2.85 mm).",
                "tip": "Standard: 1.75 mm (o 2.85 mm per sistemi speciali)",
                "unit": "mm"
        },
        "extruder-pressure-advance": {
                "param": "pressure_advance",
                "title": "Pressure Advance",
                "desc": "Active compensation for filament elasticity and nozzle chamber pressure during acceleration.",
                "tip": "Direct Drive: 0.02 - 0.06 | Bowden: 0.3 - 0.8"
        },
        "extruder-sensor-type": {
                "param": "sensor_type",
                "title": "Temperature Sensor Model",
                "desc": "Exact model of thermistor, thermocouple or RTD probe.",
                "tip": "Impostare il modello corretto per evitare scarti di temperatura pericolosi"
        },
        "extruder-heater-pin": {
                "param": "heater_pin",
                "title": "Heater Cartridge Pin",
                "desc": "MCU MOSFET pin driving heater PWM power.",
                "tip": "Es. PA2, PB10"
        },
        "extruder-sensor-pin": {
                "param": "sensor_pin",
                "title": "Sensor ADC Pin",
                "desc": "Microcontroller analog ADC pin reading temperature.",
                "tip": "Es. PC4, PA1"
        },
        "extruder-min-temp": {
                "param": "min_temp",
                "title": "Thermal Safety Minimum",
                "desc": "Minimum allowed temperature (°C). Triggers shutdown if disconnected.",
                "tip": "Tipicamente 0°C o -10°C",
                "unit": "°C"
        },
        "extruder-max-temp": {
                "param": "max_temp",
                "title": "Thermal Safety Maximum",
                "desc": "Maximum allowed temperature before emergency thermal shutdown.",
                "tip": "Gola in PTFE: max 250°C | All-Metal: 280 - 300°C | Hotend per tecnopolimeri: 350 - 500°C",
                "unit": "°C"
        },
        "extruder-min-extrude": {
                "param": "min_extrude_temp",
                "title": "Minimum Extrude Temperature",
                "desc": "Safety threshold preventing cold extrusion commands.",
                "tip": "Standard: 170°C",
                "unit": "°C"
        },
        "extruder-control-type": {
                "param": "control",
                "title": "Thermal Control Algorithm",
                "desc": "PID (Proportional Integral Derivative) or Watermark hysteresis.",
                "tip": "Usa sempre PID per l'hotend per stabilità termica millimetrica"
        },
        "extruder-pid-kp": {
                "param": "pid_Kp",
                "title": "PID Proportional Gain",
                "desc": "Calibrated using PID_CALIBRATE command.",
                "tip": "Calcolato tramite autotune PID"
        },
        "extruder-pid-ki": {
                "param": "pid_Ki",
                "title": "PID Integral Gain",
                "desc": "Corrects accumulated thermal drift.",
                "tip": "Calcolato tramite autotune PID"
        },
        "extruder-pid-kd": {
                "param": "pid_Kd",
                "title": "PID Derivative Gain",
                "desc": "Damps rapid temperature fluctuations.",
                "tip": "Calcolato tramite autotune PID"
        },
        "extruder-max-delta": {
                "param": "max_delta",
                "title": "Tolleranza Isteresi Watermark",
                "desc": "Finestra di isteresi termica ammessa attorno al target quando si impiega l'algoritmo watermark.",
                "unit": "°C"
        },
        "extruder-rtd-nominal-r": {
                "param": "rtd_nominal_r",
                "title": "Resistenza Nominale Sonda RTD a 0°C",
                "desc": "Resistenza elettrica della sonda termoresistiva al platino a zero gradi Celsius: 100 per sonde PT100, 1000 per sonde PT1000.",
                "tip": "PT100: 100 | PT1000: 1000",
                "unit": "Ω"
        },
        "extruder-rtd-reference-r": {
                "param": "rtd_reference_r",
                "title": "Resistenza di Riferimento Modulo RTD",
                "desc": "Valore della resistenza campione saldata sul circuito integrato MAX31865 (solitamente 430 ohm per PT100, 4300 ohm per PT1000).",
                "tip": "Modulo per PT100: 430 | Modulo per PT1000: 4300",
                "unit": "Ω"
        },
        "extruder-rtd-num-wires": {
                "param": "rtd_num_of_wires",
                "title": "Numero di Conduttori Sonda RTD",
                "desc": "Configurazione fisica del cablaggio della termoresistenza (2, 3 o 4 fili). Le configurazioni a 3 o 4 fili compensano la resistenza interna dei cavi per massima accuratezza.",
                "tip": "2 fili (economico), 4 fili (massima precisione industriale)"
        },
        "extruder-rtd-filter": {
                "param": "rtd_use_50Hz_filter",
                "title": "Filtro Antidisturbo Rete Elettrica",
                "desc": "Seleziona il filtro notch a 50Hz (standard europeo/italiano a 230V) o 60Hz per abbattere i disturbi indotti dalla rete elettrica sulle letture della sonda.",
                "tip": "Usa 50Hz in Italia ed Europa"
        },
        "bed-sensor-type": {
                "param": "sensor_type",
                "title": "Temperature Sensor Model",
                "desc": "Exact model of thermistor, thermocouple or RTD probe.",
                "tip": "Tipicamente Generic 3950 o EPCOS 100K B57560G104F"
        },
        "bed-heater-pin": {
                "param": "heater_pin",
                "title": "Heater Cartridge Pin",
                "desc": "MCU MOSFET pin driving heater PWM power.",
                "tip": "Es. PA1, PC9"
        },
        "bed-sensor-pin": {
                "param": "sensor_pin",
                "title": "Sensor ADC Pin",
                "desc": "Microcontroller analog ADC pin reading temperature.",
                "tip": "Es. PC3, PA0"
        },
        "bed-min-temp": {
                "param": "min_temp",
                "title": "Thermal Safety Minimum",
                "desc": "Minimum allowed temperature (°C). Triggers shutdown if disconnected.",
                "tip": "Tipicamente 0°C",
                "unit": "°C"
        },
        "bed-max-temp": {
                "param": "max_temp",
                "title": "Thermal Safety Maximum",
                "desc": "Maximum allowed temperature before emergency thermal shutdown.",
                "unit": "°C"
        },
        "bed-control-type": {
                "param": "control",
                "title": "Thermal Control Algorithm",
                "desc": "PID (Proportional Integral Derivative) or Watermark hysteresis.",
                "tip": "Piatto 24V DC: pid | Piatto 230V AC con SSR: watermark o pid"
        },
        "bed-pid-kp": {
                "param": "pid_Kp",
                "title": "PID Proportional Gain",
                "desc": "Calibrated using PID_CALIBRATE command."
        },
        "bed-pid-ki": {
                "param": "pid_Ki",
                "title": "PID Integral Gain",
                "desc": "Corrects accumulated thermal drift."
        },
        "bed-pid-kd": {
                "param": "pid_Kd",
                "title": "PID Derivative Gain",
                "desc": "Damps rapid temperature fluctuations."
        },
        "bed-max-delta": {
                "param": "max_delta",
                "title": "Tolleranza Isteresi Watermark Piatto",
                "desc": "Scarto ammesso attorno alla temperatura impostata con algoritmo watermark (es. 1.0 - 2.0°C).",
                "unit": "°C"
        },
        "probe-type-select": {
                "param": "Probe Type",
                "title": "Tipologia Sonda di Livellamento",
                "desc": "Tipo di sensore impiegato per mappare la planarità del piatto: BLTouch / 3DTouch, microswitch meccanico (Klicky/Voron Tap), sensore induttivo (Omron/SuperPinda), Beacon o sonda a correnti parassite BTT Eddy.",
                "tip": "Imposta la sezione corretta ([probe], [bltouch], ecc.)"
        },
        "probe-sensor-pin": {
                "param": "sensor_pin",
                "title": "Sensor ADC Pin",
                "desc": "Microcontroller analog ADC pin reading temperature.",
                "tip": "Es. ^PC14, ^PA0"
        },
        "probe-control-pin": {
                "param": "control_pin",
                "title": "Pin di Controllo Servocomando (BLTouch)",
                "desc": "Pin PWM che comanda l'estrazione e la ritrazione dello spillo per sensori BLTouch e cloni.",
                "tip": "Es. PA8, PB0"
        },
        "probe-x-offset": {
                "param": "x_offset",
                "title": "Distanza X Sonda-Ugello",
                "desc": "Distanza orizzontale in millimetri tra l'ugello e il punto di contatto della sonda lungo l'asse X. Positiva se la sonda è a destra dell'ugello, negativa se è a sinistra.",
                "tip": "0.0 se la sonda è coassiale all'ugello (es. Voron Tap o Eddy su ugello)",
                "unit": "mm"
        },
        "probe-y-offset": {
                "param": "y_offset",
                "title": "Distanza Y Sonda-Ugello",
                "desc": "Distanza orizzontale in millimetri tra l'ugello e la sonda lungo l'asse Y. Positiva se la sonda è dietro l'ugello, negativa se è davanti.",
                "unit": "mm"
        },
        "probe-z-offset": {
                "param": "z_offset",
                "title": "Probe Z-Offset",
                "desc": "Vertical distance between nozzle tip and probe trigger point.",
                "tip": "Maggiore è il valore, più l'ugello scende vicino al piatto",
                "unit": "mm"
        },
        "probe-samples": {
                "param": "samples",
                "title": "Campionamenti per Singolo Punto",
                "desc": "Numero di letture consecutive effettuate per ogni punto della griglia per eliminare rumore e letture anomale.",
                "tip": "Consigliato: 2 o 3 letture per punto"
        },
        "probe-samples-result": {
                "param": "samples_result",
                "title": "Metodo di Aggregazione Campioni",
                "desc": "Come combinare i campioni rilevati sullo stesso punto: median (valore mediano, più robusto contro anomalie) o average (media aritmetica).",
                "tip": "Consigliato: median"
        },
        "check-enable-safe-z": {
                "param": "[safe_z_home]",
                "title": "Abilita Safe Z Home",
                "desc": "Esegue l'azzeramento dell'asse Z al centro del piatto anziché agli angoli, prevenendo impatti se si usa una sonda montata sulla testina.",
                "tip": "Obbligatorio quando si usa una sonda (BLTouch/Tap) come endstop Z"
        },
        "safe-z-pos": {
                "param": "home_xy_position",
                "title": "Coordinate Centro Homing Z",
                "desc": "Coordinate X, Y a cui spostare la testina prima di far scendere la sonda per l'homing Z (tipicamente il centro del piatto).",
                "tip": "Es. 150, 150 per piatto 300x300"
        },
        "safe-z-hop": {
                "param": "z_hop",
                "title": "Altezza di Sicurezza Z-Hop",
                "desc": "Distanza di sollevamento preventivo dell'asse Z prima e dopo l'homing per evitare di strisciare l'ugello o la sonda sul piatto.",
                "tip": "Consigliato: 5 - 10 mm",
                "unit": "mm"
        },
        "safe-z-speed": {
                "param": "speed",
                "title": "Velocità di Spostamento Safe Z",
                "desc": "Velocità di traslazione della testina verso le coordinate di homing Z sicuro.",
                "tip": "Consigliato: 50 - 100 mm/s",
                "unit": "mm/s"
        },
        "mesh-min": {
                "param": "mesh_min",
                "title": "Bed Mesh Minimum",
                "desc": "Minimum X,Y probe coordinates for heightmap leveling.",
                "tip": "Es. 25, 25"
        },
        "mesh-max": {
                "param": "mesh_max",
                "title": "Bed Mesh Maximum",
                "desc": "Maximum X,Y probe coordinates for heightmap leveling.",
                "tip": "Es. 275, 275"
        },
        "mesh-probe-count": {
                "param": "probe_count",
                "title": "Mesh Grid Resolution",
                "desc": "Number of sample points along X and Y (e.g. 5,5 or 7,7).",
                "tip": "Es. 5,5 (25 punti) o 7,7 (49 punti per piatti ampi)"
        },
        "mesh-algorithm": {
                "param": "algorithm",
                "title": "Algoritmo di Interpolazione Mesh",
                "desc": "Algoritmo matematico per calcolare le quote tra i punti tastati: bicubic (consigliato per griglie dense 5x5 o superiori) o lagrange (solo per griglie piccole 3x3).",
                "tip": "Consigliato: bicubic"
        },
        "z-tilt-positions": {
                "param": "z_positions",
                "title": "Punti Pivot Motori Z (z_positions)",
                "desc": "Coordinate fisiche (X, Y) dei fulcri o viti dei motori Z indipendenti per allineare il piatto con Z_TILT_ADJUST.",
                "tip": "Una coppia X, Y per ogni motore Z"
        },
        "z-tilt-points": {
                "param": "points",
                "title": "Punti di Tastatura Z-Tilt",
                "desc": "Coordinate sul piatto dove la sonda misurerà l'inclinazione per calcolare i passi correttivi di ciascun motore Z."
        },
        "z-tilt-retries": {
                "param": "retries",
                "title": "Tentativi Massimi Z-Tilt",
                "desc": "Numero massimo di cicli di misurazione consentiti per raggiungere la planarità desiderata.",
                "tip": "Tipicamente 5 - 10 tentativi"
        },
        "z-tilt-tolerance": {
                "param": "retry_tolerance",
                "title": "Tolleranza Livellamento Z-Tilt",
                "desc": "Scarto massimo tollerato tra i punti Z (in mm) per considerare il piatto perfettamente livellato.",
                "tip": "Consigliato: 0.0075 - 0.02 mm",
                "unit": "mm"
        },
        "qgl-corners": {
                "param": "gantry_corners",
                "title": "Coordinate Angoli Gantry (Voron QGL)",
                "desc": "Coordinate fisiche dei 4 angoli del carrello sospeso su stampanti tipo Voron 2.4 con Quad Gantry Level."
        },
        "qgl-points": {
                "param": "points",
                "title": "4 Punti di Tastatura QGL",
                "desc": "Coordinate dei 4 punti da sondare sul piatto per calcolare la correzione indipendente dei 4 motori Z."
        },
        "qgl-retries": {
                "param": "retries",
                "title": "Tentativi Massimi QGL",
                "desc": "Numero massimo di cicli prima di considerare fallito il livellamento a 4 motori.",
                "tip": "Tipicamente 5 - 10"
        },
        "qgl-tolerance": {
                "param": "retry_tolerance",
                "title": "Tolleranza Quad Gantry Level",
                "desc": "Differenza massima accettabile tra i 4 angoli per completare la procedura.",
                "tip": "Consigliato: 0.0075 - 0.01 mm",
                "unit": "mm"
        },
        "fan-part-pin": {
                "param": "pin ([fan])",
                "title": "Pin Ventola Raffreddamento Pezzo",
                "desc": "Pin PWM collegato alla ventola del layer che raffredda il filamento estruso sul pezzo, comandabile via G-Code M106.",
                "tip": "Es. PA8, PC6"
        },
        "fan-part-kick": {
                "param": "kick_start_time",
                "title": "Tempo Spunto Iniziale Ventola",
                "desc": "Durata dell'impulso al 100% di potenza (in secondi) erogato all'avvio per vincere l'inerzia iniziale delle ventole.",
                "tip": "Consigliato: 0.100 - 0.500 s",
                "unit": "s"
        },
        "fan-part-off-below": {
                "param": "off_below",
                "title": "Soglia Minima Spegnimento Ventola",
                "desc": "Velocità minima al di sotto della quale la ventola non riceve alimentazione per evitare ronzii senza rotazione.",
                "tip": "Tipicamente 0.10 (10%)"
        },
        "check-enable-shaper": {
                "param": "[input_shaper]",
                "title": "Abilitazione Filtro Input Shaper",
                "desc": "Attiva la compensazione attiva delle vibrazioni e risonanze meccaniche, eliminando l'effetto eco (ghosting/ringing) sulle superfici verticali ad alte velocità.",
                "tip": "Migliora drasticamente la finitura superficiale"
        },
        "shaper-freq-x": {
                "param": "shaper_freq_x",
                "title": "X Resonance Frequency",
                "desc": "Natural vibration resonance frequency of X axis in Hz.",
                "tip": "Tipicamente tra 35 e 85 Hz",
                "unit": "Hz"
        },
        "shaper-type-x": {
                "param": "shaper_type_x",
                "title": "X Shaper Filter Type",
                "desc": "Vibration damping algorithm (e.g. MZV, EI, ZV).",
                "tip": "MZV ed EI sono tra i più diffusi ed equilibrati"
        },
        "shaper-freq-y": {
                "param": "shaper_freq_y",
                "title": "Y Resonance Frequency",
                "desc": "Natural vibration resonance frequency of Y axis in Hz.",
                "unit": "Hz"
        },
        "shaper-type-y": {
                "param": "shaper_type_y",
                "title": "Y Shaper Filter Type",
                "desc": "Vibration damping algorithm for Y axis.",
                "tip": "MZV o EI consigliati"
        },
        "check-enable-adxl": {
                "param": "[adxl345]",
                "title": "Abilitazione Accelerometro ADXL345",
                "desc": "Configura il chip accelerometro digitale SPI per la misurazione automatica in tempo reale delle risonanze meccaniche con il comando TEST_RESONANCES.",
                "tip": "Collegabile a scheda host, toolhead board o Raspberry Pi"
        },
        "adxl-cs-pin": {
                "param": "cs_pin",
                "title": "Pin Chip Select ADXL345",
                "desc": "Pin digitale per selezionare l'accelerometro sul bus SPI.",
                "tip": "Es. rpi:None o gpio pin su toolhead"
        },
        "adxl-spi-bus": {
                "param": "spi_bus",
                "title": "Bus SPI Accelerometro",
                "desc": "Nome del bus SPI hardware utilizzato per leggere i dati dall'accelerometro (es. spidev0.0, spi1)."
        },
        "adxl-axes-map": {
                "param": "axes_map",
                "title": "Orientamento Assi Accelerometro",
                "desc": "Mappatura degli assi fisici del chip rispetto agli assi di movimento della stampante.",
                "tip": "Default: x,y,z (invertibile es. -x,z,y se montato verticalmente)"
        },
        "adxl-rate": {
                "param": "rate",
                "title": "Campionamento ADXL345",
                "desc": "Frequenza di acquisizione dati dell'accelerometro (da 1600 Hz a 3200 Hz).",
                "tip": "Valore standard Klipper: 3200",
                "unit": "Hz"
        },
        "res-accel-chip": {
                "param": "accel_chip",
                "title": "Chip Accelerometro di Riferimento",
                "desc": "Nome della sezione accelerometro usata dal resonance tester (es. adxl345)."
        },
        "res-probe-points": {
                "param": "probe_points",
                "title": "Coordinate Test di Risonanza",
                "desc": "Coordinate X, Y, Z dove posizionare la testina durante la vibrazione di test.",
                "tip": "Es. 150, 150, 20 (centro del piatto)"
        },
        "res-accel-per-hz": {
                "param": "accel_per_hz",
                "title": "Accelerazione per Hertz",
                "desc": "Fattore di accelerazione applicato per ciascun Hz durante lo sweep delle frequenze.",
                "tip": "Default standard Klipper: 75"
        },
        "res-max-smoothing": {
                "param": "max_smoothing",
                "title": "Livellamento Massimo Tollerato",
                "desc": "Massimo fattore di smoothing accettabile durante il calcolo automatico dello shaper ottimale."
        },
        "input-moonraker-url": {
                "param": "Moonraker Base URL",
                "title": "Indirizzo Istanza Moonraker",
                "desc": "Indirizzo IP o hostname con porta del server Moonraker che controlla Klipper (es. http://192.168.1.50:7125). Lasciare vuoto per autorilevamento sulla stessa macchina.",
                "tip": "Default: origine corrente (stesso host di Mainsail)"
        },
        "check-force-light-mode": {
                "param": "UI Theme Mode",
                "title": "Forza Modalità Chiara",
                "desc": "Forza l'interfaccia grafica in tema chiaro invece di sincronizzare il tema scuro da Mainsail.",
                "tip": "Consigliato non attivo per abbinamento perfetto a Mainsail"
        },
        "check-virtual-sd": {
                "param": "[virtual_sdcard]",
                "title": "Abilitazione Virtual SD Card",
                "desc": "Permette a Klipper di eseguire direttamente i file G-Code caricati su Moonraker o Mainsail nel disco locale.",
                "tip": "Indispensabile per il funzionamento di Mainsail e Moonraker"
        },
        "check-pause-resume": {
                "param": "[pause_resume]",
                "title": "Abilitazione Pausa e Ripresa",
                "desc": "Abilita il supporto ai comandi PAUSE e RESUME nativi di Klipper, necessari per cambi filamento e pause di emergenza.",
                "tip": "Raccomandato attivo in ogni stampante"
        },
        "check-display-status": {
                "param": "[display_status]",
                "title": "Stato di Avanzamento Stampa",
                "desc": "Fornisce lo stato di avanzamento percentuale e messaggi di stato alla web interface e agli schermi.",
                "tip": "Raccomandato attivo"
        },
        "check-respond": {
                "param": "[respond]",
                "title": "Comando Risposta Console (M118)",
                "desc": "Permette ai comandi M118 e RESPOND di scrivere messaggi informativi nella console interattiva di Mainsail.",
                "tip": "Utile per script e macro avanzate"
        },
        "idle-timeout": {
                "param": "timeout ([idle_timeout])",
                "title": "Tempo di Timeout Inattività",
                "desc": "Secondi di inattività trascorsi i quali Klipper disattiva automaticamente motori e riscaldatori per sicurezza energetica e termica.",
                "tip": "Default: 600 secondi (10 minuti)",
                "unit": "s"
        }
};
    window.LOCALE_TOOLTIPS['it'] = {
        "select-config-file": {
                "param": "Config File",
                "title": "File di Configurazione Attivo",
                "desc": "Seleziona quale file di configurazione Klipper caricare, visualizzare o modificare da Moonraker.",
                "tip": "Tipicamente printer.cfg"
        },
        "printer-kinematics": {
                "param": "kinematics",
                "title": "Tipo di Cinematica Principale",
                "desc": "Definisce la struttura meccanica della stampante (Cartesiana, CoreXY, CoreXZ, Delta, Hybrid CoreXY / IDEX, ecc.). Determina la matematica di conversione delle coordinate G-Code nei passi dei singoli motori.",
                "tip": "Ender 3/Prusa: cartesian | Voron 2.4/Trident/Bambu: corexy | Delta: delta"
        },
        "printer-max-velocity": {
                "param": "max_velocity",
                "title": "Velocità Massima Assi X/Y",
                "desc": "Massima velocità di spostamento dell'utensile consentita sul piano orizzontale.",
                "unit": "mm/s",
                "tip": "Valori tipici: 150 - 300 mm/s (stampanti standard), 300 - 600+ mm/s (CoreXY ad alte prestazioni)"
        },
        "printer-max-accel": {
                "param": "max_accel",
                "title": "Accelerazione Massima",
                "desc": "Massima accelerazione consentita per la testina di stampa. Un valore adeguato riduce i tempi di stampa senza causare perdita di passi o vibrazioni eccessive.",
                "unit": "mm/s²",
                "tip": "Valori tipici: 3000 - 5000 mm/s² (stampanti cartesiane), 5000 - 20000+ mm/s² (CoreXY con input shaper)"
        },
        "printer-cruise-ratio": {
                "param": "minimum_cruise_ratio",
                "title": "Rapporto Minimo di Crociera",
                "desc": "Frazione minima della distanza di un movimento trascorsa a velocità costante di crociera, prima di decelerare. Ha sostituito il vecchio max_accel_to_decel nelle versioni recenti di Klipper.",
                "tip": "Valore predefinito: 0.5 (50% di crociera)"
        },
        "printer-square-corner": {
                "param": "square_corner_velocity",
                "title": "Square Corner Velocity",
                "desc": "Velocità massima a cui l'utensile può percorrere un angolo retto (90°) senza decelerare completamente a zero. Valori più alti aumentano la velocità ma possono generare ringing negli spigoli.",
                "unit": "mm/s",
                "tip": "Valori tipici: 5.0 mm/s (conservativo/dettagliato) fino a 8.0 - 10.0 mm/s (veloce)"
        },
        "printer-max-z-velocity": {
                "param": "max_z_velocity",
                "title": "Velocità Massima Asse Z",
                "desc": "Massima velocità di traslazione verticale consentita sull'asse Z. Limita la rotazione delle barre filettate o cinghie Z.",
                "unit": "mm/s",
                "tip": "Valori tipici: 10 - 25 mm/s per viti trapezoidali T8; 30 - 60 mm/s per Z guidati da cinghie"
        },
        "printer-max-z-accel": {
                "param": "max_z_accel",
                "title": "Accelerazione Massima Asse Z",
                "desc": "Massima accelerazione applicata durante i movimenti verticali dell'asse Z (incluso z-hop durante le ritrazioni).",
                "unit": "mm/s²",
                "tip": "Valori tipici: 100 - 350 mm/s²"
        },
        "printer-max-accel-to-decel": {
                "param": "max_accel_to_decel",
                "title": "Max Accel to Decel (Legacy)",
                "desc": "Parametro deprecato di Klipper per limitare l'accelerazione di transizione. Nei sistemi moderni è consigliato lasciare vuoto e utilizzare minimum_cruise_ratio.",
                "unit": "mm/s²"
        },
        "check-enable-idex": {
                "param": "[dual_carriage]",
                "title": "Abilitazione Cinematica IDEX",
                "desc": "Attiva il supporto per stampanti a doppio carrello indipendente (IDEX), consentendo la gestione separata di due estrusori autonomi che condividono la stessa barra X.",
                "tip": "Genera automaticamente la sezione [dual_carriage] nel config"
        },
        "select-z-motor-count": {
                "param": "[stepper_z*]",
                "title": "Numero di Motori Asse Z",
                "desc": "Specifica quanti motori indipendenti comandano l'asse Z (1, 2, 3 o 4). Permette il livellamento automatico del piatto o gantry tramite Z_TILT_ADJUST (2-3 motori) o QUAD_GANTRY_LEVEL (4 motori).",
                "tip": "Configura schede stepper_z, stepper_z1, stepper_z2, stepper_z3"
        },
        "delta-arm-length": {
                "param": "arm_length",
                "title": "Lunghezza Bracci Delta",
                "desc": "Lunghezza da snodo a snodo dei bracci diagonali su stampanti cinematiche Delta.",
                "unit": "mm"
        },
        "delta-radius": {
                "param": "delta_radius",
                "title": "Raggio Orizzontale Delta",
                "desc": "Raggio del cerchio orizzontale formato dalle torri delta rispetto al centro dell'effettore.",
                "unit": "mm"
        },
        "delta-print-radius": {
                "param": "print_radius",
                "title": "Raggio di Stampa Delta",
                "desc": "Raggio dell'area circolare massima stampabile sul piano di lavoro di una cinematica Delta.",
                "unit": "mm"
        },
        "x-pos-min": {
                "param": "position_min",
                "title": "Posizione Minima Asse X",
                "desc": "Coordinata minima raggiungibile dall'asse X. Spesso 0 o un valore negativo se il finecorsa o la posizione di parcheggio si trovano oltre il bordo del piatto.",
                "unit": "mm"
        },
        "x-pos-max": {
                "param": "position_max",
                "title": "Posizione Massima Asse X",
                "desc": "Coordinata massima raggiungibile dall'asse X. Rappresenta la larghezza utile dell'area di lavoro.",
                "unit": "mm"
        },
        "x-pos-endstop": {
                "param": "position_endstop",
                "title": "Posizione Endstop Asse X",
                "desc": "Coordinata esatta assegnata all'asse X nell'istante in cui il finecorsa viene attivato durante la procedura di azzeramento (homing).",
                "unit": "mm"
        },
        "x-homing-speed": {
                "param": "homing_speed",
                "title": "Velocità di Homing Asse X",
                "desc": "Velocità a cui l'asse si sposta verso il finecorsa durante l'homing (G28). Imposta a 0 per disabilitare o ereditare il default.",
                "unit": "mm/s",
                "tip": "Tipicamente 40 - 80 mm/s"
        },
        "x-homing-retract-dist": {
                "param": "homing_retract_dist",
                "title": "Distanza di Arretramento Homing",
                "desc": "Distanza di cui l'asse indietreggia dopo il primo contatto col finecorsa, prima di eseguire il secondo tocco di precisione.",
                "unit": "mm",
                "tip": "Tipicamente 3 - 5 mm. Imposta 0 per sensorless homing"
        },
        "x-homing-retract-speed": {
                "param": "homing_retract_speed",
                "title": "Velocità di Arretramento Homing",
                "desc": "Velocità con cui l'asse si allontana dal finecorsa prima del secondo tocco.",
                "unit": "mm/s"
        },
        "dc-pos-min": {
                "param": "position_min",
                "title": "Posizione Minima Carrello X2",
                "desc": "Coordinata minima raggiungibile dal secondo carrello X2 nella cinematica IDEX.",
                "unit": "mm"
        },
        "dc-pos-max": {
                "param": "position_max",
                "title": "Posizione Massima Carrello X2",
                "desc": "Coordinata massima raggiungibile dal secondo carrello X2.",
                "unit": "mm"
        },
        "dc-pos-endstop": {
                "param": "position_endstop",
                "title": "Posizione Endstop Parcheggio X2",
                "desc": "Coordinata di parcheggio del carrello secondario X2 nel momento in cui attiva il proprio endstop dedicato.",
                "unit": "mm"
        },
        "dc-homing-speed": {
                "param": "homing_speed",
                "title": "Velocità Homing Carrello X2",
                "desc": "Velocità di azzeramento verso la posizione di parcheggio per il carrello secondario X2.",
                "unit": "mm/s"
        },
        "dc-homing-retract-dist": {
                "param": "homing_retract_dist",
                "title": "Arretramento Homing Carrello X2",
                "desc": "Distanza di arretramento dopo il tocco dell'endstop per il carrello X2.",
                "unit": "mm"
        },
        "dc-homing-retract-speed": {
                "param": "homing_retract_speed",
                "title": "Velocità Arretramento X2",
                "desc": "Velocità di disimpegno dal finecorsa del carrello secondario X2.",
                "unit": "mm/s"
        },
        "y-pos-min": {
                "param": "position_min",
                "title": "Posizione Minima Asse Y",
                "desc": "Coordinata minima raggiungibile dall'asse Y. Spesso 0 o negativo se il finecorsa è situato oltre il piatto riscaldato.",
                "unit": "mm"
        },
        "y-pos-max": {
                "param": "position_max",
                "title": "Posizione Massima Asse Y",
                "desc": "Coordinata massima raggiungibile dall'asse Y (profondità del piatto utile).",
                "unit": "mm"
        },
        "y-pos-endstop": {
                "param": "position_endstop",
                "title": "Posizione Endstop Asse Y",
                "desc": "Coordinata assegnata all'asse Y all'attivazione del finecorsa (di solito 0 su cartesiane, o max su CoreXY).",
                "unit": "mm"
        },
        "y-homing-speed": {
                "param": "homing_speed",
                "title": "Velocità Homing Asse Y",
                "desc": "Velocità con cui l'asse Y si muove verso il finecorsa durante l'homing.",
                "unit": "mm/s"
        },
        "y-homing-retract-dist": {
                "param": "homing_retract_dist",
                "title": "Arretramento Homing Asse Y",
                "desc": "Distanza di arretramento dopo il primo tocco del finecorsa su Y.",
                "unit": "mm"
        },
        "y-homing-retract-speed": {
                "param": "homing_retract_speed",
                "title": "Velocità Arretramento Asse Y",
                "desc": "Velocità di arretramento per l'asse Y.",
                "unit": "mm/s"
        },
        "z-pos-min": {
                "param": "position_min",
                "title": "Posizione Minima Asse Z",
                "desc": "Quota minima raggiungibile in Z. Spesso impostata a -2 o -5 mm per consentire la calibrazione fine dello Z-Offset senza blocchi software.",
                "unit": "mm",
                "tip": "Consigliato: -2.0 o -5.0 mm per calibrare Z-Offset"
        },
        "z-pos-max": {
                "param": "position_max",
                "title": "Posizione Massima Asse Z",
                "desc": "Altezza massima stampabile in altezza sull'asse Z.",
                "unit": "mm"
        },
        "z-pos-endstop": {
                "param": "position_endstop",
                "title": "Posizione Endstop Asse Z",
                "desc": "Quota dell'asse Z al trigger del microswitch fisico. Lasciare non impostato se si usa una sonda (probe/BLTouch/Eddy) per l'homing Z.",
                "unit": "mm"
        },
        "z-homing-speed": {
                "param": "homing_speed",
                "title": "Velocità Homing Asse Z",
                "desc": "Velocità di discesa verso il piatto o finecorsa durante l'azzeramento Z.",
                "unit": "mm/s",
                "tip": "Tipicamente 5 - 15 mm/s per evitare impatti violenti"
        },
        "z-homing-retract-dist": {
                "param": "homing_retract_dist",
                "title": "Arretramento Homing Asse Z",
                "desc": "Distanza di risalita della testina dopo il primo tocco prima del secondo tocco di homing.",
                "unit": "mm",
                "tip": "Consigliato: 3 - 5 mm"
        },
        "z-homing-retract-speed": {
                "param": "homing_retract_speed",
                "title": "Velocità Arretramento Asse Z",
                "desc": "Velocità di risalita tra il primo e il secondo tocco di homing.",
                "unit": "mm/s"
        },
        "mcu-conn-type": {
                "param": "connection_type",
                "title": "Metodo di Collegamento Scheda MCU",
                "desc": "Indica se la scheda principale comunica con l'host tramite porta seriale USB (/dev/serial/by-id/...) o tramite bus di rete CAN Bus a 2 fili.",
                "tip": "USB Seriale per schede madri convenzionali, CAN Bus per toolhead/EBB"
        },
        "mcu-serial": {
                "param": "serial",
                "title": "Percorso Porta Seriale MCU",
                "desc": "Percorso univoco della porta seriale USB nel filesystem Linux (es. /dev/serial/by-id/usb-Klipper_stm32f446xx_...). Usare sempre /by-id/ per evitare cambi di ttyUSB/ttyACM al riavvio.",
                "tip": "Identificabile via terminale con: ls /dev/serial/by-id/*"
        },
        "mcu-canbus-uuid": {
                "param": "canbus_uuid",
                "title": "UUID Scheda CAN Bus",
                "desc": "Identificativo univoco a 12 cifre esadecimali della scheda sul bus CAN (es. toolhead board EBB36, SB2209, Monster8).",
                "tip": "Rilevabile con il comando: python3 ~/klipper/scripts/canbus_query.py can0"
        },
        "mcu-baud": {
                "param": "baud",
                "title": "Velocità di Comunicazione Seriale (Baud Rate)",
                "desc": "Frequenza di trasmissione dati tra host e microcontrollore.",
                "unit": "baud",
                "tip": "Valore standard Klipper: 250000"
        },
        "mcu-restart-method": {
                "param": "restart_method",
                "title": "Metodo di Reset Hardware MCU",
                "desc": "Algoritmo usato da Klipper per riavviare la scheda microcontrollore quando si invia il comando FIRMWARE_RESTART.",
                "tip": "arduino (DTR), cheetah, command (software), rpi_usb (disalimentazione USB)"
        },
        "check-enable-host-temp": {
                "param": "[temperature_sensor host]",
                "title": "Sensore Temperatura Host / Raspberry Pi",
                "desc": "Abilita il monitoraggio continuo della temperatura della CPU del Raspberry Pi o computer host nella dashboard Mainsail.",
                "tip": "Crea [temperature_sensor raspberry_pi]"
        },
        "check-enable-mcu-temp": {
                "param": "[temperature_sensor mcu]",
                "title": "Sensore Temperatura Chip MCU",
                "desc": "Abilita la lettura del sensore di temperatura interno integrato nel microcontrollore della scheda madre.",
                "tip": "Crea [temperature_sensor mcu]"
        },
        "stepper-step-pin": {
                "param": "step_pin",
                "title": "Pin del Segnale di Passo (Step)",
                "desc": "Pin del microcontrollore che invia gli impulsi di clock al driver per muovere il motore passo-passo di un passo/microstep.",
                "tip": "Es. PA0, PE3, PC1"
        },
        "stepper-dir-pin": {
                "param": "dir_pin",
                "title": "Pin di Direzione (Direction)",
                "desc": "Pin che stabilisce il senso di rotazione del motore (orario o antiorario). Se l'asse si muove al contrario, anteponi il carattere ! al pin per invertirne la polarità logica.",
                "tip": "Es. PA1 oppure !PA1"
        },
        "check-invert-dir": {
                "param": "! (dir_pin)",
                "title": "Inverti Direzione Motore",
                "desc": "Aggiunge il prefisso punto esclamativo ! al dir_pin per invertire istantaneamente il verso di marcia dell'asse.",
                "tip": "Seleziona se l'asse si allontana dal finecorsa invece di avvicinarsi"
        },
        "stepper-enable-pin": {
                "param": "enable_pin",
                "title": "Pin di Abilitazione Driver (Enable)",
                "desc": "Pin che fornisce alimentazione agli avvolgimenti del motore. La quasi totalità dei driver passo-passo si attiva con livello logico basso (Active-Low), richiedendo il prefisso !.",
                "tip": "Es. !PA2"
        },
        "check-invert-enable": {
                "param": "! (enable_pin)",
                "title": "Inverti Logica Enable",
                "desc": "Abilita o disabilita il prefisso ! sul pin di abilitazione (logica invertita).",
                "tip": "Generalmente attivo (!) per quasi tutti i driver moderni"
        },
        "stepper-microsteps": {
                "param": "microsteps",
                "title": "Risoluzione Micropassi",
                "desc": "Frazione di passo intero generata dal driver. Aumenta la fluidità e riduce la rumorosità del motore.",
                "tip": "Consigliato: 16 o 32 (con interpolazione attiva per TMC)"
        },
        "stepper-steps-rotation": {
                "param": "full_steps_per_rotation",
                "title": "Passi Nativi del Motore per Giro Completo",
                "desc": "Numero di passi fisici completi per una rotazione di 360° dell'albero motore: 200 per motori convenzionali con angolo di 1.8°, 400 per motori ad alta precisione con angolo di 0.9°.",
                "tip": "1.8° = 200 passi | 0.9° = 400 passi"
        },
        "stepper-rotation-distance": {
                "param": "rotation_distance",
                "title": "Distanza di Rotazione (Rotation Distance)",
                "desc": "Distanza lineare (in mm) percorsa dall'asse con un giro completo di 360° del motore. Per pulegge GT2: numero denti x passo (es. 20 denti x 2 mm = 40 mm). Per viti T8: passo della filettatura (tipicamente 8 mm).",
                "unit": "mm",
                "tip": "Puleggia 20T GT2: 40.0 | Puleggia 16T GT2: 32.0 | Vite T8x8: 8.0"
        },
        "stepper-endstop-pin": {
                "param": "endstop_pin",
                "title": "Pin del Finecorsa (Endstop Pin)",
                "desc": "Pin digitale a cui è collegato lo switch di finecorsa per questo asse. Anteporre ^ se lo switch richiede pull-up interno, oppure tmc2209_stepper_x:virtual_endstop per sensorless.",
                "tip": "Es. ^PA3 oppure tmc2209_stepper_x:virtual_endstop"
        },
        "driver-model-select": {
                "param": "Driver IC",
                "title": "Modello Chip Driver",
                "desc": "Seleziona il circuito integrato del driver installato: TMC2209, TMC2208, TMC2240, TMC5160, TMC2130 o Standalone (A4988, DRV8825). Definisce la sezione nel config.",
                "tip": "TMC2209 è il più comune per rapporto silenziosità/affidabilità"
        },
        "driver-conn-type-select": {
                "param": "Bus Protocol",
                "title": "Tipo di Connessione Driver",
                "desc": "Metodo con cui il microcontrollore comunica con il chip TMC: UART (filo singolo bidirezionale), SPI (bus seriale ad alta velocità a 4 fili) o Standalone (nessuna configurazione digitale).",
                "tip": "UART per TMC2209/TMC2208 | SPI per TMC5160/TMC2130"
        },
        "driver-uart-pin": {
                "param": "uart_pin",
                "title": "Pin UART Ricezione Driver",
                "desc": "Pin del microcontrollore dedicato alla linea seriale UART per configurare digitalmente corrente, micropassi e registri del driver TMC.",
                "tip": "Es. PC11, PD5, etc."
        },
        "driver-tx-pin": {
                "param": "tx_pin",
                "title": "Pin TX UART (Opzionale)",
                "desc": "Pin di trasmissione dedicato se la scheda madre usa linee separate per invio e ricezione UART verso i driver.",
                "tip": "Lasciare vuoto se la scheda usa filo singolo UART con resistenza"
        },
        "driver-uart-address": {
                "param": "uart_address",
                "title": "Indirizzo Hardware UART",
                "desc": "Indirizzo univoco (da 0 a 3) assegnato al driver TMC quando più driver condividono lo stesso identico pin UART (es. schede MKS Robin o BTT E3).",
                "tip": "Tipicamente 0 per X, 1 per Y, 2 per Z, 3 per E0 su schede a bus condiviso"
        },
        "driver-cs-pin": {
                "param": "cs_pin",
                "title": "Pin Chip Select (CS) SPI",
                "desc": "Pin digitale che attiva la comunicazione con questo specifico driver durante le transazioni sul bus dati SPI.",
                "tip": "Es. PD11, PB12"
        },
        "driver-spi-mode": {
                "param": "spi_mode",
                "title": "Modalità Bus SPI",
                "desc": "Sceglie se appoggiarsi a un controller SPI hardware integrato nel chip MCU oppure emulare il bus SPI via bit-banging software su pin generici.",
                "tip": "Hardware SPI per massima velocità e minor carico CPU"
        },
        "driver-spi-bus": {
                "param": "spi_bus",
                "title": "Nome Bus SPI Hardware",
                "desc": "Identificativo del controller SPI hardware della scheda madre (es. spi1, spi2, spi3a, spi4).",
                "tip": "Consultare il pinout ufficiale della propria scheda madre"
        },
        "driver-spi-sclk": {
                "param": "spi_software_sclk_pin",
                "title": "Pin Clock SPI Software",
                "desc": "Pin digitale adibito al segnale di sincronizzazione di clock (SCK/SCLK) per SPI software.",
                "tip": "Es. PA5, PB13"
        },
        "driver-spi-mosi": {
                "param": "spi_software_mosi_pin",
                "title": "Pin MOSI SPI Software",
                "desc": "Pin Master Out Slave In per l'invio dei comandi di configurazione al driver.",
                "tip": "Es. PA7, PB15"
        },
        "driver-spi-miso": {
                "param": "spi_software_miso_pin",
                "title": "Pin MISO SPI Software",
                "desc": "Pin Master In Slave Out per la lettura dei registri di stato e diagnostica dal driver.",
                "tip": "Es. PA6, PB14"
        },
        "driver-run-current": {
                "param": "run_current",
                "title": "Corrente Operativa Nominale",
                "desc": "Corrente efficace RMS erogata dal driver agli avvolgimenti del motore durante il movimento.",
                "unit": "A",
                "tip": "Motori NEMA17 standard: 0.65 - 0.85A | Motori ad alta coppia 48mm: 1.0 - 1.4A"
        },
        "driver-stealthchop": {
                "param": "stealthchop_threshold",
                "title": "Modalità Silenziosa StealthChop",
                "desc": "Attiva la modulazione StealthChop per movimenti estremamente silenziosi. Disabilita (SpreadCycle) per garantire la massima coppia e precisione alle alte accelerazioni.",
                "tip": "Abilitato (999999) per silenzio | Disabilitato (0) per massima coppia e velocità"
        },
        "check-enable-hold-current": {
                "param": "hold_current (checkbox)",
                "title": "Abilita Corrente di Mantenimento",
                "desc": "Permette di ridurre la corrente quando il motore è fermo. Sconsigliato con TMC2209 e sensorless homing poiché la commutazione improvvisa può causare salti di microstep.",
                "tip": "Spesso lasciata disabilitata per massima stabilità"
        },
        "driver-hold-current": {
                "param": "hold_current",
                "title": "Corrente a Riposo (Hold Current)",
                "desc": "Corrente erogata al motore quando l'asse è fermo in posizione di stallo.",
                "unit": "A",
                "tip": "Tipicamente 60-70% della run_current se abilitata"
        },
        "check-enable-sense-resistor": {
                "param": "sense_resistor (checkbox)",
                "title": "Specifica Resistenza di Sense",
                "desc": "Permette di impostare manualmente il valore esatto della resistenza shunt di campionamento corrente saldata sul modulo driver.",
                "tip": "Necessario se diverso dal valore di fabbrica (0.110 ohm)"
        },
        "driver-sense-resistor": {
                "param": "sense_resistor",
                "title": "Valore Resistenza di Shunt",
                "desc": "Resistenza di sensing della corrente (in Ohm). Fondamentale per il calcolo corretto della corrente inviata al motore.",
                "unit": "Ω",
                "tip": "TMC2209 standard: 0.110 | Estrusori compatti: 0.075 | TMC5160: 0.022 o 0.075"
        },
        "driver-interpolate": {
                "param": "interpolate",
                "title": "Interpolazione Hardware a 256 Microstep",
                "desc": "Se True, il driver interpola autonomamente ogni micropasso a 256 posizioni intermedie, riducendo le risonanze acustiche a scapito di una minima latenza.",
                "tip": "Consigliato: True per TMC2209/TMC2208"
        },
        "driver-sensorless-enable": {
                "param": "virtual_endstop (Sensorless)",
                "title": "Homing Senza Finecorsa Fisico (Sensorless)",
                "desc": "Utilizza la tecnologia StallGuard del chip TMC per rilevare l'impatto meccanico a fine corsa attraverso il monitoraggio della contro-forza elettromotrice (back-EMF).",
                "tip": "Elimina i cavi e gli interruttori fisici di finecorsa su X e Y"
        },
        "driver-diag-pin": {
                "param": "diag_pin",
                "title": "Pin Diagnostica StallGuard (DIAG)",
                "desc": "Pin del microcontrollore collegato all'uscita DIAG del driver TMC per segnalare l'arresto meccanico al firmware.",
                "tip": "Richiede spesso il pull-up interno (^)"
        },
        "driver-sgthrs": {
                "param": "driver_SGTHRS / driver_SGT",
                "title": "Soglia di Sensibilità StallGuard",
                "desc": "Sensibilità di rilevamento dell'urto meccanico per l'homing sensorless. Su TMC2209 scala da 0 (meno sensibile, sbatte forte) a 255 (molto sensibile, si ferma subito). Su TMC5160 scala da -64 a +63.",
                "tip": "TMC2209: iniziare da 100 e regolare a passi di 5 (tipico: 60 - 120)"
        },
        "extruder-step-pin": {
                "param": "step_pin",
                "title": "Step Pin Motore Estrusore",
                "desc": "Pin del segnale di passo per il motore che trascina il filamento nell'hotend.",
                "tip": "Es. PB4, PD6"
        },
        "extruder-dir-pin": {
                "param": "dir_pin",
                "title": "Dir Pin Motore Estrusore",
                "desc": "Pin di direzione per il motore dell'estrusore. Inserisci ! se il motore ritrae invece di estrudere filamento.",
                "tip": "Es. PB3 o !PB3"
        },
        "extruder-enable-pin": {
                "param": "enable_pin",
                "title": "Enable Pin Estrusore",
                "desc": "Pin di abilitazione per il driver del motore dell'estrusore (generalmente attivo basso !).",
                "tip": "Es. !PB5"
        },
        "extruder-rot-dist": {
                "param": "rotation_distance",
                "title": "Rotation Distance Estrusore",
                "desc": "Millimetri di filamento estruso per ogni giro completo di 360° dell'albero motore. Calcolabile estrudendo 100 mm di filamento e misurando lo scarto reale.",
                "unit": "mm",
                "tip": "BMG standard: ~22.678 | Clockwork 2: ~22.68 | Orbiter 2.0: ~4.637 | Sherpa Mini: ~22.678"
        },
        "extruder-gear-ratio": {
                "param": "gear_ratio",
                "title": "Rapporto di Riduzione Ingranaggi",
                "desc": "Rapporto di trasmissione meccanico tra pignone motore e ingranaggi di trascinamento dell'estrusore.",
                "tip": "BMG: 50:17 | Clockwork 1/2: 50:10 | Orbiter 2.0: 7.5:1 | Azionamento diretto: lascia vuoto"
        },
        "extruder-nozzle-dia": {
                "param": "nozzle_diameter",
                "title": "Diametro Foro Ugello (Nozzle)",
                "desc": "Diametro di apertura dell'ugello installato sull'hotend.",
                "unit": "mm",
                "tip": "Tipicamente 0.40 mm (standard), 0.60 mm o 0.80 mm per stampe rapide"
        },
        "extruder-filament-dia": {
                "param": "filament_diameter",
                "title": "Diametro Nominale Filamento",
                "desc": "Diametro del filamento termoplastico utilizzato dalla stampante.",
                "unit": "mm",
                "tip": "Standard: 1.75 mm (o 2.85 mm per sistemi speciali)"
        },
        "extruder-pressure-advance": {
                "param": "pressure_advance",
                "title": "Compensazione Pressure Advance",
                "desc": "Algoritmo predittivo che compensa l'elasticità e la pressione interna del filamento fuso nella camera di riscaldamento durante accelerazioni e decelerazioni, garantendo angoli netti senza rigonfiamenti.",
                "tip": "Direct Drive: 0.02 - 0.06 | Bowden: 0.3 - 0.8"
        },
        "extruder-sensor-type": {
                "param": "sensor_type",
                "title": "Tipo di Sensore Termico Hotend",
                "desc": "Modello esatto di termistore o sonda di temperatura installata sull'hotend (es. Generic 3950, PT1000, ATC Semitec 104GT-2, MAX31865 per PT100 su SPI).",
                "tip": "Impostare il modello corretto per evitare scarti di temperatura pericolosi"
        },
        "extruder-heater-pin": {
                "param": "heater_pin",
                "title": "Pin Riscaldatore Hotend",
                "desc": "Pin MOSFET sul microcontrollore che pilota la cartuccia riscaldante dell'hotend in PWM.",
                "tip": "Es. PA2, PB10"
        },
        "extruder-sensor-pin": {
                "param": "sensor_pin",
                "title": "Pin Sensore Termico Hotend",
                "desc": "Pin analogico (ADC) per la lettura del termistore oppure pin Chip Select (CS) se si utilizza una sonda SPI digitale.",
                "tip": "Es. PC4, PA1"
        },
        "extruder-min-temp": {
                "param": "min_temp",
                "title": "Temperatura Minima di Sicurezza",
                "desc": "Soglia minima ammessa di temperatura (°C). Se il sensore rileva un valore inferiore (es. termistore scollegato o cavo rotto), Klipper arresta la macchina in emergenza per sicurezza (Thermal Runaway Protection).",
                "unit": "°C",
                "tip": "Tipicamente 0°C o -10°C"
        },
        "extruder-max-temp": {
                "param": "max_temp",
                "title": "Temperatura Massima di Sicurezza",
                "desc": "Temperatura massima consentita per l'hotend prima che scatti il blocco hardware di protezione da surriscaldamento.",
                "unit": "°C",
                "tip": "Gola in PTFE: max 250°C | All-Metal: 280 - 300°C | Hotend per tecnopolimeri: 350 - 500°C"
        },
        "extruder-min-extrude": {
                "param": "min_extrude_temp",
                "title": "Temperatura Minima di Estrusione",
                "desc": "Temperatura al di sotto della quale Klipper rifiuta i comandi di estrusione G1 E per prevenire danni al motore o all'ugello (estrusione a freddo).",
                "unit": "°C",
                "tip": "Standard: 170°C"
        },
        "extruder-control-type": {
                "param": "control",
                "title": "Algoritmo Termico Hotend",
                "desc": "Algoritmo per stabilizzare la temperatura dell'ugello: pid per modulazione fine proporzionale-integrale-derivativa (consigliato), oppure watermark con isteresi accendi/spegni.",
                "tip": "Usa sempre PID per l'hotend per stabilità termica millimetrica"
        },
        "extruder-pid-kp": {
                "param": "pid_Kp",
                "title": "Coefficiente Proporzionale PID",
                "desc": "Guadagno proporzionale dell'algoritmo di riscaldamento PID. Calcolabile automaticamente con il comando PID_CALIBRATE HEATER=extruder TARGET=210.",
                "tip": "Calcolato tramite autotune PID"
        },
        "extruder-pid-ki": {
                "param": "pid_Ki",
                "title": "Coefficiente Integrale PID",
                "desc": "Guadagno integrale per correggere l'errore termico cumulativo nel tempo.",
                "tip": "Calcolato tramite autotune PID"
        },
        "extruder-pid-kd": {
                "param": "pid_Kd",
                "title": "Coefficiente Derivativo PID",
                "desc": "Guadagno derivativo per contrastare le variazioni repentine di temperatura.",
                "tip": "Calcolato tramite autotune PID"
        },
        "extruder-max-delta": {
                "param": "max_delta",
                "title": "Tolleranza Isteresi Watermark",
                "desc": "Finestra di isteresi termica ammessa attorno al target quando si impiega l'algoritmo watermark.",
                "unit": "°C"
        },
        "extruder-rtd-nominal-r": {
                "param": "rtd_nominal_r",
                "title": "Resistenza Nominale Sonda RTD a 0°C",
                "desc": "Resistenza elettrica della sonda termoresistiva al platino a zero gradi Celsius: 100 per sonde PT100, 1000 per sonde PT1000.",
                "unit": "Ω",
                "tip": "PT100: 100 | PT1000: 1000"
        },
        "extruder-rtd-reference-r": {
                "param": "rtd_reference_r",
                "title": "Resistenza di Riferimento Modulo RTD",
                "desc": "Valore della resistenza campione saldata sul circuito integrato MAX31865 (solitamente 430 ohm per PT100, 4300 ohm per PT1000).",
                "unit": "Ω",
                "tip": "Modulo per PT100: 430 | Modulo per PT1000: 4300"
        },
        "extruder-rtd-num-wires": {
                "param": "rtd_num_of_wires",
                "title": "Numero di Conduttori Sonda RTD",
                "desc": "Configurazione fisica del cablaggio della termoresistenza (2, 3 o 4 fili). Le configurazioni a 3 o 4 fili compensano la resistenza interna dei cavi per massima accuratezza.",
                "tip": "2 fili (economico), 4 fili (massima precisione industriale)"
        },
        "extruder-rtd-filter": {
                "param": "rtd_use_50Hz_filter",
                "title": "Filtro Antidisturbo Rete Elettrica",
                "desc": "Seleziona il filtro notch a 50Hz (standard europeo/italiano a 230V) o 60Hz per abbattere i disturbi indotti dalla rete elettrica sulle letture della sonda.",
                "tip": "Usa 50Hz in Italia ed Europa"
        },
        "bed-sensor-type": {
                "param": "sensor_type",
                "title": "Tipo Sensore Piatto Riscaldato",
                "desc": "Modello del termistore installato sotto il piano di stampa.",
                "tip": "Tipicamente Generic 3950 o EPCOS 100K B57560G104F"
        },
        "bed-heater-pin": {
                "param": "heater_pin",
                "title": "Pin Riscaldatore Piatto",
                "desc": "Pin MOSFET o relè a stato solido (SSR) che comanda il riscaldamento del piatto di stampa.",
                "tip": "Es. PA1, PC9"
        },
        "bed-sensor-pin": {
                "param": "sensor_pin",
                "title": "Pin Sensore Termico Piatto",
                "desc": "Pin analogico (ADC) dedicato alla lettura della temperatura del letto.",
                "tip": "Es. PC3, PA0"
        },
        "bed-min-temp": {
                "param": "min_temp",
                "title": "Temperatura Minima Piatto",
                "desc": "Temperatura minima consentita prima del blocco di sicurezza.",
                "unit": "°C",
                "tip": "Tipicamente 0°C"
        },
        "bed-max-temp": {
                "param": "max_temp",
                "title": "Temperatura Massima Piatto",
                "desc": "Limite massimo di temperatura per il letto di stampa (es. 120 - 130°C per piatti a 24V/220V).",
                "unit": "°C"
        },
        "bed-control-type": {
                "param": "control",
                "title": "Algoritmo Controllo Termico Piatto",
                "desc": "Metodo di regolazione termica: pid per piatti in alluminio a 24V, oppure watermark con isteresi per piatti AC ad alta potenza comandati da relè SSR.",
                "tip": "Piatto 24V DC: pid | Piatto 230V AC con SSR: watermark o pid"
        },
        "bed-pid-kp": {
                "param": "pid_Kp",
                "title": "Coefficiente Proporzionale PID Piatto",
                "desc": "Guadagno proporzionale del piatto (calcolabile con PID_CALIBRATE HEATER=heater_bed TARGET=60)."
        },
        "bed-pid-ki": {
                "param": "pid_Ki",
                "title": "Coefficiente Integrale PID Piatto",
                "desc": "Guadagno integrale per il piatto riscaldato."
        },
        "bed-pid-kd": {
                "param": "pid_Kd",
                "title": "Coefficiente Derivativo PID Piatto",
                "desc": "Guadagno derivativo per il piatto riscaldato."
        },
        "bed-max-delta": {
                "param": "max_delta",
                "title": "Tolleranza Isteresi Watermark Piatto",
                "desc": "Scarto ammesso attorno alla temperatura impostata con algoritmo watermark (es. 1.0 - 2.0°C).",
                "unit": "°C"
        },
        "probe-type-select": {
                "param": "Probe Type",
                "title": "Tipologia Sonda di Livellamento",
                "desc": "Tipo di sensore impiegato per mappare la planarità del piatto: BLTouch / 3DTouch, microswitch meccanico (Klicky/Voron Tap), sensore induttivo (Omron/SuperPinda), Beacon o sonda a correnti parassite BTT Eddy.",
                "tip": "Imposta la sezione corretta ([probe], [bltouch], ecc.)"
        },
        "probe-sensor-pin": {
                "param": "sensor_pin",
                "title": "Pin Segnale Sonda (Sensor Pin)",
                "desc": "Pin a cui è collegata l'uscita logica del sensore di livellamento. Spesso richiede pull-up interno (^).",
                "tip": "Es. ^PC14, ^PA0"
        },
        "probe-control-pin": {
                "param": "control_pin",
                "title": "Pin di Controllo Servocomando (BLTouch)",
                "desc": "Pin PWM che comanda l'estrazione e la ritrazione dello spillo per sensori BLTouch e cloni.",
                "tip": "Es. PA8, PB0"
        },
        "probe-x-offset": {
                "param": "x_offset",
                "title": "Distanza X Sonda-Ugello",
                "desc": "Distanza orizzontale in millimetri tra l'ugello e il punto di contatto della sonda lungo l'asse X. Positiva se la sonda è a destra dell'ugello, negativa se è a sinistra.",
                "unit": "mm",
                "tip": "0.0 se la sonda è coassiale all'ugello (es. Voron Tap o Eddy su ugello)"
        },
        "probe-y-offset": {
                "param": "y_offset",
                "title": "Distanza Y Sonda-Ugello",
                "desc": "Distanza orizzontale in millimetri tra l'ugello e la sonda lungo l'asse Y. Positiva se la sonda è dietro l'ugello, negativa se è davanti.",
                "unit": "mm"
        },
        "probe-z-offset": {
                "param": "z_offset",
                "title": "Distanza Verticale Z-Offset",
                "desc": "Distanza verticale esatta tra la quota dell'ugello e la quota di trigger della sonda. Valore fondamentale per il primo layer perfetto, rifinibile con PROBE_CALIBRATE.",
                "unit": "mm",
                "tip": "Maggiore è il valore, più l'ugello scende vicino al piatto"
        },
        "probe-samples": {
                "param": "samples",
                "title": "Campionamenti per Singolo Punto",
                "desc": "Numero di letture consecutive effettuate per ogni punto della griglia per eliminare rumore e letture anomale.",
                "tip": "Consigliato: 2 o 3 letture per punto"
        },
        "probe-samples-result": {
                "param": "samples_result",
                "title": "Metodo di Aggregazione Campioni",
                "desc": "Come combinare i campioni rilevati sullo stesso punto: median (valore mediano, più robusto contro anomalie) o average (media aritmetica).",
                "tip": "Consigliato: median"
        },
        "check-enable-safe-z": {
                "param": "[safe_z_home]",
                "title": "Abilita Safe Z Home",
                "desc": "Esegue l'azzeramento dell'asse Z al centro del piatto anziché agli angoli, prevenendo impatti se si usa una sonda montata sulla testina.",
                "tip": "Obbligatorio quando si usa una sonda (BLTouch/Tap) come endstop Z"
        },
        "safe-z-pos": {
                "param": "home_xy_position",
                "title": "Coordinate Centro Homing Z",
                "desc": "Coordinate X, Y a cui spostare la testina prima di far scendere la sonda per l'homing Z (tipicamente il centro del piatto).",
                "tip": "Es. 150, 150 per piatto 300x300"
        },
        "safe-z-hop": {
                "param": "z_hop",
                "title": "Altezza di Sicurezza Z-Hop",
                "desc": "Distanza di sollevamento preventivo dell'asse Z prima e dopo l'homing per evitare di strisciare l'ugello o la sonda sul piatto.",
                "unit": "mm",
                "tip": "Consigliato: 5 - 10 mm"
        },
        "safe-z-speed": {
                "param": "speed",
                "title": "Velocità di Spostamento Safe Z",
                "desc": "Velocità di traslazione della testina verso le coordinate di homing Z sicuro.",
                "unit": "mm/s",
                "tip": "Consigliato: 50 - 100 mm/s"
        },
        "mesh-min": {
                "param": "mesh_min",
                "title": "Coordinate Minime Griglia (X, Y)",
                "desc": "Coordinate (X, Y) del primo punto sondo sul piatto. Devono tenere conto dell'offset della sonda per evitare che quest'ultima esca dal piatto.",
                "tip": "Es. 25, 25"
        },
        "mesh-max": {
                "param": "mesh_max",
                "title": "Coordinate Massime Griglia (X, Y)",
                "desc": "Coordinate (X, Y) dell'ultimo punto tastabile sul piatto.",
                "tip": "Es. 275, 275"
        },
        "mesh-probe-count": {
                "param": "probe_count",
                "title": "Risoluzione Griglia (Punti X, Y)",
                "desc": "Numero di punti di campionamento lungo X e Y per generare la mappa di altezza (Heightmap).",
                "tip": "Es. 5,5 (25 punti) o 7,7 (49 punti per piatti ampi)"
        },
        "mesh-algorithm": {
                "param": "algorithm",
                "title": "Algoritmo di Interpolazione Mesh",
                "desc": "Algoritmo matematico per calcolare le quote tra i punti tastati: bicubic (consigliato per griglie dense 5x5 o superiori) o lagrange (solo per griglie piccole 3x3).",
                "tip": "Consigliato: bicubic"
        },
        "z-tilt-positions": {
                "param": "z_positions",
                "title": "Punti Pivot Motori Z (z_positions)",
                "desc": "Coordinate fisiche (X, Y) dei fulcri o viti dei motori Z indipendenti per allineare il piatto con Z_TILT_ADJUST.",
                "tip": "Una coppia X, Y per ogni motore Z"
        },
        "z-tilt-points": {
                "param": "points",
                "title": "Punti di Tastatura Z-Tilt",
                "desc": "Coordinate sul piatto dove la sonda misurerà l'inclinazione per calcolare i passi correttivi di ciascun motore Z."
        },
        "z-tilt-retries": {
                "param": "retries",
                "title": "Tentativi Massimi Z-Tilt",
                "desc": "Numero massimo di cicli di misurazione consentiti per raggiungere la planarità desiderata.",
                "tip": "Tipicamente 5 - 10 tentativi"
        },
        "z-tilt-tolerance": {
                "param": "retry_tolerance",
                "title": "Tolleranza Livellamento Z-Tilt",
                "desc": "Scarto massimo tollerato tra i punti Z (in mm) per considerare il piatto perfettamente livellato.",
                "unit": "mm",
                "tip": "Consigliato: 0.0075 - 0.02 mm"
        },
        "qgl-corners": {
                "param": "gantry_corners",
                "title": "Coordinate Angoli Gantry (Voron QGL)",
                "desc": "Coordinate fisiche dei 4 angoli del carrello sospeso su stampanti tipo Voron 2.4 con Quad Gantry Level."
        },
        "qgl-points": {
                "param": "points",
                "title": "4 Punti di Tastatura QGL",
                "desc": "Coordinate dei 4 punti da sondare sul piatto per calcolare la correzione indipendente dei 4 motori Z."
        },
        "qgl-retries": {
                "param": "retries",
                "title": "Tentativi Massimi QGL",
                "desc": "Numero massimo di cicli prima di considerare fallito il livellamento a 4 motori.",
                "tip": "Tipicamente 5 - 10"
        },
        "qgl-tolerance": {
                "param": "retry_tolerance",
                "title": "Tolleranza Quad Gantry Level",
                "desc": "Differenza massima accettabile tra i 4 angoli per completare la procedura.",
                "unit": "mm",
                "tip": "Consigliato: 0.0075 - 0.01 mm"
        },
        "fan-part-pin": {
                "param": "pin ([fan])",
                "title": "Pin Ventola Raffreddamento Pezzo",
                "desc": "Pin PWM collegato alla ventola del layer che raffredda il filamento estruso sul pezzo, comandabile via G-Code M106.",
                "tip": "Es. PA8, PC6"
        },
        "fan-part-kick": {
                "param": "kick_start_time",
                "title": "Tempo Spunto Iniziale Ventola",
                "desc": "Durata dell'impulso al 100% di potenza (in secondi) erogato all'avvio per vincere l'inerzia iniziale delle ventole.",
                "unit": "s",
                "tip": "Consigliato: 0.100 - 0.500 s"
        },
        "fan-part-off-below": {
                "param": "off_below",
                "title": "Soglia Minima Spegnimento Ventola",
                "desc": "Velocità minima al di sotto della quale la ventola non riceve alimentazione per evitare ronzii senza rotazione.",
                "tip": "Tipicamente 0.10 (10%)"
        },
        "check-enable-shaper": {
                "param": "[input_shaper]",
                "title": "Abilitazione Filtro Input Shaper",
                "desc": "Attiva la compensazione attiva delle vibrazioni e risonanze meccaniche, eliminando l'effetto eco (ghosting/ringing) sulle superfici verticali ad alte velocità.",
                "tip": "Migliora drasticamente la finitura superficiale"
        },
        "shaper-freq-x": {
                "param": "shaper_freq_x",
                "title": "Frequenza Risonanza Asse X",
                "desc": "Frequenza naturale di oscillazione dell'asse X individuata tramite test con accelerometro o con la stampa della torre di risonanza.",
                "unit": "Hz",
                "tip": "Tipicamente tra 35 e 85 Hz"
        },
        "shaper-type-x": {
                "param": "shaper_type_x",
                "title": "Algoritmo Filtro Asse X",
                "desc": "Modello matematico di attenuazione applicato all'asse X (es. ZV, MZV, ZVD, EI, 2HUMP_EI, 3HUMP_EI).",
                "tip": "MZV ed EI sono tra i più diffusi ed equilibrati"
        },
        "shaper-freq-y": {
                "param": "shaper_freq_y",
                "title": "Frequenza Risonanza Asse Y",
                "desc": "Frequenza di risonanza dell'asse Y (tipicamente inferiore rispetto ad X su stampanti \"bed-slinger\").",
                "unit": "Hz"
        },
        "shaper-type-y": {
                "param": "shaper_type_y",
                "title": "Algoritmo Filtro Asse Y",
                "desc": "Algoritmo shaper per l'asse Y (es. MZV per piatti leggeri, EI o 2HUMP_EI per piatti pesanti).",
                "tip": "MZV o EI consigliati"
        },
        "check-enable-adxl": {
                "param": "[adxl345]",
                "title": "Abilitazione Accelerometro ADXL345",
                "desc": "Configura il chip accelerometro digitale SPI per la misurazione automatica in tempo reale delle risonanze meccaniche con il comando TEST_RESONANCES.",
                "tip": "Collegabile a scheda host, toolhead board o Raspberry Pi"
        },
        "adxl-cs-pin": {
                "param": "cs_pin",
                "title": "Pin Chip Select ADXL345",
                "desc": "Pin digitale per selezionare l'accelerometro sul bus SPI.",
                "tip": "Es. rpi:None o gpio pin su toolhead"
        },
        "adxl-spi-bus": {
                "param": "spi_bus",
                "title": "Bus SPI Accelerometro",
                "desc": "Nome del bus SPI hardware utilizzato per leggere i dati dall'accelerometro (es. spidev0.0, spi1)."
        },
        "adxl-axes-map": {
                "param": "axes_map",
                "title": "Orientamento Assi Accelerometro",
                "desc": "Mappatura degli assi fisici del chip rispetto agli assi di movimento della stampante.",
                "tip": "Default: x,y,z (invertibile es. -x,z,y se montato verticalmente)"
        },
        "adxl-rate": {
                "param": "rate",
                "title": "Campionamento ADXL345",
                "desc": "Frequenza di acquisizione dati dell'accelerometro (da 1600 Hz a 3200 Hz).",
                "unit": "Hz",
                "tip": "Valore standard Klipper: 3200"
        },
        "res-accel-chip": {
                "param": "accel_chip",
                "title": "Chip Accelerometro di Riferimento",
                "desc": "Nome della sezione accelerometro usata dal resonance tester (es. adxl345)."
        },
        "res-probe-points": {
                "param": "probe_points",
                "title": "Coordinate Test di Risonanza",
                "desc": "Coordinate X, Y, Z dove posizionare la testina durante la vibrazione di test.",
                "tip": "Es. 150, 150, 20 (centro del piatto)"
        },
        "res-accel-per-hz": {
                "param": "accel_per_hz",
                "title": "Accelerazione per Hertz",
                "desc": "Fattore di accelerazione applicato per ciascun Hz durante lo sweep delle frequenze.",
                "tip": "Default standard Klipper: 75"
        },
        "res-max-smoothing": {
                "param": "max_smoothing",
                "title": "Livellamento Massimo Tollerato",
                "desc": "Massimo fattore di smoothing accettabile durante il calcolo automatico dello shaper ottimale."
        },
        "input-moonraker-url": {
                "param": "Moonraker Base URL",
                "title": "Indirizzo Istanza Moonraker",
                "desc": "Indirizzo IP o hostname con porta del server Moonraker che controlla Klipper (es. http://192.168.1.50:7125). Lasciare vuoto per autorilevamento sulla stessa macchina.",
                "tip": "Default: origine corrente (stesso host di Mainsail)"
        },
        "check-force-light-mode": {
                "param": "UI Theme Mode",
                "title": "Forza Modalità Chiara",
                "desc": "Forza l'interfaccia grafica in tema chiaro invece di sincronizzare il tema scuro da Mainsail.",
                "tip": "Consigliato non attivo per abbinamento perfetto a Mainsail"
        },
        "check-virtual-sd": {
                "param": "[virtual_sdcard]",
                "title": "Abilitazione Virtual SD Card",
                "desc": "Permette a Klipper di eseguire direttamente i file G-Code caricati su Moonraker o Mainsail nel disco locale.",
                "tip": "Indispensabile per il funzionamento di Mainsail e Moonraker"
        },
        "check-pause-resume": {
                "param": "[pause_resume]",
                "title": "Abilitazione Pausa e Ripresa",
                "desc": "Abilita il supporto ai comandi PAUSE e RESUME nativi di Klipper, necessari per cambi filamento e pause di emergenza.",
                "tip": "Raccomandato attivo in ogni stampante"
        },
        "check-display-status": {
                "param": "[display_status]",
                "title": "Stato di Avanzamento Stampa",
                "desc": "Fornisce lo stato di avanzamento percentuale e messaggi di stato alla web interface e agli schermi.",
                "tip": "Raccomandato attivo"
        },
        "check-respond": {
                "param": "[respond]",
                "title": "Comando Risposta Console (M118)",
                "desc": "Permette ai comandi M118 e RESPOND di scrivere messaggi informativi nella console interattiva di Mainsail.",
                "tip": "Utile per script e macro avanzate"
        },
        "idle-timeout": {
                "param": "timeout ([idle_timeout])",
                "title": "Tempo di Timeout Inattività",
                "desc": "Secondi di inattività trascorsi i quali Klipper disattiva automaticamente motori e riscaldatori per sicurezza energetica e termica.",
                "unit": "s",
                "tip": "Default: 600 secondi (10 minuti)"
        }
};

    // =========================================================================
    // Caricamento Dinamico dei File di Lingua Modulari (dist/locales/<lang>.json)
    // =========================================================================
    async function loadLocale(lang) {
        if (!lang || !SUPPORTED_LANGUAGES[lang]) return null;
        if (LOCALE_CACHE[lang]) return LOCALE_CACHE[lang];

        try {
            const version = (window.APP_VERSION || '0.7.18');
            const res = await fetch(`locales/${lang}.json?v=${version}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();

            // Sincronizza testi interfaccia
            if (data.ui) {
                UI_TRANSLATIONS[lang] = Object.assign({}, UI_TRANSLATIONS[lang] || {}, data.ui);
            }

            // Sincronizza etichette dei moduli form
            if (data.labels) {
                FORM_LABEL_TRANSLATIONS[lang] = Object.assign({}, FORM_LABEL_TRANSLATIONS[lang] || {}, data.labels);
            }

            // Sincronizza documentazione tooltip parametri
            if (data.tooltips) {
                if (!window.LOCALE_TOOLTIPS) window.LOCALE_TOOLTIPS = {};
                window.LOCALE_TOOLTIPS[lang] = Object.assign({}, window.LOCALE_TOOLTIPS[lang] || {}, data.tooltips);
            }

            LOCALE_CACHE[lang] = data;
            return data;
        } catch (e) {
            // Fallback trasparente: la UI utilizza i dizionari incorporati
            return null;
        }
    }

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
        const dict = UI_TRANSLATIONS[lang] || UI_TRANSLATIONS['en'] || UI_TRANSLATIONS['it'] || {};
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

        // 3. Traduzione automatica dei bottoni della topbar e delle azioni
        translateElementText('btn-settings', 'nav.settings', true);
        translateElementText('btn-reload', 'nav.reload', true);
        translateElementText('btn-preview', 'nav.preview', true);
        translateElementText('btn-download', 'nav.download', true);
        translateElementText('btn-save', 'nav.save', true);
        translateElementText('btn-save-restart', 'nav.save_restart', true);
        translateElementText('btn-add-mcu', 'btn.add_mcu', true);
        translateElementText('btn-add-fan', 'btn.add_fan', true);
        translateElementText('btn-add-led', 'btn.add_led', true);
        translateElementText('btn-add-include', 'btn.add_include', true);
        translateElementText('btn-add-macro', 'btn.add_macro', true);
        translateElementText('btn-insert-macro-template', 'btn.insert_macro_template', true);

        // 4. Traduzione dei bottoni delle schede (Tab Buttons)
        document.querySelectorAll('.tab-btn').forEach(btn => {
            const tabTarget = btn.getAttribute('data-tab');
            if (tabTarget) {
                const key = `tab.${tabTarget.replace(/^tab-/, '').replace(/-/g, '_')}`;
                const text = t(key);
                if (text && text !== key) {
                    let textSpan = btn.querySelector('.tab-text');
                    if (!textSpan) {
                        textSpan = document.createElement('span');
                        textSpan.className = 'tab-text';
                        const svg = btn.querySelector('svg');
                        btn.innerHTML = '';
                        if (svg) btn.appendChild(svg);
                        btn.appendChild(textSpan);
                    }
                    textSpan.textContent = text;
                    btn.setAttribute('title', text);
                }
            }
        });

        // 5. Traduzione Form Labels tramite mappa ID
        const labelDict = FORM_LABEL_TRANSLATIONS[lang] || FORM_LABEL_TRANSLATIONS['en'];
        if (labelDict) {
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

        // 8. Evento globale per aggiornare titoli dinamici (es. stepper e driver attivi)
        if (typeof window !== 'undefined' && window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('klifig:languageChanged', { detail: { lang } }));
        }
    }

    function translateElementText(id, i18nKey, keepIcons = false) {
        const el = document.getElementById(id);
        if (!el) return;
        const text = t(i18nKey);
        if (!text || text === i18nKey) return;

        el.setAttribute('title', text);

        if (keepIcons) {
            let span = el.querySelector('.btn-text');
            if (!span) {
                span = el.querySelector('span:not(#quick-theme-dot):not(.info-circle)');
            }
            if (span) {
                span.classList.add('btn-text');
                span.textContent = text;
            } else {
                const textNode = Array.from(el.childNodes).find(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim().length > 0);
                if (textNode) {
                    const newSpan = document.createElement('span');
                    newSpan.className = 'btn-text';
                    newSpan.textContent = text;
                    el.replaceChild(newSpan, textNode);
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

        const activeLang = getActiveLanguage();
        // Carica dinamicamente il file di localizzazione se non già in cache
        loadLocale(activeLang).then(() => {
            applyTranslations();
        });
        applyTranslations();
    }

    // Inizializzazione al caricamento
    function initI18n() {
        if (!detectedMainsailLanguage) {
            const browserLang = (navigator.language || 'it').toLowerCase().slice(0, 2);
            detectedMainsailLanguage = SUPPORTED_LANGUAGES[browserLang] ? browserLang : 'it';
        }

        const activeLang = getActiveLanguage();
        loadLocale(activeLang).then(() => {
            applyTranslations();
        });
        applyTranslations();
    }

    // Esportazione API
    window.i18n = {
        t,
        setLanguage,
        loadLocale,
        getActiveLanguage,
        detectMainsailLanguageFromSettings,
        applyTranslations,
        SUPPORTED_LANGUAGES,
        UI_TRANSLATIONS,
        LOCALE_CACHE
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initI18n);
    } else {
        initI18n();
    }
})();
