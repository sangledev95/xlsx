import fs from "fs";
import path from "path";
import archiver from "archiver";
import { NextApiRequest, NextApiResponse } from "next";
import * as XLSX from "xlsx";

const outputDir = path.join(process.cwd(), "public/exports");

const exportExcelFiles = (
  newFileName: string,
  dataExport: Record<string, string>[],
  index: number
): string => {
  const filePath = path.join(
    process.cwd(),
    "public/uploads/excel-template.xlsx"
  );
  const fileBuffer = fs.readFileSync(filePath);
  const workbook = XLSX.read(fileBuffer, { type: "buffer" });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];

  if (!dataExport || !dataExport.length || !newFileName) {
    return "";
  }

  const keysData = Object.keys(dataExport[0]);
  const data = dataExport[index];

  for (const cell in worksheet) {
    if (worksheet[cell].v && typeof worksheet[cell].v === "string") {
      let cellValue = worksheet[cell].v;

      keysData.forEach((value, index) => {
        const placeholder = `{${index}}`;
        if (cellValue.includes(placeholder)) {
          cellValue = cellValue.replace(placeholder, data[value]);
        }
      });
      worksheet[cell].v = cellValue;
    }
  }

  const outputPath = path.join(outputDir, newFileName);
  XLSX.writeFile(workbook, outputPath);

  return outputPath;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const data = req.body; // Dữ liệu để xuất file

    if (!data) return res.status(404).json({ message: "Not found data" });

    const { fileName, dataExport } = data;

    if (!dataExport || !dataExport.length || !fileName) {
      res.status(404).json({ message: "Not found data" });
    }

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filePaths: string[] = [];
    for (let i = 0; i < dataExport.length; i++) {
      const newFileName = `${fileName.replace("xlsx", "")}-${i + 1}.xlsx`;
      const outputDir = exportExcelFiles(newFileName, dataExport, i);

      filePaths.push(outputDir);
    }

    // **Tạo file ZIP**
    const zipPath = path.join(outputDir, "exported-files.zip");
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    archive.pipe(output);
    filePaths.forEach((file) =>
      archive.file(file, { name: path.basename(file) })
    );
    await archive.finalize();

    // **Gửi file ZIP về client**
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=exported-files.zip`
    );
    res.setHeader("Content-Type", "application/zip");

    const zipStream = fs.createReadStream(zipPath);
    zipStream.pipe(res);
  } catch (error) {
    console.error("Lỗi khi tạo ZIP:", error);
    res.status(500).json({ message: "Lỗi server khi xuất file ZIP" });
  }
}
