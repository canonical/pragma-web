declare module "*.mdx" {
  import type { ComponentType } from "react";

  /** The page a compiled `.mdx` module renders. */
  const MdxPage: ComponentType;
  export default MdxPage;
}
