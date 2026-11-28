<script lang="ts">
  import { TooltipEngine } from "@canonical/svelte-ds-global";
  import type { ThumbnailProps } from "./types.js";

  let { url }: ThumbnailProps = $props();
</script>

<!--
  The preview is the whole image, uncropped. Decorative, like the thumbnail it
  enlarges: the file name on the tile already names the file. It reads the
  same object URL as the thumbnail.
-->
{#if url}<TooltipEngine class="thumbnail-preview" messageElementClass="file-upload-preview">{#snippet message()}<img src={url} alt="" />{/snippet}<span class="thumbnail"><img src={url} alt="" /></span></TooltipEngine>{:else}<span class="thumbnail"></span>{/if}

<!-- @component
A file's image thumbnail: the 60×36 box, filled edge to edge by the image.
Hovering it shows the whole image in a tooltip, since the thumbnail crops it
to fill its box. The preview reuses the thumbnail's object URL, and appears
only once that URL exists.

The images are decorative: the file name on the tile already names the file.
The thumbnail takes no keyboard focus: the preview only enlarges a decorative
image, and a stop on every image tile would slow keyboard movement through the
list.
-->
