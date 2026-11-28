<!-- Ported from @canonical/react-ds-app storybook/navigation/CanonicalLogo -->

<!--
@component
Canonical logo placeholder for story brand slots: a portrait brand-orange
rectangle that fills the header's brand column, with the circle-of-friends
mark inside it. Story-only.
-->

<script lang="ts">
  import "./CanonicalLogo.css";

  interface Props {
    href?: string;
  }

  let { href = "/" }: Props = $props();
</script>

<a class="ds canonical-logo" {href} aria-label="Home">
	<img
		src="https://assets.ubuntu.com/v1/82818827-CoF_white.svg"
		alt="Canonical"
		class="mark"
	/>
</a>
