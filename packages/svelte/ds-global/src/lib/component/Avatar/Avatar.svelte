<script lang="ts">
  import { UserIcon } from "@canonical/svelte-icons";
  import { getInitials } from "./getInitials.js";
  import type { AvatarProps } from "./types.js";
  import "./styles.css";

  const componentCssClassName = "ds avatar";
  const {
    class: classProp,
    name: nameProp,
    src,
    size = "small",
    imageAttributes,
    ...rest
  }: AvatarProps = $props();

  const className = $derived([componentCssClassName, size, classProp]);
  const name = $derived(nameProp?.trim() || null);
  const initials = $derived(name ? getInitials(name) : null);

  let failedSrc = $state<string>();
  const imageError = $derived(src !== undefined && failedSrc === src);
</script>

{#if src && !imageError}
  <img
    class={className}
    {src}
    title={name || undefined}
    data-initials={initials}
    onerror={() => (failedSrc = src)}
    {...rest}
    {...imageAttributes}
  />
{:else if name}
  <abbr class={className} title={name} {...rest}>
    <span class="initials">{initials}</span>
  </abbr>
{:else}
  <div class={className} {...rest}>
    <UserIcon />
  </div>
{/if}

<!-- @component
`Avatar` A component that displays an image or initials avatar.

The avatar will display the image if available and able to be loaded, otherwise it will display the first two initials. If neither is available, it will display a default icon placeholder.

In case JavaScript is disabled, and the image at `src` fails to load, the component will provide a fallback: displaying the initials when `name` is provided, or `?` when it is not.

## Example Usage
```svelte
<Avatar name="John Doe" src="https://example.com/avatar.png" />
```

`<img>`-specific attributes (such as `alt` or `loading`) can be passed via `imageAttributes`.
They only take effect when the avatar renders as an image.

```svelte
<Avatar
  name="John Doe"
  src="https://example.com/avatar.png"
  imageAttributes={{ alt: "John Doe's avatar", loading: "lazy" }}
/>
```

@implements ds:global.component.avatar
-->
