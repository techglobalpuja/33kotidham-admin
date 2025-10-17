'use client';

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { fetchPujas } from '@/store/slices/pujaSlice';
import Button from '@/components/ui/Button';
import PujaList from './components/PujaList';
import PujaForm from './components/CreatePujaForm';

const PujaManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'add'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const handleCreateSuccess = () => {
    setActiveSubTab('all');
    dispatch(fetchPujas());
  };

  return (
    <div className="space-y-6">
      {/* Puja Management Sub-tabs */}
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
                <span>📋</span>
                <span>All Pujas</span>
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
                <span>Add New Puja</span>
              </span>
            </button>
          </nav>
        </div>

        {/* All Pujas Section */}
        {activeSubTab === 'all' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 font-['Philosopher']">All Pujas</h2>
                <p className="text-sm text-gray-600 mt-1">Manage your existing puja offerings</p>
              </div>
              <div className="flex gap-3">
                <button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm">
                  Export List
                </button>
                <button 
                  onClick={() => setActiveSubTab('add')}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm"
                >
                  Add New Puja
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

            <PujaList viewMode={viewMode} />
          </div>
        )}

        {/* Add New Puja Section */}
        {activeSubTab === 'add' && (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 font-['Philosopher']">Create New Puja</h2>
              <p className="text-sm text-gray-600 mt-1">Complete puja setup with all required details</p>
            </div>
            <PujaForm onSuccess={handleCreateSuccess} />
          </div>
        )}
      </div>
    </div>
  );
};

export default PujaManagement;