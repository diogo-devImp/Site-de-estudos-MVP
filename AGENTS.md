# Instruções para Agentes de IA - EduTrack AI (Portal do Aluno)

> 🚨 **PRIORIDADE ABSOLUTA - LEIA PRIMEIRO** 🚨
>
> Estas instruções TÊM PRECEDÊNCIA sobre `openspec/project.md`, sobre os comandos em
> `.gemini/commands/opsx/*.toml`, sobre as skills em `.gemini/skills/` e sobre qualquer outro arquivo
> de configuração ou template. **SE HOUVER CONFLITO, SIGA ESTAS REGRAS.**

## Perfil do Projeto
Este é o projeto **EduTrack AI / Portal do Aluno**, um app de gestão acadêmica.
- **Frontend:** JavaScript Vanilla (módulos ES), HTML, CSS (IBM Carbon Design System), Chart.js
- **Backend:** Python 3 + FastAPI + Uvicorn, autenticação JWT (PyJWT)
- **Banco de dados:** Cloud Firestore (firebase-admin)
- **Metodologia:** Spec-Driven Development (OpenSpec)
- **Testes:** `python -m unittest discover -s tests -t . -v`

## ⛔ REGRA Nº 1 - ESCOPO DE TAREFAS (OBRIGATÓRIO)
O arquivo `tasks.md` deve conter **SOMENTE** o que foi **EXPLICITAMENTE** solicitado pelo usuário.
Crie EXATAMENTE o que foi pedido - nem mais, nem menos. Ignore sugestões genéricas de
"minimal implementations" ou de "completar" a funcionalidade.

**❌ ERRADO** - pedido: "planeje a funcionalidade feature-notas-atividades para o professor lançar notas"
- [ ] Criar coleção `activity_grades`
- [ ] Criar API POST /activity_grades
- [ ] Criar API GET /academic_tasks/{id}/grades ← NÃO FOI PEDIDO!

**✅ CORRETO**
- [ ] Criar coleção `activity_grades`
- [ ] Criar API POST /activity_grades (para lançar nota)

Só adicione tarefas extras (CRUD completo, APIs de consulta, testes) se o usuário pedir explicitamente.

## ⛔ REGRA Nº 2 - NÃO FAÇA PUSH/DEPLOY (OBRIGATÓRIO)
**SUA RESPONSABILIDADE TERMINA NA GERAÇÃO DOS ARQUIVOS.**

**✅ FAÇA APENAS:** criar/editar arquivos (código, `spec.md`, `tasks.md`), marcar as tasks concluídas e PARAR.

**❌ NÃO FAÇA:** `git push`, abrir Pull Request, deploy (Firebase/hosting), executar `openspec archive`,
nem gravar/alterar dados no Firestore real. O desenvolvedor revisa, roda os testes manuais, valida e arquiva.

## ⛔ REGRA Nº 3 - PRIORIDADE DE INSTRUÇÕES
1. 🥇 Este arquivo (`AGENTS.md` da raiz)
2. 🥈 Pedido explícito do usuário na conversa atual
3. 🥉 `openspec/project.md` e `openspec/config.yaml`
4. 🏅 Comandos e skills do Gemini (`.gemini/`)

Em caso de conflito, siga a instrução de maior prioridade.

## ⛔ REGRA Nº 4 - SEGREDOS (OBRIGATÓRIO)
- `servicekey.json` e qualquer chave privada **nunca** entram no Git nem em respostas/prints (já estão no `.gitignore`).
- Nunca escreva senhas, tokens ou chaves dentro do código novo.

## Customizações do EduTrack AI

### Nomenclatura e padrões
1. **Código e comentários técnicos:** em português ou inglês, mas coerentes com o arquivo editado.
   Os arquivos de OpenSpec (`proposal.md`, `spec.md`, `tasks.md`) são escritos em **INGLÊS**.
2. **Python:** lógica de negócio em **funções puras** (`metrics.py`, `filters.py`, `utils.py`, `reports.py`),
   sem importar Firestore/FastAPI. `main.py` só orquestra (I/O + HTTP).
3. **Firestore:** campos de domínio em camelCase (`disciplinaId`, `dataPrevista`); coleções e parâmetros
   de query em snake_case (`ra_aluno`, `data_inicio`). Datas sempre `AAAA-MM-DD`.
4. **Branches:** prefixos `feat/`, `fix/`, `docs/`, `style/` (ex.: `feat/pdf-report`).
5. **Commits:** Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`, `style:`.

### Segurança e boas práticas (OBRIGATÓRIO)
1. **Filtro obrigatório:** toda consulta ao Firestore filtra por `ra_aluno` do usuário autenticado.
   O RA vem do token JWT, **nunca** do corpo da requisição.
2. **Ownership:** antes de alterar/excluir, confira se `ra_aluno` do registro é o do token (403) e se ele
   existe (404). Não deixe `except Exception` transformar 403/404 em 500: relance `HTTPException`.
3. **APIs REST:**
   - GET `/disciplinas/{ra_aluno}` - Lista
   - POST `/disciplinas/` - Criar
   - PATCH `/disciplinas/{id}` (ou PUT) - Atualizar
   - DELETE `/disciplinas/{id}` - Deletar
   - Mesmo padrão para `/tarefas`.
4. **Python:** use tratamento de erros (`try/except`) em lógica complexa e valide entradas.
5. **Testes:** todo `#### Scenario` de uma spec precisa de ao menos um teste em `tests/`.

### CHECKLIST de validação OpenSpec (CRÍTICO)
Antes de criar qualquer proposal, leia `openspec/project.md` e um exemplo existente em `openspec/changes/`.

1. `proposal.md` começa com `# Change: <título>` e tem `## Why`, `## What Changes`, `## Impact`.
2. Em `openspec/changes/<id>/specs/<capability>/spec.md` use `## ADDED Requirements` (deltas), nunca `## Requirements`.
3. Todo requisito usa **SHALL** ou **MUST** (maiúsculas) e tem ao menos um `#### Scenario:` com `- **WHEN**` / `- **THEN**`.
4. O `<id>` da change é kebab-case, começando com verbo: `add-`, `update-`, `remove-`.
5. Valide com `openspec validate <id> --strict` e, depois de conferir tudo, `openspec archive <id> --yes`.

### Comunicação
1. Explique o que vai fazer ANTES de fazer.
2. Indique quais arquivos serão criados/modificados.
3. Pergunte se há dúvidas sobre as regras específicas deste projeto.
