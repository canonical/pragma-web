<script lang="ts">
  import { Field, Form } from "../lib/pattern/index.js";
  import bindField from "../lib/utils/owner/bindField.js";
  import type { FormOwner } from "../lib/utils/owner/types.js";

  // A plain Form whose one field binds to an owner by hand.
  let { owner }: { owner: FormOwner<{ email: string }> } = $props();
</script>

<Form>
  <Field
    inputType="email"
    name="email"
    label="Email"
    bind:value={() => owner.values.email, (value) => owner.setValue("email", value)}
    {...bindField(owner, "email")}
  />
</Form>
