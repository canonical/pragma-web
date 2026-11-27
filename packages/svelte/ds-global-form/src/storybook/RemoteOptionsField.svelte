<script lang="ts" generics="Data">
  import type { SelectFieldProps } from "../lib/component/SelectField/types.js";
  import { Field } from "../lib/pattern/Field/index.js";
  import type { Option } from "../lib/subcomponent/types.js";
  import createRemoteOptions from "../lib/utils/middleware/createRemoteOptions.svelte.js";

  let {
    url,
    transformData,
    ...props
  }: Omit<SelectFieldProps, "options"> & {
    url: string;
    transformData?: (data: Data) => Option[];
  } = $props();

  const remote = createRemoteOptions<Data>(() => url, {
    get transformData() {
      return transformData;
    },
  });
</script>

<Field inputType="select" {...remote.fieldProps} {...props} />

<!-- @component
A select field whose options come from an endpoint through
`createRemoteOptions`: disabled and busy while loading, with the failure as
its error.
-->
