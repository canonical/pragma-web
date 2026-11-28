<script lang="ts">
  import type { ThumbnailProps } from "./types.js";

  let { url }: ThumbnailProps = $props();
</script>

<span class="thumbnail">{#if url}<img src={url} alt="" />{/if}</span>

<!-- @component
A file's image thumbnail: the 60×36 box, filled edge to edge by the image. The
image is decorative: the file name on the tile already names the file.
-->
