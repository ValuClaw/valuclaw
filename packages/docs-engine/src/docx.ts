import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { Document, Packer, Paragraph, TextRun } from "docx";
import type { DocxTemplateInput } from "./types.js";

export function renderTemplate(template: string, variables: Record<string, string>): string {
  return Object.entries(variables).reduce(
    (result, [key, value]) => result.replaceAll(`{{${key}}}`, value),
    template
  );
}

export async function writeDocxFromTemplate(path: string, input: DocxTemplateInput): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  const rendered = renderTemplate(input.template, input.variables);
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            children: [new TextRun({ text: input.title, bold: true, size: 32 })]
          }),
          ...rendered.split("\n").map((line) => new Paragraph({ text: line })),
          new Paragraph({ text: "" }),
          new Paragraph({ children: [new TextRun({ text: "Sources", bold: true })] }),
          ...input.lineage.map(
            (source) =>
              new Paragraph({
                text: `${source.label} (${source.source}${source.asOf ? `, ${source.asOf}` : ""})`
              })
          )
        ]
      }
    ]
  });
  await writeFile(path, await Packer.toBuffer(doc));
}
