'use client';

import React from 'react';
import Button from '@/components/ui/Button';
import EditText from '@/components/ui/EditText';

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

const BlogList: React.FC = () => {
  return (
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
  );
};

export default BlogList;