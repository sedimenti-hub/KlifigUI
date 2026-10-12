/**
 * KlipperConfigParser
 * Parser e Serializzatore bidirezionale per file di configurazione Klipper (printer.cfg / config.cfg)
 * Gestisce sezioni INI, macro G-Code multilinea, commenti e la sezione speciale SAVE_CONFIG.
 */

class KlipperConfigParser {
    constructor() {
        this.rawLines = [];
        this.sections = {};      // { "section_name": { params: { key: value }, comments: [], rawLines: [] } }
        this.sectionOrder = [];  // Ordine originale delle sezioni
        this.saveConfigBlock = null; // Testo del blocco '#*# <---------------------- SAVE_CONFIG ---------------------->'
        this.headerComments = [];
    }

    /**
     * Esegue il parsing del testo grezzo del file .cfg
     * @param {string} text - Contenuto del file printer.cfg
     */
    parse(text) {
        this.rawLines = text.split(/\r?\n/);
        this.sections = {};
        this.sectionOrder = [];
        this.saveConfigBlock = null;
        this.headerComments = [];

        let currentSection = null;
        let inSaveConfig = false;
        let saveConfigLines = [];
        let pendingComments = [];
        let currentParamKey = null;

        for (let i = 0; i < this.rawLines.length; i++) {
            const line = this.rawLines[i];
            const trimmed = line.trim();

            // Rilevamento inizio blocco SAVE_CONFIG automatico di Klipper
            if (trimmed.includes('<---------------------- SAVE_CONFIG ---------------------->')) {
                inSaveConfig = true;
                saveConfigLines.push(line);
                continue;
            }

            if (inSaveConfig) {
                saveConfigLines.push(line);
                continue;
            }

            // Linee vuote o commenti
            if (trimmed.startsWith('#') || trimmed.length === 0) {
                if (!currentSection) {
                    this.headerComments.push(line);
                } else {
                    pendingComments.push(line);
                }
                continue;
            }

            // Rilevamento intestazione sezione [nome_sezione]
            const sectionMatch = trimmed.match(/^\[([^\]]+)\]$/);
            if (sectionMatch) {
                currentSection = sectionMatch[1].trim();
                currentParamKey = null;

                if (!this.sections[currentSection]) {
                    this.sections[currentSection] = {
                        name: currentSection,
                        params: {},
                        comments: [...pendingComments],
                        paramOrder: []
                    };
                    this.sectionOrder.push(currentSection);
                }
                pendingComments = [];
                continue;
            }

            // Se siamo all'interno di una sezione
            if (currentSection) {
                // Controllo se è un parametro indentato (continuazione di macro o lista)
                if ((line.startsWith(' ') || line.startsWith('\t')) && currentParamKey) {
                    const currentVal = this.sections[currentSection].params[currentParamKey];
                    this.sections[currentSection].params[currentParamKey] = currentVal + '\n' + line;
                    continue;
                }

                // Parametro chiave: valore oppure chiave = valore
                const paramMatch = line.match(/^([^:=#\s][^:=]*)\s*[:=]\s*(.*)$/);
                if (paramMatch) {
                    const key = paramMatch[1].trim();
                    const val = paramMatch[2].trim();
                    currentParamKey = key;

                    this.sections[currentSection].params[key] = val;
                    if (!this.sections[currentSection].paramOrder.includes(key)) {
                        this.sections[currentSection].paramOrder.push(key);
                    }
                    pendingComments = [];
                }
            }
        }

        if (saveConfigLines.length > 0) {
            this.saveConfigBlock = saveConfigLines.join('\n');
        }

        return this.sections;
    }

    /**
     * Recupera un parametro di una specifica sezione
     */
    get(sectionName, key, defaultValue = '') {
        const sec = this.sections[sectionName];
        if (sec && sec.params && sec.params[key] !== undefined) {
            return sec.params[key];
        }
        return defaultValue;
    }

    /**
     * Imposta o aggiorna un parametro in una sezione (creandola se non esiste)
     */
    set(sectionName, key, value) {
        if (!this.sections[sectionName]) {
            this.sections[sectionName] = {
                name: sectionName,
                params: {},
                comments: [],
                paramOrder: []
            };
            if (!this.sectionOrder.includes(sectionName)) {
                this.sectionOrder.push(sectionName);
            }
        }

        const sec = this.sections[sectionName];
        if (value === null || value === undefined || value === '') {
            // Se il valore è vuoto, rimuovi il parametro se presente
            delete sec.params[key];
            sec.paramOrder = sec.paramOrder.filter(k => k !== key);
        } else {
            sec.params[key] = String(value);
            if (!sec.paramOrder.includes(key)) {
                sec.paramOrder.push(key);
            }
        }
    }

    /**
     * Rimuove una sezione
     */
    removeSection(sectionName) {
        delete this.sections[sectionName];
        this.sectionOrder = this.sectionOrder.filter(s => s !== sectionName);
    }

    /**
     * Verifica se una sezione esiste
     */
    hasSection(sectionName) {
        return !!this.sections[sectionName];
    }

    /**
     * Trova tutte le sezioni che iniziano con un prefisso (es: "gcode_macro", "tmc2209", "temperature_sensor")
     */
    findSectionsByPrefix(prefix) {
        return this.sectionOrder.filter(s => s.startsWith(prefix));
    }

    /**
     * Serializza l'intera configurazione tornando il testo formattato valido per Klipper
     */
    generateConfig() {
        const outputLines = [];

        // Inserisci intestazione iniziale
        if (this.headerComments.length > 0) {
            outputLines.push(...this.headerComments);
        } else {
            outputLines.push('# ====================================================================');
            outputLines.push('# Klipper Configuration File');
            outputLines.push('# Generato con Klipper WebUI Configurator per Mainsail');
            outputLines.push('# Data: ' + new Date().toLocaleString());
            outputLines.push('# ====================================================================');
            outputLines.push('');
        }

        // Definisci un raggruppamento logico consigliato per l'ordine di scrittura
        const orderedSections = [...this.sectionOrder];

        for (const sectionName of orderedSections) {
            const sec = this.sections[sectionName];
            if (!sec) continue;

            outputLines.push(`[${sectionName}]`);

            for (const key of sec.paramOrder) {
                const val = sec.params[key];
                if (val === undefined || val === null) continue;

                if (String(val).includes('\n')) {
                    // Valore multilinea (es: gcode delle macro)
                    outputLines.push(`${key}:`);
                    const subLines = String(val).split('\n');
                    for (const sub of subLines) {
                        // Assicurati che ogni linea multilinea sia indentata di 4 spazi se non lo è già
                        const formattedSub = sub.startsWith(' ') || sub.startsWith('\t') ? sub : `    ${sub}`;
                        outputLines.push(formattedSub);
                    }
                } else {
                    outputLines.push(`${key}: ${val}`);
                }
            }
            outputLines.push(''); // Linea vuota di separazione
        }

        // Se presente, accoda il blocco SAVE_CONFIG intatto alla fine
        if (this.saveConfigBlock) {
            outputLines.push(this.saveConfigBlock);
        }

        return outputLines.join('\n');
    }
}

// Esporta la classe per l'utilizzo nel browser o NodeJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KlipperConfigParser;
}
