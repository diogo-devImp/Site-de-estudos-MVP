"""Cálculo avançado de progresso (OpenSpec: add-advanced-progress-forecast).

Funções puras: recebem listas de dicts (disciplinas/tarefas) e devolvem dicts.
Nada aqui acessa Firestore ou FastAPI, o que permite testar sem infraestrutura.
"""
import re
from datetime import date, timedelta
from typing import Any, Optional

from utils import normalizar_texto, parse_data

JANELA_VELOCIDADE_DIAS = 14   # janela usada para medir o ritmo recente
HORAS_PADRAO = 60             # carga horária assumida quando ausente/inválida
LIMITE_PREVISAO_DIAS = 365    # acima disso a previsão é tratada como "muito distante"
MAX_ALERTAS = 10


def esta_concluida(tarefa: dict) -> bool:
    return normalizar_texto(tarefa.get("status")) == "concluida"


def extrair_horas(carga: Any, padrao: int = HORAS_PADRAO) -> int:
    """'80 horas' -> 80; '60h' -> 60; vazio/0/inválido -> padrão."""
    achado = re.search(r"\d+", str(carga or ""))
    horas = int(achado.group()) if achado else padrao
    return horas if horas > 0 else padrao


def aplicar_data_conclusao(dados: dict, anterior: Optional[dict] = None,
                           hoje: Optional[date] = None) -> dict:
    """Define `dataConclusao` com base na transição de status (valor do cliente é ignorado).

    - nova tarefa ou transição Pendente -> Concluída: hoje;
    - já estava Concluída: preserva o valor anterior (pode ser None em tarefas legadas,
      para não inventar um ritmo que nunca aconteceu);
    - não está Concluída: None.
    """
    hoje = hoje or date.today()
    resultado = dict(dados)
    resultado.pop("dataConclusao", None)

    if not esta_concluida(resultado):
        resultado["dataConclusao"] = None
    elif anterior is not None and esta_concluida(anterior):
        resultado["dataConclusao"] = anterior.get("dataConclusao")
    else:
        resultado["dataConclusao"] = hoje.isoformat()
    return resultado


def contar_concluidas_na_janela(tarefas: list, hoje: date,
                                janela: int = JANELA_VELOCIDADE_DIAS) -> int:
    inicio = hoje - timedelta(days=janela - 1)
    total = 0
    for t in tarefas:
        if not esta_concluida(t):
            continue
        data = parse_data(t.get("dataConclusao"))
        if data and inicio <= data <= hoje:
            total += 1
    return total


def prever_conclusao(total: int, pendentes: int, concluidas_na_janela: int,
                     hoje: date, janela: int = JANELA_VELOCIDADE_DIAS) -> dict:
    """Projeta a data de conclusão mantendo o ritmo da janela recente.

    status: sem_tarefas | concluida | sem_historico | muito_distante | prevista
    """
    if total == 0:
        return {"status": "sem_tarefas", "data_prevista": None, "dias_restantes": None}
    if pendentes <= 0:
        return {"status": "concluida", "data_prevista": None, "dias_restantes": 0}
    if concluidas_na_janela <= 0:
        return {"status": "sem_historico", "data_prevista": None, "dias_restantes": None}

    # ceil(pendentes / (concluidas/janela)) em aritmética inteira (sem erro de float)
    dias = -(-pendentes * janela // concluidas_na_janela)
    if dias > LIMITE_PREVISAO_DIAS:
        return {"status": "muito_distante", "data_prevista": None, "dias_restantes": dias}
    return {
        "status": "prevista",
        "data_prevista": (hoje + timedelta(days=dias)).isoformat(),
        "dias_restantes": dias,
    }


def mensagem_previsao(previsao: dict, pendentes: int) -> str:
    status = previsao["status"]
    if status == "sem_tarefas":
        return "Sem tarefas cadastradas"
    if status == "concluida":
        return "✅ Todas as tarefas concluídas"
    base = f"{pendentes} tarefa(s) pendente(s)"
    if status == "sem_historico":
        return f"{base} — sem conclusões recentes para estimar"
    if status == "muito_distante":
        return f"{base} — no ritmo atual, mais de 1 ano"
    data = parse_data(previsao["data_prevista"])
    return f"{base} — conclusão prevista em {data.strftime('%d/%m/%Y')} (~{previsao['dias_restantes']} dia(s))"


def _dentro_do_prazo(previsao: dict, disciplina: dict) -> Optional[bool]:
    """True/False quando dá para afirmar; None quando não há base (sem previsão ou sem dataFim)."""
    if previsao["status"] == "concluida":
        return True
    fim = parse_data(disciplina.get("dataFim"))
    data_prevista = parse_data(previsao.get("data_prevista"))
    if fim is None or data_prevista is None:
        return None
    return data_prevista <= fim


def calcular_metricas(ra_aluno: str, disciplinas: list, tarefas: list,
                      hoje: Optional[date] = None) -> dict:
    hoje = hoje or date.today()

    resumo = {
        "total": len(tarefas),
        "concluidas": sum(1 for t in tarefas if esta_concluida(t)),
    }
    resumo["pendentes"] = resumo["total"] - resumo["concluidas"]

    janela_global = contar_concluidas_na_janela(tarefas, hoje)
    previsao_global = prever_conclusao(resumo["total"], resumo["pendentes"], janela_global, hoje)
    velocidade = {
        "janela_dias": JANELA_VELOCIDADE_DIAS,
        "concluidas_na_janela": janela_global,
        "tarefas_por_dia": round(janela_global / JANELA_VELOCIDADE_DIAS, 3),
    }

    progresso_por_disciplina = []
    alertas_atraso = []
    alertas_risco = []
    soma_ponderada = 0.0
    total_horas = 0

    for disc in disciplinas:
        nome = disc.get("nome", "Sem nome")
        carga = disc.get("cargaHoraria", f"{HORAS_PADRAO} horas")
        horas = extrair_horas(carga)

        da_disc = [t for t in tarefas if t.get("disciplinaId") == disc.get("id")]
        total = len(da_disc)
        concluidas = sum(1 for t in da_disc if esta_concluida(t))
        pendentes = total - concluidas
        pct = round(concluidas / total * 100, 1) if total else 0

        atrasadas = 0
        for t in da_disc:
            if esta_concluida(t):
                continue
            prevista = parse_data(t.get("dataPrevista"))
            if prevista and prevista < hoje:
                dias_atraso = (hoje - prevista).days
                atrasadas += 1
                titulo = t.get("titulo", "")
                alertas_atraso.append({
                    "tipo": "atraso",
                    "disciplina": nome,
                    "tarefa": titulo,
                    "dias_atraso": dias_atraso,
                    "mensagem": f"'{titulo}' em {nome} está {dias_atraso} dia(s) atrasada.",
                })

        janela = contar_concluidas_na_janela(da_disc, hoje)
        previsao = prever_conclusao(total, pendentes, janela, hoje)
        no_prazo = _dentro_do_prazo(previsao, disc)
        if no_prazo is False:
            alertas_risco.append({
                "tipo": "risco_prazo",
                "disciplina": nome,
                "mensagem": (f"No ritmo atual, {nome} termina em "
                             f"{parse_data(previsao['data_prevista']).strftime('%d/%m/%Y')}, "
                             f"depois do fim previsto ({parse_data(disc.get('dataFim')).strftime('%d/%m/%Y')})."),
            })

        total_horas += horas
        soma_ponderada += pct * horas
        progresso_por_disciplina.append({
            "id": disc.get("id"),
            "nome": nome,
            "cargaHoraria": carga,
            "horas": horas,
            "total_tarefas": total,
            "concluidas": concluidas,
            "pendentes": pendentes,
            "progresso_pct": pct,
            "tarefas_atrasadas": atrasadas,
            "concluidas_na_janela": janela,
            "previsao": mensagem_previsao(previsao, pendentes),
            "previsao_conclusao": previsao,
            "dentro_do_prazo": no_prazo,
        })

    alertas_atraso.sort(key=lambda a: a["dias_atraso"], reverse=True)

    return {
        "ra_aluno": ra_aluno,
        "gerado_em": hoje.isoformat(),
        "progresso_global": round(soma_ponderada / total_horas, 1) if total_horas else 0,
        "progresso_por_disciplina": progresso_por_disciplina,
        "resumo_tarefas": resumo,
        "velocidade": velocidade,
        "previsao_global": {**previsao_global,
                            "mensagem": mensagem_previsao(previsao_global, resumo["pendentes"])},
        "alertas": (alertas_atraso + alertas_risco)[:MAX_ALERTAS],
    }
