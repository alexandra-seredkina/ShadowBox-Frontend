import { describe, expect, it } from "vitest";
import { isDangerousAttachment } from "./attachment-risk";

describe("isDangerousAttachment", () => {
  it.each([
    ["invoice.exe", "application/octet-stream"],
    ["invoice.pdf.exe", "application/pdf"],
    ["INVOICE.EXE. ", "application/octet-stream"],
    ["report.docm", "application/octet-stream"],
    ["setup", "application/x-msdownload"],
    ["budget.xlsx", "application/vnd.ms-excel.sheet.macroEnabled.12"],
  ])("flags %s (%s)", (filename, mimeType) => {
    expect(isDangerousAttachment(filename, mimeType)).toBe(true);
  });

  it.each([
    ["report.pdf", "application/pdf"],
    ["photo.jpg", "image/jpeg"],
    ["notes", "text/plain"],
  ])("lets %s (%s) through", (filename, mimeType) => {
    expect(isDangerousAttachment(filename, mimeType)).toBe(false);
  });
});
