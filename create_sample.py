import pandas as pd

print("Chargement du dataset complet...")
# Remplace par le VRAI chemin vers ton fichier de 600Mo
df = pd.read_csv("../../../Mission 1 - Explorez deux algorithmes de classification/dataset.csv") 

print("Création de l'échantillon...")
df_sample = df.sample(n=2000, random_state=42)

# Sauvegarde dans le dossier actuel
df_sample.to_csv("dataset_sample.csv", index=False)
print("✅ dataset_sample.csv créé avec succès !")