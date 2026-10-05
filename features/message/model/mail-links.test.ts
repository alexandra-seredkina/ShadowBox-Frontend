import { describe, expect, it } from "vitest";
import { analyzeLinks, linksInText, webHost } from "./mail-links";

describe("analyzeLinks", () => {
  it("flags a link whose text names another site", () => {
    const [link] = analyzeLinks([{ href: "https://paypa1-secure.example/login", text: "www.paypal.com" }]);
    expect(link).toMatchObject({ host: "paypa1-secure.example", shownHost: "www.paypal.com", isMismatch: true });
  });

  it("accepts a subdomain of the site the text names", () => {
    const [link] = analyzeLinks([{ href: "https://www.github.com/settings", text: "github.com" }]);
    expect(link?.isMismatch).toBe(false);
  });

  it("does not flag text that names no domain", () => {
    const [link] = analyzeLinks([{ href: "https://shop.example/offer", text: "See the offer" }]);
    expect(link).toMatchObject({ shownHost: null, isMismatch: false });
  });

  it("compares a look-alike Cyrillic domain in its punycode form", () => {
    const [link] = analyzeLinks([{ href: "https://apple.com/", text: "аpple.com" }]);
    expect(link?.shownHost).toBe("xn--pple-43d.com");
    expect(link?.isMismatch).toBe(true);
  });

  it("drops links that do not open a web page and repeats", () => {
    const links = analyzeLinks([
      { href: "mailto:help@example.com", text: "Write to us" },
      { href: "javascript:alert(1)", text: "Click" },
      { href: "https://example.com/a", text: "A" },
      { href: "https://example.com/a", text: "A" },
    ]);
    expect(links.map((link) => link.href)).toEqual(["https://example.com/a"]);
  });
});

describe("webHost", () => {
  it("returns the host only for http and https", () => {
    expect(webHost("https://Example.COM/path")).toBe("example.com");
    expect(webHost("data:text/html,hi")).toBeNull();
    expect(webHost("not a url")).toBeNull();
  });
});

describe("linksInText", () => {
  it("finds bare URLs in plain text", () => {
    expect(linksInText("Go to https://example.com/reset now, or http://x.example.").map((link) => link.href)).toEqual([
      "https://example.com/reset",
      "http://x.example.",
    ]);
  });
});
