/**
 * Klipper Configurator - Main Application Controller
 * Gestisce l'interfaccia utente, il sincronismo bidirezionale con KlipperConfigParser
 * e le chiamate API verso Moonraker per Mainsail WebUI.
 */

document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------------------
    // Stato Applicazione
    // -------------------------------------------------------------------------
    const state = {
        parser: new KlipperConfigParser(),
        moonraker: new MoonrakerClient(localStorage.getItem('moonraker_url') || ''),
        currentConfigFile: 'printer.cfg',
        currentStepper: 'stepper_x',
        macros: []
    };

    // -------------------------------------------------------------------------
    // Elementi DOM Principali
    // -------------------------------------------------------------------------
    const dom = {
        // Status & Navbar
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
        
        // Stepper Subtabs
        subtabButtons: document.querySelectorAll('.subtab-btn'),
        stepperCardTitle: document.getElementById('stepper-card-title'),
        stepperCardTag: document.getElementById('stepper-card-tag'),
        driverCardTitle: document.getElementById('driver-card-title'),
        driverCardTag: document.getElementById('driver-card-tag'),
        
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

        // Presets
        presetPrinterSelect: document.getElementById('preset-printer-select'),
        btnApplyPreset: document.getElementById('btn-apply-preset'),
        extruderPresetSelect: document.getElementById('extruder-preset-select'),

        // Toast
        toastContainer: document.getElementById('toast-container')
    };

    // -------------------------------------------------------------------------
    // Gestione Notifiche Toast
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
    // Navigazione Tab
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

    // Subtabs per gli Stepper (X, Y, Z, Z1)
    dom.subtabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Salva le modifiche dello stepper corrente nel parser prima di cambiare
            saveCurrentStepperToParser();
            
            dom.subtabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.currentStepper = btn.getAttribute('data-stepper');
            loadCurrentStepperFromParser();
        });
    });

    // -------------------------------------------------------------------------
    // Dinamica Campi (Visibility Toggles)
    // -------------------------------------------------------------------------
    // Cinematica Delta card
    const printerKinematics = document.getElementById('printer-kinematics');
    const cardDeltaParams = document.getElementById('card-delta-params');
    printerKinematics.addEventListener('change', () => {
        cardDeltaParams.style.display = printerKinematics.value === 'delta' ? 'block' : 'none';
    });

    // Host MCU Connection type
    const mcuConnType = document.getElementById('mcu-conn-type');
    const groupMcuSerial = document.getElementById('group-mcu-serial');
    const groupMcuCanbus = document.getElementById('group-mcu-canbus');
    mcuConnType.addEventListener('change', () => {
        if (mcuConnType.value === 'canbus') {
            groupMcuSerial.style.display = 'none';
            groupMcuCanbus.style.display = 'block';
        } else {
            groupMcuSerial.style.display = 'block';
            groupMcuCanbus.style.display = 'none';
        }
    });

    // Extra MCU Toggle
    const checkEnableExtraMcu = document.getElementById('check-enable-extra-mcu');
    const extraMcuFields = document.getElementById('extra-mcu-fields');
    checkEnableExtraMcu.addEventListener('change', () => {
        extraMcuFields.style.display = checkEnableExtraMcu.checked ? 'block' : 'none';
    });

    // Stepper Driver Smart Fields Toggle
    const driverModelSelect = document.getElementById('driver-model-select');
    const driverSmartFields = document.getElementById('driver-smart-fields');
    driverModelSelect.addEventListener('change', () => {
        driverSmartFields.style.display = driverModelSelect.value === 'none' ? 'none' : 'block';
    });

    // Sensorless Homing Toggle
    const driverSensorlessEnable = document.getElementById('driver-sensorless-enable');
    const sensorlessDetails = document.getElementById('sensorless-details');
    driverSensorlessEnable.addEventListener('change', () => {
        sensorlessDetails.style.display = driverSensorlessEnable.checked ? 'block' : 'none';
    });

    // Probe Type Toggle
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

    // Safe Z Home Toggle
    const checkEnableSafeZ = document.getElementById('check-enable-safe-z');
    const safeZFields = document.getElementById('safe-z-fields');
    checkEnableSafeZ.addEventListener('change', () => {
        safeZFields.style.display = checkEnableSafeZ.checked ? 'block' : 'none';
    });

    // Input Shaper Toggle
    const checkEnableShaper = document.getElementById('check-enable-shaper');
    const shaperFields = document.getElementById('shaper-fields');
    checkEnableShaper.addEventListener('change', () => {
        shaperFields.style.display = checkEnableShaper.checked ? 'block' : 'none';
    });

    // Invert pin checkboxes (Dir Pin, Enable Pin)
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
            const res = teeth * 2; // GT2 = 2mm pitch
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
        if (dom.calcDriveType.value === 'belt') {
            dom.calcBeltFields.style.display = 'block';
            dom.calcLeadFields.style.display = 'none';
        } else {
            dom.calcBeltFields.style.display = 'none';
            dom.calcLeadFields.style.display = 'block';
        }
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
    // Preset Stampanti e Preset Estrusori
    // -------------------------------------------------------------------------
    dom.btnApplyPreset.addEventListener('click', () => {
        const key = dom.presetPrinterSelect.value;
        if (!key || !KLIPPER_CONSTANTS.PRINTER_PRESETS[key]) {
            showToast('Seleziona un modello valido dall\'elenco', 'warning');
            return;
        }
        const p = KLIPPER_CONSTANTS.PRINTER_PRESETS[key];
        
        // Applica a Stampante
        printerKinematics.value = p.kinematics;
        document.getElementById('printer-max-velocity').value = p.max_velocity;
        document.getElementById('printer-max-accel').value = p.max_accel;
        printerKinematics.dispatchEvent(new Event('change'));

        // Applica a Limiti Asse
        document.getElementById('x-pos-min').value = p.x_min;
        document.getElementById('x-pos-max').value = p.x_max;
        document.getElementById('x-pos-endstop').value = p.x_endstop;

        document.getElementById('y-pos-min').value = p.y_min;
        document.getElementById('y-pos-max').value = p.y_max;
        document.getElementById('y-pos-endstop').value = p.y_endstop;

        document.getElementById('z-pos-min').value = p.z_min;
        document.getElementById('z-pos-max').value = p.z_max;
        document.getElementById('z-pos-endstop').value = p.z_endstop;

        // Bed Mesh e Safe Z Home
        document.getElementById('safe-z-pos').value = `${p.bed_x / 2}, ${p.bed_y / 2}`;
        document.getElementById('mesh-min').value = `15, 15`;
        document.getElementById('mesh-max').value = `${p.bed_x - 15}, ${p.bed_y - 15}`;

        showToast(`Parametri per ${p.title} applicati con successo!`, 'success');
    });

    dom.extruderPresetSelect.addEventListener('change', () => {
        const key = dom.extruderPresetSelect.value;
        if (!key || !KLIPPER_CONSTANTS.EXTRUDER_PRESETS[key]) return;
        const e = KLIPPER_CONSTANTS.EXTRUDER_PRESETS[key];

        document.getElementById('extruder-rot-dist').value = e.rotation_distance;
        document.getElementById('extruder-gear-ratio').value = e.gear_ratio;
        showToast(`Parametri estrusore "${e.name}" impostati`, 'info');
    });

    // -------------------------------------------------------------------------
    // Gestione Stepper Corrente
    // -------------------------------------------------------------------------
    function getDriverSectionName(stepperName) {
        // Cerca se esiste già un tmc nella configurazione
        for (const driverType of ['tmc2209', 'tmc2208', 'tmc2226', 'tmc5160', 'tmc2240']) {
            if (state.parser.hasSection(`${driverType} ${stepperName}`)) {
                return { type: driverType, section: `${driverType} ${stepperName}` };
            }
        }
        return { type: 'tmc2209', section: `tmc2209 ${stepperName}` };
    }

    function loadCurrentStepperFromParser() {
        const s = state.currentStepper;
        const axisLetter = s.replace('stepper_', '').toUpperCase();
        dom.stepperCardTitle.textContent = `Configurazione Motore Asse ${axisLetter}`;
        dom.stepperCardTag.textContent = `[${s}]`;

        // Carica campi motore
        document.getElementById('stepper-step-pin').value = state.parser.get(s, 'step_pin', '');
        
        const dirPin = state.parser.get(s, 'dir_pin', '');
        document.getElementById('stepper-dir-pin').value = dirPin;
        document.getElementById('check-invert-dir').checked = dirPin.startsWith('!');

        const enablePin = state.parser.get(s, 'enable_pin', '');
        document.getElementById('stepper-enable-pin').value = enablePin;
        document.getElementById('check-invert-enable').checked = enablePin.startsWith('!');

        document.getElementById('stepper-microsteps').value = state.parser.get(s, 'microsteps', '16');
        document.getElementById('stepper-steps-rotation').value = state.parser.get(s, 'full_steps_per_rotation', '200');
        document.getElementById('stepper-rotation-distance').value = state.parser.get(s, 'rotation_distance', '40.0');
        document.getElementById('stepper-endstop-pin').value = state.parser.get(s, 'endstop_pin', '');

        // Carica campi driver
        const driverInfo = getDriverSectionName(s);
        const hasDriver = state.parser.hasSection(driverInfo.section);

        dom.driverCardTitle.textContent = `Driver Stepper Asse ${axisLetter}`;
        dom.driverCardTag.textContent = `[${hasDriver ? driverInfo.section : 'Driver Non Configurato'}]`;

        if (!hasDriver) {
            driverModelSelect.value = 'none';
            driverSmartFields.style.display = 'none';
        } else {
            driverModelSelect.value = driverInfo.type;
            driverSmartFields.style.display = 'block';
            document.getElementById('driver-uart-pin').value = state.parser.get(driverInfo.section, 'uart_pin', state.parser.get(driverInfo.section, 'cs_pin', ''));
            document.getElementById('driver-run-current').value = state.parser.get(driverInfo.section, 'run_current', '0.800');
            document.getElementById('driver-stealthchop').value = state.parser.get(driverInfo.section, 'stealthchop_threshold', '999999');
            document.getElementById('driver-interpolate').checked = state.parser.get(driverInfo.section, 'interpolate', 'True').toLowerCase() === 'true';

            // Sensorless
            const diagPin = state.parser.get(driverInfo.section, 'diag_pin', '');
            const sgthrs = state.parser.get(driverInfo.section, 'driver_SGTHRS', '');
            if (diagPin || sgthrs) {
                driverSensorlessEnable.checked = true;
                sensorlessDetails.style.display = 'block';
                document.getElementById('driver-diag-pin').value = diagPin;
                document.getElementById('driver-sgthrs').value = sgthrs;
            } else {
                driverSensorlessEnable.checked = false;
                sensorlessDetails.style.display = 'none';
                document.getElementById('driver-diag-pin').value = '';
                document.getElementById('driver-sgthrs').value = '';
            }
        }
    }

    function saveCurrentStepperToParser() {
        const s = state.currentStepper;

        state.parser.set(s, 'step_pin', document.getElementById('stepper-step-pin').value.trim());
        state.parser.set(s, 'dir_pin', document.getElementById('stepper-dir-pin').value.trim());
        state.parser.set(s, 'enable_pin', document.getElementById('stepper-enable-pin').value.trim());
        state.parser.set(s, 'microsteps', document.getElementById('stepper-microsteps').value);
        state.parser.set(s, 'full_steps_per_rotation', document.getElementById('stepper-steps-rotation').value);
        state.parser.set(s, 'rotation_distance', document.getElementById('stepper-rotation-distance').value.trim());
        state.parser.set(s, 'endstop_pin', document.getElementById('stepper-endstop-pin').value.trim());

        // Driver
        const selectedModel = driverModelSelect.value;
        // Rimuovi sezioni driver vecchie per questo stepper
        for (const d of ['tmc2209', 'tmc2208', 'tmc2226', 'tmc5160', 'tmc2240']) {
            state.parser.removeSection(`${d} ${s}`);
        }

        if (selectedModel !== 'none') {
            const driverSec = `${selectedModel} ${s}`;
            const uartPin = document.getElementById('driver-uart-pin').value.trim();
            if (selectedModel === 'tmc5160') {
                state.parser.set(driverSec, 'cs_pin', uartPin);
            } else {
                state.parser.set(driverSec, 'uart_pin', uartPin);
            }
            state.parser.set(driverSec, 'run_current', document.getElementById('driver-run-current').value.trim());
            state.parser.set(driverSec, 'interpolate', document.getElementById('driver-interpolate').checked ? 'True' : 'False');
            state.parser.set(driverSec, 'stealthchop_threshold', document.getElementById('driver-stealthchop').value);

            if (driverSensorlessEnable.checked) {
                state.parser.set(driverSec, 'diag_pin', document.getElementById('driver-diag-pin').value.trim());
                state.parser.set(driverSec, 'driver_SGTHRS', document.getElementById('driver-sgthrs').value.trim());
            }
        }
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

        // Event listener per modifiche macro
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
                // Estrai il blocco gcode interno
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
        showToast(`${count} macro template essenziali inserite`, 'success');
    }

    dom.btnAddMacro.addEventListener('click', () => {
        const name = prompt('Inserisci il nome della nuova Macro (es: PURGE_NOZZLE, M600):');
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
            gcode: '; Inserisci qui i comandi G-Code\nG90\nG28'
        });
        renderMacroList();
        showToast(`Macro ${cleanName} creata`, 'success');
    });

    dom.btnInsertMacroTemplate.addEventListener('click', insertMacroTemplates);

    // -------------------------------------------------------------------------
    // Sincronizzazione Completa: Parser -> UI
    // -------------------------------------------------------------------------
    function populateUiFromParser() {
        const p = state.parser;

        // 1. STAMPANTE [printer]
        printerKinematics.value = p.get('printer', 'kinematics', 'cartesian');
        document.getElementById('printer-max-velocity').value = p.get('printer', 'max_velocity', '300');
        document.getElementById('printer-max-accel').value = p.get('printer', 'max_accel', '3000');
        document.getElementById('printer-cruise-ratio').value = p.get('printer', 'minimum_cruise_ratio', '0.5');
        document.getElementById('printer-square-corner').value = p.get('printer', 'square_corner_velocity', '5.0');
        document.getElementById('printer-max-z-velocity').value = p.get('printer', 'max_z_velocity', '15');
        document.getElementById('printer-max-z-accel').value = p.get('printer', 'max_z_accel', '100');
        document.getElementById('printer-max-accel-to-decel').value = p.get('printer', 'max_accel_to_decel', '');
        printerKinematics.dispatchEvent(new Event('change'));

        // 2. CINEMATICA (Assi e Limiti)
        document.getElementById('x-pos-min').value = p.get('stepper_x', 'position_min', '0');
        document.getElementById('x-pos-max').value = p.get('stepper_x', 'position_max', '235');
        document.getElementById('x-pos-endstop').value = p.get('stepper_x', 'position_endstop', '0');
        document.getElementById('x-homing-speed').value = p.get('stepper_x', 'homing_speed', '50.0');

        document.getElementById('y-pos-min').value = p.get('stepper_y', 'position_min', '0');
        document.getElementById('y-pos-max').value = p.get('stepper_y', 'position_max', '235');
        document.getElementById('y-pos-endstop').value = p.get('stepper_y', 'position_endstop', '0');
        document.getElementById('y-homing-speed').value = p.get('stepper_y', 'homing_speed', '50.0');

        document.getElementById('z-pos-min').value = p.get('stepper_z', 'position_min', '-2.0');
        document.getElementById('z-pos-max').value = p.get('stepper_z', 'position_max', '250');
        document.getElementById('z-pos-endstop').value = p.get('stepper_z', 'position_endstop', '0.0');
        document.getElementById('z-homing-speed').value = p.get('stepper_z', 'homing_speed', '10.0');

        // Delta
        document.getElementById('delta-arm-length').value = p.get('delta', 'arm_length', '265.0');
        document.getElementById('delta-radius').value = p.get('delta', 'delta_radius', '130.0');
        document.getElementById('delta-print-radius').value = p.get('delta', 'print_radius', '100.0');

        // 3. HOST / MCU
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

        // 4. STEPPER & DRIVER
        loadCurrentStepperFromParser();

        // 5. EXTRUDER
        document.getElementById('extruder-step-pin').value = p.get('extruder', 'step_pin', '');
        document.getElementById('extruder-dir-pin').value = p.get('extruder', 'dir_pin', '');
        document.getElementById('extruder-enable-pin').value = p.get('extruder', 'enable_pin', '');
        document.getElementById('extruder-rot-dist').value = p.get('extruder', 'rotation_distance', '22.678');
        document.getElementById('extruder-gear-ratio').value = p.get('extruder', 'gear_ratio', '');
        document.getElementById('extruder-nozzle-dia').value = p.get('extruder', 'nozzle_diameter', '0.400');
        document.getElementById('extruder-filament-dia').value = p.get('extruder', 'filament_diameter', '1.750');
        document.getElementById('extruder-pressure-advance').value = p.get('extruder', 'pressure_advance', '0.040');

        document.getElementById('extruder-sensor-type').value = p.get('extruder', 'sensor_type', 'EPCOS 100K B57560G104F');
        document.getElementById('extruder-heater-pin').value = p.get('extruder', 'heater_pin', '');
        document.getElementById('extruder-sensor-pin').value = p.get('extruder', 'sensor_pin', '');
        document.getElementById('extruder-min-temp').value = p.get('extruder', 'min_temp', '0');
        document.getElementById('extruder-max-temp').value = p.get('extruder', 'max_temp', '280');
        document.getElementById('extruder-min-extrude').value = p.get('extruder', 'min_extrude_temp', '170');

        document.getElementById('extruder-pid-kp').value = p.get('extruder', 'pid_Kp', '21.527');
        document.getElementById('extruder-pid-ki').value = p.get('extruder', 'pid_Ki', '1.063');
        document.getElementById('extruder-pid-kd').value = p.get('extruder', 'pid_Kd', '108.982');

        // 6. BED
        document.getElementById('bed-sensor-type').value = p.get('heater_bed', 'sensor_type', 'EPCOS 100K B57560G104F');
        document.getElementById('bed-heater-pin').value = p.get('heater_bed', 'heater_pin', '');
        document.getElementById('bed-sensor-pin').value = p.get('heater_bed', 'sensor_pin', '');
        document.getElementById('bed-min-temp').value = p.get('heater_bed', 'min_temp', '0');
        document.getElementById('bed-max-temp').value = p.get('heater_bed', 'max_temp', '110');
        document.getElementById('bed-control-type').value = p.get('heater_bed', 'control', 'pid');
        document.getElementById('bed-pid-kp').value = p.get('heater_bed', 'pid_Kp', '54.027');
        document.getElementById('bed-pid-ki').value = p.get('heater_bed', 'pid_Ki', '0.770');
        document.getElementById('bed-pid-kd').value = p.get('heater_bed', 'pid_Kd', '948.182');

        // 7. MISCELEUS
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

        // Input Shaper
        document.getElementById('check-enable-shaper').checked = p.hasSection('input_shaper');
        document.getElementById('shaper-freq-x').value = p.get('input_shaper', 'shaper_freq_x', '45.2');
        document.getElementById('shaper-type-x').value = p.get('input_shaper', 'shaper_type_x', 'mzv');
        document.getElementById('shaper-freq-y').value = p.get('input_shaper', 'shaper_freq_y', '42.0');
        document.getElementById('shaper-type-y').value = p.get('input_shaper', 'shaper_type_y', 'mzv');
        checkEnableShaper.dispatchEvent(new Event('change'));
    }

    // -------------------------------------------------------------------------
    // Sincronizzazione Completa: UI -> Parser
    // -------------------------------------------------------------------------
    function updateParserFromUi() {
        const p = state.parser;

        // Salva lo stepper attualmente visualizzato
        saveCurrentStepperToParser();

        // 1. STAMPANTE [printer]
        p.set('printer', 'kinematics', printerKinematics.value);
        p.set('printer', 'max_velocity', document.getElementById('printer-max-velocity').value);
        p.set('printer', 'max_accel', document.getElementById('printer-max-accel').value);
        p.set('printer', 'minimum_cruise_ratio', document.getElementById('printer-cruise-ratio').value);
        p.set('printer', 'square_corner_velocity', document.getElementById('printer-square-corner').value);
        p.set('printer', 'max_z_velocity', document.getElementById('printer-max-z-velocity').value);
        p.set('printer', 'max_z_accel', document.getElementById('printer-max-z-accel').value);
        const legacyAccel = document.getElementById('printer-max-accel-to-decel').value;
        if (legacyAccel) p.set('printer', 'max_accel_to_decel', legacyAccel);

        // 2. CINEMATICA (Assi X, Y, Z)
        p.set('stepper_x', 'position_min', document.getElementById('x-pos-min').value);
        p.set('stepper_x', 'position_max', document.getElementById('x-pos-max').value);
        p.set('stepper_x', 'position_endstop', document.getElementById('x-pos-endstop').value);
        p.set('stepper_x', 'homing_speed', document.getElementById('x-homing-speed').value);

        p.set('stepper_y', 'position_min', document.getElementById('y-pos-min').value);
        p.set('stepper_y', 'position_max', document.getElementById('y-pos-max').value);
        p.set('stepper_y', 'position_endstop', document.getElementById('y-pos-endstop').value);
        p.set('stepper_y', 'homing_speed', document.getElementById('y-homing-speed').value);

        p.set('stepper_z', 'position_min', document.getElementById('z-pos-min').value);
        p.set('stepper_z', 'position_max', document.getElementById('z-pos-max').value);
        const zEndstop = document.getElementById('z-pos-endstop').value;
        if (zEndstop) p.set('stepper_z', 'position_endstop', zEndstop);
        p.set('stepper_z', 'homing_speed', document.getElementById('z-homing-speed').value);

        // 3. HOST / MCU
        if (mcuConnType.value === 'canbus') {
            p.set('mcu', 'canbus_uuid', document.getElementById('mcu-canbus-uuid').value.trim());
            p.set('mcu', 'serial', null);
        } else {
            p.set('mcu', 'serial', document.getElementById('mcu-serial').value.trim());
            p.set('mcu', 'canbus_uuid', null);
        }
        p.set('mcu', 'baud', document.getElementById('mcu-baud').value);
        p.set('mcu', 'restart_method', document.getElementById('mcu-restart-method').value);

        // Host thermal sensor
        if (document.getElementById('check-enable-host-temp').checked) {
            p.set('temperature_sensor raspberry_pi', 'sensor_type', 'temperature_host');
            p.set('temperature_sensor raspberry_pi', 'min_temp', '10');
            p.set('temperature_sensor raspberry_pi', 'max_temp', '85');
        } else {
            p.removeSection('temperature_sensor raspberry_pi');
            p.removeSection('temperature_sensor host');
        }

        // MCU thermal sensor
        if (document.getElementById('check-enable-mcu-temp').checked) {
            p.set('temperature_sensor mcu_temp', 'sensor_type', 'temperature_mcu');
            p.set('temperature_sensor mcu_temp', 'min_temp', '0');
            p.set('temperature_sensor mcu_temp', 'max_temp', '100');
        } else {
            p.removeSection('temperature_sensor mcu_temp');
        }

        // 5. EXTRUDER
        p.set('extruder', 'step_pin', document.getElementById('extruder-step-pin').value.trim());
        p.set('extruder', 'dir_pin', document.getElementById('extruder-dir-pin').value.trim());
        p.set('extruder', 'enable_pin', document.getElementById('extruder-enable-pin').value.trim());
        p.set('extruder', 'rotation_distance', document.getElementById('extruder-rot-dist').value.trim());
        p.set('extruder', 'gear_ratio', document.getElementById('extruder-gear-ratio').value.trim());
        p.set('extruder', 'nozzle_diameter', document.getElementById('extruder-nozzle-dia').value.trim());
        p.set('extruder', 'filament_diameter', document.getElementById('extruder-filament-dia').value);
        p.set('extruder', 'pressure_advance', document.getElementById('extruder-pressure-advance').value.trim());

        p.set('extruder', 'sensor_type', document.getElementById('extruder-sensor-type').value);
        p.set('extruder', 'heater_pin', document.getElementById('extruder-heater-pin').value.trim());
        p.set('extruder', 'sensor_pin', document.getElementById('extruder-sensor-pin').value.trim());
        p.set('extruder', 'min_temp', document.getElementById('extruder-min-temp').value.trim());
        p.set('extruder', 'max_temp', document.getElementById('extruder-max-temp').value.trim());
        p.set('extruder', 'min_extrude_temp', document.getElementById('extruder-min-extrude').value.trim());

        p.set('extruder', 'control', 'pid');
        p.set('extruder', 'pid_Kp', document.getElementById('extruder-pid-kp').value.trim());
        p.set('extruder', 'pid_Ki', document.getElementById('extruder-pid-ki').value.trim());
        p.set('extruder', 'pid_Kd', document.getElementById('extruder-pid-kd').value.trim());

        // 6. BED
        p.set('heater_bed', 'heater_pin', document.getElementById('bed-heater-pin').value.trim());
        p.set('heater_bed', 'sensor_type', document.getElementById('bed-sensor-type').value);
        p.set('heater_bed', 'sensor_pin', document.getElementById('bed-sensor-pin').value.trim());
        p.set('heater_bed', 'min_temp', document.getElementById('bed-min-temp').value.trim());
        p.set('heater_bed', 'max_temp', document.getElementById('bed-max-temp').value.trim());
        p.set('heater_bed', 'control', document.getElementById('bed-control-type').value);
        p.set('heater_bed', 'pid_Kp', document.getElementById('bed-pid-kp').value.trim());
        p.set('heater_bed', 'pid_Ki', document.getElementById('bed-pid-ki').value.trim());
        p.set('heater_bed', 'pid_Kd', document.getElementById('bed-pid-kd').value.trim());

        // 7. MISCELEUS
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
            p.set('pause_resume', '', null); // sezione senza parametri obbligatori
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

        // 8. MACRO
        // Rimuovi sezioni macro esistenti e riscrivile
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

        // 9. CALIBRATION
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
        showToast(`File ${state.currentConfigFile} scaricato con successo`, 'success');
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

            // Carica l'elenco dei file .cfg
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

            // Scarica il file selezionato
            await loadConfigFromMoonraker();
        } else {
            dom.statusDot.classList.remove('connected');
            dom.statusText.textContent = 'Moonraker Offline (Usa Locale)';
            showToast('Moonraker non raggiungibile. Modalità Offline attiva (usando configurazione template).', 'warning', 4500);

            // Carica il template di default
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

    // Avvio Iniziale
    checkMoonrakerConnection();
});
