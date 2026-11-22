import os

import firebase_admin
from firebase_admin import credentials, firestore


_BASE_DIR = os.path.dirname(os.path.abspath(__file__))
_KEY_PATH = os.environ.get(
    "GOOGLE_APPLICATION_CREDENTIALS",
    os.path.join(_BASE_DIR, "servicekey.json"),
)

if not os.path.exists(_KEY_PATH):
    raise FileNotFoundError(
        f"Chave do Firebase não encontrada em: {_KEY_PATH}\n"
        "Coloque o servicekey.json novo na raiz do projeto "
        "ou defina GOOGLE_APPLICATION_CREDENTIALS."
    )

cred = credentials.Certificate(_KEY_PATH)

if not firebase_admin._apps:
   
    firebase_admin.initialize_app(cred, {"projectId": cred.project_id})


db = firestore.client()
