window.PortfolioView = {
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Curva S — Portfólio</h1>
          <div class="subtitle">Visão consolidada da carteira de projetos</div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="card" style="margin-bottom:20px">
        <div style="display:flex;gap:24px;flex-wrap:wrap;align-items:flex-start">

          <!-- Filtro por coordenador -->
          <div style="min-width:200px">
            <div class="form-label" style="margin-bottom:8px">Coordenador</div>
            <select class="form-control" v-model="filterCoordinator" @change="onCoordinatorChange">
              <option value="">— Todos —</option>
              <option v-for="c in coordinators" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </div>

          <!-- Filtro por líder -->
          <div style="min-width:200px">
            <div class="form-label" style="margin-bottom:8px">Responsável (Consultor)</div>
            <select class="form-control" v-model="filterLeader" @change="onLeaderChange">
              <option value="">— Todos —</option>
              <option v-for="l in leaders" :key="l" :value="l">{{ l }}</option>
            </select>
          </div>

          <!-- Seleção de projetos -->
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
                  <div style="font-size:11px;color:var(--text-muted)">{{ p.pep || '' }}{{ p.responsible ? ' · ' + p.responsible.split(' ')[0] : '' }}</div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Totais -->
      <div v-if="selectedIds.length > 0" class="grid-3" style="margin-bottom:20px">
        <div class="fin-card" style="border-left:4px solid #1D6B3F">
          <div class="fin-label">Total Linha de Base</div>
          <div class="fin-value" style="color:#1D6B3F">{{ fc(totals.baseline) }}</div>
          <div class="card-sub">{{ selectedIds.length }} projeto(s)</div>
        </div>
        <div class="fin-card" style="border-left:4px solid #FF9800">
          <div class="fin-label">Total Tendência</div>
          <div class="fin-value" style="color:#E65100">{{ fc(totals.trend) }}</div>
        </div>
        <div class="fin-card" style="border-left:4px solid #1976D2">
          <div class="fin-label">Total Realizado</div>
          <div class="fin-value" style="color:#1565C0">{{ fc(totals.actual) }}</div>
        </div>
      </div>

      <!-- Gráfico -->
      <div class="chart-wrap" style="margin-bottom:20px">
        <div class="chart-title">Curva S Acumulada — Portfólio</div>
        <div v-if="selectedIds.length === 0" style="text-align:center;padding:60px;color:var(--text-muted)">
          Selecione ao menos um projeto para exibir a curva.
        </div>
        <div v-else-if="!hasChartData" style="text-align:center;padding:60px;color:var(--text-muted)">
          Os projetos selecionados não possuem dados mensais cadastrados.
        </div>
        <canvas ref="chart" :style="hasChartData ? 'max-height:320px' : 'display:none'"></canvas>
      </div>

      <!-- Aderência Mensal -->
      <div v-if="selectedIds.length > 0 && monthlyData.length > 0" class="section" style="margin-bottom:20px">
        <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap;margin-bottom:14px">
          <div class="section-title" style="margin-bottom:0">Aderência Mensal — Portfólio</div>
          <!-- Aderência Anual -->
          <div style="padding:10px 16px;border-radius:8px;border:1px solid var(--border);background:var(--surface);display:flex;align-items:center;gap:12px">
            <div>
              <div style="font-size:11px;color:var(--text-muted);margin-bottom:2px">Aderência Anual {{ currentYear }}</div>
              <div style="display:flex;align-items:center;gap:8px">
                <span style="font-size:18px;font-weight:700" :style="annualAdherence.baseline > 0 ? adherenceStyle(annualAdherence.pct) : ''">
                  {{ annualAdherence.baseline > 0 ? annualAdherence.pct.toFixed(1) + '%' : '—' }}
                </span>
                <span v-if="annualAdherence.baseline > 0" class="badge" :class="adherenceBadge(annualAdherence.pct)">
                  {{ adherenceLabel(annualAdherence.pct) }}
                </span>
              </div>
            </div>
            <div style="font-size:12px;color:var(--text-muted);border-left:1px solid var(--border);padding-left:12px">
              Base: {{ fc(annualAdherence.baseline) }}<br>
              Real: {{ fc(annualAdherence.actual) }}
            </div>
          </div>
        </div>
        <div class="table-wrap">
          <table class="table" style="table-layout:fixed;width:100%">
            <colgroup>
              <col style="width:110px">
              <col style="width:180px">
              <col style="width:180px">
              <col style="width:110px">
              <col>
            </colgroup>
            <thead>
              <tr>
                <th>Mês</th>
                <th style="text-align:right">Baseline</th>
                <th style="text-align:right">Realizado</th>
                <th style="text-align:right">Aderência</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="m in monthlyData" :key="m.month">
                <!-- Linha do mês -->
                <tr @click="toggleMonth(m.month)" style="cursor:pointer;transition:background .12s"
                  :style="selectedMonth === m.month ? 'background:rgba(29,107,63,.09)' : ''">
                  <td style="font-weight:600;white-space:nowrap">
                    <span style="margin-right:6px;font-size:11px;color:var(--text-muted)">{{ selectedMonth === m.month ? '▼' : '▶' }}</span>
                    {{ m.label }}
                  </td>
                  <td class="text-right" style="color:var(--green);white-space:nowrap">{{ fc(m.baseline) }}</td>
                  <td class="text-right" style="color:var(--info);white-space:nowrap">{{ fc(m.actual) }}</td>
                  <td class="text-right" style="font-weight:700;white-space:nowrap" :style="m.pct !== null ? adherenceStyle(m.pct) : ''">
                    {{ m.pct !== null ? m.pct.toFixed(1) + '%' : '—' }}
                  </td>
                  <td>
                    <span v-if="m.pct !== null" class="badge" :class="adherenceBadge(m.pct)">{{ adherenceLabel(m.pct) }}</span>
                    <span v-else class="text-muted text-sm">—</span>
                  </td>
                </tr>

                <!-- Drilldown nível 1: projetos do mês -->
                <tr v-if="selectedMonth === m.month" style="background:rgba(29,107,63,.04)">
                  <td colspan="5" style="padding:0">
                    <div style="padding:10px 16px 14px">
                      <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">
                        Detalhamento — {{ m.label }}
                      </div>
                      <table class="table" style="font-size:13px;margin:0">
                        <thead>
                          <tr style="background:var(--bg)">
                            <th>Projeto</th>
                            <th>Responsável</th>
                            <th style="text-align:right">Baseline</th>
                            <th style="text-align:right">Realizado</th>
                            <th style="text-align:right">Aderência</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <template v-for="row in monthProjectDrilldown(m.month)" :key="row.id">
                            <!-- Linha do projeto -->
                            <tr @click.stop="toggleProjectKey(row.id, m.month)"
                              style="cursor:pointer;transition:background .1s"
                              :style="selectedProjectKey === row.id + '|' + m.month ? 'background:rgba(25,118,210,.08)' : ''">
                              <td style="font-weight:600">
                                <span style="margin-right:5px;font-size:10px;color:var(--text-muted)">{{ selectedProjectKey === row.id + '|' + m.month ? '▼' : '▶' }}</span>
                                {{ row.name }}
                              </td>
                              <td class="text-sm text-muted">{{ row.responsible || '—' }}</td>
                              <td class="text-right" style="color:var(--green)">{{ fc(row.baseline) }}</td>
                              <td class="text-right" style="color:var(--info)">{{ fc(row.actual) }}</td>
                              <td class="text-right" style="font-weight:700" :style="row.pct !== null ? adherenceStyle(row.pct) : ''">
                                {{ row.pct !== null ? row.pct.toFixed(1) + '%' : '—' }}
                              </td>
                              <td>
                                <span v-if="row.pct !== null" class="badge" :class="adherenceBadge(row.pct)">{{ adherenceLabel(row.pct) }}</span>
                                <span v-else class="text-muted text-sm">—</span>
                              </td>
                            </tr>
                            <!-- Drilldown nível 2: itens/compras do projeto no mês -->
                            <tr v-if="selectedProjectKey === row.id + '|' + m.month" style="background:rgba(25,118,210,.04)">
                              <td colspan="6" style="padding:6px 16px 12px 32px">
                                <div v-if="row.items.length === 0" class="text-muted text-sm" style="padding:4px 0">
                                  Sem itens cadastrados para este mês.
                                </div>
                                <table v-else class="table" style="font-size:12px;margin:0">
                                  <thead>
                                    <tr style="background:var(--surface)">
                                      <th>Compra / Item</th>
                                      <th style="text-align:right">Tendência</th>
                                      <th style="text-align:right">Realizado</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr v-for="(item, i) in row.items" :key="i"
                                      class="clickable" @click.stop="item.purchaseId ? $router.push('/purchases/' + item.purchaseId) : null">
                                      <td>{{ item.label }}</td>
                                      <td class="text-right" style="color:var(--warning)">{{ fc(item.trend) }}</td>
                                      <td class="text-right" style="color:var(--info)">{{ fc(item.actual) }}</td>
                                    </tr>
                                  </tbody>
                                </table>
                                <div style="margin-top:8px">
                                  <button class="btn btn-ghost btn-sm" style="font-size:11px" @click.stop="$router.push('/projects/' + row.id)">
                                    → Abrir projeto
                                  </button>
                                </div>
                              </td>
                            </tr>
                          </template>
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

      <!-- Tabela por projeto -->
      <div v-if="selectedIds.length > 0 && hasChartData" class="section">
        <div class="section-title">Resumo por Projeto</div>
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Projeto</th>
                <th>Responsável</th>
                <th class="text-right">Base Acumulada</th>
                <th class="text-right">Realizado Acumulado</th>
                <th class="text-right">Aderência</th>
                <th>Status</th>
                <th class="text-right">Tendência Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in selectedProjects" :key="p.id" class="clickable" @click="$router.push('/projects/' + p.id)">
                <td style="font-weight:600">{{ p.name }}</td>
                <td class="text-sm text-muted">{{ p.responsible || '—' }}</td>
                <td class="text-right" style="color:var(--green)">{{ fc(adherence(p).baselineElapsed) }}</td>
                <td class="text-right" style="color:var(--info)">{{ fc(adherence(p).actualElapsed) }}</td>
                <td class="text-right" style="font-weight:700" :style="adherenceStyle(adherence(p).pct)">
                  {{ adherence(p).baselineElapsed > 0 ? adherence(p).pct.toFixed(1) + '%' : '—' }}
                </td>
                <td>
                  <span v-if="adherence(p).baselineElapsed > 0" class="badge" :class="adherenceBadge(adherence(p).pct)">
                    {{ adherenceLabel(adherence(p).pct) }}
                  </span>
                  <span v-else class="text-muted text-sm">—</span>
                </td>
                <td class="text-right" style="color:var(--warning)">{{ fc(projectTotals(p).trend) }}</td>
              </tr>
            </tbody>
            <tfoot style="background:var(--bg)">
              <tr>
                <td colspan="2" style="font-weight:700;padding:11px 14px">Total Portfólio</td>
                <td class="text-right" style="font-weight:700;padding:11px 14px;color:var(--green)">{{ fc(portfolioAdherence.baselineElapsed) }}</td>
                <td class="text-right" style="font-weight:700;padding:11px 14px;color:var(--info)">{{ fc(portfolioAdherence.actualElapsed) }}</td>
                <td class="text-right" style="font-weight:700;padding:11px 14px" :style="adherenceStyle(portfolioAdherence.pct)">
                  {{ portfolioAdherence.baselineElapsed > 0 ? portfolioAdherence.pct.toFixed(1) + '%' : '—' }}
                </td>
                <td>
                  <span v-if="portfolioAdherence.baselineElapsed > 0" class="badge" :class="adherenceBadge(portfolioAdherence.pct)">
                    {{ adherenceLabel(portfolioAdherence.pct) }}
                  </span>
                </td>
                <td class="text-right" style="font-weight:700;padding:11px 14px;color:var(--warning)">{{ fc(totals.trend) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- Resumo Mensal por Projeto -->
      <div v-if="selectedIds.length > 0 && projectMonthlyRows.length > 0" class="section" style="margin-top:20px">
        <div class="section-title">Resumo Mensal por Projeto</div>
        <div class="table-wrap">
          <table class="table" style="table-layout:fixed;width:100%">
            <colgroup>
              <col style="width:30%">
              <col style="width:100px">
              <col style="width:160px">
              <col style="width:160px">
              <col style="width:100px">
              <col>
            </colgroup>
            <thead>
              <tr>
                <th>Projeto</th>
                <th>Mês</th>
                <th style="text-align:right">Baseline</th>
                <th style="text-align:right">Realizado</th>
                <th style="text-align:right">Aderência</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="grp in projectMonthlyRows" :key="grp.projectId">
                <tr style="background:var(--bg)">
                  <td colspan="6" style="font-weight:700;font-size:13px;padding:8px 14px;border-top:2px solid var(--border)">
                    {{ grp.name }}
                    <span style="font-weight:400;color:var(--text-muted);font-size:12px;margin-left:8px">{{ grp.responsible }}</span>
                  </td>
                </tr>
                <tr v-for="r in grp.rows" :key="r.month">
                  <td></td>
                  <td style="color:var(--text-muted);font-size:13px">{{ r.label }}</td>
                  <td class="text-right" style="color:var(--green)">{{ fc(r.baseline) }}</td>
                  <td class="text-right" style="color:var(--info)">{{ fc(r.actual) }}</td>
                  <td class="text-right" style="font-weight:700" :style="r.pct !== null ? adherenceStyle(r.pct) : ''">
                    {{ r.pct !== null ? r.pct.toFixed(1) + '%' : '—' }}
                  </td>
                  <td>
                    <span v-if="r.pct !== null" class="badge" :class="adherenceBadge(r.pct)">{{ adherenceLabel(r.pct) }}</span>
                    <span v-else class="text-muted text-sm">—</span>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
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
      selectedMonth: null,
      selectedProjectKey: null, // "projectId|month"
    };
  },

  computed: {
    allProjects() {
      return Store.state.projects.filter(p => p.status !== 'cancelled');
    },
    coordinators() {
      return [...Store.state.coordinators].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    },
    // consultants that belong to the selected coordinator
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
      if (this.consultantsForCoordinator) {
        list = list.filter(p => this.consultantsForCoordinator.includes(p.responsible));
      }
      if (this.filterLeader) {
        list = list.filter(p => p.responsible === this.filterLeader);
      }
      return list;
    },
    selectedProjects() {
      return this.allProjects.filter(p => this.selectedIds.includes(p.id));
    },
    totals() {
      let baseline = 0, trend = 0, actual = 0;
      this.selectedProjects.forEach(p => {
        const t = this.projectTotals(p);
        baseline += t.baseline; trend += t.trend; actual += t.actual;
      });
      return { baseline, trend, actual };
    },
    hasChartData() {
      return this.selectedProjects.some(p => (p.disbursements || []).length > 0);
    },
    currentYear() { return new Date().getFullYear(); },

    projectMonthlyRows() {
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      return this.selectedProjects.map(p => {
        const rows = (p.disbursements || [])
          .filter(r => r.month <= currentMonth)
          .sort((a, b) => a.month.localeCompare(b.month))
          .map(r => {
            const baseline = numberInput(r.baseline);
            const actual   = this.rowActual(r);
            return { month: r.month, label: formatMonth(r.month), baseline, actual, pct: baseline > 0 ? (actual / baseline * 100) : null };
          })
          .filter(r => r.baseline > 0 || r.actual > 0);
        return { projectId: p.id, name: p.name, responsible: p.responsible || '—', rows };
      }).filter(grp => grp.rows.length > 0);
    },

    monthlyData() {
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const map = {};
      this.selectedProjects.forEach(p => {
        (p.disbursements || []).filter(r => r.month <= currentMonth).forEach(r => {
          if (!map[r.month]) map[r.month] = { baseline: 0, actual: 0 };
          map[r.month].baseline += numberInput(r.baseline);
          map[r.month].actual  += this.rowActual(r);
        });
      });
      return Object.entries(map)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, { baseline, actual }]) => ({
          month, label: formatMonth(month), baseline, actual,
          pct: baseline > 0 ? (actual / baseline * 100) : null
        }));
    },

    annualAdherence() {
      const year = String(new Date().getFullYear());
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      let baseline = 0, actual = 0;
      this.selectedProjects.forEach(p => {
        (p.disbursements || [])
          .filter(r => r.month.startsWith(year) && r.month <= currentMonth)
          .forEach(r => {
            baseline += numberInput(r.baseline);
            actual   += this.rowActual(r);
          });
      });
      const pct = baseline > 0 ? (actual / baseline * 100) : 0;
      return { baseline, actual, pct };
    },

    portfolioAdherence() {
      let baselineElapsed = 0, actualElapsed = 0;
      this.selectedProjects.forEach(p => {
        const a = this.adherence(p);
        baselineElapsed += a.baselineElapsed;
        actualElapsed   += a.actualElapsed;
      });
      const pct = baselineElapsed > 0 ? (actualElapsed / baselineElapsed * 100) : 0;
      return { baselineElapsed, actualElapsed, pct };
    },
  },

  watch: {
    selectedIds() { this.$nextTick(() => this.renderChart()); },
    availableProjects(newVal) {
      // When leader filter changes, keep only still-available projects selected
      const ids = newVal.map(p => p.id);
      this.selectedIds = this.selectedIds.filter(id => ids.includes(id));
    },
  },

  methods: {
    fc(v) { return formatCurrency(v); },

    toggleMonth(month) {
      this.selectedMonth = this.selectedMonth === month ? null : month;
      this.selectedProjectKey = null;
    },

    toggleProjectKey(projectId, month) {
      const key = projectId + '|' + month;
      this.selectedProjectKey = this.selectedProjectKey === key ? null : key;
    },

    monthProjectDrilldown(month) {
      return this.selectedProjects.map(p => {
        const row = (p.disbursements || []).find(r => r.month === month);
        if (!row) return null;
        const baseline = numberInput(row.baseline);
        const actual   = this.rowActual(row);
        if (baseline === 0 && actual === 0) return null;
        const pct = baseline > 0 ? (actual / baseline * 100) : null;

        // Resolve itens (trend_items) com nome da compra
        const items = (row.trend_items || []).map(ti => {
          let label = '—', purchaseId = null;
          if (ti.purchase_id && ti.purchase_id.startsWith('rateio:')) {
            const rid = ti.purchase_id.replace('rateio:', '');
            const rat = (Store.state.rateios || []).find(r => r.id === rid);
            label = rat ? `⚖️ ${rat.description || rat.supplier || 'Rateio'}` : 'Rateio';
          } else if (ti.purchase_id) {
            const pur = Store.state.purchases.find(pu => pu.id === ti.purchase_id);
            if (pur) {
              label = [pur.number ? 'RC ' + pur.number : '', pur.description, pur.supplier].filter(Boolean).join(' · ');
              purchaseId = pur.id;
            }
          }
          return { label, trend: numberInput(ti.value), actual: numberInput(ti.actual), purchaseId };
        });

        // Fallback: sem trend_items mas tem valores legacy
        if (items.length === 0 && (this.rowTrend(row) > 0 || actual > 0)) {
          items.push({ label: 'Valor do mês', trend: this.rowTrend(row), actual, purchaseId: null });
        }

        return { id: p.id, name: p.name, responsible: p.responsible, baseline, actual, pct, items };
      }).filter(Boolean).sort((a, b) => {
        if (a.pct !== null && b.pct !== null) return a.pct - b.pct;
        if (a.pct !== null) return -1;
        return 1;
      });
    },

    toggleProject(id) {
      const idx = this.selectedIds.indexOf(id);
      if (idx >= 0) this.selectedIds.splice(idx, 1);
      else this.selectedIds.push(id);
    },

    selectAll() { this.selectedIds = this.availableProjects.map(p => p.id); },
    selectNone() { this.selectedIds = []; },

    onCoordinatorChange() {
      this.filterLeader = '';
      this.selectedIds = this.availableProjects.map(p => p.id);
    },
    onLeaderChange() {
      this.selectedIds = this.availableProjects.map(p => p.id);
    },

    adherence(p) {
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const elapsed = (p.disbursements || []).filter(r => r.month <= currentMonth);
      const baselineElapsed = elapsed.reduce((s, r) => s + numberInput(r.baseline), 0);
      const actualElapsed   = elapsed.reduce((s, r) => s + this.rowActual(r), 0);
      const pct = baselineElapsed > 0 ? (actualElapsed / baselineElapsed * 100) : 0;
      return { baselineElapsed, actualElapsed, pct };
    },

    adherenceStyle(pct) {
      if (pct === 0) return '';
      if (pct >= 90 && pct <= 110) return 'color:var(--green)';
      if (pct < 90 && pct >= 70)  return 'color:var(--warning)';
      if (pct > 110 && pct <= 130) return 'color:var(--warning)';
      return 'color:var(--danger)';
    },

    adherenceBadge(pct) {
      if (pct >= 90 && pct <= 110) return 'badge-green';
      if ((pct >= 70 && pct < 90) || (pct > 110 && pct <= 130)) return 'badge-yellow';
      return 'badge-red';
    },

    adherenceLabel(pct) {
      if (pct >= 90 && pct <= 110) return 'No alvo';
      if (pct < 90 && pct >= 70)  return 'Abaixo';
      if (pct < 70)               return 'Muito abaixo';
      if (pct > 110 && pct <= 130) return 'Acima';
      return 'Muito acima';
    },

    rowTrend(r) {
      if (r.trend_items && r.trend_items.length > 0) return r.trend_items.reduce((s, ti) => s + numberInput(ti.value), 0);
      return numberInput(r.trend || 0);
    },

    rowActual(r) {
      if (r.trend_items && r.trend_items.length > 0) return r.trend_items.reduce((s, ti) => s + numberInput(ti.actual), 0);
      return numberInput(r.actual || 0);
    },

    projectTotals(p) {
      const rows = p.disbursements || [];
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      return {
        baseline: rows.reduce((s, r) => s + numberInput(r.baseline), 0),
        trend:    rows.reduce((s, r) => s + this.rowTrend(r), 0),
        actual:   rows.filter(r => r.month <= currentMonth).reduce((s, r) => s + this.rowActual(r), 0),
      };
    },

    renderChart() {
      if (this.chartInstance) { this.chartInstance.destroy(); this.chartInstance = null; }

      if (!this.hasChartData || this.selectedIds.length === 0) return;

      this.$nextTick(() => {
      const canvas = this.$refs.chart;
      if (!canvas) return;

      // Collect all months across selected projects
      const monthSet = new Set();
      this.selectedProjects.forEach(p => {
        (p.disbursements || []).forEach(r => { if (r.month) monthSet.add(r.month); });
      });

      if (monthSet.size === 0) return;

      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const months = [...monthSet].sort();

      let cumBase = 0, cumTrend = 0, cumActual = 0, lastActual = 0, futureTrend = 0;
      const labels = [], baseline = [], trend = [], actual = [], projection = [];

      months.forEach(m => {
        let mBase = 0, mTrend = 0, mActual = 0;
        this.selectedProjects.forEach(p => {
          const row = (p.disbursements || []).find(r => r.month === m);
          if (!row) return;
          mBase  += numberInput(row.baseline);
          mTrend += this.rowTrend(row);
          if (m <= currentMonth) mActual += this.rowActual(row);
        });
        cumBase  += mBase;
        cumTrend += mTrend;
        if (m < currentMonth) {
          cumActual += mActual;
          lastActual = cumActual;
          actual.push(cumActual || null);
          projection.push(null);
        } else if (m === currentMonth) {
          cumActual += mActual;
          lastActual = cumActual;
          actual.push(cumActual || null);
          projection.push(cumActual || null); // ponto de conexão
        } else {
          futureTrend += mTrend;
          actual.push(null);
          projection.push(lastActual + futureTrend);
        }
        labels.push(formatMonth(m));
        baseline.push(cumBase);
        trend.push(cumTrend);
      });

      this.chartInstance = new Chart(canvas, {
        type: 'line',
        data: {
          labels,
          datasets: [
            { label: 'Linha de Base',        data: baseline,   borderColor: '#1D6B3F', backgroundColor: 'rgba(29,107,63,.08)', borderWidth: 2.5, tension: .35, fill: false, pointRadius: 3, pointBackgroundColor: '#1D6B3F' },
            { label: 'Tendência',            data: trend,      borderColor: '#FF9800', backgroundColor: 'rgba(255,152,0,.08)', borderWidth: 2, tension: .35, fill: false, pointRadius: 3, pointBackgroundColor: '#FF9800', borderDash: [6, 4] },
            { label: 'Realizado',            data: actual,     borderColor: '#1976D2', backgroundColor: 'rgba(25,118,210,.1)', borderWidth: 2.5, tension: .35, fill: false, pointRadius: 4, pointBackgroundColor: '#1976D2', spanGaps: false },
            { label: 'Realizado + Tendência',data: projection, borderColor: '#9C27B0', backgroundColor: 'rgba(156,39,176,.07)', borderWidth: 2, tension: .35, fill: false, pointRadius: 3, pointBackgroundColor: '#9C27B0', borderDash: [3, 3], spanGaps: false },
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top', labels: { font: { size: 12 }, usePointStyle: true } },
            tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}` } }
          },
          scales: {
            x: { grid: { color: 'rgba(0,0,0,.05)' } },
            y: { ticks: { callback: v => formatCurrency(v) }, grid: { color: 'rgba(0,0,0,.05)' } }
          }
        }
      });
      }); // end $nextTick
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
