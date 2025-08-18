import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex justify-center items-center py-4">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
      <span className="ml-2 text-sm text-gray-600">Loading...</span>
    </div>
  );
};

export default Loader;
