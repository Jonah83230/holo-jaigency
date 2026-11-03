---
name: holo
description: Transforme une série de musculation filmée en Reel « hologramme » — compte les reps et mesure montée/descente à partir des articulations (Apple Vision, sur le Mac), prépare l'extrait pour le transfert de mouvement (Higgsfield Genjutsu Lite ou autre), puis monte la vidéo avec Remotion (dossier montage/) — squelette, compteur, ligne de scan, hologramme de face puis 3/4, voix face caméra en bulle, carte de fin. À utiliser pour « compte mes reps », « fais-moi l'hologramme », « monte ma série », « /holo ».
---

# Holo : de la série filmée à l'hologramme

Tu travailles dans `montage/`. La personne filme, génère l'hologramme sur son propre compte et publie. Toi, tu mesures, tu prépares et tu montes. Tu parles français et tu tutoies.

## 0. Installation (une seule fois)

```
cd montage
npm install
npm run installer-navigateur
npm run sons
```

- Il faut Node.js 20 ou plus (`node -v`), sinon la version LTS sur nodejs.org.
- La détection du corps (`npm run pose`) utilise **Apple Vision : Mac uniquement**. Sur Mac, `swift` vient avec les outils de développement : si on te dit qu'il manque, lance `xcode-select --install`.
- Sur Windows ou Linux, le montage marche mais pas la détection. Propose alors le montage sans squelette ni compteur, ou le compteur à la main (temps donnés par la personne, présentés comme tels à l'écran).

## 1. La série : mesurer

Demande à la personne de mettre sa vidéo dans `montage/rushes/`. Pour un résultat propre : téléphone fixe et vertical, tout le haut du corps et les haltères dans le cadre, 6 reps ou plus. Ensuite :

```
npm run convertir -- IMG_1234.MOV        → public/r1234.mp4 (1080×1920)
npm run pose -- r1234.mp4                → public/r1234.pose.json (articulations, image par image)
npm run reps -- r1234.pose.json          → public/r1234.reps.json (reps, montée et descente moyennes)
```

- **Montre le nombre de reps trouvé et demande si c'est bien ce qu'elle a fait.** Si ça ne colle pas (mains hors cadre, mouvement où les mains ne montent pas), dis-le franchement et propose de refilmer. Ne corrige jamais un chiffre à la main en le présentant comme mesuré.
- `reps.mjs` marche pour les mouvements où les mains montent puis redescendent : développé, Arnold press, élévations, tractions vues de face. Pour un squat ou un saut, il faudrait suivre les hanches : dis-le, et propose d'adapter le script si la personne le veut.

## 2. L'hologramme : ce que fait la personne

Tu ne génères pas l'hologramme. C'est la personne qui le fait, sur son propre compte, après avoir vu le prix affiché.

1. **Choisir où l'hologramme prend le relais.** Par défaut, au bas de la rep qui suit la moitié de la série (`basAvant` dans `reps.json`, par exemple la 6e sur 10). C'est le `depuis` du projet.
2. **Préparer l'extrait :** `npm run extrait -- r1234.mp4 <depuis> 15` → `public/r1234-extrait.mp4`. C'est la vidéo « mouvement » à donner à l'outil (15 s maximum pour Genjutsu Lite).
3. **Préparer l'image du personnage.** Elle doit être dans une pose proche du début de l'extrait (assis, haltères à hauteur d'épaules…), sur un fond simple. L'angle de l'image donne l'angle du résultat : une image de face pour la vue de face, une image de 3/4 pour la vue de 3/4. Si la personne n'a pas d'image, propose ce prompt pour un générateur d'images, en précisant qu'il est à ajuster :
   > Hologramme anatomique bleu translucide d'une personne assise sur un banc de musculation, un haltère dans chaque main à hauteur d'épaules, muscles visibles, fond bleu de plan technique avec quadrillage, corps entier, vue de 3/4, format vertical 9:16
4. **Lancer le transfert de mouvement.** Sur Higgsfield, modèle Genjutsu Lite, en 720p : l'extrait comme mouvement, l'image comme personnage. Le 02/11/2026, ça coûtait 30 crédits par clip de 15 s. Ça peut changer : la personne vérifie le coût affiché avant de lancer.
5. **Récupérer les vidéos** dans `montage/public/` : `holo-face.mp4` (optionnel) et `holo-34.mp4`.

Ne fais jamais générer l'hologramme d'une autre personne que celle qui te parle, sauf si elle dit avoir son accord.

## 3. La voix face caméra (optionnel)

La personne se filme en disant son texte. Elle peut tout dire en une prise, et refaire une phrase ratée.

```
npm run convertir -- IMG_5678.MOV
npm run silences -- r5678.mp4            → où elle parle (public/r5678.silences.json)
```

- Garde **la dernière bonne prise de chaque phrase**. Si tu doutes du contenu d'un passage, demande-le.
- **Coupe aux vrais silences :** 0,1 s avant la parole, 0,1 à 0,2 s après. Ne coupe jamais au milieu d'un mot.
- Si elle cite un chiffre (« à peu près une seconde pour monter »), vérifie-le contre `reps.json`. S'il est faux, dis-le-lui avant le montage.

## 4. Le projet : `projets/<nom>.json`

Exemple complet : `projets/exemple.json`. Le format est décrit dans `src/projet.ts`.

- **`segments` :** les morceaux de la série jusqu'à `depuis`. Les 2 premières reps en vitesse 1 (c'est l'accroche), le reste peut être accéléré. Une vitesse différente de 1 est affichée à l'écran automatiquement.
- **`holo` :**
  - `depuis` : la même seconde que l'extrait.
  - `duree` : la durée de la vidéo générée.
  - `vitesse` : sa vitesse de lecture.
  - `bascule` : le nombre de secondes en vue de face après le scan, quand il y a les deux angles (1,6 s par défaut).
- **Avec une voix :** règle les `vitesse` pour que la phrase clé (« à partir de la 6e rep… ») tombe sur le scan, et que la dernière rep arrive juste avant la question. Le montage s'allonge tout seul jusqu'à la fin de la voix.
- **`accroche` :** 2 lignes courtes, une promesse visuelle (« ATTENDS LA 6e REP… / JE VAIS DISPARAÎTRE »). Elle reste affichée au moins 1,5 s.
- **`carte` :** les temps viennent de `reps.json`. Tu n'écris jamais de chiffre à la main.
- **`credits.apres` est obligatoire** dès qu'il y a un hologramme : il doit dire que c'est de l'IA, sur le vrai mouvement (`verifier-projet.mjs` refuse le projet sinon).

## 5. Vérifier puis rendre

```
npm run apercu -- <nom> 1 5 8 11 20      → out/apercu/*.jpg
npm run rendu -- <nom>                   → out/<nom>.mp4 (1080×1920, 60 i/s)
```

Ouvre les aperçus et vérifie :
- le squelette suit bien le corps ;
- le compteur tombe sur les reps ;
- la ligne de scan passe sur la vraie vidéo ;
- les textes ne cachent ni le visage ni la bulle.

Corrige, puis rends.

## Règles

1. **Rien d'inventé :** le nombre de reps et les temps sont mesurés. Si une mesure est fausse, on refilme ou on le dit.
2. **Annoncer l'IA :** le crédit est à l'écran, et la personne active l'étiquette IA du réseau à la publication (« Créé avec l'IA » sur Instagram).
3. **Son corps, son mouvement :** pas d'hologramme de quelqu'un d'autre sans son accord.
4. **Pas de musique de quelqu'un d'autre** dans le fichier. La personne ajoute un son de l'appli au moment de publier.
5. **Tu ne publies rien et tu ne génères rien de payant à sa place.** Tu prépares, elle décide.
