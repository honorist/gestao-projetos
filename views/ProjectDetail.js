window.ProjectDetailView = {
  template: `
    <div class="page">
      <div class="back-btn" @click="$router.push('/projects')">← Projetos</div>

      <div v-if="!project">
        <p class="text-muted">Projeto não encontrado.</p>
      </div>

      <template v-if="project">
        <div class="page-header">
          <div>
            <h1>{{ project.name }}</h1>
            <div style="display:flex;align-items:center;gap:8px;margin-top:6px">
              <span v-if="project.number" class="badge badge-gray">{{ project.number }}</span>
              <span :class="'badge badge-' + statusColor(project.status)">{{ statusLabel(project.status) }}</span>
              <span class="badge badge-gray">{{ statusLabel(project.fel_phase) }}</span>
            </div>
          </div>
          <button class="btn btn-secondary btn-sm" @click="editMode = !editMode">{{ editMode ? 'Cancelar' : '✏️ Editar' }}</button>
        </div>

        <!-- Edit form -->
        <div v-if="editMode" class="form-panel">
          <div class="form-panel-title">Editar Projeto</div>
          <div class="form-section-title">Informação Geral do Projeto</div>
          <div class="form-row-3">
            <div class="form-group"><label class="form-label">Nome *</label><input class="form-control" v-model="form.name"></div>
            <div class="form-group"><label class="form-label">Número</label><input class="form-control" v-model="form.number"></div>
            <div class="form-group"><label class="form-label">PEP</label><input class="form-control" :value="form.pep" @input="onPepInput" placeholder="504-E.24.2.00044.452"></div>
          </div>
          <div class="form-row-3">
            <div class="form-group">
              <label class="form-label">Unidade</label>
              <select class="form-control" v-model="form.unit">
                <option value="">— Selecione —</option>
                <option value="G1">G1</option><option value="G2">G2</option>
                <option value="Defapa">Defapa</option><option value="Outros">Outros</option>
              </select>
            </div>
            <div class="form-group"><label class="form-label">Local</label><input class="form-control" v-model="form.location"></div>
            <div class="form-group"><label class="form-label">Orçamento ($)</label><input class="form-control" type="number" v-model="form.budget"></div>
          </div>
          <div class="form-row-3">
            <div class="form-group">
              <label class="form-label">Status</label>
              <select class="form-control" v-model="form.status">
                <option value="planning">Planejamento</option><option value="active">Ativo</option>
                <option value="on_hold">Pausado</option><option value="completed">Concluído</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Fase</label>
              <select class="form-control" v-model="form.fel_phase">
                <option value="FEL1">FEL 1</option><option value="FEL2">FEL 2</option>
                <option value="FEL3">FEL 3</option><option value="execution">Execução</option>
                <option value="closeout">Encerramento</option>
              </select>
            </div>
            <div class="form-group"><label class="form-label">% Concluído</label><input class="form-control" type="number" min="0" max="100" v-model="form.progress_pct"></div>
          </div>
          <div class="form-row-3">
            <div class="form-group"><label class="form-label">Início</label><input class="form-control" type="date" v-model="form.start_date"></div>
            <div class="form-group"><label class="form-label">Fim Previsto</label><input class="form-control" type="date" v-model="form.planned_end_date"></div>
            <div class="form-group"><label class="form-label">Fim Real</label><input class="form-control" type="date" v-model="form.actual_end_date"></div>
          </div>

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
                <option v-for="c in engCoordinators" :key="c.id" :value="c.name">{{ c.name }}</option>
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
            <div class="form-group"><label class="form-label">Manutenção</label><input class="form-control" v-model="form.maintenance"></div>
            <div class="form-group"><label class="form-label">Operação</label><input class="form-control" v-model="form.operations"></div>
            <div class="form-group"><label class="form-label">Segurança</label><input class="form-control" v-model="form.safety"></div>
          </div>
          <div class="form-row-3">
            <div class="form-group"><label class="form-label">Meio Ambiente</label><input class="form-control" v-model="form.environment"></div>
          </div>

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

          <div class="form-section-title">Informações do Projeto</div>
          <div class="form-row-1"><div class="form-group"><label class="form-label">Objetivo</label><textarea class="form-control" v-model="form.objective" rows="2"></textarea></div></div>
          <div class="form-row-1"><div class="form-group"><label class="form-label">Escopo</label><textarea class="form-control" v-model="form.scope" rows="2"></textarea></div></div>
          <div class="form-row-1"><div class="form-group"><label class="form-label">Benefício</label><textarea class="form-control" v-model="form.benefit" rows="2"></textarea></div></div>
          <div class="form-row-1"><div class="form-group"><label class="form-label">Notas</label><textarea class="form-control" v-model="form.notes" rows="2"></textarea></div></div>
          <div class="form-actions">
            <button class="btn btn-primary" @click="saveProject">Salvar</button>
            <button class="btn btn-secondary" @click="editMode = false">Cancelar</button>
          </div>
        </div>

        <!-- Tabs -->
        <div class="tabs">
          <button v-for="t in tabs" :key="t.key" class="tab-btn" :class="{ active: activeTab === t.key }" @click="activeTab = t.key">
            {{ t.label }}
          </button>
        </div>

        <!-- TAB: VISÃO GERAL -->
        <div v-if="activeTab === 'overview'">
          <!-- Identificação -->
          <div class="card" style="margin-bottom:16px">
            <div class="section-title" style="margin-bottom:12px">Identificação</div>
            <div class="info-grid">
              <div class="info-item"><div class="info-label">PEP</div><div class="info-value text-bold">{{ project.pep || '—' }}</div></div>
              <div class="info-item"><div class="info-label">Número</div><div class="info-value">{{ project.number || '—' }}</div></div>
              <div class="info-item"><div class="info-label">Orçamento</div><div class="info-value text-bold text-green">{{ fc(project.budget) }}</div></div>
              <div class="info-item"><div class="info-label">Unidade</div><div class="info-value">{{ project.unit || '—' }}</div></div>
              <div class="info-item"><div class="info-label">Local</div><div class="info-value">{{ project.location || '—' }}</div></div>
              <div class="info-item"><div class="info-label">Início</div><div class="info-value">{{ formatDate(project.start_date) }}</div></div>
              <div class="info-item"><div class="info-label">Fim Previsto</div><div class="info-value">{{ formatDate(project.planned_end_date) }}</div></div>
              <div class="info-item"><div class="info-label">Fim Real</div><div class="info-value">{{ formatDate(project.actual_end_date) }}</div></div>
              <div class="info-item">
                <div class="info-label">% Concluído</div>
                <div class="info-value" style="display:flex;align-items:center;gap:8px">
                  <div class="progress-bar" style="width:80px"><div class="progress-fill" :style="'width:' + project.progress_pct + '%'"></div></div>
                  {{ project.progress_pct || 0 }}%
                </div>
              </div>
            </div>
          </div>

          <!-- Responsáveis -->
          <div class="card" style="margin-bottom:16px">
            <div class="section-title" style="margin-bottom:12px">Responsáveis</div>
            <div class="info-grid">
              <div class="info-item"><div class="info-label">Responsável</div><div class="info-value">{{ project.responsible || '—' }}</div></div>
              <div class="info-item"><div class="info-label">Coordenador de Engenharia</div><div class="info-value">{{ project.coordinator || '—' }}</div></div>
              <div class="info-item"><div class="info-label">Gerente Solicitante</div><div class="info-value">{{ project.manager_requestor || '—' }}</div></div>
              <div class="info-item"><div class="info-label">Manutenção</div><div class="info-value">{{ project.maintenance || '—' }}</div></div>
              <div class="info-item"><div class="info-label">Operação</div><div class="info-value">{{ project.operations || '—' }}</div></div>
              <div class="info-item"><div class="info-label">Segurança</div><div class="info-value">{{ project.safety || '—' }}</div></div>
              <div class="info-item"><div class="info-label">Meio Ambiente</div><div class="info-value">{{ project.environment || '—' }}</div></div>
            </div>
          </div>

          <!-- Equipe de Implantação -->
          <div class="card" style="margin-bottom:16px">
            <div class="section-title" style="margin-bottom:12px">🏗️ Equipe de Implantação</div>
            <div class="info-grid">
              <div class="info-item"><div class="info-label">EIA</div><div class="info-value">{{ project.impl_eia || '—' }}</div></div>
              <div class="info-item"><div class="info-label">Mecânica</div><div class="info-value">{{ project.impl_mecanica || '—' }}</div></div>
              <div class="info-item"><div class="info-label">Civil</div><div class="info-value">{{ project.impl_civil || '—' }}</div></div>
              <div class="info-item"><div class="info-label">Tec. Segurança</div><div class="info-value">{{ project.impl_seguranca || '—' }}</div></div>
              <div class="info-item"><div class="info-label">Tec. Meio Ambiente</div><div class="info-value">{{ project.impl_meio_ambiente || '—' }}</div></div>
            </div>
          </div>

          <!-- Objetivo / Escopo / Benefício -->
          <div class="card" style="margin-bottom:16px">
            <div class="section-title" style="margin-bottom:12px">Justificativa</div>
            <div style="display:flex;flex-direction:column;gap:20px">
              <div v-if="project.objective">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
                  <span style="background:var(--green);color:#fff;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;padding:3px 10px;border-radius:20px">Objetivo</span>
                </div>
                <div style="white-space:pre-wrap;font-size:14px;color:var(--text);padding-left:4px">{{ project.objective }}</div>
              </div>
              <div v-if="project.scope">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
                  <span style="background:var(--info);color:#fff;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;padding:3px 10px;border-radius:20px">Escopo</span>
                </div>
                <div style="white-space:pre-wrap;font-size:14px;color:var(--text);padding-left:4px">{{ project.scope }}</div>
              </div>
              <div v-if="project.benefit">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
                  <span style="background:var(--warning);color:#fff;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;padding:3px 10px;border-radius:20px">Benefício</span>
                </div>
                <div style="white-space:pre-wrap;font-size:14px;color:var(--text);padding-left:4px">{{ project.benefit }}</div>
              </div>
              <div v-if="!project.objective && !project.scope && !project.benefit" class="text-muted text-sm">
                Nenhuma justificativa preenchida.
              </div>
            </div>
          </div>

          <div v-if="project.notes" class="card">
            <div class="info-label" style="margin-bottom:4px">Notas</div>
            <div style="white-space:pre-wrap;font-size:13px;color:var(--text-mid)">{{ project.notes }}</div>
          </div>
        </div>

        <!-- TAB: FINANCEIRO -->
        <div v-if="activeTab === 'financial'">
          <div class="grid-5" style="margin-bottom:20px">
            <div class="fin-card fc-budget">
              <div class="fin-label">Orçamento</div>
              <div class="fin-value">{{ fc(fin.budget) }}</div>
            </div>
            <div class="fin-card fc-committed">
              <div class="fin-label">Compromissado</div>
              <div class="fin-value">{{ fc(fin.committed) }}</div>
              <div class="card-sub">RCs em andamento</div>
            </div>
            <div class="fin-card fc-forecast">
              <div class="fin-label">Previsão de Uso</div>
              <div class="fin-value">{{ fc(fin.forecast) }}</div>
              <div class="card-sub">Não iniciadas</div>
            </div>
            <div class="fin-card fc-actual">
              <div class="fin-label">Realizado</div>
              <div class="fin-value">{{ fc(fin.actual) }}</div>
              <div class="card-sub">Recebido / pago</div>
            </div>
            <div class="fin-card fc-balance" :class="fin.balance < 0 ? 'negative' : ''">
              <div class="fin-label">Saldo</div>
              <div class="fin-value">{{ fc(fin.balance) }}</div>
              <div class="card-sub">{{ fin.pct_used.toFixed(1) }}% comprometido</div>
            </div>
          </div>

          <!-- Curva S Chart -->
          <div class="chart-wrap" style="margin-bottom:20px">
            <div class="chart-title">Curva S — Desembolso Acumulado do Projeto</div>
            <canvas ref="scurveChart" style="max-height:196px"></canvas>
            <div v-if="!hasSCurve" style="text-align:center;padding:40px;color:var(--text-muted)">
              Adicione dados mensais abaixo para gerar a Curva S.
            </div>
          </div>

          <!-- Totals -->
          <div v-if="hasSCurve" class="grid-3" style="margin-bottom:20px">
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

          <!-- Data entry -->
          <div class="scurve-table-wrap">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
              <div class="section-title" style="margin-bottom:0">Dados Mensais da Curva S</div>
              <button class="btn btn-secondary btn-sm" @click="addSCurveRow">+ Adicionar Mês</button>
            </div>
            <div v-if="sCurveRows.length === 0" style="color:var(--text-muted);font-size:13px;padding:8px 0">
              Nenhum mês cadastrado. Clique em "+ Adicionar Mês" para iniciar.
            </div>
            <!-- Month cards -->
            <div v-for="(row, i) in sCurveRows" :key="i"
              style="border:1px solid var(--border);border-radius:8px;margin-bottom:10px;overflow:hidden">
              <!-- Header: month, baseline, delete -->
              <div style="display:grid;grid-template-columns:160px 1fr 36px;gap:8px;align-items:end;padding:10px 12px;background:var(--bg)">
                <div>
                  <div class="form-label" style="font-size:11px;margin-bottom:3px">Mês</div>
                  <input type="month" v-model="row.month" class="form-control" style="padding:5px 8px;font-size:13px" @change="saveSCurve">
                </div>
                <div>
                  <div class="form-label" style="font-size:11px;margin-bottom:3px;color:#1D6B3F">Linha de Base ($)</div>
                  <input type="number" v-model="row.baseline" placeholder="0" class="form-control"
                    style="padding:5px 8px;font-size:13px;border-color:#C8E6C9" @change="saveSCurve">
                </div>
                <button class="btn-icon" style="margin-bottom:2px" @click="removeSCurveRow(i)">🗑️</button>
              </div>
              <!-- Trend items: one purchase per line -->
              <div style="padding:10px 12px;border-top:1px solid var(--border)">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                  <div style="display:flex;gap:16px">
                    <div style="font-size:12px;font-weight:600;color:#E65100">Tendência: {{ fc(rowTrend(row)) }}</div>
                    <div style="font-size:12px;font-weight:600;color:#1565C0">Realizado: {{ fc(rowActual(row)) }}</div>
                  </div>
                  <button class="btn btn-ghost btn-sm" style="font-size:12px;padding:3px 10px" @click="addTrendItem(i)">+ Compra</button>
                </div>
                <div v-if="!row.trend_items || row.trend_items.length === 0"
                  style="font-size:12px;color:var(--text-muted);padding:4px 0">
                  Nenhuma compra vinculada. Clique em "+ Compra" para adicionar.
                </div>
                <!-- Column labels -->
                <div v-if="row.trend_items && row.trend_items.length > 0"
                  style="display:grid;grid-template-columns:1fr 115px 115px 28px;gap:6px;margin-bottom:4px;padding:0 2px">
                  <div style="font-size:11px;color:var(--text-muted)">Compra</div>
                  <div style="font-size:11px;color:#E65100">Tendência ($)</div>
                  <div style="font-size:11px;color:#1565C0">Realizado ($)</div>
                  <div></div>
                </div>
                <div v-for="(ti, j) in (row.trend_items || [])" :key="j"
                  style="display:grid;grid-template-columns:1fr 115px 115px 28px;gap:6px;align-items:center;margin-bottom:6px">
                  <select class="form-control" v-model="ti.purchase_id" style="font-size:12px;padding:4px 8px" @change="saveSCurve">
                    <option value="">— Selecione —</option>
                    <optgroup label="Compras">
                      <option v-for="p in projectPurchases" :key="p.id" :value="p.id">{{ purchaseOptionLabel(p) }}</option>
                    </optgroup>
                    <optgroup label="Rateios" v-if="projectRateios.length > 0">
                      <option v-for="r in projectRateios" :key="'rateio:'+r.id" :value="'rateio:'+r.id">{{ rateioOptionLabel(r) }}</option>
                    </optgroup>
                  </select>
                  <input type="number" v-model="ti.value" placeholder="0" class="form-control"
                    style="font-size:12px;padding:4px 8px;border-color:#FFE0B2" @change="saveSCurve">
                  <input type="number" v-model="ti.actual" placeholder="0" class="form-control"
                    style="font-size:12px;padding:4px 8px;border-color:#BBDEFB"
                    :disabled="isFutureMonth(row.month)"
                    :style="isFutureMonth(row.month) ? 'font-size:12px;padding:4px 8px;border-color:#BBDEFB;background:var(--bg);color:var(--text-muted);cursor:not-allowed' : 'font-size:12px;padding:4px 8px;border-color:#BBDEFB'"
                    @change="saveSCurve">
                  <button class="btn-icon" style="font-size:14px;line-height:1" @click="removeTrendItem(i, j)">✕</button>
                </div>
              </div>
            </div>
            <div v-if="sCurveRows.length > 0" style="margin-top:12px">
              <button class="btn btn-primary btn-sm" @click="saveSCurve">Salvar</button>
            </div>
          </div>
        </div>

        <!-- TAB: COMPRAS -->
        <div v-if="activeTab === 'purchases'">
          <div style="display:flex;justify-content:flex-end;margin-bottom:14px">
            <button class="btn btn-primary btn-sm" @click="newPurchase">+ Nova Compra</button>
          </div>
          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th>Nº</th><th>Descrição</th><th>Comprador</th>
                  <th>Status</th><th class="text-right">Valor</th>
                  <th>Previsão Chegada</th><th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="projectPurchases.length === 0">
                  <td colspan="7" class="empty-row">Nenhuma compra cadastrada para este projeto</td>
                </tr>
                <tr v-for="p in projectPurchases" :key="p.id"
                  class="clickable"
                  :class="isOverdue(p.expected_arrival_date) && !['received','cancelled'].includes(p.status) ? 'row-overdue' : ''"
                  @click="$router.push('/purchases/' + p.id)">
                  <td class="text-sm text-muted">{{ p.number || '—' }}</td>
                  <td style="font-weight:600">{{ p.description || '—' }}</td>
                  <td>{{ buyerName(p.buyer_id) }}</td>
                  <td><span :class="'badge badge-' + statusColor(p.status)">{{ statusLabel(p.status) }}</span></td>
                  <td class="text-right">{{ fc(purchaseValue(p)) }}</td>
                  <td :class="isOverdue(p.expected_arrival_date) && !['received','cancelled'].includes(p.status) ? 'text-red text-bold' : ''">
                    {{ formatDate(p.expected_arrival_date) }}
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Rateios -->
          <div v-if="projectRateios.length > 0" style="margin-top:24px">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
              <div class="section-title" style="margin:0">⚖️ Rateios Vinculados</div>
              <span class="badge badge-gray">{{ projectRateios.length }}</span>
            </div>
            <div class="table-wrap">
              <table class="table">
                <thead>
                  <tr>
                    <th>Mês</th><th>Descrição</th><th>RC</th><th>PO</th>
                    <th>Fornecedor</th><th class="text-right">Valor Alocado ($)</th><th>%</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="r in projectRateios" :key="r.id">
                    <td style="white-space:nowrap;font-weight:600">{{ formatMonth(r.month) }}</td>
                    <td style="font-weight:600">{{ r.description || '—' }}</td>
                    <td style="font-size:12px;color:var(--text-muted)">{{ r.rc_number || '—' }}</td>
                    <td style="font-size:12px;color:var(--text-muted)">{{ r.po_number || '—' }}</td>
                    <td style="font-size:12px">{{ r.supplier || '—' }}</td>
                    <td style="text-align:right;font-weight:600">{{ fu(rateioAlloc(r)?.value || 0) }}</td>
                    <td style="font-size:12px;color:var(--text-muted)">{{ (rateioAlloc(r)?.pct || 0).toFixed(1) }}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- TAB: TAREFAS -->
        <div v-if="activeTab === 'tasks'">
          <div style="display:flex;justify-content:flex-end;margin-bottom:14px">
            <button class="btn btn-primary btn-sm" @click="showTaskForm = true">+ Nova Tarefa</button>
          </div>
          <div v-if="showTaskForm" class="form-panel">
            <div class="form-panel-title">Nova Tarefa</div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Título *</label>
                <input class="form-control" v-model="taskForm.title" placeholder="Descrição da tarefa">
              </div>
              <div class="form-group">
                <label class="form-label">Responsável</label>
                <input class="form-control" v-model="taskForm.responsible">
              </div>
            </div>
            <div class="form-row-3">
              <div class="form-group">
                <label class="form-label">Status</label>
                <select class="form-control" v-model="taskForm.status">
                  <option value="todo">A Fazer</option><option value="in_progress">Em Andamento</option>
                  <option value="blocked">Bloqueado</option><option value="done">Concluído</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Prioridade</label>
                <select class="form-control" v-model="taskForm.priority">
                  <option value="low">Baixa</option><option value="medium">Média</option>
                  <option value="high">Alta</option><option value="critical">Crítica</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Data Limite</label>
                <input class="form-control" type="date" v-model="taskForm.due_date">
              </div>
            </div>
            <div class="form-actions">
              <button class="btn btn-primary" @click="addTask">Criar</button>
              <button class="btn btn-secondary" @click="showTaskForm = false">Cancelar</button>
            </div>
          </div>

          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr><th>Tarefa</th><th>Status</th><th>Prioridade</th><th>Responsável</th><th>Vencimento</th><th></th></tr>
              </thead>
              <tbody>
                <tr v-if="projectTasks.length === 0">
                  <td colspan="6" class="empty-row">Nenhuma tarefa para este projeto</td>
                </tr>
                <tr v-for="t in projectTasks" :key="t.id">
                  <td style="font-weight:600">{{ t.title }}</td>
                  <td><span :class="'badge badge-' + statusColor(t.status)">{{ statusLabel(t.status) }}</span></td>
                  <td><span :class="'badge badge-' + statusColor(t.priority)">{{ statusLabel(t.priority) }}</span></td>
                  <td>{{ t.responsible || '—' }}</td>
                  <td :class="t.due_date && isOverdue(t.due_date) && t.status !== 'done' ? 'text-red' : ''">{{ formatDate(t.due_date) }}</td>
                  <td><button class="btn-icon" @click="deleteTask(t.id)">🗑️</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- TAB: CRONOGRAMA -->
        <div v-if="activeTab === 'cronograma'">
          <!-- Mini curva S -->
          <div class="chart-wrap" style="margin-bottom:20px">
            <div class="chart-title">Curva S — Avanço Físico do Projeto (%)</div>
            <canvas ref="schedChart" :style="hasSchedData ? 'max-height:220px' : 'display:none'"></canvas>
            <div v-if="!hasSchedData" style="text-align:center;padding:40px;color:var(--text-muted)">
              Adicione dados mensais abaixo para gerar a Curva S.
            </div>
          </div>

          <!-- Tabela de entrada -->
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
            <div class="section-title" style="margin-bottom:0">Avanço Físico Mensal (%)</div>
            <div style="display:flex;gap:8px">
              <button class="btn btn-secondary btn-sm" @click="triggerSchedImport" :title="mppServerOnline ? 'Servidor .mpp ativo' : 'Servidor .mpp offline — use .xml ou execute npm run mpp'">
                📂 Importar .mpp / .xml
                <span :style="'display:inline-block;width:7px;height:7px;border-radius:50%;margin-left:5px;background:' + (mppServerOnline ? '#4CAF50' : '#9E9E9E')"></span>
              </button>
              <button class="btn btn-secondary btn-sm" @click="addSchedRow">+ Adicionar Mês</button>
            </div>
          </div>
          <input type="file" ref="schedFileInput" accept=".mpp,.xml" style="display:none" @change="onSchedFileChange">

          <div v-if="importSuccess" class="alert alert-info" style="margin-bottom:12px">{{ importSuccess }}</div>
          <div v-if="importLoading" class="alert alert-info" style="margin-bottom:12px;display:flex;align-items:center;gap:10px">
            <div style="width:16px;height:16px;border:3px solid #C8E6C9;border-top-color:#1D6B3F;border-radius:50%;animation:spin .8s linear infinite;flex-shrink:0"></div>
            Lendo arquivo XML e calculando curva S…
          </div>
          <div v-if="importError && !importPanel && !importLoading" class="alert alert-danger" style="margin-bottom:12px;white-space:pre-line">{{ importError }}</div>

          <!-- Painel de import -->
          <div v-if="importPanel" style="border:1px solid var(--border);border-radius:10px;margin-bottom:20px;overflow:hidden">
            <div style="background:var(--bg);padding:14px 16px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
              <div style="font-weight:700;font-size:14px">📂 Importar .mpp — Curva S</div>
              <button class="btn btn-ghost btn-sm" @click="importPanel = false">✕ Fechar</button>
            </div>
            <div style="padding:16px">

              <!-- Resumo do que foi extraído do .mpp -->
              <div style="background:var(--bg);border-radius:6px;padding:10px 14px;margin-bottom:14px;font-size:13px;color:var(--text-muted)">
                Curva S calculada a partir de <strong style="color:var(--text)">{{ importRawRows.length }} meses</strong>
                extraídos das tarefas do baseline.
                Previsto distribuído linearmente por duração de baseline; Realizado pelo avanço real declarado.
              </div>

              <!-- Preview dos dados parseados -->
              <div v-if="importColMonth && importColPlanned" style="margin-bottom:14px">
                <div style="font-size:12px;font-weight:600;color:var(--text-muted);margin-bottom:6px">
                  Pré-visualização — {{ importParsed.filter(r => r.ok).length }} linhas válidas de {{ importParsed.length }}
                </div>
                <div style="max-height:220px;overflow-y:auto;border:1px solid var(--border);border-radius:6px">
                  <table class="table" style="font-size:12px;margin:0">
                    <thead style="position:sticky;top:0;background:var(--bg)">
                      <tr>
                        <th>Mês (original)</th>
                        <th>Mês (parseado)</th>
                        <th style="text-align:right">Previsto (%)</th>
                        <th style="text-align:right">Realizado (%)</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(r, i) in importParsed.slice(0, 30)" :key="i" :style="!r.ok ? 'opacity:.45' : ''">
                        <td style="font-size:11px;color:var(--text-muted)">{{ r.raw }}</td>
                        <td style="font-weight:600">{{ r.month || '—' }}</td>
                        <td class="text-right" style="color:var(--green)">{{ r.planned !== '' ? r.planned + '%' : '—' }}</td>
                        <td class="text-right" style="color:var(--info)">{{ r.actual  !== '' ? r.actual  + '%' : '—' }}</td>
                        <td>
                          <span v-if="r.ok" class="badge badge-green" style="font-size:10px">OK</span>
                          <span v-else class="badge badge-red" style="font-size:10px">Mês inválido</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div v-if="importError" class="alert alert-danger" style="margin-bottom:10px;font-size:13px">{{ importError }}</div>

              <div style="display:flex;gap:10px">
                <button class="btn btn-primary btn-sm" @click="confirmSchedImport" :disabled="!importColMonth || !importColPlanned">
                  ✅ Importar {{ importParsed.filter(r => r.ok).length }} meses
                </button>
                <button class="btn btn-secondary btn-sm" @click="importPanel = false">Cancelar</button>
              </div>
            </div>
          </div>

          <div v-if="scheduleRows.length === 0" style="color:var(--text-muted);font-size:13px;padding:8px 0">
            Nenhum mês cadastrado. Clique em "+ Adicionar Mês" para iniciar.
          </div>

          <div class="table-wrap" v-if="scheduleRows.length > 0">
            <table class="table" style="table-layout:fixed;width:100%">
              <colgroup>
                <col style="width:110px">
                <col style="width:160px">
                <col style="width:160px">
                <col style="width:120px">
                <col>
                <col style="width:40px">
              </colgroup>
              <thead>
                <tr>
                  <th>Mês</th>
                  <th style="text-align:right">Previsto (%)</th>
                  <th style="text-align:right">Realizado (%)</th>
                  <th style="text-align:right">Desvio (pp)</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in scheduleRows" :key="row.month">
                  <td style="font-weight:600;white-space:nowrap">{{ formatMonth(row.month) }}</td>
                  <td>
                    <input type="number" min="0" max="100" step="0.1"
                      :value="row.planned" placeholder="0.0" class="form-control"
                      style="padding:4px 8px;font-size:13px;text-align:right;border-color:#C8E6C9"
                      @change="e => saveSchedRow(row.month, 'planned', e.target.value)">
                  </td>
                  <td>
                    <input type="number" min="0" max="100" step="0.1"
                      :value="row.actual" placeholder="—" class="form-control"
                      :disabled="row.month > currentMonth"
                      style="padding:4px 8px;font-size:13px;text-align:right;border-color:#BBDEFB"
                      :style="row.month > currentMonth ? 'background:var(--bg);color:var(--text-muted);cursor:not-allowed;border-color:#BBDEFB' : 'border-color:#BBDEFB'"
                      @change="e => saveSchedRow(row.month, 'actual', e.target.value)">
                  </td>
                  <td class="text-right" style="font-weight:700"
                    :style="devStyle(row.planned !== '' && row.actual !== '' && row.actual !== null ? numberInput(row.actual) - numberInput(row.planned) : null)">
                    {{ row.planned !== '' && row.actual !== '' && row.actual !== null
                      ? ((numberInput(row.actual) - numberInput(row.planned)) > 0 ? '+' : '') + (numberInput(row.actual) - numberInput(row.planned)).toFixed(1) + ' pp'
                      : '—' }}
                  </td>
                  <td>
                    <span v-if="row.planned !== '' && row.actual !== '' && row.actual !== null"
                      class="badge" :class="devBadge(numberInput(row.actual) - numberInput(row.planned))">
                      {{ devLabel(numberInput(row.actual) - numberInput(row.planned)) }}
                    </span>
                    <span v-else class="text-muted text-sm">—</span>
                  </td>
                  <td>
                    <button class="btn-icon" @click="removeSchedRow(row.month)">🗑️</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </template>
    </div>
  `,
  data() {
    return {
      activeTab: 'overview', editMode: false, form: {},
      sCurveRows: [], showTaskForm: false,
      taskForm: { title: '', responsible: '', status: 'todo', priority: 'medium', due_date: '' },
      chartInstance: null, schedChartInstance: null,
      importPanel: false, importHeaders: [], importRawRows: [],
      importColMonth: '', importColPlanned: '', importColActual: '',
      importError: '', importSuccess: '', importLoading: false,
      mppServerOnline: false,
      tabs: [
        { key: 'overview',    label: '📋 Visão Geral' },
        { key: 'financial',   label: '💰 Financeiro' },
        { key: 'purchases',   label: '🛒 Compras' },
        { key: 'tasks',       label: '✅ Tarefas' },
        { key: 'cronograma',  label: '📅 Cronograma' },
      ]
    };
  },
  computed: {
    consultants() { return [...Store.state.consultants].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')); },
    managers() { return [...Store.state.managers].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')); },
    engCoordinators() { return [...Store.state.coordinators].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')); },
    implantadores() { return [...(Store.state.implantadores || [])].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')); },
    implBySpec() {
      const all = this.implantadores;
      return key => all.filter(p => p.specialty === key);
    },
    project() { return Store.getProject(this.$route.params.id); },
    fin() { return Store.getProjectFinancials(this.$route.params.id); },
    projectPurchases() { return Store.getPurchasesByProject(this.$route.params.id); },
    projectTasks() { return Store.state.tasks.filter(t => t.project_id === this.$route.params.id); },
    projectRateios() {
      const pid = this.$route.params.id;
      return (Store.state.rateios || [])
        .filter(r => r.allocations && r.allocations.some(a => a.project_id === pid))
        .sort((a, b) => b.month.localeCompare(a.month));
    },
    hasSCurve() { return this.sCurveRows.length > 0; },
    totalBaseline() { return this.sCurveRows.reduce((s, r) => s + numberInput(r.baseline), 0); },
    totalTrend()    { return this.sCurveRows.reduce((s, r) => s + this.rowTrend(r), 0); },
    totalActual()   { return this.sCurveRows.reduce((s, r) => s + this.rowActual(r), 0); },
    scheduleRows() {
      return [...(this.project?.schedule || [])].sort((a, b) => a.month.localeCompare(b.month));
    },
    hasSchedData() { return this.scheduleRows.length > 0; },
    currentMonth() {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
    },
    importParsed() {
      if (!this.importColMonth) return [];
      return this.importRawRows.map(row => {
        const rawMonth   = row[this.importColMonth];
        const rawPlanned = row[this.importColPlanned] ?? '';
        const rawActual  = row[this.importColActual]  ?? '';
        // MPP data comes already as YYYY-MM / number — parseMonth handles both
        const month   = this.parseMonth(rawMonth);
        const planned = rawPlanned !== '' ? parseFloat(String(rawPlanned).replace(',', '.').replace('%','')) : '';
        const actual  = rawActual  !== '' ? parseFloat(String(rawActual ).replace(',', '.').replace('%','')) : '';
        return {
          raw: rawMonth, month,
          planned: isNaN(planned) ? '' : planned,
          actual:  isNaN(actual)  ? '' : actual,
          ok: !!month
        };
      }).filter(r => r.raw !== undefined && r.raw !== '');
    },
  },
  watch: {
    activeTab(val) {
      if (val === 'financial')  this.$nextTick(() => this.renderChart());
      if (val === 'cronograma') this.$nextTick(() => this.renderSchedChart());
    },
  },
  methods: {
    fc(v) { return formatCurrency(v); },
    numberInput(v) { return numberInput(v); },
    statusLabel, statusColor, formatDate, isOverdue, formatMonth,
    formatDatetime(s) { if (!s) return '—'; return new Date(s).toLocaleDateString('pt-BR') + ' ' + new Date(s).toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' }); },
    buyerName(id) { return Store.state.buyers.find(b => b.id === id)?.name || '—'; },
    purchaseValue(p) { return p.actual_value || p.approved_value || p.quote_value || p.estimated_value || 0; },

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
    saveProject() {
      if (!this.form.name?.trim()) { alert('Nome obrigatório'); return; }
      Store.updateProject(this.project.id, this.form);
      this.editMode = false;
      this.loadSCurveRows();
    },

    addSCurveRow() {
      const months = this.sCurveRows.map(r => r.month).filter(Boolean).sort();
      let next = '';
      if (months.length > 0) {
        const [y, m] = months[months.length - 1].split('-').map(Number);
        const nm = m === 12 ? 1 : m + 1;
        const ny = m === 12 ? y + 1 : y;
        next = `${ny}-${String(nm).padStart(2, '0')}`;
      }
      this.sCurveRows.push({ month: next, baseline: 0, trend_items: [], actual: 0 });
    },

    removeSCurveRow(i) { this.sCurveRows.splice(i, 1); this.saveSCurve(); },

    saveSCurve() {
      const sorted = [...this.sCurveRows]
        .filter(r => r.month)
        .sort((a, b) => a.month.localeCompare(b.month))
        .map(r => ({
          month: r.month,
          baseline: numberInput(r.baseline),
          trend_items: (r.trend_items || []).map(ti => ({ purchase_id: ti.purchase_id, value: numberInput(ti.value), actual: numberInput(ti.actual) })),
        }));
      Store.updateProject(this.project.id, { disbursements: sorted });
      this.$nextTick(() => this.renderChart());
    },

    loadSCurveRows() {
      this.sCurveRows = (this.project?.disbursements || []).map(e => ({
        ...e,
        trend_items: e.trend_items
          ? e.trend_items.map(ti => ({ purchase_id: ti.purchase_id || '', value: ti.value || 0, actual: ti.actual || 0 }))
          : (e.trend ? [{ purchase_id: '', value: e.trend, actual: e.actual || 0 }] : [])
      }));
    },

    renderChart() {
      const canvas = this.$refs.scurveChart;
      if (!canvas || this.sCurveRows.length === 0) {
        if (this.chartInstance) { this.chartInstance.destroy(); this.chartInstance = null; }
        return;
      }
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const sorted = [...this.sCurveRows].filter(r => r.month).sort((a, b) => a.month.localeCompare(b.month));
      let cumBase = 0, cumTrend = 0, cumActual = 0, lastActual = 0, futureTrend = 0;
      const labels = [], baseline = [], trend = [], actual = [], projection = [];
      sorted.forEach(r => {
        const mTrend = this.rowTrend(r);
        cumBase  += numberInput(r.baseline);
        cumTrend += mTrend;
        const isFuture = r.month > currentMonth;
        if (r.month < currentMonth) {
          cumActual += this.rowActual(r);
          lastActual = cumActual;
          actual.push(cumActual || null);
          projection.push(null);
        } else if (r.month === currentMonth) {
          cumActual += this.rowActual(r);
          lastActual = cumActual;
          actual.push(cumActual || null);
          projection.push(cumActual || null); // ponto de conexão
        } else {
          futureTrend += mTrend;
          actual.push(null);
          projection.push(lastActual + futureTrend);
        }
        labels.push(formatMonth(r.month));
        baseline.push(cumBase);
        trend.push(cumTrend);
      });
      if (this.chartInstance) { this.chartInstance.destroy(); this.chartInstance = null; }
      this.chartInstance = new Chart(canvas, {
        type: 'line',
        data: {
          labels,
          datasets: [
            { label: 'Linha de Base',        data: baseline,   borderColor: '#1D6B3F', backgroundColor: 'rgba(29,107,63,.08)', borderWidth: 2.5, tension: .35, fill: false, pointRadius: 4, pointBackgroundColor: '#1D6B3F' },
            { label: 'Tendência',            data: trend,      borderColor: '#FF9800', backgroundColor: 'rgba(255,152,0,.08)', borderWidth: 2, tension: .35, fill: false, pointRadius: 4, pointBackgroundColor: '#FF9800', borderDash: [6, 4] },
            { label: 'Realizado',            data: actual,     borderColor: '#1976D2', backgroundColor: 'rgba(25,118,210,.1)', borderWidth: 2.5, tension: .35, fill: false, pointRadius: 5, pointBackgroundColor: '#1976D2', spanGaps: false },
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
    },

    purchaseSaldo(p) {
      const disbursed = this.sCurveRows.reduce((s, row) =>
        s + (row.trend_items || []).filter(ti => ti.purchase_id === p.id).reduce((ts, ti) => ts + numberInput(ti.actual), 0), 0);
      return (p.approved_value || 0) - disbursed;
    },

    purchaseOptionLabel(p) {
      const parts = [
        p.number   ? 'RC: ' + p.number   : '',
        p.po_number ? 'PO: ' + p.po_number : '',
        p.description || '',
        p.supplier || '',
      ].filter(Boolean).join(' · ');
      const saldo = this.purchaseSaldo(p);
      return parts + '  (Saldo: ' + formatCurrency(saldo) + ')';
    },

    rowTrend(row) {
      const items = row.trend_items;
      if (items && items.length > 0) return items.reduce((s, ti) => s + numberInput(ti.value), 0);
      return numberInput(row.trend || 0);
    },

    rowActual(row) {
      const items = row.trend_items;
      if (items && items.length > 0) return items.reduce((s, ti) => s + numberInput(ti.actual), 0);
      return numberInput(row.actual || 0);
    },

    addTrendItem(i) {
      if (!this.sCurveRows[i].trend_items) this.sCurveRows[i].trend_items = [];
      this.sCurveRows[i].trend_items.push({ purchase_id: '', value: 0, actual: 0 });
    },

    removeTrendItem(i, j) {
      this.sCurveRows[i].trend_items.splice(j, 1);
      this.saveSCurve();
    },

    isFutureMonth(month) {
      if (!month) return false;
      const now = new Date();
      const current = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      return month > current;
    },

    fu(v) { return '$ ' + new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v || 0); },

    rateioAlloc(r) {
      return r.allocations.find(a => a.project_id === this.$route.params.id);
    },

    rateioOptionLabel(r) {
      const alloc = this.rateioAlloc(r);
      const parts = [r.description, r.supplier].filter(Boolean).join(' · ');
      return `⚖️ ${parts} — ${this.fu(alloc?.value || 0)} (${formatMonth(r.month)})`;
    },

    newPurchase() { this.$router.push({ path: '/purchases', query: { new: '1', project: this.project.id } }); },

    addTask() {
      if (!this.taskForm.title.trim()) { alert('Título obrigatório'); return; }
      Store.addTask({ ...this.taskForm, project_id: this.project.id });
      this.taskForm = { title: '', responsible: '', status: 'todo', priority: 'medium', due_date: '' };
      this.showTaskForm = false;
    },
    deleteTask(id) { if (confirm('Excluir tarefa?')) Store.deleteTask(id); },

    // ── Import .mpp / .xml (MS Project) ──────────────────────────────────────
    triggerSchedImport() { this.$refs.schedFileInput.click(); },

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
      if (doc.querySelector('parsererror')) throw new Error('XML inválido. Exporte pelo MS Project: Arquivo → Salvar como → Formato XML (*.xml).');
      const ns = 'http://schemas.microsoft.com/project';
      const byTag = (parent, tag) => {
        let els = parent.getElementsByTagNameNS(ns, tag);
        if (!els.length) els = parent.getElementsByTagName(tag);
        return els;
      };
      const getText = (el, tag) => { const f = byTag(el, tag)[0]; return f ? f.textContent.trim() : null; };
      const getDate = (el, tag) => {
        const v = getText(el, tag);
        if (!v || v === 'NA' || v.startsWith('0001-') || v.startsWith('1969-')) return null;
        const d = new Date(v); return isNaN(d) ? null : d;
      };
      const parseDur = str => {
        if (!str || str === 'PT0H0M0S') return 0;
        const m = str.match(/P(?:(\d+(?:\.\d+)?)D)?T?(?:(\d+(?:\.\d+)?)H)?/);
        return m ? parseFloat(m[1] || 0) + parseFloat(m[2] || 0) / 8 : 0;
      };
      const taskEls = byTag(doc, 'Task');
      if (!taskEls.length) throw new Error('Nenhuma tarefa encontrada. Exporte o cronograma pelo MS Project como XML.');
      const tasks = [];
      for (const el of taskEls) {
        if (getText(el, 'Summary') === '1' || getText(el, 'Milestone') === '1') continue;
        const bStart = getDate(el, 'BaselineStart'), bFinish = getDate(el, 'BaselineFinish');
        if (!bStart || !bFinish) continue;
        tasks.push({
          baselineStart: bStart, baselineFinish: bFinish,
          baselineDurationDays: parseDur(getText(el, 'BaselineDuration')),
          start: getDate(el, 'Start'), finish: getDate(el, 'Finish'),
          durationDays: parseDur(getText(el, 'Duration')),
          actualStart: getDate(el, 'ActualStart'), actualFinish: getDate(el, 'ActualFinish'),
          percentComplete: parseFloat(getText(el, 'PercentComplete') || '0'),
        });
      }
      if (tasks.length === 0) throw new Error('Nenhuma tarefa folha com baseline. Salve o baseline antes de exportar (Projeto → Definir Linha de Base).');
      return tasks;
    },

    async onSchedFileChange(e) {
      const file = e.target.files[0];
      if (!file) return;
      e.target.value = '';
      this.importError = ''; this.importSuccess = '';
      this.importPanel = false; this.importRawRows = []; this.importHeaders = [];
      this.importLoading = true;
      try {
        let curves;
        if (file.name.toLowerCase().endsWith('.mpp')) {
          curves = await this.parseMPPviaServer(file);
        } else {
          const text  = await file.text();
          const tasks = this.parseMSPDIXml(text);
          curves = this.buildMPPCurves(tasks);
        }
        this.importLoading = false;
        if (curves.length === 0) { this.importError = 'Curva S resultou em zero meses. Verifique as datas do cronograma.'; return; }
        this.importHeaders  = [{ key: 'month', label: 'Mês' }, { key: 'planned', label: 'Previsto (%)' }, { key: 'actual', label: 'Realizado (%)' }];
        this.importRawRows  = curves.map(r => ({ month: r.month, planned: r.planned !== null ? r.planned : '', actual: r.actual !== null ? r.actual : '' }));
        this.importColMonth   = 'month';
        this.importColPlanned = 'planned';
        this.importColActual  = 'actual';
        this.importPanel = true;
      } catch (err) {
        this.importLoading = false;
        this.importError = 'Erro: ' + err.message;
        console.error('[XML Import]', err);
      }
    },

    buildMPPCurves(tasks) {
      const toYM = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      const endOfMonth = ym => { const [y,m] = ym.split('-').map(Number); return new Date(y, m, 0, 23, 59, 59); };
      const spanDays = (s, f) => Math.max(1, (f - s) / 86400000);
      const lbWork  = t => t.baselineDurationDays > 0 ? t.baselineDurationDays : spanDays(t.baselineStart, t.baselineFinish);
      const curWork = t => (t.start && t.finish) ? (t.durationDays > 0 ? t.durationDays : spanDays(t.start, t.finish)) : lbWork(t);
      const overlap = (s, f, work, eom) => {
        if (s > eom) return 0; if (f <= eom) return work;
        const span = f - s; return span === 0 ? work : work * ((eom - s) / span);
      };
      const totalLB  = tasks.reduce((s, t) => s + lbWork(t), 0);
      const totalCur = tasks.reduce((s, t) => s + curWork(t), 0) || totalLB;
      if (totalLB === 0) return [];
      const monthSet = new Set();
      const addRange = (s, f) => { let d = new Date(s.getFullYear(), s.getMonth(), 1); while (d <= f) { monthSet.add(toYM(d)); d.setMonth(d.getMonth() + 1); } };
      tasks.forEach(t => {
        addRange(t.baselineStart, t.baselineFinish);
        if (t.start && t.finish) addRange(t.start, t.finish);
        if (t.actualStart) monthSet.add(toYM(t.actualStart));
        if (t.actualFinish) monthSet.add(toYM(t.actualFinish));
      });
      const today = new Date(), nowYM = toYM(today);
      return [...monthSet].sort().map(ym => {
        const eom = endOfMonth(ym);
        let cumLB = 0; tasks.forEach(t => { cumLB += overlap(t.baselineStart, t.baselineFinish, lbWork(t), eom); });
        const lb = parseFloat(Math.min(100, (cumLB / totalLB) * 100).toFixed(1));
        let cumCur = 0; tasks.forEach(t => {
          if (t.start && t.finish) cumCur += overlap(t.start, t.finish, curWork(t), eom);
          else cumCur += overlap(t.baselineStart, t.baselineFinish, lbWork(t), eom);
        });
        const planned = parseFloat(Math.min(100, (cumCur / totalCur) * 100).toFixed(1));
        let actual = null;
        if (ym <= nowYM) {
          let cumActual = 0;
          tasks.forEach(t => {
            if (!t.actualStart) return;
            cumActual += overlap(t.actualStart, t.actualFinish || today, (t.percentComplete / 100) * lbWork(t), eom);
          });
          actual = parseFloat(Math.min(100, (cumActual / totalLB) * 100).toFixed(1));
        }
        return { month: ym, lb, planned, actual };
      });
    },

    confirmSchedImport() {
      const valid = this.importParsed.filter(r => r.ok && (r.planned !== '' || r.actual !== ''));
      if (valid.length === 0) { this.importError = 'Nenhuma linha válida encontrada.'; return; }
      const existing = [...(this.project.schedule || [])];
      valid.forEach(r => {
        const idx = existing.findIndex(e => e.month === r.month);
        const entry = { month: r.month, planned: r.planned, actual: r.actual };
        if (idx >= 0) existing[idx] = entry; else existing.push(entry);
      });
      Store.updateProject(this.project.id, { ...this.project, schedule: existing });
      this.importPanel = false;
      this.importSuccess = `${valid.length} meses importados com sucesso!`;
      setTimeout(() => { this.importSuccess = ''; }, 4000);
      this.$nextTick(() => this.renderSchedChart());
    },

    parseMonth(val) {
      if (val === null || val === undefined || val === '') return null;
      if (val instanceof Date) return `${val.getFullYear()}-${String(val.getMonth()+1).padStart(2,'0')}`;
      const s = String(val).trim();
      if (/^\d{4}-\d{2}$/.test(s)) return s;
      return null; // campos month/planned/actual já vêm parseados do buildMPPCurves
    },

    // ── Cronograma ────────────────────────────────────────────────────────────
    addSchedRow() {
      const existing = (this.project.schedule || []).map(r => r.month).sort();
      let next = '';
      if (existing.length > 0) {
        const [y, m] = existing[existing.length - 1].split('-').map(Number);
        const nm = m === 12 ? 1 : m + 1;
        const ny = m === 12 ? y + 1 : y;
        next = `${ny}-${String(nm).padStart(2,'0')}`;
      } else {
        next = this.currentMonth;
      }
      const sched = [...(this.project.schedule || []), { month: next, planned: '', actual: '' }];
      Store.updateProject(this.project.id, { ...this.project, schedule: sched });
    },
    removeSchedRow(month) {
      if (!confirm('Remover mês?')) return;
      const sched = (this.project.schedule || []).filter(r => r.month !== month);
      Store.updateProject(this.project.id, { ...this.project, schedule: sched });
      this.$nextTick(() => this.renderSchedChart());
    },
    saveSchedRow(month, field, val) {
      const sched = (this.project.schedule || []).map(r =>
        r.month === month ? { ...r, [field]: val } : r
      );
      Store.updateProject(this.project.id, { ...this.project, schedule: sched });
      this.$nextTick(() => this.renderSchedChart());
    },
    devStyle(dev) {
      if (dev === null || dev === undefined) return '';
      if (dev >= -2)  return 'color:var(--green)';
      if (dev >= -10) return 'color:var(--warning)';
      return 'color:var(--danger)';
    },
    devBadge(dev) {
      if (dev === null || dev === undefined) return '';
      if (dev >= -2)  return 'badge-green';
      if (dev >= -10) return 'badge-yellow';
      return 'badge-red';
    },
    devLabel(dev) {
      if (dev === null || dev === undefined) return '—';
      if (dev >= -2)  return 'No alvo';
      if (dev >= -10) return 'Atraso';
      return 'Grande Atraso';
    },
    renderSchedChart() {
      if (this.schedChartInstance) { this.schedChartInstance.destroy(); this.schedChartInstance = null; }
      if (!this.hasSchedData) return;
      const canvas = this.$refs.schedChart;
      if (!canvas) return;
      const cm = this.currentMonth;
      const rows = this.scheduleRows;
      const labels      = rows.map(r => formatMonth(r.month));
      const plannedData = rows.map(r => r.planned !== '' && r.planned !== null ? numberInput(r.planned) : null);
      const actualData  = rows.map(r => r.month <= cm && r.actual !== '' && r.actual !== null ? numberInput(r.actual) : null);
      this.schedChartInstance = new Chart(canvas, {
        type: 'line',
        data: {
          labels,
          datasets: [
            { label: 'Previsto (%)', data: plannedData, borderColor: '#1D6B3F', backgroundColor: 'rgba(29,107,63,.08)', borderWidth: 2.5, tension: .35, fill: false, pointRadius: 3, pointBackgroundColor: '#1D6B3F' },
            { label: 'Realizado (%)', data: actualData, borderColor: '#1976D2', backgroundColor: 'rgba(25,118,210,.1)', borderWidth: 2.5, tension: .35, fill: false, pointRadius: 4, pointBackgroundColor: '#1976D2', spanGaps: false },
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top', labels: { font: { size: 12 }, usePointStyle: true } },
            tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y !== null ? ctx.parsed.y.toFixed(1) + '%' : '—'}` } }
          },
          scales: {
            x: { grid: { color: 'rgba(0,0,0,.05)' } },
            y: { min: 0, max: 100, ticks: { callback: v => v + '%' }, grid: { color: 'rgba(0,0,0,.05)' } }
          }
        }
      });
    },
  },
  created() {
    if (this.project) {
      this.form = {
        impl_eia: '', impl_mecanica: '', impl_civil: '',
        impl_seguranca: '', impl_meio_ambiente: '', coordinator: '',
        ...this.project
      };
      this.loadSCurveRows();
    }
  },
  mounted() {
    if (this.activeTab === 'financial') this.$nextTick(() => this.renderChart());
    fetch('http://localhost:3456/parse', { method: 'OPTIONS' })
      .then(() => { this.mppServerOnline = true; })
      .catch(() => { this.mppServerOnline = false; });
  },
  beforeUnmount() {
    if (this.chartInstance) this.chartInstance.destroy();
    if (this.schedChartInstance) this.schedChartInstance.destroy();
  }
};
