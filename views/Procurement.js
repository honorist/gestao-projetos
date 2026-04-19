window.ProcurementView = {
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Gestão de Suprimentos</h1>
          <div class="subtitle">Monitoramento de processos licitatórios</div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="card" style="margin-bottom:20px;display:flex;gap:20px;flex-wrap:wrap;align-items:flex-end">
        <div>
          <div class="form-label" style="margin-bottom:6px">Projeto</div>
          <select class="form-control" v-model="filterProject" style="min-width:220px">
            <option value="">— Todos —</option>
            <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.name }}</option>
          </select>
        </div>
        <div>
          <div class="form-label" style="margin-bottom:6px">Categoria</div>
          <select class="form-control" v-model="filterCategory">
            <option value="">— Todas —</option>
            <option value="normal">Normal</option>
            <option value="urgente">Urgente</option>
          </select>
        </div>
        <div>
          <div class="form-label" style="margin-bottom:6px">Status</div>
          <select class="form-control" v-model="filterStatus">
            <option value="">— Todos —</option>
            <option value="forecast">Previsão</option>
            <option value="requisition">Requisição</option>
            <option value="quoting">Cotação</option>
            <option value="approved">Aprovado</option>
            <option value="po_issued">PO Emitido</option>
            <option value="in_transit">Em Trânsito</option>
            <option value="received">Recebido</option>
          </select>
        </div>
        <div style="align-self:flex-end;padding-bottom:8px">
          <label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer;color:var(--text-mid)">
            <input type="checkbox" v-model="hideConcluded" style="accent-color:var(--green)">
            Ocultar concluídos
          </label>
        </div>
        <div style="color:var(--text-muted);font-size:13px;padding-bottom:8px">
          {{ filteredPurchases.length }} compra(s)
        </div>
      </div>

      <!-- Tabelas por categoria -->
      <template v-if="groupedPurchases.length > 0">
        <div v-for="group in groupedPurchases" :key="group.cat" class="section" style="margin-bottom:28px">
          <div class="section-title">
            {{ group.cat === 'urgente' ? '🔴 Urgente' : '🟢 Normal' }}
            <span style="font-weight:400;color:var(--text-muted);font-size:13px;margin-left:8px">{{ group.items.length }} item(s)</span>
            <span style="font-weight:400;color:var(--green);font-size:12px;margin-left:8px">{{ group.items.filter(p => isConcluded(p)).length }} concluído(s)</span>
          </div>
          <div class="table-wrap" style="overflow-x:auto">
            <table class="table" style="min-width:1180px;table-layout:fixed">
              <colgroup>
                <col style="width:160px"><!-- Projeto -->
                <col style="width:75px"> <!-- Consultor -->
                <col style="width:185px"><!-- Item -->
                <col style="width:75px"> <!-- RC nº -->
                <col style="width:100px"><!-- Valor R$ -->
                <col style="width:75px"> <!-- Comprador -->
                <col style="width:82px"> <!-- Status -->
                <col style="width:88px"> <!-- ET MS -->
                <col style="width:88px"> <!-- PO MS -->
                <col style="width:65px"> <!-- Δ RC -->
                <col style="width:65px"> <!-- Δ CC -->
                <col style="width:65px"> <!-- Δ Prop -->
                <col style="width:65px"> <!-- Δ Anál -->
                <col style="width:65px"> <!-- Δ PO -->
                <col style="width:90px"> <!-- Situação -->
                <col style="width:44px"> <!-- Ações -->
              </colgroup>
              <thead>
                <tr>
                  <th rowspan="2">Projeto</th>
                  <th rowspan="2">Consultor</th>
                  <th rowspan="2">Item</th>
                  <th rowspan="2">RC</th>
                  <th rowspan="2" style="text-align:right">Valor (R$)</th>
                  <th rowspan="2">Comprador</th>
                  <th rowspan="2">Status</th>
                  <th colspan="2" style="text-align:center;border-bottom:1px solid var(--border);background:rgba(33,150,243,.07);color:#1565C0">
                    Planejado (MS)
                  </th>
                  <th colspan="5" style="text-align:center;border-bottom:1px solid var(--border);background:rgba(244,67,54,.07);color:#B71C1C">
                    Desvio (dias)
                  </th>
                  <th rowspan="2" style="text-align:center">Situação</th>
                  <th rowspan="2"></th>
                </tr>
                <tr>
                  <th style="text-align:center;background:rgba(33,150,243,.04)">ET</th>
                  <th style="text-align:center;background:rgba(33,150,243,.04)">PO</th>
                  <th style="text-align:center;background:rgba(244,67,54,.04)">RC</th>
                  <th style="text-align:center;background:rgba(244,67,54,.04)">CC</th>
                  <th style="text-align:center;background:rgba(244,67,54,.04)">Prop</th>
                  <th style="text-align:center;background:rgba(244,67,54,.04)">Anál</th>
                  <th style="text-align:center;background:rgba(244,67,54,.04)">PO</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in group.items" :key="p.id" class="clickable" @click="openEdit(p)"
                  :style="isConcluded(p) ? 'opacity:.65;background:rgba(29,107,63,.04)' : ''">
                  <td style="font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ projectName(p.project_id) }}</td>
                  <td style="font-size:12px;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ consultantFirst(p.project_id) }}</td>
                  <td style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis" :title="p.description">{{ p.description || p.number || '—' }}</td>
                  <td style="font-size:12px;color:var(--text-muted)">{{ p.number || '—' }}</td>
                  <td style="text-align:right">{{ fc(p.approved_value || p.quote_value || p.estimated_value || 0) }}</td>
                  <td style="font-size:12px">{{ buyerFirst(p.buyer_id) }}</td>
                  <td><span :class="'badge badge-' + statusColor(p.status)" style="font-size:10px">{{ statusLabel(p.status) }}</span></td>
                  <td style="text-align:center;font-size:12px;background:rgba(33,150,243,.03)">{{ fd(p.ms_et) }}</td>
                  <td style="text-align:center;font-size:12px;background:rgba(33,150,243,.03)">{{ fd(p.ms_po) }}</td>
                  <td style="text-align:center;font-size:12px;font-weight:700;background:rgba(244,67,54,.03)" :style="deltaStyle(daysDiff(p.ms_rc, p.real_rc || p.request_date))">{{ deltaLabel(daysDiff(p.ms_rc, p.real_rc || p.request_date)) }}</td>
                  <td style="text-align:center;font-size:12px;font-weight:700;background:rgba(244,67,54,.03)" :style="deltaStyle(daysDiff(p.ms_invitation, p.real_invitation))">{{ deltaLabel(daysDiff(p.ms_invitation, p.real_invitation)) }}</td>
                  <td style="text-align:center;font-size:12px;font-weight:700;background:rgba(244,67,54,.03)" :style="deltaStyle(daysDiff(p.ms_proposals, p.real_proposals))">{{ deltaLabel(daysDiff(p.ms_proposals, p.real_proposals)) }}</td>
                  <td style="text-align:center;font-size:12px;font-weight:700;background:rgba(244,67,54,.03)" :style="deltaStyle(daysDiff(p.ms_analysis, p.real_analysis))">{{ deltaLabel(daysDiff(p.ms_analysis, p.real_analysis)) }}</td>
                  <td style="text-align:center;font-size:12px;font-weight:700;background:rgba(244,67,54,.03)" :style="deltaStyle(daysDiff(p.ms_po, p.real_po || p.po_date))">{{ deltaLabel(daysDiff(p.ms_po, p.real_po || p.po_date)) }}</td>
                  <td style="text-align:center">
                    <span v-if="isConcluded(p)" class="badge badge-green" style="font-size:10px">✓ Concluído</span>
                    <span v-else class="badge badge-blue" style="font-size:10px">Em andamento</span>
                  </td>
                  <td @click.stop>
                    <button class="btn-icon" @click="openEdit(p)" title="Editar datas">✏️</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>

      <!-- Empty -->
      <div v-if="groupedPurchases.length === 0" class="card" style="text-align:center;padding:60px 20px;color:var(--text-muted)">
        <div style="font-size:48px;margin-bottom:14px">📋</div>
        <div style="font-size:16px;font-weight:600;margin-bottom:8px;color:var(--text)">Nenhuma compra encontrada</div>
        <div style="font-size:14px">Cadastre compras nos projetos e elas aparecerão aqui para rastreamento.</div>
      </div>

      <!-- Modal de datas de processo -->
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal" style="max-width:740px;max-height:92vh;overflow-y:auto">
          <div class="modal-header">
            <div>
              <h3 style="margin:0 0 2px">Datas do Processo</h3>
              <div style="font-size:13px;color:var(--text-muted)">{{ editing?.description || editing?.number || '—' }} · {{ projectName(editing?.project_id) }}</div>
            </div>
            <button class="btn btn-ghost" @click="closeModal">✕</button>
          </div>
          <div class="modal-body" style="display:grid;gap:16px">

            <!-- Categoria -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
              <div>
                <div class="form-label">Categoria</div>
                <select class="form-control" v-model="form.proc_category">
                  <option value="normal">Normal</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>
              <div style="display:flex;flex-direction:column;justify-content:flex-end;padding-bottom:2px">
                <div style="font-size:12px;color:var(--text-muted)">Valor: <strong>{{ fc(editing?.approved_value || editing?.quote_value || editing?.estimated_value || 0) }}</strong></div>
                <div style="font-size:12px;color:var(--text-muted)">Status: <strong>{{ statusLabel(editing?.status) }}</strong></div>
              </div>
            </div>

            <!-- Datas planejadas -->
            <div style="border-top:2px solid var(--green-xlight);padding-top:14px">
              <div class="form-section-title" style="margin-top:0">Datas Planejadas — Cronograma (MS)</div>
              <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px">
                <div>
                  <div class="form-label">RC (MS)</div>
                  <input class="form-control" type="date" v-model="form.ms_rc">
                </div>
                <div>
                  <div class="form-label">ET — Espec. Técnica (MS)</div>
                  <input class="form-control" type="date" v-model="form.ms_et">
                </div>
                <div>
                  <div class="form-label">Carta Convite (MS)</div>
                  <input class="form-control" type="date" v-model="form.ms_invitation">
                </div>
                <div>
                  <div class="form-label">Rec. Propostas (MS)</div>
                  <input class="form-control" type="date" v-model="form.ms_proposals">
                </div>
                <div>
                  <div class="form-label">Análise Técnica (MS)</div>
                  <input class="form-control" type="date" v-model="form.ms_analysis">
                </div>
                <div>
                  <div class="form-label">Pedido de Compras (MS)</div>
                  <input class="form-control" type="date" v-model="form.ms_po">
                </div>
              </div>
            </div>

            <!-- Datas reais -->
            <div style="border-top:2px solid rgba(244,67,54,.15);padding-top:14px">
              <div class="form-section-title" style="margin-top:0;color:var(--danger);border-bottom-color:rgba(244,67,54,.15)">Datas Reais</div>
              <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px">
                <div>
                  <div class="form-label">RC Aprovada</div>
                  <input class="form-control" type="date" v-model="form.real_rc">
                  <div class="form-hint" :style="deltaHintStyle(daysDiff(form.ms_rc, form.real_rc))">{{ deltaHint(daysDiff(form.ms_rc, form.real_rc)) }}</div>
                </div>
                <div>
                  <div class="form-label">Carta Convite Enviada</div>
                  <input class="form-control" type="date" v-model="form.real_invitation">
                  <div class="form-hint" :style="deltaHintStyle(daysDiff(form.ms_invitation, form.real_invitation))">{{ deltaHint(daysDiff(form.ms_invitation, form.real_invitation)) }}</div>
                </div>
                <div>
                  <div class="form-label">Propostas Recebidas</div>
                  <input class="form-control" type="date" v-model="form.real_proposals">
                  <div class="form-hint" :style="deltaHintStyle(daysDiff(form.ms_proposals, form.real_proposals))">{{ deltaHint(daysDiff(form.ms_proposals, form.real_proposals)) }}</div>
                </div>
                <div>
                  <div class="form-label">Análise Técnica</div>
                  <input class="form-control" type="date" v-model="form.real_analysis">
                  <div class="form-hint" :style="deltaHintStyle(daysDiff(form.ms_analysis, form.real_analysis))">{{ deltaHint(daysDiff(form.ms_analysis, form.real_analysis)) }}</div>
                </div>
                <div>
                  <div class="form-label">Pedido de Compras (PO)</div>
                  <input class="form-control" type="date" v-model="form.real_po">
                  <div class="form-hint" :style="deltaHintStyle(daysDiff(form.ms_po, form.real_po))">{{ deltaHint(daysDiff(form.ms_po, form.real_po)) }}</div>
                </div>
              </div>
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
      filterProject: '',
      filterCategory: '',
      filterStatus: '',
      hideConcluded: false,
      showModal: false,
      editing: null,
      form: {},
    };
  },

  computed: {
    projects() {
      return Store.state.projects
        .filter(p => p.status !== 'cancelled')
        .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    },

    filteredPurchases() {
      let list = Store.state.purchases.filter(p => p.status !== 'cancelled');
      if (this.filterProject) list = list.filter(p => p.project_id === this.filterProject);
      if (this.filterCategory) list = list.filter(p => (p.proc_category || 'normal') === this.filterCategory);
      if (this.filterStatus) list = list.filter(p => p.status === this.filterStatus);
      if (this.hideConcluded) list = list.filter(p => !this.isConcluded(p));
      return list;
    },

    groupedPurchases() {
      return ['urgente', 'normal']
        .map(cat => ({
          cat,
          items: this.filteredPurchases.filter(p => (p.proc_category || 'normal') === cat),
        }))
        .filter(g => g.items.length > 0);
    },
  },

  methods: {
    openEdit(purchase) {
      this.editing = purchase;
      this.form = {
        proc_category: purchase.proc_category || 'normal',
        ms_rc:         purchase.ms_rc         || '',
        ms_et:         purchase.ms_et         || '',
        ms_invitation: purchase.ms_invitation || '',
        ms_proposals:  purchase.ms_proposals  || '',
        ms_analysis:   purchase.ms_analysis   || '',
        ms_po:         purchase.ms_po         || '',
        real_rc:       purchase.real_rc        || purchase.request_date || '',
        real_invitation: purchase.real_invitation || '',
        real_proposals:  purchase.real_proposals  || '',
        real_analysis:   purchase.real_analysis   || '',
        real_po:         purchase.real_po         || purchase.po_date   || '',
      };
      this.showModal = true;
    },

    closeModal() { this.showModal = false; this.editing = null; },

    save() {
      Store.updatePurchase(this.editing.id, { ...this.form });
      this.showModal = false;
      this.editing = null;
    },

    isConcluded(p) { return !!(p.real_po || p.po_date); },

    projectName(id) { return Store.getProject(id)?.name || '—'; },

    consultantFirst(pid) {
      const n = Store.getProject(pid)?.responsible || '';
      return n ? n.split(' ')[0] : '—';
    },

    buyerFirst(id) {
      const b = Store.state.buyers.find(b => b.id === id);
      return b?.name?.split(' ')[0] || '—';
    },

    fc(v) { return formatCurrency(v); },
    fd(d) { return d ? formatDate(d) : '—'; },
    statusLabel, statusColor,

    daysDiff(msDate, realDate) {
      if (!msDate || !realDate) return null;
      // negativo = atraso (real depois do planejado), positivo = adiantado
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

    deltaHint(days) {
      if (days === null) return '';
      if (days === 0) return 'No prazo';
      if (days < 0) return `${Math.abs(days)} dia(s) de atraso`;
      return `${days} dia(s) adiantado`;
    },

    deltaHintStyle(days) {
      if (days === null) return '';
      if (days < 0) return 'color:var(--danger)';
      return 'color:var(--green)';
    },
  },
};
