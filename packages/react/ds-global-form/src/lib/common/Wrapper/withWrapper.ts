import * as React from "react";
import { useMemo, useState } from "react";
import type {
  BaseInputProps,
  BaseWrapperProps,
  WrappedComponentProps,
  WrapperProps,
} from "../types.js";
import {
  composeMiddleware,
  isSameMiddleware,
  MiddlewareSettingsContext,
  readMiddlewareSettings,
} from "./createMiddleware.js";
import DefaultWrapper from "./Wrapper.js";
import withConditionalDisplay from "./withConditionalDisplay.js";

type WrappedComponentPropsInternal<ComponentProps extends BaseInputProps> =
  Omit<WrappedComponentProps<ComponentProps>, "Component" | "condition">;

const withWrapper = <
  ComponentProps extends BaseInputProps,
  ComponentWrapperProps extends
    BaseWrapperProps<ComponentProps> = WrapperProps<ComponentProps>,
>(
  Component: React.ComponentType<ComponentProps>,
  options?: Partial<ComponentWrapperProps>,
  Wrapper: React.ComponentType<WrapperProps<ComponentProps>> = DefaultWrapper,
  // Ideally, we should use something like this, but this creates a type error for the WrappedComponentProps
  // Wrapper: React.ComponentType<ComponentWrapperProps> = DefaultWrapper as React.ComponentType<ComponentWrapperProps>,
) => {
  const MemoizedComponent = React.memo(Component);

  function WrappedComponent({
    middleware = [],
    WrapperComponent = Wrapper,
    ...props
  }: WrappedComponentPropsInternal<ComponentProps>): React.ReactElement {
    // An inline `middleware={[...]}` array is new on every render, and so is
    // a middleware a factory makes inline. Keep the previous list while it
    // builds the same components, so the composed component keeps its
    // identity and the input does not remount (which would drop its state and
    // repeat any request a middleware makes). Middleware made by
    // `createMiddleware` read their newest settings from context instead.
    const [appliedMiddleware, setAppliedMiddleware] = useState(middleware);
    if (!isSameMiddleware(appliedMiddleware, middleware)) {
      setAppliedMiddleware(middleware);
    }

    // The middleware happens between the Wrapper and the Component, and the
    // first middleware in the array is the outermost.
    const ExtendedComponent = useMemo(
      () => composeMiddleware(appliedMiddleware, MemoizedComponent),
      [appliedMiddleware],
    );

    // Type casting to avoid hard to read overloads.
    const finalProps = {
      // Component: MemoizedComponent,
      Component: ExtendedComponent,
      ...props,
      ...options,
    };
    // } as WrapperProps<ComponentProps>; // The typing should be ComponentWrapperProps, but it would require an overload

    return React.createElement(
      MiddlewareSettingsContext.Provider,
      { value: readMiddlewareSettings(middleware) },
      React.createElement(
        WrapperComponent,
        finalProps as WrapperProps<ComponentProps>,
      ),
    );
  }
  return withConditionalDisplay(WrappedComponent);
};

export default withWrapper;
