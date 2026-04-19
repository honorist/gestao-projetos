window.ObrasView = {
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Obras</h1>
          <div class="subtitle">Equipe de implantação por projeto</div>
        </div>
      </div>

      <div class="tabs" style="margin-bottom:20px">
        <button class="tab-btn" :class="{ active: view === 'timeline' }" @click="view = 'timeline'">📅 Timeline</button>
        <button class="tab-btn" :class="{ active: view === 'lista' }" @click="view = 'lista'">📋 Lista</button>
      </div>

      <!-- ── TIMELINE ── -->
      <template v-if="view === 'timeline'">

        <div class="card" style="margin-bottom:16px;display:flex;gap:20px;align-items:center;flex-wrap:wrap">

          <!-- Agrupar por -->
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-size:13px;font-weight:600;color:var(--text-muted)">Agrupar por:</span>
            <div style="display:flex;gap:4px">
              <button v-for="g in groupOptions" :key="g.key"
                class="btn btn-sm"
                :class="groupBy === g.key ? 'btn-primary' : 'btn-secondary'"
                @click="groupBy = g.key"
                style="padding:4px 14px;font-size:12px">
                {{ g.label }}
              </button>
            </div>
          </div>

          <!-- Filtro status -->
          <div style="display:flex;align-items:center;gap:6px">
            <span style="font-size:13px;font-weight:600;color:var(--text-muted)">Status:</span>
            <select class="form-control" v-model="filterStatus" style="width:auto;padding:4px 8px;font-size:13px">
              <option value="">Todos</option>
              <option value="planning">Planejamento</option>
              <option value="active">Ativo</option>
              <option value="on_hold">Pausado</option>
              <option value="completed">Concluído</option>
            </select>
          </div>

          <!-- Legenda de disciplinas -->
          <div style="display:flex;gap:10px;flex-wrap:wrap;margin-left:auto">
            <span v-for="r in ROLES" :key="r.key" style="display:flex;align-items:center;gap:4px;font-size:11px;color:var(--text-muted)">
              <span :style="{ background: r.color, width:'12px', height:'12px', borderRadius:'3px', display:'inline-block', flexShrink:0 }"></span>
              {{ r.label }}
            </span>
          </div>
        </div>

        <div v-if="timeline.length === 0" class="card" style="text-align:center;padding:60px 20px;color:var(--text-muted)">
          <div style="font-size:48px;margin-bottom:14px">🏗️</div>
          <div style="font-size:15px;font-weight:600;margin-bottom:8px;color:var(--text)">Nenhum dado para exibir</div>
          <div style="font-size:13px">Cadastre implantadores nos projetos com datas de início e fim previsto.</div>
        </div>

        <div v-else style="overflow-x:auto;border:1px solid var(--border);border-radius:8px;background:var(--surface)">
          <div :style="{ width: (LABEL_W + totalW) + 'px', minWidth: '100%' }">

            <!-- Cabeçalho de meses -->
            <div style="display:flex;border-bottom:2px solid var(--border);background:#F7F8F7;position:sticky;top:0;z-index:3">
              <div :style="{ width: LABEL_W + 'px', flexShrink: 0 }"
                style="padding:8px 14px;font-size:11px;font-weight:700;color:var(--text-muted);border-right:2px solid var(--border);text-transform:uppercase;letter-spacing:.5px">
                {{ groupLabel }}
              </div>
              <div :style="{ width: totalW + 'px', position: 'relative', height: '36px' }">
                <div v-for="(m, i) in months" :key="m"
                  :style="{ position:'absolute', left: (i * MONTH_W) + 'px', width: MONTH_W + 'px', top:0, bottom:0 }"
                  style="display:flex;align-items:center;justify-content:center;font-size:11px;color:var(--text-muted);border-right:1px solid var(--border)">
                  {{ monthLabel(m) }}
                </div>
              </div>
            </div>

            <!-- Grupos -->
            <div v-for="group in timeline" :key="group.label">

              <!-- Cabeçalho do grupo -->
              <div style="display:flex;border-bottom:1px solid var(--border)"
                :style="{ background: group.color ? group.color + '18' : 'var(--green-xlight)' }">
                <div :style="{ width: LABEL_W + 'px', flexShrink: 0 }"
                  style="padding:7px 14px;font-weight:700;font-size:13px;border-right:2px solid var(--border);display:flex;align-items:center;gap:8px">
                  <span v-if="group.color"
                    :style="{ background: group.color, width:'10px', height:'10px', borderRadius:'2px', flexShrink:0, display:'inline-block' }">
                  </span>
                  <span :style="{ color: group.color ? group.color : 'var(--green-dark)' }">{{ group.label }}</span>
                  <span style="font-size:11px;font-weight:400;color:var(--text-muted)">{{ group.rows.length }} item(s)</span>
                </div>
                <div :style="{ width: totalW + 'px', position: 'relative', height: '32px' }">
                  <div v-for="(m, i) in months" :key="m"
                    :style="{ position:'absolute', left: (i * MONTH_W) + 'px', top:0, bottom:0, width:'1px', background:'rgba(0,0,0,.06)' }">
                  </div>
                  <div v-if="todayInRange"
                    :style="{ position:'absolute', left: todayLeft + 'px', top:0, bottom:0, width:'2px', background:'var(--danger)', opacity:.5, zIndex:2 }">
                  </div>
                </div>
              </div>

              <!-- Linhas -->
              <div v-for="(row, j) in group.rows" :key="j"
                style="display:flex;border-bottom:1px solid var(--border);height:38px">
                <div :style="{ width: LABEL_W + 'px', flexShrink: 0 }"
                  style="padding:0 14px;display:flex;align-items:center;gap:6px;border-right:2px solid var(--border);overflow:hidden">
                  <span :style="{ background: row.color }"
                    style="padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;color:white;white-space:nowrap;flex-shrink:0">
                    {{ row.badge }}
                  </span>
                  <span v-if="row.sublabel" style="font-size:11px;color:var(--text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
                    {{ row.sublabel }}
                  </span>
                </div>
                <div :style="{ width: totalW + 'px', position: 'relative', height: '38px' }">
                  <div v-for="(m, i) in months" :key="m"
                    :style="{ position:'absolute', left: (i * MONTH_W) + 'px', top:0, bottom:0, width:'1px', background:'var(--border)' }">
                  </div>
                  <div v-if="todayInRange"
                    :style="{ position:'absolute', left: todayLeft + 'px', top:0, bottom:0, width:'2px', background:'rgba(220,38,38,.35)', zIndex:2 }">
                  </div>
                  <div :style="barStyle(row.bar)"
                    @click="$router.push('/projects/' + row.bar.id)"
                    :title="row.bar.title + '\\n' + formatDate(row.bar.start) + ' → ' + formatDate(row.bar.end)">
                    {{ row.bar.title }}
                  </div>
                </div>
              </div>

            </div>

            <div v-if="todayInRange" style="padding:5px 14px;font-size:11px;color:var(--danger);display:flex;align-items:center;gap:6px;border-top:1px solid var(--border)">
              <span style="width:14px;height:2px;background:var(--danger);display:inline-block"></span> Hoje
            </div>

          </div>
        </div>
      </template>

      <!-- ── LISTA ── -->
      <template v-if="view === 'lista'">
        <div class="card" style="margin-bottom:20px;display:flex;gap:16px;flex-wrap:wrap;align-items:flex-end">
          <div>
            <div class="form-label" style="margin-bottom:6px">Buscar</div>
            <input class="form-control search-input" v-model="search" placeholder="🔍 Projeto...">
          </div>
          <div>
            <div class="form-label" style="margin-bottom:6px">Status</div>
            <select class="form-control" v-model="filterStatus">
              <option value="">Todos</option>
              <option value="planning">Planejamento</option>
              <option value="active">Ativo</option>
              <option value="on_hold">Pausado</option>
              <option value="completed">Concluído</option>
            </select>
          </div>
          <div>
            <div class="form-label" style="margin-bottom:6px">Implantador</div>
            <select class="form-control" v-model="filterImplantador" style="min-width:200px">
              <option value="">— Todos —</option>
              <option v-for="p in implantadoresList" :key="p.id" :value="p.name">{{ p.name }}</option>
            </select>
          </div>
          <div style="color:var(--text-muted);font-size:13px;padding-bottom:8px">{{ filtered.length }} projeto(s)</div>
        </div>

        <div v-if="filtered.length > 0" class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Projeto</th><th>Status</th>
                <th>EIA</th><th>Mecânica</th><th>Civil</th>
                <th>Tec. Segurança</th><th>Tec. M. Ambiente</th><th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in filtered" :key="p.id" class="clickable" @click="$router.push('/projects/' + p.id)">
                <td style="font-weight:600">
                  {{ p.name }}
                  <span v-if="p.number" class="text-muted text-sm" style="margin-left:6px">{{ p.number }}</span>
                </td>
                <td><span :class="'badge badge-' + statusColor(p.status)">{{ statusLabel(p.status) }}</span></td>
                <td>{{ p.impl_eia || '—' }}</td>
                <td>{{ p.impl_mecanica || '—' }}</td>
                <td>{{ p.impl_civil || '—' }}</td>
                <td>{{ p.impl_seguranca || '—' }}</td>
                <td>{{ p.impl_meio_ambiente || '—' }}</td>
                <td @click.stop><button class="btn-icon" @click="$router.push('/projects/' + p.id)">✏️</button></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="filtered.length === 0" class="card" style="text-align:center;padding:60px 20px;color:var(--text-muted)">
          <div style="font-size:48px;margin-bottom:14px">🏗️</div>
          <div style="font-size:15px;font-weight:600;color:var(--text)">Nenhum projeto encontrado</div>
        </div>
      </template>

    </div>
  `,

  data() {
    return {
      view: 'timeline',
      groupBy: 'implantador',
      search: '',
      filterStatus: 'active',
      filterImplantador: '',
      MONTH_W: 72,
      LABEL_W: 230,
      groupOptions: [
        { key: 'implantador', label: 'Implantador' },
        { key: 'disciplina',  label: 'Disciplina'  },
        { key: 'projeto',     label: 'Projeto'     },
      ],
      ROLES: [
        { key: 'impl_eia',           label: 'EIA',          color: '#1565C0' },
        { key: 'impl_mecanica',      label: 'Mecânica',     color: '#E65100' },
        { key: 'impl_civil',         label: 'Civil',        color: '#2E7D32' },
        { key: 'impl_seguranca',     label: 'Segurança',    color: '#B71C1C' },
        { key: 'impl_meio_ambiente', label: 'M. Ambiente',  color: '#6A1B9A' },
      ],
    };
  },

  computed: {
    implantadoresList() {
      return [...(Store.state.implantadores || [])].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    },

    filtered() {
      return Store.state.projects.filter(p => {
        if (p.status === 'cancelled') return false;
        const q = this.search.toLowerCase();
        const matchSearch = !q || p.name.toLowerCase().includes(q) || (p.number || '').toLowerCase().includes(q);
        const matchStatus = !this.filterStatus || p.status === this.filterStatus;
        const matchImpl = !this.filterImplantador || [
          p.impl_eia, p.impl_mecanica, p.impl_civil, p.impl_seguranca, p.impl_meio_ambiente
        ].includes(this.filterImplantador);
        return matchSearch && matchStatus && matchImpl;
      }).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    },

    timelineProjects() {
      return Store.state.projects.filter(p =>
        p.status !== 'cancelled' &&
        (!this.filterStatus || p.status === this.filterStatus) &&
        p.start_date && p.planned_end_date &&
        (p.impl_eia || p.impl_mecanica || p.impl_civil || p.impl_seguranca || p.impl_meio_ambiente)
      );
    },

    minMonthIdx() {
      const idxs = this.timelineProjects.map(p => this.toIdx(p.start_date)).filter(n => n !== null);
      if (!idxs.length) return this.toIdx(new Date().toISOString().slice(0, 7));
      return Math.min(...idxs);
    },

    maxMonthIdx() {
      const idxs = this.timelineProjects.map(p => this.toIdx(p.planned_end_date)).filter(n => n !== null);
      if (!idxs.length) return this.minMonthIdx + 11;
      return Math.max(...idxs);
    },

    months() {
      const arr = [];
      for (let i = this.minMonthIdx; i <= this.maxMonthIdx; i++) arr.push(i);
      return arr;
    },

    totalW() { return this.months.length * this.MONTH_W; },

    todayIdx() {
      const t = new Date();
      return t.getFullYear() * 12 + t.getMonth();
    },

    todayInRange() {
      return this.todayIdx >= this.minMonthIdx && this.todayIdx <= this.maxMonthIdx;
    },

    todayLeft() {
      return (this.todayIdx - this.minMonthIdx) * this.MONTH_W + this.MONTH_W / 2;
    },

    groupLabel() {
      return { implantador: 'Implantador / Função', disciplina: 'Disciplina / Implantador', projeto: 'Projeto / Equipe' }[this.groupBy];
    },

    timeline() {
      const projects = this.timelineProjects;
      const byStart = (a, b) => a.bar.start.localeCompare(b.bar.start);

      if (this.groupBy === 'implantador') {
        const map = {};
        for (const proj of projects) {
          for (const role of this.ROLES) {
            const name = proj[role.key];
            if (!name) continue;
            if (!map[name]) map[name] = { label: name, color: null, rows: [] };
            map[name].rows.push({
              badge: role.label, sublabel: '', color: role.color,
              bar: { id: proj.id, title: proj.name + (proj.number ? ' · ' + proj.number : ''), start: proj.start_date, end: proj.planned_end_date, color: role.color },
            });
          }
        }
        return Object.values(map)
          .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'))
          .map(g => ({ ...g, rows: [...g.rows].sort(byStart) }));
      }

      if (this.groupBy === 'disciplina') {
        const map = {};
        for (const role of this.ROLES) map[role.key] = { label: role.label, color: role.color, rows: [] };
        for (const proj of projects) {
          for (const role of this.ROLES) {
            const name = proj[role.key];
            if (!name) continue;
            map[role.key].rows.push({
              badge: name.split(' ')[0], sublabel: proj.name + (proj.number ? ' · ' + proj.number : ''), color: role.color,
              bar: { id: proj.id, title: proj.name + (proj.number ? ' · ' + proj.number : ''), start: proj.start_date, end: proj.planned_end_date, color: role.color },
            });
          }
        }
        return Object.values(map)
          .filter(g => g.rows.length > 0)
          .map(g => ({ ...g, rows: [...g.rows].sort(byStart) }));
      }

      if (this.groupBy === 'projeto') {
        const map = {};
        for (const proj of projects) {
          if (!map[proj.id]) map[proj.id] = { label: proj.name + (proj.number ? ' · ' + proj.number : ''), color: null, rows: [] };
          for (const role of this.ROLES) {
            const name = proj[role.key];
            if (!name) continue;
            map[proj.id].rows.push({
              badge: role.label, sublabel: name, color: role.color,
              bar: { id: proj.id, title: proj.name + (proj.number ? ' · ' + proj.number : ''), start: proj.start_date, end: proj.planned_end_date, color: role.color },
            });
          }
        }
        return Object.values(map)
          .filter(g => g.rows.length > 0)
          .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'));
      }

      return [];
    },
  },

  methods: {
    toIdx(dateStr) {
      if (!dateStr) return null;
      const parts = dateStr.split('-');
      return parseInt(parts[0]) * 12 + (parseInt(parts[1]) - 1);
    },

    monthLabel(idx) {
      const y = Math.floor(idx / 12);
      const m = idx % 12;
      const names = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
      return names[m] + '/' + String(y).slice(-2);
    },

    barStyle(bar) {
      const s = this.toIdx(bar.start);
      const e = this.toIdx(bar.end);
      const left = (s - this.minMonthIdx) * this.MONTH_W;
      const width = Math.max((e - s + 1) * this.MONTH_W, this.MONTH_W);
      return {
        position: 'absolute', top: '6px', bottom: '6px',
        left: left + 'px', width: width + 'px',
        borderRadius: '5px', background: bar.color,
        color: 'white', display: 'flex', alignItems: 'center',
        padding: '0 10px', fontSize: '11px', fontWeight: '600',
        overflow: 'hidden', whiteSpace: 'nowrap', cursor: 'pointer',
        boxShadow: '0 1px 4px rgba(0,0,0,.2)', zIndex: 1,
      };
    },

    statusLabel, statusColor, formatDate,
  },
};
