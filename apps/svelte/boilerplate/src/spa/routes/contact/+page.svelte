<script lang="ts">
  import { fields, maxLength, validate, type Errors } from "../../../domains/contact/form";
  import { Field, Form } from "@canonical/svelte-ds-global-form";
  import { localeSource, translator } from "../../../i18n";
  const locale = localeSource();
  let t = $derived(translator($locale));
  let errors = $state<Errors>({});
  let submitted = $state(false);
  function submit(event: SubmitEvent) {
    event.preventDefault();
    const data = new FormData(event.currentTarget as HTMLFormElement);
    errors = validate({ email: String(data.get("email") ?? ""), message: String(data.get("message") ?? "") });
    submitted = !Object.keys(errors).length;
  }
</script>
<svelte:head><title>{t("contact")} | {t("brand")}</title></svelte:head>
<h1>{t("contactTitle")}</h1><p>{t("spaContactDemo")}</p>
{#if submitted}<p role="status">{t("spaValidated")}</p>{/if}
<Form onsubmit={submit} novalidate>
  {#each fields as field (field.name)}
    <Field {...field} id={field.name} label={t(field.label)} error={errors[field.name] ? t(errors[field.name]!) : undefined} maxlength={maxLength} />
  {/each}
  <button type="submit">{t("send")}</button>
</Form>
