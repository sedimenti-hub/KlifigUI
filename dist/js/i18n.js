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
        "en": {
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
                "toast.lang_set": "Language set to {lang}",
                "subtab.stepper_x": "X Axis [stepper_x]",
                "subtab.dual_carriage": "Dual Carriage X2 [dual_carriage]",
                "subtab.stepper_y": "Y Axis [stepper_y]",
                "subtab.stepper_z": "Z Axis [stepper_z]",
                "subtab.stepper_z1": "Z1 Axis [stepper_z1]",
                "subtab.stepper_z2": "Z2 Axis [stepper_z2]",
                "subtab.stepper_z3": "Z3 Axis [stepper_z3]",
                "subtab.extruder": "Extruder 0 [extruder]",
                "subtab.extruder1": "Extruder 1 IDEX [extruder1]",
                "btn.add_mcu_full": "+ Add New MCU",
                "btn.calc_rot_dist": "Rotation Distance Calculator",
                "btn.add_fan_full": "+ Add Fan",
                "btn.add_led_full": "+ Add LED",
                "btn.add_include_full": "New Include File",
                "btn.insert_macro_template_full": "Insert Default Templates",
                "btn.add_macro_full": "New Macro",
                "btn.copy_preview": "Copy to Clipboard",
                "btn.save_moonraker": "Save to Moonraker",
                "btn.save_sync": "Save & Synchronize",
                "btn.apply_calc": "Apply to Stepper",
                "btn.test_resonances": "Start Resonance Test (TEST_RESONANCES)",
                "btn.pid_calibrate": "Calibrate Hotend PID (PID_CALIBRATE)",
                "btn.bed_pid_calibrate": "Calibrate Bed PID (PID_CALIBRATE)",
                "calc.drive_type": "Transmission Type:",
                "calc.belt_lead": "Timing Belt (GT2 2mm)",
                "calc.leadscrew": "Leadscrew / Threaded Rod",
                "calc.pulley_teeth": "Pulley Tooth Count (e.g.: 16 or 20 teeth):",
                "calc.lead_pitch": "Leadscrew Pitch (Lead in mm per turn - e.g.: T8x8 = 8, T8x4 = 4):",
                "calc.result_label": "Calculated Value:",
                "modal.detected_lang": "Detected Language:",
                "modal.auto_lang_helper": "When set to Automatic, Klipper Configurator adopts the language configured in Mainsail.",
                "modal.auto_sync": "Automatic Synchronization:",
                "modal.synced": "Synchronized",
                "modal.primary_accent": "Primary Accent Color:",
                "modal.theme_mode_label": "Theme Mode:",
                "modal.dark_mode": "Dark",
                "modal.light_mode": "Light",
                "modal.preset_vendor": "Official Mainsail / Vendor Theme Presets:",
                "modal.force_light_label": "Force Light Theme (Light Theme)",
                "opt.kinematics_cartesian": "Cartesian (Ender 3, Prusa i3, Sovol)",
                "opt.kinematics_corexy": "CoreXY (Voron 2.4/Trident, RatRig, Bambu)",
                "opt.kinematics_delta": "Delta (Kossel, Flsun)",
                "opt.kinematics_corexz": "CoreXZ (Voron Switchwire)",
                "opt.kinematics_rotational_delta": "Rotational Delta",
                "opt.kinematics_winch": "Cable Winch",
                "opt.kinematics_none": "None",
                "opt.conn_serial": "USB Serial Port",
                "opt.conn_canbus": "CAN Bus Network",
                "opt.restart_arduino": "Arduino DTR (Standard)",
                "opt.restart_cheetah": "Cheetah",
                "opt.restart_command": "Software Command",
                "opt.restart_rpi_usb": "Raspberry Pi USB Power Toggle",
                "opt.spi_hardware": "Hardware SPI (spi_bus)",
                "opt.spi_software": "Software SPI (Bit-banging)",
                "opt.filter_50hz": "50Hz Frequency (Europe/230V)",
                "opt.filter_60hz": "60Hz Frequency (USA/120V)",
                "opt.median": "Median (median)",
                "opt.average": "Average (average)",
                "opt.bicubic": "Bicubic",
                "opt.lagrange": "Lagrange",
                "opt.pid": "PID (Proportional Integral Derivative)",
                "opt.watermark": "Watermark (Bang-bang hysteresis)",
                "helper.kinematics": "Specifies the kinematic motion model of the toolhead and axes.",
                "helper.enable_idex": "Enables the secondary independent <code>[dual_carriage]</code> on X axis and secondary <code>[extruder1]</code>.",
                "helper.z_motor_count": "Automatically updates available motors in the <strong>Stepper</strong> tab and leveling options in the <strong>Calibration</strong> tab (enabling <code>[z_tilt]</code> or <code>[quad_gantry_level]</code>).",
                "helper.zero_to_disable": "0 to disable",
                "helper.mcu_serial": "Unique Linux USB serial port path.",
                "helper.mcu_canbus": "12-digit CAN bus UUID identifier of the board.",
                "helper.host_temp": "Displays Raspberry Pi / Host CPU temperature in Mainsail.",
                "helper.mcu_temp": "Displays mainboard microcontroller STM32/RP2040 chip temperature.",
                "helper.stepper_rot_dist": "40 for GT2 20-tooth belts, 8.0 for T8x8 leadscrews, 4.0 for T8x4.",
                "helper.stepper_endstop": "Use '^' for internal pull-up. For sensorless: tmc2209_stepper_x:virtual_endstop",
                "helper.stepper_z_notice": "Travel limits and endstop for auxiliary Z axes (Z1, Z2, Z3) are handled by the main [stepper_z].",
                "helper.driver_uart": "UART serial communication pin for this axis.",
                "helper.driver_tx": "Optional. Specify only if the board uses separate RX and TX pins.",
                "helper.driver_address": "Optional (0-3). Used when multiple drivers share the same physical UART pin.",
                "helper.driver_cs": "Dedicated Chip Select pin for this driver.",
                "helper.driver_spi_bus": "SPI bus configured on the MCU (e.g. spi1, spi2, spi3a).",
                "helper.driver_run_current": "Typically 0.600A - 0.900A for standard NEMA17.",
                "helper.driver_hold_current": "Reduced current at standstill. Prevents overheating. If disabled, Klipper maintains run_current constant.",
                "helper.driver_sense_resistor": "Klipper default: 0.110 Ω for TMC2209/2208/2226, 0.075 Ω for TMC5160. Enable only if board uses non-standard resistor.",
                "helper.driver_stallguard": "TMC2209/2240: 0-255 (higher = more sensitive). TMC5160: -64 to 63 (lower = more sensitive).",
                "helper.pressure_advance": "Typically 0.02 - 0.06 for Direct Drive, 0.3 - 0.8 for Bowden.",
                "helper.extruder_sensor_spi": "E.g.: spi1, spi2, spi3a, etc.",
                "helper.extruder_sensor_speed": "Klipper default: 4000000 (4 MHz).",
                "helper.extruder_rtd_nominal": "100 Ω for standard PT100, 1000 Ω for PT1000.",
                "helper.extruder_rtd_reference": "430 Ω for PT100 boards, 4300 Ω for PT1000 boards.",
                "helper.extruder_rtd_wires": "Number of physical conductors connected to the RTD probe.",
                "helper.extruder_rtd_filter": "Filters electrical mains line noise oscillations.",
                "helper.extruder_control": "Select PID to maintain precise, steady hotend temperature.",
                "helper.extruder_max_delta": "Klipper default: 2.0°C. Heater turns off when exceeding target temperature + max_delta.",
                "helper.extruder_current": "Typically 0.500A - 0.700A for pancake / compact extruder motors (e.g. Orbiter, Stealthburner, BMG).",
                "helper.extruder_hold_current_warn": "Standstill current. NOTE: On extruders, setting this too low is discouraged to prevent skipped steps upon resuming extrusion.",
                "helper.bed_max_delta": "Klipper default: 2.0°C. Shuts off bed when exceeding target temperature + max_delta.",
                "helper.bed_pid_tip": "Tip: To calibrate bed PID from Mainsail console send: <code>PID_CALIBRATE HEATER=heater_bed TARGET=60</code>",
                "helper.fan_part": "Controlled by slicer via M106 / M107 commands.",
                "helper.adxl_cs": "E.g.: rpi:None if connected to Raspberry Pi, or MCU SPI CS pin.",
                "helper.adxl_spi_bus": "E.g.: spidev0.0 (on Raspberry Pi) or spi1/spi2 (on MCU).",
                "helper.adxl_axes_map": "E.g.: x, y, z or x, -z, y to match sensor mounting orientation.",
                "helper.adxl_rate": "Recommended Klipper default: 3200 Hz.",
                "helper.idle_timeout": "1800 seconds = 30 minutes of inactivity.",
                "helper.z_tilt_positions": "Physical pivot coordinates of Z motors (one per line or comma-separated).",
                "helper.z_tilt_points": "Bed coordinates where the probe will measure tilt.",
                "helper.res_accel_chip": "Name of the accelerometer chip defined in config (e.g. adxl345).",
                "helper.res_probe_points": "Physical bed test coordinates (e.g. bed center: 100, 100, 20).",
                "helper.res_accel_per_hz": "Recommended Klipper default: 75.",
                "helper.res_max_smoothing": "Leave empty for automatic optimal shaper calculation.",
                "helper.calib_z_offset": "Trigger height between nozzle and bed probe (synchronized with Probe value).",
                "tab.kinematics_label": "1. Kinematics",
                "tab.host_mcu_label": "2. Host/MCU",
                "tab.stepper_label": "3. Stepper Motion",
                "tab.extruder_label": "4. Extruder",
                "tab.bed_label": "5. Bed",
                "tab.misc_label": "6. Miscellaneous",
                "tab.include_label": "7. Include",
                "tab.macro_label": "8. Macro",
                "tab.calibration_label": "9. Calibration",
                "mcu.empty_notice": "No secondary microcontrollers configured.",
                "mcu.btn_add_first": "+ Add your first secondary MCU (e.g. toolhead, rpi, can0)",
                "mcu.tag_secondary": "Secondary MCU",
                "mcu.name_label": "MCU Name (Section [mcu <name>]):",
                "btn.delete_mcu": "Delete MCU",
                "fan.empty_notice": "No additional auxiliary fans configured.",
                "fan.btn_add_first": "+ Add an auxiliary fan (e.g. hotend heatsink, electronics box, chamber)",
                "fan.tag_fan": "Auxiliary Fan",
                "btn.delete_fan": "Delete Fan",
                "led.empty_notice": "No LED strips configured.",
                "led.btn_add_first": "+ Add your first LED strip (e.g. stealthburner, neopixel)",
                "led.tag_led": "LED Strip",
                "btn.delete_led": "Delete LED",
                "include.empty_notice": "No include files configured.",
                "btn.delete_include": "Delete Include",
                "macro.empty_notice": "No custom macros configured.",
                "btn.delete_macro": "Delete Macro",
                "idex.enable_label": "Enable IDEX System (Dual Carriage / Dual X Carriage)",
                "helper.extruder_driver_uart": "UART serial communication pin for the extruder.",
                "helper.extruder_driver_cs": "Dedicated CS pin for the extruder driver.",
                "opt.kinematics_hybrid_corexy": "Hybrid CoreXY (IDEX CoreXY)",
                "opt.kinematics_rotary_delta": "Rotary Delta",
                "opt.kinematics_polar": "Polar",
                "opt.z_motor_1": "1 Z Motor (Standard single axis [stepper_z])",
                "opt.z_motor_2": "2 Z Motors (Dual Z: [stepper_z], [stepper_z1])",
                "opt.z_motor_3": "3 Z Motors (Triple Z: [stepper_z], [stepper_z1], [stepper_z2] - e.g. Trident)",
                "opt.z_motor_4": "4 Z Motors (Quad Z: [stepper_z], [stepper_z1], [stepper_z2], [stepper_z3] - e.g. Voron 2.4)",
                "opt.conn_usb_serial": "USB / Serial (/dev/serial/by-id/...)",
                "opt.conn_canbus_uuid": "CAN Bus (canbus_uuid)",
                "opt.conn_uart_gpio": "UART GPIO (/dev/ttyAMA0 or /dev/ttyS0)",
                "opt.baud_250k": "250000 (Standard)",
                "opt.restart_cmd_default": "command (Default)",
                "opt.microsteps_16": "16 (Standard recommended)",
                "opt.steps_200": "200 steps (1.8° standard motor)",
                "opt.steps_400": "400 steps (0.9° high precision motor)",
                "opt.driver_generic": "A4988 / Generic (Standalone)",
                "opt.driver_uart": "UART (1/2 pin Serial - TMC2209 / TMC2208 / etc.)",
                "opt.driver_spi": "SPI (SPI Bus - TMC5160 / TMC2130 / etc.)",
                "opt.driver_standalone": "Standalone (No data bus / A4988 / Jumpers)",
                "opt.driver_hw_spi": "Hardware SPI (MCU Bus)",
                "opt.stealthchop_silent": "Silent (StealthChop active)",
                "opt.spreadcycle_torque": "SpreadCycle (Higher torque / Fewer lost steps)",
                "opt.spreadcycle_extruder": "SpreadCycle (Recommended for extruder - More torque & precision)",
                "opt.filament_175": "1.75 mm (Standard)",
                "opt.therm_epcos": "EPCOS 100K B57560G104F (Creality / Stock)",
                "opt.therm_epcos_std": "EPCOS 100K B57560G104F (Creality / Standard)",
                "opt.therm_generic_3950": "Generic 3950 (Common / Voron)",
                "opt.therm_generic_3950_voron": "Generic 3950 (Common on Voron)",
                "opt.therm_atc_semitec": "ATC Semitec 104GT-2 (E3D V6 / Prusa)",
                "opt.therm_atc_revo": "ATC Semitec 104NT (E3D Revo)",
                "opt.therm_pt1000": "PT1000 (2-wire analog on 4.7K pullup)",
                "opt.therm_max31865": "MAX31865 (SPI RTD Amplifier PT100/PT1000)",
                "opt.therm_max6675": "MAX6675 (Type K SPI Thermocouple)",
                "opt.therm_max31855": "MAX31855 (SPI Thermocouple)",
                "opt.therm_max31856": "MAX31856 (Advanced SPI Thermocouple)",
                "opt.rtd_100": "100 Ω (PT100 probe)",
                "opt.rtd_1000": "1000 Ω (PT1000 probe)",
                "opt.wires_2": "2 wires",
                "opt.wires_3": "3 wires",
                "opt.wires_4": "4 wires (Maximum accuracy)",
                "opt.filter_50hz_mains": "50 Hz (Mains Frequency Europe/230V)",
                "opt.filter_60hz_mains": "60 Hz (Mains Frequency USA/120V)",
                "opt.ctrl_pid_cont": "PID (Continuous Proportional-Integral-Derivative)",
                "opt.ctrl_watermark_hyst": "Watermark (Bang-bang hysteresis on/off)",
                "opt.ctrl_pid_precise": "PID (Precise continuous control)",
                "opt.ctrl_watermark_simple": "Watermark (Simple bang-bang on/off)",
                "opt.probe_none": "No Probe (Standard Mechanical Z Endstop)",
                "opt.probe_bltouch": "BLTouch / 3DTouch / CR Touch ([bltouch])",
                "opt.probe_inductive": "Inductive Probe / Microswitch / Klipper Tap ([probe])",
                "opt.sample_1": "1 sample",
                "opt.sample_2": "2 samples (recommended)",
                "opt.sample_3": "3 samples (maximum precision)",
                "opt.sample_median": "median (Median)",
                "opt.sample_average": "average (Average)",
                "opt.mesh_3x3": "3x3 (9 points - fast)",
                "opt.mesh_5x5": "5x5 (25 points - standard)",
                "opt.mesh_7x7": "7x7 (49 points - high density)",
                "opt.mesh_bicubic": "bicubic (Smooth curve)",
                "opt.shaper_mzv": "mzv (Recommended)",
                "opt.lang_auto": "Automatic (Sync with Mainsail)",
                "notice.homing_zero": "ℹ️ <strong>Note:</strong> Homing parameters set to <code>0</code> are omitted from the configuration file to keep Klipper's internal defaults active.",
                "subtitle.homing_x": "X Axis Homing Parameters",
                "subtitle.homing_dc": "Dual Carriage Homing Parameters",
                "subtitle.homing_y": "Y Axis Homing Parameters",
                "subtitle.homing_z": "Z Axis Homing Parameters",
                "subtitle.mcu_extra_desc": "Manage auxiliary expansion boards (CAN bus toolhead EBB/SB2209, Raspberry Pi GPIO, expanders).",
                "subtitle.spi_sensor": "🔌 Sensor SPI Bus Communication Parameters",
                "subtitle.rtd_sensor": "🌡️ RTD Sensor Parameters (MAX31865)",
                "subtitle.fan_part": "💨 Main Part Cooling Fan ([fan])",
                "subtitle.res_tester": "📊 Automatic Resonance Tester ([resonance_tester])",
                "subtitle.probe_z_offset": "📏 Probe Z-Offset Calibration ([probe] / [bltouch])",
                "chk.host_temp": "Enable Raspberry Pi / Host CPU Temperature Sensor",
                "chk.mcu_temp": "Enable Motherboard Microcontroller (MCU) Temperature Sensor",
                "chk.standalone_mode": "Standalone Mode:",
                "chk.hold_current": "Enable Motor Hold Current (hold_current)",
                "chk.sense_resistor": "Specify Sense Resistor Value (sense_resistor)",
                "chk.interpolate": "256 Microstep Interpolation (interpolate: True)",
                "chk.sensorless": "Sensorless Homing (Virtual Endstop)",
                "chk.adxl": "Enable ADXL345 Accelerometer (Toolhead/Bed resonance measurement)",
                "chk.virtual_sd": "[virtual_sdcard] - Enable printing G-Code files from Moonraker",
                "chk.pause_resume": "[pause_resume] - Enable Native Pause and Resume Commands",
                "chk.display_status": "[display_status] - Enable Status and Progress Updates",
                "chk.respond": "[respond] - Enable Console Messages and M118 Responses",
                "chk.safe_z_home": "Enable Safe Z Home (Home Z in bed center)",
                "chk.input_shaper": "Enable Input Shaper Filter (Eliminate Ghosting / Ringing)",
                "chk.resonance_tester": "Enable Resonance Tester Section (Automated resonance sweep with accelerometer)",
                "tag.hardware_layout": "Hardware Layout",
                "tag.thermal_sensors": "Thermal Sensors",
                "tag.hotend_thermal": "Hotend Thermal",
                "tag.pid_control": "PID Control",
                "tag.leveling_sensor": "Leveling Sensor",
                "tag.resonances_z_offset": "Resonances & Z-Offset",
                "tag.core_features": "Core Features",
                "tag.delta_geometry": "Delta Geometry"
        },
        "it": {
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
                "toast.lang_set": "Lingua impostata su {lang}",
                "subtab.stepper_x": "Asse X [stepper_x]",
                "subtab.dual_carriage": "Dual Carriage X2 [dual_carriage]",
                "subtab.stepper_y": "Asse Y [stepper_y]",
                "subtab.stepper_z": "Asse Z [stepper_z]",
                "subtab.stepper_z1": "Asse Z1 [stepper_z1]",
                "subtab.stepper_z2": "Asse Z2 [stepper_z2]",
                "subtab.stepper_z3": "Asse Z3 [stepper_z3]",
                "subtab.extruder": "Estrusore 0 [extruder]",
                "subtab.extruder1": "Estrusore 1 IDEX [extruder1]",
                "btn.add_mcu_full": "+ Aggiungi Nuovo MCU",
                "btn.calc_rot_dist": "Calcolatore Passi & Cinghie",
                "btn.add_fan_full": "+ Aggiungi Ventola",
                "btn.add_led_full": "+ Aggiungi LED",
                "btn.add_include_full": "Nuovo File Include",
                "btn.insert_macro_template_full": "Inserisci Template Predefiniti",
                "btn.add_macro_full": "Nuova Macro",
                "btn.copy_preview": "Copia negli Appunti",
                "btn.save_moonraker": "Salva su Moonraker",
                "btn.save_sync": "Salva & Sincronizza",
                "btn.apply_calc": "Applica a Stepper",
                "btn.test_resonances": "Avvia Test Risonanze (TEST_RESONANCES)",
                "btn.pid_calibrate": "Calibra PID Hotend (PID_CALIBRATE)",
                "btn.bed_pid_calibrate": "Calibra PID Piatto (PID_CALIBRATE)",
                "calc.drive_type": "Tipo di Trasmissione:",
                "calc.belt_lead": "Cinghia Dentata (GT2 2mm)",
                "calc.leadscrew": "Barra Filettata / Vite Trapezia",
                "calc.pulley_teeth": "Numero Denti Puleggia (es: 16 o 20 denti):",
                "calc.lead_pitch": "Passo Barra (Lead in mm per giro - es: T8x8 = 8, T8x4 = 4):",
                "calc.result_label": "Valore Calcolato:",
                "modal.detected_lang": "Lingua Rilevata:",
                "modal.auto_lang_helper": "Se impostato su Automatica, Klipper Configurator rileva e adotta la stessa lingua usata in Mainsail.",
                "modal.auto_sync": "Sincronizzazione Automatica:",
                "modal.synced": "Sincronizzato",
                "modal.primary_accent": "Colore Primario Accento:",
                "modal.theme_mode_label": "Modalità Tema:",
                "modal.dark_mode": "Scuro (Dark)",
                "modal.light_mode": "Chiaro (Light)",
                "modal.preset_vendor": "Preset Temi Ufficiali Mainsail / Vendor:",
                "modal.force_light_label": "Forza Modalità Chiara (Light Theme)",
                "opt.kinematics_cartesian": "Cartesiana (Ender 3, Prusa i3, Sovol)",
                "opt.kinematics_corexy": "CoreXY (Voron 2.4/Trident, RatRig, Bambu)",
                "opt.kinematics_delta": "Delta (Kossel, Flsun)",
                "opt.kinematics_corexz": "CoreXZ (Voron Switchwire)",
                "opt.kinematics_rotational_delta": "Rotational Delta",
                "opt.kinematics_winch": "Winch a Cavi",
                "opt.kinematics_none": "Nessuna",
                "opt.conn_serial": "Porta Seriale USB",
                "opt.conn_canbus": "Rete CAN Bus",
                "opt.restart_arduino": "Arduino DTR (Standard)",
                "opt.restart_cheetah": "Cheetah",
                "opt.restart_command": "Comando Software",
                "opt.restart_rpi_usb": "Disalimentazione USB Raspberry Pi",
                "opt.spi_hardware": "Hardware SPI (spi_bus)",
                "opt.spi_software": "Software SPI (Bit-banging)",
                "opt.filter_50hz": "Frequenza 50Hz (Europa/230V)",
                "opt.filter_60hz": "Frequenza 60Hz (USA/120V)",
                "opt.median": "Mediana (median)",
                "opt.average": "Media (average)",
                "opt.bicubic": "Bicubica (bicubic)",
                "opt.lagrange": "Lagrange",
                "opt.pid": "PID (Proportional Integral Derivative)",
                "opt.watermark": "Watermark (Isteresi Bang-bang)",
                "helper.kinematics": "Specifica il modello cinematico della testina e degli assi.",
                "helper.enable_idex": "Abilita il secondo carrello <code>[dual_carriage]</code> indipendente sull'asse X e il secondo estrusore <code>[extruder1]</code>.",
                "helper.z_motor_count": "Modifica automaticamente i motori disponibili nella scheda <strong>Stepper</strong> e aggiorna le opzioni di livellamento nella scheda <strong>Calibration</strong> (abilitando <code>[z_tilt]</code> o <code>[quad_gantry_level]</code>).",
                "helper.zero_to_disable": "0 per disabilitare",
                "helper.mcu_serial": "Percorso identificativo univoco della porta seriale USB.",
                "helper.mcu_canbus": "Indirizzo a 12 cifre della scheda su bus CAN.",
                "helper.host_temp": "Visualizza la temperatura della CPU del Raspberry in Mainsail.",
                "helper.mcu_temp": "Visualizza la temperatura del microcontrollore STM32/RP2040.",
                "helper.stepper_rot_dist": "40 per cinghie GT2 a 20 denti, 8.0 per barra trapezia T8x8, 4.0 per T8x4.",
                "helper.stepper_endstop": "Usa '^' per pull-up interno. Per sensorless homing: tmc2209_stepper_x:virtual_endstop",
                "helper.stepper_z_notice": "I limiti di corsa ed endstop per gli assi Z ausiliari (Z1, Z2, Z3) sono gestiti centralmente dall'asse principale [stepper_z].",
                "helper.driver_uart": "Pin di comunicazione seriale UART per questo asse.",
                "helper.driver_tx": "Opzionale. Da specificare solo se la board usa pin RX e TX separati.",
                "helper.driver_address": "Opzionale (0-3). Usato quando più driver condividono lo stesso pin UART.",
                "helper.driver_cs": "Pin CS dedicato a questo driver.",
                "helper.driver_spi_bus": "Bus SPI configurato sulla MCU (es. spi1, spi2, spi3a).",
                "helper.driver_run_current": "Tipicamente 0.600A - 0.900A per NEMA17 standard.",
                "helper.driver_hold_current": "Corrente ridotta a motore fermo. Evita surriscaldamenti. Se non abilitato, Klipper mantiene run_current costante.",
                "helper.driver_sense_resistor": "Default di Klipper: 0.110 Ω per TMC2209/2208/2226, 0.075 Ω per TMC5160. Attiva solo se la tua scheda usa un resistore non standard.",
                "helper.driver_stallguard": "TMC2209/2240: 0-255 (più alto = più sensibile). TMC5160: -64 a 63 (più basso = più sensibile).",
                "helper.pressure_advance": "Tipicamente 0.02 - 0.06 per Direct Drive, 0.3 - 0.8 per Bowden.",
                "helper.extruder_sensor_spi": "Es: spi1, spi2, spi3a, ecc.",
                "helper.extruder_sensor_speed": "Default di Klipper: 4000000 (4 MHz).",
                "helper.extruder_rtd_nominal": "100 Ω per PT100 standard, 1000 Ω per PT1000.",
                "helper.extruder_rtd_reference": "430 Ω per board PT100 (Adafruit/BTT), 4300 Ω per board PT1000.",
                "helper.extruder_rtd_wires": "Numero di conduttori fisici della sonda RTD.",
                "helper.extruder_rtd_filter": "Filtra le oscillazioni introdotte dalla linea elettrica.",
                "helper.extruder_control": "Seleziona PID per mantenere una temperatura costante e precisa sull'hotend.",
                "helper.extruder_max_delta": "Default di Klipper: 2.0°C. Il riscaldatore viene disattivato quando supera la temperatura target + max_delta.",
                "helper.extruder_current": "Tipicamente 0.500A - 0.700A per motori pancake / mini estrusori (es. Orbiter, Stealthburner, BMG).",
                "helper.extruder_hold_current_warn": "Corrente ridotta a motore fermo. NOTA: Sugli estrusori è generalmente sconsigliato impostare valori troppo bassi per evitare perdite di passi alla ripresa dell'estrusione.",
                "helper.bed_max_delta": "Default di Klipper: 2.0°C. Spegne il piatto quando supera la temperatura target + max_delta.",
                "helper.bed_pid_tip": "Suggerimento: Per calibrare il PID del piatto da console Mainsail invia: <code>PID_CALIBRATE HEATER=heater_bed TARGET=60</code>",
                "helper.fan_part": "Controllata dallo slicer tramite comandi M106 / M107.",
                "helper.adxl_cs": "Es: rpi:None se collegato al Raspberry, oppure un pin SPI CS della MCU.",
                "helper.adxl_spi_bus": "Es: spidev0.0 (su Raspberry Pi) o spi1/spi2 (su MCU).",
                "helper.adxl_axes_map": "Es: x, y, z oppure x, -z, y per orientare correttamente il sensore.",
                "helper.adxl_rate": "Default consigliato da Klipper: 3200 Hz.",
                "helper.idle_timeout": "1800 secondi = 30 minuti di inattività.",
                "helper.z_tilt_positions": "Coordinate fisiche dei perni dei motori Z (una per riga o separate da virgola).",
                "helper.z_tilt_points": "Coordinate del piatto dove la sonda misurerà l'inclinazione.",
                "helper.res_accel_chip": "Nome del sensore accelerometro definito nel file (es. adxl345).",
                "helper.res_probe_points": "Coordinate fisiche del piatto (es. centro piatto: 100, 100, 20).",
                "helper.res_accel_per_hz": "Default consigliato da Klipper: 75.",
                "helper.res_max_smoothing": "Lascia vuoto per il valore automatico calcolato da Klipper.",
                "helper.calib_z_offset": "Distanza di trigger Z tra la sonda e l'ugello (sincronizzato con il valore Sonda).",
                "tab.kinematics_label": "1. Cinematica",
                "tab.host_mcu_label": "2. Host/MCU",
                "tab.stepper_label": "3. Stepper Motion",
                "tab.extruder_label": "4. Extruder",
                "tab.bed_label": "5. Bed",
                "tab.misc_label": "6. Misceleus",
                "tab.include_label": "7. Include",
                "tab.macro_label": "8. Macro",
                "tab.calibration_label": "9. Calibration",
                "mcu.empty_notice": "Nessun microcontrollore secondario configurato.",
                "mcu.btn_add_first": "+ Aggiungi il tuo primo MCU secondario (es. toolhead, rpi, can0)",
                "mcu.tag_secondary": "MCU Secondario",
                "mcu.name_label": "Nome MCU (Sezione [mcu <nome>]):",
                "btn.delete_mcu": "Elimina MCU",
                "fan.empty_notice": "Nessuna ventola ausiliaria aggiuntiva configurata.",
                "fan.btn_add_first": "+ Aggiungi una ventola ausiliaria (es. dissipatore hotend, box elettronica, camera)",
                "fan.tag_fan": "Ventola Ausiliaria",
                "btn.delete_fan": "Elimina Ventola",
                "led.empty_notice": "Nessuna striscia LED configurata.",
                "led.btn_add_first": "+ Aggiungi la tua prima striscia LED (es. stealthburner, neopixel)",
                "led.tag_led": "Striscia LED",
                "btn.delete_led": "Elimina LED",
                "include.empty_notice": "Nessun file include configurato.",
                "btn.delete_include": "Elimina Include",
                "macro.empty_notice": "Nessuna macro personalizzata configurata.",
                "btn.delete_macro": "Elimina Macro",
                "idex.enable_label": "Abilita Sistema IDEX (Dual Carriage / Doppio Carrello X)",
                "helper.extruder_driver_uart": "Pin di comunicazione seriale UART per l'estrusore.",
                "helper.extruder_driver_cs": "Pin CS dedicato al driver dell'estrusore.",
                "opt.kinematics_hybrid_corexy": "Hybrid CoreXY (IDEX CoreXY)",
                "opt.kinematics_rotary_delta": "Rotary Delta",
                "opt.kinematics_polar": "Polare",
                "opt.z_motor_1": "1 Motore Z (Standard singolo asse [stepper_z])",
                "opt.z_motor_2": "2 Motori Z (Dual Z: [stepper_z], [stepper_z1])",
                "opt.z_motor_3": "3 Motori Z (Triple Z: [stepper_z], [stepper_z1], [stepper_z2] - es. Trident)",
                "opt.z_motor_4": "4 Motori Z (Quad Z: [stepper_z], [stepper_z1], [stepper_z2], [stepper_z3] - es. Voron 2.4)",
                "opt.conn_usb_serial": "USB / Seriale (/dev/serial/by-id/...)",
                "opt.conn_canbus_uuid": "CAN Bus (canbus_uuid)",
                "opt.conn_uart_gpio": "UART GPIO (/dev/ttyAMA0 o /dev/ttyS0)",
                "opt.baud_250k": "250000 (Standard)",
                "opt.restart_cmd_default": "command (Predefinito)",
                "opt.microsteps_16": "16 (Standard consigliato)",
                "opt.steps_200": "200 passi (Motore 1.8° standard)",
                "opt.steps_400": "400 passi (Motore 0.9° alta precisione)",
                "opt.driver_generic": "A4988 / Generico (Standalone)",
                "opt.driver_uart": "UART (Seriale 1/2 pin - TMC2209 / TMC2208 / ecc.)",
                "opt.driver_spi": "SPI (Bus SPI - TMC5160 / TMC2130 / ecc.)",
                "opt.driver_standalone": "Standalone (Nessun bus dati / A4988 / Ponticelli)",
                "opt.driver_hw_spi": "Hardware SPI (Bus MCU)",
                "opt.stealthchop_silent": "Silenziosa (StealthChop attivo)",
                "opt.spreadcycle_torque": "SpreadCycle (Più coppia / Meno passi persi)",
                "opt.spreadcycle_extruder": "SpreadCycle (Consigliato per estrusore - Più coppia e precisione)",
                "opt.filament_175": "1.75 mm (Standard)",
                "opt.therm_epcos": "EPCOS 100K B57560G104F (Creality / Stock)",
                "opt.therm_epcos_std": "EPCOS 100K B57560G104F (Creality / Standard)",
                "opt.therm_generic_3950": "Generic 3950 (Molto comune / Voron)",
                "opt.therm_generic_3950_voron": "Generic 3950 (Molto comune su Voron)",
                "opt.therm_atc_semitec": "ATC Semitec 104GT-2 (E3D V6 / Prusa)",
                "opt.therm_atc_revo": "ATC Semitec 104NT (E3D Revo)",
                "opt.therm_pt1000": "PT1000 (Analogico a 2 fili su pullup 4.7K)",
                "opt.therm_max31865": "MAX31865 (Amplificatore SPI RTD PT100/PT1000)",
                "opt.therm_max6675": "MAX6675 (Termocoppia Tipo K SPI)",
                "opt.therm_max31855": "MAX31855 (Termocoppia SPI)",
                "opt.therm_max31856": "MAX31856 (Termocoppia SPI avanzata)",
                "opt.rtd_100": "100 Ω (Sonda PT100)",
                "opt.rtd_1000": "1000 Ω (Sonda PT1000)",
                "opt.wires_2": "2 fili",
                "opt.wires_3": "3 fili",
                "opt.wires_4": "4 fili (Massima accuratezza)",
                "opt.filter_50hz_mains": "50 Hz (Frequenza Rete Elettrica Italia / Europa)",
                "opt.filter_60hz_mains": "60 Hz (Frequenza Rete USA / America)",
                "opt.ctrl_pid_cont": "PID (Regolazione continua proporzionale-integrale-derivativa)",
                "opt.ctrl_watermark_hyst": "Watermark (Controllo isteresi bang-bang on/off)",
                "opt.ctrl_pid_precise": "PID (Regolazione continua precisa)",
                "opt.ctrl_watermark_simple": "Watermark (Bang-bang semplice on/off)",
                "opt.probe_none": "Nessuna Sonda (Endstop Z Meccanico Standard)",
                "opt.probe_bltouch": "BLTouch / 3DTouch / CR Touch ([bltouch])",
                "opt.probe_inductive": "Sonda Induttiva / Microswitch / Klipper Tap ([probe])",
                "opt.sample_1": "1 lettura",
                "opt.sample_2": "2 letture (consigliato)",
                "opt.sample_3": "3 letture (massima precisione)",
                "opt.sample_median": "median (Mediana)",
                "opt.sample_average": "average (Media)",
                "opt.mesh_3x3": "3x3 (9 punti - veloce)",
                "opt.mesh_5x5": "5x5 (25 punti - standard)",
                "opt.mesh_7x7": "7x7 (49 punti - alta densità)",
                "opt.mesh_bicubic": "bicubic (Curva fluida)",
                "opt.shaper_mzv": "mzv (Consigliato)",
                "opt.lang_auto": "Automatica (Sincronizza con Mainsail)",
                "notice.homing_zero": "ℹ️ <strong>Nota:</strong> I parametri di homing impostati a <code>0</code> vengono omessi dal file di configurazione per lasciare attivi i default interni di Klipper.",
                "subtitle.homing_x": "Parametri Homing Asse X",
                "subtitle.homing_dc": "Parametri Homing Dual Carriage",
                "subtitle.homing_y": "Parametri Homing Asse Y",
                "subtitle.homing_z": "Parametri Homing Asse Z",
                "subtitle.mcu_extra_desc": "Gestisci schede ausiliarie (CAN bus toolhead EBB/SB2209, Raspberry Pi GPIO, expander).",
                "subtitle.spi_sensor": "🔌 Parametri Comunicazione Bus SPI Sensore",
                "subtitle.rtd_sensor": "🌡️ Parametri Sensore RTD (MAX31865)",
                "subtitle.fan_part": "💨 Ventola Raffreddamento Pezzo Principale ([fan])",
                "subtitle.res_tester": "📊 Resonance Tester Automatico ([resonance_tester])",
                "subtitle.probe_z_offset": "📏 Regolazione Z-Offset Sonda ([probe] / [bltouch])",
                "chk.host_temp": "Abilita Sensore Temperatura Raspberry Pi / Host",
                "chk.mcu_temp": "Abilita Sensore Temperatura Chip Scheda Madre (MCU)",
                "chk.standalone_mode": "Modalità Standalone:",
                "chk.hold_current": "Abilita Corrente di Mantenimento (hold_current)",
                "chk.sense_resistor": "Specifica Valore Resistenza di Sense (sense_resistor)",
                "chk.interpolate": "Interpolazione a 256 microstep (interpolate: True)",
                "chk.sensorless": "Homing Senza Finecorsa Fisico (Sensorless Homing)",
                "chk.adxl": "Abilita Accelerometro ADXL345 (Misurazione risonanze testa/piatto)",
                "chk.virtual_sd": "[virtual_sdcard] - Abilita stampa file gcode da Moonraker",
                "chk.pause_resume": "[pause_resume] - Abilita comandi di Pausa e Ripresa",
                "chk.display_status": "[display_status] - Abilita aggiornamento stato e percentuali",
                "chk.respond": "[respond] - Abilita messaggi e comandi M118 nella console",
                "chk.safe_z_home": "Abilita Safe Z Home (Homing Z al centro del piatto)",
                "chk.input_shaper": "Abilita Filtro Input Shaper (Elimina il Ghosting / Ringing)",
                "chk.resonance_tester": "Abilita Sezione Resonance Tester (Test automatico risonanze con accelerometro)",
                "tag.hardware_layout": "Hardware Layout",
                "tag.thermal_sensors": "Sensori Termici",
                "tag.hotend_thermal": "Termica Hotend",
                "tag.pid_control": "Controllo PID",
                "tag.leveling_sensor": "Sensore Livellamento",
                "tag.resonances_z_offset": "Risonanze & Z-Offset",
                "tag.core_features": "Funzioni Principali",
                "tag.delta_geometry": "Geometria Delta"
        },
        "de": {
                "nav.settings": "Settings",
                "nav.unsaved_single": "1 ungespeicherte Änderung",
                "nav.unsaved_plural": "{n} ungespeicherte Änderungen",
                "nav.reload": "Reload",
                "nav.preview": "Preview",
                "nav.download": "Download",
                "nav.save": "Save",
                "nav.save_restart": "Save & Restart",
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
                "toast.lang_set": "Sprache auf {lang} geändert",
                "subtab.stepper_x": "X Axis [stepper_x]",
                "subtab.dual_carriage": "Dual Carriage X2 [dual_carriage]",
                "subtab.stepper_y": "Y Axis [stepper_y]",
                "subtab.stepper_z": "Z Axis [stepper_z]",
                "subtab.stepper_z1": "Z1 Axis [stepper_z1]",
                "subtab.stepper_z2": "Z2 Axis [stepper_z2]",
                "subtab.stepper_z3": "Z3 Axis [stepper_z3]",
                "subtab.extruder": "Extruder 0 [extruder]",
                "subtab.extruder1": "Extruder 1 IDEX [extruder1]",
                "btn.add_mcu_full": "+ Add New MCU",
                "btn.calc_rot_dist": "Rotation Distance Calculator",
                "btn.add_fan_full": "+ Add Fan",
                "btn.add_led_full": "+ Add LED",
                "btn.add_include_full": "New Include File",
                "btn.insert_macro_template_full": "Insert Default Templates",
                "btn.add_macro_full": "New Macro",
                "btn.copy_preview": "Copy to Clipboard",
                "btn.save_moonraker": "Save to Moonraker",
                "btn.save_sync": "Save & Synchronize",
                "btn.apply_calc": "Apply to Stepper",
                "btn.test_resonances": "Start Resonance Test (TEST_RESONANCES)",
                "btn.pid_calibrate": "Calibrate Hotend PID (PID_CALIBRATE)",
                "btn.bed_pid_calibrate": "Calibrate Bed PID (PID_CALIBRATE)",
                "calc.drive_type": "Transmission Type:",
                "calc.belt_lead": "Timing Belt (GT2 2mm)",
                "calc.leadscrew": "Leadscrew / Threaded Rod",
                "calc.pulley_teeth": "Pulley Tooth Count (e.g.: 16 or 20 teeth):",
                "calc.lead_pitch": "Leadscrew Pitch (Lead in mm per turn - e.g.: T8x8 = 8, T8x4 = 4):",
                "calc.result_label": "Calculated Value:",
                "modal.detected_lang": "Detected Language:",
                "modal.auto_lang_helper": "When set to Automatic, Klipper Configurator adopts the language configured in Mainsail.",
                "modal.auto_sync": "Automatic Synchronization:",
                "modal.synced": "Synchronized",
                "modal.primary_accent": "Primary Accent Color:",
                "modal.theme_mode_label": "Theme Mode:",
                "modal.dark_mode": "Dark",
                "modal.light_mode": "Light",
                "modal.preset_vendor": "Official Mainsail / Vendor Theme Presets:",
                "modal.force_light_label": "Force Light Theme (Light Theme)",
                "opt.kinematics_cartesian": "Cartesian (Ender 3, Prusa i3, Sovol)",
                "opt.kinematics_corexy": "CoreXY (Voron 2.4/Trident, RatRig, Bambu)",
                "opt.kinematics_delta": "Delta (Kossel, Flsun)",
                "opt.kinematics_corexz": "CoreXZ (Voron Switchwire)",
                "opt.kinematics_rotational_delta": "Rotational Delta",
                "opt.kinematics_winch": "Cable Winch",
                "opt.kinematics_none": "None",
                "opt.conn_serial": "USB Serial Port",
                "opt.conn_canbus": "CAN Bus Network",
                "opt.restart_arduino": "Arduino DTR (Standard)",
                "opt.restart_cheetah": "Cheetah",
                "opt.restart_command": "Software Command",
                "opt.restart_rpi_usb": "Raspberry Pi USB Power Toggle",
                "opt.spi_hardware": "Hardware SPI (spi_bus)",
                "opt.spi_software": "Software SPI (Bit-banging)",
                "opt.filter_50hz": "50Hz Frequency (Europe/230V)",
                "opt.filter_60hz": "60Hz Frequency (USA/120V)",
                "opt.median": "Median (median)",
                "opt.average": "Average (average)",
                "opt.bicubic": "Bicubic",
                "opt.lagrange": "Lagrange",
                "opt.pid": "PID (Proportional Integral Derivative)",
                "opt.watermark": "Watermark (Bang-bang hysteresis)",
                "helper.kinematics": "Specifies the kinematic motion model of the toolhead and axes.",
                "helper.enable_idex": "Enables the secondary independent <code>[dual_carriage]</code> on X axis and secondary <code>[extruder1]</code>.",
                "helper.z_motor_count": "Automatically updates available motors in the <strong>Stepper</strong> tab and leveling options in the <strong>Calibration</strong> tab (enabling <code>[z_tilt]</code> or <code>[quad_gantry_level]</code>).",
                "helper.zero_to_disable": "0 to disable",
                "helper.mcu_serial": "Unique Linux USB serial port path.",
                "helper.mcu_canbus": "12-digit CAN bus UUID identifier of the board.",
                "helper.host_temp": "Displays Raspberry Pi / Host CPU temperature in Mainsail.",
                "helper.mcu_temp": "Displays mainboard microcontroller STM32/RP2040 chip temperature.",
                "helper.stepper_rot_dist": "40 for GT2 20-tooth belts, 8.0 for T8x8 leadscrews, 4.0 for T8x4.",
                "helper.stepper_endstop": "Use '^' for internal pull-up. For sensorless: tmc2209_stepper_x:virtual_endstop",
                "helper.stepper_z_notice": "Travel limits and endstop for auxiliary Z axes (Z1, Z2, Z3) are handled by the main [stepper_z].",
                "helper.driver_uart": "UART serial communication pin for this axis.",
                "helper.driver_tx": "Optional. Specify only if the board uses separate RX and TX pins.",
                "helper.driver_address": "Optional (0-3). Used when multiple drivers share the same physical UART pin.",
                "helper.driver_cs": "Dedicated Chip Select pin for this driver.",
                "helper.driver_spi_bus": "SPI bus configured on the MCU (e.g. spi1, spi2, spi3a).",
                "helper.driver_run_current": "Typically 0.600A - 0.900A for standard NEMA17.",
                "helper.driver_hold_current": "Reduced current at standstill. Prevents overheating. If disabled, Klipper maintains run_current constant.",
                "helper.driver_sense_resistor": "Klipper default: 0.110 Ω for TMC2209/2208/2226, 0.075 Ω for TMC5160. Enable only if board uses non-standard resistor.",
                "helper.driver_stallguard": "TMC2209/2240: 0-255 (higher = more sensitive). TMC5160: -64 to 63 (lower = more sensitive).",
                "helper.pressure_advance": "Typically 0.02 - 0.06 for Direct Drive, 0.3 - 0.8 for Bowden.",
                "helper.extruder_sensor_spi": "E.g.: spi1, spi2, spi3a, etc.",
                "helper.extruder_sensor_speed": "Klipper default: 4000000 (4 MHz).",
                "helper.extruder_rtd_nominal": "100 Ω for standard PT100, 1000 Ω for PT1000.",
                "helper.extruder_rtd_reference": "430 Ω for PT100 boards, 4300 Ω for PT1000 boards.",
                "helper.extruder_rtd_wires": "Number of physical conductors connected to the RTD probe.",
                "helper.extruder_rtd_filter": "Filters electrical mains line noise oscillations.",
                "helper.extruder_control": "Select PID to maintain precise, steady hotend temperature.",
                "helper.extruder_max_delta": "Klipper default: 2.0°C. Heater turns off when exceeding target temperature + max_delta.",
                "helper.extruder_current": "Typically 0.500A - 0.700A for pancake / compact extruder motors (e.g. Orbiter, Stealthburner, BMG).",
                "helper.extruder_hold_current_warn": "Standstill current. NOTE: On extruders, setting this too low is discouraged to prevent skipped steps upon resuming extrusion.",
                "helper.bed_max_delta": "Klipper default: 2.0°C. Shuts off bed when exceeding target temperature + max_delta.",
                "helper.bed_pid_tip": "Tip: To calibrate bed PID from Mainsail console send: <code>PID_CALIBRATE HEATER=heater_bed TARGET=60</code>",
                "helper.fan_part": "Controlled by slicer via M106 / M107 commands.",
                "helper.adxl_cs": "E.g.: rpi:None if connected to Raspberry Pi, or MCU SPI CS pin.",
                "helper.adxl_spi_bus": "E.g.: spidev0.0 (on Raspberry Pi) or spi1/spi2 (on MCU).",
                "helper.adxl_axes_map": "E.g.: x, y, z or x, -z, y to match sensor mounting orientation.",
                "helper.adxl_rate": "Recommended Klipper default: 3200 Hz.",
                "helper.idle_timeout": "1800 seconds = 30 minutes of inactivity.",
                "helper.z_tilt_positions": "Physical pivot coordinates of Z motors (one per line or comma-separated).",
                "helper.z_tilt_points": "Bed coordinates where the probe will measure tilt.",
                "helper.res_accel_chip": "Name of the accelerometer chip defined in config (e.g. adxl345).",
                "helper.res_probe_points": "Physical bed test coordinates (e.g. bed center: 100, 100, 20).",
                "helper.res_accel_per_hz": "Recommended Klipper default: 75.",
                "helper.res_max_smoothing": "Leave empty for automatic optimal shaper calculation.",
                "helper.calib_z_offset": "Trigger height between nozzle and bed probe (synchronized with Probe value).",
                "tab.kinematics_label": "1. Kinematics",
                "tab.host_mcu_label": "2. Host/MCU",
                "tab.stepper_label": "3. Stepper Motion",
                "tab.extruder_label": "4. Extruder",
                "tab.bed_label": "5. Bed",
                "tab.misc_label": "6. Miscellaneous",
                "tab.include_label": "7. Include",
                "tab.macro_label": "8. Macro",
                "tab.calibration_label": "9. Calibration",
                "mcu.empty_notice": "No secondary microcontrollers configured.",
                "mcu.btn_add_first": "+ Add your first secondary MCU (e.g. toolhead, rpi, can0)",
                "mcu.tag_secondary": "Secondary MCU",
                "mcu.name_label": "MCU Name (Section [mcu <name>]):",
                "btn.delete_mcu": "Delete MCU",
                "fan.empty_notice": "No additional auxiliary fans configured.",
                "fan.btn_add_first": "+ Add an auxiliary fan (e.g. hotend heatsink, electronics box, chamber)",
                "fan.tag_fan": "Auxiliary Fan",
                "btn.delete_fan": "Delete Fan",
                "led.empty_notice": "No LED strips configured.",
                "led.btn_add_first": "+ Add your first LED strip (e.g. stealthburner, neopixel)",
                "led.tag_led": "LED Strip",
                "btn.delete_led": "Delete LED",
                "include.empty_notice": "No include files configured.",
                "btn.delete_include": "Delete Include",
                "macro.empty_notice": "No custom macros configured.",
                "btn.delete_macro": "Delete Macro",
                "idex.enable_label": "Enable IDEX System (Dual Carriage / Dual X Carriage)",
                "helper.extruder_driver_uart": "UART serial communication pin for the extruder.",
                "helper.extruder_driver_cs": "Dedicated CS pin for the extruder driver.",
                "opt.kinematics_hybrid_corexy": "Hybrid CoreXY (IDEX CoreXY)",
                "opt.kinematics_rotary_delta": "Rotary Delta",
                "opt.kinematics_polar": "Polar",
                "opt.z_motor_1": "1 Z Motor (Standard single axis [stepper_z])",
                "opt.z_motor_2": "2 Z Motors (Dual Z: [stepper_z], [stepper_z1])",
                "opt.z_motor_3": "3 Z Motors (Triple Z: [stepper_z], [stepper_z1], [stepper_z2] - e.g. Trident)",
                "opt.z_motor_4": "4 Z Motors (Quad Z: [stepper_z], [stepper_z1], [stepper_z2], [stepper_z3] - e.g. Voron 2.4)",
                "opt.conn_usb_serial": "USB / Serial (/dev/serial/by-id/...)",
                "opt.conn_canbus_uuid": "CAN Bus (canbus_uuid)",
                "opt.conn_uart_gpio": "UART GPIO (/dev/ttyAMA0 or /dev/ttyS0)",
                "opt.baud_250k": "250000 (Standard)",
                "opt.restart_cmd_default": "command (Default)",
                "opt.microsteps_16": "16 (Standard recommended)",
                "opt.steps_200": "200 steps (1.8° standard motor)",
                "opt.steps_400": "400 steps (0.9° high precision motor)",
                "opt.driver_generic": "A4988 / Generic (Standalone)",
                "opt.driver_uart": "UART (1/2 pin Serial - TMC2209 / TMC2208 / etc.)",
                "opt.driver_spi": "SPI (SPI Bus - TMC5160 / TMC2130 / etc.)",
                "opt.driver_standalone": "Standalone (No data bus / A4988 / Jumpers)",
                "opt.driver_hw_spi": "Hardware SPI (MCU Bus)",
                "opt.stealthchop_silent": "Silent (StealthChop active)",
                "opt.spreadcycle_torque": "SpreadCycle (Higher torque / Fewer lost steps)",
                "opt.spreadcycle_extruder": "SpreadCycle (Recommended for extruder - More torque & precision)",
                "opt.filament_175": "1.75 mm (Standard)",
                "opt.therm_epcos": "EPCOS 100K B57560G104F (Creality / Stock)",
                "opt.therm_epcos_std": "EPCOS 100K B57560G104F (Creality / Standard)",
                "opt.therm_generic_3950": "Generic 3950 (Common / Voron)",
                "opt.therm_generic_3950_voron": "Generic 3950 (Common on Voron)",
                "opt.therm_atc_semitec": "ATC Semitec 104GT-2 (E3D V6 / Prusa)",
                "opt.therm_atc_revo": "ATC Semitec 104NT (E3D Revo)",
                "opt.therm_pt1000": "PT1000 (2-wire analog on 4.7K pullup)",
                "opt.therm_max31865": "MAX31865 (SPI RTD Amplifier PT100/PT1000)",
                "opt.therm_max6675": "MAX6675 (Type K SPI Thermocouple)",
                "opt.therm_max31855": "MAX31855 (SPI Thermocouple)",
                "opt.therm_max31856": "MAX31856 (Advanced SPI Thermocouple)",
                "opt.rtd_100": "100 Ω (PT100 probe)",
                "opt.rtd_1000": "1000 Ω (PT1000 probe)",
                "opt.wires_2": "2 wires",
                "opt.wires_3": "3 wires",
                "opt.wires_4": "4 wires (Maximum accuracy)",
                "opt.filter_50hz_mains": "50 Hz (Mains Frequency Europe/230V)",
                "opt.filter_60hz_mains": "60 Hz (Mains Frequency USA/120V)",
                "opt.ctrl_pid_cont": "PID (Continuous Proportional-Integral-Derivative)",
                "opt.ctrl_watermark_hyst": "Watermark (Bang-bang hysteresis on/off)",
                "opt.ctrl_pid_precise": "PID (Precise continuous control)",
                "opt.ctrl_watermark_simple": "Watermark (Simple bang-bang on/off)",
                "opt.probe_none": "No Probe (Standard Mechanical Z Endstop)",
                "opt.probe_bltouch": "BLTouch / 3DTouch / CR Touch ([bltouch])",
                "opt.probe_inductive": "Inductive Probe / Microswitch / Klipper Tap ([probe])",
                "opt.sample_1": "1 sample",
                "opt.sample_2": "2 samples (recommended)",
                "opt.sample_3": "3 samples (maximum precision)",
                "opt.sample_median": "median (Median)",
                "opt.sample_average": "average (Average)",
                "opt.mesh_3x3": "3x3 (9 points - fast)",
                "opt.mesh_5x5": "5x5 (25 points - standard)",
                "opt.mesh_7x7": "7x7 (49 points - high density)",
                "opt.mesh_bicubic": "bicubic (Smooth curve)",
                "opt.shaper_mzv": "mzv (Recommended)",
                "opt.lang_auto": "Automatic (Sync with Mainsail)",
                "notice.homing_zero": "ℹ️ <strong>Note:</strong> Homing parameters set to <code>0</code> are omitted from the configuration file to keep Klipper's internal defaults active.",
                "subtitle.homing_x": "X Axis Homing Parameters",
                "subtitle.homing_dc": "Dual Carriage Homing Parameters",
                "subtitle.homing_y": "Y Axis Homing Parameters",
                "subtitle.homing_z": "Z Axis Homing Parameters",
                "subtitle.mcu_extra_desc": "Manage auxiliary expansion boards (CAN bus toolhead EBB/SB2209, Raspberry Pi GPIO, expanders).",
                "subtitle.spi_sensor": "🔌 Sensor SPI Bus Communication Parameters",
                "subtitle.rtd_sensor": "🌡️ RTD Sensor Parameters (MAX31865)",
                "subtitle.fan_part": "💨 Main Part Cooling Fan ([fan])",
                "subtitle.res_tester": "📊 Automatic Resonance Tester ([resonance_tester])",
                "subtitle.probe_z_offset": "📏 Probe Z-Offset Calibration ([probe] / [bltouch])",
                "chk.host_temp": "Enable Raspberry Pi / Host CPU Temperature Sensor",
                "chk.mcu_temp": "Enable Motherboard Microcontroller (MCU) Temperature Sensor",
                "chk.standalone_mode": "Standalone Mode:",
                "chk.hold_current": "Enable Motor Hold Current (hold_current)",
                "chk.sense_resistor": "Specify Sense Resistor Value (sense_resistor)",
                "chk.interpolate": "256 Microstep Interpolation (interpolate: True)",
                "chk.sensorless": "Sensorless Homing (Virtual Endstop)",
                "chk.adxl": "Enable ADXL345 Accelerometer (Toolhead/Bed resonance measurement)",
                "chk.virtual_sd": "[virtual_sdcard] - Enable printing G-Code files from Moonraker",
                "chk.pause_resume": "[pause_resume] - Enable Native Pause and Resume Commands",
                "chk.display_status": "[display_status] - Enable Status and Progress Updates",
                "chk.respond": "[respond] - Enable Console Messages and M118 Responses",
                "chk.safe_z_home": "Enable Safe Z Home (Home Z in bed center)",
                "chk.input_shaper": "Enable Input Shaper Filter (Eliminate Ghosting / Ringing)",
                "chk.resonance_tester": "Enable Resonance Tester Section (Automated resonance sweep with accelerometer)",
                "tag.hardware_layout": "Hardware Layout",
                "tag.thermal_sensors": "Thermal Sensors",
                "tag.hotend_thermal": "Hotend Thermal",
                "tag.pid_control": "PID Control",
                "tag.leveling_sensor": "Leveling Sensor",
                "tag.resonances_z_offset": "Resonances & Z-Offset",
                "tag.core_features": "Core Features",
                "tag.delta_geometry": "Delta Geometry"
        },
        "fr": {
                "nav.settings": "Settings",
                "nav.unsaved_single": "1 modification non enregistrée",
                "nav.unsaved_plural": "{n} modifications",
                "nav.reload": "Reload",
                "nav.preview": "Preview",
                "nav.download": "Download",
                "nav.save": "Save",
                "nav.save_restart": "Save & Restart",
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
                "toast.lang_set": "Langue définie sur {lang}",
                "subtab.stepper_x": "X Axis [stepper_x]",
                "subtab.dual_carriage": "Dual Carriage X2 [dual_carriage]",
                "subtab.stepper_y": "Y Axis [stepper_y]",
                "subtab.stepper_z": "Z Axis [stepper_z]",
                "subtab.stepper_z1": "Z1 Axis [stepper_z1]",
                "subtab.stepper_z2": "Z2 Axis [stepper_z2]",
                "subtab.stepper_z3": "Z3 Axis [stepper_z3]",
                "subtab.extruder": "Extruder 0 [extruder]",
                "subtab.extruder1": "Extruder 1 IDEX [extruder1]",
                "btn.add_mcu_full": "+ Add New MCU",
                "btn.calc_rot_dist": "Rotation Distance Calculator",
                "btn.add_fan_full": "+ Add Fan",
                "btn.add_led_full": "+ Add LED",
                "btn.add_include_full": "New Include File",
                "btn.insert_macro_template_full": "Insert Default Templates",
                "btn.add_macro_full": "New Macro",
                "btn.copy_preview": "Copy to Clipboard",
                "btn.save_moonraker": "Save to Moonraker",
                "btn.save_sync": "Save & Synchronize",
                "btn.apply_calc": "Apply to Stepper",
                "btn.test_resonances": "Start Resonance Test (TEST_RESONANCES)",
                "btn.pid_calibrate": "Calibrate Hotend PID (PID_CALIBRATE)",
                "btn.bed_pid_calibrate": "Calibrate Bed PID (PID_CALIBRATE)",
                "calc.drive_type": "Transmission Type:",
                "calc.belt_lead": "Timing Belt (GT2 2mm)",
                "calc.leadscrew": "Leadscrew / Threaded Rod",
                "calc.pulley_teeth": "Pulley Tooth Count (e.g.: 16 or 20 teeth):",
                "calc.lead_pitch": "Leadscrew Pitch (Lead in mm per turn - e.g.: T8x8 = 8, T8x4 = 4):",
                "calc.result_label": "Calculated Value:",
                "modal.detected_lang": "Detected Language:",
                "modal.auto_lang_helper": "When set to Automatic, Klipper Configurator adopts the language configured in Mainsail.",
                "modal.auto_sync": "Automatic Synchronization:",
                "modal.synced": "Synchronized",
                "modal.primary_accent": "Primary Accent Color:",
                "modal.theme_mode_label": "Theme Mode:",
                "modal.dark_mode": "Dark",
                "modal.light_mode": "Light",
                "modal.preset_vendor": "Official Mainsail / Vendor Theme Presets:",
                "modal.force_light_label": "Force Light Theme (Light Theme)",
                "opt.kinematics_cartesian": "Cartesian (Ender 3, Prusa i3, Sovol)",
                "opt.kinematics_corexy": "CoreXY (Voron 2.4/Trident, RatRig, Bambu)",
                "opt.kinematics_delta": "Delta (Kossel, Flsun)",
                "opt.kinematics_corexz": "CoreXZ (Voron Switchwire)",
                "opt.kinematics_rotational_delta": "Rotational Delta",
                "opt.kinematics_winch": "Cable Winch",
                "opt.kinematics_none": "None",
                "opt.conn_serial": "USB Serial Port",
                "opt.conn_canbus": "CAN Bus Network",
                "opt.restart_arduino": "Arduino DTR (Standard)",
                "opt.restart_cheetah": "Cheetah",
                "opt.restart_command": "Software Command",
                "opt.restart_rpi_usb": "Raspberry Pi USB Power Toggle",
                "opt.spi_hardware": "Hardware SPI (spi_bus)",
                "opt.spi_software": "Software SPI (Bit-banging)",
                "opt.filter_50hz": "50Hz Frequency (Europe/230V)",
                "opt.filter_60hz": "60Hz Frequency (USA/120V)",
                "opt.median": "Median (median)",
                "opt.average": "Average (average)",
                "opt.bicubic": "Bicubic",
                "opt.lagrange": "Lagrange",
                "opt.pid": "PID (Proportional Integral Derivative)",
                "opt.watermark": "Watermark (Bang-bang hysteresis)",
                "helper.kinematics": "Specifies the kinematic motion model of the toolhead and axes.",
                "helper.enable_idex": "Enables the secondary independent <code>[dual_carriage]</code> on X axis and secondary <code>[extruder1]</code>.",
                "helper.z_motor_count": "Automatically updates available motors in the <strong>Stepper</strong> tab and leveling options in the <strong>Calibration</strong> tab (enabling <code>[z_tilt]</code> or <code>[quad_gantry_level]</code>).",
                "helper.zero_to_disable": "0 to disable",
                "helper.mcu_serial": "Unique Linux USB serial port path.",
                "helper.mcu_canbus": "12-digit CAN bus UUID identifier of the board.",
                "helper.host_temp": "Displays Raspberry Pi / Host CPU temperature in Mainsail.",
                "helper.mcu_temp": "Displays mainboard microcontroller STM32/RP2040 chip temperature.",
                "helper.stepper_rot_dist": "40 for GT2 20-tooth belts, 8.0 for T8x8 leadscrews, 4.0 for T8x4.",
                "helper.stepper_endstop": "Use '^' for internal pull-up. For sensorless: tmc2209_stepper_x:virtual_endstop",
                "helper.stepper_z_notice": "Travel limits and endstop for auxiliary Z axes (Z1, Z2, Z3) are handled by the main [stepper_z].",
                "helper.driver_uart": "UART serial communication pin for this axis.",
                "helper.driver_tx": "Optional. Specify only if the board uses separate RX and TX pins.",
                "helper.driver_address": "Optional (0-3). Used when multiple drivers share the same physical UART pin.",
                "helper.driver_cs": "Dedicated Chip Select pin for this driver.",
                "helper.driver_spi_bus": "SPI bus configured on the MCU (e.g. spi1, spi2, spi3a).",
                "helper.driver_run_current": "Typically 0.600A - 0.900A for standard NEMA17.",
                "helper.driver_hold_current": "Reduced current at standstill. Prevents overheating. If disabled, Klipper maintains run_current constant.",
                "helper.driver_sense_resistor": "Klipper default: 0.110 Ω for TMC2209/2208/2226, 0.075 Ω for TMC5160. Enable only if board uses non-standard resistor.",
                "helper.driver_stallguard": "TMC2209/2240: 0-255 (higher = more sensitive). TMC5160: -64 to 63 (lower = more sensitive).",
                "helper.pressure_advance": "Typically 0.02 - 0.06 for Direct Drive, 0.3 - 0.8 for Bowden.",
                "helper.extruder_sensor_spi": "E.g.: spi1, spi2, spi3a, etc.",
                "helper.extruder_sensor_speed": "Klipper default: 4000000 (4 MHz).",
                "helper.extruder_rtd_nominal": "100 Ω for standard PT100, 1000 Ω for PT1000.",
                "helper.extruder_rtd_reference": "430 Ω for PT100 boards, 4300 Ω for PT1000 boards.",
                "helper.extruder_rtd_wires": "Number of physical conductors connected to the RTD probe.",
                "helper.extruder_rtd_filter": "Filters electrical mains line noise oscillations.",
                "helper.extruder_control": "Select PID to maintain precise, steady hotend temperature.",
                "helper.extruder_max_delta": "Klipper default: 2.0°C. Heater turns off when exceeding target temperature + max_delta.",
                "helper.extruder_current": "Typically 0.500A - 0.700A for pancake / compact extruder motors (e.g. Orbiter, Stealthburner, BMG).",
                "helper.extruder_hold_current_warn": "Standstill current. NOTE: On extruders, setting this too low is discouraged to prevent skipped steps upon resuming extrusion.",
                "helper.bed_max_delta": "Klipper default: 2.0°C. Shuts off bed when exceeding target temperature + max_delta.",
                "helper.bed_pid_tip": "Tip: To calibrate bed PID from Mainsail console send: <code>PID_CALIBRATE HEATER=heater_bed TARGET=60</code>",
                "helper.fan_part": "Controlled by slicer via M106 / M107 commands.",
                "helper.adxl_cs": "E.g.: rpi:None if connected to Raspberry Pi, or MCU SPI CS pin.",
                "helper.adxl_spi_bus": "E.g.: spidev0.0 (on Raspberry Pi) or spi1/spi2 (on MCU).",
                "helper.adxl_axes_map": "E.g.: x, y, z or x, -z, y to match sensor mounting orientation.",
                "helper.adxl_rate": "Recommended Klipper default: 3200 Hz.",
                "helper.idle_timeout": "1800 seconds = 30 minutes of inactivity.",
                "helper.z_tilt_positions": "Physical pivot coordinates of Z motors (one per line or comma-separated).",
                "helper.z_tilt_points": "Bed coordinates where the probe will measure tilt.",
                "helper.res_accel_chip": "Name of the accelerometer chip defined in config (e.g. adxl345).",
                "helper.res_probe_points": "Physical bed test coordinates (e.g. bed center: 100, 100, 20).",
                "helper.res_accel_per_hz": "Recommended Klipper default: 75.",
                "helper.res_max_smoothing": "Leave empty for automatic optimal shaper calculation.",
                "helper.calib_z_offset": "Trigger height between nozzle and bed probe (synchronized with Probe value).",
                "tab.kinematics_label": "1. Kinematics",
                "tab.host_mcu_label": "2. Host/MCU",
                "tab.stepper_label": "3. Stepper Motion",
                "tab.extruder_label": "4. Extruder",
                "tab.bed_label": "5. Bed",
                "tab.misc_label": "6. Miscellaneous",
                "tab.include_label": "7. Include",
                "tab.macro_label": "8. Macro",
                "tab.calibration_label": "9. Calibration",
                "mcu.empty_notice": "No secondary microcontrollers configured.",
                "mcu.btn_add_first": "+ Add your first secondary MCU (e.g. toolhead, rpi, can0)",
                "mcu.tag_secondary": "Secondary MCU",
                "mcu.name_label": "MCU Name (Section [mcu <name>]):",
                "btn.delete_mcu": "Delete MCU",
                "fan.empty_notice": "No additional auxiliary fans configured.",
                "fan.btn_add_first": "+ Add an auxiliary fan (e.g. hotend heatsink, electronics box, chamber)",
                "fan.tag_fan": "Auxiliary Fan",
                "btn.delete_fan": "Delete Fan",
                "led.empty_notice": "No LED strips configured.",
                "led.btn_add_first": "+ Add your first LED strip (e.g. stealthburner, neopixel)",
                "led.tag_led": "LED Strip",
                "btn.delete_led": "Delete LED",
                "include.empty_notice": "No include files configured.",
                "btn.delete_include": "Delete Include",
                "macro.empty_notice": "No custom macros configured.",
                "btn.delete_macro": "Delete Macro",
                "idex.enable_label": "Enable IDEX System (Dual Carriage / Dual X Carriage)",
                "helper.extruder_driver_uart": "UART serial communication pin for the extruder.",
                "helper.extruder_driver_cs": "Dedicated CS pin for the extruder driver.",
                "opt.kinematics_hybrid_corexy": "Hybrid CoreXY (IDEX CoreXY)",
                "opt.kinematics_rotary_delta": "Rotary Delta",
                "opt.kinematics_polar": "Polar",
                "opt.z_motor_1": "1 Z Motor (Standard single axis [stepper_z])",
                "opt.z_motor_2": "2 Z Motors (Dual Z: [stepper_z], [stepper_z1])",
                "opt.z_motor_3": "3 Z Motors (Triple Z: [stepper_z], [stepper_z1], [stepper_z2] - e.g. Trident)",
                "opt.z_motor_4": "4 Z Motors (Quad Z: [stepper_z], [stepper_z1], [stepper_z2], [stepper_z3] - e.g. Voron 2.4)",
                "opt.conn_usb_serial": "USB / Serial (/dev/serial/by-id/...)",
                "opt.conn_canbus_uuid": "CAN Bus (canbus_uuid)",
                "opt.conn_uart_gpio": "UART GPIO (/dev/ttyAMA0 or /dev/ttyS0)",
                "opt.baud_250k": "250000 (Standard)",
                "opt.restart_cmd_default": "command (Default)",
                "opt.microsteps_16": "16 (Standard recommended)",
                "opt.steps_200": "200 steps (1.8° standard motor)",
                "opt.steps_400": "400 steps (0.9° high precision motor)",
                "opt.driver_generic": "A4988 / Generic (Standalone)",
                "opt.driver_uart": "UART (1/2 pin Serial - TMC2209 / TMC2208 / etc.)",
                "opt.driver_spi": "SPI (SPI Bus - TMC5160 / TMC2130 / etc.)",
                "opt.driver_standalone": "Standalone (No data bus / A4988 / Jumpers)",
                "opt.driver_hw_spi": "Hardware SPI (MCU Bus)",
                "opt.stealthchop_silent": "Silent (StealthChop active)",
                "opt.spreadcycle_torque": "SpreadCycle (Higher torque / Fewer lost steps)",
                "opt.spreadcycle_extruder": "SpreadCycle (Recommended for extruder - More torque & precision)",
                "opt.filament_175": "1.75 mm (Standard)",
                "opt.therm_epcos": "EPCOS 100K B57560G104F (Creality / Stock)",
                "opt.therm_epcos_std": "EPCOS 100K B57560G104F (Creality / Standard)",
                "opt.therm_generic_3950": "Generic 3950 (Common / Voron)",
                "opt.therm_generic_3950_voron": "Generic 3950 (Common on Voron)",
                "opt.therm_atc_semitec": "ATC Semitec 104GT-2 (E3D V6 / Prusa)",
                "opt.therm_atc_revo": "ATC Semitec 104NT (E3D Revo)",
                "opt.therm_pt1000": "PT1000 (2-wire analog on 4.7K pullup)",
                "opt.therm_max31865": "MAX31865 (SPI RTD Amplifier PT100/PT1000)",
                "opt.therm_max6675": "MAX6675 (Type K SPI Thermocouple)",
                "opt.therm_max31855": "MAX31855 (SPI Thermocouple)",
                "opt.therm_max31856": "MAX31856 (Advanced SPI Thermocouple)",
                "opt.rtd_100": "100 Ω (PT100 probe)",
                "opt.rtd_1000": "1000 Ω (PT1000 probe)",
                "opt.wires_2": "2 wires",
                "opt.wires_3": "3 wires",
                "opt.wires_4": "4 wires (Maximum accuracy)",
                "opt.filter_50hz_mains": "50 Hz (Mains Frequency Europe/230V)",
                "opt.filter_60hz_mains": "60 Hz (Mains Frequency USA/120V)",
                "opt.ctrl_pid_cont": "PID (Continuous Proportional-Integral-Derivative)",
                "opt.ctrl_watermark_hyst": "Watermark (Bang-bang hysteresis on/off)",
                "opt.ctrl_pid_precise": "PID (Precise continuous control)",
                "opt.ctrl_watermark_simple": "Watermark (Simple bang-bang on/off)",
                "opt.probe_none": "No Probe (Standard Mechanical Z Endstop)",
                "opt.probe_bltouch": "BLTouch / 3DTouch / CR Touch ([bltouch])",
                "opt.probe_inductive": "Inductive Probe / Microswitch / Klipper Tap ([probe])",
                "opt.sample_1": "1 sample",
                "opt.sample_2": "2 samples (recommended)",
                "opt.sample_3": "3 samples (maximum precision)",
                "opt.sample_median": "median (Median)",
                "opt.sample_average": "average (Average)",
                "opt.mesh_3x3": "3x3 (9 points - fast)",
                "opt.mesh_5x5": "5x5 (25 points - standard)",
                "opt.mesh_7x7": "7x7 (49 points - high density)",
                "opt.mesh_bicubic": "bicubic (Smooth curve)",
                "opt.shaper_mzv": "mzv (Recommended)",
                "opt.lang_auto": "Automatic (Sync with Mainsail)",
                "notice.homing_zero": "ℹ️ <strong>Note:</strong> Homing parameters set to <code>0</code> are omitted from the configuration file to keep Klipper's internal defaults active.",
                "subtitle.homing_x": "X Axis Homing Parameters",
                "subtitle.homing_dc": "Dual Carriage Homing Parameters",
                "subtitle.homing_y": "Y Axis Homing Parameters",
                "subtitle.homing_z": "Z Axis Homing Parameters",
                "subtitle.mcu_extra_desc": "Manage auxiliary expansion boards (CAN bus toolhead EBB/SB2209, Raspberry Pi GPIO, expanders).",
                "subtitle.spi_sensor": "🔌 Sensor SPI Bus Communication Parameters",
                "subtitle.rtd_sensor": "🌡️ RTD Sensor Parameters (MAX31865)",
                "subtitle.fan_part": "💨 Main Part Cooling Fan ([fan])",
                "subtitle.res_tester": "📊 Automatic Resonance Tester ([resonance_tester])",
                "subtitle.probe_z_offset": "📏 Probe Z-Offset Calibration ([probe] / [bltouch])",
                "chk.host_temp": "Enable Raspberry Pi / Host CPU Temperature Sensor",
                "chk.mcu_temp": "Enable Motherboard Microcontroller (MCU) Temperature Sensor",
                "chk.standalone_mode": "Standalone Mode:",
                "chk.hold_current": "Enable Motor Hold Current (hold_current)",
                "chk.sense_resistor": "Specify Sense Resistor Value (sense_resistor)",
                "chk.interpolate": "256 Microstep Interpolation (interpolate: True)",
                "chk.sensorless": "Sensorless Homing (Virtual Endstop)",
                "chk.adxl": "Enable ADXL345 Accelerometer (Toolhead/Bed resonance measurement)",
                "chk.virtual_sd": "[virtual_sdcard] - Enable printing G-Code files from Moonraker",
                "chk.pause_resume": "[pause_resume] - Enable Native Pause and Resume Commands",
                "chk.display_status": "[display_status] - Enable Status and Progress Updates",
                "chk.respond": "[respond] - Enable Console Messages and M118 Responses",
                "chk.safe_z_home": "Enable Safe Z Home (Home Z in bed center)",
                "chk.input_shaper": "Enable Input Shaper Filter (Eliminate Ghosting / Ringing)",
                "chk.resonance_tester": "Enable Resonance Tester Section (Automated resonance sweep with accelerometer)",
                "tag.hardware_layout": "Hardware Layout",
                "tag.thermal_sensors": "Thermal Sensors",
                "tag.hotend_thermal": "Hotend Thermal",
                "tag.pid_control": "PID Control",
                "tag.leveling_sensor": "Leveling Sensor",
                "tag.resonances_z_offset": "Resonances & Z-Offset",
                "tag.core_features": "Core Features",
                "tag.delta_geometry": "Delta Geometry"
        },
        "es": {
                "nav.settings": "Settings",
                "nav.unsaved_single": "1 cambio sin guardar",
                "nav.unsaved_plural": "{n} cambios sin guardar",
                "nav.reload": "Reload",
                "nav.preview": "Preview",
                "nav.download": "Download",
                "nav.save": "Save",
                "nav.save_restart": "Save & Restart",
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
                "toast.lang_set": "Idioma establecido en {lang}",
                "subtab.stepper_x": "X Axis [stepper_x]",
                "subtab.dual_carriage": "Dual Carriage X2 [dual_carriage]",
                "subtab.stepper_y": "Y Axis [stepper_y]",
                "subtab.stepper_z": "Z Axis [stepper_z]",
                "subtab.stepper_z1": "Z1 Axis [stepper_z1]",
                "subtab.stepper_z2": "Z2 Axis [stepper_z2]",
                "subtab.stepper_z3": "Z3 Axis [stepper_z3]",
                "subtab.extruder": "Extruder 0 [extruder]",
                "subtab.extruder1": "Extruder 1 IDEX [extruder1]",
                "btn.add_mcu_full": "+ Add New MCU",
                "btn.calc_rot_dist": "Rotation Distance Calculator",
                "btn.add_fan_full": "+ Add Fan",
                "btn.add_led_full": "+ Add LED",
                "btn.add_include_full": "New Include File",
                "btn.insert_macro_template_full": "Insert Default Templates",
                "btn.add_macro_full": "New Macro",
                "btn.copy_preview": "Copy to Clipboard",
                "btn.save_moonraker": "Save to Moonraker",
                "btn.save_sync": "Save & Synchronize",
                "btn.apply_calc": "Apply to Stepper",
                "btn.test_resonances": "Start Resonance Test (TEST_RESONANCES)",
                "btn.pid_calibrate": "Calibrate Hotend PID (PID_CALIBRATE)",
                "btn.bed_pid_calibrate": "Calibrate Bed PID (PID_CALIBRATE)",
                "calc.drive_type": "Transmission Type:",
                "calc.belt_lead": "Timing Belt (GT2 2mm)",
                "calc.leadscrew": "Leadscrew / Threaded Rod",
                "calc.pulley_teeth": "Pulley Tooth Count (e.g.: 16 or 20 teeth):",
                "calc.lead_pitch": "Leadscrew Pitch (Lead in mm per turn - e.g.: T8x8 = 8, T8x4 = 4):",
                "calc.result_label": "Calculated Value:",
                "modal.detected_lang": "Detected Language:",
                "modal.auto_lang_helper": "When set to Automatic, Klipper Configurator adopts the language configured in Mainsail.",
                "modal.auto_sync": "Automatic Synchronization:",
                "modal.synced": "Synchronized",
                "modal.primary_accent": "Primary Accent Color:",
                "modal.theme_mode_label": "Theme Mode:",
                "modal.dark_mode": "Dark",
                "modal.light_mode": "Light",
                "modal.preset_vendor": "Official Mainsail / Vendor Theme Presets:",
                "modal.force_light_label": "Force Light Theme (Light Theme)",
                "opt.kinematics_cartesian": "Cartesian (Ender 3, Prusa i3, Sovol)",
                "opt.kinematics_corexy": "CoreXY (Voron 2.4/Trident, RatRig, Bambu)",
                "opt.kinematics_delta": "Delta (Kossel, Flsun)",
                "opt.kinematics_corexz": "CoreXZ (Voron Switchwire)",
                "opt.kinematics_rotational_delta": "Rotational Delta",
                "opt.kinematics_winch": "Cable Winch",
                "opt.kinematics_none": "None",
                "opt.conn_serial": "USB Serial Port",
                "opt.conn_canbus": "CAN Bus Network",
                "opt.restart_arduino": "Arduino DTR (Standard)",
                "opt.restart_cheetah": "Cheetah",
                "opt.restart_command": "Software Command",
                "opt.restart_rpi_usb": "Raspberry Pi USB Power Toggle",
                "opt.spi_hardware": "Hardware SPI (spi_bus)",
                "opt.spi_software": "Software SPI (Bit-banging)",
                "opt.filter_50hz": "50Hz Frequency (Europe/230V)",
                "opt.filter_60hz": "60Hz Frequency (USA/120V)",
                "opt.median": "Median (median)",
                "opt.average": "Average (average)",
                "opt.bicubic": "Bicubic",
                "opt.lagrange": "Lagrange",
                "opt.pid": "PID (Proportional Integral Derivative)",
                "opt.watermark": "Watermark (Bang-bang hysteresis)",
                "helper.kinematics": "Specifies the kinematic motion model of the toolhead and axes.",
                "helper.enable_idex": "Enables the secondary independent <code>[dual_carriage]</code> on X axis and secondary <code>[extruder1]</code>.",
                "helper.z_motor_count": "Automatically updates available motors in the <strong>Stepper</strong> tab and leveling options in the <strong>Calibration</strong> tab (enabling <code>[z_tilt]</code> or <code>[quad_gantry_level]</code>).",
                "helper.zero_to_disable": "0 to disable",
                "helper.mcu_serial": "Unique Linux USB serial port path.",
                "helper.mcu_canbus": "12-digit CAN bus UUID identifier of the board.",
                "helper.host_temp": "Displays Raspberry Pi / Host CPU temperature in Mainsail.",
                "helper.mcu_temp": "Displays mainboard microcontroller STM32/RP2040 chip temperature.",
                "helper.stepper_rot_dist": "40 for GT2 20-tooth belts, 8.0 for T8x8 leadscrews, 4.0 for T8x4.",
                "helper.stepper_endstop": "Use '^' for internal pull-up. For sensorless: tmc2209_stepper_x:virtual_endstop",
                "helper.stepper_z_notice": "Travel limits and endstop for auxiliary Z axes (Z1, Z2, Z3) are handled by the main [stepper_z].",
                "helper.driver_uart": "UART serial communication pin for this axis.",
                "helper.driver_tx": "Optional. Specify only if the board uses separate RX and TX pins.",
                "helper.driver_address": "Optional (0-3). Used when multiple drivers share the same physical UART pin.",
                "helper.driver_cs": "Dedicated Chip Select pin for this driver.",
                "helper.driver_spi_bus": "SPI bus configured on the MCU (e.g. spi1, spi2, spi3a).",
                "helper.driver_run_current": "Typically 0.600A - 0.900A for standard NEMA17.",
                "helper.driver_hold_current": "Reduced current at standstill. Prevents overheating. If disabled, Klipper maintains run_current constant.",
                "helper.driver_sense_resistor": "Klipper default: 0.110 Ω for TMC2209/2208/2226, 0.075 Ω for TMC5160. Enable only if board uses non-standard resistor.",
                "helper.driver_stallguard": "TMC2209/2240: 0-255 (higher = more sensitive). TMC5160: -64 to 63 (lower = more sensitive).",
                "helper.pressure_advance": "Typically 0.02 - 0.06 for Direct Drive, 0.3 - 0.8 for Bowden.",
                "helper.extruder_sensor_spi": "E.g.: spi1, spi2, spi3a, etc.",
                "helper.extruder_sensor_speed": "Klipper default: 4000000 (4 MHz).",
                "helper.extruder_rtd_nominal": "100 Ω for standard PT100, 1000 Ω for PT1000.",
                "helper.extruder_rtd_reference": "430 Ω for PT100 boards, 4300 Ω for PT1000 boards.",
                "helper.extruder_rtd_wires": "Number of physical conductors connected to the RTD probe.",
                "helper.extruder_rtd_filter": "Filters electrical mains line noise oscillations.",
                "helper.extruder_control": "Select PID to maintain precise, steady hotend temperature.",
                "helper.extruder_max_delta": "Klipper default: 2.0°C. Heater turns off when exceeding target temperature + max_delta.",
                "helper.extruder_current": "Typically 0.500A - 0.700A for pancake / compact extruder motors (e.g. Orbiter, Stealthburner, BMG).",
                "helper.extruder_hold_current_warn": "Standstill current. NOTE: On extruders, setting this too low is discouraged to prevent skipped steps upon resuming extrusion.",
                "helper.bed_max_delta": "Klipper default: 2.0°C. Shuts off bed when exceeding target temperature + max_delta.",
                "helper.bed_pid_tip": "Tip: To calibrate bed PID from Mainsail console send: <code>PID_CALIBRATE HEATER=heater_bed TARGET=60</code>",
                "helper.fan_part": "Controlled by slicer via M106 / M107 commands.",
                "helper.adxl_cs": "E.g.: rpi:None if connected to Raspberry Pi, or MCU SPI CS pin.",
                "helper.adxl_spi_bus": "E.g.: spidev0.0 (on Raspberry Pi) or spi1/spi2 (on MCU).",
                "helper.adxl_axes_map": "E.g.: x, y, z or x, -z, y to match sensor mounting orientation.",
                "helper.adxl_rate": "Recommended Klipper default: 3200 Hz.",
                "helper.idle_timeout": "1800 seconds = 30 minutes of inactivity.",
                "helper.z_tilt_positions": "Physical pivot coordinates of Z motors (one per line or comma-separated).",
                "helper.z_tilt_points": "Bed coordinates where the probe will measure tilt.",
                "helper.res_accel_chip": "Name of the accelerometer chip defined in config (e.g. adxl345).",
                "helper.res_probe_points": "Physical bed test coordinates (e.g. bed center: 100, 100, 20).",
                "helper.res_accel_per_hz": "Recommended Klipper default: 75.",
                "helper.res_max_smoothing": "Leave empty for automatic optimal shaper calculation.",
                "helper.calib_z_offset": "Trigger height between nozzle and bed probe (synchronized with Probe value).",
                "tab.kinematics_label": "1. Kinematics",
                "tab.host_mcu_label": "2. Host/MCU",
                "tab.stepper_label": "3. Stepper Motion",
                "tab.extruder_label": "4. Extruder",
                "tab.bed_label": "5. Bed",
                "tab.misc_label": "6. Miscellaneous",
                "tab.include_label": "7. Include",
                "tab.macro_label": "8. Macro",
                "tab.calibration_label": "9. Calibration",
                "mcu.empty_notice": "No secondary microcontrollers configured.",
                "mcu.btn_add_first": "+ Add your first secondary MCU (e.g. toolhead, rpi, can0)",
                "mcu.tag_secondary": "Secondary MCU",
                "mcu.name_label": "MCU Name (Section [mcu <name>]):",
                "btn.delete_mcu": "Delete MCU",
                "fan.empty_notice": "No additional auxiliary fans configured.",
                "fan.btn_add_first": "+ Add an auxiliary fan (e.g. hotend heatsink, electronics box, chamber)",
                "fan.tag_fan": "Auxiliary Fan",
                "btn.delete_fan": "Delete Fan",
                "led.empty_notice": "No LED strips configured.",
                "led.btn_add_first": "+ Add your first LED strip (e.g. stealthburner, neopixel)",
                "led.tag_led": "LED Strip",
                "btn.delete_led": "Delete LED",
                "include.empty_notice": "No include files configured.",
                "btn.delete_include": "Delete Include",
                "macro.empty_notice": "No custom macros configured.",
                "btn.delete_macro": "Delete Macro",
                "idex.enable_label": "Enable IDEX System (Dual Carriage / Dual X Carriage)",
                "helper.extruder_driver_uart": "UART serial communication pin for the extruder.",
                "helper.extruder_driver_cs": "Dedicated CS pin for the extruder driver.",
                "opt.kinematics_hybrid_corexy": "Hybrid CoreXY (IDEX CoreXY)",
                "opt.kinematics_rotary_delta": "Rotary Delta",
                "opt.kinematics_polar": "Polar",
                "opt.z_motor_1": "1 Z Motor (Standard single axis [stepper_z])",
                "opt.z_motor_2": "2 Z Motors (Dual Z: [stepper_z], [stepper_z1])",
                "opt.z_motor_3": "3 Z Motors (Triple Z: [stepper_z], [stepper_z1], [stepper_z2] - e.g. Trident)",
                "opt.z_motor_4": "4 Z Motors (Quad Z: [stepper_z], [stepper_z1], [stepper_z2], [stepper_z3] - e.g. Voron 2.4)",
                "opt.conn_usb_serial": "USB / Serial (/dev/serial/by-id/...)",
                "opt.conn_canbus_uuid": "CAN Bus (canbus_uuid)",
                "opt.conn_uart_gpio": "UART GPIO (/dev/ttyAMA0 or /dev/ttyS0)",
                "opt.baud_250k": "250000 (Standard)",
                "opt.restart_cmd_default": "command (Default)",
                "opt.microsteps_16": "16 (Standard recommended)",
                "opt.steps_200": "200 steps (1.8° standard motor)",
                "opt.steps_400": "400 steps (0.9° high precision motor)",
                "opt.driver_generic": "A4988 / Generic (Standalone)",
                "opt.driver_uart": "UART (1/2 pin Serial - TMC2209 / TMC2208 / etc.)",
                "opt.driver_spi": "SPI (SPI Bus - TMC5160 / TMC2130 / etc.)",
                "opt.driver_standalone": "Standalone (No data bus / A4988 / Jumpers)",
                "opt.driver_hw_spi": "Hardware SPI (MCU Bus)",
                "opt.stealthchop_silent": "Silent (StealthChop active)",
                "opt.spreadcycle_torque": "SpreadCycle (Higher torque / Fewer lost steps)",
                "opt.spreadcycle_extruder": "SpreadCycle (Recommended for extruder - More torque & precision)",
                "opt.filament_175": "1.75 mm (Standard)",
                "opt.therm_epcos": "EPCOS 100K B57560G104F (Creality / Stock)",
                "opt.therm_epcos_std": "EPCOS 100K B57560G104F (Creality / Standard)",
                "opt.therm_generic_3950": "Generic 3950 (Common / Voron)",
                "opt.therm_generic_3950_voron": "Generic 3950 (Common on Voron)",
                "opt.therm_atc_semitec": "ATC Semitec 104GT-2 (E3D V6 / Prusa)",
                "opt.therm_atc_revo": "ATC Semitec 104NT (E3D Revo)",
                "opt.therm_pt1000": "PT1000 (2-wire analog on 4.7K pullup)",
                "opt.therm_max31865": "MAX31865 (SPI RTD Amplifier PT100/PT1000)",
                "opt.therm_max6675": "MAX6675 (Type K SPI Thermocouple)",
                "opt.therm_max31855": "MAX31855 (SPI Thermocouple)",
                "opt.therm_max31856": "MAX31856 (Advanced SPI Thermocouple)",
                "opt.rtd_100": "100 Ω (PT100 probe)",
                "opt.rtd_1000": "1000 Ω (PT1000 probe)",
                "opt.wires_2": "2 wires",
                "opt.wires_3": "3 wires",
                "opt.wires_4": "4 wires (Maximum accuracy)",
                "opt.filter_50hz_mains": "50 Hz (Mains Frequency Europe/230V)",
                "opt.filter_60hz_mains": "60 Hz (Mains Frequency USA/120V)",
                "opt.ctrl_pid_cont": "PID (Continuous Proportional-Integral-Derivative)",
                "opt.ctrl_watermark_hyst": "Watermark (Bang-bang hysteresis on/off)",
                "opt.ctrl_pid_precise": "PID (Precise continuous control)",
                "opt.ctrl_watermark_simple": "Watermark (Simple bang-bang on/off)",
                "opt.probe_none": "No Probe (Standard Mechanical Z Endstop)",
                "opt.probe_bltouch": "BLTouch / 3DTouch / CR Touch ([bltouch])",
                "opt.probe_inductive": "Inductive Probe / Microswitch / Klipper Tap ([probe])",
                "opt.sample_1": "1 sample",
                "opt.sample_2": "2 samples (recommended)",
                "opt.sample_3": "3 samples (maximum precision)",
                "opt.sample_median": "median (Median)",
                "opt.sample_average": "average (Average)",
                "opt.mesh_3x3": "3x3 (9 points - fast)",
                "opt.mesh_5x5": "5x5 (25 points - standard)",
                "opt.mesh_7x7": "7x7 (49 points - high density)",
                "opt.mesh_bicubic": "bicubic (Smooth curve)",
                "opt.shaper_mzv": "mzv (Recommended)",
                "opt.lang_auto": "Automatic (Sync with Mainsail)",
                "notice.homing_zero": "ℹ️ <strong>Note:</strong> Homing parameters set to <code>0</code> are omitted from the configuration file to keep Klipper's internal defaults active.",
                "subtitle.homing_x": "X Axis Homing Parameters",
                "subtitle.homing_dc": "Dual Carriage Homing Parameters",
                "subtitle.homing_y": "Y Axis Homing Parameters",
                "subtitle.homing_z": "Z Axis Homing Parameters",
                "subtitle.mcu_extra_desc": "Manage auxiliary expansion boards (CAN bus toolhead EBB/SB2209, Raspberry Pi GPIO, expanders).",
                "subtitle.spi_sensor": "🔌 Sensor SPI Bus Communication Parameters",
                "subtitle.rtd_sensor": "🌡️ RTD Sensor Parameters (MAX31865)",
                "subtitle.fan_part": "💨 Main Part Cooling Fan ([fan])",
                "subtitle.res_tester": "📊 Automatic Resonance Tester ([resonance_tester])",
                "subtitle.probe_z_offset": "📏 Probe Z-Offset Calibration ([probe] / [bltouch])",
                "chk.host_temp": "Enable Raspberry Pi / Host CPU Temperature Sensor",
                "chk.mcu_temp": "Enable Motherboard Microcontroller (MCU) Temperature Sensor",
                "chk.standalone_mode": "Standalone Mode:",
                "chk.hold_current": "Enable Motor Hold Current (hold_current)",
                "chk.sense_resistor": "Specify Sense Resistor Value (sense_resistor)",
                "chk.interpolate": "256 Microstep Interpolation (interpolate: True)",
                "chk.sensorless": "Sensorless Homing (Virtual Endstop)",
                "chk.adxl": "Enable ADXL345 Accelerometer (Toolhead/Bed resonance measurement)",
                "chk.virtual_sd": "[virtual_sdcard] - Enable printing G-Code files from Moonraker",
                "chk.pause_resume": "[pause_resume] - Enable Native Pause and Resume Commands",
                "chk.display_status": "[display_status] - Enable Status and Progress Updates",
                "chk.respond": "[respond] - Enable Console Messages and M118 Responses",
                "chk.safe_z_home": "Enable Safe Z Home (Home Z in bed center)",
                "chk.input_shaper": "Enable Input Shaper Filter (Eliminate Ghosting / Ringing)",
                "chk.resonance_tester": "Enable Resonance Tester Section (Automated resonance sweep with accelerometer)",
                "tag.hardware_layout": "Hardware Layout",
                "tag.thermal_sensors": "Thermal Sensors",
                "tag.hotend_thermal": "Hotend Thermal",
                "tag.pid_control": "PID Control",
                "tag.leveling_sensor": "Leveling Sensor",
                "tag.resonances_z_offset": "Resonances & Z-Offset",
                "tag.core_features": "Core Features",
                "tag.delta_geometry": "Delta Geometry"
        }
};

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
                "title": "Active Configuration File",
                "desc": "Select which Klipper configuration file to load, view, or edit from Moonraker.",
                "tip": "Typically printer.cfg"
        },
        "printer-kinematics": {
                "param": "kinematics",
                "title": "Main Kinematics Type",
                "desc": "Defines the mechanical kinematic structure of the printer (Cartesian, CoreXY, CoreXZ, Delta, Hybrid CoreXY, etc.). Determines the math converting G-Code coordinates into individual motor steps.",
                "tip": "Ender 3/Prusa: cartesian | Voron 2.4/Trident/Bambu: corexy | Delta: delta"
        },
        "printer-max-velocity": {
                "param": "max_velocity",
                "title": "Maximum Velocity",
                "desc": "Maximum toolhead travel speed allowed on the horizontal XY plane.",
                "unit": "mm/s",
                "tip": "Typical: 150 - 300 mm/s (standard bedslinger), 300 - 600+ mm/s (high-performance CoreXY)"
        },
        "printer-max-accel": {
                "param": "max_accel",
                "title": "Maximum Acceleration",
                "desc": "Maximum acceleration permitted for the toolhead. Reduces print times without causing lost steps or excessive vibrations.",
                "unit": "mm/s²",
                "tip": "Typical: 3000 - 5000 mm/s² (Cartesian), 5000 - 20000+ mm/s² (CoreXY with input shaper)"
        },
        "printer-cruise-ratio": {
                "param": "minimum_cruise_ratio",
                "title": "Minimum Cruise Ratio",
                "desc": "Minimum fraction of travel distance spent at constant cruise velocity before decelerating. Replaces legacy max_accel_to_decel in modern Klipper.",
                "tip": "Default: 0.5 (50% cruise)"
        },
        "printer-square-corner": {
                "param": "square_corner_velocity",
                "title": "Square Corner Velocity",
                "desc": "Maximum velocity at which the toolhead may negotiate a 90° corner without decelerating to zero. Higher values increase speed but can cause ringing on sharp corners.",
                "unit": "mm/s",
                "tip": "Typical: 5.0 mm/s (conservative/detailed) up to 8.0 - 10.0 mm/s (fast)"
        },
        "printer-max-z-velocity": {
                "param": "max_z_velocity",
                "title": "Maximum Z Velocity",
                "desc": "Maximum vertical travel speed allowed for the Z axis. Limits rotation speed of Z leadscrews or belts.",
                "unit": "mm/s",
                "tip": "T8 leadscrews: 10 - 25 mm/s | Belted Z: 30 - 60 mm/s"
        },
        "printer-max-z-accel": {
                "param": "max_z_accel",
                "title": "Maximum Z Acceleration",
                "desc": "Maximum acceleration applied during Z axis vertical motions (including z-hops during retractions).",
                "unit": "mm/s²",
                "tip": "Typical: 100 - 350 mm/s²"
        },
        "printer-max-accel-to-decel": {
                "param": "max_accel_to_decel",
                "title": "Max Accel to Decel (Legacy)",
                "desc": "Deprecated Klipper parameter limiting transitional acceleration. In modern systems, it is recommended to leave empty and use minimum_cruise_ratio.",
                "unit": "mm/s²"
        },
        "check-enable-idex": {
                "param": "[dual_carriage]",
                "title": "Enable IDEX Kinematics",
                "desc": "Enables support for dual independent carriage (IDEX) printers, allowing independent control of two extruders sharing the same X axis gantry.",
                "tip": "Automatically generates the [dual_carriage] section in config"
        },
        "select-z-motor-count": {
                "param": "[stepper_z*]",
                "title": "Number of Z Axis Motors",
                "desc": "Specifies how many independent motors drive the Z axis (1, 2, 3, or 4). Enables automatic bed or gantry leveling via Z_TILT_ADJUST (2-3 motors) or QUAD_GANTRY_LEVEL (4 motors).",
                "tip": "Configures stepper_z, stepper_z1, stepper_z2, stepper_z3 tabs"
        },
        "delta-arm-length": {
                "param": "arm_length",
                "title": "Delta Push Rod Length",
                "desc": "Joint-to-joint length of diagonal push rods on Delta kinematic printers.",
                "unit": "mm"
        },
        "delta-radius": {
                "param": "delta_radius",
                "title": "Delta Horizontal Radius",
                "desc": "Radius of the horizontal circle formed by the delta towers relative to the effector center.",
                "unit": "mm"
        },
        "delta-print-radius": {
                "param": "print_radius",
                "title": "Delta Printable Radius",
                "desc": "Radius of the maximum circular printable area on a Delta kinematic build plate.",
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
                "unit": "mm/s",
                "tip": "Typically 40 - 80 mm/s"
        },
        "x-homing-retract-dist": {
                "param": "homing_retract_dist",
                "title": "Homing Retract Distance",
                "desc": "Distance the axis backs off after the first endstop contact before making the second precision touch.",
                "unit": "mm",
                "tip": "Typically 3 - 5 mm. Set to 0 for sensorless homing."
        },
        "x-homing-retract-speed": {
                "param": "homing_retract_speed",
                "title": "Homing Retract Speed",
                "desc": "Speed at which the axis moves away from the endstop before the second touch.",
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
                "title": "Dual Carriage X2 Homing Retract",
                "desc": "Retract distance after endstop contact for the secondary X2 carriage.",
                "unit": "mm"
        },
        "dc-homing-retract-speed": {
                "param": "homing_retract_speed",
                "title": "Dual Carriage X2 Retract Speed",
                "desc": "Disengagement speed from the endstop for the secondary X2 carriage.",
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
                "title": "Y Axis Homing Retract Distance",
                "desc": "Distance the Y axis backs off after the first endstop contact.",
                "unit": "mm"
        },
        "y-homing-retract-speed": {
                "param": "homing_retract_speed",
                "title": "Y Axis Homing Retract Speed",
                "desc": "Speed at which the Y axis moves away from the endstop before the second touch.",
                "unit": "mm/s"
        },
        "z-pos-min": {
                "param": "position_min",
                "title": "Minimum Travel Position",
                "desc": "Minimum coordinate reachable on this axis.",
                "unit": "mm",
                "tip": "Recommended: -2.0 to -5.0 mm to calibrate Z-Offset"
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
                "unit": "mm/s",
                "tip": "Typically 5 - 15 mm/s to prevent hard collisions"
        },
        "z-homing-retract-dist": {
                "param": "homing_retract_dist",
                "title": "Z Axis Homing Retract Distance",
                "desc": "Lift distance of the toolhead after first contact before the second probing move.",
                "unit": "mm",
                "tip": "Recommended: 3 - 5 mm"
        },
        "z-homing-retract-speed": {
                "param": "homing_retract_speed",
                "title": "Z Axis Homing Retract Speed",
                "desc": "Lift speed between the first and second homing touch.",
                "unit": "mm/s"
        },
        "mcu-conn-type": {
                "param": "connection_type",
                "title": "MCU Board Connection Method",
                "desc": "Indicates whether the mainboard communicates with the host via USB serial (/dev/serial/by-id/...) or 2-wire CAN Bus network.",
                "tip": "USB Serial for conventional mainboards, CAN Bus for toolhead boards (e.g., EBB)"
        },
        "mcu-serial": {
                "param": "serial",
                "title": "MCU Serial Path",
                "desc": "Linux USB serial device path (/dev/serial/by-id/...).",
                "tip": "Find via terminal using: ls /dev/serial/by-id/*"
        },
        "mcu-canbus-uuid": {
                "param": "canbus_uuid",
                "title": "CAN Bus UUID",
                "desc": "12-digit hexadecimal unique identifier for CAN board.",
                "tip": "Query via terminal using: python3 ~/klipper/scripts/canbus_query.py can0"
        },
        "mcu-baud": {
                "param": "baud",
                "title": "Baud Rate",
                "desc": "Serial baud rate speed (default 250000).",
                "unit": "baud",
                "tip": "Klipper standard value: 250000"
        },
        "mcu-restart-method": {
                "param": "restart_method",
                "title": "MCU Hardware Reset Method",
                "desc": "Algorithm used by Klipper to reboot the microcontroller board when executing FIRMWARE_RESTART.",
                "tip": "arduino (DTR), cheetah, command (software), rpi_usb (USB power toggle)"
        },
        "check-enable-host-temp": {
                "param": "[temperature_sensor host]",
                "title": "Host / Raspberry Pi CPU Temperature Sensor",
                "desc": "Enables continuous CPU temperature monitoring of the Raspberry Pi or host computer in Mainsail dashboard.",
                "tip": "Creates [temperature_sensor raspberry_pi]"
        },
        "check-enable-mcu-temp": {
                "param": "[temperature_sensor mcu]",
                "title": "Mainboard MCU Temperature Sensor",
                "desc": "Enables internal thermal sensor monitoring integrated into the mainboard microcontroller chip.",
                "tip": "Creates [temperature_sensor mcu]"
        },
        "stepper-step-pin": {
                "param": "step_pin",
                "title": "Step Signal Pin",
                "desc": "Microcontroller pin that pulses step clock cycles to the stepper driver.",
                "tip": "E.g., PA0, PE3, PC1"
        },
        "stepper-dir-pin": {
                "param": "dir_pin",
                "title": "Direction Pin",
                "desc": "Pin setting the motor rotation direction. Prepend ! to invert direction.",
                "tip": "E.g., PA1 or !PA1"
        },
        "check-invert-dir": {
                "param": "! (dir_pin)",
                "title": "Invert Motor Direction",
                "desc": "Prepends exclamation mark ! to dir_pin to invert the axis travel direction.",
                "tip": "Select if the axis moves away from the endstop instead of towards it"
        },
        "stepper-enable-pin": {
                "param": "enable_pin",
                "title": "Enable Pin",
                "desc": "Pin enabling driver power (usually active-low, requiring !).",
                "tip": "E.g., !PA2"
        },
        "check-invert-enable": {
                "param": "! (enable_pin)",
                "title": "Invert Enable Logic",
                "desc": "Toggles the exclamation mark ! on the driver enable pin (active-low inverted logic).",
                "tip": "Generally enabled (!) for almost all modern stepper drivers"
        },
        "stepper-microsteps": {
                "param": "microsteps",
                "title": "Microstep Resolution",
                "desc": "Microstepping multiplier set inside the driver for smooth motion.",
                "tip": "Recommended: 16 or 32"
        },
        "stepper-steps-rotation": {
                "param": "full_steps_per_rotation",
                "title": "Motor Full Steps per Full Rotation",
                "desc": "Number of physical full steps per 360° motor revolution: 200 for conventional 1.8° step motors, 400 for high-precision 0.9° step motors.",
                "tip": "1.8° = 200 steps | 0.9° = 400 steps"
        },
        "stepper-rotation-distance": {
                "param": "rotation_distance",
                "title": "Rotation Distance",
                "desc": "Linear distance (in mm) traveled by the axis for one full 360° turn of the stepper motor.",
                "unit": "mm",
                "tip": "GT2 20T: 40.0 | Lead screw T8x8: 8.0"
        },
        "stepper-endstop-pin": {
                "param": "endstop_pin",
                "title": "Endstop Pin",
                "desc": "Digital microcontroller pin connected to the physical endstop switch for this axis. Prepend ^ if internal pull-up is required, or tmc2209_stepper_x:virtual_endstop for sensorless homing.",
                "tip": "E.g., ^PA3 or tmc2209_stepper_x:virtual_endstop"
        },
        "driver-model-select": {
                "param": "Driver IC",
                "title": "Driver Chip Model",
                "desc": "Selects the integrated driver chip: TMC2209, TMC2208, TMC2240, TMC5160, TMC2130, or Standalone (A4988, DRV8825). Defines the configuration section.",
                "tip": "TMC2209 is the most popular for quiet operation and reliability"
        },
        "driver-conn-type-select": {
                "param": "Bus Protocol",
                "title": "Driver Connection Type",
                "desc": "Protocol used by the microcontroller to configure the TMC chip: UART (single-wire bidirectional), SPI (high-speed 4-wire serial bus), or Standalone (hardware pins only).",
                "tip": "UART for TMC2209/TMC2208 | SPI for TMC5160/TMC2130"
        },
        "driver-uart-pin": {
                "param": "uart_pin",
                "title": "UART Pin",
                "desc": "MCU digital serial pin configuring TMC driver registers.",
                "tip": "E.g., PC11, PD5, etc."
        },
        "driver-tx-pin": {
                "param": "tx_pin",
                "title": "UART TX Pin (Optional)",
                "desc": "Dedicated transmission pin if the motherboard uses separate RX and TX lines for UART communication.",
                "tip": "Leave empty if the board uses single-wire UART with a resistor"
        },
        "driver-uart-address": {
                "param": "uart_address",
                "title": "Hardware UART Address",
                "desc": "Unique hardware address (0 to 3) assigned to the TMC driver when multiple drivers share the same physical UART pin.",
                "tip": "Typically 0 for X, 1 for Y, 2 for Z, 3 for E0 on shared bus boards"
        },
        "driver-cs-pin": {
                "param": "cs_pin",
                "title": "SPI Chip Select (CS) Pin",
                "desc": "Digital pin that enables communication with this specific driver during SPI transactions.",
                "tip": "E.g., PD11, PB12"
        },
        "driver-spi-mode": {
                "param": "spi_mode",
                "title": "SPI Bus Mode",
                "desc": "Selects whether to use the microcontroller hardware SPI bus controller or emulate SPI via software bit-banging on arbitrary pins.",
                "tip": "Hardware SPI offers highest speed and lowest CPU load"
        },
        "driver-spi-bus": {
                "param": "spi_bus",
                "title": "Hardware SPI Bus Name",
                "desc": "Motherboard hardware SPI controller identifier (e.g., spi1, spi2, spi3a, spi4).",
                "tip": "Refer to your motherboard official pinout documentation"
        },
        "driver-spi-sclk": {
                "param": "spi_software_sclk_pin",
                "title": "Software SPI Clock Pin",
                "desc": "Digital microcontroller pin providing clock synchronization (SCK/SCLK) for software SPI.",
                "tip": "E.g., PA5, PB13"
        },
        "driver-spi-mosi": {
                "param": "spi_software_mosi_pin",
                "title": "Software SPI MOSI Pin",
                "desc": "Master Out Slave In pin sending configuration commands from MCU to driver.",
                "tip": "E.g., PA7, PB15"
        },
        "driver-spi-miso": {
                "param": "spi_software_miso_pin",
                "title": "Software SPI MISO Pin",
                "desc": "Master In Slave Out pin reading status and diagnostic registers from driver.",
                "tip": "E.g., PA6, PB14"
        },
        "driver-run-current": {
                "param": "run_current",
                "title": "Operating Run Current",
                "desc": "RMS current supplied to the stepper motor windings during movement.",
                "unit": "A",
                "tip": "NEMA17 standard: 0.65 - 0.85A | High-torque: 1.0 - 1.4A"
        },
        "driver-stealthchop": {
                "param": "stealthchop_threshold",
                "title": "StealthChop Mode",
                "desc": "Enables ultra-quiet StealthChop mode. Disable (0) for high-speed SpreadCycle power.",
                "tip": "Enabled (999999) for silence | Disabled (0) for maximum torque and speed"
        },
        "check-enable-hold-current": {
                "param": "hold_current (checkbox)",
                "title": "Enable Hold Current",
                "desc": "Allows reducing current when the motor is standstill. Not recommended with TMC2209 and sensorless homing as sudden current switching can cause lost microsteps.",
                "tip": "Often left disabled for maximum stability"
        },
        "driver-hold-current": {
                "param": "hold_current",
                "title": "Hold Current",
                "desc": "Current supplied when motor is standing still in stationary position.",
                "unit": "A",
                "tip": "Typically 60-70% of run_current if enabled"
        },
        "check-enable-sense-resistor": {
                "param": "sense_resistor (checkbox)",
                "title": "Specify Sense Resistor",
                "desc": "Allows manually setting the exact current sampling shunt resistor value soldered on the driver module.",
                "tip": "Required if different from factory default (0.110 ohm)"
        },
        "driver-sense-resistor": {
                "param": "sense_resistor",
                "title": "Current Sense Resistor",
                "desc": "Value of the shunt resistor on the driver module to measure current.",
                "unit": "Ω",
                "tip": "TMC2209: 0.110 ohm"
        },
        "driver-interpolate": {
                "param": "interpolate",
                "title": "256 Microstep Interpolation",
                "desc": "Driver automatically interpolates microsteps to 256 internal microsteps.",
                "tip": "Recommended: True for TMC2209/TMC2208"
        },
        "driver-sensorless-enable": {
                "param": "virtual_endstop (Sensorless)",
                "title": "Sensorless Homing (StallGuard)",
                "desc": "Uses TMC StallGuard back-EMF monitoring to detect mechanical stall without physical limit switches.",
                "tip": "Eliminates physical endstop switches and wiring on X and Y"
        },
        "driver-diag-pin": {
                "param": "diag_pin",
                "title": "StallGuard Diag Pin",
                "desc": "Pin signaling mechanical stall for sensorless homing.",
                "tip": "Often requires internal pull-up (^)"
        },
        "driver-sgthrs": {
                "param": "driver_SGTHRS / driver_SGT",
                "title": "StallGuard Sensitivity",
                "desc": "Collision sensitivity for sensorless homing. TMC2209: 0 to 255 (typical 60 - 120).",
                "tip": "TMC2209: start at 100 and tune in steps of 5 (typical: 60 - 120)"
        },
        "extruder-step-pin": {
                "param": "step_pin",
                "title": "Step Signal Pin",
                "desc": "Microcontroller pin that pulses step clock cycles to the stepper driver.",
                "tip": "E.g., PB4, PD6"
        },
        "extruder-dir-pin": {
                "param": "dir_pin",
                "title": "Direction Pin",
                "desc": "Pin setting the motor rotation direction. Prepend ! to invert direction.",
                "tip": "E.g., PB3 or !PB3"
        },
        "extruder-enable-pin": {
                "param": "enable_pin",
                "title": "Enable Pin",
                "desc": "Pin enabling driver power (usually active-low, requiring !).",
                "tip": "E.g., !PB5"
        },
        "extruder-rot-dist": {
                "param": "rotation_distance",
                "title": "Rotation Distance",
                "desc": "Linear distance (in mm) traveled by the filament for one full 360° turn of the extruder motor.",
                "unit": "mm",
                "tip": "Calibrate with 100mm extrusion test"
        },
        "extruder-gear-ratio": {
                "param": "gear_ratio",
                "title": "Gear Reduction Ratio",
                "desc": "Mechanical transmission ratio between motor pinion and extruder drive gears.",
                "tip": "BMG: 50:17 | Clockwork 1/2: 50:10 | Orbiter 2.0: 7.5:1 | Direct drive: leave empty"
        },
        "extruder-nozzle-dia": {
                "param": "nozzle_diameter",
                "title": "Nozzle Orifice Diameter",
                "desc": "Hole diameter of the installed nozzle on the hotend.",
                "unit": "mm",
                "tip": "Standard: 0.40 mm"
        },
        "extruder-filament-dia": {
                "param": "filament_diameter",
                "title": "Filament Diameter",
                "desc": "Nominal diameter of the thermoplastic filament (1.75 mm or 2.85 mm).",
                "unit": "mm",
                "tip": "Standard: 1.75 mm (or 2.85 mm for special systems)"
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
                "tip": "Set the exact model to prevent dangerous temperature measurement errors"
        },
        "extruder-heater-pin": {
                "param": "heater_pin",
                "title": "Heater Cartridge Pin",
                "desc": "MCU MOSFET pin driving heater PWM power.",
                "tip": "E.g., PA2, PB10"
        },
        "extruder-sensor-pin": {
                "param": "sensor_pin",
                "title": "Sensor ADC Pin",
                "desc": "Microcontroller analog ADC pin reading temperature.",
                "tip": "E.g., PC4, PA1"
        },
        "extruder-min-temp": {
                "param": "min_temp",
                "title": "Thermal Safety Minimum",
                "desc": "Minimum allowed temperature (°C). Triggers shutdown if disconnected.",
                "unit": "°C",
                "tip": "Typically 0°C or -10°C"
        },
        "extruder-max-temp": {
                "param": "max_temp",
                "title": "Thermal Safety Maximum",
                "desc": "Maximum allowed temperature before emergency thermal shutdown.",
                "unit": "°C",
                "tip": "PTFE lined: max 250°C | All-Metal: 280 - 300°C | High-temp hotend: 350 - 500°C"
        },
        "extruder-min-extrude": {
                "param": "min_extrude_temp",
                "title": "Minimum Extrude Temperature",
                "desc": "Safety threshold preventing cold extrusion commands.",
                "unit": "°C",
                "tip": "Standard: 170°C"
        },
        "extruder-control-type": {
                "param": "control",
                "title": "Thermal Control Algorithm",
                "desc": "PID (Proportional Integral Derivative) or Watermark hysteresis.",
                "tip": "Always use PID for the hotend for millimeter-precise thermal stability"
        },
        "extruder-pid-kp": {
                "param": "pid_Kp",
                "title": "PID Proportional Gain",
                "desc": "Calibrated using PID_CALIBRATE command.",
                "tip": "Calculated via PID autotune"
        },
        "extruder-pid-ki": {
                "param": "pid_Ki",
                "title": "PID Integral Gain",
                "desc": "Corrects accumulated thermal drift.",
                "tip": "Calculated via PID autotune"
        },
        "extruder-pid-kd": {
                "param": "pid_Kd",
                "title": "PID Derivative Gain",
                "desc": "Damps rapid temperature fluctuations.",
                "tip": "Calculated via PID autotune"
        },
        "extruder-max-delta": {
                "param": "max_delta",
                "title": "Watermark Hysteresis Tolerance",
                "desc": "Allowed thermal temperature window around the target setpoint when using the watermark algorithm.",
                "unit": "°C"
        },
        "extruder-rtd-nominal-r": {
                "param": "rtd_nominal_r",
                "title": "Nominal RTD Probe Resistance at 0°C",
                "desc": "Electrical resistance of platinum resistance temperature detector at 0°C: 100 for PT100 sensors, 1000 for PT1000 sensors.",
                "unit": "Ω",
                "tip": "PT100: 100 | PT1000: 1000"
        },
        "extruder-rtd-reference-r": {
                "param": "rtd_reference_r",
                "title": "RTD Module Reference Resistance",
                "desc": "Reference resistor value soldered on the MAX31865 board (typically 430 ohm for PT100, 4300 ohm for PT1000).",
                "unit": "Ω",
                "tip": "PT100 module: 430 | PT1000 module: 4300"
        },
        "extruder-rtd-num-wires": {
                "param": "rtd_num_of_wires",
                "title": "RTD Probe Wire Count",
                "desc": "Physical wiring connection of the RTD probe (2, 3, or 4 wires). 3 and 4 wire configurations cancel cable lead resistance for maximum precision.",
                "tip": "2 wires (economical), 4 wires (maximum industrial accuracy)"
        },
        "extruder-rtd-filter": {
                "param": "rtd_use_50Hz_filter",
                "title": "Mains AC Noise Filter",
                "desc": "Selects 50Hz (Europe/230V standard) or 60Hz (USA/120V) notch filter to suppress electrical noise on sensor readings.",
                "tip": "50Hz for Europe, 60Hz for Americas"
        },
        "bed-sensor-type": {
                "param": "sensor_type",
                "title": "Temperature Sensor Model",
                "desc": "Exact model of thermistor, thermocouple or RTD probe.",
                "tip": "Typically Generic 3950 or EPCOS 100K B57560G104F"
        },
        "bed-heater-pin": {
                "param": "heater_pin",
                "title": "Heater Cartridge Pin",
                "desc": "MCU MOSFET pin driving heater PWM power.",
                "tip": "E.g., PA1, PC9"
        },
        "bed-sensor-pin": {
                "param": "sensor_pin",
                "title": "Sensor ADC Pin",
                "desc": "Microcontroller analog ADC pin reading temperature.",
                "tip": "E.g., PC3, PA0"
        },
        "bed-min-temp": {
                "param": "min_temp",
                "title": "Thermal Safety Minimum",
                "desc": "Minimum allowed temperature (°C). Triggers shutdown if disconnected.",
                "unit": "°C",
                "tip": "Typically 0°C"
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
                "tip": "24V DC bed: pid | 230V AC bed with SSR: watermark or pid"
        },
        "bed-pid-kp": {
                "param": "pid_Kp",
                "title": "PID Proportional Gain",
                "desc": "Calibrated using PID_CALIBRATE command.",
                "tip": "Calculated via PID autotune"
        },
        "bed-pid-ki": {
                "param": "pid_Ki",
                "title": "PID Integral Gain",
                "desc": "Corrects accumulated thermal drift.",
                "tip": "Calculated via PID autotune"
        },
        "bed-pid-kd": {
                "param": "pid_Kd",
                "title": "PID Derivative Gain",
                "desc": "Damps rapid temperature fluctuations.",
                "tip": "Calculated via PID autotune"
        },
        "bed-max-delta": {
                "param": "max_delta",
                "title": "Bed Watermark Hysteresis Tolerance",
                "desc": "Allowed temperature variation around target setpoint with watermark control (e.g. 1.0 - 2.0°C).",
                "unit": "°C"
        },
        "probe-type-select": {
                "param": "Probe Type",
                "title": "Bed Leveling Probe Type",
                "desc": "Type of bed sensor installed: BLTouch / 3DTouch, mechanical microswitch (Klicky / Voron Tap), inductive probe (Omron / SuperPinda), Beacon, or BTT Eddy eddy-current probe.",
                "tip": "Configures the appropriate section ([probe], [bltouch], etc.)"
        },
        "probe-sensor-pin": {
                "param": "sensor_pin",
                "title": "Probe Sensor Pin",
                "desc": "Microcontroller digital input pin connected to the probe trigger signal.",
                "tip": "E.g., ^PC14, ^PA0"
        },
        "probe-control-pin": {
                "param": "control_pin",
                "title": "Servo Control Pin (BLTouch)",
                "desc": "PWM pin controlling pin deployment and retraction for BLTouch and clone sensors.",
                "tip": "E.g., PA8, PB0"
        },
        "probe-x-offset": {
                "param": "x_offset",
                "title": "Probe-to-Nozzle X Offset",
                "desc": "Horizontal distance in millimeters from nozzle to probe trigger point along X axis. Positive if probe is to the right of nozzle, negative if to the left.",
                "unit": "mm",
                "tip": "0.0 if probe is coaxial with nozzle (e.g. Voron Tap)"
        },
        "probe-y-offset": {
                "param": "y_offset",
                "title": "Probe-to-Nozzle Y Offset",
                "desc": "Horizontal distance in millimeters from nozzle to probe along Y axis. Positive if probe is behind the nozzle, negative if in front.",
                "unit": "mm"
        },
        "probe-z-offset": {
                "param": "z_offset",
                "title": "Probe Z-Offset",
                "desc": "Vertical distance between nozzle tip and probe trigger point.",
                "unit": "mm",
                "tip": "A larger positive value brings the nozzle closer to the print bed"
        },
        "probe-samples": {
                "param": "samples",
                "title": "Samples per Point",
                "desc": "Number of consecutive probe readings taken at each grid point to eliminate noise and spurious readings.",
                "tip": "Recommended: 2 or 3 samples per point"
        },
        "probe-samples-result": {
                "param": "samples_result",
                "title": "Sample Aggregation Method",
                "desc": "How multiple readings on the same point are combined: median (median value, most robust against outliers) or average (arithmetic mean).",
                "tip": "Recommended: median"
        },
        "check-enable-safe-z": {
                "param": "[safe_z_home]",
                "title": "Enable Safe Z Home",
                "desc": "Homes Z axis at bed center instead of corner limit switches, preventing nozzle crashes when using toolhead-mounted probes.",
                "tip": "Mandatory when using a probe (BLTouch/Tap) as Z endstop"
        },
        "safe-z-pos": {
                "param": "home_xy_position",
                "title": "Safe Z Homing Coordinates",
                "desc": "X, Y coordinates where the toolhead moves before probing for Z homing (typically bed center).",
                "tip": "E.g., 150, 150 for a 300x300 bed"
        },
        "safe-z-hop": {
                "param": "z_hop",
                "title": "Safe Z-Hop Lift Clearance",
                "desc": "Vertical clearance distance to lift Z before and after homing to prevent scratching bed surface.",
                "unit": "mm",
                "tip": "Recommended: 5 - 10 mm"
        },
        "safe-z-speed": {
                "param": "speed",
                "title": "Safe Z Travel Speed",
                "desc": "Toolhead travel speed when moving to safe Z homing coordinates.",
                "unit": "mm/s",
                "tip": "Recommended: 50 - 100 mm/s"
        },
        "mesh-min": {
                "param": "mesh_min",
                "title": "Bed Mesh Minimum",
                "desc": "Minimum X,Y probe coordinates for heightmap leveling.",
                "tip": "E.g., 25, 25"
        },
        "mesh-max": {
                "param": "mesh_max",
                "title": "Bed Mesh Maximum",
                "desc": "Maximum X,Y probe coordinates for heightmap leveling.",
                "tip": "E.g., 275, 275"
        },
        "mesh-probe-count": {
                "param": "probe_count",
                "title": "Mesh Grid Resolution",
                "desc": "Number of sample points along X and Y (e.g. 5,5 or 7,7).",
                "tip": "E.g., 5,5 (25 points) or 7,7 (49 points for large beds)"
        },
        "mesh-algorithm": {
                "param": "algorithm",
                "title": "Mesh Interpolation Algorithm",
                "desc": "Mathematical algorithm used to calculate height between sampled points: bicubic (recommended for dense 5x5+ grids) or lagrange (only for small 3x3 grids).",
                "tip": "Recommended: bicubic"
        },
        "z-tilt-positions": {
                "param": "z_positions",
                "title": "Z Motor Pivot Locations (z_positions)",
                "desc": "Physical (X, Y) pivot or leadscrew coordinates of independent Z motors used by Z_TILT_ADJUST.",
                "tip": "One pair of X, Y coordinates per Z motor"
        },
        "z-tilt-points": {
                "param": "points",
                "title": "Z-Tilt Probe Points",
                "desc": "Coordinates on the bed where the probe measures tilt to compute corrective leveling steps.",
                "tip": "Sample points on bed corresponding to Z motor positions"
        },
        "z-tilt-retries": {
                "param": "retries",
                "title": "Maximum Z-Tilt Retries",
                "desc": "Maximum number of measurement and adjustment cycles permitted to achieve target leveling tolerance.",
                "tip": "Typically 5 - 10 retries"
        },
        "z-tilt-tolerance": {
                "param": "retry_tolerance",
                "title": "Z-Tilt Leveling Tolerance",
                "desc": "Maximum allowable height difference across probe points before considering bed leveled.",
                "unit": "mm",
                "tip": "Recommended: 0.0075 - 0.02 mm"
        },
        "qgl-corners": {
                "param": "gantry_corners",
                "title": "Gantry Outer Corners (Voron QGL)",
                "desc": "Physical X, Y coordinates of the 4 outer gantry corners on Voron 2.4 style Quad Gantry Level printers.",
                "tip": "Consult printer mechanical cad or documentation"
        },
        "qgl-points": {
                "param": "points",
                "title": "4 QGL Probe Points",
                "desc": "Bed probe coordinates sampled to compute independent 4-motor gantry leveling.",
                "tip": "4 corners of bed accessible by probe"
        },
        "qgl-retries": {
                "param": "retries",
                "title": "Maximum QGL Retries",
                "desc": "Maximum probe cycles before failing Quad Gantry Level.",
                "tip": "Typically 5 - 10"
        },
        "qgl-tolerance": {
                "param": "retry_tolerance",
                "title": "Quad Gantry Level Tolerance",
                "desc": "Maximum allowable height variance among the 4 gantry corners.",
                "unit": "mm",
                "tip": "Recommended: 0.0075 - 0.01 mm"
        },
        "fan-part-pin": {
                "param": "pin ([fan])",
                "title": "Part Cooling Fan Pin",
                "desc": "PWM pin connected to the print cooling fan directed at the extruded layer, controllable via G-Code M106.",
                "tip": "E.g., PA8, PC6"
        },
        "fan-part-kick": {
                "param": "kick_start_time",
                "title": "Fan Kick Start Time",
                "desc": "Duration of initial 100% duty-cycle pulse (in seconds) to overcome fan rotor inertia upon start.",
                "unit": "s",
                "tip": "Recommended: 0.100 - 0.500 s"
        },
        "fan-part-off-below": {
                "param": "off_below",
                "title": "Fan Minimum Off Below Threshold",
                "desc": "Minimum duty cycle below which power is cut to avoid fan motor humming without spinning.",
                "tip": "Typically 0.10 (10%)"
        },
        "check-enable-shaper": {
                "param": "[input_shaper]",
                "title": "Enable Input Shaper Filter",
                "desc": "Activates resonance frequency damping to eliminate ghosting and ringing artifacts on printed perimeters at high speeds.",
                "tip": "Dramatically improves surface finish"
        },
        "shaper-freq-x": {
                "param": "shaper_freq_x",
                "title": "X Resonance Frequency",
                "desc": "Natural vibration resonance frequency of X axis in Hz.",
                "unit": "Hz",
                "tip": "Typically between 35 and 85 Hz"
        },
        "shaper-type-x": {
                "param": "shaper_type_x",
                "title": "X Shaper Filter Type",
                "desc": "Vibration damping algorithm (e.g. MZV, EI, ZV).",
                "tip": "MZV and EI are among the most balanced shaper types"
        },
        "shaper-freq-y": {
                "param": "shaper_freq_y",
                "title": "Y Resonance Frequency",
                "desc": "Natural vibration resonance frequency of Y axis in Hz.",
                "unit": "Hz",
                "tip": "Typically between 35 and 85 Hz"
        },
        "shaper-type-y": {
                "param": "shaper_type_y",
                "title": "Y Shaper Filter Type",
                "desc": "Vibration damping algorithm for Y axis.",
                "tip": "MZV or EI recommended"
        },
        "check-enable-adxl": {
                "param": "[adxl345]",
                "title": "Enable ADXL345 Accelerometer",
                "desc": "Configures digital SPI accelerometer for automated real-time mechanical resonance calibration with TEST_RESONANCES command.",
                "tip": "Connects to host board, toolhead CAN board, or Raspberry Pi GPIO"
        },
        "adxl-cs-pin": {
                "param": "cs_pin",
                "title": "ADXL345 Chip Select (CS) Pin",
                "desc": "Digital pin selecting the accelerometer chip on SPI bus.",
                "tip": "E.g., rpi:None or gpio pin on toolhead board"
        },
        "adxl-spi-bus": {
                "param": "spi_bus",
                "title": "Accelerometer SPI Bus",
                "desc": "Hardware SPI bus identifier used to communicate with the accelerometer (e.g. spidev0.0, spi1).",
                "tip": "E.g., spidev0.0"
        },
        "adxl-axes-map": {
                "param": "axes_map",
                "title": "Accelerometer Axes Orientation",
                "desc": "Mapping of accelerometer physical chip axes relative to printer movement axes.",
                "tip": "Default: x,y,z (invertible e.g. -x,z,y when mounted vertically)"
        },
        "adxl-rate": {
                "param": "rate",
                "title": "ADXL345 Sampling Rate",
                "desc": "Data acquisition sampling rate of the accelerometer (from 1600 Hz to 3200 Hz).",
                "unit": "Hz",
                "tip": "Klipper standard value: 3200"
        },
        "res-accel-chip": {
                "param": "accel_chip",
                "title": "Reference Accelerometer Chip Name",
                "desc": "Name of the accelerometer section utilized by the resonance tester (e.g., adxl345).",
                "tip": "Matches the name defined in [adxl345]"
        },
        "res-probe-points": {
                "param": "probe_points",
                "title": "Resonance Test Coordinates",
                "desc": "X, Y, Z coordinates where the toolhead remains positioned during the resonance frequency sweep.",
                "tip": "E.g., 150, 150, 20 (bed center)"
        },
        "res-accel-per-hz": {
                "param": "accel_per_hz",
                "title": "Acceleration per Hertz",
                "desc": "Acceleration factor applied for each Hz during resonance frequency sweep.",
                "tip": "Klipper standard default: 75"
        },
        "res-max-smoothing": {
                "param": "max_smoothing",
                "title": "Maximum Allowable Smoothing",
                "desc": "Maximum permissible smoothing score when automatically calculating the optimal input shaper.",
                "tip": "Typically left unset or 0.10"
        },
        "input-moonraker-url": {
                "param": "Moonraker Base URL",
                "title": "Moonraker Instance Address",
                "desc": "IP address or hostname with port of the Moonraker server controlling Klipper (e.g. http://192.168.1.50:7125). Leave empty for automatic origin detection.",
                "tip": "Default: current browser origin (same host as Mainsail)"
        },
        "check-force-light-mode": {
                "param": "UI Theme Mode",
                "title": "Force Light Theme Mode",
                "desc": "Forces light theme mode instead of synchronizing dark theme from Mainsail.",
                "tip": "Recommended off for seamless Mainsail theme match"
        },
        "check-virtual-sd": {
                "param": "[virtual_sdcard]",
                "title": "Enable Virtual SD Card",
                "desc": "Enables Klipper to print G-Code files stored in local Moonraker/Mainsail storage directly.",
                "tip": "Essential for Mainsail and Moonraker operation"
        },
        "check-pause-resume": {
                "param": "[pause_resume]",
                "title": "Enable Pause and Resume",
                "desc": "Enables native Klipper PAUSE and RESUME commands, required for filament changes and emergency pauses.",
                "tip": "Recommended active on every 3D printer"
        },
        "check-display-status": {
                "param": "[display_status]",
                "title": "Print Progress & Status Display",
                "desc": "Provides print progress percentage and status messages to web interfaces and LCD screens.",
                "tip": "Recommended active"
        },
        "check-respond": {
                "param": "[respond]",
                "title": "Console Response Commands (M118 / RESPOND)",
                "desc": "Enables M118 and RESPOND G-Code commands to output feedback messages to Mainsail console.",
                "tip": "Useful for custom scripts and print macros"
        },
        "idle-timeout": {
                "param": "timeout ([idle_timeout])",
                "title": "Idle Timeout Duration",
                "desc": "Idle duration after which Klipper turns off stepper motors and heaters for safety and power efficiency.",
                "unit": "s",
                "tip": "Default: 600 seconds (10 minutes)"
        },
        "adxl-spi-mode": {
                "param": "spi_mode",
                "title": "ADXL345 SPI Bus Mode",
                "desc": "Hardware SPI bus or software bit-banged SPI.",
                "tip": "Hardware SPI recommended"
        },
        "adxl-spi-sclk": {
                "param": "spi_software_sclk_pin",
                "title": "ADXL345 Software SCLK Pin",
                "desc": "Digital pin providing software clock signal for accelerometer.",
                "tip": "E.g., gpio11"
        },
        "adxl-spi-mosi": {
                "param": "spi_software_mosi_pin",
                "title": "ADXL345 Software MOSI Pin",
                "desc": "Master Out Slave In pin sending configuration commands to accelerometer.",
                "tip": "E.g., gpio10"
        },
        "adxl-spi-miso": {
                "param": "spi_software_miso_pin",
                "title": "ADXL345 Software MISO Pin",
                "desc": "Master In Slave Out pin reading acceleration data from accelerometer.",
                "tip": "E.g., gpio9"
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
                // Opzioni nei menu a tendina
                if (el.tagName === 'OPTION') {
                    el.textContent = translation;
                    return;
                }

                // Pulsanti: preserva SVG e aggiorna testo o span .btn-text
                if (el.tagName === 'BUTTON') {
                    const btnText = el.querySelector('.btn-text');
                    if (btnText) {
                        btnText.textContent = translation;
                    } else {
                        const svg = el.querySelector('svg');
                        if (svg) {
                            let labelSpan = el.querySelector('.btn-label');
                            if (!labelSpan) {
                                Array.from(el.childNodes).forEach(node => {
                                    if (node.nodeType === Node.TEXT_NODE) node.remove();
                                });
                                labelSpan = document.createElement('span');
                                labelSpan.className = 'btn-label';
                                el.appendChild(labelSpan);
                            }
                            labelSpan.textContent = ' ' + translation;
                        } else {
                            el.textContent = translation;
                        }
                    }
                    return;
                }

                // Checkbox inline o contenitori con input
                if (el.classList.contains('checkbox-inline') || el.querySelector('input[type="checkbox"]')) {
                    const strong = el.querySelector('strong');
                    if (strong) {
                        strong.textContent = translation;
                        return;
                    }
                    const input = el.querySelector('input');
                    const infoCircle = el.querySelector('.info-circle');
                    el.innerHTML = '';
                    if (input) el.appendChild(input);
                    el.appendChild(document.createTextNode(' ' + translation + ' '));
                    if (infoCircle) el.appendChild(infoCircle);
                    return;
                }

                // Elementi generici (titoli card, sottotitoli, form-helper, label, span)
                const infoCircle = el.querySelector('.info-circle');
                if (translation.includes('<') && translation.includes('>')) {
                    el.innerHTML = translation;
                } else {
                    el.textContent = translation;
                }
                if (infoCircle && !el.contains(infoCircle)) {
                    el.appendChild(infoCircle);
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
