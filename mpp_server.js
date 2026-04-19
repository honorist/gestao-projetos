/**
 * Servidor local para parse de arquivos .mpp (MS Project)
 * Roda em http://localhost:3456
 * Uso: node mpp_server.js
 */
const http  = require('http');
const { ProjectFile } = require('mpxj');

const PORT = 3456;

function toYM(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function endOfMonth(ym) {
  const [y, m] = ym.split('-').map(Number);
  return new Date(y, m, 0, 23, 59, 59);
}

function spanDays(s, f) {
  return Math.max(1, (f - s) / 86400000);
}

function parseDuration(dur) {
  if (!dur) return 0;
  try {
    const val  = typeof dur.getDuration === 'function' ? dur.getDuration() : 0;
    const unit = typeof dur.getUnits    === 'function' ? String(dur.getUnits()) : '';
    if (unit.includes('HOURS')) return val / 8;
    if (unit.includes('WEEKS')) return val * 5;
    return val;
  } catch { return 0; }
}

function buildCurves(tasks) {
  const safe = fn => { try { return fn(); } catch { return null; } };

  const leafTasks = tasks.filter(t =>
    !safe(() => t.getSummary()) &&
    !safe(() => t.getMilestone()) &&
    safe(() => t.getBaselineStart()) &&
    safe(() => t.getBaselineFinish())
  );

  if (leafTasks.length === 0) return { error: 'Nenhuma tarefa folha com baseline. Salve o baseline antes (Projeto → Definir Linha de Base).' };

  const lbWork = t => {
    const d = parseDuration(safe(() => t.getBaselineDuration()));
    return d > 0 ? d : spanDays(safe(() => t.getBaselineStart()), safe(() => t.getBaselineFinish()));
  };
  const curWork = t => {
    const s = safe(() => t.getStart()), f = safe(() => t.getFinish());
    if (!s || !f) return lbWork(t);
    const d = parseDuration(safe(() => t.getDuration()));
    return d > 0 ? d : spanDays(s, f);
  };
  const overlap = (s, f, work, eom) => {
    if (!s || !f) return 0;
    if (s > eom) return 0;
    if (f <= eom) return work;
    const span = f - s;
    return span === 0 ? work : work * ((eom - s) / span);
  };

  const totalLB  = leafTasks.reduce((s, t) => s + lbWork(t), 0);
  const totalCur = leafTasks.reduce((s, t) => s + curWork(t), 0) || totalLB;
  if (totalLB === 0) return { error: 'Total de trabalho baseline é zero.' };

  const monthSet = new Set();
  const addRange = (s, f) => {
    if (!s || !f) return;
    let d = new Date(s.getFullYear(), s.getMonth(), 1);
    while (d <= f) { monthSet.add(toYM(d)); d.setMonth(d.getMonth() + 1); }
  };
  leafTasks.forEach(t => {
    addRange(safe(() => t.getBaselineStart()), safe(() => t.getBaselineFinish()));
    const cs = safe(() => t.getStart()), cf = safe(() => t.getFinish());
    if (cs && cf) addRange(cs, cf);
    const as = safe(() => t.getActualStart()), af = safe(() => t.getActualFinish());
    if (as) monthSet.add(toYM(as));
    if (af) monthSet.add(toYM(af));
  });

  const today = new Date(), nowYM = toYM(today);

  const curves = [...monthSet].sort().map(ym => {
    const eom = endOfMonth(ym);

    let cumLB = 0;
    leafTasks.forEach(t => {
      cumLB += overlap(safe(() => t.getBaselineStart()), safe(() => t.getBaselineFinish()), lbWork(t), eom);
    });
    const lb = parseFloat(Math.min(100, (cumLB / totalLB) * 100).toFixed(1));

    let cumCur = 0;
    leafTasks.forEach(t => {
      const cs = safe(() => t.getStart()), cf = safe(() => t.getFinish());
      if (cs && cf) cumCur += overlap(cs, cf, curWork(t), eom);
      else cumCur += overlap(safe(() => t.getBaselineStart()), safe(() => t.getBaselineFinish()), lbWork(t), eom);
    });
    const planned = parseFloat(Math.min(100, (cumCur / totalCur) * 100).toFixed(1));

    let actual = null;
    if (ym <= nowYM) {
      let cumActual = 0;
      leafTasks.forEach(t => {
        const as = safe(() => t.getActualStart());
        if (!as) return;
        const af  = safe(() => t.getActualFinish());
        const pct = (safe(() => t.getPercentageComplete()) || 0) / 100;
        cumActual += overlap(as, af || today, pct * lbWork(t), eom);
      });
      actual = parseFloat(Math.min(100, (cumActual / totalLB) * 100).toFixed(1));
    }
    return { month: ym, lb, planned, actual };
  });

  return { curves };
}

const server = http.createServer(async (req, res) => {
  // CORS para o browser local
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
  if (req.method !== 'POST' || req.url !== '/parse') {
    res.writeHead(404); res.end('Not found'); return;
  }

  const chunks = [];
  req.on('data', chunk => chunks.push(chunk));
  req.on('end', async () => {
    try {
      const buf  = Buffer.concat(chunks);
      const pf   = new ProjectFile();
      const proj = await pf.read(buf);
      const allTasks = proj.getAllTasks ? proj.getAllTasks() : [];
      const result = buildCurves(allTasks);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`MPP Parser rodando em http://localhost:${PORT}`);
  console.log('Mantenha esta janela aberta enquanto usar o app.');
  console.log('Para parar: Ctrl+C');
});
