import unittest
from datetime import date

from filters import buscar_disciplinas, tarefas_atrasadas

HOJE = date(2026, 11, 19)

DISCIPLINAS = [
    {"id": "bd", "nome": "Banco de Dados"},
    {"id": "alg", "nome": "Álgebra Linear"},
    {"id": "web", "nome": "Desenvolvimento Web"},
    {"id": "bd2", "nome": "Banco de Dados Avançado"},
]
TAREFAS = [
    # Álgebra: 1 atrasada pendente
    {"disciplinaId": "alg", "status": "Pendente", "dataPrevista": "2026-11-10"},
    # Web: 2 atrasadas pendentes
    {"disciplinaId": "web", "status": "Pendente", "dataPrevista": "2026-11-01"},
    {"disciplinaId": "web", "status": "Pendente", "dataPrevista": "2026-11-18"},
    # BD: atrasada mas concluída, pendente no futuro e pendente HOJE -> nenhuma atrasada
    {"disciplinaId": "bd", "status": "Concluída", "dataPrevista": "2026-10-01"},
    {"disciplinaId": "bd", "status": "Pendente", "dataPrevista": "2026-12-01"},
    {"disciplinaId": "bd", "status": "Pendente", "dataPrevista": "2026-11-19"},
]


def ids(lista):
    return [d["id"] for d in lista]


class TarefasAtrasadas(unittest.TestCase):
    def test_so_pendentes_com_data_passada(self):
        da_web = [t for t in TAREFAS if t["disciplinaId"] == "web"]
        self.assertEqual(len(tarefas_atrasadas(da_web, HOJE)), 2)

    def test_concluida_nao_conta_e_hoje_nao_e_atraso(self):
        da_bd = [t for t in TAREFAS if t["disciplinaId"] == "bd"]
        self.assertEqual(tarefas_atrasadas(da_bd, HOJE), [])

    def test_sem_data_ou_data_invalida_nao_conta(self):
        tarefas = [{"status": "Pendente"}, {"status": "Pendente", "dataPrevista": "xx"}]
        self.assertEqual(tarefas_atrasadas(tarefas, HOJE), [])


class BuscaHibrida(unittest.TestCase):
    def test_sem_filtros_devolve_todas(self):
        self.assertEqual(len(buscar_disciplinas(DISCIPLINAS, TAREFAS, hoje=HOJE)), 4)

    def test_so_nome_sem_acento_e_sem_caixa(self):
        r = buscar_disciplinas(DISCIPLINAS, TAREFAS, q="ALGEBRA", hoje=HOJE)
        self.assertEqual(ids(r), ["alg"])
        self.assertEqual(r[0]["motivos"], ["nome"])

    def test_so_atrasadas_ordena_por_mais_atrasos(self):
        r = buscar_disciplinas(DISCIPLINAS, TAREFAS, atrasadas=True, hoje=HOJE)
        self.assertEqual(ids(r), ["web", "alg"])
        self.assertEqual(r[0]["tarefas_atrasadas"], 2)

    def test_nome_OU_atrasadas_une_os_dois_criterios(self):
        r = buscar_disciplinas(DISCIPLINAS, TAREFAS, q="banco", atrasadas=True, hoje=HOJE)
        self.assertEqual(set(ids(r)), {"bd", "bd2", "web", "alg"})
        por_id = {d["id"]: d for d in r}
        self.assertEqual(por_id["bd"]["motivos"], ["nome"])
        self.assertEqual(por_id["web"]["motivos"], ["atrasadas"])

    def test_disciplina_que_casa_pelos_dois_motivos(self):
        r = buscar_disciplinas(DISCIPLINAS, TAREFAS, q="web", atrasadas=True, hoje=HOJE)
        web = next(d for d in r if d["id"] == "web")
        self.assertEqual(web["motivos"], ["nome", "atrasadas"])

    def test_relevancia_nome_exato_antes_de_parcial(self):
        r = buscar_disciplinas(DISCIPLINAS, TAREFAS, q="banco de dados", hoje=HOJE)
        self.assertEqual(ids(r), ["bd", "bd2"])  # exato (3) antes de "começa com" (2)

    def test_nenhum_resultado(self):
        self.assertEqual(buscar_disciplinas(DISCIPLINAS, TAREFAS, q="quimica", hoje=HOJE), [])

    def test_nao_modifica_as_entradas(self):
        antes = [dict(d) for d in DISCIPLINAS]
        buscar_disciplinas(DISCIPLINAS, TAREFAS, q="banco", atrasadas=True, hoje=HOJE)
        self.assertEqual(DISCIPLINAS, antes)


if __name__ == "__main__":
    unittest.main()
