import { describe, expect, it } from "vitest";
import { en } from "@/shared/i18n/messages/en";
import { destinationName, folderName } from "./folder-name";
import type { FolderOption } from "./folder-option";

const messages = en.folders;
const inbox: FolderOption = { id: "inbox-id", systemRole: "inbox", name: { kind: "empty" }, unreadCount: 0 };
const work: FolderOption = { id: "work-id", systemRole: null, name: { kind: "text", text: "Work" }, unreadCount: 2 };
const broken: FolderOption = { id: "broken-id", systemRole: null, name: { kind: "unreadable" }, unreadCount: 0 };

describe("folderName", () => {
  it("names system folders from the dictionary and custom ones from their decrypted name", () => {
    expect(folderName(inbox, messages)).toBe("Inbox");
    expect(folderName(work, messages)).toBe("Work");
    expect(folderName(broken, messages)).toBe(messages.unreadable);
  });
});

describe("destinationName", () => {
  it("treats folderId null as the inbox", () => {
    expect(destinationName(null, [inbox, work], messages)).toBe("Inbox");
    expect(destinationName("work-id", [inbox, work], messages)).toBe("Work");
  });
});
