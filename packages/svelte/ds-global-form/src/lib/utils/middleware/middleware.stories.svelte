<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { delay, http } from "msw";
  import * as decorators from "../../../storybook/decorators.js";
  import * as fixtures from "../../../storybook/fixtures.options.js";
  import RemoteOptionsField from "../../../storybook/RemoteOptionsField.svelte";
  import { Field } from "../../pattern/Field/index.js";
  import type { Option } from "../../subcomponent/types.js";
  import * as middleware from "./index.js";

  const { Story } = defineMeta({
    title: "utils/middleware",
    decorators: [decorators.form()],
    component: Field,
    parameters: {
      docs: {
        description: {
          component:
            "Read the source of the stories in `middleware.stories.svelte` for the full code patterns.",
        },
      },
    },
  });

  /** The response shape of the options endpoint used by these stories. */
  type OptionsResponse = { options: Option[] };

  const respondWithOptions = () =>
    Response.json({ options: fixtures.fruits } satisfies OptionsResponse);

  const respondWithValidation = async ({
    request,
  }: {
    request: Request;
  }): Promise<Response> => {
    const { value } = (await request.json()) as { value: string };
    if (value === "invalid") {
      return Response.json({ error: "Invalid value" }, { status: 400 });
    }
    return new Response(null, { status: 200 });
  };

  const readOptions = (data: OptionsResponse) => data.options;

  const readValidationError = async (response: Response) => {
    const data = (await response.json()) as { error: string };
    return data.error;
  };
</script>

<!-- Both helpers on one form: the select gets its options from an endpoint
through `createRemoteOptions`, and the text field is checked by an endpoint
once the user stops typing, through the `validateRemotely` attachment. The
attachment can be written inline: it re-runs only when a value it reads
changes, so it neither resets nor sends the request again on re-render. -->
<Story
  name="Default"
  args={{ name: "fruit", inputType: "select", options: [] }}
  parameters={{
    msw: {
      handlers: [
        http.get("/api/options", respondWithOptions),
        http.post("/api/validate", respondWithValidation),
      ],
    },
  }}
>
  {#snippet template()}
    <RemoteOptionsField
      name="fruit"
      label="Fruit"
      url="/api/options"
      transformData={readOptions}
    />
    <Field
      name="username"
      inputType="text"
      label="Username"
      description="Enter `invalid` to see the endpoint reject the value."
      {@attach middleware.validateRemotely("/api/validate", {
        errorExtractor: readValidationError,
      })}
    />
  {/snippet}
</Story>

<!-- The select gets its options from an endpoint. -->
<Story
  name="REST Options"
  args={{
    name: "optionsField",
    inputType: "select",
    label: "Fruit",
    options: [],
  }}
  parameters={{
    msw: {
      handlers: [http.get("/api/options", respondWithOptions)],
    },
  }}
>
  {#snippet template({ name, label })}
    <RemoteOptionsField
      {name}
      {label}
      url="/api/options"
      transformData={readOptions}
    />
  {/snippet}
</Story>

<!-- While the options load, the field keeps its markup, disabled and busy. -->
<Story
  name="REST Options Loading"
  args={{
    name: "optionsField",
    inputType: "select",
    label: "Fruit",
    options: [],
  }}
  parameters={{
    msw: {
      handlers: [
        http.get("/api/options", async () => {
          await delay("infinite");
          return respondWithOptions();
        }),
      ],
    },
  }}
>
  {#snippet template({ name, label })}
    <RemoteOptionsField
      {name}
      {label}
      url="/api/options"
      transformData={readOptions}
    />
  {/snippet}
</Story>

<!-- A failed request shows as the field's error. -->
<Story
  name="REST Options Failure"
  args={{
    name: "optionsField",
    inputType: "select",
    label: "Fruit",
    options: [],
  }}
  parameters={{
    msw: {
      handlers: [
        http.get("/api/options", () => new Response(null, { status: 500 })),
      ],
    },
  }}
>
  {#snippet template({ name, label })}
    <RemoteOptionsField
      {name}
      {label}
      url="/api/options"
      transformData={readOptions}
    />
  {/snippet}
</Story>

<!-- The text field is checked by an endpoint once the user stops typing. -->
<Story
  name="REST Validation"
  args={{
    name: "validationField",
    inputType: "text",
    label: "Username",
    description:
      "If the value entered equals the string `invalid`, the back-end validation should fail.",
  }}
  parameters={{
    msw: {
      handlers: [http.post("/api/validate", respondWithValidation)],
    },
  }}
>
  {#snippet template({ name, label, description })}
    <Field
      {name}
      inputType="text"
      {label}
      {description}
      {@attach middleware.validateRemotely("/api/validate", {
        errorExtractor: readValidationError,
      })}
    />
  {/snippet}
</Story>
