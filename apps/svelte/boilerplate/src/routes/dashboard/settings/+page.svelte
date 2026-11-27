<script lang="ts">
  import { localeSource, translator } from "../../../i18n";
  import { Field, Form } from "@canonical/svelte-ds-global-form";
  import { readMaximum, settingsFields } from "../../../domains/dashboard/settings";
  import ProjectDanger from "../../../domains/dashboard/ProjectDanger.svelte";
  import type { PageProps } from "./$types";
  let { data, form }: PageProps = $props();
  const locale = localeSource();
  let t = $derived(translator($locale));
  let values = $derived(form?.values ?? data.settings);
  let errors = $derived(form && "errors" in form ? form.errors : {});
</script>
<svelte:head><title>{t("settings")} | {t("brand")}</title></svelte:head>
<h1>{t("settings")}</h1>
<p>{t("settingsDemo")}</p>
{#if form?.saved}<p role="status">{t("saved")}</p>{/if}
{#if errors && Object.keys(errors).length}
  <section aria-labelledby="settings-errors">
    <h2 id="settings-errors">{t("reviewErrors")}</h2>
    <ul>
      {#each Object.entries(errors) as [name, message]}
        <li><a href={`#${name}`}>{t(message)}</a></li>
      {/each}
    </ul>
  </section>
{/if}
<Form method="POST" novalidate>
  {#each settingsFields as field (field.name)}
    {#if field.inputType === "switch"}
      <Field {...field} id={field.name} label={t(field.label)} value={values[field.name]} />
    {:else if field.inputType === "select"}
      <Field {...field} id={field.name} label={t(field.label)} value={values[field.name]} error={errors?.bridge ? t(errors.bridge) : undefined} />
    {:else if field.inputType === "number"}
      <Field {...field} id={field.name} label={t(field.label)} value={readMaximum(values.maxInstances)} error={errors?.maxInstances ? t(errors.maxInstances) : undefined} />
    {:else}
      <Field {...field} id={field.name} label={t(field.label)} value={values[field.name]} error={errors?.name ? t(errors.name) : undefined} />
    {/if}
  {/each}
  <button type="submit">{t("save")}</button>
</Form>
<ProjectDanger />
