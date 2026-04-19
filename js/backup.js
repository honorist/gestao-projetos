(function () {
  const IDB_NAME = 'gp_backup_v1';
  const IDB_STORE = 'handles';
  const LOG_LS_KEY = 'gp_activity_log';
  const MAX_LOG = 2000;

  // ── IndexedDB helpers ────────────────────────────────────────────────────────
  function openIDB() {
    return new Promise((res, rej) => {
      const req = indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = e => e.target.result.createObjectStore(IDB_STORE);
      req.onsuccess = e => res(e.target.result);
      req.onerror = e => rej(e);
    });
  }
  async function idbPut(key, val) {
    const db = await openIDB();
    return new Promise((res, rej) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).put(val, key);
      tx.oncomplete = res; tx.onerror = rej;
    });
  }
  async function idbGet(key) {
    const db = await openIDB();
    return new Promise((res, rej) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const req = tx.objectStore(IDB_STORE).get(key);
      req.onsuccess = e => res(e.target.result); req.onerror = rej;
    });
  }

  // ── File helpers ─────────────────────────────────────────────────────────────
  async function writeFile(dir, name, content) {
    const fh = await dir.getFileHandle(name, { create: true });
    const w = await fh.createWritable();
    await w.write(content); await w.close();
  }
  async function readFile(dir, name) {
    try {
      const fh = await dir.getFileHandle(name);
      return await (await fh.getFile()).text();
    } catch { return null; }
  }

  // ── BackupService ────────────────────────────────────────────────────────────
  window.BackupService = {
    dir: null,
    supported: 'showDirectoryPicker' in window,

    // Called on page load — tries to restore handle from IndexedDB
    async init() {
      if (!this.supported) return;
      try {
        const h = await idbGet('dir');
        if (!h) return;
        const perm = await h.queryPermission({ mode: 'readwrite' });
        if (perm === 'granted') this.dir = h;
        else this.dir = h; // keep ref, will requestPermission on next user gesture
      } catch (e) {}
    },

    // Called from Settings button — requires user gesture
    async selectFolder() {
      if (!this.supported) {
        alert('Use Chrome ou Edge para habilitar backup automático em arquivo.');
        return false;
      }
      try {
        const h = await window.showDirectoryPicker({ mode: 'readwrite' });
        await idbPut('dir', h);
        this.dir = h;
        await this._ensurePermission();
        return true;
      } catch { return false; }
    },

    // Re-authorize if permission lapsed (requires user gesture)
    async reauthorize() {
      if (!this.dir) return false;
      try {
        const perm = await this.dir.requestPermission({ mode: 'readwrite' });
        return perm === 'granted';
      } catch { return false; }
    },

    async _ensurePermission() {
      if (!this.dir) return false;
      const perm = await this.dir.queryPermission({ mode: 'readwrite' });
      return perm === 'granted';
    },

    folderName() {
      return this.dir?.name || null;
    },

    // ── Auto-backup on every save ──────────────────────────────────────────────
    async saveBackup(data) {
      if (!this.dir) return;
      try {
        if (!await this._ensurePermission()) return;
        const json = JSON.stringify(data, null, 2);
        const dateStr = new Date().toISOString().split('T')[0];
        // Always overwrite "current"
        await writeFile(this.dir, 'gp_backup_current.json', json);
        // One file per day (overwrites same day)
        await writeFile(this.dir, `gp_backup_${dateStr}.json`, json);
      } catch (e) {}
    },

    // ── Activity log ───────────────────────────────────────────────────────────
    async log(action, detail) {
      const entry = {
        ts: new Date().toISOString(),
        action,
        detail: detail || ''
      };

      // 1. Persist in localStorage (survives unless user clears cache)
      try {
        const raw = localStorage.getItem(LOG_LS_KEY);
        const list = raw ? JSON.parse(raw) : [];
        list.push(entry);
        if (list.length > MAX_LOG) list.splice(0, list.length - MAX_LOG);
        localStorage.setItem(LOG_LS_KEY, JSON.stringify(list));
      } catch (e) {}

      // 2. Append to file on disk (survives forever)
      if (this.dir) {
        try {
          if (!await this._ensurePermission()) return;
          const raw = await readFile(this.dir, 'gp_activity_log.json');
          const list = raw ? JSON.parse(raw) : [];
          list.push(entry);
          if (list.length > MAX_LOG) list.splice(0, list.length - MAX_LOG);
          await writeFile(this.dir, 'gp_activity_log.json', JSON.stringify(list, null, 2));
        } catch (e) {}
      }
    },

    // Read log (file takes priority over localStorage)
    async readLog() {
      if (this.dir) {
        try {
          if (await this._ensurePermission()) {
            const raw = await readFile(this.dir, 'gp_activity_log.json');
            if (raw) return JSON.parse(raw);
          }
        } catch (e) {}
      }
      try {
        const raw = localStorage.getItem(LOG_LS_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch { return []; }
    }
  };

  window.BackupService.init();
})();
