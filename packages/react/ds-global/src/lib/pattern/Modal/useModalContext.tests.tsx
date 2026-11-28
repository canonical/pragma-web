import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Modal, useModalContext } from "../../../index.js";

/** Reads the shared modal API and renders the title id it carries. */
const ContextConsumer = () => {
  const { titleId } = useModalContext();
  return <span data-testid="title-id">{titleId}</span>;
};

describe("useModalContext", () => {
  it("is exported from the package entry", () => {
    expect(useModalContext).toBeTypeOf("function");
  });

  it("reads the modal context from inside a Modal", () => {
    render(
      <Modal ref={createRef<HTMLDialogElement>()}>
        <Modal.Header>Title</Modal.Header>
        <ContextConsumer />
      </Modal>,
    );

    const titleId = screen.getByTestId("title-id").textContent;
    expect(titleId).toBeTruthy();
    expect(document.getElementById(titleId ?? "")).toHaveTextContent("Title");
  });
});
