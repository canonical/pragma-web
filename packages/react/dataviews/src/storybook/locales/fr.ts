/**
 * A whole French record of the DataViews messages, as an application would
 * write one: every message, with plurals and ordinals chosen by the
 * platform's French rules and numbers grouped as French groups them.
 * Story-only.
 */

import type {
  Count,
  DataViewsMessages,
  PredicateOperand,
  PredicateOperator,
  RecordNoun,
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
const choosePlural = (value: number, one: string, other: string): string =>
  PLURALS.select(value) === "one" ? one : other;

/** A position as a French masculine ordinal: 1er, 2e, 3e. */
const spellOrdinal = (value: number): string =>
  `${value}${ORDINALS.select(value) === "one" ? "er" : "e"}`;

/** A reason without the full stops it came with. */
const trimClause = (reason: string): string =>
  reason.trim().replace(/\.+$/, "");

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

/** Each operator's French words, as they read from its operands. */
type OperatorWords = Readonly<
  Record<PredicateOperator, (operands: readonly PredicateOperand[]) => string>
>;

/**
 * How each operator is worded in French, from its operands: a set's
 * operator without values names the values it takes.
 */
const OPERATORS_SPOKEN: OperatorWords = {
  isAny: (operands) =>
    operands.length === 0
      ? "est l’une des valeurs"
      : operands.length === 1
        ? "est"
        : "est l’un de",
  is: () => "est",
  isNone: (operands) =>
    operands.length === 0 ? "n’est aucune des valeurs" : "n’est aucun de",
  isNot: () => "n’est pas",
  contains: () => "contient",
  notContains: () => "ne contient pas",
  startsWith: () => "commence par",
  endsWith: () => "finit par",
  gte: () => "au moins",
  lte: () => "au plus",
  isSet: (operands) =>
    operands.at(0) === false ? "n’a pas de valeur" : "a une valeur",
};

/** What a chip shows for each operator: its symbol, or its French words. */
const OPERATORS_SHOWN: OperatorWords = {
  ...OPERATORS_SPOKEN,
  isAny: () => ":",
  is: () => ":",
  isNone: () => "≠",
  isNot: () => "≠",
  gte: () => "≥",
  lte: () => "≤",
};

/** A total as French states it: exact, or "au moins". */
const spellTotal = (
  counted: Exclude<Count, { readonly kind: "unknown" }>,
): string =>
  `${counted.kind === "at-least" ? "au moins " : ""}${count(counted.value)}`;

/** The noun after a count, in the form the noun gives for it, if any. */
const countedNoun = (value: number, noun: RecordNoun): string =>
  noun.counted?.(value) ?? choosePlural(value, noun.singular, noun.plural);

/** An outcome's sentence, then the result count where one is known. */
const outcome = (sentence: string, counted: Count, noun: RecordNoun): string =>
  counted.kind === "unknown"
    ? sentence
    : `${sentence} ${counted.kind === "at-least" ? "Au moins " : ""}${count(counted.value)} ${countedNoun(counted.value, noun)}.`;

/** Every DataViews message, in French. */
const fr: DataViewsMessages = {
  statusPending: "Chargement…",
  statusFailed: (reason) =>
    trimClause(reason) === ""
      ? "Ces lignes n’ont pas pu être chargées."
      : `Ces lignes n’ont pas pu être chargées : ${trimClause(reason)}.`,
  statusRefused: (reason) =>
    trimClause(reason) === ""
      ? "Ce lien n’a pas pu être suivi."
      : `Ce lien n’a pas pu être suivi : ${trimClause(reason)}.`,
  statusRefreshFailed: (reason) =>
    trimClause(reason) === ""
      ? "Ces lignes n’ont pas pu être actualisées."
      : `Ces lignes n’ont pas pu être actualisées : ${trimClause(reason)}.`,
  statusStale: (reason) =>
    trimClause(reason) === ""
      ? "Ces lignes ne correspondent pas à la requête actuelle."
      : `Ces lignes ne correspondent pas à la requête actuelle : ${trimClause(reason)}.`,
  statusNoAccess: "Vous n’avez pas l’autorisation de voir ces lignes.",
  statusNoResults: "Aucune ligne ne correspond à cette requête.",
  statusNoData: "Il n’y a encore rien ici.",

  selectAllRows: "Sélectionner toutes les lignes affichées",
  selectRow: (name) => `Sélectionner ${name}`,
  columnWidth: (pixels) =>
    `${count(pixels)} ${choosePlural(pixels, "pixel", "pixels")}`,
  columnEndPlacement: (name) =>
    `Cliquez ou touchez dans la ligne d’en-tête là où la colonne ${name} doit se terminer. Appuyez de nouveau sur le bord ou sur Échap pour annuler.`,

  sortPrecedence: ({ direction, position, total }) =>
    total === 1
      ? DIRECTIONS[direction]
      : `${DIRECTIONS[direction]}, ${spellOrdinal(position)} critère sur ${count(total)}`,
  sortRefused: (reasons) =>
    reasons.length === 0
      ? "Tri inchangé."
      : `Tri inchangé : ${reasons.map(trimClause).join(" ; ")}.`,
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
  columnShown: ({ name, position, total }) =>
    `${name} affichée, position ${count(position)} sur ${count(total)}`,
  columnMoved: ({ name, position, total }) =>
    `${name} déplacée en position ${count(position)} sur ${count(total)}`,
  tableSettingsReset: "Paramètres du tableau réinitialisés",

  sortPanel: "Tri",
  sortTerm: ({ name, direction }) => `${name}, ${DIRECTIONS[direction]}`,
  moveSortTermUp: "Monter",
  moveSortTermDown: "Descendre",
  removeSortTerm: "Retirer",

  filters: "Filtres",
  moreFilters: "Plus de filtres",
  submitFilters: "Appliquer les filtres",
  filterFrom: (label) => `${label} à partir de`,
  filterTo: (label) => `${label} jusqu’à`,
  filterInUnit: ({ name, symbol }) => `${name} (${symbol})`,
  filterLowest: (value) => `Minimum : ${value}`,
  filterHighest: (value) => `Maximum : ${value}`,
  clearFilter: (name) => `Effacer ${name}`,
  filterAlso: ({ phrase, values }) => `${phrase} ${values.join(", ")}`,
  linkRefusals: "Non appliqué depuis le lien",
  clauseRefused: ({ name, reason }) => `${name} : ${trimClause(reason)}.`,
  grouping: "Regroupement",
  matchAnyInstead: "Correspondre plutôt à l’une d’elles",
  matchNoneInstead: "Correspondre plutôt à aucune d’elles",
  facetCount: spellTotal,
  filterMatch: (label) => `Comment ${label} correspond`,
  presenceAny: "Tous",
  presenceSet: "A une valeur",
  presenceUnset: "N’a pas de valeur",
  filterIncomplete: (retained) =>
    retained
      ? "Saisissez une valeur pour modifier cette restriction. La restriction précédente s’applique toujours."
      : "Saisissez une valeur pour appliquer cette restriction.",
  filterRefused: ({ reasons, retained }) => {
    const refused = reasons.map((reason) => `${trimClause(reason)}.`).join(" ");
    return retained
      ? `${refused} La restriction précédente s’applique toujours.`
      : refused;
  },

  search: "Rechercher",
  submitSearch: "Rechercher",

  operatorShown: ({ operator, operands }) =>
    OPERATORS_SHOWN[operator](operands),
  operatorPhrase: ({ operator, operands, label }) => {
    const words = OPERATORS_SPOKEN[operator](operands);
    return label === undefined ? words : `${label} ${words}`;
  },

  queryBar: (noun) => `Filtrer les ${noun.plural}`,
  queryBarDescription:
    "Gauche et Droite pour passer d’un filtre à l’autre, Entrée pour modifier, Retour arrière ou Suppr pour retirer",
  queryBarPlaceholder: "Rechercher ou filtrer",
  appliedFilters: "Filtres appliqués",
  clearFiltersAndSearch: "Effacer les filtres et la recherche",
  queryCleared: ({ count: counted, noun }) =>
    outcome("Filtres et recherche effacés.", counted, noun),
  queryClause: ({ phrase, values }) =>
    values.length === 0 ? phrase : `${phrase} ${values.join(", ")}`,
  clauseBound: ({ label, bound }) =>
    `Borne ${bound === "lower" ? "inférieure" : "supérieure"} de ${label}`,
  rangeClause: ({ lower, upper }) => `${lower} et ${upper}`,
  searchClause: (text) => `Recherche de ${text}`,
  removeClause: (spoken) => `Retirer ${spoken}`,
  hiddenChips: (hidden) => `+${count(hidden)} de plus`,
  loadingSuggestions: "Chargement des suggestions",
  noSuggestions: "Aucune correspondance",
  clauseField: "Champ",
  clauseOperator: (label) => `Opérateur de ${label}`,
  clauseValue: (label) => `Valeur de ${label}`,
  recordCount: ({ count: counted, noun }) =>
    `${spellTotal(counted)} ${countedNoun(counted.value, noun)}`,
  clauseAdded: ({ clause, count: counted, noun }) =>
    outcome(`${clause} ajouté.`, counted, noun),
  clauseChanged: ({ clause, count: counted, noun }) =>
    outcome(`Remplacé par ${clause}.`, counted, noun),
  filtersDisclosure: ({ applied }) =>
    applied === 0 ? "Filtres" : `Filtres (${count(applied)})`,
  queryContradiction: ({ label }) =>
    `Les filtres ${label} ne peuvent pas tous être vrais : rien ne correspond.`,
  mergeClauses: ({ label }) => `Fusionner les filtres ${label}`,
  clausesMerged: ({ label, count: counted, noun }) =>
    outcome(`Filtres ${label} fusionnés.`, counted, noun),
  clauseRemoved: ({ clause, count: counted, noun }) =>
    outcome(`${clause} retiré.`, counted, noun),
  readAsAtLeast: "Lu comme au moins",
  readAsAtMost: "Lu comme au plus",
  valuePicked: (spoken) => `${spoken}. Entrée à nouveau pour l’appliquer.`,
  multipleValuesHint:
    "Entrée ajoute une valeur ; Entrée à nouveau les applique",
  dateFormat: "Date, au format YYYY-MM-DD",
  numberFormat: (units) =>
    units.length === 0 ? "Nombre" : `Nombre, en ${units.join(" ou ")}`,
  clauseInvalid: (reason) => `Non valide : ${trimClause(reason)}`,
  decimalSeparator: ",",

  filtersApplied: ({ applied }) =>
    `${count(applied)} ${choosePlural(applied, "appliqué", "appliqués")}`,
  searchEntry: ({ noun }) => `Rechercher des ${noun.plural}`,
  searchEntryPlaceholder: "Rechercher",
  filterSheet: ({ noun }) => `Filtrer les ${noun.plural}`,
  closeFilters: "Fermer les filtres",
  addFilter: "Ajouter un filtre",
  chooseField: "Choisir un champ",
  chooseOperator: ({ label }) => `Choisir un opérateur pour ${label}`,
  chooseValue: ({ label }) => `Choisir une valeur pour ${label}`,
  addClause: "Ajouter",
  goBack: "Retour",
  clearAllFilters: "Tout effacer",
  filtersCleared: ({ count: counted, noun }) =>
    outcome("Filtres effacés.", counted, noun),
  resultsUpdated: ({ count: counted, noun }) =>
    outcome("Résultats mis à jour.", counted, noun),
  showResults: ({ count: counted }) => {
    if (counted.kind === "unknown") return "Afficher les résultats";
    if (counted.kind === "at-least") {
      return `Afficher ${count(counted.value)}+ résultats`;
    }
    return `Afficher ${count(counted.value)} ${choosePlural(counted.value, "résultat", "résultats")}`;
  },
  filterStepChosen: ({ chosen, step }) => `${chosen} choisi. ${step}.`,

  appliedCount: ({ count: applied, condition }) =>
    condition === "exclusion"
      ? `aucun des ${count(applied)}`
      : `${count(applied)} ${choosePlural(applied, "appliqué", "appliqués")}`,
  allOptions: "Tous",
  searchOptions: ({ label }) => `Rechercher parmi les options de ${label}`,
  optionsNone: "Aucune option",
  optionsPending: "Chargement des options",
  optionExcluded: ({ value }) => `${value}, exclu`,
  optionsShown: ({ count: shown }) =>
    `${count(shown)} ${choosePlural(shown, "option", "options")}`,
  submitQuickFilter: "Appliquer",

  pagination: "Pagination",
  rowsPerPage: "Lignes par page",
  submitPageSize: "Appliquer la taille de page",
  rowsShown: ({ first, shown, total: counted }) => {
    const range =
      shown === 0 ? "0" : `${count(first)}–${count(first + shown - 1)}`;
    if (counted.kind === "unknown") {
      return shown === 1
        ? `Ligne ${count(first)} affichée`
        : `Lignes ${range} affichées`;
    }
    return shown === 1
      ? `Ligne ${count(first)} sur ${spellTotal(counted)}`
      : `Lignes ${range} sur ${spellTotal(counted)}`;
  },
  page: "Page",
  pageCount: (pages) =>
    `sur ${count(pages)} ${choosePlural(pages, "page", "pages")}`,
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
    `Les vues enregistrées sont indisponibles : ${trimClause(reason)}.`,
  viewsUnreadable: (views) =>
    `${count(views)} ${choosePlural(views, "vue enregistrée est illisible", "vues enregistrées sont illisibles")}.`,
  arrangementUnsaved: (reason) =>
    `La disposition n’est pas enregistrée : ${trimClause(reason)}.`,
  viewNameRefused: (reason) => `${trimClause(reason)}.`,
  viewPending: (command) => PENDING[command],
  viewOpened: (name) => `« ${name} » ouverte.`,
  viewSaved: (name) => `« ${name} » enregistrée.`,
  viewRenamed: (name) => `Renommée en « ${name} ».`,
  viewDeleted: "Vue supprimée.",
  viewRefused: ({ name, reasons }) =>
    `Non ouverte : « ${name} » demande ce que cette collection ne peut pas afficher — ${reasons
      .map(trimClause)
      .join(" ; ")}. La requête est inchangée.`,
  viewConflicted: ({ command, name }) =>
    command === "save-as"
      ? "Non enregistrée : une autre vue est stockée sous la même identité. Réessayez."
      : `${NOT_DONE[command]} : « ${name} » a été modifiée ailleurs.`,
  viewMissing: (command) => `${NOT_DONE[command]} : la vue n’existe plus.`,
  viewUnreadable: ({ command, reason }) =>
    `${NOT_DONE[command]} : la vue stockée est illisible (${trimClause(reason)}).`,
  viewFailed: ({ command, reason }) =>
    `${NOT_DONE[command]} : ${trimClause(reason)}.`,

  selectionActions: "Actions sur la sélection",
  rowsSelected: (rows) =>
    `${count(rows)} ${choosePlural(rows, "sélectionnée", "sélectionnées")}`,
  deselectRows: (rows) =>
    `Désélectionner ${count(rows)} ${choosePlural(rows, "ligne", "lignes")}`,

  facetCountsAbsent: "La source n’a fourni aucun décompte pour ce champ.",
  facetRangeAbsent: "La source n’a fourni aucune plage pour ce champ.",
  facetValuesNone: "Aucun enregistrement correspondant n’a de valeur.",
  barChartSummary: (label) =>
    `${label} : un diagramme en barres du nombre d’enregistrements par valeur`,
  rangeChartSummary: ({ label, min, max }) =>
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

/** The record, frozen: a story cannot change it for the next. */
export default Object.freeze(fr);
