"""Relatório de progresso em PDF (OpenSpec: add-pdf-progress-report).

Recebe o dict produzido por `metrics.calcular_metricas` e os dados do aluno,
e escreve um PDF com `reportlab`. Não acessa Firestore nem FastAPI (testável sem infraestrutura).
"""
import re
from datetime import date, datetime
from typing import Any, BinaryIO, Optional, Union
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from utils import parse_data

AZUL = colors.HexColor("#0f62fe")
CINZA = colors.HexColor("#525252")
CINZA_CLARO = colors.HexColor("#f4f4f4")
VERMELHO = colors.HexColor("#da1e28")
MAX_LINHAS_DISCIPLINAS = 100   # limite de linhas na tabela (evita PDFs enormes/lentos)
MAX_ALERTAS = 10


def _texto(valor: Any) -> str:
    """Texto seguro para o Paragraph: escapa XML e remove emojis/símbolos fora do WinAnsi
    (a fonte padrão Helvetica não os desenha)."""
    limpo = str(valor if valor is not None else "").encode("cp1252", "ignore").decode("cp1252")
    return escape(re.sub(r"\s+", " ", limpo).strip())


def _data_br(valor: Any) -> str:
    data = parse_data(valor)
    return data.strftime("%d/%m/%Y") if data else "-"


def _prefixo_relatorio(ra: str) -> str:
    ra_seguro = re.sub(r"[^A-Za-z0-9]", "", str(ra)) or "aluno"
    return f"relatorio_{ra_seguro}_"


def nome_arquivo_relatorio(ra: str, agora: Optional[datetime] = None) -> str:
    """'relatorio_<ra>_<AAAAMMDD_HHMMSS>.pdf' (ra reduzido a letras/números)."""
    agora = agora or datetime.now()
    return f"{_prefixo_relatorio(ra)}{agora.strftime('%Y%m%d_%H%M%S')}.pdf"


def nome_arquivo_valido(ra: str, arquivo: str) -> bool:
    """True só se `arquivo` tem o formato gerado por `nome_arquivo_relatorio` e pertence ao RA.

    Impede path traversal (`../`) e o download de relatórios de outro aluno."""
    return bool(re.fullmatch(re.escape(_prefixo_relatorio(ra)) + r"\d{8}_\d{6}\.pdf", str(arquivo)))


def _estilos() -> dict:
    base = getSampleStyleSheet()
    return {
        "titulo": ParagraphStyle("titulo", parent=base["Title"], fontSize=20, textColor=AZUL,
                                 alignment=0, spaceAfter=4),
        "sub": ParagraphStyle("sub", parent=base["Normal"], fontSize=10, textColor=CINZA),
        "h2": ParagraphStyle("h2", parent=base["Heading2"], fontSize=13, spaceBefore=14, spaceAfter=6),
        "celula": ParagraphStyle("celula", parent=base["Normal"], fontSize=8.5, leading=11),
        "cabecalho": ParagraphStyle("cabecalho", parent=base["Normal"], fontSize=8.5, leading=11,
                                    textColor=colors.white, fontName="Helvetica-Bold"),
        "alerta": ParagraphStyle("alerta", parent=base["Normal"], fontSize=9, leading=12,
                                 textColor=VERMELHO, leftIndent=10),
        "vazio": ParagraphStyle("vazio", parent=base["Normal"], fontSize=9, textColor=CINZA),
    }


def _cartao_resumo(metricas: dict, est: dict) -> Table:
    resumo = metricas.get("resumo_tarefas", {})
    previsao = (metricas.get("previsao_global") or {}).get("mensagem", "")
    dados = [
        [Paragraph(f"<b>{_texto(metricas.get('progresso_global', 0))}%</b>", ParagraphStyle(
            "pct", fontSize=26, leading=30, textColor=AZUL)),
         Paragraph(
             f"Progresso global (ponderado por carga horária)<br/>"
             f"Tarefas: <b>{_texto(resumo.get('concluidas', 0))}</b> concluídas de "
             f"<b>{_texto(resumo.get('total', 0))}</b> "
             f"({_texto(resumo.get('pendentes', 0))} pendentes)<br/>{_texto(previsao)}",
             est["celula"])],
    ]
    tabela = Table(dados, colWidths=[3.6 * cm, 13.4 * cm])
    tabela.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), CINZA_CLARO),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
    ]))
    return tabela


def _tabela_disciplinas(disciplinas: list, est: dict) -> Table:
    cabecalho = ["Disciplina", "Carga", "Concluídas / Total", "Progresso", "Atrasadas", "Previsão"]
    linhas = [[Paragraph(c, est["cabecalho"]) for c in cabecalho]]
    for d in disciplinas[:MAX_LINHAS_DISCIPLINAS]:
        linhas.append([
            Paragraph(_texto(d.get("nome")), est["celula"]),
            Paragraph(f"{_texto(d.get('horas', ''))} h", est["celula"]),
            Paragraph(f"{_texto(d.get('concluidas', 0))}/{_texto(d.get('total_tarefas', 0))}", est["celula"]),
            Paragraph(f"<b>{_texto(d.get('progresso_pct', 0))}%</b>", est["celula"]),
            Paragraph(_texto(d.get("tarefas_atrasadas", 0)), est["celula"]),
            Paragraph(_texto(d.get("previsao", "")), est["celula"]),
        ])
    tabela = Table(linhas, colWidths=[3.4 * cm, 1.4 * cm, 2.6 * cm, 2.0 * cm, 2.2 * cm, 5.4 * cm],
                   repeatRows=1)
    estilo = [
        ("BACKGROUND", (0, 0), (-1, 0), AZUL),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#c6c6c6")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, CINZA_CLARO]),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]
    tabela.setStyle(TableStyle(estilo))
    return tabela


def gerar_relatorio_pdf(metricas: dict, aluno: dict, destino: Union[str, BinaryIO],
                        hoje: Optional[date] = None) -> None:
    """Escreve o PDF em `destino` (caminho ou arquivo binário aberto)."""
    hoje = hoje or date.today()
    est = _estilos()
    doc = SimpleDocTemplate(
        destino, pagesize=A4, leftMargin=2 * cm, rightMargin=2 * cm,
        topMargin=2 * cm, bottomMargin=2 * cm,
        title="Relatório de Progresso Acadêmico", author="Portal do Aluno - IHS",
    )

    nome = " ".join(p for p in (aluno.get("nome"), aluno.get("sobrenome")) if p) or "Aluno"
    historia = [
        Paragraph("Relatório de Progresso Acadêmico", est["titulo"]),
        Paragraph(
            f"<b>{_texto(nome)}</b> &nbsp;|&nbsp; RA: {_texto(aluno.get('ra', metricas.get('ra_aluno', '')))}"
            f" &nbsp;|&nbsp; {_texto(aluno.get('curso', ''))} - {_texto(aluno.get('semestre', ''))}",
            est["sub"]),
        Paragraph(f"Gerado em {hoje.strftime('%d/%m/%Y')}", est["sub"]),
        Spacer(1, 12),
        _cartao_resumo(metricas, est),
        Paragraph("Progresso por disciplina", est["h2"]),
    ]

    disciplinas = metricas.get("progresso_por_disciplina") or []
    if disciplinas:
        historia.append(_tabela_disciplinas(disciplinas, est))
        if len(disciplinas) > MAX_LINHAS_DISCIPLINAS:
            historia.append(Paragraph(
                f"Exibindo as primeiras {MAX_LINHAS_DISCIPLINAS} de {len(disciplinas)} disciplinas.",
                est["vazio"]))
    else:
        historia.append(Paragraph("Nenhuma disciplina cadastrada.", est["vazio"]))

    historia.append(Paragraph("Alertas", est["h2"]))
    alertas = (metricas.get("alertas") or [])[:MAX_ALERTAS]
    if alertas:
        for a in alertas:
            historia.append(Paragraph(f"- {_texto(a.get('mensagem'))}", est["alerta"]))
    else:
        historia.append(Paragraph("Nenhum alerta de atraso ou de risco de prazo.", est["vazio"]))

    doc.build(historia)
