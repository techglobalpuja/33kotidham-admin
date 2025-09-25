'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import EditText from '@/components/ui/EditText';

const BlogManagement: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'add'>('all');

  // Mock blog data
  const mockBlogs = [
    {
      id: '1',
      title: 'The Power of Mantras in Daily Life',
      excerpt: 'Discover how chanting mantras can transform your daily routine and bring positive energy.',
      author: 'Admin',
      category: 'Spiritual',
      views: 1250,
      status: 'Active',
      createdDate: '2024-01-15'
    },
    {
      id: '2',
      title: 'Astrological Remedies for Career Growth',
      excerpt: 'Learn about effective astrological remedies to boost your career prospects.',
      author: 'Admin',
      category: 'Astrology',
      views: 980,
      status: 'Active',
      createdDate: '2024-01-10'
    },
    {
      id: '3',
      title: 'Benefits of Regular Puja Practices',
      excerpt: 'Understanding the spiritual and psychological benefits of maintaining regular puja practices.',
      author: 'Admin',
      category: 'Puja',
      views: 1520,
      status: 'Inactive',
      createdDate: '2024-01-05'
    }
  ];

  // Category badge styling
  const getCategoryBadgeClass = (category: string) => {
    switch (category.toLowerCase()) {
      case 'spiritual':
        return 'bg-purple-100 text-purple-800';
      case 'astrology':
        return 'bg-yellow-100 text-yellow-800';
      case 'puja':
        return 'bg-orange-100 text-orange-800';
      case 'remedies':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Status badge styling
  const getStatusBadgeClass = (status: string) => {
    return status === 'Active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

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
          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex space-x-2">
              <EditText
                placeholder="Search blogs..."
                className="w-48"
              />
              <Button variant="outline" size="sm">
                Filter
              </Button>
            </div>
          </div>

          {/* Blogs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockBlogs.map((blog) => (
              <div key={blog.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-200 flex items-center justify-center">
                  <span className="text-4xl">📝</span>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{blog.title}</h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{blog.excerpt}</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(blog.status)}`}>
                      {blog.status}
                    </span>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">By {blog.author}</p>
                      <p className="text-xs text-gray-500">{blog.createdDate}</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryBadgeClass(blog.category)}`}>
                      {blog.category}
                    </span>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-gray-500">{blog.views} views</span>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="danger" size="sm">
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Add New Blog</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <EditText
                label="Blog Title"
                placeholder="Enter blog title"
                fullWidth
              />
            </div>
            <div>
              <EditText
                label="Author"
                placeholder="Enter author name"
                fullWidth
              />
            </div>
          </div>
          
          <div className="mb-6">
            <EditText
              label="Excerpt"
              placeholder="Enter a short excerpt for the blog post"
              fullWidth
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#111111] mb-1 sm:mb-2">
              Content
            </label>
            <textarea
              placeholder="Enter the full blog content"
              className="w-full transition-all duration-200 ease-in-out border border-[#5c4228] rounded-[20px] bg-[#fff3ee] text-[#111111] placeholder:text-[#6d6d6d] focus:outline-none focus:ring-2 focus:ring-[#f37335] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base px-4 py-3 sm:py-4"
              rows={8}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-[#111111] mb-1 sm:mb-2">
                Category
              </label>
              <select className="w-full transition-all duration-200 ease-in-out border border-[#5c4228] rounded-[30px] bg-[#fff3ee] text-[#111111] placeholder:text-[#6d6d6d] focus:outline-none focus:ring-2 focus:ring-[#f37335] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base px-4 py-3 sm:py-4">
                <option value="spiritual">Spiritual</option>
                <option value="astrology">Astrology</option>
                <option value="puja">Puja</option>
                <option value="remedies">Remedies</option>
              </select>
            </div>
            <div>
              <EditText
                label="Tags (comma separated)"
                placeholder="Enter tags separated by commas"
                fullWidth
              />
            </div>
          </div>
          
          <div className="flex items-center mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-[#f37335] focus:ring-[#f37335]"
              />
              <span className="ml-2 text-sm text-gray-600">Publish Blog</span>
            </label>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button variant="outline">Cancel</Button>
            <Button variant="primary">Publish Blog</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogManagement;