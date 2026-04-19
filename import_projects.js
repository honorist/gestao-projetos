(function () {
  if (localStorage.getItem('gp_import_projects_v1')) return;

  const STORAGE_KEY = 'gp_data_v1';
  function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  const cm = {
    'Honório': 'Honorio Dias Barbosa Filho',
    'Honorio': 'Honorio Dias Barbosa Filho',
    'Barbara': 'Barbara Crysthine Sousa Lopes',
    'Mario':   'Mario Luis de Souza Terres',
    'Marcelo': 'Marcelo Custodio Stahl',
    'Vitor':   'Vitor Schneider Abrahao',
    'Winston': 'Winston de Oliveira Ruibacki',
    'Jorge / Felipe': 'Jorge Augusto Barbosa Do Santos',
    'Marcos':  '',
    'Everton': 'Everton Menezes da Silva',
  };

  const list = [
    ['Honório',       '504-E.23.2.04362.381', 'QUEIMA DE H2 FORNO DE CAL UG1'],
    ['Barbara',       '504-E.25.2.00005.330', 'ACESSIBILIDADE ÁREA ADMINISTRATIVA - FASE 3'],
    ['Mario',         '504-M.24.2.00004.700', 'Centro de Controle Ambiental'],
    ['Marcelo',       '504-E.24.2.00045.729', 'Atualização Tecnológica sistema de automação G2'],
    ['Vitor',         '504-E.24.2.00030.796', 'TUBULAÇÃO DA LAGOA DE PROCESSO 2 PARA ETE G2'],
    ['Vitor',         '504-M.25.2.00017.750', 'Proteções preparo de madera (separação cascas)'],
    ['Marcelo',       '504-E.25.2.00002.775', 'Actualización Tecnológica de Sistema de Automatización T3000 2/2'],
    ['Winston',       '504-E.25.2.00011.590', 'Substituição da Rede de água de incêndio (UG1) - Fase 1/5'],
    ['Honório',       '504-E.24.2.00044.452', 'INSTALAÇÃO DE BUNKER PARA CARGA / DESCARGA DE CLORO LÍQUIDO'],
    ['Barbara',       '504-M.25.2.00011.330', 'MODERNIZAÇÃO DO CENTRO DE TREINAMENTO'],
    ['Barbara',       '504-E.23.2.04372.762', 'Ampliação da Capacidade do Armaz.Celulose'],
    ['Jorge / Felipe','504-M.25.2.00020.703', 'Chuveiro Lava - Olhos Fase 3/5'],
    ['Marcelo',       '504-E.24.2.00062.700', 'Chuveiros de alte pressão do Kamyr'],
    ['Jorge / Felipe','504-E.25.2.00037.601', 'Defapa - Condições de Segurança Estruturais'],
    ['Vitor',         '504-E.24.2.00041.703', 'NOVA REDE DE ÁGUA POTÁVEL - UG1 (FASE 2 UG2)'],
    ['Mario',         '504-M.24.2.00002.752', 'INDEXADOR DE FACAS LINHA 100 E LINHA 300'],
    ['Barbara',       '504-M.25.2.00005.221', 'Instalação de defensas nos terminais portuários de Guaíba e de Pelotas'],
    ['Marcos',        '504-M.25.2.00010.771', 'Melhoria do sistema de limpeza do duto de cinzas do Eco 1 da CR2'],
    ['Winston',       '504-E.25.2.00009.703', 'ADEQUAÇÃO DO SISTEMA DE ÁGUA DE SERVIÇO - FASE 3/8'],
    ['Vitor',         '504-E.23.2.07500.750', 'Substituição da Peneira 403'],
    ['Barbara',       '504-E.24.2.00040.703', 'NOVA REDE DE ESGOTO SANITÁRIO (REFEITÓRIO E EDIFÍCIOS ADM - FASE 2/3)'],
    ['Barbara',       '504-E.25.2.00017.330', 'NOVA REDE DE ESGOTO SANITÁRIO (REFEITÓRIO E EDIFÍCIOS ADMINISTRATIVOS) - FASE 3/4'],
    ['Mario',         '504-M.25.2.00003.700', 'Sistema de Acionamento Geral de Emergência'],
    ['Honório',       '504-M.25.2.00007.571', 'Instalação de seccionadoras'],
    ['Honório',       '504-M.24.2.00001.700', 'SEGURANÇA DE PEDESTRES (FASE 3/3)'],
    ['Barbara',       '504-E.24.2.00059.700', 'REFORMA DA ÁREA OPERACIONAL DO RESTAURANTE SODELI + NOVA COZINHA'],
    ['Vitor',         '504-M.25.2.00004.752', 'Instalação estrutura para movimentação de carga nas linha 100, 200, 300 e 400 do Patio'],
    ['Mario',         '504-M.25.2.00015.463', 'Dosagem de Talco Fase 2/2'],
    ['Mario',         '504-M.25.2.00014.703', 'NR-13 - Fase 2'],
    ['Marcos',        '504-M.24.2.00012.571', 'UTILIZAÇÃO LBF NOS CHUVEIROS CANALETAS SMELT CR1'],
    ['Vitor',         '504-E.22.2.04186.700', 'Drenagem Pluvial - Fase 1'],
    ['Jorge / Felipe','504-M.25.2.00013.740', 'Novo sistema de transferência ClO2 de G2 para G1'],
    ['Jorge / Felipe','504-M.25.2.00012.571', 'Novo sistema de recirculação de licor (ATT da Caldeira)'],
    ['Marcelo',       '504-M.25.2.00019.660', 'Instalação de disjuntores de entrada no painel S32, S33 e S342 (LSIG)'],
    ['Marcelo',       '504-M.25.2.00006.590', 'Gestão de Risco - Instalar gabinetes para os Inversores expostos de G1'],
    ['Mario',         '504-E.24.2.00037.463', 'Adequações NR12'],
    ['Winston',       '504-M.25.2.00001.477', 'Aumento da capacidade dos secadores de ar dos compressores de G1'],
    ['Everton',       '504-E.25.2.00035.486', 'Chute articulado silo de lodo ETE'],
    ['Marcos',        '504-E.23.2.03685.471', 'Novo Tanque de óleo combustível'],
    ['Winston',       '504-E.24.2.00031.796', 'REDUÇÃO DE ODOR ETE UG2'],
    ['Winston',       '504-E.25.2.00039.127', 'Estudo Combate Incêndio Boa Vista'],
    ['Mario',         '504-M.25.2.00018.211', 'Corredor para trânsito fauna - Acesso Privado'],
    ['Barbara',       '504-E.24.2.00039.448', 'REFORMA DOS VESTIÁRIOS CENTRAIS (FASE 2/3)'],
    ['Barbara',       '504-E.24.2.00060.700', "MELHORIAS DE ACESSIBILIDADE (PCD'S)"],
    ['Everton',       '504-M.24.2.00006.700', 'ADEQUAÇÕES NR35 (FASE 2/3)'],
    ['Honório',       '504-E.25.2.00010.703', 'Medição de gás natural'],
    ['Winston',       '504-E.24.2.00049.362', 'FECHAMENTO CIRCUITO EFLUENTE MARROM G1 (FASE 1/2)'],
    ['Everton',       '504-M.25.2.00002.222', 'Implantação de pós-tratamento em células a combustível e GM (Diesel e GLP)'],
    ['Everton',       '504-E.25.2.00042.700', 'NR-12 proteções de equipamentos (FASE 5.8)'],
    ['Everton',       '504-E.25.2.00043.700', 'Adequação NR35 - Adequações de acesso'],
    ['Honorio',       '504-E.25.2.00040.300', 'Parada Segura - G1'],
    ['Marcelo',       '504-E.25.2.00041.700', 'Mapeamento Ruído industrial'],
    ['Vitor',         '504-E.25.2.00062.700', 'Redução do uso de água - Caustificação'],
    ['Vitor',         '504-E.25.2.00063.700', 'Redução do uso de água-Planta Hidrogênio'],
    ['Barbara',       '504-M.24.2.00011.700', 'ACESSIBILIDADE (FASE 2/3)'],
    ['Marcelo',       '504-E.25.2.00036.300', 'NR-10 - INSTALAÇÕES ELÉTRICAS E PAINÉIS S5 (ETA/ETE) FASE 1/5'],
    ['Barbara',       '504-E.25.2.00001.330', 'REFORMA DOS VESTIÁRIOS CENTRAIS - FASE 3/4'],
    ['Mario',         '504-M.24.2.00014.481', 'MEDIÇÃO AUTOMÁTICA PARA DOSAGEM DE TALCO UG1'],
    ['Honório',       '504-M.25.2.00016.703', 'NR-20 Inflamáveis e explosividade'],
    ['Vitor',         '504-E.24.2.00029.763', 'NOVA LINHA DE EFLUENTE ALCALINO UG2 (FASE 2)'],
    ['Marcelo',       '504-M.25.2.00008.450', 'Instalar polarizador no retificador T71'],
    ['Barbara',       '504-E.25.2.00018.780', 'Sala para operadores na área de recuperação química UG2'],
    ['Everton',       '504-M.25.2.00009.442', 'Laboratório de Qualidade e meio Ambiente'],
    ['Vitor',         '504-E.24.2.00033.750', 'SUBSTITUIÇÃO DA PENEIRA DE CAVACO 404'],
  ];

  let raw = null;
  try { raw = JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch(e) {}
  if (!raw) raw = { _version:1, projects:[], purchases:[], tasks:[], buyers:[], coordinators:[], managers:[], consultants:[], budgetCategories:[] };

  const now = new Date().toISOString();
  let added = 0, skipped = 0;

  list.forEach(([consultant, pep, name]) => {
    if (raw.projects.some(p => p.pep === pep)) { skipped++; return; }
    raw.projects.push({
      id: uuid(), name, number: '', pep,
      unit: '', location: '',
      status: 'planning', fel_phase: 'FEL1',
      responsible: cm[consultant.trim()] ?? '',
      manager_requestor: '', maintenance: '', operations: '', safety: '', environment: '',
      start_date: '', planned_end_date: '', actual_end_date: '',
      budget: 0, objective: '', scope: '', benefit: '', description: '',
      progress_pct: 0, s_curve: [], disbursements: [], notes: '',
      created_at: now, updated_at: now
    });
    added++;
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(raw));
  localStorage.setItem('gp_import_projects_v1', '1');
  console.log('[import] Projetos adicionados:', added, '| Ignorados:', skipped);
})();
