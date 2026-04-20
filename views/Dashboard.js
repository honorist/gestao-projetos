window.DashboardView = {
  template: `
    <div class="page" @mousemove="onMouseMove">

      <div class="page-header" style="margin-bottom:16px">
        <div>
          <h1>Gestão Carteira</h1>
          <div class="subtitle">{{ today }}</div>
        </div>
        <button class="btn btn-primary" @click="$router.push({ path: '/projects', query: { new: '1' } })">+ Novo Projeto</button>
      </div>

      <!-- Destaque Anual -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
        <div style="background:var(--green);border-radius:8px;padding:14px 20px;display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-size:11px;color:rgba(255,255,255,.75);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">Desembolso Previsto {{ currentYear }}</div>
            <div style="font-size:28px;font-weight:700;color:#fff">{{ fc(kpiAnual.previsto) }}</div>
          </div>
          <div style="font-size:36px;opacity:.4">📅</div>
        </div>
        <div style="background:var(--surface);border:2px solid var(--green);border-radius:8px;padding:14px 20px;display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">Realizado até {{ currentMonthLabel }}</div>
            <div style="font-size:28px;font-weight:700;color:var(--green)">{{ fc(kpiAnual.realizado) }}</div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:2px">{{ kpiAnual.pct.toFixed(1) }}% do previsto anual</div>
          </div>
          <div style="font-size:36px;opacity:.35">✅</div>
        </div>
      </div>

      <!-- KPI Strip -->
      <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:10px;margin-bottom:14px">
        <div v-for="k in kpiStrip" :key="k.label"
          style="background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:12px 14px">
          <div style="font-size:10px;color:var(--text-muted);margin-bottom:4px;text-transform:uppercase;letter-spacing:.5px">{{ k.label }}</div>
          <div style="font-size:20px;font-weight:700;line-height:1.1" :style="'color:' + k.color">{{ k.value }}</div>
        </div>
      </div>

      <!-- Row 1: Situação | Over Run | Over Time -->
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:12px">

        <div class="card" style="padding:16px">
          <div class="section-title" style="margin-bottom:12px">Carteira por Situação</div>
          <div v-for="b in carteiraSituacao" :key="b.label" style="margin-bottom:9px;cursor:pointer"
            @mouseenter="showTip($event, b)" @mouseleave="hideTip()" @click="openDrilldown(b)">
            <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:2px">
              <span>{{ b.label }}</span><span style="font-weight:700">{{ b.count }}</span>
            </div>
            <div style="height:10px;background:var(--bg);border-radius:5px;overflow:hidden">
              <div :style="{width: Math.max(b.pct, b.count > 0 ? 4 : 0) + '%', background: b.color, height:'100%', borderRadius:'5px', transition:'width .4s'}"></div>
            </div>
          </div>
        </div>

        <div class="card" style="padding:16px">
          <div class="section-title" style="margin-bottom:12px">Situação Over Run</div>
          <div v-for="b in overRun" :key="b.label" style="margin-bottom:9px;cursor:pointer"
            @mouseenter="showTip($event, b)" @mouseleave="hideTip()" @click="openDrilldown(b)">
            <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:2px">
              <span>{{ b.label }}</span><span style="font-weight:700">{{ b.count }}</span>
            </div>
            <div style="height:10px;background:var(--bg);border-radius:5px;overflow:hidden">
              <div :style="{width: Math.max(b.pct, b.count > 0 ? 4 : 0) + '%', background: b.color, height:'100%', borderRadius:'5px', transition:'width .4s'}"></div>
            </div>
          </div>
        </div>

        <div class="card" style="padding:16px">
          <div class="section-title" style="margin-bottom:12px">Situação Over Time</div>
          <div v-for="b in overTime" :key="b.label" style="margin-bottom:9px;cursor:pointer"
            @mouseenter="showTip($event, b)" @mouseleave="hideTip()" @click="openDrilldown(b)">
            <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:2px">
              <span>{{ b.label }}</span><span style="font-weight:700">{{ b.count }}</span>
            </div>
            <div style="height:10px;background:var(--bg);border-radius:5px;overflow:hidden">
              <div :style="{width: Math.max(b.pct, b.count > 0 ? 4 : 0) + '%', background: b.color, height:'100%', borderRadius:'5px', transition:'width .4s'}"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Row 2: Desembolso | Desvios do Mês -->
      <div style="display:grid;grid-template-columns:1.7fr 1fr;gap:12px;margin-bottom:12px">
        <div class="card" style="padding:16px">
          <div class="section-title" style="margin-bottom:10px">Desembolso por Mês</div>
          <div style="height:200px"><canvas ref="disbChart"></canvas></div>
        </div>
        <div class="card" style="padding:16px">
          <div class="section-title" style="margin-bottom:10px">Principais Desvios — {{ currentMonthLabel }}</div>
          <div style="overflow-y:auto;max-height:220px">
            <table class="table" style="font-size:12px">
              <thead><tr><th>Projeto</th><th class="text-right">Desvio</th></tr></thead>
              <tbody>
                <tr v-if="!mainDeviations.length"><td colspan="2" class="empty-row">Sem dados no mês</td></tr>
                <tr v-for="d in mainDeviations" :key="d.id" class="clickable" @click="$router.push('/projects/' + d.id)">
                  <td style="max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" :title="d.name">{{ d.name }}</td>
                  <td class="text-right" style="font-weight:700" :style="d.desvio < 0 ? 'color:var(--danger)' : 'color:var(--green)'">{{ fc(d.desvio) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Row 3: Fis/Fin | Tipo | Tendência Desvio -->
      <div style="display:grid;grid-template-columns:1fr 1fr 1.5fr;gap:12px;margin-bottom:12px">

        <div class="card" style="padding:16px">
          <div class="section-title" style="margin-bottom:12px">Situação Fis./Fin.</div>
          <div v-for="b in fisFin" :key="b.label" style="margin-bottom:9px;cursor:pointer"
            @mouseenter="showTip($event, b)" @mouseleave="hideTip()" @click="openDrilldown(b)">
            <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:2px">
              <span>{{ b.label }}</span><span style="font-weight:700">{{ b.count }}</span>
            </div>
            <div style="height:10px;background:var(--bg);border-radius:5px;overflow:hidden">
              <div :style="{width: Math.max(b.pct, b.count > 0 ? 4 : 0) + '%', background: b.color, height:'100%', borderRadius:'5px', transition:'width .4s'}"></div>
            </div>
          </div>
        </div>

        <div class="card" style="padding:16px">
          <div class="section-title" style="margin-bottom:12px">Carteira por Tipo</div>
          <div v-for="b in carteiraTipo" :key="b.label" style="margin-bottom:9px;cursor:pointer"
            @mouseenter="showTip($event, b)" @mouseleave="hideTip()" @click="openDrilldown(b)">
            <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:2px">
              <span>{{ b.label }}</span><span style="font-weight:700">{{ b.count }}</span>
            </div>
            <div style="height:10px;background:var(--bg);border-radius:5px;overflow:hidden">
              <div :style="{width: Math.max(b.pct, b.count > 0 ? 4 : 0) + '%', background: b.color, height:'100%', borderRadius:'5px', transition:'width .4s'}"></div>
            </div>
          </div>
        </div>

        <div class="card" style="padding:16px">
          <div class="section-title" style="margin-bottom:10px">Tendência de Desvio Acum.</div>
          <div style="height:180px"><canvas ref="trendChart"></canvas></div>
        </div>
      </div>

      <!-- Row 4: Pendência | Avanço Físico | Encerramento -->
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:12px">

        <div class="card" style="padding:16px">
          <div class="section-title" style="margin-bottom:12px">Pendência Atualiz. Cronograma</div>
          <div v-for="b in schedPending" :key="b.label" style="margin-bottom:9px;cursor:pointer"
            @mouseenter="showTip($event, b)" @mouseleave="hideTip()" @click="openDrilldown(b)">
            <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:2px">
              <span>{{ b.label }}</span><span style="font-weight:700">{{ b.count }}</span>
            </div>
            <div style="height:10px;background:var(--bg);border-radius:5px;overflow:hidden">
              <div :style="{width: Math.max(b.pct, b.count > 0 ? 4 : 0) + '%', background: b.color, height:'100%', borderRadius:'5px', transition:'width .4s'}"></div>
            </div>
          </div>
        </div>

        <div class="card" style="padding:16px">
          <div class="section-title" style="margin-bottom:12px">Situação Avanço Físico</div>
          <div v-for="b in physicalProgress" :key="b.label" style="margin-bottom:9px;cursor:pointer"
            @mouseenter="showTip($event, b)" @mouseleave="hideTip()" @click="openDrilldown(b)">
            <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:2px">
              <span>{{ b.label }}</span><span style="font-weight:700">{{ b.count }}</span>
            </div>
            <div style="height:10px;background:var(--bg);border-radius:5px;overflow:hidden">
              <div :style="{width: Math.max(b.pct, b.count > 0 ? 4 : 0) + '%', background: b.color, height:'100%', borderRadius:'5px', transition:'width .4s'}"></div>
            </div>
          </div>
        </div>

        <div class="card" style="padding:16px">
          <div class="section-title" style="margin-bottom:12px">Situação Encerramento</div>
          <div v-for="b in closingSituation" :key="b.label" style="margin-bottom:9px;cursor:pointer"
            @mouseenter="showTip($event, b)" @mouseleave="hideTip()" @click="openDrilldown(b)">
            <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:2px">
              <span>{{ b.label }}</span><span style="font-weight:700">{{ b.count }}</span>
            </div>
            <div style="height:10px;background:var(--bg);border-radius:5px;overflow:hidden">
              <div :style="{width: Math.max(b.pct, b.count > 0 ? 4 : 0) + '%', background: b.color, height:'100%', borderRadius:'5px', transition:'width .4s'}"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Tooltip ── -->
      <div v-if="tip && tip.rows.length"
        style="position:fixed;z-index:9999;background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:12px 14px;box-shadow:0 4px 20px rgba(0,0,0,.18);min-width:230px;max-width:300px;pointer-events:none"
        :style="{ left: tipX + 'px', top: tipY + 'px' }">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
          <div :style="{width:'10px',height:'10px',borderRadius:'50%',background:tip.color,flexShrink:0}"></div>
          <span style="font-weight:700;font-size:12px">{{ tip.label }}</span>
          <span style="font-size:11px;color:var(--text-muted);margin-left:auto">Top 5</span>
        </div>
        <div v-for="r in tip.rows" :key="r.id"
          style="display:flex;justify-content:space-between;gap:8px;font-size:12px;padding:3px 0;border-bottom:1px solid var(--bg)">
          <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text-dark)">{{ r.name }}</span>
          <span style="color:var(--text-muted);flex-shrink:0;font-size:11px">{{ r.metric }}</span>
        </div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:6px;text-align:center">Clique para ver todos</div>
      </div>

      <!-- ── Drilldown bottom sheet ── -->
      <div v-if="drilldown" style="position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9998;display:flex;align-items:flex-end" @click.self="drilldown=null">
        <div style="background:var(--surface);width:100%;max-height:65vh;overflow-y:auto;border-radius:12px 12px 0 0;padding:20px 24px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
            <div>
              <div style="font-weight:700;font-size:16px">{{ drilldown.title }}</div>
              <div style="font-size:12px;color:var(--text-muted)">{{ drilldown.rows.length }} projeto(s)</div>
            </div>
            <button @click="drilldown=null" style="border:none;background:none;font-size:22px;cursor:pointer;color:var(--text-muted);line-height:1">✕</button>
          </div>
          <div class="table-wrap">
            <table class="table" style="font-size:13px">
              <thead>
                <tr>
                  <th v-for="col in drilldown.cols" :key="col.key" :class="col.right ? 'text-right' : ''">{{ col.label }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in drilldown.rows" :key="row.id" class="clickable"
                  @click="$router.push('/projects/' + row.id); drilldown = null">
                  <td v-for="col in drilldown.cols" :key="col.key"
                    :class="col.right ? 'text-right' : ''"
                    :style="col.style ? col.style(row) : ''">
                    <span v-if="col.badge" :class="'badge badge-' + (col.badgeColor ? col.badgeColor(row) : 'gray')">{{ row[col.key] }}</span>
                    <span v-else>{{ row[col.key] }}</span>
                  </td>
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
      currentMonth: new Date().toISOString().slice(0, 7),
      _disbChart: null,
      _trendChart: null,
      tip: null,
      tipX: 0,
      tipY: 0,
      mouseX: 0,
      mouseY: 0,
      drilldown: null,
    };
  },

  computed: {
    today() {
      return new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    },
    currentMonthLabel() {
      const [y, m] = this.currentMonth.split('-');
      return new Date(+y, +m - 1, 1).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
    },
    currentYear() { return new Date().getFullYear(); },
    projects() { return Store.state.projects.filter(p => p.status !== 'cancelled'); },
    activeAndClosing() { return this.projects.filter(p => ['active', 'closing', 'on_hold'].includes(p.status)); },

    // ── KPI Anual ──────────────────────────────────────────────────────────────
    kpiAnual() {
      const year = String(this.currentYear);
      let previsto = 0, realizado = 0;
      this.projects.forEach(p => {
        (p.disbursements || []).forEach(r => {
          if (!r.month || !r.month.startsWith(year)) return;
          previsto += this.rowTrend(r);
          if (r.month <= this.currentMonth) realizado += this.rowActual(r);
        });
      });
      return { previsto, realizado, pct: previsto > 0 ? realizado / previsto * 100 : 0 };
    },

    // ── KPI Strip ──────────────────────────────────────────────────────────────
    kpiStrip() {
      const m = this.currentMonth;
      let totalTrend = 0, totalActual = 0, totalBLacum = 0, totalActualAcum = 0;
      this.projects.forEach(p => {
        (p.disbursements || []).forEach(r => {
          if (r.month === m) { totalTrend += this.rowTrend(r); totalActual += this.rowActual(r); }
          if (r.month <= m)  { totalBLacum += numberInput(r.baseline); totalActualAcum += this.rowActual(r); }
        });
      });
      const ating  = totalTrend > 0 ? (totalActual / totalTrend * 100) : 0;
      const desvio = totalActualAcum - totalBLacum;
      return [
        { label: 'Em Execução',        value: this.projects.filter(p => p.status === 'active').length,  color: 'var(--green)' },
        { label: 'Em Encerramento',    value: this.projects.filter(p => p.status === 'closing').length, color: 'var(--info)' },
        { label: 'Desemb. Mês (Prev.)',value: this.fc(totalTrend),    color: 'var(--warning)' },
        { label: 'Desvio Orçado Acum.',value: this.fc(desvio),        color: desvio < 0 ? 'var(--danger)' : 'var(--green)' },
        { label: 'Ating. Tendência',   value: ating.toFixed(1) + '%', color: ating < 90 ? 'var(--danger)' : 'var(--green)' },
        { label: 'Realizado Acum.',    value: this.fc(totalActualAcum), color: 'var(--green)' },
      ];
    },

    // ── Carteira por Situação ──────────────────────────────────────────────────
    carteiraSituacao() {
      const groups = [
        { key: 'planning', label: 'Planejamento', color: '#2196F3' },
        { key: 'active',   label: 'Execução',     color: '#1D6B3F' },
        { key: 'closing',  label: 'Encerramento', color: '#FF9800' },
        { key: 'on_hold',  label: 'Pausado',      color: '#FFC107' },
        { key: 'completed',label: 'Concluído',    color: '#607D8B' },
      ];
      const total = this.projects.length || 1;
      return groups.map(g => {
        const matched = this.projects
          .filter(p => p.status === g.key)
          .sort((a, b) => Store.getProjectFinancials(b.id).budget - Store.getProjectFinancials(a.id).budget);
        return {
          ...g,
          count: matched.length,
          pct: matched.length / total * 100,
          rows: matched.map(p => ({ id: p.id, name: p.name, metric: this.fc(Store.getProjectFinancials(p.id).budget), responsible: p.responsible || '—', status: statusLabel(p.status), fase: statusLabel(p.fel_phase) })),
          cols: [
            { key: 'name', label: 'Projeto' },
            { key: 'responsible', label: 'Responsável' },
            { key: 'fase', label: 'Fase' },
            { key: 'metric', label: 'Orçamento', right: true },
          ],
        };
      });
    },

    // ── Over Run ──────────────────────────────────────────────────────────────
    overRun() {
      const relevant = this.activeAndClosing;
      const total = relevant.length || 1;
      const buckets = [[], [], [], [], []];
      relevant.forEach(p => {
        const fin = Store.getProjectFinancials(p.id);
        const overPct = fin.budget ? (fin.forecast - fin.budget) / fin.budget * 100 : null;
        const row = { id: p.id, name: p.name, responsible: p.responsible || '—', budget: this.fc(fin.budget), forecast: this.fc(fin.forecast), desvio: overPct != null ? overPct.toFixed(1) + '%' : '—', metric: overPct != null ? overPct.toFixed(1) + '%' : 'sem orç.' };
        if (overPct == null)      buckets[0].push(row);
        else if (overPct < 0)     buckets[1].push(row);
        else if (overPct < 5)     buckets[2].push(row);
        else if (overPct < 20)    buckets[3].push(row);
        else                      buckets[4].push(row);
      });
      const cols = [
        { key: 'name', label: 'Projeto' },
        { key: 'responsible', label: 'Responsável' },
        { key: 'budget', label: 'Orçamento', right: true },
        { key: 'forecast', label: 'Previsão', right: true },
        { key: 'desvio', label: 'Desvio %', right: true },
      ];
      const defs = [
        { label: 'Sem dados',      color: '#B0BEC5' },
        { label: 'Abaixo do ORÇ', color: '#1D6B3F' },
        { label: '0–5% acima',    color: '#FFC107' },
        { label: '5–20% acima',   color: '#FF9800' },
        { label: '> 20% acima',   color: '#F44336' },
      ];
      return defs.map((d, i) => ({ ...d, count: buckets[i].length, pct: buckets[i].length / total * 100, rows: buckets[i].sort((a, b) => parseFloat(b.desvio) - parseFloat(a.desvio)), cols }));
    },

    // ── Over Time ──────────────────────────────────────────────────────────────
    overTime() {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const relevant = this.activeAndClosing;
      const total = relevant.length || 1;
      const buckets = [[], [], [], [], [], []];
      relevant.forEach(p => {
        const daysLeft = p.planned_end_date ? Math.round((new Date(p.planned_end_date + 'T00:00:00') - today) / 86400000) : null;
        const row = { id: p.id, name: p.name, responsible: p.responsible || '—', fimPrevisto: formatDate(p.planned_end_date), dias: daysLeft != null ? (daysLeft >= 0 ? '+' + daysLeft + 'd' : daysLeft + 'd') : '—', metric: daysLeft != null ? (daysLeft >= 0 ? '+' + daysLeft + 'd' : daysLeft + 'd') : 'sem data', status: statusLabel(p.status) };
        if (daysLeft == null)     buckets[5].push(row);
        else if (daysLeft > 7)    buckets[0].push(row);
        else if (daysLeft >= -7)  buckets[1].push(row);
        else if (daysLeft >= -30) buckets[2].push(row);
        else if (daysLeft >= -90) buckets[3].push(row);
        else                      buckets[4].push(row);
      });
      const cols = [
        { key: 'name', label: 'Projeto' },
        { key: 'responsible', label: 'Responsável' },
        { key: 'fimPrevisto', label: 'Fim Previsto' },
        { key: 'dias', label: 'Dias', right: true },
      ];
      const defs = [
        { label: 'Adiantado',   color: '#1D6B3F' },
        { label: 'Em Dia (±7d)',color: '#4CAF50' },
        { label: 'Atr. ≤30d',  color: '#FFC107' },
        { label: 'Atr. ≤90d',  color: '#FF9800' },
        { label: 'Atr. >90d',  color: '#F44336' },
        { label: 'Sem data',   color: '#B0BEC5' },
      ];
      return defs.map((d, i) => ({ ...d, count: buckets[i].length, pct: buckets[i].length / total * 100, rows: buckets[i].sort((a, b) => parseFloat(a.dias) - parseFloat(b.dias)), cols }));
    },

    // ── Fis / Fin ──────────────────────────────────────────────────────────────
    fisFin() {
      const relevant = this.activeAndClosing;
      const total = relevant.length || 1;
      const buckets = [[], [], [], [], []];
      relevant.forEach(p => {
        const fin    = Store.getProjectFinancials(p.id);
        const phys   = numberInput(p.progress_pct) || 0;
        const finPct = fin.pct_used || 0;
        const ratio  = finPct > 0 ? phys / finPct : (phys > 0 ? 2 : 0);
        const row = { id: p.id, name: p.name, responsible: p.responsible || '—', fisico: phys.toFixed(1) + '%', financeiro: finPct.toFixed(1) + '%', ratio: (finPct === 0 && phys === 0) ? '—' : ratio.toFixed(2), metric: (finPct === 0 && phys === 0) ? 'sem dados' : ratio.toFixed(2) };
        if (finPct === 0 && phys === 0) buckets[4].push(row);
        else if (ratio >= 1)  buckets[0].push(row);
        else if (ratio >= 0.8)buckets[1].push(row);
        else if (ratio >= 0.5)buckets[2].push(row);
        else                  buckets[3].push(row);
      });
      const cols = [
        { key: 'name', label: 'Projeto' },
        { key: 'responsible', label: 'Responsável' },
        { key: 'fisico', label: '% Físico', right: true },
        { key: 'financeiro', label: '% Financeiro', right: true },
        { key: 'ratio', label: 'Ratio', right: true },
      ];
      const defs = [
        { label: '≥ 1,0 (fís. adiantado)',  color: '#1D6B3F' },
        { label: '0,8–1,0 (equilibrado)',   color: '#4CAF50' },
        { label: '0,5–0,8 (fin. adiantado)',color: '#FFC107' },
        { label: '< 0,5 (grande desvio)',   color: '#F44336' },
        { label: 'Sem dados',               color: '#B0BEC5' },
      ];
      return defs.map((d, i) => ({ ...d, count: buckets[i].length, pct: buckets[i].length / total * 100, rows: buckets[i], cols }));
    },

    // ── Carteira por Tipo ──────────────────────────────────────────────────────
    carteiraTipo() {
      const groups = [
        { key: 'safety',      label: 'Segurança',    color: '#F44336' },
        { key: 'environment', label: 'Meio Ambiente', color: '#1D6B3F' },
        { key: 'efficiency',  label: 'Eficiência',    color: '#2196F3' },
        { key: 'other',       label: 'Outros',        color: '#9E9E9E' },
      ];
      const total = this.projects.length || 1;
      const cols = [
        { key: 'name', label: 'Projeto' },
        { key: 'responsible', label: 'Responsável' },
        { key: 'status', label: 'Status' },
        { key: 'budget', label: 'Orçamento', right: true },
      ];
      return groups.map(g => {
        const matched = this.projects.filter(p => (p.project_type || 'other') === g.key);
        return {
          ...g,
          count: matched.length,
          pct: matched.length / total * 100,
          rows: matched.map(p => ({ id: p.id, name: p.name, responsible: p.responsible || '—', status: statusLabel(p.status), budget: this.fc(Store.getProjectFinancials(p.id).budget), metric: statusLabel(p.status) })),
          cols,
        };
      });
    },

    // ── Desvios do Mês ─────────────────────────────────────────────────────────
    mainDeviations() {
      return this.projects.map(p => {
        const row = (p.disbursements || []).find(r => r.month === this.currentMonth);
        if (!row) return null;
        const baseline = numberInput(row.baseline);
        const actual   = this.rowActual(row);
        if (baseline === 0 && actual === 0) return null;
        return { id: p.id, name: p.name, desvio: actual - baseline };
      }).filter(Boolean)
        .sort((a, b) => Math.abs(b.desvio) - Math.abs(a.desvio))
        .slice(0, 10);
    },

    // ── Pendência Cronograma ──────────────────────────────────────────────────
    schedPending() {
      const relevant = this.activeAndClosing;
      const total    = relevant.length || 1;
      const cols = [
        { key: 'name', label: 'Projeto' },
        { key: 'responsible', label: 'Responsável' },
        { key: 'status', label: 'Status' },
      ];
      const withSched = relevant
        .filter(p => Array.isArray(p.schedule) && p.schedule.length > 0)
        .map(p => ({ id: p.id, name: p.name, responsible: p.responsible || '—', status: statusLabel(p.status), metric: statusLabel(p.status) }));
      const withoutSched = relevant
        .filter(p => !Array.isArray(p.schedule) || p.schedule.length === 0)
        .map(p => ({ id: p.id, name: p.name, responsible: p.responsible || '—', status: statusLabel(p.status), metric: statusLabel(p.status) }));
      return [
        { label: 'Com cronograma', color: '#1D6B3F', count: withSched.length,    pct: withSched.length    / total * 100, rows: withSched,    cols },
        { label: 'Sem cronograma', color: '#F44336', count: withoutSched.length, pct: withoutSched.length / total * 100, rows: withoutSched, cols },
      ];
    },

    // ── Avanço Físico ──────────────────────────────────────────────────────────
    physicalProgress() {
      const m        = this.currentMonth;
      const relevant = this.activeAndClosing;
      const total    = relevant.length || 1;
      const buckets  = [[], [], [], [], []];
      const cols = [
        { key: 'name', label: 'Projeto' },
        { key: 'responsible', label: 'Responsável' },
        { key: 'realPct', label: '% Real', right: true },
        { key: 'prevPct', label: '% Previsto', right: true },
        { key: 'diffStr', label: 'Desvio', right: true },
      ];
      relevant.forEach(p => {
        const actual  = numberInput(p.progress_pct) || 0;
        const sched   = p.schedule || [];
        const row     = sched.find(r => r.month === m) || sched.filter(r => r.month <= m).slice(-1)[0];
        const planned = row ? (numberInput(row.planned) || 0) : null;
        const diff    = planned != null ? actual - planned : null;
        const entry   = { id: p.id, name: p.name, responsible: p.responsible || '—', realPct: actual.toFixed(1) + '%', prevPct: planned != null ? planned.toFixed(1) + '%' : '—', diffStr: diff != null ? (diff >= 0 ? '+' : '') + diff.toFixed(1) + 'pp' : '—', metric: diff != null ? (diff >= 0 ? '+' : '') + diff.toFixed(1) + 'pp' : 'sem cron.' };
        if (planned == null)  buckets[4].push(entry);
        else if (diff > 5)    buckets[0].push(entry);
        else if (diff >= -5)  buckets[1].push(entry);
        else if (diff >= -20) buckets[2].push(entry);
        else                  buckets[3].push(entry);
      });
      const defs = [
        { label: 'Adiantado (>5pp)', color: '#1D6B3F' },
        { label: 'Em Dia (±5pp)',    color: '#4CAF50' },
        { label: 'Atr. ≤20pp',      color: '#FFC107' },
        { label: 'Atr. >20pp',      color: '#F44336' },
        { label: 'Sem cronograma',  color: '#B0BEC5' },
      ];
      return defs.map((d, i) => ({ ...d, count: buckets[i].length, pct: buckets[i].length / total * 100, rows: buckets[i], cols }));
    },

    // ── Encerramento ──────────────────────────────────────────────────────────
    closingSituation() {
      const today    = new Date(); today.setHours(0, 0, 0, 0);
      const relevant = this.activeAndClosing;
      const total    = relevant.length || 1;
      const buckets  = [[], [], [], [], []];
      const cols = [
        { key: 'name', label: 'Projeto' },
        { key: 'responsible', label: 'Responsável' },
        { key: 'fimPrevisto', label: 'Fim Previsto' },
        { key: 'diasStr', label: 'Dias', right: true },
      ];
      relevant.forEach(p => {
        const daysLeft = p.planned_end_date ? Math.round((new Date(p.planned_end_date + 'T00:00:00') - today) / 86400000) : null;
        const entry = { id: p.id, name: p.name, responsible: p.responsible || '—', fimPrevisto: formatDate(p.planned_end_date), diasStr: daysLeft != null ? daysLeft + 'd' : '—', metric: daysLeft != null ? daysLeft + 'd' : 'sem data' };
        if (daysLeft == null)    buckets[4].push(entry);
        else if (daysLeft < 30)  buckets[0].push(entry);
        else if (daysLeft < 60)  buckets[1].push(entry);
        else if (daysLeft < 90)  buckets[2].push(entry);
        else                     buckets[3].push(entry);
      });
      const defs = [
        { label: '< 30 dias (crítico)',  color: '#F44336' },
        { label: '30–60 dias (atenção)', color: '#FF9800' },
        { label: '60–90 dias (próximo)', color: '#FFC107' },
        { label: '> 90 dias',            color: '#1D6B3F' },
        { label: 'Sem data prevista',    color: '#B0BEC5' },
      ];
      return defs.map((d, i) => ({ ...d, count: buckets[i].length, pct: buckets[i].length / total * 100, rows: buckets[i].sort((a, b) => parseFloat(a.diasStr) - parseFloat(b.diasStr)), cols }));
    },
  },

  methods: {
    rowTrend(row) {
      if (!row) return 0;
      if (row.trend_items && row.trend_items.length > 0)
        return row.trend_items.reduce((s, i) => s + numberInput(i.value), 0);
      return numberInput(row.trend || row.baseline || 0);
    },
    rowActual(row) {
      if (!row) return 0;
      if (row.trend_items && row.trend_items.length > 0)
        return row.trend_items.reduce((s, i) => s + numberInput(i.actual), 0);
      return numberInput(row.actual || 0);
    },
    fc(v) { return formatCurrency(v); },

    onMouseMove(e) { this.mouseX = e.clientX; this.mouseY = e.clientY; },

    showTip(event, band) {
      if (!band.rows || !band.rows.length) return;
      const rect = event.currentTarget.getBoundingClientRect();
      const x = rect.right + 12;
      const y = rect.top - 10;
      this.tipX = x + 240 > window.innerWidth ? rect.left - 252 : x;
      this.tipY = Math.min(y, window.innerHeight - 180);
      this.tip  = { label: band.label, color: band.color, rows: band.rows.slice(0, 5) };
    },
    hideTip() { this.tip = null; },

    openDrilldown(band) {
      if (!band.rows || !band.rows.length) return;
      this.drilldown = { title: band.label, cols: band.cols, rows: band.rows };
      this.tip = null;
    },

    renderCharts() { this.renderDisbChart(); this.renderTrendChart(); },

    renderDisbChart() {
      const canvas = this.$refs.disbChart;
      if (!canvas) return;
      if (this._disbChart) { this._disbChart.destroy(); this._disbChart = null; }
      const monthSet = new Set();
      this.projects.forEach(p => { (p.disbursements || []).forEach(r => { if (r.month) monthSet.add(r.month); }); });
      if (!monthSet.size) return;
      const months = [...monthSet].sort();
      const labels = months.map(m => formatMonth(m));
      const sum = (m, fn) => this.projects.reduce((s, p) => {
        const row = (p.disbursements || []).find(r => r.month === m);
        return s + (row ? fn(row) : 0);
      }, 0);
      const blRaw     = months.map(m => sum(m, r => numberInput(r.baseline)));
      const trendRaw  = months.map(m => sum(m, r => this.rowTrend(r)));
      const actualRaw = months.map(m => sum(m, r => this.rowActual(r)));
      const maxVal = Math.max(...blRaw, ...trendRaw, ...actualRaw, 1);
      let divisor = 1, unitLabel = 'R$';
      if (maxVal >= 1e6)      { divisor = 1e6; unitLabel = 'Mi'; }
      else if (maxVal >= 1e3) { divisor = 1e3; unitLabel = 'Mil'; }
      const scale = v => +(v / divisor).toFixed(divisor >= 1e6 ? 2 : 1);
      this._disbChart = new Chart(canvas, {
        type: 'bar',
        data: { labels, datasets: [
          { label: 'Baseline', data: blRaw.map(scale),     backgroundColor: '#B0BEC5', borderRadius: 3 },
          { label: 'Previsto', data: trendRaw.map(scale),  backgroundColor: '#2196F3', borderRadius: 3 },
          { label: 'Realizado',data: actualRaw.map(scale), backgroundColor: '#1D6B3F', borderRadius: 3 },
        ]},
        options: {
          responsive: true, maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: { legend: { position: 'bottom', labels: { font: { size: 10 } } }, tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y * divisor)}` } } },
          scales: { x: { ticks: { font: { size: 10 } } }, y: { ticks: { font: { size: 10 }, callback: v => v + ' ' + unitLabel } } }
        }
      });
    },

    renderTrendChart() {
      const canvas = this.$refs.trendChart;
      if (!canvas) return;
      if (this._trendChart) { this._trendChart.destroy(); this._trendChart = null; }
      const monthSet = new Set();
      this.projects.forEach(p => { (p.disbursements || []).forEach(r => { if (r.month && r.month <= this.currentMonth) monthSet.add(r.month); }); });
      if (!monthSet.size) return;
      const recent = [...monthSet].sort().slice(-18);
      const labels = recent.map(m => formatMonth(m));
      let cum = 0;
      const rawDesvio = recent.map(m => {
        const bl     = this.projects.reduce((s, p) => { const row = (p.disbursements || []).find(r => r.month === m); return s + (row ? numberInput(row.baseline) : 0); }, 0);
        const actual = this.projects.reduce((s, p) => { const row = (p.disbursements || []).find(r => r.month === m); return s + (row ? this.rowActual(row) : 0); }, 0);
        cum += actual - bl;
        return cum;
      });
      const maxAbs = Math.max(...rawDesvio.map(Math.abs), 1);
      let divisor = 1, unitLabel = 'R$';
      if (maxAbs >= 1e6)      { divisor = 1e6; unitLabel = 'Mi'; }
      else if (maxAbs >= 1e3) { divisor = 1e3; unitLabel = 'Mil'; }
      const desvioData = rawDesvio.map(v => +(v / divisor).toFixed(2));
      this._trendChart = new Chart(canvas, {
        type: 'line',
        data: { labels, datasets: [{ label: 'Desvio Acum.', data: desvioData, borderColor: '#F44336', backgroundColor: 'rgba(244,67,54,0.1)', fill: true, tension: 0.3, pointRadius: 3 }] },
        options: {
          responsive: true, maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` Desvio: ${formatCurrency(ctx.parsed.y * divisor)}` } } },
          scales: { x: { ticks: { font: { size: 10 } } }, y: { ticks: { font: { size: 10 }, callback: v => v + ' ' + unitLabel } } }
        }
      });
    },
  },

  mounted() { this.$nextTick(() => this.renderCharts()); },
  beforeUnmount() {
    if (this._disbChart) this._disbChart.destroy();
    if (this._trendChart) this._trendChart.destroy();
  },
};
