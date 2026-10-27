import unittest
from datetime import date

from metrics import (aplicar_data_conclusao, calcular_metricas, extrair_horas,
                     prever_conclusao)

HOJE = date(2026, 3, 15)


def tarefa(disc, status="Pendente", prevista="2026-04-01", concluida_em=None, titulo="T"):
    return {"disciplinaId": disc, "status": status, "dataPrevista": prevista,
            "dataConclusao": concluida_em, "titulo": titulo}


class ExtrairHoras(unittest.TestCase):
    def test_formatos(self):
        self.assertEqual(extrair_horas("80 horas"), 80)
        self.assertEqual(extrair_horas("60h"), 60)

    def test_ausente_zero_ou_invalido_usa_padrao(self):
        for valor in (None, "", "abc", "0 horas"):
            self.assertEqual(extrair_horas(valor), 60)


class DataConclusao(unittest.TestCase):
    def test_nova_tarefa_concluida_recebe_hoje(self):
        r = aplicar_data_conclusao({"status": "Concluída"}, None, HOJE)
        self.assertEqual(r["dataConclusao"], "2026-03-15")

    def test_transicao_pendente_para_concluida(self):
        r = aplicar_data_conclusao({"status": "Concluída"}, {"status": "Pendente"}, HOJE)
        self.assertEqual(r["dataConclusao"], "2026-03-15")

    def test_reabrir_remove_data(self):
        anterior = {"status": "Concluída", "dataConclusao": "2026-03-10"}
        r = aplicar_data_conclusao({"status": "Pendente"}, anterior, HOJE)
        self.assertIsNone(r["dataConclusao"])

    def test_editar_concluida_preserva_data_original(self):
        anterior = {"status": "Concluída", "dataConclusao": "2026-03-10"}
        r = aplicar_data_conclusao({"status": "Concluída", "titulo": "novo"}, anterior, HOJE)
        self.assertEqual(r["dataConclusao"], "2026-03-10")

    def test_legada_sem_data_continua_sem_data(self):
        r = aplicar_data_conclusao({"status": "Concluída"}, {"status": "Concluída"}, HOJE)
        self.assertIsNone(r["dataConclusao"])

    def test_valor_enviado_pelo_cliente_e_ignorado(self):
        r = aplicar_data_conclusao({"status": "Pendente", "dataConclusao": "2020-01-01"}, None, HOJE)
        self.assertIsNone(r["dataConclusao"])


class Previsao(unittest.TestCase):
    def test_sem_tarefas(self):
        self.assertEqual(prever_conclusao(0, 0, 0, HOJE)["status"], "sem_tarefas")

    def test_tudo_concluido(self):
        p = prever_conclusao(4, 0, 3, HOJE)
        self.assertEqual((p["status"], p["dias_restantes"]), ("concluida", 0))

    def test_sem_historico_nao_inventa_data(self):
        p = prever_conclusao(5, 3, 0, HOJE)
        self.assertEqual(p["status"], "sem_historico")
        self.assertIsNone(p["data_prevista"])

    def test_ritmo_projeta_data(self):
        # 7 concluídas em 14 dias = 0,5/dia; 4 pendentes -> 8 dias
        p = prever_conclusao(11, 4, 7, HOJE)
        self.assertEqual((p["status"], p["dias_restantes"], p["data_prevista"]),
                         ("prevista", 8, "2026-03-23"))

    def test_arredonda_para_cima(self):
        # 1 em 14 dias; 1 pendente -> 14 dias. 3 em 14, 1 pendente -> ceil(4.67)=5
        self.assertEqual(prever_conclusao(2, 1, 1, HOJE)["dias_restantes"], 14)
        self.assertEqual(prever_conclusao(4, 1, 3, HOJE)["dias_restantes"], 5)

    def test_muito_distante(self):
        p = prever_conclusao(100, 99, 1, HOJE)  # 99*14 = 1386 dias
        self.assertEqual(p["status"], "muito_distante")
        self.assertIsNone(p["data_prevista"])


class CalcularMetricas(unittest.TestCase):
    def setUp(self):
        self.disciplinas = [
            {"id": "a", "nome": "Algoritmos", "cargaHoraria": "80 horas", "dataFim": "2026-06-30"},
            {"id": "b", "nome": "Banco de Dados", "cargaHoraria": "40 horas"},
        ]

    def test_progresso_ponderado_por_carga_horaria(self):
        tarefas = [tarefa("a", "Concluída"), tarefa("a", "Concluída"),   # A = 100%
                   tarefa("b", "Pendente"), tarefa("b", "Pendente")]     # B = 0%
        m = calcular_metricas("1", self.disciplinas, tarefas, HOJE)
        # (100*80 + 0*40) / 120 = 66,7  (média simples seria 50)
        self.assertEqual(m["progresso_global"], 66.7)

    def test_sem_disciplinas(self):
        m = calcular_metricas("1", [], [], HOJE)
        self.assertEqual(m["progresso_global"], 0)
        self.assertEqual(m["progresso_por_disciplina"], [])
        self.assertEqual(m["alertas"], [])

    def test_previsao_por_disciplina_e_global(self):
        tarefas = [tarefa("a", "Concluída", concluida_em="2026-03-14") for _ in range(7)]
        tarefas += [tarefa("a") for _ in range(4)]
        m = calcular_metricas("1", self.disciplinas, tarefas, HOJE)
        a = m["progresso_por_disciplina"][0]
        self.assertEqual(a["previsao_conclusao"]["data_prevista"], "2026-03-23")
        self.assertTrue(a["dentro_do_prazo"])
        self.assertEqual(m["velocidade"]["concluidas_na_janela"], 7)
        self.assertEqual(m["previsao_global"]["status"], "prevista")

    def test_conclusao_fora_da_janela_nao_conta(self):
        tarefas = [tarefa("a", "Concluída", concluida_em="2026-02-01"), tarefa("a")]
        m = calcular_metricas("1", self.disciplinas, tarefas, HOJE)
        self.assertEqual(m["progresso_por_disciplina"][0]["previsao_conclusao"]["status"],
                         "sem_historico")

    def test_alerta_de_risco_quando_previsao_passa_do_fim(self):
        disc = [{"id": "a", "nome": "Algoritmos", "cargaHoraria": "80 horas", "dataFim": "2026-03-20"}]
        tarefas = [tarefa("a", "Concluída", concluida_em="2026-03-14"), tarefa("a"), tarefa("a")]
        m = calcular_metricas("1", disc, tarefas, HOJE)  # 1 em 14d, 2 pendentes -> 28 dias
        self.assertFalse(m["progresso_por_disciplina"][0]["dentro_do_prazo"])
        self.assertEqual([a["tipo"] for a in m["alertas"]], ["risco_prazo"])

    def test_atrasadas_ordenadas_e_limitadas(self):
        tarefas = [tarefa("a", prevista=f"2026-03-{d:02d}", titulo=f"t{d}") for d in range(1, 13)]
        m = calcular_metricas("1", self.disciplinas, tarefas, HOJE)
        self.assertEqual(len(m["alertas"]), 10)
        self.assertEqual(m["alertas"][0]["dias_atraso"], 14)  # a mais atrasada primeiro
        self.assertEqual(m["progresso_por_disciplina"][0]["tarefas_atrasadas"], 12)

    def test_tarefa_concluida_ou_no_prazo_nao_gera_atraso(self):
        tarefas = [tarefa("a", "Concluída", prevista="2026-01-01"), tarefa("a", prevista="2026-03-15")]
        m = calcular_metricas("1", self.disciplinas, tarefas, HOJE)
        self.assertEqual(m["alertas"], [])

    def test_compatibilidade_com_campos_antigos(self):
        m = calcular_metricas("1", self.disciplinas, [tarefa("a")], HOJE)
        for chave in ("ra_aluno", "progresso_global", "progresso_por_disciplina",
                      "resumo_tarefas", "alertas"):
            self.assertIn(chave, m)
        for chave in ("id", "nome", "cargaHoraria", "horas", "total_tarefas", "concluidas",
                      "pendentes", "progresso_pct", "tarefas_atrasadas", "previsao"):
            self.assertIn(chave, m["progresso_por_disciplina"][0])
        self.assertIsInstance(m["progresso_por_disciplina"][0]["previsao"], str)


if __name__ == "__main__":
    unittest.main()
