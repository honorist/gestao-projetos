window.DashboardView = {
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Dashboard</h1>
          <div class="subtitle">{{ today }}</div>
        </div>
        <div style="display:flex;gap:10px">
          <button class="btn btn-primary" @click="$router.push({ path: '/projects', query: { new: '1' } })">+ Novo Projeto</button>
          <button class="btn btn-secondary" @click="$router.push({ path: '/purchases', query: { new: '1' } })">+ Nova Compra</button>
        </div>
      </div>

      <div v-if="alerts.length" class="alerts-wrap">
        <div v-for="a in alerts" :key="a.message" :class="'alert alert-' + a.type">
          <span>{{ a.type === 'danger' ? '🚨' : '⚠️' }}</span>
          <span>{{ a.message }}</span>
        </div>
      </div>

      <div class="stat-cards">
        <div class="stat-card s-green">
          <div class="stat-icon">📁</div>
          <div>
            <div class="stat-label">Projetos Ativos</div>
            <div class="stat-value">{{ activeProjects }}</div>
          </div>
        </div>
        <div class="stat-card s-blue">
          <div class="stat-icon">🛒</div>
          <div>
            <div class="stat-label">Compras em Andamento</div>
            <div class="stat-value">{{ activePurchases }}</div>
          </div>
        </div>
        <div class="stat-card s-red">
          <div class="stat-icon">🚨</div>
          <div>
            <div class="stat-label">Compras Atrasadas</div>
            <div class="stat-value">{{ overduePurchases }}</div>
          </div>
        </div>
        <div class="stat-card s-orange">
          <div class="stat-icon">✅</div>
          <div>
            <div class="stat-label">Tarefas Pendentes</div>
            <div class="stat-value">{{ pendingTasks }}</div>
          </div>
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
                  <div style="font-size:11px;color:var(--text-muted)">{{ p.pep || '' }}{{ p.responsible ? ' · ' + p.responsible.split(' ')[0] : '' }}</div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Visão Financeira dos Projetos</div>
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Projeto</th>
                <th>Status</th>
                <th>Fase</th>
                <th class="text-right">Orçamento</th>
                <th class="text-right">Compromissado</th>
                <th class="text-right">Previsão</th>
                <th class="text-right">Realizado</th>
                <th class="text-right">Saldo</th>
                <th>% Uso</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredProjects.length === 0">
                <td colspan="9" class="empty-row">Nenhum projeto selecionado</td>
              </tr>
              <tr v-for="p in filteredProjects" :key="p.id" class="clickable" @click="$router.push('/projects/' + p.id)">
                <td style="font-weight:600">{{ p.name }}</td>
                <td><span :class="'badge badge-' + statusColor(p.status)">{{ statusLabel(p.status) }}</span></td>
                <td><span class="badge badge-gray">{{ statusLabel(p.fel_phase) }}</span></td>
                <td class="text-right">{{ fc(fin(p.id).budget) }}</td>
                <td class="text-right" style="color:var(--info)">{{ fc(fin(p.id).committed) }}</td>
                <td class="text-right" style="color:var(--warning)">{{ fc(fin(p.id).forecast) }}</td>
                <td class="text-right" style="color:var(--green)">{{ fc(fin(p.id).actual) }}</td>
                <td class="text-right" :style="fin(p.id).balance < 0 ? 'color:var(--danger);font-weight:700' : 'color:var(--green)'">
                  {{ fc(fin(p.id).balance) }}
                </td>
                <td>
                  <div style="display:flex;align-items:center;gap:8px">
                    <div class="progress-bar">
                      <div class="progress-fill"
                        :class="fin(p.id).pct_used > 100 ? 'fill-red' : fin(p.id).pct_used > 85 ? 'fill-yellow' : ''"
                        :style="'width:' + Math.min(fin(p.id).pct_used, 100) + '%'">
                      </div>
                    </div>
                    <span class="text-sm">{{ fin(p.id).pct_used.toFixed(0) }}%</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="grid-2">
        <div class="section">
          <div class="section-title">Compras com Entrega Próxima (90 dias)</div>
          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr><th>Descrição</th><th>Projeto</th><th>Previsão</th><th>Status</th></tr>
              </thead>
              <tbody>
                <tr v-if="upcomingPurchases.length === 0">
                  <td colspan="4" class="empty-row">Nenhuma compra nos próximos 90 dias</td>
                </tr>
                <tr v-for="p in upcomingPurchases" :key="p.id" class="clickable"
                  :class="isOverdue(p.expected_arrival_date) ? 'row-overdue' : ''"
                  @click="$router.push('/purchases/' + p.id)">
                  <td>{{ p.description || p.number || '—' }}</td>
                  <td class="text-muted text-sm">{{ projectName(p.project_id) }}</td>
                  <td :class="isOverdue(p.expected_arrival_date) ? 'text-red text-bold' : ''">
                    {{ formatDate(p.expected_arrival_date) }}
                  </td>
                  <td><span :class="'badge badge-' + statusColor(p.status)">{{ statusLabel(p.status) }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Tarefas em Andamento</div>
          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr><th>Tarefa</th><th>Projeto</th><th>Prioridade</th><th>Vencimento</th></tr>
              </thead>
              <tbody>
                <tr v-if="activeTasks.length === 0">
                  <td colspan="4" class="empty-row">Nenhuma tarefa em andamento</td>
                </tr>
                <tr v-for="t in activeTasks" :key="t.id" class="clickable" @click="$router.push('/tasks')">
                  <td style="font-weight:600">{{ t.title }}</td>
                  <td class="text-muted text-sm">{{ projectName(t.project_id) }}</td>
                  <td><span :class="'badge badge-' + statusColor(t.priority)">{{ statusLabel(t.priority) }}</span></td>
                  <td :class="t.due_date && isOverdue(t.due_date) ? 'text-red text-bold' : ''">{{ formatDate(t.due_date) }}</td>
                </tr>
              </tbody>
            </table>
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
    };
  },

  computed: {
    today() { return new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }); },
    alerts() { return Store.getAlerts(); },
    activeProjects() { return Store.state.projects.filter(p => p.status === 'active').length; },
    activePurchases() { return Store.state.purchases.filter(p => ['requisition','quoting','approved','po_issued','in_transit'].includes(p.status)).length; },
    overduePurchases() {
      const today = new Date().toISOString().split('T')[0];
      return Store.state.purchases.filter(p => p.expected_arrival_date && p.expected_arrival_date < today && !['received','cancelled'].includes(p.status)).length;
    },
    pendingTasks() { return Store.state.tasks.filter(t => !['done'].includes(t.status)).length; },

    allProjects() { return Store.state.projects.filter(p => p.status !== 'cancelled'); },
    coordinators() { return [...Store.state.coordinators].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')); },
    consultantsForCoordinator() {
      if (!this.filterCoordinator) return null;
      return Store.state.consultants.filter(c => c.coordinator_id === this.filterCoordinator).map(c => c.name);
    },
    leaders() {
      const base = this.consultantsForCoordinator
        ? this.allProjects.filter(p => this.consultantsForCoordinator.includes(p.responsible))
        : this.allProjects;
      return [...new Set(base.map(p => p.responsible).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
    },
    availableProjects() {
      let list = this.allProjects;
      if (this.consultantsForCoordinator) list = list.filter(p => this.consultantsForCoordinator.includes(p.responsible));
      if (this.filterLeader) list = list.filter(p => p.responsible === this.filterLeader);
      return list;
    },
    filteredProjects() {
      return this.allProjects.filter(p => this.selectedIds.includes(p.id));
    },

    upcomingPurchases() {
      const today = new Date().toISOString().split('T')[0];
      const limit = new Date(); limit.setDate(limit.getDate() + 90);
      const limitStr = limit.toISOString().split('T')[0];
      return Store.state.purchases
        .filter(p => p.expected_arrival_date && p.expected_arrival_date <= limitStr && !['received','cancelled'].includes(p.status))
        .sort((a, b) => a.expected_arrival_date.localeCompare(b.expected_arrival_date))
        .slice(0, 8);
    },
    activeTasks() { return Store.state.tasks.filter(t => t.status === 'in_progress').slice(0, 8); },
  },

  watch: {
    availableProjects(newVal) {
      const ids = newVal.map(p => p.id);
      this.selectedIds = this.selectedIds.filter(id => ids.includes(id));
    },
  },

  methods: {
    fin(id) { return Store.getProjectFinancials(id); },
    fc(v) { return formatCurrency(v); },
    statusLabel, statusColor, formatDate, isOverdue,
    projectName(id) { return Store.getProject(id)?.name || '—'; },

    toggleProject(id) {
      const idx = this.selectedIds.indexOf(id);
      if (idx >= 0) this.selectedIds.splice(idx, 1);
      else this.selectedIds.push(id);
    },
    selectAll() { this.selectedIds = this.availableProjects.map(p => p.id); },
    selectNone() { this.selectedIds = []; },
    onCoordinatorChange() { this.filterLeader = ''; this.selectedIds = this.availableProjects.map(p => p.id); },
    onLeaderChange() { this.selectedIds = this.availableProjects.map(p => p.id); },
  },

  mounted() {
    this.selectedIds = this.allProjects.map(p => p.id);
  },
};
