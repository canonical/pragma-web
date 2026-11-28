import { withTooltip } from "@canonical/react-ds-global";
import type React from "react";
import { createContext, useContext } from "react";
import type { ThumbnailProps } from "./types.js";

/**
 * The image URL for the preview. The tooltip's message is fixed when the
 * tooltip is made, so the per-file URL reaches it through context, which
 * carries across the tooltip's portal.
 */
const PreviewUrl = createContext<string | undefined>(undefined);

/**
 * The whole image, uncropped. Decorative, like the thumbnail it enlarges: the
 * file name on the tile already names the file, so a text alternative would
 * only repeat it.
 */
const Preview = (): React.ReactElement | null => {
  const url = useContext(PreviewUrl);
  return url ? <img src={url} alt="" /> : null;
};

/** The 60×36 thumbnail box, filled edge to edge by the image. */
const ThumbnailBox = ({ url }: ThumbnailProps): React.ReactElement => (
  <span className="thumbnail">{url && <img src={url} alt="" />}</span>
);

const PreviewedThumbnailBox = withTooltip(ThumbnailBox, <Preview />, {
  className: "thumbnail-preview",
  messageElementClassName: "file-upload-preview",
});

/**
 * A file's image thumbnail. Hovering it shows the whole image in a tooltip,
 * since the thumbnail crops it to fill its box. The preview reuses the
 * thumbnail's object URL, and appears only once that URL exists.
 *
 * The thumbnail takes no keyboard focus: the preview only enlarges a
 * decorative image, and a stop on every image tile would slow keyboard
 * movement through the list.
 */
const Thumbnail = ({ url }: ThumbnailProps): React.ReactElement => {
  if (!url) return <ThumbnailBox />;
  return (
    <PreviewUrl.Provider value={url}>
      <PreviewedThumbnailBox url={url} />
    </PreviewUrl.Provider>
  );
};

export default Thumbnail;
