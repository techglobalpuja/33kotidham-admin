'use client';

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createBlog, uploadBlogThumbnail } from '@/store/slices/blogSlice';
import { AppDispatch } from '@/store';
import { Form, Input, Button, Checkbox, Typography, DatePicker, Modal, Select, message } from 'antd';
import { useDropzone } from 'react-dropzone';
import dynamic from 'next/dynamic';
import dayjs from 'dayjs';
import { PlusOutlined } from '@ant-design/icons';
import { useCategories } from '@/hooks/useCategories';
import { Category } from '@/types';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

const { Text } = Typography;
const { Option } = Select;

interface BlogFormData {
  title: string;
  subtitle: string;
  content: string;
  thumbnail: File | null;
  metaDescription: string;
  tags: string;
  categoryIds: number[]; // Changed from categoryId to categoryIds
  isFeatured: boolean;
  isActive: boolean;
  publishTime: string | null;
  slug: string;
}

interface CreateBlogFormProps {
  onSuccess?: () => void;
}

const CreateBlogForm: React.FC<CreateBlogFormProps> = ({ onSuccess }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [form] = Form.useForm();
  const { categories, isLoading: categoriesLoading, createNewCategory, refetchCategories } = useCategories();
  const [isCreateCategoryModalVisible, setIsCreateCategoryModalVisible] = useState(false);
  const [newCategoryForm] = Form.useForm();
  
  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    subtitle: '',
    content: '',
    thumbnail: null,
    metaDescription: '',
    tags: '',
    categoryIds: [], // Changed from categoryId to categoryIds
    isFeatured: false,
    isActive: true,
    publishTime: null,
    slug: '',
  });

  // Dropzone for Thumbnail
  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': [] },
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB
    onDrop: (acceptedFiles, rejectedFiles) => {
      // Handle rejected files
      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach(({ file, errors }) => {
          errors.forEach(error => {
            if (error.code === 'file-too-large') {
              console.error(`File ${file.name} is too large. Maximum size is 10MB.`);
            } else if (error.code === 'file-invalid-type') {
              console.error(`File ${file.name} has invalid type. Only images are allowed.`);
            }
          });
        });
      }
      
      // Handle accepted files
      if (acceptedFiles.length > 0 && acceptedFiles[0]) {
        handleInputChange('thumbnail', acceptedFiles[0]);
      }
    },
  });

  const handleInputChange = (field: keyof BlogFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value ?? '',
    }));
  };

  // Function to create object URL for image preview
  const createImagePreviewUrl = (file: File): string => {
    return URL.createObjectURL(file);
  };

  // Function to revoke object URL to prevent memory leaks
  const revokeImagePreviewUrl = (url: string): void => {
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.title?.trim()) {
        console.error('Blog title is required');
        return;
      }
      
      if (!formData.content?.trim()) {
        console.error('Blog content is required');
        return;
      }

      let thumbnailUrl = '';
      
      // Upload thumbnail if selected
      if (formData.thumbnail) {
        console.log('Uploading blog thumbnail...');
        const uploadResult = await dispatch(uploadBlogThumbnail(formData.thumbnail));
        
        if (uploadBlogThumbnail.fulfilled.match(uploadResult)) {
          thumbnailUrl = uploadResult.payload;
          console.log('Thumbnail uploaded successfully:', thumbnailUrl);
        } else {
          console.error('Thumbnail upload failed:', uploadResult.payload);
          return;
        }
      }

      // Create the blog
      const requestData = {
        title: formData.title.trim(),
        subtitle: formData.subtitle?.trim() || '',
        content: formData.content.trim(),
        thumbnail_image: thumbnailUrl,
        meta_description: formData.metaDescription?.trim() || '',
        tags: formData.tags?.trim() || '',
        category_ids: formData.categoryIds, // Changed from category_id to category_ids
        is_featured: formData.isFeatured ?? false,
        is_active: formData.isActive ?? true,
        publish_time: formData.publishTime || new Date().toISOString(),
        slug: formData.slug?.trim() || '',
      } as any;
      
      console.log('Creating blog with data:', requestData);
      const createResult = await dispatch(createBlog(requestData));
      
      if (createBlog.fulfilled.match(createResult)) {
        console.log('Blog created successfully:', createResult.payload);
        
        // Reset form
        setFormData({
          title: '',
          subtitle: '',
          content: '',
          thumbnail: null,
          metaDescription: '',
          tags: '',
          categoryIds: [], // Changed from categoryId to categoryIds
          isFeatured: false,
          isActive: true,
          publishTime: null,
          slug: '',
        });
        form.resetFields();
        
        onSuccess?.();
      } else {
        console.error('Blog creation failed:', createResult.payload);
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
    }
  };

  // Enhanced rich text editor modules configuration with more Word-like functionality
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean'],
      ['undo', 'redo']
    ],
    clipboard: {
      matchVisual: true,
    },
    history: {
      delay: 1000,
      maxStack: 500,
      userOnly: false
    }
  };

  const formats = [
    'header',
    'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'blockquote', 'code-block',
    'list', 'bullet', 'indent',
    'align', 'line-height',
    'link', 'image', 'video',
    'color', 'background',
    'clean'
  ];

  // Handle creating a new category
  const handleCreateCategory = async (values: any) => {
    try {
      const newCategoryData: Omit<Category, 'id' | 'created_at' | 'updated_at'> = {
        name: values.name,
        description: values.description || '',
        is_active: true,
      };
      
      await createNewCategory(newCategoryData);
      message.success('Category created successfully');
      setIsCreateCategoryModalVisible(false);
      newCategoryForm.resetFields();
      // Refresh categories
      refetchCategories();
    } catch (error) {
      message.error('Failed to create category');
      console.error('Error creating category:', error);
    }
  };

  return (
    <Form form={form} onFinish={handleSubmit} layout="vertical" className="space-y-8">
      {/* Create Category Modal */}
      <Modal
        title="Create New Category"
        open={isCreateCategoryModalVisible}
        onCancel={() => setIsCreateCategoryModalVisible(false)}
        footer={null}
      >
        <Form
          form={newCategoryForm}
          onFinish={handleCreateCategory}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Category Name"
            rules={[{ required: true, message: 'Please enter category name' }]}
          >
            <Input placeholder="Enter category name" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea placeholder="Enter category description (optional)" rows={3} />
          </Form.Item>
          
          <Form.Item>
            <div className="flex justify-end gap-2">
              <Button onClick={() => setIsCreateCategoryModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Create Category
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
      
      {/* Section 1: Blog Details */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-4 font-['Philosopher'] flex items-center gap-2">
          <span className="text-2xl">📝</span>
          1. Blog Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Form.Item
            name="title"
            label={<span className="block text-sm font-medium text-gray-700 mb-2">Blog Title</span>}
            required={true}
          >
            <Input
              value={formData.title ?? ''}
              onChange={(e) => handleInputChange('title', e.target.value ?? '')}
              placeholder="Enter blog title"
              className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-gray-400"
            />
          </Form.Item>

          <Form.Item
            name="subtitle"
            label={<span className="block text-sm font-medium text-gray-700 mb-2">Subtitle</span>}
          >
            <Input
              value={formData.subtitle ?? ''}
              onChange={(e) => handleInputChange('subtitle', e.target.value ?? '')}
              placeholder="Enter subtitle (optional)"
              className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-gray-400"
            />
          </Form.Item>
        </div>

        <Form.Item
          name="slug"
          label={<span className="block text-sm font-medium text-gray-700 mb-2">Slug</span>}
        >
          <Input
            value={formData.slug ?? ''}
            onChange={(e) => handleInputChange('slug', e.target.value ?? '')}
            placeholder="Enter custom slug (optional)"
            className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-gray-400"
          />
        </Form.Item>

        <Form.Item
          name="thumbnail"
          label={<span className="block text-sm font-medium text-gray-700 mb-2">Thumbnail Image</span>}
        >
          <div
            {...getRootProps()}
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 border-blue-300 bg-blue-50 hover:bg-blue-100"
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                className="w-8 h-8 mb-2 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="mb-1 text-sm font-medium text-blue-600">
                {formData.thumbnail ? `Selected: ${formData.thumbnail.name}` : 'Click or drag to upload thumbnail image'}
              </p>
              <p className="text-xs text-blue-500">PNG, JPG, JPEG up to 10MB</p>
            </div>
          </div>
          
          {/* Display selected thumbnail preview */}
          {formData.thumbnail && (
            <div className="mt-4">
              <div className="relative bg-white p-3 rounded-lg border border-blue-200">
                {(() => {
                  let previewUrl = '';
                  try {
                    previewUrl = createImagePreviewUrl(formData.thumbnail);
                  } catch (e) {
                    // If we can't create a preview, we'll show the file icon
                  }
                  
                  return (
                    <>
                      {previewUrl ? (
                        <div className="relative w-full h-48 mb-2 rounded overflow-hidden">
                          <img 
                            src={previewUrl} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              revokeImagePreviewUrl(previewUrl);
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center w-full h-48 mb-2 bg-blue-50 rounded">
                          <svg className="w-8 h-8 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600 truncate flex-1">{formData.thumbnail.name}</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (previewUrl) {
                              revokeImagePreviewUrl(previewUrl);
                            }
                            handleInputChange('thumbnail', null);
                          }}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {(formData.thumbnail.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </Form.Item>
      </div>

      {/* Section 2: Content */}
      <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
        <h3 className="text-lg font-semibold text-green-800 mb-4 font-['Philosopher'] flex items-center gap-2">
          <span className="text-2xl">✍️</span>
          2. Content
        </h3>

        <Form.Item
          name="content"
          label={<span className="block text-sm font-medium text-gray-700 mb-2">Blog Content</span>}
          required={true}
        >
          <div className="border border-green-200 rounded-lg overflow-hidden bg-white">
            {typeof window !== 'undefined' && (
              <ReactQuill
                value={formData.content}
                onChange={(value) => handleInputChange('content', value)}
                modules={modules}
                formats={formats}
                className="blog-editor"
                placeholder="Write your blog content here... Start typing to begin..."
              />
            )}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Tip: The editor expands automatically as you add more content. Use the toolbar for formatting options.
          </div>
        </Form.Item>
      </div>

      {/* Section 3: SEO & Metadata */}
      <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
        <h3 className="text-lg font-semibold text-purple-800 mb-4 font-['Philosopher'] flex items-center gap-2">
          <span className="text-2xl">🔍</span>
          3. SEO & Metadata
        </h3>

        <Form.Item
          name="metaDescription"
          label={<span className="block text-sm font-medium text-gray-700 mb-2">Meta Description</span>}
        >
          <Input.TextArea
            value={formData.metaDescription ?? ''}
            onChange={(e) => handleInputChange('metaDescription', e.target.value ?? '')}
            rows={3}
            placeholder="Enter meta description for SEO (optional)"
            className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black placeholder-gray-400"
          />
        </Form.Item>

        <Form.Item
          name="tags"
          label={<span className="block text-sm font-medium text-gray-700 mb-2">Tags</span>}
        >
          <Input
            value={formData.tags ?? ''}
            onChange={(e) => handleInputChange('tags', e.target.value ?? '')}
            placeholder="Enter tags separated by commas (e.g., spiritual, astrology, remedies)"
            className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black placeholder-gray-400"
          />
        </Form.Item>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Form.Item
            name="categoryIds"
            label={<span className="block text-sm font-medium text-gray-700 mb-2">Categories</span>}
          >
            <div className="flex gap-2">
              <Select
                mode="multiple"
                value={formData.categoryIds}
                onChange={(value) => handleInputChange('categoryIds', value)}
                loading={categoriesLoading}
                placeholder="Select categories"
                className="flex-1"
                showSearch
                optionFilterProp="children"
              >
                {categories?.map((category) => (
                  <Option key={category.id} value={category.id}>
                    {category.name}
                  </Option>
                ))}
              </Select>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={() => setIsCreateCategoryModalVisible(true)}
              />
            </div>
          </Form.Item>

          <Form.Item
            name="publishTime"
            label={<span className="block text-sm font-medium text-gray-700 mb-2">Publish Time</span>}
          >
            <DatePicker
              showTime
              value={formData.publishTime ? dayjs(formData.publishTime) : null}
              onChange={(date) => handleInputChange('publishTime', date ? date.toISOString() : null)}
              placeholder="Select publish time (optional)"
              className="w-full"
            />
          </Form.Item>
        </div>
      </div>

      {/* Section 4: Settings */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 font-['Philosopher'] flex items-center gap-2">
          <span className="text-2xl">⚙️</span>
          4. Settings
        </h3>

        <div className="flex items-center gap-6">
          <Form.Item name="isFeatured" valuePropName="checked">
            <Checkbox
              checked={formData.isFeatured ?? false}
              onChange={(e) => handleInputChange('isFeatured', e.target.checked ?? false)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700"
            >
              Featured Blog
            </Checkbox>
          </Form.Item>

          <Form.Item name="isActive" valuePropName="checked">
            <Checkbox
              checked={formData.isActive ?? true}
              onChange={(e) => handleInputChange('isActive', e.target.checked ?? true)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700"
            >
              Active
            </Checkbox>
          </Form.Item>
        </div>
      </div>

      {/* Form Actions */}
      <Form.Item name="submit">
        <div className="flex gap-4">
          <Button
            type="primary"
            htmlType="submit"
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-medium border-none"
          >
            Create Blog
          </Button>
          <Button
            type="default"
            onClick={() => {
              setFormData({
                title: '',
                subtitle: '',
                content: '',
                thumbnail: null,
                metaDescription: '',
                tags: '',
                categoryIds: [], // Changed from categoryId to categoryIds
                isFeatured: false,
                isActive: true,
                publishTime: null,
                slug: '',
              });
              form.resetFields();
            }}
            className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-medium border-none"
          >
            Reset
          </Button>
        </div>
      </Form.Item>
    </Form>
  );
};

export default CreateBlogForm;