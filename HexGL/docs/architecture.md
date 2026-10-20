# HexGL — Architecture (état actuel)

Document descriptif de l'état du dépôt `HexGL/` au commit `d79f615`. Il ne contient ni recommandation ni plan de correction.

## 1. Stack et points d'entrée

- **Type** : application web 100 % statique (HTML + JavaScript + WebGL), sans build, sans `package.json`, sans backend.
- **Langages** : JavaScript « ES5 » (prototypes, pas de modules), CoffeeScript (sources `.coffee` + JS compilé versionné dans `bkcore.coffee/`, généré par CoffeeScript 1.4.0 pour `Timer.js` et 1.7.1 pour `Utils.js` / `launch.js`).
- **Rendu** : Three.js (`libs/Three.dev.js`, ancienne API : `texture` sur les uniforms, `lerpSelf`, `slerpSelf`, `physicallyBasedShading`, `shadowMapSoft`) + post-traitement (`EffectComposer`, `RenderPass`, `BloomPass`, `ShaderPass`, `MaskPass`).
- **Entrées utilisateur** : clavier, tactile, orientation, gamepad, Leap Motion (`libs/leap-0.4.1.min.js`).
- **Audio** : Web Audio API (`bkcore/Audio.js`), fichiers `.ogg`.
- **Tests** : QUnit 2.26.0 hors ligne dans `formation/tests/`, exécutés dans Chrome/Edge headless (sans Node.js).
- **Serveur de dev** : n'importe quel serveur statique (README : `python -m SimpleHTTPServer`). Vérifié avec `php -S localhost:8000`.

### Points d'entrée

| Fichier | Rôle |
|---|---|
| `index.html` | Page unique du jeu : DOM des 5 « étapes », charge tous les scripts dans l'ordre. |
| `launch.js` (compilé depuis `launch.coffee`) | Script de démarrage : menu, options, instanciation de `bkcore.hexgl.HexGL`. |
| `brand.js` | Point unique de configuration du branding ACME : expose `window.BRAND` (textes, chemin du logo, palette) et `BRAND.apply(document)`, appelée au chargement. |
| `formation/tests/index.html` | Page de tests QUnit. |
| `formation/tests/ci-chrome.sh` / `.bat` | Lanceurs headless des tests (codes retour 0/1/2). |
| `bkcore.coffee/tests.html` | Ancienne page de test CoffeeScript (charge `Timer.js`, `ImageData.js`, `Three.r53.js`, sans assertion). |
| `manifest.webapp`, `package.webapp`, `package.zip`, `cache.appcache` | Packaging Firefox OS / AppCache. |

## 2. Flux principal de lancement

1. `index.html` affiche `#step-1` (`#global` puis `#home` = bloc `#brand` : logo, message d'accueil, sous-titre, et menu : Start, Controls, Quality, HUD, Godmode masqué, Credits) et charge les scripts : libs → contrôleurs → `Timer`/`ImageData`/`Utils` → `bkcore/threejs/*` → `Audio` → `bkcore/hexgl/*` → `tracks/Cityscape.js` → `HexGL.js` → `brand.js` → `launch.js`.
   - `brand.js` pose les variables CSS `--brand-*` sur `:root`, remplit par `textContent` `#brand-welcome`, `#brand-subtitle`, `#brand-name` et `#start`, et charge `#brand-logo` (`onerror` : image masquée, `#brand-name` affiché).
2. `launch.js` :
   - lit les options depuis l'URL via `bkcore.Utils.getURLParameter` (`controlType`, `quality`, `hud`, `godmode`), sinon valeurs par défaut (clavier ; qualité 3 « VERY HIGH » ; HUD on ; godmode off) ; contrôle par défaut = tactile si `isTouchDevice()` ;
   - chaque clic sur une option fait tourner la valeur (modulo) ;
   - teste WebGL (`hasWebGL`) : sinon, le bouton Start devient « WebGL is not supported! » et renvoie vers `get.webgl.org` (ce libellé écrase celui posé par `brand.js`, d'où l'ordre `brand.js` → `launch.js`).
3. Clic sur **Start** → `#step-2` (image d'aide selon le contrôle, `css/help-N.png`) → clic → `#step-3` (barre de progression) → `init(controlType, quality, hud, godmode)`.
4. `init` crée `new bkcore.hexgl.HexGL({... track: 'Cityscape', difficulty: 0 ...})` (assigné à `window.hexGL`). Le constructeur appelle `initRenderer()` (WebGLRenderer, `RenderManager`) et enregistre l'écoute de `Échap` (reset).
5. `hexGL.load()` → `bkcore.hexgl.tracks.Cityscape.load()` utilise `bkcore.threejs.Loader` pour charger textures, géométries JSON, analyseurs d'image (collision, hauteur), images HUD et sons. Les chemins viennent de `textures/` (qualité basse/moyenne) ou de `textures.full/` (qualité haute, avec specular/normal maps).
6. `onLoad` → `hexGL.init()` (`initHUD`, `track.buildMaterials`, `track.buildScenes`, `initGameComposer`) → `#step-4` affiché → `hexGL.start()`.
7. `start()` : `RenderManager.setCurrent("game")`, boucle `requestAnimationFrame` → `update()` → `Gameplay.update()` + `RenderManager.renderCurrent()`, puis `initGameplay()` (création de `Gameplay`, `gameplay.start()`, lecture des sons `bg` et `wind`).
8. `Gameplay.update()` : compte à rebours (steps 0 à 4 : « 3 », « 2 », « 1 », « Go »), puis `modes.timeattack` (checkpoints lus dans le pixel de `collision.png`, 3 tours, `RaceData.tick`), fin → `end()` → au step 100 après 2 s, `onFinish` → `ShipControls.terminate()` + `HexGL.displayScore()`.
9. `displayScore()` : avec `gameover` fourni (cas de `index.html`, élément `#step-5`), affiche le temps final et masque le parent de `#main` ; un clic sur `#step-5` recharge la page (`window.location.reload()`).

## 3. Modules, fichiers et assets

### Code applicatif (`bkcore/`)

| Fichier | Lignes | Rôle |
|---|---|---|
| `bkcore/hexgl/HexGL.js` | 446 | Orchestrateur : options, renderer, HUD, composer, score de fin, réglages de difficulté (`tweakShipControls`). |
| `bkcore/hexgl/ShipControls.js` | 806 | Physique et contrôles du vaisseau, collisions (via image), hauteur, boosters, bouclier, `teleport`. |
| `bkcore/hexgl/Gameplay.js` | 230 | Machine à états de la course (compte à rebours, tours, checkpoints, fin) ; modes `timeattack`, `survival` (nul), `replay`. |
| `bkcore/hexgl/HUD.js` | 269 | HUD en canvas 2D (vitesse, bouclier, temps, tour, messages). |
| `bkcore/hexgl/ShipEffects.js` | 186 | Effets du vaisseau (particules, boost, bouclier). |
| `bkcore/hexgl/CameraChase.js` | 72 | Caméra de poursuite / orbite. |
| `bkcore/hexgl/RaceData.js` | 98 | Enregistrement et relecture de trajectoires (replay). |
| `bkcore/hexgl/Ladder.js` | 51 | Classement en ligne (non chargé par `index.html`). |
| `bkcore/hexgl/tracks/Cityscape.js` | — | Seul circuit : liste des ressources, matériaux, scènes, checkpoints, `spawn`, `pixelRatio = 2048/6000`. |
| `bkcore/threejs/RenderManager.js`, `Shaders.js`, `Particles.js`, `Loader.js`, `Preloader.js` | — | Utilitaires Three.js (gestion de scènes, shaders maison dont `normal`, `normalV`, `hexvignette`, chargeur multi-ressources). `Preloader.js` n'est pas référencé par `index.html`. |
| `bkcore/Audio.js` | 141 | Wrapper Web Audio (`init`, `addSound`, `play`, `stop`, `volume`). |

### CoffeeScript (`bkcore.coffee/` et `launch.coffee`)

- `Timer`, `ImageData`, `Utils`, `threejs/Particles`, `controllers/{Touch,Orientation,Gamepad}Controller`, chacun en `.coffee` et `.js` compilé versionnés côte à côte.
- `index.html` charge les `.js` ; il charge `bkcore/threejs/Particles.js` (pas la version `bkcore.coffee/threejs/`).
- `Utils` (250 lignes) : `createNormalMaterial`, `projectOnScreen`, `getURLParameter`, `getOffsetTop`, `scrollTo`, `updateClass`, `request`, `isTouchDevice`.
- `Timer` : `start`, `pause`, `update`, `getElapsedTime`, `msToTime`, `msToTimeString`, `zfill`.
- `ImageData` : lecture de pixels d'une image chargée dans un canvas (`getPixel`, `getPixelBilinear`, `getPixelF`, `getPixelFBilinear`).

### Branding de l'accueil (`brand.js`)

- `window.BRAND` : `name`, `event`, `welcome`, `subtitle`, `startLabel`, `logo` (`formation/identite/logo.png`, sans copie) et `colors` (`bg`, `violet`, `blue`, `cyan`, `white`, `lightGray`, valeurs de la charte ACME).
- `css/multi.css` : les règles de l'accueil (`#global`, `#home`, `#brand*`, `#menu*`, `#start`) lisent `var(--brand-*)` ; aucune couleur de marque en dur. Les couleurs en dur d'origine subsistent dans `#credits` (écrans 2 à 5 non modifiés).
- Modifier le nom, les textes, la palette ou le logo ne demande que `brand.js` (et le fichier logo).
- `launch.js`, `bkcore/**` et `libs/**` ne sont pas modifiés ; les ids `start`, `s-*`, `step-1` sont conservés car `launch.js` y accroche ses `onclick`.

### Assets

| Dossier | Taille | Contenu |
|---|---|---|
| `textures/` | 4,2 Mo | Textures réduites (hud, particules, vaisseau, skybox, circuit, bonus, `checker.png`). |
| `textures.full/` | 5,3 Mo | Versions pleine taille avec specular et normal maps (README : « swap the two directories »). |
| `geometries/` | 1,3 Mo | Modèles Three.js JSON (`ships`, `tracks`, `booster`, `bonus`). |
| `audio/` | 2,1 Mo | `bg`, `boost`, `crash`, `destroyed`, `wind` (`.ogg`) + `LICENSE`. |
| `replays/cityscape-casual/bkcore.replay.json` | 604 Ko | Enregistrement de course (non référencé par le code lu). |
| `css/` | — | `multi.css`, `fonts.css`, `touchcontroller.css`, police Bebas Neue (eot/svg/ttf/woff), images d'aide et mobiles. `title.png` (titre HexGL) et `bg.jpg` ne sont plus référencés par l'accueil et restent sur disque. |
| `icon_*.png`, `favicon.png` | — | Icônes. |
| `formation/identite/` | — | `charte_graphique_acme.pdf` (support du ticket) ; `logo.png`, chargé à l'exécution par l'accueil via `brand.js`. |
| `formation/tickets/company-event.md` | — | Ticket de personnalisation (écran d'accueil ACME, gameplay inchangé). |

## 4. Dépendances et zones legacy à risque

### Dépendances (toutes vendorisées dans `libs/`)

- `Three.dev.js` (version non étiquetée) pour le jeu ; `Three.r53.js` uniquement pour `bkcore.coffee/tests.html`. Deux versions de Three.js coexistent.
- `ShaderExtras.js`, `postprocessing/*` (anciens, couplés à l'API de Three de l'époque), `Detector.js`, `Stats.js`, `DAT.GUI.min.js`, `leap-0.4.1.min.js`.
- `libs/Editor.html` + `libs/Editor_files/` (éditeur annexe : jQuery 1.8, Kinetic, Ace…), non utilisé par le jeu.
- Aucun gestionnaire de paquets, aucune version épinglée par manifeste.

### Dépendances externes réseau dans `index.html`

- Google Analytics (`ga.js`, compte `UA-26274524-4`), chargé au démarrage.
- `favicon.png` et `og:image` / `og:url` pointent vers `hexgl.bkcore.com`.
- Liens de partage Twitter/Facebook et `get.webgl.org` dans le code JS.

### Zones legacy à risque

- **Ordre des scripts** : tout repose sur des globaux (`bkcore`, `THREE`) et sur l'ordre des balises `<script>` ; pas de modules. `brand.js` doit précéder `launch.js`.
- **Accueil ACME — dépendance à `formation/`** : le logo est lu à `formation/identite/logo.png` ; une livraison qui exclurait ce dossier perd le logo (le texte « ACME » prend alors le relais).
- **Accueil ACME — affichage de `#step-1`** : `launch.js` fixe `style.display` à `block`/`none` sur `#step-1`, qui ne peut donc pas être un conteneur flex ; le centrage vertical est porté par le wrapper `#home`.
- **Accueil ACME — spécificité CSS** : `#menu div:hover` l'emporte sur les règles `#start` seules ; les règles du bouton sont écrites `#menu #start`.
- **API Three.js obsolète** : tout changement de version de Three casse shaders, matériaux et composer.
- **Web Audio** : `bkcore.Audio.init()` crée un `AudioContext` au chargement du script, avant tout geste utilisateur (politique d'autoplay des navigateurs récents).
- **Double source** : `.coffee` et `.js` compilé coexistent ; rien n'indique dans le dépôt comment recompiler. Les `.js` ont été générés par deux versions différentes de CoffeeScript.
- **Physique/collisions** : `ShipControls.js` (806 lignes) calcule collisions et hauteur en lisant des pixels de `collision.png` / `height.png` (échelle `pixelRatio`), fortement couplé à `Cityscape`.
- **Mobile / Firefox OS** : `manifest.webapp` référence `launch_path: /index-mobile.html`, fichier absent du dépôt.
- **Packaging** : `package.zip` (binaire) et `package.webapp` versionnés dans le dépôt ; `cache.appcache` (AppCache, API dépréciée) liste des ressources.
- **Taille** : textures, géométries et audio représentent environ 13 Mo versionnés dans Git.

## 5. Fonctions et modules testables automatiquement

### Existant : `formation/tests/`

- `index.html` charge `vendor/qunit-2.26.0.js`, `../../bkcore.coffee/Utils.js`, `../../bkcore.coffee/Timer.js`, `../../brand.js` et `browser-tests.js`. Il se redirige lui-même vers `?hexgl_poc=ok` si ce paramètre est absent.
- `browser-tests.js` pose `data-test-status` / `data-test-count` / `data-test-failures` sur `<html>` à la fin de QUnit ; le statut est `pass` seulement si 0 échec **et** au moins 4 tests.
- Module `HexGL — bkcore.Utils` (5 tests) : `updateClass` (ajout), `updateClass` (suppression), `getOffsetTop` (parent/enfant factices), `getURLParameter` (présent et absent).
- Module `HexGL — bkcore.Timer` (6 tests) : `zfill`, `msToTime`, `msToTimeString`, état initial, `start`/`update`, `pause`, avec `Date` simulé.
- Module `ACME — BRAND (données)` (6 tests) : textes exacts de la charte, palette de 6 couleurs, chemin du logo, `BRAND.apply` sur un document isolé (`document.implementation.createHTMLDocument`), repli du logo (`onerror` rend `#brand-name` visible), tolérance aux éléments absents.
- Exécution constatée : `41 test(s) : 41 réussi(s), 0 échec(s)` (le compteur QUnit compte les assertions, pas les tests). Chrome headless, ouverture directe du fichier avec `?hexgl_poc=ok`.
- `brand.js` appelle `BRAND.apply(document)` au chargement : sur la page de tests, il pose les variables `--brand-*` sur `<html>` (sans effet, les éléments de marque étant absents).
- `ci-chrome.sh` / `.bat` : mode `--headless=new --dump-dom`, durée virtuelle 5 s, retour `0` (réussi), `1` (échec), `2` (impossible) ; `rapport_erreur.html` n'est conservé qu'en cas d'échec ; la règle `.gitignore` censée l'ignorer ne correspond pas au dépôt (voir §6).

### Candidats testables sans WebGL, sans canvas ni réseau (non couverts aujourd'hui)

| Module / fonction | Pourquoi testable |
|---|---|
| `bkcore.Timer.msToTime`, `msToTimeString`, `zfill` (`bkcore.coffee/Timer.js`) | Fonctions statiques pures (couvertes par le module `bkcore.Timer`). |
| `bkcore.Timer` (`start`, `update`, `pause`, `getElapsedTime`) | Dépend de `Date`, simulable (couvert par le module `bkcore.Timer`). |
| `bkcore.Utils.isTouchDevice` | Lit `window` / `navigator`. |
| `bkcore.Utils.updateClass`, `getOffsetTop`, `getURLParameter` | Déjà couverts partiellement. |
| `bkcore.Utils.request` | Testable avec un `XMLHttpRequest` simulé. |
| `bkcore.hexgl.RaceData` (`tick`, `reset`, `export`, `import`, `applyInterpolated`) | Nécessite `THREE.Vector3` / `Quaternion` et un `shipControls` factice. |
| `bkcore.hexgl.Gameplay` (compte à rebours, tours, `checkPoint`, `end`) | Dépend de `Timer`, d'un `shipControls`, d'un `analyser` et d'un `track` factices. |
| `bkcore.hexgl.HexGL.tweakShipControls` | Affecte des constantes selon `difficulty` / `godmode` sur un objet. |
| `bkcore.hexgl.Ladder.displayLadder` | Manipulation DOM pure avec données injectées. |
| `bkcore.ImageData.getPixel*` | Nécessite un canvas, sans WebGL. |

Non testables sans navigateur WebGL ou assets : `HexGL` (constructeur, `initRenderer`, `init*`), `ShipControls` physique, `HUD`, `RenderManager`, `Shaders`, `Cityscape.load/buildScenes`, `Audio` (Web Audio).

## 6. Bugs, dettes et anomalies remarquables

Constatés par lecture du code (hors exécution en jeu, sauf mention).

### Bugs probables

1. `HexGL.js` (`displayScore`) : `JSON.Stringify(...)` au lieu de `JSON.stringify` (l'appel lèverait `TypeError`).
2. `HexGL.js` (`displayScore`) : les clés `localStorage` sont construites avec `t` = l'objet circuit (`'score-'+t+'-'+d`), soit `"score-[object Object]-casual"`. `Gameplay.start` lit la clé replay avec `this.track.name` : les deux ne coïncident pas.
3. `HexGL.js` / `Ladder.js` : `displayScore` accède à `bkcore.hexgl.Ladder.global[t][d]` alors que `Ladder.js` n'est pas chargé par `index.html`, et `Ladder.js` lui-même lit/écrit `bkcore.Ladder.global` (espace de noms différent de `bkcore.hexgl.Ladder`). Ces chemins ne sont atteints que si `gameover` n'est pas fourni (non le cas dans `index.html`).
4. `Ladder.displayLadder` : condition `!bkcore.Ladder.global[track][mode] == undefined` toujours fausse ; `m` calculé mais la boucle parcourt `l.length-1` (le paramètre `num` est ignoré).
5. `RaceData.tick` : incrémente `this.rate` (constante de fréquence) au lieu de `this.rateState` ; `rateState` reste à 1, donc l'échantillonnage « 1 / rate » ne s'applique jamais.
6. `RaceData.applyInterpolated` : lit `prev` avant de tester `this.seek < 0`, et ne fait pas de `return` après la téléportation « sans interpolation » (continue vers l'interpolation avec `next` éventuellement `undefined` en fin de données).
7. `Gameplay.modes.replay` : `self.result.REPLAY` au lieu de `self.results.REPLAY` (`result` est un entier, `.REPLAY` vaut `undefined`).
8. `Gameplay.modes.survival` est `null` : le mode est accepté par le constructeur mais `this.modes[this.mode].call(this)` échouerait.
9. `Gameplay.start` : en mode replay, retourne `false` avant `this.active = true` si aucune donnée ; autrement ne retourne rien.
10. `Utils.request` : la boucle de création du XHR va jusqu'à `i <= length` (index hors tableau), seulement masqué par le `try/catch` ; `if (req == null)` ne détecte pas `false` ; pour un `GET`, les données ne sont pas ajoutées à l'URL ; pour un `POST`, `url += "?" + qdata` est répété à chaque champ.
11. `Timer.msToTime` : `ms` n'est pas arrondi (valeur flottante possible), clé `ms` dupliquée dans le littéral ; `msToTimeString` formate `ms` sur 4 caractères.
12. `HexGL.js` : `this.a[15] == "o"` (contrôle sur l'URL) laissé en commentaire dans `start()`.
13. `launch.js` : `getURLParameter` renvoie du texte, donc la rotation d'une option initialisée par l'URL concatène (`"3"+1 = "31"`). Avec `?controlType=3`, un clic reste sur GAMEPAD ; avec `?quality=1`, le premier clic passe à VERY HIGH.

### Dettes et incohérences

- `launch.js` : le menu comporte un élément Godmode caché (`display: none`) ; son option reste accessible via le paramètre d'URL `?godmode=1`.
- `index.html` : libellé initial « Quality: High » remplacé à l'exécution par « VERY HIGH ».
- Code commenté mort (FXAA dans `initGameComposer`), commentaires de portage mobile/desktop.
- `console.log` de debug laissés (`LOADED …`, `RaceData.import`).
- Licences hétérogènes : en-têtes `CC BY-NC 3.0` dans les sources, README déclare MIT « unless specified ».
- `README.md` décrit encore `python -m SimpleHTTPServer` (Python 2) et ne mentionne ni les tests ni `formation/`.
- `libs/Editor.html` + `Editor_files/` : dépendances de l'éditeur de diagramme embarquées, sans lien avec le jeu.
- `.gitignore` limité à `.DS_Store` et au rapport d'erreur des tests.
- `formation/tests/README.md` mentionne `rapport_erreur.html` et le `.gitignore`. `HexGL/.gitignore` contient `/HexGL/formation/tests/rapport_erreur.html`, mais la racine du dépôt Git est le dossier parent (`cc-tp-hexgl/`) : le chemin ne correspond pas et le rapport apparaît dans `git status` s'il existe.
- Option « Leap Motion » (`?controlType=2`, ou sélectionnée par rotation) : la course affiche « Waiting for the Leap Motion controller server… » et le WebSocket vers `ws://127.0.0.1:6437` échoue sans appareil ; comportement d'origine.
- Test `getURLParameter` : son résultat dépend de la présence de `hexgl_poc=ok` dans l'URL (ouverture directe sans redirection → `null` attendu).
- Les tests couvrent `bkcore.Utils`, `bkcore.Timer` et `BRAND` (3 modules ; le reste du code n'est pas couvert).
