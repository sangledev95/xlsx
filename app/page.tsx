"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DialogClose } from "@radix-ui/react-dialog";
import { Plus } from "lucide-react";
import { useState } from "react";
import * as XLSX from "xlsx";
import { DataTableDemo } from "./_components/data-table";

const dataPayment = [
  {
    id: "m5gr84i9",
    amount: 316,
    status: "success",
    email: "ken99@example.com",
  },
  {
    id: "3u1reuv4",
    amount: 242,
    status: "success",
    email: "Abe45@example.com",
  },
  {
    id: "derv1ws0",
    amount: 837,
    status: "processing",
    email: "Monserrat44@example.com",
  },
  {
    id: "5kma53ae",
    amount: 874,
    status: "success",
    email: "Silas22@example.com",
  },
  {
    id: "bhqecj4p",
    amount: 721,
    status: "failed",
    email: "carmella@example.com",
  },
];

export default function Home() {
  const [data, setData] = useState<any>([]);
  const [totalRow, setTotalRow] = useState<number>(0);
  const [totalCol, setTotalCol] = useState<number>(0);
  const [fileName, setFileName] = useState(""); // Lưu tên file gốc
  const [newRow, setNewRow] = useState<Record<string, any>>({});

  const handleFileUpload = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsBinaryString(e.target.files[0]);

    setFileName(file.name);

    reader.onload = (e) => {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const parsedData = XLSX.utils.sheet_to_json(sheet);

      console.log("adasd ", parsedData);

      setData(parsedData);
      setTotalRow(parsedData.length);
      setTotalCol(parsedData[0] ? Object.keys(parsedData[0]).length : 0);
    };
  };

  const handleAddRow = () => {
    console.log('')

    if (!newRow.ID || !newRow.Name || !newRow.Age) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    setData([...data, newRow]); // Thêm dòng mới vào state
    setNewRow({ ID: "", Name: "", Age: "" }); // Reset form
  };

  const handleInputChange = (e: any) => {
    setNewRow({ ...newRow, [e.target.name]: e.target.value });
  };

  const handleSaveFile = () => {
    if (data.length === 0) {
      alert("Chưa có dữ liệu để lưu!");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    const newFileName = fileName ? `updated_${fileName}` : "updated_excel.xlsx";
    XLSX.writeFile(workbook, newFileName);
  };

  return (
    <div className="space-y-4 p-4">
      <div>
        <Input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
      </div>

      {data.length > 0 && (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <Plus />
            </Button>
          </DialogTrigger>
          <DialogContent className="min-w-[800px] max-h-10/12 flex flex-col">
            <DialogHeader className=" ">
              <DialogTitle>Thêm mới</DialogTitle>
              <DialogDescription>
                Điền dữ liệu rồi save để lưu vào file excel.
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-auto py-2 space-y-4">
              {Object.keys(data[1]).map((key) => (
                <div className="flex flex-col items-center space-y-2" key={key}>
                  <div className="w-full">
                    <Label htmlFor={key}>{key}</Label>
                  </div>
                  <div className="w-full">
                    <Input
                      id={key}
                      type="text"
                      value={newRow[key]}
                      name={key}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              ))}
            </div>
            <DialogFooter className=" ">
              <Button
                variant="destructive"
                className="cursor-pointer"
                onClick={handleAddRow}>
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {data.length > 0 && (
        <div className="">
          <Table>
            <TableCaption>A list of your recent invoices.</TableCaption>
            <TableHeader>
              <TableRow>
                {Object.keys(data[0]).map((key) => (
                  <TableHead key={key}>{key}</TableHead>
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

      <DataTableDemo data={dataPayment} />
    </div>
  );
}
