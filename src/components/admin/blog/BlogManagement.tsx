'use client';

import React, { useState } from 'react';
import BlogList from './components/BlogList';
import CreateBlogForm from './components/CreateBlogForm';

const BlogManagement = () => {
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'add'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg border border-blue-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveSubTab('all')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeSubTab === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <span>📋</span>
                <span>All Blogs</span>
              </span>
            </button>
            <button
              onClick={() => setActiveSubTab('add')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeSubTab === 'add'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <span>➕</span>
                <span>Add New Blog</span>
              </span>
            </button>
          </nav>
        </div>

        {/* All Blogs Section */}
        {activeSubTab === 'all' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900  ">All Blogs</h2>
                <p className="text-sm text-gray-600 mt-1">Manage your blog posts and content</p>
              </div>
              <div className="flex gap-3">
                <button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm">
                  Export List
                </button>
                <button 
                  onClick={() => setActiveSubTab('add')}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm"
                >
                  Add New Blog
                </button>
              </div>
            </div>

            {/* View Mode Toggle Buttons */}
            <div className="flex bg-white border border-gray-300 rounded-lg overflow-hidden mb-6 self-start">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 text-sm font-medium transition-colors duration-200 flex items-center gap-2 ${
                  viewMode === 'grid'
                    ? 'bg-blue-500 text-white'
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
                    ? 'bg-blue-500 text-white'
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

            <BlogList viewMode={viewMode} />
          </div>
        )}

        {/* Add New Blog Section */}
        {activeSubTab === 'add' && (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900  ">Create New Blog</h2>
              <p className="text-sm text-gray-600 mt-1">Create engaging blog content for your audience</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <CreateBlogForm 
                onSuccess={() => {
                  setActiveSubTab('all');
                }} 
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogManagement;