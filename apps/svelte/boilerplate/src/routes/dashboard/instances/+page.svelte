<script lang="ts">
  import { Button, Modal } from "@canonical/svelte-ds-global";
  import {
    Field,
    Form,
    validateRemotely,
  } from "@canonical/svelte-ds-global-form";
  import { onMount } from "svelte";
  import { fromAction } from "svelte/attachments";
  import { enhance } from "$app/forms";
  import { getLocaleSource, getTranslator } from "../../../i18n";
  import type { PageProps } from "./$types";

  let { data, form }: PageProps = $props();
  const locale = getLocaleSource();
  let t = $derived(getTranslator($locale));
  let confirming = $state(false);
  let removeLinkRef = $state<HTMLAnchorElement>();
  let panelRef = $state<HTMLDetailsElement>();
  let enhanced = $state(false);
  onMount(() => {
    enhanced = true;
  });
  function closePanel() {
    if (panelRef) {
      const restore = panelRef.contains(document.activeElement);
      panelRef.open = false;
      if (restore) panelRef.querySelector("summary")?.focus();
    }
  }
  function panelKeydown(event: KeyboardEvent) {
    if (event.key === "Escape" && panelRef?.open) {
      event.preventDefault();
      closePanel();
    }
  }
  function openPanel() {
    if (enhanced && panelRef && !panelRef.open)
      requestAnimationFrame(() => {
        if (
          panelRef?.open &&
          document.activeElement === panelRef.querySelector("summary")
        )
          panelRef
            .querySelector<HTMLInputElement>("#instance-name input")
            ?.focus();
      });
  }
  // The action's name issue shows on the name field until the name is edited; a new action result shows again.
  let nameIssue = $derived(
    form?.issue === "instanceInvalid" || form?.issue === "instanceDuplicate"
      ? form.issue
      : undefined,
  );
  // Checks a typed name against this browser's demo instances; the action checks again on submit.
  const checkName = $derived(
    validateRemotely("/api/instance-name", {
      minLength: 1,
      errorExtractor: async (response) => t((await response.json()).error),
    }),
  );
  function globalKeydown(event: KeyboardEvent) {
    if (panelRef?.contains(event.target as Node)) panelKeydown(event);
  }
</script>
<svelte:window onkeydown={globalKeydown} />
<svelte:head><title>{t("instances")} | {t("brand")}</title></svelte:head>
<h1>{t("instances")}</h1>
<p>{t("instancesDemo")}</p>
<div class="instance-layout">
<div>
{#if data.instances.length}
  <ul class="instance-cards">
    {#each data.instances as instance (instance.name)}
      <li><article class="instance-card"><h2><a href={`/dashboard/instances?selected=${encodeURIComponent(instance.name)}`} aria-current={data.selected?.name === instance.name ? "true" : undefined}>{instance.name}</a></h2><p>{t("release")}: {instance.release}</p></article></li>
    {/each}
  </ul>
{:else}<p>{t("instanceEmpty")}</p>{/if}
{#if data.selected}
  <section aria-labelledby="instance-details">
    <h2 id="instance-details">{data.selected.name}</h2>
    <dl><dt>{t("instanceStatus")}</dt><dd>{t("demoStatus")}</dd><dt>{t("release")}</dt><dd>{data.selected.release}</dd><dt>{t("instanceAddress")}</dt><dd>—</dd><dt>{t("instanceMemory")}</dt><dd>—</dd><dt>{t("enablePro")}</dt><dd>{t(data.selected.pro ? "yes" : "no")}</dd><dt>{t("cloudInit")}</dt><dd><pre>{data.selected.cloudInit || "—"}</pre></dd></dl>
    <a bind:this={removeLinkRef} href={`/dashboard/instances/remove?name=${encodeURIComponent(data.selected.name)}`} onclick={(event) => { if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); confirming = true; }}>{t("removeInstance")}</a>
  </section>
  <Modal bind:open={confirming} onclose={() => removeLinkRef?.focus()}>
    <Modal.Header closeButton={false}><h2>{t("confirmRemove")}</h2></Modal.Header>
    <Modal.Content><p>{t("confirmRemoveBody", { name: data.selected.name })}</p></Modal.Content>
    <Modal.Footer>
      <Button importance="tertiary" onclick={() => confirming = false}>{t("cancel")}</Button>
      <form method="POST" action={`/dashboard/instances/remove?name=${encodeURIComponent(data.selected.name)}`}><input type="hidden" name="name" value={data.selected.name} /><Button type="submit" anticipation="destructive">{t("removeInstance")}</Button></form>
    </Modal.Footer>
  </Modal>
{:else}
  <p>{t("selectInstance")}</p>
{/if}
</div>
<aside class:enhanced class="instance-panel" aria-label={t("createInstance")}>
<details bind:this={panelRef} open={!!form?.issue || data.create}>
  <summary onclick={openPanel}>{t("createInstance")}</summary>
  <div class="instance-panel-content">
  {#if enhanced}<Button importance="tertiary" onclick={closePanel}>{t("cancel")}</Button>{/if}
  {#if form?.issue === "instanceLimit"}<p role="alert">{t(form.issue)}</p>{/if}
  <Form method="POST" action="?/create" novalidate {@attach fromAction(enhance)}>
    <Field inputType="text" id="instance-name" name="name" label={t("instanceName")} value={form?.values?.name ?? ""} maxlength={40} error={nameIssue ? t(nameIssue) : undefined} oninput={() => { nameIssue = undefined; }} {@attach checkName} />
    <Field inputType="select" id="instance-release" name="release" label={t("release")} options={data.releaseOptions} value={form?.values?.release ?? data.release} />
    <Field inputType="checkbox" id="instance-pro" name="pro" label={t("enablePro")} isOptional value={form?.values?.pro ?? false} />
    <Field inputType="textarea" id="instance-cloud" name="cloudInit" label={t("cloudInit")} isOptional value={form?.values?.cloudInit ?? ""} maxlength={1000} />
    <Button type="submit" anticipation="constructive">{t("createInstance")}</Button>
  </Form>
  </div>
</details>
</aside>
</div>
