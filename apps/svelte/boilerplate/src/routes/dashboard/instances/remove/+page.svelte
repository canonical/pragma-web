<script lang="ts">
  import { localeSource, translator } from "../../../../i18n";
  import type { PageProps } from "./$types";
  let { data }: PageProps = $props();
  const locale = localeSource();
  let t = $derived(translator($locale));
</script>
<svelte:head><title>{t("confirmRemove")} | {t("brand")}</title></svelte:head>
<h1>{t("confirmRemove")}</h1>
<p>{t("confirmRemoveBody", { name: data.instance.name })}</p>
<form method="POST"><input type="hidden" name="name" value={data.instance.name} /><button type="submit">{t("removeInstance")}</button></form>
<a href={`/dashboard/instances?selected=${encodeURIComponent(data.instance.name)}`}>{t("cancel")}</a>
