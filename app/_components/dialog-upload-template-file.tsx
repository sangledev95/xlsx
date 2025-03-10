import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { FileUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function DialogUploadTemplateFiles({}) {
  const fileWordInputRef = useRef<HTMLInputElement>(null);
  const fileExcelInputRef = useRef<HTMLInputElement>(null);
  const [fileNameDocx, setFileNameDocx] = useState<string>("");
  const [fileNameXlsx, setFileNameXlsx] = useState<string>("");

  const handleClickUploadFile = (extension: string) => () => {
    if (extension.includes("docx")) {
      if (!fileWordInputRef.current) return;

      fileWordInputRef.current.click();
    }

    if (extension.includes("xlsx")) {
      if (!fileExcelInputRef.current) return;

      fileExcelInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    console.log("File đã chọn:", file);
    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    if (!file) {
      toast("Vui lòng chọn file Excel!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload-file", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        toast(`✅ File uploaded: ${data.filePath}`);

        if (file.name.includes("docx")) setFileNameDocx("docx-template.docx");
        if (file.name.includes("xlsx")) setFileNameXlsx("excel-template.xlsx");
      } else {
        toast(`❌ Lỗi: ${data.message}`);
      }
    } catch (error) {
      console.log(error);
      toast("❌ Lỗi khi upload file");
    }
  };

  const handleDownload = (filename: string) => async () => {
    const response = await fetch(`/api/download-file?filename=${filename}`);

    if (!response.ok) {
      alert("File không tồn tại hoặc lỗi server!");
      return;
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const checkFileExist = async (filename: string) => {
    const response = await fetch(`/api/get-file?filename=${filename}`);
    const result = await response.json();

    if (!result.exist) {
      return;
    }

    if (filename.includes("docx")) setFileNameDocx("docx-template.docx");
    if (filename.includes("xlsx")) setFileNameXlsx("excel-template.xlsx");
  };

  useEffect(() => {
    ["docx-template.docx", "excel-template.xlsx"].forEach((f) => {
      checkFileExist(f);
    });
  }, []);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <FileUp />
          Upload file mẫu
        </Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col">
        <DialogHeader className=" ">
          <DialogTitle>Upload file mẫu</DialogTitle>
          <DialogDescription>Upload template docx, xlsx.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-y-4">
          <div className="flex gap-x-4">
            <input
              type="file"
              accept=".docx"
              className="my-2 hidden"
              ref={fileWordInputRef}
              onChange={handleFileChange}
            />
            <Button
              className="cursor-pointer"
              variant="outline"
              onClick={handleClickUploadFile("docx")}
            >
              Upload template docx
            </Button>
            <Label
              className={
                fileNameDocx ? "text-blue-500 cursor-pointer underline" : ""
              }
              title={fileNameDocx ? "Click to download" : ""}
              onClick={handleDownload("docx-template.docx")}
            >
              {fileNameDocx || "Empty"}
            </Label>
          </div>
          <div className="flex gap-x-4">
            <input
              type="file"
              accept=".xlsx"
              className="my-2 hidden"
              ref={fileExcelInputRef}
              onChange={handleFileChange}
            />
            <Button
              className="cursor-pointer"
              variant="outline"
              onClick={handleClickUploadFile("xlsx")}
            >
              Upload template excel
            </Button>
            <Label
              className={
                fileNameXlsx ? "text-blue-500 cursor-pointer underline" : ""
              }
              title={fileNameDocx ? "Click to download" : ""}
              onClick={handleDownload("excel-template.xlsx")}
            >
              {fileNameXlsx || "Empty"}
            </Label>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
