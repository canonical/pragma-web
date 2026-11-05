import * as React from "react";
import type {
  BaseInputProps,
  BaseWrapperProps,
  Condition,
  WrappedComponentProps,
  WrapperProps,
} from "../types.js";
import DefaultWrapper from "./Wrapper.js";
import withConditionalDisplay from "./withConditionalDisplay.js";

const noMiddleware: never[] = [];

type WrappedComponentPropsInternal<ComponentProps extends BaseInputProps> =
  Omit<WrappedComponentProps<ComponentProps>, "Component"> & {
    condition?: Condition;
  };

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
    middleware = noMiddleware,
    WrapperComponent = Wrapper,
    ...props
  }: WrappedComponentPropsInternal<ComponentProps>): React.ReactElement {
    const committed = React.useRef<{
      middleware: typeof middleware;
      component: React.ComponentType<ComponentProps>;
    } | null>(null);
    const previous = committed.current;
    // Only committed compositions may be reused after a suspended render.
    const ExtendedComponent =
      previous &&
      previous.middleware.length === middleware.length &&
      middleware.every((hoc, index) => previous.middleware.at(index) === hoc)
        ? previous.component
        : [...middleware]
            .reverse()
            .reduce<React.ComponentType<ComponentProps>>(
              (component, hoc) => hoc(component),
              MemoizedComponent,
            );
    React.useLayoutEffect(() => {
      committed.current = {
        middleware: [...middleware],
        component: ExtendedComponent,
      };
    });

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
