import { describe, expect, it } from "vitest";
import { localizePath } from "./locales";
import { negotiateLocale } from "./negotiate-locale";

describe("negotiateLocale", () => {
  it("picks the first supported language by quality", () => {
    expect(negotiateLocale("fr-FR,fr;q=0.9,de;q=0.8,ru;q=0.7")).toBe("de");
  });

  it("matches region-specific tags by their base language", () => {
    expect(negotiateLocale("ru-RU,ru;q=0.9")).toBe("ru");
  });

  it("honours quality values over header order", () => {
    expect(negotiateLocale("en;q=0.3,ru;q=0.9")).toBe("ru");
  });

  it("ignores languages explicitly refused with q=0", () => {
    expect(negotiateLocale("ru;q=0,de")).toBe("de");
  });

  it("falls back to English for unsupported or missing headers", () => {
    expect(negotiateLocale("fr,es;q=0.5")).toBe("en");
    expect(negotiateLocale(null)).toBe("en");
    expect(negotiateLocale("")).toBe("en");
  });
});

describe("localizePath", () => {
  it("prefixes pages, anchors and the root", () => {
    expect(localizePath("de", "/security")).toBe("/de/security");
    expect(localizePath("en", "/#how")).toBe("/en#how");
    expect(localizePath("ru", "/")).toBe("/ru");
  });
});
