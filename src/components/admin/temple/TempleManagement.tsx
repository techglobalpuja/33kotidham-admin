'use client';

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { fetchTemples } from '@/store/slices/templeSlice';
import TempleList from './components/TempleList';
import CreateTempleForm from './components/CreateTempleForm';

const TempleManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'add'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const handleCreateSuccess = () => {
    setActiveSubTab('all');
    dispatch(fetchTemples({}));
  };

  return (
    <div className="space-y-6">
      {/* Temple Management Sub-tabs */}
      <div className="bg-white rounded-xl shadow-lg border border-orange-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveSubTab('all')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeSubTab === 'all'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <span>🛕</span>
                <span>All Temples</span>
              </span>
            </button>
            <button
              onClick={() => setActiveSubTab('add')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeSubTab === 'add'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <span>➕</span>
                <span>Add New Temple</span>
              </span>
            </button>
          </nav>
        </div>

        {/* All Temples Section */}
        {activeSubTab === 'all' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">All Temples</h2>
                <p className="text-sm text-gray-600 mt-1">Manage your temple listings</p>
              </div>
              <div className="flex gap-3">
                <button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm">
                  Export List
                </button>
                <button 
                  onClick={() => setActiveSubTab('add')}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm"
                >
                  Add New Temple
                </button>
              </div>
            </div>

            {/* View Mode Toggle Buttons */}
            <div className="flex bg-white border border-gray-300 rounded-lg overflow-hidden mb-6 self-start">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 text-sm font-medium transition-colors duration-200 flex items-center gap-2 ${
                  viewMode === 'grid'
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title="Grid View"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 text-sm font-medium transition-colors duration-200 flex items-center gap-2 border-l border-gray-300 ${
                  viewMode === 'table'
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title="Table View"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18M8 6h13M8 18h13M3 6h2m0 0v12m0-12v12" />
                </svg>
                <span className="hidden sm:inline">Table</span>
              </button>
            </div>

            <TempleList viewMode={viewMode} />
          </div>
        )}

        {/* Add New Temple Section */}
        {activeSubTab === 'add' && (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Create New Temple</h2>
              <p className="text-sm text-gray-600 mt-1">Add a new temple to your listings</p>
            </div>
            <CreateTempleForm onSuccess={handleCreateSuccess} />
          </div>
        )}
      </div>
    </div>
  );
};

export default TempleManagement;
