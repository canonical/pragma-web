<script lang="ts">
  import splitChromeProps from "../../common/splitChromeProps.js";
  import Wrapper from "../../common/Wrapper/Wrapper.svelte";
  import { FileUploadInput } from "../../subcomponent/FileUploadInput/index.js";
  import type { FileUploadInputProps } from "../../subcomponent/FileUploadInput/types.js";
  import type { FileUploadFieldProps } from "./types.js";
  import validateFileConstraints from "./validateFileConstraints.js";

  let { value = $bindable(), ...props }: FileUploadFieldProps = $props();

  const { chrome, control } = $derived(splitChromeProps(props));
  // `maxFiles`/`maxSize` violations surface as the field error unless the
  // caller supplies one.
  const error = $derived(
    chrome.error ??
      validateFileConstraints(value ?? [], control.maxFiles, control.maxSize),
  );
</script>

<Wrapper {...chrome} onhide={() => (value = undefined)} {error}>{#snippet children(controlProps)}<FileUploadInput {...controlProps} {...(control as FileUploadInputProps)} required={controlProps.required} name={chrome.name} bind:files={value} />{/snippet}</Wrapper>

<!-- @component
FileUploadInput wrapped with field chrome. `maxFiles`/`maxSize` are checked
against the selection and reported as the field error. Bind `value` to the
selected files.

`import { FileUploadField } from "@canonical/svelte-ds-global-form";`

@implements ds:global.component.file_upload_field
-->
