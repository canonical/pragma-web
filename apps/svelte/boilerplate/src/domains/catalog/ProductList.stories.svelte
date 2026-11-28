<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect } from "storybook/test";
  import { catalogs } from "../../i18n/index.js";
  import Component from "./ProductList.svelte";

  /**
   * The locale toolbar rerenders every story in the selected locale, so play
   * assertions never hard-code English copy: translated chrome is asserted
   * against the active locale's own catalog, and counts structurally.
   */
  const messagesFor = (locale: unknown): Record<string, unknown> =>
    catalogs[
      (typeof locale === "string" && locale in catalogs
        ? locale
        : "en") as keyof typeof catalogs
    ];

  const { Story } = defineMeta({
    title: "Catalog/ProductList",
    component: Component,
  });
</script>

<Story
  name="Default"
  args={{
    catalog: {
      viewerName: "Ada Lovelace",
      totalCount: 5,
      hasNextPage: true,
      products: [
        {
          id: "Product:story-1",
          name: "Aurora Dev Board",
          tagline: "A hackable single-board computer for prototyping",
          priceCents: 14_900,
          currency: "USD",
          rating: 4.6,
          inStock: true,
        },
        {
          id: "Product:story-2",
          name: "Polar Sensor Kit",
          tagline: "Twelve calibrated sensors in a rugged case",
          priceCents: 8_900,
          currency: "USD",
          rating: 4.2,
          inStock: false,
        },
      ],
    },
  }}
  play={async ({ canvas, globals }) => {
    const messages = messagesFor(globals.locale);

    await expect(await canvas.findByText("Aurora Dev Board")).toBeInTheDocument();
    await expect(canvas.getByText("Ada Lovelace")).toBeInTheDocument();
    await expect(canvas.getAllByRole("article")).toHaveLength(2);
    await expect(
      canvas.getByText(String(messages["catalog.outOfStock"]), { exact: false }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByText(String(messages["catalog.more"])),
    ).toBeInTheDocument();
  }}
/>

<Story
  name="EmptyCatalog"
  args={{
    catalog: {
      viewerName: "Ada Lovelace",
      totalCount: 0,
      hasNextPage: false,
      products: [],
    },
  }}
  play={async ({ canvas, globals }) => {
    const messages = messagesFor(globals.locale);

    await expect(
      await canvas.findByLabelText(String(messages["catalog.listLabel"])),
    ).toBeInTheDocument();
    await expect(canvas.queryByRole("article")).not.toBeInTheDocument();
  }}
/>
