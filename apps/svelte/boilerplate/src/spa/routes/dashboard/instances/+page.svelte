<script lang="ts">
  import { Button, Modal } from "@canonical/svelte-ds-global";
  import { Field, Form } from "@canonical/svelte-ds-global-form";
  import { page } from "$app/state";
  import {
    releaseOptions,
    releases,
  } from "../../../../domains/dashboard/constants";
  import {
    isNameTaken,
    isValidInstance,
    readInstances,
  } from "../../../../domains/dashboard/instances";
  import type { Instance } from "../../../../domains/dashboard/types";
  import { getLocaleSource, getTranslator } from "../../../../i18n";

  const locale = getLocaleSource();
  let t = $derived(getTranslator($locale));
  let instances = $state<Instance[]>(
    readInstances(localStorage.getItem("demo-instances") ?? undefined),
  );
  let selected = $state<string | undefined>();
  let issue = $state("");
  let confirm = $state(false);
  let panelRef = $state<HTMLDetailsElement>();
  let initialCreate = page.url.searchParams.get("create") === "1";
  let initialRelease =
    releases.find((item) => item === page.url.searchParams.get("release")) ??
    "noble";
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
    if (panelRef && !panelRef.open)
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
  function globalKeydown(event: KeyboardEvent) {
    if (panelRef?.contains(event.target as Node)) panelKeydown(event);
  }
  function create(event: SubmitEvent) {
    event.preventDefault();
    const data = new FormData(event.currentTarget as HTMLFormElement);
    const values = {
      name: String(data.get("name") ?? ""),
      release: String(data.get("release") ?? ""),
      pro: data.has("pro"),
      cloudInit: String(data.get("cloudInit") ?? ""),
    };
    issue = !isValidInstance(values)
      ? "instanceInvalid"
      : isNameTaken(values.name, instances)
        ? "instanceDuplicate"
        : instances.length >= 10
          ? "instanceLimit"
          : "";
    if (issue || !isValidInstance(values)) return;
    const next = [...instances, values];
    if (encodeURIComponent(JSON.stringify(next)).length > 3000) {
      issue = "instanceLimit";
      return;
    }
    localStorage.setItem("demo-instances", JSON.stringify(next));
    instances = next;
    selected = values.name;
    closePanel();
  }
  function openDialog() {
    confirm = true;
  }
  function closeDialog() {
    confirm = false;
  }
  function remove() {
    instances = instances.filter((item) => item.name !== selected);
    localStorage.setItem("demo-instances", JSON.stringify(instances));
    selected = undefined;
    confirm = false;
    document.getElementById("instance-create-toggle")?.focus();
  }
</script>
<svelte:window onkeydown={globalKeydown} />
<svelte:head><title>{t("instances")} | {t("brand")}</title></svelte:head>
<h1>{t("instances")}</h1><p>{t("spaInstancesDemo")}</p>
<div class="instance-layout"><div>
{#if instances.length}<ul class="instance-cards">{#each instances as instance (instance.name)}<li><article class="instance-card"><h2><button type="button" aria-pressed={selected === instance.name} onclick={() => selected = instance.name}>{instance.name}</button></h2><p>{t("release")}: {instance.release}</p></article></li>{/each}</ul>{:else}<p>{t("instanceEmpty")}</p>{/if}
{#each instances.filter((item) => item.name === selected) as instance (instance.name)}
  <section aria-labelledby="details"><h2 id="details">{instance.name}</h2><dl><dt>{t("instanceStatus")}</dt><dd>{t("demoStatus")}</dd><dt>{t("release")}</dt><dd>{instance.release}</dd><dt>{t("instanceAddress")}</dt><dd>—</dd><dt>{t("instanceMemory")}</dt><dd>—</dd><dt>{t("enablePro")}</dt><dd>{t(instance.pro ? "yes" : "no")}</dd><dt>{t("cloudInit")}</dt><dd><pre>{instance.cloudInit || "—"}</pre></dd></dl>
    <Button id="instance-remove" anticipation="destructive" onclick={openDialog}>{t("removeInstance")}</Button>
  </section>
{/each}
{#if !selected}<p>{t("selectInstance")}</p>{/if}
<Modal bind:open={confirm} onclose={() => { if (selected) document.getElementById("instance-remove")?.focus(); }}>
  <Modal.Header closeButton={false}><h2>{t("confirmRemove")}</h2></Modal.Header>
  <Modal.Content><p>{t("confirmRemoveBody", { name: selected ?? "" })}</p></Modal.Content>
  <Modal.Footer><Button importance="tertiary" onclick={closeDialog}>{t("cancel")}</Button><Button anticipation="destructive" onclick={remove}>{t("removeInstance")}</Button></Modal.Footer>
</Modal>
</div>
<aside class="instance-panel enhanced" aria-label={t("createInstance")}><details bind:this={panelRef} open={initialCreate}><summary id="instance-create-toggle" onclick={openPanel}>{t("createInstance")}</summary><div class="instance-panel-content">
  <Button importance="tertiary" onclick={closePanel}>{t("cancel")}</Button>
  {#if issue === "instanceLimit"}<p role="alert">{t(issue)}</p>{/if}
  <Form onsubmit={create} novalidate>
    <Field inputType="text" id="instance-name" name="name" label={t("instanceName")} maxlength={40} error={issue && issue !== "instanceLimit" ? t(issue) : undefined} oninput={() => { if (issue !== "instanceLimit") issue = ""; }} />
    <Field inputType="select" id="instance-release" name="release" label={t("release")} options={releaseOptions} value={initialRelease} />
    <Field inputType="checkbox" id="instance-pro" name="pro" label={t("enablePro")} isOptional />
    <Field inputType="textarea" id="instance-cloud" name="cloudInit" label={t("cloudInit")} isOptional maxlength={1000} />
    <Button type="submit" anticipation="constructive">{t("createInstance")}</Button>
  </Form>
</div></details></aside></div>
