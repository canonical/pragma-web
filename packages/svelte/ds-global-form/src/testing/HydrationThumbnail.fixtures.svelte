<script lang="ts">
  import { FileUploadInput } from "../lib/subcomponent/FileUploadInput/index.js";

  let files = $state([new File(["x"], "photo.png", { type: "image/png" })]);
</script>

<FileUploadInput multiple bind:files />
