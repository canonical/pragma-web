<script lang="ts">
  import { getLocaleSource, getTranslator } from "../../i18n";

  let { name, count }: { name: string; count: number } = $props();
  const locale = getLocaleSource();
  let t = $derived(getTranslator($locale));
  let storage = $derived(
    new Intl.NumberFormat($locale, {
      style: "unit",
      unit: "terabyte",
      maximumFractionDigits: 1,
    }),
  );
  let relative = $derived(
    new Intl.RelativeTimeFormat($locale, { numeric: "auto" }),
  );
  const events = [
    { key: "activityStart", value: -2, unit: "minute" },
    { key: "activitySnapshot", value: -14, unit: "minute" },
    { key: "activityWarning", value: -1, unit: "hour" },
    { key: "activityProfile", value: -1, unit: "day" },
    { key: "activityFailed", value: -2, unit: "day" },
  ] as const;
</script>
<svelte:head><title>{t("dashboard")} | {t("brand")}</title></svelte:head>
<h1>{t("dashboard")}</h1>
<p>{t("welcome", { name })}</p>
<p>{t("demo")}</p>
<p><a href="/dashboard/instances?create=1">{t("createInstance")}</a></p>
<div class="dashboard-overview">
<div>
<section aria-labelledby="dashboard-resources">
  <h2 id="dashboard-resources">{t("overview")}</h2>
  <ul class="instance-cards">
    <li><article class="instance-card"><h3>{t("instances")}</h3><p>{new Intl.NumberFormat($locale).format(count)}</p><a href="/dashboard/instances">{t("instances")}</a></article></li>
    <li><article class="instance-card"><h3>{t("settings")}</h3><p>{t("settingsDemo")}</p><a href="/dashboard/settings">{t("settings")}</a></article></li>
    <li><article class="instance-card"><h3>{t("catalog")}</h3><p>{t("homeText")}</p><a href="/catalog">{t("browse")}</a></article></li>
  </ul>
</section>
<section aria-labelledby="sample-status">
  <h2 id="sample-status">{t("sampleStatus")}</h2>
  <p>{t("sampleData")}</p>
  <ul class="instance-cards">
    {#each [{ label: "running", value: 128 }, { label: "stopped", value: 4 }, { label: "alerts", value: 2 }] as item}
      <li><article class="instance-card"><h3>{t(item.label)}</h3><p>{new Intl.NumberFormat($locale).format(item.value)}</p></article></li>
    {/each}
    <li><article class="instance-card"><h3>{t("sampleStorage")}</h3><p>{storage.format(2.4)}</p><p>{t("storageOf", { total: storage.format(4) })}</p></article></li>
  </ul>
</section>
<section aria-labelledby="releases-title">
  <h2 id="releases-title">{t("releases")}</h2>
  <ul class="instance-cards">
    {#each [{ name: "Ubuntu 24.04 LTS", code: "noble" }, { name: "Ubuntu 22.04 LTS", code: "jammy" }, { name: "Ubuntu 20.04 LTS", code: "focal" }] as release}
      <li><article class="instance-card"><h3>{release.name}</h3><p>{t("releaseInfo")}</p><p><a href="https://ubuntu.com/about/release-cycle">{t("releaseNotes")}</a></p><a href={`/dashboard/instances?create=1&release=${release.code}`}>{t("launch")}</a></article></li>
    {/each}
  </ul>
</section>
</div>
<aside aria-labelledby="activity-title" class="activity-panel">
  <h2 id="activity-title">{t("activity")}</h2>
  <ol>{#each events as event (event.key)}<li><p>{t(event.key)}</p><p>{relative.format(event.value, event.unit)}</p></li>{/each}</ol>
</aside>
</div>
