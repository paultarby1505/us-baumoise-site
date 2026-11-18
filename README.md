# US Baumoise Rugby — site officiel

Site du club de rugby US Baumoise (Baume-les-Dames, Doubs) : actualités, effectif et calendrier des matchs.

## Stack

- [Next.js](https://nextjs.org/) (App Router, TypeScript, Tailwind CSS)
- [Supabase](https://supabase.com/) pour le contenu (actualités, joueurs, matchs)
- Déployé sur [Vercel](https://vercel.com/)

## Développement local

1. `npm install`
2. Copier `.env.example` vers `.env.local` et renseigner les variables Supabase
3. `npm run dev`
4. Ouvrir http://localhost:3000

## Gestion du contenu

Le contenu est stocké dans Supabase, dans 3 tables :

- `actualites` — titre, slug, extrait, contenu, publie_le
- `joueurs` — prenom, nom, numero, poste, categorie
- `matchs` — adversaire, domicile, date_match, lieu, competition, score_us, score_adverse

S'y ajoutent notamment `classements` et `match_evenements` (feuille de match :
essais, buteurs, cartons, remplacements). Les migrations SQL sont dans
`supabase/migrations/`.

## Feuille de match et assistant IA

Dans l'admin, chaque match a un bouton **Résultat** : on y écrit (ou dicte) le
compte rendu du match, l'assistant IA remplit le score, les marqueurs, les cartons
et les changements, puis l'enregistrement met à jour le score et le classement de
la catégorie (sans jamais compter un match deux fois). Un joueur absent de
l'effectif du site est affiché avec « (OB) » après son nom.

L'assistant a besoin de la variable d'environnement `ANTHROPIC_API_KEY` (clé créée
sur https://platform.claude.com) dans les réglages Vercel. Sans elle, la feuille de
match se remplit à la main et le classement se met quand même à jour.

On peut aussi modifier les tables directement depuis le Table Editor de Supabase (https://supabase.com/dashboard).
