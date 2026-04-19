window.CronogramaView = {
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Cronograma — Portfólio</h1>
          <div class="subtitle">Curva S de avanço físico consolidado</div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="card" style="margin-bottom:20px">
        <div style="display:flex;gap:24px;flex-wrap:wrap;align-items:flex-start">
          <div style="min-width:200px">
            <div class="form-label" style="margin-bottom:8px">Coordenador</div>
            <select class="form-control" v-model="filterCoordinator" @change="onCoordinatorChange">
              <option value="">— Todos —</option>
              <option v-for="c in coordinators" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </div>
          <div style="min-width:200px">
            <div class="form-label" style="margin-bottom:8px">Responsável (Consultor)</div>
            <select class="form-control" v-model="filterLeader" @change="onLeaderChange">
              <option value="">— Todos —</option>
              <option v-for="l in leaders" :key="l" :value="l">{{ l }}</option>
            </select>
          </div>
          <div style="flex:1;min-width:300px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
              <div class="form-label">
                Projetos incluídos
                <span style="font-weight:400;color:var(--text-muted);margin-left:6px">{{ selectedIds.length }}/{{ availableProjects.length }}</span>
              </div>
              <div style="display:flex;gap:8px">
                <button class="btn btn-ghost btn-sm" @click="selectAll">Todos</button>
                <button class="btn btn-ghost btn-sm" @click="selectNone">Nenhum</button>
              </div>
            </div>
            <div style="height:220px;overflow-y:auto;border:1px solid var(--border);border-radius:8px;background:var(--surface)">
              <label v-for="p in availableProjects" :key="p.id"
                style="display:flex;align-items:center;gap:10px;padding:7px 12px;cursor:pointer;border-bottom:1px solid var(--border);transition:background .1s"
                :style="selectedIds.includes(p.id) ? 'background:rgba(29,107,63,.07)' : ''"
                @click="toggleProject(p.id)">
                <input type="checkbox" :checked="selectedIds.includes(p.id)" @click.stop="toggleProject(p.id)"
                  style="width:15px;height:15px;accent-color:var(--green);cursor:pointer;flex-shrink:0">
                <div style="min-width:0">
                  <div style="font-size:13px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"
                    :style="selectedIds.includes(p.id) ? 'color:var(--green)' : ''">{{ p.name }}</div>
                  <div style="font-size:11px;color:var(--text-muted)">
                    {{ p.pep || '' }}{{ p.responsible ? ' · ' + p.responsible.split(' ')[0] : '' }}
                    <span v-if="(p.schedule||[]).length === 0" style="color:var(--danger);margin-left:4px">· sem dados</span>
                    <span v-else style="color:var(--green);margin-left:4px">· {{ (p.schedule||[]).length }} meses</span>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Cards de resumo -->
      <div v-if="selectedIds.length > 0" class="grid-3" style="margin-bottom:20px">
        <div class="fin-card" style="border-left:4px solid #1D6B3F">
          <div class="fin-label">LB — Linha de Base (mês atual)</div>
          <div class="fin-value" style="color:#1D6B3F">{{ summaryStats.planned !== null ? summaryStats.planned.toFixed(1) + '%' : '—' }}</div>
          <div class="card-sub">{{ selectedIds.length }} projeto(s) selecionado(s)</div>
        </div>
        <div class="fin-card" style="border-left:4px solid #1976D2">
          <div class="fin-label">Avanço Realizado (mês atual)</div>
          <div class="fin-value" style="color:#1565C0">{{ summaryStats.actual !== null ? summaryStats.actual.toFixed(1) + '%' : '—' }}</div>
        </div>
        <div class="fin-card" :style="'border-left:4px solid ' + (summaryStats.dev === null ? '#9E9E9E' : Math.abs(summaryStats.dev) <= 5 ? '#1D6B3F' : Math.abs(summaryStats.dev) <= 15 ? '#FF9800' : '#f44336')">
          <div class="fin-label">Desvio (pp)</div>
          <div class="fin-value" :style="devStyle(summaryStats.dev)">
            {{ summaryStats.dev !== null ? (summaryStats.dev > 0 ? '+' : '') + summaryStats.dev.toFixed(1) + ' pp' : '—' }}
          </div>
          <div class="card-sub">
            <span v-if="summaryStats.dev !== null" class="badge" :class="devBadge(summaryStats.dev)">{{ devLabel(summaryStats.dev) }}</span>
          </div>
        </div>
      </div>

      <!-- Gráfico Curva S -->
      <div class="chart-wrap" style="margin-bottom:20px">
        <div class="chart-title">Curva S — Avanço Físico do Portfólio (%)</div>
        <div v-if="selectedIds.length === 0" style="text-align:center;padding:60px;color:var(--text-muted)">
          Selecione ao menos um projeto para exibir a curva.
        </div>
        <div v-else-if="!hasScheduleData" style="text-align:center;padding:60px;color:var(--text-muted)">
          Nenhum projeto selecionado possui dados de cronograma. Cadastre o avanço em cada projeto (aba Cronograma).
        </div>
        <canvas ref="chart" :style="hasScheduleData ? 'max-height:320px' : 'display:none'"></canvas>
      </div>

      <!-- Tabela Mensal -->
      <div v-if="hasScheduleData && monthlyData.length > 0" class="section" style="margin-bottom:20px">
        <div class="section-title">Aderência Mensal — Portfólio</div>
        <div class="table-wrap">
          <table class="table" style="table-layout:fixed;width:100%">
            <colgroup>
              <col style="width:110px">
              <col style="width:160px">
              <col style="width:160px">
              <col style="width:120px">
              <col>
            </colgroup>
            <thead>
              <tr>
                <th>Mês</th>
                <th style="text-align:right">LB (%)</th>
                <th style="text-align:right">Realizado (%)</th>
                <th style="text-align:right">Desvio (pp)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in monthlyData" :key="m.month">
                <td style="font-weight:600;white-space:nowrap">{{ m.label }}</td>
                <td class="text-right" style="color:var(--green)">{{ m.planned !== null ? m.planned.toFixed(1) + '%' : '—' }}</td>
                <td class="text-right" style="color:var(--info)">{{ m.actual !== null ? m.actual.toFixed(1) + '%' : '—' }}</td>
                <td class="text-right" style="font-weight:700" :style="devStyle(m.dev)">
                  {{ m.dev !== null ? (m.dev > 0 ? '+' : '') + m.dev.toFixed(1) + ' pp' : '—' }}
                </td>
                <td>
                  <span v-if="m.dev !== null" class="badge" :class="devBadge(m.dev)">{{ devLabel(m.dev) }}</span>
                  <span v-else class="text-muted text-sm">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Resumo por projeto -->
      <div v-if="selectedIds.length > 0 && hasScheduleData" class="section" style="margin-bottom:20px">
        <div class="section-title">Situação por Projeto</div>
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Projeto</th>
                <th>Responsável</th>
                <th class="text-right">LB (%)</th>
                <th class="text-right">Realizado (%)</th>
                <th class="text-right">Desvio (pp)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in projectSummary" :key="row.id" class="clickable" @click="$router.push('/projects/' + row.id + '?tab=cronograma')">
                <td style="font-weight:600">{{ row.name }}</td>
                <td class="text-sm text-muted">{{ row.responsible || '—' }}</td>
                <td class="text-right" style="color:var(--green);font-weight:600">{{ row.planned !== null ? row.planned.toFixed(1) + '%' : '—' }}</td>
                <td class="text-right" style="color:var(--info)">{{ row.actual !== null ? row.actual.toFixed(1) + '%' : '—' }}</td>
                <td class="text-right" style="font-weight:700" :style="devStyle(row.dev)">
                  {{ row.dev !== null ? (row.dev > 0 ? '+' : '') + row.dev.toFixed(1) + ' pp' : '—' }}
                </td>
                <td>
                  <span v-if="row.dev !== null" class="badge" :class="devBadge(row.dev)">{{ devLabel(row.dev) }}</span>
                  <span v-else-if="row.planned === null" class="text-muted text-sm" style="font-size:11px">sem dados</span>
                  <span v-else class="text-muted text-sm">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Importação em massa -->
      <div class="section" style="margin-bottom:20px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
          <div class="section-title" style="margin-bottom:0">Importar Cronogramas (.mpp)</div>
          <button class="btn btn-secondary" @click="triggerBulkImport">📂 Selecionar arquivos .mpp</button>
          <input type="file" ref="bulkFileInput" accept=".mpp" multiple style="display:none" @change="onBulkFilesChange">
        </div>

        <!-- Loading -->
        <div v-if="bulkLoading" class="card" style="display:flex;align-items:center;gap:12px;padding:16px">
          <div style="width:20px;height:20px;border:3px solid #C8E6C9;border-top-color:#1D6B3F;border-radius:50%;animation:spin .8s linear infinite;flex-shrink:0"></div>
          <div>
            <div style="font-weight:600;font-size:13px">Processando {{ bulkDone }}/{{ bulkTotal }} arquivos…</div>
            <div style="font-size:12px;color:var(--text-muted)">{{ bulkCurrentFile }}</div>
          </div>
        </div>

        <!-- Resultado após importação -->
        <div v-if="!bulkLoading && bulkResults.length > 0" class="table-wrap">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
            <div style="font-size:13px;color:var(--text-muted)">
              <strong style="color:var(--green)">{{ bulkResults.filter(r=>r.ok).length }} importados</strong>
              <span v-if="bulkResults.filter(r=>!r.ok).length > 0">
                · <strong style="color:var(--danger)">{{ bulkResults.filter(r=>!r.ok).length }} com erro</strong>
              </span>
            </div>
            <button class="btn btn-ghost btn-sm" @click="bulkResults = []">✕ Limpar</button>
          </div>
          <table class="table" style="font-size:13px">
            <thead>
              <tr>
                <th>Arquivo .mpp</th>
                <th>Projeto vinculado</th>
                <th style="text-align:center">Meses</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in bulkResults" :key="r.filename">
                <td style="font-family:monospace;font-size:12px">{{ r.filename }}</td>
                <td>
                  <select v-if="!r.ok && !r.matched" class="form-control" style="font-size:12px;padding:3px 8px"
                    @change="e => reImportWithProject(r, e.target.value)">
                    <option value="">— vincular manualmente —</option>
                    <option v-for="p in allProjects" :key="p.id" :value="p.id">{{ p.name }}</option>
                  </select>
                  <span v-else style="font-weight:600">{{ r.projectName || '—' }}</span>
                </td>
                <td style="text-align:center">{{ r.months || '—' }}</td>
                <td>
                  <span v-if="r.ok" class="badge badge-green">OK</span>
                  <span v-else class="badge badge-red" :title="r.error">Erro</span>
                  <span v-if="r.error" style="font-size:11px;color:var(--danger);margin-left:6px">{{ r.error }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Instrução inicial -->
        <div v-if="!bulkLoading && bulkResults.length === 0" class="card"
          style="border:2px dashed var(--border);text-align:center;padding:32px;color:var(--text-muted)">
          <div style="font-size:28px;margin-bottom:10px">📂</div>
          <div style="font-weight:600;font-size:14px;margin-bottom:6px;color:var(--text)">Selecione os arquivos .mpp de todos os projetos</div>
          <div style="font-size:13px;max-width:480px;margin:0 auto;line-height:1.6">
            O sistema vincula cada arquivo ao projeto pelo <strong>nome do arquivo</strong> ou <strong>código PEP</strong>,
            calcula a curva S de cada um e salva automaticamente.
            Requisito: baseline salvo no .mpp (<em>Projeto → Definir Linha de Base</em>).
          </div>
        </div>
      </div>

    </div>
  `,

  data() {
    return {
      filterCoordinator: '',
      filterLeader: '',
      selectedIds: [],
      chartInstance: null,
      // Bulk import
      bulkLoading: false,
      bulkDone: 0,
      bulkTotal: 0,
      bulkCurrentFile: '',
      bulkResults: [],
    };
  },

  computed: {
    allProjects() {
      return Store.state.projects.filter(p => p.status !== 'cancelled');
    },
    coordinators() {
      return [...Store.state.coordinators].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    },
    consultantsForCoordinator() {
      if (!this.filterCoordinator) return null;
      return Store.state.consultants
        .filter(c => c.coordinator_id === this.filterCoordinator)
        .map(c => c.name);
    },
    leaders() {
      const base = this.consultantsForCoordinator
        ? this.allProjects.filter(p => this.consultantsForCoordinator.includes(p.responsible))
        : this.allProjects;
      const set = new Set(base.map(p => p.responsible).filter(Boolean));
      return [...set].sort((a, b) => a.localeCompare(b, 'pt-BR'));
    },
    availableProjects() {
      let list = this.allProjects;
      if (this.consultantsForCoordinator) list = list.filter(p => this.consultantsForCoordinator.includes(p.responsible));
      if (this.filterLeader) list = list.filter(p => p.responsible === this.filterLeader);
      return list;
    },
    selectedProjects() {
      return this.allProjects.filter(p => this.selectedIds.includes(p.id));
    },
    hasScheduleData() {
      return this.selectedProjects.some(p => (p.schedule || []).length > 0);
    },
    currentMonth() {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    },
    allMonths() {
      const set = new Set();
      this.selectedProjects.forEach(p => {
        (p.schedule || []).forEach(r => { if (r.month) set.add(r.month); });
      });
      return [...set].sort();
    },
    monthlyData() {
      const cm = this.currentMonth;
      return this.allMonths.map(month => {
        let wPlanned = 0, wTotal = 0, wActual = 0, wActualTotal = 0;
        this.selectedProjects.forEach(p => {
          const entry = (p.schedule || []).find(r => r.month === month);
          if (!entry) return;
          const budget = Math.max(numberInput(p.budget) || 0, 1);
          const pl = numberInput(entry.planned);
          wPlanned += budget * pl;
          wTotal += budget;
          const hasActual = entry.actual !== null && entry.actual !== undefined && entry.actual !== '';
          if (hasActual && month <= cm) {
            wActual += budget * numberInput(entry.actual);
            wActualTotal += budget;
          }
        });
        const planned = wTotal > 0 ? wPlanned / wTotal : null;
        const actual  = wActualTotal > 0 ? wActual / wActualTotal : null;
        const dev = planned !== null && actual !== null ? actual - planned : null;
        return { month, label: formatMonth(month), planned, actual, dev };
      });
    },
    summaryStats() {
      const cm = this.currentMonth;
      const past = this.monthlyData.filter(m => m.month <= cm && m.planned !== null);
      if (past.length === 0) return { planned: null, actual: null, dev: null };
      const last = past[past.length - 1];
      return { planned: last.planned, actual: last.actual, dev: last.dev };
    },
    projectSummary() {
      const cm = this.currentMonth;
      return this.selectedProjects.map(p => {
        const sched = (p.schedule || []).filter(r => r.month <= cm).sort((a, b) => a.month.localeCompare(b.month));
        const latest = sched.length > 0 ? sched[sched.length - 1] : null;
        const planned = latest ? numberInput(latest.planned) : null;
        const hasActual = latest && latest.actual !== null && latest.actual !== undefined && latest.actual !== '';
        const actual = hasActual ? numberInput(latest.actual) : null;
        const dev = planned !== null && actual !== null ? actual - planned : null;
        return { id: p.id, name: p.name, responsible: p.responsible, planned, actual, dev };
      });
    },
  },

  watch: {
    selectedIds() { this.$nextTick(() => this.renderChart()); },
    availableProjects(newVal) {
      const ids = newVal.map(p => p.id);
      this.selectedIds = this.selectedIds.filter(id => ids.includes(id));
    },
  },

  methods: {
    toggleProject(id) {
      const idx = this.selectedIds.indexOf(id);
      if (idx >= 0) this.selectedIds.splice(idx, 1);
      else this.selectedIds.push(id);
    },
    selectAll()  { this.selectedIds = this.availableProjects.map(p => p.id); },
    selectNone() { this.selectedIds = []; },
    onCoordinatorChange() { this.filterLeader = ''; this.selectedIds = this.availableProjects.map(p => p.id); },
    onLeaderChange()      { this.selectedIds = this.availableProjects.map(p => p.id); },

    devStyle(dev) {
      if (dev === null) return '';
      if (Math.abs(dev) <= 5)  return 'color:var(--green)';
      if (Math.abs(dev) <= 15) return 'color:var(--warning)';
      return 'color:var(--danger)';
    },
    devBadge(dev) {
      if (dev === null) return '';
      if (Math.abs(dev) <= 5)  return 'badge-green';
      if (Math.abs(dev) <= 15) return 'badge-yellow';
      return 'badge-red';
    },
    devLabel(dev) {
      if (dev === null) return '—';
      if (Math.abs(dev) <= 5) return 'No alvo';
      if (dev < -5)           return 'Atrasado';
      return 'Adiantado';
    },

    // ── Bulk MPP import ───────────────────────────────────────────────────────
    triggerBulkImport() { this.$refs.bulkFileInput.click(); },

    loadScript(src) {
      return new Promise((res, rej) => {
        const s = document.createElement('script');
        s.src = src; s.onload = res; s.onerror = rej;
        document.head.appendChild(s);
      });
    },

    async loadMPXJ() {
      if (window._mpxjLoaded) return true;
      const cdns = [
        'https://cdn.jsdelivr.net/npm/mpxj/dist/mpxj.umd.min.js',
        'https://unpkg.com/mpxj/dist/mpxj.umd.js',
        'https://cdn.jsdelivr.net/npm/mpxj/dist/mpxj.umd.js',
      ];
      for (const url of cdns) {
        try { await this.loadScript(url); window._mpxjLoaded = true; return true; } catch (_) {}
      }
      return false;
    },

    getMPXJReader() {
      const ns = window.mpxj || window.MPXJ || {};
      return (
        window.MPXJReader || window.ProjectReader || window.UniversalProjectReader ||
        ns.MPXJReader || ns.ProjectReader || ns.UniversalProjectReader ||
        (ns.default && (ns.default.MPXJReader || ns.default.ProjectReader))
      );
    },

    normalize(s) {
      return String(s || '').toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')  // remove acentos
        .replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
    },

    matchFileToProject(filename) {
      const fn = this.normalize(filename.replace(/\.mpp$/i, ''));
      const projects = Store.state.projects.filter(p => p.status !== 'cancelled');

      // 1. PEP exato dentro do filename
      for (const p of projects) {
        if (p.pep && fn.includes(this.normalize(p.pep))) return p;
      }
      // 2. Nome do projeto contido no filename (ou vice-versa)
      for (const p of projects) {
        const pn = this.normalize(p.name);
        if (fn.includes(pn) || pn.includes(fn)) return p;
      }
      // 3. Número do projeto
      for (const p of projects) {
        if (p.number && fn.includes(this.normalize(p.number))) return p;
      }
      // 4. Palavras significativas em comum (>= 2 palavras com 4+ letras)
      const fnWords = fn.split(' ').filter(w => w.length >= 4);
      let best = null, bestScore = 0;
      for (const p of projects) {
        const pnWords = this.normalize(p.name).split(' ').filter(w => w.length >= 4);
        const matches = fnWords.filter(w => pnWords.includes(w)).length;
        if (matches >= 2 && matches > bestScore) { bestScore = matches; best = p; }
      }
      return best;
    },

    async parseMPP(arrayBuffer) {
      const ReaderClass = this.getMPXJReader();
      if (!ReaderClass) throw new Error('Biblioteca MPXJ não encontrada');
      const reader  = new ReaderClass();
      const project = typeof reader.readAsync === 'function'
        ? await reader.readAsync(arrayBuffer)
        : await reader.read(arrayBuffer);
      const allTasks = typeof project.getAllTasks === 'function'
        ? project.getAllTasks() : (project.tasks || []);
      const safe = fn => { try { return fn(); } catch { return null; } };
      const leaf = allTasks.filter(t =>
        !safe(() => t.getSummary()) && !safe(() => t.getMilestone()) &&
        safe(() => t.getBaselineStart()) && safe(() => t.getBaselineFinish())
      );
      if (leaf.length === 0) throw new Error(`Sem tarefas com baseline (${allTasks.length} tarefas no arquivo)`);
      return this.buildMPPCurves(leaf);
    },

    buildMPPCurves(tasks) {
      const toDate = d => d instanceof Date ? d : new Date(d);
      const toYM   = d => { const dt = toDate(d); return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}`; };
      const endOfMonth = ym => { const [y,m] = ym.split('-').map(Number); return new Date(y, m, 0, 23, 59, 59); };
      const taskWork = t => {
        const dur = t.getBaselineDuration && t.getBaselineDuration();
        if (dur) {
          const val  = typeof dur.getDuration === 'function' ? dur.getDuration() : 0;
          const unit = typeof dur.getUnits    === 'function' ? String(dur.getUnits()) : '';
          if (unit.includes('HOUR') || unit.includes('HORA')) return val / 8;
          if (unit.includes('WEEK') || unit.includes('SEM'))  return val * 5;
          return val;
        }
        const bs = toDate(t.getBaselineStart()), bf = toDate(t.getBaselineFinish());
        return Math.max(1, (bf - bs) / 86400000);
      };
      const overlap = (start, finish, work, endDate) => {
        const s = toDate(start), f = toDate(finish);
        if (s > endDate) return 0;
        if (f <= endDate) return work;
        const span = f - s; if (span === 0) return work;
        return work * ((endDate - s) / span);
      };

      const totalWork = tasks.reduce((s, t) => s + taskWork(t), 0);
      if (totalWork === 0) return [];

      const monthSet = new Set();
      tasks.forEach(t => {
        let d = new Date(toDate(t.getBaselineStart()).getFullYear(), toDate(t.getBaselineStart()).getMonth(), 1);
        const bf = toDate(t.getBaselineFinish());
        while (d <= bf) { monthSet.add(toYM(d)); d.setMonth(d.getMonth() + 1); }
        const as = t.getActualStart && t.getActualStart();
        const af = t.getActualFinish && t.getActualFinish();
        if (as) monthSet.add(toYM(toDate(as)));
        if (af) monthSet.add(toYM(toDate(af)));
      });

      const today = new Date();
      const nowYM = toYM(today);

      return [...monthSet].sort().map(ym => {
        const eom = endOfMonth(ym);
        let cumPlanned = 0;
        tasks.forEach(t => { cumPlanned += overlap(t.getBaselineStart(), t.getBaselineFinish(), taskWork(t), eom); });
        const planned = parseFloat(Math.min(100, (cumPlanned / totalWork) * 100).toFixed(1));

        let actual = null;
        if (ym <= nowYM) {
          let cumActual = 0;
          tasks.forEach(t => {
            const as = t.getActualStart && t.getActualStart();
            if (!as) return;
            const af   = t.getActualFinish && t.getActualFinish();
            const pct  = (t.getPercentageComplete ? t.getPercentageComplete() : 0) / 100;
            const done = pct * taskWork(t);
            cumActual += overlap(as, af || today, done, eom);
          });
          actual = parseFloat(Math.min(100, (cumActual / totalWork) * 100).toFixed(1));
        }
        return { month: ym, planned, actual };
      });
    },

    async onBulkFilesChange(e) {
      const files = [...e.target.files];
      e.target.value = '';
      if (!files.length) return;

      this.bulkResults = [];
      this.bulkLoading = true;
      this.bulkDone = 0;
      this.bulkTotal = files.length;

      const ok = await this.loadMPXJ();
      if (!ok) {
        this.bulkLoading = false;
        this.bulkResults = [{ filename: '(todos)', ok: false, error: 'Não foi possível carregar a biblioteca MPXJ. Verifique a conexão.' }];
        return;
      }

      for (const file of files) {
        this.bulkCurrentFile = file.name;
        const result = { filename: file.name, ok: false, projectName: null, months: null, error: null, matched: false, projectId: null };

        try {
          const project = this.matchFileToProject(file.name);
          if (!project) {
            result.error = 'Projeto não encontrado — vincule manualmente';
            result._fileData = file; // guarda para re-importar
          } else {
            result.matched = true;
            result.projectId  = project.id;
            result.projectName = project.name;

            const buf    = await file.arrayBuffer();
            const curves = await this.parseMPP(buf);

            const existing = [...(project.schedule || [])];
            curves.forEach(r => {
              const idx = existing.findIndex(e => e.month === r.month);
              if (idx >= 0) existing[idx] = r; else existing.push(r);
            });
            Store.updateProject(project.id, { ...project, schedule: existing });

            result.ok     = true;
            result.months = curves.length;
          }
        } catch (err) {
          result.error = err.message;
        }

        this.bulkResults.push(result);
        this.bulkDone++;
      }

      this.bulkLoading = false;
      this.bulkCurrentFile = '';
      this.$nextTick(() => this.renderChart());
    },

    async reImportWithProject(resultRow, projectId) {
      if (!projectId || !resultRow._fileData) return;
      const project = Store.state.projects.find(p => p.id === projectId);
      if (!project) return;

      resultRow.ok = false;
      resultRow.error = null;
      try {
        const buf    = await resultRow._fileData.arrayBuffer();
        const curves = await this.parseMPP(buf);
        const existing = [...(project.schedule || [])];
        curves.forEach(r => {
          const idx = existing.findIndex(e => e.month === r.month);
          if (idx >= 0) existing[idx] = r; else existing.push(r);
        });
        Store.updateProject(project.id, { ...project, schedule: existing });
        resultRow.ok          = true;
        resultRow.matched     = true;
        resultRow.projectId   = project.id;
        resultRow.projectName = project.name;
        resultRow.months      = curves.length;
        this.$nextTick(() => this.renderChart());
      } catch (err) {
        resultRow.error = err.message;
      }
    },

    renderChart() {
      if (this.chartInstance) { this.chartInstance.destroy(); this.chartInstance = null; }
      if (!this.hasScheduleData || this.selectedIds.length === 0) return;
      this.$nextTick(() => {
        const canvas = this.$refs.chart;
        if (!canvas) return;
        const cm = this.currentMonth;
        const labels      = this.monthlyData.map(m => m.label);
        const plannedData = this.monthlyData.map(m => m.planned);
        const actualData  = this.monthlyData.map(m => m.month <= cm ? m.actual : null);

        // Annotation line for today
        const todayIdx = this.monthlyData.findIndex(m => m.month === cm);

        this.chartInstance = new Chart(canvas, {
          type: 'line',
          data: {
            labels,
            datasets: [
              {
                label: 'LB — Linha de Base (%)',
                data: plannedData,
                borderColor: '#1D6B3F', backgroundColor: 'rgba(29,107,63,.08)',
                borderWidth: 2.5, tension: .35, fill: false,
                pointRadius: 3, pointBackgroundColor: '#1D6B3F'
              },
              {
                label: 'Realizado (%)',
                data: actualData,
                borderColor: '#1976D2', backgroundColor: 'rgba(25,118,210,.1)',
                borderWidth: 2.5, tension: .35, fill: false,
                pointRadius: 4, pointBackgroundColor: '#1976D2', spanGaps: false
              },
            ]
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
              legend: { position: 'top', labels: { font: { size: 12 }, usePointStyle: true } },
              tooltip: {
                callbacks: {
                  label: ctx => {
                    const v = ctx.parsed.y;
                    return `${ctx.dataset.label}: ${v !== null ? v.toFixed(1) + '%' : '—'}`;
                  }
                }
              }
            },
            scales: {
              x: { grid: { color: 'rgba(0,0,0,.05)' } },
              y: {
                min: 0, max: 100,
                ticks: { callback: v => v + '%' },
                grid: { color: 'rgba(0,0,0,.05)' }
              }
            }
          }
        });
      });
    },
  },

  mounted() {
    this.selectedIds = this.allProjects.map(p => p.id);
    this.$nextTick(() => this.renderChart());
  },

  beforeUnmount() {
    if (this.chartInstance) this.chartInstance.destroy();
  }
};
