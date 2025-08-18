import React from 'react';

interface ImportButtonProps {
  onImport: (file: File, type: string) => void;
}

const ImportButton: React.FC<ImportButtonProps> = React.memo(({ onImport }) => {
  const excelInputRef = React.useRef<HTMLInputElement>(null);
  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const jsonInputRef = React.useRef<HTMLInputElement>(null);
  const pdfInputRef = React.useRef<HTMLInputElement>(null);

  const handleButtonClick = (type: string) => {
    if (type === 'excel') excelInputRef.current?.click();
    if (type === 'image') imageInputRef.current?.click();
    if (type === 'json') jsonInputRef.current?.click();
    if (type === 'pdf') pdfInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file, type);
      e.target.value = '';
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleButtonClick('excel')}
        className="px-2 py-1 bg-indigo-600 text-white rounded text-xs shadow-sm hover:bg-indigo-700 transition-colors"
      >
        Import as Excel
      </button>
      <input
        type="file"
        accept=".xlsx,.xls"
        ref={excelInputRef}
        onChange={e => handleFileChange(e, 'excel')}
        style={{ display: 'none' }}
      />
      <button
        onClick={() => handleButtonClick('image')}
        className="px-2 py-1 bg-green-600 text-white rounded text-xs shadow-sm hover:bg-green-700 transition-colors"
      >
        Import as Image
      </button>
      <input
        type="file"
        accept="image/*"
        ref={imageInputRef}
        onChange={e => handleFileChange(e, 'image')}
        style={{ display: 'none' }}
      />
      <button
        onClick={() => handleButtonClick('json')}
        className="px-2 py-1 bg-gray-600 text-white rounded text-xs shadow-sm hover:bg-gray-700 transition-colors"
      >
        Import as JSON
      </button>
      <input
        type="file"
        accept="application/json"
        ref={jsonInputRef}
        onChange={e => handleFileChange(e, 'json')}
        style={{ display: 'none' }}
      />
      <button
        onClick={() => handleButtonClick('pdf')}
        className="px-2 py-1 bg-red-600 text-white rounded text-xs shadow-sm hover:bg-red-700 transition-colors"
      >
        Import as PDF
      </button>
      <input
        type="file"
        accept="application/pdf"
        ref={pdfInputRef}
        onChange={e => handleFileChange(e, 'pdf')}
        style={{ display: 'none' }}
      />
    </div>
  );
});

ImportButton.displayName = 'ImportButton';

export default ImportButton;
