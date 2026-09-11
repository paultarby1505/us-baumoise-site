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

On peut les modifier directement depuis le Table Editor de Supabase (https://supabase.com/dashboard).
