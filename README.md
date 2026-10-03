# Portal do Aluno - Faculdade Impacta (EduTrack AI / Portal Acadêmico)

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
* `email` (String): E-mail institucional (ex: `aluno@impacta.edu.br`).
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
  * `GET /disciplinas/{ra_aluno}` — Lista todas as disciplinas do aluno logado.
  * `PUT /disciplinas/{id}` — Atualiza os dados de uma disciplina.
  * `DELETE /disciplinas/{id}` — Remove uma disciplina.

* **Tarefas (CRUD Completo):**
  * `POST /tarefas/` — Regista uma nova tarefa.
  * `GET /tarefas/{ra_aluno}` — Lista as tarefas do aluno.
  * `PUT /tarefas/{id}` — Atualiza uma tarefa ou o seu status.
  * `DELETE /tarefas/{id}` — Remove uma tarefa.

* **Documentação & Notas:**
  * `GET /documentos/{ra_aluno}` — Retorna o status da entrega de documentos obrigatórios.
  * `POST /documentos/upload/` — Faz upload de comprovativos e atualiza o status.
  * `GET /notas/{ra_aluno}` — Retorna o boletim acadêmico.
  * `POST /notas/` / `PUT /notas/{id}` — Regista e atualiza notas e faltas com cálculo automático de média.

---

## 🛠️ Como Executar o Projeto Localmente

1. **Backend (Python):**
   ```bash
   uvicorn main:app --reload --port 8000