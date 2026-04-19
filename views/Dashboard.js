window.DashboardView = {
  template: `
    <div class="page">
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
          <div v-for="s in carteiraSituacao" :key="s.label" style="margin-bottom:9px">
            <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:2px">
              <span>{{ s.label }}</span><span style="font-weight:700">{{ s.count }}</span>
            </div>
            <div style="height:10px;background:var(--bg);border-radius:5px;overflow:hidden">
              <div :style="{width: Math.max(s.pct, s.count > 0 ? 4 : 0) + '%', background: s.color, height:'100%', borderRadius:'5px', transition:'width .4s'}"></div>
            </div>
          </div>
        </div>

        <div class="card" style="padding:16px">
          <div class="section-title" style="margin-bottom:12px">Situação Over Run</div>
          <div v-for="b in overRun" :key="b.label" style="margin-bottom:9px">
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
          <div v-for="b in overTime" :key="b.label" style="margin-bottom:9px">
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
          <div v-for="b in fisFin" :key="b.label" style="margin-bottom:9px">
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
          <div v-for="b in carteiraTipo" :key="b.label" style="margin-bottom:9px">
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
          <div v-for="b in schedPending" :key="b.label" style="margin-bottom:9px">
            <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:2px">
              <span>{{ b.label }}</span><span style="font-weight:700">{{ b.count }}</span>
            </div>
            <div style="height:10px;background:var(--bg);border-radius:5px;overflow:hidden">
              <div :style="{width: Math.max(b.pct, b.count > 0 ? 4 : 0) + '%', background: b.color, height:'100%', borderRadius:'5px', transition:'width .4s'}"></div>
            </div>
          </div>
          <div v-if="schedPending[1] && schedPending[1].count > 0" style="margin-top:10px">
            <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px">Sem cronograma:</div>
            <div v-for="p in schedMissing" :key="p.id" class="clickable"
              style="font-size:12px;padding:3px 0;border-bottom:1px solid var(--border);color:var(--danger)"
              @click="$router.push('/projects/' + p.id)">{{ p.name }}</div>
          </div>
        </div>

        <div class="card" style="padding:16px">
          <div class="section-title" style="margin-bottom:12px">Situação Avanço Físico</div>
          <div v-for="b in physicalProgress" :key="b.label" style="margin-bottom:9px">
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
          <div v-for="b in closingSituation" :key="b.label" style="margin-bottom:9px">
            <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:2px">
              <span>{{ b.label }}</span><span style="font-weight:700">{{ b.count }}</span>
            </div>
            <div style="height:10px;background:var(--bg);border-radius:5px;overflow:hidden">
              <div :style="{width: Math.max(b.pct, b.count > 0 ? 4 : 0) + '%', background: b.color, height:'100%', borderRadius:'5px', transition:'width .4s'}"></div>
            </div>
          </div>
          <div v-if="closingCritical.length" style="margin-top:10px">
            <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px">Críticos (&lt;30d):</div>
            <div v-for="p in closingCritical" :key="p.id" class="clickable"
              style="font-size:12px;padding:3px 0;border-bottom:1px solid var(--border);color:var(--danger)"
              @click="$router.push('/projects/' + p.id)">
              {{ p.name }} <span style="font-weight:700">({{ p.daysLeft }}d)</span>
            </div>
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
    projects() {
      return Store.state.projects.filter(p => p.status !== 'cancelled');
    },
    activeAndClosing() {
      return this.projects.filter(p => ['active', 'closing', 'on_hold'].includes(p.status));
    },

    currentYear() { return new Date().getFullYear(); },

    // ── KPI Anual (destaque topo) ──────────────────────────────────────────────
    kpiAnual() {
      const year = String(this.currentYear);
      let previsto = 0, realizado = 0;
      this.projects.forEach(p => {
        (p.disbursements || []).forEach(r => {
          if (!r.month || !r.month.startsWith(year)) return;
          previsto  += this.rowTrend(r);
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
          if (r.month === m) {
            totalTrend  += this.rowTrend(r);
            totalActual += this.rowActual(r);
          }
          if (r.month <= m) {
            totalBLacum    += numberInput(r.baseline);
            totalActualAcum += this.rowActual(r);
          }
        });
      });
      const ating  = totalTrend > 0 ? (totalActual / totalTrend * 100) : 0;
      const desvio = totalActualAcum - totalBLacum;
      return [
        { label: 'Em Execução',           value: this.projects.filter(p => p.status === 'active').length,  color: 'var(--green)' },
        { label: 'Em Encerramento',        value: this.projects.filter(p => p.status === 'closing').length, color: 'var(--info)' },
        { label: 'Desemb. Mês (Prev.)',    value: this.fc(totalTrend),    color: 'var(--warning)' },
        { label: 'Desvio Orçado Acum.',    value: this.fc(desvio),        color: desvio < 0 ? 'var(--danger)' : 'var(--green)' },
        { label: 'Ating. Tendência',       value: ating.toFixed(1) + '%', color: ating < 90 ? 'var(--danger)' : 'var(--green)' },
        { label: 'Realizado Acum.',        value: this.fc(totalActualAcum), color: 'var(--green)' },
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
        const count = this.projects.filter(p => p.status === g.key).length;
        return { ...g, count, pct: count / total * 100 };
      });
    },

    // ── Over Run ──────────────────────────────────────────────────────────────
    overRun() {
      const relevant = this.activeAndClosing;
      const total = relevant.length || 1;
      const counts = [0, 0, 0, 0, 0];
      relevant.forEach(p => {
        const fin = Store.getProjectFinancials(p.id);
        if (!fin.budget) { counts[0]++; return; }
        const pct = (fin.forecast - fin.budget) / fin.budget * 100;
        if (pct < 0)        counts[1]++;
        else if (pct < 5)   counts[2]++;
        else if (pct < 20)  counts[3]++;
        else                counts[4]++;
      });
      return [
        { label: 'Sem dados',      color: '#B0BEC5', count: counts[0], pct: counts[0] / total * 100 },
        { label: 'Abaixo do ORÇ', color: '#1D6B3F', count: counts[1], pct: counts[1] / total * 100 },
        { label: '0–5% acima',    color: '#FFC107', count: counts[2], pct: counts[2] / total * 100 },
        { label: '5–20% acima',   color: '#FF9800', count: counts[3], pct: counts[3] / total * 100 },
        { label: '> 20% acima',   color: '#F44336', count: counts[4], pct: counts[4] / total * 100 },
      ];
    },

    // ── Over Time ──────────────────────────────────────────────────────────────
    overTime() {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const relevant = this.activeAndClosing;
      const total = relevant.length || 1;
      const counts = [0, 0, 0, 0, 0, 0];
      relevant.forEach(p => {
        if (!p.planned_end_date) { counts[5]++; return; }
        const end  = new Date(p.planned_end_date + 'T00:00:00');
        const diff = Math.round((end - today) / 86400000);
        if (diff > 7)        counts[0]++;
        else if (diff >= -7) counts[1]++;
        else if (diff >= -30)counts[2]++;
        else if (diff >= -90)counts[3]++;
        else                 counts[4]++;
      });
      return [
        { label: 'Adiantado',   color: '#1D6B3F', count: counts[0], pct: counts[0] / total * 100 },
        { label: 'Em Dia (±7d)',color: '#4CAF50', count: counts[1], pct: counts[1] / total * 100 },
        { label: 'Atr. ≤30d',  color: '#FFC107', count: counts[2], pct: counts[2] / total * 100 },
        { label: 'Atr. ≤90d',  color: '#FF9800', count: counts[3], pct: counts[3] / total * 100 },
        { label: 'Atr. >90d',  color: '#F44336', count: counts[4], pct: counts[4] / total * 100 },
        { label: 'Sem data',   color: '#B0BEC5', count: counts[5], pct: counts[5] / total * 100 },
      ];
    },

    // ── Fis / Fin ──────────────────────────────────────────────────────────────
    fisFin() {
      const relevant = this.activeAndClosing;
      const total = relevant.length || 1;
      const counts = [0, 0, 0, 0, 0];
      relevant.forEach(p => {
        const fin    = Store.getProjectFinancials(p.id);
        const phys   = numberInput(p.progress_pct) || 0;
        const finPct = fin.pct_used || 0;
        if (finPct === 0 && phys === 0) { counts[4]++; return; }
        const ratio  = finPct > 0 ? phys / finPct : (phys > 0 ? 2 : 0);
        if (ratio >= 1)        counts[0]++;
        else if (ratio >= 0.8) counts[1]++;
        else if (ratio >= 0.5) counts[2]++;
        else                   counts[3]++;
      });
      return [
        { label: '≥ 1,0 (fís. adiantado)',  color: '#1D6B3F', count: counts[0], pct: counts[0] / total * 100 },
        { label: '0,8–1,0 (equilibrado)',   color: '#4CAF50', count: counts[1], pct: counts[1] / total * 100 },
        { label: '0,5–0,8 (fin. adiantado)',color: '#FFC107', count: counts[2], pct: counts[2] / total * 100 },
        { label: '< 0,5 (grande desvio)',   color: '#F44336', count: counts[3], pct: counts[3] / total * 100 },
        { label: 'Sem dados',               color: '#B0BEC5', count: counts[4], pct: counts[4] / total * 100 },
      ];
    },

    // ── Carteira por Tipo ──────────────────────────────────────────────────────
    carteiraTipo() {
      const groups = [
        { key: 'safety',      label: 'Segurança',     color: '#F44336' },
        { key: 'environment', label: 'Meio Ambiente',  color: '#1D6B3F' },
        { key: 'efficiency',  label: 'Eficiência',     color: '#2196F3' },
        { key: 'other',       label: 'Outros',         color: '#9E9E9E' },
      ];
      const total = this.projects.length || 1;
      return groups.map(g => {
        const count = this.projects.filter(p => (p.project_type || 'other') === g.key).length;
        return { ...g, count, pct: count / total * 100 };
      });
    },

    // ── Desvios do Mês ─────────────────────────────────────────────────────────
    mainDeviations() {
      return this.projects.map(p => {
        const row  = (p.disbursements || []).find(r => r.month === this.currentMonth);
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
      const withSched    = relevant.filter(p => Array.isArray(p.schedule) && p.schedule.length > 0).length;
      const withoutSched = relevant.length - withSched;
      return [
        { label: 'Com cronograma', count: withSched,    pct: withSched    / total * 100, color: '#1D6B3F' },
        { label: 'Sem cronograma', count: withoutSched, pct: withoutSched / total * 100, color: '#F44336' },
      ];
    },
    schedMissing() {
      return this.activeAndClosing
        .filter(p => !Array.isArray(p.schedule) || p.schedule.length === 0)
        .slice(0, 5);
    },

    // ── Avanço Físico ──────────────────────────────────────────────────────────
    physicalProgress() {
      const m        = this.currentMonth;
      const relevant = this.activeAndClosing;
      const total    = relevant.length || 1;
      const counts   = [0, 0, 0, 0, 0];
      relevant.forEach(p => {
        const actual = numberInput(p.progress_pct) || 0;
        const sched  = p.schedule || [];
        const row    = sched.find(r => r.month === m) || sched.filter(r => r.month <= m).slice(-1)[0];
        if (!row) { counts[4]++; return; }
        const planned = numberInput(row.planned) || 0;
        const diff    = actual - planned;
        if (diff > 5)        counts[0]++;
        else if (diff >= -5) counts[1]++;
        else if (diff >= -20)counts[2]++;
        else                 counts[3]++;
      });
      return [
        { label: 'Adiantado (>5pp)', color: '#1D6B3F', count: counts[0], pct: counts[0] / total * 100 },
        { label: 'Em Dia (±5pp)',    color: '#4CAF50', count: counts[1], pct: counts[1] / total * 100 },
        { label: 'Atr. ≤20pp',      color: '#FFC107', count: counts[2], pct: counts[2] / total * 100 },
        { label: 'Atr. >20pp',      color: '#F44336', count: counts[3], pct: counts[3] / total * 100 },
        { label: 'Sem cronograma',  color: '#B0BEC5', count: counts[4], pct: counts[4] / total * 100 },
      ];
    },

    // ── Encerramento ──────────────────────────────────────────────────────────
    closingSituation() {
      const today    = new Date(); today.setHours(0, 0, 0, 0);
      const relevant = this.activeAndClosing;
      const total    = relevant.length || 1;
      const counts   = [0, 0, 0, 0, 0];
      relevant.forEach(p => {
        if (!p.planned_end_date) { counts[4]++; return; }
        const end      = new Date(p.planned_end_date + 'T00:00:00');
        const daysLeft = Math.round((end - today) / 86400000);
        if (daysLeft < 30)       counts[0]++;
        else if (daysLeft < 60)  counts[1]++;
        else if (daysLeft < 90)  counts[2]++;
        else                     counts[3]++;
      });
      return [
        { label: '< 30 dias (crítico)',  color: '#F44336', count: counts[0], pct: counts[0] / total * 100 },
        { label: '30–60 dias (atenção)', color: '#FF9800', count: counts[1], pct: counts[1] / total * 100 },
        { label: '60–90 dias (próximo)', color: '#FFC107', count: counts[2], pct: counts[2] / total * 100 },
        { label: '> 90 dias',            color: '#1D6B3F', count: counts[3], pct: counts[3] / total * 100 },
        { label: 'Sem data prevista',    color: '#B0BEC5', count: counts[4], pct: counts[4] / total * 100 },
      ];
    },
    closingCritical() {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      return this.activeAndClosing
        .filter(p => p.planned_end_date)
        .map(p => {
          const end      = new Date(p.planned_end_date + 'T00:00:00');
          const daysLeft = Math.round((end - today) / 86400000);
          return { ...p, daysLeft };
        })
        .filter(p => p.daysLeft < 30)
        .sort((a, b) => a.daysLeft - b.daysLeft)
        .slice(0, 5);
    },

  },

  methods: {
    rowTrend(row) {
      if (!row) return 0;
      const items = row.trend_items;
      if (Array.isArray(items) && items.length > 0)
        return items.reduce((s, i) => s + numberInput(i.value), 0);
      return numberInput(row.baseline);
    },
    rowActual(row) {
      if (!row) return 0;
      const items = row.actual_items;
      if (Array.isArray(items) && items.length > 0)
        return items.reduce((s, i) => s + numberInput(i.value), 0);
      return numberInput(row.actual || 0);
    },
    fc(v) { return formatCurrency(v); },

    renderCharts() {
      this.renderDisbChart();
      this.renderTrendChart();
    },

    renderDisbChart() {
      const canvas = this.$refs.disbChart;
      if (!canvas) return;
      if (this._disbChart) { this._disbChart.destroy(); this._disbChart = null; }

      // Collect all months that exist in any project's disbursements
      const monthSet = new Set();
      this.projects.forEach(p => {
        (p.disbursements || []).forEach(r => { if (r.month) monthSet.add(r.month); });
      });
      if (monthSet.size === 0) return;
      const months = [...monthSet].sort();

      const labels = months.map(m => formatMonth(m));
      const sum = (m, fn) => this.projects.reduce((s, p) => {
        const row = (p.disbursements || []).find(r => r.month === m);
        return s + (row ? fn(row) : 0);
      }, 0);
      const blRaw     = months.map(m => sum(m, r => numberInput(r.baseline)));
      const trendRaw  = months.map(m => sum(m, r => this.rowTrend(r)));
      const actualRaw = months.map(m => sum(m, r => this.rowActual(r)));

      // Auto-scale: choose unit based on max value
      const maxVal = Math.max(...blRaw, ...trendRaw, ...actualRaw, 1);
      let divisor = 1, unitLabel = 'R$';
      if (maxVal >= 1e6)      { divisor = 1e6;  unitLabel = 'Mi'; }
      else if (maxVal >= 1e3) { divisor = 1e3;  unitLabel = 'Mil'; }

      const scale = v => +(v / divisor).toFixed(divisor >= 1e6 ? 2 : 1);

      this._disbChart = new Chart(canvas, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            { label: 'Baseline', data: blRaw.map(scale),     backgroundColor: '#B0BEC5', borderRadius: 3 },
            { label: 'Previsto', data: trendRaw.map(scale),  backgroundColor: '#2196F3', borderRadius: 3 },
            { label: 'Realizado',data: actualRaw.map(scale), backgroundColor: '#1D6B3F', borderRadius: 3 },
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: { position: 'bottom', labels: { font: { size: 10 } } },
            tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y * divisor)}` } }
          },
          scales: {
            x: { ticks: { font: { size: 10 } } },
            y: { ticks: { font: { size: 10 }, callback: v => v + ' ' + unitLabel } }
          }
        }
      });
    },

    renderTrendChart() {
      const canvas = this.$refs.trendChart;
      if (!canvas) return;
      if (this._trendChart) { this._trendChart.destroy(); this._trendChart = null; }

      // Collect all months from data, up to current month
      const monthSet = new Set();
      this.projects.forEach(p => {
        (p.disbursements || []).forEach(r => { if (r.month && r.month <= this.currentMonth) monthSet.add(r.month); });
      });
      if (monthSet.size === 0) return;
      const recent = [...monthSet].sort().slice(-18);
      const labels = recent.map(m => formatMonth(m));
      let cum = 0;
      const rawDesvio = recent.map(m => {
        const bl = this.projects.reduce((s, p) => {
          const row = (p.disbursements || []).find(r => r.month === m);
          return s + (row ? numberInput(row.baseline) : 0);
        }, 0);
        const actual = this.projects.reduce((s, p) => {
          const row = (p.disbursements || []).find(r => r.month === m);
          return s + (row ? this.rowActual(row) : 0);
        }, 0);
        cum += actual - bl;
        return cum;
      });

      const maxAbs = Math.max(...rawDesvio.map(Math.abs), 1);
      let divisor = 1, unitLabel = 'R$';
      if (maxAbs >= 1e6)      { divisor = 1e6;  unitLabel = 'Mi'; }
      else if (maxAbs >= 1e3) { divisor = 1e3;  unitLabel = 'Mil'; }
      const desvioData = rawDesvio.map(v => +(v / divisor).toFixed(2));

      this._trendChart = new Chart(canvas, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Desvio Acum.',
            data: desvioData,
            borderColor: '#F44336',
            backgroundColor: 'rgba(244,67,54,0.1)',
            fill: true, tension: 0.3, pointRadius: 3,
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: ctx => ` Desvio: ${formatCurrency(ctx.parsed.y * divisor)}` } }
          },
          scales: {
            x: { ticks: { font: { size: 10 } } },
            y: { ticks: { font: { size: 10 }, callback: v => v + ' ' + unitLabel } }
          }
        }
      });
    },
  },

  mounted() {
    this.$nextTick(() => this.renderCharts());
  },

  beforeUnmount() {
    if (this._disbChart) this._disbChart.destroy();
    if (this._trendChart) this._trendChart.destroy();
  },
};
