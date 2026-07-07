'use client';

import { useState } from 'react';
import { Mistral } from '@mistralai/mistralai';
import styles from './Claim.module.css';

// Initialisation du client Mistral (la clé doit être dans .env.local)
const mistral = new Mistral({
    apiKey: process.env.NEXT_PUBLIC_MISTRAL_API_KEY || ''
});

export default function ClaimComponent({ claim, isSelected, onClick, onTagClick }) {
    // 1. Nouveaux états pour gérer le LLM
    const [isLoading, setIsLoading] = useState(false);
    // On utilise le tag du LLM s'il existe, sinon le tag d'origine de la prop 'claim'
    const [activeTag, setActiveTag] = useState(claim.tag); 

    const handleTagClick = (e) => {
        e.stopPropagation();
        if (activeTag && onTagClick) {
            onTagClick(activeTag);
        }
    };

    // 2. Fonction d'appel à Mistral
    const handleAutoTagging = async (e) => {
        e.stopPropagation(); // Empêche de déclencher le onClick du container parent
        setIsLoading(true);

        try {
            // 1. Tes catégories officielles issues de la Mission 1
            const categoriesStr = `- Debt collection
- Consumer Loan
- Credit card or prepaid card
- Mortgage
- Vehicle loan or lease
- Student loan
- Payday loan, title loan, or personal loan
- Checking or savings account
- Bank account or service
- Money transfer, virtual currency, or money service
- Money transfers
- Other financial services`;

            // 2. Ton prompt de la Mission 1, adapté pour UN SEUL ticket
            const promptSysteme = `Tu es un agent de support client expert chez ZenAssist.
Ta mission est de classifier la réclamation de l'utilisateur dans l'UNE des catégories officielles ci-dessous.

=== CATÉGORIES OFFICIELLES ===
${categoriesStr}

=== DIRECTIVES STRICTES ===
1. Tu dois répondre UNIQUEMENT sous la forme d'un objet JSON valide contenant une seule clé "category" avec l'intitulé exact sélectionné (lettre pour lettre, avec la casse et la ponctuation exacte de la liste officielle).
2. Ne saisis aucune explication, aucune phrase d'introduction, aucun commentaire. Renvoie JUSTE l'objet JSON brut.

Exemple de format attendu :
{
  "category": "Credit card or prepaid card"
}`;

            const response = await mistral.chat.complete({
                model: 'open-mistral-nemo', // On garde Nemo pour la rapidité sur l'UI
                messages: [
                    { role: 'system', content: promptSysteme },
                    { role: 'user', content: claim.content }
                ],
                temperature: 0, // Pour plus de précision
                responseFormat: { type: 'json_object' }
            });

            const contenu = response.choices[0].message.content;
            const jsonResult = JSON.parse(contenu);
            
            // Mise à jour de l'étiquette
            setActiveTag(jsonResult.category);
            
        } catch (error) {
            console.error("Erreur lors de la classification LLM :", error);
            alert("Erreur API : Vérifie ta clé ou ta connexion.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className={`${styles.container} ${isSelected ? styles.selected : ''}`}
            onClick={onClick}
            role="button"
            tabIndex={0}
            aria-pressed={isSelected}
        >
            <div className={styles.content}>
                <p
                    className={styles.text}
                    id={`claim-content-${claim.id}`}
                >
                    {claim.content}
                </p>
                
                {/* 3. Affichage conditionnel : Soit l'étiquette, soit le bouton LLM */}
                {activeTag ? (
                    <button
                        className={styles.tag}
                        onClick={handleTagClick}
                        aria-label={`Navigate to ${activeTag} inbox`}
                        title={`Go to ${activeTag} inbox`}
                    >
                        {activeTag}
                    </button>
                ) : (
                    <button 
                        className={styles.tag} // On réutilise le style tag, ou tu peux créer un styles.llmButton
                        onClick={handleAutoTagging}
                        disabled={isLoading}
                        style={{ cursor: isLoading ? 'wait' : 'pointer', backgroundColor: isLoading ? '#ccc' : '' }}
                    >
                        {isLoading ? '⏳ Chargement...' : '✨ Auto-étiqueter'}
                    </button>
                )}
            </div>
        </div>
    );
}