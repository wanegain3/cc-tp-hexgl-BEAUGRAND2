# Plan — Accueil ACME Racing Challenge (approche technique minimale)

## 1. Objectif
Remplacer l'identité visuelle de l'écran d'accueil (`#step-1`) par celle d'ACME (logo, message, sous-titre, bouton, palette) sans toucher au gameplay, à `launch.js` ni aux étapes 2 à 5. Branding défini en **un seul fichier**.

## 2. État actuel et architecture concernée
- `index.html` : `#step-1` = `#global` (fond `css/bg.jpg`, animé), `#title` (fond `css/title.png` = image HexGL, animé), `#menu` (Start, Controls, Quality, HUD, Godmode masqué, Credits).
- `css/multi.css` : couleurs en dur (`#4190bb`, `#f66439`, `#f8854b`), halo blanc `text-shadow`, bandeau dégradé blanc semi-transparent sur chaque item, police `BebasNeueRegular` (sans-serif forte, à conserver).
- `launch.js` (compilé depuis `launch.coffee`) : câble les `onclick` par id (`start`, `s-*`, `step-1/2`, `credits`) ; ne touche à `#start` que pour le message « WebGL is not supported! ». **Il n'a pas besoin d'être modifié** tant que les ids sont conservés.
- Tests : `formation/tests/index.html` charge `Utils.js`, `Timer.js`, `browser-tests.js` ; `ci-chrome.bat` renvoie 0/1/2.

## 3. Approche technique
1. Un fichier statique `brand.js` (JS ES5 simple, pas de CoffeeScript, pas de build) expose `window.BRAND` (données) et une fonction `BRAND.apply(document)` appelée à la fin du fichier.
2. `apply` : pose les couleurs en variables CSS sur `:root` (`--brand-bg`, `--brand-violet`…), remplit les textes (`#brand-welcome`, `#brand-subtitle`, `#start`), et charge le logo dans `<img id="brand-logo">`.
3. `css/multi.css` (section accueil uniquement) lit `var(--brand-*)` ; plus aucune couleur de marque en dur dans le CSS.
4. Le logo vit dans un panneau clair (`#E6E8EE`) avec padding ; `img { max-width:100%; height:auto }` → proportions conservées. `onerror` masque l'image et laisse un texte « ACME » visible (cas limite de la spec).
5. Suppression de `title.png` et `bg.jpg` de l'accueil (CSS uniquement, fichiers laissés sur disque → réversible). Fond = `--brand-bg` (+ dégradé violet → bleu autorisé, discret). Animations `anim`/`animbg` retirées de l'accueil (sobriété).

## 4. Fichiers impactés
| Fichier | Changement |
|---|---|
| `brand.js` (**nouveau**, racine) | config + `apply` |
| `index.html` | `#title` remplacé par un bloc logo/message/sous-titre ; ajout `<script src="brand.js">` **avant** `launch.js` (pour que le message WebGL de `launch.js` l'emporte sur le libellé du bouton) |
| `css/multi.css` | règles `#global`, `#title`, `#menu`, `#menu div`, `#start` (+ hover) et nouveaux blocs logo/texte ; `#step-2…#credits` intacts |
| `formation/tests/index.html` + `browser-tests.js` | charger `brand.js`, ajouter un module QUnit « BRAND » (fichiers déjà modifiés localement : à relire avant d'y toucher) |
| `formation/tests/captures/01-accueil.png` | régénérée en fin de travail |
| **Non modifiés** | `launch.coffee/js`, `bkcore/**`, `bkcore.coffee/**`, `libs/**`, `css/fonts.css`, crédits |

## 5. Structure des données de branding
```js
BRAND = {
  name: "ACME",
  event: "ACME Racing Challenge",
  welcome: "Bienvenue au ACME Racing Challenge",
  subtitle: "Une expérience événementielle aux couleurs de la marque.",
  startLabel: "DÉMARRER LA COURSE",
  logo: "formation/identite/logo.png",   // chemin existant, pas de copie
  colors: { bg:"#08090D", violet:"#7628FF", blue:"#315BFF", cyan:"#00C4E8",
            white:"#FFFFFF", lightGray:"#E6E8EE" }
}
```

## 6. Décisions principales
- **JS + variables CSS** plutôt que CSS seul : un seul point (textes + couleurs), sans build.
- **Ids conservés** (`start`, `s-*`, `step-1`) : `launch.js` reste intact, donc parcours Start → aide → chargement → course identique.
- **Logo servi depuis `formation/identite/logo.png`** : pas de duplication d'asset ; le serveur PHP/Python sert la racine, donc le chemin fonctionne. (Copier vers `css/` si on veut que `formation/` reste hors livraison — à trancher.)
- **Texte via `textContent`** (jamais `innerHTML`) ; UTF-8 déjà déclaré dans `index.html`.
- Police Bebas Neue conservée, aucune webfont ; libellés d'options en anglais inchangés.
- Hover/focus : cyan sur fond sombre ; bouton principal en dégradé violet → bleu, texte blanc.
- Mobile : `@media (max-width: 600px)` réduit tailles/marges du panneau logo ; pas de défilement horizontal (`html, body { overflow:hidden }` déjà là → vérifier que le contenu tient en 390×844).

## 7. Risques et compatibilité
- `#menu div` applique un `scaleY(0.8)` et un dégradé blanc : à neutraliser sans casser le survol.
- Hauteur écran mobile : logo + message + 6 items doivent tenir sans coupure (`overflow:hidden`) → ajuster `bottom`/tailles.
- Contraste : vérifier violet `#7628FF` sur noir pour le texte (utiliser blanc/cyan pour le texte, violet/bleu pour les aplats).
- Ordre des scripts global : `brand.js` doit précéder `launch.js`.
- Chemin du logo relatif : fonctionne via HTTP ; en `file://` aussi, mais le jeu complet exige un serveur de toute façon.
- Dette connue non traitée (hors périmètre) : Analytics, meta/og, titre d'onglet, crédits.

## 8. Stratégie de tests et vérification
- **QUnit (existant, `formation/tests/ci-chrome.bat`, retour 0)** : nouveau module BRAND — (a) `welcome` exact, (b) toutes les couleurs ∈ palette de 6 valeurs, (c) `apply` sur un faux DOM (`#qunit-fixture`) remplit les textes et pose les variables, (d) `onerror` du logo laisse le nom visible.
- **Visuel** (skill `run-hexgl`, `php -S localhost:8000`, Chrome headless) : captures 1920×1080 et 390×844 ; contrôle manuel logo non déformé, pas de HexGL visible, crédits ouvrables/refermables, options qui tournent, `?controlType=3&quality=1&hud=0` respectés.
- **Parcours** : Start → `#step-2` → clic → `#step-3` → course (via CDP selon CLAUDE.md, ~40 s) ; console sans nouvelle erreur.
- **Gameplay** : `git diff --stat` ne doit lister aucun fichier de `bkcore/` ni `launch.*`.
- Régénérer `01-accueil.png` ; `02-jeu-en-cours.png` conservée.

## 9. Plan d'implémentation (aucun commit avant validation finale)
1. **Config + test** : créer `brand.js` (données seules) et le module QUnit BRAND (données uniquement). *Vérif :* `ci-chrome.bat` → 0.
2. **Câblage DOM** : ajouter le bloc HTML, `apply()` et le `<script>` avant `launch.js`. *Vérif :* test `apply` vert ; accueil servi, textes présents, `Start` fonctionne encore.
3. **Style** : adapter `multi.css` (fond, panneau logo, menu, bouton, hover, mobile). *Vérif :* captures 1920×1080 et 390×844, contraste, pas de couleur hors palette (`grep` des hex dans la section modifiée).
4. **Non-régression** : parcours complet jusqu'à la course, options URL, crédits, fallback logo (renommer temporairement le chemin), WebGL absent. *Vérif :* console propre, `git diff --stat` sans gameplay.
5. **Clôture** : régénérer `01-accueil.png`, relancer `ci-chrome.bat`, présenter le diff pour validation ; **commit seulement après accord**.

Chaque étape est réversible (`git checkout` des fichiers touchés + suppression de `brand.js`).
