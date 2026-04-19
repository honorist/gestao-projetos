window.SettingsView = {
  template: `
    <div class="page">
      <div class="page-header"><h1>Configurações</h1></div>

      <!-- Abas -->
      <div class="tabs" style="margin-bottom:24px">
        <button class="tab-btn" :class="{ active: tab === 'pessoas' }" @click="tab = 'pessoas'">👥 Pessoas</button>
        <button class="tab-btn" :class="{ active: tab === 'sistema' }" @click="tab = 'sistema'">⚙️ Sistema</button>
      </div>

      <!-- ── ABA PESSOAS ──────────────────────────────────────────────────────── -->
      <template v-if="tab === 'pessoas'">

        <!-- Coordenadores -->
        <div class="section">
          <div class="section-title">Coordenadores</div>
          <div class="card" style="padding:0;overflow:hidden">
            <div style="padding:20px;border-bottom:1px solid var(--border)">
              <div class="form-panel-title" style="font-size:14px;margin-bottom:14px">{{ editingCoordinator ? 'Editar Coordenador' : 'Coordenadores' }}</div>
              <div class="form-row-1">
                <div class="form-group">
                  <label class="form-label">Coordenador *</label>
                  <input class="form-control" v-model="coordinatorForm.name" placeholder="Nome completo">
                </div>
              </div>
              <div class="form-actions" style="margin-top:12px">
                <button class="btn btn-primary btn-sm" @click="saveCoordinator">{{ editingCoordinator ? 'Salvar' : 'Adicionar' }}</button>
                <button v-if="editingCoordinator" class="btn btn-secondary btn-sm" @click="cancelCoordinator">Cancelar</button>
              </div>
            </div>
            <table class="table">
              <thead><tr><th>Nome</th><th></th></tr></thead>
              <tbody>
                <tr v-if="coordinators.length === 0"><td colspan="2" class="empty-row">Nenhum coordenador cadastrado</td></tr>
                <tr v-for="c in coordinators" :key="c.id">
                  <td style="font-weight:600">{{ c.name }}</td>
                  <td>
                    <button class="btn-icon" @click="editCoordinator(c)">✏️</button>
                    <button class="btn-icon" @click="deleteCoordinator(c.id)">🗑️</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Consultores -->
        <div class="section">
          <div class="section-title">Consultores (Responsáveis pelos Projetos)</div>
          <div class="card" style="padding:0;overflow:hidden">
            <div style="padding:20px;border-bottom:1px solid var(--border)">
              <div class="form-panel-title" style="font-size:14px;margin-bottom:14px">{{ editingConsultant ? 'Editar Consultor' : 'Consultores' }}</div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Consultor *</label>
                  <input class="form-control" v-model="consultantForm.name" placeholder="Nome completo">
                </div>
                <div class="form-group">
                  <label class="form-label">Coordenador</label>
                  <select class="form-control" v-model="consultantForm.coordinator_id">
                    <option value="">— Selecione —</option>
                    <option v-for="c in coordinators" :key="c.id" :value="c.id">{{ c.name }}</option>
                  </select>
                </div>
              </div>
              <div class="form-actions" style="margin-top:12px">
                <button class="btn btn-primary btn-sm" @click="saveConsultant">{{ editingConsultant ? 'Salvar' : 'Adicionar' }}</button>
                <button v-if="editingConsultant" class="btn btn-secondary btn-sm" @click="cancelConsultant">Cancelar</button>
              </div>
            </div>
            <table class="table">
              <thead><tr><th>Nome</th><th>Coordenador</th><th></th></tr></thead>
              <tbody>
                <tr v-if="consultants.length === 0"><td colspan="3" class="empty-row">Nenhum consultor cadastrado</td></tr>
                <tr v-for="c in consultants" :key="c.id">
                  <td style="font-weight:600">{{ c.name }}</td>
                  <td class="text-sm text-muted">{{ coordinatorName(c.coordinator_id) }}</td>
                  <td>
                    <button class="btn-icon" @click="editConsultant(c)">✏️</button>
                    <button class="btn-icon" @click="deleteConsultant(c.id)">🗑️</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Gerentes -->
        <div class="section">
          <div class="section-title">Gerentes Solicitantes</div>
          <div class="card" style="padding:0;overflow:hidden">
            <div style="padding:20px;border-bottom:1px solid var(--border)">
              <div class="form-panel-title" style="font-size:14px;margin-bottom:14px">{{ editingManager ? 'Editar Gerente' : 'Gerentes' }}</div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Nome *</label>
                  <input class="form-control" v-model="managerForm.name" placeholder="Nome do gerente">
                </div>
                <div class="form-group">
                  <label class="form-label">Gerência</label>
                  <input class="form-control" v-model="managerForm.gerencia" placeholder="Ex: Gerência de Manutenção">
                </div>
              </div>
              <div class="form-actions" style="margin-top:12px">
                <button class="btn btn-primary btn-sm" @click="saveManager">{{ editingManager ? 'Salvar' : 'Adicionar' }}</button>
                <button v-if="editingManager" class="btn btn-secondary btn-sm" @click="cancelManager">Cancelar</button>
              </div>
            </div>
            <table class="table">
              <thead><tr><th>Nome</th><th>Gerência</th><th></th></tr></thead>
              <tbody>
                <tr v-if="managers.length === 0"><td colspan="3" class="empty-row">Nenhum gerente cadastrado</td></tr>
                <tr v-for="m in managers" :key="m.id">
                  <td style="font-weight:600">{{ m.name }}</td>
                  <td>{{ m.gerencia || '—' }}</td>
                  <td>
                    <button class="btn-icon" @click="editManager(m)">✏️</button>
                    <button class="btn-icon" @click="deleteManager(m.id)">🗑️</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Coordenadores de Suprimentos -->
        <div class="section">
          <div class="section-title">Coordenadores de Suprimentos</div>
          <div class="card" style="padding:0;overflow:hidden">
            <div style="padding:20px;border-bottom:1px solid var(--border)">
              <div class="form-row-1">
                <div class="form-group">
                  <label class="form-label">Nome *</label>
                  <input class="form-control" v-model="supplyCoordForm.name" placeholder="Nome do coordenador">
                </div>
              </div>
              <div class="form-actions" style="margin-top:12px">
                <button class="btn btn-primary btn-sm" @click="saveSupplyCoord">{{ editingSupplyCoord ? 'Salvar' : 'Adicionar' }}</button>
                <button v-if="editingSupplyCoord" class="btn btn-secondary btn-sm" @click="cancelSupplyCoord">Cancelar</button>
              </div>
            </div>
            <table class="table">
              <thead><tr><th>Nome</th><th></th></tr></thead>
              <tbody>
                <tr v-if="supplyCoordinators.length === 0"><td colspan="2" class="empty-row">Nenhum coordenador cadastrado</td></tr>
                <tr v-for="c in supplyCoordinators" :key="c.id">
                  <td style="font-weight:600">{{ c.name }}</td>
                  <td>
                    <button class="btn-icon" @click="editSupplyCoord(c)">✏️</button>
                    <button class="btn-icon" @click="deleteSupplyCoord(c.id)">🗑️</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Implantadores -->
        <div class="section">
          <div class="section-title">Implantadores (Obras)</div>
          <div class="card" style="padding:0;overflow:hidden">
            <div style="padding:20px;border-bottom:1px solid var(--border)">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Nome *</label>
                  <input class="form-control" v-model="implantadorForm.name" placeholder="Nome completo">
                </div>
                <div class="form-group">
                  <label class="form-label">Área *</label>
                  <select class="form-control" v-model="implantadorForm.specialty">
                    <option value="">— Selecione —</option>
                    <option value="impl_eia">EIA</option>
                    <option value="impl_mecanica">Mecânica</option>
                    <option value="impl_civil">Civil</option>
                    <option value="impl_seguranca">Tec. Segurança</option>
                    <option value="impl_meio_ambiente">Tec. Meio Ambiente</option>
                  </select>
                </div>
              </div>
              <div class="form-actions" style="margin-top:12px">
                <button class="btn btn-primary btn-sm" @click="saveImplantador">{{ editingImplantador ? 'Salvar' : 'Adicionar' }}</button>
                <button v-if="editingImplantador" class="btn btn-secondary btn-sm" @click="cancelImplantador">Cancelar</button>
              </div>
            </div>
            <table class="table">
              <thead><tr><th>Nome</th><th>Área</th><th></th></tr></thead>
              <tbody>
                <tr v-if="implantadores.length === 0"><td colspan="3" class="empty-row">Nenhum implantador cadastrado</td></tr>
                <tr v-for="p in implantadores" :key="p.id">
                  <td style="font-weight:600">{{ p.name }}</td>
                  <td><span class="badge badge-gray">{{ specialtyLabel(p.specialty) }}</span></td>
                  <td>
                    <button class="btn-icon" @click="editImplantador(p)">✏️</button>
                    <button class="btn-icon" @click="deleteImplantador(p.id)">🗑️</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Compradores -->
        <div class="section">
          <div class="section-title">Compradores (Suprimentos)</div>
          <div class="card" style="padding:0;overflow:hidden">
            <div style="padding:20px;border-bottom:1px solid var(--border)">
              <div class="form-panel-title" style="font-size:14px;margin-bottom:14px">{{ editingBuyer ? 'Editar Comprador' : 'Compradores' }}</div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Nome *</label>
                  <input class="form-control" v-model="buyerForm.name">
                </div>
                <div class="form-group">
                  <label class="form-label">Coordenador de Suprimentos</label>
                  <select class="form-control" v-model="buyerForm.coordinator_id">
                    <option value="">— Selecione —</option>
                    <option v-for="c in supplyCoordinators" :key="c.id" :value="c.id">{{ c.name }}</option>
                  </select>
                </div>
              </div>
              <div class="form-actions" style="margin-top:12px">
                <button class="btn btn-primary btn-sm" @click="saveBuyer">{{ editingBuyer ? 'Salvar' : 'Adicionar' }}</button>
                <button v-if="editingBuyer" class="btn btn-secondary btn-sm" @click="cancelBuyer">Cancelar</button>
              </div>
            </div>
            <table class="table">
              <thead><tr><th>Nome</th><th>Coordenador</th><th></th></tr></thead>
              <tbody>
                <tr v-if="buyers.length === 0"><td colspan="3" class="empty-row">Nenhum comprador cadastrado</td></tr>
                <tr v-for="b in buyers" :key="b.id">
                  <td style="font-weight:600">{{ b.name }}</td>
                  <td>{{ coordinatorName(b.coordinator_id) }}</td>
                  <td>
                    <button class="btn-icon" @click="editBuyer(b)">✏️</button>
                    <button class="btn-icon" @click="deleteBuyer(b.id)">🗑️</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </template>

      <!-- ── ABA SISTEMA ──────────────────────────────────────────────────────── -->
      <template v-if="tab === 'sistema'">

        <!-- Categories -->
        <div class="section">
          <div class="section-title">Categorias CAPEX</div>
          <div class="form-panel" style="margin-bottom:12px">
            <div class="form-panel-title" style="font-size:14px">{{ editingCat ? 'Editar Categoria' : 'Nova Categoria' }}</div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Nome *</label>
                <input class="form-control" v-model="catForm.name" placeholder="Ex: Equipamentos">
              </div>
              <div class="form-group">
                <label class="form-label">Cor</label>
                <input class="form-control" type="color" v-model="catForm.color" style="height:38px;padding:3px">
              </div>
            </div>
            <div class="form-actions">
              <button class="btn btn-primary btn-sm" @click="saveCat">{{ editingCat ? 'Salvar' : 'Adicionar' }}</button>
              <button v-if="editingCat" class="btn btn-secondary btn-sm" @click="cancelCat">Cancelar</button>
            </div>
          </div>
          <div class="table-wrap">
            <table class="table">
              <thead><tr><th>Categoria</th><th>Cor</th><th></th></tr></thead>
              <tbody>
                <tr v-if="categories.length === 0"><td colspan="3" class="empty-row">Nenhuma categoria cadastrada</td></tr>
                <tr v-for="c in categories" :key="c.id">
                  <td style="font-weight:600">{{ c.name }}</td>
                  <td>
                    <span style="display:inline-flex;align-items:center;gap:8px">
                      <span :style="'width:16px;height:16px;border-radius:3px;background:' + c.color + ';display:inline-block'"></span>
                      {{ c.color }}
                    </span>
                  </td>
                  <td>
                    <button class="btn-icon" @click="editCat(c)">✏️</button>
                    <button class="btn-icon" @click="deleteCat(c.id)">🗑️</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Auto Backup -->
        <div class="section">
          <div class="section-title">Backup Automático em Arquivo</div>
          <div class="card">
            <div v-if="!backupSupported" class="alert alert-warning">
              Backup automático requer Chrome ou Edge. Use exportar/importar manualmente.
            </div>
            <div v-else>
              <div style="display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap;margin-bottom:16px">
                <div>
                  <div style="font-weight:600;margin-bottom:6px">Pasta de destino</div>
                  <div class="text-sm text-muted" style="margin-bottom:10px">
                    Escolha onde os arquivos de backup e log serão salvos automaticamente a cada alteração.
                  </div>
                  <div v-if="folderName" style="margin-bottom:10px;display:flex;align-items:center;gap:8px">
                    <span class="badge badge-green">📁 {{ folderName }}</span>
                    <button class="btn btn-secondary btn-sm" @click="reauthorize">Reautorizar acesso</button>
                  </div>
                  <button class="btn btn-primary btn-sm" @click="selectFolder">
                    {{ folderName ? '📁 Trocar Pasta' : '📁 Selecionar Pasta' }}
                  </button>
                </div>
                <div v-if="folderName" style="border-left:1px solid var(--border);padding-left:16px">
                  <div style="font-weight:600;margin-bottom:6px">Arquivos gerados</div>
                  <div class="text-sm text-muted">
                    <div><code>gp_backup_current.json</code> — backup sempre atualizado</div>
                    <div><code>gp_backup_YYYY-MM-DD.json</code> — um arquivo por dia</div>
                    <div><code>gp_activity_log.json</code> — log permanente de ações</div>
                  </div>
                </div>
              </div>
              <div v-if="folderName || logEntries.length">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                  <div style="font-weight:600">Log de Atividades</div>
                  <button class="btn btn-secondary btn-sm" @click="loadLog">🔄 Atualizar</button>
                </div>
                <div class="table-wrap" style="max-height:320px;overflow-y:auto">
                  <table class="table">
                    <thead><tr><th>Data/Hora</th><th>Ação</th><th>Detalhe</th></tr></thead>
                    <tbody>
                      <tr v-if="logEntries.length === 0"><td colspan="3" class="empty-row">Nenhum registro no log</td></tr>
                      <tr v-for="(e, i) in logEntries" :key="i">
                        <td class="text-sm text-muted" style="white-space:nowrap">{{ formatTs(e.ts) }}</td>
                        <td><span class="badge" :class="logBadge(e.action)">{{ logLabel(e.action) }}</span></td>
                        <td class="text-sm">{{ e.detail }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Backup manual -->
        <div class="section">
          <div class="section-title">Backup e Restauração Manual</div>
          <div class="card">
            <div style="display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap">
              <div>
                <div style="font-weight:600;margin-bottom:6px">Exportar dados</div>
                <div class="text-sm text-muted" style="margin-bottom:10px">Salva todos os dados em arquivo JSON.</div>
                <button class="btn btn-secondary" @click="exportBackup">⬇️ Exportar Backup</button>
              </div>
              <div style="border-left:1px solid var(--border);padding-left:16px">
                <div style="font-weight:600;margin-bottom:6px">Importar dados</div>
                <div class="text-sm text-muted" style="margin-bottom:10px">Restaura a partir de um arquivo de backup. <strong>Atenção: substitui todos os dados atuais.</strong></div>
                <input type="file" accept=".json" @change="importBackup" ref="fileInput" style="display:none">
                <button class="btn btn-secondary" @click="$refs.fileInput.click()">⬆️ Importar Backup</button>
              </div>
              <div style="border-left:1px solid var(--border);padding-left:16px">
                <div style="font-weight:600;margin-bottom:6px;color:var(--danger)">Resetar dados</div>
                <div class="text-sm text-muted" style="margin-bottom:10px">Apaga <strong>todos</strong> os dados e reinicia com padrões.</div>
                <button class="btn btn-danger" @click="resetData">🗑️ Resetar Tudo</button>
              </div>
            </div>
            <div v-if="importMsg" class="alert" :class="'alert-' + importMsgType" style="margin-top:14px">{{ importMsg }}</div>
          </div>
        </div>

        <!-- Stats -->
        <div class="section">
          <div class="section-title">Estatísticas do Sistema</div>
          <div class="grid-4">
            <div class="card" style="text-align:center">
              <div class="card-value">{{ stats.projects }}</div>
              <div class="card-label">Projetos</div>
            </div>
            <div class="card" style="text-align:center">
              <div class="card-value">{{ stats.purchases }}</div>
              <div class="card-label">Compras</div>
            </div>
            <div class="card" style="text-align:center">
              <div class="card-value">{{ stats.tasks }}</div>
              <div class="card-label">Tarefas</div>
            </div>
            <div class="card" style="text-align:center">
              <div class="card-value">{{ stats.buyers }}</div>
              <div class="card-label">Compradores</div>
            </div>
          </div>
        </div>

      </template>
    </div>
  `,
  data() {
    return {
      tab: 'pessoas',
      coordinatorForm: { name: '' },
      editingCoordinator: null,
      consultantForm: { name: '', coordinator_id: '' },
      editingConsultant: null,
      supplyCoordForm: { name: '' },
      editingSupplyCoord: null,
      implantadorForm: { name: '', specialty: '' },
      editingImplantador: null,
      buyerForm: { name: '', coordinator_id: '', phone: '' },
      editingBuyer: null,
      managerForm: { name: '', gerencia: '' },
      editingManager: null,
      catForm: { name: '', color: '#607D8B' },
      editingCat: null,
      importMsg: '', importMsgType: 'info',
      backupSupported: window.BackupService?.supported || false,
      folderName: window.BackupService?.folderName() || null,
      logEntries: []
    };
  },
  async mounted() {
    await this.loadLog();
  },
  computed: {
    coordinators() { return [...Store.state.coordinators].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')); },
    consultants() { return [...Store.state.consultants].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')); },
    supplyCoordinators() { return [...(Store.state.supplyCoordinators || [])].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')); },
    implantadores() {
      const order = ['impl_eia','impl_mecanica','impl_civil','impl_seguranca','impl_meio_ambiente'];
      return [...(Store.state.implantadores || [])].sort((a, b) => {
        const sa = order.indexOf(a.specialty), sb = order.indexOf(b.specialty);
        if (sa !== sb) return sa - sb;
        return a.name.localeCompare(b.name, 'pt-BR');
      });
    },
    buyers() { return [...Store.state.buyers].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')); },
    managers() { return [...Store.state.managers].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')); },
    categories() { return Store.state.budgetCategories; },
    stats() {
      return {
        projects: Store.state.projects.length,
        purchases: Store.state.purchases.length,
        tasks: Store.state.tasks.length,
        buyers: Store.state.buyers.length
      };
    }
  },
  methods: {
    // Coordinators
    saveCoordinator() {
      if (!this.coordinatorForm.name.trim()) { alert('Nome obrigatório'); return; }
      if (this.editingCoordinator) Store.updateCoordinator(this.editingCoordinator, this.coordinatorForm);
      else Store.addCoordinator(this.coordinatorForm);
      this.coordinatorForm = { name: '' }; this.editingCoordinator = null;
    },
    editCoordinator(c) { this.editingCoordinator = c.id; this.coordinatorForm = { ...c }; },
    cancelCoordinator() { this.editingCoordinator = null; this.coordinatorForm = { name: '' }; },
    deleteCoordinator(id) { if (confirm('Excluir coordenador?')) Store.deleteCoordinator(id); },
    coordinatorName(id) { return Store.state.coordinators.find(c => c.id === id)?.name || '—'; },

    // Consultants
    saveConsultant() {
      if (!this.consultantForm.name.trim()) { alert('Nome obrigatório'); return; }
      if (this.editingConsultant) Store.updateConsultant(this.editingConsultant, this.consultantForm);
      else Store.addConsultant(this.consultantForm);
      this.consultantForm = { name: '', coordinator_id: '' }; this.editingConsultant = null;
    },
    editConsultant(c) { this.editingConsultant = c.id; this.consultantForm = { ...c }; },
    cancelConsultant() { this.editingConsultant = null; this.consultantForm = { name: '', coordinator_id: '' }; },
    deleteConsultant(id) { if (confirm('Excluir consultor?')) Store.deleteConsultant(id); },

    // Buyers
    saveBuyer() {
      if (!this.buyerForm.name.trim()) { alert('Nome obrigatório'); return; }
      if (this.editingBuyer) Store.updateBuyer(this.editingBuyer, this.buyerForm);
      else Store.addBuyer(this.buyerForm);
      this.buyerForm = { name: '', coordinator_id: '', phone: '' };
      this.editingBuyer = null;
    },
    editBuyer(b) { this.editingBuyer = b.id; this.buyerForm = { ...b }; },
    cancelBuyer() { this.editingBuyer = null; this.buyerForm = { name: '', coordinator_id: '', phone: '' }; },
    deleteBuyer(id) { if (confirm('Excluir comprador?')) Store.deleteBuyer(id); },
    coordinatorName(id) { return (Store.state.supplyCoordinators || []).find(c => c.id === id)?.name || '—'; },

    // Implantadores
    saveImplantador() {
      if (!this.implantadorForm.name.trim()) { alert('Nome obrigatório'); return; }
      if (this.editingImplantador) Store.updateImplantador(this.editingImplantador, this.implantadorForm);
      else Store.addImplantador(this.implantadorForm);
      this.implantadorForm = { name: '', specialty: '' };
      this.editingImplantador = null;
    },
    editImplantador(p) { this.editingImplantador = p.id; this.implantadorForm = { ...p }; },
    cancelImplantador() { this.editingImplantador = null; this.implantadorForm = { name: '', specialty: '' }; },
    specialtyLabel(s) {
      const map = { impl_eia: 'EIA', impl_mecanica: 'Mecânica', impl_civil: 'Civil', impl_seguranca: 'Tec. Segurança', impl_meio_ambiente: 'Tec. Meio Ambiente' };
      return map[s] || '—';
    },
    deleteImplantador(id) { if (confirm('Excluir implantador?')) Store.deleteImplantador(id); },

    // Supply Coordinators
    saveSupplyCoord() {
      if (!this.supplyCoordForm.name.trim()) { alert('Nome obrigatório'); return; }
      if (this.editingSupplyCoord) Store.updateSupplyCoordinator(this.editingSupplyCoord, this.supplyCoordForm);
      else Store.addSupplyCoordinator(this.supplyCoordForm);
      this.supplyCoordForm = { name: '' };
      this.editingSupplyCoord = null;
    },
    editSupplyCoord(c) { this.editingSupplyCoord = c.id; this.supplyCoordForm = { ...c }; },
    cancelSupplyCoord() { this.editingSupplyCoord = null; this.supplyCoordForm = { name: '' }; },
    deleteSupplyCoord(id) { if (confirm('Excluir coordenador?')) Store.deleteSupplyCoordinator(id); },

    // Managers
    saveManager() {
      if (!this.managerForm.name.trim()) { alert('Nome obrigatório'); return; }
      if (this.editingManager) Store.updateManager(this.editingManager, this.managerForm);
      else Store.addManager(this.managerForm);
      this.managerForm = { name: '', gerencia: '' }; this.editingManager = null;
    },
    editManager(m) { this.editingManager = m.id; this.managerForm = { ...m }; },
    cancelManager() { this.editingManager = null; this.managerForm = { name: '', gerencia: '' }; },
    deleteManager(id) { if (confirm('Excluir gerente?')) Store.deleteManager(id); },

    // Categories
    saveCat() {
      if (!this.catForm.name.trim()) { alert('Nome obrigatório'); return; }
      if (this.editingCat) Store.updateCategory(this.editingCat, this.catForm);
      else Store.addCategory(this.catForm);
      this.catForm = { name: '', color: '#607D8B' }; this.editingCat = null;
    },
    editCat(c) { this.editingCat = c.id; this.catForm = { ...c }; },
    cancelCat() { this.editingCat = null; this.catForm = { name: '', color: '#607D8B' }; },
    deleteCat(id) { if (confirm('Excluir categoria?')) Store.deleteCategory(id); },

    // Auto backup
    async selectFolder() {
      if (!window.BackupService) return;
      const ok = await BackupService.selectFolder();
      if (ok) {
        this.folderName = BackupService.folderName();
        await BackupService.log('backup_folder_set', this.folderName);
        await this.loadLog();
      }
    },
    async reauthorize() {
      if (!window.BackupService) return;
      const ok = await BackupService.reauthorize();
      if (ok) { this.folderName = BackupService.folderName(); await this.loadLog(); }
      else alert('Acesso negado. Tente selecionar a pasta novamente.');
    },
    async loadLog() {
      if (!window.BackupService) return;
      const entries = await BackupService.readLog();
      this.logEntries = [...entries].reverse().slice(0, 200);
    },
    formatTs(ts) {
      try {
        return new Date(ts).toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit', second:'2-digit' });
      } catch { return ts; }
    },
    logLabel(action) {
      const map = {
        project_add: 'Projeto criado', project_update: 'Projeto editado', project_delete: 'Projeto excluído',
        purchase_add: 'Compra criada', purchase_update: 'Compra editada', purchase_delete: 'Compra excluída',
        task_add: 'Tarefa criada', task_update: 'Tarefa editada', task_delete: 'Tarefa excluída',
        import_backup: 'Importação', reset_data: 'Reset de dados', backup_folder_set: 'Pasta configurada'
      };
      return map[action] || action;
    },
    logBadge(action) {
      if (action.includes('delete') || action === 'reset_data') return 'badge-red';
      if (action.includes('add') || action === 'import_backup' || action === 'backup_folder_set') return 'badge-green';
      return 'badge-blue';
    },

    // Manual backup
    exportBackup() { Store.exportBackup(); },
    importBackup(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        const ok = Store.importBackup(ev.target.result);
        this.importMsg = ok ? 'Dados importados com sucesso!' : 'Erro: arquivo inválido.';
        this.importMsgType = ok ? 'info' : 'danger';
        setTimeout(() => { this.importMsg = ''; }, 4000);
      };
      reader.readAsText(file);
      e.target.value = '';
    },
    resetData() {
      if (!confirm('Apagar TODOS os dados? Esta ação não pode ser desfeita.')) return;
      if (!confirm('Tem certeza? Todos os projetos, compras e tarefas serão removidos.')) return;
      Store.resetData();
      this.importMsg = 'Dados resetados. Categorias padrão restauradas.';
      this.importMsgType = 'info';
      setTimeout(() => { this.importMsg = ''; }, 4000);
    }
  }
};
