"use client";
import { useState } from "react";
import { showToast } from "@/app/redux/toastSlice";
import { useAppDispatch } from "@/app/redux/hooks";

function convertToCSV(data: Record<string, unknown>[]) {
  if (!data?.length) return "";
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(",")];
  for (const row of data) {
    const values = headers.map((h) => {
      const val = row[h] ?? "";
      const formattedValue = typeof val === "object" ? JSON.stringify(val) : val;
      return `"${String(formattedValue).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(","));
  }
  return csvRows.join("\n");
}

function downloadFile(filename: string, content: string, mimeType: string) {
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 100);
    return true;
  } catch (error) {
    console.error("Download failed:", error);
    return false;
  }
}

async function exportToExcel(data: Record<string, unknown>[], filename: string) {
  try {
    const XLSX = await import("xlsx");
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(workbook, filename);
    return true;
  } catch (error) {
    console.error("Excel export failed:", error);
    return false;
  }
}

type ExportDropdownProps = {
  data: Record<string, unknown>[];
  filenamePrefix?: string;
};


const ExportDropdown = ({ data, filenamePrefix = "export" }: ExportDropdownProps) => {
  const [exportOpen, setExportOpen] = useState(false);
  const dispatch = useAppDispatch();

  const handleExport = async (type: "csv" | "excel") => {
    setExportOpen(false);
    dispatch(showToast({ message: "Preparing export...", type: "success" }));

    if (!data?.length) {
      dispatch(showToast({ message: "No data to export", type: "error" }));
      return;
    }

    try {
      let success = false;
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:T]/g, "");
      if (type === "csv") {
        const csv = convertToCSV(data);
        success = downloadFile(`${filenamePrefix}_${timestamp}.csv`, csv, "text/csv;charset=utf-8;");
      } else {
        success = await exportToExcel(data, `${filenamePrefix}_${timestamp}.xlsx`);
      }
      if (success) {
        dispatch(showToast({ message: `Export ${type.toUpperCase()} successful`, type: "success" }));
      } else {
        dispatch(showToast({ message: `Export ${type.toUpperCase()} failed`, type: "error" }));
      }
    } catch (error) {
      console.error("Export error:", error);
      dispatch(showToast({
        message: "Export failed. Please try again or contact support.",
        type: "error",
      }));
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setExportOpen((v) => !v)}
        style={{
          backgroundColor: '#3b82f6',
          color: '#fff',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 500,
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          transition: 'all 0.2s ease',
          minWidth: '120px',
          justifyContent: 'center',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
          <path d="M12 15V3M12 15L8 11M12 15L16 11M21 15V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Export
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginLeft: '8px' }}>
          <path d="M6 9l6 6 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {exportOpen && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9,
            }}
            onClick={() => setExportOpen(false)}
          />
          <div
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              minWidth: '180px',
              zIndex: 10,
              marginTop: '8px',
              overflow: 'hidden',
            }}
          >
            <button
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'none',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#4a5568',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
              }}
              onClick={() => handleExport('excel')}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f7fafc')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#fff')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 3v18m6-18v18M3 6h18M3 6v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z" stroke="#48bb78" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Export as Excel
            </button>
            <button
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'none',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#4a5568',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
              }}
              onClick={() => handleExport('csv')}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f7fafc')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#fff')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="#4299e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="#4299e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Export as CSV
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ExportDropdown;