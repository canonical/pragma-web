import { resolveMessages } from "@canonical/dataviews-core/bindings";
import { describe, expect, it } from "vitest";
import fr from "./fr.js";

describe("fr", () => {
  it("records every message English does", () => {
    expect(Object.keys(fr).sort()).toEqual(
      Object.keys(resolveMessages()).sort(),
    );
  });

  it("states statuses without the reason's full stops", () => {
    expect(fr.statusFailed("timeout.")).toBe(
      "Ces lignes n’ont pas pu être chargées : timeout",
    );
    expect(fr.statusRefreshFailed("timeout")).toBe(
      "Ces lignes n’ont pas pu être actualisées : timeout",
    );
    expect(fr.statusStale("moved")).toBe(
      "Ces lignes ne correspondent pas à la requête actuelle : moved",
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
    expect(fr.deselectRows(1)).toBe("Désélectionner 1 ligne");
    expect(fr.deselectRows(2)).toBe("Désélectionner 2 lignes");
    expect(fr.viewsUnreadable(1)).toBe("1 vue enregistrée est illisible.");
    expect(fr.viewsUnreadable(2)).toBe("2 vues enregistrées sont illisibles.");
  });

  it("states sort precedence with French ordinals", () => {
    expect(fr.sortPrecedence("asc", 1, 1)).toBe("croissant");
    expect(fr.sortPrecedence("desc", 1, 2)).toBe(
      "décroissant, 1er critère sur 2",
    );
    expect(fr.sortPrecedence("asc", 2, 2)).toBe("croissant, 2e critère sur 2");
  });

  it("states sort outcomes", () => {
    expect(fr.sortRefused([])).toBe("Tri inchangé.");
    expect(fr.sortRefused(["a.", "b"])).toBe("Tri inchangé : a ; b.");
    expect(
      fr.sortApplied([
        { name: "Nom", direction: "asc" },
        { name: "Cœurs", direction: "desc" },
      ]),
    ).toBe("Trié par Nom, croissant ; puis Cœurs, décroissant.");
    expect(fr.sortDefaulted([{ name: "Nom", direction: "asc" }])).toBe(
      "Trié selon l’ordre de la source : Nom, croissant.",
    );
    expect(fr.sortTerm("Nom", "desc")).toBe("Nom, décroissant");
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
    expect(fr.columnShown("Nom", 2, 5)).toBe("Nom affichée, position 2 sur 5");
    expect(fr.columnMoved("Nom", 1, 5)).toBe(
      "Nom déplacée en position 1 sur 5",
    );
  });

  it("names filters", () => {
    expect(fr.filterFrom("Cœurs")).toBe("Cœurs à partir de");
    expect(fr.filterTo("Cœurs")).toBe("Cœurs jusqu’à");
    expect(fr.filterLowest("1")).toBe("Minimum : 1");
    expect(fr.filterHighest("8")).toBe("Maximum : 8");
    expect(fr.clearFilter("Statut")).toBe("Effacer Statut");
    expect(fr.filterAlso("Cœurs à partir de", ["4", "8"])).toBe(
      "Cœurs à partir de 4, 8",
    );
    expect(fr.clauseRefused("Statut", "inconnu.")).toBe("Statut : inconnu.");
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
    expect(fr.filterInUnit("Mémoire à partir de", "Mio")).toBe(
      "Mémoire à partir de (Mio)",
    );
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
    expect(fr.filterRefused(["trop grand", "négatif."], true)).toBe(
      "trop grand. négatif. La restriction précédente s’applique toujours.",
    );
    expect(fr.filterRefused(["trop grand"], false)).toBe("trop grand.");
  });

  it("states the rows shown, counted or not", () => {
    expect(fr.rowsShown(1, 0, { kind: "unknown" })).toBe("Lignes 0 affichées");
    expect(fr.rowsShown(3, 1, { kind: "unknown" })).toBe("Ligne 3 affichée");
    expect(fr.rowsShown(1, 10, { kind: "unknown" })).toBe(
      "Lignes 1–10 affichées",
    );
    expect(fr.rowsShown(3, 1, { kind: "exact", value: 3 })).toBe(
      "Ligne 3 sur 3",
    );
    expect(fr.rowsShown(1, 10, { kind: "at-least", value: 50 })).toBe(
      "Lignes 1–10 sur au moins 50",
    );
  });

  it("states saved-view outcomes", () => {
    expect(fr.renameForm("Pannes")).toBe("Renommer « Pannes »");
    expect(fr.deleteForm("Pannes")).toBe(
      "Supprimer « Pannes » ? Cette action est définitive.",
    );
    expect(fr.viewsUnavailable("hors ligne.")).toBe(
      "Les vues enregistrées sont indisponibles : hors ligne.",
    );
    expect(fr.arrangementUnsaved("plein")).toBe(
      "La disposition n’est pas enregistrée : plein.",
    );
    expect(fr.viewNameRefused("déjà pris")).toBe("déjà pris.");
    expect(fr.viewPending("rename")).toBe("Renommage…");
    expect(fr.viewOpened("Pannes")).toBe("« Pannes » ouverte.");
    expect(fr.viewSaved("Pannes")).toBe("« Pannes » enregistrée.");
    expect(fr.viewRenamed("Pannes")).toBe("Renommée en « Pannes ».");
    expect(fr.viewRefused("Pannes", ["a.", "b"])).toBe(
      "Non ouverte : « Pannes » demande ce que cette collection ne peut pas afficher — a ; b. La requête est inchangée.",
    );
    expect(fr.viewConflicted("save-as", "Pannes")).toBe(
      "Non enregistrée : une autre vue est stockée sous la même identité. Réessayez.",
    );
    expect(fr.viewConflicted("remove", "Pannes")).toBe(
      "Non supprimée : « Pannes » a été modifiée ailleurs.",
    );
    expect(fr.viewMissing("open")).toBe("Non ouverte : la vue n’existe plus.");
    expect(fr.viewUnreadable("save", "JSON.")).toBe(
      "Non enregistrée : la vue stockée est illisible (JSON).",
    );
    expect(fr.viewFailed("rename", "quota")).toBe("Non renommée : quota.");
  });

  it("summarises charts", () => {
    expect(fr.barChartSummary("Statut")).toBe(
      "Statut : un diagramme en barres du nombre d’enregistrements par valeur",
    );
    expect(fr.rangeChartSummary("Cœurs", 1, 64)).toBe(
      "Cœurs : une plage de 1 à 64",
    );
    expect(fr.chartTable("Statut")).toBe("Statut, sous forme de tableau");
  });
  it("words operators, shown and spoken, from their operands", () => {
    expect(fr.operatorShown("isAny", ["prêt"])).toBe(":");
    expect(fr.operatorShown("is", ["web"])).toBe(":");
    expect(fr.operatorShown("isNone", ["prêt"])).toBe("≠");
    expect(fr.operatorShown("isNot", ["web"])).toBe("≠");
    expect(fr.operatorShown("gte", [1])).toBe("≥");
    expect(fr.operatorShown("lte", [1])).toBe("≤");
    expect(fr.operatorShown("contains", ["web"])).toBe("contient");
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
    expect(fr.queryCleared({ kind: "exact", value: 2 }, noun)).toBe(
      "Filtres et recherche effacés. 2 machines.",
    );
    expect(fr.queryCleared({ kind: "unknown" }, noun)).toBe(
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
    expect(fr.recordCount({ kind: "exact", value: 1 }, noun)).toBe("1 machine");
    expect(
      fr.recordCount(
        { kind: "at-least", value: 3 },
        { ...noun, counted: (n) => `machine×${n}` },
      ),
    ).toBe("au moins 3 machine×3");
    expect(
      fr.clauseAdded("Statut est prêt", { kind: "at-least", value: 5 }, noun),
    ).toBe("Statut est prêt ajouté. Au moins 5 machines.");
    expect(fr.clauseChanged("Statut est prêt", { kind: "unknown" }, noun)).toBe(
      "Remplacé par Statut est prêt.",
    );
    expect(fr.clauseRemoved("Statut est prêt", { kind: "unknown" }, noun)).toBe(
      "Statut est prêt retiré.",
    );
    expect(fr.valuePicked("Statut est prêt")).toBe(
      "Statut est prêt. Entrée à nouveau pour l’appliquer.",
    );
    expect(fr.numberFormat([])).toBe("Nombre");
    expect(fr.numberFormat(["Mio", "Gio"])).toBe("Nombre, en Mio ou Gio");
    expect(fr.clauseInvalid("pas un nombre.")).toBe(
      "Non valide : pas un nombre",
    );
  });
});
