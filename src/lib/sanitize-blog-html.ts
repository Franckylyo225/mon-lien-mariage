import sanitizeHtml from "sanitize-html";

/**
 * Allow-list sanitizer for blog posts authored in the admin WYSIWYG editor
 * (Tiptap: paragraphs, headings, lists, quotes, links, images, basic marks).
 * Everything else — scripts, event handlers, iframes, inline styles,
 * javascript:/data: URLs — is removed. Works on the server and the client.
 */
export function sanitizeBlogHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "p",
      "br",
      "hr",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "ul",
      "ol",
      "li",
      "blockquote",
      "pre",
      "code",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "s",
      "a",
      "img",
      "figure",
      "figcaption",
      "div",
      "span",
    ],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "width", "height"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["http", "https"] },
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          rel: "noopener noreferrer nofollow",
          ...(attribs.target ? { target: "_blank" } : {}),
        },
      }),
    },
  });
}
