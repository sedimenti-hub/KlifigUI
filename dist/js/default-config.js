/**
 * Default Presets and Klipper Constants
 * Database dei preset, tipi di sensori, driver TMC e macro template per Klipper
 */

const KLIPPER_CONSTANTS = {
    // Tipi di Cinematica
    KINEMATICS: [
        { value: 'cartesian', label: 'Cartesiana (X, Y, Z tradizionali - es. Ender 3, Prusa, Sovol)' },
        { value: 'corexy', label: 'CoreXY (Motori A e B sincronizzati - es. Voron 2.4/Trident, RatRig, Bambu style)' },
        { value: 'corexz', label: 'CoreXZ (Movimento X e Z collegati - es. Voron Switchwire)' },
        { value: 'delta', label: 'Delta (3 bracci articolati - es. Flsun, Kossel)' },
        { value: 'rotary_delta', label: 'Rotary Delta' },
        { value: 'polar', label: 'Polare' },
        { value: 'none', label: 'Nessuna (Test banco / Senza assi di movimento)' }
    ],

    // Tipi di Termistori e Sensori Temperatura
    SENSOR_TYPES: [
        { value: 'EPCOS 100K B57560G104F', label: 'EPCOS 100K B57560G104F (Standard Creality / Ender)' },
        { value: 'Generic 3950', label: 'Generic 3950 (Molto comune su stampanti cinesi e Voron)' },
        { value: 'ATC Semitec 104GT-2', label: 'ATC Semitec 104GT-2 (E3D V6 originale / Prusa)' },
        { value: 'ATC Semitec 104NT-4-R025H42G', label: 'ATC Semitec 104NT-4-R025H42G (E3D Revo)' },
        { value: 'PT1000', label: 'PT1000 (Sensore ad alta temperatura 450°C - collegamento a 2 fili)' },
        { value: 'MAX31865', label: 'MAX31865 (Amplificatore SPI per PT100/PT1000)' },
        { value: 'NTC 100K MGB18', label: 'NTC 100K MGB18' },
        { value: 'SliceEngineering 450', label: 'Slice Engineering 450 (Mosquito / Copperhead)' },
        { value: 'T-D500', label: 'Dyze Design T-D500 (500°C)' },
        { value: 'temperature_mcu', label: 'Sensore interno MCU (Chip STM32/RP2040/Atmega)' },
        { value: 'temperature_host', label: 'Sensore Host (Raspberry Pi / Orange Pi / BTT CB1)' }
    ],

    // Driver Stepper
    STEPPER_DRIVERS: [
        { value: 'tmc2209', label: 'TMC2209 (UART silenzioso, Sensorless Homing StallGuard)' },
        { value: 'tmc2208', label: 'TMC2208 (UART silenzioso StealthChop)' },
        { value: 'tmc2226', label: 'TMC2226 (Equivalente TMC2209 con dissipazione termica migliore)' },
        { value: 'tmc5160', label: 'TMC5160 (SPI alta tensione fino a 60V - Voron ad alta velocità)' },
        { value: 'tmc2240', label: 'TMC2240 (Nuova generazione SPI/UART)' },
        { value: 'a4988', label: 'A4988 / Standard (Driver analogico senza bus dati)' }
    ],

    // Preset Estrusori
    EXTRUDER_PRESETS: {
        'creality_stock': {
            name: 'Creality Stock (Singolo ingranaggio ottone)',
            rotation_distance: 33.500,
            gear_ratio: '',
            full_steps_per_rotation: 200,
            run_current: 0.650
        },
        'bmg': {
            name: 'Bondtech BMG / Dual Drive Clone',
            rotation_distance: 22.678,
            gear_ratio: '50:17',
            full_steps_per_rotation: 200,
            run_current: 0.650
        },
        'orbiter_2': {
            name: 'LDO Orbiter v2.0 (Planetario compatto)',
            rotation_distance: 4.637,
            gear_ratio: '',
            full_steps_per_rotation: 200,
            run_current: 0.850
        },
        'voron_cw2': {
            name: 'Voron Stealthburner / Clockwork 2',
            rotation_distance: 22.678,
            gear_ratio: '50:10',
            full_steps_per_rotation: 200,
            run_current: 0.600
        },
        'sherpa_mini': {
            name: 'Sherpa Mini (8T o 10T)',
            rotation_distance: 22.678,
            gear_ratio: '50:10',
            full_steps_per_rotation: 200,
            run_current: 0.650
        },
        'titan': {
            name: 'E3D Titan Extruder (Rapporto 3:1)',
            rotation_distance: 22.900,
            gear_ratio: '3:1',
            full_steps_per_rotation: 200,
            run_current: 0.700
        }
    },


    // Macro Template Essenziali Pronte per Klipper & Mainsail
    MACRO_TEMPLATES: {
        'START_PRINT': {
            description: 'Macro iniziale eseguita prima di ogni stampa con preriscaldamento ed estrusione linea purge',
            gcode: `[gcode_macro START_PRINT]
description: Eseguita prima dell'avvio della stampa
gcode:
    {% set BED_TEMP = params.BED_TEMP|default(60)|float %}
    {% set EXTRUDER_TEMP = params.EXTRUDER_TEMP|default(200)|float %}
    M140 S{BED_TEMP}                ; Avvia riscaldamento piatto (non bloccante)
    G90                             ; Coordinate assolute
    G28                             ; Homing di tutti gli assi
    M190 S{BED_TEMP}                ; Attendi che il piatto raggiunga la temperatura
    {% if printer.bed_mesh is defined %}
        BED_MESH_PROFILE LOAD=default
    {% endif %}
    G1 Z2.0 F3000                   ; Solleva l'asse Z
    M109 S{EXTRUDER_TEMP}           ; Riscalda l'ugello e attendi
    ; Linea di spurgo (Prime Line)
    G1 X10.1 Y20 Z0.28 F5000.0
    G1 X10.1 Y200.0 Z0.28 F1500.0 E15
    G1 X10.4 Y200.0 Z0.28 F5000.0
    G1 X10.4 Y20 Z0.28 F1500.0 E30
    G92 E0                          ; Azzera estrusore
    G1 Z2.0 F3000                   ; Solleva Z pronto per stampare`
        },
        'END_PRINT': {
            description: 'Macro finale per spegnere riscaldatori, ritrarre e presentare il pezzo',
            gcode: `[gcode_macro END_PRINT]
description: Eseguita al termine della stampa
gcode:
    G91                             ; Coordinate relative
    G1 E-2 F2700                    ; Ritira filamento di 2mm
    G1 E-1.5 Z0.2 F2400             ; Ritira ulteriormente e alza Z
    G1 X5 Y5 F3000                  ; Sposta testina per staccare dal pezzo
    G1 Z10 F3000                    ; Alza Z di 10mm
    G90                             ; Coordinate assolute
    G1 X10 Y220 F3000               ; Presenta il piatto in avanti
    M106 S0                         ; Spegni ventola pezzo
    M104 S0                         ; Spegni riscaldatore estrusore
    M140 S0                         ; Spegni riscaldatore piatto
    M84 X Y E                       ; Disabilita i motori (lascia Z attivo)`
        },
        'CANCEL_PRINT': {
            description: 'Annulla la stampa in corso e ripristina lo stato',
            gcode: `[gcode_macro CANCEL_PRINT]
description: Annulla la stampa in corso
rename_existing: BASE_CANCEL_PRINT
gcode:
    SET_IDLE_TIMEOUT TIMEOUT={printer.configfile.settings.idle_timeout.timeout}
    CLEAR_PAUSE
    SDCARD_RESET_FILE
    END_PRINT
    BASE_CANCEL_PRINT`
        },
        'PAUSE': {
            description: 'Mette in pausa la stampa e sposta l\'ugello in posizione sicura',
            gcode: `[gcode_macro PAUSE]
description: Pausa della stampa
rename_existing: BASE_PAUSE
gcode:
    {% set x = params.X|default(10) %}
    {% set y = params.Y|default(10) %}
    {% set z = params.Z|default(10)|float %}
    {% set e = params.E|default(1) %}
    SAVE_GCODE_STATE NAME=PAUSE_state
    BASE_PAUSE
    G91
    G1 E-{e} F2100
    G1 Z{z}
    G90
    G1 X{x} Y{y} F6000`
        },
        'RESUME': {
            description: 'Riprende la stampa dopo una pausa',
            gcode: `[gcode_macro RESUME]
description: Riprendi la stampa
rename_existing: BASE_RESUME
gcode:
    {% set e = params.E|default(1) %}
    G91
    G1 E{e} F2100
    G90
    RESTORE_GCODE_STATE NAME=PAUSE_state MOVE=1
    BASE_RESUME`
        },
        'M600': {
            description: 'Cambio filamento manuale durante la stampa (Filament Change)',
            gcode: `[gcode_macro M600]
description: Cambio filamento a metà stampa
gcode:
    PAUSE X=10 Y=10 Z_MIN=50`
        }
    },

    // Configurazione base iniziale di esempio
    SAMPLE_CONFIG: `# ====================================================================
# File di Configurazione Klipper (printer.cfg)
# Creato e Modificabile con Klipper WebUI Configurator
# ====================================================================

[include mainsail.cfg]

[printer]
kinematics: cartesian
max_velocity: 300
max_accel: 3000
minimum_cruise_ratio: 0.5
square_corner_velocity: 5.0
max_z_velocity: 15
max_z_accel: 100

[mcu]
serial: /dev/serial/by-id/usb-Klipper_stm32f446xx_default-if00
restart_method: command

[temperature_sensor raspberry_pi]
sensor_type: temperature_host
min_temp: 10
max_temp: 85

[temperature_sensor mcu_temp]
sensor_type: temperature_mcu
min_temp: 0
max_temp: 100

[stepper_x]
step_pin: PC2
dir_pin: !PB9
enable_pin: !PC3
microsteps: 16
rotation_distance: 40.0
full_steps_per_rotation: 200
endstop_pin: ^PA5
position_min: 0
position_endstop: 0
position_max: 235
homing_speed: 50.0

[tmc2209 stepper_x]
uart_pin: PC11
run_current: 0.800
interpolate: True
stealthchop_threshold: 999999

[stepper_y]
step_pin: PB8
dir_pin: PB7
enable_pin: !PC3
microsteps: 16
rotation_distance: 40.0
full_steps_per_rotation: 200
endstop_pin: ^PA6
position_min: 0
position_endstop: 0
position_max: 235
homing_speed: 50.0

[tmc2209 stepper_y]
uart_pin: PC10
run_current: 0.800
interpolate: True
stealthchop_threshold: 999999

[stepper_z]
step_pin: PB6
dir_pin: !PB5
enable_pin: !PC3
microsteps: 16
rotation_distance: 8.0
full_steps_per_rotation: 200
endstop_pin: probe:z_virtual_endstop
position_min: -2.0
position_max: 250
homing_speed: 10.0

[tmc2209 stepper_z]
uart_pin: PC9
run_current: 0.700
interpolate: True
stealthchop_threshold: 999999

[extruder]
step_pin: PB4
dir_pin: PB3
enable_pin: !PC3
microsteps: 16
rotation_distance: 22.678
gear_ratio: 50:17
nozzle_diameter: 0.400
filament_diameter: 1.750
heater_pin: PA2
sensor_type: EPCOS 100K B57560G104F
sensor_pin: PA1
min_temp: 0
max_temp: 280
min_extrude_temp: 170
max_extrude_only_distance: 100.0
control: pid
pid_Kp: 21.527
pid_Ki: 1.063
pid_Kd: 108.982
pressure_advance: 0.040

[tmc2209 extruder]
uart_pin: PC8
run_current: 0.650
interpolate: True

[heater_bed]
heater_pin: PA3
sensor_type: EPCOS 100K B57560G104F
sensor_pin: PA0
min_temp: 0
max_temp: 110
control: pid
pid_Kp: 54.027
pid_Ki: 0.770
pid_Kd: 948.182

[fan]
pin: PA8
kick_start_time: 0.5
off_below: 0.10

[heater_fan hotend_fan]
pin: PC6
heater: extruder
heater_temp: 50.0

[virtual_sdcard]
path: ~/printer_data/gcodes

[pause_resume]

[display_status]

[bltouch]
sensor_pin: ^PC14
control_pin: PA1
x_offset: -40.0
y_offset: -10.0
z_offset: 2.50
speed: 5.0
samples: 2
samples_result: median

[safe_z_home]
home_xy_position: 117.5, 117.5
speed: 50.0
z_hop: 10.0
z_hop_speed: 5.0

[bed_mesh]
speed: 120
horizontal_move_z: 5.0
mesh_min: 15, 15
mesh_max: 200, 200
probe_count: 5, 5
algorithm: bicubic
fade_start: 1
fade_end: 10

[input_shaper]
shaper_freq_x: 45.2
shaper_type_x: mzv
shaper_freq_y: 42.0
shaper_type_y: mzv
`
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = KLIPPER_CONSTANTS;
}
