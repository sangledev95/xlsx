"use client";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import * as XLSX from "xlsx";
import { DataTableDemo } from "./_components/data-table";
import DialogNewRow from "./_components/dialog-new-row";
import DialogUploadTemplateFiles from "./_components/dialog-upload-template-file";

export default function Home() {
  const [data, setData] = useState<any>([]);
  const [totalRow, setTotalRow] = useState<number>(0);
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const handleFileUpload = (e: any) => {
    const file = e.target.files[0];

    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const parsedData = XLSX.utils.sheet_to_json(sheet);

      console.log("adasd ", parsedData);

      setData(parsedData);
      setTotalRow(parsedData.length);
      setWorkbook(workbook);
    };
    reader.readAsBinaryString(file);
  };

  // const onSaveDataExcel = (model: any) => {
  //   if (!workbook) {
  //     alert("⚠️ Chưa có file để ghi!");
  //     return;
  //   }

  //   console.log("model ", model, [...data, model]);

  //   const sheetName = workbook.SheetNames[0];
  //   const ws = XLSX.utils.json_to_sheet([...data, model]);
  //   workbook.Sheets[sheetName] = ws;
  // };

  const saveToServer = async (model: any) => {
    if (!workbook) {
      alert("⚠️ Chưa có file để ghi!");
      return;
    }

    // Cập nhật dữ liệu vào workbook
    const sheetName = workbook.SheetNames[0];
    const ws = XLSX.utils.json_to_sheet([...data, model]);
    workbook.Sheets[sheetName] = ws;

    // Tạo file Excel từ workbook
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    // Gửi file lên server
    const formData = new FormData();
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    formData.append("file", blob, fileName);

    try {
      const response = await fetch("/api/save-excel", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        alert("✅ File đã được ghi đè thành công!");
      } else {
        alert("❌ Lỗi khi lưu file!");
      }
    } catch (error) {
      console.error("Lỗi:", error);
      alert("❌ Lỗi khi lưu file!");
    }
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex gap-80">
        <Input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
        <DialogUploadTemplateFiles />
      </div>

      {data.length > 0 && (
        <DialogNewRow data={data} onSaveDataExcel={saveToServer} />
      )}

      {data.length > 0 && (
        <div className="">
          <Table>
            <TableCaption>A list of your recent invoices.</TableCaption>
            <TableHeader>
              <TableRow>
                {Object.keys(data[0]).map((key) => (
                  <TableHead key={key}>{data[0][key]}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row: any, index: number) => (
                <TableRow key={index}>
                  {Object.values(row).map((value: any, index) => (
                    <TableCell key={index}>{value}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <DataTableDemo />
    </div>
  );
}
