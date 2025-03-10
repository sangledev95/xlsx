"use client";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import * as XLSX from "xlsx";
import { DataTableDemo } from "./_components/data-table";
import DialogNewRow from "./_components/dialog-new-row";
import DialogUploadTemplateFiles from "./_components/dialog-upload-template-file";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";

export default function Home() {
  const [data, setData] = useState<Record<string, string>[]>([]);
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    const file = e.target.files?.[0];

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

      setData(parsedData as Record<string, string>[]);
      setWorkbook(workbook);
    };
    reader.readAsBinaryString(file);
  };

  const getColsFormData = (): ColumnDef<Record<string, string>>[] => {
    if (!data || !data.length || typeof data[0] !== "object") return [];

    const cols: ColumnDef<Record<string, string>>[] = [];

    // Checkbox
    cols.push({
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value: boolean) =>
            table.toggleAllPageRowsSelected(!!value)
          }
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value: boolean) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    });
    // Add header
    const keys = Object.keys(data[0] as Record<string, string>);

    keys.forEach((k) => {
      cols.push({
        accessorKey: k,
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }>
              {k}
              <ArrowUpDown />
            </Button>
          );
        },
      });
    });

    // Add action
    cols.push({
      id: "actions",
      enableHiding: false,
      header: () => <div className="">Action</div>,
      cell: ({ row }) => {
        const payment = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(payment.id)}>
                Copy payment ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>View customer</DropdownMenuItem>
              <DropdownMenuItem>View payment details</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    });

    return cols;
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

  const saveToServer = async (model: { [key: string]: string }) => {
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

      {data && <DataTableDemo data={data} columns={getColsFormData()} />}
    </div>
  );
}
