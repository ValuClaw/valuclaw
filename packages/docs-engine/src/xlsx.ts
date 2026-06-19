import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import * as XLSX from "xlsx";
import type { CompactCell, CompactWorkbook, LineageRef } from "./types.js";

export function readXlsxCompact(path: string): CompactWorkbook {
  const workbook = XLSX.readFile(path, { cellFormula: true });
  return {
    path,
    sheets: workbook.SheetNames.map((name) => {
      const sheet = workbook.Sheets[name];
      const range = sheet["!ref"] ? XLSX.utils.decode_range(sheet["!ref"]) : undefined;
      const cells: CompactCell[] = [];
      if (range) {
        for (let row = range.s.r; row <= range.e.r; row += 1) {
          for (let col = range.s.c; col <= range.e.c; col += 1) {
            const address = XLSX.utils.encode_cell({ r: row, c: col });
            const cell = sheet[address];
            if (!cell) continue;
            cells.push({
              address,
              value: cell.v ?? null,
              formula: cell.f,
              lineage: {
                id: `xlsx:${name}!${address}`,
                label: `${name} - ${address}`,
                source: path,
                address
              }
            });
          }
        }
      }
      return { name, cells };
    })
  };
}

export async function writeXlsxWithLineage(
  path: string,
  sheets: Array<{ name: string; rows: Array<Record<string, string | number | boolean | null>> }>,
  lineage: LineageRef[]
): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  const workbook = XLSX.utils.book_new();
  for (const sheet of sheets) {
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(sheet.rows), sheet.name);
  }
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(
      lineage.map((item) => ({
        id: item.id,
        label: item.label,
        source: item.source,
        address: item.address ?? "",
        as_of: item.asOf ?? ""
      }))
    ),
    "ValuClaw_Lineage"
  );
  XLSX.writeFile(workbook, path);
}
