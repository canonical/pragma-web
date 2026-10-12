import { Button, Card, Chip, Modal } from "@canonical/react-ds-global";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Field, Form } from "../../../index.js";
import "../../../index.css";
import "./SpacingGaps.css";

const meta = {
  title: "Spacing buckets/05 Gaps",
  parameters: { layout: "fullscreen" },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

type Box = {
  top: number;
  bottom: number;
  height: number;
  left: number;
  right: number;
};
const box = (element: Element): Box => {
  const r = element.getBoundingClientRect();
  return {
    top: r.top,
    bottom: r.bottom,
    height: r.height,
    left: r.left,
    right: r.right,
  };
};
const numeric = (value: string) => Number.parseFloat(value) || 0;

// A zero-size inline marker reads the browser's first actual line baseline.
// Prepending it also reads the first line of naturally wrapped public prose.
const baseline = (element: HTMLElement): number | null => {
  if (/flex|grid/.test(getComputedStyle(element).display)) return null;
  const before = box(element);
  const marker = document.createElement("span");
  marker.className = "gaps-baseline-marker";
  element.prepend(marker);
  const result = marker.getBoundingClientRect().top;
  const after = box(element);
  marker.remove();
  return Math.abs(before.height - after.height) < 0.05 ? result : null;
};

const childBaseline = (child: Element): number | null => {
  if (!(child instanceof HTMLElement)) return null;
  const text = child.matches("p, .p, .field-label")
    ? child
    : child.querySelector<HTMLElement>(".field-label, p, .p");
  return text ? baseline(text) : null;
};
const textLineCount = (child: Element): number | null => {
  if (!child.matches("p, .p, .field-label")) return null;
  const range = document.createRange();
  range.selectNodeContents(child);
  return new Set(
    Array.from(range.getClientRects())
      .filter((rect) => rect.height > 0)
      .map((rect) => Math.round(rect.top * 100) / 100),
  ).size;
};

const Measured = ({
  caption,
  children,
  owner,
  reference = false,
}: {
  caption: string;
  children: React.ReactNode;
  owner: string;
  reference?: boolean;
}) => {
  const root = useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = useState<Record<string, unknown> | null>(null);
  const [guides, setGuides] = useState<React.CSSProperties>();
  useEffect(() => {
    const host = root.current;
    if (!host) return;
    let cancelled = false;
    const measure = () => {
      if (cancelled) return;
      const first = host.querySelector<HTMLElement>(owner);
      if (!first) return;
      const hostBox = box(host);
      const firstBox = box(first);
      const row = host.closest<HTMLElement>(".gaps-row");
      const rowBox = row ? box(row) : hostBox;
      const text = first.matches("p")
        ? first
        : first.querySelector<HTMLElement>(".field-label, .label, p, .p");
      const firstBaseline = text ? baseline(text) : null;
      const owners = Array.from(
        host.querySelectorAll<HTMLElement>(
          ".form, .field, .payload, .range-control, .card, .card-header, .card-content, .card-footer, .modal-footer, [data-gap-owner]",
        ),
      );
      setMetrics({
        caption,
        measuredOwner: first.className,
        box: firstBox,
        firstBaseline,
        tierBaseline: getComputedStyle(first).getPropertyValue(
          "--ds-spacing-baseline",
        ),
        owners: owners.map((element) => {
          const style = getComputedStyle(element);
          const children = Array.from(element.children).filter(
            (child) => !child.matches(".gaps-baseline-marker"),
          );
          return {
            owner: element.className || element.getAttribute("data-gap-owner"),
            box: box(element),
            rowGap: style.rowGap,
            columnGap: style.columnGap,
            rows: style.gridTemplateRows,
            padding: [
              style.paddingBlockStart,
              style.paddingBlockEnd,
              style.paddingInlineStart,
              style.paddingInlineEnd,
            ],
            children: children.map((child) => {
              const cs = getComputedStyle(child);
              return {
                owner: child.className,
                box: box(child),
                margin: [cs.marginBlockStart, cs.marginBlockEnd],
                occupiedBlockSize:
                  box(child).height +
                  numeric(cs.marginBlockStart) +
                  numeric(cs.marginBlockEnd),
                padding: [cs.paddingBlockStart, cs.paddingBlockEnd],
                firstBaseline: childBaseline(child),
                textLineCount: textLineCount(child),
              };
            }),
            inlineVisualAdjacency: [...children]
              .sort((a, b) => box(a).left - box(b).left)
              .slice(1)
              .map((child, index) => {
                const previous = [...children].sort(
                  (a, b) => box(a).left - box(b).left,
                )[index];
                return box(child).left - box(previous).right;
              }),
            adjacent: children.slice(1).map((child, index) => ({
              blockDistance: box(child).top - box(children[index]).bottom,
              precedingPaddingEnd: getComputedStyle(children[index])
                .paddingBlockEnd,
              followingPaddingStart: getComputedStyle(child).paddingBlockStart,
              contentDistance:
                element.matches(".card") &&
                child.firstElementChild &&
                children[index].lastElementChild
                  ? box(child.firstElementChild).top -
                    box(children[index].lastElementChild).bottom
                  : null,
              firstBaselineSeparation:
                childBaseline(child) != null &&
                childBaseline(children[index]) != null
                  ? (childBaseline(child) as number) -
                    (childBaseline(children[index]) as number)
                  : null,
              inlineDistance: box(child).left - box(children[index]).right,
              precedingCompensation: numeric(
                getComputedStyle(children[index]).marginBlockEnd,
              ),
            })),
          };
        }),
      });
      setGuides({
        "--gaps-top": `${firstBox.top - hostBox.top}px`,
        "--gaps-end": `${firstBox.bottom - hostBox.top + numeric(getComputedStyle(first).marginBlockEnd)}px`,
        "--gaps-baseline": `${(firstBaseline ?? firstBox.top) - hostBox.top}px`,
        "--gaps-shared-left": `${rowBox.left - hostBox.left}px`,
        "--gaps-shared-width": `${row?.scrollWidth ?? hostBox.right - hostBox.left}px`,
      } as React.CSSProperties);
    };
    document.fonts.ready.then(() => requestAnimationFrame(measure));
    const observer = new ResizeObserver(measure);
    observer.observe(host);
    window.addEventListener("resize", measure);
    return () => {
      cancelled = true;
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [caption, owner]);
  return (
    <figure className="gaps-sample">
      <figcaption>{caption}</figcaption>
      <div
        ref={root}
        className="gaps-measure"
        style={guides}
        data-metrics={metrics ? JSON.stringify(metrics) : undefined}
      >
        {children}
        <span className="gaps-peer-guides" aria-hidden="true">
          <i className="gaps-top" />
          {metrics?.firstBaseline != null && <i className="gaps-baseline" />}
          <i className="gaps-end" />
        </span>
        {reference && (
          <span className="gaps-shared-guides" aria-hidden="true">
            <i className="gaps-top" />
            {metrics?.firstBaseline != null && <i className="gaps-baseline" />}
            <i className="gaps-end" />
          </span>
        )}
      </div>
    </figure>
  );
};

const Help = ({ lines }: { lines: 2 | 3 }) => (
  <>
    Keep this first line.
    <br />
    Read the next line.
    {lines === 3 && (
      <>
        <br />
        Then this third line.
      </>
    )}
  </>
);
const Unit = ({
  lines = 2,
  toggle = false,
}: {
  lines?: 2 | 3;
  toggle?: boolean;
}) => (
  <Form
    defaultValues={{ value: toggle ? true : "alpha", next: "beta" }}
    onSubmit={() => undefined}
  >
    {toggle ? (
      <Field
        name="value"
        inputType="checkbox"
        label="Enabled"
        description={<Help lines={lines} />}
      />
    ) : (
      <Field
        name="value"
        inputType="text"
        label="Name"
        description={<Help lines={lines} />}
      />
    )}
    <Field name="next" inputType="text" label="Following field" />
  </Form>
);

const ErrorUnit = ({ repetitions }: { repetitions: 2 | 3 }) => {
  const methods = useForm<Record<string, unknown>>({
    defaultValues: { value: "alpha", next: "beta" },
  });
  useEffect(() => {
    methods.setError("value", {
      type: "manual",
      message: "Please enter valid text. "
        .repeat(repetitions === 3 ? 4 : 2)
        .trim(),
    });
  }, [methods, repetitions]);
  return (
    <Form methods={methods} onSubmit={() => undefined}>
      <Field name="value" inputType="text" label="Name" />
      <Field name="next" inputType="text" label="Following field" />
    </Form>
  );
};

const Tier = ({ title, className }: { title: string; className: string }) => (
  <section className={`gaps-tier ${className} comfortable`}>
    <h2>{title}</h2>
    <h3>Item blocks</h3>
    <div className="gaps-row">
      <Measured
        caption="Field · two-line leading help"
        owner=".field"
        reference
      >
        <Unit />
      </Measured>
      <Measured caption="Field · three-line leading help" owner=".field">
        <Unit lines={3} />
      </Measured>
      <Measured caption="Error: two-line wrapped message" owner=".field">
        <ErrorUnit repetitions={2} />
      </Measured>
      <Measured caption="Error: three-line wrapped message" owner=".field">
        <ErrorUnit repetitions={3} />
      </Measured>
      <Measured caption="Select · leading help" owner=".field">
        <Form defaultValues={{ choice: "one" }} onSubmit={() => undefined}>
          <Field
            name="choice"
            inputType="select"
            label="Choice"
            description={<Help lines={2} />}
            options={[{ label: "One", value: "one" }]}
          />
        </Form>
      </Measured>
      <Measured
        caption="Toggle · current whole-unit phase; pending Density 08"
        owner=".field"
      >
        <Unit toggle />
      </Measured>
    </div>
    <h3>Complete groups</h3>
    <div className="gaps-row">
      <Measured caption="Paragraph group reference" owner="p" reference>
        <div data-gap-owner="paragraph-group" className="gaps-group">
          <p className="p">First unit.</p>
          <p className="p">Second unit.</p>
        </div>
      </Measured>
      <Measured caption="Form · complete field units" owner=".form">
        <Form
          defaultValues={{ first: "alpha", second: "beta" }}
          onSubmit={() => undefined}
        >
          <Field name="first" inputType="text" label="First field" />
          <Field name="second" inputType="text" label="Second field" />
        </Form>
      </Measured>
      <Measured
        caption="Card · current section insets; pending Surface 06"
        owner=".card"
      >
        <div className="gaps-card-grid">
          <Card>
            <Card.Header>
              <p className="p">Card title.</p>
            </Card.Header>
            <Card.Content>
              <p className="p">Card content.</p>
            </Card.Content>
            <Card.Footer>
              <Chip value="One" />
              <Chip value="Two" />
            </Card.Footer>
          </Card>
        </div>
      </Measured>
    </div>
    <h3>Page sections</h3>
    <div className="gaps-row">
      <Measured caption="Paragraph section reference" owner="p" reference>
        <div data-gap-owner="page-sections" className="gaps-sections">
          <p className="p">First section.</p>
          <p className="p">Second section.</p>
        </div>
      </Measured>
      <Measured caption="Page-owned form sections" owner=".form">
        <div data-gap-owner="page-sections" className="gaps-sections">
          <Form defaultValues={{ first: "alpha" }} onSubmit={() => undefined}>
            <Field name="first" inputType="text" label="First section" />
          </Form>
          <Form defaultValues={{ second: "beta" }} onSubmit={() => undefined}>
            <Field name="second" inputType="text" label="Second section" />
          </Form>
        </div>
      </Measured>
    </div>
    <h3>Inline items · current values, owner decision pending</h3>
    <div className="gaps-row">
      <Measured caption="Range · existing inline gap" owner=".field" reference>
        <Form defaultValues={{ volume: 50 }} onSubmit={() => undefined}>
          <Field
            name="volume"
            inputType="range"
            label="Volume"
            min={0}
            max={100}
          />
        </Form>
      </Measured>
      <Measured
        caption="Card footer · existing inline tag gap"
        owner=".card-footer"
      >
        <div className="gaps-card-grid">
          <Card>
            <Card.Footer>
              <Chip value="One" />
              <Chip value="Two" />
            </Card.Footer>
          </Card>
        </div>
      </Measured>
      <Measured
        caption="Modal footer · public action region"
        owner=".modal-footer"
      >
        <Modal.Footer>
          <Button>Cancel</Button>
          <Button>Apply</Button>
        </Modal.Footer>
      </Measured>
    </div>
  </section>
);

export const SiteDocsApp: Story = {
  render: () => (
    <main className="spacing-gaps">
      <h1>05 Gaps</h1>
      <p className="gaps-note">
        Container-owned block gaps. Red: block start / occupied end. Blue: first
        browser baseline. Help leads text/select controls and follows toggle
        controls, as shipped. Card section insets, Toggle whole-unit phase and
        inline item values remain current, pending the owner’s decision.
      </p>
      <Tier title="Site" className="site" />
      <Tier title="Docs" className="docs" />
      <Tier title="App" className="app" />
    </main>
  ),
};
