/**
 * MoonrakerClient
 * Gestisce la comunicazione con l'API REST di Moonraker su Klipper
 */

class MoonrakerClient {
    constructor(baseUrl = '') {
        this.setBaseUrl(baseUrl || this.detectBaseUrl());
        this.isConnected = false;
        this.printerInfo = null;
    }

    /**
     * Rileva automaticamente l'indirizzo di Moonraker.
     * Se ci troviamo sulla stessa origine (es: Mainsail su porta 80 o reverse proxy), usa l'origine corrente.
     * Altrimenti fallback su http://localhost:7125
     */
    detectBaseUrl() {
        if (typeof window !== 'undefined' && window.location && window.location.origin) {
            // Se eseguito direttamente come file locale (file://)
            if (window.location.protocol === 'file:') {
                return 'http://127.0.0.1:7125';
            }
            return window.location.origin;
        }
        return 'http://127.0.0.1:7125';
    }

    setBaseUrl(url) {
        // Rimuove eventuali slash finali
        this.baseUrl = url.replace(/\/+$/, '');
    }

    /**
     * Testa la connessione a Moonraker
     */
    async testConnection() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4000);

            const res = await fetch(`${this.baseUrl}/server/info`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (res.ok) {
                const data = await res.json();
                this.isConnected = true;
                return { success: true, data: data.result };
            }
            return { success: false, error: `HTTP ${res.status}` };
        } catch (err) {
            this.isConnected = false;
            return { success: false, error: err.message };
        }
    }

    /**
     * Recupera lo stato attuale della stampante Klipper
     */
    async getPrinterInfo() {
        try {
            const res = await fetch(`${this.baseUrl}/printer/info`);
            if (res.ok) {
                const data = await res.json();
                this.printerInfo = data.result;
                return { success: true, data: data.result };
            }
            return { success: false, error: `HTTP ${res.status}` };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }

    /**
     * Recupera le impostazioni salvate da Mainsail nel database di Moonraker (tema, colori, preferenze UI)
     * Endpoint: GET /server/database/item?namespace=mainsail
     */
    async getMainsailSettings() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3500);

            const res = await fetch(`${this.baseUrl}/server/database/item?namespace=mainsail`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (res.ok) {
                const data = await res.json();
                return { success: true, settings: data.result ? data.result.value : null };
            }
            return { success: false, error: `HTTP ${res.status}` };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }

    /**
     * Verifica la presenza di un file custom.css all'interno della cartella .theme
     */
    async checkCustomCss() {
        try {
            const res = await fetch(`${this.baseUrl}/server/files/config/.theme/custom.css?t=${Date.now()}`, {
                method: 'HEAD'
            });
            return res.ok;
        } catch (_) {
            return false;
        }
    }

    /**
     * Elenca i file disponibili nella directory di configurazione di Klipper
     */
    async listConfigFiles() {
        try {
            const res = await fetch(`${this.baseUrl}/server/files/directory?path=config`);
            if (res.ok) {
                const data = await res.json();
                const files = data.result.files
                    .filter(f => f.filename.endsWith('.cfg'))
                    .map(f => f.filename);
                return { success: true, files };
            }
            return { success: false, files: ['printer.cfg'] };
        } catch (err) {
            return { success: false, files: ['printer.cfg'], error: err.message };
        }
    }

    /**
     * Scarica il contenuto del file di configurazione (es. printer.cfg o config.cfg)
     * @param {string} filename 
     */
    async fetchConfig(filename = 'printer.cfg') {
        try {
            // Moonraker espone i file di configurazione sotto /server/files/config/<filename>
            const res = await fetch(`${this.baseUrl}/server/files/config/${encodeURIComponent(filename)}?t=${Date.now()}`);
            if (res.ok) {
                const text = await res.text();
                return { success: true, content: text };
            }
            return { success: false, error: `Impossibile scaricare ${filename} (HTTP ${res.status})` };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }

    /**
     * Crea un backup del file esistente prima di sovrascriverlo
     */
    async createBackup(filename = 'printer.cfg') {
        const fetchRes = await this.fetchConfig(filename);
        if (!fetchRes.success) return false;

        const now = new Date();
        const timestamp = now.toISOString().replace(/[-:T]/g, '').slice(0, 14);
        const backupName = `${filename}.bak.${timestamp}`;

        return await this.uploadConfig(backupName, fetchRes.content, false);
    }

    /**
     * Carica il file di configurazione su Moonraker (POST /server/files/upload)
     * @param {string} filename - es: 'printer.cfg' o 'config.cfg'
     * @param {string} content - Contenuto del file
     * @param {boolean} backupFirst - Se eseguire prima una copia di sicurezza
     */
    async uploadConfig(filename = 'printer.cfg', content, backupFirst = true) {
        try {
            if (backupFirst) {
                try {
                    await this.createBackup(filename);
                } catch (e) {
                    console.warn('Backup automatico saltato:', e);
                }
            }

            const formData = new FormData();
            const blob = new Blob([content], { type: 'text/plain' });
            formData.append('file', blob, filename);
            formData.append('root', 'config');

            const res = await fetch(`${this.baseUrl}/server/files/upload`, {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                const result = await res.json();
                return { success: true, result };
            }
            return { success: false, error: `Errore caricamento HTTP ${res.status}: ${res.statusText}` };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }

    /**
     * Invia un comando G-Code a Klipper (es: FIRMWARE_RESTART o RESTART)
     * @param {string} script - Comando G-Code da eseguire
     */
    async executeGcode(script) {
        try {
            const res = await fetch(`${this.baseUrl}/printer/gcode/script?script=${encodeURIComponent(script)}`, {
                method: 'POST'
            });
            if (res.ok) {
                return { success: true };
            }
            return { success: false, error: `HTTP ${res.status}` };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }

    /**
     * Riavvia Klipper Firmware
     */
    async restartKlipper(firmwareRestart = true) {
        const cmd = firmwareRestart ? 'FIRMWARE_RESTART' : 'RESTART';
        return await this.executeGcode(cmd);
    }
}

// Esporta la classe per l'utilizzo nel browser o NodeJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MoonrakerClient;
}
