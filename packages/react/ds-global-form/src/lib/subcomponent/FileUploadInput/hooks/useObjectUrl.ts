import { useEffect, useState } from "react";

/**
 * An object URL for a file, created after mount and revoked when the file
 * changes or the component unmounts. `undefined` during server rendering, on
 * the first client render, and where object URLs are not supported.
 */
export default function useObjectUrl(file: File): string | undefined {
  const [url, setUrl] = useState<string>();

  useEffect(() => {
    if (typeof URL.createObjectURL !== "function") return;
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
      setUrl(undefined);
    };
  }, [file]);

  return url;
}
