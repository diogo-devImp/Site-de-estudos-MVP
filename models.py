from typing import List, Optional
from pydantic import BaseModel


class Aviso(BaseModel):
  titulo: str
  descricao: str
  data: str
  tag: str = "ATUALIZADO"  # Ex: ATUALIZADO, IMPORTANTE


class FrequenciaAluno(BaseModel):
  aluno_ra: str
  nome_aluno: str
  curso: str
  semestre: str
  frequencia_global: float  # Ex: 95.0
  faltas_por_disciplina: dict  # Ex: {"Banco de Dados": 10, "Arquitetura": 12}


class AulaHoje(BaseModel):
  curso: str
  dia_semana: str  # Segunda, Terça, etc.
  horario: str  # "19:00 - 20:30"
  materia: str
  professor: str
  sala: str

class Disciplina(BaseModel):
  nome: str
  professor: Optional[str] = None
  semestre: str = "3º Semestre"
  cor: Optional[str] = "#3b82f6"
  cargaHoraria: Optional[str] = "60 horas"
  descricao: Optional[str] = ""
  dataInicio: Optional[str] = ""
  dataFim: Optional[str] = ""

class Tarefa(BaseModel):
  titulo: str
  disciplinaId: str
  dataPrevista: str
  descricao: Optional[str] = ""
  status: Optional[str] = "Pendente"