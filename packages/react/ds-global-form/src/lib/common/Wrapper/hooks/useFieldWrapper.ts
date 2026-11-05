import { useEffect, useRef } from "react";
import { type RegisterOptions, useFormContext } from "react-hook-form";

import {
  useFieldAriaProperties,
  useFieldError,
} from "../../../utils/hooks/index.js";
import messages from "../messages.js";

type UseFieldWrapperOptions = {
  label?: string;
  isOptional?: boolean;
  userRegisterProps?: RegisterOptions;
  nestedRegisterProps?: RegisterOptions;
  unregisterOnUnmount?: boolean;
};

/**
 * Hook to provide field wrapper utilities
 * @param name - The name of the field
 * @param options - Additional options
 */
const useFieldWrapper = (
  name: string,
  options: UseFieldWrapperOptions = {},
) => {
  const {
    label,
    isOptional = false,
    userRegisterProps = {},
    nestedRegisterProps = {},
    unregisterOnUnmount = true,
  } = options;

  const fieldError = useFieldError(name);

  const isError = !!fieldError;

  const ariaProps = useFieldAriaProperties(name, isError, !isOptional);

  const registerProps = {
    ...nestedRegisterProps,
    ...(!isOptional
      ? { required: { value: true, message: messages.required(label || name) } }
      : {}),
    ...userRegisterProps,
  } as RegisterOptions;

  const { unregister } = useFormContext();

  const lifecycle = useRef({ name, unregister, unregisterOnUnmount });
  useEffect(() => {
    lifecycle.current = { name, unregister, unregisterOnUnmount };
  }, [name, unregister, unregisterOnUnmount]);
  useEffect(() => {
    return () => {
      if (lifecycle.current.unregisterOnUnmount) unregister(name);
    };
  }, [name, unregister]);

  return {
    fieldError,
    isError,
    ariaProps,
    registerProps,
  };
};
export default useFieldWrapper;
