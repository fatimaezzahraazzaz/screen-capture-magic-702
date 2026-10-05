import type { Database } from "./types";

export const SEED_VERSION = 1;

const T = {
  pa66: "p-pa66",
  metal: "p-metal",
  powder: "p-powder",
};

export function createSeed(): Database {
  return {
    users: [{ id: "u-1", email: "expert@analyse-surface.fr", name: "Expert Démo", role: "Expert analyste" }],
    projects: [
      { id: T.pa66, name: "Analyse poudre PA66", client: "Industrie Alpha", reference: "AS-2026-143", description: "Identification des phases cristallines et caractérisation morphologique d'une poudre PA66 présentant une particule contaminante.", status: "En cours", created_at: "2026-09-21T09:12:00Z", updated_at: "2026-10-04T16:40:00Z" },
      { id: T.metal, name: "Défaut de surface pièce métallique", client: "MetalTech", reference: "AS-2026-127", description: "Expertise d'un défaut de surface sur pièce usinée en acier inoxydable.", status: "Rapport généré", created_at: "2026-09-02T08:00:00Z", updated_at: "2026-09-29T11:05:00Z" },
      { id: T.powder, name: "Caractérisation poudre", client: "PowderLab", reference: "AS-2026-102", description: "Distribution granulométrique d'une poudre céramique.", status: "Validé", created_at: "2026-07-14T10:00:00Z", updated_at: "2026-08-03T14:22:00Z" },
    ],
    project_files: [
      { id: "f-1", project_id: T.pa66, filename: "commande_client.pdf", file_type: "PDF", size: "184 Ko", status: "Analysé", created_at: "2026-09-21T09:15:00Z" },
      { id: "f-2", project_id: T.pa66, filename: "resultats_granulometrie.csv", file_type: "CSV", size: "42 Ko", status: "Analysé", created_at: "2026-09-23T10:02:00Z" },
      { id: "f-3", project_id: T.pa66, filename: "spectre_DRX.asc", file_type: "ASC", size: "318 Ko", status: "Analysé", created_at: "2026-09-24T14:30:00Z" },
      { id: "f-4", project_id: T.pa66, filename: "image_MEB_01.jpg", file_type: "JPG", size: "2,4 Mo", status: "Analysé", created_at: "2026-09-25T11:00:00Z" },
      { id: "f-5", project_id: T.pa66, filename: "image_MEB_02.jpg", file_type: "JPG", size: "2,1 Mo", status: "À vérifier", note: "Échantillon associé à confirmer (ECH-002 ?)", created_at: "2026-09-25T11:04:00Z" },
      { id: "f-6", project_id: T.pa66, filename: "observations_analyste.docx", file_type: "DOCX", size: "96 Ko", status: "Information manquante", note: "Conditions de préparation non renseignées", created_at: "2026-09-28T09:20:00Z" },
      { id: "f-7", project_id: T.pa66, filename: "courbe.png", file_type: "PNG", size: "512 Ko", status: "Analysé", created_at: "2026-10-01T15:45:00Z" },
      { id: "f-8", project_id: T.metal, filename: "photo_defaut.jpg", file_type: "JPG", size: "3,1 Mo", status: "Analysé", created_at: "2026-09-03T09:00:00Z" },
      { id: "f-9", project_id: T.metal, filename: "cartographie_EDS.tri", file_type: "TRI", size: "8,2 Mo", status: "Format non pris en charge", note: "Format natif détecté. Un export CSV/TXT/Excel peut être nécessaire.", created_at: "2026-09-05T09:00:00Z" },
      { id: "f-10", project_id: T.powder, filename: "granulo_lot12.csv", file_type: "CSV", size: "38 Ko", status: "Analysé", created_at: "2026-07-15T09:00:00Z" },
    ],
    samples: [
      { id: "s-1", project_id: T.pa66, reference: "ECH-001", name: "Poudre PA66" },
      { id: "s-2", project_id: T.pa66, reference: "ECH-002", name: "Particule inconnue" },
      { id: "s-3", project_id: T.pa66, reference: "ECH-003", name: "Dépôt de surface" },
      { id: "s-4", project_id: T.metal, reference: "ECH-001", name: "Zone défaut" },
      { id: "s-5", project_id: T.powder, reference: "ECH-001", name: "Lot 12" },
    ],
    techniques: [
      { id: "t-1", project_id: T.pa66, name: "DRX" },
      { id: "t-2", project_id: T.pa66, name: "MEB/EDS" },
      { id: "t-3", project_id: T.pa66, name: "Granulométrie" },
      { id: "t-4", project_id: T.metal, name: "MEB/EDS" },
      { id: "t-5", project_id: T.metal, name: "Surface / topographie" },
      { id: "t-6", project_id: T.powder, name: "Granulométrie" },
    ],
    measurements: [
      { id: "m-1", project_id: T.pa66, sample_id: "s-1", parameter: "Dv10", value: "6,42", unit: "µm", source_file_id: "f-2", status: "contrôlé", version: 1, method: "Diffraction laser, voie sèche" },
      { id: "m-2", project_id: T.pa66, sample_id: "s-1", parameter: "Dv50", value: "18,73", unit: "µm", source_file_id: "f-2", status: "contrôlé", version: 1, method: "Diffraction laser, voie sèche" },
      { id: "m-3", project_id: T.pa66, sample_id: "s-1", parameter: "Dv90", value: "41,05", unit: "µm", source_file_id: "f-2", status: "contrôlé", version: 1, method: "Diffraction laser, voie sèche" },
      { id: "m-4", project_id: T.pa66, sample_id: "s-1", parameter: "Taux de cristallinité", value: "38", unit: "%", source_file_id: "f-3", status: "contrôlé", version: 1, method: "DRX, Cu Kα, 5–60° 2θ" },
      { id: "m-5", project_id: T.pa66, sample_id: "s-1", parameter: "Phase α (pic 20,2° 2θ)", value: "majoritaire", unit: "—", source_file_id: "f-3", status: "contrôlé", version: 1, method: "DRX, Cu Kα" },
      { id: "m-6", project_id: T.pa66, sample_id: "s-2", parameter: "Fe (EDS)", value: "12,4", unit: "% mass.", source_file_id: "f-5", status: "à confirmer", version: 1, method: "EDS 15 kV" },
      { id: "m-7", project_id: T.pa66, sample_id: "s-2", parameter: "Cr (EDS)", value: "3,1", unit: "% mass.", source_file_id: "f-5", status: "à confirmer", version: 1, method: "EDS 15 kV" },
      { id: "m-8", project_id: T.pa66, sample_id: "s-3", parameter: "C (EDS)", value: "71,8", unit: "% mass.", source_file_id: "f-4", status: "contrôlé", version: 1, method: "EDS 15 kV" },
      { id: "m-9", project_id: T.pa66, sample_id: "s-3", parameter: "O (EDS)", value: "17,6", unit: "% mass.", source_file_id: "f-4", status: "contrôlé", version: 1, method: "EDS 15 kV" },
      { id: "m-10", project_id: T.pa66, sample_id: "s-3", parameter: "N (EDS)", value: "10,6", unit: "% mass.", source_file_id: "f-4", status: "contrôlé", version: 1, method: "EDS 15 kV" },
    ],
    chat_messages: [
      { id: "c-1", project_id: T.pa66, role: "assistant", content: "Bonjour. J'ai analysé les documents disponibles pour ce projet. Que souhaitez-vous faire ?", created_at: "2026-10-04T16:30:00Z" },
      { id: "c-2", project_id: T.pa66, role: "user", content: "Quels fichiers ont été reçus pour ce projet ?", created_at: "2026-10-04T16:31:00Z" },
      { id: "c-3", project_id: T.pa66, role: "assistant", content: "7 fichiers sont disponibles : la commande client, un spectre DRX, les résultats de granulométrie, 2 images MEB, les observations de l'analyste et une courbe.\n\nLes observations ne précisent pas les conditions de préparation des échantillons.", created_at: "2026-10-04T16:31:05Z" },
      { id: "c-4", project_id: T.metal, role: "assistant", content: "Bonjour. J'ai analysé les documents disponibles pour ce projet. Que souhaitez-vous faire ?", created_at: "2026-09-03T09:10:00Z" },
      { id: "c-5", project_id: T.powder, role: "assistant", content: "Bonjour. J'ai analysé les documents disponibles pour ce projet. Que souhaitez-vous faire ?", created_at: "2026-07-15T09:10:00Z" },
    ],
    historical_experiences: [
      { id: "h-1", title: "Phases cristallines d'un polyamide 66", reference: "22-0521", material: "PA66", technique: "DRX", summary: "Analyse d'un polyamide présentant des phases cristallines similaires.", fake_similarity_score: 92, year: 2022, client_sector: "Automobile" },
      { id: "h-2", title: "Contamination de granulés renforcés", reference: "23-0187", material: "Polyamide renforcé", technique: "MEB/EDS", summary: "Identification de particules métalliques (Fe, Cr) dans un polyamide chargé verre.", fake_similarity_score: 87, year: 2023, client_sector: "Plasturgie" },
      { id: "h-3", title: "Vieillissement thermique d'un PA6", reference: "21-0832", material: "PA6", technique: "DRX + thermique", summary: "Évolution de la cristallinité après cycles thermiques, couplée DSC.", fake_similarity_score: 74, year: 2021, client_sector: "Électrique" },
      { id: "h-4", title: "Granulométrie de poudres polymères SLS", reference: "24-0311", material: "PA12", technique: "Granulométrie", summary: "Distribution granulométrique de poudres pour fabrication additive.", fake_similarity_score: 68, year: 2024, client_sector: "Fabrication additive" },
      { id: "h-5", title: "Défaut de surface sur inox 316L", reference: "23-0544", material: "Inox 316L", technique: "MEB/EDS + Surface", summary: "Piqûres de corrosion localisées, profilométrie optique.", fake_similarity_score: 61, year: 2023, client_sector: "Médical" },
      { id: "h-6", title: "Caractérisation d'une alumine", reference: "22-0098", material: "Alumine", technique: "DRX + Granulométrie", summary: "Phases α/γ et distribution granulométrique bimodale.", fake_similarity_score: 55, year: 2022, client_sector: "Céramique" },
      { id: "h-7", title: "Nanoindentation de revêtements DLC", reference: "24-0702", material: "DLC", technique: "Nanoindentation", summary: "Dureté et module de revêtements carbone amorphe.", fake_similarity_score: 41, year: 2024, client_sector: "Outillage" },
      { id: "h-8", title: "Spectroscopie IR d'un dépôt organique", reference: "21-0415", material: "Dépôt organique", technique: "Infrarouge", summary: "Identification d'un dépôt de type ester sur pièce polymère.", fake_similarity_score: 48, year: 2021, client_sector: "Cosmétique" },
    ],
    project_selected_experiences: [],
    external_sources: [
      { id: "e-1", title: "Characterization of crystalline phases in polyamide materials", publisher: "Journal of Materials Characterization", year: 2025, url: "https://example.org/demo/pa-crystalline", summary: "Étude sur l'identification des phases cristallines dans des matrices polymères.", demo: true },
      { id: "e-2", title: "SEM/EDS identification of metallic contaminants in polymer powders", publisher: "Polymer Testing Letters", year: 2024, url: "https://example.org/demo/sem-eds", summary: "Méthodologie d'identification de contaminants métalliques par MEB/EDS.", demo: true },
      { id: "e-3", title: "Laser diffraction particle sizing of thermoplastic powders", publisher: "Powder Technology Reports", year: 2023, url: "https://example.org/demo/laser-diffraction", summary: "Bonnes pratiques de mesure granulométrique par diffraction laser en voie sèche.", demo: true },
      { id: "e-4", title: "Norme de démonstration NF-DEMO 13320 — Analyse granulométrique", publisher: "Source de démonstration", year: 2020, url: "https://example.org/demo/norme", summary: "Document fictif représentant une norme technique de référence.", demo: true },
      { id: "e-5", title: "Thermal behaviour of polyamide 66 by DSC", publisher: "Thermal Analysis Review", year: 2022, url: "https://example.org/demo/dsc", summary: "Comportement thermique et polymorphisme du PA66.", demo: true },
      { id: "e-6", title: "Surface topography metrology for machined parts", publisher: "Surface Science Practice", year: 2024, url: "https://example.org/demo/topo", summary: "Mesure de rugosité et de défauts de surface.", demo: true },
    ],
    project_selected_sources: [],
    report_templates: [
      { id: "tpl-multi-drx-meb", name: "Rapport multi-techniques DRX + MEB/EDS", techniques: ["DRX", "MEB/EDS", "Granulométrie"], sections: ["Informations client", "Références des échantillons", "Méthodes", "Analyse DRX", "Analyse MEB/EDS", "Résultats", "Synthèse", "Conclusion", "Sources"] },
      { id: "tpl-drx", name: "Rapport DRX", techniques: ["DRX"], sections: ["Informations client", "Échantillons", "Méthode DRX", "Diffractogrammes", "Identification des phases", "Conclusion", "Sources"] },
      { id: "tpl-meb", name: "Rapport MEB/EDS", techniques: ["MEB/EDS"], sections: ["Informations client", "Échantillons", "Méthode MEB/EDS", "Observations", "Composition élémentaire", "Conclusion", "Sources"] },
      { id: "tpl-granulo", name: "Rapport granulométrie", techniques: ["Granulométrie"], sections: ["Informations client", "Échantillons", "Méthode", "Distribution", "Dv10 / Dv50 / Dv90", "Conclusion", "Sources"] },
      { id: "tpl-surface", name: "Rapport surface", techniques: ["Surface / topographie"], sections: ["Informations client", "Échantillons", "Méthode", "Topographie", "Rugosité", "Conclusion", "Sources"] },
      { id: "tpl-thermique", name: "Rapport analyses thermiques", techniques: ["Analyses thermiques"], sections: ["Informations client", "Échantillons", "Méthode DSC/ATG", "Thermogrammes", "Interprétation", "Conclusion", "Sources"] },
      { id: "tpl-multi", name: "Rapport multi-techniques", techniques: [], sections: ["Informations client", "Échantillons", "Méthodes", "Résultats par technique", "Synthèse", "Conclusion", "Sources"] },
    ],
    reports: [
      { id: "r-metal", project_id: T.metal, template_id: "tpl-meb", status: "Brouillon", version: 1, created_at: "2026-09-29T11:05:00Z", content: { objet: "Expertise d'un défaut de surface.", synthese: "Défaut d'origine mécanique probable.", conclusion: "Le défaut observé résulte vraisemblablement d'un arrachement lors de l'usinage.", experienceIds: ["h-5"], sourceIds: ["e-6"], fileIds: ["f-8"] } },
      { id: "r-powder", project_id: T.powder, template_id: "tpl-granulo", status: "Validé", version: 3, created_at: "2026-08-03T14:22:00Z", approved_by: "Expert Démo", approved_at: "2026-08-03T14:22:00Z", content: { objet: "Distribution granulométrique du lot 12.", synthese: "Distribution monomodale.", conclusion: "Le lot 12 est conforme à la spécification.", experienceIds: ["h-4"], sourceIds: ["e-3"], fileIds: ["f-10"] } },
    ],
    report_versions: [
      { id: "rv-1", report_id: "r-metal", version: 1, label: "Brouillon initial", created_at: "2026-09-29T11:05:00Z", content: { objet: "", synthese: "", conclusion: "Version initiale.", experienceIds: [], sourceIds: [], fileIds: [] } },
      { id: "rv-2", report_id: "r-powder", version: 1, label: "Brouillon initial", created_at: "2026-07-30T09:00:00Z", content: { objet: "", synthese: "", conclusion: "Le lot 12 semble conforme.", experienceIds: [], sourceIds: [], fileIds: [] } },
      { id: "rv-3", report_id: "r-powder", version: 2, label: "Correction de la conclusion", created_at: "2026-08-01T10:00:00Z", content: { objet: "", synthese: "", conclusion: "Le lot 12 est conforme à la spécification client.", experienceIds: [], sourceIds: [], fileIds: [] } },
      { id: "rv-4", report_id: "r-powder", version: 3, label: "Rapport validé", created_at: "2026-08-03T14:22:00Z", content: { objet: "", synthese: "", conclusion: "Le lot 12 est conforme à la spécification.", experienceIds: [], sourceIds: [], fileIds: [] } },
    ],
    project_ui: {},
    session: null,
  };
}
