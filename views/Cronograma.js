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
      <div v-if="selectedIds.length > 0" class="grid-4" style="margin-bottom:20px">
        <div class="fin-card" style="border-left:4px solid #7AB531">
          <div class="fin-label">LB — Linha de Base (mês atual)</div>
          <div class="fin-value" style="color:#7AB531">{{ summaryStats.lb !== null ? summaryStats.lb.toFixed(1) + '%' : '—' }}</div>
          <div class="card-sub">{{ selectedIds.length }} projeto(s)</div>
        </div>
        <div class="fin-card" style="border-left:4px solid #1D6B3F">
          <div class="fin-label">Previsto (mês atual)</div>
          <div class="fin-value" style="color:#1D6B3F">{{ summaryStats.planned !== null ? summaryStats.planned.toFixed(1) + '%' : '—' }}</div>
        </div>
        <div class="fin-card" style="border-left:4px solid #1976D2">
          <div class="fin-label">Realizado (mês atual)</div>
          <div class="fin-value" style="color:#1565C0">{{ summaryStats.actual !== null ? summaryStats.actual.toFixed(1) + '%' : '—' }}</div>
        </div>
        <div class="fin-card" :style="'border-left:4px solid ' + (summaryStats.dev === null ? '#9E9E9E' : summaryStats.dev >= -2 ? '#1D6B3F' : summaryStats.dev >= -10 ? '#FF9800' : '#f44336')">
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
              <col style="width:130px">
              <col style="width:130px">
              <col style="width:130px">
              <col style="width:120px">
              <col>
            </colgroup>
            <thead>
              <tr>
                <th>Mês</th>
                <th style="text-align:right">LB (%)</th>
                <th style="text-align:right">Previsto (%)</th>
                <th style="text-align:right">Realizado (%)</th>
                <th style="text-align:right">Desvio (pp)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="m in monthlyData" :key="m.month">
                <tr @click="toggleMonth(m.month)"
                  style="cursor:pointer;transition:background .12s"
                  :style="selectedMonth === m.month ? 'background:rgba(29,107,63,.09)' : ''">
                  <td style="font-weight:600;white-space:nowrap">
                    <span style="margin-right:6px;font-size:11px;color:var(--text-muted)">{{ selectedMonth === m.month ? '▼' : '▶' }}</span>
                    {{ m.label }}
                  </td>
                  <td class="text-right" style="color:#7AB531">{{ m.lb !== null ? m.lb.toFixed(1) + '%' : '—' }}</td>
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
                <!-- Drilldown inline -->
                <tr v-if="selectedMonth === m.month" style="background:rgba(29,107,63,.04)">
                  <td colspan="6" style="padding:0">
                    <div style="padding:12px 16px 16px">
                      <div style="font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px">
                        Detalhamento — {{ m.label }}
                      </div>
                      <table class="table" style="font-size:13px;margin:0">
                        <thead>
                          <tr style="background:var(--bg)">
                            <th>Projeto</th>
                            <th>Responsável</th>
                            <th style="text-align:right">LB (%)</th>
                            <th style="text-align:right">Previsto (%)</th>
                            <th style="text-align:right">Realizado (%)</th>
                            <th style="text-align:right">Desvio (pp)</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="row in monthDrilldown(m.month)" :key="row.id"
                            class="clickable" @click.stop="$router.push('/projects/' + row.id)">
                            <td style="font-weight:600">{{ row.name }}</td>
                            <td class="text-sm text-muted">{{ row.responsible || '—' }}</td>
                            <td class="text-right" style="color:#7AB531">{{ row.lb !== null ? row.lb.toFixed(1) + '%' : '—' }}</td>
                            <td class="text-right" style="color:var(--green)">{{ row.planned !== null ? row.planned.toFixed(1) + '%' : '—' }}</td>
                            <td class="text-right" style="color:var(--info)">{{ row.actual !== null ? row.actual.toFixed(1) + '%' : '—' }}</td>
                            <td class="text-right" style="font-weight:700" :style="devStyle(row.dev)">
                              {{ row.dev !== null ? (row.dev > 0 ? '+' : '') + row.dev.toFixed(1) + ' pp' : '—' }}
                            </td>
                            <td>
                              <span v-if="row.dev !== null" class="badge" :class="devBadge(row.dev)">{{ devLabel(row.dev) }}</span>
                              <span v-else-if="row.hasEntry" class="text-muted text-sm">sem realizado</span>
                              <span v-else class="text-muted text-sm">sem dados</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </td>
                </tr>
              </template>
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
                <th class="text-right">Previsto (%)</th>
                <th class="text-right">Realizado (%)</th>
                <th class="text-right">Desvio (pp)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in projectSummary" :key="row.id" class="clickable" @click="$router.push('/projects/' + row.id + '?tab=cronograma')">
                <td style="font-weight:600">{{ row.name }}</td>
                <td class="text-sm text-muted">{{ row.responsible || '—' }}</td>
                <td class="text-right" style="color:#7AB531;font-weight:600">{{ row.lb !== null ? row.lb.toFixed(1) + '%' : '—' }}</td>
                <td class="text-right" style="color:var(--green)">{{ row.planned !== null ? row.planned.toFixed(1) + '%' : '—' }}</td>
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
          <div style="display:flex;align-items:center;gap:10px">
            <div class="section-title" style="margin-bottom:0">Importar Cronogramas (.mpp ou .xml)</div>
            <div style="display:flex;align-items:center;gap:5px;font-size:12px;color:var(--text-muted)">
              <div :style="'width:8px;height:8px;border-radius:50%;background:' + (mppServerOnline ? '#4CAF50' : '#9E9E9E')"></div>
              <span>{{ mppServerOnline ? 'Servidor .mpp ativo' : 'Servidor .mpp offline' }}</span>
            </div>
          </div>
          <button class="btn btn-secondary" @click="triggerBulkImport">📂 Selecionar arquivos .mpp / .xml</button>
          <input type="file" ref="bulkFileInput" accept=".mpp,.xml" multiple style="display:none" @change="onBulkFilesChange">
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
          <div style="font-weight:600;font-size:14px;margin-bottom:6px;color:var(--text)">Selecione arquivos .mpp ou .xml</div>
          <div style="font-size:13px;max-width:520px;margin:0 auto;line-height:1.8">
            <strong>.mpp direto:</strong> execute <code style="background:var(--bg);padding:1px 6px;border-radius:4px;font-size:12px">npm run mpp</code> na pasta do projeto e mantenha aberto.<br>
            <strong>.xml:</strong> MS Project → Arquivo → Salvar como → Formato XML (*.xml).<br>
            <span style="color:var(--text-muted)">O sistema vincula pelo nome do arquivo ou PEP e salva automaticamente. Requisito: baseline salvo.</span>
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
      selectedMonth: null,
      mppServerOnline: false,
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
        let wLB = 0, wPlanned = 0, wTotal = 0, wActual = 0, wActualTotal = 0;
        this.selectedProjects.forEach(p => {
          const entry = (p.schedule || []).find(r => r.month === month);
          if (!entry) return;
          const budget = Math.max(numberInput(p.budget) || 0, 1);
          // lb: baseline original; planned: cronograma atual (pode ser reprogramado)
          const lb = entry.lb !== undefined && entry.lb !== '' ? numberInput(entry.lb) : numberInput(entry.planned);
          const pl = numberInput(entry.planned);
          wLB      += budget * lb;
          wPlanned += budget * pl;
          wTotal   += budget;
          const hasActual = entry.actual !== null && entry.actual !== undefined && entry.actual !== '';
          if (hasActual && month <= cm) {
            wActual += budget * numberInput(entry.actual);
            wActualTotal += budget;
          }
        });
        const lb      = wTotal > 0 ? wLB / wTotal : null;
        const planned = wTotal > 0 ? wPlanned / wTotal : null;
        const actual  = wActualTotal > 0 ? wActual / wActualTotal : null;
        const dev = planned !== null && actual !== null ? actual - planned : null;
        return { month, label: formatMonth(month), lb, planned, actual, dev };
      });
    },
    summaryStats() {
      const cm = this.currentMonth;
      const past = this.monthlyData.filter(m => m.month <= cm && m.planned !== null);
      if (past.length === 0) return { lb: null, planned: null, actual: null, dev: null };
      const last = past[past.length - 1];
      return { lb: last.lb, planned: last.planned, actual: last.actual, dev: last.dev };
    },
    projectSummary() {
      const cm = this.currentMonth;
      return this.selectedProjects.map(p => {
        const sched = (p.schedule || []).filter(r => r.month <= cm).sort((a, b) => a.month.localeCompare(b.month));
        const latest = sched.length > 0 ? sched[sched.length - 1] : null;
        const lb      = latest ? (latest.lb !== undefined && latest.lb !== '' ? numberInput(latest.lb) : numberInput(latest.planned)) : null;
        const planned = latest ? numberInput(latest.planned) : null;
        const hasActual = latest && latest.actual !== null && latest.actual !== undefined && latest.actual !== '';
        const actual = hasActual ? numberInput(latest.actual) : null;
        const dev = planned !== null && actual !== null ? actual - planned : null;
        return { id: p.id, name: p.name, responsible: p.responsible, lb, planned, actual, dev };
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
    toggleMonth(month) {
      this.selectedMonth = this.selectedMonth === month ? null : month;
    },

    monthDrilldown(month) {
      const cm = this.currentMonth;
      return this.selectedProjects.map(p => {
        const entry = (p.schedule || []).find(r => r.month === month);
        const hasEntry = !!entry;
        const lb      = entry ? (entry.lb !== undefined && entry.lb !== '' ? numberInput(entry.lb) : numberInput(entry.planned)) : null;
        const planned = entry ? numberInput(entry.planned) : null;
        const hasActual = entry && entry.actual !== null && entry.actual !== undefined && entry.actual !== '' && month <= cm;
        const actual  = hasActual ? numberInput(entry.actual) : null;
        const dev     = planned !== null && actual !== null ? actual - planned : null;
        return { id: p.id, name: p.name, responsible: p.responsible, lb, planned, actual, dev, hasEntry };
      }).filter(r => r.hasEntry).sort((a, b) => {
        // projetos com desvio maior atraso primeiro
        if (a.dev !== null && b.dev !== null) return a.dev - b.dev;
        if (a.dev !== null) return -1;
        if (b.dev !== null) return 1;
        return a.name.localeCompare(b.name, 'pt-BR');
      });
    },

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
      if (dev >= -2)   return 'color:var(--green)';
      if (dev >= -10)  return 'color:var(--warning)';
      return 'color:var(--danger)';
    },
    devBadge(dev) {
      if (dev === null) return '';
      if (dev >= -2)  return 'badge-green';
      if (dev >= -10) return 'badge-yellow';
      return 'badge-red';
    },
    devLabel(dev) {
      if (dev === null) return '—';
      if (dev >= -2)  return 'No alvo';
      if (dev >= -10) return 'Atraso';
      return 'Grande Atraso';
    },

    // ── Bulk XML import ───────────────────────────────────────────────────────
    triggerBulkImport() { this.$refs.bulkFileInput.click(); },

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

    async pingMPPServer() {
      try {
        await fetch('http://localhost:3456/parse', { method: 'OPTIONS' });
        this.mppServerOnline = true;
      } catch {
        this.mppServerOnline = false;
      }
    },

    async parseMPPviaServer(file) {
      let res;
      try {
        res = await fetch('http://localhost:3456/parse', {
          method: 'POST',
          body: await file.arrayBuffer(),
        });
      } catch {
        throw new Error(
          'Servidor MPP não encontrado. Abra um terminal na pasta do projeto e execute:\n  npm run mpp\nMantenha a janela aberta e tente novamente.'
        );
      }
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      return data.curves;
    },

    parseMSPDIXml(xmlText) {
      const doc = new DOMParser().parseFromString(xmlText, 'application/xml');
      if (doc.querySelector('parsererror')) throw new Error('XML inválido. Verifique se o arquivo foi exportado corretamente pelo MS Project.');

      // Suporte a namespace ou sem namespace
      const ns = 'http://schemas.microsoft.com/project';
      const byTag = (parent, tag) => {
        let els = parent.getElementsByTagNameNS(ns, tag);
        if (!els.length) els = parent.getElementsByTagName(tag);
        return els;
      };
      const getText = (el, tag) => {
        const found = byTag(el, tag)[0];
        return found ? found.textContent.trim() : null;
      };
      const getDate = (el, tag) => {
        const v = getText(el, tag);
        if (!v || v === 'NA' || v.startsWith('0001-') || v.startsWith('1969-')) return null;
        const d = new Date(v);
        return isNaN(d) ? null : d;
      };
      const parseDur = str => {
        if (!str || str === 'PT0H0M0S') return 0;
        // ISO 8601: P5DT0H0M0S / PT40H0M0S
        const m = str.match(/P(?:(\d+(?:\.\d+)?)D)?T?(?:(\d+(?:\.\d+)?)H)?/);
        if (!m) return 0;
        return parseFloat(m[1] || 0) + parseFloat(m[2] || 0) / 8;
      };

      const taskEls = byTag(doc, 'Task');
      if (!taskEls.length) throw new Error('Nenhuma tarefa encontrada. Confirme que exportou como XML do MS Project (Arquivo → Salvar como → Formato XML).');

      const tasks = [];
      for (const el of taskEls) {
        if (getText(el, 'Summary') === '1') continue;
        if (getText(el, 'Milestone') === '1') continue;
        const bStart = getDate(el, 'BaselineStart');
        const bFinish = getDate(el, 'BaselineFinish');
        if (!bStart || !bFinish) continue;

        tasks.push({
          baselineStart:        bStart,
          baselineFinish:       bFinish,
          baselineDurationDays: parseDur(getText(el, 'BaselineDuration')),
          start:                getDate(el, 'Start'),
          finish:               getDate(el, 'Finish'),
          durationDays:         parseDur(getText(el, 'Duration')),
          actualStart:          getDate(el, 'ActualStart'),
          actualFinish:         getDate(el, 'ActualFinish'),
          percentComplete:      parseFloat(getText(el, 'PercentComplete') || '0'),
        });
      }
      if (tasks.length === 0) throw new Error('Nenhuma tarefa folha com baseline encontrada. Salve o baseline antes de exportar (MS Project → Projeto → Definir Linha de Base).');
      return tasks;
    },

    buildMPPCurves(tasks) {
      // tasks: array de { baselineStart, baselineFinish, baselineDurationDays,
      //                   start, finish, durationDays,
      //                   actualStart, actualFinish, percentComplete }
      const toYM = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      const endOfMonth = ym => { const [y,m] = ym.split('-').map(Number); return new Date(y, m, 0, 23, 59, 59); };
      const spanDays = (s, f) => Math.max(1, (f - s) / 86400000);

      const lbWork  = t => t.baselineDurationDays > 0 ? t.baselineDurationDays : spanDays(t.baselineStart, t.baselineFinish);
      const curWork = t => (t.start && t.finish) ? (t.durationDays > 0 ? t.durationDays : spanDays(t.start, t.finish)) : lbWork(t);

      const overlap = (s, f, work, eom) => {
        if (s > eom) return 0;
        if (f <= eom) return work;
        const span = f - s; if (span === 0) return work;
        return work * ((eom - s) / span);
      };

      const totalLB  = tasks.reduce((s, t) => s + lbWork(t), 0);
      const totalCur = tasks.reduce((s, t) => s + curWork(t), 0) || totalLB;
      if (totalLB === 0) return [];

      const monthSet = new Set();
      const addRange = (s, f) => {
        let d = new Date(s.getFullYear(), s.getMonth(), 1);
        while (d <= f) { monthSet.add(toYM(d)); d.setMonth(d.getMonth() + 1); }
      };
      tasks.forEach(t => {
        addRange(t.baselineStart, t.baselineFinish);
        if (t.start && t.finish) addRange(t.start, t.finish);
        if (t.actualStart) monthSet.add(toYM(t.actualStart));
        if (t.actualFinish) monthSet.add(toYM(t.actualFinish));
      });

      const today = new Date(), nowYM = toYM(today);

      return [...monthSet].sort().map(ym => {
        const eom = endOfMonth(ym);

        let cumLB = 0;
        tasks.forEach(t => { cumLB += overlap(t.baselineStart, t.baselineFinish, lbWork(t), eom); });
        const lb = parseFloat(Math.min(100, (cumLB / totalLB) * 100).toFixed(1));

        let cumCur = 0;
        tasks.forEach(t => {
          if (t.start && t.finish) cumCur += overlap(t.start, t.finish, curWork(t), eom);
          else cumCur += overlap(t.baselineStart, t.baselineFinish, lbWork(t), eom);
        });
        const planned = parseFloat(Math.min(100, (cumCur / totalCur) * 100).toFixed(1));

        let actual = null;
        if (ym <= nowYM) {
          let cumActual = 0;
          tasks.forEach(t => {
            if (!t.actualStart) return;
            const af = t.actualFinish || today;
            cumActual += overlap(t.actualStart, af, (t.percentComplete / 100) * lbWork(t), eom);
          });
          actual = parseFloat(Math.min(100, (cumActual / totalLB) * 100).toFixed(1));
        }
        return { month: ym, lb, planned, actual };
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

      for (const file of files) {
        this.bulkCurrentFile = file.name;
        const result = { filename: file.name, ok: false, projectName: null, months: null, error: null, matched: false, projectId: null };

        try {
          const project = this.matchFileToProject(file.name);
          if (!project) {
            result.error = 'Projeto não encontrado — vincule manualmente';
            result._fileData = file;
          } else {
            result.matched    = true;
            result.projectId  = project.id;
            result.projectName = project.name;

            let curves;
            if (file.name.toLowerCase().endsWith('.mpp')) {
              curves = await this.parseMPPviaServer(file);
            } else {
              const text = await file.text();
              const tasks = this.parseMSPDIXml(text);
              curves = this.buildMPPCurves(tasks);
            }

            const existing = [...(project.schedule || [])];
            curves.forEach(r => {
              const idx = existing.findIndex(ex => ex.month === r.month);
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
        let curves;
        if (resultRow._fileData.name.toLowerCase().endsWith('.mpp')) {
          curves = await this.parseMPPviaServer(resultRow._fileData);
        } else {
          const text  = await resultRow._fileData.text();
          const tasks = this.parseMSPDIXml(text);
          curves = this.buildMPPCurves(tasks);
        }
        const existing = [...(project.schedule || [])];
        curves.forEach(r => {
          const idx = existing.findIndex(ex => ex.month === r.month);
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
            interaction: { mode: 'index', intersect: false },
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
    this.pingMPPServer();
  },

  beforeUnmount() {
    if (this.chartInstance) this.chartInstance.destroy();
  }
};
