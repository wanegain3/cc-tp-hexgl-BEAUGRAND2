# HexGL — notes pour Claude

## Tests (QUnit, sans Node.js ni npm)
- Windows : `formation/tests/ci-chrome.bat` (PowerShell : `& .\formation\tests\ci-chrome.bat`) ; Linux : `formation/tests/ci-chrome.sh`.
- Codes retour : 0 = réussi, 1 = échec (rapport `formation/tests/rapport_erreur.html`, ignoré par git), 2 = impossible.
- Tests dans `formation/tests/browser-tests.js` ; scripts testés chargés dans `formation/tests/index.html` (`Utils.js`, `Timer.js`).
- Pas de `package.json` ni de `npm test` : ne pas en ajouter.

## Captures de référence (avant refactoring)
- `formation/tests/captures/01-accueil.png` (menu) et `02-jeu-en-cours.png` (course, après Start).
- Elles contiennent logo/couleurs/textes HexGL : à régénérer après la personnalisation ACME.
- Lancer le jeu : skill `run-hexgl` (`php -S localhost:8000`, Chrome headless avec `--enable-unsafe-swiftshader --use-angle=swiftshader`). Pour la course, piloter Chrome via CDP : `click()` sur `#start` puis `#step-2`, attendre ~40 s le chargement.
