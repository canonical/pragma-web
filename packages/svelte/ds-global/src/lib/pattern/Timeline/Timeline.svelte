<script lang="ts">
  import type { TimelineProps } from "./types.js";
  import "./styles.css";

  const componentCssClassName = "ds timeline";

  const { class: className, children, ...rest }: TimelineProps = $props();
</script>

<div class={[componentCssClassName, className]} {...rest}>
  {@render children()}
</div>

<!-- @component
The timeline component establishes a clear order of operations. It is a
structural UI block used to represent a chronological list of events,
actions, or milestones in a vertical sequence. It serves as a visual
narrative, allowing users to track progress, audit history, or understand
the relationship between time and specific activities at a glance. Each
event can include a dateTime, actor, description, and other custom content.

`import { Timeline } from "@canonical/svelte-ds-global";`

## Example Usage
```svelte
<Timeline>
  <Timeline.Content>
    <Timeline.Event actor="John Doe" datetime="January 15, 2024">
      Created the initial document draft
    </Timeline.Event>
  </Timeline.Content>
</Timeline>
```

@implements ds:global.pattern.timeline
-->
