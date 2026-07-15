'use client';

import { useState } from 'react';
import { Mistral } from '@mistralai/mistralai';
import styles from './Claim.module.css';

// Initialisation du client Mistral
const mistral = new Mistral({
    apiKey: process.env.NEXT_PUBLIC_MISTRAL_API_KEY || ''
});

export default function ClaimComponent({ claim, isSelected, onClick, onTagClick }) {
    const [isLoading, setIsLoading] = useState(false);
    const [activeTag, setActiveTag] = useState(claim.tag); 

    const handleTagClick = (e) => {
        e.stopPropagation();
        if (activeTag && onTagClick) {
            onTagClick(activeTag);
        }
    };

    const handleAutoTagging = async (e) => {
        e.stopPropagation(); 
        setIsLoading(true);

        try {
            // ==========================================
            // APPROCHE 1 : MACHINE LEARNING (API LOCALE)
            // ==========================================
            
            const response = await fetch('http://127.0.0.1:8000/tags', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_claim: claim.content }),
            });

            if (!response.ok) throw new Error("Erreur serveur API Python");

            const data = await response.json();
            setActiveTag(data.category);


            // ==========================================
            // APPROCHE 2 : LLM MISTRAL
            // ==========================================
            /*

            const categoriesStr = `- Debt collection
- Credit reporting, credit repair services, or other personal consumer reports
- Mortgage
- Credit reporting
- Student loan
- Credit card or prepaid card
- Credit card
- Bank account or service
- Checking or savings account
- Consumer Loan
- Vehicle loan or lease
- Money transfer, virtual currency, or money service
- Payday loan, title loan, or personal loan
- Payday loan
- Money transfers
- Prepaid card
- Other financial service
- Virtual currency`;


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
                model: 'open-mistral-nemo',
                messages: [
                    { role: 'system', content: promptSysteme },
                    { role: 'user', content: claim.content }
                ],
                temperature: 0,
                responseFormat: { type: 'json_object' }
            });

            const contenu = response.choices[0].message.content;
            const jsonResult = JSON.parse(contenu);
            
            setActiveTag(jsonResult.category);
            */

        } catch (error) {
            console.error("Erreur lors de la classification :", error);
            alert("Erreur de classification : Vérifie que ton serveur Python tourne bien sur le port 8000 !");
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
                
                {activeTag ? (
                    <button
                        className={styles.tag}
                        onClick={handleTagClick}
                        aria-label={`Maps to ${activeTag} inbox`}
                        title={`Go to ${activeTag} inbox`}
                    >
                        {activeTag}
                    </button>
                ) : (
                    <button 
                        className={styles.tag}
                        onClick={handleAutoTagging}
                        disabled={isLoading}
                        style={{ cursor: isLoading ? 'wait' : 'pointer', backgroundColor: isLoading ? '#ccc' : '' }}
                    >
                        {isLoading ? ' Chargement...' : ' Auto-étiqueter'}
                    </button>
                )}
            </div>
        </div>
    );
}