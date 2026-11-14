import { resolveMessages } from "@canonical/dataviews-core/bindings";
import { describe, expect, it } from "vitest";
import { FRENCH } from "./fr.js";

describe("FRENCH", () => {
  it("records every message English does", () => {
    expect(Object.keys(FRENCH).sort()).toEqual(
      Object.keys(resolveMessages()).sort(),
    );
  });

  it("states statuses without the reason's full stops", () => {
    expect(FRENCH.statusFailed("timeout.")).toBe(
      "Ces lignes n’ont pas pu être chargées : timeout",
    );
    expect(FRENCH.statusRefreshFailed("timeout")).toBe(
      "Ces lignes n’ont pas pu être actualisées : timeout",
    );
    expect(FRENCH.statusStale("moved")).toBe(
      "Ces lignes ne correspondent pas à la requête actuelle : moved",
    );
  });

  it("refuses a link with or without a reason", () => {
    expect(FRENCH.statusRefused(" . ")).toBe("Ce lien n’a pas pu être suivi.");
    expect(FRENCH.statusRefused("bad page.")).toBe(
      "Ce lien n’a pas pu être suivi : bad page.",
    );
  });

  it("groups numbers and chooses plurals as French does", () => {
    expect(FRENCH.columnWidth(1)).toBe("1 pixel");
    expect(FRENCH.columnWidth(0)).toBe("0 pixel");
    expect(FRENCH.columnWidth(12345)).toBe("12 345 pixels");
    expect(FRENCH.pageCount(1)).toBe("sur 1 page");
    expect(FRENCH.pageCount(3)).toBe("sur 3 pages");
    expect(FRENCH.rowsSelected(1)).toBe("1 sélectionnée");
    expect(FRENCH.rowsSelected(2)).toBe("2 sélectionnées");
    expect(FRENCH.deselectRows(1)).toBe("Désélectionner 1 ligne");
    expect(FRENCH.deselectRows(2)).toBe("Désélectionner 2 lignes");
    expect(FRENCH.viewsUnreadable(1)).toBe("1 vue enregistrée est illisible.");
    expect(FRENCH.viewsUnreadable(2)).toBe(
      "2 vues enregistrées sont illisibles.",
    );
  });

  it("states sort precedence with French ordinals", () => {
    expect(FRENCH.sortPrecedence("asc", 1, 1)).toBe("croissant");
    expect(FRENCH.sortPrecedence("desc", 1, 2)).toBe(
      "décroissant, 1er critère sur 2",
    );
    expect(FRENCH.sortPrecedence("asc", 2, 2)).toBe(
      "croissant, 2e critère sur 2",
    );
  });

  it("states sort outcomes", () => {
    expect(FRENCH.sortRefused([])).toBe("Tri inchangé.");
    expect(FRENCH.sortRefused(["a.", "b"])).toBe("Tri inchangé : a ; b.");
    expect(
      FRENCH.sortApplied([
        { name: "Nom", direction: "asc" },
        { name: "Cœurs", direction: "desc" },
      ]),
    ).toBe("Trié par Nom, croissant ; puis Cœurs, décroissant.");
    expect(FRENCH.sortDefaulted([{ name: "Nom", direction: "asc" }])).toBe(
      "Trié selon l’ordre de la source : Nom, croissant.",
    );
    expect(FRENCH.sortTerm("Nom", "desc")).toBe("Nom, décroissant");
  });

  it("names columns and their moves", () => {
    expect(FRENCH.selectRow("alpha")).toBe("Sélectionner alpha");
    expect(FRENCH.columnEndPlacement("Nom")).toContain("la colonne Nom doit");
    expect(FRENCH.columnOptions("Nom")).toBe("Options de la colonne Nom");
    expect(FRENCH.hideNamedColumn("Nom")).toBe("Masquer Nom");
    expect(FRENCH.showNamedColumn("Nom")).toBe("Afficher Nom");
    expect(FRENCH.moveNamedColumnLeft("Nom")).toBe(
      "Déplacer Nom vers la gauche",
    );
    expect(FRENCH.moveNamedColumnRight("Nom")).toBe(
      "Déplacer Nom vers la droite",
    );
    expect(FRENCH.columnAlwaysShown("Nom")).toBe("Nom est toujours affichée");
    expect(FRENCH.columnHidden("Nom")).toBe("Nom masquée");
    expect(FRENCH.columnShown("Nom", 2, 5)).toBe(
      "Nom affichée, position 2 sur 5",
    );
    expect(FRENCH.columnMoved("Nom", 1, 5)).toBe(
      "Nom déplacée en position 1 sur 5",
    );
  });

  it("names filters", () => {
    expect(FRENCH.filterFrom("Cœurs")).toBe("Cœurs à partir de");
    expect(FRENCH.filterTo("Cœurs")).toBe("Cœurs jusqu’à");
    expect(FRENCH.filterLowest("1")).toBe("Minimum : 1");
    expect(FRENCH.filterHighest("8")).toBe("Maximum : 8");
    expect(FRENCH.clearFilter("Statut")).toBe("Effacer Statut");
    expect(FRENCH.filterAlso("Cœurs à partir de", ["4", "8"])).toBe(
      "Cœurs à partir de 4, 8",
    );
    expect(FRENCH.clauseRefused("Statut", "inconnu.")).toBe(
      "Statut : inconnu.",
    );
    expect(FRENCH.filterIsAnyOf("Statut")).toBe("Statut est l’une des valeurs");
    expect(FRENCH.filterIsNoneOf("Statut")).toBe(
      "Statut n’est aucune des valeurs",
    );
    expect(FRENCH.filterContains("Nom")).toBe("Nom contient");
    expect(FRENCH.filterStartsWith("Nom")).toBe("Nom commence par");
  });

  it("states a count exactly or at least", () => {
    expect(FRENCH.facetCount({ kind: "exact", value: 4 })).toBe("4");
    expect(FRENCH.facetCount({ kind: "at-least", value: 1200 })).toBe(
      "au moins 1 200",
    );
  });

  it("states filter feedback with or without a retained restriction", () => {
    expect(FRENCH.filterIncomplete(true)).toContain(
      "La restriction précédente s’applique toujours.",
    );
    expect(FRENCH.filterIncomplete(false)).toBe(
      "Saisissez une valeur pour appliquer cette restriction.",
    );
    expect(FRENCH.filterRefused(["trop grand", "négatif."], true)).toBe(
      "trop grand. négatif. La restriction précédente s’applique toujours.",
    );
    expect(FRENCH.filterRefused(["trop grand"], false)).toBe("trop grand.");
  });

  it("states the rows shown, counted or not", () => {
    expect(FRENCH.rowsShown(1, 0, { kind: "unknown" })).toBe(
      "Lignes 0 affichées",
    );
    expect(FRENCH.rowsShown(3, 1, { kind: "unknown" })).toBe(
      "Ligne 3 affichée",
    );
    expect(FRENCH.rowsShown(1, 10, { kind: "unknown" })).toBe(
      "Lignes 1–10 affichées",
    );
    expect(FRENCH.rowsShown(3, 1, { kind: "exact", value: 3 })).toBe(
      "Ligne 3 sur 3",
    );
    expect(FRENCH.rowsShown(1, 10, { kind: "at-least", value: 50 })).toBe(
      "Lignes 1–10 sur au moins 50",
    );
  });

  it("states saved-view outcomes", () => {
    expect(FRENCH.renameForm("Pannes")).toBe("Renommer « Pannes »");
    expect(FRENCH.deleteForm("Pannes")).toBe(
      "Supprimer « Pannes » ? Cette action est définitive.",
    );
    expect(FRENCH.viewsUnavailable("hors ligne.")).toBe(
      "Les vues enregistrées sont indisponibles : hors ligne.",
    );
    expect(FRENCH.arrangementUnsaved("plein")).toBe(
      "La disposition n’est pas enregistrée : plein.",
    );
    expect(FRENCH.viewNameRefused("déjà pris")).toBe("déjà pris.");
    expect(FRENCH.viewPending("rename")).toBe("Renommage…");
    expect(FRENCH.viewOpened("Pannes")).toBe("« Pannes » ouverte.");
    expect(FRENCH.viewSaved("Pannes")).toBe("« Pannes » enregistrée.");
    expect(FRENCH.viewRenamed("Pannes")).toBe("Renommée en « Pannes ».");
    expect(FRENCH.viewRefused("Pannes", ["a.", "b"])).toBe(
      "Non ouverte : « Pannes » demande ce que cette collection ne peut pas afficher — a ; b. La requête est inchangée.",
    );
    expect(FRENCH.viewConflicted("save-as", "Pannes")).toBe(
      "Non enregistrée : une autre vue est stockée sous la même identité. Réessayez.",
    );
    expect(FRENCH.viewConflicted("remove", "Pannes")).toBe(
      "Non supprimée : « Pannes » a été modifiée ailleurs.",
    );
    expect(FRENCH.viewMissing("open")).toBe(
      "Non ouverte : la vue n’existe plus.",
    );
    expect(FRENCH.viewUnreadable("save", "JSON.")).toBe(
      "Non enregistrée : la vue stockée est illisible (JSON).",
    );
    expect(FRENCH.viewFailed("rename", "quota")).toBe("Non renommée : quota.");
  });

  it("summarises charts", () => {
    expect(FRENCH.barChartSummary("Statut")).toBe(
      "Statut : un diagramme en barres du nombre d’enregistrements par valeur",
    );
    expect(FRENCH.rangeChartSummary("Cœurs", 1, 64)).toBe(
      "Cœurs : une plage de 1 à 64",
    );
    expect(FRENCH.chartTable("Statut")).toBe("Statut, sous forme de tableau");
  });
});
