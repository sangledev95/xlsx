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
import { Plus } from "lucide-react";
import { toast } from "sonner";

export default function DialogUploadTemplateFiles({}) {
  const handleUpload = async () => {
    if (!file) {
      setMessage("Vui lòng chọn file Excel!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    setMessage("");

    try {
      const res = await fetch("/api/save-excel", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`✅ File uploaded: ${data.filePath}`);
      } else {
        setMessage(`❌ Lỗi: ${data.message}`);
      }
    } catch (error) {
      setMessage("❌ Lỗi khi upload file");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Upload file mẫu</Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col">
        <DialogHeader className=" ">
          <DialogTitle>Upload file mẫu</DialogTitle>
          <DialogDescription>Upload template docx, xlsx.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-y-4">
          <div className="flex gap-x-4">
            <input type="file" accept=".docx" className="my-2 hidden" />
            <Button variant="outline" onClick={handleUpload}>
              Upload template docx
            </Button>
            <Label>Empty</Label>
          </div>
          <div className="flex gap-x-4">
            <input type="file" accept=".xlsx" className="my-2 hidden" />
            <Button variant="outline">Upload template excel</Button>
            <Label>Empty</Label>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
