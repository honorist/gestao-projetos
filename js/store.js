(function () {
  const STORAGE_KEY = 'gp_data_v1';
  const COMMITTED_STATUSES = ['requisition', 'quoting', 'approved', 'po_issued', 'in_transit'];

  // ── Diff helpers for activity log ────────────────────────────────────────────
  const CURRENCY_FIELDS = new Set(['budget', 'estimated_value', 'quote_value', 'approved_value', 'actual_value']);
  const CODED_FIELDS    = new Set(['status', 'fel_phase', 'priority']);

  const PROJECT_LABELS = {
    name: 'Nome', number: 'Número', pep: 'PEP', unit: 'Unidade', location: 'Local',
    status: 'Status', fel_phase: 'Fase', responsible: 'Responsável',
    manager_requestor: 'Ger. Solicitante', maintenance: 'Manutenção',
    operations: 'Operação', safety: 'Segurança', environment: 'Meio Ambiente',
    start_date: 'Início', planned_end_date: 'Fim Previsto', actual_end_date: 'Fim Real',
    budget: 'Orçamento'
  };
  const PURCHASE_LABELS = {
    number: 'Número', status: 'Status', supplier: 'Fornecedor',
    estimated_value: 'Val. Estimado', quote_value: 'Val. Cotado',
    approved_value: 'Val. Aprovado', actual_value: 'Val. Realizado',
    request_date: 'Data Solic.', po_date: 'Data PO',
    expected_arrival_date: 'Prev. Chegada', actual_arrival_date: 'Chegada Real'
  };
  const TASK_LABELS = {
    title: 'Título', status: 'Status', priority: 'Prioridade',
    responsible: 'Responsável', due_date: 'Vencimento'
  };

  function fmtVal(key, val) {
    if (CURRENCY_FIELDS.has(key)) return formatCurrency(val);
    if (CODED_FIELDS.has(key))    return statusLabel(val) || val || '—';
    return val || '—';
  }

  function buildDiff(oldObj, newData, labels) {
    const changes = [];
    for (const key of Object.keys(labels)) {
      if (!(key in newData)) continue;
      const a = oldObj[key], b = newData[key];
      if (String(a ?? '') === String(b ?? '')) continue;
      changes.push(`${labels[key]}: "${fmtVal(key, a)}" → "${fmtVal(key, b)}"`);
    }
    return changes.join(' | ');
  }

  function defaultData() {
    return {
      _version: 1,
      projects: [],
      purchases: [],
      tasks: [],
      buyers: [],
      coordinators: [
        { id: uuid(), name: 'Rodrigo Sinnis' },
        { id: uuid(), name: 'Thiago Mantegazine' },
      ],
      managers: [
        { id: uuid(), name: 'Ana Leticia Bhering', gerencia: '' },
        { id: uuid(), name: 'Anelise Manganelli', gerencia: '' },
        { id: uuid(), name: 'Antônio Souza', gerencia: '' },
        { id: uuid(), name: 'Bruna Bof', gerencia: '' },
        { id: uuid(), name: 'Diego Tramontini', gerencia: '' },
        { id: uuid(), name: 'Francisco Rodrigues', gerencia: '' },
        { id: uuid(), name: 'Geferson Delfino', gerencia: '' },
        { id: uuid(), name: 'Marco Aurélio Alves', gerencia: '' },
        { id: uuid(), name: 'Milton Ricardo Machado', gerencia: '' },
        { id: uuid(), name: 'Renata Toniolo', gerencia: '' },
        { id: uuid(), name: 'Silvia Marques', gerencia: '' },
      ],
      consultants: [
        { id: uuid(), name: 'Everton Menezes da Silva' },
        { id: uuid(), name: 'Mario Luis de Souza Terres' },
        { id: uuid(), name: 'Honorio Dias Barbosa Filho' },
        { id: uuid(), name: 'Winston de Oliveira Ruibacki' },
        { id: uuid(), name: 'Jorge Augusto Barbosa Do Santos' },
        { id: uuid(), name: 'Vitor Schneider Abrahao' },
        { id: uuid(), name: 'Marcelo Custodio Stahl' },
        { id: uuid(), name: 'Barbara Crysthine Sousa Lopes' },
        { id: uuid(), name: 'Felipe de Souza Sanfelice' },
      ],
      procurements: [],
      supplyCoordinators: [],
      rateios: [],
      implantadores: [],
      budgetCategories: [
        { id: uuid(), name: 'Equipamentos', color: '#1D6B3F' },
        { id: uuid(), name: 'Montagem', color: '#2196F3' },
        { id: uuid(), name: 'Engenharia', color: '#FF9800' },
        { id: uuid(), name: 'Civil', color: '#9C27B0' },
        { id: uuid(), name: 'Instrumentação', color: '#F44336' },
        { id: uuid(), name: 'Elétrica', color: '#00BCD4' },
        { id: uuid(), name: 'Contingência', color: '#607D8B' },
      ]
    };
  }

  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch (e) {}
  const state = Vue.reactive(saved || defaultData());

  // Migrate older data that may be missing newer fields
  if (!state.coordinators || state.coordinators.length === 0) state.coordinators = defaultData().coordinators;
  if (!state.managers || state.managers.length === 0) state.managers = defaultData().managers;
  if (!state.consultants) state.consultants = defaultData().consultants;
  if (!state.budgetCategories) state.budgetCategories = defaultData().budgetCategories;
  if (!state.procurements) state.procurements = [];
  if (!state.supplyCoordinators) state.supplyCoordinators = [];
  if (!state.rateios) state.rateios = [];
  if (!state.implantadores) state.implantadores = [];

  window.Store = {
    state,

    save() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      if (window.BackupService) BackupService.saveBackup(state);
    },

    // ── PROJECTS ──────────────────────────────────────────────────────────────
    getProject(id) { return state.projects.find(p => p.id === id); },

    addProject(d) {
      const p = {
        id: uuid(), name: d.name || 'Novo Projeto', number: d.number || '',
        pep: d.pep || '',
        unit: d.unit || '',
        location: d.location || '',
        status: d.status || 'planning', fel_phase: d.fel_phase || 'FEL1',
        responsible: d.responsible || '',
        manager_requestor: d.manager_requestor || '',
        maintenance: d.maintenance || '',
        operations: d.operations || '',
        safety: d.safety || '',
        environment: d.environment || '',
        start_date: d.start_date || '', planned_end_date: d.planned_end_date || '',
        actual_end_date: d.actual_end_date || '', budget: numberInput(d.budget),
        objective: d.objective || '',
        scope: d.scope || '',
        benefit: d.benefit || '',
        description: d.description || '',
        progress_pct: 0, s_curve: [], disbursements: [], notes: d.notes || '',
        coordinator: d.coordinator || '',
        impl_eia: d.impl_eia || '', impl_mecanica: d.impl_mecanica || '',
        impl_civil: d.impl_civil || '', impl_seguranca: d.impl_seguranca || '',
        impl_meio_ambiente: d.impl_meio_ambiente || '',
        created_at: new Date().toISOString(), updated_at: new Date().toISOString()
      };
      state.projects.push(p); this.save();
      if (window.BackupService) BackupService.log('project_add', p.name);
      return p;
    },

    updateProject(id, d) {
      const i = state.projects.findIndex(p => p.id === id);
      if (i >= 0) {
        const diff = buildDiff(state.projects[i], d, PROJECT_LABELS);
        Object.assign(state.projects[i], d, { updated_at: new Date().toISOString() });
        this.save();
        if (window.BackupService) BackupService.log('project_update', `${state.projects[i].name}${diff ? ' — ' + diff : ''}`);
      }
    },

    deleteProject(id) {
      const p = this.getProject(id);
      state.projects = state.projects.filter(p => p.id !== id);
      state.purchases = state.purchases.filter(p => p.project_id !== id);
      state.tasks = state.tasks.filter(t => t.project_id !== id);
      this.save();
      if (window.BackupService) BackupService.log('project_delete', p?.name || id);
    },

    // ── PURCHASES ─────────────────────────────────────────────────────────────
    getPurchase(id) { return state.purchases.find(p => p.id === id); },
    getPurchasesByProject(pid) { return state.purchases.filter(p => p.project_id === pid); },

    addPurchase(d) {
      const p = {
        id: uuid(), project_id: d.project_id || '', number: d.number || '',
        po_number: d.po_number || '',
        description: d.description || '', technical_spec: d.technical_spec || '',
        buyer_id: d.buyer_id || '', supplier: d.supplier || '',
        budget_category_id: d.budget_category_id || '',
        status: d.status || 'forecast',
        estimated_value: numberInput(d.estimated_value),
        quote_value: numberInput(d.quote_value),
        approved_value: numberInput(d.approved_value),
        actual_value: numberInput(d.actual_value),
        request_date: d.request_date || '', po_date: d.po_date || '',
        expected_arrival_date: d.expected_arrival_date || '',
        actual_arrival_date: d.actual_arrival_date || '',
        disbursements: d.disbursements || [],
        notes: d.notes || '',
        created_at: new Date().toISOString(), updated_at: new Date().toISOString()
      };
      state.purchases.push(p); this.save();
      if (window.BackupService) BackupService.log('purchase_add', p.description || p.number || p.id);
      return p;
    },

    updatePurchase(id, d) {
      const i = state.purchases.findIndex(p => p.id === id);
      if (i >= 0) {
        const diff = buildDiff(state.purchases[i], d, PURCHASE_LABELS);
        const name = state.purchases[i].description || state.purchases[i].number || id;
        Object.assign(state.purchases[i], d, { updated_at: new Date().toISOString() });
        this.save();
        if (window.BackupService) BackupService.log('purchase_update', `${name}${diff ? ' — ' + diff : ''}`);
      }
    },

    deletePurchase(id) {
      const p = this.getPurchase(id);
      state.purchases = state.purchases.filter(p => p.id !== id);
      this.save();
      if (window.BackupService) BackupService.log('purchase_delete', p?.description || p?.number || id);
    },

    // ── TASKS ─────────────────────────────────────────────────────────────────
    addTask(d) {
      const t = {
        id: uuid(), project_id: d.project_id || null, title: d.title || '',
        description: d.description || '', status: d.status || 'todo',
        priority: d.priority || 'medium', responsible: d.responsible || '',
        due_date: d.due_date || '', completed_date: '',
        created_at: new Date().toISOString(), updated_at: new Date().toISOString()
      };
      state.tasks.push(t); this.save();
      if (window.BackupService) BackupService.log('task_add', t.title);
      return t;
    },

    updateTask(id, d) {
      const i = state.tasks.findIndex(t => t.id === id);
      if (i >= 0) {
        const diff = buildDiff(state.tasks[i], d, TASK_LABELS);
        if (d.status === 'done' && !state.tasks[i].completed_date) d.completed_date = new Date().toISOString().split('T')[0];
        Object.assign(state.tasks[i], d, { updated_at: new Date().toISOString() });
        this.save();
        if (window.BackupService) BackupService.log('task_update', `${state.tasks[i].title}${diff ? ' — ' + diff : ''}`);
      }
    },

    deleteTask(id) {
      const t = state.tasks.find(t => t.id === id);
      state.tasks = state.tasks.filter(t => t.id !== id);
      this.save();
      if (window.BackupService) BackupService.log('task_delete', t?.title || id);
    },

    // ── RATEIOS ───────────────────────────────────────────────────────────────
    getRateio(id) { return state.rateios.find(r => r.id === id); },

    addRateio(d) {
      const r = {
        id: uuid(),
        description: d.description || '',
        rc_number: d.rc_number || '',
        po_number: d.po_number || '',
        supplier: d.supplier || '',
        total_value: d.total_value || 0,
        month: d.month || '',
        allocations: d.allocations || [],
        notes: d.notes || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      state.rateios.push(r); this.save();
      if (window.BackupService) BackupService.log('rateio_add', r.description || r.id);
      return r;
    },

    updateRateio(id, d) {
      const i = state.rateios.findIndex(r => r.id === id);
      if (i >= 0) {
        Object.assign(state.rateios[i], d, { updated_at: new Date().toISOString() });
        this.save();
        if (window.BackupService) BackupService.log('rateio_update', state.rateios[i].description || id);
      }
    },

    deleteRateio(id) {
      const r = this.getRateio(id);
      state.rateios = state.rateios.filter(r => r.id !== id);
      this.save();
      if (window.BackupService) BackupService.log('rateio_delete', r?.description || id);
    },

    // ── IMPLANTADORES ────────────────────────────────────────────────────────
    addImplantador(d) { const c = { id: uuid(), name: d.name || '', specialty: d.specialty || '' }; state.implantadores.push(c); this.save(); return c; },
    updateImplantador(id, d) { const i = state.implantadores.findIndex(c => c.id === id); if (i >= 0) { Object.assign(state.implantadores[i], d); this.save(); } },
    deleteImplantador(id) { state.implantadores = state.implantadores.filter(c => c.id !== id); this.save(); },

    // ── SUPPLY COORDINATORS ───────────────────────────────────────────────────
    addSupplyCoordinator(d) { const c = { id: uuid(), name: d.name || '' }; state.supplyCoordinators.push(c); this.save(); return c; },
    updateSupplyCoordinator(id, d) { const i = state.supplyCoordinators.findIndex(c => c.id === id); if (i >= 0) { Object.assign(state.supplyCoordinators[i], d); this.save(); } },
    deleteSupplyCoordinator(id) { state.supplyCoordinators = state.supplyCoordinators.filter(c => c.id !== id); this.save(); },

    // ── BUYERS ────────────────────────────────────────────────────────────────
    addBuyer(d) { const b = { id: uuid(), name: d.name || '', email: d.email || '', department: d.department || '', phone: d.phone || '', active: true }; state.buyers.push(b); this.save(); return b; },
    updateBuyer(id, d) { const i = state.buyers.findIndex(b => b.id === id); if (i >= 0) { Object.assign(state.buyers[i], d); this.save(); } },
    deleteBuyer(id) { state.buyers = state.buyers.filter(b => b.id !== id); this.save(); },

    // ── COORDINATORS ──────────────────────────────────────────────────────────
    addCoordinator(d) { const c = { id: uuid(), name: d.name || '' }; state.coordinators.push(c); this.save(); return c; },
    updateCoordinator(id, d) { const i = state.coordinators.findIndex(c => c.id === id); if (i >= 0) { Object.assign(state.coordinators[i], d); this.save(); } },
    deleteCoordinator(id) { state.coordinators = state.coordinators.filter(c => c.id !== id); this.save(); },

    // ── CONSULTANTS ───────────────────────────────────────────────────────────
    addConsultant(d) { const c = { id: uuid(), name: d.name || '' }; state.consultants.push(c); this.save(); return c; },
    updateConsultant(id, d) { const i = state.consultants.findIndex(c => c.id === id); if (i >= 0) { Object.assign(state.consultants[i], d); this.save(); } },
    deleteConsultant(id) { state.consultants = state.consultants.filter(c => c.id !== id); this.save(); },

    // ── MANAGERS ──────────────────────────────────────────────────────────────
    addManager(d) { const m = { id: uuid(), name: d.name || '', gerencia: d.gerencia || '' }; state.managers.push(m); this.save(); return m; },
    updateManager(id, d) { const i = state.managers.findIndex(m => m.id === id); if (i >= 0) { Object.assign(state.managers[i], d); this.save(); } },
    deleteManager(id) { state.managers = state.managers.filter(m => m.id !== id); this.save(); },

    // ── BUDGET CATEGORIES ─────────────────────────────────────────────────────
    addCategory(d) { const c = { id: uuid(), name: d.name || '', color: d.color || '#607D8B' }; state.budgetCategories.push(c); this.save(); return c; },
    updateCategory(id, d) { const i = state.budgetCategories.findIndex(c => c.id === id); if (i >= 0) { Object.assign(state.budgetCategories[i], d); this.save(); } },
    deleteCategory(id) { state.budgetCategories = state.budgetCategories.filter(c => c.id !== id); this.save(); },

    // ── PROCUREMENTS ──────────────────────────────────────────────────────────
    getProcurement(id) { return state.procurements.find(p => p.id === id); },

    addProcurement(d) {
      const p = {
        id: uuid(), project_id: d.project_id || '',
        category: d.category || 'suprimentos',
        description: d.description || '', rc_number: d.rc_number || '',
        value_brl: d.value_brl || 0, value_usd: d.value_usd || 0,
        buyer_id: d.buyer_id || '',
        ms_rc: d.ms_rc || '', ms_et: d.ms_et || '',
        ms_invitation: d.ms_invitation || '', ms_proposals: d.ms_proposals || '',
        ms_analysis: d.ms_analysis || '', ms_po: d.ms_po || '',
        real_rc: d.real_rc || '', real_invitation: d.real_invitation || '',
        real_proposals: d.real_proposals || '', real_analysis: d.real_analysis || '',
        real_po: d.real_po || '',
        notes: d.notes || '',
        created_at: new Date().toISOString(), updated_at: new Date().toISOString()
      };
      state.procurements.push(p); this.save();
      if (window.BackupService) BackupService.log('procurement_add', p.description || p.id);
      return p;
    },

    updateProcurement(id, d) {
      const i = state.procurements.findIndex(p => p.id === id);
      if (i >= 0) {
        Object.assign(state.procurements[i], d, { updated_at: new Date().toISOString() });
        this.save();
        if (window.BackupService) BackupService.log('procurement_update', state.procurements[i].description || id);
      }
    },

    deleteProcurement(id) {
      const p = this.getProcurement(id);
      state.procurements = state.procurements.filter(p => p.id !== id);
      this.save();
      if (window.BackupService) BackupService.log('procurement_delete', p?.description || id);
    },

    // ── FINANCIALS ────────────────────────────────────────────────────────────
    committedValue(p) {
      return p.approved_value || p.quote_value || p.estimated_value || 0;
    },

    getProjectFinancials(pid) {
      const project = this.getProject(pid);
      const purchases = this.getPurchasesByProject(pid);
      const committed = purchases.filter(p => COMMITTED_STATUSES.includes(p.status))
        .reduce((s, p) => s + this.committedValue(p), 0);
      const forecast = purchases.filter(p => p.status === 'forecast')
        .reduce((s, p) => s + (p.estimated_value || 0), 0);
      const actual = purchases.filter(p => p.status === 'received')
        .reduce((s, p) => s + (p.actual_value || p.approved_value || 0), 0);
      const budget = project?.budget || 0;
      const balance = budget - committed - forecast - actual;
      const total_exposure = committed + forecast + actual;
      const pct_used = budget > 0 ? (total_exposure / budget * 100) : 0;
      return { budget, committed, forecast, actual, balance, total_exposure, pct_used };
    },

    // ── CURVA S ───────────────────────────────────────────────────────────────
    getSCurveData(pid) {
      const project = this.getProject(pid);
      if (!project || !project.s_curve || project.s_curve.length === 0) return null;
      const purchases = this.getPurchasesByProject(pid);
      const months = [...project.s_curve].map(e => e.month).sort();

      let cumPlan = 0, cumActual = 0, cumCommitted = 0;
      const labels = [], planned = [], actual = [], committed = [];

      months.forEach(m => {
        const entry = project.s_curve.find(e => e.month === m);
        cumPlan += numberInput(entry?.planned);

        const received = purchases.filter(p =>
          p.status === 'received' && p.actual_arrival_date && p.actual_arrival_date.slice(0, 7) === m);
        cumActual += received.reduce((s, p) => s + (p.actual_value || p.approved_value || 0), 0);

        const comm = purchases.filter(p =>
          COMMITTED_STATUSES.includes(p.status) && p.expected_arrival_date && p.expected_arrival_date.slice(0, 7) === m);
        cumCommitted += comm.reduce((s, p) => s + this.committedValue(p), 0);

        labels.push(formatMonth(m));
        planned.push(cumPlan);
        actual.push(cumActual);
        committed.push(cumCommitted);
      });

      return { labels, planned, actual, committed };
    },

    // ── ALERTS ────────────────────────────────────────────────────────────────
    getAlerts() {
      const today = new Date().toISOString().split('T')[0];
      const alerts = [];
      state.purchases.forEach(p => {
        if (p.expected_arrival_date && p.expected_arrival_date < today && !['received','cancelled'].includes(p.status)) {
          const proj = this.getProject(p.project_id);
          alerts.push({ type: 'danger', message: `Compra "${p.description || p.number}" (${proj?.name || '—'}) atrasada — prevista para ${formatDate(p.expected_arrival_date)}` });
        }
      });
      state.projects.forEach(p => {
        if (p.status === 'cancelled') return;
        const fin = this.getProjectFinancials(p.id);
        if (fin.balance < 0)
          alerts.push({ type: 'danger', message: `Projeto "${p.name}" com saldo negativo: ${formatCurrency(fin.balance)}` });
        else if (fin.pct_used > 90 && fin.budget > 0)
          alerts.push({ type: 'warning', message: `Projeto "${p.name}" com ${fin.pct_used.toFixed(0)}% do orçamento comprometido` });
      });
      return alerts;
    },

    // ── BACKUP ────────────────────────────────────────────────────────────────
    exportBackup() {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url;
      a.download = `gp_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click(); URL.revokeObjectURL(url);
    },

    importBackup(jsonStr) {
      try {
        const d = JSON.parse(jsonStr);
        if (!d._version || !Array.isArray(d.projects)) return false;
        Object.keys(d).forEach(k => { state[k] = d[k]; });
        this.save();
        if (window.BackupService) BackupService.log('import_backup', `${d.projects.length} projetos, ${d.purchases.length} compras`);
        return true;
      } catch (e) { return false; }
    },

    resetData() {
      const d = defaultData();
      Object.keys(d).forEach(k => { state[k] = d[k]; });
      this.save();
      if (window.BackupService) BackupService.log('reset_data', 'Dados resetados para padrão');
    }
  };
})();
