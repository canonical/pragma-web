import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as G from "@canonical/react-ds-global";
console.log(Object.keys(G).join(", "));
const B: any = (G as any).Button;
console.log(renderToStaticMarkup(<B>Hello</B>));
console.log(renderToStaticMarkup(<B appearance="positive">Hi</B>));
