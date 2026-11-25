import { act, screen, waitFor } from "@testing-library/react";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithForm } from "../../../testing/renderWithForm.js";
import { SelectField } from "../../component/SelectField/index.js";
import type { Option } from "../../subcomponent/types.js";
import addRESTFieldOptions from "./addRESTOptions.js";

const apple: Option = { value: "apple", label: "Apple" };
const banana: Option = { value: "banana", label: "Banana" };
const fruits: Option[] = [apple, banana];

/** A fetch call the test settles by hand. */
type PendingRequest = {
  url: string;
  init: RequestInit;
  resolve: (response: Response) => void;
  reject: (reason: unknown) => void;
};

let requests: PendingRequest[];

const fetchMock = vi.fn(
  (url: string, init: RequestInit) =>
    new Promise<Response>((resolve, reject) => {
      requests.push({ url, init, resolve, reject });
    }),
);

const getRequest = (index: number): PendingRequest => {
  const request = requests.at(index);
  if (!request) throw new Error(`No request at index ${index}`);
  return request;
};

const settleRequest = async (index: number, settle: () => void) => {
  await act(async () => {
    settle();
  });
  // Let the response body resolve and the state update commit.
  await act(async () => {});
  return getRequest(index);
};

const respondWith = (index: number, body: unknown, status = 200) =>
  settleRequest(index, () =>
    getRequest(index).resolve(Response.json(body, { status })),
  );

/** Sets an error on a field when it mounts, as a form rule would. */
const ErrorSetter = ({ name, message }: { name: string; message: string }) => {
  const { setError } = useFormContext();
  useEffect(() => {
    setError(name, { type: "required", message });
  }, [name, message, setError]);
  return null;
};

const renderSelect = (
  middleware: ReturnType<typeof addRESTFieldOptions>,
  props: { disabled?: boolean } = {},
) =>
  renderWithForm(
    <SelectField
      name="fruit"
      label="Fruit"
      options={[]}
      middleware={[middleware]}
      {...props}
    />,
  );

beforeEach(() => {
  requests = [];
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  fetchMock.mockClear();
  vi.unstubAllGlobals();
});

describe("addRESTFieldOptions", () => {
  describe("while loading", () => {
    it("renders the field disabled, busy and without options", () => {
      const { container } = renderSelect(addRESTFieldOptions("/api/fruits"));
      const select = screen.getByRole("combobox", { name: "Fruit" });
      expect(select).toBeDisabled();
      expect(select).toHaveAttribute("aria-busy", "true");
      expect(screen.queryAllByRole("option")).toHaveLength(0);
      expect(container.querySelector(".ds.field")).toContainElement(select);
      expect(screen.queryByText(/Loading/)).not.toBeInTheDocument();
    });

    it("requests the URL with the given method and headers", () => {
      renderSelect(
        addRESTFieldOptions("/api/fruits", {
          method: "POST",
          headers: { Accept: "application/json" },
        }),
      );
      const request = getRequest(0);
      expect(request.url).toBe("/api/fruits");
      expect(request.init.method).toBe("POST");
      expect(request.init.headers).toEqual({ Accept: "application/json" });
      expect(request.init.signal).toBeInstanceOf(AbortSignal);
    });

    it("defaults to a GET without headers", () => {
      renderSelect(addRESTFieldOptions("/api/fruits"));
      expect(getRequest(0).init.method).toBe("GET");
      expect(getRequest(0).init.headers).toEqual({});
    });
  });

  describe("on success", () => {
    it("renders the fetched options in an enabled field", async () => {
      renderSelect(addRESTFieldOptions("/api/fruits"));
      await respondWith(0, fruits);
      const select = screen.getByRole("combobox", { name: "Fruit" });
      expect(select).toBeEnabled();
      expect(select).not.toHaveAttribute("aria-busy");
      expect(
        screen.getAllByRole("option").map((option) => option.textContent),
      ).toEqual(["Apple", "Banana"]);
    });

    it("transforms the response body with transformData", async () => {
      renderSelect(
        addRESTFieldOptions("/api/fruits", {
          transformData: (data: { items: Option[] }) => data.items,
        }),
      );
      await respondWith(0, { items: fruits });
      expect(screen.getAllByRole("option")).toHaveLength(2);
    });

    it("keeps a field the consumer disabled disabled", async () => {
      renderSelect(addRESTFieldOptions("/api/fruits"), { disabled: true });
      await respondWith(0, fruits);
      expect(screen.getByRole("combobox", { name: "Fruit" })).toBeDisabled();
    });

    it("leaves an error it did not set in place", async () => {
      renderWithForm(
        <>
          <SelectField
            name="fruit"
            label="Fruit"
            options={[]}
            middleware={[addRESTFieldOptions("/api/fruits")]}
          />
          <ErrorSetter name="fruit" message="Pick a fruit" />
        </>,
      );
      await respondWith(0, fruits);
      expect(screen.getByRole("alert")).toHaveTextContent("Pick a fruit");
    });
  });

  describe("on failure", () => {
    it("shows a failed response as the field's error", async () => {
      const { container } = renderSelect(addRESTFieldOptions("/api/fruits"));
      await respondWith(0, {}, 500);
      const select = screen.getByRole("combobox", { name: "Fruit" });
      expect(select).toBeEnabled();
      expect(select).not.toHaveAttribute("aria-busy");
      expect(select).toHaveAttribute("aria-invalid", "true");
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Failed to fetch options",
      );
      expect(container.querySelector(".ds.field")).toHaveClass("danger");
      expect(screen.queryByText(/^Error:/)).not.toBeInTheDocument();
    });

    it("shows a network error's message as the field's error", async () => {
      renderSelect(addRESTFieldOptions("/api/fruits"));
      await settleRequest(0, () =>
        getRequest(0).reject(new TypeError("Network down")),
      );
      expect(screen.getByRole("alert")).toHaveTextContent("Network down");
    });

    it("shows a thrown non-error value as the field's error", async () => {
      renderSelect(
        addRESTFieldOptions("/api/fruits", {
          transformData: () => {
            throw "Unreadable options";
          },
        }),
      );
      await respondWith(0, fruits);
      expect(screen.getByRole("alert")).toHaveTextContent("Unreadable options");
    });
  });

  describe("cancellation", () => {
    it("aborts the request when the field unmounts", async () => {
      const { unmount } = renderSelect(addRESTFieldOptions("/api/fruits"));
      const { init } = getRequest(0);
      unmount();
      expect(init.signal?.aborted).toBe(true);
      // A late answer is ignored rather than updating an unmounted field.
      await respondWith(0, fruits);
    });

    it("refetches when the URL changes and ignores the stale answer", async () => {
      const { rerender } = renderSelect(addRESTFieldOptions("/api/a"));
      rerender(
        <SelectField
          name="fruit"
          label="Fruit"
          options={[]}
          middleware={[addRESTFieldOptions("/api/b")]}
        />,
      );
      expect(requests.map((request) => request.url)).toEqual([
        "/api/a",
        "/api/b",
      ]);
      expect(getRequest(0).init.signal?.aborted).toBe(true);

      await respondWith(1, [banana]);
      await respondWith(0, [apple]);
      expect(
        screen.getAllByRole("option").map((option) => option.textContent),
      ).toEqual(["Banana"]);
    });

    it("ignores a stale failure", async () => {
      const { rerender } = renderSelect(addRESTFieldOptions("/api/a"));
      rerender(
        <SelectField
          name="fruit"
          label="Fruit"
          options={[]}
          middleware={[addRESTFieldOptions("/api/b")]}
        />,
      );
      await respondWith(1, fruits);
      await settleRequest(0, () => getRequest(0).reject(new Error("Aborted")));
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("clears its own error once a new URL succeeds", async () => {
      const { rerender } = renderSelect(addRESTFieldOptions("/api/a"));
      await respondWith(0, {}, 500);
      expect(screen.getByRole("alert")).toBeInTheDocument();

      rerender(
        <SelectField
          name="fruit"
          label="Fruit"
          options={[]}
          middleware={[addRESTFieldOptions("/api/b")]}
        />,
      );
      await respondWith(1, fruits);
      await waitFor(() => {
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      });
    });
  });
});
