'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import BlogList from './components/BlogList';
import CreateBlogForm from './components/CreateBlogForm';

const BlogManagement: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'add'>('all');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Blog Management</h2>
        <div className="flex space-x-3">
          <Button
            variant={activeSubTab === 'all' ? 'primary' : 'outline'}
            onClick={() => setActiveSubTab('all')}
          >
            All Blogs
          </Button>
          <Button
            variant={activeSubTab === 'add' ? 'primary' : 'outline'}
            onClick={() => setActiveSubTab('add')}
          >
            Add New Blog
          </Button>
        </div>
      </div>

      {activeSubTab === 'all' ? (
        <>
          <BlogList />
        </>
      ) : (
        <CreateBlogForm />
      )}
    </div>
  );
};

export default BlogManagement;