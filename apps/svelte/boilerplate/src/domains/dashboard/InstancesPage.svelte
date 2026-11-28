<script lang="ts">
  import { ContentLayout, ViewLayout } from "@canonical/svelte-ds-app";
  import { Badge, Button } from "@canonical/svelte-ds-global";
  import { Field, Form } from "@canonical/svelte-ds-global-form";
  import formatDocumentTitle from "../../formatDocumentTitle.js";
  import {
    createAppFormatters,
    createAppTranslator,
    getLocaleSource,
  } from "../../i18n/index.js";
  import { Icon } from "../../lib/index.js";
  import {
    CREATE_DEFAULTS,
    INSTANCES,
    RELEASE_OPTIONS,
    STATUS_KEYS,
  } from "./constants.js";
  import createInstance from "./createInstance.js";
  import DashboardBreadcrumbs from "./DashboardBreadcrumbs.svelte";
  import type { Instance } from "./types.js";
  import "./styles.css";

  let {
    created,
    selected,
    isCreating = false,
    nameError,
  }: {
    /** An instance the create action added, when the form posted without JavaScript. */
    created?: Instance;
    /** The instance chosen through the `selected` query, without JavaScript. */
    selected?: string;
    /** Renders the create panel open, as `?create=1` asks without JavaScript. */
    isCreating?: boolean;
    /** The create action's error key for the name, when it posted without one. */
    nameError?: "dashboard.instances.nameRequired";
  } = $props();

  const panelId = $props.id();
  const createFormId = "create-instance";
  const selectFormId = "select-instance";
  const openFormId = "open-create-instance";

  const locale = getLocaleSource();
  const t = $derived(createAppTranslator($locale));
  const formatters = $derived(createAppFormatters($locale));
  // The props seed the client state: after hydration the page owns the list.
  // svelte-ignore state_referenced_locally
  let instances = $state<readonly Instance[]>(
    created ? [...INSTANCES, created] : INSTANCES,
  );
  // svelte-ignore state_referenced_locally
  let selectedName = $state<string | null>(created?.name ?? selected ?? null);
  // svelte-ignore state_referenced_locally
  let nameErrorKey = $state(nameError);
  const selectedInstance = $derived(
    instances.find((instance) => instance.name === selectedName),
  );
  let panelRef = $state<HTMLDialogElement>();
  let openerElement: HTMLElement | null = null;

  function openPanel(event: MouseEvent) {
    event.preventDefault();
    if (!panelRef || panelRef.open) return;
    openerElement = event.currentTarget as HTMLElement;
    panelRef.show();
    panelRef.focus();
  }

  function closePanel(event?: Event) {
    event?.preventDefault();
    panelRef?.close();
    openerElement?.focus();
  }

  function handlePanelKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") closePanel(event);
  }

  function selectInstance(event: MouseEvent, name: string) {
    event.preventDefault();
    selectedName = name;
  }

  function handleCreate(event: SubmitEvent) {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const instance = createInstance(Object.fromEntries(new FormData(form)));

    if (!instance) {
      nameErrorKey = "dashboard.instances.nameRequired";
      return;
    }

    nameErrorKey = undefined;
    instances = [...instances, instance];
    selectedName = instance.name;
    closePanel();
  }
</script>

<svelte:head><title>{formatDocumentTitle(t("dashboard.instances.title"))}</title></svelte:head>

{#snippet plusIcon()}<Icon name="plus" />{/snippet}
{#snippet closeIcon()}<Icon name="close" />{/snippet}

<!-- Without JavaScript, Create instance asks for the page with the panel
     open, and each Details button for the page with that instance chosen;
     with JavaScript their click handlers do both in place. -->
<form action="" hidden id={openFormId}><input name="create" type="hidden" value="1" /></form>
<form action="" hidden id={selectFormId}></form>

<ViewLayout class="dashboard-view">
  <ContentLayout>
    <header class="titlebar">
      <div>
        <DashboardBreadcrumbs />
        <h1>{t("dashboard.instances.heading")} <Badge value={instances.length} /></h1>
      </div>
      <div class="actions">
        <Button aria-controls={panelId} form={openFormId} icon={plusIcon} importance="primary" onclick={openPanel} type="submit">{t("dashboard.instances.create")}</Button>
      </div>
    </header>

    <section aria-label={t("dashboard.instances.heading")} class="section">
      <ul class="tiles">
        {#each instances as instance (instance.name)}
          <li>
            <div class="ds tile surface">
              <div class="ds tile-header">{instance.name}</div>
              <div class="ds tile-content">
                <p class="muted">{t("dashboard.instances.summary", { status: t(STATUS_KEYS[instance.status]), release: instance.release })}</p>
                <Button aria-label={t("dashboard.instances.show", { name: instance.name })} aria-pressed={instance.name === selectedName} form={selectFormId} importance="tertiary" name="selected" onclick={(event) => selectInstance(event, instance.name)} type="submit" value={instance.name}>{t("dashboard.instances.details")}</Button>
              </div>
            </div>
          </li>
        {/each}
      </ul>
    </section>
  </ContentLayout>

  <!-- A stand-in for React's SidePanel: a non-modal dialog docked to the
       inline-end edge, with the same markup classes. -->
  <dialog aria-labelledby={`${panelId}-title`} bind:this={panelRef} class="ds side-panel" id={panelId} onkeydown={handlePanelKeydown} open={isCreating || undefined} tabindex="-1">
    <div class="ds side-panel-header">
      <span class="title p" id={`${panelId}-title`}>{t("dashboard.instances.create")}</span>
      <Button aria-label={t("dashboard.instances.closePanel")} class="close" command="close" commandfor={panelId} icon={closeIcon} importance="tertiary" onclick={closePanel} type="button" />
    </div>
    <!-- svelte-ignore a11y_no_noninteractive_tabindex: the pane scrolls, so it is a tab stop, as in React's SidePanel -->
    <div class="ds side-panel-content" tabindex="0">
      <Form action="?/create" id={createFormId} method="post" onsubmit={handleCreate}>
        <Field error={nameErrorKey ? t(nameErrorKey) : undefined} inputType="text" label={t("dashboard.instances.name")} name="instance_name" value={CREATE_DEFAULTS.instance_name} />
        <Field inputType="select" label={t("dashboard.instances.release")} name="release" options={RELEASE_OPTIONS} value={CREATE_DEFAULTS.release} />
        <Field controlLabel={t("dashboard.instances.pro")} description={t("dashboard.instances.proDescription")} inputType="checkbox" isOptional name="enable_pro" value={CREATE_DEFAULTS.enable_pro} />
        <Field description={t("dashboard.instances.cloudInitDescription")} inputType="textarea" isOptional label={t("dashboard.instances.cloudInit")} name="cloud_init" value={CREATE_DEFAULTS.cloud_init} />
      </Form>
    </div>
    <div class="ds side-panel-footer">
      <Button command="close" commandfor={panelId} onclick={closePanel} type="button">{t("dashboard.cancel")}</Button>
      <Button anticipation="constructive" form={createFormId} importance="primary" type="submit">{t("dashboard.instances.create")}</Button>
    </div>
  </dialog>

  {#snippet aside()}
    <section aria-labelledby="details-title" class="panel">
      <h2 id="details-title">{selectedInstance ? selectedInstance.name : t("dashboard.instances.details")}</h2>
      {#if selectedInstance}
        <dl class="details">
          <dt>{t("dashboard.instances.status")}</dt>
          <dd>{t(STATUS_KEYS[selectedInstance.status])}</dd>
          <dt>{t("dashboard.instances.release")}</dt>
          <dd>{selectedInstance.release}</dd>
          <dt>{t("dashboard.instances.address")}</dt>
          <dd>{selectedInstance.ipv4 || "—"}</dd>
          <dt>{t("dashboard.instances.memory")}</dt>
          <dd>{t("dashboard.instances.memoryValue", { value: formatters.formatNumber(selectedInstance.memoryGib) })}</dd>
        </dl>
      {:else}
        <p class="muted">{t("dashboard.instances.selectHint")}</p>
      {/if}
    </section>
  {/snippet}
</ViewLayout>

<!-- @component
The instances page: a tile per instance with its count beside the heading, a
details aside for the chosen one, and a side panel that creates instances in
the page's state, as React's InstancesPage does. Without JavaScript the panel
opens through `?create=1`, the create form posts to the page's action, and a
Details button chooses through `?selected=`.
-->
