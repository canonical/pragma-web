<script lang="ts">
  import { Field, Form } from "@canonical/svelte-ds-global-form";
  import { readMaximum, readSettings, settingsFields, validMaximum } from "../../../../domains/dashboard/settings";
  import { localeSource, translator } from "../../../../i18n";
  import ProjectDanger from "../../../../domains/dashboard/ProjectDanger.svelte";
  const locale = localeSource();
  let t = $derived(translator($locale));
  let values = $state(readSettings(localStorage.getItem("demo-settings") ?? undefined));
  let errors = $state<{ name?: string; bridge?: string; maxInstances?: string }>({});
  let saved = $state(false);
  function submit(event: SubmitEvent) {
    event.preventDefault();
    const data = new FormData(event.currentTarget as HTMLFormElement);
    const text = (name: string) => String(data.get(name) ?? "");
    const next = { name: text("name").trim(), bridge: text("bridge"), ipv6: data.has("ipv6"), snapshots: data.has("snapshots"), maxInstances: text("maxInstances") };
    errors = { ...(!next.name || next.name.length > 60 ? { name: next.name.length > 60 ? "nameTooLong" : "nameError" } : {}), ...(!["lxdbr0", "ovn-1"].includes(next.bridge) ? { bridge: "bridgeError" } : {}), ...(!validMaximum(next.maxInstances) ? { maxInstances: "maximumError" } : {}) };
    saved = !Object.keys(errors).length;
    if (saved) { localStorage.setItem("demo-settings", JSON.stringify(next)); values = next; }
  }
</script>
<svelte:head><title>{t("settings")} | {t("brand")}</title></svelte:head>
<h1>{t("settings")}</h1><p>{t("spaDashboardDemo")}</p>
{#if saved}<p role="status">{t("saved")}</p>{/if}
{#if Object.keys(errors).length}
  <section aria-labelledby="settings-errors">
    <h2 id="settings-errors">{t("reviewErrors")}</h2>
    <ul>{#each Object.entries(errors) as [name, message]}<li><a href={`#${name}`}>{t(message)}</a></li>{/each}</ul>
  </section>
{/if}
<Form onsubmit={submit} novalidate>
  {#each settingsFields as field (field.name)}
    {#if field.inputType === "switch"}<Field {...field} id={field.name} label={t(field.label)} value={values[field.name]} />
    {:else if field.inputType === "select"}<Field {...field} id={field.name} label={t(field.label)} value={values[field.name]} error={errors.bridge ? t(errors.bridge) : undefined} />
    {:else if field.inputType === "number"}<Field {...field} id={field.name} label={t(field.label)} value={readMaximum(values.maxInstances)} error={errors.maxInstances ? t(errors.maxInstances) : undefined} />
    {:else}<Field {...field} id={field.name} label={t(field.label)} value={values[field.name]} error={errors.name ? t(errors.name) : undefined} />{/if}
  {/each}
  <button type="submit">{t("save")}</button>
</Form>
<ProjectDanger />
