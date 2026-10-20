---
name: run-hexgl
description: Run, start, serve and screenshot HexGL (jeu de course WebGL statique) avec le serveur PHP intégré et Chrome headless. À utiliser pour lancer ou vérifier le jeu dans le vrai navigateur.
---

HexGL est un site 100 % statique (HTML/JS/WebGL), sans build. On le sert avec `php -S` et on le capture avec Chrome headless. Chemins relatifs à la racine du projet `HexGL/`. Vérifié sur Windows 11, Git Bash, PHP 8.2 (XAMPP), Chrome.

## Prérequis
- `php` dans le PATH (ici `C:\xampp\php`) et Google Chrome installé.

## Lancer (chemin agent)
```bash
(php -S localhost:8000 >/dev/null 2>&1 &); sleep 2
curl -s -o /dev/null -w "%{http_code}\n" localhost:8000/index.html   # 200
"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new \
  --enable-unsafe-swiftshader --use-angle=swiftshader --window-size=1280,720 \
  --virtual-time-budget=15000 --screenshot="C:\chemin\absolu\hexgl.png" \
  http://localhost:8000/index.html
```
Lire ensuite le PNG : on doit voir le menu HexGL (START, CONTROLS, QUALITY, HUD, CREDITS).

## Arrêter
`taskkill /IM php.exe /F` (tue aussi tout autre `php.exe`, p. ex. Apache XAMPP si lancé via php.exe).

## Humain
Ouvrir http://localhost:8000/index.html, cliquer START.

## Gotchas
- `--screenshot` exige un chemin Windows absolu (`C:\...`), pas un chemin Git Bash `/c/...`.
- Sans `--enable-unsafe-swiftshader --use-angle=swiftshader`, le WebGL headless peut ne pas s'initialiser.
- Le message `USB: usb_device_win.cc ... Failed to read descriptors` est du bruit, sans effet.
- Limite : seule la capture du menu est vérifiée. Aucun clic sur START (pas de driver CDP écrit) ; la course elle-même n'a pas été testée.
