<script lang="ts">
  import { enhance } from "$app/forms";
  import type { SubmitFunction } from "@sveltejs/kit";
  import { Field, Form } from "@canonical/svelte-ds-global-form";
  import { onDestroy } from "svelte";
  import type { Attachment } from "svelte/attachments";
  import { localeSource, translator } from "../../i18n";
  import { fields, maxLength, type Errors, type FieldName, type Values } from "./form";

  let { form }: { form?: { values?: Values; errors?: Errors; success?: boolean } | null } = $props();
  // Initial values come from the full-page action response; subsequent edits belong to the controls.
  // svelte-ignore state_referenced_locally
  const values: Values = { email: form?.values?.email ?? "", message: form?.values?.message ?? "" };
  const locale = localeSource();
  let t = $derived(translator($locale));
  let pending = $state(false);
  let notice = $state<"sentOlder" | "invalidOlder" | "failed" | "">("");
  let edited = $state(false);
  // svelte-ignore state_referenced_locally
  let errors = $state<Errors>({ ...form?.errors });
  let enhancedResult = $state<{ success?: boolean } | undefined>();
  let revision = 0;
  let generation = 0;
  let active: AbortController | undefined;
  onDestroy(() => { generation++; active?.abort(); });
  function editField(name: FieldName) {
    revision++;
    edited = true;
    delete errors[name];
  }

  const submit: SubmitFunction<{ success: boolean }, { values: Values; errors: Errors }> = ({ cancel, controller, formData, formElement, submitter }) => {
    if (pending) { cancel(); return; }
    pending = true;
    notice = "";
    active = controller;
    const started = revision;
    const currentGeneration = ++generation;
    const captured = JSON.stringify([...formData.entries()]);
    return ({ result }) => {
      if (currentGeneration !== generation) return;
      active = undefined;
      pending = false;
      if (!formElement.isConnected) return;
      const current = JSON.stringify([...new FormData(formElement, submitter).entries()]);
      if (result.type === "error") { notice = "failed"; return; }
      if (result.type === "redirect") { notice = "failed"; return; }
      if (started !== revision || captured !== current) {
        notice = result.type === "success" ? "sentOlder" : "invalidOlder";
        return;
      }
      edited = false;
      enhancedResult = result.type === "success" ? { success: true } : {};
      errors = result.type === "failure" ? result.data?.errors ?? {} : {};
    };
  };
  // `enhance` as an attachment; `fromAction` would widen the typed submit function.
  const enhanceContact: Attachment<HTMLFormElement> = (formElement) => enhance(formElement, submit).destroy;
</script>

<svelte:head><title>{t("contact")} | {t("brand")}</title></svelte:head>
<h1>{t("contactTitle")}</h1>
<p>{t("contactDemo")}</p>
{#if (enhancedResult?.success || (!enhancedResult && form?.success)) && !notice && !edited}<p role="status">{t("sent")}</p>{/if}
{#if notice}<p role="status">{t(notice)}</p>{/if}
<Form method="POST" novalidate {@attach enhanceContact}>
  {#each fields as field (field.name)}
    <Field {...field} id={field.name} label={t(field.label)} value={values[field.name]} error={errors[field.name] ? t(errors[field.name]!) : undefined} maxlength={maxLength} oninput={() => editField(field.name)} />
  {/each}
  <button type="submit" disabled={pending}>{t(pending ? "sending" : "send")}</button>
</Form>
