from datetime import datetime, timedelta
import os
import shutil
from database import db
from fastapi import FastAPI, HTTPException, File, Form, UploadFile, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from models import Aviso, AulaHoje, Disciplina, FrequenciaAluno, Tarefa
from filters import FiltroInvalido, filtrar_disciplinas, filtrar_tarefas
from metrics import aplicar_data_conclusao, calcular_metricas
from pydantic import BaseModel
from typing import Optional
import firebase_admin
from firebase_admin import storage

# JWT
# Compatível com python-jose ou PyJWT. O projeto usa JWT obrigatoriamente nas rotas protegidas.
try:
    from jose import jwt, JWTError
    JWT_BACKEND = "python-jose"
except ImportError:
    try:
        import jwt as pyjwt
        jwt = pyjwt
        JWTError = pyjwt.PyJWTError
        JWT_BACKEND = "PyJWT"
    except ImportError:
        jwt = None
        JWTError = Exception
        JWT_BACKEND = None

JWT_ENABLED = JWT_BACKEND is not None

JWT_SECRET = "impacta_portal_secret_2026"
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_HOURS = 8

app = FastAPI(
    title="Portal Acadêmico API",
    version="2.0.0",
)


# Configuração essencial de CORS para o front-end comunicar com o Python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- HELPERS PARA O FIRESTORE ---
def criar_documento(colecao: str, dados: dict):
  try:
    doc_ref = db.collection(colecao).document()
    doc_ref.set(dados)
    return {"id": doc_ref.id, **dados}
  except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))


def listar_documentos(colecao: str):
  try:
    docs = db.collection(colecao).stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]
  except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))


def deletar_documento(colecao: str, doc_id: str):
  doc_ref = db.collection(colecao).document(doc_id)
  if not doc_ref.get().exists:
    raise HTTPException(status_code=404, detail="Registro não encontrado")
  doc_ref.delete()
  return {"mensagem": "Eliminado com sucesso"}


# --- JWT HELPERS ---
security = HTTPBearer(auto_error=False)

def criar_token(dados: dict) -> str:
    if not JWT_ENABLED:
        raise HTTPException(status_code=500, detail="JWT não configurado. Instale PyJWT ou python-jose.")
    payload = dados.copy()
    payload["exp"] = datetime.utcnow() + timedelta(hours=JWT_EXPIRE_HOURS)
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verificar_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Valida o Bearer token e devolve a identidade do usuário."""
    if not JWT_ENABLED:
        raise HTTPException(status_code=500, detail="JWT não configurado. Instale PyJWT ou python-jose.")
    if not credentials:
        raise HTTPException(status_code=401, detail="Token de autenticação não fornecido.")
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if not payload.get("ra"):
            raise HTTPException(status_code=401, detail="Token sem identificação do usuário.")
        return payload
    except HTTPException:
        raise
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido ou expirado. Faça login novamente.")

def exigir_mesmo_usuario(ra_aluno: str, usuario: dict):
    """Impede que um usuário consulte ou altere dados de outro RA."""
    if str(usuario.get("ra")) != str(ra_aluno):
        raise HTTPException(status_code=403, detail="Acesso negado para este usuário.")


# --- PAYLOADS DE AUTENTICAÇÃO ---
class LoginPayload(BaseModel):
  identificador: str
  senha: str


class UsuarioPayload(BaseModel):
  nome: str
  sobrenome: str
  email: str
  ra: str
  senha: str
  curso: str
  semestre: str


# --- ROTAS DE AUTENTICAÇÃO ---
@app.post("/login")
def login(payload: LoginPayload):
  try:
    docs_email = (
        db.collection("usuarios")
        .where("email", "==", payload.identificador.lower())
        .stream()
    )
    usuarios = [{"id": doc.id, **doc.to_dict()} for doc in docs_email]

    if not usuarios:
      docs_ra = (
          db.collection("usuarios")
          .where("ra", "==", payload.identificador)
          .stream()
      )
      usuarios = [{"id": doc.id, **doc.to_dict()} for doc in docs_ra]

    if not usuarios:
      raise HTTPException(
          status_code=400, detail="Credenciais inválidas. Utilizador não encontrado."
      )

    usuario = usuarios[0]
    if usuario.get("senha") != payload.senha:
      raise HTTPException(status_code=400, detail="Senha incorreta.")

    user_data = {
        "nome": usuario.get("nome"),
        "sobrenome": usuario.get("sobrenome"),
        "email": usuario.get("email"),
        "ra": usuario.get("ra"),
        "curso": usuario.get("curso", "Engenharia de Software"),
        "semestre": usuario.get("semestre", "1º Semestre - Noturno"),
    }
    # Gera token JWT (fallback seguro se jose não estiver instalado)
    token = criar_token({"ra": user_data["ra"], "email": user_data["email"]})
    return {**user_data, "token": token}

  except HTTPException as he:
    raise he
  except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))



@app.post("/usuarios/", status_code=201)
def criar_usuario(usuario: UsuarioPayload):
  try:
    existente_email = (
        db.collection("usuarios")
        .where("email", "==", usuario.email.lower())
        .stream()
    )
    if list(existente_email):
      raise HTTPException(
          status_code=400, detail="Já existe um cadastro com este E-mail."
      )

    existente_ra = (
        db.collection("usuarios").where("ra", "==", usuario.ra).stream()
    )
    if list(existente_ra):
      raise HTTPException(
          status_code=400, detail="Já existe um cadastro com este RA."
      )

    resultado = criar_documento("usuarios", usuario.model_dump())
    return {
        "success": True,
        "message": "Cadastro realizado com sucesso!",
        "data": resultado,
    }
  except HTTPException as he:
    raise he
  except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))


# --- ROTAS DE RECUPERAÇÃO DE SENHA ---

class RecuperarSenhaPayload(BaseModel):
    email: str

class RedefinirSenhaPayload(BaseModel):
    email: str
    nova_senha: str

@app.post("/recuperar-senha")
def recuperar_senha(payload: RecuperarSenhaPayload):
    try:
        email_limpo = payload.email.strip().lower()
        
        # Procura o utilizador pelo e-mail no Firestore
        docs = db.collection("usuarios").where("email", "==", email_limpo).stream()
        usuarios = [{"id": doc.id, **doc.to_dict()} for doc in docs]

        if not usuarios:
            raise HTTPException(status_code=404, detail="E-mail não encontrado no sistema.")

        # Em ambiente de desenvolvimento local, geramos um link simulado que aparece na consola do Python
        link_simulado = f"http://localhost:8080/#redefinir?email={email_limpo}"
        
        print("\n" + "="*60)
        print(f" [RECUPERAÇÃO DE SENHA] E-mail: {email_limpo}")
        print(f" Link gerado para testes: {link_simulado}")
        print("="*60 + "\n")

        return {
            "success": True,
            "message": f"Instruções e link de recuperação enviados com sucesso para {email_limpo}."
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/redefinir-senha")
def redefinir_senha(payload: RedefinirSenhaPayload):
    try:
        email_limpo = payload.email.strip().lower()
        
        # Localiza o documento do utilizador na coleção "usuarios"
        docs = db.collection("usuarios").where("email", "==", email_limpo).stream()
        usuarios = [{"id": doc.id, **doc.to_dict()} for doc in docs]

        if not usuarios:
            raise HTTPException(status_code=404, detail="Utilizador não encontrado.")

        user_id = usuarios[0]["id"]
        
        # Atualiza a senha na base de dados
        db.collection("usuarios").document(user_id).update({
            "senha": payload.nova_senha
        })

        return {
            "success": True,
            "message": "Palavra-passe redefinida com sucesso! Já pode iniciar sessão."
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --- ROTAS DE DISCIPLINAS ---
@app.post("/disciplinas/", status_code=201)
def post_disciplina(d: dict, usuario: dict = Depends(verificar_token)):
  # O RA vem do JWT; nunca confiamos no RA enviado pelo navegador.
  d["ra_aluno"] = usuario["ra"]
  return criar_documento("disciplinas", d)


@app.get("/disciplinas/{ra_aluno}")
def get_disciplinas_aluno(
    ra_aluno: str,
    q: Optional[str] = None,
    data_inicio: Optional[str] = None,
    data_fim: Optional[str] = None,
    usuario: dict = Depends(verificar_token),
):
  exigir_mesmo_usuario(ra_aluno, usuario)
  try:
    # Filtra estritamente pelo RA do aluno logado no Firestore
    docs = db.collection("disciplinas").where("ra_aluno", "==", ra_aluno).stream()
    disciplinas = [{"id": doc.id, **doc.to_dict()} for doc in docs]
  except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))
  try:
    # Busca/filtros opcionais (ver openspec: add-task-subject-search-filters)
    return filtrar_disciplinas(disciplinas, q=q, data_inicio=data_inicio, data_fim=data_fim)
  except FiltroInvalido as e:
    raise HTTPException(status_code=422, detail=str(e))

@app.put("/disciplinas/{id}")
def update_disciplina(id: str, d: dict, usuario: dict = Depends(verificar_token)):
  try:
    doc_ref = db.collection("disciplinas").document(id)
    snap = doc_ref.get()
    if not snap.exists:
      raise HTTPException(status_code=404, detail="Disciplina não encontrada")
    if str(snap.to_dict().get("ra_aluno")) != str(usuario.get("ra")):
      raise HTTPException(status_code=403, detail="Acesso negado para esta disciplina.")
    d["ra_aluno"] = usuario["ra"]
    doc_ref.set(d, merge=True)
    return {"id": id, **d}
  except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))


@app.delete("/disciplinas/{id}")
def delete_disciplina(id: str, usuario: dict = Depends(verificar_token)):
  doc_ref = db.collection("disciplinas").document(id)
  snap = doc_ref.get()
  if not snap.exists:
    raise HTTPException(status_code=404, detail="Disciplina não encontrada")
  if str(snap.to_dict().get("ra_aluno")) != str(usuario.get("ra")):
    raise HTTPException(status_code=403, detail="Acesso negado para esta disciplina.")
  doc_ref.delete()
  return {"mensagem": "Eliminado com sucesso"}
  
# --- ROTAS DE TAREFAS ---
@app.post("/tarefas/", status_code=201)
def post_tarefa(t: dict, usuario: dict = Depends(verificar_token)):
  t["ra_aluno"] = usuario["ra"]
  t = aplicar_data_conclusao(t, None)
  return criar_documento("tarefas", t)


@app.get("/tarefas/{ra_aluno}")
def get_tarefas_aluno(
    ra_aluno: str,
    q: Optional[str] = None,
    status: Optional[str] = None,
    disciplina_id: Optional[str] = None,
    data_inicio: Optional[str] = None,
    data_fim: Optional[str] = None,
    usuario: dict = Depends(verificar_token),
):
  exigir_mesmo_usuario(ra_aluno, usuario)
  try:
    docs = db.collection("tarefas").where("ra_aluno", "==", ra_aluno).stream()
    tarefas = [{"id": doc.id, **doc.to_dict()} for doc in docs]
  except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))
  try:
    # Busca/filtros opcionais (ver openspec: add-task-subject-search-filters)
    return filtrar_tarefas(
        tarefas, q=q, status=status, disciplina_id=disciplina_id,
        data_inicio=data_inicio, data_fim=data_fim,
    )
  except FiltroInvalido as e:
    raise HTTPException(status_code=422, detail=str(e))

@app.put("/tarefas/{id}")
def update_tarefa(id: str, t: Tarefa, usuario: dict = Depends(verificar_token)):
  try:
    doc_ref = db.collection("tarefas").document(id)
    snap = doc_ref.get()
    if not snap.exists:
      raise HTTPException(status_code=404, detail="Tarefa não encontrada")
    anterior = snap.to_dict()
    if str(anterior.get("ra_aluno")) != str(usuario.get("ra")):
      raise HTTPException(status_code=403, detail="Acesso negado para esta tarefa.")
    dados = t.model_dump()
    dados["ra_aluno"] = usuario["ra"]
    dados = aplicar_data_conclusao(dados, anterior)
    doc_ref.set(dados, merge=True)
    return {"id": id, **dados}
  except HTTPException:
    raise
  except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))


@app.delete("/tarefas/{id}")
def delete_tarefa(id: str, usuario: dict = Depends(verificar_token)):
  doc_ref = db.collection("tarefas").document(id)
  snap = doc_ref.get()
  if not snap.exists:
    raise HTTPException(status_code=404, detail="Tarefa não encontrada")
  if str(snap.to_dict().get("ra_aluno")) != str(usuario.get("ra")):
    raise HTTPException(status_code=403, detail="Acesso negado para esta tarefa.")
  doc_ref.delete()
  return {"mensagem": "Eliminado com sucesso"}

#-----ROTAS DE DOCUMENTOS-----

@app.post("/documentos/upload/", status_code=201)
async def upload_documento(
    nome_documento: str = Form(...),
    tipo: str = Form(...),
    ra_aluno: str = Form(...),  # <--- Receber o RA do aluno
    file: UploadFile = File(...),
):
  try:
    file_location = os.path.join("uploads", file.filename)
    with open(file_location, "wb") as buffer:
      shutil.copyfileobj(file.file, buffer)

    file_url = f"http://localhost:8000/uploads/{file.filename}"

    doc_data = {
        "nome": nome_documento,
        "tipo": tipo,
        "ra_aluno": ra_aluno,  # <--- Guardar associado ao RA
        "status": "Entregue",
        "dataEnvio": datetime.now().strftime("%Y-%m-%d"),
        "fileUrl": file_url,
    }

    resultado = criar_documento("documentos", doc_data)
    return {"mensagem": "Upload efetuado com sucesso!", "dados": resultado}
  except Exception as e:
    raise HTTPException(
        status_code=500, detail=f"Erro ao fazer upload: {str(e)}"
    )


@app.get("/documentos/{ra_aluno}")
def get_documentos_aluno(ra_aluno: str):
  documentos_padrao = [
      {
          "id": "1",
          "nome": "RG / Carteira de Identidade",
          "obrigatorio": True,
          "status": "Pendente",
          "dataEnvio": "-",
      },
      {
          "id": "2",
          "nome": "CPF (Cadastro de Pessoa Física)",
          "obrigatorio": True,
          "status": "Pendente",
          "dataEnvio": "-",
      },
      {
          "id": "3",
          "nome": "Certificado de Conclusão do Ensino Médio",
          "obrigatorio": True,
          "status": "Pendente",
          "dataEnvio": "-",
      },
      {
          "id": "4",
          "nome": "Histórico Escolar do Ensino Médio",
          "obrigatorio": True,
          "status": "Pendente",
          "dataEnvio": "-",
      },
      {
          "id": "5",
          "nome": "Certificado de Dispensa Militar (CAM/CDI)",
          "obrigatorio": True,
          "status": "Pendente",
          "dataEnvio": "-",
      },
      {
          "id": "6",
          "nome": "Comprovante de Residência Atualizado",
          "obrigatorio": True,
          "status": "Pendente",
          "dataEnvio": "-",
      },
  ]

  try:
    # Busca apenas os documentos deste RA específico no Firestore
    docs_ref = (
        db.collection("documentos")
        .where("ra_aluno", "==", ra_aluno)
        .stream()
    )
    docs_enviados = [{"id": doc.id, **doc.to_dict()} for doc in docs_ref]

    for padrao in documentos_padrao:
      enviado = next(
          (
              d
              for d in docs_enviados
              if d.get("nome").strip().lower() == padrao["nome"].strip().lower()
          ),
          None,
      )
      if enviado:
        padrao["status"] = enviado.get("status", "Entregue")
        padrao["dataEnvio"] = enviado.get("dataEnvio", "-")
        padrao["id"] = enviado.get("id")

    return documentos_padrao
  except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))

#------ROTAS DE NOTAS-----
@app.post("/notas/", status_code=201)
def post_nota(n: dict):
  if not n.get("ra_aluno"):
    raise HTTPException(status_code=400, detail="O campo ra_aluno é obrigatório.")
  return criar_documento("notas", n)


@app.get("/notas/{ra_aluno}")
def get_notas_aluno(ra_aluno: str):
  try:
    docs = db.collection("notas").where("ra_aluno", "==", ra_aluno).stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]
  except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))


@app.put("/notas/{id}")
def update_nota(id: str, n: dict):
  try:
    doc_ref = db.collection("notas").document(id)
    if not doc_ref.get().exists:
      raise HTTPException(status_code=404, detail="Registo de notas não encontrado")
    doc_ref.set(n, merge=True)
    return {"id": id, **n}
  except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))

# --- ROTAS DE AVISOS ---
@app.post("/avisos/", status_code=201)
def post_aviso(aviso: Aviso):
  return criar_documento("avisos", aviso.model_dump())


@app.get("/avisos/")
def get_avisos():
  return listar_documentos("avisos")


# --- ROTAS DE FREQUÊNCIA ---
@app.post("/frequencia/", status_code=201)
def post_frequencia(freq: FrequenciaAluno):
  return criar_documento("frequencia", freq.model_dump())


@app.get("/frequencia/{aluno_ra}")
def get_frequencia_aluno(aluno_ra: str):
  try:
    docs = (
        db.collection("frequencia")
        .where("aluno_ra", "==", aluno_ra)
        .stream()
    )
    resultado = [{"id": doc.id, **doc.to_dict()} for doc in docs]
    if not resultado:
      return {
          "aluno_ra": aluno_ra,
          "frequencia_global": 95.0,
          "faltas_por_disciplina": {},
      }
    return resultado[0]
  except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))


# --- ROTAS DE AULAS ---
@app.post("/aulas-hoje/", status_code=201)
def post_aula_hoje(aula: AulaHoje):
  return criar_documento("aulas_hoje", aula.model_dump())


@app.get("/aulas-hoje/{curso}")
def get_aulas_por_curso(curso: str):
  return listar_documentos("aulas_hoje")


# --- ROTA DE MÉTRICAS AVANÇADAS ---
# A lógica de cálculo vive em metrics.py (funções puras, com testes em tests/).
@app.get("/metricas/{ra_aluno}")
def get_metricas(ra_aluno: str, usuario: dict = Depends(verificar_token)):
    """Progresso ponderado por carga horária, previsão de conclusão e alertas."""
    exigir_mesmo_usuario(ra_aluno, usuario)
    try:
        disc_docs = db.collection("disciplinas").where("ra_aluno", "==", ra_aluno).stream()
        disciplinas = [{"id": doc.id, **doc.to_dict()} for doc in disc_docs]

        tarefa_docs = db.collection("tarefas").where("ra_aluno", "==", ra_aluno).stream()
        tarefas = [{"id": doc.id, **doc.to_dict()} for doc in tarefa_docs]

        return calcular_metricas(ra_aluno, disciplinas, tarefas)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


os.makedirs("uploads", exist_ok=True)
os.makedirs("img", exist_ok=True)
os.makedirs("css", exist_ok=True)

# Expõe as pastas para o servidor conseguir servi-las ao front-end
app.mount("/img", StaticFiles(directory="img"), name="img")
app.mount("/css", StaticFiles(directory="css"), name="css")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
