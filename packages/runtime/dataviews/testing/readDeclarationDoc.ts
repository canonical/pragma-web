import readGroup from "./readGroup.js";

/**
 * Read the TSDoc block right before a name's exported declaration in one
 * source text: an empty string when the declaration has none, null when the
 * text does not declare the name.
 */
export default function readDeclarationDoc(
  source: string,
  name: string,
): string | null {
  const escaped = name.replace(/\$/g, "\\$");
  const declaration = new RegExp(
    `(?:^|\\n)((?:[ \\t]*/\\*\\*(?:(?!\\*/)[\\s\\S])*\\*/\\s*)?)export (?:default )?(?:declare )?(?:async )?(?:function\\*?|const|let|class|abstract class|type|interface|enum) ${escaped}(?![\\w$])`,
  );
  const match = declaration.exec(source);
  if (match === null) {
    return null;
  }
  return readGroup(match, 1).trim();
}
