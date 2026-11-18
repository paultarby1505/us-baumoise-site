import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { EVENEMENT_TYPES, EVENEMENT_TYPE_VALUES } from "./match-evenements";
import type { Joueur, Match } from "./types";

// Agent IA de la feuille de match : à partir du compte rendu d'un match
// écrit (ou dicté) en langage courant, il retrouve le score, les
// marqueurs, les cartons et les remplacements, et relie chaque nom à un
// joueur de l'effectif du site quand c'est possible.

const EvenementSchema = z.object({
  type: z.enum(EVENEMENT_TYPE_VALUES),
  minute: z.number().int().nullable(),
  joueur_id: z.string().nullable(),
  joueur_nom: z.string().nullable(),
  joueur_sortant_id: z.string().nullable(),
  joueur_sortant_nom: z.string().nullable(),
});

const FeuilleSchema = z.object({
  score_us: z.number().int().nullable(),
  score_adverse: z.number().int().nullable(),
  evenements: z.array(EvenementSchema),
  remarques: z.string().nullable(),
});

export type FeuilleExtraite = z.infer<typeof FeuilleSchema>;

// Erreur dont le message peut être montré tel quel à l'admin.
export class FeuilleIaError extends Error {}

export function iaDisponible(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

const SYSTEM = `Tu es l'assistant du club de rugby US Baumoise. On te donne le compte rendu d'un match de l'équipe (écrit vite, souvent depuis un téléphone, parfois dicté) et tu remplis la feuille de match.

Règles :
- "score_us" = points de l'US Baumoise (ou de l'entente dont elle fait partie), "score_adverse" = points de l'adversaire. Mets null si le score n'est ni donné ni déductible.
- Ne relève que les événements de NOTRE équipe : essais, transformations, pénalités, drops, essais de pénalité, cartons jaunes, cartons rouges, remplacements. Ignore ceux de l'adversaire.
- Un joueur qui marque plusieurs fois (« Dupont x2 », « 3 transfos pour Martin ») donne un événement par action.
- Remplacement : "joueur_*" = le joueur qui ENTRE, "joueur_sortant_*" = celui qui SORT. Pour les autres types, laisse "joueur_sortant_*" à null.
- "minute" seulement si elle est indiquée, sinon null.
- Relie chaque joueur à l'effectif fourni : mets son "id" dans "joueur_id" (ou "joueur_sortant_id") uniquement si tu es sûr que c'est lui (nom, prénom, surnom évident ou numéro de maillot de la composition). En cas de doute ou s'il n'est pas dans la liste, mets null et recopie le nom tel qu'écrit dans "joueur_nom" (sans rien ajouter derrière).
- Quand le joueur est relié, mets quand même son prénom et nom dans "joueur_nom".
- "remarques" : une phrase courte sur ce qui est incertain ou incohérent (par exemple le score ne colle pas avec les points relevés), sinon null.
- N'invente rien qui n'est pas dans le compte rendu.

Barème : ${EVENEMENT_TYPES.filter((e) => e.points > 0)
  .map((e) => `${e.label.toLowerCase()} = ${e.points} pts`)
  .join(", ")}.`;

function descriptionMatch(match: Match): string {
  const lignes = [
    `Catégorie : ${match.categorie}`,
    `Adversaire : ${match.adversaire ?? match.nom_tournoi ?? "inconnu"}`,
    `Lieu : ${match.domicile ? "à domicile" : "à l'extérieur"}`,
  ];
  if (match.competition) lignes.push(`Compétition : ${match.competition}`);
  return lignes.join("\n");
}

function descriptionEffectif(
  joueurs: Joueur[],
  composition: { slot: number; joueur_id: string }[]
): string {
  const numeroDansCompo = new Map(composition.map((c) => [c.joueur_id, c.slot]));
  return joueurs
    .map((j) => {
      const compo = numeroDansCompo.get(j.id);
      const infos = [
        j.categorie,
        j.poste,
        compo ? `n°${compo} sur la feuille de ce match` : null,
      ].filter(Boolean);
      return `- id=${j.id} | ${j.prenom} ${j.nom} | ${infos.join(", ")}`;
    })
    .join("\n");
}

export async function analyserCompteRendu({
  texte,
  match,
  joueurs,
  composition,
}: {
  texte: string;
  match: Match;
  joueurs: Joueur[];
  composition: { slot: number; joueur_id: string }[];
}): Promise<FeuilleExtraite> {
  const client = new Anthropic();

  const response = await client.beta.messages.parse({
    model: "claude-opus-5-5",
    max_tokens: 16000,
    // Si le modèle principal refuse, l'API relance la même demande sur un
    // modèle de secours.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: {
      effort: "medium",
      format: betaZodOutputFormat(FeuilleSchema),
    },
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content: `<match>\n${descriptionMatch(match)}\n</match>\n\n<effectif>\n${descriptionEffectif(
          joueurs,
          composition
        )}\n</effectif>\n\n<compte_rendu>\n${texte}\n</compte_rendu>`,
      },
    ],
  });

  if (response.stop_reason === "refusal") {
    throw new FeuilleIaError("L'IA n'a pas pu analyser ce compte rendu. Remplis la feuille à la main.");
  }
  if (response.stop_reason === "max_tokens" || !response.parsed_output) {
    throw new FeuilleIaError("La réponse de l'IA est incomplète. Réessaie avec un texte plus court.");
  }

  // On ne garde que des identifiants qui existent vraiment dans l'effectif.
  const ids = new Set(joueurs.map((j) => j.id));
  const feuille = response.parsed_output;
  return {
    ...feuille,
    evenements: feuille.evenements.map((e) => ({
      ...e,
      joueur_id: e.joueur_id && ids.has(e.joueur_id) ? e.joueur_id : null,
      joueur_sortant_id:
        e.type === "remplacement" && e.joueur_sortant_id && ids.has(e.joueur_sortant_id)
          ? e.joueur_sortant_id
          : null,
      joueur_sortant_nom: e.type === "remplacement" ? e.joueur_sortant_nom : null,
    })),
  };
}
