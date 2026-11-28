<script lang="ts">
  import { ContentLayout, ViewLayout } from "@canonical/svelte-ds-app";
  import { Button } from "@canonical/svelte-ds-global";
  import formatDocumentTitle from "../../formatDocumentTitle.js";
  import {
    createAppFormatters,
    createAppTranslator,
    getLocaleSource,
  } from "../../i18n/index.js";
  import { Icon } from "../../lib/index.js";
  import {
    ACTIVITY,
    CHANNEL_KEYS,
    OVERVIEW_FIGURES,
    RELEASES,
    TERABYTES,
  } from "./constants.js";
  import DashboardBreadcrumbs from "./DashboardBreadcrumbs.svelte";
  import selectRelativeTime from "./selectRelativeTime.js";
  import "./styles.css";

  /** The form the create buttons submit: a GET to the instances page. */
  const instancesFormId = "open-instances";

  const locale = getLocaleSource();
  const t = $derived(createAppTranslator($locale));
  const formatters = $derived(createAppFormatters($locale));

  function formatRelative(minutesAgo: number): string {
    const { value, unit } = selectRelativeTime(minutesAgo);
    return formatters.formatRelativeTime(value, unit, { numeric: "auto" });
  }

  const tiles = $derived([
    {
      label: t("dashboard.overview.running"),
      figure: formatters.formatNumber(OVERVIEW_FIGURES.running),
    },
    {
      label: t("dashboard.overview.stopped"),
      figure: formatters.formatNumber(OVERVIEW_FIGURES.stopped),
    },
    {
      label: t("dashboard.overview.storage"),
      figure: formatters.formatNumber(
        OVERVIEW_FIGURES.storageUsedTb,
        TERABYTES,
      ),
      detail: t("dashboard.overview.storageOf", {
        total: formatters.formatNumber(
          OVERVIEW_FIGURES.storageTotalTb,
          TERABYTES,
        ),
      }),
    },
    {
      label: t("dashboard.overview.alerts"),
      figure: formatters.formatNumber(OVERVIEW_FIGURES.alerts),
    },
  ]);
</script>

<svelte:head><title>{formatDocumentTitle(t("dashboard.overview.title"))}</title></svelte:head>

{#snippet plusIcon()}<Icon name="plus" />{/snippet}

<!-- The create buttons navigate to the instances page. They submit this GET
     form, which SvelteKit turns into a client-side navigation, so they also
     work without JavaScript. -->
<form action="/dashboard/instances" hidden id={instancesFormId}></form>

<ViewLayout class="dashboard-view">
  <ContentLayout>
    <header class="titlebar">
      <div>
        <DashboardBreadcrumbs />
        <h1>{t("dashboard.overview.heading")}</h1>
      </div>
      <div class="actions">
        <Button form={instancesFormId} icon={plusIcon} importance="primary" type="submit">{t("dashboard.instances.create")}</Button>
      </div>
    </header>

    <section aria-labelledby="status-title" class="section">
      <h2 id="status-title">{t("dashboard.overview.status")}</h2>
      <ul class="tiles">
        {#each tiles as tile (tile.label)}
          <li>
            <div class="ds tile surface">
              <div class="ds tile-header">{tile.label}</div>
              <div class="ds tile-content">
                <p class="figure">{tile.figure}</p>
                {#if tile.detail}<p class="muted">{tile.detail}</p>{/if}
              </div>
            </div>
          </li>
        {/each}
      </ul>
    </section>

    <section aria-labelledby="releases-title" class="section">
      <h2 id="releases-title">{t("dashboard.overview.releases")}</h2>
      <ul class="cards">
        {#each RELEASES as release (release.name)}
          <li>
            <div class="ds card">
              <div class="ds card-header">{release.name}</div>
              <div class="ds card-content">
                <p>{t(release.summaryKey)}</p>
                <p class="muted">{t("dashboard.releases.detail", { channel: t(CHANNEL_KEYS[release.channel]), kernel: release.kernel })}</p>
              </div>
              <div class="ds card-footer">
                <Button importance="secondary" type="button">{t("dashboard.overview.releaseNotes")}</Button>
                <Button form={instancesFormId} icon={plusIcon} importance="primary" type="submit">{t("dashboard.overview.launch")}</Button>
              </div>
            </div>
          </li>
        {/each}
      </ul>
    </section>
  </ContentLayout>

  {#snippet aside()}
    <section aria-labelledby="activity-title" class="panel">
      <h2 id="activity-title">{t("dashboard.activity.heading")}</h2>
      <div class="ds timeline">
        <div class="ds timeline-content">
          {#each ACTIVITY as event (event.key)}
            <div class={["ds timeline-event", event.criticality]}>
              <div class="marker" aria-hidden="true"></div>
              <div class="content">
                <div class="actor">{"name" in event.actor ? event.actor.name : t(event.actor.key)}</div>
                <time class="datetime">{formatRelative(event.minutesAgo)}</time>
                <div class="payload">{t(event.messageKey, event.values)}</div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </section>
  {/snippet}
</ViewLayout>

<!-- @component
The dashboard's overview: status tiles, the releases on offer and the activity
feed. Tiles, cards and the timeline use the markup of React's `Tile`, `Card`
and `Timeline`, which the Svelte design system does not ship yet.
-->
