export type Actualite = {
  id: string;
  titre: string;
  slug: string;
  extrait: string | null;
  contenu: string;
  image_url: string | null;
  publie_le: string;
  created_at: string;
};

export type Joueur = {
  id: string;
  prenom: string;
  nom: string;
  numero: number | null;
  poste: string | null;
  categorie: string;
  photo_url: string | null;
  created_at: string;
};

export type Match = {
  id: string;
  adversaire: string | null;
  adversaire_logo_url: string | null;
  domicile: boolean;
  date_match: string;
  lieu: string | null;
  competition: string | null;
  categorie: string;
  affiche_url: string | null;
  score_us: number | null;
  score_adverse: number | null;
  nom_tournoi: string | null;
  adversaire2: string | null;
  adversaire2_logo_url: string | null;
  score_us2: number | null;
  score_adverse2: number | null;
  created_at: string;
};

export type SiteSettings = {
  id: number;
  hero_image_url: string | null;
  updated_at: string;
};

export type ActualitePhoto = {
  id: string;
  actualite_id: string;
  url: string;
  position: number;
  created_at: string;
};

export type GalleryPhoto = ActualitePhoto & {
  actualite: { titre: string; slug: string } | null;
};

export type CategoriePage = {
  categorie: string;
  header_image_url: string | null;
  header_titre: string | null;
  header_texte: string | null;
  updated_at: string;
};

export type Partenaire = {
  id: string;
  nom: string;
  slug: string;
  logo_url: string | null;
  resume: string | null;
  description: string | null;
  site_url: string | null;
  ordre: number;
  created_at: string;
};

export type Contact = {
  id: string;
  nom: string;
  prenom: string;
  email: string | null;
  telephone: string | null;
  objet: string;
  message: string;
  lu: boolean;
  created_at: string;
};

export type ClassementLigne = {
  id: string;
  categorie: string;
  equipe: string;
  logo_url: string | null;
  notre_club: boolean;
  joues: number;
  gagnes: number;
  nuls: number;
  perdus: number;
  points_marques: number;
  points_encaisses: number;
  points_classement: number;
  created_at: string;
};
