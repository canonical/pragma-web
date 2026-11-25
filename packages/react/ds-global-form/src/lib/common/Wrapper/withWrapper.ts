import * as React from "react";
import { useMemo, useState } from "react";
import type {
  BaseInputProps,
  BaseWrapperProps,
  Condition,
  Middleware,
  WrappedComponentProps,
  WrapperProps,
} from "../types.js";
import DefaultWrapper from "./Wrapper.js";
import withConditionalDisplay from "./withConditionalDisplay.js";

type WrappedComponentPropsInternal<ComponentProps extends BaseInputProps> =
  Omit<WrappedComponentProps<ComponentProps>, "Component"> & {
    condition?: Condition;
  };

/** Whether two middleware lists hold the same middleware in the same order. */
const isSameMiddleware = <ComponentProps>(
  current: Middleware<ComponentProps>[],
  next: Middleware<ComponentProps>[],
): boolean =>
  current.length === next.length &&
  current.every((hoc, index) => hoc === next.at(index));

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
    // An inline `middleware={[...]}` array is new on every render. Keep the
    // previous list while it holds the same middleware, so the composed
    // component keeps its identity and the input does not remount (which
    // would drop its state and repeat any request a middleware makes).
    const [appliedMiddleware, setAppliedMiddleware] = useState(middleware);
    if (!isSameMiddleware(appliedMiddleware, middleware)) {
      setAppliedMiddleware(middleware);
    }

    // We apply the middleware to the component in reverse order
    // so that the first middleware in the array is the first to be applied to the component
    const ExtendedComponent = useMemo(
      () =>
        // The middleware happens between the Wrapper and the Component,
        // hence the return type of P
        [...appliedMiddleware]
          .reverse()
          .reduce<React.ComponentType<ComponentProps>>(
            (AccumulatedComponent, hoc) => hoc(AccumulatedComponent),
            MemoizedComponent,
          ),
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
      WrapperComponent,
      finalProps as WrapperProps<ComponentProps>,
    );
  }
  return withConditionalDisplay(WrappedComponent);
};

export default withWrapper;
