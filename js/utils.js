function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

function formatCurrency(val) {
  if (val == null || isNaN(val)) return '$ 0';
  return '$ ' + new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

function formatMonth(monthStr) {
  if (!monthStr) return '';
  const [y, m] = monthStr.split('-');
  const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  return `${months[parseInt(m) - 1]}/${y.slice(2)}`;
}

const STATUS_LABELS = {
  planning: 'Planejamento', active: 'Ativo', on_hold: 'Pausado',
  closing: 'Encerramento', completed: 'Concluído', cancelled: 'Cancelado',
  FEL1: 'FEL 1', FEL2: 'FEL 2', FEL3: 'FEL 3',
  execution: 'Execução', closeout: 'Encerramento',
  forecast: 'Previsão', requisition: 'RC Aberta', quoting: 'Em Cotação',
  approved: 'Aprovado', po_issued: 'PO Emitida',
  in_transit: 'Em Trânsito', received: 'Recebido',
  todo: 'A Fazer', in_progress: 'Em Andamento', blocked: 'Bloqueado', done: 'Concluído',
  low: 'Baixa', medium: 'Média', high: 'Alta', critical: 'Crítica',
};

const STATUS_COLORS = {
  planning: 'gray', active: 'green', on_hold: 'yellow', closing: 'orange', completed: 'blue', cancelled: 'red',
  forecast: 'gray', requisition: 'blue', quoting: 'orange',
  approved: 'teal', po_issued: 'teal', in_transit: 'purple', received: 'green',
  todo: 'gray', in_progress: 'blue', blocked: 'red', done: 'green',
  low: 'gray', medium: 'blue', high: 'orange', critical: 'red',
};

function statusLabel(s) { return STATUS_LABELS[s] || s; }
function statusColor(s) { return STATUS_COLORS[s] || 'gray'; }

function isOverdue(dateStr) {
  if (!dateStr) return false;
  return dateStr < new Date().toISOString().split('T')[0];
}

function getDaysUntil(dateStr) {
  if (!dateStr) return null;
  const today = new Date(); today.setHours(0,0,0,0);
  const target = new Date(dateStr);
  return Math.round((target - today) / 86400000);
}

function numberInput(val) {
  const n = parseFloat(String(val).replace(',', '.'));
  return isNaN(n) ? 0 : n;
}
