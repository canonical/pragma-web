export const products = [
  { id: "compute", name: "Compute", description: "Run workloads on demand." },
  { id: "storage", name: "Storage", description: "Keep data available." },
] as const;

export function findProduct(id: string) {
  return products.find((product) => product.id === id);
}
