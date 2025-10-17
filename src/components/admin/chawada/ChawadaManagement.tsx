'use client';

import React, { useState } from 'react';
import CreateChadawaForm from './components/CreateChadawaForm';
import ChadawaList from './components/ChadawaList';

const ChawadaManagement: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'list' | 'create'>('list');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const handleCreateSuccess = () => {
    // Switch to list view after successful creation
    setActiveSubTab('list');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 font-['Philosopher']">Chadawa Management</h2>
          <p className="text-sm text-gray-600 mt-1">Manage your chadawa offerings and prices</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setActiveSubTab('list')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors duration-200 ${
              activeSubTab === 'list'
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            📋 View All
          </button>
          <button
            onClick={() => setActiveSubTab('create')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors duration-200 ${
              activeSubTab === 'create'
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            ➕ Create New
          </button>
        </div>
      </div>

      {/* View Mode Toggle (only show in list view) */}
      {activeSubTab === 'list' && (
        <div className="flex justify-end">
          <div className="inline-flex rounded-lg border border-gray-300 bg-white p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                viewMode === 'grid'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Grid
              </span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                viewMode === 'table'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                Table
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {activeSubTab === 'list' ? (
          <ChadawaList viewMode={viewMode} />
        ) : (
          <CreateChadawaForm onSuccess={handleCreateSuccess} />
        )}
      </div>
    </div>
  );
};

export default ChawadaManagement;