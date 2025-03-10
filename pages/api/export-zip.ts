import fs from "fs";
import path from "path";
import archiver from "archiver";
import { NextApiRequest, NextApiResponse } from "next";
import * as XLSX from "xlsx";

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

    console.log("aaaaaaaaaaa 1123 ", dataExport, fileName);

    return res.status(404).json({ message: "Not found data" });

    const outputDir = path.join(process.cwd(), "public/exports");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // **Tạo danh sách file**
    const filePaths: string[] = [];
    for (let i = 0; i < dataExport.length; i++) {
      const fileName = `export-${i + 1}.xlsx`;
      const filePath = path.join(outputDir, fileName);
      filePaths.push(filePath);

      // **Tạo file Excel từ data**
      const ws = XLSX.utils.json_to_sheet(dataExport[i]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
      XLSX.writeFile(wb, filePath);
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
