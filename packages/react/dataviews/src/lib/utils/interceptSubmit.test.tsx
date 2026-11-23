import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import interceptSubmit from "./interceptSubmit.js";

describe("interceptSubmit", () => {
  it("cancels the form's own submission", () => {
    render(
      <form aria-label="Search" method="get" onSubmit={interceptSubmit} />,
    );
    const submitted = fireEvent.submit(screen.getByRole("form"));
    expect(submitted).toBe(false);
  });
});
