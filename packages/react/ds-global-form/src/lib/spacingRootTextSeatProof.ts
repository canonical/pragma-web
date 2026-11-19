/** Assert settled layout diagnostics inside the current story canvas. */
export async function assertRootTextSeats(
  canvas: HTMLElement,
  expectedCount: number,
): Promise<void> {
  canvas.dataset.rootTextSeatPlay = "pending";
  await canvas.ownerDocument.fonts.ready;
  const view = canvas.ownerDocument.defaultView;
  if (!view) throw new Error("The story canvas has no window");
  const deadline = Date.now() + 10000;
  let owners: HTMLElement[] = [];
  while (Date.now() < deadline) {
    await new Promise<void>((resolve) =>
      view.requestAnimationFrame(() =>
        view.requestAnimationFrame(() => resolve()),
      ),
    );
    owners = [
      ...canvas.querySelectorAll<HTMLElement>("[data-root-text-seat-proof]"),
    ];
    if (
      owners.length === expectedCount &&
      owners.every((owner) => owner.dataset.rootTextSeatProof === "pass")
    ) {
      canvas.dataset.rootTextSeatPlay = "pass";
      return;
    }
  }
  canvas.dataset.rootTextSeatPlay = "error";
  if (owners.length !== expectedCount) {
    throw new Error(
      `Expected ${expectedCount} text-seat owners, found ${owners.length}`,
    );
  }
  const failures = owners.filter(
    (owner) => owner.dataset.rootTextSeatProof !== "pass",
  );
  if (failures.length) {
    const labels = failures.map(
      (owner) =>
        owner.closest("figure")?.querySelector("figcaption")?.textContent ??
        owner.getAttribute("data-tier") ??
        owner.className,
    );
    throw new Error(
      `Root-size text-seat geometry failed for ${failures.length}/${expectedCount} owners: ${labels.join("; ")}`,
    );
  }
}
