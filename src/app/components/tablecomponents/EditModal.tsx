"use client";
import React from 'react';

// Type for row data (replace with your actual row type if available)
type RowData = { [key: string]: string | number | undefined };

interface EditModalProps
{
  isOpen: boolean;
  onClose: () => void;
  columns: { accessor: string; Header: string; type?: string }[];
  rowData: RowData;
  onSave: (updated: RowData) => void;
}

const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, columns, rowData, onSave }) =>
{
  const [form, setForm] = React.useState<RowData>(rowData);
  const modalRef = React.useRef<HTMLDivElement>(null);

  // Sync form state with rowData when rowData changes
  React.useEffect(() =>
  {
    setForm(rowData);
  }, [rowData]);

  // Close on outside click (ref-based)
  React.useEffect(() =>
  {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) =>
    {
      if (modalRef.current && !modalRef.current.contains(e.target as Node))
      {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
  {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) =>
  {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 font-sans">
      <div
        ref={modalRef}
        id="edit-modal-popup"
        className="relative scrollbar-hide bg-white rounded-xl shadow-2xl w-[25%] max-w-md mx-2 border border-gray-200 animate-fadeIn font-medium flex flex-col"
        style={{ height: '520px', maxHeight: '90vh' }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-zinc-200">
          <h2 className="text-xl font-semibold text-gray-800">Edit Form</h2>
          <button onClick={onClose} className="text-gray-400 cursor-pointer hover:text-zinc-700 text-2xl font-bold px-2 transition-colors" style={{ outline: 0 }} aria-label="Close modal">×</button>
        </div>
        <form onSubmit={handleSubmit} className="text-sm flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            {columns.map(col => (
              <div key={col.accessor} className="mb-3">
                <label className="block text-gray-600 text-xs font-medium mb-1" htmlFor={col.accessor}>{col.Header}</label>
                <input
                  type={col.type === 'date' ? 'date' : col.type || 'text'}
                  id={col.accessor}
                  name={col.accessor}
                  value={form[col.accessor]?.toString() || ''}
                  onChange={handleChange}
                  placeholder={`Enter ${col.Header}`}
                  className="shadow-sm border border-gray-300 rounded w-full py-2 px-2 text-gray-700 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-end pt-3 pb-6 px-6 gap-2 border-t border-gray-100 bg-white">
            <button type="button" onClick={onClose} className="mr-2 px-3 py-1.5 text-xs text-gray-600 border border-gray-300 rounded cursor-pointer hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors cursor-pointer">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModal;
