import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import PptxGenJSImport from "pptxgenjs";
import type { DeckInput } from "./types.js";

type PptxSlide = {
  addText(text: string, options: Record<string, unknown>): void;
};
type PptxInstance = {
  author: string;
  subject: string;
  title: string;
  addSlide(): PptxSlide;
  writeFile(options: { fileName: string }): Promise<void>;
};
type PptxGenConstructor = new () => PptxInstance;
const PptxGenJS = PptxGenJSImport as unknown as PptxGenConstructor;

export async function writePptxSummary(path: string, input: DeckInput): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  const pptx = new PptxGenJS();
  pptx.author = "ValuClaw";
  pptx.subject = "Synthetic ValuClaw work product";
  pptx.title = input.title;
  const slide = pptx.addSlide();
  slide.addText(input.title, { x: 0.5, y: 0.35, w: 9, h: 0.4, bold: true, fontSize: 22 });
  slide.addText(input.bullets.map((bullet) => `• ${bullet}`).join("\n"), {
    x: 0.65,
    y: 1.05,
    w: 8.4,
    h: 2.2,
    fontSize: 14,
    breakLine: false
  });
  slide.addText(input.lineage.map((item) => item.label).join(" | "), {
    x: 0.65,
    y: 4.75,
    w: 8.4,
    h: 0.4,
    fontSize: 9,
    color: "666666"
  });
  await pptx.writeFile({ fileName: path });
}
