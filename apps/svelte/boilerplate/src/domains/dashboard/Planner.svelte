<script lang="ts">
  import { Button } from "@canonical/svelte-ds-global";
  import {
    createFormState,
    Field,
    Form,
  } from "@canonical/svelte-ds-global-form";
  import { untrack } from "svelte";
  import { getLocaleSource, getTranslator } from "../../i18n";
  import { phoneCountryCodes } from "./constants";
  import { readPhone } from "./phone";

  let { project }: { project: string } = $props();
  const locale = getLocaleSource();
  let t = $derived(getTranslator($locale));
  // The preview reads the owner's values as the user types; a valid submit posts the GET form natively.
  const planner = createFormState({
    defaultValues: { project: untrack(() => project) },
  });
  let phone = $state("");
  let phoneIssue = $state(false);
  // With JavaScript the preview is decoded in the browser; without it the form posts to the phone action.
  function previewPhone(
    event: SubmitEvent & { currentTarget: HTMLFormElement },
  ) {
    event.preventDefault();
    const result = readPhone(new FormData(event.currentTarget));
    phoneIssue = !result;
    phone = result ?? "";
  }
</script>
<svelte:head><title>{t("planner")} | {t("brand")}</title></svelte:head>
<h1>{t("planner")}</h1>
<p>{t("plannerDemo")}</p>
<Form method="GET" owner={planner}>
  <Field inputType="text" id="planner-project" name="project" label={t("projectName")} isOptional maxlength={100} />
  <Button type="submit">{t("preview")}</Button>
</Form>
<p>{t("projectPreview", { name: String(planner.values.project ?? "") || "—" })}</p>
<section aria-labelledby="phone-example">
  <h2 id="phone-example">{t("phoneExample")}</h2>
  <Form method="POST" action="/dashboard/phone" novalidate onsubmit={previewPhone} oninput={() => { phoneIssue = false; }}>
    <Field inputType="phone" id="preview-phone" name="number" label={t("phoneNumber")} countryLabel={t("phoneCountry")} patternTitle={t("phoneHint")} filteredCountries={phoneCountryCodes} error={phoneIssue ? t("phoneInvalid") : undefined} />
    <Button type="submit">{t("phoneSubmit")}</Button>
  </Form>
  {#if phone}<p role="status">{t("phonePreview", { phone })}</p>{/if}
</section>
