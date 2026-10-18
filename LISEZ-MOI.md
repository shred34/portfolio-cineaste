# Portfolio Julien Monges — mode d’emploi

Deux dossiers :

- `portfoliocinema/` : le **Studio Sanity**, l’interface où on modifie les films, la bio et le contact.
- `site/` : le **site** (Astro). Il lit le contenu dans Sanity.

## Première installation (une seule fois)

Ouvre le Terminal.

```bash
# 1. Le Studio
cd ~/Desktop/portfolio-cineaste/portfoliocinema
rm -rf node_modules          # l’ancienne installation était incomplète
npm install
npx sanity login             # connecte-toi avec ton compte Sanity
npm run import-seed          # importe les 6 films, la bio et le contact
```

```bash
# 2. Le site
cd ~/Desktop/portfolio-cineaste/site
rm -rf node_modules
npm install
```

## Lancer en local

Deux fenêtres de Terminal :

```bash
cd ~/Desktop/portfolio-cineaste/portfoliocinema
npm run dev                  # Studio → http://localhost:3333
```

```bash
cd ~/Desktop/portfolio-cineaste/site
npm run dev                  # Site → http://localhost:4321
```

Modifie un film dans le Studio, clique **Publish**, puis recharge la page du site : le changement apparaît.

## Ajouter un film

Studio → **Films** → bouton **+** (en haut) → remplis le titre, clique **Generate** pour l’adresse, mets l’année et l’image de couverture → **Publish**.

- Les films sont triés par année (le plus récent en premier). Le champ **Position** permet de forcer un ordre.
- Au-delà de **6 films**, de petites flèches ← → apparaissent sur l’accueil pour passer à la page suivante (on peut aussi glisser au doigt sur téléphone).

## Vidéos YouTube

Dans un film → onglet **Images & vidéo** → **Lien YouTube** : colle simplement le lien (`https://youtu.be/…`).
Sur le site, on voit l’image du film avec « Lecture » ; la vidéo YouTube ne se charge qu’au clic (version sans cookies, sans vidéos suggérées).

## Important : le dossier est sur le Bureau (iCloud)

Le Bureau est synchronisé par iCloud. iCloud peut « décharger » des fichiers, ce qui casse `node_modules` (erreurs bizarres, localhost qui ne démarre pas). C’est probablement pour ça que localhost ne marchait pas.
Le plus sûr : déplacer `portfolio-cineaste` dans un dossier non synchronisé, par exemple `~/Developer/`, puis refaire `npm install` dans les deux dossiers.

## Mise en ligne

### 1. Le Studio Sanity (privé, pour modifier le contenu)

```bash
cd portfoliocinema
npx sanity deploy
```
Choisis un nom (ex. `julienmonges`) → le Studio est en ligne sur `https://julienmonges.sanity.studio`.
Seules les personnes invitées dans le projet (sanity.io/manage → Members) peuvent se connecter et modifier.
À refaire seulement si on change les schémas (les champs du Studio).

### 2. Le site (GitHub Pages)

1. **GitHub Desktop** → File → Add Local Repository → choisis le dossier `portfolio-cineaste` → « create a repository » → Publish repository.
   Le dépôt doit être **public** (GitHub Pages gratuit), il ne contient aucun mot de passe.
2. Sur github.com, dans le dépôt : **Settings → Pages → Source : GitHub Actions**.
3. Dans **Actions**, le workflow « Mise en ligne du site » se lance ; après ~1 min le site est sur
   `https://TON-PSEUDO.github.io/portfolio-cineaste/`.

Ensuite : chaque modification du code → Commit + Push dans GitHub Desktop → le site se met à jour tout seul.

### 3. Mise à jour automatique quand on publie dans Sanity

Le site est construit à partir de Sanity au moment de la mise en ligne. Pour qu’une publication dans Sanity
mette le site à jour toute seule :

1. GitHub → photo de profil → Settings → Developer settings → Personal access tokens → **Fine-grained tokens** → Generate.
   Accès : seulement le dépôt `portfolio-cineaste`. Permission : **Contents : Read and write**. Copie le jeton.
2. sanity.io/manage → ton projet → **API → Webhooks → Create webhook** :
   - URL : `https://api.github.com/repos/TON-PSEUDO/portfolio-cineaste/dispatches`
   - Dataset : `production` · Trigger on : Create, Update, Delete
   - Filter : `_type in ["film", "siteSettings"]`
   - Projection : `{"event_type": "sanity-publish"}`
   - HTTP method : POST
   - HTTP headers : `Authorization` = `Bearer LE-JETON` et `Accept` = `application/vnd.github+json`
3. Publie un changement dans le Studio : environ 1 minute plus tard, le site en ligne est à jour.

Sans webhook, on peut aussi relancer la mise en ligne à la main : GitHub → Actions → « Mise en ligne du site » → Run workflow.

### Nom de domaine (plus tard)

Pour `julienmonges.ch` : GitHub → Settings → Pages → Custom domain. Le site s’adapte tout seul.
