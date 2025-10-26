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
  
  // Enhanced safety checks
  if (!isOpen || !blog) return null;

  // Safe data extraction with fallbacks
  const safeBlogData = {
    id: blog.id ?? 0,
    title: (blog.title ?? '').toString().trim() || 'Untitled Blog',
    subtitle: (blog.subtitle ?? '').toString().trim(),
    content: (blog.content ?? '').toString().trim(),
    thumbnail_image: (blog.thumbnail_image ?? '').toString().trim(),
    meta_description: (blog.meta_description ?? '').toString().trim(),
    tags: (blog.tags ?? '').toString().trim(),
    slug: (blog.slug ?? '').toString().trim(),
    category_ids: Array.isArray(blog.category_ids) ? blog.category_ids : [],
    is_active: Boolean(blog.is_active ?? false),
    is_featured: Boolean(blog.is_featured ?? false),
    publish_time: (blog.publish_time ?? '').toString().trim(),
    created_at: (blog.created_at ?? '').toString().trim(),
    updated_at: (blog.updated_at ?? '').toString().trim(),
  };

  const tagArray = safeBlogData.tags ? safeBlogData.tags.split(',').map(tag => tag.trim()) : [];
  
  // Handle different API response formats for categories
  const displayCategoryNames = () => {
    try {
      // Check if blog has categories array with full category objects
      if (Array.isArray((blog as any).categories)) {
        return (blog as any).categories
          .map((category: any) => (category?.name ?? '').toString().trim())
          .filter((name: string) => name.length > 0)
          .join(', ');
      }
      
      // Check if blog has category_ids array and we have categories from Redux
      if (Array.isArray(safeBlogData.category_ids) && categories) {
        return safeBlogData.category_ids
          .map(id => {
            const category = categories.find(cat => cat.id === id);
            return category ? category.name : `Unknown (${id})`;
          })
          .filter(name => name && name.length > 0)
          .join(', ');
      }
      
      return 'N/A';
    } catch (error) {
      console.error('Error processing category names:', error);
      return 'Error loading categories';
    }
  };

  // Format date safely
  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'N/A';
      const date = dayjs(dateString);
      return date.isValid() ? date.format('MMMM D, YYYY h:mm A') : 'Invalid Date';
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Error formatting date';
    }
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{safeBlogData.title}</h1>
          {safeBlogData.subtitle && (
            <p className="text-lg text-gray-600 mb-3">{safeBlogData.subtitle}</p>
          )}
          <div className="flex items-center gap-3">
            <Tag color={safeBlogData.is_active ? 'green' : 'red'}>
              {safeBlogData.is_active ? 'Active' : 'Inactive'}
            </Tag>
            {safeBlogData.is_featured && (
              <Tag color="gold">Featured</Tag>
            )}
            <span className="text-sm text-gray-500">
              Published: {formatDate(safeBlogData.publish_time)}
            </span>
          </div>
        </div>

        {/* Thumbnail */}
        {safeBlogData.thumbnail_image && (
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="text-md font-semibold text-gray-800 mb-3">Thumbnail</h4>
            <Image
              src={`https://api.33kotidham.in/${safeBlogData.thumbnail_image}`} 
              alt={safeBlogData.title}
              className="rounded-lg"
              style={{ maxHeight: '300px', objectFit: 'cover' }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                if (e.currentTarget.parentElement) {
                  e.currentTarget.parentElement.innerHTML = '<div class="text-gray-400">Thumbnail not available</div>';
                }
              }}
            />
          </div>
        )}

        {/* Content */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
          <h4 className="text-md font-semibold text-green-800 mb-3">Content</h4>
          <div 
            className="prose max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: safeBlogData.content || 'No content available' }}
          />
        </div>

        {/* SEO & Metadata */}
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
          <h4 className="text-md font-semibold text-purple-800 mb-3">SEO & Metadata</h4>
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Meta Description">
              {safeBlogData.meta_description || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Slug">
              {safeBlogData.slug || 'N/A'}
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
              {safeBlogData.id}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={safeBlogData.is_active ? 'green' : 'red'}>
                {safeBlogData.is_active ? 'Active' : 'Inactive'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Featured">
              <Tag color={safeBlogData.is_featured ? 'gold' : 'default'}>
                {safeBlogData.is_featured ? 'Yes' : 'No'}
              </Tag>
            </Descriptions.Item>
            {safeBlogData.created_at && (
              <Descriptions.Item label="Created At">
                {formatDate(safeBlogData.created_at)}
              </Descriptions.Item>
            )}
            {safeBlogData.updated_at && (
              <Descriptions.Item label="Updated At">
                {formatDate(safeBlogData.updated_at)}
              </Descriptions.Item>
            )}
          </Descriptions>
        </div>
      </div>
    </Modal>
  );
};

export default ViewBlogModal;