<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { Timeline } from "./index.js";

  /**
   * The timeline component establishes a clear order of operations. It is a
   * structural UI block used to represent a chronological list of events,
   * actions, or milestones in a vertical sequence.
   */
  const { Story } = defineMeta({
    title: "_work_in_progress/pattern/Timeline",
    component: Timeline,
    tags: ["autodocs"],
    argTypes: {
      children: { control: false },
    },
  });
</script>

<!-- Default timeline with multiple events showing actor, datetime, and description. -->
<Story name="Default">
  {#snippet template({ children: _, ...args })}
    <Timeline {...args}>
      <Timeline.Content>
        <Timeline.Event actor="John Doe" datetime="January 15, 2024">
          Created the initial document draft
        </Timeline.Event>
        <Timeline.Event actor="Jane Smith" datetime="January 16, 2024">
          Reviewed and added comments
        </Timeline.Event>
        <Timeline.Event actor="John Doe" datetime="January 17, 2024">
          Addressed feedback and updated content
        </Timeline.Event>
        <Timeline.Event actor="Jane Smith" datetime="January 18, 2024">
          Approved the final version
        </Timeline.Event>
      </Timeline.Content>
    </Timeline>
  {/snippet}
</Story>

<!-- Timeline events with criticality levels for status indication. -->
<Story name="WithCriticality">
  {#snippet template({ children: _, ...args })}
    <Timeline {...args}>
      <Timeline.Content>
        <Timeline.Event
          actor="System"
          datetime="10:00 AM"
          criticality="information"
        >
          Deployment started
        </Timeline.Event>
        <Timeline.Event
          actor="System"
          datetime="10:05 AM"
          criticality="success"
        >
          Build completed successfully
        </Timeline.Event>
        <Timeline.Event
          actor="System"
          datetime="10:10 AM"
          criticality="warning"
        >
          Performance degradation detected
        </Timeline.Event>
        <Timeline.Event actor="System" datetime="10:15 AM" criticality="error">
          Service unavailable - rollback initiated
        </Timeline.Event>
      </Timeline.Content>
    </Timeline>
  {/snippet}
</Story>

<!-- Minimal timeline events without actor or datetime metadata. -->
<Story name="MinimalEvents">
  {#snippet template({ children: _, ...args })}
    <Timeline {...args}>
      <Timeline.Content>
        <Timeline.Event>First event happened</Timeline.Event>
        <Timeline.Event>Second event occurred</Timeline.Event>
        <Timeline.Event>Third event completed</Timeline.Event>
      </Timeline.Content>
    </Timeline>
  {/snippet}
</Story>

<!-- Timeline events with datetime but no actor. -->
<Story name="WithDatetimeOnly">
  {#snippet template({ children: _, ...args })}
    <Timeline {...args}>
      <Timeline.Content>
        <Timeline.Event datetime="9:00 AM">Morning standup</Timeline.Event>
        <Timeline.Event datetime="12:00 PM">Lunch break</Timeline.Event>
        <Timeline.Event datetime="2:00 PM">Code review</Timeline.Event>
        <Timeline.Event datetime="5:00 PM">End of day wrap-up</Timeline.Event>
      </Timeline.Content>
    </Timeline>
  {/snippet}
</Story>

<!-- Timeline with a single event. -->
<Story name="SingleEvent">
  {#snippet template({ children: _, ...args })}
    <Timeline {...args}>
      <Timeline.Content>
        <Timeline.Event actor="Admin" datetime="Today">
          Account created
        </Timeline.Event>
      </Timeline.Content>
    </Timeline>
  {/snippet}
</Story>
