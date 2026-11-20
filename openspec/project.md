# Project Context

## Purpose
EduTrack AI / Portal do Aluno: aplicação web para estudantes de cursos técnicos/superiores
acompanharem disciplinas, tarefas e progresso acadêmico, com métricas e insights calculados em Python.
Projeto do curso de Spec-Driven Development (OpenSpec) — o aluno escreve a proposta, a IA implementa,
o aluno valida.

## Tech Stack
- Backend: Python 3 + FastAPI + Uvicorn, autenticação JWT (PyJWT)
- Banco: Cloud Firestore (firebase-admin)
- Frontend: JavaScript Vanilla (ES modules), IBM Carbon Design System, Chart.js
- Testes: `unittest` (stdlib) — `python -m unittest discover -s tests -t .`

## Project Conventions

### Code Style
- Python: lógica de negócio em **funções puras** (`metrics.py`, `filters.py`, `utils.py`), sem importar
  Firestore/FastAPI, para poder testar sem infraestrutura. `main.py` apenas orquestra (I/O + HTTP).
- Nomes de campos de domínio em camelCase no Firestore (`disciplinaId`, `dataPrevista`, `dataConclusao`);
  nomes de coleções/parâmetros de query em snake_case (`ra_aluno`, `data_inicio`).
- Datas sempre `AAAA-MM-DD` (string). Status de tarefa: `Pendente` | `Concluída`.

### Architecture Patterns
- Frontend: `js/services/*` (chamadas HTTP) + `js/views/*` (renderização). Sem lógica de negócio nova no JS.
- Todas as rotas de disciplinas/tarefas/métricas exigem `Authorization: Bearer <JWT>`; o RA vem do token.

### Testing Strategy
- Todo requisito (`#### Scenario`) das specs deve ter ao menos um teste em `tests/`.
- Endpoints dependem do Firestore e são verificados manualmente (`/docs` do FastAPI).

### Git Workflow
- Uma change do OpenSpec por branch/PR; ao concluir: `openspec archive <change-id>`.

## Domain Context
- Coleções: `usuarios`, `disciplinas`, `tarefas` (`academic_tasks`), `notas`, `documentos`.
- Progresso de uma disciplina = % de tarefas concluídas; progresso global é ponderado pela carga horária.

## Important Constraints
- Respostas de API < 2 s; escalável para 1000+ usuários.
- Dados privados por usuário (um aluno nunca vê dados de outro RA).

## External Dependencies
- Firebase/Firestore (credencial em `servicekey.json`, fora do Git).
