import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { filename } = req.query; // Nhận tên file từ query params
    const filePath = path.join(
      process.cwd(),
      "public/uploads",
      filename as string
    );

    if (!fs.existsSync(filePath)) {
      return res.status(200).json({ exist: false });
    }

    return res.status(200).json({ exist: true });
  } catch (error) {
    console.log("errrr ", error);
    return res.status(404).json({ exist: false });
  }
}
