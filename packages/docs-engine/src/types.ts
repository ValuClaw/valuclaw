export interface LineageRef {
  id: string;
  label: string;
  source: string;
  address?: string;
  asOf?: string;
}

export interface CompactCell {
  address: string;
  value: string | number | boolean | null;
  formula?: string;
  lineage?: LineageRef;
}

export interface CompactSheet {
  name: string;
  cells: CompactCell[];
}

export interface CompactWorkbook {
  path: string;
  sheets: CompactSheet[];
}

export interface DocxTemplateInput {
  title: string;
  template: string;
  variables: Record<string, string>;
  lineage: LineageRef[];
}

export interface DeckInput {
  title: string;
  bullets: string[];
  lineage: LineageRef[];
}
