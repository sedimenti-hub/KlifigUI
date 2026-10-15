/**
 * MoonrakerClient
 * Gestisce la comunicazione con l'API REST di Moonraker su Klipper
 */

class MoonrakerClient {
    constructor(baseUrl = '') {
        this.setBaseUrl(baseUrl || this.detectBaseUrl());
        this.isConnected = false;
        this.printerInfo = null;
        this.ws = null;
        this.wsReconnectTimer = null;
        this.wsListeners = [];
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
     * Tenta l'endpoint globale del namespace 'mainsail' e le chiavi specifiche 'uiSettings' e 'general'.
     */
    async getMainsailSettings() {
        try {
            // Tentativo 1: scarica l'intero namespace 'mainsail'
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3500);

            const res = await fetch(`${this.baseUrl}/server/database/item?namespace=mainsail&t=${Date.now()}`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (res.ok) {
                const data = await res.json();
                if (data && data.result) {
                    const val = data.result.value !== undefined ? data.result.value : data.result;
                    if (val && typeof val === 'object' && Object.keys(val).length > 0) {
                        return { success: true, settings: val };
                    }
                }
            }
        } catch (_) {}

        try {
            // Tentativo 2: scarica esplicitamente la chiave 'uiSettings'
            const controller2 = new AbortController();
            const timeoutId2 = setTimeout(() => controller2.abort(), 2500);
            const resUi = await fetch(`${this.baseUrl}/server/database/item?namespace=mainsail&key=uiSettings&t=${Date.now()}`, {
                signal: controller2.signal
            });
            clearTimeout(timeoutId2);

            if (resUi.ok) {
                const dataUi = await resUi.json();
                const uiVal = dataUi.result ? (dataUi.result.value !== undefined ? dataUi.result.value : dataUi.result) : null;
                return { success: true, settings: { uiSettings: uiVal } };
            }
        } catch (_) {}

        return { success: false, error: 'Configurazione database non reperibile' };
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
     * Verifica la presenza di un logo personalizzato in .theme (svg o png)
     */
    async getCustomLogoUrl() {
        try {
            const resSvg = await fetch(`${this.baseUrl}/server/files/config/.theme/sidebar-logo.svg?t=${Date.now()}`, { method: 'HEAD' });
            if (resSvg.ok) return `${this.baseUrl}/server/files/config/.theme/sidebar-logo.svg`;
            const resPng = await fetch(`${this.baseUrl}/server/files/config/.theme/sidebar-logo.png?t=${Date.now()}`, { method: 'HEAD' });
            if (resPng.ok) return `${this.baseUrl}/server/files/config/.theme/sidebar-logo.png`;
        } catch (_) {}
        return null;
    }

    /**
     * Fetch JSON con timeout (helper interno)
     */
    async _fetchJson(path, timeoutMs = 3500) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const res = await fetch(`${this.baseUrl}${path}`, { signal: controller.signal });
            if (!res.ok) return null;
            return await res.json();
        } catch (_) {
            return null;
        } finally {
            clearTimeout(timeoutId);
        }
    }

    /**
     * Stato del server Moonraker (klippy_state, klippy_connected, components, registered_directories)
     */
    async getServerInfo() {
        const data = await this._fetchJson('/server/info');
        return data && data.result ? data.result : null;
    }

    /**
     * Elenca i file della cartella .theme (come fa Mainsail con getThemeFileUrl)
     * Restituisce un oggetto { basename: { filename, url } } oppure null se la cartella non esiste.
     */
    async getThemeFiles() {
        const data = await this._fetchJson(`/server/files/directory?path=config/.theme&extended=false&t=${Date.now()}`);
        if (!data || !data.result || !Array.isArray(data.result.files)) return null;
        const files = {};
        data.result.files.forEach(f => {
            const name = f.filename || '';
            const dot = name.lastIndexOf('.');
            if (dot <= 0) return;
            const base = name.slice(0, dot);
            const ext = name.slice(dot + 1).toLowerCase();
            const ts = f.modified ? Math.round(f.modified * 1000) : Date.now();
            (files[base] = files[base] || []).push({
                filename: name,
                ext,
                url: `${this.baseUrl}/server/files/config/.theme/${encodeURIComponent(name)}?timestamp=${ts}`
            });
        });
        return files;
    }

    /**
     * Numero di webcam configurate (Mainsail nasconde la voce Webcam se è 0)
     */
    async getWebcamCount() {
        const data = await this._fetchJson('/server/webcams/list');
        if (!data || !data.result || !Array.isArray(data.result.webcams)) return null;
        return data.result.webcams.length;
    }

    /**
     * Sezioni presenti nella configurazione Klipper caricata (configfile.settings)
     */
    async getKlipperConfigSections() {
        const data = await this._fetchJson('/printer/objects/query?configfile=settings', 5000);
        const settings = data && data.result && data.result.status && data.result.status.configfile
            ? data.result.status.configfile.settings
            : null;
        return settings ? Object.keys(settings) : null;
    }

    /**
     * Scarica un JSON da un URL assoluto (es. .theme/navi.json)
     */
    async fetchJsonUrl(url) {
        try {
            const res = await fetch(url);
            if (!res.ok) return null;
            return await res.json();
        } catch (_) {
            return null;
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

    /**
     * Registra un callback per messaggi o notifiche WebSocket Moonraker
     */
    on(event, callback) {
        this.wsListeners.push({ event, callback });
    }

    off(event, callback) {
        this.wsListeners = this.wsListeners.filter(l => !(l.event === event && (!callback || l.callback === callback)));
    }

    _emit(event, data) {
        this.wsListeners.forEach(l => {
            if (l.event === event || l.event === '*') {
                try {
                    l.callback(data, event);
                } catch (err) {
                    console.error('Errore listener WebSocket:', err);
                }
            }
        });
    }

    /**
     * Connette il WebSocket Moonraker per ascoltare notifiche push in tempo reale
     */
    connectWebSocket() {
        if (typeof WebSocket === 'undefined') return;

        if (this.ws) {
            try { this.ws.close(); } catch (_) {}
            this.ws = null;
        }

        clearTimeout(this.wsReconnectTimer);

        let wsUrl = '';
        try {
            const parsed = new URL(this.baseUrl);
            const proto = parsed.protocol === 'https:' ? 'wss:' : 'ws:';
            wsUrl = `${proto}//${parsed.host}/websocket`;
        } catch (_) {
            const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            wsUrl = `${proto}//${window.location.host}/websocket`;
        }

        try {
            this.ws = new WebSocket(wsUrl);

            this.ws.onopen = () => {
                this.isConnected = true;
                this._emit('open', { url: wsUrl });
            };

            this.ws.onmessage = (event) => {
                try {
                    const msg = JSON.parse(event.data);
                    this._emit('message', msg);
                    if (msg && msg.method) {
                        this._emit(msg.method, msg.params);
                    }
                } catch (_) {}
            };

            this.ws.onerror = (err) => {
                this._emit('error', err);
            };

            this.ws.onclose = () => {
                this.ws = null;
                this._emit('close', {});
                // Riconnessione automatica dopo 3 secondi
                this.wsReconnectTimer = setTimeout(() => {
                    this.connectWebSocket();
                }, 3000);
            };
        } catch (err) {
            this.wsReconnectTimer = setTimeout(() => {
                this.connectWebSocket();
            }, 3000);
        }
    }
}

// Esporta la classe per l'utilizzo nel browser o NodeJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MoonrakerClient;
}
