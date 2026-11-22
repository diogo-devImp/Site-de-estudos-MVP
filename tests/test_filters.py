import unittest

from filters import FiltroInvalido, filtrar_disciplinas, filtrar_tarefas

TAREFAS = [
    {"id": "1", "titulo": "Lista de Álgebra", "descricao": "Capítulo 3", "status": "Pendente",
     "disciplinaId": "a", "dataPrevista": "2026-03-10"},
    {"id": "2", "titulo": "Projeto Integrador", "descricao": "entrega final", "status": "Concluída",
     "disciplinaId": "b", "dataPrevista": "2026-03-20"},
    {"id": "3", "titulo": "Seminário", "descricao": "", "status": "Pendente",
     "disciplinaId": "b", "dataPrevista": "2026-04-05"},
    {"id": "4", "titulo": "Sem data", "status": "Pendente", "disciplinaId": "a"},
]


def ids(lista):
    return [t["id"] for t in lista]


class FiltrarTarefas(unittest.TestCase):
    def test_sem_filtros_devolve_tudo_na_mesma_ordem(self):
        self.assertEqual(ids(filtrar_tarefas(TAREFAS)), ["1", "2", "3", "4"])

    def test_busca_sem_acento_e_sem_maiusculas(self):
        self.assertEqual(ids(filtrar_tarefas(TAREFAS, q="algebra")), ["1"])
        self.assertEqual(ids(filtrar_tarefas(TAREFAS, q="ENTREGA")), ["2"])

    def test_status_aceita_variacoes(self):
        for valor in ("Concluída", "concluida", "CONCLUIDA"):
            self.assertEqual(ids(filtrar_tarefas(TAREFAS, status=valor)), ["2"])
        self.assertEqual(ids(filtrar_tarefas(TAREFAS, status="todos")), ["1", "2", "3", "4"])

    def test_status_invalido(self):
        with self.assertRaises(FiltroInvalido):
            filtrar_tarefas(TAREFAS, status="atrasada")

    def test_intervalo_de_datas_inclusivo(self):
        r = filtrar_tarefas(TAREFAS, data_inicio="2026-03-10", data_fim="2026-03-20")
        self.assertEqual(ids(r), ["1", "2"])

    def test_tarefa_sem_data_nao_passa_em_filtro_de_data(self):
        self.assertNotIn("4", ids(filtrar_tarefas(TAREFAS, data_inicio="2000-01-01")))

    def test_combina_filtros_com_and(self):
        r = filtrar_tarefas(TAREFAS, status="Pendente", disciplina_id="b")
        self.assertEqual(ids(r), ["3"])

    def test_datas_invalidas(self):
        with self.assertRaises(FiltroInvalido):
            filtrar_tarefas(TAREFAS, data_inicio="10/03/2026")
        with self.assertRaises(FiltroInvalido):
            filtrar_tarefas(TAREFAS, data_inicio="2026-04-01", data_fim="2026-03-01")

    def test_valida_mesmo_com_lista_vazia(self):
        with self.assertRaises(FiltroInvalido):
            filtrar_tarefas([], status="xyz")


DISCIPLINAS = [
    {"id": "a", "nome": "Álgebra Linear", "professor": "Marta", "dataInicio": "2026-02-01", "dataFim": "2026-06-30"},
    {"id": "b", "nome": "Banco de Dados", "professor": "João", "descricao": "SQL", "dataInicio": "2026-08-01", "dataFim": "2026-12-15"},
    {"id": "c", "nome": "Sem datas", "professor": "Ana"},
]


class FiltrarDisciplinas(unittest.TestCase):
    def test_busca_por_nome_professor_descricao(self):
        self.assertEqual([d["id"] for d in filtrar_disciplinas(DISCIPLINAS, q="algebra")], ["a"])
        self.assertEqual([d["id"] for d in filtrar_disciplinas(DISCIPLINAS, q="joao")], ["b"])
        self.assertEqual([d["id"] for d in filtrar_disciplinas(DISCIPLINAS, q="sql")], ["b"])

    def test_vigente_no_intervalo(self):
        r = filtrar_disciplinas(DISCIPLINAS, data_inicio="2026-05-01", data_fim="2026-05-31")
        self.assertEqual([d["id"] for d in r], ["a", "c"])  # 'c' sem datas = intervalo aberto

    def test_intervalo_invalido(self):
        with self.assertRaises(FiltroInvalido):
            filtrar_disciplinas(DISCIPLINAS, data_fim="amanhã")


if __name__ == "__main__":
    unittest.main()
