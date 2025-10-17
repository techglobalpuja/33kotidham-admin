'use client';

import React from 'react';
import { Modal, Descriptions, Tag, Image } from 'antd';
import dayjs from 'dayjs';
import { useCategories } from '@/hooks/useCategories';
import { Blog } from '@/types'; // Import Blog interface from types

interface ViewBlogModalProps {
  isOpen: boolean;
  onClose: () => void;
  blog: Blog | null;
}

const ViewBlogModal: React.FC<ViewBlogModalProps> = ({ isOpen, onClose, blog }) => {
  const { categories } = useCategories();
  
  if (!blog) return null;

  const tagArray = blog.tags ? blog.tags.split(',').map(tag => tag.trim()) : [];
  
  // Handle different API response formats for categories
  const displayCategoryNames = () => {
    // Check if blog has categories array with full category objects
    if (Array.isArray((blog as any).categories)) {
      return (blog as any).categories.map((category: any) => category.name).join(', ');
    }
    
    // Check if blog has category_ids array and we have categories from Redux
    if (Array.isArray(blog.category_ids) && categories) {
      return blog.category_ids.map(id => {
        const category = categories.find(cat => cat.id === id);
        return category ? category.name : 'Unknown';
      }).join(', ');
    }
    
    return 'N/A';
  };

  return (
    <Modal
      title={<span className="text-xl font-semibold text-gray-800">Blog Details</span>}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={800}
      className="top-8"
    >
      <div className="space-y-6 mt-6">
        {/* Blog Header */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{blog.title}</h1>
          {blog.subtitle && (
            <p className="text-lg text-gray-600 mb-3">{blog.subtitle}</p>
          )}
          <div className="flex items-center gap-3">
            <Tag color={blog.is_active ? 'green' : 'red'}>
              {blog.is_active ? 'Active' : 'Inactive'}
            </Tag>
            {blog.is_featured && (
              <Tag color="gold">Featured</Tag>
            )}
            <span className="text-sm text-gray-500">
              Published: {dayjs(blog.publish_time).format('MMMM D, YYYY h:mm A')}
            </span>
          </div>
        </div>

        {/* Thumbnail */}
        {blog.thumbnail_image && (
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="text-md font-semibold text-gray-800 mb-3">Thumbnail</h4>
            <Image
              src={`https://api.33kotidham.in/${blog.thumbnail_image}`} 
              
              alt={blog.title}
              className="rounded-lg"
              style={{ maxHeight: '300px', objectFit: 'cover' }}
            />
          </div>
        )}

        {/* Content */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
          <h4 className="text-md font-semibold text-green-800 mb-3">Content</h4>
          <div 
            className="prose max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </div>

        {/* SEO & Metadata */}
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
          <h4 className="text-md font-semibold text-purple-800 mb-3">SEO & Metadata</h4>
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Meta Description">
              {blog.meta_description || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Slug">
              {blog.slug || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Tags">
              <div className="flex flex-wrap gap-1">
                {tagArray.length > 0 ? (
                  tagArray.map((tag, index) => (
                    <Tag key={index} color="blue">{tag}</Tag>
                  ))
                ) : (
                  'N/A'
                )}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Categories">
              {displayCategoryNames()}
            </Descriptions.Item>
          </Descriptions>
        </div>

        {/* System Information */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
          <h4 className="text-md font-semibold text-gray-800 mb-3">System Information</h4>
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="Blog ID">
              {blog.id}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={blog.is_active ? 'green' : 'red'}>
                {blog.is_active ? 'Active' : 'Inactive'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Featured">
              <Tag color={blog.is_featured ? 'gold' : 'default'}>
                {blog.is_featured ? 'Yes' : 'No'}
              </Tag>
            </Descriptions.Item>
            {blog.created_at && (
              <Descriptions.Item label="Created At">
                {dayjs(blog.created_at).format('MMMM D, YYYY h:mm A')}
              </Descriptions.Item>
            )}
            {blog.updated_at && (
              <Descriptions.Item label="Updated At">
                {dayjs(blog.updated_at).format('MMMM D, YYYY h:mm A')}
              </Descriptions.Item>
            )}
          </Descriptions>
        </div>
      </div>
    </Modal>
  );
};

export default ViewBlogModal;