'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Checkbox, DatePicker } from 'antd';
import { useDispatch } from 'react-redux';
import { updateBlog, uploadBlogThumbnail } from '@/store/slices/blogSlice';
import { AppDispatch } from '@/store';
import { useDropzone } from 'react-dropzone';
import dynamic from 'next/dynamic';
import dayjs from 'dayjs';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

interface Blog {
  id: number;
  title: string;
  subtitle: string;
  content: string;
  thumbnail_image: string;
  meta_description: string;
  tags: string;
  category_id: number;
  is_featured: boolean;
  is_active: boolean;
  publish_time: string;
  slug: string;
}

interface UpdateBlogModalProps {
  isOpen: boolean;
  onClose: () => void;
  blog: Blog | null;
  onSuccess?: () => void;
}

const UpdateBlogModal: React.FC<UpdateBlogModalProps> = ({ isOpen, onClose, blog, onSuccess }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [form] = Form.useForm();
  const [formData, setFormData] = useState<Partial<Blog>>({});
  const [newThumbnail, setNewThumbnail] = useState<File | null>(null);

  useEffect(() => {
    if (blog) {
      setFormData(blog);
      form.setFieldsValue({
        title: blog.title,
        subtitle: blog.subtitle,
        content: blog.content,
        metaDescription: blog.meta_description,
        tags: blog.tags,
        categoryId: blog.category_id,
        isFeatured: blog.is_featured,
        isActive: blog.is_active,
        publishTime: blog.publish_time ? dayjs(blog.publish_time) : null,
        slug: blog.slug,
      });
    }
  }, [blog, form]);

  // Dropzone for Thumbnail
  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': [] },
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0 && acceptedFiles[0]) {
        setNewThumbnail(acceptedFiles[0]);
      }
    },
  });

  const handleInputChange = (field: keyof Blog, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value ?? '',
    }));
  };

  const handleSubmit = async () => {
    try {
      if (!blog) return;

      let thumbnailUrl = blog.thumbnail_image;

      // Upload new thumbnail if selected
      if (newThumbnail) {
        console.log('Uploading new thumbnail...');
        const uploadResult = await dispatch(uploadBlogThumbnail(newThumbnail));

        if (uploadBlogThumbnail.fulfilled.match(uploadResult)) {
          thumbnailUrl = uploadResult.payload;
          console.log('Thumbnail uploaded successfully:', thumbnailUrl);
        } else {
          console.error('Thumbnail upload failed:', uploadResult.payload);
          return;
        }
      }

      const updateData = {
        title: formData.title!,
        subtitle: formData.subtitle || '',
        content: formData.content!,
        thumbnail_image: thumbnailUrl,
        meta_description: formData.meta_description || '',
        tags: formData.tags || '',
        category_id: formData.category_id || 0,
        is_featured: formData.is_featured ?? false,
        is_active: formData.is_active ?? true,
        publish_time: formData.publish_time || new Date().toISOString(),
        slug: formData.slug || '',
      };

      console.log('Updating blog with data:', updateData);
      const result = await dispatch(updateBlog({ id: blog.id, blogData: updateData }));

      if (updateBlog.fulfilled.match(result)) {
        console.log('Blog updated successfully');
        onSuccess?.();
        onClose();
      } else {
        console.error('Blog update failed:', result.payload);
      }
    } catch (error) {
      console.error('Error updating blog:', error);
    }
  };

  // Rich text editor modules configuration
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'link', 'image'
  ];

  return (
    <Modal
      title={<span className="text-xl font-semibold text-gray-800">Update Blog</span>}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={900}
      className="top-8"
    >
      <Form form={form} onFinish={handleSubmit} layout="vertical" className="space-y-6 mt-6">
        {/* Blog Details */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <h4 className="text-md font-semibold text-blue-800 mb-3">Blog Details</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="title"
              label={<span className="text-sm font-medium text-gray-700">Title</span>}
              required
            >
              <Input
                value={formData.title ?? ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter blog title"
                className="w-full px-3 py-2 border border-blue-200 rounded-lg"
              />
            </Form.Item>

            <Form.Item
              name="subtitle"
              label={<span className="text-sm font-medium text-gray-700">Subtitle</span>}
            >
              <Input
                value={formData.subtitle ?? ''}
                onChange={(e) => handleInputChange('subtitle', e.target.value)}
                placeholder="Enter subtitle"
                className="w-full px-3 py-2 border border-blue-200 rounded-lg"
              />
            </Form.Item>
          </div>

          <Form.Item
            name="slug"
            label={<span className="text-sm font-medium text-gray-700">Slug</span>}
          >
            <Input
              value={formData.slug ?? ''}
              onChange={(e) => handleInputChange('slug', e.target.value)}
              placeholder="Enter custom slug"
              className="w-full px-3 py-2 border border-blue-200 rounded-lg"
            />
          </Form.Item>

          <Form.Item
            name="thumbnail"
            label={<span className="text-sm font-medium text-gray-700">Thumbnail Image</span>}
          >
            <div
              {...getRootProps()}
              className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100 border-blue-300"
            >
              <input {...getInputProps()} />
              <p className="text-sm text-blue-600">
                {newThumbnail ? `New: ${newThumbnail.name}` : 'Click to upload new thumbnail (optional)'}
              </p>
            </div>
            {blog?.thumbnail_image && !newThumbnail && (
              <div className="mt-2 text-xs text-gray-500">
                Current: {blog.thumbnail_image}
              </div>
            )}
          </Form.Item>
        </div>

        {/* Content */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
          <h4 className="text-md font-semibold text-green-800 mb-3">Content</h4>
          
          <Form.Item
            name="content"
            label={<span className="text-sm font-medium text-gray-700">Blog Content</span>}
            required
          >
            <div className="border border-green-200 rounded-lg overflow-hidden bg-white">
              {typeof window !== 'undefined' && (
                <ReactQuill
                  value={formData.content ?? ''}
                  onChange={(value) => handleInputChange('content', value)}
                  modules={modules}
                  formats={formats}
                  className="h-48"
                  placeholder="Write your blog content here..."
                />
              )}
            </div>
          </Form.Item>
        </div>

        {/* SEO & Metadata */}
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
          <h4 className="text-md font-semibold text-purple-800 mb-3">SEO & Metadata</h4>
          
          <Form.Item
            name="metaDescription"
            label={<span className="text-sm font-medium text-gray-700">Meta Description</span>}
          >
            <Input.TextArea
              value={formData.meta_description ?? ''}
              onChange={(e) => handleInputChange('meta_description', e.target.value)}
              rows={2}
              placeholder="Enter meta description"
              className="w-full px-3 py-2 border border-purple-200 rounded-lg"
            />
          </Form.Item>

          <Form.Item
            name="tags"
            label={<span className="text-sm font-medium text-gray-700">Tags</span>}
          >
            <Input
              value={formData.tags ?? ''}
              onChange={(e) => handleInputChange('tags', e.target.value)}
              placeholder="Enter tags (comma-separated)"
              className="w-full px-3 py-2 border border-purple-200 rounded-lg"
            />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="categoryId"
              label={<span className="text-sm font-medium text-gray-700">Category ID</span>}
            >
              <Input
                type="number"
                value={formData.category_id?.toString() ?? ''}
                onChange={(e) => handleInputChange('category_id', parseInt(e.target.value) || 0)}
                placeholder="Enter category ID"
                className="w-full px-3 py-2 border border-purple-200 rounded-lg"
              />
            </Form.Item>

            <Form.Item
              name="publishTime"
              label={<span className="text-sm font-medium text-gray-700">Publish Time</span>}
            >
              <DatePicker
                showTime
                value={formData.publish_time ? dayjs(formData.publish_time) : null}
                onChange={(date) => handleInputChange('publish_time', date ? date.toISOString() : null)}
                className="w-full"
              />
            </Form.Item>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
          <h4 className="text-md font-semibold text-gray-800 mb-3">Settings</h4>
          
          <div className="flex items-center gap-6">
            <Form.Item name="isFeatured" valuePropName="checked">
              <Checkbox
                checked={formData.is_featured ?? false}
                onChange={(e) => handleInputChange('is_featured', e.target.checked)}
              >
                Featured
              </Checkbox>
            </Form.Item>

            <Form.Item name="isActive" valuePropName="checked">
              <Checkbox
                checked={formData.is_active ?? true}
                onChange={(e) => handleInputChange('is_active', e.target.checked)}
              >
                Active
              </Checkbox>
            </Form.Item>
          </div>
        </div>

        {/* Form Actions */}
        <Form.Item>
          <div className="flex justify-end gap-3">
            <Button onClick={onClose}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" className="bg-blue-600 hover:bg-blue-700">
              Update Blog
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UpdateBlogModal;
