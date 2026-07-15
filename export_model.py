import pandas as pd
import pickle
import json
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

print("1. Chargement de l'échantillon de données...")
df = pd.read_csv('dataset_sample.csv')

# On supprime toutes les lignes où le texte ou le tag est vide
df = df.dropna(subset=['Consumer Claim', 'Tag'])

X = df['Consumer Claim'] 
y = df['Tag']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("2. Création et entraînement du modèle définitif...")
# Le Pipeline regroupe la vectorisation (TF-IDF) ET le modèle. 
# Il n'y aura qu'un seul fichier .pkl à exporter !
pipeline = Pipeline([
    ('tfidf', TfidfVectorizer(max_features=5000, stop_words='english')),
    ('clf', LogisticRegression(max_iter=1000, random_state=42))
])

pipeline.fit(X_train, y_train)

print("3. Évaluation du modèle...")
predictions = pipeline.predict(X_test)
accuracy = accuracy_score(y_test, predictions)
print(f"Accuracy sur l'échantillon : {accuracy:.2f}")

print("4. Sauvegarde des fichiers de production...")
# Sauvegarde du modèle
with open('model.pkl', 'wb') as f:
    pickle.dump(pipeline, f)

# Sauvegarde des métriques
metrics = {"model_type": "Logistic Regression", "accuracy": accuracy}
with open('metrics.json', 'w') as f:
    json.dump(metrics, f)

print("✅ Modèle exporté avec succès (model.pkl) !")