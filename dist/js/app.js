/**
 * Klipper Configurator - Main Application Controller
 * Gestisce l'interfaccia utente unificata (Cinematica + Stampante), supporto IDEX,
 * Multi-Asse Z (Z1, Z2, Z3), parametri di homing estesi e sincronizzazione con Moonraker.
 */

document.addEventListener('DOMContentLoaded', () => {
    const APP_VERSION = 'v0.6.0';

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
        btnConnSettings: document.getElementById('btn-conn-settings'),
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
        toastContainer: document.getElementById('toast-container')
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

        document.getElementById('extruder-sensor-type').value = state.parser.get(ext, 'sensor_type', 'EPCOS 100K B57560G104F');
        document.getElementById('extruder-heater-pin').value = state.parser.get(ext, 'heater_pin', '');
        document.getElementById('extruder-sensor-pin').value = state.parser.get(ext, 'sensor_pin', '');
        document.getElementById('extruder-min-temp').value = state.parser.get(ext, 'min_temp', '0');
        document.getElementById('extruder-max-temp').value = state.parser.get(ext, 'max_temp', '280');
        document.getElementById('extruder-min-extrude').value = state.parser.get(ext, 'min_extrude_temp', '170');

        document.getElementById('extruder-pid-kp').value = state.parser.get(ext, 'pid_Kp', '21.527');
        document.getElementById('extruder-pid-ki').value = state.parser.get(ext, 'pid_Ki', '1.063');
        document.getElementById('extruder-pid-kd').value = state.parser.get(ext, 'pid_Kd', '108.982');

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

        state.parser.set(ext, 'sensor_type', document.getElementById('extruder-sensor-type').value);
        state.parser.set(ext, 'heater_pin', document.getElementById('extruder-heater-pin').value.trim());
        state.parser.set(ext, 'sensor_pin', document.getElementById('extruder-sensor-pin').value.trim());
        state.parser.set(ext, 'min_temp', document.getElementById('extruder-min-temp').value.trim());
        state.parser.set(ext, 'max_temp', document.getElementById('extruder-max-temp').value.trim());
        state.parser.set(ext, 'min_extrude_temp', document.getElementById('extruder-min-extrude').value.trim());

        state.parser.set(ext, 'control', 'pid');
        state.parser.set(ext, 'pid_Kp', document.getElementById('extruder-pid-kp').value.trim());
        state.parser.set(ext, 'pid_Ki', document.getElementById('extruder-pid-ki').value.trim());
        state.parser.set(ext, 'pid_Kd', document.getElementById('extruder-pid-kd').value.trim());

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
                    badge.textContent = 'Modificato';
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

        const snap = {
            fields: {},
            steppers: {},
            extruders: {},
            extraMcus: JSON.stringify(state.extraMcus),
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
        checkExtField('extruder-pressure-advance', 'pressure_advance');

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

        // 5. Macro
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
        document.getElementById('bed-control-type').value = p.get('heater_bed', 'control', 'pid');
        document.getElementById('bed-pid-kp').value = p.get('heater_bed', 'pid_Kp', '54.027');
        document.getElementById('bed-pid-ki').value = p.get('heater_bed', 'pid_Ki', '0.770');
        document.getElementById('bed-pid-kd').value = p.get('heater_bed', 'pid_Kd', '948.182');

        // 6. MISCELEUS
        document.getElementById('fan-part-pin').value = p.get('fan', 'pin', '');
        document.getElementById('fan-part-kick').value = p.get('fan', 'kick_start_time', '0.5');
        document.getElementById('fan-part-off-below').value = p.get('fan', 'off_below', '0.10');

        const hotendFanSec = p.hasSection('heater_fan hotend_fan') ? 'heater_fan hotend_fan' : (p.hasSection('heater_fan') ? 'heater_fan' : null);
        if (hotendFanSec) {
            document.getElementById('fan-hotend-pin').value = p.get(hotendFanSec, 'pin', '');
            document.getElementById('fan-hotend-temp').value = p.get(hotendFanSec, 'heater_temp', '50.0');
        }

        document.getElementById('check-virtual-sd').checked = p.hasSection('virtual_sdcard');
        document.getElementById('virtual-sd-path').value = p.get('virtual_sdcard', 'path', '~/printer_data/gcodes');
        document.getElementById('check-pause-resume').checked = p.hasSection('pause_resume');
        document.getElementById('check-display-status').checked = p.hasSection('display_status');
        document.getElementById('check-respond').checked = p.hasSection('respond');
        document.getElementById('idle-timeout').value = p.get('idle_timeout', 'timeout', '1800');

        // 7. MACRO
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

        // 8. CALIBRATION
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

        // Salva snapshot iniziale della configurazione pulita
        clearAllModifiedIndicators();
        state.baselineSnapshot = takeFullUiSnapshot();
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
        p.set('heater_bed', 'control', document.getElementById('bed-control-type').value);
        p.set('heater_bed', 'pid_Kp', document.getElementById('bed-pid-kp').value.trim());
        p.set('heater_bed', 'pid_Ki', document.getElementById('bed-pid-ki').value.trim());
        p.set('heater_bed', 'pid_Kd', document.getElementById('bed-pid-kd').value.trim());

        // 6. MISCELEUS
        p.set('fan', 'pin', document.getElementById('fan-part-pin').value.trim());
        p.set('fan', 'kick_start_time', document.getElementById('fan-part-kick').value);
        p.set('fan', 'off_below', document.getElementById('fan-part-off-below').value);

        const hotendPin = document.getElementById('fan-hotend-pin').value.trim();
        if (hotendPin) {
            p.set('heater_fan hotend_fan', 'pin', hotendPin);
            p.set('heater_fan hotend_fan', 'heater', 'extruder');
            p.set('heater_fan hotend_fan', 'heater_temp', document.getElementById('fan-hotend-temp').value);
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
    // Connessione Moonraker & Caricamento Iniziale
    // -------------------------------------------------------------------------
    async function checkMoonrakerConnection() {
        dom.statusText.textContent = 'Verifica connessione...';
        const res = await state.moonraker.testConnection();

        if (res.success) {
            dom.statusDot.classList.add('connected');
            dom.statusText.textContent = 'Moonraker Connesso';

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

    // Modal Connessione
    dom.btnConnSettings.addEventListener('click', () => {
        dom.inputMoonrakerUrl.value = state.moonraker.baseUrl;
        dom.modalConn.classList.add('open');
    });
    dom.btnCloseConn.addEventListener('click', () => dom.modalConn.classList.remove('open'));
    dom.btnCancelConn.addEventListener('click', () => dom.modalConn.classList.remove('open'));
    dom.btnSaveConn.addEventListener('click', async () => {
        const url = dom.inputMoonrakerUrl.value.trim();
        state.moonraker.setBaseUrl(url);
        localStorage.setItem('moonraker_url', url);
        dom.modalConn.classList.remove('open');
        await checkMoonrakerConnection();
    });

    // Rilevamento modifiche in tempo reale su qualsiasi controllo
    document.addEventListener('input', () => {
        if (state.baselineSnapshot) checkDirtyState();
    });
    document.addEventListener('change', () => {
        if (state.baselineSnapshot) checkDirtyState();
    });

    // Avvio
    checkMoonrakerConnection();
});
