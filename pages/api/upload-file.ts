import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import { Fields, Files, IncomingForm } from "formidable";

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
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method Not Allowed" });
    }

    const uploadDir = path.join(process.cwd(), "/public/uploads"); // Thư mục đích
    // 🛠 Kiểm tra và tạo thư mục /public/uploads nếu chưa tồn tại
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const form = new IncomingForm({
      uploadDir,
      keepExtensions: true,
    });

    form.parse(req, async (err, fields: Fields, files: Files) => {
      if (err) {
        return res.status(500).json({ message: "Lỗi khi tải file lên" });
      }

      const file = files.file;

      if (!file) {
        return res.status(400).json({ message: "Không tìm thấy file!" });
      }

      console.log(file[0].mimetype);
      const tempPath = file[0].filepath; // Đường dẫn file tạm thời
      let fileName = "";

      if (file[0].originalFilename?.includes("doc")) {
        fileName = "docx-template.docx";
      } else if (file[0].originalFilename?.includes("xlsx")) {
        fileName = "excel-template.xlsx";
      }

      const newFilePath = path.join(uploadDir, fileName);
      // 📂 Di chuyển file từ thư mục tạm vào /public/uploads/
      fs.renameSync(tempPath, newFilePath);
      return res.status(200).json({
        message: "File đã được lưu thành công!",
        filePath: `/uploads/${fileName}`,
      });
    });
  } catch (error) {
    console.log("errrr ", error);
    throw error;
  }
}
