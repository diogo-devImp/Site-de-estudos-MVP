"""Calcula a porcentagem de progresso (concluídas / total) e devolve JSON.

Tarefa 12 / OpenSpec: add-progress-calculation-script.
Somente biblioteca padrão. Sem acesso a Firestore/FastAPI.

Uso na linha de comando:
    python scripts/calculate_progress.py --completed 3 --total 4
    echo '{"completed": 3, "total": 4}' | python scripts/calculate_progress.py

Saída (sempre JSON):
    {"percentage": 75.0, "completed": 3, "total": 4}
    {"error": "...", "percentage": 0}     <- entrada inválida (código de saída 1)
"""
import argparse
import json
import sys
from typing import Any, Optional


def _inteiro_nao_negativo(valor: Any, nome: str) -> int:
    """Converte para int >= 0. Levanta ValueError com mensagem clara se inválido."""
    if isinstance(valor, bool):
        raise ValueError(f"{nome} deve ser um número inteiro.")
    try:
        numero = int(valor)
    except (TypeError, ValueError):
        raise ValueError(f"{nome} deve ser um número inteiro.")
    if numero != float(valor):
        raise ValueError(f"{nome} deve ser um número inteiro.")
    if numero < 0:
        raise ValueError(f"{nome} não pode ser negativo.")
    return numero


def calculate_progress(completed: Any, total: Any) -> dict:
    """Retorna {"percentage", "completed", "total"}.

    - total == 0 -> percentage 0 (sem divisão por zero);
    - completed > total -> ValueError;
    - valores negativos ou não numéricos -> ValueError.
    """
    concluidas = _inteiro_nao_negativo(completed, "completed")
    total_tarefas = _inteiro_nao_negativo(total, "total")
    if concluidas > total_tarefas:
        raise ValueError("completed não pode ser maior que total.")

    percentage = round(concluidas / total_tarefas * 100, 1) if total_tarefas > 0 else 0
    return {"percentage": percentage, "completed": concluidas, "total": total_tarefas}


def _ler_entrada(argv: Optional[list]) -> tuple:
    parser = argparse.ArgumentParser(description="Calcula o progresso de uma disciplina.")
    parser.add_argument("--completed", help="tarefas concluídas")
    parser.add_argument("--total", help="total de tarefas")
    args = parser.parse_args(argv)

    if args.completed is not None or args.total is not None:
        return args.completed, args.total

    bruto = sys.stdin.read().strip()
    if not bruto:
        raise ValueError("informe --completed e --total, ou envie um JSON pela entrada padrão.")
    try:
        dados = json.loads(bruto)
    except json.JSONDecodeError:
        raise ValueError("JSON inválido na entrada padrão.")
    if not isinstance(dados, dict):
        raise ValueError('o JSON deve ser um objeto: {"completed": N, "total": N}.')
    return dados.get("completed"), dados.get("total")


def main(argv: Optional[list] = None) -> int:
    try:
        completed, total = _ler_entrada(argv)
        resultado = calculate_progress(completed, total)
    except ValueError as erro:
        print(json.dumps({"error": str(erro), "percentage": 0}, ensure_ascii=False))
        return 1
    print(json.dumps(resultado, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
