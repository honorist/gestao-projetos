# CMPC — Gestão de Projetos de Capital

Sistema web para gestão de projetos de capital, compras, suprimentos e equipes de implantação.

## Acesso

🌐 **[honorist.github.io/gestao-projetos](https://honorist.github.io/gestao-projetos)**

## Funcionalidades

### 📊 Dashboard
Visão consolidada do portfólio com indicadores financeiros e status dos projetos.

### 📈 Portfólio
Curva S acumulada do portfólio com Linha de Base, Tendência, Realizado e projeção futura.

### 📁 Projetos
- Cadastro completo de projetos com PEP, orçamento, fases FEL e stakeholders
- Curva S financeira individual por projeto
- Gestão de compras e tarefas vinculadas
- Controle da equipe de implantação (Obras)
- Filtros por líder, coordenador, status e fase

### 🛒 Compras
- Cadastro e acompanhamento de requisições de compra
- Controle de status (RC, cotação, aprovação, PO, trânsito, recebimento)
- Vinculação a projetos e compradores

### 📋 Suprimentos
- Monitoramento do processo licitatório por compra
- Controle de datas planejadas vs realizadas (RC, ET, Carta Convite, Propostas, Análise, PO)
- Cálculo automático de atrasos
- Categorização Normal / Urgente

### ⚖️ Rateio
- Distribuição de compras compartilhadas entre múltiplos projetos
- Alocação por valor ou percentual
- Filtro por líder do projeto

### 🏗️ Obras
- Visualização da equipe de implantação por projeto
- Timeline Gantt com agrupamento por **Implantador**, **Disciplina** ou **Projeto**
- Disciplinas: EIA, Mecânica, Civil, Tec. Segurança, Tec. Meio Ambiente
- Indicador de hoje e identificação visual de ociosidade/sobrecarga

### ✅ Tarefas
- Quadro de tarefas por projeto
- Controle de prioridade, status e vencimento

### ⚙️ Configurações
- Cadastro de coordenadores, consultores, gerentes, compradores, implantadores
- Categorias CAPEX
- Backup automático e exportação/importação de dados

## Tecnologias

- **Vue 3** (CDN) — interface reativa
- **Vue Router 4** — navegação por hash
- **Chart.js 4** — gráficos e curva S
- **LocalStorage** — persistência de dados no navegador

> ⚠️ Os dados ficam salvos localmente em cada navegador. Para uso compartilhado entre usuários, seria necessário um backend.

## Atualizar o site

Após modificar os arquivos, rode no terminal:

```bash
git add .
git commit -m "descrição da alteração"
git push
```

O site atualiza automaticamente em ~1 minuto.
