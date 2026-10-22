# Pragma code standards digest (from @canonical/code-standards 0.43.0; 147 standards)

Every standard below is mandatory, without exception. The CURIE is the standard's identity (cite it in review findings). Full examples live in the Turtle under packages/semantics/code-standards in pragma-core.

## testing.coverage

### cs:testing.coverage.config — Enforce 100% coverage
New packages with runtime code must enforce 100% coverage thresholds using vitest with the v8 provider. Existing packages should ratchet toward 100% over time. Every package that exports runtime code (not pure types or CSS) must configure vitest coverage. The `test:coverage` script in `package.json` runs `vitest run --coverage`. The plain `test` script runs `vitest run` without coverage for speed during development. Package-specific exclusions are acceptable when justified (e.g., `**/types/*.ts` for packages with type directories, third-party wrappers). Each addition to `exclude` must be a category of non-runtime code, not a way to skip hard-to-test source.
- Do: Configure vitest with v8 coverage provider and 100% thresholds with standard exclusions.
- Don't: Omit coverage thresholds or use thresholds below 100%. / Add source files to `exclude` to avoid writing tests for them.

### cs:testing.coverage.ignore_pragma — Ignore only unreachable branches
`v8 ignore` pragmas must be reserved for structurally unreachable branches, not testable-but-inconvenient code. Acceptable uses include: runtime detection (`typeof Bun !== "undefined"`), environment variables (`process.env.HOME ?? ""`), exhaustive switch defaults after all discriminated union members are handled, and intentional no-ops (empty callback functions passed to framework APIs). Unacceptable uses include: `?? ""` on `Map.get()` where the key was conditionally set, `if (!x)` guard after a length check, and `error instanceof Error` in catch blocks. Each pragma must include a `--` comment explaining why the branch is unreachable.
- Do: Include a `--` comment explaining why the branch is structurally unreachable. / Use `v8 ignore` for exhaustive switch defaults that TypeScript guarantees are unreachable.
- Don't: Use `v8 ignore` without an explanation, or to suppress a testable branch.

## testing.integration

### cs:testing.integration.structure — Test outcomes, not wiring
Integration tests that exercise multiple modules together must live in `src/testing/integration/` and test observable outcomes, not internal wiring. Integration tests verify that modules compose correctly — that a pipeline produces the right output, that a query returns the right results, that a template renders with all helpers available. They must use real implementations (not mocks), be named after the capability they verify (not the modules they touch), and clean up any state they create. Do not place integration tests next to unit tests without the `integration/` directory. Do not test cross-package integration in library packages — that belongs at the application layer.
- Do: Place integration tests in `src/testing/integration/` and test observable outcomes.
- Don't: Place integration tests next to unit tests or test internal wiring instead of outcomes.

## testing.regression

### cs:testing.regression.structure — Numbered regression test registry
A regression test pins a specific, once-broken behaviour so it can never silently return. Regression tests are numbered by landing order and live in `src/testing/regression/`, named `NNNN-slug.test.ts` — a zero-padded sequence number plus a kebab-case slug describing the bug. The number is a permanent, monotonic record: the filename itself is the registry, so there is no counter file. A regression pins cross-cutting behaviour rather than one source file, so it is not colocated as a unit test; it sits alongside the integration tests under `src/testing/`. Reproduce the original failure with real implementations (not mocks), and keep the test passing on every run.
- Do: Place numbered regression reproducers in `src/testing/regression/`, named `NNNN-slug.test.ts`. / Number by landing order, zero-padded, with a descriptive kebab slug — the filename is the record.
- Don't: Colocate a cross-cutting reproducer next to a single source file as if it were a unit test. / Use unnumbered or vague names that lose the landing-order record.

## testing.unit

### cs:testing.unit.describe_organization — Describe blocks mirror the API
Test files must use hierarchical `describe` blocks that mirror the module's public API. Each exported function or behavior gets its own `describe`. The top-level `describe` names the module under test. Nested `describe` blocks group by exported function, method, or logical behavior. Individual `it` blocks describe specific input/output scenarios. For files that export multiple functions, use a top-level `describe` per export. Do not use `test()` as a synonym for `it()` — use `it()` consistently. Do not create deeply nested describe trees (3+ levels) — flatten by splitting into separate describe blocks or separate test files.
- Do: Use hierarchical `describe` blocks mirroring the module's public API. / Use a top-level `describe` per export when a file exports multiple functions.
- Don't: Use `test()` instead of `it()`, or create deeply nested describe trees.

### cs:testing.unit.fixtures_pattern — Fixtures live in testing/
Test fixtures must be defined in `testing/fixtures.ts` as named exports. Factory helpers that create stateful test objects get their own files in `testing/`. Static test data (strings, objects, configuration samples) belongs in `testing/fixtures.ts`. Custom vitest matchers go in `testing/registerMatchers.ts`. Test-only type definitions go in `testing/types.ts`. Do not inline large fixture data in test files. Do not use JSON fixture files — TypeScript exports are type-safe and importable.
- Do: Define static fixtures as named exports in `testing/fixtures.ts`. / Place factory helpers that create stateful objects in their own files in `testing/`.
- Don't: Inline large fixture data directly in test files or use JSON fixture files.

### cs:testing.unit.mocking_minimal — Mock only at boundaries
Prefer real execution over mocks. Mock only at system boundaries where real execution is impossible or destructive. Mocking internal modules to simplify test setup produces tests that pass when the contract is broken. Acceptable mocking targets: filesystem (`node:fs/promises`), network (HTTP clients, external API calls), process/runtime (`process.exit`), and time (`vi.useFakeTimers()`). Mocking internal modules is acceptable when needed to trigger specific edge cases (error paths, race conditions) that are impractical to reproduce otherwise. Avoid mocking: pure functions, configuration/constants, or other packages in the monorepo.
- Do: Use a factory helper to create real test dependencies instead of mocking them. / Mock only at genuine system boundaries like the filesystem.
- Don't: Mock internal modules within the same package to simplify test setup.

## ui_blocks

### cs:ui_blocks.forms.native_validation — Native form validation
Express form constraints with native HTML attributes (e.g., `required`, `type=email`, `pattern`, `min`, `max`, `minlength`, etc.) and style state with `:user-valid` and `:user-invalid`. Treat native validation as the baseline; advanced JavaScript validation may be layered on top, not used as a replacement.
- Do: Declare constraints natively and style after interaction.
- Don't: Disable native validation by default and rebuild it in JavaScript.

### cs:ui_blocks.media.lazy_loading — Native lazy media loading
Use native lazy-loading (`loading=lazy`, `decoding=async`) and responsive sources (`srcset`, `sizes`) instead of JavaScript lazy-loader patterns.
- Do: Defer offscreen images natively while keeping a real, responsive source.
- Don't: Defer real media sources to JavaScript with placeholder-src lazy-loader patterns.

## ui_blocks.nojs

### cs:ui_blocks.nojs.aria_contracts — Honor ARIA behavior contracts
Do not server-render ARIA roles, states, or properties that advertise interactive behavior unless that behavior is available at first paint. If behavior depends on scripting, gate ARIA contracts until hydration confirms scripting is active. Use native semantics as the baseline.
- Do: Render a semantic baseline first; apply ARIA contracts only after hydration and behavior wiring are active.
- Don't: Server-render ARIA semantics before hydration when scripts may fail or be unavailable.

### cs:ui_blocks.nojs.dialog — Modal dialogs with the dialog element
Use native `<dialog>` for modal dialogs and control it declaratively with invoker commands (`show-modal` and `close`). See cs:ui_blocks.nojs.invoker_commands.
- Do: Open and close a modal declaratively with invoker commands.
- Don't: Fake a modal with a positioned div, which lacks focus trapping and background inertness.

### cs:ui_blocks.nojs.disclosure — Disclosure and accordion with details/summary
Use native `<details>` and `<summary>` for disclosure. Use a shared `name` attribute to create a single-open accordion without JavaScript. Do not add `role` or `aria-expanded`; the element manages semantics and state.
- Do: Build a single-open accordion by giving each `<details>` the same `name`.
- Don't: Re-implement disclosure with a generic element and JavaScript, losing built-in focus, keyboard, and state semantics.

### cs:ui_blocks.nojs.invoker_commands — Declarative button behavior with invoker commands
Wire buttons to interactive elements declaratively with the Invoker Commands API (`command` and `commandfor`) instead of attaching click listeners when possible. Prefer built-in commands (`toggle-popover`, `show-modal`, `close`, `request-close`) over custom commands that require JavaScript. See cs:ui_blocks.nojs.popover. See cs:ui_blocks.nojs.dialog.
- Do: Use a built-in command to toggle a popover with no event listener.
- Don't: Reach for a click listener for an action the platform already provides declaratively.

### cs:ui_blocks.nojs.popover — Non-modal overlays with the Popover API
Use the declarative Popover API (`popover` with `popovertarget`) for non-modal overlays such as menus, tooltips, and toasts. Use a real `<button>` as the trigger.
- Do: Toggle a non-modal menu declaratively with popovertarget.
- Don't: Hand-roll an overlay with manual outside-click and Escape handling that only works once JavaScript runs.

### cs:ui_blocks.nojs.toggles — Form-state toggles, not checkbox hacks
Use `:checked` styling for real form state only (checkboxes and radios that submit values). Do not repurpose hidden checkboxes to power menus, dialogs, or disclosure; use `<details>`, `popover`, or `<dialog>` instead. See cs:ui_blocks.nojs.disclosure. See cs:ui_blocks.nojs.popover. See cs:ui_blocks.nojs.dialog.
- Do: Use a real checkbox for a real on/off setting that submits with the form.
- Don't: Drive a navigation menu with a hidden checkbox, exposing checkbox semantics for a button-like control.

## ui_blocks

### cs:ui_blocks.principles.scripting_progressive_enhancement — Progressive enhancement baseline
Build every UI block in layers: semantic HTML first, CSS for presentation and declarative interactivity second, and client-side JavaScript as an optional final layer. The primary task must still work when JavaScript does not load or is disabled.
- Do: Render the core task in HTML that works on its own; a real link navigates and a real form submits to a server endpoint.
- Don't: Gate the core task behind JavaScript so it is unreachable until, and unless, a script runs.

## code

### cs:code.api.stability — Mark experimental APIs
Experimental APIs must be marked with the @experimental JSDoc tag in type definition files. The tag must include a description of what is experimental.
- Do: Mark an experimental interface with a clear @experimental JSDoc tag and description. / Add an @experimental tag to a specific property with context about its experimental status. / Describe the experimental status and any future plans for the API.
- Don't: Use the @experimental tag without an explanation. / Use the @experimental tag without describing what is experimental.

### cs:code.array.safe_access — Safe array access with .at()
Use `.at(index)` instead of bracket notation for array element access. Bracket notation (`arr[i]`) returns `T` in TypeScript even though the index may be out of bounds — the type system hides a potential `undefined`. `.at(index)` returns `T | undefined`, making the fallibility visible at the type level and forcing callers to handle the missing case.
- Do: Use `.at()` for index-based array access.
- Don't: Use bracket notation — TypeScript infers `T` instead of `T | undefined`, hiding potential out-of-bounds access.

### cs:code.assertion.non_null — Assert invariants at runtime
Prefer runtime assertions over non-null assertions (`!`). TypeScript's `!` operator suppresses null/undefined checks at the type level without any runtime effect. When the invariant breaks (refactoring, upstream change), the program silently proceeds with `undefined` instead of failing fast. Use a runtime assert to document the invariant and fail visibly. Exception: inline expressions where a throw would add noise (`.map()` callbacks, ternaries). There `as T` or `!` are acceptable when the proof is on the same line.
- Do: Use a runtime assertion to document and enforce the invariant. / In inline expressions where an assertion would add noise, `as T` or `!` is acceptable when the proof is on the same line.
- Don't: Use `!` to suppress the type checker — it has no runtime effect and fails silently when the invariant breaks. / Use `as T` to cast away nullability outside of inline expressions.

### cs:code.constants.file — Domain constants in constants.ts
Domain constants must be collected in a `constants.ts` file using named exports (no default export). The file must be colocated at the level of the domain that owns the constants — inside the domain folder when one exists. Constants files always use named exports so consumers can import exactly what they need. Single-use constants that are only referenced in one file may be declared inline in that file instead of being extracted to `constants.ts`.
- Do: Create a `constants.ts` file with named exports at the domain level / Colocate `constants.ts` inside the domain folder it belongs to / Import constants directly from the owning domain's `constants.ts` / Keep all exports in `constants.ts` as named exports with the same shape (plain values) / Keep single-use constants inline in the file that uses them
- Don't: Use a default export in a constants file / Scatter constants across unrelated files instead of collecting them in `constants.ts` / Place constants far from the domain that owns them / Mix constants with functions, types, or other non-constant exports

### cs:code.fallback.defensive — Defensive fallbacks at external boundaries
Defensive fallbacks (`?? ""`, `?? 0`, `?? []`) at external API boundaries are correct even when the left side appears guaranteed. External contracts change, APIs have bugs, and types lie. Keep the fallback as runtime safety. When the `??` creates an untestable V8 branch, annotate with `v8 ignore` per `cs:testing.coverage.ignore_pragma` rather than removing the fallback. This does NOT apply to internal code where the guarantee is structural — there, the `??` is noise and an explicit assertion per `cs:code.assertion.non_null` is preferred.
- Do: Use defensive `??` fallbacks at external boundaries, even when the left side appears guaranteed.
- Don't: Trust external contracts with unsafe casts instead of defensive fallbacks.

### cs:code.function.composition — One responsibility per function
Each function must handle exactly one specific task. Complex operations must be broken down into smaller, single-purpose functions.
- Do: Define functions with a single, clear responsibility. / Compose single-purpose functions to build complex logic.
- Don't: Mix multiple responsibilities in a single function.

### cs:code.function.location — Define functions near their use
Functions must be defined as close to their broadest point of use as possible. Shared utilities must be placed in a common location, and each function must serve a single feature or responsibility.
- Do: Place functions in the file or module where they are most broadly used. If a function is shared across multiple components or modules, place it in a common utility location.
- Don't: Place functions far from where they are used, or in a generic location if only used in one place.

### cs:code.function.purity — Pure functions by default
Functions should be pure where possible. A pure function returns the same output for the same input and does not modify external state or perform I/O operations. If a function must perform side effects (e.g., I/O in CLI tools), it must be explicitly annotated and documented with the reason for impurity using the @note tag in TSDoc/JSDoc.
- Do: Create pure functions that rely only on their inputs to compute the output. / Annotate and document impure functions that perform I/O or modify external state, explaining why impurity is necessary using @note.
- Don't: Create impure functions without annotation or documentation. / Hide side effects in functions that appear pure.

### cs:code.naming.function_verb — Name functions with a verb
All function and method names must start with a verb that describes the action the function performs. Names like `pathToX` or `dataForUser` describe a result, not an action — use `findPathToX` or `fetchDataForUser` instead. This makes the function's intent immediately clear and distinguishes functions from plain values or constants.
- Do: Start function names with an action verb / Use descriptive verb prefixes that convey the operation
- Don't: Name functions as nouns or noun phrases — they read like values, not actions / Use vague or non-descriptive verbs that don't convey meaning

### cs:code.types.file — Reusable types in types.ts
Reusable domain types must be collected in a `types.ts` file using named exports (no default export), colocated at the level of the domain that owns them. Types that are only used in a single file may be declared inline in that file instead of being extracted to `types.ts`.
- Do: Create a `types.ts` file with named exports for types shared across the domain / Colocate `types.ts` inside the domain folder it belongs to / Keep single-use types inline in the file that uses them / Import shared types from the owning domain's `types.ts`
- Don't: Use a default export in a types file / Extract single-use types to `types.ts` when they are only used in one file / Place types far from the domain that owns them / Mix types with functions, constants, or other non-type exports

## css

### cs:css.animation.scroll_timeline — Scroll-driven animations without JavaScript
Use scroll-driven animations (`animation-timeline`, `scroll()`, `view()`) instead of scroll-event-driven animation logic. JavaScript scroll animations may be layered on as fallback when needed. See cs:ui_blocks.principles.scripting_progressive_enhancement.
- Do: Bind animation progress to scroll with CSS.
- Don't: Drive scroll-linked motion only from JavaScript when scroll-driven CSS can express it.

### cs:css.animation.starting_style — Entry transitions with @starting-style
Use `@starting-style` for entry transitions when an element is inserted or toggled into view, especially for popovers and dialogs. JavaScript may be layered on as a fallback around the same declarative CSS for unsupported browsers.
- Do: Define the starting state in CSS for entry transitions.
- Don't: Drive entry animations only from JavaScript when `@starting-style` can be used.

### cs:css.component.encapsulation — Scope styles to the root class
Component styles must be encapsulated using the component's root class as a boundary. All internal element styles must be scoped to the component's namespace.
- Do: Scope internal element styles using the component's namespace.
- Don't: Don't style internal elements without the component namespace.

### cs:css.component.states — State attributes and modifier classes
Component states must be handled using attribute selectors for native states and class modifiers for custom states.
- Do: Use attribute selectors for native element states.
- Don't: Use class modifiers for native states.

### cs:css.media.container_queries — Container queries over ResizeObserver
Use container queries (`container-type` and `@container`) for responsive styling based on a containing element's size. Use `ResizeObserver` only when container queries cannot express the condition, such as changes to content-driven rendered height.
- Do: Use a query container and adapt styles with @container rules.
- Don't: Use ResizeObserver for width-based layout changes that container queries can express.

### cs:css.media.scripting — Guard hydration flash with scripting
Use the `scripting` media feature when hydration gating would cause a FOUC-like "flash of un-javascripted content" on first paint.
- Do: When hydration gating causes first-paint flash, hide JS-only affordances by default and reveal them when scripting is enabled.
- Don't: Allow JS-only affordances to flash on first paint when they are hydration-gated.

### cs:css.positioning.anchor — CSS anchor positioning for tethered elements
Prefer CSS anchor positioning (`anchor-name`, `position-anchor`, `anchor()`, and `position-try`) for tethered elements such as popovers, tooltips, and menus. Start from a resilient baseline and layer anchor positioning; JavaScript positioning libraries may be used as fallback when needed. See cs:ui_blocks.principles.scripting_progressive_enhancement.
- Do: Start from static positioning and layer anchor positioning.
- Don't: Default to JavaScript positioning without attempting anchor positioning.

### cs:css.properties.values — Design tokens over raw values
CSS properties must use design tokens for design decisions (see cs:styling.tokens.creation) and raw values for properties that are independent from design decisions, or "unthemable.
- Do: Use design tokens for design decisions. / Use raw values for unthemable properties (independent of design decisions).
- Don't: Use raw values for design decisions.

### cs:css.selectors.child_elements — Role-based child class names
Child elements within components must use simple, role-based class names (e.g., `.header`, `.content`, `.icon`) scoped by the parent selector, NOT verbose prefixed names that repeat the component name.
- Do: Use simple role-based class names scoped by the parent.
- Don't: Use verbose prefixed class names that repeat the component name.

### cs:css.selectors.has — State styling with :has()
Use `:has()` to style a component from descendant or sibling state (checked, empty, invalid, open) without JavaScript-managed classes.
- Do: Style a field wrapper from the input's native state with no JavaScript class toggling.
- Don't: Mirror child state onto a parent class with JavaScript when :has() expresses it directly.

### cs:css.selectors.namespace — The ds selector namespace
All component selectors must be prefixed with the `.ds` namespace (e.g., `.ds.button`).
- Do: Prefix all component selectors with `.ds`.
- Don't: Omit the `.ds` namespace from component selectors.

### cs:css.selectors.naming_convention — Kebab-case class names
Component CSS class names must be the kebab-case version of the component's PascalCase name.
- Do: Convert PascalCase component names to kebab-case for CSS classes:
- `MyComponent` -> `.ds.my-component`
- `UserProfile` -> `.ds.user-profile`
- `Button` -> `.ds.button`
- Don't: Use PascalCase or other formats in CSS class names:
- `.ds.MyComponent` (Bad: Not kebab-case)
- `.ds.user_profile` (Bad: Not kebab-case)

### cs:css.selectors.semantics — Name classes by purpose, not appearance
CSS class names must describe the purpose or state of an element, not its appearance.
- Do: Use semantic modifier classes to represent component variations.
- Don't: Use non-semantic or presentational class names.

### cs:css.selectors.specificity — Flat selector specificity
CSS selectors must follow a strict specificity pattern:
- Component root must use namespace + component name (.ds.button)
- Single modifier class for variants (.ds.button.primary)
- Single attribute for states (.ds.button[disabled])
- Do: Use a single modifier class for component variants.
- Don't: Combine multiple modifiers or mix states with variants.

### cs:css.themes.activation — Activate themes with container classes
Theme tokens must be activated through CSS classes on container elements. See cs:styling.themes.definition for theme token structure.
- Do: Define semantic tokens within theme classes.
- Don't: Hardcode theme names in component styles.

## styling

### cs:styling.themes.definition — Themes as semantic token sets
Themes are collections of semantic tokens that provide consistent styling across components. See cs:css.themes.activation for implementation details.
- Do: Define a theme as a complete set of semantic tokens.
- Don't: Mix implementation details into theme definitions.

### cs:styling.tokens.creation — Tokenize every design decision
Design tokens must be created for all design decisions in a component. See cs:css.properties.values for how these tokens are used in CSS implementation.
- Do: Create component tokens that reference semantic tokens for design decisions.
- Don't: Use raw values for design decisions.

### cs:styling.tokens.scoping — Scope tokens to their tier
Design tokens must be scoped according to their type:
- Primitive tokens: Global scope (system-wide base values)
- Semantic tokens: Theme scope (theme-specific bindings to primitive tokens)
- Component tokens: Component scope (bindings to semantic tokens)
- Do: Define primitive tokens in global scope.
- Don't: Define primitive tokens in theme scope.

### cs:styling.tokens.types — Three tiers of design tokens
Design tokens follow a strict hierarchy:
      - Primitive tokens: Raw values that form the foundation of the design system
      - Semantic tokens: Map semantic concepts to primitive token values
      - Component tokens: Map component properties to semantic token values
- Do: Define semantic tokens that map to primitive tokens.
- Don't: Skip the semantic layer by mapping component tokens directly to primitives.

## react

### cs:react.component.barrel_exports — Complete barrel exports
The index.ts file must be a complete barrel export for the component folder, re-exporting all public APIs.
- Do: Create an index.ts file that re-exports all public APIs from the component folder.
- Don't: Omit the index.ts file or fail to re-export all public APIs. / Use `export * from './types.js'` as it allows value exports, which is not expected for types files.

### cs:react.component.class_name_construction — Class names ordered by specificity
Component CSS class names must be constructed following a specific pattern:

1.  Base Class Constant: A `componentCssClassName` constant must be defined at the top of the component file. This constant holds the component's base class name, including the global `ds` scope (e.g., `"ds button"`).
2.  Array Construction: The `className` string must be built from an array of classes.
3.  Class Order: The classes in the array must be ordered from least to most specific to ensure a predictable CSS cascade:
    a. Base Class: The `componentCssClassName` constant.
    b. Modifier Classes: Classes derived from component props (e.g., `emphasis`, `severity`).
    c. Consumer Classes: The `className` prop passed by the consumer.
4.  Filtering and Joining: The array must be processed with `.filter(Boolean).join(" ")` to remove any falsy values (e.g., undefined props, expressions that evaluate to false) and create the final space-delimited string.
- Do: Follow the complete pattern for class name construction.
- Don't: Hardcode the base class name inside the JSX. / Place the consumer `className` prop before other classes. / Use string concatenation or template literals to add class names.

### cs:react.component.dependencies — Unidirectional component dependencies
Component dependencies must follow a strict unidirectional flow:
- Subcomponents must be in a `common/` folder within the parent component's directory
- Dependencies can flow downwards (parent to subcomponent) or sideways (between siblings)
- Dependencies must not flow upwards (subcomponent to parent)
- Do: Place subcomponents in a `common/` folder inside the parent component directory. / Allow subcomponents to depend on siblings or shared utilities within the same component scope.
- Don't: Create dependencies that flow upwards from a subcomponent to its parent. / Allow external components to depend on the internal structure of another component.

### cs:react.component.file_naming — File naming by scope
Component folder and file naming is based on scope. Component-specific files (implementation, stories, tests) must be prefixed with the component's name (e.g., `MyComponent.tsx`, `MyComponent.stories.tsx`). Domain-level files that serve the entire folder (e.g., `Context.tsx`, `styles.css`, `types.ts`) should use generic, descriptive names, as the folder already provides the domain context.
- Do: Prefix component-specific files and use generic names for domain-level files.
- Don't: Add redundant prefixes to domain-level files.

### cs:react.component.link_component — Router integration via LinkComponent
A *complex* component — one that renders a set of navigable items (a list, tree, tab strip, breadcrumb trail, menu) and injects an inner link renderer for them — MUST integrate with a consumer's router through a single `LinkComponent` prop against the shared `LinkComponentProps` contract, NOT through a per-component re-authored interface and NOT through the polymorphic `as` prop. (A *simple* component that merely re-targets its own wrapper element uses `as` instead — see the boundary below.)

The contract is deliberately narrow: `LinkComponent?: ComponentType<LinkComponentProps> | "a"`, defaulting to the intrinsic `"a"`. `LinkComponentProps` forwards only `href`, `className`, `children`, and `aria-current` — not the full anchor attribute set — so the same router `Link` adapter works across every component that uses it. Define `LinkComponentProps` once in a shared location and import it; do not copy the interface per component.

Boundary with the polymorphic `as` prop — the deciding question is *what is being configured*: the component's own wrapper element, or an inner link renderer among other structure.

- **Simple component → `as`.** When the component IS the element (its own root wrapper is what gets swapped for the consumer's link/element — e.g. a `Link`, `Button`, `Box`, or any single-element component the consumer re-targets), use the polymorphic `as`/`ElementType` prop. The consumer configures the wrapper directly.
- **Complex component → `LinkComponent`.** When the component renders multiple navigable items and injects ONE inner link renderer for each (a list, tree, tab strip, breadcrumb trail, menu), use `LinkComponent`. Here `as` would be wrong: there is no single wrapper to re-target, and threading `as`-style generics through the subcomponents to reach each inner link is the anti-pattern this standard exists to prevent.

Fallback semantics: a non-navigable item (one with no `url`/`href`) MUST render a plain element such as `<span>` — never the injected link, and never a `<button>`. When an item is disabled, its `href` is omitted. Active state drives `aria-current` (e.g. `"page"`) on the rendered link.
- Do: Inject the link via a single `LinkComponent` prop typed against the shared `LinkComponentProps`, defaulting to the intrinsic anchor, and render a plain element for non-navigable items.
- Don't: Re-author the link contract per component, reach for the polymorphic `as` prop for router integration, or render a link for a non-navigable item.

### cs:react.component.naming — PascalCase component names
Components must use PascalCase naming and be descriptive of their purpose.
- Do: Use PascalCase and descriptive names for components:
UserProfile
NavigationBar
SearchResultList
- Don't: Use non-PascalCase or unclear names:
userProfile
navigation_bar
searchresultlist

### cs:react.component.props — Documented and spreadable props
Component props must:
- Be documented with TSDoc comments
- Be destructured when used in markup
- Be spread to the root element when unused
- Follow type-specific patterns based on what the component renders
- Do: Document props with TSDoc comments and use proper destructuring and spreading.
- Don't: Mix explicit and spread props or destructure props unnecessarily.

### cs:react.component.props.html_rendering — Extend native HTML element props
Components that render HTML markup must extend the base HTML element props interface to enable passing native properties through spreading.
- Do: Extend the appropriate React HTML props interface and add component-specific props.
- Don't: Manually redefine standard HTML attributes that are already available through the base interface.

### cs:react.component.props.wrapper — Namespaced props for inner components
Wrapper components must use namespaced props for inner components and accept unscoped props for the wrapper element.
- Do: Use namespaced props for inner components and unscoped props for the wrapper element.
- Don't: Mix prop scopes between wrapper and inner components.

### cs:react.component.structure.context — Context provider file structure
Context providers must use `Provider.tsx` as the main component file instead of the standard component naming pattern `[MyComponent].tsx`. Provider prop and return types must be defined in the hook-level types file `hooks/types.ts` with `UseProviderStateProps` (containing all `ProviderProps` minus `children`) and `UseProviderStateResult` (matching the context options).
- Do: Organize provider-related files by separating concerns into distinct files: place the context definition in `Context.tsx`, the provider implementation in `Provider.tsx`, and provider-specific hooks in a `hooks/` directory. Create a `hooks/useProviderState.ts` file to centrally manage the state of the provider.` / Create the context type within `types.ts`. / create the provider props type within `types.ts`, accepting `children` at a minimum and more props as needed. / Create a `Context.tsx` file for the context definition. / Use `Provider.tsx` as the main component file. The provider is responsible for wrapping children with the context. / Use `index.ts` to export the `Provider` as a named component that matches the folder name, casting it to the component type. / Create provider state hook types in `hooks/types.ts` for context providers. / Create a provider state hook implementation.
- Don't: Create a separate component file (e.g., `[MyComponent].tsx`) when `Provider.tsx` exists. The provider is the main component. / Nest context-related files in a `context/` subfolder. / Create multiple provider files within the same component folder. / Mix concerns of the Provider and its state.

### cs:react.component.structure.folder — One folder per component
Each component must reside in its own folder, which contains all related files: component implementation, tests, type definitions, and optionally stories and styles. Some components may be styleless or may not have stories; in these cases, styles.css and [MyComponent].stories.tsx are optional. Context providers follow a different structure (see cs:react.component.structure.context).
- Do: Place all component-related files within a single folder named after the component.
- Don't: Scatter component files across different parts of the application.

### cs:react.component.subcomponent_export_api — Public and private subcomponent exports
Subcomponents are **public** if they are intended to be directly used by the consumer of the parent component to construct a UI.

Subcomponents are **private** if they are internal implementation details of the parent component, and are not intended for direct use by the consumer.

Public subcomponents must be:
- Exported by attaching them to the parent component using dot notation.
- Named semantically.
- Kept to a single level of nesting.

Private subcomponents must remain internal to the component's implementation and not be exported by any file.
- Do: Export public subcomponents by attaching them to the parent component using dot notation / Use semantic, self-descriptive names for subcomponents / Keep subcomponent nesting to a single level
- Don't: Repeat the parent component name in subcomponent names / Map a subcomponent to a different name (renaming) / Use non-semantic or unclear subcomponent names / Nest subcomponents more than one level deep / Export private subcomponents that are not intended for public use.

### cs:react.component.tsdoc — Component TSDoc from the ontology
Component TSDoc documentation must use the description from the design system ontology (DSL). The TSDoc should NOT include @example blocks since stories serve as the examples. The description should be copied verbatim from the DSL, maintaining the original wording and meaning.
- Do: Use the description from the DSL ontology verbatim.
- Don't: Write custom descriptions that deviate from the DSL. / Include @example blocks - stories fulfill this role. / Omit the @implements tag that links to the DSL.

### cs:react.component.tsdoc.import — Import statement in TSDoc
A component's TSDoc must show how a consumer imports it: a single import statement wrapped in backticks, on its own line, with a blank line before it, placed just before the @implements tag. This documents the public import surface without an @example block (which cs:react.component.tsdoc forbids). The imported name must match the component's exact public export API — the identifier a consumer actually imports from the package's published name — which is not always the local declaration name (a component may be renamed at its barrel, e.g. a local `FieldError` re-exported as `Error`).
- Do: Add the backtick-wrapped import line before @implements.
- Don't: Use an @example or a fenced code block instead of the single backtick line. / Omit the blank line before the import, or drop the backticks. / Use the local declaration name when the barrel re-exports it under a different name.

### cs:react.hooks.custom — Single-concern custom hooks
Custom hooks must separate concerns at the domain level. All hooks within a ComponentDomain/hooks directory are considered within the domain scope and should focus on a single concern. Custom hooks must be used when:
    - Logic needs to be shared between components
    - Component logic becomes complex
    - State management needs to be abstracted
    - Side effects need to be encapsulated

All of the types for a domain level's hooks must be defined in the `hooks/types.ts` file of that folder.
Each hook must define a [HookName]Props and [HookName]Result type in `hooks/types.ts`.
- Do: Create a custom hook that focuses on a single concern within the domain. / Create hook types in `hooks/types.ts`.
- Don't: Create a custom hook for simple, non-reusable state. / Mix multiple concerns in a single hook

### cs:react.hooks.naming — Descriptive use-prefixed hook names
The hook name must start with 'use' and clearly describe its purpose.
- Do: Name custom hooks so the hook name starts with 'use' and is descriptive
- Don't: Name hooks without the 'use' prefix at the start of the hook name

## testing

### cs:testing.file.structure — Colocate tests with source
Unit test files must be colocated with the source they test, using the `.test.ts` suffix (`.test.tsx` for component tests). Other test types (browser, e2e) may follow different naming conventions. Shared test infrastructure — fixtures, factory helpers, custom matchers, type definitions — lives in a `testing/` directory at the package root (not inside `src/`). This directory is excluded from coverage and from the package's public API. Integration tests that exercise multiple modules together go in `src/testing/integration/`. Do not place test files in a top-level `__tests__/` or `tests/` directory mirroring the source tree. Do not use `.spec.ts` — the convention is `.test.ts`.
- Do: Colocate test files next to the source they test, with shared infrastructure in `testing/`. / Place integration tests in `src/testing/integration/`.
- Don't: Place test files in a separate `__tests__/` or `tests/` directory mirroring the source tree, or use `.spec.ts`.

## tsdoc

### cs:tsdoc.documentation_layers — File-level vs export-level docs
File-level and export-level TSDoc serve fundamentally different purposes. Export-level documentation describes *what the symbol does* — its API contract, parameters, return semantics, and side effects. File-level documentation describes *why this module exists* — its architectural role, the design invariants it upholds, and how its exports relate to each other. In single-export files the file exists solely to house that export, so file-level documentation is redundant; document only the exported symbol. In multi-export files, a file-level block is warranted when it explains the cohesion principle that binds the exports together — the reason they live in one file rather than separate ones.
- Do: In single-export files, document only at the export level — the API contract belongs on the symbol. / In multi-export files, use a file-level block to explain the module's architectural purpose — why these exports are grouped. / Use export-level TSDoc to describe the API contract: what the symbol does, its parameters, return value, and any side effects.
- Don't: Add a file-level block in a single-export file that restates what the export-level doc already says. / Use file-level docs to describe *what* an export does — that belongs on the export itself. / Omit file-level docs on multi-export modules where the grouping rationale is non-obvious.

### cs:tsdoc.module_tag_location — @module on barrel files only
The `@module` TSDoc tag must appear only on barrel files such as `index.ts`. Ordinary source files must document their exported API directly and must not use file-level `@module` tags.
- Do: Use `@module` on a barrel file that defines a package or folder-level API. / Document an ordinary source file at the exported symbol instead of using `@module`.
- Don't: Add `@module` to a single-purpose implementation file. / Use file-level `@module` tags as a substitute for export documentation.

### cs:tsdoc.self_contained — Comments that stand alone
TSDoc comments must be self-contained — a reader should fully understand the documented symbol from its comment alone. External links (public specs, RFCs, GitHub issues) are allowed as supplementary references, but the comment itself must never depend on them for comprehension. If an external concept drives the implementation, distill the essential information into the comment.
- Do: Explain the concept inline so the reader needs nothing else / Add an external link as a supplementary reference after a self-sufficient explanation / Reference a GitHub issue for additional context when the comment already explains the behaviour
- Don't: Point the reader to an external resource instead of explaining the behaviour / Reference a wiki or internal doc as a substitute for inline explanation / Leave the reader unable to understand the symbol without following a link

## storybook

### cs:storybook.documentation.source — Documentation from TSDoc
Component documentation must primarily come from TSDoc comments on the component signature and props. Storybook docs overrides should only be used when the documentation needs to differ between code and Storybook contexts.
- Do: Use TSDoc comments for primary documentation.
- Don't: Add documentation in Storybook parameters when TSDoc is sufficient.

### cs:storybook.story.decorator — Shared decorators for context
Decorators must be used to wrap stories in common context providers or layout elements. Decorators should generally be defined in `storybook/decorators.tsx` and be imported as `decorators` in the storybook file. Decorators may be defined inline in story files in limited circumstances when it would be difficult to globally define a semantic decorator (e.g., a decorator that provides mock data specific to that component).
- Do: Use decorators for static context or layout wrapping.
- Don't: Use function-based stories for static wrapping that could be done with decorators.

### cs:storybook.story.documentation — Document usage, not implementation
Story documentation must focus on usage patterns and variations, not implementation details. Each story should demonstrate a specific use case or variation.
- Do: Document usage patterns and variations.
- Don't: Document implementation details or internal behavior.

### cs:storybook.story.folders — Ontology tier folders and titles
Stories and component folders must be organized by ontology tier under `src/lib/`, and each story's `title` must mirror its tier so it matches the shared Storybook sidebar order (`Documentation` → `subcomponents` → `components` → `patterns` → `common` → `utils` → `_work_in_progress`).

Placement is ontology-gated: a folder only goes under `component/`, `pattern/`, or `subcomponent/` if it is an actual entry in the design-system ontology at that type. Items not present in the ontology, or not yet ready for their tier, live under the verbatim `_work_in_progress/` folder (the leading underscore is literal — the sidebar sort order references this exact name). Non-tier machinery and shared helpers live under `src/lib/common/` and `src/lib/utils/`. Documentation `.mdx` lives in `src/docs/`, titled under `Documentation/...`.

Every story title's top segment must be one of the seven order keys — there is no wildcard catch-all, so a title whose top segment is not an order key will sort unpredictably in the sidebar.
- Do: Folder by ontology tier and mirror the tier in each story title.
- Don't: Title with a maturity tag or an un-foldered segment that matches no order key.

### cs:storybook.story.format — Choosing a story format
Stories must use one of three formats, each serving specific needs:
1. CSF3 (object-based) format must be used for standard component variations where args define the component state.
2. Function-based format must be used when the story needs to directly control component rendering or wrap the component with custom elements.
3. Template-based format must be used when multiple stories share the same logic but differ in their args, and the template differs from the component markup.
- Do: Use the format that matches your specific use case.
- Don't: Use a format that doesn't match your use case.

### cs:storybook.story.import — Generic component import alias
Stories must import their component as 'Component' to maintain a consistent, generic reference that is decoupled from the specific component name.
- Do: Import the component generically as 'Component'.
- Don't: Import the component using its specific name.

### cs:storybook.story.naming — Story naming conventions
Story names must be descriptive and follow a consistent pattern. Use PascalCase for story exports and natural language for story titles.
- Do: Use clear, descriptive names that indicate the variation.
- Don't: Use technical or implementation-focused names.

### cs:storybook.story.organization — Group stories by feature
Stories must be organized into logical groups that demonstrate related features and variations. Each story should focus on a specific use case or feature, with clear naming that indicates what aspect of the component it demonstrates.
- Do: Group related features with clear, descriptive names.
- Don't: Use unclear names or mix unrelated features in a single story.

### cs:storybook.story.subcomponent_nesting — Nest subcomponents under their parent
A subcomponent that has a parent component must stay nested inside the parent at `src/lib/component/<Parent>/common/<Part>/`, and its story `title` must nest it under the parent in the sidebar as `components/<Parent>/<Part>` (e.g. `components/Accordion/Item`). Such a subcomponent must never be hoisted to a top-level `src/lib/subcomponent/` folder or titled into the top-level `subcomponents/` sidebar group.

Only free-standing subcomponents — those with no parent component — get their own top-level `src/lib/subcomponent/<Name>/` folder and a `subcomponents/<Name>` title. The top-level `subcomponents/` sidebar group is reserved for those.
- Do: Nest a parented subcomponent's story under its parent component.
- Don't: Hoist a parented subcomponent to a top-level subcomponent/ folder or the subcomponents/ sidebar group.

### cs:storybook.story.testing — Behavior testing with play functions
Stories that test component behavior must use the `play` function to simulate user interactions and verify expected outcomes.
- Do: Use play functions to test interactive behavior.
- Don't: Test implementation details or internal state.

### cs:storybook.story.visibility — Hide test-only stories
Stories that exist solely for testing or visual coverage but don't represent valid usage patterns must be hidden from documentation and the sidebar using tags.
- Do: Hide test-only stories that don't represent valid usage.
- Don't: Show implementation details or test states in documentation.

## packaging

### cs:packaging.application.structure — Applications organize by domain
Application packages (CLIs, servers, MCP tools, build scripts, workers) execute behavior through entry points. They are not imported as dependencies by other packages. Their internal code must be organized around execution domains (commands, routes, tools, operations) rather than library conventions like `src/lib/` or barrel re-exports. Each domain folder must have its own barrel file (`index.ts`) that defines the domain's internal API — sibling domains import through the barrel, never from individual files.
- Do: Recognise an application package by its `package.json` signals — `bin` field, `private: true`, no `main`/`exports` / Organize code around execution domains. Each domain folder gets its own barrel (`index.ts`) that exposes the domain's internal API to sibling domains / Import from sibling domains through their barrel, not from individual files / Use domain-appropriate folder names that reflect what the code does — `commands/`, `tools/`, `routes/`, `operations/`, `handlers/` / For **hybrid** packages (primarily application but exporting a small reusable surface), isolate the exported surface in `src/lib/` following library rules while keeping the rest as application structure
- Don't: Apply library structure (`src/lib/`, barrel re-exports) to application packages / Create a `src/lib/` folder for internal shared operations. Use domain-appropriate names instead / Import directly from files inside a sibling domain — always go through the domain barrel / Omit barrels from domain folders / Default to library structure just because the package lives in a monorepo

### cs:packaging.export.barrel — Barrels define the API surface
Every domain folder must have a barrel file (`index.ts`) that defines its API surface. In library packages, barrels define the public API for external consumers. In application packages, barrels define the internal API between sibling domains. Within a domain, implementation files import from siblings directly; cross-domain imports always go through the barrel.
- Do: Use a barrel at the package entry point to define the public API (library packages) / Use a barrel at each domain folder to define the domain's API (application packages) / Import internal implementation code within a domain from the owning file directly / Import cross-domain code through the sibling domain's barrel / Keep compatibility barrels thin and documented as public facades
- Don't: Route internal same-domain code through its own barrel / Import cross-domain code by reaching into individual files / Hide domain ownership behind convenience barrels / Omit the barrel from a domain folder

### cs:packaging.export.declaration — Export at the declaration
Exports must be declared on the definition itself (e.g. `export default function` or `export const`), not gathered at the end of the file. When a wrapper (HOC, decorator, middleware) is applied, declare the unwrapped binding with `const`, then export the wrapped result as default on a separate line.
- Do: Declare the export directly on the function or class definition / Declare the export directly on a named constant / When a wrapper is involved, declare the raw binding with `const`, then export the wrapped result as default / Apply the same pattern for higher-order functions and middleware
- Don't: Define a symbol and then export it at the end of the file / Gather multiple exports at the bottom of the file / Use `export default` on the raw binding when a wrapper is needed

### cs:packaging.export.shape — Default or uniform named exports
Files must use either a single default export or multiple named exports. When using multiple named exports, all exports must have the same type or shape.
- Do: Use a single default export for files implementing a single component or function / Name atomic function files after the function they export / Use multiple named exports for files providing a public API or a collection of related items, and ensure all exports have the same type
- Don't: Mix default and unrelated named exports in a way that confuses the file's purpose / Name an atomic function file with a name that doesn't match its exported function / Provide multiple unrelated exports from a file meant for a single domain / Export objects of different types or shapes from the same file

### cs:packaging.import.cross_domain — Subpath imports for applications only
How intra-package cross-domain imports are written depends on the package archetype: **applications may use `#` subpath imports; distributable packages must not.**

Application packages (not published — a build system such as Vite resolves and inlines module specifiers at build time, so no `#` alias survives into any shipped artifact) use Node.js subpath imports (the `imports` field in `package.json`) with the `#` prefix convention. Each `#` alias points directly to the domain's barrel file — no wildcard splats, no path suffixes, no extension mapping. Subpath imports are the official Node.js mechanism, work natively with Node, Bun, vitest, and tsc, and require no plugins. TypeScript resolves them when `resolvePackageJsonImports` is enabled (on by default with `moduleResolution` set to `node16`, `nodenext`, or `bundler`).

Distributable packages (published and consumed as dependencies) must not use `#` subpath imports. A published package must remain consumable when built with plain `tsc` — `tsc`-only builds are the north star for distributable packages — and `tsc` never rewrites module specifiers: a `#` alias in source is emitted verbatim into `dist`, leaking the package's private `imports` map into its public contract and forcing resolve configuration onto every consumer. Mismatched resolve conditions then break downstream builds — e.g. Vite/Vitest activating the `development` condition, which points at unpublished `src`. Distributable packages use ordinary relative imports with `.js` extensions (NodeNext) instead, still through the sibling domain's barrel.

In both archetypes the alternatives stay off the table: with `moduleResolution: "nodenext"` (or `"node16"`), bare specifiers like `error/index.js` are treated as package names, not path-relative imports, and the `paths` compiler option is a manual alias table — brittle and verbose.
- Do: In an application package, map each `#` alias directly to the domain barrel in `package.json` — no wildcards, no path suffixes / In an application package, import cross-domain modules using the `#` alias — clean, no path suffixes / In a distributable package, import cross-domain modules with ordinary relative paths and `.js` extensions (NodeNext), still through the sibling domain's barrel / Use `moduleResolution: "nodenext"` (or `"node16"` / `"bundler"`) in `tsconfig.json` so TypeScript resolves subpath imports via `resolvePackageJsonImports` (enabled by default with these settings) / In an application package, use conditional subpath imports when you need different resolutions for different environments
- Don't: Use `#` subpath imports in a distributable package — `tsc` never rewrites module specifiers, so the alias is emitted verbatim into `dist`, leaking the private `imports` map into the package's public contract / Use wildcard splats or path suffixes in `#` aliases — point directly to the barrel instead / Use bare specifiers without the `#` prefix for intra-package imports — they resolve as package names under `nodenext` / Use `paths` in `tsconfig.json` as a substitute for subpath imports — it's a manual alias table that doesn't participate in Node.js resolution / Reach across domains into individual files — cross-domain imports go through the domain's barrel: behind the `#` alias in an application, via a relative path to the barrel in a distributable package / Import specific files through the `#` alias — go through the barrel instead

### cs:packaging.library.structure — Libraries export from src/lib
Library packages export reusable code (components, utilities, hooks, types) for consumption by other packages. They must organize their exportable code in a `src/lib/` folder and re-export through a root barrel. This convention ensures consistency across the monorepo and clearly separates public API code from non-exported concerns like storybook configuration or test utilities. Each domain folder within `lib/` must have its own barrel (`index.ts`).
- Do: Recognise a library package by its `package.json` signals — `main`/`exports` field, publishable, no `bin` / Place all reusable/exportable code in `src/lib/`, with a barrel in each domain folder / Re-export from the lib folder in the package entry point / Use the lib barrel to compose the package's public API from domain barrels
- Don't: Use alternative folder names like `ui`, `components`, or `utils` for exportable code at the package level / Mix exportable and non-exportable code at the same level / Create deeply nested lib-like structures; keep lib at the top level of src / Omit barrels from domain folders within lib

### cs:packaging.naming.single_export_file — Filename matches the export
Files that contain a single export must be named after that export. This applies to functions, classes, types, constants, and any other single-export module. The file name must match the exported identifier exactly, preserving its casing (camelCase for functions/variables, PascalCase for classes/types/components).
- Do: Name files after the single function they export / Name files after the single type or interface they export / Name files after the single class they export / Name files after the single constant they export
- Don't: Use generic names like `helpers.ts`, `utils.ts`, or `types.ts` for files with a single export / Use names that describe the domain instead of the export

## git

### cs:git.branch.name — Semantic branch prefixes
Branch names must follow a semantic prefix/description pattern using `/` as separator. The prefix communicates the intent of the branch (feature, fix, chore, etc.) and the description uses kebab-case to summarize the work. This convention enables CI filtering, changelog grouping, and at-a-glance understanding of what a branch carries.
- Do: Use a semantic prefix followed by `/` and a kebab-case description. / Use the same prefix vocabulary as conventional commits (`feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `ci`, `perf`). / Keep descriptions concise but specific enough to identify the work.
- Don't: Use flat branch names without a semantic prefix. / Use separators other than `/` between prefix and description. / Use vague or overly broad descriptions. / Use uppercase or camelCase in the description portion.

### cs:git.commit.message — Conventional commit messages
Commits that land on the main branch must follow the Conventional Commits specification. The format is `type(scope): description` where the type communicates the nature of the change, the optional scope narrows it to a package or module, and the description completes the sentence 'this commit will...'. This enables automated changelog generation, semantic version bumping, and scannable git history.
- Do: Structure commit messages as `type(scope): description`. / Use imperative mood in the description — complete the sentence "this commit will...". / Add a body separated by a blank line for non-trivial changes, and a footer for breaking changes. / Keep the subject line under 72 characters.
- Don't: Write commit messages without a type prefix. / Use past tense or non-imperative mood. / Write vague descriptions that don't explain the change. / Exceed 72 characters in the subject line.

### cs:git.commit.scope — Scope commits by package
The scope in a conventional commit should identify the package, module, or domain affected by the change. In a monorepo, the scope is typically the package name (without the namespace prefix). In a single-package repo, it is the module or feature area. Consistent scopes make `git log --grep` useful and enable per-package changelogs.
- Do: Use the package name (without namespace) as scope in a monorepo. / Use the module or feature area as scope in a single-package repo. / Omit the scope for changes that span the whole project.
- Don't: Use file names or paths as scopes — name the domain instead. / Use inconsistent names for the same package or domain — pick one and use it consistently. / Use overly broad scopes that don't narrow the change.

### cs:git.pr.template — Pull request template
Every repository must have a pull request template that guides contributors toward consistent, reviewable PRs. The template must include a summary of changes, QA/testing steps, and a readiness checklist. The PR title must follow conventional commits format since it becomes the squashed commit message on main.
- Do: Place a PR template at `.github/PULL_REQUEST_TEMPLATE.md` covering summary, QA steps, and a readiness checklist. / Enforce PR title format with CI — for example using `amannn/action-semantic-pull-request`. / Write a PR title that reads as a conventional commit since it will become the commit on main.
- Don't: Skip the PR template — without it, PRs lack structure and slow down reviews. / Write PR titles that don't follow conventional commits. / Skip QA steps — reviewers need to know how to verify the change.

### cs:git.remote.main_branch — Protected, squash-merged main
The main branch must be protected and should maintain a clean, linear-ish history of meaningful commits. Pull requests must be squash-merged so that each PR becomes a single conventional commit on main. This keeps `git log` on main scannable, bisectable, and suitable for automated changelog generation. Branch protection rules must prevent direct pushes and require passing CI.
- Do: Enable branch protection on `main` requiring review, up-to-date passing status checks, and no direct pushes. / Configure squash merge as the default (or only) merge strategy. / Ensure the squashed commit message follows conventional commits — the PR title becomes the commit on main. / Use the PR description body for additional context that will appear in the commit body.
- Don't: Allow direct pushes to `main`. / Use merge commits that pollute the main branch log. / Allow PRs to merge without passing CI. / Squash-merge with an auto-generated message that doesn't follow conventional commits.

### cs:git.repo.gitignore — Repo-scoped gitignore
Every repository must have a `.gitignore` that prevents build artifacts, dependencies, environment files, and tool caches from being committed. The repo-level gitignore covers project-specific patterns only. OS and editor ignores belong in the user's global gitignore (`~/.config/git/ignore`), not in the repository.
- Do: Ignore build output and compilation artifacts. / Ignore dependency directories. / Ignore environment and secrets files. / Ignore tool caches. / Keep OS and editor ignores in the user's global gitignore (`~/.config/git/ignore`), not in the repo.
- Don't: Commit a repository without a `.gitignore` — anything can get tracked accidentally. / Put OS or editor patterns in the repo-level `.gitignore` — these are user-specific and belong in the global gitignore. / Track generated files that can be reproduced from source. / Track secrets or credentials under any circumstances.

### cs:git.tag.versioning — Annotated SemVer release tags
Release tags must follow semantic versioning prefixed with `v` (e.g. `v1.2.3`). Tags must be annotated (not lightweight) so they carry metadata for tooling. Pre-release versions use a hyphenated identifier after the patch number. Automated tooling (Lerna, changesets, etc.) should derive version bumps from conventional commit types: `feat` → minor, `fix` → patch, `BREAKING CHANGE` → major.
- Do: Use the `v` prefix with semantic versioning for tags. / Use annotated tags (not lightweight) so they carry author and message metadata. / Use pre-release identifiers for non-stable releases. / Let conventional commits drive version bumps.
- Don't: Use lightweight tags for releases — they carry no metadata and some tools ignore them. / Omit the `v` prefix or substitute a non-standard one. / Use non-semver version formats. / Manually decide version numbers when conventional commits can derive them.

## turtle

### cs:turtle.naming.local_name_casing — Local name casing convention
Within a unified prefix namespace, differentiate between schema elements and instances using casing conventions for the local name (the part after the prefix colon):

- **PascalCase** for classes (e.g., `ds:Component`, `ds:UIElement`)
- **camelCase** for properties (e.g., `ds:name`, `ds:hasProperty`)
- **lowercase** with dot-separated hierarchy and snake_case inside multi-word segments for instances (e.g., `ds:global.component.button`, `cs:turtle.naming.local_name_casing`)

For code standards specifically, the subject IRI is the canonical identifier. Use `rdfs:label` only as a human-readable display title, never as a slug or lookup key.

This convention allows a single prefix to serve both definitions and data, with the casing clearly indicating the type of resource.
- Do: Use PascalCase for class names. / Use camelCase for property names. / Use lowercase with dots for hierarchy and snake_case for multi-word instance segments.
- Don't: Use lowercase for class names. / Use PascalCase for instance identifiers. / Use PascalCase or uppercase for property names.

### cs:turtle.naming.unified_prefix — Unified prefix
When a package uses a single namespace for both ontology and data, use a unified prefix with casing to distinguish between classes, properties, and instances. This simplifies prefix management and makes the relationship between schema and data more apparent.

The namespace URI should be a base URI without a fragment or trailing path segment for ontology vs data (e.g., `https://ds.canonical.com/` rather than separate `https://ds.canonical.com/ontology#` and `https://ds.canonical.com/data/`).
- Do: Use a single prefix for both definitions and data.
- Don't: Use separate prefixes for ontology and data when a unified prefix is preferred.

### cs:turtle.structure.definitions_vs_data — Definitions vs data files
Turtle files must be organized into two directories based on their content:

- `definitions/` contains schema files (ontologies) with classes, properties, and datatypes
- `data/` contains instance files with actual data conforming to the schema

This separation allows tools to distinguish between schema and instance data, enables different validation rules, and makes the codebase easier to navigate.
- Do: Place ontology definitions (classes, properties, datatypes) in the `definitions/` directory. / Place instance data in the `data/` directory.
- Don't: Mix class definitions and instance data in the same file. / Place instance data in the `definitions/` directory.

### cs:turtle.syntax.prefix_declaration — Prefix declaration
Every Turtle file must declare all prefixes used within the file at the top of the file. Each prefix should be declared exactly once. Standard prefixes (rdf, rdfs, owl, xsd, skos) should be declared when used but are commonly understood.
- Do: Declare all prefixes at the top of the file.
- Don't: Declare the same prefix multiple times. / Use prefixes without declaring them.

## icons

### cs:icons.file.naming — Semantic kebab-case filenames
Icon files must:
- Use kebab-case naming
- Use semantic identifiers
- Do: Use kebab-case and a semantic identifier for the icon file name.
- Don't: Include size, theme, or redundant suffixes in the file name. / Use non-semantic or ambiguous names that do not describe the icon.

### cs:icons.file.storage — One SVG file per icon
Each icon shall be stored as a single SVG file in the `icons/` directory.
- Do: Store each icon as an individual SVG file in the designated `icons/` directory.
- Don't: Store icons in nested directories or use incorrect file extensions. / Combine multiple icons into a single SVG file.

### cs:icons.svg.color_usage — Inherit color via currentColor
Icon must use `fill` with `currentColor` for their paths and shapes.
- Do: Use `currentColor` for the `fill` of paths in non-branded icons.
- Don't: Use hard-coded colors in icons. / Use `opacity` to create different shades of a color.

### cs:icons.svg.group_element — Single group with matching ID
Each icon's SVG markup must contain a single `<g>` element with an `id` matching the filename (without `.svg`).
- Do: Include a single `<g>` element with an `id` that matches the filename.
- Don't: Use multiple `<g>` elements or an `id` that does not match the filename.

### cs:icons.svg.mask_usage — Masks for cutouts and overlays
Icons may use SVG masks to negate or partially negate paths, enabling advanced visual effects such as cutouts and overlays.
- Do: Use SVG <mask> elements to create negative space or overlays in icons.
Example / Use <rect> with fill="white" to define the mask area, and <path> with fill="black" to subtract shapes.
Example / Use opacity on mask paths to achieve partial negation (e.g., faded or semi-transparent cutouts).
Example / Reference the mask in the icon's main shape using mask="url(#mask-id)".
Example
- Don't: Use masks without clear purpose or visual benefit.
Example / use non-semantic mask ids or omit mask references in the main shape.
Example / rely on masks for simple icons that do not require negative space or overlays.
Example

### cs:icons.svg.viewbox — Uniform 16×16 viewBox
All icon SVGs must use a `viewBox` of `0 0 16 16`.
- Do: Set the `viewBox` attribute to `0 0 16 16` in the `<svg>` element.
- Don't: Use a `viewBox` with dimensions other than `16 16`. / Use a non-square `viewBox`. / Omit the `viewBox` attribute.

### cs:icons.type_safety.definition — Type-safe icon names
Icon names must be:
- Maintained in a type-safe constant array
- Used to generate the `IconName` type
- Defined in the icon exporter package
- Do: Define a constant array of icon names and derive the `IconName` type from it in the icon exporter package. / Import the `IconName` type in consumer code to ensure type safety. / Use `Pick` to restrict choices from `IconName` when necessary.
- Don't: Define icon name types or values on the consumer side. / Use a generic `string` type for icon names. / Maintain separate type and value definitions.

### cs:icons.variant.single_file — No size or theme variants
Each icon concept must have exactly one SVG file. Size and theme variants are not allowed.
- Do: Use a single SVG file for each icon and control its size and color with CSS.
- Don't: Create multiple files for different icon sizes. / Create multiple files for different themes.

## lit

### cs:lit.component.a11y.aria — ARIA on the inner element
Apply ARIA attributes to the inner interactive element, not the host.

In Lit components, model the accessible-name contract as an explicit reactive prop and forward it to the inner interactive element. Consumers must supply it when the component's slot contains non-text content (e.g. an icon-only button).

As a client-only progressive enhancement, `aria-label` can also be derived from slotted text content via `@slotchange`. However, `slotchange` is a browser DOM event — it never fires during SSR. Components rendered server-side will have no derived label until hydration completes. Do not rely on the derived value as a substitute for an explicit `aria-label` prop in SSR contexts.
- Do: Require `aria-label` explicitly and treat slot-derived text as a client-side enhancement only.
- Don't: Set ARIA on the host when wrapping a native interactive element. / Omit an explicit `aria-label` prop and rely solely on slot-derived text — this produces components with no accessible name during SSR.

### cs:lit.component.barrel-exports — Barrel exports for the public API
Each component folder must have an `index.ts` that re-exports the public API. The component must be re-exported using `export { default as [MyComponent] }` to match the `export default class` shape of the implementation file. Types must be re-exported using `export type *` (not `export *`, which would allow value exports to leak from files that should only contain type declarations).
- Do: Export the component using its default export alias and types using `export type *`.
- Don't: Use a named re-export — the component uses `export default class`, so `export { MyComponent }` would not resolve correctly. / Use `export *` for types — it allows value exports to leak, which types files must not do. / Omit the barrel file or fail to re-export types — consumers will be unable to import the component or its types through the package's public API.

### cs:lit.component.global-styles — Token inheritance across the shadow boundary
CSS custom properties inherit across the shadow DOM boundary. Tokens are available inside the shadow tree without redeclaration. See `cs:styling.tokens.types` and `cs:css.properties.values` for the full token rules. The one Lit-specific exception: UA stylesheets explicitly reset font properties on form elements (`button`, `input`, `select`, `textarea`). This reset fires inside the shadow tree too, so inherited `font-family` and related properties are zeroed out before they reach the component styles.
- Do: Explicitly restore inherited typography on form element roots — UA stylesheets reset these inside shadow DOM.
- Don't: Create a shared CSS reset file to handle the UA font reset — each component is responsible for its own `styles.css`, and shared files violate the component folder structure standard.

### cs:lit.component.imports — Side-effect imports register elements
Any file that uses a web component in a template must include a side-effect import of the component's `.js` file. This is what triggers the `@customElement` decorator and registers the element via `customElements.define()`. Without it, the element is unknown and renders as an empty node with no error thrown. The `import type` import is separate — it only provides TypeScript types and is erased at compile time. The side-effect form (`import "./file.js"`) and the value form (`import Name from "./file.js"`) are distinct constructs — only the side-effect form makes the intent explicit without importing an unused runtime value.
- Do: Include the side-effect import alongside the type import.
- Don't: Use a value import expecting to render with the class. Lit templates always use the tag name string, never the class directly. The value import becomes an unused binding. / Assume the element is already registered because it was imported elsewhere in the project — side-effect imports must be explicit in every file that uses the element.

### cs:lit.component.ssr — Server rendering with declarative shadow DOM
Lit SSR is provided by the `@lit-labs/ssr` package (currently Lit Labs — experimental). It renders Lit templates and LitElement components to static HTML in Node.js using Declarative Shadow DOM (DSD), without a full browser DOM. A minimal DOM shim (`@lit-labs/ssr-dom-shim`) is provided automatically, but most browser DOM APIs are unavailable on the server.

**Which lifecycle methods run on the server:**

| Method | Runs on server |
|---|---|
| `constructor()` | Yes ⚠️ |
| `willUpdate()` | Yes ⚠️ |
| `render()` | Yes ⚠️ |
| `hasChanged()` | Yes ⚠️ |
| `connectedCallback()` | No |
| `disconnectedCallback()` | No |
| `attributeChangedCallback()` | No |
| `shouldUpdate()` | No |
| `update()` | No |
| `firstUpdated()` | No |
| `updated()` | No |

Only `constructor()`, `willUpdate()`, and `render()` run during SSR. Any browser DOM access must be confined to the methods in the "No" column, or guarded explicitly. The `@slotchange` event is a browser DOM event — it never fires during SSR. See `cs:lit.component.a11y.aria` for the consequence of this on accessible name derivation.
- Do: Use `isServer` from `lit` to guard any browser-only logic that cannot be moved into a safe lifecycle method. / Confine imperative DOM access to lifecycle methods that are not called on the server — `updated()` is the standard choice. / Use optional chaining or `typeof` guards as lightweight protection against APIs outside the SSR DOM shim, when moving code into a safe lifecycle method is not practical.
- Don't: Access browser APIs in `constructor()`, `willUpdate()`, or `render()` — these three methods run on the server and the APIs will not exist. / Rely on `@slotchange` to derive values used in the server-rendered markup — the event never fires during SSR, so any value populated by it will be absent in the initial HTML.

### cs:lit.component.ssr.bundling — Keep Lit external in the bundle
This rule applies to the component library build and publish pipeline, not to applications that consume the library.

Lit uses conditional exports in `package.json` to provide different module variants for Node and browser environments. If `lit` is bundled into the library's output, the resulting file will contain only the variant for whichever environment the bundler targeted — it will not switch at runtime. A consuming app's bundler will then resolve to this locked-in variant regardless of whether it is building for Node or the browser, silently breaking SSR or client rendering depending on which was inlined.

The fix is to keep `lit` external in the library build. The bare `lit` specifier is then left in the library's output, and each consuming app's bundler resolves it against its own `node_modules` using the correct conditional export for its target environment.
- Do: Mark `lit` and all its subpaths as external in `vite.config.ts` so the conditional exports resolve correctly at the consumer's build time. / If bundling lit is unavoidable (e.g. CDN), produce separate browser and node bundles and declare them in conditional exports.
- Don't: Omit the external rule — Vite will inline lit into the output, locking in one environment's conditional export variant and silently breaking SSR or browser usage.

### cs:lit.component.ssr.hydration — Hydrating server-rendered components
After the server emits Declarative Shadow DOM HTML, the client must hydrate it to restore reactivity. This requires two things:

1. `@lit-labs/ssr-client/lit-element-hydrate-support.js` — installs LitElement's hydration support. **Must be imported before `lit` and before any component module**, otherwise the hydration hook is not in place when elements upgrade.
2. Loading the component module — triggers `customElements.define()` via `@customElement`, causing the element to upgrade and self-hydrate when it detects it was server-rendered with DSD.
- Do: Import the hydration support module first, before any component or `lit` import, in the client entry point.
- Don't: Import component modules before the hydration support module — hydration support must be installed before `lit` is first imported.

### cs:lit.component.structure.folder — One folder per web component
Each web component must reside in its own PascalCase-named folder. Component-specific files are prefixed with the component name (`[MyComponent].ts`, `[MyComponent].stories.ts`, `[MyComponent].tests.ts`). Domain-level files use generic names without the prefix (`index.ts`, `types.ts`, `styles.css`, `constants.ts`) — the folder name already provides the namespace. Subcomponents reside in a `common/` subfolder.
- Do: Place all component-related files within a single folder named after the component.
- Don't: Scatter files across different parts of the application. / Add redundant prefixes to domain-level files — the folder name already provides the namespace.

### cs:lit.component.styles — Styles in a separate CSS file
Component styles must be authored in a separate `styles.css` file, not inline as template literals. The file is imported into the component as `import styles from './styles.css'` and transformed at build time to Lit's `CSSResult` via a Vite plugin. TypeScript accepts `.css` imports through a `css.d.ts` declaration.

Two selectors are used, each with a distinct responsibility:

- **`:host`** — controls how the custom element participates in the **surrounding (outer) layout**. A custom element is `display: inline` by default; properties that belong here are those that define the element's footprint and behaviour from the parent's perspective: `display`, `width`/`min-width`/`max-width`, `align-self`/`justify-self`, `flex-grow`/`flex-shrink`/`flex-basis`, and `contain`. Nothing else belongs on `:host`.
- **`.ds.{component}`** — controls everything else: visual styles, internal layout, spacing, typography, token-based colors. The `ds` namespace scope on the root selector ensures consistent class-name structure and avoids collisions.
- Do: Author styles in a separate `.css` file and import them into the component. / Use `:host` only for properties that define the element's footprint in the outer layout. Set a default `display` value since custom elements are `display: inline` by default. / Always pair a default `:host` display with `:host([hidden]) { display: none }`. Without it, an explicitly set `display` on `:host` overrides the lower-specificity native `hidden` attribute, breaking `elem.hidden = true`. / Use `.ds.{component}` for all visual, layout, spacing, and token-based styles.
- Don't: Write styles inline as template literals — doing so loses CSS tooling and file co-location. / Put visual or internal layout styles on `:host` — they belong on `.ds.{component}`.

### cs:lit.component.styles.variables — The modifier token cascade
Component styles follow the token hierarchy defined in `cs:styling.tokens.types` and `cs:css.properties.values`. The modifier cascade (`--modifier-color-*` → `--modifier-importance-*` → `--button-color-*`) is read via nested `var()` fallbacks — all three layers are defined outside the component's own CSS.
- Do: Use the full modifier cascade with the component token as the innermost fallback.
- Don't: Redeclare a component token inside the component's own `:host` — it is already defined by the token system. Declaring it on `:host` hardcodes its value and overrides whatever the theme or consumer set.

### cs:lit.component.testing — Testing shadow and light DOM
Tests must query both the shadow DOM (for internals) and the light DOM (for slotted content). Always wait for custom element registration before querying the shadow tree.

Lit web component tests work directly with the DOM — there is no test-library abstraction that handles mounting and cleanup automatically. Each test suite must manually create and append the element in `beforeEach` and remove it in `afterEach`.

The element must also be typed as its concrete class (not `HTMLElement`) so properties and `updateComplete` are accessible.
- Do: Mount and unmount the element in hooks, typed as the component class. / Use `customElements.whenDefined()` before querying the shadow DOM. / Use `await elem.updateComplete` before asserting on reactive property changes. / Query slotted content via the light DOM (`elem.querySelector`) — slotted nodes remain in the light tree and are never accessible through `shadowRoot`.
- Don't: Type the element as `HTMLElement` — it loses access to component properties and `updateComplete`. / Query the shadow DOM before the element is defined or before `updateComplete` resolves when testing reactive properties — the shadow tree may not yet exist or may reflect stale state. / Use `shadowRoot` to assert on slotted content — slotted nodes are projected from the light DOM and will never appear inside `shadowRoot`.

### cs:lit.component.tsdoc — Component TSDoc from the ontology
Component TSDoc documentation must use the description from the design system ontology (DSL). The TSDoc should NOT include `@example` blocks since stories serve as the examples. The description should be copied verbatim from the DSL, maintaining the original wording and meaning.
- Do: Use the description from the DSL ontology verbatim.
- Don't: Write custom descriptions that deviate from the DSL. / Include `@example` blocks — stories fulfill this role. / Omit the `@implements` tag — it is the link between the component implementation and the DSL definition.

### cs:lit.component.types — Reactive properties typed in types.ts
Component props (reactive properties/attributes) must be typed in a `types.ts` file and imported into the component implementation. The component class must declare that it `implements` the props interface. Each prop must be documented with a TSDoc comment.
- Do: Define the interface with TSDoc-commented props in `types.ts`. / Import the type and use `implements` in the component class. / Use `reflect: true` on boolean props that map to CSS attribute selectors. Without it, the DOM attribute is never written and the CSS selector silently fails. / Use the `@implements` JSDoc tag in the component's TSDoc to link to the DSL.
- Don't: Define types inline in the component file — they belong in `types.ts`. / Omit the `implements` clause — it enforces that reactive properties stay in sync with the declared interface.

## svelte

### cs:svelte.component.effect-descriptions — Explain every $effect
Add a clear comment immediately above every `$effect` that states the side effect, the trigger or dependency intent, and why the effect is needed, so reviewers can validate correctness without reverse-engineering the effect body.
- Do: (Do) Place a comment directly above the `$effect` that explains the side effect, what should trigger it, and why it is needed.
```javascript
// Sync document title when pageTitle changes to keep browser context and accessibility cues up to date
$effect(() => {
  document.title = `${pageTitle} | Canonical`;
});
```
- Don't: (Don't) Use `$effect` without a comment.
```javascript
$effect(() => {
  document.title = `${pageTitle} | Canonical`;
});
```

### cs:svelte.component.native-prop-naming — Native attribute names for props
Name consumer-facing props with Svelte's native attribute names (for example `class`, `onclick`, `onchange`). Do not use React-style names such as `className` or `onClick`: Svelte forwards native attributes under these names. When a native-named prop is declared manually rather than inherited from `SvelteHTMLElements` — for example because it targets a different element than the forwarded rest attributes — keep the native name and the native type (`ClassValue` from `svelte/elements` for `class`), and document which element it applies to.
- Do: (Do) Accept the native `class` prop, aliasing it locally only to avoid the reserved word. When it targets a different element than the forwarded rest attributes, declare it manually with the native `ClassValue` type and document its target.
```svelte
<script lang="ts">
  import type { ClassValue, SvelteHTMLElements } from "svelte/elements";

  interface ItemProps extends Omit<SvelteHTMLElements["a"], "class"> {
    current?: boolean;
    /** CSS class applied to this item's `<li>`, in addition to the base classes. */
    class?: ClassValue;
  }

  const componentCssClassName = "ds breadcrumbs-item";
  let { current = false, class: className, children, ...rest }: ItemProps = $props();
</script>

<li class={[componentCssClassName, className]} class:current>
  <a {...rest}>{@render children?.()}</a>
</li>
```
- Don't: (Don't) Expose React-style `className` or `onClick` props.
```svelte
<script lang="ts">
  let { current = false, className, onClick }: ItemProps = $props();
</script>

<li class={["ds breadcrumbs-item", className]} class:current onclick={onClick}></li>
```

### cs:svelte.component.purity — Framework-agnostic components
Keep components framework-agnostic: receive all render data and behavior through props, emits, and callbacks, and do not import SvelteKit runtime modules (for example `$app/stores`, `$app/navigation`, or `$app/environment`) inside reusable UI components.
- Do: (Do) Pass data via props instead of importing from SvelteKit modules.
```svelte
<script>
  let { pageTitle } = $props();
</script>

<h1>{pageTitle}</h1>
```
- Don't: (Don't) Import from SvelteKit modules like `$app/stores`, `$app/navigation`, or `$app/environment`.
```svelte
<script>
  import { page } from '$app/stores';
</script>

<h1>{$page.data.title}</h1>
```

### cs:svelte.component.reference-naming — Naming refs by reactivity role
Name element references by reactivity role: use the `Ref` suffix for reactive references that participate in Svelte tracking (such as `bind:this`) and the `Element` suffix for non-reactive DOM lookups, so usage semantics are explicit at call sites.
- Do: (Do) Name reactive references (e.g., via `bind:this`) with the `Ref` suffix.
(Do) Name non-reactive references (e.g., via `querySelector`) with the `Element` suffix.
```svelte
<script>
  let containerRef = $state();

  $effect(() => {
    const headerElement = containerRef?.querySelector('h1');
  });
</script>

<div bind:this={containerRef}>
  <h1>Title</h1>
</div>
```
- Don't: (Don't) Use generic or ambiguous names for element references.
```svelte
<script>
  let container = $state();

  $effect(() => {
    const header = container.querySelector('h1');
  });
</script>

<div bind:this={container}>
  <h1>Title</h1>
</div>
```

### cs:svelte.component.use-call-sites — Call use functions at top level
Call `use…` functions only at top-level component scope. Do not invoke them inside handlers, conditionals, loops, or nested functions.
- Do: (Do) Call `use…` functions at the top-level scope of the `<script>` block.
```svelte
<script>
  const stopwatch = useStopwatch();

  function handleStart() {
    stopwatch.start();
  }
</script>

<button onclick={handleStart}>Start</button>
```
- Don't: (Don't) Call `use…` functions inside event handlers, conditionals, loops, or nested scopes.
```svelte
<script>
  function handleClick() {
    const stopwatch = useStopwatch();
    stopwatch.start();
  }
</script>

<button onclick={handleClick}>Start</button>
```

### cs:svelte.component.use-naming — Reserve the use prefix for runes
Reserve the `use…` prefix for functions that relay on internal runes definitions (e.g., `$state`, `$derived`, `$effect`) or capture lifecycle-bound behavior (e.g, `onMount`).
- Do: (Do) Use the `use…` prefix only for functions with reactive or lifecycle behavior.
```svelte
<script>
  const stopwatch = useStopwatch();
</script>
```

(Do) Use non-`use…` names for plain utilities.
```javascript
const formatted = formatDate(new Date());
```
- Don't: (Don't) Name plain helpers with the `use…` prefix.
```javascript
function useFormatDate(date) {
  return date.toISOString();
}
```

### cs:svelte.composition.attachment-naming — Name attachments by behavior
Name functions used with `{@attach ...}` according to observable behavior or intent (for example tooltip, focusTrap, observeHover), so call sites communicate what is being attached; avoid generic names that hide purpose.
- Do: (Do) Use verbs or nouns that describe the attachment's behavior (e.g., `tooltip`, `observeHover`).
```svelte
<button {@attach tooltip("Save changes")}>
  Save
</button>
```
- Don't: (Don't) Use vague or generic names like `handler` or `myAttachment`.
```svelte
<button {@attach handler(someData)}>
  Save
</button>
```

### cs:svelte.composition.customization — Native composition over component injection
Offer customization through Svelte-native composition — native attribute spreading, subcomponents, snippets, `{@attach}`, and `setContext` — instead of injecting a component. When an override escape hatch is genuinely needed, expose a typed snippet with a spreadable props object. See cs:svelte.composition.snippet-attributes.
- Do: (Do) Let consumers customize by spreading native attributes onto the element (extend the native element type).
```svelte
<script lang="ts">
  import type { SvelteHTMLElements } from "svelte/elements";
  type Props = SvelteHTMLElements["a"] & { active?: boolean };
  let { active = false, class: className, ...rest }: Props = $props();
</script>

<a class={["ds item", className]} class:active aria-current={active ? "page" : undefined} {...rest}></a>
```

(Do) When an override hook is needed, expose a typed snippet whose props object is fully typed and spreadable.
```svelte
<script lang="ts">
  import type { Snippet } from "svelte";
  type RenderProps = { href: string; "aria-current": "page" | undefined };
  let { href, active = false, children }: { href: string; active?: boolean; children?: Snippet<[RenderProps]> } = $props();
  const renderProps: RenderProps = { href, "aria-current": active ? "page" : undefined };
</script>

{#if children}
  {@render children(renderProps)}
{:else}
  <a {...renderProps}></a>
{/if}
```
- Don't: (Don't) Accept an injected component (React-style) for overrides, especially typed as `Component<any>`, which hides the injected props from the type system and narrows the element contract.
```typescript
export interface Props {
  Component: Component<any>;
  active?: boolean;
}
```
```svelte
<script lang="ts">
  let { Component, href, active = false }: Props = $props();
</script>

<!-- Injected props (href, aria-current) are invisible to Component's type -->
<Component {href} aria-current={active ? "page" : undefined} />
```

### cs:svelte.composition.reactivity-boundaries — Pass accessors across reactive boundaries
When reactive state crosses object or function boundaries, pass accessors (property getters or `get…` functions) instead of raw values so downstream code reads current state and preserves reactive tracking across reassignments.
- Do: (Do) Use property getters when working with objects (e.g., in `setContext`).
```typescript
let greeting = $state("Hello");

setContext('my-context', {
  get greeting() {
    return greeting;
  }
});
```
(Do) Use getter functions (prefixed with `get…`) when passing state to functions like `use…` hooks.
```typescript
// useStorage.ts
export function useStorage(getGreeting: () => string) {
  $effect(() => {
    localStorage.setItem('greeting', getGreeting());
  });
}

// MyComponent.svelte
useStorage(() => greeting);
```
- Don't: (Don't) Pass raw reactive values directly to objects or functions where tracking might be lost.
```typescript
// Object property - reactivity lost on reassignment
setContext('my-context', { greeting });

// Function argument - value is not reactive inside $effect
useStorage(greeting);
```

### cs:svelte.composition.snippet-attributes — Spreadable attribute objects for snippets
When rendering snippets that require consumer wiring, pass a descriptively named attributes object (for example `triggerProps`) that can be spread directly onto an element; do not pass positional attribute fragments or omit required wiring data.
- Do: (Do) Provide a `triggerProps` (or similarly named) object for spreading onto target elements.
```svelte
{@render trigger({
  popovertarget: popoverId,
  "aria-describedby": helpId
})}

<MyComponent>
  {#snippet trigger(triggerProps)}
     <button {...triggerProps}>
       Open Popover
     </button>
  {/snippet}
</MyComponent>
```
- Don't: (Don't) Pass individual HTML attributes as positional snippet arguments, which prevents consumers from spreading props and forces them to know both argument order and intended usage.
```svelte
{@render trigger(popoverId, helpId)}

<!-- Usage -->
<MyComponent>
  {#snippet trigger(popoverId, helpId)}
     <button
       popovertarget={popoverId}
       aria-describedby={helpId}
     >
       Open Popover
     </button>
  {/snippet}
</MyComponent>
```

(Don't) Render snippets without providing necessary attributes, forcing consumers to manually wire up internal IDs.
```svelte
{@render trigger()}

<MyComponent>
  {#snippet trigger()}
     <button popovertarget="hardcoded-id">
       Open Popover
     </button>
  {/snippet}
</MyComponent>
```

### cs:svelte.composition.snippets-vs-subcomponents — Choosing snippets or subcomponents
Use snippets to let consumers provide and position render content (default `children` plus named regions), and use subcomponents when behavior, state coordination, or styling contracts must be encapsulated; do not replace structured content slots with flattened string or object props.
- Do: (Do) Pass primary content via the default `children` snippet.
(Do) Use named snippets for multiple, distinct areas.
```svelte
<Card>
  {#snippet header()}
    <h3>Title</h3>
  {/snippet}

  <p>Main content using children snippet.</p>
</Card>
```
(Do) Use subcomponents to encapsulate specific behaviors and styles.
- Don't: (Don't) Pass complex content or UI structures via props instead of snippets.
```svelte
<Card
  header="Title"
  body="Main content"
/>
```

### cs:svelte.composition.stable-ids — Stable IDs with a fallback
When wiring element relationships, resolve a stable ID by defaulting to `$props.id()` fallback if no consumer id is provided.
- Do: (Do) Resolve a stable ID by combining an optional `id` prop with a fallback.
```typescript
const { id: idProp, ...rest } = $props();
const fallbackId = $props.id();
const id = $derived(idProp || fallbackId);
```
- Don't: (Don't) Fail to provide a fallback ID, breaking accessibility and internal wiring when the `id` prop is omitted.
```typescript
// No fallback if id is not provided
const { id, ...rest } = $props();
```

### cs:svelte.composition.subcomponents — Expose structured subcomponents
When a component contains repeated items or non-trivial layout composition, expose structured subcomponents (for example group, item, and action primitives) so consumers own iteration, markup order, and semantic HTML. Avoid hiding these decisions behind configuration props.
- Do: (Do) Expose constituent parts as subcomponents to give consumers control over HTML.
```svelte
<OptionsPanel>
  <form action="?/updateProfile" method="POST">
    <OptionsPanel.Group title="Profile">
      {#each groups[0].options as option}
        <OptionsPanel.Option
          name="profile-field"
          value={option.value}
          aria-label={option.label}
        >
          {option.label}
        </OptionsPanel.Option>
      {/each}
    </OptionsPanel.Group>
    <OptionsPanel.SubmitButton>Save</OptionsPanel.SubmitButton>
  </form>
</OptionsPanel>
```
- Don't: (Don't) Hide complex UI structures or iteration logic behind simple configuration props.
```svelte
<OptionsPanel {groups} submitLabel="Save" />
```

### cs:svelte.progressive-enhancement.ssr-runtime-access — Defer browser globals to the client
Avoid accessing browser-only globals (`window`, `document`, `navigator`, `localStorage`, and similar APIs) at module scope or component initialization scope. Access them only in client-only execution points such as `$effect`, event handlers, or after mount.
- Do: (Do) Access browser APIs inside `$effect` so code only runs on the client.
```svelte
<script>
  let width = $state(0);

  $effect(() => {
    width = window.innerWidth;
  });
</script>
```

(Do) Access browser APIs in event handlers if needed.
```svelte
<script>
  function copyUrl() {
    navigator.clipboard.writeText(window.location.href);
  }
</script>

<button onclick={copyUrl}>Copy URL</button>
```
- Don't: (Don't) Read browser globals at module or component initialization scope.
```svelte
<script>
  const initialWidth = window.innerWidth;
  const userAgent = navigator.userAgent;
</script>
```

### cs:svelte.testing.snippet-fixtures — Named snippet fixture modules
When testing a component that renders consumer-provided snippet content (`children` or named snippets), define reusable fixtures in a `.svelte` fixture module (for example `test.fixtures.svelte`). Declare the content as named snippets in a `<script lang="ts" module>` block and export them alongside the plain data each snippet renders.
- Do: (Do) Export named snippets and their backing data from a `.svelte` fixture module.
```svelte
<!-- test.fixtures.svelte -->
<script lang="ts" module>
  import Item from "./Item.svelte";

  export const oneItemProps = { id: 1, label: "First" } as const;
  export const itemsProps = [
    { id: 1, label: "First" },
    { id: 2, label: "Second" },
  ] as const;

  export { oneItem, items };
</script>

{#snippet oneItem()}
  <Item {...oneItemProps} />
{/snippet}

{#snippet items()}
  {#each itemsProps as { label, ...rest } (rest.id)}
    <Item {...rest}>{label}</Item>
  {/each}
{/snippet}
``` / (Do) Import the snippets as snippet props and assert against the exported data.
```typescript
import { render } from "vitest-browser-svelte";
import Component from "./Component.svelte";
import { items, itemsProps, oneItem, oneItemProps } from "./test.fixtures.svelte";

it("renders a single item", async () => {
  const page = render(Component, { children: oneItem });
  await expect.element(page.getByText(oneItemProps.label)).toBeVisible();
});

it("renders multiple items", () => {
  const page = render(Component, { children: items });
  expect(page.getByRole("listitem").elements()).toHaveLength(itemsProps.length);
});
```
- Don't: (Don't) Inline markup and duplicate literal data in each test, which cannot express snippets and drifts from the rendered content.
```typescript
it("renders multiple items", () => {
  // Snippet content cannot be declared here, so tests hardcode expectations
  const page = render(Component);
  expect(page.getByText("First")).toBeVisible();
  expect(page.getByText("Second")).toBeVisible();
});
```

## webcomponents

### cs:webcomponents.component.a11y.aria — ARIA on the interactive element
Apply ARIA attributes to the element that receives user focus and interaction. In wrapper components, this is usually an inner native control (for example, button or input), not the custom-element host. When the accessible name is dynamic, expose an explicit API (for example, an aria-label property) rather than relying on projected content to infer it.
- Do: Forward accessible-name attributes to the inner interactive element. / Treat explicit aria props as the primary accessibility contract for icon-only controls.
- Don't: Set ARIA only on the host when a separate inner control receives focus. / Rely exclusively on projected content to derive accessible names for critical controls.

### cs:webcomponents.component.a11y.focus — Shadow root focus delegation
Use `delegatesFocus: true` when attaching a shadow root so host focus forwards to the first focusable shadow element. This avoids managing host tabindex manually for button-like components.
- Do: Attach shadow root with focus delegation enabled.
- Don't: Add host tabindex management solely to compensate for missing focus delegation when the component already wraps a native focusable control.

### cs:webcomponents.component.a11y.keyboard — Keyboard interaction patterns
Interactive components must handle `keydown` events following WAI-ARIA Authoring Practices. Arrow keys navigate, `Enter`/`Space` activate, `Home`/`End` jump to first/last, `Escape` dismisses.
- Do: Handle keyboard events for the component's widget role. / Bind keydown handling on the interactive container and set an explicit role.
- Don't: Use only click handlers — keyboard-only users cannot activate the UI.

### cs:webcomponents.component.class-names — Namespaced CSS class names
A `componentCssClassName` constant should be defined at the top of the component module, using a ds namespace plus kebab name (for example, `ds button`). Apply it to the root element rendered inside shadow DOM, never to the host element itself — the host's class attribute is owned by consumers. When modifier states are accepted, build the class list from an array with `.filter(Boolean).join(' ')`. Child class names should be short and role-based; the root `.ds.{component}` selector provides scope.
- Do: Define a `componentCssClassName` constant and apply it on the internal root element. / When the component accepts modifier states, compose the class string from an ordered array. / Use short, role-based child class names and scope them under the root selector in CSS.
- Don't: Hardcode repeated class strings inline without a shared constant. / Mutate host classes to inject design-system namespace classes. / Prefix child class names with component names or BEM suffixes when root scoping already provides context.

### cs:webcomponents.component.naming — Component and custom element naming
Component classes must use PascalCase and be descriptive. Custom element names must be kebab-case and include a namespace (for example, `ds-button`). The class name does not include the namespace prefix — it matches the component concept only (for example, `Button`, not `DsButton`).
- Do: Use PascalCase for the class name and a namespaced kebab-case custom element tag.
- Don't: Include the namespace prefix in the class name. The namespace already exists in the tag name. / Use a non-namespaced or non-kebab-case custom element name.

### cs:webcomponents.component.slots — Typed props over open slots
Default to structured data APIs (typed props such as objects and arrays) instead of open content projection. Slots allow arbitrary light-DOM markup, making styling, layout guarantees, and semantic consistency harder to enforce. Only use slots when the consumer must provide real interactive/content nodes that cannot be expressed by the component's typed API. If a slot is required, it must be explicitly named and documented as part of a constrained contract (for example, named trigger/content slots), never as an unrestricted default slot. `::slotted()` can style only direct slotted children and cannot enforce full visual control, so tokenized props remain the primary customization mechanism.
- Do: Model visual content with typed object props so rendering stays controlled by the component. / Use arrays/objects for repeatable structured regions instead of requiring projected children. / When slot usage is unavoidable, expose only named slots with a strict contract and keep free-form default content disabled. / Define object-shape contracts and validate inputs at runtime for stable rendering and styling.
- Don't: Expose an unrestricted default slot as a public API for core components. This permits arbitrary consumer markup and breaks visual/semantic guarantees. / Use slots as the primary API for data that is already representable as typed objects. / Rely on `::slotted()` for strict design enforcement. Slotted elements keep their own styles and can override component intent.

## rust

### cs:rust.composition.result_chaining — Monadic Result chaining
Use monadic Result chaining with the ? operator and combinators like and_then, map, and or_else for clean, composable error handling. This is the Rust equivalent of Haskell's do-notation for the Either monad.
- Do: Use the ? operator for clean Result propagation. / Use and_then for dependent computations. / Use map for infallible transformations within Result. / Use or_else for fallback computations. / Combine multiple Results with the ? operator in sequence.
- Don't: Use nested match expressions for Result handling. / Use unwrap() or expect() to bypass error handling. / Ignore errors silently. / Convert all errors to strings early in the chain.

### cs:rust.errors.context_enrichment — Enrich errors with context
Always enrich errors with contextual information such as file paths, operation names, and relevant state. This dramatically improves debugging experience and follows the principle of errors as values.
- Do: Use thiserror to create structured, contextual error types. / Use map_err to add context when propagating errors. / Chain errors to preserve the full error trail. / Include actionable information in error messages.
- Don't: Use generic string errors that lose context. / Discard error information with unwrap or expect in library code. / Create error types without Display or Debug. / Use anyhow/eyre in library code (ok for applications).

### cs:rust.functions.kleisli_composition — Composable fallible functions
Structure functions as `A -> Result<B, E>` (Kleisli arrows) for composable, chainable transformations. This enables powerful composition patterns where each step can fail, following the monadic composition style from Haskell.
- Do: Design functions as Kleisli arrows: `A -> Result<B, E>`. / Use combinators to compose fallible operations. / Create helper traits for method chaining when needed. / Use the pipe pattern for readability.
- Don't: Mix side effects into pure transformation chains. / Break the chain with early returns when and_then works. / Use unwrap in the middle of a chain.

### cs:rust.iterators.combinator_pipelines — Iterator pipelines over loops
Prefer iterator combinators (map, filter, flat_map, collect) over imperative loops for data transformations. This functional style is more declarative, composable, and often more performant due to lazy evaluation and compiler optimizations.
- Do: Use iterator chains for data transformations. / Use flat_map for one-to-many transformations. / Use filter_map to combine filter and map operations. / Use fold/reduce for accumulating results. / Chain multiple operations for complex transformations. / Use collect with turbofish for type-driven collection.
- Don't: Use imperative loops when combinators are clearer. / Collect intermediate results unnecessarily. / Use for loops just to build up a Vec. / Nest loops when flat_map works.

### cs:rust.option.explicit_absence — Make absence explicit with Option
Use Option explicitly and idiomatically; prefer Option<T> combinators (map, and_then, unwrap_or, ok_or) over null-like patterns. Option is Rust's Maybe monad - use it as such.
- Do: Use Option combinators for clean transformations. / Use unwrap_or and unwrap_or_else for defaults. / Use ok_or to convert Option to Result. / Use filter and filter_map for conditional processing. / Use the ? operator with Option in functions returning Option.
- Don't: Use sentinel values instead of Option. / Overuse unwrap() or expect() outside of tests. / Check is_some/is_none then unwrap. / Create deeply nested Option chains without combinators.

### cs:rust.testing.property_based — Property-based testing for invariants
Complement unit tests with property-based testing to verify invariants across many generated inputs. This QuickCheck-inspired approach catches edge cases that example-based tests miss.
- Do: Use proptest for property-based testing. / Test algebraic properties (identity, associativity, commutativity). / Test invariants that should hold for all valid inputs. / Use custom strategies for domain-specific types.
- Don't: Only write example-based unit tests for complex logic. / Ignore test failures without understanding the counterexample. / Write properties that are too weak or tautological. / Generate invalid inputs without proper filtering.

### cs:rust.testing.tdd_red_green_refactor — Red, green, refactor
Follow the strict TDD cycle: write a failing test first (red), implement minimally to pass (green), then refactor. This discipline ensures testability, prevents regression, and drives better design.
- Do: Write the test first, watch it fail. / Implement the minimum code to pass. / Refactor while keeping tests green. / Add tests for edge cases incrementally. / Use test modules colocated with implementation.
- Don't: Write implementation before tests. / Write tests that pass trivially or test nothing. / Skip the refactor step. / Write tests after the fact that just confirm current behavior. / Test private implementation details.

### cs:rust.traits.small_composable — Small, composable traits
Prefer small, focused traits that compose well over large monolithic interfaces. This Haskell typeclass-inspired approach enables better abstraction, easier testing, and more flexible code reuse.
- Do: Design small, single-purpose traits. / Compose traits using supertraits and bounds. / Use extension traits to add methods to existing types. / Implement standard library traits for interoperability.
- Don't: Create large, monolithic traits. / Use trait objects when generics suffice. / Require unused trait methods via blanket requirements. / Use associated types when generic parameters work better.

### cs:rust.types.discriminated_unions — Model variants with enums
Model state and variants with enums (algebraic sum types) rather than flags, inheritance, or stringly-typed values. Exhaustive pattern matching ensures all cases are handled at compile time - Rust's killer feature borrowed from ML/Haskell.
- Do: Use enums to model mutually exclusive states. / Use enums for state machines with compile-time guarantees. / Use enums to make invalid states unrepresentable. / Leverage exhaustive matching for safety.
- Don't: Use boolean flags for mutually exclusive states. / Use Option when you need more than two states. / Use inheritance-like patterns with trait objects when enums suffice. / Use integers or strings as type discriminators.

### cs:rust.types.newtype_wrappers — Newtype wrappers for domain values
Use the newtype pattern to create distinct types for domain-specific values, preventing accidental mixing of semantically different data. This Haskell-inspired pattern provides compile-time safety with zero runtime cost.
- Do: Wrap primitive types in newtypes for domain semantics. / Use newtypes to distinguish semantically different IDs. / Derive common traits to maintain ergonomics. / Use phantom types for compile-time state tracking.
- Don't: Use raw primitive types for domain concepts. / Create newtypes without validation when invariants exist. / Over-wrap types that don't need semantic distinction.

### cs:rust.validation.typestate_guards — Parse, don't validate
Use constructor validation to ensure only valid states can exist. Follow the 'parse, don't validate' principle: transform unvalidated data into validated types at system boundaries, making invalid states unrepresentable.
- Do: Validate in constructors to ensure type invariants. / Use the typestate pattern for compile-time state enforcement. / Parse into validated types at system boundaries. / Make the validated state obvious in function signatures.
- Don't: Scatter validation logic throughout the codebase. / Allow construction of invalid objects. / Use validation functions that return bool. / Re-validate already-validated data.
