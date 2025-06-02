
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, File } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  label: string;
  description?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  accept = ".pdf,.jpg,.jpeg,.png",
  label,
  description
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="w-full max-w-md mx-auto border-dashed border-2 border-gray-300 hover:border-blue-400 transition-colors">
      <CardContent className="p-6">
        <div className="text-center">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{label}</h3>
          {description && (
            <p className="text-sm text-gray-600 mb-4">{description}</p>
          )}
          <Button onClick={handleClick} className="w-full">
            <File className="w-4 h-4 mr-2" />
            Choose File
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />
          <p className="text-xs text-gray-500 mt-2">
            Supported formats: PDF, JPG, PNG (Max 10MB)
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUpload;
