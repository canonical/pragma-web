import type { Meta, StoryObj } from "@storybook/react-vite";
import { delay, http } from "msw";
import * as decorators from "storybook/decorators.js";
import * as fixtures from "storybook/fixtures.options.js";
import { Field } from "../../pattern/Field/index.js";
import type { Option } from "../../subcomponent/types.js";
import * as middleware from "./index.js";

const meta = {
  title: "utils/middleware",
  decorators: [decorators.form()],
  component: Field,
  parameters: {
    docs: {
      description: {
        component:
          "Read the source of the stories in `middleware.stories.tsx` for the full code patterns.",
      },
    },
  },
} satisfies Meta<typeof Field>;

export default meta;

type Story = StoryObj<typeof meta>;

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

const fruitOptions = middleware.addRESTOptions("/api/options", {
  transformData: readOptions,
});

const usernameValidation = middleware.addRESTValidation("/api/validate", {
  errorExtractor: async (response) => {
    const data = (await response.json()) as { error: string };
    return data.error;
  },
});

/**
 * Both middleware on one form: the select gets its options from an endpoint,
 * and the text field is checked by an endpoint once the user stops typing.
 */
export const Default: Story = {
  args: { name: "fruit", inputType: "select", options: [] },
  render: () => (
    <>
      <Field
        name="fruit"
        inputType="select"
        label="Fruit"
        options={[]}
        middleware={[fruitOptions]}
      />
      <Field
        name="username"
        inputType="text"
        label="Username"
        description="Enter `invalid` to see the endpoint reject the value."
        middleware={[usernameValidation]}
      />
    </>
  ),
  parameters: {
    msw: {
      handlers: [
        http.get("/api/options", respondWithOptions),
        http.post("/api/validate", respondWithValidation),
      ],
    },
  },
};

// Story for addRESTOptions middleware
export const RESTOptions: Story = {
  args: {
    name: "optionsField",
    inputType: "select",
    options: [],
    middleware: [fruitOptions],
  },
  parameters: {
    msw: {
      handlers: [http.get("/api/options", respondWithOptions)],
    },
  },
};

/** While the options load, the field keeps its markup, disabled and busy. */
export const RESTOptionsLoading: Story = {
  args: {
    name: "optionsField",
    inputType: "select",
    label: "Fruit",
    options: [],
    middleware: [fruitOptions],
  },
  parameters: {
    msw: {
      handlers: [
        http.get("/api/options", async () => {
          await delay("infinite");
          return respondWithOptions();
        }),
      ],
    },
  },
};

/** A failed request shows as the field's error. */
export const RESTOptionsFailure: Story = {
  args: {
    name: "optionsField",
    inputType: "select",
    label: "Fruit",
    options: [],
    middleware: [fruitOptions],
  },
  parameters: {
    msw: {
      handlers: [
        http.get("/api/options", () => new Response(null, { status: 500 })),
      ],
    },
  },
};

// Story for addRESTValidation middleware
export const RESTValidation: Story = {
  args: {
    name: "validationField",
    inputType: "text",
    description:
      "If the value entered equals the string `invalid`, the back-end validation should fail.",
    middleware: [middleware.addRESTValidation("/api/validate")],
  },
  parameters: {
    msw: {
      handlers: [http.post("/api/validate", respondWithValidation)],
    },
  },
};
