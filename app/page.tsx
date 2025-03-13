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
import { ArrowUpDown, CircleHelp, MoreHorizontal } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import ButtonExport from "./_components/btn-export";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLoadingGlobalStore } from "@/store/loadingGlobalStore";
import { sleepAsync } from "@/utils/sleep";
import Image from "next/image";

export default function Home() {
  const [data, setData] = useState<Record<string, string>[]>([]);
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [rowSelection, setRowSelection] = useState({});
  const setLoadingGlobal = useLoadingGlobalStore((state) => state.setLoading);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoadingGlobal(true);
    e.preventDefault();

    const file = e.target.files?.[0];

    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const parsedData = XLSX.utils.sheet_to_json(sheet);

      await sleepAsync(500);

      setData(parsedData as Record<string, string>[]);
      setWorkbook(workbook);

      setLoadingGlobal(false);
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
          onCheckedChange={(value: boolean) => {
            console.log(
              "Value ",
              value,
              table.toggleAllPageRowsSelected(!!value)
            );
            console.log("Value 111 ", table.getIsAllPageRowsSelected());
            // return table.toggleAllPageRowsSelected(!!value);
          }}
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

    keys.forEach((k, index: number) => {
      cols.push({
        accessorKey: k,
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }>
              {k} - {`{${index}}`}
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

    console.log("formData === ", formData);

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

  const exportData = async (fileName: string) => {
    try {
      setLoadingGlobal(true);
      console.log("aaaaaaaaaaaaaa ", rowSelection, fileName);
      const keys = Object.keys(rowSelection);
      let dataExport: Record<string, string>[] = [];
      if (keys.length > 0) {
        keys.forEach((k) => {
          dataExport.push(data[parseInt(k)]);
        });
      } else {
        dataExport = [...data];
      }

      console.log("dataExport === ", dataExport);

      const response = await fetch("/api/export-zip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataExport,
          fileName,
        }),
      });

      if (!response.ok) throw new Error("Lỗi khi tải file!");

      // **Tạo link để tải file**
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "exported-files.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error("Lỗi khi tải file ZIP:", error);
    } finally {
      setTimeout(() => {
        setLoadingGlobal(false);
      }, 500);
    }
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-center relative py-4">
        <Image
          className="absolute left-0"
          src="/flag-vietnam.png" // Đường dẫn ảnh (public/images/example.jpg)
          alt="Flag VN"
          width={48} // Chiều rộng hiển thị
          height={32} // Chiều cao hiển thị
          priority // Load ảnh ngay lập tức
        />
        <Label className="text-4xl">Phần mềm xuất file hàng loạt</Label>
        <div className="absolute cursor-pointer right-0 top-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <CircleHelp />
              </TooltipTrigger>
              <TooltipContent>
                <p>Click để xem Hướng dẫn sử dụng</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="flex gap-80">
        <Input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
        <DialogUploadTemplateFiles />
      </div>

      {data.length > 0 && (
        <div>
          <DialogNewRow data={data} onSaveDataExcel={saveToServer} />
          <ButtonExport className="mx-4" exportData={exportData} />
        </div>
      )}

      {data && (
        <DataTableDemo
          data={data}
          columns={getColsFormData()}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
        />
      )}
    </div>
  );
}
