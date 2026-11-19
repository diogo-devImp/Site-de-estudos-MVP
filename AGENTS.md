# Instruções para Agentes de IA EduTrack AI

## Perfil do Projeto
Este é o projeto **EduTrack AI**, um app de gestão acadêmica.
**Frontend:** Web / App do projeto
**Backend:** Firebase (Firestore / Auth)
**Metodologia:** Spec-Driven Development (OpenSpec)
**IA Assistente:** Gemini Code Assist (Google Cloud)

## Customizações do EduTrack AI
### Nomenclatura Específica
1. **Língua:** Código e variáveis sempre em **INGLÊS**.
2. **Banco de Dados:** Use `snake_case` (ex: `subjects`, `user_id`).
3. **Proposals OpenSpec:** Use `kebab-case` (ex: `add-subjects-table`).

### Conhecimento do Schema
1. **Coleção / Autenticação Existente:** A estrutura de autenticação e usuários já existe no Firebase (`usuarios` / Auth).
2. **Relacionamentos:** Sempre use `user_id` para vincular dados ao usuário autenticado.

### Regras de Segurança
1. Toda query ao banco DEVE filtrar por `user_id` do usuário autenticado.

### OBRIGATÓRIO: Consulte openspec/AGENTS.md
**ANTES de criar qualquer proposal ou `specs/spec.md`:**
**VOCÊ DEVE usar `read_file` para ler `openspec/AGENTS.md` COMPLETO.**
Este arquivo contém a estrutura obrigatória do `proposal.md` (`## Why`, `## What Changes`, `## Impact`) e os formatos de delta corretos.

### IMPORTANTE: Formato de `specs/spec.md` em changes/
**Arquivos `specs/spec.md` dentro de `openspec/changes/<id>/specs/spec.md` são DELTAS.**
Use:
`## ADDED Requirements` (NÃO use apenas `## Requirements`)
`## MODIFIED Requirements` (para alterações)
`## REMOVED Requirements` (para remoções)

### Escopo de Tarefas (CRÍTICO)
**O arquivo `tasks.md` deve conter APENAS as tarefas solicitadas pelo usuário.**
Se o usuário pedir "criar tabela X", NÃO adicione automaticamente: API CRUD, testes ou frontend.
Se o usuário pedir "criar API para Y", NÃO adicione automaticamente: testes ou frontend.
Adicione tarefas extras SOMENTE se explicitamente solicitado.

### Responsabilidade da IA
**SUA TAREFA TERMINA NA GERAÇÃO DOS ARQUIVOS.**
- Criar/editar arquivos (`specs/spec.md`, `tasks.md`)
- Marcar tasks completas em `tasks.md`
- NÃO tente fazer push, sync ou deploy externo automático sem revisão
**O desenvolvedor é responsável por revisar e fazer push manualmente.**