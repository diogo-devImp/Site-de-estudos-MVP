import io
import json
import unittest
from contextlib import redirect_stdout
from unittest import mock

from scripts.calculate_progress import calculate_progress, main


class CalculateProgress(unittest.TestCase):
    def test_porcentagem_basica(self):
        self.assertEqual(calculate_progress(3, 4),
                         {"percentage": 75.0, "completed": 3, "total": 4})

    def test_total_zero_nao_divide_por_zero(self):
        self.assertEqual(calculate_progress(0, 0)["percentage"], 0)

    def test_tudo_concluido(self):
        self.assertEqual(calculate_progress(5, 5)["percentage"], 100.0)

    def test_arredonda_uma_casa(self):
        self.assertEqual(calculate_progress(1, 3)["percentage"], 33.3)

    def test_aceita_texto_numerico(self):
        self.assertEqual(calculate_progress("2", "8")["percentage"], 25.0)

    def test_concluidas_maior_que_total_e_erro(self):
        with self.assertRaises(ValueError):
            calculate_progress(5, 2)

    def test_negativo_e_erro(self):
        with self.assertRaises(ValueError):
            calculate_progress(-1, 4)

    def test_nao_numerico_e_erro(self):
        for invalido in ("abc", None, 1.5, True):
            with self.assertRaises(ValueError, msg=repr(invalido)):
                calculate_progress(invalido, 4)


class LinhaDeComando(unittest.TestCase):
    def _executar(self, argv):
        saida = io.StringIO()
        with redirect_stdout(saida):
            codigo = main(argv)
        return codigo, json.loads(saida.getvalue())

    def test_argumentos_retornam_json_com_percentage(self):
        codigo, dados = self._executar(["--completed", "3", "--total", "4"])
        self.assertEqual(codigo, 0)
        self.assertEqual(dados["percentage"], 75.0)

    def test_total_zero_retorna_zero(self):
        codigo, dados = self._executar(["--completed", "0", "--total", "0"])
        self.assertEqual((codigo, dados["percentage"]), (0, 0))

    def test_entrada_padrao_json(self):
        with mock.patch("sys.stdin", io.StringIO('{"completed": 1, "total": 2}')):
            codigo, dados = self._executar([])
        self.assertEqual((codigo, dados["percentage"]), (0, 50.0))

    def test_entrada_invalida_retorna_erro_em_json(self):
        codigo, dados = self._executar(["--completed", "9", "--total", "2"])
        self.assertEqual(codigo, 1)
        self.assertIn("error", dados)
        self.assertEqual(dados["percentage"], 0)


if __name__ == "__main__":
    unittest.main()
