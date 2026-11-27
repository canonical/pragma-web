import type { RequestHandler } from "./$types";

export const GET: RequestHandler = ({ url }) => {
  const escape = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
  const paths = ["/", "/catalog", "/catalog/compute", "/catalog/storage", "/contact", "/account"];
  const entries = paths.map((path) => `<url><loc>${escape(new URL(path, url.origin).href)}</loc></url>`).join("");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</urlset>`, {
    headers: { "content-type": "application/xml; charset=utf-8" },
  });
};
