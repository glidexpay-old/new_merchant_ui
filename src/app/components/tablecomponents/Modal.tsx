import React from 'react';

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ onClose, children }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>
      <div
        className="absolute inset-0 bg-black/10 transition-opacity duration-200"
        style={{ backdropFilter: 'blur(2px)' }}
        onClick={onClose}
      ></div>
      <div
        className="bg-white p-3 rounded-xl shadow-xl z-10 w-[25vw] max-w-md mx-2 border border-gray-200 max-h-[90vh] flex flex-col"
        style={{ fontFamily: 'Inter, Segoe UI, Arial, sans-serif', fontWeight: 500 }}
      >
        <div className="flex justify-end mb-2 shrink-0">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-zinc-700 text-2xl font-bold px-2 transition-colors"
            style={{ fontFamily: 'inherit', outline: 0 }}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        <div className="overflow-y-auto grow">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
