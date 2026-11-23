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
    expect(fr.filterIsAnyOf("Statut")).toBe("Statut est l’une des valeurs");
    expect(fr.filterIsNoneOf("Statut")).toBe("Statut n’est aucune des valeurs");
    expect(fr.filterContains("Nom")).toBe("Nom contient");
    expect(fr.filterStartsWith("Nom")).toBe("Nom commence par");
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
    expect(fr.chartFailed("hors ligne.")).toBe(
      "Ce graphique n’a pas pu être chargé : hors ligne.",
    );
    expect(fr.chartFailed("")).toBe("Ce graphique n’a pas pu être chargé.");
    expect(fr.chartRefreshFailed("hors ligne")).toBe(
      "Ce graphique n’a pas pu être actualisé : hors ligne.",
    );
    expect(fr.chartRefreshFailed(" . ")).toBe(
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
});
