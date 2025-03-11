import fs from "fs";
import path from "path";
import archiver from "archiver";
import { NextApiRequest, NextApiResponse } from "next";
import * as XLSX from "xlsx";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

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
    if (
      !worksheet[cell].v ||
      typeof worksheet[cell].v !== "string" ||
      !worksheet[cell].v.includes("{")
    ) {
      continue;
    }

    let cellValue = worksheet[cell].v;

    keysData.forEach((value, index) => {
      const placeholder = `{${index}}`;
      if (!cellValue.includes(placeholder)) {
        return;
      }

      cellValue = cellValue.replace(placeholder, data[value]);
    });
    worksheet[cell].v = cellValue;
  }

  const outputPath = path.join(outputDir, newFileName);
  XLSX.writeFile(workbook, outputPath);

  return outputPath;
};

const exportWordFiles = (
  newFileName: string,
  dataExport: Record<string, string>[],
  index: number
) => {
  if (!dataExport || !dataExport.length || !newFileName) {
    return "";
  }

  // 1️⃣ Đọc file DOCX mẫu
  const filePath = path.join(
    process.cwd(),
    "public/uploads/docx-template.docx"
  );
  const fileBuffer = fs.readFileSync(filePath, "binary");

  // 2️⃣ Load file DOCX vào bộ nhớ
  const zip = new PizZip(fileBuffer);
  const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

  // 3️⃣ Tạo object chứa dữ liệu thay thế
  const replacements: Record<string, string> = {};
  Object.keys(dataExport[0]).forEach((key, idx) => {
    replacements[idx] = dataExport[index][key]; // Ví dụ: { "0": "John", "1": "Doe" }
  });

  // 4️⃣ Compile template & Render dữ liệu
  doc.render(replacements);

  // 5️⃣ Xuất file DOCX mới
  const buffer = doc.getZip().generate({ type: "nodebuffer" });
  const outputPath = path.join(
    process.cwd(),
    `public/exports/${newFileName}.docx`
  );
  fs.writeFileSync(outputPath, buffer);

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

    //export excel files
    const filePaths: string[] = [];

    for (let i = 0; i < dataExport.length; i++) {
      let newFileName = "";
      let outputDir = "";
      if (fileName.includes("xlsx")) {
        newFileName = `${fileName.replace(".xlsx", "")}-${i + 1}.xlsx`;
        outputDir = exportExcelFiles(newFileName, dataExport, i);
      } else if (fileName.includes("docx")) {
        newFileName = `${fileName.replace(".docx", "")}-${i + 1}.docx`;
        outputDir = exportWordFiles(newFileName, dataExport, i);
      }

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

    // Delete files
    // **Khi gửi xong, xóa file**
    res.on("finish", () => {
      try {
        console.log("File đã tải xuống, bắt đầu xóa...");

        // Xóa file ZIP
        if (fs.existsSync(zipPath)) {
          fs.unlinkSync(zipPath);
          console.log(`Đã xóa file ZIP: ${zipPath}`);
        }

        // Xóa từng file đã xuất
        filePaths.forEach((file) => {
          if (fs.existsSync(file)) {
            fs.unlinkSync(file);
            console.log(`Đã xóa: ${file}`);
          }
        });
      } catch (error) {
        console.error("Lỗi khi xóa file sau khi tải xuống:", error);
      }
    });
  } catch (error) {
    console.error("Lỗi khi tạo ZIP:", error);
    res.status(500).json({ message: "Lỗi server khi xuất file ZIP" });
  }
}
