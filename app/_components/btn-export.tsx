import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { FileDown, FileText, Loader2, Sheet } from "lucide-react";
import { useEffect, useState } from "react";

type ButtonExportProps = {
  className?: string;
  exportData: (fileName: string) => void;
};

const ButtonExport: React.FC<ButtonExportProps> = ({
  className,
  exportData,
}) => {
  const [fileNameDocx, setFileNameDocx] = useState<string>("");
  const [fileNameXlsx, setFileNameXlsx] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const checkFileExist = async (filename: string) => {
    const response = await fetch(`/api/get-file?filename=${filename}`);
    const result = await response.json();

    if (!result.exist) {
      setLoading(false);
      return;
    }

    if (filename.includes("docx")) setFileNameDocx("docx-template.docx");
    if (filename.includes("xlsx")) setFileNameXlsx("excel-template.xlsx");

    setLoading(false);
  };

  const handleExport = (extension: string) => () => {
    let fileName = "";

    if (extension.includes("docx")) fileName = "docx-template.docx";
    if (extension.includes("xlsx")) fileName = "excel-template.xlsx";

    exportData(fileName);
  };

  const handleCheckFileExist = () => {
    if (fileNameDocx || fileNameXlsx) return;

    console.log("zzzzzzzzz");

    ["docx-template.docx", "excel-template.xlsx"].forEach((f) => {
      checkFileExist(f);
    });
  };

  useEffect(() => {
    handleCheckFileExist();
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={className}
          onClick={handleCheckFileExist}
        >
          <FileDown /> Xuất dữ liệu
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Chọn file để xuất dữ liệu</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {loading ? (
          <div className="flex">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <Label>Loading...</Label>
          </div>
        ) : (
          <DropdownMenuGroup>
            {fileNameDocx && (
              <DropdownMenuItem onClick={handleExport("docx")}>
                <FileText /> docx-template.docx
                <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
              </DropdownMenuItem>
            )}
            {fileNameXlsx && (
              <DropdownMenuItem onClick={handleExport("xlsx")}>
                <Sheet /> excel-template.xlsx
                <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
              </DropdownMenuItem>
            )}

            {!fileNameXlsx && !fileNameDocx && (
              <DropdownMenuItem className="text-center">
                <Label className="text-red-500 ">Không có file mẫu</Label>
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ButtonExport;
