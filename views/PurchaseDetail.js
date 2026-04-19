window.PurchaseDetailView = {
  template: `
    <div class="page">
      <div class="back-btn" @click="$router.push('/purchases')">← Compras</div>

      <div v-if="!purchase">
        <p class="text-muted">Compra não encontrada.</p>
      </div>

      <template v-if="purchase">
        <div class="page-header">
          <div>
            <h1>{{ purchase.description || purchase.number || 'Compra' }}</h1>
            <div style="display:flex;align-items:center;gap:8px;margin-top:6px">
              <span v-if="purchase.number" class="badge badge-gray">{{ purchase.number }}</span>
              <span :class="'badge badge-' + statusColor(purchase.status)">{{ statusLabel(purchase.status) }}</span>
              <span v-if="projectName" class="badge badge-blue">📁 {{ projectName }}</span>
            </div>
          </div>
          <button class="btn btn-secondary btn-sm" @click="editMode = !editMode">{{ editMode ? 'Cancelar' : '✏️ Editar' }}</button>
        </div>

        <!-- Edit form -->
        <div v-if="editMode" class="form-panel">
          <div class="form-panel-title">Editar Compra</div>
          <div class="form-row-3">
            <div class="form-group">
              <label class="form-label">Projeto</label>
              <select class="form-control" v-model="form.project_id">
                <option value="">— Sem projeto —</option>
                <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Nº da RC</label>
              <input class="form-control" v-model="form.number">
            </div>
            <div class="form-group">
              <label class="form-label">Nº do Pedido</label>
              <input class="form-control" v-model="form.po_number">
            </div>
          </div>
          <div class="form-row-1">
            <div class="form-group">
              <label class="form-label">Descrição *</label>
              <input class="form-control" v-model="form.description">
            </div>
          </div>
          <div class="form-row-3">
            <div class="form-group">
              <label class="form-label">Status</label>
              <select class="form-control" v-model="form.status">
                <option value="forecast">Previsão</option>
                <option value="requisition">RC Aberta</option>
                <option value="quoting">Em Cotação</option>
                <option value="approved">Aprovado</option>
                <option value="po_issued">PO Emitida</option>
                <option value="in_transit">Em Trânsito</option>
                <option value="received">Recebido</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Comprador Responsável</label>
              <select class="form-control" v-model="form.buyer_id">
                <option value="">— Sem comprador —</option>
                <option v-for="b in buyers" :key="b.id" :value="b.id">{{ b.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Categoria CAPEX</label>
              <select class="form-control" v-model="form.budget_category_id">
                <option value="">— Selecione —</option>
                <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>
          </div>
          <div class="form-row-3">
            <div class="form-group">
              <label class="form-label">Valor da RC ($)</label>
              <input class="form-control" type="number" v-model="form.estimated_value">
              <div class="form-hint">Usado para Previsão de Uso</div>
            </div>
            <div class="form-group">
              <label class="form-label">Valor do Pedido ($)</label>
              <input class="form-control" type="number" v-model="form.approved_value">
              <div class="form-hint">Usado para Compromissado</div>
            </div>
            <div class="form-group">
              <label class="form-label">Data da Solicitação</label>
              <input class="form-control" type="date" v-model="form.request_date">
            </div>
          </div>
          <div class="form-row-3">
            <div class="form-group">
              <label class="form-label">Data Prevista de Chegada</label>
              <input class="form-control" type="date" v-model="form.expected_arrival_date">
            </div>
            <div class="form-group">
              <label class="form-label">Data Real de Chegada</label>
              <input class="form-control" type="date" v-model="form.actual_arrival_date">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Fornecedor</label>
              <input class="form-control" v-model="form.supplier">
            </div>
            <div class="form-group">
              <label class="form-label">Notas</label>
              <input class="form-control" v-model="form.notes">
            </div>
          </div>
          <div class="form-row-1">
            <div class="form-group">
              <label class="form-label">Especificação Técnica (ET)</label>
              <textarea class="form-control" v-model="form.technical_spec" rows="4"></textarea>
            </div>
          </div>

          <!-- Processo Licitatório no form -->
          <div class="form-section-title">Processo Licitatório</div>
          <div class="form-row-3">
            <div class="form-group">
              <label class="form-label">Categoria</label>
              <select class="form-control" v-model="form.proc_category">
                <option value="normal">Normal</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
          </div>
          <div class="form-section-title" style="color:var(--info);border-bottom-color:rgba(33,150,243,.2)">Datas Planejadas (MS)</div>
          <div class="form-row-3">
            <div class="form-group">
              <label class="form-label">RC (MS)</label>
              <input class="form-control" type="date" v-model="form.ms_rc">
            </div>
            <div class="form-group">
              <label class="form-label">ET — Espec. Técnica (MS)</label>
              <input class="form-control" type="date" v-model="form.ms_et">
            </div>
            <div class="form-group">
              <label class="form-label">Carta Convite (MS)</label>
              <input class="form-control" type="date" v-model="form.ms_invitation">
            </div>
            <div class="form-group">
              <label class="form-label">Rec. Propostas (MS)</label>
              <input class="form-control" type="date" v-model="form.ms_proposals">
            </div>
            <div class="form-group">
              <label class="form-label">Análise Técnica (MS)</label>
              <input class="form-control" type="date" v-model="form.ms_analysis">
            </div>
            <div class="form-group">
              <label class="form-label">Pedido de Compras (MS)</label>
              <input class="form-control" type="date" v-model="form.ms_po">
            </div>
          </div>
          <div class="form-section-title" style="color:var(--danger);border-bottom-color:rgba(244,67,54,.2)">Datas Reais</div>
          <div class="form-row-3">
            <div class="form-group">
              <label class="form-label">RC Aprovada</label>
              <input class="form-control" type="date" v-model="form.real_rc">
            </div>
            <div class="form-group">
              <label class="form-label">Carta Convite Enviada</label>
              <input class="form-control" type="date" v-model="form.real_invitation">
            </div>
            <div class="form-group">
              <label class="form-label">Propostas Recebidas</label>
              <input class="form-control" type="date" v-model="form.real_proposals">
            </div>
            <div class="form-group">
              <label class="form-label">Análise Técnica</label>
              <input class="form-control" type="date" v-model="form.real_analysis">
            </div>
            <div class="form-group">
              <label class="form-label">Pedido de Compras (Real)</label>
              <input class="form-control" type="date" v-model="form.real_po">
            </div>
          </div>

          <div class="form-actions">
            <button class="btn btn-primary" @click="savePurchase">Salvar</button>
            <button class="btn btn-secondary" @click="editMode = false">Cancelar</button>
            <button class="btn btn-danger" style="margin-left:auto" @click="deletePurchase">Excluir</button>
          </div>
        </div>

        <!-- Tabs -->
        <div class="tabs">
          <button v-for="t in tabs" :key="t.key" class="tab-btn"
            :class="{ active: activeTab === t.key }" @click="activeTab = t.key">
            {{ t.label }}
          </button>
        </div>

        <!-- TAB: VISÃO GERAL -->
        <div v-if="activeTab === 'overview'">
          <div class="card">
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Projeto</div>
                <div class="info-value">{{ projectName || '—' }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Nº da RC</div>
                <div class="info-value">{{ purchase.number || '—' }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Nº do Pedido</div>
                <div class="info-value">{{ purchase.po_number || '—' }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Comprador</div>
                <div class="info-value">{{ buyerName }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Fornecedor</div>
                <div class="info-value">{{ purchase.supplier || '—' }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Categoria CAPEX</div>
                <div class="info-value">{{ categoryName }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Data da Solicitação</div>
                <div class="info-value">{{ formatDate(purchase.request_date) }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Data da PO</div>
                <div class="info-value">{{ formatDate(purchase.po_date) }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Previsão de Chegada</div>
                <div class="info-value"
                  :style="isOverdue(purchase.expected_arrival_date) && !['received','cancelled'].includes(purchase.status) ? 'color:var(--danger);font-weight:700' : ''">
                  {{ formatDate(purchase.expected_arrival_date) }}
                </div>
              </div>
              <div class="info-item">
                <div class="info-label">Chegada Real</div>
                <div class="info-value">{{ formatDate(purchase.actual_arrival_date) }}</div>
              </div>
            </div>

            <!-- Valores -->
            <div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--border)">
              <div class="grid-4">
                <div class="fin-card fc-forecast">
                  <div class="fin-label">Valor da RC</div>
                  <div class="fin-value">{{ fc(purchase.estimated_value) }}</div>
                </div>
                <div class="fin-card fc-committed">
                  <div class="fin-label">Valor do Pedido</div>
                  <div class="fin-value">{{ fc(purchase.approved_value) }}</div>
                </div>
                <div class="fin-card fc-actual">
                  <div class="fin-label">Valor Desembolsado</div>
                  <div class="fin-value">{{ fc(disbursed) }}</div>
                </div>
                <div class="fin-card fc-balance" :class="orderBalance < 0 ? 'negative' : ''">
                  <div class="fin-label">Saldo do Pedido</div>
                  <div class="fin-value">{{ fc(orderBalance) }}</div>
                </div>
              </div>
            </div>

            <!-- ET -->
            <div v-if="purchase.technical_spec" style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border)">
              <div class="info-label" style="margin-bottom:6px">Especificação Técnica (ET)</div>
              <div style="white-space:pre-wrap;font-size:13.5px;color:var(--text);background:var(--bg);padding:12px;border-radius:6px;border:1px solid var(--border)">{{ purchase.technical_spec }}</div>
            </div>

            <div v-if="purchase.notes" style="margin-top:12px">
              <div class="info-label" style="margin-bottom:4px">Notas</div>
              <div style="font-size:13px;color:var(--text-mid)">{{ purchase.notes }}</div>
            </div>
          </div>

          <!-- Processo Licitatório -->
          <div class="card" style="margin-top:16px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
              <div style="font-weight:700;font-size:15px">Processo Licitatório</div>
              <span v-if="purchase.proc_category" :class="purchase.proc_category === 'urgente' ? 'badge badge-red' : 'badge badge-green'">
                {{ purchase.proc_category === 'urgente' ? '🔴 Urgente' : '🟢 Normal' }}
              </span>
            </div>
            <table class="table" style="table-layout:fixed">
              <colgroup>
                <col style="width:180px">
                <col style="width:130px">
                <col style="width:130px">
                <col style="width:120px">
              </colgroup>
              <thead>
                <tr>
                  <th>Etapa</th>
                  <th style="text-align:center">Planejado (MS)</th>
                  <th style="text-align:center">Real</th>
                  <th style="text-align:center">Desvio</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="step in procSteps" :key="step.label">
                  <td style="font-size:13px;font-weight:500">{{ step.label }}</td>
                  <td style="text-align:center;font-size:12px;color:var(--text-muted)">{{ fd(step.planned) }}</td>
                  <td style="text-align:center;font-size:12px">{{ fd(step.real) }}</td>
                  <td style="text-align:center">
                    <span v-if="daysDiff(step.planned, step.real) !== null"
                      style="font-size:12px;font-weight:700"
                      :style="deltaStyle(daysDiff(step.planned, step.real))">
                      {{ deltaLabel(daysDiff(step.planned, step.real)) }}
                    </span>
                    <span v-else style="font-size:12px;color:var(--text-muted)">—</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

        <!-- TAB: DESEMBOLSO -->
        <div v-if="activeTab === 'disbursement'">
          <!-- Chart -->
          <div class="chart-wrap" style="margin-bottom:20px">
            <div class="chart-title">Curva de Desembolso</div>
            <canvas ref="disbChart" height="260"></canvas>
            <div v-if="rows.length === 0" style="text-align:center;padding:40px;color:var(--text-muted);font-size:13px">
              Adicione os dados mensais abaixo para gerar o gráfico.
            </div>
          </div>

          <!-- Totals row -->
          <div v-if="rows.length > 0" class="grid-3" style="margin-bottom:20px">
            <div class="fin-card" style="border-left:4px solid #1D6B3F">
              <div class="fin-label">Total Linha de Base</div>
              <div class="fin-value" style="color:#1D6B3F">{{ fc(totalBaseline) }}</div>
            </div>
            <div class="fin-card" style="border-left:4px solid #FF9800">
              <div class="fin-label">Total Tendência</div>
              <div class="fin-value" style="color:#E65100">{{ fc(totalTrend) }}</div>
            </div>
            <div class="fin-card" style="border-left:4px solid #1976D2">
              <div class="fin-label">Total Realizado</div>
              <div class="fin-value" style="color:#1565C0">{{ fc(totalActual) }}</div>
            </div>
          </div>

          <!-- Data entry table -->
          <div class="scurve-table-wrap">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
              <div class="section-title" style="margin-bottom:0">Dados Mensais de Desembolso</div>
              <button class="btn btn-secondary btn-sm" @click="addRow">+ Adicionar Mês</button>
            </div>

            <div v-if="rows.length === 0" style="color:var(--text-muted);font-size:13px;padding:8px 0">
              Nenhum mês cadastrado.
            </div>

            <!-- Header -->
            <div v-if="rows.length > 0" style="display:grid;grid-template-columns:150px 1fr 1fr 1fr 36px;gap:8px;margin-bottom:6px;padding:0 4px">
              <div class="form-label">Mês</div>
              <div class="form-label" style="color:#1D6B3F">Linha de Base (R$)</div>
              <div class="form-label" style="color:#E65100">Tendência (R$)</div>
              <div class="form-label" style="color:#1565C0">Realizado (R$)</div>
              <div></div>
            </div>

            <div v-for="(row, i) in rows" :key="i"
              style="display:grid;grid-template-columns:150px 1fr 1fr 1fr 36px;gap:8px;align-items:center;margin-bottom:6px">
              <input type="month" v-model="row.month" class="form-control" style="padding:6px 8px;font-size:13px" @change="saveRows">
              <input type="number" v-model="row.baseline" placeholder="0" class="form-control"
                style="padding:6px 8px;font-size:13px;border-color:#C8E6C9" @change="saveRows">
              <input type="number" v-model="row.trend" placeholder="0" class="form-control"
                style="padding:6px 8px;font-size:13px;border-color:#FFE0B2" @change="saveRows">
              <input type="number" v-model="row.actual" placeholder="0" class="form-control"
                style="padding:6px 8px;font-size:13px;border-color:#BBDEFB" @change="saveRows">
              <button class="btn-icon" @click="removeRow(i)">🗑️</button>
            </div>

            <div v-if="rows.length > 0" style="margin-top:12px">
              <button class="btn btn-primary btn-sm" @click="saveRows">Salvar</button>
            </div>
          </div>
        </div>

      </template>
    </div>
  `,
  data() {
    return {
      activeTab: 'overview',
      editMode: false,
      form: {},
      rows: [],
      chartInstance: null,
      tabs: [
        { key: 'overview', label: '📋 Dados da Compra' },
      ]
    };
  },
  computed: {
    purchase() { return Store.getPurchase(this.$route.params.id); },
    projects() { return Store.state.projects; },
    buyers() { return Store.state.buyers; },
    categories() { return Store.state.budgetCategories; },
    projectName() { return Store.getProject(this.purchase?.project_id)?.name || ''; },
    buyerName() { return Store.state.buyers.find(b => b.id === this.purchase?.buyer_id)?.name || '—'; },
    categoryName() { return Store.state.budgetCategories.find(c => c.id === this.purchase?.budget_category_id)?.name || '—'; },
    totalBaseline() { return this.rows.reduce((s, r) => s + numberInput(r.baseline), 0); },
    totalTrend() { return this.rows.reduce((s, r) => s + numberInput(r.trend), 0); },
    totalActual() { return this.rows.reduce((s, r) => s + numberInput(r.actual), 0); },
    disbursed() { return this.totalActual; },
    orderBalance() { return (this.purchase?.approved_value || 0) - this.disbursed; },
    procSteps() {
      const p = this.purchase;
      if (!p) return [];
      return [
        { label: 'RC Aprovada',       planned: p.ms_rc,         real: p.real_rc || p.request_date },
        { label: 'ET / Espec. Técnica', planned: p.ms_et,       real: null },
        { label: 'Carta Convite',     planned: p.ms_invitation,  real: p.real_invitation },
        { label: 'Rec. Propostas',    planned: p.ms_proposals,   real: p.real_proposals },
        { label: 'Análise Técnica',   planned: p.ms_analysis,    real: p.real_analysis },
        { label: 'Pedido de Compras', planned: p.ms_po,          real: p.real_po || p.po_date },
      ];
    },
  },
  watch: {
    activeTab(val) { if (val === 'disbursement') this.$nextTick(() => this.renderChart()); },
    rows: { handler() { if (this.activeTab === 'disbursement') this.$nextTick(() => this.renderChart()); }, deep: true }
  },
  methods: {
    fc(v) { return formatCurrency(v); },
    fd(d) { return d ? formatDate(d) : '—'; },
    statusLabel, statusColor, formatDate, isOverdue,

    daysDiff(msDate, realDate) {
      if (!msDate || !realDate) return null;
      return Math.round((new Date(msDate) - new Date(realDate)) / 86400000);
    },
    deltaLabel(days) {
      if (days === null) return '—';
      if (days === 0) return '0d';
      return (days > 0 ? '+' : '') + days + 'd';
    },
    deltaStyle(days) {
      if (days === null) return 'color:var(--text-muted)';
      if (days < -5) return 'color:var(--danger)';
      if (days < 0) return 'color:var(--warning)';
      return 'color:var(--green)';
    },

    loadForm() {
      if (this.purchase) {
        this.form = { ...this.purchase };
        this.rows = (this.purchase.disbursements || []).map(r => ({ ...r }));
      }
    },

    savePurchase() {
      if (!this.form.description?.trim()) { alert('Descrição obrigatória'); return; }
      Store.updatePurchase(this.purchase.id, this.form);
      this.editMode = false;
    },

    deletePurchase() {
      if (!confirm('Excluir esta compra?')) return;
      Store.deletePurchase(this.purchase.id);
      this.$router.push('/purchases');
    },

    addRow() {
      const last = this.rows.length > 0 ? this.rows[this.rows.length - 1].month : '';
      let next = '';
      if (last) {
        const d = new Date(last + '-01');
        d.setMonth(d.getMonth() + 1);
        next = d.toISOString().slice(0, 7);
      }
      this.rows.push({ month: next, baseline: 0, trend: 0, actual: 0 });
    },

    removeRow(i) {
      this.rows.splice(i, 1);
      this.saveRows();
    },

    saveRows() {
      const sorted = [...this.rows]
        .filter(r => r.month)
        .sort((a, b) => a.month.localeCompare(b.month))
        .map(r => ({
          month: r.month,
          baseline: numberInput(r.baseline),
          trend: numberInput(r.trend),
          actual: numberInput(r.actual)
        }));
      Store.updatePurchase(this.purchase.id, { disbursements: sorted });
      this.$nextTick(() => this.renderChart());
    },

    renderChart() {
      const canvas = this.$refs.disbChart;
      if (!canvas || this.rows.length === 0) return;

      const sorted = [...this.rows].filter(r => r.month).sort((a, b) => a.month.localeCompare(b.month));

      // Cumulative values
      let cumBase = 0, cumTrend = 0, cumActual = 0;
      const labels = [], baseline = [], trend = [], actual = [];
      sorted.forEach(r => {
        cumBase   += numberInput(r.baseline);
        cumTrend  += numberInput(r.trend);
        cumActual += numberInput(r.actual);
        labels.push(formatMonth(r.month));
        baseline.push(cumBase);
        trend.push(cumTrend);
        actual.push(cumActual === 0 ? null : cumActual);
      });

      if (this.chartInstance) { this.chartInstance.destroy(); this.chartInstance = null; }

      this.chartInstance = new Chart(canvas, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Linha de Base',
              data: baseline,
              borderColor: '#1D6B3F',
              backgroundColor: 'rgba(29,107,63,.08)',
              borderWidth: 2.5,
              tension: .35,
              fill: false,
              pointRadius: 4,
              pointBackgroundColor: '#1D6B3F',
            },
            {
              label: 'Tendência',
              data: trend,
              borderColor: '#FF9800',
              backgroundColor: 'rgba(255,152,0,.08)',
              borderWidth: 2.5,
              borderDash: [6, 4],
              tension: .35,
              fill: false,
              pointRadius: 4,
              pointBackgroundColor: '#FF9800',
            },
            {
              label: 'Realizado',
              data: actual,
              borderColor: '#1976D2',
              backgroundColor: 'rgba(25,118,210,.1)',
              borderWidth: 2.5,
              tension: .35,
              fill: false,
              pointRadius: 5,
              pointBackgroundColor: '#1976D2',
              spanGaps: false,
            },
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              position: 'top',
              labels: { font: { size: 12 }, usePointStyle: true, pointStyleWidth: 20 }
            },
            tooltip: {
              callbacks: {
                label: ctx => `${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}`
              }
            }
          },
          scales: {
            x: { grid: { color: 'rgba(0,0,0,.05)' } },
            y: {
              ticks: { callback: v => formatCurrency(v) },
              grid: { color: 'rgba(0,0,0,.05)' }
            }
          }
        }
      });
    }
  },
  created() { this.loadForm(); },
  mounted() { if (this.activeTab === 'disbursement') this.$nextTick(() => this.renderChart()); },
  beforeUnmount() { if (this.chartInstance) this.chartInstance.destroy(); }
};
