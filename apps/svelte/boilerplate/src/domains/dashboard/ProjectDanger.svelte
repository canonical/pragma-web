<script lang="ts">
  import { Button, Modal } from "@canonical/svelte-ds-global";
  import { getLocaleSource, getTranslator } from "../../i18n";

  const locale = getLocaleSource();
  let t = $derived(getTranslator($locale));
  let open = $state(false);
  let completed = $state(false);
  let openerRef = $state<HTMLAnchorElement>();
  function show(event: MouseEvent) {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    event.preventDefault();
    open = true;
  }
</script>
<section aria-labelledby="danger-title" class="danger-zone">
  <h2 id="danger-title">{t("dangerZone")}</h2>
  <p>{t("deleteProjectBody")}</p>
  {#if completed}<p role="status">{t("confirmedProject")}</p>{/if}
  <a bind:this={openerRef} href="/dashboard/settings/confirm" onclick={show}>{t("deleteProject")}</a>
</section>
<Modal bind:open onclose={() => openerRef?.focus()}>
  <Modal.Header closeButton={false}><h2>{t("confirmProject")}</h2></Modal.Header>
  <Modal.Content><p>{t("deleteProjectBody")}</p></Modal.Content>
  <Modal.Footer>
    <Button importance="tertiary" onclick={() => open = false}>{t("cancel")}</Button>
    <Button anticipation="destructive" onclick={() => { completed = true; open = false; }}>{t("deleteProject")}</Button>
  </Modal.Footer>
</Modal>
