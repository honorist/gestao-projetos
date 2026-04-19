window.OrientacoesView = {
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Orientações</h1>
          <div class="subtitle">Documentação e procedimentos para acesso à CMPC</div>
        </div>
      </div>

      <!-- Cards de seção -->
      <div style="display:flex;flex-direction:column;gap:20px">

        <!-- Informações Importantes -->
        <div class="card">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
            <span style="font-size:22px">🚨</span>
            <div style="font-size:16px;font-weight:700;color:var(--danger)">Informações Importantes — Credenciamento</div>
          </div>
          <p style="margin-bottom:12px">Para os técnicos acessarem a CMPC, o <strong>credenciamento deve estar aprovado</strong>. O credenciamento é realizado através da plataforma Rainbow, vinculado ao pedido/contrato.</p>
          <div class="alert alert-danger" style="margin-bottom:12px">
            Só efetuem o deslocamento se o credenciamento estiver aprovado — caso contrário, não conseguirão acessar a planta. Atentar-se para os exames específicos solicitados.
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:10px">
            <a href="https://cmpc.rainbowtec.com.br/User.Login.aspx" target="_blank" class="btn btn-primary">
              🌐 Plataforma Rainbow
            </a>
            <a href="https://drive.google.com/drive/folders/0AOjCsxbwIHgZUk9PVA" target="_blank" class="btn btn-secondary">
              📁 Instruções Credenciamento CMPC
            </a>
          </div>
        </div>

        <!-- AST -->
        <div class="card">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
            <span style="font-size:22px">📋</span>
            <div style="font-size:16px;font-weight:700">AST — Análise de Segurança da Tarefa</div>
          </div>
          <p style="margin-bottom:12px">A AST é documento <strong>obrigatório</strong> para execução de serviços no site da CMPC. Objetiva identificar e planejar previamente todas as atividades de segurança necessárias para a execução dos trabalhos.</p>
          <p style="margin-bottom:12px">O Formulário Padrão (FR-GSS-0010) está disponível no link de procedimentos, item Formulários.</p>
          <div class="alert alert-warning" style="margin-bottom:12px">
            A contratada deve entregar as ASTs devidamente preenchidas no prazo de até <strong>10 dias antes</strong> do início da Parada Geral ou dos serviços de preparativos (Pré-PG).
          </div>
          <a href="https://drive.google.com/drive/folders/16BlVR27TQEzSlpvLd8G7EF6VCpN5fE8p" target="_blank" class="btn btn-secondary">
            📁 Formulários e Procedimentos AST
          </a>
        </div>

        <!-- Integração de Segurança -->
        <div class="card">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
            <span style="font-size:22px">🛡️</span>
            <div style="font-size:16px;font-weight:700">Programa de Integração de Segurança CMPC</div>
          </div>
          <p style="margin-bottom:10px">Para acessar a CMPC é necessário realizar o processo de integração de segurança. O processo ocorre de forma <strong>100% online</strong>.</p>
          <p style="margin-bottom:10px">Solicite o link de acesso pelo e-mail: <a href="mailto:integracao@cmpcrs.com.br" style="color:var(--green);font-weight:600">integracao@cmpcrs.com.br</a></p>
          <ul style="margin:12px 0 12px 20px;display:flex;flex-direction:column;gap:6px;font-size:14px">
            <li>A integração deve ser realizada de forma <strong>individual por CPF</strong>.</li>
            <li>O colaborador deve assistir ao vídeo até o final para a avaliação ser disponibilizada.</li>
            <li>A prova é online e individual — prazo até às 17h do dia da integração.</li>
            <li>Para Parada Geral, as integrações são lançadas diariamente.</li>
          </ul>
          <div class="alert alert-danger">
            <strong>IMPORTANTE:</strong> Caso o colaborador não conclua a prova individual e o aceite dos termos da CMPC, todo o processo deverá ser realizado novamente.
          </div>
        </div>

        <!-- Medição de Serviços -->
        <div class="card">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
            <span style="font-size:22px">📊</span>
            <div style="font-size:16px;font-weight:700">Medição de Serviços</div>
          </div>
          <p style="margin-bottom:12px">Após conclusão dos serviços, a contratada deverá emitir um <strong>Boletim de Medição</strong> completo para consolidação com o Gestor Técnico da CMPC.</p>
          <p style="margin-bottom:12px">A emissão da Nota Fiscal somente será liberada após a <strong>aprovação do Boletim de Medição</strong> e da abertura de processo no Portal ZEEV, com os documentos e o Termo de Liberação de Faturamento devidamente assinados.</p>
          <div style="display:flex;flex-direction:column;gap:8px;font-size:14px">
            <div style="padding:10px 14px;background:var(--bg);border-radius:6px;border-left:3px solid var(--green)">
              <strong>Contrato por Hora/Homem:</strong> Medição via Relatório Diário de Obra (ANEXO L).
            </div>
            <div style="padding:10px 14px;background:var(--bg);border-radius:6px;border-left:3px solid var(--info)">
              <strong>Contrato por Unidade:</strong> Medição via Boletim de Medição (ANEXO M) + Relatório Técnico. <span style="color:var(--warning)">5% retido até entrega do Relatório Técnico consolidado.</span>
            </div>
            <div style="padding:10px 14px;background:var(--bg);border-radius:6px;border-left:3px solid var(--warning)">
              Abrir um processo no ZEEV para cada linha do Pedido de Compras.
            </div>
          </div>
        </div>

        <!-- Zeev -->
        <div class="card">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
            <span style="font-size:22px">💻</span>
            <div style="font-size:16px;font-weight:700">Acesso ao ZEEV</div>
          </div>
          <p style="margin-bottom:12px">Acesse o sistema ZEEV da CMPC em: <a href="http://cmpc.zeev.it" target="_blank" style="color:var(--green);font-weight:600">http://cmpc.zeev.it</a></p>
          <div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:14px">
            <a href="https://drive.google.com/drive/folders/176CTpPwlu3HMTlesefnU2MBsnrc6EC4-?usp=sharing" target="_blank" class="btn btn-secondary">
              📁 Manual do ZEEV
            </a>
            <a href="https://drive.google.com/drive/folders/1Sm-Yip_NKAbvojhLRUi3S_qyQNy-6JXI" target="_blank" class="btn btn-secondary">
              📁 Manual de Credenciamento
            </a>
          </div>
          <div style="font-size:13px;color:var(--text-mid)">
            Ainda não possui acesso? Suporte CMPC: <strong>(51) 2139-7220</strong> · <a href="mailto:atendimento@cmpcrs.com.br" style="color:var(--green)">atendimento@cmpcrs.com.br</a>
          </div>
        </div>

        <!-- Contatos -->
        <div class="card">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
            <span style="font-size:22px">📞</span>
            <div style="font-size:16px;font-weight:700">Contatos — Credenciamento</div>
          </div>
          <div class="info-grid" style="gap:16px">
            <div style="padding:14px;background:var(--bg);border-radius:8px;border:1px solid var(--border)">
              <div class="form-label" style="margin-bottom:6px">Credenciamento de Empresa e Empregados</div>
              <div style="font-size:13px"><a href="mailto:gestaoterceiros@cmpcrs.com.br" style="color:var(--green)">gestaoterceiros@cmpcrs.com.br</a></div>
              <div style="font-size:13px;color:var(--text-mid);margin-top:2px">(51) 2139-1091 / 2139-1089</div>
            </div>
            <div style="padding:14px;background:var(--bg);border-radius:8px;border:1px solid var(--border)">
              <div class="form-label" style="margin-bottom:6px">Documentação de Saúde</div>
              <div style="font-size:13px"><a href="mailto:simone.martins@cmpcrs.com.br" style="color:var(--green)">simone.martins@cmpcrs.com.br</a></div>
              <div style="font-size:13px;color:var(--text-mid);margin-top:2px">(51) 2139-7785</div>
            </div>
            <div style="padding:14px;background:var(--bg);border-radius:8px;border:1px solid var(--border)">
              <div class="form-label" style="margin-bottom:6px">Segurança do Trabalho e Veículos Pesados</div>
              <div style="font-size:13px"><a href="mailto:bruna.souza@cmpcrs.com.br" style="color:var(--green)">bruna.souza@cmpcrs.com.br</a></div>
              <div style="font-size:13px;color:var(--text-mid);margin-top:2px">(51) 2139-7784</div>
            </div>
            <div style="padding:14px;background:var(--bg);border-radius:8px;border:1px solid var(--border)">
              <div class="form-label" style="margin-bottom:6px">Credenciamento de Veículos Leves</div>
              <div style="font-size:13px"><a href="mailto:patrimonial@cmpcrs.com.br" style="color:var(--green)">patrimonial@cmpcrs.com.br</a></div>
              <div style="font-size:13px;color:var(--text-mid);margin-top:2px">(51) 2139-7408 · Luis Fernando</div>
            </div>
          </div>
        </div>

        <!-- EPIs -->
        <div class="card">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
            <span style="font-size:22px">🦺</span>
            <div style="font-size:16px;font-weight:700">EPIs Necessários para Visita em Campo</div>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:10px">
            <div style="display:flex;align-items:center;gap:8px;padding:10px 16px;background:var(--bg);border-radius:8px;border:1px solid var(--border);font-size:14px">
              🪖 Capacete com jugular
            </div>
            <div style="display:flex;align-items:center;gap:8px;padding:10px 16px;background:var(--bg);border-radius:8px;border:1px solid var(--border);font-size:14px">
              🦺 Camisa manga longa com faixas reflexivas
            </div>
            <div style="display:flex;align-items:center;gap:8px;padding:10px 16px;background:var(--bg);border-radius:8px;border:1px solid var(--border);font-size:14px">
              👖 Calça
            </div>
            <div style="display:flex;align-items:center;gap:8px;padding:10px 16px;background:var(--bg);border-radius:8px;border:1px solid var(--border);font-size:14px">
              🥾 Botina
            </div>
            <div style="display:flex;align-items:center;gap:8px;padding:10px 16px;background:var(--bg);border-radius:8px;border:1px solid var(--border);font-size:14px">
              👓 Óculos de ampla visão (não são aceitos óculos comuns)
            </div>
            <div style="display:flex;align-items:center;gap:8px;padding:10px 16px;background:var(--bg);border-radius:8px;border:1px solid var(--border);font-size:14px">
              😷 Máscara de fuga
            </div>
          </div>
        </div>

      </div>
    </div>
  `
};
