import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("office add-in local bridge contract", () => {
  it("declares a Word task pane manifest for sideloading", async () => {
    const manifest = await readFile("packages/office-addin/manifest.xml", "utf8");
    expect(manifest).toContain('<Host Name="Document"/>');
    expect(manifest).toContain("https://localhost:3100/taskpane.html");
    expect(manifest).toContain("<Permissions>ReadWriteDocument</Permissions>");
    const icons = await Promise.all(
      ["icon-16.png", "icon-32.png", "icon-64.png", "icon-80.png"].map((icon) =>
        readFile(`packages/office-addin/public/${icon}`)
      )
    );
    expect(icons.every((icon) => icon.byteLength > 0)).toBe(true);
  });

  it("uses the local harness API rather than a browser-only synthetic stand-in", async () => {
    const taskpane = await readFile("packages/office-addin/src/taskpane.ts", "utf8");
    const html = await readFile("packages/office-addin/public/taskpane.html", "utf8");
    expect(taskpane).toContain('fetch("/api/runs/weekly-update"');
    expect(taskpane).not.toContain("createSyntheticRun");
    expect(taskpane).toContain("modelRoster: readModelRoster()");
    expect(html).toContain('id="model-options"');
    expect(html).toContain('id="save-model-options"');
  });
});
