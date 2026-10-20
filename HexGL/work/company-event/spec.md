# Spec — Personnalisation événementielle HexGL (ACME Racing Challenge)

Source de vérité du besoin : `formation/tickets/company-event.md`.
Contraintes d'identité : `formation/identite/charte_graphique_acme.pdf` (v1.0, 09/2026) et `formation/identite/logo.png`.

## 1. Contexte et objectif

ACME utilise HexGL lors d'un événement d'entreprise. L'écran d'accueil actuel (menu du jeu, titre « HexGL », fond et couleurs d'origine) ne reflète pas la marque.

**Objectif** : l'écran d'accueil présente l'identité ACME (logo, couleurs, nom, message d'accueil) conformément à la charte, **sans aucun changement de gameplay**.

## 2. Exigences fonctionnelles

- **EF1 — Logo** : le logo ACME fourni est visible sur l'écran d'accueil, sans déformation.
- **EF2 — Nom** : le nom « ACME » (et « ACME Racing Challenge ») remplace toute présentation de la marque HexGL sur l'écran d'accueil.
- **EF3 — Message d'accueil** : l'écran affiche exactement « Bienvenue au ACME Racing Challenge ».
- **EF4 — Sous-titre** : la phrase de la charte « Une expérience événementielle aux couleurs de la marque. » est affichée sous le message d'accueil.
- **EF5 — Action principale** : le bouton de lancement est libellé « DÉMARRER LA COURSE » et déclenche le même parcours qu'aujourd'hui.
- **EF6 — Couleurs** : fond principal sombre ; accents violet, bleu électrique, cyan ; texte blanc ou gris clair ; dégradé événementiel violet → bleu électrique autorisé.
- **EF7 — Titre HexGL** : l'image-titre HexGL n'apparaît plus sur l'écran d'accueil.

## 3. Comportements attendus

- Au chargement, l'accueil affiche, lisibles au premier regard : logo, message d'accueil, sous-titre, bouton « DÉMARRER LA COURSE », puis les options existantes (contrôles, qualité, HUD, crédits).
- Un clic/toucher sur « DÉMARRER LA COURSE » enchaîne comme avant : écran d'aide aux contrôles, puis chargement, puis course.
- Les options (contrôles, qualité, HUD, crédits) restent présentes et se comportent comme avant (rotation des valeurs, paramètres d'URL, écran de crédits et retour).
- Sans WebGL, le bouton garde son comportement actuel de signalement (« WebGL is not supported! » + renvoi), son style restant conforme à la charte.
- Le logo est présenté sur un panneau clair (blanc ou gris clair `#E6E8EE`) avec une zone de respiration, posé sur le fond sombre de l'écran. Décision prise avec le demandeur : le logo n'a pas de version claire et ne peut être ni recoloré ni détouré.

## 4. Contraintes

- **Identité (charte)** :
  - palette : noir profond `#08090D`, violet `#7628FF`, bleu électrique `#315BFF`, cyan `#00C4E8`, blanc `#FFFFFF`, gris clair `#E6E8EE` ; aucune couleur hors palette pour le branding ;
  - logo : fichier fourni, proportions conservées, sans ombre ni contour, sans recoloration, jamais sur un fond illisible ;
  - fond jamais gris moyen dominant ; rendu sobre, lisible, peu chargé ; pas d'effets complexes supplémentaires.
- **Typographie** : conserver la typographie existante si elle reste lisible ; aucune nouvelle dépendance webfont. Le titre doit rester en sans-serif à graisse forte.
- **Gameplay inchangé** : physique, contrôles, HUD en course, circuit, difficulté, sons, score et fin de course strictement identiques.
- **Périmètre technique** : application statique sans build, sans `package.json` ; aucune nouvelle dépendance ; aucun nouvel appel réseau.
- **Lisibilité** : textes de l'accueil contrastés sur leur fond ; affichage correct du bureau (écran d'événement, borne) au mobile.

## 5. Décisions de conception déjà imposées

| Décision | Origine |
|---|---|
| Message d'accueil exact « Bienvenue au ACME Racing Challenge » | Charte §3 |
| Libellé du bouton « DÉMARRER LA COURSE » | Charte §3 (intention visuelle) |
| Logo visible sur l'accueil, non déformé | Charte §3, ticket |
| Fond sombre, accents violet/bleu/cyan, dégradé violet → bleu autorisé | Charte §1, §2 |
| Intégration sobre et maintenable, pas d'effets complexes ajoutés | Charte §3 |
| Gameplay, contrôles et HUD intouchés | Ticket, charte §3 |
| Pas de webfont ajoutée ; typographie legacy conservée si lisible | Charte §2 |
| Logo sur panneau clair (pas de variante sombre disponible) | Décision utilisateur |
| Périmètre limité à l'écran d'accueil ; image-titre HexGL retirée de cet écran | Décision utilisateur |
| Crédits HexGL (auteurs, contributeurs, modèles) conservés | Obligation de licence/attribution |

## 6. Cas limites et gestion des erreurs

- **Logo introuvable ou en échec de chargement** : l'accueil reste utilisable (le nom « ACME » en texte reste visible, le bouton reste fonctionnel) ; pas d'erreur bloquante.
- **Écrans étroits / portrait / mobile** : logo et message non coupés, non déformés, sans défilement horizontal ; le bouton reste accessible.
- **Grands écrans (borne)** : le logo ne devient pas flou au point d'être illisible ; proportions conservées.
- **Accents et caractères** : « DÉMARRER », « expérience », « événementielle » s'affichent correctement (encodage UTF-8).
- **Options via URL** (`controlType`, `quality`, `hud`, `godmode`) : restent prises en compte ; l'option Godmode reste masquée.
- **Survol/focus** : les états d'interaction du menu restent distincts et lisibles dans la nouvelle palette.
- **Retour des crédits** : revenir des crédits restaure l'accueil ACME complet.
- **Écart documentaire à noter** : la charte cite `training/acme-logo.png` et `training/charte-graphique-acme.pdf` ; les fichiers réels sont dans `formation/identite/` (`logo.png`, `charte_graphique_acme.pdf`). Les fichiers du dépôt font foi.

## 7. Hors périmètre

- Écrans d'aide aux contrôles, de chargement, de fin de course, HUD en course.
- Écran de crédits : visuel inchangé (hors retrait d'attribution, interdit).
- Titre d'onglet, balises meta/og, favicon, icônes et packaging (Firefox OS, AppCache).
- Libellés des options du menu (Controls/Quality/HUD) : restent en anglais.
- Traduction du jeu, nouveau logo ou version claire du logo, nouveaux assets graphiques créés pour ACME.
- Suppression d'Analytics, liens de partage ou autres dettes listées dans `docs/architecture.md`.
- Toute modification de gameplay, de physique, de pistes ou de sons.
- Correction des bugs existants.

## 8. Critères d'acceptation

1. **Logo** : sur l'accueil, le logo ACME est visible, a le même rapport largeur/hauteur que `logo.png`, sans ombre, contour ni recoloration, sur un panneau clair avec marge visible.
2. **Message** : le texte « Bienvenue au ACME Racing Challenge » est présent, exact, lisible ; le sous-titre de la charte est affiché.
3. **Bouton** : libellé « DÉMARRER LA COURSE » ; un clic mène à l'écran d'aide aux contrôles puis, après clic, au chargement.
4. **Palette** : toutes les couleurs de marque de l'accueil appartiennent à la palette de la charte ; fond dominant sombre ; aucun gris moyen dominant.
5. **Marque HexGL** : aucune image-titre ni mention « HexGL by BKcore » visible sur l'accueil ; les crédits HexGL restent accessibles via « Credits ».
6. **Options et crédits** : chaque option change de valeur au clic ; les paramètres d'URL sont respectés ; crédits ouverts puis refermés ramènent l'accueil ACME.
7. **Gameplay** : après Start, la course se lance et se joue comme avant (compte à rebours, HUD, 3 tours, écran de fin) ; aucun fichier de gameplay modifié.
8. **Non-régression** : `formation/tests/ci-chrome.bat` retourne 0 ; aucune nouvelle erreur dans la console du navigateur.
9. **Responsive** : accueil correct en 1920×1080 et en portrait mobile (par ex. 390×844), sans coupure ni déformation.
10. **Captures** : après implémentation, régénérer `formation/tests/captures/01-accueil.png` (accueil ACME) ; `02-jeu-en-cours.png` reste valable pour la course, hors éléments d'identité repris de l'accueil.
11. **Sobriété** : aucune nouvelle dépendance, aucun webfont ajouté, aucun effet d'animation complexe supplémentaire.
