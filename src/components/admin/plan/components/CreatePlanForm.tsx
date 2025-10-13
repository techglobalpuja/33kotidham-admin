'use client';

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createPlan, uploadPlanImage } from '@/store/slices/planSlice';
import { AppDispatch } from '@/store';
import { Form, Input, Button, Typography } from 'antd';
import { useDropzone } from 'react-dropzone';

const { Text } = Typography;

interface PlanFormData {
  name: string;
  description: string;
  image: File | null;
  actual_price: string;
  discounted_price: string;
}

interface CreatePlanFormProps {
  onSuccess?: () => void;
}

const CreatePlanForm: React.FC<CreatePlanFormProps> = ({ onSuccess }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [form] = Form.useForm();
  const [formData, setFormData] = useState<PlanFormData>({
    name: '',
    description: '',
    image: null,
    actual_price: '',
    discounted_price: '',
  });

  // Dropzone for Plan Image
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
        const file = acceptedFiles[0];
        handleInputChange('image', file);
      }
    },
  });

  const handleInputChange = (field: keyof PlanFormData, value: any) => {
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
      if (!formData.name?.trim()) {
        console.error('Plan name is required');
        return;
      }
      
      if (!formData.description?.trim()) {
        console.error('Description is required');
        return;
      }
      
      if (!formData.actual_price?.trim()) {
        console.error('Actual price is required');
        return;
      }

      let imageUrl = '';
      
      // Upload image if selected
      if (formData.image) {
        console.log('Uploading plan image...');
        const uploadResult = await dispatch(uploadPlanImage(formData.image));
        
        if (uploadPlanImage.fulfilled.match(uploadResult)) {
          imageUrl = uploadResult.payload;
          console.log('Image uploaded successfully:', imageUrl);
        } else {
          console.error('Image upload failed:', uploadResult.payload);
          return;
        }
      }

      // Create the plan
      const requestData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        image_url: imageUrl,
        actual_price: formData.actual_price.trim(),
        discounted_price: formData.discounted_price?.trim() || '0',
      } as any;
      
      console.log('Creating plan with data:', requestData);
      const createResult = await dispatch(createPlan(requestData));
      
      if (createPlan.fulfilled.match(createResult)) {
        console.log('Plan created successfully:', createResult.payload);
        onSuccess?.();
      } else {
        console.error('Plan creation failed:', createResult.payload);
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
    }
  };

  return (
    <Form form={form} onFinish={handleSubmit} layout="vertical" className="space-y-8">
      {/* Section 1: Plan Details */}
      <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
        <h3 className="text-lg font-semibold text-purple-800 mb-4 font-['Philosopher'] flex items-center gap-2">
          <span className="text-2xl">📋</span>
          1. Plan Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Form.Item
            name="name"
            label={<span className="block text-sm font-medium text-gray-700 mb-2">Plan Name</span>}
            required={true}
          >
            <Input
              value={formData.name ?? ''}
              onChange={(e) => handleInputChange('name', e.target.value ?? '')}
              placeholder="Enter plan name"
              className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black placeholder-gray-400"
            />
          </Form.Item>

          <Form.Item
            name="actual_price"
            label={<span className="block text-sm font-medium text-gray-700 mb-2">Actual Price (₹)</span>}
            required={true}
          >
            <Input
              type="number"
              value={formData.actual_price ?? ''}
              onChange={(e) => handleInputChange('actual_price', e.target.value ?? '')}
              placeholder="Enter actual price"
              className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black placeholder-gray-400"
            />
          </Form.Item>

          <Form.Item
            name="discounted_price"
            label={<span className="block text-sm font-medium text-gray-700 mb-2">Discounted Price (₹)</span>}
          >
            <Input
              type="number"
              value={formData.discounted_price ?? ''}
              onChange={(e) => handleInputChange('discounted_price', e.target.value ?? '')}
              placeholder="Enter discounted price (optional)"
              className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black placeholder-gray-400"
            />
          </Form.Item>
        </div>

        <Form.Item
          name="description"
          label={<span className="block text-sm font-medium text-gray-700 mb-2">Description</span>}
          required={true}
        >
          <Input.TextArea
            value={formData.description ?? ''}
            onChange={(e) => handleInputChange('description', e.target.value ?? '')}
            rows={4}
            placeholder="Enter detailed description about the plan"
            className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black placeholder-gray-400"
          />
        </Form.Item>

        <Form.Item
          name="image"
          label={<span className="block text-sm font-medium text-gray-700 mb-2">Plan Image</span>}
        >
          <div
            {...getRootProps()}
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 border-purple-300 bg-purple-50 hover:bg-purple-100"
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                className="w-8 h-8 mb-2 text-purple-400"
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
              <p className="mb-1 text-sm font-medium text-purple-600">
                {formData.image ? `Selected: ${formData.image.name}` : 'Click or drag to upload image'}
              </p>
              <p className="text-xs text-purple-500">PNG, JPG, JPEG up to 10MB</p>
            </div>
          </div>
          
          {/* Display selected image preview */}
          {formData.image && (
            <div className="mt-4">
              <div className="relative bg-white p-3 rounded-lg border border-purple-200">
                {(() => {
                  let previewUrl = '';
                  try {
                    previewUrl = createImagePreviewUrl(formData.image);
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
                        <div className="flex items-center justify-center w-full h-48 mb-2 bg-purple-50 rounded">
                          <svg className="w-8 h-8 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600 truncate flex-1">{formData.image.name}</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (previewUrl) {
                              revokeImagePreviewUrl(previewUrl);
                            }
                            handleInputChange('image', null);
                          }}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {(formData.image.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </Form.Item>
      </div>

      <Form.Item name="submit">
        <div className="flex gap-4">
          <Button
            type="primary"
            htmlType="submit"
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-medium border-none"
          >
            Create Plan
          </Button>
          <Button
            type="default"
            onClick={() => {
              setFormData({
                name: '',
                description: '',
                image: null,
                actual_price: '',
                discounted_price: '',
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

export default CreatePlanForm;
