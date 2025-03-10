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
import { useState } from "react";

export default function DialogNewRow({
  data,
  onSaveDataExcel,
}: {
  data: unknown;
  onSaveDataExcel: (model: { [key: string]: string }) => void;
}) {
  const [model, setModel] = useState<{ [key: string]: string }>({});

  const handleChange = (key: string, value: string) => {
    setModel((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    onSaveDataExcel(model);
  };

  if (!Array.isArray(data)) return;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus /> Thêm mới dữ liệu
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-[800px] max-h-10/12 flex flex-col">
        <DialogHeader className=" ">
          <DialogTitle>Thêm mới</DialogTitle>
          <DialogDescription>
            Điền dữ liệu rồi save để lưu vào file excel.
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-auto py-2 space-y-4 px-2">
          {Object.keys(data[0]).map((key) => (
            <div className="flex flex-col items-center space-y-2" key={key}>
              <div className="w-full">
                <Label htmlFor={key}>{key}</Label>
              </div>
              <div className="w-full">
                <Input
                  id={key}
                  type="text"
                  value={model[key] || ""}
                  onChange={(e) => handleChange(key, e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
        <DialogFooter className=" ">
          <Button
            variant="destructive"
            className="cursor-pointer"
            onClick={handleSubmit}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
