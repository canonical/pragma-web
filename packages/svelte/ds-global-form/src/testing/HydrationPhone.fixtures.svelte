<script lang="ts">
  import { PhoneInput } from "../lib/subcomponent/PhoneInput/index.js";

  let country = $state("+15551234");
  let number = $state("+15551234");
</script>

<PhoneInput id="country" name="country" filteredCountries={["US", "GB"]} bind:value={country} />
<PhoneInput id="number" name="number" filteredCountries={["US", "GB"]} bind:value={number} />
<output>{JSON.stringify({ country, number })}</output>
