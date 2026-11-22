# Portal do Aluno - IHS (EduTrack AI / Portal Acadêmico)

Sistema web desenvolvido para o gerenciamento acadêmico de estudantes do ensino superior, focado em controlo de disciplinas, tarefas, notas, frequência, documentação e situação financeira.

## 🚀 Tecnologias Utilizadas
* **Frontend:** JavaScript Vanilla (ES6+), Arquitetura baseada em Views modulares, IBM Carbon Design System.
* **Backend:** Python (FastAPI), Uvicorn.
* **Base de Dados:** Cloud Firestore (Google Firebase).
* **Controlo de Versão:** Git & GitHub.

---

## 📚 Dicionário de Dados (Schemas)

### 1. Utilizadores (`users` / `usuarios`)
Armazena as informações cadastrais e credenciais de acesso dos alunos.
* `nome` (String): Nome próprio do aluno.
* `sobrenome` (String): Sobrenome do aluno.
* `email` (String): E-mail institucional (ex: `aluno@ihs.edu.br`).
* `ra` (String): Registro Acadêmico único.
* `senha` (String): Palavra-passe de acesso.
* `curso` (String): Curso superior matriculado (ex: *Engenharia de Software*, *Ciência da Computação (CC)*, *Análise e Desenvolvimento de Sistemas (ADS)*, *Sistemas de Informação (SI)*).
* `semestre` (String): Semestre letivo atual (ex: *1º Semestre - Noturno*).

### 2. Disciplinas (`subjects` / `disciplinas`)
Matérias cursadas pelo aluno no semestre.
* `id` (String): Identificador único gerado pelo Firestore.
* `ra_aluno` (String): RA do aluno associado à disciplina (isolamento por utilizador).
* `nome` (String): Nome da disciplina.
* `professor` (String): Professor responsável.
* `cargaHoraria` (String): Carga horária total (ex: `80 horas`).
* `semestre` (String): Semestre da disciplina.
* `cor` (String): Cor de identificação visual (Hex).
* `descricao` (String): Ementa ou tópicos principais.
* `dataInicio` / `dataFim` (String): Período de vigência.

### 3. Tarefas Acadêmicas (`academic_tasks` / `tarefas`)
Atividades e trabalhos associados às disciplinas.
* `id` (String): Identificador único.
* `ra_aluno` (String): RA do aluno associado.
* `disciplinaId` (String): ID da disciplina vinculada.
* `titulo` (String): Título da tarefa.
* `descricao` (String): Detalhes da entrega.
* `dataPrevista` (String): Data limite de entrega.
* `status` (String): Estado atual (`Pendente` ou `Concluída`).
* `dataConclusao` (String, opcional): `AAAA-MM-DD`, definida **pelo servidor** ao concluir a tarefa e removida ao reabri-la. Base do cálculo de velocidade e previsão. Tarefas concluídas antes deste campo existir ficam sem data.

### 4. Notas e Faltas (`notas`)
Controlo de desempenho por avaliações.
* `id` (String): Identificador único.
* `ra_aluno` (String): RA do aluno.
* `disciplina` (String): Nome da disciplina.
* `av1` / `av2` (Number): Notas das avaliações (0.0 a 10.0).
* `media` (Number): Média aritmética ponderada.
* `faltas` (Number): Controlo de faltas acumuladas.
* `status` (String): Situação acadêmica (`Aprovado`, `Reprovado` ou `Em curso`).

---

## 🔌 APIs do Modelo de Dados (FastAPI Endpoints)

O backend em Python expõe os seguintes endpoints REST principais:

* **Autenticação:**
  * `POST /login` — Valida as credenciais por E-mail ou RA e retorna a sessão do aluno.
  * `POST /usuarios/` — Regista um novo aluno no sistema.
  * `POST /recuperar-senha` — Processa o pedido de recuperação de senha por e-mail.
  * `POST /redefinir-senha` — Atualiza a nova senha do utilizador na base de dados.

* **Disciplinas (CRUD Completo):**
  * `POST /disciplinas/` — Cria uma nova disciplina vinculada ao RA do aluno.
  * `GET /disciplinas/{ra_aluno}` — Lista todas as disciplinas do aluno logado. Filtros opcionais: `q` (nome/professor/descrição, sem distinção de acentos), `data_inicio`, `data_fim` (`AAAA-MM-DD`; disciplinas vigentes no período).
  * `PUT /disciplinas/{id}` — Atualiza os dados de uma disciplina.
  * `PATCH /disciplinas/{id}` — Atualização parcial: só os campos enviados são alterados. Exige que a disciplina seja do aluno do token (`403`/`404` caso contrário).
  * `GET /disciplinas/{ra_aluno}/busca` — Busca híbrida: disciplinas cujo **nome** casa com `q` **OU** (com `atrasadas=true`) que têm tarefas pendentes atrasadas. Cada item traz `tarefas_atrasadas`, `motivos` e `relevancia`.
  * `DELETE /disciplinas/{id}` — Remove uma disciplina.

* **Tarefas (CRUD Completo):**
  * `POST /tarefas/` — Regista uma nova tarefa.
  * `GET /tarefas/{ra_aluno}` — Lista as tarefas do aluno. Filtros opcionais (combinados com E): `q` (título/descrição), `status` (`Pendente`, `Concluída` ou `todos`), `disciplina_id`, `data_inicio`, `data_fim` (sobre `dataPrevista`). Parâmetros inválidos retornam `422`.
  * `PUT /tarefas/{id}` — Atualiza uma tarefa ou o seu status.
  * `PATCH /tarefas/{id}` — Atualização parcial (ex.: só `status`). `dataConclusao` continua sendo definida pelo servidor.
  * `DELETE /tarefas/{id}` — Remove uma tarefa.

* **Métricas (Python, `metrics.py`):**
  * `GET /metricas/{ra_aluno}` — Progresso global ponderado por carga horária, progresso por disciplina, previsão de conclusão (ritmo dos últimos 14 dias), alertas de atraso e de risco de prazo.

* **Relatório em PDF (Python, `reports.py` + `reportlab`):**
  * `POST /relatorios/{ra_aluno}/gerar` — Gera o PDF de progresso e devolve `arquivo` e `download_url`.
  * `GET /relatorios/{ra_aluno}/download/{arquivo}` — Baixa o PDF (`Content-Disposition: attachment`). Exige o JWT do próprio aluno.

* **Documentação & Notas:**
  * `GET /documentos/{ra_aluno}` — Retorna o status da entrega de documentos obrigatórios.
  * `POST /documentos/upload/` — Faz upload de comprovativos e atualiza o status.
  * `GET /notas/{ra_aluno}` — Retorna o boletim acadêmico.
  * `POST /notas/` / `PUT /notas/{id}` — Regista e atualiza notas e faltas com cálculo automático de média.

---

## 🛠️ Como Executar o Projeto Localmente

1. **Backend (Python):**
   ```bash
   uvicorn main:app --reload 
   python server.py
   http://127.0.0.1:8000/docs
   

### Dependências do backend

```bash
pip install -r requirements.txt
```

O backend utiliza JWT para proteger as rotas de disciplinas, tarefas e métricas. O token é enviado pelo frontend no header `Authorization: Bearer <token>`.

---

### Script de progresso

```bash
python scripts/calculate_progress.py --completed 3 --total 4
# {"percentage": 75.0, "completed": 3, "total": 4}
```

Com `total = 0` devolve `percentage: 0` (sem divisão por zero). Entrada inválida devolve `{"error": ...}` e código de saída 1.

---

## 🧪 Testes

A lógica de negócio em Python (`metrics.py`, `filters.py`, `utils.py`) não depende do Firestore e é testada com a biblioteca padrão:

```bash
python -m unittest discover -s tests -t . -v
```

---

## 📐 OpenSpec (Spec-Driven Development)

As mudanças são propostas em `openspec/changes/<id>/` (`proposal.md`, `design.md`, `tasks.md` e `specs/`), implementadas e então arquivadas com `openspec archive`, o que atualiza `openspec/specs/`.

| Change | Feature da especificação | Status |
|---|---|---|
| `add-advanced-progress-forecast` | 5. Cálculo avançado de progresso | implementada (falta validação manual e arquivamento) |
| `add-task-subject-search-filters` | 6. Busca e filtros avançados | implementada (falta validação manual e arquivamento) |

| `add-progress-calculation-script` | Tarefa 12: script `calculate_progress.py` | implementada (falta validar e arquivar) |
| `add-partial-update-endpoints` | Tarefa 13: PATCH de disciplinas e tarefas | implementada (falta validar e arquivar) |
| `add-hybrid-subject-search` | Tarefa 14: busca híbrida (nome OU atrasadas) | implementada (falta validar e arquivar) |
| `add-pdf-progress-report` | Tarefa 15: relatório de progresso em PDF | implementada (falta validar e arquivar) |
| `add-bottom-navbar-and-assets` | Tarefa 09: NavBar inferior e `assets/icons/` | implementada (falta validar e arquivar) |

Regras para os agentes de IA (escopo, segurança, formato do OpenSpec): ver `AGENTS.md`.

Próximas changes previstas: tempo estimado/real nas tarefas, insights com IA e alertas de prazo próximo.
