// "use client";

// import React, { useState } from 'react';
// import { Column } from '../Datatables';
// import Modal from './Modal';

// interface ColumnCustomizationProps {
//   columns: Column[];
//   onSave: (newColumns: Column[]) => void;
//   onClose: () => void;
// }

// const ColumnCustomization: React.FC<ColumnCustomizationProps> = ({ columns, onSave, onClose }) => {
//   const [visibleMap, setVisibleMap] = useState<Record<string, boolean>>(
//     columns.reduce((acc, col) => {
//       acc[col.accessor] = col.visible !== false; // Use existing visible property if present
//       return acc;
//     }, {} as Record<string, boolean>)
//   );

//   const toggleColumn = (accessor: string) => {
//     setVisibleMap(prev => ({ ...prev, [accessor]: !prev[accessor] }));
//   };

//   const handleSave = () => {
//     // Instead of filtering, update the visible property for each column
//     const newColumns = columns.map(col => ({ ...col, visible: visibleMap[col.accessor] }));
//     onSave(newColumns);
//     onClose();
//   };

//   return (
//     <Modal onClose={onClose}>
//       <div>
//         <h2 className="text-base font-bold mb-2">Customize Col</h2>
//         <div className="flex flex-col gap-1">
//           {columns.map(col => (
//             <label key={col.accessor} className="text-xs">
//               <input
//                 type="checkbox"
//                 checked={visibleMap[col.accessor]}
//                 onChange={() => toggleColumn(col.accessor)}
//                 className="mr-1"
//               />
//               {col.Header}
//             </label>
//           ))}
//         </div>
//         <div className="flex justify-end mt-2">
//           <button onClick={handleSave} className="px-2 py-1 text-xs border rounded shadow-sm hover:bg-gray-100">
//             Save
//           </button>
//         </div>
//       </div>
//     </Modal>
//   );
// };

// export default ColumnCustomization;
