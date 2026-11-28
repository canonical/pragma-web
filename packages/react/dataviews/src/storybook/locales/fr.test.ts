import { resolveMessages } from "@canonical/dataviews-core/bindings";
import { describe, expect, it } from "vitest";
import fr from "./fr.js";

describe("fr", () => {
  it("records every message English does", () => {
    expect(Object.keys(fr).sort()).toEqual(
      Object.keys(resolveMessages()).sort(),
    );
  });

  it("ends each status with a full stop, and a blank reason plainly", () => {
    expect(fr.statusFailed("timeout.")).toBe(
      "Ces lignes n’ont pas pu être chargées : timeout.",
    );
    expect(fr.statusFailed(" . ")).toBe(
      "Ces lignes n’ont pas pu être chargées.",
    );
    expect(fr.statusRefreshFailed("timeout")).toBe(
      "Ces lignes n’ont pas pu être actualisées : timeout.",
    );
    expect(fr.statusRefreshFailed("")).toBe(
      "Ces lignes n’ont pas pu être actualisées.",
    );
    expect(fr.statusStale("moved")).toBe(
      "Ces lignes ne correspondent pas à la requête actuelle : moved.",
    );
    expect(fr.statusStale(" ")).toBe(
      "Ces lignes ne correspondent pas à la requête actuelle.",
    );
  });

  it("refuses a link with or without a reason", () => {
    expect(fr.statusRefused(" . ")).toBe("Ce lien n’a pas pu être suivi.");
    expect(fr.statusRefused("bad page.")).toBe(
      "Ce lien n’a pas pu être suivi : bad page.",
    );
  });

  it("groups numbers and chooses plurals as French does", () => {
    expect(fr.columnWidth(1)).toBe("1 pixel");
    expect(fr.columnWidth(0)).toBe("0 pixel");
    expect(fr.columnWidth(12345)).toBe("12 345 pixels");
    expect(fr.pageCount(1)).toBe("sur 1 page");
    expect(fr.pageCount(3)).toBe("sur 3 pages");
    expect(fr.rowsSelected(1)).toBe("1 sélectionnée");
    expect(fr.rowsSelected(2)).toBe("2 sélectionnées");
    expect(fr.clearSelection(1)).toBe("Désélectionner 1 ligne");
    expect(fr.clearSelection(2)).toBe("Désélectionner 2 lignes");
    expect(fr.viewsUnreadable(1)).toBe("1 vue enregistrée est illisible.");
    expect(fr.viewsUnreadable(2)).toBe("2 vues enregistrées sont illisibles.");
  });

  it("states sort precedence with French ordinals", () => {
    expect(fr.sortPrecedence({ direction: "asc", position: 1, total: 1 })).toBe(
      "croissant",
    );
    expect(
      fr.sortPrecedence({ direction: "desc", position: 1, total: 2 }),
    ).toBe("décroissant, 1er critère sur 2");
    expect(fr.sortPrecedence({ direction: "asc", position: 2, total: 2 })).toBe(
      "croissant, 2e critère sur 2",
    );
  });

  it("states sort outcomes", () => {
    expect(fr.sortRefused([])).toBe("Tri inchangé.");
    expect(fr.sortRefused(["a.", "b"])).toBe("Tri inchangé : a ; b.");
    expect(fr.sortApplied(["Nom, croissant", "Cœurs, décroissant"])).toBe(
      "Trié par Nom, croissant ; puis Cœurs, décroissant.",
    );
    expect(fr.sortDefaulted(["Nom, croissant"])).toBe(
      "Trié selon l’ordre de la source : Nom, croissant.",
    );
    expect(fr.sortTerm({ name: "Nom", direction: "desc" })).toBe(
      "Nom, décroissant",
    );
  });

  it("names columns and their moves", () => {
    expect(fr.selectRow("alpha")).toBe("Sélectionner alpha");
    expect(fr.columnEndPlacement("Nom")).toContain("la colonne Nom doit");
    expect(fr.columnOptions("Nom")).toBe("Options de la colonne Nom");
    expect(fr.hideNamedColumn("Nom")).toBe("Masquer Nom");
    expect(fr.showNamedColumn("Nom")).toBe("Afficher Nom");
    expect(fr.moveNamedColumnLeft("Nom")).toBe("Déplacer Nom vers la gauche");
    expect(fr.moveNamedColumnRight("Nom")).toBe("Déplacer Nom vers la droite");
    expect(fr.columnAlwaysShown("Nom")).toBe("Nom est toujours affichée");
    expect(fr.columnHidden("Nom")).toBe("Nom masquée");
    expect(fr.columnShown({ name: "Nom", position: 2, total: 5 })).toBe(
      "Nom affichée, position 2 sur 5",
    );
    expect(fr.columnMoved({ name: "Nom", position: 1, total: 5 })).toBe(
      "Nom déplacée en position 1 sur 5",
    );
  });

  it("names filters", () => {
    expect(fr.filterFrom("Cœurs")).toBe("Cœurs à partir de");
    expect(fr.filterTo("Cœurs")).toBe("Cœurs jusqu’à");
    expect(fr.filterLowest("1")).toBe("Minimum : 1");
    expect(fr.filterHighest("8")).toBe("Maximum : 8");
    expect(fr.clearFilter("Statut")).toBe("Effacer Statut");
    expect(
      fr.filterAlso({ phrase: "Cœurs à partir de", values: ["4", "8"] }),
    ).toBe("Cœurs à partir de 4, 8");
    expect(fr.clauseRefused({ name: "Statut", reason: "inconnu." })).toBe(
      "Statut : inconnu.",
    );
    const phrase = (
      operator: Parameters<typeof fr.operatorPhrase>[0]["operator"],
      operands: readonly (string | boolean)[] = [],
    ) => fr.operatorPhrase({ operator, operands, label: "Nom" });
    expect(phrase("isAny")).toBe("Nom est l’une des valeurs");
    expect(phrase("isNone")).toBe("Nom n’est aucune des valeurs");
    expect(phrase("contains")).toBe("Nom contient");
    expect(phrase("startsWith")).toBe("Nom commence par");
    expect(phrase("endsWith")).toBe("Nom finit par");
    expect(phrase("notContains")).toBe("Nom ne contient pas");
    expect(phrase("isNot")).toBe("Nom n’est pas");
    expect(phrase("is")).toBe("Nom est");
    expect(fr.filterMatch("Nom")).toBe("Comment Nom correspond");
    expect(
      fr.filterInUnit({ name: "Mémoire à partir de", symbol: "Mio" }),
    ).toBe("Mémoire à partir de (Mio)");
    expect(phrase("isSet", [true])).toBe("Nom a une valeur");
    expect(phrase("isSet", [false])).toBe("Nom n’a pas de valeur");
  });

  it("states a count exactly or at least", () => {
    expect(fr.facetCount({ kind: "exact", value: 4 })).toBe("4");
    expect(fr.facetCount({ kind: "at-least", value: 1200 })).toBe(
      "au moins 1 200",
    );
  });

  it("states filter feedback with or without a retained restriction", () => {
    expect(fr.filterIncomplete(true)).toContain(
      "La restriction précédente s’applique toujours.",
    );
    expect(fr.filterIncomplete(false)).toBe(
      "Saisissez une valeur pour appliquer cette restriction.",
    );
    expect(
      fr.filterRefused({ reasons: ["trop grand", "négatif."], retained: true }),
    ).toBe(
      "trop grand. négatif. La restriction précédente s’applique toujours.",
    );
    expect(fr.filterRefused({ reasons: ["trop grand"], retained: false })).toBe(
      "trop grand.",
    );
  });

  it("states the rows shown, counted or not", () => {
    expect(
      fr.rowsShown({ first: 1, shown: 0, total: { kind: "unknown" } }),
    ).toBe("Lignes 0 affichées");
    expect(
      fr.rowsShown({ first: 3, shown: 1, total: { kind: "unknown" } }),
    ).toBe("Ligne 3 affichée");
    expect(
      fr.rowsShown({ first: 1, shown: 10, total: { kind: "unknown" } }),
    ).toBe("Lignes 1–10 affichées");
    expect(
      fr.rowsShown({ first: 3, shown: 1, total: { kind: "exact", value: 3 } }),
    ).toBe("Ligne 3 sur 3");
    expect(
      fr.rowsShown({
        first: 1,
        shown: 10,
        total: { kind: "at-least", value: 50 },
      }),
    ).toBe("Lignes 1–10 sur au moins 50");
  });

  it("states saved-view outcomes", () => {
    expect(fr.renameForm("Pannes")).toBe("Renommer « Pannes »");
    expect(fr.deleteForm("Pannes")).toBe(
      "Supprimer « Pannes » ? Cette action est définitive.",
    );
    expect(fr.viewsUnavailable("hors ligne.")).toBe(
      "Les vues enregistrées sont indisponibles : hors ligne.",
    );
    expect(fr.presentationUnsaved("plein")).toBe(
      "La disposition n’est pas enregistrée : plein.",
    );
    expect(fr.viewNameRefused("déjà pris")).toBe("déjà pris.");
    expect(fr.viewPending("rename")).toBe("Renommage…");
    expect(fr.viewOpened("Pannes")).toBe("« Pannes » ouverte.");
    expect(fr.viewSaved("Pannes")).toBe("« Pannes » enregistrée.");
    expect(fr.viewRenamed("Pannes")).toBe("Renommée en « Pannes ».");
    expect(fr.viewRefused({ name: "Pannes", reasons: ["a.", "b"] })).toBe(
      "Non ouverte : « Pannes » demande ce que cette collection ne peut pas afficher — a ; b. La requête est inchangée.",
    );
    expect(fr.viewConflicted({ command: "save-as", name: "Pannes" })).toBe(
      "Non enregistrée : une autre vue est stockée sous la même identité. Réessayez.",
    );
    expect(fr.viewConflicted({ command: "remove", name: "Pannes" })).toBe(
      "Non supprimée : « Pannes » a été modifiée ailleurs.",
    );
    expect(fr.viewMissing("open")).toBe("Non ouverte : la vue n’existe plus.");
    expect(fr.viewUnreadable({ command: "save", reason: "JSON." })).toBe(
      "Non enregistrée : la vue stockée est illisible (JSON).",
    );
    expect(fr.viewFailed({ command: "rename", reason: "quota" })).toBe(
      "Non renommée : quota.",
    );
  });

  it("states a chart's own status", () => {
    expect(fr.chartPending).toBe("Chargement…");
    expect(fr.chartFailed({ reason: "hors ligne." })).toBe(
      "Ce graphique n’a pas pu être chargé : hors ligne.",
    );
    expect(fr.chartFailed({ reason: "" })).toBe(
      "Ce graphique n’a pas pu être chargé.",
    );
    expect(fr.chartRefreshFailed({ reason: "hors ligne" })).toBe(
      "Ce graphique n’a pas pu être actualisé : hors ligne.",
    );
    expect(fr.chartRefreshFailed({ reason: " . " })).toBe(
      "Ce graphique n’a pas pu être actualisé.",
    );
  });

  it("summarises charts", () => {
    expect(fr.barChartSummary("Statut")).toBe(
      "Statut : un diagramme en barres du nombre d’enregistrements par valeur",
    );
    expect(fr.rangeChartSummary({ label: "Cœurs", min: 1, max: 64 })).toBe(
      "Cœurs : une plage de 1 à 64",
    );
    expect(fr.chartTable("Statut")).toBe("Statut, sous forme de tableau");
  });
  it("words operators, shown and spoken, from their operands", () => {
    expect(fr.operatorShown({ operator: "isAny", operands: ["prêt"] })).toBe(
      ":",
    );
    expect(fr.operatorShown({ operator: "is", operands: ["web"] })).toBe(":");
    expect(fr.operatorShown({ operator: "isNone", operands: ["prêt"] })).toBe(
      "≠",
    );
    expect(fr.operatorShown({ operator: "isNot", operands: ["web"] })).toBe(
      "≠",
    );
    expect(fr.operatorShown({ operator: "gte", operands: [1] })).toBe("≥");
    expect(fr.operatorShown({ operator: "lte", operands: [1] })).toBe("≤");
    expect(fr.operatorShown({ operator: "contains", operands: ["web"] })).toBe(
      "contient",
    );
    expect(fr.operatorPhrase({ operator: "isAny", operands: ["prêt"] })).toBe(
      "est",
    );
    expect(
      fr.operatorPhrase({ operator: "isAny", operands: ["prêt", "échoué"] }),
    ).toBe("est l’un de");
    expect(fr.operatorPhrase({ operator: "isNone", operands: ["prêt"] })).toBe(
      "n’est aucun de",
    );
    expect(fr.operatorPhrase({ operator: "gte", operands: [1] })).toBe(
      "au moins",
    );
    expect(fr.operatorPhrase({ operator: "lte", operands: [1] })).toBe(
      "au plus",
    );
  });

  it("words the query bar, its clauses and what its commits did", () => {
    const noun = { singular: "machine", plural: "machines" };
    expect(fr.queryBar(noun)).toBe("Filtrer les machines");
    expect(fr.queryCleared({ count: { kind: "exact", value: 2 }, noun })).toBe(
      "Filtres et recherche effacés. 2 machines.",
    );
    expect(fr.queryCleared({ count: { kind: "unknown" }, noun })).toBe(
      "Filtres et recherche effacés.",
    );
    expect(fr.queryClause({ phrase: "Statut est", values: [] })).toBe(
      "Statut est",
    );
    expect(fr.queryClause({ phrase: "Statut est", values: ["a", "b"] })).toBe(
      "Statut est a, b",
    );
    expect(fr.searchClause("web")).toBe("Recherche de web");
    expect(fr.removeClause("Statut est prêt")).toBe("Retirer Statut est prêt");
    expect(fr.hiddenChips(3)).toBe("+3 de plus");
    expect(fr.clauseOperator("Statut")).toBe("Opérateur de Statut");
    expect(fr.clauseValue("Statut")).toBe("Valeur de Statut");
    expect(fr.recordCount({ count: { kind: "exact", value: 1 }, noun })).toBe(
      "1 machine",
    );
    expect(
      fr.recordCount({
        count: { kind: "at-least", value: 3 },
        noun: { ...noun, counted: (n) => `machine×${n}` },
      }),
    ).toBe("au moins 3 machine×3");
    expect(
      fr.clauseAdded({
        clause: "Statut est prêt",
        count: { kind: "at-least", value: 5 },
        noun,
      }),
    ).toBe("Statut est prêt ajouté. Au moins 5 machines.");
    expect(
      fr.clauseChanged({
        clause: "Statut est prêt",
        count: { kind: "unknown" },
        noun,
      }),
    ).toBe("Remplacé par Statut est prêt.");
    expect(
      fr.clauseRemoved({
        clause: "Statut est prêt",
        count: { kind: "unknown" },
        noun,
      }),
    ).toBe("Statut est prêt retiré.");
    expect(fr.valuePicked("Statut est prêt")).toBe(
      "Statut est prêt. Entrée à nouveau pour l’appliquer.",
    );
    expect(fr.numberFormat([])).toBe("Nombre");
    expect(fr.numberFormat(["Mio", "Gio"])).toBe("Nombre, en Mio ou Gio");
    expect(fr.clauseInvalid("pas un nombre.")).toBe(
      "Non valide : pas un nombre",
    );
  });
  it("words the query bar's ranges, clashes and disclosure", () => {
    const noun = { singular: "machine", plural: "machines" };
    expect(fr.clauseBound({ label: "Cœurs", bound: "lower" })).toBe(
      "Borne inférieure de Cœurs",
    );
    expect(fr.clauseBound({ label: "Cœurs", bound: "upper" })).toBe(
      "Borne supérieure de Cœurs",
    );
    expect(fr.rangeClause({ lower: "au moins 2", upper: "au plus 8" })).toBe(
      "au moins 2 et au plus 8",
    );
    expect(fr.filtersDisclosure({ applied: 0 })).toBe("Filtres");
    expect(fr.filtersDisclosure({ applied: 2 })).toBe("Filtres (2)");
    expect(fr.queryContradiction({ label: "Cœurs" })).toBe(
      "Les filtres Cœurs ne peuvent pas tous être vrais : rien ne correspond.",
    );
    expect(fr.mergeClauses({ label: "Cœurs" })).toBe(
      "Fusionner les filtres Cœurs",
    );
    expect(
      fr.clausesMerged({
        label: "Cœurs",
        count: { kind: "exact", value: 3 },
        noun,
      }),
    ).toBe("Filtres Cœurs fusionnés. 3 machines.");
  });
  it("words the query bar's narrow form and its sheet", () => {
    const noun = { singular: "machine", plural: "machines" };
    expect(fr.filtersApplied({ applied: 1 })).toBe("1 appliqué");
    expect(fr.filtersApplied({ applied: 2 })).toBe("2 appliqués");
    expect(fr.searchEntry({ noun })).toBe("Rechercher des machines");
    expect(fr.filterSheet({ noun })).toBe("Filtrer les machines");
    expect(fr.chooseOperator({ label: "Statut" })).toBe(
      "Choisir un opérateur pour Statut",
    );
    expect(fr.chooseValue({ label: "Statut" })).toBe(
      "Choisir une valeur pour Statut",
    );
    expect(
      fr.filtersCleared({ count: { kind: "exact", value: 4 }, noun }),
    ).toBe("Filtres effacés. 4 machines.");
    expect(fr.resultsUpdated({ count: { kind: "unknown" }, noun })).toBe(
      "Résultats mis à jour.",
    );
    expect(fr.showResults({ count: { kind: "unknown" } })).toBe(
      "Afficher les résultats",
    );
    expect(fr.showResults({ count: { kind: "at-least", value: 5 } })).toBe(
      "Afficher 5+ résultats",
    );
    expect(fr.showResults({ count: { kind: "exact", value: 1 } })).toBe(
      "Afficher 1 résultat",
    );
    expect(fr.showResults({ count: { kind: "exact", value: 3 } })).toBe(
      "Afficher 3 résultats",
    );
    expect(fr.filterStepChosen({ chosen: "Statut", step: "Opérateur" })).toBe(
      "Statut choisi. Opérateur.",
    );
  });

  it("words the quick filters", () => {
    expect(fr.appliedCount({ count: 2, condition: "exclusion" })).toBe(
      "aucun des 2",
    );
    expect(fr.appliedCount({ count: 1, condition: "inclusion" })).toBe(
      "1 appliqué",
    );
    expect(fr.appliedCount({ count: 3, condition: "inclusion" })).toBe(
      "3 appliqués",
    );
    expect(fr.searchOptions({ label: "Pool" })).toBe(
      "Rechercher parmi les options de Pool",
    );
    expect(fr.optionExcluded({ value: "prêt" })).toBe("prêt, exclu");
    expect(fr.optionsShown({ count: 1 })).toBe("1 option");
    expect(fr.optionsShown({ count: 4 })).toBe("4 options");
  });
});
