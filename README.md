# Holo — ta série de muscu en hologramme

**Par [jaigency](https://jaigency.vercel.app/?from=github-holo&utm_source=github&utm_medium=kit&utm_campaign=holo)** · agence de créateurs sport · Influence · UGC · Performance

Un dossier à ouvrir dans **Claude Code**. Tu filmes ta série, Claude compte tes reps et mesure ta vitesse de montée et de descente. Tu génères l'hologramme sur ta vraie série, puis Claude monte le Reel : squelette, compteur, ligne de scan, hologramme, carte de fin, et ta voix face caméra si tu veux.

C'est le kit derrière ma vidéo « Attends la 6e rep… je vais disparaître ».

## Ce qu'il te faut

- **Un Mac.** La détection du corps utilise Apple Vision, sur ton ordinateur. Sur Windows et Linux, le montage marche mais pas le compteur automatique.
- **Claude Code**, inclus dans un abonnement Claude payant (Pro ou plus) : l'app de bureau Claude, onglet **Code**, ou le terminal.
- **Node.js** version LTS, sur nodejs.org.
- **Pour l'hologramme :** un outil de transfert de mouvement. J'ai utilisé **Higgsfield, modèle Genjutsu Lite** : 30 crédits par clip de 15 s en 720p le 02/11/2026. C'est payant, sur ton compte.

## Installer (10 minutes)

1. Télécharge ce dossier : bouton vert **Code** → **Download ZIP**, puis dézippe-le.
2. Ouvre Claude → onglet **Code** → choisis le dossier dézippé (`holo-jaigency-main`).
3. Écris : **« Installe le kit »**. Accepte les autorisations. Si le Mac propose d'installer les « outils de développement », accepte aussi.

## Les prompts à donner à Claude

| Étape | Écris à Claude |
|---|---|
| Compter | « /holo — ma série est dans `montage/rushes/IMG_1234.MOV`, compte mes reps et donne-moi mes temps » |
| Préparer l'hologramme | « Prépare l'extrait à donner à Higgsfield à partir de la 6e rep, et dis-moi quelle image de personnage préparer » |
| Monter | « J'ai mis `holo-face.mp4` et `holo-34.mp4` dans `montage/public/`. Monte la vidéo : scan à la 6e rep, vue de face puis 3/4 » |
| Ta voix | « J'ai tourné ma voix dans `IMG_5678.MOV`. Garde la meilleure prise de chaque phrase et cale le montage dessus » |
| Ajuster | « Change l'accroche en … », « mets la carte plus tôt », « rends la vidéo » |

La vidéo finale arrive dans `montage/out/` (1080×1920). Ajoute ton son dans l'appli au moment de publier.

## Les 2 règles

1. **Ton corps, ton mouvement.** Pour animer la vidéo de quelqu'un d'autre, demande-lui son accord avant.
2. **Dis que c'est de l'IA.** Le crédit est déjà dans la vidéo. Active aussi « Créé avec l'IA » sur Instagram, ou son équivalent sur TikTok.

## Bon à savoir

- **Tes vidéos restent sur ton ordinateur.** Seul l'extrait que tu donnes toi-même à l'outil d'hologramme part en ligne, sur ton compte.
- **Ce qui est mesuré :** les reps et les temps. **Ce qui est généré par IA :** l'hologramme.
- **Remotion** (l'outil de montage) est gratuit pour une personne seule et les petites entreprises. Règles exactes : remotion.dev/license.
- **Aucun partenariat** avec Higgsfield, Anthropic ou Remotion.

Tu es créateur ou créatrice sport et tu veux bosser avec des marques ? → [candidater chez jaigency](https://jaigency.vercel.app/apply/creator?from=github-holo&utm_source=github&utm_medium=kit&utm_campaign=holo)
