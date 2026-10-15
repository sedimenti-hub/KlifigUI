# 📋 Riepilogo Completo Progetto: Klipper Configurator (KlifigUI)

Questo documento raccoglie in maniera dettagliata l'intera cronologia delle richieste, l'evoluzione del codice, l'architettura dei moduli e tutte le versioni implementate dall'inizio della sessione fino alla versione corrente (**v0.7.18**).

---

## 🧭 Indice dei Contenuti
1. [Obiettivo Generale del Progetto](#1-obiettivo-generale-del-progetto)
2. [Cronologia delle Versioni e Richieste Utente](#2-cronologia-delle-versioni-e-richieste-utente)
3. [Dettaglio Tecnico delle Funzionalità Realizzate](#3-dettaglio-tecnico-delle-funzionalit-realizzate)
   - [Unificazione Cinematica e Layout Schede](#31-unificazione-cinematica-e-layout-schede)
   - [Gestione Cache-Busting e Script di Aggiornamento](#32-gestione-cache-busting-e-script-di-aggiornamento)
   - [Rilevamento e Segnalazione Modifiche in Tempo Reale](#33-rilevamento-e-segnalazione-modifiche-in-tempo-reale)
   - [Modulo "Stepper Motion" e Driver Avanzati](#34-modulo-stepper-motion-e-driver-avanzati)
   - [Modulo Extruder e Sensori Temperatura Avanzati (SPI / RTD)](#35-modulo-extruder-e-sensori-temperatura-avanzati-spi--rtd)
   - [Algoritmi Controllo Temperatura: PID vs Watermark](#36-algoritmi-controllo-temperatura-pid-vs-watermark)
   - [Sezione Misceleus (Ventole Multiple, ADXL345, LED)](#37-sezione-misceleus-ventole-multiple-adxl345-led)
   - [Nuovo Tab Include & Resonance Tester](#38-nuovo-tab-include--resonance-tester)
   - [Integrazione Fedele con Mainsail: Sidebar, Temi e Palette Colori](#39-integrazione-fedele-con-mainsail-sidebar-temi-e-palette-colori)
   - [File di Localizzazione Modulari e Matrice Inglese](#310-file-di-localizzazione-modulari-e-matrice-inglese)
4. [Architettura del Repository e File Chiave](#4-architettura-del-repository-e-file-chiave)
5. [Stato Attuale e Prossimi Passi](#5-stato-attuale-e-prossimi-passi)

---

## 1. Obiettivo Generale del Progetto
**Klipper Configurator (KlifigUI)** nasce con lo scopo di fornire un'interfaccia web moderna, pulita, intuitiva e nativamente integrata con **Mainsail** e **Moonraker** per visualizzare, modificare, calibrare e validare l'intera configurazione di stampanti 3D basate su **Klipper** (\`printer.cfg\` e file inclusi).

### Punti Chiave dell'Esperienza Utente:
- **Nessuna perdita di configurazione**: backup automatici ad ogni salvataggio.
- **Supporto multi-hardware**: CoreXY, Cartesian, Delta, Rotational, IDEX (Dual Carriage), Multi-Z (Z, Z1, Z2, Z3), MCU secondari multipli (CAN Bus, toolhead board come EBB36, Raspberry Pi).
- **Controllo visivo delle modifiche**: feedback immediato prima di salvare o riavviare il firmware.
- **Coerenza visiva assoluta**: rispetto dello stile grafico, della sidebar laterale e della palette cromatica impostata dall'utente in Mainsail.

---

## 2. Cronologia delle Versioni e Richieste Utente

```mermaid
gitGraph
   commit id: "Initial" tag: "v0.2.x"
   commit id: "Accorpamento Tab Cinematica"
   commit id: "MCU Secondari Dinamici"
   commit id: "Cache-Busting & fix_update.sh" tag: "v0.3.0"
   commit id: "Evidenziazione Modifiche Real-Time" tag: "v0.4.0"
   commit id: "Stepper Motion & Driver Separati" tag: "v0.5.0"
   commit id: "Extruder Stepper Driver" tag: "v0.6.0"
   commit id: "SPI & RTD MAX31865" tag: "v0.7.0"
   commit id: "Controllo PID/Watermark" tag: "v0.7.1"
   commit id: "Misceleus, Ventole, ADXL, Include" tag: "v0.7.2"
    commit id: "Sidebar Mainsail & Sync Tema" tag: "v0.7.3"
    commit id: "Fix Sidebar & Tema Neutrale" tag: "v0.7.4"
    commit id: "Icone Esatte Mainsail v2" tag: "v0.7.5"
    commit id: "Sidebar Fedele Mainsail Reale" tag: "v0.7.6"
    commit id: "Sync Tema Realtime & Topbar Impostazioni" tag: "v0.7.7"
    commit id: "Tooltip Informativi 'i' su Ogni Valore" tag: "v0.7.8"
    commit id: "Traduzione Automatica Locale Mainsail" tag: "v0.7.9"
    commit id: "Barra Sezioni Responsive Senza Scrollbar" tag: "v0.7.10"
    commit id: "Eliminazione Linea Separazione Logo" tag: "v0.7.11"
    commit id: "Topbar Ancorata Fissa con Scroll Contenuto" tag: "v0.7.14"
    commit id: "Modalità Mobile Icon-Only Topbar & Schede" tag: "v0.7.15"
    commit id: "Selettore File .cfg Dinamico & Responsive" tag: "v0.7.16"
    commit id: "Traduzione Completa Titoli Schede & Sezioni" tag: "v0.7.17"
    commit id: "File di Localizzazione con Matrice Inglese" tag: "v0.7.18"
```

### Tabella Sintetica delle Versioni e Richieste

| Versione | Richiesta Utente Principale | Modifiche Chiave Implementate |
| :--- | :--- | :--- |
| **v0.3.0** | *"le modifiche faticano ad aggiornarsi ogni volta"* | Parametri cache-busting `?v=X` su CSS e JS; script `fix_update.sh`; configurazione `core.fileMode false` per evitare lock DIRTY in Moonraker; introdotto badge versione. |
| **v0.4.0** | *"Ogni volta che l'utente apporta modifiche prima del salvataggio, evidenzia i settaggi modificati"* | Sistema di baseline snapshot in tempo reale; highlight arancione sui campi modificati; pill contatore `X modifiche non salvate` nella barra di stato. |
| **v0.5.0** | *"Rinomina Stepper driver in Stepper Motion; aggiungi tipo connessione driver (standalone, UART, SPI); aggiungi hold_current e sense_resistor"* | Ridenominazione tab; disaccoppiamento tipo driver da tipo connessione; form condizionali per pin UART / SPI / Standalone; checkbox + campi per `hold_current` e `sense_resistor`. |
| **v0.6.0** | *"Nella sezione Extruder aggiungere i settaggi riguardante i driver come in stepper motion"* | Estensione della logica driver anche alla scheda estrusore (scelta TMC2209, Standalone/UART/SPI, resistore di sensing, corrente di stasi). |
| **v0.7.0** | *"Sensore temperatura extruder con controller SPI (es. MAX31865): inserire SPEED, BUS e RTD"* | Form dedicato per sensori PT100/PT1000 con MAX31865/MAX6675/MAX31855: pin CS, velocità bus SPI, `spi_bus` o software SPI, parametri RTD (`nominal_r`, `reference_r`, filtri). |
| **v0.7.1** | *"Elimina scritta 'modificato' (mantieni dot); aggiungi scelta controllo temperatura PID vs watermark; incrementa solo l'ultima cifra"* | Eliminata etichetta testuale mantenendo solo il segnalatore a dot; aggiunto selettore per controllo temperatura (`watermark` con `max_delta` vs `pid` con `Kp/Ki/Kd`) per estrusore e piatto riscaldato; regola di versioning rigorosa (`0.7.X`). |
| **v0.7.2** | *"Ventole aggiuntive con tipologia Klipper; pin ADXL345; sezione LED; Tab Include; resonance_tester nel box calibrazione"* | Gestione dinamica ventole (`fan`, `heater_fan`, `fan_generic`, `controller_fan`, `temperature_fan`); gestione ADXL345 su SPI; LED Neopixel/Dotstar/PWM; nuovo Tab 6 "Include" con preset veloci; accorpamento `resonance_tester` con Z-offset e input shape. |
| **v0.7.3** | *"Rendi la sezione klipper config sensibile al tema e colori di Mainsail; aggiungi la sidebar di Mainsail"* | Inserimento della barra laterale a scomparsa con link alle sezioni di Mainsail; query a Moonraker per leggere `uiSettings` e applicare colore primario e tema dark/light. |
| **v0.7.4** | *"Il tema non è uguale a Mainsail; la barra laterale è rotta e elementi non allineati"* | Riconversione colori al Dark Charcoal originale Mainsail (`#121212`, `#1e1e1e`, `#00c0f3`); correzione flexbox sidebar (icone non più tagliate quando compressa); griglie bilanciate per Cinematica e Assi XYZ; aggiunta color picker nativo e preset vendor. |
| **v0.7.5** | *"Allineamento perfetto icone e navigazione"* | Adozione delle icone SVG Material Design ufficiali di Mainsail v2 (Webcam, Controllo Movimento, Heightmap, File, Visualizzatore 3D, Cronologia, Macchina, Impostazioni, Configurator); chevron collassa/espandi. |
| **v0.7.6** | *"Rendi la sidebar di klipper config uguale a quella di mainsails recuperando stile, icone e posizionamento"* | Sidebar clonata da `TheSidebar.vue`/`SidebarItem.vue`: colore sfondo grigio `#4f4f4f` identico a Mainsail; icone MDI ufficiali (Dashboard, Webcam, Console `mdiConsoleLine`, Heightmap, File G-Code, 3D Viewer, History, Timelapse, Machine); posizionamento e visibilità dinamici recuperati da Moonraker (`/server/info`, webcams, configfile settings, `.theme/navi.json` e `gui.navigation.entries`); indicatore attivo bordo destro 4px color primario; logo Mainsail ufficiale topbar. |
| **v0.7.7** | *"Tema applicato in automatico come Mainsail in tempo reale; elimina Moonraker connesso e versione dalla navbar e spostali in Impostazioni"* | Sincronizzazione automatica tema Mainsail in tempo reale via WebSocket, polling continuo e focus window; riorganizzazione completa topbar (eliminato bottone "Moonraker Connesso" e badge versione); nuovo tasto "Impostazioni" (ex "Tema"); lo stato di connessione con led e il badge versione sono integrati direttamente nel modale Impostazioni. |
| **v0.7.8** | *"ad ogni valore inserisci un piccolo cerchietto con una i e durante l'hovering del mouse spiega cosè quel valore"* | Creato `dist/js/tooltips.js` con oltre 100 definizioni di parametri Klipper ufficiali, indicatore `i` su ogni campo/label, tooltip fluttuante anti-collisione con unità di misura e raccomandazioni. |
| **v0.7.9** | *"Fai in modo che venga rilevata la lingua usata in mainsails e traduci klipper config usando quella lingua"* | Creato `dist/js/i18n.js` con rilevamento lingua da Moonraker/Mainsail (`general.locale`), supporto completo IT, EN, DE, FR, ES con sincronizzazione real-time e selettore in Impostazioni. |
| **v0.7.10** | *"il box contenente i titoli delle sezioni dovrà avere la larghezza responsive in base ai titoli delle sezioni"* | Riprogettata la barra titoli sezioni (`.tabs-navigation`) con wrap fluido, flex dinamico proporzionale e rimozione completa di ogni barra di scorrimento orizzontale. |
| **v0.7.11** | *"elimina questa sottile linea a destra il logo"* | Rimossa la linea verticale divisoria tra il box del logo e la navbar; l'header si presenta come un blocco unificato identico a Mainsail. |
| **v0.7.14** | *"la top bar deve restare ancorata mentre il contenuto della pagina durante lo scroll deve scorrere sotto"* | Topbar convertita in `position: fixed` a tutta larghezza con coordinate dinamiche su espansione sidebar; contenuto con `padding-top` per scorrimento fluido sotto di essa. |
| **v0.7.15** | *"nella modalita mobile trasforma i tasti in icone in modo da non rendere la UI inutilizzabile e fai lo stesso con la barra dei titoli delle sezioni"* | Modalità mobile ottimizzata per smartphone (`<= 768px`): testi pulsanti topbar e titoli schede sezioni nascosti mantenendo solo le icone SVG. La navbar si riduce a un'unica riga da 48px e le 9 schede si dispongono ordinatamente su una riga da 40px senza avvolgimenti ingombranti. |
| **v0.7.16** | *"Il tasto di selezione file.cfg rendilo responsive rispetto al nome del file selezionato"* | Selettore `.cfg` con larghezza dinamica e responsive basata sul testo dell'opzione selezionata (canvas font measurement + `field-sizing: content`), limiti adattivi mobile e desktop per evitare sovrapposizioni e troncare intelligentemente con ellipsis solo quando necessario. |
| **v0.7.17** | *"il titolo delle schede all'interno delle sezioni non viene tradotto, ad esempio 'Parametri Generali Klipper' oppure 'Ventole di raffreddamento klipper' ecc"* | Aggiunti attributi `data-i18n` a tutte le 27 card-title, divisori di sezione, header di tab (Include, Macro) e finestre modali; esteso il dizionario multilingua in `i18n.js` per tutte le 5 lingue (IT, EN, DE, FR, ES) e collegati i titoli dinamici di Stepper ed Estrusore in `app.js` all'evento `klifig:languageChanged`. |
| **v0.7.18** | *"Crea un file per ogni lingua dove è possibile tradurre e modificare ogni testo di klipper config partendo da una matrice inglese"* | Creata la cartella modulare `dist/locales/` e `locales/` con 5 file (`en.json`, `it.json`, `de.json`, `fr.json`, `es.json`) e guida `locales/README.md`. `en.json` costituisce la matrice inglese con tutti i testi UI (111 chiavi), le etichette form (186 campi) e la documentazione tooltip (156 parametri). Aggiornato `i18n.js` con loader asincrono `loadLocale(lang)` e fallback offline incorporato. Collegato anche `tooltips.js` a `window.LOCALE_TOOLTIPS`. |

---

## 3. Dettaglio Tecnico delle Funzionalità Realizzate

### 3.1. Unificazione Cinematica e Layout Schede
- È stata accorpata la configurazione generale della stampante `[printer]` (velocità massima, accelerazioni massime, square corner velocity) con le geometrie cinematiche (`cartesian`, `corexy`, `delta`, `rotational_delta`, `winch`).
- Supporto nativo alle configurazioni avanzate:
  - **IDEX (Independent Dual Extruder)**: modulo per carrello `[dual_carriage]`.
  - **Multi-Asse Z**: supporto dinamico per 1, 2, 3 o 4 motori Z (`[stepper_z]`, `[stepper_z1]`, `[stepper_z2]`, `[stepper_z3]`), con adeguamento visivo delle card di calibrazione (`z_tilt` o `quad_gantry_level`).
  - **Microcontrollori secondari**: aggiunta dinamica di sezioni `[mcu nome_mcu]` con gestione seriale, CAN-bus (`canbus_uuid`) o baud rate personalizzato.

### 3.2. Gestione Cache-Busting e Script di Aggiornamento
Per risolvere il problema dei browser o di Moonraker che mantenevano versioni JavaScript/CSS obsolete:
1. **Cache-Busting String**: tutti i riferimenti negli `<script>` e `<link>` contengono `?v=X.X.X` aggiornato a ogni release.
2. **`scripts/fix_update.sh`**: script bash per Raspberry Pi / Moonraker che:
   - Configura `git config core.fileMode false` prevenendo modifiche fittizie ai permessi file.
   - Crea i collegamenti simbolici corretti per Nginx / Mainsail.
   - Permette l'aggiornamento pulito da Git senza generare conflitti `DIRTY`.

### 3.3. Rilevamento e Segnalazione Modifiche in Tempo Reale
- Al caricamento di un file `.cfg` viene scattata una fotografia istantanea (`baselineSnapshot`) di tutti i campi.
- In tempo reale, ad ogni evento `input` o `change`, il sistema confronta il valore attuale con la baseline:
  - Se modificato: il controllo riceve la classe `.is-modified` (bordo ambrato luminoso) e un piccolo indicatore (dot) a fianco.
  - Se ripristinato al valore originale: l'evidenziazione scompare automaticamente.
  - Nella top bar, la pill **Unsaved Changes** mostra dinamicamente il conteggio esatto delle impostazioni modificate (`es. "3 modifiche"`).

### 3.4. Modulo "Stepper Motion" e Driver Avanzati
- **Disaccoppiamento Chip / Protocollo**: separata la scelta del driver (TMC2209, TMC2208, TMC2240, TMC5160, TMC2130, A4988, DRV8825) dal metodo di comunicazione.
- **Tipologia di Connessione Dinamica**:
  - `Standalone`: mostra solo pin step, dir, enable e microstep hardware.
  - `UART`: mostra i form per `uart_pin`, `tx_pin` opzionale e `uart_address` (per driver multipli su singolo bus).
  - `SPI`: mostra selettore modalità SPI (Hardware Bus vs Software Bit-Banging), pin `cs_pin`, e campi per `spi_bus` oppure `spi_software_sclk_pin`, `spi_software_mosi_pin`, `spi_software_miso_pin`.
- **Parametri Elettrici Condizionali**:
  - `hold_current`: abilitabile con checkbox dedicata, con input corrente in Ampere.
  - `sense_resistor`: abilitabile con checkbox (es. 0.110 per TMC2209 standard, 0.075 per estrusori compatti, 0.022 per TMC5160 ad alto amperaggio).
- **Sensorless Homing Integrato**: soglia `driver_SGTHRS` o `driver_SGT` calcolata e guidata visivamente.

### 3.5. Modulo Extruder e Sensori Temperatura Avanzati (SPI / RTD)
- La scheda Extruder include gli stessi settaggi del motore passo-passo (corrente, microstepping, stealthchop, connessione UART/SPI).
- **Sensori Termocoppia / RTD su SPI**:
  - Selezione di sensori analogici convenzionali (`EPCOS 100K B57560G104F`, `ATC Semitec 104GT-2`, `Generic 3950`) oppure controller SPI dedicati (`MAX31865`, `MAX6675`, `MAX31855`).
  - Quando si seleziona un chip come il **MAX31865**:
    - Compaiono i parametri SPI (`spi_speed`, `spi_bus`, o pin SPI software).
    - Compaiono le impostazioni per sonde PT100/PT1000 (`rtd_nominal_r`, `rtd_reference_r`, collegamento a 2, 3 o 4 fili `rtd_num_of_wires`, filtro 50Hz/60Hz contro i disturbi di rete).

### 3.6. Algoritmi Controllo Temperatura: PID vs Watermark
Sia per l'**Estrusore** che per il **Piano Riscaldato (Heater Bed)** è disponibile la scelta dell'algoritmo di termoregolazione:
- `PID`: espone i parametri `pid_Kp`, `pid_Ki`, `pid_Kd` (con scorciatoia per autotune).
- `Watermark`: espone il parametro di isteresi `max_delta` (ideale per letti ad alta inerzia termica o riscaldatori a relè).

### 3.7. Sezione Misceleus (Ventole Multiple, ADXL345, LED)
- **Ventole Multiple**: aggiunta libera di ventole con supporto a tutte le macro e sezioni native Klipper:
  - `[fan]` (Ventola layer pezzo)
  - `[heater_fan]` (Ventola dissipatore hotend, con temperatura di attivazione)
  - `[fan_generic]` (Ventola ausiliaria controllabile da G-Code `M106`)
  - `[controller_fan]` (Ventola raffreddamento driver/scheda madre)
  - `[temperature_fan]` (Ventola termocontrollata con sensore associato)
- **Accelerometro ADXL345**:
  - Assegnazione pin CS, scelta bus SPI hardware o bit-banging software.
  - Selezione orientamento assi `axes_map` (es. `x,y,z`, `-x,z,y`, ecc.).
  - Frequenza di campionamento `rate` (da 1600Hz a 3200Hz).
- **LED & Illuminazione**:
  - Supporto per stringhe Neopixel (WS2812B), DotStar o pin PWM semplici.
  - Conteggio LED, pin dati, colori iniziali (Rosso, Verde, Blu, Bianco).

### 3.8. Nuovo Tab Include & Resonance Tester
- **Tab Include (File Esterni)**:
  - Permette di aggiungere e rimuovere righe `[include nome_file.cfg]`.
  - Include pulsanti rapidi con preset per configurazioni modulari popolari: `macros.cfg`, `steppers.cfg`, `fans.cfg`, `canbus.cfg`, `ebb36.cfg`, `sensorless.cfg`.
- **Unificazione Calibrazione**:
  - Il modulo `[resonance_tester]` (con scelta chip accelerometro, frequenze di sweep e punti di tastatura sul piano `probe_points`) è stato accorpato direttamente nel box di calibrazione con `[input_shaper]` e `probe:z_offset`.

### 3.9. Integrazione Fedele con Mainsail: Sidebar, Temi e Palette Colori
- **Sidebar Laterale Ufficiale**:
  - Larghezza standard Mainsail (56px collassata, espandibile a 240px tramite pulsante dedicato).
  - Voci e icone Material Design SVG identiche a Mainsail: *Dashboard, Webcam, Controllo/Movimento, Mappa Altezza, File G-Code, Visualizzatore 3D, Cronologia, Klipper Configurator (attivo), Macchina, Impostazioni*.
  - Tutte le voci puntano direttamente alle rispettive pagine di Mainsail (`/#/`, `/#/cam`, `/#/control`, `/#/heightmap`, `/#/files`, `/#/viewer`, `/#/history`, `/#/machine`, `/#/settings`).
  - Risolto il difetto di rendering: i label nascosti hanno `display: none !important`, mantenendo le icone perfettamente centrate nei loro box 56x46px.
- **Sincronizzazione Dinamica Tema da Moonraker**:
  - Interroga Moonraker via endpoint `/server/database/item?namespace=mainsail`.
  - Legge `uiSettings.primaryColor` o traduce i preset vendor ufficiali (`mainsail: #00c0f3`, `voron: #d32f2f`, `vzbot: #00e5ff`, `ratrig: #00ff41`, `klipper: #f97316`, `purple: #9333ea`, `blue: #0284c7`, `emerald: #10b981`).
  - Rileva e carica automaticamente loghi personalizzati (`.theme/sidebar-logo.svg` o `.png`) e stili custom (`.theme/custom.css`).
  - Pulsante rapido **"Tema"** nella barra superiore con indicatore del colore attivo e apertura di un color picker interattivo HTML5.

---

## 4. Architettura del Repository e File Chiave

```
KlipperUI / KlifigUI/
├── dist/
│   ├── index.html              # Markup principale con le 8 macro-schede e la sidebar Mainsail
│   ├── css/
│   │   └── style.css           # Variabili di tema Mainsail (#121212, #1e1e1e), layout griglie e sidebar
│   └── js/
│       ├── klipper-parser.js   # Parser e generatore bidirezionale formato INI Klipper
│       ├── default-config.js   # Valori di fallback e template di riferimento
│       ├── moonraker-client.js # Client HTTP/WebSocket per API Moonraker e DB Mainsail
│       ├── i18n.js             # Modulo internazionalizzazione e sincronizzazione lingua Mainsail
│       ├── tooltips.js         # Modulo documentazione parametri, badge 'i' e tooltip fluttuante
│       └── app.js              # Controller applicativo, reattività DOM e sincronizzazione
├── scripts/
│   ├── install.sh              # Script di installazione automatica
│   └── fix_update.sh           # Script di correzione aggiornamenti e permessi Moonraker
└── README.md                   # Documentazione di progetto
```

---

## 5. Stato Attuale e Prossimi Passi

### Risultati Conseguiti:
- ✅ **Versione corrente**: `v0.7.17`.
- ✅ **Traduzione Completa e Dinamica di Tutti i Titoli delle Schede (Card) e Sezioni**:
  - Risolta la mancata traduzione dei titoli interni ai box di configurazione: tutti i 27 elementi `.card-title`, i titoli delle sezioni interne (es. *Limiti Assi & Configurazione Homing*), gli header di tab (Include e Macro) e i titoli dei modali (Anteprima, Calcolatore, Impostazioni) sono stati equipaggiati con attributi semantici `data-i18n`.
  - Esteso il vocabolario di localizzazione in `i18n.js` per tutte le 5 lingue supportate (Italiano, English, Deutsch, Français, Español), traducendo puntualmente voci come *Parametri Generali Klipper*, *Ventole di Raffreddamento Klipper*, *Monitoraggio Termico*, *Accelerometro Risonanze*, *Allineamento Z-Tilt/QGL*, ecc.
  - Sincronizzati i titoli dinamici di Stepper (es. *Configurazione Motore Asse X/Y/Z/Dual Carriage*) ed Estrusore in `app.js` mediante helper localizzato `t()` e listener all'evento globale `klifig:languageChanged`, garantendo che l'interfaccia si aggiorni istantaneamente al cambio lingua in Mainsail o nel popup Impostazioni senza ricaricare la pagina.
- ✅ **Tasto / Menu di Selezione File .cfg Dinamico e Responsive rispetto al Nome del File**:
  - Risolto il problema del dimensionamento del menu a tendina (`#select-config-file`): nei browser standard un elemento `<select>` si espande alla larghezza dell'opzione più lunga dell'intero elenco (lasciando ampi spazi vuoti quando è selezionato un file dal nome breve), oppure veniva forzato a valori rigidi su schermi piccoli (`max-width: 86px`).
  - Implementato un calcolo dinamico della larghezza del testo tramite `CanvasRenderingContext2D.measureText()` combinato alla proprietà standard moderna CSS `field-sizing: content`:
    - All'avvio, al caricamento dei file da Moonraker, ad ogni cambio opzione (`change`, `input`) o ridimensionamento della finestra (`resize`), la larghezza del tasto si adatta istantaneamente ai pixel effettivi del nome del file selezionato (es. `printer.cfg`, `ebb36.cfg`, `macros.cfg`, `stepper_drivers.cfg`) sommando il corretto padding e lo spazio per l'icona chevron SVG.
    - Su desktop (`> 900px`): il selettore parte da un minimo di 85px ed è libero di espandersi fino a 320px in base al nome del file selezionato.
    - Su smartphone e mobile (`<= 900px`): larghezza calibrata (`clamp(80px, 36vw, 160px)`) che asseconda il file selezionato senza mai comprimere né mandare a capo i pulsanti azione della topbar.
    - Applicato `text-overflow: ellipsis` con tooltip contestuale dinamico (`title="File di configurazione attivo: ..."`) per preservare la leggibilità in caso di nomi di file particolarmente lunghi.
- ✅ **Modalità Mobile con Tasti Topbar e Titoli Sezioni Trasformati in Sole Icone**:
  - Riprogettata l'esperienza per dispositivi mobili e smartphone (`@media (max-width: 768px)`):
    - I pulsanti della topbar (`#btn-settings`, `#btn-reload`, `#btn-preview`, `#btn-download`, `#btn-save`, `#btn-save-restart`) nascondono i testi (`.btn-text { display: none !important; }`), mostrando unicamente le rispettive icone SVG in una riga singola da 48px ad altezza fissa senza wrapping forzato.
    - I 9 pulsanti delle macro-schede (`.tabs-navigation .tab-btn`) nascondono le etichette testuali (`.tab-text { display: none !important; }`) e si comprimono armonicamente su un'unica riga orizzontale (`flex: 1 1 0; min-width: 30px; height: 36px; padding: 0.45rem 0.15rem;`).
    - L'ingombro verticale totale della testata su mobile passa da oltre 330px (con sovrapposizione e oscuramento delle schede sottostanti) a soli 88px totali (48px topbar + 40px sezioni), lasciando l'intero schermo disponibile per la visualizzazione e modifica dei parametri di stampa.
    - Integrati attributi `title` e tooltip contestuali per ciascun pulsante e scheda per garantire la massima accessibilità e chiarezza anche in assenza di testo visivo.
    - Il modulo `i18n.js` è stato sincronizzato per preservare la struttura a span dei testi e aggiornare contestualmente i tooltip `title` multilingua in tempo reale.
- ✅ **Top Bar Ancorata & Fissa con Scorrimento del Contenuto al di Sotto**:
  - Convertita la barra superiore (`.navbar`) in posizionamento fisso continuo (`position: fixed; top: 0; left: var(--sidebar-width-collapsed); right: 0; height: var(--topbar-height); z-index: 100;`).
  - Sincronizzata la transizione laterale con l'espansione/compressione della sidebar (`.mainsail-sidebar.expanded ~ .app-main-area .navbar { left: var(--sidebar-width-expanded); }`).
  - Aggiunto `padding-top: var(--topbar-height);` all'area dei contenuti (`.app-main-area`): durante lo scorrimento verticale, tutti i moduli, schede e campi di configurazione scorrono in modo fluido e naturale scomparendo al di sotto della top bar, mentre l'intera testata (logo + pulsanti topbar) rimane saldamente ancorata e immobile.
  - Su dispositivi mobili (`@media (max-width: 768px)`), la topbar copre l'intera larghezza da bordo a bordo (`left: 0 !important`).
- ✅ **Eliminazione Linea Verticale a Destra del Logo nella Topbar**:
  - Rimossa la linea divisoria verticale tra l'icona/box del logo (`.sidebar-header`) e la barra superiore (`.navbar`), convertendo `border-right: none` sul contenitore del logo e sulla sidebar principale a livello testata.
  - Applicato `border-right: 1px solid var(--sidebar-border)` esclusivamente al di sotto della barra superiore (su `.sidebar-nav` e `.sidebar-append`).
  - La topbar (comprendente logo e controlli di navigazione) si presenta ora come una superficie orizzontale continua, pulita e priva di interruzioni grafiche verticali, perfettamente identica all'header di Mainsail.
- ✅ **Barra dei Titoli delle Sezioni Pienamente Responsive & Eliminazione Totale Scrollbar**:
  - Eliminata categoricamente ogni barra di scorrimento orizzontale (`overflow: hidden`, `::-webkit-scrollbar { display: none }`) dalla barra di navigazione delle sezioni (`.tabs-navigation`) e dai sotto-tab (`.subtabs`).
  - Implementato layout flessibile responsivo avanzato con `flex-wrap: wrap; align-items: center; gap: 0.35rem;` e distribuzione proporzionale delle schede con `flex: 1 1 auto; min-width: fit-content;`.
  - Calibrati padding (`0.45rem 0.7rem`), dimensione icone SVG (`16px`) e dimensione testo (`0.835rem`) con media query dedicate a 1200px e 768px: tutti i 9 pulsanti di sezione si adattano fluidamente alla larghezza dello schermo senza eccedere, e su finestre più strette o display compatti avvolgono ordinatamente su righe successive senza mai tagliare testi né generare barre di scorrimento.
- ✅ **Sidebar Ancorata & Fissa durante lo Scroll**:
  - Convertita la sidebar da `position: sticky` a `position: fixed; top: 0; left: 0; bottom: 0; height: 100vh;` con z-index dedicato (200) e layout coordinato su `.app-main-area` (`margin-left: var(--sidebar-width-collapsed)` e `var(--sidebar-width-expanded)` con transizione fluida).
  - Durante lo scorrimento verticale della pagina e dei lunghi moduli di configurazione, la sidebar Mainsail rimane perfettamente ancorata e ferma sul lato sinistro, esattamente come nell'interfaccia nativa di Mainsail.
  - La lista delle voci di navigazione interne alla sidebar supporta lo scorrimento indipendente (`overflow-y: auto`) in caso di schermi a bassa risoluzione verticale, mantenendo intestazione/logo e pulsante about fissati ai vertici.
  - Su dispositivi mobili (`@media (max-width: 768px)`), il layout si converte automaticamente in barra inferiore con azzeramento del margine.
- ✅ **Rilevamento Lingua Mainsail & Traduzione Automatica dell'Interfaccia**:
  - Implementato il modulo dedicato [`dist/js/i18n.js`](file:///d:/Antigravity/KlifigUI/dist/js/i18n.js) che interroga Moonraker (`/server/database/item?namespace=mainsail`) e rileva automaticamente la lingua configurata dall'utente in Mainsail (`general.locale`, `general.language` o `uiSettings.locale`).
  - Traduzione istantanea e completa di tutti gli elementi grafici dell'applicazione: pulsanti topbar (Impostazioni, Ricarica, Anteprima, Scarica, Salva, Salva & Riavvia), etichette delle 9 schede principali, titoli e tag delle card, oltre 160 form-label e checkbox, opzioni dei menu a tendina, modali e messaggi toast.
  - Sincronizzazione in tempo reale: al cambio lingua su Mainsail, l'interfaccia si aggiorna istantaneamente senza dover ricaricare la pagina (via WebSocket Moonraker `notify_database_update`, polling periodico e listener di focus).
  - Aggiunto selettore lingua dedicato nel modale **Impostazioni** con modalità **"Automatica (Sincronizza con Mainsail)"** predefinita e possibilità di override manuale (Italiano, English, Deutsch, Français, Español).
  - Integrazione con i tooltip informativi multilingua in [`dist/js/tooltips.js`](file:///d:/Antigravity/KlifigUI/dist/js/tooltips.js).
- ✅ **Badge Informativo "i" e Tooltip Contestuali su Ogni Valore**:
  - Inserito un piccolo cerchietto con una "i" (`.info-circle`) accanto a ogni parametro, campo input, selettore e checkbox dell'applicazione.
  - Al passaggio del mouse (hover) viene visualizzato un tooltip fluttuante ricco (`#klifig-tooltip`) con posizionamento automatico intelligente sopra o sotto l'elemento e rilevamento dei bordi dello schermo (anti-collisione).
  - Ciascun tooltip mostra il nome esatto della direttiva Klipper (es. `[printer] max_velocity`, `rotation_distance`, `hold_current`, `sensor_type`), l'unità di misura (mm, mm/s, mm/s², Ampere, °C, Ω), la spiegazione chiara e completa del suo funzionamento e consigli sui valori tipici raccomandati.
  - Creato il modulo dedicato [`dist/js/tooltips.js`](file:///d:/Antigravity/KlifigUI/dist/js/tooltips.js) con dizionario esteso di parametri Klipper e iniezione dinamica automatica tramite `MutationObserver` per coprire anche schede e controlli aggiunti a runtime (ventole dinamiche, macro, include, motori multi-asse Z).
  - Pieno supporto touch per dispositivi mobili con apertura/chiusura al tocco.
- ✅ **Fix Apertura Popup Impostazioni & Layout Topbar Sinistra**:
  - Risolta la mancata apertura del modal impostazioni causata da un'uscita prematura in `initSidebar()` (dovuta a un selettore obsoleto della vecchia sidebar) e unificati i gestori di eventi per `#btn-settings`.
  - Spostato il pulsante **"Impostazioni"** all'estrema sinistra della barra di navigazione (`.nav-left`), garantendo un accesso immediato a configurazione connessione e tema.
  - Rimossi il logo "K" e la scritta testuale "Klipper Configurator" dalla barra superiore per un'interfaccia più pulita e coerente con la dashboard Mainsail.
- ✅ **Sincronizzazione Automatica Tema in Tempo Reale**:
  - Il tema e i colori di Klipper Configurator si sincronizzano automaticamente con Mainsail. Se l'utente cambia tema, colore primario o modalità (chiaro/scuro) su Mainsail, le modifiche si riflettono istantaneamente su KlifigUI via WebSocket Moonraker, polling ogni 10s e listener di focus sulla finestra.
  - Supportati tutti i temi e preset vendor di Mainsail (`mainsail: #2196f3`, `klipper: #f97316`, `voron: #d32f2f`, `vzbot: #00e5ff`, `ratrig: #00ff41`, `ldo`, `yumi`, `prusa`, `btt`, `multec`, ecc.).
- ✅ **Top Bar Riorganizzata & Sezione Impostazioni**:
  - Eliminato il pulsante pill "Moonraker connesso" dalla barra superiore.
  - Eliminato il tag/badge della versione dalla testata della barra superiore.
  - Rinominato il tasto "Tema" in **"Impostazioni"** con icona ingranaggio e dot cromatico attivo.
  - Lo stato di connessione a Moonraker (con led verde/rosso) e il badge della versione (`v0.7.14`) sono ora comodamente consultabili all'interno del modale **Impostazioni**.
- ✅ **Sidebar Mainsail Fedele al 100%**:
  - Colore di sfondo grigio `#4f4f4f` (`--sidebar-bg-color`) estratto direttamente dal tema attivo di Mainsail.
  - Voci e icone Material Design ufficiali (@mdi/js) allineate all'architettura Vue/Vuetify di Mainsail (`TheSidebar.vue`, `SidebarItem.vue`, `src/routes/index.ts`).
  - Posizioni e ordine esatti (Dashboard 10, Webcam 20, Console 30, Heightmap 40, G-Code Files 50, G-Code Viewer 60, History 70, Timelapse 80, Machine 90, più link personalizzati da `.theme/navi.json`).
  - Dinamicità Moonraker: interroga `/server/info` per stato Klippy e componenti, `/server/webcams/list` per webcam registrate, `/printer/objects/query?configfile=settings` per verificare la presenza di `bed_mesh`, e `navigation.entries` dal database Moonraker per rispettare l'ordine e la visibilità scelti dall'utente nelle impostazioni di Mainsail.
  - Indicatore pagina attiva fedele: `border-right: 4px solid var(--primary)` e sfondo overlay semitrasparente.
  - Tooltip laterale a destra (`v-tooltip right`) con ritardo di 500ms e icona info (`AboutDialog`) in fondo alla sidebar.
  - Logo Mainsail ufficiale in SVG (`MainsailLogo.vue`) nella testata della barra.
- ✅ **Cinematica e Assi**: schede riorganizzate con griglie simmetriche per asse X, Y e Z.
- ✅ **Connessioni Driver & Sensori**: supporto completo per UART, SPI hardware/software, RTD MAX31865, ventole multiple, LED e ADXL345.
- ✅ **Feedback visivo**: evidenziazione modifiche non salvate in tempo reale con dot discreto.

### 3.10. File di Localizzazione Modulari e Matrice Inglese
- **Architettura Dedicata per Ogni Lingua**:
  - Creata la directory modulare [`dist/locales/`](file:///d:/Antigravity/KlifigUI/dist/locales/) (servita da Nginx a runtime) specchiata nella directory di configurazione [`locales/`](file:///d:/Antigravity/KlifigUI/locales/) con 5 file JSON completi:
    - [`en.json`](file:///d:/Antigravity/KlifigUI/dist/locales/en.json): **Matrice Inglese Master**, che funge da modello di riferimento standard per tutti i testi di Klipper Configurator.
    - [`it.json`](file:///d:/Antigravity/KlifigUI/dist/locales/it.json): Traduzione italiana integrale.
    - [`de.json`](file:///d:/Antigravity/KlifigUI/dist/locales/de.json): Traduzione tedesca integrale.
    - [`fr.json`](file:///d:/Antigravity/KlifigUI/dist/locales/fr.json): Traduzione francese integrale.
    - [`es.json`](file:///d:/Antigravity/KlifigUI/dist/locales/es.json): Traduzione spagnola integrale.
- **Struttura dei File JSON**:
  - `_meta`: codice lingua ISO, nome localizzato, bandiera emoji e descrizione.
  - `ui`: 111 chiavi che coprono ogni pulsante topbar, scheda di navigazione, titolo di card/sezione, divisore, finestra modale, prompt e notifica toast.
  - `labels`: 186 campi di form e checkbox identificati univocamente per ID elemento (es. `printer-kinematics`, `stepper-step-pin`, `extruder-nozzle-dia`).
  - `tooltips`: 156 voci di documentazione tecnica parametri Klipper (titolo, spiegazione estesa `desc`, suggerimenti pratici `tip`, unità di misura `unit`).
- **Caricatore Dinamico Asincrono & Tolleranza ai Guasti**:
  - [`dist/js/i18n.js`](file:///d:/Antigravity/KlifigUI/dist/js/i18n.js) implementa `loadLocale(lang)` che effettua il `fetch` asincrono con parametro di cache-busting `?v=0.7.18`.
  - In caso di assenza di rete o esecuzione su protocollo `file://` (dove le restrizioni CORS bloccano `fetch`), l'applicazione esegue un fallback trasparente sui dizionari incorporati in `i18n.js`, prevenendo qualsiasi errore a runtime.
  - [`dist/js/tooltips.js`](file:///d:/Antigravity/KlifigUI/dist/js/tooltips.js) è sincronizzato con `window.LOCALE_TOOLTIPS`, visualizzando istantaneamente i tooltip nella lingua attiva e garantendo fallback automatico su matrice inglese e dizionario Klipper nativo.
- **Guida per Traduttori & Sviluppatori**:
  - Creato [`locales/README.md`](file:///d:/Antigravity/KlifigUI/locales/README.md) che documenta la struttura dei file, come modificare qualsiasi stringa dell'interfaccia e come aggiungere nuove lingue semplicemente duplicando la matrice `en.json`.

### Note di Sviluppo & Utilizzo:
- Nel caso in cui il push automatico da console verso GitHub incontri il blocco credenziali non interattivo di Windows, è sufficiente eseguire dal terminale locale dell'utente:
  ```powershell
  cd d:\Antigravity\KlifigUI
  git push origin main
  ```
  Tutti i commit fino a `v0.7.18` sono generati e validati localmente.
