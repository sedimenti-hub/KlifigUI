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

            // Card Titles & Sections
            'card.general_params': "General Klipper Parameters",
            'card.mechanical_arch': "Mechanical Architecture (IDEX & Multi-Z)",
            'card.delta_geometry': "Delta Geometry (Optional)",
            'section.axis_limits_homing': "Axis Limits & Homing Configuration",
            'card.axis_x': "X Axis - Limits & Homing",
            'card.axis_dc': "Dual Carriage (Second X Carriage IDEX)",
            'card.axis_y': "Y Axis - Limits & Homing",
            'card.axis_z': "Z Axis - Limits & Homing",
            'card.mcu_main': "Main Microcontroller (Motherboard)",
            'card.mcu_temp': "Host & Chip Thermal Monitoring",
            'card.mcu_extra': "Secondary MCUs & Toolhead ([mcu <name>])",
            'card.stepper_config': "Stepper Motor Configuration",
            'card.stepper_dual_carriage': "Dual Carriage X2 Configuration",
            'card.stepper_motor_axis': "Motor Configuration Axis",
            'card.driver_config': "Stepper Motion Driver",
            'card.driver_stepper_motion': "Stepper Motion Driver",
            'card.extruder_mech': "Extruder Mechanics & Nozzle",
            'card.extruder_mech_primary': "Primary Extruder Mechanics",
            'card.extruder_mech_secondary': "Secondary IDEX Extruder Mechanics",
            'card.extruder_thermal': "Hotend Heater & Temperature Sensor",
            'card.extruder_algo': "Temperature Control",
            'card.extruder_driver': "Extruder Driver",
            'card.extruder_driver_primary': "Primary Extruder Driver",
            'card.extruder_driver_secondary': "Secondary IDEX Extruder Driver",
            'card.heater_bed': "Heated Bed",
            'card.bed_pid': "Bed PID Tuning",
            'card.fans_cooling': "Klipper Cooling Fans",
            'card.adxl': "Resonance Accelerometer ([adxl345])",
            'card.leds': "LED & Neopixel Lighting",
            'card.core_features': "Essential Klipper & Mainsail Features",
            'card.includes': "Included Configuration Files ([include])",
            'card.macros': "Custom G-Code Macros ([gcode_macro])",
            'card.probe': "Bed Leveling Probe (Probe / BLTouch)",
            'card.safe_z_home': "Safe Center Homing ([safe_z_home])",
            'card.z_tilt': "Independent Z Motors Alignment ([z_tilt])",
            'card.quad_gantry_level': "4-Z Motors Alignment ([quad_gantry_level])",
            'card.bed_mesh': "Bed Mesh Leveling ([bed_mesh])",
            'card.resonance_tester': "Resonance Compensation & Tuning ([input_shaper] / [resonance_tester])",
            'include.title': "Included Configuration Files ([include])",
            'include.desc': "Organize your modular Klipper configuration by including external .cfg files.",
            'include.presets_title': "⚡ Include Common Standard Files",
            'macro.title': "Custom G-Code Macros ([gcode_macro])",
            'macro.desc': "Manage, create, and edit macros for print handling in Mainsail.",
            'modal.preview_title': "Generated Klipper Configuration Preview",
            'modal.settings_title': "Settings & Mainsail Theme",
            'modal.calc_title': "Rotation Distance Calculator",
            'modal.lang_title': "Language & Localization (Mainsail Sync)",
            'modal.theme_title': "Mainsail Theme & Colors Integration",
            'btn.insert_macro_template': "Insert Default Templates",

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
            'modal.lang_label': 'Oberflächensprache:',

            // Card Titles & Abschnitte
            'card.general_params': "Allgemeine Klipper-Parameter",
            'card.mechanical_arch': "Mechanische Architektur (IDEX & Multi-Z)",
            'card.delta_geometry': "Delta-Geometrie (Optional)",
            'section.axis_limits_homing': "Achsenbegrenzungen & Homing-Konfiguration",
            'card.axis_x': "X-Achse - Begrenzungen & Homing",
            'card.axis_dc': "Dual Carriage (Zweiter X-Schlitten IDEX)",
            'card.axis_y': "Y-Achse - Begrenzungen & Homing",
            'card.axis_z': "Z-Achse - Begrenzungen & Homing",
            'card.mcu_main': "Haupt-Mikrocontroller (Mainboard)",
            'card.mcu_temp': "Host- & Chip-Temperaturüberwachung",
            'card.mcu_extra': "Zusätzliche MCUs & Toolhead ([mcu <Name>])",
            'card.stepper_config': "Schrittmotor-Konfiguration",
            'card.stepper_dual_carriage': "Dual Carriage X2 Konfiguration",
            'card.stepper_motor_axis': "Motorkonfiguration Achse",
            'card.driver_config': "Schrittmotortreiber (Stepper Motion)",
            'card.driver_stepper_motion': "Schrittmotortreiber",
            'card.extruder_mech': "Extruder-Mechanik & Düse",
            'card.extruder_mech_primary': "Haupt-Extruder-Mechanik",
            'card.extruder_mech_secondary': "Zweiter IDEX-Extruder Mechanik",
            'card.extruder_thermal': "Hotend-Heizung & Temperatursensor",
            'card.extruder_algo': "Temperaturregelung",
            'card.extruder_driver': "Extruder-Treiber",
            'card.extruder_driver_primary': "Haupt-Extruder-Treiber",
            'card.extruder_driver_secondary': "Zweiter IDEX-Extruder Treiber",
            'card.heater_bed': "Heizbett",
            'card.bed_pid': "Heizbett-PID-Regelung",
            'card.fans_cooling': "Klipper-Kühllüfter",
            'card.adxl': "Resonanz-Beschleunigungsmesser ([adxl345])",
            'card.leds': "LED- & Neopixel-Beleuchtung",
            'card.core_features': "Wesentliche Klipper- & Mainsail-Funktionen",
            'card.includes': "Eingebundene Konfigurationsdateien ([include])",
            'card.macros': "Benutzerdefinierte G-Code-Makros ([gcode_macro])",
            'card.probe': "Bett-Nivelliersonde (Probe / BLTouch)",
            'card.safe_z_home': "Sicheres Homing im Zentrum ([safe_z_home])",
            'card.z_tilt': "Unabhängige Z-Motoren-Ausrichtung ([z_tilt])",
            'card.quad_gantry_level': "Ausrichtung von 4 Z-Motoren ([quad_gantry_level])",
            'card.bed_mesh': "Bett-Mesh-Nivellierung ([bed_mesh])",
            'card.resonance_tester': "Resonanzkompensation & Kalibrierung ([input_shaper] / [resonance_tester])",
            'include.title': "Eingebundene Konfigurationsdateien ([include])",
            'include.desc': "Organisieren Sie Ihre modulare Klipper-Konfiguration durch externe .cfg-Dateien.",
            'include.presets_title': "⚡ Gängige Standarddateien einbinden",
            'macro.title': "Benutzerdefinierte G-Code-Makros ([gcode_macro])",
            'macro.desc': "Verwalten, erstellen und bearbeiten Sie Makros für Druckabläufe in Mainsail.",
            'modal.preview_title': "Vorschau der generierten Klipper-Konfiguration",
            'modal.settings_title': "Einstellungen & Mainsail-Design",
            'modal.calc_title': "Rotation Distance Rechner",
            'modal.lang_title': "Sprache & Lokalisierung (Mainsail Sync)",
            'modal.theme_title': "Mainsail-Design & Farbintegration",
            'btn.add_mcu': "Zusätzliche MCU hinzufügen",
            'btn.add_fan': "Zusatzlüfter hinzufügen",
            'btn.add_led': "LED hinzufügen",
            'btn.add_macro': "Neues Makro erstellen",
            'btn.add_include': "Include-Datei hinzufügen",
            'btn.insert_macro_template': "Standardvorlagen einfügen",
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
            'modal.lang_label': 'Langue de l\'interface:',

            // Card Titles & Sections
            'card.general_params': "Paramètres Généraux Klipper",
            'card.mechanical_arch': "Architecture Mécanique (IDEX & Multi-Z)",
            'card.delta_geometry': "Géométrie Delta (Optionnel)",
            'section.axis_limits_homing': "Limites d'Axe & Configuration de Homing",
            'card.axis_x': "Axe X - Limites & Homing",
            'card.axis_dc': "Dual Carriage (Deuxième Chariot X IDEX)",
            'card.axis_y': "Axe Y - Limites & Homing",
            'card.axis_z': "Axe Z - Limites & Homing",
            'card.mcu_main': "Microcontrôleur Principal (Carte Mère)",
            'card.mcu_temp': "Surveillance Thermique Hôte & Puce",
            'card.mcu_extra': "Microcontrôleurs Secondaires & Toolhead ([mcu <nom>])",
            'card.stepper_config': "Configuration Moteur Pas-à-Pas",
            'card.stepper_dual_carriage': "Configuration Dual Carriage X2",
            'card.stepper_motor_axis': "Configuration Moteur Axe",
            'card.driver_config': "Pilote Stepper Motion",
            'card.driver_stepper_motion': "Pilote Moteur Pas-à-Pas",
            'card.extruder_mech': "Mécanique Extrudeur & Buse",
            'card.extruder_mech_primary': "Mécanique Extrudeur Principal",
            'card.extruder_mech_secondary': "Mécanique Deuxième Extrudeur IDEX",
            'card.extruder_thermal': "Chauffe Hotend & Capteur de Température",
            'card.extruder_algo': "Contrôle de Température",
            'card.extruder_driver': "Pilote d'Extrudeur",
            'card.extruder_driver_primary': "Pilote Extrudeur Principal",
            'card.extruder_driver_secondary': "Pilote Deuxième Extrudeur IDEX",
            'card.heater_bed': "Plateau Chauffant",
            'card.bed_pid': "Régulation PID du Plateau",
            'card.fans_cooling': "Ventilateurs de Refroidissement Klipper",
            'card.adxl': "Accéléromètre de Résonance ([adxl345])",
            'card.leds': "Éclairage LED & Neopixel",
            'card.core_features': "Fonctionnalités Essentielles Klipper & Mainsail",
            'card.includes': "Fichiers Inclus ([include])",
            'card.macros': "Macros G-Code Personnalisées ([gcode_macro])",
            'card.probe': "Sonde de Nivellement (Probe / BLTouch)",
            'card.safe_z_home': "Homing Sécurisé au Centre ([safe_z_home])",
            'card.z_tilt': "Alignement Moteurs Z Indépendants ([z_tilt])",
            'card.quad_gantry_level': "Alignement 4 Moteurs Z ([quad_gantry_level])",
            'card.bed_mesh': "Nivellement Maillage Plateau ([bed_mesh])",
            'card.resonance_tester': "Compensation des Résonances & Calibrage ([input_shaper] / [resonance_tester])",
            'include.title': "Fichiers Inclus ([include])",
            'include.desc': "Organisez votre configuration modulaire Klipper avec des fichiers .cfg externes.",
            'include.presets_title': "⚡ Inclure Fichiers Standards Communs",
            'macro.title': "Macros G-Code Personnalisées ([gcode_macro])",
            'macro.desc': "Gérez, créez et modifiez les macros pour la gestion d'impression dans Mainsail.",
            'modal.preview_title': "Aperçu de la Configuration Klipper Générée",
            'modal.settings_title': "Paramètres & Thème Mainsail",
            'modal.calc_title': "Calculateur Rotation Distance",
            'modal.lang_title': "Langue & Localisation (Mainsail Sync)",
            'modal.theme_title': "Intégration Thème & Couleurs Mainsail",
            'btn.add_mcu': "Ajouter un MCU secondaire",
            'btn.add_fan': "Ajouter un ventilateur",
            'btn.add_led': "Ajouter une LED",
            'btn.add_macro': "Nouvelle Macro",
            'btn.add_include': "Ajouter Fichier Include",
            'btn.insert_macro_template': "Insérer Modèles Prédéfinis",
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
            'modal.lang_label': 'Idioma de la interfaz:',

            // Card Titles & Secciones
            'card.general_params': "Parámetros Generales de Klipper",
            'card.mechanical_arch': "Arquitectura Mecánica (IDEX & Multi-Z)",
            'card.delta_geometry': "Geometría Delta (Opcional)",
            'section.axis_limits_homing': "Límites de Eje & Configuración de Homing",
            'card.axis_x': "Eje X - Límites & Homing",
            'card.axis_dc': "Dual Carriage (Segundo Carro X IDEX)",
            'card.axis_y': "Eje Y - Límites & Homing",
            'card.axis_z': "Eje Z - Límites & Homing",
            'card.mcu_main': "Microcontrolador Principal (Placa Base)",
            'card.mcu_temp': "Monitorización Térmica Host y Chip",
            'card.mcu_extra': "Microcontroladores Secundarios & Toolhead ([mcu <nombre>])",
            'card.stepper_config': "Configuración Motor Paso a Paso",
            'card.stepper_dual_carriage': "Configuración Dual Carriage X2",
            'card.stepper_motor_axis': "Configuración Motor Eje",
            'card.driver_config': "Controlador Stepper Motion",
            'card.driver_stepper_motion': "Controlador Stepper Motion",
            'card.extruder_mech': "Mecánica Extrusor & Boquilla",
            'card.extruder_mech_primary': "Mecánica Extrusor Principal",
            'card.extruder_mech_secondary': "Mecánica Segundo Extrusor IDEX",
            'card.extruder_thermal': "Calentador & Sensor de Temperatura Hotend",
            'card.extruder_algo': "Control de Temperatura",
            'card.extruder_driver': "Controlador del Extrusor",
            'card.extruder_driver_primary': "Controlador Extrusor Principal",
            'card.extruder_driver_secondary': "Controlador Segundo Extrusor IDEX",
            'card.heater_bed': "Cama Caliente",
            'card.bed_pid': "Ajuste PID de Cama",
            'card.fans_cooling': "Ventiladores de Refrigeración Klipper",
            'card.adxl': "Acelerómetro de Resonancia ([adxl345])",
            'card.leds': "Iluminación LED y Neopixel",
            'card.core_features': "Funcionalidades Esenciales Klipper y Mainsail",
            'card.includes': "Archivos Incluidos ([include])",
            'card.macros': "Macros G-Code Personalizadas ([gcode_macro])",
            'card.probe': "Sonda de Nivelación (Probe / BLTouch)",
            'card.safe_z_home': "Homing Seguro en el Centro ([safe_z_home])",
            'card.z_tilt': "Alineación Independiente Motores Z ([z_tilt])",
            'card.quad_gantry_level': "Alineación de 4 Motores Z ([quad_gantry_level])",
            'card.bed_mesh': "Nivelación de Malla de Cama ([bed_mesh])",
            'card.resonance_tester': "Compensación de Resonancias & Calibración ([input_shaper] / [resonance_tester])",
            'include.title': "Archivos Incluidos ([include])",
            'include.desc': "Organiza tu configuración modular de Klipper incluyendo archivos .cfg externos.",
            'include.presets_title': "⚡ Incluir Archivos Estándar Comunes",
            'macro.title': "Macros G-Code Personalizadas ([gcode_macro])",
            'macro.desc': "Administra, crea y edita macros para impresión en Mainsail.",
            'modal.preview_title': "Vista Previa de Configuración Klipper Generada",
            'modal.settings_title': "Ajustes y Tema Mainsail",
            'modal.calc_title': "Calculadora Rotation Distance",
            'modal.lang_title': "Idioma y Localización (Mainsail Sync)",
            'modal.theme_title': "Integración Tema y Colores Mainsail",
            'btn.add_mcu': "Añadir MCU secundaria",
            'btn.add_fan': "Añadir ventilador",
            'btn.add_led': "Añadir LED",
            'btn.add_macro': "Nueva Macro",
            'btn.add_include': "Añadir Archivo Include",
            'btn.insert_macro_template': "Insertar Plantillas Predeterminadas",
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
        translateElementText('btn-add-mcu', 'btn.add_mcu', true);
        translateElementText('btn-add-fan', 'btn.add_fan', true);
        translateElementText('btn-add-led', 'btn.add_led', true);
        translateElementText('btn-add-include', 'btn.add_include', true);
        translateElementText('btn-add-macro', 'btn.add_macro', true);
        translateElementText('btn-insert-macro-template', 'btn.insert_macro_template', true);

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
