/**
 * Klipper Configurator - Tooltips & Parameter Documentation Module
 * Inserisce un cerchietto con una 'i' (info-circle) accanto a ciascun valore/parametro
 * e mostra un tooltip fluttuante con spiegazione dettagliata del parametro Klipper al passaggio del mouse.
 */

(function () {
    'use strict';

    // =========================================================================
    // Dizionario Completo dei Parametri Klipper e Controlli KlifigUI
    // =========================================================================
    // Assicura che ogni entry in KLIPPER_TOOLTIPS abbia il proprio id
    const KLIPPER_TOOLTIPS = {
        // --- Tab 1: Cinematica & Stampante ---
        'select-config-file': {
            param: 'Config File',
            title: 'File di Configurazione Attivo',
            desc: 'Seleziona quale file di configurazione Klipper caricare, visualizzare o modificare da Moonraker.',
            tip: 'Tipicamente printer.cfg'
        },
        'printer-kinematics': {
            param: 'kinematics',
            title: 'Tipo di Cinematica Principale',
            desc: 'Definisce la struttura meccanica della stampante (Cartesiana, CoreXY, CoreXZ, Delta, Hybrid CoreXY / IDEX, ecc.). Determina la matematica di conversione delle coordinate G-Code nei passi dei singoli motori.',
            tip: 'Ender 3/Prusa: cartesian | Voron 2.4/Trident/Bambu: corexy | Delta: delta'
        },
        'printer-max-velocity': {
            param: 'max_velocity',
            title: 'Velocità Massima Assi X/Y',
            desc: 'Massima velocità di spostamento dell\'utensile consentita sul piano orizzontale.',
            unit: 'mm/s',
            tip: 'Valori tipici: 150 - 300 mm/s (stampanti standard), 300 - 600+ mm/s (CoreXY ad alte prestazioni)'
        },
        'printer-max-accel': {
            param: 'max_accel',
            title: 'Accelerazione Massima',
            desc: 'Massima accelerazione consentita per la testina di stampa. Un valore adeguato riduce i tempi di stampa senza causare perdita di passi o vibrazioni eccessive.',
            unit: 'mm/s²',
            tip: 'Valori tipici: 3000 - 5000 mm/s² (stampanti cartesiane), 5000 - 20000+ mm/s² (CoreXY con input shaper)'
        },
        'printer-cruise-ratio': {
            param: 'minimum_cruise_ratio',
            title: 'Rapporto Minimo di Crociera',
            desc: 'Frazione minima della distanza di un movimento trascorsa a velocità costante di crociera, prima di decelerare. Ha sostituito il vecchio max_accel_to_decel nelle versioni recenti di Klipper.',
            tip: 'Valore predefinito: 0.5 (50% di crociera)'
        },
        'printer-square-corner': {
            param: 'square_corner_velocity',
            title: 'Square Corner Velocity',
            desc: 'Velocità massima a cui l\'utensile può percorrere un angolo retto (90°) senza decelerare completamente a zero. Valori più alti aumentano la velocità ma possono generare ringing negli spigoli.',
            unit: 'mm/s',
            tip: 'Valori tipici: 5.0 mm/s (conservativo/dettagliato) fino a 8.0 - 10.0 mm/s (veloce)'
        },
        'printer-max-z-velocity': {
            param: 'max_z_velocity',
            title: 'Velocità Massima Asse Z',
            desc: 'Massima velocità di traslazione verticale consentita sull\'asse Z. Limita la rotazione delle barre filettate o cinghie Z.',
            unit: 'mm/s',
            tip: 'Valori tipici: 10 - 25 mm/s per viti trapezoidali T8; 30 - 60 mm/s per Z guidati da cinghie'
        },
        'printer-max-z-accel': {
            param: 'max_z_accel',
            title: 'Accelerazione Massima Asse Z',
            desc: 'Massima accelerazione applicata durante i movimenti verticali dell\'asse Z (incluso z-hop durante le ritrazioni).',
            unit: 'mm/s²',
            tip: 'Valori tipici: 100 - 350 mm/s²'
        },
        'printer-max-accel-to-decel': {
            param: 'max_accel_to_decel',
            title: 'Max Accel to Decel (Legacy)',
            desc: 'Parametro deprecato di Klipper per limitare l\'accelerazione di transizione. Nei sistemi moderni è consigliato lasciare vuoto e utilizzare minimum_cruise_ratio.',
            unit: 'mm/s²'
        },
        'check-enable-idex': {
            param: '[dual_carriage]',
            title: 'Abilitazione Cinematica IDEX',
            desc: 'Attiva il supporto per stampanti a doppio carrello indipendente (IDEX), consentendo la gestione separata di due estrusori autonomi che condividono la stessa barra X.',
            tip: 'Genera automaticamente la sezione [dual_carriage] nel config'
        },
        'select-z-motor-count': {
            param: '[stepper_z*]',
            title: 'Numero di Motori Asse Z',
            desc: 'Specifica quanti motori indipendenti comandano l\'asse Z (1, 2, 3 o 4). Permette il livellamento automatico del piatto o gantry tramite Z_TILT_ADJUST (2-3 motori) o QUAD_GANTRY_LEVEL (4 motori).',
            tip: 'Configura schede stepper_z, stepper_z1, stepper_z2, stepper_z3'
        },
        'delta-arm-length': {
            param: 'arm_length',
            title: 'Lunghezza Bracci Delta',
            desc: 'Lunghezza da snodo a snodo dei bracci diagonali su stampanti cinematiche Delta.',
            unit: 'mm'
        },
        'delta-radius': {
            param: 'delta_radius',
            title: 'Raggio Orizzontale Delta',
            desc: 'Raggio del cerchio orizzontale formato dalle torri delta rispetto al centro dell\'effettore.',
            unit: 'mm'
        },
        'delta-print-radius': {
            param: 'print_radius',
            title: 'Raggio di Stampa Delta',
            desc: 'Raggio dell\'area circolare massima stampabile sul piano di lavoro di una cinematica Delta.',
            unit: 'mm'
        },

        // --- Corse Assi X, Dual Carriage, Y, Z ---
        'x-pos-min': {
            param: 'position_min',
            title: 'Posizione Minima Asse X',
            desc: 'Coordinata minima raggiungibile dall\'asse X. Spesso 0 o un valore negativo se il finecorsa o la posizione di parcheggio si trovano oltre il bordo del piatto.',
            unit: 'mm'
        },
        'x-pos-max': {
            param: 'position_max',
            title: 'Posizione Massima Asse X',
            desc: 'Coordinata massima raggiungibile dall\'asse X. Rappresenta la larghezza utile dell\'area di lavoro.',
            unit: 'mm'
        },
        'x-pos-endstop': {
            param: 'position_endstop',
            title: 'Posizione Endstop Asse X',
            desc: 'Coordinata esatta assegnata all\'asse X nell\'istante in cui il finecorsa viene attivato durante la procedura di azzeramento (homing).',
            unit: 'mm'
        },
        'x-homing-speed': {
            param: 'homing_speed',
            title: 'Velocità di Homing Asse X',
            desc: 'Velocità a cui l\'asse si sposta verso il finecorsa durante l\'homing (G28). Imposta a 0 per disabilitare o ereditare il default.',
            unit: 'mm/s',
            tip: 'Tipicamente 40 - 80 mm/s'
        },
        'x-homing-retract-dist': {
            param: 'homing_retract_dist',
            title: 'Distanza di Arretramento Homing',
            desc: 'Distanza di cui l\'asse indietreggia dopo il primo contatto col finecorsa, prima di eseguire il secondo tocco di precisione.',
            unit: 'mm',
            tip: 'Tipicamente 3 - 5 mm. Imposta 0 per sensorless homing'
        },
        'x-homing-retract-speed': {
            param: 'homing_retract_speed',
            title: 'Velocità di Arretramento Homing',
            desc: 'Velocità con cui l\'asse si allontana dal finecorsa prima del secondo tocco.',
            unit: 'mm/s'
        },
        'dc-pos-min': {
            param: 'position_min',
            title: 'Posizione Minima Carrello X2',
            desc: 'Coordinata minima raggiungibile dal secondo carrello X2 nella cinematica IDEX.',
            unit: 'mm'
        },
        'dc-pos-max': {
            param: 'position_max',
            title: 'Posizione Massima Carrello X2',
            desc: 'Coordinata massima raggiungibile dal secondo carrello X2.',
            unit: 'mm'
        },
        'dc-pos-endstop': {
            param: 'position_endstop',
            title: 'Posizione Endstop Parcheggio X2',
            desc: 'Coordinata di parcheggio del carrello secondario X2 nel momento in cui attiva il proprio endstop dedicato.',
            unit: 'mm'
        },
        'dc-homing-speed': {
            param: 'homing_speed',
            title: 'Velocità Homing Carrello X2',
            desc: 'Velocità di azzeramento verso la posizione di parcheggio per il carrello secondario X2.',
            unit: 'mm/s'
        },
        'dc-homing-retract-dist': {
            param: 'homing_retract_dist',
            title: 'Arretramento Homing Carrello X2',
            desc: 'Distanza di arretramento dopo il tocco dell\'endstop per il carrello X2.',
            unit: 'mm'
        },
        'dc-homing-retract-speed': {
            param: 'homing_retract_speed',
            title: 'Velocità Arretramento X2',
            desc: 'Velocità di disimpegno dal finecorsa del carrello secondario X2.',
            unit: 'mm/s'
        },
        'y-pos-min': {
            param: 'position_min',
            title: 'Posizione Minima Asse Y',
            desc: 'Coordinata minima raggiungibile dall\'asse Y. Spesso 0 o negativo se il finecorsa è situato oltre il piatto riscaldato.',
            unit: 'mm'
        },
        'y-pos-max': {
            param: 'position_max',
            title: 'Posizione Massima Asse Y',
            desc: 'Coordinata massima raggiungibile dall\'asse Y (profondità del piatto utile).',
            unit: 'mm'
        },
        'y-pos-endstop': {
            param: 'position_endstop',
            title: 'Posizione Endstop Asse Y',
            desc: 'Coordinata assegnata all\'asse Y all\'attivazione del finecorsa (di solito 0 su cartesiane, o max su CoreXY).',
            unit: 'mm'
        },
        'y-homing-speed': {
            param: 'homing_speed',
            title: 'Velocità Homing Asse Y',
            desc: 'Velocità con cui l\'asse Y si muove verso il finecorsa durante l\'homing.',
            unit: 'mm/s'
        },
        'y-homing-retract-dist': {
            param: 'homing_retract_dist',
            title: 'Arretramento Homing Asse Y',
            desc: 'Distanza di arretramento dopo il primo tocco del finecorsa su Y.',
            unit: 'mm'
        },
        'y-homing-retract-speed': {
            param: 'homing_retract_speed',
            title: 'Velocità Arretramento Asse Y',
            desc: 'Velocità di arretramento per l\'asse Y.',
            unit: 'mm/s'
        },
        'z-pos-min': {
            param: 'position_min',
            title: 'Posizione Minima Asse Z',
            desc: 'Quota minima raggiungibile in Z. Spesso impostata a -2 o -5 mm per consentire la calibrazione fine dello Z-Offset senza blocchi software.',
            unit: 'mm',
            tip: 'Consigliato: -2.0 o -5.0 mm per calibrare Z-Offset'
        },
        'z-pos-max': {
            param: 'position_max',
            title: 'Posizione Massima Asse Z',
            desc: 'Altezza massima stampabile in altezza sull\'asse Z.',
            unit: 'mm'
        },
        'z-pos-endstop': {
            param: 'position_endstop',
            title: 'Posizione Endstop Asse Z',
            desc: 'Quota dell\'asse Z al trigger del microswitch fisico. Lasciare non impostato se si usa una sonda (probe/BLTouch/Eddy) per l\'homing Z.',
            unit: 'mm'
        },
        'z-homing-speed': {
            param: 'homing_speed',
            title: 'Velocità Homing Asse Z',
            desc: 'Velocità di discesa verso il piatto o finecorsa durante l\'azzeramento Z.',
            unit: 'mm/s',
            tip: 'Tipicamente 5 - 15 mm/s per evitare impatti violenti'
        },
        'z-homing-retract-dist': {
            param: 'homing_retract_dist',
            title: 'Arretramento Homing Asse Z',
            desc: 'Distanza di risalita della testina dopo il primo tocco prima del secondo tocco di homing.',
            unit: 'mm',
            tip: 'Consigliato: 3 - 5 mm'
        },
        'z-homing-retract-speed': {
            param: 'homing_retract_speed',
            title: 'Velocità Arretramento Asse Z',
            desc: 'Velocità di risalita tra il primo e il secondo tocco di homing.',
            unit: 'mm/s'
        },

        // --- Tab 2: Host & Microcontrollore (MCU) ---
        'mcu-conn-type': {
            param: 'connection_type',
            title: 'Metodo di Collegamento Scheda MCU',
            desc: 'Indica se la scheda principale comunica con l\'host tramite porta seriale USB (/dev/serial/by-id/...) o tramite bus di rete CAN Bus a 2 fili.',
            tip: 'USB Seriale per schede madri convenzionali, CAN Bus per toolhead/EBB'
        },
        'mcu-serial': {
            param: 'serial',
            title: 'Percorso Porta Seriale MCU',
            desc: 'Percorso univoco della porta seriale USB nel filesystem Linux (es. /dev/serial/by-id/usb-Klipper_stm32f446xx_...). Usare sempre /by-id/ per evitare cambi di ttyUSB/ttyACM al riavvio.',
            tip: 'Identificabile via terminale con: ls /dev/serial/by-id/*'
        },
        'mcu-canbus-uuid': {
            param: 'canbus_uuid',
            title: 'UUID Scheda CAN Bus',
            desc: 'Identificativo univoco a 12 cifre esadecimali della scheda sul bus CAN (es. toolhead board EBB36, SB2209, Monster8).',
            tip: 'Rilevabile con il comando: python3 ~/klipper/scripts/canbus_query.py can0'
        },
        'mcu-baud': {
            param: 'baud',
            title: 'Velocità di Comunicazione Seriale (Baud Rate)',
            desc: 'Frequenza di trasmissione dati tra host e microcontrollore.',
            unit: 'baud',
            tip: 'Valore standard Klipper: 250000'
        },
        'mcu-restart-method': {
            param: 'restart_method',
            title: 'Metodo di Reset Hardware MCU',
            desc: 'Algoritmo usato da Klipper per riavviare la scheda microcontrollore quando si invia il comando FIRMWARE_RESTART.',
            tip: 'arduino (DTR), cheetah, command (software), rpi_usb (disalimentazione USB)'
        },
        'check-enable-host-temp': {
            param: '[temperature_sensor host]',
            title: 'Sensore Temperatura Host / Raspberry Pi',
            desc: 'Abilita il monitoraggio continuo della temperatura della CPU del Raspberry Pi o computer host nella dashboard Mainsail.',
            tip: 'Crea [temperature_sensor raspberry_pi]'
        },
        'check-enable-mcu-temp': {
            param: '[temperature_sensor mcu]',
            title: 'Sensore Temperatura Chip MCU',
            desc: 'Abilita la lettura del sensore di temperatura interno integrato nel microcontrollore della scheda madre.',
            tip: 'Crea [temperature_sensor mcu]'
        },

        // --- Tab 3: Stepper Motion & Driver ---
        'stepper-step-pin': {
            param: 'step_pin',
            title: 'Pin del Segnale di Passo (Step)',
            desc: 'Pin del microcontrollore che invia gli impulsi di clock al driver per muovere il motore passo-passo di un passo/microstep.',
            tip: 'Es. PA0, PE3, PC1'
        },
        'stepper-dir-pin': {
            param: 'dir_pin',
            title: 'Pin di Direzione (Direction)',
            desc: 'Pin che stabilisce il senso di rotazione del motore (orario o antiorario). Se l\'asse si muove al contrario, anteponi il carattere ! al pin per invertirne la polarità logica.',
            tip: 'Es. PA1 oppure !PA1'
        },
        'check-invert-dir': {
            param: '! (dir_pin)',
            title: 'Inverti Direzione Motore',
            desc: 'Aggiunge il prefisso punto esclamativo ! al dir_pin per invertire istantaneamente il verso di marcia dell\'asse.',
            tip: 'Seleziona se l\'asse si allontana dal finecorsa invece di avvicinarsi'
        },
        'stepper-enable-pin': {
            param: 'enable_pin',
            title: 'Pin di Abilitazione Driver (Enable)',
            desc: 'Pin che fornisce alimentazione agli avvolgimenti del motore. La quasi totalità dei driver passo-passo si attiva con livello logico basso (Active-Low), richiedendo il prefisso !.',
            tip: 'Es. !PA2'
        },
        'check-invert-enable': {
            param: '! (enable_pin)',
            title: 'Inverti Logica Enable',
            desc: 'Abilita o disabilita il prefisso ! sul pin di abilitazione (logica invertita).',
            tip: 'Generalmente attivo (!) per quasi tutti i driver moderni'
        },
        'stepper-microsteps': {
            param: 'microsteps',
            title: 'Risoluzione Micropassi',
            desc: 'Frazione di passo intero generata dal driver. Aumenta la fluidità e riduce la rumorosità del motore.',
            tip: 'Consigliato: 16 o 32 (con interpolazione attiva per TMC)'
        },
        'stepper-steps-rotation': {
            param: 'full_steps_per_rotation',
            title: 'Passi Nativi del Motore per Giro Completo',
            desc: 'Numero di passi fisici completi per una rotazione di 360° dell\'albero motore: 200 per motori convenzionali con angolo di 1.8°, 400 per motori ad alta precisione con angolo di 0.9°.',
            tip: '1.8° = 200 passi | 0.9° = 400 passi'
        },
        'stepper-rotation-distance': {
            param: 'rotation_distance',
            title: 'Distanza di Rotazione (Rotation Distance)',
            desc: 'Distanza lineare (in mm) percorsa dall\'asse con un giro completo di 360° del motore. Per pulegge GT2: numero denti x passo (es. 20 denti x 2 mm = 40 mm). Per viti T8: passo della filettatura (tipicamente 8 mm).',
            unit: 'mm',
            tip: 'Puleggia 20T GT2: 40.0 | Puleggia 16T GT2: 32.0 | Vite T8x8: 8.0'
        },
        'stepper-endstop-pin': {
            param: 'endstop_pin',
            title: 'Pin del Finecorsa (Endstop Pin)',
            desc: 'Pin digitale a cui è collegato lo switch di finecorsa per questo asse. Anteporre ^ se lo switch richiede pull-up interno, oppure tmc2209_stepper_x:virtual_endstop per sensorless.',
            tip: 'Es. ^PA3 oppure tmc2209_stepper_x:virtual_endstop'
        },
        'driver-model-select': {
            param: 'Driver IC',
            title: 'Modello Chip Driver',
            desc: 'Seleziona il circuito integrato del driver installato: TMC2209, TMC2208, TMC2240, TMC5160, TMC2130 o Standalone (A4988, DRV8825). Definisce la sezione nel config.',
            tip: 'TMC2209 è il più comune per rapporto silenziosità/affidabilità'
        },
        'driver-conn-type-select': {
            param: 'Bus Protocol',
            title: 'Tipo di Connessione Driver',
            desc: 'Metodo con cui il microcontrollore comunica con il chip TMC: UART (filo singolo bidirezionale), SPI (bus seriale ad alta velocità a 4 fili) o Standalone (nessuna configurazione digitale).',
            tip: 'UART per TMC2209/TMC2208 | SPI per TMC5160/TMC2130'
        },
        'driver-uart-pin': {
            param: 'uart_pin',
            title: 'Pin UART Ricezione Driver',
            desc: 'Pin del microcontrollore dedicato alla linea seriale UART per configurare digitalmente corrente, micropassi e registri del driver TMC.',
            tip: 'Es. PC11, PD5, etc.'
        },
        'driver-tx-pin': {
            param: 'tx_pin',
            title: 'Pin TX UART (Opzionale)',
            desc: 'Pin di trasmissione dedicato se la scheda madre usa linee separate per invio e ricezione UART verso i driver.',
            tip: 'Lasciare vuoto se la scheda usa filo singolo UART con resistenza'
        },
        'driver-uart-address': {
            param: 'uart_address',
            title: 'Indirizzo Hardware UART',
            desc: 'Indirizzo univoco (da 0 a 3) assegnato al driver TMC quando più driver condividono lo stesso identico pin UART (es. schede MKS Robin o BTT E3).',
            tip: 'Tipicamente 0 per X, 1 per Y, 2 per Z, 3 per E0 su schede a bus condiviso'
        },
        'driver-cs-pin': {
            param: 'cs_pin',
            title: 'Pin Chip Select (CS) SPI',
            desc: 'Pin digitale che attiva la comunicazione con questo specifico driver durante le transazioni sul bus dati SPI.',
            tip: 'Es. PD11, PB12'
        },
        'driver-spi-mode': {
            param: 'spi_mode',
            title: 'Modalità Bus SPI',
            desc: 'Sceglie se appoggiarsi a un controller SPI hardware integrato nel chip MCU oppure emulare il bus SPI via bit-banging software su pin generici.',
            tip: 'Hardware SPI per massima velocità e minor carico CPU'
        },
        'driver-spi-bus': {
            param: 'spi_bus',
            title: 'Nome Bus SPI Hardware',
            desc: 'Identificativo del controller SPI hardware della scheda madre (es. spi1, spi2, spi3a, spi4).',
            tip: 'Consultare il pinout ufficiale della propria scheda madre'
        },
        'driver-spi-sclk': {
            param: 'spi_software_sclk_pin',
            title: 'Pin Clock SPI Software',
            desc: 'Pin digitale adibito al segnale di sincronizzazione di clock (SCK/SCLK) per SPI software.',
            tip: 'Es. PA5, PB13'
        },
        'driver-spi-mosi': {
            param: 'spi_software_mosi_pin',
            title: 'Pin MOSI SPI Software',
            desc: 'Pin Master Out Slave In per l\'invio dei comandi di configurazione al driver.',
            tip: 'Es. PA7, PB15'
        },
        'driver-spi-miso': {
            param: 'spi_software_miso_pin',
            title: 'Pin MISO SPI Software',
            desc: 'Pin Master In Slave Out per la lettura dei registri di stato e diagnostica dal driver.',
            tip: 'Es. PA6, PB14'
        },
        'driver-run-current': {
            param: 'run_current',
            title: 'Corrente Operativa Nominale',
            desc: 'Corrente efficace RMS erogata dal driver agli avvolgimenti del motore durante il movimento.',
            unit: 'A',
            tip: 'Motori NEMA17 standard: 0.65 - 0.85A | Motori ad alta coppia 48mm: 1.0 - 1.4A'
        },
        'driver-stealthchop': {
            param: 'stealthchop_threshold',
            title: 'Modalità Silenziosa StealthChop',
            desc: 'Attiva la modulazione StealthChop per movimenti estremamente silenziosi. Disabilita (SpreadCycle) per garantire la massima coppia e precisione alle alte accelerazioni.',
            tip: 'Abilitato (999999) per silenzio | Disabilitato (0) per massima coppia e velocità'
        },
        'check-enable-hold-current': {
            param: 'hold_current (checkbox)',
            title: 'Abilita Corrente di Mantenimento',
            desc: 'Permette di ridurre la corrente quando il motore è fermo. Sconsigliato con TMC2209 e sensorless homing poiché la commutazione improvvisa può causare salti di microstep.',
            tip: 'Spesso lasciata disabilitata per massima stabilità'
        },
        'driver-hold-current': {
            param: 'hold_current',
            title: 'Corrente a Riposo (Hold Current)',
            desc: 'Corrente erogata al motore quando l\'asse è fermo in posizione di stallo.',
            unit: 'A',
            tip: 'Tipicamente 60-70% della run_current se abilitata'
        },
        'check-enable-sense-resistor': {
            param: 'sense_resistor (checkbox)',
            title: 'Specifica Resistenza di Sense',
            desc: 'Permette di impostare manualmente il valore esatto della resistenza shunt di campionamento corrente saldata sul modulo driver.',
            tip: 'Necessario se diverso dal valore di fabbrica (0.110 ohm)'
        },
        'driver-sense-resistor': {
            param: 'sense_resistor',
            title: 'Valore Resistenza di Shunt',
            desc: 'Resistenza di sensing della corrente (in Ohm). Fondamentale per il calcolo corretto della corrente inviata al motore.',
            unit: 'Ω',
            tip: 'TMC2209 standard: 0.110 | Estrusori compatti: 0.075 | TMC5160: 0.022 o 0.075'
        },
        'driver-interpolate': {
            param: 'interpolate',
            title: 'Interpolazione Hardware a 256 Microstep',
            desc: 'Se True, il driver interpola autonomamente ogni micropasso a 256 posizioni intermedie, riducendo le risonanze acustiche a scapito di una minima latenza.',
            tip: 'Consigliato: True per TMC2209/TMC2208'
        },
        'driver-sensorless-enable': {
            param: 'virtual_endstop (Sensorless)',
            title: 'Homing Senza Finecorsa Fisico (Sensorless)',
            desc: 'Utilizza la tecnologia StallGuard del chip TMC per rilevare l\'impatto meccanico a fine corsa attraverso il monitoraggio della contro-forza elettromotrice (back-EMF).',
            tip: 'Elimina i cavi e gli interruttori fisici di finecorsa su X e Y'
        },
        'driver-diag-pin': {
            param: 'diag_pin',
            title: 'Pin Diagnostica StallGuard (DIAG)',
            desc: 'Pin del microcontrollore collegato all\'uscita DIAG del driver TMC per segnalare l\'arresto meccanico al firmware.',
            tip: 'Richiede spesso il pull-up interno (^)'
        },
        'driver-sgthrs': {
            param: 'driver_SGTHRS / driver_SGT',
            title: 'Soglia di Sensibilità StallGuard',
            desc: 'Sensibilità di rilevamento dell\'urto meccanico per l\'homing sensorless. Su TMC2209 scala da 0 (meno sensibile, sbatte forte) a 255 (molto sensibile, si ferma subito). Su TMC5160 scala da -64 a +63.',
            tip: 'TMC2209: iniziare da 100 e regolare a passi di 5 (tipico: 60 - 120)'
        },

        // --- Tab 4: Estrusore & Calibrazione ---
        'extruder-step-pin': {
            param: 'step_pin',
            title: 'Step Pin Motore Estrusore',
            desc: 'Pin del segnale di passo per il motore che trascina il filamento nell\'hotend.',
            tip: 'Es. PB4, PD6'
        },
        'extruder-dir-pin': {
            param: 'dir_pin',
            title: 'Dir Pin Motore Estrusore',
            desc: 'Pin di direzione per il motore dell\'estrusore. Inserisci ! se il motore ritrae invece di estrudere filamento.',
            tip: 'Es. PB3 o !PB3'
        },
        'extruder-enable-pin': {
            param: 'enable_pin',
            title: 'Enable Pin Estrusore',
            desc: 'Pin di abilitazione per il driver del motore dell\'estrusore (generalmente attivo basso !).',
            tip: 'Es. !PB5'
        },
        'extruder-rot-dist': {
            param: 'rotation_distance',
            title: 'Rotation Distance Estrusore',
            desc: 'Millimetri di filamento estruso per ogni giro completo di 360° dell\'albero motore. Calcolabile estrudendo 100 mm di filamento e misurando lo scarto reale.',
            unit: 'mm',
            tip: 'BMG standard: ~22.678 | Clockwork 2: ~22.68 | Orbiter 2.0: ~4.637 | Sherpa Mini: ~22.678'
        },
        'extruder-gear-ratio': {
            param: 'gear_ratio',
            title: 'Rapporto di Riduzione Ingranaggi',
            desc: 'Rapporto di trasmissione meccanico tra pignone motore e ingranaggi di trascinamento dell\'estrusore.',
            tip: 'BMG: 50:17 | Clockwork 1/2: 50:10 | Orbiter 2.0: 7.5:1 | Azionamento diretto: lascia vuoto'
        },
        'extruder-nozzle-dia': {
            param: 'nozzle_diameter',
            title: 'Diametro Foro Ugello (Nozzle)',
            desc: 'Diametro di apertura dell\'ugello installato sull\'hotend.',
            unit: 'mm',
            tip: 'Tipicamente 0.40 mm (standard), 0.60 mm o 0.80 mm per stampe rapide'
        },
        'extruder-filament-dia': {
            param: 'filament_diameter',
            title: 'Diametro Nominale Filamento',
            desc: 'Diametro del filamento termoplastico utilizzato dalla stampante.',
            unit: 'mm',
            tip: 'Standard: 1.75 mm (o 2.85 mm per sistemi speciali)'
        },
        'extruder-pressure-advance': {
            param: 'pressure_advance',
            title: 'Compensazione Pressure Advance',
            desc: 'Algoritmo predittivo che compensa l\'elasticità e la pressione interna del filamento fuso nella camera di riscaldamento durante accelerazioni e decelerazioni, garantendo angoli netti senza rigonfiamenti.',
            tip: 'Direct Drive: 0.02 - 0.06 | Bowden: 0.3 - 0.8'
        },
        'extruder-sensor-type': {
            param: 'sensor_type',
            title: 'Tipo di Sensore Termico Hotend',
            desc: 'Modello esatto di termistore o sonda di temperatura installata sull\'hotend (es. Generic 3950, PT1000, ATC Semitec 104GT-2, MAX31865 per PT100 su SPI).',
            tip: 'Impostare il modello corretto per evitare scarti di temperatura pericolosi'
        },
        'extruder-heater-pin': {
            param: 'heater_pin',
            title: 'Pin Riscaldatore Hotend',
            desc: 'Pin MOSFET sul microcontrollore che pilota la cartuccia riscaldante dell\'hotend in PWM.',
            tip: 'Es. PA2, PB10'
        },
        'extruder-sensor-pin': {
            param: 'sensor_pin',
            title: 'Pin Sensore Termico Hotend',
            desc: 'Pin analogico (ADC) per la lettura del termistore oppure pin Chip Select (CS) se si utilizza una sonda SPI digitale.',
            tip: 'Es. PC4, PA1'
        },
        'extruder-min-temp': {
            param: 'min_temp',
            title: 'Temperatura Minima di Sicurezza',
            desc: 'Soglia minima ammessa di temperatura (°C). Se il sensore rileva un valore inferiore (es. termistore scollegato o cavo rotto), Klipper arresta la macchina in emergenza per sicurezza (Thermal Runaway Protection).',
            unit: '°C',
            tip: 'Tipicamente 0°C o -10°C'
        },
        'extruder-max-temp': {
            param: 'max_temp',
            title: 'Temperatura Massima di Sicurezza',
            desc: 'Temperatura massima consentita per l\'hotend prima che scatti il blocco hardware di protezione da surriscaldamento.',
            unit: '°C',
            tip: 'Gola in PTFE: max 250°C | All-Metal: 280 - 300°C | Hotend per tecnopolimeri: 350 - 500°C'
        },
        'extruder-min-extrude': {
            param: 'min_extrude_temp',
            title: 'Temperatura Minima di Estrusione',
            desc: 'Temperatura al di sotto della quale Klipper rifiuta i comandi di estrusione G1 E per prevenire danni al motore o all\'ugello (estrusione a freddo).',
            unit: '°C',
            tip: 'Standard: 170°C'
        },
        'extruder-control-type': {
            param: 'control',
            title: 'Algoritmo Termico Hotend',
            desc: 'Algoritmo per stabilizzare la temperatura dell\'ugello: pid per modulazione fine proporzionale-integrale-derivativa (consigliato), oppure watermark con isteresi accendi/spegni.',
            tip: 'Usa sempre PID per l\'hotend per stabilità termica millimetrica'
        },
        'extruder-pid-kp': {
            param: 'pid_Kp',
            title: 'Coefficiente Proporzionale PID',
            desc: 'Guadagno proporzionale dell\'algoritmo di riscaldamento PID. Calcolabile automaticamente con il comando PID_CALIBRATE HEATER=extruder TARGET=210.',
            tip: 'Calcolato tramite autotune PID'
        },
        'extruder-pid-ki': {
            param: 'pid_Ki',
            title: 'Coefficiente Integrale PID',
            desc: 'Guadagno integrale per correggere l\'errore termico cumulativo nel tempo.',
            tip: 'Calcolato tramite autotune PID'
        },
        'extruder-pid-kd': {
            param: 'pid_Kd',
            title: 'Coefficiente Derivativo PID',
            desc: 'Guadagno derivativo per contrastare le variazioni repentine di temperatura.',
            tip: 'Calcolato tramite autotune PID'
        },
        'extruder-max-delta': {
            param: 'max_delta',
            title: 'Tolleranza Isteresi Watermark',
            desc: 'Finestra di isteresi termica ammessa attorno al target quando si impiega l\'algoritmo watermark.',
            unit: '°C'
        },

        // --- Sensori Speciali SPI / RTD MAX31865 ---
        'extruder-rtd-nominal-r': {
            param: 'rtd_nominal_r',
            title: 'Resistenza Nominale Sonda RTD a 0°C',
            desc: 'Resistenza elettrica della sonda termoresistiva al platino a zero gradi Celsius: 100 per sonde PT100, 1000 per sonde PT1000.',
            unit: 'Ω',
            tip: 'PT100: 100 | PT1000: 1000'
        },
        'extruder-rtd-reference-r': {
            param: 'rtd_reference_r',
            title: 'Resistenza di Riferimento Modulo RTD',
            desc: 'Valore della resistenza campione saldata sul circuito integrato MAX31865 (solitamente 430 ohm per PT100, 4300 ohm per PT1000).',
            unit: 'Ω',
            tip: 'Modulo per PT100: 430 | Modulo per PT1000: 4300'
        },
        'extruder-rtd-num-wires': {
            param: 'rtd_num_of_wires',
            title: 'Numero di Conduttori Sonda RTD',
            desc: 'Configurazione fisica del cablaggio della termoresistenza (2, 3 o 4 fili). Le configurazioni a 3 o 4 fili compensano la resistenza interna dei cavi per massima accuratezza.',
            tip: '2 fili (economico), 4 fili (massima precisione industriale)'
        },
        'extruder-rtd-filter': {
            param: 'rtd_use_50Hz_filter',
            title: 'Filtro Antidisturbo Rete Elettrica',
            desc: 'Seleziona il filtro notch a 50Hz (standard europeo/italiano a 230V) o 60Hz per abbattere i disturbi indotti dalla rete elettrica sulle letture della sonda.',
            tip: 'Usa 50Hz in Italia ed Europa'
        },

        // --- Tab 5: Piatto Riscaldato (Heater Bed) ---
        'bed-sensor-type': {
            param: 'sensor_type',
            title: 'Tipo Sensore Piatto Riscaldato',
            desc: 'Modello del termistore installato sotto il piano di stampa.',
            tip: 'Tipicamente Generic 3950 o EPCOS 100K B57560G104F'
        },
        'bed-heater-pin': {
            param: 'heater_pin',
            title: 'Pin Riscaldatore Piatto',
            desc: 'Pin MOSFET o relè a stato solido (SSR) che comanda il riscaldamento del piatto di stampa.',
            tip: 'Es. PA1, PC9'
        },
        'bed-sensor-pin': {
            param: 'sensor_pin',
            title: 'Pin Sensore Termico Piatto',
            desc: 'Pin analogico (ADC) dedicato alla lettura della temperatura del letto.',
            tip: 'Es. PC3, PA0'
        },
        'bed-min-temp': {
            param: 'min_temp',
            title: 'Temperatura Minima Piatto',
            desc: 'Temperatura minima consentita prima del blocco di sicurezza.',
            unit: '°C',
            tip: 'Tipicamente 0°C'
        },
        'bed-max-temp': {
            param: 'max_temp',
            title: 'Temperatura Massima Piatto',
            desc: 'Limite massimo di temperatura per il letto di stampa (es. 120 - 130°C per piatti a 24V/220V).',
            unit: '°C'
        },
        'bed-control-type': {
            param: 'control',
            title: 'Algoritmo Controllo Termico Piatto',
            desc: 'Metodo di regolazione termica: pid per piatti in alluminio a 24V, oppure watermark con isteresi per piatti AC ad alta potenza comandati da relè SSR.',
            tip: 'Piatto 24V DC: pid | Piatto 230V AC con SSR: watermark o pid'
        },
        'bed-pid-kp': {
            param: 'pid_Kp',
            title: 'Coefficiente Proporzionale PID Piatto',
            desc: 'Guadagno proporzionale del piatto (calcolabile con PID_CALIBRATE HEATER=heater_bed TARGET=60).'
        },
        'bed-pid-ki': {
            param: 'pid_Ki',
            title: 'Coefficiente Integrale PID Piatto',
            desc: 'Guadagno integrale per il piatto riscaldato.'
        },
        'bed-pid-kd': {
            param: 'pid_Kd',
            title: 'Coefficiente Derivativo PID Piatto',
            desc: 'Guadagno derivativo per il piatto riscaldato.'
        },
        'bed-max-delta': {
            param: 'max_delta',
            title: 'Tolleranza Isteresi Watermark Piatto',
            desc: 'Scarto ammesso attorno alla temperatura impostata con algoritmo watermark (es. 1.0 - 2.0°C).',
            unit: '°C'
        },

        // --- Sonde di Livellamento (Probe, BLTouch, Eddy) ---
        'probe-type-select': {
            param: 'Probe Type',
            title: 'Tipologia Sonda di Livellamento',
            desc: 'Tipo di sensore impiegato per mappare la planarità del piatto: BLTouch / 3DTouch, microswitch meccanico (Klicky/Voron Tap), sensore induttivo (Omron/SuperPinda), Beacon o sonda a correnti parassite BTT Eddy.',
            tip: 'Imposta la sezione corretta ([probe], [bltouch], ecc.)'
        },
        'probe-sensor-pin': {
            param: 'sensor_pin',
            title: 'Pin Segnale Sonda (Sensor Pin)',
            desc: 'Pin a cui è collegata l\'uscita logica del sensore di livellamento. Spesso richiede pull-up interno (^).',
            tip: 'Es. ^PC14, ^PA0'
        },
        'probe-control-pin': {
            param: 'control_pin',
            title: 'Pin di Controllo Servocomando (BLTouch)',
            desc: 'Pin PWM che comanda l\'estrazione e la ritrazione dello spillo per sensori BLTouch e cloni.',
            tip: 'Es. PA8, PB0'
        },
        'probe-x-offset': {
            param: 'x_offset',
            title: 'Distanza X Sonda-Ugello',
            desc: 'Distanza orizzontale in millimetri tra l\'ugello e il punto di contatto della sonda lungo l\'asse X. Positiva se la sonda è a destra dell\'ugello, negativa se è a sinistra.',
            unit: 'mm',
            tip: '0.0 se la sonda è coassiale all\'ugello (es. Voron Tap o Eddy su ugello)'
        },
        'probe-y-offset': {
            param: 'y_offset',
            title: 'Distanza Y Sonda-Ugello',
            desc: 'Distanza orizzontale in millimetri tra l\'ugello e la sonda lungo l\'asse Y. Positiva se la sonda è dietro l\'ugello, negativa se è davanti.',
            unit: 'mm'
        },
        'probe-z-offset': {
            param: 'z_offset',
            title: 'Distanza Verticale Z-Offset',
            desc: 'Distanza verticale esatta tra la quota dell\'ugello e la quota di trigger della sonda. Valore fondamentale per il primo layer perfetto, rifinibile con PROBE_CALIBRATE.',
            unit: 'mm',
            tip: 'Maggiore è il valore, più l\'ugello scende vicino al piatto'
        },
        'probe-samples': {
            param: 'samples',
            title: 'Campionamenti per Singolo Punto',
            desc: 'Numero di letture consecutive effettuate per ogni punto della griglia per eliminare rumore e letture anomale.',
            tip: 'Consigliato: 2 o 3 letture per punto'
        },
        'probe-samples-result': {
            param: 'samples_result',
            title: 'Metodo di Aggregazione Campioni',
            desc: 'Come combinare i campioni rilevati sullo stesso punto: median (valore mediano, più robusto contro anomalie) o average (media aritmetica).',
            tip: 'Consigliato: median'
        },
        'check-enable-safe-z': {
            param: '[safe_z_home]',
            title: 'Abilita Safe Z Home',
            desc: 'Esegue l\'azzeramento dell\'asse Z al centro del piatto anziché agli angoli, prevenendo impatti se si usa una sonda montata sulla testina.',
            tip: 'Obbligatorio quando si usa una sonda (BLTouch/Tap) come endstop Z'
        },
        'safe-z-pos': {
            param: 'home_xy_position',
            title: 'Coordinate Centro Homing Z',
            desc: 'Coordinate X, Y a cui spostare la testina prima di far scendere la sonda per l\'homing Z (tipicamente il centro del piatto).',
            tip: 'Es. 150, 150 per piatto 300x300'
        },
        'safe-z-hop': {
            param: 'z_hop',
            title: 'Altezza di Sicurezza Z-Hop',
            desc: 'Distanza di sollevamento preventivo dell\'asse Z prima e dopo l\'homing per evitare di strisciare l\'ugello o la sonda sul piatto.',
            unit: 'mm',
            tip: 'Consigliato: 5 - 10 mm'
        },
        'safe-z-speed': {
            param: 'speed',
            title: 'Velocità di Spostamento Safe Z',
            desc: 'Velocità di traslazione della testina verso le coordinate di homing Z sicuro.',
            unit: 'mm/s',
            tip: 'Consigliato: 50 - 100 mm/s'
        },

        // --- Griglia di Livellamento (Bed Mesh) & Allineamento Z ---
        'mesh-min': {
            param: 'mesh_min',
            title: 'Coordinate Minime Griglia (X, Y)',
            desc: 'Coordinate (X, Y) del primo punto sondo sul piatto. Devono tenere conto dell\'offset della sonda per evitare che quest\'ultima esca dal piatto.',
            tip: 'Es. 25, 25'
        },
        'mesh-max': {
            param: 'mesh_max',
            title: 'Coordinate Massime Griglia (X, Y)',
            desc: 'Coordinate (X, Y) dell\'ultimo punto tastabile sul piatto.',
            tip: 'Es. 275, 275'
        },
        'mesh-probe-count': {
            param: 'probe_count',
            title: 'Risoluzione Griglia (Punti X, Y)',
            desc: 'Numero di punti di campionamento lungo X e Y per generare la mappa di altezza (Heightmap).',
            tip: 'Es. 5,5 (25 punti) o 7,7 (49 punti per piatti ampi)'
        },
        'mesh-algorithm': {
            param: 'algorithm',
            title: 'Algoritmo di Interpolazione Mesh',
            desc: 'Algoritmo matematico per calcolare le quote tra i punti tastati: bicubic (consigliato per griglie dense 5x5 o superiori) o lagrange (solo per griglie piccole 3x3).',
            tip: 'Consigliato: bicubic'
        },
        'z-tilt-positions': {
            param: 'z_positions',
            title: 'Punti Pivot Motori Z (z_positions)',
            desc: 'Coordinate fisiche (X, Y) dei fulcri o viti dei motori Z indipendenti per allineare il piatto con Z_TILT_ADJUST.',
            tip: 'Una coppia X, Y per ogni motore Z'
        },
        'z-tilt-points': {
            param: 'points',
            title: 'Punti di Tastatura Z-Tilt',
            desc: 'Coordinate sul piatto dove la sonda misurerà l\'inclinazione per calcolare i passi correttivi di ciascun motore Z.'
        },
        'z-tilt-retries': {
            param: 'retries',
            title: 'Tentativi Massimi Z-Tilt',
            desc: 'Numero massimo di cicli di misurazione consentiti per raggiungere la planarità desiderata.',
            tip: 'Tipicamente 5 - 10 tentativi'
        },
        'z-tilt-tolerance': {
            param: 'retry_tolerance',
            title: 'Tolleranza Livellamento Z-Tilt',
            desc: 'Scarto massimo tollerato tra i punti Z (in mm) per considerare il piatto perfettamente livellato.',
            unit: 'mm',
            tip: 'Consigliato: 0.0075 - 0.02 mm'
        },
        'qgl-corners': {
            param: 'gantry_corners',
            title: 'Coordinate Angoli Gantry (Voron QGL)',
            desc: 'Coordinate fisiche dei 4 angoli del carrello sospeso su stampanti tipo Voron 2.4 con Quad Gantry Level.'
        },
        'qgl-points': {
            param: 'points',
            title: '4 Punti di Tastatura QGL',
            desc: 'Coordinate dei 4 punti da sondare sul piatto per calcolare la correzione indipendente dei 4 motori Z.'
        },
        'qgl-retries': {
            param: 'retries',
            title: 'Tentativi Massimi QGL',
            desc: 'Numero massimo di cicli prima di considerare fallito il livellamento a 4 motori.',
            tip: 'Tipicamente 5 - 10'
        },
        'qgl-tolerance': {
            param: 'retry_tolerance',
            title: 'Tolleranza Quad Gantry Level',
            desc: 'Differenza massima accettabile tra i 4 angoli per completare la procedura.',
            unit: 'mm',
            tip: 'Consigliato: 0.0075 - 0.01 mm'
        },

        // --- Tab 6: Ventole & Ausiliari ---
        'fan-part-pin': {
            param: 'pin ([fan])',
            title: 'Pin Ventola Raffreddamento Pezzo',
            desc: 'Pin PWM collegato alla ventola del layer che raffredda il filamento estruso sul pezzo, comandabile via G-Code M106.',
            tip: 'Es. PA8, PC6'
        },
        'fan-part-kick': {
            param: 'kick_start_time',
            title: 'Tempo Spunto Iniziale Ventola',
            desc: 'Durata dell\'impulso al 100% di potenza (in secondi) erogato all\'avvio per vincere l\'inerzia iniziale delle ventole.',
            unit: 's',
            tip: 'Consigliato: 0.100 - 0.500 s'
        },
        'fan-part-off-below': {
            param: 'off_below',
            title: 'Soglia Minima Spegnimento Ventola',
            desc: 'Velocità minima al di sotto della quale la ventola non riceve alimentazione per evitare ronzii senza rotazione.',
            tip: 'Tipicamente 0.10 (10%)'
        },

        // --- Tab 7: Calibrazione Risonanze & Input Shaper ---
        'check-enable-shaper': {
            param: '[input_shaper]',
            title: 'Abilitazione Filtro Input Shaper',
            desc: 'Attiva la compensazione attiva delle vibrazioni e risonanze meccaniche, eliminando l\'effetto eco (ghosting/ringing) sulle superfici verticali ad alte velocità.',
            tip: 'Migliora drasticamente la finitura superficiale'
        },
        'shaper-freq-x': {
            param: 'shaper_freq_x',
            title: 'Frequenza Risonanza Asse X',
            desc: 'Frequenza naturale di oscillazione dell\'asse X individuata tramite test con accelerometro o con la stampa della torre di risonanza.',
            unit: 'Hz',
            tip: 'Tipicamente tra 35 e 85 Hz'
        },
        'shaper-type-x': {
            param: 'shaper_type_x',
            title: 'Algoritmo Filtro Asse X',
            desc: 'Modello matematico di attenuazione applicato all\'asse X (es. ZV, MZV, ZVD, EI, 2HUMP_EI, 3HUMP_EI).',
            tip: 'MZV ed EI sono tra i più diffusi ed equilibrati'
        },
        'shaper-freq-y': {
            param: 'shaper_freq_y',
            title: 'Frequenza Risonanza Asse Y',
            desc: 'Frequenza di risonanza dell\'asse Y (tipicamente inferiore rispetto ad X su stampanti "bed-slinger").',
            unit: 'Hz'
        },
        'shaper-type-y': {
            param: 'shaper_type_y',
            title: 'Algoritmo Filtro Asse Y',
            desc: 'Algoritmo shaper per l\'asse Y (es. MZV per piatti leggeri, EI o 2HUMP_EI per piatti pesanti).',
            tip: 'MZV o EI consigliati'
        },
        'check-enable-adxl': {
            param: '[adxl345]',
            title: 'Abilitazione Accelerometro ADXL345',
            desc: 'Configura il chip accelerometro digitale SPI per la misurazione automatica in tempo reale delle risonanze meccaniche con il comando TEST_RESONANCES.',
            tip: 'Collegabile a scheda host, toolhead board o Raspberry Pi'
        },
        'adxl-cs-pin': {
            param: 'cs_pin',
            unit: 'Pin MCU / Host',
            title: 'Pin Chip Select ADXL345',
            desc: 'Pin digitale per selezionare l\'accelerometro sul bus SPI.',
            tip: 'Es. rpi:None o gpio pin su toolhead'
        },
        'adxl-spi-mode': {
            param: 'spi_bus / spi_software_*_pin',
            title: 'Modalità Connessione SPI Accelerometro',
            desc: 'Seleziona tra bus SPI hardware (spi_bus) o emulazione SPI software tramite pin dedicati (Bit-banging).',
            tip: 'Hardware SPI o Software SPI (Bit-banging)'
        },
        'adxl-spi-bus': {
            param: 'spi_bus',
            title: 'Bus SPI Accelerometro',
            desc: 'Nome del bus SPI hardware utilizzato per leggere i dati dall\'accelerometro (es. spidev0.0, spi1).'
        },
        'adxl-spi-sclk': {
            param: 'spi_software_sclk_pin',
            unit: 'Pin MCU',
            title: 'Pin SCLK SPI Software Accelerometro',
            desc: 'Pin di clock seriale (SCL/SCLK) per la comunicazione SPI software dell\'accelerometro ADXL345.',
            tip: 'Es. head:PB10, PB13'
        },
        'adxl-spi-mosi': {
            param: 'spi_software_mosi_pin',
            unit: 'Pin MCU',
            title: 'Pin MOSI SPI Software Accelerometro',
            desc: 'Pin dati Master Out Slave In (SDA/MOSI) per la comunicazione SPI software dell\'accelerometro ADXL345.',
            tip: 'Es. head:PB11, PB15'
        },
        'adxl-spi-miso': {
            param: 'spi_software_miso_pin',
            unit: 'Pin MCU',
            title: 'Pin MISO SPI Software Accelerometro',
            desc: 'Pin dati Master In Slave Out (SDO/MISO) per la comunicazione SPI software dell\'accelerometro ADXL345.',
            tip: 'Es. head:PB2, PB14'
        },
        'adxl-axes-map': {
            param: 'axes_map',
            title: 'Orientamento Assi Accelerometro',
            desc: 'Mappatura degli assi fisici del chip rispetto agli assi di movimento della stampante.',
            tip: 'Default: x,y,z (invertibile es. -x,z,y se montato verticalmente)'
        },
        'adxl-rate': {
            param: 'rate',
            title: 'Campionamento ADXL345',
            desc: 'Frequenza di acquisizione dati dell\'accelerometro (da 1600 Hz a 3200 Hz).',
            unit: 'Hz',
            tip: 'Valore standard Klipper: 3200'
        },
        'check-enable-resonance-tester': {
            param: '[resonance_tester]',
            title: 'Abilitazione Resonance Tester',
            desc: 'Attiva la sezione [resonance_tester] per consentire i test automatici delle risonanze con accelerometro (TEST_RESONANCES / SHAPER_CALIBRATE).'
        },
        'res-accel-chip': {
            param: 'accel_chip',
            title: 'Chip Accelerometro di Riferimento',
            desc: 'Nome della sezione accelerometro usata dal resonance tester (es. adxl345).'
        },
        'res-probe-points': {
            param: 'probe_points',
            title: 'Coordinate Test di Risonanza',
            desc: 'Coordinate X, Y, Z dove posizionare la testina durante la vibrazione di test.',
            tip: 'Es. 150, 150, 20 (centro del piatto)'
        },
        'res-accel-per-hz': {
            param: 'accel_per_hz',
            title: 'Accelerazione per Hertz',
            desc: 'Fattore di accelerazione applicato per ciascun Hz durante lo sweep delle frequenze.',
            tip: 'Default standard Klipper: 75'
        },
        'res-max-smoothing': {
            param: 'max_smoothing',
            title: 'Livellamento Massimo Tollerato',
            desc: 'Massimo fattore di smoothing accettabile durante il calcolo automatico dello shaper ottimale.'
        },
        'calibration-z-offset': {
            param: 'z_offset',
            unit: 'mm',
            title: 'Altezza Z-Offset Sonda',
            desc: 'Distanza verticale tra il punto di attivazione della sonda e la punta dell\'ugello (sincronizzata con la scheda Sonda).'
        },
        'extruder-sensor-spi-mode': {
            param: 'spi_bus / spi_software_*_pin',
            title: 'Modalità Connessione SPI Sensore',
            desc: 'Seleziona se l\'amplificatore termico (MAX31865/MAX6675) comunica su bus SPI hardware della MCU o tramite pin SPI software (Bit-banging).'
        },
        'extruder-sensor-spi-bus': {
            param: 'spi_bus',
            title: 'Bus SPI Sensore Termico',
            desc: 'Identificativo del bus SPI hardware della MCU collegato al sensore di temperatura (es. spi1, spi2).'
        },
        'extruder-sensor-spi-speed': {
            param: 'spi_speed',
            unit: 'Hz',
            title: 'Frequenza Clock SPI Sensore',
            desc: 'Velocità di comunicazione sul bus SPI in Hertz per il sensore termico.',
            tip: 'Default Klipper: 4000000 (4 MHz)'
        },
        'extruder-sensor-spi-sclk': {
            param: 'spi_software_sclk_pin',
            unit: 'Pin MCU',
            title: 'Pin SCLK SPI Software Sensore',
            desc: 'Pin di clock seriale (SCK/SCLK) per comunicazione SPI software del sensore termico.'
        },
        'extruder-sensor-spi-mosi': {
            param: 'spi_software_mosi_pin',
            unit: 'Pin MCU',
            title: 'Pin MOSI SPI Software Sensore',
            desc: 'Pin dati Master Out Slave In (MOSI/SDI) per comunicazione SPI software del sensore termico.'
        },
        'extruder-sensor-spi-miso': {
            param: 'spi_software_miso_pin',
            unit: 'Pin MCU',
            title: 'Pin MISO SPI Software Sensore',
            desc: 'Pin dati Master In Slave Out (MISO/SDO) per comunicazione SPI software del sensore termico.'
        },
        'extruder-driver-model-select': {
            param: '[tmcXXXX extruder]',
            title: 'Modello Driver Estrusore',
            desc: 'Modello del driver stepper installato per il motore dell\'estrusore (es. TMC2209, TMC5160, Standalone).'
        },
        'extruder-driver-conn-type-select': {
            param: 'uart_pin / cs_pin',
            title: 'Tipo Comunicazione Driver Estrusore',
            desc: 'Modalità di collegamento dati tra MCU/toolhead e il driver dell\'estrusore (UART, SPI o Standalone).'
        },
        'extruder-driver-uart-pin': {
            param: 'uart_pin',
            unit: 'Pin MCU',
            title: 'Pin UART Driver Estrusore',
            desc: 'Pin digitale bidirezionale utilizzato per la comunicazione seriale UART con il driver dell\'estrusore.'
        },
        'extruder-driver-tx-pin': {
            param: 'tx_pin',
            unit: 'Pin MCU (Opzionale)',
            title: 'Pin TX Dedicato Driver Estrusore',
            desc: 'Pin di trasmissione separato usato solo su schede che non utilizzano una linea UART single-wire.'
        },
        'extruder-driver-uart-address': {
            param: 'uart_address',
            unit: '0 - 3',
            title: 'Indirizzo Multi-Nodo UART',
            desc: 'Indirizzo hardware (0-3) del driver quando più chip TMC2209 condividono la stessa linea UART.'
        },
        'extruder-driver-cs-pin': {
            param: 'cs_pin',
            unit: 'Pin MCU',
            title: 'Pin Chip Select SPI Driver Estrusore',
            desc: 'Pin di abilitazione Chip Select (CS) per il driver estrusore su bus SPI.'
        },
        'extruder-driver-spi-mode': {
            param: 'spi_bus / spi_software_*_pin',
            title: 'Modalità Connessione SPI Driver Estrusore',
            desc: 'Seleziona tra bus SPI hardware della MCU o emulazione SPI software tramite pin dedicati (Bit-banging).'
        },
        'extruder-driver-spi-bus': {
            param: 'spi_bus',
            title: 'Bus SPI Hardware Driver Estrusore',
            desc: 'Nome del bus SPI hardware della MCU utilizzato dal driver estrusore (es. spi1, spi2).'
        },
        'extruder-driver-spi-sclk': {
            param: 'spi_software_sclk_pin',
            unit: 'Pin MCU',
            title: 'Pin SCLK SPI Software Driver Estrusore',
            desc: 'Pin di clock seriale (SCK) per il bus SPI software del driver estrusore.'
        },
        'extruder-driver-spi-mosi': {
            param: 'spi_software_mosi_pin',
            unit: 'Pin MCU',
            title: 'Pin MOSI SPI Software Driver Estrusore',
            desc: 'Pin dati MOSI per il bus SPI software del driver estrusore.'
        },
        'extruder-driver-spi-miso': {
            param: 'spi_software_miso_pin',
            unit: 'Pin MCU',
            title: 'Pin MISO SPI Software Driver Estrusore',
            desc: 'Pin dati MISO per il bus SPI software del driver estrusore.'
        },
        'extruder-driver-run-current': {
            param: 'run_current',
            unit: 'A (Ampere)',
            title: 'Corrente Operativa Estrusore',
            desc: 'Corrente RMS erogata al motore dell\'estrusore durante la stampa.',
            tip: 'Motori pancake (Orbiter/SB/Sherpa): 0.50A - 0.70A'
        },
        'extruder-driver-stealthchop': {
            param: 'stealthchop_threshold',
            unit: 'mm/s',
            title: 'Modalità StealthChop / SpreadCycle Estrusore',
            desc: 'Soglia di velocità per la modalità silenziosa. Per l\'estrusore si consiglia SpreadCycle (0) per massimizzare coppia e precisione.',
            tip: 'Consigliato per estrusore: 0 (SpreadCycle)'
        },
        'extruder-check-enable-hold-current': {
            param: 'hold_current',
            title: 'Abilita Corrente di Mantenimento Estrusore',
            desc: 'Attiva una corrente ridotta quando l\'estrusore è fermo. Klipper sconsiglia hold_current sull\'estrusore per evitare imprecisioni.'
        },
        'extruder-driver-hold-current': {
            param: 'hold_current',
            unit: 'A (Ampere)',
            title: 'Corrente a Riposo Estrusore',
            desc: 'Corrente mantenuta sugli avvolgimenti quando il motore dell\'estrusore è fermo.'
        },
        'extruder-check-enable-sense-resistor': {
            param: 'sense_resistor',
            title: 'Specifica Resistenza di Sense Estrusore',
            desc: 'Abilita l\'inserimento manuale del valore del resistore di campionamento corrente del driver estrusore.'
        },
        'extruder-driver-sense-resistor': {
            param: 'sense_resistor',
            unit: 'Ω (Ohm)',
            title: 'Resistenza di Sense Driver Estrusore',
            desc: 'Valore in Ohm dei resistori di sense sulla scheda driver.',
            tip: 'TMC2209: 0.110 Ω | TMC5160: 0.075 Ω'
        },
        'extruder-driver-interpolate': {
            param: 'interpolate',
            title: 'Interpolazione a 256 Microstep',
            desc: 'Abilita l\'interpolazione interna del driver estrusore a 256 microstep (interpolate: True).'
        },
        'virtual-sd-path': {
            param: 'path ([virtual_sdcard])',
            title: 'Percorso Cartella File G-Code',
            desc: 'Percorso nel file system Linux dove Moonraker e Klipper salvano e leggono i file G-Code di stampa.',
            tip: 'Default: ~/printer_data/gcodes'
        },
        'calc-drive-type': {
            param: 'rotation_distance',
            title: 'Tipo di Trasmissione Meccanica',
            desc: 'Seleziona tra trasmissione a cinghia dentata (GT2 2mm) o vite trapezia per calcolare la rotation_distance.'
        },
        'calc-pulley-teeth': {
            param: 'rotation_distance = denti × 2',
            title: 'Numero Denti Puleggia',
            desc: 'Numero di denti della puleggia motrice montata sull\'albero motore (es. 16 o 20 denti).'
        },
        'calc-leadscrew-pitch': {
            param: 'rotation_distance = lead',
            unit: 'mm/giro',
            title: 'Passo Barra Filettata (Lead)',
            desc: 'Millimetri di avanzamento lineare per un giro completo della vite (es. T8x8 = 8, T8x4 = 4, T8x2 = 2).'
        },

        // --- Modali, Sistema & Topbar ---
        'input-moonraker-url': {
            param: 'Moonraker Base URL',
            title: 'Indirizzo Istanza Moonraker',
            desc: 'Indirizzo IP o hostname con porta del server Moonraker che controlla Klipper (es. http://192.168.1.50:7125). Lasciare vuoto per autorilevamento sulla stessa macchina.',
            tip: 'Default: origine corrente (stesso host di Mainsail)'
        },
        'check-force-light-mode': {
            param: 'UI Theme Mode',
            title: 'Forza Modalità Chiara',
            desc: 'Forza l\'interfaccia grafica in tema chiaro invece di sincronizzare il tema scuro da Mainsail.',
            tip: 'Consigliato non attivo per abbinamento perfetto a Mainsail'
        },
        'check-virtual-sd': {
            param: '[virtual_sdcard]',
            title: 'Abilitazione Virtual SD Card',
            desc: 'Permette a Klipper di eseguire direttamente i file G-Code caricati su Moonraker o Mainsail nel disco locale.',
            tip: 'Indispensabile per il funzionamento di Mainsail e Moonraker'
        },
        'check-pause-resume': {
            param: '[pause_resume]',
            title: 'Abilitazione Pausa e Ripresa',
            desc: 'Abilita il supporto ai comandi PAUSE e RESUME nativi di Klipper, necessari per cambi filamento e pause di emergenza.',
            tip: 'Raccomandato attivo in ogni stampante'
        },
        'check-display-status': {
            param: '[display_status]',
            title: 'Stato di Avanzamento Stampa',
            desc: 'Fornisce lo stato di avanzamento percentuale e messaggi di stato alla web interface e agli schermi.',
            tip: 'Raccomandato attivo'
        },
        'check-respond': {
            param: '[respond]',
            title: 'Comando Risposta Console (M118)',
            desc: 'Permette ai comandi M118 e RESPOND di scrivere messaggi informativi nella console interattiva di Mainsail.',
            tip: 'Utile per script e macro avanzate'
        },
        'idle-timeout': {
            param: 'timeout ([idle_timeout])',
            title: 'Tempo di Timeout Inattività',
            desc: 'Secondi di inattività trascorsi i quali Klipper disattiva automaticamente motori e riscaldatori per sicurezza energetica e termica.',
            unit: 's',
            tip: 'Default: 600 secondi (10 minuti)'
        }
    };

    for (const [k, v] of Object.entries(KLIPPER_TOOLTIPS)) {
        v.id = k;
    }

    // =========================================================================
    // Funzioni di Lookup Intelligente (per ID, name, label o keyword)
    // =========================================================================
    function getTooltipDataForElement(el, labelEl) {
        if (!el && !labelEl) return null;

        const id = el?.id || labelEl?.getAttribute('for') || '';
        if (id && KLIPPER_TOOLTIPS[id]) {
            return Object.assign({ id }, KLIPPER_TOOLTIPS[id]);
        }

        // Cerca per name
        const name = el?.name || '';
        if (name && KLIPPER_TOOLTIPS[name]) {
            return Object.assign({ id: name }, KLIPPER_TOOLTIPS[name]);
        }

        // Classi dinamiche MCU, Ventole, LED
        const cls = el?.className || '';
        if (cls.includes('mcu-name-input')) return { param: '[mcu <nome>]', title: 'Nome Identificativo MCU Secondario', desc: 'Nome univoco della scheda secondaria o toolhead board usato nei prefissi dei pin (es. toolhead:PA0, rpi:gpio12).' };
        if (cls.includes('mcu-conn-type-select')) return { param: 'serial / canbus_uuid', title: 'Metodo di Connessione MCU', desc: 'Seleziona tra CAN Bus (canbus_uuid), porta seriale USB (/dev/serial/by-id/...) o processo Linux MCU (/tmp/klipper_host_mcu).' };
        if (cls.includes('mcu-address-input')) return { param: 'serial / canbus_uuid', title: 'Indirizzo o UUID MCU', desc: 'Percorso seriale USB del dispositivo Linux oppure codice univoco a 12 caratteri esadecimali per schede CAN Bus.' };
        if (cls.includes('mcu-baud-input')) return { param: 'baud', unit: 'bps', title: 'Velocità Seriale (Baud Rate)', desc: 'Velocità di comunicazione seriale (opzionale, default Klipper: 250000).' };
        if (cls.includes('mcu-restart-input')) return { param: 'restart_method', title: 'Metodo di Riavvio MCU', desc: 'Metodo utilizzato dall\'host per riavviare il microcontrollore (es. command, arduino, rpi_usb).' };

        if (cls.includes('fan-type-select')) return { param: '[heater_fan] / [controller_fan] / [temperature_fan] / [fan_generic]', title: 'Tipologia Ventola Klipper', desc: 'Definisce il comportamento della ventola: heater_fan (dissipatore hotend), controller_fan (elettronica/driver), temperature_fan (termoregolata) o fan_generic (controllo manuale).' };
        if (cls.includes('fan-name-input')) return { param: '<nome_ventola>', title: 'Nome Ventola Ausiliaria', desc: 'Identificativo univoco della ventola in Klipper e Mainsail (es. hotend_fan, controller_fan, chamber_fan).' };
        if (cls.includes('fan-pin-input')) return { param: 'pin', unit: 'Pin MCU', title: 'Pin di Controllo Ventola', desc: 'Pin MOSFET della scheda madre o toolhead che alimenta la ventola.' };
        if (cls.includes('fan-heater-input')) return { param: 'heater', title: 'Riscaldatore Associato', desc: 'Riscaldatore monitorato per attivare automaticamente la ventola (default: extruder).' };
        if (cls.includes('fan-heater-temp-input')) return { param: 'heater_temp', unit: '°C', title: 'Temperatura di Attivazione', desc: 'Soglia di temperatura sopra la quale la ventola si accende automaticamente (default: 50.0 °C).' };
        if (cls.includes('fan-stepper-input')) return { param: 'stepper', title: 'Motori Stepper Monitorati', desc: 'Elenco di stepper che attivano la ventola elettronica quando alimentati (vuoto = tutti gli stepper).' };
        if (cls.includes('fan-sens-type-input')) return { param: 'sensor_type', title: 'Tipo Sensore Temperatura', desc: 'Modello di termistore utilizzato per rilevare la temperatura della ventola termoregolata.' };
        if (cls.includes('fan-sens-pin-input')) return { param: 'sensor_pin', unit: 'Pin ADC', title: 'Pin Sensore Temperatura', desc: 'Pin analogico collegato al termistore della ventola.' };
        if (cls.includes('fan-target-temp-input')) return { param: 'target_temp', unit: '°C', title: 'Temperatura Target', desc: 'Temperatura obiettivo mantenuta dalla ventola termoregolata.' };
        if (cls.includes('fan-max-power-input')) return { param: 'max_power', unit: '0.0 - 1.0', title: 'Potenza Massima Ventola', desc: 'Potenza massima PWM erogabile alla ventola (da 0.0 a 1.0, default: 1.0).' };

        if (cls.includes('led-type-select')) return { param: '[neopixel] / [led] / [output_pin]', title: 'Tipologia Illuminazione LED', desc: 'neopixel: strisce indirizzabili WS2812/SK6812; led: modulo Klipper [led] standard per pin RGB/RGBW/Bianco; output_pin: barra LED monocromatica PWM.' };
        if (cls.includes('led-name-input')) return { param: '<nome_led>', title: 'Nome Identificativo LED', desc: 'Nome della sezione LED in Klipper e Mainsail (es. caselight, sb_leds).' };
        if (cls.includes('led-pin-input')) return { param: 'pin / white_pin', unit: 'Pin MCU', title: 'Pin Principale o Bianco LED', desc: 'Pin dati per strisce Neopixel, pin di uscita per output_pin, oppure white_pin per sezioni [led].' };
        if (cls.includes('led-chain-input')) return { param: 'chain_count', title: 'Numero di LED nella Catena', desc: 'Quantità totale di diodi LED indirizzabili collegati in serie sulla striscia Neopixel.' };
        if (cls.includes('led-order-select')) return { param: 'color_order', title: 'Ordine Canali Colore', desc: 'Sequenza hardware dei colori nei chip Neopixel (GRB per WS2812B, GRBW o RGBW per SK6812).' };
        if (cls.includes('led-red-input')) return { param: 'red_pin', unit: 'Pin MCU', title: 'Pin Canale Rosso', desc: 'Pin del microcontrollore collegato al canale Rosso della striscia LED standard [led].' };
        if (cls.includes('led-green-input')) return { param: 'green_pin', unit: 'Pin MCU', title: 'Pin Canale Verde', desc: 'Pin del microcontrollore collegato al canale Verde della striscia LED standard [led].' };
        if (cls.includes('led-blue-input')) return { param: 'blue_pin', unit: 'Pin MCU', title: 'Pin Canale Blu', desc: 'Pin del microcontrollore collegato al canale Blu della striscia LED standard [led].' };
        if (cls.includes('led-cycle-input')) return { param: 'cycle_time', unit: 's', title: 'Tempo di Ciclo PWM', desc: 'Durata in secondi del ciclo PWM per il controllo luminosità LED (default Klipper: 0.010).' };

        // Ricerca per parole chiave e pattern frequenti nei parametri Klipper
        const labelText = (labelEl?.textContent || '').trim().toLowerCase();
        const idLower = id.toLowerCase();

        if (idLower.includes('step-pin') || labelText.includes('step pin')) {
            return {
                param: 'step_pin',
                title: 'Pin del Segnale di Passo',
                desc: 'Pin del microcontrollore dedicato agli impulsi di passo (Step) per questo motore.',
                tip: 'Es. PA0, PB2'
            };
        }
        if (idLower.includes('dir-pin') || labelText.includes('dir pin')) {
            return {
                param: 'dir_pin',
                title: 'Pin di Direzione',
                desc: 'Pin che imposta il senso di rotazione del motore. Anteporre ! se ruota al contrario.',
                tip: 'Es. PA1 o !PA1'
            };
        }
        if (idLower.includes('enable-pin') || labelText.includes('enable pin')) {
            return {
                param: 'enable_pin',
                title: 'Pin di Abilitazione',
                desc: 'Pin che alimenta gli avvolgimenti del motore (solitamente richiede ! per logica attiva-bassa).',
                tip: 'Es. !PA2'
            };
        }
        if (idLower.includes('rotation-distance') || idLower.includes('rot-dist') || labelText.includes('rotation distance')) {
            return {
                param: 'rotation_distance',
                title: 'Distanza di Rotazione',
                desc: 'Millimetri lineari percorsi dall\'asse con un giro completo di 360° del motore.',
                unit: 'mm',
                tip: 'Formula puleggia: denti * passo cinghia'
            };
        }
        if (idLower.includes('microsteps') || labelText.includes('microsteps')) {
            return {
                param: 'microsteps',
                title: 'Micropassi Driver',
                desc: 'Numero di micropassi generati dal driver per ogni passo intero del motore.',
                tip: 'Consigliato: 16 o 32'
            };
        }
        if (idLower.includes('run-current') || labelText.includes('run_current')) {
            return {
                param: 'run_current',
                title: 'Corrente di Esercizio',
                desc: 'Corrente RMS erogata dal driver al motore durante il normale funzionamento.',
                unit: 'A',
                tip: 'Tipicamente 0.6A - 1.2A'
            };
        }
        if (idLower.includes('hold-current') || labelText.includes('hold_current')) {
            return {
                param: 'hold_current',
                title: 'Corrente di Mantenimento',
                desc: 'Corrente erogata a motore fermo in posizione di stallo.',
                unit: 'A'
            };
        }
        if (idLower.includes('sense-resistor') || labelText.includes('sense_resistor')) {
            return {
                param: 'sense_resistor',
                title: 'Resistenza di Shunt',
                desc: 'Valore della resistenza di campionamento corrente montata sul modulo driver.',
                unit: 'Ω',
                tip: 'TMC2209: 0.110 ohm'
            };
        }
        if (idLower.includes('stealthchop') || labelText.includes('stealthchop')) {
            return {
                param: 'stealthchop_threshold',
                title: 'Modalità StealthChop',
                desc: 'Attiva la modalità ultra-silenziosa del driver. Disabilitare per massima coppia e velocità.',
                tip: 'Abilitato (999999) o Disabilitato (0)'
            };
        }
        if (idLower.includes('uart-pin') || labelText.includes('uart_pin')) {
            return {
                param: 'uart_pin',
                title: 'Pin UART Digitale',
                desc: 'Pin del microcontrollore per la configurazione seriale del driver TMC.',
                tip: 'Es. PC11, PD5'
            };
        }
        if (idLower.includes('sensor-type') || labelText.includes('sensor_type')) {
            return {
                param: 'sensor_type',
                title: 'Tipo di Termistore o Sonda',
                desc: 'Modello esatto di sensore termico impiegato per la misurazione della temperatura.',
                tip: 'Es. Generic 3950, PT1000'
            };
        }
        if (idLower.includes('heater-pin') || labelText.includes('heater_pin')) {
            return {
                param: 'heater_pin',
                title: 'Pin Riscaldatore',
                desc: 'Pin MOSFET che comanda la cartuccia o il piatto riscaldato in PWM.',
                tip: 'Es. PA2, PC9'
            };
        }
        if (idLower.includes('min-temp') || labelText.includes('min_temp')) {
            return {
                param: 'min_temp',
                title: 'Temperatura Minima di Sicurezza',
                desc: 'Soglia minima ammessa di temperatura (°C). Al di sotto scatta l\'arresto di emergenza per sensore scollegato.',
                unit: '°C'
            };
        }
        if (idLower.includes('max-temp') || labelText.includes('max_temp')) {
            return {
                param: 'max_temp',
                title: 'Temperatura Massima di Sicurezza',
                desc: 'Soglia termica massima consentita per prevenire incendi e danni hardware.',
                unit: '°C'
            };
        }
        if (idLower.includes('gear-ratio') || labelText.includes('gear_ratio')) {
            return {
                param: 'gear_ratio',
                title: 'Rapporto di Riduzione Meccanica',
                desc: 'Rapporto di trasmissione ingranaggi tra motore e trascinatore (es. 50:17 o 7.5:1).',
                tip: 'Lasciare vuoto se azionamento diretto'
            };
        }
        if (idLower.includes('homing-speed') || labelText.includes('homing_speed')) {
            return {
                param: 'homing_speed',
                title: 'Velocità di Homing',
                desc: 'Velocità con cui l\'asse si muove verso il finecorsa durante l\'azzeramento.',
                unit: 'mm/s'
            };
        }

        // Fallback di cortesia per qualsiasi campo con testo label comprensibile
        if (labelText.length > 2) {
            return {
                param: id || 'parametro',
                title: labelText.replace(/[:*]/g, '').trim(),
                desc: `Configurazione del valore '${labelText.replace(/[:*]/g, '').trim()}' per il firmware Klipper.`
            };
        }

        return null;
    }

    // =========================================================================
    // Dizionario Tooltip in Inglese (TOOLTIPS_EN)
    // =========================================================================
    const TOOLTIPS_EN = {
        'kinematics': { title: 'Main Kinematics Type', desc: 'Defines the mechanical kinematic structure of the printer (Cartesian, CoreXY, CoreXZ, Delta, Hybrid CoreXY, etc.).', tip: 'Ender 3: cartesian | Voron: corexy | Delta: delta' },
        'max_velocity': { title: 'Maximum Velocity', desc: 'Maximum toolhead travel speed allowed on the horizontal XY plane.', tip: 'Typical: 150 - 300 mm/s (bedslinger), 300 - 600+ mm/s (CoreXY)' },
        'max_accel': { title: 'Maximum Acceleration', desc: 'Maximum acceleration permitted for the toolhead.', tip: 'Typical: 3000 - 5000 mm/s² (Cartesian), 5000 - 20000+ mm/s² (CoreXY with input shaper)' },
        'minimum_cruise_ratio': { title: 'Minimum Cruise Ratio', desc: 'Minimum fraction of travel distance spent at constant cruise velocity before decelerating. Replaces max_accel_to_decel.', tip: 'Default: 0.5 (50%)' },
        'square_corner_velocity': { title: 'Square Corner Velocity', desc: 'Maximum velocity at which the toolhead may negotiate a 90° turn without decelerating to zero.', tip: 'Typical: 5.0 - 10.0 mm/s' },
        'max_z_velocity': { title: 'Maximum Z Velocity', desc: 'Maximum vertical travel speed allowed for the Z axis.', tip: 'Lead screws: 10 - 25 mm/s | Belts: 30 - 60 mm/s' },
        'max_z_accel': { title: 'Maximum Z Acceleration', desc: 'Maximum acceleration applied during Z axis vertical motions and hops.', tip: 'Typical: 100 - 350 mm/s²' },
        'rotation_distance': { title: 'Rotation Distance', desc: 'Linear distance (in mm) traveled by the axis for one full 360° turn of the stepper motor.', tip: 'GT2 20T: 40.0 | Lead screw T8x8: 8.0' },
        'microsteps': { title: 'Microstep Resolution', desc: 'Microstepping multiplier set inside the driver for smooth motion.', tip: 'Recommended: 16 or 32' },
        'run_current': { title: 'Operating Run Current', desc: 'RMS current supplied to the stepper motor windings during movement.', tip: 'NEMA17 standard: 0.65 - 0.85A | High-torque: 1.0 - 1.4A' },
        'hold_current': { title: 'Hold Current', desc: 'Current supplied when motor is standing still in stationary position.' },
        'sense_resistor': { title: 'Current Sense Resistor', desc: 'Value of the shunt resistor on the driver module to measure current.', tip: 'TMC2209: 0.110 ohm' },
        'stealthchop_threshold': { title: 'StealthChop Mode', desc: 'Enables ultra-quiet StealthChop mode. Disable (0) for high-speed SpreadCycle power.' },
        'interpolate': { title: '256 Microstep Interpolation', desc: 'Driver automatically interpolates microsteps to 256 internal microsteps.' },
        'step_pin': { title: 'Step Signal Pin', desc: 'Microcontroller pin that pulses step clock cycles to the stepper driver.' },
        'dir_pin': { title: 'Direction Pin', desc: 'Pin setting the motor rotation direction. Prepend ! to invert direction.' },
        'enable_pin': { title: 'Enable Pin', desc: 'Pin enabling driver power (usually active-low, requiring !).' },
        'uart_pin': { title: 'UART Pin', desc: 'MCU digital serial pin configuring TMC driver registers.' },
        'diag_pin': { title: 'StallGuard Diag Pin', desc: 'Pin signaling mechanical stall for sensorless homing.' },
        'driver_SGTHRS / driver_SGT': { title: 'StallGuard Sensitivity', desc: 'Collision sensitivity for sensorless homing. TMC2209: 0 to 255 (typical 60 - 120).' },
        'nozzle_diameter': { title: 'Nozzle Orifice Diameter', desc: 'Hole diameter of the installed nozzle on the hotend.', tip: 'Standard: 0.40 mm' },
        'filament_diameter': { title: 'Filament Diameter', desc: 'Nominal diameter of the thermoplastic filament (1.75 mm or 2.85 mm).' },
        'pressure_advance': { title: 'Pressure Advance', desc: 'Active compensation for filament elasticity and nozzle chamber pressure during acceleration.', tip: 'Direct Drive: 0.02 - 0.06 | Bowden: 0.3 - 0.8' },
        'sensor_type': { title: 'Temperature Sensor Model', desc: 'Exact model of thermistor, thermocouple or RTD probe.' },
        'heater_pin': { title: 'Heater Cartridge Pin', desc: 'MCU MOSFET pin driving heater PWM power.' },
        'sensor_pin': { title: 'Sensor ADC Pin', desc: 'Microcontroller analog ADC pin reading temperature.' },
        'min_temp': { title: 'Thermal Safety Minimum', desc: 'Minimum allowed temperature (°C). Triggers shutdown if disconnected.' },
        'max_temp': { title: 'Thermal Safety Maximum', desc: 'Maximum allowed temperature before emergency thermal shutdown.' },
        'min_extrude_temp': { title: 'Minimum Extrude Temperature', desc: 'Safety threshold preventing cold extrusion commands.' },
        'control': { title: 'Thermal Control Algorithm', desc: 'PID (Proportional Integral Derivative) or Watermark hysteresis.' },
        'pid_Kp': { title: 'PID Proportional Gain', desc: 'Calibrated using PID_CALIBRATE command.' },
        'pid_Ki': { title: 'PID Integral Gain', desc: 'Corrects accumulated thermal drift.' },
        'pid_Kd': { title: 'PID Derivative Gain', desc: 'Damps rapid temperature fluctuations.' },
        'position_min': { title: 'Minimum Travel Position', desc: 'Minimum coordinate reachable on this axis.' },
        'position_max': { title: 'Maximum Travel Position', desc: 'Maximum coordinate reachable on this axis (print volume limit).' },
        'position_endstop': { title: 'Endstop Trigger Position', desc: 'Exact coordinate assigned when endstop is triggered.' },
        'homing_speed': { title: 'Homing Travel Speed', desc: 'Speed at which the axis moves towards endstop during homing.' },
        'z_offset': { title: 'Probe Z-Offset', desc: 'Vertical distance between nozzle tip and probe trigger point.' },
        'mesh_min': { title: 'Bed Mesh Minimum', desc: 'Minimum X,Y probe coordinates for heightmap leveling.' },
        'mesh_max': { title: 'Bed Mesh Maximum', desc: 'Maximum X,Y probe coordinates for heightmap leveling.' },
        'probe_count': { title: 'Mesh Grid Resolution', desc: 'Number of sample points along X and Y (e.g. 5,5 or 7,7).' },
        'shaper_freq_x': { title: 'X Resonance Frequency', desc: 'Natural vibration resonance frequency of X axis in Hz.' },
        'shaper_freq_y': { title: 'Y Resonance Frequency', desc: 'Natural vibration resonance frequency of Y axis in Hz.' },
        'shaper_type_x': { title: 'X Shaper Filter Type', desc: 'Vibration damping algorithm (e.g. MZV, EI, ZV).' },
        'shaper_type_y': { title: 'Y Shaper Filter Type', desc: 'Vibration damping algorithm for Y axis.' },
        'serial': { title: 'MCU Serial Path', desc: 'Linux USB serial device path (/dev/serial/by-id/...).' },
        'canbus_uuid': { title: 'CAN Bus UUID', desc: '12-digit hexadecimal unique identifier for CAN board.' },
        'baud': { title: 'Baud Rate', desc: 'Serial baud rate speed (default 250000).' }
    };

    // =========================================================================
    // Gestione Tooltip Fluttuante Globale (Singleton)
    // =========================================================================
    let tooltipEl = null;

    function getOrCreateTooltipElement() {
        if (!tooltipEl) {
            tooltipEl = document.getElementById('klifig-tooltip');
            if (!tooltipEl) {
                tooltipEl = document.createElement('div');
                tooltipEl.id = 'klifig-tooltip';
                tooltipEl.className = 'klifig-tooltip';
                tooltipEl.setAttribute('role', 'tooltip');
                tooltipEl.innerHTML = `
                    <div class="tooltip-header">
                        <span class="tooltip-param" id="tt-param"></span>
                        <span class="tooltip-unit" id="tt-unit" style="display:none;"></span>
                    </div>
                    <div class="tooltip-title" id="tt-title"></div>
                    <div class="tooltip-desc" id="tt-desc"></div>
                    <div class="tooltip-tip" id="tt-tip" style="display:none;"></div>
                `;
                document.body.appendChild(tooltipEl);
            }
        }
        return tooltipEl;
    }

    function showTooltip(targetBadge, data) {
        if (!data) return;
        const tt = getOrCreateTooltipElement();

        const paramEl = tt.querySelector('#tt-param');
        const unitEl = tt.querySelector('#tt-unit');
        const titleEl = tt.querySelector('#tt-title');
        const descEl = tt.querySelector('#tt-desc');
        const tipEl = tt.querySelector('#tt-tip');

        if (paramEl) paramEl.textContent = data.param || 'Parametro';
        const activeLang = (window.i18n && window.i18n.getActiveLanguage()) || 'it';
        let displayTitle = data.title || '';
        let displayDesc = data.desc || '';
        let displayTip = data.tip || '';

        // Dizionario localizzato caricato dal file di lingua (dist/locales/<lang>.json)
        const localeTooltips = window.LOCALE_TOOLTIPS && window.LOCALE_TOOLTIPS[activeLang];
        const lookupId = data.id || (targetBadge?.parentElement?.getAttribute('for')) || (targetBadge?.closest('.form-group')?.querySelector('input, select, textarea')?.id);
        const localized = localeTooltips && (
            (lookupId && localeTooltips[lookupId]) ||
            (data.id && localeTooltips[data.id]) ||
            (data.param && localeTooltips[data.param])
        );
        if (localized) {
            if (localized.title) displayTitle = localized.title;
            if (localized.desc) displayDesc = localized.desc;
            if (localized.tip) displayTip = localized.tip;
        } else if (activeLang === 'en' && typeof TOOLTIPS_EN !== 'undefined') {
            const en = TOOLTIPS_EN[data.param] || (data.id && TOOLTIPS_EN[data.id]);
            if (en) {
                if (en.title) displayTitle = en.title;
                if (en.desc) displayDesc = en.desc;
                if (en.tip) displayTip = en.tip;
            }
        }

        if (paramEl) paramEl.textContent = data.param || (activeLang === 'en' ? 'Parameter' : 'Parametro');
        if (titleEl) titleEl.textContent = displayTitle;
        if (descEl) descEl.textContent = displayDesc;

        if (unitEl) {
            if (data.unit) {
                unitEl.textContent = `[${data.unit}]`;
                unitEl.style.display = 'inline-block';
            } else {
                unitEl.style.display = 'none';
            }
        }

        if (tipEl) {
            if (displayTip) {
                tipEl.textContent = `💡 ${displayTip}`;
                tipEl.style.display = 'block';
            } else {
                tipEl.style.display = 'none';
            }
        }

        // Posizionamento intelligente rispetto al badge 'i'
        const badgeRect = targetBadge.getBoundingClientRect();
        tt.classList.add('visible');

        const ttWidth = tt.offsetWidth || 300;
        const ttHeight = tt.offsetHeight || 100;
        const padding = 10;

        // Calcola orizzontale (centrato rispetto al badge)
        let left = badgeRect.left + (badgeRect.width / 2) - (ttWidth / 2);
        if (left < padding) left = padding;
        if (left + ttWidth > window.innerWidth - padding) {
            left = window.innerWidth - ttWidth - padding;
        }

        // Calcola verticale (preferibilmente sopra, oppure sotto se non c'è spazio)
        let top = badgeRect.top - ttHeight - 8;
        if (top < padding) {
            // Posiziona sotto
            top = badgeRect.bottom + 8;
        }

        tt.style.left = `${Math.round(left)}px`;
        tt.style.top = `${Math.round(top)}px`;
    }

    function hideTooltip() {
        if (tooltipEl) {
            tooltipEl.classList.remove('visible');
        }
    }

    // =========================================================================
    // Iniezione dei Cerchietti 'i' (info-circle) in tutti i Form-Label
    // =========================================================================
    function createInfoBadge(data) {
        const badge = document.createElement('span');
        badge.className = 'info-circle';
        badge.textContent = 'i';
        badge.tabIndex = 0;
        badge.setAttribute('role', 'button');
        badge.setAttribute('aria-label', `Informazioni su ${data.title || data.param}`);
        badge._tooltipData = data;

        badge.addEventListener('mouseenter', () => showTooltip(badge, data));
        badge.addEventListener('mouseleave', hideTooltip);
        badge.addEventListener('focus', () => showTooltip(badge, data));
        badge.addEventListener('blur', hideTooltip);

        // Supporto touch
        badge.addEventListener('touchstart', (e) => {
            e.stopPropagation();
            if (tooltipEl && tooltipEl.classList.contains('visible') && tooltipEl._activeBadge === badge) {
                hideTooltip();
            } else {
                if (tooltipEl) tooltipEl._activeBadge = badge;
                showTooltip(badge, data);
            }
        }, { passive: true });

        return badge;
    }

    function injectTooltips() {
        // 1. Elabora tutti i label con classe .form-label
        const formLabels = document.querySelectorAll('.form-label');
        formLabels.forEach(label => {
            if (label.querySelector('.info-circle')) return; // Già presente

            const forId = label.getAttribute('for');
            let inputEl = forId ? document.getElementById(forId) : null;
            if (!inputEl) {
                const group = label.closest('.form-group') || label.parentElement;
                if (group) {
                    inputEl = group.querySelector('input, select, textarea');
                }
            }

            const data = getTooltipDataForElement(inputEl, label);
            if (data) {
                const badge = createInfoBadge(data);
                label.appendChild(badge);
            }
        });

        // 2. Elabora checkbox-inline
        const checkboxLabels = document.querySelectorAll('.checkbox-inline');
        checkboxLabels.forEach(label => {
            if (label.querySelector('.info-circle')) return;

            const inputEl = label.querySelector('input[type="checkbox"]');
            const data = getTooltipDataForElement(inputEl, label);
            if (data) {
                const badge = createInfoBadge(data);
                label.appendChild(badge);
            }
        });
    }

    // Chiudi tooltip cliccando altrove su touch
    document.addEventListener('touchstart', (e) => {
        if (!e.target.closest('.info-circle') && !e.target.closest('#klifig-tooltip')) {
            hideTooltip();
        }
    });

    // Inizializzazione automatica al caricamento e su mutazioni DOM (per sezioni dinamiche)
    function initTooltips() {
        injectTooltips();

        // Osserva mutazioni DOM per iniettare i cerchietti sui controlli generati dinamicamente
        const observer = new MutationObserver(() => {
            injectTooltips();
        });

        const mainArea = document.querySelector('.app-main-area') || document.body;
        observer.observe(mainArea, {
            childList: true,
            subtree: true
        });
    }

    // Esponi globalmente
    window.KLIPPER_TOOLTIPS = KLIPPER_TOOLTIPS;
    window.initTooltips = initTooltips;
    window.refreshTooltips = injectTooltips;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTooltips);
    } else {
        initTooltips();
    }
})();
