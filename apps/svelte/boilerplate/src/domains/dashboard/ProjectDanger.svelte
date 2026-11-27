<script lang="ts">
  import { Modal } from "@canonical/svelte-ds-global";
  import { localeSource, translator } from "../../i18n";
  const locale = localeSource();
  let t = $derived(translator($locale));
  let open = $state(false);
  let completed = $state(false);
  let opener = $state<HTMLAnchorElement>();
  function show(event: MouseEvent) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    open = true;
  }
</script>
<section aria-labelledby="danger-title" class="danger-zone">
  <h2 id="danger-title">{t("dangerZone")}</h2>
  <p>{t("deleteProjectBody")}</p>
  {#if completed}<p role="status">{t("confirmedProject")}</p>{/if}
  <a bind:this={opener} href="/dashboard/settings/confirm" onclick={show}>{t("deleteProject")}</a>
</section>
<Modal bind:open onclose={() => opener?.focus()}>
  <Modal.Header closeButton={false}><h2>{t("confirmProject")}</h2></Modal.Header>
  <Modal.Content><p>{t("deleteProjectBody")}</p></Modal.Content>
  <Modal.Footer>
    <button type="button" onclick={() => open = false}>{t("cancel")}</button>
    <button type="button" onclick={() => { completed = true; open = false; }}>{t("deleteProject")}</button>
  </Modal.Footer>
</Modal>
