"""Busca e filtros server-side (OpenSpec: add-task-subject-search-filters).

Funções puras sobre listas de dicts. Entrada inválida levanta FiltroInvalido,
que o endpoint converte em HTTP 422.
"""
from datetime import date, datetime
from typing import Optional

from utils import normalizar_texto, parse_data

STATUS_VALIDOS = {"pendente": "Pendente", "concluida": "Concluída"}


class FiltroInvalido(ValueError):
    pass


def _data_filtro(valor: Optional[str], nome: str) -> Optional[date]:
    if valor is None or str(valor).strip() == "":
        return None
    try:
        return datetime.strptime(str(valor).strip(), "%Y-%m-%d").date()
    except ValueError:
        raise FiltroInvalido(f"{nome} inválida: use o formato AAAA-MM-DD.")


def _intervalo(data_inicio: Optional[str], data_fim: Optional[str]):
    inicio = _data_filtro(data_inicio, "data_inicio")
    fim = _data_filtro(data_fim, "data_fim")
    if inicio and fim and inicio > fim:
        raise FiltroInvalido("data_inicio não pode ser posterior a data_fim.")
    return inicio, fim


def _status(valor: Optional[str]) -> Optional[str]:
    chave = normalizar_texto(valor)
    if chave in ("", "todos"):
        return None
    if chave not in STATUS_VALIDOS:
        raise FiltroInvalido("status inválido: use Pendente, Concluída ou todos.")
    return STATUS_VALIDOS[chave]


def _contem(termo: str, *campos) -> bool:
    return any(termo in normalizar_texto(c) for c in campos)


def filtrar_tarefas(tarefas: list, q: Optional[str] = None, status: Optional[str] = None,
                    disciplina_id: Optional[str] = None, data_inicio: Optional[str] = None,
                    data_fim: Optional[str] = None) -> list:
    """Combina os filtros com AND. `dataPrevista` ausente/inválida não passa em filtro de data."""
    status_canonico = _status(status)
    inicio, fim = _intervalo(data_inicio, data_fim)
    termo = normalizar_texto(q)

    resultado = []
    for t in tarefas:
        if termo and not _contem(termo, t.get("titulo"), t.get("descricao")):
            continue
        if status_canonico and normalizar_texto(t.get("status")) != normalizar_texto(status_canonico):
            continue
        if disciplina_id and t.get("disciplinaId") != disciplina_id:
            continue
        if inicio or fim:
            prevista = parse_data(t.get("dataPrevista"))
            if prevista is None:
                continue
            if inicio and prevista < inicio:
                continue
            if fim and prevista > fim:
                continue
        resultado.append(t)
    return resultado


def filtrar_disciplinas(disciplinas: list, q: Optional[str] = None,
                        data_inicio: Optional[str] = None,
                        data_fim: Optional[str] = None) -> list:
    """Texto em nome/professor/descrição; datas = disciplina vigente em algum momento do intervalo.

    dataInicio/dataFim ausentes são tratadas como intervalo aberto naquele lado.
    """
    inicio, fim = _intervalo(data_inicio, data_fim)
    termo = normalizar_texto(q)

    resultado = []
    for d in disciplinas:
        if termo and not _contem(termo, d.get("nome"), d.get("professor"), d.get("descricao")):
            continue
        if inicio or fim:
            comeca = parse_data(d.get("dataInicio"))
            termina = parse_data(d.get("dataFim"))
            if fim and comeca and comeca > fim:
                continue
            if inicio and termina and termina < inicio:
                continue
        resultado.append(d)
    return resultado
