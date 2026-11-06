/**
 * A whole French record of the DataViews messages, as an application would
 * write one: every message, with plurals and ordinals chosen by the
 * platform's French rules and numbers grouped as French groups them.
 * Story-only.
 */

import type {
  Count,
  DataViewsMessages,
  SortDirection,
  ViewCommand,
} from "@canonical/dataviews-core";

/** French plural categories: 0 and 1 take the singular. */
const PLURALS = new Intl.PluralRules("fr");

/** French ordinal categories: 1 is "1er", every other is "2e", "3e". */
const ORDINALS = new Intl.PluralRules("fr", { type: "ordinal" });

/** French number grouping: 12 345 with a narrow space. */
const NUMBERS = new Intl.NumberFormat("fr");

/** A count as French writes it. */
const count = (value: number): string => NUMBERS.format(value);

/** The singular or the plural form, as French chooses it for `value`. */
const plural = (value: number, one: string, other: string): string =>
  PLURALS.select(value) === "one" ? one : other;

/** A position as a French masculine ordinal: 1er, 2e, 3e. */
const ordinal = (value: number): string =>
  `${value}${ORDINALS.select(value) === "one" ? "er" : "e"}`;

/** A reason without the full stops it came with. */
const clause = (reason: string): string => reason.trim().replace(/\.+$/, "");

const DIRECTIONS: Readonly<Record<SortDirection, string>> = {
  asc: "croissant",
  desc: "décroissant",
};

const NOT_DONE: Readonly<Record<ViewCommand, string>> = {
  open: "Non ouverte",
  save: "Non enregistrée",
  "save-as": "Non enregistrée",
  rename: "Non renommée",
  remove: "Non supprimée",
};

const PENDING: Readonly<Record<ViewCommand, string>> = {
  open: "Ouverture de la vue…",
  save: "Enregistrement…",
  "save-as": "Enregistrement…",
  rename: "Renommage…",
  remove: "Suppression…",
};

/** A total as French states it: exact, or "au moins". */
const total = (counted: Exclude<Count, { readonly kind: "unknown" }>): string =>
  `${counted.kind === "at-least" ? "au moins " : ""}${count(counted.value)}`;

/** Every DataViews message, in French. */
export const FRENCH: DataViewsMessages = {
  statusPending: "Chargement…",
  statusRegrouping: "Regroupement…",
  statusFailed: (reason) =>
    `Ces lignes n’ont pas pu être chargées : ${clause(reason)}`,
  statusRefreshFailed: (reason) =>
    `Ces lignes n’ont pas pu être actualisées : ${clause(reason)}`,
  statusStale: (reason) =>
    `Ces lignes ne correspondent pas à la requête actuelle : ${clause(reason)}`,
  statusNoResults: "Aucune ligne ne correspond à cette requête.",
  statusNoData: "Il n’y a encore rien ici.",

  selectAllRows: "Sélectionner toutes les lignes affichées",
  selectRow: (name) => `Sélectionner ${name}`,
  columnWidth: (pixels) =>
    `${count(pixels)} ${plural(pixels, "pixel", "pixels")}`,
  columnEndPlacement: (name) =>
    `Cliquez ou touchez dans la ligne d’en-tête là où la colonne ${name} doit se terminer. Appuyez de nouveau sur le bord ou sur Échap pour annuler.`,

  sortPrecedence: (direction, position, terms) =>
    terms === 1
      ? DIRECTIONS[direction]
      : `${DIRECTIONS[direction]}, ${ordinal(position)} critère sur ${count(terms)}`,
  sortRefused: (reasons) =>
    reasons.length === 0
      ? "Tri inchangé."
      : `Tri inchangé : ${reasons.map(clause).join(" ; ")}.`,
  sortApplied: (terms) =>
    `Trié par ${terms
      .map(({ name, direction }) => `${name}, ${DIRECTIONS[direction]}`)
      .join(" ; puis ")}.`,
  sortDefaulted: (terms) =>
    `Trié selon l’ordre de la source : ${terms
      .map(({ name, direction }) => `${name}, ${DIRECTIONS[direction]}`)
      .join(" ; ")}.`,
  sortAbsent: "Non trié : la source ne documente aucun ordre.",

  columnOptions: (name) => `Options de la colonne ${name}`,
  sortAscending: "Trier par ordre croissant",
  sortDescending: "Trier par ordre décroissant",
  removeFromSort: "Retirer du tri",
  hideColumn: "Masquer la colonne",
  moveColumnLeft: "Déplacer la colonne vers la gauche",
  moveColumnRight: "Déplacer la colonne vers la droite",

  tableSettings: "Paramètres du tableau",
  hideNamedColumn: (name) => `Masquer ${name}`,
  showNamedColumn: (name) => `Afficher ${name}`,
  moveNamedColumnLeft: (name) => `Déplacer ${name} vers la gauche`,
  moveNamedColumnRight: (name) => `Déplacer ${name} vers la droite`,
  columnAlwaysShown: (name) => `${name} est toujours affichée`,
  resetTableSettings: "Réinitialiser les paramètres du tableau",

  columnHidden: (name) => `${name} masquée`,
  columnShown: (name, position, shown) =>
    `${name} affichée, position ${count(position)} sur ${count(shown)}`,
  columnMoved: (name, position, shown) =>
    `${name} déplacée en position ${count(position)} sur ${count(shown)}`,
  tableSettingsReset: "Paramètres du tableau réinitialisés",

  sortPanel: "Tri",
  sortTerm: (name, direction) => `${name}, ${DIRECTIONS[direction]}`,
  moveSortTermUp: "Monter",
  moveSortTermDown: "Descendre",
  removeSortTerm: "Retirer",

  filters: "Filtres",
  moreFilters: "Plus de filtres",
  submitFilters: "Appliquer les filtres",
  filterFrom: (label) => `${label} à partir de`,
  filterTo: (label) => `${label} jusqu’à`,
  filterLowest: (value) => `Minimum : ${value}`,
  filterHighest: (value) => `Maximum : ${value}`,
  clearFilter: (name) => `Effacer ${name}`,
  filterIsAnyOf: (label) => `${label} est l’une des valeurs`,
  filterIsNoneOf: (label) => `${label} n’est aucune des valeurs`,
  matchAnyInstead: "Correspondre plutôt à l’une d’elles",
  matchNoneInstead: "Correspondre plutôt à aucune d’elles",
  facetCount: total,
  filterContains: (label) => `${label} contient`,
  filterStartsWith: (label) => `${label} commence par`,
  filterIncomplete: (retained) =>
    retained
      ? "Saisissez une valeur pour modifier cette restriction. La restriction précédente s’applique toujours."
      : "Saisissez une valeur pour appliquer cette restriction.",
  filterRefused: (reasons, retained) => {
    const refused = reasons.map((reason) => `${clause(reason)}.`).join(" ");
    return retained
      ? `${refused} La restriction précédente s’applique toujours.`
      : refused;
  },

  search: "Rechercher",
  submitSearch: "Rechercher",

  pagination: "Pagination",
  rowsPerPage: "Lignes par page",
  submitPageSize: "Appliquer la taille de page",
  rowsShown: (first, shown, counted) => {
    const range =
      shown === 0 ? "0" : `${count(first)}–${count(first + shown - 1)}`;
    if (counted.kind === "unknown") {
      return shown === 1
        ? `Ligne ${count(first)} affichée`
        : `Lignes ${range} affichées`;
    }
    return shown === 1
      ? `Ligne ${count(first)} sur ${total(counted)}`
      : `Lignes ${range} sur ${total(counted)}`;
  },
  page: "Page",
  pageCount: (pages) => `sur ${count(pages)} ${plural(pages, "page", "pages")}`,
  submitPage: "Aller à la page",
  goToFirstPage: "Première page",
  goToPreviousPage: "Page précédente",
  goToNextPage: "Page suivante",
  goToLastPage: "Dernière page",

  savedViews: "Vues enregistrées",
  viewsUnscripted:
    "Les vues enregistrées nécessitent JavaScript. Un lien vers une requête fonctionne toujours.",
  view: "Vue",
  viewNone: "Aucune vue enregistrée",
  viewModified: "Modifiée",
  saveView: "Enregistrer",
  overwriteView: "Écraser",
  revertView: "Rétablir",
  discardViewChanges: "Abandonner les modifications",
  saveViewAs: "Enregistrer sous…",
  renameView: "Renommer…",
  deleteView: "Supprimer…",
  retryViews: "Réessayer",
  saveAsForm: "Enregistrer comme nouvelle vue",
  submitSaveAs: "Enregistrer la vue",
  renameForm: (name) => `Renommer « ${name} »`,
  submitRename: "Renommer",
  viewName: "Nom",
  cancel: "Annuler",
  deleteForm: (name) => `Supprimer « ${name} » ? Cette action est définitive.`,
  submitDelete: "Supprimer la vue",
  viewsPending: "Chargement des vues enregistrées…",
  viewsUnavailable: (reason) =>
    `Les vues enregistrées sont indisponibles : ${clause(reason)}.`,
  viewsUnreadable: (views) =>
    `${count(views)} ${plural(views, "vue enregistrée est illisible", "vues enregistrées sont illisibles")}.`,
  arrangementUnsaved: (reason) =>
    `La disposition n’est pas enregistrée : ${clause(reason)}.`,
  viewNameRefused: (reason) => `${clause(reason)}.`,
  viewPending: (command) => PENDING[command],
  viewOpened: (name) => `« ${name} » ouverte.`,
  viewSaved: (name) => `« ${name} » enregistrée.`,
  viewRenamed: (name) => `Renommée en « ${name} ».`,
  viewDeleted: "Vue supprimée.",
  viewRefused: (name, reasons) =>
    `Non ouverte : « ${name} » demande ce que cette collection ne peut pas afficher — ${reasons
      .map(clause)
      .join(" ; ")}. La requête est inchangée.`,
  viewConflicted: (command, name) =>
    command === "save-as"
      ? "Non enregistrée : une autre vue est stockée sous la même identité. Réessayez."
      : `${NOT_DONE[command]} : « ${name} » a été modifiée ailleurs.`,
  viewMissing: (command) => `${NOT_DONE[command]} : la vue n’existe plus.`,
  viewUnreadable: (command, reason) =>
    `${NOT_DONE[command]} : la vue stockée est illisible (${clause(reason)}).`,
  viewFailed: (command, reason) => `${NOT_DONE[command]} : ${clause(reason)}.`,

  selectionActions: "Actions sur la sélection",
  rowsSelected: (rows) =>
    `${count(rows)} ${plural(rows, "sélectionnée", "sélectionnées")}`,
  deselectRows: (rows) =>
    `Désélectionner ${count(rows)} ${plural(rows, "ligne", "lignes")}`,

  facetCountsAbsent: "La source n’a fourni aucun décompte pour ce champ.",
  facetRangeAbsent: "La source n’a fourni aucune plage pour ce champ.",
  facetValuesNone: "Aucun enregistrement correspondant n’a de valeur.",
  barChartSummary: (label) =>
    `${label} : un diagramme en barres du nombre d’enregistrements par valeur`,
  rangeChartSummary: (label, min, max) =>
    `${label} : une plage de ${count(min)} à ${count(max)}`,
  chartTable: (label) => `${label}, sous forme de tableau`,
  chartValue: "Valeur",
  chartCount: "Nombre",
  countUnknown: "Non compté",
  chartLowest: "Minimum",
  chartHighest: "Maximum",

  renderer: "Afficher en",

  chartRenderer: "Graphique",
  tableRenderer: "Tableau",
};
