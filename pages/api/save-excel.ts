import fs from "fs";
import path from "path";
import { IncomingForm } from "formidable";
import * as XLSX from "xlsx";

export const config = {
  api: {
    bodyParser: false, // Tắt bodyParser để formidable xử lý file upload
  },
};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Chỉ hỗ trợ phương thức POST" });
  }

  const form = new IncomingForm();
  const uploadDir = path.join(process.cwd(), "public/uploads");

  // Tạo thư mục upload nếu chưa tồn tại
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  form.uploadDir = uploadDir; // Thiết lập thư mục lưu file
  form.keepExtensions = true; // Giữ nguyên phần mở rộng của file

  form.parse(req, (err: any, fields: any, files: any) => {
    if (err) {
      return res.status(500).json({ message: "Lỗi khi tải file lên" });
    }

    const file = files.file;
    console.log("fileeeeeee ", file.data);
    const newData = JSON.parse(fields.data as string);
    const filePath = file.filepath;

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
