import { render, renderHook, screen } from "@testing-library/react";
import { type ReactNode, useContext } from "react";
import { describe, expect, it } from "vitest";
import Context from "./Context.js";
import Provider from "./Provider.js";
import type { QueryEntryInputProps } from "./types.js";

const addRole = (props: QueryEntryInputProps): QueryEntryInputProps => ({
  ...props,
  role: "combobox",
});

describe("QueryEntryProvider", () => {
  it("renders its children and nothing else", () => {
    const { container } = render(
      <Provider getInputProps={addRole}>
        <span>child</span>
      </Provider>,
    );
    expect(screen.getByText("child")).toBeInTheDocument();
    expect(container.innerHTML).toBe("<span>child</span>");
  });

  it("shares the host's props merger", () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <Provider getInputProps={addRole}>{children}</Provider>
    );
    const { result } = renderHook(() => useContext(Context), { wrapper });
    expect(result.current?.getInputProps({ value: "a" })).toEqual({
      value: "a",
      role: "combobox",
    });
  });
});
