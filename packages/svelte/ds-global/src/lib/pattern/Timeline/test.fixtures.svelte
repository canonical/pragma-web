<script lang="ts" module>
  import { Content, Event } from "./common/index.js";

  export {
    actorEvent,
    conditionalEvents,
    contentWithTestId,
    criticalityEvent,
    datetimeEvent,
    errorEvent,
    eventWithTestId,
    orderedEvent,
    singleEvent,
    snippetMetadataEvent,
    twoEvents,
    twoPeopleEvents,
  };
</script>

{#snippet twoEvents()}
  <Content>
    <Event>Event 1</Event>
    <Event>Event 2</Event>
  </Content>
{/snippet}

{#snippet singleEvent()}
  <Content>
    <Event>Event</Event>
  </Content>
{/snippet}

{#snippet contentWithTestId()}
  <Content data-testid="content">
    <Event>Event</Event>
  </Content>
{/snippet}

{#snippet eventWithTestId()}
  <Content>
    <Event data-testid="event">Event</Event>
  </Content>
{/snippet}

{#snippet actorEvent()}
  <Content>
    <Event actor="John Doe">Did something</Event>
  </Content>
{/snippet}

{#snippet datetimeEvent()}
  <Content>
    <Event datetime="2024-01-15">Event</Event>
  </Content>
{/snippet}

{#snippet criticalityEvent()}
  <Content>
    <Event data-testid="event" criticality="warning">Warning event</Event>
  </Content>
{/snippet}

{#snippet orderedEvent()}
  <Content>
    <Event data-testid="event" actor="Actor" datetime="2024-01-01">
      Payload
    </Event>
  </Content>
{/snippet}

{#snippet actorSnippet()}<strong>Snippet actor</strong>{/snippet}
{#snippet datetimeSnippet()}<span>Snippet time</span>{/snippet}

{#snippet snippetMetadataEvent()}
  <Content>
    <Event actor={actorSnippet} datetime={datetimeSnippet}>Payload</Event>
  </Content>
{/snippet}

{#snippet conditionalEvents()}
  <Content data-testid="content">
    <Event>Event 1</Event>
    {#if false}
      <Event>Event 2</Event>
    {/if}
  </Content>
{/snippet}

{#snippet twoPeopleEvents()}
  <Content>
    <Event actor="John" datetime="2024-01-15">Created document</Event>
    <Event actor="Jane" datetime="2024-01-16">Approved document</Event>
  </Content>
{/snippet}

{#snippet errorEvent()}
  <Content>
    <Event criticality="error">Error event</Event>
  </Content>
{/snippet}
