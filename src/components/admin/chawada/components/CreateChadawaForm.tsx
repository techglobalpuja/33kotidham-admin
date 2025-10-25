'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createChadawa, uploadChadawaImage } from '@/store/slices/chadawaSlice';
import { AppDispatch } from '@/store';
import { Form, Input, Button, Checkbox, Typography } from 'antd';
import { useDropzone } from 'react-dropzone';

const { Text } = Typography;

interface ChadawaFormData {
  name: string;
  description: string;
  image: File | null;
  price: number;
  requiresNote: boolean;
}

interface CreateChadawaFormProps {
  onSuccess?: () => void;
}

const CreateChadawaForm: React.FC<CreateChadawaFormProps> = ({ onSuccess }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [form] = Form.useForm();
  
  const [formData, setFormData] = useState<ChadawaFormData>({
    name: '',
    description: '',
    image: null,
    price: 0,
    requiresNote: false,
  });

  // Dropzone for Image
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
        handleInputChange('image', acceptedFiles[0]);
      }
    },
  });

  const handleInputChange = (field: keyof ChadawaFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value ?? (field === 'requiresNote' ? false : field === 'price' ? 0 : ''),
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

  // Clean up object URLs when component unmounts or when image changes
  useEffect(() => {
    return () => {
      if (formData.image && formData.image instanceof File) {
        try {
          const url = createImagePreviewUrl(formData.image);
          revokeImagePreviewUrl(url);
        } catch (e) {
          // Ignore errors during cleanup
        }
      }
    };
  }, [formData.image]);

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.name?.trim()) {
        console.error('Chadawa name is required');
        return;
      }
      
      if (!formData.description?.trim()) {
        console.error('Description is required');
        return;
      }
      
      if (!formData.image) {
        console.error('Image is required');
        return;
      }
      
      if (!formData.price || formData.price <= 0) {
        console.error('Valid price is required');
        return;
      }

      // Step 1: Upload image
      let imageUrl = '';
      if (formData.image && formData.image instanceof File) {
        console.log('Uploading image...');
        const uploadResult = await dispatch(uploadChadawaImage(formData.image));
        
        if (uploadChadawaImage.fulfilled.match(uploadResult)) {
          imageUrl = uploadResult.payload;
          console.log('Image uploaded successfully:', imageUrl);
        } else {
          console.error('Image upload failed:', uploadResult.payload);
          return;
        }
      }

      // Step 2: Create the chadawa with the uploaded image URL
      const requestData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        image_url: imageUrl,
        price: formData.price,
        requires_note: formData.requiresNote,
      };
      
      console.log('Creating chadawa with data:', requestData);
      const createResult = await dispatch(createChadawa(requestData));
      
      if (createChadawa.fulfilled.match(createResult)) {
        console.log('Chadawa created successfully:', createResult.payload);
        
        // Reset form
        setFormData({
          name: '',
          description: '',
          image: null,
          price: 0,
          requiresNote: false,
        });
        form.resetFields();
        
        onSuccess?.();
      } else {
        console.error('Chadawa creation failed:', createResult.payload);
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
    }
  };

  return (
    <Form form={form} onFinish={handleSubmit} layout="vertical" className="space-y-8">
      {/* Section 1: Chadawa Details */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
        <h3 className="text-lg font-semibold text-orange-800 mb-4   flex items-center gap-2">
          <span className="text-2xl">🎁</span>
          1. Chadawa Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Form.Item
            name="name"
            label={<span className="block text-sm font-medium text-gray-700 mb-2">Chadawa Name</span>}
            required={true}
          >
            <Input
              value={formData.name ?? ''}
              onChange={(e) => handleInputChange('name', e.target.value ?? '')}
              placeholder="Enter chadawa name"
              className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black placeholder-gray-400"
            />
          </Form.Item>

          <Form.Item
            name="price"
            label={<span className="block text-sm font-medium text-gray-700 mb-2">Price (₹)</span>}
            required={true}
          >
            <Input
              type="number"
              value={(formData.price ?? 0).toString()}
              onChange={(e) => handleInputChange('price', parseFloat(e.target.value ?? '0') || 0)}
              placeholder="Enter price"
              min={0}
              step={0.01}
              className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black placeholder-gray-400"
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
            placeholder="Enter detailed description"
            className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black placeholder-gray-400"
          />
        </Form.Item>

        <Form.Item
          name="image"
          label={<span className="block text-sm font-medium text-gray-700 mb-2">Chadawa Image</span>}
          required={true}
        >
          <div
            {...getRootProps()}
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 border-orange-300 bg-orange-50 hover:bg-orange-100"
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                className="w-8 h-8 mb-2 text-orange-400"
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
              <p className="mb-1 text-sm font-medium text-orange-600">
                {formData.image ? `Selected: ${formData.image.name}` : 'Click or drag to upload image'}
              </p>
              <p className="text-xs text-orange-500">PNG, JPG, JPEG up to 10MB</p>
            </div>
          </div>
          
          {/* Display selected image preview */}
          {formData.image && (
            <div className="mt-4">
              <div className="relative bg-white p-3 rounded-lg border border-orange-200">
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
                              if (e.currentTarget.nextElementSibling) {
                                (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                              }
                            }}
                          />
                          <div 
                            className="absolute inset-0 bg-gray-900 bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100 cursor-pointer"
                            onClick={() => {
                              revokeImagePreviewUrl(previewUrl);
                              handleInputChange('image', null);
                            }}
                          >
                            <span className="text-white text-lg font-bold">✕ Remove</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center w-full h-48 mb-2 bg-orange-50 rounded">
                          <svg className="w-12 h-12 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 truncate flex-1">{formData.image.name}</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (previewUrl) {
                              revokeImagePreviewUrl(previewUrl);
                            }
                            handleInputChange('image', null);
                          }}
                          className="text-red-500 hover:text-red-700 text-sm font-medium"
                        >
                          ✕ Remove
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

        <Form.Item name="requiresNote" valuePropName="checked">
          <Checkbox
            checked={formData.requiresNote ?? false}
            onChange={(e) => handleInputChange('requiresNote', e.target.checked ?? false)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700"
          >
            Requires Note from User
          </Checkbox>
          <Text className="text-xs text-gray-500 mt-1 block ml-6">
            Enable this if users need to provide additional notes when selecting this chadawa
          </Text>
        </Form.Item>
      </div>

      {/* Form Actions */}
      <Form.Item name="submit">
        <div className="flex gap-4">
          <Button
            type="primary"
            htmlType="submit"
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-3 rounded-lg font-medium border-none"
          >
            Create Chadawa
          </Button>
          <Button
            type="default"
            onClick={() => {
              setFormData({
                name: '',
                description: '',
                image: null,
                price: 0,
                requiresNote: false,
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

export default CreateChadawaForm;
