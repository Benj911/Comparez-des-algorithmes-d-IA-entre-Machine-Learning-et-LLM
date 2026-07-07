from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle

app = FastAPI(title="API ML ZenAssist")

# Autoriser ton site web (React/Next.js) à parler avec cette API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

# Chargement du modèle en mémoire au démarrage
print("⏳ Chargement du modèle...")
try:
    with open("model.pkl", "rb") as f:
        model = pickle.load(f)
    print("✅ Modèle chargé avec succès !")
except FileNotFoundError:
    print("❌ Erreur : model.pkl introuvable. As-tu bien exécuté export_model.py ?")

# Format de la requête attendue (le "body")
class ClaimRequest(BaseModel):
    user_claim: str

# La route POST pour prédire la catégorie
@app.post("/tags")
def predict_tag(request: ClaimRequest):
    try:
        # Le modèle attend une liste de textes, on lui passe donc la réclamation entre crochets
        prediction = model.predict([request.user_claim])
        return {"category": prediction[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/")
def home():
    return {"message": "Bienvenue sur l'API de ZenAssist ! Allez sur /docs pour tester."}