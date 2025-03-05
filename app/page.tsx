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

export default function Home() {
  const [data, setData] = useState<any>([]);
  const [totalRow, setTotalRow] = useState<number>(0);

  const handleFileUpload = (e: any) => {
    const reader = new FileReader();
    reader.readAsBinaryString(e.target.files[0]);
    reader.onload = (e) => {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const parsedData = XLSX.utils.sheet_to_json(sheet);

      console.log("adasd ", parsedData);

      setData(parsedData);
      setTotalRow(parsedData.length);
    };
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
                    <Label htmlFor={key}>{data[1][key]}</Label>
                  </div>
                  <div className="w-full">
                    <Input id={key} type="text" />
                  </div>
                </div>
              ))}
            </div>
            <DialogFooter className=" ">
              <Button variant="destructive" className="cursor-pointer">
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
                {Object.keys(data[1]).map((key) => (
                  <TableHead key={key}>{data[1][key]}</TableHead>
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
    </div>
  );
}
