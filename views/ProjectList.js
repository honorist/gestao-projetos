window.ProjectListView = {
  template: `
    <div class="page">
      <div class="page-header">
        <div><h1>Projetos</h1></div>
        <button class="btn btn-primary" @click="openForm()">+ Novo Projeto</button>
      </div>

      <div v-if="showForm" class="form-panel">
        <div class="form-panel-title">{{ editing ? 'Editar Projeto' : 'Novo Projeto' }}</div>

        <!-- SEÇÃO 1 -->
        <div class="form-section-title">Informação Geral do Projeto</div>
        <div class="form-row-3">
          <div class="form-group">
            <label class="form-label">Nome do Projeto *</label>
            <input class="form-control" v-model="form.name" placeholder="Ex: Pulp Expert Analyzer">
          </div>
          <div class="form-group">
            <label class="form-label">Número / Código</label>
            <input class="form-control" v-model="form.number" placeholder="Ex: FAST-40">
          </div>
          <div class="form-group">
            <label class="form-label">PEP</label>
            <input class="form-control" :value="form.pep" @input="onPepInput" placeholder="504-E.24.2.00044.452">
          </div>
        </div>
        <div class="form-row-3">
          <div class="form-group">
            <label class="form-label">Unidade</label>
            <select class="form-control" v-model="form.unit">
              <option value="">— Selecione —</option>
              <option value="G1">G1</option>
              <option value="G2">G2</option>
              <option value="Defapa">Defapa</option>
              <option value="Outros">Outros</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Local</label>
            <input class="form-control" v-model="form.location" placeholder="Informe o local">
          </div>
          <div class="form-group">
            <label class="form-label">Orçamento ($)</label>
            <input class="form-control" type="number" v-model="form.budget" placeholder="0">
          </div>
        </div>
        <div class="form-row-3">
          <div class="form-group">
            <label class="form-label">Status</label>
            <select class="form-control" v-model="form.status">
              <option value="planning">Planejamento</option>
              <option value="active">Ativo</option>
              <option value="on_hold">Pausado</option>
              <option value="completed">Concluído</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Fase</label>
            <select class="form-control" v-model="form.fel_phase">
              <option value="FEL1">FEL 1</option>
              <option value="FEL2">FEL 2</option>
              <option value="FEL3">FEL 3</option>
              <option value="execution">Execução</option>
              <option value="closeout">Encerramento</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Início</label>
            <input class="form-control" type="date" v-model="form.start_date">
          </div>
        </div>
        <div class="form-row" style="max-width:400px">
          <div class="form-group">
            <label class="form-label">Fim Previsto</label>
            <input class="form-control" type="date" v-model="form.planned_end_date">
          </div>
        </div>

        <!-- SEÇÃO 2 -->
        <div class="form-section-title">Stakeholders</div>
        <div class="form-row-3">
          <div class="form-group">
            <label class="form-label">Responsável (Consultor)</label>
            <select class="form-control" v-model="form.responsible">
              <option value="">— Selecione —</option>
              <option v-for="c in consultants" :key="c.id" :value="c.name">{{ c.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Coordenador de Engenharia</label>
            <select class="form-control" v-model="form.coordinator">
              <option value="">— Selecione —</option>
              <option v-for="c in coordinators" :key="c.id" :value="c.name">{{ c.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Gerente Solicitante</label>
            <select class="form-control" v-model="form.manager_requestor">
              <option value="">— Selecione —</option>
              <option v-for="m in managers" :key="m.id" :value="m.name">{{ m.name }}{{ m.gerencia ? ' — ' + m.gerencia : '' }}</option>
            </select>
          </div>
        </div>
        <div class="form-row-3">
          <div class="form-group">
            <label class="form-label">Manutenção</label>
            <input class="form-control" v-model="form.maintenance" placeholder="Responsável manutenção">
          </div>
          <div class="form-group">
            <label class="form-label">Operação</label>
            <input class="form-control" v-model="form.operations" placeholder="Responsável operação">
          </div>
          <div class="form-group">
            <label class="form-label">Segurança</label>
            <input class="form-control" v-model="form.safety" placeholder="Responsável segurança">
          </div>
        </div>
        <div class="form-row-3">
          <div class="form-group">
            <label class="form-label">Meio Ambiente</label>
            <input class="form-control" v-model="form.environment" placeholder="Responsável meio ambiente">
          </div>
        </div>

        <!-- SEÇÃO OBRAS -->
        <div class="form-section-title">Equipe de Implantação (Obras)</div>
        <div class="form-row-3">
          <div class="form-group">
            <label class="form-label">EIA</label>
            <select class="form-control" v-model="form.impl_eia">
              <option value="">— Selecione —</option>
              <option v-for="p in implBySpec('impl_eia')" :key="p.id" :value="p.name">{{ p.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Mecânica</label>
            <select class="form-control" v-model="form.impl_mecanica">
              <option value="">— Selecione —</option>
              <option v-for="p in implBySpec('impl_mecanica')" :key="p.id" :value="p.name">{{ p.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Civil</label>
            <select class="form-control" v-model="form.impl_civil">
              <option value="">— Selecione —</option>
              <option v-for="p in implBySpec('impl_civil')" :key="p.id" :value="p.name">{{ p.name }}</option>
            </select>
          </div>
        </div>
        <div class="form-row-3">
          <div class="form-group">
            <label class="form-label">Tec. Segurança</label>
            <select class="form-control" v-model="form.impl_seguranca">
              <option value="">— Selecione —</option>
              <option v-for="p in implBySpec('impl_seguranca')" :key="p.id" :value="p.name">{{ p.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Tec. Meio Ambiente</label>
            <select class="form-control" v-model="form.impl_meio_ambiente">
              <option value="">— Selecione —</option>
              <option v-for="p in implBySpec('impl_meio_ambiente')" :key="p.id" :value="p.name">{{ p.name }}</option>
            </select>
          </div>
        </div>

        <!-- SEÇÃO 3 -->
        <div class="form-section-title">Informações do Projeto</div>
        <div class="form-row-1">
          <div class="form-group">
            <label class="form-label">Objetivo</label>
            <textarea class="form-control" v-model="form.objective" rows="2" placeholder="Qual o objetivo do projeto?"></textarea>
          </div>
        </div>
        <div class="form-row-1">
          <div class="form-group">
            <label class="form-label">Escopo</label>
            <textarea class="form-control" v-model="form.scope" rows="2" placeholder="O que está incluído no escopo?"></textarea>
          </div>
        </div>
        <div class="form-row-1">
          <div class="form-group">
            <label class="form-label">Benefício</label>
            <textarea class="form-control" v-model="form.benefit" rows="2" placeholder="Quais os benefícios esperados?"></textarea>
          </div>
        </div>
        <div class="form-actions">
          <button class="btn btn-primary" @click="save">{{ editing ? 'Salvar' : 'Criar Projeto' }}</button>
          <button class="btn btn-secondary" @click="showForm = false">Cancelar</button>
          <button v-if="editing" class="btn btn-danger" style="margin-left:auto" @click="deleteProject">Excluir</button>
        </div>
      </div>

      <div class="filter-bar">
        <input class="form-control search-input" v-model="search" placeholder="🔍 Buscar projeto...">
        <select class="form-control" v-model="filterStatus">
          <option value="">Todos os status</option>
          <option value="planning">Planejamento</option>
          <option value="active">Ativo</option>
          <option value="on_hold">Pausado</option>
          <option value="completed">Concluído</option>
          <option value="cancelled">Cancelado</option>
        </select>
        <select class="form-control" v-model="filterPhase">
          <option value="">Todas as fases</option>
          <option value="FEL1">FEL 1</option>
          <option value="FEL2">FEL 2</option>
          <option value="FEL3">FEL 3</option>
          <option value="execution">Execução</option>
          <option value="closeout">Encerramento</option>
        </select>
        <select class="form-control" v-model="filterLeader">
          <option value="">— Líder —</option>
          <option v-for="l in leaders" :key="l" :value="l">{{ l }}</option>
        </select>
        <select class="form-control" v-model="filterCoordinator">
          <option value="">— Coordenador —</option>
          <option v-for="c in coordinators" :key="c.id" :value="c.name">{{ c.name }}</option>
        </select>
        <span class="text-muted text-sm">{{ filtered.length }} projetos</span>
      </div>

      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Nº</th>
              <th>Status</th>
              <th>Fase</th>
              <th>Responsável</th>
              <th>Período</th>
              <th class="text-right">Orçamento</th>
              <th class="text-right">Saldo</th>
              <th>% Uso</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filtered.length === 0">
              <td colspan="10" class="empty-row">Nenhum projeto encontrado</td>
            </tr>
            <tr v-for="p in filtered" :key="p.id" class="clickable" @click="goToProject(p.id)">
              <td style="font-weight:600">{{ p.name }}</td>
              <td class="text-muted text-sm">{{ p.number || '—' }}</td>
              <td><span :class="'badge badge-' + statusColor(p.status)">{{ statusLabel(p.status) }}</span></td>
              <td><span class="badge badge-gray">{{ statusLabel(p.fel_phase) }}</span></td>
              <td>{{ p.responsible || '—' }}</td>
              <td class="text-sm">
                <span v-if="p.start_date">{{ formatDate(p.start_date) }}</span>
                <span v-if="p.start_date && p.planned_end_date"> → </span>
                <span v-if="p.planned_end_date">{{ formatDate(p.planned_end_date) }}</span>
                <span v-if="!p.start_date && !p.planned_end_date" class="text-muted">—</span>
              </td>
              <td class="text-right">{{ fc(fin(p.id).budget) }}</td>
              <td class="text-right" :style="fin(p.id).balance < 0 ? 'color:var(--danger);font-weight:700' : 'color:var(--green)'">
                {{ fc(fin(p.id).balance) }}
              </td>
              <td>
                <div style="display:flex;align-items:center;gap:6px">
                  <div class="progress-bar">
                    <div class="progress-fill"
                      :class="fin(p.id).pct_used > 100 ? 'fill-red' : fin(p.id).pct_used > 85 ? 'fill-yellow' : ''"
                      :style="'width:' + Math.min(fin(p.id).pct_used, 100) + '%'">
                    </div>
                  </div>
                  <span class="text-sm">{{ fin(p.id).pct_used.toFixed(0) }}%</span>
                </div>
              </td>
              <td @click.stop>
                <button class="btn-icon" @click="editProject(p)">✏️</button>
                <button class="btn-icon" @click="deleteProjectRow(p)">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  data() {
    return {
      showForm: false, editing: null, search: '', filterStatus: '', filterPhase: '',
      filterLeader: '', filterCoordinator: '',
      form: this.emptyForm()
    };
  },
  computed: {
    consultants() { return [...Store.state.consultants].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')); },
    managers() { return [...Store.state.managers].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')); },
    implantadores() { return [...(Store.state.implantadores || [])].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')); },
    implBySpec() {
      const all = this.implantadores;
      return key => all.filter(p => p.specialty === key);
    },
    leaders() {
      return [...new Set(
        Store.state.projects.filter(p => p.responsible).map(p => p.responsible)
      )].sort((a, b) => a.localeCompare(b, 'pt-BR'));
    },
    coordinators() {
      return [...Store.state.coordinators].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    },
    filtered() {
      return Store.state.projects.filter(p => {
        const q = this.search.toLowerCase();
        const matchSearch = !q || p.name.toLowerCase().includes(q) || (p.number || '').toLowerCase().includes(q);
        const matchStatus = !this.filterStatus || p.status === this.filterStatus;
        const matchPhase = !this.filterPhase || p.fel_phase === this.filterPhase;
        const matchLeader = !this.filterLeader || p.responsible === this.filterLeader;
        const matchCoordinator = !this.filterCoordinator || p.coordinator === this.filterCoordinator;
        return matchSearch && matchStatus && matchPhase && matchLeader && matchCoordinator;
      });
    }
  },
  methods: {
    applyPepMask(val) {
      const raw = val.replace(/[^a-zA-Z0-9]/g, '').slice(0, 15).toUpperCase();
      let out = '';
      for (let i = 0; i < raw.length; i++) {
        if (i === 3) out += '-';
        if (i === 4) out += '.';
        if (i === 6) out += '.';
        if (i === 7) out += '.';
        if (i === 12) out += '.';
        out += raw[i];
      }
      return out;
    },
    onPepInput(e) {
      this.form.pep = this.applyPepMask(e.target.value);
      this.$nextTick(() => { e.target.value = this.form.pep; });
    },
    emptyForm() {
      return { name: '', number: '', pep: '', unit: '', location: '', status: 'planning', fel_phase: 'FEL1', responsible: '', coordinator: '', manager_requestor: '', maintenance: '', operations: '', safety: '', environment: '', start_date: '', planned_end_date: '', budget: 0, objective: '', scope: '', benefit: '', notes: '', impl_eia: '', impl_mecanica: '', impl_civil: '', impl_seguranca: '', impl_meio_ambiente: '' };
    },
    openForm() { this.editing = null; this.form = this.emptyForm(); this.showForm = true; },
    editProject(p) { this.editing = p.id; this.form = { ...p }; this.showForm = true; },
    save() {
      if (!this.form.name.trim()) { alert('Nome obrigatório'); return; }
      if (this.editing) Store.updateProject(this.editing, this.form);
      else Store.addProject(this.form);
      this.showForm = false;
    },
    deleteProject() {
      if (!confirm('Excluir projeto e todas suas compras e tarefas?')) return;
      Store.deleteProject(this.editing);
      this.showForm = false;
    },
    deleteProjectRow(p) {
      if (!confirm(`Excluir projeto "${p.name}"?\nTodas as compras e tarefas vinculadas também serão removidas.`)) return;
      Store.deleteProject(p.id);
    },
    goToProject(id) { this.$router.push('/projects/' + id); },
    fin(id) { return Store.getProjectFinancials(id); },
    fc(v) { return formatCurrency(v); },
    statusLabel, statusColor, formatDate
  },
  created() {
    if (this.$route?.query?.new === '1') this.openForm();
  }
};
