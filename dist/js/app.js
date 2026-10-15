/**
 * Klipper Configurator - Main Application Controller
 * Gestisce l'interfaccia utente unificata (Cinematica + Stampante), supporto IDEX,
 * Multi-Asse Z (Z1, Z2, Z3), parametri di homing estesi e sincronizzazione con Moonraker.
 */

document.addEventListener('DOMContentLoaded', () => {
    const APP_VERSION = 'v0.7.13';

    // -------------------------------------------------------------------------
    // Stato Applicazione
    // -------------------------------------------------------------------------
    const state = {
        version: APP_VERSION,
        parser: new KlipperConfigParser(),
        moonraker: new MoonrakerClient(localStorage.getItem('moonraker_url') || ''),
        currentConfigFile: 'printer.cfg',
        currentStepper: 'stepper_x',
        currentExtruder: 'extruder',
        extraMcus: [],
        extraFans: [],
        includes: [],
        leds: [],
        macros: [],
        baselineSnapshot: null
    };

    // -------------------------------------------------------------------------
    // Elementi DOM Principali
    // -------------------------------------------------------------------------
    const dom = {
        // Status & Navbar
        appVersionBadge: document.getElementById('app-version-badge'),
        unsavedChangesPill: document.getElementById('unsaved-changes-pill'),
        unsavedChangesText: document.getElementById('unsaved-changes-text'),
        statusDot: document.getElementById('status-dot'),
        statusText: document.getElementById('status-text'),
        btnConnSettings: document.getElementById('btn-conn-settings') || document.getElementById('btn-settings'),
        btnSettings: document.getElementById('btn-settings') || document.getElementById('btn-conn-settings'),
        selectConfigFile: document.getElementById('select-config-file'),
        btnReload: document.getElementById('btn-reload'),
        btnPreview: document.getElementById('btn-preview'),
        btnDownload: document.getElementById('btn-download'),
        btnSave: document.getElementById('btn-save'),
        btnSaveRestart: document.getElementById('btn-save-restart'),
        
        // Tabs
        tabButtons: document.querySelectorAll('.tab-btn'),
        tabPanes: document.querySelectorAll('.tab-pane'),

        // Cinematica & Architettura
        printerKinematics: document.getElementById('printer-kinematics'),
        cardDeltaParams: document.getElementById('card-delta-params'),
        checkEnableIdex: document.getElementById('check-enable-idex'),
        selectZMotorCount: document.getElementById('select-z-motor-count'),
        cardDualCarriage: document.getElementById('card-dual-carriage'),

        // Host / MCU Secondari
        btnAddMcu: document.getElementById('btn-add-mcu'),
        extraMcuListContainer: document.getElementById('extra-mcu-list-container'),

        // Stepper Subtabs
        subtabButtons: document.querySelectorAll('#stepper-subtabs-container .subtab-btn'),
        btnSubtabDualCarriage: document.getElementById('btn-subtab-dual-carriage'),
        btnSubtabZ1: document.getElementById('btn-subtab-z1'),
        btnSubtabZ2: document.getElementById('btn-subtab-z2'),
        btnSubtabZ3: document.getElementById('btn-subtab-z3'),
        stepperCardTitle: document.getElementById('stepper-card-title'),
        stepperCardTag: document.getElementById('stepper-card-tag'),
        driverCardTitle: document.getElementById('driver-card-title'),
        driverCardTag: document.getElementById('driver-card-tag'),
        groupStepperEndstop: document.getElementById('group-stepper-endstop'),
        noticeAuxZ: document.getElementById('notice-aux-z'),
        groupSensorlessHoming: document.getElementById('group-sensorless-homing'),
        driverModelSelect: document.getElementById('driver-model-select'),
        driverConnTypeSelect: document.getElementById('driver-conn-type-select'),
        driverConnStandaloneFields: document.getElementById('driver-conn-standalone-fields'),
        driverConnUartFields: document.getElementById('driver-conn-uart-fields'),
        driverConnSpiFields: document.getElementById('driver-conn-spi-fields'),
        driverUartPin: document.getElementById('driver-uart-pin'),
        driverTxPin: document.getElementById('driver-tx-pin'),
        driverUartAddress: document.getElementById('driver-uart-address'),
        driverCsPin: document.getElementById('driver-cs-pin'),
        driverSpiMode: document.getElementById('driver-spi-mode'),
        driverSpiBusGroup: document.getElementById('driver-spi-bus-group'),
        driverSpiBus: document.getElementById('driver-spi-bus'),
        driverSpiSoftGroup: document.getElementById('driver-spi-soft-group'),
        driverSpiSclk: document.getElementById('driver-spi-sclk'),
        driverSpiMosi: document.getElementById('driver-spi-mosi'),
        driverSpiMiso: document.getElementById('driver-spi-miso'),
        checkEnableHoldCurrent: document.getElementById('check-enable-hold-current'),
        groupHoldCurrentField: document.getElementById('group-hold-current-field'),
        driverHoldCurrent: document.getElementById('driver-hold-current'),
        checkEnableSenseResistor: document.getElementById('check-enable-sense-resistor'),
        groupSenseResistorField: document.getElementById('group-sense-resistor-field'),
        driverSenseResistor: document.getElementById('driver-sense-resistor'),
        driverSmartFields: document.getElementById('driver-smart-fields'),
        driverSensorlessEnable: document.getElementById('driver-sensorless-enable'),
        sensorlessDetails: document.getElementById('sensorless-details'),

        // Extruder Subtabs (IDEX)
        extruderSubtabs: document.querySelectorAll('#extruder-subtabs-container .subtab-btn'),
        btnSubtabExtruder1: document.getElementById('btn-subtab-extruder1'),
        extruderCardTitle: document.getElementById('extruder-card-title'),
        extruderCardTag: document.getElementById('extruder-card-tag'),
        extruderDriverCardTitle: document.getElementById('extruder-driver-card-title'),
        extruderDriverCardTag: document.getElementById('extruder-driver-card-tag'),
        extruderDriverModelSelect: document.getElementById('extruder-driver-model-select'),
        extruderDriverConnTypeSelect: document.getElementById('extruder-driver-conn-type-select'),
        extruderDriverConnStandaloneFields: document.getElementById('extruder-driver-conn-standalone-fields'),
        extruderDriverConnUartFields: document.getElementById('extruder-driver-conn-uart-fields'),
        extruderDriverConnSpiFields: document.getElementById('extruder-driver-conn-spi-fields'),
        extruderDriverUartPin: document.getElementById('extruder-driver-uart-pin'),
        extruderDriverTxPin: document.getElementById('extruder-driver-tx-pin'),
        extruderDriverUartAddress: document.getElementById('extruder-driver-uart-address'),
        extruderDriverCsPin: document.getElementById('extruder-driver-cs-pin'),
        extruderDriverSpiMode: document.getElementById('extruder-driver-spi-mode'),
        extruderDriverSpiBusGroup: document.getElementById('extruder-driver-spi-bus-group'),
        extruderDriverSpiBus: document.getElementById('extruder-driver-spi-bus'),
        extruderDriverSpiSoftGroup: document.getElementById('extruder-driver-spi-soft-group'),
        extruderDriverSpiSclk: document.getElementById('extruder-driver-spi-sclk'),
        extruderDriverSpiMosi: document.getElementById('extruder-driver-spi-mosi'),
        extruderDriverSpiMiso: document.getElementById('extruder-driver-spi-miso'),
        extruderDriverSmartFields: document.getElementById('extruder-driver-smart-fields'),
        extruderDriverRunCurrent: document.getElementById('extruder-driver-run-current'),
        extruderDriverStealthchop: document.getElementById('extruder-driver-stealthchop'),
        extruderCheckEnableHoldCurrent: document.getElementById('extruder-check-enable-hold-current'),
        extruderGroupHoldCurrentField: document.getElementById('extruder-group-hold-current-field'),
        extruderDriverHoldCurrent: document.getElementById('extruder-driver-hold-current'),
        extruderCheckEnableSenseResistor: document.getElementById('extruder-check-enable-sense-resistor'),
        extruderGroupSenseResistorField: document.getElementById('extruder-group-sense-resistor-field'),
        extruderDriverSenseResistor: document.getElementById('extruder-driver-sense-resistor'),
        extruderDriverInterpolate: document.getElementById('extruder-driver-interpolate'),

        // Extruder Sensor SPI / RTD
        extruderSensorType: document.getElementById('extruder-sensor-type'),
        extruderSensorPinLabel: document.getElementById('label-extruder-sensor-pin'),
        extruderSensorSpiContainer: document.getElementById('extruder-sensor-spi-container'),
        extruderSensorSpiMode: document.getElementById('extruder-sensor-spi-mode'),
        extruderSensorSpiBusGroup: document.getElementById('extruder-sensor-spi-bus-group'),
        extruderSensorSpiBus: document.getElementById('extruder-sensor-spi-bus'),
        extruderSensorSpiSpeed: document.getElementById('extruder-sensor-spi-speed'),
        extruderSensorSpiSoftGroup: document.getElementById('extruder-sensor-spi-soft-group'),
        extruderSensorSpiSclk: document.getElementById('extruder-sensor-spi-sclk'),
        extruderSensorSpiMosi: document.getElementById('extruder-sensor-spi-mosi'),
        extruderSensorSpiMiso: document.getElementById('extruder-sensor-spi-miso'),
        extruderSensorRtdFields: document.getElementById('extruder-sensor-rtd-fields'),
        extruderRtdNominalR: document.getElementById('extruder-rtd-nominal-r'),
        extruderRtdReferenceR: document.getElementById('extruder-rtd-reference-r'),
        extruderRtdNumWires: document.getElementById('extruder-rtd-num-wires'),
        extruderRtdFilter: document.getElementById('extruder-rtd-filter'),

        // Controllo Temperatura (Extruder & Bed)
        extruderControlType: document.getElementById('extruder-control-type'),
        extruderPidFields: document.getElementById('extruder-pid-fields'),
        extruderWatermarkFields: document.getElementById('extruder-watermark-fields'),
        extruderMaxDelta: document.getElementById('extruder-max-delta'),
        bedControlType: document.getElementById('bed-control-type'),
        bedPidFields: document.getElementById('bed-pid-fields'),
        bedWatermarkFields: document.getElementById('bed-watermark-fields'),
        bedMaxDelta: document.getElementById('bed-max-delta'),

        // Misceleus Extra Fans
        btnAddFan: document.getElementById('btn-add-fan'),
        extraFanListContainer: document.getElementById('extra-fan-list-container'),

        // Misceleus ADXL345
        checkEnableAdxl: document.getElementById('check-enable-adxl'),
        adxl345Fields: document.getElementById('adxl345-fields'),
        adxlCsPin: document.getElementById('adxl-cs-pin'),
        adxlSpiMode: document.getElementById('adxl-spi-mode'),
        adxlSpiBusGroup: document.getElementById('adxl-spi-bus-group'),
        adxlSpiBus: document.getElementById('adxl-spi-bus'),
        adxlSpiSoftGroup: document.getElementById('adxl-spi-soft-group'),
        adxlSpiSclk: document.getElementById('adxl-spi-sclk'),
        adxlSpiMosi: document.getElementById('adxl-spi-mosi'),
        adxlSpiMiso: document.getElementById('adxl-spi-miso'),
        adxlAxesMap: document.getElementById('adxl-axes-map'),
        adxlRate: document.getElementById('adxl-rate'),

        // Misceleus LED
        btnAddLed: document.getElementById('btn-add-led'),
        ledListContainer: document.getElementById('led-list-container'),

        // Tab Include
        btnAddInclude: document.getElementById('btn-add-include'),
        includeListContainer: document.getElementById('include-list-container'),
        presetIncludeButtons: document.querySelectorAll('.preset-include-btn'),

        // Calibration Resonance Tester & Z-Offset
        checkEnableResonanceTester: document.getElementById('check-enable-resonance-tester'),
        resonanceTesterFields: document.getElementById('resonance-tester-fields'),
        resAccelChip: document.getElementById('res-accel-chip'),
        resProbePoints: document.getElementById('res-probe-points'),
        resAccelPerHz: document.getElementById('res-accel-per-hz'),
        resMaxSmoothing: document.getElementById('res-max-smoothing'),
        calibrationZOffset: document.getElementById('calibration-z-offset'),
        probeZOffset: document.getElementById('probe-z-offset'),
        
        // Calibration Multi-Z Cards
        cardZTilt: document.getElementById('card-z-tilt'),
        cardQuadGantry: document.getElementById('card-quad-gantry'),

        // Macro Container
        macroListContainer: document.getElementById('macro-list-container'),
        btnAddMacro: document.getElementById('btn-add-macro'),
        btnInsertMacroTemplate: document.getElementById('btn-insert-macro-template'),

        // Modals
        modalPreview: document.getElementById('modal-preview'),
        previewCodeBlock: document.getElementById('preview-code-block'),
        btnClosePreview: document.getElementById('btn-close-preview'),
        btnCopyPreview: document.getElementById('btn-copy-preview'),
        btnModalSave: document.getElementById('btn-modal-save'),

        modalConn: document.getElementById('modal-conn'),
        inputMoonrakerUrl: document.getElementById('input-moonraker-url'),
        btnCloseConn: document.getElementById('btn-close-conn'),
        btnCancelConn: document.getElementById('btn-cancel-conn'),
        btnSaveConn: document.getElementById('btn-save-conn'),

        modalCalc: document.getElementById('modal-calc'),
        btnCalcRotDist: document.getElementById('btn-calc-rot-dist'),
        btnCloseCalc: document.getElementById('btn-close-calc'),
        btnCancelCalc: document.getElementById('btn-cancel-calc'),
        btnApplyCalc: document.getElementById('btn-apply-calc'),
        calcDriveType: document.getElementById('calc-drive-type'),
        calcBeltFields: document.getElementById('calc-belt-fields'),
        calcLeadFields: document.getElementById('calc-lead-fields'),
        calcPulleyTeeth: document.getElementById('calc-pulley-teeth'),
        calcLeadscrewPitch: document.getElementById('calc-leadscrew-pitch'),
        calcResultVal: document.getElementById('calc-result-val'),

        // Toast
        toastContainer: document.getElementById('toast-container'),

        // Sidebar Mainsail & Sincronizzazione Tema
        sidebar: document.getElementById('mainsail-sidebar'),
        btnToggleSidebar: document.getElementById('btn-toggle-sidebar'),
        sidebarToggleLabel: document.getElementById('sidebar-toggle-label'),
        sidebarLogoLink: document.getElementById('sidebar-logo-link'),
        sidebarCustomLogoImg: document.getElementById('sidebar-custom-logo-img'),
        sidebarDefaultLogoSvg: document.getElementById('sidebar-default-logo-svg'),
        sidebarBrandTitle: document.getElementById('sidebar-brand-title'),
        themeSyncStatus: document.getElementById('theme-sync-status'),
        activeThemeColorDot: document.getElementById('active-theme-color-dot'),
        activeThemeColorHex: document.getElementById('active-theme-color-hex'),
        activeThemeModeText: document.getElementById('active-theme-mode-text'),
        checkForceLightMode: document.getElementById('check-force-light-mode'),
        presetColorBtns: document.querySelectorAll('.preset-color-btn'),
        sidebarNavLinks: document.querySelectorAll('.sidebar-nav-item'),
        btnQuickTheme: document.getElementById('btn-quick-theme'),
        btnSettings: document.getElementById('btn-settings'),
        quickThemeDot: document.getElementById('quick-theme-dot'),
        pickerThemeColor: document.getElementById('picker-theme-color')
    };

    if (dom.appVersionBadge) {
        dom.appVersionBadge.textContent = APP_VERSION;
    }

    // -------------------------------------------------------------------------
    // Notifiche Floating Toast
    // -------------------------------------------------------------------------
    function showToast(message, type = 'info', duration = 3500) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        dom.toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    // -------------------------------------------------------------------------
    // Navigazione Tab Principale
    // -------------------------------------------------------------------------
    dom.tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            dom.tabButtons.forEach(b => b.classList.remove('active'));
            dom.tabPanes.forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            const targetPane = document.getElementById(targetTab);
            if (targetPane) targetPane.classList.add('active');
        });
    });

    // -------------------------------------------------------------------------
    // Gestione IDEX e Multi-Asse Z (Visibilità e Subtab Dinamici)
    // -------------------------------------------------------------------------
    function updateIdexVisibility() {
        const isIdex = dom.checkEnableIdex.checked;
        dom.cardDualCarriage.style.display = isIdex ? 'block' : 'none';
        dom.btnSubtabDualCarriage.style.display = isIdex ? 'inline-flex' : 'none';
        dom.btnSubtabExtruder1.style.display = isIdex ? 'inline-flex' : 'none';

        if (!isIdex) {
            if (state.currentStepper === 'dual_carriage') {
                switchStepper('stepper_x');
            }
            if (state.currentExtruder === 'extruder1') {
                switchExtruder('extruder');
            }
        }
    }

    function updateMultiZVisibility() {
        const count = parseInt(dom.selectZMotorCount.value, 10) || 1;
        dom.btnSubtabZ1.style.display = count >= 2 ? 'inline-flex' : 'none';
        dom.btnSubtabZ2.style.display = count >= 3 ? 'inline-flex' : 'none';
        dom.btnSubtabZ3.style.display = count >= 4 ? 'inline-flex' : 'none';

        // Ripristina asse attivo se nascosto
        if (state.currentStepper === 'stepper_z1' && count < 2) switchStepper('stepper_z');
        if (state.currentStepper === 'stepper_z2' && count < 3) switchStepper('stepper_z');
        if (state.currentStepper === 'stepper_z3' && count < 4) switchStepper('stepper_z');

        // Aggiorna schede Calibration
        if (count >= 2 && count <= 3) {
            dom.cardZTilt.style.display = 'block';
            dom.cardQuadGantry.style.display = 'none';
        } else if (count === 4) {
            dom.cardZTilt.style.display = 'none';
            dom.cardQuadGantry.style.display = 'block';
        } else {
            dom.cardZTilt.style.display = 'none';
            dom.cardQuadGantry.style.display = 'none';
        }
    }

    dom.checkEnableIdex.addEventListener('change', () => {
        updateIdexVisibility();
        showToast(dom.checkEnableIdex.checked ? 'Architettura IDEX abilitata: attivati Dual Carriage ed Extruder 1' : 'Architettura IDEX disabilitata', 'info');
    });

    dom.selectZMotorCount.addEventListener('change', () => {
        updateMultiZVisibility();
        const cnt = dom.selectZMotorCount.value;
        showToast(`Impostati ${cnt} motori per l'asse Z`, 'info');
    });

    // Cinematica Delta card
    dom.printerKinematics.addEventListener('change', () => {
        dom.cardDeltaParams.style.display = dom.printerKinematics.value === 'delta' ? 'block' : 'none';
    });

    // -------------------------------------------------------------------------
    // Subtabs Stepper (X, Dual Carriage, Y, Z, Z1, Z2, Z3)
    // -------------------------------------------------------------------------
    function switchStepper(targetStepper) {
        saveCurrentStepperToParser();
        dom.subtabButtons.forEach(b => b.classList.remove('active'));
        const btn = document.querySelector(`#stepper-subtabs-container .subtab-btn[data-stepper="${targetStepper}"]`);
        if (btn) btn.classList.add('active');
        state.currentStepper = targetStepper;
        loadCurrentStepperFromParser();
        checkDirtyState();
    }

    dom.subtabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-stepper');
            switchStepper(target);
        });
    });

    // -------------------------------------------------------------------------
    // Subtabs Extruder (extruder, extruder1)
    // -------------------------------------------------------------------------
    function switchExtruder(targetExtruder) {
        saveCurrentExtruderToParser();
        dom.extruderSubtabs.forEach(b => b.classList.remove('active'));
        const btn = document.querySelector(`#extruder-subtabs-container .subtab-btn[data-extruder="${targetExtruder}"]`);
        if (btn) btn.classList.add('active');
        state.currentExtruder = targetExtruder;
        loadCurrentExtruderFromParser();
        checkDirtyState();
    }

    dom.extruderSubtabs.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-extruder');
            switchExtruder(target);
        });
    });

    // -------------------------------------------------------------------------
    // Toggle Campi Secondari (MCU, Driver, Sensorless, Probe, Safe-Z, Shaper)
    // -------------------------------------------------------------------------
    const mcuConnType = document.getElementById('mcu-conn-type');
    const groupMcuSerial = document.getElementById('group-mcu-serial');
    const groupMcuCanbus = document.getElementById('group-mcu-canbus');
    mcuConnType.addEventListener('change', () => {
        groupMcuSerial.style.display = mcuConnType.value === 'canbus' ? 'none' : 'block';
        groupMcuCanbus.style.display = mcuConnType.value === 'canbus' ? 'block' : 'none';
    });

    // -------------------------------------------------------------------------
    // Gestione Microcontrollori Secondari Dinamici ([mcu <nome>])
    // -------------------------------------------------------------------------
    function syncExtraMcusFromDom() {
        if (!dom.extraMcuListContainer) return;
        const cards = dom.extraMcuListContainer.querySelectorAll('.extra-mcu-card');
        cards.forEach((card) => {
            const nameInput = card.querySelector('.mcu-name-input');
            if (!nameInput) return;
            const idx = parseInt(nameInput.dataset.index, 10);
            if (state.extraMcus[idx] === undefined) return;

            const connSelect = card.querySelector('.mcu-conn-type-select');
            const addrInput = card.querySelector('.mcu-address-input');
            const baudInput = card.querySelector('.mcu-baud-input');
            const restartInput = card.querySelector('.mcu-restart-input');

            const cleanName = nameInput.value.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
            state.extraMcus[idx].name = cleanName;
            if (connSelect) state.extraMcus[idx].connType = connSelect.value;
            if (addrInput) {
                if (state.extraMcus[idx].connType === 'canbus') {
                    state.extraMcus[idx].canbus_uuid = addrInput.value.trim();
                } else if (state.extraMcus[idx].connType === 'host') {
                    state.extraMcus[idx].serial = '/tmp/klipper_host_mcu';
                } else {
                    state.extraMcus[idx].serial = addrInput.value.trim();
                }
            }
            if (baudInput) state.extraMcus[idx].baud = baudInput.value.trim();
            if (restartInput) state.extraMcus[idx].restart_method = restartInput.value.trim();
        });
    }

    function renderExtraMcus() {
        if (!dom.extraMcuListContainer) return;
        dom.extraMcuListContainer.innerHTML = '';

        if (state.extraMcus.length === 0) {
            dom.extraMcuListContainer.innerHTML = `
                <div style="text-align: center; padding: 1.75rem; background: var(--bg-surface); border-radius: var(--radius-sm); border: 1px dashed var(--border-color);">
                    <p style="color: var(--text-secondary); margin-bottom: 0.75rem; font-size: 0.875rem;">Nessun microcontrollore secondario configurato.</p>
                    <button type="button" class="btn btn-secondary btn-sm" id="btn-empty-add-mcu">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        + Aggiungi il tuo primo MCU secondario (es. toolhead, rpi, can0)
                    </button>
                </div>
            `;
            const btnEmpty = document.getElementById('btn-empty-add-mcu');
            if (btnEmpty) btnEmpty.addEventListener('click', addExtraMcu);
            return;
        }

        state.extraMcus.forEach((mcu, index) => {
            const card = document.createElement('div');
            card.className = 'extra-mcu-card macro-card';
            card.style.marginBottom = '1rem';
            card.style.backgroundColor = 'var(--bg-surface)';
            card.style.border = '1px solid var(--border-color)';
            card.style.borderRadius = 'var(--radius-sm)';
            card.style.padding = '1.1rem';

            const isCanbus = mcu.connType === 'canbus';
            const isHost = mcu.connType === 'host';

            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span style="font-weight: 700; color: var(--primary-light); font-size: 0.95rem;">[mcu ${mcu.name || 'nuovo'}]</span>
                        <span class="card-tag">MCU Secondario</span>
                    </div>
                    <button type="button" class="btn btn-danger btn-sm btn-delete-mcu" data-index="${index}" title="Elimina questo MCU">
                        Elimina MCU
                    </button>
                </div>

                <div class="form-row" style="margin-bottom: 0.85rem;">
                    <div class="form-group" style="flex: 1;">
                        <label class="form-label">Nome MCU (Sezione [mcu &lt;nome&gt;]):</label>
                        <input type="text" class="form-control mcu-name-input" data-index="${index}" value="${mcu.name || ''}" placeholder="es. toolhead, rpi, can0, ebb36">
                        <div class="form-helper">Questo nome identifica il microcontrollore e i suoi pin (es: <code>${mcu.name || 'toolhead'}:PB6</code>).</div>
                    </div>

                    <div class="form-group" style="flex: 1;">
                        <label class="form-label">Metodo di Connessione:</label>
                        <select class="form-control mcu-conn-type-select" data-index="${index}">
                            <option value="canbus" ${isCanbus ? 'selected' : ''}>CAN Bus (canbus_uuid)</option>
                            <option value="serial" ${(!isCanbus && !isHost) ? 'selected' : ''}>USB / Seriale (/dev/serial/by-id/...)</option>
                            <option value="host" ${isHost ? 'selected' : ''}>Raspberry Pi Linux MCU (/tmp/klipper_host_mcu)</option>
                        </select>
                    </div>
                </div>

                <div class="form-group" style="margin-bottom: 0.85rem;">
                    <label class="form-label">${isCanbus ? 'UUID CAN Bus (canbus_uuid):' : (isHost ? 'Percorso Socket Linux MCU (serial):' : 'Porta Seriale USB (serial):')}</label>
                    <input type="text" class="form-control mcu-address-input" data-index="${index}" value="${isCanbus ? (mcu.canbus_uuid || '') : (mcu.serial || '')}" placeholder="${isCanbus ? 'es. 43b0d2d3a1f8' : (isHost ? '/tmp/klipper_host_mcu' : '/dev/serial/by-id/usb-Klipper_...')}" ${isHost ? 'readonly' : ''}>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Baud Rate (Opzionale):</label>
                        <input type="text" class="form-control mcu-baud-input" data-index="${index}" value="${mcu.baud || ''}" placeholder="250000">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Restart Method (Opzionale):</label>
                        <input type="text" class="form-control mcu-restart-input" data-index="${index}" value="${mcu.restart_method || ''}" placeholder="command">
                    </div>
                </div>
            `;

            dom.extraMcuListContainer.appendChild(card);
        });

        // Event listeners per mcu-name-input
        dom.extraMcuListContainer.querySelectorAll('.mcu-name-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const idx = parseInt(e.target.dataset.index, 10);
                const clean = e.target.value.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
                state.extraMcus[idx].name = clean;
                const headerTag = e.target.closest('.extra-mcu-card').querySelector('span[style*="font-weight: 700"]');
                if (headerTag) headerTag.textContent = `[mcu ${clean || 'nuovo'}]`;
                const helper = e.target.closest('.form-group').querySelector('.form-helper code');
                if (helper) helper.textContent = `${clean || 'toolhead'}:PB6`;
            });
        });

        // Event listeners per mcu-conn-type-select
        dom.extraMcuListContainer.querySelectorAll('.mcu-conn-type-select').forEach(select => {
            select.addEventListener('change', (e) => {
                syncExtraMcusFromDom();
                const idx = parseInt(e.target.dataset.index, 10);
                const newType = e.target.value;
                state.extraMcus[idx].connType = newType;
                if (newType === 'host') {
                    state.extraMcus[idx].serial = '/tmp/klipper_host_mcu';
                    state.extraMcus[idx].canbus_uuid = '';
                }
                renderExtraMcus();
            });
        });

        // Event listeners per mcu-address-input
        dom.extraMcuListContainer.querySelectorAll('.mcu-address-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const idx = parseInt(e.target.dataset.index, 10);
                const mcu = state.extraMcus[idx];
                if (mcu.connType === 'canbus') {
                    mcu.canbus_uuid = e.target.value.trim();
                } else {
                    mcu.serial = e.target.value.trim();
                }
            });
        });

        // Event listeners per baud e restart
        dom.extraMcuListContainer.querySelectorAll('.mcu-baud-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const idx = parseInt(e.target.dataset.index, 10);
                state.extraMcus[idx].baud = e.target.value.trim();
            });
        });
        dom.extraMcuListContainer.querySelectorAll('.mcu-restart-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const idx = parseInt(e.target.dataset.index, 10);
                state.extraMcus[idx].restart_method = e.target.value.trim();
            });
        });

        // Event listeners per eliminazione
        dom.extraMcuListContainer.querySelectorAll('.btn-delete-mcu').forEach(btn => {
            btn.addEventListener('click', (e) => {
                syncExtraMcusFromDom();
                const idx = parseInt(e.target.dataset.index, 10);
                const removedName = state.extraMcus[idx]?.name || 'MCU';
                state.extraMcus.splice(idx, 1);
                renderExtraMcus();
                showToast(`MCU [mcu ${removedName}] rimosso`, 'info');
            });
        });
    }

    function addExtraMcu() {
        syncExtraMcusFromDom();
        let baseName = 'toolhead';
        if (state.extraMcus.some(m => m.name === baseName)) baseName = 'can0';
        if (state.extraMcus.some(m => m.name === baseName)) baseName = 'rpi';
        if (state.extraMcus.some(m => m.name === baseName)) baseName = `mcu_${state.extraMcus.length + 1}`;

        state.extraMcus.push({
            name: baseName,
            connType: 'canbus',
            canbus_uuid: '',
            serial: '',
            baud: '',
            restart_method: ''
        });

        renderExtraMcus();
        showToast(`Aggiunto nuovo MCU [mcu ${baseName}]`, 'success');
    }

    if (dom.btnAddMcu) {
        dom.btnAddMcu.addEventListener('click', addExtraMcu);
    }

    function updateDriverConnVisibility() {
        const connType = dom.driverConnTypeSelect ? dom.driverConnTypeSelect.value : 'uart';
        if (connType === 'standalone') {
            if (dom.driverConnStandaloneFields) dom.driverConnStandaloneFields.style.display = 'block';
            if (dom.driverConnUartFields) dom.driverConnUartFields.style.display = 'none';
            if (dom.driverConnSpiFields) dom.driverConnSpiFields.style.display = 'none';
            if (dom.driverSmartFields) dom.driverSmartFields.style.display = 'none';
        } else if (connType === 'uart') {
            if (dom.driverConnStandaloneFields) dom.driverConnStandaloneFields.style.display = 'none';
            if (dom.driverConnUartFields) dom.driverConnUartFields.style.display = 'block';
            if (dom.driverConnSpiFields) dom.driverConnSpiFields.style.display = 'none';
            if (dom.driverSmartFields) dom.driverSmartFields.style.display = 'block';
        } else if (connType === 'spi') {
            if (dom.driverConnStandaloneFields) dom.driverConnStandaloneFields.style.display = 'none';
            if (dom.driverConnUartFields) dom.driverConnUartFields.style.display = 'none';
            if (dom.driverConnSpiFields) dom.driverConnSpiFields.style.display = 'block';
            if (dom.driverSmartFields) dom.driverSmartFields.style.display = 'block';
        }
    }

    function updateDriverSpiModeVisibility() {
        const isSoft = dom.driverSpiMode && dom.driverSpiMode.value === 'software';
        if (dom.driverSpiBusGroup) dom.driverSpiBusGroup.style.display = isSoft ? 'none' : 'block';
        if (dom.driverSpiSoftGroup) dom.driverSpiSoftGroup.style.display = isSoft ? 'flex' : 'none';
    }

    if (dom.driverConnTypeSelect) {
        dom.driverConnTypeSelect.addEventListener('change', () => {
            updateDriverConnVisibility();
        });
    }

    if (dom.driverModelSelect) {
        dom.driverModelSelect.addEventListener('change', () => {
            const m = dom.driverModelSelect.value;
            if (m === 'generic') {
                if (dom.driverConnTypeSelect) dom.driverConnTypeSelect.value = 'standalone';
            } else if ((m === 'tmc5160' || m === 'tmc2130' || m === 'tmc2660') && dom.driverConnTypeSelect && dom.driverConnTypeSelect.value === 'uart') {
                dom.driverConnTypeSelect.value = 'spi';
            } else if ((m === 'tmc2209' || m === 'tmc2208' || m === 'tmc2226') && dom.driverConnTypeSelect && dom.driverConnTypeSelect.value === 'spi') {
                dom.driverConnTypeSelect.value = 'uart';
            }
            updateDriverConnVisibility();
        });
    }

    if (dom.driverSpiMode) {
        dom.driverSpiMode.addEventListener('change', () => {
            updateDriverSpiModeVisibility();
        });
    }

    if (dom.checkEnableHoldCurrent) {
        dom.checkEnableHoldCurrent.addEventListener('change', () => {
            if (dom.groupHoldCurrentField) {
                dom.groupHoldCurrentField.style.display = dom.checkEnableHoldCurrent.checked ? 'block' : 'none';
            }
        });
    }

    if (dom.checkEnableSenseResistor) {
        dom.checkEnableSenseResistor.addEventListener('change', () => {
            if (dom.groupSenseResistorField) {
                dom.groupSenseResistorField.style.display = dom.checkEnableSenseResistor.checked ? 'block' : 'none';
            }
        });
    }

    if (dom.driverSensorlessEnable) {
        dom.driverSensorlessEnable.addEventListener('change', () => {
            if (dom.sensorlessDetails) {
                dom.sensorlessDetails.style.display = dom.driverSensorlessEnable.checked ? 'block' : 'none';
            }
        });
    }

    // Extruder Driver UI Visibility & Event Listeners
    function updateExtruderDriverConnVisibility() {
        const connType = dom.extruderDriverConnTypeSelect ? dom.extruderDriverConnTypeSelect.value : 'uart';
        if (connType === 'standalone') {
            if (dom.extruderDriverConnStandaloneFields) dom.extruderDriverConnStandaloneFields.style.display = 'block';
            if (dom.extruderDriverConnUartFields) dom.extruderDriverConnUartFields.style.display = 'none';
            if (dom.extruderDriverConnSpiFields) dom.extruderDriverConnSpiFields.style.display = 'none';
            if (dom.extruderDriverSmartFields) dom.extruderDriverSmartFields.style.display = 'none';
        } else if (connType === 'uart') {
            if (dom.extruderDriverConnStandaloneFields) dom.extruderDriverConnStandaloneFields.style.display = 'none';
            if (dom.extruderDriverConnUartFields) dom.extruderDriverConnUartFields.style.display = 'block';
            if (dom.extruderDriverConnSpiFields) dom.extruderDriverConnSpiFields.style.display = 'none';
            if (dom.extruderDriverSmartFields) dom.extruderDriverSmartFields.style.display = 'block';
        } else if (connType === 'spi') {
            if (dom.extruderDriverConnStandaloneFields) dom.extruderDriverConnStandaloneFields.style.display = 'none';
            if (dom.extruderDriverConnUartFields) dom.extruderDriverConnUartFields.style.display = 'none';
            if (dom.extruderDriverConnSpiFields) dom.extruderDriverConnSpiFields.style.display = 'block';
            if (dom.extruderDriverSmartFields) dom.extruderDriverSmartFields.style.display = 'block';
        }
    }

    function updateExtruderDriverSpiModeVisibility() {
        const isSoft = dom.extruderDriverSpiMode && dom.extruderDriverSpiMode.value === 'software';
        if (dom.extruderDriverSpiBusGroup) dom.extruderDriverSpiBusGroup.style.display = isSoft ? 'none' : 'block';
        if (dom.extruderDriverSpiSoftGroup) dom.extruderDriverSpiSoftGroup.style.display = isSoft ? 'flex' : 'none';
    }

    if (dom.extruderDriverConnTypeSelect) {
        dom.extruderDriverConnTypeSelect.addEventListener('change', () => {
            updateExtruderDriverConnVisibility();
        });
    }

    if (dom.extruderDriverModelSelect) {
        dom.extruderDriverModelSelect.addEventListener('change', () => {
            const m = dom.extruderDriverModelSelect.value;
            if (m === 'generic') {
                if (dom.extruderDriverConnTypeSelect) dom.extruderDriverConnTypeSelect.value = 'standalone';
            } else if ((m === 'tmc5160' || m === 'tmc2130' || m === 'tmc2660') && dom.extruderDriverConnTypeSelect && dom.extruderDriverConnTypeSelect.value === 'uart') {
                dom.extruderDriverConnTypeSelect.value = 'spi';
            } else if ((m === 'tmc2209' || m === 'tmc2208' || m === 'tmc2226') && dom.extruderDriverConnTypeSelect && dom.extruderDriverConnTypeSelect.value === 'spi') {
                dom.extruderDriverConnTypeSelect.value = 'uart';
            }
            updateExtruderDriverConnVisibility();
        });
    }

    if (dom.extruderDriverSpiMode) {
        dom.extruderDriverSpiMode.addEventListener('change', () => {
            updateExtruderDriverSpiModeVisibility();
        });
    }

    if (dom.extruderCheckEnableHoldCurrent) {
        dom.extruderCheckEnableHoldCurrent.addEventListener('change', () => {
            if (dom.extruderGroupHoldCurrentField) {
                dom.extruderGroupHoldCurrentField.style.display = dom.extruderCheckEnableHoldCurrent.checked ? 'block' : 'none';
            }
        });
    }

    if (dom.extruderCheckEnableSenseResistor) {
        dom.extruderCheckEnableSenseResistor.addEventListener('change', () => {
            if (dom.extruderGroupSenseResistorField) {
                dom.extruderGroupSenseResistorField.style.display = dom.extruderCheckEnableSenseResistor.checked ? 'block' : 'none';
            }
        });
    }

    // -------------------------------------------------------------------------
    // Sensore di Temperatura Estrusore (SPI, MAX31865 RTD, ecc.)
    // -------------------------------------------------------------------------
    function isSpiSensorType(type) {
        if (!type) return false;
        const t = type.trim();
        return t === 'MAX31865' || t === 'MAX6675' || t === 'MAX31855' || t === 'MAX31856';
    }

    function updateExtruderSensorSpiVisibility() {
        const sensorType = dom.extruderSensorType ? dom.extruderSensorType.value : '';
        const isSpi = isSpiSensorType(sensorType);
        const isMax31865 = sensorType === 'MAX31865';

        if (dom.extruderSensorSpiContainer) {
            dom.extruderSensorSpiContainer.style.display = isSpi ? 'block' : 'none';
        }

        if (dom.extruderSensorPinLabel) {
            dom.extruderSensorPinLabel.textContent = isSpi ? 'Sensor Pin / CS Pin (sensor_pin):' : 'Sensor Pin (sensor_pin):';
        }

        const isSoft = dom.extruderSensorSpiMode && dom.extruderSensorSpiMode.value === 'software';
        if (dom.extruderSensorSpiBusGroup) {
            dom.extruderSensorSpiBusGroup.style.display = isSoft ? 'none' : 'block';
        }
        if (dom.extruderSensorSpiSoftGroup) {
            dom.extruderSensorSpiSoftGroup.style.display = isSoft ? 'flex' : 'none';
        }

        if (dom.extruderSensorRtdFields) {
            dom.extruderSensorRtdFields.style.display = isMax31865 ? 'block' : 'none';
        }
    }

    if (dom.extruderSensorType) {
        dom.extruderSensorType.addEventListener('change', () => {
            updateExtruderSensorSpiVisibility();
        });
    }

    if (dom.extruderSensorSpiMode) {
        dom.extruderSensorSpiMode.addEventListener('change', () => {
            updateExtruderSensorSpiVisibility();
        });
    }

    if (dom.extruderRtdNominalR) {
        dom.extruderRtdNominalR.addEventListener('change', () => {
            if (dom.extruderRtdReferenceR) {
                const nom = dom.extruderRtdNominalR.value;
                if (nom === '1000' && (dom.extruderRtdReferenceR.value === '430' || !dom.extruderRtdReferenceR.value)) {
                    dom.extruderRtdReferenceR.value = '4300';
                } else if (nom === '100' && (dom.extruderRtdReferenceR.value === '4300' || !dom.extruderRtdReferenceR.value)) {
                    dom.extruderRtdReferenceR.value = '430';
                }
            }
        });
    }

    // -------------------------------------------------------------------------
    // Controllo Temperatura (PID vs Watermark) per Estrusore e Piatto
    // -------------------------------------------------------------------------
    function updateExtruderControlVisibility() {
        const isPid = !dom.extruderControlType || dom.extruderControlType.value === 'pid';
        if (dom.extruderPidFields) dom.extruderPidFields.style.display = isPid ? 'flex' : 'none';
        if (dom.extruderWatermarkFields) dom.extruderWatermarkFields.style.display = isPid ? 'none' : 'block';
    }

    function updateBedControlVisibility() {
        const isPid = !dom.bedControlType || dom.bedControlType.value === 'pid';
        if (dom.bedPidFields) dom.bedPidFields.style.display = isPid ? 'flex' : 'none';
        if (dom.bedWatermarkFields) dom.bedWatermarkFields.style.display = isPid ? 'none' : 'block';
    }

    if (dom.extruderControlType) {
        dom.extruderControlType.addEventListener('change', () => {
            updateExtruderControlVisibility();
        });
    }

    if (dom.bedControlType) {
        dom.bedControlType.addEventListener('change', () => {
            updateBedControlVisibility();
        });
    }

    const probeTypeSelect = document.getElementById('probe-type-select');
    const probeConfigFields = document.getElementById('probe-config-fields');
    const groupProbeControlPin = document.getElementById('group-probe-control-pin');
    probeTypeSelect.addEventListener('change', () => {
        if (probeTypeSelect.value === 'none') {
            probeConfigFields.style.display = 'none';
        } else {
            probeConfigFields.style.display = 'block';
            groupProbeControlPin.style.display = probeTypeSelect.value === 'bltouch' ? 'block' : 'none';
        }
    });

    const checkEnableSafeZ = document.getElementById('check-enable-safe-z');
    const safeZFields = document.getElementById('safe-z-fields');
    checkEnableSafeZ.addEventListener('change', () => {
        safeZFields.style.display = checkEnableSafeZ.checked ? 'block' : 'none';
    });

    const checkEnableShaper = document.getElementById('check-enable-shaper');
    const shaperFields = document.getElementById('shaper-fields');
    checkEnableShaper.addEventListener('change', () => {
        shaperFields.style.display = checkEnableShaper.checked ? 'block' : 'none';
    });

    // -------------------------------------------------------------------------
    // Accelerometro ADXL345 & Resonance Tester
    // -------------------------------------------------------------------------
    function updateAdxlSpiModeVisibility() {
        const isSoft = dom.adxlSpiMode && dom.adxlSpiMode.value === 'software';
        if (dom.adxlSpiBusGroup) dom.adxlSpiBusGroup.style.display = isSoft ? 'none' : 'block';
        if (dom.adxlSpiSoftGroup) dom.adxlSpiSoftGroup.style.display = isSoft ? 'flex' : 'none';
    }

    if (dom.checkEnableAdxl) {
        dom.checkEnableAdxl.addEventListener('change', () => {
            if (dom.adxl345Fields) {
                dom.adxl345Fields.style.display = dom.checkEnableAdxl.checked ? 'block' : 'none';
            }
        });
    }

    if (dom.adxlSpiMode) {
        dom.adxlSpiMode.addEventListener('change', updateAdxlSpiModeVisibility);
    }

    if (dom.checkEnableResonanceTester) {
        dom.checkEnableResonanceTester.addEventListener('change', () => {
            if (dom.resonanceTesterFields) {
                dom.resonanceTesterFields.style.display = dom.checkEnableResonanceTester.checked ? 'block' : 'none';
            }
        });
    }

    // Sincronizzazione Z-Offset tra Calibration e Probe
    if (dom.calibrationZOffset && dom.probeZOffset) {
        dom.calibrationZOffset.addEventListener('input', () => {
            dom.probeZOffset.value = dom.calibrationZOffset.value;
        });
        dom.probeZOffset.addEventListener('input', () => {
            dom.calibrationZOffset.value = dom.probeZOffset.value;
        });
    }

    // -------------------------------------------------------------------------
    // Gestione Ventole Aggiuntive (heater_fan, controller_fan, temperature_fan, fan_generic)
    // -------------------------------------------------------------------------
    function syncExtraFansFromDom() {
        if (!dom.extraFanListContainer) return;
        state.extraFans.forEach((fan, idx) => {
            const typeSel = dom.extraFanListContainer.querySelector(`.fan-type-select[data-index="${idx}"]`);
            if (typeSel) fan.type = typeSel.value;
            const nameInp = dom.extraFanListContainer.querySelector(`.fan-name-input[data-index="${idx}"]`);
            if (nameInp) fan.name = nameInp.value.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
            const pinInp = dom.extraFanListContainer.querySelector(`.fan-pin-input[data-index="${idx}"]`);
            if (pinInp) fan.pin = pinInp.value.trim();
            const heaterInp = dom.extraFanListContainer.querySelector(`.fan-heater-input[data-index="${idx}"]`);
            if (heaterInp) fan.heater = heaterInp.value.trim();
            const heaterTempInp = dom.extraFanListContainer.querySelector(`.fan-heater-temp-input[data-index="${idx}"]`);
            if (heaterTempInp) fan.heater_temp = heaterTempInp.value.trim();
            const stepperInp = dom.extraFanListContainer.querySelector(`.fan-stepper-input[data-index="${idx}"]`);
            if (stepperInp) fan.stepper = stepperInp.value.trim();
            const sensTypeInp = dom.extraFanListContainer.querySelector(`.fan-sens-type-input[data-index="${idx}"]`);
            if (sensTypeInp) fan.sensor_type = sensTypeInp.value.trim();
            const sensPinInp = dom.extraFanListContainer.querySelector(`.fan-sens-pin-input[data-index="${idx}"]`);
            if (sensPinInp) fan.sensor_pin = sensPinInp.value.trim();
            const targetTempInp = dom.extraFanListContainer.querySelector(`.fan-target-temp-input[data-index="${idx}"]`);
            if (targetTempInp) fan.target_temp = targetTempInp.value.trim();
            const maxPowerInp = dom.extraFanListContainer.querySelector(`.fan-max-power-input[data-index="${idx}"]`);
            if (maxPowerInp) fan.max_power = maxPowerInp.value.trim();
        });
    }

    function renderExtraFans() {
        if (!dom.extraFanListContainer) return;
        dom.extraFanListContainer.innerHTML = '';

        if (state.extraFans.length === 0) {
            dom.extraFanListContainer.innerHTML = `
                <div style="text-align: center; padding: 1.25rem; background: var(--bg-surface); border-radius: var(--radius-sm); border: 1px dashed var(--border-color);">
                    <p style="color: var(--text-secondary); margin-bottom: 0.5rem; font-size: 0.85rem;">Nessuna ventola ausiliaria aggiuntiva configurata.</p>
                    <button type="button" class="btn btn-secondary btn-sm" id="btn-empty-add-fan">
                        + Aggiungi una ventola ausiliaria (es. dissipatore hotend, box elettronica, camera)
                    </button>
                </div>
            `;
            const btnEmpty = document.getElementById('btn-empty-add-fan');
            if (btnEmpty) btnEmpty.addEventListener('click', addExtraFan);
            return;
        }

        state.extraFans.forEach((fan, index) => {
            const card = document.createElement('div');
            card.className = 'extra-fan-card';
            card.style.cssText = 'padding: 0.85rem; background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: var(--radius-sm); margin-bottom: 0.75rem;';

            let extraHtml = '';
            if (fan.type === 'heater_fan') {
                extraHtml = `
                    <div class="form-row" style="margin-top: 0.5rem;">
                        <div class="form-group">
                            <label class="form-label">Riscaldatore Associato (heater):</label>
                            <input type="text" class="form-control fan-heater-input" data-index="${index}" placeholder="extruder" value="${fan.heater || 'extruder'}">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Temperatura Attivazione (heater_temp):</label>
                            <input type="number" step="1" class="form-control fan-heater-temp-input" data-index="${index}" placeholder="50.0" value="${fan.heater_temp || '50.0'}">
                        </div>
                    </div>
                `;
            } else if (fan.type === 'controller_fan') {
                extraHtml = `
                    <div class="form-row" style="margin-top: 0.5rem;">
                        <div class="form-group">
                            <label class="form-label">Stepper da Monitorare (stepper):</label>
                            <input type="text" class="form-control fan-stepper-input" data-index="${index}" placeholder="stepper_x, stepper_y" value="${fan.stepper || ''}">
                            <div class="form-helper">Lascia vuoto per monitorare tutti i motori.</div>
                        </div>
                    </div>
                `;
            } else if (fan.type === 'temperature_fan') {
                extraHtml = `
                    <div class="form-row" style="margin-top: 0.5rem;">
                        <div class="form-group">
                            <label class="form-label">Tipo Sensore (sensor_type):</label>
                            <input type="text" class="form-control fan-sens-type-input" data-index="${index}" placeholder="EPCOS 100K B57560G104F" value="${fan.sensor_type || 'EPCOS 100K B57560G104F'}">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Pin Sensore (sensor_pin):</label>
                            <input type="text" class="form-control fan-sens-pin-input" data-index="${index}" placeholder="PC5" value="${fan.sensor_pin || ''}">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Temp Target (target_temp):</label>
                            <input type="number" class="form-control fan-target-temp-input" data-index="${index}" placeholder="45.0" value="${fan.target_temp || '45.0'}">
                        </div>
                    </div>
                `;
            } else if (fan.type === 'fan_generic') {
                extraHtml = `
                    <div class="form-row" style="margin-top: 0.5rem;">
                        <div class="form-group">
                            <label class="form-label">Potenza Massima (max_power):</label>
                            <input type="number" step="0.1" min="0" max="1" class="form-control fan-max-power-input" data-index="${index}" placeholder="1.0" value="${fan.max_power || '1.0'}">
                        </div>
                    </div>
                `;
            }

            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem;">
                    <div style="font-weight: 600; font-size: 0.85rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.4rem;">
                        <span>🌀 Ventola [${fan.type} ${fan.name || 'unnamed'}]</span>
                    </div>
                    <button type="button" class="btn btn-secondary btn-sm btn-delete-fan" data-index="${index}" style="color: var(--danger); padding: 0.15rem 0.45rem;" title="Rimuovi ventola">
                        ✕ Elimina
                    </button>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Tipologia di Assegnazione Klipper:</label>
                        <select class="form-control fan-type-select" data-index="${index}">
                            <option value="heater_fan" ${fan.type === 'heater_fan' ? 'selected' : ''}>heater_fan (Dissipatore Hotend / Riscaldatori)</option>
                            <option value="controller_fan" ${fan.type === 'controller_fan' ? 'selected' : ''}>controller_fan (Driver Motori / Elettronica)</option>
                            <option value="temperature_fan" ${fan.type === 'temperature_fan' ? 'selected' : ''}>temperature_fan (Termoregolata con sensore)</option>
                            <option value="fan_generic" ${fan.type === 'fan_generic' ? 'selected' : ''}>fan_generic (Ventola ausiliaria manuale M106/G-code)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Identificatore / Nome Ventola:</label>
                        <input type="text" class="form-control fan-name-input" data-index="${index}" placeholder="hotend_fan" value="${fan.name || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Pin di Controllo (pin):</label>
                        <input type="text" class="form-control fan-pin-input" data-index="${index}" placeholder="PC6" value="${fan.pin || ''}">
                    </div>
                </div>
                ${extraHtml}
            `;
            dom.extraFanListContainer.appendChild(card);
        });

        // Listeners
        dom.extraFanListContainer.querySelectorAll('.fan-type-select').forEach(sel => {
            sel.addEventListener('change', (e) => {
                syncExtraFansFromDom();
                const idx = parseInt(e.target.dataset.index, 10);
                state.extraFans[idx].type = e.target.value;
                renderExtraFans();
            });
        });

        dom.extraFanListContainer.querySelectorAll('.fan-name-input').forEach(inp => {
            inp.addEventListener('input', (e) => {
                const idx = parseInt(e.target.dataset.index, 10);
                state.extraFans[idx].name = e.target.value.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
            });
        });

        dom.extraFanListContainer.querySelectorAll('.fan-pin-input').forEach(inp => {
            inp.addEventListener('input', (e) => {
                const idx = parseInt(e.target.dataset.index, 10);
                state.extraFans[idx].pin = e.target.value.trim();
            });
        });

        dom.extraFanListContainer.querySelectorAll('.btn-delete-fan').forEach(btn => {
            btn.addEventListener('click', (e) => {
                syncExtraFansFromDom();
                const idx = parseInt(btn.dataset.index, 10);
                const removed = state.extraFans.splice(idx, 1)[0];
                renderExtraFans();
                showToast(`Ventola [${removed.type} ${removed.name}] rimossa`, 'info');
                checkDirtyState();
            });
        });
    }

    function addExtraFan() {
        syncExtraFansFromDom();
        let defaultName = 'hotend_fan';
        if (state.extraFans.some(f => f.name === defaultName)) defaultName = 'controller_fan';
        if (state.extraFans.some(f => f.name === defaultName)) defaultName = 'chamber_fan';
        if (state.extraFans.some(f => f.name === defaultName)) defaultName = `fan_${state.extraFans.length + 1}`;

        state.extraFans.push({
            type: 'heater_fan',
            name: defaultName,
            pin: '',
            heater: 'extruder',
            heater_temp: '50.0',
            fan_speed: '1.0'
        });
        renderExtraFans();
        showToast(`Aggiunta nuova ventola [heater_fan ${defaultName}]`, 'success');
        checkDirtyState();
    }

    if (dom.btnAddFan) dom.btnAddFan.addEventListener('click', addExtraFan);

    // -------------------------------------------------------------------------
    // Gestione LED (neopixel, output_pin)
    // -------------------------------------------------------------------------
    function syncLedsFromDom() {
        if (!dom.ledListContainer) return;
        state.leds.forEach((led, idx) => {
            const typeSel = dom.ledListContainer.querySelector(`.led-type-select[data-index="${idx}"]`);
            if (typeSel) led.type = typeSel.value;
            const nameInp = dom.ledListContainer.querySelector(`.led-name-input[data-index="${idx}"]`);
            if (nameInp) led.name = nameInp.value.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
            const pinInp = dom.ledListContainer.querySelector(`.led-pin-input[data-index="${idx}"]`);
            if (pinInp) led.pin = pinInp.value.trim();
            const chainInp = dom.ledListContainer.querySelector(`.led-chain-input[data-index="${idx}"]`);
            if (chainInp) led.chain_count = chainInp.value.trim();
            const orderSel = dom.ledListContainer.querySelector(`.led-order-select[data-index="${idx}"]`);
            if (orderSel) led.color_order = orderSel.value;
        });
    }

    function renderLeds() {
        if (!dom.ledListContainer) return;
        dom.ledListContainer.innerHTML = '';

        if (state.leds.length === 0) {
            dom.ledListContainer.innerHTML = `
                <div style="text-align: center; padding: 1.25rem; background: var(--bg-surface); border-radius: var(--radius-sm); border: 1px dashed var(--border-color);">
                    <p style="color: var(--text-secondary); margin-bottom: 0.5rem; font-size: 0.85rem;">Nessuna striscia LED o Neopixel configurata.</p>
                    <button type="button" class="btn btn-secondary btn-sm" id="btn-empty-add-led">
                        + Aggiungi LED / Neopixel (es. StealthBurner, barre LED camera)
                    </button>
                </div>
            `;
            const btnEmpty = document.getElementById('btn-empty-add-led');
            if (btnEmpty) btnEmpty.addEventListener('click', addLed);
            return;
        }

        state.leds.forEach((led, index) => {
            const card = document.createElement('div');
            card.className = 'extra-led-card';
            card.style.cssText = 'padding: 0.85rem; background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: var(--radius-sm); margin-bottom: 0.75rem;';

            let extraHtml = '';
            if (led.type === 'neopixel') {
                extraHtml = `
                    <div class="form-row" style="margin-top: 0.5rem;">
                        <div class="form-group">
                            <label class="form-label">Numero LED (chain_count):</label>
                            <input type="number" step="1" min="1" class="form-control led-chain-input" data-index="${index}" placeholder="1" value="${led.chain_count || '1'}">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Ordine Colori (color_order):</label>
                            <select class="form-control led-order-select" data-index="${index}">
                                <option value="GRB" ${led.color_order === 'GRB' ? 'selected' : ''}>GRB (Standard WS2812B)</option>
                                <option value="RGB" ${led.color_order === 'RGB' ? 'selected' : ''}>RGB</option>
                                <option value="GRBW" ${led.color_order === 'GRBW' ? 'selected' : ''}>GRBW (SK6812 RGBW con Bianco)</option>
                                <option value="RGBW" ${led.color_order === 'RGBW' ? 'selected' : ''}>RGBW</option>
                            </select>
                        </div>
                    </div>
                `;
            }

            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem;">
                    <div style="font-weight: 600; font-size: 0.85rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.4rem;">
                        <span>💡 [${led.type} ${led.name || 'unnamed'}]</span>
                    </div>
                    <button type="button" class="btn btn-secondary btn-sm btn-delete-led" data-index="${index}" style="color: var(--danger); padding: 0.15rem 0.45rem;" title="Rimuovi LED">
                        ✕ Elimina
                    </button>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Tipo LED:</label>
                        <select class="form-control led-type-select" data-index="${index}">
                            <option value="neopixel" ${led.type === 'neopixel' ? 'selected' : ''}>neopixel (Strisce indirizzabili RGB/RGBW WS2812)</option>
                            <option value="output_pin" ${led.type === 'output_pin' ? 'selected' : ''}>output_pin (LED Monocromatico / Barra PWM)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Nome LED:</label>
                        <input type="text" class="form-control led-name-input" data-index="${index}" placeholder="caselight" value="${led.name || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Pin LED:</label>
                        <input type="text" class="form-control led-pin-input" data-index="${index}" placeholder="PB0" value="${led.pin || ''}">
                    </div>
                </div>
                ${extraHtml}
            `;
            dom.ledListContainer.appendChild(card);
        });

        // Listeners
        dom.ledListContainer.querySelectorAll('.led-type-select').forEach(sel => {
            sel.addEventListener('change', (e) => {
                syncLedsFromDom();
                const idx = parseInt(e.target.dataset.index, 10);
                state.leds[idx].type = e.target.value;
                renderLeds();
            });
        });

        dom.ledListContainer.querySelectorAll('.led-name-input').forEach(inp => {
            inp.addEventListener('input', (e) => {
                const idx = parseInt(e.target.dataset.index, 10);
                state.leds[idx].name = e.target.value.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
            });
        });

        dom.ledListContainer.querySelectorAll('.led-pin-input').forEach(inp => {
            inp.addEventListener('input', (e) => {
                const idx = parseInt(e.target.dataset.index, 10);
                state.leds[idx].pin = e.target.value.trim();
            });
        });

        dom.ledListContainer.querySelectorAll('.btn-delete-led').forEach(btn => {
            btn.addEventListener('click', (e) => {
                syncLedsFromDom();
                const idx = parseInt(btn.dataset.index, 10);
                const removed = state.leds.splice(idx, 1)[0];
                renderLeds();
                showToast(`LED [${removed.type} ${removed.name}] rimosso`, 'info');
                checkDirtyState();
            });
        });
    }

    function addLed() {
        syncLedsFromDom();
        let defaultName = 'sb_leds';
        if (state.leds.some(l => l.name === defaultName)) defaultName = 'caselight';
        if (state.leds.some(l => l.name === defaultName)) defaultName = `led_${state.leds.length + 1}`;

        state.leds.push({
            type: 'neopixel',
            name: defaultName,
            pin: '',
            chain_count: '1',
            color_order: 'GRB',
            initial_red: '0.0',
            initial_green: '0.0',
            initial_blue: '0.0',
            initial_white: '0.0'
        });
        renderLeds();
        showToast(`Aggiunto nuovo LED [neopixel ${defaultName}]`, 'success');
        checkDirtyState();
    }

    if (dom.btnAddLed) dom.btnAddLed.addEventListener('click', addLed);

    // -------------------------------------------------------------------------
    // Gestione File Inclusi ([include])
    // -------------------------------------------------------------------------
    function syncIncludesFromDom() {
        if (!dom.includeListContainer) return;
        state.includes.forEach((inc, idx) => {
            const fileInp = dom.includeListContainer.querySelector(`.include-file-input[data-index="${idx}"]`);
            if (fileInp) inc.file = fileInp.value.trim();
        });
    }

    function renderIncludes() {
        if (!dom.includeListContainer) return;
        dom.includeListContainer.innerHTML = '';

        if (state.includes.length === 0) {
            dom.includeListContainer.innerHTML = `
                <div style="text-align: center; padding: 2rem; background: var(--bg-card); border-radius: var(--radius-md); border: 1px dashed var(--border-color);">
                    <p style="color: var(--text-secondary); margin-bottom: 0.75rem;">Nessun file esterno [include] configurato nel file principale.</p>
                    <p style="font-size: 0.8rem; color: var(--text-muted);">Usa i bottoni rapidi sopra o il pulsante 'Nuovo File Include' per aggiungerne uno.</p>
                </div>
            `;
            return;
        }

        state.includes.forEach((inc, index) => {
            const card = document.createElement('div');
            card.style.cssText = 'display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; padding: 0.75rem 1rem; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-sm); margin-bottom: 0.5rem;';

            card.innerHTML = `
                <div style="display: flex; align-items: center; gap: 0.75rem; flex: 1;">
                    <span style="color: var(--primary-light); font-size: 1.1rem;">📄</span>
                    <div style="flex: 1;">
                        <input type="text" class="form-control include-file-input" data-index="${index}" value="${inc.file}" placeholder="nome_file.cfg" style="font-family: monospace;">
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span class="card-tag" style="margin: 0;">[include ${inc.file}]</span>
                    <button type="button" class="btn btn-secondary btn-sm btn-delete-include" data-index="${index}" style="color: var(--danger); padding: 0.25rem 0.5rem;" title="Rimuovi include">
                        ✕
                    </button>
                </div>
            `;
            dom.includeListContainer.appendChild(card);
        });

        dom.includeListContainer.querySelectorAll('.include-file-input').forEach(inp => {
            inp.addEventListener('input', (e) => {
                const idx = parseInt(e.target.dataset.index, 10);
                state.includes[idx].file = e.target.value.trim();
                const tag = e.target.closest('div').parentElement.querySelector('.card-tag');
                if (tag) tag.textContent = `[include ${state.includes[idx].file}]`;
            });
        });

        dom.includeListContainer.querySelectorAll('.btn-delete-include').forEach(btn => {
            btn.addEventListener('click', () => {
                syncIncludesFromDom();
                const idx = parseInt(btn.dataset.index, 10);
                const removed = state.includes.splice(idx, 1)[0];
                renderIncludes();
                showToast(`Rimosso [include ${removed.file}]`, 'info');
                checkDirtyState();
            });
        });
    }

    function addInclude(filename = '') {
        syncIncludesFromDom();
        const f = filename || `custom_${state.includes.length + 1}.cfg`;
        if (state.includes.some(i => i.file === f)) {
            showToast(`Il file [include ${f}] è già presente nella lista`, 'warning');
            return;
        }
        state.includes.push({ file: f });
        renderIncludes();
        showToast(`Aggiunto [include ${f}]`, 'success');
        checkDirtyState();
    }

    if (dom.btnAddInclude) {
        dom.btnAddInclude.addEventListener('click', () => addInclude(''));
    }

    if (dom.presetIncludeButtons) {
        dom.presetIncludeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const f = btn.getAttribute('data-file');
                if (f) addInclude(f);
            });
        });
    }


    // Toggle inversione pin con '!'
    const setupInvertPinToggle = (inputEl, checkEl) => {
        checkEl.addEventListener('change', () => {
            let val = inputEl.value.trim();
            if (checkEl.checked) {
                if (!val.startsWith('!')) inputEl.value = '!' + val;
            } else {
                if (val.startsWith('!')) inputEl.value = val.substring(1);
            }
        });
        inputEl.addEventListener('input', () => {
            checkEl.checked = inputEl.value.trim().startsWith('!');
        });
    };
    setupInvertPinToggle(document.getElementById('stepper-dir-pin'), document.getElementById('check-invert-dir'));
    setupInvertPinToggle(document.getElementById('stepper-enable-pin'), document.getElementById('check-invert-enable'));

    // -------------------------------------------------------------------------
    // Calcolatore Rotation Distance
    // -------------------------------------------------------------------------
    function updateCalcResult() {
        const type = dom.calcDriveType.value;
        if (type === 'belt') {
            const teeth = parseFloat(dom.calcPulleyTeeth.value) || 20;
            const res = teeth * 2;
            dom.calcResultVal.textContent = `${res.toFixed(3)} mm`;
            return res.toFixed(3);
        } else {
            const pitch = parseFloat(dom.calcLeadscrewPitch.value) || 8;
            dom.calcResultVal.textContent = `${pitch.toFixed(3)} mm`;
            return pitch.toFixed(3);
        }
    }

    dom.btnCalcRotDist.addEventListener('click', () => {
        dom.modalCalc.classList.add('open');
        updateCalcResult();
    });
    dom.btnCloseCalc.addEventListener('click', () => dom.modalCalc.classList.remove('open'));
    dom.btnCancelCalc.addEventListener('click', () => dom.modalCalc.classList.remove('open'));
    dom.calcDriveType.addEventListener('change', () => {
        dom.calcBeltFields.style.display = dom.calcDriveType.value === 'belt' ? 'block' : 'none';
        dom.calcLeadFields.style.display = dom.calcDriveType.value === 'belt' ? 'none' : 'block';
        updateCalcResult();
    });
    dom.calcPulleyTeeth.addEventListener('input', updateCalcResult);
    dom.calcLeadscrewPitch.addEventListener('input', updateCalcResult);
    dom.btnApplyCalc.addEventListener('click', () => {
        const val = updateCalcResult();
        document.getElementById('stepper-rotation-distance').value = val;
        dom.modalCalc.classList.remove('open');
        showToast(`Rotation distance impostata a ${val} mm`, 'success');
    });

    // -------------------------------------------------------------------------
    // Gestione Stepper e Driver Attivo
    // -------------------------------------------------------------------------
    function getDriverSectionName(stepperName) {
        for (const driverType of ['tmc2209', 'tmc2208', 'tmc2226', 'tmc5160', 'tmc2240', 'tmc2130', 'tmc2660']) {
            if (state.parser.hasSection(`${driverType} ${stepperName}`)) {
                return { type: driverType, section: `${driverType} ${stepperName}` };
            }
        }
        return { type: null, section: null };
    }

    function loadCurrentStepperFromParser() {
        const s = state.currentStepper;
        const isAuxZ = s === 'stepper_z1' || s === 'stepper_z2' || s === 'stepper_z3';
        const isDualCarriage = s === 'dual_carriage';

        // Etichette
        if (isDualCarriage) {
            dom.stepperCardTitle.textContent = 'Configurazione Dual Carriage X2';
            dom.stepperCardTag.textContent = '[dual_carriage]';
        } else if (isAuxZ) {
            const zNum = s.replace('stepper_', '').toUpperCase();
            dom.stepperCardTitle.textContent = `Configurazione Motore Asse ${zNum}`;
            dom.stepperCardTag.textContent = `[${s}]`;
        } else {
            const axisLetter = s.replace('stepper_', '').toUpperCase();
            dom.stepperCardTitle.textContent = `Configurazione Motore Asse ${axisLetter}`;
            dom.stepperCardTag.textContent = `[${s}]`;
        }

        // Visibilità endstop per motori ausiliari Z
        if (isAuxZ) {
            dom.groupStepperEndstop.style.display = 'none';
            dom.noticeAuxZ.style.display = 'block';
            dom.groupSensorlessHoming.style.display = 'none';
        } else {
            dom.groupStepperEndstop.style.display = 'block';
            dom.noticeAuxZ.style.display = 'none';
            dom.groupSensorlessHoming.style.display = 'block';
        }

        // Caricamento pin e parametri motore
        document.getElementById('stepper-step-pin').value = state.parser.get(s, 'step_pin', '');
        
        const dirPin = state.parser.get(s, 'dir_pin', '');
        document.getElementById('stepper-dir-pin').value = dirPin;
        document.getElementById('check-invert-dir').checked = dirPin.startsWith('!');

        const enablePin = state.parser.get(s, 'enable_pin', '');
        document.getElementById('stepper-enable-pin').value = enablePin;
        document.getElementById('check-invert-enable').checked = enablePin.startsWith('!');

        document.getElementById('stepper-microsteps').value = state.parser.get(s, 'microsteps', '16');
        document.getElementById('stepper-steps-rotation').value = state.parser.get(s, 'full_steps_per_rotation', '200');
        document.getElementById('stepper-rotation-distance').value = state.parser.get(s, 'rotation_distance', isAuxZ || s === 'stepper_z' ? '8.0' : '40.0');
        document.getElementById('stepper-endstop-pin').value = state.parser.get(s, 'endstop_pin', '');

        // Caricamento driver
        const driverInfo = getDriverSectionName(s);
        const hasDriver = !!(driverInfo.section && state.parser.hasSection(driverInfo.section));

        dom.driverCardTitle.textContent = `Driver Stepper Motion [${s}]`;

        if (!hasDriver) {
            dom.driverCardTag.textContent = '[Standalone / Nessun TMC]';
            if (dom.driverModelSelect) dom.driverModelSelect.value = 'generic';
            if (dom.driverConnTypeSelect) dom.driverConnTypeSelect.value = 'standalone';
            updateDriverConnVisibility();
        } else {
            dom.driverCardTag.textContent = `[${driverInfo.section}]`;
            if (dom.driverModelSelect) dom.driverModelSelect.value = driverInfo.type || 'tmc2209';

            // Rileva tipo connessione (UART vs SPI)
            const csPin = state.parser.get(driverInfo.section, 'cs_pin', '');
            const spiBus = state.parser.get(driverInfo.section, 'spi_bus', '');
            const spiSoftSclk = state.parser.get(driverInfo.section, 'spi_software_sclk_pin', '');
            const isSpi = !!(csPin || spiBus || spiSoftSclk);

            const connType = isSpi ? 'spi' : 'uart';
            if (dom.driverConnTypeSelect) dom.driverConnTypeSelect.value = connType;
            updateDriverConnVisibility();

            // Campi UART
            if (dom.driverUartPin) dom.driverUartPin.value = state.parser.get(driverInfo.section, 'uart_pin', '');
            if (dom.driverTxPin) dom.driverTxPin.value = state.parser.get(driverInfo.section, 'tx_pin', '');
            if (dom.driverUartAddress) dom.driverUartAddress.value = state.parser.get(driverInfo.section, 'uart_address', '');

            // Campi SPI
            if (dom.driverCsPin) dom.driverCsPin.value = csPin;
            if (spiSoftSclk) {
                if (dom.driverSpiMode) dom.driverSpiMode.value = 'software';
                if (dom.driverSpiSclk) dom.driverSpiSclk.value = spiSoftSclk;
                if (dom.driverSpiMosi) dom.driverSpiMosi.value = state.parser.get(driverInfo.section, 'spi_software_mosi_pin', '');
                if (dom.driverSpiMiso) dom.driverSpiMiso.value = state.parser.get(driverInfo.section, 'spi_software_miso_pin', '');
                if (dom.driverSpiBus) dom.driverSpiBus.value = '';
            } else {
                if (dom.driverSpiMode) dom.driverSpiMode.value = 'hardware';
                if (dom.driverSpiBus) dom.driverSpiBus.value = spiBus;
                if (dom.driverSpiSclk) dom.driverSpiSclk.value = '';
                if (dom.driverSpiMosi) dom.driverSpiMosi.value = '';
                if (dom.driverSpiMiso) dom.driverSpiMiso.value = '';
            }
            updateDriverSpiModeVisibility();

            // Parametri Operativi TMC
            document.getElementById('driver-run-current').value = state.parser.get(driverInfo.section, 'run_current', '0.800');
            document.getElementById('driver-stealthchop').value = state.parser.get(driverInfo.section, 'stealthchop_threshold', '999999');
            document.getElementById('driver-interpolate').checked = state.parser.get(driverInfo.section, 'interpolate', 'True').toLowerCase() === 'true';

            // hold_current
            const holdCur = state.parser.get(driverInfo.section, 'hold_current', null);
            if (holdCur !== null && holdCur !== '') {
                if (dom.checkEnableHoldCurrent) dom.checkEnableHoldCurrent.checked = true;
                if (dom.groupHoldCurrentField) dom.groupHoldCurrentField.style.display = 'block';
                if (dom.driverHoldCurrent) dom.driverHoldCurrent.value = holdCur;
            } else {
                if (dom.checkEnableHoldCurrent) dom.checkEnableHoldCurrent.checked = false;
                if (dom.groupHoldCurrentField) dom.groupHoldCurrentField.style.display = 'none';
                if (dom.driverHoldCurrent) dom.driverHoldCurrent.value = '0.500';
            }

            // sense_resistor
            const senseRes = state.parser.get(driverInfo.section, 'sense_resistor', null);
            if (senseRes !== null && senseRes !== '') {
                if (dom.checkEnableSenseResistor) dom.checkEnableSenseResistor.checked = true;
                if (dom.groupSenseResistorField) dom.groupSenseResistorField.style.display = 'block';
                if (dom.driverSenseResistor) dom.driverSenseResistor.value = senseRes;
            } else {
                if (dom.checkEnableSenseResistor) dom.checkEnableSenseResistor.checked = false;
                if (dom.groupSenseResistorField) dom.groupSenseResistorField.style.display = 'none';
                if (dom.driverSenseResistor) dom.driverSenseResistor.value = driverInfo.type === 'tmc5160' ? '0.075' : '0.110';
            }

            // Sensorless Homing (StallGuard)
            const diagPin = state.parser.get(driverInfo.section, 'diag_pin', '');
            const sgthrs = state.parser.get(driverInfo.section, 'driver_SGTHRS', state.parser.get(driverInfo.section, 'driver_SGT', ''));
            if (diagPin || sgthrs) {
                if (dom.driverSensorlessEnable) dom.driverSensorlessEnable.checked = true;
                if (dom.sensorlessDetails) dom.sensorlessDetails.style.display = 'block';
                document.getElementById('driver-diag-pin').value = diagPin;
                document.getElementById('driver-sgthrs').value = sgthrs;
            } else {
                if (dom.driverSensorlessEnable) dom.driverSensorlessEnable.checked = false;
                if (dom.sensorlessDetails) dom.sensorlessDetails.style.display = 'none';
                document.getElementById('driver-diag-pin').value = '';
                document.getElementById('driver-sgthrs').value = '';
            }
        }
    }

    function saveCurrentStepperToParser() {
        const s = state.currentStepper;
        const isAuxZ = s === 'stepper_z1' || s === 'stepper_z2' || s === 'stepper_z3';
        const isDualCarriage = s === 'dual_carriage';

        if (isDualCarriage) {
            state.parser.set(s, 'axis', 'x');
        }

        state.parser.set(s, 'step_pin', document.getElementById('stepper-step-pin').value.trim());
        state.parser.set(s, 'dir_pin', document.getElementById('stepper-dir-pin').value.trim());
        state.parser.set(s, 'enable_pin', document.getElementById('stepper-enable-pin').value.trim());
        state.parser.set(s, 'microsteps', document.getElementById('stepper-microsteps').value);
        state.parser.set(s, 'full_steps_per_rotation', document.getElementById('stepper-steps-rotation').value);
        state.parser.set(s, 'rotation_distance', document.getElementById('stepper-rotation-distance').value.trim());

        if (!isAuxZ) {
            state.parser.set(s, 'endstop_pin', document.getElementById('stepper-endstop-pin').value.trim());
        } else {
            state.parser.set(s, 'endstop_pin', null);
            state.parser.set(s, 'position_min', null);
            state.parser.set(s, 'position_max', null);
            state.parser.set(s, 'position_endstop', null);
        }

        // Rimuovi sezioni driver pregresse per questo asse
        for (const d of ['tmc2209', 'tmc2208', 'tmc2226', 'tmc5160', 'tmc2240', 'tmc2130', 'tmc2660']) {
            state.parser.removeSection(`${d} ${s}`);
        }

        const connType = dom.driverConnTypeSelect ? dom.driverConnTypeSelect.value : 'uart';
        let selectedModel = dom.driverModelSelect ? dom.driverModelSelect.value : 'tmc2209';

        if (connType !== 'standalone') {
            if (selectedModel === 'generic') {
                selectedModel = connType === 'spi' ? 'tmc5160' : 'tmc2209';
            }
            const driverSec = `${selectedModel} ${s}`;

            if (connType === 'uart') {
                const uartPin = dom.driverUartPin ? dom.driverUartPin.value.trim() : '';
                state.parser.set(driverSec, 'uart_pin', uartPin || null);
                const txPin = dom.driverTxPin ? dom.driverTxPin.value.trim() : '';
                state.parser.set(driverSec, 'tx_pin', txPin || null);
                const uartAddr = dom.driverUartAddress ? dom.driverUartAddress.value.trim() : '';
                state.parser.set(driverSec, 'uart_address', uartAddr || null);
            } else if (connType === 'spi') {
                const csPin = dom.driverCsPin ? dom.driverCsPin.value.trim() : '';
                state.parser.set(driverSec, 'cs_pin', csPin || null);
                if (dom.driverSpiMode && dom.driverSpiMode.value === 'hardware') {
                    const spiBus = dom.driverSpiBus ? dom.driverSpiBus.value.trim() : '';
                    state.parser.set(driverSec, 'spi_bus', spiBus || null);
                } else {
                    state.parser.set(driverSec, 'spi_software_sclk_pin', dom.driverSpiSclk ? dom.driverSpiSclk.value.trim() || null : null);
                    state.parser.set(driverSec, 'spi_software_mosi_pin', dom.driverSpiMosi ? dom.driverSpiMosi.value.trim() || null : null);
                    state.parser.set(driverSec, 'spi_software_miso_pin', dom.driverSpiMiso ? dom.driverSpiMiso.value.trim() || null : null);
                }
            }

            state.parser.set(driverSec, 'run_current', document.getElementById('driver-run-current').value.trim() || '0.800');
            state.parser.set(driverSec, 'interpolate', document.getElementById('driver-interpolate').checked ? 'True' : 'False');
            state.parser.set(driverSec, 'stealthchop_threshold', document.getElementById('driver-stealthchop').value);

            // hold_current
            if (dom.checkEnableHoldCurrent && dom.checkEnableHoldCurrent.checked && dom.driverHoldCurrent && dom.driverHoldCurrent.value.trim()) {
                state.parser.set(driverSec, 'hold_current', dom.driverHoldCurrent.value.trim());
            } else {
                state.parser.set(driverSec, 'hold_current', null);
            }

            // sense_resistor
            if (dom.checkEnableSenseResistor && dom.checkEnableSenseResistor.checked && dom.driverSenseResistor && dom.driverSenseResistor.value.trim()) {
                state.parser.set(driverSec, 'sense_resistor', dom.driverSenseResistor.value.trim());
            } else {
                state.parser.set(driverSec, 'sense_resistor', null);
            }

            // Sensorless
            if (!isAuxZ && dom.driverSensorlessEnable && dom.driverSensorlessEnable.checked) {
                const diagPin = document.getElementById('driver-diag-pin').value.trim();
                const sgthrs = document.getElementById('driver-sgthrs').value.trim();
                state.parser.set(driverSec, 'diag_pin', diagPin || null);
                if (selectedModel === 'tmc5160' || selectedModel === 'tmc2130') {
                    state.parser.set(driverSec, 'driver_SGT', sgthrs || null);
                    state.parser.set(driverSec, 'driver_SGTHRS', null);
                } else {
                    state.parser.set(driverSec, 'driver_SGTHRS', sgthrs || null);
                    state.parser.set(driverSec, 'driver_SGT', null);
                }
            }
        }
    }

    // -------------------------------------------------------------------------
    // Gestione Extruder e Extruder 1 (IDEX)
    // -------------------------------------------------------------------------
    function loadCurrentExtruderFromParser() {
        const ext = state.currentExtruder;
        dom.extruderCardTitle.textContent = ext === 'extruder1' ? 'Meccanica Secondo Estrusore IDEX' : 'Meccanica Estrusore Principale';
        dom.extruderCardTag.textContent = `[${ext}]`;

        document.getElementById('extruder-step-pin').value = state.parser.get(ext, 'step_pin', '');
        document.getElementById('extruder-dir-pin').value = state.parser.get(ext, 'dir_pin', '');
        document.getElementById('extruder-enable-pin').value = state.parser.get(ext, 'enable_pin', '');
        document.getElementById('extruder-rot-dist').value = state.parser.get(ext, 'rotation_distance', '22.678');
        document.getElementById('extruder-gear-ratio').value = state.parser.get(ext, 'gear_ratio', '');
        document.getElementById('extruder-nozzle-dia').value = state.parser.get(ext, 'nozzle_diameter', '0.400');
        document.getElementById('extruder-filament-dia').value = state.parser.get(ext, 'filament_diameter', '1.750');
        document.getElementById('extruder-pressure-advance').value = state.parser.get(ext, 'pressure_advance', '0.040');

        const extSensorType = state.parser.get(ext, 'sensor_type', 'EPCOS 100K B57560G104F');
        if (dom.extruderSensorType) {
            dom.extruderSensorType.value = extSensorType;
        } else {
            document.getElementById('extruder-sensor-type').value = extSensorType;
        }
        document.getElementById('extruder-heater-pin').value = state.parser.get(ext, 'heater_pin', '');
        document.getElementById('extruder-sensor-pin').value = state.parser.get(ext, 'sensor_pin', '');
        document.getElementById('extruder-min-temp').value = state.parser.get(ext, 'min_temp', '0');
        document.getElementById('extruder-max-temp').value = state.parser.get(ext, 'max_temp', '280');
        document.getElementById('extruder-min-extrude').value = state.parser.get(ext, 'min_extrude_temp', '170');

        // Parametri Sensore SPI
        const extSpiSpeed = state.parser.get(ext, 'spi_speed', '4000000');
        if (dom.extruderSensorSpiSpeed) dom.extruderSensorSpiSpeed.value = extSpiSpeed || '4000000';

        const extSpiBus = state.parser.get(ext, 'spi_bus', '');
        const extSpiSoftSclk = state.parser.get(ext, 'spi_software_sclk_pin', '');
        const extSpiSoftMosi = state.parser.get(ext, 'spi_software_mosi_pin', '');
        const extSpiSoftMiso = state.parser.get(ext, 'spi_software_miso_pin', '');

        if (extSpiSoftSclk || extSpiSoftMosi || extSpiSoftMiso) {
            if (dom.extruderSensorSpiMode) dom.extruderSensorSpiMode.value = 'software';
            if (dom.extruderSensorSpiBus) dom.extruderSensorSpiBus.value = '';
            if (dom.extruderSensorSpiSclk) dom.extruderSensorSpiSclk.value = extSpiSoftSclk;
            if (dom.extruderSensorSpiMosi) dom.extruderSensorSpiMosi.value = extSpiSoftMosi;
            if (dom.extruderSensorSpiMiso) dom.extruderSensorSpiMiso.value = extSpiSoftMiso;
        } else {
            if (dom.extruderSensorSpiMode) dom.extruderSensorSpiMode.value = 'hardware';
            if (dom.extruderSensorSpiBus) dom.extruderSensorSpiBus.value = extSpiBus;
            if (dom.extruderSensorSpiSclk) dom.extruderSensorSpiSclk.value = '';
            if (dom.extruderSensorSpiMosi) dom.extruderSensorSpiMosi.value = '';
            if (dom.extruderSensorSpiMiso) dom.extruderSensorSpiMiso.value = '';
        }

        // Parametri Sensore RTD (MAX31865)
        const extRtdNom = state.parser.get(ext, 'rtd_nominal_r', '100');
        if (dom.extruderRtdNominalR) dom.extruderRtdNominalR.value = extRtdNom;
        const extRtdRef = state.parser.get(ext, 'rtd_reference_r', extRtdNom === '1000' ? '4300' : '430');
        if (dom.extruderRtdReferenceR) dom.extruderRtdReferenceR.value = extRtdRef;
        const extRtdWires = state.parser.get(ext, 'rtd_num_of_wires', '2');
        if (dom.extruderRtdNumWires) dom.extruderRtdNumWires.value = extRtdWires;
        const extRtdFilter = state.parser.get(ext, 'rtd_use_50Hz_filter', 'True');
        if (dom.extruderRtdFilter) dom.extruderRtdFilter.value = (extRtdFilter.toLowerCase() === 'false') ? 'False' : 'True';

        updateExtruderSensorSpiVisibility();

        const extCtrl = state.parser.get(ext, 'control', 'pid');
        if (dom.extruderControlType) dom.extruderControlType.value = extCtrl;
        document.getElementById('extruder-pid-kp').value = state.parser.get(ext, 'pid_Kp', '21.527');
        document.getElementById('extruder-pid-ki').value = state.parser.get(ext, 'pid_Ki', '1.063');
        document.getElementById('extruder-pid-kd').value = state.parser.get(ext, 'pid_Kd', '108.982');
        if (dom.extruderMaxDelta) dom.extruderMaxDelta.value = state.parser.get(ext, 'max_delta', '2.0');
        updateExtruderControlVisibility();

        // Caricamento Driver Estrusore
        const driverInfo = getDriverSectionName(ext);
        const hasDriver = !!(driverInfo.section && state.parser.hasSection(driverInfo.section));

        if (dom.extruderDriverCardTitle) {
            dom.extruderDriverCardTitle.textContent = ext === 'extruder1' ? 'Driver Secondo Estrusore IDEX [extruder1]' : 'Driver Estrusore Principale [extruder]';
        }

        if (!hasDriver) {
            if (dom.extruderDriverCardTag) dom.extruderDriverCardTag.textContent = '[Standalone / Nessun TMC]';
            if (dom.extruderDriverModelSelect) dom.extruderDriverModelSelect.value = 'generic';
            if (dom.extruderDriverConnTypeSelect) dom.extruderDriverConnTypeSelect.value = 'standalone';
            updateExtruderDriverConnVisibility();
        } else {
            if (dom.extruderDriverCardTag) dom.extruderDriverCardTag.textContent = `[${driverInfo.section}]`;
            if (dom.extruderDriverModelSelect) dom.extruderDriverModelSelect.value = driverInfo.type || 'tmc2209';

            const csPin = state.parser.get(driverInfo.section, 'cs_pin', '');
            const spiBus = state.parser.get(driverInfo.section, 'spi_bus', '');
            const spiSoftSclk = state.parser.get(driverInfo.section, 'spi_software_sclk_pin', '');
            const isSpi = !!(csPin || spiBus || spiSoftSclk);

            const connType = isSpi ? 'spi' : 'uart';
            if (dom.extruderDriverConnTypeSelect) dom.extruderDriverConnTypeSelect.value = connType;
            updateExtruderDriverConnVisibility();

            // Campi UART
            if (dom.extruderDriverUartPin) dom.extruderDriverUartPin.value = state.parser.get(driverInfo.section, 'uart_pin', '');
            if (dom.extruderDriverTxPin) dom.extruderDriverTxPin.value = state.parser.get(driverInfo.section, 'tx_pin', '');
            if (dom.extruderDriverUartAddress) dom.extruderDriverUartAddress.value = state.parser.get(driverInfo.section, 'uart_address', '');

            // Campi SPI
            if (dom.extruderDriverCsPin) dom.extruderDriverCsPin.value = csPin;
            if (spiSoftSclk) {
                if (dom.extruderDriverSpiMode) dom.extruderDriverSpiMode.value = 'software';
                if (dom.extruderDriverSpiSclk) dom.extruderDriverSpiSclk.value = spiSoftSclk;
                if (dom.extruderDriverSpiMosi) dom.extruderDriverSpiMosi.value = state.parser.get(driverInfo.section, 'spi_software_mosi_pin', '');
                if (dom.extruderDriverSpiMiso) dom.extruderDriverSpiMiso.value = state.parser.get(driverInfo.section, 'spi_software_miso_pin', '');
                if (dom.extruderDriverSpiBus) dom.extruderDriverSpiBus.value = '';
            } else {
                if (dom.extruderDriverSpiMode) dom.extruderDriverSpiMode.value = 'hardware';
                if (dom.extruderDriverSpiBus) dom.extruderDriverSpiBus.value = spiBus;
                if (dom.extruderDriverSpiSclk) dom.extruderDriverSpiSclk.value = '';
                if (dom.extruderDriverSpiMosi) dom.extruderDriverSpiMosi.value = '';
                if (dom.extruderDriverSpiMiso) dom.extruderDriverSpiMiso.value = '';
            }
            updateExtruderDriverSpiModeVisibility();

            // Operativi
            if (dom.extruderDriverRunCurrent) dom.extruderDriverRunCurrent.value = state.parser.get(driverInfo.section, 'run_current', '0.650');
            if (dom.extruderDriverStealthchop) dom.extruderDriverStealthchop.value = state.parser.get(driverInfo.section, 'stealthchop_threshold', '0');
            if (dom.extruderDriverInterpolate) dom.extruderDriverInterpolate.checked = state.parser.get(driverInfo.section, 'interpolate', 'True').toLowerCase() === 'true';

            // hold_current
            const holdCur = state.parser.get(driverInfo.section, 'hold_current', null);
            if (holdCur !== null && holdCur !== '') {
                if (dom.extruderCheckEnableHoldCurrent) dom.extruderCheckEnableHoldCurrent.checked = true;
                if (dom.extruderGroupHoldCurrentField) dom.extruderGroupHoldCurrentField.style.display = 'block';
                if (dom.extruderDriverHoldCurrent) dom.extruderDriverHoldCurrent.value = holdCur;
            } else {
                if (dom.extruderCheckEnableHoldCurrent) dom.extruderCheckEnableHoldCurrent.checked = false;
                if (dom.extruderGroupHoldCurrentField) dom.extruderGroupHoldCurrentField.style.display = 'none';
                if (dom.extruderDriverHoldCurrent) dom.extruderDriverHoldCurrent.value = '0.400';
            }

            // sense_resistor
            const senseRes = state.parser.get(driverInfo.section, 'sense_resistor', null);
            if (senseRes !== null && senseRes !== '') {
                if (dom.extruderCheckEnableSenseResistor) dom.extruderCheckEnableSenseResistor.checked = true;
                if (dom.extruderGroupSenseResistorField) dom.extruderGroupSenseResistorField.style.display = 'block';
                if (dom.extruderDriverSenseResistor) dom.extruderDriverSenseResistor.value = senseRes;
            } else {
                if (dom.extruderCheckEnableSenseResistor) dom.extruderCheckEnableSenseResistor.checked = false;
                if (dom.extruderGroupSenseResistorField) dom.extruderGroupSenseResistorField.style.display = 'none';
                if (dom.extruderDriverSenseResistor) dom.extruderDriverSenseResistor.value = driverInfo.type === 'tmc5160' ? '0.075' : '0.110';
            }
        }
    }

    function saveCurrentExtruderToParser() {
        const ext = state.currentExtruder;
        state.parser.set(ext, 'step_pin', document.getElementById('extruder-step-pin').value.trim());
        state.parser.set(ext, 'dir_pin', document.getElementById('extruder-dir-pin').value.trim());
        state.parser.set(ext, 'enable_pin', document.getElementById('extruder-enable-pin').value.trim());
        state.parser.set(ext, 'rotation_distance', document.getElementById('extruder-rot-dist').value.trim());
        state.parser.set(ext, 'gear_ratio', document.getElementById('extruder-gear-ratio').value.trim());
        state.parser.set(ext, 'nozzle_diameter', document.getElementById('extruder-nozzle-dia').value.trim());
        state.parser.set(ext, 'filament_diameter', document.getElementById('extruder-filament-dia').value);
        state.parser.set(ext, 'pressure_advance', document.getElementById('extruder-pressure-advance').value.trim());

        const sType = dom.extruderSensorType ? dom.extruderSensorType.value : document.getElementById('extruder-sensor-type').value;
        state.parser.set(ext, 'sensor_type', sType);
        state.parser.set(ext, 'heater_pin', document.getElementById('extruder-heater-pin').value.trim());
        state.parser.set(ext, 'sensor_pin', document.getElementById('extruder-sensor-pin').value.trim());
        state.parser.set(ext, 'min_temp', document.getElementById('extruder-min-temp').value.trim());
        state.parser.set(ext, 'max_temp', document.getElementById('extruder-max-temp').value.trim());
        state.parser.set(ext, 'min_extrude_temp', document.getElementById('extruder-min-extrude').value.trim());

        const isSensorSpi = isSpiSensorType(sType);
        if (isSensorSpi) {
            const speed = dom.extruderSensorSpiSpeed ? dom.extruderSensorSpiSpeed.value.trim() : '';
            state.parser.set(ext, 'spi_speed', speed || '4000000');

            const isSoft = dom.extruderSensorSpiMode && dom.extruderSensorSpiMode.value === 'software';
            if (isSoft) {
                state.parser.set(ext, 'spi_bus', null);
                state.parser.set(ext, 'spi_software_sclk_pin', dom.extruderSensorSpiSclk ? dom.extruderSensorSpiSclk.value.trim() || null : null);
                state.parser.set(ext, 'spi_software_mosi_pin', dom.extruderSensorSpiMosi ? dom.extruderSensorSpiMosi.value.trim() || null : null);
                state.parser.set(ext, 'spi_software_miso_pin', dom.extruderSensorSpiMiso ? dom.extruderSensorSpiMiso.value.trim() || null : null);
            } else {
                const bus = dom.extruderSensorSpiBus ? dom.extruderSensorSpiBus.value.trim() : '';
                state.parser.set(ext, 'spi_bus', bus || null);
                state.parser.set(ext, 'spi_software_sclk_pin', null);
                state.parser.set(ext, 'spi_software_mosi_pin', null);
                state.parser.set(ext, 'spi_software_miso_pin', null);
            }

            if (sType === 'MAX31865') {
                const nomR = dom.extruderRtdNominalR ? dom.extruderRtdNominalR.value : '100';
                state.parser.set(ext, 'rtd_nominal_r', nomR || '100');
                const refR = dom.extruderRtdReferenceR ? dom.extruderRtdReferenceR.value.trim() : '430';
                state.parser.set(ext, 'rtd_reference_r', refR || (nomR === '1000' ? '4300' : '430'));
                const wires = dom.extruderRtdNumWires ? dom.extruderRtdNumWires.value : '2';
                state.parser.set(ext, 'rtd_num_of_wires', wires || '2');
                const filter = dom.extruderRtdFilter ? dom.extruderRtdFilter.value : 'True';
                state.parser.set(ext, 'rtd_use_50Hz_filter', filter || 'True');
            } else {
                state.parser.set(ext, 'rtd_nominal_r', null);
                state.parser.set(ext, 'rtd_reference_r', null);
                state.parser.set(ext, 'rtd_num_of_wires', null);
                state.parser.set(ext, 'rtd_use_50Hz_filter', null);
            }
        } else {
            state.parser.set(ext, 'spi_speed', null);
            state.parser.set(ext, 'spi_bus', null);
            state.parser.set(ext, 'spi_software_sclk_pin', null);
            state.parser.set(ext, 'spi_software_mosi_pin', null);
            state.parser.set(ext, 'spi_software_miso_pin', null);
            state.parser.set(ext, 'rtd_nominal_r', null);
            state.parser.set(ext, 'rtd_reference_r', null);
            state.parser.set(ext, 'rtd_num_of_wires', null);
            state.parser.set(ext, 'rtd_use_50Hz_filter', null);
        }

        const ctrlType = dom.extruderControlType ? dom.extruderControlType.value : 'pid';
        state.parser.set(ext, 'control', ctrlType);
        if (ctrlType === 'pid') {
            const kp = document.getElementById('extruder-pid-kp').value.trim();
            const ki = document.getElementById('extruder-pid-ki').value.trim();
            const kd = document.getElementById('extruder-pid-kd').value.trim();
            state.parser.set(ext, 'pid_Kp', kp || '21.527');
            state.parser.set(ext, 'pid_Ki', ki || '1.063');
            state.parser.set(ext, 'pid_Kd', kd || '108.982');
            state.parser.set(ext, 'max_delta', null);
        } else {
            state.parser.set(ext, 'pid_Kp', null);
            state.parser.set(ext, 'pid_Ki', null);
            state.parser.set(ext, 'pid_Kd', null);
            const mDelta = dom.extruderMaxDelta ? dom.extruderMaxDelta.value.trim() : '2.0';
            state.parser.set(ext, 'max_delta', mDelta || '2.0');
        }

        // Pulisci sezioni driver pregresse per questo estrusore
        for (const d of ['tmc2209', 'tmc2208', 'tmc2226', 'tmc5160', 'tmc2240', 'tmc2130', 'tmc2660']) {
            state.parser.removeSection(`${d} ${ext}`);
        }

        const connType = dom.extruderDriverConnTypeSelect ? dom.extruderDriverConnTypeSelect.value : 'uart';
        let selectedModel = dom.extruderDriverModelSelect ? dom.extruderDriverModelSelect.value : 'tmc2209';

        if (connType !== 'standalone') {
            if (selectedModel === 'generic') {
                selectedModel = connType === 'spi' ? 'tmc5160' : 'tmc2209';
            }
            const driverSec = `${selectedModel} ${ext}`;

            if (connType === 'uart') {
                const uartPin = dom.extruderDriverUartPin ? dom.extruderDriverUartPin.value.trim() : '';
                state.parser.set(driverSec, 'uart_pin', uartPin || null);
                const txPin = dom.extruderDriverTxPin ? dom.extruderDriverTxPin.value.trim() : '';
                state.parser.set(driverSec, 'tx_pin', txPin || null);
                const uartAddr = dom.extruderDriverUartAddress ? dom.extruderDriverUartAddress.value.trim() : '';
                state.parser.set(driverSec, 'uart_address', uartAddr || null);
            } else if (connType === 'spi') {
                const csPin = dom.extruderDriverCsPin ? dom.extruderDriverCsPin.value.trim() : '';
                state.parser.set(driverSec, 'cs_pin', csPin || null);
                if (dom.extruderDriverSpiMode && dom.extruderDriverSpiMode.value === 'hardware') {
                    const spiBus = dom.extruderDriverSpiBus ? dom.extruderDriverSpiBus.value.trim() : '';
                    state.parser.set(driverSec, 'spi_bus', spiBus || null);
                } else {
                    state.parser.set(driverSec, 'spi_software_sclk_pin', dom.extruderDriverSpiSclk ? dom.extruderDriverSpiSclk.value.trim() || null : null);
                    state.parser.set(driverSec, 'spi_software_mosi_pin', dom.extruderDriverSpiMosi ? dom.extruderDriverSpiMosi.value.trim() || null : null);
                    state.parser.set(driverSec, 'spi_software_miso_pin', dom.extruderDriverSpiMiso ? dom.extruderDriverSpiMiso.value.trim() || null : null);
                }
            }

            const runCur = dom.extruderDriverRunCurrent ? dom.extruderDriverRunCurrent.value.trim() : '0.650';
            state.parser.set(driverSec, 'run_current', runCur || '0.650');
            state.parser.set(driverSec, 'interpolate', (dom.extruderDriverInterpolate && dom.extruderDriverInterpolate.checked) ? 'True' : 'False');
            state.parser.set(driverSec, 'stealthchop_threshold', dom.extruderDriverStealthchop ? dom.extruderDriverStealthchop.value : '0');

            // hold_current
            if (dom.extruderCheckEnableHoldCurrent && dom.extruderCheckEnableHoldCurrent.checked && dom.extruderDriverHoldCurrent && dom.extruderDriverHoldCurrent.value.trim()) {
                state.parser.set(driverSec, 'hold_current', dom.extruderDriverHoldCurrent.value.trim());
            } else {
                state.parser.set(driverSec, 'hold_current', null);
            }

            // sense_resistor
            if (dom.extruderCheckEnableSenseResistor && dom.extruderCheckEnableSenseResistor.checked && dom.extruderDriverSenseResistor && dom.extruderDriverSenseResistor.value.trim()) {
                state.parser.set(driverSec, 'sense_resistor', dom.extruderDriverSenseResistor.value.trim());
            } else {
                state.parser.set(driverSec, 'sense_resistor', null);
            }
        }
    }

    // -------------------------------------------------------------------------
    // Helper Homing Parameters (0 per disabilitare / omettere)
    // -------------------------------------------------------------------------
    function applyHomingParam(section, key, valStr) {
        const val = parseFloat(valStr) || 0;
        if (val > 0) {
            state.parser.set(section, key, String(val));
        } else {
            state.parser.set(section, key, null);
        }
    }

    function readHomingParam(section, key) {
        const val = state.parser.get(section, key, '');
        if (!val || parseFloat(val) <= 0) return '0';
        return val;
    }

    // -------------------------------------------------------------------------
    // Gestione Macro
    // -------------------------------------------------------------------------
    function renderMacroList() {
        dom.macroListContainer.innerHTML = '';
        if (state.macros.length === 0) {
            dom.macroListContainer.innerHTML = `
                <div style="text-align: center; padding: 2.5rem; background: var(--bg-card); border-radius: var(--radius-md); border: 1px dashed var(--border-color);">
                    <p style="color: var(--text-secondary); margin-bottom: 1rem;">Nessuna macro [gcode_macro] presente nel file di configurazione.</p>
                    <button class="btn btn-secondary btn-sm" id="btn-empty-insert-template">Inserisci Template Macro Essenziali (START_PRINT, END_PRINT, CANCEL)</button>
                </div>
            `;
            const btnInsert = document.getElementById('btn-empty-insert-template');
            if (btnInsert) btnInsert.addEventListener('click', insertMacroTemplates);
            return;
        }

        state.macros.forEach((macro, index) => {
            const card = document.createElement('div');
            card.className = 'macro-card';
            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span style="font-weight: 700; color: var(--primary-light);">[gcode_macro ${macro.name}]</span>
                    </div>
                    <div style="display: flex; gap: 0.4rem;">
                        <button class="btn btn-danger btn-sm btn-delete-macro" data-index="${index}" title="Elimina Macro">Elimina</button>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Descrizione:</label>
                    <input type="text" class="form-control macro-desc-input" data-index="${index}" value="${macro.description || ''}" placeholder="Spiegazione dell'azione eseguita">
                </div>
                <div class="form-group">
                    <label class="form-label">Codice G-Code / Jinja2:</label>
                    <textarea class="form-control macro-gcode-input" data-index="${index}" style="min-height: 120px;">${macro.gcode || ''}</textarea>
                </div>
            `;
            dom.macroListContainer.appendChild(card);
        });

        dom.macroListContainer.querySelectorAll('.macro-desc-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const idx = parseInt(e.target.dataset.index, 10);
                state.macros[idx].description = e.target.value;
            });
        });

        dom.macroListContainer.querySelectorAll('.macro-gcode-input').forEach(textarea => {
            textarea.addEventListener('input', (e) => {
                const idx = parseInt(e.target.dataset.index, 10);
                state.macros[idx].gcode = e.target.value;
            });
        });

        dom.macroListContainer.querySelectorAll('.btn-delete-macro').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.dataset.index, 10);
                const removedName = state.macros[idx].name;
                state.macros.splice(idx, 1);
                state.parser.removeSection(`gcode_macro ${removedName}`);
                renderMacroList();
                showToast(`Macro "${removedName}" rimossa`, 'info');
            });
        });
    }

    function insertMacroTemplates() {
        const templates = KLIPPER_CONSTANTS.MACRO_TEMPLATES;
        let count = 0;
        for (const [name, tpl] of Object.entries(templates)) {
            const exists = state.macros.find(m => m.name.toUpperCase() === name.toUpperCase());
            if (!exists) {
                const lines = tpl.gcode.split('\n');
                const gcodeLines = [];
                let inGcode = false;
                for (const l of lines) {
                    if (l.trim().startsWith('gcode:')) {
                        inGcode = true;
                        continue;
                    }
                    if (inGcode) {
                        gcodeLines.push(l.replace(/^\s{4}/, ''));
                    }
                }

                state.macros.push({
                    name: name,
                    description: tpl.description,
                    rename_existing: name === 'CANCEL_PRINT' ? 'BASE_CANCEL_PRINT' : (name === 'PAUSE' ? 'BASE_PAUSE' : (name === 'RESUME' ? 'BASE_RESUME' : '')),
                    gcode: gcodeLines.join('\n')
                });
                count++;
            }
        }
        renderMacroList();
        showToast(`${count} macro template inserite`, 'success');
    }

    dom.btnAddMacro.addEventListener('click', () => {
        const name = prompt('Nome della nuova Macro (es: PURGE_NOZZLE, M600):');
        if (!name) return;
        const cleanName = name.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_');
        if (state.macros.find(m => m.name === cleanName)) {
            showToast(`La macro ${cleanName} esiste già!`, 'warning');
            return;
        }
        state.macros.push({
            name: cleanName,
            description: '',
            rename_existing: '',
            gcode: '; Comandi G-Code\nG90\nG28'
        });
        renderMacroList();
        showToast(`Macro ${cleanName} creata`, 'success');
    });

    dom.btnInsertMacroTemplate.addEventListener('click', () => {
        insertMacroTemplates();
        checkDirtyState();
    });

    // -------------------------------------------------------------------------
    // Rilevamento e Evidenziazione Modifiche (Dirty State Tracking)
    // -------------------------------------------------------------------------
    function updateFieldBadge(el, isModified) {
        if (!el) return;
        const formGroup = el.closest('.form-group') || el.closest('.form-row') || el.parentElement;
        if (!formGroup) return;

        let label = formGroup.querySelector('.form-label');
        if (!label) {
            const lbl = formGroup.querySelector('label');
            if (lbl && !lbl.classList.contains('checkbox-inline')) label = lbl;
        }

        if (label) {
            let badge = label.querySelector('.modified-badge');
            if (isModified) {
                if (!badge) {
                    badge = document.createElement('span');
                    badge.className = 'modified-badge';
                    badge.title = 'Parametro modificato';
                    label.appendChild(badge);
                }
            } else {
                if (badge) badge.remove();
            }
        }

        if (el.type === 'checkbox') {
            const checkInline = el.closest('.checkbox-inline');
            if (checkInline) {
                checkInline.classList.toggle('is-modified', isModified);
            }
        }
    }

    function clearAllModifiedIndicators() {
        document.querySelectorAll('.is-modified').forEach(el => el.classList.remove('is-modified'));
        document.querySelectorAll('.modified-badge').forEach(b => b.remove());
        document.querySelectorAll('.has-modified').forEach(el => el.classList.remove('has-modified'));
        if (dom.unsavedChangesPill) dom.unsavedChangesPill.style.display = 'none';
        if (dom.btnSave) dom.btnSave.classList.remove('btn-warning-glow');
    }

    function takeFullUiSnapshot() {
        saveCurrentStepperToParser();
        saveCurrentExtruderToParser();
        syncExtraMcusFromDom();
        syncExtraFansFromDom();
        syncLedsFromDom();
        syncIncludesFromDom();

        const snap = {
            fields: {},
            steppers: {},
            extruders: {},
            extraMcus: JSON.stringify(state.extraMcus),
            extraFans: JSON.stringify(state.extraFans),
            leds: JSON.stringify(state.leds),
            includes: JSON.stringify(state.includes),
            macros: JSON.stringify(state.macros)
        };

        document.querySelectorAll('input[id], select[id], textarea[id]').forEach(el => {
            if (el.id.startsWith('stepper-') || el.id.startsWith('driver-') || el.id.startsWith('extruder-') || el.id.startsWith('check-enable-hold-current') || el.id.startsWith('check-enable-sense-resistor') || el.id.startsWith('check-invert-')) {
                return;
            }
            snap.fields[el.id] = el.type === 'checkbox' ? el.checked : el.value;
        });

        for (const st of ['stepper_x', 'dual_carriage', 'stepper_y', 'stepper_z', 'stepper_z1', 'stepper_z2', 'stepper_z3']) {
            if (state.parser.sections[st]) {
                snap.steppers[st] = { ...state.parser.sections[st].params };
            }
            for (const drv of ['tmc2209', 'tmc2208', 'tmc2226', 'tmc5160', 'tmc2240', 'tmc2130', 'tmc2660']) {
                const sec = `${drv} ${st}`;
                if (state.parser.sections[sec]) {
                    snap.steppers[sec] = { ...state.parser.sections[sec].params };
                }
            }
        }

        for (const ext of ['extruder', 'extruder1']) {
            if (state.parser.sections[ext]) {
                snap.extruders[ext] = { ...state.parser.sections[ext].params };
            }
            for (const drv of ['tmc2209', 'tmc2208', 'tmc2226', 'tmc5160', 'tmc2240', 'tmc2130', 'tmc2660']) {
                const sec = `${drv} ${ext}`;
                if (state.parser.sections[sec]) {
                    snap.extruders[sec] = { ...state.parser.sections[sec].params };
                }
            }
        }

        return snap;
    }

    function checkDirtyState() {
        if (!state.baselineSnapshot) return;
        const snap = state.baselineSnapshot;

        saveCurrentStepperToParser();
        saveCurrentExtruderToParser();
        syncExtraMcusFromDom();
        syncExtraFansFromDom();
        syncLedsFromDom();
        syncIncludesFromDom();

        let totalModifiedCount = 0;
        const tabModified = {};

        // 1. Campi statici con ID
        for (const [id, originalVal] of Object.entries(snap.fields)) {
            const el = document.getElementById(id);
            if (!el) continue;
            const currentVal = el.type === 'checkbox' ? el.checked : el.value;
            const isMod = currentVal !== originalVal;
            if (isMod) {
                el.classList.add('is-modified');
                totalModifiedCount++;
                const pane = el.closest('.tab-pane');
                if (pane) tabModified[pane.id] = true;
                updateFieldBadge(el, true);
            } else {
                el.classList.remove('is-modified');
                updateFieldBadge(el, false);
            }
        }

        // 2. Campi Stepper e Driver TMC attivi
        const currentStepperName = state.currentStepper;
        const currentDriverInfo = getDriverSectionName(currentStepperName);
        const origStepperParams = snap.steppers[currentStepperName] || {};
        const currStepperParams = state.parser.sections[currentStepperName]?.params || {};
        const origDrvParams = (currentDriverInfo && currentDriverInfo.section ? snap.steppers[currentDriverInfo.section] : null) || {};
        const currDrvParams = (currentDriverInfo && currentDriverInfo.section ? state.parser.sections[currentDriverInfo.section]?.params : null) || {};

        const checkStepperField = (id, paramKey, isDriver = false, isBool = false) => {
            const el = document.getElementById(id);
            if (!el) return;
            const orig = isDriver ? (origDrvParams[paramKey] || '') : (origStepperParams[paramKey] || '');
            const curr = isDriver ? (currDrvParams[paramKey] || '') : (currStepperParams[paramKey] || '');
            let isMod = false;
            if (isBool) {
                isMod = (orig.toLowerCase() === 'true') !== el.checked;
            } else {
                isMod = orig.trim() !== curr.trim();
            }
            if (isMod) {
                el.classList.add('is-modified');
                updateFieldBadge(el, true);
            } else {
                el.classList.remove('is-modified');
                updateFieldBadge(el, false);
            }
        };

        checkStepperField('stepper-step-pin', 'step_pin');
        checkStepperField('stepper-dir-pin', 'dir_pin');
        checkStepperField('stepper-enable-pin', 'enable_pin');
        checkStepperField('stepper-microsteps', 'microsteps');
        checkStepperField('stepper-steps-rotation', 'full_steps_per_rotation');
        checkStepperField('stepper-rotation-distance', 'rotation_distance');
        checkStepperField('stepper-endstop-pin', 'endstop_pin');

        // Driver pins & parametri
        checkStepperField('driver-uart-pin', 'uart_pin', true);
        checkStepperField('driver-tx-pin', 'tx_pin', true);
        checkStepperField('driver-uart-address', 'uart_address', true);
        checkStepperField('driver-cs-pin', 'cs_pin', true);
        checkStepperField('driver-spi-bus', 'spi_bus', true);
        checkStepperField('driver-spi-sclk', 'spi_software_sclk_pin', true);
        checkStepperField('driver-spi-mosi', 'spi_software_mosi_pin', true);
        checkStepperField('driver-spi-miso', 'spi_software_miso_pin', true);
        checkStepperField('driver-run-current', 'run_current', true);
        checkStepperField('driver-hold-current', 'hold_current', true);
        checkStepperField('driver-sense-resistor', 'sense_resistor', true);
        checkStepperField('driver-stealthchop', 'stealthchop_threshold', true);
        checkStepperField('driver-interpolate', 'interpolate', true, true);
        checkStepperField('driver-diag-pin', 'diag_pin', true);
        checkStepperField('driver-sgthrs', (currentDriverInfo?.type === 'tmc5160' || currentDriverInfo?.type === 'tmc2130') ? 'driver_SGT' : 'driver_SGTHRS', true);

        if (dom.checkEnableHoldCurrent) {
            const origHadHold = !!origDrvParams['hold_current'];
            const currHasHold = dom.checkEnableHoldCurrent.checked;
            const isMod = origHadHold !== currHasHold;
            dom.checkEnableHoldCurrent.classList.toggle('is-modified', isMod);
            updateFieldBadge(dom.checkEnableHoldCurrent, isMod);
        }

        if (dom.checkEnableSenseResistor) {
            const origHadSense = !!origDrvParams['sense_resistor'];
            const currHasSense = dom.checkEnableSenseResistor.checked;
            const isMod = origHadSense !== currHasSense;
            dom.checkEnableSenseResistor.classList.toggle('is-modified', isMod);
            updateFieldBadge(dom.checkEnableSenseResistor, isMod);
        }

        // Controllo generale di ciascun subtab Stepper
        for (const st of ['stepper_x', 'dual_carriage', 'stepper_y', 'stepper_z', 'stepper_z1', 'stepper_z2', 'stepper_z3']) {
            let stMod = false;
            const origSt = snap.steppers[st] || {};
            const currSt = state.parser.sections[st]?.params || {};
            const keysSt = new Set([...Object.keys(origSt), ...Object.keys(currSt)]);
            for (const k of keysSt) {
                if ((origSt[k] || '').trim() !== (currSt[k] || '').trim()) {
                    stMod = true;
                    break;
                }
            }
            if (!stMod) {
                for (const drv of ['tmc2209', 'tmc2208', 'tmc2226', 'tmc5160', 'tmc2240', 'tmc2130', 'tmc2660']) {
                    const sec = `${drv} ${st}`;
                    const origD = snap.steppers[sec] || {};
                    const currD = state.parser.sections[sec]?.params || {};
                    const keysD = new Set([...Object.keys(origD), ...Object.keys(currD)]);
                    for (const k of keysD) {
                        if ((origD[k] || '').trim() !== (currD[k] || '').trim()) {
                            stMod = true;
                            break;
                        }
                    }
                    if (stMod) break;
                }
            }
            const btn = document.querySelector(`#stepper-subtabs-container .subtab-btn[data-stepper="${st}"]`);
            if (btn) btn.classList.toggle('has-modified', stMod);
            if (stMod) {
                totalModifiedCount++;
                tabModified['tab-stepper'] = true;
            }
        }

        // 3. Campi Extruder attivi
        const currentExtruderName = state.currentExtruder;
        const currentExtDrvInfo = getDriverSectionName(currentExtruderName);
        const origExtParams = snap.extruders[currentExtruderName] || {};
        const currExtParams = state.parser.sections[currentExtruderName]?.params || {};
        const origExtDrvParams = (currentExtDrvInfo && currentExtDrvInfo.section ? snap.extruders[currentExtDrvInfo.section] : null) || {};
        const currExtDrvParams = (currentExtDrvInfo && currentExtDrvInfo.section ? state.parser.sections[currentExtDrvInfo.section]?.params : null) || {};

        const checkExtField = (id, paramKey, isDriver = false, isBool = false) => {
            const el = document.getElementById(id);
            if (!el) return;
            const orig = isDriver ? (origExtDrvParams[paramKey] || '') : (origExtParams[paramKey] || '');
            const curr = isDriver ? (currExtDrvParams[paramKey] || '') : (currExtParams[paramKey] || '');
            let isMod = false;
            if (isBool) {
                isMod = (orig.toLowerCase() === 'true') !== el.checked;
            } else {
                isMod = orig.trim() !== curr.trim();
            }
            if (isMod) {
                el.classList.add('is-modified');
                updateFieldBadge(el, true);
            } else {
                el.classList.remove('is-modified');
                updateFieldBadge(el, false);
            }
        };

        checkExtField('extruder-step-pin', 'step_pin');
        checkExtField('extruder-dir-pin', 'dir_pin');
        checkExtField('extruder-enable-pin', 'enable_pin');
        checkExtField('extruder-rot-dist', 'rotation_distance');
        checkExtField('extruder-gear-ratio', 'gear_ratio');
        checkExtField('extruder-nozzle-dia', 'nozzle_diameter');
        checkExtField('extruder-filament-dia', 'filament_diameter');
        checkExtField('extruder-heater-pin', 'heater_pin');
        checkExtField('extruder-sensor-type', 'sensor_type');
        checkExtField('extruder-sensor-pin', 'sensor_pin');
        checkExtField('extruder-min-temp', 'min_temp');
        checkExtField('extruder-max-temp', 'max_temp');
        checkExtField('extruder-min-extrude', 'min_extrude_temp');
        checkExtField('extruder-pid-kp', 'pid_Kp');
        checkExtField('extruder-pid-ki', 'pid_Ki');
        checkExtField('extruder-pid-kd', 'pid_Kd');
        checkExtField('extruder-control-type', 'control');
        checkExtField('extruder-max-delta', 'max_delta');
        checkExtField('extruder-pressure-advance', 'pressure_advance');

        // Parametri Sensore SPI & RTD per Estrusore
        checkExtField('extruder-sensor-spi-speed', 'spi_speed');
        checkExtField('extruder-sensor-spi-bus', 'spi_bus');
        checkExtField('extruder-sensor-spi-sclk', 'spi_software_sclk_pin');
        checkExtField('extruder-sensor-spi-mosi', 'spi_software_mosi_pin');
        checkExtField('extruder-sensor-spi-miso', 'spi_software_miso_pin');
        checkExtField('extruder-rtd-nominal-r', 'rtd_nominal_r');
        checkExtField('extruder-rtd-reference-r', 'rtd_reference_r');
        checkExtField('extruder-rtd-num-wires', 'rtd_num_of_wires');
        checkExtField('extruder-rtd-filter', 'rtd_use_50Hz_filter');

        if (dom.extruderSensorSpiMode) {
            const origHadSoft = !!(origExtParams['spi_software_sclk_pin'] || origExtParams['spi_software_mosi_pin']);
            const currSoft = dom.extruderSensorSpiMode.value === 'software';
            const isMod = origHadSoft !== currSoft;
            dom.extruderSensorSpiMode.classList.toggle('is-modified', isMod);
            updateFieldBadge(dom.extruderSensorSpiMode, isMod);
        }

        // Driver pins & parametri per Estrusore
        checkExtField('extruder-driver-uart-pin', 'uart_pin', true);
        checkExtField('extruder-driver-tx-pin', 'tx_pin', true);
        checkExtField('extruder-driver-uart-address', 'uart_address', true);
        checkExtField('extruder-driver-cs-pin', 'cs_pin', true);
        checkExtField('extruder-driver-spi-bus', 'spi_bus', true);
        checkExtField('extruder-driver-spi-sclk', 'spi_software_sclk_pin', true);
        checkExtField('extruder-driver-spi-mosi', 'spi_software_mosi_pin', true);
        checkExtField('extruder-driver-spi-miso', 'spi_software_miso_pin', true);
        checkExtField('extruder-driver-run-current', 'run_current', true);
        checkExtField('extruder-driver-hold-current', 'hold_current', true);
        checkExtField('extruder-driver-sense-resistor', 'sense_resistor', true);
        checkExtField('extruder-driver-stealthchop', 'stealthchop_threshold', true);
        checkExtField('extruder-driver-interpolate', 'interpolate', true, true);

        if (dom.extruderCheckEnableHoldCurrent) {
            const origHadHold = !!origExtDrvParams['hold_current'];
            const currHasHold = dom.extruderCheckEnableHoldCurrent.checked;
            const isMod = origHadHold !== currHasHold;
            dom.extruderCheckEnableHoldCurrent.classList.toggle('is-modified', isMod);
            updateFieldBadge(dom.extruderCheckEnableHoldCurrent, isMod);
        }

        if (dom.extruderCheckEnableSenseResistor) {
            const origHadSense = !!origExtDrvParams['sense_resistor'];
            const currHasSense = dom.extruderCheckEnableSenseResistor.checked;
            const isMod = origHadSense !== currHasSense;
            dom.extruderCheckEnableSenseResistor.classList.toggle('is-modified', isMod);
            updateFieldBadge(dom.extruderCheckEnableSenseResistor, isMod);
        }

        // Controllo generale subtab Extruder
        for (const ext of ['extruder', 'extruder1']) {
            let extMod = false;
            const origE = snap.extruders[ext] || {};
            const currE = state.parser.sections[ext]?.params || {};
            const keysE = new Set([...Object.keys(origE), ...Object.keys(currE)]);
            for (const k of keysE) {
                if ((origE[k] || '').trim() !== (currE[k] || '').trim()) {
                    extMod = true;
                    break;
                }
            }
            if (!extMod) {
                for (const drv of ['tmc2209', 'tmc2208', 'tmc2226', 'tmc5160', 'tmc2240', 'tmc2130', 'tmc2660']) {
                    const sec = `${drv} ${ext}`;
                    const origD = snap.extruders[sec] || {};
                    const currD = state.parser.sections[sec]?.params || {};
                    const keysD = new Set([...Object.keys(origD), ...Object.keys(currD)]);
                    for (const k of keysD) {
                        if ((origD[k] || '').trim() !== (currD[k] || '').trim()) {
                            extMod = true;
                            break;
                        }
                    }
                    if (extMod) break;
                }
            }
            const btn = document.querySelector(`#extruder-subtabs-container .subtab-btn[data-extruder="${ext}"]`);
            if (btn) btn.classList.toggle('has-modified', extMod);
            if (extMod) {
                totalModifiedCount++;
                tabModified['tab-extruder'] = true;
            }
        }

        // 4. Extra MCUs
        if (JSON.stringify(state.extraMcus) !== snap.extraMcus) {
            totalModifiedCount++;
            tabModified['tab-host-mcu'] = true;
        }

        // 5. Extra Fans
        if (JSON.stringify(state.extraFans) !== snap.extraFans) {
            totalModifiedCount++;
            tabModified['tab-misc'] = true;
        }

        // 6. LEDs
        if (JSON.stringify(state.leds) !== snap.leds) {
            totalModifiedCount++;
            tabModified['tab-misc'] = true;
        }

        // 7. Includes
        if (JSON.stringify(state.includes) !== snap.includes) {
            totalModifiedCount++;
            tabModified['tab-include'] = true;
        }

        // 8. Macro
        if (JSON.stringify(state.macros) !== snap.macros) {
            totalModifiedCount++;
            tabModified['tab-macro'] = true;
        }

        // 6. Aggiorna indicatori sui Tab principali
        dom.tabButtons.forEach(btn => {
            const target = btn.getAttribute('data-tab');
            btn.classList.toggle('has-modified', !!tabModified[target]);
        });

        // 7. Pill di notifica modifiche non salvate nella navbar
        if (dom.unsavedChangesPill && dom.unsavedChangesText) {
            if (totalModifiedCount > 0) {
                dom.unsavedChangesPill.style.display = 'inline-flex';
                dom.unsavedChangesText.textContent = totalModifiedCount === 1 ? '1 modifica non salvata' : `${totalModifiedCount} modifiche non salvate`;
            } else {
                dom.unsavedChangesPill.style.display = 'none';
            }
        }

        // 8. Tasto Salva evidenziato
        if (dom.btnSave) {
            dom.btnSave.classList.toggle('btn-warning-glow', totalModifiedCount > 0);
            dom.btnSave.title = totalModifiedCount > 0 ? `Salva modifiche (${totalModifiedCount} non salvate)` : 'Salva modifiche su Moonraker';
        }
    }

    // -------------------------------------------------------------------------
    // Sincronizzazione Completa: Parser -> UI
    // -------------------------------------------------------------------------
    function populateUiFromParser() {
        const p = state.parser;

        // 1. CINEMATICA & PARAMETRI STAMPANTE UNIFICATI [printer]
        dom.printerKinematics.value = p.get('printer', 'kinematics', 'cartesian');
        document.getElementById('printer-max-velocity').value = p.get('printer', 'max_velocity', '300');
        document.getElementById('printer-max-accel').value = p.get('printer', 'max_accel', '3000');
        document.getElementById('printer-cruise-ratio').value = p.get('printer', 'minimum_cruise_ratio', '0.5');
        document.getElementById('printer-square-corner').value = p.get('printer', 'square_corner_velocity', '5.0');
        document.getElementById('printer-max-z-velocity').value = p.get('printer', 'max_z_velocity', '15');
        document.getElementById('printer-max-z-accel').value = p.get('printer', 'max_z_accel', '100');
        document.getElementById('printer-max-accel-to-decel').value = p.get('printer', 'max_accel_to_decel', '');
        dom.printerKinematics.dispatchEvent(new Event('change'));

        // Rilevamento IDEX
        const hasDualCarriage = p.hasSection('dual_carriage') || p.hasSection('extruder1');
        dom.checkEnableIdex.checked = hasDualCarriage;
        updateIdexVisibility();

        // Rilevamento Multi-Asse Z
        let zCount = 1;
        if (p.hasSection('stepper_z3')) zCount = 4;
        else if (p.hasSection('stepper_z2')) zCount = 3;
        else if (p.hasSection('stepper_z1')) zCount = 2;
        dom.selectZMotorCount.value = String(zCount);
        updateMultiZVisibility();

        // Limiti & Homing Asse X
        document.getElementById('x-pos-min').value = p.get('stepper_x', 'position_min', '0');
        document.getElementById('x-pos-max').value = p.get('stepper_x', 'position_max', '235');
        document.getElementById('x-pos-endstop').value = p.get('stepper_x', 'position_endstop', '0');
        document.getElementById('x-homing-speed').value = readHomingParam('stepper_x', 'homing_speed');
        document.getElementById('x-homing-retract-dist').value = readHomingParam('stepper_x', 'homing_retract_dist');
        document.getElementById('x-homing-retract-speed').value = readHomingParam('stepper_x', 'homing_retract_speed') || readHomingParam('stepper_x', 'second_homing_speed');

        // Limiti & Homing Dual Carriage X2
        document.getElementById('dc-pos-min').value = p.get('dual_carriage', 'position_min', '0');
        document.getElementById('dc-pos-max').value = p.get('dual_carriage', 'position_max', '300');
        document.getElementById('dc-pos-endstop').value = p.get('dual_carriage', 'position_endstop', '300');
        document.getElementById('dc-homing-speed').value = readHomingParam('dual_carriage', 'homing_speed');
        document.getElementById('dc-homing-retract-dist').value = readHomingParam('dual_carriage', 'homing_retract_dist');
        document.getElementById('dc-homing-retract-speed').value = readHomingParam('dual_carriage', 'homing_retract_speed') || readHomingParam('dual_carriage', 'second_homing_speed');

        // Limiti & Homing Asse Y
        document.getElementById('y-pos-min').value = p.get('stepper_y', 'position_min', '0');
        document.getElementById('y-pos-max').value = p.get('stepper_y', 'position_max', '235');
        document.getElementById('y-pos-endstop').value = p.get('stepper_y', 'position_endstop', '0');
        document.getElementById('y-homing-speed').value = readHomingParam('stepper_y', 'homing_speed');
        document.getElementById('y-homing-retract-dist').value = readHomingParam('stepper_y', 'homing_retract_dist');
        document.getElementById('y-homing-retract-speed').value = readHomingParam('stepper_y', 'homing_retract_speed') || readHomingParam('stepper_y', 'second_homing_speed');

        // Limiti & Homing Asse Z
        document.getElementById('z-pos-min').value = p.get('stepper_z', 'position_min', '-2.0');
        document.getElementById('z-pos-max').value = p.get('stepper_z', 'position_max', '250');
        document.getElementById('z-pos-endstop').value = p.get('stepper_z', 'position_endstop', '0.0');
        document.getElementById('z-homing-speed').value = readHomingParam('stepper_z', 'homing_speed');
        document.getElementById('z-homing-retract-dist').value = readHomingParam('stepper_z', 'homing_retract_dist');
        document.getElementById('z-homing-retract-speed').value = readHomingParam('stepper_z', 'homing_retract_speed') || readHomingParam('stepper_z', 'second_homing_speed');

        // Parametri Delta
        document.getElementById('delta-arm-length').value = p.get('delta', 'arm_length', '265.0');
        document.getElementById('delta-radius').value = p.get('delta', 'delta_radius', '130.0');
        document.getElementById('delta-print-radius').value = p.get('delta', 'print_radius', '100.0');

        // 2. HOST / MCU
        const canUuid = p.get('mcu', 'canbus_uuid', '');
        if (canUuid) {
            mcuConnType.value = 'canbus';
            document.getElementById('mcu-canbus-uuid').value = canUuid;
        } else {
            mcuConnType.value = 'serial';
            document.getElementById('mcu-serial').value = p.get('mcu', 'serial', '');
        }
        mcuConnType.dispatchEvent(new Event('change'));

        document.getElementById('mcu-baud').value = p.get('mcu', 'baud', '250000');
        document.getElementById('mcu-restart-method').value = p.get('mcu', 'restart_method', 'command');
        document.getElementById('check-enable-host-temp').checked = p.hasSection('temperature_sensor raspberry_pi') || p.hasSection('temperature_sensor host');
        document.getElementById('check-enable-mcu-temp').checked = p.hasSection('temperature_sensor mcu_temp');

        // Microcontrollori Secondari [mcu <nome>]
        state.extraMcus = [];
        const extraMcuSections = p.findSectionsByPrefix('mcu ');
        for (const sec of extraMcuSections) {
            const mcuName = sec.replace(/^mcu\s+/, '').trim();
            if (!mcuName) continue;
            const mcuCanUuid = p.get(sec, 'canbus_uuid', '');
            const mcuSerial = p.get(sec, 'serial', '');
            let cType = 'serial';
            if (mcuCanUuid) {
                cType = 'canbus';
            } else if (mcuSerial === '/tmp/klipper_host_mcu') {
                cType = 'host';
            }
            state.extraMcus.push({
                name: mcuName,
                connType: cType,
                canbus_uuid: mcuCanUuid,
                serial: mcuSerial,
                baud: p.get(sec, 'baud', ''),
                restart_method: p.get(sec, 'restart_method', '')
            });
        }
        renderExtraMcus();

        // 3. STEPPER & DRIVER
        loadCurrentStepperFromParser();

        // 4. EXTRUDER
        loadCurrentExtruderFromParser();

        // 5. BED
        document.getElementById('bed-sensor-type').value = p.get('heater_bed', 'sensor_type', 'EPCOS 100K B57560G104F');
        document.getElementById('bed-heater-pin').value = p.get('heater_bed', 'heater_pin', '');
        document.getElementById('bed-sensor-pin').value = p.get('heater_bed', 'sensor_pin', '');
        document.getElementById('bed-min-temp').value = p.get('heater_bed', 'min_temp', '0');
        document.getElementById('bed-max-temp').value = p.get('heater_bed', 'max_temp', '110');
        const bedCtrl = p.get('heater_bed', 'control', 'pid');
        document.getElementById('bed-control-type').value = bedCtrl;
        document.getElementById('bed-pid-kp').value = p.get('heater_bed', 'pid_Kp', '54.027');
        document.getElementById('bed-pid-ki').value = p.get('heater_bed', 'pid_Ki', '0.770');
        document.getElementById('bed-pid-kd').value = p.get('heater_bed', 'pid_Kd', '948.182');
        if (dom.bedMaxDelta) dom.bedMaxDelta.value = p.get('heater_bed', 'max_delta', '2.0');
        updateBedControlVisibility();

        // 6. MISCELEUS
        document.getElementById('fan-part-pin').value = p.get('fan', 'pin', '');
        document.getElementById('fan-part-kick').value = p.get('fan', 'kick_start_time', '0.5');
        document.getElementById('fan-part-off-below').value = p.get('fan', 'off_below', '0.10');

        // Ventole Aggiuntive Dinamiche (heater_fan, controller_fan, temperature_fan, fan_generic)
        state.extraFans = [];
        const fanPrefixes = ['heater_fan', 'controller_fan', 'temperature_fan', 'fan_generic'];
        for (const secName of p.sectionOrder) {
            for (const prefix of fanPrefixes) {
                if (secName === prefix || secName.startsWith(prefix + ' ')) {
                    const fanName = secName === prefix ? '' : secName.slice(prefix.length + 1).trim();
                    state.extraFans.push({
                        type: prefix,
                        name: fanName || (prefix === 'heater_fan' ? 'hotend_fan' : 'fan_1'),
                        pin: p.get(secName, 'pin', ''),
                        heater: p.get(secName, 'heater', 'extruder'),
                        heater_temp: p.get(secName, 'heater_temp', '50.0'),
                        stepper: p.get(secName, 'stepper', ''),
                        sensor_type: p.get(secName, 'sensor_type', 'EPCOS 100K B57560G104F'),
                        sensor_pin: p.get(secName, 'sensor_pin', ''),
                        target_temp: p.get(secName, 'target_temp', '45.0'),
                        max_power: p.get(secName, 'max_power', '1.0'),
                        fan_speed: p.get(secName, 'fan_speed', '1.0')
                    });
                    break;
                }
            }
        }
        renderExtraFans();

        // Accelerometro ADXL345
        const hasAdxl = p.hasSection('adxl345');
        if (dom.checkEnableAdxl) {
            dom.checkEnableAdxl.checked = hasAdxl;
            if (dom.adxlFields) dom.adxlFields.style.display = hasAdxl ? 'block' : 'none';
        }
        if (hasAdxl) {
            if (dom.adxlCsPin) dom.adxlCsPin.value = p.get('adxl345', 'cs_pin', '');
            const sclk = p.get('adxl345', 'spi_software_sclk_pin', '');
            const mosi = p.get('adxl345', 'spi_software_mosi_pin', '');
            const miso = p.get('adxl345', 'spi_software_miso_pin', '');
            if (sclk || mosi || miso) {
                if (dom.adxlSpiMode) dom.adxlSpiMode.value = 'software';
                if (dom.adxlSpiSclk) dom.adxlSpiSclk.value = sclk;
                if (dom.adxlSpiMosi) dom.adxlSpiMosi.value = mosi;
                if (dom.adxlSpiMiso) dom.adxlSpiMiso.value = miso;
            } else {
                if (dom.adxlSpiMode) dom.adxlSpiMode.value = 'hardware';
                if (dom.adxlSpiBus) dom.adxlSpiBus.value = p.get('adxl345', 'spi_bus', '');
            }
            if (dom.adxlAxesMap) dom.adxlAxesMap.value = p.get('adxl345', 'axes_map', 'x, y, z');
            if (dom.adxlRate) dom.adxlRate.value = p.get('adxl345', 'rate', '3200');
        }
        updateAdxlSpiModeVisibility();

        // Illuminazione LED & Neopixel
        state.leds = [];
        for (const secName of p.sectionOrder) {
            if (secName.startsWith('neopixel ') || secName === 'neopixel') {
                const name = secName === 'neopixel' ? 'led' : secName.slice('neopixel '.length).trim();
                state.leds.push({
                    type: 'neopixel',
                    name: name,
                    pin: p.get(secName, 'pin', ''),
                    chain_count: p.get(secName, 'chain_count', '1'),
                    color_order: p.get(secName, 'color_order', 'GRB'),
                    initial_red: p.get(secName, 'initial_red', '0.0'),
                    initial_green: p.get(secName, 'initial_green', '0.0'),
                    initial_blue: p.get(secName, 'initial_blue', '0.0'),
                    initial_white: p.get(secName, 'initial_white', '0.0')
                });
            } else if (secName.startsWith('output_pin ') && (secName.toLowerCase().includes('led') || secName.toLowerCase().includes('light'))) {
                const name = secName.slice('output_pin '.length).trim();
                state.leds.push({
                    type: 'output_pin',
                    name: name,
                    pin: p.get(secName, 'pin', '')
                });
            }
        }
        renderLeds();

        document.getElementById('check-virtual-sd').checked = p.hasSection('virtual_sdcard');
        document.getElementById('virtual-sd-path').value = p.get('virtual_sdcard', 'path', '~/printer_data/gcodes');
        document.getElementById('check-pause-resume').checked = p.hasSection('pause_resume');
        document.getElementById('check-display-status').checked = p.hasSection('display_status');
        document.getElementById('check-respond').checked = p.hasSection('respond');
        document.getElementById('idle-timeout').value = p.get('idle_timeout', 'timeout', '1800');

        // 7. INCLUDE
        state.includes = [];
        for (const secName of p.sectionOrder) {
            if (secName.startsWith('include ') || secName.startsWith('include:')) {
                const fileName = secName.replace(/^include[:\s]+/, '').trim();
                if (fileName) {
                    state.includes.push({ file: fileName });
                }
            }
        }
        renderIncludes();

        // 8. MACRO
        state.macros = [];
        const macroSections = p.findSectionsByPrefix('gcode_macro');
        for (const sec of macroSections) {
            const macroName = sec.replace(/^gcode_macro\s+/, '').trim();
            const desc = p.get(sec, 'description', '');
            const rename = p.get(sec, 'rename_existing', '');
            const gcode = p.get(sec, 'gcode', '');
            state.macros.push({
                name: macroName,
                description: desc,
                rename_existing: rename,
                gcode: gcode
            });
        }
        renderMacroList();

        // 9. CALIBRATION
        if (p.hasSection('bltouch')) {
            probeTypeSelect.value = 'bltouch';
            document.getElementById('probe-sensor-pin').value = p.get('bltouch', 'sensor_pin', '');
            document.getElementById('probe-control-pin').value = p.get('bltouch', 'control_pin', '');
            document.getElementById('probe-x-offset').value = p.get('bltouch', 'x_offset', '-40.0');
            document.getElementById('probe-y-offset').value = p.get('bltouch', 'y_offset', '-10.0');
            document.getElementById('probe-z-offset').value = p.get('bltouch', 'z_offset', '2.50');
            document.getElementById('probe-samples').value = p.get('bltouch', 'samples', '2');
            document.getElementById('probe-samples-result').value = p.get('bltouch', 'samples_result', 'median');
        } else if (p.hasSection('probe')) {
            probeTypeSelect.value = 'probe';
            document.getElementById('probe-sensor-pin').value = p.get('probe', 'pin', '');
            document.getElementById('probe-x-offset').value = p.get('probe', 'x_offset', '0.0');
            document.getElementById('probe-y-offset').value = p.get('probe', 'y_offset', '0.0');
            document.getElementById('probe-z-offset').value = p.get('probe', 'z_offset', '0.0');
        } else {
            probeTypeSelect.value = 'none';
        }
        probeTypeSelect.dispatchEvent(new Event('change'));

        // Safe Z
        document.getElementById('check-enable-safe-z').checked = p.hasSection('safe_z_home');
        document.getElementById('safe-z-pos').value = p.get('safe_z_home', 'home_xy_position', '117.5, 117.5');
        document.getElementById('safe-z-hop').value = p.get('safe_z_home', 'z_hop', '10.0');
        document.getElementById('safe-z-speed').value = p.get('safe_z_home', 'speed', '50.0');
        checkEnableSafeZ.dispatchEvent(new Event('change'));

        // Bed Mesh
        document.getElementById('mesh-min').value = p.get('bed_mesh', 'mesh_min', '15, 15');
        document.getElementById('mesh-max').value = p.get('bed_mesh', 'mesh_max', '200, 200');
        document.getElementById('mesh-probe-count').value = p.get('bed_mesh', 'probe_count', '5, 5');
        document.getElementById('mesh-algorithm').value = p.get('bed_mesh', 'algorithm', 'bicubic');

        // Z-Tilt
        if (p.hasSection('z_tilt')) {
            document.getElementById('z-tilt-positions').value = p.get('z_tilt', 'z_positions', '');
            document.getElementById('z-tilt-points').value = p.get('z_tilt', 'points', '');
            document.getElementById('z-tilt-retries').value = p.get('z_tilt', 'retries', '3');
            document.getElementById('z-tilt-tolerance').value = p.get('z_tilt', 'retry_tolerance', '0.02');
        }

        // Quad Gantry Level
        if (p.hasSection('quad_gantry_level')) {
            document.getElementById('qgl-corners').value = p.get('quad_gantry_level', 'gantry_corners', '');
            document.getElementById('qgl-points').value = p.get('quad_gantry_level', 'points', '');
            document.getElementById('qgl-retries').value = p.get('quad_gantry_level', 'retries', '5');
            document.getElementById('qgl-tolerance').value = p.get('quad_gantry_level', 'retry_tolerance', '0.0075');
        }

        // Input Shaper
        document.getElementById('check-enable-shaper').checked = p.hasSection('input_shaper');
        document.getElementById('shaper-freq-x').value = p.get('input_shaper', 'shaper_freq_x', '45.2');
        document.getElementById('shaper-type-x').value = p.get('input_shaper', 'shaper_type_x', 'mzv');
        document.getElementById('shaper-freq-y').value = p.get('input_shaper', 'shaper_freq_y', '42.0');
        document.getElementById('shaper-type-y').value = p.get('input_shaper', 'shaper_type_y', 'mzv');
        checkEnableShaper.dispatchEvent(new Event('change'));

        // Resonance Tester
        const hasResTester = p.hasSection('resonance_tester');
        if (dom.checkEnableResonanceTester) {
            dom.checkEnableResonanceTester.checked = hasResTester;
            if (dom.resonanceTesterFields) dom.resonanceTesterFields.style.display = hasResTester ? 'block' : 'none';
        }
        if (hasResTester) {
            if (dom.resAccelChip) dom.resAccelChip.value = p.get('resonance_tester', 'accel_chip', 'adxl345');
            if (dom.resProbePoints) dom.resProbePoints.value = p.get('resonance_tester', 'probe_points', '100, 100, 20');
            if (dom.resAccelPerHz) dom.resAccelPerHz.value = p.get('resonance_tester', 'accel_per_hz', '75');
            if (dom.resMaxSmoothing) dom.resMaxSmoothing.value = p.get('resonance_tester', 'max_smoothing', '');
        }

        // Z-Offset rapido nello stesso box calibrazione
        if (dom.calibrationZOffset && dom.probeZOffset) {
            dom.calibrationZOffset.value = dom.probeZOffset.value || '2.50';
        }

        // Salva snapshot iniziale della configurazione pulita
        clearAllModifiedIndicators();
        state.baselineSnapshot = takeFullUiSnapshot();
        if (window.i18n) window.i18n.applyTranslations();
        if (window.refreshTooltips) window.refreshTooltips();
    }

    // -------------------------------------------------------------------------
    // Sincronizzazione Completa: UI -> Parser
    // -------------------------------------------------------------------------
    function updateParserFromUi() {
        const p = state.parser;

        // Salva stepper ed estruder visualizzati attualmente
        saveCurrentStepperToParser();
        saveCurrentExtruderToParser();

        // 1. CINEMATICA & PARAMETRI STAMPANTE UNIFICATI [printer]
        p.set('printer', 'kinematics', dom.printerKinematics.value);
        p.set('printer', 'max_velocity', document.getElementById('printer-max-velocity').value);
        p.set('printer', 'max_accel', document.getElementById('printer-max-accel').value);
        p.set('printer', 'minimum_cruise_ratio', document.getElementById('printer-cruise-ratio').value);
        p.set('printer', 'square_corner_velocity', document.getElementById('printer-square-corner').value);
        p.set('printer', 'max_z_velocity', document.getElementById('printer-max-z-velocity').value);
        p.set('printer', 'max_z_accel', document.getElementById('printer-max-z-accel').value);
        const legacyAccel = document.getElementById('printer-max-accel-to-decel').value;
        if (legacyAccel) p.set('printer', 'max_accel_to_decel', legacyAccel);

        // Limiti e Homing Asse X
        p.set('stepper_x', 'position_min', document.getElementById('x-pos-min').value);
        p.set('stepper_x', 'position_max', document.getElementById('x-pos-max').value);
        p.set('stepper_x', 'position_endstop', document.getElementById('x-pos-endstop').value);
        applyHomingParam('stepper_x', 'homing_speed', document.getElementById('x-homing-speed').value);
        applyHomingParam('stepper_x', 'homing_retract_dist', document.getElementById('x-homing-retract-dist').value);
        applyHomingParam('stepper_x', 'homing_retract_speed', document.getElementById('x-homing-retract-speed').value);

        // Gestione IDEX (Dual Carriage & Extruder1)
        const isIdex = dom.checkEnableIdex.checked;
        if (isIdex) {
            p.set('dual_carriage', 'axis', 'x');
            p.set('dual_carriage', 'position_min', document.getElementById('dc-pos-min').value);
            p.set('dual_carriage', 'position_max', document.getElementById('dc-pos-max').value);
            p.set('dual_carriage', 'position_endstop', document.getElementById('dc-pos-endstop').value);
            applyHomingParam('dual_carriage', 'homing_speed', document.getElementById('dc-homing-speed').value);
            applyHomingParam('dual_carriage', 'homing_retract_dist', document.getElementById('dc-homing-retract-dist').value);
            applyHomingParam('dual_carriage', 'homing_retract_speed', document.getElementById('dc-homing-retract-speed').value);
        } else {
            p.removeSection('dual_carriage');
            for (const d of ['tmc2209', 'tmc2208', 'tmc2226', 'tmc5160', 'tmc2240']) {
                p.removeSection(`${d} dual_carriage`);
                p.removeSection(`${d} extruder1`);
            }
            p.removeSection('extruder1');
        }

        // Limiti e Homing Asse Y
        p.set('stepper_y', 'position_min', document.getElementById('y-pos-min').value);
        p.set('stepper_y', 'position_max', document.getElementById('y-pos-max').value);
        p.set('stepper_y', 'position_endstop', document.getElementById('y-pos-endstop').value);
        applyHomingParam('stepper_y', 'homing_speed', document.getElementById('y-homing-speed').value);
        applyHomingParam('stepper_y', 'homing_retract_dist', document.getElementById('y-homing-retract-dist').value);
        applyHomingParam('stepper_y', 'homing_retract_speed', document.getElementById('y-homing-retract-speed').value);

        // Limiti e Homing Asse Z
        p.set('stepper_z', 'position_min', document.getElementById('z-pos-min').value);
        p.set('stepper_z', 'position_max', document.getElementById('z-pos-max').value);
        const zEndstop = document.getElementById('z-pos-endstop').value;
        if (zEndstop) p.set('stepper_z', 'position_endstop', zEndstop);
        applyHomingParam('stepper_z', 'homing_speed', document.getElementById('z-homing-speed').value);
        applyHomingParam('stepper_z', 'homing_retract_dist', document.getElementById('z-homing-retract-dist').value);
        applyHomingParam('stepper_z', 'homing_retract_speed', document.getElementById('z-homing-retract-speed').value);

        // Gestione Multi-Asse Z (pulizia motori in eccesso)
        const zCount = parseInt(dom.selectZMotorCount.value, 10) || 1;
        if (zCount < 4) {
            p.removeSection('stepper_z3');
            for (const d of ['tmc2209', 'tmc2208', 'tmc2226', 'tmc5160', 'tmc2240']) p.removeSection(`${d} stepper_z3`);
        }
        if (zCount < 3) {
            p.removeSection('stepper_z2');
            for (const d of ['tmc2209', 'tmc2208', 'tmc2226', 'tmc5160', 'tmc2240']) p.removeSection(`${d} stepper_z2`);
        }
        if (zCount < 2) {
            p.removeSection('stepper_z1');
            for (const d of ['tmc2209', 'tmc2208', 'tmc2226', 'tmc5160', 'tmc2240']) p.removeSection(`${d} stepper_z1`);
            p.removeSection('z_tilt');
            p.removeSection('quad_gantry_level');
        }

        // 2. HOST / MCU
        if (mcuConnType.value === 'canbus') {
            p.set('mcu', 'canbus_uuid', document.getElementById('mcu-canbus-uuid').value.trim());
            p.set('mcu', 'serial', null);
        } else {
            p.set('mcu', 'serial', document.getElementById('mcu-serial').value.trim());
            p.set('mcu', 'canbus_uuid', null);
        }
        p.set('mcu', 'baud', document.getElementById('mcu-baud').value);
        p.set('mcu', 'restart_method', document.getElementById('mcu-restart-method').value);

        if (document.getElementById('check-enable-host-temp').checked) {
            p.set('temperature_sensor raspberry_pi', 'sensor_type', 'temperature_host');
            p.set('temperature_sensor raspberry_pi', 'min_temp', '10');
            p.set('temperature_sensor raspberry_pi', 'max_temp', '85');
        } else {
            p.removeSection('temperature_sensor raspberry_pi');
            p.removeSection('temperature_sensor host');
        }

        if (document.getElementById('check-enable-mcu-temp').checked) {
            p.set('temperature_sensor mcu_temp', 'sensor_type', 'temperature_mcu');
            p.set('temperature_sensor mcu_temp', 'min_temp', '0');
            p.set('temperature_sensor mcu_temp', 'max_temp', '100');
        } else {
            p.removeSection('temperature_sensor mcu_temp');
        }

        // Salva MCU Secondari Dinamici [mcu <nome>]
        syncExtraMcusFromDom();
        const oldMcuSections = p.findSectionsByPrefix('mcu ');
        for (const s of oldMcuSections) {
            p.removeSection(s);
        }
        for (const mcu of state.extraMcus) {
            if (!mcu.name || !mcu.name.trim()) continue;
            const secName = 'mcu ' + mcu.name.trim();
            if (mcu.connType === 'canbus') {
                p.set(secName, 'canbus_uuid', mcu.canbus_uuid ? mcu.canbus_uuid.trim() : '');
                p.set(secName, 'serial', null);
            } else if (mcu.connType === 'host') {
                p.set(secName, 'serial', '/tmp/klipper_host_mcu');
                p.set(secName, 'canbus_uuid', null);
            } else {
                p.set(secName, 'serial', mcu.serial ? mcu.serial.trim() : '');
                p.set(secName, 'canbus_uuid', null);
            }
            if (mcu.baud) p.set(secName, 'baud', mcu.baud.trim());
            if (mcu.restart_method) p.set(secName, 'restart_method', mcu.restart_method.trim());
        }

        // 5. BED
        p.set('heater_bed', 'heater_pin', document.getElementById('bed-heater-pin').value.trim());
        p.set('heater_bed', 'sensor_type', document.getElementById('bed-sensor-type').value);
        p.set('heater_bed', 'sensor_pin', document.getElementById('bed-sensor-pin').value.trim());
        p.set('heater_bed', 'min_temp', document.getElementById('bed-min-temp').value.trim());
        p.set('heater_bed', 'max_temp', document.getElementById('bed-max-temp').value.trim());
        const bedCtrl = document.getElementById('bed-control-type').value;
        p.set('heater_bed', 'control', bedCtrl);
        if (bedCtrl === 'pid') {
            p.set('heater_bed', 'pid_Kp', document.getElementById('bed-pid-kp').value.trim() || '54.027');
            p.set('heater_bed', 'pid_Ki', document.getElementById('bed-pid-ki').value.trim() || '0.770');
            p.set('heater_bed', 'pid_Kd', document.getElementById('bed-pid-kd').value.trim() || '948.182');
            p.set('heater_bed', 'max_delta', null);
        } else {
            p.set('heater_bed', 'pid_Kp', null);
            p.set('heater_bed', 'pid_Ki', null);
            p.set('heater_bed', 'pid_Kd', null);
            const bedDelta = dom.bedMaxDelta ? dom.bedMaxDelta.value.trim() : '2.0';
            p.set('heater_bed', 'max_delta', bedDelta || '2.0');
        }

        // 6. MISCELEUS
        p.set('fan', 'pin', document.getElementById('fan-part-pin').value.trim());
        p.set('fan', 'kick_start_time', document.getElementById('fan-part-kick').value);
        p.set('fan', 'off_below', document.getElementById('fan-part-off-below').value);

        // Salva Ventole Ausiliarie (heater_fan, controller_fan, temperature_fan, fan_generic)
        syncExtraFansFromDom();
        for (const prefix of ['heater_fan', 'controller_fan', 'temperature_fan', 'fan_generic']) {
            for (const s of p.sectionOrder.filter(sec => sec === prefix || sec.startsWith(prefix + ' '))) {
                p.removeSection(s);
            }
        }
        for (const fan of state.extraFans) {
            if (!fan.name || !fan.name.trim()) continue;
            const secName = `${fan.type} ${fan.name.trim()}`;
            if (fan.pin) p.set(secName, 'pin', fan.pin.trim());
            if (fan.type === 'heater_fan') {
                p.set(secName, 'heater', fan.heater ? fan.heater.trim() : 'extruder');
                p.set(secName, 'heater_temp', fan.heater_temp ? fan.heater_temp.trim() : '50.0');
            } else if (fan.type === 'controller_fan') {
                if (fan.stepper && fan.stepper.trim()) {
                    p.set(secName, 'stepper', fan.stepper.trim());
                }
            } else if (fan.type === 'temperature_fan') {
                if (fan.sensor_type) p.set(secName, 'sensor_type', fan.sensor_type.trim());
                if (fan.sensor_pin) p.set(secName, 'sensor_pin', fan.sensor_pin.trim());
                if (fan.target_temp) p.set(secName, 'target_temp', fan.target_temp.trim());
            } else if (fan.type === 'fan_generic') {
                if (fan.max_power) p.set(secName, 'max_power', fan.max_power.trim());
            }
        }

        // Salva Accelerometro ADXL345
        if (dom.checkEnableAdxl && dom.checkEnableAdxl.checked) {
            p.set('adxl345', 'cs_pin', dom.adxlCsPin.value.trim());
            if (dom.adxlSpiMode.value === 'software') {
                p.set('adxl345', 'spi_software_sclk_pin', dom.adxlSpiSclk.value.trim());
                p.set('adxl345', 'spi_software_mosi_pin', dom.adxlSpiMosi.value.trim());
                p.set('adxl345', 'spi_software_miso_pin', dom.adxlSpiMiso.value.trim());
                p.set('adxl345', 'spi_bus', null);
            } else {
                p.set('adxl345', 'spi_bus', dom.adxlSpiBus.value.trim());
                p.set('adxl345', 'spi_software_sclk_pin', null);
                p.set('adxl345', 'spi_software_mosi_pin', null);
                p.set('adxl345', 'spi_software_miso_pin', null);
            }
            if (dom.adxlAxesMap.value.trim()) {
                p.set('adxl345', 'axes_map', dom.adxlAxesMap.value.trim());
            }
            if (dom.adxlRate.value.trim()) {
                p.set('adxl345', 'rate', dom.adxlRate.value.trim());
            }
        } else {
            p.removeSection('adxl345');
        }

        // Salva LED & Neopixel
        syncLedsFromDom();
        for (const s of p.sectionOrder.filter(sec => sec.startsWith('neopixel ') || sec === 'neopixel')) {
            p.removeSection(s);
        }
        for (const led of state.leds) {
            if (led.type === 'output_pin' && led.name) {
                p.removeSection(`output_pin ${led.name.trim()}`);
            }
        }
        for (const led of state.leds) {
            if (!led.name || !led.name.trim()) continue;
            const secName = `${led.type} ${led.name.trim()}`;
            if (led.pin) p.set(secName, 'pin', led.pin.trim());
            if (led.type === 'neopixel') {
                if (led.chain_count) p.set(secName, 'chain_count', led.chain_count.trim());
                if (led.color_order) p.set(secName, 'color_order', led.color_order.trim());
            }
        }

        if (document.getElementById('check-virtual-sd').checked) {
            p.set('virtual_sdcard', 'path', document.getElementById('virtual-sd-path').value.trim());
        } else {
            p.removeSection('virtual_sdcard');
        }

        if (document.getElementById('check-pause-resume').checked) {
            p.set('pause_resume', '', null);
        } else {
            p.removeSection('pause_resume');
        }

        if (document.getElementById('check-display-status').checked) {
            p.set('display_status', '', null);
        } else {
            p.removeSection('display_status');
        }

        if (document.getElementById('check-respond').checked) {
            p.set('respond', '', null);
        } else {
            p.removeSection('respond');
        }

        p.set('idle_timeout', 'timeout', document.getElementById('idle-timeout').value);

        // 7. INCLUDE
        syncIncludesFromDom();
        for (const s of p.sectionOrder.filter(sec => sec.startsWith('include ') || sec.startsWith('include:') || sec === 'include')) {
            p.removeSection(s);
        }
        for (const inc of state.includes) {
            if (!inc.file || !inc.file.trim()) continue;
            const secName = `include ${inc.file.trim()}`;
            p.set(secName, '', null);
        }

        // 7. MACRO
        const existingMacroSecs = p.findSectionsByPrefix('gcode_macro');
        for (const s of existingMacroSecs) {
            p.removeSection(s);
        }

        for (const macro of state.macros) {
            const secName = `gcode_macro ${macro.name}`;
            if (macro.description) p.set(secName, 'description', macro.description);
            if (macro.rename_existing) p.set(secName, 'rename_existing', macro.rename_existing);
            p.set(secName, 'gcode', macro.gcode);
        }

        // 8. CALIBRATION
        const probeType = probeTypeSelect.value;
        p.removeSection('bltouch');
        p.removeSection('probe');

        if (probeType === 'bltouch') {
            p.set('bltouch', 'sensor_pin', document.getElementById('probe-sensor-pin').value.trim());
            p.set('bltouch', 'control_pin', document.getElementById('probe-control-pin').value.trim());
            p.set('bltouch', 'x_offset', document.getElementById('probe-x-offset').value);
            p.set('bltouch', 'y_offset', document.getElementById('probe-y-offset').value);
            p.set('bltouch', 'z_offset', document.getElementById('probe-z-offset').value);
            p.set('bltouch', 'speed', '5.0');
            p.set('bltouch', 'samples', document.getElementById('probe-samples').value);
            p.set('bltouch', 'samples_result', document.getElementById('probe-samples-result').value);
        } else if (probeType === 'probe') {
            p.set('probe', 'pin', document.getElementById('probe-sensor-pin').value.trim());
            p.set('probe', 'x_offset', document.getElementById('probe-x-offset').value);
            p.set('probe', 'y_offset', document.getElementById('probe-y-offset').value);
            p.set('probe', 'z_offset', document.getElementById('probe-z-offset').value);
        }

        // Safe Z
        if (checkEnableSafeZ.checked) {
            p.set('safe_z_home', 'home_xy_position', document.getElementById('safe-z-pos').value.trim());
            p.set('safe_z_home', 'z_hop', document.getElementById('safe-z-hop').value);
            p.set('safe_z_home', 'speed', document.getElementById('safe-z-speed').value);
        } else {
            p.removeSection('safe_z_home');
        }

        // Bed Mesh
        p.set('bed_mesh', 'speed', '120');
        p.set('bed_mesh', 'horizontal_move_z', '5.0');
        p.set('bed_mesh', 'mesh_min', document.getElementById('mesh-min').value.trim());
        p.set('bed_mesh', 'mesh_max', document.getElementById('mesh-max').value.trim());
        p.set('bed_mesh', 'probe_count', document.getElementById('mesh-probe-count').value);
        p.set('bed_mesh', 'algorithm', document.getElementById('mesh-algorithm').value);

        // Z-Tilt (se motori Z = 2 o 3)
        if (zCount >= 2 && zCount <= 3) {
            p.removeSection('quad_gantry_level');
            const zpos = document.getElementById('z-tilt-positions').value.trim();
            const zpts = document.getElementById('z-tilt-points').value.trim();
            if (zpos && zpts) {
                p.set('z_tilt', 'z_positions', zpos);
                p.set('z_tilt', 'points', zpts);
                p.set('z_tilt', 'speed', '100');
                p.set('z_tilt', 'horizontal_move_z', '5.0');
                p.set('z_tilt', 'retries', document.getElementById('z-tilt-retries').value);
                p.set('z_tilt', 'retry_tolerance', document.getElementById('z-tilt-tolerance').value);
            }
        } else if (zCount === 4) {
            // Quad Gantry Level (se motori Z = 4)
            p.removeSection('z_tilt');
            const qglCorners = document.getElementById('qgl-corners').value.trim();
            const qglPoints = document.getElementById('qgl-points').value.trim();
            if (qglCorners && qglPoints) {
                p.set('quad_gantry_level', 'gantry_corners', qglCorners);
                p.set('quad_gantry_level', 'points', qglPoints);
                p.set('quad_gantry_level', 'speed', '150');
                p.set('quad_gantry_level', 'horizontal_move_z', '10.0');
                p.set('quad_gantry_level', 'retries', document.getElementById('qgl-retries').value);
                p.set('quad_gantry_level', 'retry_tolerance', document.getElementById('qgl-tolerance').value);
            }
        }

        // Input Shaper
        if (checkEnableShaper.checked) {
            p.set('input_shaper', 'shaper_freq_x', document.getElementById('shaper-freq-x').value);
            p.set('input_shaper', 'shaper_type_x', document.getElementById('shaper-type-x').value);
            p.set('input_shaper', 'shaper_freq_y', document.getElementById('shaper-freq-y').value);
            p.set('input_shaper', 'shaper_type_y', document.getElementById('shaper-type-y').value);
        } else {
            p.removeSection('input_shaper');
        }

        // Resonance Tester
        if (dom.checkEnableResonanceTester && dom.checkEnableResonanceTester.checked) {
            p.set('resonance_tester', 'accel_chip', dom.resAccelChip ? dom.resAccelChip.value.trim() : 'adxl345');
            p.set('resonance_tester', 'probe_points', dom.resProbePoints ? dom.resProbePoints.value.trim() : '100, 100, 20');
            if (dom.resAccelPerHz && dom.resAccelPerHz.value.trim()) {
                p.set('resonance_tester', 'accel_per_hz', dom.resAccelPerHz.value.trim());
            }
            if (dom.resMaxSmoothing && dom.resMaxSmoothing.value.trim()) {
                p.set('resonance_tester', 'max_smoothing', dom.resMaxSmoothing.value.trim());
            } else {
                p.set('resonance_tester', 'max_smoothing', null);
            }
        } else {
            p.removeSection('resonance_tester');
        }

        // Z-Offset Sonda unificato
        if (dom.calibrationZOffset && dom.probeZOffset) {
            const calZ = dom.calibrationZOffset.value.trim();
            if (calZ) {
                dom.probeZOffset.value = calZ;
                if (p.hasSection('bltouch')) {
                    p.set('bltouch', 'z_offset', calZ);
                } else if (p.hasSection('probe')) {
                    p.set('probe', 'z_offset', calZ);
                }
            }
        }
    }

    // -------------------------------------------------------------------------
    // Anteprima & Diff CFG Modal
    // -------------------------------------------------------------------------
    dom.btnPreview.addEventListener('click', () => {
        updateParserFromUi();
        const cfgText = state.parser.generateConfig();
        dom.previewCodeBlock.textContent = cfgText;
        dom.modalPreview.classList.add('open');
    });

    dom.btnClosePreview.addEventListener('click', () => dom.modalPreview.classList.remove('open'));
    
    dom.btnCopyPreview.addEventListener('click', () => {
        const text = dom.previewCodeBlock.textContent;
        navigator.clipboard.writeText(text).then(() => {
            showToast('Configurazione copiata negli appunti!', 'success');
        });
    });

    dom.btnModalSave.addEventListener('click', () => {
        dom.modalPreview.classList.remove('open');
        saveConfiguration(false);
    });

    // -------------------------------------------------------------------------
    // Scarica File Locale
    // -------------------------------------------------------------------------
    dom.btnDownload.addEventListener('click', () => {
        updateParserFromUi();
        const content = state.parser.generateConfig();
        const blob = new Blob([content], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = state.currentConfigFile;
        a.click();
        URL.revokeObjectURL(a.href);
        showToast(`File ${state.currentConfigFile} scaricato`, 'success');
    });

    // -------------------------------------------------------------------------
    // Salvataggio su Moonraker e Riavvio Klipper
    // -------------------------------------------------------------------------
    async function saveConfiguration(andRestart = false) {
        updateParserFromUi();
        const content = state.parser.generateConfig();

        showToast(`Salvataggio di ${state.currentConfigFile} su Moonraker...`, 'info', 2000);

        const res = await state.moonraker.uploadConfig(state.currentConfigFile, content, true);
        if (res.success) {
            clearAllModifiedIndicators();
            state.baselineSnapshot = takeFullUiSnapshot();
            showToast(`File ${state.currentConfigFile} salvato con successo! (Backup creato)`, 'success', 3500);

            if (andRestart) {
                setTimeout(async () => {
                    showToast('Invio comando FIRMWARE_RESTART a Klipper...', 'info');
                    const restartRes = await state.moonraker.restartKlipper(true);
                    if (restartRes.success) {
                        showToast('Klipper riavviato! Ricarica completata.', 'success');
                    } else {
                        showToast(`Errore riavvio: ${restartRes.error}`, 'error');
                    }
                }, 800);
            }
        } else {
            showToast(`Errore durante il salvataggio: ${res.error}`, 'error', 5000);
        }
    }

    dom.btnSave.addEventListener('click', () => saveConfiguration(false));
    dom.btnSaveRestart.addEventListener('click', () => saveConfiguration(true));

    // -------------------------------------------------------------------------
    // Integrazione Mainsail Sidebar & Sincronizzazione Tema Dinamico
    // -------------------------------------------------------------------------

    /**
     * Converte un codice esadecimale in componenti RGB
     */
    function hexToRgb(hex) {
        if (!hex) return null;
        let c = hex.replace('#', '').trim();
        if (c.length === 3) {
            c = c.split('').map(x => x + x).join('');
        }
        if (c.length !== 6) return null;
        const num = parseInt(c, 16);
        return {
            r: (num >> 16) & 255,
            g: (num >> 8) & 255,
            b: num & 255
        };
    }

    /**
     * Regola la luminosità di un colore HEX (+percentuale per schiarire, - per scurire)
     */
    function adjustBrightness(hex, percent) {
        const rgb = hexToRgb(hex);
        if (!rgb) return hex;
        const amt = Math.round(2.55 * percent);
        const clamp = (val) => Math.min(255, Math.max(0, val));
        const r = clamp(rgb.r + amt).toString(16).padStart(2, '0');
        const g = clamp(rgb.g + amt).toString(16).padStart(2, '0');
        const b = clamp(rgb.b + amt).toString(16).padStart(2, '0');
        return `#${r}${g}${b}`;
    }

    /**
     * Restituisce l'URL di base per navigare su Mainsail WebUI
     */
    function getMainsailBaseUrl() {
        if (window.location.protocol.startsWith('http')) {
            const port = window.location.port;
            if (port !== '7125' && port !== '5173' && port !== '3000') {
                return window.location.origin;
            }
        }
        if (state.moonraker && state.moonraker.baseUrl) {
            try {
                const parsed = new URL(state.moonraker.baseUrl);
                return `${parsed.protocol}//${parsed.hostname}`;
            } catch (_) {}
        }
        return '';
    }

    // -------------------------------------------------------------------------
    // Sidebar Mainsail: replica di src/routes/index.ts + mixins/navigation.ts
    // -------------------------------------------------------------------------

    /** Icone Material Design ufficiali (@mdi/js) usate da Mainsail */
    const MDI = {
        monitorDashboard: 'M21,16V4H3V16H21M21,2A2,2 0 0,1 23,4V16A2,2 0 0,1 21,18H14V20H16V22H8V20H10V18H3C1.89,18 1,17.1 1,16V4C1,2.89 1.89,2 3,2H21M5,6H14V11H5V6M15,6H19V8H15V6M19,9V14H15V9H19M5,12H9V14H5V12M10,12H14V14H10V12Z',
        webcam: 'M12,2A7,7 0 0,1 19,9A7,7 0 0,1 12,16A7,7 0 0,1 5,9A7,7 0 0,1 12,2M12,4A5,5 0 0,0 7,9A5,5 0 0,0 12,14A5,5 0 0,0 17,9A5,5 0 0,0 12,4M12,6A3,3 0 0,1 15,9A3,3 0 0,1 12,12A3,3 0 0,1 9,9A3,3 0 0,1 12,6M6,22A2,2 0 0,1 4,20C4,19.62 4.1,19.27 4.29,18.97L6.11,15.81C7.69,17.17 9.75,18 12,18C14.25,18 16.31,17.17 17.89,15.81L19.71,18.97C19.9,19.27 20,19.62 20,20A2,2 0 0,1 18,22H6Z',
        consoleLine: 'M13,19V16H21V19H13M8.5,13L2.47,7H6.71L11.67,11.95C12.25,12.54 12.25,13.5 11.67,14.07L6.74,19H2.5L8.5,13Z',
        grid: 'M10,4V8H14V4H10M16,4V8H20V4H16M16,10V14H20V10H16M16,16V20H20V16H16M14,20V16H10V20H14M8,20V16H4V20H8M8,14V10H4V14H8M8,8V4H4V8H8M10,14H14V10H10V14M4,2H20A2,2 0 0,1 22,4V20A2,2 0 0,1 20,22H4C2.92,22 2,21.1 2,20V4A2,2 0 0,1 4,2Z',
        fileDocumentMultipleOutline: 'M16 0H8C6.9 0 6 .9 6 2V18C6 19.1 6.9 20 8 20H20C21.1 20 22 19.1 22 18V6L16 0M20 18H8V2H15V7H20V18M4 4V22H20V24H4C2.9 24 2 23.1 2 22V4H4M10 10V12H18V10H10M10 14V16H15V14H10Z',
        video3d: 'M5,7H9A2,2 0 0,1 11,9V15A2,2 0 0,1 9,17H5V15H9V13H6V11H9V9H5V7M13,7H16A3,3 0 0,1 19,10V14A3,3 0 0,1 16,17H13V7M16,15A1,1 0 0,0 17,14V10A1,1 0 0,0 16,9H15V15H16Z',
        history: 'M13.5,8H12V13L16.28,15.54L17,14.33L13.5,12.25V8M13,3A9,9 0 0,0 4,12H1L4.96,16.03L9,12H6A7,7 0 0,1 13,5A7,7 0 0,1 20,12A7,7 0 0,1 13,19C11.07,19 9.32,18.21 8.06,16.94L6.64,18.36C8.27,20 10.5,21 13,21A9,9 0 0,0 22,12A9,9 0 0,0 13,3',
        timelapse: 'M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.24,7.76C15.07,6.58 13.53,6 12,6V12L7.76,16.24C10.1,18.58 13.9,18.58 16.24,16.24C18.59,13.9 18.59,10.1 16.24,7.76Z',
        wrench: 'M22.7,19L13.6,9.9C14.5,7.6 14,4.9 12.1,3C10.1,1 7.1,0.6 4.7,1.7L9,6L6,9L1.6,4.7C0.4,7.1 0.9,10.1 2.9,12.1C4.8,14 7.5,14.5 9.8,13.6L18.9,22.7C19.3,23.1 19.9,23.1 20.3,22.7L22.6,20.4C23.1,20 23.1,19.3 22.7,19Z',
        linkVariant: 'M10.59,13.41C11,13.8 11,14.44 10.59,14.83C10.2,15.22 9.56,15.22 9.17,14.83C7.22,12.88 7.22,9.71 9.17,7.76V7.76L12.71,4.22C14.66,2.27 17.83,2.27 19.78,4.22C21.73,6.17 21.73,9.34 19.78,11.29L18.29,12.78C18.3,11.96 18.17,11.14 17.89,10.36L18.36,9.88C19.54,8.71 19.54,6.81 18.36,5.64C17.19,4.46 15.29,4.46 14.12,5.64L10.59,9.17C9.41,10.34 9.41,12.24 10.59,13.41M13.41,9.17C13.8,8.78 14.44,8.78 14.83,9.17C16.78,11.12 16.78,14.29 14.83,16.24V16.24L11.29,19.78C9.34,21.73 6.17,21.73 4.22,19.78C2.27,17.83 2.27,14.66 4.22,12.71L5.71,11.22C5.7,12.04 5.83,12.86 6.11,13.65L5.64,14.12C4.46,15.29 4.46,17.19 5.64,18.36C6.81,19.54 8.71,19.54 9.88,18.36L13.41,14.83C14.59,13.66 14.59,11.76 13.41,10.59C13,10.2 13,9.56 13.41,9.17Z'
    };

    /**
     * Voci native di Mainsail (stesso ordine, posizione e condizioni di src/routes/index.ts).
     * offlineDefault: visibilità usata quando Moonraker non è raggiungibile e non c'è cache.
     */
    const MAINSAIL_ROUTES = [
        { title: 'Dashboard', path: '/', icon: MDI.monitorDashboard, position: 10, alwaysShow: true },
        { title: 'Webcam', path: '/cam', icon: MDI.webcam, position: 20, alwaysShow: true, requiresWebcam: true },
        { title: 'Console', path: '/console', icon: MDI.consoleLine, position: 30, alwaysShow: true, klipperIsConnected: true, offlineDefault: false },
        { title: 'Heightmap', path: '/heightmap', icon: MDI.grid, position: 40, alwaysShow: false, klipperComponent: 'bed_mesh' },
        { title: 'G-Code Files', path: '/files', icon: MDI.fileDocumentMultipleOutline, position: 50, alwaysShow: true, registeredDirectory: 'gcodes' },
        { title: 'G-Code Viewer', path: '/viewer', icon: MDI.video3d, position: 60, alwaysShow: true },
        { title: 'History', path: '/history', icon: MDI.history, position: 70, alwaysShow: true, moonrakerComponent: 'history' },
        { title: 'Timelapse', path: '/timelapse', icon: MDI.timelapse, position: 80, alwaysShow: true, moonrakerComponent: 'timelapse', offlineDefault: false },
        { title: 'Machine', path: '/config', icon: MDI.wrench, position: 90, alwaysShow: true }
    ];

    /** Traduzioni "Router.*" dei file locales di Mainsail */
    const MAINSAIL_ROUTE_TITLES = {
        it: {
            'Dashboard': 'Cruscotto',
            'Webcam': 'Webcam',
            'Console': 'Console',
            'Heightmap': "Mappa dell'altezza",
            'G-Code Files': 'File G-Code',
            'G-Code Viewer': 'Visualizzatore G-Code',
            'History': 'Cronologia',
            'Timelapse': 'Timelapse',
            'Machine': 'Macchina'
        }
    };

    /** Voce di Klipper Configurator (identica a navi.json installato in .theme/) */
    const CONFIGURATOR_NAVI_DEFAULT = {
        title: 'Klipper Config',
        href: '/configurator/',
        target: '_self',
        position: 35,
        icon: 'M19.14,12.94c0.04,-0.3 0.06,-0.61 0.06,-0.94c0,-0.32 -0.02,-0.64 -0.07,-0.94l2.03,-1.58c0.18,-0.14 0.23,-0.41 0.12,-0.61l-1.92,-3.32c-0.12,-0.22 -0.37,-0.29 -0.59,-0.22l-2.39,0.96c-0.5,-0.38 -1.03,-0.7 -1.62,-0.94l-0.36,-2.54c-0.04,-0.24 -0.24,-0.41 -0.48,-0.41h-3.84c-0.24,0 -0.43,0.17 -0.47,0.41l-0.36,2.54c-0.59,0.24 -1.13,0.57 -1.62,0.94l-2.39,-0.96c-0.22,-0.08 -0.47,0 -0.59,0.22l-1.91,3.32c-0.12,0.21 -0.08,0.47 0.12,0.61l2.03,1.58c-0.05,0.3 -0.09,0.63 -0.09,0.94s0.02,0.64 0.07,0.94l-2.03,1.58c-0.18,0.14 -0.23,0.41 -0.12,0.61l1.92,3.32c0.12,0.22 0.37,0.29 0.59,0.22l2.39,-0.96c0.5,0.38 1.03,0.7 1.62,0.94l0.36,2.54c0.05,0.24 0.24,0.41 0.48,0.41h3.84c0.24,0 0.44,-0.17 0.47,-0.41l0.36,-2.54c0.59,-0.24 1.13,-0.56 1.62,-0.94l2.39,0.96c0.22,0.08 0.47,0 0.59,-0.22l1.92,-3.32c0.12,-0.22 0.07,-0.47 -0.12,-0.61l-2.01,-1.58zM12,15.6c-1.98,0 -3.6,-1.62 -3.6,-3.6s1.62,-3.6 3.6,-3.6s3.6,1.62 3.6,3.6s-1.62,3.6 -3.6,3.6z'
    };

    const SIDEBAR_CACHE_KEY = 'mainsail_cached_sidebar_items';

    /** Stato raccolto da Moonraker per decidere quali voci mostrare */
    const sidebarState = {
        serverInfo: null,        // /server/info
        webcamCount: null,       // /server/webcams/list
        configSections: null,    // configfile.settings
        customNaviLinks: null,   // .theme/navi.json
        navEntries: [],          // gui.navigation.entries (ordine/visibilità personalizzati)
        language: null           // gui.general.language
    };

    function isSvgPath(icon) {
        return typeof icon === 'string' && /^\s*[Mm]\s*-?[\d.]/.test(icon);
    }

    /** True se il link punta a questa stessa interfaccia (Klipper Configurator) */
    function isConfiguratorHref(href) {
        if (!href) return false;
        try {
            const target = new URL(href, window.location.href);
            const norm = (p) => p.replace(/index\.html$/, '').replace(/\/+$/, '');
            if (/\/configurator$/.test(norm(target.pathname))) return true;
            return target.origin === window.location.origin && norm(target.pathname) !== '' &&
                norm(target.pathname) === norm(window.location.pathname);
        } catch (_) {
            return /configurator/i.test(href);
        }
    }

    function translateRouteTitle(title) {
        const lang = (sidebarState.language || localStorage.getItem('mainsail_cached_language') || 'en').toLowerCase().slice(0, 2);
        const dict = MAINSAIL_ROUTE_TITLES[lang];
        return (dict && dict[title]) || title;
    }

    /** Equivalente di NavigationMixin.showInNavi() */
    function showRouteInNavi(route) {
        const info = sidebarState.serverInfo;
        if (!info) return route.offlineDefault !== false;

        if (['shutdown', 'error', 'disconnected'].includes(info.klippy_state) && !route.alwaysShow) return false;
        if (route.requiresWebcam && sidebarState.webcamCount === 0) return false;
        if (route.moonrakerComponent && Array.isArray(info.components) && !info.components.includes(route.moonrakerComponent)) return false;
        if (route.registeredDirectory && Array.isArray(info.registered_directories) && !info.registered_directories.includes(route.registeredDirectory)) return false;
        if (route.klipperComponent && !(sidebarState.configSections || []).includes(route.klipperComponent)) return false;
        if (route.klipperIsConnected && !info.klippy_connected) return false;
        return true;
    }

    /** Equivalente di NavigationMixin.getUiSettings() */
    function getNavUiSettings(type, title, position, visible) {
        const entry = (sidebarState.navEntries || []).find(p => p && p.title === title && p.type === type);
        if (!entry) return [position, visible];
        return [entry.position ?? position, entry.visible ?? visible];
    }

    /** Costruisce le voci visibili, ordinate per posizione (visibleNaviPoints) */
    function buildSidebarPoints() {
        const base = getMainsailBaseUrl();
        const points = [];

        MAINSAIL_ROUTES.filter(showRouteInNavi).forEach(route => {
            const [position, visible] = getNavUiSettings('route', route.title, route.position, true);
            points.push({
                title: translateRouteTitle(route.title),
                icon: route.icon,
                href: `${base}${route.path}`,
                target: null,
                position,
                visible,
                active: false
            });
        });

        let links = Array.isArray(sidebarState.customNaviLinks) ? sidebarState.customNaviLinks.slice() : [];
        if (!links.some(l => isConfiguratorHref(l.href))) links.push(CONFIGURATOR_NAVI_DEFAULT);

        links.forEach(link => {
            const title = link.title ?? 'Unknown';
            const [position, visible] = getNavUiSettings('link', title, link.position ?? 999, link.visible ?? true);
            const active = isConfiguratorHref(link.href);
            points.push({
                title,
                icon: isSvgPath(link.icon) ? link.icon : MDI.linkVariant,
                href: active ? window.location.href.split('#')[0] : (link.href ?? '#'),
                target: active ? '_self' : (link.target ?? null),
                position,
                visible,
                active
            });
        });

        return points
            .sort((a, b) => a.position - b.position)
            .filter(p => p.visible);
    }

    function createSidebarItem(point) {
        const a = document.createElement('a');
        a.className = 'sidebar-nav-item' + (point.active ? ' active' : '');
        a.href = point.href;
        if (point.target) a.target = point.target;
        if (point.target === '_blank') a.rel = 'noopener';
        a.dataset.tooltip = point.title;
        a.setAttribute('aria-label', point.title);
        if (point.active) a.setAttribute('aria-current', 'page');

        const iconWrap = document.createElement('span');
        iconWrap.className = 'sidebar-nav-icon';
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', point.icon);
        svg.appendChild(path);
        iconWrap.appendChild(svg);

        const label = document.createElement('span');
        label.className = 'sidebar-nav-label';
        label.textContent = point.title;

        a.appendChild(iconWrap);
        a.appendChild(label);
        return a;
    }

    /** Applica navigationStyle di Mainsail: 'iconsOnly' (56px) o 'iconsAndText' (220px) */
    function applyNavigationStyle(style) {
        if (!dom.sidebar) return;
        const value = style || localStorage.getItem('mainsail_cached_navigation_style') || 'iconsOnly';
        dom.sidebar.classList.toggle('expanded', value === 'iconsAndText');
    }

    /**
     * Disegna la sidebar. Se Moonraker non è (ancora) raggiungibile usa l'ultima
     * sidebar calcolata (cache locale), così il primo rendering è già identico a Mainsail.
     */
    function updateSidebarLinks() {
        const nav = document.getElementById('sidebar-nav');
        if (!nav) return;

        let points = null;
        if (!sidebarState.serverInfo) {
            try {
                const cached = JSON.parse(localStorage.getItem(SIDEBAR_CACHE_KEY) || 'null');
                if (Array.isArray(cached) && cached.length) {
                    points = cached.map(p => {
                        const active = isConfiguratorHref(p.href) || p.active;
                        return { ...p, active, href: active ? window.location.href.split('#')[0] : p.href };
                    });
                }
            } catch (_) {}
        }
        if (!points) {
            points = buildSidebarPoints();
            if (sidebarState.serverInfo) {
                localStorage.setItem(SIDEBAR_CACHE_KEY, JSON.stringify(points));
            }
        }

        nav.textContent = '';
        points.forEach(p => nav.appendChild(createSidebarItem(p)));

        const base = getMainsailBaseUrl();
        if (dom.sidebarLogoLink) dom.sidebarLogoLink.setAttribute('href', `${base}/`);
    }

    /**
     * Legge da Moonraker tutto ciò che serve alla sidebar (come fa Mainsail)
     * e la ridisegna. `settings` = namespace "mainsail" del database Moonraker.
     */
    async function syncSidebarFromMoonraker(settings, themeFiles) {
        const mr = state.moonraker;
        if (!mr || !mr.baseUrl) return;

        const [serverInfo, webcamCount, configSections] = await Promise.all([
            mr.getServerInfo(),
            mr.getWebcamCount(),
            mr.getKlipperConfigSections()
        ]);
        sidebarState.serverInfo = serverInfo;
        sidebarState.webcamCount = webcamCount;
        sidebarState.configSections = configSections;

        // Ordine / visibilità personalizzati (Impostazioni → Navigazione di Mainsail)
        const navigation = settings && settings.navigation;
        sidebarState.navEntries = navigation && Array.isArray(navigation.entries) ? navigation.entries : [];

        // Lingua dell'interfaccia Mainsail
        const lang = settings && settings.general && settings.general.language;
        if (lang) {
            sidebarState.language = lang;
            localStorage.setItem('mainsail_cached_language', lang);
        }

        // Voci personalizzate da .theme/navi.json
        sidebarState.customNaviLinks = null;
        const naviFile = themeFiles && themeFiles['navi'] && themeFiles['navi'].find(f => f.ext === 'json');
        if (naviFile) {
            const content = await mr.fetchJsonUrl(naviFile.url);
            if (Array.isArray(content)) sidebarState.customNaviLinks = content;
        }

        // Sfondo personalizzato .theme/sidebar-background.*
        const bgFile = themeFiles && themeFiles['sidebar-background'] &&
            themeFiles['sidebar-background'].find(f => ['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(f.ext));
        document.documentElement.style.setProperty('--sidebar-bg-image', bgFile ? `url("${bgFile.url}")` : 'none');

        // Stile di navigazione (default Mainsail: iconsAndText)
        if (settings && settings.uiSettings) {
            const style = settings.uiSettings.navigationStyle || 'iconsAndText';
            localStorage.setItem('mainsail_cached_navigation_style', style);
            applyNavigationStyle(style);
        }

        updateSidebarLinks();
    }

    const THEME_PRESETS = {
        mainsail: '#2196f3',
        klipper: '#f97316',
        voron: '#d32f2f',
        ldo: '#326799',
        yumi: '#F6CF3D',
        vzbot: '#00e5ff',
        prusa: '#fa6831',
        btt: '#ef0025',
        multec: '#234D7A',
        ratrig: '#00ff41',
        purple: '#9333ea',
        blue: '#0284c7',
        emerald: '#10b981'
    };

    /**
     * Applica il colore primario, il contrasto e la modalità tema (Dark / Light)
     */
    function applyMainsailTheme(options = {}) {
        const primary = options.primaryColor || localStorage.getItem('mainsail_cached_primary_color') || '#00c0f3';
        const forceLight = localStorage.getItem('mainsail_force_light_mode') === 'true';
        const mode = forceLight ? 'light' : (options.themeMode || localStorage.getItem('mainsail_cached_theme_mode') || 'dark');

        // Imposta variabili colore
        const rgb = hexToRgb(primary);
        if (rgb) {
            const root = document.documentElement;
            root.style.setProperty('--primary', primary);
            root.style.setProperty('--primary-hover', adjustBrightness(primary, -12));
            root.style.setProperty('--primary-light', adjustBrightness(primary, 22));
            root.style.setProperty('--border-focus', primary);
            root.style.setProperty('--primary-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);

            if (dom.activeThemeColorDot) dom.activeThemeColorDot.style.backgroundColor = primary;
            if (dom.activeThemeColorHex) dom.activeThemeColorHex.textContent = primary;
            if (dom.quickThemeDot) {
                dom.quickThemeDot.style.backgroundColor = primary;
                dom.quickThemeDot.style.boxShadow = `0 0 6px ${primary}`;
            }
            if (dom.pickerThemeColor) {
                dom.pickerThemeColor.value = primary;
            }
        }

        // Imposta modalità tema
        if (mode === 'light') {
            document.documentElement.classList.add('theme-light');
            document.body.classList.add('theme-light');
            if (dom.activeThemeModeText) dom.activeThemeModeText.textContent = 'Chiaro (Light)';
            if (dom.checkForceLightMode) dom.checkForceLightMode.checked = true;
        } else {
            document.documentElement.classList.remove('theme-light');
            document.body.classList.remove('theme-light');
            if (dom.activeThemeModeText) dom.activeThemeModeText.textContent = 'Scuro (Dark)';
            if (dom.checkForceLightMode) dom.checkForceLightMode.checked = false;
        }

        // Se disponibile custom.css da .theme/custom.css
        if (options.hasCustomCss && state.moonraker && state.moonraker.baseUrl) {
            let link = document.getElementById('mainsail-custom-theme-css');
            if (!link) {
                link = document.createElement('link');
                link.id = 'mainsail-custom-theme-css';
                link.rel = 'stylesheet';
                document.head.appendChild(link);
            }
            link.href = `${state.moonraker.baseUrl}/server/files/config/.theme/custom.css?t=${Date.now()}`;
        }
    }

    /**
     * Interroga Moonraker per scaricare il tema e le impostazioni dell'interfaccia Mainsail
     */
    async function syncMainsailTheme() {
        updateSidebarLinks();

        if (!state.moonraker || !state.moonraker.baseUrl) {
            applyMainsailTheme();
            return;
        }

        try {
            // Controlla logo personalizzato
            const customLogo = await state.moonraker.getCustomLogoUrl();
            if (customLogo && dom.sidebarCustomLogoImg && dom.sidebarDefaultLogoSvg) {
                dom.sidebarCustomLogoImg.src = customLogo;
                dom.sidebarCustomLogoImg.style.display = 'block';
                dom.sidebarDefaultLogoSvg.style.display = 'none';
            }

            const res = await state.moonraker.getMainsailSettings();
            let primaryColor = null;
            let themeMode = 'dark';
            let printerName = null;

            if (res.success && res.settings) {
                const s = res.settings;

                // Estrazione Colore Primario (Mainsail supporta uiSettings.primary, uiSettings.primaryColor, theme.primaryColor, ecc.)
                if (s.uiSettings) {
                    if (s.uiSettings.primary && typeof s.uiSettings.primary === 'string') {
                        primaryColor = s.uiSettings.primary;
                    } else if (s.uiSettings.primaryColor && typeof s.uiSettings.primaryColor === 'string') {
                        primaryColor = s.uiSettings.primaryColor;
                    }
                }
                if (!primaryColor && s.theme && s.theme.primaryColor) {
                    primaryColor = s.theme.primaryColor;
                } else if (!primaryColor && typeof s.primaryColor === 'string') {
                    primaryColor = s.primaryColor;
                }

                // Estrazione preset tema se il colore primario è legato a un vendor/tema predefinito
                const themePreset = (s.uiSettings && s.uiSettings.theme) || (s.general && s.general.theme) || s.theme;
                if (typeof themePreset === 'string' && THEME_PRESETS[themePreset.toLowerCase()]) {
                    if (!primaryColor) {
                        primaryColor = THEME_PRESETS[themePreset.toLowerCase()];
                    }
                }

                // Estrazione Modalità Tema (dark / light)
                if (s.uiSettings) {
                    if (s.uiSettings.mode) {
                        themeMode = s.uiSettings.mode;
                    } else if (s.uiSettings.theme) {
                        if (typeof s.uiSettings.theme === 'string') {
                            themeMode = s.uiSettings.theme === 'light' ? 'light' : 'dark';
                        } else if (typeof s.uiSettings.theme === 'object') {
                            themeMode = s.uiSettings.theme.dark ? 'dark' : (s.uiSettings.theme.light ? 'light' : 'dark');
                        }
                    }
                } else if (s.general && s.general.theme) {
                    themeMode = s.general.theme === 'light' ? 'light' : 'dark';
                }

                // Estrazione Nome Stampante
                if (s.general && s.general.printername) {
                    printerName = s.general.printername;
                }

                // Estrazione e sincronizzazione Lingua Mainsail
                if (window.i18n) {
                    const detectedLang = window.i18n.detectMainsailLanguageFromSettings(s);
                    if (detectedLang) {
                        window.i18n.setLanguage(detectedLang, false);
                    }
                }

                // Memorizza in cache locale
                if (primaryColor) localStorage.setItem('mainsail_cached_primary_color', primaryColor);
                if (themeMode) localStorage.setItem('mainsail_cached_theme_mode', themeMode);

                if (dom.themeSyncStatus) {
                    dom.themeSyncStatus.textContent = 'Sincronizzato da Mainsail';
                    dom.themeSyncStatus.style.background = 'rgba(16, 185, 129, 0.2)';
                    dom.themeSyncStatus.style.color = '#10b981';
                }
            } else {
                if (dom.themeSyncStatus) {
                    dom.themeSyncStatus.textContent = 'Cache Locale';
                    dom.themeSyncStatus.style.background = 'rgba(234, 179, 8, 0.2)';
                    dom.themeSyncStatus.style.color = '#eab308';
                }
            }

            if (printerName && dom.sidebarBrandTitle) {
                dom.sidebarBrandTitle.textContent = printerName;
            }

            // Verifica se esiste custom.css
            const hasCustomCss = await state.moonraker.checkCustomCss();

            // Recupera file tema (.theme/navi.json, .theme/sidebar-background, ecc.)
            const themeFiles = await state.moonraker.getThemeFiles();

            // Sincronizza dinamicamente le voci, ordine, visibilità e sfondo della Sidebar come Mainsail
            await syncSidebarFromMoonraker(res.success ? res.settings : null, themeFiles);

            applyMainsailTheme({
                primaryColor: primaryColor || localStorage.getItem('mainsail_cached_primary_color') || '#00c0f3',
                themeMode: themeMode,
                hasCustomCss: hasCustomCss
            });

        } catch (err) {
            console.warn('Sincronizzazione tema Mainsail non riuscita:', err);
            applyMainsailTheme();
            updateSidebarLinks();
        }
    }

    /**
     * Inizializzazione della Sidebar Mainsail (espansione / compressione e memoria stato)
     */
    function initSidebar() {
        if (dom.sidebar) {
            // Recupera stato memorizzato
            const savedExpanded = localStorage.getItem('mainsail_sidebar_expanded') === 'true';
            if (savedExpanded) {
                dom.sidebar.classList.add('expanded');
                if (dom.sidebarToggleLabel) dom.sidebarToggleLabel.textContent = 'Comprimi';
            } else {
                dom.sidebar.classList.remove('expanded');
                if (dom.sidebarToggleLabel) dom.sidebarToggleLabel.textContent = 'Espandi';
            }

            if (dom.btnToggleSidebar) {
                dom.btnToggleSidebar.addEventListener('click', () => {
                    dom.sidebar.classList.toggle('expanded');
                    const isNowExpanded = dom.sidebar.classList.contains('expanded');
                    localStorage.setItem('mainsail_sidebar_expanded', isNowExpanded);
                    if (dom.sidebarToggleLabel) {
                        dom.sidebarToggleLabel.textContent = isNowExpanded ? 'Comprimi' : 'Espandi';
                    }
                });
            }
        }

        // Pulsante rapido Impostazioni nella navbar
        const openSettingsModal = () => {
            if (dom.inputMoonrakerUrl && state.moonraker) {
                dom.inputMoonrakerUrl.value = state.moonraker.baseUrl;
            }
            if (dom.modalConn) dom.modalConn.classList.add('open');
        };

        const targetSettingsBtn = dom.btnSettings || dom.btnConnSettings || document.getElementById('btn-settings');
        if (targetSettingsBtn) {
            targetSettingsBtn.addEventListener('click', openSettingsModal);
        }
        if (dom.btnQuickTheme) {
            dom.btnQuickTheme.addEventListener('click', openSettingsModal);
        }

        // Color Picker nativo per tema
        if (dom.pickerThemeColor) {
            dom.pickerThemeColor.addEventListener('input', (e) => {
                const color = e.target.value;
                if (color) {
                    localStorage.setItem('mainsail_cached_primary_color', color);
                    applyMainsailTheme({ primaryColor: color });
                }
            });
            dom.pickerThemeColor.addEventListener('change', (e) => {
                const color = e.target.value;
                if (color) {
                    localStorage.setItem('mainsail_cached_primary_color', color);
                    applyMainsailTheme({ primaryColor: color });
                    showToast(`Colore tema impostato su ${color}`, 'info', 1500);
                }
            });
        }

        // Preset colori nel modal di connessione
        if (dom.presetColorBtns) {
            dom.presetColorBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const color = btn.dataset.color;
                    if (color) {
                        localStorage.setItem('mainsail_cached_primary_color', color);
                        applyMainsailTheme({ primaryColor: color });
                        showToast(`Colore tema impostato su ${btn.textContent}`, 'info', 1500);
                    }
                });
            });
        }

        // Checkbox Forza Modalità Chiara
        if (dom.checkForceLightMode) {
            dom.checkForceLightMode.addEventListener('change', () => {
                const forceLight = dom.checkForceLightMode.checked;
                localStorage.setItem('mainsail_force_light_mode', forceLight);
                applyMainsailTheme({ themeMode: forceLight ? 'light' : 'dark' });
                showToast(`Modalità tema: ${forceLight ? 'Chiaro' : 'Scuro'}`, 'info', 1500);
            });
        }

        // Selettore Lingua Interfaccia (Mainsail Auto vs Manuale)
        const selectUiLang = document.getElementById('select-ui-language');
        if (selectUiLang) {
            selectUiLang.value = localStorage.getItem('klifig_manual_language') || 'auto';
            selectUiLang.addEventListener('change', (e) => {
                const val = e.target.value;
                if (window.i18n) {
                    if (val === 'auto') {
                        localStorage.removeItem('klifig_manual_language');
                        const mainsailLang = localStorage.getItem('mainsail_cached_language') || 'it';
                        window.i18n.setLanguage(mainsailLang, false);
                    } else {
                        window.i18n.setLanguage(val, true);
                    }
                }
                const langName = (selectUiLang.options[selectUiLang.selectedIndex] || {}).textContent || val;
                showToast(window.i18n ? window.i18n.t('toast.lang_set', { lang: langName }) : `Lingua: ${langName}`, 'info', 1800);
            });
        }

        updateSidebarLinks();
    }

    // -------------------------------------------------------------------------
    // Connessione Moonraker & Caricamento Iniziale
    // -------------------------------------------------------------------------
    async function checkMoonrakerConnection() {
        dom.statusText.textContent = 'Verifica connessione...';
        const res = await state.moonraker.testConnection();

        if (res.success) {
            dom.statusDot.classList.add('connected');
            dom.statusText.textContent = 'Moonraker Connesso';

            // Sincronizza tema e impostazioni da Mainsail
            await syncMainsailTheme();

            const filesRes = await state.moonraker.listConfigFiles();
            if (filesRes.success && filesRes.files.length > 0) {
                dom.selectConfigFile.innerHTML = '';
                filesRes.files.forEach(f => {
                    const opt = document.createElement('option');
                    opt.value = f;
                    opt.textContent = f;
                    if (f === state.currentConfigFile) opt.selected = true;
                    dom.selectConfigFile.appendChild(opt);
                });
            }

            await loadConfigFromMoonraker();
        } else {
            dom.statusDot.classList.remove('connected');
            dom.statusText.textContent = 'Moonraker Offline (Usa Locale)';
            showToast('Moonraker offline. Caricata configurazione template.', 'warning', 4500);

            await syncMainsailTheme();

            state.parser.parse(KLIPPER_CONSTANTS.SAMPLE_CONFIG);
            populateUiFromParser();
        }
    }

    async function loadConfigFromMoonraker() {
        const filename = dom.selectConfigFile.value || 'printer.cfg';
        state.currentConfigFile = filename;

        showToast(`Caricamento di ${filename}...`, 'info', 1500);
        const res = await state.moonraker.fetchConfig(filename);

        if (res.success && res.content) {
            state.parser.parse(res.content);
            populateUiFromParser();
            showToast(`${filename} caricato con successo`, 'success');
        } else {
            showToast(`Impossibile leggere ${filename}: ${res.error}. Caricato template.`, 'error');
            state.parser.parse(KLIPPER_CONSTANTS.SAMPLE_CONFIG);
            populateUiFromParser();
        }
    }

    dom.btnReload.addEventListener('click', loadConfigFromMoonraker);
    dom.selectConfigFile.addEventListener('change', loadConfigFromMoonraker);

    // Modal Connessione & Impostazioni
    const openConnSettings = () => {
        if (dom.inputMoonrakerUrl && state.moonraker) {
            dom.inputMoonrakerUrl.value = state.moonraker.baseUrl;
        }
        if (dom.modalConn) dom.modalConn.classList.add('open');
    };

    const targetSettingsBtn = dom.btnSettings || dom.btnConnSettings || document.getElementById('btn-settings');
    if (targetSettingsBtn) {
        targetSettingsBtn.addEventListener('click', openConnSettings);
    }
    if (dom.btnConnSettings && dom.btnConnSettings !== targetSettingsBtn) {
        dom.btnConnSettings.addEventListener('click', openConnSettings);
    }

    if (dom.btnCloseConn) dom.btnCloseConn.addEventListener('click', () => dom.modalConn?.classList.remove('open'));
    if (dom.btnCancelConn) dom.btnCancelConn.addEventListener('click', () => dom.modalConn?.classList.remove('open'));
    if (dom.modalConn) {
        dom.modalConn.addEventListener('click', (e) => {
            if (e.target === dom.modalConn) dom.modalConn.classList.remove('open');
        });
    }

    if (dom.btnSaveConn) {
        dom.btnSaveConn.addEventListener('click', async () => {
            const url = dom.inputMoonrakerUrl?.value.trim() || '';
            state.moonraker.setBaseUrl(url);
            localStorage.setItem('moonraker_url', url);
            if (dom.modalConn) dom.modalConn.classList.remove('open');
            await checkMoonrakerConnection();
        });
    }

    // Rilevamento modifiche in tempo reale su qualsiasi controllo
    document.addEventListener('input', () => {
        if (state.baselineSnapshot) checkDirtyState();
    });
    document.addEventListener('change', () => {
        if (state.baselineSnapshot) checkDirtyState();
    });

    // -------------------------------------------------------------------------
    // Sincronizzazione automatica in tempo reale del Tema Mainsail
    // -------------------------------------------------------------------------
    function initAutomaticThemeSync() {
        if (!state.moonraker) return;

        // 1. WebSocket Moonraker per intercettare aggiornamenti e modifiche al volo
        state.moonraker.on('open', () => {
            syncMainsailTheme();
        });

        state.moonraker.on('message', (msg) => {
            if (!msg) return;
            // Se arrivano eventi correlati a database, configurazione o sistema, sincronizza tema
            if (msg.method === 'notify_update_response' || msg.method === 'notify_service_state_changed') {
                syncMainsailTheme();
            }
        });

        // Avvia connessione websocket persistente
        state.moonraker.connectWebSocket();

        // 2. Polling periodico leggero (ogni 10 secondi) per rilevare se l'utente cambia tema su Mainsail
        setInterval(() => {
            if (state.moonraker && state.moonraker.isConnected) {
                syncMainsailTheme();
            }
        }, 10000);

        // 3. Sincronizzazione immediata quando la finestra torna in primo piano (focus)
        window.addEventListener('focus', () => {
            if (state.moonraker) {
                syncMainsailTheme();
            }
        });

        // 4. Sincronizzazione immediata tra schede del browser (storage event)
        window.addEventListener('storage', (e) => {
            if (e.key === 'mainsail_cached_primary_color' || e.key === 'mainsail_cached_theme_mode') {
                applyMainsailTheme();
            }
        });
    }

    // Avvio: Inizializza Sidebar e Tema Mainsail prima della connessione
    initSidebar();
    applyMainsailTheme();
    initAutomaticThemeSync();
    if (window.i18n) window.i18n.applyTranslations();
    if (window.initTooltips) window.initTooltips();
    checkMoonrakerConnection();
});
