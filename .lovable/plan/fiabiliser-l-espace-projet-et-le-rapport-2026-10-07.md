# Fiabiliser l’espace projet et le rapport

## Résultat attendu

Conserver l’organisation actuelle du prototype tout en donnant la priorité au chat sur les écrans étroits et en imposant un parcours de contrôle traçable avant toute génération, correction ou validation de rapport.

## Mise en œuvre

1. **Espace projet adaptatif**
   - Garder les trois zones actuelles sur grand écran.
   - Sur écran étroit, afficher le chat en priorité et déplacer Documents et Contexte & sources dans deux panneaux accessibles depuis la barre du projet.
   - Conserver l’onglet actif et permettre au chat d’ouvrir directement la bonne source.

2. **Contrôle avant rapport**
   - Intercaler une étape de contrôle avant « Préparer le rapport » et avant « Valider ».
   - Présenter les fichiers, échantillons, valeurs, unités, méthodes, fichiers sources et informations manquantes avec leur statut.
   - Bloquer la suite lorsqu’une association ou une valeur reste à confirmer, tout en indiquant précisément l’action attendue.

3. **Rapport fondé sur les preuves**
   - Rendre chaque valeur mesurée cliquable vers sa fiche de preuve exacte : échantillon, fichier, méthode, version et statut.
   - Séparer visuellement les observations factuelles, les hypothèses proposées par l’assistant et les conclusions validées par l’expert.
   - N’afficher une conclusion comme validée qu’après l’action explicite de l’expert.

4. **Modèles DOCX et techniques**
   - Ajouter l’import de rapports blancs DOCX dans l’onglet Modèle.
   - Afficher le modèle importé et les sections détectées dans la démonstration locale.
   - Activer automatiquement les sections correspondant à toutes les techniques du dossier et signaler les sections manquantes.

5. **Sources internes et externes**
   - Enrichir les résultats A&S avec un aperçu du rapport, le passage source pertinent et le devis lié lorsqu’il existe.
   - Remplacer les liens externes fictifs par des références bibliographiques vérifiables et des liens ouvrables, clairement séparés des données de démonstration.

6. **Corrections avec aperçu**
   - Remplacer la correction automatique actuelle par une instruction rédigée par l’expert.
   - Générer un aperçu avant/après des changements proposés.
   - Ne créer une nouvelle version qu’après acceptation explicite de cet aperçu.

## Détails techniques

- Étendre le modèle local existant sans changer l’architecture générale du prototype.
- Centraliser la fiche de preuve afin qu’elle soit réutilisée dans le contrôle, le contexte et le rapport.
- Conserver l’historique actuel et ajouter les métadonnées nécessaires aux passages, devis, modèles importés et propositions de correction.
- Vérifier le parcours complet ainsi que l’affichage aux largeurs mobile, tablette et bureau.

## Limite conservée

Les données restent stockées dans le navigateur comme dans le prototype actuel ; l’import DOCX est représenté dans ce prototype sans serveur documentaire persistant.