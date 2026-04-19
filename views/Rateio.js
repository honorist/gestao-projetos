window.RateioView = {
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Rateio de Custos</h1>
          <div class="subtitle">Distribuição de compras compartilhadas entre projetos</div>
        </div>
        <button class="btn btn-primary" @click="openNew">+ Novo Rateio</button>
      </div>

      <!-- Filtros -->
      <div class="card" style="margin-bottom:20px;display:flex;gap:20px;flex-wrap:wrap;align-items:flex-end">
        <div>
          <div class="form-label" style="margin-bottom:6px">Mês</div>
          <input class="form-control" type="month" v-model="filterMonth" style="min-width:160px">
        </div>
        <div>
          <div class="form-label" style="margin-bottom:6px">Projeto</div>
          <select class="form-control" v-model="filterProject" style="min-width:220px">
            <option value="">— Todos —</option>
            <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.name }}</option>
          </select>
        </div>
        <div style="color:var(--text-muted);font-size:13px;padding-bottom:8px">
          {{ filteredRateios.length }} rateio(s)
        </div>
      </div>

      <!-- Tabela -->
      <div v-if="filteredRateios.length > 0" class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Mês</th>
              <th>Descrição</th>
              <th>RC</th>
              <th>PO</th>
              <th>Fornecedor</th>
              <th style="text-align:right">Valor Total ($)</th>
              <th style="text-align:right">Alocado ($)</th>
              <th>Projetos</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in filteredRateios" :key="r.id" class="clickable" @click="openEdit(r)">
              <td style="white-space:nowrap;font-weight:600">{{ formatMonthLabel(r.month) }}</td>
              <td style="font-weight:600">{{ r.description || '—' }}</td>
              <td style="font-size:12px;color:var(--text-muted)">{{ r.rc_number || '—' }}</td>
              <td style="font-size:12px;color:var(--text-muted)">{{ r.po_number || '—' }}</td>
              <td style="font-size:12px">{{ r.supplier || '—' }}</td>
              <td style="text-align:right">{{ fu(r.total_value) }}</td>
              <td style="text-align:right" :style="totalAllocated(r) > r.total_value ? 'color:var(--danger);font-weight:700' : totalAllocated(r) === r.total_value ? 'color:var(--green)' : 'color:var(--warning)'">
                {{ fu(totalAllocated(r)) }}
                <span style="font-size:11px;margin-left:2px">({{ r.total_value > 0 ? (totalAllocated(r)/r.total_value*100).toFixed(0) : 0 }}%)</span>
              </td>
              <td>
                <div style="display:flex;flex-wrap:wrap;gap:4px">
                  <span v-for="a in r.allocations" :key="a.project_id" class="badge badge-gray" style="font-size:10px">
                    {{ projectShortName(a.project_id) }}
                  </span>
                </div>
              </td>
              <td @click.stop>
                <button class="btn-icon" @click="openEdit(r)">✏️</button>
                <button class="btn-icon" @click="deleteRateio(r)">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty -->
      <div v-if="filteredRateios.length === 0" class="card" style="text-align:center;padding:60px 20px;color:var(--text-muted)">
        <div style="font-size:48px;margin-bottom:14px">⚖️</div>
        <div style="font-size:16px;font-weight:600;margin-bottom:8px;color:var(--text)">Nenhum rateio cadastrado</div>
        <div style="font-size:14px;margin-bottom:24px">Cadastre compras compartilhadas e distribua os custos entre os projetos.</div>
        <button class="btn btn-primary" @click="openNew">+ Novo Rateio</button>
      </div>

      <!-- Modal -->
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal" style="max-width:780px;max-height:94vh;overflow-y:auto">
          <div class="modal-header">
            <h3>{{ editingId ? 'Editar Rateio' : 'Novo Rateio' }}</h3>
            <button class="btn btn-ghost" @click="closeModal">✕</button>
          </div>
          <div class="modal-body" style="display:grid;gap:16px">

            <!-- Cabeçalho -->
            <div style="display:grid;grid-template-columns:2fr 1fr 1fr;gap:14px">
              <div>
                <div class="form-label">Descrição *</div>
                <input class="form-control" v-model="form.description" placeholder="Ex: Contrato de manutenção geral">
              </div>
              <div>
                <div class="form-label">Mês de Competência *</div>
                <input class="form-control" type="month" v-model="form.month">
              </div>
              <div>
                <div class="form-label">Fornecedor</div>
                <input class="form-control" v-model="form.supplier" placeholder="Nome da empresa">
              </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px">
              <div>
                <div class="form-label">Nº RC</div>
                <input class="form-control" v-model="form.rc_number" placeholder="RC-XXXXX">
              </div>
              <div>
                <div class="form-label">Nº Pedido (PO)</div>
                <input class="form-control" v-model="form.po_number" placeholder="PO-XXXXX">
              </div>
              <div>
                <div class="form-label">Valor Total ($) *</div>
                <input class="form-control" type="number" v-model.number="form.total_value" placeholder="0"
                  @input="onTotalChange">
              </div>
            </div>

            <!-- Alocações por projeto -->
            <div style="border-top:2px solid var(--green-xlight);padding-top:16px">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
                <div class="form-section-title" style="margin:0">Distribuição por Projeto</div>
                <button class="btn btn-secondary btn-sm" @click="addAllocation">+ Adicionar Projeto</button>
              </div>
              <div style="margin-bottom:12px">
                <select class="form-control" v-model="modalFilterLeader" style="max-width:280px">
                  <option value="">— Filtrar por líder —</option>
                  <option v-for="l in leaders" :key="l" :value="l">{{ l }}</option>
                </select>
              </div>

              <!-- Cabeçalho das colunas -->
              <div v-if="form.allocations.length > 0"
                style="display:grid;grid-template-columns:1fr 160px 120px 36px;gap:10px;margin-bottom:6px;padding:0 2px">
                <div class="form-label">Projeto</div>
                <div class="form-label" style="text-align:right">Valor ($)</div>
                <div class="form-label" style="text-align:right">%</div>
                <div></div>
              </div>

              <div v-for="(alloc, i) in form.allocations" :key="i"
                style="display:grid;grid-template-columns:1fr 160px 120px 36px;gap:10px;align-items:center;margin-bottom:8px">
                <select class="form-control" v-model="alloc.project_id">
                  <option value="">— Selecione o projeto —</option>
                  <option v-for="p in projectsForAllocation" :key="p.id" :value="p.id">{{ p.name }}</option>
                </select>
                <input class="form-control" type="number" v-model.number="alloc.value" placeholder="0"
                  style="text-align:right"
                  @input="onValueInput(i)">
                <input class="form-control" type="number" v-model.number="alloc.pct" placeholder="0" min="0" max="100" step="0.01"
                  style="text-align:right"
                  @input="onPctInput(i)">
                <button class="btn-icon" @click="removeAllocation(i)" title="Remover">🗑️</button>
              </div>

              <div v-if="form.allocations.length === 0" style="color:var(--text-muted);font-size:13px;padding:8px 0">
                Nenhum projeto adicionado. Clique em "+ Adicionar Projeto".
              </div>

              <!-- Resumo de alocação -->
              <div v-if="form.allocations.length > 0"
                style="display:flex;justify-content:flex-end;gap:24px;margin-top:12px;padding-top:12px;border-top:1px solid var(--border)">
                <div style="font-size:13px;color:var(--text-muted)">
                  Valor Total: <strong>{{ fu(form.total_value || 0) }}</strong>
                </div>
                <div style="font-size:13px;font-weight:700" :style="allocationStatus.style">
                  Alocado: {{ fu(formTotalAllocated) }} ({{ formTotalPct.toFixed(1) }}%)
                  <span v-if="allocationStatus.msg" style="font-size:11px;margin-left:6px">{{ allocationStatus.msg }}</span>
                </div>
              </div>
            </div>

            <div>
              <div class="form-label">Observações</div>
              <textarea class="form-control" v-model="form.notes" rows="2" placeholder="Observações..."></textarea>
            </div>

          </div>
          <div class="modal-footer">
            <div></div>
            <div style="display:flex;gap:10px">
              <button class="btn btn-secondary" @click="closeModal">Cancelar</button>
              <button class="btn btn-primary" @click="save">Salvar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      filterMonth: '',
      filterProject: '',
      modalFilterLeader: '',
      showModal: false,
      editingId: null,
      form: this.emptyForm(),
    };
  },

  computed: {
    projects() {
      return Store.state.projects
        .filter(p => p.status !== 'cancelled')
        .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    },

    filteredRateios() {
      let list = [...(Store.state.rateios || [])].sort((a, b) => b.month.localeCompare(a.month));
      if (this.filterMonth) list = list.filter(r => r.month === this.filterMonth);
      if (this.filterProject) list = list.filter(r => r.allocations.some(a => a.project_id === this.filterProject));
      return list;
    },

    leaders() {
      return [...new Set(
        Store.state.projects
          .filter(p => p.status !== 'cancelled' && p.responsible)
          .map(p => p.responsible)
      )].sort((a, b) => a.localeCompare(b, 'pt-BR'));
    },

    projectsForAllocation() {
      if (!this.modalFilterLeader) return this.projects;
      return this.projects.filter(p => p.responsible === this.modalFilterLeader);
    },

    formTotalAllocated() {
      return this.form.allocations.reduce((s, a) => s + (a.value || 0), 0);
    },

    formTotalPct() {
      return this.form.allocations.reduce((s, a) => s + (a.pct || 0), 0);
    },

    allocationStatus() {
      const diff = (this.form.total_value || 0) - this.formTotalAllocated;
      if (Math.abs(diff) < 0.01) return { style: 'color:var(--green)', msg: '✓ Completo' };
      if (diff > 0) return { style: 'color:var(--warning)', msg: `Faltam ${this.fu(diff)}` };
      return { style: 'color:var(--danger)', msg: `Excede em ${this.fu(Math.abs(diff))}` };
    },
  },

  methods: {
    emptyForm() {
      return {
        description: '', rc_number: '', po_number: '', supplier: '',
        total_value: 0, month: new Date().toISOString().slice(0, 7),
        allocations: [], notes: '',
      };
    },

    openNew() { this.editingId = null; this.form = this.emptyForm(); this.showModal = true; },

    openEdit(r) {
      this.editingId = r.id;
      this.form = {
        description: r.description,
        rc_number: r.rc_number,
        po_number: r.po_number,
        supplier: r.supplier,
        total_value: r.total_value,
        month: r.month,
        allocations: r.allocations.map(a => ({ ...a })),
        notes: r.notes,
      };
      this.showModal = true;
    },

    closeModal() { this.showModal = false; this.editingId = null; },

    save() {
      if (!this.form.description.trim()) { alert('Informe uma descrição.'); return; }
      if (!this.form.month) { alert('Informe o mês de competência.'); return; }
      if (!this.form.total_value) { alert('Informe o valor total.'); return; }
      if (this.editingId) Store.updateRateio(this.editingId, { ...this.form });
      else Store.addRateio({ ...this.form });
      this.showModal = false;
    },

    deleteRateio(r) {
      if (!confirm(`Excluir rateio "${r.description}"?`)) return;
      Store.deleteRateio(r.id);
    },

    addAllocation() {
      this.form.allocations.push({ project_id: '', value: 0, pct: 0 });
    },

    removeAllocation(i) {
      this.form.allocations.splice(i, 1);
    },

    onValueInput(i) {
      const alloc = this.form.allocations[i];
      const total = this.form.total_value || 0;
      if (total > 0) alloc.pct = +((alloc.value / total) * 100).toFixed(4);
    },

    onPctInput(i) {
      const alloc = this.form.allocations[i];
      const total = this.form.total_value || 0;
      alloc.value = +((alloc.pct / 100) * total).toFixed(2);
    },

    onTotalChange() {
      // Recalculate values from pct when total changes
      const total = this.form.total_value || 0;
      this.form.allocations.forEach(a => {
        if (a.pct > 0) a.value = +((a.pct / 100) * total).toFixed(2);
      });
    },

    distributeEqual() {
      const n = this.form.allocations.length;
      if (n === 0) return;
      const pct = +(100 / n).toFixed(4);
      const val = +((this.form.total_value || 0) / n).toFixed(2);
      this.form.allocations.forEach(a => { a.pct = pct; a.value = val; });
    },

    totalAllocated(r) {
      return (r.allocations || []).reduce((s, a) => s + (a.value || 0), 0);
    },

    projectShortName(id) {
      const p = Store.getProject(id);
      if (!p) return '?';
      return p.name.split(' ').slice(0, 2).join(' ');
    },

    formatMonthLabel(m) {
      if (!m) return '—';
      return formatMonth(m);
    },

    fu(v) { return '$ ' + new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v || 0); },
  },
};
