<script lang="ts">
  import { ContentLayout, ViewLayout } from "@canonical/svelte-ds-app";
  import { Button, Modal } from "@canonical/svelte-ds-global";
  import { Field, Form } from "@canonical/svelte-ds-global-form";
  import formatDocumentTitle from "../../formatDocumentTitle.js";
  import { createAppTranslator, getLocaleSource } from "../../i18n/index.js";
  import { Icon } from "../../lib/index.js";
  import {
    BRIDGE_OPTIONS,
    PROJECT_NAME,
    SETTINGS_DEFAULTS,
  } from "./constants.js";
  import DashboardBreadcrumbs from "./DashboardBreadcrumbs.svelte";
  import "./styles.css";

  const locale = getLocaleSource();
  const t = $derived(createAppTranslator($locale));

  /** Saving logs the settings, as the React app does; nothing is stored. */
  function handleSave(event: SubmitEvent) {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    console.log("Settings saved:", Object.fromEntries(new FormData(form)));
  }
</script>

<svelte:head><title>{formatDocumentTitle(t("dashboard.settings.title"))}</title></svelte:head>

{#snippet deleteIcon()}<Icon name="delete" />{/snippet}

<ViewLayout class="dashboard-view">
  <ContentLayout>
    <header class="titlebar">
      <div>
        <DashboardBreadcrumbs />
        <h1>{t("dashboard.settings.heading")}</h1>
      </div>
    </header>

    <section aria-labelledby="project-title" class="section narrow">
      <h2 id="project-title">{t("dashboard.settings.project")}</h2>
      <Form action="?/save" method="post" onsubmit={handleSave}>
        <Field inputType="select" label={t("dashboard.settings.bridge")} name="bridge" options={BRIDGE_OPTIONS} value={SETTINGS_DEFAULTS.bridge} />
        <Field controlLabel={t("dashboard.settings.ipv6Control")} inputType="switch" isOptional label={t("dashboard.settings.ipv6")} name="ipv6" value={SETTINGS_DEFAULTS.ipv6} />
        <Field inputType="number" label={t("dashboard.settings.maxInstances")} name="max_instances" value={SETTINGS_DEFAULTS.max_instances} />
        <Field controlLabel={t("dashboard.settings.snapshotsControl")} inputType="switch" isOptional label={t("dashboard.settings.snapshots")} name="snapshots" value={SETTINGS_DEFAULTS.snapshots} />
        <div class="actions">
          <Button importance="primary" type="submit">{t("dashboard.settings.save")}</Button>
        </div>
      </Form>
    </section>

    <section aria-labelledby="danger-title" class="section narrow">
      <h2 id="danger-title">{t("dashboard.settings.danger")}</h2>
      <p class="muted">{t("dashboard.settings.dangerBody")}</p>
      <Modal closedby="any">
        {#snippet trigger(triggerProps)}
          <div class="actions">
            <Button {...triggerProps} anticipation="destructive" icon={deleteIcon} importance="primary" type="button">{t("dashboard.settings.delete")}</Button>
          </div>
        {/snippet}
        {#snippet children(closeProps)}
          <Modal.Header>
            {t("dashboard.settings.confirmTitle")}
            {#snippet closeButton()}<Modal.Header.CloseButton aria-label={t("dashboard.close")} />{/snippet}
          </Modal.Header>
          <Modal.Content>
            <p>{t("dashboard.settings.confirmBody", { project: PROJECT_NAME })}</p>
          </Modal.Content>
          <Modal.Footer>
            <Button {...closeProps} importance="tertiary" type="button">{t("dashboard.cancel")}</Button>
            <Button {...closeProps} anticipation="destructive" icon={deleteIcon} importance="primary" type="button">{t("dashboard.settings.delete")}</Button>
          </Modal.Footer>
        {/snippet}
      </Modal>
    </section>
  </ContentLayout>
</ViewLayout>

<!-- @component
The project settings: a form prefilled with the current settings, and a danger
zone whose delete action asks for confirmation in a Modal. Saving logs the
values, as the React app does; without JavaScript the form posts to the page's
action, and the Modal opens and closes through invoker commands.
-->
