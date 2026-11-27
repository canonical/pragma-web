<script lang="ts">
  import { Field, Form } from "@canonical/svelte-ds-global-form";
  import { Modal } from "@canonical/svelte-ds-global";
  import { page } from "$app/state";
  import { isNameTaken, readInstances, releaseOptions, releases, validInstance, type Instance } from "../../../../domains/dashboard/instances";
  import { localeSource, translator } from "../../../../i18n";
  const locale = localeSource();
  let t = $derived(translator($locale));
  let instances = $state<Instance[]>(readInstances(localStorage.getItem("demo-instances") ?? undefined));
  let selected = $state<string | undefined>();
  let issue = $state("");
  let confirm = $state(false);
  let opener: HTMLButtonElement = $state() as HTMLButtonElement;
  let panel = $state<HTMLDetailsElement>();
  let initialCreate = page.url.searchParams.get("create") === "1";
  let initialRelease = releases.find((item) => item === page.url.searchParams.get("release")) ?? "noble";
  function closePanel() { if (panel) { const restore = panel.contains(document.activeElement); panel.open = false; if (restore) panel.querySelector("summary")?.focus(); } }
  function panelKeydown(event: KeyboardEvent) { if (event.key === "Escape" && panel?.open) { event.preventDefault(); closePanel(); } }
  function openPanel() { if (panel && !panel.open) requestAnimationFrame(() => { if (panel?.open && document.activeElement === panel.querySelector("summary")) panel.querySelector<HTMLInputElement>("#instance-name input")?.focus(); }); }
  function globalKeydown(event: KeyboardEvent) { if (panel?.contains(event.target as Node)) panelKeydown(event); }
  function create(event: SubmitEvent) {
    event.preventDefault();
    const data = new FormData(event.currentTarget as HTMLFormElement);
    const values = { name: String(data.get("name") ?? ""), release: String(data.get("release") ?? ""), pro: data.has("pro"), cloudInit: String(data.get("cloudInit") ?? "") };
    issue = !validInstance(values) ? "instanceInvalid" : isNameTaken(values.name, instances) ? "instanceDuplicate" : instances.length >= 10 ? "instanceLimit" : "";
    if (issue || !validInstance(values)) return;
    const next = [...instances, values];
    if (encodeURIComponent(JSON.stringify(next)).length > 3000) { issue = "instanceLimit"; return; }
    localStorage.setItem("demo-instances", JSON.stringify(next));
    instances = next;
    selected = values.name;
    closePanel();
  }
  function openDialog() { confirm = true; }
  function closeDialog() { confirm = false; }
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
    <button type="button" bind:this={opener} onclick={openDialog}>{t("removeInstance")}</button>
  </section>
{/each}
{#if !selected}<p>{t("selectInstance")}</p>{/if}
<Modal bind:open={confirm} onclose={() => { if (selected) opener?.focus(); }}>
  <Modal.Header closeButton={false}><h2>{t("confirmRemove")}</h2></Modal.Header>
  <Modal.Content><p>{t("confirmRemoveBody", { name: selected ?? "" })}</p></Modal.Content>
  <Modal.Footer><button type="button" onclick={closeDialog}>{t("cancel")}</button><button type="button" onclick={remove}>{t("removeInstance")}</button></Modal.Footer>
</Modal>
</div>
<aside class="instance-panel enhanced" aria-label={t("createInstance")}><details bind:this={panel} open={initialCreate}><summary id="instance-create-toggle" onclick={openPanel}>{t("createInstance")}</summary><div class="instance-panel-content">
  <button type="button" onclick={closePanel}>{t("cancel")}</button>
  {#if issue === "instanceLimit"}<p role="alert">{t(issue)}</p>{/if}
  <Form onsubmit={create} novalidate>
    <Field inputType="text" id="instance-name" name="name" label={t("instanceName")} maxlength={40} error={issue && issue !== "instanceLimit" ? t(issue) : undefined} oninput={() => { if (issue !== "instanceLimit") issue = ""; }} />
    <Field inputType="select" id="instance-release" name="release" label={t("release")} options={releaseOptions} value={initialRelease} />
    <Field inputType="checkbox" id="instance-pro" name="pro" label={t("enablePro")} isOptional />
    <Field inputType="textarea" id="instance-cloud" name="cloudInit" label={t("cloudInit")} isOptional maxlength={1000} />
    <button type="submit">{t("createInstance")}</button>
  </Form>
</div></details></aside></div>
