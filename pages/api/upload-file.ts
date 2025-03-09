import { NextApiRequest, NextApiResponse } from "next";
import * as XLSX from "xlsx";
import fs from "fs";
import path from "path";
import { IncomingForm } from "formidable";

// 🔧 Cấu hình Next.js để không parse body (vì dùng formidable)
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const form = new IncomingForm();
  form.keepExtensions = true; // Giữ đuôi file gốc

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ message: "Lỗi khi tải file lên" });
    }

    const file = files.file as formidable.File;
    if (!file) {
      return res.status(400).json({ message: "Không tìm thấy file!" });
    }

    const tempPath = file.filepath; // Đường dẫn file tạm thời
    const uploadsDir = path.join(process.cwd(), "/public/uploads"); // Thư mục đích

    // 🛠 Kiểm tra và tạo thư mục /public/uploads nếu chưa tồn tại
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // 🎯 Tạo đường dẫn đích trong /public/uploads/
    const newFilePath = path.join(uploadsDir, file.originalFilename);

    // 📂 Di chuyển file từ thư mục tạm vào /public/uploads/
    fs.renameSync(tempPath, newFilePath);

    return res.status(200).json({
      message: "File đã được lưu thành công!",
      filePath: `/uploads/${file.originalFilename}`,
    });
  });
}
