import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import renderWithProviders from "../../testing/renderWithProviders.js";
import LoadingMessage from "./LoadingMessage.js";

describe("LoadingMessage", () => {
  it("renders the loading text in the active locale", () => {
    renderWithProviders(<LoadingMessage />, "/", "fr");

    expect(screen.getByText("Chargement…")).toBeInTheDocument();
  });
});
