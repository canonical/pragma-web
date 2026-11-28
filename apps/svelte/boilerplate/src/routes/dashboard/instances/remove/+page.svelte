<script lang="ts">
  import { Button } from "@canonical/svelte-ds-global";
  import { getLocaleSource, getTranslator } from "../../../../i18n";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
  const locale = getLocaleSource();
  let t = $derived(getTranslator($locale));
</script>
<svelte:head><title>{t("confirmRemove")} | {t("brand")}</title></svelte:head>
<h1>{t("confirmRemove")}</h1>
<p>{t("confirmRemoveBody", { name: data.instance.name })}</p>
<form method="POST"><input type="hidden" name="name" value={data.instance.name} /><Button type="submit" anticipation="destructive">{t("removeInstance")}</Button></form>
<a href={`/dashboard/instances?selected=${encodeURIComponent(data.instance.name)}`}>{t("cancel")}</a>
