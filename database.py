import firebase_admin
from firebase_admin import credentials, firestore

# Inicializa o Firebase com a chave privada descarregada
cred = credentials.Certificate("servicekey.json")
if not firebase_admin._apps:
  firebase_admin.initialize_app(cred)

# Instância do Firestore
db = firestore.client()