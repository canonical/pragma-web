import {
  type ComponentType,
  createContext,
  createElement,
  useContext,
} from "react";
import type { BaseInputProps, Middleware } from "../types.js";

/**
 * Builds the component a middleware renders around the field's input.
 * `useSettings` is a hook: it returns the settings of the newest middleware at
 * the same place in the field's `middleware` list, so the component keeps
 * working with fresh settings without being rebuilt.
 */
export type MiddlewareBuilder<Settings, Constraint extends BaseInputProps> = <
  Props extends Constraint,
>(
  Component: ComponentType<Props>,
  useSettings: () => Settings,
) => ComponentType<Props>;

/** A middleware for any field whose props extend `Constraint`. */
export type ConfiguredMiddleware<Constraint extends BaseInputProps> = <
  Props extends Constraint,
>(
  Component: ComponentType<Props>,
) => ComponentType<Props>;

type Registration = {
  build: MiddlewareBuilder<unknown, BaseInputProps>;
  settings: unknown;
};

/** The builder and settings of every middleware made by `createMiddleware`. */
const registrations = new WeakMap<object, Registration>();

/** The settings of the field's current middleware, by place in its list. */
const MiddlewareSettingsContext = createContext<readonly unknown[]>([]);

/**
 * Turns a middleware builder into a factory taking settings.
 *
 * Fields compare middleware made by the same factory by their builder, not by
 * identity, so a factory called inline (`middleware={[addAudit(url)]}`) gives
 * the same component on every render: the input does not remount and keeps
 * its state, and the component reads the newest settings through
 * `useSettings`. Called outside a field, the middleware uses the settings it
 * was made with.
 *
 * @param build - Builds the component from the wrapped one.
 * @returns A factory making a middleware from settings.
 * @note Impure: the factory records each middleware it makes, with its builder
 * and settings, in a module-level `WeakMap` that fields read.
 *
 * `import { createMiddleware } from "@canonical/react-ds-global-form";`
 */
export default function createMiddleware<
  Settings,
  Constraint extends BaseInputProps = BaseInputProps,
>(
  build: MiddlewareBuilder<Settings, Constraint>,
): (settings: Settings) => ConfiguredMiddleware<Constraint> {
  return (settings) => {
    const middleware: ConfiguredMiddleware<Constraint> = (Component) =>
      build(Component, () => settings);
    registrations.set(middleware, {
      build: build as MiddlewareBuilder<unknown, BaseInputProps>,
      settings,
    });
    return middleware;
  };
}

/** What identifies a middleware across renders: its builder, or itself. */
const identify = (middleware: object): object =>
  registrations.get(middleware)?.build ?? middleware;

/** Whether two middleware lists build the same components in the same order. */
export const isSameMiddleware = <ComponentProps>(
  current: Middleware<ComponentProps>[],
  next: Middleware<ComponentProps>[],
): boolean =>
  current.length === next.length &&
  current.every((middleware, index) => {
    const other = next.at(index);
    return other !== undefined && identify(middleware) === identify(other);
  });

/** The settings of the middleware layer being rendered. */
const LayerSettingsContext = createContext<unknown>(undefined);

/** Reads the settings of the middleware layer being rendered. */
function useLayerSettings(): unknown {
  return useContext(LayerSettingsContext);
}

/**
 * Wraps a layer built by `createMiddleware` so it reads the settings of the
 * middleware at `index` in the field's current list.
 */
const provideLayerSettings = <ComponentProps>(
  Layer: ComponentType<ComponentProps>,
  index: number,
): ComponentType<ComponentProps> =>
  function MiddlewareLayer(props: ComponentProps) {
    const settings = useContext(MiddlewareSettingsContext).at(index);
    return createElement(
      LayerSettingsContext.Provider,
      { value: settings },
      createElement(Layer as ComponentType<object>, props as object),
    );
  };

/**
 * Applies the middleware to the component, the first one outermost. A
 * middleware made by `createMiddleware` reads its settings from
 * `MiddlewareSettingsContext`, which the field provides.
 */
export const composeMiddleware = <ComponentProps>(
  middleware: Middleware<ComponentProps>[],
  Component: ComponentType<ComponentProps>,
): ComponentType<ComponentProps> =>
  middleware.reduceRight((Accumulated, hoc, index) => {
    const registration = registrations.get(hoc);
    if (!registration) return hoc(Accumulated);
    const Layer = registration.build(
      Accumulated as ComponentType<BaseInputProps>,
      useLayerSettings,
    ) as ComponentType<ComponentProps>;
    return provideLayerSettings(Layer, index);
  }, Component);

/** The settings of each middleware in the list, by place. */
export const readMiddlewareSettings = <ComponentProps>(
  middleware: Middleware<ComponentProps>[],
): unknown[] => middleware.map((hoc) => registrations.get(hoc)?.settings);

export { MiddlewareSettingsContext };
