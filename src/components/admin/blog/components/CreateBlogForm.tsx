'use client';

import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, Checkbox, Typography, DatePicker, Upload, message, Modal, Spin } from 'antd';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import dynamic from 'next/dynamic';

// Dynamically import the rich text editor to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';
// Import auth utilities
import { getAuthHeader } from '@/utils/auth';

const { TextArea } = Input;
const { Title } = Typography;
const { Option } = Select;

const CreateBlogForm: React.FC = () => {
  const [form] = Form.useForm();
  const [content, setContent] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [publishTime, setPublishTime] = useState<string | null>(null);
  const [categories, setCategories] = useState<Array<{id: number, name: string, description: string}>>([]);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  
  // Get user from Redux store
  const { user } = useSelector((state: any) => state.auth);

  // Fetch categories from API
  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const authHeader = getAuthHeader();
      if (!authHeader) {
        message.error('Authentication required. Please log in.');
        setCategoriesLoading(false);
        return;
      }
      
      const response = await fetch('https://api.33kotidham.com/api/v1/blogs/categories/', {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': authHeader
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Categories fetched:', data);
        // Assuming the API returns an array of categories
        const categoriesData = Array.isArray(data) ? data : [];
        console.log('Processed categories:', categoriesData);
        // Log each category's ID and type for debugging
        categoriesData.forEach(category => {
          console.log(`Category ID: ${category.id}, Type: ${typeof category.id}, Name: ${category.name}`);
        });
        setCategories(categoriesData);
      } else if (response.status === 401) {
        message.error('Authentication failed. Please log in again.');
      } else {
        console.error('Failed to fetch categories');
        message.error('Failed to load categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      message.error('Error loading categories');
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const handleContentChange = (value: string) => {
    setContent(value);
  };

  const handleThumbnailUpload = (file: File) => {
    // Validate file type and size
    const isImage = file.type.startsWith('image/');
    const isLt10M = file.size / 1024 / 1024 < 10;

    if (!isImage) {
      message.error('You can only upload image files!');
      return false;
    }

    if (!isLt10M) {
      message.error('Image must be smaller than 10MB!');
      return false;
    }

    setThumbnailFile(file);
    return false; // Prevent automatic upload
  };

  // Upload thumbnail to API
  const uploadThumbnail = async (file: File) => {
    try {
      const authHeader = getAuthHeader();
      if (!authHeader) {
        message.error('Authentication required. Please log in.');
        return null;
      }
      
      const formData = new FormData();
      formData.append('file', file);
      
      console.log('Uploading thumbnail with auth header:', authHeader);

      const response = await fetch('https://api.33kotidham.com/api/v1/uploads/blog-thumbnails', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Authorization': authHeader
        },
        body: formData
      });
      
      console.log('Thumbnail upload response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Thumbnail upload successful:', data);
        return data.file_url; // Return the URL of the uploaded file
      } else if (response.status === 401) {
        message.error('Authentication failed. Please log in again.');
        return null;
      } else {
        const errorData = await response.json();
        console.log('Thumbnail upload error:', errorData);
        throw new Error(errorData.detail || 'Failed to upload thumbnail');
      }
    } catch (error: any) {
      console.error('Error uploading thumbnail:', error);
      message.error('Failed to upload thumbnail: ' + (error.message || 'Unknown error'));
      return null;
    }
  };

  const showCategoryModal = () => {
    setIsCategoryModalVisible(true);
  };

  const handleCategoryModalOk = async () => {
    if (!newCategory.name.trim()) {
      message.error('Category name is required');
      return;
    }

    try {
      setLoading(true);
      const authHeader = getAuthHeader();
      if (!authHeader) {
        message.error('Authentication required. Please log in.');
        setLoading(false);
        return;
      }
      
      const response = await fetch('https://api.33kotidham.com/api/v1/blogs/categories/', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newCategory.name,
          description: newCategory.description || '',
          is_active: true
        })
      });

      if (response.ok) {
        const createdCategory = await response.json();
        console.log('Created category:', createdCategory);
        setCategories([...categories, createdCategory]);
        message.success('Category created successfully!');
        setNewCategory({ name: '', description: '' });
        setIsCategoryModalVisible(false);
        // Don't fetch categories again, just add the new one to the existing list
      } else if (response.status === 401) {
        message.error('Authentication failed. Please log in again.');
      } else {
        const errorData = await response.json();
        message.error(errorData.detail || 'Failed to create category');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      message.error('Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryModalCancel = () => {
    setIsCategoryModalVisible(false);
    setNewCategory({ name: '', description: '' });
  };

  const handleSubmit = async (values: any) => {
    console.log('=== FORM SUBMISSION DEBUG INFO ===');
    console.log('Form values received:', values);
    console.log('Selected category ID (from values):', values.categoryId);
    console.log('Category ID type (from values):', typeof values.categoryId);
    console.log('All form values:', JSON.stringify(values, null, 2));
    
    // Let's also check the form fields directly
    const categoryIdFromForm = form.getFieldValue('categoryId');
    console.log('Category ID from form.getFieldValue:', categoryIdFromForm);
    console.log('Category ID type from form.getFieldValue:', typeof categoryIdFromForm);
    
    // Check all field values
    const allFields = form.getFieldsValue();
    console.log('All form fields:', allFields);
    
    form.validateFields().then((validatedValues) => {
      console.log('Form validateFields result:', validatedValues);
      console.log('Category from validateFields:', validatedValues.categoryId);
    }).catch((error) => {
      console.log('Form validation error:', error);
    });
    
    console.log('Content state:', content);
    console.log('Publish time state:', publishTime);
    console.log('Thumbnail file:', thumbnailFile);
    console.log('Available categories:', categories);
    console.log('=== END DEBUG INFO ===');
    
    try {
      setLoading(true);
      
      const authHeader = getAuthHeader();
      console.log('Auth header:', authHeader);
      if (!authHeader) {
        message.error('Authentication required. Please log in.');
        setLoading(false);
        return;
      }
      
      // Upload thumbnail if a file is selected
      let uploadedThumbnailUrl = null;
      if (thumbnailFile) {
        console.log('Uploading thumbnail file:', thumbnailFile);
        uploadedThumbnailUrl = await uploadThumbnail(thumbnailFile);
        console.log('Uploaded thumbnail URL:', uploadedThumbnailUrl);
        if (!uploadedThumbnailUrl) {
          message.error('Failed to upload thumbnail. Please try again.');
          setLoading(false);
          return;
        }
      }
      
      // Get category ID from form field directly to ensure we have the correct value
      // Convert string back to number since we send it as string in the Select component
      let categoryIdToUse = null;
      
      // Priority order for getting category ID:
      // 1. From form.getFieldValue (most reliable)
      // 2. From values parameter
      // 3. null if none found
      const categoryIdSource = categoryIdFromForm || values.categoryId;
      
      if (categoryIdSource) {
        // Convert to number, handling both string and number inputs
        categoryIdToUse = typeof categoryIdSource === 'string' ? parseInt(categoryIdSource, 10) : categoryIdSource;
        console.log('Using category ID:', categoryIdToUse, 'from source:', typeof categoryIdSource);
        
        // Validate that we have a valid number
        if (isNaN(categoryIdToUse)) {
          console.log('Category ID is NaN after parsing:', categoryIdSource);
          categoryIdToUse = null;
        }
      } else {
        console.log('No category ID found in form data');
      }
      
      console.log('Final category ID to use:', categoryIdToUse);
      console.log('Final category ID type:', typeof categoryIdToUse);
      
      // Prepare the data according to API requirements
      const blogData = {
        title: values.title,
        subtitle: values.subtitle || null,
        content: content,
        thumbnail_image: uploadedThumbnailUrl || null,
        meta_description: values.metaDescription || null,
        tags: values.tags || null,
        category_id: categoryIdToUse,
        is_featured: values.isFeatured || false,
        is_active: values.isActive !== undefined ? values.isActive : true,
        publish_time: publishTime || null,
        slug: values.slug || null
      };
      
      console.log('Sending blog data:', blogData);
      console.log('Category ID in blogData:', blogData.category_id);
      console.log('Category ID type in blogData:', typeof blogData.category_id);

      const response = await fetch('https://api.33kotidham.com/api/v1/blogs/', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(blogData)
      });
      
      console.log('API response status:', response.status);
      console.log('API response headers:', response.headers);

      if (response.ok) {
        const createdBlog = await response.json();
        console.log('Blog created successfully:', createdBlog);
        message.success('Blog created successfully!');
        form.resetFields();
        setContent('');
        setThumbnailFile(null);
        setThumbnailUrl(null);
        setPublishTime(null);
      } else if (response.status === 401) {
        message.error('Authentication failed. Please log in again.');
      } else {
        const errorData = await response.json();
        console.log('API error response:', errorData);
        message.error(errorData.detail || 'Failed to create blog');
      }
    } catch (error: any) {
      console.error('Error creating blog:', error);
      message.error('Failed to create blog: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
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
    <Spin spinning={loading}>
      <Form 
        form={form} 
        onFinish={handleSubmit} 
        layout="vertical" 
        className="space-y-6 bg-white p-6 rounded-xl shadow-sm"
      >
        <Title level={3} className="text-2xl font-bold text-gray-800 border-b pb-4">
          Create New Blog
        </Title>

        {/* Blog Title and Subtitle */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Form.Item
            name="title"
            label={<span className="font-medium text-gray-700">Blog Title</span>}
            rules={[{ required: true, message: 'Please enter a blog title' }]}
          >
            <Input
              placeholder="Enter blog title"
              className="py-3"
            />
          </Form.Item>

          <Form.Item
            name="subtitle"
            label={<span className="font-medium text-gray-700">Subtitle</span>}
          >
            <Input
              placeholder="Enter subtitle (optional)"
              className="py-3"
            />
          </Form.Item>
        </div>

        {/* Thumbnail Upload */}
        <Form.Item
          label={<span className="font-medium text-gray-700">Thumbnail Image</span>}
        >
          <Upload
            beforeUpload={handleThumbnailUpload}
            maxCount={1}
            accept="image/*"
            onRemove={() => {
              setThumbnailFile(null);
              setThumbnailUrl(null);
            }}
          >
            <Button icon={<UploadOutlined />}>Click to Upload</Button>
            <p className="text-xs text-gray-500 mt-2">PNG, JPG, JPEG up to 10MB</p>
          </Upload>
          {thumbnailFile && (
            <div className="mt-2 text-sm text-gray-600">
              Selected: {thumbnailFile.name}
            </div>
          )}
        </Form.Item>

        {/* Blog Content - Rich Text Editor */}
        <Form.Item
          label={<span className="font-medium text-gray-700">Content</span>}
          required
        >
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            {typeof window !== 'undefined' && (
              <ReactQuill
                value={content}
                onChange={handleContentChange}
                modules={modules}
                formats={formats}
                className="h-64"
                placeholder="Write your blog content here..."
              />
            )}
          </div>
        </Form.Item>

        {/* Meta Description */}
        <Form.Item
          name="metaDescription"
          label={<span className="font-medium text-gray-700">Meta Description</span>}
        >
          <TextArea
            rows={3}
            placeholder="Enter meta description for SEO (optional)"
          />
        </Form.Item>

        {/* Tags */}
        <Form.Item
          name="tags"
          label={<span className="font-medium text-gray-700">Tags</span>}
        >
          <Input
            placeholder="Enter tags separated by commas (e.g., spiritual, astrology, remedies)"
          />
        </Form.Item>

        {/* Category and Publish Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Form.Item
            name="categoryId"
            label={<span className="font-medium text-gray-700">Category</span>}
          >
            <div className="flex gap-2">
              <Spin spinning={categoriesLoading}>
                <Select
                  placeholder="Select a category"
                  className="flex-1"
                  showSearch
                  optionFilterProp="children"
                  onChange={(value) => {
                    console.log('Category selected in Select onChange:', value);
                    console.log('Category type in Select onChange:', typeof value);
                    // Also update the form field directly to ensure it's set
                    form.setFieldsValue({ categoryId: value });
                    // Log all available categories for comparison
                    console.log('Available categories:', categories);
                  }}
                  onSelect={(value) => {
                    console.log('Category selected (onSelect):', value);
                    console.log('Category type (onSelect):', typeof value);
                  }}
                >
                  {categories.map(category => (
                    <Option key={category.id} value={category.id.toString()}>
                      {category.name}
                    </Option>
                  ))}
                </Select>
              </Spin>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={showCategoryModal}
              />
            </div>
          </Form.Item>

          <Form.Item
            name="publishTime"
            label={<span className="font-medium text-gray-700">Publish Time</span>}
          >
            <DatePicker
              showTime
              placeholder="Select publish time (optional)"
              onChange={(date, dateString) => setPublishTime(dateString as string)}
              className="w-full"
            />
          </Form.Item>
        </div>

        {/* Slug */}
        <Form.Item
          name="slug"
          label={<span className="font-medium text-gray-700">Slug</span>}
        >
          <Input
            placeholder="Enter custom slug (optional)"
          />
        </Form.Item>

        {/* Checkboxes for featured and active status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Form.Item 
            name="isFeatured" 
            valuePropName="checked"
          >
            <Checkbox>
              <span className="font-medium text-gray-700">Featured Blog</span>
            </Checkbox>
          </Form.Item>

          <Form.Item 
            name="isActive" 
            valuePropName="checked"
            initialValue={true}
          >
            <Checkbox defaultChecked>
              <span className="font-medium text-gray-700">Active</span>
            </Checkbox>
          </Form.Item>
        </div>

        {/* Form Actions */}
        <Form.Item>
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="default" 
              onClick={() => {
                form.resetFields();
                setContent('');
                setThumbnailFile(null);
                setThumbnailUrl(null);
                setPublishTime(null);
              }}
              className="px-6"
            >
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              className="px-6 bg-blue-600 hover:bg-blue-700"
            >
              Publish Blog
            </Button>
          </div>
        </Form.Item>

        {/* Add Category Modal */}
        <Modal
          title="Add New Category"
          visible={isCategoryModalVisible}
          onOk={handleCategoryModalOk}
          onCancel={handleCategoryModalCancel}
          okText="Create Category"
          cancelText="Cancel"
          confirmLoading={loading}
        >
          <Form layout="vertical">
            <Form.Item
              label="Category Name"
              required
            >
              <Input
                value={newCategory.name}
                onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                placeholder="Enter category name"
              />
            </Form.Item>
            <Form.Item
              label="Description"
            >
              <TextArea
                value={newCategory.description}
                onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                placeholder="Enter category description (optional)"
                rows={3}
              />
            </Form.Item>
          </Form>
        </Modal>
      </Form>
    </Spin>
  );
};

export default CreateBlogForm;