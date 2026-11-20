import unittest
from datetime import date

from metrics import aplicar_data_conclusao
from utils import CAMPOS_DISCIPLINA, CAMPOS_TAREFA, extrair_campos_permitidos


class CamposPermitidosPatch(unittest.TestCase):
    def test_ignora_campos_protegidos(self):
        dados = {"status": "Concluída", "ra_aluno": "999", "id": "x", "dataConclusao": "2000-01-01"}
        self.assertEqual(extrair_campos_permitidos(dados, CAMPOS_TAREFA), {"status": "Concluída"})

    def test_entrada_que_nao_e_dict(self):
        self.assertEqual(extrair_campos_permitidos(None, CAMPOS_TAREFA), {})


    def test_disciplina_aceita_so_campos_conhecidos(self):
        dados = {"nome": "BD", "ra_aluno": "999", "qualquer": 1}
        self.assertEqual(extrair_campos_permitidos(dados, CAMPOS_DISCIPLINA), {"nome": "BD"})


class PatchDeTarefaMantemDataConclusaoNoServidor(unittest.TestCase):
    """Mesma composição usada em PATCH /tarefas/{id}: {**anterior, **campos} + aplicar_data_conclusao."""

    HOJE = date(2026, 11, 19)

    def _patch(self, anterior, enviado):
        campos = extrair_campos_permitidos(enviado, CAMPOS_TAREFA)
        return aplicar_data_conclusao({**anterior, **campos}, anterior, self.HOJE)

    def test_concluir_define_data_de_hoje(self):
        anterior = {"titulo": "T", "status": "Pendente", "dataConclusao": None}
        r = self._patch(anterior, {"status": "Concluída"})
        self.assertEqual(r["dataConclusao"], "2026-11-19")
        self.assertEqual(r["titulo"], "T")  # campos não enviados continuam

    def test_cliente_nao_consegue_forcar_data_de_conclusao(self):
        anterior = {"status": "Pendente"}
        r = self._patch(anterior, {"status": "Concluída", "dataConclusao": "2000-01-01"})
        self.assertEqual(r["dataConclusao"], "2026-11-19")

    def test_reabrir_limpa_a_data(self):
        anterior = {"status": "Concluída", "dataConclusao": "2026-11-01"}
        r = self._patch(anterior, {"status": "Pendente"})
        self.assertIsNone(r["dataConclusao"])

    def test_editar_titulo_de_tarefa_concluida_preserva_a_data(self):
        anterior = {"titulo": "A", "status": "Concluída", "dataConclusao": "2026-11-01"}
        r = self._patch(anterior, {"titulo": "B"})
        self.assertEqual((r["titulo"], r["dataConclusao"]), ("B", "2026-11-01"))


if __name__ == "__main__":
    unittest.main()
