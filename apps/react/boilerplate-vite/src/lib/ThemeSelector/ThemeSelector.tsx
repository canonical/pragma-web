import { useTranslation } from "@canonical/i18n-react";
import { SelectInput } from "@canonical/react-ds-global-form";
import { usePreferredTheme } from "@canonical/react-hooks";
import type { ChangeEvent, ReactElement } from "react";

export default function ThemeSelector(): ReactElement {
  const { value, source, set, reset } = usePreferredTheme();
  const { t } = useTranslation();

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const selected = event.target.value;

    if (selected === "system") {
      reset();
    } else {
      set(selected as "light" | "dark");
    }
  }

  const selectValue = source === "system" ? "system" : value;

  return (
    <SelectInput
      aria-label={t("theme.label")}
      onChange={handleChange}
      options={[
        { value: "system", label: t("theme.system") },
        { value: "light", label: t("theme.light") },
        { value: "dark", label: t("theme.dark") },
      ]}
      value={selectValue}
    />
  );
}
