import io
import unittest
from datetime import date, datetime

from metrics import calcular_metricas
from reports import gerar_relatorio_pdf, nome_arquivo_relatorio, nome_arquivo_valido

HOJE = date(2026, 11, 19)
ALUNO = {"nome": "Ana", "sobrenome": "Souza", "ra": "123456", "curso": "ADS", "semestre": "3º Semestre"}


def gerar(disciplinas, tarefas, aluno=ALUNO):
    metricas = calcular_metricas("123456", disciplinas, tarefas, HOJE)
    buffer = io.BytesIO()
    gerar_relatorio_pdf(metricas, aluno, buffer, HOJE)
    return buffer.getvalue()


class GerarPDF(unittest.TestCase):
    def test_gera_pdf_valido(self):
        pdf = gerar(
            [{"id": "d1", "nome": "Banco de Dados", "cargaHoraria": "80 horas"}],
            [{"disciplinaId": "d1", "status": "Concluída", "dataConclusao": "2026-11-15"}],
        )
        self.assertTrue(pdf.startswith(b"%PDF-"))
        self.assertGreater(len(pdf), 1000)

    def test_sem_disciplinas_nem_tarefas_nao_quebra(self):
        self.assertTrue(gerar([], []).startswith(b"%PDF-"))

    def test_caracteres_especiais_e_emoji_nao_quebram(self):
        pdf = gerar([{"id": "d1", "nome": "Cálculo <I> & Álgebra ✅", "cargaHoraria": "60"}],
                    [{"disciplinaId": "d1", "status": "Concluída", "titulo": "Lista <b>1</b>"}])
        self.assertTrue(pdf.startswith(b"%PDF-"))

    def test_aluno_incompleto_nao_quebra(self):
        self.assertTrue(gerar([], [], aluno={"ra": "1"}).startswith(b"%PDF-"))

    def test_muitas_disciplinas_gera_varias_paginas(self):
        disciplinas = [{"id": str(i), "nome": f"Disciplina {i}", "cargaHoraria": "60"} for i in range(80)]
        self.assertTrue(gerar(disciplinas, []).startswith(b"%PDF-"))


class NomeDeArquivo(unittest.TestCase):
    def test_formato_do_nome(self):
        nome = nome_arquivo_relatorio("123456", datetime(2026, 11, 19, 10, 30, 5))
        self.assertEqual(nome, "relatorio_123456_20261119_103005.pdf")

    def test_ra_com_caracteres_estranhos_e_limpo(self):
        nome = nome_arquivo_relatorio("../12 34", datetime(2026, 11, 19, 10, 30, 5))
        self.assertEqual(nome, "relatorio_1234_20261119_103005.pdf")

    def test_aceita_arquivo_do_proprio_ra(self):
        self.assertTrue(nome_arquivo_valido("123456", "relatorio_123456_20261119_103005.pdf"))

    def test_recusa_arquivo_de_outro_ra(self):
        self.assertFalse(nome_arquivo_valido("123456", "relatorio_999999_20261119_103005.pdf"))

    def test_recusa_path_traversal(self):
        for ruim in ("../servicekey.json", "..\\x.pdf", "relatorio_123456_../../x.pdf",
                     "relatorio_123456_20261119_103005.pdf/../../x"):
            self.assertFalse(nome_arquivo_valido("123456", ruim), ruim)


if __name__ == "__main__":
    unittest.main()
