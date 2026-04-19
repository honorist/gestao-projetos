window.PurchaseListView = {
  template: `
    <div class="page">
      <div class="page-header">
        <div><h1>Compras</h1><div class="subtitle">{{ filtered.length }} compras</div></div>
        <button class="btn btn-primary" @click="openNew">+ Nova Compra</button>
      </div>

      <div v-if="showForm" class="form-panel">
        <div class="form-panel-title">{{ editing ? 'Editar Compra' : 'Nova Compra' }}</div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Projeto *</label>
            <select class="form-control" v-model="form.project_id">
              <option value="">— Selecione —</option>
              <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Nº da RC</label>
            <input class="form-control" v-model="form.number" placeholder="Ex: RC-2026-001">
          </div>
          <div class="form-group">
            <label class="form-label">Nº do Pedido</label>
            <input class="form-control" v-model="form.po_number" placeholder="Ex: PO-2026-001">
          </div>
        </div>
        <div class="form-row-1">
          <div class="form-group">
            <label class="form-label">Descrição *</label>
            <input class="form-control" v-model="form.description" placeholder="Descrição do item a ser comprado">
          </div>
        </div>
        <div class="form-row-3">
          <div class="form-group">
            <label class="form-label">Status</label>
            <select class="form-control" v-model="form.status">
              <option value="forecast">Previsão (não iniciado)</option>
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
        <div class="form-row">
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
            <input class="form-control" v-model="form.supplier" placeholder="Nome do fornecedor">
          </div>
          <div class="form-group">
            <label class="form-label">Notas</label>
            <input class="form-control" v-model="form.notes">
          </div>
        </div>
        <div class="form-row-1">
          <div class="form-group">
            <label class="form-label">Especificação Técnica (ET)</label>
            <textarea class="form-control" v-model="form.technical_spec" rows="4" placeholder="Cole ou descreva a especificação técnica aqui..."></textarea>
          </div>
        </div>

        <!-- Processo Licitatório -->
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
        <div class="form-section-title" style="color:var(--info);border-bottom-color:rgba(33,150,243,.2)">Datas Planejadas (Cronograma MS)</div>
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
          <button class="btn btn-primary" @click="save">{{ editing ? 'Salvar' : 'Criar Compra' }}</button>
          <button class="btn btn-secondary" @click="showForm = false">Cancelar</button>
          <button v-if="editing" class="btn btn-danger" style="margin-left:auto" @click="deletePurchase">Excluir</button>
        </div>
      </div>

      <!-- Filters -->
      <div class="filter-bar">
        <input class="form-control search-input" v-model="search" placeholder="🔍 Buscar compra...">
        <select class="form-control" v-model="filterProject">
          <option value="">Todos os projetos</option>
          <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.name }}</option>
        </select>
        <select class="form-control" v-model="filterStatus">
          <option value="">Todos os status</option>
          <option value="forecast">Previsão</option>
          <option value="requisition">RC Aberta</option>
          <option value="quoting">Em Cotação</option>
          <option value="approved">Aprovado</option>
          <option value="po_issued">PO Emitida</option>
          <option value="in_transit">Em Trânsito</option>
          <option value="received">Recebido</option>
          <option value="cancelled">Cancelado</option>
        </select>
        <select class="form-control" v-model="filterBuyer">
          <option value="">Todos os compradores</option>
          <option v-for="b in buyers" :key="b.id" :value="b.id">{{ b.name }}</option>
        </select>
        <label style="display:flex;align-items:center;gap:6px;font-size:13px;color:var(--text-mid)">
          <input type="checkbox" v-model="showOverdueOnly"> Somente atrasadas
        </label>
      </div>

      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Nº</th><th>Descrição</th><th>Projeto</th><th>Comprador</th>
              <th>Status</th><th class="text-right">Valor</th>
              <th>Previsão Chegada</th><th>Categoria</th><th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filtered.length === 0">
              <td colspan="9" class="empty-row">Nenhuma compra encontrada</td>
            </tr>
            <tr v-for="p in filtered" :key="p.id"
              class="clickable"
              :class="isOverdue(p.expected_arrival_date) && !['received','cancelled'].includes(p.status) ? 'row-overdue' : ''"
              @click="$router.push('/purchases/' + p.id)">
              <td class="text-sm text-muted">{{ p.number || '—' }}</td>
              <td style="font-weight:600;max-width:220px">{{ p.description || '—' }}</td>
              <td class="text-sm">{{ projectName(p.project_id) }}</td>
              <td class="text-sm">{{ buyerName(p.buyer_id) }}</td>
              <td><span :class="'badge badge-' + statusColor(p.status)">{{ statusLabel(p.status) }}</span></td>
              <td class="text-right text-sm">{{ fc(purchaseValue(p)) }}</td>
              <td class="text-sm" :class="isOverdue(p.expected_arrival_date) && !['received','cancelled'].includes(p.status) ? 'text-red text-bold' : ''">
                {{ formatDate(p.expected_arrival_date) }}
                <span v-if="isOverdue(p.expected_arrival_date) && !['received','cancelled'].includes(p.status)"> ⚠️</span>
              </td>
              <td class="text-sm">{{ categoryName(p.budget_category_id) }}</td>
              <td @click.stop>
                <button class="btn-icon" @click="$router.push('/purchases/' + p.id)">→</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  data() {
    return {
      showForm: false, editing: null, search: '', filterProject: '',
      filterStatus: '', filterBuyer: '', showOverdueOnly: false,
      form: this.emptyForm()
    };
  },
  computed: {
    projects() { return Store.state.projects; },
    buyers() { return Store.state.buyers; },
    categories() { return Store.state.budgetCategories; },
    filtered() {
      const today = new Date().toISOString().split('T')[0];
      return Store.state.purchases.filter(p => {
        const q = this.search.toLowerCase();
        const ms = !q || (p.description || '').toLowerCase().includes(q) || (p.number || '').toLowerCase().includes(q) || (p.supplier || '').toLowerCase().includes(q);
        const mp = !this.filterProject || p.project_id === this.filterProject;
        const mst = !this.filterStatus || p.status === this.filterStatus;
        const mb = !this.filterBuyer || p.buyer_id === this.filterBuyer;
        const mo = !this.showOverdueOnly || (p.expected_arrival_date && p.expected_arrival_date < today && !['received','cancelled'].includes(p.status));
        return ms && mp && mst && mb && mo;
      });
    }
  },
  methods: {
    emptyForm() {
      return {
        project_id: '', number: '', po_number: '', description: '', technical_spec: '',
        buyer_id: '', supplier: '', budget_category_id: '', status: 'forecast',
        estimated_value: 0, quote_value: 0, approved_value: 0, actual_value: 0,
        request_date: '', po_date: '', expected_arrival_date: '', actual_arrival_date: '',
        notes: '',
        proc_category: 'normal',
        ms_rc: '', ms_et: '', ms_invitation: '', ms_proposals: '', ms_analysis: '', ms_po: '',
        real_rc: '', real_invitation: '', real_proposals: '', real_analysis: '', real_po: '',
      };
    },
    openNew() {
      this.editing = null;
      this.form = this.emptyForm();
      if (this.$route?.query?.project) this.form.project_id = this.$route.query.project;
      this.showForm = true;
    },
    editPurchase(p) { this.editing = p.id; this.form = { ...p }; this.showForm = true; },
    save() {
      if (!this.form.description.trim()) { alert('Descrição obrigatória'); return; }
      if (this.editing) Store.updatePurchase(this.editing, this.form);
      else Store.addPurchase(this.form);
      this.showForm = false;
    },
    deletePurchase() {
      if (!confirm('Excluir esta compra?')) return;
      Store.deletePurchase(this.editing);
      this.showForm = false;
    },
    purchaseValue(p) { return p.actual_value || p.approved_value || p.quote_value || p.estimated_value || 0; },
    projectName(id) { return Store.getProject(id)?.name || '—'; },
    buyerName(id) { return Store.state.buyers.find(b => b.id === id)?.name || '—'; },
    categoryName(id) { return Store.state.budgetCategories.find(c => c.id === id)?.name || '—'; },
    fc(v) { return formatCurrency(v); },
    statusLabel, statusColor, formatDate, isOverdue
  },
  created() {
    if (this.$route?.query?.new === '1' || this.$route?.query?.project) this.openNew();
  }
};
