import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ message: "Method Not Allowed" });
    }

    const { filename } = req.query;
    if (!filename || typeof filename !== "string") {
      return res.status(400).json({ message: "Thiếu tên file" });
    }

    const filePath = path.join(process.cwd(), "public/uploads", filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File không tồn tại" });
    }

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(filename)}"`
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    // Đảm bảo kết thúc response khi file đọc xong
    fileStream.on("end", () => {
      res.end();
    });
  } catch (error) {
    console.error("Lỗi tải file:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
}
