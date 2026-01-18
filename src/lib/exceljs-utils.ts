import ExcelJS from "exceljs";

export async function downloadWorkbook(workbook: ExcelJS.Workbook, fileName: string) {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = URL.createObjectURL(blob);
  try {
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function parseXlsxFileToJson(file: File): Promise<Record<string, any>[]> {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext !== "xlsx") {
    throw new Error("Formato não suportado. Use .xlsx ou .csv");
  }

  const buffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) return [];

  // Assumes first row is header
  const headerRow = worksheet.getRow(1);
  const rawHeaderValues: unknown = headerRow.values as unknown;
  const headerArray: any[] = Array.isArray(rawHeaderValues)
    ? rawHeaderValues
    : rawHeaderValues && typeof rawHeaderValues === "object"
      ? Object.values(rawHeaderValues as Record<string, any>)
      : [];

  // ExcelJS keeps index 0 empty when values is an array
  const headers = (headerArray[0] === undefined ? headerArray.slice(1) : headerArray)
    .map((v) => (v ?? "").toString().trim());

  const rows: Record<string, any>[] = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const obj: Record<string, any> = {};
    headers.forEach((h, idx) => {
      const cellVal = row.getCell(idx + 1).value;
      // ExcelJS value can be object (e.g. rich text, formula). Convert conservatively.
      if (cellVal && typeof cellVal === "object" && "text" in (cellVal as any)) {
        obj[h] = (cellVal as any).text;
      } else if (cellVal && typeof cellVal === "object" && "result" in (cellVal as any)) {
        obj[h] = (cellVal as any).result;
      } else {
        obj[h] = cellVal as any;
      }
    });

    // Skip completely empty rows
    const hasAnyValue = Object.values(obj).some((v) => v !== null && v !== undefined && String(v).trim() !== "");
    if (hasAnyValue) rows.push(obj);
  });

  return rows;
}

export async function parseCsvFileToJson(file: File): Promise<Record<string, any>[]> {
  const text = await file.text();
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];

  // Very small, dependency-free CSV parser (handles commas/semicolons; basic quoting)
  const delimiter = lines[0].includes(";") && !lines[0].includes(",") ? ";" : ",";

  const parseLine = (line: string): string[] => {
    const out: string[] = [];
    let cur = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (!inQuotes && ch === delimiter) {
        out.push(cur);
        cur = "";
      } else {
        cur += ch;
      }
    }
    out.push(cur);
    return out.map((s) => s.trim());
  };

  const headers = parseLine(lines[0]).map((h) => h.trim());
  const rows: Record<string, any>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    const obj: Record<string, any> = {};
    headers.forEach((h, idx) => {
      obj[h] = values[idx] ?? "";
    });
    rows.push(obj);
  }

  return rows;
}
