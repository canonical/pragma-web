import { createLocaleSource } from "@canonical/i18n-core";
import { render, screen } from "@testing-library/react";
import { useContext } from "react";
import { describe, expect, it } from "vitest";
import {
  effectsOff,
  emptyCatalogs,
  localeConfig,
} from "../../../testing/fixtures.js";
import Context from "./Context.js";

function ShowDefaultLocale(): React.ReactElement {
  const value = useContext(Context);
  return <span>{value === null ? "none" : value.config.defaultLocale}</span>;
}

describe("Context", () => {
  it("holds no value outside a provider", () => {
    render(<ShowDefaultLocale />);
    expect(screen.getByText("none")).toBeTruthy();
  });

  it("carries the value its provider gives it", () => {
    const value = {
      source: createLocaleSource(localeConfig, effectsOff),
      config: localeConfig,
      catalogs: emptyCatalogs,
    };
    render(
      <Context.Provider value={value}>
        <ShowDefaultLocale />
      </Context.Provider>,
    );
    expect(screen.getByText("en")).toBeTruthy();
  });
});
