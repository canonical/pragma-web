import { describe, expect, it } from "vitest";
import { KEY } from "../src/constants.js";
import prepareStoryRender from "./prepareStoryRender.js";

describe("prepareStoryRender", () => {
  it("prepares a story of the middleware file, named after its export", () => {
    const { story, context } = prepareStoryRender({}, "RESTOptions");
    expect(story.id).toBe("middleware--rest-options");
    expect(context.id).toBe("middleware--rest-options");
    expect(context.globals).toEqual({ [KEY]: true });
  });

  it("runs the project's, the meta's and the story's loaders, in that order", async () => {
    const order: string[] = [];
    const { story, context } = prepareStoryRender(
      {
        loaders: [
          async () => {
            order.push("project");
          },
        ],
      },
      "Loading",
      {
        loaders: [
          async () => {
            order.push("story");
          },
        ],
      },
      [
        async () => {
          order.push("meta");
        },
      ],
    );
    await story.applyLoaders(context);
    expect(order).toEqual(["project", "meta", "story"]);
  });

  it("gives the render a signal its controller aborts", () => {
    const { context, render } = prepareStoryRender({}, "Default");
    render.abort();
    expect(context.abortSignal.aborted).toBe(true);
  });
});
