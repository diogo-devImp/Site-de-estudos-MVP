# Change: Busca e filtros avançados no backend

## Why
A Feature 6 da especificação pede "busca por tarefas/disciplinas com filtros (data, status)". Hoje a
busca existe apenas no navegador (filtra o que já foi baixado) e a API não oferece nenhum filtro.
Isso impede que qualquer outro cliente (app mobile, relatórios futuros em Python) reutilize a regra,
e a busca atual diferencia acentos ("algebra" não encontra "Álgebra").

## What Changes
- `GET /tarefas/{ra}` aceita `q`, `status`, `disciplina_id`, `data_inicio`, `data_fim` (todos opcionais).
- `GET /disciplinas/{ra}` aceita `q`, `data_inicio`, `data_fim` (todos opcionais).
- Busca de texto ignora maiúsculas/minúsculas e acentos.
- Parâmetros inválidos retornam HTTP 422 com mensagem em português.
- Sem parâmetros, o comportamento é idêntico ao atual (lista completa, mesma ordem).
- A lógica fica em `filters.py` (funções puras, testadas).

## Impact
- Capability nova: `search-filters`
- Código: `filters.py`, `utils.py` (compartilhado), `main.py` (duas rotas GET)
- Frontend: **sem mudança nesta change** — os filtros do navegador continuam funcionando e a API passa
  a estar pronta para outros clientes. Migrar as telas para filtrar no servidor fica como evolução.
- Não é breaking.
