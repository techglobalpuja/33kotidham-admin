'use client';

import React from 'react';
import PujaProcessList from './components/PujaProcessList';

const PujaProcessManagement: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg border border-orange-100">
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Puja Process Management</h2>
            <p className="text-gray-600 mt-2">Track and update the process status of pujas</p>
          </div>
          <PujaProcessList />
        </div>
      </div>
    </div>
  );
};

export default PujaProcessManagement;