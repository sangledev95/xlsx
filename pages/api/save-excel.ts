import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import { IncomingForm, Fields, Files } from "formidable";
import * as XLSX from "xlsx";

export const config = {
  api: {
    bodyParser: false, // Tắt bodyParser để formidable xử lý file upload
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Chỉ hỗ trợ phương thức POST" });
  }

  const uploadDir = path.join(process.cwd(), "public/uploads");
  const form = new IncomingForm({
    uploadDir, // Thiết lập thư mục upload
    keepExtensions: true, // Giữ nguyên phần mở rộng của file
    multiples: false, // Không cho phép upload nhiều file
  });

  // Tạo thư mục upload nếu chưa tồn tại
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  form.parse(req, (err: Error, fields: Fields, files: Files) => {
    if (err) {
      return res.status(500).json({ message: "Lỗi khi tải file lên" });
    }

    const file = files.file;
    const newData = Array.isArray(fields.data) ? fields.data : [];
    const filePath = Array.isArray(file) ? file[0].filepath : "";

    // Đọc file Excel cũ
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const ws = XLSX.utils.json_to_sheet(newData);
    workbook.Sheets[sheetName] = ws; // Ghi đè dữ liệu mới

    // Ghi đè vào file Excel cũ
    XLSX.writeFile(workbook, filePath);

    return res.status(200).json({ message: "File đã được lưu thành công!" });
  });
}
