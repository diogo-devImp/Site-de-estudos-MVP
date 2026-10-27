"""Utilitários compartilhados pelos módulos de lógica pura (metrics, filters).

Sem dependência de FastAPI/Firestore, para poder ser testado isoladamente.
"""
import unicodedata
from datetime import date, datetime
from typing import Any, Optional


def normalizar_texto(valor: Any) -> str:
    """minúsculas + sem acentos + sem espaços nas pontas ('Concluída' -> 'concluida')."""
    if valor is None:
        return ""
    decomposto = unicodedata.normalize("NFKD", str(valor))
    sem_acentos = "".join(c for c in decomposto if not unicodedata.combining(c))
    return sem_acentos.strip().lower()


def parse_data(valor: Any) -> Optional[date]:
    """Converte 'AAAA-MM-DD' (ou ISO datetime) em date. Retorna None se vazio/inválido."""
    if isinstance(valor, datetime):
        return valor.date()
    if isinstance(valor, date):
        return valor
    if not valor:
        return None
    try:
        return datetime.strptime(str(valor).strip()[:10], "%Y-%m-%d").date()
    except ValueError:
        return None
