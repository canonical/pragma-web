<script lang="ts">
  import { FileUploadField } from "../lib/component/FileUploadField/index.js";
  import type { FileUploadFieldProps } from "../lib/component/FileUploadField/types.js";

  // A plain form around a file upload field, with a submit button. It records
  // each submit that gets through instead of posting.
  let {
    value = $bindable(),
    novalidate = false,
    onsubmit,
    ...props
  }: FileUploadFieldProps & {
    novalidate?: boolean;
    onsubmit?: (event: SubmitEvent) => void;
  } = $props();
</script>

<form
  {novalidate}
  onsubmit={(event) => {
    event.preventDefault();
    onsubmit?.(event);
  }}
>
  <FileUploadField {...props} bind:value />
  <button type="submit">Submit</button>
</form>
