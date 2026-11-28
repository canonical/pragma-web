/**
 * An object URL for a file, created after mount and revoked when the file
 * changes or the component unmounts. `undefined` without a file, during server
 * rendering, before the first effect runs, and where object URLs are not
 * supported.
 * @note Impure: creates state and an effect; call during component
 * initialisation.
 */
export default function useObjectUrl(readFile: () => File | undefined): {
  readonly url: string | undefined;
} {
  let url = $state<string>();

  $effect(() => {
    const file = readFile();
    if (!file || typeof URL.createObjectURL !== "function") return;
    const objectUrl = URL.createObjectURL(file);
    url = objectUrl;
    return () => {
      URL.revokeObjectURL(objectUrl);
      url = undefined;
    };
  });

  return {
    get url() {
      return url;
    },
  };
}
