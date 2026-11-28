<script lang="ts">
  import { Button } from "@canonical/svelte-ds-global";
  import { Field, Form } from "@canonical/svelte-ds-global-form";
  import formatDocumentTitle from "../../formatDocumentTitle.js";
  import { createAppTranslator, getLocaleSource } from "../../i18n/index.js";
  import type { ContactErrors, ContactValues } from "./types.js";
  import { readContact, validateContact } from "./validateContact.js";

  let {
    form,
  }: {
    /** The action's answer, when the form posted without JavaScript. */
    form?: { values?: ContactValues; errors?: ContactErrors } | null;
  } = $props();

  const locale = getLocaleSource();
  const t = $derived(createAppTranslator($locale));
  // The action's answer seeds the errors; after hydration the page owns them.
  // svelte-ignore state_referenced_locally
  let errors = $state<ContactErrors>({ ...form?.errors });
  const subjects = $derived([
    { value: "general", label: t("contact.subjectGeneral") },
    { value: "support", label: t("contact.subjectSupport") },
    { value: "feedback", label: t("contact.subjectFeedback") },
  ]);

  /** Submitting logs the values, as the React app does; nothing is sent. */
  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    const values = readContact(
      new FormData(event.currentTarget as HTMLFormElement),
    );

    errors = validateContact(values);
    if (Object.keys(errors).length === 0) {
      console.log("Form submitted:", values);
    }
  }
</script>

<svelte:head><title>{formatDocumentTitle(t("contact.title"))}</title></svelte:head>

<section aria-labelledby="contact-title">
  <h1 id="contact-title">{t("contact.heading")}</h1>
  <Form method="post" onsubmit={handleSubmit}>
    <Field inputType="text" label={t("contact.name")} name="name" value={form?.values?.name} />
    <Field error={errors.email ? t(errors.email) : undefined} inputType="text" label={t("contact.email")} name="email" value={form?.values?.email} />
    <Field inputType="select" label={t("contact.subject")} name="subject" options={subjects} value={form?.values?.subject} />
    <Field description={t("contact.messageHint")} inputType="textarea" label={t("contact.message")} name="message" value={form?.values?.message} />
    <Button type="submit">{t("contact.send")}</Button>
  </Form>
</section>

<!-- @component
The contact form. Submitting validates the email and logs the values, as the
React app does; nothing is sent. Without JavaScript the form posts to the
page's action, which validates the same way and redisplays the values.
-->
